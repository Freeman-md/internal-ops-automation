import "dotenv/config";

export type AIProviderName = "openai";

export const AI_PROVIDER =
  (process.env.AI_PROVIDER as AIProviderName | undefined) ?? "openai";

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
