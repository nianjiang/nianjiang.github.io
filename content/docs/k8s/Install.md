---
weight: 101
title: "Install"
---

### Tools

[minikube](https://kubernetes.io/docs/tutorials/hello-minikube/)

[k3s](https://k3s.io/)

[kind](https://kind.sigs.k8s.io/)

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

[]()

[]()

[]()

[]()


