---
weight: 82
title: "Vibe Coding"
---

# Vibe Coding 与 Agent 工程常用名词

一句话版本：**Vibe Coding 是"用自然语言描述意图、不逐行审阅生成结果"的编码方式；AGENTS.md、Skills、MCP、Hooks 是让这种方式在真实工程里不失控的四个支点。**

---

## 一、Vibe Coding 是什么

2025 年 2 月，Andrej Karpathy 在推文里造了这个词：

> There's a new kind of coding I call "vibe coding", where you fully give in to the vibes, embrace exponentials, and forget that the code even exists.

操作形态很具体：

1. 用自然语言描述想要什么（"给这个表单加个导出 Excel 的按钮"）；
2. 让模型生成，**不逐行读代码**，直接运行；
3. 报错了就把错误信息贴回去，继续让它改；
4. 循环直到"看起来能用了"。

所以 Vibe Coding 的本质不是"用了 AI"，而是**把理解责任整体转移给了模型**。这也是它的适用边界所在——它天然适合一次性的、可丢弃的、错了也没人付代价的产出。

### 1.1 与相邻概念的边界

| 说法 | 谁在主导 | 是否要求人理解结果 | 典型场景 |
| :--- | :--- | :--- | :--- |
| 代码补全（Completion） | 人写，模型补 | 是（人仍在写） | 日常编码 |
| **Vibe Coding** | 模型 | **否** | 周末玩具、原型、一次性脚本、内部小工具 |
| AI 辅助工程（AI-assisted engineering） | 人定方向，模型执行 | 是（评审 + 测试 + 提交） | 生产代码 |
| Agentic Coding | 模型自主规划、调工具、迭代 | 是（人守门禁） | 需求明确的中等任务 |
| Spec-driven（规格驱动） | 规格先行，模型按契约实现 | 是（规格需评审） | 有验收标准的交付 |

> 关键区分：Vibe Coding 和"AI 辅助工程"用的是同一批工具，**差别在有没有人承担理解和验证的责任**，不在模型强弱。

### 1.2 现实中的位置

业界常说的 **"70% 问题"**（Addy Osmani）：AI 能很快把功能做到七八成，剩下那两三成——边界条件、错误路径、与遗留系统的兼容、并发与权限——反而是成本最高、最需要人判断的部分。Vibe Coding 的策略是"不去碰那 30%"，所以它止步于不进入主干、不上生产的场景。

反过来，一旦 Vibe Coding 的产出要进入生产，它就自动升级成"AI 辅助工程"，必须补齐四件事：**可读的意图（指令文件）、可复用的流程（Skills）、可拦截的规则（Hooks/CI）、可追溯的证据（评审与测试）**。后面的名词都围绕这四件事。

---

## 二、名词地图（先看全局）

Agent 工程的名词看起来零散，其实是六层结构。按层记，比按首字母背词典有效得多：

| 层 | 解决的问题 | 代表名词 |
| :--- | :--- | :--- |
| ① 指令层 | 模型怎么知道"我们这儿怎么干活" | `AGENTS.md`、Rules、Memory |
| ② 能力层 | 怎么把一套流程打包复用 | Skill、Plugin、Command、Subagent |
| ③ 上下文层 | 该给它看什么、看多少 | Context Engineering、RAG、代码索引、Repo Wiki、Compaction |
| ④ 工具层 | 怎么连到外部系统 | MCP、Connector、Tool Use |
| ⑤ 执行层 | 在哪儿跑、能跑多野 | Agent Loop、Sandbox、Permission Mode、Worktree、Plan/Goal Mode |
| ⑥ 治理层 | 出事能不能拦住、事后能不能说清 | Hook、Guardrail、Evals、Audit Log、Metrics |

一句话串起来：**指令层定规矩，能力层给方法，上下文层给材料，工具层给手脚，执行层给场地，治理层给刹车。**

---

## 三、指令层

### 3.1 AGENTS.md

