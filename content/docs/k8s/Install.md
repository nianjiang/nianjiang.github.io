---
weight: 101
title: "Install"
---

### Tools

[minikube](https://kubernetes.io/docs/tutorials/hello-minikube/)

[k3s](https://k3s.io/)

[kind](https://kind.sigs.k8s.io/)

[kwok](https://github.com/kubernetes-sigs/kwok/)

[kubeadm](https://kubernetes.io/docs/reference/setup-tools/kubeadm/)

[kubectl](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#taint)

[]()

[]()

### Commands

{{< expand "minikube/kind" >}}
    minikube start  --kubernetes-version=v1.28.4

    minikube node add

    minikube config view kubernetes-version

    kind create cluster --image=kindest/node:v1.28.0 -n kind2

    kind build node-image /path/to/kubernetes/source --image=kindest/node:v1.28.4
{{< /expand >}}



### Reference

[]()

[]()

[]()

[]()


