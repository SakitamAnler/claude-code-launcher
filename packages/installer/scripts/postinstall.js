#!/usr/bin/env node

const { execSync } = require('child_process');
const process = require('process');

console.log('正在安装 sakitamanler Claude Code Launcher...');

// 根据平台安装对应的架构子包
const platform = process.platform;
const arch = process.arch;

let packageName = '';

switch (`${platform}-${arch}`) {
  case 'darwin-arm64':
    packageName = 'sakitamanler-ccl-darwin-arm64';
    break;
  case 'darwin-x64':
    packageName = 'sakitamanler-ccl-darwin-x64';
    break;
  case 'linux-x64':
    packageName = 'sakitamanler-ccl-linux-x64';
    break;
  case 'win32-x64':
    packageName = 'sakitamanler-ccl-win32';
    break;
  default:
    console.error(`不支持的平台: ${platform}-${arch}`);
    process.exit(1);
}

try {
  console.log(`正在安装 ${packageName}...`);
  execSync(`npm install -g ${packageName}`, {
    stdio: 'inherit'
  });
  console.log('安装完成！');
  console.log('');
  console.log('使用方法:');
  console.log('  ccl                    # 交互式选择 provider');
  console.log('  ccl --provider=GLM-4.7 # 指定 provider 运行');
} catch (error) {
  console.error('安装失败:', error.message);
  process.exit(1);
}
