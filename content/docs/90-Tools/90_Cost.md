---
weight: 90
title: "Cost"
---


### 开源多云费用管理工具（支持阿里云 & 华为云）

| Name | Docs | Codes | License | 阿里云 | 华为云 | Comments | Next |
|------|------|-------|---------|--------|--------|----------|----------|
| ***[OpenCost](https://opencost.io/)*** | [docs](https://www.opencost.io/docs/) | [github](https://github.com/opencost/opencost) | Apache 2.0 | ❌ | ❌ | CNCF 项目，***K8s*** 成本监控的事实标准，多云费用已支持 AWS/GCP/Azure，中国云厂商待社区扩展 | [Demo](https://demo.infra.opencost.io/) |
| [optscale](https://hystax.com/optscale/finops-overview/)  | [docs](https://hystax.com/optscale/) | [Github](https://github.com/hystax/optscale)  | Apache 2.0 | ✅ | ❌ | Hystax 开源 FinOps 平台，支持 AWS/Azure/GCP/阿里云/K8s，提供成本优化、预算告警、资源治理、K8s 费用分配，平均节省 34% 云成本 | [Demo](https://my.optscale.com/) |
| [CloudExplorer Lite](https://www.fit2cloud.com/cloudexplorer-lite/) | [docs](https://fit2cloud.com/cloudexplorer-lite/index.html) | [github](https://github.com/1Panel-dev/CloudExplorer) | GPLv3 | ✅ | ✅ | 轻量级多云管理平台，原生支持阿里云/腾讯云/华为云，提供云账单管理、运营分析、安全合规等开箱即用功能 |  |
| [Cloudpods](https://www.cloudpods.org/) | [docs](https://www.cloudpods.org/docs/cmp/introduction/) | [github](https://github.com/yunionio/cloudpods) | Apache 2.0 | ✅ | ✅ | 云联壹云开源的多云融合管理平台，资源纳管开源免费，FinOps 费用分析为企业版功能 |  |
| [Cloud Custodian](https://cloudcustodian.io/) | [docs](https://cloudcustodian.io/docs/) | [github](https://github.com/cloud-custodian/cloud-custodian) | Apache 2.0 | ❌（主线） | ✅（[fork](https://github.com/huaweicloud/cloud-custodian)） | CNCF 项目，YAML 策略引擎自动治理云资源（清理闲置/低效），华为云有官方 fork |  |
| [Steampipe](https://steampipe.io/) | [docs](https://steampipe.io/docs) | [github](https://github.com/turbot/steampipe) | AGPL-3.0 | ✅（[插件](https://hub.steampipe.io/plugins/turbot/alicloud)） | 部分 | 用 SQL 即时查询云 API，灵活审计资源和成本，适合技术团队自助分析 | [Demo](https://pipes.turbot.com) |

-----------------


### 选型对比

| 维度 | CloudExplorer Lite | Cloudpods | Cloud Custodian | Steampipe | OpenCost |
|------|-------------------|-----------|----------------|-----------|----------|
| 费用可视化面板 | ✅ | 企业版 | ❌ | ❌（SQL 自助） | ✅ |
| 资源自动治理 | 基础 | ✅ | ✅✅ | ✅ | ❌ |
| 阿里云原生支持 | ✅ | ✅ | ❌ | ✅ | ❌ |
| 华为云原生支持 | ✅ | ✅ | ✅（fork） | 部分 | ❌ |
| K8s 成本监控 | ❌ | 基础 | ❌ | ❌ | ✅✅ |
| 上手难度 | 低 | 中 | 中高 | 高 | 中 |
| 适合场景 | 快速上手，多云账单统一管理 | 全面多云管理 + 私有云 | 自动化资源清理与合规 | 技术团队灵活查询审计 | K8s 容器级成本监控 |




-----------------




### 推荐方案

| 需求场景 | 推荐工具 | 说明 |
|---------|---------|------|
| 快速查看阿里云 + 华为云账单 | **CloudExplorer Lite** | 开箱即用，部署简单，直接对接两家云 API 拉取账单数据 |
| 全面多云资源 + 费用管理 | **Cloudpods 企业版** | 资源管理开源免费，费用分析需企业授权，国内企业用户多 |
| 自动化资源治理（清理闲置/降本） | **Cloud Custodian** | 搭配华为云 fork，用 YAML 定义策略自动执行资源清理和标记 |
| 灵活的 SQL 审计与成本分析 | **Steampipe** | 适合有技术能力的团队，编写 SQL 查询资源清单做成本分析 |
| 推荐组合方案 | **CloudExplorer Lite** + **Cloud Custodian** | 前者负责费用可视化，后者负责自动化治理，形成完整闭环 |




-----------------




### Reference

[CloudExplorer Lite - GitHub](https://github.com/1Panel-dev/CloudExplorer)

[Cloudpods 产品介绍](https://www.cloudpods.org/docs/cmp/introduction/)

[Cloud Custodian 官网](https://cloudcustodian.io/)

[华为云 Cloud Custodian Fork](https://github.com/huaweicloud/cloud-custodian)

[Steampipe 阿里云插件](https://hub.steampipe.io/plugins/turbot/alicloud)

[OpenCost Multi-Cloud Cost Monitoring](https://opencost.io/blog/cloud-costs/)

[华为云 CloudExplorer Lite 部署方案](https://www.huaweicloud.com/solution/implementations/building-a-lightweight-multi-cloud-management-platform.html)

[FinOps Foundation - Multi-Cloud Tools](https://www.finops.org/wg/multi-cloud-tools-and-terminology/)
