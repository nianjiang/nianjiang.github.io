---
weight: 50
title: "Linux"
bookCollapseSection: true
---


# Linux Notes
> This is my learning Notes for Cloud Native, include Kubernetes/Istio/...

[Linux on Github](https://github.com/torvalds/linux/tree/master)

[GitLab with Git Essentials](https://levelup.gitlab.com/courses/gitlab-with-git-essentials-s2)

[]()

[]()

[]()

[]()

---

### Commands
|  Command Name | Description           | Note          |
| -------- | --------   | -------    |
|  fg / bg      |                       |               |
|               |                       |               |
|               |                       |               |
|               |                       |               |

[Linux command line cheat sheet](https://personales.unican.es/corcuerp/Linux/commands/Bash%20Command%20Reference.html)

---

### Linux 常用信号一览

| N | 名称 | 默认行为 | 含义 |
|--------|------|----------|------|
| 1 | `SIGHUP` | 终止 | 挂起（Hangup）。终端断开连接时发送。常用于通知守护进程**重新加载配置** |
| 2 | `SIGINT` | 终止 | 中断（Interrupt）。用户按 `Ctrl+C` 时发送 |
| 3 | `SIGQUIT` | 终止 + core dump | 退出（Quit）。用户按 `Ctrl+\` 时发送 |
| 4 | `SIGILL` | 终止 + core dump | 非法指令（Illegal Instruction）。程序执行了无效的 CPU 指令 |
| 5 | `SIGTRAP` | 终止 + core dump | 陷阱（Trap）。调试器断点命中时触发 |
| 6 | `SIGABRT` | 终止 + core dump | 异常中止（Abort）。`abort()` 函数触发，通常是程序**主动调用**的异常退出 |
| 7 | `SIGBUS` | 终止 + core dump | 总线错误（Bus Error）。内存对齐错误或映射文件失效 |
| 8 | `SIGFPE` | 终止 + core dump | 浮点异常（Floating Point Exception）。如除以零 |
| 9 | **`SIGKILL`** | 终止（不可捕获/不可忽略） | 强制杀死进程。内核直接处理，进程**无法拦截** |
| 10 | `SIGUSR1` | 终止 | 用户自定义信号 1。无固定语义，由程序自行定义用途 |
| 11 | `SIGSEGV` | 终止 + core dump | 段错误（Segmentation Fault）。访问了非法内存地址 |
| 12 | `SIGUSR2` | 终止 | 用户自定义信号 2。同上，程序自行定义 |
| 13 | `SIGPIPE` | 终止 | 管道破裂（Broken Pipe）。向已关闭的管道/socket 写数据时触发 |
| 14 | `SIGALRM` | 终止 | 定时器超时（Alarm）。`alarm()` 函数设置的定时器到期 |
| 15 | **`SIGTERM`** | 终止 | 优雅终止（Terminate）。请求进程自行退出，进程**可以捕获并处理**（如清理资源后退出） |
| 17 | `SIGCHLD` | 忽略 | 子进程状态变化（停止/退出）。父进程收到此信号表示子进程状态变更 |
| 18 | `SIGCONT` | 继续运行 | 恢复执行。使被暂停的进程继续运行 |
| 19 | `SIGSTOP` | 暂停（不可捕获/不可忽略） | 强制暂停进程。与 SIGKILL 一样**无法拦截** |
| 20 | `SIGTSTP` | 暂停 | 终端停止（Terminal Stop）。用户按 `Ctrl+Z` 时发送，**可捕获** |
| 21 | `SIGTTIN` | 暂停 | 后台进程尝试从终端读取输入 |
| 22 | `SIGTTOU` | 暂停 | 后台进程尝试向终端写入输出 |
| 28 | `SIGWINCH` | 忽略 | 窗口大小变化（Window Change）。终端窗口尺寸改变时通知 |
| 30 | `SIGPWR` | 终止 | 电源故障（Power Failure）。UPS 检测到断电时通知 |
| 31 | `SIGSYS` | 终止 + core dump | 系统调用错误。程序调用了不存在的系统调用 |

#### 按用途分类
                    ┌── SIGKILL (9)  ← 强制，不可拦截
        终止进程 ───┤
                    └── SIGTERM (15) ← 优雅，可拦截
                              SIGINT (2)  ← Ctrl+C
                              SIGHUP (1)  ← 通常用于重载配置

        暂停/恢复 ──┬── SIGSTOP (19) ← 强制，不可拦截
                    └── SIGTSTP (20) ← Ctrl+Z，可拦截
                    └── SIGCONT (18) ← 恢复运行

        程序错误 ───┬── SIGSEGV (11) ← 段错误（最常见）
                    ├── SIGFPE (8)   ← 除零/浮点异常
                    ├── SIGABRT (6)  ← abort() 触发
                    ├── SIGBUS (7)  ← 内存对齐错误
                    └── SIGILL (4)  ← 非法指令

        自定义用途 ─┬── SIGUSR1 (10) ← 程序自行定义
                    └── SIGUSR2 (12) ← 程序自行定义

---

### Reference

https://pkg.go.dev/github.com/docker/libcontainer#section-readme
https://pkg.go.dev/github.com/vishvananda/netns#section-readme
https://pkg.go.dev/github.com/docker/docker/api/types/container

https://dev.to/devopsvn/deep-into-container-build-your-own-container-with-golang-3f5e
https://unixism.net/2020/06/containers-the-hard-way-gocker-a-mini-docker-written-in-go/
https://medium.com/@teddyking/namespaces-in-go-basics-e3f0fc1ff69a






<br/>

## 

