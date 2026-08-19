---
weight: 15
title: "Argo Rollouts"
---

# [Argo Rollouts](https://argoproj.github.io/rollouts/)

> Kubernetes Progressive Delivery Controller — 提供蓝绿部署、金丝雀发布、流量管理和自动化分析能力。CNCF Graduated 项目。

|  Website | Doc           | Github          |  Demo  |     Comment          |
| -------- | --------   | -------    |-------    |-------    |
|  [Argo Rollouts](https://argoproj.github.io/rollouts/)      | [Doc](https://argo-rollouts.readthedocs.io/)  | [Github](https://github.com/argoproj/argo-rollouts)  | [Demo](https://github.com/argoproj/rollouts-demo) | CNCF 毕业项目，K8s 原生渐进式交付控制器 |

---

## Read First

[Docs](https://argo-rollouts.readthedocs.io/en/stable/), [Github](https://github.com/argoproj/argo-rollouts), [CNCF](https://www.cncf.io/projects/argo-rollouts/)

[Concepts](https://argo-rollouts.readthedocs.io/en/stable/concepts/)

[Architecture](https://argo-rollouts.readthedocs.io/en/stable/architecture/)

[Getting Started](https://argo-rollouts.readthedocs.io/en/stable/getting-started/)

[Rollout Specification](https://argo-rollouts.readthedocs.io/en/stable/features/specification/)

[Killercoda Argo Rollouts Labs](https://killercoda.com/argo) — 在线实验环境

---

## 核心概念

### Progressive Delivery（渐进式交付）

渐进式交付是持续交付的演进，通过**限制新版本的暴露范围**→**观察分析行为**→**逐步扩大范围**→**持续验证正确性**，降低发布风险：

- **控制爆炸半径（Blast Radius）**：新版本仅暴露给少量用户
- **自动化推广/回滚**：基于指标分析结果自动决策
- **细粒度流量控制**：按百分比、Header、镜像流量等方式分流

### Rollout CRD

Rollout 是 Argo Rollouts 的核心 CRD，等价于 Kubernetes Deployment 但具备更高级的部署策略：

| 特性 | Deployment | Rollout |
|------|-----------|--------|
| 滚动更新 | ✅ RollingUpdate | ✅ 支持（canary 无 steps 时等同） |
| 蓝绿部署 | ❌ | ✅ |
| 金丝雀发布 | ❌ | ✅ 多阶段百分比控制 |
| 流量精细控制 | ❌ | ✅ 配合 Service Mesh/Ingress |
| 自动化分析 | ❌ | ✅ AnalysisTemplate/AnalysisRun |
| 自动回滚 | ❌ | ✅ 基于指标自动回滚 |
| 人工审批 | ❌ | ✅ pause 步骤 |

### 支持的部署策略

| 策略 | 说明 | 流量切换 | 需要流量管理器 |
|------|------|----------|----------------|
| **Blue-Green** | 新旧版本同时运行，仅旧版本接收流量，验证后一键切换 | 全量切换（0%→100%） | 否 |
| **Canary（基础）** | 按副本数比例分配流量 | 粗粒度百分比 | 否 |
| **Canary + Traffic Routing** | 通过 Service Mesh/Ingress 精细控制流量 | 细粒度百分比 + Header + 镜像 | 是 |

**策略选择指南**：

| 维度 | Blue-Green | 基础 Canary | Canary + 流量管理 |
|------|-----------|-------------|-------------------|
| 采用复杂度 | 低 | 中 | 高 |
| 灵活性 | 低 | 高 | 最高 |
| 需要流量管理器 | 否 | 否 | 是 |
| 适用队列 Worker | 是 | 否 | 否 |
| 适用共享/锁资源 | 是 | 否 | 否 |
| 失败爆炸半径 | 大（全量切换） | 小 | 小 |

---

## 架构

```
┌──────────────────────────────────────────────────────────────────┐
│                    Argo Rollouts Controller                       │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │            Rollout Reconciler (核心控制器)                  │   │
│  │   Watch Rollout CRD → 管理 ReplicaSet → Reconcile 状态     │   │
│  └──────────┬────────────────────────────────┬───────────────┘   │
│             │                                │                    │
│  ┌──────────┴──────────┐   ┌────────────────┴──────────────┐    │
│  │ Traffic Router      │   │ Analysis Controller           │    │
│  │ (操作 Ingress/Mesh) │   │ (创建/监控 AnalysisRun)       │    │
│  └──────────┬──────────┘   └────────────────┬──────────────┘    │
│             │                                │                    │
└─────────────┼────────────────────────────────┼────────────────────┘
              │                                │
    ┌─────────┴─────────┐           ┌──────────┴──────────┐
    │ Ingress/Mesh      │           │ Metric Provider     │
    │ (Istio/NGINX/ALB) │           │ (Prometheus/Datadog)│
    └─────────┬─────────┘           └─────────────────────┘
              │
    ┌─────────┴──────────────────────────────────────┐
    │          K8s 集群 (工作负载层)                    │
    │                                                  │
    │  ┌──────────────┐    ┌──────────────────────┐   │
    │  │ Stable RS    │    │ Canary/New RS        │   │
    │  │ (当前稳定版)  │    │ (新版本/预览版)       │   │
    │  └──────┬───────┘    └──────────┬───────────┘   │
    │         │                       │                │
    │  ┌──────┴───────┐    ┌──────────┴───────────┐   │
    │  │ Stable Svc   │    │ Canary/Preview Svc   │   │
    │  └──────────────┘    └──────────────────────┘   │
    └──────────────────────────────────────────────────┘
```

### 核心组件

| 组件 | 职责 |
|------|------|
| **Rollout Controller** | 主控制器，Watch Rollout CRD，管理 ReplicaSet 的创建/扩缩/删除，驱动状态 Reconcile |
| **Traffic Router** | 操作 Ingress Controller 或 Service Mesh 资源，实现精细流量分割 |
| **Analysis Controller** | 创建 AnalysisRun，查询指标，判断成功/失败/不确定，驱动自动推广或回滚 |
| **Dashboard (UI)** | 可选的 Web UI，可视化 Rollout 进度和状态 |
| **kubectl Plugin** | 可选的 CLI 工具，管理 Rollout 操作（pause/promote/abort 等） |

### 核心 CRD

| CRD | 说明 |
|-----|------|
| **Rollout** | 替代 Deployment 的工作负载资源，定义部署策略（canary/blueGreen）、步骤和分析 |
| **AnalysisTemplate** | 定义指标查询模板（PromQL/SQL/Web），可被多个 Rollout 引用 |
| **ClusterAnalysisTemplate** | 集群级别的分析模板，跨 namespace 共享 |
| **AnalysisRun** | AnalysisTemplate 的一次具体执行实例，记录查询结果和状态 |
| **Experiment** | A/B 测试实验资源，支持多版本同时运行并对比分析 |

---

## 快速开始

### 1. 安装 Controller

```bash
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts \
  -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
```

### 2. 安装 kubectl Plugin（CLI）

```bash
# macOS
brew install argo-rollouts

# 或从 GitHub Releases 下载
# https://github.com/argoproj/argo-rollouts/releases/latest

# 验证安装
kubectl argo rollouts version
```

### 3. 访问 Dashboard

```bash
# 启动 Dashboard
kubectl argo rollouts dashboard

# 默认监听 http://localhost:3100
```

### 4. 创建第一个 Rollout

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: rollouts-demo
spec:
  replicas: 5
  strategy:
    canary:
      steps:
        - setWeight: 20
        - pause: {}
        - setWeight: 40
        - pause: { duration: 10s }
        - setWeight: 60
        - pause: { duration: 10s }
        - setWeight: 80
        - pause: { duration: 10s }
  selector:
    matchLabels:
      app: rollouts-demo
  template:
    metadata:
      labels:
        app: rollouts-demo
    spec:
      containers:
        - name: rollouts-demo
          image: argoproj/rollouts-demo:blue
          ports:
            - containerPort: 8080
```

### 5. 常用操作

```bash
# 查看 Rollout 状态
kubectl argo rollouts get rollout rollouts-demo --watch

# 更新镜像触发滚动
kubectl argo rollouts set image rollouts-demo \
  rollouts-demo=argoproj/rollouts-demo:yellow

# 手动推广（解除 pause）
kubectl argo rollouts promote rollouts-demo

# 中止并回滚
kubectl argo rollouts abort rollouts-demo

# 重试已中止的 Rollout
kubectl argo rollouts retry rollouts-demo

# 重启所有 Pod
kubectl argo rollouts restart rollouts-demo
```

---

## Blue-Green 策略

蓝绿部署同时运行新旧版本，新版本就绪后一次性切换流量：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: bluegreen-demo
spec:
  replicas: 3
  strategy:
    blueGreen:
      activeService: active-service        # 生产流量 Service
      previewService: preview-service      # 预览 Service（仅测试用）
      autoPromotionEnabled: false          # 禁用自动推广（需手动审批）
      autoPromotionSeconds: 30             # 或：就绪后 30s 自动推广
      previewReplicaCount: 1               # 预览阶段只运行 1 个副本
      scaleDownDelaySeconds: 30            # 切换后延迟 30s 缩容旧版本
      prePromotionAnalysis:                # 切换前分析
        templates:
          - templateName: smoke-tests
      postPromotionAnalysis:               # 切换后分析
        templates:
          - templateName: success-rate
  selector:
    matchLabels:
      app: bluegreen-demo
  template:
    metadata:
      labels:
        app: bluegreen-demo
    spec:
      containers:
        - name: app
          image: myapp:v1
```

**Blue-Green 流程**：

```
1. 新版本 ReplicaSet 创建（Preview Service 指向新版本）
   ┌─────────┐     ┌─────────┐
   │ Active  │     │ Preview │
   │  (v1)   │     │  (v2)   │
   │ ← 流量  │     │ ← 测试  │
   └─────────┘     └─────────┘

2. Pre-Promotion Analysis 通过（或手动 Promote）

3. Active Service 切换到 v2
   ┌─────────┐     ┌─────────┐
   │ Active  │     │ Preview │
   │  (v2)   │     │  (v1)   │
   │ ← 流量  │     │ (缩容中) │
   └─────────┘     └─────────┘

4. Post-Promotion Analysis → 确认成功 → 缩容旧版本
```

**关键配置**：

| 字段 | 说明 |
|------|------|
| `activeService` | 指向当前生产版本的 Service（必需） |
| `previewService` | 指向新版本的预览 Service（可选） |
| `autoPromotionEnabled` | 是否自动推广（默认 `true`） |
| `autoPromotionSeconds` | 就绪后延迟 N 秒自动推广 |
| `previewReplicaCount` | 预览阶段运行的副本数 |
| `scaleDownDelaySeconds` | 切换后旧版本延迟缩容（默认 30s，确保 IP 表传播） |
| `prePromotionAnalysis` | 切换前执行的自动分析 |
| `postPromotionAnalysis` | 切换后执行的自动分析 |

---

## Canary 策略

### 基础 Canary（无流量管理器）

通过 ReplicaSet 副本数比例分配流量：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: canary-demo
spec:
  replicas: 10
  strategy:
    canary:
      steps:
        - setWeight: 10        # 10% 流量 → canary (1/10 pods)
        - pause: {}             # 等待人工审批
        - setWeight: 30        # 30% 流量 → canary (3/10 pods)
        - pause: { duration: 5m }  # 等待 5 分钟
        - setWeight: 50        # 50%
        - pause: { duration: 5m }
        - setWeight: 100       # 全量
  selector:
    matchLabels:
      app: canary-demo
  template:
    metadata:
      labels:
        app: canary-demo
    spec:
      containers:
        - name: app
          image: myapp:v2
```

### Canary + Traffic Routing（精细流量控制）

配合 Service Mesh/Ingress 实现精细流量分割：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: canary-traffic-demo
spec:
  replicas: 5
  strategy:
    canary:
      canaryService: canary-service     # Canary Service
      stableService: stable-service     # Stable Service
      trafficRouting:
        istio:                          # 使用 Istio 流量管理
          virtualService:
            name: myapp-vsvc
            routes:
              - primary
      steps:
        - setWeight: 5
        - pause: {}
        - setWeight: 20
        - analysis:                     # 步骤间插入分析
            templates:
              - templateName: success-rate
        - setWeight: 50
        - pause: { duration: 10m }
        - setWeight: 100
  selector:
    matchLabels:
      app: canary-traffic-demo
  template:
    metadata:
      labels:
        app: canary-traffic-demo
    spec:
      containers:
        - name: app
          image: myapp:v2
```

### Canary Steps 全部类型

| Step | 说明 |
|------|------|
| `setWeight: <0-100>` | 设置 canary 流量百分比 |
| `pause: {}` | 无限期暂停，等待手动 promote |
| `pause: { duration: 5m }` | 暂停指定时间后自动继续 |
| `setCanaryScale: { replicas: 3 }` | 设置 canary 副本数（不影响流量权重） |
| `setCanaryScale: { weight: 25 }` | 按比例设置 canary 副本数 |
| `setCanaryScale: { matchTrafficWeight: true }` | canary 副本数匹配流量权重 |
| `analysis: { templates: [...] }` | 执行内联分析 |
| `experiment: { ... }` | 执行内联实验 |
| `setHeaderRoute: { ... }` | 设置基于 Header 的路由（仅 Istio） |
| `setMirrorRoute: { ... }` | 设置流量镜像路由（仅 Istio） |
| `plugin: { name: ..., config: ... }` | 执行自定义插件 |

---

## 流量管理

Argo Rollouts 通过操纵 Ingress Controller 或 Service Mesh 资源实现精细流量控制：

### 支持的流量管理器

| 类型 | 提供者 | 说明 |
|------|--------|------|
| **Service Mesh** | [Istio](https://argo-rollouts.readthedocs.io/en/stable/features/traffic-management/istio/) | 最完整支持（Header/Mirror/权重） |
| **Service Mesh** | [SMI](https://argo-rollouts.readthedocs.io/en/stable/features/traffic-management/smi/) | Service Mesh Interface（Linkerd 等） |
| **Ingress** | [NGINX](https://argo-rollouts.readthedocs.io/en/stable/features/traffic-management/nginx/) | NGINX Ingress Controller |
| **Ingress** | [AWS ALB](https://argo-rollouts.readthedocs.io/en/stable/features/traffic-management/alb/) | AWS ALB Ingress Controller |
| **Ingress** | [Apache APISIX](https://argo-rollouts.readthedocs.io/en/stable/features/traffic-management/apisix/) | Apache APISIX 网关 |
| **Ingress** | [Kong](https://argo-rollouts.readthedocs.io/en/stable/features/traffic-management/kong/) | Kong Ingress |
| **Ingress** | [Traefik](https://argo-rollouts.readthedocs.io/en/stable/features/traffic-management/traefik/) | Traefik Proxy |
| **Ingress** | [Ambassador](https://argo-rollouts.readthedocs.io/en/stable/features/traffic-management/ambassador/) | Ambassador Edge Stack |
| **Ingress** | [Google Cloud](https://argo-rollouts.readthedocs.io/en/stable/features/traffic-management/google-cloud/) | Google Cloud Load Balancer |
| **Plugin** | [Gateway API](https://argo-rollouts.readthedocs.io/en/stable/features/traffic-management/plugins/) | 通过 Plugin 支持 Gateway API |

> 支持**同时使用多个流量管理器**（如 Istio + NGINX），实现更复杂的流量路由场景。

### 流量管理配置示例（Istio）

```yaml
strategy:
  canary:
    canaryService: canary-service
    stableService: stable-service
    trafficRouting:
      managedRoutes:              # 管理路由的优先级
        - name: set-header-1
        - name: mirror-route
      istio:
        virtualService:
          name: myapp-vsvc
          routes:
            - primary
    steps:
      # 1. 设置权重
      - setWeight: 20
      # 2. Header 路由（带特定 Header 的请求全部路由到 canary）
      - setHeaderRoute:
          name: set-header-1
          match:
            - headerName: X-Canary
              headerValue:
                exact: "true"
      - pause: {}
      # 3. 流量镜像（将匹配流量镜像到 canary）
      - setMirrorRoute:
          name: mirror-route
          percentage: 35
          match:
            - method:
                exact: GET
              path:
                prefix: /api
      - pause: { duration: 10m }
      # 4. 清理路由
      - setHeaderRoute:
          name: set-header-1      # 仅 name = 删除路由
      - setMirrorRoute:
          name: mirror-route
      - setWeight: 100
```

---

## Analysis（自动化分析）

Analysis 是 Argo Rollouts 的核心差异化能力——通过查询指标自动判断新版本是否成功：

### 分析结果

| 结果 | 含义 | 行为 |
|------|------|------|
| **Successful** | 指标符合预期 | 自动推广到下一阶段 |
| **Failed** | 指标不符合预期 | 自动中止并回滚 |
| **Inconclusive** | 无法判断 | 暂停 Rollout，等待人工介入 |

### AnalysisTemplate 示例

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  args:
    - name: service-name
    - name: stable-hash
    - name: latest-hash
  metrics:
    - name: success-rate
      interval: 5m                    # 每 5 分钟查询一次
      provider:
        prometheus:
          address: http://prometheus:9090
          query: |
            sum(rate(
              requests_total{service="{{args.service-name}}", status=~"2.."}[5m]
            )) / sum(rate(
              requests_total{service="{{args.service-name}}"}[5m]
            ))
      successCondition: result[0] >= 0.95    # 成功率 >= 95% 则成功
      failureLimit: 3                         # 连续 3 次失败则回滚
      consecutiveErrorLimit: 2              # 连续 2 次查询错误则暂停
```

### 支持的指标提供者

| Provider | 说明 |
|----------|------|
| **Prometheus** | 最常用的开源监控方案 |
| **Datadog** | SaaS 监控平台 |
| **New Relic** | APM 平台 |
| **Wavefront** | VMware Tanzu 监控 |
| **InfluxDB** | 时序数据库 |
| **Graphite** | 轻量级监控 |
| **Kayenta** | Netflix 金丝雀分析引擎 |
| **Web** | HTTP Webhook 调用 |
| **Job** | Kubernetes Job（自定义检查逻辑） |
| **CloudWatch** | AWS CloudWatch Metrics |

### Analysis 触发时机

| 触发方式 | 适用策略 | 说明 |
|----------|----------|------|
| **Background Analysis** | Canary | 在整个 canary 过程中持续运行 |
| **Inline Analysis** | Canary Steps | 作为 canary step 在特定阶段执行 |
| **Pre-Promotion Analysis** | Blue-Green | 在流量切换前执行 |
| **Post-Promotion Analysis** | Blue-Green | 在流量切换后执行 |

```yaml
# Background Analysis（canary 过程中持续监控）
strategy:
  canary:
    analysis:
      templates:
        - templateName: success-rate
      args:
        - name: service-name
          value: myapp-svc

# Inline Analysis（作为 canary step 执行）
steps:
  - setWeight: 20
  - analysis:
      templates:
        - templateName: smoke-tests
  - setWeight: 50
```

---

## Experiments（实验/A-B 测试）

Experiment 允许在不影响生产流量的情况下，同时运行多个版本并进行对比分析：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Experiment
metadata:
  name: my-experiment
spec:
  duration: 1h                  # 实验持续 1 小时
  templates:
    - name: baseline
      specRef: stable           # 基于稳定版本 ReplicaSet 模板
    - name: canary
      specRef: canary           # 基于新版本 ReplicaSet 模板
      weight: 10                # 分配 10% 流量
  analyses:
    - name: compare
      templateName: mann-whitney    # 对比分析模板
```

**Experiment 也可嵌入 Canary Steps**：

```yaml
steps:
  - setWeight: 20
  - experiment:
      duration: 1h
      templates:
        - name: baseline
          specRef: stable
        - name: canary
          specRef: canary
          weight: 10
      analyses:
        - name: mann-whitney
          templateName: mann-whitney
```

---

## Rollout Spec 关键字段

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: my-rollout
spec:
  replicas: 5                          # 期望副本数
  revisionHistoryLimit: 3              # 保留历史 ReplicaSet 数量（默认 10）
  minReadySeconds: 30                  # Pod 就绪后等待时间
  progressDeadlineSeconds: 600         # 更新超时时间（默认 600s）
  progressDeadlineAbort: false         # 超时是否自动中止
  rollbackWindow:
    revisions: 3                       # 快速回滚窗口（跳过 analysis）

  # Pod 模板（与 Deployment 一致）
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: app
          image: myapp:v1

  # 或使用 workloadRef 引用现有 Deployment
  workloadRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-deployment
    scaleDown: onsuccess              # never | onsuccess | progressively

  strategy:
    canary: { ... }                   # 或 blueGreen: { ... }
```

### WorkloadRef（引用已有 Deployment）

允许不修改现有 Deployment spec 的情况下，将其迁移到 Rollout 管理：

```yaml
spec:
  workloadRef:
    apiVersion: apps/v1
    kind: Deployment
    name: existing-deployment
    scaleDown: progressively     # 逐步缩容原 Deployment
```

| scaleDown 模式 | 说明 |
|----------------|------|
| `never` | 不缩容原 Deployment（并行运行） |
| `onsuccess` | Rollout 健康后缩容原 Deployment |
| `progressively` | Rollout 扩缩时同步缩容原 Deployment |

---

## 与 Argo CD 集成

Argo Rollouts 与 Argo CD 配合实现完整的 GitOps 渐进式交付：

```yaml
# Argo CD Application 管理 Rollout 定义
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/myapp-config
    path: kustomize/production
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: myapp
  syncPolicy:
    automated:
      selfHeal: true
      prune: true
```

**工作流**：

```
1. CI 构建镜像 → 推送到 Registry
2. CI 更新 Git 中的镜像 tag（kustomize edit set image ...）
3. Argo CD 检测 Git 变更 → 同步 Rollout YAML 到集群
4. Argo Rollouts Controller 检测 Rollout spec 变更
5. 执行 Canary/BlueGreen 策略 → Analysis 自动分析
6. 成功 → 自动推广 / 失败 → 自动回滚
```

> **重要**：Argo CD 的 `syncPolicy.automated` 与 Rollout 的 `strategy` 不冲突。Argo CD 负责将 Rollout YAML 同步到集群（声明式管理），Rollout Controller 负责执行部署策略（渐进式交付）。

---

## 常用 CLI 命令

```bash
# 状态查看
kubectl argo rollouts get rollout <name>              # 查看 Rollout 状态
kubectl argo rollouts get rollout <name> --watch       # 实时观察
kubectl argo rollouts list rollouts                    # 列出所有 Rollout
kubectl argo rollouts history <name>                   # 查看历史版本

# 部署操作
kubectl argo rollouts set image <rollout> <container>=<image>  # 更新镜像
kubectl argo rollouts promote <name>                   # 手动推广
kubectl argo rollouts promote <name> --full            # 跳过所有步骤直接全量
kubectl argo rollouts abort <name>                     # 中止（回滚）
kubectl argo rollouts retry <name>                     # 重试已中止的 Rollout
kubectl argo rollouts restart <name>                   # 重启所有 Pod
kubectl argo rollouts pause <name>                     # 手动暂停
kubectl argo rollouts undo <name>                      # 回滚到上一版本

# 流量管理
kubectl argo rollouts set-weight <name> <weight>       # 手动设置流量权重
kubectl argo rollouts set-mirror <name> <percentage>   # 设置流量镜像

# Analysis
kubectl argo rollouts get analysisrun <name>           # 查看分析运行
kubectl argo rollouts terminate <name>                 # 终止分析运行

# Dashboard
kubectl argo rollouts dashboard                        # 启动 Web UI

# 版本
kubectl argo rollouts version                          # 查看 CLI 版本
```

---

## 最佳实践

| 实践 | 说明 |
|------|------|
| **从 Blue-Green 开始** | 入门简单，不需要流量管理器，适合初期采用 |
| **逐步迁移到 Canary** | 建立信心后切换到 Canary + Traffic Routing 获得更细粒度控制 |
| **使用 Analysis 自动化** | 避免纯人工审批，通过指标分析自动推广/回滚 |
| **配合 HPA** | Rollout 与 HPA 兼容，支持根据流量自动扩缩容 |
| **配合 VPA** | 支持 VPA 自动调整资源请求/限制 |
| **Rollback Window** | 设置 `rollbackWindow.revisions` 实现快速回滚（跳过 Analysis） |
| **Ephemeral Metadata** | 使用 `canaryMetadata`/`stableMetadata` 给不同版本 Pod 打标签（用于监控区分） |
| **scaleDownDelaySeconds** | Blue-Green 切换后保留旧版本至少 30s，确保 IP 表传播完成 |
| **progressDeadlineSeconds** | 设置合理超时，防止 Rollout 无限卡住 |
| **与 Argo CD 集成** | Argo CD 管理 Rollout YAML，Rollout Controller 管理实际部署 |

### 从 Deployment 迁移

```bash
# 1. 安装 Argo Rollouts Controller
# 2. 将 Deployment 改为 Rollout（apiVersion: argoproj.io/v1alpha1, kind: Rollout）
# 3. 添加 strategy 字段（canary 或 blueGreen）
# 4. kubectl apply 即可

# 或使用 workloadRef 渐进迁移（不修改现有 Deployment）
```

---

## Question

#### 基础概念

| # | 问题 | 参考答案 |
|---|------|----------|
| 1 | **Argo Rollouts 解决了 Kubernetes Deployment 的什么问题？** | Deployment 的 RollingUpdate 策略缺乏：(1) 精细流量控制；(2) 外部指标验证；(3) 自动回滚能力；(4) 人工审批机制。Rollout 提供蓝绿/金丝雀部署 + 自动分析 + 流量管理的完整渐进式交付方案。 |
| 2 | **Blue-Green 和 Canary 策略的核心区别是什么？** | Blue-Green 是全量切换（0%→100%），新旧版本同时运行但流量只走一个；Canary 是渐进式发布（5%→20%→50%→100%），两个版本同时接收流量。Blue-Green 更简单但爆炸半径大，Canary 更灵活但需要流量管理器才能发挥最大价值。 |
| 3 | **Argo Rollouts 的核心 CRD 有哪些？** | Rollout（替代 Deployment 的工作负载）、AnalysisTemplate（指标查询模板）、AnalysisRun（分析执行实例）、Experiment（A/B 测试实验）、ClusterAnalysisTemplate（集群级分析模板）。 |

#### 部署策略

| # | 问题 | 参考答案 |
|---|------|----------|
| 4 | **Canary 的 setWeight 在无 Traffic Routing 时如何实现流量分割？** | 通过调整 ReplicaSet 副本数比例。例如 10 个副本 setWeight: 20 → canary RS 运行 2 个 Pod，stable RS 运行 8 个 Pod。Service 的负载均衡按 Pod 数量分配流量，实现粗粒度百分比控制。 |
| 5 | **Blue-Green 的 prePromotionAnalysis 和 postPromotionAnalysis 分别何时执行？** | `prePromotionAnalysis` 在新版本 ReplicaSet 就绪后、Active Service 切换前执行——用于验证新版本功能正确性；`postPromotionAnalysis` 在 Active Service 切换后执行——用于验证生产流量下新版本的表现。 |
| 6 | **什么是 setCanaryScale？和 setWeight 有什么区别？** | `setWeight` 控制流量百分比（通过 Traffic Router 或副本数），`setCanaryScale` 仅控制 canary 的副本数而不改变流量权重。适用于需要先扩容 canary Pod（如配合 HPA 预热）再逐步增加流量的场景。 |

#### 流量管理与分析

| # | 问题 | 参考答案 |
|---|------|----------|
| 7 | **Argo Rollouts 支持哪些流量管理器？** | Istio、SMI（Linkerd）、NGINX Ingress、AWS ALB、Apache APISIX、Kong、Traefik、Ambassador、Google Cloud、Gateway API（Plugin）。支持同时使用多个流量管理器。 |
| 8 | **Analysis 的三种结果（Successful/Failed/Inconclusive）分别触发什么行为？** | Successful → 自动推进到下一阶段；Failed → 自动中止并回滚到稳定版本；Inconclusive → 暂停 Rollout 等待人工介入。这使得发布过程可以基于客观指标自动化决策。 |
| 9 | **AnalysisTemplate 和 AnalysisRun 的关系是什么？** | AnalysisTemplate 是可复用的"模板"，定义要查询什么指标和判断条件；AnalysisRun 是一次具体"执行"，绑定到特定 Rollout 并记录查询结果。类似 Deployment（模板）和 ReplicaSet（实例）的关系。 |

#### 生产实践

| # | 问题 | 参考答案 |
|---|------|----------|
| 10 | **Argo Rollouts 如何与 Argo CD 配合？** | Argo CD 负责 GitOps（将 Rollout YAML 从 Git 同步到集群），Rollout Controller 负责渐进式交付（执行 canary/blueGreen 策略）。两者职责分离，互不冲突。Argo CD 管理"声明式状态"，Rollout 管理"实际部署过程"。 |
| 11 | **什么是 Rollback Window？为什么需要它？** | `rollbackWindow.revisions: N` 定义最近 N 个版本为快速回滚窗口。当回滚到窗口内的版本时，Rollout 跳过 Analysis 直接切换——因为这些版本之前已经通过分析验证，无需重复检查，加速回滚过程。 |
| 12 | **Ephemeral Metadata 的用途是什么？** | `canaryMetadata`/`stableMetadata` 在部署期间给不同版本的 Pod 注入临时 labels/annotations，用于：(1) Prometheus 按版本区分指标；(2) 日志系统按版本过滤；(3) Istio 路由规则匹配。部署结束后自动清除。 |

---

## Reference

[Argo Rollouts Official Documentation](https://argo-rollouts.readthedocs.io/en/stable/)

[Argo Rollouts GitHub Repository](https://github.com/argoproj/argo-rollouts)

[Argo Rollouts Examples](https://github.com/argoproj/argo-rollouts/tree/master/examples)

[Argo Rollouts Demo Application](https://github.com/argoproj/rollouts-demo)

[Killercoda Argo Rollouts Labs](https://killercoda.com/argo)

[CNCF Argo Rollouts Project Page](https://www.cncf.io/projects/argo-rollouts/)

[Awesome Argo](https://github.com/akuity/awesome-argo)

[Argo Blog](https://blog.argoproj.io/)

[]()

[]()

[]()

[]()

[]()

[]()
