import type { PracticeRecord } from "@/types/PracticeRecord";
import type { TextFeedbackResponse } from "@/types/text-feedback";

export type SelectionRange = {
  start: number;
  end: number;
};

export type TextFeedbackResult = TextFeedbackResponse & {
  range: SelectionRange;
};

export type LearningStats = {
  totalPractices: number;
  streakDays: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
  levelProgressPercent: number;
};

export type PracticePageHistoryLoader = () => PracticeRecord[];
