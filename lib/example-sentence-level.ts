export const EXAMPLE_SENTENCE_LEVELS = [
  { value: "easy", label: "Easy" },
  { value: "middle", label: "Middle" },
  { value: "high", label: "High" },
] as const;

export type ExampleSentenceLevel =
  (typeof EXAMPLE_SENTENCE_LEVELS)[number]["value"];

export const DEFAULT_EXAMPLE_SENTENCE_LEVEL: ExampleSentenceLevel = "easy";

export function isExampleSentenceLevel(
  value: string | null | undefined,
): value is ExampleSentenceLevel {
  return EXAMPLE_SENTENCE_LEVELS.some((level) => level.value === value);
}

export function normalizeExampleSentenceLevel(
  value: string | null | undefined,
): ExampleSentenceLevel {
  if (isExampleSentenceLevel(value)) {
    return value;
  }

  return DEFAULT_EXAMPLE_SENTENCE_LEVEL;
}
