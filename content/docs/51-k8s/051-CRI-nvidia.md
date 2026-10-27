---
weight: 51
title: "CRI-nvidia"
---

# NVIDIA Container Runtime

> `nvidia-container-runtime` 是 NVIDIA Container Toolkit 提供的 **OCI 运行时包装层**：它不自己创建容器，而是在把 OCI spec 交给 `runc` 之前，把宿主机的 GPU 设备节点和驱动用户态库「注入」进容器。它解决的是「容器里 `nvidia-smi` / `libcuda.so` 从哪来」的问题，而不是 GPU 的调度与分配。

## 为什么需要它

容器镜像里可以装 CUDA toolkit，但**装不了驱动**：驱动包含与宿主机内核强绑定的内核模块（`nvidia.ko`、`nvidia-uvm` 等），版本必须和宿主机内核匹配。因此 GPU 容器必须在启动时由外部把两部分东西挂进去：

| 需要在容器内可见的东西 | 来源 | 由谁注入 |
| :--- | :--- | :--- |
| `/dev/nvidia0`、`/dev/nvidiactl`、`/dev/nvidia-uvm*`、`/dev/nvidia-caps/*` | 宿主机内核模块创建的设备节点 | `nvidia-container-cli` |
| `libcuda.so.*`、`libnvidia-ml.so.*`、`libcudart` 之外的驱动侧库、`nvidia-smi` | 宿主机已安装的驱动目录 | `nvidia-container-cli` |
| CUDA runtime、cuDNN、PyTorch 等用户态依赖 | 容器镜像本身 | 镜像构建时 |

早期方案 `nvidia-docker` 是包装 `docker run` 的脚本，现已被 toolkit + OCI 运行时的方式完全取代。

## 在运行时分层中的位置

延续 [CRI](./050-CRI.md) 的两层划分，GPU 链路上的角色分工如下：

| 组件 | 所在层 | 职责 |
| :--- | :--- | :--- |
| `nvidia.com/gpu` device plugin | Kubernetes 设备插件 | 向 kubelet 上报节点 GPU 数量、分配设备、做健康检查 |
| containerd / CRI-O / dockerd | 高层运行时 | 接收 CRI/Docker API 请求，按 runtime handler 选择低层运行时 |
| `nvidia-container-runtime` | OCI 运行时包装层 | 改写 OCI spec：注入 prestart hook，或直接注入 CDI 设备 |
| `nvidia-container-runtime-hook` → `nvidia-container-cli` | 配置工具（libnvidia-container） | 按 spec 把设备节点、驱动库、`ldconfig` 配置挂进容器 rootfs |
| `runc` | 低层运行时 | 创建 namespace / cgroup，执行容器进程 |
| NVIDIA 驱动 + 内核模块 | 宿主机内核 | 真正执行 CUDA 指令、管理显存 |

关键点：**device plugin 决定「给哪个 Pod 几块 GPU」，runtime 决定「怎么把 GPU 暴露进容器」**。两者缺一不可，且前者表现为 Pod `Pending`，后者表现为容器启动失败或容器内 `nvidia-smi` 报错，这也是排障的第一个分叉点。

## 工作流程（legacy hook 模式）

1. 容器引擎创建容器，选择 `nvidia` 运行时，把 OCI bundle（`config.json` + rootfs）交给 `nvidia-container-runtime`。
2. 运行时读取 spec，在 `hooks.prestart` 中插入对 `nvidia-container-runtime-hook` 的调用，并把 `NVIDIA_VISIBLE_DEVICES` 等环境变量传递下去。
3. 运行时 exec 真正的 `runc`，由 runc 完成 namespace、cgroup、挂载和 `pivot_root` 等动作。
4. runc 在切换到容器根文件系统**之前**执行 prestart hook。
5. hook 调用 `nvidia-container-cli configure --pid <容器 init 进程>`，cli 读宿主机驱动信息（NVML / `/proc/driver/nvidia`），计算出需要挂载的文件。
6. cli 把这些设备节点与库以只读 bind mount 的方式挂进容器的 rootfs，并更新容器内 `ldconfig` 缓存。
7. runc 继续启动容器进程，此时容器内可以看到 GPU，`nvidia-smi -L` 能列出宿主机的 GPU。

