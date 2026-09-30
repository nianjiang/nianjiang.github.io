---
weight: 90
title: "Systems & Tools"
bookCollapseSection: true
bookToc: false
---


## Overview

[Google NCR (No Country Redirect)](https://www.google.com/ncr)

<br/>

## Tools
| 项目名称 | Doc | Github | Demo | Comment |
|---|---|---|---|---|
| [spug](https://ops.spug.cc/) | [Doc](https://ops.spug.cc/docs/about-spug) | [Github](https://github.com/openspug/spug) | [Demo](https://demo.spug.cc) | 自动化运维平台 |
| [Yearning](https://next.yearning.io/) | [Doc](https://next.yearning.io/) | [Github](https://github.com/cookieY/Yearning) | — | MySQL SQL 审核平台，支持 SQL 审计、查询审计、RBAC、AI 辅助优化 |

## VM Tools

1C1G 轻量云主机（如 OCI Always Free E2.1.Micro，配 2G swap 后常驻内存预算约 600-700MB）的用途清单，按常驻内存排序：

| 方案 | 常驻内存 | 价值点 |
|---|---|---|
| [Vaultwarden](https://github.com/dani-garcia/vaultwarden) | ~50MB | 自建 Bitwarden 兼容密码管理，Rust 编写极轻，日常价值最高 |
| Go Web 服务 | ~20MB/个 | 自研小服务：Telegram bot、webhook 接收器、API 中转 |
| [Restic](https://github.com/restic/restic) + [rest-server](https://github.com/restic/rest-server) | 极小（吃磁盘） | 加密去重备份端，把闲置磁盘变成所有工作区的异地备份点 |
| [Uptime Kuma](https://github.com/louislam/uptime-kuma) | ~150MB | 拨测监控站点 / 主机 / 服务，支持 Telegram、钉钉告警，运维刚需 |
| [Memos](https://github.com/usememos/memos) / [Miniflux](https://miniflux.app/) | ~50-200MB | 碎片笔记 / RSS 阅读器；Miniflux 可聚合英文学习信息源 |
| [Gitea](https://github.com/go-gitea/gitea) / [Forgejo](https://forgejo.org/) | ~400MB | 私有 Git 托管 + Gitea Actions 轻量 Go CI，契合 CI/CD 方向 |
| [k3s](https://github.com/k3s-io/k3s) + [Flux](https://fluxcd.io/) | ~500-600MB | 单节点 GitOps 实操实验室；ArgoCD 自身约 1G 太重，Flux 轻得多，swap 能兜住控制面 |

**Top 3 推荐**（K8s / Go / 博客 / 成本敏感画像）：

1. **Restic 备份端**：零内存成本，闲置磁盘变异地备份点，性价比之王
2. **k3s + Flux GitOps 实验室**：长期在线的真集群，随时做实验，与本地 kind 互补
3. **Gitea**：私有仓库镜像 + Go CI，与托管式流水线（云效等）形成自托管对照

**注意事项**：

- 对外服务需同时放行两道门：主机 iptables + 云厂商子网安全列表（Security List）
- 无域名 / HTTPS 前不要上线密码类服务（如 Vaultwarden）；Caddy 自动 HTTPS 是 1G 小机的最优解
- 角色分工：代理、面板、Docker 等重活留给大内存机器，小机保持「轻量常驻 + CLI 工具机」定位

## Free Compute

非 VM 型的长期免费计算资源（PaaS / Serverless / 云端开发环境），适合无法获得免费 VM 或不想维护服务器的场景：

| 平台 | 免费额度 | 备注 |
|---|---|---|
| [Koyeb](https://www.koyeb.com/) | 1 个 Web 服务永久免费：512MB RAM / 0.1 vCPU / 2GB 磁盘（法兰克福或华盛顿 DC） | 容器化 PaaS，可跑轻量常驻服务 |
| [Cloudflare](https://www.cloudflare.com/) | Workers 10 万请求/天；Pages 静态托管不限量；R2 10GB 存储 | 边缘 Serverless，非传统 VPS |
| [Render](https://render.com/) | 免费 Web 服务（空闲自动休眠）+ 免费 1GB Postgres | 适合 Demo 与低频服务 |
| [GitHub Codespaces](https://github.com/features/codespaces) | 120 core-hours + 15GB 存储/月（2 核约 60 小时） | 云端开发环境，非 24×7 服务器；适合 K8s 练习 |
| [Google Cloud Shell](https://cloud.google.com/shell) | 免费临时 VM + 5GB 持久化 home 目录，50 小时/周配额 | 免运维临时 Shell / 跳板 |
| [Hugging Face Spaces](https://huggingface.co/spaces) | 免费 CPU 实例（2 vCPU / 16GB） | 小型应用 / Demo 托管，AI 方向友好 |

## Reference

[CNCF Projects](https://www.cncf.io/projects/)

[Github](https://github.com/cncf)

[Website](https://www.cncf.io/)

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()
