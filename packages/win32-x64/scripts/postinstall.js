#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

console.log('正在解压 ccl 可执行文件...');

// 解压到包根目录
const extractPath = path.join(__dirname, '..');
const zipPath = path.join(__dirname, '..', 'zip', 'ccl-win32-x64.zip');

// 检查 zip 文件是否存在
if (!fs.existsSync(zipPath)) {
  console.error('❌ 错误：找不到可执行文件包');
  console.error('路径:', zipPath);
  process.exit(1);
}

try {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);
  console.log('✅ 解压完成！');

  // 检查是否解压成功
  const cclPath = path.join(extractPath, 'ccl.exe');
  if (fs.existsSync(cclPath)) {
    console.log('✅ ccl.exe 已就绪');
  } else {
    console.error('⚠️  警告：未找到 ccl.exe');
  }
} catch (error) {
  console.error('❌ 解压失败:', error.message);
  process.exit(1);
}
