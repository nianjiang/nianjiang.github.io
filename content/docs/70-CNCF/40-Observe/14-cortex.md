---
weight: 14
title: "Cortex"
---


# [Cortex](https://cortexmetrics.io/) Notes
> This is my learning Notes for Cortex — Horizontally Scalable, Multi-Tenant, Long-Term Prometheus

[Docs](https://cortexmetrics.io/docs/), [Github](https://github.com/cortexproject/cortex)

[Architecture](https://cortexmetrics.io/docs/architecture/), [Getting Started](https://cortexmetrics.io/docs/getting-started/), [CNCF Landscape](https://landscape.cncf.io/?item=observability-and-analysis--monitoring--cortex)

Cortex 是一个**水平可扩展、高可用、多租户**的 Prometheus 长期存储方案。最初由 Weaveworks 开发（2016），现为 CNCF Sandbox 项目。AWS AMP（Amazon Managed Service for Prometheus）底层即基于 Cortex。


## Why Cortex? — 解决什么问题

| 需求 | 原生 Prometheus | Thanos | Cortex |
|------|-----------------|--------|--------|
| 水平扩展写入 | ❌ 单机 | ⚠️ Receive 模式 | ✅ Distributor + Ingester |
| 多租户隔离 | ❌ | ❌ 无原生支持 | ✅ 原生多租户 |
| 长期存储 | ❌ 本地磁盘 | ✅ 对象存储 | ✅ 对象存储 |
| 高可用 | ❌ 单点 | ✅ HA 对 + 去重 | ✅ 复制因子 + WAL |
| 查询引擎 | ✅ PromQL | ✅ PromQL | ✅ PromQL |
| 部署复杂度 | 低 | 中 | 高（微服务架构） |

```
Cortex 的定位：
  Prometheus 的 "生产级规模化方案"
  适用于：
    • 需要多租户隔离的 SaaS 监控平台
    • 超大规模时序数据（数十亿 active series）
    • 需要严格 SLA 的生产环境
```


---

## Architecture

Cortex 采用**微服务架构**，每个组件可独立部署和扩展。也支持**单二进制模式**（所有组件合一），适合开发测试。

### 核心组件一览

| Component | 角色 | 是否有状态 | 说明 |
|-----------|------|-----------|------|
| **Distributor** | 写入入口 | 否 | 接收 Prometheus Remote Write，校验、分片后分发到 Ingester |
| **Ingester** | 写入缓冲 | 半状态 | 接收样本，内存暂存后定期刷写到对象存储（默认 2h 一个 Block） |
| **Querier** | 查询 | 否 | 执行 PromQL，同时从 Ingester 和 Store-gateway 获取数据 |
| **Query Frontend** | 查询加速 | 否 | 拆分、缓存、限流、公平调度 |
| **Query Scheduler** | 查询调度 | 否 | 将队列从 Query Frontend 分离，独立扩展 |
| **Store-gateway** | 历史数据查询 | 半状态 | 从对象存储读取 Block 数据供 Querier 查询 |
| **Compactor** | 后台处理 | 否 | 合并 Block、去重、更新 bucket index（**单例**） |
| **Ruler** | 规则评估 | 半状态 | 执行 Recording / Alerting Rules |
| **Alertmanager** | 告警管理 | 半状态 | 告警去重、分组、路由（基于 Prometheus Alertmanager） |

### 整体架构图

```
                         ┌─────────────────────────┐
                         │   Grafana / API          │
                         └────────────┬────────────┘
                                      │ PromQL
                         ┌────────────▼────────────┐
                         │    Query Frontend        │  ← 拆分 / 缓存 / 限流
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │    Query Scheduler       │  ← 队列调度（可选）
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │       Querier            │  ← PromQL 执行 + 去重
                         └──┬─────────────────┬────┘
                            │                 │
              ┌─────────────▼──┐    ┌────────▼────────┐
              │   Ingester     │    │ Store-gateway    │
              │ (最近 2h 数据)  │    │ (历史 Block 数据) │
              └────────┬───────┘    └────────┬────────┘
                       │                     │
                       │  刷写 Block          │ 读取 Block
                       ▼                     ▼
              ┌─────────────────────────────────────┐
              │          Object Storage              │
              │     (S3 / GCS / Azure / Swift)       │
              └──────────────────┬──────────────────┘
                                 │
                          ┌──────▼──────┐
                          │  Compactor  │  ← 合并 + 去重（单例）
                          └─────────────┘

  Prometheus ──Remote Write──▶ Distributor ──▶ Ingester
                                │
                          HA Tracker（去重 Prometheus HA 对）
                          Hash Ring（一致性哈希分片）
```

### 数据流

```
写入路径（Write Path）：
  Prometheus ──remote_write──▶ Distributor ──▶ Ingester ──flush──▶ Object Storage
                                    │              │
                              校验 + 分片       内存 → 2h Block → 上传

读取路径（Read Path）：
  Grafana ──PromQL──▶ Query Frontend ──▶ Querier ──┬──▶ Ingester（最近数据）
                                                     └──▶ Store-gateway（历史数据）
```


---

## Multi-Tenancy — 核心特性

Cortex 的**多租户**是其与 Thanos 最大的差异点。

### 工作原理

```
Tenant A (X-Scope-OrgID: tenant-a)
  └─ 独立的时序数据、规则、告警配置

Tenant B (X-Scope-OrgID: tenant-b)
  └─ 独立的时序数据、规则、告警配置

Tenant C (X-Scope-OrgID: tenant-c)
  └─ 独立的时序数据、规则、告警配置

所有租户共享同一套 Cortex 集群基础设施
```

- 每个请求通过 HTTP Header `X-Scope-OrgID` 携带租户 ID
- 认证和授权由外部反向代理（如 Nginx、Traefik）处理
- 数据在存储层按租户隔离（每个租户独立的 TSDB 和 Block）
- 可以为每个租户配置独立的限额（limits）

### 典型部署

```
                    ┌──────────────────────┐
                    │   Reverse Proxy      │
                    │ (认证 + 注入 OrgID)   │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         X-OrgID: A      X-OrgID: B       X-OrgID: C
              │                │                │
              ▼                ▼                ▼
         ┌─────────────────────────────────────────┐
         │            Cortex Cluster                │
         │  (共享基础设施，数据按租户隔离)            │
         └─────────────────────────────────────────┘
```


---

## Write Path — 写入路径详解

### Distributor

Distributor 是写入的第一站，负责：

1. **校验**：标签名合法性、标签数量/长度限制、时间戳范围
2. **HA 去重**：通过 HA Tracker 去除 Prometheus HA 对的重复数据
3. **分片**：基于一致性哈希，将样本路由到对应的 Ingester
4. **复制**：按复制因子（通常 3）将数据发送到多个 Ingester

```bash
# HA Tracker 需要的外部 label 配置
# Prometheus 配置：
global:
  external_labels:
    cluster: prod
    replica: A       # HA 对中标识副本
```

### Hash Ring（哈希环）

Distributor 使用**一致性哈希环**确定每个时序应写入哪些 Ingester：

```
Hash Ring（存储在 Consul / Etcd / Gossip 中）：

      0         10000      20000      30000
      │          │          │          │
  ────●──────────●──────────●──────────●────
      I-1        I-2        I-3        I-1
   (token A)  (token B)  (token C)  (token D)

时序 "http_requests_total{method=GET}"
  → hash = 15000
  → 路由到 I-3（token 20000 ≥ 15000 的最近节点）
  → 复制因子=3 时，同时写入 I-3, I-1, I-2
```

### Ingester

Ingester 是**写入缓冲层**，核心设计思想是**写去放大（Write De-amplification）**：

```
收到样本 → 内存暂存（WAL 保护）→ 每 2h 刷写为 Block → 上传到对象存储

优势：
  • 避免频繁写对象存储（高成本、高延迟）
  • 批量压缩，降低存储成本
  • WAL 保证崩溃恢复
```

**Ingester 状态机**：

| 状态 | 说明 |
|------|------|
| PENDING | 刚启动，不接收请求 |
| JOINING | 加入哈希环，不接收请求 |
| ACTIVE | 正常运行，接收读写请求 |
| LEAVING | 关闭中，不接收写请求 |
| UNHEALTHY | 心跳失败，被 Distributor 跳过 |


---

## Read Path — 读取路径详解

### Querier

Querier 执行 PromQL 查询，同时从两个来源获取数据：

```
Querier 查询策略：
  ┌─────────────────────────────────────────────────┐
  │  查询时间范围                                      │
  │  ├──── 最近 2h ────▶ 从 Ingester 获取（内存数据）  │
  │  └──── 历史数据 ────▶ 从 Store-gateway 获取        │
  └─────────────────────────────────────────────────┘

去重：
  • 复制因子=3 时，同一时序有 3 份
  • Querier 自动去除相同时间戳的重复样本
```

### Query Frontend

Query Frontend 位于 Querier 前面，提供三大能力：

| 功能 | 说明 |
|------|------|
| **Splitting** | 将多日查询拆分为多个单日查询并行执行 |
| **Caching** | 缓存查询结果（Memcached / Redis / 内存），减少重复计算 |
| **Fair Scheduling** | 按租户公平调度，防止单租户 DOS 其他租户 |

```
Grafana ──▶ Query Frontend ──▶ Query Scheduler ──▶ Querier Pool
                │                    │
           缓存 / 拆分          队列 / 调度
```

### Store-gateway

Store-gateway 从对象存储查询历史 Block 数据：

- 定期扫描 bucket 或使用 bucket index 发现新 Block
- 下载 index-header（Block 索引的子集）到本地磁盘
- 将对象存储请求翻译为最少的 I/O 操作


---

## Compactor

Compactor 是**单例**后台进程，负责：

| 功能 | 说明 |
|------|------|
| **Block 合并** | 将多个小 Block 合并为大 Block，减少存储成本和查询开销 |
| **去重** | 移除来自不同 Ingester 的重复样本（复制因子导致） |
| **Bucket Index** | 维护 bucket index，供 Querier / Store-gateway / Ruler 发现新 Block |

```
Compactor 工作前：
  Ingester-1 Block  │  Ingester-2 Block  │  Ingester-3 Block
  (重复数据 × 3)     │  (重复数据 × 3)     │  (重复数据 × 3)

Compactor 工作后：
  合并后的单个 Block（去重 + 压缩）→ 存储成本降低约 2/3
```

> ⚠️ **Compactor 必须单例运行**，多副本会导致数据损坏。


---

## Blocks Storage

Cortex 的存储引擎基于 **Prometheus TSDB**，每个租户拥有独立的 TSDB。

### Block 结构

```
<ULID>/
├── chunks/
│   ├── 000001        ← 时序样本数据（压缩后）
│   ├── 000002
│   └── 000003
├── index             ← 标签 → 时序的索引
└── meta.json         ← Block 元信息（时间范围、统计等）
```

### 存储后端支持

| Provider | 说明 |
|----------|------|
| Amazon S3 | 标准 S3 兼容 |
| Google Cloud Storage | 原生 GCS |
| Microsoft Azure Blob | 原生 Azure |
| OpenStack Swift | 开源对象存储 |
| Local Filesystem | 仅限单节点测试 |

### 写入流程

```
Prometheus 样本
    │
    ▼
Distributor ──▶ Ingester（内存 + WAL）
                    │
                    │ 每 2h 创建 Block
                    ▼
               本地 TSDB Block
                    │
                    │ 上传
                    ▼
              Object Storage
                    │
                    │ Compactor 合并去重
                    ▼
              优化后的 Block
```

### 存储成本估算

```
100 万 active series，15s 抓取间隔：
  • 每样本约 1.07 bytes
  • 每天约 5.76 GB
  • 每月约 173 GB
  • S3 成本约 $0.02/GB → 每月约 $3.46

对比本地 SSD ($0.17/GB)：成本降低约 88%
```


---

## Installation & Setup

### 单二进制模式（开发测试）

```bash
# Docker Compose 快速启动
# 组件：Cortex + Prometheus + Grafana + SeaweedFS (S3)

# docker-compose.yml 核心配置：
cortex:
  image: cortexproject/cortex:latest
  command:
    - -config.file=/etc/cortex.yaml
  ports:
    - "9009:9009"

# Cortex 配置 (cortex.yaml)
# target: all          # 单二进制模式
# storage:
#   backend: s3
#   s3:
#     endpoint: seaweedfs:9000
#     bucket_name: cortex
```

### Prometheus Remote Write 配置

```yaml
# prometheus.yml
remote_write:
  - url: http://cortex:9009/api/v1/push
    headers:
      X-Scope-OrgID: my-tenant    # 租户 ID
    queue_config:
      max_samples_per_send: 1000
      batch_send_deadline: 5s
      max_shards: 200
```

### Kubernetes 微服务部署

```bash
# 使用 Helm Chart 部署
helm repo add cortex-helm https://cortexproject.github.io/cortex-helm-chart
helm install cortex cortex-helm/cortex \
  --set config.storage.backend=s3 \
  --set config.storage.s3.endpoint=s3.amazonaws.com \
  --set config.storage.s3.bucket_name=cortex-metrics
```

### 社区部署方案

| 方案 | 类型 | 说明 |
|------|------|------|
| [cortex-helm-chart](https://github.com/cortexproject/cortex-helm-chart) | Helm | 官方 Helm Chart |
| [cortex-jsonnet](https://github.com/cortexproject/cortex-jsonnet) | Jsonnet | 官方 Jsonnet 模板（Grafana 维护） |
| [kube-ops](https://github.com/cortexproject/cortex/tree/main/operations) | K8s manifests | 原生 K8s 清单 |


---

## Cortex vs Thanos vs Mimir

| 维度 | Cortex | Thanos | [Mimir](https://grafana.com/oss/mimir/) |
|------|--------|--------|------|
| CNCF 级别 | Sandbox | Incubating | — (Grafana Labs) |
| 多租户 | ✅ 原生 | ❌ | ✅ 原生 |
| 架构风格 | 微服务 | 组合式组件 | 微服务（fork 自 Cortex） |
| 写入方式 | Remote Write | Sidecar / Receive | Remote Write |
| 存储引擎 | Blocks (TSDB) | Blocks (TSDB) | Blocks (TSDB) |
| 查询引擎 | PromQL | PromQL | PromQL |
| 适用场景 | 多租户 SaaS | 多集群全局查询 | 大规模单/多租户 |
| 部署复杂度 | 高 | 中 | 高 |
| 社区活跃度 | 中 | 高 | 高（Grafana 主导） |

> 💡 **Mimir** 是 Grafana Labs 从 Cortex fork 出来的项目，兼容 Cortex API，但优化了性能和运维体验。如果你正在选型，建议同时评估 Mimir。


---

## HA & Replication

### 写入高可用

```
复制因子 = 3 时：
  Prometheus ──▶ Distributor ──┬──▶ Ingester A
                               ├──▶ Ingester B
                               └──▶ Ingester C

Dynamo-style 仲裁一致性：
  • 写入成功条件：至少 (RF/2 + 1) = 2 个 Ingester 确认
  • 读取成功条件：至少 (RF/2 + 1) = 2 个 Ingester 返回
```

### HA Tracker — Prometheus 去重

```
Prometheus HA 对：
  Prometheus-A (replica=A) ──┐
                             ├──▶ Distributor ──▶ HA Tracker 去重 ──▶ Ingester
  Prometheus-B (replica=B) ──┘

HA Tracker 通过 Consul/Etcd 选举 leader：
  • 只接受 leader 的数据
  • leader 故障时自动 failover
```

### 读取高可用

```
Querier 查询时：
  • 从多个 Ingester 获取最近数据 → 去重
  • 从 Store-gateway 获取历史数据
  • Querier 本身无状态，可任意扩展
```


---

## Operational Best Practices

### 限额配置（Limits）

```yaml
# 每个租户的限额示例
limits:
  ingestion_rate: 10000          # 每秒最大样本数
  ingestion_burst_size: 200000   # 突发容量
  max_series_per_metric: 50000   # 每 metric 最大时序数
  max_series_per_user: 1500000   # 每租户最大时序数
  max_query_length: 720h         # 最大查询时间范围
  max_query_parallelism: 16      # 最大查询并行度
```

### 关键运维建议

| 建议 | 说明 |
|------|------|
| Ingester 使用持久卷 | WAL 需要持久化磁盘（EBS / PD），防止崩溃丢数据 |
| Compactor 必须单例 | 多副本会导致 Block 损坏 |
| 合理设置复制因子 | 生产环境推荐 RF=3 |
| 配置 Query Frontend | 缓存 + 拆分 + 公平调度，缺一不可 |
| 监控 Cortex 自身 | 用 Prometheus 监控 Cortex 各组件指标 |
| 规划哈希环大小 | Ingester 数量与哈希环 token 数需匹配 |

### 常见陷阱

| 陷阱 | 说明 | 解决 |
|------|------|------|
| 忘记 X-Scope-OrgID | 请求被拒绝（401） | 反向代理统一注入 |
| Ingester 无持久卷 | 崩溃后内存数据丢失 | 使用 PVC / 持久磁盘 |
| Compactor 多副本 | Block 损坏 | Deployment replicas=1 |
| 未配置限额 | 单租户耗尽集群资源 | 设置 per-tenant limits |
| HA Tracker 用 Memberlist | 选举不一致 | 使用 Consul / Etcd |


---

## Cortex as Query Accelerator

Cortex Query Frontend 可以独立使用，加速**任意 Prometheus 兼容后端**的查询：

```yaml
# 配置 Query Frontend 代理到非 Cortex 后端
query_frontend:
  downstream_url: http://thanos-querier:9090   # 或原生 Prometheus
  cache_results: true
  max_retries: 5
```

```
Grafana ──▶ Cortex Query Frontend ──▶ Thanos Querier / Prometheus
                │
           缓存 + 拆分 + 限流
```

> 💡 这个模式让你在不使用 Cortex 全栈的情况下，也能享受查询加速能力。


---

## Reference

- [Cortex Official Docs](https://cortexmetrics.io/docs/)
- [Cortex GitHub](https://github.com/cortexproject/cortex)
- [Cortex Architecture](https://cortexmetrics.io/docs/architecture/)
- [Cortex Getting Started](https://cortexmetrics.io/docs/getting-started/)
- [Cortex Blocks Storage](https://cortexmetrics.io/docs/blocks-storage/)
- [Cortex Helm Chart](https://github.com/cortexproject/cortex-helm-chart)
- [Cortex Jsonnet](https://github.com/cortexproject/cortex-jsonnet)
- [AWS AMP (基于 Cortex)](https://aws.amazon.com/prometheus/)
- [Grafana Mimir (Cortex fork)](https://grafana.com/oss/mimir/)
- [Cortex vs Thanos 对比 (PromCon 2019)](https://www.youtube.com/watch?v=q853JVX_4pM)
