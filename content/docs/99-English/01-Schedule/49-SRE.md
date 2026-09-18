---
weight: 49
title: "SRE"
---

## Week 1 — SRE Foundations: Reliability Measurement and Alerting

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 01 | What are SLIs, SLOs, and error budgets? | [SLO vs SLI vs SLA vs Error Budget \| Google SRE in Plain English][v01] — listen for the definitions | [SRE Fundamentals: Differences Between SLI vs. SLO vs. SLA][a01] — core concepts | Define each term in one sentence using "measures," "targets," and "tolerates." |
|  | 02 | How do you measure what matters? | [Understanding SLIs, SLOs, SLAs & Error Budgets][v02] — follow the measurement framework | [SLOs: Stop Thinking in Burn Rates][a02] — how to track reliability | Explain burn rate in three sentences using "error budget" and "window." |
|  | 03 | What makes a good alert vs. noise? | [Why Alert Fatigue is a Major Challenge in Observability][v03] — focus on the survey findings | [How AI Can Help IT Teams Find the Signals in Alert Noise][a03] — reducing noise | Write five rules for actionable alerts using "must" and "in order to." |
|  | 04 | How does toil erode operational reliability? | [Reducing Toil \| Site Reliability Engineering (SRE) Foundation][v04] — follow the toil characteristics | [5 Non-AI Reasons Why You Still Have Toil][a04] — why toil persists | Describe two examples of toil using "repetitive," "automatable," and "no long-term value." |
|  | 05 | What is the relationship between SRE and DevOps? | [SRE vs DevOps vs Platform Engineering — The Honest Difference][v05] — follow the role boundaries | [5 Ways to Build out an SRE Function and Why It Matters][a05] — building an SRE team | Compare SRE and DevOps using "whereas" and "on the other hand." |
|  | 06 | Review: define reliability targets for a service | [Introduction to Site Reliability Engineering][v06] — replay without captions | [What's the Difference Between Observability and Monitoring?][a06] — verify your understanding | Give a two-minute explanation of SRE foundations; compare with Day 01. |

## Week 2 — Incident Response, Postmortem, and Chaos Engineering

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 07 | How should an incident be detected and triaged? | [Navigating SRE/Incident Management][v07] — follow the triage workflow | [How We Manage Incident Response at Honeycomb][a07] — real-world process | Describe the triage steps in four ordered sentences using "detect," "classify," and "escalate." |
|  | 08 | What happens during an incident war room? | [Automated Cloud-Native Incident Response with Kubernetes and Service Mesh][v08] — watch how the bridge is structured | [Tips to Make Your On-Call Process Less Stressful][a08] — war room roles and communication | Write five rules for an effective war room using "must," "in order to," and "without delay." |
|  | 09 | How do you write a blameless postmortem? | [Postmortem Culture at Google \| Ramon Medrano Llamas][v09] — focus on the blameless principles | [Top 12 Best Practices for Better Incident Management Postmortems][a09] — postmortem checklist | Summarize a postmortem structure in five sentences using "timeline," "root cause," and "action item." |
|  | 10 | What is chaos engineering and why practice failure? | [Deep Dive into Chaos Mesh][v10] — follow the chaos experiment lifecycle | [There Is No Resilience without Chaos][a10] — chaos engineering philosophy | Explain chaos engineering in three sentences using "hypothesis," "blast radius," and "steady state." |
|  | 11 | How do you build resilience with redundancy and fallbacks? | [Kubernetes Workload Resiliency in Action: Beyond Basics][v11] — focus on the resiliency patterns | [Chaos Engineering on CI/CD Pipelines][a11] — testing resilience in pipelines | Describe two resilience patterns using "circuit breaker," "retry," and "fail gracefully." |
|  | 12 | Review: run a tabletop incident exercise | [Games We Play to Improve on Incident Response \| Conf42 SRE 2021][v12] — replay the exercise formats | [Bringing Principles into the World of Incident Management][a12] — verify your exercise design | Give a two-minute walkthrough of a tabletop exercise; compare with Day 07. |

## Week 3 — Autoscaling, Performance, and Capacity Planning

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 13 | How does horizontal pod autoscaling work? | [Horizontal Pod Autoscaling \| Kubernetes][v13] — follow the HPA scaling loop | [Getting Started with Kubernetes Autoscaling][a13] — HPA fundamentals | Explain how HPA decides when to scale in four sentences using "threshold," "metrics," and "replicas." |
|  | 14 | What is the difference between HPA, VPA, and KEDA? | [HPA vs. VPA vs. Keda vs. CA vs. Karpenter vs. Fargate][v14] — follow the comparison matrix | [K8s Resource Management: An Autoscaling Cheat Sheet][a14] — compare all autoscalers | Compare HPA and VPA using "whereas" twice; then explain when KEDA is preferable in three sentences. |
|  | 15 | How do resource requests and limits affect scheduling? | [All You Need to Know in 12 Minutes: Pods' Requests and Limits in Kubernetes][v15] — follow the scheduling impact | [How Kubernetes Requests and Limits Really Work][a15] — scheduling deep dive | Describe how the scheduler uses requests in four ordered sentences using "allocatable," "fits," and "binds." |
|  | 16 | How do you profile and tune application performance? | [Diagnosing Application Performance With EBPF, Pyroscope, and Kubernetes][v16] — watch the profiling workflow | [Beyond Basic Scaling: Advanced Kubernetes Resource Strategies][a16] — advanced tuning | Write five sentences about continuous profiling using "flame graph," "hot path," and "in order to." |
|  | 17 | How do you plan capacity for a growing cluster? | [Tutorial: Kubernetes Smart Scaling: Getting Started with Karpenter][v17] — follow the node provisioning model | [Getting the Most from Kubernetes Autoscaling][a17] — capacity planning tips | Explain how Karpenter differs from Cluster Autoscaler using "provisioning," "node pool," and "whereas." |
|  | 18 | Review: design an autoscaling strategy for a web service | [Kubernetes pod autoscaling for beginners][v18] — replay without captions | [Kubernetes Autoscaling: Q&A With Fairwinds CTO Andy Suderman][a18] — verify your strategy | Give a two-minute explanation of an autoscaling strategy; compare with Day 13. |

## Week 4 — Progressive Delivery and Platform Engineering

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 19 | What is canary deployment and how does it reduce risk? | [Progressive Delivery Made Easy With Argo Rollouts][v19] — follow the canary workflow | [Progressive Delivery on OpenShift][a19] — canary and blue-green patterns | Explain canary deployment in four sentences using "traffic shifting," "rollback," and "risk." |
|  | 20 | How does Argo Rollouts automate progressive delivery? | [30 Days Of CNCF Projects \| Day 9: What is Argo Rollouts + Demo][v20] — follow the demo steps | [More Problems with GitOps — and How to Fix Them][a20] — Argo Rollouts in GitOps | Describe how Argo Rollouts integrates with analysis templates using five sentences and "in order to." |
|  | 21 | What is feature flagging and how does it decouple deploy from release? | [Canary Deployments Are a Myth — True Progressive Delivery Occurs Via OpenFeature][v21] — follow the OpenFeature model | [Feature Flags: Making Software Delivery Faster][a21] — feature flag fundamentals | Write five sentences about decoupling deploy from release using "feature flag," "subset," and "however." |
|  | 22 | What is an internal developer platform and who builds it? | [Creating Paved Paths for Platform Engineers — Panel][v22] — focus on the platform team roles | [How Platform Engineering Enables the 10000-Dev Workforce][a22] — platform at scale | Explain what a paved path is in three sentences using "self-service," "golden path," and "in order to." |
|  | 23 | How do you manage multi-cluster and multi-cloud reliability? | [Seamless Multi-Cloud Kubernetes: A Practical Guide][v23] — follow the multi-cluster architecture | [How Do the Internal Developer Platform and Portal Connect?][a23] — platform consistency | Compare single-cluster and multi-cluster reliability using "whereas" and "on the other hand." |
|  | 24 | Review: design a progressive delivery pipeline | [ArgoCon \| Argo Rollouts Update — Alexander Gaudreault][v24] — replay without captions | [7 Major Gaps in Today's GitOps Tools][a24] — verify your pipeline design | Give a two-minute explanation of a progressive delivery pipeline; compare with Day 19. |

## Week 5 — SRE at Scale: Cost, Culture, and Continuous Improvement

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 25 | How do you allocate cloud costs to teams (FinOps)? | [FinOps Summit: Cost Visibility and Optimization in Kubernetes][v25] — follow the cost allocation model | [FinOps: How Kubernetes Teams Can Best Work with Finance][a25] — FinOps fundamentals | Explain how FinOps allocates costs in four sentences using "attribution," "showback," and "in order to." |
|  | 26 | What is an SRE culture and how does it differ from traditional ops? | [How Google SRE and Developers Work Together \| GOTO 2021][v26] — follow the collaboration model | [SRE vs. DevOps? Successful Platform Engineering Needs Both][a26] — culture comparison | Compare SRE culture with traditional ops using "whereas," "blameless," and "error budget." |
|  | 27 | How do you conduct a production readiness review? | [Keynote: Beyond Operations: Scaling Platform Engineering in the CNCF Community][v27] — follow the platform maturity model | [Kubernetes Isn't Enough for a Production-Ready Platform][a27] — production readiness checklist | Write five sentences about production readiness using "observability," "SLI," and "in order to." |
|  | 28 | What are the key metrics for platform team health? | [Starting and Scaling a Platform Engineering Team][v28] — follow the team growth stages | [Limitations in Measuring Platform Engineering with DORA Metrics][a28] — metrics beyond DORA | Describe three platform health metrics using "adoption," "developer satisfaction," and "whereas." |
|  | 29 | How do you build a reliability-focused engineering culture? | [Cloud Native SRE Practices in Financial Services][v29] — follow the real-world SRE adoption | [What Platform Engineering Meant for Adidas's SREs][a29] — SRE transformation story | Write 100 words about building reliability culture using "blameless," "error budget," and "continuous improvement." |
|  | 30 | Final presentation: your SRE toolkit for cloud native | [Jonathan Bryce, The Linux Foundation][v30] — replay the cloud native vision | [The Evolution of the Site Reliability Engineer][a30] — revisit the SRE journey | Give a three-minute presentation connecting Weeks 1–5; compare your clarity with Day 01. |

## Weekly Self-Check

After each sixth study day, record:

- **Listening:** Can I identify the main point and three supporting details without captions?
- **Vocabulary:** Can I use five useful phrases from this week in new sentences?
- **Speaking:** Can I explain the topic for two minutes using only a few keywords?
- **Writing:** Can I produce a short summary with a main point, an example, and a limitation?
- **Next step:** Which one difficulty should I focus on next week? Repeat a difficult week if needed; finishing on schedule is not a language-proficiency test.

[v01]: https://www.youtube.com/watch?v=Akri1BlGp10
[v02]: https://www.youtube.com/watch?v=nsqHxEbNVcY
[v03]: https://www.youtube.com/watch?v=be2OeAE4uI4
[v04]: https://www.youtube.com/watch?v=IPVesiiRcyc
[v05]: https://www.youtube.com/watch?v=WCpywy_bzt4
[v06]: https://www.youtube.com/watch?v=OnX45XBbc4I
[v07]: https://www.youtube.com/watch?v=RcHb1TkmPBk
[v08]: https://www.youtube.com/watch?v=vor-xiV25xM
[v09]: https://www.youtube.com/watch?v=qgHWzQ2zcqQ
[v10]: https://www.youtube.com/watch?v=bZnI5omUKe4
[v11]: https://www.youtube.com/watch?v=LlR_WCn2jFQ
[v12]: https://www.youtube.com/watch?v=Q1AGdtD-Ox0
[v13]: https://www.youtube.com/watch?v=VHGFbM-zWDE
[v14]: https://www.youtube.com/watch?v=hsJ2qtwoWZw
[v15]: https://www.youtube.com/watch?v=lKH1K5R3kqg
[v16]: https://www.youtube.com/watch?v=RrlF7OzCojE
[v17]: https://www.youtube.com/watch?v=3v7Srpx1HVc
[v18]: https://www.youtube.com/watch?v=FfDI08sgrYY
[v19]: https://www.youtube.com/watch?v=C34TJFDsq-s
[v20]: https://www.youtube.com/watch?v=eAF1UsOqXYI
[v21]: https://www.youtube.com/watch?v=8P1_VIErKYk
[v22]: https://www.youtube.com/watch?v=1SFpBk6mQUw
[v23]: https://www.youtube.com/watch?v=D0KfsaqLc48
[v24]: https://www.youtube.com/watch?v=vZ6hcrP_Wzc
[v25]: https://www.youtube.com/watch?v=JhJF5AvtshM
[v26]: https://www.youtube.com/watch?v=DOQqOrHs3VY
[v27]: https://www.youtube.com/watch?v=gmAfYEPBYr0
[v28]: https://www.youtube.com/watch?v=9lPp-6nJ8bI
[v29]: https://www.youtube.com/watch?v=pgmQ8YqyjUQ
[v30]: https://www.youtube.com/watch?v=b1tZDBoWgQc
[a01]: https://thenewstack.io/sre-fundamentals-differences-between-sli-vs-slo-vs-sla/
[a02]: https://thenewstack.io/service-level-objectives-stop-thinking-in-burn-rates/
[a03]: https://thenewstack.io/how-ai-can-help-it-teams-find-the-signals-in-alert-noise/
[a04]: https://thenewstack.io/5-non-ai-reasons-why-you-still-have-toil/
[a05]: https://thenewstack.io/5-ways-to-build-out-an-sre-function-and-why-it-matters/
[a06]: https://thenewstack.io/whats-the-difference-between-observability-and-monitoring/
[a07]: https://thenewstack.io/how-we-manage-incident-response-at-honeycomb/
[a08]: https://thenewstack.io/tips-to-make-your-on-call-process-less-stressful/
[a09]: https://thenewstack.io/top-12-best-practices-for-better-incident-management-postmortems/
[a10]: https://thenewstack.io/there-is-no-resilience-without-chaos/
[a11]: https://thenewstack.io/chaos-engineering-on-ci-cd-pipelines/
[a12]: https://thenewstack.io/bringing-principles-into-the-world-of-incident-management/
[a13]: https://thenewstack.io/getting-started-with-kubernetes-autoscaling/
[a14]: https://thenewstack.io/k8s-resource-management-an-autoscaling-cheat-sheet/
[a15]: https://thenewstack.io/how-kubernetes-requests-and-limits-really-work/
[a16]: https://thenewstack.io/beyond-basic-scaling-advanced-kubernetes-resource-strategies/
[a17]: https://thenewstack.io/getting-the-most-from-kubernetes-autoscaling/
[a18]: https://thenewstack.io/kubernetes-autoscaling-q-a-with-fairwinds-cto-andy-suderman/
[a19]: https://thenewstack.io/progressive-delivery-on-openshift/
[a20]: https://thenewstack.io/more-problems-with-gitops-and-how-to-fix-them/
[a21]: https://thenewstack.io/feature-flags-making-software-delivery-faster/
[a22]: https://thenewstack.io/how-platform-engineering-enables-the-10000-dev-workforce/
[a23]: https://thenewstack.io/how-do-the-internal-developer-platform-and-portal-connect/
[a24]: https://thenewstack.io/7-major-gaps-in-todays-gitops-tools/
[a25]: https://thenewstack.io/finops-how-kubernetes-teams-can-best-work-with-finance/
[a26]: https://thenewstack.io/sre-vs-devops-successful-platform-engineering-needs-both/
[a27]: https://thenewstack.io/kubernetes-isnt-enough-for-a-production-ready-platform/
[a28]: https://thenewstack.io/limitations-in-measuring-platform-engineering-with-dora-metrics/
[a29]: https://thenewstack.io/what-platform-engineering-meant-for-adidass-sres/
[a30]: https://thenewstack.io/the-evolution-of-the-site-reliability-engineer-sre/

## Reference
