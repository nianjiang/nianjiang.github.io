---
weight: 101
title: "Codes"
BookToC: false
---

## Codes Structure:
|  Command Name for k8s components| Cobra Client      | Real Code        | Note         |
| -------- | --------   | -------    | --------     |
| kube-apiserver             |   [cmd/kube-apiserver/apiserver.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-apiserver/apiserver.go)      |      [cmd/kube-apiserver/app/server.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-apiserver/app/server.go)      |              |
| kube-controller-manager    |   [cmd/kube-controller-manager/controller-manager.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-controller-manager/controller-manager.go)      |      [](https://github.com/kubernetes/kubernetes/blob/master/)      |              |
| kube-scheduler             |   [cmd/kube-scheduler/scheduler.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-scheduler/scheduler.go)      |      [pkg/scheduler/scheduler.go](https://github.com/kubernetes/kubernetes/blob/master/pkg/scheduler/scheduler.go)      |              |
| Etcd                       |   [](https://github.com/kubernetes/kubernetes/blob/master/)      |      [](https://github.com/kubernetes/kubernetes/blob/master/)      |              |
| Cloud Controller Manager   |   [cmd/cloud-controller-manager/main.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/cloud-controller-manager/main.go)      |      [](https://github.com/kubernetes/kubernetes/blob/master/)      |              |
|                            |                                                                  |                                                                     |              |
| kubelet                    |   [cmd/kubelet/kubelet.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kubelet/kubelet.go)      |      [pkg/kubelet/kubelet.go](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/kubelet.go)      |              |
| kube-proxy                 |   [cmd/kube-proxy/proxy.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kube-proxy/proxy.go)      |      [pkg/proxy/service.go](https://github.com/kubernetes/kubernetes/blob/master/pkg/proxy/service.go)      |              |
|                            |                                                                  |                                                                     |              |
| kubectl                    |   [cmd/kubectl/kubectl.go](https://github.com/kubernetes/kubernetes/blob/master/cmd/kubectl/kubectl.go)      |      [](https://github.com/kubernetes/kubernetes/blob/master/)      |              |


## Customer Resource Definition (CRD)

[kubebuilder](https://book.kubebuilder.io)

[Concepts -> Extending Kubernetes](https://kubernetes.io/docs/concepts/extend-kubernetes/)

[Tasks -> Extend Kubernetes](https://kubernetes.io/docs/tasks/extend-kubernetes/)

[SIG-Scheduling Intro & Deep Dive](https://www.youtube.com/watch?v=mLsIcZyop5o&list=PLj6h78yzYM2OJcjIuAsbbhXAaDrAnuKRB&index=63&ab_channel=CNCF%5BCloudNativeComputingFoundation%5D)

[What's New on Controller-Runtime of the Day -- Make Your Operator More Efficient - Siyu Wang, Alibaba Cloud](https://www.youtube.com/watch?v=4Bs9Pgn4z2w&list=PLj6h78yzYM2OJcjIuAsbbhXAaDrAnuKRB&index=60&ab_channel=CNCF%5BCloudNativeComputingFoundation%5D)

## Code Learn Turorial

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

[]()

[]()

[]()

[]()

[]()

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


K8s Releases:
|  Release | Start      | End        | Note         |
| -------- | --------   | -------    | --------     |
| 1.29     | 2023/12    |            |              |
| 1.28     | 2023/08    | 2024/10    | https://kubernetes.io/blog/2023/08/15/kubernetes-v1-28-release/      |
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
[Wiki](https://en.wikipedia.org/wiki/Kubernetes)






### Reference

[CloudNative & Kubernetes 学习资源整理](https://nsddd.notion.site/CloudNative-Kubernetes-2f278e98ed274999829333272415c72d)

[Palpark](https://palpark.me/resources?specialty=Kubernetes)

[Template](https://zhuanlan.zhihu.com/p/568485172)

[]()

[]()

[]()

[]()




