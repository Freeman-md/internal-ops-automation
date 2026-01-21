import { useState } from "react";

export function useAiIntent(apiBase: string) {
  const [intentPrompt, setIntentPrompt] = useState("");
  const [intentRunning, setIntentRunning] = useState(false);
  const [intentStream, setIntentStream] = useState("");

  async function runIntent() {
    const prompt = intentPrompt.trim();
    if (!prompt || intentRunning) return;

    setIntentRunning(true);
    setIntentStream("");

    try {
      const response = await fetch(`${apiBase}/api/ai/intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.body) {
        setIntentStream("No stream available.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) {
          const text = decoder.decode(chunk.value, { stream: true });
          setIntentStream((prev) => prev + text);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setIntentStream(message);
    } finally {
      setIntentRunning(false);
    }
  }

  return {
    intentPrompt,
    setIntentPrompt,
    intentRunning,
    intentStream,
    runIntent,
  };
}
