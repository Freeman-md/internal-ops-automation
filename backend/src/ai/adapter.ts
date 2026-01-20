import { generateText, jsonSchema, tool } from "ai";
import { getAIClientConfig, getAIProvider } from "@/ai/provider";
import { aiTools, fromToolId, getToolByName, toToolId } from "@/ai/tools";

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

function inferToolFromPrompt(prompt: string) {
  const text = prompt.toLowerCase();

  if (text.includes("triage") && /(inspect|check|verify|queue)/.test(text)) {
    return "triage.inspect";
  }

  if (text.includes("ticket") && /(inspect|check|verify|queue|state)/.test(text)) {
    return "tickets.inspect";
  }

  if (text.includes("status") && /(session|auth|health)/.test(text)) {
    return text.includes("auth") ? "status.authAction" : "status.session";
  }

  if (text.includes("authenticated action")) {
    return "status.authAction";
  }

  return null;
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
    name: fromToolId(call.toolName),
    args: call.args,
  }));

  const toolResults = (result.toolResults as Array<{
    toolName: string;
    result: unknown;
  }>).map((toolResult) => ({
    name: fromToolId(toolResult.toolName),
    result: toolResult.result,
  }));

  if (toolCalls.length === 0) {
    const inferred = inferToolFromPrompt(prompt);
    if (inferred) {
      const toolDef = getToolByName(inferred);
      if (toolDef) {
        const result = await toolDef.run({} as never);
        return {
          matched: true,
          text: `Running ${inferred} based on your request.`,
          toolCalls: [{ name: inferred, args: {} }],
          toolResults: [{ name: inferred, result }],
        };
      }
    }

    return {
      matched: false,
      text: "I couldn't determine a specific workflow to run from that request.",
      toolCalls: [],
      toolResults: [],
    };
  }

  return {
    matched: toolCalls.length > 0,
    text: result.text,
    toolCalls,
    toolResults,
  };
}
