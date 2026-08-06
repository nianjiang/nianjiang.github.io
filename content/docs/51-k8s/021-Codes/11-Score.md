---
weight: 11
title: "Scheduler-score"
---

# Kubernetes Scheduler Score 打分机制深度解析

---

## 1. Score 在调度流程中的位置（[source](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/framework/interface.go)）

```
Filter（过滤不可用节点，获取可用节点列表）
    ↓
Score（对可用节点打分）  
    ↓
Select（选择最高分节点）
```

Score 阶段的输入是**经过 Filter 后所有可用的节点列表**，输出是**每个节点的加权总分**。

---

## 2. 核心数据结构

### 2.1 分数相关常量（[source](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/framework/interface.go)）

```go
const (
    MinNodeScore int64 = 0    // 最低分
    MaxNodeScore int64 = 100  // 最高分（单个插件）
)
```

### 2.2 打分结果结构（[source](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/framework/interface.go)）

```go
// 单个插件对某个节点的打分
type NodeScore struct {
    Name  string  // 节点名
    Score int64   // 分数
}

// 单个插件的打分结果
type PluginScore struct {
    Name  string  // 插件名
    Score int64   // 加权后的分数
}

// 某个节点的所有打分结果
type NodePluginScores struct {
    Name       string         // 节点名
    Scores     []PluginScore  // 各插件打分明细
    TotalScore int64          // 加权总分
}
```

---

## 3. ScorePlugin 接口定义（[source](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/framework/interface.go)）

```go
// ScorePlugin 是打分插件的接口
type ScorePlugin interface {
    Plugin
    // Score 对单个节点打分
    Score(ctx context.Context, state CycleState, pod *v1.Pod, nodeInfo NodeInfo) (int64, *Status)
    // ScoreExtensions 返回分数归一化扩展（可选）
    ScoreExtensions() ScoreExtensions
}

// ScoreExtensions 是分数归一化扩展接口
type ScoreExtensions interface {
    // NormalizeScore 在所有节点打分完成后进行归一化
    NormalizeScore(ctx context.Context, state CycleState, pod *v1.Pod, scores NodeScoreList) *Status
}
```

---

## 4. Score 执行流程（核心代码）

### 4.1 入口函数 [`prioritizeNodes()`](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/schedule_one.go)

```go
// schedule_one.go
func prioritizeNodes(
    ctx context.Context,
    extenders []fwk.Extender,
    schedFramework framework.Framework,
    state fwk.CycleState,
    pod *v1.Pod,
    nodes []fwk.NodeInfo,
) ([]fwk.NodePluginScores, error) {

    // 1. 没有任何打分插件时，所有节点默认得 1 分
    if len(extenders) == 0 && !schedFramework.HasScorePlugins() {
        result := make([]fwk.NodePluginScores, 0, len(nodes))
        for i := range nodes {
            result = append(result, fwk.NodePluginScores{
                Name:       nodes[i].Node().Name,
                TotalScore: 1,
            })
        }
        return result, nil
    }

    // 2. 执行 PreScore 插件（预处理）
    preScoreStatus := schedFramework.RunPreScorePlugins(ctx, state, pod, nodes)

    // 3. 执行 Score 插件（并行打分）
    nodesScores, scoreStatus := schedFramework.RunScorePlugins(ctx, state, pod, nodes)

    // 4. 执行 Extender 打分（外部调度器）
    if len(extenders) != 0 {
        // 并行调用所有 Extender 的 Prioritize 方法
        // ...
    }

    return nodesScores, nil
}
```

### 4.2 `RunScorePlugins()` 详细实现

