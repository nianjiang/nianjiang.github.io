---
weight: 61
title: "GPU"
bookCollapseSection: true
---

### GPU List

上一页 [numerical precision](/docs/61-GPU/80-NumericalPrecision/) 讲的是「用什么精度算」，这里讲「用什么卡跑」。
常用型号按厂商与用途分四组比较，**算力一律取稠密值**（厂商宣传页经常给的是稀疏值，差 2 倍）。

#### 数据中心 · 训练与推理主力

| 型号 | 架构 | 显存 / 带宽 | FP16·BF16 稠密 | FP8 稠密 | 卡间互联 | TDP |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| B200 | Blackwell | 192 GB HBM3e / 8.0 TB/s | 2,250 TFLOPS | 4,500 TFLOPS | NVLink 1.8 TB/s | 1,000 W |
| H200 | Hopper | 141 GB HBM3e / 4.8 TB/s | 990 TFLOPS | 1,979 TFLOPS | NVLink 900 GB/s | 700 W |
| H100 SXM | Hopper | 80 GB HBM3 / 3.35 TB/s | 495 TFLOPS | 990 TFLOPS | NVLink 900 GB/s | 700 W |
| H100 PCIe | Hopper | 80 GB HBM3 / 2.0 TB/s | 378 TFLOPS | 756 TFLOPS | NVLink Bridge 600 GB/s | 350 W |
| A100 80GB SXM | Ampere | 80 GB HBM2e / 2.04 TB/s | 156 TFLOPS | 不支持 | NVLink 600 GB/s | 400 W |
| A100 40GB SXM | Ampere | 40 GB HBM2 / 1.55 TB/s | 156 TFLOPS | 不支持 | NVLink 600 GB/s | 400 W |
| H20 | Hopper | 96 GB HBM3 / 4.0 TB/s | 148 TFLOPS | 296 TFLOPS | NVLink 900 GB/s | 400 W |
| MI300X | CDNA 3 | 192 GB HBM3 / 5.3 TB/s | 1,307 TFLOPS | 2,614 TFLOPS | Infinity Fabric 896 GB/s | 750 W |

H200 相对 H100 SXM 是「同算力、换显存」：算力、NVLink、功耗全一样，只有容量 +76%、带宽 +43%。
所以它解决的是**装不装得下**，不是**算得快不快**。

#### 推理与通用加速

| 型号 | 架构 | 显存 / 带宽 | FP16 稠密 | FP8 稠密 | 互联 | TDP |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| L40S | Ada | 48 GB GDDR6 ECC / 864 GB/s | 366 TFLOPS | 733 TFLOPS | 仅 PCIe | 350 W |
| L4 | Ada | 24 GB GDDR6 / 300 GB/s | 121 TFLOPS | 242 TFLOPS | 仅 PCIe | 72 W |
| A30 | Ampere | 24 GB HBM2 / 933 GB/s | 82 TFLOPS | 不支持 | NVLink 200 GB/s | 165 W |
| A10 | Ampere | 24 GB GDDR6 / 600 GB/s | 63 TFLOPS | 不支持 | 仅 PCIe | 150 W |
| T4 | Turing | 16 GB GDDR6 / 320 GB/s | 65 TFLOPS | 不支持 | 仅 PCIe | 70 W |
| V100 SXM2 | Volta | 32 GB HBM2 / 900 GB/s | 125 TFLOPS | 不支持 | NVLink 300 GB/s | 300 W |

这一档的共同点是**没有 FP8**（Hopper/Ada 以后才有）和**没有 NVLink 或带宽很窄**，所以适合多实例推理、单卡微调，不适合大模型并行训练。
L4 只有 72 W 却能给出 24 GB 显存，是纯推理机型的性价比锚点；L40S 用 GDDR6 换来 48 GB 容量和 350 W 的机房友好度。

#### 消费级与工作站

