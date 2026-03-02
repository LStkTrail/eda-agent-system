import { PDFDocument } from 'pdf-lib';
import fs from 'node:fs';
import path from 'node:path';

/**
 * 从 PDF 中提取指定页码范围并保存到新文件
 * @param inputPath 输入 PDF 文件路径
 * @param outputPath 输出 PDF 文件路径
 * @param startPage 起始页码 (1-based)
 * @param endPage 结束页码 (1-based，含该页)
 */
async function extractPdfRange(
  inputPath: string,
  outputPath: string,
  startPage: number,
  endPage: number,
) {
  const bytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(bytes);
  const totalPages = pdfDoc.getPageCount();

  const safeStart = Math.max(1, startPage);
  const safeEnd = Math.min(endPage, totalPages);

  if (safeStart > safeEnd) {
    throw new Error(`无效的页码范围：${startPage}-${endPage}，PDF 共 ${totalPages} 页`);
  }

  const newPdf = await PDFDocument.create();

  for (let pageIndex = safeStart - 1; pageIndex < safeEnd; pageIndex++) {
    const [page] = await newPdf.copyPages(pdfDoc, [pageIndex]);
    newPdf.addPage(page);
  }

  // 确保输出目录存在
  const outputDir = path.dirname(outputPath);
  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const newBytes = await newPdf.save();
  fs.writeFileSync(outputPath, newBytes);

  console.log(`✅ 成功提取页码 ${safeStart}-${safeEnd}（共 ${safeEnd - safeStart + 1} 页）`);
  console.log(`   输出文件：${outputPath}`);
}

function printUsage() {
  console.log(`
PDF 页面提取工具

用法：
  npx ts-node tools/pdf-extract-cli.ts <输入PDF> <输出PDF> <起始页> <结束页>
  npx ts-node tools/pdf-extract-cli.ts <输入PDF> <输出PDF> <单页>

参数说明：
  <输入PDF>   源 PDF 文件路径
  <输出PDF>   输出 PDF 文件路径
  <起始页>    起始页码（从 1 开始）
  <结束页>    结束页码（包含该页）
  <单页>      仅提取单页时，只需提供一个页码

示例：
  # 提取第 10-20 页
  npx ts-node tools/pdf-extract-cli.ts input.pdf output.pdf 10 20

  # 提取第 5 页
  npx ts-node tools/pdf-extract-cli.ts input.pdf page5.pdf 5

  # 提取并保存到指定目录
  npx ts-node tools/pdf-extract-cli.ts doc/manual.pdf ./output/chapter1.pdf 1 50
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(args.includes('-h') || args.includes('--help') ? 0 : 1);
  }

  const inputPath = args[0];
  const outputPath = args[1];
  const startPage = parseInt(args[2], 10);
  const endPage = args[3] ? parseInt(args[3], 10) : startPage; // 如果没有结束页，则提取单页

  // 验证参数
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ 错误：输入文件不存在：${inputPath}`);
    process.exit(1);
  }

  if (isNaN(startPage) || startPage < 1) {
    console.error(`❌ 错误：起始页码无效：${args[2]}`);
    process.exit(1);
  }

  if (isNaN(endPage) || endPage < 1) {
    console.error(`❌ 错误：结束页码无效：${args[3]}`);
    process.exit(1);
  }

  if (startPage > endPage) {
    console.error(`❌ 错误：起始页码 (${startPage}) 不能大于结束页码 (${endPage})`);
    process.exit(1);
  }

  console.log(`📄 正在处理：${inputPath}`);
  console.log(`   提取页码：${startPage}-${endPage}`);

  await extractPdfRange(inputPath, outputPath, startPage, endPage);
}

main().catch((err) => {
  console.error('❌ 拆分失败：', err.message || err);
  process.exit(1);
});
