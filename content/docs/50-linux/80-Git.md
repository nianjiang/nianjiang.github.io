---
weight: 80
title: "Git Commands"
---

# Git 常用命令手册

> 本文整理日常开发与运维中高频使用的 Git 命令，按操作场景分类，涵盖基础配置、分支管理、提交回退、远程协作、变基合并、标签、日志查看、暂存、补丁及仓库维护等方面，适合作为速查手册。

---

## 1. 基础配置

首次使用 Git 前需要配置用户信息和常用别名。

```bash
# 设置全局用户名和邮箱（写入 ~/.gitconfig）
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 设置默认编辑器
git config --global core.editor "vim"

# 设置默认分支名
git config --global init.defaultBranch master

# 启用彩色输出
git config --global color.ui auto

# 常用别名（写入 ~/.gitconfig）
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.last "log -1 HEAD"
git config --global alias.unstage "reset HEAD --"

# 查看当前所有配置
git config --list

# 凭证缓存（避免每次推送输入密码）
git config --global credential.helper store        # 永久保存（明文，慎用）
git config --global credential.helper 'cache --timeout=86400'  # 缓存 24 小时
```

---

## 2. SSH 密钥配置

使用 SSH 协议推拉代码免密码，推荐为每个 Git 托管平台生成独立密钥。

```bash
# 生成 Ed25519 密钥（推荐，安全性高、速度快）
ssh-keygen -t ed25519 -C "you@example.com" -f ~/.ssh/id_ed25519_github

# 生成 RSA 密钥（兼容性最好，部分老系统仍需要）
ssh-keygen -t rsa -b 4096 -C "you@example.com" -f ~/.ssh/id_rsa_github

# 查看公钥内容（复制到 GitHub / GitLab / Gitee 的 SSH Keys 设置页）
cat ~/.ssh/id_ed25519_github.pub

# 将私钥添加到 ssh-agent（避免每次输入 passphrase）
eval "$(ssh-agent -s)"            # 启动 ssh-agent
ssh-add ~/.ssh/id_ed25519_github

# macOS：将密钥自动添加到 ssh-agent（写入 ~/.ssh/config）
# Host *
#   AddKeysToAgent yes
#   UseKeychain yes
```

### SSH Config 多主机示例

当同时使用 GitHub、GitLab、Gitee 等多个平台时，在 `~/.ssh/config` 中为每个主机配置独立密钥：

```
# GitTee
Host gitee.com
Hostname gitee.com
PreferredAuthentications publickey
IdentityFile ~/.ssh/id_ed25519_github
```

```bash
# 测试 SSH 连接
ssh -T git@github.com
ssh -T git@gitlab.company.com
ssh -T git@gitee.com
```

> **提示**：`IdentitiesOnly yes` 确保 ssh 只使用指定的密钥，避免因 ssh-agent 中加载了多把密钥导致认证失败。

---

## 3. 仓库初始化与克隆

```bash
# 在当前目录初始化新仓库
git init

# 在指定目录初始化新仓库
git init /path/to/project

# 克隆远程仓库（默认分支）
git clone https://github.com/user/repo.git

# 克隆到指定目录
git clone https://github.com/user/repo.git my-project

# 浅克隆（只拉取最近 N 次提交，适合 CI 或大仓库）
git clone --depth 1 https://github.com/user/repo.git

# 克隆指定分支
git clone -b <branch> https://github.com/user/repo.git

# 克隆后自动设置上游仓库（Fork 工作流）
git clone https://github.com/your-fork/repo.git
cd repo
git remote add upstream https://github.com/original/repo.git
```

---

## 4. 基本操作：add / commit / status

```bash
# 查看工作区和暂存区状态（推荐简写）
git status
git status -s            # 短格式输出

# 添加文件到暂存区
git add <file>           # 添加单个文件
git add <dir>/           # 添加整个目录
git add .                # 添加所有变更（含新增、修改、删除）
git add -u               # 只添加已跟踪文件的修改和删除（不含新增）
git add -A               # 等同于 git add .
git add -p <file>        # 交互式选择文件中的部分 hunk 加入暂存区

# 提交变更
git commit -m "feat: add user login API"
git commit -am "fix: resolve null pointer"    # 跳过 add，直接提交已跟踪文件的修改
git commit --amend                            # 修改上一次提交（消息或内容）
git commit --amend --no-edit                  # 只修改内容，保留原提交消息
git commit --allow-empty -m "trigger CI"      # 创建一个空提交
```

### 提交消息规范（Conventional Commits）

