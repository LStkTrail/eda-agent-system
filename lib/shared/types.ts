import { z } from "zod";

// ========== EDA 工具输入/输出 Schema 定义 ==========

/** 代码分析工具 - 输入参数 */
export const CodeAnalysisInputSchema = z.object({
  code: z
    .string()
    .describe("待分析的 EDA 代码（Verilog/VHDL/SystemVerilog）"),
  analysisType: z
    .enum(["syntax", "lint", "optimization", "general"])
    .describe("分析类型：语法检查 / 代码规范 / 优化建议 / 综合分析"),
});
export type CodeAnalysisInput = z.infer<typeof CodeAnalysisInputSchema>;

/** 代码分析工具 - 输出结果 */
export const CodeAnalysisResultSchema = z.object({
  summary: z.string(),
  issues: z.array(z.string()),
  suggestions: z.array(z.string()),
});
export type CodeAnalysisResult = z.infer<typeof CodeAnalysisResultSchema>;

/** 知识库查询工具 - 输入参数 */
export const KnowledgeBaseQuerySchema = z.object({
  query: z.string().describe("知识库检索关键词"),
  category: z
    .enum(["verilog", "vhdl", "systemverilog", "tcl", "general"])
    .optional()
    .describe("知识类别（可选）"),
});
export type KnowledgeBaseQuery = z.infer<typeof KnowledgeBaseQuerySchema>;

/** 知识库查询工具 - 单条结果 */
export const KnowledgeEntrySchema = z.object({
  title: z.string(),
  content: z.string(),
  relevance: z.number(),
});
export type KnowledgeEntry = z.infer<typeof KnowledgeEntrySchema>;

/** 工具名称到中文映射，前端 ThoughtChain 使用 */
export const TOOL_NAME_MAP: Record<string, string> = {
  code_analyzer: "代码分析",
  knowledge_base: "知识库查询",
};
