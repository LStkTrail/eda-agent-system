import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * 使用 pdftoppm 将 PDF 转换为多张 PNG 图片（每页一张）
 * 需要系统安装 poppler-utils: sudo apt-get install poppler-utils
 *
 * @param inputPath PDF 文件路径
 * @param outputDir 输出目录
 * @param dpi 分辨率，越高越清晰（默认 300，打印级别清晰度）
 */
function pdfToImages(inputPath: string, outputDir: string, dpi: number = 300) {
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 获取 PDF 文件名（不含扩展名），用于输出文件命名
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPrefix = path.join(outputDir, baseName);

  // 调用 pdftoppm 转换
  // -png: 输出 PNG 格式
  // -r: 分辨率 DPI
  const cmd = `pdftoppm -png -r ${dpi} "${inputPath}" "${outputPrefix}"`;

  console.log(`执行命令: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });

  // 列出生成的文件
  const files = fs
    .readdirSync(outputDir)
    .filter((f) => f.startsWith(baseName) && f.endsWith('.png'))
    .sort();

  console.log(`生成 ${files.length} 张图片:`);
  files.forEach((f) => console.log(`  - ${path.join(outputDir, f)}`));
}

// 命令行入口：
// npx tsx tools/pdf-to-image.ts <input.pdf> <outputDir> [dpi]
// 示例: npx tsx tools/pdf-to-image.ts ./doc/sample.pdf ./output 300
function main() {
  const [, , inputPath, outputDir, dpiArg] = process.argv;

  if (!inputPath || !outputDir) {
    console.error('用法: npx tsx pdf-to-image.ts <input.pdf> <outputDir> [dpi]');
    console.error('示例: npx tsx pdf-to-image.ts ./doc/sample.pdf ./output 300');
    console.error('');
    console.error('参数说明:');
    console.error('  input.pdf  - PDF 文件路径');
    console.error('  outputDir  - 输出目录');
    console.error('  dpi        - 分辨率（可选，默认 300，越高越清晰）');
    process.exit(1);
  }

  const dpi = dpiArg ? parseInt(dpiArg, 10) : 300;

  try {
    pdfToImages(inputPath, outputDir, dpi);
    console.log('转换完成');
  } catch (err) {
    console.error('转换失败:', err);
    process.exit(1);
  }
}

main();