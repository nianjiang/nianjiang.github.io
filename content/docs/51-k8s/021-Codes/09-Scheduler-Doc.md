---
weight: 9
title: "Scheduler Docs"
---

# Kubernetes 调度与驱逐（Scheduling & Eviction）文档总结

> 官方文档：[kubernetes.io/docs/concepts/scheduling-eviction/](https://kubernetes.io/docs/concepts/scheduling-eviction/)

---

## 一、整体结构

该文档页面是 Kubernetes **调度、抢占与驱逐** 三大主题的导航入口，涵盖以下子主题：

### Scheduling（调度）

| 序号 | 主题 | 核心问题 | Note |
|:----:|------|------|------|
| ✅ 1 | [Kubernetes Scheduler](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/) | 调度器怎么工作（Filtering+Scoring） | 调度器两阶段模型：<br/>1. **Filtering**：找出满足 Pod 需求的可用节点（feasible nodes）<br/>2. **Scoring**：对候选节点打分，选最高分绑定 Pod |
| 2 | [Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) | 用户怎么控制 Pod 去哪里 | 用户主动干预调度的四种手段：<br/>• **nodeSelector**：通过 Label 简单匹配<br/>• **nodeAffinity**：更丰富的节点亲和性（required/preferred）<br/>• **podAffinity/podAntiAffinity**：基于已有 Pod 决定位置<br/>• **nodeName**：直接指定节点名（最强硬绑定） |
| 3 | [Pod Overhead](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-overhead/) | Pod 自身的资源开销 | Pod 本身（非容器）的资源开销，如 Kata 沙箱虚拟机的额外 CPU/Memory，<br/>通过 RuntimeClass.overhead 定义，调度时叠加进容器请求 |
| 4 | [Pod Topology Spread Constraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/) | Pod 副本怎么跨域均匀分布 | 通过 topologySpreadConstraints 控制 Pod 副本在拓扑域（Zone/Node/Region）间的均匀分布（maxSkew），<br/>避免副本聚集，提升高可用 |
| 5 | [Taints and Tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/) | 节点怎么排斥/接受特定 Pod | **Taint**：打在节点上，默认拒绝不容忍该污点的 Pod<br/>**Toleration**：打在 Pod 上，声明可以接受某种污点<br/>典型用途：专用节点（如 GPU 节点只给声明了容忍的 Pod 使用） |
| ✅ 6 | [Scheduling Framework](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/) | 调度器怎么插件化 | 调度器插件化架构，定义扩展点：<br/>QueueSort → PreFilter → Filter → PostFilter → <br/>PreScore → Score → NormalizeScore → Reserve → Permit → <br/>PreBind → Bind → PostBind，<br/>开发者可在任意阶段插入自定义逻辑，无需 fork 调度器 |
| 7 | [Dynamic Resource Allocation](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/) | 非标硬件（GPU等）怎么动态分配 | 通过 ResourceClaim/ResourceClass API 支持非标硬件（GPU/FPGA/网卡）的动态分配，<br/>让硬件驱动（DRA Driver）参与调度决策，支持参数化、共享、分区等复杂语义 |
| 8 | [Scheduler Performance Tuning](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduler-perf-tuning/) | 大集群怎么权衡速度和质量 | 核心参数 percentageOfNodesToScore：只对一定比例节点打分减少计算量（100 节点→50%，5000 节点→10%）.<br/>v1.35 新增 Opportunistic Batching：缓存相同约束结果，大批量调度时极大提速 |
| 9 | [Resource Bin Packing](https://kubernetes.io/docs/concepts/scheduling-eviction/resource-bin-packing/) | 怎么让节点利用率更高便于缩容 | 通过 NodeResourcesFit 插件的 MostAllocated 或 RequestedToCapacityRatio 策略，<br/>优先将 Pod 调度到已使用节点，为节点缩容（Cluster Autoscaler）创造条件 |
| 10 | [Pod Scheduling Readiness](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-scheduling-readiness/) | Pod 怎么等外部条件就绪再调度 | 通过 spec.schedulingGates 设置门控，Pod 进入 SchedulingGated 状态暂停调度，<br/>外部控制器确认条件满足后移除 gate，Pod 才进入正常调度流程 |
| 11 | [PodGroup Scheduling](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-group-scheduling/) | 多 Pod 怎么作为逻辑组管理 | 将多个 Pod 视为逻辑组统一管理，定义 minCount（最小调度数量）、优先级、中断模式等策略，<br/>是 Gang/Topology-aware/Workload-aware 等特性的基础 API |
| 12 | [Gang Scheduling](https://kubernetes.io/docs/concepts/scheduling-eviction/gang-scheduling/) | 一组 Pod 要么全调度要么全等待 | All-or-Nothing：通过 PodGroup.spec.minCount 设置最小可调度数量，<br/>调度器使用 Permit 扩展点实现原子决策。<br/>适用于分布式训练（MPI/PyTorch DDP）等场景 |
| 13 | [Topology-aware Scheduling](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-aware-scheduling/) | 一组 Pod 怎么同域放置减少跨域通信 | 通过 TopologyPlacement 插件生成候选拓扑域，<br/>结合 NodeResourcesFit（资源装箱）和 PodGroupPodsCount（最大化可调度 Pod 数）打分，<br/>选出最优拓扑域放置整个 PodGroup |
| 14 | [Workload-Aware Preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/workload-aware-preemption/) | PodGroup 怎么作为整体参与抢占 | 以 PodGroup 为单位进行抢占决策，<br/>按层次（Priority → Workload Type → Group Size → Start Time）决定谁先被驱逐，<br/>替代默认的逐个 Pod 评估方式 |
| 15 | [Descheduler](https://github.com/kubernetes-sigs/descheduler#descheduler-for-kubernetes) | 已调度的 Pod 怎么持续优化分布 | 定期检查已运行 Pod 是否处于最优位置（违反亲和性、节点不均衡、违反 Taint 等），<br/>主动驱逐触发重新调度，弥补 kube-scheduler "只管放、不管搬"的不足 |
| 16 | [Node Declared Features](https://kubernetes.io/docs/concepts/scheduling-eviction/node-declared-features/) | 混合版本集群怎么避免特性不匹配 | kubelet 启动时将已启用的 Feature Gates 写入 Node.status.declaredFeatures，<br/>调度器通过 NodeDeclaredFeatures 插件在 Filter 阶段检查节点是否支持 Pod 所需特性，<br/>用于混合版本集群升级 |

### Pod Disruption（Pod 中断）

| 序号 | 主题 | 说明 | Note |
|:----:|------|------|------|
| ✅ 1 | [Pod Priority and Preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/) | 优先级与抢占 | 通过 PriorityClass 给 Pod 赋予优先级数值。<br/>当高优先级 Pod 无法调度时，调度器选择一个节点驱逐足够多的低优先级 Pod 腾出空间。<br/>PodDisruptionBudget 可限制抢占时的 Pod 中断数量 |
| ✅ 2 | [Node-pressure Eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/) | 节点压力驱逐 | kubelet 持续监控内存、磁盘、PID 等资源，<br/>触达阈值时按 QoS 级别（BestEffort → Burstable → Guaranteed）和资源使用量排序驱逐。<br/>软阈值 + 宽限期 / 硬阈值立即驱逐 |
| ✅ 3 | [API-initiated Eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/api-eviction/) | API 发起的驱逐 | 通过 Eviction API 优雅驱逐 Pod，自动遵守 PDB 限制：<br/>检查 PDB 不满足则返回 429，满足则触发优雅终止流程。<br/>`kubectl drain` 背后就是调用此 API |

---


## 二、调度核心：kube-scheduler

### 工作原理

kube-scheduler 负责为**未分配节点的 Pod** 选择最佳节点，采用**两步法**：

```
第一步：Filter（过滤）
    遍历所有节点，排除不满足 Pod 要求的节点
    ├─ PodFitsResources     → 资源是否充足
    ├─ PodFitsHostPorts     → 端口是否冲突
    ├─ NodeSelector         → 节点选择器匹配
    ├─ NodeAffinity         → 节点亲和性
    └─ TaintToleration      → 污点容忍
    ↓ 结果：可行节点列表（feasible nodes）

第二步：Score（打分）
    对可行节点进行打分排序
    ├─ NodeResourcesFit     → 资源打分
    ├─ InterPodAffinity     → Pod 间亲和性
    └─ TaintToleration      → 污点容忍度
    ↓ 结果：选择最高分节点

第三步：Bind（绑定）
    将 Pod 绑定到选中节点
```

### 调度决策考虑因素

| 因素 | 说明 |
|------|------|
| 资源需求 | CPU、内存、GPU 等资源是否满足 |
| 硬件/软件约束 | 节点标签、污点、亲和性 |
| 数据局部性 | 优先调度到数据所在节点 |
| 工作负载干扰 | 避免互相干扰的 Pod 在同一节点 |
| 拓扑分散 | Pod 在故障域间均匀分布 |

---

## 三、Scheduling Framework（调度框架）

调度框架是 kube-scheduler 的**插件化架构**（v1.19 GA），将调度流程拆分为多个扩展点：

```
调度周期（Scheduling Cycle）─ 串行执行
┌─────────────────────────────────────────────────────────────┐
│  PreEnqueue → QueueSort → PreFilter → Filter → PostFilter  │
│       ↓                                                     │
│  PreScore → Score → NormalizeScore → Reserve → Permit      │
└─────────────────────────────────────────────────────────────┘
                          ↓ 选中节点
绑定周期（Binding Cycle）─ 可并发执行
┌─────────────────────────────────────────────────────────────┐
│  PreBind → Bind → PostBind                                  │
└─────────────────────────────────────────────────────────────┘
```

### 各扩展点详解

| 扩展点 | 阶段 | 作用 | 是否可改变决策 |
|--------|------|------|--------------|
| **PreEnqueue** | 入队前 | Pod 是否允许进入调度队列 | 是 |
| **QueueSort** | 入队 | 队列排序（同时只能一个） | 是 |
| **PreFilter** | 调度前 | 预处理/检查条件 | 信息性 |
| **Filter** | 过滤 | 排除不可行节点 | 是 |
| **PostFilter** | 过滤后 | 无可用节点时触发抢占 | 是 |
| **PreScore** | 打分前 | 预计算共享状态 | 信息性 |
| **Score** | 打分 | 对节点打分 [0, 100] | 是 |
| **NormalizeScore** | 归一化 | 调整分数到标准范围 | 是 |
| **Reserve** | 预留 | 预留资源（Volume 等） | 信息性 |
| **Permit** | 准入 | 批准/拒绝/延迟绑定 | 是 |
| **PreBind** | 绑定前 | 准备工作（挂载 Volume） | 信息性 |
| **Bind** | 绑定 | 实际绑定 Pod 到 Node | 是 |
| **PostBind** | 绑定后 | 清理/通知 | 信息性 |

### 关键机制

- **调度周期串行**：同一时间只有一个 Pod 在调度周期中
- **绑定周期并发**：多个 Pod 可以同时在绑定周期中
- **CycleState**：插件间通过 `CycleState` 共享数据
- **QueueingHint**（v1.34 GA）：根据集群事件决定是否重新入队

---

## 四、Pod 优先级与抢占（Preemption）

### 核心概念

| 概念 | 说明 |
|------|------|
| **PriorityClass** | 定义优先级名称与整数值的映射（-2147483648 ~ 1,000,000,000） |
| **Priority** | Pod 的重要程度，数值越高越重要 |
| **Preemption** | 高优先级 Pod 无法调度时，驱逐低优先级 Pod 腾出空间 |

### 使用方式

```yaml
# 1. 创建 PriorityClass
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000000
globalDefault: false

# 2. Pod 使用 PriorityClass
apiVersion: v1
kind: Pod
spec:
  priorityClassName: high-priority
  containers:
  - name: app
    image: nginx
```

### 抢占流程

```
高优先级 Pod 无法调度（无可用节点）
    ↓
调度器寻找可驱逐的低优先级 Pod
    ↓
选择驱逐代价最小的节点
    ├─ 优先驱逐优先级低的 Pod
    ├─ 考虑 PDB（PodDisruptionBudget）
    └─ 尽量减少驱逐数量
    ↓
驱逐选中的 Pod → 高优先级 Pod 调度
```

### 内置 PriorityClass

| 名称 | 用途 |
|------|------|
| `system-cluster-critical` | 集群关键组件 |
| `system-node-critical` | 节点关键组件（优先级更高） |

---

## 五、节点压力驱逐（Node-pressure Eviction）

### 核心概念

kubelet 监控节点资源，当资源压力超过阈值时，**主动驱逐 Pod** 以回收资源。

> **与 API 驱逐的区别**：节点压力驱逐不遵守 `PodDisruptionBudget` 和 `terminationGracePeriodSeconds`。

### 监控的资源信号

| 信号 | 说明 | 驱逐策略 |
|------|------|---------|
| `memory.available` | 可用内存 | 驱逐低优先级 Pod |
| `nodefs.available` | 根文件系统可用空间 | 驱逐可回收空间的 Pod |
| `imagefs.available` | 镜像文件系统可用空间 | 删除未使用镜像 |
| `imagefs.inodesFree` | 镜像文件系统 inode | 删除未使用镜像 |
| `pid.available` | 可用 PID | 驱逐进程多的 Pod |

### 驱逐阈值

```
软驱逐（Soft Eviction）
├─ 配置：eviction-soft + eviction-soft-grace-period
├─ 超过阈值 + 持续时间 > grace-period → 驱逐
└─ 遵守 eviction-max-pod-grace-period

硬驱逐（Hard Eviction）
├─ 配置：eviction-hard
├─ 超过阈值 → 立即驱逐（0s grace period）
└─ 不等待，直接终止 Pod
```

### 驱逐优先级

kubelet 按以下顺序选择要驱逐的 Pod：

```
1. 优先驱逐 BestEffort QoS 的 Pod
2. 其次驱逐 Burstable QoS 的 Pod
3. 最后驱逐 Guaranteed QoS 的 Pod

同等 QoS 下：
├─ 按 Priority 排序（低优先级先驱逐）
└─ 按资源使用量排序（使用多的先驱逐）
```

### 自愈行为

```
资源压力 → kubelet 先尝试回收资源
├─ 删除未使用的容器镜像
├─ 清理临时文件
└─ 仍不足 → 才开始驱逐 Pod
```

---

## 六、总结对比

| 主题 | 触发方 | 目的 | 核心机制 |
|------|--------|------|---------|
| **调度** | Scheduler | 为 Pod 找最佳节点 | Filter → Score → Bind |
| **抢占** | Scheduler | 为高优先级 Pod 腾空间 | 驱逐低优先级 Pod |
| **节点压力驱逐** | kubelet | 保护节点不被资源耗尽 | 监控资源 → 超阈值驱逐 |
| **API 驱逐** | 管理员/PDB | 主动下线 Pod | Eviction API |






## Reference

[Scheduler](https://kubernetes.io/docs/concepts/scheduling-eviction/)

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
