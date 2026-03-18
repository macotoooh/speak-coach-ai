import { NextResponse } from "next/server";
import {
  normalizeExampleSentenceLevel,
  type ExampleSentenceLevel,
} from "@/lib/example-sentence-level";

type ChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type ExampleSentenceRequest = {
  level?: string;
};

function buildPrompt(level: ExampleSentenceLevel) {
  switch (level) {
    case "middle":
      return {
        profile:
          "natural everyday sentence, moderate length, common conversational structure with a conjunction when helpful",
        words: "10-14 words",
      };
    case "high":
      return {
        profile:
          "advanced but natural sentence, slightly challenging vocabulary and pronunciation, with some consonant clusters or stress-heavy words",
        words: "12-18 words",
      };
    case "easy":
    default:
      return {
        profile:
          "simple daily English, short sentence, common vocabulary, basic tense, easy-to-pronounce words",
        words: "6-10 words",
      };
  }
}

function normalizeSentence(content: string) {
  return content
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ");
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as ExampleSentenceRequest;
    const level = normalizeExampleSentenceLevel(body.level);
    const { profile, words } = buildPrompt(level);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4.1-mini",
        temperature: 0.9,
        messages: [
          {
            role: "system",
            content:
              "You create exactly one English practice sentence for speaking drills. Return only the sentence. Do not include bullets, quotes, labels, multiple options, or explanations.",
          },
          {
            role: "user",
            content: `
Generate one English sentence for speaking practice.

Difficulty: ${level}
Target profile: ${profile}
Length: ${words}

Rules:
- Return exactly one sentence in natural English.
- Keep it suitable for pronunciation and shadowing practice.
- Do not include line breaks.
- Do not include surrounding quotes.
`.trim(),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sentence generation failed: ${errorText}`);
    }

    const data = (await response.json()) as ChatCompletionsResponse;
    const content = data.choices?.[0]?.message?.content;
    const sentence =
      typeof content === "string" ? normalizeSentence(content) : "";

    if (!sentence) {
      throw new Error("Generated sentence was empty.");
    }

    return NextResponse.json({ sentence });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate example sentence.", detail: message },
      { status: 500 },
    );
  }
}
