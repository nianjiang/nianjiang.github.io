---
kind: external_dependency
name: Hugo 静态站点生成器
slug: hugo
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
---

本项目使用 Hugo 作为静态站点生成器，基于 hugo-book 主题构建技术博客。通过 Go module 方式引入 hugo-book 主题（github.com/alex-shpak/hugo-book），输出目录配置为 docs/，默认语言为中文。