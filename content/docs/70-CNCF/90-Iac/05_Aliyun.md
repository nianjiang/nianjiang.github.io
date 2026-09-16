---
weight: 05
title: "Aliyun-IacService"
---

## 阿里云 IaC 相关服务与工具

| 服务 / 工具 | 文档地址 | 服务地址 | GitHub 地址 |
|---|---|---|---|
| 自动化服务台（IaC Service） | [文档](https://help.aliyun.com/zh/terraform/iac-service-overview) | [控制台](https://iac.console.aliyun.com/) | — |
| 资源编排 ROS | [文档](https://help.aliyun.com/zh/ros/product-overview/what-is-ros) | [控制台](https://ros.console.aliyun.com/) | — |
| Terraform Provider for Alicloud | [文档](https://registry.terraform.io/providers/aliyun/alicloud/latest/docs) | — | [GitHub](https://github.com/aliyun/terraform-provider-alicloud) |
| Pulumi Alicloud Provider | [文档](https://www.pulumi.com/registry/packages/alicloud/) | — | [GitHub](https://github.com/pulumi/pulumi-alicloud) |
| IaC Code（AI 助手） | — | — | [GitHub](https://github.com/aliyun/iac-code) |
| ROS Template Transformer | — | — | [GitHub](https://github.com/aliyun/alibabacloud-ros-tool-transformer) |
| Iact3（模板测试工具） | [文档](https://aliyun.github.io/alibabacloud-ros-tool-iact3/) | — | [GitHub](https://github.com/aliyun/alibabacloud-ros-tool-iact3) |
| 阿里云 CLI（aliyun-cli） | [文档](https://help.aliyun.com/zh/cli/) | — | [GitHub](https://github.com/aliyun/aliyun-cli) |
| OpenAPI 开发者门户（IaCService） | [API 文档](https://next.api.alibabacloud.com/product/IaCService) | [门户](https://next.api.alibabacloud.com/product/IaCService) | — |

---

## IaC Service vs ROS

IaC Service（自动化服务台）和 ROS（资源编排服务）均为阿里云提供的基础设施即代码自动化部署服务，二者定位与能力对比如下：

| 对比维度 | IaC Service（自动化服务台） | ROS（资源编排服务） |
|---|---|---|
| 定位 | 专注于 Terraform 的云上托管与治理 | 阿里云原生通用资源编排服务 |
| 模板语言 | HCL（Terraform） | ROS 模板（JSON / YAML）、Terraform HCL |
| 支持云厂商 | 阿里云（通过 alicloud provider） | 阿里云为主；Terraform 类型模板可扩展 AWS / Azure |
| 资源覆盖 | 依赖 Terraform Provider 支持范围 | 原生集成 100+ 阿里云服务、500+ 资源类型 |
| 执行模式✅ | Serverless 托管 Terraform 运行 | Serverless 托管，同时支持 ROS 和 Terraform 类型资源栈 |
| 多环境部署 | 模板版本 + 参数集，一键分发多环境 | 同模板 + 不同参数，支持多账号跨地域部署 |
| 偏差检测 | 支持，定时扫描配置漂移并联动 CMS 告警 | 支持，识别模板之外的资源变更 |
| 存量资源导入 | 支持批量逆向导出，自动生成 HCL 模板与状态文件 | 支持通过资源导入功能将存量资源纳入管理 |
| 合规预检 | Plan 阶段自动合规扫描，违规变更强制拦截 | 通过 RAM + ActionTrail 实现权限与审计控制 |
| 可视化 | 控制台操作 | 控制台 + ROS 架构编辑器（可视化编排） |
| 模板示例 | 提供 Landing Zone 等场景模板 | 提供大量场景模板，支持一键部署 |
| Terraform 托管 | 核心能力，原生集成 | 提供 Terraform 托管能力，兼容 ROS API |
| **计费**✅ | 服务本身免费，按实际创建的云资源计费 | 服务本身免费，按实际创建的云资源计费 |
| 适用场景 | 已采用 Terraform 生态的团队；GitOps 流水线；持续偏差治理 | 阿里云原生用户；需要可视化编排；混合使用 ROS 与 Terraform |

> **选型建议**：若团队已深度使用 Terraform 生态，优先选择 **IaC Service**；若需要同时支持 ROS 原生模板与 Terraform，或需要可视化架构编排，优先选择 **ROS**。

---

## Terraform 模块注册表

自动化服务台控制台提供模块注册表索引，模块代码托管在 GitHub，发布到 Terraform Registry 的 `terraform-alicloud-modules` 命名空间，再由控制台索引展示。三者关系如下：

| 层级 | 地址 | 说明 |
|---|---|---|
| 控制台注册表 | [iac.console.aliyun.com/registry](https://iac.console.aliyun.com/registry/list/terraform-alicloud-modules/mongodb) | 自动化服务台模块索引（需登录） |
| Terraform Registry | [registry.terraform.io/terraform-alicloud-modules](https://registry.terraform.io/modules/terraform-alicloud-modules/mongodb/alicloud/) | 模块发布命名空间 |
| GitHub 代码仓库 | [github.com/alibabacloud-automation](https://github.com/alibabacloud-automation) | 实际代码仓库（~300 个 `terraform-alicloud-*` 仓库） |

---

## Reference






