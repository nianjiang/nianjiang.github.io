---
weight: 2
title: "First"
---

# From Kubernetes/SRE to AI SRE and MLOps

## Goal and Starting Point

Build on existing Kubernetes and SRE knowledge to move toward **AI infrastructure / inference SRE**, while developing a practical **Machine Learning Operations (MLOps)** foundation.

The recommended progression is:

**Kubernetes/SRE → ML lifecycle fundamentals → AI serving and reliability → deeper MLOps specialization.**

- **Technical baseline:** Existing Kubernetes and SRE knowledge. Python and hands-on ML proficiency still need to be assessed.
- **English baseline:** Self-reported B2. Practice explaining engineering decisions, investigating incidents, and discussing trade-offs in English.
- **Planning estimate:** A 16-week first iteration at approximately 10–12 hours per week, assuming basic programming ability. Add preparation time if Python is unfamiliar.
- **Progress rule:** Advance when the practical completion criteria are met, not simply when a week ends. This schedule is not a guarantee of job readiness.
- **Learning model:** Use the existing English-learning plans as supporting resources, not as substitutes for implementation, testing, and troubleshooting.

## 1. Choose a Primary Direction

Role titles vary across companies. Evaluate job descriptions by their responsibilities rather than by the title alone.

| Direction | Main Responsibility | Skills to Add |
| :--- | :--- | :--- |
| **AI SRE / inference infrastructure — recommended starting point** | Keep AI services available, fast, scalable, and cost-effective. | GPU operations, model serving, inference performance, capacity planning, and AI-specific monitoring. |
| **MLOps / ML platform engineering** | Make the model lifecycle reproducible and safely automated. | Python, data validation, training pipelines, experiment tracking, model evaluation, and promotion. |
| **AIOps — a different emphasis** | Use AI to improve IT operations. | AI-assisted incident analysis, alert investigation, and operational automation. |

The initial goal is not to become an algorithm researcher. Learn enough ML to understand why a healthy service can still produce bad predictions, and how to investigate that situation with ML practitioners.

## 2. How to Use the Four Existing Plans

Do not complete all four documents sequentially as prerequisites. Select their material to support the engineering topic being practiced that week.

| Existing Plan | Role in This Roadmap | Priority |
| :--- | :--- | :--- |
| [05-AI Topics.md](./05-AI%20Topics.md) | AI concepts and English communication. | Prioritize Weeks 1–4, then Weeks 5–6 and 10–12: foundations, inference, LLMs, hallucinations, RAG, governance, evaluation, and model selection. Defer Weeks 7–9 unless the target role requires agents, coding assistants, or productivity automation. |
| [20-MLOps.md](./20-MLOps.md) | The technical learning backbone. | Use all four weeks and attach practical exercises. The 24 study days introduce concepts; they do not establish production competence. |
| [49-SRE.md](./49-SRE.md) | Transfer existing operational skills into AI scenarios. | Reuse SLOs, incident response, scaling, progressive delivery, and cost management. Review familiar fundamentals only where needed. |
| [51-CNCF.md](./51-CNCF.md) | Reference material and English interview practice. | Skim familiar Kubernetes basics. Revisit observability, delivery, security, and other specific gaps when projects expose them. |

For example, replace a general exercise such as “Explain HPA” with “Explain why CPU-based autoscaling may be insufficient for an LLM inference service.”

The week numbers in the source documents are resource labels. They do not need to match the roadmap's calendar weeks.

## 3. The 16-Week Roadmap

Before starting, check whether you can write and test a small Python program, manage its dependencies, process tabular data, and expose a simple HTTP endpoint. If not, add a Python preparation phase before Week 1.

| Roadmap Weeks | Focus | Supporting Material | Practical Completion Criteria |
| :--- | :--- | :--- | :--- |
| **1–2** | ML foundations: Python, NumPy/pandas, basic SQL, train/validation/test splits, leakage, overfitting, precision, and recall. | AI Topics Weeks 1–2. | Train a small classifier from a script, evaluate it on held-out data, and explain its errors rather than only reporting accuracy. |
| **3–5** | Reproducible MLOps: experiment tracking, data/model versions, packaging, automated tests, and model registration. | MLOps Weeks 1–2. | Reproduce a training run within documented tolerances, trace its data/code/configuration, register the model, and serve predictions through an API. |
| **6–8** | LLM serving: tokens, context length, GPU memory, batching, KV cache, and quantization. | AI Topics Weeks 3–4 and 12. | Deploy a small open-weight model with one serving engine. Benchmark concurrency and input/output lengths, and explain latency, throughput, memory, and quality trade-offs. |
| **9–11** | AI reliability: inference SLOs, overload, cold starts, capacity, monitoring, and safe rollout. | MLOps Week 3; SRE Weeks 1–5 as needed; AI Topics Weeks 5 and 11 for output quality. | Build dashboards and alerts, inject failures in an isolated lab, demonstrate recovery and rollback, and write a postmortem. |
| **12–14** | Specialization: choose AI SRE or MLOps using the branches below. | AI Topics Weeks 6 and 10 for the AI SRE branch; revisit MLOps Weeks 2–3 for the MLOps branch. | Complete one branch-specific project extension with tests and documented trade-offs. |
| **15–16** | Portfolio and interviews: architecture decisions, operational ownership, and cost. | MLOps Week 4; selected SRE/CNCF English exercises. | Produce a reproducible demo, architecture diagram, benchmark report, runbook, and English walkthrough. |

### Branch A — AI SRE / Inference Infrastructure

This is the recommended first specialization because it directly extends Kubernetes and SRE experience.

- **GPU operations:** Scheduling, quotas, isolation, driver/runtime compatibility, and hardware telemetry.
- **Serving performance:** Queue-aware scaling, admission control, request limits, and graceful degradation.
- **Capacity and cost:** Model load times, artifact caching, capacity headroom, and cost per workload.
- **Application reliability:** Extend the inference project with a small retrieval-augmented generation (RAG) service, retrieval monitoring, and a fixed evaluation dataset.
- **Data protection:** Control access to source documents and avoid exposing sensitive prompts or retrieved content in telemetry.

**Completion criterion:** Demonstrate how the service behaves under increased load and component failure, explain its bottleneck using measurements, and show that a release has not regressed the chosen quality checks.

### Branch B — MLOps / ML Platform Engineering

Choose this branch if the target role emphasizes the training-to-production lifecycle and collaboration with data scientists.

- **Pipeline automation:** Orchestrated training, data contracts, validation, and lineage.
- **Feature consistency:** Apply compatible transformations during training and serving; understand when a feature store is justified.
- **Release safety:** Evaluation gates, model promotion, rollback, and controlled retraining triggers.
- **Production feedback:** Investigate drift, delayed labels, and changes in measured prediction quality.

**Drift is a signal to investigate, not automatic proof that retraining is necessary.** A changed input distribution does not by itself establish that the model has become less useful.

**Completion criterion:** Run an automated training-to-release workflow that validates its inputs, rejects an unsuitable candidate, records lineage, and supports rollback to a known version.

Distributed training, multi-GPU networking, and checkpoint recovery can follow when target jobs emphasize training infrastructure. They are not prerequisites for the first two projects.

## 4. Project A — A Reproducible Classical ML Service

Use a small classification problem to learn the complete lifecycle without requiring a GPU.

**Suggested starting stack:** Python + scikit-learn + MLflow + an API framework + Docker, followed by deployment to Kubernetes. These are starting choices, not an exhaustive tool checklist.

### Required Deliverables

