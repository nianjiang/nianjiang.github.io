---
weight: 5
title: "UI Shell"
---

> 开源的 Web 端 Shell 脚本执行平台，支持通过浏览器执行 Shell 脚本、设置 Cron 定时任务，并可部署在 Kubernetes 中。

## 选型对比

### 核心能力对比

| 工具 | 核心定位 | Web UI | Cron 支持 | K8s 部署 | 许可证 | GitHub Stars | 视频介绍 |
|---|---|---|---|---|---|---|---|
| Kestra | 通用工作流编排平台 | ✅ | ✅ | Helm / Docker | Apache-2.0 | 28k+ | [▶ YouTube](https://www.youtube.com/watch?v=xnGYiWFM2uk) |
| QingLong | 定时任务管理面板 | ✅ | ✅ | Docker 部署 | MIT | 20k+ | [▶ B站](https://www.bilibili.com/video/BV1h84y1h7dS/) |
| 👍 Windmill | 脚本即工作流 | ✅ | ✅ | Helm Chart | AGPL-3.0 | 18k+ | [▶ YouTube](https://www.youtube.com/watch?v=QRf8C8qF7CY) |
| Semaphore | 轻量版 AWX | ✅ | ✅ | Docker / K8s | MIT | 14k+ | [▶ YouTube](https://www.youtube.com/watch?v=tc3tqMIN89U) |
| 👍 Rundeck | 企业级作业调度平台 | ✅ | ✅ | Helm Chart | Apache-2.0 | 6.3k+ | [▶ YouTube](https://www.youtube.com/playlist?list=PLTDT4q38A2NutovIx_IFJev9Z6w68P6Xo) |
| Gocron | 分布式任务管理系统 | ✅ | ✅ | K8s 部署指南 | 未明确 | 6.3k+ | [▶ B站](https://www.bilibili.com/video/BV1Ya4y1E7PG/) |
| Cronicle | 轻量定时任务调度器 | ✅ | ✅ | Deployment + PVC | MIT | 5.8k+ | [▶ YouTube](https://www.youtube.com/watch?v=zIPEEfkCTak) |
| Dagu | 轻量级工作流引擎 | ✅ | ✅ | Helm / 原生 | GPL-3.0 | 4k+ | [▶ YouTube](https://www.youtube.com/watch?v=xHc8dgMQ0nE) |
| OliveTin | 极简按钮式 Shell 执行 | ✅ | 有限 | Docker 镜像 | AGPL-3.0 | 3.8k+ | [▶ YouTube](https://www.youtube.com/watch?v=UBgOfNrzId4) |
| Script-Server | 多用户脚本执行平台 | ✅ | ✅ | Docker | MIT | 1.9k+ | — |
| OpsCloud4 | 开源运维平台与堡垒机 | ✅ | ✅ | K8s / Docker | Apache-2.0 | 1.4k+ | — |
| CloudTTY | K8s 网页终端 | ✅ | ❌ | K8s Operator | Apache-2.0 | 660+ | — |
| CloudExplorer Lite | 轻量级多云管理平台 | ✅ | ❌ | Docker 部署 | Apache-2.0 | 759 | [▶ B站](https://www.bilibili.com/video/BV1Rv4y1J7f2/) |
| Furiko | 云原生企业级 Cron 平台 | ✅ | ✅ | K8s Operator | Apache-2.0 | 500+ | — |
| Kronic | K8s CronJob 管理 UI | ✅ | ✅ | Helm Chart | 未明确 | 100+ | — |
| CloudMonkey | Apache CloudStack CLI | ❌ | ❌ | CLI 工具 | Apache-2.0 | 120 | — |
| EasyShell | AI 驱动的服务器运维平台 | ✅ | ✅ | Docker Compose | MIT | 79 | — |
| Scheduler | 全托管 Cron 调度器 | ✅ | ✅ | 原生设计 | MIT | 70+ | — |
| Licell | 阿里云一键部署 CLI（类 Vercel） | ❌ | ❌ | CLI 工具 | 未明确 | 7 | — |
| 阿里云 OOS | 全托管运维编排服务（云服务） | ✅ | ✅ | N/A（SaaS） | N/A（免费） | N/A | [▶ B站](https://www.bilibili.com/video/BV1nZ4y1a7xK/) |


### 企业级特性对比

| 产品 | Web 执行 Shell | Cron 调度 | K8s 部署 | 权限控制 | 审计日志 | 推荐度 |
|---|---|---|---|---|---|---|
| Windmill | ✅ | ✅ | ✅ Helm | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| Rundeck | ✅ | ✅ | ✅ Helm | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| Argo Workflows | ⚠️ Container | ✅ CronWorkflow | ✅ 原生 | ✅ | ✅ | ⭐⭐⭐⭐ |
| Kestra | ✅ | ✅ | ✅ Helm | ✅ | ✅ | ⭐⭐⭐⭐ |
| Jenkins | ✅ | ✅ | ✅ Helm | ✅ | ⚠️ | ⭐⭐⭐ |
| Cronicle | ✅ | ✅ | ⚠️ 自封装 | ⚠️ | ⚠️ | ⭐⭐⭐ |

### 选型决策

```
需求复杂度
│
├─ Web 点按钮跑 Shell + 偶尔定时
│   → OliveTin / Script-Server（轻量，5 分钟部署）
│
├─ 轻量定时任务管理
│   → Cronicle / QingLong / Gocron（简单易用，快速部署）
│
├─ 多人协作 + 权限 + 审计 + 定时
│   → Windmill / Rundeck（企业级首选）
│   → Semaphore（如果同时使用 Ansible）
│
├─ K8s 原生工作流编排
│   → Argo Workflows（CNCF 毕业项目，K8s 原生）
│   → Furiko（企业级 K8s Operator）
│
├─ K8s CronJob 管理 UI
│   → Kronic（轻量 CronJob 管理 UI）
│   → CloudTTY（K8s Web 终端）
│
└─ 复杂工作流 + 多步骤编排
    → Dagu（轻量工作流引擎）
    → Windmill（开发者体验最好，K8s 原生）
    → Kestra（YAML 声明式，插件生态丰富）
```

---

## Kestra

> YAML 声明式工作流编排平台，800+ 插件，事件驱动，K8s 原生。

| 项目 | 说明 |
|---|---|
| 官网 | [kestra.io](https://kestra.io/) |
| GitHub | [kestra-io/kestra](https://github.com/kestra-io/kestra) |
| 语言 | Java |
| 协议 | Apache-2.0 |
| 镜像 | `kestra/kestra` |
| Helm | 官方支持 |

**特点：**

- YAML 声明式定义工作流
- 内置 Schedule Trigger（Cron）
- 800+ 插件（Kafka、S3、Slack、数据库等）
- 事件驱动架构
- 可视化 DAG 编辑器
- 支持 Shell / Python / Node.js 脚本任务
- 官方 Helm Chart 支持 K8s 部署

**Docker 部署：**

```yaml
services:
  kestra:
    image: kestra/kestra:latest
    container_name: kestra
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      KESTRA_CONFIGURATION: local
    volumes:
      - ./kestra-data:/app/storage
```

---

## QingLong

> 支持 Python3 / JavaScript / Shell / TypeScript 的定时任务管理面板，国人开发。

| 项目 | 说明 |
|---|---|
| GitHub | [whyour/qinglong](https://github.com/whyour/qinglong) |
| 语言 | Node.js + Python |
| 协议 | MIT |
| 镜像 | `whyour/qinglong` |

**特点：**

- 支持多种脚本语言（Python3、JavaScript、Shell、TypeScript）
- 在线管理脚本、环境变量、配置文件
- 在线查看任务日志
- 支持秒级任务设置
- 支持系统级通知（钉钉、飞书、Telegram 等）
- 依赖管理（自动安装 pip / npm 依赖）
- 中文文档，社区活跃

**Docker 部署：**

```yaml
services:
  qinglong:
    image: whyour/qinglong:latest
    container_name: qinglong
    restart: unless-stopped
    ports:
      - "5700:5700"
    volumes:
      - ./ql-data:/data
    environment:
      - QlBaseUrl=/
```

---

## Windmill

> 开发者平台，脚本即工作流，自动生成 UI + API + Scheduler，K8s 原生。

| 项目 | 说明 |
|---|---|
| 官网 | [windmill.dev](https://www.windmill.dev/) |
| GitHub | [windmill-labs/windmill](https://github.com/windmill-labs/windmill) |
| 语言 | Rust + TypeScript |
| 协议 | AGPL-3.0 |
| 镜像 | `ghcr.io/windmill-labs/windmill-*` |
| Helm | [windmill-helm-charts](https://github.com/windmill-labs/windmill-helm-charts) |

**特点：**

- 支持 Shell / Python / TypeScript / Go / Bash 脚本
- 每个脚本自动生成 REST API + Web UI
- 内置 Scheduler、Webhook 触发器
- 工作流编排（DAG 图）
- 内置审批流、错误处理
- K8s 原生架构，官方 Helm Chart
- 支持自托管 Worker 池

**K8s 部署：**

```shell
helm repo add windmill https://windmill-labs.github.io/windmill-helm-charts
helm install windmill windmill/windmill \
  --namespace windmill --create-namespace
```

---

## Semaphore

> 轻量版 AWX，支持 Ansible / Shell / PowerShell 任务模板与定时执行。

| 项目 | 说明 |
|---|---|
| 官网 | [semaphoreui.com](https://semaphoreui.com/) |
| GitHub | [semaphoreui/semaphore](https://github.com/semaphoreui/semaphore) |
| 语言 | Go |
| 协议 | MIT |
| 镜像 | `semaphoreui/semaphore` |

**特点：**

- 支持 Ansible Playbook、Shell、PowerShell、Bash
- 内置任务调度器（Cron）
- 密钥管理（SSH Key / 密码 / 环境变量）
- 任务模板 + 变量管理
- 执行日志与通知
- 资源占用极低（Go 单二进制）

**Docker 部署：**

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore
    container_name: semaphore
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      SEMAPHORE_DB_DIALECT: bolt
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ADMIN_PASSWORD: changeme
    volumes:
      - ./semaphore-data:/etc/semaphore
```

---

## Rundeck

> 老牌开源作业调度平台，企业级功能完善，社区活跃。

| 项目 | 说明 |
|---|---|
| 官网 | [rundeck.com](https://www.rundeck.com/open-source) |
| GitHub | [rundeck/rundeck](https://github.com/rundeck/rundeck) |
| 语言 | Java |
| 协议 | Apache-2.0 |
| 镜像 | `rundeck/rundeck` |
| Helm | [helm-charts](https://github.com/rundeck/helm-charts) |

**特点：**

- 完善的 Job 调度（内置 Quartz Cron）
- RBAC 权限控制（用户 / 角色 / ACL 策略）
- 执行历史与审计日志
- 节点管理（通过 SSH / WinRM 远程执行）
- Webhook 触发器
- 插件生态丰富
- 官方 Helm Chart 支持 K8s 部署

**Docker 部署：**

```yaml
services:
  rundeck:
    image: rundeck/rundeck:latest
    container_name: rundeck
    restart: unless-stopped
    ports:
      - "4440:4440"
    environment:
      RUNDECK_GRAILS_URL: "https://rundeck.example.com"
      RUNDECK_SERVER_FORWARDED: "true"
    volumes:
      - ./rundeck-data:/home/rundeck/server/data
```

---

## Gocron

> 国人开发的定时任务管理系统，Web UI 管理 Cron Job，支持 Shell / HTTP / Python 任务类型。

| 项目 | 说明 |
|---|---|
| GitHub | [owenchenchen/gocron](https://github.com/owenchenchen/gocron) |
| 语言 | Go |
| 协议 | MIT |
| 镜像 | `owenchenchen/gocron` |

**特点：**

- Web UI 管理定时任务，支持标准 Cron 表达式
- 支持 Shell、HTTP、Python 任务类型
- 任务执行日志查看
- 多节点管理（Agent 模式）
- 任务失败通知（邮件 / Webhook）
- 中文文档，部署简单

**Docker 部署：**

```yaml
services:
  gocron:
    image: owenchenchen/gocron
    container_name: gocron
    restart: unless-stopped
    ports:
      - "5920:5920"
    volumes:
      - ./gocron-data:/app/gocron-data
    environment:
      - GOCRON_HOST=0.0.0.0:5920
```

**K8s 部署：**

可直接使用 Deployment + Service 部署，配合 PVC 持久化数据。

---

## Cronicle

> 多服务器任务调度器，自带 Web UI，专注定时任务管理，轻量且开箱即用。

| 项目 | 说明 |
|---|---|
| 官网 | [cronicle.net](https://cronicle.net/) |
| GitHub | [jhuckaby/Cronicle](https://github.com/jhuckaby/Cronicle) |
| 语言 | Node.js |
| 协议 | MIT |
| 镜像 | `jc21/cronicle` |

**特点：**

- 标准 Cron 表达式调度
- 多节点集群支持（Master / Worker 架构）
- 实时日志查看
- 插件系统（Shell / HTTP / Node.js 等）
- 任务失败告警（邮件 / Webhook）
- 单进程部署，资源占用低
- 数据存储在本地文件系统或 S3

**Docker 部署：**

```yaml
services:
  cronicle:
    image: jc21/cronicle
    container_name: cronicle
    restart: unless-stopped
    ports:
      - "3012:3012"
    volumes:
      - ./cronicle-data:/data
    environment:
      - TZ=Asia/Shanghai
```

**K8s 部署：**

普通 Deployment + PVC 即可，无需复杂配置：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cronicle
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cronicle
  template:
    metadata:
      labels:
        app: cronicle
    spec:
      containers:
        - name: cronicle
          image: jc21/cronicle
          ports:
            - containerPort: 3012
          volumeMounts:
            - name: data
              mountPath: /data
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: cronicle-data
```

---

## Dagu

> 轻量级本地优先工作流引擎，单二进制部署，声明式 YAML 定义工作流。

| 项目 | 说明 |
|---|---|
| 官网 | [dagu.sh](https://docs.dagu.sh/) |
| GitHub | [dagu-org/dagu](https://github.com/dagu-org/dagu) |
| 语言 | Go |
| 协议 | GPL-3.0 |
| 镜像 | `ghcr.io/dagu-org/dagu` |
| Helm | [官方 Helm Chart](https://docs.dagu.sh/server-admin/deployment/kubernetes) |

**特点：**

- 单二进制文件，无外部依赖
- 声明式 YAML 定义工作流（DAG）
- 内置 Web UI，可视化工作流执行
- 支持 Cron 调度、重试、并行执行
- 支持 Shell 命令、SSH、容器执行
- 内置日志查看和审计

**Docker 部署：**

```yaml
services:
  dagu:
    image: ghcr.io/dagu-org/dagu:latest
    container_name: dagu
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./dagu-data:/root/.dagu
      - ./workflows:/workflows
    environment:
      - DAGU_DAGS=/workflows
```

---

## OliveTin

> 极简的 Web Shell 执行平台，通过 YAML 定义按钮，一键执行 Shell 命令。

| 项目 | 说明 |
|---|---|
| 官网 | [olivetin.app](https://www.olivetin.app/) |
| GitHub | [OliveTin/OliveTin](https://github.com/OliveTin/OliveTin) |
| 语言 | Go |
| 协议 | AGPL-3.0 |
| 镜像 | `jamesread/olivetin` |

**特点：**

- YAML 配置即按钮，无需写代码
- 支持参数化输入
- 可配置为 systemd 服务或 Docker 容器
- Cron 支持有限，更适合手动触发场景

**Docker 部署：**

```yaml
services:
  olivetin:
    image: jamesread/olivetin
    container_name: olivetin
    restart: unless-stopped
    ports:
      - "1337:1337"
    volumes:
      - ./config.yaml:/config/config.yaml
```

配置示例 `config.yaml`：

```yaml
actions:
  - title: "Ping 测试"
    shell: ping -c 4 {{host}}
    arguments:
      - name: host
        type: ascii_identifier
```

---

## Script-Server

> 功能完善的 Web 脚本执行平台，支持多用户、权限控制和日志审计。

| 项目 | 说明 |
|---|---|
| GitHub | [bugy/script-server](https://github.com/bugy/script-server) |
| 语言 | Python |
| 协议 | MIT |
| 镜像 | `scriptserver/script-server` |

**特点：**

- 内置 Cron 调度器
- 多用户认证 + 权限管理
- 完整的执行日志和审计记录
- 支持 Python / Bash / PowerShell 等多种脚本类型
- 参数化脚本，Web 表单输入

**Docker 部署：**

```yaml
services:
  script-server:
    image: scriptserver/script-server
    container_name: script-server
    restart: unless-stopped
    ports:
      - "5000:5000"
    volumes:
      - ./config:/config
      - ./scripts:/scripts
```

---

## CloudTTY

> Kubernetes 网页终端 Operator，通过浏览器访问 K8s 集群 Shell。

| 项目 | 说明 |
|---|---|
| GitHub | [cloudtty/cloudtty](https://github.com/cloudtty/cloudtty) |
| 语言 | Go |
| 协议 | Apache-2.0 |
| 部署 | K8s Operator |
| 入选 | CNCF 全景图 |

**特点：**

- Kubernetes Operator 模式部署
- 浏览器内访问 K8s 集群终端
- 支持多集群管理
- 支持会话共享和录制
- 基于 ttyd，轻量高效
- 集成到 DCE 5.0 等 K8s 发行版

**K8s 部署：**

```shell
# 安装 CloudTTY Operator
helm repo add cloudtty https://cloudtty.github.io/cloudtty
helm install cloudtty cloudtty/cloudtty

# 创建 Web 终端
kubectl apply -f - <<EOF
apiVersion: cloudtty.io/v1alpha1
kind: CloudShell
metadata:
  name: my-shell
spec:
  cleanup: true
  ttlSecondsAfterFinished: 3600
EOF
```

---

## CloudExplorer Lite

> 开源轻量级多云管理平台，支持对接阿里云、腾讯云、华为云、VMware、OpenStack 等，提供云主机管理、云账单、运营分析等功能。

| 项目 | 说明 |
|---|---|
| 官网 | [fit2cloud.com/cloudexplorer-lite](https://fit2cloud.com/cloudexplorer-lite/index.html) |
| GitHub | [1Panel-dev/CloudExplorer](https://github.com/1Panel-dev/CloudExplorer) |
| 语言 | Java + Vue |
| 协议 | Apache-2.0 |
| 部署 | Docker 部署 |

**特点：**

- 多云对接：支持阿里云、腾讯云、华为云、VMware、OpenStack 等主流云平台
- 开箱即用：云主机管理、云账单、运营分析、安全合规等基本功能
- 轻量级：相比传统云管平台更轻量，适合中小企业
- 扩展能力：提供强大的扩展能力满足企业定制需求
- 统一管理：跨云平台的统一资源视图和管理界面

**Docker 部署：**

```shell
# 参考官方文档进行部署配置
# https://github.com/1Panel-dev/CloudExplorer
```

---

## Furiko

> 云原生企业级 Cron 平台，Kubernetes Operator 模式，专为 K8s 设计。

| 项目 | 说明 |
|---|---|
| 官网 | [furiko.io](https://furiko.io/) |
| GitHub | [furiko-io/furiko](https://github.com/furiko-io/furiko) |
| 语言 | Go |
| 协议 | Apache-2.0 |
| 部署 | K8s Operator |

**特点：**

- Kubernetes 原生 Operator 架构
- 支持标准 Cron 表达式和高级调度策略
- 支持 Job 依赖、并发控制、超时处理
- Web UI 管理界面
- 支持事件触发和手动触发
- 企业级特性：RBAC、审计日志、多租户
- 支持动态参数和变量替换

**K8s 部署：**

```shell
# 安装 Furiko Operator
kubectl apply -f https://github.com/furiko-io/furiko/releases/latest/download/install.yaml

# 创建定时任务
kubectl apply -f - <<EOF
apiVersion: furiko.io/v1alpha1
kind: JobConfig
metadata:
  name: hello-world
spec:
  schedule:
    cron: "*/5 * * * *"
  template:
    template:
      containers:
        - name: hello
          image: busybox
          command: ["echo", "Hello Furiko"]
EOF
```

---

## Kronic

> 轻量级 Kubernetes CronJob 管理 UI，查看、暂停、触发、编辑 CronJob。

| 项目 | 说明 |
|---|---|
| 官网 | [mshade.github.io/kronic](https://mshade.github.io/kronic/) |
| GitHub | [mshade/kronic](https://github.com/mshade/kronic) |
| 语言 | Go |
| 协议 | 未明确 |
| Helm | [kronic Helm Chart](https://artifacthub.io/packages/helm/kronic/kronic) |

**特点：**

- 专为 Kubernetes CronJob 设计的管理 UI
- 查看 CronJob 状态和执行历史
- 手动触发 CronJob 执行
- 暂停 / 恢复 CronJob
- 编辑和删除 CronJob
- 轻量级，部署简单

**K8s 部署：**

```shell
helm repo add kronic https://mshade.github.io/kronic/
helm install kronic kronic/kronic \
  --namespace kronic --create-namespace
```

---

## CloudMonkey

> Apache CloudStack 的命令行接口（CLI），可作为交互式 Shell 或命令行工具使用，简化 CloudStack 配置和管理。

| 项目 | 说明 |
|---|---|
| GitHub | [apache/cloudstack-cloudmonkey](https://github.com/apache/cloudstack-cloudmonkey) |
| 语言 | Go |
| 协议 | Apache-2.0 |
| 部署 | CLI 工具（无需部署） |

**特点：**

- Apache CloudStack 官方 CLI 工具
- 支持交互式 Shell 模式和命令行模式
- 自动补全功能，提高操作效率
- 支持模板/ISO 文件上传
- 支持双因素认证（2FA）
- 简化 CloudStack API 调用和批量操作

**安装：**

```shell
# 通过 go install 安装
go install github.com/apache/cloudstack-cloudmonkey@latest

# 或下载预编译二进制文件
# https://github.com/apache/cloudstack-cloudmonkey/releases
```

---

## Scheduler

> 全托管 Cron 调度器，轻量级，专注于 HTTP 回调和任务调度。

| 项目 | 说明 |
|---|---|
| GitHub | [akornatskyy/scheduler](https://github.com/akornatskyy/scheduler) |
| 语言 | Go |
| 协议 | MIT |
| 镜像 | `akornatskyy/scheduler` |

**特点：**

- 全托管 Cron 调度，无需外部依赖
- 支持 HTTP/HTTPS 回调任务
- 内置 Web UI 管理界面
- 支持任务失败重试
- 轻量级，资源占用低
- 支持多集群部署

**Docker 部署：**

```yaml
services:
  scheduler:
    image: akornatskyy/scheduler
    container_name: scheduler
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - DS_DSN=sqlite3:///data/scheduler.db
    volumes:
      - ./scheduler-data:/data
```

---

## Licell

> 阿里云一键部署 CLI，目标是将阿里云上的部署体验做成接近 Vercel CLI 的一键化流程，并可用于生产环境。

| 项目 | 说明 |
|---|---|
| GitHub | [team-harness/licell](https://github.com/team-harness/licell) |
| 语言 | 未明确 |
| 协议 | 未明确 |
| 部署 | CLI 工具（无需部署） |

**特点：**

- 类 Vercel CLI 体验：将阿里云部署简化为一键化流程
- 生产环境可用：不仅限于开发测试，可直接用于生产部署
- 阿里云生态：深度集成阿里云服务和资源
- 开发者友好：降低阿里云使用门槛，提升部署效率

**使用方式：**

```shell
# 参考 GitHub 仓库文档进行安装和使用
# https://github.com/team-harness/licell
```

---

## EasyShell

> AI 驱动的服务器运维平台，支持自然语言生成脚本、多主机批量执行、Web SSH 终端和智能告警。

| 项目 | 说明 |
|---|---|
| 官网 | [easyshell.ai](https://easyshell.ai/) |
| GitHub | [easyshell-ai/easyshell](https://github.com/easyshell-ai/easyshell) |
| 文档 | [docs.easyshell.ai](https://docs.easyshell.ai/) |
| 语言 | Java 17 (Spring Boot 3.5) + Go 1.24 (Agent) + React 19 |
| 协议 | MIT |
| 部署 | Docker Compose |

**特点：**

- AI Script Assistant：自然语言描述需求 → AI 生成生产级 Shell 脚本，内置 diff 审查
- AI Task Orchestration：多主机批量执行，AI 自动分析结果并给出建议
- AI Scheduled Inspections：Cron 定时任务 + AI 智能分析输出 + 自主决定是否告警
- Web SSH 终端：多标签会话、文件管理器、全文搜索，无需本地 SSH 客户端
- 主机管理与监控：统一视图、批量操作、Agent 自动部署
- 实时流式日志：多主机执行日志实时推送，颜色编码、时间戳、按主机过滤
- 安全与风控：审批流程、审计日志、RBAC 权限控制
- 通知渠道：Telegram / Discord / Slack / 钉钉 / 飞书 / 企业微信

**Docker 部署：**

```shell
git clone https://github.com/easyshell-ai/easyshell.git
cd easyshell
cp .env.example .env      # 按需编辑 .env
docker compose up -d
```

访问 http://localhost:18880，默认账号 `easyshell` / `easyshell@changeme`。

---

## OpsCloud4

> 开源运维平台与堡垒机，集成 Leo 持续交付、Web 终端、服务器批量任务、RBAC 权限控制。

| 项目 | 说明 |
|---|---|
| GitHub | [ixrjog/opscloud4](https://github.com/ixrjog/opscloud4) |
| 前端 | [ixrjog/opscloud4-web](https://github.com/ixrjog/opscloud4-web) |
| 文档 | [kancloud.cn/ixrjog/opscloud4](https://www.kancloud.cn/ixrjog/opscloud4/2361886) |
| 语言 | Java (OpenJDK 21) + Node.js |
| 协议 | Apache-2.0 |
| 部署 | K8s / Docker / 原生部署 |

**特点：**

- Leo 持续交付（K8s）：全冗余架构、多 Jenkins 引擎、蓝绿/金丝雀部署、可视化发布
- 堡垒机：服务器 Web 终端（多连接+命令同步）、K8s Web 终端、原生 SSH-Server（ED25519）
- 服务器批量任务：Ansible Playbook、单服务器多线程、任务日志清晰
- 多实例动态数据源：万物皆资产、标签驱动、事件驱动
- RBAC + MFA（OTP）：权限控制、封网策略
- 集群架构：分布式调度（Quartz）、分布式锁（Shedlock）、任务并发锁（Redis）
- API 文档：自动生成、API Token 支持

**部署：**

```shell
# 后端
git clone https://github.com/ixrjog/opscloud4.git
cd opscloud4
# 参考文档配置并启动

# 前端
git clone https://github.com/ixrjog/opscloud4-web.git
cd opscloud4-web
npm install
npm run dev
```

访问 http://localhost:8080，默认账号 `baiyi` / 空密码。

---

## 阿里云 OOS（系统运维管理）

> 阿里云全托管运维编排服务，运维即代码（Operations as Code），免费使用，深度集成阿里云生态。

| 项目 | 说明 |
|---|---|
| 官网 | [aliyun.com/product/oos](https://www.aliyun.com/product/oos) |
| 控制台 | [oos.console.aliyun.com](https://oos.console.aliyun.com/) |
| 文档 | [help.aliyun.com/zh/oos](https://help.aliyun.com/zh/oos/) |
| 模板仓库 | [aliyun/oos-templates](https://github.com/aliyun/oos-templates) |
| 协议 | N/A（云服务，免费使用） |
| 部署 | SaaS（全托管，无需部署） |

**特点：**

- 运维即代码：模板化运维，支持模板创建、审批、版本控制、生产部署全生命周期
- 高效批量执行：实时任务进度可视化、运行状态统计、异常快速定位
- 免费全托管：Serverless 架构，无需自有计算资源，平台托管执行环境与任务调度
- 深度 ECS 集成：补丁管理、扩展程序、配置清单、文件分发
- 安全合规：操作审批、加密参数、RAM 权限控制、操作审计
- AI 助手：AI 辅助生成 OOS 模板、支持钉钉机器人免登录运维
- 跨地域跨账号：统一管理多地域、多账号资源
- 支持 Terraform：可通过 Terraform 管理和操作 OOS 资源

**使用方式：**

直接登录 [阿里云 OOS 控制台](https://oos.console.aliyun.com/) 即可使用，无需部署。

支持通过 API/SDK、阿里云 CLI、Terraform 进行自动化调用。

---

## 推荐方案

| 需求场景 | 推荐工具 | 部署难度 |
|---|---|---|
| 开箱即用的 Web 运维面板，轻量快捷 | **Semaphore** | ⭐⭐（官方 Helm Chart） |
| 侧重定时任务调度，轻量简易 UI | **Cronicle** | ⭐（Deployment + PVC 即可） |
| 追求 K8s 原生隔离（每个脚本跑在独立 Pod） | **Argo Workflows** | ⭐⭐⭐（需了解 K8s 资源定义） |
| 企业级运维、复杂节点管控与权限 | **Windmill / Rundeck** | ⭐⭐⭐（配置项较多） |

## Reference

- [Cronicle - GitHub](https://github.com/jhuckaby/Cronicle)
- [Dagu - GitHub](https://github.com/dagu-org/dagu)
- [Dagu 文档](https://docs.dagu.sh/)
- [QingLong 青龙 - GitHub](https://github.com/whyour/qinglong)
- [Furiko - GitHub](https://github.com/furiko-io/furiko)
- [Furiko 官网](https://furiko.io/)
- [Scheduler - GitHub](https://github.com/akornatskyy/scheduler)
- [CloudTTY - GitHub](https://github.com/cloudtty/cloudtty)
- [CloudExplorer Lite - GitHub](https://github.com/1Panel-dev/CloudExplorer)
- [CloudExplorer Lite 官网](https://fit2cloud.com/cloudexplorer-lite/index.html)
- [Kronic - GitHub](https://github.com/mshade/kronic)
- [CloudMonkey - GitHub](https://github.com/apache/cloudstack-cloudmonkey)
- [Licell - GitHub](https://github.com/team-harness/licell)
- [EasyShell - GitHub](https://github.com/easyshell-ai/easyshell)
- [EasyShell 官网](https://easyshell.ai/)
- [EasyShell 文档](https://docs.easyshell.ai/)
- [OpsCloud4 - GitHub](https://github.com/ixrjog/opscloud4)
- [OpsCloud4 前端](https://github.com/ixrjog/opscloud4-web)
- [OpsCloud4 文档](https://www.kancloud.cn/ixrjog/opscloud4/2361886)
- [阿里云 OOS 官网](https://www.aliyun.com/product/oos)
- [阿里云 OOS 文档](https://help.aliyun.com/zh/oos/)
- [OOS 模板仓库](https://github.com/aliyun/oos-templates)
- [OliveTin - GitHub](https://github.com/OliveTin/OliveTin)
- [Script-Server - GitHub](https://github.com/bugy/script-server)
- [Gocron - GitHub](https://github.com/owenchenchen/gocron)
- [Rundeck - GitHub](https://github.com/rundeck/rundeck)
- [Semaphore - GitHub](https://github.com/semaphoreui/semaphore)
- [Windmill - GitHub](https://github.com/windmill-labs/windmill)
- [Kestra - GitHub](https://github.com/kestra-io/kestra)
- [Rundeck Alternatives 2026](https://usekestrel.ai/blog/rundeck-alternatives)
- [Windmill vs Kestra Comparison](https://www.windmill.dev/compare/kestra)
