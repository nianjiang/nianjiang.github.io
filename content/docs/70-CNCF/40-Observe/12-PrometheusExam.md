---
weight: 12
title: "Prometheus Exam"
---


# Prometheus Certified Associate (PCA) Exam Notes
> This is my learning notes for the PCA certification & free practice resources

[CNCF PCA](https://www.cncf.io/training/certification/pca/), [Linux Foundation](https://training.linuxfoundation.org/certification/prometheus-certified-associate/)


## Exam Overview

The **[Prometheus Certified Associate (PCA)](https://github.com/cncf/curriculum/blob/master/PCA_Curriculum.pdf)** is an entry-level certification offered by the CNCF / Linux Foundation. It validates foundational knowledge of observability and skills using Prometheus.

| Item | Detail |
|------|--------|
| 颁发机构 | CNCF / Linux Foundation |
| 费用 | $250 USD（含 1 次免费补考） |
| 题型 | 60 道选择题，在线远程监考 |
| 时长 | 90 分钟 |
| 及格线 | 70% |
| 难度 | 入门级（Entry-level），无需先决证书 |
| 适合人群 | SRE、DevOps Engineer、Developer，Kubernetes/微服务从业者 |

> **没有完全免费的 Prometheus 证书。** PCA 是唯一官方认证，但备考资源大多免费，且 CNCF 经常提供折扣码。


---

## Exam Objectives

| Domain | Weight | Key Topics |
|--------|--------|------------|
| PromQL | 28% | Selecting Data<br/>Rates and Derivatives<br/>Aggregating over time<br/>Aggregating over dimensions<br/>Binary operators<br/>Histograms<br/>Timestamp Metrics |
| Prometheus Fundamentals | 20% | System Architecture<br/>Configuration and Scraping<br/>Understanding Prometheus Limitations<br/>Data Model and Labels<br/>Exposition Format |
| Alerting & Dashboarding | 18% | Dashboarding basics<br/>Configuring Alerting rules<br/>Understand and Use Alertmanager<br/>Alerting basics (when, what, and why) |
| Observability Concepts | 18% | Metrics<br/>Understand logs and events<br/>Tracing and Spans<br/>Push vs Pull<br/>Service Discovery<br/>Basics of SLOs, SLAs, and SLIs |
| Instrumentation and Exporters | 16% | Client Libraries<br/>Instrumentation<br/>Exporters<br/>Structuring and naming metrics |

> 以上为 PCA 最新官方考纲（Curriculum）。PromQL 占比最高（28%），是备考重点；新考纲新增 Observability Concepts（可观测性概念）领域，涵盖 SLO/SLA/SLI 基础。


---

## Killercoda & Interactive Tutorials

Killercoda **没有专门的 Prometheus 官方场景**，以下为相关替代方案：

| 来源 | 场景 | 链接 | 说明 |
|------|------|------|------|
| 社区 (gathecageorge) | Micro Services Monitoring | [Killercoda](https://killercoda.com/gathecageorge/scenario/2-micro-services-monitoring-grafana) | Prometheus + Grafana + Loki + Promtail 全套监控实战 |
| Thanos 官方 | Thanos Quick Tutorial | [Killercoda](https://thanos.io/v0.31/thanos/quick-tutorial.md/) | Thanos 是 Prometheus 的高可用/长期存储方案，涉及 Prometheus 配置 |
| Grafana Labs | Grafana Labs Tutorials | [GitHub](https://github.com/grafana/killercoda) | 以 Grafana 为主，涉及 Prometheus 数据源配置 |
| Killercoda | K8s Playground | [Killercoda](https://killercoda.com/) | 在 K8s 环境中手动部署 kube-prometheus-stack 练习 |

> Prometheus 在 Killercoda 无专属场景，替代方案是用 K8s Playground 自行部署 Prometheus 练习。


---

## Free Hands-on Practice Platforms

| Platform | 方式 | 链接 | 说明 |
|----------|------|------|------|
| Docker Compose Demo | 本地一键启动 | [Docker-Compose-Prometheus-and-Grafana](https://github.com/Einsteinish/Docker-Compose-Prometheus-and-Grafana) | Prometheus + Grafana + node_exporter 全套 |
| Play with K8s | 在线 K8s 环境 | [labs.play-with-k8s.com](https://labs.play-with-k8s.com/) | 免费 K8s 集群，手动安装 Prometheus |
| PromLabs | 官方团队出品 | [training.promlabs.com](https://training.promlabs.com/trainings/) | 部分免费培训模块 |
| Robust Perception | 免费入门课程 | [teachable.com](https://robustperception.teachable.com/courses/enrolled/200947) | Prometheus 核心团队成员主讲 |


---

## Free Preparation Resources

| Resource | Type | Link | 说明 |
|----------|------|------|------|
| CNCF GitLab 备考仓库 | 题库 + 大纲 | [gitlab.com/cncf-exams](https://gitlab.com/cncf-exams/prometheus-certified-associate-pca) | 官方出品，含模拟题与考纲 |
| SecByte 免费练习题 | 模拟题 + 解析 | [learn.secbyte.org](https://learn.secbyte.org/blog/free-prometheus-certification-practice-questions) | 10+ 道免费模拟题 |
| PromLabs | 培训模块 | [training.promlabs.com](https://training.promlabs.com/trainings/) | 部分免费 |
| Prometheus 官方文档 | 文档 | [prometheus.io/docs](https://prometheus.io/docs/introduction/overview/) | 最权威的备考资料 |
| PromQL Cheatsheet | 速查表 | [promlabs.com](https://promlabs.com/promql-cheat-sheet/) | PromQL 语法速查 |
| Robust Perception | 免费课程 | [teachable.com](https://robustperception.teachable.com/courses/enrolled/200947) | 入门课程 |

{{< details "免费模拟题示例" >}}
Q1: Which metric type is best suited for tracking HTTP requests received?<br/>
A. Gauge   B. Counter   C. Histogram   D. Summary<br/>
Answer: B. Counter — 单调递增计数器，适合累计事件计数。
<br/><br/>
Q2: What is the default port for the Prometheus server web UI?<br/>
A. 8080   B. 9090   C. 3000   D. 9100<br/>
Answer: B. 9090 — 9100 是 node_exporter 的默认端口。
<br/><br/>
Q3: Which expression returns the 95th percentile of HTTP request duration over 5m?<br/>
A. quantile(0.95, rate(http_request_duration_seconds[5m]))<br/>
B. histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))<br/>
C. p95(http_request_duration_seconds[5m])<br/>
D. percentile(0.95, http_request_duration_seconds)<br/>
Answer: B — 必须从 Histogram 的 _bucket 指标用 histogram_quantile 计算。
{{< /details >}}


---

## How to Save Money

| 方法 | 说明 | 折扣力度 |
|------|------|----------|
| CNCF 折扣码 | KubeCon / Black Friday / CNCF 活动期间发放 | 最高 60% off（约 $100） |
| CNCF Scholarship | 面向特定群体（学生、欠代表群体）的免费考试机会 | 免费 |
| Linux Foundation 捆绑 | Exam + THRIVE-ONE 年度订阅 | 含无限培训课程访问 |
| 关注渠道 | [CNCF Twitter](https://twitter.com/CloudNativeFdn)、订阅 CNCF Newsletter | 及时获取折扣通知 |


---

## Learning Path

```
Concepts          Hands-on            Mock Exam         Certification
  │                  │                    │                   │
  ▼                  ▼                    ▼                   ▼
Official        Killercoda /         SecByte /          PCA Exam
Docs            Docker Compose       CNCF GitLab        ($250, 90min)
PromLabs        Demo                 Practice Q&A       70% pass
                Play with K8s
```

1. **打基础**：通读 [Prometheus 官方文档](https://prometheus.io/docs/introduction/overview/) + [Robust Perception 免费课程](https://robustperception.teachable.com/courses/enrolled/200947)
2. **动手练**：[Docker Compose Demo](https://github.com/Einsteinish/Docker-Compose-Prometheus-and-Grafana) 本地启动 → [Killercoda](https://killercoda.com/) K8s 环境部署
3. **刷题**：[CNCF GitLab 备考仓库](https://gitlab.com/cncf-exams/prometheus-certified-associate-pca) + [SecByte 免费练习题](https://learn.secbyte.org/blog/free-prometheus-certification-practice-questions)
4. **考证**：关注 CNCF 折扣码，折扣期间报名 PCA 考试


---

## Questions

- PCA 考试是否需要实操环境？—— 不需要，纯选择题（区别于 CKA/CKAD 的实操考试）
- PCA 证书有效期多久？—— CNCF 证书有效期 2 年
- PCA 与 CKA 的关系？—— 独立证书，无依赖关系；PCA 侧重可观测性，CKA 侧重 K8s 运维

<br/>

## Reference

[CNCF PCA](https://www.cncf.io/training/certification/pca/), [Linux Foundation](https://training.linuxfoundation.org/certification/prometheus-certified-associate/)

[How to ace the PCA exam - CNCF Blog](https://www.cncf.io/blog/2024/11/07/how-to-ace-the-prometheus-certified-associate-pca-exam/)

[CNCF GitLab Exam Prep](https://gitlab.com/cncf-exams/prometheus-certified-associate-pca)

[SecByte Free Practice Questions](https://learn.secbyte.org/blog/free-prometheus-certification-practice-questions)

[PromLabs](https://training.promlabs.com/trainings/), [Robust Perception](https://robustperception.teachable.com/courses/enrolled/200947)

[Prometheus Docs](https://prometheus.io/docs/introduction/overview/), [PromQL Cheatsheet](https://promlabs.com/promql-cheat-sheet/)

[How I cleared my PCA exam - Medium](https://medium.com/@kedarnath93/how-i-cleared-my-prometheus-certified-associate-pca-exam-221817aca1e9)

[Prometheus Support & Training](https://prometheus.io/support-training/)

[]()

[]()

[]()
