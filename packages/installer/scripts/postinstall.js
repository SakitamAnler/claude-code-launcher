#!/usr/bin/env node

const { execSync } = require('child_process');
const process = require('process');

console.log('正在安装 sakitamanler Claude Code Launcher...');

// 根据平台安装对应的架构子包
const platform = process.platform;
const arch = process.arch;

let packageName = '';
let platformName = '';

switch (`${platform}-${arch}`) {
  case 'darwin-arm64':
    packageName = 'sakitamanler-ccl-darwin-arm64';
    platformName = 'macOS Apple Silicon';
    break;
  case 'darwin-x64':
    packageName = 'sakitamanler-ccl-darwin-x64';
    platformName = 'macOS Intel';
    break;
  case 'linux-x64':
    packageName = 'sakitamanler-ccl-linux-x64';
    platformName = 'Linux x64';
    break;
  case 'win32-x64':
    packageName = 'sakitamanler-ccl-win32';
    platformName = 'Windows x64';
    break;
  default:
    console.error(`❌ 暂不支持的平台: ${platform}-${arch}`);
    console.log('');
    console.log('当前支持的平台:');
    console.log('  - Windows x64');
    console.log('  - macOS Apple Silicon (开发中)');
    console.log('  - macOS Intel (开发中)');
    console.log('  - Linux x64 (开发中)');
    process.exit(1);
}

try {
  console.log(`📦 检测到平台: ${platformName}`);
  console.log(`🔧 正在安装 ${packageName}...`);

  // 尝试安装平台包
  execSync(`npm install -g ${packageName}@1.1.7`, {
    stdio: 'inherit'
  });

  console.log('');
  console.log('✅ 安装完成！');
  console.log('');
  console.log('📖 使用方法:');
  console.log('  ccl                    # 交互式选择 provider');
  console.log('  ccl --provider=GLM-4.7 # 指定 provider 运行');
  console.log('  ccl --help             # 查看帮助信息');
  console.log('');
} catch (error) {
  console.error('');
  console.error('❌ 安装失败:', error.message);
  console.error('');
  console.error('可能的原因:');
  console.error('  1. 该平台的包还未发布到 npm');
  console.error('  2. 网络连接问题');
  console.error('  3. npm 权限问题');
  console.error('');
  console.error('如需帮助，请访问: https://github.com/SakitamAnler/claude-code-launcher');
  process.exit(1);
}
