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
  generatedSentence: string | null;
  text: string;
  selectedText: string;
  selectionRange: SelectionRange | null;
  isTextAnalyzing: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  recommendedSentence: string | null;
  recommendedWeaknessLabel: string | null;
  isGeneratingRecommendedSentence: boolean;
  recommendedSentenceError: string | null;
  onDifficultyChange: (value: ExampleSentenceLevel) => void;
  onGenerateSentence: () => void;
  onApplyGeneratedSentence: () => void;
  onDismissGeneratedSentence: () => void;
  onUseRecommendedSentence: () => void;
  onRefreshRecommendedSentence: () => void;
  onTextChange: (value: string) => void;
  onTextSelect: () => void;
  onAnalyzeText: () => void;
};

export default function SentenceEditorSection({
  difficultyLevel,
  isGeneratingSentence,
  sentenceGenerationError,
  generatedSentence,
  text,
  selectedText,
  selectionRange,
  isTextAnalyzing,
  textareaRef,
  recommendedSentence,
  recommendedWeaknessLabel,
  isGeneratingRecommendedSentence,
  recommendedSentenceError,
  onDifficultyChange,
  onGenerateSentence,
  onApplyGeneratedSentence,
  onDismissGeneratedSentence,
  onUseRecommendedSentence,
  onRefreshRecommendedSentence,
  onTextChange,
  onTextSelect,
  onAnalyzeText,
}: SentenceEditorSectionProps) {
  // Render this section only when there is recommendation-related content or state to show.
  const shouldShowRecommendedSection =
    Boolean(recommendedSentence) ||
    Boolean(recommendedWeaknessLabel) ||
    isGeneratingRecommendedSentence ||
    Boolean(recommendedSentenceError);

  return (
    <div className="w-full max-w-3xl space-y-4">
      <div className="ui-card rounded-lg border border-border/80 p-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-300">
              Generate
            </p>
            <p className="ui-text-muted text-sm">
              Create a new candidate sentence without replacing the current
              practice text until you apply it.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm ui-text-muted">Sentence difficulty</p>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-start">
              <DifficultySelect
                value={difficultyLevel}
                onChange={onDifficultyChange}
                disabled={isGeneratingSentence}
                showLabel={false}
              />
              <Button
                onClick={onGenerateSentence}
                disabled={isGeneratingSentence}
                variant={BUTTON_VARIANTS.primary}
                size={BUTTON_SIZES.sm}
                fullWidth
                className="lg:w-auto lg:min-w-48"
              >
                {getGenerateButtonLabel(generatedSentence, isGeneratingSentence)}
              </Button>
            </div>
          </div>
        </div>
        {sentenceGenerationError && (
          <p className="mt-3 text-sm text-red-600">{sentenceGenerationError}</p>
        )}
      </div>
      {generatedSentence && (
        <div className="rounded-xl border border-dashed border-teal-400/60 bg-teal-500/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-teal-200">
                Generated candidate
              </p>
              <p className="ui-text-muted text-sm">
                Review the suggestion first, then apply it to the practice
                field when you are ready.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onDismissGeneratedSentence}
                variant={BUTTON_VARIANTS.secondary}
                size={BUTTON_SIZES.sm}
                className="sm:w-auto"
              >
                Dismiss
              </Button>
              <Button
                onClick={onApplyGeneratedSentence}
                variant={BUTTON_VARIANTS.primary}
                size={BUTTON_SIZES.sm}
                className="sm:w-auto"
              >
                Apply to practice field
              </Button>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-surface-2/80 px-4 py-3">
            <p className="text-sm leading-7">{generatedSentence}</p>
          </div>
        </div>
      )}
      {shouldShowRecommendedSection && (
        <div className="ui-card rounded-lg border-dashed p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Recommended practice focus</p>
              <p className="ui-text-muted text-xs">
                This is a suggested sentence only. It will not be evaluated
                until you apply it to the practice field below.
              </p>
              {recommendedWeaknessLabel && (
                <p className="ui-text-muted text-sm">
                  Based on your recent history: {recommendedWeaknessLabel}
                </p>
              )}
            </div>
            <Button
              onClick={onRefreshRecommendedSentence}
              disabled={isGeneratingRecommendedSentence}
              variant={BUTTON_VARIANTS.secondary}
              size={BUTTON_SIZES.md}
              fullWidth
              className="sm:w-auto"
            >
              {isGeneratingRecommendedSentence
                ? "Refreshing..."
                : "Refresh recommendation"}
            </Button>
          </div>
          {recommendedSentence && (
            <>
              <div className="mt-3 rounded-md bg-surface-2 px-4 py-3">
                <p className="text-sm leading-7">{recommendedSentence}</p>
              </div>
              <Button
                onClick={onUseRecommendedSentence}
                variant={BUTTON_VARIANTS.primary}
                size={BUTTON_SIZES.md}
                fullWidth
                className="mt-3 sm:w-auto"
              >
                Apply to practice field
              </Button>
            </>
          )}
          {recommendedSentenceError && (
            <p className="mt-3 text-sm text-red-600">
              {recommendedSentenceError}
            </p>
          )}
        </div>
      )}
      <div className="ui-card rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <div className="inline-flex w-fit items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
              Practice Sentence
            </div>
            <p className="text-base font-semibold text-foreground">
              Active text for listening, recording, and pronunciation scoring
            </p>
            <p className="ui-text-muted text-sm">
              Edit this field directly. Playback and recording always use the
              current contents below.
            </p>
          </div>
          <textarea
            ref={textareaRef}
            className="ui-input min-h-56 w-full rounded-xl border-2 border-border bg-surface p-4 text-base leading-8 selection:bg-slate-300 selection:text-slate-900"
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            onSelect={onTextSelect}
            name="targetText"
            rows={7}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="ui-text-muted line-clamp-2 text-sm">
              {selectedText
                ? `Selected: "${selectedText}"`
                : "Select text from the practice sentence to analyze or listen"}
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
      </div>
    </div>
  );
}