| 型号 | 架构 | 显存 / 带宽 | FP32 | 互联 | TDP | 备注 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| RTX A6000 | Ampere | 48 GB GDDR6 ECC / 768 GB/s | 38.7 TFLOPS | NVLink 112 GB/s | 300 W | 工作站卡，有 ECC |
| RTX 5090 | Blackwell | 32 GB GDDR7 / 1,792 GB/s | 104.8 TFLOPS | 无 | 575 W | 支持 FP4 |
| RTX 4090 | Ada | 24 GB GDDR6X / 1,008 GB/s | 82.6 TFLOPS | 无 | 450 W | 单机微调主力 |
| RTX 3090 | Ampere | 24 GB GDDR6X / 936 GB/s | 35.6 TFLOPS | NVLink 112 GB/s | 350 W | 二手市场仍有量 |

消费卡看 FP32 和显存就够，**别拿厂商宣传的 AI TOPS 跨卡比**——那个数通常是 FP4/INT4 稀疏口径，和 A100 的稠密 FP16 不是一回事。

#### 非 NVIDIA 的数据中心加速卡

这些卡在纸面算力上早已能对标 NVIDIA，真正的分水岭是两件事：**软件栈**（ROCm / oneAPI / CANN / 各家自研）和**可获取性**（能不能买到、能不能租到）。
另需注意口径：AMD 与 Intel 按稠密值公布；**华为与国产厂商普遍不发布完整数据手册**，下列数字来自厂商页与云商公开口径，彼此存在矛盾（例如 910C 的显存有 96 GB 和 128 GB 两种说法），采购前必须索取实测报告与算子兼容性清单。

| 厂商 | 型号 | 定位 | 显存 / 带宽 | FP16 稠密 | 低精度算力 | 互联 | TDP |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| AMD | MI355X | 训练 / 推理 | 288 GB HBM3e / 8.0 TB/s | 2,500 TFLOPS | FP8 5,000 TFLOPS | Infinity Fabric | 1,400 W（液冷） |
| AMD | MI325X | 推理优先 | 256 GB HBM3e / 6.0 TB/s | 1,307 TFLOPS | FP8 2,614 TFLOPS | Infinity Fabric | 1,000 W |
| AMD | MI300X | 推理优先 | 192 GB HBM3 / 5.3 TB/s | 1,307 TFLOPS | FP8 2,614 TFLOPS | Infinity Fabric 896 GB/s | 750 W |
| AMD | MI250X | 上一代训练 | 128 GB HBM2e / 3.2 TB/s | 383 TFLOPS | 不支持 | Infinity Fabric | 560 W |
| Intel | Gaudi 3 | 训练 / 推理 | 128 GB HBM2e / 3.7 TB/s | 918 TFLOPS | FP8 1,835 TFLOPS | 24 × 200GbE RoCE | 600 W |
| Intel | Gaudi 2 | 上一代 | 96 GB HBM2e / 2.45 TB/s | 433 TFLOPS | FP8 866 TFLOPS | 24 × 100GbE RoCE | 600 W |
| Intel | Max 1550 | HPC / 推理 | 128 GB HBM2e / 3.28 TB/s | 420 TFLOPS | 不支持 | Xe Link | 600 W |
| 华为 | 昇腾 910C | 训练 | 96~128 GB HBM / 1.8~3.2 TB/s | 800 TFLOPS | INT8 1,600 TOPS | HCCS 784 GB/s | 未单独公开 |
| 华为 | 昇腾 910B（B1~B4） | 训练 | 64 GB HBM2e / 约 0.4~0.8 TB/s | 280~414 TFLOPS | INT8 约 2 倍 FP16 | HCCS 392 GB/s | 约 300~400 W |
| 华为 | 昇腾 310P（Atlas 300I Pro） | 推理 | 24 GB LPDDR4X | 70 TFLOPS | INT8 140 TOPS | 仅 PCIe | 72 W |
| 海光 | 深算二号 K100-AI | 训练 / 推理 | 64 GB HBM2 | 192 TFLOPS | 未公开 | 自研互联 | 未公开 |
| 寒武纪 | 思元 590 | 训练 / 推理 | 未公开 | 300 TFLOPS 级（口径不一） | 未公开 | MLU-Link | 未公开 |
| 摩尔线程 | MTT S4000 | 推理 | 48 GB GDDR6 / 768 GB/s | 25 TFLOPS（向量） | 未公开 | 仅 PCIe | 未公开 |

三个读表结论：

