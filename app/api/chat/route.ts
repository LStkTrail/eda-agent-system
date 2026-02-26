import { createUIMessageStreamResponse, createUIMessageStream } from "ai";
import { HumanMessage, AIMessage, AIMessageChunk } from "@langchain/core/messages";
import { graph } from "@/lib/agent/graph";

/**
 * 将前端 useChat 传来的消息数组转换为 LangChain BaseMessage 格式
 * AI SDK 5.x 发送的消息包含 parts 数组，content 可能为空字符串
 */
function convertToLangChainMessages(
  messages: Array<{ role: string; content?: string; parts?: Array<{ type: string; text?: string }> }>
) {
  return messages.map((msg) => {
    // 优先从 parts 中提取文本，回退到 content
    let text = msg.content ?? "";
    if (msg.parts) {
      const textParts = msg.parts
        .filter((p) => p.type === "text" && p.text)
        .map((p) => p.text)
        .join("");
      if (textParts) text = textParts;
    }
    if (msg.role === "user") {
      return new HumanMessage(text);
    }
    return new AIMessage(text);
  });
}

export async function POST(req: Request) {
  const t0 = performance.now();

  try {
    const { messages } = await req.json();
    const langchainMessages = convertToLangChainMessages(messages);

    console.log(`[Timing] 请求解析完成: +${(performance.now() - t0).toFixed(0)}ms`);

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        console.log(`[Timing] createUIMessageStream execute 开始: +${(performance.now() - t0).toFixed(0)}ms`);

        // 使用 LangGraph streamEvents 获取细粒度事件
        const eventStream = graph.streamEvents(
          { messages: langchainMessages },
          { version: "v2" }
        );

        let textId = "msg-1";
        let textStarted = false;
        let firstTokenLogged = false;

        /**
         * 工具调用 ID 队列：保证 tool-input-available 和 tool-output-available
         * 使用相同的 toolCallId。
         *
         * 根因：on_chat_model_end 中 LLM 返回的 tc.id 与 on_tool_end 中
         * event.run_id / metadata 不一致，导致 AI SDK 报错
         * "tool-output-error must be preceded by a tool-input-available"。
         * 使用 FIFO 队列匹配，因为 ToolNode 按顺序执行工具。
         */
        const pendingToolCallIds: string[] = [];

        for await (const event of eventStream) {
          // 处理 LLM token 级流式输出
          if (event.event === "on_chat_model_stream") {
            const chunk = event.data?.chunk;
            if (chunk instanceof AIMessageChunk) {
              // 处理文本内容
              const content = chunk.content;
              if (typeof content === "string" && content.length > 0) {
                if (!firstTokenLogged) {
                  console.log(`[Timing] 首个 token 到达: +${(performance.now() - t0).toFixed(0)}ms`);
                  firstTokenLogged = true;
                }
                if (!textStarted) {
                  writer.write({ type: "text-start", id: textId });
                  textStarted = true;
                }
                writer.write({ type: "text-delta", delta: content, id: textId });
              }

              // 处理工具调用 chunk（结束当前文本流以便 tool 事件能正确发送）
              if (chunk.tool_call_chunks && chunk.tool_call_chunks.length > 0) {
                for (const toolChunk of chunk.tool_call_chunks) {
                  if (toolChunk.name && toolChunk.id) {
                    if (textStarted) {
                      writer.write({ type: "text-end", id: textId });
                      textStarted = false;
                    }
                  }
                }
              }
            }
          }

          // 处理 LLM 调用结束 - 提取完整的工具调用信息
          if (event.event === "on_chat_model_end") {
            const output = event.data?.output;
            if (output instanceof AIMessageChunk || output?.tool_calls) {
              const toolCalls = output.tool_calls ?? [];
              for (const tc of toolCalls) {
                const toolCallId = tc.id ?? `tc-${Date.now()}`;
                // 入队，供后续 on_tool_end 匹配
                pendingToolCallIds.push(toolCallId);
                writer.write({
                  type: "tool-input-available",
                  toolCallId,
                  toolName: tc.name,
                  input: tc.args,
                });
                console.log(`[Timing] 工具调用 ${tc.name} (${toolCallId}): +${(performance.now() - t0).toFixed(0)}ms`);
              }
            }
            // 结束文本流（如果有）
            if (textStarted) {
              writer.write({ type: "text-end", id: textId });
              textStarted = false;
            }
          }

          // 处理工具执行结果 - 从队列中取出匹配的 toolCallId
          if (event.event === "on_tool_end") {
            const toolCallId = pendingToolCallIds.shift() ?? event.run_id;
            const output = event.data?.output;
            let result: unknown = "";
            if (output && typeof output === "object" && "content" in output) {
              result = output.content;
            } else {
              result = output;
            }
            writer.write({
              type: "tool-output-available",
              toolCallId,
              output: result,
            });
            console.log(`[Timing] 工具执行完成 (${toolCallId}): +${(performance.now() - t0).toFixed(0)}ms`);
            // 工具执行后准备下一轮文本 ID
            textId = `msg-${Date.now()}`;
          }
        }

        // 确保文本流正确关闭
        if (textStarted) {
          writer.write({ type: "text-end", id: textId });
        }
        console.log(`[Timing] 流式传输完成: +${(performance.now() - t0).toFixed(0)}ms`);
      },
      onError: (error) => {
        console.error("[API /chat] Stream error:", error);
        return error instanceof Error ? error.message : "Internal Server Error";
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error: unknown) {
    console.error("[API /chat] Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
