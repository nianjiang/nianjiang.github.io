---
weight: 11
title: "IaC Agent"
---

## 通过自然语言生成 Infrastructure as Code

> **核心场景**：运维工程师通过 UI 界面提交自然语言需求，后端自动生成符合项目规范的 IaC 代码并提交到 Git 仓库。
>
> **技术栈**：LLM + RAG（检索增强生成）+ Git + CI/CD

---

### 完整解决方案架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI 界面（Web）                              │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  需求提交     │  │  任务状态     │  │  代码预览     │           │
│  │              │  │              │  │              │           │
│  │ · 选择项目   │  │ · 排队中     │  │ · 生成的 .tf │           │
│  │ · 自然语言   │  │ · 生成中     │  │ · Diff 对比  │           │
│  │   描述需求   │  │ · 验证中     │  │ · 一键复制   │           │
│  │ · 选择环境   │  │ · 待审批     │  │              │           │
│  │ · 提交       │  │ · 已合并     │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      后端服务（API Server）                        │
│                                                                   │
│  1. 接收需求                                                     │
│     ├─ 解析自然语言需求                                           │
│     ├─ 识别目标项目（新/旧）                                      │
│     └─ 确定代码结构                                               │
│                                                                   │
│  2. 仓库分析                                                     │
│     ├─ 克隆项目仓库                                               │
│     ├─ 提取上下文（modules/variables/tags）                       │
│     └─ 向量化存储（RAG）                                          │
│                                                                   │
│  3. 代码生成                                                     │
│     ├─ 检索相关代码片段                                           │
│     ├─ 调用 LLM 生成代码（带上下文）                              │
│     └─ 格式化 + 路径规划                                          │
│                                                                   │
│  4. 验证与集成                                                    │
│     ├─ terraform fmt / validate / tflint / checkov                │
│     ├─ 创建 Git 分支                                              │
│     ├─ 提交代码                                                   │
│     └─ 创建 Pull Request                                          │
│                                                                   │
│  5. 状态更新                                                     │
│     └─ 更新 UI 任务状态 + 通知运维工程师                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Git 仓库（按项目区分）                         │
│                                                                   │
│  project-a-infra/          project-b-infra/        new-project/  │
│  ├─ modules/               ├─ modules/             ├─ modules/   │
│  ├─ environments/          ├─ environments/        ├─ environments/ │
│  ├─ variables.tf           ├─ variables.tf         ├─ variables.tf │
│  └─ ...                    └─ ...                  └─ ...        │
└─────────────────────────────────────────────────────────────────┘
```

---

### 核心需求场景

#### 场景 1：已有项目，添加资源

```
运维工程师操作：
① UI 界面选择项目："project-a"
② 输入需求：
   "为生产环境添加 Redis 集群，3 节点，启用持久化，
    使用与现有 VPC 相同的网络配置"
③ 选择环境："production"
④ 点击"提交"

后端处理：
① 克隆 project-a-infra 仓库
② 分析现有结构（modules/vpc、modules/common）
③ 提取上下文（变量、标签、命名规范）
④ 生成 modules/redis/ 代码
⑤ 创建分支 feature/add-redis-cluster
⑥ 提交代码 + 创建 PR
⑦ UI 显示："代码已生成，PR #42 已创建，等待审批"

运维工程师后续操作：
① 查看生成的代码（UI 预览）
② Review PR
③ 批准 + 合并
④ CI/CD 自动执行 terraform plan
⑤ 确认后执行 terraform apply
```

#### 场景 2：新项目，创建仓库

```
运维工程师操作：
① UI 界面选择项目："新建项目"
② 输入项目名称："project-x"
③ 输入需求：
   "VPC + 3 层架构（web/app/db）+ EKS 集群 + RDS PostgreSQL"
④ 点击"提交"

后端处理：
① 从模板仓库创建 project-x-infra
② 初始化项目结构（modules/、environments/）
③ 生成所有模块代码（VPC、EKS、RDS）
④ 验证 + 提交
⑤ UI 显示："项目已创建，代码已提交，PR #1 已创建"

