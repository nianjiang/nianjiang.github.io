---
weight: 13
title: "Argo Workflows"
---

## 概览

Argo Workflows 是 CNCF 毕业项目，Kubernetes 原生的工作流引擎，用于编排容器化的任务（CI/CD、数据处理、ML 训练等）。

| 项目 | 说明 |
|------|------|
| 官网 | [argoproj.github.io/workflows](https://argoproj.github.io/workflows/) |
| 文档 | [argo-workflows.readthedocs.io](https://argo-workflows.readthedocs.io/) |
| GitHub | [argoproj/argo-workflows](https://github.com/argoproj/argo-workflows) |
| API 版本 | `argoproj.io/v1alpha1` |
| CRD | `Workflow`、`WorkflowTemplate`、`ClusterWorkflowTemplate`、`CronWorkflow` |
| Online | [killercoda](https://killercoda.com/argoproj/course/argo-workflows), [Github](https://github.com/argoproj-labs/training-material/tree/main/argo-workflows) |

---

## 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         argo namespace                          │
│                                                                 │
│  ┌──────────────────────┐       ┌──────────────────────────┐    │
│  │   Workflow Controller │       │      Argo Server         │    │
│  │   (Deployment)        │       │      (Deployment)        │    │
│  │                       │       │                          │    │
│  │  - Watch Workflow CRD │       │  - gRPC/HTTP API :2746   │    │
│  │  - 创建/管理 Pod       │       │  - Web UI (React)        │    │
│  │  - Reconcile 状态      │       │  - SSO / Token 认证      │    │
│  └──────────┬───────────┘       └──────────────────────────┘    │
│             │                                                    │
└─────────────┼────────────────────────────────────────────────────┘
              │ 创建 Pod
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      目标 namespace                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Workflow Pod                          │    │
│  │                                                         │    │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────────────┐    │    │
│  │  │  init    │──▶│  main    │──▶│     wait         │    │    │
│  │  │ (拉取    │   │ (用户    │   │ (上传 artifact、  │    │    │
│  │  │ artifact)│   │  容器)   │   │  保存参数)        │    │    │
│  │  └──────────┘   └──────────┘   └──────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**核心组件**：

| 组件 | 职责 |
|------|------|
| **Workflow Controller** | Watch Workflow CRD → 创建 Pod → Reconcile 状态，核心控制器 |
| **Argo Server** | 提供 API/UI，可选组件（Controller 可独立运行） |
| **argoexec** | 注入到每个 Workflow Pod 中，负责 artifact 上传/下载、参数传递 |

---

## 核心概念

### Workflow（工作流）

Workflow 是 Argo 的核心 CRD，定义了一次完整的工作流执行：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: hello-world-    # 自动生成唯一名称
spec:
  entrypoint: main              # 入口模板
  arguments:                    # 全局参数
    parameters:
    - name: message
      value: "hello world"
  templates:                    # 模板列表
  - name: main
    container:
      image: alpine:3.23
      command: [echo, "{{workflow.parameters.message}}"]
```

**Spec 结构**：

```
spec:
  entrypoint: <入口模板名>
  arguments:                    # 全局输入参数
  templates:                    # 模板定义列表
    - name: <模板名>
      inputs:                   # 输入（parameters / artifacts）
      outputs:                  # 输出（parameters / artifacts）
      container: | script: | dag: | steps: | resource: | suspend:
  onExit: <退出处理器模板名>
  retryStrategy:                # 重试策略
  timeout:                      # 超时时间
```

### Template（模板）

模板是工作流的基本执行单元，每个模板定义一个"任务"：

| 类型 | 说明 | 示例 |
|------|------|------|
| **container** | 运行容器（等同 Pod spec） | `image: alpine, command: [echo]` |
| **script** | 内联脚本（stdout → result） | `source: print("hello")` |
| **steps** | 有序步骤编排 | 顺序/并行执行多个子模板 |
| **dag** | DAG 任务编排 | 依赖图执行多个子模板 |
| **resource** | 操作 K8s 资源 | `action: create, manifest: ...` |
| **suspend** | 暂停等待人工审批 | 手动 approve 后继续 |
| **http** | 发送 HTTP 请求 | 调用外部 API |
| **containerSet** | 多个容器共享 Pod | 共享 volume，无需 sidecar |

### Steps（步骤编排）

Steps 以**双层数组**定义，外层顺序执行，内层并行执行：

```yaml
templates:
- name: main
  steps:
  - - name: step1           # 第一组：单独执行
      template: build
  - - name: step2a          # 第二组：并行执行
      template: test-a
    - name: step2b
      template: test-b
  - - name: step3           # 第三组：等 step2a/2b 都完成后执行
      template: deploy
```

执行顺序：`step1` → (`step2a` ∥ `step2b`) → `step3`

### DAG（有向无环图）

DAG 通过 `dependencies` 声明任务依赖，自动最大化并行：

```yaml
templates:
- name: main
  dag:
    tasks:
    - name: A                 # 无依赖，最先执行
      template: echo
    - name: B
      dependencies: [A]       # 等 A 完成
      template: echo
    - name: C
      dependencies: [A]       # 等 A 完成（与 B 并行）
      template: echo
    - name: D
      dependencies: [B, C]    # 等 B 和 C 都完成
      template: echo
```

```
    A
   / \
  B   C
   \ /
    D
```

**Enhanced Depends**（高级依赖）：

```yaml
- name: D
  depends: "B.Succeeded && C.Succeeded"   # 条件依赖
  depends: "A.Succeeded || B.Failed"      # OR 逻辑
```

| 状态变量 | 含义 |
|---------|------|
| `.Succeeded` | 任务成功 |
| `.Failed` | 任务失败 |
| `.Errored` | 任务出错 |
| `.Skipped` | 任务被跳过 |
| `.Omitted` | 任务被省略 |

**Steps vs DAG 对比**：

| 维度 | Steps | DAG |
|------|-------|-----|
| 编排方式 | 双层数组（顺序/并行） | 依赖图 |
| 复杂度 | 简单直观 | 适合复杂流程 |
| 并行控制 | 内层数组并行 | 自动最大化并行 |
| 条件依赖 | `when` 表达式 | Enhanced Depends |
| 维护性 | 嵌套深时难维护 | 依赖关系一目了然 |

---

## 参数与 Artifacts

### Parameters（参数）

参数是字符串类型的轻量级数据传递：

```yaml
# 输入参数
inputs:
  parameters:
  - name: message

# 输出参数（从文件读取）
outputs:
  parameters:
  - name: hello-param
    valueFrom:
      path: /tmp/hello.txt

# script 模板的 stdout 自动成为 result
outputs:
  result: "{{steps.generate.outputs.result}}"
```

**引用方式**：

| 场景 | 引用语法 |
|------|---------|
| 全局参数 | `{{workflow.parameters.name}}` |
| Steps 中引用上一步输出 | `{{steps.<step>.outputs.parameters.<name>}}` |
| DAG 中引用其他 task 输出 | `{{tasks.<task>.outputs.parameters.<name>}}` |
| script 的 stdout | `{{steps.<step>.outputs.result}}` |

### Artifacts（制品）

Artifacts 用于传递文件/目录等大体积数据：

```yaml
inputs:
  artifacts:
  - name: code
    git:
      repo: https://github.com/argoproj/argo-workflows.git
      revision: main

outputs:
  artifacts:
  - name: result
    path: /tmp/output.txt
    s3:
      bucket: my-bucket
      key: output/{{workflow.name}}/result.txt
```

**支持的 Artifact 存储**：

| 类型 | 配置 |
|------|------|
| **S3** | AWS S3 / MinIO / 阿里云 OSS |
| **GCS** | Google Cloud Storage |
| **Git** | 克隆代码仓库 |
| **HTTP** | 下载 URL 资源 |
| **OSS** | 阿里云 OSS |
| **HDFS** | Hadoop 分布式文件 |
| **Raw** | 内联文本内容 |

---

## 高级特性

### Loops（循环）

```yaml
# withItems: 遍历列表
- name: print
  template: echo
  withItems:
  - hello
  - world

# withParam: 遍历 JSON 数组（动态并行）
- name: process
  template: echo
  withParam: "{{steps.generate.outputs.result}}"  # JSON array string

# withSequence: 数字序列
- name: seq
  template: echo
  withSequence:
    count: "5"          # 0,1,2,3,4
    start: "1"          # 起始值
    end: "10"           # 结束值
    format: "%02d"      # 格式化
```

### Conditionals（条件）

```yaml
- name: deploy-prod
  template: deploy
  when: "{{steps.test.outputs.result}} == passed"

# DAG 中使用 depends
- name: notify
  depends: "build.Succeeded && test.Succeeded"
  template: notify
```

### Retry（重试）

```yaml
# 模板级别重试
retryStrategy:
  limit: "3"                    # 最多重试 3 次
  retryPolicy: "Always"         # Always | OnFailure | OnError | OnTransientError
  backoff:
    duration: "5s"
    factor: "2"
    maxDuration: "5m"
  affinity:
    nodeAntiAffinity: {}        # 重试时调度到其他节点

# 条件重试
retryStrategy:
  expression: "lastRetry.status == 'Failed'"
```

### Timeout（超时）

```yaml
# 全局超时
spec:
  activeDeadlineSeconds: 3600   # 整个 workflow 1 小时超时

# 模板级别超时
- name: long-task
  timeout: "10m"                # 单步 10 分钟超时
  container:
    image: alpine
```

### Exit Handler（退出处理器）

无论成功失败，workflow 结束时执行：

```yaml
spec:
  entrypoint: main
  onExit: exit-handler          # 引用退出处理模板

templates:
- name: exit-handler
  steps:
  - - name: notify
      template: send-slack
  - - name: on-success
      template: celebrate
      when: "{{workflow.status}} == Succeeded"
  - - name: on-failure
      template: alert
      when: "{{workflow.status}} != Succeeded"
```

**全局变量**：

| 变量 | 说明 |
|------|------|
| `{{workflow.status}}` | Succeeded / Failed / Error |
| `{{workflow.name}}` | Workflow 名称 |
| `{{workflow.duration}}` | 执行时长 |
| `{{workflow.failures}}` | 失败节点列表（JSON） |

### Suspend（暂停/人工审批）

```yaml
- name: approve
  suspend: {}                   # 无限期暂停，等待人工 approve

# 带超时
- name: wait-approval
  suspend:
    duration: "24h"             # 24 小时后自动继续
```

CLI 操作：

```bash
argo resume <workflow>          # 继续执行
argo terminate <workflow>       # 终止
```

---

## WorkflowTemplate（可复用模板）

WorkflowTemplate 是集群级别的模板资源，可被多个 Workflow 引用：

```yaml
# 定义可复用模板
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: build-template
spec:
  templates:
  - name: build
    inputs:
      parameters:
      - name: image
    container:
      image: "golang:1.21"
      command: [sh, -c]
      args: ["go build -o /output/app"]
    outputs:
      artifacts:
      - name: binary
        path: /output/app

---
# 引用 WorkflowTemplate
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: my-build-
spec:
  entrypoint: main
  templates:
  - name: main
    steps:
    - - name: build
        templateRef:            # 引用外部模板
          name: build-template
          template: build
        arguments:
          parameters:
          - name: image
            value: "myapp:v1"
```

| CRD | 范围 | 说明 |
|-----|------|------|
| `WorkflowTemplate` | Namespace 级别 | 同 namespace 内复用 |
| `ClusterWorkflowTemplate` | 集群级别 | 跨 namespace 复用 |

---

## CronWorkflow（定时工作流）

类似 K8s CronJob，按 cron 表达式定期触发 Workflow：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: CronWorkflow
metadata:
  name: nightly-backup
spec:
  schedule: "0 2 * * *"         # 每天凌晨 2 点
  timezone: "Asia/Shanghai"
  concurrencyPolicy: "Replace"  # Allow | Forbid | Replace
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  startingDeadlineSeconds: 60
  workflowSpec:
    entrypoint: backup
    templates:
    - name: backup
      container:
        image: alpine
        command: [sh, -c]
        args: ["echo backup at $(date)"]
```

---

## CLI 常用命令

```bash
# 提交工作流
argo submit workflow.yaml
argo submit workflow.yaml -p message="hello"    # 传参
argo submit --watch workflow.yaml               # 提交并观察

# 查看
argo list                                       # 列出所有 workflow
argo get @latest                                # 查看最新 workflow
argo get <name> -o yaml                         # YAML 输出

# 日志
argo logs @latest                               # 查看日志
argo logs -f <name>                             # 实时跟踪

# 操作
argo delete <name>                              # 删除
argo retry <name>                               # 重试失败的 workflow
argo resume <name>                              # 继续暂停的 workflow
argo suspend <name>                             # 暂停正在运行的 workflow
argo stop <name>                                # 停止
argo terminate <name>                           # 强制终止

# 模板
argo template list                              # 列出 WorkflowTemplate
argo template get <name>                        # 查看模板

# CronWorkflow
argo cron list                                  # 列出 CronWorkflow
argo cron create cron.yaml                      # 创建
argo cron suspend <name>                        # 暂停
argo cron resume <name>                         # 恢复
```

---

## 安装

```bash
# 快速安装（开发/测试环境）
ARGO_WORKFLOWS_VERSION="v3.6.2"
kubectl create namespace argo
kubectl apply --server-side -n argo \
  -f "https://github.com/argoproj/argo-workflows/releases/download/${ARGO_WORKFLOWS_VERSION}/quick-start-minimal.yaml"

# 访问 UI
kubectl -n argo port-forward service/argo-server 2746:2746
# 浏览器访问 https://localhost:2746

# 安装 CLI（macOS）
brew install argo
# 或从 GitHub Releases 下载
```

---

## 常见模式

### 数据处理 Pipeline

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: data-pipeline-
spec:
  entrypoint: pipeline
  templates:
  - name: pipeline
    dag:
      tasks:
      - name: extract
        template: extract-data
      - name: transform
        dependencies: [extract]
        template: transform-data
        arguments:
          artifacts:
          - name: input
            from: "{{tasks.extract.outputs.artifacts.output}}"
      - name: load
        dependencies: [transform]
        template: load-data
        arguments:
          artifacts:
          - name: input
            from: "{{tasks.transform.outputs.artifacts.output}}"
```

### 多环境部署（条件分支）

```yaml
templates:
- name: deploy-pipeline
  steps:
  - - name: test
      template: run-tests
  - - name: deploy-dev
      template: deploy
      arguments:
        parameters: [{name: env, value: dev}]
  - - name: approve-prod
      template: manual-approve
      when: "{{steps.deploy-dev.status}} == Succeeded"
  - - name: deploy-prod
      template: deploy
      when: "{{steps.approve-prod.status}} == Succeeded"
      arguments:
        parameters: [{name: env, value: prod}]
```

---

## 与 Tekton 对比

| 维度 | Argo Workflows | Tekton |
|------|----------------|--------|
| 编排模型 | Steps / DAG | Pipeline → Task |
| CRD | Workflow | PipelineRun / TaskRun |
| UI | 内置 Web UI | Tekton Dashboard（需额外安装） |
| 定时执行 | CronWorkflow | 需配合 CronJob |
| Artifact 传递 | 原生支持多种存储 | 需配置 Workspace |
| 可复用模板 | WorkflowTemplate | Task / ClusterTask |
| 适用场景 | 通用工作流、ML、数据处理 | CI/CD 为主 |
| 社区生态 | Argo 全家桶集成 | Red Hat/OpenShift 生态 |

---

## Reference

- [Argo Workflows 官方文档](https://argo-workflows.readthedocs.io/)
- [Argo Workflows GitHub](https://github.com/argoproj/argo-workflows)
- [Argo Workflows Examples](https://github.com/argoproj/argo-workflows/tree/main/examples)
- [Killercoda Argo Workflows Labs](https://killercoda.com/argoproj/course/argo-workflows)
- [Awesome Argo](https://github.com/akuity/awesome-argo)
