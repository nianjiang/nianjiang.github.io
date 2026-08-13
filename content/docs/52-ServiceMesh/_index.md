---
weight: 52
title: "Service Mesh"
bookCollapseSection: true
---


| Name | Doc | Github | Note |
| :--- | :--- | :--- | :--- |
| [Istio](https://istio.io/) | [Docs](https://istio.io/latest/docs/) | [Github](https://github.com/istio/istio) | 最流行的 Service Mesh，CNCF 毕业项目。基于 Envoy Sidecar，提供流量管理、安全、可观测性等全功能，功能最丰富但资源开销较大。 |
| [Linkerd](https://linkerd.io/) | [Docs](https://linkerd.io/2/overview/) | [Github](https://github.com/linkerd/linkerd2) | 轻量级 Service Mesh，CNCF 毕业项目。使用自研 Rust 代理 linkerd2-proxy，极简部署，资源开销低，适合中小规模集群。 |
| [Cilium Service Mesh](https://cilium.io/) | [Docs](https://docs.cilium.io/en/stable/network/servicemesh/) | [Github](https://github.com/cilium/cilium) | 基于 eBPF 的无 Sidecar Service Mesh，CNCF 毕业项目。数据平面绕过 iptables，资源开销极低，支持 L7 流量管理和可观测性。 |
| [Kuma](https://kuma.io/) | [Docs](https://kuma.io/docs/) | [Github](https://github.com/kumahq/kuma) | 基于 Envoy 的通用 Service Mesh，CNCF 孵化项目。支持多 Mesh、多集群（Global/Zone），可运行于 Kubernetes 和虚拟机。 |
| [Consul Connect](https://developer.hashicorp.com/consul/docs/connect) | [Docs](https://developer.hashicorp.com/consul/docs/connect) | [Github](https://github.com/hashicorp/consul) | HashiCorp 出品，与 Consul 服务发现深度集成。基于 Envoy 代理，支持跨 Kubernetes / 虚拟机的混合环境 Service Mesh。 |
| [AWS App Mesh](https://aws.amazon.com/app-mesh/) | [Docs](https://docs.aws.amazon.com/app-mesh/) | [Github](https://github.com/aws/aws-app-mesh-controller-for-k8s) | AWS 托管型 Service Mesh，基于 Envoy。与 ECS / EKS / Fargate 无缝集成，由 AWS 全托管运维。 |
| [Envoy](https://www.envoyproxy.io/) | [Docs](https://www.envoyproxy.io/docs) | [Github](https://github.com/envoyproxy/envoy) | CNCF 毕业项目，并非 Service Mesh 本身，而是 Istio / Kuma / Consul 等主流 Mesh 的**数据平面代理**。提供 L3-L7 高性能代理和可观测性。 |



---

## Service Mesh 学习重点

### 1. 核心概念

理解 Service Mesh 的本质和架构分层，是学习的起点：

| 概念 | 说明 |
|------|------|
| **Sidecar 模式** | 代理与每个 Pod 共存，拦截所有进出流量，应用无感知 |
| **数据平面** | 代理层（如 Envoy），负责实际的流量转发、负载均衡、熔断 |
| **控制平面** | 管理层（如 Istiod），下发配置、证书、服务发现信息给数据平面 |
| **透明拦截** | 通过 iptables / eBPF 将 Pod 流量重定向到 Sidecar，应用无需修改代码 |
| **Sidecar-less** | Cilium 等基于 eBPF 的方案，无独立 Sidecar 进程，内核态直接处理 |

```
┌───────────────┐         ┌───────────────┐
│   Pod-A       │         │   Pod-B       │
│ ┌───────────┐ │         │ ┌───────────┐ │
│ │  App      │ │         │ │  App      │ │
│ │      ↓    │ │         │ │      ↑    │ │
│ │  Sidecar  │◀════════▶│ │  Sidecar  │ │
│ │ (Envoy)   │ │  mTLS   │ │ (Envoy)   │ │
│ └───────────┘ │         │ └───────────┘ │
└───────────────┘         └───────────────┘
        ↑                         ↑
        └──── 控制平面 (Istiod) ────┘
              配置下发 / 证书管理
```

---

### 2. 流量管理（Traffic Management）

Service Mesh 最核心的能力，重点掌握以下 CRD 和机制：

| 资源 | 作用 | 学习重点 |
|------|------|----------|
| **VirtualService** | 定义路由规则 | 按权重 / Header / URI 分流，金丝雀发布，A/B 测试 |
| **DestinationRule** | 定义目标策略 | 负载均衡算法、连接池、熔断、异常检测 |
| **Gateway** | 入口流量控制 | 南北向流量（HTTP / HTTPS / TCP），替代 Ingress |
| **ServiceEntry** | 外部服务纳入 Mesh | 访问外部 API、数据库等非 Mesh 服务 |
| **Sidecar** | 限制 Sidecar 范围 | 减少 Envoy 配置量，降低资源开销 |

**关键场景：**
- 灰度发布：按权重切流（90% v1 → 10% v2）
- 请求路由：按用户 Header 路由到不同版本
- 超时与重试：自动重试失败请求，设置超时阈值
- 熔断：后端异常时自动断开，防止级联故障
- 故障注入：注入延迟 / 中断以测试韧性

---

### 3. 安全（Security）

| 能力 | 说明 |
|------|------|
| **mTLS 双向认证** | Pod 间通信自动加密，无需应用改造，由控制平面签发和轮转证书 |
| **AuthorizationPolicy** | L3-L7 访问控制，按 Namespace / ServiceAccount / 路径精细授权 |
| **PeerAuthentication** | 控制 mTLS 模式（STRICT / PERMISSIVE），渐进式启用加密 |
| **RequestAuthentication** | JWT 验证，对接外部 OIDC / OAuth2 |
| **证书轮转** | 自动轮转证书（默认 24h），无需人工干预 |

---

### 4. 可观测性（Observability）

Service Mesh 提供三个维度的可观测性，无需应用埋点：

| 维度 | 工具 | 说明 |
|------|------|------|
| **Metrics** | Prometheus + Grafana | 黄金信号：请求数 / 错误率 / 延迟 / 饱和度，由 Envoy 自动上报 |
| **Tracing** | Jaeger / Zipkin | 分布式链路追踪，Envoy 自动传播 Trace Header（如 B3） |
| **Logging** | ELK / Loki | 访问日志记录每个请求的源 / 目标 / 状态码 / 延迟 |
| **Topology** | Kiali | 服务拓扑可视化，展示服务间调用关系和流量走向 |

---

### 5. Envoy 代理

Envoy 是大多数 Service Mesh 的数据平面，需重点理解：

- **Listener / Filter Chain**：监听器与过滤器链，理解请求如何被拦截和处理
- **Cluster / Endpoint**：上游集群与端点，负载均衡与健康检查
- **xDS 协议**：LDS / RDS / CDS / EDS，控制平面通过 xDS 动态下发配置
- **L7 过滤器**：HTTP Router、Rate Limit、JWT Auth 等
- **性能调优**：连接池、并发 worker、内存限制

---

### 6. 多集群与多网格

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| **单 Mesh 多集群** | 多个集群共享一个控制平面 | 跨集群服务互通，统一策略 |
| **多 Mesh 联邦** | 每个集群独立控制平面，通过网关互联 | 隔离要求高，跨云 / 跨地域 |
| **Primary-Remote** | 一个 Primary 集群管理多个 Remote | 集中管控，边缘自治 |
| **Kuma 多 Zone** | Global CP 统一管理多个 Zone CP | 混合云，K8s + 虚拟机统一管理 |

---

### 7. 性能与资源优化

| 关注点 | 优化手段 |
|--------|----------|
| **Sidecar 内存** | 使用 `Sidecar` CRD 限制 Envoy 感知的服务范围 |
| **Sidecar CPU** | 调整 Envoy worker 线程数，按节点规格配置 |
| **启动顺序** | 配置 `holdApplicationUntilProxyStarts` 避免 Pod 启动竞态 |
| **eBPF 方案** | Cilium 无 Sidecar，消除额外进程开销 |
| **数据面加速** | 启用 Envoy 的 HTTP/3、连接池复用 |

---

### 8. 选型对比

| 维度 | Istio | Linkerd | Cilium | Kuma |
|------|-------|---------|--------|------|
| 数据平面 | Envoy (Sidecar) | linkerd2-proxy (Sidecar) | eBPF (无 Sidecar) | Envoy (Sidecar) |
| 功能丰富度 | **最高** | 中 | 中 | 中高 |
| 资源开销 | 较高 | 低 | **最低** | 中 |
| 学习曲线 | 陡峭 | 平缓 | 中 | 中 |
| 多集群 | 支持 | 支持 | 支持 | **原生支持** |
| CNCF 状态 | 毕业项目 | 毕业项目 | 毕业项目 | 孵化项目 |
| 适用规模 | 大规模 | 中小规模 | 大规模 | 中大规模 |

---

### 9. 学习路径建议

```
第一步：理解概念
  ├── 什么是 Service Mesh、Sidecar 模式
  ├── 数据平面 vs 控制平面
  └── 为什么需要 Service Mesh

第二步：动手实践 Istio
  ├── 安装 Istio（minikube / kind）
  ├── 部署 Bookinfo 示例
  ├── 配置 VirtualService / DestinationRule
  └── 体验金丝雀发布、熔断、故障注入

第三步：深入安全与可观测
  ├── 启用 mTLS（PERMISSIVE → STRICT）
  ├── 配置 AuthorizationPolicy
  ├── 接入 Prometheus + Grafana + Kiali
  └── 配置 Jaeger 分布式追踪

第四步：理解 Envoy 数据平面
  ├── 学习 xDS 协议
  ├── 阅读 Envoy 配置（istioctl proxy-config）
  └── 调优连接池与并发参数

第五步：生产化运维
  ├── 多集群 Mesh 部署
  ├── Sidecar 资源优化
  ├── 渐进式接入策略（PERMISSIVE 模式过渡）
  └── 对比选型：Istio / Linkerd / Cilium
```




