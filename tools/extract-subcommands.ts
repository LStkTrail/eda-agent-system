import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import dotenv from 'dotenv';

// 加载 .env.local 配置
dotenv.config({ path: '.env.local' });

// 火山 Coding Plan 配置
interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

function getArkConfig(): ProviderConfig {
  return {
    apiKey: process.env.ARK_API_KEY || '',
    baseUrl: process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/coding/v3',
    modelName: process.env.ARK_MODEL_NAME || 'doubao-seed-2.0-code',
  };
}

interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

interface TextContent {
  type: 'text';
  text: string;
}

type MessageContent = TextContent | ImageContent;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | MessageContent[];
}

interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  max_tokens?: number;
  temperature?: number;
}

interface ChatCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 子命令信息
interface SubCommand {
  startPage: number;
  endPage: number;
  name: string;
}

// 配置文件中的范围
interface ConfigRange {
  startPage: number;
  endPage: number;
  name: string;
  subCommands?: SubCommand[];
}

interface Config {
  inputPath: string;
  outputDir: string;
  ranges: ConfigRange[];
}

/**
 * 将图片文件转换为 base64 data URL
 */
function imageToBase64DataUrl(imagePath: string): string {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase().slice(1);
  const mimeType = ext === 'jpg' ? 'jpeg' : ext;
  return `data:image/${mimeType};base64,${base64}`;
}

/**
 * 调用 Chat Completions API（带超时）
 */
async function chatCompletion(
  request: ChatCompletionRequest,
  config: ProviderConfig,
  timeoutMs: number = 300000, // 默认 5 分钟超时
): Promise<ChatCompletionResponse> {
  const url = `${config.baseUrl}/chat/completions`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 将 PDF 转换为图片
 */
function pdfToImages(inputPath: string, outputDir: string, dpi: number = 150): string[] {
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPrefix = path.join(outputDir, baseName);

  // 调用 pdftoppm 转换
  const cmd = `pdftoppm -png -r ${dpi} "${inputPath}" "${outputPrefix}"`;
  console.log(`  转换 PDF: ${path.basename(inputPath)}`);
  execSync(cmd, { stdio: 'pipe' });

  // 获取生成的图片文件列表
  const files = fs
    .readdirSync(outputDir)
    .filter((f) => f.startsWith(baseName) && f.endsWith('.png'))
    .sort()
    .map((f) => path.join(outputDir, f));

  return files;
}

/**
 * 清理临时图片目录
 */
function cleanupImages(outputDir: string) {
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir);
    for (const file of files) {
      fs.unlinkSync(path.join(outputDir, file));
    }
    fs.rmdirSync(outputDir);
  }
}

/**
 * 使用 LLM 分析图片，提取子命令信息
 */
async function extractSubCommandsFromImages(
  imageFiles: string[],
  sectionName: string,
  sectionIndex: number,
  sectionStartPage: number,
  config: ProviderConfig,
): Promise<SubCommand[]> {
  // 对于大型 PDF，我们只处理前几页（目录页）
  // 目录页通常包含所有命令的链接，足以提取命令列表
  const maxImages = 10; // 限制最大图片数量避免超时
  let selectedImages = imageFiles;
  
  if (imageFiles.length > maxImages) {
    // 只选择前几页（目录页），目录通常在前 3-5 页
    selectedImages = imageFiles.slice(0, maxImages);
  }

  // 构建包含图片的消息内容
  const content: MessageContent[] = [
    {
      type: 'text',
      text: `你是一个 EDA 工具文档分析专家。请仔细阅读以下 ${selectedImages.length} 张图片，它们是 "${sectionName}" 章节的 PDF 文档截图（主要是目录页）。

你的任务是识别并提取所有子命令（sub-command）的信息。

**重要信息：**
- 章节序号: ${String(sectionIndex).padStart(2, '0')}
- 章节名称: ${sectionName}
- 章节在原始 PDF 中的起始页码: ${sectionStartPage}
- 章节总页数: ${imageFiles.length} 页

**输出要求：**
请直接输出 JSON 数组格式，列出所有识别到的子命令。每个子命令包含：
- name: 命令名称（格式为 "序号-命令名"，例如 "${String(sectionIndex).padStart(2, '0')}-01-commandName"）
- startPage: 命令在原始 PDF 中的起始页码
- endPage: 命令在原始 PDF 中的结束页码

**注意事项：**
1. 第一张图片通常是目录页，列出了所有命令名称
2. 命令名称通常是英文的函数/命令格式，如 assign_clock_tree_source_groups, ccopt_design 等
3. 目录页中的页码是章节内的相对页码，需要转换为绝对页码：绝对页码 = ${sectionStartPage} + 相对页码 - 1
4. 如果目录没有显示具体页码，请根据命令数量和总页数 ${imageFiles.length} 进行均匀估算
5. 最后一个命令的 endPage 应该是章节的最后一页

请只输出 JSON 数组，不要包含其他内容：
[
  {"name": "${String(sectionIndex).padStart(2, '0')}-01-命令名1", "startPage": 起始页, "endPage": 结束页},
  {"name": "${String(sectionIndex).padStart(2, '0')}-02-命令名2", "startPage": 起始页, "endPage": 结束页},
  ...
]`,
    },
  ];

  // 添加图片
  for (const imagePath of selectedImages) {
    const dataUrl = imageToBase64DataUrl(imagePath);
    content.push({
      type: 'image_url',
      image_url: {
        url: dataUrl,
      },
    });
  }

  const request: ChatCompletionRequest = {
    model: config.modelName,
    messages: [
      {
        role: 'user',
        content: content,
      },
    ],
    max_tokens: 8192,
    temperature: 0.1,
  };

  const response = await chatCompletion(request, config);
  const llmContent = response.choices[0].message.content;

  // 解析 JSON 响应
  try {
    // 尝试提取 JSON 数组
    const jsonMatch = llmContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const subCommands: SubCommand[] = JSON.parse(jsonMatch[0]);
      return subCommands;
    }
  } catch (e) {
    console.error(`  解析 LLM 响应失败:`, e);
    console.error(`  响应内容: ${llmContent.substring(0, 500)}...`);
  }

  return [];
}

