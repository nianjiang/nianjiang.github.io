---
weight: 1
title: "Codes Architecture"
---

# Kubernetes 代码架构总览

> 仓库地址：[github.com/kubernetes/kubernetes](https://github.com/kubernetes/kubernetes)
>
> 当前版本：v1.33（2025/04 Release）

---

## 顶层目录结构

```
kubernetes/
├── build/                  # 构建脚本与工具链
│   ├── build-image/        # 构建用 Docker 镜像
│   ├── lib/                # 构建辅助 shell 函数
│   └── make-rules/         # Makefile 子规则
│
├── cmd/                    # 所有二进制入口（每个子目录 = 一个可执行文件）
│   ├── kube-apiserver/     # API Server
│   ├── kube-controller-manager/  # Controller Manager
│   ├── kube-scheduler/     # Scheduler
│   ├── kubelet/            # Kubelet
│   ├── kube-proxy/         # kube-proxy
│   ├── kubectl/            # kubectl CLI
│   ├── kubeadm/            # 集群引导工具
│   ├── cloud-controller-manager/ # Cloud Controller Manager
│   ├── kubemark/           # 性能测试用假 Kubelet
│   └── ...                 # 代码生成、校验工具
│
├── pkg/                    # 核心业务逻辑（非公开库，不保证 API 稳定性）
│   ├── kubeapiserver/      # API Server 核心实现
│   ├── controlplane/       # 控制面组装（API Server 实例配置）
│   ├── registry/           # REST Storage 实现（etcd 读写）
│   ├── controller/         # 所有内置 Controller 实现
│   ├── scheduler/          # Scheduler 核心实现
│   ├── kubelet/            # Kubelet 核心实现
│   ├── proxy/              # kube-proxy 核心实现
│   ├── kubectl/            # kubectl 命令实现
│   ├── apis/               # 内部 API 类型定义（与 staging 的公开版本对应）
│   ├── api/                # 核心 API（v1）内部版本
│   ├── auth/               # 认证/授权逻辑
│   ├── admission/          # Admission 插件
│   ├── volume/             # Volume 插件
│   ├── features/           # Feature Gate 定义
│   ├── security/           # 安全策略
│   ├── serviceaccount/     # ServiceAccount 逻辑
│   ├── quota/              # 资源配额
│   ├── routes/             # HTTP 路由（metrics, healthz 等）
│   ├── util/               # 工具函数
│   └── generated/          # 自动生成的代码（clientset、informer、lister）
│
├── staging/src/k8s.io/     # 以独立模块发布的库（通过 go.mod 独立版本化）
│   ├── api/                # 核心 API 类型（v1, apps/v1, batch/v1 ...）
│   ├── apimachinery/       # API 元数据基础设施（TypeMeta, ObjectMeta, runtime ...）
│   ├── apiserver/          # 通用 API Server 框架
│   ├── client-go/          # Go 客户端库
│   ├── cli-runtime/        # CLI 运行时框架
│   ├── kubectl/            # kubectl 逻辑（从 cmd 中拆出）
│   ├── kubelet/            # Kubelet API 定义
│   ├── kube-scheduler/     # Scheduler API 定义
│   ├── kube-controller-manager/ # CM API 定义
│   ├── kube-aggregator/    # API Aggregation 层
│   ├── cloud-provider/     # Cloud Provider 接口
│   ├── code-generator/     # 代码生成器
│   ├── component-base/     # 组件公共基础（config, logging, metrics）
│   ├── controller-manager/ # Controller Manager 公共库
│   ├── cri-api/            # CRI 接口定义
│   ├── cri-client/         # CRI 客户端
│   ├── dynamic-resource-allocation/ # DRA（动态资源分配）
│   ├── endpointslice/      # EndpointSlice 控制器逻辑
│   ├── metrics/            # Metrics 公共库
│   ├── mount-utils/        # 挂载工具
│   ├── pod-security-admission/ # Pod 安全准入
│   ├── sample-apiserver/   # 示例 API Server
│   ├── sample-controller/  # 示例 Controller
│   └── ...
│
├── vendor/                 # 第三方依赖（vendor 模式）
├── hack/                   # 开发者脚本（update-codegen.sh, verify-all.sh 等）
├── test/                   # 集成测试、E2E 测试
├── plugin/                 # 插件（认证、网络等）
├── third_party/            # 第三方代码（fork）
├── LICENSES                # 许可证信息
├── Makefile                # 顶层构建入口
├── go.mod                  # Go Module 定义
└── go.sum                  # 依赖校验
```

---

## 二进制入口（`cmd/`）

Kubernetes 的所有可执行二进制文件都从 `cmd/` 目录开始，每个子目录对应一个组件：

| 二进制 | 入口文件 | 核心实现 | 说明 |
|--------|---------|---------|------|
| kube-apiserver | [`cmd/kube-apiserver/apiserver.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-apiserver/apiserver.go) | [`pkg/kubeapiserver/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubeapiserver/) | API Server 主进程 |
| kube-controller-manager | [`cmd/kube-controller-manager/controller-manager.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-controller-manager/controller-manager.go) | [`pkg/controller/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/controller/) | 控制器管理器 |
| kube-scheduler | [`cmd/kube-scheduler/scheduler.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-scheduler/scheduler.go) | [`pkg/scheduler/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/scheduler/) | 调度器 |
| kubelet | [`cmd/kubelet/kubelet.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kubelet/kubelet.go) | [`pkg/kubelet/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet/) | 节点代理 |
| kube-proxy | [`cmd/kube-proxy/proxy.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-proxy/proxy.go) | [`pkg/proxy/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/proxy/) | 网络代理 |
| kubectl | [`cmd/kubectl/kubectl.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kubectl/kubectl.go) | [`staging/src/k8s.io/kubectl/`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/kubectl) | CLI 工具 |
| kubeadm | [`cmd/kubeadm/kubeadm.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kubeadm/kubeadm.go) | `cmd/kubeadm/app/` | 集群引导工具 |
| cloud-controller-manager | [`cmd/cloud-controller-manager/main.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/cloud-controller-manager/main.go) | 各云厂商实现 | 云控制器管理器 |

### 通用入口模式

所有 `cmd/` 的 `main()` 函数都极其简洁，遵循统一模式：

```go
// cmd/<component>/<component>.go
func main() {
    command := app.New<Component>Command()
    code := cli.Run(command)
    os.Exit(code)
}
```

实际逻辑全部委托给 `app/` 子包，通过 **cobra** 框架实现命令行解析。

---

## 核心包（`pkg/`）详解

### pkg 与 staging 的关系

```
pkg/                         staging/src/k8s.io/
├── apis/                    ├── api/           ← 公开 API 类型
│   ├── core/                │   (v1, apps/v1, batch/v1 ...)
│   ├── apps/
│   └── batch/               ├── apimachinery/  ← 元数据类型
├── api/  ─────────────────→ │   (TypeMeta, ObjectMeta, Scheme ...)
│                            │
├── kubeapiserver/           ├── apiserver/     ← 通用 API Server 框架
│                            │   (RESTHandler, Storage, Authentication ...)
├── controller/              ├── client-go/     ← Go 客户端库
│                            │   (Informers, WorkQueue, Lister ...)
├── scheduler/               ├── kube-scheduler/ ← Scheduler 配置 API
├── kubelet/                 ├── kubelet/       ← Kubelet API 定义
└── generated/               └── code-generator/ ← 代码生成器
```

**核心原则**：
- `pkg/` 存放 **Kubernetes 内部实现**，不保证 API 稳定性，不作为外部库使用
- `staging/` 存放 **可独立发布的库**，每个子目录有独立的 `go.mod`，通过版本化发布到 `k8s.io/*`

---

### 核心模块分类

#### 1. API Server 相关

| 包路径 | 职责 | 核心文件 |
|--------|------|----------|
| [`pkg/kubeapiserver/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubeapiserver/) | API Server 核心组装 | `options/`, `server/` |
| [`pkg/controlplane/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/controlplane/) | 控制面实例配置 | `instance.go` |
| [`pkg/registry/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/registry/) | REST Storage（etcd CRUD） | 每种资源一个子目录 |
| [`pkg/admission/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/admission/) | Admission 插件 | Webhook、策略执行 |
| [`pkg/auth/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/auth/) | 认证/授权 | RBAC、Node Authorizer |
| [`pkg/routes/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/routes/) | HTTP 路由注册 | `/healthz`, `/metrics`, `/readyz` |

#### 2. 控制器 & 调度

| 包路径 | 职责 | 核心文件 |
|--------|------|----------|
| [`pkg/controller/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/controller/) | 所有内置 Controller | 每种控制器一个子目录 |
| [`pkg/scheduler/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/scheduler/) | 调度器核心 | `scheduler.go`, `schedule_one.go` |
| [`pkg/scheduler/framework/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/scheduler/framework/) | 调度框架（插件系统） | `interface.go`, `plugins/` |

#### 3. 节点 & 网络

| 包路径 | 职责 | 核心文件 |
|--------|------|----------|
| [`pkg/kubelet/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubelet/) | Kubelet 核心 | `kubelet.go`, `syncLoop` |
| [`pkg/proxy/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/proxy/) | kube-proxy 实现 | `iptables/`, `ipvs/` |
| [`pkg/volume/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/volume/) | Volume 插件 | 每种插件一个子目录 |

#### 4. 公共基础设施

| 包路径 | 职责 | 说明 |
|--------|------|------|
| [`pkg/apis/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/apis/) | 内部 API 类型 | 包含 `internal` 版本（无序列化标签） |
| [`pkg/api/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/api/) | 核心 v1 API | Pod、Node、Service 等核心类型 |
| [`pkg/features/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/features/) | Feature Gate | 所有 Beta/GA 特性开关 |
| [`pkg/security/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/security/) | 安全策略 | PodSecurityContext |
| [`pkg/serviceaccount/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/serviceaccount/) | SA Token | JWT 签发与验证 |
| [`pkg/quota/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/quota/) | 资源配额 | ResourceQuota 评估 |

---

## Staging 库（`staging/src/k8s.io/`）

Staging 目录是 Kubernetes 的「**库中库**」架构，每个子目录都是独立版本化的 Go Module：

### 核心基础库

| 库 | 说明 | 典型使用者 |
|----|------|----------|
| [`api`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/api) | 所有 K8s API 类型定义 | 所有组件、外部项目 |
| [`apimachinery`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/apimachinery) | API 元数据（TypeMeta, ObjectMeta, runtime.Object, Scheme） | 所有组件 |
| [`client-go`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/client-go) | Go 客户端（Clientset, Informer, WorkQueue, Lister） | Controller, Operator |
| [`apiserver`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/apiserver) | 通用 API Server 框架（认证、授权、存储、序列化） | kube-apiserver, CRD Server |
| [`component-base`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/component-base) | 组件公共基础（日志、Metrics、Config、健康检查） | 所有控制面组件 |

### 组件专用库

| 库 | 说明 |
|----|------|
| [`kube-scheduler`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/kube-scheduler) | Scheduler 配置 API（KubeSchedulerConfiguration） |
| [`kube-controller-manager`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/kube-controller-manager) | CM 配置 API |
| [`kubelet`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/kubelet) | Kubelet API（CRI, Plugin Registration） |
| [`kube-aggregator`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/kube-aggregator) | API Aggregation 层（APIService 代理） |
| [`kubectl`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/kubectl) | kubectl 命令逻辑（已从 cmd 拆出） |
| [`cli-runtime`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/cli-runtime) | CLI 公共运行时（Builder, ResourcePrinter） |

### 扩展接口库

| 库 | 说明 |
|----|------|
| [`cri-api`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/cri-api) | 容器运行时接口（CRI protobuf/gRPC） |
| [`cri-client`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/cri-client) | CRI 客户端实现 |
| [`cloud-provider`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/cloud-provider) | 云厂商接口（CCM 插件化） |
| [`code-generator`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/code-generator) | 代码生成器（Clientset, Informer, Lister, DeepCopy） |
| [`dynamic-resource-allocation`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/dynamic-resource-allocation) | DRA 动态资源分配（GPU、FPGA 等） |
| [`pod-security-admission`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/pod-security-admission) | Pod 安全准入控制器 |

---

## Kubernetes API 类型体系

### API 分层架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        API 类型分层                                  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  k8s.io/api（staging）                                      │    │
│  │  公开 API 类型：带 JSON/protobuf 序列化标签                   │    │
│  │  core/v1, apps/v1, batch/v1, networking/v1, ...            │    │
│  └─────────────────────────┬───────────────────────────────────┘    │
│                             │ 对应                                   │
│  ┌─────────────────────────▼───────────────────────────────────┐    │
│  │  pkg/apis/（内部）                                           │    │
│  │  内部版本：无序列化标签，用于内部逻辑的中间表示                │    │
│  │  pkg/apis/core/, pkg/apis/apps/, pkg/apis/batch/            │    │
│  └─────────────────────────┬───────────────────────────────────┘    │
│                             │ 转换                                   │
│  ┌─────────────────────────▼───────────────────────────────────┐    │
│  │  pkg/registry/（REST Storage）                               │    │
│  │  负责 etcd 读写、验证、默认值填充、策略逻辑                   │    │
│  │  每种资源一个子目录：registry/core/pod/, registry/apps/...   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### API Group 结构

```
api/
├── core/v1/          # 核心组（Pod, Service, Node, Namespace, ConfigMap ...）
├── apps/v1/          # 应用组（Deployment, StatefulSet, DaemonSet, ReplicaSet）
├── batch/v1/         # 批处理组（Job, CronJob）
├── networking.k8s.io/v1/   # 网络组（Ingress, NetworkPolicy）
├── rbac.authorization.k8s.io/v1/ # RBAC（Role, ClusterRole, Binding）
├── storage.k8s.io/v1/      # 存储组（StorageClass, CSIDriver）
├── autoscaling/v2/         # 弹性伸缩组（HPA）
├── policy/v1/              # 策略组（PodDisruptionBudget）
├── admissionregistration.k8s.io/v1/ # 准入注册（Webhook）
├── coordination.k8s.io/v1/ # 协调组（Lease）
└── ...
```

---

## API Server 架构

API Server 是 Kubernetes 的**唯一数据入口**，所有组件都通过它读写资源：

```
┌──────────────────────────────────────────────────────────────────────┐
│                       kube-apiserver                                  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  AggregatorServer（API 聚合层）                                │  │
│  │  ├─ kubeAPIServer（核心 API: /api/v1, /apis/apps/v1 ...）     │  │
│  │  ├─ APIExtensionsServer（CRD: /apis/<group>/<version>/...）   │  │
│  │  └─ 外部 APIService（Metrics Server, Custom API ...）         │  │
│  └────────────────────────────┬───────────────────────────────────┘  │
│                               │                                      │
│  ┌────────────────────────────▼───────────────────────────────────┐  │
│  │  请求处理链                                                     │  │
│  │  Authentication → Authorization → Admission → Storage          │  │
│  │  (认证)           (鉴权)           (准入)      (存储)           │  │
│  └────────────────────────────┬───────────────────────────────────┘  │
│                               │                                      │
│  ┌────────────────────────────▼───────────────────────────────────┐  │
│  │  REST Storage（pkg/registry/）                                  │  │
│  │  每种资源的 CRUD + 业务逻辑                                     │  │
│  │  ├─ Create: 验证 → 默认值 → 策略 → 写入 etcd                   │  │
│  │  ├─ Update: 验证 → 策略 → 写入 etcd                            │  │
│  │  ├─ Delete: 策略（finalizer 检查）→ 标记删除 / 直接删除         │  │
│  │  └─ List/Watch: 从 etcd 读取 / 从缓存读取                      │  │
│  └────────────────────────────┬───────────────────────────────────┘  │
│                               │                                      │
│  ┌────────────────────────────▼───────────────────────────────────┐  │
│  │  etcd（唯一持久化存储）                                         │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### 三层 Server 组装

| Server | 职责 | 代码位置 |
|--------|------|----------|
| **AggregatorServer** | API 聚合代理，将请求路由到对应的后端 Server | [`staging/src/k8s.io/kube-aggregator/`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/kube-aggregator) |
| **kubeAPIServer** | 内置资源 API（`/api/v1`, `/apis/apps/v1` 等） | [`pkg/kubeapiserver/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/kubeapiserver/) |
| **APIExtensionsServer** | CRD 资源 API（`/apis/<custom-group>/<version>`） | [`staging/src/k8s.io/apiextensions-apiserver/`](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io/apiextensions-apiserver) |

---

## 核心组件启动流程

### kube-apiserver

```
main()
  └── NewAPIServerCommand()
        └── CreateServerChain()
              ├── CreateKubeAPIServerConfig()
              ├── CreateAPIExtensionsConfig()
              └── Aggregator 组装
                    └── Run()
                          └── 启动 HTTPS Server → 处理请求
```

### kube-controller-manager

```
main()
  └── NewControllerManagerCommand()
        └── Config()
              └── Run()
                    └── CreateControllerContext()
                          └── StartControllers()
                                └── 逐个启动 ~30 个 Controller
                                      └── controller.Run(ctx)
```

### kube-scheduler

```
main()
  └── NewSchedulerCommand()
        └── Setup()
              └── Run()
                    └── Scheduler.Run()
                          └── go scheduleOne()  ← 无限循环
```

### kubelet

```
main()
  └── NewKubeletCommand()
        └── Run()
              └── startKubelet()
                    ├── 初始化各 Manager（PLEG, Volume, Probe, Eviction...）
                    └── syncLoop()  ← 无限循环
                          └── syncPod()  ← 每个 Pod 的生命周期管理
```

---

## 核心设计模式

### 1. 声明式 API + 最终一致性

```
用户声明期望状态（YAML）
    │
    ↓ API Server 写入 etcd
    │
    ↓ Controller Watch 到变更
    │
    ↓ Reconcile：比较期望状态 vs 实际状态
    │
    ↓ 执行修正操作
    │
    ↓ 循环直到收敛
```

Kubernetes 不使用命令式操作，而是通过**控制循环**不断缩小期望与现实的差距。

### 2. Informer + WorkQueue 模式

```
┌────────────┐   Watch   ┌────────────┐   事件回调   ┌──────────┐
│ API Server │ ────────→ │  Informer  │ ──────────→ │WorkQueue │
│            │           │(本地缓存)   │             │(限速队列) │
└────────────┘           └────────────┘             └────┬─────┘
                                                         │ 出队
                                                         ↓
                                                    ┌──────────┐
                                                    │Reconcile │
                                                    │(协调逻辑) │
                                                    └──────────┘
```

所有 Controller 都遵循这一模式：
- **Informer**：ListAndWatch 获取资源变更，维护本地缓存
- **WorkQueue**：限速重试队列，保证事件不丢失
- **Reconcile**：从缓存读最新状态，执行修正操作

### 3. Level-Triggered（电平触发）

Controller 不依赖单次事件，而是每次 Reconcile 都读取**当前完整状态**，确保即使丢失事件也能自愈。

### 4. OwnerReference 链

```
Deployment (replicas=3)
    │ 拥有
    ├── ReplicaSet-v1 (replicas=2)
    │       │ 拥有
    │       ├── Pod-1
    │       └── Pod-2
    │
    └── ReplicaSet-v2 (replicas=1)
            │ 拥有
            └── Pod-3
```

通过 OwnerReference 实现级联删除、垃圾回收、状态上报。

### 5. Feature Gate（特性门控）

```go
// pkg/features/kube_features.go
const (
    // Beta 特性
    featureGates = map[featuregate.Feature]featuregate.FeatureSpec{
        SidecarContainers: {Default: true, PreRelease: featuregate.Beta},
        // ...
    }
)

// 使用时：
if utilfeature.DefaultFeatureGate.Enabled(features.SidecarContainers) {
    // 启用 Sidecar 逻辑
}
```

所有新特性通过 Feature Gate 控制启用/禁用，支持 Alpha → Beta → GA 渐进发布。

---

## 代码生成体系

Kubernetes 大量使用代码生成，减少样板代码：

| 生成器 | 输入 | 输出 | 说明 |
|--------|------|------|------|
| `deepcopy-gen` | API 类型定义 | `zz_generated.deepcopy.go` | DeepCopy 方法 |
| `client-gen` | API 类型定义 | `clientset/` | 类型安全的 Go 客户端 |
| `informer-gen` | API 类型定义 | `informers/` | Informer 封装 |
| `lister-gen` | API 类型定义 | `listers/` | 本地缓存 List/Get |
| `conversion-gen` | 内部/外部类型 | `zz_generated.conversion.go` | 版本转换函数 |
| `defaulter-gen` | 类型 + 默认值函数 | `zz_generated.defaults.go` | 默认值填充 |
| `openapi-gen` | API 类型定义 | OpenAPI Schema | API 文档生成 |

生成代码统一输出到 `pkg/generated/`，由 `hack/update-codegen.sh` 驱动。

---

## 组件间通信全景

```
┌──────────┐         ┌──────────────────────┐         ┌──────────┐
│  kubectl │ ──────→ │    kube-apiserver     │ ←────── │   etcd   │
│  (REST)  │         │  (唯一数据入口/出口)   │         │ (持久化) │
└──────────┘         └──────────┬───────────┘         └──────────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ kube-controller- │ │  kube-scheduler  │ │   kubelet        │
│    manager       │ │                  │ │                  │
│                  │ │ Watch Pending Pod│ │ Watch 绑定 Pod   │
│ Watch 资源变更   │ │ 调度 → Bind      │ │ 启动/停止容器    │
│ Reconcile 状态   │ │                  │ │ 上报 Node 状态   │
└──────────────────┘ └──────────────────┘ └────────┬─────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  Container       │
                                          │  Runtime (CRI)   │
                                          │  containerd/CRI-O│
                                          └──────────────────┘
```

**关键通信协议：**
- 所有组件 ↔ API Server：HTTPS + JSON/Protobuf（REST API）
- kubelet ↔ 容器运行时：gRPC（CRI 协议）
- kubelet ↔ CSI 插件：gRPC（CSI 协议）
- kubelet ↔ CNI 插件：命令行调用 / gRPC（CNI 协议）
- API Server ↔ etcd：gRPC（etcd v3 API）

---

## 构建系统

```bash
# 完整构建
make

# 快速构建（Docker 容器内交叉编译）
make quick-release

# 构建单个二进制
make WHAT=cmd/kubectl

# 运行单元测试
make test

# 运行集成测试
make test-integration

# 运行 E2E 测试
make test-e2e

# 代码生成
hack/update-codegen.sh

# 代码校验
hack/verify-all.sh
```

---

## 学习路径建议

```
第一步：理解整体架构
  ├── 顶层目录结构（cmd/, pkg/, staging/）
  ├── 组件间通信关系
  └── API 类型体系（staging/api → pkg/apis → pkg/registry）

第二步：掌握核心基础设施
  ├── client-go：Clientset, Informer, WorkQueue, Lister
  ├── apiserver：REST 框架, Storage, 认证/授权链
  └── 代码生成器：deepcopy, clientset, informer, lister

第三步：精读一个组件
  ├── 推荐从 Controller Manager 入手（模式最清晰）
  │   └── Deployment Controller（经典 Reconcile 循环）
  ├── 再读 Scheduler（调度框架，扩展点设计）
  └── 最后读 kubelet（最复杂，涉及 CRI, PLEG, 容器管理）

第四步：深入特定领域
  ├── API Server → pkg/kubeapiserver/ + pkg/registry/
  ├── 调度优化 → pkg/scheduler/framework/plugins/
  ├── 网络策略 → pkg/proxy/ + CNI 插件
  └── 存储卷   → pkg/volume/ + CSI 插件

第五步：扩展实践
  ├── 使用 kubebuilder / controller-runtime 编写 Operator
  ├── 对比 client-go 与 controller-runtime 的异同
  └── 阅读 KEP（Kubernetes Enhancement Proposal）了解演进
```

---

## 总结

| 维度 | 关键要点 |
|------|----------|
| 代码组织 | `cmd/` 入口 + `pkg/` 核心逻辑 + `staging/` 独立发布库 |
| 架构模式 | 声明式 API + Level-Triggered + 最终一致性 |
| Controller 模式 | Informer + WorkQueue + Reconcile 循环 |
| API 分层 | staging/api（公开类型）→ pkg/apis（内部版本）→ pkg/registry（REST 存储） |
| 插件体系 | Scheduler Framework, CRI, CNI, CSI, Cloud Provider, Admission Webhook |
| 通信协议 | REST/HTTPS（组件间）, gRPC（CRI/CSI/etcd）, ListWatch（Watch 机制） |
| 代码生成 | deepcopy, clientset, informer, lister, conversion, openapi |
| 特性管理 | Feature Gate（Alpha → Beta → GA 渐进发布） |

---

## Reference

[Kubernetes 仓库](https://github.com/kubernetes/kubernetes)

[pkg/ 目录](https://github.com/kubernetes/kubernetes/tree/master/pkg)

[cmd/ 目录](https://github.com/kubernetes/kubernetes/tree/master/cmd)

[staging/src/k8s.io/](https://github.com/kubernetes/kubernetes/tree/master/staging/src/k8s.io)

[Kubernetes 开发者文档](https://github.com/kubernetes/community/blob/master/contributors/devel/README.md)

[Kubernetes API Conventions](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md)

[Kubernetes 架构设计图](https://github.com/cloudnativeto/sig-kubernetes/blob/kubernetes-picture-book-v1.0/docs/SUMMARY.md)

[client-go 文档](https://pkg.go.dev/k8s.io/client-go)

[apiserver 库文档](https://pkg.go.dev/k8s.io/apiserver)

[KEP（Kubernetes Enhancement Proposal）](https://github.com/kubernetes/enhancements)

