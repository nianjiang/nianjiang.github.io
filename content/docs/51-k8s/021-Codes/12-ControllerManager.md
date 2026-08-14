---
weight: 12
title: "Controller Manager"
---

# Kubernetes Controller Manager 代码结构

> 仓库地址：[cmd](https://github.com/kubernetes/kubernetes/tree/master/cmd/kube-controller-manager)，[pkg](https://github.com/kubernetes/kubernetes/tree/master/pkg/controller)
---

## 整体代码布局

```
kubernetes/
├── cmd/kube-controller-manager/          # 入口：二进制启动命令
│   ├── controller-manager.go             # main() 入口
│   ├── app/                              # 应用初始化、控制器注册
│   │   ├── controllermanager.go          # ControllerManager 启动核心
│   │   ├── controller_descriptor.go      # 控制器描述符（注册表）
│   │   ├── core.go                       # 核心控制器初始化（Node/Route/Service...）
│   │   ├── apps.go                       # 工作负载控制器（Deployment/StatefulSet/DaemonSet）
│   │   ├── batch.go                      # 批处理控制器（Job/CronJob）
│   │   ├── autoscaling.go                # 弹性伸缩控制器（HPA）
│   │   ├── networking.go                 # 网络控制器（Endpoint/EndpointSlice）
│   │   ├── rbac.go                       # RBAC 控制器（Role/RoleBinding）
│   │   ├── service_accounts.go           # ServiceAccount 控制器
│   │   ├── certificates.go               # 证书签名控制器
│   │   ├── discovery.go                  # Discovery 控制器
│   │   ├── policy.go                     # 策略控制器
│   │   ├── scheduling.go                 # 调度控制器
│   │   ├── resource.go                   # 资源控制器（PV/PVC/StorageClass）
│   │   ├── options/                      # 命令行选项解析
│   │   └── config/                       # 配置结构体
│   └── names/                            # 控制器名称常量
│
└── pkg/controller/                       # 核心实现（所有控制器逻辑）
    ├── controller_ref_manager.go         # ControllerRef 管理（OwnerReference）
    ├── controller_utils.go               # 通用工具函数
    ├── inroute.go                        # Informer 路由
    ├── nodeipcolcontroller/              # Node IP CIDR 控制器
    │
    ├── node/                             # Node 生命周期控制器
    │   ├── node_controller.go            # 节点状态监控
    │   ├── lifecycle_controller.go       # 节点生命周期
    │   └── ipam/                         # 节点 IPAM
    │
    ├── route/                            # 路由控制器（云平台 Pod CIDR 路由）
    ├── service/                          # Service 控制器（LoadBalancer 管理）
    ├── endpoint/                         # Endpoint 控制器
    │   └── endpointslice/               # EndpointSlice 控制器
    │
    ├── deployment/                       # Deployment 控制器
    ├── statefulset/                      # StatefulSet 控制器
    ├── daemon/                           # DaemonSet 控制器
    ├── replica/                          # ReplicaSet 控制器
    ├── job/                              # Job 控制器
    ├── cronjob/                          # CronJob 控制器
    │
    ├── podgc/                            # Pod 垃圾回收控制器
    ├── namespace/                        # Namespace 生命周期控制器
    ├── serviceaccount/                   # ServiceAccount 控制器
    ├── ttl/                              # TTL 控制器
    ├── resourcequota/                    # 资源配额控制器
    ├── nodelifecycle/                    # 节点生命周期控制器
    └── cloud/                            # Cloud Provider 控制器
```

---

## 核心文件解析

### 1. [`controller-manager.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-controller-manager/controller-manager.go) — 入口

```go
func main() {
    command := app.NewControllerManagerCommand()
    code := cli.Run(command)
    os.Exit(code)
}
```

**核心逻辑**：`main()` 极其简单，创建 cobra Command 并执行。所有逻辑在 `app/` 包中。

---

### 2. [`app/controllermanager.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-controller-manager/app/controllermanager.go) — 启动核心

这是 Controller Manager 最重要的文件，负责：
- 解析命令行参数
- 构建 `Config` 对象（含 kubeclient、informers）
- 创建 `ControllerContext`
- 启动所有控制器

```go
func NewControllerManagerCommand() *cobra.Command {
    s, err := options.NewKubeControllerManagerOptions()
    cmd := &cobra.Command{
        Use: "kube-controller-manager",
        Run: func(cmd *cobra.Command, args []string) {
            c, err := s.Config(KnownControllers(), ControllersDisabledByDefault.List())
            Run(c.Complete(), wait.NeverStop)
        },
    }
    fs := cmd.Flags()
    s.AddFlags(fs)  // 注册所有命令行参数
    return cmd
}
```

**启动流程：**

```
main()
  └── NewControllerManagerCommand()
        └── s.Config()          // 构建 Config
              └── Run()          // 启动
                    └── CreateControllerContext()   // 创建上下文
                          └── StartControllers()    // 启动所有控制器
                                └── for each controller:
                                      ├── NewController(ctx)  // 实例化
                                      └── controller.Run(ctx) // 运行
```

---

### 3. [`app/controller_descriptor.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-controller-manager/app/controller_descriptor.go) — 控制器注册表

所有内置控制器通过 `controllerDescriptors` 注册：

```go
var controllerDescriptors = []ControllerDescriptor{
    {name: "nodeipam", aliases: []string{"nodeipamcontroller"}, initFunc: startNodeIpamController},
    {name: "nodelifecycle", aliases: []string{"nodelifecyclecontroller"}, initFunc: startNodeLifecycleController},
    {name: "route", aliases: []string{"routecontroller"}, initFunc: startRouteController},
    {name: "service", aliases: []string{"servicecontroller"}, initFunc: startServiceController},
    {name: "deployment", aliases: []string{"deploymentcontroller"}, initFunc: startDeploymentController},
    {name: "replicaset", aliases: []string{"replicasetcontroller"}, initFunc: startReplicaSetController},
    {name: "statefulset", aliases: []string{"statefulsetcontroller"}, initFunc: startStatefulSetController},
    {name: "daemonset", aliases: []string{"daemonsetcontroller"}, initFunc: startDaemonSetController},
    {name: "job", aliases: []string{"jobcontroller"}, initFunc: startJobController},
    {name: "cronjob", aliases: []string{"cronjobcontroller"}, initFunc: startCronJobController},
    {name: "endpoint", aliases: []string{"endpoint"}, constructor: newEndpointsController},
    {name: "endpointslice", aliases: []string{"endpointslice"}, constructor: newEndpointSliceController},
    {name: "endpointslicemirroring", aliases: []string{"endpointslicemirroring"}, constructor: newEndpointSliceMirroringController},
    {name: "horizontalpodautoscaling", aliases: []string{"hpacontroller"}, initFunc: startHPAController},
    {name: "podgc", aliases: []string{"podgccontroller"}, initFunc: startPodGCController},
    {name: "namespace", aliases: []string{"namespacecontroller"}, initFunc: startNamespaceController},
    {name: "serviceaccount", aliases: []string{"serviceaccountcontroller"}, initFunc: startServiceAccountController},
    {name: "ttl", aliases: []string{"ttlcontroller"}, initFunc: startTTLController},
    {name: "resourcequota", aliases: []string{"resourcequotacontroller"}, initFunc: startResourceQuotaController},
    {name: "persistentvolume-binder", aliases: []string{"persistentvolumebinder"}, initFunc: startPVBinderController},
    // ...
}
```

**每个描述符包含三个关键字段：**

| 字段 | 说明 |
|------|------|
| `name` | 控制器名称，对应 `--controllers` 参数 |
| `aliases` | 别名列表 |
| `initFunc` | 初始化函数，接收 `ControllerContext`，返回 `Controller` |

---

### 4. [`app/core.go`](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-controller-manager/app/core.go) — 核心控制器初始化

每个 `.go` 文件按功能分组，包含同组控制器的 `initFunc` 实现：

```go
// 以 Node Lifecycle Controller 为例
func startNodeLifecycleController(ctx ControllerContext) (controller.Interface, bool, error) {
    nc, err := nodelifecycle.NewNodeLifecycleController(
        ctx.InformerFactory.Core().V1().Pods(),          // Pod Informer
        ctx.InformerFactory.Core().V1().Nodes(),         // Node Informer
        ctx.ClientBuilder.ClientOrDie("node-controller"), // kubeclient
        ctx.ComponentConfig.KubeCloudShared,              // 云配置
        ctx.ComponentConfig.NodeLifecycleController,      // 控制器配置
    )
    go nc.Run(ctx.Stop)  // 启动控制器
    return nc, true, nil
}
```

**分组规则：**

| 文件 | 控制器 | 职责 |
|------|--------|------|
| `core.go` | Node、Route、Service、Endpoint、NodeIPAM | 集群核心基础设施 |
| `apps.go` | Deployment、ReplicaSet、StatefulSet、DaemonSet | 工作负载管理 |
| `batch.go` | Job、CronJob | 批处理任务 |
| `autoscaling.go` | HPA | 弹性伸缩 |
| `networking.go` | EndpointSlice、Service | 网络服务发现 |
| `rbac.go` | RoleBinding、ClusterRoleBinding | RBAC 权限同步 |
| `service_accounts.go` | ServiceAccount | SA 自动创建 |
| `certificates.go` | CSR 签名 | 证书自动签发 |
| `resource.go` | PV、PVC、StorageClass | 存储资源绑定 |
| `policy.go` | PodDisruptionBudget | 中断预算保护 |

---

## Controller 的通用运行模式

所有控制器遵循相同的 **Informer + WorkQueue** 模式：

```
┌──────────────────────────────────────────────────────────────────┐
│                     Controller 运行模式                          │
│                                                                  │
│  ┌─────────────┐    Watch     ┌──────────────────┐              │
│  │ API Server  │ ──────────→  │   Informer        │              │
│  │             │ ←──────────  │  (ListAndWatch)  │              │
│  └─────────────┘   Reconcile  └────────┬─────────┘              │
│                                         │ 事件回调                │
│                                         ↓                        │
│                                ┌──────────────────┐              │
│                                │  EventHandler     │              │
│                                │  OnAdd/OnUpdate/ │              │
│                                │  OnDelete         │              │
│                                └────────┬─────────┘              │
│                                         │ 入队 key               │
│                                         ↓                        │
│                                ┌──────────────────┐              │
│                                │  WorkQueue        │              │
│                                │  (RateLimited)   │              │
│                                └────────┬─────────┘              │
│                                         │ 出队 key               │
│                                         ↓                        │
│                                ┌──────────────────┐              │
│                                │  reconcile()      │              │
│                                │  1. 从缓存读取对象 │              │
│                                │  2. 比对期望状态   │              │
│                                │  3. 调 API 修正    │              │
│                                │  4. 处理错误/重试  │              │
│                                └──────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

### [以 Deployment Controller 为例](https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/deployment/deployment_controller.go#L67C6-L67C26)， [syncHandler](https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/deployment/deployment_controller.go#L574)

```go
// pkg/controller/deployment/deployment_controller.go

type DeploymentController struct {
    rsLister       appslisters.ReplicaSetLister      // RS 缓存（从 Informer）
    podLister      corelisters.PodLister             // Pod 缓存
    dLister        appslisters.DeploymentLister      // Deployment 缓存
    queue          workqueue.RateLimitingInterface    // 工作队列
    eventRecorder  record.EventRecorder              // 事件记录
}

// Run 启动 N 个 worker 并发处理
func (dc *DeploymentController) Run(workers int, stopCh <-chan struct{}) {
    for i := 0; i < workers; i++ {
        go wait.Until(dc.worker, time.Second, stopCh)
    }
}

// worker 不断从队列取 key 并调用 reconcile
func (dc *DeploymentController) worker() {
    for dc.processNextWorkItem() {
    }
}

// processNextWorkItem 取出 key → 调用 syncHandler
func (dc *DeploymentController) processNextWorkItem() bool {
    key, quit := dc.queue.Get()
    defer dc.queue.Done(key)

    err := dc.syncHandler(key.(string))   // 核心 reconcile 逻辑
    if err != nil {
        dc.queue.AddRateLimited(key)       // 失败则重新入队（限速）
    } else {
        dc.queue.Forget(key)
    }
    return true
}

// syncHandler 核心协调逻辑
func (dc *DeploymentController) syncHandler(key string) error {
    // 1. 从缓存获取 Deployment
    deployment, err := dc.dLister.Deployments(namespace).Get(name)

    // 2. 获取关联的 ReplicaSet
    rsList, err := dc.getReplicaSetsForDeployment(d)

    // 3. 比较期望副本数 vs 实际副本数
    //    - 如果 RS 不存在 → 创建
    //    - 如果 RS 副本数不匹配 → 更新
    //    - 如果 RS 数量过多 → 清理旧版本

    // 4. 调 API Server 修正
    dc.client.AppsV1().ReplicaSets(namespace).Create(...)
    dc.client.AppsV1().ReplicaSets(namespace).Update(...)
}
```

---

## ControllerContext — 控制器的共享依赖

所有控制器通过 `ControllerContext` 获取共享资源，避免重复创建：

```go
type ControllerContext struct {
    ClientBuilder      clientbuilder.ControllerClientBuilder  // kubeclient
    InformerFactory    informers.SharedInformerFactory         // 共享 Informer
    ComponentConfig    kubeschedulerconfig.KubeSchedulerConfiguration
    Stop               <-chan struct{}
    InformersStarted   chan struct{}
    ResyncInterval     time.Duration
}
```

```
ControllerManager 启动时：
  ├── 创建一个 SharedInformerFactory
  ├── 所有控制器共用同一个 InformerFactory
  │   ├── Deployment Informer（Deployment Controller 使用）
  │   ├── Pod Informer（Deployment / DaemonSet / Job 共用）
  │   ├── Node Informer（Node Controller 使用）
  │   └── Service Informer（Service Controller 使用）
  │
  └── 每个 Informer 只 List/Watch 一次，多个 Controller 共享缓存
```

---

## 内置控制器全览

### 按功能分类

| 分类 | 控制器名称 | `--controllers` 参数值 | 职责 |
|------|-----------|----------------------|------|
| **节点** | Node Lifecycle | `nodelifecycle` | 监控节点状态，标记 NotReady，驱逐 Pod |
| | Node IPAM | `nodeipam` | 为节点分配 Pod CIDR |
| | Route | `route` | 在云平台为 Pod CIDR 配置路由 |
| **服务** | Service | `service` | 管理 LoadBalancer 类型 Service 的云 LB |
| | Endpoint | `endpoint` | 维护 v1/Endpoints（已被 EndpointSlice 替代，仅兼容保留） |
| | EndpointSlice | `endpointslice` | 维护 EndpointSlice（**主推方案**，GA since v1.21） |
| | EndpointSlice Mirroring | `endpointslicemirroring` | 将旧 Endpoints 镜像到 EndpointSlice（过渡期兼容桥接） |
| **工作负载** | Deployment | `deployment` | 管理 ReplicaSet 版本滚动 |
| | ReplicaSet | `replicaset` | 维护 Pod 副本数 |
| | StatefulSet | `statefulset` | 有状态应用管理 |
| | DaemonSet | `daemonset` | 每节点运行一个 Pod |
| **批处理** | Job | `job` | 运行至完成的任务 |
| | CronJob | `cronjob` | 定时任务 |
| **弹性** | HPA | `horizontalpodautoscaling` | 基于 CPU/内存/自定义指标自动伸缩 |
| **垃圾回收** | Pod GC | `podgc` | 清理 Terminated/Failed Pod |
| | TTL | `ttl` | 按 TTL 清理资源 |
| **存储** | PV Binder | `persistentvolume-binder` | PV/PVC 绑定 |
| | StorageClass | `storageprotection` | 存储保护策略 |
| **安全** | ServiceAccount | `serviceaccount` | Namespace 自动创建 SA |
| | CSR | `certificatesigningrequest` | 证书签名请求处理 |
| | Root CA | `root-ca-cert-publisher` | 发布 Root CA ConfigMap |
| **RBAC** | RoleBinding | `rolebinding` | RBAC 权限同步 |
| **配额** | ResourceQuota | `resourcequota` | Namespace 资源配额 |
| | Namespace | `namespace` | Namespace 生命周期 |
| | PodDisruptionBudget | `poddisruptionbudget` | 中断预算保护 |
| | ServiceAccount Token | `serviceaccount-token` | SA Token 自动创建 |

### 启用/禁用控制器

```bash
# 只启动 deployment 和 replicaset 控制器
kube-controller-manager --controllers=deployment,replicaset

# 启动所有，但禁用 daemonset 和 job
kube-controller-manager --controllers=*,daemonset=false,job=false

# 查看所有可用控制器名称
kube-controller-manager --help | grep controllers
```

---

## --controllers 参数与 initFunc 映射

```
--controllers=deployment
       ↓ 匹配 controllerDescriptors[].name
       ↓
controllerDescriptors 中找到 {name: "deployment", initFunc: startDeploymentController}
       ↓
调用 startDeploymentController(ctx ControllerContext)
       ↓
app/apps.go: startDeploymentController()
       ↓
pkg/controller/deployment/deployment_controller.go: NewDeploymentController()
       ↓
dc.Run(workers=2)  ← 启动 2 个 worker goroutine
```

---

## 关键设计模式

### 1. Level-Triggered（电平触发）而非 Edge-Triggered

```go
// ❌ Edge-Triggered（错误方式）：
// 只在事件发生时处理一次，如果处理失败状态就丢失了
func OnUpdate(old, new *Deployment) {
    syncDeployment(new)  // 失败就丢失了
}

// ✅ Level-Triggered（Kubernetes 方式）：
// 事件只负责入队，reconcile 时从缓存读最新状态
func OnUpdate(old, new *Deployment) {
    enqueueDeployment(new)  // 只入队 key
}

func reconcile(key string) {
    deployment := cache.Get(key)  // 从 Informer 缓存读取最新状态
    // 即使多次 Update 事件，reconcile 只处理最终状态
}
```

### 2. 乐观锁（ResourceVersion）

```go
// 多个 Controller 可能同时修改同一对象
// 通过 ResourceVersion 实现乐观并发控制

func updateDeployment(d *appsv1.Deployment) error {
    d.Spec.Replicas = 5
    _, err := client.AppsV1().Deployments(ns).Update(ctx, d, metav1.UpdateOptions{})
    if errors.IsConflict(err) {
        // ResourceVersion 不匹配，说明已被其他人修改
        // 重新 GET 后重试
    }
}
```

### 3. 最终一致性

```
用户创建 Deployment (replicas=3)
    │
    ↓ API Server 写入 etcd
    │
    ↓ Informer Watch 到事件
    │
    ↓ 入队 key "default/my-app"
    │
    ↓ reconcile 读取 Deployment（replicas=3）
    │
    ↓ 发现没有 ReplicaSet → 创建 RS（replicas=3）
    │
    ↓ RS Controller Watch 到 RS 事件
    │
    ↓ RS reconcile 发现没有 Pod → 创建 3 个 Pod
    │
    ↓ Scheduler Watch 到 Pod → 调度到 Node
    │
    ↓ Kubelet Watch 到 Pod → 启动容器

最终状态：3 个 Pod Running ✅
```

---

## 学习路径建议

```
第一步：理解设计模式
  ├── Informer 机制（ListAndWatch + 本地缓存）
  ├── WorkQueue（限速重试队列）
  └── Reconcile 循环（期望状态 vs 实际状态）

第二步：从入口追踪
  ├── controller-manager.go → main()
  ├── controllermanager.go → Run() → StartControllers()
  └── controller_descriptor.go → initFunc 注册表

第三步：精读一个控制器
  ├── deployment_controller.go（最经典）
  │   ├── NewDeploymentController() → 初始化
  │   ├── Run() → 启动 worker
  │   └── syncHandler() → reconcile 逻辑
  └── 关注 OwnerReference 链：Deployment → RS → Pod

第四步：对比其他控制器
  ├── ReplicaSet Controller（最简单，理解 Pod 副本管理）
  ├── StatefulSet Controller（理解有状态管理的复杂性）
  └── Node Lifecycle Controller（理解云平台集成）

第五步：扩展实践
  ├── 使用 kubebuilder 编写自定义控制器
  ├── 对比 client-go informer 与 controller-runtime
  └── 阅读 Operator 最佳实践
```

---

## Reference

[kube-controller-manager 源码](https://github.com/kubernetes/kubernetes/tree/master/cmd/kube-controller-manager)

[pkg/controller 源码](https://github.com/kubernetes/kubernetes/tree/master/pkg/controller)

[client-go Informer 机制](https://pkg.go.dev/k8s.io/client-go/tools/cache)

[client-go WorkQueue](https://pkg.go.dev/k8s.io/client-go/util/workqueue)

[Kubernetes Controller Manager 文档](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/)

[kubebuilder 教程](https://book.kubebuilder.io/)

[Kubernetes 控制器模式详解](https://kubernetes.io/docs/concepts/architecture/controller/)

[]()

[]()

[]()