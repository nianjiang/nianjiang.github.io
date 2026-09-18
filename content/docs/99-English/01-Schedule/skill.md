---
weight: 99
title: "Schedule Skill"
---

# Schedule Skill — 生成新的学习计划

本文档定义在本目录生成一份新「英语学习计划」的标准方法：默认 4 周 × 每周 6 天（Day 01–24），主题内容需要更多天数时可增加周数；每天一个 Topic + Video + Article + English Practice。

**触发方式**：用户按如下格式发起，收到即按本文生成学习计划：

```
请根据Skill和主题生成一个英语学习计划

Skill：skill.md
主题：CNCF
```

- **主题**：新计划的主题，用作文件名 `NN-<Topic>.md` 中的 `<Topic>` 与 front matter `title`（示例为 CNCF，可替换为任意主题）
- **文件**（可选）：仅指对话中**明确指定为素材**的文档（`skill.md` 本身是操作说明，不算素材），作为计划的内容起点；未提供时按第 5 节围绕 `主题` 自行调研

**风格参考**：[50-AI Topics.md](./50-AI%20Topics.md) —— 仅参考其表格风格、label/note 措辞与参考块写法；结构与标签以本文为准（默认 4 周、无每周基础对）。

## 0. 环境与前提

- 内容目录：`content/docs/99-English/01-Schedule/`（站点为中文，计划正文为英文）
- 构建验证：`hugo --source /Users/jnh/workspaces/github/nianjiang.github.io --minify --renderToMemory --noBuildLock`
- 网络搜索无需向用户确认，直接执行
- 只使用**验证过**的资源：视频 UP主/频道、文章 URL 必须逐条确认存在；无法确认归属的一律弃用重找

## 1. 文件编号与骨架

- 文件名：`NN-<Topic>.md`，`NN` 取目录内下一个空闲 weight（50 = AI Topic，51 = CNCF，新计划从 52 起；若某 weight 已有占位 stub 文件，可直接填充或取下一个空闲号）
- Front matter 只有 `weight` 与 `title`，样式同 `50-AI Topics.md`
- Day 编号全文件连续，两位补零（默认 01–24；扩展周数时顺延）
- 文件顺序：front matter → `## Week 1…N`（每周 6 行表）→ `## Weekly Self-Check` → 参考块
- **无"每周基础对"**：不写每周 `Video:` / `Article:` 声明行；每一天的视频与文章完全由当天 Topic 确定

## 2. 骨架模板

````markdown
---
weight: NN
title: "<Topic>"
---

## Week 1 — <Theme>

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 01 | <疑问式主题> | [<Video title>][v01] — <聆听重点> | [<Article title>][a01] — <note> | <具体任务> |
|  | 02 | … | [<Video title>][v02] — <聆听重点> | [<Article title>][a02] — <note> | … |
|  | 06 | Review: <回顾主题> | [<Recap video>][v06] — <收尾重点> | [<Checklist article>][a06] — verify your … | <两分钟口头输出任务> |

## Week 2 — <Theme>
<!-- 同构：Day 07–12，标签 v07–v12 / a07–a12 -->

## Weekly Self-Check

<!-- 原样复制 50-AI Topics.md 的 5 条要点，不改动 -->

[v01]: <Day 01 视频 URL>
[v02]: <Day 02 视频 URL>
[a01]: <Day 01 文章 URL>
[a02]: <Day 02 文章 URL>
````

## 3. 主题递进（默认 4 周，可扩展）

- 总体弧线：领域总览与核心概念（周 1）→ 关键机制（周 2）→ 工程与应用（周 3）→ 风险、权衡与总结（周 4）；按主题调整，保持由浅入深、末周收束于"做选择 + 总复盘"
- 每周一个主题（`## Week N — <Theme>`）；默认 4 周，主题内容确实需要更多天数时增加周数（如 6 周 → Day 01–36），Day 编号顺延；扩展的周作为深化周（原理 / 实操 / 案例按主题定），总结周永远收尾
- **每周第 6 天固定为 Review**：当天 Topic 以 `Review: ` 开头，视频选该主题的回顾/收尾类内容，文章选"验证/检查"类，练习为两分钟口头输出（对照 Day 01 或前几周的清晰度）

## 4. 周表格规则

- 表头与对齐行必须逐字符一致（注意行首的空列）：

```markdown
|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
```

- **标签与 Day 一一对应**：Day 05 → `v05` / `a05`；全文件 `v01–vNN`、`a01–aNN`（NN = 总天数），一一对应、无跳跃
- **Topic**：简短的疑问式或动名词描述；第 6 天以 `Review: ` 开头
- **Video 单元格**：`[<视频标题>][vNN] — <label>`
  - `label` 为小写动词短语，描述该视频的聆听重点而非时间戳：`listen for …` / `follow the …` / `focus on …` / `watch how …`
  - 每天一个视频；仅当该主题确需补充时才加第二个视频：`, <br/>[<另一个视频>][vNNb] — <label>`
- **Article 单元格**：`[<文章标题>][aNN] — <note>`
  - `note` 描述该文内容并与当天 Topic 呼应：`definition` / `how … works` / `benefits` / `challenges` / `risks and safeguards` / `verify your summary` / `check your design` / `fact-check your recommendation`
- **English Practice**：具体可执行、口语与写作交替；写入任务时附词数（80–150）或连接词要求（"whereas"、"however"、"in order to"）；第 6 天固定为两分钟口头输出类

