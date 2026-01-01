#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

// 获取可执行文件路径
const platform = os.platform();
const arch = os.arch();
const zipPath = path.join(__dirname, '..', 'zip', 'ccl-darwin-arm64.zip');

try {
  // 使用 ccl 可执行文件
  const exePath = path.join(__dirname, '..', 'ccl');
  execSync(`"${exePath}" ${process.argv.slice(2).join(' ')}`, { stdio: 'inherit' });
} catch (error) {
  console.error('启动失败:', error.message);
  process.exit(1);
}
