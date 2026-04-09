import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, CoreMessage } from "ai";
import { buildSummaryPrompt } from "@/lib/prompts";

export const runtime = "edge";
export const maxDuration = 60;

interface SummaryBody {
  messages: CoreMessage[];
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const modelId = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  let body: SummaryBody;
  try {
    body = (await req.json()) as SummaryBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "No messages to summarise" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Anthropic requires the conversation to end with a user message.
  // The chat transcript typically ends with an assistant reply, so we
  // append a user message requesting the summary analysis.
  let safeMessages = [...messages];
  if (safeMessages[safeMessages.length - 1].role === "assistant") {
    safeMessages.push({
      role: "user",
      content: "Please analyze the full conversation above and provide the coaching summary now.",
    });
  }

  const anthropic = createAnthropic({ apiKey });

  try {
    const { text } = await generateText({
      model: anthropic(modelId),
      system: buildSummaryPrompt(),
      messages: safeMessages,
      maxTokens: 1024,
      temperature: 0.3,
    });

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let summary: unknown;
    try {
      summary = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse summary JSON", raw: text }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(summary), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/summary] error:", err);
    return new Response(
      JSON.stringify({ error: `Claude call failed: ${message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