因为注入发生在 **prestart** 阶段，所以一旦 hook 失败，容器会直接起不来（OCI runtime create failed），日志出现在容器引擎侧而不是容器内。

## 三种注入模式

`nvidia-container-runtime` 通过 `/etc/nvidia-container-runtime/config.toml` 中 `nvidia-container-runtime.mode` 控制注入方式，由 `nvidia-ctk config --in-place --set ...` 修改：

| 模式 | 机制 | 典型场景 |
| :--- | :--- | :--- |
| `legacy`（默认） | 向 OCI spec 注入 prestart hook，由 hook 调 `nvidia-container-cli` | Docker `--runtime=nvidia`、旧版 containerd 配置 |
| `cdi` | 运行时不注入 hook，自己把请求的 CDI 设备写进 spec | 容器引擎不支持 CDI，但希望用 CDI 设备名（`nvidia.com/gpu=all`） |
| `jit-cdi` | 按请求临时生成**内存中的** CDI spec，不在 `/var/run/cdi` 落盘 | 使用 NVML / WSL2 的系统，`mode=auto` 时的默认选择 |
| `auto` | 运行时自动抉择（通常落到 jit-cdi） | 新装环境的推荐值 |

CDI（Container Device Interface）是标准化的设备抽象，宿主机把可用设备写成 `nvidia.com/gpu=0`、`nvidia.com/gpu=all` 这类名字，运行时按名字解析。原生支持 CDI 的引擎（Docker 25+、Podman 4.1+、containerd 1.7+）可以**不装 NVIDIA 运行时**，直接 `--device nvidia.com/gpu=all`。

Toolkit 1.12 起提供 `nvidia-ctk cdi generate` 生成 spec；1.18 起由 `nvidia-cdi-refresh.path` / `nvidia-cdi-refresh.service` 在驱动或 toolkit 安装升级、系统重启时自动刷新 `/var/run/cdi/nvidia.yaml`（MIG 重配置与驱动卸载仍需手动触发）。

## 配置 Docker

```bash
# 写入 /etc/docker/daemon.json 并（可选）设为默认运行时
sudo nvidia-ctk runtime configure --runtime=docker --set-as-default
sudo systemctl restart docker
```

等价的手工配置：

```json
{
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  },
  "default-runtime": "nvidia"
}
```

使用方式：

```bash
# 方式一：--gpus 依赖引擎的 device request API，需要 nvidia 为默认运行时
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi

# 方式二：显式指定运行时 + 环境变量
docker run --rm --runtime=nvidia -e NVIDIA_VISIBLE_DEVICES=all \
  nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi

# 只给 1、2 号卡，并只给 compute/utility 能力
docker run --rm --gpus '"device=1,2"' nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
```

## 配置 containerd

```bash
sudo nvidia-ctk runtime configure --runtime=containerd
sudo systemctl restart containerd
```

手工配置（containerd 1.x 形式，`BinaryName` 指向包装层而非 runc）：

```toml
[plugins."io.containerd.grpc.v1.cri".containerd]
  default_runtime_name = "nvidia"

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.nvidia]
  runtime_type = "io.containerd.runc.v2"

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.nvidia.options]
  BinaryName = "/usr/bin/nvidia-container-runtime"
```

> containerd 2.x 把 CRI 配置迁到 `io.containerd.cri.v1.runtime` 插件下，格式不同；优先用 `nvidia-ctk runtime configure` 生成，避免手抄。

最小安装提示：如果完全走 CDI，可只装 `nvidia-container-toolkit-base`（含运行时与 `nvidia-ctk`），省掉 hook 及其依赖。

## 在 Kubernetes 中启用 GPU

前提认知：Kubernetes 本身不认识 GPU，它只知道一种叫 `nvidia.com/gpu` 的**扩展资源**。这个资源由 device plugin 上报，容器里的驱动由运行时注入。所以「Kubernetes 用上 NVIDIA」= 节点驱动就绪 + 运行时配好 + device plugin 上报，三件事缺一不可。

### 三条安装路径

| 路径 | 适用场景 | 驱动 | toolkit / 运行时 | device plugin |
| :--- | :--- | :--- | :--- | :--- |
| 手工安装 | 学习、单机验证、自管节点 | 手工装 | 手工装 + `nvidia-ctk` | `kubectl apply` 或 helm |
| GPU Operator | 生产自管集群、需要驱动生命周期管理 | Operator 以容器形式装 | Operator 配 | Operator 部署 |
| 托管集群（ACK / EKS / GKE） | 用云厂商 GPU 节点池 | 镜像自带 | 镜像自带 | 组件或附加件自动装 |

