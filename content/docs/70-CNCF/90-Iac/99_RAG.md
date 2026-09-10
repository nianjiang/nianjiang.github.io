---
weight: 99
title: "RAG Framework for IaC Agent"
---

## 开源 LLM + RAG 框架选型：面向 IaC Agent 开发

> **目标**：选择开源 RAG 框架作为基座，二次开发出 **IaC Agent**（自然语言生成基础设施代码）。
>
> **核心需求**：开源 + UI 界面 + 方便二次开发 + 适合构建 IaC Agent

---

### IaC Agent 对 RAG 框架的特殊要求

IaC Agent 与普通知识库问答不同，对 RAG 框架有更高的技术要求：

```
IaC Agent 工作流程：
┌──────────────────────────────────────────────────────────────┐
│  1. 用户在 UI 输入自然语言需求                                  │
│     "为 project-a 创建一个 4C8G 的 ECS 实例，部署在 cn-shanghai" │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  2. RAG 检索：从已有 IaC 代码库中检索相似代码作为上下文          │
│     ├─ 检索同项目的已有资源定义（参考命名、标签、模块结构）       │
│     ├─ 检索类似资源的代码模板（ECS / RDS / VPC 等）             │
│     └─ 检索 Terraform Provider 文档和最佳实践                   │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  3. LLM 生成 IaC 代码（带 RAG 上下文增强）                      │
│     ├─ 参考已有代码风格                                        │
│     ├─ 生成 Terraform / OpenTofu / Pulumi 代码                 │
│     └─ 确保代码符合项目规范（命名、标签、模块划分）               │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  4. 自定义工具调用（关键！）                                    │
│     ├─ 调用 terraform fmt / validate 验证代码                   │
│     ├─ 调用 tflint / checkov 做安全和规范检查                    │
│     ├─ 调用 Git API（创建分支、提交代码、创建 PR）               │
│     ├─ 调用仓库分析工具（解析已有目录结构）                       │
│     └─ 调用云 API（验证资源配额、检查冲突）                      │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  5. 结果返回 UI                                                │
│     ├─ 生成的代码（可预览、可编辑）                              │
│     ├─ PR 链接                                                 │
│     └─ 验证报告（通过/失败/警告）                                │
└──────────────────────────────────────────────────────────────┘
```

**因此，IaC Agent 对 RAG 框架的核心要求是**：

| 要求 | 说明 | 为什么重要 |
|------|------|-----------|
| **RAG 支持代码** | 能索引和检索代码文件（不只是文档） | 参考已有代码生成新代码 |
| **自定义工具** | 能调用任意 HTTP API 和命令行工具 | 调用 terraform / git / 云 API |
| **Agent / 工作流** | 支持多步骤编排（检索→生成→验证→提交） | 完整的端到端自动化 |
| **完整 API** | 所有功能都有 REST API | 供自定义前端调用 |
| **插件扩展** | 支持自定义插件/工具 | 开发 IaC 专用工具 |
| **MCP 支持** | 支持 MCP 协议 | 标准化外部工具集成 |
| **二次开发友好** | 代码可读性好、架构清晰 | 深度定制 |

---

### 框架选型总览

#### 第一梯队：IaC Agent 基座（推荐）

