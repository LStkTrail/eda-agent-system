import { StateGraph } from "@langchain/langgraph";
import { MessagesAnnotation } from "@langchain/langgraph";
import { callModel } from "./nodes/callModel";
import { toolNode } from "./nodes/toolNode";

/**
 * 条件路由函数：判断模型是否需要调用工具
 * 如果最后一条消息包含 tool_calls，则路由到工具执行节点；
 * 否则结束对话轮次。
 *
 * 注意：使用 duck-typing 而非 instanceof 检查，
 * 因为 streaming 模式下模型返回 AIMessageChunk 而非 AIMessage
 */
function shouldContinue(
  state: typeof MessagesAnnotation.State
): "tools" | "__end__" {
  const lastMessage = state.messages[state.messages.length - 1];

  if (
    "tool_calls" in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return "tools";
  }

  return "__end__";
}

/**
 * 构建 EDA Agent 工作流状态图
 *
 * 流程：
 * __start__ → callModel → [判断是否有工具调用]
 *                            ├── 有 → tools → callModel（循环）
 *                            └── 无 → __end__
 */
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("callModel", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "callModel")
  .addConditionalEdges("callModel", shouldContinue)
  .addEdge("tools", "callModel");

/** 编译后的可执行图实例 */
export const graph = workflow.compile();
