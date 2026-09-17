---
weight: 80
title: "Vaultwarden"
---

> **Vaultwarden** 是一个用 Rust 编写的轻量级 [Bitwarden](https://bitwarden.com/) 兼容服务端实现，适合自托管部署。
> 原名 Bitwarden_RS，后因商标问题更名为 Vaultwarden。

## 基本信息

| 项目 | 说明 |
|---|---|
| 官网 | [vaultwarden.net](https://www.vaultwarden.net/) / [vaultwarden.com](https://vaultwarden.com/) |
| 文档 | [GitHub Wiki](https://github.com/dani-garcia/vaultwarden/wiki) |
| GitHub | [dani-garcia/vaultwarden](https://github.com/dani-garcia/vaultwarden) |
| 语言 | Rust |
| 协议 | AGPL-3.0 |
| 镜像 | `vaultwarden/server:latest`（[Docker Hub](https://hub.docker.com/r/vaultwarden/server) / [GHCR](https://github.com/dani-garcia/vaultwarden/pkgs/container/vaultwarden)） |
| 客户端 | 兼容 Bitwarden 官方客户端（浏览器扩展、桌面、移动端） |

## Vaultwarden vs Bitwarden 官方服务端

| 对比维度 | Vaultwarden | Bitwarden 官方自托管 |
|---|---|---|
| 语言 | Rust | .NET (C#) |
| 内存占用 | ~50-100 MB | ~1-2 GB |
| 数据库 | SQLite（默认）/ PostgreSQL / MySQL / MariaDB | 仅 SQL Server |
| 付费功能 | 全部免费解锁 | 需购买许可证 |
| 客户端 | 兼容 Bitwarden 官方客户端 | Bitwarden 官方客户端 |
| 适合场景 | 个人 / 家庭 / 小团队 | 中大型企业 |
| 官方支持 | 社区支持 | 官方商业支持 |
| 反向代理 | 推荐（HTTPS 必需） | 推荐 |

## 核心功能

- **个人密码库**：加密存储密码、信用卡、安全笔记等
- **Send**：加密分享文本/文件，可设过期时间和访问次数
- **附件**：支持加密附件存储
- **组织与集合**：团队密码共享、角色权限管理
- **多因素认证**：Authenticator、Email、FIDO2 WebAuthn、YubiKey、Duo
- **紧急访问**：设置紧急联系人，防止账号锁定
- **管理后台**：Web 管理面板，管理用户和组织
- **网站图标**：自动获取登录项的网站图标
- **个人 API Key**：支持自动化集成

## Docker 部署

### 最简启动

```shell
docker pull vaultwarden/server:latest
docker run --detach --name vaultwarden \
  --env DOMAIN="https://vw.example.com" \
  --volume /vw-data/:/data/ \
  --restart unless-stopped \
  --publish 127.0.0.1:8000:80 \
  vaultwarden/server:latest
```

### Docker Compose（推荐）

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: unless-stopped
    environment:
      DOMAIN: "https://vw.example.com"
      # ADMIN_TOKEN: "your-admin-token"  # 管理后台令牌
    volumes:
      - ./vw-data/:/data/
    ports:
      - 127.0.0.1:8000:80
```

### 配合 Caddy 反向代理

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: unless-stopped
    environment:
      DOMAIN: "https://vw.example.com"
    volumes:
      - ./vw-data/:/data/
    expose:
      - "80"

  caddy:
    image: caddy:latest
    restart: unless-stopped
    ports:
      - 80:80
      - 443:443
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./caddy-data:/data
      - ./caddy-config:/config
```

Caddyfile 示例：

```
vw.example.com {
    reverse_proxy vaultwarden:80
}
```

## 常用环境变量

| 变量 | 说明 | 示例 |
|---|---|---|
| `DOMAIN` | 访问域名（必须，含协议） | `https://vw.example.com` |
| `ADMIN_TOKEN` | 管理后台访问令牌 | `openssl rand -base64 48` |
| `SMTP_HOST` | SMTP 服务器地址 | `smtp.example.com` |
| `SMTP_FROM` | 发件人邮箱 | `noreply@example.com` |
| `SMTP_PORT` | SMTP 端口 | `587` |
| `SMTP_SECURITY` | 加密方式 | `starttls` / `force_tls` |
| `SMTP_USERNAME` | SMTP 用户名 | |
| `SMTP_PASSWORD` | SMTP 密码 | |
| `SIGNUPS_ALLOWED` | 是否允许注册 | `true` / `false` |
| `INVITATIONS_ALLOWED` | 是否允许邀请 | `true` / `false` |
| `DATABASE_URL` | 数据库连接串 | `postgresql://user:pass@host/db` |
| `LOG_LEVEL` | 日志级别 | `info` / `warn` / `error` |

## 数据库配置

### SQLite（默认，适合个人/小团队）

无需额外配置，数据存储在 `/data/db.sqlite3`。

### PostgreSQL

```yaml
environment:
  DATABASE_URL: "postgresql://vw_user:vw_pass@postgres:5432/vaultwarden"
```

### MySQL / MariaDB

```yaml
environment:
  DATABASE_URL: "mysql://vw_user:vw_pass@mysql:3306/vaultwarden"
```

## 备份与恢复

### 备份

```shell
# SQLite 备份
docker exec vaultwarden sqlite3 /data/db.sqlite3 ".backup '/data/db-backup.sqlite3'"

# 打包整个数据目录
docker exec vaultwarden tar czf /data/backup-$(date +%Y%m%d).tar.gz /data/
```

### 恢复

```shell
# 停止服务
docker stop vaultwarden

# 恢复数据
cp backup.sqlite3 /vw-data/db.sqlite3

# 启动服务
docker start vaultwarden
```

## 安全建议

1. **必须启用 HTTPS**：Web Vault 依赖 Web Crypto API，仅 HTTPS 下可用
2. **使用反向代理**：Caddy / Nginx / Traefik 等
3. **设置 ADMIN_TOKEN**：管理后台必须设置强令牌
4. **关闭公开注册**：注册完成后设置 `SIGNUPS_ALLOWED=false`
5. **定期备份**：密码数据至关重要
6. **启用 2FA**：至少为管理员账号启用多因素认证
7. **Fail2ban**：防止暴力破解

## 客户端下载

Vaultwarden 兼容 Bitwarden 全部官方客户端：

| 平台 | 下载 |
|---|---|
| 浏览器扩展 | [Chrome](https://chrome.google.com/webstore/detail/bitwarden/nngceckbapebfimnlnbhekcfmcppgpla) / [Firefox](https://addons.mozilla.org/firefox/addon/bitwarden-password-manager/) |
| Windows / macOS / Linux | [Bitwarden Desktop](https://bitwarden.com/download/) |
| iOS / Android | [Bitwarden Mobile](https://bitwarden.com/download/) |
| Web Vault | 自部署后访问 `https://vw.example.com` |

客户端设置中修改服务器地址为你的 Vaultwarden 域名即可。

## 参考链接

- [GitHub Wiki](https://github.com/dani-garcia/vaultwarden/wiki)
- [反向代理配置示例](https://github.com/dani-garcia/vaultwarden/wiki/Proxy-examples)
- [启用 HTTPS](https://github.com/dani-garcia/vaultwarden/wiki/Enabling-HTTPS)
- [启用管理后台](https://github.com/dani-garcia/vaultwarden/wiki/Enabling-admin-page)
- [容器镜像选择说明](https://github.com/dani-garcia/vaultwarden/wiki/Which-container-image-to-use)
- [社区论坛](https://vaultwarden.discourse.group/)
