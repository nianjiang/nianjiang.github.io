---
kind: frontend_style
name: 基于 Hugo Book 主题的 SCSS 主题系统
category: frontend_style
scope:
    - '**'
source_files:
    - themes/hugo-book/assets/book.scss
    - themes/hugo-book/assets/_defaults.scss
    - themes/hugo-book/assets/themes/_light.scss
    - themes/hugo-book/assets/themes/_dark.scss
    - themes/hugo-book/assets/themes/_auto.scss
    - themes/hugo-book/assets/_main.scss
    - themes/hugo-book/assets/_markdown.scss
    - themes/hugo-book/assets/_custom.scss
    - themes/hugo-book/assets/_variables.scss
    - config.yaml
---

本博客站点采用 `hugo-book` 第三方主题作为前端样式基础，通过 SCSS + CSS 变量实现可配置的主题系统。整体风格为简洁的文档型阅读界面，支持明暗双主题与自动切换。

## 样式架构

- **构建入口**：`themes/hugo-book/assets/book.scss` 作为唯一编译入口，按顺序引入 defaults → variables → themes → normalize → utils → main → fonts → print → markdown → shortcodes → custom
- **主题变量层**：`_defaults.scss` 定义所有设计令牌（颜色、字号、间距、断点），使用 SASS `!default` 机制允许覆盖
- **主题模式**：`themes/_light.scss` / `_dark.scss` / `_auto.scss` 分别对应 light/dark/auto 三种模式，通过 `@include theme-light` / `theme-dark` mixin 注入 CSS 变量到 `:root`
- **布局层**：`_main.scss` 定义三栏布局（侧边菜单 + 正文 + 目录）、响应式行为、移动端抽屉式导航
- **内容层**：`_markdown.scss` 专注 Markdown 渲染产物（标题、代码块、表格、引用等）的排版

## 设计令牌体系

核心变量集中在 `_defaults.scss`：
- **颜色**：`--gray-100/200/500`、`--body-background/font-color`、`--color-link/visited-link`、`--hint-color-*`
- **尺寸**：`$padding-{1,4,8,16}`、`$font-size-base/12/14/16`、`$menu-width/toc-width`、`$container-max-width`、`$mobile-breakpoint`
- **交互**：`$border-radius`、`$body-font-weight`

## 主题定制方式

项目根目录提供两个扩展点：
- `themes/hugo-book/assets/_variables.scss` — 覆盖 SASS 变量（如 `$font-size-base`）
- `themes/hugo-book/assets/_custom.scss` — 追加自定义 CSS 规则

运行时主题由 `config.yaml` 中 `params.BookTheme` 控制，当前设为 `"light"`，可选值包括 `light`、`dark`、`auto`。

## 响应式策略

- 断点由 `$mobile-breakpoint = $menu-width + $body-min-width * 1.2 + $toc-width` 动态计算
- 小屏下侧边栏变为抽屉式（CSS checkbox hack 驱动），目录隐藏
- 大屏下增加额外内边距提升可读性

## 辅助能力

- 内置 KaTeX 数学公式渲染（`static/katex/`）
- Mermaid 图表支持（`static/mermaid.min.js`）
- FlexSearch 全文搜索（`assets/search.js` + `search-data.json`）
- Service Worker 离线缓存（`sw.js`）
- 多语言 i18n 文案（`i18n/*.yaml`）

## 开发者约定

1. 新增全局样式优先在 `_custom.scss` 中追加，而非修改主题源码
2. 调整设计令牌应在 `_variables.scss` 中覆盖对应 SASS 变量
3. 页面级样式建议使用 Markdown 短代码或局部 CSS，避免污染全局
4. 主题切换仅通过 `BookTheme` 参数配置，不建议 JS 动态切换