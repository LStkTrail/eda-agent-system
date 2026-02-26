import { tool } from "@langchain/core/tools";
import { KnowledgeBaseQuerySchema } from "@/lib/shared/types";

// TODO: 后续集成向量数据库实现真实知识库检索

/** 模拟知识库数据，基于 EDA 手册常见知识点 */
const MOCK_KNOWLEDGE: Array<{
  title: string;
  content: string;
  category: string;
  keywords: string[];
}> = [
  {
    title: "Verilog always 块使用规范",
    content:
      "always 块是 Verilog 中描述时序逻辑和组合逻辑的核心结构。" +
      "时序逻辑使用 always @(posedge clk)，组合逻辑使用 always @(*)。" +
      "SystemVerilog 推荐使用 always_ff（时序）和 always_comb（组合）以避免仿真与综合不一致。" +
      "注意：always 块内赋值时序逻辑用非阻塞赋值（<=），组合逻辑用阻塞赋值（=）。",
    category: "verilog",
    keywords: ["always", "时序", "组合", "赋值", "always_ff", "always_comb"],
  },
  {
    title: "Verilog module 端口声明",
    content:
      "module 是 Verilog 设计的基本单元。端口声明支持 input、output、inout 三种方向。" +
      "Verilog-2001 之后推荐使用 ANSI 风格端口声明，即在 module 头部直接声明端口方向和类型。" +
      "例如：module counter(input clk, input rst, output reg [3:0] cnt);",
    category: "verilog",
    keywords: ["module", "端口", "port", "input", "output", "声明"],
  },
  {
    title: "时序约束基础 (SDC)",
    content:
      "SDC (Synopsys Design Constraints) 是 EDA 工具中最常用的时序约束格式。" +
      "核心约束包括：create_clock 定义时钟、set_input_delay/set_output_delay 定义 IO 延迟、" +
      "set_max_delay/set_min_delay 设置路径延迟约束。" +
      "良好的时序约束是实现时序收敛的关键，建议在设计初期就定义完整的约束文件。",
    category: "general",
    keywords: ["SDC", "时序", "约束", "时钟", "延迟", "constraint"],
  },
  {
    title: "VHDL entity 与 architecture",
    content:
      "VHDL 设计由 entity（实体）和 architecture（架构）两部分组成。" +
      "entity 定义模块接口（端口名、方向、类型），architecture 描述内部行为。" +
      "一个 entity 可以有多个 architecture，在仿真时通过 configuration 选择。",
    category: "vhdl",
    keywords: ["entity", "architecture", "接口", "VHDL", "配置"],
  },
  {
    title: "TCL 脚本在 EDA 工具中的应用",
    content:
      "TCL 是 EDA 工具（如 Vivado、Quartus、Design Compiler）的主要脚本语言。" +
      "常见用途包括：自动化综合流程、设置约束、生成报告、批量修改设计参数。" +
      "Vivado 中使用 get_cells、get_nets、get_pins 等命令查询设计对象。",
    category: "tcl",
    keywords: ["TCL", "脚本", "Vivado", "自动化", "综合"],
  },
];

/**
 * EDA 知识库查询工具（Stub 实现）
 * 通过关键字匹配返回相关的 EDA 知识条目，
 * 未来将替换为向量数据库检索
 */
export const knowledgeBaseTool = tool(
  async ({ query, category }) => {
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/);

    // 根据关键字和类别过滤并计算相关度
    const results = MOCK_KNOWLEDGE.filter((entry) => {
      if (category && entry.category !== category) return false;
      return true;
    })
      .map((entry) => {
        // 简单的关键字匹配计算相关度
        let relevance = 0;
        for (const token of queryTokens) {
          if (entry.keywords.some((kw) => kw.toLowerCase().includes(token))) {
            relevance += 0.3;
          }
          if (entry.title.toLowerCase().includes(token)) {
            relevance += 0.2;
          }
          if (entry.content.toLowerCase().includes(token)) {
            relevance += 0.1;
          }
        }
        return {
          title: entry.title,
          content: entry.content,
          relevance: Math.min(relevance, 1),
        };
      })
      .filter((r) => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);

    if (results.length === 0) {
      return JSON.stringify({
        results: [
          {
            title: "未找到相关知识",
            content: `未找到与 "${query}" 相关的知识条目，请尝试其他关键词。`,
            relevance: 0,
          },
        ],
      });
    }

    return JSON.stringify({ results });
  },
  {
    name: "knowledge_base",
    description:
      "查询 EDA 知识库，获取 Verilog、VHDL、SystemVerilog、TCL、时序约束等相关知识",
    schema: KnowledgeBaseQuerySchema,
  }
);