三条路径不要在同一个节点上叠用：Operator 与手工装的驱动、toolkit 互相覆盖是常见事故源。

### 路径 A：手工安装

**第 1 步：节点前置检查**

```bash
lspci | grep -i nvidia          # 确认卡在 PCI 上可见
nvidia-smi                      # 未装驱动时会提示找不到命令
uname -r && apt-get install -y linux-headers-$(uname -r)
```

禁用开源 `nouveau` 驱动，否则 NVIDIA 驱动无法加载。同时确认 CRI 为 containerd 1.6+ / CRI-O 1.23+ 这类已被 Kubernetes 验过的版本。

**第 2 步：装驱动**

优先用发行版仓库（如 `ubuntu-drivers install`）或 NVIDIA CUDA 仓库的 `cuda-drivers` 包，装完重启并确认 `nvidia-smi` 输出 GPU 型号与驱动版本。集群内**所有 GPU 节点驱动版本应一致**，否则调度到不同节点会得到不同 CUDA 上限。

**第 3 步：装 toolkit 并配置运行时**

```bash
sudo nvidia-ctk runtime configure --runtime=containerd
sudo systemctl restart containerd
crictl info | grep -A4 '"nvidia"'     # 确认 runtime handler 已注册
```

**第 4 步：部署 device plugin**

```bash
helm repo add nvdp https://nvidia.github.io/k8s-device-plugin
helm repo update
helm install nvidia-device-plugin nvdp/nvidia-device-plugin \
  --namespace kube-system --set nfd.enabled=true
```

