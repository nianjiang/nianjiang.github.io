---
weight: 99
title: "Kustomize & Helm"
---

# Kubernetes 配置管理工具：Kustomize & Helm

> Kubernetes 配置管理的两大主流方案：**模板渲染**（Helm）vs **补丁叠加**（Kustomize）。

|  | Website | Doc | Github | Comment |
|---|---------|-----|--------|---------|
| **Kustomize** | [kustomize.io](https://kustomize.io/) | [Doc](https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/) | [Github](https://github.com/kubernetes-sigs/kustomize) | Kubernetes 原生，无模板，基于补丁的配置定制工具。已内置于 kubectl |
| **Helm** | [helm.sh](https://helm.sh/) | [Doc](https://helm.sh/docs/) | [Github](https://github.com/helm/helm) | CNCF 毕业项目，Kubernetes 包管理器，基于模板渲染 |

---

## Read First

[Kustomize Docs](https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/) · [Helm Docs](https://helm.sh/docs/)

[Helm vs Kustomize 2026](https://sanj.dev/post/kustomize-vs-helm-2026/) — 两者对比深度文章

[Helm vs Kustomize - Spacelift](https://spacelift.io/blog/kustomize-vs-helm) — 工程实践对比

[Artifact Hub](https://artifacthub.io/) — Helm Chart 搜索与发现平台

---

## Kustomize vs Helm 对比总览

| 维度 | Kustomize | Helm |
| ---- | --------- | ---- |
| **理念** | 补丁叠加（Overlay/Patch），不修改原始 YAML | 模板渲染（Template），通过 values 注入变量生成 YAML |
| **模板引擎** | 无（纯 YAML 操作） | Go template + Sprig 函数库 |
| **学习曲线** | 低（只需理解 YAML 补丁） | 中（需学习模板语法、values 结构、Chart 规范） |
| **包管理** | 无（需自行管理目录结构） | 内置 Chart 打包、版本化、仓库管理 |
| **内置于 kubectl** | 是（`kubectl apply -k`） | 否（需单独安装 helm CLI） |
| **环境差异化** | base + overlays 目录结构 | 多套 values.yaml（values-dev/staging/prod） |
| **可复用性** | 通过 components/bases 复用 | 通过 Chart 依赖和 Library Chart 复用 |
| **Hook 支持** | 无原生支持 | 内置 pre-install/post-install/pre-upgrade 等 Hook |
| **适用场景** | 自研应用、内部配置管理、GitOps | 开源软件分发、复杂应用打包、第三方应用部署 |
| **与 Argo CD 集成** | 原生支持 | 原生支持（Argo CD 内置 helm template 渲染） |
| **典型用户** | 平台工程师、SRE | 开源社区、应用开发者、运维团队 |

---

## Kustomize

### 核心概念

- **无模板、无 DSL**：直接操作原生 YAML，不引入新的模板语法
- **Base + Overlay 模式**：基础配置 + 环境特定补丁，原始文件不被修改
- **内置于 kubectl**：`kubectl apply -k <dir>` 直接使用，无需额外安装
- **声明式补丁**：支持 Strategic Merge Patch、JSON Patch、Inline Patch 等多种方式

### 目录结构

```
myapp/
├── base/                          # 基础配置（通用）
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
└── overlays/                      # 环境特定覆盖
    ├── dev/
    │   ├── kustomization.yaml
    │   └── replica_patch.yaml
    ├── staging/
    │   ├── kustomization.yaml
    │   └── resource_patch.yaml
    └── prod/
        ├── kustomization.yaml
        └── resource_patch.yaml
```

### kustomization.yaml 核心字段

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# 1. 资源引用
resources:
  - ../base                        # 引用 base 目录或远程 Git URL

# 2. 组件引用（可复用模块）
components:
  - ../components/monitoring

# 3. 名称前缀/后缀
namePrefix: prod-
nameSuffix: -v2

# 4. 公共标签和注解
labels:
  - pairs:
      env: production
      team: platform
    includeSelectors: true

commonAnnotations:
  managed-by: kustomize

# 5. 命名空间
namespace: production

# 6. 补丁（环境差异化）
patches:
  - path: replica_patch.yaml       # 文件补丁
  - target:                        # 目标选择器 + inline patch
      kind: Deployment
      name: myapp
    patch: |-
      - op: replace
        path: /spec/replicas
        value: 5

# 7. 自动生成 ConfigMap/Secret（内容变更自动触发哈希更新）
configMapGenerator:
  - name: myapp-config
    files:
      - app.properties
    literals:
      - LOG_LEVEL=info

secretGenerator:
  - name: myapp-secret
    literals:
      - DB_PASSWORD=supersecret
    envs:
      - .env

# 8. 镜像替换
images:
  - name: myapp
    newName: registry.example.com/myapp
    newTag: v1.2.3

# 9. 替换器（跨资源引用）
replacements:
  - source:
      kind: ConfigMap
      name: myapp-config
      fieldPath: data.APP_HOST
    targets:
      - select:
          kind: Ingress
        fieldPaths:
          - spec.rules.0.host
```

### 补丁方式对比

| 方式 | 说明 | 示例 |
| ---- | ---- | ---- |
| **Strategic Merge Patch** | 提供部分 YAML 片段，按字段合并 | 修改 replicas、resources 等 |
| **JSON Patch (RFC 6902)** | 精确的 add/replace/remove 操作 | 删除某个字段、替换数组元素 |
| **Inline Patch** | 直接写在 kustomization.yaml 中 | 简单场景下避免额外文件 |
| **Patch 目标选择器** | 按 kind/name/label 批量匹配 | 同时补丁多个 Deployment |

```yaml
# Strategic Merge Patch 示例（replica_patch.yaml）
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 5
  template:
    spec:
      containers:
        - name: myapp
          resources:
            limits:
              cpu: "2"
              memory: 2Gi
```

### 常用命令

```bash
# 构建并预览输出
kustomize build overlays/prod
# 或（kubectl 内置）
kubectl kustomize overlays/prod

# 直接应用
kubectl apply -k overlays/prod

# 查看 diff（不实际部署）
kustomize build overlays/prod | kubectl diff -f -

# 验证 kustomization.yaml 语法
kustomize build overlays/prod --enable-alpha-plugins

# 远程 base（Git URL）
kustomize build https://github.com/org/repo//base?ref=main
```

### Kustomize 最佳实践

| 实践 | 说明 |
| ---- | ---- |
| base 保持通用 | base 只包含所有环境共享的配置，环境差异全部放 overlay |
| 使用 configMapGenerator | 自动生成带哈希后缀的 ConfigMap，内容变更自动触发 Pod 滚动更新 |
| 使用 images 字段替换镜像 | 比手动修改 YAML 更清晰，CI 管道可自动化更新 |
| 组件（Components）复用 | 公共能力（如监控 sidecar、日志配置）封装为 component，多 overlay 共享 |
| Git 远程 base | 直接引用上游仓库作为 base，便于同步更新 |
| 配合 Argo CD | Argo CD 原生支持 Kustomize，可通过 kustomize build options 控制版本 |

---

## Helm

### 核心概念

- **Chart**：Helm 的打包单元，包含模板文件、默认 values、依赖声明
- **Release**：Chart 的一次部署实例，Helm 跟踪每次安装/升级的版本
- **模板引擎**：Go template + Sprig 函数库，通过 values 注入生成 K8s YAML
- **仓库（Repository）**：Chart 的存储和分发平台（传统 HTTP 仓库 或 OCI Registry）
- **Hook**：在 Chart 生命周期的特定阶段执行操作

### 安装

```bash
# macOS
brew install helm

# Linux（官方脚本）
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# 添加常用仓库
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add stable https://charts.helm.sh/stable
helm repo update
```

### Chart 目录结构

```
mychart/
├── Chart.yaml          # Chart 元数据（名称、版本、依赖、描述）
├── values.yaml         # 默认配置值
├── values.schema.json  # (可选) values 的 JSON Schema 校验
├── charts/             # 子 Chart 依赖
├── crds/               # Custom Resource Definitions
├── templates/          # 模板文件目录
│   ├── _helpers.tpl    # 模板辅助函数（命名、标签等）
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── NOTES.txt       # 安装后显示的说明文本
└── .helmignore         # 打包时忽略的文件
```

### Chart.yaml 关键字段

```yaml
apiVersion: v2                    # Helm 3 必须为 v2
name: mychart
version: 1.2.3                    # Chart 版本（SemVer 2）
appVersion: "2.0.0"               # 应用版本（信息性）
description: My application chart
type: application                 # application 或 library
kubeVersion: ">= 1.25.0"         # K8s 版本约束

dependencies:                     # Chart 依赖
  - name: redis
    version: "18.x"
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled      # 条件开关

maintainers:
  - name: devops-team
    email: devops@example.com
```

### 模板语法核心

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mychart.fullname" . }}
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "mychart.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "mychart.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          ports:
            - containerPort: {{ .Values.service.port }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          {{- if .Values.env }}
          env:
            {{- range .Values.env }}
            - name: {{ .name }}
              value: {{ .value | quote }}
            {{- end }}
          {{- end }}
```

### 常用模板函数

| 类别 | 函数 | 说明 |
| ---- | ---- | ---- |
| **引用** | `.Values.xxx` | 引用 values.yaml 中的配置值 |
| | `.Chart.Name` / `.Chart.Version` | 引用 Chart.yaml 中的元数据 |
| | `.Release.Name` / `.Release.Namespace` | 引用 Release 信息 |
| | `.Capabilities.KubeVersion` | 集群 K8s 版本信息 |
| **控制流** | `{{- if .Values.xxx }}` | 条件判断 |
| | `{{- range .Values.list }}` | 遍历列表 |
| | `{{- with .Values.block }}` | 限定作用域 |
| **字符串** | `quote` / `squote` | 引号包裹 |
| | `upper` / `lower` / `title` | 大小写转换 |
| | `trim` / `trunc` / `default` | 裁剪与默认值 |
| **集合** | `toYaml` / `toJson` | 序列化为 YAML/JSON |
| | `merge` / `deepCopy` | 合并与深拷贝 |
| | `dict` / `list` / `set` | 创建字典/列表 |
| **辅助** | `include "name" .` | 引用命名模板 |
| | `required "msg" .Values.xxx` | 必填校验 |
| | `tpl` | 将字符串当模板渲染 |
| | `nindent N` | 缩进 N 个空格 |

### values.yaml 示例

```yaml
# 副本数
replicaCount: 3

# 镜像配置
image:
  repository: registry.example.com/myapp
  pullPolicy: IfNotPresent
  tag: ""                         # 默认使用 Chart.AppVersion

# 服务配置
service:
  type: ClusterIP
  port: 80

# Ingress 配置
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: myapp-tls
      hosts:
        - myapp.example.com

# 资源配置
resources:
  limits:
    cpu: 1000m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi

# HPA 配置
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

# 环境变量
env:
  - name: LOG_LEVEL
    value: info
  - name: DB_HOST
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: host
```

### Chart Hooks（生命周期钩子）

| Hook | 执行时机 |
| ---- | -------- |
| `pre-install` | 安装前（资源创建前） |
| `post-install` | 安装后（资源就绪后） |
| `pre-upgrade` | 升级前 |
| `post-upgrade` | 升级后 |
| `pre-delete` | 删除前 |
| `post-delete` | 删除后 |
| `pre-rollback` | 回滚前 |
| `post-rollback` | 回滚后 |
| `test` | `helm test` 执行时 |

```yaml
# templates/migrate-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "mychart.fullname" . }}-migrate
  annotations:
    "helm.sh/hook": pre-install,pre-upgrade
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  template:
    spec:
      containers:
        - name: migrate
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          command: ["python", "manage.py", "migrate"]
      restartPolicy: Never
```

### 常用命令

```bash
# 搜索 Chart
helm search hub nginx                    # 搜索 Artifact Hub
helm search repo nginx                   # 搜索已添加的仓库

# 安装 / 升级 / 回滚
helm install myrelease ./mychart                    # 本地安装
helm install myrelease myrepo/mychart               # 仓库安装
helm install myrelease oci://ghcr.io/org/mychart    # OCI Registry
helm install myrelease ./mychart -f values-prod.yaml  # 指定 values
helm install myrelease ./mychart --set image.tag=v2 # 命令行覆盖

helm upgrade myrelease ./mychart -f values-prod.yaml  # 升级
helm upgrade --install myrelease ./mychart             # 不存在则安装
helm rollback myrelease 2                              # 回滚到 revision 2

# 查看状态
helm list                                # 列出所有 Release
helm status myrelease                    # 查看 Release 状态
helm history myrelease                   # 查看升级历史
helm get values myrelease                # 查看生效的 values
helm get manifest myrelease              # 查看渲染后的 YAML

# 调试
helm template myrelease ./mychart        # 本地渲染模板（不安装）
helm template myrelease ./mychart -f values-prod.yaml --debug  # 调试模式
helm lint ./mychart                      # 检查 Chart 语法
helm install myrelease ./mychart --dry-run  # 模拟安装

# 打包与发布
helm package ./mychart                   # 打包为 .tgz
helm push mychart-1.0.0.tgz oci://ghcr.io/org/charts  # 推送到 OCI

# 测试
helm test myrelease                      # 运行 Chart 测试 Pod

# 卸载
helm uninstall myrelease                 # 卸载 Release
helm uninstall myrelease --keep-history  # 卸载但保留历史
```

### Helm 最佳实践

| 实践 | 说明 |
| ---- | ---- |
| `helm create` 脚手架 | 使用 `helm create mychart` 生成标准骨架，减少手写模板错误 |
| `_helpers.tpl` 集中管理 | 命名、标签等公共模板放到 `_helpers.tpl` 中复用 |
| values.schema.json | 添加 JSON Schema 校验 values 输入，防止错误配置上线 |
| `required` 校验必填项 | 对必须提供的环境变量等使用 `required` 函数强制校验 |
| OCI Registry 发布 | 使用 OCI Registry 分发 Chart，与容器镜像统一管理 |
| 子 Chart 条件化 | 通过 `condition: redis.enabled` 实现依赖的开关控制 |
| Library Chart | 公共模板抽取为 Library Chart（type: library），多 Chart 复用 |
| 测试 Pod | 编写 `test` Hook 验证安装后服务可用性 |

---

## Kustomize + Helm 组合使用

### 场景：用 Kustomize 管理多环境 Helm values

```yaml
# overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

helmCharts:
  - name: myapp
    repo: https://charts.example.com
    version: 1.2.3
    releaseName: myapp-prod
    namespace: production
    valuesFile: values-prod.yaml      # Helm values
    additionalValuesFiles:
      - values-common.yaml

patches:
  - target:
      kind: Deployment
      name: myapp-prod
    patch: |-
      - op: add
        path: /metadata/annotations/prometheus.io~1scrape
        value: "true"
```

### 场景：Helm 渲染后用 Kustomize 后处理

```bash
# Helm 渲染输出 → Kustomize 后处理（添加标签/补丁）
helm template myrelease ./mychart -f values-prod.yaml > base/release.yaml
kustomize build overlays/prod | kubectl apply -f -
```

### 场景：Argo CD 中同时使用

```yaml
# Argo CD Application 使用 Helm
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
spec:
  source:
    repoURL: https://charts.example.com
    chart: myapp
    targetRevision: 1.2.3
    helm:
      valueFiles:
        - values-prod.yaml
      parameters:
        - name: image.tag
          value: "v2.0.0"
  destination:
    server: https://kubernetes.default.svc
    namespace: production
```

---

## 选型建议

| 场景 | 推荐工具 | 理由 |
| ---- | -------- | ---- |
| 部署第三方开源软件（Redis/MySQL/Nginx Ingress） | **Helm** | 社区提供高质量 Chart，开箱即用 |
| 自研应用多环境部署 | **Kustomize** | 环境差异清晰，无需模板语法，GitOps 友好 |
| 需要包管理和版本分发 | **Helm** | 内置 Chart 打包、仓库、版本回滚 |
| 团队 K8s 经验较少 | **Kustomize** | 学习曲线低，只需理解 YAML 补丁 |
| 大型平台统一管理数百个应用 | **Kustomize + ApplicationSet** | 配合 Argo CD ApplicationSet 批量管理 |
| 需要 Hook（如数据库迁移） | **Helm** | 内置 pre-install/pre-upgrade Hook |
| CI 管道自动化镜像更新 | **Kustomize** | `images` 字段配合 CI 脚本一行更新 |
| 复杂应用（多级依赖 + 条件渲染） | **Helm** | 模板引擎 + 子 Chart 依赖管理更强大 |

> **实际生产中两者常组合使用**：Helm 负责打包和模板渲染，Kustomize 负责环境差异化和后处理补丁。

---

## Reference

[Kustomize Official Documentation](https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/)

[Helm Official Documentation](https://helm.sh/docs/)

[Helm GitHub](https://github.com/helm/helm)

[Kustomize GitHub](https://github.com/kubernetes-sigs/kustomize)

[Artifact Hub](https://artifacthub.io/) — Helm Chart 搜索与发现

[Bitnami Charts](https://github.com/bitnami/charts) — 高质量 Helm Chart 集合

[Helm Best Practices](https://helm.sh/docs/chart_best_practices/)

[Kustomize Examples](https://github.com/kubernetes-sigs/kustomize/tree/master/examples)

[Helm vs Kustomize 2026](https://sanj.dev/post/kustomize-vs-helm-2026/)

[]()

[]()

[]()

[]()

[]()

[]()
