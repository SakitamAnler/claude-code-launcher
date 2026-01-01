# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ccl** (Claude Code Launcher) is a CLI tool that enables switching between multiple AI model providers for Claude Code. It allows users to interactively select from different model providers (GLM-4.7, MiniMax-M2.1, DeepSeek-3.2, Kimi-K2, Qwen3-Coder) and launch Claude Code with the selected provider.

## Commands

```bash
# Development
bun run src/index.ts        # Run the application
bun --watch run src/index.ts # Development mode with watch

# Building binaries for all platforms
bun run build:all           # Build all platforms (linux/x64, darwin/arm64, darwin/x64, win32/x64)
bun run build:win32:x64     # Build Windows only
bun run build:linux:x64     # Build Linux only
bun run build:darwin:arm64  # Build macOS ARM only
bun run build:darwin:x64    # Build macOS x64 only
bun run build:release       # Build release targets

# Testing
bun test
```

## Architecture

### Entry Point
- [src/index.ts](src/index.ts) - Main application entry, handles CLI args parsing, provider selection UI, and launch mode selection

### Core Modules
- [src/utils.ts](src/utils.ts) - Utility functions including:
  - `loadConfig()` - Loads/creates `ccl.config.json`, includes default provider configurations
  - `UI.printTitle()` - Prints pre-generated ASCII art title (no FIGlet dependency)
  - `providerToEnvVars()` - Converts provider config to environment variables
  - `launchClaudeCode()` - Spawns Claude Code with proper environment
  - `applyProviderToSettings()` - Writes provider config to `~/.claude/settings.json`

### Configuration
- [src/ccl.config.json](src/ccl.config.json) - Default configuration template with all supported providers

### Build System
- [scripts/build.ts](scripts/build.ts) - Bun build script that:
  1. Injects version from `package.json` into `src/utils.ts`
  2. Compiles TypeScript to native binaries using `bun build --compile`
  3. Outputs to `dist/{platform}/{arch}/` directory

### NPM Package Structure
The project uses a monorepo structure for NPM distribution:
- `packages/installer/` - Main CLI installer package (`sakitamanler-ccl-launcher`)
- `packages/win32-x64/` - Windows native binary package (`sakitamanler-ccl-win32`)

## Key Design Patterns

1. **Pre-generated ASCII Art** - Title is pre-generated as a template literal in `ART_TITLE` to avoid FIGlet font path issues across platforms

2. **Provider Configuration** - Each model provider is defined in `loadConfig()` with:
   - `base_url` - Anthropic-compatible API endpoint
   - `auth_token` - API key environment variable name
   - `model` / `small_fast_model` - Model identifiers
   - `claude_code_disable_nonessential_traffic` - Traffic control setting

3. **Launch Modes**:
   - **Temporary** - Uses environment variables, exits after Claude Code closes
   - **Permanent** - Writes to `~/.claude/settings.json`, persists across sessions

4. **Color Scheme** - Uses RGB colors for terminal UI:
   - Coral: `rgb(255, 147, 115)` (#ff9373)
   - Terracotta: `rgb(214, 124, 97)` (#d67c61)

## Model Providers

| Provider | API Endpoint | Notes |
|----------|--------------|-------|
| GLM-4.7 | `https://open.bigmodel.cn/api/anthropic` | Default provider |
| MiniMax-M2.1 | `https://api.minimaxi.com/anthropic` | |
| DeepSeek-3.2 | `https://api.deepseek.com/anthropic` | Supports thinking mode |
| Kimi-K2 | `https://api.moonshot.cn/anthropic` | |
| Qwen3-Coder | `https://api-inference.modelscope.cn` | Via ModelScope API |

## Important Notes

- When adding a new provider, update BOTH `src/ccl.config.json` AND `loadConfig()` in `src/utils.ts`
- Keyboard shortcuts 1-5 are automatically assigned to providers in selection UI
- The installer package (`packages/installer/`) depends on platform-specific packages for binaries
