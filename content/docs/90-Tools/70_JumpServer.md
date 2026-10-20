---
weight: 70
title: "JumpServer"
---

> **JumpServer** 是飞致云（FIT2CLOUD）开源的堡垒机与特权访问管理（PAM）平台，符合 4A 规范（认证、授权、账号、审计），用于统一管控 SSH、Windows、数据库、Kubernetes、Web 站点、远程应用等各类资产，实现「事前授权、事中监察、事后审计」，满足等保合规要求。

# JumpServer 堡垒机学习笔记

## 基本信息

| 项目 | 说明 |
|---|---|
| 官网 | [jumpserver.org](https://www.jumpserver.org/) |
| 文档 | [docs.fit2cloud.com/jumpserver](https://docs.fit2cloud.com/jumpserver/) |
| GitHub | [jumpserver/jumpserver](https://github.com/jumpserver/jumpserver) |
| 开发方 | 杭州飞致云信息科技有限公司（FIT2CLOUD） |
| 首次发布 | 2014 年（v0.1），2017 年 11 月加入飞致云 |
| 最新版本 | v5.1.0（社区版离线安装包）；v5.0.0 于 2026 年 9 月发布 |
| 技术栈 | 后端 Python / Django，前端 Vue.js / Element UI |
| 许可证 | GPL-3.0（社区版） |
| GitHub Stars | 31.8k+（2026 年 10 月） |
| 默认数据库 | PostgreSQL 16（v4.0 起默认，兼容 MySQL） |
| 部署方式 | Docker 一键部署 / 离线安装包 / 商业一体机 |
| 体验环境 | [demo.jumpserver.org](https://demo.jumpserver.org/) |
| 商业化 | 企业版（X-Pack 订阅）、一体机、信创版 |

## 堡垒机与 4A 规范

### 什么是堡垒机

堡垒机（Bastion Host）是运维流量的统一入口：运维人员不再直接登录目标服务器，而是先登录堡垒机，由堡垒机完成身份认证、权限校验、协议代理，并全程记录操作行为。它解决三个核心问题：

1. **谁在什么时候登录了哪台机器**（身份与行为可追溯）
2. **能做什么、不能做什么**（权限最小化）
3. **出了问题如何回放取证**（录像与命令审计）

### 4A 规范

JumpServer 的产品设计围绕 4A 展开，这也是等级保护对运维审计类产品的基本要求：

| 4A | 含义 | JumpServer 对应能力 |
|---|---|---|
| Authentication（认证） | 确认「你是谁」 | 本地认证、LDAP / AD、SSO、MFA |
| Authorization（授权） | 决定「你能做什么」 | 资产 / 账号 / 动作 / 时间授权、命令过滤 |
| Accounting（账号管理） | 管理「用什么身份连资产」 | 账号发现、推送、改密、备份 |
| Auditing（审计） | 记录「你做过什么」 | 会话录像、命令审计、文件传输审计 |

## 产品演进（V1 → V5）

| 代际 | 时间 | 关键变化 |
|---|---|---|
| V1 | 2018.03 | 全面开源、符合 4A 规范、分布式部署、支持 Windows RDP、Docker 部署、录像云端存储 |
| V2 | 2020.06 | 使用 Vue + Element UI 重构前端，进入 2.0 时代 |
| V3 | 2023.02 | 界面重设计；资产与应用合并；账号体系重构（新增账号模板）；权限集中控制；远程应用自动部署 |
| V4 | 2024.07 | 全球化；安装包瘦身（社区版 2.7GB → 1GB）；默认 PostgreSQL；**社区版资产上限 5,000 台**；社区版移除 Magnus（不再支持数据库原生客户端直连） |
| V5 | 2026.09 | 原生客户端（一个客户端访问所有资产）；内置 AI（智能命令推荐、操作风险预警、自动化审计报告） |

> 版本节奏：社区版保持**月度发布**，适配新场景的速度明显快于传统商业堡垒机的年度发布周期。

## 核心架构

### 分层架构

```
┌───────────────────────────────────────────────────────────────────┐
│ 负载层    Nginx / HAProxy / F5 / 云负载均衡                        │
├───────────────────────────────────────────────────────────────────┤
│ 接入层    KoKo(SSH/SFTP/Web)   Chen(Web 数据库)   Luna(终端/客户端) │
│           [企业版] Razor(RDP)  Magnus(DB 直连)  Nec(VNC)  Panda     │
├───────────────────────────────────────────────────────────────────┤
│ 核心层    Core（Python/Django，REST API）+ Lina（控制台）+ Kael(AI) │
├───────────────────────────────────────────────────────────────────┤
│ 数据层    PostgreSQL 16（默认）/ MySQL  ·  Redis                    │
├───────────────────────────────────────────────────────────────────┤
│ 存储层    本地磁盘 / 共享文件存储 / 对象存储（S3、OSS、COS 等）     │
└───────────────────────────────────────────────────────────────────┘
```

架构要点：

- **分层解耦**：每一层都可独立水平扩展，并发压力主要落在接入层，扩容接入层节点即可提升并发能力
- **分布式与多地域**：总部部署核心节点，分支机构只部署接入节点并注册到核心节点，实现「集中管理 + 就近访问」
- **容器化**：各组件以独立容器运行，可整体部署，也可按需拆分启停

### 组件清单

| 组件 | 职责 | 版本归属 |
|---|---|---|
| Core | 核心服务，用户 / 资产 / 授权 / 审计的 REST API | 社区版 |
| Lina | Web 管理控制台 | 社区版 |
| Luna | Web 终端 / 原生客户端界面 | 社区版 |
| KoKo | 通用协议连接器与代理（SSH、SFTP、Web Terminal） | 社区版 |
| Chen | Web 数据库连接器（Web CLI / Web GUI） | 社区版 |
| Kael | AI 组件（智能问答等） | 社区版 |
| Tinker | Windows 应用连接器（RemoteApp） | 社区版免费 |
| Panda | Linux 虚拟应用连接器 | 企业版 |
| Razor | RDP 协议代理（原生客户端 / 高清 RDP） | 企业版 |
| Magnus | 数据库协议代理（原生客户端直连） | 企业版 |
| Nec | VNC 协议代理 | 企业版 |
| Video Worker | 会话录像转码服务 | 企业版 |
| JDMC | 设备管理控制台（宿主机 systemd 服务，管理堡垒机所在服务器） | 企业版 |
| Installer | 安装与运维工具（jmsctl.sh） | 社区版 |
| Docker Web | Web 网关与静态资源 | 社区版 |

## 核心功能

### 支持的资产类型

| 资产类型 | 协议 / 方式 | 说明 |
|---|---|---|
| Linux / Unix / 网络设备 | SSH、Telnet、SFTP | Web Terminal 或本地 SSH 客户端 |
| Windows | RDP、VNC | Web 方式或原生客户端 |
| 数据库 | MySQL、MariaDB、Oracle、SQL Server、PostgreSQL、ClickHouse、DB2、达梦、Redis、MongoDB | Web CLI / Web GUI；原生客户端直连为企业版能力 |
| 云服务 | Kubernetes、VMware vSphere | K8s 运维审计、云资产纳管 |
| Web 站点 | HTTP(S) 代理 | 纳管各类系统的 Web 管理后台 |
| 应用 | RemoteApp / VirtualApp | Windows 应用（社区版默认 Chrome、DBeaver）；Linux 虚拟应用为企业版 |

### 认证与访问控制

- **登录认证**：本地认证、LDAP / AD、CAS、OIDC / OAuth2 / SAML2、Passkey / WebAuthn、扫码登录（企业微信 / 钉钉 / 飞书，企业版）
- **多因素认证**：TOTP（社区版）；RADIUS 二次认证、短信认证、人脸识别（企业版）
- **授权模型**：按「用户 / 用户组 × 资产 / 资产节点 × 账号 × 动作」四维授权，支持继承父节点授权、时间授权、协议授权
- **动作控制**：上传、下载、删除、连接、会话分享；RDP 剪贴板控制
- **命令过滤**：按授权账号控制可执行命令，高危命令实时告警
- **工单审批**：资产工单申请、登录复核、二级审批流程（企业版）

### 账号管理（PAM）

| 能力 | 说明 | 版本 |
|---|---|---|
| 账号发现 | 定期扫描资产上的系统账号 | 社区版 |
| 账号推送 | 定期将账号推送到资产 | 社区版 |
| 账号模板 | 快速生成与关联账号 | 企业版 |
| 账号改密 | 定期批量修改密码，支持多种密码策略 | 企业版 |
| 账号备份 | 定期备份账号信息，邮件 / SFTP 加密发送 | 企业版 |
| 密码保险库 | 内置 OpenBao，或对接 HashiCorp Vault、Azure Key Vault、AWS Secrets Manager | 企业版 |

### 安全审计

- **会话审计**：在线 / 历史会话查看，支持水印，管理员可实时监控并中断、暂停会话
- **录像审计**：全程操作录像回放；可上传至对象存储长期保存
- **命令审计**：命令级日志、高危命令告警
- **文件传输审计**：上传 / 下载记录
- **日志审计**：登录日志、操作日志、改密日志，可同步至 Syslog / SIEM

### 作业与自动化

- **作业中心**：批量命令、脚本、Playbook，对多台资产执行自动化任务
- **批量文件传输**
- **开放 API**：RESTful API（Swagger），可与 Ansible、Jenkins、Zabbix、LDAP/AD、企业微信、钉钉等集成

## 竞品比较

堡垒机 / PAM 市场大致分为三条路线：**开源访问代理**（Teleport、Guacamole、Boundary）、**商业 PAM 套件**（CyberArk、BeyondTrust）、**国产传统商业堡垒机**（齐治、帕拉迪）。JumpServer 的定位介于「开源堡垒机」与「PAM 平台」之间。

### 横向对比

| 产品 | 定位 | 开源 / 许可 | 协议与资产覆盖 | 审计能力 | 部署复杂度 | 价格模式 | 典型场景 |
|---|---|---|---|---|---|---|---|
| **JumpServer** | 开源堡垒机 + PAM | GPL-3.0 | SSH / RDP / VNC / 数据库 / K8s / Web / RemoteApp，覆盖最广 | 视频录像 + 命令级审计（社区版即含） | 低（Docker 约 30 分钟） | 社区版免费（≤5,000 资产）；企业版订阅 | 混合 IT、等保合规、成本敏感团队 |
| Teleport | 身份原生访问代理 | Apache-2.0（社区版） | SSH / K8s / 数据库 / Web 应用；图形化 RDP 能力有限 | 以会话日志为主，高级审计需企业版 | 中 | 社区版免费；企业版按席位订阅 | 云原生、K8s、证书化零信任接入 |
| Apache Guacamole | 无客户端远程桌面网关 | Apache-2.0 | RDP / VNC / SSH / Telnet | 基础会话录制（需自行配置与保存），无命令级审计 | 低 | 完全免费 | 仅需浏览器打开远程桌面，非完整 PAM |
| HashiCorp Boundary | 身份化访问管理 | BUSL-1.1（源码公开，非 OSI 开源；仓库已归档） | SSH / K8s / 数据库（插件） | 录像依赖 HCP / 企业版 | 中 | 开源版 + HCP 订阅 | HashiCorp 生态用户（注意项目已归档） |
| CyberArk | 企业级 PAM 标杆 | 闭源 | 协议与系统覆盖广 | 完整（PSM 录像、CPM 改密） | 高（6–12 周、7+ 组件） | 约 $30,000+/年起 | 大型金融、强监管行业 |
| BeyondTrust | 商业 PAM 套件 | 闭源 | SSH / RDP / DB / K8s + 终端权限管理（EPM） | 完整 | 中高 | 按模块报价 | 需要终端权限管理的大型企业 |
| 齐治科技（Shterm） | 国产传统商业堡垒机 | 闭源 | 以传统协议为主 | 完整 | 中（本地化部署，周级） | License + 年度维保 | 政企、金融，重视供应商资质 |
| 帕拉迪 | 国产传统商业堡垒机 | 闭源 | 传统 4A 能力 | 完整 | 中（本地化部署，周级） | License + 年度维保 | 大型企业 |

> 数据综合自各厂商官方文档与公开资料（截至 2026 年 10 月）；JumpServer 侧对比数据来自其官方对比页，存在厂商立场，商业产品的价格与能力请以厂商最新报价和 PoC 实测为准。

### 三条路线的差异

1. **开源访问代理（Teleport / Guacamole / Boundary）**：核心解决「安全接入」，证书化、身份化是趋势；但账号治理（改密、轮转、保险库）和合规审计（录像、命令级日志）通常不完整或需付费。
2. **商业 PAM（CyberArk / BeyondTrust）**：能力最完整，覆盖特权账号全生命周期，甚至延伸到终端权限管理；代价是采购成本高、实施周期长、架构复杂。
3. **国产传统堡垒机（齐治 / 帕拉迪）**：在政企市场的采购惯性和本地服务上有优势；短板是闭源不可审计、迭代慢（年度 / 半年度）、TCO 偏高、API 开放度有限。

JumpServer 的差异化在于：**社区版即包含会话录像、命令审计、命令过滤等审计闭环能力**，协议覆盖比纯访问代理更广，部署门槛远低于商业 PAM，同时通过 X-Pack 补齐多租户、审批、密码轮转等企业能力。

### 选型建议

| 场景 | 推荐 |
|---|---|
| K8s 为主、追求证书化零信任接入的云原生团队 | Teleport |
| 只需浏览器访问远程桌面，无审计与权限治理需求 | Apache Guacamole |
| 混合 Linux / Windows / 数据库 / 网络设备 + 等保合规 | JumpServer |
| 大型金融 / 央企，预算充足，要求完整 PAM 生态与全球原厂支持 | CyberArk / BeyondTrust |
| 信创替代 + 传统采购流程 | JumpServer 信创版 / 齐治 / 帕拉迪 |

## 社区版 vs 企业版

JumpServer 采用「开源社区版 + 企业版 X-Pack 增强包」模式：社区版基于 GPL-3.0 免费开放，企业版以订阅方式提供增强功能与原厂支持。**功能边界随版本演进（当前为 v5.1.0），最终以官方[版本对比页](https://www.jumpserver.org/features.html)为准。**

### 版本差异对比

| 模块 | 能力项 | 社区版 | 企业版（X-Pack） |
|---|---|---|---|
| 基础 | 授权模式 | GPL-3.0，永久免费 | 商业订阅（14 天试用） |
| 基础 | 资产规模上限 | 5,000 台（v4.0 起） | 不限 |
| 基础 | SSH / SFTP / Web Terminal | ✅ | ✅ |
| 基础 | Kubernetes 运维审计 | ✅ | ✅ |
| 基础 | 会话录像 / 命令审计 / 文件传输审计 | ✅ | ✅ |
| 基础 | 命令过滤 / 时间·IP 授权 | ✅ | ✅ |
| 基础 | 作业中心（批量命令 / 脚本 / Playbook） | ✅ | ✅ |
| 认证 | 本地认证、LDAP / AD | ✅ | ✅ |
| 认证 | SSO（OIDC / OAuth2 / SAML2）、CAS、Passkey | ✅ | ✅ |
| 认证 | TOTP 多因素认证 | ✅ | ✅ |
| 认证 | RADIUS、LDAP HA、企业微信 / 钉钉 / 飞书扫码 | ❌ | ✅ |
| 认证 | 短信 / 人脸识别二次认证 | ❌ | ✅ |
| 访问控制 | 基础 RBAC、资产授权、命令过滤 | ✅ | ✅ |
| 访问控制 | 登录复核 / 登录限制（IP、时间段） | ❌ | ✅ |
| 访问控制 | 工单审批（资产申请、二级审批） | ❌ | ✅ |
| 访问控制 | 多租户 / 多组织隔离 | ❌ | ✅ |
| 资产接入 | Windows RemoteApp（Tinker） | ✅ | ✅ |
| 资产接入 | Linux 虚拟应用（Panda） | ❌ | ✅ |
| 资产接入 | RDP 原生客户端 / 高清 RDP（Razor） | ❌ | ✅ |
| 资产接入 | VNC 代理（Nec） | ❌ | ✅ |
| 资产接入 | 数据库：PostgreSQL Web CLI / Web GUI | ✅ | ✅ |
| 资产接入 | 数据库：MySQL / Oracle / SQL Server / Redis / MongoDB 等全量支持 | ❌ | ✅ |
| 资产接入 | 数据库原生客户端直连（Magnus） | ❌ | ✅ |
| 资产接入 | 云资产自动同步（23+ 公有云 / 私有云平台） | ❌ | ✅ |
| PAM | 账号发现 / 账号推送 | ✅ | ✅ |
| PAM | 账号改密 / 密码轮转 | ❌ | ✅ |
| PAM | 账号备份 / 密码保险库（OpenBao） | ❌ | ✅ |
| PAM | 账号风险检测 | ❌ | ✅ |
| 审计存储 | 本地录像存储与回放 | ✅ | ✅ |
| 审计存储 | 对象存储（S3 / OSS / COS / OBS / Ceph / Swift / Azure） | ❌ | ✅ |
| 审计存储 | 录像转码服务（Video Worker） | ❌ | ✅ |
| 平台 | 主机运维管理（JDMC，宿主机 systemd 服务） | ❌ | ✅ |
| 平台 | 自定义 Logo / 主题 | ❌ | ✅ |
| 平台 | 安装架构 | 仅 linux/amd64 离线包 | x86_64 / aarch64 / loong64，信创一体机 |
| 服务 | 高可用 / 分布式部署 | 支持（自行实施） | 原厂方案 + 实施支持 |
| 服务 | 支持渠道 | GitHub / 社区论坛 | 原厂 7×24、SLA、迁移与运维最佳实践 |

### 关键结论

- **中小团队**：社区版功能已覆盖堡垒机核心闭环（认证、授权、录像、命令审计、命令过滤），5,000 台资产以内可长期免费使用
- **中大型企业**：多租户、审批流、密码轮转、数据库全量接入、对象存储、信创架构等能力需要企业版
- **X-Pack 是部署模式开关**：安装参数 `USE_XPACK=1` 会启用 Video Worker、JDMC 等企业组件（安装器层面），最终能力仍以许可证为准
- 企业版还提供一体机（软硬一体）与信创版本，适合政企交付场景

## 部署实践

### 环境要求

- Linux 64 位系统，内核 ≥ 4.0（**社区版离线包仅支持 linux/amd64**，ARM 等架构需申请企业版）
- 官方 Quickstart 最低要求：**4 vCPU / 8 GB 内存**
- 录像、任务日志与备份默认存放在 `VOLUME_DIR`（默认 `/data/jumpserver`），生产环境建议使用独立数据盘
- 安装器会自动完成 Docker 安装与配置

### 在线快速安装（体验 / 测试）

```shell
curl -sSL https://github.com/jumpserver/jumpserver/releases/latest/download/quick_start.sh | bash
```

安装完成后访问 `http://<服务器IP>/`，默认账号 `admin`，默认密码 `ChangeMe`（**首次登录必须修改**）。

### 离线安装（生产推荐）

```shell
cd /opt
# 上传并解压离线包（以 v5.1.0 为例）
tar -xf jumpserver-ce-5.1.0-x86_64.tar.gz
cd jumpserver-ce-5.1.0-x86_64

# 按需修改配置（SECRET_KEY、BOOTSTRAP_TOKEN、数据库、Redis、端口等）
cat config-example.txt

# 安装并启动
./jmsctl.sh install
./jmsctl.sh start
```

`install` 阶段安装器会自动完成：生成 `config.txt` 与密钥、安装 Docker、加载组件镜像、初始化数据库（默认内置 PostgreSQL 16）、初始化数据。

### jmsctl.sh 管理命令

| 命令 | 说明 |
|---|---|
| `./jmsctl.sh install` | 首次安装（生成配置、安装 Docker、加载镜像、初始化数据库） |
| `./jmsctl.sh start` / `stop` / `restart` | 启动 / 停止 / 重启服务 |
| `./jmsctl.sh upgrade` | 升级 |
| `./jmsctl.sh uninstall` | 卸载 |
| `./jmsctl.sh status` | 查看服务状态 |
| `./jmsctl.sh tail [组件]` | 查看日志（如 `tail jdmc`） |
| `./jmsctl.sh backup_db` | 备份数据库 |
| `./jmsctl.sh --help` | 查看全部命令 |

### 常用端口

| 端口 | 用途 |
|---|---|
| 80 / 443 | Web 访问（HTTP / HTTPS） |
| 2222 | SSH 代理（KoKo） |
| 3389 | RDP 代理（企业版 Razor） |
| 5525 | 数据库代理（企业版 Magnus） |

### 典型部署架构

| 模式 | 适用场景 | 要点 |
|---|---|---|
| 单机部署 | 小规模、测试环境 | 一键安装，Docker 单栈 |
| 主主 / 主备 | 生产高可用 | 负载均衡 + 至少 2 个 JumpServer 节点 + 外部高可用数据库 + 共享存储 / 对象存储 |
| 分布式部署 | 高并发、多资产 | 水平扩展接入层节点（KoKo / Chen 等），核心层与数据层共享 |
| 总部 - 分支 | 多地域、多分支机构 | 总部部署核心节点，分支只部署接入节点并注册到核心，结合 DNS 调度实现就近访问 |

## 使用入门

### 资产纳管流程

1. **创建用户 / 用户组**：对接 LDAP / AD 或本地创建
2. **添加资产**：手动添加、CSV 导入，或云同步（企业版）
3. **创建账号**：配置资产的登录凭据（密码 / 密钥）
4. **资产授权**：按「用户 / 用户组 + 资产节点 + 账号 + 动作」授权，遵循最小权限
5. **连接资产**：用户登录后通过 Web 终端、原生客户端或本地客户端连接
6. **审计回看**：管理员在审计台查看会话录像、命令记录、文件传输记录

### 三种连接方式

| 方式 | 说明 | 适用场景 |
|---|---|---|
| Web Terminal | 纯浏览器，无需安装插件 | 日常运维、临时访问、第三方人员 |
| 原生客户端 | v5 统一客户端，一个客户端访问所有类型资产 | 高频运维、多资产类型混合 |
| 本地客户端 | SSH / RDP / 数据库客户端直连堡垒机代理端口 | 习惯本地工具的 DBA 与运维（部分能力为企业版） |

## 安全加固建议

1. **修改默认密码**：首次登录立即修改 `admin` 的 `ChangeMe` 密码
2. **启用 HTTPS**：配置 `SERVER_NAME`、`SSL_CERTIFICATE`、`SSL_CERTIFICATE_KEY`，避免凭据明文传输
3. **保管核心密钥**：`SECRET_KEY`、`BOOTSTRAP_TOKEN` 必须保密；迁移环境时必须与原环境保持一致
4. **最小化端口暴露**：仅对必要来源开放 Web 与管理端口；SSH 代理端口（2222）按需调整
5. **最小权限授权**：按角色与资产节点授权，敏感资产启用命令过滤与高危命令告警
6. **定期备份**：使用 `jmsctl.sh backup_db` 并备份 `VOLUME_DIR`（含录像与配置）
7. **及时升级**：关注[安全公告](https://www.jumpserver.org/security.html)，社区版月度发布，漏洞修复响应较快
8. **生产架构隔离**：数据库、Redis、存储使用外部高可用服务，避免单点
9. **关闭不需要的组件与遥测**：通过 `config.txt` 中的 `*_ENABLED` 开关精简组件；不需要匿名安装遥测时可设置 `INSTALLATION_TELEMETRY_ENABLED=false`

## 与云原生生态的结合

- **Kubernetes 审计**：将 K8s 作为资产纳管，对 `kubectl` 等运维操作进行录像与命令审计
- **API 集成**：RESTful API 可与 CMDB、工单系统、自动化平台双向同步资产与授权
- **CI/CD 集成**：作业中心与 API 可对接 Jenkins、Ansible，实现受审计的批量运维
- **容器化交付**：整套组件以容器运行，便于在云主机、私有云与信创环境中标准化交付

## 参考链接

- [JumpServer 官方文档](https://docs.fit2cloud.com/jumpserver/)
- [产品介绍](https://docs.fit2cloud.com/jumpserver/product-intro)
- [GitHub 仓库](https://github.com/jumpserver/jumpserver)
- [离线安装指南](https://docs.fit2cloud.com/jumpserver/installation/setup_linux_standalone/offline_install)
- [版本对比（社区版 vs 企业版）](https://www.jumpserver.org/features.html)
- [企业版介绍](https://www.jumpserver.org/enterprise.html)
- [技术白皮书](https://whitepaper.jumpserver.org/)
- [JumpServer vs Teleport](https://www.jumpserver.com/jumpserver-vs-teleport)
- [JumpServer vs CyberArk](https://www.jumpserver.com/jumpserver-vs-cyberark)
- [JumpServer vs BeyondTrust](https://www.jumpserver.com/jumpserver-vs-beyondtrust)
- [在线 Demo](https://demo.jumpserver.org/)
- [安全公告](https://www.jumpserver.org/security.html)
