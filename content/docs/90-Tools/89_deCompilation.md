---
weight: 89
title: "DeCompilation"
---

# 反编译工具选型指南

> 反编译（Decompilation）是把**编译产物**反向还原成**近似源码**的过程。
> 选工具的关键不是「哪种语言」，而是「产物是什么形态」：托管字节码（可高保真还原）、原生机器码（只能得到伪代码）、打包器/混淆器产物（要先脱壳）、脚本字节码（有专用反汇编器）。
>
> 记住一条铁律：**除了少数丢符号表的字节码，任何反编译都不等于拿回原始源码**——变量名、注释、宏、泛型擦除、内联、优化重排都不可逆。

## 一、按产物形态分四类

| 产物形态 | 典型来源 | 恢复程度 | 首选工具族 |
|---|---|---|---|
| 托管字节码 / IR | Java `.class`、.NET `dll`、Android `dex`、Python `.pyc`、Lua `.luac`、WASM | 高（可还原到接近源码） | 语言专用反编译器 |
| 原生机器码 | C/C++/Go/Rust/Swift，以及 `AOT`、`Nuitka`、`NativeAOT`、`GraalVM native-image` | 低（只有 C 风格伪代码） | Ghidra / IDA / Binary Ninja |
| 打包器产物 | PyInstaller、py2exe、Electron asar、JS bundle、Spring Boot fat jar、UPX | 中（先解包再走上一级流程） | 解包器 + 字节码反编译器 |
| 加固 / 混淆产物 | ProGuard、R8、ConfuserEx、.NET Reactor、JS obfuscator、ionCube/Zend Guard | 低（需先脱壳或反混淆） | 反混淆器 + 动态调试 |

## 二、语言速查表

| 语言 | 编译产物 | 首选工具 | 备选 | 恢复度 |
|---|---|---|---|---|
| Java (JVM) | `.class` / `.jar` | Vineflower、CFR | JD-GUI、Procyon、IntelliJ 内置 Fernflower | ★★★★ |
| Kotlin | `.class` / `.jar` | Vineflower、CFR | jadx（含 de-Inline 能力） | ★★★☆ |
| Android (Java/Kotlin) | `.apk` / `.dex` | jadx | apktool + dex2jar + JD-GUI | ★★★☆ |
| C# / .NET | `.dll` / `.exe`（含 IL） | dnSpyEx、ILSpy | dotPeek、ilspycmd | ★★★★★ |
| C# / .NET AOT | 原生 ELF/PE | Ghidra / IDA | — | ★★ |
| Python | `.pyc` | pycdc (decompyle++) | uncompyle6 / decompyle3 / pydumpck | ★★★☆ |
| Python 打包 | PyInstaller `exe` | pyinstxtractor + pycdc | 手工修 `pyc` magic | ★★★ |
| JavaScript / TS | bundle、min.js | webcrack | de4js、AstExplorer + Babel | ★★☆ |
| Go | 静态链接二进制 | GoReSym、redress + Ghidra | `go tool nm` / `go tool objdump` | ★★☆ |
| Rust | 原生 ELF/PE | Ghidra / IDA | rustfilt 还原符号 | ★★ |
| C / C++ | 原生 ELF/PE | IDA Pro（Hex-Rays） | Ghidra、Binary Ninja、RetDec | ★★☆ |
| Swift | Mach-O | Hopper、IDA | Ghidra、`swift demangle` | ★★☆ |
| Objective-C | Mach-O | Hopper、class-dump | IDA、jtool2 | ★★★ |
| Lua | `.luac` | unluac | luadec、luajit-decompiler | ★★★☆ |
| Dart / Flutter | `libapp.so` | Blutter | reFlutter（动态） | ★★ |
| WebAssembly | `.wasm` | wasm-decompile (wabt) | wasm2c、Ghidra | ★★★ |
| Erlang | `.beam` | `beam_lib` 取 abstract_code | `erts_debug:df/1` | ★★★☆ |
| Delphi / Pascal | 原生 PE | IDR | IDA + FLIRT | ★★ |
| VB6 | 原生 PE | VB Decompiler | IDA | ★★ |

