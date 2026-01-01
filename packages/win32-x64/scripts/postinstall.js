#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// 确保 bin 目录存在
const binDir = path.join(__dirname, 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

// 解压 zip 文件
const zipPath = path.join(__dirname, 'zip', 'ccl-win32-x64.zip');

// 检查 zip 文件是否存在
if (!fs.existsSync(zipPath)) {
  console.error('Error: ccl.zip file not found in zip directory');
  console.error('Please ensure the ccl.zip file is present in the zip directory before installing');
  process.exit(1);
}

const zip = new AdmZip(zipPath);

try {
  console.log('Extracting ccl binary...');
  zip.extractAllTo(binDir, true);

  // 检查是否解压成功
  const cclPath = path.join(binDir, 'ccl.exe');
  if (fs.existsSync(cclPath) === false) {
    console.error('Error: ccl.exe binary not found in zip file');
    process.exit(1);
  }

  console.log('Extract completed successfully!');

} catch (error) {
  console.error('Error extracting zip file:', error.message);
  process.exit(1);
}
