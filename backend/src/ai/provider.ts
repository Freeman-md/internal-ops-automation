import { createOpenAI } from "@ai-sdk/openai";
import {
  AI_PROVIDER,
  OPENAI_API_KEY,
  OPENAI_MODEL,
  AIProviderName,
} from "@/config/ai.config";

export type AIProvider = ReturnType<typeof createOpenAI>;

export type AIClientConfig = {
  provider: AIProviderName;
  model: string;
};

export function getAIClientConfig(): AIClientConfig {
  return {
    provider: AI_PROVIDER,
    model: OPENAI_MODEL,
  };
}

export function getAIProvider(): AIProvider {
  switch (AI_PROVIDER) {
    case "openai": {
      if (!OPENAI_API_KEY) {
        throw new Error("Missing OPENAI_API_KEY");
      }
      return createOpenAI({ apiKey: OPENAI_API_KEY });
    }
    default:
      throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`);
  }
}
