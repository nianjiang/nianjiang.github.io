---
weight: 93
title: "Terramate"
---

## Terramate

> **Terramate** 是一个开源的 IaC **编排与代码生成引擎**，用于管理 Terraform / OpenTofu / Terragrunt 的大规模代码库。
> 它不是 TACOS，也不是 Terraform 的替代——它**运行在你现有的 CI/CD 之上**，把巨型 Terraform 仓库拆成可独立部署的 Stack，并提供变更检测、并行执行、DRY 代码生成。

| 属性 | 说明 |
|------|------|
| **定位** | IaC 编排 + 代码生成引擎（运行在现有 CI 之上） |
| **协议** | MPL-2.0（文件级 copyleft，内部使用无披露义务） |
| **语言** | Go（单二进制 CLI） |
| **支持引擎** | Terraform、OpenTofu、Terragrunt（也可编排 Helm、K8s、CloudFormation 等任意命令） |
| **部署形态** | CLI（本地 / CI 中运行）+ 可选 Terramate Cloud（SaaS 观测平面） |
| **仓库** | [github.com/terramate-io/terramate](https://github.com/terramate-io/terramate)（3.6k+ stars） |

---

### 1. 核心架构

```
┌───────────────────────────────────────────────────────────────┐
│                     Git 仓库（= Terramate 项目）                │
│                                                               │
│  ┌───────────────── root.tm.hcl（可选，全局配置/Globals）       │
│  │                                                             │
│  │   stacks/                                                   │
│  │   ├── alice/                                                │
│  │   │   ├── stack.tm.hcl   ← Stack 定义（name/id/tags）        │
│  │   │   ├── main.tf        ← 原生 Terraform 代码               │
│  │   │   └── _terramate_generated_backend.tf  ← 生成的代码       │
│  │   └── bob/                                                  │
│  │       └── ...                                               │
└──┼─────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────┐    变更检测（对比 git commits）    ┌──────────────────┐
│  terramate CLI   │ ───────────────────────────────▶ │      Git         │
│                  │                                    └──────────────────┘
│  · create/list   │    编排执行（依赖感知 + 并行）
│  · generate      │ ───────────────────────────────▶ terraform / tofu
│  · run           │                                    （init/plan/apply）
│  · list --changed│
└────────┬─────────┘
         │ 可选：同步 drift / deployment / insights
         ▼
┌──────────────────┐
│ Terramate Cloud  │  观测平面：Dashboard、漂移检测、告警、
│   （免费个人版）  │  PR 预览、DORA 指标、资产清单
└──────────────────┘
```

**关键设计**：
- **Git 仓库即项目**：Terramate 要求在 git 仓库内运行，变更检测基于 git commit 对比
- **零侵入**：Stack 里就是原生 `.tf` 文件，Terramate 元数据放在独立的 `*.tm.hcl` 文件中
- **无守护进程**：不需要部署服务端，CLI 直接在本地或 CI Job 中执行
- **复用现有 CI**：GitHub Actions / GitLab CI / Bitbucket Pipelines 中跑 `terramate run` 即可，无需额外基础设施

---

### 2. 核心概念

#### Stack（栈）

Stack 是一组作为一个单元配置、部署和管理的 infrastructure 资源，可理解为：

| 组成 | 说明 |
|------|------|
| **基础设施代码** | Terraform / OpenTofu 的 `*.tf` 文件（即一个 root module） |
| **State** | 资源的最新部署状态（如 Terraform state，通常存远程后端） |
| **配置** | 变量、stack 元数据（name、id、tags 等） |

一个 Stack = 一个目录 + 一个包含 `stack {}` 块的 `*.tm.hcl` 文件：

```sh
$ terramate create \
  --name "alice" \
  --description "Alice's first stack" \
  stacks/alice
```

生成的 `stacks/alice/stack.tm.hcl`：

```hcl
stack {
  name        = "alice"
  description = "Alice's first stack"
  id          = "5b33e1c4-a3b0-477d-b0f1-add5918f764d"  # 自动生成，用于后端 key 等
  # tags      = ["terraform", "prod"]                  # 可选，用于筛选
}
```

**为什么拆 Stack？**

```
巨型单体 Terraform 仓库的痛点          Stack 化之后
─────────────────────────            ─────────────────────────
① plan/apply 全量执行，跑一次 1 小时   → 只跑有变更的 Stack（分钟级）
② 任何改动影响全量，爆炸半径大         → 按环境/服务/团队隔离爆炸半径
③ State 锁互相阻塞                    → 独立 State，并行执行
④ 所有权不清                          → Stack 级别指派 owner
```

#### 父子 Stack 与依赖编排

Stack 可以嵌套，形成树状结构：

```
# 平铺（无依赖，可并行）
.
└── dev
    ├── vpc/   ← parent stack
    ├── db/    ← parent stack
    └── k8s/   ← parent stack

# 嵌套（有依赖，图排序执行）
.
└── vpc/          ← 父 Stack
    ├── db/       ← 子 Stack（依赖 vpc）
    └── k8s/      ← 子 Stack（依赖 vpc）
```

- **平铺**：`terramate run` 检测到 Stack 互不依赖，**并行执行**
- **嵌套**：父 Stack 成功执行后才会执行子 Stack（基于图的依赖编排）

#### 变更检测（Change Detection）

基于 **git 对比**（两个 commit 之间的文件变更），判断哪些 Stack 受影响：

```sh
# 列出所有 Stack
$ terramate list
stacks/alice
stacks/bob

# 只列出最近一次 commit 有变更的 Stack
$ terramate list --changed
stacks/bob
```

除了 git，还支持基于 Terraform module 的变更检测（本地 module 更新时也能定位受影响的 Stack）。

#### 代码生成（Code Generation）

在目录层级（如仓库根）定义一次，**自动在所有可达的 Stack 中生成代码**，典型用途是 Terraform backend 和 provider 配置：

```hcl
# stacks/backend.tm.hcl —— 定义在 stacks/ 目录
generate_hcl "backend.tf" {
  content {
    terraform {
      backend "local" {}
    }
  }
}
```

```sh
$ terramate generate
# 在 stacks/alice 和 stacks/bob 各生成一个 backend.tf
```

三种生成策略：

| 策略 | 说明 |
|------|------|
| **`generate_hcl`** | 在 Stack 内生成 HCL 文件（Terraform/OpenTofu 配置），只能用 stack 上下文 |
| **`generate_file`** | 生成任意文件（JSON/YAML 等），支持 `context = root`（仓库级）或 stack |
| **`.tmgen` 文件** | 把现有 `.tf` 重命名为 `.tmgen`，就地增强（可用 Globals/函数），生成回 `.tf` |

**条件生成**（只给特定 Stack 生成）：

```hcl
# 方式一：stack_filter（路径 glob，快）
generate_hcl "vpc.tf" {
  stack_filter {
    project_paths = [
      "/stacks/prod/*",    # 匹配目录下所有 Stack
    ]
  }
  content { /* ... */ }
}

# 方式二：condition（表达式，灵活但慢）
generate_hcl "_terramate_generated_backend.tf" {
  condition = tm_contains(terramate.stack.tags, "terraform")

  content {
    terraform {
      backend "s3" {
        bucket = global.terraform.backend.s3.bucket
        key    = "stacks/by-id/${terramate.stack.id}/terraform.tfstate"
      }
    }
  }
}
```

#### Globals（全局变量）

`globals` 块沿目录层级**向下合并**，Stack 内通过 `global.xxx` 引用，是实现 DRY 的核心机制：

```hcl
# 根目录 root.tm.hcl
globals {
  terraform {
    backend {
      s3 {
        region = "cn-hangzhou"
        bucket = "my-tfstate"
      }
    }
  }
}

# 子目录可覆盖父级定义
globals {
  environment = "dev"
}
```

#### Import（配置复用）

```hcl
import {
  source = "/modules/generate_providers.tm.hcl"
}
```

把公共配置抽成模块，在需要的层级导入。

---

### 3. 安装

```sh
# macOS
brew install terramate

# Ubuntu / Debian
echo "deb [trusted=yes] https://repo.terramate.io/apt/ /" \
  | sudo tee /etc/apt/sources.list.d/terramate.list
apt update && apt install terramate

# Fedora / CentOS（或从 GitHub Releases 下载二进制）
dnf install terramate

# 验证
terramate version
```

---

### 4. 快速上手

从零搭建一个完整可跑的 Terramate + Terraform 项目：

```sh
# 1. 初始化 git 仓库（Terramate 依赖 git 做变更检测）
git init -b main terramate-quickstart
cd terramate-quickstart
git commit --allow-empty -m "Initial empty commit"   # 变更检测至少需要两个 commit

# 2. 创建 Stack
terramate create --name "alice" --description "first stack" stacks/alice
git add . && git commit -m "Create stack alice"

terramate list
# stacks/alice

# 3. 生成 backend 配置到所有 Stack
cat <<'EOF' > stacks/backend.tm.hcl
generate_hcl "backend.tf" {
  content {
    terraform {
      backend "local" {}
    }
  }
}
EOF

terramate generate
# Code generation report
# - /stacks/alice
#   [+] backend.tf

git add . && git commit -m "Add backend to all stacks"

# 4. 忽略 Terraform 临时文件
cat <<'EOF' > .gitignore
.terraform
.terraform.lock.hcl
*.tfstate
*.tfstate.backup
*.tfplan
EOF
git add . && git commit -m "Add .gitignore"

# 5. 编排执行（在所有 Stack 中运行 terraform）
terramate run terraform init
terramate run terraform plan

# 6. 只在「有变更的 Stack」执行
echo 'resource "null_resource" "demo" {}' > stacks/alice/null.tf
git add . && git commit -m "Add null resource"

terramate run --changed terraform plan
terramate run --changed terraform apply -auto-approve
```

---

### 5. 常用命令速查

| 命令 | 说明 |
|------|------|
| `terramate create <path>` | 创建 Stack（生成 `stack.tm.hcl`） |
| `terramate list` | 列出所有 Stack |
| `terramate list --changed` | 列出有变更的 Stack |
| `terramate generate` | 生成代码（默认并行，`-j N` 调整并发） |
| `terramate run <cmd>` | 在 Stack 中编排执行任意命令 |
| `terramate run --changed` | 只在有变更的 Stack 执行 |
| `terramate run --parallel N` | N 个 Stack 并行执行 |
| `terramate run --continue-on-error` | 单个 Stack 失败不中断整体 |
| `terramate cloud login` | 登录 Terramate Cloud（`--github` 用 GitHub 登录） |
| `terramate version` / `terramate fmt` | 版本 / 格式化 `*.tm.hcl` |

**典型 CI 编排模式**：

```sh
# 部署：plan 落盘 → apply 计划文件 → 结果同步到 Cloud
terramate run --changed \
  -- \
  terraform plan -lock-timeout=5m -out deploy.tfplan

terramate run --changed \
  --sync-deployment \
  --terraform-plan-file=deploy.tfplan \
  -- \
  terraform apply -input=false -auto-approve -lock-timeout=5m deploy.tfplan

# 漂移检测：定时跑 plan，结果同步到 Cloud
terramate run \
  --sync-drift-status \
  --terraform-plan-file=drift.tfplan \
  --continue-on-error \
  -- \
  terraform plan -detailed-exitcode -out drift.tfplan
```

---

### 6. Terramate Cloud（可选）

CLI 开源免费；Terramate Cloud 是 SaaS 观测平面，**个人免费**：

| 能力 | 说明 |
|------|------|
| **Deployments** | 跨仓库/团队的部署记录与结果追踪 |
| **Drift Management** | 定时漂移检测、告警（Slack / Teams 通知） |
| **Pull Request 预览** | PR 中展示基础设施变更与风险评估，低风险可自动合并 |
| **Dashboard** | 资产清单、变更、漂移、交付性能的统一视图 |
| **DORA Insights** | 衡量 IaC 交付效能（部署频率、变更前置时间等） |
| **Policy / 告警** | 配置治理与实时事件通知 |

接入配置（仓库根 `terramate.tm.hcl`）：

```hcl
terramate {
  config {
    cloud {
      organization = "your-org-short-name"
      # location = "us"   # 可选，默认 EU
    }
  }
}
```

```sh
terramate cloud login          # 或 terramate cloud login --github
```

---

### 7. 横向对比

| 维度 | Terramate | Terragrunt | Atlantis | TACOS（Terrakube/Terrapod 等） |
|------|-----------|------------|----------|-------------------------------|
| **形态** | CLI（无服务端） | CLI（无服务端） | 服务端（K8s 部署） | 服务端 + Web UI |
| **核心能力** | 编排 + 变更检测 + 代码生成 | DRY（backend/provider 复用）+ 依赖 | PR 驱动 plan/apply | 全套协作治理 |
| **执行位置** | 现有 CI / 本地 | 本地 / CI | 自身服务端 | 自身 Runner |
| **DRY 方式** | 代码生成（生成原生 .tf） | 运行时依赖引用 | 无 | 无（靠模块注册表） |
| **变更检测** | ✅ git 原生 | 部分（依赖触发） | ❌ 按 PR 目录 | ✅ |
| **漂移检测** | ✅（配合 Cloud） | ❌ | ❌ | ✅ 内置 |
| **侵入性** | 低（元数据独立文件） | 中（需写 terragrunt.hcl） | 中（需配置 repo） | 高（整体接管） |

**选型建议**：
- 已有成熟 CI，想加速大型 Terraform 仓库 → **Terramate**
- 主要痛点是 backend/provider 重复配置 → **Terragrunt**（或 Terramate 代码生成）
- 想要 PR 自动 plan/apply 的轻量协作 → **Atlantis**
- 需要完整治理（RBAC、审批、审计、私有注册表）→ **TACOS**

---

### 8. 最佳实践

1. **生成代码提交进仓库**——让 PR 审阅者能看到生成结果，CI 中运行 `terramate generate` 校验
2. **生成文件用前缀区分**——如 `_terramate_generated_backend.tf`，文件头自带 `DO NOT EDIT` 注释
3. **利用 `terramate.stack.id` 做后端 key**——天然保证每个 Stack 的 state 路径唯一
4. **先用 `--changed` 再 `--parallel`**——增量执行是提速的核心，并行是锦上添花
5. **`.gitignore` 排除 `*.tfstate` / `.terraform`**——状态交给远程后端管理
6. **变更检测需要 git 历史**——新仓库先打一个空 commit（`git commit --allow-empty`）

---

### 9. 参考

- [Terramate 官网](https://terramate.io/)
- [Terramate 文档](https://terramate.io/docs/)
- [Quickstart 教程](https://terramate.io/docs/getting-started/)
- [代码生成文档](https://terramate.io/docs/code-generation/)
- [GitHub 仓库](https://github.com/terramate-io/terramate)
