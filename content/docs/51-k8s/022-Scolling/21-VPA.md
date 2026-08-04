---
weight: 21
title: "Vertical Pod Autoscalling"
---

# Vertical Pod Autoscaler (VPA) — 代码结构

> 仓库地址：[github.com/kubernetes/autoscaler/vertical-pod-autoscaler](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler)

## 简介

**VPA（Vertical Pod Autoscaler）** 是 Kubernetes 官方的垂直自动伸缩组件，用于自动调整 Pod 的**资源请求（CPU/Memory Requests）**。

### 解决什么问题？

开发人员在部署应用时经常面临：

- **资源请求写多少合适？** 写太小 → 应用被节流或 OOMKilled；写太大 → 节点资源浪费，集群利用率低
- **应用负载变化后，Requests 还准确吗？** 随着版本迭代、流量变化，当初设定的资源请求早已不准确

VPA 通过监控 Pod 的实际资源使用量，自动计算出合理的 Requests 并应用。


### 工作方式

VPA 创建后会在后台持续运行：

```
Pod 实际使用 500m CPU → VPA 观测到 → 推荐 600m（含安全边距） → 自动更新 Pod Spec
```

支持四种模式：
- **Off**：只观察，不修改（适合评估阶段）
- **Initial**：仅在 Pod 创建时注入推荐值
- **Recreate**：驱逐不匹配的 Pod，由控制器重建
- **InPlaceOrRecreate**：优先原地更新（K8s 1.27+），失败则驱逐

---

## 一、整体架构概览

VPA 由 **3 个核心组件** 组成，各自独立运行：

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Vertical Pod Autoscaler (VPA)                    │
├─────────────────────┬─────────────────────┬─────────────────────────┤
│   Recommender       │     Updater         │  Admission Controller   │
│                     │                     │                         │
│  监控资源使用历史     │  检查 Pod 资源是否    │  作为 Mutating Webhook   │
│  计算推荐值并写入     │  匹配推荐值，不匹配    │  在 Pod 创建时自动注入     │
│  VPA Status         │  则驱逐或原地更新     │  推荐资源请求             │
└─────────────────────┴─────────────────────┴─────────────────────────┘
        │                       │                      │
        └───────────────────────┴──────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │  Shared Packages      │
                    │  (apis, client,       │
                    │   target, utils,      │
                    │   features)           │
                    └───────────────────────┘
```

**组件触发方式：**

| 组件 | 触发方式 | 说明 |
|:---|:---|:---|
| **Recommender** | **轮询** (默认 1 分钟) | 主循环每 `--metrics-fetcher-interval`（默认 1min）触发一轮：拉取 Metrics → 更新模型 → 计算推荐值 → 写入 VPA Status |
| **Updater** | **轮询** (默认 1 分钟) | 主循环每 `--updater-interval`（默认 1min）触发一轮：通过 Informer 缓存获取 VPA 及关联 Pod，比对资源请求与推荐范围，不匹配则 Evict 或 InPlace 更新 |
| **Admission Controller** | **Webhook 调用** (MutatingAdmissionWebhook) | K8s API Server 在 Pod **CREATE** 时回调 HTTP 接口，将推荐值注入 Pod Spec（resources.requests；或者VPA创建或更新时，触发。 |


### VPA CRD
```yaml 
Name:         nginx-deployment-basic-vpa
Namespace:    default
Labels:       <none>
Annotations:  <none>
API Version:  autoscaling.k8s.io/v1
Kind:         VerticalPodAutoscaler
Metadata:
  Creation Timestamp:  2026-07-22T07:33:19Z
  Generation:          1
  Resource Version:    9692349125
  UID:                 c1fe1497-1026-4357-8d78-4e9344237aee
Spec:
  Target Ref:
    API Version:  apps/v1
    Kind:         Deployment
    Name:         nginx-deployment-basic
  Update Policy:
    Update Mode:  Off
  resourcePolicy:
    containerPolicies:
    - containerName: "application"
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 2
        memory: 2Gi
      controlledResources:
      - cpu
      - memory
      controlledValues: RequestsAndLimits
