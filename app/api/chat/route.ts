import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText, CoreMessage } from "ai";
import { buildSystemPrompt, buildMidCallCoachingPrompt, Mode } from "@/lib/prompts";
import { MARKETS, MarketId } from "@/lib/markets";
import { getObjectionById, pickRandom } from "@/lib/objections";

export const runtime = "edge";
export const maxDuration = 60;

interface ChatBody {
  messages: CoreMessage[];
  mode: Mode;
  marketId?: MarketId;
  objectionId?: number | null;
  category?: string | null;
  randomMix?: boolean;
  midCallCoaching?: boolean;
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

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    messages,
    mode,
    marketId,
    objectionId,
    category,
    randomMix,
    midCallCoaching,
  } = body;

  if (!mode || !Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: mode, messages" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const market = marketId ? MARKETS[marketId] : undefined;
  let objection = objectionId ? getObjectionById(objectionId) : null;
  if (randomMix && !objection) objection = pickRandom();

  let system = buildSystemPrompt({
    mode,
    market,
    objection,
    randomMix,
    category,
  });

  if (midCallCoaching) {
    system = `${system}\n\n${buildMidCallCoachingPrompt()}`;
  }

  const anthropic = createAnthropic({ apiKey });

  try {
    const result = await streamText({
      model: anthropic(modelId),
      system,
      messages,
      temperature: 0.8,
      maxTokens: 1024,
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        if (error instanceof Error) return error.message;
        return "Unknown streaming error";
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/chat] error:", err);
    return new Response(
      JSON.stringify({
        error: `Claude call failed: ${message}`,
        model: modelId,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
