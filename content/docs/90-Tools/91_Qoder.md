---
weight: 90
title: "Qoder"
---

# Qoder 修改 Model 的模式总结

## 0. 省费阶梯策略

```
    默认用 Efficient（免费）
       ↓ 回答不满意？
    切到 Qwen3.8-Flash / Qwen3.7-Plus（0.1×）
       ↓ 还不够好？
    切到 Auto（1.0×）
       ↓ 复杂难题？
    切到 Ultimate（1.6×）
```
---

## 1. 会话模式（Chat Mode）维度

Qoder 有三种会话模式，每种模式有独立的模型选择体系：

| 会话模式 | sessionType | 说明 |
|---------|-------------|------|
| **智能问答**（Ask/Chat） | `assistant` | 快速问答模式，适合简单的代码咨询 |
| **智能体**（Agent） | `quest` | AI 代理自主规划并执行复杂任务，自动调用工具 |
| **专家团**（Experts） | `experts` | 多专家并行协作，组建 AI 工程专家团 |

> 专家团模式需要在对话开始前选择，对话中不可切换；Quest 模式同理，切换需新建对话。

---

## 2. 模型分级（Tier）维度

每个会话模式下，Qoder 提供按能力/成本分级的模型档位：

### 2.1 智能问答 & 智能体 共用分级

| 档位 | 内部标识 | 定位 | 说明 |
|------|---------|------|------|
| **Auto** | `auto` / `quest-auto` | 智能选择 | 智能选择最适合的模型，平衡性能与成本 |
| **轻量** | `lite` | 免费基础 | 基础推理能力，免费使用（高峰期可能较慢） |
| **经济** | `efficient` | 高性价比 | 原生多模态，标准推理，付费用户限时免费畅用 |
| **性能** | `performance` | 高质量 | 高级推理能力，高质量输出 |
| **极致** | `ultimate` / `quest-ultimate` | 顶级质量 | 专家级深度推理与思考，极致输出质量 |

### 2.2 专家团 专属分级

| 档位 | 内部标识 | 说明 |
|------|---------|------|
| **Auto** | `experts-auto` | 智能选择，平衡性能与成本 |
| **极致** | `experts-ultimate` | 专家级深度推理，极致输出质量 |

---

## 3. 具体模型（Model）维度

在分级之下，Qoder 提供来自多家厂商的具体模型可供选择：

### 3.1 千问（Qwen）系列

| 显示名称 | 内部标识 | 说明 |
|---------|---------|------|
| Qwen3.8-Max | `qmodel_38max` | 最新大基座，2.4T 参数，代码/办公/推理全面领先 |
| Qwen3.8-Max-Preview | `qmodel_preview` | 2.4T 参数基座模型预览版 |
| Qwen3.7-Max | `qmodel_latest` | 旗舰模型，顶尖智能体能力，可自主执行长达 35 小时 |
| Qwen3.7-Plus | `qmodel` | 增强推理与智能体能力，擅长编程 |
| Qwen3.5-Plus | `q35model` | 推理能力、效率与多模态全面跃迁 |
| Qwen3.8-Flash | `qfmodel` | 开源多模态 MoE，能力/延迟/成本出色平衡 |

### 3.2 DeepSeek 系列

| 显示名称 | 内部标识 | 说明 |
|---------|---------|------|
| DeepSeek-V4-Pro | `dmodel` | 正式版，Agent/知识/推理全面领先（峰谷定价） |
| DeepSeek-Flash | `dfmodel` | V4.1-Flash，Agent/知识/推理全面领先（峰谷定价） |

### 3.3 智谱（GLM）系列

| 显示名称 | 内部标识 | 说明 |
|---------|---------|------|
| GLM-5.3 | `gmodel` | 开源旗舰，代码能力对标国际顶尖 |
| GLM-5.3-Flash | `gfmodel` | 原生多模态，深度理解图像与视频 |
| GLM-5.2 | `gm51model` | 旗舰，面向长程任务，自主规划执行 |

### 3.4 Kimi 系列

| 显示名称 | 内部标识 | 说明 |
|---------|---------|------|
| Kimi-K3 | `kmodel_latest` | 最强模型：2.8T 参数，软件工程/知识/深度推理 |
| Kimi-K2.7-Code | `kmodel` | 长上下文编程，精准遵循指令 |

### 3.5 其他模型

| 显示名称 | 内部标识 | 说明 |
|---------|---------|------|
| MiniMax-M3 | `mmodel` | 原生多模态感知，1M 上下文 |
| Cantus | `cmodel` | 尝鲜体验全球顶级模型，擅长超长自主任务 |
| Sonus | `smodel` | 专为最艰巨的端到端任务而生 |

---

## 4. 运行时配置（Runtime Config）维度

选定模型后，还可进一步微调运行时参数：

| 配置项 | 说明 | 可选值 |
|-------|------|--------|
| **思考模式**（Thinking） | 是否启用深度思考链 | 开启 / 关闭 |
| **Thinking Effort** | 思考深度/力度 | 最小 / 低 / 中 / 高 / 超高 / 最大 |
| **快速模式**（Highspeed） | 加速推理（消耗增加） | 开启 / 关闭 |
| **上下文窗口**（Context） | 上下文长度配置 | 可调 |

> 部分模型或分级下，运行时配置可能被锁定（`editDisabled`），不可修改。

---

## 5. 模型切换的操作路径

1. **Chat 面板顶部** → 点击模型选择器（ModelSelector）→ 选择分级或具体模型
2. **对话中切换** → 智能问答/智能体模式支持会话内实时切换；专家团/Quest 需新建对话
3. **安全策略触发** → 代码库触发安全策略时，自动切换为企业模型（`codeSafeModelReason`）
4. **BYOK（自带密钥）** → CustomModelService 支持自定义模型提供商（需功能开启）

---



## Reference

- Qoder 模型选择器内部标识映射来源：`dynamic-text-cache.json`（modelSelector.item.*）
- 会话类型来源：`ModelConfigService` 日志（sessionType = assistant / quest / experts）
- 运行时配置来源：`modelSelector.runtimeConfig.*` / `modelSelector.runtimeLabel.*`
