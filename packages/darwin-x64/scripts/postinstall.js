#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

console.log('正在解压 ccl 可执行文件...');

const zipPath = path.join(__dirname, '..', 'zip', 'ccl-darwin-x64.zip');
const extractPath = path.join(__dirname, '..');

if (!fs.existsSync(zipPath)) {
  console.error('错误：找不到可执行文件包', zipPath);
  process.exit(1);
}

try {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);
  console.log('解压完成！');

  // 设置可执行权限（macOS/Linux）
  const exePath = path.join(extractPath, 'ccl');
  if (fs.existsSync(exePath)) {
    fs.chmodSync(exePath, '755');
  }
} catch (error) {
  console.error('解压失败:', error.message);
  process.exit(1);
}
