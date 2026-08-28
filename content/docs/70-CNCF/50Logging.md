---
weight: 50
title: "Logging"
---


## Logging 学习路线

> 基于已有 Prometheus / Thanos / Cortex / SLS 基础，聚焦日志领域的系统学习路线。

```
Phase 1: 基础概念              Phase 2: 开源工具              Phase 3: 平台方案              Phase 4: 进阶实战
┌──────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│ • 日志是什么       │     │ • Fluent Bit         │     │ • Loki + Grafana     │     │ • K8s 日志架构        │
│ • 结构化 vs 非结构化│ ──▶ │ • Fluentd            │ ──▶ │ • ELK / Elastic      │ ──▶ │ • 日志可观测性三支柱   │
│ • 日志 vs 指标     │     │ • Vector             │     │ • 阿里云 SLS          │     │ • AIOps / 智能分析     │
│ • 日志格式与规范   │     │ • Promtail / Alloy     │     │ • Datadog / Splunk   │     │ • 成本优化与合规       │
└──────────────────┘     └──────────────────────┘     └──────────────────────┘     └──────────────────────┘
     1-2 周                     2-3 周                     2-3 周                     持续实践
```


---

### Phase 1: 日志基础（1-2 周）

**目标**：理解日志在可观测性中的定位，掌握日志格式与最佳实践。

