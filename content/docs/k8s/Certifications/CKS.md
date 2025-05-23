---
weight: 51
title: "CKS"
---

# CKS (Certified Kubernetes Security Specialist)

## CKS Courses

[How to Pass CKS (Certified Kubernetes Security Specialist) Exam](https://medium.com/@nvsajeeva/how-to-pass-cks-certified-kubernetes-security-specialist-exam-56fe04f42094)

[]()

[Kubernetes认证安全专家（CKS）课程简介及考试介绍](https://www.bilibili.com/video/BV1o94y137Bu/?spm_id_from=333.337.search-card.all.click&vd_source=8f134d86d2e1e426d0598d5ac4a9a760)

[LFOSSA源来如此公开课 | 构筑云原生安全防线：CKS认证实战指南](https://www.bilibili.com/video/BV1Rs421T7AC/?spm_id_from=333.337.search-card.all.click&vd_source=8f134d86d2e1e426d0598d5ac4a9a760)

[CKS Study Guide 2024 - PASS your Certified Kubernetes Security Specialist Exam](https://www.youtube.com/watch?v=_l232KiJHNA)

[Github](https://github.com/teckbootcamps/CKS-Certified-Kubernetes-Security-Specialist)

[Kubernetes CKS Full Course Theory + Practice + Browser Scenarios](https://www.youtube.com/watch?v=d9xfB5qaOfg&t=67s), [Test](https://github.com/killer-sh/cks-course-environment/blob/master/Scenarios.md)

[CKS教程 2024](https://search.bilibili.com/all?keyword=CKS%E6%95%99%E7%A8%8B+2024&from_source=webtop_search&spm_id_from=333.788&search_source=2)

[CKS Exam 2024: Major Updates & What You Need to Know](https://www.youtube.com/watch?v=3YWLuidA2JI)

[Youtube](https://www.youtube.com/results?search_query=cks)

[kodekloudhub](https://github.com/kodekloudhub/certified-kubernetes-security-specialist-cks-course)

[]()

[]()

[]()


## 2024真题

[]()

[CKS-2024 12月](https://blog.csdn.net/weixin_50902636/category_12852360.html)

[CKS-2024 10月题库](https://blog.csdn.net/agjllxchjy/article/details/143716906)

[CKS-2024 10月](https://www.j0nathan1ei.xyz/p/cks-%E8%80%83%E8%AF%95%E8%AE%B0%E5%BD%95/)

[CKS-2024 04月题库](https://zhuanlan.zhihu.com/p/694930399)

[]()

[]()

[]()

## CKS真题讲解

[CKS 备考](https://www.bilibili.com/video/BV1WM4y1k75Q?spm_id_from=333.788.videopod.sections&vd_source=8f134d86d2e1e426d0598d5ac4a9a760)

[CKS 16道试题专家详解](https://space.bilibili.com/3494356700891514/upload/video)

## CKS Simulator

[Killer Shell CKS](https://killercoda.com/killer-shell-cks)

[CKS-2](https://killercoda.com/ronnyardi)

[Mocker](https://github.com/ViktorUJ/cks/tree/master)

## CKS Goal

[Kubernetes](https://kubernetes.io/docs/concepts/security/)

[CNCF](https://www.cncf.io/training/certification/cks/)

[English](https://training.linuxfoundation.org/certification/certified-kubernetes-security-specialist/#)

[Chinese](https://training.linuxfoundation.cn/certificates/16)

[CNCF Project Desc](https://www.cncf.io/projects/kubernetes/)

[Github](https://github.com/kubernetes/kubernetes)

https://devopscube.com/cks-exam-guide-tips/

## Exam Objects

  - [X] [Cluster Setup - 15%](/docs/k8s/Certifications/CKS/#cluster-setup---15)
  - [X] [Cluster Hardening - 15%](/docs/k8s/Certifications/CKS/#cluster-hardening---15)
  - [X] [System Hardening - 10%](/docs/k8s/Certifications/CKS/#system-hardening---10)
  - [X] [Minimize Microservice Vulnerabilities - 20%](/docs/k8s/Certifications/CKS/#minimize-microservice-vulnerabilities---20)
  - [X] [Supply Chain Security - 20%](/docs/k8s/Certifications/CKS/#supply-chain-security---20)
  - [X] [Monitoring, Logging and Runtime Security - 20%](/docs/k8s/Certifications/CKS/#monitoring-logging-and-runtime-security---20)


---

### 🌈 Cluster Setup - 15%
[Securing a Cluster](https://kubernetes.io/docs/tasks/administer-cluster/securing-a-cluster/)

1. [Use Network security policies to restrict cluster level access](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
2. [Use CIS benchmark to review the security configuration of Kubernetes components](https://www.cisecurity.org/benchmark/kubernetes/)  (etcd, kubelet, kubedns, kubeapi)
    - [Kube-bench](https://github.com/aquasecurity/kube-bench) - Checks whether Kubernetes is deployed securely by running the checks documented ain the CIS Kubernetes Benchmark.
3. Properly set up [Ingress objects with security control](https://kubernetes.io/docs/concepts/services-networking/ingress/#tls)
4. [Protect node metadata and endpoints](https://kubernetes.io/docs/tasks/administer-cluster/securing-a-cluster/#restricting-cloud-metadata-api-access)

    <details><summary> Using Kubernetes network policy to restrict pods access to cloud metadata </summary>

      * This example assumes AWS cloud, and metadata IP address is 169.254.169.254 should be blocked while all other external addresses are not.

      ```yaml
      apiVersion: networking.k8s.io/v1
      kind: NetworkPolicy
      metadata:
        name: deny-only-cloud-metadata-access
      spec:
        podSelector: {}
        policyTypes:
        - Egress
        egress:
        - to:
          - ipBlock:
            cidr: 0.0.0.0/0
            except:
            - 169.254.169.254/32
      ```
    </details>

5. [Verify platform binaries before deploying](https://github.com/kubernetes/kubernetes/releases)

     <details><summary>  Kubernetes binaries can be verified by their digest **sha512 hash**  </summary>

     - Checking the Kubernetes release page for the specific release
     - Checking the change log for the [images and their digests](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.19.md#downloads-for-v1191)

     </details>

    ** [Minimize use of, and access to, GUI elements](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/#accessing-the-dashboard-ui) **

### 🌈 Cluster Hardening - 15%

1. [Restrict access to Kubernetes API](https://kubernetes.io/docs/reference/access-authn-authz/controlling-access/)
  - [Control anonymous requests to Kube-apiserver](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#anonymous-requests)
  - [Non secure access to the kube-apiserver](https://kubernetes.io/docs/concepts/security/controlling-access/#api-server-ports-and-ips)
2. [Use Role-Based Access Controls to minimize exposure](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
    * [Handy site collects together articles, tools and the official documentation all in one place](https://rbac.dev/)
    * [Simplify Kubernetes Resource Access Control using RBAC Impersonation](https://docs.bitnami.com/tutorials/simplify-kubernetes-resource-access-rbac-impersonation/)
3. Exercise caution in using service accounts e.g. [disable defaults](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#use-the-default-service-account-to-access-the-api-server), minimize permissions on newly created ones

   <details><summary> Opt out of automounting API credentials for a service account </summary>

   #### Opt out at service account scope
   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: build-robot
   automountServiceAccountToken: false
   ```
   #### Opt out at pod scope
   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: cks-pod
   spec:
     serviceAccountName: default
     automountServiceAccountToken: false
   ```

   </details>


4. [Update Kubernetes frequently](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-upgrade/)

### 🌈 System Hardening - 10%

1. Minimize host OS footprint (reduce attack surface)

   <details><summary> Reduce host attack surface </summary>

   * [seccomp which stands for secure computing was originally intended as a means of safely running untrusted compute-bound programs](https://kubernetes.io/docs/tutorials/clusters/seccomp/)
   * [AppArmor can be configured for any application to reduce its potential host attack surface and provide greater in-depth defense.](https://kubernetes.io/docs/tutorials/clusters/apparmor/)
   * [PSA enforces](https://kubernetes.io/docs/concepts/security/pod-security-admission/)
   * Apply host updates
   * Install minimal required OS fingerprint
   * Identify and address open ports
   * Remove unnecessary packages
   * Protect access to data with permissions
     *  [Restirct allowed hostpaths](https://kubernetes.io/docs/concepts/policy/pod-security-policy/#volumes-and-file-systems)

   </details>

2. Using least-privilege identity and access management
   * [Access authentication and authorization](https://kubernetes.io/docs/reference/access-authn-authz/authentication/)
3. Minimize external access to the network

   <details><summary> if it means deny external traffic to outside the cluster?!! </summary>

   * not tested, however, the thinking is that all pods can talk to all pods in all name spaces but not to the outside of the cluster!!!

   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: deny-external-egress
   spec:
     podSelector: {}
     policyTypes:
     - Egress
     egress:
       to:
       - namespaceSelector: {}
     ```

    </details>

4. Appropriately use kernel hardening tools such as AppArmor, seccomp
   * [AppArmor](https://wiki.apparmor.net/)， [Turorial](https://kubernetes.io/docs/tutorials/clusters/apparmor/)
   * [Seccomp](https://en.wikipedia.org/wiki/Seccomp)， [Turorial](https://kubernetes.io/docs/tutorials/clusters/seccomp/)

### 🌈 Minimize Microservice Vulnerabilities - 20%

1. Use appropriate pod security standards
   - [Pod Security Policies](https://kubernetes.io/docs/concepts/policy/pod-security-policy/)
   - [Open Policy Agent](https://kubernetes.io/blog/2019/08/06/opa-gatekeeper-policy-and-governance-for-kubernetes/)
   - [Security Contexts](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)
2. [Manage kubernetes secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
3. Understand and implement isolation techniques (multi-tenancy, sandbox containers, etc)
   - Use [container runtime](https://kubernetes.io/docs/concepts/containers/runtime-class/) sandboxes in multi-tenant environments (e.g. [gvisor, kata containers](https://github.com/kubernetes/enhancements/blob/5dcf841b85f49aa8290529f1957ab8bc33f8b855/keps/sig-node/585-runtime-class/README.md#examples))
4. Implement pod to pod encryption using Cilium
   - [Implement pod to pod encryption by use of mTLS](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/)
   - [ ] check if service mesh is part of the CKS exam

### 🌈 Supply Chain Security - 20%

1. Minimize base image footprint

   <details><summary> Minimize base Image </summary>

   * Use distroless, UBI minimal, Alpine, or relavent to your app nodejs, python but the minimal build.
   * Do not include uncessary software not required for container during runtime e.g build tools and utilities, troubleshooting and debug binaries.
     * [Learnk8s: 3 simple tricks for smaller Docker images](https://learnk8s.io/blog/smaller-docker-images)
      * [GKE 7 best practices for building containers](https://cloud.google.com/blog/products/gcp/7-best-practices-for-building-containers)

   </details>

2. Understand your supply chain (e.g. SBOM, CI/CD, artifact repositories)

   [syft](https://github.com/anchore/syft)

3. Secure your supply chain: [whitelist allowed image registries](https://kubernetes.io/blog/2019/03/21/a-guide-to-kubernetes-admission-controllers/#why-do-i-need-admission-controllers), sign and validate images
  * Using [ImagePolicyWebhook admission Controller](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#imagepolicywebhook)

4. Preform static analysis of user workloads and container images (e.g. [kubesec](https://github.com/controlplaneio/kubesec), [kubelinter](https://docs.kubelinter.io/))


  <details><summary>  Old </summary>

  * [kubernetes resources](https://kubernetes.io/blog/2018/07/18/11-ways-not-to-get-hacked/#7-statically-analyse-yaml), docker files)
  * [Scan images for known vulnerabilities](https://kubernetes.io/blog/2018/07/18/11-ways-not-to-get-hacked/#10-scan-images-and-run-ids)
  * [Aqua security Trivy]( https://github.com/aquasecurity/trivy)
  * [Anchore command line scans](https://github.com/anchore/anchore-cli#command-line-examples)

  </details>

### 🌈 Monitoring, Logging and Runtime Security - 20%

1. Perform behavioural analytics to detect malicious activities: [Falco](https://github.com/falcosecurity/falco)
	- [Falco installation guide](https://falco.org/docs/)
	- [Sysdig Falco 101](https://learn.sysdig.com/falco-101)
	- [Falco Helm Chart](https://github.com/falcosecurity/charts/tree/master/falco)
	- [Falco Kubernetes helmchart](https://github.com/falcosecurity/charts)
	- [Detect CVE-2020-8557 using Falco](https://falco.org/blog/detect-cve-2020-8557/)
2. Detect threats within a physical infrastructure, apps, networks, data, users and workloads
3. Investigate and identify of attach and bad actors within the environment

   <details><summary>  Attack Phases </summary>

     - [Kubernetes attack martix Microsoft blog](https://www.microsoft.com/security/blog/2020/04/02/attack-matrix-kubernetes/)
     - [MITRE attack framwork using Falco](https://sysdig.com/blog/mitre-attck-framework-for-container-runtime-security-with-sysdig-falco/)
     - [Lightboard video: Kubernetes attack matrix - 3 steps to mitigating the MITRE ATT&CK Techniques]()
     - [CNCF Webinar: Mitigating Kubernetes attacks](https://www.cncf.io/webinars/mitigating-kubernetes-attacks/)

   </details>

   - [Sysdig Github](https://github.com/draios)
   - [Monitoring Kubernetes with sysdig](https://kubernetes.io/blog/2015/11/monitoring-kubernetes-with-sysdig/)
   - [CNCF Webinar: Getting started with container runtime security using Falco](https://youtu.be/VEFaGjfjfyc)

4. [Ensure immutability of containers at runtime](https://kubernetes.io/blog/2018/03/principles-of-container-app-design/)
5. [Use k8s Audit Logs to monitor access](https://kubernetes.io/docs/tasks/debug-application-cluster/audit/)


## Mock Exams

https://killercoda.com/killer-shell-cks

https://github.com/moabukar/CKS-Exercises-Certified-Kubernetes-Security-Specialist

[CKS真题分析-2023年度](https://blog.csdn.net/weixin_45651006/article/details/134135587?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522170115845816800186569672%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fblog.%2522%257D&request_id=170115845816800186569672&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~blog~first_rank_ecpm_v1~rank_v31_ecpm-3-134135587-null-null.nonecase&utm_term=%E4%BA%91%E5%8E%9F%E7%94%9F%7Ckubernetes%7C2022%E5%B9%B4%E5%BA%95cks%E7%9C%9F%E9%A2%98%E8%A7%A3%E6%9E%90&spm=1018.2226.3001.4450)

[云原生|kubernetes|2022年底cks真题解析（1-10）](https://blog.csdn.net/alwaysbefine/article/details/128689488)

[云原生|kubernetes|2022年底cks真题解析（11-16](https://blog.csdn.net/alwaysbefine/article/details/128717226)

[CKS 题库](https://www.hao.kim/cks/page/2)

https://www.cnblogs.com/huss2016/p/17055905.html

http://www.dtcms.com/a/696.html

[]()

[]()

### Reference

[CNCF Certifications](https://www.cncf.io/training/certification/)

[CNCF Training & Certification](https://www.cncf.io/training/)

[Linux Training](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/)

[Linux Training (China)](https://training.linuxfoundation.cn/)

https://github.com/vedmichv/CKS-Certified-Kubernetes-Security-Specialist

[CNCF Landscape for Security](https://landscape.cncf.io/guide#provisioning--security-compliance)

[CKS-Certified-Kubernetes-Security-Specialist](https://github.com/teckbootcamps/CKS-Certified-Kubernetes-Security-Specialist)

[ViktorUJ/cks](https://github.com/ViktorUJ/cks)

[Github topic: kubernetes-security](https://github.com/topics/kubernetes-security)

[CKS-Certified-Kubernetes-Security-Specialist](https://github.com/teckbootcamps/CKS-Certified-Kubernetes-Security-Specialist)

[cks-short-tips](https://github.com/schnatterer/cks-short-tips)

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()

[]()
