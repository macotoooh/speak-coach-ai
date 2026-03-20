import { XP_BONUS_90_PLUS, XP_PER_LEVEL, XP_PER_PRACTICE } from "@/components/practice/constants";
import type {
  LearningStats,
  TextFeedbackResult,
} from "@/components/practice/types";
import type { PracticeRecord } from "@/types/PracticeRecord";

type ApiErrorPayload = {
  error?: string;
  detail?: string;
};

const toDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
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

export const calculateLearningStats = (
  records: PracticeRecord[],
): LearningStats => {
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

export async function getApiErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const errorPayload = (await response.json().catch(() => null)) as
    | ApiErrorPayload
    | null;
  const detailMessage = errorPayload?.detail ? ` (${errorPayload.detail})` : "";

  return `${errorPayload?.error ?? fallbackMessage}${detailMessage}`;
}

export function getUnknownErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function getCurrentCorrection(
  textFeedback: TextFeedbackResult | null,
): string {
  return textFeedback?.suggestions?.[0] ?? textFeedback?.explanation ?? "";
}

export function buildPracticeRecordId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}`;
}

export function getSaveMessageTone(message: string | null) {
  if (!message) {
    return "info";
  }

  if (message.startsWith("Saved")) {
    return "success";
  }

  if (message.startsWith("Failed")) {
    return "error";
  }

  return "info";
}

export function getGenerateButtonLabel(
  text: string,
  isLoading: boolean,
): string {
  if (isLoading) {
    return "Generating...";
  }

  return text.trim() ? "Regenerate sentence" : "Generate sentence";
}
