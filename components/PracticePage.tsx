"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFireFlameCurved,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import Player from "@/components/Player";
import Recorder from "@/components/Recorder";
import type { PronunciationFeedback } from "@/types/pronunciation";
import type { TextFeedbackResponse } from "@/types/text-feedback";
import type { PracticeRecord } from "@/types/PracticeRecord";

type SelectionRange = {
  start: number;
  end: number;
};

type TextFeedbackResult = TextFeedbackResponse & {
  range: SelectionRange;
};

const STORAGE_KEY = "practiceHistory";
const XP_PER_PRACTICE = 10;
const XP_BONUS_90_PLUS = 5;
const XP_PER_LEVEL = 100;
const CELEBRATION_VISIBLE_MS = 7000;

type LearningStats = {
  totalPractices: number;
  streakDays: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
  levelProgressPercent: number;
};

const buildFingerprint = (record: {
  sentence: string;
  correction: string;
  pronunciationScore: number;
}) => `${record.sentence}::${record.correction}::${record.pronunciationScore}`;

const toDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const loadHistory = () => {
  if (typeof window === "undefined") {
    return [] as PracticeRecord[];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PracticeRecord[]) : [];
  } catch {
    return [] as PracticeRecord[];
  }
};

const calculateStreakDays = (records: PracticeRecord[]) => {
  const daySet = new Set(
    records.map((record) => toDayKey(new Date(record.createdAt))),
  );
  const today = new Date();
  const cursor = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  if (!daySet.has(toDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!daySet.has(toDayKey(cursor))) {
      return 0;
    }
  }

  let streak = 0;
  while (daySet.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const calculateLearningStats = (records: PracticeRecord[]): LearningStats => {
  const totalPractices = records.length;
  const totalXp = records.reduce((sum, item) => {
    const bonusXp = item.pronunciationScore >= 90 ? XP_BONUS_90_PLUS : 0;
    return sum + XP_PER_PRACTICE + bonusXp;
  }, 0);
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  const xpToNextLevel = XP_PER_LEVEL - xpInLevel;
  const levelProgressPercent = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

  return {
    totalPractices,
    streakDays: calculateStreakDays(records),
    level,
    xpInLevel,
    xpToNextLevel,
    levelProgressPercent,
  };
};

const loadLatestFingerprint = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as PracticeRecord[]) : [];
    const latest = parsed[0];

    if (!latest) {
      return null;
    }

    return buildFingerprint({
      sentence: latest.sentence,
      correction: latest.correction,
      pronunciationScore: latest.pronunciationScore,
    });
  } catch {
    return null;
  }
};