**是什么**：放在仓库根目录的一个 Markdown 文件，写给"AI 编码 Agent"看的 README——构建命令、测试怎么跑、代码规范、禁区。

- **起源**：2025 年 8 月由 OpenAI 发布，与 Amp、Google Jules、Cursor、Factory 等共同推动；现由 Linux 基金会下的 **Agentic AI Foundation（AAIF）**托管（2025-12-09 成立，同期接收 MCP 等项目）。
- **没有必填字段**：就是普通 Markdown，标题随便起，Agent 直接解析文本。
- **就近优先**：大型 monorepo 可以放多份，Agent 读**离被改文件最近**的那份，子项目可以各自定制。GitHub 上已有 6 万+ 个 `AGENTS.md` 实例。
- **实测生态**：Codex、Jules、Cursor、VS Code、Copilot coding agent、Gemini CLI、Windsurf、Zed、Aider、goose、Amp、Devin、Junie、Qoder 等均已支持。

**常见等价物**（同一层的不同方言，迁移时先查清优先级）：

| 文件 / 目录 | 工具 |
| :--- | :--- |
| `AGENTS.md` | Codex、Cursor、Copilot、Gemini CLI、Qoder、Zed、Amp… |
| `CLAUDE.md` | Claude Code |
| `.cursor/rules/*.mdc` | Cursor（早期 `.cursorrules`） |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.qoder/rules/` | Qoder IDE（与 `AGENTS.md` 同时生效，**冲突时 Rules 优先**，全部规则合计上限 10 万字符） |
| `GEMINI.md` | Gemini CLI（可配置改用 `AGENTS.md`） |

**一份能用的模板**（原则：命令要能直接跑、约束要能判定对错、别写理念）：

```markdown
# AGENTS.md

## 项目速览
- 服务：订单中心（Java 21 / Spring Boot 3），单仓库多模块
- 入口：src/main/java/com/acme/order/Application.java

## 构建与测试
- 编译：./mvnw -q compile
- 单测：./mvnw -q test -Dtest=<Class>#<method>
- 提交前必须全绿：./mvnw -q verify

## 编码约定
- 禁止字符串拼接 SQL，统一走参数绑定
- 对外接口必须带显式鉴权注解
- 日志禁止输出手机号、身份证号、token

## 禁区
- 不改 db/migration/ 下已发布的迁移脚本（只能新增文件）
- 不直连生产库；需要数据用 scripts/sandbox-db.sh

