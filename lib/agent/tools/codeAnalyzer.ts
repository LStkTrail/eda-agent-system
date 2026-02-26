import { tool } from "@langchain/core/tools";
import { CodeAnalysisInputSchema } from "@/lib/shared/types";

/**
 * EDA 代码分析工具（Mock 实现）
 * 通过关键字检测模拟分析 Verilog/VHDL/SystemVerilog 代码，
 * 返回结构化的分析结果
 */
export const codeAnalyzerTool = tool(
  async ({ code, analysisType }) => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const lowerCode = code.toLowerCase();

    // 检测常见的 Verilog/HDL 关键字
    const hasModule = /\bmodule\b/.test(lowerCode);
    const hasAlways = /\balways\b/.test(lowerCode);
    const hasAssign = /\bassign\b/.test(lowerCode);
    const hasEntity = /\bentity\b/.test(lowerCode);
    const hasReg = /\breg\b/.test(lowerCode);
    const hasWire = /\bwire\b/.test(lowerCode);

    // 判断语言类型
    let language = "未知 HDL";
    if (hasEntity) {
      language = "VHDL";
    } else if (hasModule) {
      language = "Verilog/SystemVerilog";
    }

    // 根据分析类型生成不同的检查结果
    if (analysisType === "syntax" || analysisType === "general") {
      if (hasModule && !code.includes("endmodule")) {
        issues.push("缺少 endmodule 关键字，模块定义不完整");
      }
      if (hasAlways && !code.includes("begin")) {
        suggestions.push(
          "always 块中建议使用 begin...end 包裹多条语句，提高可读性"
        );
      }
      if (hasEntity && !code.includes("end entity")) {
        issues.push("VHDL entity 声明可能缺少 end entity 语句");
      }
    }

    if (analysisType === "lint" || analysisType === "general") {
      if (hasReg && hasWire) {
        suggestions.push(
          "代码中同时使用了 reg 和 wire，建议检查信号类型是否正确匹配"
        );
      }
      if (hasAlways && code.includes("*")) {
        suggestions.push(
          '检测到 always @(*) 用法，建议使用 always_comb（SystemVerilog）以提高可综合性'
        );
      }
    }

    if (analysisType === "optimization" || analysisType === "general") {
      if (hasAssign && hasAlways) {
        suggestions.push(
          "同时使用了组合逻辑 assign 和时序逻辑 always，建议检查是否存在竞争条件"
        );
      }
      suggestions.push(
        "建议在关键路径上添加流水线寄存器以提高时序性能"
      );
    }

    if (issues.length === 0) {
      issues.push("未检测到明显语法问题");
    }

    const summary = `[${language}] ${analysisType === "general" ? "综合" : analysisType} 分析完成。发现 ${issues.length} 个问题，${suggestions.length} 条优化建议。`;

    return JSON.stringify({ summary, issues, suggestions });
  },
  {
    name: "code_analyzer",
    description:
      "分析 EDA 相关代码（Verilog、VHDL、SystemVerilog），检测语法问题并提供优化建议",
    schema: CodeAnalysisInputSchema,
  }
);