1. **显存竞赛在 AMD 这边**：MI355X 的 288 GB、MI325X 的 256 GB、MI300X 的 192 GB 都超过 H100/H200，单卡能装下的模型更大，这是它近两年在推理侧拿到订单的主因。
   注意 MI355X 与 MI350X 同芯不同形态：算力、显存、带宽完全一致，区别只在液冷 1,400 W 与风冷 1,000 W。
2. **Intel 走的是以太网路线**：Gaudi 3 不建私有互联，直接用 24 张 200GbE RoCE 组网，整机便宜但大规模训练的通信调优得自己做；Max 1550 更偏 HPC 与带宽型负载。
3. **昇腾与国产卡要看生态不看峰值**：选型入口是 CANN（MindSpore、torch_npu、HCCL），要算的是迁移人天而不是 TFLOPS；910B1 与 910B2 差 10% 以上，子型号必须锁死；国产卡里海光的路线最接近 ROCm/HIP，迁移成本相对低。

另外两个常被问到的类别：Google TPU（v5e / v5p / Trident）与 AWS Trainium / Inferentia 只以云服务形式提供，买不到整卡，也不能自建集群；AMD 与 Intel 的卡在国内公开渠道基本只能租，昇腾、寒武纪、昆仑芯、摩尔线程这类则以信创采购与国产云为主。寒武纪、昆仑芯、壁仞、天数智芯的规格口径比华为更乱，引用前建议直接向厂商索要白皮书。

#### 软件栈：真正的选型分水岭

同一个模型换卡，改的通常不是数学，而是下面这一整层：

| 厂商 | 软件栈 | 编程模型与工具链 | 数学 / 通信库 | 框架接入 | CUDA 代码迁移路径 | 成熟度 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| NVIDIA | CUDA | CUDA C++、PTX/SASS，nvcc + NVRTC | cuBLAS、cuDNN、TensorRT、NCCL | 所有框架的原生后端，事实标准 | 无需迁移 | ★★★★★ |
| AMD | ROCm | HIP（源码级贴近 CUDA）、Triton、Composable Kernel | rocBLAS、MIOpen、RCCL、rocprof | PyTorch / JAX / TensorFlow 官方支持 | hipify 自动转换，多数代码改头文件即可 | ★★★★ |
| Intel | oneAPI（GPU）/ SynapseAI（Gaudi） | SYCL + DPC++、Level Zero；Gaudi 走图编译 | oneDNN、oneMKL、oneCCL；Gaudi 用 SynapseAI | 通用卡走 IPEX；Gaudi 有独立 PyTorch/TF 适配器 | dpct 迁移 CUDA 到 SYCL；Gaudi 基本重写 | ★★★ |
| 华为 | CANN | AscendCL + Ascend C 自定义算子；ATC 将 ONNX 转 .om | CANN 算子库、HCCL | torch_npu、MindSpore、MindIE（推理） | 无自动转换，算子需重写或找对应实现 | ★★★ |
| 海光 | DTK（DCU Toolkit） | 基于 ROCm / HIP | 复用 rocBLAS、MIOpen、RCCL | PyTorch、飞桨（ROCm 版）、vLLM-DCU | 与 AMD 同一路径，以 hipify 为主 | ★★★ |
| 寒武纪 | Neuware | BANG C、CNNL / CNRT；支持 Triton | CNNL、CNRT、MLU-Link | torch_mlu，官方宣称覆盖 PyTorch 2.1~2.8 | 无自动转换；社区版本发布两周内跟进适配 | ★★☆ |
| 摩尔线程 | MUSA | MUSA C/C++（与 CUDA 同构）+ MUSA SDK | 对标 CUDA 的 muBLAS、muDNN、MCCL | torch_musa，指定 device("musa") 即可 | musify 一键迁移，改少量接口 | ★★☆ |

从迁移成本看，四档很清楚：**hipify（AMD / 海光）→ musify（摩尔线程）→ dpct（Intel，CUDA 转 SYCL）→ 算子级重写（华为 / 寒武纪）**。
后两档的差距不在工具，而在**算子覆盖**：迁移失败的项目九成不是编译不过，而是某个 attention、归一化或自定义 loss 在新栈上没有高效实现，只能回落到 CPU 或拆成多个慢算子。

三个问题决定要不要上：

