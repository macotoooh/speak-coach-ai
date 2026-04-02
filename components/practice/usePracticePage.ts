"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CELEBRATION_VISIBLE_MS,
  EMPTY_LEARNING_STATS,
  INITIAL_PRACTICE_TEXT,
} from "@/components/practice/constants";
import {
  buildPracticeRecordId,
  calculateLearningStats,
  getApiErrorMessage,
  getCurrentCorrection,
  getUnknownErrorMessage,
} from "@/components/practice/helpers";
import type {
  SelectionRange,
  TextFeedbackResult,
} from "@/components/practice/types";
import {
  DEFAULT_EXAMPLE_SENTENCE_LEVEL,
  type ExampleSentenceLevel,
} from "@/lib/example-sentence-level";
import {
  DEFAULT_FEEDBACK_LANGUAGE,
  readFeedbackLanguage,
  type FeedbackLanguage,
} from "@/lib/feedback-language";
import {
  buildPracticeFingerprint,
  readLatestPracticeFingerprint,
  readPracticeRecordById,
  readPracticeHistory,
  savePracticeHistory,
} from "@/lib/practice-history";
import {
  getPrimaryWeaknessTag,
  getWeaknessTagLabel,
  type WeaknessTag,
} from "@/lib/weakness-tags";
import type { PronunciationFeedback } from "@/types/pronunciation";
import type { PracticeRecord } from "@/types/PracticeRecord";
import type { TextFeedbackResponse } from "@/types/text-feedback";

type UsePracticePageParams = {
  reviewId?: string;
};