运维工程师后续操作：
① 查看生成的完整代码
② Review + 合并
③ 执行 terraform apply
④ 基础设施就绪，开始使用
```

---

### 技术实现方案

#### 方案 A：自研 Web 应用 + RAG（推荐）

**技术栈**：

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| **前端** | React / Vue | Web UI（需求提交、状态查看、代码预览） |
| **后端** | Python (FastAPI) / Go | API Server（业务逻辑、Git 操作） |
| **数据库** | PostgreSQL | 存储任务、项目、用户信息 |
| **向量数据库** | ChromaDB / Pinecone | 存储代码片段（RAG） |
| **LLM** | OpenAI / Claude / 本地模型 | 代码生成 |
| **MCP Server** | Terraform MCP Server | Provider 文档 |
| **Git** | GitHub / GitLab API | 仓库操作 |
| **CI/CD** | GitHub Actions / GitLab CI | 自动化验证和部署 |

**核心代码示例**：

```python
# backend/main.py
from fastapi import FastAPI, BackgroundTasks
from git import Repo
from langchain import OpenAI, VectorStore
from terraform import validate, format_code

app = FastAPI()

@app.post("/api/generate")
async def generate_iac(request: IaCRequest, background_tasks: BackgroundTasks):
    # 1. 创建任务
    task = Task.create(
        project=request.project,
        prompt=request.prompt,
        environment=request.environment,
        status="pending"
    )
    
    # 2. 后台处理
    background_tasks.add_task(
        process_request,
        task_id=task.id,
        prompt=request.prompt,
        project=request.project,
        is_new_project=request.is_new_project
    )
    
    return {"task_id": task.id, "status": "pending"}

async def process_request(task_id: str, prompt: str, project: str, is_new_project: bool):
    try:
        # 更新状态
        Task.update(task_id, status="processing")
        
        if is_new_project:
            # 新项目：创建仓库
            repo = create_new_repo(project)
        else:
            # 已有项目：克隆仓库
            repo = clone_repo(project)
        
        # 分析仓库结构
        context = analyze_repo(repo)
        
        # RAG：检索相关代码
        relevant_code = vector_store.search(prompt, filter={"repo": project})
        
        # 生成代码
        generated_code = llm.generate(
            prompt=f"""
            基于以下上下文生成 Terraform 代码：
            
            需求：{prompt}
            
            项目结构：
            {context.structure}
            
            相关代码示例：
            {relevant_code}
            
            标签规范：
            {context.tags}
            
            变量定义：
            {context.variables}
            """
        )
        
        # 验证
        format_code(generated_code)
        validate(generated_code)
        
        # 提交到 Git
        branch = f"feature/{generate_branch_name(prompt)}"
        commit_to_repo(repo, generated_code, branch)
        pr = create_pull_request(repo, branch, prompt)
        
        # 更新状态
        Task.update(task_id, status="completed", pr_url=pr.url)
        
        # 通知
        notify_user(task_id, "代码已生成", pr_url=pr.url)
        
    except Exception as e:
        Task.update(task_id, status="failed", error=str(e))
        notify_user(task_id, "生成失败", error=str(e))

def analyze_repo(repo_path):
    """提取仓库上下文"""
    return {
        "structure": get_directory_tree(repo_path),
        "modules": find_terraform_modules(repo_path),
        "variables": extract_variables(repo_path),
        "tags": extract_tag_patterns(repo_path),
        "providers": extract_provider_config(repo_path),
    }
```

**前端组件**：

```jsx
// frontend/GenerateForm.jsx
function GenerateForm() {
  const [project, setProject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [environment, setEnvironment] = useState("dev");
  const [status, setStatus] = useState(null);
  
  const handleSubmit = async () => {
    const response = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        project,
        prompt,
        environment,
        is_new_project: project === "new"
      })
    });
    
    const { task_id } = await response.json();
    
    // 轮询状态
    pollStatus(task_id);
  };
  
  const pollStatus = async (task_id) => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/task/${task_id}`);
      const data = await response.json();
      
      setStatus(data.status);
      
      if (data.status === "completed") {
        clearInterval(interval);
        showCodePreview(data.pr_url);
      }
    }, 2000);
  };
  
  return (
    <div>
      <select value={project} onChange={e => setProject(e.target.value)}>
        <option value="new">新建项目</option>
        <option value="project-a">Project A</option>
        <option value="project-b">Project B</option>
      </select>
      
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="描述你的基础设施需求..."
      />
      
      <select value={environment} onChange={e => setEnvironment(e.target.value)}>
        <option value="dev">开发环境</option>
        <option value="staging">预发布环境</option>
        <option value="prod">生产环境</option>
      </select>
      
      <button onClick={handleSubmit}>生成代码</button>
      
      {status && <TaskStatus status={status} />}
    </div>
  );
}
```

