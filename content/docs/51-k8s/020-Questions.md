---
weight: 20
title: "Questions"
---

# Kubernetes 学习路径与问答

## Questions

### 学习云原生生态
根据 CNCF 的 [Kubestronaut](https://www.cncf.io/training/kubestronaut/) 路径，CKA 后通常会继续学习 CKAD、CKS、KCSA、KCNA 等认证。

推荐学习路径与配套练习：

| 序号 | 认证/技术 | 学习内容 | Killercoda 练习 | 其他资源 |
|:----:|----------|---------|-----------------|---------|
| 1 | **CKA** | 集群架构 25%·工作负载调度 15%·Service/网络 20%·存储 10%·故障排查 30% | [KillerShell CKA](https://killercoda.com/killer-shell-cka) | [官方](https://www.cncf.io/training/certification/cka/) |
| 2 | **CKAD** | 应用设计构建 20%·应用部署 20%·可观测性 15%·配置安全 25%·服务网络 20% | [KillerShell CKAD](https://killercoda.com/killer-shell-ckad) | [官方](https://www.cncf.io/training/certification/ckad/) |
| 3 | **CKS** | 集群加固 15%·系统加固 15%·微服务漏洞 20%·供应链安全 20%·监控审计 20%·事件响应 10% | [KillerShell CKS](https://killercoda.com/killer-shell-cks) | [官方](https://www.cncf.io/training/certification/cks/) |
| 4 | **ArgoCD** | GitOps 持续交付·Application/Project·同步策略·多集群管理 | [Killercoda Argo](https://killercoda.com/argo) | [官网](https://argo-cd.readthedocs.io/) |
| 5 | **Prometheus** | PromQL·指标类型·ServiceMonitor·告警规则·联邦集群 | [K8s Playground](https://killercoda.com/playgrounds/scenario/kubernetes) | [官方 Sandbox](https://prometheus.io/docs/tutorials/) |
| 6 | **Istio** | 流量管理·VirtualService/DestinationRule·金丝雀发布·熔断·mTLS | [Killercoda Istio](https://killercoda.com/istio) | [官方教程](https://istio.io/latest/docs/tutorials/) |
| 7 | **Cilium** | eBPF 网络·NetworkPolicy·Service Map·Hubble 可观测性·服务网格 | [Isovalent Labs](https://isovalent.com/labs/) | [官方教程](https://docs.cilium.io/en/latest/tutorials/) |

---

### Kubernetes The Hard Way
[kubernetes-the-hard-way](https://github.com/kelseyhightower/kubernetes-the-hard-way)

通过一遍：

API Server
Controller Manager
Scheduler
kubelet
etcd

全部自己搭建。

你会真正理解 Kubernetes 架构。

---

### 构建内部开发者平台 (IDP)

```
GitLab/Kubernetes
↓
Tekton/Argo Workflow
↓
Harbor
↓
Argo CD
↓
Prometheus/Grafana/Loki
```

---



## Reference

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