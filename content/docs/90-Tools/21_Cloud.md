---
weight: 21
title: "Cloud"
---




### Aliyun Tools
| Name | Docs | Codes | Other | Comments | Demo |
|------|------|-------|-------|----------|------|
| [ExternalDNS](https://kubernetes-sigs.github.io/external-dns/) | [docs](https://kubernetes-sigs.github.io/external-dns/latest/) | [github](https://github.com/kubernetes-sigs/external-dns) | | 自动将 K8s Ingress/Service 域名同步到阿里云解析 DNS | |
| [Keda (Kubernetes Event-driven Autoscaling)](https://keda.sh/) | [docs](https://keda.sh/docs/) | [github](https://github.com/kedacore/keda) | | 基于事件驱动的 K8s 弹性伸缩器，支持按 RocketMQ 堆积量或 ALB QPS 扩容 | |
| [Kyverno](https://kyverno.io/) | [docs](https://kyverno.io/docs/) | [github](https://github.com/kyverno/kyverno) | | K8s 原生策略管理工具，无需写 Rego 即可实现合规检查与拦截 | |
| [Backstage](https://backstage.io/) | [docs](https://backstage.io/docs/overview/what-is-backstage) | [github](https://github.com/backstage/backstage) | | Spotify 开源的开发者门户（IDP），构建企业内部统一运维/研发门户 | |
| [Crossplane](https://www.crossplane.io/) | [docs](https://docs.crossplane.io/) | [github](https://github.com/crossplane/crossplane) | | 将 K8s 变成控制平面，用 YAML 声明式管理阿里云 RDS/OSS 等云资源 | |
| [1Panel](https://1panel.cn/) | [docs](https://1panel.cn/docs/) | [github](https://github.com/1Panel-dev/1Panel) | | 现代化、开源的 Linux 服务器运维管理面板，适合管理边缘节点/ECS | |
| [JumpServer](https://www.jumpserver.org/) | [docs](https://docs.jumpserver.org/) | [github](https://github.com/jumpserver/jumpserver) | | 开源堡垒机，支持统一审计 ACK 集群、ECS 及数据库访问行为 | |
| [Restic](https://restic.net/) | [docs](https://restic.net/manual/) | [github](https://github.com/restic/restic) | | 安全、快速、高效的备份工具，常用于物理机/容器卷的增量快照备份 | |
| [Velero](https://velero.io/) | [docs](https://velero.io/docs/) | [github](https://github.com/vmware-tanzu/velero) | | K8s 集群灾备与迁移利器，完美对接阿里云 OSS 存储集群快照 | |
| [KubeCost](https://www.kubecost.com/) | [docs](https://docs.kubecost.com/) | [github](https://github.com/opencost/opencost) | | K8s 成本监控与优化工具（开源内核为 OpenCost），分析 ACK 账单 | |
| [CloudExplorer Lite](https://www.fit2cloud.com/cloudexplorer-lite/) | [docs](https://github.com/fit2cloud/cloudexplorer-lite) | [github](https://github.com/fit2cloud/cloudexplorer-lite) | | 轻量级多云管理平台（CMP），适合统一看管阿里云等多家云资源 | |
| []() | [docs]() | [github]() | | | |
| []() | [docs]() | [github]() | | | |
| []() | [docs]() | [github]() | | | |
| []() | [docs]() | [github]() | | | |
| []() | [docs]() | [github]() | | | |
| []() | [docs]() | [github]() | | | |
| []() | [docs]() | [github]() | | | |
| []() | [docs]() | [github]() | | | | 

-----------------

| 运维痛点 | 推荐开源组合 | 落地难度 |
|---------|-------------|---------|
| 应用频繁发布、配置混乱 | Argo CD | 中（需规范 Git 流程） |
| 微服务多了不知道哪步慢，网关报错难排查 | OpenTelemetry + Grafana | 高（需要代码或网关配合） |
| 云账单居高不下，老板要求优化成本 | OpenCost + Keda | 中（需要微服务支持弹性） |




-----------------


### Other
| Name | Docs | Codes | Other | Comments | Demo |
|------|------|-------|-------|----------|------|
| [certimate](https://docs.certimate.me/zh-CN/) | [docs](https://docs.certimate.me/zh-CN/docs/introduction/) | [github](https://github.com/certimate-go/certimate) | | An ACME UI Tool, 适合自动化管理与分发 SSL 证书 |  |
| [Gitea](https://about.gitea.com/) | [docs](https://docs.gitea.com/) | [github](https://github.com/go-gitea/gitea) | | 轻量级自托管 Git 服务，资源占用极低，适合私有化部署 | |
| [Drone](https://www.drone.io/) | [docs](https://docs.drone.io/) | [github](https://github.com/harness/drone) | | 基于容器的现代 CI/CD 工具，与 Gitea/GitHub 结合非常丝滑 | |
| [Argo CD](https://argoproj.github.io/cd/) | [docs](https://argo-cd.readthedocs.io/) | [github](https://github.com/argoproj/argo-cd) | | 声明式 K8s GitOps 持续交付工具，ACK 运维核心推荐 | |
| [Argo Rollouts（灰度发布）](https://argoproj.github.io/argo-rollouts/) | [docs](https://argo-rollouts.readthedocs.io/) | [github](https://github.com/argoproj/argo-rollouts) | | K8s 蓝绿/金丝雀灰度发布控制器，可联动阿里云 ALB/云原生网关 | |
| [Argo Workflows（工作流）](https://argoproj.github.io/workflows/) | [docs](https://argo-workflows.readthedocs.io/) | [github](https://github.com/argoproj/argo-workflows) | | 基于 K8s 的原生工作流引擎，适合编排复杂的运维任务或大模型数据流 | |
| [KubeVela](https://kubevela.io/) | [docs](https://kubevela.io/docs/) | [github](https://github.com/kubevela/kubevela) | CD Tool | 基于 OAM 规范的云原生应用交付与管理平台，阿里开源贡献 | |
| [Prometheus](https://prometheus.io/) | [docs](https://prometheus.io/docs/introduction/overview/) | [github](https://github.com/prometheus/prometheus) | | K8s 指标监控的事实标准，ACK 托管监控的开源内核 | |
| [Grafana](https://grafana.com/) | [docs](https://grafana.com/docs/) | [github](https://github.com/grafana/grafana) | | 强大的多源数据可视化看板，运维必装，用于统一观测监控数据 | |
| [VictoriaMetrics](https://victoriametrics.com/) | [docs](https://docs.victoriametrics.com/) | [github](https://github.com/VictoriaMetrics/VictoriaMetrics) | | 高性能、低成本的开源时序数据库，常作为 Prometheus 的长期存储替代 | |
| [Loki](https://grafana.com/oss/loki/) | [docs](https://grafana.com/docs/loki/latest/) | [github](https://github.com/grafana/loki) | | Grafana 出品的轻量级日志聚合系统，像 Prometheus 一样收集/查询日志 | |
| [Kube-bench](https://aquasecurity.github.io/kube-bench/) | [docs](https://aquasecurity.github.io/kube-bench/v0.8.0/) | [github](https://github.com/aquasecurity/kube-bench) | | 检查 Kubernetes 是否符合 CIS 安全基准的安全扫描工具 | |
| [Trivy](https://aquasecurity.github.io/trivy/) | [docs](https://aquasecurity.github.io/trivy/latest/) | [github](https://github.com/aquasecurity/trivy) | | 全能型云原生安全扫描器，支持扫描容器镜像漏洞及 K8s YAML 配置缺陷 | |
| [Falco](https://falco.org/) | [docs](https://falco.org/docs/) | [github](https://github.com/falcosecurity/falco) | | K8s 运行时安全威胁检测工具，实时监控容器内的异常系统调用行为 | |

-----------------


### []()

| 英文全称 | 常用简称 | 类似/变体名称 | 定位与核心作用 |
| :--- | :--- | :--- | :--- |
| **Development** | **DEV** | Dev / Trunk | **开发环境**。开发人员的沙盒，代码变动最频繁，允许频繁崩溃，通常使用 mock 数据。 |
| **Testing / Quality Assurance** | **TEST / QA** | FAT (Feature Acceptance Test) / CIT / QC | **测试环境**。QA（测试工程师）进行功能测试、自动化测试、回归测试和提测的专用稳定环境。 |
| **Staging** | **STG** | Stage / Pre-Production / Pre / 预发环境 | **预发布环境**。1:1 高度模拟生产环境（包括配置、架构甚至脱敏后的数据），用于上线前的最后把关。 |
| **Production** | **PROD** | Live / Online / 线上的 | **生产环境**。面向真实终端用户的真实环境。对稳定性、安全性和监控要求最高。 |

-----------------


### []()

| 云厂商 | 规格 | 型号 | 按量付费 | 年付 | 备注 |
| :--- | :--- | :--- | :--- |:--- |:--- |
| 阿里 | 104C192G | ecs.ebmc6.26xlarge（计算型弹性裸金属服务器 ebmc6） | 14.232元/小时   |  36893/年 （张家口） | 地域是张家口， 不是北京 |
| 华为 | 20C128G  | physical.s4.medium   | --    |   48600/年  |  没有按量付费 |
| 腾讯 | 96C384G  | BMI5.24XLARGE384（高IO型BMI5，96核384GB）| 16.1元/小时  |  104315/年  |   |


-----------------


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
