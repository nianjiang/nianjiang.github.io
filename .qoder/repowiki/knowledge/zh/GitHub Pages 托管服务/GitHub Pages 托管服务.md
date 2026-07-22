---
kind: external_dependency
name: GitHub Pages 托管服务
slug: github-pages
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
---

站点部署到 GitHub Pages，baseURL 指向 https://nianjiang.github.io/，通过 .github/workflows/hugo.yaml 中的 GitHub Actions 工作流进行自动化构建和发布。