- Versioned data, code, configuration, and model artifacts, with enough metadata to reproduce and explain a run.
- A baseline model and held-out evaluation that avoids data leakage.
- Automated tests and an evaluation gate before model promotion.
- A deliberately degraded candidate that the release gate rejects.
- A prediction endpoint with basic operational monitoring.
- A demonstrated rollback to a known model version.

Start with scripts and CI. Add a workflow orchestrator when the pipeline needs scheduling, dependencies, retries, or other coordination; do not make installing a large platform the first milestone.

## 5. Project B — A Reliable LLM Inference Service

Operate one small open-weight model and investigate its behavior under realistic workload changes.

**Suggested starting stack:** One serving engine, such as vLLM, plus Kubernetes and the existing monitoring stack. Confirm model, GPU, and runtime compatibility before choosing the test environment.

### Required Deliverables

- Measurements of **time to first token**, **inter-token latency**, end-to-end latency, throughput, and queueing.
- GPU memory and utilization dashboards alongside user-facing service metrics.
- Load tests that record the model revision, hardware, serving configuration, concurrency, and input/output token lengths.
- Recovery exercises for overload, model-loading failure, and a bad rollout, performed only in an isolated lab.
- A fixed evaluation dataset and quality regression checks for model or configuration changes.
- A runbook covering detection, triage, mitigation, recovery verification, and escalation.
- A cost report with an explicit workload definition and measurement assumptions.

### Separate Reliability from Model Quality

An HTTP 200 response does not establish a correct answer. A good quality score does not establish availability.

| Measurement Area | Examples | Purpose |
| :--- | :--- | :--- |
| Service reliability | Successful request rate, latency, time to first token, and streaming interruptions. | Define and assess the user-facing service SLOs. |
| Capacity and efficiency | Queue depth, throughput, GPU memory, utilization, and workload-normalized cost. | Diagnose bottlenecks and inform scaling or capacity decisions. |
| Model/application quality | Task success, groundedness, retrieval quality, and regression results on a fixed dataset. | Evaluate usefulness and guard against quality regressions. |

Set thresholds for a documented workload and use case. Do not treat one aggregate score as a substitute for all three areas.

### GPU Budget

Project A can run without a GPU. For Project B, use short-lived GPU access with spending limits and release resources after experiments. A hosted model API is useful for application exercises, but it does not replace GPU operations practice.

## 6. Integrate English with Engineering

Use one shared topic each week so that reading, implementation, and English practice reinforce one another.

| Activity | Suggested Share | Output |
| :--- | :--- | :--- |
| Implementation, testing, and troubleshooting | 60% | Working code, experiments, failure recovery, and measurements. |
| Technical reading and targeted video segments | 25% | Notes that answer a concrete project question. |
| English communication about the project | 15% | Architecture explanations, decision summaries, and incident reports. |

Every week, produce:

1. A **two-minute architecture explanation** in English.
2. A **100–150-word decision or incident summary**.
3. Answers to: **“What failed?”, “What evidence did you collect?”, and “Why did you choose this solution?”**

Use familiar SRE topics for fluency practice, but spend most new technical study time on ML-specific gaps. Completing every video is not the objective.

## 7. Weekly Self-Check and Portfolio Readiness

- [ ] I built or improved something that can be demonstrated.
- [ ] I recorded the configuration and evidence needed to explain the result.
- [ ] I can identify a failure mode and describe how to detect and mitigate it.
- [ ] I can explain one quality, latency, reliability, or cost trade-off in English.
- [ ] I know which skill gap to address next week.

By the end of this first iteration, aim to demonstrate both projects and explain their limits honestly. Use target job descriptions to decide which gaps need another iteration; a completed schedule alone does not establish production experience.

The intended career positioning is:

> I bring Kubernetes and SRE experience and can apply it to model delivery, inference performance, and AI reliability.

## 8. Daily English Learning Plan — AI SRE / Inference Infrastructure

This companion plan covers **16 weeks × 6 study days = 96 days**, at approximately **30 minutes per study day**. Day numbers are study sessions, not calendar dates; use the seventh day for rest or catching up. The technical roadmap above remains a separate hands-on commitment. The English weeks follow their own progression and do not have to match the technical roadmap week for week.

Use 3 minutes for recall, 10 minutes for a short English video segment, 8 minutes for approximately 300–500 words of reading, and 9 minutes for the English task. Long talks and documents are reference material: study the indicated topic, not the entire resource. English captions and slower playback are optional supports. Save three reusable phrases each day. Resources do not have official CEFR ratings; adapt the segment length to a B2 learning baseline.

The progression is inference fundamentals → GPU infrastructure → serving → performance and scaling → observability and reliability → quality, cost, and security → architecture decisions. Watching and explaining material does not replace the project completion criteria above.

