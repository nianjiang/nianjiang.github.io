---
weight: 11
title: "TACOS"
---

### TACOS (Terraform Automation and Collaboration Software)

> **TACOS** = **T**erraform **A**utomation and **CO**llaboration **S**oftware
> 专为 Terraform / OpenTofu 工作流设计的自动化与协作平台，将 CLI 工具升级为团队级基础设施管理平台。

#### 为什么需要 TACOS？

```
团队规模增长后，纯 CLI + CI/CD 管理 Terraform 的痛点：

  ① 状态管理  → 分布式团队的状态文件存储、锁、版本控制
  ② 协作困难  → 多人修改、Plan 审查、Apply 审批流程复杂
  ③ 治理缺失  → 无法强制执行安全策略、合规检查、成本控制
  ④ 可见性差  → 缺乏"谁在何时对什么资源做了什么"的审计链
  ⑤ 漂移检测  → 云控制台手动变更后无法自动发现
  ⑥ 自助服务  → 开发者无法安全地自助创建/销毁测试环境
```

#### TACOS 核心功能

| 功能 | 说明 |
|------|------|
| **远程状态管理** | 安全存储 State 文件，提供锁机制防止并发修改，维护变更历史 |
| **VCS 集成** | 与 GitHub/GitLab/Bitbucket 集成，PR 驱动 GitOps 工作流 |
| **RBAC** | 细粒度权限控制（谁能在哪个环境执行 plan/apply） |
| **策略即代码** | 集成 OPA / Checkov 等，在 Plan 阶段自动拦截不合规变更 |
| **自动化运行** | VCS 事件或定时触发 terraform plan/apply，减少人工错误 |
| **漂移检测** | 持续对比实际基础设施与代码，发现差异后告警或自动修复 |
| **私有模块注册表** | 集中管理可复用的 Terraform 模块，促进标准化和自助服务 |
| **私有 Provider 注册表** | 托管自定义/内部审批的 Provider，带 GPG 签名和审计 |
| **成本估算** | 集成 Infracost 等工具，在 Plan 阶段预估费用 |
| **审计日志** | 完整记录所有 Terraform 活动，支持追溯和合规 |
| **自定义 Hook** | 在 Plan/Apply 前后注入自定义脚本或集成外部工具 |

#### TACOS 产品全景（2026）