export default function PracticePage() {
  const [text, setText] = useState("The weather in Vancouver is often rainy.");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(
    null,
  );
  const [selectedText, setSelectedText] = useState("");
  const [textFeedback, setTextFeedback] = useState<TextFeedbackResult | null>(
    null,
  );
  const [isTextAnalyzing, setIsTextAnalyzing] = useState(false);
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
  >(loadLatestFingerprint);
  const [learningStats, setLearningStats] = useState<LearningStats>(() =>
    calculateLearningStats(loadHistory()),
  );
  const [showNinetyCelebration, setShowNinetyCelebration] = useState(false);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!showNinetyCelebration) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowNinetyCelebration(false);
    }, CELEBRATION_VISIBLE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [showNinetyCelebration]);

  const analyzePronunciationFromAudio = async (
    targetText: string,
    audioBlob: Blob,
  ) => {
    setIsAnalyzing(true);
    setFeedbackError(null);
    setAiFeedback(null);
    setSpokenText("");
    setSaveMessage(null);

    try {
      const formData = new FormData();
      formData.append("targetText", targetText);
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/pronunciation-feedback", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as {
          error?: string;
          detail?: string;
        } | null;
        const detailMessage = errorPayload?.detail
          ? ` (${errorPayload.detail})`
          : "";
        throw new Error(
          `${errorPayload?.error ?? "Failed to analyze pronunciation."}${detailMessage}`,
        );
      }

      const result = (await response.json()) as PronunciationFeedback;
      setAiFeedback(result);
      setSpokenText(result.transcribedText);
      if (result.overallScore >= 90) {
        setShowNinetyCelebration(true);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to analyze pronunciation.";
      setFeedbackError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRecordedAudio = (audioBlob: Blob) => {
    void analyzePronunciationFromAudio(text, audioBlob);
  };

  const updateSelectionState = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;

    if (start === end) {
      setSelectionRange(null);
      setSelectedText("");
      setTextFeedback(null);
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
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as {
          error?: string;
          detail?: string;
        } | null;
        const detailMessage = errorPayload?.detail
          ? ` (${errorPayload.detail})`
          : "";
        throw new Error(
          `${errorPayload?.error ?? "Failed to analyze selected text."}${detailMessage}`,
        );
      }

      const result = (await response.json()) as TextFeedbackResponse;
      setTextFeedback({
        ...result,
        selectedText: currentSelectedText,
        range: selectionRange,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to analyze selected text.";
      setTextFeedbackError(message);
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
    setSelectionRange(null);
    setSelectedText("");
    setTextFeedback(null);
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

    const correction =
      textFeedback?.suggestions?.[0] ?? textFeedback?.explanation ?? "";
    const currentFingerprint = buildFingerprint({
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
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as PracticeRecord[]) : [];
      const latest = parsed[0];

      if (
        latest &&
        buildFingerprint({
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
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`,
        sentence: text,
        correction,
        pronunciationScore: aiFeedback.overallScore,
        createdAt: new Date().toISOString(),
      };

      const nextHistory = [newRecord, ...parsed];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
      setLearningStats(calculateLearningStats(nextHistory));
      setLastSavedFingerprint(currentFingerprint);
      setSaveMessage("Saved to history.");
    } catch {
      setSaveMessage("Failed to save history.");
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const currentCorrection =
    textFeedback?.suggestions?.[0] ?? textFeedback?.explanation ?? "";
  const currentFingerprint = aiFeedback
    ? buildFingerprint({
        sentence: text,
        correction: currentCorrection,
        pronunciationScore: aiFeedback.overallScore,
      })
    : null;
  const isSaveDisabled =
    !aiFeedback || isSaving || currentFingerprint === lastSavedFingerprint;
  const saveMessageTone = saveMessage?.startsWith("Saved")
    ? "success"
    : saveMessage?.startsWith("Failed")
      ? "error"
      : "info";

  return (
    <main className="flex min-h-full flex-col gap-6 wrap-break-word p-4 sm:p-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Practice</h1>

      <section className="ui-card w-full max-w-2xl space-y-3 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
            <FontAwesomeIcon icon={faFireFlameCurved} className="h-4 w-4" />
            <span>{learningStats.streakDays}-day streak</span>
          </p>
          <p className="text-sm font-semibold">
            Level {learningStats.level} • {learningStats.totalPractices}{" "}
            practices
          </p>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="ui-text-muted">XP Progress</span>
            <span className="ui-text-muted">
              {learningStats.xpInLevel}/{XP_PER_LEVEL} XP
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${learningStats.levelProgressPercent}%` }}
            />
          </div>
          <p className="ui-text-muted mt-1 text-xs">
            {learningStats.xpToNextLevel} XP to next level
          </p>
        </div>
      </section>

      {showNinetyCelebration && (
        <section className="w-full max-w-2xl rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <p className="inline-flex items-center gap-2 text-base font-bold sm:text-lg">
            <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
            <span>90+ Score! Amazing work!</span>
          </p>
          <p className="mt-1 text-sm">
            Save this result to earn bonus XP and level up faster.
          </p>
        </section>
      )}

      <div className="w-full max-w-2xl space-y-2">
        <textarea
          ref={textareaRef}
          className="ui-input w-full rounded p-3 selection:bg-slate-300 selection:text-slate-900"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setTextFeedback(null);
            setTextFeedbackError(null);
            setSaveMessage(null);
          }}
          onSelect={updateSelectionState}
          name="targetText"
          rows={4}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="ui-text-muted line-clamp-2 text-sm">
            {selectedText
              ? `Selected: "${selectedText}"`
              : "Select text to analyze or listen"}
          </p>
          <button
            type="button"
            onClick={() => void analyzeSelectedText()}
            disabled={!selectionRange || isTextAnalyzing}
            className="ui-btn-secondary w-full rounded-md px-3 py-2 text-sm disabled:opacity-50 sm:w-auto"
          >
            {isTextAnalyzing ? "Analyzing..." : "Analyze text"}
          </button>
        </div>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:flex sm:flex-wrap">
        <Player text={text} selectedText={selectedText} />
        <Recorder onRecorded={handleRecordedAudio} disabled={isAnalyzing} />
        <button
          type="button"
          onClick={saveToHistory}
          className="ui-btn-primary w-full rounded-lg px-4 py-2 disabled:opacity-60 sm:w-auto"
          disabled={isSaveDisabled}
        >
          {isSaving ? "Saving..." : "Save to History"}
        </button>
      </div>

      {saveMessage && (
        <p
          role={saveMessageTone === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`w-full max-w-2xl rounded-md border px-3 py-2 text-sm font-medium ${
            saveMessageTone === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : saveMessageTone === "error"
                ? "border-red-300 bg-red-50 text-red-800"
                : "border-amber-300 bg-amber-50 text-amber-800"
          }`}
        >
          {saveMessage}
        </p>
      )}

      {(isTextAnalyzing || textFeedback || textFeedbackError) && (
        <section className="ui-card w-full max-w-2xl rounded-lg p-4">
          <h2 className="text-lg font-semibold">Text Grammar Feedback</h2>

          {isTextAnalyzing && (
            <p className="ui-text-muted mt-2">Analyzing selected text...</p>
          )}

          {textFeedbackError && (
            <p className="mt-2 text-red-600">{textFeedbackError}</p>
          )}

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
                      <button
                        type="button"
                        className="ui-btn-primary rounded px-3 py-1 text-sm"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        Apply this suggestion
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {spokenText && (
        <p className="ui-text-muted">
          <strong>You said:</strong> {spokenText}
        </p>
      )}

      {(isAnalyzing || aiFeedback || feedbackError) && (
        <section className="ui-card w-full max-w-2xl rounded-lg p-4">
          <h2 className="text-lg font-semibold">AI Pronunciation Feedback</h2>

          {isAnalyzing && (
            <p className="ui-text-muted mt-2">Analyzing your speech...</p>
          )}

          {feedbackError && (
            <p className="mt-2 text-red-600">{feedbackError}</p>
          )}

          {aiFeedback && (
            <div className="mt-3 space-y-3">
              <p>
                <strong>AI Score:</strong> {aiFeedback.overallScore}/100
              </p>
              <p>
                <strong>Rhythm Score:</strong>{" "}
                {aiFeedback.rhythmScore ?? aiFeedback.aiTimingScore ?? "-"}
                /100
              </p>
              <p>
                <strong>Segmental Score:</strong>{" "}
                {aiFeedback.segmentalScore ?? "-"}/100
              </p>
              <p>
                <strong>Fluency Score:</strong> {aiFeedback.fluencyScore ?? "-"}
                /100
              </p>
              <p className="ui-text-muted text-sm">
                Score basis: AI overall score from audio analysis.
              </p>
              <p>
                <strong>Evaluated sentence:</strong> {aiFeedback.targetText}
              </p>
              <p>{aiFeedback.summary}</p>
              <div className="space-y-1">
                <p>
                  <strong>Consonants:</strong> {aiFeedback.consonantComment}
                </p>
                <p>
                  <strong>Vowels:</strong> {aiFeedback.vowelComment}
                </p>
                <p>
                  <strong>Stress:</strong> {aiFeedback.stressComment}
                </p>
              </div>

              {aiFeedback.pronunciationIssues.length > 0 && (
                <div>
                  <p className="font-medium">Pronunciation Issues</p>
                  <ul className="list-disc pl-5">
                    {aiFeedback.pronunciationIssues.map((issue, index) => (
                      <li key={`${issue.expected}-${index}`}>
                        expected: <strong>{issue.expected}</strong> / heard:{" "}
                        <strong>{issue.heard}</strong> / tip: {issue.advice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiFeedback.practiceTips.length > 0 && (
                <div>
                  <p className="font-medium">How to Improve</p>
                  <ul className="list-disc pl-5">
                    {aiFeedback.practiceTips.map((tip, index) => (
                      <li key={`${tip}-${index}`}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
