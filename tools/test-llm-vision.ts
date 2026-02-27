import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

// 加载 .env.local 配置
dotenv.config({ path: '.env.local' });

// 支持的 LLM 服务商配置
type Provider = 'siliconflow' | 'ark';

interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

function getProviderConfig(provider: Provider): ProviderConfig {
  switch (provider) {
    case 'siliconflow':
      return {
        apiKey: process.env.SILICONFLOW_API_KEY || '',
        baseUrl: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
        modelName: process.env.SILICONFLOW_VISION_MODEL_NAME || 'zai-org/GLM-4.5V',
      };
    case 'ark':
      return {
        apiKey: process.env.ARK_API_KEY || '',
        baseUrl: process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/coding/v3',
        modelName: process.env.ARK_MODEL_NAME || 'doubao-seed-2.0-code',
      };
    default:
      throw new Error(`不支持的 provider: ${provider}`);
  }
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
 * 调用 Chat Completions API
 */
async function chatCompletion(
  request: ChatCompletionRequest,
  config: ProviderConfig,
): Promise<ChatCompletionResponse> {
  const url = `${config.baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * 测试 LLM 对图片的理解能力
 */
async function testImageUnderstanding(
  imageDir: string,
  provider: Provider,
  outputPath?: string,
) {
  const config = getProviderConfig(provider);

  if (!config.apiKey) {
    console.error(`错误: 未设置 ${provider.toUpperCase()}_API_KEY 环境变量`);
    process.exit(1);
  }

  // 获取目录中的所有图片
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  const imageFiles = fs
    .readdirSync(imageDir)
    .filter((f) => imageExtensions.includes(path.extname(f).toLowerCase()))
    .sort()
    .map((f) => path.join(imageDir, f));

  if (imageFiles.length === 0) {
    console.error(`目录中没有找到图片: ${imageDir}`);
    process.exit(1);
  }

  console.log(`找到 ${imageFiles.length} 张图片:`);
  imageFiles.forEach((f) => console.log(`  - ${f}`));
  console.log('');

  // 构建包含所有图片的消息内容
  const content: MessageContent[] = [
    {
      type: 'text',
      text: `请仔细阅读以下 ${imageFiles.length} 张图片，它们是 EDA 工具命令文档的截图。
请提取并整理每张图片中的命令信息，输出为 Markdown 格式。具体格式参考：

# [命令名称]

[内容] (如果有)

## Parameters (如果有)

[内容] (如果有)

## Example (如果有)

[内容] (如果有)

## Related Topics (如果有)

[内容] (如果有)


**重要要求：**
- 保留原始英文内容，不要翻译成中文
- 表格单元格中如果出现的 | 字符，前方必须加反斜杠\\，否则会导致格式失败，切记！
- 如果存在蓝色字体，必须添加链接格式，链接暂时为"TODO_LINK"
- 如果存在代码字体，必须使用 \`\` 包裹
- 如果存在代码字体 + 蓝色字体，则使用 \`\`包裹 + 链接格式，链接暂时为"TODO_LINK"

请用结构化的 Markdown 格式输出。`,
    },
  ];

  // 添加所有图片
  for (const imagePath of imageFiles) {
    console.log(`正在处理: ${path.basename(imagePath)}`);
    const dataUrl = imageToBase64DataUrl(imagePath);
    content.push({
      type: 'image_url',
      image_url: {
        url: dataUrl,
      },
    });
  }

  console.log('\n正在调用 LLM API...');
  console.log(`Provider: ${provider}`);
  console.log(`模型: ${config.modelName}`);
  console.log(`API: ${config.baseUrl}\n`);

  const request: ChatCompletionRequest = {
    model: config.modelName,
    messages: [
      {
        role: 'user',
        content: content,
      },
    ],
    max_tokens: 4096,
    temperature: 0.3,
  };

  try {
    const startTime = Date.now();
    const response = await chatCompletion(request, config);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    const llmContent = response.choices[0].message.content;

    console.log('='.repeat(60));
    console.log('LLM 响应:');
    console.log('='.repeat(60));
    console.log(llmContent);
    console.log('='.repeat(60));
    console.log(`\n耗时: ${elapsed}s`);
    console.log(
      `Token 使用: 输入 ${response.usage.prompt_tokens}, 输出 ${response.usage.completion_tokens}, 总计 ${response.usage.total_tokens}`,
    );

    // 保存为 markdown 文件
    const finalOutputPath = outputPath || path.join(imageDir, 'result.md');
    
    // 确保输出目录存在
    const outputDir = path.dirname(finalOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(finalOutputPath, llmContent, 'utf-8');
    console.log(`\n已保存至: ${finalOutputPath}`);
  } catch (error) {
    console.error('调用失败:', error);
    process.exit(1);
  }
}

// 命令行入口
async function main() {
  const args = process.argv.slice(2);
  
  // 解析 --provider 参数
  let provider: Provider = 'siliconflow'; // 默认使用 siliconflow
  const providerIndex = args.findIndex((arg) => arg === '--provider' || arg === '-p');
  if (providerIndex !== -1 && args[providerIndex + 1]) {
    const providerArg = args[providerIndex + 1].toLowerCase();
    if (providerArg === 'ark' || providerArg === 'siliconflow') {
      provider = providerArg;
    } else {
      console.error(`错误: 不支持的 provider "${providerArg}"，可选: siliconflow, ark`);
      process.exit(1);
    }
    // 移除 provider 相关参数
    args.splice(providerIndex, 2);
  }

  const [imageDir, outputPath] = args;

  if (!imageDir) {
    console.error('用法: npx tsx tools/test-llm-vision.ts <imageDir> [outputPath] [--provider <siliconflow|ark>]');
    console.error('');
    console.error('参数说明:');
    console.error('  imageDir   - 图片目录');
    console.error('  outputPath - 输出的 markdown 文件路径（可选，默认保存到图片目录下的 result.md）');
    console.error('  --provider - LLM 服务商（可选，默认 siliconflow，可选 ark）');
    console.error('');
    console.error('示例:');
    console.error(
      '  npx tsx tools/test-llm-vision.ts tools/output/01-Bus-Plan-Commands/01-08-update_bus_guide/cropped',
    );
    console.error(
      '  npx tsx tools/test-llm-vision.ts ./images ./output/command.md --provider ark',
    );
    console.error('');
    console.error('环境变量 (.env.local):');
    console.error('  SiliconFlow:');
    console.error('    SILICONFLOW_API_KEY          - API Key');
    console.error('    SILICONFLOW_BASE_URL         - API 地址');
    console.error('    SILICONFLOW_VISION_MODEL_NAME - 视觉模型名称');
    console.error('  ARK (火山引擎):');
    console.error('    ARK_API_KEY    - API Key');
    console.error('    ARK_BASE_URL   - API 地址');
    console.error('    ARK_MODEL_NAME - 模型名称');
    process.exit(1);
  }

  await testImageUnderstanding(imageDir, provider, outputPath);
}

main();
