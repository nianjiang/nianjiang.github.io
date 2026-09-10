---
weight: 94
title: "Crucible"
---

# Crucible IAP 学习笔记

> Resouces:
>
> - https://www.forgedinfeatherstechnology.com/crucible-iap
> - https://github.com/ponack/crucible-iap

## 一、项目定位：Crucible 是什么

**Crucible IAP（Infrastructure Automation Platform，基础设施自动化平台）** 是一个 **自托管（self-hosted）、隐私优先** 的 IaC 编排平台，定位为 **Spacelift / Terraform Cloud 的开源替代品**。

一句话理解它的工作流：

```
推送代码 → Crucible 自动执行 plan → 人工/策略审批 → apply
```

它解决的核心痛点：

| 云端 IaC 平台的问题 | Crucible 的回答 |
| --- | --- |
| 按资源/按运行/按席位收费，规模越大越贵 | 自托管，成本固定，无 per-run / per-resource 费用 |
| plan 输出、state 文件、密钥经过第三方基础设施 | 0 第三方暴露，数据全部留在自己的环境 |
| SaaS 黑盒，不可控 | 你的基础设施你做主，AGPL-3.0 开源 |

支持的 IaC 工具：**OpenTofu、Terraform、Terragrunt、Ansible、Pulumi**。

---

## 二、核心概念（先记住这 6 个词）

| 概念 | 含义 |
| --- | --- |
| **Stack（栈）** | 管理的基本单元：一个 Git 仓库 + 分支 + 工作目录 + 工具 + 运行行为的组合。类似 Spacelift 的 Stack、TFC 的 Workspace |
| **Run（运行）** | 一次完整的执行实例，状态机：`queued → planning → unconfirmed → applying → finished` |
| **Policy（策略）** | OPA/Rego 编写的守门规则，在 plan/apply 前强制评估，deny 则拦截 |
| **Drift（漂移）** | 实际基础设施与声明的 state 不一致；Crucible 可定时检测甚至自动修复 |
| **Blueprint（蓝图）** | 参数化的自服务模板：平台团队发布表单，应用团队填表即部署，不用碰 IaC |
| **Variable Set（变量集）** | 一组命名的环境变量，加密存储，可复用挂载到多个 Stack |

### Run 的类型

| 触发方式 | 类型 | 行为 |
| --- | --- | --- |
| 推送到跟踪分支 | `tracked` | plan → 等确认 → apply |
| 推送到跟踪分支（auto_apply=true） | `tracked` | 策略通过即自动 apply |
| Pull Request / Merge Request | `proposed` | 仅 plan，结果回帖 PR，不 apply |
| 手动触发（UI/API） | `tracked` / `proposed` / `destroy` | 按配置执行 |
| 漂移检测 | `proposed` | 仅 plan，发现 diff 告警 |

---

## 三、整体架构

```
GitHub / GitLab / Bitbucket / Azure DevOps webhook
    │
    ▼
Reverse proxy (Caddy bundled, or nginx / Traefik / your own)
    │
    ├── /auth, /api, /health  →  Crucible API (Go + Echo)
    │                                │
    │                     ┌──────────┼──────────────┐
    │                     ▼          ▼              ▼
    │               PostgreSQL     MinIO       OPA engine
    │               (DB + queue    (state,     (embedded,
    │                + audit log)   plans,      Rego)
    │                               logs)
    │                     │
    │              River job queue (PostgreSQL)
    │                     │
    │           Crucible Worker (separate container)
    │           (no public ports, has Docker socket)
    │                     │
    │           Docker SDK → ephemeral runner container
    │                        (tofu / terraform / ansible / pulumi)
    │
    │  — or —
    │           crucible-agent (external host, any cloud / on-prem)
    │           polls /api/v1/agent/claim → runs same Docker images
    │           streams logs back → reports outcome
    │
    └── /*  →  Crucible UI (SvelteKit SSR)
```

架构要点（学习时重点理解）：

