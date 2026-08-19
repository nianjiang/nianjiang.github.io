---
weight: 14
title: "kube-proxy"
---

# Kubernetes kube-proxy 代码结构

> 仓库地址：[cmd/kube-proxy](https://github.com/kubernetes/kubernetes/tree/master/cmd/kube-proxy)，[pkg/proxy](https://github.com/kubernetes/kubernetes/tree/master/pkg/proxy)

---

## 整体代码布局

```
kubernetes/
├── cmd/kube-proxy/                          # 入口：二进制启动命令
│   ├── proxy.go                             # main() 入口
│   └── app/                                 # 应用初始化、配置解析
│       ├── server.go                        # ProxyServer 启动核心（NewProxyCommand → Run）
│       ├── server_linux.go                  # Linux 特定启动逻辑
│       ├── server_other.go                  # 非 Linux 平台启动逻辑
│       ├── server_windows.go                # Windows 特定启动逻辑
│       ├── options.go                       # 命令行选项解析（KubeProxyConfiguration）
│       ├── init_linux.go                    # Linux 初始化（加载内核模块）
│       ├── init_other.go                    # 非 Linux 平台初始化
│       └── init_windows.go                  # Windows 平台初始化
│
└── pkg/proxy/                               # 核心实现
    │
    ├── types.go                             # Provider 接口 + ProxyServer 主结构体
    ├── endpoint.go                          # Endpoint 抽象（IP/Port/Protocol）
    ├── serviceport.go                       # ServicePort 抽象（Service 端口映射）
    ├── node.go                               # 节点信息管理
    ├── topology.go                          # 拓扑感知路由（Topology Aware Hints）
    │
    ├── servicechangetracker.go              # Service 变更跟踪器（diff 计算）
    ├── endpointschangetracker.go            # EndpointSlice 变更跟踪器
    ├── endpointslicecache.go                 # EndpointSlice 本地缓存
    │
    ├── apis/                                # KubeProxyConfiguration API 定义
    ├── config/                              # 配置文件解析（config.conf）
    ├── conntrack/                           # Conntrack（连接跟踪）管理
    ├── healthcheck/                         # 服务健康检查器
    ├── metrics/                             # Prometheus 指标
    ├── runner/                              # 通用规则同步 Runner
    ├── util/                                # 工具函数
    ├── kubemark/                            # 性能测试用假 Proxier
    ├── metaproxier/                        # MetaProxier（多模式组合）
    ├── localnodeportproxy/                  # 本地 NodePort 代理
    │
    ├── iptables/                            # iptables 模式实现
    │   ├── proxier.go                       # Proxier 主结构体 + Sync() + 同步规则
    │   ├── cleanup.go                       # 旧规则清理
    │   └── doc.go                           # iptables 模式文档
    │
    ├── ipvs/                                # IPVS 模式实现
    │   ├── proxier.go                       # Proxier 主结构体 + Sync()
    │   ├── ipvs.go                          # IPVS 内核接口封装
    │   ├── graceful_termination.go          # 优雅终止（Zero-downtime）
    │   ├── graceful_termination_manager.go  # 优雅终止管理器
    │   ├── netlink_linux.go                 # Netlink 系统调用
    │   ├── server.go                        # IPVS Server 封装
    │   └── strict_arp.go                   # ARP 严格模式
    │
    ├── nftables/                            # nftables 模式实现（v1.29+ Alpha）
    │   ├── proxier.go                       # Proxier 主结构体
    │   ├── cleanup.go                       # 旧规则清理
    │   └── doc.go                           # nftables 模式文档
    │
    └── winkernel/                           # Windows 内核模式实现
        └── proxier.go                       # Windows Proxier
```

---

## 核心概念

### kube-proxy 是什么

kube-proxy 是运行在**每个节点**上的网络代理，负责实现 Kubernetes Service 抽象：

```
客户端 Pod → ClusterIP:Port（虚拟 IP）
                 ↓
     ┌──── kube-proxy 配置的内核规则 ────┐
     │                                    │
     │  iptables / IPVS / nftables 规则    │
     │  DNAT: ClusterIP → Pod IP           │
     └────────────────────────────────────┘
                 ↓
           后端 Pod IP:targetPort
```

**关键特性**：

| 特性 | 说明 |
|------|------|
| **非转发型代理** | 不在用户态转发数据包，而是配置内核规则（iptables/IPVS/nftables） |
| **每节点运行** | 以 DaemonSet 方式部署，每个节点一个实例 |
| **Watch 模式** | 监听 API Server 的 Service 和 EndpointSlice 变更 |
| **幂等操作** | 规则同步是幂等的，重复执行不会产生副作用 |

---

## 代理模式（Proxy Mode）

kube-proxy 支持四种代理模式，通过 `--proxy-mode` 参数选择：

| 模式 | 状态 | 原理 | 性能 | 适用场景 |
|------|------|------|------|----------|
| **iptables** | 默认 | iptables DNAT 规则 | 中（O(n) 规则匹配） | 通用 |
| **IPVS** | Stable | IPVS 内核模块 + iptables 辅助 | 高（O(1) 哈希查找） | 大规模集群 |
| **nftables** | Alpha（v1.29+） | nftables API | 高（改进的数据结构） | 新内核环境 |
| **userspace** | 已废弃 | 用户态进程转发 | 低 | 旧版本兼容 |

### 模式对比

```
         userspace          iptables            IPVS              nftables
         (已废弃)           (默认)              (推荐)            (未来)

数据路径: 用户态转发        内核 DNAT           内核 DNAT           内核 DNAT
转发方式: 进程监听端口      iptables 规则      IPVS 负载均衡        nftables 规则
LB 算法:  轮询              随机                RR/LC/DH/SH/SED     随机
规则规模:  N               O(N) 链             O(1) 查找           优化查找
内核依赖:  无               iptables            ip_vs 模块          nf_tables 模块
```

---

## iptables 模式（默认）

### 工作原理

iptables 模式通过在 `nat` 表中创建规则链来实现 Service 路由：

```
nat 表
├── PREROUTING    → KUBE-SERVICES     # 入站流量入口
├── OUTPUT        → KUBE-SERVICES     # 本机出站流量入口
├── POSTROUTING   → KUBE-POSTROUTING  # SNAT/Masquerade
│
├── KUBE-SERVICES              # Service 分发链
│   ├── DNAT → KUBE-SVC-XXXX   # 匹配 ClusterIP:Port
│   ├── DNAT → KUBE-SVC-YYYY
│   └── REJECT                 # 无后端的 Service
│
├── KUBE-SVC-XXXX              # Service 链（负载均衡）
│   ├── --mode random → KUBE-SEP-AAAA  # 50% 概率
│   └── → KUBE-SEP-BBBB                # 50% 概率
│
├── KUBE-SEP-AAAA              # Endpoint 链（DNAT）
│   └── DNAT → 10.244.1.3:8080
│
└── KUBE-POSTROUTING           # Masquerade 链
    └── MASQUERADE  (SNAT)
```

### iptables 规则示例

```bash
# 查看所有 kube-proxy 生成的规则
iptables-save | grep KUBE

# 查看 Service 链
iptables -t nat -L KUBE-SERVICES -n -v

# 查看某个 Service 的负载均衡规则
iptables -t nat -L KUBE-SVC-XXXX -n -v

# 查看某个 Endpoint 的 DNAT 规则
iptables -t nat -L KUBE-SEP-AAAA -n -v
```

### 随机负载均衡机制

iptables 模式使用 `--mode random` + `--probability` 实现负载均衡：

```
# 3 个 Endpoint 的 Service，概率分配：
KUBE-SVC-XXXX:
  - --mode random --probability 0.333 → KUBE-SEP-AAAA   # 1/3
  - --mode random --probability 0.500 → KUBE-SEP-BBBB   # 剩余 2/3 的 1/2 = 1/3
  - → KUBE-SEP-CCCC                                     # 剩余 = 1/3
```

> **注意**：概率是累积的，不是独立的。规则按顺序匹配，前一个不命中才走下一个。

### 性能特点

| 维度 | 表现 |
|------|------|
| 规则数量 | 每 Service 约生成 8 条规则 × N 个 Endpoint |
| 查找复杂度 | O(n) 线性遍历规则链 |
| 适用规模 | 数百 Service |
| 性能瓶颈 | 数千 Service 时规则同步耗时显著增加 |

---

## IPVS 模式（推荐）

### 工作原理

IPVS 模式使用 Linux 内核的 **IP Virtual Server** 模块实现 L4 负载均衡：

```
IPVS 数据结构：
├── IPVS Service（虚拟服务）
│   ├── VIP:Port + Protocol
│   ├── Scheduler 调度算法
│   └── Real Servers（后端列表）
│       ├── Pod IP1:Port
│       ├── Pod IP2:Port
│       └── Pod IP3:Port
│
└── iptables（仅用于 Masquerade 和 NodePort 特殊处理）
```

### IPVS 调度算法

| 算法 | 说明 | 适用场景 |
|------|------|----------|
| `rr` (Round Robin) | 轮询（默认） | 通用 |
| `lc` (Least Connection) | 最少连接数 | 长连接 |
| `dh` (Destination Hashing) | 目标地址哈希 | 缓存代理 |
| `sh` (Source Hashing) | 源地址哈希 | 会话亲和性 |
| `sed` (Shortest Expected Delay) | 最短期望延迟 | 性能不均 |
| `nq` (Never Queue) | 永不排队 | 避免空闲 |

### 前置条件

```bash
# 1. 确认 IPVS 内核模块已加载
lsmod | grep ip_vs

# 2. 手动加载所需模块（kube-proxy 也会自动加载）
modprobe ip_vs
modprobe ip_vs_rr
modprobe ip_vs_wrr
modprobe ip_vs_sh

# 3. 检查 IPVS 规则
ipvsadm -L -n
```

### IPVS 规则示例

```bash
# 查看所有 IPVS 规则
ipvsadm -L -n

# 输出示例：
# Prot LocalAddress:Port Scheduler -> Backend
# TCP  10.96.0.1:443 rr -> 172.20.0.2:6443
# TCP  10.96.0.10:53 rr -> 10.244.0.3:53
#                          -> 10.244.0.4:53
# TCP  10.96.100.1:80 rr -> 10.244.1.3:8080
#                          -> 10.244.2.3:8080
```

### 何时 IPVS 回退到 iptables

IPVS 模式下仍需要 iptables 处理以下场景：

| 场景 | 原因 |
|------|------|
| **Masquerade（SNAT）** | IPVS 不支持 SNAT，需 iptables POSTROUTING |
| **NodePort + externalTrafficPolicy=Local** | 需 iptables 过滤非本地 Endpoint |
| **Hairpin（回环流量）** | Pod 访问自身 Service 的 SNAT |
| **LoadBalancerSourceRanges** | 源 IP 白名单过滤 |

### 性能特点

| 维度 | 表现 |
|------|------|
| 规则数量 | 每 Service 1 个 IPVS Service + N 个 Real Server |
| 查找复杂度 | O(1) 哈希表查找 |
| 适用规模 | 数千 Service |
| 规则同步 | 增量更新，无需全量重写 |

---

## nftables 模式（Alpha）

> v1.29 引入，作为 iptables 的继任者。通过 nftables API 配置内核 netfilter 子系统。

### 设计动机

| iptables 的问题 | nftables 的改进 |
|----------------|-----------------|
| 规则链线性扫描 | 使用集合（set）和映射（map）优化查找 |
| 全量替换规则（replace） | 增量更新规则（add/delete） |
| 多表分散管理 | 统一 nftables 表管理 |
| IPv4/IPv6 分离 | 原生支持 IPv4/IPv6 一体化 |

### Netfilter Hook 使用

```
kube-proxy 在 nftables 中使用 7 个功能：

1. DNAT（prerouting + output）    # ClusterIP → Pod IP
2. SNAT（postrouting）             # Masquerade
3. Drop（filter）                  # LoadBalancerSourceRanges 过滤
4. Drop（filter）                  # Local 策略 + 无本地 Endpoint
5. Reject（filter）                # 无任何 Endpoint 的 Service
6. Drop（forward + output）        # 未分配的 ClusterIP
7. Reject（filter）                # 未定义的 ClusterIP 端口
```

### 集成注意事项

第三方网络组件（CNI、Service Mesh）与 nftables 模式交互时：

- 各组件应使用**独立的 nftables 表**，不修改 kube-proxy 的表
- 通过**优先级（priority）**控制规则执行顺序
- DNAT 发生在 `priority dstnat`，SNAT 发生在 `priority srcnat`

---

## 启动流程

```
main()  [cmd/kube-proxy/proxy.go]
  └── NewProxyCommand()  [app/server.go]
        └── command.Run()
              ├── config.Complete()        # 补全配置
              ├── ApplyConfiguration()     # 应用运行时配置
              ├── createProxier()          # 根据模式创建 Proxier
              │     ├── iptables.NewProxier()
              │     ├── ipvs.NewProxier()
              │     ├── nftables.NewProxier()
              │     └── winkernel.NewProxier()
              │
              ├── SetupSignalHandler()    # 信号处理
              └── proxyServer.Run()
                    │
                    ├── 启动 Informer
                    │     ├── ServiceInformer.Run()
                    │     └── EndpointSliceInformer.Run()
                    │
                    ├── 启动 Proxier 同步循环
                    │     └── SyncLoop()
                    │           ├── 事件触发 → syncProxyRules()
                    │           └── 定时触发 → syncProxyRules()
                    │                 ├── 读取 Service/Endpoint 缓存
                    │                 ├── 计算规则 diff
                    │                 └── 调用 Proxier.Sync()
                    │                       ├── iptables: iptables-restore
                    │                       ├── ipvs: ipvs + iptables-restore
                    │                       └── nftables: nft 命令
                    │
                    └── 启动 Healthz Server
                          └── /healthz  → 探针检查
```

---

## Service & EndpointSlice Watch 机制

### 变更跟踪

```
┌────────────┐   Watch    ┌──────────────┐   事件    ┌───────────────────────┐
│ API Server │ ─────────→ │  Informer    │ ────────→ │  ChangeTracker        │
│            │            │ (本地缓存)    │           │  (ServiceChangeTracker │
│ Service    │            │              │           │   EndpointChangeTracker)│
│ Endpoint   │            │              │           │                       │
│ Slice      │            │              │           │  计算 diff → 触发 Sync │
└────────────┘            └──────────────┘           └───────────────────────┘
                                                            │
                                                            ↓
                                                      ┌──────────┐
                                                      │ Proxier  │
                                                      │ .Sync()  │
                                                      └──────────┘
```

### ServiceChangeTracker

[`servicechangetracker.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/proxy/servicechangetracker.go) 记录 Service 增删改：

```go
// 核心数据结构
type ServiceChangeTracker struct {
    mu         sync.Mutex           // 并发保护
    items      map[types.NamespacedName]*serviceChange
    // serviceChange 记录了变更前后的 Service 信息
    // Sync 时按变更计算 iptables/IPVS 规则 diff
}
```

### EndpointSliceChangeTracker

[`endpointschangetracker.go`](https://github.com/kubernetes/kubernetes/blob/master/pkg/proxy/endpointschangetracker.go) 记录 EndpointSlice 增删改：

```go
// 现代 kube-proxy 监听 EndpointSlice（而非 Endpoints）
// 因为 EndpointSlice 更适合大规模端点场景
// 一个 Service 可对应多个 EndpointSlice
```

### 定时同步

即使没有事件触发，kube-proxy 也会定时全量同步规则：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--sync-period` | 60s | iptables/IPVS 规则全量同步间隔 |
| `--iptables-min-sync-period` | 1s | iptables 最小同步间隔 |
| `--ipvs-min-sync-period` | 1s | IPVS 最小同步间隔 |

---

## 配置文件

kube-proxy 使用 YAML 配置文件（`/var/lib/kube-proxy/config.conf`）：

```yaml
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration

# 代理模式：iptables / ipvs / nftables / userspace
mode: "iptables"

# 同步周期
iptables:
  masqueradeAll: false              # 是否对所有流量 SNAT
  masqueradeBit: 14                  # Mark 位
  minSyncPeriod: 1s                  # 最小同步间隔
  syncPeriod: 30s                    # 同步周期
  localhostNodePorts: true          # 允许回环访问 NodePort

ipvs:
  scheduler: "rr"                   # 调度算法
  excludeCIDRs: []                  # 排除的 CIDR
  minSyncPeriod: 1s
  syncPeriod: 30s
  strictARP: false                  # 严格 ARP 模式
  tcpTimeout: 0s                    # TCP 连接超时
  tcpFinTimeout: 0s                 # TCP FIN 超时
  udpTimeout: 0s                    # UDP 超时

nftables:
  masqueradeAll: false
  minSyncPeriod: 1s
  syncPeriod: 30s

# 连接跟踪
conntrack:
  maxPerCore: 32768                 # 每核心最大连接数
  min: 131072                       # 最小连接表大小
  tcpCloseWaitTimeout: 1h0m0s
  tcpEstablishedTimeout: 8h0m0s

# 节点信息
clientConnection:
  kubeconfig: /var/lib/kube-proxy/kubeconfig.conf

clusterCIDR: "10.244.0.0/16"        # Pod CIDR（用于 masquerade）
hostnameOverride: "node-1"           # 节点名覆盖

# NodePort 监听地址
nodePortAddresses: []               # 空=所有地址

# Feature Gates
featureGates:
  GRPCContainerProbe: true
```

---

## Metrics（监控指标）

### 核心指标

| 指标 | 类型 | 说明 |
|------|------|------|
| `sync_proxy_rules_count` | Counter | 规则同步总次数 |
| `sync_proxy_rules_latency_ms` | Histogram | 规则同步耗时 |
| `sync_proxy_rules_last_timestamp_seconds` | Gauge | 最近同步时间 |
| `endpoint_slice_cache_count` | Gauge | 缓存的 EndpointSlice 数 |
| `service_cache_count` | Gauge | 缓存的 Service 数 |
| `iptables_rules_total` | Gauge | iptables 规则总数 |
| `network_programming_duration_seconds` | Histogram | Service 编程延迟 |

### PromQL 示例

```promql
# 规则同步延迟 P99
histogram_quantile(0.99, rate(sync_proxy_rules_latency_ms_bucket[5m]))

# Service 编程延迟（Service 创建到规则生效）
histogram_quantile(0.99, rate(network_programming_duration_seconds_bucket[5m]))

# 同步失败率
rate(sync_proxy_rules_count{result="failed"}[5m])
```

---

## 调试与排查

### 查看 kube-proxy 状态

```bash
# 查看 kube-proxy 日志
kubectl logs -n kube-system kube-proxy-xxxx

# 查看 kube-proxy 配置
cat /var/lib/kube-proxy/config.conf

# 确认运行模式
kubectl logs -n kube-system kube-proxy-xxxx | grep "proxy-mode"
```

### iptables 模式排查

```bash
# 查看完整规则
iptables-save | grep -E "KUBE"

# 查看 Service 分发链
iptables -t nat -L KUBE-SERVICES -n -v --line-numbers

# 追踪某个 ClusterIP 的规则链
CLUSTER_IP=10.96.0.1
iptables -t nat -L -n -v | grep $CLUSTER_IP

# 统计 kube-proxy 规则数量
iptables-save | grep -c "KUBE"
```

### IPVS 模式排查

```bash
# 查看 IPVS 规则
ipvsadm -L -n

# 查看特定 Service
ipvsadm -L -n -t 10.96.0.1:443

# 查看连接统计
ipvsadm -L -n --stats

# 确认内核模块
lsmod | grep -E "ip_vs|nf_conntrack"

# 查看 conntrack 表
conntrack -L | grep <ClusterIP>
```

### 常见问题

| 问题 | 原因 | 排查 |
|------|------|------|
| Service 不通 | 规则未同步 | 检查 `iptables-save \| grep KUBE` 或 `ipvsadm -L` |
| 延迟高 | iptables 规则过多 | 切换到 IPVS 模式 |
| Pod 无法访问 ClusterIP | masquerade 未配置 | 检查 `--masquerade-all` 或 clusterCIDR |
| NodePort 不通 | 绑定地址限制 | 检查 `nodePortAddresses` 配置 |
| 连接重置 | conntrack 表满 | 调整 `conntrack.maxPerCore` |
| IPVS 模式启动失败 | 内核模块缺失 | `modprobe ip_vs` |

---

## iptables vs IPVS vs nftables vs eBPF 选型

| 维度 | iptables | IPVS | nftables | eBPF（Cilium） |
|------|----------|------|----------|---------------|
| **规则匹配** | O(n) 线性扫描 | O(1) 哈希查找 | O(1) 集合/映射查找 | O(1) 哈希映射（XDP/TC） |
| **LB 算法** | 随机（random） | RR/LC/DH/SH/SED/NQ 等 10+ 种 | 同 iptables（随机为主） | Maglev/随机/自定义 |
| **规则更新** | 全量替换（iptables-restore） | 增量更新（ipvsadm） | 增量更新（原子操作） | 增量更新（Map 热更新） |
| **规模上限** | ~1000 Service | ~10000+ Service | ~10000+ Service | ~10000+ Service |
| **Masquerade** | 原生支持 | 仍需 iptables 辅助 | 原生支持 | 由 datapath 处理 |
| **会话亲和性** | recent 模块 | SH 调度算法 | 原生支持 | Maglev 一致性哈希 |
| **内核依赖** | iptables（≥2.4，通用） | ip_vs 模块（≥2.6.10） | nft 内核模块（≥3.13，推荐 ≥5.10） | BPF 子系统（≥4.18，推荐 5.8+） |
| **kube-proxy 状态** | 默认模式 | GA | Alpha（v1.29+） | 非 kube-proxy（替代方案） |
| **推荐场景** | 小型集群、通用 | 中大型集群、生产环境 | 新内核环境、未来方向 | 大规模集群、高性能网络 |

**选型建议**：

```
集群规模 < 500 Service         → iptables（默认，零依赖）
集群规模 ≥ 500 Service         → IPVS（性能更优）
新内核 5.10+ 环境              → 关注 nftables（未来方向）
大规模集群 + Cilium/高性能网络  → eBPF（绕过 kube-proxy，极致性能）
```

---

## 与其他组件的关系

```
                    ┌─────────────────┐
                    │  API Server     │
                    │  (Service/      │
                    │   EndpointSlice) │
                    └───────┬─────────┘
                            │ Watch
                    ┌───────┴─────────┐
                    │  kube-proxy     │
                    │  (每节点一个)    │
                    │                 │
            ┌───────┤  配置内核规则    ├───────┐
            │       └─────────────────┘       │
            ↓                                   ↓
  ┌──────────────────┐              ┌──────────────────┐
  │  iptables/IPVS   │              │  CoreDNS          │
  │  (DNAT 规则)      │              │  (Service 名称解析)│
  └──────────────────┘              └──────────────────┘
            │                                   │
            ↓                                   ↓
  ┌──────────────────────────────────────────────────────┐
  │                    Pod                               │
  │  访问 my-svc → DNS 解析 → ClusterIP → DNAT → Pod IP  │
  └──────────────────────────────────────────────────────┘
```

| 组件 | 与 kube-proxy 的关系 |
|------|---------------------|
| **CoreDNS** | 解析 Service 名 → ClusterIP，kube-proxy 负责路由 ClusterIP → Pod IP |
| **kubelet** | kubelet 管理 Pod 生命周期，Endpoint Controller 据此更新 EndpointSlice |
| **Endpoint Controller** | 维护 EndpointSlice，kube-proxy Watch 后更新规则 |
| **CNI 插件** | 提供 Pod 网络连通性，kube-proxy 提供 Service 层路由 |
| **kube-apiserver** | 提供 Service/EndpointSlice 的 Watch 接口 |

---

## Reference

- [kube-proxy 命令行参考](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-proxy/)
- [Service 概念文档](https://kubernetes.io/docs/concepts/services-networking/service/)
- [虚拟 IP 机制](https://kubernetes.io/docs/reference/networking/virtual-ips/)
- [Proxy 规范](https://github.com/kubernetes/design-proposals-archive/blob/master/network/proxy.md)
- [IPVS 模式文档](https://github.com/kubernetes/kubernetes/blob/master/pkg/proxy/ipvs/README.md)
- [nftables 模式文档](https://github.com/kubernetes/kubernetes/blob/master/pkg/proxy/nftables/README.md)
- [iptables 模式源码](https://github.com/kubernetes/kubernetes/blob/master/pkg/proxy/iptables/proxier.go)
- [IPVS 模式源码](https://github.com/kubernetes/kubernetes/blob/master/pkg/proxy/ipvs/proxier.go)
