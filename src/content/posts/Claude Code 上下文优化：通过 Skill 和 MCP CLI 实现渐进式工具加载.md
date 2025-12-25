---
title: "Claude Code 上下文优化：通过 Skill 和 MCP CLI 实现渐进式工具加载"
description: "解决 Claude Code 中因加载过多工具导致初始上下文占用过高的问题，介绍并实践渐进式工具使用（Progressive Tool Use）概念。"
published: 2025-12-22
tags: ["claude-code", "context-optimization", "mcp", "efficiency"]
draft: false
---

在Claude Code使用过程中，会配置一些 MCP ，工具的描述信息往往会占用大量的上下文窗口（Context Window）。在会话尚未正式开始前，这些元数据可能就已经消耗了 20% 甚至更多的 token。

为了解决这个问题，我们可以利用 **Skill** 和 **MCP CLI** 两种机制来实现“按需加载”。

## 一、核心概念解析

### 1. Skill（技能）
Skill 与自定义命令在功能上相似，但加载机制不同：
*   **传统命令**：启动时全量加载定义和提示词。
*   **Skill**：启动时仅加载极少量的索引信息。只有当 AI 确实需要执行该任务时，才会动态加载完整的 Skill 上下文。

### 2. MCP CLI（实验性功能）
针对 Model Context Protocol 的高级运行模式：
*   **问题**：标准 MCP 会一次性注入的所有工具定义。如果mcp工具较多（如 `serena mcp`），启动开销巨大。
*   **优化**：启用 MCP CLI 后，Claude Code 仅加载少量元信息。需要时通过 Bash 命令实时查询并调用工具。

## 二、配置指南

目前 MCP CLI 属于实验性功能，需要通过环境变量手动开启。

在你的 Shell 配置文件（如 `~/.zshrc` 或 `~/.bashrc`）中添加以下代码：

```bash
export ENABLE_EXPERIMENTAL_MCP_CLI=true
```

**关键步骤**：添加完成后，请重启终端或执行以下命令使配置生效：

```bash
source ~/.zshrc  # 或对应的配置文件路径
```