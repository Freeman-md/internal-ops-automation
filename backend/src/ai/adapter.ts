import { generateText, jsonSchema, tool } from "ai";
import { getAIClientConfig, getAIProvider } from "@/ai/provider";
import { aiTools, toToolId } from "@/ai/tools";

export type AIIntentResult = {
  matched: boolean;
  text: string;
  toolCalls: Array<{ name: string; args: unknown }>;
  toolResults: Array<{ name: string; result: unknown }>;
};

function buildToolSet() {
  const entries = aiTools.map((definition) => [
    toToolId(definition.name),
    tool({
      description: definition.description,
      parameters: jsonSchema(definition.inputSchema),
      execute: async (args) => definition.run(args as never),
    }),
  ]);

  return Object.fromEntries(entries) as Record<
    string,
    ReturnType<typeof tool>
  >;
}

export async function runAIIntent(prompt: string): Promise<AIIntentResult> {
  const provider = getAIProvider();
  const { model } = getAIClientConfig();
  const tools = buildToolSet();
  type ToolSet = typeof tools;

  const result = await generateText<ToolSet>({
    model: provider(model),
    tools,
    toolChoice: "auto",
    maxSteps: 2,
    system:
      "You are an automation router. Use tools when the user intent matches. If no tool applies, respond normally.",
    prompt,
  });

  const toolCalls = (result.toolCalls as Array<{
    toolName: string;
    args: unknown;
  }>).map((call) => ({
    name: call.toolName,
    args: call.args,
  }));

  const toolResults = (result.toolResults as Array<{
    toolName: string;
    result: unknown;
  }>).map((toolResult) => ({
    name: toolResult.toolName,
    result: toolResult.result,
  }));

  return {
    matched: toolCalls.length > 0,
    text: result.text,
    toolCalls,
    toolResults,
  };
}
