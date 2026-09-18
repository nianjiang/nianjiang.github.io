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

## Reference

- [AI concepts and English practice — 05-AI Topics.md](./05-AI%20Topics.md)
- [ML lifecycle and operations — 20-MLOps.md](./20-MLOps.md)
- [Reliability engineering and communication — 49-SRE.md](./49-SRE.md)
- [Cloud-native reference and communication — 51-CNCF.md](./51-CNCF.md)
