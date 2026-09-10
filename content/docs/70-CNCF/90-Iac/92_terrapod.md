---
weight: 92
title: "Terrapod"
---

## Terrapod

> **Terrapod** 是一个免费、开源、自托管的 **TACOS**（Terraform Automation and Collaboration Software）平台，定位为 Terraform Enterprise / Terraform Cloud 的开源替代品。
> 它不是 Terraform 或 OpenTofu 的 fork，而是它们的**编排层**——将 CLI 工具升级为团队级基础设施管理平台。

| 属性 | 说明 |
|------|------|
| **定位** | Terraform Enterprise / HCP Terraform 的开源替代 |
| **协议** | MPL-2.0（与 OpenTofu 相同，文件级 copyleft，内部使用无披露义务） |
| **技术栈** | FastAPI (Python) + Next.js (前端) + PostgreSQL + Redis + Go (工具链) |
| **部署方式** | Helm Chart on Kubernetes（单节点 k3s 即可启动） |
| **支持引擎** | Terraform、OpenTofu（推荐）、Terragrunt |
| **仓库** | [github.com/mattrobinsonsre/terrapod](https://github.com/mattrobinsonsre/terrapod) |


---

### 核心架构

```
┌─────────────────────────────────────────────────────────┐
│                  Browser / CLI                          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Terrapod 控制平面                            │
│                                                          │
│  ┌──────────────┐     ┌──────────────────────────────┐  │
│  │  Next.js BFF │────▶│  FastAPI API                  │  │
│  │  (Web UI +   │     │  (多副本，无 leader election)  │  │
│  │   反向代理)   │     │                              │  │
│  └──────────────┘     └──────────────────────────────┘  │
│                            │    │    │                   │
└────────────────────────────┼────┼────┼───────────────────┘
                             │    │    │
              ┌──────────────┘    │    └──────────────┐
              ▼                   ▼                    ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
     │  PostgreSQL   │  │    Redis     │  │  Object Storage  │
     │  (状态+元数据) │  │ (会话/锁/事件)│  │ (状态/计划/日志)  │
     └──────────────┘  └──────────────┘  └──────────────────┘
              ▲
              │ 数据不离开你的边界
              │
┌─────────────┴───────────────────────────────────────────┐
│              执行集群（可在任意网络）                       │
│                                                          │
│  ┌────────────────┐     ┌────────────────────────────┐  │
│  │ Runner Listener │────▶│  临时 K8s Job              │  │
│  │ (出站 SSE 连接)  │     │  (terraform / tofu 执行)   │  │
│  └────────────────┘     └────────────────────────────┘  │
│                                                          │
│  执行集群 → 控制平面（出站），控制平面 ✗ → 执行集群         │
└──────────────────────────────────────────────────────────┘
```

**关键设计**：
- **BFF 模式**：Next.js 前端是唯一入口，浏览器不直接访问 API
- **ARC 模式执行**：Runner 按需创建 Job（类似 GitHub Actions Runner Controller）
- **出站优先**：Runner 通过出站 SSE 连接控制平面，无需入站网络——适合隔离 VPC、跨区域、本地数据中心
- **单组织设计**：每个实例一个组织（`default`），需要多租户则部署多个实例


---

### 核心功能

#### 平台基础

| 功能 | 说明 |
|------|------|
| **Workspace** | 隔离状态、变量和运行 |
| **远程状态** | 版本化状态，支持锁和回滚，静态加密，可选 BYOK 信封加密 |
| **CLI 驱动运行** | `terraform` / `tofu` plan/apply 通过 `cloud` 后端 |
| **Agent 执行** | 服务端 plan/apply，运行在临时 K8s Job 上 |
| **Agent Pool** | 命名的 Runner 监听组，join-token → 证书交换认证 |
| **Run Triggers** | 跨 Workspace 依赖链——源 apply 触发下游运行 |
| **条件自动 Apply** | 仅在安全范围内（仅新增/原地更新）自动 apply，销毁或替换资源则需人工审批 |
| **Workspace 恢复** | 删除后保留状态，管理员可在保留窗口内恢复到新 Workspace |
| **过期计划守卫** | 状态漂移 + 可选时间过期自动丢弃过期 plan |

#### 治理与安全

| 功能 | 说明 |
|------|------|
| **标签 RBAC** | `resource:verb` 细粒度能力（如 `run:plan` 无 `run:apply`） |
| **策略即代码 (OPA)** | Rego 策略在 plan JSON 上执行，支持建议/强制模式，按标签范围绑定 Workspace |
| **安全扫描** | Checkov/Trivy 扫描 plan JSON，可按 Workspace 配置 off/advisory/enforced |
| **SSO** | OIDC / SAML（Auth0、Okta、Azure AD 等） |
| **审计日志** | 不可篡改的事件日志，可配置保留期 |
| **零静态凭证** | 通过 K8s 工作负载身份（AWS IRSA / GCP WIF / Azure WI）动态获取云凭证 |
| **供应链验证** | 缓存的二进制/Provider 通过 GPG 签名 SHA256SUMS 验证；Runner 执行前再次验证 |

#### 注册表与缓存

| 功能 | 说明 |
|------|------|
| **私有模块注册表** | 发布、版本管理、内部分享模块 |
| **私有 Provider 注册表** | 发布、版本管理、GPG 签名、网络镜像缓存 |
| **二进制缓存** | terraform / tofu / terragrunt CLI 二进制文件的拉穿缓存 |
| **缓存预热** | 管理员端点 + UI 面板批量预热缓存（适合受限网络） |
| **密封模式** | 空气隔离开关，确保不从上游获取任何内容 |
| **OCI 容器注册表** | 内置 OCI 注册表，Runner 镜像与状态/模块/Provider 同一边界 |
| **包代理** | PyPI / npm 代理，Runner 无需访问公网即可解析依赖 |

#### AI（可选，默认关闭）

| 功能 | 说明 |
|------|------|
| **AI Plan 审查** | LLM 变更摘要 + 风险评估 + 失败分析 + 对话式查询（通过 LiteLLM 支持多 Provider） |
| **AI 架构评审** | 基于最新状态对 Workspace 部署架构进行可靠性/安全/成本/运维/可扩展性评审 |
| **MCP Server** | 通过 Model Context Protocol 驱动 Terrapod（Claude、Cursor 等 AI 助手） |


---

### 快速体验

```sh
# 一键启动（创建本地 kind/k3d 集群 + 安装 Terrapod）
make eval
# → 打开 http://localhost:8080  (登录: admin / terrapod)

# 清理
make eval-down
```

**前提**：Docker、kubectl、helm、kind 或 k3d


---

### 生产部署

#### 前提

- Kubernetes 集群（1.27+），单节点 k3s 即可
- Helm 3.x
- **外部** PostgreSQL 14+ 和 Redis 7+（生产环境不建议用内置的）

#### Helm 部署

```sh
helm install terrapod oci://ghcr.io/mattrobinsonsre/terrapod \
  --namespace terrapod --create-namespace \
  --set ingress.enabled=true \
  --set ingress.hostname="terrapod.example.com" \
  --set ingress.className=traefik \
  --set postgresql.url="postgresql+asyncpg://terrapod:PASSWORD@PGHOST:5432/terrapod" \
  --set redis.url="redis://REDISHOST:6379" \
  --set bootstrap.adminEmail="admin@example.com" \
  --set bootstrap.adminPassword="change-me-now"
```

#### 配置 OpenTofu / Terraform

```hcl
# main.tf — 只需将 cloud block 指向 Terrapod
terraform {
  cloud {
    hostname     = "terrapod.example.com"
    organization = "default"

    workspaces {
      name = "my-first-workspace"
    }
  }
}
```

```sh
# 登录并执行
tofu login terrapod.example.com
tofu init
tofu plan
tofu apply
```

> 💡 **零代码迁移**：现有 `cloud` block 只需改 `hostname` 指向 Terrapod，CLI 和 CI/CD 通常无需其他改动。


---

### 与 Terraform Enterprise / HCP Terraform 对比

| 维度 | HCP Terraform / TFE | Terrapod |
|------|---------------------|----------|
| **托管** | 厂商 SaaS 或自管理分发 | 自托管在自有 K8s |
| **许可** | 专有（BUSL），按管理资源计费 | 免费开源（MPL-2.0） |
| **状态/密钥位置** | 在厂商/自管理控制平面 | 不离开你的边界（你的 Postgres + 对象存储） |
| **云凭证** | 厂商存储或动态 | K8s 工作负载身份（IRSA/WIF/WI），无长期凭证 |
| **策略引擎** | Sentinel（专有） | OPA / Rego（开源） |
| **受限网络/空气隔离** | 依赖 SaaS | 原生支持——出站 Runner、轮询 VCS、拉穿镜像 + 密封缓存模式 |
| **多组织** | 支持 | 单组织设计（每租户一个实例） |
| **CLI 后端 API** | 完整 TFE V2 | TFE V2 的 CLI 消费子集 |

### 与同类开源方案对比

| 项目 | 定位 | 与 Terrapod 的关系 |
|------|------|-------------------|
| [Terrakube](https://terrakube.io/) | 开源 TFC/TFE 替代（Java/Spring Boot + Angular） | 最接近的同类——功能范围相当，社区更成熟（Apache-2.0），支持多组织 |
| [Atlantis](https://www.runatlantis.io/) | PR 驱动 plan/apply 自动化 | 专注 PR 工作流，需自行搭建状态/RBAC/策略等管理平面 |
| [Digger](https://digger.dev/) | CI 原生 Terraform 编排 | 在现有 CI 内运行，刻意不维护独立执行引擎 |
| [Terrateam](https://terrateam.io/) | GitHub 集成 TF 自动化 | GitHub 专注，开源核心 + 付费层 |
| [Spacelift](https://spacelift.io/) | 商业 TF 管理平台 | 厂商支持，Multi-IaC |


### Terrapod vs Terrakube（两个最接近的开源方案）

| 维度 | Terrapod | Terrakube |
|------|----------|-----------|
| **语言** | Python + Next.js | Java + Angular |
| **许可** | MPL-2.0 | Apache-2.0 |
| **组织模型** | 单组织（每租户一实例） | 多组织 + 团队 |
| **网络隔离** | 出站 Runner + 轮询 VCS + 密封缓存 | 控制平面协调执行器 |
| **VCS 集成** | Webhook + 出站轮询（默认） | Webhook 投递 |
| **Provider 缓存** | 拉穿镜像 + 二进制缓存 | 本地插件缓存 |
| **Monorepo** | Atlantis 风格自动发现 | 目录过滤 |
| **AI** | 内置 Plan 摘要/评审/对话 | 通过外部 MCP 服务器集成 |
| **Terragrunt** | 原生支持（per-workspace 开关） | 支持 |
| **成熟度** | 较新，小核心团队 | 更长记录，更大社区 |


---

### 高可用与生产特性

| 特性 | 说明 |
|------|------|
| **三平面 HA** | 控制平面（多副本无 leader election）、执行平面（Agent Pool 集合自动容灾）、数据平面（warm/follower 对，人工 DNS 切换） |
| **跨区域/跨云** | 每个节点拥有独立数据库和对象存储，支持 S3↔Azure Blob↔GCS↔本地 |
| **水平扩展** | 无状态 API 副本 + `SELECT ... FOR UPDATE SKIP LOCKED` 调度 |
| **供应链安全** | cosign 无密钥签名 + SBOM (SPDX) + SLSA 构建来源 |
| **安全加固** | 所有 Pod 非 root、只读根文件系统、丢弃所有 capabilities、seccomp profile |
| **备份与 DR** | 可选 `pg_dump` 备份 CronJob + DR 演练 + 对象存储直接恢复 |
| **可逆升级** | 每个 schema 迁移都有 `upgrade()`/`downgrade()`，版本升级可审计可回滚 |
| **迁移工具** | `terrapod-migrate`：从 TFE / HCP / Atlantis 迁移，dry-run-first，可回滚 |


---

### Terraform Provider

Terrapod 提供自己的 Terraform Provider——**用 Terraform 管理 Terrapod 本身**：

```hcl
# 25 个资源 + 9 个数据源
resource "terrapod_workspace" "example" {
  name = "my-workspace"
}

resource "terrapod_variable" "aws_region" {
  workspace_id = terrapod_workspace.example.id
  key          = "AWS_REGION"
  value        = "cn-hangzhou"
  sensitive    = false
}

resource "terrapod_role" "viewer" {
  name = "viewer"
  capabilities = ["workspace:read", "run:plan"]
}
```

支持的资源：`terrapod_workspace`、`terrapod_variable`、`terrapod_role`、`terrapod_vcs_connection`、`terrapod_agent_pool`、`terrapod_run_task`、`terrapod_catalog_item`、`terrapod_execution_hook` 等。


---

### 学习路线

```
1. 快速体验（30 分钟）
   └─ make eval → 浏览 UI → 查看示例 Workspace 和 Run

2. 部署到测试集群（1 小时）
   └─ k3s/kind + Helm 部署 → 创建 Workspace → 配置 cloud block → plan/apply

3. 深入功能（1-2 天）
   └─ RBAC 配置 → OPA 策略 → 安全扫描 → 漂移检测 → 通知集成

4. 生产就绪（1 周）
   └─ 外部 Postgres/Redis → SSO → 对象存储 → HA 部署 → 迁移工具

5. 高级特性
   └─ 空气隔离部署 → AI 审查层 → 自定义执行钩子 → Provider 开发
```


---

### Reference

- [GitHub 仓库](https://github.com/mattrobinsonsre/terrapod)
- [架构文档](https://github.com/mattrobinsonsre/terrapod/blob/main/docs/architecture.md)
- [部署指南](https://github.com/mattrobinsonsre/terrapod/blob/main/docs/deployment.md)
- [迁移指南](https://github.com/mattrobinsonsre/terrapod/blob/main/docs/migration.md)
- [RBAC 文档](https://github.com/mattrobinsonsre/terrapod/blob/main/docs/rbac.md)
- [API 参考](https://github.com/mattrobinsonsre/terrapod/blob/main/docs/api-reference.md)
- [生产检查清单](https://github.com/mattrobinsonsre/terrapod/blob/main/docs/production-checklist.md)
- [TACOS 概念](91_IacPaltform.md)
