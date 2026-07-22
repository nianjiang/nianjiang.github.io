---
kind: configuration_system
name: Hugo 站点配置系统（基于 hugo-book 主题）
category: configuration_system
scope:
    - '**'
source_files:
    - config.yaml
    - hugo.toml
    - .github/workflows/hugo.yaml
---

## 1. 使用的系统与框架

本仓库是一个基于 Hugo 静态站点生成器与 `hugo-book` 主题的中文技术博客，配置系统完全由 Hugo 原生机制驱动，未引入额外的运行时配置框架。核心配置集中在根目录的 YAML 配置文件，并通过 GitHub Actions 在 CI 中注入构建环境变量完成最终部署。

## 2. 关键文件与位置

- **主配置**：`config.yaml` — 站点基础信息、主题、多语言、菜单、`params` 等全部集中于此
- **示例/占位配置**：`hugo.toml` — 仅保留默认占位内容，实际不生效
- **CI 构建配置**：`.github/workflows/hugo.yaml` — 通过 `HUGO_VERSION`、`HUGO_ENVIRONMENT`、`HUGO_ENV` 等环境变量控制构建行为，并动态传入 `--baseURL`
- **主题模块声明**：`config.yaml` 中的 `module.imports.path: github.com/alex-shpak/hugo-book` 以 Hugo Module 方式引入主题
- **i18n 资源**：`themes/hugo-book/i18n/*.yaml` — 主题内置的多语言文案（仓库自身 `i18n/` 为空，未覆盖）
- **输出目录**：`publishDir: docs`，构建产物直接输出到 `docs/`，配合 GitHub Pages 使用

## 3. 架构与设计约定

### 3.1 单一 YAML 配置源
所有站点级配置统一放在 `config.yaml`，采用分层结构：
- 顶层键：`baseURL`、`title`、`theme`、`defaultContentLanguage`、`languages`、`menu`、`markup` 等
- `params` 命名空间：所有 hugo-book 主题参数（如 `BookTheme`、`BookToC`、`BookRepo`、`BookSearch`、`BookComments`、`utteranc.*` 等）均置于 `params` 下，避免与 Hugo 核心键冲突

### 3.2 主题参数通过 params 暴露
hugo-book 主题的所有可定制项均以 `Book*` 前缀的参数形式暴露，例如：
- 外观：`BookTheme`、`BookLogo`、`BookToC`
- 导航：`BookSection`、`BookMenuBundle`
- 源码集成：`BookRepo`、`BookCommitPath`、`BookEditPath`、`enableGitInfo`
- 功能开关：`BookSearch`、`BookComments`、`BookPortableLinks`、`BookServiceWorker`、`BookTranslatedOnly`
- 评论扩展：自定义 `utteranc.*` 子节

### 3.3 多语言策略
- 默认语言 `zh`，对应 `contentDir: content`
- 当前仓库未启用其他语言目录，但已预留 `languages` 结构，可按 Hugo 多语言规范扩展

### 3.4 构建期配置注入
GitHub Actions 工作流通过环境变量和 CLI 参数注入构建期配置：
- `HUGO_VERSION: 0.139.4` 锁定 Hugo 版本
- `HUGO_ENVIRONMENT: production` / `HUGO_ENV: production` 标记生产环境
- `--baseURL "${{ steps.pages.outputs.base_url }}/"` 动态覆盖 baseURL，使同一份配置同时适配本地开发与 GitHub Pages 发布

### 3.5 模块化的主题管理
通过 `module.imports` 以 Go module 方式引入 hugo-book 主题，而非 git submodule；主题本身位于 `themes/hugo-book/`，其 `go.mod` 定义了模块路径。

## 4. 开发者应遵循的规则

1. **只修改 `config.yaml`**：站点级配置变更一律在此文件进行，不要新建独立的 TOML/YAML 配置分支（`hugo.toml` 仅为占位）。
2. **主题参数放入 `params`**：任何 hugo-book 主题相关设置必须以 `params.Book*` 或自定义 `params.<namespace>` 形式写入，不得与 Hugo 顶层键重名。
3. **敏感信息不入仓**：当前配置不含密钥；如需接入外部服务（如评论、分析），建议通过 GitHub Secrets + Actions 环境变量注入，而非硬编码进 `config.yaml`。
4. **多语言扩展时保持目录一致**：新增语言需在 `languages` 下声明并指定对应的 `contentDir`，同时确保该目录下存在 `_index.md`。
5. **构建环境一致性**：本地开发应与 CI 保持一致的 Hugo 版本（`0.139.4`），否则可能出现渲染差异。
6. **产出目录固定为 `docs/`**：`publishDir` 已设为 `docs`，提交时应忽略 `public/`，将 `docs/` 作为 GitHub Pages 源目录。
