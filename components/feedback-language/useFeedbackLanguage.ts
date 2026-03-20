"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_FEEDBACK_LANGUAGE,
  FEEDBACK_LANGUAGE_EVENT,
  FEEDBACK_LANGUAGE_STORAGE_KEY,
  readFeedbackLanguage,
  subscribeFeedbackLanguage,
  type FeedbackLanguage,
} from "@/lib/feedback-language";

export default function useFeedbackLanguage() {
  const language = useSyncExternalStore(
    subscribeFeedbackLanguage,
    readFeedbackLanguage,
    () => DEFAULT_FEEDBACK_LANGUAGE,
  );

  const setLanguage = (nextLanguage: FeedbackLanguage) => {
    try {
      localStorage.setItem(FEEDBACK_LANGUAGE_STORAGE_KEY, nextLanguage);
      window.dispatchEvent(new Event(FEEDBACK_LANGUAGE_EVENT));
    } catch {
      // ignore localStorage failures
    }
  };

  return {
    language,
    setLanguage,
  };
}
