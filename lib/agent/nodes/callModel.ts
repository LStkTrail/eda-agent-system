import { ChatOpenAI } from "@langchain/openai";
import { MessagesAnnotation } from "@langchain/langgraph";
import { edaTools } from "@/lib/agent/tools";

/**
 * 创建绑定了 EDA 工具的 LLM 模型实例
 * 从环境变量读取配置，支持兼容 OpenAI 接口的第三方服务
 */
function createModel() {
  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    configuration: {
      baseURL: process.env.OPENAI_BASE_URL,
    },
    modelName: process.env.OPENAI_MODEL_NAME ?? "gpt-4o-mini",
    streaming: true,
  });

  // 将 EDA 工具绑定到模型，使其能够在对话中调用工具
  return model.bindTools(edaTools);
}

/**
 * callModel 节点：调用 LLM 处理当前消息
 * 模型会根据对话内容自动决定是否调用工具
 */
export async function callModel(
  state: typeof MessagesAnnotation.State
): Promise<typeof MessagesAnnotation.Update> {
  const model = createModel();
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}
