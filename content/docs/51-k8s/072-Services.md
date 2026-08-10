---
weight: 72
title: "Services"
---

# Service

> 官方文档：[kubernetes.io/docs/concepts/services-networking/service/](https://kubernetes.io/docs/concepts/services-networking/service/)

---

## 1. 概述

Service 是一种**抽象**，定义了一组逻辑上的 Pod 端点以及如何访问它们的策略。

**为什么需要 Service**：
- Pod 是短暂的（IP 会变化）
- Service 提供稳定的 IP 和 DNS 名
- 自动通过 selector 跟踪后端 Pod

### 云原生服务发现

```
客户端 → Service（稳定 IP）→ kube-proxy → Pod（动态 IP）
                              ↑
                        EndpointSlice（自动跟踪 Pod）
```

---

## 2. 定义 Service

### 2.1 基本 Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app.kubernetes.io/name: proxy      # 选择后端 Pod
  ports:
  - protocol: TCP
    port: 80                           # Service 端口
    targetPort: 8080                   # Pod 端口（默认等于 port）
```

### 2.2 端口定义

| 字段 | 说明 |
|------|------|
| `port` | Service 暴露的端口号 |
| `targetPort` | 后端 Pod 的端口（默认等于 `port`） |
| `nodePort` | NodePort 类型的节点端口（可选） |
| `protocol` | TCP（默认）/ UDP / SCTP |
| `appProtocol` | 应用层协议提示（`http`、`https` 等） |

### 2.3 无 Selector 的 Service

Service 可以不设 selector，用于对接非 Pod 后端：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  ports:
  - protocol: TCP
    port: 80
    targetPort: 9376
  # 无 selector
---
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: my-service-abc      # 名称须以 Service 名为前缀
  labels:
    kubernetes.io/service-name: my-service
addressType: IPv4
ports:
  - name: http
    port: 9376
endpoints:
  - addresses:
    - 192.0.2.246
```

典型场景：对接外部数据库、路由到其他 Service。

---

## 3. Service 类型

| 类型 | 说明 | 端口范围 | 特点 |
|------|------|----------|------|
| **ClusterIP**（默认） | 集群内部虚拟 IP | 任意 | 仅集群内可访问 |
| **NodePort** | 在每个节点暴露端口 | 30000-32767 | 可从集群外访问，自建 LB |
| **LoadBalancer** | 云厂商自动创建 LB | 任意 | 外部 LB + NodePort 基础 |
| **ExternalName** | 映射外部 DNS 名 | N/A | DNS 级别 CNAME 重定向 |

### 3.1 ClusterIP

- 默认类型
- 分配集群内部 IP（`10.x.x.x`）
- `.spec.clusterIP` 可手动指定，设为 `"None"` 则为 Headless Service
- kube-proxy 在各节点配置 iptables/IPVS/eBPF 规则

### 3.2 NodePort

```yaml
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30007    # 可选，手动指定
```

**端口分配策略**：

| 默认范围 | 自动分配段 | 手动分配段 |
|----------|------------|------------|
| 30000-32767 | 30000-30999 | 31000-32767 |

**自定义网卡**：`--nodeport-addresses=127.0.0.0/8` 可限制 kube-proxy 监听特定网卡。默认监听所有网卡。

访问方式：`<NodeIP>:<nodePort>` 或 `<ClusterIP>:<port>`

### 3.3 LoadBalancer

```yaml
spec:
  type: LoadBalancer
  clusterIP: 10.0.171.239
  loadBalancer:
    class: example.com/lb-implementation   # 指定 LB 实现
```

**构建过程**：先创建 NodePort → `cloud-controller-manager` 配置外部 LB → LB 流量转发到 NodePort。

| 字段 | 说明 | 版本 |
|------|------|------|
| `spec.loadBalancerIP` | 指定 LB IP（已弃用） | v1.24 deprecated |
| `spec.loadBalancerClass` | 指定 LB 实现类 | v1.24 stable |
| `spec.allocateLoadBalancerNodePorts` | 禁用 NodePort 分配 | v1.24 stable |
| `status.loadBalancer.ingress.ipMode` | `VIP`（默认）或 `Proxy` | v1.x |

**ipMode 说明**：

| ipMode | 流量路径 |
|--------|----------|
| `VIP` | LB → NodeIP:NodePort → Pod（DNAT） |
| `Proxy` | LB → Pod IP:Port（直接路由） |

**内部 LB 注解**（云厂商特定）：

```yaml
metadata:
  annotations:
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-address-type: "intranet"
    service.kubernetes.io/qcloud-loadbalancer-internal-subnetid: subnet-xxxxx
```

### 3.4 ExternalName

```yaml
spec:
  type: ExternalName
  externalName: my.database.example.com
```

- 无 selector，无 ClusterIP
- 通过 DNS CNAME 重定向到外部域名
- 重定向在 DNS 层面，不走 proxy
- 陷阱：HTTP/HTTPS 中 Host header 与 ExternalName 不一致

---

## 4. Headless Service

设置 `.spec.clusterIP: "None"` 创建无 ClusterIP 的 Service。

| 特征 | 说明 |
|------|------|
| 无 ClusterIP | 不分配虚拟 IP |
| 不走 kube-proxy | 无负载均衡、无代理 |
| DNS 返回 Pod IP | 客户端直接连接 Pod |

### DNS 行为

| 有 selector | 无 selector |
|------------|------------|
| 自动创建 EndpointSlice | 不创建 EndpointSlice |
| DNS 返回所有 Pod IP（A/AAAA） | DNS 返回手动配置的端点 IP |

**典型用途**：StatefulSet、自定义服务发现、gRPC 直连 Pod。

---

## 5. 服务发现

### 5.1 环境变量

kubelet 在创建 Pod 时自动注入环境变量：

```bash
# Service "redis-master" 的环境变量
REDIS_MASTER_SERVICE_HOST=10.0.0.11
REDIS_MASTER_SERVICE_PORT=6379
REDIS_MASTER_PORT=tcp://10.0.0.11:6379
```

**注意**：必须先创建 Service，后创建 Pod，环境变量才会注入。

### 5.2 DNS

| Service 类型 | DNS 记录 | 解析结果 |
|--------------|----------|----------|
| 普通 Service | A/AAAA | ClusterIP |
| Headless Service | A/AAAA | 所有 Pod IP |
| ExternalName | CNAME | 外部域名 |

DNS 域名格式：`<service-name>.<namespace>.svc.cluster.local`

---

## 6. 虚拟 IP 寻址机制

kube-proxy 的三种模式：

| 模式 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **iptables**（默认） | 在每个节点设置 iptables 规则 | 内核态、零依赖 | 规则多时性能下降 |
| **IPVS** | 基于内核 IPVS 模块 | 支持 LC/RR/DH 等算法 | 需内核模块支持 |
| **eBPF** | 内核可编程字节码 | 性能最优、无 Sidecar | 需较新内核版本 |

### 流量路径

```
客户端 Pod → ClusterIP:Port
     ↓
  iptables/IPVS/eBPF 规则（kube-proxy 配置）
     ↓
  DNAT → 后端 Pod IP:targetPort
```

---

## 7. 流量策略

### 7.1 流量策略（Traffic Policy）

| 字段 | 选项 | 说明 |
|------|------|------|
| `externalTrafficPolicy` | `Cluster`（默认） | 外部流量跨节点负载均衡，源 IP 丢失（SNAT） |
| | `Local` | 仅路由到本节点 Pod，保留源 IP |
| `internalTrafficPolicy` | `Cluster`（默认） | 内部流量可路由到任意节点 Pod |
| | `Local` | 仅路由到本节点 Pod |

### 7.2 流量分布（Traffic Distribution）

`.spec.trafficDistribution` 表达拓扑偏好（非强制约束）：

| 值 | 说明 |
|----|------|
| `PreferSameZone` | 偏好同可用区端点 |
| `PreferSameNode` | 偏好同节点端点 |

### 7.3 会话亲和性

```yaml
spec:
  sessionAffinity: ClientIP      # 或 None（默认）
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800      # 默认 3 小时
```

| 值 | 说明 |
|----|------|
| `None`（默认） | 无亲和性，随机负载均衡 |
| `ClientIP` | 相同客户端 IP 路由到同一 Pod |

---

## 8. External IPs（已弃用）

> `Kubernetes v1.36 [deprecated]` — 建议迁移

```yaml
spec:
  externalIPs:
  - 198.51.100.32
  ports:
  - port: 80
```

- 允许 Service 绑定到非 cluster IP 的外部 IP
- 流量到达节点后被路由到 Service 端点
- Kubernetes 不管理 externalIPs 的分配（运维负责）

---

## 9. Service 类型选型指南

```text
内部服务间通信？
├─ 是 → ClusterIP
│         ├─ 需要直连 Pod？→ Headless Service (clusterIP: None)
│         └─ 需要稳定的虚拟 IP？→ 普通 ClusterIP
└─ 否 → 需要外部访问？
          ├─ 云环境 + 生产？→ LoadBalancer
          ├─ 简单外部访问？→ NodePort
          └─ 对接外部域名？→ ExternalName
```

---

## 10. 关键对比

| 维度 | ClusterIP | NodePort | LoadBalancer | ExternalName | Headless |
|------|-----------|----------|--------------|--------------|----------|
| 集群内访问 | ✓ | ✓ | ✓ | ✗（DNS） | ✓（DNS） |
| 集群外访问 | ✗ | ✓ | ✓ | ✗（DNS） | ✗ |
| 有 ClusterIP | ✓ | ✓ | ✓ | ✗ | ✗ |
| 有 selector | ✓ | ✓ | ✓ | ✗ | 可选 |
| kube-proxy | ✓ | ✓ | ✓ | ✗ | ✗ |
| 保留源 IP | ✗ | `Local` | `Local` | N/A | N/A |
| 生产推荐 | ✓ | 测试 | ✓ | 对接外部 | StatefulSet |

---

## 参考

- [Service API 文档](https://kubernetes.io/docs/reference/kubernetes-api/service-resources/service-v1/)
- [EndpointSlices](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/)
- [Topology Aware Routing](https://kubernetes.io/docs/concepts/services-networking/topology-aware-hints/)
- [Service 的拓扑感知路由](https://kubernetes.io/docs/concepts/services-networking/service-traffic-policy/)