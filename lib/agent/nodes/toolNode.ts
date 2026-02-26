import { ToolNode } from "@langchain/langgraph/prebuilt";
import { edaTools } from "@/lib/agent/tools";

/**
 * toolNode 节点：执行 LLM 输出的工具调用
 * 使用 LangGraph 内置的 ToolNode，自动匹配工具名称并执行
 */
export const toolNode = new ToolNode(edaTools);