1. **API 与 Worker 分离**：API 处理请求和审计，Worker 通过 PostgreSQL 上的 **River 任务队列** 领取工作，二者解耦。
2. **每次运行都是一次性容器**：每个 run 在全新的、只读根文件系统、裁剪 Linux capabilities 的 Docker 容器中执行；runner 镜像 **cosign 签名 + digest 锁定**，供应链安全做到位。
3. **外部 Agent 模式**：把 `crucible-agent` 扔到任意有 Docker 的主机上，它轮询 `/api/v1/agent/claim` 领取任务、本地执行、回传日志——实现"算力在哪里，运行就在哪里"。
4. **状态、plan 制品、日志全部存 MinIO**，元数据和队列在 PostgreSQL。

---

## 四、技术栈（"Boring technology, in the best possible way"）

| 组件 | 技术 | 用途 |
| --- | --- | --- |
| 后端 | **Go + Echo** | API 与编排引擎 |
| 前端 | **[SvelteKit（SSR）](https://kit.svelte.dev/)** | 现代响应式 UI |
| 数据库 | **PostgreSQL** | 关系数据 + River 任务队列 + 审计日志 |
| 对象存储 | **[MinIO](https://min.io/)** | state、plan 制品、日志、模块仓库 |
| 策略引擎 | **OPA（内嵌 Rego）** | 策略即代码评估 |
| 监控 | **Prometheus + Grafana** | 内置可观测性（UI 内嵌 8 面板） |
| 反向代理 | **[Caddy](https://caddyserver.com/)** | 自动 TLS（Let's Encrypt / 自签） |
| 部署 | **Docker Compose** | 一条命令自托管 |

---

## 五、核心功能逐项学习

### 5.1 GitOps：push 即 plan

- 每个 Stack 有唯一的 webhook URL + secret（HMAC 验证；Azure DevOps 用 Basic auth）。
- 支持 VCS：GitHub、GitLab、Gitea、Gogs、Bitbucket Cloud、Azure DevOps（含自托管实例），另有原生 GitHub App 集成。
- 每次 push 自动 plan，结果以 **PR/MR 评论 + commit status check** 回馈。
- 进阶：monorepo 路径过滤（`trigger_paths` glob）、`[skip ci]` 提交信息过滤、bot actor 过滤。

### 5.2 策略即代码（OPA/Rego）—— 最有味道的部分

策略挂钩子（hook）位置：

- `pre_plan` / `post_plan`（最常用）/ `pre_apply`
- `trigger`（下游栈触发控制）、`login`（登录控制）、`approval`（审批门控）、`validation`（持续校验）

一个"禁止计划中删除资源"的策略示例：

```rego
package crucible

deny_msgs contains msg if {
  input.resource_changes[_].change.actions[_] == "delete"
  msg := "destroy operations require an explicit destroy run"
}

warn_msgs contains msg if {
  input.resource_changes[_].change.actions[_] == "update"
  msg := sprintf("resource %s will be updated", [input.resource_changes[_].address])
}
```

学习时注意四个关键能力：

1. **GitOps 同步策略**：`.rego` 文件放 git 仓库，push 时自动同步进 Crucible——策略本身也走 PR 审查。
2. **测试沙盒 `/policies/test`**：粘贴合成 plan JSON，实时看 allow/deny/warn 结果 + OPA 评估 trace（Spacelift 和 TFC 都没有的内置能力）。
3. **合规策略包**：SOC 2、CIS AWS、HIPAA、PCI-DSS 一键安装挂载。
4. **持续校验（Continuous Validation）**：定时用 OPA 重新评估 *当前线上 state*，不依赖 run 发生——合规漂移即时告警。

### 5.3 状态与运行器

- 内置 **Terraform HTTP backend**（基于 MinIO，零配置），也可 per-stack 覆盖为 S3 / GCS / Azure Blob。
- 配置方式（写在 Terraform 代码里）：

```hcl
terraform {
  backend "http" {
    address        = "https://crucible.example.com/api/v1/state/<stack-id>"
    lock_address   = "https://crucible.example.com/api/v1/state/<stack-id>"
    unlock_address = "https://crucible.example.com/api/v1/state/<stack-id>"
    username       = "<stack-id>"
    password       = "<stack-token-secret>"
  }
}
```

- State 带完整版本历史，UI 里可做版本间结构化 diff（新增绿、删除红、变更黄）。
- **跨栈 remote state**：`terraform_remote_state` + 按关系铸造的 scoped token。
- 工具版本锁定：per-stack `tool_version`，运行前从官方 release 下载精确版本。

### 5.4 密钥与身份：无静态云凭证

这块是 Crucible 安全设计的精华：

- **OIDC 工作负载身份联邦**：Crucible 自己就是 OIDC Provider。每个 run 铸造一个短时效签名 JWT，直接去 AWS/GCP/Azure/Vault 换临时凭证——**任何地方都不存静态云密钥**。
- 内置 **AES-256-GCM vault**（部署唯一密钥）加密环境变量与变量集。
- 外部秘密存储集成：AWS Secrets Manager、HashiCorp Vault KV v2、Bitwarden SM、Vaultwarden。
- **BYOK**：用你自己的 AWS KMS / Vault Transit / Azure Key Vault 包裹 vault 主密钥，支持在线轮换不重启。
- **plan 制品 HMAC 签名**：apply 阶段密码学验证 plan 未被篡改。

### 5.5 审批与人的环节

- Plan → 人工确认 → Apply 的三段式（可在 UI 或 ChatOps 完成）。
- **ChatOps 审批**：Slack / Teams 通知里带 HMAC 签名动作链接，一键 approve/discard，无需装 Slack App。
- **顺序审批链**：多人按步骤依次批准（step N 满足才通知 step N+1）。
- **审批升级**：run 卡在待审批超过阈值，一次性 ⏰ 告警催办。
- **审批超时自动 discard**：可配置全局超时。

### 5.6 观测、成本与合规

- 通知渠道：Slack、Discord、Teams、Gotify、ntfy、email（SMTP）。
- 内嵌 Grafana 监控页 + 自研 Run Analytics（成功率、时长、吞吐）。
- **Infracost 成本集成**：每个 run 显示月度成本 delta + **per-resource 成本明细**；预算阈值可阻断 auto-apply。
- **IaC 安全扫描**：plan 后跑 Checkov / Trivy，严重级别阈值可拦截 apply。
- **审计日志**：append-only（数据库层防篡改），支持 CSV/JSON 导出，可 **SIEM 流转**（Splunk、Datadog、Elasticsearch、Chronicle、Wazuh、Graylog）。
- **合规证据导出**：一键打包 runs + 审计 + 策略结果的 ZIP（带 HMAC 签名的 manifest）。

### 5.7 让运维省心的杂项能力（速览）

- **栈依赖图（DAG）**：上游 apply 成功自动触发下游，带环检测、按边条件触发、失败重试策略、可视化 DAG 视图。
- **定时运行**：cron 表达式驱动 plan/apply/destroy。
- **环境 TTL / PR 预览环境**：PR 开自动建、PR 关自动毁，防止开发环境蔓延。
- **栈锁（维护模式）**：事故期间禁止新 run 入队。
- **多组织管理**：单实例多租户（MSP 模式），per-org 并发配额。
- **AI 故障解释**：失败的 run 一键 "Explain failure"，日志发给 Claude/OpenAI 兼容端点返回根因分析。
- **CLI**：`crucible` 二进制，`runs trigger / approve / discard / status --watch`，为 CI 和脚本而生。

---

## 六、快速上手

### 部署（约 15 分钟）

```bash
# 1. 准备环境变量
cp .env.example .env
# 编辑 .env：CRUCIBLE_BASE_URL、CRUCIBLE_SECRET_KEY、POSTGRES_PASSWORD 等

# 2. 创建 runner 网络（一次性，供临时任务容器使用）
docker network create crucible-runner

# 3. 启动全家桶（Caddy + API + Worker + UI + PostgreSQL + MinIO + Prometheus + Grafana）
docker compose up -d
```

访问 `https://localhost`（自签证书，首次访问接受警告）。当 `CRUCIBLE_BASE_URL` 是公网域名且设置了 `CADDY_ACME_EMAIL` 时，Caddy 自动签发正式 TLS 证书。

### 部署变体

| 场景 | 命令 |
| --- | --- |
| 外部反代（nginx/Traefik） | `docker compose --profile external-proxy up -d` |
| 附带 Authentik IdP | `docker compose --profile authentik up -d` |
| 外部 Worker 节点 | 远端主机放 `docker-compose.agent.yml` + `.env.agent` 后 `docker compose -f docker-compose.agent.yml up -d` |

### 连接第一个仓库（GitHub 为例）

1. 仓库 → **Settings → Webhooks → Add webhook**
2. Payload URL 填 Stack 详情页的 `webhook_url`
3. Content type 选 `application/json`，Secret 填 `webhook_secret`
4. 勾选 **Pushes** 和 **Pull requests** 事件

之后：push 触发 tracked run（plan → confirm → apply），PR 触发 proposed run（仅 plan + 回帖）。

也可以直接用官方入门模板仓库：`crucible-quickstart`（OpenTofu）、`crucible-quickstart-terragrunt`（Terragrunt）。

### 本地开发

```bash
# 只起依赖（PostgreSQL + MinIO）
docker compose -f deploy/docker-compose.dev.yml up -d

# 起 API（启动时自动跑 migration）
cd api && go run ./cmd/crucible-iap

# 起 UI（dev server 自动代理 /api 和 /auth 到 localhost:8080）
cd ui && pnpm install && pnpm dev
```

要求：Go 1.25+、Node.js 22+、pnpm、Docker。

---

## 七、学习路径建议

按这个顺序读文档，曲线最平滑：

1. `docs/quickstart.md` —— 15 分钟跑通第一个 plan → confirm → apply
2. `docs/iac-101.md` —— IaC 基础概念（plan/apply/state 是什么，为什么要平台而不是裸 Terraform）
3. `docs/architecture.md` —— 组件图、请求流、安全模型、DB schema
4. `docs/policies.md` + `docs/policies/README.md` —— Rego 策略编写与现成模板
5. `docs/operator-guide.md` + `docs/security.md` —— 生产加固、备份、监控、威胁模型
6. 按需深入 guides：`cli.md`、`projects.md`、`stack-dependencies.md`、`drift-detection.md`、`spacelift-migration.md` / `tfc-migration.md`（迁移对照表）

---

## 八、与同类产品的粗略对比（个人理解）

| 维度 | Terraform Cloud | Spacelift | **Crucible IAP** |
| --- | --- | --- | --- |
| 部署模型 | SaaS（企业版可自托管） | SaaS | **完全自托管** |
| 计费 | 按资源/席位 | 按席位 | **免费（AGPL）**，商用许可即将推出 |
| 策略语言 | Sentinel（付费版） | OpenPolicy Agent | **OPA/Rego，含测试沙盒** |
| state 存放 | HashiCorp 托管 | Spacelift 托管 | **自己的 MinIO/S3/GCS/Azure** |
| 工具支持 | Terraform 系 | 多工具 | **OpenTofu/Terraform/Terragrunt/Ansible/Pulumi** |

一句话总结：**Crucible 用"无聊但可靠"的开源组件（Go + PostgreSQL + MinIO + OPA + Docker），把 Spacelift 式的 GitOps + 策略门控 + 漂移检测 + 审计能力装进了你自己的机房。**

---

## 九、参考资料

- 官网产品页：https://www.forgedinfeatherstechnology.com/crucible-iap
- GitHub 仓库：https://github.com/ponack/crucible-iap
- 入门策略库：https://github.com/ponack/crucible-policies
- 快速开始模板：https://github.com/ponack/crucible-quickstart