Status:
  Conditions:
    Last Transition Time:  2026-07-22T07:33:25Z
    Status:                True
    Type:                  RecommendationProvided
  Recommendation:
    Container Recommendations:
      Container Name:  nginx
      Lower Bound:
        Cpu:     25m
        Memory:  262144k
      Target:
        Cpu:     25m
        Memory:  262144k
      Uncapped Target:
        Cpu:     25m
        Memory:  262144k
      Upper Bound:
        Cpu:     8496m
        Memory:  8882928571
Events:          <none>
```

---

## 二、顶层目录结构

```
vertical-pod-autoscaler/
├── charts/                    # Helm Chart 部署配置
├── common/                    # 公共库（多组件共享的常量与工具）
├── deploy/                    # 部署 YAML（Deployment、RBAC、CRD 等）
├── docs/                      # 文档（components.md、features.md 等）
├── enhancements/              # 增强提案（KEP 式设计文档）
├── hack/                      # 构建/开发脚本
├── pkg/                       # 核心代码（重点）
│   ├── admission-controller/  # Admission Controller 组件
│   ├── apis/                  # CRD API 定义
│   ├── client/                # 生成的 K8s Client（Clientset/Informers/Listers）
│   ├── features/              # Feature Gates 定义
│   ├── recommender/           # Recommender 组件（核心推荐引擎）
│   ├── target/                # Target Selector / Controller Fetcher
│   ├── updater/               # Updater 组件
│   └── utils/                 # 共享工具库
├── test/                      # 测试（e2e、集成测试）
├── go.mod / go.sum            # Go Module 依赖声明
└── README.md
```

---

## 三、核心组件代码结构

### 3.1 Recommender（推荐器）— 核心引擎

Recommender 是 VPA 的**心脏**，负责根据历史 + 实时资源使用数据计算推荐值。

```
pkg/recommender/
├── main.go                    # 入口，启动 Recommender 循环
├── Dockerfile                 # 容器镜像构建
├── Makefile                   # 构建脚本
│
├── model/                     # 集群内存模型
│   ├── cluster.go             #   Cluster 模型定义（Pod/VPA 索引）
│   ├── vpa.go                 #   VPA 对象模型（推荐值存储与读取）
│   ├── container.go           #   Container 模型（资源使用采样）
│   ├── aggregate_container_state.go  #   容器聚合状态（统计信息）
│   ├── aggregations_config.go #   聚合配置（时间窗口等）
│   ├── types.go               #   通用类型定义
│   └── errors.go              #   错误类型定义
│
├── input/                     # 数据采集层
│   ├── cluster_feeder.go      #   ClusterFeeder：监听 K8s 资源变更，喂数据到模型
│   ├── history/               #   历史数据来源（Checkpoint / Prometheus）
│   ├── metrics/               #   Metrics API 实时数据获取
│   ├── oom/                   #   OOM 事件监听（内存推荐修正）
│   └── spec/                  #   Pod Spec 解析
│
├── logic/                     # 推荐逻辑核心
│   ├── recommender.go         #   推荐算法主逻辑
│   └── estimator.go           #   资源估算器
│
├── routines/                  # 运行循环与后处理
│   ├── recommender.go         #   Recommender 主循环（定时采集 → 计算 → 更新）
│   ├── recommender_controller.go  #   单个 VPA 的处理控制器
│   ├── vpa.go                 #   VPA 推荐值更新逻辑
│   ├── capping_post_processor.go  #   Min/Max 范围约束（cappingPolicy）
│   ├── cpu_integer_post_processor.go  #   CPU 整数值处理（如 mCPU 取整）
│   └── recommendation_post_processor.go  #   推荐后处理接口
│
├── checkpoint/                # 推荐值持久化
│   └── checkpoint_writer.go   #   写入 VPACheckpoint CRD（持久化历史统计）
│
├── config/                    # Recommender 配置
│
└── util/                      # Recommender 内部工具
```

**Recommender 主循环流程：**

```
启动
  │
  ├── 1. 从 VPACheckpoint（或 Prometheus）加载历史数据 → 构建模型
  │
  ▼
