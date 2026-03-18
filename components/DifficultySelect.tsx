"use client";

import {
  EXAMPLE_SENTENCE_LEVELS,
  type ExampleSentenceLevel,
} from "@/lib/example-sentence-level";

type DifficultySelectProps = {
  value: ExampleSentenceLevel;
  onChange: (nextValue: ExampleSentenceLevel) => void;
  disabled?: boolean;
};

export default function DifficultySelect({
  value,
  onChange,
  disabled = false,
}: DifficultySelectProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm ui-text-muted">Sentence difficulty</p>
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-surface-2 p-1">
        {EXAMPLE_SENTENCE_LEVELS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={value === option.value}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
              value === option.value
                ? "bg-primary text-background shadow-sm"
                : "bg-transparent text-foreground hover:bg-background/60"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
