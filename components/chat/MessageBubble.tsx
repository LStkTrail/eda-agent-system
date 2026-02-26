"use client";

import { Bubble } from "@ant-design/x";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import type { UIMessage } from "ai";
import { isToolOrDynamicToolUIPart } from "ai";
import ToolThoughtChain from "./ThoughtChain";

interface MessageBubbleProps {
  messages: UIMessage[];
  isStreaming: boolean;
}

/** 从 UIMessage.parts 中提取纯文本内容 */
function extractTextContent(message: UIMessage): string {
  const textParts = message.parts
    .filter(
      (part): part is Extract<typeof part, { type: "text" }> =>
        part.type === "text"
    )
    .map((part) => part.text);
  return textParts.join("") || "";
}

/** 检查消息是否包含工具调用 */
function hasToolCalls(message: UIMessage): boolean {
  return message.parts.some((part) => isToolOrDynamicToolUIPart(part));
}

export default function MessageBubble({
  messages,
  isStreaming,
}: MessageBubbleProps) {
  // 判断某条消息是否是最后一条 assistant 消息（用于控制 typing 动画）
  const lastAssistantIdx = messages.findLastIndex(
    (m) => m.role === "assistant"
  );

  return (
    <Bubble.List
      style={{ height: "100%" }}
      autoScroll
      role={{
        user: {
          placement: "end",
          avatar: <Avatar icon={<UserOutlined />} style={{ background: "#1677ff" }} />,
        },
        ai: {
          placement: "start",
          avatar: <Avatar icon={<RobotOutlined />} style={{ background: "#52c41a" }} />,
        },
      }}
      items={messages.map((msg, idx) => {
        const text = extractTextContent(msg);
        const toolCalls = hasToolCalls(msg);
        const isLastAssistant = idx === lastAssistantIdx;

        return {
          key: msg.id,
          role: msg.role === "user" ? "user" : "ai",
          // 只对最后一条 AI 消息且正在流式输出时启用打字动画
          typing:
            isLastAssistant && isStreaming
              ? { effect: "fade-in" as const, step: 5, interval: 50 }
              : undefined,
          content: toolCalls ? (
            <div>
              <ToolThoughtChain message={msg} />
              {text && <div style={{ marginTop: 8 }}>{text}</div>}
            </div>
          ) : (
            text
          ),
        };
      })}
    />
  );
}