## 交付要求
- 每个改动附单测；PR 标题格式 `[order] <摘要>`
```

### 3.2 Rules / Instructions / Memory：三个容易混的东西

| 概念 | 作用域 | 生命周期 | 谁写 |
| :--- | :--- | :--- | :--- |
| Instructions（`AGENTS.md`） | 仓库 | 长期，随代码版本化 | 团队 |
| Rules（`.qoder/rules`、`.cursor/rules`） | 仓库，可按文件通配或场景触发 | 长期 | 团队 |
| Memory | 个人（全局）或项目 | 跨会话累积，可随时清空 | 模型 + 人 |

判断标准：**"换个人来做也该一样" → 写进 Instructions/Rules；"只对我这个人成立" → 留在 Memory**。三者的通病都是越写越长，而规则文件通常有硬上限（Qoder 是 10 万字符，超出截断），所以长文档应该进知识库，不进规则文件。

---

## 四、能力层

### 4.1 Skill / SKILL.md

**是什么**：把"一类任务的干法"打包成可复用的能力包。最小形态就是一个目录 + 一个 `SKILL.md`。

```text
code-review/
├── SKILL.md          # 必需：YAML frontmatter + 指令正文
├── scripts/          # 可选：可执行脚本
├── references/       # 可选：按需加载的参考资料
└── assets/           # 可选：模板、图片、查表数据
```

**frontmatter 字段**（开放标准规定）：

| 字段 | 必需 | 约束 |
| :--- | :---: | :--- |
| `name` | ✓ | ≤64 字符，小写字母/数字/连字符，不能首尾连字符、不能连续连字符，**必须与父目录同名** |
| `description` | ✓ | ≤1024 字符，写清"做什么 + 什么时候用"，含关键触发词 |
| `license` | — | 许可证名或指向随包 LICENSE |
| `compatibility` | — | ≤500 字符，声明环境要求（依赖包、网络等） |
| `metadata` | — | 任意字符串键值对（作者、版本等） |
| `allowed-tools` | — | 空格分隔的预授权工具列表（实验性，各实现支持不一） |

**核心机制：渐进式披露（Progressive Disclosure）**

| 阶段 | 加载内容 | 成本量级 |
| :--- | :--- | :--- |
| 发现 | 所有 Skill 的 `name` + `description` | ~100 token / 个 |
| 激活 | 命中后读完整 `SKILL.md` 正文 | <5000 token 建议值 |
| 执行 | 按需读 `references/`、跑 `scripts/` | 用到才算 |

这就是 Skill 能"装很多但只花很少上下文"的原因。也正因如此，**`description` 是 Skill 唯一的分发入口**——写得含糊，Skill 就永远不会被选中。

**Skill 与 AGENTS.md 的分工**：

| | `AGENTS.md` | Skill |
| :--- | :--- | :--- |
| 加载时机 | 会话开始常驻 | 命中描述时才加载 |
| 内容性质 | 声明式约束（"必须/禁止"） | 过程式流程（"第一步…第二步…"） |
| 适合放 | 编码规范、构建命令、禁区 | 发布检查单、故障排查、特定文档生成 |
| 体积 | 越小越有效 | 可带脚本与资料，按需展开 |

判断标准：**"任何时候都成立的规矩" → `AGENTS.md`；"只在做某类任务时才需要的步骤" → Skill。**

### 4.2 Plugin

**是什么**：比 Skill 更大的可分发包，一个 Plugin 里可以同时装 Skills、Commands、MCP Server 配置、Rules、Hooks。企业场景里 Plugin 是"能力分发"的单位——Qoder 的私有市场里，Skill 走 Skill 市场，Plugin 以 Expert Kit 形式出现，ZIP 根目录需带 `.qoder-plugin/`（Skill 包则要求根目录有 `SKILL.md`）。

### 4.3 Command

用 `/` 唤起的一段固化流程（`/review`、`/gen-test`）。Skill 是"模型自己判断要不要用"，Command 是"人明确要求执行"，前者省心、后者确定。

### 4.4 Subagent 与 Agent Team

- **Subagent**：拥有独立上下文窗口、独立提示词、独立工具集的子 Agent。价值在于**上下文隔离**——让"搜索资料"这类脏活在自己窗口里爆掉，只把结论带回主线程。
- **Agent Team**：多个专门角色 + 一个 lead 协调。价值在于把"执行"和"检查"分给互不可见的两个 Agent，避免自己给自己判卷。

---

## 五、上下文层

### 5.1 Context Engineering（上下文工程）

Prompt Engineering 解决"怎么问"，Context Engineering 解决"给它看什么"。四类上下文策略：

| 策略 | 说明 | 例子 |
| :--- | :--- | :--- |
| 常驻（Resident） | 每次都在 | `AGENTS.md`、硬约束 |
| 按需检索（Retrieved） | 命中才召回 | 知识库、Repo Wiki |
| 角色隔离（Isolated） | 只在某个 Subagent 内可见 | 搜索 Agent 的中间结果 |
| 阶段产物（Settled） | 落盘成文件，后续按路径引用 | 需求契约、影响面清单 |

配套经验：**Agent 之间传路径而不是传内容**（pass paths, not payloads），否则上下文会被同一份材料反复占满。

### 5.2 RAG / 代码索引 / Repo Wiki

- **RAG**：检索增强生成，先向量检索再把片段塞进上下文。
- **代码索引（Codebase Indexing）**：对仓库做嵌入或符号索引，让"这个函数谁在调"不用全仓 grep。
- **Repo Wiki / Knowledge Card**：把仓库结构与约定**预生成成人可读的知识**（架构、模块职责、技术栈、命令），既给人看也喂给 Agent。相比临时 RAG，它的优势是稳定、可评审、可版本化。

### 5.3 Compaction（上下文压缩）

会话太长时的自动摘要。代价是**细节会丢**，所以关键约束必须落在文件里（`AGENTS.md`/Skill），不能只存在于对话中——对话会被压缩，文件不会。

### 5.4 Memory

跨会话的长期记忆。分静态（`AGENTS.md`）与自动（模型自己提炼的偏好与项目背景）。硬规矩：**不存密码、验证码、API Key、临时任务状态**。

---

## 六、工具层

### 6.1 MCP（Model Context Protocol）

Anthropic 于 2024 年 11 月发布并开源的协议，2025-12-09 捐给 Linux 基金会 AAIF。它常被比作"AI 应用的 USB-C"：把"模型 ↔ 外部工具/数据"的连接标准化，一次实现、多家复用。

| 角色 | 说明 |
| :--- | :--- |
| MCP Host / Client | 宿主应用（IDE、CLI），内置若干 client |
| MCP Server | 暴露能力的一方，提供 tools / resources / prompts |
| 传输 | 本地 stdio 进程，或远程 HTTP/SSE |

**常见误解**：MCP 只是**连接协议**，不是沙箱。企业侧能做的控制通常只发生在"连接与调用入口"（例如 Qoder 的 MCP 访问控制：Allow all / 规则白名单 / 全禁，且明确说明通过入口检查后，其脚本、文件访问、网络请求不在管控范围内）。真正的运行时隔离要靠容器、网络策略与权限最小化。

### 6.2 Connector

MCP 的市场化叫法：把某个外部服务（Jira、Slack、数据库）以"连接器"形式一键接入。技术底座通常仍是 MCP。

### 6.3 Tool Use / Function Calling

模型决定"调用哪个工具、传什么参数"，宿主执行后把结果回灌。工具描述（名称、参数、用途）本身也是上下文，写得含糊会导致选错工具。

---

## 七、执行层

### 7.1 Agent Loop

标准循环：**理解意图 → 规划 → 调工具执行 → 观察结果 → 验证 → 迭代**。判断"是不是真 Agent"看它能不能闭环，而不是看它能不能聊天。

### 7.2 Permission Mode / Sandbox

| 模式 | 读文件 | 改文件 | 跑命令 | 适用 |
| :--- | :---: | :---: | :---: | :--- |
| 只读 / Ask | ✓ | 需确认 | 需确认 | 陌生仓库、审计 |
| 自动编辑 | ✓ | ✓ | 需确认 | 日常开发 |
| 全自动 | ✓ | ✓ | ✓ | 隔离环境、可丢弃分支 |

权限模式是**便利性与爆炸半径的权衡**，不是"胆子大不大"的问题。企业侧的默认值应该更保守，再按团队放开。

### 7.3 Worktree 隔离

每个任务在独立的 `git worktree` 里改代码：失败了直接丢弃，不污染当前分支；并行任务互不干扰。比"在主干上直接让 Agent 干活"安全一个量级。

### 7.4 Plan / Goal / Spec-driven Mode

| 模式 | 输入 | 产出 | 适合 |
| :--- | :--- | :--- | :--- |
| Plan Mode | 一句需求 | 可评审的实施计划 | 影响面不明的改动 |
| Goal Mode | 可验证的目标 | 循环逼近目标，直到判据满足 | 有明确"完成定义"的任务 |
| Spec-driven | 规格文档（验收标准、边界） | 按契约实现 + 测试 | 多人协作、需留痕的交付 |

三者的共同点：**先让"要做什么"可评审，再让"怎么做"自动化**。跳过这一步，等于把模糊需求高速固化成代码。

---

## 八、治理层

### 8.1 Hook

在 Agent 生命周期事件上挂确定性脚本，用来做**可执行的规则**。典型事件：`PreToolUse`（工具调用前）、`PostToolUse`（成功后）、`UserPromptSubmit`、`SessionStart/End`、`SubagentStart/Stop`、`Stop`、`FileChanged` 等。

判定语义（以 Qoder / CLI 系实现为例）：

| 退出码 / 返回 | 含义 |
| :--- | :--- |
| `0` | 通过，stdout 可回 JSON 做细粒度控制 |
| `2` | **阻断**，stderr 回喂给 Agent（仅对支持阻断的事件生效） |
| 其他 | 非阻断错误，记日志继续 |
| `{ok: false}` | `prompt` / `agent` 类型 Handler 的阻断方式 |

四类 Handler：`command`（本地脚本）、`http`（推给外部服务）、`prompt`（单轮模型判定）、`agent`（子 Agent 校验）。

一句话定位：**Rules 说"应该怎样"，Hooks 保证"不许不这样"**。前者是提示词，会随上下文噪声衰减；后者是进程退出码，不会。

### 8.2 Guardrail（护栏）

比 Hook 更宽的概念：规则、门禁、评审、扫描、人工审批的统称。工程上讲究"分层"——确定性检查放 Hook 与 CI，语义检查放独立评审 Agent。

### 8.3 执行与检查分离

让同一个 Agent 既写又评 = 自己给自己判卷。做法：执行 Agent 与评审 Agent 互相不可见，结论收敛为**四态**（通过 / 带告警通过 / 失败 / 升级给人），重试设上限（如两轮），超限交人。

### 8.4 Evals / 回归

把"AI 是否真的改对了"变成可复跑的数据集与判据，而不是读一遍文本觉得"应该没问题"。AI 代码的质量证据必须来自**测试、扫描、回归对比**，不是来自模型的自述。

### 8.5 Audit Log 与 Metrics

- **审计日志**通常只记管理侧动作（成员、策略、计费），**不记 Prompt、代码、命令**——所以它不能当代码合规证据链，那要靠 Git 与 CI。
- **度量**常见口径：AI 参与提交占比、Agent 保留行数、补全采纳数。注意口径陷阱：团队混用第三方 AI 工具时，其产出计入分母不计入分子，数值会偏低；只把指标当趋势，不当结算。

---

## 九、一词一坑

| 常见误解 | 实际 |
| :--- | :--- |
| "Vibe Coding = 用 AI 写代码" | 它特指**放弃理解**的那种用法；用 AI 写生产代码是另一回事 |
| "Skills 就是高级提示词" | 它是带脚本、资源、元数据的能力包，靠 `description` 触发、按需展开 |
| "写了 AGENTS.md 就一定生效" | 各家还有自己的规则文件且可能优先；就近文件优先；超长会截断 |
| "有 Hook 就安全了" | Hook 只覆盖它挂的事件；只拦一个工具，Agent 可以换另一个工具做同样的事 |
| "MCP 是安全沙箱" | 只是连接协议，入口放行后其内部行为不受控 |
| "AI 生成占比越高越好" | 冲指标会诱导无意义的大提交；指标是趋势工具，不是目标 |
| "Agent 能自己验证自己" | 自评有结构性偏差，检查必须是独立角色 |
| "上下文越多越好" | 噪声也会挤占预算；关键是"准确"而不是"多"，压缩后只留文件里的硬约束 |
| "Subagent 只是省 token" | 核心价值是上下文隔离与角色边界，省 token 是副产品 |

---

## 十、最小起步（一周内可完成）

不要一次上全套。最小闭环只需要四件东西：

```text
repo/
├── AGENTS.md                     # ① 常驻指令：构建、测试、禁区
├── .qoder/
│   ├── skills/
│   │   └── release-checklist/
│   │       ├── SKILL.md          # ② 一个流程型 Skill
│   │       └── references/RELEASE.md
│   ├── hooks/
│   │   └── guard-command.sh      # ③ 一个确定性拦截
│   └── settings.json             # 项目级 Hook 配置（可入库共享）
└── .github/workflows/
    └── review.yml                # ④ CI 必过项（测试 + 评审 + 扫描）