循环（每 1 分钟，由 config.MetricsFetcherInterval 控制）
  │
  ├── 2. ClusterFeeder 监听 K8s 资源变更（Pod/VPA 增删改）→ 更新模型
  ├── 3. 从 Metrics API 获取实时 CPU/Memory 使用数据 → 更新模型
  ├── 4. 对每个 VPA 执行推荐算法
  │     │
  │     │  ┌──────────────────────────────────────────────────────────
  │     │  │ Estimator 装饰器链 执行顺序（由外到内）：   
  │     │  │                    
  │     │  │  4a. PercentileEstimator 百分位取值                   
  │     │  │        Target:   P90                                  
  │     │  │        Upper:    P95                                  
  │     │  │        Lower:    P50    
  │     │  │  4b. Margin 安全边距（base × 1.15）  
  │     │  │  4c. ConfidenceMultiplier 置信度乘数                    
  │     │  │        Upper: (1+1/confidence)^1                      
  │     │  │        Lower: (1+0.001/confidence)^-2  
  │     │  │  4d. MinResource 确保结果不低于保底（按容器数均分）  
  │     │  └──────────────────────────────────────────────────────────
  │     │                          ↓
  │     │  ┌──────────────────────────────────────────────────────────
  │     │  │ PostProcessor 阶段（Estimator 之后）：                 
  │     │  │                                                      
  │     │  │  4e. CPUIntegerPostProcessor （可选，基于 VPA 注解启用）                        
  │     │  │  4f. CappingPostProcessor应用minAllowed/maxAllowed范围约束               
  │     │  └──────────────────────────────────────────────────────────
  │     │
  ├── 5. 将推荐值写入 VPA Status
  └── 6. CheckpointWriter 持久化聚合统计数据
```

---

### 3.2 Updater（更新器）

Updater 负责检查已有 Pod 的资源是否与推荐值匹配，不匹配时执行驱逐或原地更新。

```
pkg/updater/
├── main.go                    # 入口，启动 Updater 循环
├── Dockerfile                 # 容器镜像构建
├── Makefile                   # 构建脚本
│
├── logic/                     # 核心逻辑
│   └── updater.go             #   Updater 主循环（获取 VPA → 比对 → 驱逐/更新）
│
├── inplace/                   # In-Place 原地更新
│                              #   不重启 Pod，直接修改资源请求（K8s 1.27+）
│
├── priority/                  # 驱逐优先级
│                              #   决定哪些 Pod 优先被驱逐
│
├── restriction/               # 驱逐限制
│                              #   PDB 遵守、单节点驱逐上限等
│
├── config/                    # Updater 配置
│
└── utils/                     # Updater 内部工具
```

**Updater 主循环流程：**

```
每 1 分钟触发一次
       │
       ▼
  Admission Controller 健康？ ──No──→ 跳过本轮
       │ Yes
       ▼
  列出 VPA + 列出 Pod + 建立映射
       │
       ▼
  ┌─ for each VPA ─────────────────────────────
  │                                             
  │  mode=Off/Initial? ──Yes──→ 跳过            
  │       │ No                                  
  │       ▼                                     
  │  InPlace 类模式？                            
  │    ├─ Yes → CanInPlace → PATCH /resize      
  │    │          │ 超时/失败                     
  │    │          ▼                             
  │    │     (InPlaceOrRecreate only)            
  │    │          ▼                             
  │    └──────────→ Evict Pod                    
  │                                             
  │  Recreate 模式？                             
  │    └─ Yes → 优先级排序 → Evict Pod            
  │                                             
  └─────────────────────────────────────────────
```

---

### 3.3 Admission Controller（准入控制器）

作为 Mutating Webhook，在 Pod 创建时自动注入 VPA 推荐的资源请求。

```
pkg/admission-controller/
├── main.go                    # 入口，启动 HTTPS Server + Webhook 注册
├── config.go                  # Webhook 配置（端口、地址、标签等）
├── certs.go                   # TLS 证书管理
├── Dockerfile                 # 容器镜像构建
├── Makefile                   # 构建脚本
│
├── gencerts.sh                # 生成 TLS 证书脚本
├── delete-webhook.sh          # 删除 Webhook 脚本
├── rmcerts.sh                 # 清理证书脚本
│
├── logic/                     # 核心逻辑
│   └── server.go              #   Webhook Server：接收请求 → 匹配 VPA → 生成 JSON Patch
│
├── resource/                  # 资源处理
│                              #   VPA 资源查找、推荐值读取
│
└── config/                    # 准入控制器配置
```

**Admission Controller 处理流程：**

```
Pod CREATE 请求
  │
  ▼
