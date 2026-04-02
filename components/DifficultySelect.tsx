"use client";

import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";
import {
  EXAMPLE_SENTENCE_LEVELS,
  type ExampleSentenceLevel,
} from "@/lib/example-sentence-level";

type DifficultySelectProps = {
  value: ExampleSentenceLevel;
  onChange: (nextValue: ExampleSentenceLevel) => void;
  disabled?: boolean;
  showLabel?: boolean;
};

export default function DifficultySelect({
  value,
  onChange,
  disabled = false,
  showLabel = true,
}: DifficultySelectProps) {
  return (
    <div className="w-full space-y-2 lg:w-auto">
      {showLabel && <p className="text-sm ui-text-muted">Sentence difficulty</p>}
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-surface-2 p-1 lg:inline-grid lg:w-auto">
        {EXAMPLE_SENTENCE_LEVELS.map((option) => (
          <Button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={value === option.value}
            variant={
              value === option.value
                ? BUTTON_VARIANTS.primary
                : BUTTON_VARIANTS.secondary
            }
            size={BUTTON_SIZES.sm}
            className="w-full lg:min-w-32"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
