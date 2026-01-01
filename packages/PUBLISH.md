# 📦 发布指南

本文档说明如何将 Claude Code Launcher 发布到 npm。

## 📋 发布前准备

### 1. 构建可执行文件

首先需要为各个平台构建可执行文件：

```bash
# 在项目根目录执行

# 构建所有平台
bun run build:all

# 或构建特定平台
bun run build:win32:x64      # Windows x64
bun run build:linux:x64      # Linux x64
bun run build:darwin:x64     # macOS Intel
bun run build:darwin:arm64   # macOS Apple Silicon
```

构建完成后，可执行文件会分别打包到各平台的 `zip/` 目录。

### 2. 更新版本号

确保所有 `package.json` 中的版本号一致：

```bash
# 更新主包版本
cd packages/installer
# 修改 package.json 中的 version

# 更新子包版本
cd ../darwin-arm64
# 修改 package.json 中的 version

# 对其他子包重复此操作...
```

## 🚀 发布步骤

### 方式 1：使用发布脚本（推荐）

```bash
# 在项目根目录
bash publish.sh
```

### 方式 2：手动发布

#### 步骤 1：发布平台子包

```bash
# Windows x64
cd packages/win32-x64
npm publish

# macOS Apple Silicon
cd ../darwin-arm64
npm publish

# macOS Intel
cd ../darwin-x64
npm publish

# Linux x64
cd ../linux-x64
npm publish
```

#### 步骤 2：发布主安装器

```bash
cd packages/installer
npm publish
```

## ✅ 验证安装

发布完成后，在新终端测试安装：

```bash
# 清理旧安装（可选）
npm uninstall -g sakitamanler-ccl-launcher

# 全局安装
npm install -g sakitamanler-ccl-launcher

# 测试命令
ccl --version
ccl --help
```

## 🔍 故障排查

### 问题：找不到平台包

**错误信息：** `404 Not Found - sakitamanler-ccl-xxx`

**解决方案：**
1. 确保所有平台子包都已发布
2. 检查包名是否与 `installer/package.json` 中的依赖一致
3. 检查版本号是否匹配

### 问题：可执行文件无法运行

**错误信息：** `找不到可执行文件`

**解决方案：**
1. 确保已运行 `bun run build:all` 构建可执行文件
2. 检查 `zip/` 目录中是否有对应的 zip 文件
3. 查看子包的 `scripts/postinstall.js` 是否正确解压文件

### 问题：权限不足

**错误信息：** `EACCES` 或权限错误

**解决方案：**
```bash
# Windows: 以管理员身份运行终端
# macOS/Linux: 使用 sudo
sudo npm install -g sakitamanler-ccl-launcher
```

## 📝 发布检查清单

- [ ] 所有平台可执行文件已构建
- [ ] 所有 package.json 版本号已更新且一致
- [ ] 已测试本地安装
- [ ] README.md 文档已更新
- [ ] LICENSE 文件已添加
- [ ] .npmignore 已配置（如需要）

## 🎯 当前状态

**已支持平台：**
- ✅ Windows x64 (win32-x64)
- ⏳ macOS Apple Silicon (darwin-arm64) - 需要构建
- ⏳ macOS Intel (darwin-x64) - 需要构建
- ⏳ Linux x64 (linux-x64) - 需要构建

**注意：** 目前只有 Windows 平台有可执行文件，其他平台需要先构建可执行文件才能正常使用。