## 5. 资源调研规则

- **文章**：优先选定一个与主题匹配的权威文档家族（如 IBM Think、Kubernetes 官方文档、CNCF 项目页），每天的文章取自该家族的**具体页面**，**正文必须为英文**；逐条搜索确认页面真实存在（标题能对上）后才写入
- **视频**：每天一个，来自与当天 Topic 匹配的优质创作者，逐日不同；**音频必须为英文**（中文字幕无妨；中文讲解类视频只能作补充，不能充当当天 Video）；来源优先级：**B 站（bilibili.com）优先**，其次 YouTube，其他优质中国视频网站也可选用；B 站链接用规范形式 `https://www.bilibili.com/video/BV…`，不用 b23.tv 短链
- **验证归属**：B 站视频搜 `BV号 + UP主`，YouTube 视频搜 `视频ID + channel` 或 `"完整标题" + channel name`；搜索结果的侧栏推荐与相似标题视频可能污染归属判断，存疑就换关键词再搜一次，仍不明确则弃用
- **全局唯一**：同一 URL 与同一视频 ID（YouTube 视频 ID / B 站 BV 号）在整个文件中只出现一次；同一 UP主/频道跨日复用是允许的
- 弃用候选时保留备选列表，避免重复搜索

## 6. 参考块

- 文件末尾逐行列出所有标签：先 `v01`–`vNN` 按 Day 顺序，再 `a01`–`aNN` 按 Day 顺序；一天有 `vNNb` 时紧随 `vNN` 之后
- 无孤儿标签（定义了但未使用）、无未定义标签（使用了但未定义）

## 7. 构建与完整性验证

每个 Plan 完成或每周写入后必须执行：

```bash
# 1) 构建（exit 0 才算通过；既有 WARN 与本文件无关）
hugo --source /Users/jnh/workspaces/github/nianjiang.github.io --minify --renderToMemory --noBuildLock

# 2) 引用完整性（f 换成目标文件；两个 comm 输出都必须为空）
f="content/docs/99-English/01-Schedule/<NN-Topic>.md"
used=$(grep -o '\]\[[a-zA-Z0-9]*\]' "$f" | sed 's/\]\[//;s/\]//' | sort -u)
defined=$(grep -o '^\[[a-zA-Z0-9]*\]:' "$f" | sed 's/^\[//;s/\]://' | sort -u)
comm -23 <(echo "$used") <(echo "$defined")   # 未定义引用
comm -13 <(echo "$used") <(echo "$defined")   # 孤儿定义

# 3) URL 去重（输出必须为空）
grep -o 'https://[^)]*' "$f" | sort | uniq -d

# 4) 视频 ID 去重（输出必须为空；同一视频的不同 URL 形式也能抓出）
grep -oE 'youtube\.com/watch\?v=[A-Za-z0-9_-]{11}|youtu\.be/[A-Za-z0-9_-]{11}|youtube\.com/shorts/[A-Za-z0-9_-]{11}' "$f" | grep -oE '[A-Za-z0-9_-]{11}$' | sort | uniq -d
grep -oE 'bilibili\.com/video/BV[0-9A-Za-z]+' "$f" | sort | uniq -d
```

## 8. 执行顺序：一周一周地完成

1. 设计好周数（默认 4 周）与主题弧线、文件骨架后**写入文件**
2. 逐周推进：调研本周 6 天资源 → 写入本周 6 行 + 参考块 → 构建验证 → 再调研下一周
3. **不要**预先批量调研全部周再统一写入
4. 全部周完成后执行第 7 节全套验证并汇报

## 9. 收尾清单

- [ ] 文件名与 front matter（weight = 目录下一个空闲号，title = 主题）
- [ ] 默认 4 周 × 6 行（扩展时相应增加），Day 01–NN 连续无重复；无每周 `Video:` / `Article:` 声明行
- [ ] 标签 `v01–vNN` / `a01–aNN`（NN = 总天数）与 Day 一一对应，无跳跃
- [ ] 每天视频 UP主/频道与文章页面全部验证；视频 ID 与 URL 全文件唯一
- [ ] Weekly Self-Check、参考块齐全
- [ ] 引用完整性四检查全空（未定义 / 孤儿 / 重复 URL / 重复视频 ID）
- [ ] `hugo` 构建 exit 0，新页面计入 Pages 数

## 10. 常见坑

1. **SearchReplace 精确匹配**：文件实际文本可能与印象有细微出入（弯引号、"listen for" vs "listen to"、全角标点）。改动前先 Read 目标行；一次调用部分失败时，只重读失败行并用原文重新替换，不要整段重写。
2. **搜索侧栏污染**：结果摘要里的 "Go to channel X" 可能是推荐视频的频道而非目标视频的；B 站同名或相似标题视频可能来自不同 UP主，都必须二次确认。
3. **表格前导空列**：`|  | Day |` 的行首空列与 `:---:` 对齐行是格式的一部分，不要"修正"掉。
4. **标点风格**：新增英文内容用半角标点 + ` — `（空格包围的破折号）；编辑旧行时保留其原有标点（样例中存在弯引号与个别全角逗号）。
5. **补零**：Day 列是文本（"01"–"NN"），排序或生成时不要丢前导零。
6. **固定段落**：`Weekly Self-Check`、参考块、每周 `## Week N — <Theme>` 标题最容易漏，收尾清单逐项核对。