API Server → Mutating Webhook → Admission Controller
  │
  ├── 1. 接收 HTTPS 请求（包含 Pod Spec）
  ├── 2. 查找匹配的 VPA（通过 Namespace + Label Selector）
  ├── 3. 如找到 VPA：
  │     ├── 读取当前推荐值（VPA.Status.Recommendation）
  │     ├── 生成 JSON Patch（修改 containers[].resources.requests）
  │     └── 返回 Patch 给 API Server
  └── 4. 如未找到 VPA：直接放行
```

---

## 四、共享包（Shared Packages）

### 4.1 apis/ — CRD API 定义

```
pkg/apis/
├── autoscaling.k8s.io/        # 正式版 API（autoscaling.k8s.io/v1）
│   ├── v1/                    #   VPA CRD 类型定义
│   │   ├── types.go           #     VerticalPodAutoscaler / VPAStatus / VPARecommendation
│   │   ├── register.go        #     注册到 Scheme
│   │   └── zz_generated.deepcopy.go  #     自动生成的 DeepCopy 方法
│   └── v1beta2/               #   Beta 版 API（向后兼容）
│
└── poc.autoscaling.k8s.io/    # PoC 版 API（v1alpha1，旧版）
    └── v1alpha1/
```

**核心 CRD 类型：**

```go
type VerticalPodAutoscaler struct {
    Spec: VerticalPodAutoscalerSpec {
        TargetRef:          // 目标 workload（如 Deployment）
        UpdatePolicy:       // Off / Initial / Auto
        ResourcePolicy:     // 容器级 min/max 约束
    }
    Status: VerticalPodAutoscalerStatus {
        Recommendation:     // 推荐值（Target / LowerBound / UpperBound）
        Conditions:         // VPA 状态条件
    }
}
```

### 4.2 client/ — 生成的 K8s Client

```
pkg/client/
├── clientset/versioned/       #   强类型 Clientset（CRUD VPA/Checkpoint）
├── informers/externalversions/  # Informer（Watch + 本地缓存）
└── listers/                   #   Lister（从 Informer 缓存中读取）
```

### 4.3 target/ — 目标选择器

```
pkg/target/
├── fetcher.go                 #   VPA Target Selector 解析
└── controller_fetcher/        #   从 VPA.TargetRef 找到 Controller（Deployment/StatefulSet 等）
```

### 4.4 features/ — Feature Gates

```
pkg/features/
├── features.go                #   Feature Gate 定义
└── versioned_features.go      #   按版本控制的特性
```

**已知 Feature Gates：**

| Feature Gate | 说明 |
|:---|:---|
| InPlaceOrRecreate | 支持 InPlace 原地更新模式 |
| InPlaceOnly | 仅使用原地更新（不驱逐） |

### 4.5 utils/ — 共享工具库

```
pkg/utils/
├── annotations/               #   VPA 相关注解处理
├── client/                    #   K8s 客户端工具
├── limitrange/                #   LimitRange 处理
├── metrics/                   #   Metrics API 客户端
├── resources/                 #   资源计算工具（CPU/Memory 转换）
├── server/                    #   HTTP Server 工具
├── status/                    #   VPA Status 更新工具
├── test/                      #   测试工具
└── vpa/                       #   VPA 操作工具（匹配、过滤等）
```

---

## 五、三个组件的协作关系

```
                    ┌──────────────┐
                    │  Metrics API │
                    └──────┬───────┘
                           │ CPU/Memory 使用数据
                           ▼
┌──────────────────────────────────────────────────┐
│                  Recommender                      │
│                                                  │
│  1. 监听 Pod/VPA 变更 → 更新模型                  │
│  2. 定时采集 Metrics → 更新模型                    │
│  3. 运行推荐算法 → 计算推荐值                      │
│  4. 写入 VPA.Status.Recommendation                │
└──────────────────────┬───────────────────────────┘
                       │ VPA Status（推荐值）
          ┌────────────┼────────────┐
          ▼                         ▼
