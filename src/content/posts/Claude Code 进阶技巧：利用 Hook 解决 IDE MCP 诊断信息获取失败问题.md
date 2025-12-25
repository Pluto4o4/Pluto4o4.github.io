---
title: "Claude Code 进阶技巧：利用 Hook 解决 IDE MCP 诊断信息获取失败问题"
description: "针对 Claude Code 调用 IDE MCP 获取诊断信息时只能读取已打开文件的问题，通过 Hook 机制实现文件自动打开，确保诊断功能的稳定性。"
published: 2025-12-25
tags: ["claude-code", "ide-mcp", "automation", "hook", "troubleshooting"]
draft: false
---

在当前 AI 辅助编程的工作流（规划 -> 编码 -> 检查 -> 提交）中，利用 MCP (Model Context Protocol) 直接获取 IDE 的诊断信息（Diagnostics）是提高代码质量的关键一环。

然而，在使用 Claude Code 集成 IntelliJ IDEA 或 VS Code 时，存在一个显著的痛点：**IDE MCP 往往只能获取当前已在编辑器标签页中打开的文件的诊断信息**。对于未打开的文件，请求容易超时或返回空数据。这是受限于 IDE 插件接口的实现机制。

为了解决这个问题，我们可以采用“曲线救国”的方案：利用 Claude Code 的 **Hook** 机制，在 AI 尝试读取诊断信息之前，强制触发系统命令将目标文件在 IDE 中打开。

## 一、配置 Hook

我们需要配置一个 `PreToolUse` 钩子，它的作用是在 AI 执行特定命令（如调用诊断工具）之前拦截并运行我们的脚本。

在 Claude Code 的配置文件（`config.json`）中添加以下配置：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "command": "bash ~/.claude/hooks/open-in-idea.sh",
            "type": "command"
          }
        ]
      }
    ]
  }
}
```

> **注意**：这里的 `matcher` 设置为 `Bash`，是因为在渐进式工具使用场景下，MCP 工具通常通过 `mcp-cli` 命令行包装器调用。如果你直接使用 MCP 工具，可能需要根据实际的 Tool Name 调整 matcher。

## 二、编写自动化脚本

创建脚本 `~/.claude/hooks/open-in-idea.sh`。该脚本负责解析 AI 即将执行的命令，提取文件路径，并调用 IDE 打开它。

```bash
#!/bin/bash
# PreToolUse hook: 在调用 ide/getDiagnostics 前自动打开文件
# 解决 IDE 插件无法读取未打开文件诊断信息的问题

# 调试日志路径
DEBUG_LOG=~/.claude/hooks/open-in-idea-debug.log

# 从 stdin 读取 Claude Code 传递的 JSON 上下文
input=$(cat)

# 记录输入用于调试
echo "===\n$(date) ===" >> "$DEBUG_LOG"
# echo "$input" >> "$DEBUG_LOG" # 调试时可取消注释

# 解析即将执行的命令内容
# 假设 AI 是通过 mcp-cli 调用的，命令格式类似 "mcp-cli call ide/getDiagnostics ..."
command=$(echo "$input" | jq -r '.tool_input.command // empty' 2>>"$DEBUG_LOG")

# 仅当检测到是获取诊断信息的命令时触发
if [[ "$command" == *"mcp-cli call ide/getDiagnostics"* ]]; then
    # 使用 sed 正则提取 file:// 协议后的文件路径
    # 处理可能的转义字符格式
    uri=$(echo "$command" | sed -n 's/.*"uri"[[:space:]]*:[[:space:]]*"file:\/\/\([^"\\]*\).*/\1/p' | head -1)

    if [ -z "$uri" ]; then
        # 尝试匹配双重转义格式
        uri=$(echo "$command" | sed -n 's/.*\\"uri\\"[[:space:]]*:[[:space:]]*\"file:\/\/\([^"\\]*\).*/\1/p' | head -1)
    fi

    echo "Extracted URI: $uri" >> "$DEBUG_LOG"

    if [ -n "$uri" ] && [ -f "$uri" ]; then
        echo "Opening file in IDEA: $uri" >> "$DEBUG_LOG"
        # 使用 macOS 的 open 命令调用 IntelliJ IDEA
        # 如果是 VS Code，可以替换为 "code -r $uri"
        open -a "IntelliJ IDEA.app" "$uri" 2>/dev/null
        
        # 给予 IDE 少量时间加载文件索引
        sleep 1
    else
        echo "File not found or no URI extracted: $uri" >> "$DEBUG_LOG"
    fi
fi

# 退出码 0 表示允许原工具继续执行
exit 0
```

别忘了给脚本添加执行权限：

```bash
chmod +x ~/.claude/hooks/open-in-idea.sh
```
