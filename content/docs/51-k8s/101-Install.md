---
weight: 101
title: "Install"
---

### Tools

|  Tools | Doc      | Github        | Note         |
| -------- | --------   | -------    | --------     |
| [minikube](https://kubernetes.io/docs/tutorials/hello-minikube/)      | [Doc](https://minikube.sigs.k8s.io/docs/)    | [Github](https://github.com/kubernetes/minikube)     |    Run Kubernetes locally          |
| [k3s](https://k3s.io/)                                                | [Doc](https://docs.k3s.io/)    | [Github](https://github.com/k3s-io/k3s/)     |   Lightweight Kubernetes. Easy to install, half the memory, all in a binary of less than 100 MB. |
| [kind](https://kind.sigs.k8s.io/)                                     | [Doc](https://kind.sigs.k8s.io/)    | [Github](https://github.com/kubernetes-sigs/kind/)     |   Kubernetes IN Docker - local clusters for testing Kubernetes           |


[kwok](https://github.com/kubernetes-sigs/kwok/)

[kubectl](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#taint)

[crictl](https://github.com/kubernetes-sigs/cri-tools/blob/master/docs/crictl.md), [podman](https://docs.podman.io/en/latest/Introduction.html)

[]()

[]()

[]()

[]()

[]()

### Commands

{{< details "minikube" >}}
    minikube start  --kubernetes-version=v1.28.4

    minikube node add

    minikube config view kubernetes-version

    #Open K8s Dashboard
    minikube dashboard
    http://127.0.0.1:56740/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/#/workloads?namespace=default

{{< /details >}}


{{< details "kind" >}}
    kind create cluster --image=kindest/node:v1.28.0 -n kind2

    kind build node-image /path/to/kubernetes/source --image=kindest/node:v1.28.4
{{< /details >}}

--------------------------------

### Kubectl
| 命令 | 作用 | 对 Pod 的影响 | 典型场景 | 使用命令 | 恢复命令 |
| --- | --- | --- | --- | --- | --- |
| `cordon` | 将节点标记为**不可调度**（SchedulingDisabled） | 已有 Pod 不受影响，新 Pod 不会被调度到该节点 | 节点即将维护，先阻止新 Pod 调度 | `kubectl cordon <node>` | `kubectl uncordon <node>` |
| `uncordon` | 将节点恢复为**可调度** | 无影响，节点重新接受新 Pod 调度 | 维护完成，将节点重新上线 | `kubectl uncordon <node>` |  |
| `drain` | **驱逐**节点上的所有 Pod（或指定 Pod） | 先 cordon 节点，再逐 Pod 驱逐（graceful termination）；如有 DaemonSet Pod 需加 `--ignore-daemonsets` | 节点需要关机/升级/缩容，必须迁移走全部工作负载 | `kubectl drain <node> --ignore-daemonsets --delete-emptydir-data` | `kubectl uncordon <node>`，控制器自动重建 Pod |
| `taint` | 给节点添加/修改/删除**污点**（Taint） | 没有对应 Toleration 的 Pod 会被拒绝调度到该节点；已运行的 Pod 不受影响 | 精细化调度控制，如专用节点（GPU/高内存）、隔离故障节点 | `kubectl taint nodes <node> <key>=<value>:<effect>` | `kubectl taint nodes <node> <key>-` |

--------------------------

### Reference

[k0s、MicroK8s、kind、k3s 和 Minikube](https://zhuanlan.zhihu.com/p/594206344)

[dockerhub: kindest/node](https://hub.docker.com/r/kindest/node/tags?page=1&ordering=name)

[]()

[]()