| 前缀 | 含义 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: add user login API` |
| `fix` | 修复 Bug | `fix: resolve null pointer in auth` |
| `docs` | 文档变更 | `docs: update README` |
| `style` | 代码格式（不影响逻辑） | `style: format with gofmt` |
| `refactor` | 重构（非新功能、非修复） | `refactor: extract auth middleware` |
| `perf` | 性能优化 | `perf: add cache for user query` |
| `test` | 添加或修改测试 | `test: add unit tests for login` |
| `chore` | 构建 / 工具链 / 依赖 | `chore: bump k8s.io/api to v0.28` |
| `ci` | CI/CD 配置变更 | `ci: add GitHub Actions workflow` |

---

## 5. 分支管理

```bash
# 查看本地分支（* 标记当前分支）
git branch
git branch -v            # 显示各分支最后一次提交
git branch -a            # 显示本地 + 远程分支
git branch -r            # 只显示远程分支
git branch --merged      # 查看已合并到当前分支的分支
git branch --no-merged   # 查看未合并的分支

# 创建分支
git branch <branch>
git branch <branch> <commit>   # 从指定 commit 创建分支

# 切换分支
git checkout <branch>
git switch <branch>             # Git 2.23+ 推荐
git checkout -b <branch>        # 创建并切换（等同 branch + checkout）
git switch -c <branch>          # Git 2.23+ 创建并切换

# 重命名分支
git branch -m <old-name> <new-name>
git branch -m <new-name>        # 重命名当前分支

# 删除分支
git branch -d <branch>          # 删除已合并的分支（安全）
git branch -D <branch>          # 强制删除（未合并也删，慎用）

# 删除远程分支
git push origin --delete <branch>

# 跟踪远程分支
git branch --set-upstream-to=origin/<branch> <local-branch>
git branch -u origin/<branch>
```

---

## 6. 远程仓库操作

```bash
# 查看远程仓库
git remote
git remote -v                    # 显示远程 URL

# 添加远程仓库
git remote add origin https://github.com/user/repo.git
git remote add upstream https://github.com/original/repo.git

# 修改远程 URL
git remote set-url origin https://github.com/user/new-repo.git

# 删除远程仓库
git remote remove origin

# 拉取远程更新
git fetch origin                 # 只拉取，不合并
git fetch --all                  # 拉取所有远程
git fetch --prune                # 拉取并删除远程已删除的分支引用

# 拉取并合并（fetch + merge）
git pull
git pull origin master
git pull --rebase origin master  # 拉取并变基（推荐，保持线性历史）

# 推送到远程
git push origin <branch>
git push -u origin <branch>      # 首次推送并设置上游跟踪
git push --force                 # 强制推送（慎用，会覆盖远程历史）
git push --force-with-lease      # 安全强制推送（远程有新提交时拒绝）
git push --all                   # 推送所有本地分支
git push --tags                  # 推送所有标签

# 查看远程分支的详细信息
git remote show origin
```

---

## 7. 查看历史与日志

```bash
# 基本日志
git log
git log --oneline                # 单行显示
git log --oneline -20            # 最近 20 条
git log --oneline --graph --all  # 图形化分支历史
git log --stat                   # 显示每次提交的文件变更统计
git log -p                       # 显示每次提交的具体 diff
git log -p -1                    # 只显示最近一次提交的 diff

# 按条件过滤
git log --author="username"      # 按作者
git log --since="2024-01-01"     # 按时间（之后）
git log --until="2024-06-01"     # 按时间（之前）
git log --grep="fix"             # 按提交消息关键字
git log -- <file>                # 查看某个文件的提交历史
git log -S "function_name"       # 查看引入/删除某段代码的提交

# 查看谁修改了文件的每一行
git blame <file>
git blame -L 10,20 <file>        # 只查看第 10~20 行

# 查看引用日志（所有 HEAD 移动记录，含 reset/checkout）
git reflog
git reflog --all

# 查看两个分支/提交之间的差异
git log main..feature            # feature 有而 main 没有的提交
git log main...feature           # 两边各自的提交（对称差集）

# 查看某个提交的详细信息
git show <commit>
git show HEAD
git show HEAD~1                  # 上上次提交
```

---

## 8. diff 比较

```bash
# 工作区 vs 暂存区
git diff

# 暂存区 vs 最新提交
git diff --cached                # 或 git diff --staged

# 工作区 vs 最新提交
git diff HEAD

# 两个提交之间的差异
git diff <commit1> <commit2>

# 两个分支之间的差异
git diff main..feature
git diff main...feature

# 只比较某个文件
git diff HEAD -- path/to/file

# 只显示文件名
git diff --name-only
git diff --name-status           # 文件名 + 状态（A/M/D/R）

