---
weight: 16
title: "Argo Events"
---

# [Argo Events](https://argoproj.github.io/argo-events/)

> Kubernetes Event-Driven Workflow Automation Framework — 事件驱动的工作流自动化框架，监听 20+ 事件源并触发 Argo Workflows、K8s 资源、Serverless 等动作。CNCF Graduated（Argo 项目家族成员）。

|  Website | Doc           | Github          |  Demo  |     Comment          |
| -------- | --------   | -------    |-------    |-------    |
|  [Argo Events](https://argoproj.github.io/argo-events/)      | [Doc](https://argoproj.github.io/argo-events/)  | [Github](https://github.com/argoproj/argo-events)  | [Demo](https://workflows.apps.argoproj.io/event-flow/argo?showWorkflows=true) | CNCF 毕业项目，事件驱动依赖管理，支持多种事件源 |

---

## Read First

[Docs](https://argoproj.github.io/argo-events/), [Github](https://github.com/argoproj/argo-events), [CNCF](https://www.cncf.io/projects/argo/)

[Concepts - Architecture](https://argoproj.github.io/argo-events/concepts/architecture/)

[Concepts - EventSource](https://argoproj.github.io/argo-events/concepts/event_source/)

[Concepts - Sensor](https://argoproj.github.io/argo-events/concepts/sensor/)

[Concepts - EventBus](https://argoproj.github.io/argo-events/concepts/eventbus/)

[Concepts - Trigger](https://argoproj.github.io/argo-events/concepts/trigger/)

[Getting Started](https://argoproj.github.io/argo-events/quick_start/)

[Tutorial - Introduction](https://argoproj.github.io/argo-events/tutorials/01-introduction/)

[Tutorial - Parameterization](https://argoproj.github.io/argo-events/tutorials/02-parameterization/)

---

## 核心概念

### Event-Driven Architecture（事件驱动架构）

Argo Events 将 Kubernetes 集群转变为**事件驱动**的平台：监听外部事件（Webhook、Git、日历、消息队列等）→ 转换为 CloudEvents → 通过 EventBus 传递 → Sensor 匹配依赖条件 → 触发下游动作（Argo Workflows、K8s 资源、HTTP 请求等）。

- **解耦事件源与触发器**：EventSource 只负责收事件，Sensor 只负责消费和触发
- **CloudEvents 兼容**：所有事件统一转换为 [CloudEvents](https://cloudevents.io/) 规范格式
- **多事件依赖**：Sensor 可以等待多个事件同时满足条件后才触发（AND/OR 逻辑）
- **参数化传递**：事件 payload 可以通过参数提取注入到触发的资源中

### 四大核心组件

| 组件 | 职责 | 类比 |
|------|------|------|
| **EventSource** | 监听外部事件源，转换为 CloudEvents，发布到 EventBus | 消息生产者 |
| **EventBus** | 事件传输层，连接 EventSource 和 Sensor | 消息队列 |
| **Sensor** | 订阅 EventBus 事件，管理事件依赖条件，解析后执行触发 | 消息消费者 + 调度器 |
| **Trigger** | Sensor 解析依赖后执行的具体动作（创建 Workflow、K8s 资源等） | 执行动作 |

### 事件流转

```
1. EventSource 监听外部事件（如 Webhook POST 请求）
        │
        ▼
2. EventSource 将事件转换为 CloudEvents 格式
        │
        ▼
3. EventSource 将 CloudEvents 发布到 EventBus
        │
        ▼
4. Sensor 订阅 EventBus，接收事件
        │
        ▼
5. Sensor 检查事件依赖（dependencies）是否满足
   （可定义过滤条件、AND/OR 逻辑）
        │
        ▼
6. 依赖满足 → Sensor 执行 Trigger
   （创建 Argo Workflow / K8s 资源 / HTTP 请求等）
        │
        ▼
7. Trigger 可从事件 payload 提取参数
   注入到触发的资源中（参数化）
```

---

## 架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Argo Events 控制平面                              │
│                                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
│  │ EventSource         │  │ Sensor Controller   │  │ EventBus        │ │
│  │ Controller          │  │                     │  │ Controller      │ │
│  │ (管理 EventSource   │  │ (管理 Sensor CRD    │  │ (管理 EventBus  │ │
│  │  CRD，创建 Pod)     │  │  CRD，创建 Pod)     │  │  CRD，创建      │ │
│  └──────────┬──────────┘  └──────────┬──────────┘  │  NATS/Kafka)    │ │
└─────────────┼──────────────────────────┼────────────┴─────────────────┘
              │                          │
┌─────────────┼──────────────────────────┼─────────────────────────────────┐
│             │           数据平面         │                                 │
│  ┌──────────┴──────────┐  ┌───────────┴──────────┐                      │
│  │ EventSource Pod      │  │ Sensor Pod           │                      │
│  │ (监听外部事件)       │  │ (订阅事件+触发)      │                      │
│  │                      │  │                      │                      │
│  │ ┌──────────────────┐│  │ ┌──────────────────┐ │                      │
│  │ │ Webhook Server   ││  │ │ Dependency Check  │ │                      │
│  │ │ S3 Listener      ││  │ │ (条件匹配)        │ │                      │
│  │ │ Cron Timer       ││  │ │                  │ │                      │
│  │ │ Kafka Consumer   ││  │ │ Trigger Executor  │ │                      │
│  │ └────────┬─────────┘│  │ └────────┬─────────┘ │                      │
│  └──────────┼───────────┘  └──────────┼──────────┘                      │
│             │                         │                                 │
│             │     ┌───────────┐        │                                 │
│             └────▶│ EventBus  │───────▶│                                 │
│                   │ (NATS/    │        │                                 │
│                   │  Kafka)  │        │                                 │
│                   └───────────┘        │                                 │
└─────────────────────────────────────────┼─────────────────────────────────┘
                                          │
                              ┌───────────┴───────────┐
                              │   触发目标 (Trigger)    │
                              │                         │
                              │  ┌───────────────────┐  │
                              │  │ Argo Workflow     │  │
                              │  │ K8s Object (CRD)  │  │
                              │  │ HTTP Request      │  │
                              │  │ AWS Lambda        │  │
                              │  │ Slack Message     │  │
                              │  └───────────────────┘  │
                              └─────────────────────────┘
```

### 核心组件

| 组件 | 职责 |
|------|------|
| **EventSource Controller** | 主控制器之一，Watch EventSource CRD，为每个 EventSource 创建对应的 Pod 和 Service |
| **Sensor Controller** | 主控制器之一，Watch Sensor CRD，为每个 Sensor 创建对应的 Pod 和 Service |
| **EventBus Controller** | 管理 EventBus CRD，部署 NATS JetStream 或 Kafka 集群作为事件传输层 |
| **Validating Webhook**（可选） | 对 EventSource 和 Sensor 资源进行准入验证（lint），防止错误配置 |
| **EventSource Pod** | 数据平面组件，实际监听外部事件源（HTTP Server、消息消费者等） |
| **Sensor Pod** | 数据平面组件，订阅 EventBus 事件，检查依赖条件，执行触发动作 |

### 核心 CRD

| CRD | 说明 |
|-----|------|
| **EventSource** | 定义外部事件源配置（如 Webhook 端口/路径、Kafka 地址、Cron 表达式），创建对应的监听 Pod |
| **EventBus** | 定义事件传输层（NATS Native / NATS JetStream / Kafka），连接 EventSource 和 Sensor |
| **Sensor** | 定义事件依赖（dependencies）和触发器（triggers），监听 EventBus 事件并执行触发 |

---

## 快速开始

### 1. 安装 Argo Events Controller

```bash
# 创建命名空间
kubectl create namespace argo-events

# 安装 EventSource、Sensor、EventBus 控制器
kubectl apply -f https://raw.githubusercontent.com/argoproj/argo-events/stable/manifests/install.yaml

# 可选：安装 Validating Admission Webhook
kubectl apply -f https://raw.githubusercontent.com/argoproj/argo-events/stable/manifests/install-validating-webhook.yaml
```

### 2. 部署 EventBus

EventBus 是 EventSource 和 Sensor 之间的传输层，必须先创建：

```bash
# 部署 NATS Native EventBus
kubectl apply -n argo-events \
  -f https://raw.githubusercontent.com/argoproj/argo-events/stable/examples/eventbus/native.yaml

# 确认 EventBus Pod 运行
kubectl -n argo-events get pods | grep eventbus
```

```yaml
# EventBus 示例（NATS Native）
apiVersion: argoproj.io/v1alpha1
kind: EventBus
metadata:
  name: default
spec:
  nats:
    native:
      replicas: 3              # 最少 3 个副本
      auth: token               # 认证策略：none 或 token
      # persistence:             # 持久化存储（可选）
      #   storageClassName: standard
      #   accessMode: ReadWriteOnce
      #   volumeSize: 10Gi
```

### 3. 创建 EventSource（Webhook 示例）

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventSource
metadata:
  name: webhook
spec:
  service:
    ports:
      - port: 12000
        targetPort: 12000
  webhook:
    example:
      port: "12000"            # HTTP 服务器端口
      endpoint: /example       # 监听路径
      method: POST             # 允许的 HTTP 方法
```

```bash
kubectl apply -n argo-events -f webhook-eventsource.yaml

# EventSource Controller 会自动创建 Pod 和 Service
kubectl -n argo-events get pods | grep webhook
kubectl -n argo-events get svc | grep webhook
```

### 4. 配置 RBAC（Sensor 需要 ServiceAccount）

```bash
# Sensor RBAC（允许触发 Argo Workflow）
kubectl apply -n argo-events \
  -f https://raw.githubusercontent.com/argoproj/argo-events/master/examples/rbac/sensor-rbac.yaml

# Workflow RBAC（允许 Argo Workflow 运行）
kubectl apply -n argo-events \
  -f https://raw.githubusercontent.com/argoproj/argo-events/master/examples/rbac/workflow-rbac.yaml
```

### 5. 创建 Sensor（触发 Argo Workflow）

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Sensor
metadata:
  name: webhook
spec:
  template:
    serviceAccountName: operate-workflow-sa    # 触发 Argo Workflow 需要的 SA
  dependencies:
    - name: test-dep                          # 事件依赖名称
      eventSourceName: webhook                # 关联的 EventSource
      eventName: example                      # EventSource 中的事件名称
  triggers:
    - template:
        name: webhook-workflow-trigger
        k8s:
          operation: create                   # 操作类型：create/update/delete
          source:
            resource:                         # 要创建的 K8s 资源
              apiVersion: argoproj.io/v1alpha1
              kind: Workflow
              metadata:
                generateName: webhook-        # 自动生成名称
              spec:
                entrypoint: whalesay
                arguments:
                  parameters:
                    - name: message
                      value: hello world       # 默认值，会被事件 payload 覆盖
                templates:
                  - name: whalesay
                    inputs:
                      parameters:
                        - name: message
                    container:
                      image: docker/whalesay:latest
                      command: [cowsay]
                      args: ["{{inputs.parameters.message}}"]
          parameters:                          # 参数绑定
            - src:
                dependencyName: test-dep
                dataKey: body                  # 从事件 payload 的 body 提取数据
              dest: spec.arguments.parameters.0.value
```

### 6. 触发事件并验证

```bash
# 端口转发到 EventSource Service
kubectl -n argo-events port-forward svc/webhook-eventsource-svc 12000:12000

# 发送 POST 请求触发事件
curl -d '{"message":"this is my first webhook"}' \
  -H "Content-Type: application/json" \
  -X POST http://localhost:12000/example

# 验证 Argo Workflow 被触发
kubectl -n argo-events get workflows | grep webhook

# 查看 Workflow 日志
kubectl -n argo-events logs -f $(kubectl -n argo-events get workflows -l argo-events=sensor-name -o name | head -1)
```

---

## EventSource（事件源）

EventSource 定义外部事件源的连接配置，将事件转换为 CloudEvents 发布到 EventBus。

### 支持的事件源（20+）

| 类别 | 事件源 | 说明 |
|------|--------|------|
| **Webhook** | Webhook | 通用 HTTP 端点，接收任意 POST 请求 |
| **Git** | GitHub | GitHub Webhook（Push/PR/Issue 等） |
| | GitLab | GitLab Webhook |
| | Bitbucket | Bitbucket Webhook |
| | Bitbucket Server | Bitbucket Server Webhook |
| **存储** | AWS S3 (Minio) | S3 桶事件（文件上传/删除） |
| | HDFS | Hadoop HDFS 文件事件 |
| | NetApp StorageGrid | StorageGrid 事件 |
| **消息队列** | Kafka | Apache Kafka 消费者 |
| | NATS | NATS 消息消费者 |
| | MQTT | MQTT 消息消费者 |
| | AMQP | AMQP/RabbitMQ 消费者 |
| | NSQ | NSQ 消息队列消费者 |
| | Pulsar | Apache Pulsar 消费者 |
| | Redis | Redis Stream 消费者 |
| **云服务** | AWS SNS | SNS 通知 |
| | AWS SQS | SQS 队列 |
| | GCP PubSub | Google Cloud Pub/Sub |
| | Azure Events Hub | Azure Event Hubs |
| | Azure Queue Storage | Azure Queue Storage |
| **调度** | Calendar | Cron 定时器（interval 或 schedule） |
| **K8s** | K8s Resources | 监听 K8s 资源变化（Pod/Deployment 等） |
| **其他** | File | 文件系统事件 |
| | Slack | Slack 事件 |
| | Stripe | Stripe Webhook |
| | Emitter | Emitter.io 消息 |
| | Generic | 通用事件源（自定义） |

### Webhook EventSource

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventSource
metadata:
  name: webhook
spec:
  service:
    ports:
      - port: 12000
        targetPort: 12000
  webhook:
    example:
      port: "12000"
      endpoint: /example
      method: POST
    # 一个 EventSource 可运行多个 HTTP 服务器
    # example-secure:
    #   port: "13000"
    #   endpoint: /secure
    #   method: POST
    #   serverCertSecret:        # TLS 证书
    #     name: my-secret
    #     key: cert-key
    #   serverKeySecret:
    #     name: my-secret
    #     key: pk-key
```

### Calendar EventSource

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventSource
metadata:
  name: calendar
spec:
  calendar:
    # 每 10 秒触发一次
    example-with-interval:
      interval: 10s

    # Cron 表达式：每小时的第 30 分钟触发
    example-with-schedule:
      schedule: "30 * * * *"
      timezone: "Asia/Shanghai"       # 时区
      metadata:                        # 随事件一起发送的附加数据
        hello: world

    # 带补发机制的 Cron（错过的事件会被补发）
    example-with-catchup:
      schedule: "* * * * *"
      persistence:
        catchup:
          enabled: true
          maxDuration: 5m
        configMap:
          createIfNotExist: true
          name: calendar-state

    # 排除特定日期
    schedule-with-exclusion:
      schedule: "30 * * * *"
      exclusionDates:
        - "EXDATE:20250101T150405Z"
```

### K8s Resource EventSource

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventSource
metadata:
  name: k8s-events
spec:
  template:
    serviceAccountName: resource-watcher-sa    # 需要 list/watch 权限
  resource:
    # 监听 Deployment 变化
    example-deployment:
      namespace: default
      group: "apps"
      version: "v1"
      resource: "deployments"
      eventTypes:
        - ADD              # 资源创建
        - UPDATE           # 资源更新
        - DELETE           # 资源删除
```

---

## EventBus（事件总线）

EventBus 是 EventSource 和 Sensor 之间的传输层，支持三种实现：

| 实现 | 说明 | 状态 |
|------|------|------|
| **NATS Native** | 原始 NATS 协议，轻量级，无持久化 | Deprecated |
| **NATS JetStream** | NATS JetStream，支持持久化和消息回溯 | 推荐 |
| **Kafka** | Apache Kafka，高吞吐量，企业级 | 推荐（大规模） |

```yaml
# NATS JetStream EventBus
apiVersion: argoproj.io/v1alpha1
kind: EventBus
metadata:
  name: default
spec:
  jetstream:
    version: latest
    replicas: 3                    # 最少 3 个副本
    persistence:                   # 持久化
      storageClassName: standard
      accessMode: ReadWriteOnce
      volumeSize: 10Gi
    # containerTemplate:           # 资源限制
    #   resources:
    #     requests:
    #       cpu: 100m
    #       memory: 128Mi
    # streamReplicas: 3            # Stream 副本数
    # maxAge: 72h                  # 消息最大保留时间
```

```yaml
# Kafka EventBus
apiVersion: argoproj.io/v1alpha1
kind: EventBus
metadata:
  name: default
spec:
  kafka:
    brokers:
      - "kafka-broker-1:9092"
      - "kafka-broker-2:9092"
      - "kafka-broker-3:9092"
    topic: argo-events
    consumerGroup: argo-events-sensor
    # TLS 配置（可选）
    # tls:
    #   caCertPath: /path/to/ca.crt
    #   clientCertPath: /path/to/client.crt
    #   clientKeyPath: /path/to/client.key
```

---

## Sensor（传感器）

Sensor 是事件依赖管理器，定义事件依赖（inputs）和触发器（outputs）。

### Sensor Spec 关键字段

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Sensor
metadata:
  name: my-sensor
spec:
  template:
    serviceAccountName: operate-workflow-sa    # 触发 K8s 资源时需要
    # containerTemplate:                       # 资源限制
    #   resources:
    #     requests:
    #       memory: 128Mi
  dependencies:                                # 事件依赖列表
    - name: dep-1                              # 依赖名称（必须唯一）
      eventSourceName: webhook                 # EventSource 名称
      eventName: example                       # EventSource 中的事件名
      filters:                                 # 过滤条件（可选）
        - name: data-filter
          data:
            path: body.type                    # 从事件 payload 提取的路径
            type: string
            value:
              - "push"                         # 匹配的值（支持多个 OR 匹配）
  triggers:                                    # 触发器列表
    - template: { ... }
  # errorOnFailedRound: true                   # 触发失败时是否标记 Sensor 为错误
```

### 事件依赖（Dependencies）

一个 Sensor 可以定义多个依赖，支持 AND/OR 逻辑：

```yaml
spec:
  dependencies:
    # AND 逻辑：所有依赖都满足才触发
    - name: git-push
      eventSourceName: github
      eventName: push
      filters:
        - name: repo-filter
          data:
            path: body.repository.name
            type: string
            value: ["my-repo"]

    - name: schedule
      eventSourceName: calendar
      eventName: nightly

  triggers:
    - template:
        name: ci-trigger
        conditions: "git-push && schedule"     # 依赖条件（AND 逻辑）
        # conditions: "git-push || schedule"   # OR 逻辑
        k8s:
          operation: create
          source: { ... }
```

### 事件过滤（Filters）

Sensor 支持对事件 payload 进行过滤，只有匹配的事件才会满足依赖：

```yaml
dependencies:
  - name: filtered-webhook
    eventSourceName: webhook
    eventName: example
    filters:
      # 数据过滤：从 payload 提取路径并匹配值
      - name: data-filter
        data:
          path: body.event_type               # JSON 路径
          type: string
          value:
            - "push"
            - "pull_request"
          comparator: "="                      # 比较运算符

      # 上下文过滤：从 CloudEvents context 提取
      - name: context-filter
        context:
          source: "webhook"                    # 匹配事件源名称
          type: "webhook"                     # 匹配事件类型

      # 时间过滤
      - name: time-filter
        time:
          start: "2025-01-01T00:00:00Z"
          stop: "2025-12-31T23:59:59Z"
```

---

## Trigger（触发器）

Trigger 是 Sensor 解析事件依赖后执行的具体动作。

### 支持的触发器类型（12+）

| 触发器 | 说明 | 需要 ServiceAccount |
|--------|------|---------------------|
| **Argo Workflows** | 创建 Argo Workflow（最常用） | 是（create/list workflows） |
| **K8s Objects** | 创建/更新/删除任意 K8s 资源 | 是（create 目标资源） |
| **HTTP Request** | 发送 HTTP 请求（Serverless/自定义 API） | 否 |
| **AWS Lambda** | 调用 AWS Lambda 函数 | 否 |
| **Slack Notification** | 发送 Slack 消息通知 | 否 |
| **Kafka Messages** | 发布消息到 Kafka | 否 |
| **NATS Messages** | 发布消息到 NATS | 否 |
| **Azure Event Hubs** | 发布消息到 Azure Event Hubs | 否 |
| **Argo Rollouts** | 触发 Argo Rollouts 操作 | 是 |
| **Apache OpenWhisk** | 调用 OpenWhisk 函数 | 否 |
| **Log** | 打印事件日志（调试用） | 否 |
| **Custom** | 自定义触发器（构建自己的触发器） | 取决于实现 |

### Argo Workflow Trigger

```yaml
triggers:
  - template:
      name: workflow-trigger
      conditions: "git-push"           # 可选：满足条件时触发
      argoWorkflow:
        operation: create             # create | submit | resubmit | retry | resume | suspend
        source:
          resource:
            apiVersion: argoproj.io/v1alpha1
            kind: Workflow
            metadata:
              generateName: ci-
            spec:
              entrypoint: build-and-deploy
              arguments:
                parameters:
                  - name: repo-url
                    value: ""
                  - name: revision
                    value: ""
              templates:
                - name: build-and-deploy
                  inputs:
                    parameters:
                      - name: repo-url
                      - name: revision
                  steps:
                    - - name: checkout
                        template: checkout
                        arguments:
                          parameters:
                            - name: repo-url
                              value: "{{inputs.parameters.repo-url}}"
                            - name: revision
                              value: "{{inputs.parameters.revision}}"
        parameters:
          - src:
              dependencyName: git-push
              dataKey: body.repository.clone_url
            dest: spec.arguments.parameters.0.value
          - src:
              dependencyName: git-push
              dataKey: body.ref        # 提取分支名
            dest: spec.arguments.parameters.1.value
```

### K8s Object Trigger

```yaml
triggers:
  - template:
      name: k8s-trigger
      k8s:
        operation: create            # create | update | delete
        source:
          resource:
            apiVersion: apps/v1
            kind: Deployment
            metadata:
              generateName: triggered-deployment-
            spec:
              replicas: 1
              selector:
                matchLabels:
                  app: triggered
              template:
                metadata:
                  labels:
                    app: triggered
                spec:
                  containers:
                    - name: app
                      image: myapp:latest
```

### HTTP Trigger

```yaml
triggers:
  - template:
      name: http-trigger
      http:
        url: http://my-server.example.com/api/process
        method: POST
        parameters:
          - src:
              dependencyName: webhook
              dataKey: body.message
            dest: query.message       # 注入到 query 参数
        payload:
          - src:
              dependencyName: webhook
              dataKey: body
            dest: payload           # 注入到 request body
```

### Slack Trigger

```yaml
triggers:
  - template:
      name: slack-notification
      slack:
        message: "Deployment triggered by Argo Events!"
        slackToken:                  # K8s Secret 包含 Slack API Token
          name: slack-secret
          key: token
        channel: "#deployments"
```

---

## 参数化（Parameterization）

参数化是 Argo Events 的核心能力——从事件 payload 提取数据并注入到触发的资源中。

### 事件 Payload 结构

Webhook 事件转换为 CloudEvents 后的 payload 结构：

```json
{
  "context": {
    "type": "webhook",
    "specversion": "0.3",
    "source": "webhook",
    "id": "unique_event_id",
    "time": "2025-01-01T00:00:00Z",
    "datacontenttype": "application/json",
    "subject": "example"
  },
  "data": {
    "header": {                       // HTTP 请求头
      "Content-Type": ["application/json"]
    },
    "body": {                         // HTTP 请求体
      "message": "hello world"
    }
  }
}
```

### 参数提取方式

```yaml
parameters:
  # 1. 从事件 Data 提取（最常用）
  - src:
      dependencyName: test-dep
      dataKey: body.message           # 从 data.body.message 提取
    dest: spec.arguments.parameters.0.value

  # 2. 从事件 Context 提取
  - src:
      dependencyName: test-dep
      contextKey: type                # 从 context.type 提取
    dest: spec.arguments.parameters.1.value

  # 3. 使用默认值（当 key 不存在时）
  - src:
      dependencyName: test-dep
      dataKey: body.nonexistent       # 不存在的 key
    dest: spec.arguments.parameters.2.value
    value: "default-value"           # 默认值

  # 4. Sprig 模板变换（对提取的数据做处理）
  - src:
      dependencyName: test-dep
      dataTemplate: "{{ .Input.body.message | title }}"    # 首字母大写
    dest: spec.arguments.parameters.3.value

  - src:
      dependencyName: test-dep
      contextTemplate: "{{ .Input.subject | title }}"
    dest: spec.arguments.parameters.4.value

  # 5. 使用 useRawData（保留原始类型：number/boolean/json）
  - src:
      dependencyName: test-dep
      dataKey: body.count
    dest: spec.arguments.parameters.5.value
    useRawData: true                  # 不设则解析为 string

  # 6. append/prepend 操作（追加到现有值）
  - src:
      dependencyName: test-dep
      dataKey: body.message
    dest: metadata.generateName
    operation: append                 # append | prepend
```

### Sprig 模板函数

`dataTemplate` 和 `contextTemplate` 支持 [Sprig](https://masterminds.github.io/sprig/) 模板函数：

| 函数 | 说明 | 示例 |
|------|------|------|
| `title` | 首字母大写 | `{{ .Input.body.name \| title }}` |
| `lower` | 全小写 | `{{ .Input.body.name \| lower }}` |
| `upper` | 全大写 | `{{ .Input.body.name \| upper }}` |
| `nospace` | 去除空格 | `{{ .Input.body.name \| nospace }}` |
| `replace` | 替换 | `{{ .Input.body.name \| replace " " "-" }}` |
| `trim` | 去除首尾空格 | `{{ .Input.body.name \| trim }}` |
| `split` | 分割 | `{{ .Input.body.tag \| split "/" }}` |

---

## RBAC / Service Accounts

| 组件 | 是否需要 SA | 权限要求 |
|------|-------------|----------|
| **EventSource**（普通类型） | 否 | 不需要 |
| **EventSource**（Resource 类型） | 是 | `list, watch` 目标资源 |
| **Sensor**（Argo Workflow Trigger） | 是 | `create, list` workflows.argoproj.io |
| **Sensor**（K8s Object Trigger） | 是 | `create` 目标资源 |
| **Sensor**（HTTP/Lambda/Slack 等） | 否 | 不需要 |
| **触发的 Workflow/Pod** | 取决于 Workflow | 遵循 Argo Workflows SA 配置 |

```yaml
# Resource EventSource 的 RBAC
apiVersion: v1
kind: ServiceAccount
metadata:
  name: resource-watcher-sa
  namespace: argo-events
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: deployments-watcher
  namespace: argo-events
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: deployments-watcher-binding
  namespace: argo-events
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: deployments-watcher
subjects:
  - kind: ServiceAccount
    name: resource-watcher-sa
    namespace: argo-events
```

---

## 与 Argo 生态集成

### 与 Argo Workflows 集成（最常见场景）

Argo Events 最核心的场景是将外部事件触发为 Argo Workflow 执行：

```
外部事件 → EventSource → EventBus → Sensor → Argo Workflow → 业务逻辑执行

示例场景：
1. Git Push → GitHub EventSource → Sensor → Argo Workflow (CI 构建+测试)
2. S3 上传 → Minio EventSource → Sensor → Argo Workflow (数据处理)
3. 定时 → Calendar EventSource → Sensor → Argo Workflow (定时任务)
4. Kafka 消息 → Kafka EventSource → Sensor → Argo Workflow (流式处理)
5. Slack 命令 → Slack EventSource → Sensor → Argo Workflow (交互式触发)
```

### 与 Argo CD 集成

通过 K8s Object Trigger，Argo Events 可以触发 Argo CD 的 Sync 操作：

```yaml
triggers:
  - template:
      name: argocd-sync
      k8s:
        operation: create
        source:
          resource:
            apiVersion: argoproj.io/v1alpha1
            kind: Application
            metadata:
              generateName: sync-trigger-
            spec:
              # ...
```

### 与 Argo Rollouts 集成

Argo Events 支持 Argo Rollouts Trigger，可基于事件触发 Rollout 操作：

```yaml
triggers:
  - template:
      name: rollout-trigger
      argoRollout:
        # 触发 Rollout 的 promote/abort/restart 等操作
        rolloutName: my-rollout
        # ...
```

### 完整 CI/CD 管道示例

```
┌──────────┐    ┌──────────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────────┐
│ Git Push │───▶│ GitHub       │───▶│ EventBus │───▶│ Sensor      │───▶│ Argo Workflow│
│          │    │ EventSource  │    │ (NATS)   │    │ (CI Trigger)│    │ (Build+Test) │
└──────────┘    └──────────────┘    └──────────┘    └─────────────┘    └──────┬───────┘
                                                                            │
                    ┌───────────────────────────────────────────────────────┘
                    ▼
              ┌───────────┐    ┌──────────────────┐    ┌───────────────────┐
              │ K8s       │───▶│ Argo CD          │───▶│ Argo Rollouts     │
              │ Trigger   │    │ (GitOps Sync)    │    │ (Canary Deploy)   │
              └───────────┘    └──────────────────┘    └───────────────────┘
```

---

## 最佳实践

| 实践 | 说明 |
|------|------|
| **使用 JetStream EventBus** | NATS Native 已 deprecated，推荐使用 JetStream 支持持久化 |
| **最小权限 SA** | 为 Sensor 和 EventSource 创建最小权限的 ServiceAccount |
| **使用 filters 过滤事件** | 避免不必要的事件触发，在 Sensor 中定义过滤条件 |
| **使用 Validating Webhook** | 安装准入控制器，在应用前验证 EventSource 和 Sensor 配置 |
| **使用 `argo-events lint`** | 在 CI/CD 中验证资源配置 |
| **使用默认值** | 为参数设置 `value` 默认值，防止事件 payload 缺少字段时触发失败 |
| **持久化 EventBus** | 生产环境配置 `persistence`，确保事件不丢失 |
| **设置资源限制** | 为 EventSource 和 Sensor Pod 设置 resources requests/limits |
| **监控 EventBus** | 监控 NATS/Kafka 的健康状态，EventBus 故障会阻断所有事件流 |
| **合理设计依赖条件** | 多事件触发使用 `conditions` 实现 AND/OR 逻辑，避免不必要的触发 |
| **与 Argo Workflows 配合** | 确保 Argo Workflows Controller 能监听 argo-events 命名空间 |

### 安装方式选择

| 方式 | 说明 | 适用场景 |
|------|------|----------|
| **kubectl + install.yaml** | 直接 apply 官方 manifest | 快速部署/测试 |
| **Kustomize** | 基于 cluster-install/namespace-install | 多环境差异化配置 |
| **Helm Chart** | `helm install argo-events argo/argo-events` | 标准化部署管理 |

```bash
# Helm 安装
helm repo add argo https://argoproj.github.io/argo-helm
helm install argo-events argo/argo-events -n argo-events --create-namespace

# Kustomize 安装
# kustomization.yaml:
# bases:
# - github.com/argoproj/argo-events/manifests/cluster-install
```

---

## 调试与排错

```bash
# 查看 EventSource 状态
kubectl -n argo-events get eventsource <name> -o yaml

# 查看 Sensor 状态
kubectl -n argo-events get sensor <name> -o yaml

# 查看 EventBus 状态
kubectl -n argo-events get eventbus default -o yaml

# 查看 EventSource Pod 日志
kubectl -n argo-events logs -l eventsource-name=<name>

# 查看 Sensor Pod 日志
kubectl -n argo-events logs -l sensor-name=<name>

# 查看 Controller 日志
kubectl -n argo-events logs -l app=argo-events-controller

# 验证资源配置（lint）
argo-events lint eventsource.yaml sensor.yaml

# 端口转发测试 Webhook
kubectl -n argo-events port-forward svc/<eventsource-svc> 12000:12000

# 发送测试请求
curl -d '{"message":"test"}' -H "Content-Type: application/json" \
  -X POST http://localhost:12000/example

# 检查触发的 Workflow
kubectl -n argo-events get workflows
```

**常见问题排查**：

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| EventSource Pod 未创建 | EventSource CRD 配置错误 | 检查 EventSource spec，查看 Controller 日志 |
| Sensor Pod 未创建 | Sensor CRD 配置错误或 SA 缺失 | 检查 Sensor spec 和 RBAC |
| 事件未触发 | EventBus 未就绪或过滤条件不匹配 | 检查 EventBus Pod 状态和 filter 配置 |
| Workflow 未创建 | Sensor SA 缺少 create workflows 权限 | 检查 RBAC Role 是否授予 workflows.argoproj.io 的 create 权限 |
| 参数未注入 | dataKey/contextKey 路径错误 | 检查事件 payload 结构和参数路径 |
| EventBus 连接失败 | NATS/Kafka 未就绪或认证失败 | 检查 EventBus Pod 状态和认证配置 |

---

## Question

#### 基础概念

| # | 问题 | 参考答案 |
|---|------|----------|
| 1 | **Argo Events 的四大核心组件是什么？** | (1) EventSource：监听外部事件源，转换为 CloudEvents 发布到 EventBus；(2) EventBus：事件传输层（NATS/Kafka），连接 EventSource 和 Sensor；(3) Sensor：订阅事件，管理事件依赖条件，执行触发；(4) Trigger：Sensor 解析依赖后执行的具体动作（如创建 Argo Workflow）。 |
| 2 | **EventSource 和 Sensor 之间的关系是什么？** | EventSource 是事件的生产者，负责监听外部事件并发布到 EventBus；Sensor 是事件的消费者，订阅 EventBus 上的事件并触发动作。两者通过 EventBus 解耦，一个 EventSource 可以被多个 Sensor 消费，一个 Sensor 也可以依赖多个 EventSource 的事件。 |
| 3 | **Argo Events 为什么要使用 CloudEvents 规范？** | CloudEvents 是 CNCF 标准化的事件描述格式，统一了不同事件源的事件结构（context + data）。这使得：(1) 不同事件源的事件可以统一处理；(2) Sensor 的过滤器和参数提取逻辑可复用；(3) 与其他 CloudEvents 兼容的系统互操作。 |

#### 架构与组件

| # | 问题 | 参考答案 |
|---|------|----------|
| 4 | **EventBus 的三种实现方式有何区别？** | (1) NATS Native：轻量级但无持久化，已 deprecated；(2) NATS JetStream：支持持久化和消息回溯，推荐使用；(3) Kafka：高吞吐量企业级方案，适合大规模场景。JetStream 是当前推荐方案，兼顾性能和可靠性。 |
| 5 | **EventSource Controller 和 Sensor Controller 分别负责什么？** | EventSource Controller Watch EventSource CRD，为每个 EventSource 创建对应的监听 Pod 和 Service；Sensor Controller Watch Sensor CRD，为每个 Sensor 创建对应的订阅 Pod 和 Service。两者都是控制平面组件，实际事件处理在数据平面 Pod 中进行。 |
| 6 | **为什么 Sensor 触发 Argo Workflow 需要 ServiceAccount？** | Sensor 创建 Argo Workflow 实际是创建 K8s 资源（`workflows.argoproj.io`），需要 Kubernetes RBAC 授权。ServiceAccount 需要 `create, list` 权限来创建 Workflow，如需 resubmit/retry 等操作还需 `update, get` 权限。HTTP/Lambda/Slack 等 Trigger 则不需要 SA。 |

#### 参数化与过滤

| # | 问题 | 参考答案 |
|---|------|----------|
| 7 | **dataKey 和 contextKey 的区别是什么？** | `dataKey` 从 CloudEvents 的 `data` 字段提取数据（如 `body.message` 从 HTTP 请求体提取）；`contextKey` 从 CloudEvents 的 `context` 字段提取（如 `type`、`source`、`subject`）。两者同时定义时 `dataKey` 优先。 |
| 8 | **如何实现多事件依赖的 AND/OR 逻辑？** | 在 Sensor 的 `triggers` 中使用 `conditions` 字段：`conditions: "dep1 && dep2"` 表示两个依赖都满足才触发（AND）；`conditions: "dep1 \|\| dep2"` 表示任一满足即触发（OR）。默认（不设置 conditions）是所有依赖都满足才触发。 |
| 9 | **Sprig 模板在参数化中有什么作用？** | `dataTemplate` 和 `contextTemplate` 使用 Sprig 函数对提取的事件数据进行变换，如 `{{ .Input.body.name \| title }}` 首字母大写、`{{ .Input.body.name \| nospace \| lower }}` 去空格并小写。这避免在触发的 Workflow 中再做数据处理，直接注入格式化后的值。 |

#### 生产实践

| # | 问题 | 参考答案 |
|---|------|----------|
| 10 | **Argo Events 与 Argo Workflows 如何配合实现事件驱动 CI/CD？** | EventSource 监听 Git Push 事件 → 转换为 CloudEvents 发布到 EventBus → Sensor 订阅事件，过滤匹配的仓库 → 触发 Argo Workflow 执行 CI 构建+测试 → Workflow 完成后可通过 K8s Trigger 更新 Argo CD Application 触发部署。这实现了从 Git Push 到部署的完整自动化管道。 |
| 11 | **生产环境部署 Argo Events 有哪些关键实践？** | (1) 使用 JetStream EventBus 并配置持久化存储；(2) 为 EventSource 和 Sensor 设置资源限制；(3) 安装 Validating Webhook 防止错误配置；(4) 使用最小权限 ServiceAccount；(5) 配置 filter 减少不必要触发；(6) 监控 EventBus 健康状态；(7) 在 CI/CD 中使用 `argo-events lint` 验证配置。 |
| 12 | **Argo Events 与 Knative Eventing 有何区别？** | Argo Events 专注于将外部事件触发为 Argo Workflows/K8s 资源，与 Argo 生态深度集成，适合 CI/CD 和数据处理管道。Knative Eventing 是更通用的 K8s 事件网格，支持更复杂的路由和 Broker/Trigger 模型，适合微服务间事件通信。两者可互补使用，Argo Events 更轻量、更专注于触发工作流。 |

---

## Reference

[Argo Events Official Documentation](https://argoproj.github.io/argo-events/)

[Argo Events GitHub Repository](https://github.com/argoproj/argo-events)

[Argo Events Examples](https://github.com/argoproj/argo-events/tree/stable/examples)

[Argo Events Demo Environment](https://workflows.apps.argoproj.io/event-flow/argo?showWorkflows=true)

[CloudEvents Specification](https://cloudevents.io/)

[Argo Events Tutorials](https://argoproj.github.io/argo-events/tutorials/01-introduction/)

[Automation of Everything - Combining Argo Events, Workflows & CD (Video)](https://youtu.be/XNXJtxkUKeY)

[Argo Events Deep-dive (Video)](https://youtu.be/U4tCYcCK20w)

[CNCF Argo Project Page](https://www.cncf.io/projects/argo/)

[Awesome Argo](https://github.com/terrytangyuan/awesome-argo)

[]()

[]()

[]()

[]()

[]()

[]()