## Week 1 — AI Inference and the Production ML Lifecycle

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **❇️ Key** | 01 | **What happens during AI inference?** | [AI Inference: The Secret to AI's Superpowers — IBM Technology][v01] — listen for the request-to-prediction flow | [What is AI inference? — IBM][a01] — inference versus training | Record a 60-second baseline explanation using "input," "model," and "prediction." |
| ❇️  | 02 | How does a model reach production? | [Machine Learning Lifecycle Explained — Super Data Science][v02] — follow the lifecycle stages | [What is the AI lifecycle? — IBM][a02] — development and operational feedback | Write 80–100 words using "first," "next," and "finally." |
| ❇️  | 03 | Where do SRE and MLOps overlap? | [What is MLOps? — IBM Technology][v03] — listen for operational responsibilities | [What is MLOps? — IBM][a03] — lifecycle automation | Explain the overlap in 90 seconds using "whereas" and "reliability." |
|  | 04 | Which layers support an AI service? | [Infrastructure Layer: Power the AI Stack — IBM Technology][v04] — follow the infrastructure dependencies | [What is an AI stack? — IBM][a04] — infrastructure, data, and model layers | Write a 100-word dependency map using "depends on" three times. |
|  | 05 | Why does deployment need automation? | [What Is MLOps? — MathWorks, Heather Gorr][v05] — focus on production automation | [What is model deployment? — IBM][a05] — packaging and operational considerations | Explain two deployment risks in 90 seconds using "in order to." |
|  | 06 | Review: explain the production ML lifecycle | [Machine Learning Engineering for Production — DeepLearning.AI][v06] — replay the opening discussion of production challenges | [MLOps: Continuous delivery and automation pipelines — Google Cloud][a06] — check the lifecycle and ownership | Give a two-minute explanation without notes; compare with Day 01. |

## Week 2 — LLM Fundamentals for Operators

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 07 | What does an LLM predict? | [Large Language Models Explained Briefly — 3Blue1Brown, official bilingual upload][v07] — listen for next-token prediction | [Large language models — IBM][a07] — definitions and limitations | Explain an LLM in 90 seconds using "predicts" rather than "knows." |
|  | 08 | How do tokens pass through a transformer? | [Transformers Explained — 3Blue1Brown, official bilingual upload][v08] — follow the opening token workflow | [Transformer models — IBM][a08] — architecture overview | Write 80–100 words using "first," "embedding," and "finally." |
|  | 09 | Why does attention use context? | [Attention in Transformers — 3Blue1Brown, official bilingual upload][v09] — focus on the first contextual example | [Attention mechanisms — IBM][a09] — contextual relationships | Explain one example in 90 seconds using "depending on" and "relevant." |
|  | 10 | What limits the context window? | [What Is the LLM's Context Window? — New Machina][v10] — listen for input and output limits | [Context windows — IBM][a10] — token limits and operational implications | Write a 100-word explanation using "whereas" and "limit." |
|  | 11 | How does sampling change responses? | [The Secret Controls for Your LLM — Gary Explains][v11] — focus on temperature and sampling | [LLM temperature — IBM][a11] — randomness versus correctness | Explain in 90 seconds why lower temperature does not guarantee factual accuracy. |
|  | 12 | Review: explain the operator's model of an LLM | [Intro to Large Language Models — Andrej Karpathy][v12] — replay the opening model overview | [Large Language Models Explained Briefly — 3Blue1Brown][a12] — verify the prediction workflow | Give a two-minute explanation connecting tokens, context, attention, and sampling. |

## Week 3 — GPU Hardware, Memory, and Runtime Foundations

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 13 | Why use GPUs instead of CPUs for some workloads? | [GPUs: Explained — IBM Technology][v13] — listen for parallel processing | [CPU vs. GPU for machine learning — IBM][a13] — architectural trade-offs | Compare CPU and GPU work in 90 seconds using "whereas" twice. |
|  | 14 | How do memory capacity and bandwidth differ? | [High Bandwidth Memory Explained — Techquickie][v14] — focus on the memory-interface analogy | [High Bandwidth Memory: Everything You Need to Know — Rambus][a14] — bandwidth and stacked memory | Write 100 words distinguishing storage capacity from transfer speed. |
|  | 15 | What does CUDA provide? | [Nvidia CUDA in 100 Seconds — Fireship][v15] — listen for the software and hardware relationship | [CUDA platform — NVIDIA][a15] — compiler, libraries, and runtime | Explain the CUDA stack in 90 seconds using "enables" and "depends on." |
|  | 16 | How does a container access a GPU? | [Docker with NVIDIA GPU Support — Jeremy Pedersen][v16] — follow the runtime integration concept | [NVIDIA Container Toolkit overview][a16] — runtime components | Write 100 words separating the host driver from container libraries; do not copy old installation commands. |
|  | 17 | Why does numerical precision matter? | [Mixed Precision Training — Aladdin Persson][v17] — focus on the introductory memory and speed explanation | [Train with mixed precision — NVIDIA][a17] — half precision and numerical trade-offs | Explain FP16 versus FP32 in 90 seconds; distinguish the training example from inference. |
|  | 18 | Review: describe the GPU execution stack | [GPU Architecture Deep Dive — Parallel Routines][v18] — replay the opening hardware overview | [GPU Performance Background User's Guide — NVIDIA][a18] — verify compute and memory terminology | Give a two-minute explanation connecting cores, memory, runtime, and workload. |

## Week 4 — Operating GPU Workloads on Kubernetes

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 19 | How does Kubernetes discover GPUs? | [GPUs on Kubernetes: What Actually Happens — CNCF, Topcu and Polencic][v19] — follow the device allocation path | [Device plugins — Kubernetes][a19] — discovery and resource reporting | Explain device discovery in 90 seconds using "advertises," "allocates," and "kubelet." |
|  | 20 | What does the GPU Operator manage? | [Mastering GPU Management Using the Operator Pattern — CNCF][v20] — focus on the managed components | [About the NVIDIA GPU Operator][a20] — driver, toolkit, and plugin responsibilities | Write 100 words explaining which responsibilities the operator automates. |
|  | 21 | What isolation does MIG provide? | [Efficient Access to Shared GPU Resources — CNCF][v21] — listen for physical partitioning | [GPU Operator with MIG — NVIDIA][a21] — supported hardware and partitions | Compare a full GPU and a MIG instance in 90 seconds using "whereas." |
|  | 22 | What are the limits of time-slicing? | [GPU Sharing and CDI in Device Plugins — CNCF][v22] — focus on sharing mechanisms | [Time-slicing GPUs in Kubernetes — NVIDIA][a22] — memory and fault-isolation limitations | Write 100–120 words explaining why a shared slot is not a dedicated memory partition. |
|  | 23 | Why might a GPU Pod remain pending? | [Scheduled GPUs on Kubernetes — Eric O Meehan][v23] — follow the scheduling setup | [Schedule GPUs — Kubernetes][a23] — requests, limits, and node selection | Describe three scheduling checks in 90 seconds using "first," "then," and "if." |
|  | 24 | Review: explain a GPU workload from request to execution | [Kubernetes with GPUs Like I'm 5 — CNCF, Carlos Santana][v24] — replay the orchestration overview | [Installing the GPU Operator — NVIDIA][a24] — check prerequisites and validation steps | Give a two-minute walkthrough covering discovery, scheduling, runtime, and sharing. |

## Week 5 — Model Serving and Inference Engines

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 25 | What does an inference runtime do? | [What an Inference Runtime Actually Does — Mahesh Dsouza][v25] — follow the serving responsibilities | [Quickstart — vLLM][a25] — offline inference and online serving | Explain the runtime's role in 90 seconds using "loads," "schedules," and "generates." |
|  | 26 | What does an OpenAI-compatible endpoint provide? | [Understanding vLLM with a Hands-On Demo — KodeKloud][v26] — focus on the API server example | [OpenAI-compatible server — vLLM][a26] — supported APIs and limitations | Write 100 words explaining why compatible APIs do not imply identical behavior. |
|  | 27 | What does Triton Inference Server manage? | [Top 5 Reasons Why Triton Is Simplifying Inference — NVIDIA Developer][v27] — listen for model-serving capabilities | [Triton Inference Server overview — NVIDIA][a27] — serving across model frameworks | Explain Triton's role in 90 seconds using "backend" and "endpoint." |
|  | 28 | How does KServe fit above a model server? | [Deploy Models with KServe, MLServer and MLflow — MLWorks][v28] — focus on component responsibilities | [Deploy your first predictive InferenceService — KServe][a28] — declarative serving | Write 100 words distinguishing orchestration from model execution. |
|  | 29 | What does TensorRT LLM optimize? | [TensorRT LLM Introduction — Fahd Mirza][v29] — listen for acceleration goals | [TensorRT LLM overview — NVIDIA][a29] — optimization scope and capabilities | Explain a possible benefit and compatibility constraint in 90 seconds. |
|  | 30 | Review: choose the layers of a serving stack | [AI Infrastructure Explained — KodeKloud][v30] — replay the serving-stack overview | [What is AI infrastructure? — IBM][a30] — check infrastructure responsibilities | Give a two-minute recommendation; distinguish a runtime, a server, and orchestration. |

## Week 6 — Model Artifacts, Deployment, and Startup

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 31 | How are model files downloaded and cached? | [Download a Model from Hugging Face — Amit Thinks][v31] — follow the artifact retrieval workflow | [Download files from the Hub — Hugging Face][a31] — revisions and caching | Explain a download failure and a cache hit in 90 seconds. |
|  | 32 | Why record the model version? | [MLflow Model Tracking and Model Registry — FourthBrainAI][v32] — listen for lineage and registration | [ML model registry — MLflow][a32] — versions, aliases, and metadata | Write a 100-word release record using "version," "artifact," and "reproduce." |
|  | 33 | Which files make a model usable? | [Hugging Face AI Model Files Explained — Fahd Mirza][v33] — distinguish weights, configuration, and tokenizer files | [Safetensors security audit — Hugging Face][a33] — safer tensor serialization and its scope | Explain in 90 seconds why safe weights do not make all accompanying code trustworthy. |
|  | 34 | What belongs in a deployable model package? | [Machine Learning Packaging for Ops with KitOps — Bret Fisher][v34] — focus on reproducible bundles | [ModelKit overview — KitOps][a34] — OCI packaging for model artifacts | Write 100 words comparing a model package with a container image. |
|  | 35 | When is a model server ready for traffic? | [Liveness vs. Readiness vs. Startup Probes — Anton Putra][v35] — listen for the three probe purposes | [Configure liveness, readiness, and startup probes — Kubernetes][a35] — startup protection and readiness | Explain how slow model loading affects probe design in 90 seconds. |
|  | 36 | Review: trace a model artifact into a ready endpoint | [KitOps and KServe Integration Guide — Jozu][v36] — replay the deployment workflow | [Deploy your first LLM with InferenceService — KServe][a36] — check the model-to-endpoint path | Give a two-minute walkthrough covering revision, download, loading, and readiness. |

## Week 7 — Inference Performance and Optimization

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 37 | What is prefill versus decode? | [Why LLMs Read Fast but Write Slowly - Prefill vs Decode — ML Guy][v37] — listen for the two-phase timing difference | [Prefill and Decode for Concurrent Requests — Hugging Face][a37] — latency budgets under load | Explain in 90 seconds why time-to-first-token and inter-token latency behave differently. |
|  | 38 | What does the KV cache store? | [KV Cache Explained: Speed Up LLM Inference with Prefill and Decode — Ready Tensor][v38] — follow the key-and-value reuse example | [Paged Attention — vLLM][a38] — how attention memory is partitioned | Write 100 words explaining why a KV cache saves compute but uses GPU memory. |
|  | 39 | How does continuous batching raise throughput? | [Continuous Batching for LLM Inference — Uplatz][v39] — focus on iteration-level scheduling | [Continuous batching from first principles — Hugging Face][a39] — static versus dynamic batching | Explain in 90 seconds why continuous batching reduces the padding waste of static batches. |
|  | 40 | What does prefix caching reuse? | [What is Prefix Caching? — Standarity][v40] — listen for the shared-prefix reuse story | [Automatic Prefix Caching — vLLM][a40] — enabling APC and limits | Write 100 words describing one workload where prefix caching helps and one where it does not. |
|  | 41 | Why quantize LLM weights? | [LLM Quantization Techniques Explained — Joydeep Bhattacharjee][v41] — focus on the GPTQ, AWQ, and GGUF comparison | [Quantization — vLLM][a41] — supported formats and quality trade-offs | Explain in 90 seconds why INT4 quantization trades numerical precision for memory and speed. |
|  | 42 | Review: weigh inference-performance trade-offs | [Mastering LLM Inference Optimization From Theory to Cost Effective Deployment — AI Engineer, Mark Moyou][v42] — replay the opening cost framework | [LLM Inference at scale with TGI — Hugging Face][a42] — check the end-to-end optimization stack | Give a two-minute walkthrough linking prefill, KV cache, batching, prefix caching, and quantization to one cost scenario. |

## Week 8 — Benchmarking Latency, Throughput, and Quality

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 43 | What is time to first token? | [LLM Inference Performance: Latency and Throughput Metrics — Ready Tensor][v43] — listen for the TTFT definition | [Metrics — NVIDIA NIM LLMs Benchmarking][a43] — TTFT, e2e latency, ITL, TPS, RPS | Explain in 90 seconds which stages of inference contribute to TTFT. |
|  | 44 | What is inter-token latency? | [RTX 4090 vLLM Benchmark — Database Mart][v44] — focus on the latency numbers | [Benchmark CLI — vLLM][a44] — benchmark serving and throughput scripts | Write 100 words describing how to record ITL under varying concurrency. |
|  | 45 | How do TPS and RPS compare? | [GuideLLM: Evaluate your LLM Deployments for Real-World Inference — Red Hat, vLLM Office Hours][v45] — listen for the per-system versus per-user framing | [Understand LLM latency and throughput metrics — Anyscale][a45] — tokens, requests, and concurrency | Explain in 90 seconds why total TPS can grow while TPS per user shrinks. |
|  | 46 | How do you design a realistic benchmark workload? | [Ultimate Guide to LLM Benchmarks — Bhavesh Bhatt][v46] — focus on the workload-shape examples | [LLM inference latency — ClickHouse][a46] — capturing TTFT and TPOT in practice | Write 100 words listing the workload variables a benchmark report must record. |
|  | 47 | How is model quality measured? | [Hallucination Rate Explained in AI Testing — CodeCraft Academy][v47] — listen for the quality-metric framing | [LLM Benchmarks Explained — Atlan][a47] — what benchmark scores actually mean | Explain in 90 seconds why one aggregate score cannot replace service SLOs. |
|  | 48 | Review: tie latency, throughput, and quality together | [Tour De Force: LLM Inference Optimization From Simple To Sophisticated — PyTorch, Christin Pohl, Microsoft][v48] — replay the optimization layering | [Benchmark Suites — vLLM][a48] — check benchmark types and outputs | Give a two-minute walkthrough picking a metric set for one documented workload. |

## Week 9 — Autoscaling and Capacity Planning

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 49 | What does HPA scale on? | [Kubernetes HPA Explained in 10 Minutes — Cloud Guru][v49] — listen for the metric, target, and stabilization window | [Horizontal Pod Autoscaling — Kubernetes][a49] — metrics, behaviors, and policies | Explain in 90 seconds how a target utilization becomes a replica count. |
|  | 50 | Why is CPU-based HPA unreliable for LLMs? | [Optimizing Load Balancing and Autoscaling for LLM Inference on Kubernetes — CNCF, D. Gray][v50] — focus on the queue and prefill pressures | [Best practices for autoscaling LLM inference — Google Cloud][a50] — metric selection for inference | Write 100 words explaining why queue depth or pending requests beat CPU for LLM scale-out. |
|  | 51 | How does KEDA extend HPA? | [Run Scalable LLMs on Kubernetes in Minutes (Using KEDA) — DigitalOcean][v51] — follow the ScaledObject definition | [Autoscaling with KEDA — vLLM Production Stack][a51] — Prometheus trigger and queue threshold | Explain in 90 seconds how KEDA scales a Deployment from a Prometheus query. |
|  | 52 | What triggers a KEDA scaler? | [KEDA: Kubernetes Event-Driven Autoscaling — DevOps & AI Toolkit][v52] — listen for the scaler and polling examples | [Autoscale GPU and LLM workloads on Kubernetes — Kedify][a52] — inference-aware routing and HTTP scalers | Write 100 words comparing KEDA scalers with custom-metric HPA. |
|  | 53 | How do you size GPU capacity? | [GPU Instance Selection: AI & LLM Inference Benchmarking — Sam Mokhtari][v53] — focus on the memory-versus-cost framework | [Inference Is the New Bottleneck: Plan GPU Capacity for Production AI — ClearML][a53] — workload-driven capacity sizing | Explain in 90 seconds why model size, KV cache, and concurrency drive GPU count. |
|  | 54 | Review: connect autoscaling to capacity | [LLM's INFERENCE: Cost vs. Latency vs. Throughput — César Soto Valero][v54] — replay the cost-versus-latency framing | [Cost-Efficient AI Inference Cloud Strategies — GMI Cloud][a54] — workload shapes and reserved capacity | Give a two-minute walkthrough sizing replicas, headroom, and scale-down safety. |

## Week 10 — AI Observability: Metrics, Logs, and Traces

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 55 | What does vLLM expose as metrics? | [Get More Performance From Your DGX Spark — vLLM + Grafana Tuning Dashboard — Ryan Susman][v55] — follow the metric-to-panel example | [Metrics — vLLM][a55] — vLLM engine and request metrics | Explain in 90 seconds which vLLM metric best reflects user-perceived queueing. |
|  | 56 | How does OpenTelemetry trace an LLM call? | [Intro to OpenTelemetry and LLM Observability — Arize AI][v56] — listen for the span and attributes example | [OpenTelemetry Concepts][a56] — signals, instrumentation, context | Write 100 words listing the spans you would record across one LLM request. |
|  | 57 | How do you log prompts safely? | [WSO2 AI Guardrails: PII Masking, Prompt Injection & Safety — WSO2][v57] — focus on the masking and redaction steps | [Redact PII from LLM Telemetry Without Losing Debuggability — OpenObserve][a57] — masking trade-offs | Explain in 90 seconds why redaction is required before sending traces to a vendor. |
|  | 58 | What belongs on a GPU dashboard? | [How to Monitor Key LLM Metrics (GPU + Grafana Dashboard) — Saujan Bohara][v58] — follow the panel selection | [Enabling the GPU Monitoring Dashboard — NVIDIA GPU Operator][a58] — DCGM exporter metrics | Write 100 words describing the panels you would keep, drop, or add for one inference cluster. |
|  | 59 | How is prompt drift detected? | [Drift Monitoring and Evaluation for LLM Apps — Evidently AI, MG][v59] — listen for the reference-baseline framing | [Introducing Evidently 0.0.1: Open-Source Tool To Analyze Data Drift — Evidently AI][a59] — reference versus current data | Explain in 90 seconds why drift is a signal to investigate, not a retraining trigger. |
|  | 60 | Review: tie metrics, logs, and traces together | [Observability and Its Pillars Explained — OpenObserve][v60] — replay the three-pillar framing | [Three Pillars of Observability — IBM][a60] — logs, metrics, and traces | Give a two-minute walkthrough showing which pillar answers which operational question. |

## Week 11 — Inference SLOs, Error Budgets, and Alerting

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 61 | What is an SLO? | [SLO vs SLI vs SLA vs Error Budget — Tech Tutorials with Piyush][v61] — listen for the reliability-target framing | [Designing SLOs — Google Cloud][a61] — SLI types, compliance, and error budget | Explain in 90 seconds the difference between SLO, SLI, and SLA. |
|  | 62 | Which metric makes a good SLI? | [SLO & SLI Explained: Service Level Objectives & Indicators for Beginners — CodeLucky][v62] — follow the SLI-selection examples | [SLA vs SLO vs SLI Explained: Key Differences — NovelVista][a62] — what each term really covers | Write 100 words proposing SLIs for one documented inference workload. |
|  | 63 | What is an error budget? | [Error Budgets Explained: Balance Innovation & Reliability — CodeLucky][v63] — listen for the budget-versus-risk framing | [How to Set SLOs in 2026: SLIs, Error Budgets & Burn-Rate Alerts — OpenObserve][a63] — common SLO mistakes | Explain in 90 seconds how an error budget connects availability and release velocity. |
|  | 64 | How do you write an alert rule? | [Full Tutorial: AlertManager Set up and PrometheusRules — Anais Urlichs][v64] — follow the rule and routing example | [Configuration — Prometheus][a64] — alerting rules, routes, and receivers | Write 100 words distinguishing a symptom alert from a budget-burn alert. |
|  | 65 | What is multi-window burn-rate alerting? | [Defending SLOs: Error Budget Burn Rate Alerting using Datadog — DevOps Austin][v65] — listen for the window-pair logic | [How to Build Multi-Burn-Rate SLO Alerts from OpenTelemetry Metrics — OneUptime][a65] — burn-rate recording and alert rules | Explain in 90 seconds why a single threshold is not enough for an SLO alert. |
|  | 66 | Review: connect SLOs, budgets, and alerts | [SREcon15 — Error Budgets and Risks — USENIX][v66] — replay the budget-versus-risk framing | [How to implement multi-window, multi-burn-rate alerts with Grafana Cloud][a66] — window-pair construction | Give a two-minute walkthrough defining one SLI, one SLO, and one alert tier. |

## Week 12 — Incident Response and Failure Recovery

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 67 | What is an incident response lifecycle? | [The 6 Steps of the Incident Response Life Cycle — Cyber Gray Matter][v67] — follow the detect-to-learn sequence | [Incident Response Process: Step-by-Step Guide for SRE Teams — Rootly][a67] — lifecycle stages and ownership | Explain in 90 seconds which stages an SRE typically owns and which need a separate responder. |
|  | 68 | How do you triage an inference failure? | [How Site Reliability Engineering Handles High-Severity Incidents — SystemDR][v68] — listen for the triage and command example | [Troubleshooting GPU Memory Out-of-Memory Errors — NVIDIA NIM][a68] — OOM symptoms and mitigations | Write 100 words listing the first three signals you would check for a slow LLM endpoint. |
|  | 69 | What is a blameless postmortem? | [Blameless Post Mortems — Code for America, John Allspaw][v69] — listen for the systems-versus-people framing | [How to run a blameless postmortem — Atlassian][a69] — story, contributing factors, and actions | Explain in 90 seconds why a postmortem lists contributing factors instead of human faults. |
|  | 70 | What causes GPU OOM during inference? | [Learn vLLM: Troubleshooting Deepseek R1 8B GPU OOM on single L4 GPU — Samos123][v70] — follow the OOM investigation | [vLLM OOM Errors: Root Cause Diagnosis Guide — Paralleliq][a70] — KV cache, batch size, fragmentation | Write 100 words distinguishing a model-size OOM from a KV-cache OOM. |
|  | 71 | How does chaos engineering help inference reliability? | [Chaos Engineering Explained: How to Build Failure-Resilient Systems — Harness][v71] — focus on hypothesis and steady state | [What is Chaos Engineering? — IBM][a71] — controlled failure injection | Explain in 90 seconds why chaos tests run in a lab first and what evidence they should produce. |
|  | 72 | Review: connect detection, response, and learning | [What is an AI SRE? — ResolveAI][v72] — replay the detect-to-learn automation framing | [The AI Agent Incident Response Runbook — Reco][a72] — containment, analysis, recovery | Give a two-minute walkthrough of one incident from alert to postmortem action item. |

## Week 13 — Safe Model Releases and Rollback

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 73 | How do you version and stage a model? | [MLflow Model Registry Explained — YourMLStudents][v73] — listen for the staging-to-production transition | [Manage model lifecycle using the Workspace Model Registry — Databricks][a73] — lifecycle stages and ownership | Explain in 90 seconds why staging and production are separate steps. |
|  | 74 | What is a canary release? | [Canary Deployments Explained — Harness][v74] — focus on the gradual traffic shift | [Canary Deployment Strategy — Argo Rollouts][a74] — steps, weights, and pause conditions | Write 100 words explaining why canary shifts allow an early rollback. |
|  | 75 | What is blue-green deployment? | [Kubernetes Blue Green Deployment Strategy Explained — Aman Pathak][v75] — follow the active and preview service split | [BlueGreen Deployment Strategy — Argo Rollouts][a75] — active, preview, and scale-down delay | Explain in 90 seconds why blue-green gives instant rollback but doubles resource use briefly. |
|  | 76 | What is a dark launch or shadow deployment? | [How Do Dark Launches Work In Continuous Deployment? — Cloud Stack Studio][v76] — listen for the mirrored-traffic pattern | [Kubernetes Deployment Strategies — Octopus Deploy][a76] — rolling, blue-green, canary, and shadow | Write 100 words describing what shadow deployment tells you that canary cannot. |
|  | 77 | How do you automate rollouts in Kubernetes? | [Argo Rollouts — Canary Deployments Made Easy In Kubernetes — DevOps & AI Toolkit][v77] — follow the Rollout CRD example | [Argo Rollouts — Kubernetes Progressive Delivery][a77] — controller, CRDs, and traffic management | Explain in 90 seconds how a Rollout differs from a Deployment in steady state. |
|  | 78 | Review: pick a safe release for one scenario | [Progressive Delivery Explained — DevOps & AI Toolkit][v78] — replay the rollout-strategy comparison | [Analysis — Argo Rollouts][a78] — background analysis that gates a promotion | Give a two-minute walkthrough picking one release strategy and one guardrail for a documented inference workload. |

## Week 14 — RAG Reliability and Quality Evaluation

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 79 | What is RAG? | [What is Retrieval-Augmented Generation (RAG)? — IBM Technology][v79] — follow the retrieve-then-generate flow | [What is RAG? — IBM][a79] — knowledge base, retriever, generator | Explain in 90 seconds why retrieval can improve factuality without retraining. |
|  | 80 | What are the parts of a RAG pipeline? | [RAG Explained in 10 Minutes — Cloud Quick Labs][v80] — listen for chunking and embedding | [What is Retrieval-Augmented Generation (RAG)? — Databricks][a80] — ingestion, retrieval, augmentation, generation | Write 100 words naming the offline ingestion path and the online query path. |
|  | 81 | How do you build a RAG pipeline? | [RAG Tutorial 2026 #1 — Harish Neel][v81] — focus on the end-to-end walkthrough | [Faithfulness — Ragas][a81] — factual consistency of the response with retrieved context | Explain in 90 seconds why a faithful answer still may not be relevant. |
|  | 82 | How do you evaluate the retriever? | [Vector Databases Explained — Aishwarya Srinivasan][v82] — focus on similarity search and chunking trade-offs | [Understanding RAG Part IV: RAGAs & Other Evaluation Frameworks — Machine Learning Mastery][a82] — contextual precision and recall | Write 100 words distinguishing recall from precision in retrieval. |
|  | 83 | How do you evaluate the generated answer? | [LLM Evaluation Explained — Schovia][v83] — follow the accuracy, faithfulness, and hallucination framing | [Using the RAG Triad for RAG evaluation — DeepEval][a83] — answer relevancy, faithfulness, contextual relevancy | Explain in 90 seconds why the RAG triad is referenceless. |
|  | 84 | Review: connect retrieval, generation, and metrics | [RAG MasterClass — Build A RAG Pipeline From Scratch — A.I Engineering BootCamp][v84] — replay the architecture recap | [RAG Evaluation Metrics — Confident AI][a84] — answer relevancy, faithfulness, and more | Give a two-minute walkthrough tracing one user query through retrieval, generation, and the three RAG triad metrics. |

## Week 15 — Cost, Security, and Data Protection

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 85 | What is the cost per million tokens? | [LLM Cost Optimization: Token Economics for Agentic FinOps — KryptoMindz Technologies][v85] — follow the cost-per-token framing | [AI Inference Cost Economics in 2026 — Spheron][a85] — cost per million tokens and four optimization layers | Explain in 90 seconds why CPM is the most useful cost metric for inference. |
|  | 86 | How do you right-size GPU memory? | [How Much GPU Memory is Needed for LLM Inference? — AppliedAI][v86] — listen for the model-size plus KV-cache formula | [Optimizing Inference Costs: The Complete Guide — Mirantis][a86] — right-sizing and idle-capacity avoidance | Write 100 words explaining why model weights, KV cache, and concurrency all fit into the sizing math. |
|  | 87 | Are spot GPUs worth the risk? | [Running Multiple Models on the Same GPU, on Spot Instances — Toronto Machine Learning Society][v87] — focus on interruption handling | [What Are Spot GPUs? — Northflank][a87] — discounts, interruption warnings, and fit for inference | Explain in 90 seconds why spot GPUs change the answer to "where does state live?" |
|  | 88 | What is prompt injection? | [What Is a Prompt Injection Attack? — IBM Technology][v88] — listen for direct and indirect injection | [LLM01:2025 Prompt Injection — OWASP Gen AI Security Project][a88] — risk description and mitigations | Write 100 words distinguishing direct injection from indirect injection through retrieved content. |
|  | 89 | How do you redact PII before telemetry? | [Protect Sensitive Data with Azure AI Language PII Redaction — Microsoft Developer][v89] — follow the redaction pipeline | [LLM Security Playbook — Kong][a89] — prompt injection, data leaks, and model theft | Explain in 90 seconds why redaction has to happen before traces leave your perimeter. |
|  | 90 | Review: tie cost, security, and privacy together | [AI and Data Privacy Explained — Privacy Trainer][v90] — replay the GDPR and AI Act framing | [How Much Does Your LLM Inference Cost? — NVIDIA Technical Blog][a90] — TCO formula and benchmarking inputs | Give a two-minute walkthrough showing how one cost-saving choice affects security and privacy controls. |

## Week 16 — Architecture Trade-offs and Final Review

|  | Day | Topic | Video | Article | English Practice |
| :---: | :--- | :--- | :--- | :--- | :--- |
|  | 91 | How do throughput and latency trade off? | [ML Model Serving – Latency vs Throughput — Uplatz][v91] — follow the latency-versus-throughput framing | [The LLM Inference Trilemma — DigitalOcean][a91] — throughput, latency, and cost trade-offs | Explain in 90 seconds why per-user latency can rise while total throughput grows. |
|  | 92 | When is batch inference the right choice? | [Scaling LLM Batch Inference: Ray Data & vLLM — InfoQ][v92] — focus on the batch pipeline | [Realtime vs Batch Inference — Inworld AI][a92] — serving contracts, latency budgets, and batching wins | Write 100 words naming one workload that fits batch inference and one that does not. |
|  | 93 | How do you serve multiple tenants safely? | [Multi-Tenant AI-as-a-Service for AI Factories — OpenNebula][v93] — listen for isolation and quota | [Multi-Tenant LLM Serving on GPU Cloud — Spheron][a93] — per-customer quotas and noisy-neighbor isolation | Explain in 90 seconds why request quotas are not the same as token quotas. |
|  | 94 | Build versus buy: when is an API the right answer? | [API vs Self-Hosted LLMs — CodeLucky][v94] — follow the control-versus-convenience comparison | [Managed LLM API vs Self-Hosting — Access All GPT][a94] — decision criteria, cost, and compliance | Write 100 words listing two scenarios where a managed API wins and two where self-hosting wins. |
|  | 95 | Hybrid or fully self-hosted? | [Self-Hosting LLMs: Architect's Guide to When & How — InfoQ][v95] — focus on the decision framework | [Hybrid Cloud vs On-Premise LLM Deployment — newline][a95] — routing, gateway, and cost trade-offs | Explain in 90 seconds why hybrid setups add a routing layer that pure cloud or on-prem does not. |
|  | 96 | Final review: connect every week's lesson | [Supercharging IT Operations SRE Agents, GPU Metrics Optimization, and Capacity Risk Management — BMC Helix Events][v96] — replay the AI-SRE framing | [What is an AI SRE? The Complete AI SRE Guide for 2026 — Rootly][a96] — incident response, root cause, and remediation | Give a two-minute walkthrough connecting lifecycle, hardware, serving, performance, observability, reliability, RAG, cost, security, and architecture into one AI-SRE checklist. |

## Weekly Self-Check

After each sixth study day, record:

- **Listening:** Can I identify the main point and three supporting details without captions?
- **Vocabulary:** Can I use five useful phrases from this week in new sentences?
- **Speaking:** Can I explain the topic for two minutes using only a few keywords?
- **Writing:** Can I produce a short summary with a main point, an example, and a limitation?
- **Next step:** Which one difficulty should I focus on next week? Repeat a difficult week if needed; finishing on schedule is not a language-proficiency test.

## Reference

- [AI concepts and English practice — 05-AI Topics.md](./05-AI%20Topics.md)
- [ML lifecycle and operations — 20-MLOps.md](./20-MLOps.md)
- [Reliability engineering and communication — 49-SRE.md](./49-SRE.md)
- [Cloud-native reference and communication — 51-CNCF.md](./51-CNCF.md)

[v01]: https://www.youtube.com/watch?v=XtT5i0ZeHHE
[v02]: https://www.youtube.com/watch?v=OMNHrfhdf0k
[v03]: https://www.youtube.com/watch?v=OejCJL2EC3k
[v04]: https://www.youtube.com/watch?v=itBc7nwAK5o
[v05]: https://www.mathworks.com/videos/what-is-mlops-1706066104525.html
[v06]: https://www.youtube.com/watch?v=Ta14KpeZJok
[v07]: https://www.bilibili.com/video/BV1xmA2eMEFF
[v08]: https://www.bilibili.com/video/BV13z421U7cs
[v09]: https://www.bilibili.com/video/BV1TZ421j7Ke
[v10]: https://www.youtube.com/watch?v=y5wBbDSe0cM
[v11]: https://www.youtube.com/watch?v=MkaazQttbpc
[v12]: https://www.youtube.com/watch?v=zjkBMFhNj_g
[v13]: https://www.youtube.com/watch?v=LfdK-v0SbGI
[v14]: https://www.youtube.com/watch?v=79x7HuDPDlU
[v15]: https://www.youtube.com/watch?v=pPStdjuYzSI
[v16]: https://www.youtube.com/watch?v=kgTkObayMfk
[v17]: https://www.youtube.com/watch?v=ks3oZ7Va8HU
[v18]: https://www.youtube.com/watch?v=5UWphJWdAHY
[v19]: https://www.youtube.com/watch?v=nu6bLhuvlWM
[v20]: https://www.youtube.com/watch?v=jbpIFCkEEng
[v21]: https://www.youtube.com/watch?v=jkcEQE9C338
[v22]: https://www.youtube.com/watch?v=4YS8mQuI_-Y
[v23]: https://www.youtube.com/watch?v=UDq__rDz6EM
[v24]: https://www.youtube.com/watch?v=bQvrutQO3-c
[v25]: https://www.youtube.com/watch?v=Ak46J80Ot8k
[v26]: https://www.youtube.com/watch?v=qdPkA5mxLhg
[v27]: https://www.youtube.com/watch?v=1kOaYiNVgFs
[v28]: https://www.youtube.com/watch?v=C9lypFchNz0
[v29]: https://www.youtube.com/watch?v=hhhvZdkxsCE
[v30]: https://www.youtube.com/watch?v=hBzUokVYQkI
[v31]: https://www.youtube.com/watch?v=UDyhcrKTUfI
[v32]: https://www.youtube.com/watch?v=3Jiduh4VIrU
[v33]: https://www.youtube.com/watch?v=xgQCRAXb6IM
[v34]: https://www.youtube.com/watch?v=fP_OssMlnWI
[v35]: https://www.youtube.com/watch?v=fqfieWP1jY4
[v36]: https://www.youtube.com/watch?v=0gXe_q458K4
[v37]: https://www.youtube.com/watch?v=hmMgTgQpO38
[v38]: https://www.youtube.com/watch?v=hafEw3bEu8E
[v39]: https://www.youtube.com/watch?v=xT2oLInUQhY
[v40]: https://www.youtube.com/watch?v=4dfapZqUWiA
[v41]: https://www.youtube.com/watch?v=0pF6GdbwMo4
[v42]: https://www.youtube.com/watch?v=9tvJ_GYJA-o
[v43]: https://www.youtube.com/watch?v=DW-mo65DJ-Q
[v44]: https://www.youtube.com/watch?v=N6TaSiu0B4c
[v45]: https://www.youtube.com/watch?v=crwoAti-mOI
[v46]: https://www.youtube.com/watch?v=AcOdFLi2H1U
[v47]: https://www.youtube.com/watch?v=nWJC6a72uHg
[v48]: https://www.youtube.com/watch?v=sWgrAsKM9j8
[v49]: https://www.youtube.com/watch?v=ADWQYCh0PJE
[v50]: https://www.youtube.com/watch?v=TSEGAh1bs4A
[v51]: https://www.youtube.com/watch?v=M-aa800RBF4
[v52]: https://www.youtube.com/watch?v=3lcaawKAv6s
[v53]: https://www.youtube.com/watch?v=V38mZ9Jehsk
[v54]: https://www.youtube.com/watch?v=oLu-KGJ_x0E
[v55]: https://www.youtube.com/watch?v=VOUj3UL6vwA
[v56]: https://www.youtube.com/watch?v=0I0ZrmyoTpM
[v57]: https://www.youtube.com/watch?v=ptRhf5pUEr0
[v58]: https://www.youtube.com/watch?v=yjoOE67MMNA
[v59]: https://www.youtube.com/watch?v=eQ6cGzDUtMU
[v60]: https://www.youtube.com/watch?v=rJfZyA831fI
[v61]: https://www.youtube.com/watch?v=Akri1BlGp10
[v62]: https://www.youtube.com/watch?v=77woJoutNjE
[v63]: https://www.youtube.com/watch?v=Kril2R5oVGs
[v64]: https://www.youtube.com/watch?v=HwB2oWUdoT4
[v65]: https://www.youtube.com/watch?v=iAKksNmAZDw
[v66]: https://www.youtube.com/watch?v=zmhjJmHD8x4
[v67]: https://www.youtube.com/watch?v=ToVVhMyU3dQ
[v68]: https://www.youtube.com/watch?v=OwTFGGn-5KU
[v69]: https://www.youtube.com/watch?v=4nRahQddtJ0
[v70]: https://www.youtube.com/watch?v=-l-YhlD4geU
[v71]: https://www.youtube.com/watch?v=NxQrTGGO-Tc
[v72]: https://www.youtube.com/watch?v=cR5mqLcj3J4
[v73]: https://www.youtube.com/watch?v=-aWL-c8ybm0
[v74]: https://www.youtube.com/watch?v=HS5B5C2mYGY
[v75]: https://www.youtube.com/watch?v=fn2iMTdkdNA
[v76]: https://www.youtube.com/watch?v=cmMnqxZuWGo
[v77]: https://www.youtube.com/watch?v=84Ky0aPbHvY
[v78]: https://www.youtube.com/watch?v=HKkhD6nokC8
[v79]: https://www.youtube.com/watch?v=T-D1OfcDW1M
[v80]: https://www.youtube.com/watch?v=99SYeGK1OcE
[v81]: https://www.youtube.com/watch?v=63B-3rqRFbQ
[v82]: https://www.youtube.com/watch?v=4pUYfY-b5CQ
[v83]: https://www.youtube.com/watch?v=LM-bmieFw74
[v84]: https://www.youtube.com/watch?v=TfaqGXyyVmw
[v85]: https://www.youtube.com/watch?v=pZNtpZnj4E0
[v86]: https://www.youtube.com/watch?v=hByzGf0TAeM
[v87]: https://www.youtube.com/watch?v=4tHr75KKIeU
[v88]: https://www.youtube.com/watch?v=jrHRe9lSqqA
[v89]: https://www.youtube.com/watch?v=ZDaog_MJGS8
[v90]: https://www.youtube.com/watch?v=jjn_DVkN8Dw
[v91]: https://www.youtube.com/watch?v=bc0ACP1KKsI
[v92]: https://www.youtube.com/watch?v=_rEsLo21WvE
[v93]: https://www.youtube.com/watch?v=ZS5kYS3t7NA
[v94]: https://www.youtube.com/watch?v=aATp2cjM-qw
[v95]: https://www.youtube.com/watch?v=3Hd-QL0fwaI
[v96]: https://www.youtube.com/watch?v=DpnL0wcIRSM

[a01]: https://www.ibm.com/think/topics/ai-inference
[a02]: https://www.ibm.com/think/topics/ai-lifecycle
[a03]: https://www.ibm.com/think/topics/mlops
[a04]: https://www.ibm.com/think/topics/ai-stack
[a05]: https://www.ibm.com/think/topics/model-deployment
[a06]: https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning
[a07]: https://www.ibm.com/think/topics/large-language-models
[a08]: https://www.ibm.com/think/topics/transformer-model
[a09]: https://www.ibm.com/think/topics/attention-mechanism
[a10]: https://www.ibm.com/think/topics/context-window
[a11]: https://www.ibm.com/think/topics/llm-temperature
[a12]: https://www.3blue1brown.com/lessons/mini-llm/
[a13]: https://www.ibm.com/think/topics/cpu-vs-gpu-machine-learning
[a14]: https://www.rambus.com/blogs/hbm3-everything-you-need-to-know/
[a15]: https://developer.nvidia.com/cuda-zone
[a16]: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html
[a17]: https://docs.nvidia.com/deeplearning/performance/mixed-precision-training/index.html
[a18]: https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html
[a19]: https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/device-plugins/
[a20]: https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html
[a21]: https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/gpu-operator-mig.html
[a22]: https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/gpu-sharing.html
[a23]: https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/
[a24]: https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html
[a25]: https://docs.vllm.ai/en/latest/getting_started/quickstart/
[a26]: https://docs.vllm.ai/en/stable/serving/openai_compatible_server/
[a27]: https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/index.html
[a28]: https://kserve.github.io/website/docs/getting-started/predictive-first-isvc
[a29]: https://nvidia.github.io/TensorRT-LLM/overview.html
[a30]: https://www.ibm.com/think/topics/ai-infrastructure
[a31]: https://huggingface.co/docs/huggingface_hub/guides/download
[a32]: https://mlflow.org/docs/latest/ml/model-registry/
[a33]: https://huggingface.co/blog/safetensors-security-audit
[a34]: https://kitops.org/docs/modelkit/intro/
[a35]: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
[a36]: https://kserve.github.io/website/docs/getting-started/genai-first-isvc
[a37]: https://huggingface.co/blog/tngtech/llm-performance-prefill-decode-concurrent-requests
[a38]: https://docs.vllm.ai/en/stable/design/paged_attention/
[a39]: https://huggingface.co/blog/continuous_batching
[a40]: https://docs.vllm.ai/en/stable/features/automatic_prefix_caching.html
[a41]: https://docs.vllm.ai/en/stable/features/quantization/
[a42]: https://huggingface.co/blog/martinigoyanes/llm-inference-at-scale-with-tgi
[a43]: https://docs.nvidia.com/nim/benchmarking/llm/latest/metrics.html
[a44]: https://docs.vllm.ai/en/latest/benchmarking/cli/
[a45]: https://docs.anyscale.com/llm/serving/benchmarking/metrics
[a46]: https://clickhouse.com/resources/engineering/llm-inference-latency
[a47]: https://atlan.com/know/llm-benchmarks-explained/
[a48]: https://docs.vllm.ai/en/latest/benchmarking/
[a49]: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/
[a50]: https://docs.cloud.google.com/kubernetes-engine/docs/best-practices/machine-learning/inference/autoscaling
[a51]: https://docs.vllm.ai/projects/production-stack/en/latest/use_cases/autoscaling-keda.html
[a52]: https://kedify.io/resources/blog/scaling-ai-ml-workloads/
[a53]: https://clear.ml/blog/inference-is-the-new-bottleneck-how-to-plan-gpu-capacity-for-production-ai
[a54]: https://www.gmicloud.ai/en/blog/cost-efficient-ai-inference-cloud-strategies-in-2026
[a55]: https://docs.vllm.ai/en/stable/design/metrics/
[a56]: https://opentelemetry.io/docs/concepts/
[a57]: https://openobserve.ai/blog/redact-pii-llm-telemetry/
[a58]: https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/23.6.0/openshift/enable-gpu-monitoring-dashboard.html
[a59]: https://www.evidentlyai.com/blog/evidently-001-open-source-tool-to-analyze-data-drift
[a60]: https://www.ibm.com/think/insights/observability-pillars
[a61]: https://docs.cloud.google.com/service-mesh/docs/observability/design-slo
[a62]: https://www.novelvista.com/blogs/devops/sla-vs-slo-vs-sli-differences
[a63]: https://openobserve.ai/blog/set-meaningful-slos/
[a64]: https://prometheus.io/docs/alerting/latest/configuration/
[a65]: https://oneuptime.com/blog/post/2026-02-06-multi-burn-rate-slo-alerts/view
[a66]: https://grafana.com/blog/how-to-implement-multi-window-multi-burn-rate-alerts-with-grafana-cloud/
[a67]: https://rootly.com/incident-response/lifecycle-process
[a68]: https://docs.nvidia.com/nim/large-language-models/latest/troubleshooting/memory.html
[a69]: https://www.atlassian.com/incident-management/postmortem/blameless
[a70]: https://www.paralleliq.ai/blog/vllm-oom-errors-root-cause-diagnosis
[a71]: https://www.ibm.com/think/topics/chaos-engineering
[a72]: https://www.reco.ai/ciso-hub/ai-agent-incident-response-runbook
[a73]: https://docs.databricks.com/aws/en/machine-learning/manage-model-lifecycle/workspace-model-registry
[a74]: https://argo-rollouts.readthedocs.io/en/release-1.6/features/canary/
[a75]: https://argo-rollouts.readthedocs.io/en/release-1.6/features/bluegreen/
[a76]: https://octopus.com/devops/kubernetes-deployments/kubernetes-deployment-strategies/
[a77]: https://argo-rollouts.readthedocs.io/en/stable/
[a78]: https://argo-rollouts.readthedocs.io/en/stable/features/analysis/
[a79]: https://www.ibm.com/think/topics/retrieval-augmented-generation
[a80]: https://www.databricks.com/blog/what-is-retrieval-augmented-generation
[a81]: https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/
[a82]: https://machinelearningmastery.com/understanding-rag-part-iv-ragas-evaluation-framework/
[a83]: https://deepeval.com/guides/guides-rag-triad
[a84]: https://www.confident-ai.com/blog/rag-evaluation-metrics-answer-relevancy-faithfulness-and-more
[a85]: https://www.spheron.network/blog/ai-inference-cost-economics-2026/
[a86]: https://www.mirantis.com/blog/inference-costs/
[a87]: https://northflank.com/blog/what-are-spot-gpus-guide
[a88]: https://genai.owasp.org/llmrisk/llm01-prompt-injection/
[a89]: https://konghq.com/blog/enterprise/llm-security-playbook-for-injection-attacks-data-leaks-model-theft
[a90]: https://developer.nvidia.com/blog/llm-inference-benchmarking-how-much-does-your-llm-inference-cost/
[a91]: https://www.digitalocean.com/blog/llm-inference-tradeoffs
[a92]: https://inworld.ai/resources/what-is-realtime-inference
[a93]: https://www.spheron.network/blog/multi-tenant-llm-serving-gpu-cloud/
[a94]: https://www.accessallgpt.com/research/managed-llm-api-vs-self-hosting-production-decision
[a95]: https://www.newline.co/@zaoyang/hybrid-cloud-vs-on-premise-llm-deployment--74f51098
[a96]: https://rootly.com/ai-sre-guide