# 单词级 diff（适合文档）
git diff --word-diff
```

---

## 9. 撤销与回退

| 场景 | 命令 | 说明 |
|------|------|------|
| 撤销工作区的修改 | `git checkout -- <file>` | 恢复到暂存区状态 |
| 撤销工作区的修改（Git 2.23+） | `git restore <file>` | 更语义化的替代命令 |
| 取消暂存 | `git reset HEAD <file>` | 文件回到工作区 |
| 取消暂存（Git 2.23+） | `git restore --staged <file>` | 更语义化的替代命令 |
| 撤销上一次 commit（保留修改） | `git reset --soft HEAD~1` | 修改回到暂存区 |
| 撤销上一次 commit（保留修改在工作区） | `git reset HEAD~1` | 默认 --mixed |
| 彻底回退到某次提交 | `git reset --hard <commit>` | **危险：丢弃所有后续修改** |
| 创建一个"反向提交"来撤销 | `git revert <commit>` | 安全，适合已推送的提交 |
| 撤销合并 | `git revert -m 1 <merge-commit>` | `-m 1` 指定保留的主线 |

```bash
# 常见回退示例
git reset --soft HEAD~1          # 撤 commit，改的内容还在暂存区
git reset --hard origin/master   # 本地 master 强制对齐远程（丢弃本地修改）
git revert HEAD                  # 创建一个新提交来撤销上一次提交
git revert <commit>              # 撤销指定提交
git revert --no-commit HEAD~3..HEAD  # 批量撤销但不自动提交
```

> **reset vs revert**：`reset` 改写历史（适合本地未推送的提交），`revert` 生成新提交来抵消旧提交（适合已推送的提交）。

---

## 10. 合并与变基

### 合并（Merge）

```bash
# 将 feature 分支合并到当前分支
git merge feature

# 合并时生成合并提交（即使可以快进）
git merge --no-ff feature

# 中止合并
git merge --abort

# 查看合并冲突
git status                       # 冲突文件标记为 Unmerged
git diff --name-only --diff-filter=U  # 只列出冲突文件
```

### 变基（Rebase）

```bash
# 将当前分支的提交重新应用到目标分支之上
git rebase main                  # 当前分支变基到 main
git rebase -i HEAD~5             # 交互式变基（整理最近 5 次提交）
git rebase --continue            # 解决冲突后继续
git rebase --skip                # 跳过当前提交
git rebase --abort               # 中止变基
```

### 交互式变基常用操作

在 `git rebase -i` 打开的编辑器中，每行一个提交（从旧到新）：

| 命令 | 作用 |
|------|------|
| `pick` / `p` | 保留该提交（默认） |
| `reword` / `r` | 保留提交但修改消息 |
| `edit` / `e` | 暂停在该提交，允许修改内容 |
| `squash` / `s` | 合并到前一个提交（保留消息） |
| `fixup` / `f` | 合并到前一个提交（丢弃消息） |
| `drop` / `d` | 删除该提交 |

> **黄金法则**：**不要对已经推送到公共仓库的提交做 rebase**。Rebase 会改写历史，影响其他协作者。

---

## 11. Cherry-pick：摘取提交

```bash
# 将某个提交应用到当前分支
git cherry-pick <commit>

# 摘取多个提交
git cherry-pick <commit1> <commit2>

# 摘取一个范围（不含 start，含 end）
git cherry-pick <start>..<end>

# 只应用修改，不自动提交
git cherry-pick --no-commit <commit>

# 解决冲突后继续
git cherry-pick --continue
git cherry-pick --abort          # 中止
```

---

## 12. Stash：临时保存工作区

```bash
# 保存当前工作区（已跟踪文件）
git stash
git stash save "wip: feature X"  # 带描述信息

# 保存未跟踪的文件
git stash -u                     # 包含 untracked
git stash --all                  # 包含 untracked + ignored

# 查看 stash 列表
git stash list

# 恢复 stash
git stash pop                    # 恢复最近一个并删除
git stash apply                  # 恢复最近一个但保留在列表中
git stash pop stash@{2}          # 恢复指定 stash

# 查看 stash 的 diff
git stash show stash@{0}
git stash show -p stash@{0}     # 显示完整 diff

# 删除 stash
git stash drop stash@{0}         # 删除指定
git stash clear                  # 清空所有
```

---

## 13. 标签管理

```bash
# 查看标签
git tag
git tag -l "v1.*"                # 按模式过滤

# 创建轻量标签
git tag v1.0.0

# 创建附注标签（推荐，包含作者、日期、消息）
git tag -a v1.0.0 -m "Release v1.0.0"

# 对历史提交打标签
git tag -a v0.9.0 -m "Beta release" <commit>