| 主题 | 学习内容 | 参考资料 |
|------|----------|----------|
| 日志基础概念 | 什么是日志、日志 vs 指标 vs 链路追踪 | [Observability 笔记](40-Observe/_index.md) |
| 日志格式 | 非结构化 → 半结构化（JSON） → 结构化（key=value） | 下方"日志格式"章节 |
| 日志规范 | 日志级别、日志内容规范、敏感信息处理 | [12-Factor App: Logs](https://12factor.net/logs) |
| 日志架构模式 | 应用 → 采集 → 聚合 → 存储 → 查询 → 可视化 | 下方"架构模式"章节 |

#### 日志格式演进

```
非结构化（难以解析）：
  2025-01-15 10:30:00 ERROR Connection timeout to database server at 192.168.1.100

半结构化（JSON，最常用）：
  {"time":"2025-01-15T10:30:00Z","level":"ERROR","msg":"Connection timeout","host":"192.168.1.100"}

结构化（key=value，Prometheus 风格）：
  time="2025-01-15T10:30:00Z" level=error msg="Connection timeout" host=192.168.1.100
```

> 💡 **最佳实践**：应用日志输出为 **JSON 格式**到 **stdout/stderr**，由采集 Agent 负责收集和解析。这也是 12-Factor App 的推荐做法。


---

### Phase 2: 开源采集工具（2-3 周）

**目标**：掌握主流日志采集工具，理解其架构和适用场景。

| 工具 | 语言 | 定位 | 资源占用 | 适用场景 | 链接 |
|------|------|------|----------|----------|------|
| **Fluent Bit** | C | 轻量级采集器 | 极低（~5MB） | 边缘/IoT/K8s DaemonSet | [Docs](https://docs.fluentbit.io/), [Github](https://github.com/fluent/fluent-bit) |
| **Fluentd** | Ruby/C | 全功能日志管道 | 中 | 复杂路由/缓冲/加工 | [Docs](https://docs.fluentd.org/), [Github](https://github.com/fluent/fluentd) |
| **Vector** | Rust | 高性能管道 | 低 | 替代 Fluentd，性能更强 | [Docs](https://vector.dev/docs/), [Github](https://github.com/vectordotdev/vector) |
| **Promtail** | Go | Loki 专用采集器 | 低 | 配合 Loki 使用 | [Docs](https://grafana.com/docs/loki/latest/clients/promtail/) |
| **Alloy** | Go | Grafana 统一采集器 | 中 | Promtail 升级版，支持 Log/Metric/Trace | [Docs](https://grafana.com/docs/alloy/) |
| **LoongCollector** | Go | 阿里云采集器 | 中 | 对接 SLS | [Docs](https://help.aliyun.com/zh/sls/sls-log-collection/) |

#### 学习顺序

```
1. Fluent Bit（入门首选）
   └─ 最轻量，部署简单，适合理解采集原理
   └─ K8s 中最常用的 DaemonSet 日志采集方案

2. Fluentd（理解完整管道）
   └─ Input → Filter → Buffer → Output 架构
   └─ 丰富的插件生态（500+ 插件）

3. Vector（进阶选型）
   └─ Rust 编写，性能远超 Fluentd
   └─ VRL（Vector Remap Language）强大的数据转换能力

4. Promtail / Alloy（对接 Grafana 栈）
   └─ 如果后续学 Loki，先学 Promtail
   └─ Alloy 是 Grafana 力推的统一采集器
```

#### Fluent Bit vs Fluentd

| 维度 | Fluent Bit | Fluentd |
|------|-----------|---------|
| 语言 | C | Ruby + C |
| 内存 | ~5 MB | ~40-80 MB |
| 依赖 | 零依赖 | 需要 Ruby 环境 |
| 插件 | 内置核心插件 | 500+ 社区插件 |
| 适用 | 采集层（Agent） | 聚合层（Aggregator） |
| 典型搭配 | Fluent Bit → Fluentd → ES | 单独使用 |

> 💡 **生产常见架构**：Fluent Bit（每台机器上的 Agent）→ Fluentd（集中聚合器）→ Elasticsearch / Loki / SLS


---

### Phase 3: 日志平台方案（2-3 周）

**目标**：掌握至少一个完整的日志存储/查询/可视化平台。

#### 方案对比与选型

| 方案 | 类型 | 查询语言 | 存储后端 | 适用场景 | 学习优先级 |
|------|------|----------|----------|----------|-----------|
| **Loki + Grafana** | 开源 | LogQL | 对象存储 / 本地 | 配合 Prometheus 生态 | ⭐⭐⭐⭐⭐ |
| **ELK (Elasticsearch + Logstash + Kibana)** | 开源 | Query DSL / SQL | Lucene | 传统企业日志分析 | ⭐⭐⭐⭐ |
| **阿里云 SLS** | 商业（云原生） | SQL / SPL | 阿里云存储 | 阿里云用户 | ⭐⭐⭐⭐ |
| **Datadog** | 商业（SaaS） | 自有语法 | 私有 | 全栈可观测平台 | ⭐⭐⭐ |
| **Splunk** | 商业 | SPL | 私有 | 企业级安全/合规 | ⭐⭐ |

#### 推荐学习顺序

```
基于你已有的 Prometheus + Grafana 基础：

1. Loki + Grafana（最优先）
   └─ 与 Prometheus 同属 Grafana 生态，无缝集成
   └─ LogQL 语法简单，标签索引设计巧妙
   └─ 轻量级，对象存储即可运行
   └─ 已有笔记基础：Prometheus → Thanos → Cortex → Loki 自然衔接

2. ELK Stack（第二优先）
   └─ 企业级日志分析的"老牌"方案
   └─ 全文检索能力最强
   └─ 运维复杂度高，适合理解原理

3. 阿里云 SLS（按需）
   └─ 已有 3 篇详细笔记（20/21/22-阿里云SLS.md）✅
   └─ 如果在阿里云环境工作，直接深入
```

#### 各方案与已有知识的关联

```
你已掌握的                    可以自然过渡到
─────────────                ──────────────
Prometheus (Metrics)    →    Loki (Logs)        ← 同属 Grafana 生态
Thanos (长期存储)       →    Loki (对象存储)     ← 同样的存储理念
Cortex (多租户)         →    Loki (多租户)       ← 同样的架构模式
SLS (商业方案)          →    理解商业日志平台设计 ← 对标 ELK / Datadog
```


---

### Phase 4: 进阶实战（持续）

**目标**：在生产级场景中应用日志系统。

| 主题 | 学习内容 |
|------|----------|
| **K8s 日志架构** | Pod 日志 → DaemonSet 采集 → 中心化存储；EFK / EFK-stack 方案 |
| **日志可观测性三支柱联合分析** | Log + Metric + Trace 关联（如通过 trace_id 串联） |
| **日志成本优化** | 冷热分层、日志采样、保留策略、索引优化 |
| **日志安全与合规** | 敏感信息脱敏、审计日志、等保合规 |
| **AIOps 智能分析** | 异常检测、根因分析、智能告警降噪 |
| **OpenTelemetry Logs** | OTel 日志标准，统一采集 Log/Metric/Trace |


---

### 完整学习路线图

```
Week 1-2: 日志基础
├── 日志格式（JSON 最佳实践）
├── 12-Factor App 日志规范
├── 日志架构模式（采集 → 聚合 → 存储 → 查询）
└── 理解日志 vs 指标 vs 链路追踪的关系

Week 3-4: 采集工具
├── Fluent Bit 入门（Docker 部署，采集 Nginx 日志）
├── Fluentd 进阶（Filter/Buffer/Output 管道）
└── 了解 Vector / Promtail / Alloy

Week 5-7: 日志平台
├── Loki + Grafana（重点）
│   ├── Docker Compose 部署 Loki
│   ├── Promtail / Alloy 采集日志
│   ├── LogQL 查询语法
│   └── 仪表盘 + 告警配置
├── ELK（了解原理）
│   └── Docker Compose 部署，体验全文检索
└── SLS（已有笔记 ✅）

Week 8+: 进阶实战
├── K8s 日志方案（DaemonSet + Sidecar）
├── Log + Metric + Trace 联合分析
├── 日志成本优化（冷热分层、采样）
└── OpenTelemetry Logs 标准化
```


---

## Logging Tools

| Name | Docs | Codes | Comments | Demo | Other |
|------|------|-------|----------|------|-------|
| 👍[Fluentd](https://www.fluentd.org/) | [Docs](https://docs.fluentd.org/quickstart) | [C,Ruby](https://github.com/fluent/fluentd) | CNCF Graduated | [Fluent BIT](https://docs.fluentbit.io/manual/installation/downloads/docker) | [Videos](https://www.fluentd.org/videos), [Slides](https://www.fluentd.org/slides) |
| [Fluent Bit](https://fluentbit.io/) | [Docs](https://docs.fluentbit.io/) | [C](https://github.com/fluent/fluent-bit) | CNCF Graduated, 轻量级采集器 | | |
| [Vector](https://vector.dev/) | [Docs](https://vector.dev/docs/) | [Rust](https://github.com/vectordotdev/vector) | 高性能，替代 Fluentd | | |
| 👍[Loki](https://grafana.com/oss/loki/) | [Docs](https://grafana.com/docs/loki/latest/) | [Go](https://github.com/grafana/loki) | Grafana 生态日志方案 | | |
| [Elasticsearch](https://www.elastic.co/elasticsearch/) | [Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html) | [Java](https://github.com/elastic/elasticsearch) | 全文检索引擎，ELK 核心 | | |
| 👍[OpenTelemetry](https://opentelemetry.io/) | [Docs](https://opentelemetry.io/docs/) | [Go](https://github.com/open-telemetry) | 统一 Log/Metric/Trace 采集标准 | | |
| [日志易](https://www.rizhiyi.com/) | | | 国产商业日志平台，Not Free | | |
| [DATADOG](https://www.datadoghq.com/product/) | [Docs](https://docs.datadoghq.com/) | | 全栈可观测 SaaS，Not Free | | |
| [Splunk](https://www.splunk.com/) | [Docs](https://docs.splunk.com/Documentation/Splunk/) | | 企业级安全/日志分析，Not Free | | |


### Reference

[Observability and Analysis](https://landscape.cncf.io/guide#observability-and-analysis--observability)

[Tencent](https://docs.qq.com/doc/DVHFJTkpGUHJQa1Bw?no_promotion=1)

[splunk](https://www.splunk.com/en_us/about-splunk.html)

[12-Factor App: Logs](https://12factor.net/logs)

[超赞合集](https://asmcn.icopy.site/awesome/awesome-go/)
