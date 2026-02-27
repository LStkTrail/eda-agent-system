import { PDFDocument } from 'pdf-lib';
import fs from 'node:fs';
import path from 'node:path';

interface SplitRange {
  startPage: number; // 1-based
  endPage: number;   // 1-based
  name: string;      // 输出文件名（不带 .pdf）
}

interface SplitConfig {
  inputPath: string;
  outputDir: string;
  ranges: SplitRange[];
}

async function extractPdfRange(
  inputPath: string,
  outputPath: string,
  startPage: number, // 1-based
  endPage: number,   // 1-based，含 endPage
) {
  const bytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(bytes);
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

async function splitByConfig(configPath: string) {
  // 读取并解析配置文件
  const configRaw = fs.readFileSync(configPath, 'utf-8');
  const config: SplitConfig = JSON.parse(configRaw);

  const { inputPath, outputDir, ranges } = config;

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const range of ranges) {
    const outputFilePath = path.join(outputDir, `${range.name}.pdf`);

    console.log(
      `生成 ${outputFilePath} ，页码区间：${range.startPage}-${range.endPage}`,
    );

    await extractPdfRange(
      inputPath,
      outputFilePath,
      range.startPage,
      range.endPage,
    );
  }

  console.log('全部拆分完成');
}

// 允许从命令行传入配置文件路径：node pdf-split.js path/to/config.json
const configPathFromArg = process.argv[2];
const defaultConfigPath = path.join(__dirname, 'pdf-split.config.json');

const finalConfigPath = configPathFromArg ?? defaultConfigPath;

splitByConfig(finalConfigPath).catch((err) => {
  console.error('拆分失败：', err);
  process.exit(1);
});