1. **算子能不能对上**：先用 `torch.profiler` 出一份真实算子清单，再到目标栈的库里逐个找对应实现，这一步比读任何宣传材料都准。
2. **只推理还是要训练**：推理可以套现成引擎（NVIDIA 的 TensorRT、华为的 MindIE），迁移面小得多；训练要动优化器和并行策略，工作量高一个量级。
3. **厂商能不能驻场**：国产卡这一项经常比参数更决定成败。

一个值得留意的趋势：Triton / OpenXLA 这类「上层框架 + 可插拔后端」的路线，正在把迁移问题从「重写」降级成「换后端」——ROCm 已是 Triton 的官方后端，寒武纪也宣称支持 Triton。新项目如果在意可移植性，优先选支持 Triton 的卡，比看 TFLOPS 更有长期价值。

#### 读表须知：五个高频坑

1. **稠密与稀疏差 2 倍**：H100 SXM 的 989 TFLOPS 是带稀疏的值，稠密只有 495；L40S 官网写的 733 TFLOPS FP16 同样是稀疏值，稠密 366。跨卡比较前先确认口径一致。
2. **同型号不同形态**：H100 PCIe 只有 2.0 TB/s 和 350 W，比 SXM 版少了 40% 带宽，而且 NVLink 只能靠桥；A100 的 40 GB 和 80 GB 算力相同但带宽差 30%。采购单上只写型号是关键错误。
3. **FP8 / FP4 不是所有卡都有**：Ampere 及更早（A100、A30、A10、T4、V100）没有 FP8，跑 Hopper 优化的 FP8 kernel 会直接回落到 FP16。
4. **特供型号单独核对**：H800 砍的是 NVLink 带宽（400 GB/s），A800 同理；H20 是显存 96 GB、算力压到 148 TFLOPS 的版本。昇腾的子型号问题见上一节。
5. **GDDR 与 HBM 的差别不只是速度**：数据中心卡用 HBM 且支持 ECC，消费卡 GDDR 没有 ECC，长时间跑训练的静默错误风险要自己承担。

#### 选型的正确顺序：显存 → 带宽 → 算力

对今天的大模型负载来说，这个顺序比「谁 TFLOPS 高」有用得多。粗略估算（含 KV cache 之前的权重体积）：

| 模型规模 | FP16 推理显存 | 全参训练显存（Adam 混合精度） | 常见配置 |
| -------- | -------- | -------- | -------- |
| 7B | 约 14 GB | 约 130 GB | 推理：单卡 4090 / L4；微调：A100 40G 或 2×4090 |
| 13B | 约 26 GB | 约 240 GB | 推理：L40S 48G；微调：2×A100 80G |
| 70B | 约 140 GB | 约 1.3 TB | 推理：2×H100 80G 起；训练：8×H100/H200 |
| 405B | 约 810 GB | 约 7.5 TB | 推理：8×H200；训练：多机 + 高速互联 |

两条比表格更该记住的公式：

- **推理显存**：参数量 × 2 字节（FP16/BF16）+ KV cache。int4 量化可压到约 0.5 字节/参数，但精度和吞吐要另测。
- **单请求 decode 速度上限 ≈ 显存带宽 ÷ 权重字节数**。70B 的 FP16 权重约 140 GB，H100 SXM（3.35 TB/s）理论上限约 24 token/s，而要跑满这个上限得靠 batch 把带宽摊薄——这就是为什么推理优化先看带宽，训练优化先看算力。

#### 一句话建议

| 场景 | 选择 |
| -------- | -------- |
| 大模型预训练 / 全参微调 | H100 SXM 或 H200，优先看互联带宽和单机卡数 |
| 中小模型训练、性价比优先 | A100 80GB 仍是通用档；预算紧用 L40S 做单卡微调 |
| 在线推理、要求能效 | L4（低功耗高密度）或 L40S（要 48 GB 容量） |
| 单机实验、个人 / 小团队 | RTX 4090 24G 跑 7B~13B 的 LoRA；32 GB 的 5090 更适合长上下文 |
| 非 NVIDIA 生态验证 | MI300X 的 192 GB 显存在推理上对标 H200，但软件栈要单独评估 |

-------------------------------------------------------

## Reference

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
