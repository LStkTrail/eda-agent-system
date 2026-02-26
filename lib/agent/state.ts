import { MessagesAnnotation } from "@langchain/langgraph";

/**
 * Agent 状态定义
 * 直接复用 LangGraph 内置的 MessagesAnnotation，
 * 它已包含 messages 字段及自动合并消息的 reducer 逻辑
 */
export const AgentState = MessagesAnnotation;
