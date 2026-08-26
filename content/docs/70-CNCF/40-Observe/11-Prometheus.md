---
weight: 11
title: "Prometheus"
---


# [Prometheus](https://prometheus.io/) Notes
> This is my learning Notes for Prometheus

[Docs](https://prometheus.io/docs/introduction/overview/), [Github](https://github.com/prometheus/prometheus)

[Prometheus Course (LFS241)](https://training.linuxfoundation.org/training/monitoring-systems-and-services-with-prometheus-lfs241/), [PromLabs](https://training.promlabs.com/trainings/), [Robust Perception](https://robustperception.teachable.com/courses/enrolled/200947)

[awesome-prometheus](https://github.com/roaldnefs/awesome-prometheus)

[]()

[]()

## Introduction to Observability

可观测性（Observability）的三大支柱：

| Pillar | 描述 | 代表项目 |
|--------|------|----------|
| Metrics（指标） | 数值型时序数据，反映系统运行状态 | Prometheus |
| Logging（日志） | 离散事件记录，用于事后追溯 | Loki, Fluentd, ELK |
| Tracing（追踪） | 请求在分布式系统中的完整调用链 | Jaeger, Zipkin, Tempo |

监控（Monitoring）回答"系统是否正常"，可观测性（Observability）回答"为什么不正常"——能否从外部输出推断系统内部状态。Prometheus 专注于 Metrics 维度。


---

## Architecture

![Architecture](https://prometheus.io/assets/docs/architecture.svg)

核心组件：

| Component | 作用 |
|-----------|------|
| Prometheus Server | 核心服务，负责抓取、存储、查询时序数据 |
| Exporters / Jobs | 将现有系统/服务的指标暴露为 Prometheus 格式 |
| Pushgateway | 短生命周期任务推送指标的中间层（Prometheus 仍以 pull 拉取） |
| Alertmanager | 处理告警：去重、分组、路由到接收器（Email/Slack/PagerDuty） |
| Service Discovery | 动态发现监控目标（Kubernetes, Consul, EC2 等） |

```
┌─────────────────────────────────────────────────────────────┐
│                      Prometheus Server                      │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │ Retrieval │→ │   TSDB    │→ │  HTTP     │  │   Alert  │ │
│  │  (Pull)   │  │ (Storage) │  │  Server   │  │ Manager  │ │
│  └─────┬─────┘  └───────────┘  └──────────┘  └────┬─────┘ │
│        │                                            │       │
└────────┼────────────────────────────────────────────┼───────┘
         │                                            │
    ┌────▼──────────────────────┐               ┌────▼──────┐
    │  Service Discovery        │               │  Alert    │
    │  Kubernetes / Consul / EC2│              │  Manager  │
    └────┬──────────────────────┘               └────┬──────┘
         │                                           │
    ┌────▼────────────────────┐                ┌─────▼─────┐
    │  Targets (Exporters)    │                │  Pager    │
    │  node_exporter / app    │                │  Email    │
    └─────────────────────────┘                │  Slack    │
                                               └───────────┘
    ┌──────────────────┐
    │   Pushgateway    │ ← short-lived jobs push metrics here
    └────────┬─────────┘
             │ (Prometheus still pulls from Pushgateway)
```

Prometheus 核心设计：**Pull 模型**——Prometheus 主动从目标 HTTP 端点（默认 `/metrics`）拉取指标，而非被动等待推送。


---

## Data Model

### Metric Types

| 类型 | 说明 | 示例 | 典型场景 |
|------|------|------|----------|
| Counter | 单调递增计数器（只能增或重置为 0） | `http_requests_total` | 请求数、错误数、完成任务数 |
| Gauge | 可增可减的瞬时值 | `memory_usage_bytes` | 温度、内存使用、队列长度 |
| Histogram | 将数据分布到桶（bucket）中，含累计计数 | `http_request_duration_seconds_bucket` | 请求延迟分布 |
| Summary | 客户端预计算的分位数（quantile） | `http_request_duration_seconds{quantile="0.99"}` | 请求延迟分位数 |

### Labels & Time Series

一条时序由 **metric name + label set** 唯一标识：

```
http_requests_total{method="POST", endpoint="/api", status="200"}  1234
└── metric name ──┘  └─────────── labels ───────────────────────┘  └ value
```

> **注意**：高基数（high cardinality）标签（如 `user_id`, `request_id`）会导致时序爆炸，应避免。

### Naming Conventions

- metric name 使用 `snake_case`，包含单位后缀（`_seconds`, `_bytes`, `_total`）
- 应用前缀表示所属子系统：`http_`, `node_`, `go_`
- Counter 类型以 `_total` 结尾


---

## Installation & Setup

### Docker Quick Start

```bash
# 启动 Prometheus
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# 启动 node_exporter（主机指标）
docker run -d --name node-exporter -p 9100:9100 prom/node-exporter
```

### prometheus.yml 配置示例

```yaml
global:
  scrape_interval: 15s          # 抓取间隔
  evaluation_interval: 15s     # 规则评估间隔

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

rule_files:
  - "alerts.yml"
  - "recording_rules.yml"

scrape_configs:
  - job_name: 'prometheus'       # 监控 Prometheus 自身
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'            # 主机指标
    static_configs:
      - targets: ['localhost:9100']
```

### 常用启动参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--config.file` | — | 配置文件路径 |
| `--storage.tsdb.path` | `data/` | 数据存储目录 |
| `--storage.tsdb.retention.time` | `15d` | 数据保留时长 |
| `--storage.tsdb.retention.size` | `0`（不限） | 数据保留大小上限 |
| `--web.enable-lifecycle` | `false` | 允许通过 HTTP POST `/-/reload` 热重载配置 |


---

## PromQL

### 基础查询

```promql
# 即时向量（instant vector）：当前值
node_memory_MemAvailable_bytes

# 带标签过滤
http_requests_total{method="GET", status="200"}

# 范围向量（range vector）：过去 5 分钟
rate(http_requests_total[5m])

# 聚合运算
sum by (instance) (rate(http_requests_total[5m]))
```

### 常用函数

| 函数 | 说明 | 示例 |
|------|------|------|
| `rate()` | 范围向量每秒平均增长率（仅 Counter） | `rate(http_requests_total[5m])` |
| `irate()` | 最近两个样本的瞬时增长率（更灵敏） | `irate(http_requests_total[5m])` |
| `increase()` | 范围内的总增量 | `increase(http_requests_total[1h])` |
| `histogram_quantile()` | 从 Histogram bucket 计算分位数 | `histogram_quantile(0.99, rate(..._bucket[5m]))` |
| `topk()` | 取前 N 个最大值 | `topk(5, rate(http_requests_total[5m]))` |
| `predict_linear()` | 基于历史数据线性预测未来值 | `predict_linear(node_filesystem_avail_bytes[1h], 3600)` |

### 运算符示例

```promql
# 计算每个实例的 CPU 使用率
1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))

# 过滤错误率 > 5% 的端点
rate(http_requests_total{status=~"5.."}[5m])
  / rate(http_requests_total[5m]) > 0.05

# 向量匹配：按 instance 标签做除法
rate(http_errors_total[5m])
  / on(instance) rate(http_requests_total[5m])
```

> `rate()` 用于 Counter，`irate()` 适合短期告警；计算 P99 延迟必须配合 `_bucket` 与 `histogram_quantile()`。

[PromQL Cheatsheet](https://promlabs.com/promql-cheat-sheet/)


---

## Service Discovery

静态配置 `static_configs` 适合固定目标；动态环境需 Service Discovery。

| SD 类型 | 适用场景 |
|---------|----------|
| `static_configs` | 固定 IP/主机 |
| `kubernetes_sd_configs` | Kubernetes Pod/Service/Node/Endpoint |
| `consul_sd_configs` | Consul 服务注册中心 |
| `ec2_sd_configs` | AWS EC2 实例 |
| `file_sd_configs` | 文件动态加载（支持热更新） |
| `dns_sd_configs` | DNS SRV/A 记录 |

```yaml
scrape_configs:
  - job_name: 'consul-services'
    consul_sd_configs:
      - server: 'localhost:8500'
    relabel_configs:
      - source_labels: [__meta_consul_tags]
        regex: '.*,metrics,.*'
        action: keep
```


---

## Relabeling

Relabeling 在抓取前后对 label 进行增删改，是 Prometheus 最强大也最易混淆的特性之一。

| 阶段 | 配置段 | 时机 |
|------|--------|------|
| Target Relabeling | `relabel_configs` | 抓取前，作用于 target metadata |
| Metric Relabeling | `metric_relabel_configs` | 抓取后，作用于已采集的样本 |

### 常用 action

| action | 说明 |
|--------|------|
| `keep` | 保留匹配的 target，丢弃其余 |
| `drop` | 丢弃匹配的 target |
| `replace` | 替换或设置 label 值 |
| `labelmap` | 批量重命名 label |
| `labeldrop` | 删除指定 label |
| `labelkeep` | 仅保留指定 label |

```yaml
# 示例：只抓取带 prometheus.io/scrape=true 注解的 Pod
relabel_configs:
  - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
    action: keep
    regex: true

  # 将 Pod 注解中的路径设为抓取路径
  - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
    action: replace
    target_label: __metrics_path__
    regex: (.+)

# 抓取后丢弃高基数标签，避免时序爆炸
metric_relabel_configs:
  - action: labeldrop
    regex: 'request_id|user_id'
```

> `__` 开头的 label（如 `__address__`, `__metrics_path__`）是元标签（meta label），在最终存储前会被自动移除，除非用 `replace` 显式映射到普通 label。


---

## Exporters

### 常用 Exporters

| Exporter | 端口 | 用途 |
|----------|------|------|
| [node_exporter](https://github.com/prometheus/node_exporter) | 9100 | 主机/硬件指标（CPU/内存/磁盘/网络） |
| [blackbox_exporter](https://github.com/prometheus/blackbox_exporter) | 9115 | 黑盒探测（HTTP/TCP/ICMP/DNS） |
| [mysqld_exporter](https://github.com/prometheus/mysqld_exporter) | 9104 | MySQL |
| [postgres_exporter](https://github.com/prometheus-community/postgres_exporter) | 9187 | PostgreSQL |
| [redis_exporter](https://github.com/oliver006/redis_exporter) | 9121 | Redis |
| [kafka_exporter](https://github.com/danielqsj/kafka_exporter) | 9308 | Kafka |

### Instrumenting Code

直接在应用代码中埋点，推荐使用官方 client library：

| 语言 | Library |
|------|---------|
| Go | [prometheus/client_golang](https://github.com/prometheus/client_golang) |
| Java | [prometheus/client_java](https://github.com/prometheus/client_java) |
| Python | [prometheus/client_python](https://github.com/prometheus/client_python) |

{{< details "Go 埋点示例" >}}
package main <br/><br/>

import (
    "net/http"

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)<br/><br/>

var (
    httpRequests = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests.",
        },
        []string{"method", "endpoint", "status"},
    )
    requestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "HTTP request duration in seconds.",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "endpoint"},
    )
)<br/><br/>

func init() {
    prometheus.MustRegister(httpRequests, requestDuration)
}<br/><br/>

func main() {<br/>
    http.Handle("/metrics", promhttp.Handler()) <br/>
    http.ListenAndServe(":8080", nil) <br/>
}
{{< /details >}}


---

## Alerting

告警流程：`Alert Rule → Prometheus 评估 → Alertmanager 去重/分组/路由 → Receiver`

### alerts.yml 示例

```yaml
groups:
  - name: node-alerts
    rules:
      - alert: HighCpuUsage
        expr: 1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) > 0.85
        for: 5m              # 持续满足 5 分钟才触发
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value | humanizePercentage }} (threshold 85%)"

      - alert: DiskSpaceLow
        expr: 1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes) > 0.85
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Disk space low on {{ $labels.instance }}"
```

### Alertmanager 路由配置

```yaml
route:
  receiver: 'default'
  group_by: ['alertname', 'cluster']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

receivers:
  - name: 'default'
    email_configs:
      - to: 'ops@example.com'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/xxx'
        channel: '#alerts'

inhibit_rules:
  - source_match: { severity: 'critical' }
    target_match: { severity: 'warning' }
    equal: ['instance']   # 同一实例 critical 抑制 warning
```

| 概念 | 说明 |
|------|------|
| `for` | 告警需持续满足多久才从 Pending → Firing |
| `group_by` | 按标签分组发送，减少告警风暴 |
| `inhibit_rules` | 高级别告警抑制低级别，避免噪音 |


---

## Recording Rules

预计算高频、复杂查询的结果，避免每次查询实时重算。

```yaml
groups:
  - name: recording-rules
    interval: 30s
    rules:
      - record: job:http_requests:rate5m
        expr: sum by (job) (rate(http_requests_total[5m]))

      - record: instance:cpu_usage:ratio
        expr: 1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))
```

> 命名约定：`level:metric:operations`，如 `job:http_requests:rate5m`。


---

## Pushgateway

Pull 模型不适合短生命周期任务（如 Cron Job）——任务可能结束时 Prometheus 还未抓取。Pushgateway 作为中转：任务将指标推送到 Pushgateway，Prometheus 再从中拉取。

```bash
# 推送示例
echo "batch_jobs_total 42" | \
  curl --data-binary @- http://localhost:9091/metrics/job/batch_job
```

> Pushgateway 不替代 Pull 模型，仅用于短生命周期/批处理任务。常驻服务应直接暴露 `/metrics`。


---

## Blackbox Monitoring

[blackbox_exporter](https://github.com/prometheus/blackbox_exporter) 从外部探测端点可用性（HTTP/TCP/ICMP/DNS），与 node_exporter 的"白盒"内部指标互补。

```yaml
scrape_configs:
  - job_name: 'blackbox-http'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
          - https://example.com
          - https://api.example.com/health
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: localhost:9115  # blackbox_exporter 地址
```


---

## Storage

### Local TSDB

Prometheus 本地存储为自定义时序数据库（TSDB），采用基于时间的分块（block）存储，每个 block 默认 2 小时，含压缩的 chunk 数据与索引。

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--storage.tsdb.retention.time` | `15d` | 按时间保留 |
| `--storage.tsdb.retention.size` | `0`（不限） | 按大小保留 |
| `--storage.tsdb.path` | `data/` | 存储路径 |

### Remote Storage Integrations

本地存储不适合长期保存（数月/年级别）。通过 Remote Read/Write 对接远端存储：

| 方案 | 说明 |
|------|------|
| [Thanos](https://thanos.io/) | 对象存储长期保存 + 全局查询 + 高可用 |
| [Cortex](https://cortexmetrics.io/) | 多租户、水平扩展的 Prometheus 长期存储 |
| [Mimir](https://grafana.com/oss/mimir/) | Grafana 出品，Cortex 的演进版 |
| [VictoriaMetrics](https://victoriametrics.com/) | 高性能、低资源的时序数据库 |


---

## High Availability & Scaling

Prometheus 本身是单实例设计（无原生集群）。HA 与扩展方案：

| 方案 | 说明 | 适用场景 |
|------|------|----------|
| 双实例 + Alertmanager HA | 运行两个相同配置的 Prometheus + Alertmanager 集群去重 | 基础 HA |
| Federation（联邦） | 上层 Prometheus 从下层 Prometheus 拉取聚合数据 | 层级拆分 |
| Thanos | Sidecar 上传 block 到对象存储，Store Gateway 全局查询 | 长期存储 + 全局视图 |
| Cortex / Mimir | 远端写入，水平扩展 | 多租户、大规模 |
| VictoriaMetrics | 兼容 PromQL 的高性能 TSDB | 高写入/低资源需求 |

### Thanos 架构

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Prometheus    │  │  Prometheus    │  │  Prometheus    │
│  + Thanos      │  │  + Thanos      │  │  + Thanos      │
│  Sidecar       │  │  Sidecar       │  │  Sidecar       │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │ upload             │ upload            │ upload
        ▼                    ▼                   ▼
┌──────────────────────────────────────────────────────────┐
│           Object Storage (S3 / OSS / GCS)               │
└──────────────────────────┬───────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│     Store    │  │  Compactor   │  │    Query     │
│   Gateway    │  │ (downsample) │  │ (PromQL UI)  │
└──────────────┘  └──────────────┘  └──────────────┘
```


---

## Prometheus & Kubernetes

### kube-prometheus-stack

社区推荐的 K8s 监控套件（Helm Chart），包含：
- Prometheus Operator
- Prometheus（多实例管理）
- Alertmanager
- Grafana
- node_exporter（DaemonSet）
- kube-state-metrics
- 预置告警规则与 Dashboard

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack
```

### Prometheus Operator CRD

| CRD | 说明 |
|-----|------|
| `Prometheus` | 定义 Prometheus 实例 |
| `ServiceMonitor` | 声明式定义如何监控一组 Service |
| `PodMonitor` | 声明式定义如何监控一组 Pod |
| `PrometheusRule` | 告警与 Recording Rules |
| `Alertmanager` | 定义 Alertmanager 实例 |

{{< details "ServiceMonitor 示例" >}}
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-app
  namespace: monitoring
  labels:
    release: kube-prometheus-stack  # 匹配 Prometheus selector
spec:
  selector:
    matchLabels:
      app: my-app          # 选择带有此 label 的 Service
  namespaceSelector:
    matchNames:
      - default
  endpoints:
    - port: metrics        # Service 中名为 metrics 的 port
      interval: 30s
      path: /metrics
{{< /details >}}

### K8s 关键监控指标

| 组件 | Exporter/指标 | 关注点 |
|------|--------------|--------|
| 节点 | node_exporter | CPU/内存/磁盘/网络 |
| 容器 | cAdvisor（kubelet 内置） | 容器 CPU/内存/IO |
| K8s 对象状态 | kube-state-metrics | Pod 状态、Deployment 副本数、PVC 状态 |
| 控制平面 | etcd / apiserver metrics | etcd 健康、API 延迟、错误率 |


---

## Monitoring & Debugging Prometheus

### 自我监控指标

Prometheus 暴露自身的运行指标（`prometheus_*` 前缀）：

| 指标 | 说明 |
|------|------|
| `prometheus_tsdb_head_samples_appended_total` | 写入样本速率 |
| `prometheus_target_scrape_pool_targets` | 当前 target 数量 |
| `prometheus_target_scrapes_failed_total` | 抓取失败总数 |
| `prometheus_rule_evaluation_failures_total` | 规则评估失败 |
| `prometheus_http_request_duration_seconds` | API 延迟 |

### 常见问题排查

| 问题 | 可能原因 | 排查方法 |
|------|----------|----------|
| 抓取失败 | target 不可达 / 认证失败 | 检查 `up` 指标、`/targets` 页面 |
| 指标缺失 | relabel drop / annotation 未配置 | 查看 `/targets` 页面 LAST ERROR |
| 查询慢 | 范围过大 / 无 Recording Rule | 缩小范围或预计算 |
| 内存高 | 高基数标签 / 规则过多 | 检查 `prometheus_tsdb_head_series` |


---

## Questions

- Recording Rules 与 Alert Rules 的最佳拆分粒度
- Thanos Query 与 VictoriaMetrics 的选型对比
- PromQL 中 `on()` vs `ignoring()` 的使用场景

<br/>

## Reference

[Prometheus](https://prometheus.io/), [Docs](https://prometheus.io/docs/introduction/overview/), [Github](https://github.com/prometheus/prometheus)

[Prometheus Course (LFS241)](https://training.linuxfoundation.org/training/monitoring-systems-and-services-with-prometheus-lfs241/), [PromLabs](https://training.promlabs.com/trainings/), [Robust Perception](https://robustperception.teachable.com/courses/enrolled/200947)

[Best Practices](https://prometheus.io/docs/practices/naming/), [PromQL Cheatsheet](https://promlabs.com/promql-cheat-sheet/)

[Thanos](https://thanos.io/), [Cortex](https://cortexmetrics.io/), [Mimir](https://grafana.com/oss/mimir/), [VictoriaMetrics](https://victoriametrics.com/)

[kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack), [Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator)

[node_exporter](https://github.com/prometheus/node_exporter), [blackbox_exporter](https://github.com/prometheus/blackbox_exporter)

[Demo: Docker-Compose-Prometheus-and-Grafana](https://github.com/Einsteinish/Docker-Compose-Prometheus-and-Grafana)

[]()

[]()

[]()

[]()

[]()