```go
// runtime/framework.go
func (f *frameworkImpl) RunScorePlugins(ctx context.Context, state fwk.CycleState, pod *v1.Pod, nodes []fwk.NodeInfo) ([]fwk.NodePluginScores, *fwk.Status) {

    // 初始化结果结构
    allNodePluginScores := make([]fwk.NodePluginScores, len(nodes))
    plugins := make([]fwk.ScorePlugin, 0, numPlugins)
    pluginToNodeScores := make(map[string]fwk.NodeScoreList, numPlugins)

    // ============ 第一阶段：并行 Score ============
    // 对每个节点并行执行所有插件的 Score() 方法
    f.Parallelizer().Until(ctx, len(nodes), func(index int) {
        nodeInfo := nodes[index]
        for _, pl := range plugins {
            // 调用插件的 Score 方法
            s, status := f.runScorePlugin(ctx, pl, state, pod, nodeInfo)

            // 记录该插件对该节点的打分
            pluginToNodeScores[pl.Name()][index] = fwk.NodeScore{
                Name:  nodeInfo.Node().Name,
                Score: s,  // 原始分数
            }
        }
    }, metrics.Score)

    // ============ 第二阶段：并行 NormalizeScore ============
    // 对每个插件并行执行 NormalizeScore()（如果实现了 ScoreExtensions）
    f.Parallelizer().Until(ctx, len(plugins), func(index int) {
        pl := plugins[index]
        if pl.ScoreExtensions() == nil {
            return  // 该插件没有实现归一化
        }
        nodeScoreList := pluginToNodeScores[pl.Name()]
        // 调用归一化方法，将分数调整到 [0, MaxNodeScore] 范围
        status := pl.ScoreExtensions().NormalizeScore(ctx, state, pod, nodeScoreList)
    }, metrics.Score)

    // ============ 第三阶段：并行加权计算 ============
    // 对每个节点并行计算加权总分
    f.Parallelizer().Until(ctx, len(nodes), func(index int) {
        nodePluginScores := fwk.NodePluginScores{
            Name:   nodes[index].Node().Name,
            Scores: make([]fwk.PluginScore, len(plugins)),
        }

        for i, pl := range plugins {
            weight := f.scorePluginWeight[pl.Name()]  // 从配置读取权重
            score := pluginToNodeScores[pl.Name()][index].Score

            // 验证分数范围
            if score > fwk.MaxNodeScore || score < fwk.MinNodeScore {
                // 错误：分数超出范围
            }

            // 加权分数 = 原始分数 × 权重
            weightedScore := score * int64(weight)

            nodePluginScores.Scores[i] = fwk.PluginScore{
                Name:  pl.Name(),
                Score: weightedScore,
            }
            nodePluginScores.TotalScore += weightedScore  // 累加总分
        }

        allNodePluginScores[index] = nodePluginScores
    }, metrics.Score)

    return allNodePluginScores, nil
}
```

---

## 5. 内置打分插件示例

### 5.1 插件列表

| 插件 | 策略 | 说明 |
|------|------|------|
| `NodeResourcesFit` | LeastAllocated / MostAllocated / BalancedAllocation | 资源打分 |
| `InterPodAffinity` | - | Pod 间亲和性打分 |
| `PodTopologySpread` | - | 拓扑分散约束打分 |
| `NodeAffinity` | - | 节点亲和性打分 |
| `TaintToleration` | - | 污点容忍打分 |

### 5.2 `LeastAllocated` 打分实现

```go
// pkg/scheduler/framework/plugins/noderesources/least_allocated.go

// 核心打分函数：偏好资源使用率低的节点
func leastResourceScorer(resources []config.ResourceSpec) func([]int64, []int64, []int64) int64 {
    return func(requested, _, allocable []int64) int64 {
        var nodeScore, weightSum int64
        for i := range requested {
            if allocable[i] == 0 {
                continue
            }
            weight := resources[i].Weight
            resourceScore := leastRequestedScore(requested[i], allocable[i])
            nodeScore += resourceScore * weight
            weightSum += weight
        }
        return nodeScore / weightSum
    }
}

// 单个资源打分公式
func leastRequestedScore(requested, capacity int64) int64 {
    if capacity == 0 {
        return 0
    }
    if requested > capacity {
        return 0
    }
    // 公式：(capacity - requested) * MaxNodeScore / capacity
    // 空闲资源越多，分数越高
    return ((capacity - requested) * fwk.MaxNodeScore) / capacity
}
```

**打分示例**：

```
节点 A: CPU 总量 8核，已用 2核 → 空闲 6核 → 分数 = 6/8 * 100 = 75
节点 B: CPU 总量 8核，已用 6核 → 空闲 2核 → 分数 = 2/8 * 100 = 25

结果：节点 A 得分更高，优先调度到 A
```

### 5.3 `MostAllocated` 打分实现

