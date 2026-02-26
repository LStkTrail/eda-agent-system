"use client";

import { useState } from "react";
import { Sender } from "@ant-design/x";

interface ChatInputProps {
  onSend: (message: string) => void;
  loading: boolean;
}

export default function ChatInput({ onSend, loading }: ChatInputProps) {
  const [value, setValue] = useState("");

  return (
    <Sender
      value={value}
      onChange={setValue}
      onSubmit={(message) => {
        if (!message.trim()) return;
        onSend(message);
        setValue("");
      }}
      loading={loading}
      placeholder="请输入您的 EDA 相关问题..."
      submitType="enter"
    />
  );
}
