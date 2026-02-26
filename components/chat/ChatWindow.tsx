"use client";

import { useChat } from "@ai-sdk/react";
import { Alert, Flex, Typography } from "antd";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

export default function ChatWindow() {
  // AI SDK 5.x 默认使用 DefaultChatTransport，端点为 /api/chat
  const { messages, sendMessage, status, error } = useChat();

  const isStreaming = status === "streaming";

  return (
    <Flex
      vertical
      style={{
        height: "100%",
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
      }}
      gap={16}
    >
      {/* 消息列表区域 */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {messages.length === 0 ? (
          <Flex
            align="center"
            justify="center"
            style={{ height: "100%", opacity: 0.5 }}
          >
            <Typography.Text type="secondary">
              发送消息开始对话，试试问 EDA 相关问题
            </Typography.Text>
          </Flex>
        ) : (
          <MessageBubble messages={messages} isStreaming={isStreaming} />
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert
          type="error"
          message="请求失败"
          description={error.message}
          showIcon
          closable
        />
      )}

      {/* 输入框 */}
      <div style={{ flexShrink: 0, paddingBottom: 16 }}>
        <ChatInput
          onSend={(text) => sendMessage({ text })}
          loading={isStreaming}
        />
      </div>
    </Flex>
  );
}
