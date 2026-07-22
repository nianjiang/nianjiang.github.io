---
weight: 10
title: "MLOps"
---

## Moniotor/Logging/K8S

| Name | Doc | Github | Note | Next |
| :--- | :--- | :--- | :--- |:--- |
| [OpenTelemetry](https://opentelemetry.io/) | [Docs](https://opentelemetry.io/docs/) | [Github](https://github.com/open-telemetry) |OpenTelemetry is a collection of APIs, SDKs, and tools for generating, collecting, and exporting telemetry data (traces, metrics, and logs). | [Getting Started with OpenTelemetry](https://www.cncf.io/training/courses/?_sft_lf-project=opentelemetry)      |
| [Prometheus](https://prometheus.io/) | [Docs](https://prometheus.io/docs/introduction/overview/) | [Github](https://github.com/prometheus/prometheus) | Prometheus is a systems and service monitoring system. |      |
| [Thanos](https://thanos.io/) | [Docs](https://thanos.io/tip/thanos/getting-started.md/) | [Github](https://github.com/thanos-io/thanos) | Thanos is a set of components that can be composed into a highly available Prometheus setup. |     |
| [Zabbix](https://www.zabbix.com/cn)  |[Docs](https://www.zabbix.com/documentation/current/en/manual/introduction) |[Github](https://github.com/zabbix/zabbix) | Zabbix is an enterprise-class open-source monitoring solution for tracking the status of various network services, servers, and other network hardware. | 
| [Grafana](https://grafana.com/oss/grafana/) | [Docs](https://grafana.com/docs/grafana/latest/) | [Github](https://github.com/grafana/grafana) | Grafana is an open source, feature rich metrics dashboard and graph editor for Graphite, InfluxDB, Prometheus and other time series databases. |      |
| [Loki](https://grafana.com/oss/loki/) | [Docs](https://grafana.com/docs/loki/latest/) | [Github](https://github.com/grafana/loki) | Loki is a horizontally-scalable, highly-available, multi-tenant log aggregation system inspired by Prometheus. |      |
| [containerd](https://containerd.io/) | [Docs](https://containerd.io/docs/) | [Github](https://github.com/containerd/containerd) | containerd is an industry-standard container runtime with an emphasis on simplicity, robustness, and portability. It manages the complete container lifecycle, including image transfer, storage, container execution, networking, and low-level runtime integration through OCI runtimes such as runc. It is the default container runtime used by Kubernetes (via CRI). |  Need Real Install   |
| [runc](https://opencontainers.org/) | [Docs](https://github.com/opencontainers/runc/blob/main/README.md) | [Github](https://github.com/opencontainers/runc) | runc is a lightweight, portable, OCI-compliant container runtime. It is responsible for creating and running containers by directly interacting with Linux kernel features such as namespaces and cgroups. runc is the default low-level runtime used by containerd and Kubernetes environments. |  Need Real Install |
| []()  |[Docs]() |[Github]() |      |     |
| []()  |[Docs]() |[Github]() |      |     |
| []()  |[Docs]() |[Github]() |      |     |
| []()  |[Docs]() |[Github]() |      |     |
| []()  |[Docs]() |[Github]() |      |     |
| []()  |[Docs]() |[Github]() |      |     |

---

## MLOps

| Name | Doc | Github | Note |
| :--- | :--- | :--- | :--- |
| [mlflow](https://mlflow.org/) | [Doc](https://mlflow.org/docs/latest/) | [Github](https://github.com/mlflow/mlflow) | 侧重模型实验追踪 (Tracking) 和生命周期管理 |
| [MLRun](https://www.mlrun.org/) | [Doc](https://docs.mlrun.org/en/latest/) | [Github](https://github.com/mlrun/mlrun) | 编排式的 MLOps 框架，强于实时数据处理与自动化 |
| [Airflow](https://airflow.apache.org/) | [Doc](https://airflow.apache.org/docs/) | [Github](https://github.com/apache/airflow) | 通用的工作流调度平台，基于 Python DAG |
| [Argo](https://argoproj.github.io/) | [Doc](https://argoproj.github.io/argo-workflows/) | [Github](https://github.com/argoproj/argo-workflows) | 云原生 (K8s) 工作流引擎，适合 CI/CD 和数据流水线 |
| [Kubeflow](https://www.kubeflow.org/) | [Doc](https://www.kubeflow.org/docs/) | [Github](https://github.com/kubeflow/kubeflow) | 基于 K8s 的端到端机器学习平台，生态完整但相对复杂 |
| [Databricks](https://www.databricks.com/) | [Doc](https://docs.databricks.com/) | [Github](https://github.com/databricks) | 统一数据分析平台，由 Spark 创始团队打造，深度集成 MLflow |
| [DVC](https://dvc.org/) | [Doc](https://dvc.org/doc) | [Github](https://github.com/iterative/dvc) | 机器学习版本控制工具，类似“数据界的 Git” |
| [BentoML](https://www.bentoml.com/) | [Doc](https://docs.bentoml.com/) | [Github](https://github.com/bentoml/BentoML) | 专注于模型打包、部署与高性能模型服务的框架 |
| [Ray](https://www.ray.io/) | [Doc](https://docs.ray.io/en/latest/) | [Github](https://github.com/ray-project/ray) | 分布式计算框架，常用于大规模模型训练和在线推理 |


https://mlops.swiss-ai-center.ch/syllabus/

https://mlops.swiss-ai-center.ch/tools/

https://ml-ops.org/content/end-to-end-ml-workflow

https://mlops-guide.github.io/

https://www.systemdesigner.net/ml-systems/ml-fundamentals

https://madewithml.com/

---

## GPU资源调度与性能优化

[Kubernetes 中的 GPU 调度与虚拟化手册](https://jimmysong.io/zh/book/gpu-infra/)

[美团视觉GPU推理服务部署架构优化实践](https://tech.meituan.com/2023/02/09/inference-optimization-on-gpu-by-meituan-vision.html)

[利用 NVIDIA 数据中心监控工具优化 GPU 集群性能](https://developer.nvidia.cn/blog/making-gpu-clusters-more-efficient-with-nvidia-data-center-monitoring/)

[提升AI训练性能：GPU资源优化的12个实战技巧](https://zhuanlan.zhihu.com/p/1902442351688922566)

[Kubernetes GPU资源调度优化：基于vGPU虚拟化技术实现算力利用率倍增](https://datacanvas.csdn.net/694de5965b9f5f31781ae091.html)

[]()

[]()

[]()

[]()

[]()

[]()

[]()


---


---


### Reference

[👍 awesome-mlops](https://github.com/kelvins/awesome-mlops)

[mlops-zoomcamp](https://github.com/DataTalksClub/mlops-zoomcamp/blob/main/README.md)

[graviraja/MLOps-Basics](https://github.com/graviraja/MLOps-Basics)

[GokuMohandas/mlops-course](https://github.com/GokuMohandas/mlops-course)

[ML with Ramin](https://github.com/raminmohammadi/MLOps)

[👍 MLOps_Project](https://github.com/Chandru-21/MLOps_Project)

[MLOps-Recommendation](https://github.com/Harly-1506/MLOps-Recommendation)

[👍 mlops-project](https://github.com/prsdm/mlops-project)

[techiescamp/mlops-for-devops](https://github.com/techiescamp/mlops-for-devops)

[Azure MLOps (v2) Solution Accelerator](https://github.com/Azure/mlops-v2)

[MLOps Application for Real Estate Price Prediction](https://github.com/EzioDEVio/MLOps)

[👍 Made-With-ML](https://github.com/GokuMohandas/Made-With-ML)

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

