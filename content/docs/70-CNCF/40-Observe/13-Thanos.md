---
weight: 13
title: "Thanos"
---


# [Thanos](https://thanos.io/) Notes
> This is my learning Notes for Thanos — Highly Available Prometheus with Long-Term Storage

[Docs](https://thanos.io/tip/thanos/getting-started.md/), [Github](https://github.com/thanos-io/thanos)

[Killercoda Tutorial](https://thanos.io/v0.31/thanos/quick-tutorial.md/), [CNCF Landscape](https://landscape.cncf.io/?item=observability-and-analysis–monitoring–thanos)

Thanos 是一个 **CNCF Incubating** 项目，在现有 Prometheus 之上提供全局查询视图、无限存储保留和高可用性，无需替换 Prometheus。


## Why Thanos? — Prometheus 的局限性

原生 Prometheus 是单机架构，存在以下限制：

| 局限 | 说明 | Thanos 解决方案 |
|------|------|-----------------|
| 单点故障 | 一个 Prometheus 挂了 = 该区域失去监控 | HA 对 + 去重 |
| 存储有限 | 本地磁盘，retention 到期即删除 | Object Storage 无限保留 |
| 无法全局查询 | 每个 Prometheus 各自独立 | Querier 全局聚合 |
| 扩展困难 | 垂直扩展有天花板 | Receive 水平扩展 / 分片 |
| 历史数据查询慢 | 本地 TSDB 数据量大时性能下降 | Compactor 降采样（Downsampling） |

```
单 Prometheus 的天花板：
  ┌──────────────────────────────┐
  │  单个 Prometheus             │
  │  • 本地磁盘 → 有限 retention │
  │  • 单点 → 无 HA             │
  │  • 无法跨集群查询            │
  └──────────────────────────────┘

Thanos 的解决方式：
  ┌──────────────┐  ┌──────────────┐
  │ Prometheus A │  │ Prometheus B │  ← 多集群各自采集
  │  + Sidecar   │  │  + Sidecar   │
  └──────┬───────┘  └──────┬───────┘
         │    上传 Block     │
         ▼                 ▼
  ┌──────────────────────────────┐
  │       Object Storage         │  ← 无限保留、低成本
  │  (S3 / GCS / Azure / MinIO)  │
  └──────────────┬───────────────┘
                 │
         ┌───────▼───────┐
         │ Thanos Query  │  ← 全局统一查询入口
         └───────────────┘
```


---

## Architecture

Thanos 遵循 **UNIX 哲学**：每个组件做一件事，通过 gRPC Store API 协作。

### 核心组件一览

| Component | 角色 | 是否有状态 | 说明 |
|-----------|------|-----------|------|
| **Sidecar** | 数据源 | 否（挂在 Prometheus 旁） | 连接 Prometheus，上传 Block 到对象存储，暴露 Store API |
| **Querier/Query** | 查询层 | 否 | 实现 PromQL，聚合下游所有 Store API 的数据 |
| **Query Frontend** | 查询加速 | 否 | 代理 Querier，提供缓存、拆分、限流 |
| **Store Gateway** | 历史数据网关 | 有（缓存索引） | 从对象存储读取 Block 数据，暴露 Store API |
| **Compactor** | 后台处理 | 有（临时工作目录） | 合并 Block、降采样、执行数据保留策略（**单例**） |
| **Receiver** | 数据接收 | 有 | 接收 Prometheus Remote Write 数据，可上传到对象存储 |
| **Ruler/Rule** | 规则评估 | 否 | 基于 Querier 执行 Recording / Alerting Rules |

### 整体架构图

```
                        ┌─────────────────────────┐
                        │    Grafana / API         │
                        └────────────┬────────────┘
                                     │ PromQL
                        ┌────────────▼────────────┐
                        │    Query Frontend        │  ← 缓存 / 拆分 / 限流
                        └────────────┬────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │       Querier (Query)    │  ← 全局 PromQL 聚合
                        └──┬─────────┬─────────┬──┘
                           │         │         │  gRPC Store API
              ┌────────────▼──┐  ┌───▼────┐  ┌▼────────────┐
              │   Sidecar A   │  │ Store  │  │   Ruler     │
              │  (Prom A 旁)  │  │Gateway │  │ (规则评估)   │
              └───────┬───────┘  └───┬────┘  └─────────────┘
                      │              │
                      │  上传 Block   │ 读取 Block
                      ▼              ▼
              ┌──────────────────────────────┐
              │       Object Storage          │
              │  (S3 / GCS / Azure / MinIO)   │
              └──────────────┬───────────────┘
                             │
                      ┌──────▼──────┐
                      │  Compactor  │  ← 合并 + 降采样 + 保留策略（单例）
                      └─────────────┘
```

![Deployment with Sidecar for Kubernetes](https://docs.google.com/drawings/d/e/2PACX-1vSJd32gPh8-MC5Ko0-P-v1KQ0Xnxa0qmsVXowtkwVGlczGfVW-Vd415Y6F129zvh3y0vHLBZcJeZEoz/pub?w=960&h=720)

下图通过 Remote Write 将数据推送到 Receiver。

![Deployment with Receive](https://docs.google.com/drawings/d/e/2PACX-1vRdYP__uDuygGR5ym1dxBzU6LEx5v7Rs1cAUKPsl5BZrRGVl5YIj5lsD_FOljeIVOGWatdAI9pazbCP/pub?w=960&h=720)

### Store API — 统一数据接口

所有数据源（Sidecar、Store Gateway、Ruler、Receiver）都暴露相同的 **gRPC Store API**，Querier 不关心数据来自哪里：

```
Querier 视角：
  ┌──────────┐   Store API    ┌──────────┐
  │ Querier  │ ──────────────▶│ Sidecar  │  ← 最近 2h 数据（Prometheus 内存）
  │          │ ──────────────▶│ Store GW │  ← 历史数据（对象存储）
  │          │ ──────────────▶│ Ruler    │  ← 规则评估结果
  │          │ ──────────────▶│ Receiver │  ← Remote Write 数据
  └──────────┘
```


---

## Deployment Models

Thanos 支持多种部署模式，可以逐步引入：

### Model 1: Sidecar only（最简部署）

```
┌────────────────────────┐
│  Kubernetes Pod         │
│  ┌──────────┐ ┌──────┐ │
│  │Prometheus│ │Sidecar│ │
│  └──────────┘ └──┬───┘ │
└──────────────────┼─────┘
                   │ 上传 Block
                   ▼
          ┌────────────────┐
          │ Object Storage  │
          └────────────────┘
```

### Model 2: Sidecar + Querier + Store Gateway（全局查询）

```
┌───────────┐  ┌───────────┐
│ Prom + SC │  │ Prom + SC │   ← 多个 Prometheus 各自采集
└─────┬─────┘  └─────┬─────┘
      │              │
      ▼              ▼
┌──────────────────────────┐
│     Object Storage        │
└────────────┬─────────────┘
             │
      ┌──────▼──────┐
      │ Store Gateway│
      └──────┬──────┘
             │
      ┌──────▼──────┐     ┌────────┐
      │   Querier   │────▶│ Grafana│
      └─────────────┘     └────────┘
```

### Model 3: Receiver（水平扩展写入）

```
┌───────────┐  ┌───────────┐
│Prometheus │  │Prometheus │   ← 各集群 Prometheus
│ Remote    │  │ Remote    │
│ Write     │  │ Write     │
└─────┬─────┘  └─────┬─────┘
      │              │
      ▼              ▼
┌──────────────────────────┐
│     Receiver (HA)         │  ← 接收 Remote Write，可水平扩展
└────────────┬─────────────┘
             │
      ┌──────▼──────┐
      │ Store Gateway│──▶ Querier ──▶ Grafana
      └─────────────┘
```

### Model 4: Full Stack（完整部署）

```
Prom + Sidecar ──▶ Object Storage ◀── Compactor
                        │
                   Store Gateway ──▶ Querier ◀── Ruler
                                        │
                                  Query Frontend ──▶ Grafana
```


---

## Installation & Setup

### Docker 快速体验

```bash
# 1. 启动 Prometheus（需要开启 remote-read 和 external labels）
docker run -d --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# 2. 启动 Thanos Sidecar
docker run -d --name thanos-sidecar \
  --network container:prometheus \
  thanosio/thanos sidecar \
    --prometheus.url=http://localhost:9090 \
    --tsdb.path=/prometheus \
    --grpc-address=0.0.0.0:10901 \
    --http-address=0.0.0.0:10902

# 3. 启动 Thanos Querier
docker run -d --name thanos-query \
  -p 9091:19192 \
  thanosio/thanos query \
    --http-address=0.0.0.0:19192 \
    --store=thanos-sidecar:10901

# 访问 http://localhost:9091 即可使用 Thanos Query UI
```

### Prometheus 配置要求

```yaml
global:
  scrape_interval: 15s
  # 必须配置 external_labels，用于全局标识和去重
  external_labels:
    cluster: us-east-1
    replica: A           # HA 对的副本标识

# 必须开启 lifecycle API，Sidecar 需要热重载 Prometheus 配置
web:
  enable-lifecycle: true
```

### 常用端口规划

| Component | gRPC | HTTP |
|-----------|------|------|
| Sidecar | 10901 | 10902 |
| Querier | 10903 | 10904 |
| Store Gateway | 10905 | 10906 |
| Receiver (Store API) | 10907 | — |
| Receiver (Remote Write) | — | 10908 |
| Receiver (HTTP) | — | 10909 |
| Ruler | 10910 | 10911 |
| Compactor | — | 10912 |
| Query Frontend | — | 10913 |


---

## Sidecar

Sidecar 是 Thanos 与 Prometheus 集成的桥梁，运行在 Prometheus 同一台机器或同一个 Pod 中。

**核心职责**：
1. **上传 Block**：将 Prometheus 已完成的 TSDB Block 上传到对象存储
2. **暴露 Store API**：让 Querier 可以查询 Prometheus 内存中的实时数据
3. **热重载**：通过 Prometheus `/-/reload` 端点动态更新配置

```bash
thanos sidecar \
  --tsdb.path=/var/prometheus \
  --prometheus.url=http://localhost:9090 \
  --objstore.config-file=bucket_config.yaml \
  --grpc-address=0.0.0.0:10901 \
  --http-address=0.0.0.0:10902
```

### External Labels — 关键配置

每个 Prometheus 实例**必须**配置全局唯一的 external labels，用于 Thanos 识别数据来源和 HA 去重：

```yaml
global:
  external_labels:
    cluster: eu-west-1
    monitor: infrastructure
    replica: A       # HA 对中一个为 A，另一个为 B
```

> **注意**：如果两个 Prometheus 实例的 external_labels 完全相同（除了 replica），Thanos Querier 会自动去重。


---

## Querier (Query)

Querier 是 Thanos 的**全局查询入口**，实现 Prometheus 的 HTTP API，可直接对接 Grafana。

**特点**：
- **无状态**，可水平扩展
- 自动发现所有 Store API 端点
- 基于元数据智能路由，最小化 fan-out
- 支持 HA 去重（基于 replica label）

```bash
thanos query \
  --http-address=0.0.0.0:19192 \
  --grpc-address=0.0.0.0:19092 \
  --store=1.2.3.4:10901 \
  --store=1.2.3.5:10901 \
  --store=dnssrv+_grpc._tcp.thanos-store.monitoring.svc \
  --query.replica-label=replica     # HA 去重标签
```

### 服务发现

Querier 支持多种方式发现 Store API 端点：

| 方式 | 示例 | 说明 |
|------|------|------|
| 静态地址 | `--store=1.2.3.4:10901` | 直接指定 IP:Port |
| DNS A 记录 | `--store=dns+thanos.peers:10901` | 解析所有 A 记录 |
| DNS SRV 记录 | `--store=dnssrv+_grpc._tcp.thanos.svc` | 解析 SRV 记录（推荐 K8s） |
| File SD | `--store.sd-files=stores.yaml` | 从文件动态加载 |
| Consul / Etcd | `--store.sd-consul-address=...` | 基于服务注册中心 |

### HA 去重

```bash
# Prometheus HA 对配置：
# 实例 A: external_labels: {cluster: prod, replica: A}
# 实例 B: external_labels: {cluster: prod, replica: B}

thanos query \
  --query.replica-label=replica      # 按 replica 去重
  --query.replica-label=prometheus   # 支持多个去重标签
```


---

## Query Frontend

Query Frontend 位于 Querier 前面，提供**缓存、拆分、限流**能力：

```bash
thanos query-frontend \
  --http-address=0.0.0.0:19191 \
  --query-frontend.downstream-url=http://thanos-query:19192 \
  --query-range.response-cache-config=cache_config.yaml
```

| 功能 | 说明 |
|------|------|
| Response Caching | 缓存 range query 响应，减少重复计算 |
| Query Splitting | 将长时间范围查询拆分为多个小查询并行执行 |
| Rate Limiting | 限制查询 QPS，保护后端 Querier |
| Retry | 自动重试失败的查询 |

```
Grafana ──▶ Query Frontend ──▶ Querier ──▶ Store API endpoints
                │
           (缓存层: Memcached / In-Memory)
```


---

## Store Gateway

Store Gateway 从对象存储读取历史 Block 数据，暴露 Store API 供 Querier 查询。

```bash
thanos store \
  --data-dir=/var/thanos/store \
  --objstore.config-file=bucket_config.yaml \
  --grpc-address=0.0.0.0:10905 \
  --http-address=0.0.0.0:10906
```

**工作原理**：
1. 持续同步对象存储中的 Block 元数据
2. 将 PromQL 查询翻译为最少的对象存储请求
3. 缓存索引数据到本地磁盘（通常几 GB）

> **性能提示**：Store Gateway 的瓶颈通常在对象存储的请求数量。合理配置 `--index-cache-config` 可以显著降低延迟。


---

## Compactor

Compactor 是**单例**后台进程，负责合并、降采样和保留策略。

```bash
thanos compact \
  --data-dir=/var/thanos/compact \
  --objstore.config-file=bucket_config.yaml \
  --http-address=0.0.0.0:10912 \
  --wait                        # 持续运行（推荐），而非一次性批处理
```

| 功能 | 说明 |
|------|------|
| Compaction | 将多个小 Block 合并为大 Block（2h → 2d → 14d） |
| Downsampling | 生成 5m 和 1h 精度的降采样数据，加速大范围查询 |
| Retention | 按配置过期删除数据（`--retention.resolution-raw` 等） |

### 降采样层级

```
原始数据 (15s 间隔)    ← resolution=0
    ↓ 降采样
5 分钟聚合数据          ← resolution=300000 (5min)
    ↓ 降采样
1 小时聚合数据          ← resolution=3600000 (1h)
```

### 保留策略

```bash
thanos compact \
  --retention.resolution-raw=30d      # 原始数据保留 30 天
  --retention.resolution-5m=180d      # 5m 降采样数据保留 180 天
  --retention.resolution-1h=365d      # 1h 降采样数据保留 365 天
```

> ⚠️ **Compactor 必须单例运行**，不能多副本并行执行，否则会损坏数据。


---

## Receiver

Receiver 接收 Prometheus Remote Write 数据，适用于需要**水平扩展写入**或**多租户**的场景。

```bash
thanos receive \
  --tsdb.path=/var/thanos/receive \
  --objstore.config-file=bucket_config.yaml \
  --grpc-address=0.0.0.0:10907 \
  --remote-write.address=0.0.0.0:10908 \
  --http-address=0.0.0.0:10909 \
  --label=receive="true" \
  --receive.replication-factor=2 \
  --receive.local-endpoint=0.0.0.0:10907
```

### 数据流向

```
Prometheus ──Remote Write──▶ Receiver ──┬──▶ 本地 TSDB（可查询）
                                        └──▶ Object Storage（长期存储）
```

| 模式 | 说明 |
|------|------|
| Routing | Receiver 组成 hash ring，按 tenant 路由数据 |
| Replication | `--receive.replication-factor=N` 保证 HA |
| Tenant | 通过 `THANOS-TENANT` HTTP header 区分租户 |


---

## Ruler (Rule)

Ruler 基于 Querier 执行 Recording Rules 和 Alerting Rules，适用于需要**全局视图**的规则评估。

```bash
thanos rule \
  --data-dir=/var/thanos/rule \
  --eval-interval=15s \
  --rule-file=/etc/thanos/rules/*.yaml \
  --alertmanagers.url=http://alertmanager:9093 \
  --query=thanos-query:19192 \
  --grpc-address=0.0.0.0:10910 \
  --http-address=0.0.0.0:10911 \
  --objstore.config-file=bucket_config.yaml \
  --label=ruler_cluster="prod"
```

### Ruler vs Prometheus Alerting

| 维度 | Prometheus 本地告警 | Thanos Ruler |
|------|---------------------|--------------|
| 数据范围 | 单个 Prometheus 实例 | 全局（通过 Querier） |
| 依赖 | 无 | 依赖 Querier 可用 |
| 结果存储 | 内存 | 本地 TSDB + 可上传对象存储 |
| 适用场景 | 基础设施级告警 | 跨集群/全局告警 |

> 💡 **推荐**：基础设施级告警（如节点宕机）仍用 Prometheus 本地 Alerting；跨集群/全局告警（如整体错误率超阈值）用 Thanos Ruler。


---

## Object Storage 配置

Thanos 支持多种对象存储后端，统一通过 YAML 配置：

### S3 示例

```yaml
type: S3
config:
  bucket: thanos-metrics
  endpoint: s3.amazonaws.com
  region: us-east-1
  access_key: ${AWS_ACCESS_KEY_ID}
  secret_key: ${AWS_SECRET_ACCESS_KEY}
```

### GCS 示例

```yaml
type: GCS
config:
  bucket: thanos-metrics
  service_account: /etc/thanos/gcs-sa.json
```

### MinIO（本地开发）

```yaml
type: S3
config:
  bucket: thanos-metrics
  endpoint: minio:9000
  access_key: minioadmin
  secret_key: minioadmin
  insecure: true
```

### 支持的存储后端

| Provider | 类型 | 说明 |
|----------|------|------|
| AWS S3 | `S3` | 标准 S3 兼容 |
| Google Cloud Storage | `GCS` | 原生 GCS |
| Azure Blob Storage | `AZURE` | 原生 Azure |
| MinIO | `S3` | S3 兼容，适合本地开发 |
| Tencent COS | `COS` | 腾讯云对象存储 |
| Alibaba OSS | `ALIBABA` | 阿里云对象存储 |


---

## Kubernetes 部署

### 使用 Prometheus Operator

Prometheus Operator 原生支持 Thanos Sidecar：

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: prometheus
spec:
  replicas: 2
  thanos:
    version: v0.32.0
    objectStorageConfig:
      key: thanos.yaml
      name: thanos-objstore-secret
  externalLabels:
    cluster: prod-us
    replica: $(POD_NAME)    # 用 Pod 名作为 replica 标签
```

### 社区部署方案

| 方案 | 类型 | 说明 |
|------|------|------|
| [kube-thanos](https://github.com/thanos-io/kube-thanos) | Jsonnet | 官方 Jsonnet 模板 |
| [prometheus-operator](https://prometheus-operator.dev/) | Operator | Prometheus Operator 内置 Thanos |
| [bitnami/thanos](https://bitnami.com/stack/thanos) | Helm Chart | Bitnami 维护的 Helm Chart |


---

## Downsampling & Performance

### 查询优化

Thanos 查询时自动选择最优分辨率：

```promql
# 查询过去 1 小时的数据 → 使用原始数据 (raw)
metric[1h]

# 查询过去 7 天的数据 → 可能使用 5m 降采样数据
metric[7d]

# 查询过去 90 天的数据 → 使用 1h 降采样数据
metric[90d]
```

### 性能调优建议

| 建议 | 说明 |
|------|------|
| 合理设置 retention | 本地 Prometheus retention 缩短到 2-4h，减少磁盘 |
| 启用 index cache | Store Gateway 配置 Memcached 缓存索引 |
| Query Frontend 缓存 | 缓存 range query 响应 |
| 避免超大查询 | `step` 不要太小，时间范围不要太大 |
| Compactor 持续运行 | `--wait` 模式，及时合并和降采样 |


---

## Thanos vs Prometheus Federation

| 维度 | Prometheus Federation | Thanos |
|------|----------------------|--------|
| 架构 | 层级拉取（hub-spoke） | 分布式组件协作 |
| 全局查询 | 有限（federate 端点） | 完整 PromQL |
| 长期存储 | 无 | 对象存储，无限保留 |
| HA 去重 | 不支持 | 原生支持 |
| 运维复杂度 | 低 | 中（多组件） |
| 适用场景 | 简单汇总少量指标 | 大规模多集群监控 |


---

## Best Practices

### External Labels 规范

```yaml
# 推荐：每个 Prometheus 实例全局唯一
global:
  external_labels:
    cluster: <cluster-name>     # 集群名
    region: <region>            # 区域
    replica: <replica-id>       # HA 副本标识（A/B 或 Pod 名）
```

### 部署建议

1. **渐进式引入**：先部署 Sidecar 备份数据 → 再加 Querier 全局查询 → 最后加 Compactor/Ruler
2. **Prometheus 仍是基础**：不要把 Thanos 当作 Prometheus 的替代品，Prometheus 依然是数据采集核心
3. **Compactor 必须单例**：多副本会导致数据损坏
4. **Receiver 需要 hash ring**：多 Receiver 实例需配置 `--receive.hashrings-file`
5. **对象存储是唯一的可选依赖**：Thanos 设计上只依赖对象存储（如果不需要长期存储，甚至不需要）

### 常见陷阱

| 陷阱 | 说明 | 解决 |
|------|------|------|
| External Labels 不一致 | 导致去重失败或数据混乱 | 所有 Prometheus 实例统一规划 labels |
| Compactor 多副本 | 数据损坏 | 用 Deployment replicas=1 或 CronJob |
| Prometheus retention 太长 | 本地磁盘浪费，Sidecar 重复上传 | 缩短到 2-4h |
| 忘记 `--web.enable-lifecycle` | Sidecar 无法热重载 Prometheus | Prometheus 启动参数加上 |
| Store Gateway 无缓存 | 查询延迟高 | 配置 index-cache（Memcached） |


---

## Killercoda & Interactive Tutorials

| 来源 | 教程 | 链接 | 说明 |
|------|------|------|------|
| Thanos 官方 | Killercoda Thanos Course | [Killercoda](https://killercoda.com/) | 免费、浏览器内交互式教程 |
| Thanos 官方 | Quick Tutorial | [thanos.io](https://thanos.io/v0.31/thanos/quick-tutorial.md/) | 官方快速上手教程 |
| Thanos 官方 | Katacoda (archived) | — | 已迁移到 Killercoda |


---

## Reference

- [Thanos Official Docs](https://thanos.io/tip/thanos/getting-started.md/)
- [Thanos GitHub](https://github.com/thanos-io/thanos)
- [Thanos Design Doc](https://thanos.io/tip/thanos/design.md/)
- [Thanos Quick Tutorial (v0.31)](https://thanos.io/v0.31/thanos/quick-tutorial.md/)
- [Thanos Killercoda Course](https://killercoda.com/)
- [kube-thanos (K8s Jsonnet)](https://github.com/thanos-io/kube-thanos)
- [Prometheus Operator + Thanos](https://prometheus-operator.dev/)
- [Thanos Blog](https://thanos.io/blog/)
- [CNCF Thanos Landscape](https://landscape.cncf.io/?item=observability-and-analysis--monitoring--thanos)
