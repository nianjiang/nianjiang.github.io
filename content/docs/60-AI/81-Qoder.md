---
weight: 81
title: "Qoder"
---

# Qoder 企业落地与治理

本文回答两个问题：**一家软件研发公司如何让每个团队真正把 Qoder 用起来**，以及**知识库、Skills、门禁这三类资产如何治理**。结论先行：

1. **落地不是"发账号"**。官方把企业落地的顺序写得很直白：先把成功运行变成可复现的骨架，再把高频错误变成护栏，最后把运行数据回灌成闭环。顺序颠倒，护栏无处挂载，知识不知道该在哪一步注入。
2. **治理不是"写文档"**。真正起作用的是三层可执行物：仓库内的规则与知识（版本化）、Hooks 与 CI 的确定性校验（可拦截）、审计与度量（可归因）。

---

## 一、产品族与职责边界

Qoder 已经不是单一 IDE，而是一族产品。落地第一个决策就是**给每个团队指定唯一主入口**，否则上下文会分裂。

| 产品 | 形态 | 在落地中的角色 | 文档 |
| :--- | :--- | :--- | :--- |
| Qoder | 桌面端，源自 IDE 的 Quest 模式，现为独立产品 | 端到端任务委派，异步交付 | [Overview](https://docs.qoder.com/qoder/overview) |
| Qoder IDE | 编辑器 + Ask/Agent/NEXT | 人工在环的日常编码，主力入口 | [IDE](https://docs.qoder.com/quick-start) |
| JetBrains Plugin | IDEA 系插件 | Java/Kotlin 团队的替代入口 | [Plugin](https://docs.qoder.com/plugins/introduction) |
| Qoder CLI | 终端 | 脚本化、自动化、接入现有流水线 | [CLI](https://docs.qoder.com/cli/overview) |
| Cloud Agents | 托管云上 Agent（API 驱动） | 长任务、定时任务、团队共享能力 | [Cloud Agents](https://docs.qoder.com/cloud-agents/overview) |
| QoderWork | 文档 / 表格 / 调研 / 浏览器 / 桌面任务 | 非研发岗与研发混杂场景 | [QoderWork](https://docs.qoder.com/qoderwork/quick-start) |
| QoderWake | 数字员工（Waker） | 持续责任岗位、IM 通道、SOP 流程 | [QoderWake](https://docs.qoder.com/qoderwake/overview) |
| Mobile & Web | 移动端 / 网页 | 审批与巡检，不在工位时不全掉线 | [Mobile](https://docs.qoder.com/mobile/app/download) |
| Enterprise 控制台 | 管理端 | 席位、身份、策略、知识、市场、审计 | [Enterprise](https://docs.qoder.com/account/teams/get-started) |

> 关键事实：**Qoder 与 Qoder IDE 并存且互不替代，二者的会话历史与记忆分开存储**。同一个人两边都用，等于两份上下文。落地时要么指定主入口，要么在切换时显式导入历史。

---

## 二、Day 0：组织与权限基线

### 2.1 套餐能力矩阵

| 能力 | Teams | Enterprise |
| :--- | :---: | :---: |
| 集中计费与管理 | ✓ | ✓ |
| 统一身份与资源管理 | ✓ | ✓ |
| SAML / OIDC 单点登录 | ✓ | ✓ |
| IM 通道管控 | ✓ | ✓ |
| 团队知识引擎驱动的 Agent | ✓ | ✓ |
| 隐私模式管理 | ✓ | ✓ |
| 研发度量 | ✓ | ✓ |
| 按组划分的权限与计费 | — | ✓ |
| 多维模型策略管控 | — | ✓ |
| 插件共享与分发管控 | — | ✓ |
| 私有企业市场 | — | ✓ |
| 审计日志 | — | ✓ |
| 优先支持 | — | ✓ |

**选型要点**：Teams 与 Enterprise 是**相互隔离**的两套体系，**不支持无缝升降级**。如果目标里包含"私有市场 + 审计日志 + 多维模型策略"，一开始就买 Enterprise，不要指望从 Teams 平滑升上去。最少 2 个席位起步，官网与阿里云市场兑换码两种购买渠道。

### 2.2 角色与席位

| 角色 | 能做什么 | 占席位 |
| :--- | :--- | :---: |
| Admin | 全部管理权限，可用付费能力与 Credits | ✓ |
| Config Admin | 全部管理权限，**不可用**付费能力与 Credits | — |
| Member | 可用付费能力，**不可进**管理台 | ✓ |
| Directory Member | 仅用于组织成员同步，无付费能力、无管理权限 | — |

实践建议：财务/采购对接人给 **Config Admin**（能管订阅不能烧 Credits）；新员工入职默认为 **Directory Member**，通过 SSO 自动同步后再按项目发席位，避免"入职即占席位、离职才释放"的浪费。

### 2.3 身份、网络与合规

- **身份**：SAML 2.0 或 OIDC 单点登录 + 企业域名验证。域名验证是 Enterprise 手工创建成员与 SSO 自动加入的前置条件。
- **网络**：内网/代理环境需先打通，否则表现为"安装成功但登录不了"或"索引不更新"，团队会把它误判为工具不可用。
- **合规**：Qoder 已通过 ISO/IEC 27001:2022 认证并完成 SOC 2 Type II 审计（安全、机密性、可用性三项）。企业侧另有隐私模式开关。

### 2.4 审计日志的边界（重要）

Qoder 审计日志**只记录管理侧操作元数据**，覆盖组织设置、成员邀请、用户组、认证、订阅计费、模型、用量配置、IM 通道等，仅 Admin 可见。

**不记录**：用户 Prompt、模型回复、代码片段与 diff、文件内容、终端命令与输出、Agent 执行过程、MCP 工具调用参数、Token/密钥明文。

由此得出一条硬结论：**Qoder 的审计日志不能当作代码级门禁的证据链**。涉及"谁改了什么、是否通过评审"的合规要求，必须回落到 Git 平台（PR/MR 记录）与 CI 日志。审计日志的定位是"管理动作可追溯"，不是"研发行为可追溯"。

---

## 三、从试点到全员：让每个团队完整使用

### 3.1 分层推广矩阵

不要用同一套打法推所有团队。按"存量代码风险 × 交付节奏"分三类：

| 团队类型 | 主入口 | 首个可度量产出 | 门禁强度 |
| :--- | :--- | :--- | :--- |
| 新业务 / 0-1 | Qoder（契约异步） | 可验收的需求契约 + 工程骨架 + 首批测试 | 中：契约评审 + CI 必过 |
| 存量核心系统 | Qoder IDE（人工在环） | 影响面清单 + 回归基线 + 增量代码 | 高：Hook 前置拦截 + 独立评审 + 双证据 |
| 长尾工单 / 效能型 | Qoder CLI + Cloud Agents | 自动化处理率、单量吞吐 | 低-中：模板化 SOP + 抽样复核 |

### 3.2 两种协作模式，按"不确定性"切分

| 模式 | 何时用 | 特征 | 人在哪里 |
| :--- | :--- | :--- | :--- |
| 人在环（HITL） | 需求模糊、影响面未知、探索性任务 | 小步快跑，同步纠偏 | 全程在场，随时改向 |
| 契约异步 | 目标、边界、验收标准已稳定 | 一次交付，阶段门禁把关 | 只在关键门禁出现 |

反面案例是两种极端：把探索性工作塞进长时间自主运行（跑偏后成本极高），或把已定义清楚的批量工作继续占用人的注意力带宽（扩不出产能）。

### 3.3 30 / 60 / 90 天节奏

| 阶段 | 目标 | 关键动作 | 退出标准 |
| :--- | :--- | :--- | :--- |
| 0–30 天 | 骨架 | 建组织、SSO、席位；选 1 个中等风险团队试点；落 `AGENTS.md` + `.qoder/rules` | 同一需求换个人跑，结果不漂移 |
| 30–60 天 | 护栏 | 上 Hooks 前置拦截、CI 必过、PR 自动评审；建私有市场分发 3–5 个 Skill | 高频错误在提交前被拦下 |
| 60–90 天 | 闭环 | 开企业知识收集、看板归因、月度复盘回灌规则 | 同类错误不再第二次发生 |

90 天之后再横向扩团队，而不是一开始铺满。

### 3.4 度量口径（最容易踩坑的地方）

管理台提供三类指标：

| 指标 | 定义 | 口径陷阱 |
| :--- | :--- | :--- |
| AI 参与提交占比 | 提交行数中由 AI 生成的比例（Agent / Edit / NEXT 三者合计） | 团队同时使用第三方 AI 工具时，其产出计入**分母**却不计入**分子**，页面数值会显著偏低 |
| Agent 保留行数 | Agent 与 Edit 产生且仍留在仓库中的行数，可按文件类型细分 | 只重命名路径或把生成内容复制到新路径再提交，通常**失去归因** |
| NEXT 采纳量 | 补全建议被接受的次数 | 只反映交互密度，不等于交付价值 |

其他已知口径规则：超大提交（依赖批量导入、迁移）与纯合并提交一般被排除；回滚提交**不排除**；squash / amend 在部分工作流下**可能重复计数**；纯格式化提交不排除。

**结论**：把看板当**趋势与相对比较**用，不要当结算依据；跨团队排名前先统一工具栈，否则是在比口径不是比能力。

### 3.5 阻力与对策

| 表现 | 真实原因 | 对策 |
| :--- | :--- | :--- |
| 装了不用 | 首个任务失败于环境（代理/登录/索引） | 试点期配一名"环境联络人"，把安装到首个成功任务压缩到 30 分钟 |
| 只当补全用 | 没有可委派的任务样板 | 每个团队沉淀 3 个任务模板（修 bug / 补测试 / 加接口） |
| 产出不可审 | 一次生成过大 diff | 强制小步提交 + Worktree 隔离 + 分批 commit |
| 质量回退 | 评审产能没跟上生成速度 | 执行与检查分离，独立评审 Agent + 四态结论 |
| 知识不进库 | 知识生产被当成"额外工作" | 把知识刷新做成 Skill 绑定代码平台回调，合并即触发增量更新 |

---

## 四、知识治理

### 4.1 上下文资产分层

治理的第一件事不是"建库"，而是**分层**：不同层的资产有不同的载体、维护人和生效范围。

| 层 | 内容 | 载体 | 谁维护 | 生效范围 | 入库 |
| :--- | :--- | :--- | :--- | :--- | :---: |
| 硬约束 | 编码规范、禁用 API、目录约定 | `AGENTS.md` / `.qoder/rules` | 架构组 | 仓库 | ✓ |
| 代码事实 | 结构、依赖、调用链 | Repo Wiki / Knowledge Cards | 工具自动生成 + 专人纠偏 | 仓库 × 分支 | ✓ |
| 领域知识 | 业务术语、模块职责、历史决策 | Knowledge Base / Knowledge Cards | 领域专家 | 团队或仓库 | ✓ |
| 团队参考 | 需求、方案、运维手册、SOP | Knowledge Base（User / Workspace 作用域） | 各团队 | 库级 | 视敏感度 |
| 个人偏好 | 沟通习惯、常用工具 | Memory（Global / Project） | 个人 | 个人 | ✗ |

要点：

- **Rules 与 AGENTS.md 都认，但冲突时 Rules 优先**。团队已有 `AGENTS.md` 可直接复用，不需要重写一遍。
- Rules 有 **10 万字符上限**（所有生效规则合计，超出截断），所以规则要"少而硬"，不能当文档仓库用。
- Memory 明确**禁止**存密码、验证码、API Key 和临时任务状态。
- Knowledge Base 单文件上限 500 MB，支持 PDF / Word / Excel / PPT / Markdown / TXT / CSV / HTML / 图片。

### 4.2 企业知识引擎（Enterprise Knowledge）

开启方式：组织管理端 → 知识库 → 右上角齿轮 → 打开 **Team Knowledge Collection**。

- **默认关闭**，只有团队管理员能改，开关即"收集 + 共享"同时生效。
- 只汇聚客户端生成的**三类**知识，服务端不自行生成：RepoWiki、Knowledge Cards、Memory Cards。
- 组织维度**按仓库 + 分支**组织，切换分支时 RepoWiki 与 Knowledge Cards 同步刷新。
- 客户端侧由 **Sync Team Knowledge** 开关控制：本地无知识而云端有则自动拉取；本地有则被云端覆盖。首次用 `/knowledge` 手工修改后该开关会自动关闭，转为用户自管。
- 仓库无 git remote 信息时该开关不可用。

**风险提示**：关闭企业知识会暂停收集与更新，已收集数据只保留有限时间后删除，**不是永久保存**。停用前先备份。

### 4.3 知识生产流水线

公开案例（高德 AutoSDK，百万行 C++ 遗留代码、20+ 仓库）把知识生产拆成可复现的五步：

1. **分层蓝图**：先画知识分层地图，让 AI 全仓扫描产出草稿蓝图，再由人拉齐业务边界、消歧、去重、补维度。
2. **批量产出 + 冷启动打磨**：按蓝图批量抽取，再跑一轮专项评审纠正系统性漂移（约 2 小时/仓库）。
3. **管道与角色边界**：定义阶段拓扑，每个执行 Agent 配一个独立检查 Agent，四态门禁，用"禁止项"划出角色边界。
4. **前置预防**：符号级索引让探索只读相关签名与关键片段；确定性规则由 Hook 在写盘前校验与修正。
5. **新鲜度与自演进**：把知识刷新包装成 Skill 绑定代码平台回调，合并即触发增量更新。

公开数据（该案例，非承诺值）：缺陷外泄下降约 73%，严格一次通过率从 37.3% 提升到 61.5%，单任务平均对话轮次从 3.49 降到 2.53。**值得注意的是同一个坑：多作者知识编辑至今缺少成熟的评审、灰度与回滚**，过渡做法是"每个模块的知识归口到单一负责人"。

### 4.4 知识卫生规则

- **一库一主题**：一个产品/项目/稳定主题一个库，混合不相干策略会让检索结果无法验证。
- **权威源唯一**：接口与流程只保留一个权威版本，废弃内容删除而不是叠加注释。
- **可验证性**：知识入库前先问一个"答案在原文里一眼可查"的问题，确认检索真的命中，再用于大改动。
- **不写入**：生产凭据、个人数据、未授权共享的信息；以及"临时任务状态"（那是会话上下文，不是知识）。

---

## 五、Skills 治理

### 5.1 概念边界

| 载体 | 用途 | 关键点 |
| :--- | :--- | :--- |
| Skill | 可复用的**方法与流程**（代码评审、测试生成、文档生成） | 包 `SKILL.md` 与支撑资源 |
| Command | `/` 唤起的复用工作流 | 高频重复需求的固化 |
| Plugin | **能力包**，可含 Skills、Commands、MCP、Rules、Hooks | ZIP 根目录需 `.qoder-plugin/` |
| Connector | 外部服务或自定义 MCP Server 暴露的工具 | 走 MCP 访问控制 |
| Agent / Agent Team | 专门化角色的指令、模型与工具组合 | 可与"执行/检查分离"搭配 |

### 5.2 三层隔离与命名

按"通用 / 领域 / 流程"三层切分，并在编排时一次性锁定允许清单：

| 层 | 例子 | 谁能改 |
| :--- | :--- | :--- |
| 通用（General） | 提交信息规范、单测骨架、日志脱敏 | 平台组 |
| 领域（Domain） | 支付对账口径、车载 SDK 兼容矩阵 | 领域专家 |
| 流程（Process） | 需求澄清清单、发布检查单、回归基线 | 流程负责人 |

原则：**开发角色的能力包不得包含验证角色的能力**（例如开发 Agent 拿不到"直接批准发布"的门禁工具）。这是"执行与检查分离"落到资产层的具体形态。

### 5.3 生命周期

| 阶段 | 动作 | 门禁 |
| :--- | :--- | :--- |
| 草稿 | 个人用 `Create with Qoder` 或导入 ZIP / `SKILL.md` | 仅本机，风险自担 |
| 评审 | 审指令、脚本、外部请求、依赖账号与权限 | 双人评审 + 一次低风险实跑 |
| 发布 | 上传到私有市场 collection | 内容类型必须与 collection 匹配 |
| 分发 | 配分发范围与策略 | 见下表 |
| 退役 | 从 collection 移除条目 | 注意：移除只解绑关系，**不删除**原始包 |

### 5.4 私有市场的分发矩阵

| 分发范围 | 含义 |
| :--- | :--- |
| Not distributed | 管理员不主动分发；collection 可见时成员仍可自装 |
| Distribute to all | 分发到组织全体 |
| Distribute to groups | 分发到指定成员组 |

| 分发策略 | 客户端表现 |
| :--- | :--- |
| Client configurable | 成员可见可配 |
| Force enabled | 显示在客户端并保持启用 |
| Silent enable | 不在客户端显示，后台启用 |

两个概念**不能混**：

- **Marketplace visibility** 作用于 collection → 决定成员能否在客户端市场里"发现"它。
- **Distribution scope** 作用于单条内容 → 决定成员能否"收到"它。

范围大于可见性时，成员会收到内容却在市场里搜不到——这类错配是治理事故的常见来源。

> 现状限制：连接私有市场后，目前只有 QoderWork 会在客户端市场展示；Qoder 与 QoderWork 都支持管理员分发。

### 5.5 Skill 评审清单

- [ ] 名称与描述能让模型**准确自选**（这是 Skill 被触发的唯一入口）。
- [ ] 脚本、Hooks、命令、端点、所需账号与权限逐项看过。
- [ ] 无真实凭据、无示例密钥、无指向测试环境的生产地址。
- [ ] 有最小可用示例与预期输出，能在低风险任务上复现。
- [ ] 失败行为明确：报错还是跳过，是否可能静默降级。
- [ ] 归口到具体 owner，写清版本与退役条件。

### 5.6 自动演化的护栏

开启 **Skill evolution suggestions**（Settings → General）后，Qoder 会从本地任务里提炼可复用经验并建议新建或改进 Skill。

必须约定：**建议不等于变更**。接受建议会打开新会话确认方案，任务创建不代表 Skill 已修改；批次建议可由管理员批量创建或忽略。企业侧应把"谁能接受建议"收窄到 Skill owner，否则能力包会被众包改坏。

---

## 六、门禁体系

### 6.1 四层门禁

| 层 | 触发点 | 技术手段 | 失败动作 |
| :--- | :--- | :--- | :--- |
| L1 动作级 | 工具调用前/后 | Hooks（`PreToolUse` / `PostToolUse`） | 退出码 2 阻断，stderr 回喂 Agent |
| L2 提交前 | 阶段收尾 | Rules + 安全扫描（Static → Lightweight → Deep） | 不通过不提交 |
| L3 合并前 | PR / MR | Qoder Action 自动评审 + CI 必过 | 阻塞合并 |
| L4 发布前 | 交付 | 独立评审 Agent + 人工门禁 | 四态结论，超限升级给人 |

这四层对应官方方案的"每个阶段出口有独立门禁，失败就地回环或升级给人"。

### 6.2 Hooks：确定性门禁的落点

配置位置（**多来源合并**）：

- `~/.qoder/settings.json`：用户级
- `${project}/.qoder/settings.json`：项目级，可随仓库共享
- `${project}/.qoder/settings.local.json`：项目级但仅本机

四种 handler：`command`（本地脚本）、`http`（推给外部服务）、`prompt`（单轮模型判定，返回 `{ok, reason}`，`ok=false` 阻断）、`agent`（子 Agent 校验，`ok=false` 阻断）。

退出码语义（仅 `command` 类型）：`0` 成功且可输出 JSON 做细粒度控制；`2` **阻断**，stderr 作为反馈回给 Agent——**但只对支持阻断的事件有效**；其他值视为非阻断错误，记日志但继续。

> 注意：`Settings → Hooks` 页面反映的是磁盘上的配置，"能看到条目"不等于"运行时已加载并成功执行"。改完配置要跑一个低风险任务实测。

### 6.3 参考实现：危险命令前置拦截

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": ".qoder/hooks/guard-command.sh" }
        ]
      }
    ]
  }
}
```

```bash
#!/usr/bin/env bash
# .qoder/hooks/guard-command.sh
# stdin: {"session_id":..., "cwd":..., "hook_event_name":"PreToolUse", ...tool input}
cmd="$(jq -r '.tool_input.command // empty')"

# 1) 明确禁止的破坏性操作
if printf '%s' "$cmd" | grep -Eq 'rm[[:space:]]+-rf[[:space:]]+/($|[[:space:]])|git[[:space:]]+push[[:space:]]+--force'; then
  echo "禁止执行破坏性命令：$cmd" >&2
  exit 2                      # 2 = 阻断并回喂 Agent
fi

# 2) 只允许在受控脚本中访问生产库
if printf '%s' "$cmd" | grep -Eq 'psql|mysql' && [ "${ALLOW_DB:-0}" != "1" ]; then
  echo "数据库命令需走受控脚本，不允许直接执行" >&2
  exit 2
fi

exit 0
```

更细的匹配可用 `if` 字段：`"ToolName"` 或 `"ToolName(arg_glob)"`，例如只拦写操作：
`"if": "Bash(git push*)"`。`matcher` 支持 `*`、精确值、`|` 多值与正则。

### 6.4 CI 门禁

- **Qoder Action**：标准 GitHub Actions 组件，开箱提供 PR 自动评审与 `@qoder` 交互。落地要点：`QODER_PERSONAL_ACCESS_TOKEN` 放仓库 Secret；评审规则直接写进仓库根 `AGENTS.md`（CLI 会自动加载为上下文）；用变更行数阈值跳过超大 PR 以控成本。
- **安全扫描**：Static Check 免费、覆盖当前任务生成代码与高危模式；Lightweight（约 5 Credits / 500 行）看增量语义风险；Deep（约 20 Credits / 500 行）跨文件追数据流。CI 中另有独立的 security scan 用法。
- **分层原则**：确定性检查放 Hook 与 CI（可重复、可审计）；语义检查放独立评审。

### 6.5 语义门禁：执行与检查必须分离

让同一个 Agent 既写又评，是"自己给自己判卷"。可执行的做法：

1. 执行 Agent 与评审 Agent **互相不可见**。
2. 评审分三级递进：确定性脚本拦截 → 共享语义校验 → 模块专属规则。
3. 结论收敛为**四态**：通过 / 带告警通过 / 失败 / 升级给人。
4. **重试上限两轮**，超限升级给人，避免无限自修复循环。
5. 失败回归不靠"人读文本判断"，而是回到原任务复跑，看行为是否真的被纠正。

### 6.6 扩展与 MCP 的门禁

| 控制项 | 作用 | 边界 |
| :--- | :--- | :--- |
| MCP 访问控制 | Allow all / Rule-based（≤100 条规则）/ Block all | 只在**入口**拦截（配置、安装激活、启动连接、调用）；通过后其脚本、文件访问、网络请求**不在管控范围内**，它不是运行时沙箱 |
| 私有市场分发 | `Force enabled` / `Silent enable` | 可见性与分发范围是两个维度，需成对配置 |
| 模型策略（Enterprise） | 按组控制模型可见性与等级 | 影响成本与合规，需与采购对齐 |

MCP 策略有缓存：变更后客户端约 5 分钟生效；取不到最新策略时用最近一次有效策略，连缓存都没有则默认阻断非内置 MCP。同时有**最低客户端版本**要求，低版本不执行策略——版本基线要写进推广清单。

### 6.7 门禁失效模式

| 失效模式 | 原因 | 对策 |
| :--- | :--- | :--- |
| Hook 静默不生效 | 事件不支持阻断 / 配置未被加载 / 脚本路径相对 cwd 错位 | 每次变更后跑低风险任务实测，同时看 Handler 自身日志 |
| 门禁被"绕道" | 只拦 `Bash`，Agent 改用其他工具写文件 | matcher 覆盖 `Bash|Edit|Write`，并用 `if` 收窄 |
| 规则形同虚设 | Rules 总量超 10 万字符被截断 | 硬约束精简到"少而硬"，长文档进 Knowledge Base |
| 审计无证据 | 误以为 Qoder 审计日志能追溯代码变更 | 代码级证据链放 Git/CI，审计日志只做管理动作追溯 |
| 评审放水 | 执行与评审同一 Agent | 强制角色隔离 + 四态结论 + 重试上限 |
| 知识过期反噬 | 旧版本接口仍在库中 | 权威源唯一，废弃即删；合并触发增量刷新 |
| 策略不生效 | 客户端版本低于策略最低支持版本 | 把最低版本写进设备基线，纳入准入检查 |

---

## 七、落地检查清单

| 域 | 检查项 |
| :--- | :--- |
| 组织 | 席位与角色映射完成；SSO + 域名验证生效；默认角色设为 Directory Member；计费渠道与 Credits 策略确认 |
| 工具 | 每团队唯一主入口确定；客户端版本满足策略基线；代理/网络打通；首个成功任务 ≤30 分钟 |
| 规则 | `AGENTS.md` 入库；`.qoder/rules` 按四类（手动/模型判定/始终/指定文件）分工；总量未触顶 |
| 知识 | 企业知识开关决策明确；知识分层蓝图评审过；每模块有单一 owner；废弃内容已清理 |
| Skills | 三层隔离与命名规范；私有市场 collection 按内容类型拆分；分发范围与可见性成对校验；owner 与退役条件写明 |
| 门禁 | L1–L4 四层各有负责人；Hook 阻断实测通过；CI 必过项固定；PR 评审规则源自 `AGENTS.md`；重试上限与升级路径定义 |
| 度量 | 三项指标口径统一；跨团队排名前先统一工具栈；月度复盘产出至少一条新增硬约束 |

---

## 八、反模式

| 反模式 | 为什么错 |
| :--- | :--- |
| 先买席位，再想场景 | 没有可委派任务时，工具退化为高价补全 |
| 把知识库当网盘 | 无分层、无 owner、无权威性，检索结果无法验证，反而不如不查 |
| 用 Prompt 写门禁 | 提示词约束在上下文噪声下会衰减；确定性检查必须落到 Hook 与 CI |
| 一次生成几千行再评审 | 评审产能没扩张，缺陷带着"已通过"标签流向下一环 |
| 用审计日志做研发合规 | 它只记管理动作，不记 Prompt、代码与命令 |
| 让所有人自由安装 Skill | 能力包等于可执行代码，必须走评审与分发 |
| 追求 100% AI 生成占比 | 指标是趋势工具，不是目标；冲指标会诱导无意义的大提交 |

---

### Reference

[Qoder 产品族总览](https://docs.qoder.com/product-series/what-is-qoder)

[Enterprise 入门](https://docs.qoder.com/account/teams/get-started) / [成员与角色](https://docs.qoder.com/account/teams/members-and-roles) / [数据与度量](https://docs.qoder.com/account/teams/analysis)

[Rules](https://docs.qoder.com/user-guide/rules) / [Memory](https://docs.qoder.com/qoder/memory) / [Knowledge Base](https://docs.qoder.com/qoder/knowledge-base) / [Repo Wiki](https://docs.qoder.com/qoder/repo-wiki)

[Enterprise Knowledge](https://docs.qoder.com/account/enterprise/knowledge-base) / [Extensions & Marketplace](https://docs.qoder.com/account/enterprise/marketplace)

[Skills](https://docs.qoder.com/qoder/skills) / [Plugins](https://docs.qoder.com/qoder/plugins) / [自定义扩展发布](https://docs.qoder.com/qoder/extension-publishing)

[Hooks](https://docs.qoder.com/qoder/hooks) / [Hooks reference（事件与退出码）](https://docs.qoder.com/cli/hooks-reference)

[MCP 访问控制](https://docs.qoder.com/account/enterprise/mcp) / [审计日志](https://docs.qoder.com/account/enterprise/audit-log)

[Code security](https://docs.qoder.com/qoder/code-security) / [Qoder Action](https://docs.qoder.com/cli/qoder-action)

[AI Native 产品研发流程（方案）](https://docs.qoder.com/enterprise/solutions/ai-native-product-development-workflow) / [高德 AutoSDK 案例](https://docs.qoder.com/customer-cases/qoder-case-gaode)

[]()

[]()
