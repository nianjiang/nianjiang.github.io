---
weight: 90
title: "Infrastructure as Code"
bookCollapseSection: true
---

-----------------

### Tools

| Name | Docs | Codes | Other | Comments | Demo |
|------|------|-------|-------|----------|------|
| [Terraform](https://developer.hashicorp.com/terraform) | [docs](https://developer.hashicorp.com/terraform/docs) | [code](https://github.com/hashicorp/terraform) | [Providers](https://registry.terraform.io/browse/providers) | | [demo](https://www.terraform.io/intro/getting-started/install.html) |
| [Terraform-Aliyun](https://help.aliyun.com/zh/terraform/) | [quickstarts](https://github.com/alibabacloud-automation/landing-with-terraform/tree/main/quickstarts) | [code](https://github.com/aliyun/terraform-provider-alicloud/tree/master) | [Models](https://registry.terraform.io/browse/modules?provider=alibaba), [Terraform Explorer](https://api.aliyun.com/terraform) | | [alibabacloud-automation](https://github.com/alibabacloud-automation) |
| [OpenTofu](https://opentofu.org/) | [docs](https://opentofu.org/docs/) | [code](https://github.com/opentofu/opentofu) | [OCI Registry Support](https://opentofu.org/docs/internals/oci-registry-support/), [Registry Search](https://search.opentofu.org/) | Terraform 的开源分支 (Linux 基金会项目)，100% 兼容 HCL 语法及 Provider/Module，无厂商锁定。 | [OpenTofu + AWS 快速入门](https://opentofu.org/docs/intro/getting-started/) |
| [Terragrunt](https://terragrunt.gruntwork.io/) | [docs](https://terragrunt.gruntwork.io/docs/) | [code](https://github.com/gruntwork-io/terragrunt) | [Gruntwork Module Library](https://github.com/gruntwork-io/terraform-aws-service-catalog) | Terraform 的轻量级编排工具，保持代码 DRY（复用模块/远程状态/依赖管理），支持 Stack 组合和多环境配置。 | [Getting Started](https://terragrunt.gruntwork.io/docs/getting-started/quick-start/)
| [Ansible](https://www.ansible.com/) | [docs](https://docs.ansible.com/) | [code](https://github.com/ansible/ansible) | [Ansible Galaxy](https://galaxy.ansible.com) (社区角色与集合) | 无代理的自动化工具，擅长配置管理、应用部署和任务编排，采用 YAML Playbook 语法。 | [demo](https://www.ansible.com/get-started) |
| [Pulumi](https://www.pulumi.com/) | [docs](https://www.pulumi.com/docs/) | [code](https://github.com/pulumi/pulumi) | [Pulumi Cloud](https://app.pulumi.com/), [Pulumi Neo (AI Agent)](https://www.pulumi.com/product/neo/) | 支持通用编程语言 (TypeScript/Python/Go/C#/Java) 编写 IaC，原生提供状态管理、自动化 API 及 AI Agent（Neo）。 | [Pulumi Examples](https://github.com/pulumi/examples), [AWS Quickstart Demo](https://www.pulumi.com/aws/) |
| [Crossplane](https://www.crossplane.io/) | [docs](https://docs.crossplane.io/) | [code](https://github.com/crossplane/crossplane) | [Upbound](https://www.upbound.io/) (Crossplane 商业平台), [Provider Marketplace](https://marketplace.upbound.io/providers) | Kubernetes 原生控制平面，将基础设施抽象为 K8s CRD，通过声明式 API 管理和组合云资源。 | [Upbound Getting Started](https://docs.upbound.io/getting-started/), [xfn-demo](https://pkg.go.dev/xfn-demo) |
| [Backstage](https://backstage.io/) | [docs](https://backstage.io/docs/overview/what-is-backstage) | [code](https://github.com/backstage/backstage) | [Plugin Marketplace](https://backstage.io/plugins), [CNCF Graduated](https://www.cncf.io/projects/backstage/) | Spotify 开源的内部开发者平台 (IDP) 框架，提供服务目录、模板、技术文档和插件扩展机制，用于构建统一的开发者门户。 | [Getting Started](https://backstage.io/docs/getting-started/) |


### Terraform vs OpenTofu vs Terragrunt

| 维度 | [Terraform](https://www.terraform.io/) | [OpenTofu](https://opentofu.org/) | [Terragrunt](https://terragrunt.gruntwork.io/) |
|------|---------------------------------------|----------------------------------|------------------------------------------------|
| **定位** | 商业 IaC 引擎（HashiCorp 官方） | Terraform 的开源 fork（Linux 基金会） | Terraform / OpenTofu 的轻量级编排层 |
| **协议** | **BSL 1.1**（2023.8 起，非 OSI 开源） | **MPL-2.0**（标准开源） | **MIT**（标准开源） |
| **语言** | Go | Go | Go |
| **HCL 兼容性** | 原生 HCL | 100% 兼容 Terraform HCL（fork 自 1.5.5） | 扩展 HCL（`terragrunt.hcl`），底层调用 Terraform/OpenTofu |
| **Provider 支持** | 官方 Registry（hashicorp 维护） | 完全兼容 + 额外支持 OCI Registry | 透传底层 Terraform / OpenTofu 的 Provider |
| **State 管理** | 内置远程后端（S3/GCS/Consul/TFC 等） | 同 Terraform + OCI Registry 存储 | 通过底层引擎管理，提供自动 backend 配置 |
| **DRY 机制** | `module` 复用 | `module` 复用 | **核心卖点**：`include` + `merge` 配置继承，自动 backend/provider 生成 |
| **依赖编排** | 无原生 Stack 依赖图 | 无原生 Stack 依赖图 | ✅ 内置 Stack 依赖拓扑，自动按序执行 |
| **多环境管理** | Workspace（官方不推荐用于环境隔离） | Workspace | **目录层级** + 配置继承（推荐方式） |
| **商业支持** | HashiCorp（HCP Terraform 托管） | Linux 基金会（社区驱动） | Gruntwork（付费支持 + 模块库） |
| **GitHub Stars** | ~42k | ~24k | ~8.5k |
| **适用场景** | 企业级 IaC 首选，生态最成熟 | 需要开源替代、避免厂商锁定的团队 | 管理大量 Terraform/OpenTofu 配置，解决 DRY 和依赖编排痛点 |

```
选型决策：

  需要「开箱即用 + 生态最全 + 商业支持」？
  └─ ✅ Terraform（注意 BSL 协议，商业使用需关注限制）

  需要「完全开源 + 避免厂商锁定 + 兼容现有 Terraform 代码」？
  └─ ✅ OpenTofu（Linux 基金会背书，MPL-2.0 无顾虑）

  痛点是「大量 Terraform 配置重复 / 多环境管理混乱 / 依赖编排」？
  └─ ✅ Terragrunt（搭配 Terraform 或 OpenTofu 使用，不替代它们）

  组合使用：Terragrunt (编排) + OpenTofu (引擎) + OCI Registry (存储)
  → 全栈开源、无厂商锁定的 IaC 方案
```

-----------------

### Middleware
| Name | Docs | Codes | Comments | Demo | Other |
|------|------|-------|----------|------|-------|
| [Higress](https://higress.io/) | [docs](https://higress.io/docs/latest/overview/what-is-higress) | [code](https://github.com/higress-group/higress) | AI Native API 网关，基于 Istio + Envoy | [demo](http://demo.higress.io/) | AI 网关、API 网关、HiMarket |
| [Envoy](https://www.envoyproxy.io/) | [docs](https://www.envoyproxy.io/docs) | [code](https://github.com/envoyproxy/envoy) | 高性能边缘/中间/服务代理 | [demo](https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/run-envoy) | Service Mesh 数据面核心组件 |
| [Istio](https://istio.io/) | [docs](https://istio.io/latest/docs/) | [code](https://github.com/istio/istio) | 开源服务网格，流量管理、策略与遥测 | [demo](https://istio.io/latest/docs/setup/getting-started/) | 采用 demo 配置，附带 Bookinfo 示例应用 |


-----------------

### Aliyun
| Name |  Other |
|------|-------|
| [Kubernetes集群容器日志采集须知](https://help.aliyun.com/zh/sls/kubernetes-cluster-container-log-collection-instructions?spm=a2c4g.11174283.help-menu-28958.d_2_2_1_0.165c2842Gbq66p)  |   |
| []()  |   |
| []()  |   |
| []()  |   |
| []()  |   |
| []()  |   |




-----------------

### Platform Engineering 总体架构

┌───────────────────────────────┐
│         Developers            │
└──────────────┬────────────────┘

               │
               ▼
┌───────────────────────────────┐
│ Internal Developer Platform   │
│           (IDP)               │
│                               │
│  Portal / API / CLI / GitOps  │
└──────────────┬────────────────┘

               │
 ┌─────────────┼─────────────────────┐
 ▼             ▼                     ▼

Service     Infrastructure      Application
Catalog       Platform            Platform

Backstage     Terraform           Kubernetes
               OpenTofu           ArgoCD
               Crossplane         Helm

 ┌─────────────┼─────────────────────┐
 ▼             ▼                     ▼

Observability Security         Delivery

Prometheus    Vault            GitHub Actions
Grafana       OPA              Tekton
Loki          Kyverno          Jenkins
Tempo         Falco            Spinnaker

 ┌─────────────┼─────────────────────┐
 ▼             ▼                     ▼

Cloud & Runtime Layer

AWS / 阿里云 / Azure / GCP
Kubernetes / VM / Serverless

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
