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

{{< expand "minikube" >}}
    minikube start  --kubernetes-version=v1.28.4

    minikube node add

    minikube config view kubernetes-version

    #Open K8s Dashboard
    minikube dashboard
    http://127.0.0.1:56740/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/#/workloads?namespace=default


    
    


{{< /expand >}}

{{< expand "kind" >}}
    kind create cluster --image=kindest/node:v1.28.0 -n kind2

    kind build node-image /path/to/kubernetes/source --image=kindest/node:v1.28.4
{{< /expand >}}



### Reference

[k0s、MicroK8s、kind、k3s 和 Minikube](https://zhuanlan.zhihu.com/p/594206344)

[dockerhub: kindest/node](https://hub.docker.com/r/kindest/node/tags?page=1&ordering=name)

[]()

[]()


