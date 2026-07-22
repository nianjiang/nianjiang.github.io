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

### 1. `scheduler.go` — 主结构体与启动

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

### 2. `schedule_one.go` — 单 Pod 调度完整生命周期

这是调度器最核心的文件，实现了完整的调度周期（Scheduling Cycle）：

```go
func (sched *Scheduler) scheduleOnePod(ctx context.Context, podInfo *framework.QueuedPodInfo) {
    // 1. 获取对应的调度 Profile/Framework
    fwk := sched.Profiles[pod.Spec.SchedulerName]

    // 2. 创建 CycleState（用于在插件间传递数据）
    state := framework.NewCycleState()

    // 3. 执行调度算法（findNodesThatFitPod + scoreNodes）
    scheduleResult, err := sched.SchedulePod(ctx, fwk, state, podInfo)

    // 4. 执行绑定周期（Reserve → PreBind → Bind → PostBind）
    go sched.bindingCycle(ctx, state, fwk, ...)
}
```

---

## 调度框架（Scheduling Framework）

调度框架是一个**插件化的扩展点系统**，定义在 [`interface.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/framework/interface.go)。

### 扩展点（Extension Points）

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Scheduling Cycle（调度周期）                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  QueueSort ──→ PreFilter ──→ Filter ──→ PostFilter ──→ Score       │
│       │            │            │            │            │         │
│       │            │            │            │            │         │
│       │            ▼            ▼            ▼            ▼         │
│       │      [PreFilter    [Filter     [PostFilter   [Score        │
│       │       Result]      NodeA/B/C]   (抢占)]      Nodes]        │
│       │                                                             │
│       └──────────────────────────────┐                             │
│                                      ▼                             │
│                              Reserve ──→ Permit ──→ PreBind        │
│                                  │          │           │          │
├──────────────────────────────────┼──────────┼───────────┼──────────┤
│                           Binding Cycle（绑定周期）                  │
│                                  │          │           │          │
│                                  ▼          ▼           ▼          │
│                               [Bind] ──→ PostBind                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 各扩展点说明

| 扩展点 | 阶段 | 作用 |
|--------|------|------|
| `QueueSort` | 入队 | 决定 Pod 在调度队列中的优先级 |
| `PreFilter` | 调度前 | 预处理/过滤（如检查 PVC 是否可用） |
| `Filter` | 过滤 | 谓词计算，排除不满足条件的节点 |
| `PostFilter` | 过滤后 | 无可用节点时触发抢占（Preemption） |
| `Score` | 打分 | 对可行节点打分排序 |
| `Reserve` | 预留 | 预留资源（如 Volume、端口） |
| `Permit` | 准入 | 延迟绑定（如等待 Gang 调度） |
| `PreBind` | 绑定前 | 执行绑定前准备（如挂载 Volume） |
| `Bind` | 绑定 | 实际将 Pod 绑定到 Node |
| `PostBind` | 绑定后 | 清理、通知 |

---

## 内置插件（`framework/plugins/`）

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
| 入口 | `cmd/kube-scheduler/` | 启动、配置解析 |
| 主循环 | `scheduler.go` + `schedule_one.go` | 调度主流程 |
| 框架 | `framework/` | 插件注册、调用、状态传递 |
| 插件 | `framework/plugins/` | 内置调度策略实现 |
| 队列 | `backend/` | 优先级队列管理 |
| 抢占 | `framework/preemption/` | Pod 抢占逻辑 |






## Reference

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

[]()

[]()
