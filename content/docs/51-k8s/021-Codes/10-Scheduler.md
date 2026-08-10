---
weight: 10
title: "Scheduler"
---


# Kubernetes Scheduler 代码结构

> 仓库地址：[github.com/kubernetes/kubernetes](https://github.com/kubernetes/kubernetes)

---

## 整体代码布局

```
kubernetes/
├── cmd/kube-scheduler/          # 入口：二进制启动命令
│   ├── scheduler.go             # main() 入口
│   └── app/                     # cobra 命令、选项解析、初始化
│
└── pkg/scheduler/               # 核心实现
    ├── scheduler.go             # Scheduler 主结构体 + Run()
    ├── schedule_one.go          # 单 Pod 调度完整流程
    ├── schedule_one_podgroup.go # PodGroup（批量调度）
    ├── eventhandlers.go         # Informer 事件处理
    ├── extender.go              # 外部扩展调度器
    │
    ├── framework/               # 调度框架（插件系统）
    │   ├── interface.go         # 所有扩展点接口定义
    │   ├── types.go             # 核心类型（NodeInfo、CycleState 等）
    │   ├── cycle_state.go       # 调度周期状态传递
    │   ├── runtime/             # 框架运行时（插件注册/调用）
    │   ├── plugins/             # 内置插件实现
    │   └── preemption/          # 抢占逻辑
    │
    ├── apis/config/             # KubeSchedulerConfiguration API
    ├── profile/                 # 多调度 Profile 支持
    ├── metrics/                 # Prometheus 指标
    ├── backend/                 # 调度队列后端
    ├── util/                    # 工具函数
    └── testing/                 # 测试工具
```

---

## 核心文件解析

### 1. [`scheduler.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/scheduler.go) — 主结构体与启动

```go
type Scheduler struct {
    Cache           internalcache.Cache       // 节点/Pod 缓存
    Extenders       []fwk.Extender            // 外部调度扩展
    NextEntity      func() (QueuedEntityInfo, error)  // 从队列取 Pod
    SchedulePod     func() (ScheduleResult, error)    // 核心调度函数
    FailureHandler  FailureHandlerFn                   // 失败处理
    SchedulingQueue internalqueue.SchedulingQueue      // 调度队列
    Profiles        profile.Map                        // 多 Profile
    StopEverything  <-chan struct{}                    // 停止信号
}

func (sched *Scheduler) Run(ctx context.Context) {
    sched.SchedulingQueue.Run(logger)  // 启动调度队列
    go wait.UntilWithContext(ctx, sched.scheduleOne, 0)  // 无限循环调度
}
```

**核心逻辑**：`Run()` 启动后不断调用 `scheduleOne()` 从队列取 Pod 并调度。

---

### 2. [`schedule_one.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go) — 单 Pod 调度完整生命周期

这是调度器最核心的文件，实现了完整的调度周期（Scheduling Cycle）：

```go
// scheduleOnePod 为单个 Pod 执行完整的调度流程。
func (sched *Scheduler) scheduleOnePod(ctx context.Context, podInfo *framework.QueuedPodInfo) {
    pod := podInfo.Pod

    // 1. 根据 Pod.Spec.SchedulerName 获取对应的 Framework
    schedFramework, err := sched.frameworkForPod(pod)
    if err != nil {
        // Profile 不存在，直接标记完成
        sched.SchedulingQueue.Done(podInfo.Pod.UID)
        return
    }

    // 2. 跳过不需要调度的 Pod（正在删除 或 已被 assume）
    if sched.skipPodSchedule(ctx, schedFramework, pod) {
        sched.SchedulingQueue.Done(podInfo.Pod.UID)
        return
    }

    // 3. 同步执行调度周期（Filtering + Scoring + Assume + Reserve）
    state := framework.NewCycleState()
    scheduleResult, assumedPodInfo, status := sched.schedulingCycle(ctx, state, schedFramework, podInfo, start, podsToActivate)
    if !status.IsSuccess() {
        sched.FailureHandler(ctx, schedFramework, assumedPodInfo, status, ...)
        return
    }

    // 4. 异步执行绑定周期（WaitOnPermit → PreBind → Bind → PostBind）
    go sched.runBindingCycle(ctx, state, schedFramework, scheduleResult, assumedPodInfo, start, podsToActivate)
}
```

---

## 调度框架（Scheduling Framework）

调度框架是一个**插件化的扩展点系统**，定义在 [`interface.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/framework/interface.go)。

### 扩展点（Extension Points）

```
                       QueueSort（队列排序，NextEntity 阶段）
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│               Scheduling Cycle（调度周期，同步）                            │
│                                                                          │
│  schedulingAlgorithm:                                                    │
│  ┌──────────┐   ┌────────┐   ┌───────────┐   ┌─────────┐   ┌──────┐      │
│  │PreFilter │──→│ Filter │──→│ PostFilter│──→│ PreScore│──→│ Score│      │
│  └──────────┘   └────────┘   └───────────┘   └─────────┘   └──┬───┘      │
│                                                               │          │
│                                                               ▼          │
│  prepareForBindingCycle:                                  (选出最佳节点)   │
│                                  ┌────────┐   ┌─────────┐   ┌────────┐   │
│                          ┌─────→ │ Assume │──→│ Reserve │──→│ Permit │   │
│                          │       └────────┘   └─────────┘   └────┬───┘   │
└──────────────────────────┼───────────────────────────────────────┼───────┘
│                          │                                       │       │
│                          │ go sched.runBindingCycle()            │       │
│                          ▼                                       │       │
┌──────────────────────────┼───────────────────────────────────────┼───────┐
│              Binding Cycle（绑定周期，异步 goroutine）                      │
│                                                                          │
│  ┌────────────────┐   ┌────────────┐   ┌─────────┐   ┌────────┐          │
│  │PreBindPreFlight│──→│WaitOnPermit│──→│ PreBind │──→│  Bind  │          │
│  └────────────────┘   └────────────┘   └─────────┘   └───┬────┘          │
│                                                          │               │
│                                                          ▼               │
│                                                    ┌────────┐            │
│                                                    │PostBind│            │
│                                                    └────────┘            │
└──────────────────────────────────────────────────────────────────────────┘
```

### 各扩展点说明

| 扩展点 | 阶段 | 作用 | Details |
|--------|------|------|------|
| [`QueueSort`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go#L69) | 入队 | 决定 Pod 在调度队列中的优先级 | 优先级/先进先出 |
| [`PreFilter`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go#L641) | 调度前 | 预处理/过滤（如检查 PVC 是否可用） | 1. 每个调度周期只执行一次<br/>2. 可返回需要检查的节点列表<br/>3. 失败则 Pod 直接进入不可调度队列 |
| [`Filter`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go#L817) | 过滤 | 谓词计算，排除不满足条件的节点 | 1. 对每个候选节点执行<br/>2. 检查资源、亲和性、污点容忍等<br/>3. 支持并行执行以提高性能 |
| [`PostFilter`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go#L296) | 过滤后 | 无可用节点时触发抢占（Preemption） | 1. 仅当所有节点都未通过 Filter 时触发<br/>2. 尝试驱逐低优先级 Pod<br/>3. 设置 NominatedNodeName 供下次调度使用 |
| [`PreScore`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go#L968) | 打分前 | 为打分插件做预处理（如计算 Pod 拓扑信息） | 1. 每个调度周期只执行一次<br/>2. 为 Score 插件准备共享状态<br/>3. 如计算拓扑分布约束信息 |
| [`Score`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go#L974) | 打分 | 对可行节点打分排序 | 1. 对每个通过 Filter 的节点执行<br/>2. 返回 0-100 的分数<br/>3. 各插件分数加权汇总 |
| [`Reserve`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go#L339) | 预留 | 预留资源（如 Volume、端口） | 1. 在内存中预留资源（不写 etcd）<br/>2. 更新调度器缓存的节点状态<br/>3. 绑定失败时执行 Unreserve 回滚 |
| [`Permit`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go#L211) | 准入 | 延迟绑定（如等待 Gang 调度），可返回 Wait | 1. 可返回 Allow / Deny / Wait<br/>2. Wait 时 Pod 进入等待状态<br/>3. 超时后自动 Deny |
| [`PreBindPreFlight`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go#L413) | 绑定前检查 | 检查 PreBind 条件是否就绪（新扩展点） | 1. 在 Binding Cycle 中 WaitOnPermit 之前执行<br/>2. 检查 PreBind 插件是否就绪<br/>3. 失败则跳过 PreBind 直接进入 Bind |
| [`PreBind`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go#L466) | 绑定前 | 执行绑定前准备（如挂载 Volume） | 1. 在 Binding Cycle 中执行<br/>2. 典型操作：挂载 PV、注入 Secret<br/>3. 失败则触发 Unreserve |
| [`Bind`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go#L1110) | 绑定 | 实际将 Pod 绑定到 Node | 1. 向 API Server 发送 Binding 请求<br/>2. 默认使用 DefaultBinder 插件<br/>3. 成功后触发 PostBind |
| [`PostBind`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go#L495) | 绑定后 | 清理、通知 | 1. 绑定成功后执行清理<br/>2. 更新调度器内部状态<br/>3. 触发 podsToActivate 激活等待中的 Pod |

---

## 内置插件（[`framework/plugins/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/scheduler/framework/plugins/)）

```
plugins/
├── defaultbinder/        # 默认绑定器
├── defaultpreemption/    # 默认抢占
├── interpodaffinity/     # Pod 间亲和/反亲和
├── nodeaffinity/         # 节点亲和性
├── nodeports/            # 检查节点端口冲突
├── noderesources/        # 资源（CPU/内存）检查
├── nodeunschedulable/    # 节点可调度性检查
├── nodevolumelimit/      # 节点 Volume 限制
├── podtopologyspread/    # Pod 拓扑分散约束
├── prioritysort/         # 优先级排序
├── volumebinding/        # Volume 绑定
├── volumerestrictions/   # Volume 限制
├── volumzone/            # Volume 可用区
└── ...（约 20+ 个内置插件）
```

---

## 关键数据流

```
                    ┌──────────────────────┐
                    │  未调度 Pod（Pending） │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │   Scheduling Queue   │ ← QueueSort 插件排序
                    │  (PriorityQueue)     │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │  scheduleOne()       │
                    │  ├─ PreFilter        │
                    │  ├─ Filter（谓词）   │ ← 并行检查所有节点
                    │  ├─ Score（打分）    │ ← 并行打分
                    │  └─ Reserve          │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │  bindingCycle()      │
                    │  ├─ PreBind          │
                    │  ├─ Bind             │
                    │  └─ PostBind         │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │  Pod 已绑定到 Node   │
                    └──────────────────────┘
```

---

## 核心数据结构

```go
// 调度结果
type ScheduleResult struct {
    SuggestedHost string  // 选中的节点名
}

// 节点信息快照
type NodeInfo struct {
    Node         *v1.Node
    Pods         []*PodInfo
    UsedPorts    HostPortInfo
    Allocated    *Resource
    ...
}

// 调度周期状态（插件间传递）
type CycleState struct {
    states map[StateKey]StateData  // 插件可读写
}
```

---

## 配置入口

Scheduler 通过 `KubeSchedulerConfiguration` 配置：

```yaml
apiVersion: kubescheduler.config.k8s.io/v1
kind: KubeSchedulerConfiguration
profiles:
- schedulerName: default-scheduler
  plugins:
    filter:
      enabled:
      - name: NodeResourcesFit
    score:
      enabled:
      - name: NodeResourcesFit
        weight: 1
```

---

## 总结

| 模块 | 核心文件 | 职责 |
|------|---------|------|
| 入口 | [`cmd/kube-scheduler/`](https://github.com/kubernetes/kubernetes/tree/master/cmd/kube-scheduler/) | 启动、配置解析 |
| 主循环 | [`scheduler.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/scheduler.go) + [`schedule_one.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go) | 调度主流程 |
| 框架 | [`framework/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/scheduler/framework/) | 插件注册、调用、状态传递 |
| 插件 | [`framework/plugins/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/scheduler/framework/plugins/) | 内置调度策略实现 |
| 抢占 | [`framework/preemption/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/scheduler/framework/preemption/) | Pod 抢占逻辑 |
| 队列 | [`internal/queue/`](https://github.com/kubernetes/kubernetes/tree/master/pkg/scheduler/internal/queue/) | 优先级队列管理 |






## Reference

[cmd/kube-scheduler](https://github.com/kubernetes/kubernetes/tree/master/cmd/kube-scheduler/)

[pkg/scheduler](https://github.com/kubernetes/kubernetes/tree/master/pkg/scheduler/)

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()