# 删除标签
git tag -d v1.0.0                # 本地删除
git push origin --delete v1.0.0  # 远程删除

# 推送标签到远程
git push origin v1.0.0           # 推送单个标签
git push --tags                  # 推送所有标签

# 查看标签详情
git show v1.0.0
```

---

## 14. 补丁与归档

```bash
# 生成补丁文件（最近 3 次提交）
git format-patch -3

# 生成两个版本之间的补丁
git format-patch v1.0.0..v1.1.0

# 应用补丁
git apply 0001-fix-bug.patch     # 不创建提交
git am 0001-fix-bug.patch        # 应用并创建提交（保留作者信息）

# 生成 diff 补丁（不含提交信息）
git diff main..feature > feature.patch

# 归档（导出指定版本的源码压缩包）
git archive --format=zip HEAD > source.zip
git archive --format=tar.gz --prefix=project-v1.0.0/ v1.0.0 > project-v1.0.0.tar.gz
```

---

## 15. 清理与维护

```bash
# 清理未跟踪的文件（预览，不实际删除）
git clean -n                     # dry-run
git clean -f                     # 强制删除未跟踪文件
git clean -fd                    # 删除未跟踪文件和目录
git clean -fx                    # 删除未跟踪文件 + .gitignore 中的文件

# 压缩对象库（减少仓库体积）
git gc --aggressive --prune=now

# 检查对象库完整性
git fsck

# 查找大文件（排查仓库膨胀原因）
git rev-list --objects --all | \
  git cat-file --batch-check='%(objectsize:human) %(objectname) %(rest)' | \
  sort -rh | head -20

# 从历史中彻底删除某个文件（含所有提交记录）
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch <file>' \
  --prune-empty -- --all
# 或使用更高效的 git-filter-repo（需额外安装）
git filter-repo --path <file> --invert-paths
```

> **注意**：`filter-branch` / `filter-repo` 会改写历史，执行前务必备份，并确保团队所有成员重新 clone。

---

## 16. 实用技巧

### 查看文件变更历史

```bash
# 查看某个文件的完整提交历史
git log --follow -p -- path/to/file

# 查看某个函数/方法的变更历史
git log -L :function_name:path/to/file
```

### 临时切换分支（不提交当前修改）

```bash
git stash
git checkout other-branch
# ... 完成其他分支的工作 ...
git checkout -                  # 切回上一个分支
git stash pop
```

### 找回误删的提交

```bash
# 通过 reflog 找到丢失的提交
git reflog
git cherry-pick <lost-commit>
# 或
git reset --hard <lost-commit>
```

### 比较分支差异摘要

```bash
# 列出 feature 分支相对 main 的所有新增/修改文件
git diff --stat main..feature
```

### 将多个提交合并为一个

```bash
# 方法一：soft reset
git reset --soft HEAD~3          # 回退 3 次提交，修改保留在暂存区
git commit -m "squash: combine 3 commits"

# 方法二：交互式变基
git rebase -i HEAD~3             # 将后两个 pick 改为 squash
```

### 查看某段时间内的提交统计

```bash
# 按作者统计提交数量
git shortlog -sn --since="2024-01-01"

# 按作者统计提交数量 + 增删行数
git shortlog -sne --since="2024-01-01"
```

---

## 速查表

| 类别 | 常用命令 |
|------|----------|
| **SSH 密钥** | `ssh-keygen -t ed25519`, `ssh-add`, `~/.ssh/config` |
| **配置** | `git config --global user.name/email`, `git config --global alias.*` |
| **初始化** | `git init`, `git clone`, `git remote add` |
| **基本操作** | `git status`, `git add`, `git commit`, `git diff` |
| **分支** | `git branch`, `git checkout`, `git switch`, `git merge`, `git rebase` |
| **远程** | `git fetch`, `git pull`, `git push`, `git remote` |
| **历史** | `git log`, `git show`, `git blame`, `git reflog` |
| **撤销** | `git reset`, `git revert`, `git restore`, `git checkout --` |
| **暂存** | `git stash`, `git stash pop`, `git stash list` |
| **标签** | `git tag`, `git push --tags` |
| **清理** | `git clean`, `git gc`, `git fsck` |

---

#### Reference

[Git 官方文档](https://git-scm.com/doc)

[Git Pro 中文版](https://git-scm.com/book/zh/v2)

[Conventional Commits 规范](https://www.conventionalcommits.org/zh-hans/)

[Git Cheat Sheet](https://training.github.com/downloads/github-git-cheat-sheet.pdf)

[GitHub CLI 文档](https://cli.github.com/manual/)

[Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)