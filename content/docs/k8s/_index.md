---
weight: 51
title: "K8S"
bookCollapseSection: true
customjs:
 - http://code.jquery.com/jquery-1.4.2.min.js
 - http://yourdomain.com/yourscript.js
---

# [Kubernetes](https://kubernetes.io/) Notes
> This is my learning Notes for Kubernetes

---

***Doubts***:

- [Service vs Ingress](https://lib.jimmysong.io/kubernetes-handbook/service-discovery/)

- How do kubelet know the pod is started success? justify process/port/url.   
How about POD life cycle?

- [Prometheus Intro and Deep Dive - Richard Hartmann, Grafana Labs](https://www.youtube.com/watch?v=t3YFv20Ulnc&list=PLj6h78yzYM2OJcjIuAsbbhXAaDrAnuKRB&index=56&ab_channel=CNCF%5BCloudNativeComputingFoundation%5D)

- []()

- []()


---

- Setup (minikube, SandBox)

    [minikube website](https://minikube.sigs.k8s.io/docs/start/)
    
    
- PlayGround

    [KillerCoda](https://killercoda.com/playgrounds)


- Kubernetes API / Resources

    [API-V1.28](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.28/)

    [Kubectl](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands)

    [Kubernetes API Resources Overview](https://able8.medium.com/kubernetes-api-resources-overview-db1294f7cfd6)

- Componets (Scheduler, Controller, ETCD, API, Kubelet)    
  
- Operator

    https://lib.jimmysong.io/kubernetes-handbook/develop/operator/

- CRI (containerd)

- CNI (cilium, calico)

- CSI (ceph, pv, pvc)

- Prometheus/Tekton/Argo


<br/>

---


<br/>

## [K8s Resources](http://www.mtitek.com/tutorials/kubernetes/kubectl_cli_api_resources.php)

|NAME                              |SHORTNAMES                          	|APIVERSION                             |NAMESPACED   |KIND                             |VERBS          |                                              CATEGORIES|
|-------- 							| --------   							| -------    							| --------    |-------    						| --------     	|										 --------     	 |
|bindings                                                                                                                                   |                                       |v1                                     |true         |Binding                          |create|			|
|componentstatuses                                                                                                                          |cs                                     |v1                                     |false        |ComponentStatus                  |get,list|			|
|configmaps                                                                                                                                 |cm                                     |v1                                     |true         |ConfigMap                        |create,delete,deletecollection,get,list,patch,update,watch|			|
|controllerrevisions                                                                                                                        |                                       |apps/v1                                |true         |ControllerRevision               |create,delete,deletecollection,get,list,patch,update,watch|			|
|daemonsets                                                                                                                                 |ds                                     |apps/v1                                |true         |DaemonSet                        |create,delete,deletecollection,get,list,patch,update,watch|   all	|
|[deployments](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/deployment-v1/)                                       |deploy                                 |apps/v1                                |true         |Deployment                       |create,delete,deletecollection,get,list,patch,update,watch|   all	|
|endpoints                                                                                                                                  |ep                                     |v1                                     |true         |Endpoints                        |create,delete,deletecollection,get,list,patch,update,watch|			|
|events                                                                                                                                     |ev                                     |v1                                     |true         |Event                            |create,delete,deletecollection,get,list,patch,update,watch|			|
|limitranges                                                                                                                                |limits                                 |v1                                     |true         |LimitRange                       |create,delete,deletecollection,get,list,patch,update,watch|			|
|namespaces                                                                                                                                 |ns                                     |v1                                     |false        |Namespace                        |create,delete,get,list,patch,update,watch|			|
|nodes                                                                                                                                      |no                                     |v1                                     |false        |Node                             |create,delete,deletecollection,get,list,patch,update,watch|			|
|persistentvolumeclaims                                                                                                                     |pvc                                    |v1                                     |true         |PersistentVolumeClaim            |create,delete,deletecollection,get,list,patch,update,watch|			|
|persistentvolumes                                                                                                                          |pv                                     |v1                                     |false        |PersistentVolume                 |create,delete,deletecollection,get,list,patch,update,watch|			|
|[pods](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/)                                                     |po                                     |v1                                     |true         |Pod                              |create,delete,deletecollection,get,list,patch,update,watch|   all	|
|[podtemplates](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-template-v1/)                                    |                                       |v1                                     |true         |PodTemplate                      |create,delete,deletecollection,get,list,patch,update,watch|			|
|[replicasets](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/replica-set-v1/)                                      |rs                                     |apps/v1                                |true         |ReplicaSet                       |create,delete,deletecollection,get,list,patch,update,watch|   all	|
|[replicationcontrollers](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/replication-controller-v1/)                |rc                                     |v1                                     |true         |ReplicationController            |create,delete,deletecollection,get,list,patch,update,watch|   all	|
|resourcequotas                                                                                                                             |quota                                  |v1                                     |true         |ResourceQuota                    |create,delete,deletecollection,get,list,patch,update,watch|			|
|secrets                                                                                                                                    |                                       |v1                                     |true         |Secret                           |create,delete,deletecollection,get,list,patch,update,watch|			|
|serviceaccounts                                                                                                                            |sa                                     |v1                                     |true         |ServiceAccount                   |create,delete,deletecollection,get,list,patch,update,watch|			|
|services                                                                                                                                   |svc                                    |v1                                     |true         |Service                          |create,delete,deletecollection,get,list,patch,update,watch|   all	|
|statefulsets                                                                                                                               |sts                                    |apps/v1                                |true         |StatefulSet                      |create,delete,deletecollection,get,list,patch,update,watch|   all	|
|mutatingwebhookconfigurations                                                                                                              |                                       |admissionregistration.k8s.io/v1        |false        |MutatingWebhookConfiguration     |create,delete,deletecollection,get,list,patch,update,watch|   api-extensions|
|validatingwebhookconfigurations                                                                                                            |                                       |admissionregistration.k8s.io/v1        |false        |ValidatingWebhookConfiguration   |create,delete,deletecollection,get,list,patch,update,watch|   api-extensions|
|customresourcedefinitions                                                                                                                  |crd,crds                               |apiextensions.k8s.io/v1                |false        |CustomResourceDefinition         |create,delete,deletecollection,get,list,patch,update,watch|   api-extensions|
|apiservices                                                                                                                                |                                       |apiregistration.k8s.io/v1              |false        |APIService                       |create,delete,deletecollection,get,list,patch,update,watch|   api-extensions|
|selfsubjectreviews                                                                                                                         |                                       |authentication.k8s.io/v1               |false        |SelfSubjectReview                |create|			|
|tokenreviews                                                                                                                               |                                       |authentication.k8s.io/v1               |false        |TokenReview                      |create|			|
|localsubjectaccessreviews                                                                                                                  |                                       |authorization.k8s.io/v1                |true         |LocalSubjectAccessReview         |create|			|
|selfsubjectaccessreviews                                                                                                                   |                                       |authorization.k8s.io/v1                |false        |SelfSubjectAccessReview          |create|			|
|selfsubjectrulesreviews                                                                                                                    |                                       |authorization.k8s.io/v1                |false        |SelfSubjectRulesReview           |create|			|
|subjectaccessreviews                                                                                                                       |                                       |authorization.k8s.io/v1                |false        |SubjectAccessReview              |create|			|
|horizontalpodautoscalers                                                                                                                   |hpa                                    |autoscaling/v2                         |true         |HorizontalPodAutoscaler          |create,delete,deletecollection,get,list,patch,update,watch|   all  |
|cronjobs                                                                                                                                   |cj                                     |batch/v1                               |true         |CronJob                          |create,delete,deletecollection,get,list,patch,update,watch|   all  |
|jobs                                                                                                                                       |                                       |batch/v1                               |true         |Job                              |create,delete,deletecollection,get,list,patch,update,watch|   all  |
|certificatesigningrequests                                                                                                                 |csr                                    |certificates.k8s.io/v1                 |false        |CertificateSigningRequest        |create,delete,deletecollection,get,list,patch,update,watch|			|
|leases                                                                                                                                     |                                       |coordination.k8s.io/v1                 |true         |Lease                            |create,delete,deletecollection,get,list,patch,update,watch|			|
|endpointslices                                                                                                                             |                                       |discovery.k8s.io/v1                    |true         |EndpointSlice                    |create,delete,deletecollection,get,list,patch,update,watch|			|
|events                                                                                                                                     |ev                                     |events.k8s.io/v1                       |true         |Event                            |create,delete,deletecollection,get,list,patch,update,watch|			|
|flowschemas                                                                                                                                |                                       |flowcontrol.apiserver.k8s.io/v1beta3   |false        |FlowSchema                       |create,delete,deletecollection,get,list,patch,update,watch|			|
|prioritylevelconfigurations                                                                                                                |                                       |flowcontrol.apiserver.k8s.io/v1beta3   |false        |PriorityLevelConfiguration       |create,delete,deletecollection,get,list,patch,update,watch|			|
|nodes                                                                                                                                      |                                       |metrics.k8s.io/v1beta1                 |false        |NodeMetrics                      |get,list|			|
|pods                                                                                                                                       |                                       |metrics.k8s.io/v1beta1                 |true         |PodMetrics                       |get,list|			|
|ingressclasses                                                                                                                             |                                       |networking.k8s.io/v1                   |false        |IngressClass                     |create,delete,deletecollection,get,list,patch,update,watch|			|
|ingresses                                                                                                                                  |ing                                    |networking.k8s.io/v1                   |true         |Ingress                          |create,delete,deletecollection,get,list,patch,update,watch|			|
|networkpolicies                                                                                                                            |netpol                                 |networking.k8s.io/v1                   |true         |NetworkPolicy                    |create,delete,deletecollection,get,list,patch,update,watch|			|
|runtimeclasses                                                                                                                             |                                       |node.k8s.io/v1                         |false        |RuntimeClass                     |create,delete,deletecollection,get,list,patch,update,watch|			|
|poddisruptionbudgets                                                                                                                       |pdb                                    |policy/v1                              |true         |PodDisruptionBudget              |create,delete,deletecollection,get,list,patch,update,watch|			|
|clusterrolebindings                                                                                                                        |                                       |rbac.authorization.k8s.io/v1           |false        |ClusterRoleBinding               |create,delete,deletecollection,get,list,patch,update,watch|			|
|clusterroles                                                                                                                               |                                       |rbac.authorization.k8s.io/v1           |false        |ClusterRole                      |create,delete,deletecollection,get,list,patch,update,watch|			|
|rolebindings                                                                                                                               |                                       |rbac.authorization.k8s.io/v1           |true         |RoleBinding                      |create,delete,deletecollection,get,list,patch,update,watch|			|
|roles                                                                                                                                      |                                       |rbac.authorization.k8s.io/v1           |true         |Role                             |create,delete,deletecollection,get,list,patch,update,watch|			|
|priorityclasses                                                                                                                            |pc                                     |scheduling.k8s.io/v1                   |false        |PriorityClass                    |create,delete,deletecollection,get,list,patch,update,watch|			|
|csidrivers                                                                                                                                 |                                       |storage.k8s.io/v1                      |false        |CSIDriver                        |create,delete,deletecollection,get,list,patch,update,watch|			|
|csinodes                                                                                                                                   |                                       |storage.k8s.io/v1                      |false        |CSINode                          |create,delete,deletecollection,get,list,patch,update,watch|			|
|csistoragecapacities                                                                                                                       |                                       |storage.k8s.io/v1                      |true         |CSIStorageCapacity               |create,delete,deletecollection,get,list,patch,update,watch|			|
|storageclasses                                                                                                                             |sc                                     |storage.k8s.io/v1                      |false        |StorageClass                     |create,delete,deletecollection,get,list,patch,update,watch|			|
|volumeattachments                                                                                                                          |                                       |storage.k8s.io/v1                      |false        |VolumeAttachment                 |create,delete,deletecollection,get,list,patch,update,watch|			|

[API-V1.29](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.29/)

[TDoc](https://docs.qq.com/sheet/DVGJyRGRRYUpMRk9B?tab=BB08J2)


<br/>

## Kubernetes/Docker


## Reference

[K8s Docs](https://kubernetes.io/docs/home/)

[kubernetes-yaml-templates](https://github.com/dennyzhang/kubernetes-yaml-templates) 🔥🔥🔥

[Kubernetes 基础教程](https://lib.jimmysong.io/kubernetes-handbook/) ‼️ 

[为Kubernetes集群部署一个ChatGPT机器人](https://www.bmabk.com/index.php/post/96754.html) 🏢

https://github.com/0voice/k8s_awesome_document

[k8s notes](https://awesome-kubernetes-notes.readthedocs.io/en/latest/index.html)

[最新 2023 年云原生Kubernetes 高级面试题大全](https://blog.csdn.net/qq_46654855/article/details/125612617?ops_request_misc=&request_id=&biz_id=102&utm_term=%E4%BA%91%E5%8E%9F%E7%94%9F%7Ckubernetes%7C2022%E5%B9%B4%E5%BA%95cks%E7%9C%9F%E9%A2%98%E8%A7%A3%E6%9E%90&utm_medium=distribute.pc_search_result.none-task-blog-2~blog~sobaiduweb~default-6-125612617.nonecase&spm=1018.2226.3001.4450)

[huaweicloud-edu](https://edu.huaweicloud.com/)

[Kubetools - A Curated List of Kubernetes Tools](https://collabnix.github.io/kubetools/)

[]()

[]()

[]()









