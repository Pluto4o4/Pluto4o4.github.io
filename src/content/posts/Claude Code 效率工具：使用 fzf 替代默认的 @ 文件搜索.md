---
title: "Claude Code 效率工具：使用 fzf 替代默认的 @ 文件搜索"
description: "解决 Claude Code 默认文件引用功能在大型项目中查找困难的问题，通过集成 fzf 和 ripgrep 实现高效的模糊文件搜索。"
published: 2025-12-25
tags: ["claude-code", "fzf", "efficiency", "configuration"]
draft: false
---

Claude Code 默认的文件引用方式（使用 `@` 符号）在处理简单项目时尚可，但在面对目录层级深、文件数量多的大型工程时，其层级式查找体验并不理想。

为了提升效率，我们可以参考社区的实践，利用 `fzf`（命令行模糊搜索神器）结合 `rg`（ripgrep）来接管 Claude Code 的文件建议功能，实现毫秒级的模糊搜索体验。

## 一、前置条件

本方案依赖以下命令行工具，请确保已安装：

*   **rg (ripgrep)**: 用于快速列出文件列表。
*   **fzf**: 用于模糊匹配。
*   **jq**: 用于解析 JSON 输入。

macOS 用户可以通过 Homebrew 安装：
```bash
brew install ripgrep fzf jq
```

## 二、配置指南

### 1. 修改配置文件
在 Claude Code 的配置文件（通常位于 `~/.claude/config.json`）中，添加 `fileSuggestion` 配置块。

```json
{
  "fileSuggestion": {
    "type": "command",
    "command": "~/.claude/scripts/file-suggestion.sh"
  }
}
```

### 2. 创建搜索脚本
创建脚本目录及文件：`~/.claude/scripts/file-suggestion.sh`

```bash
#!/bin/bash
# Custom file suggestion script for Claude Code
# Uses rg + fzf for fuzzy matching and symlink support

# Parse JSON input to get query
QUERY=$(jq -r '.query // ""')

# Use project dir from env, fallback to pwd
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# cd into project dir so rg outputs relative paths
cd "$PROJECT_DIR" || exit 1

{
  # Main search - respects .gitignore, includes hidden files, follows symlinks
  rg --files --follow --hidden . 2>/dev/null

  # Additional paths - include even if gitignored (uncomment and customize)
  # [ -e .notes ] && rg --files --follow --hidden --no-ignore-vcs .notes 2>/dev/null
} | sed 's|^\./||' | sort -u | fzf --filter "$QUERY" | head -15
```

### 3. 赋予执行权限

```bash
mkdir -p ~/.claude/scripts
chmod +x ~/.claude/scripts/file-suggestion.sh
```

完成配置后，在 Claude Code 中输入 `@` 并键入部分文件名，即可体验基于 `fzf` 的快速模糊匹配。
