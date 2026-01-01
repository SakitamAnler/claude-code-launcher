#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 仅在 Windows 平台运行
if (process.platform !== 'win32') {
  console.error('Error: This CLI wrapper is for Windows (win32) only.');
  process.exit(1);
}

// 获取 ccl.exe 的路径
const binaryPath = path.join(__dirname, 'ccl.exe');

// 检查二进制文件是否存在
if (!fs.existsSync(binaryPath)) {
  console.error('Error: ccl.exe binary not found.');
  console.error('Please reinstall the package or re-run postinstall to extract the binary.');
  process.exit(1);
}

// 将所有参数传递给实际的 ccl 二进制文件
const args = process.argv.slice(2);

const child = spawn(binaryPath, args, {
  stdio: 'inherit'
});

// 处理子进程退出
child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code || 0);
  }
});

// 处理错误
child.on('error', (err) => {
  console.error('Error executing ccl.exe:', err.message);
  process.exit(1);
});