#### 方案 B：开源工具组合（快速验证）

**工具组合**：

```
UI 界面：Streamlit / Gradio（快速原型）
代码生成：aiac（Firefly 开源）
仓库操作：GitPython
MCP：Terraform MCP Server
CI/CD：GitHub Actions
```

**[Streamlit](https://streamlit.io/) 示例**：

```python
# streamlit_app.py
import streamlit as st
import subprocess
from git import Repo

st.title("IaC Code Generator")

# 项目选择
project = st.selectbox(
    "选择项目",
    ["新建项目", "project-a", "project-b", "project-c"]
)

# 环境选择
environment = st.selectbox(
    "选择环境",
    ["dev", "staging", "prod"]
)

# 需求输入
prompt = st.text_area(
    "描述你的基础设施需求",
    placeholder="创建一个 VPC + 3 层架构 + RDS 数据库"
)

# 提交按钮
if st.button("生成代码"):
    with st.spinner("正在生成..."):
        
        if project == "新建项目":
            # 创建新仓库
            repo_path = create_new_repo("new-project-infra")
        else:
            # 克隆现有仓库
            repo_path = clone_repo(f"{project}-infra")
        
        # 使用 aiac 生成代码
        result = subprocess.run(
            ["aiac", "get", "terraform", prompt],
            capture_output=True,
            text=True
        )
        
        generated_code = result.stdout
        
        # 验证
        subprocess.run(["terraform", "fmt"], cwd=repo_path)
        
        # 提交
        repo = Repo(repo_path)
        repo.index.add(["generated.tf"])
        repo.index.commit(f"feat: {prompt}")
        
        st.success("✅ 代码已生成并提交！")
        
        # 显示代码
        st.code(generated_code, language="hcl")
        
        # 显示 Git 信息
        st.info(f"仓库：{repo_path}")
        st.info(f"分支：{repo.active_branch}")
```

#### 方案 C：企业级平台（全功能）

**平台组成**：

| 组件 | 开源工具 | 商业工具 |
|------|---------|---------|
| **UI** | 自研（React） | Port（内部开发者平台） |
| **后端** | 自研（Python/Go） | Spacelift / env0 |
| **代码生成** | aiac + TerraFormer | Pulumi Neo / StackGen |
| **RAG** | LangChain + ChromaDB | Pinecone + 向量搜索 |
| **Git** | GitHub / GitLab | 同左 |
| **CI/CD** | GitHub Actions | ArgoCD / Spacelift |
| **监控** | Prometheus + Grafana | Datadog |

**部署架构**：

```yaml
# docker-compose.yml
version: "3.8"

services:
  # UI 前端
  frontend:
    image: iac-generator-frontend:latest
    ports:
      - "3000:3000"
  
  # 后端 API
  backend:
    image: iac-generator-backend:latest
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - DATABASE_URL=postgresql://user:pass@db:5432/iac
    depends_on:
      - db
      - vector_db
  
  # PostgreSQL
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  # 向量数据库
  vector_db:
    image: chromadb/chroma:latest
    volumes:
      - vector_data:/chroma
  
  # Terraform MCP Server
  mcp_server:
    image: hashicorp/terraform-mcp-server:latest
    environment:
      - PROVIDERS=aws,alicloud,azurerm

volumes:
  postgres_data:
  vector_data:
```

---

### 关键技术点

#### 1. RAG（检索增强生成）

```python
# 向量化代码仓库
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma

embeddings = OpenAIEmbeddings()
vector_store = Chroma(embedding_function=embeddings)

# 索引所有仓库代码
for repo in ["project-a", "project-b", "project-c"]:
    repo_path = f"/repos/{repo}-infra"
    
    for tf_file in find_terraform_files(repo_path):
        code = read_file(tf_file)
        
        # 生成嵌入向量
        embedding = embeddings.embed_documents([code])
        
        # 存储到向量数据库
        vector_store.add_texts(
            texts=[code],
            metadatas=[{
                "repo": repo,
                "file": tf_file,
                "type": classify_file(tf_file)  # module/variable/resource
            }]
        )

# 检索相关代码
def retrieve_context(prompt: str, project: str):
    results = vector_store.similarity_search(
        query=prompt,
        k=5,
        filter={"repo": project}
    )
    return [doc.page_content for doc in results]
```

#### 2. 智能路径规划

```python
def determine_file_path(prompt: str, repo_structure: dict) -> str:
    """根据项目结构智能决定文件路径"""
    
    resource_type = extract_resource_type(prompt)  # redis, vpc, eks, etc.
    
    # 模式 1：模块化结构
    if "modules/" in repo_structure:
        return f"modules/{resource_type}/main.tf"
    
    # 模式 2：环境分层
    elif "environments/" in repo_structure:
        return f"environments/prod/{resource_type}.tf"
    
    # 模式 3：平铺结构
    else:
        return f"{resource_type}.tf"
```

#### 3. 代码风格一致性

```python
def ensure_style_consistency(generated_code: str, existing_code: str):
    """确保生成代码符合项目风格"""
    
    # 1. 提取标签模式
    tag_pattern = extract_tag_pattern(existing_code)
    generated_code = apply_tag_pattern(generated_code, tag_pattern)
    
    # 2. 提取命名约定
    naming_convention = extract_naming_convention(existing_code)
    generated_code = apply_naming_convention(generated_code, naming_convention)
    
    # 3. 提取变量引用
    var_pattern = extract_variable_pattern(existing_code)
    generated_code = apply_variable_pattern(generated_code, var_pattern)
    
    return generated_code

def extract_tag_pattern(code: str):
    """提取标签模式"""
    # 例如：tags = { env = "prod", team = "devops", project = "..." }
    return re.search(r'tags\s*=\s*\{[^}]+\}', code)
```

#### 4. Git 操作自动化

```python
from git import Repo
import github

def commit_and_create_pr(
    repo_path: str,
    generated_code: str,
    file_path: str,
    branch_name: str,
    prompt: str
):
    """提交代码并创建 PR"""
    
    # 1. 克隆仓库
    repo = Repo(repo_path)
    
    # 2. 创建分支
    repo.git.checkout("-b", branch_name)
    
    # 3. 写入文件
    full_path = os.path.join(repo_path, file_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(generated_code)
    
    # 4. 添加 + 提交
    repo.index.add([file_path])
    repo.index.commit(f"feat: {prompt}")
    
    # 5. 推送
    repo.git.push("origin", branch_name)
    
    # 6. 创建 PR（GitHub API）
    g = github.Github(os.environ["GITHUB_TOKEN"])
    gh_repo = g.get_repo(repo.remote().url.split("github.com/")[1].replace(".git", ""))
    pr = gh_repo.create_pull(
        title=f"Add {extract_resource_type(prompt)}",
        body=f"Generated from natural language:\n\n{prompt}",
        head=branch_name,
        base="main"
    )
    
    return pr.html_url
```

---

### 开源工具对比

| 工具 | 类型 | 协议 | 特点 | 适用场景 |
|------|------|------|------|---------|
| **[aiac](https://github.com/gofireflyio/aiac)** | CLI + Go 库 | Apache-2.0 | 多 LLM 后端，支持多种 IaC | 快速原型，脚本化 |
| **[aliyun/iac-code](https://github.com/aliyun/iac-code)** | CLI | 开源 | 阿里云优化，ROS 支持 | 阿里云场景 |
| **[salami](https://github.com/jackos/salami)** | 编译器 | 开源 | GPT-4，文档式定义 | 简单场景 |
| **[TerraFormer](https://github.com/terramate-io/terraformer)** | 微调 LLM | 研究项目 | ICSE 2026，验证器反馈 | 学术研究，本地部署 |
| **[Terraform MCP Server](https://github.com/hashicorp/terraform-mcp-server)** | MCP Server | MPL-2.0 | 官方 Provider 文档 | 集成到 AI 助手 |
| **[Pulumi Neo](https://www.pulumi.com/product/neo/)** | AI Agent | 商业 | 端到端，多云 | 企业级，Pulumi 生态 |
| **[StackGen](https://stackgen.com/)** | Agent 平台 | 商业 | 自主基础设施平台 | 企业级，全自动化 |
| **[Spacelift Intent](https://spacelift.io/)** | 无代码 | 商业 | 自然语言配置 | 非技术人员自助服务 |

---

### 实施路线图

#### 阶段 1：MVP（1-2 周）

```
目标：验证核心流程

技术栈：
- UI：Streamlit（快速原型）
- 代码生成：aiac
- Git：GitPython
- 部署：Docker

功能：
✓ 提交自然语言需求
✓ 生成 IaC 代码
✓ 提交到 Git
✓ 显示代码预览

限制：
✗ 无上下文学习（不使用 RAG）
✗ 无项目识别（手动选择）
✗ 无验证（需手动 terraform validate）
```

#### 阶段 2：RAG 集成（2-4 周）

```
目标：基于现有代码生成

新增功能：
✓ 向量数据库（ChromaDB）
✓ 代码向量化（嵌入）
✓ RAG 检索（相关代码片段）
✓ 上下文注入（变量、标签、模块）
✓ 智能路径规划（根据项目结构）

技术栈：
- 向量数据库：ChromaDB / Pinecone
- RAG 框架：LangChain / LlamaIndex
- LLM：OpenAI / Claude
```

#### 阶段 3：企业级功能（4-8 周）

```
目标：生产就绪

新增功能：
✓ 用户认证 + 权限控制
✓ 任务队列（Celery / RabbitMQ）
✓ 审批工作流（PR review）
✓ CI/CD 集成（GitHub Actions）
✓ 通知系统（Slack / Email）
✓ 审计日志
✓ 监控告警（Prometheus + Grafana）

技术栈：
- 后端：FastAPI / Django
- 数据库：PostgreSQL
- 缓存：Redis
- 队列：Celery
- 监控：Prometheus + Grafana
```

#### 阶段 4：高级功能（持续迭代）

```
目标：智能化 + 自动化

高级功能：
⚡ 自动执行 terraform plan（CI/CD 中）
⚡ 成本估算（Infracost）
⚡ 安全扫描（checkov / tfsec）
⚡ 多环境支持（dev/staging/prod 自动同步）
⚡ 漂移检测（自动发现手动变更）
⚡ AI 辅助 Review（自动审查 PR）
```

---

### 最佳实践

1. **模板仓库**：建立标准化的项目模板（结构、模块、变量）
2. **代码索引**：将所有仓库代码向量化，支持 RAG 检索
3. **渐进式采用**：从内部工具开始，逐步开放给更多用户
4. **人工审查必须**：AI 生成的代码必须经过 PR review
5. **验证流程**：`terraform fmt` → `validate` → `tflint` → `checkov` → `plan`
6. **版本控制**：所有生成的代码提交到 Git，保留完整历史
7. **成本控制**：LLM API 调用有成本，建议批量处理
8. **安全扫描**：集成 `tfsec` / `checkov` 检查安全漏洞
9. **监控告警**：监控生成失败率、API 成本、任务延迟
10. **持续学习**：收集用户反馈，持续改进生成质量

---

### 参考

- [aiac（Firefly 开源）](https://github.com/gofireflyio/aiac)
- [aliyun/iac-code](https://github.com/aliyun/iac-code)
- [salami（自然语言编译器）](https://github.com/petrgazarov/salami)
- [Terraform MCP Server](https://github.com/hashicorp/terraform-mcp-server)
- [Pulumi Neo](https://www.pulumi.com/product/neo/)
- [TerraFormer 论文（ICSE 2026）](https://arxiv.org/abs/2601.08734)
- [StackGen AIP](https://stackgen.com/)
- [Spacelift Intent](https://spacelift.io/)
- [LangChain RAG 文档](https://python.langchain.com/docs/use_cases/question_answering/)
- [ChromaDB 向量数据库](https://docs.trychroma.com/)