也可以用官方 DaemonSet 清单（版本号以 [k8s-device-plugin releases](https://github.com/NVIDIA/k8s-device-plugin/releases) 为准）：

```bash
kubectl create -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/main/nvidia-device-plugin.yml
```

`nfd.enabled=true` 会顺带部署 Node Feature Discovery 与 GPU Feature Discovery，节点上会多出 `nvidia.com/gpu.product`、`nvidia.com/gpu.count`、`nvidia.com/mig.capable` 等标签，后续做 `nodeSelector` 非常有用。

部署完成后验证资源已上报：

```bash
kubectl get nodes -o custom-columns='NODE:.metadata.name,GPU:.status.allocatable.nvidia\.com/gpu'
```

### 路径 B：GPU Operator

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update
helm install --wait -n gpu-operator --create-namespace gpu-operator nvidia/gpu-operator \
  --set driver.enabled=true \
  --set toolkit.enabled=true \
  --set devicePlugin.enabled=true \
  --set dcgmExporter.enabled=true \
  --set migManager.enabled=false
```

Operator 会按顺序完成：NFD 打标签（`nvidia.com/gpu.present=true`）→ 驱动容器加载内核模块 → toolkit 配置 containerd → device plugin 与 DCGM exporter 就绪。几个常见开关：

| 开关 | 何时改 |
| :--- | :--- |
| `driver.enabled=false` | 节点已由云镜像或运维预装驱动，只让 Operator 管上层 |
| `toolkit.enabled=false` | 想完全走 CDI，由引擎原生注入设备 |
| `migManager.enabled=true` | 需要按 `nvidia.com/mig.config` 标签统一切 MIG 分区 |
| `devicePlugin.config.name` | 挂载自定义 device plugin 配置（如时间片） |

前置条件别忘了：节点能访问 `nvcr.io` 与 `helm.ngc.nvidia.com`（离线环境需同步镜像），并已装好 `kernel-headers` 与容器运行时。

### 在 Pod 中使用 NVIDIA runtime

Pod 能不能用上 GPU，由两件事共同决定：**运行时（谁能注入驱动）** 与 **资源声明（调度器分配哪张卡）**。前者通过 `runtimeClassName` 表达，后者通过 `nvidia.com/gpu` 表达。

**方式一：默认运行时（不写 `runtimeClassName`）**

如果 containerd 里 `nvidia` 已经是 `default_runtime_name`，所有 Pod 默认就跑在 NVIDIA 运行时上，你只需声明 GPU 资源：

```yaml
resources:
  limits:
    nvidia.com/gpu: 1
```

代价是「全体容器都走包装层」：无 GPU 的 Pod 也会经历相同的 OCI 包装，且难以在集群内混用 gVisor / Kata。因此生产更推荐方式二。

**方式二：显式 RuntimeClass（推荐）**

先创建一个与 containerd handler 同名的 RuntimeClass，这样 `nvidia` 不必是默认运行时，还能把“只能调度到 GPU 节点”写进 RuntimeClass 本身：

```yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: nvidia
handler: nvidia            # 必须与 containerd runtime handler 同名
scheduling:
  nodeSelector:
    nvidia.com/gpu.present: "true"
tolerations:
  - key: nvidia.com/gpu
    operator: Exists
    effect: NoSchedule
```

`RuntimeClass.scheduling` 只支持 `nodeSelector` 与 `tolerations`，它管的是「调度到哪些节点」，**不代替资源声明**——不写 `nvidia.com/gpu` 依然拿不到卡。

然后 Pod / Deployment 里指定它并声明卡数：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  runtimeClassName: nvidia
  containers:
    - name: cuda
      image: nvidia/cuda:12.4.0-base-ubuntu22.04
      command: ["sh", "-c", "nvidia-smi -L && sleep 3600"]
      env:
        # 不要在这里写 NVIDIA_VISIBLE_DEVICES：该值由 device plugin 按分配结果注入，
        # 手写 all 会让容器看到整机所有卡，破坏隔离
        - name: NVIDIA_DRIVER_CAPABILITIES
          value: "compute,utility"
      resources:
        limits:
          nvidia.com/gpu: 1     # requests 必须与 limits 相等
```

几条硬规则：

- 扩展资源必须是**整数**，`0.5` 张卡不合法；要 2 张就写 `nvidia.com/gpu: 2`。
- `requests` 必须等于 `limits`；只写 `requests` 会被 API server 拒绝，写了不等则 GPU 可被超卖。
- 不写 `nvidia.com/gpu` 的容器永远拿不到 GPU，即使镜像里有 CUDA、即使 `runtimeClassName` 写对了。
- GPU 是**容器级**资源：多容器 Pod 里，只有声明了 `limits` 的那个容器能拿到卡；sidecar、initContainer 都一样，各拿各的。
- `runtimeClassName` 是**不可变字段**，运行中的 Pod 改不了，`kubectl apply` 会报 `field is immutable`；变更必须删重建（Deployment 改模板触发滚动更新即可）。
- 云厂商 GPU 节点池常用 taint（如 `nvidia.com/gpu=present:NoSchedule`）把普通负载挤开，以控制台实际标签/污点为准。

**确认 Pod 真的用上了 NVIDIA runtime**

```bash
# 1. Pod 层：声明是否生效
kubectl get pod gpu-test -o jsonpath='{.spec.runtimeClassName}{"\n"}'

# 2. 节点层：找到 sandbox/容器，看 legacy 模式下是否注入了 prestart hook
sudo crictl ps --name cuda -q
sudo crictl inspect <container-id> | grep -A6 prestart
# 期望看到 nvidia-container-runtime-hook；CDI 模式没有 hook，改看 spec 里的设备与挂载

# 3. 容器层：卡是否只给了这个容器
kubectl exec gpu-test -- nvidia-smi -L
kubectl exec gpu-test -- ls -l /dev/nvidia*
```

注意第三行的预期结果：容器内只能看到分配给自己的那（几）张卡，不是整机全部卡。若在单个 GPU 的 Pod 里看到了整机所有卡，几乎都是 Pod 清单里手动写了 `NVIDIA_VISIBLE_DEVICES=all`，把 device plugin 注入的设备 ID 覆盖掉了——这是 Kubernetes 下最常见、也最容易漏的隔离失效。

**常见坑**

| 现象 | 原因 |
| :--- | :--- |
| Pod 卡在 `ContainerCreating`，事件报 `no runtime for "nvidia" is configured` | 节点 containerd 没配该 handler，或 RuntimeClass 的 `handler` 与配置不同名 |
| Pod `Running` 但容器内 `nvidia-smi` 报 `no devices were found` | 漏了 `resources.limits`，或 `NVIDIA_VISIBLE_DEVICES=none` |
| Pod `Pending`，事件 `Insufficient nvidia.com/gpu` | device plugin 未上报，或节点卡已分完 |
| 改了 `runtimeClassName` 却提示 `field is immutable` | 该字段不可变，必须重建 Pod |
| 普通 `ubuntu` 镜像里也能跑 `nvidia-smi`，但换成 CDI 模式后不能了 | legacy 模式由 host 挂载 `nvidia-smi`；CDI 模式需要镜像自带或改用 utility 能力 |

### 复用与切分：MIG、时间片、MPS

| 方式 | 资源名 | 隔离性 | 适用 |
| :--- | :--- | :--- | :--- |
| 独占 | `nvidia.com/gpu` | 强（整卡） | 训练、大模型推理 |
| MIG | `nvidia.com/mig-1g.5gb` 等 | 强（硬件分区，显存/算力独立） | 多租户推理，A100/H100 等支持 |
| 时间片 | 仍为 `nvidia.com/gpu`，replicas 虚拟化 | 弱（共享显存，无故障隔离） | 开发测试、低负载小模型 |
| MPS | 仍为 `nvidia.com/gpu` | 中（进程级并发） | 小 kernel 密集的高并发推理 |

时间片需要给 device plugin 一份配置（GPU Operator 用 `devicePlugin.config.name` 挂载）：

```yaml
version: v1
sharing:
  timeSlicing:
    resources:
      - name: nvidia.com/gpu
        replicas: 4
```

时间片只是让 4 个容器「看起来」各有一张卡，显存是共享的——一旦某个容器打满显存，同节点的其他容器会一起 OOM。生产多租户优先 MIG。

### 上线验证清单

| 环节 | 命令 | 期望 |
| :--- | :--- | :--- |
| 宿主机驱动 | `nvidia-smi` | 列出 GPU，驱动版本与镜像 CUDA 兼容 |
| 运行时 | `crictl info \| grep -A4 nvidia` | 存在 `nvidia` handler |
| device plugin | `kubectl -n kube-system get pod -l name=nvidia-device-plugin-ds` | Running，日志无 NVML 报错 |
| 节点资源 | `kubectl describe node <node> \| grep nvidia.com/gpu` | Allocatable 有数量 |
| Pod 调度 | `kubectl describe pod gpu-test` | 无 `Insufficient nvidia.com/gpu` |
| 容器内 | `kubectl exec gpu-test -- nvidia-smi -L` | 只看到分配给自己的那张卡 |

如果 `allocatable` 一直是 `0`，先看 device plugin 是否 Running，再看它日志里的 `no devices found` / `NVML` 错误——这两类错误分别指向驱动与运行时，而不是 Kubernetes 本身。


## 环境变量

| 变量 | 作用 | 常用值 |
| :--- | :--- | :--- |
| `NVIDIA_VISIBLE_DEVICES` | 容器可见的 GPU 集合 | `all`、`none`、`0,1`、`GPU-<uuid>`、`MIG-<uuid>`、`nvidia.com/gpu=all`（CDI 名） |
| `NVIDIA_DRIVER_CAPABILITIES` | 挂载哪些驱动能力（**替换**而非追加，需列全） | `compute,utility`（默认）、`graphics`、`video`、`display`、`compat32`、`all` |
| `NVIDIA_REQUIRE_*` | 启动前的版本/架构约束，不满足则拒绝启动 | `NVIDIA_REQUIRE_CUDA="cuda>=12.0"` |
| `NVIDIA_DISABLE_REQUIRE` | 关闭上述约束检查 | `true` |
| `NVIDIA_MIG_CONFIG_DEVICES` / `NVIDIA_MIG_MONITOR_DEVICES` | 注入 MIG 管理设备节点（仅接受 `all`，容器需 `CAP_SYS_ADMIN`） | `all` |
| `NVIDIA_IMEX_CHANNELS` | 申请 IMEX 通道 | `0,1` |

注意 `NVIDIA_VISIBLE_DEVICES` 未设置或为空时，运行时行为**与 runc 完全一致**——不注入任何东西，这也是「容器里没有 GPU 但启动没报错」的常见原因。

## MIG 场景

- 只暴露某个 MIG 实例：`NVIDIA_VISIBLE_DEVICES=MIG-GPU-<uuid>/<gi>/<ci>`，容器内 `nvidia-smi -L` 只列出该实例。
- 需要在容器内创建/销毁 MIG 分区：额外加 `NVIDIA_MIG_CONFIG_DEVICES=all`、`NVIDIA_MIG_MONITOR_DEVICES=all` 并授予 `CAP_SYS_ADMIN`；不能与「按 MIG 实例可见」同时使用。
- MIG 重配置后 CDI spec 不会自动刷新，需 `systemctl restart nvidia-cdi-refresh.service`。
- Kubernetes 侧通常由 GPU Operator 的 MIG manager 统一管理，配合 `nvidia.com/mig-<profile>` 资源名使用。

## 故障排查

| 症状 | 大概率原因 | 检查点 |
| :--- | :--- | :--- |
| `could not select device driver "" with capabilities: [[gpu]]` | 引擎没配 `nvidia` 运行时，或未设为默认 | `docker info` 的 Runtimes 列表；`daemon.json` |
| `OCI runtime create failed: nvidia-container-runtime: executable file not found` | `BinaryName` 路径错 / 未装 toolkit | `ls -l /usr/bin/nvidia-container-runtime` |
| 容器内 `nvidia-smi` 报 `command not found` | 缺少 `utility` 能力，或镜像无 `nvidia-smi` | `NVIDIA_DRIVER_CAPABILITIES`；`ls /usr/bin/nvidia-smi` |
| 容器内 `failed to initialize NVML: Driver/library version mismatch` | 宿主机驱动刚升级，旧库仍在容器/进程里 | 重建容器；必要时重启 `nvidia-persistenced` |
| 容器内看不到 `/dev/nvidia*` | `NVIDIA_VISIBLE_DEVICES` 为空/`none` | `docker inspect` 的环境变量 |
| Pod 一直 `Pending`，事件提示 insufficient `nvidia.com/gpu` | device plugin 未就绪或未上报 | `kubectl describe node`、plugin Pod 日志 |
| Pod 起容器即失败，kubelet 报 runtime 相关错误 | containerd 的 runtime handler 未配好 | `crictl info` 的 runtimes 段 |

常用诊断命令：

```bash
# 宿主机侧
nvidia-smi
nvidia-container-cli --version
nvidia-container-cli info            # 驱动、设备、能力一览
nvidia-ctk cdi list                  # 已生成的 CDI 设备名
nvidia-ctk --debug cdi list          # 附带 spec 加载错误

# 容器内
nvidia-smi -L
ls -l /dev/nvidia*
ldconfig -p | grep -E 'libcuda|libnvidia-ml'

# Kubernetes 侧
kubectl get node -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.allocatable.nvidia\.com/gpu}{"\n"}{end}'
```

## 与 CDI 的关系

| 维度 | legacy hook 模式 | CDI 模式 |
| :--- | :--- | :--- |
| 谁改 spec | NVIDIA 运行时注入 hook，hook 改容器 | 引擎或运行时直接按设备名注入 |
| 是否需要 NVIDIA 运行时 | 需要 | 原生 CDI 引擎不需要 |
| rootless 支持 | 受限于 hook 需要的权限 | 明显更好 |
| 设备选择语法 | `NVIDIA_VISIBLE_DEVICES` | `--device nvidia.com/gpu=all` 等 |
| 现状 | 仍广泛部署 | 新环境首选方向 |

迁移时注意：CDI 与 hook 同时生效会冲突，Podman 环境需删除 `/usr/share/containers/oci/hooks.d/oci-nvidia-hook.json`，或不要同时设置 `NVIDIA_VISIBLE_DEVICES`。

## Reference

[nvidia-container-toolkit (GitHub)](https://github.com/NVIDIA/nvidia-container-toolkit)

[libnvidia-container (GitHub)](https://github.com/NVIDIA/libnvidia-container)

[NVIDIA Container Toolkit Documentation](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html)

[Installation Guide](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)

[Specialized Configurations with Docker](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/docker-specialized.html)

[Support for Container Device Interface](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/cdi-support.html)

[Container Device Interface (CDI) Specification](https://github.com/cncf-tags/container-device-interface)

[NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html)

[Device Plugins — Kubernetes](https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/device-plugins/)

[]()

[]()

[]()

