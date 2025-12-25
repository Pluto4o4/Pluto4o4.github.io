
---
title: "提升 Claude Code 效率：通过 terminal-notifier 实现cc系统级通知"
description: "利用 Claude Code 的 Hook 机制结合 terminal-notifier，在任务中断或需要人工介入时自动发送 macOS 系统通知"
published: 2025-12-25
tags: ["claude-code", "efficiency", "macos", "automation"]
draft: false
---

# 提升 Claude Code 效率：通过 terminal-notifier 实现cc系统级通知

在使用 Claude Code (cc) 执行复杂任务时，我们经常需要等待它完成思考或执行一系列命令。一直盯着终端看非常浪费时间，但如果切出窗口去干别的事，又容易错过需要用户确认（如文件修改、命令执行）的关键节点，导致任务挂起。

可以利用 Claude Code 的 **Hooks** 功能，结合`terminal-notifier` 工具，实现**当 cc 需要你介入时，自动发送系统通知**，让你能安心处理其他事务。

## 一、准备工作

首先，我们需要安装 `terminal-notifier`，这是一个能从命令行发送 macOS 用户通知的轻量级工具。

```bash
brew install terminal-notifier
```

## 二、编写通知脚本

为了更灵活地控制通知样式（如标题、声音、消息折叠），我们编写一个独立的封装脚本。

1. 创建存放脚本的目录（如果不存在）：
   ```bash
   mkdir -p ~/.claude/hooks
   ```

2. 创建脚本 `~/.claude/hooks/notify.sh`：
   ```bash
   #!/bin/bash
   
   # Claude Code 用户操作通知脚本
   # 发送 macOS 系统通知，相同消息会折叠
   
   MESSAGE="${1:-Claude Code 需要您的操作}"
   
   # 基于消息内容生成 group ID，防止多条相同通知刷屏
   GROUP_ID=$(echo -n "$MESSAGE" | md5)
   
   terminal-notifier \
     -message "$MESSAGE" \
     -title "Claude Code" \
     -subtitle "请检查终端" \
     -sound default \
     -group "$GROUP_ID"
   
   exit 0
   ```

3. **关键步骤**：赋予脚本执行权限：
   ```bash
   chmod +x ~/.claude/hooks/notify.sh
   ```

## 三、配置 Hooks

最后，在 Claude Code 的配置文件中启用该脚本。打开配置文件（通常位于 `~/.claude/config.json`），添加以下 Hook 配置：

```json
{
  "hooks": {
    "Stop": [
      {
        "command": "bash ~/.claude/hooks/notify.sh '任务已暂停/结束'",
        "type": "command"
      }
    ],
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "command": "bash ~/.claude/hooks/notify.sh '等待授权操作'",
            "type": "command"
          }
        ]
      }
    ]
  }
}
```

### 配置说明
*   **Stop**: 当 Claude Code 停止执行（如任务完成或出错暂停）时触发。
*   **Notification (permission_prompt)**: 当 Claude Code 遇到需要用户授权的场景（如 `Allow this command?`）时精准触发。