export default function usePracticePage({
  reviewId,
}: UsePracticePageParams = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [text, setText] = useState(INITIAL_PRACTICE_TEXT);
  const [difficultyLevel, setDifficultyLevel] = useState<ExampleSentenceLevel>(
    DEFAULT_EXAMPLE_SENTENCE_LEVEL,
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(
    null,
  );
  const [selectedText, setSelectedText] = useState("");
  const [textFeedback, setTextFeedback] = useState<TextFeedbackResult | null>(
    null,
  );
  const [isTextAnalyzing, setIsTextAnalyzing] = useState(false);
  const [isGeneratingSentence, setIsGeneratingSentence] = useState(false);
  const [sentenceGenerationError, setSentenceGenerationError] = useState<
    string | null
  >(null);
  const [generatedSentence, setGeneratedSentence] = useState<string | null>(
    null,
  );
  const [textFeedbackError, setTextFeedbackError] = useState<string | null>(
    null,
  );
  const [spokenText, setSpokenText] = useState("");
  const [aiFeedback, setAiFeedback] = useState<PronunciationFeedback | null>(
    null,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedFingerprint, setLastSavedFingerprint] = useState<
    string | null
  >(null);
  const [learningStats, setLearningStats] = useState(EMPTY_LEARNING_STATS);
  const [feedbackLanguage, setFeedbackLanguage] = useState<FeedbackLanguage>(
    DEFAULT_FEEDBACK_LANGUAGE,
  );
  const [showNinetyCelebration, setShowNinetyCelebration] = useState(false);
  const [reviewSentence, setReviewSentence] = useState<string | null>(null);
  const [recommendedSentence, setRecommendedSentence] = useState<string | null>(
    null,
  );
  const [recommendedWeakness, setRecommendedWeakness] =
    useState<WeaknessTag | null>(null);
  const [isGeneratingRecommendedSentence, setIsGeneratingRecommendedSentence] =
    useState(false);
  const [recommendedSentenceError, setRecommendedSentenceError] = useState<
    string | null
  >(null);
  const isSavingRef = useRef(false);
  const appliedReviewIdRef = useRef<string | null>(null);

  useEffect(() => {
    const history = readPracticeHistory();
    setLearningStats(calculateLearningStats(history));
    setLastSavedFingerprint(readLatestPracticeFingerprint());
    setFeedbackLanguage(readFeedbackLanguage());
  }, []);

  const fetchExampleSentence = useCallback(
    async (focusWeakness?: WeaknessTag | null) => {
      const response = await fetch("/api/example-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level: difficultyLevel,
          focusWeakness: focusWeakness ?? undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to generate sentence."),
        );
      }

      const result = (await response.json()) as { sentence?: string };
      const nextSentence = String(result.sentence ?? "").trim();

      if (!nextSentence) {
        throw new Error("Generated sentence was empty.");
      }

      return nextSentence;
    },
    [difficultyLevel],
  );

  const loadRecommendedSentence = useCallback(
    async (history: PracticeRecord[]) => {
      const topWeakness = getPrimaryWeaknessTag(history);
      setRecommendedWeakness(topWeakness);
      setRecommendedSentenceError(null);

      if (!topWeakness) {
        setRecommendedSentence(null);
        return;
      }

      setIsGeneratingRecommendedSentence(true);

      try {
        const nextSentence = await fetchExampleSentence(topWeakness);
        setRecommendedSentence(nextSentence);
      } catch (error) {
        setRecommendedSentence(null);
        setRecommendedSentenceError(
          getUnknownErrorMessage(
            error,
            "Failed to generate a recommended sentence.",
          ),
        );
      } finally {
        setIsGeneratingRecommendedSentence(false);
      }
    },
    [fetchExampleSentence],
  );

  useEffect(() => {
    const history = readPracticeHistory();
    void loadRecommendedSentence(history);
  }, [loadRecommendedSentence]);

  useEffect(() => {
    if (!showNinetyCelebration) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowNinetyCelebration(false);
    }, CELEBRATION_VISIBLE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [showNinetyCelebration]);

  const resetTextFeedbackState = () => {
    setSelectionRange(null);
    setSelectedText("");
    setTextFeedback(null);
    setTextFeedbackError(null);
  };

  const resetPronunciationState = () => {
    setFeedbackError(null);
    setAiFeedback(null);
    setSpokenText("");
  };

  const clearSaveMessage = () => {
    setSaveMessage(null);
  };

  useEffect(() => {
    if (!reviewId) {
      appliedReviewIdRef.current = null;
      setReviewSentence(null);
      return;
    }

    if (appliedReviewIdRef.current === reviewId) {
      return;
    }

    const record = readPracticeRecordById(reviewId);
    if (!record) {
      appliedReviewIdRef.current = null;
      setReviewSentence(null);
      return;
    }

    appliedReviewIdRef.current = reviewId;
    setReviewSentence(record.sentence);
    setText(record.sentence);
    setGeneratedSentence(null);
    resetTextFeedbackState();
    resetPronunciationState();
    clearSaveMessage();
    setSentenceGenerationError(null);
  }, [reviewId]);

  const handleTextChange = (nextText: string) => {
    setText(nextText);
    setTextFeedback(null);
    setTextFeedbackError(null);
    clearSaveMessage();
  };

  const analyzePronunciationFromAudio = async (
    targetText: string,
    audioBlob: Blob,
  ) => {
    setIsAnalyzing(true);
    resetPronunciationState();
    clearSaveMessage();

    try {
      const formData = new FormData();
      formData.append("targetText", targetText);
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("feedbackLanguage", feedbackLanguage);

      const response = await fetch("/api/pronunciation-feedback", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            "Failed to analyze pronunciation.",
          ),
        );
      }

      const result = (await response.json()) as PronunciationFeedback;
      setAiFeedback(result);
      setSpokenText(result.transcribedText);
      if (result.overallScore >= 90) {
        setShowNinetyCelebration(true);
      }
    } catch (error) {
      setFeedbackError(
        getUnknownErrorMessage(error, "Failed to analyze pronunciation."),
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRecordedAudio = (audioBlob: Blob) => {
    void analyzePronunciationFromAudio(text, audioBlob);
  };

  const generateExampleSentence = async () => {
    setReviewSentence(null);
    appliedReviewIdRef.current = null;
    router.replace(pathname, { scroll: false });
    setIsGeneratingSentence(true);
    setSentenceGenerationError(null);

    try {
      const nextSentence = await fetchExampleSentence();
      setGeneratedSentence(nextSentence);
    } catch (error) {
      setSentenceGenerationError(
        getUnknownErrorMessage(error, "Failed to generate sentence."),
      );
    } finally {
      setIsGeneratingSentence(false);
    }
  };

  const applyGeneratedSentence = () => {
    if (!generatedSentence) {
      return;
    }

    setReviewSentence(null);
    appliedReviewIdRef.current = null;
    router.replace(pathname, { scroll: false });
    setText(generatedSentence);
    setGeneratedSentence(null);
    resetTextFeedbackState();
    resetPronunciationState();
    clearSaveMessage();
  };

  const dismissGeneratedSentence = () => {
    setGeneratedSentence(null);
    setSentenceGenerationError(null);
  };

  const useRecommendedSentence = () => {
    if (!recommendedSentence) {
      return;
    }

    setReviewSentence(null);
    appliedReviewIdRef.current = null;
    router.replace(pathname, { scroll: false });
    setText(recommendedSentence);
    resetTextFeedbackState();
    resetPronunciationState();
    clearSaveMessage();
  };

  const refreshRecommendedSentence = async () => {
    const history = readPracticeHistory();
    await loadRecommendedSentence(history);
  };

  const updateSelectionState = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;

    if (start === end) {
      resetTextFeedbackState();
      return;
    }

    setSelectionRange({ start, end });
    setSelectedText(text.slice(start, end));
    setTextFeedback(null);
    setTextFeedbackError(null);
  };

  const analyzeSelectedText = async () => {
    if (!selectionRange) {
      setTextFeedbackError("Please select text in the textarea first.");
      return;
    }

    const currentSelectedText = text.slice(
      selectionRange.start,
      selectionRange.end,
    );
    if (currentSelectedText.trim().length === 0) {
      setTextFeedbackError("Please select non-empty text.");
      return;
    }

    setIsTextAnalyzing(true);
    setTextFeedbackError(null);
    setTextFeedback(null);

    try {
      const response = await fetch("/api/text-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullText: text,
          selectedText: currentSelectedText,
          feedbackLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            "Failed to analyze selected text.",
          ),
        );
      }

      const result = (await response.json()) as TextFeedbackResponse;
      setTextFeedback({
        ...result,
        selectedText: currentSelectedText,
        range: selectionRange,
      });
    } catch (error) {
      setTextFeedbackError(
        getUnknownErrorMessage(error, "Failed to analyze selected text."),
      );
    } finally {
      setIsTextAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    if (!textFeedback) {
      return;
    }

    const { start, end } = textFeedback.range;
    const currentSelectedText = text.slice(start, end);

    if (currentSelectedText !== textFeedback.selectedText) {
      setTextFeedbackError(
        "The text changed after analysis. Please select and analyze again.",
      );
      return;
    }

    const nextText = `${text.slice(0, start)}${suggestion}${text.slice(end)}`;
    setText(nextText);
    resetTextFeedbackState();
    setTextFeedbackError(null);

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const nextSelectionEnd = start + suggestion.length;
    textarea.focus();
    textarea.setSelectionRange(start, nextSelectionEnd);
  };

  const saveToHistory = () => {
    if (isSavingRef.current) {
      return;
    }

    if (!aiFeedback) {
      setSaveMessage("Analyze pronunciation first, then save.");
      return;
    }

    const correction = getCurrentCorrection(textFeedback);
    const currentFingerprint = buildPracticeFingerprint({
      sentence: text,
      correction,
      pronunciationScore: aiFeedback.overallScore,
    });

    if (currentFingerprint === lastSavedFingerprint) {
      setSaveMessage("No changes since the last saved record.");
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const parsed = readPracticeHistory();
      const latest = parsed[0];

      if (
        latest &&
        buildPracticeFingerprint({
          sentence: latest.sentence,
          correction: latest.correction,
          pronunciationScore: latest.pronunciationScore,
        }) === currentFingerprint
      ) {
        setLastSavedFingerprint(currentFingerprint);
        setSaveMessage("No changes since the last saved record.");
        return;
      }

      const newRecord: PracticeRecord = {
        id: buildPracticeRecordId(),
        sentence: text,
        correction,
        pronunciationScore: aiFeedback.overallScore,
        createdAt: new Date().toISOString(),
        weaknessTags: aiFeedback.weaknessTags,
      };

      const nextHistory = [newRecord, ...parsed];
      savePracticeHistory(nextHistory);
      setLearningStats(calculateLearningStats(nextHistory));
      setLastSavedFingerprint(currentFingerprint);
      setSaveMessage("Saved to history.");
      void loadRecommendedSentence(nextHistory);
    } catch {
      setSaveMessage("Failed to save history.");
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const currentCorrection = getCurrentCorrection(textFeedback);
  const currentFingerprint = aiFeedback
    ? buildPracticeFingerprint({
        sentence: text,
        correction: currentCorrection,
        pronunciationScore: aiFeedback.overallScore,
      })
    : null;
  const isSaveDisabled =
    !aiFeedback || isSaving || currentFingerprint === lastSavedFingerprint;

  const exitReviewMode = () => {
    setReviewSentence(null);
    appliedReviewIdRef.current = null;
    router.replace(pathname, { scroll: false });
  };

  return {
    aiFeedback,
    applySuggestion,
    analyzeSelectedText,
    difficultyLevel,
    feedbackError,
    generateExampleSentence,
    handleRecordedAudio,
    handleTextChange,
    isAnalyzing,
    isGeneratingSentence,
    isGeneratingRecommendedSentence,
    isSaveDisabled,
    isSaving,
    isTextAnalyzing,
    learningStats,
    generatedSentence,
    recommendedSentence,
    recommendedSentenceError,
    recommendedWeaknessLabel: recommendedWeakness
      ? getWeaknessTagLabel(recommendedWeakness)
      : null,
    applyGeneratedSentence,
    dismissGeneratedSentence,
    refreshRecommendedSentence,
    reviewSentence,
    saveMessage,
    saveToHistory,
    selectedText,
    selectionRange,
    sentenceGenerationError,
    showNinetyCelebration,
    spokenText,
    setDifficultyLevel,
    text,
    textFeedback,
    textFeedbackError,
    textareaRef,
    updateSelectionState,
    exitReviewMode,
    useRecommendedSentence,
  };
}
