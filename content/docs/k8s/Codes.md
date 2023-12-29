---
weight: 101
title: "Codes"
BookToC: false
---

## Codes Structure:
|  Command Name for k8s components| Cobra Client      | Real Code        | Note         |
| -------- | --------   | -------    | --------     |
| kube-apiserver             |   [cmd/kube-apiserver/apiserver.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-apiserver/apiserver.go)      |      [cmd/kube-apiserver/app/server.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-apiserver/app/server.go)      | kubeAPIServer, APIExtensionsServer, AggregatorServer |
| kube-controller-manager    |   [cmd/kube-controller-manager/controller-manager.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-controller-manager/controller-manager.go)      |      [](https://github.com/kubernetes/kubernetes/blob/master/)      |              |
| kube-scheduler             |   [cmd/kube-scheduler/scheduler.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-scheduler/scheduler.go)      |      [pkg/scheduler/scheduler.go](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/scheduler.go)      |              |
| Etcd                       |   [](https://github.com/kubernetes/kubernetes/blob/master/)      |      [](https://github.com/kubernetes/kubernetes/blob/master/)      |              |
| Cloud Controller Manager   |   [cmd/cloud-controller-manager/main.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/cloud-controller-manager/main.go)      |      [](https://github.com/kubernetes/kubernetes/blob/master/)      |              |
|                            |                                                                  |                                                                     |              |
| kubelet                    |   [cmd/kubelet/kubelet.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kubelet/kubelet.go)      |      [pkg/kubelet/kubelet.go](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/kubelet.go)      |              |
| kube-proxy                 |   [cmd/kube-proxy/proxy.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-proxy/proxy.go)      |      [pkg/proxy/service.go](https://github.com/kubernetes/kubernetes/blob/master/pkg/proxy/service.go)      |              |
|                            |                                                                  |                                                                     |              |
| kubectl                    |   [cmd/kubectl/kubectl.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kubectl/kubectl.go)      |      [](https://github.com/kubernetes/kubernetes/blob/master/)      |              |


## Commands
{{< tabs "Commands" >}}

{{< tab "kube-apiserver " >}} 
kube-apiserver <br/>
--advertise-address=172.20.0.2 <br/>
--allow-privileged=true <br/>
--authorization-mode=Node,RBAC <br/>
--client-ca-file=/etc/kubernetes/pki/ca.crt <br/>
--enable-admission-plugins=NodeRestriction <br/>
--enable-bootstrap-token-auth=true <br/>
--etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt --etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt  <br/>
--etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key --etcd-servers=https://127.0.0.1:2379 <br/>
--kubelet-client-certificate=/etc/kubernetes/pki/apiserver-kubelet-client.crt  <br/>
--kubelet-client-key=/etc/kubernetes/pki/apiserver-kubelet-client.key <br/>
--kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname <br/>
--proxy-client-cert-file=/etc/kubernetes/pki/front-proxy-client.crt --proxy-client-key-file=/etc/kubernetes/pki/front-proxy-client.key <br/>
--requestheader-allowed-names=front-proxy-client <br/>
--requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt <br/>
--requestheader-extra-headers-prefix=X-Remote-Extra- <br/>
--requestheader-group-headers=X-Remote-Group <br/>
--requestheader-username-headers=X-Remote-User <br/>
--runtime-config= <br/>
--secure-port=6443 <br/>
--service-account-issuer=https://kubernetes.default.svc.cluster.local <br/>
--service-account-key-file=/etc/kubernetes/pki/sa.pub --service-account-signing-key-file=/etc/kubernetes/pki/sa.key <br/>
--service-cluster-ip-range=10.96.0.0/16 <br/>
--tls-cert-file=/etc/kubernetes/pki/apiserver.crt --tls-private-key-file=/etc/kubernetes/pki/apiserver.key <br/>
{{< /tab >}}

{{< tab "kube-controller-manager " >}}
kube-controller-manager <br/>
--allocate-node-cidrs=true <br/>
--authentication-kubeconfig=/etc/kubernetes/controller-manager.conf   <br/>
--authorization-kubeconfig=/etc/kubernetes/controller-manager.conf <br/>
--bind-address=127.0.0.1 <br/>
--client-ca-file=/etc/kubernetes/pki/ca.crt <br/>
--cluster-cidr=10.244.0.0/16 <br/>
--cluster-name=kind <br/>
--cluster-signing-cert-file=/etc/kubernetes/pki/ca.crt --cluster-signing-key-file=/etc/kubernetes/pki/ca.key <br/>
--controllers=*,bootstrapsigner,tokencleaner <br/>
--enable-hostpath-provisioner=true <br/>
--kubeconfig=/etc/kubernetes/controller-manager.conf <br/>
--leader-elect=true <br/>
--requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt <br/>
--root-ca-file=/etc/kubernetes/pki/ca.crt <br/>
--service-account-private-key-file=/etc/kubernetes/pki/sa.key <br/>
--service-cluster-ip-range=10.96.0.0/16 <br/>
--use-service-account-credentials=true <br/>
{{< /tab >}}

{{< tab "kube-scheduler" >}} 
kube-scheduler <br/>
--authentication-kubeconfig=/etc/kubernetes/scheduler.conf --authorization-kubeconfig=/etc/kubernetes/scheduler.conf <br/>
--bind-address=127.0.0.1 <br/>
--kubeconfig=/etc/kubernetes/scheduler.conf <br/>
--leader-elect=true <br/>
{{< /tab >}}

{{< tab "etcd" >}} 
etcd <br/>
--advertise-client-urls=https://172.20.0.2:2379 <br/>
--cert-file=/etc/kubernetes/pki/etcd/server.crt <br/>
--client-cert-auth=true <br/>
--data-dir=/var/lib/etcd <br/>
--experimental-initial-corrupt-check <br/>
{{< /tab >}}

{{< tab "kubelet" >}} 
/usr/bin/kubelet <br/>
--bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.conf <br/>
--kubeconfig=/etc/kubernetes/kubelet.conf <br/>
--config=/var/lib/kubelet/config.yaml <br/>
--container-runtime-endpoin <br/>
{{< /tab >}}

{{< tab "kube-proxy" >}} 
/usr/local/bin/kube-proxy <br/>
--config=/var/lib/kube-proxy/config.conf <br/>
--hostname-override=kind-control-plane <br/>
{{< /tab >}}
{{< /tabs >}}


## Customer Resource Definition (CRD)

[Kuberenetes Design&Architecture Pictures ](https://github.com/cloudnativeto/sig-kubernetes/blob/kubernetes-picture-book-v1.0/docs/SUMMARY.md)

[Writing Kubernetes Controllers from Peter J](https://www.youtube.com/watch?v=q7b23612pSc&ab_channel=PeterJausovec)

[kubebuilder](https://book.kubebuilder.io)

[Concepts -> Extending Kubernetes](https://kubernetes.io/docs/concepts/extend-kubernetes/)

[Tasks -> Extend Kubernetes](https://kubernetes.io/docs/tasks/extend-kubernetes/)

---

[Tutorials](https://github.com/leovct/kube-operator-tutorial)

[SIG-Scheduling Intro & Deep Dive](https://www.youtube.com/watch?v=mLsIcZyop5o&list=PLj6h78yzYM2OJcjIuAsbbhXAaDrAnuKRB&index=63&ab_channel=CNCF%5BCloudNativeComputingFoundation%5D)

[What's New on Controller-Runtime of the Day -- Make Your Operator More Efficient - Siyu Wang, Alibaba Cloud](https://www.youtube.com/watch?v=4Bs9Pgn4z2w&list=PLj6h78yzYM2OJcjIuAsbbhXAaDrAnuKRB&index=60&ab_channel=CNCF%5BCloudNativeComputingFoundation%5D)

[Kubernetes Operators: what are they? Some examples](https://www.cncf.io/blog/2022/06/15/kubernetes-operators-what-are-they-some-examples/)

[Nginx Community](https://space.bilibili.com/628384319/channel/series)

[]()

[]()

https://docs.pingcap.com/zh/tidb-in-kubernetes/stable/architecture


## Aggregator Server

[apiserver-builder](https://github.com/kubernetes-sigs/apiserver-builder-alpha)

[]()




## Code Learn Turorial

[k8s Dev Guide](https://github.com/kubernetes/community/blob/master/contributors/devel/README.md)

[sig-k8s-source-code](https://jnh.gitbook.io/sig-k8s-source-code/)

https://bharatrajani.com/debugging-kubernetes-source-code-using-vscode/

https://www.qikqiak.com/k8strain/operator/operator/

[k8s Doc]()

[Let's read the Kubernetes source code(Youtube)](https://www.youtube.com/watch?v=F8dZMKP6xyg&ab_channel=AntsAreEverywhere)

[Operator概述: 如何对 Kubernetes 进行扩展](https://lailin.xyz/post/operator-01-overview.html)

[How to build and run Kubernetes locally](https://dev.to/rahulku48837211/how-to-build-and-run-k8s-locally-5e3m)

[kube-apiserver的设计与实现](https://www.ziji.work/kubernetes/kube-apiserver-design-and-implementation-design-and-implementation.html)

[Kubernetes API Server handler 注册过程分析](https://cloudnative.to/blog/apiserver-handler-register/)

[Kubernetes源码](https://isekiro.com/categories/kubernetes%E6%BA%90%E7%A0%81/)

[Kubernetes源码分析——apiserver](https://qiankunli.github.io/2019/01/05/kubernetes_source_apiserver.html)

[Managing Kubernetes](https://www.oreilly.com/library/view/managing-kubernetes/9781492033905/?_gl=1*1yu4goh*_ga*NTQ1OTQ5OTcyLjE2OTc0NDYzMDQ.*_ga_092EL089CH*MTY5NzQ1MDUxMS4yLjEuMTY5NzQ1MDUzNS4zNi4wLjA.)

[新高度 Kubernetes实战与源码剖析实战](https://www.modb.pro/db/617592)

[kubernetes 源码分析](https://www.zhihu.com/column/c_1195294063723929600)

[深究Kubernetes源码](https://space.bilibili.com/408458404/article)

[也谈云原生 - 系统设计漫谈](https://www.youtube.com/playlist?list=PL6_VNo5AuIreZ7PGxxIjcuZVME8-5tS7v)

[倪朋飞](https://feisky.xyz/about/)

[]()

[]()

[]()

https://www.jianshu.com/nb/51646191

https://zhuanlan.zhihu.com/p/542730941

https://www.51cto.com/article/749490.html

https://blog.csdn.net/fengcai_ke/article/details/126695585

https://www.oomspot.com/post/mafenxikubeapiserverzhongapiserverservicedeshixian

https://andblog.cn/3203

http://www.zlprogram.com/Show/74/DF178041.shtml

https://www.cnblogs.com/yangyuliufeng/p/14217887.html

https://podsbook.com/posts/kubernetes/operator/#client-go



## Reference

[k8s Github](https://github.com/kubernetes/kubernetes/tree/master/pkg)
















<br/><br/><br/>


[K8s Releases](https://github.com/kubernetes/sig-release/tree/master/releases):
|  Release | Start      | End        | Note         |
| -------- | --------   | -------    | --------     |
| 1.29     | 2023/12    | 2025/02    | https://kubernetes.io/blog/2023/12/13/kubernetes-v1-29-release/  |
| 1.28     | 2023/08    | 2024/10    | https://kubernetes.io/blog/2023/08/15/kubernetes-v1-28-release/  |
| 1.27     | 2023/04    | 2024/06    |              |
| -------- | --------   | --------   | --------     |
| 1.26     | 2022/12    | 2024/02    |              |
| 1.25     | 2022/08    | 2023/10    |              |
| 1.24     | 2022/05    | 2023/07    |              |
| -------- | --------   | --------   | --------     |
| 1.23     | 2021/12    | 2023/02    |              |
| 1.14     | 2019/03    | 2019/12    |              |
| 1.0      | 2015/07/10 |            | Original Release             |


[Release](https://github.com/kubernetes/sig-release/tree/master/releases) ,
[Wiki](https://en.wikipedia.org/wiki/Kubernetes), 
[Snapshot](https://kubernetes.io/docs/home/supported-doc-versions/)






### Reference

[CloudNative & Kubernetes 学习资源整理](https://nsddd.notion.site/CloudNative-Kubernetes-2f278e98ed274999829333272415c72d)

[Palpark](https://palpark.me/resources?specialty=Kubernetes)

[Template](https://zhuanlan.zhihu.com/p/568485172)

[]()

[]()

[]()

[]()




















