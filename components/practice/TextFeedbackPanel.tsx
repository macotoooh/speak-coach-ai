import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";
import type { TextFeedbackResult } from "@/components/practice/types";

type TextFeedbackPanelProps = {
  isTextAnalyzing: boolean;
  textFeedback: TextFeedbackResult | null;
  textFeedbackError: string | null;
  onApplySuggestion: (suggestion: string) => void;
};

export default function TextFeedbackPanel({
  isTextAnalyzing,
  textFeedback,
  textFeedbackError,
  onApplySuggestion,
}: TextFeedbackPanelProps) {
  if (!isTextAnalyzing && !textFeedback && !textFeedbackError) {
    return null;
  }

  return (
    <section className="ui-card w-full max-w-2xl rounded-lg p-4">
      <h2 className="text-lg font-semibold">Text Grammar Feedback</h2>

      {isTextAnalyzing && (
        <p className="ui-text-muted mt-2">Analyzing selected text...</p>
      )}

      {textFeedbackError && <p className="mt-2 text-red-600">{textFeedbackError}</p>}

      {textFeedback && (
        <div className="mt-3 space-y-3">
          <p>
            <strong>Selected text:</strong> {textFeedback.selectedText}
          </p>
          <p>{textFeedback.explanation}</p>
          {textFeedback.suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Suggestions</p>
              {textFeedback.suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion}-${index}`}
                  className="ui-card space-y-2 rounded p-2"
                >
                  <p>{suggestion}</p>
                  <Button
                    variant={BUTTON_VARIANTS.primary}
                    size={BUTTON_SIZES.sm}
                    onClick={() => onApplySuggestion(suggestion)}
                  >
                    Apply this suggestion
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
