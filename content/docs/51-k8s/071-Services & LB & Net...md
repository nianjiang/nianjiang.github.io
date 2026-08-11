---
weight: 71
title: "Services/LB/Net."
---

# Services, Load Balancing, and Networking

> 官方文档：[kubernetes.io/docs/concepts/services-networking/](https://kubernetes.io/docs/concepts/services-networking/)

---

## 1. Kubernetes 网络模型

Kubernetes 网络模型的三大基础：

| 层级 | 说明 |
|------|------|
| **Pod 网络** | 每个 Pod 拥有独立的集群级 IP，Pod 内容器共享网络命名空间，可通过 `localhost` 通信 |
| **Pod 间通信** | 所有 Pod 可直接通信（无 NAT），跨节点通信由 CNI 插件实现 |
| **Service** | 提供稳定的 IP/主机名，通过 EndpointSlice 自动跟踪后端 Pod |

**核心原则**：Pod 像 VM 或物理主机一样对待——端口分配、命名、服务发现、负载均衡、迁移。

**实现分工**：

| 组件 | 职责 |
|------|------|
| CRI（容器运行时） | 设置 Pod 的网络命名空间 |
| CNI 插件 | 实现 Pod 间网络（如 Calico、Cilium、Flannel） |
| kube-proxy | 服务代理，将流量路由到后端 Pod |
| NetworkPolicy | 由 CNI 插件实现（部分简单实现不支持） |
| Gateway API | 多种实现（Nginx、Envoy、云厂商等） |

---

## 2. Service

> 官方文档：[kubernetes.io/docs/concepts/services-networking/service/](https://kubernetes.io/docs/concepts/services-networking/service/)

### 2.1 Service 类型

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| **ClusterIP**（默认） | 仅集群内部可访问的虚拟 IP | 内部服务间通信 |
| **NodePort** | 在每个节点上暴露固定端口（30000-32767） | 简单外部访问、自建 LB |
| **LoadBalancer** | 通过云厂商自动创建外部负载均衡器 | 生产环境外部访问 |
| **ExternalName** | 将 Service 映射到外部 DNS 名称（CNAME） | 对接集群外数据库等 |

### 2.2 Service 详解

**ClusterIP**：
- 默认类型，分配集群内部 IP
- `.spec.clusterIP` 可手动指定（需在合法范围内）
- 设为 `"None"` 则变为 Headless Service

**NodePort**：
- 自动在 `.spec.ports[*].nodePort` 分配端口
- 可通过 `nodePort` 字段手动指定（需在范围内）
- `--nodeport-addresses` 控制监听哪些网卡地址
- 端口范围分为两段以避免冲突：30000-30999 和 31000-32767

**LoadBalancer**：
- 基于 NodePort 构建，由 `cloud-controller-manager` 配置外部 LB
- `.spec.loadBalancerClass` 可指定 LB 实现
- `spec.allocateLoadBalancerNodePorts: false` 可禁用 NodePort 分配
- `.status.loadBalancer.ingress.ipMode`：`VIP`（默认）或 `Proxy`
- `.spec.loadBalancerIP` 已在 v1.24 弃用

**ExternalName**：
- 无 selector，通过 `spec.externalName` 映射到外部 DNS
- 常见陷阱：HTTP/HTTPS 下 Host header 不匹配
- 仅通过集群 DNS 解析

### 2.3 Headless Service

设置 `.spec.clusterIP: "None"` 创建 Headless Service：

| 场景 | DNS 行为 |
|------|----------|
| **有 selector** | DNS 返回所有后端 Pod IP 的 A/AAAA 记录 |
| **无 selector** | DNS 返回 EndpointSlice 中定义的端点 IP |

用途：StatefulSet、自定义服务发现、直接连接特定 Pod。

### 2.4 流量策略

| 字段 | 作用 |
|------|------|
| `externalTrafficPolicy` | 控制外部流量路由（`Cluster` 跨节点负载均衡 / `Local` 仅本节点 Pod） |
| `internalTrafficPolicy` | 控制集群内部流量路由（`Cluster` / `Local`） |
| `sessionAffinity` | 会话亲和性（`None` 默认 / `ClientIP` 按客户端 IP 粘滞） |
| `sessionAffinityConfig` | 配置 `ClientIP` 超时时间 |

### 2.5 无 Selector 的 Service

Service 可以不设 selector，此时：
- EndpointSlice 不会自动创建
- 需手动创建 EndpointSlice 或通过 ExternalName 引用
- 典型场景：对接外部数据库、跨命名空间引用

---

## 3. Ingress

> 官方文档：[kubernetes.io/docs/concepts/services-networking/ingress/](https://kubernetes.io/docs/concepts/services-networking/ingress/)

Ingress 提供 HTTP/HTTPS 路由到集群内部 Service 的能力：

| 功能 | 说明 |
|------|------|
| 基于路径路由 | `/foo` → Service A, `/bar` → Service B |
| 基于主机名路由 | `foo.example.com` → Service A |
| TLS 终止 | 通过 Secret 引用证书 |
| 默认后端 | 未匹配规则的请求转发到默认 Service |

**注意**：Ingress API 已冻结（不再开发新特性），Kubernetes 推荐使用 **Gateway API** 替代。

### Ingress 结构

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
spec:
  ingressClassName: nginx       # 指定 Ingress Controller
  tls:                          # TLS 配置
  - hosts:
    - example.com
    secretName: tls-secret
  rules:
  - host: example.com
    http:
      paths:
      - path: /foo
        pathType: Prefix
        backend:
          service:
            name: service-a
            port:
              number: 80
```

### pathType 类型

| pathType | 说明 |
|----------|------|
| `Exact` | 精确匹配路径 |
| `Prefix` | 路径前缀匹配（按 `/` 分割） |
| `ImplementationSpecific` | 由 IngressClass 定义 |

---

## 4. Gateway API

> 官方文档：[kubernetes.io/docs/concepts/services-networking/gateway/](https://kubernetes.io/docs/concepts/services-networking/gateway/)

Gateway API 是 Ingress 的下一代替代，提供更丰富的流量路由能力：

| 优势 | 说明 |
|------|------|
| **表达能力强** | 支持 header 匹配、流量权重、过滤等 |
| **可扩展** | 允许在不同层级链接自定义资源 |
| **角色分离** | 平台管理员管理 GatewayClass，应用开发者管理 Route |

### 资源模型

```
GatewayClass（基础设施提供商定义）
  └── Gateway（流量基础设施实例）
        └── HTTPRoute / GRPCRoute / TCPRoute（路由规则）
              └── Service（后端目标）
```

| 资源 | 角色 | 说明 |
|------|------|------|
| **GatewayClass** | 基础设施提供商 | 定义网关控制器和通用配置 |
| **Gateway** | 集群管理员 | 定义监听器（端口、协议、TLS）和路由绑定 |
| **HTTPRoute** | 应用开发者 | 定义 HTTP 路由规则（主机名、路径、header 匹配、权重） |
| **GRPCRoute** | 应用开发者 | 定义 gRPC 路由规则 |

### Gateway 与 Ingress 对比
| 维度 | Ingress | Gateway API |
|------|---------|-------------|
| 配置模型 | 单一扁平资源 | 分层资源（Class → Gateway → Route） |
| 更新粒度 | 全局（任何变更触发全量） | 局部（只更新受影响的 Route/Listener） |
| 重载方式 | 配置文件 reload（进程级） | xDS 热更新（内存级） |
| 路由变更延迟 | 秒级（reload 耗时） | 毫秒级（内存更新） |
| 连接影响 | Reload 时可能丢连接 | 无连接中断 |
| 资源隔离 | 多团队共享 Ingress，互相影响 | 每个团队独立 HTTPRoute，互不干扰 |
| 扩展性 | 数百 Ingress 后 reload 变慢 | 数千 Route 仍可快速增量更新 |
| 实现依赖 | Nginx/HAProxy 等进程级 reload | Envoy/Istio/Contour 等支持 xDS 的数据平面 |

---

## 5. NetworkPolicy

> 官方文档：[kubernetes.io/docs/concepts/services-networking/network-policies/](https://kubernetes.io/docs/concepts/services-networking/network-policies/)

> 一句话总结：Network Policy 是 Kubernetes 声明的 API，由 CNI 插件实现——Calico 用 ipset+iptables，Cilium 用 eBPF，OVN 用 OpenFlow。 <br/>核心优化思路都是用高效数据结构（ipset 哈希 / eBPF 字节码 / OVS 流表）避免线性
遍历，而不是 naive 的 per-pod iptables 规则

NetworkPolicy 在 OSI 第 3/4 层控制 Pod 间流量：

### 5.1 Pod 隔离模型

| 方向 | 默认行为 | 隔离条件 |
|------|----------|----------|
| **Ingress**（入站） | 允许所有入站连接 | 存在选择该 Pod 且包含 `Ingress` 的 NetworkPolicy |
| **Egress**（出站） | 允许所有出站连接 | 存在选择该 Pod 且包含 `Egress` 的 NetworkPolicy |

**关键规则**：
- 策略是**加性的**（additive），多条策略取并集
- 源 Pod 的 egress 策略 + 目标 Pod 的 ingress 策略**都允许**时连接才通过
- Pod 不能阻止访问自身

### 5.2 流量实体标识

| 标识符 | 说明 |
|--------|------|
| **Pod 选择器** | `podSelector` 匹配标签 |
| **Namespace 选择器** | `namespaceSelector` 匹配命名空间 |
| **IP 块** | `ipBlock` 指定 CIDR 范围 |

### 5.3 示例

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
spec:
  podSelector:           # 应用到哪些 Pod
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:               # 入站规则
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 80
  egress:                # 出站规则
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
```

---

## 6. DNS 服务发现

> 官方文档：[kubernetes.io/docs/concepts/services-networking/dns-pod-service/](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)

### 6.1 DNS 记录格式

| 对象 | DNS 格式 | 解析结果 |
|------|----------|----------|
| **普通 Service** | `my-svc.my-namespace.svc.cluster.local` | ClusterIP（A/AAAA） |
| **Headless Service** | `my-svc.my-namespace.svc.cluster.local` | 所有后端 Pod IP（A/AAAA） |
| **Pod** | `pod-ip-dashed.my-namespace.pod.cluster.local` | Pod IP |
| **StatefulSet Pod** | `pod-name.svc-name.my-namespace.svc.cluster.local` | 特定 Pod IP |
| **ExternalName** | `my-svc.my-namespace.svc.cluster.local` | CNAME 到外部域名 |

### 6.2 Pod DNS 配置

每个 Pod 的 `/etc/resolv.conf`：

```
nameserver 10.32.0.10
search <namespace>.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

- `search` 列表使同命名空间内可直接用 Service 名访问
- `ndots:5` 表示少于 5 个 `.` 的名称会先尝试 search 列表

### 6.3 跨命名空间访问

| 查询 | 命名空间 | 结果 |
|------|----------|------|
| `data` | Pod 在 `test` 命名空间 | 解析 `data.test.svc.cluster.local` |
| `data.prod` | Pod 在 `test` 命名空间 | 解析 `data.prod.svc.cluster.local` ✓ |

---

## 7. 关键概念对比

| 概念 | Ingress | Gateway API | Service (LoadBalancer) |
|------|---------|-------------|------------------------|
| 协议 | HTTP/HTTPS | HTTP/gRPC/TCP/UDP/TLS | TCP/UDP/SCTP |
| 配置灵活性 | 低 | 高 | 低 |
| 角色分离 | ✗ | ✓ | ✗ |
| TLS 终止 | ✓ | ✓ | 部分云厂商支持 |
| 流量分割 | ✗ | ✓ | ✗ |
| 推荐度 | 维护模式 | **推荐** | 适合简单场景 |

---

## 8. 学习路径

```
网络模型基础 → Service（4 种类型）→ Headless Service
       ↓
  Ingress（HTTP 路由）→ Gateway API（下一代替代）
       ↓
  NetworkPolicy（流量控制）→ DNS 服务发现 → CNI 插件
```