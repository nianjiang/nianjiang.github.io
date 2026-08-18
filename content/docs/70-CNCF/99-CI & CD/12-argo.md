---
weight: 12
title: "argo"
---

### List

|  Website | Doc           | Github          |  Demo  |     Comment          |  Next  |
| -------- | --------   | -------    |-------    |-------    |-------    |
|  [argo](https://argoproj.github.io/)      | [Doc](https://argo-cd.readthedocs.io/)  | [Github](https://github.com/argoproj/argo-cd)  | [Demo](https://cd.apps.argoproj.io/) | CNCF 毕业项目，GitOps 持续交付工具 |
|  [Argo Workflows](https://argoproj.github.io/workflows/)      | [Doc](https://argo-workflows.readthedocs.io/)  | [Github](https://github.com/argoproj/argo-workflows)  | [Demo](https://argo-workflows.readthedocs.io/en/latest/quick-start/) | CNCF 毕业项目，K8s 原生工作流引擎，支持 DAG/步骤编排 | [killercoda](https://killercoda.com/argoproj/course/argo-workflows)  |
|  [Argo CD](https://argoproj.github.io/cd/)      | [Doc](https://argo-cd.readthedocs.io/)  | [Github](https://github.com/argoproj/argo-cd)  | [Demo](https://cd.apps.argoproj.io/) | CNCF 毕业项目，GitOps 持续交付工具，提供完整 UI |
|  [Argo Rollouts](https://argoproj.github.io/rollouts/)      | [Doc](https://argo-rollouts.readthedocs.io/)  | [Github](https://github.com/argoproj/argo-rollouts)  | [Demo](https://argo-rollouts.readthedocs.io/en/stable/getting-started/) | CNCF 毕业项目，金丝雀/蓝绿等高级部署策略控制器 |
|  [Argo Events](https://argoproj.github.io/events/)      | [Doc](https://argoproj.github.io/argo-events)  | [Github](https://github.com/argoproj/argo-events)  | [Demo](https://argoproj.github.io/argo-events/quick_start) | CNCF 毕业项目，事件驱动依赖管理，支持多种事件源 |

---

### 认证考试：CAPA（Certified Argo Project Associate）

| 项目 | 说明 |
| ---- | ---- |
| 全称 | Certified Argo Project Associate |
| 颁发机构 | CNCF / Linux Foundation |
| 考试形式 | 在线监考，**纯选择题**（非实操） |
| 时长 | 90 分钟 |
| 费用 | $250（含 1 次免费重考） |
| 有效期 | 2 年 |
| 前置要求 | 无（建议具备 K8s 基础知识） |
| 官方页面 | [CNCF CAPA](https://www.cncf.io/training/certification/capa/) · [Linux Foundation CAPA](https://training.linuxfoundation.org/certification/certified-argo-project-associate-capa/) |

**考试科目与权重：**

| 科目 | 权重 | 核心考点 |
| ---- | ---- | -------- |
| **Argo Workflows** | 36% |- Argo Workflow Fundamentals<br>- Argo Workflow Spec<br>- Generating and Consuming Artifacts<br>- Argo Workflow Templates<br>- DAG（Directed-Acyclic Graphs）<br>- Run Data Processing Jobs |
| **Argo CD** | 34% | - Argo CD Fundamentals<br>- Synchronize Applications Using Argo CD<br>- Argo CD Application<br>- Configure with Helm and Kustomize<br>- Common Reconciliation Patterns |
| **Argo Rollouts** | 18% | - Argo Rollouts Fundamentals<br>- Common Progressive Rollout Strategies<br>- AnalysisTemplate & AnalysisRun |
| **Argo Events** | 12% | - Argo Events Fundamentals<br>- Argo Event Components and Architecture |

**备考资源：**

- [CAPA Exam Study Guide](https://paulyu.dev/article/capa-study-guide/) — 通过者的详细备考指南
- [CNCF Exams GitLab - CAPA](https://gitlab.com/cncf-exams/certified-argo-project-associate-capa) — 官方备考题库
- [Killercoda Argo Labs](https://killercoda.com/argo) — 在线实验环境
- [Udemy CAPA Exam Prep](https://www.udemy.com/course/argo-cd-associate-capa-exam-prep-questions-by-certified/) — 模拟考试练习
- [Awesome Argo](https://github.com/akuity/awesome-argo) — Argo 生态资源汇总

---

### 推荐学习路径与配套练习：

| 序号 | 认证/技术 | 学习内容 | Killercoda 练习 | 其他资源 |
|:----:|----------|---------|-----------------|---------|
| 1 | **CKA** | 集群架构 25%·工作负载调度 15%·Service/网络 20%·存储 10%·故障排查 30% | [KillerShell CKA](https://killercoda.com/killer-shell-cka) | [官方](https://www.cncf.io/training/certification/cka/) |
| 2 | **CKAD** | 应用设计构建 20%·应用部署 20%·可观测性 15%·配置安全 25%·服务网络 20% | [KillerShell CKAD](https://killercoda.com/killer-shell-ckad) | [官方](https://www.cncf.io/training/certification/ckad/) |
| 3 | **CKS** | 集群加固 15%·系统加固 15%·微服务漏洞 20%·供应链安全 20%·监控审计 20%·事件响应 10% | [KillerShell CKS](https://killercoda.com/killer-shell-cks) | [官方](https://www.cncf.io/training/certification/cks/) |
| 4 | **ArgoCD** | GitOps 持续交付·Application/Project·同步策略·多集群管理 | [Killercoda Argo](https://killercoda.com/argo) | [官网](https://argo-cd.readthedocs.io/) |
| 5 | **Prometheus** | PromQL·指标类型·ServiceMonitor·告警规则·联邦集群 | [K8s Playground](https://killercoda.com/playgrounds/scenario/kubernetes) | [官方 Sandbox](https://prometheus.io/docs/tutorials/) |
| 6 | **Istio** | 流量管理·VirtualService/DestinationRule·金丝雀发布·熔断·mTLS | [Killercoda Istio](https://killercoda.com/istio) | [官方教程](https://istio.io/latest/docs/tutorials/) |
| 7 | **Cilium** | eBPF 网络·NetworkPolicy·Service Map·Hubble 可观测性·服务网格 | [Isovalent Labs](https://isovalent.com/labs/) | [官方教程](https://docs.cilium.io/en/latest/tutorials/) |

---


### Reference

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
