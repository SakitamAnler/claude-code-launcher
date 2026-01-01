<div align="center">

# 🚀 Claude Code Launcher (ccl)

### 让 Claude Code 支持多模型切换，轻松使用国产优秀大模型

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E=18.0.0-brightgreen)](https://nodejs.org)
[![npm version](https://img.shields.io/badge/npm-install--global-blue)](https://www.npmjs.com/package/sakitamanler-ccl-launcher)

[English](./README_EN.md) | 简体中文

</div>

---

## 📖 项目简介

`ccl` (Claude Code Launcher) 是一个强大的 Claude Code 模型启动器，让您可以轻松切换使用不同的 AI 模型作为 Claude Code 的后端。

### 💡 二次开发说明

本项目基于以下两个优秀开源项目进行二次开发和优化：

- 🌟 **[claude-code-launcher](https://github.com/FullStackPlayer/claude-code-launcher)** - 核心功能框架，提供多模型切换能力
- 📦 **[ccl-cli](https://github.com/FullStackPlayer/ccl-cli)** - CLI 安装器架构，支持全局命令安装

在原项目基础上，本项目进行了以下改进：

- ✨ 优化了配置管理体验
- 🎨 改进了用户交互界面
- 🔧 增强了跨平台兼容性
- 📚 完善了文档和使用说明

---

## 🎯 为什么需要 ccl？

### Claude Code 的缺憾

在 Coding Agent 领域，**Claude Code** 是当之无愧的王者。但对中国开发者来说，它有两个无法忽视的缺憾：

1. **模型锁定** - 官方只支持 Anthropic 自家的 Claude 系列模型（好用但昂贵）
2. **地域限制** - Anthropic 对中国开发者不够友好

### 国产大模型的崛起

🎉 **好消息是**：2025 年下半年，国产开源编程大模型迎来爆发式发展！

- 🏆 **智谱 GLM** - GLM-4.7 性能卓越
- 🚀 **MiniMax M2** - M2.1 代码能力出色
- 💎 **DeepSeek** - V3.2 物超所值
- 🌙 **Kimi K2** - 思考链模型独具特色

更重要的是，这些厂商都**官方提供了 Anthropic 兼容 API 接口**，并推出了程序员专属套餐！这意味着：

- ✅ 官方下场支持 Claude Code
- ✅ 效果优于第三方适配
- ✅ 价格仅为 Claude 的零头
- ✅ 同步获得官方 BUG 修复

### ccl 的使命

虽然通过环境变量可以切换模型，但每次都要手动设置非常繁琐。**ccl 应运而生**，让模型切换变得丝滑顺畅：

- 🎯 一条命令切换不同模型
- 🖥️ 美观的交互式选择界面
- ⚙️ 灵活的配置文件管理
- 📦 支持单次请求快速输出

---

## ✨ 功能特点

| 特性 | 说明 |
|:---:|:---|
| 🤖 | **多模型支持** - GLM-4.7、MiniMax-M2.1、DeepSeek-3.2、Kimi-K2 |
| 🎨 | **交互式 TUI** - 美观的选择界面，体验丝滑 |
| ⚡ | **命令行直达** - 支持 `--provider` 参数快速启动 |
| 📝 | **单次请求** - 让 Claude 解答问题并保存结果 |
| 🔄 | **跨平台支持** - Windows、macOS、Linux 全覆盖 |
| 📦 | **全局安装** - 安装成系统命令，随处可用 |
| 🛠️ | **工作目录** - 灵活指定工作路径 |
| ⚙️ | **灵活配置** - JSON 配置文件，一目了然 |

---

## 🚀 快速开始

### 安装

```bash
# 方式一：通过 npm 全局安装（推荐）
npm install -g sakitamanler-ccl-launcher

# 方式二：本地开发
git clone <your-repo-url>
cd claude-code-launcher
bun install
```

### 前置要求

在使用 ccl 之前，请确保已安装：

```bash
# 安装 Node.js（如未安装）
# 访问 https://nodejs.org 下载安装

# 安装 Claude Code
npm install -g @anthropic-ai/claude-code
```

> 💡 **提示**：如果未安装 Claude Code，ccl 会尝试自动为您安装。

### 基本使用

```bash
# 交互式选择模型（推荐新手）
ccl

# 指定模型直接启动
ccl --provider=GLM-4.7

# 查看版本号
ccl --version

# 查看帮助信息
ccl --help

# 显示配置文件路径
ccl --config-file
```

---

## 📋 支持的模型

| Provider | 模型 | 开发商 | 相关文档 |
|:---:|:---:|:---:|:---:|
| **GLM-4.7** | 智谱 GLM-4.7 | 智谱 AI | [查看文档](https://docs.bigmodel.cn/cn/guide/develop/claude) |
| **MiniMax-M2.1** | MiniMax M2.1 | MiniMax | [查看文档](https://platform.minimaxi.com/docs/guides/text-ai-coding-tools) |
| **DeepSeek-3.2** | DeepSeek V3.2 | 深度求索 | [查看文档](https://api-docs.deepseek.com/zh-cn/guides/anthropic_api) |
| **Kimi-K2** | Kimi K2 | 月之暗面 | [查看文档](https://platform.moonshot.cn/docs/guide/agent-support) |

> 💬 **发现新模型**？如果发现其他国产模型也支持 Anthropic API，欢迎提交 PR 告诉我们！

---

## ⚙️ 配置文件

### 首次运行

ccl 首次运行会在可执行文件同级目录下创建 `ccl.config.json` 配置文件。

### 配置说明

```json
{
  "providers": {
    "GLM-4.7": {
      "description": "智谱最新模型",
      "base_url": "https://open.bigmodel.cn/api/anthropic",
      "auth_token": "YOUR_API_KEY_HERE"
    },
    "MiniMax-M2.1": {
      "description": "MiniMax M2.1 模型",
      "base_url": "https://api.minimax.chat/v1",
      "auth_token": "YOUR_API_KEY_HERE"
    },
    "DeepSeek-3.2": {
      "description": "DeepSeek V3.2 模型",
      "base_url": "https://api.deepseek.com",
      "auth_token": "YOUR_API_KEY_HERE"
    },
    "Kimi-K2": {
      "description": "Kimi K2 模型",
      "base_url": "https://api.moonshot.cn/v1",
      "auth_token": "YOUR_API_KEY_HERE"
    }
  },
  "default_provider": "GLM-4.7",
  "additionalOTQP": "请使用中文回答。"
}
```

### 配置项说明

| 配置项 | 说明 |
|:---|:---|
| `providers` | 模型提供商配置 |
| `description` | 模型描述信息 |
| `base_url` | API 基础 URL |
| `auth_token` | API 密钥（需替换为您自己的） |
| `default_provider` | 默认使用的模型 |
| `additionalOTQP` | 全局一次性请求提示词 |

#### 📝 关于 additionalOTQP

`additionalOTQP` (One-Time Query Prompt) 是一个可选的全局配置，允许您定义自定义提示词，它会在每个单次请求时自动追加到用户提示词后面。

**使用场景：**
- 指定回复语言（如"请使用中文回复"）
- 添加特定格式要求
- 设置行为规范

**示例：**
```json
{
  "additionalOTQP": "请使用中文回复，并在回复中包含代码示例。"
}
```

---

## 🎮 命令行参数

### 指令类参数

| 参数 | 说明 |
|:---|:---|
| `--provider=<provider>` | 指定要使用的模型名称（见配置文件） |
| `--prompt=<prompt>` | 指定发送给 Claude Code 的提示词 |
| `--output=<file>` | 指定输出文件路径（单次请求响应保存位置） |
| `--pwd=<path>` | 指定工作目录路径 |

### 响应类参数

| 参数 | 简写 | 说明 |
|:---|:---:|:---|
| `--config-file` | `-cf` | 显示配置文件路径 |
| `--version` | `-v` | 显示版本号 |
| `--help` | `-h` | 显示帮助信息 |

### 🎯 使用示例

```bash
# ===== 交互式使用 =====
# 启动交互式选择界面
ccl

# ===== 指定模型启动 =====
# 使用 GLM-4.7 启动 Claude Code
ccl --provider=GLM-4.7

# 使用 MiniMax-M2.1 启动
ccl --provider=MiniMax-M2.1

# ===== 单次请求（快速问答）=====
# 让 Claude 使用 GLM-4.7 解答问题并保存结果
ccl --provider=GLM-4.7 --prompt="写一个冒泡排序算法" --output=bubble_sort.md

# 指定输出目录（自动创建不存在的目录）
ccl --provider=DeepSeek-3.2 --prompt="解释 React Hooks" --output=docs/react-hooks.md

# ===== 工作目录管理 =====
# 在指定目录下启动 Claude Code
ccl --provider=Kimi-K2 --pwd="../my-project"

# ===== 查看信息 =====
# 查看配置文件路径
ccl --config-file

# 查看版本号
ccl --version
```

---

## 🔧 本地开发

### 开发环境设置

```bash
# 1. 克隆仓库
git clone <your-repo-url>
cd claude-code-launcher

# 2. 安装依赖
bun install

# 3. 开发模式（支持热重载）
bun run dev

# 4. 运行测试
bun test
```

### 构建可执行文件

```bash
# 构建所有平台
bun run build:all

# 构建特定平台
bun run build:win32:x64      # Windows x64
bun run build:linux:x64      # Linux x64
bun run build:darwin:x64     # macOS Intel
bun run build:darwin:arm64   # macOS Apple Silicon
```

### 项目结构

```
claude-code-launcher/
├── .gitignore              # Git 忽略配置
├── .vscode/                # VS Code 编辑器配置
│   └── settings.json       # 编辑器设置
├── DevInstruction.md       # 开发指南
├── Documents/              # 文档目录
│   ├── Releases.md         # 发布日志
│   ├── Requirements.md     # 需求文档
│   └── TechStacks.md       # 技术栈说明
├── LICENSE                 # MIT 开源许可证
├── README.md               # 项目说明文档
├── bun.lock                # Bun 依赖锁文件
├── package.json            # 项目配置文件
├── tsconfig.json           # TypeScript 配置
├── publish.sh              # 发布脚本
├── scripts/                # 构建脚本
│   └── build.ts            # 构建逻辑
├── src/                    # 源代码目录
│   ├── index.ts            # 程序入口
│   ├── types.ts            # 类型定义
│   ├── utils.ts            # 工具函数
│   └── types/
│       └── prompts.d.ts    # prompts 库类型定义
├── test/                   # 测试目录
│   ├── bun-spawn.test.ts   # Bun.spawn 测试
│   ├── command.test.ts     # 命令行参数测试
│   ├── launch.test.ts      # 启动功能测试
│   ├── tty-state.test.ts   # TTY 状态测试
│   └── utils.test.ts       # 工具函数测试
└── packages/               # npm 包目录
    ├── installer/          # 主安装器包
    │   ├── index.js
    │   ├── package.json
    │   └── bin/
    │       └── ccl
    └── win32-x64/          # Windows 子包
        ├── package.json
        └── ccl.exe
```

---

## 📦 发布到 npm

### 准备工作

1. 确保 `package.json` 中的版本号已更新
2. 构建所有平台的可执行文件
3. 测试功能是否正常

### 发布步骤

```bash
# 1. 运行发布脚本
bash publish.sh

# 2. 或手动发布各个包
cd packages/installer
npm publish
cd ../win32-x64
npm publish
```

---
## 📄 License

MIT License

Copyright (c) 2025-present

---

## 📞 联系方式

- 🐛 **问题反馈**：[提交 Issue](https://github.com/your-username/claude-code-launcher/issues)
- 💡 **功能建议**：[提交 Discussion](https://github.com/your-username/claude-code-launcher/discussions)
- 📧 **邮件联系**：your-email@example.com

---

<div align="center">

**如果这个项目对您有帮助，请给个 ⭐ Star 支持一下！**

Made with ❤️ by the Claude Code Launcher Team

</div>
