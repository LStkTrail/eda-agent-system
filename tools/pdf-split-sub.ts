import { PDFDocument } from 'pdf-lib';
import fs from 'node:fs';
import path from 'node:path';

interface SubCommand {
  startPage: number; // 1-based，相对于原始 PDF 的全局页码
  endPage: number;   // 1-based
  name: string;      // 输出文件名（不带 .pdf）
}

interface SplitRange {
  startPage: number;
  endPage: number;
  name: string;
  subCommands?: SubCommand[];
}

interface SplitConfig {
  inputPath: string;
  outputDir: string;
  ranges: SplitRange[];
}

/**
 * 从原始 PDF 中提取指定页码范围
 */
async function extractPdfRange(
  pdfDoc: PDFDocument,
  outputPath: string,
  startPage: number, // 1-based
  endPage: number,   // 1-based，含 endPage
) {
  const totalPages = pdfDoc.getPageCount();

  const safeStart = Math.max(1, startPage);
  const safeEnd = Math.min(endPage, totalPages);

  const newPdf = await PDFDocument.create();

  for (let pageIndex = safeStart - 1; pageIndex < safeEnd; pageIndex++) {
    const [page] = await newPdf.copyPages(pdfDoc, [pageIndex]);
    newPdf.addPage(page);
  }

  const newBytes = await newPdf.save();
  fs.writeFileSync(outputPath, newBytes);
}

/**
 * 按配置拆分 subCommands
 */
async function splitSubCommands(configPath: string) {
  // 读取并解析配置文件
  const configRaw = fs.readFileSync(configPath, 'utf-8');
  const config: SplitConfig = JSON.parse(configRaw);

  const { inputPath, outputDir, ranges } = config;

  // 加载原始 PDF（只加载一次，提高效率）
  const bytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(bytes);
  const totalPages = pdfDoc.getPageCount();

  console.log(`原始 PDF: ${inputPath}，共 ${totalPages} 页`);

  // 遍历 ranges，找出有 subCommands 的项
  for (const range of ranges) {
    if (!range.subCommands || range.subCommands.length === 0) {
      continue;
    }

    // 为每个 range 创建子目录
    const rangeOutputDir = path.join(outputDir, range.name);
    if (!fs.existsSync(rangeOutputDir)) {
      fs.mkdirSync(rangeOutputDir, { recursive: true });
    }

    console.log(`\n处理 ${range.name}，共 ${range.subCommands.length} 个子命令:`);

    // 拆分每个 subCommand
    for (const sub of range.subCommands) {
      const outputFilePath = path.join(rangeOutputDir, `${sub.name}.pdf`);

      console.log(
        `  生成 ${sub.name}.pdf ，页码区间：${sub.startPage}-${sub.endPage}`,
      );

      await extractPdfRange(pdfDoc, outputFilePath, sub.startPage, sub.endPage);
    }
  }

  console.log('\n全部拆分完成');
}

// 命令行入口
const configPathFromArg = process.argv[2];
const defaultConfigPath = path.join(__dirname, 'pdf-split.config.json');

const finalConfigPath = configPathFromArg ?? defaultConfigPath;

splitSubCommands(finalConfigPath).catch((err) => {
  console.error('拆分失败：', err);
  process.exit(1);
});
