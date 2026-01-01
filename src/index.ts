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
  clearClaudeSettings,
  UI,
} from "./utils.js";
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

    // 1. 检查 Claude Code 是否已安装
    UI.printStep(1, 4, "检查 Claude Code 是否已安装");
    const isInstalled = await checkClaudeCodeInstalled();

    if (!isInstalled) {
      Logger.error("未检测到全局安装的 Claude Code");
      Logger.info("请先运行: npm install -g @anthropic-ai/claude-code");
      process.exit(1);
    }

    UI.printSuccessBox("Claude Code 已安装");

    // 2. 加载和验证配置文件
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
          // 清空 selectedProvider，重新选择 provider
          selectedProvider = '';
          continue;
        }

        // 处理清除配置
        if (launchMode === "clear") {
          UI.printSeparator();
          console.log(chalk.yellow("⚠️  清除配置模式"));
          console.log(chalk.gray("  这将清除 Claude Code 的全局配置文件"));
          console.log(chalk.gray("  配置文件位于: ~/.claude/settings.json"));
          console.log("");

          const confirm = await prompts({
            type: "confirm",
            name: "value",
            message: "确认要清除配置吗？",
            initial: false,
          }) as { value: boolean };

          if (confirm.value) {
            clearClaudeSettings();
            console.log("");
            console.log(chalk.gray("  提示: 清除配置后，请重新运行 ccl 命令"));
          } else {
            console.log("");
            console.log(chalk.gray("  已取消清除操作"));
          }
          console.log("");
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

  // 直接在当前进程中使用 prompts 选择 provider（避免 Windows 子进程问题）
  try {
    const choices = providerNames.map((name: string) => ({
      title: name,
      description: `${config.providers[name].description}`,
      value: name,
    }));

    // 增加一个退出选项
    choices.push({
      title: "退出",
      description: "退出应用程序",
      value: "EXIT",
    });

    const response = await prompts(
      {
        type: "select",
        name: "provider",
        message: "选择 provider:",
        choices,
        initial: defaultIndex,
      },
      {
        onCancel: () => {
          // 用户按 Ctrl+c 取消了选择
          process.exit(1);
        },
      }
    );

    if (response.provider) {
      if (response.provider === "EXIT") {
        Logger.info("用户选择退出应用程序");
        process.exit(0);
      }
      return response.provider;
    }
  } catch (error) {
    Logger.warning(`TUI 选择出错: ${error}`);
  }

  // 回退到默认选项
  const fallbackProvider =
    providerNames[defaultIndex] || providerNames[0] || "glm-4.5";
  Logger.warning(
    `交互式选择失败，回退到默认 provider: ${fallbackProvider}`
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

  // 直接在当前进程中使用 prompts 选择启动模式（避免 Windows 子进程问题）
  try {
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
            title: "清除配置",
            description: "清除 Claude Code 的全局配置文件 (~/.claude/settings.json)",
            value: "clear",
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
      },
      {
        onCancel: () => {
          process.exit(1);
        },
      }
    );

    if (response.mode) {
      return response.mode;
    }
  } catch (error) {
    Logger.warning(`启动模式选择失败: ${error}`);
  }

  // 回退到临时模式
  Logger.warning("模式选择失败，使用临时模式");
  return "temp";
}

// 启动主程序
if (import.meta.main) {
  main().catch((error) => {
    Logger.error(`未捕获的错误: ${error}`);
    process.exit(1);
  });
}
