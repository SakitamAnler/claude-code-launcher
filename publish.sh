#!/bin/bash

# sakitamanler-ccl 发布脚本
# 用法: ./publish.sh

set -e

echo "================================================"
echo "  sakitamanler Claude Code Launcher 发布脚本"
echo "================================================"
echo ""

# 检查 Bun 是否安装
if ! command -v bun &> /dev/null; then
    echo "错误: Bun 未安装"
    echo "请先安装 Bun: https://bun.sh"
    exit 1
fi

# 获取版本号
VERSION=$(node -e "console.log(require('./package.json').version)")
echo "当前版本: $VERSION"
echo ""

# 1. 安装依赖
echo "[1/6] 安装依赖..."
bun install

# 2. 构建 Windows 版本
echo ""
echo "[2/6] 构建 Windows x64 版本..."
bun run build:win32:x64

# 3. 复制 exe 到 zip 目录
echo ""
echo "[3/6] 打包二进制文件..."
rm -rf packages/win32-x64/zip/*
if [ -f "dist/win32/x64/ccl.exe" ]; then
    # 创建 zip 文件
    cd packages/win32-x64/zip
    if command -v zip &> /dev/null; then
        zip -r ../zip/ccl-win32-x64.zip ccl.exe
    else
        # Windows 上用 PowerShell 压缩
        echo "请手动将 dist/win32/x64/ccl.exe 复制到 packages/win32-x64/zip/ 并重命名为 ccl.exe"
        echo "然后使用 7-Zip 创建 ccl-win32-x64.zip"
    fi
    cd ../../..
fi

# 4. 发布 Windows 子包
echo ""
echo "[4/6] 发布 Windows 子包..."
cd packages/win32-x64
npm version $VERSION --no-git-tag-version
npm publish --access public
cd ../..

# 5. 发布安装器
echo ""
echo "[5/6] 发布安装器..."
cd packages/installer
npm version $VERSION --no-git-tag-version
npm publish --access public
cd ../..

# 6. 完成
echo ""
echo "================================================"
echo "  发布完成！"
echo "================================================"
echo ""
echo "安装命令: npm install -g sakitamanler-ccl-launcher"
echo ""
