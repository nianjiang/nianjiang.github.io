---
weight: 13
title: "Kubelet"
---

# Kubernetes Kubelet 代码结构

> 仓库地址：[cmd](https://github.com/kubernetes/kubernetes/tree/master/cmd/kubelet)，[pkg](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet)

---

## 整体代码布局

```
kubernetes/
├── cmd/kubelet/                           # 入口：二进制启动命令
│   ├── kubelet.go                         # main() 入口
│   └── app/                               # 应用初始化、配置解析
│       ├── server.go                      # Kubelet 启动核心（NewKubeletCommand → Run）
│       ├── auth.go                        # HTTP API 认证授权
│       ├── plugins.go                     # CSI/CNI/DeviceManager 插件注册
│       ├── init_others.go                 # 非 Windows 平台初始化
│       ├── init_windows.go                # Windows 平台初始化
│       ├── server_linux.go                # Linux 特定启动逻辑
│       ├── server_others.go               # 非 Linux 平台启动逻辑
│       ├── server_windows.go              # Windows 特定启动逻辑
│       └── options/                       # 命令行选项解析
│
└── pkg/kubelet/                           # 核心实现
    │
    ├── kubelet.go                         # Kubelet 主结构体 + Run() + SyncPod()
    ├── kubelet_pods.go                    # Pod 管理（创建/更新/删除）
    ├── kubelet_volumes.go                 # 卷挂载/卸载
    ├── kubelet_node_status.go             # 节点状态上报
    ├── kubelet_network.go                 # 网络设置
    ├── kubelet_getters.go                 # 各类 Getter 方法
    ├── kubelet_resources.go               # 资源管理
    ├── pod_workers.go                     # Pod Worker（每 Pod 一个 goroutine）
    ├── pod_container_deletor.go           # 容器清理
    ├── active_deadline.go                 # ActiveDeadlineSeconds 处理
    ├── reason_cache.go                    # 容器终止原因缓存
    ├── runtime.go                         # 容器运行时接口
    │
    ├── apis/                              # KubeletConfiguration API 定义
    ├── cadvisor/                          # cAdvisor 集成（容器资源监控）
    ├── certificate/                       # 证书轮转管理
    ├── checkpointmanager/                 # 检查点管理（持久化状态）
    ├── client/                            # kubeclient 创建
    ├── clustertrustbundle/                # 集群信任包分发
    ├── cm/                                # 容器管理器（cgroup/QoS/设备）
    │   ├── container_manager.go           # ContainerManager 接口
    │   ├── container_manager_linux.go     # Linux 实现
    │   ├── cgroup_v1_manager_linux.go     # cgroup v1 管理器
    │   ├── cgroup_v2_manager_linux.go     # cgroup v2 管理器
    │   ├── cpumanager/                    # CPU 管理器（静态分配/亲和性）
    │   ├── devicemanager/                 # 设备管理器（GPU/RDMA 等）
    │   ├── memorymanager/                 # 内存管理器（NUMA 绑定）
    │   ├── topologymanager/               # 拓扑管理器（CPU/设备 NUMA 协调）
    │   ├── qos/                           # QoS 等级管理
    │   ├── dra/                           # Dynamic Resource Allocation
    │   └── admission/                     # 容器级准入控制
    │
    ├── config/                            # Pod 配置源（API Server/File/HTTP）
    ├── configmap/                         # ConfigMap 挂载管理
    ├── container/                         # 容器运行时抽象接口
    ├── envvars/                           # 环境变量注入
    ├── events/                            # Event 记录器
    ├── eviction/                          # 驱逐管理器（压力回收）
    ├── images/                            # 镜像管理（拉取/GC）
    ├── kuberuntime/                       # CRI 容器运行时实现
    │   ├── kuberuntime_manager.go         # kubeRuntimeManager 主结构体
    │   ├── kuberuntime_container.go       # 容器生命周期（创建/启动/停止）
    │   ├── kuberuntime_sandbox.go         # Pod Sandbox 管理
    │   ├── kuberuntime_gc.go              # 容器/Sandbox 垃圾回收
    │   ├── kuberuntime_image.go           # 镜像拉取/删除
    │   ├── kuberuntime_logs.go            # 容器日志管理
    │   └── security_context.go            # 安全上下文设置
    │
    ├── kubeletconfig/                     # Kubelet 动态配置管理
    ├── lifecycle/                         # Pod 生命周期事件（Admit/Sync）
    ├── logs/                              # 日志轮转管理
    ├── metrics/                           # Prometheus 指标
    ├── network/                           # CNI 网络插件管理
    ├── nodeshutdown/                      # 节点关机/重启处理
    ├── nodestatus/                        # 节点状态维护
    ├── oom/                               # OOM 事件监控
    ├── pleg/                              # Pod 生命周期事件生成器
    │   ├── pleg.go                        # PLEG 接口定义
    │   ├── generic.go                     # Generic PLEG（轮询模式）
    │   └── evented.go                     # Evented PLEG（事件驱动模式）
    │
    ├── pluginmanager/                     # 插件管理器（CSI/Device Plugin）
    ├── pod/                               # Pod 操作工具
    ├── podcertificate/                    # Pod 证书管理
    ├── preemption/                        # 节点级抢占
    ├── prober/                            # 探针管理器（Liveness/Readiness/Startup）
    ├── qos/                               # QoS 工具函数
    ├── runtimeclass/                      # RuntimeClass 支持
    ├── secret/                            # Secret 挂载管理
    ├── server/                            # Kubelet HTTP API Server
    ├── stats/                             # 统计信息收集
    ├── status/                            # Pod 状态管理器
    ├── sysctl/                            # Sysctl 应用
    ├── token/                             # ServiceAccount Token 管理
    ├── types/                             # 类型定义（PodStatus/运行时状态）
    ├── userns/                            # 用户命名空间映射
    ├── util/                              # 工具函数
    ├── volumemanager/                     # 卷管理器
    │   ├── volume_manager.go              # VolumeManager 主结构体
    │   ├── cache/                         # 卷状态缓存
    │   ├── populator/                     # 期望/实际状态同步
    │   ├── reconciler/                    # 卷挂载/卸载协调器
    │   └── volumehealth/                  # 卷健康检查
    ├── watchdog/                          # 看门狗
    └── winstats/                          # Windows 统计信息
```

---

## 核心文件解析

### 1. [`cmd/kubelet/kubelet.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kubelet/kubelet.go) — 入口

```go
func main() {
    command := app.NewKubeletCommand()
    code := cli.Run(command)
    os.Exit(code)
}
```

**核心逻辑**：与 Scheduler/Controller Manager 一样，`main()` 极其简单，通过 cobra Command 启动。

---

### 2. [`cmd/kubelet/app/server.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kubelet/app/server.go) — 启动核心

这是 Kubelet 最重要的启动文件，负责：
- 解析命令行参数和配置文件
- 构建 `KubeletServer` 配置
- 创建并运行 `Kubelet` 实例

```go
func NewKubeletCommand() *cobra.Command {
    cleanFlagSet := pflag.NewFlagSet(...)
    kubeletFlags := options.NewKubeletFlags()
    kubeletConfig := kubeletconfig.KubeletConfiguration{}

    cmd := &cobra.Command{
        Use: "kubelet",
        Run: func(cmd *cobra.Command, args []string) {
            // 1. 加载配置文件（--config）
            // 2. 校验配置
            // 3. 构建依赖（kubeclient, CRI, CNI 等）
            // 4. 运行 Kubelet
            Run(ctx, kubeletServer, kubeletDeps, ...)
        },
    }
    return cmd
}
```

**启动流程：**

```
main()
  └── NewKubeletCommand()
        └── Run()
              ├── UnsecuredDependencies()     // 构建基础依赖（不含认证）
              ├── SecureDependencies()        // 添加 TLS/认证依赖
              └── RunKubelet()
                    ├── createAndInitKubelet()
                    │     ├── NewMainKubelet()  // 创建 Kubelet 实例
                    │     └── k.Run()           // 启动主循环
                    └── startKubelet()
                          ├── k.Run()           // 核心循环
                          └── server.ListenAndServe()  // HTTP API
```

---

### 3. [`pkg/kubelet/kubelet.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/kubelet.go) — Kubelet 主结构体

这是 Kubelet 最核心的文件，定义了 `Kubelet` 结构体和所有主循环逻辑：

```go
type Kubelet struct {
    // --- 核心依赖 ---
    kubeClient       clientset.Interface        // API Server 客户端
    heartbeatClient  clientset.Interface        // 心跳上报专用客户端
    podClient        clientset.Interface        // Pod 操作客户端
    containerManager cm.ContainerManager        // 容器管理器（cgroup）
    containerRuntime kubecontainer.Runtime      // 容器运行时（CRI）
    podWorkers       PodWorkers                 // Pod Worker 池
    pleg             pleg.PodLifecycleEventGenerator  // PLEG
    podCache         kubecontainer.Cache        // Pod 状态缓存

    // --- 子系统 ---
    volumeManager    volumemanager.VolumeManager   // 卷管理器
    probeManager     prober.Manager                // 探针管理器
    evictionManager  eviction.Manager              // 驱逐管理器
    imageManager     images.ImageManager           // 镜像管理器
    statusManager    status.Manager                // Pod 状态管理器
    podAddscribers   []PodAddSubscriber            // Pod 添加订阅者

    // --- Informer ---
    podLister        corelisters.PodLister
    nodeLister       corelisters.NodeLister

    // --- 配置 ---
    kubeletConfiguration kubeletconfig.KubeletConfiguration
    recorder         record.EventRecorder          // 事件记录器
    clock            clock.Clock
    nodeName         string
}
```

#### `Run()` — 主启动方法

```go
func (kl *Kubelet) Run(updates <-chan kubetypes.PodUpdate) {
    // 1. 启动 Cloud Provider 同步
    kl.cloudResourceSyncManager.Run(wait.NeverStop)

    // 2. 启动 VolumeManager
    go kl.volumeManager.Run(kl.sourcesReady, wait.NeverStop, wait.NeverStop)

    // 3. 启动容器运行时（CRI）
    kl.containerRuntime.Start()

    // 4. 启动 PLEG（Pod 生命周期事件生成器）
    kl.pleg.Start()

    // 5. 启动 Pod Workers
    kl.podWorkers.Start()

    // 6. 启动探针管理器
    kl.probeManager.Start()

    // 7. 启动驱逐管理器
    kl.evictionManager.Start(kl)

    // 8. 启动节点状态上报循环
    go kl.nodeStatusManager.Run(wait.NeverStop)

    // 9. 启动状态管理器
    kl.statusManager.Start()

    // 10. 启动主 Pod 同步循环
    go wait.Until(kl.syncLoop, 0, wait.NeverStop)
}
```

---

### 4. [`pkg/kubelet/pod_workers.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/pod_workers.go) — Pod Worker

每个 Pod 对应一个独立的 worker goroutine，负责该 Pod 的全部生命周期管理：

```go
type PodWorkers struct {
    podUpdates map[types.UID]chan podWork  // 每 Pod 一个 channel
    cache      *podCache
    client     Client                        // 创建/更新 Pod 状态
    runtime    kubecontainer.Runtime         // CRI 运行时
}

// UpdatePod 处理 Pod 的更新事件
func (p *podWorkers) UpdatePod(options UpdatePodOptions) {
    uid := options.Pod.UID
    ch, exists := p.podUpdates[uid]
    if !exists {
        // 首次见到该 Pod → 创建 worker goroutine
        ch = make(chan podWork, 1)
        p.podUpdates[uid] = ch
        go p.podWorkerLoop(uid, ch)        // 每个 Pod 一个 goroutine
    }
    ch <- podWork{UpdateType: options.UpdateType, Pod: options.Pod}
}

// podWorkerLoop 每 Pod 的主循环
func (p *podWorkers) podWorkerLoop(uid types.UID, ch <-chan podWork) {
    for work := range ch {
        p.syncPodFn(work.Pod)              // 调用 Kubelet.syncPod()
    }
}
```

---

### 5. [`pkg/kubelet/kubelet.go` — `syncPod()`](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/kubelet.go) — Pod 同步核心

`syncPod()` 是 Kubelet 处理单个 Pod 的核心方法：

```go
func (kl *Kubelet) syncPod(ctx context.Context, updateType kubetypes.SyncPodType,
    pod *v1.Pod, mirrorPod *v1.Pod, podStatus *kubecontainer.PodStatus) error {
    // 1. 判断 Pod 是否需要终止（被删除/驱逐）
    if err := kl.canRunPod(pod); err != nil {
        kl.rejectPod(pod, reason, message)
        return err
    }

    // 2. 网络插件设置（CNI）
    if !kl.podIsTerminated(pod) {
        kl.networkPlugin.SetUpPod(pod.Namespace, pod.Name, ...)
    }

    // 3. 创建/更新 Pod Sandbox（CRI）
    podSandboxID, err := kl.containerRuntime.EnsureSandbox(pod)

    // 4. 挂载卷
    kl.volumeManager.WaitForAttachAndMount(pod)

    // 5. 拉取镜像
    kl.containerRuntime.EnsureImageExists(pod, container)

    // 6. 创建/启动容器
    for _, container := range pod.Spec.Containers {
        kl.containerRuntime.CreateContainer(pod, container, podSandboxID)
        kl.containerRuntime.StartContainer(containerID)
    }

    // 7. 启动探针
    kl.probeManager.AddPod(pod)
}
```

---

## Kubelet 主循环（syncLoop）

`syncLoop` 是 Kubelet 的心脏，不断协调多个事件源并驱动 Pod 同步：

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        Kubelet syncLoop                                   │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────┐  ┌───────────────────┐          │
│  │ Pod 配置源        │  │ PLEG 事件    │  │ 定时同步 (Housekeeping) │      │
│  │ (API Server)     │  │ (容器状态变化) │  │ (每 10s)           │          │
│  └────────┬─────────┘  └──────┬───────┘  └─────────┬─────────┘          │
│           │                   │                     │                    │
│           ▼                   ▼                     ▼                    │
│  ┌──────────────────────────────────────────────────────────┐           │
│  │                    syncLoopIteration()                    │           │
│  │                    (事件合并 + 去重)                        │           │
│  └──────────────────────────┬───────────────────────────────┘           │
│                             │                                            │
│                             ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐           │
│  │                    dispatchWork()                         │           │
│  │                    ┌─ 更新类型判断 ─┐                      │           │
│  │                    │ SyncPodCreate  │                      │           │
│  │                    │ SyncPodUpdate  │                      │           │
│  │                    │ SyncPodKill    │                      │           │
│  │                    └───────┬────────┘                      │           │
│  └────────────────────────────┼──────────────────────────────┘           │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐           │
│  │              podWorkers.UpdatePod()                       │           │
│  │              ┌─── 每 Pod 一个 channel ───┐                 │           │
│  │              │  podWorkerLoop (goroutine) │                 │           │
│  │              │       └── syncPod()        │                 │           │
│  │              │            └── CRI 调用    │                 │           │
│  │              └────────────────────────────┘                 │           │
│  └──────────────────────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## PLEG — Pod 生命周期事件生成器

PLEG 负责检测容器运行时中 Pod 状态的变化，并生成事件通知 Kubelet 进行同步。

### 两种 PLEG 模式

| 模式 | 文件 | 机制 | 优势 | 劣势 |
|------|------|------|------|------|
| **Generic PLEG** | [`generic.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/pleg/generic.go) | 定时轮询 CRI 获取容器状态 | 兼容性好，适用于所有运行时 | CPU 开销大，延迟较高（~10s） |
| **Evented PLEG** | [`evented.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/pleg/evented.go) | 通过 CRI `GetContainerEvents` 流式订阅 | 低延迟，低 CPU 开销 | 需要运行时支持（containerd 1.7+） |

### Generic PLEG 工作流

```go
// pkg/kubelet/pleg/generic.go
type GenericPLEG struct {
    runtime    kubecontainer.Runtime
    channel    chan *PodLifecycleEvent   // 事件输出 channel
    podCache   kubecontainer.Cache
    relistPeriod time.Duration            // 轮询间隔（默认 1s）
}

func (g *GenericPLEG) Start() {
    go wait.Until(g.relist, g.relistPeriod, wait.NeverStop)
}

func (g *GenericPLEG) relist() {
    // 1. 从 CRI 获取所有 Pod 的当前状态
    pods, err := g.runtime.GetPods(true)

    // 2. 与缓存中的旧状态对比
    for _, pod := range pods {
        oldStatus := g.podCache.Get(pod.ID)
        newStatus := currentStatus(pod)

        // 3. 检测变化并生成事件
        if oldStatus.Phase != newStatus.Phase {
            g.channel <- &PodLifecycleEvent{
                ID: pod.ID,
                Type: ContainerStarted, // 或 ContainerDied
            }
        }
    }

    // 4. 更新缓存
    g.podCache.Set(pod.ID, newStatus)
}
```

```
PLEG 工作流：

  CRI Runtime                Generic PLEG              syncLoop
      │                          │                         │
      │   GetPods() (每 1s)      │                         │
      │ ←────────────────────────│                         │
      │ ──────────────────────→  │                         │
      │                          │ 对比新旧状态              │
      │                          │ 生成 PodLifecycleEvent   │
      │                          │ ──────────────────────→ │
      │                          │                         │ dispatchWork()
```

---

## 容器运行时（CRI）

Kubelet 通过 CRI（Container Runtime Interface）与容器运行时通信，实现在 [`kuberuntime/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet/kuberuntime) 目录下：

### CRI 架构

```
┌─────────────────────────────────────────────────────┐
│                     Kubelet                          │
│                                                      │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │  syncPod()   │───→│  kubeRuntimeManager      │   │
│  │              │    │  (kuberuntime_manager.go) │   │
│  └──────────────┘    └───────────┬──────────────┘   │
│                                  │                   │
│                    ┌─────────────┼─────────────┐    │
│                    │             │             │    │
│              ┌─────▼───┐  ┌─────▼───┐  ┌─────▼───┐  │
│              │Sandbox   │  │Container │  │ Image   │  │
│              │Manager   │  │Manager   │  │ Manager │  │
│              │(sandbox) │  │(container)│  │(image)  │  │
│              └─────┬───┘  └─────┬───┘  └─────┬───┘  │
│                    │            │            │       │
└────────────────────┼────────────┼────────────┼───────┘
                     │    gRPC    │            │
                     ▼            ▼            ▼
              ┌──────────────────────────────────────┐
              │     Container Runtime (CRI shim)      │
              │  ┌──────────┐ ┌────────┐ ┌─────────┐ │
              │  │containerd│ │cri-dockerd│ │CRI-O  │ │
              │  └──────────┘ └────────┘ └─────────┘ │
              └──────────────────────────────────────┘
```

### CRI 两大服务

| 服务 | gRPC 方法 | 对应文件 | 职责 |
|------|----------|---------|------|
| **RuntimeService** | `RunPodSandbox` | [`kuberuntime_sandbox.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/kuberuntime/kuberuntime_sandbox.go) | 创建/停止 Pod Sandbox（网络命名空间） |
| | `CreateContainer` | [`kuberuntime_container.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/kuberuntime/kuberuntime_container.go) | 创建容器 |
| | `StartContainer` | 同上 | 启动容器 |
| | `StopContainer` | 同上 | 停止容器 |
| | `RemoveContainer` | 同上 | 删除容器 |
| | `ListContainers` | 同上 | 列出容器 |
| | `ContainerStatus` | 同上 | 容器状态 |
| **ImageService** | `PullImage` | [`kuberuntime_image.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/kuberuntime/kuberuntime_image.go) | 拉取镜像 |
| | `ListImages` | 同上 | 列出镜像 |
| | `RemoveImage` | 同上 | 删除镜像 |

### Pod 创建的 CRI 调用序列

```
syncPod()
  │
  ├── 1. RuntimeService.RunPodSandbox()      → 创建 Pod Sandbox（网络/IPC/UTS 命名空间）
  │       └── 返回 sandboxID
  │
  ├── 2. VolumeManager.WaitForAttachAndMount()  → 等待卷挂载完成
  │
  ├── 3. ImageService.PullImage()            → 拉取容器镜像
  │       └── 返回 imageRef
  │
  ├── 4. RuntimeService.CreateContainer()    → 创建容器（传入 sandboxID, imageRef, 配置）
  │       └── 返回 containerID
  │
  ├── 5. RuntimeService.StartContainer()     → 启动容器
  │
  └── 6. 启动探针（probeManager.AddPod）       → Liveness/Readiness/Startup 探针
```

---

## 容器管理器（Container Manager）

容器管理器位于 [`cm/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet/cm)，负责节点级资源管理：

```
┌─────────────────────────────────────────────────────────────┐
│                  ContainerManager                            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ CPUManager   │  │ MemoryManager│  │ DeviceManager     │  │
│  │ (cpumanager) │  │(memorymanager)│  │(devicemanager)   │  │
│  │              │  │              │  │                    │  │
│  │ • static 策略│  │ • NUMA 绑定  │  │ • GPU/RDMA 设备   │  │
│  │ • 独占 CPU   │  │ • 大页管理   │  │ • Device Plugin   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────┘  │
│         │                 │                   │              │
│         └─────────────────┼───────────────────┘              │
│                           │                                  │
│                  ┌────────▼─────────┐                        │
│                  │ TopologyManager  │ ← 协调 CPU/设备 NUMA    │
│                  │(topologymanager) │   亲和性分配             │
│                  └──────────────────┘                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ CgroupManager│  │ QoSManager   │  │ InternalContainer │  │
│  │ v1 / v2      │  │ (qos)        │  │ Lifecycle          │  │
│  │              │  │              │  │ (容器级生命周期)      │  │
│  │ • 资源限制   │  │ • Guaranteed │  │ • OOM 分数调整     │  │
│  │ • 命名空间   │  │ • Burstable  │  │ • cgroup 创建      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### QoS 与 cgroup 层级

```
/kubepods (QoS 根 cgroup)
├── /kubepods/pod<UID>/           → Burstable Pod
│   └── <containerID>/
├── /kubepods/burstable/          → Burstable Pod 集合
│   └── pod<UID>/
│       └── <containerID>/
└── /kubepods/besteffort/         → BestEffort Pod 集合
    └── pod<UID>/
        └── <containerID>/
```

---

## 卷管理器（Volume Manager）

卷管理器位于 [`volumemanager/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet/volumemanager)，负责 Pod 卷的挂载和卸载：

```
┌──────────────────────────────────────────────────────────────┐
│                    VolumeManager                               │
│                                                               │
│  ┌─────────────────┐     ┌───────────────────────────────┐   │
│  │ 期望状态          │     │ 实际状态                       │   │
│  │ (来自 Pod Spec)  │     │ (来自 Node 本地)              │   │
│  └────────┬────────┘     └──────────────┬────────────────┘   │
│           │                             │                     │
│           ▼                             ▼                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Populator（填充器）                         │  │
│  │              对比期望 vs 实际，生成 PendingOperations     │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                    │
│                           ▼                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Reconciler（协调器）                        │  │
│  │                                                        │  │
│  │  • AttachVolume    → CSI/云驱动挂载远程卷               │  │
│  │  • MountDevice     → 挂载块设备                         │  │
│  │  • SetUp           → 格式化 + 挂载到 Pod 目录           │  │
│  │  • UnmountVolume   → 卸载                              │  │
│  │  • DetachVolume    → 分离远程卷                         │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 探针管理器（Prober Manager）

探针管理器位于 [`prober/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet/prober)，负责 Liveness/Readiness/Startup 探针：

```go
// prober/manager.go
type manager struct {
    // 探针执行器
    livenessProbe  prober.Prober     // HTTP/TCP/Exec 探针执行
    readinessProbe prober.Prober
    startupProbe   prober.Prober

    // 探针结果
    liveness  results.Manager        // 存储结果 + 通知 listener
    readiness results.Manager
    startup   results.Manager

    workers map[probeKey]*worker     // 每容器每探针一个 worker
}

// AddPod 为 Pod 中的每个容器注册探针
func (m *manager) AddPod(pod *v1.Pod) {
    for _, container := range pod.Spec.Containers {
        if container.LivenessProbe != nil {
            key := probeKey{podUID: pod.UID, containerName: container.Name}
            m.workers[key] = newWorker(m.livenessProbe, pod, container)
        }
        // ReadinessProbe / StartupProbe 同理
    }
}
```

### 三种探针对比

| 探针 | 作用 | 失败后果 | 文件 |
|------|------|---------|------|
| **Liveness** | 检测容器是否存活 | 重启容器 | [`prober/prober.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/prober/prober.go) |
| **Readiness** | 检测容器是否就绪 | 从 Service Endpoints 移除 | 同上 |
| **Startup** | 检测容器是否已启动 | 禁用 Liveness/Readiness 直到成功 | 同上 |

```
探针执行流程：

  worker.doProbe()
    │
    ├── 容器是否还在运行？
    │     └── 否 → 标记为 Unknown
    │
    ├── HTTP 探针 → HTTP GET :path
    │     └── 200-399 → Success
    │     └── 其他 → Failure
    │
    ├── TCP 探针 → TCP 连接
    │     └── 连通 → Success
    │     └── 超时 → Failure
    │
    ├── Exec 探针 → 容器内执行命令
    │     └── exit 0 → Success
    │     └── exit ≠ 0 → Failure
    │
    └── 结果 → results.Manager → 通知 listener
          ├── Liveness 失败 → kubelet.killContainer() + 重建
          ├── Readiness 失败 → statusManager 更新 Pod Conditions
          └── Startup 成功 → 激活 Liveness/Readiness 探针
```

---

## 驱逐管理器（Eviction Manager）

驱逐管理器位于 [`eviction/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet/eviction)，在节点资源紧张时主动回收：

```
节点资源压力检测

  ┌─────────────────┐    超过 Soft Threshold    ┌──────────────────┐
  │ Memory Pressure │ ──────────────────────→  │  Eviction Manager │
  │ Disk Pressure   │    超过 Hard Threshold    │                   │
  │ PID Pressure    │ ──────────────────────→  │  1. 评估所有 Pod   │
  └─────────────────┘                          │  2. 按 QoS 排序    │
                                               │     BestEffort 优先│
                                               │  3. 驱逐选中的 Pod  │
                                               └────────┬──────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │  KillPod()       │
                                               │  → 删除容器       │
                                               │  → 更新 Pod 状态  │
                                               └──────────────────┘
```

### 驱逐信号与阈值

| 信号 | 描述 | Soft Threshold | Hard Threshold |
|------|------|---------------|----------------|
| `memory.available` | 可用内存 | 100Mi | 100Mi |
| `nodefs.available` | 节点根分区可用 | 10% | 5% |
| `nodefs.inodesFree` | 节点 inode 可用 | 5% | 5% |
| `imagefs.available` | 镜像存储可用 | 15% | 5% |
| `pid.available` | 可用 PID | — | 1000 |

### 驱逐优先级

```
驱逐排序（优先级从高到低驱逐）：

  1. BestEffort Pod（最优先驱逐）
  2. Burstable Pod 中超过资源请求用量的 Pod
  3. Guaranteed Pod（几乎不会被驱逐）

  同等级内：
  → 优先驱逐使用量超出请求量最多的 Pod
```

---

## 节点状态上报

Kubelet 定期向 API Server 上报节点状态，核心逻辑在 [`kubelet_node_status.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/kubelet_node_status.go)：

```go
// 默认每 10s 上报一次
func (kl *Kubelet) registerNode() error {
    // 1. 初始注册 Node
    node := &v1.Node{ObjectMeta: metav1.ObjectMeta{Name: kl.nodeName}}
    node.Status = kl.generateNodeStatus()
    _, err := kl.kubeClient.CoreV1().Nodes().Create(ctx, node, metav1.CreateOptions{})
}

// 心跳上报（Lease 方式，默认 10s）
func (kl *Kubelet) updateNodeStatus() error {
    // 1. 获取当前节点状态（资源使用、条件、地址等）
    node, _ := kl.kubeClient.CoreV1().Nodes().Get(ctx, kl.nodeName, ...)

    // 2. 更新 Conditions
    //    - Ready（节点是否正常）
    //    - MemoryPressure（内存压力）
    //    - DiskPressure（磁盘压力）
    //    - PIDPressure（PID 压力）
    //    - NetworkUnavailable（网络不可用）

    // 3. 更报容量和分配量
    node.Status.Capacity = kl.containerManager.GetNodeAllocatable()
    node.Status.Allocatable = kl.containerManager.GetNodeAllocatable()

    // 4. 通过 Lease 快速心跳
    kl.leaseManager.Update(ctx, node)
}
```

```
心跳机制（两种）：

  ┌─────────────────┐         ┌──────────────┐
  │   Kubelet        │         │  API Server   │
  │                  │         │               │
  │  Node Status     │── 10s → │  Node 对象更新 │ ← 完整状态
  │  (更新 Conditions) │        │               │
  │                  │         │               │
  │  Node Lease      │── 10s → │  Lease 对象   │ ← 轻量心跳
  │  (仅 renewTime)  │         │  (coordination.k8s.io/lease)
  └─────────────────┘         └──────────────┘

  节点失联判定：
  ├── Lease 超过 40s 未更新 → 栀 node.kubernetes.io/unreachable
  └── Controller Manager 标记 NotReady + 驱逐 Pod（--pod-eviction-timeout）
```

---

## Kubelet HTTP API

Kubelet 在 10250 端口提供 HTTP/HTTPS API，实现在 [`server/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet/server)：

| 端点 | 方法 | 认证 | 功能 |
|------|------|------|------|
| `/pods` | GET | 是 | 列出本节点所有 Pod |
| `/runningpods` | GET | 是 | 列出运行中的 Pod |
| `/run/<ns>/<pod>/<container>` | POST | 是 | 在容器内执行命令 |
| `/exec/<ns>/<pod>/<container>` | GET/POST | 是 | 容器 exec（WebSocket） |
| `/attach/<ns>/<pod>/<container>` | GET/POST | 是 | 容器 attach |
| `/portForward/<ns>/<pod>` | GET/POST | 是 | 端口转发 |
| `/containerLogs/<ns>/<pod>/<container>` | GET | 是 | 获取容器日志 |
| `/stats/summary` | GET | 否 | 资源使用统计（cAdvisor） |
| `/metrics` | GET | 否 | Prometheus 指标 |
| `/healthz` | GET | 否 | 健康检查 |
| `/pods/status` | PUT | 是 | 更新 Pod 状态（kube-proxy） |

---

## Kubelet 组件协作全景

```
                         ┌──────────────┐
                         │  API Server  │
                         └──────┬───────┘
                                │ Watch (Pod/Node)
                    ┌───────────┼───────────┐
                    ▼           │           ▼
          ┌──────────────┐      │    ┌──────────────┐
          │ Pod 配置源    │      │    │  节点状态上报  │
          │ (config/)    │      │    │ (node_status) │
          └──────┬───────┘      │    └──────────────┘
                 │              │
                 ▼              │
    ┌────────────────────────────┴───────────────────────────┐
    │                    Kubelet syncLoop                      │
    │                                                         │
    │  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐ │
    │  │ config  │  │  pleg   │  │ syncLoop │  │ housekeep│ │
    │  │  源     │  │  事件   │  │   迭代   │  │  定时    │ │
    │  └────┬────┘  └────┬────┘  └────┬─────┘  └────┬─────┘ │
    │       └─────────────┴───────────┴─────────────┘       │
    │                          │                              │
    │                    dispatchWork()                       │
    │                          │                              │
    │              ┌───────────▼───────────┐                  │
    │              │    podWorkers          │                  │
    │              │  ┌─ Pod A (goroutine) │                  │
    │              │  ├─ Pod B (goroutine) │                  │
    │              │  └─ Pod C (goroutine) │                  │
    │              └───────────┬───────────┘                  │
    └──────────────────────────┼──────────────────────────────┘
                               │ syncPod()
                    ┌──────────┼──────────────────────────┐
                    ▼          ▼                           ▼
          ┌──────────────┐  ┌──────────────┐    ┌──────────────┐
          │ VolumeManager│  │   CRI        │    │ ProbeManager │
          │ (挂载/卸载卷)  │  │ (创建/启动   │    │ (存活/就绪   │
          │              │  │  容器)       │    │  探针)       │
          └──────────────┘  └──────┬───────┘    └──────┬───────┘
                                   │                   │
                          ┌────────┴────────┐         │
                          ▼                 ▼         │
                 ┌──────────────┐  ┌──────────────┐   │
                 │ContainerMgr  │  │   Status     │◄──┘
                 │ (cgroup/CPU  │  │  Manager     │
                 │  /设备/内存)  │  │ (上报 Pod    │
                 └──────────────┘  │  状态到 API)  │
                                   └──────────────┘
```

---

## 关键设计模式

### 1. 声明式 Reconcile 循环

```go
// syncLoop 每次迭代都对比期望状态和实际状态
func (kl *Kubelet) syncLoopIteration(...) {
    // 从多个 channel 读取事件
    select {
    case update := <-kl.podConfig.Updates():
        // Pod 配置变更 → dispatchWork
    case e := <-kl.pleg.Watch():
        // PLEG 检测到容器状态变化 → dispatchWork
    case <-housekeeping:
        // 定时清理
    }
}

// 不管事件来源如何，最终都走 syncPod()
// syncPod 从缓存读取最新状态而非依赖事件数据
```

### 2. 每 Pod 独立 Worker 隔离

```go
// 每 Pod 独立 goroutine，避免慢 Pod 阻塞其他 Pod
// Pod A 的 syncPod 耗时 30s 不会阻塞 Pod B 的处理
go p.podWorkerLoop(uidA, chA)   // Pod A worker
go p.podWorkerLoop(uidB, chB)   // Pod B worker
go p.podWorkerLoop(uidC, chC)   // Pod C worker
```

### 3. PLEG 事件驱动（避免盲轮询）

```go
// Generic PLEG：用 relist 轮询代替每容器单独轮询
// 通过对比新旧状态，仅在变化时生成事件
// syncLoop 收到事件后 dispatchWork，避免不必要的同步
```

### 4. 多级缓存与最终一致性

```
  API Server (etcd)
       │
       ▼ Watch
  Pod Informer (本地缓存)          ← podLister
       │
       ▼ syncLoop
  Pod Status Cache (kubecontainer.Cache)  ← PLEG 维护
       │
       ▼ CRI
  Container Runtime (真实容器状态)
```

---

## 学习路径建议

```
第一步：理解整体架构
  ├── Kubelet 是什么（节点 Agent，非集群级组件）
  ├── syncLoop 主循环（事件驱动 + Reconcile）
  └── Pod 从 API Server 到容器的完整链路

第二步：从入口追踪
  ├── cmd/kubelet/kubelet.go → main()
  ├── app/server.go → Run() → RunKubelet()
  ├── kubelet.go → NewMainKubelet() → Run()
  └── 关注 Run() 中启动的各个子系统

第三步：精读 Pod 生命周期
  ├── kubelet.go → syncPod()（核心方法）
  ├── pod_workers.go → UpdatePod() + podWorkerLoop()
  ├── kuberuntime_manager.go → 创建 Sandbox + 容器
  └── 追踪 CRI 调用链：RunPodSandbox → PullImage → CreateContainer → StartContainer

第四步：理解状态感知
  ├── pleg/generic.go → relist() 轮询机制
  ├── pleg/evented.go → 事件驱动 PLEG（新特性）
  ├── prober/manager.go → 探针管理
  └── status/manager.go → 状态上报 API Server

第五步：深入子系统
  ├── cm/ → cgroup v1/v2、CPU/内存/设备管理
  ├── volumemanager/ → 卷 Attach/Mount/Unmount
  ├── eviction/ → 资源压力驱逐策略
  └── network/ → CNI 插件调用

第六步：扩展实践
  ├── 编写 CRI shim（实现 RuntimeService + ImageService）
  ├── 编写 CNI 插件（实现 CmdAdd/CmdDel）
  ├── 编写 Device Plugin（gRPC 设备分配）
  └── 阅读 Kubelet 性能优化提案（PLEG → Evented PLEG）
```

---

## Reference

[kubelet 源码入口](https://github.com/kubernetes/kubernetes/tree/master/cmd/kubelet)

[pkg/kubelet 核心实现](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet)

[CRI 容器运行时实现](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet/kuberuntime)

[PLEG 源码](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet/pleg)

[容器管理器源码](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet/cm)

[卷管理器源码](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet/volumemanager)

[Kubelet 官方文档](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/)

[CRI 规范](https://github.com/kubernetes/cri-api/blob/master/pkg/apis/runtime/v1/api.proto)

[Evented PLEG KEP](https://github.com/kubernetes/enhancements/tree/master/keps/sig-node/3327-evented-pleg)

[Kubelet 架构文档](https://kubernetes.io/docs/concepts/architecture/nodes/)

[探针配置文档](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