┌─────────────────┐       ┌─────────────────────┐
│  Updater        │       │  Admission Controller│
│                 │       │                      │
│ 1. 读取推荐值    │       │ 1. 拦截 Pod CREATE   │
│ 2. 比对实际资源  │       │ 2. 查找匹配 VPA       │
│ 3. 驱逐/原地更新 │       │ 3. 注入推荐资源请求    │
└─────────────────┘       └─────────────────────┘
         │                          │
         ▼                          ▼
    Evict Pod               Pod 以推荐资源创建
         │
         ▼
  Controller 重建 Pod
         │
         ▼
  触发 Admission Controller
  （新 Pod 自动获得推荐值）
```

---

## 六、UpdatePolicy 模式

VPA 的 `updateMode` 决定了推荐值如何被应用（[官方文档](https://kubernetes.io/docs/concepts/workloads/autoscaling/vertical-pod-autoscale/#update-modes)）：

| 模式 | Recommender | Admission Controller | Updater | 说明 |
|:---|:---:|:---:|:---:|:---|
| **Off** | ✅ 计算推荐值 | ❌ 不注入 | ❌ 不驱逐 | 推荐值仅写入 VPA Status，供手动查看 |
| **Initial** | ✅ 计算推荐值 | ✅ 仅新 Pod 注入 | ❌ 不驱逐已有 Pod | 只在 Pod 创建时注入推荐值 |
| **Recreate** | ✅ 计算推荐值 | ✅ 新 Pod 注入 | ✅ 驱逐不匹配的 Pod | 驱逐后由控制器重建，新 Pod 自动获得推荐值 |
| **InPlaceOrRecreate** | ✅ 计算推荐值 | ✅ 新 Pod 注入 | ✅ 优先原地更新 | 先尝试原地更新，失败则回退为驱逐 |
| **InPlace** | ✅ 计算推荐值 | ✅ 新 Pod 注入 | ✅ 仅原地更新 | Alpha（VPA 1.7.0+，K8s 1.33+），永不驱逐，更新失败则等待重试 |
| ~~**Auto**~~ | ✅ 计算推荐值 | ✅ 新 Pod 注入 | ✅ 驱逐不匹配的 Pod | **已废弃**（VPA 1.4.0+），现为 Recreate 的别名 |

---

## 七、关键源码文件

| 文件 | 组件 | 作用 |
|:---|:---|:---|
| [`pkg/recommender/main.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/recommender/main.go) | Recommender | 入口，初始化并启动主循环 |
| [`pkg/recommender/routines/recommender.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/recommender/routines/recommender.go) | Recommender | 主循环：采集 → 计算 → 更新 |
| [`pkg/recommender/logic/recommender.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/recommender/logic/recommender.go) | Recommender | 推荐算法核心逻辑 |
| [`pkg/recommender/logic/estimator.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/recommender/logic/estimator.go) | Recommender | 资源估算器 |
| [`pkg/recommender/model/vpa.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/recommender/model/vpa.go) | Recommender | VPA 对象模型 |
| [`pkg/recommender/model/aggregate_container_state.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/recommender/model/aggregate_container_state.go) | Recommender | 容器聚合统计 |
| [`pkg/recommender/input/cluster_feeder.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/recommender/input/cluster_feeder.go) | Recommender | K8s 资源监听 + 模型更新 |
| [`pkg/recommender/routines/capping_post_processor.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/recommender/routines/capping_post_processor.go) | Recommender | Min/Max 范围约束 |
| [`pkg/updater/main.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/updater/main.go) | Updater | 入口 |
| [`pkg/updater/logic/updater.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/updater/logic/updater.go) | Updater | 主循环：比对 → 驱逐 |
| [`pkg/updater/inplace/`](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler/pkg/updater/inplace) | Updater | 原地资源更新 |
| [`pkg/admission-controller/main.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/admission-controller/main.go) | AC | 入口，启动 HTTPS Server |
| [`pkg/admission-controller/logic/server.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/admission-controller/logic/server.go) | AC | Webhook Server 核心逻辑 |
| [`pkg/apis/autoscaling.k8s.io/v1/types.go`](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/pkg/apis/autoscaling.k8s.io/v1/types.go) | Shared | VPA CRD 类型定义 |


---

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
