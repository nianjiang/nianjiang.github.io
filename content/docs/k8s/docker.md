---
weight: 100
title: "Docker"
---


# Docker

- Install Docker

    {{< details title="[Install Docker](https://docs.docker.com/engine/install/ubuntu/#install-using-the-convenience-script)" open=true >}}
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

    {{< details title="Create Docker Group" open=true >}}
    sudo usermod -aG docker $USER
    newgrp docker
    sudo service docker start
    {{< /details >}}



- Install Kubectl

    {{< details title="Install Kuberctl" open=true >}}
    curl -LO https://dl.k8s.io/release/v1.27.3/bin/linux/amd64/kubectl
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    {{< /details >}}


- Install istio
    {{< details title="Install Istio" open=true >}}
    curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.18.1 TARGET_ARCH=x86_64 sh -
    cd istio-1.18.1/bin
    sudo install -o root -g root -m 0755 istioctl /usr/local/bin/istioctl

    istioctl install --set profile=demo -y
    kubectl label namespace default istio-injection=enabled
    {{< /details >}}





### Reference

[Docker](https://docs.docker.com/engine/install/ubuntu/#install-using-the-convenience-script)

[Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)

[Istio](https://istio.io/latest/docs/setup/getting-started/)

[Minikube](https://minikube.sigs.k8s.io/docs/start/)