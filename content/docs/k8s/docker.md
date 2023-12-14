---
weight: 102
title: "Docker"
---


# Tools (docker/containerd/...)

## Install Tools/Configurations

### [The mirrors for Docker images](https://www.cnblogs.com/wubolive/p/17317586.html)
    {{< details title="gcr.io" open=false >}}
    DaoCloud
    源站：docker pull               k8s.gcr.io/metrics-server/metrics-server:v0.6.1
    改为：docker pull m.daocloud.io/k8s.gcr.io/metrics-server/metrics-server:v0.6.1
    {{< /details >}}

    {{< details title="kubeadm config images list" open=false >}}
    
    docker pull   m.daocloud.io/registry.k8s.io/kube-apiserver:v1.28.4
    docker pull   m.daocloud.io/registry.k8s.io/kube-controller-manager:v1.28.4
    docker pull   m.daocloud.io/registry.k8s.io/kube-scheduler:v1.28.4
    docker pull   m.daocloud.io/registry.k8s.io/kube-proxy:v1.28.4
    docker pull   m.daocloud.io/registry.k8s.io/pause:3.9
    docker pull   m.daocloud.io/registry.k8s.io/etcd:3.5.9-0
    docker pull   m.daocloud.io/registry.k8s.io/coredns/coredns:v1.10.1

    docker tag   m.daocloud.io/registry.k8s.io/kube-apiserver:v1.28.4           registry.k8s.io/kube-apiserver:v1.28.4
    docker tag   m.daocloud.io/registry.k8s.io/kube-controller-manager:v1.28.4  registry.k8s.io/kube-controller-manager:v1.28.4
    docker tag   m.daocloud.io/registry.k8s.io/kube-scheduler:v1.28.4           registry.k8s.io/kube-scheduler:v1.28.4      
    docker tag   m.daocloud.io/registry.k8s.io/kube-proxy:v1.28.4               registry.k8s.io/kube-proxy:v1.28.4
    docker tag   m.daocloud.io/registry.k8s.io/pause:3.9                        registry.k8s.io/pause:3.9
    docker tag   m.daocloud.io/registry.k8s.io/etcd:3.5.9-0                     registry.k8s.io/etcd:3.5.9-0
    docker tag   m.daocloud.io/registry.k8s.io/coredns/coredns:v1.10.1          registry.k8s.io/coredns/coredns:v1.10.1
    {{< /details >}}


### [Install containerd/runc/cni](https://github.com/containerd/containerd/blob/main/docs/getting-started.md)
    {{< details title="gcr.io" open=false >}}
    wget https://github.com/containerd/containerd/releases/download/v1.7.11/containerd-1.7.11-linux-amd64.tar.gz
    sudo tar Cxzvf /usr/local containerd-*-linux-amd64.tar.gz

    wget https://raw.githubusercontent.com/containerd/containerd/main/containerd.service
    sudo mkdir -p /usr/local/lib/systemd/system
    sudo cp containerd.service /usr/local/lib/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable --now containerd

    wget https://github.com/opencontainers/runc/releases/download/v1.1.10/runc.amd64
    sudo install -m 755 runc.amd64 /usr/local/sbin/runc

    wget https://github.com/containernetworking/plugins/releases/download/v1.4.0/cni-plugins-linux-amd64-v1.4.0.tgz
    mkdir -p /opt/cni/bin
    sudo tar Cxzvf /opt/cni/bin cni-plugins-linux-amd64-v*.tgz
    {{< /details >}}
[containerd](https://containerd.io/), [cri-o](https://cri-o.io/)


### [kubeadm](https://kubernetes.io/docs/reference/setup-tools/kubeadm/)

    {{< details title="gcr.io" open=false >}}
    ubuntu@c1:~$ kubeadm config images list
    registry.k8s.io/kube-apiserver:v1.28.4
    registry.k8s.io/kube-controller-manager:v1.28.4
    registry.k8s.io/kube-scheduler:v1.28.4
    registry.k8s.io/kube-proxy:v1.28.4
    registry.k8s.io/pause:3.9
    registry.k8s.io/etcd:3.5.9-0
    registry.k8s.io/coredns/coredns:v1.10.1
    ubuntu@c1:~$
    {{< /details >}}

## Reference

[Docker](https://docs.docker.com/engine/install/ubuntu/#install-using-the-convenience-script)

[Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)

[Istio](https://istio.io/latest/docs/setup/getting-started/)

[Minikube](https://minikube.sigs.k8s.io/docs/start/)

https://github.com/cubxxw/awesome-cloud-native






