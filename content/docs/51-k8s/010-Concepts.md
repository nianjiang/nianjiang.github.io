---
weight: 10
title: "Concepts"
---

# Kubernetes Concepts 概览

> 官方文档：[kubernetes.io/docs/concepts/](https://kubernetes.io/docs/concepts/)

Kubernetes Concepts 是理解 Kubernetes 系统各组成部分及其抽象模型的核心文档。以下是对全部 13 个概念分类的总结。

---

## 分类总览

| 序号 | 分类 | 说明 | 链接 | Next |
|:----:|------|------|------|------|
| 1 | Overview | Kubernetes 整体介绍：可移植、可扩展的开源平台 | [Doc](https://kubernetes.io/docs/concepts/overview/) | 1. K8s 和 Docker 的关系<br/>2. 声明式 vs 命令式<br/>3. 为什么要用 Pod 而不直接用容器 |
| 2 | Cluster Architecture | 集群架构：控制平面、节点、云控制器等 | [Doc](https://kubernetes.io/docs/concepts/architecture/) | Hard Way Setup |
| 3 | Containers | 容器技术：镜像、运行时、环境变量等 | [Doc](https://kubernetes.io/docs/concepts/containers/) | 0. containerD run a pod. <br/>1. 镜像分层结构怎么节省存储<br/>2. CRI 接口为什么解耦运行时<br/>3. init container 和 sidecar 的区别 |
| 4 | Workloads | 工作负载：Pod、Deployment、StatefulSet、DaemonSet、Job | [Doc](https://kubernetes.io/docs/concepts/workloads/) | 1. StatefulSet 和 Deployment 本质区别<br/>2. DaemonSet 典型使用场景<br/>3. Pod 的生命周期有哪些状态 |
| 5 | Services, Load Balancing, and Networking | 服务与网络：Service、Ingress、Gateway API、NetworkPolicy | [Doc](https://kubernetes.io/docs/concepts/services-networking/) | 1. Service 4 种类型怎么选<br/>2. Ingress 和 Gateway API 的区别<br/>3. NetworkPolicy 默认是白名单还是黑名单 |
| 6 | Storage | 存储：Volume、PV、PVC、StorageClass、CSI | [Doc](https://kubernetes.io/docs/concepts/storage/) | 1. PV 和 PVC 的绑定关系<br/>2. StorageClass 怎么实现动态 provisioning<br/>3. CSI 解耦了什么 |
| 7 | Configuration | 配置：ConfigMap、Secret、资源管理 | [Doc](https://kubernetes.io/docs/concepts/configuration/) | 1. ConfigMap 三种注入方式<br/>2. Secret 存储是否加密<br/>3. requests 和 limits 不一致会怎样 |
| 8 | Security | 安全：RBAC、ServiceAccount、Pod Security、审计 | [Doc](https://kubernetes.io/docs/concepts/security/) | 1. RBAC 的 Role 和 ClusterRole 区别<br/>2. Pod Security 三个级别怎么选<br/>3. 审计日志能记录什么 |
| 9 | Policies | 策略：LimitRange、ResourceQuota、准入控制、ValidatingAdmissionPolicy | [Doc](https://kubernetes.io/docs/concepts/policy/) | 1. LimitRange 和 ResourceQuota 作用范围<br/>2. Mutating 和 Validating Webhook 执行顺序<br/>3. ValidatingAdmissionPolicy 比 Webhook 好在哪 |
| 10 | Scheduling, Preemption and Eviction | 调度与驱逐：优先级、污点容忍、拓扑分布 | [Doc](https://kubernetes.io/docs/concepts/scheduling-eviction/) | 1. Filtering 和 Scoring 两阶段做什么<br/>2. Taint 和 Toleration 怎么配合<br/>3. Pod 优先级抢占怎么避免饿死 |
| 11 | Cluster Administration | 集群管理：证书、高可用、节点管理 | [Doc](https://kubernetes.io/docs/concepts/cluster-administration/) | 1. 控制平面高可用的最低节点数<br/>2. 证书过期了集群会怎样<br/>3. 多集群管理方案有哪些 |
| 12 | Windows in Kubernetes | Windows 支持：Windows 节点、容器运行时 | [Doc](https://kubernetes.io/docs/concepts/windows/) | 1. Windows Pod 网络和 Linux Pod 有什么不同<br/>2. Windows 节点能跑哪些容器镜像<br/>3. 为什么 Windows Pod 不支持 hostNetwork |
| 13 | Extending Kubernetes | 扩展 Kubernetes：CRD、Operator、聚合 API、Webhook | [Doc](https://kubernetes.io/docs/concepts/extend-kubernetes/) | 1. CRD 和 Operator 的关系<br/>2. Mutating 和 Validating Webhook 哪个先执行<br/>3. 聚合 API Server 解决了什么问题 |

---

## 各分类详解

### 1. Overview

Kubernetes 是一个可移植、可扩展的开源平台，用于管理容器化工作负载和服务，支持声明式配置和自动化。

### 2. Cluster Architecture

Kubernetes 集群由**控制平面**和**工作节点**组成：

| 组件 | 说明 |
|------|------|
| Control Plane | 大脑：API Server、etcd、Scheduler、Controller Manager |
| Node | 执行者：kubelet、kube-proxy、容器运行时 |
| Cloud Controller Manager | 云提供商集成接口 |

### 3. Containers

| 主题 | 说明 |
|------|------|
| Images | 容器镜像：分层文件系统，不可变 |
| Container Runtime | 运行时接口（CRI）：containerd、CRI-O |
| Runtime Class | 支持不同运行时（如 Kata Containers） |
| Environment Variables | 容器环境变量配置 |
| Container Lifecycle Hooks | PostStart / PreStop 回调 |

### 4. Workloads

Pod 是 Kubernetes 最小的可部署计算单元。更高层的工作负载资源管理 Pod 的生命周期：

| 资源 | 说明 |
|------|------|
| **Pod** | 最小单元，共享网络和存储的一组容器 |
| **Deployment** + ReplicaSet | 无状态应用，Pod 可互换 |
| **StatefulSet** | 有状态应用，每个 Pod 有持久身份和存储 |
| **DaemonSet** | 每个节点运行一个 Pod（如日志收集、网络插件） |
| **Job** | 运行到完成的任务 |
| **CronJob** | 定时任务，按计划重复执行 Job |
| PodGroupTemplate | v1.35 alpha：批量/ML 场景的组调度 |

### 5. Services, Load Balancing, and Networking

Kubernetes 网络模型：每个 Pod 有唯一 IP，Pod 间直接通信无需 NAT。

| 主题 | 说明 |
|------|------|
| **Service** | 为一组 Pod 提供稳定 IP/域名，负载均衡 |
| **Ingress** | HTTP/HTTPS 七层路由（URI、域名、路径） |
| **Gateway API** | 替代 Ingress 的下一代入口 API，支持动态配置 |
| **NetworkPolicy** | 控制 Pod 间流量（L3/L4 级别） |
| **EndpointSlice** | Service 后端 Pod 的动态发现 |
| DNS for Services and Pods | 集群内 DNS 自动解析 |
| kube-proxy | 默认 Service 代理实现 |

### 6. Storage

| 主题 | 说明 |
|------|------|
| **Volumes** | Pod 级临时存储，随 Pod 生命周期 |
| **Persistent Volumes (PV)** | 集群级持久存储资源 |
| **Persistent Volume Claims (PVC)** | 用户对存储的申请 |
| **StorageClasses** | 动态 provisioning 的模板 |
| **CSI** | 容器存储接口标准 |
| Ephemeral Volumes | 随 Pod 生命周期的临时卷 |
| Projected Volumes | 将多卷投射到同一目录 |
| Volume Snapshots | 存储快照与恢复 |
| Volume Populators | 数据预填充 |

### 7. Configuration

| 主题 | 说明 |
|------|------|
| **ConfigMap** | 非敏感配置注入（环境变量/文件） |
| **Secret** | 敏感信息（密码、Token、证书） |
| Resource Management | CPU/Memory 请求与限制 |
| kubeconfig | 多集群访问配置文件 |

### 8. Security

| 主题 | 说明 |
|------|------|
| **RBAC** | 基于角色的访问控制 |
| **ServiceAccount** | Pod 内进程的身份 |
| **Pod Security Standards** | Pod 安全策略（privileged/baseline/restricted） |
| Pod Security Admission | 替代旧版 PSP 的准入控制 |
| Data Encryption at Rest | etcd 数据加密 |
| TLS | 控制平面通信加密 |
| Audit Logging | 安全审计日志 |
| Multi-tenancy | 多租户隔离 |

### 9. Policies

| 主题 | 说明 |
|------|------|
| **LimitRange** | 资源分配约束（最小/最大/默认） |
| **ResourceQuota** | Namespace 级资源配额 |
| Admission Controllers | 内置准入控制插件 |
| ValidatingAdmissionPolicy | CEL 表达式验证策略 |
| Dynamic Admission Control | Webhook 动态准入（Mutating/Validating） |

### 10. Scheduling, Preemption and Eviction

详见 [Scheduler Doc](./021-Codes/09-Scheduler-Doc.md)

| 主题 | 说明 |
|------|------|
| kube-scheduler | 默认调度器（Filtering + Scoring） |
| Assigning Pods to Nodes | nodeSelector / nodeAffinity / nodeName |
| Taints and Tolerations | 节点排斥/容忍 |
| Pod Topology Spread Constraints | 拓扑域均匀分布 |
| Pod Priority and Preemption | 优先级抢占 |
| Node-pressure Eviction | 节点压力驱逐 |

### 11. Cluster Administration

| 主题 | 说明 |
|------|------|
| Certificates | 集群证书管理 |
| High Availability | 控制平面高可用 |
| Node Management | 节点注册与管理 |
| Dual-stack Networking | IPv4/IPv6 双栈 |

### 12. Windows in Kubernetes

Kubernetes 支持运行 Windows 节点，适用于 .NET 应用和 Windows 容器。

### 13. Extending Kubernetes

| 主题 | 说明 |
|------|------|
| **CRD** | 自定义资源定义 |
| **Operator** | 自定义控制器模式 |
| Aggregated API Server | 扩展 API Server |
| Admission Webhooks | Mutating / Validating Webhook |
| Device Plugins | GPU/FPGA 等设备接入 |
| Scheduler Framework | 调度器插件化扩展 |

---

## Reference

[Concepts](https://kubernetes.io/docs/concepts/)

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()