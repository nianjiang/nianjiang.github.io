---
weight: 19
title: "Descheduler"
---

# Descheduler for Kubernetes — README 总结

> 仓库地址：[github.com/kubernetes-sigs/descheduler](https://github.com/kubernetes-sigs/descheduler)

---

## 一、什么是 Descheduler？

Descheduler 是 Kubernetes 的**反调度器**，用于解决 kube-scheduler 无法处理的问题：当集群状态随时间变化后，已经运行的 Pod 可能不再处于最优节点上。Descheduler 根据策略**找到并驱逐这些 Pod**，让它们被重新调度到更合适的节点。

### 为什么需要 Descheduler？

| 场景 | 说明 |
|------|------|
| 节点负载不均 | 部分节点过载或空闲 |
| 调度条件变化 | 节点的 taint/label 变化，亲和性不再满足 |
| 节点故障恢复 | 故障节点的 Pod 迁移到其他节点后造成聚集 |
| 新增节点 | 新节点加入集群后需要重新平衡 |

> **注意**：Descheduler **只负责驱逐 Pod**，不负责调度。被驱逐的 Pod 由 kube-scheduler 重新调度。

---

## 二、部署方式

Descheduler 可以以 **Job / CronJob / Deployment** 三种方式运行在集群中（`kube-system` 命名空间，作为 Critical Pod 避免被驱逐）：

| 方式 | 说明 |
|------|------|
| **Job** | 执行一次后退出 |
| **CronJob** | 定时周期性执行 |
| **Deployment** | 常驻运行，支持 HA（Leader Election） |

安装方式支持：**kubectl apply** / **Helm Chart**（v0.18+）/ **Kustomize**

---

## 三、策略插件（Strategy Plugins）

Descheduler 采用插件化架构，策略分为两大类：

### Deschedule 插件（逐个处理 Pod）

| 插件 | 说明 |
|------|------|
| RemovePodsViolatingInterPodAntiAffinity | 驱逐违反 Pod 间反亲和性的 Pod |
| RemovePodsViolatingNodeAffinity | 驱逐违反节点亲和性的 Pod |
| RemovePodsViolatingNodeTaints | 驱逐违反节点 Taint 的 Pod |
| RemovePodsHavingTooManyRestarts | 驱逐重启次数过多的 Pod |
| PodLifeTime | 基于 Pod 年龄/状态/退出码驱逐 |
| RemoveFailedPods | 驱逐失败的 Pod |

### Balance 插件（批量处理 Pod 实现均衡）

| 插件 | 说明 |
|------|------|
| RemoveDuplicates | 驱逐同一节点上的重复副本 |
| LowNodeUtilization | 从过载节点驱逐 Pod，迁移到空闲节点 |
| HighNodeUtilization | 从空闲节点驱逐 Pod，集中到更少节点（配合节点缩容） |
| RemovePodsViolatingTopologySpreadConstraint | 驱逐违反拓扑分散约束的 Pod |

---

## 四、策略插件详解

### 1. RemoveDuplicates（去重）

确保同一个节点上不会运行同一 ReplicaSet/StatefulSet/Job 的多个副本。适用于节点故障恢复后 Pod 聚集的场景。

### 2. LowNodeUtilization（低利用率均衡）

```
                    thresholds          targetThresholds
                    ◄─────────►         ◄──────────────►
节点利用率：  [空闲]  [适中]          [过载]
             < 20%    20%-50%         > 50%

空闲节点 ← Pod 从过载节点迁移过来
过载节点 → 驱逐 Pod
```

- **thresholds**：低于此值视为空闲节点（如 CPU < 20%）
- **targetThresholds**：高于此值视为过载节点（如 CPU > 50%）
- 支持 `useDeviationThresholds` 模式（基于平均值的偏差）

### 3. HighNodeUtilization（高利用率装箱）

与 LowNodeUtilization 相反，驱逐空闲节点上的 Pod 使它们集中到更少节点。**需配合 MostAllocated 调度策略**使用，适用于触发节点缩容。

### 4. RemovePodsViolatingNodeAffinity

实现 `requiredDuringSchedulingRequiredDuringExecution` 语义（kube-scheduler 只保证调度时满足亲和性，不保证运行时持续满足）。

### 5. RemovePodsViolatingNodeTaints

当节点的 Taint 变化后，驱逐不再满足容忍条件的 Pod。支持 `excludedTaints` 和 `includedTaints` 过滤。

### 6. PodLifeTime（Pod 生命周期）

支持多种驱逐条件：
- **年龄驱逐**：`maxPodLifeTimeSeconds` 驱逐超过指定时间的 Pod
- **状态驱逐**：基于 Pod Phase、Container State、退出码等条件
- **条件驱逐**：基于 status.conditions 的 type/reason/status

### 7. RemoveFailedPods

驱逐处于 Failed 状态的 Pod，可按 reason、exitCodes、ownerKinds 过滤。

---

## 五、过滤机制（Filter）

Descheduler 提供多层过滤来保护不应被驱逐的 Pod：

### Pod 保护规则（Pod Protections）

| 保护规则 | 默认行为 | 配置方式 |
|---------|---------|---------|
| 系统关键 Pod | **保护**（不驱逐） | `defaultDisabled: ["SystemCriticalPods"]` 可解除 |
| DaemonSet Pod | **保护** | `defaultDisabled: ["DaemonSetPods"]` 可解除 |
| 本地存储 Pod | **保护** | `defaultDisabled: ["PodsWithLocalStorage"]` 可解除 |
| 失败裸 Pod | **保护** | `defaultDisabled: ["FailedBarePods"]` 可解除 |
| PVC Pod | 驱逐 | `extraEnabled: ["PodsWithPVC"]` 可保护 |
| 无 PDB Pod | 驱逐 | `extraEnabled: ["PodsWithoutPDB"]` 可保护 |
| ResourceClaim Pod | 驱逐 | `extraEnabled: ["PodsWithResourceClaims"]` 可保护 |

### 其他过滤

| 过滤方式 | 说明 |
|---------|------|
| **Namespace 过滤** | `namespaces.include` / `namespaces.exclude` |
| **Label 过滤** | `labelSelector` |
| **Priority 过滤** | `priorityThreshold.name` / `priorityThreshold.value`（默认 system-cluster-critical） |
| **NodeFit 过滤** | `nodeFit: true` 驱逐前检查 Pod 是否能调度到其他节点 |
| **MinReplicas** | `minReplicas` 当 ReplicaSet 副本数低于阈值时不驱逐 |
| **MinPodAge** | `minPodAge` 不驱逐创建时间在此阈值内的 Pod |

---

## 六、全局配置

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `nodeSelector` | 限定处理的节点范围 | nil（全部） |
| `maxNoOfPodsToEvictPerNode` | 每个节点最多驱逐数 | nil（无限制） |
| `maxNoOfPodsToEvictPerNamespace` | 每个命名空间最多驱逐数 | nil（无限制） |
| `maxNoOfPodsToEvictTotal` | 每次调度周期总驱逐上限 | nil（无限制） |
| `gracePeriodSeconds` | 驱逐宽限期（秒） | nil |

---

## 七、驱逐决策机制

```
Descheduler 驱逐 Pod 时的优先级：
    ├─ 按 Priority 排序：低优先级先驱逐
    ├─ 同优先级下：BestEffort → Burstable → Guaranteed
    └─ 遵守 PDB（PodDisruptionBudget）

不会被驱逐的 Pod：
    ├─ system-cluster-critical / system-node-critical（除非显式配置）
    ├─ 裸 Pod（无 OwnerRef，除非 evictFailedBarePods: true）
    ├─ DaemonSet Pod（除非 evictDaemonSetPods: true）
    ├─ 本地存储 Pod（除非 evictLocalStoragePods: true）
    └─ DeletionTimestamp 非 nil 的 Pod
```

---

## 八、高可用（HA）

以 Deployment 方式部署时，可通过 `--leader-elect` 开启 Leader Election，多副本部署但只有一个实例活跃。

---

## 九、Metrics

| 指标 | 类型 | 说明 |
|------|------|------|
| `pods_evicted_total` | Counter | 驱逐的 Pod 总数 |
| `loop_duration_seconds` | Histogram | 一次完整调度周期耗时 |
| `strategy_duration_seconds` | Histogram | 每个策略执行耗时 |

默认通过 `https://localhost:10258/metrics` 暴露。

---

## 十、版本兼容性

| Descheduler | 支持的 Kubernetes 版本 |
|-------------|---------------------|
| v0.36 | v1.36 |
| v0.35 | v1.35 |
| v0.34 | v1.34 |
| v0.33 | v1.33 |
| v0.32 | v1.32 |
| v0.31 | v1.31 |
| v0.30 | v1.30 |
| v0.29 | v1.29 |
| v0.28 | v1.28 |
| v0.27 | v1.27 |
| v0.26 | v1.26 |
| v0.25 | v1.25 |
| v0.24 | v1.24 |
| v0.23 | v1.23 |
| v0.22 | v1.22 |
| v0.21 | v1.21 |
| v0.20 | v1.20 |
| v0.19 | v1.19 |
| v0.18 | v1.18 |

每个 Descheduler 版本经过其对应的最近 3 个 K8s minor 版本测试。





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
