---
weight: 100
title: "Docker"
---


# Docker

## Install Tools

###  Docker

    {{< details title="[Install Docker](https://docs.docker.com/engine/install/ubuntu/#install-using-the-convenience-script)" open=false >}}
    1. Set up the Repository
    sudo apt-get update
    sudo apt-get install ca-certificates curl gnupg

    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
    "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null


    2. Install Docker
    sudo apt-get update
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo docker run hello-world

    verify:
    sudo docker run hello-world

    newgrp docker
    {{< /details >}}

    {{< details title="Create Docker Group" open=false >}}
    sudo usermod -aG docker $USER
    newgrp docker
    sudo service docker start
    {{< /details >}}

###  [Minikube](https://minikube.sigs.k8s.io/docs/start/)

    

###  Kubectl

    {{< details title="Install Kuberctl" open=false >}}
    curl -LO https://dl.k8s.io/release/v1.27.3/bin/linux/amd64/kubectl
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    {{< /details >}}


###  istio
    {{< details title="Install Istio" open=false >}}
    curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.18.1 TARGET_ARCH=x86_64 sh -
    cd istio-1.18.1/bin
    sudo install -o root -g root -m 0755 istioctl /usr/local/bin/istioctl

    istioctl install --set profile=demo -y
    kubectl label namespace default istio-injection=enabled
    {{< /details >}}



## Configurations

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

ubuntu@c1:~$ kubeadm config images list
registry.k8s.io/kube-apiserver:v1.28.4
registry.k8s.io/kube-controller-manager:v1.28.4
registry.k8s.io/kube-scheduler:v1.28.4
registry.k8s.io/kube-proxy:v1.28.4
registry.k8s.io/pause:3.9
registry.k8s.io/etcd:3.5.9-0
registry.k8s.io/coredns/coredns:v1.10.1
ubuntu@c1:~$

## Reference

[Docker](https://docs.docker.com/engine/install/ubuntu/#install-using-the-convenience-script)

[Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)

[Istio](https://istio.io/latest/docs/setup/getting-started/)

[Minikube](https://minikube.sigs.k8s.io/docs/start/)

https://github.com/cubxxw/awesome-cloud-native