/**
 * 处理单个章节
 */
async function processSection(
  pdfPath: string,
  range: ConfigRange,
  sectionIndex: number,
  tempDir: string,
  llmConfig: ProviderConfig,
): Promise<SubCommand[]> {
  console.log(`\n处理章节 ${sectionIndex}: ${range.name}`);
  console.log(`  页码范围: ${range.startPage} - ${range.endPage}`);

  // 转换 PDF 为图片
  const sectionTempDir = path.join(tempDir, range.name);
  const imageFiles = pdfToImages(pdfPath, sectionTempDir, 72); // 使用 72 DPI 减少文件大小
  console.log(`  生成 ${imageFiles.length} 张图片`);

  if (imageFiles.length === 0) {
    console.log(`  警告: 没有生成图片`);
    return [];
  }

  // 使用 LLM 分析图片
  const actualImageCount = Math.min(imageFiles.length, 10);
  console.log(`  调用 LLM 分析 (使用前 ${actualImageCount} 张图片)...`);
  const subCommands = await extractSubCommandsFromImages(
    imageFiles,
    range.name,
    sectionIndex,
    range.startPage,
    llmConfig,
  );

  console.log(`  识别到 ${subCommands.length} 个子命令`);

  // 清理临时图片
  cleanupImages(sectionTempDir);

  return subCommands;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  // 解析参数
  let startIndex = 0;
  let endIndex = -1;
  let dryRun = false;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--start' && args[i + 1]) {
      startIndex = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--end' && args[i + 1]) {
      endIndex = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log('用法: npx tsx tools/extract-subcommands.ts [选项]');
      console.log('');
      console.log('选项:');
      console.log('  --start <n>  从第 n 个章节开始（0-based，默认 0）');
      console.log('  --end <n>    到第 n 个章节结束（0-based，默认处理所有）');
      console.log('  --dry-run    只显示要处理的章节，不实际执行');
      console.log('  --help       显示帮助信息');
      console.log('');
      console.log('示例:');
      console.log('  npx tsx tools/extract-subcommands.ts                # 处理所有章节');
      console.log('  npx tsx tools/extract-subcommands.ts --start 5     # 从第 6 个章节开始');
      console.log('  npx tsx tools/extract-subcommands.ts --start 5 --end 10  # 处理第 6-11 个章节');
      process.exit(0);
    }
  }

  // 获取 LLM 配置
  const llmConfig = getArkConfig();
  if (!llmConfig.apiKey) {
    console.error('错误: 未设置 ARK_API_KEY 环境变量');
    process.exit(1);
  }

  console.log('使用火山 Coding Plan API');
  console.log(`模型: ${llmConfig.modelName}`);
  console.log(`API: ${llmConfig.baseUrl}\n`);

  // 读取配置文件
  const configPath = path.join(process.cwd(), 'tools/pdf-split.config.json');
  const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const outputDir = path.join(process.cwd(), config.outputDir);

  // 确定要处理的章节范围
  if (endIndex < 0) {
    endIndex = config.ranges.length - 1;
  }
  
  // 过滤出需要处理的章节（没有 subCommands 或 subCommands 为空的）
  const sectionsToProcess: { index: number; range: ConfigRange }[] = [];
  
  for (let i = startIndex; i <= endIndex && i < config.ranges.length; i++) {
    const range = config.ranges[i];
    if (!range.subCommands || range.subCommands.length === 0) {
      sectionsToProcess.push({ index: i + 1, range });
    }
  }

  console.log(`需要处理的章节数: ${sectionsToProcess.length}`);
  
  if (dryRun) {
    console.log('\n[Dry Run] 将处理以下章节:');
    for (const { index, range } of sectionsToProcess) {
      console.log(`  ${String(index).padStart(2, '0')}. ${range.name} (页 ${range.startPage}-${range.endPage})`);
    }
    process.exit(0);
  }

  // 创建临时目录
  const tempDir = path.join(process.cwd(), '.output', 'temp-extract');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // 处理每个需要标注的章节
  let processedCount = 0;
  
  for (const { index, range } of sectionsToProcess) {
    const pdfPath = path.join(outputDir, `${range.name}.pdf`);
    
    if (!fs.existsSync(pdfPath)) {
      console.log(`\n跳过章节 ${index}: PDF 文件不存在 - ${pdfPath}`);
      continue;
    }

    try {
      const subCommands = await processSection(pdfPath, range, index, tempDir, llmConfig);
      
      if (subCommands.length > 0) {
        // 更新配置
        range.subCommands = subCommands;
        
        // 立即保存配置（避免丢失进度）
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf-8');
        console.log(`  已更新配置文件`);
      }
      
      processedCount++;
      
      // 添加延迟避免 API 限流
      if (processedCount < sectionsToProcess.length) {
        console.log(`  等待 2 秒...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`  处理章节 ${index} 失败:`, error);
    }
  }

  // 清理临时目录
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }

  console.log(`\n完成! 处理了 ${processedCount} 个章节`);
  console.log(`配置文件已更新: ${configPath}`);
}

main().catch((error) => {
  console.error('执行失败:', error);
  process.exit(1);
});
