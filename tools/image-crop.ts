import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * 裁剪图片的上下边距
 * @param inputPath 输入图片路径
 * @param outputPath 输出图片路径
 * @param topPercent 裁掉顶部百分比（默认 8）
 * @param bottomPercent 裁掉底部百分比（默认 8）
 */
async function cropImage(
  inputPath: string,
  outputPath: string,
  topPercent: number = 8,
  bottomPercent: number = 8,
) {
  const meta = await sharp(inputPath).metadata();
  const { width, height } = meta;

  if (!width || !height) {
    throw new Error(`无法读取图片尺寸: ${inputPath}`);
  }

  const cropTop = Math.round(height * (topPercent / 100));
  const cropBottom = Math.round(height * (bottomPercent / 100));
  const newHeight = height - cropTop - cropBottom;

  await sharp(inputPath)
    .extract({
      left: 0,
      top: cropTop,
      width: width,
      height: newHeight,
    })
    .toFile(outputPath);

  console.log(`裁剪完成: ${outputPath}`);
}

/**
 * 批量裁剪目录中的所有图片
 * @param inputDir 输入目录
 * @param outputDir 输出目录（可选，默认在原目录下创建 cropped 子目录）
 * @param topPercent 裁掉顶部百分比
 * @param bottomPercent 裁掉底部百分比
 */
async function cropImagesInDir(
  inputDir: string,
  outputDir?: string,
  topPercent: number = 8,
  bottomPercent: number = 8,
) {
  // 默认输出到 inputDir/cropped
  const finalOutputDir = outputDir || path.join(inputDir, 'cropped');

  if (!fs.existsSync(finalOutputDir)) {
    fs.mkdirSync(finalOutputDir, { recursive: true });
  }

  // 获取所有图片文件
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  const files = fs
    .readdirSync(inputDir)
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return imageExtensions.includes(ext);
    })
    .sort();

  if (files.length === 0) {
    console.log(`目录中没有找到图片文件: ${inputDir}`);
    return;
  }

  console.log(`找到 ${files.length} 张图片，开始裁剪...`);
  console.log(`裁剪设置: 顶部 ${topPercent}%，底部 ${bottomPercent}%`);
  console.log(`输出目录: ${finalOutputDir}\n`);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(finalOutputDir, file);

    await cropImage(inputPath, outputPath, topPercent, bottomPercent);
  }

  console.log(`\n全部完成，共裁剪 ${files.length} 张图片`);
}

// 命令行入口
// npx tsx tools/image-crop.ts <inputDir> [outputDir] [topPercent] [bottomPercent]
async function main() {
  const [, , inputDir, outputDir, topArg, bottomArg] = process.argv;

  if (!inputDir) {
    console.error('用法: npx tsx image-crop.ts <inputDir> [outputDir] [topPercent] [bottomPercent]');
    console.error('');
    console.error('参数说明:');
    console.error('  inputDir      - 输入图片目录');
    console.error('  outputDir     - 输出目录（可选，默认在输入目录下创建 cropped 子目录）');
    console.error('  topPercent    - 裁掉顶部百分比（可选，默认 8）');
    console.error('  bottomPercent - 裁掉底部百分比（可选，默认 8）');
    console.error('');
    console.error('示例:');
    console.error('  npx tsx tools/image-crop.ts ./images');
    console.error('  npx tsx tools/image-crop.ts ./images ./output 10 10');
    process.exit(1);
  }

  const topPercent = topArg ? parseFloat(topArg) : 8;
  const bottomPercent = bottomArg ? parseFloat(bottomArg) : 8;

  try {
    await cropImagesInDir(inputDir, outputDir || undefined, topPercent, bottomPercent);
  } catch (err) {
    console.error('裁剪失败:', err);
    process.exit(1);
  }
}

main();
