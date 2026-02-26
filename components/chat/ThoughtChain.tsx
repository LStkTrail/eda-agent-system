"use client";

import { ThoughtChain as AntThoughtChain } from "@ant-design/x";
import { isToolOrDynamicToolUIPart } from "ai";
import type { UIMessage } from "ai";
import { TOOL_NAME_MAP } from "@/lib/shared/types";

interface ToolThoughtChainProps {
  message: UIMessage;
}

/** 格式化工具结果为可展示的 ReactNode */
function formatResult(result: unknown): React.ReactNode {
  try {
    const parsed =
      typeof result === "string" ? JSON.parse(result) : result;
    return (
      <pre
        style={{
          fontSize: 12,
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  } catch {
    return <span>{String(result)}</span>;
  }
}

/**
 * 从 AI SDK 5.x UIMessage 的 parts 中提取工具调用信息，
 * 映射为 ThoughtChain 组件的 items 格式。
 *
 * AI SDK 5.x 中工具 part 的结构：
 * - type: `tool-${toolName}` (如 "tool-code_analyzer")
 * - toolCallId, state, input, output 直接在 part 上
 * - state: 'input-streaming' | 'input-available' | 'output-available' | 'error'
 */
export default function ToolThoughtChain({ message }: ToolThoughtChainProps) {
  const items: Array<{
    key: string;
    title: string;
    description: React.ReactNode;
    status: "loading" | "success" | "error";
    content: React.ReactNode;
    collapsible: boolean;
  }> = [];

  const seen = new Set<string>();

  for (const part of message.parts) {
    if (!isToolOrDynamicToolUIPart(part)) continue;

    const { toolCallId, state } = part;
    if (seen.has(toolCallId)) continue;
    seen.add(toolCallId);

    // 从 type 字段提取工具名称："tool-code_analyzer" -> "code_analyzer"
    const toolName = part.type.startsWith("tool-")
      ? part.type.slice(5)
      : part.type;
    const displayName = TOOL_NAME_MAP[toolName] ?? toolName;

    let status: "loading" | "success" | "error" = "loading";
    let content: React.ReactNode = null;

    if (state === "output-available") {
      status = "success";
      content = formatResult(part.output);
    } else if (state === "output-error") {
      status = "error";
      content = <span style={{ color: "#ff4d4f" }}>{part.errorText ?? "工具执行失败"}</span>;
    }
    // input-streaming / input-available 保持 loading 状态

    const inputStr = "input" in part && part.input
      ? JSON.stringify(part.input)
      : "{}";

    items.push({
      key: toolCallId,
      title: displayName,
      description: (
        <span style={{ fontSize: 12, color: "#888" }}>
          参数: {inputStr.slice(0, 100)}
          {inputStr.length > 100 ? "..." : ""}
        </span>
      ),
      status,
      content,
      collapsible: true,
    });
  }

  if (items.length === 0) return null;

  return <AntThoughtChain items={items} />;
}