| 框架 | 描述 | 协议 | Stars | 语言 | Agent 能力 | 自定义工具 | MCP | API | 二次开发 |
|------|------|------|-------|------|-----------|-----------|-----|-----|---------|
| **[Dify](https://github.com/langgenius/dify)** ⭐ | 开源 LLM 应用开发平台，集 Workflow、RAG、Agent、模型管理、LLMOps 于一体，支持 Plugin 和 MCP 双向扩展 | Apache-2.0* | 154k+ | Python+React | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ 原生 | ✅ 完整 | ⭐⭐⭐⭐ |
| **[n8n](https://github.com/n8n-io/n8n)** | 工作流自动化平台，400+ 集成节点（GitHub/GitLab/云 API），AI Agent 节点 + Code 节点支持自定义逻辑 | Sustainable Use | 203k+ | TypeScript | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ 社区 | ✅ 完整 | ⭐⭐⭐⭐ |

#### 第二梯队：适合特定场景

| 框架 | 描述 | 协议 | Stars | 语言 | Agent 能力 | 自定义工具 | MCP | API | 二次开发 |
|------|------|------|-------|------|-----------|-----------|-----|-----|---------|
| **[FastGPT](https://github.com/labring/FastGPT)** | 知识库 QA 系统，以知识库为核心，支持父子分割、混合检索与重排序，可视化工作流编排，开箱即用的聊天 UI | Apache-2.0 | 29k+ | TypeScript | ⭐⭐⭐ | ⭐⭐⭐ | ❌ | ✅ | ⭐⭐⭐ |
| **[Langflow](https://github.com/langflow-ai/langflow)** | Python LangChain 可视化画布，拖拽设计工作流，可导出为 Python 代码独立运行，支持 MCP Server 发布 | MIT | 50k+ | Python+React | ⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **[RagFlow](https://github.com/infiniflow/ragflow)** | 深度文档理解 RAG 引擎，擅长复杂 PDF/表格/图表解析和 OCR，语义分割智能，适合处理非结构化文档 | Apache-2.0 | 35k+ | Python+React | ⭐⭐⭐ | ⭐⭐⭐ | ❌ | ✅ | ⭐⭐⭐ |

#### 第三梯队：轻量验证 / 辅助工具

| 框架 | 描述 | 协议 | Stars | 语言 | Agent 能力 | 自定义工具 | MCP | API | 二次开发 |
|------|------|------|-------|------|-----------|-----------|-----|-----|---------|
| **[MaxKB](https://github.com/1Panel-dev/MaxKB)** | 企业级智能体平台，集成 RAG + 工作流 + MCP 工具，支持多模态输入输出，一行命令 Docker 部署 | GPLv3 | 15k+ | Python+Vue | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ✅ | ⭐⭐⭐ |
| **[Flowise](https://github.com/FlowiseAI/Flowise)** | LangChainJS 可视化构建器，拖拽式设计 LLM 工作流，内置聊天 UI 可嵌入网站，轻量级适合快速原型 | Apache-2.0 | 55k+ | TypeScript | ⭐⭐ | ⭐⭐ | ❌ | ✅ | ⭐⭐⭐ |
| **[Coze Studio](https://github.com/coze-dev/coze-studio)** | 字节跳动开源 AI Bot 平台，零代码可视化创建，一键发布到飞书/抖音/微信，侧重消费级 Bot 分发 | Apache-2.0 | 21k+ | TypeScript | ⭐⭐⭐ | ⭐⭐ | 网关 | ✅ | ⭐⭐ |
| **[Anything-LLM](https://github.com/Mintplex-Labs/anything-llm)** | 全功能 AI 桌面应用，支持本地 LLM + 本地向量库，零配置即可对话文档，适合个人/小团队离线使用 | MIT | 35k+ | JavaScript | ⭐⭐ | ⭐⭐ | ❌ | ❌ | ⭐⭐ |

---

### 第一梯队详解

#### 1. Dify ⭐ 推荐首选

**定位**：LLM 应用开发平台（BaaS for AI Apps）

**为什么适合 IaC Agent**：

```
┌──────────────────────────────────────────────────────────────┐
│  Dify → IaC Agent 架构映射                                    │
│                                                              │
│  Dify 提供的能力              IaC Agent 如何使用              │
│  ─────────────────────       ──────────────────────          │
│  可视化工作流 (Workflow)   →  编排完整流程                     │
│  RAG Pipeline             →  检索已有 IaC 代码作为上下文      │
│  Agent + Function Call    →  调用自定义工具（git/terraform）   │
│  自定义 HTTP 工具          →  封装 IaC 后端 API               │
│  MCP 原生支持              →  标准化外部工具集成               │
│  Plugin Marketplace       →  开发 IaC 专用插件               │
│  完整 REST API            →  自定义前端直接调用               │
│  LLMOps (监控/日志)       →  追踪代码生成质量                 │
│  多模型支持                →  切换代码生成模型                 │
│  Extension Plugin Endpoint→  自定义 HTTP 端点处理回调          │
└──────────────────────────────────────────────────────────────┘
```

**Dify 自定义工具体系**：

```
Dify 支持三种自定义工具方式：

方式 1：HTTP 自定义工具
  ├─ 在 UI 中配置 OpenAPI Schema
  ├─ 定义 HTTP 请求（URL、Method、Headers、Body）
  └─ LLM 自动调用 → 你的后端 API

  示例：创建 "IaC Backend" 工具
  ├─ POST /api/analyze-repo  → 分析仓库结构
  ├─ POST /api/generate-code → 生成 IaC 代码
  ├─ POST /api/validate      → 调用 terraform validate
  ├─ POST /api/commit        → 提交代码到 Git
  └─ GET  /api/task/{id}     → 查询任务状态

方式 2：Plugin（插件开发）
  ├─ 基于 Dify Plugin SDK 开发
  ├─ 支持 Python / TypeScript
  ├─ 可发布到 Dify Marketplace
  └─ 可本地安装

  示例：开发 "iac-agent-plugin"
  ├─ 工具 1：repo_analyzer（分析 Git 仓库）
  ├─ 工具 2：code_generator（IaC 代码生成）
  ├─ 工具 3：terraform_validator（代码验证）
  └─ 工具 4：git_operator（Git 操作）

方式 3：MCP Server
  ├─ 原生支持 MCP 协议
  ├─ 可将 Dify 工作流发布为 MCP Server
  ├─ 也可连接外部 MCP Server
  └─ Claude Desktop / ChatGPT 可直接调用

  示例：开发 "iac-mcp-server"
  ├─ Tool: create_ecs_instance
  ├─ Tool: create_vpc
  ├─ Tool: deploy_kubernetes_service
  └─ Tool: generate_terraform_code
```

**技术栈**：

| 层 | 技术 | 说明 |
|----|------|------|
| 前端 | React + TypeScript | Web UI + 工作流画布 |
| 后端 | Python (Flask) | API Server |
| 数据库 | PostgreSQL + pgvector | 关系数据 + 向量存储 |
| 向量库 | Weaviate / Qdrant / Milvus / ChromaDB | 可选多种向量数据库 |
| 缓存 | Redis | 会话缓存、任务队列 |
| 消息队列 | Celery | 异步任务处理 |
| 对象存储 | S3 / MinIO | 文档和文件存储 |
| 部署 | Docker Compose / Kubernetes | 容器化部署 |

**安装**：

```bash
git clone https://github.com/langgenius/dify
cd dify/docker
cp .env.example .env
docker compose up -d

# 访问 http://localhost/install 初始化
# 最低要求：CPU >= 2, RAM >= 4 GiB
```

**优点**：
- ✅ **Agent + 工作流最完整**（Function Calling + ReAct + 可视化编排）
- ✅ **自定义工具灵活**（HTTP 工具 + Plugin + MCP 三种方式）
- ✅ **API 完整**（所有功能 API 化，供前端调用）
- ✅ **LLMOps 监控**（追踪每次代码生成的质量和成本）
- ✅ **社区最大**（154k+ stars，500+ 插件）
- ✅ **MCP 双向支持**（既调用 MCP Server，也可发布为 MCP Server）

**缺点**：
- ⚠️ 部署较重（PostgreSQL + Redis + 向量库 + 对象存储）
- ⚠️ Apache-2.0 附加条件（不可作为 SaaS 竞品提供服务）
- ⚠️ 二次开发学习曲线（需理解 Dify DSL 和插件体系）

---

#### 2. n8n

**定位**：工作流自动化平台 + AI Agent

**为什么适合 IaC Agent**：

```
┌──────────────────────────────────────────────────────────────┐
│  n8n → IaC Agent 架构映射                                     │
│                                                              │
│  n8n 提供的能力               IaC Agent 如何使用              │
│  ─────────────────────       ──────────────────────          │
│  400+ 集成节点              →  直接对接 GitHub/GitLab/云 API  │
│  AI Agent 节点              →  LLM 驱动的工具调用              │
│  HTTP Request 节点          →  调用任意 REST API               │
│  Code 节点                  →  编写自定义逻辑（JS/Python）     │
│  Webhook 触发               →  接收 UI 请求                   │
│  Git 节点                   →  直接操作 Git 仓库              │
│  数据库节点                  →  存储任务状态                    │
│  队列模式                   →  生产级异步处理                  │
└──────────────────────────────────────────────────────────────┘
```

**n8n 的核心优势 — 集成能力**：

```
IaC Agent 需要集成的外部系统，n8n 几乎都有现成节点：

Git 操作：
  ├─ GitHub 节点（创建 PR、管理分支、评论）
  ├─ GitLab 节点（同上）
  └─ Bitbucket 节点

云服务：
  ├─ AWS 节点（EC2、VPC、RDS 等）
  ├─ 阿里云节点（ECS、VPC、RDS）
  └─ Azure / GCP 节点

CI/CD：
  ├─ Jenkins 节点（触发 Pipeline）
  ├─ GitHub Actions 节点
  └─ Terraform Cloud 节点

通知：
  ├─ Slack / 钉钉 / 飞书 节点
  ├─ Email 节点
  └─ Webhook 节点
```

**技术栈**：

| 层 | 技术 | 说明 |
|----|------|------|
| 前端 | Vue.js | Web UI + 工作流编辑器 |
| 后端 | TypeScript + Node.js | 工作流引擎 |
| 数据库 | PostgreSQL / MySQL / SQLite | 工作流和凭据存储 |
| 队列 | Redis（可选） | 队列模式（生产必须） |
| 部署 | Docker / npm | 容器化或原生运行 |

**安装**：

```bash
# Docker 启动
docker run -d --name n8n -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n

# 或 npm 启动
npx n8n

# 访问 http://localhost:5678
```

**优点**：
- ✅ **集成能力最强**（400+ 节点，几乎覆盖所有 SaaS）
- ✅ **Git 操作原生支持**（GitHub/GitLab 节点）
- ✅ **社区最大**（203k+ stars）
- ✅ **适合自动化场景**（IaC Agent 本质是自动化）
- ✅ **队列模式**（生产级异步处理）

**缺点**：
- ⚠️ RAG 能力较弱（没有内置 RAG Pipeline，需自建）
- ⚠️ 不是 OSI 开源协议（Sustainable Use License）
- ⚠️ AI Agent 能力不如 Dify 专业
- ⚠️ 没有内置知识库管理

---

### 第二梯队详解

#### 3. FastGPT

**适合 IaC Agent 的点**：
- ✅ 知识库能力强（可用于索引 IaC 代码文档、Provider 文档）
- ✅ 工作流支持 HTTP 节点（可调用自定义后端）
- ✅ Apache-2.0 协议友好

**不适合的点**：
- ⚠️ Agent 能力偏弱（不支持 Function Calling）
- ⚠️ 没有 MCP 支持
- ⚠️ 工具扩展能力有限

**适用场景**：如果 IaC Agent 只需要 **RAG 检索 + 简单代码生成**，FastGPT 够用。

---

#### 4. Langflow

**适合 IaC Agent 的点**：
- ✅ 基于 Python LangChain，二次开发最灵活
- ✅ 可导出为 Python 代码，脱离 UI 独立部署
- ✅ MIT 协议（完全自由）
- ✅ MCP 支持

**不适合的点**：
- ⚠️ UI 更偏「画布」而非「产品」
- ⚠️ 没有内置知识库管理（需要自行集成向量数据库）
- ⚠️ 被 DataStax/IBM 收购后方向不确定

**适用场景**：如果团队是 **Python 为主**，希望最大灵活度，Langflow 是好选择。

---

#### 5. RagFlow

**适合 IaC Agent 的点**：
- ✅ 深度文档理解（可以解析复杂的 Terraform 文档）
- ✅ 语义分割智能

**不适合的点**：
- ⚠️ Agent 能力弱
- ⚠️ 没有 MCP 支持
- ⚠️ 工具调用能力有限

**适用场景**：作为 IaC Agent 的 **辅助组件**（用于解析文档），不适合作为主框架。

---

### IaC Agent 专用能力对比

下表专门对比各框架在 IaC Agent 场景下的关键能力：

| 能力 | Dify | n8n | FastGPT | Langflow | RagFlow |
|------|------|-----|---------|----------|---------|
| **代码 RAG** | ✅ 支持 | ⚠️ 需自建 | ⚠️ 支持但弱 | ✅ LangChain 生态 | ⚠️ 偏文档 |
| **自定义工具** | ✅ HTTP + Plugin | ✅ 400+ 节点 | ⚠️ 有限 | ✅ Python 自定义 | ⚠️ 有限 |
| **MCP 协议** | ✅ 原生双向 | ⚠️ 社区 | ❌ | ✅ | ❌ |
| **Git 集成** | ⚠️ 自定义工具 | ✅ 原生节点 | ❌ | ⚠️ 自定义 | ❌ |
| **Terraform 调用** | ⚠️ HTTP 工具 | ⚠️ Code 节点 | ❌ | ✅ Python 直接调用 | ❌ |
| **完整 REST API** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **异步任务** | ✅ Celery | ✅ 队列模式 | ❌ | ❌ | ❌ |
| **任务状态追踪** | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| **前端嵌入** | ✅ SDK | ✅ 嵌入 | ✅ 嵌入 | ⚠️ | ⚠️ |
| **Plugin 体系** | ✅ Marketplace | ✅ 社区 | ❌ | ✅ 组件 | ❌ |
| **多租户/权限** | ✅ | ✅ | ✅ | ❌ | ⚠️ |
| **监控/日志** | ✅ LLMOps | ✅ 执行历史 | ⚠️ | ❌ | ⚠️ |

---

### 选型决策：构建 IaC Agent

```
IaC Agent 选型决策树：

┌─ 需要完整的 Agent + RAG + Workflow + 自定义工具？
│  └─ ✅ Dify（首选推荐）
│     理由：Agent 能力最强，自定义工具最灵活，MCP 原生支持
│     开发模式：Dify 做编排层 + 自研 Python 后端做 IaC 逻辑
│
├─ 团队擅长 TypeScript，需要强集成能力？
│  └─ ✅ n8n
│     理由：400+ 集成节点，Git/云 API 原生支持
│     开发模式：n8n 做编排层 + HTTP Request 调用自研后端
│
├─ 团队擅长 Python，需要最大灵活度？
│  └─ ✅ Langflow（或直接用 LangChain + LangGraph）
│     理由：可导出 Python 代码，完全控制
│     开发模式：Langflow 做原型 → 导出代码 → 自研前端
│
├─ 只需要 RAG 检索 + 简单代码生成？
│  └─ ✅ FastGPT
│     理由：知识库能力强，部署简单
│     开发模式：FastGPT 做 RAG + HTTP 节点调用后端
│
└─ Dify + n8n 组合（企业级方案）
   理由：Dify 做 Agent 编排 + RAG，n8n 做 Git/CI/CD 自动化
   开发模式：Dify 的 MCP Server → n8n 的 Webhook 触发
```

---

### 推荐架构方案

#### 方案 A：基于 Dify（推荐）

```
┌──────────────────────────────────────────────────────────────┐
│  IaC Agent — 基于 Dify                                        │
│                                                              │
│  ┌─────────────┐     ┌─────────────────────────────────────┐│
│  │  自定义 UI   │────▶│  Dify API（REST）                    ││
│  │  (React)    │◀────│  ├─ Workflow（编排完整流程）          ││
│  │             │     │  ├─ RAG Pipeline（代码检索）          ││
│  │  ├─ 输入需求 │     │  ├─ Agent（智能体 + 工具调用）        ││
│  │  ├─ 查看代码 │     │  └─ LLMOps（监控/日志）              ││
│  │  ├─ 追踪状态 │     └──────────┬──────────────────────────┘│
│  │  └─ 审核 PR  │                │                           │
│  └─────────────┘                │                           │
│                                 ▼                           │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  自研 Python 后端（FastAPI）                               ││
│  │                                                          ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  ││
│  │  │仓库分析器 │ │代码生成器 │ │代码验证器 │ │Git 操作器 │  ││
│  │  │          │ │          │ │          │ │          │  ││
│  │  │分析目录   │ │结合 RAG  │ │terraform │ │clone     │  ││
│  │  │结构/命名  │ │上下文    │ │fmt       │ │branch    │  ││
│  │  │识别已有   │ │生成代码  │ │validate  │ │commit    │  ││
│  │  │资源       │ │          │ │tflint    │ │PR        │  ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  基础设施                                                  ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  ││
│  │  │PostgreSQL│ │ 向量数据库 │ │ Redis    │ │ Git 仓库  │  ││
│  │  │+ pgvector│ │(Qdrant)  │ │(任务队列) │ │(GitHub)   │  ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Dify 工作流设计示例**：

```
Dify Workflow：IaC 代码生成流程

用户输入（自然语言需求）
    │
    ▼
[代码节点] 解析需求 → 提取 project / resource_type / params
    │
    ▼
[IF/ELSE] 判断：已有项目 or 新项目？
    │                        │
    ▼                        ▼
[HTTP 工具]                [HTTP 工具]
分析已有仓库结构            初始化新项目模板
    │                        │
    └────────┬───────────────┘
             │
             ▼
    [知识库检索] RAG：检索相似代码
    （从向量库中检索同项目/同类型的已有代码）
             │
             ▼
    [LLM 节点] 生成 IaC 代码
    （输入：需求 + 检索到的代码上下文 + 项目规范）
             │
             ▼
    [HTTP 工具] terraform fmt + validate
             │
             ▼
    [IF/ELSE] 验证通过？
    │              │
    ▼              ▼
 [HTTP 工具]    [返回 UI]
 Git 提交+PR    "验证失败，请修改"
    │
    ▼
 [返回 UI]
 PR 链接 + 代码预览
```

**开发步骤**：

```bash
# 阶段 1：部署 Dify + 搭建后端（2 周）
git clone https://github.com/langgenius/dify
cd dify/docker && docker compose up -d

# 搭建 Python 后端
mkdir iac-agent-backend && cd iac-agent-backend
pip install fastapi uvicorn gitpython

# 开发后端 API：
# - POST /api/analyze-repo    分析仓库结构
# - POST /api/generate-code   生成 IaC 代码
# - POST /api/validate-code   验证代码
# - POST /api/commit-to-git   提交到 Git

# 阶段 2：在 Dify 中配置（1 周）
# 1. 创建知识库 → 导入已有 IaC 代码（向量化）
# 2. 创建自定义 HTTP 工具 → 指向后端 API
# 3. 设计工作流 → 串联 RAG + 工具 + LLM
# 4. 测试 → 在 Dify UI 中测试效果

# 阶段 3：开发自定义前端（2 周）
# 1. React 前端 → 调用 Dify API
# 2. 需求输入表单
# 3. 任务状态追踪（轮询 Dify API）
# 4. 代码预览 + 编辑
# 5. PR 链接展示

# 阶段 4：生产化（2 周）
# 1. 高可用部署（K8s）
# 2. 权限控制
# 3. 监控告警
# 4. 性能优化
```

---

#### 方案 B：基于 n8n（集成优先）

```
┌──────────────────────────────────────────────────────────────┐
│  IaC Agent — 基于 n8n                                         │
│                                                              │
│  ┌─────────────┐     ┌─────────────────────────────────────┐│
│  │  自定义 UI   │────▶│  n8n Webhook（接收请求）              ││
│  │  (React)    │◀────│  ├─ AI Agent 节点（LLM + 工具调用）   ││
│  │             │     │  ├─ GitHub 节点（Git 操作）           ││
│  │             │     │  ├─ HTTP Request（调用后端）           ││
│  │             │     │  ├─ Code 节点（自定义逻辑）            ││
│  │             │     │  └─ 通知节点（Slack/钉钉/邮件）        ││
│  └─────────────┘     └─────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  自研 RAG 服务（独立部署）                                  ││
│  │  ├─ 代码索引（向量化已有 IaC 代码）                         ││
│  │  ├─ 检索 API（相似代码检索）                                ││
│  │  └─ 向量数据库（pgvector / Qdrant）                        ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**适用场景**：
- 团队以 TypeScript/Node.js 为主
- 需要大量外部系统集成（GitHub/GitLab/Slack/云 API）
- RAG 可以接受自建（不需要内置 RAG）

---

#### 方案 C：Dify + n8n 组合（企业级）

```
┌──────────────────────────────────────────────────────────────┐
│  IaC Agent — Dify + n8n 组合                                  │
│                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌──────────────┐  │
│  │  自定义 UI   │────▶│  Dify       │────▶│  n8n          │  │
│  │  (React)    │◀────│  (Agent+RAG)│◀────│  (自动化编排)  │  │
│  │             │     │             │     │              │  │
│  │             │     │  ├─ RAG     │     │  ├─ GitHub   │  │
│  │             │     │  ├─ Agent   │     │  ├─ Jenkins  │  │
│  │             │     │  ├─ LLM     │     │  ├─ 云 API    │  │
│  │             │     │  └─ 知识库   │     │  ├─ Slack    │  │
│  └─────────────┘     └─────────────┘     └──────────────┘  │
│                                                              │
│  分工：                                                      │
│  - Dify 负责：Agent 编排 + RAG 检索 + LLM 代码生成            │
│  - n8n 负责：Git 操作 + CI/CD 触发 + 通知 + 云服务调用         │
│  - 自研后端负责：仓库分析 + 代码验证 + 业务逻辑                │
│                                                              │
│  连接方式：                                                   │
│  - Dify MCP Server → n8n Webhook                             │
│  - 或 Dify HTTP 工具 → n8n Webhook                           │
│  - 或 n8n → Dify API（反向调用）                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 快速对比总结

| 维度 | Dify | n8n | Dify + n8n |
|------|------|-----|-----------|
| **Agent 能力** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **RAG 能力** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **自定义工具** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **集成能力** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Git 操作** | ⚠️ 自定义 | ✅ 原生 | ✅ 原生 |
| **部署复杂度** | 中等 | 简单 | 较高 |
| **学习曲线** | 中等 | 低 | 较高 |
| **二次开发** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **适合团队** | Python 全栈 | TypeScript 全栈 | 多语言团队 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

### 实施建议

#### 1. 快速验证（1-2 周）

```bash
# 部署 Dify
git clone https://github.com/langgenius/dify
cd dify/docker && docker compose up -d

# 在 Dify 中快速验证 IaC Agent 可行性：
# 1. 创建知识库 → 上传几个 Terraform 文件
# 2. 创建 HTTP 工具 → 指向一个简单的 Python 后端
# 3. 设计工作流 → 用户输入 → RAG 检索 → LLM 生成 → 返回结果
# 4. 测试：输入 "创建一个 ECS 实例" → 观察生成的代码质量
```

#### 2. 核心开发（4-6 周）

```
开发清单：
□ 自研 Python 后端（仓库分析、代码生成、验证、Git 操作）
□ Dify 工作流设计和调试
□ 自定义工具/API 开发
□ 知识库构建（已有 IaC 代码向量化）
□ 自定义前端开发（React/Vue）
```

#### 3. 生产化（2-4 周）

```
生产化清单：
□ K8s 部署（高可用）
□ 权限控制（RBAC）
□ 监控告警（Prometheus + Grafana）
□ 日志收集（ELK / Loki）
□ 安全加固（HTTPS、认证、审计日志）
□ 性能优化（缓存、异步、资源配额）
□ 代码质量跟踪（生成成功率、验证通过率）
```

---

### 参考

- [Dify GitHub](https://github.com/langgenius/dify) — 154k+ ⭐
- [n8n GitHub](https://github.com/n8n-io/n8n) — 203k+ ⭐
- [FastGPT GitHub](https://github.com/labring/FastGPT) — 29k+ ⭐
- [Langflow GitHub](https://github.com/langflow-ai/langflow) — 50k+ ⭐
- [RagFlow GitHub](https://github.com/infiniflow/ragflow) — 35k+ ⭐
- [MaxKB GitHub](https://github.com/1Panel-dev/MaxKB) — 15k+ ⭐
- [Flowise GitHub](https://github.com/FlowiseAI/Flowise) — 55k+ ⭐
- [Coze Studio GitHub](https://github.com/coze-dev/coze-studio) — 21k+ ⭐
- [Dify Tools 文档](https://docs.dify.ai/guides/application-orchestrate/tools)
- [Dify Plugin SDK](https://docs.dify.ai/plugins)
- [Dify MCP Server 集成](https://dify.ai/blog/turn-your-dify-app-into-an-mcp-server)
- [低代码 Agent 平台对比](https://www.agentlist.top/en/articles/low-code-agent-platforms-dify-n8n-comparison/)
- [n8n vs Dify 深度对比](https://levelup.gitconnected.com/n8n-vs-dify-a-deep-comparison-for-developers-who-actually-build-things-772e9cf29c34)
