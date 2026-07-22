---
kind: build_system
name: Hugo 静态站点构建与 GitHub Pages 部署流水线
category: build_system
scope:
    - '**'
source_files:
    - .github/workflows/hugo.yaml
    - config.yaml
    - hugo.toml
---

## 构建系统概览

本项目采用 Hugo + hugo-book 主题构建中文技术博客，通过 GitHub Actions 实现自动化构建与部署到 GitHub Pages。整个构建流程简洁清晰，遵循 Hugo 生态的标准约定。

## 核心构建配置

**配置文件结构：**
- `config.yaml`：主配置文件，定义站点元数据、主题、多语言支持、菜单、搜索等参数
- `hugo.toml`：备用 TOML 格式配置（当前使用 YAML）
- `.github/workflows/hugo.yaml`：GitHub Actions CI/CD 流水线

**关键构建参数：**
- 输出目录：`publishDir: docs`（直接部署到 GitHub Pages）
- 主题：`hugo-book`（通过 Hugo Modules 引入 `github.com/alex-shpak/hugo-book`）
- 语言：默认中文 (`defaultContentLanguage: "zh"`)，内容位于 `content/` 目录
- Git 信息：启用 `enableGitInfo: true` 用于显示最后修改时间
- 渲染：Goldmark Markdown 渲染器，支持 unsafe HTML

## CI/CD 流水线架构

**触发条件：**
- 推送到 `master` 分支时自动触发
- 支持手动触发 (`workflow_dispatch`)

**构建环境：**
- Ubuntu latest runner
- Hugo 版本固定为 `0.139.4` (extended 版本，支持 Sass/SCSS)
- Dart Sass 通过 snap 安装
- Node.js 依赖管理（兼容 npm ci）

**构建步骤：**
1. 安装 Hugo CLI (extended 版本)
2. 安装 Dart Sass 编译器
3. 递归检出代码子模块 (`submodules: recursive`)
4. 初始化 git submodule 获取 hugo-book 主题
5. 配置 GitHub Pages 环境
6. 安装 Node.js 依赖（如果存在 package-lock.json）
7. 执行构建：`hugo --gc --minify --theme hugo-book --baseURL "${pages.base_url}/"`
8. 上传 `./docs` 作为 artifact
9. 部署到 GitHub Pages

**并发控制：**
- 使用 `concurrency.group: "pages"` 防止重复部署
- `cancel-in-progress: false` 允许进行中的部署完成

## 构建产物与缓存策略

**环境变量优化：**
- `HUGO_CACHEDIR`：指向 `$RUNNER_TEMP/hugo_cache` 利用 GitHub Actions 缓存
- `HUGO_ENVIRONMENT` 和 `HUGO_ENV`：设置为 `production` 启用生产模式

**生成文件：**
- 静态资源输出到 `docs/` 目录
- 包含压缩的 CSS/JS 文件（带哈希值）
- 搜索索引文件 (`zh.search-data.min.*.json`, `en.search-data.min.*.json`)
- Service Worker 文件 (`sw.js`, `sw.min.*.js`)
- Sitemap 和 RSS 订阅源

## 开发工作流建议

1. **本地开发**：使用 `hugo server -D` 启动开发服务器
2. **主题更新**：通过 `git submodule update --remote` 更新 hugo-book 主题
3. **内容组织**：按主题分类在 `content/docs/` 下创建目录结构
4. **多语言支持**：通过 `content/` 下的语言特定目录管理不同语言内容
5. **构建验证**：提交前可在本地运行 `hugo --gc --minify` 验证构建

## 注意事项

- Hugo extended 版本是必需的，因为使用了 SCSS/Sass 样式编译
- GitHub Pages 部署需要仓库设置中启用 Pages 服务
- 主题通过 Hugo Modules 管理，确保网络连接正常以拉取依赖
- 搜索功能依赖 flexsearch，会在构建时生成索引文件