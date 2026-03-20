import type { RefObject } from "react";
import DifficultySelect from "@/components/DifficultySelect";
import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";
import { getGenerateButtonLabel } from "@/components/practice/helpers";
import type { SelectionRange } from "@/components/practice/types";
import type { ExampleSentenceLevel } from "@/lib/example-sentence-level";

type SentenceEditorSectionProps = {
  difficultyLevel: ExampleSentenceLevel;
  isGeneratingSentence: boolean;
  sentenceGenerationError: string | null;
  text: string;
  selectedText: string;
  selectionRange: SelectionRange | null;
  isTextAnalyzing: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onDifficultyChange: (value: ExampleSentenceLevel) => void;
  onGenerateSentence: () => void;
  onTextChange: (value: string) => void;
  onTextSelect: () => void;
  onAnalyzeText: () => void;
};

export default function SentenceEditorSection({
  difficultyLevel,
  isGeneratingSentence,
  sentenceGenerationError,
  text,
  selectedText,
  selectionRange,
  isTextAnalyzing,
  textareaRef,
  onDifficultyChange,
  onGenerateSentence,
  onTextChange,
  onTextSelect,
  onAnalyzeText,
}: SentenceEditorSectionProps) {
  return (
    <div className="w-full max-w-2xl space-y-2">
      <div className="ui-card rounded-lg p-4">
        <div className="space-y-4">
          <DifficultySelect
            value={difficultyLevel}
            onChange={onDifficultyChange}
            disabled={isGeneratingSentence}
          />
          <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="ui-text-muted text-sm">
              Generate a new practice sentence based on the selected
              difficulty.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={onGenerateSentence}
                disabled={isGeneratingSentence}
                variant={BUTTON_VARIANTS.primary}
                size={BUTTON_SIZES.md}
                fullWidth
                className="sm:w-auto"
              >
                {getGenerateButtonLabel(text, isGeneratingSentence)}
              </Button>
            </div>
          </div>
        </div>
        {sentenceGenerationError && (
          <p className="mt-3 text-sm text-red-600">{sentenceGenerationError}</p>
        )}
      </div>
      <textarea
        ref={textareaRef}
        className="ui-input w-full rounded p-3 selection:bg-slate-300 selection:text-slate-900"
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        onSelect={onTextSelect}
        name="targetText"
        rows={4}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="ui-text-muted line-clamp-2 text-sm">
          {selectedText
            ? `Selected: "${selectedText}"`
            : "Select text to analyze or listen"}
        </p>
        <Button
          onClick={onAnalyzeText}
          disabled={!selectionRange || isTextAnalyzing}
          variant={BUTTON_VARIANTS.secondary}
          size={BUTTON_SIZES.md}
          fullWidth
          className="sm:w-auto"
        >
          {isTextAnalyzing ? "Analyzing..." : "Analyze text"}
        </Button>
      </div>
    </div>
  );
}