```go
// pkg/scheduler/framework/plugins/noderesources/most_allocated.go

// 偏好资源使用率高的节点（Bin-packing 策略）
func mostResourceScorer(resources []config.ResourceSpec) func([]int64, []int64, []int64) int64 {
    return func(requested, allocatable, _ []int64) int64 {
        var nodeScore, weightSum int64
        for i := range requested {
            if allocatable[i] == 0 {
                continue
            }
            weight := resources[i].Weight
            resourceScore := mostRequestedScore(requested[i], allocatable[i])
            nodeScore += resourceScore * weight
            weightSum += weight
        }
        return nodeScore / weightSum
    }
}

// 公式：requested * MaxNodeScore / capacity
// 使用率越高，分数越高
func mostRequestedScore(requested, capacity int64) int64 {
    if requested > capacity {
        return 0
    }
    return (requested * fwk.MaxNodeScore) / capacity
}
```

---

## 6. 加权计算示例

### 配置示例

```yaml
apiVersion: kubescheduler.config.k8s.io/v1
kind: KubeSchedulerConfiguration
profiles:
- plugins:
    score:
      enabled:
      - name: NodeResourcesFit
        weight: 2
      - name: InterPodAffinity
        weight: 1
      - name: TaintToleration
        weight: 1
```

### 计算过程

| 节点 | NodeResourcesFit (×2) | InterPodAffinity (×1) | TaintToleration (×1) | **总分** |
|------|----------------------|----------------------|---------------------|---------|
| node-a | 80 × 2 = 160 | 50 × 1 = 50 | 100 × 1 = 100 | **310** |
| node-b | 60 × 2 = 120 | 90 × 1 = 90 | 100 × 1 = 100 | **310** |
| node-c | 90 × 2 = 180 | 20 × 1 = 20 | 0 × 1 = 0 | **200** |

**结果**：node-a 和 node-b 并列最高分（310），调度器会根据其他因素（如随机化）选择其中一个。

---

## 7. 完整数据流

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Score 打分流程                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. PreScore（预处理）                                               │
│     ├─ 遍历所有 PreScorePlugin                                      │
│     ├─ 插件可在此阶段计算全局信息并存入 CycleState                   │
│     └─ 如 InterPodAffinity 预计算亲和关系                           │
│                          ↓                                          │
│  2. Score（并行打分）                                                │
│     ├─ 对每个节点并行执行                                           │
│     ├─ 每个 ScorePlugin 独立打分                                    │
│     └─ 分数范围：[MinNodeScore, MaxNodeScore] = [0, 100]            │
│                          ↓                                          │
│  3. NormalizeScore（归一化，可选）                                   │
│     ├─ 对每个插件并行执行                                           │
│     └─ 将分数调整到 [0, 100] 范围                                   │
│                          ↓                                          │
│  4. Weight（加权）                                                   │
│     ├─ 对每个节点并行计算                                           │
│     ├─ weightedScore = score × weight                               │
│     └─ TotalScore = Σ(weightedScore)                                │
│                          ↓                                          │
│  5. Extender Score（外部调度器打分，可选）                           │
│     └─ 分数会累加到 TotalScore                                      │
│                          ↓                                          │
│  6. 选择最高分节点                                                   │
│     └─ 如果多个节点同分，使用随机化打破平局                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. 关键优化点

### 8.1 并行化

```go
// 使用 Parallelizer 并行处理所有节点
f.Parallelizer().Until(ctx, len(nodes), func(index int) {
    // 每个 goroutine 处理一个节点的所有插件打分
}, metrics.Score)
```

### 8.2 百分比节点打分

```go
// 当节点数很多时，可以只打分一部分节点
numNodesToFind := sched.numFeasibleNodesToFind(percentageOfNodesToScore, numAllNodes)
```

### 8.3 分数缓存（CycleState）

```go
// PreScore 阶段可以将计算结果存入 CycleState，供 Score 阶段复用
func (pl *InterPodAffinity) PreScore(ctx context.Context, state CycleState, pod *v1.Pod, nodes []NodeInfo) *Status {
    // 预计算亲和关系，存入 state
    state.Write(interPodAffinityStateKey, preScoreData)
    return nil
}

func (pl *InterPodAffinity) Score(ctx context.Context, state CycleState, pod *v1.Pod, nodeInfo NodeInfo) (int64, *Status) {
    // 从 state 读取预计算数据
    data, _ := state.Read(interPodAffinityStateKey)
    // 使用预计算数据加速打分
}
```




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
