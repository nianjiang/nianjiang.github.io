---
weight: 14
title: "Argo CD"
---

# [Argo CD](https://argoproj.github.io/cd/)

> Declarative, GitOps continuous delivery tool for Kubernetes. CNCF Graduated 项目。

|  Website | Doc           | Github          |  Demo  |     Comment          |
| -------- | --------   | -------    |-------    |-------    |
|  [Argo CD](https://argoproj.github.io/cd/)      | [Doc](https://argo-cd.readthedocs.io/)  | [Github](https://github.com/argoproj/argo-cd)  | [Demo](https://cd.apps.argoproj.io/) | CNCF 毕业项目，GitOps 持续交付工具，提供完整 UI |

---

## Read First

[Docs](https://argo-cd.readthedocs.io/en/stable/), [Github](https://github.com/argoproj/argo-cd), [CNCF](https://www.cncf.io/projects/argo-cd/)

[Understand The Basics](https://argo-cd.readthedocs.io/en/stable/understand_the_basics/)

[Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/)

[Architecture Overview](https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/)

[Argo CD vs Flux](https://fluxcd.io/flux/faq/#flux-v2-vs-argo-cd) — 两大 GitOps 工具对比

[Killercoda Argo CD Labs](https://killercoda.com/argo) — 在线实验环境

---

## 核心概念

### GitOps 原则

- **声明式配置**：应用定义、配置和环境均以 Git 仓库为唯一真实来源（Source of Truth）
- **版本控制**：所有变更通过 Git commit 追踪，具备完整审计能力
- **自动同步**：控制器持续对比 Git 期望状态与集群实际状态，自动或手动同步
- **拉取模式（Pull）**：与 CI 的 Push 模式不同，Argo CD 从 Git 拉取期望状态并应用到集群

### 支持的配置管理工具

| 工具 | 说明 |
| ---- | ---- |
| Kustomize | Kubernetes 原生配置管理，overlay 模式 |
| Helm | Kubernetes 包管理器，Chart 模板渲染 |
| Jsonnet | 数据模板语言，适合复杂配置生成 |
| Plain YAML/JSON | 直接使用 YAML/JSON 清单文件 |
| Config Management Plugin | 自定义配置管理插件（如 kustomize + helm 组合） |

### 核心 CRD

| CRD | 说明 |
| --- | ---- |
| **Application** | 定义应用的 Source（Git 仓库 + 路径 + 目标 revision）和 Destination（目标集群 + namespace） |
| **AppProject** | 多租户隔离单元，限制 Application 可用的 Git 仓库、目标集群、命名空间和 K8s 资源类型 |
| **ApplicationSet** | 自动生成多个 Application 的模板引擎，通过 Generator 批量创建应用（如按集群、Git 目录、矩阵等） |

---

## 架构组件

```
┌──────────────────────────────────────────────────────────┐
│                    Argo CD 控制面                         │
│                                                          │
│  ┌─────────────┐   ┌─────────────────┐   ┌────────────┐ │
│  │  API Server  │   │  Repo Server    │   │ Redis      │ │
│  │ (gRPC/REST) │   │ (Git 缓存+渲染) │   │ (缓存层)   │ │
│  └──────┬───────┘   └────────┬────────┘   └────────────┘ │
│         │                    │                            │
│  ┌──────┴────────────────────┴────────────────────────┐  │
│  │          Application Controller                     │  │
│  │   (持续监控 → 对比 Git 期望状态 vs 集群实际状态)    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────┐  ┌────────────────────────────┐  │
│  │ Dex (SSO/OIDC)    │  │ Notifications Controller   │  │
│  └────────────────────┘  └────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
          │                         │
    ┌─────┴─────┐             ┌─────┴─────┐
    │ Git Repo  │             │ K8s 集群   │
    │ (Source   │             │ (目标环境)  │
    │  of Truth)│             │            │
    └───────────┘             └───────────┘
```

### 三大核心组件

| 组件 | 职责 |
| ---- | ---- |
| **API Server** | gRPC/REST 服务，暴露给 Web UI / CLI / CI 系统。负责应用管理、状态报告、认证与 RBAC、Webhook 监听 |
| **Repository Server** | 维护 Git 仓库本地缓存，根据 repo URL + revision + path + 模板参数生成并返回 K8s 清单 |
| **Application Controller** | K8s Controller，持续对比 Git 期望状态与集群实际状态，检测 `OutOfSync` 并执行同步操作，触发 PreSync/Sync/PostSync 生命周期 Hook |

### 辅助组件

| 组件 | 职责 |
| ---- | ---- |
| **Dex** | SSO 代理，支持 OIDC/OAuth2/LDAP/SAML/GitHub/GitLab 等身份认证 |
| **Redis** | 缓存层，加速清单渲染和状态查询 |
| **Notifications Controller** | 发送同步结果通知到 Slack/Teams/Email 等 |

---

## 快速开始

### 1. 安装

```bash
kubectl create namespace argocd
kubectl apply -n argocd --server-side --force-conflicts \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

> `--server-side --force-conflicts` 是因为部分 CRD（如 ApplicationSet）超过 262KB annotation 限制。

### 2. 安装 CLI

```bash
# macOS
brew install argocd

# 或从 GitHub Releases 下载
# https://github.com/argoproj/argo-cd/releases/latest
```

### 3. 访问 Argo CD

```bash
# 方式一：Port Forwarding（开发环境推荐）
kubectl port-forward svc/argocd-server -n argocd 8080:443
# 访问 https://localhost:8080

# 方式二：LoadBalancer
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# 方式三：Ingress（生产环境推荐）
# 参考 https://argo-cd.readthedocs.io/en/stable/operator-manual/ingress/
```

### 4. 获取初始密码并登录

```bash
# 获取 admin 初始密码
argocd admin initial-password -n argocd

# CLI 登录
argocd login <ARGOCD_SERVER>

# 修改密码
argocd account update-password
```

> **安全提示**：修改密码后应删除 `argocd-initial-admin-secret` Secret。

### 5. 注册外部集群（可选）

```bash
# 列出所有 kubeconfig context
kubectl config get-contexts -o name

# 注册集群
argocd cluster add <context-name>
```

> 部署到 Argo CD 所在集群（in-cluster）时无需注册，使用 `https://kubernetes.default.svc` 即可。

### 6. 创建并部署应用

```bash
# CLI 方式创建 Application
argocd app create guestbook \
  --repo https://github.com/argoproj/argocd-example-apps.git \
  --path guestbook \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default

# 查看应用状态
argocd app get guestbook

# 同步（部署）应用
argocd app sync guestbook
```

---

## Application 详解

### Application YAML 示例

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  project: default                    # AppProject 名称
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    targetRevision: HEAD              # branch / tag / commit SHA
    path: guestbook                   # 仓库中的路径
    # helm:                           # Helm Chart 配置
    #   valueFiles:
    #     - values.yaml
    # kustomize:                      # Kustomize 配置
    #   namePrefix: prod-
  destination:
    server: https://kubernetes.default.svc   # 目标集群
    namespace: default                        # 目标命名空间
  syncPolicy:
    automated:                       # 自动同步策略
      selfHeal: true                 # 自动修复集群中手动变更
      prune: true                    # 自动删除 Git 中已移除的资源
    syncOptions:
      - CreateNamespace=true         # 自动创建目标 namespace
      - ServerSideApply=true         # 使用 Server-Side Apply
```

### 同步状态

| 状态 | 含义 |
| ---- | ---- |
| `Synced` | 集群实际状态与 Git 期望状态一致 |
| `OutOfSync` | 集群实际状态与 Git 期望状态存在差异 |

### 健康状态

| 状态 | 含义 |
| ---- | ---- |
| `Healthy` | 资源正常运行 |
| `Progressing` | 资源正在部署中 |
| `Degraded` | 资源异常 |
| `Suspended` | 资源被暂停 |
| `Missing` | 资源尚未创建 |
| `Unknown` | 无法判断资源状态 |

---

## 同步策略与选项

### 自动同步（Automated Sync）

```yaml
spec:
  syncPolicy:
    automated:
      prune: true       # Git 中删除的资源自动从集群中删除
      selfHeal: true    # 集群中手动变更自动回滚到 Git 状态
```

### 常用 Sync Options

| Option | 说明 |
| ------ | ---- |
| `Prune=false` | 禁止删除 Git 中已移除的资源 |
| `Prune=confirm` | 删除前需要手动确认 |
| `Delete=false` | 应用删除时保留该资源（如 PVC） |
| `CreateNamespace=true` | 自动创建目标 namespace |
| `ServerSideApply=true` | 使用 Server-Side Apply 替代 client-side apply |
| `ApplyOutOfSyncOnly=true` | 仅同步 OutOfSync 的资源（大应用优化） |
| `PruneLast=true` | 在所有资源部署健康后再执行 Prune |
| `Replace=true` | 使用 `kubectl replace` 替代 `kubectl apply` |
| `Force=true` | 删除并重建资源（适用于 Job 等场景） |
| `FailOnSharedResource=true` | 发现被其他 Application 管理的共享资源时报错 |
| `RespectIgnoreDifferences=true` | 同步时也尊重 `ignoreDifferences` 配置 |

### Sync Waves（同步波次）

通过 annotation 控制资源的部署顺序：

```yaml
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "1"   # 数字越小越先部署
```

### Resource Hooks（生命周期钩子）

| Hook 类型 | 执行时机 |
| ---------- | -------- |
| `PreSync` | 同步前执行（如数据库迁移） |
| `Sync` | 同步时执行 |
| `PostSync` | 同步后执行（如健康检查、通知） |
| `SyncFail` | 同步失败时执行 |
| `Skip` | 跳过该资源 |

```yaml
metadata:
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
```

---

## Sync Windows（同步窗口）

限制同步只能在指定时间窗口内执行：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: default
spec:
  syncWindows:
    - kind: allow         # allow 或 deny
      schedule: "0 22 * * *"   # cron 表达式：每天 22:00
      duration: 2h              # 窗口持续 2 小时
      applications:
        - "*"                   # 匹配所有应用
      manualSync: true          # 窗口外允许手动同步
```

---

## ApplicationSet（批量应用管理）

通过 Generator 模板自动生成多个 Application：

### 常用 Generator

| Generator | 说明 |
| --------- | ---- |
| **List** | 静态列表，手动指定参数 |
| **Cluster** | 自动发现已注册的集群 |
| **Git Directory** | 根据 Git 仓库中的目录结构生成应用 |
| **Git File** | 根据 Git 仓库中的 JSON/YAML 文件生成应用 |
| **Matrix** | 组合多个 Generator 的笛卡尔积 |
| **Merge** | 合并多个 Generator 的结果 |
| **SCM Provider** | 自动发现 GitHub/GitLab 组织下的仓库 |
| **Pull Request** | 根据 PR 生成应用（预览环境） |

### ApplicationSet 示例

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: guestbook
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - cluster: staging
            url: https://staging.example.com
          - cluster: production
            url: https://production.example.com
  template:
    metadata:
      name: '{{cluster}}-guestbook'
    spec:
      project: default
      source:
        repoURL: https://github.com/org/guestbook.git
        targetRevision: HEAD
        path: kustomize/{{cluster}}
      destination:
        server: '{{url}}'
        namespace: guestbook
```

---

## 多集群管理

### 注册集群

```bash
argocd cluster add <context-name>
# 会在目标集群的 kube-system 命名空间创建 argocd-manager ServiceAccount
```

### 集群管理模式

| 模式 | 说明 |
| ---- | ---- |
| **Hub-Spoke** | 一个中心 Argo CD 管理多个远程集群 |
| **独立部署** | 每个集群独立部署 Argo CD 实例 |
| **Argo CD 分层** | Management Cluster 管理子集群的 Argo CD 实例（App of Apps 模式） |

### Hub-Spoke 架构注意事项

- 跨集群网络连通性（API Server 可达）
- `argocd-manager-role` 权限可按需缩小到特定 namespace/资源
- 大规模集群建议使用 ApplicationSet 的 Progressive Syncs 分批部署

---

## 安全与多租户

### RBAC

```yaml
# argocd-rbac-cm ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.default: role:readonly
  policy.csv: |
    p, role:devops, applications, sync, default/*, allow
    p, role:devops, applications, get, default/*, allow
    g, devops-team, role:devops
```

### SSO 集成

支持 OIDC、OAuth2、LDAP、SAML 2.0、GitHub、GitLab、Microsoft、LinkedIn。

### AppProject 隔离

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: my-project
  namespace: argocd
spec:
  description: 项目描述
  sourceRepos:            # 允许的 Git 仓库
    - 'https://github.com/my-org/*'
  destinations:           # 允许的目标集群和 namespace
    - server: https://kubernetes.default.svc
      namespace: my-namespace
  clusterResourceWhitelist:  # 允许的集群级资源
    - group: ''
      kind: Namespace
  namespaceResourceBlacklist: # 禁止的资源类型
    - group: ''
      kind: ResourceQuota
  roles:                  # 项目级角色
    - name: admin
      policies:
        - p, proj:my-project:admin, applications, *, my-project/*, allow
```

---

## 常用 CLI 命令

```bash
# 应用管理
argocd app list                           # 列出所有应用
argocd app get <app>                      # 查看应用详情
argocd app sync <app>                     # 同步应用
argocd app rollback <app> <revision>      # 回滚到指定版本
argocd app diff <app>                     # 查看差异
argocd app delete <app>                   # 删除应用
argocd app history <app>                  # 查看同步历史

# 集群管理
argocd cluster list                       # 列出已注册集群
argocd cluster add <context>              # 注册集群
argocd cluster rm <context>               # 移除集群

# 仓库管理
argocd repo add <repo-url>               # 添加 Git 仓库
argocd repo list                          # 列出已注册仓库

# 项目操作
argocd proj list                          # 列出所有 AppProject
argocd proj get <project>                 # 查看项目详情
```

---

## 最佳实践

| 实践 | 说明 |
| ---- | ---- |
| **App of Apps 模式** | 用一个根 Application 管理所有子 Application，实现声明式全局管理 |
| **环境隔离** | 每个环境（dev/staging/prod）使用独立的 AppProject 和 namespace |
| **Git 分支策略** | dev→main 分支部署开发环境，release/* 部署预发布，tag 部署生产 |
| **Sync Window** | 生产环境仅在维护窗口内允许自动同步 |
| **Helm values 分层** | 公共 values.yaml + 环境特定 values-{env}.yaml |
| **Resource Hooks** | 数据库迁移用 PreSync，健康检查用 PostSync |
| **ignoreDifferences** | 忽略由控制器动态管理的字段（如 HPA 的 replicas） |
| **Prune Protection** | 关键资源设置 `Prune=confirm` 防止误删 |
| **Webhook** | 配置 Git Webhook 触发即时同步，减少轮询间隔 |

---

## Argo CD vs Flux

| 维度 | Argo CD | Flux |
| ---- | ------- | ---- |
| UI | 内置 Web UI | 无（CLI only） |
| 多集群 | 原生支持（Hub-Spoke） | 通过 Flux instance per cluster |
| Helm 支持 | 支持 | 原生 Helm Controller（更强） |
| 镜像自动更新 | 需配合 Image Updater | 内置 Image Automation |
| 通知 | 内置 Notifications | 需配合 Notification Controller |
| 渐进式交付 | 需配合 Argo Rollouts | 内置 Flagger |
| Git 提供者 | 广泛支持 | 广泛支持 |
| CNCF 状态 | Graduated | Graduated |

---

## 生态与扩展

| 项目 | 说明 |
| ---- | ---- |
| [Argo Rollouts](https://argoproj.github.io/rollouts/) | 金丝雀/蓝绿部署控制器 |
| [Argo Image Updater](https://argo-image-updater.readthedocs.io/) | 自动更新容器镜像版本 |
| [Argo Events](https://argoproj.github.io/events/) | 事件驱动自动化 |
| [Crossplane](https://crossplane.io/) | 声明式基础设施管理，与 Argo CD 配合实现全栈 GitOps |
| [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) | 加密 Secret 安全存储到 Git |
| [External Secrets Operator](https://external-secrets.io/) | 从 Vault/AWS SM 等外部源同步 Secret |
| [Kustomize](https://kustomize.io/) | 与 Argo CD 深度集成的配置管理工具 |

---

## Question



---

## Reference

[Argo CD Official Documentation](https://argo-cd.readthedocs.io/en/stable/)

[Argo CD GitHub Repository](https://github.com/argoproj/argo-cd)

[Argo CD Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)

[Argo CD Example Apps](https://github.com/argoproj/argocd-example-apps)

[Killercoda Argo CD Interactive Labs](https://killercoda.com/argo)

[Argo Blog](https://blog.argoproj.io/)

[OpenGitOps - GitOps Principles](https://opengitops.dev/)

[CNCF Argo CD Project Page](https://www.cncf.io/projects/argo-cd/)

[Argo CD Demo (Live)](https://cd.apps.argoproj.io/)

[]()

[]()

[]()

[]()

[]()

[]()
