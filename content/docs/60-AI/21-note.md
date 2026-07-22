---
weight: 21
title: "Learning Note"
---


## Notes:

[👍 动手学习大模型 (hands-on-llms)](https://github.com/bbruceyuan/Hands-On-Large-Language-Models-CN)

[Nvidia Training-CN](https://www.nvidia.cn/training/)

[Machine Learning Engineering for Production (MLOps)](https://www.bilibili.com/video/BV1pi4y167g5/?spm_id_from=333.337.search-card.all.click&vd_source=8f134d86d2e1e426d0598d5ac4a9a760), [Youtube](https://www.youtube.com/playlist?list=PLkDaE6sCZn6GMoA0wbpJLi3t34Gd8l0aK), [Cousera](https://www.coursera.org/learn/introduction-to-machine-learning-in-production/lecture/uoVS1/welcome)

[AI老兵文哲-大模型科普](https://space.bilibili.com/472543316/lists/3378901?type=season)

[Udmey - ML Ops Fundamentals Course | MLOps Specialization](https://www.bilibili.com/video/BV1tAyaB2Ebc/?spm_id_from=333.337.search-card.all.click&vd_source=8f134d86d2e1e426d0598d5ac4a9a760)

[End-to-End MLOps project with Open Source tools](https://medium.com/@nedwinvivek/end-to-end-mlops-project-with-open-source-tools-78115cc59748)

[2026年李宏毅最新课程：智能体AI（AI Agent）](https://www.bilibili.com/video/BV1QdzCB3Eu2?spm_id_from=333.788.videopod.episodes&vd_source=8f134d86d2e1e426d0598d5ac4a9a760&p=24)

[microsoft/ai-agents-for-beginners](https://github.com/microsoft/ai-agents-for-beginners/tree/main)

[]()

[]()

[]()

[]()

[]()

[]()
--------------------------------------------------------------------------------------------------------------

### 项目

- 企业知识库问答Agent （RAG+权限+引用溯源+后台管理）
- 多工具办公Agent （读邮件/读表格/生成周报/自动归档）

--------------------------------------------------------------------------------------------------------------

### [Free GPU Tools](https://research.aimultiple.com/free-cloud-gpu/)

| Vendor| GPU     | Runtime limit         | Time limit | RAM |
| --------          | --------   | -------    | -------- | --------     |
| [Google Colab](https://colab.research.google.com/drive/1bd52NHDO_KQL0dJbmcQ-YxKWNChYoosN#scrollTo=axKbY7G8E9WB)| NVIDIA T4 / TPU    | 12 hours/session     | –         | 16GB          |
| [ModelScope](https://modelscope.cn/my/mynotebook) | CPU |       |         |           |
| [Kaggle](https://www.kaggle.com/) | NVIDIA TESLA P100 | 9 hours/session      | 30 hours/week | 16GB          |
| [Codesphere]()        | Shared GPU’s | 60 minutes of inactivity | –         | 5GB           |
| [Paperspace Gradient](https://console.paperspace.com/tobpwo1dyb/projects/pnwxeg06gnb/notebooks) | NVIDIA Quadro M4000 | 6 hours/session      | –         | 8GB           |
| [SageMaker Studio Lab](https://aws.amazon.com/cn/sagemaker/ai/?trk=15c62d7e-c4f7-4c0c-a46a-ebb0ed076e02&sc_channel=ps&ef_id=Cj0KCQiA8KTNBhD_ARIsAOvp6DKU0KtOfNUhBE2tlC0Tu5zVOAl3qqx7TXRE3sSK25TwDvihAL5dRBoaAuQqEALw_wcB:G:s&s_kwcid=AL!4422!3!798517281042!e!!g!!aws%20sagemaker%20studio!23606216570!196197897080&gad_campaignid=23606216570&gbraid=0AAAAADjHtp8jTfWw_fQGo9J92mZdxozgV&gclid=Cj0KCQiA8KTNBhD_ARIsAOvp6DKU0KtOfNUhBE2tlC0Tu5zVOAl3qqx7TXRE3sSK25TwDvihAL5dRBoaAuQqEALw_wcB) | NVIDIA T4 Tensor Core | 4 hours/session      | 4 hours in a 24-hour period. | 16GB          |
| [Lightning AI]() | Various    | 4 hours/session      | 80 hours/month | –             |  


--------------------------------------------------------------------------------------------------------------

### AI/Machine Learning Toolkit

| Toolkit| Website     | Doc         | Github | Note |
| --------          | --------   | -------    | -------- | --------     |
| [PyTorch](https://pytorch.org/) | [Website](https://pytorch.org/) | [Doc](https://pytorch.org/docs/) | [Github](https://github.com/pytorch/pytorch) | 主流深度学习框架，以灵活的动态计算图和强大的研究社区著称。 |
| [CUDA](https://en.wikipedia.org/wiki/CUDA) | [Website](https://developer.nvidia.com/cuda/toolkit)  |  [Doc](https://docs.nvidia.com/cuda/)  | [Github](https://github.com/NVIDIA?q=cuda&type=all&language=&sort=stargazers) |     |
| [TensorFlow](https://www.tensorflow.org/?hl=zh-cn) | [Website](https://www.tensorflow.org/)  | [Tutorial](https://www.tensorflow.org/tutorials/quickstart/beginner?hl=zh-cn)   |  [Github](https://github.com/tensorflow) | 主流的深度学习框架，生产部署生态完善，支持大模型训练。|
| [Kubeflow](https://www.cncf.io/projects/kubeflow/) | [website](https://www.kubeflow.org/)  |  [Doc](https://www.kubeflow.org/docs/started/)  | [Github](https://github.com/kubeflow/kubeflow) | 致力于使Kubernetes上的机器学习工作流（流水线、训练、服务）的部署变得简单、可移植和可扩展。|
| [Airflow](https://airflow.apache.org/) | [Website](https://airflow.apache.org/) | [Doc](https://airflow.apache.org/docs/) | [Github](https://github.com/apache/airflow) | 以代码方式定义、调度和监控工作流的平台，是ML工作流编排的事实标准之一。 |
| [Prometheus](https://prometheus.io/) | [Website](https://prometheus.io/) | [Doc](https://prometheus.io/docs/introduction/first_steps/) | [Github](https://github.com/prometheus/prometheus) | 开源系统监控和警报工具包，常用于收集和存储ML系统的性能指标。 |
| [Grafana](https://grafana.com/) | [Website](https://grafana.com/) | [Doc](https://grafana.com/docs/) | [Github](https://github.com/grafana/grafana) | 可视化监控数据的仪表盘工具，常与Prometheus配合使用展示GPU利用率等指标。 |
| []() | [Website]()  |  [Doc]()  | [Github]() |     |
| []() | [Website]()  |  [Doc]()  | [Github]() |     |
| []() | [Website]()  |  [Doc]()  | [Github]() |     |
| []() | [Website]()  |  [Doc]()  | [Github]() |     |
| []() | [Website]()  |  [Doc]()  | [Github]() |     |
| []() | [Website]()  |  [Doc]()  | [Github]() |     |
| []() | []()  |  []()  | []() |     |
| []() | []()  |  []()  | []() |     |
| []() | []()  |  []()  | []() |     |







<!--
| []() | [website]()  |  [Doc]()  | [Github]() |     |
-->

--------------------------------------------------------------------------------------------------------------
### NVIDIA/...

[2024吃透AI大模型（LLM+RAG系统+GPT-4o+OpenAI）](https://www.bilibili.com/video/BV1hQDGYWEMN?spm_id_from=333.788.videopod.episodes&vd_source=8f134d86d2e1e426d0598d5ac4a9a760&p=2)

[IBM-Explainers](https://www.ibm.com/topics?topic=all&page=1)

[Microsoft Certified: Azure AI Fundamentals](https://learn.microsoft.com/zh-cn/credentials/certifications/azure-ai-fundamentals/?practice-assessment-type=certification)

[华为认证人工智能工程师](https://edu.huaweicloud.com/training/aie.html)

[Nvidia Training-CN](https://www.nvidia.cn/training/)

[Nvidia Training](https://www.nvidia.com/en-us/training/)


--------------------------------------------------------------------------------------------------------------

### Map

[初学者怎么入门大语言模型（LLM）？](https://www.zhihu.com/question/644285055/answer/19105760471)

[[LLM教程] 大语言模型：全方位入门](https://zhuanlan.zhihu.com/p/696128856)

[【附教程】大语言模型(LLM)入门学习路线图](https://www.bilibili.com/opus/932698847561383973)

[Andrew Ng - 吴恩达](https://www.andrewng.org/courses/)

[]()

[]()


--------------------------------------------------------------------------------------------------------------

### Trainings

[👍 AI Agent(智能体) 教程](https://www.runoob.com/ai-agent/ai-agent-tutorial.html)

[👍 Microsoft/generative-ai-for-beginners](https://github.com/microsoft/generative-ai-for-beginners/tree/main)

[Fundamental AI Concepts (Azure)](https://learn.microsoft.com/en-us/training/modules/get-started-ai-fundamentals/)

[The Basic Concepts and Terms You Need to Know for AI and ML](https://medium.com/nlplanet/the-basic-concepts-and-terms-you-need-to-know-for-ai-and-ml-28eb07fd6c49)

[Understanding basic principles of artificial intelligence: a practical guide for intensivists](https://pmc.ncbi.nlm.nih.gov/articles/PMC9686179/)

[What is AI? A Quick-Start Guide For Beginners](https://www.datacamp.com/blog/what-is-ai-quick-start-guide-for-beginners)

[Artificial Intelligence 101: The Key Concepts Of AI](https://www.freshconsulting.com/insights/blog/artificial-intelligence-101-the-key-concepts-of-ai/)

[Roadmap to Learn AI in 2024](https://medium.com/bitgrit-data-science-publication/a-roadmap-to-learn-ai-in-2024-cc30c6aa6e16)

[AI-ML-Roadmap-from-scratch](https://github.com/aadi1011/AI-ML-Roadmap-from-scratch)

[]()


--------------------------------------------------------------------------------------------------------------

### 图片
[Stable Diffusion](https://zh.wikipedia.org/wiki/Stable_Diffusion)

[ComfyUI](https://docs.comfy.org/get_started/gettingstarted)

[ollama](https://ollama.com/), [RagFlow](https://demo.ragflow.io/knowledge)

[OpenAI](https://platform.openai.com/docs/overview)

[Llama](https://www.llama.com/), [Github](https://github.com/meta-llama)

[Hugging Face](https://huggingface.co/models)，[ModelScope](https://modelscope.cn/home)

[]()


--------------------------------------------------------------------------------------------------------------


### Reference

[MLOps Roadmap](https://roadmap.sh/mlops)， [MLOps Roadmap](https://algomaster.io/roadmaps/mlops)

[CNAI](https://landscape.cncf.io/?group=cnai&view-mode=card&classify=category&sort-by=name&sort-direction=asc#cnai--agentic-ai)

[快速入门AI领域的思维导图（深度学习自学入门）](https://pic2.zhimg.com/80/v2-1c5ee0b6a8e35b514ca8e834d8cd4905_1440w.webp)

[CNAI](https://landscape.cncf.io/?group=cnai&view-mode=card&classify=category&sort-by=name&sort-direction=asc#cnai--automl)

[Cloud Native AI](https://jimmysong.io/en/blog/cloud-native-ai-whitepaper/)

[Cloud Native AI Day Europe 2024](https://www.youtube.com/playlist?list=PLj6h78yzYM2PWGv34W6w5ssq1b1meRmY7)

[大模型基础知识入门](https://dataelem.feishu.cn/wiki/HMcKwjfA3iJEEXk5c3ucViqunif)

[👍 机器学习 - 菜鸟](https://www.runoob.com/ml/ml-how-to-learn.html)

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

[]()

[]()

[]()