```

顺序建议：**先把 ① 写出来让输出不漂 → 再用 ③ 拦住高频危险动作 → 再把重复流程固化成 ② → 最后用 ④ 兜住合并前的门**。反过来（先上 Hook 再想规矩）通常会长出一堆没人维护的空壳脚本。

---

## 十一、术语速查

| 术语 | 一句话解释 | 常见载体 |
| :--- | :--- | :--- |
| Vibe Coding | 放弃逐行理解、靠自然语言迭代的编码方式 | 对话式 IDE |
| Agentic Coding | Agent 自主规划、调工具、闭环验证 | IDE / CLI / Cloud Agent |
| AGENTS.md | 给 Agent 看的仓库级说明书 | 仓库根目录 Markdown |
| Rules | 可分组、可通配、可场景触发的规则集 | `.qoder/rules`、`.cursor/rules` |
| Skill | 带脚本与资料的流程能力包 | `SKILL.md` + 目录 |
| Progressive Disclosure | 先给摘要、命中才展开的加载策略 | Skill 元数据 → 正文 → 资源 |
| Plugin | 多能力打包分发单位 | ZIP + 清单文件 |
| Command | `/` 显式唤起的工作流 | 自定义命令目录 |
| Subagent | 独立上下文与工具集的子 Agent | 子 Agent 定义文件 |
| MCP | 模型与外部工具的标准化连接协议 | stdio / HTTP Server |
| Connector | MCP 的市场化封装 | 扩展市场 |
| Context Engineering | 决定给模型看什么、看多少 | 上下文策略组合 |
| RAG | 检索后拼接上下文的做法 | 向量库 + 检索器 |
| Repo Wiki | 预生成的仓库知识文档 | 仓库 / 组织知识库 |
| Compaction | 长会话的自动摘要压缩 | 会话管理 |
| Memory | 跨会话的长期记忆 | 全局 / 项目记忆 |
| Agent Loop | 规划-执行-观察-验证的迭代 | 运行时 |
| Permission Mode | 读/写/执行的分级授权 | 设置项 |
| Worktree | 每任务独立工作副本 | Git worktree |
| Plan / Goal / Spec Mode | 先评审计划或规格，再自动化执行 | 任务模式 |
| Hook | 生命周期事件上的确定性脚本 | `settings.json` |
| Guardrail | 规则、门禁、评审的总称 | 全链路 |
| Evals | 可复跑的效果判定集 | CI / 离线数据集 |
| Audit Log | 管理动作的审计记录 | 管理控制台 |
| Credits / Token | 计费与上下文预算单位 | 账单 / 会话 |

> 延伸：把这些名词用在一家公司里的完整方案（组织、席位、知识库、私有市场、四层门禁）见 [Qoder 企业落地与治理](/docs/60-AI/81-Qoder/)。

---

### Reference

[Karpathy 原始推文（vibe coding 出处）](https://x.com/karpathy/status/1886192184808149383)

[AGENTS.md 官方站（格式、嵌套、生态支持列表）](https://agents.md/)

[Agent Skills 概览（渐进式披露三阶段）](https://agentskills.io/what-are-skills)

[Agent Skills 规范（SKILL.md 字段与命名约束）](https://agentskills.io/specification)

[Linux 基金会 Agentic AI Foundation 成立公告](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)

[Anthropic 将 MCP 捐给 AAIF](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)

[Agent Skills 转为开放标准（报道）](https://www.unite.ai/anthropic-opens-agent-skills-standard-continuing-its-pattern-of-building-industry-infrastructure/)

[Qoder Hooks（事件与退出码）](https://docs.qoder.com/cli/hooks-reference) / [Qoder Rules](https://docs.qoder.com/user-guide/rules)

[]()

[]()