## 三、各语言工具明细

### Java / JVM

| 工具 | 形态 | 平台 | 授权 | 说明 |
|---|---|---|---|---|
| [Vineflower](https://github.com/Vineflower/vineflower) | CLI / jar | 跨平台 | Apache-2.0 | Fernflower 的活跃分支，现代 Java 语法还原最好，首选 |
| [CFR](https://www.benf.org/other/cfr/) | CLI / jar | 跨平台 | MIT | 单文件 jar，对新版 class 兼容快，输出可读性强 |
| [Procyon](https://github.com/mstrobel/procyon) | CLI / GUI | 跨平台 | Apache-2.0 | 旧项目但反编译质量稳定，适合重命名/类型推断 |
| [JD-GUI](https://github.com/java-decompiler/jd-gui) | GUI | 跨平台 | GPL-3.0 | 拖拽即可看，维护偏慢，适合快速浏览 |
| [Recaf](https://github.com/Col-E/Recaf) | GUI | 跨平台 | 开源 | 反编译 + 字节码编辑一体，适合改逻辑而非只读 |
| [Bytecode Viewer](https://github.com/Konloch/bytecode-viewer) | GUI | 跨平台 | GPL-3.0 | 内置多种反编译器并排对比，教学友好 |
| [threadtear](https://github.com/GraxCode/threadtear) | GUI | 跨平台 | GPL-3.0 | 专门处理 Java 混淆（字符串加密、流程平坦化）的「反混淆」工具 |
| IntelliJ IDEA | IDE | 跨平台 | 商业 / 社区版 | 社区版自带 Fernflower，`Ctrl+点击` 即可反编译依赖 jar |

```shell
# 只看字节码与常量池（无需第三方工具，JDK 自带）
javap -p -c -s com/example/Foo.class

# 批量反编译 jar
java -jar vineflower.jar target/app.jar out/

# 反混淆优先
java -jar cfr.jar app.jar --outputdir out --decodestringswitch true
```

要点：`jar` 里的 `META-INF/MANIFEST.MF` 常带 `Build-Jdk` / `Implementation-Version`，可判断目标字节码版本；ProGuard/R8 混淆后只剩 `a`、`b`、`c`，此时应先用 Recaf / threadtear 反混淆，再读逻辑。

### Kotlin / Android

| 工具 | 形态 | 平台 | 授权 | 说明 |
|---|---|---|---|---|
| [jadx](https://github.com/skylot/jadx) | CLI / GUI | 跨平台 | Apache-2.0 | Android 事实标准，直接吃 `.dex`/`.apk`/`.aab`，能还原 `suspend`、Kotlin 内联与 SMALI 互看 |
| [Apktool](https://github.com/iBotPeaches/Apktool) | CLI | 跨平台 | Apache-2.0 | 只解资源与 `smali`，不还原 Java；配合资源修改、重打包最合适 |
| [dex2jar](https://github.com/pxb1988/dex2jar) | CLI | 跨平台 | Apache-2.0 | `.dex` → `.jar`，再交给 JVM 反编译器处理 |
| [Blutter](https://github.com/worawit/blutter) | 脚本 | 跨平台 | 开源 | 针对 Flutter，见 Dart 小节 |

```shell
# 一步到位出 Java/Kotlin 源码
jadx -d out app.apk

# 只要资源和 AndroidManifest.xml
apktool d app.apk -o out

# dex -> jar -> 反编译
d2j-dex2jar.sh classes.dex && java -jar vineflower.jar classes-dex2jar.jar src/
```

要点：加固过的 App（360、腾讯乐固、梆梆）`jadx` 会得到空壳，需要先脱壳（Frida 脱壳脚本 / BlackDex）再反编译。

### C# / .NET

| 工具 | 形态 | 平台 | 授权 | 说明 |
|---|---|---|---|---|
| [dnSpyEx](https://github.com/dnSpyEx/dnSpy) | GUI | Windows | GPL-3.0 | 反编译 + 调试 + 直接改 IL 保存回 dll，逆向 .NET 首选 |
| [ILSpy](https://github.com/icsharpcode/ILSpy) | GUI | 跨平台 | MIT | 可读性最好，支持把整个程序集导出为 `.csproj` |
| `ilspycmd` | CLI | 跨平台 | MIT | ILSpy 的 dotnet tool 版本，适合脚本化/批量处理 |
| [dotPeek](https://www.jetbrains.com/decompiler/) | GUI | Windows | 免费闭源 | JetBrains 出品，符号搜索体验好 |
| [de4dot](https://github.com/de4dot/de4dot) | CLI | Windows | GPL-3.0 | 脱 ConfuserEx / .NET Reactor 等混淆，脱完再用 ILSpy 读 |

```shell
dotnet tool install -g ilspycmd
ilspycmd -p -o src/ Foo.dll      # -p 导出为可编译工程

# 先脱混淆，再反编译
de4dot.exe Foo.dll -o Foo.clean.dll
```

要点：`.NET Framework` 程序集符号最全，能看到完整类名与 LINQ；`NativeAOT` / `ReadyToRun` 编译掉的程序集退化为原生二进制，只能走 Ghidra。

### Python

| 工具 | 适用版本 | 平台 | 授权 | 说明 |
|---|---|---|---|---|
| [pycdc / decompyle++](https://github.com/zrax/pycdc) | 3.9+（部分特性） | 跨平台 | GPL-3.0 | C++ 实现，覆盖新版 `pyc` 最好，附带 `pycdas` 反汇编器 |
| [uncompyle6](https://github.com/rocky/python-uncompyle6) | ≤ 3.8 | 跨平台 | GPL-3.0 | 老版本 `pyc` 还原最准，已停止新版本适配 |
| [decompyle3](https://github.com/rocky/python-decompile3) | 3.7 - 3.8 | 跨平台 | GPL-3.0 | uncompyle6 的实验分支 |
| [pydumpck](https://github.com/serfend/pydumpck) | 全版本 | 跨平台 | 开源 | 集解包、反汇编、反编译于一体，统一入口少折腾 |
| [pyinstxtractor](https://github.com/extremecoders-re/pyinstxtractor) | PyInstaller | 跨平台 | GPL-3.0 | 从 `exe` 中提取 `pyc`，之后仍需反编译 |

```shell
# 直接反编译
pycdc target.pyc > target.py

# 新版 pyc 先反汇编，再对照字节码人工/LLM 还原（3.11+ 常见做法）
pycdas target.pyc > target.dis

# PyInstaller 产物：先解包
python pyinstxtractor.py app.exe
```

要点：`pyc` 头部 16 字节含 magic number，必须与对应 Python 版本匹配，否则需先修正；Nuitka 编译产物是真正的原生二进制，按 C/C++ 处理。

**为什么会有 pyc**——它是 CPython 的编译缓存：16 字节头（magic / flags / 源文件 mtime + size）加 marshal 序列化的 code object。

- **加速导入**：省掉 parse→AST→字节码三阶段（实测 4000 个函数的模块，0.27s → 0.06s）
- **自动失效**：源码 mtime/size 变化即重编译，无需手工管缓存
- **只读环境友好**：镜像内预置 `__pycache__`，运行时不必写盘
- **不是保护手段**：pyc 就是可读字节码，体积反比源码大（314KB → 702KB）

边界：pyc 跨平台但**强绑解释器版本**（magic 变即失效），不能跨大版本分发；`python foo.py` 不为主脚本生成 pyc，想直接用要 `python foo.pyc`。

```shell
# 单文件：产物落在 __pycache__/
python3 -m py_compile hello.py
# -> __pycache__/hello.cpython-314.pyc

# 整个目录批量生成；-f 强制重建，-o 2 额外产出一份 -OO 级（去掉 assert 与 docstring）
python3 -m compileall -q -f -o 2 ./src
# -> hello.cpython-314.pyc 与 hello.cpython-314.opt-2.pyc

# 指定输出路径，不污染 __pycache__（如打包进容器镜像时）
python3 -c "import py_compile; py_compile.compile('hello.py', cfile='hello.pyc', doraise=True)"

# 验证：直接执行 pyc（回溯不显示源码行）
python3 hello.pyc
```

### JavaScript / TypeScript

| 工具 | 形态 | 平台 | 授权 | 说明 |
|---|---|---|---|---|
| [webcrack](https://github.com/j4k0xb/webcrack) | CLI / 库 | 跨平台 | MIT | 一站式处理 webpack/browserify 拆包、obfuscator.io 反混淆、字符串数组还原 |
| [de4js](https://lelinhtinh.github.io/de4js/) | 在线 | 浏览器 | 开源 | 纯前端在线反混淆，粘贴即用，适合快速试探混淆类型 |
| js-beautify / Prettier | CLI | 跨平台 | MIT | 格式化，是后续一切分析的前置步骤 |
| AstExplorer + Babel | 在线 | 浏览器 | MIT | 手工写 AST 变换规则，处理定制混淆 |

```shell
npx webcrack bundle.min.js -o out
npx prettier --parser babel bundle.min.js > bundle.pretty.js
```

要点：JS 没有「反编译」，只有「反混淆 + 拆包」。Electron 应用先 `npx asar extract app.asar out`，再对 `out/` 里的 bundle 跑 webcrack。

### Go

| 工具 | 形态 | 平台 | 授权 | 说明 |
|---|---|---|---|---|
| [GoReSym](https://github.com/mandiant/GoReSym) | CLI | 跨平台 | BSD-3-Clause | 从 `pclntab` 恢复 Go 版本、包路径、函数名，是后续静态分析的前提 |
| [redress](https://github.com/goretk/redress) | CLI | 跨平台 | BSD-3-Clause | Go 专用信息提取：类型、依赖包、调用关系、字符串 |
| `go tool nm` / `objdump` | CLI | 跨平台 | Go 自带 | 未 `strip` 时直接读符号与反汇编 |
| Ghidra + [golang_loader_assist](https://github.com/strazzere/golang_loader_assist) | 插件 | 跨平台 | MIT | 在 Ghidra 中重建 Go 函数名与类型 |

```shell
GoReSym -t -d ./app > app.json     # 恢复符号与类型信息
redress info ./app                 # 版本、包、构建信息
go tool nm ./app | grep ' T '      # 未 strip 时的函数表
go tool objdump -s 'main\.main' ./app
```

要点：**Go 没有反编译器**。字符串表是最大金矿（URL、错误消息、SQL），先 `redress strings` 定位关键逻辑，再在 Ghidra 里对着函数名读伪代码。注意 Go 二进制默认静态链接且体积大，`strip` 后符号仍在 `pclntab` 中，所以 GoReSym 往往依然有效。

### Rust / C / C++（原生二进制）

| 工具 | 形态 | 平台 | 授权 | 说明 |
|---|---|---|---|---|
| [IDA Pro](https://hex-rays.com/ida-pro) | GUI | 跨平台 | 商业 | 反编译质量与生态（FLIRT、类型库、脚本）仍是行业标杆 |
| [Ghidra](https://github.com/NationalSecurityAgency/ghidra) | GUI / headless | 跨平台 | Apache-2.0 | NSA 开源，反编译器质量接近商业水平，支持无头批处理 |
| [Binary Ninja](https://binary.ninja/) | GUI | 跨平台 | 商业 | 中间语言 HLIL 可读性好，API 友好，适合写自动化分析 |
| [RetDec](https://github.com/avast/retdec) | CLI | 跨平台 | MIT | 开源可脚本化，冷门架构支持广，输出质量中等 |
| [Cutter](https://cutter.re/) | GUI | 跨平台 | GPL-3.0 | rizin 的图形前端，免费替代 IDA 的入门选择 |
| [Snowman](https://github.com/yegord/snowman) | CLI / 插件 | 跨平台 | GPL-3.0 | 轻量反编译器，可作 IDA/Ghidra 的补充视角 |
| [rustfilt](https://github.com/luser/rustfilt) | CLI | 跨平台 | MIT/Apache-2.0 | 把 Rust `_ZN...` 散列符号还原成可读路径 |

```shell
# Ghidra 无头模式：自动反编译全部函数
analyzeHeadless /tmp/ghidra_proj proj -import ./app \
  -postScript DecompileAllFunctions.java -scriptPath ./scripts

nm -C ./app | head            # 读 C++ / Rust 符号（-C 即 demangle）
rustfilt < symbols.txt > symbols.demangled.txt
```

要点：Rust 的 `panic` 字符串、`core::fmt` 调用、`Result` 分支形态是识别特征；C++ 的虚表（vtable）是恢复类结构的关键入口。

### Swift / Objective-C

| 工具 | 形态 | 平台 | 授权 | 说明 |
|---|---|---|---|---|
| [Hopper](https://www.hopperapp.com/) | GUI | macOS / Linux | 商业（有免费版） | 对 Mach-O 与 Objective-C 支持最顺手，价格低 |
| IDA Pro | GUI | 跨平台 | 商业 | 配合 Swift demangle 插件效果最好 |
| [class-dump](https://github.com/nygard/class-dump) | CLI | macOS | MIT | 从 ObjC 运行时信息导出头文件 |
| [ipsw](https://github.com/blacktop/ipsw) | CLI | 跨平台 | MIT | Mach-O / dyld 共享缓存解析，iOS 逆向常用 |
| `swift demangle` | CLI | 跨平台 | Swift 自带 | Swift 符号还原成可读签名 |

```shell
class-dump -H MyApp.app -o headers/
swift demangle --simplified '$s4main3FooyyF'   # 还原 Swift 符号
```

要点：Swift 结构体/枚举大量内联和值见证表，反编译后失真明显；先靠 `swift demangle` 把符号理顺，再定位逻辑。

### Lua

| 工具 | 适用版本 | 平台 | 授权 | 说明 |
|---|---|---|---|---|
| [unluac](https://github.com/HansWessels/unluac) | Lua 5.0 - 5.4 | 跨平台 | MIT | Java 实现，Lua 字节码还原事实标准 |
| [luadec](https://github.com/viruscamp/luadec) | Lua 5.1 - 5.3 | 跨平台 | MIT | C 实现，对 5.1 兼容性最好 |
| [luajit-decompiler](https://github.com/bobsayshilol/luajit-decompiler) | LuaJIT 2.0 / 2.1 | 跨平台 | MIT | 专门处理 LuaJIT bytecode（含 `lj_bc` 指令） |

```shell
luac -l -l script.luac           # 先看字节码结构
java -jar unluac.jar script.luac > script.lua
```

要点：LuaJIT 与标准 Lua 字节码完全不同，工具不能混用；游戏常用的 `xxtea`/`zlib` 加密需先解密再反编译。

### Dart / Flutter

| 工具 | 形态 | 平台 | 授权 | 说明 |
|---|---|---|---|---|
| [Blutter](https://github.com/worawit/blutter) | 脚本 | 跨平台 | 开源 | 从 `libapp.so` 恢复 Dart 对象池与函数符号，输出 `dump.dart` 和按类拆分的伪代码 |
| [reFlutter](https://github.com/ptswarm/reFlutter) | 补丁工具 | 跨平台 | MIT | 改写 `libflutter.so` 以便抓流量/调试，偏动态分析 |

```shell
python3 blutter.py path/to/lib/arm64 out_dir
```

要点：Flutter AOT 快照（`.so`）无法还原 Dart 源码，Blutter 的产出是带符号的伪代码，价值在于把「一堆匿名函数」变成「`package:xxx` 下的可读调用」。

### WebAssembly

| 工具 | 形态 | 平台 | 授权 | 说明 |
|---|---|---|---|---|
| [wabt](https://github.com/WebAssembly/wabt) | CLI | 跨平台 | Apache-2.0 | `wasm-decompile` 出 C 风格伪代码，`wasm2wat` 出文本格式，`wasm-objdump` 看段结构 |
| Ghidra / IDA | GUI | 跨平台 | 见上 | 新版均已支持 wasm，适合分析复杂逻辑 |

```shell
wasm-decompile app.wasm -o app.dcmp
wasm2wat app.wasm -o app.wat
wasm-objdump -x -d app.wasm | head -50
```

要点：`wit-bindgen` / Rust→wasm 会保留 `name` 自定义段，`wasm-objdump -x` 里的导出名往往是最高价值信息。

### 其他语言

| 语言 | 工具 | 说明 |
|---|---|---|
| Erlang / Elixir | `beam_lib:chunks(File, [abstract_code])`、`erts_debug:df/1` | `.beam` 通常保留 `abstract_code`，可直接拿到近乎原始的 Erlang AST |
| Delphi / Pascal | [IDR](https://github.com/crypto2011/IDR) | 还原 Delphi 窗体（DFM）与 RTTI，配合 IDA 读代码 |
| Visual Basic 6 | [VB Decompiler](https://www.vb-decompiler.org/) | 商业工具，能还原窗体与部分 P-Code 逻辑 |
| PHP | ionCube / Zend Guard 专用解码器、`php -d opcache.opt_debug_level` | PHP 是解释型，所谓反编译多为「解码商业加密 + 读 opcache 字节码」 |
| Solidity / EVM | 区块链浏览器内置反编译器、heimdall-rs | 只有字节码时用 EVM 反编译，得到的是控制流而非 Solidity 源码 |

## 四、标准工作流

### 流程 1：Android APK

```shell
unzip app.apk -d raw                 # 1. 看结构：classes*.dex、resources.arsc、lib/
jadx -d src app.apk                  # 2. 反编译 dex 到 Java/Kotlin
apktool d app.apk -o res             # 3. 解资源与 AndroidManifest.xml
# 4. 加固壳 -> Frida/BlackDex 脱壳 -> 回到步骤 2
```

### 流程 2：.NET 程序集

```shell
file Foo.dll                                    # 判断是否 .NET（含 IL）/ NativeAOT
ilspycmd -p -o src Foo.dll                      # 直接反编译成工程
de4dot.exe Foo.dll -o Foo.clean.dll             # 若被混淆：先脱再反编译
```

### 流程 3：Python 打包程序

```shell
python pyinstxtractor.py app.exe        # 1. 解出 PYZ / pyc
# 2. 修正 pyc 头 16 字节 magic（按解包出的 Python 版本）
pycdc main.pyc > main.py                # 3. 反编译；失败则 pycdas 读字节码
```

### 流程 4：Go / Rust / C++ 二进制

```shell
file ./app && strings -n 8 ./app | head -50   # 1. 判断架构、编译器、可疑字符串
GoReSym -t -d ./app > app.json                # 2. Go 才有：恢复符号
nm -C ./app | head                            # 3. 有符号则先读符号表
# 4. 载入 Ghidra/IDA，按字符串交叉引用定位 main/关键函数，读伪代码
```

## 五、先做这四件事，能省一半时间

1. **`file` + `strings`**：判断架构、是否 `strip`、是否加壳、有没有硬编码 URL/密钥。
2. **判断编译器/运行时**：Go（`Go build ID`、`runtime.goexit`）、Rust（`rustc`、`core::panic`）、.NET（`BSJB` 签名）、Java（`CAFEBABE`）、Python（`pyc` magic）。
3. **先脱壳再静态分析**：UPX 用 `upx -d`，Android 用脱壳机，.NET 用 de4dot，JS 用 webcrack。
4. **动态优先**：`strace`/`ltrace`、Frida、x64dbg 断点观察，往往比读几千行伪代码更快。

## 六、合规与边界

- 仅对**自有软件、获得书面授权的软件、CTF 题目、公开的互操作性研究**做反编译。
- 商业软件 EULA 通常明文禁止反向工程；绕过技术措施在多数司法辖区（如 DMCA §1201、中国《著作权法》技术措施条款）属独立违法行为，与「是否盈利」无关。
- 逆向得出的接口信息用于互操作时，注意区分「思想/接口」与「表达」，后者仍受著作权保护。
- 生产环境排查性能或崩溃时，优先要符号文件（`.pdb` / `.dSYM` / 未 `strip` 的二进制），这比反编译划算得多。

## 七、反-反编译（防护侧）

> 没有「不可反编译」，只有「不划算」。所有手段的目标都是把逆向成本推到高于资产本身的价值——这是评估防护方案时唯一的判断标准。

### 1）技术原理：三条思路、六个层级

| 层级 | 手段 | 原理 | 强度 | 成本 |
|---|---|---|---|---|
| 1 | `strip` 去符号 / 关闭调试信息 | 删掉函数名、变量名、行号表 | ★☆☆☆☆ | 几乎为零 |
| 2 | 名称混淆（重命名类/方法/字段） | 让 `calculatePremium()` 变成 `a.b()`，语义信息归零 | ★★☆☆☆ | 低，但要留 mapping |
| 3 | 字符串加密 + 常量还原 | 字符串只以密文存在，运行时解密到栈上 | ★★★☆☆ | 低 |
| 4 | 控制流混淆 / 流程平坦化 | 把 `if/else` 打散成 `while + switch` 状态机，反编译出来读不通 | ★★★☆☆ | 中，性能下降明显 |
| 5 | 加壳 / 整体加密 | 磁盘上只有密文，启动时才解密还原到内存 | ★★★★☆ | 高，且被杀软误杀 |
| 6 | 代码虚拟化（VM） | 目标架构指令翻译成私有 VM 字节码，连反汇编都没有 | ★★★★★ | 极高，性能 5-20× 下降 |
| + | 反调试 / 完整性校验（RASP） | 检测 `ptrace`、Frida、调试端口，自校验失败即退出 | ★★☆☆☆ | 中，易误伤正常环境 |

一句话记住要害：**第 2 到第 6 层全都依赖「运行时必须还原成可执行形态」**，所以通用的破解路径也一样统一——在解密/还原之后 dump 内存，再对 dump 结果做反编译。真正改变博弈的只有两条：**核心逻辑外置到服务端**，或**绑定硬件/授权中心**。

### 2）各语言可用工具

| 工具 | 语言 / 产物 | 手段 | 授权 | 说明 |
|---|---|---|---|---|
| [ProGuard](https://www.guardsquare.com/proguard) | Java / Android | 混淆 + 裁剪 + 优化 | GPL-2.0 | JVM 侧基线，配套 `mapping.txt` 用于崩溃还原 |
| R8 | Java / Android | 混淆 + 收缩（AGP 内置） | 随 Android Gradle Plugin | `minifyEnabled true` 即启用，现已取代 ProGuard |
| Zelix KlassMaster | Java | 字符串加密 + 控制流混淆 | 商业 | 比 ProGuard 强一档，商业 Java 软件常见 |
| [ConfuserEx](https://github.com/yck1509/ConfuserEx) | .NET | 改名 + 控制流 + 常量加密 | MIT | .NET 开源首选，反制工具就是 de4dot |
| .NET Reactor / Dotfuscator | .NET | 加壳 + 虚拟化 + 授权 | 商业 | 商业强度，Dotfuscator 随 VS 提供社区版 |
| [Nuitka](https://nuitka.net/) | Python | 编译成原生二进制 | Apache-2.0 | 不是混淆而是消除 `.pyc`，把问题降级成 C 逆向 |
| PyArmor | Python | 字节码加密 + 运行时校验 | 商业（有试用） | Python 侧唯一的成体系方案，但 loader 本身就是突破口 |
| Cython | Python | 编译为 C 扩展 | Apache-2.0 | 适合只保护少量核心模块 |
| [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator) | JS | 字符串数组 + 控制流平坦化 | BSD-2-Clause | 免费方案里最实用，反制工具是 webcrack |
| Jscrambler | JS | 混淆 + 自防御 + 域名锁 | 商业 | 商业 JS 防护标杆 |
| bytenode | JS / Node.js | 编译为 V8 字节码 | MIT | 门槛低但不加密，`bytenode --decode` 即可还原 |
| [garble](https://github.com/burrowers/garble) | Go | 符号与字符串混淆 | 开源 | 唯一实用的 Go 方案，`-literals` 连字符串一起抹 |
| `strip` + [UPX](https://upx.github.io/) | C / C++ / Go | 去符号 + 压缩壳 | GPL-2.0+ | 防线最薄的一层，`upx -d` 直接脱 |
| VMProtect / Themida | 原生二进制 | 虚拟化 + 反调试 | 商业 | 强度最高的一档，代价是性能与兼容性 |
| O-MVLL / Obfuscator-LLVM | 原生二进制 | 编译期插入混淆 | Apache-2.0 / 开源分支 | 从 LLVM 后端做，比壳更自然 |
| 梆梆 / 爱加密 / 乐固 | Android | DEX 加壳 + 反调试 | 商业 | 国内 App 标配，对抗的是脱壳机 |

### 3）命令示例

```shell
# Java / Android：打开混淆与资源收缩（务必归档 mapping.txt）
./gradlew assembleRelease     # minifyEnabled true / shrinkResources true

# .NET
Confuser.CLI.exe -n confuser.crproj

# Python：消除 pyc + 加密字节码
nuitka --standalone --onefile app.py
pyarmor gen app.py

# JavaScript / Node
npx javascript-obfuscator in.js --output out.js --control-flow-flattening true
npx bytenode -c app.js

# Go：符号 + 字符串一起混淆
garble -literals -tiny build ./...

# 原生二进制：去符号 + 加壳
strip --strip-all app && upx --best --lzma app
```

### 4）落地取舍

- **先做 `strip` 和名称混淆**：零成本、零风险，能挡掉 90% 的「随手看看」。
- **混淆必须回归测试**：反射、序列化、注解扫描、Spring 组件扫描最容易被打断；Android 要逐条补 `-keep` 规则。
- **`mapping.txt` 必须归档**：否则线上崩溃栈全是 `a.b.c`，混淆等于自残可观测性。
- **反调试别上瘾**：过度反调试在用户机器上表现为闪退、杀软误报，口碑损失大于防护收益。
- **真正的护城河是外置逻辑**：定价规则、推荐算法、License 校验放服务端，客户端只留展示与调用，这是唯一不依赖「破解者不够努力」的方案。

## Reference

- [Ghidra](https://github.com/NationalSecurityAgency/ghidra)
- [GoReSym](https://github.com/mandiant/GoReSym)
- [Vineflower](https://github.com/Vineflower/vineflower)
- [jadx](https://github.com/skylot/jadx)
- [dnSpyEx](https://github.com/dnSpyEx/dnSpy)
- [ILSpy](https://github.com/icsharpcode/ILSpy)
- [pycdc (decompyle++)](https://github.com/zrax/pycdc)
- [webcrack](https://github.com/j4k0xb/webcrack)
- [redress](https://github.com/goretk/redress)
- [Blutter](https://github.com/worawit/blutter)
- [unluac](https://github.com/HansWessels/unluac)
- [wabt (wasm-decompile)](https://github.com/WebAssembly/wabt)
- [RetDec](https://github.com/avast/retdec)
- [Cutter / rizin](https://cutter.re/)
- [Snowman](https://github.com/yegord/snowman)

防护侧：

- [ProGuard](https://www.guardsquare.com/proguard)
- [ConfuserEx](https://github.com/yck1509/ConfuserEx)
- [Nuitka](https://nuitka.net/)
- [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator)
- [garble](https://github.com/burrowers/garble)
- [UPX](https://upx.github.io/)
- [O-MVLL](https://github.com/open-obfuscator/o-mvll)
