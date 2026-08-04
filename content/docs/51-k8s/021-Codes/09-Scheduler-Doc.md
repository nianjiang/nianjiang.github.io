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
| 1 | [Kubernetes Scheduler](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/) | 默认调度器 | ✅ |
| 2 | [Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) | 手动指定节点 |
| 3 | [Pod Overhead](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-overhead/) | Pod 额外开销 |
| 4 | [Pod Topology Spread Constraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/) | Pod 拓扑分散约束 |
| 5 | [Taints and Tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/) | 污点与容忍 |
| 6 | [Scheduling Framework](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/) | 调度框架（插件化架构） | ✅ |
| 7 | [Dynamic Resource Allocation](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/) | 动态资源分配 |
| 8 | [Scheduler Performance Tuning](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduler-perf-tuning/) | 调度器性能调优 |
| 9 | [Resource Bin Packing](https://kubernetes.io/docs/concepts/scheduling-eviction/resource-bin-packing/) | 扩展资源装箱 |
| 10 | [Pod Scheduling Readiness](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-scheduling-readiness/) | Pod 调度就绪 |
| 11 | [PodGroup Scheduling](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-group-scheduling/) | PodGroup 调度 |
| 12 | [Gang Scheduling](https://kubernetes.io/docs/concepts/scheduling-eviction/gang-scheduling/) | Gang 调度 |
| 13 | [Topology-aware Scheduling](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-aware-scheduling/) | 拓扑感知调度 |
| 14 | [Workload-Aware Preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/workload-aware-preemption/) | 工作负载感知抢占 |
| 15 | [Descheduler](https://github.com/kubernetes-sigs/descheduler#descheduler-for-kubernetes) | 反调度器 |
| 16 | [Node Declared Features](https://kubernetes.io/docs/concepts/scheduling-eviction/node-declared-features/) | 节点声明特性 |

### Pod Disruption（Pod 中断）

| 序号 | 主题 | 说明 | Note |
|:----:|------|------|------|
| 1 | [Pod Priority and Preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/) | 优先级与抢占 | ✅ |
| 2 | [Node-pressure Eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/) | 节点压力驱逐 | ✅ |
| 3 | [API-initiated Eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/api-eviction/) | API 发起的驱逐 | ✅ |

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
