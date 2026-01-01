#!/usr/bin/env bun

import {
  Logger,
  checkClaudeCodeInstalled,
  loadConfig,
  parseArgs,
  providerToEnvVars,
  launchClaudeCode,
  isExecutable,
  getCurrentDir,
  applyProviderToSettings,
  UI,
} from "./utils.build.js";
import prompts from "prompts";
import chalk from "chalk";

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    // 显示程序标题
    UI.printTitle("claude-code-launcher", "by sakitamanler");

    // console.log('程序参数：', process.argv)
    const argsResult = parseArgs();

    // 0. 检查是否是启动模式选择器（此时程序是以子进程方式来运行的）
    if (argsResult.launchModeSelector === "true") {
      // 这个已经在主程序底部处理了，这里只是为了防止继续执行
      return;
    }

    // 1. 检查是否是 TUI 选择器模式（此时程序是以子进程方式来运行的）
    const args = process.argv.slice(2);
    // 启动 tui 选择器
    if (argsResult.tuiSelector === "true") {
      try {
        // TUI 选择器模式（--tui-selector 参数后必然有 json 配置）
        const configJson = args[1];
        if (configJson) {
          // 解析 json 内容
          const config = JSON.parse(configJson);
          // 此时程序已经在独立子进程中，所以直接运行 TUI 界面获取选中的模型即可
          const selectedProvider = await runTUISelector(config);
          if (selectedProvider) {
            // 检测退出选项
            if (selectedProvider === "EXIT") {
              // 返回代码2给主进程，让主进程也退出
              process.exit(2);
            }
            process.stdout.write(selectedProvider);
            process.exit(0);
          } else {
            process.exit(1);
          }
        } else {
          process.exit(1);
        }
      } catch (err: any) {
        console.error(err);
      }
    }

    // 2. 检查 Claude Code 是否已安装
    UI.printStep(1, 4, "检查 Claude Code 是否已安装");
    const isInstalled = await checkClaudeCodeInstalled();

    if (!isInstalled) {
      Logger.error("未检测到全局安装的 Claude Code");
      Logger.info("请先运行: npm install -g @anthropic-ai/claude-code");
      process.exit(1);
    }

    UI.printSuccessBox("Claude Code 已安装");

    // 3. 加载和验证配置文件
    UI.printStep(2, 4, "加载配置文件");
    const config = loadConfig();
    // 如果配置文件加载失败（null），则停止程序运行
    if (config === null) {
      Logger.warning("程序将在5秒后自动退出...");
      process.stdin.resume();
      setTimeout(() => {
        process.exit(0);
      }, 5000);
    }
    else {
      UI.printSuccessBox("配置文件加载成功");

      // 主循环：支持返回上一级
      let selectedProvider = argsResult.provider || '';
      const prompt = argsResult.prompt || '';
      const output = argsResult.output || '';
      const pwd = argsResult.pwd || '';

      // 如果指定了 pwd 参数，则更改工作目录
      if (pwd) {
        try {
          Logger.info(`更改工作目录到: ${pwd}`);
          process.chdir(pwd);
          Logger.success(`工作目录已更改为: ${process.cwd()}`);
        } catch (error) {
          Logger.error(`更改工作目录失败: ${error instanceof Error ? error.message : String(error)}`);
          process.exit(1);
        }
      }

      // 主循环
      while (true) {
        if (selectedProvider) {
          // 检查指定的 provider 是否存在
          if (config.providers[selectedProvider]) {
            Logger.info(`使用命令行指定的 provider: ${selectedProvider}`);
          } else {
            Logger.warning(`参数指定的 provider "${selectedProvider}" 不存在`);
            selectedProvider = await selectProviderInteractively(config);
          }
        } else {
          // 交互式选择 provider
          selectedProvider = await selectProviderInteractively(config);
        }

        // 获取选中的 provider 配置
        const providerConfig = config.providers[selectedProvider];
        if (!providerConfig) {
          Logger.error(`Provider "${selectedProvider}" 配置不存在`);
          process.exit(1);
        }

        // 选择启动模式
        const launchMode = await selectLaunchMode();

        // 处理退出
        if (launchMode === "exit") {
          console.log("");
          console.log(chalk.gray("👋 再见！"));
          console.log("");
          process.exit(0);
        }

        // 处理返回上一级
        if (launchMode === "back") {
          // 重新选择 provider，继续循环
          continue;
        }

        // 执行选定的模式
        if (launchMode === "permanent") {
          // 永久模式：写入配置文件
          UI.printStep(4, 4, `应用 ${selectedProvider} 配置`);
          const success = applyProviderToSettings(providerConfig);

          if (!success) {
            Logger.error("应用配置失败，程序终止");
            process.exit(1);
          }

          UI.printSeparator();
          console.log(chalk.green("✓") + " 配置已保存！");
          console.log("");
          console.log("  现在可以直接使用 " + chalk.yellow("'claude'") + " 命令启动");
          console.log("");
          console.log("  下次启动将默认使用: " + chalk.cyan(selectedProvider));
          console.log("");
          console.log(chalk.gray("  提示: 如需切换模型，请再次运行 ccl 命令"));
          console.log("");
          process.exit(0);
        } else {
          // 临时模式：使用环境变量
          UI.printSeparator();
          console.log(chalk.cyan("🚀 启动模式: 临时模式"));
          console.log(chalk.gray("  使用环境变量，退出后不影响配置文件"));
          console.log("");
          const envVars = providerToEnvVars(providerConfig);
          const additionalOTQP = config.additionalOTQP || '';
          await launchClaudeCode(envVars, prompt, output, additionalOTQP);
        }

        // 如果执行到这里，说明临时模式已经完成了，退出循环
        break;
      }
    }
  } catch (error) {
    Logger.error(
      `程序执行失败: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

// 直接运行 TUI 选择器界面（此时代码运行在一个独立子进程中）
async function runTUISelector(config: any): Promise<string | null> {
  try {
    // 保存原始的 stdout
    const originalStdout = process.stdout.write;

    // 重定向 prompts 的输出到 stderr
    process.stdout.write = function (
      chunk: any,
      encoding?: any,
      callback?: any
    ) {
      return process.stderr.write(chunk, encoding, callback);
    };

    const providerNames = Object.keys(config.providers);

    // 确定默认选中项
    let defaultIndex = 0;
    if (config.default_provider && config.providers[config.default_provider]) {
      defaultIndex = providerNames.indexOf(config.default_provider);
    }

    const choices = providerNames.map((name: string, index: number) => ({
      title: name,
      description: `${config.providers[name].description}`,
      value: name,
    }));

    // 增加一个退出选项
    choices.push({
      title: "退出",
      description: "放弃执行 Claude Code",
      value: "EXIT",
    });
    
    const response = await prompts(
      {
        type: "select",
        name: "provider",
        message: "选择 provider:",
        choices,
        initial: defaultIndex,
        stdout: process.stderr, // 将 prompts 输出重定向到 stderr（因为 prompts 输出的是一个 TUI 界面，如果它输出到 stdout，用户就无法看见了）
      },
      {
        onCancel: () => {
          // 用户按 Ctrl+c 取消了选择
          process.exit(1);
        },
      }
    );

    // 恢复原始的 stdout
    process.stdout.write = originalStdout;

    if (response.provider) {
      return response.provider;
    }
  } catch (error) {
    console.error(error);
    // TUI 选择出错
    return null;
  }

  return null;
}

// 以交互界面形式选择 provider，返回选择的 provider 名称
async function selectProviderInteractively(config: any): Promise<string> {
  const providerNames = Object.keys(config.providers);

  // 确定默认选中项
  let defaultIndex = 0;
  if (config.default_provider && config.providers[config.default_provider]) {
    defaultIndex = providerNames.indexOf(config.default_provider);
  }

  // 如果不是真实的 TTY 环境，直接返回默认选择
  if (!process.stdin.isTTY) {
    const fallbackProvider =
      providerNames[defaultIndex] || providerNames[0] || "glm-4.5";
    Logger.info(`非交互式环境，使用默认 provider: ${fallbackProvider}`);
    return fallbackProvider;
  }

  Logger.info("请选择要使用的 provider:");

  // 方案1：使用子进程方式自己运行自己（可执行文件），但以 TUI 模式运行
  try {
    // 获取当前可执行文件的路径
    const currentExecutable = process.execPath;
    const args = [currentExecutable];
    // 如果是脚本执行方式，要添加脚本路径作为第2个参数（兼容开发调试模式）
    if (!isExecutable()) {
      args.push(import.meta.path);
    }
    // 添加参数指明要以 TUI 形式让用户选择 provider
    args.push("--tui-selector");
    // 添加配置文件内容作为第3个参数（兼容 TUI 选择器模式）
    args.push(JSON.stringify(config));

    // console.log('当前可执行文件：', currentExecutable)

    // 启动子进程
    const proc = Bun.spawn(
      args,
      {
        stdout: "pipe",
        stderr: "inherit",
        stdin: "inherit",
      }
    );

    // 等待子进程输出并退出
    const output = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    // 如果子进程成功退出且有输出，则使用输出作为选择的 provider
    if (exitCode === 0 && output.trim() && config.providers[output.trim()]) {
      const selectedProvider = output.trim();
      // Logger.success(`使用 TUI 选择了 provider: ${selectedProvider}`);
      return selectedProvider;
    } else if (exitCode === 1) {
      // 用户主动退出整个应用程序
      Logger.info("用户退出应用程序");
      process.exit(1);
    } else if (exitCode === 2) {
      // 用户选择了“退出”选项，优雅退出整个应用程序
      Logger.info("用户选择退出应用程序");
      process.exit(0);
    } else {
      Logger.warning("TUI 隔离进程失败");
    }
  } catch (error) {
    Logger.warning(`TUI 隔离进程出错: ${error}`);
  }

  // 方案 2: 回退到默认选项
  const fallbackProvider =
    providerNames[defaultIndex] || providerNames[0] || "glm-4.5";
  Logger.warning(
    `所有交互式方案失败，回退到默认 provider: ${fallbackProvider}`
  );
  return fallbackProvider;
}

// 选择启动模式
async function selectLaunchMode(): Promise<string> {
  // 如果不是真实的 TTY 环境，直接返回临时模式
  if (!process.stdin.isTTY) {
    Logger.info("非交互式环境，使用临时模式");
    return "temp";
  }

  // 使用子进程方式运行 TUI
  try {
    const currentExecutable = process.execPath;
    const args = [currentExecutable];
    if (!isExecutable()) {
      args.push(import.meta.path);
    }
    args.push("--launch-mode-selector");

    const proc = Bun.spawn(args, {
      stdout: "pipe",
      stderr: "inherit",
      stdin: "inherit",
    });

    const output = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    if (exitCode === 0 && output.trim()) {
      const mode = output.trim();
      if (mode === "permanent" || mode === "temp") {
        return mode;
      }
    }
  } catch (error) {
    Logger.warning(`启动模式选择失败: ${error}`);
  }

  // 回退到临时模式
  Logger.warning("模式选择器启动失败，使用临时模式");
  return "temp";
}

// 启动模式选择器（独立子进程）
async function runLaunchModeSelector(): Promise<void> {
  try {
    const originalStdout = process.stdout.write;
    process.stdout.write = function (chunk: any, encoding?: any, callback?: any) {
      return process.stderr.write(chunk, encoding, callback);
    };

    const response = await prompts(
      {
        type: "select",
        name: "mode",
        message: "选择启动模式:",
        choices: [
          {
            title: "临时模式（推荐）",
            description: "使用环境变量启动，退出后不影响配置文件",
            value: "temp",
          },
          {
            title: "永久模式",
            description: "写入配置文件，后续可直接用 claude 命令启动",
            value: "permanent",
          },
          {
            title: "返回上一级",
            description: "返回 provider 选择",
            value: "back",
          },
          {
            title: "退出",
            description: "退出应用程序",
            value: "exit",
          },
        ],
        initial: 0,
        stdout: process.stderr,
      },
      {
        onCancel: () => {
          process.exit(1);
        },
      }
    );

    process.stdout.write = originalStdout;

    if (response.mode) {
      process.stdout.write(response.mode);
      process.exit(0);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

// 处理启动模式选择器参数
if (process.argv.includes("--launch-mode-selector")) {
  await runLaunchModeSelector();
  process.exit(0);
}

// 启动主程序
if (import.meta.main) {
  main().catch((error) => {
    Logger.error(`未捕获的错误: ${error}`);
    process.exit(1);
  });
}
