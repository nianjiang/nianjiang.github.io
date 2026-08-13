---
weight: 73
title: "ACK Services"
---

[ACK-Service](https://help.aliyun.com/zh/ack/ack-managed-and-ack-dedicated/user-guide/considerations-for-configuring-a-loadbalancer-type-service-1?spm=a2c4g.11186623.help-menu-85222.d_2_3_3_0.d3a75e5e2d1vBb#db441d92fcuhj)

我需要先获取还没详细阅读的几个页面内容，以便给出准确的总结。


内容已全部获取完毕，下面是完整的阅读顺序推荐和每页内容总结。

---

## 推荐阅读顺序

按 **「概念基础 → 核心约束 → 实操（创建 LB Service）→ 深度定制 → 运维保障 → 排障」** 的逻辑，建议如下顺序：

```
第一轮：打基础（必读）
  ① Service快速入门
  ② 负载均衡配置注意事项

第二轮：动手创建 LoadBalancer Service
  ③ 使用已有负载均衡暴露应用
  ④ 自动创建负载均衡暴露应用

第三轮：精细配置（按需查阅的参考手册）
  ⑤ Annotation 配置 CLB
  ⑥ Annotation 配置 NLB

第四轮：进阶场景
  ⑦ 跨集群部署服务
  ⑧ Readiness Gate 平滑更新

第五轮：出了问题再看
  ⑨ Service 异常问题排查
```

---

## 各页面内容总结

### ① Service快速入门

| 维度 | 说明 |
|------|------|
| **定位** | 整个 Service 体系的入门概览页 |
| **核心内容** | |
| 基本概念 | Service、Endpoint、IPVS、iptables、nftables 五种核心概念的定义与作用 |
| 五种 Service 类型 | ClusterIP（集群内访问）、NodePort（节点端口）、LoadBalancer（云 LB）、Headless Service（无 VIP，直连 Pod）、ExternalName（映射外部域名） |
| 外部流量策略 | 详细对比 Flannel / Terway 两种 CNI 下，`externalTrafficPolicy: Local` vs `Cluster` 在负载均衡后端挂载行为、源 IP 保留、会话保持、配额消耗上的差异 |
| **关键结论** | 集群内部访问优先用 ClusterIP；从集群内访问 LoadBalancer IP 的行为不具一致性，受 CNI + kube-proxy 模式 + 版本影响 |

---

### ② 负载均衡配置注意事项

| 维度 | 说明 |
|------|------|
| **定位** | 使用 LoadBalancer Service **之前必读的约束和坑** |
| **核心内容** | |
| LB 复用规则 | 哪些 LB 可被复用（同 VPC、同地域、未被其他集群占用等） |
| CCM 资源管理策略 | 指定已有 LB vs 自动创建 LB：CCM 对 LB/监听/后端服务器组的管理权限和删除行为完全不同 |
| 集群内访问 LB Service 的问题 | Flannel + IPVS + Local 模式下，集群内访问 LB IP 可能不通 |
| 配额限制 | CLB 后端服务器数量上限（默认 200），Cluster 模式会快速消耗配额 |
| LB 实例不可更换 | 创建后不能从 CLB 切换为 NLB，需要删建 Service |
| 删除保护 | 可为关键 Service 开启删除保护，防止误删 |
| **关键结论** | 生产环境务必区分"指定已有 LB"和"自动创建 LB"两种模式，它们的生命周期管理行为完全不同 |

---

### ③ 通过使用已有负载均衡的服务暴露应用

| 维度 | 说明 |
|------|------|
| **定位** | 复用已有 CLB/NLB 实例的完整操作手册 |
| **核心内容** | |
| 前提条件 | 需先在 LB 控制台创建实例，且与集群同地域 |
| 控制台操作 | 创建 Service 时选择"使用已有资源"，下拉选择已有 LB 实例 |
| kubectl 操作 | 通过 `service.beta.kubernetes.io/alibaba-cloud-loadbalancer-id` 指定 LB ID；用 `force-override-listeners: "true"` 自动创建监听 |
| 调度算法 | NLB 支持 6 种（轮询/加权轮询/源IP哈希/四元组哈希/QUIC ID哈希/加权最小连接数）；CLB 支持 2 种（轮询/加权轮询） |
| 健康检查 | TCP（SYN 探测）和 HTTP（HEAD/GET 请求）两种模式 |
| **关键结论** | 复用 LB 时，LB 实例本身不会被 CCM 删除（Service 删除后 LB 仍保留），适合需要长期稳定入口 IP 的场景 |

---

### ④ 通过使用自动创建负载均衡的服务公开应用

| 维度 | 说明 |
|------|------|
| **定位** | 让 CCM 自动创建 LB 实例的操作手册 |
| **核心内容** | |
| 自动创建流程 | Service `type: LoadBalancer` 且不指定 LB ID → CCM 自动创建 LB 实例 + 监听 + 后端服务器组 |
| CLB vs NLB | 通过 `loadBalancerClass: "alibabacloud.com/nlb"` 指定使用 NLB |
| 生命周期管理 | Service 删除时，CCM 会**自动删除**其创建的 LB 实例及关联资源 |
| `kubernetes.do.not.delete` 标签 | 在 LB 上打此标签后，即使 Service 删除，CCM 也不会删除 LB |
| **关键结论** | 适合快速验证/测试场景；生产环境建议使用"指定已有 LB"模式以获得更好的生命周期控制 |

---

### ⑤ 通过 Annotation 配置传统型负载均衡 CLB

| 维度 | 说明 |
|------|------|
| **定位** | CLB 全量 Annotation **参考手册**（篇幅极大） |
| **核心内容** | |
| LB 实例配置 | 指定已有 LB、LB 规格、名称、付费类型、带宽等 |
| 监听配置 | HTTPS 证书绑定（`protocol-port`/`cert-id`）、HTTP/HTTPS 监听参数、端口转发 |
| 后端服务器组 | 调度算法、后端服务器权重、虚拟服务器组标签过滤 |
| 健康检查 | TCP/HTTP 健康检查的详细参数（超时、间隔、阈值、域名、路径等） |
| 会话保持 | 源 IP / 服务器组级别的会话保持配置 |
| 访问控制 | ACL 白名单/黑名单配置 |
| **关键结论** | 这是工具书，不需要通读，遇到具体配置需求时按章节查阅即可 |

---

### ⑥ 通过 Annotation 配置网络型负载均衡 NLB

| 维度 | 说明 |
|------|------|
| **定位** | NLB 全量 Annotation **参考手册**（篇幅极大） |
| **核心内容** | |
| LB 实例配置 | 指定已有 NLB、跨可用区配置、名称、资源组等 |
| 监听配置 | TCP/UDP/TCPSSL 监听、证书绑定（`cert-id`）、全端口监听 |
| 服务器组 | NLB 服务器组类型（IP/Instance）、连接排水、Zone-aware 负载均衡 |
| 连接限流 | 单 IP 最大连接数、每秒新建连接数限制 |
| 健康检查 | TCP/HTTP 健康检查参数 |
| 其他 | 安全组绑定、IPv6 支持、访问日志配置 |
| **关键结论** | 同 ⑤，NLB 的工具书；TCPSSL 证书配置是本页面的高频使用场景 |

---

### ⑦ 通过复用已有负载均衡实现跨集群部署服务

| 维度 | 说明 |
|------|------|
| **定位** | 多集群共享单一 LB 入口的高级场景 |
| **核心内容** | |
| 场景一 | 一个 LB 同时挂载 ACK 集群内 Service + 集群外端点（如 ECS），实现混合后端 |
| 场景二 | 一个 LB 同时挂载**多个 ACK 集群**的 Service，统一入口；需要手动创建虚拟服务器组，多个 Service 共用同一组 |
| 转发权重 | 通过 `alibaba-cloud-loadbalancer-weight` 为不同集群的 Service 设置流量分配比例 |
| 前提条件 | CLB 需 CCM ≥ v2.0.1；NLB 需 CCM ≥ v2.9.1 |
| **关键结论** | 适合灾备/灰度/多集群联邦场景，但需注意命名空间 + Service 名称不能跨集群冲突 |

---

### ⑧ 通过配置 Readiness Gate 确保 Pod 平滑更新

| 维度 | 说明 |
|------|------|
| **定位** | 解决滚动更新时短暂流量中断的问题 |
| **核心内容** | |
| 问题根因 | 新 Pod 容器就绪速度快于 CCM 将其挂载到 LB 后端的速度 → 旧 Pod 被终止但新 Pod 尚未接收流量 → 短暂中断 |
| 解决方案 | 配置 `readinessGates`，条件为 `service.readiness.alibabacloud.com/<ServiceName>`；Pod 必须被 CCM 成功挂载到 LB 后端后才变为 Ready |
| 就绪流程 | 容器探针就绪 → CCM 添加后端 → Pod 最终就绪（三步串行） |
| 两种配置方式 | **手动配置**：在 Pod spec 中写 `readinessGates`；**自动注入**（CCM ≥ v2.12.4）：给 Namespace 打标签 `k8s.alibabacloud.com/pod-readiness-gate-inject=enabled` |
| **关键结论** | 生产环境强烈建议开启，特别是 Terway 集群 + 滚动更新场景；自动注入方式最省心 |

---

### ⑨ Service 异常问题排查

| 维度 | 说明 |
|------|------|
| **定位** | LoadBalancer Service 出问题时的一站式排查手册 |
| **核心内容** | |
| 诊断流程 | `kubectl get svc` → `kubectl describe svc` 查看 Event → 有事件走事件处理表，无事件走通用排查思路 |
| 高频异常事件（15+ 种） | 配额不足（`backend server number reached quota`）、共享型 CLB 不支持 ENI、无可用节点、LB 找不到、账号欠费、API 限流（Throttling）、VPC 不匹配、VSwitch IP 耗尽、targetPort 类型错误等 |
| 通用排查思路 | 检查 CCM 版本 → 检查 Service/Endpoint 状态 → 检查 LB 控制台资源一致性 → 检查 Annotation 配置 |
| **关键结论** | 出问题时的"急救手册"，先 `describe svc` 看 Event，按报错信息对号入座 |

---

## 按场景快速索引

| 你的场景 | 需要读的页面 |
|---------|------------|
| 刚接触 ACK Service，想了解全局 | ① + ② |
| 要创建 LoadBalancer Service 对外暴露应用 | ③ 或 ④（二选一） |
| 需要配 HTTPS 证书 / 定制 CLB 参数 | ⑤ |
| 需要配 TCPSSL / 定制 NLB 参数 | ⑥ |
| 多集群共享 LB 入口 | ⑦ |
| 滚动更新时流量中断 | ⑧ |
| Service 创建失败 / 不生效 / 报错 | ⑨ |