| 产品 | 类型 | 支持 IaC 工具 | 定价模式 | 特点 |
|------|------|--------------|----------|------|
| [Terraform Cloud / Enterprise](https://developer.hashicorp.com/terraform/cloud) | 商业（HashiCorp 官方） | Terraform | 按用量（2026.3 起取消免费层） | 官方产品，HCP 托管 |
| [Scalr](https://scalr.com/) | 商业（Pure-play） | Terraform, OpenTofu | 按 Run 计费（Free: 50 runs/月） | 纯 Terraform/OpenTofu，层级 RBAC 继承，BYOK 加密 |
| [Spacelift](https://spacelift.io/) | 商业（Multi-IaC） | Terraform, OpenTofu, Pulumi, CloudFormation, Ansible, K8s | 按 Worker 计费 | 最可定制，自定义 Runner 镜像，OPA 策略最灵活 |
| [env0](https://www.env0.com/) | 商业（Multi-IaC） | Terraform, OpenTofu, Pulumi, Terragrunt, Helm, K8s | 按环境/Apply 计费（Free: 250 runs/月） | 真实成本关联，环境 TTL 自动销毁 |
| [Terrakube](https://terrakube.org/) | [开源-Github](https://github.com/terrakube-io/terrakube) | Terraform, OpenTofu | 免费（自托管） | 开源 TACOS，私有模块/Provider 注册表，VCS 集成，自定义工作流（OPA/Infracost），RBAC，远程后端 |
| [Terrapod](https://github.com/mattrobinsonsre/terrapod) | [开源-Github](https://github.com/mattrobinsonsre/terrapod) | Terraform, OpenTofu | 免费（自托管） | Terraform Enterprise 的开源替代，提供协作、治理（RBAC + OPA/Rego）、状态管理和 Web UI |
| [Atlantis](https://www.runatlantis.io/) | [开源-Github](https://github.com/runatlantis/atlantis) | Terraform | 免费（自托管） | PR 驱动工作流的先驱，需自行搭建管理平面 |
| [Digger / OpenTaco](https://digger.dev/) | [开源-Github](https://github.com/diggerhq/digger) | Terraform, OpenTofu | 免费 | 复用现有 CI（GitHub Actions），不额外运行计算 |
| [stategraph / Terrateam](https://stategraph.com/) | [开源-Github](https://github.com/stategraph/stategraph) | Terraform, OpenTofu, CDKTF, Terragrunt, Pulumi | 免费 | GitOps 编排，与 GitHub 深度集成 |
| [Terramate](https://terramate.io/) | [开源-Github](https://github.com/terramate-io/terramate) | Terraform, OpenTofu, Terragrunt, K8s | 免费 | 编排 + 代码生成引擎，运行在现有 CI 之上 |
| []() | | | | |



#### Pure-play vs Multi-IaC

```
Pure-play（仅 Terraform/OpenTofu）:
  Scalr
  └─ 优势：单一状态模型，可深度报告资源/模块/Provider/版本/漂移
  └─ 适合：已统一使用 Terraform/OpenTofu 的团队

Multi-IaC（支持多种 IaC 工具）:
  Spacelift / env0
  └─ 优势：统一管控 Terraform + Pulumi + CloudFormation + Ansible
  └─ 适合：多团队使用不同 IaC 工具的组织
  └─ 注意：抽象层越厚，差异越容易泄漏（Leaky Abstractions）
```

#### TACOS vs CI/CD 自建方案

| 维度 | CI/CD 自建（GitHub Actions 等） | TACOS 平台 |
|------|-------------------------------|------------|
| 状态锁 | 需自行实现 | ✅ 内置 |
| 策略执行 | 需手动集成 OPA | ✅ 内置 OPA/Checkov |
| 漂移检测 | 需自建定时任务 | ✅ 内置持续检测 |
| RBAC | 需自行设计 | ✅ 细粒度内置 |
| 私有注册表 | 需额外部署 | ✅ 内置 |
| 成本估算 | 需集成 Infracost | ✅ 内置 |
| 审计链 | 需自行拼接 | ✅ 完整内置 |
| 维护成本 | 高（随规模增长） | 低（平台托管） |
| 灵活性 | 极高 | 中等 |
| 初期成本 | 低 | 中-高 |

#### 是否需要 TACOS？决策树

```
你是个人开发者或 2-3 人团队？
  └─ 是 → CLI + 远程后端 即可，不需要 TACOS

你使用 GitHub Actions 就能满足需求？
  └─ 是 → 继续用 CI/CD，暂不需要

你有多个团队 + 多个环境 + 合规要求？
  └─ 是 → 需要 TACOS

你想要 PR 驱动但不想引入商业平台？
  └─ 是 → Atlantis（开源先驱）

你同时使用 Terraform + Pulumi + CloudFormation？
  └─ 是 → Multi-IaC TACOS（Spacelift / env0）
```

#### 选型检查清单

- [ ] 并发数和 Agent 配额是否满足需求？
- [ ] 状态存储位置？能否使用自己的 Bucket？
- [ ] RBAC 粒度？是否支持自定义角色？
- [ ] 是否支持层级继承（变量/凭证/模块从上层传递到 Workspace）？
- [ ] 能否通过 CLI 设置 TACOS 为远程后端？
- [ ] 是否专注 Terraform/OpenTofu，还是通用 CI/CD？
- [ ] 集成便捷性（Slack/Datadog 等，API Key 即用还是需要复杂插件）？
- [ ] 是否有模块/Provider/版本使用报告？
- [ ] GitOps 工作流中是否将 Plan 详情回写到 PR？
- [ ] 是否支持私有 Provider 注册表（不仅是模块注册表）？
- [ ] 是否支持 BYOK（自带加密密钥）？
- [ ] 计费单位是什么？（Run / Worker / 并发数）—— 按实际 Run 量对比

#### 参考资源

- [What Are Terraform TACOs? - Scalr](https://scalr.com/learning-center/what-is-a-terraform-taco)
- [Spice Up Your IaC with TACOS - Upbound](https://www.upbound.io/blog/infrastructure-as-code-with-tacos)
- [TACOS Demo Day (Video)](https://www.youtube.com/watch?v=4MLBpBqZmpM)
- [I love TACOS So Much - Terramate](https://terramate.io/rethinking-iac/i-love-tacos-so-much-or-at-least-i-thought-i-did/)

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
