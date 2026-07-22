---
weight: 90
title: "Infrastructure as Code"
---

### [Redis](https://redis.io/)




-----------------

### Tools

| Name | Docs | Codes | Other | Comments | Demo |
|------|------|-------|-------|----------|------|
| [Terraform](https://developer.hashicorp.com/terraform) | [docs](https://developer.hashicorp.com/terraform/docs) | [code](https://github.com/hashicorp/terraform) | [Providers](https://registry.terraform.io/browse/providers) | | [demo](https://www.terraform.io/intro/getting-started/install.html) |
| [Terraform-Aliyun](https://help.aliyun.com/zh/terraform/) | [quickstarts](https://github.com/alibabacloud-automation/landing-with-terraform/tree/main/quickstarts) | [code](https://github.com/aliyun/terraform-provider-alicloud/tree/master) | [Models](https://registry.terraform.io/browse/modules?provider=alibaba), [Terraform Explorer](https://api.aliyun.com/terraform) | | [alibabacloud-automation](https://github.com/alibabacloud-automation) |
| [Ansible](https://www.ansible.com/) | [docs](https://docs.ansible.com/) | [code](https://github.com/ansible/ansible) | [Ansible Galaxy](https://galaxy.ansible.com) (社区角色与集合) | 无代理的自动化工具，擅长配置管理、应用部署和任务编排，采用 YAML Playbook 语法。 | [demo](https://www.ansible.com/get-started) |
| [OpenTofu](https://opentofu.org/) | [docs](https://opentofu.org/docs/) | [code](https://github.com/opentofu/opentofu) | [OCI Registry Support](https://opentofu.org/docs/internals/oci-registry-support/), [Registry Search](https://search.opentofu.org/) | Terraform 的开源分支 (Linux 基金会项目)，100% 兼容 HCL 语法及 Provider/Module，无厂商锁定。 | [OpenTofu + AWS 快速入门](https://opentofu.org/docs/intro/getting-started/) |
| [Pulumi](https://www.pulumi.com/) | [docs](https://www.pulumi.com/docs/) | [code](https://github.com/pulumi/pulumi) | [Pulumi Cloud](https://app.pulumi.com/), [Pulumi Neo (AI Agent)](https://www.pulumi.com/product/pulumi-ai/)[reference:1] | 支持通用编程语言 (TypeScript/Python/Go/C#/Java) 编写 IaC，原生提供状态管理、自动化 API 及 AI Agent（Neo）。 | [Pulumi Examples](https://github.com/pulumi/examples), [AWS Quickstart Demo](https://www.pulumi.com/aws/) |
| [Crossplane](https://www.crossplane.io/) | [docs](https://docs.crossplane.io/) | [code](https://github.com/crossplane/crossplane) | [Upbound](https://www.upbound.io/) (Crossplane 商业平台), [Provider Marketplace](https://marketplace.upbound.io/providers) | Kubernetes 原生控制平面，将基础设施抽象为 K8s CRD，通过声明式 API 管理和组合云资源。 | [Upbound Getting Started](https://docs.upbound.io/getting-started/), [xfn-demo](https://pkg.go.dev/xfn-demo) |
| [Backstage](https://backstage.io/) | | | | | |
| []()     | | | | | |


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
