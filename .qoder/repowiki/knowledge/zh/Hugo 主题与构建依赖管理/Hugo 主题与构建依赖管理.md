---
kind: dependency_management
name: Hugo 主题与构建依赖管理
category: dependency_management
scope:
    - '**'
source_files:
    - .gitmodules
    - config.yaml
    - .github/workflows/hugo.yaml
    - themes/hugo-book/go.mod
---

本仓库是一个基于 Hugo 静态站点生成器的个人博客，其“依赖”主要包含三类：Hugo CLI、hugo-book 主题（Go 模块 + Git 子模块）、以及可选的 Node.js 前端资源。整体采用“Git 子模块 + Hugo Module 声明 + CI 固定版本”的组合策略。

1. 使用的系统与工具
- Hugo CLI：通过 GitHub Actions 在构建时从官方 release 下载指定版本的 hugo_extended.deb 安装，版本号由环境变量 HUGO_VERSION=0.139.4 锁定。
- Hugo Book 主题：同时以两种方式被引用——
  - Git 子模块：`.gitmodules` 将 `themes/hugo-book` 指向 `https://github.com/alex-shpak/hugo-book`；CI 中执行 `git submodule update --init --recursive` 拉取。
  - Hugo Module：`config.yaml` 的 `module.imports.path = github.com/alex-shpak/hugo-book` 声明了同一主题的 Go 模块路径，供 Hugo 模块系统解析。
- Dart Sass：CI 通过 `snap install dart-sass` 安装，用于编译 SCSS。
- Node.js 依赖：CI 中尝试 `npm ci`，但仅当存在 `package-lock.json` 或 `npm-shrinkwrap.json` 时才执行；根目录未检出此类文件，因此当前不引入 npm 依赖。

2. 关键文件与位置
- `.gitmodules`：定义 hugo-book 主题作为 Git 子模块，提交后主题源码随仓库一起被克隆。
- `config.yaml`：
  - `theme: 'hugo-book'` 指定默认主题。
  - `module.imports.path: github.com/alex-shpak/hugo-book` 声明 Hugo 模块依赖。
  - `publishDir: docs` 指定构建输出目录，与 CI 上传 artifact 的路径一致。
- `.github/workflows/hugo.yaml`：
  - `HUGO_VERSION: 0.139.4` 固定 Hugo 版本。
  - `submodules: recursive` 确保子模块被拉取。
  - 使用 `hugo --gc --minify --theme hugo-book --baseURL ...` 进行构建。
- `themes/hugo-book/go.mod`：主题自身的 Go module 声明（`module github.com/alex-shpak/hugo-book`，`go 1.16`），表明该主题本身是独立的 Go 模块，但本项目并未将其纳入自己的 go.mod 依赖图。

3. 架构与约定
- 主题来源双重保障：既通过 Git 子模块把主题源码直接带入仓库，又通过 Hugo Module 声明保持与上游模块系统的兼容性。CI 优先使用子模块中的本地副本。
- 版本锁定集中在 CI：Hugo 版本通过 workflow 中的环境变量固定；主题版本通过 `.gitmodules` 中记录的 commit SHA 锁定（需配合 `git submodule update`）。
- 无全局 go.mod：项目根目录没有 `go.mod`/`go.sum`，说明本仓库不直接依赖任何第三方 Go 包，仅消费 hugo-book 主题。
- 无私有注册表/GOPRIVATE：所有依赖均来自公开源（GitHub Releases、GitHub 仓库、Snap Store），未配置 GOPROXY、GOPRIVATE 或 npm registry 镜像。

4. 开发者应遵循的规则
- 升级 Hugo 版本：修改 `.github/workflows/hugo.yaml` 中的 `HUGO_VERSION`，并确保本地安装的 Hugo 与之保持一致，避免构建差异。
- 升级 hugo-book 主题：
  - 更新子模块：`git submodule update --remote themes/hugo-book`，并提交新的子模块 commit。
  - 如需启用 Hugo Module 行为（如覆盖 partials），确认 `config.yaml` 中 `module.imports` 仍指向正确路径。
- 添加前端依赖：若需要 npm 包，应在根目录创建 `package.json` 并运行 `npm i` 生成 `package-lock.json`，以便 CI 的 `npm ci` 步骤生效。
- 本地构建：确保本地 Hugo 版本与 CI 一致（可通过 `.hugo-version` 文件或文档约定），并使用 `hugo --gc --minify --theme hugo-book` 命令复现生产构建。
- 不要手动编辑 `themes/hugo-book` 下的源码而不更新子模块指针，否则会导致不同环境间主题实现不一致。