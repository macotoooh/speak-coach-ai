"use client";

import useFeedbackLanguage from "@/components/feedback-language/useFeedbackLanguage";
import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";
import { FEEDBACK_LANGUAGE_OPTIONS } from "@/lib/feedback-language";

export default function FeedbackLanguageSelect() {
  const { language, setLanguage } = useFeedbackLanguage();

  return (
    <div className="mt-5 space-y-2">
      <p className="text-sm ui-text-muted">Feedback language</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {FEEDBACK_LANGUAGE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onClick={() => setLanguage(option.value)}
            variant={
              language === option.value
                ? BUTTON_VARIANTS.primary
                : BUTTON_VARIANTS.secondary
            }
            size={BUTTON_SIZES.md}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <p className="ui-text-muted text-xs">
        Feedback explanations and pronunciation comments will use this language.
      </p>
    </div>
  );
}
