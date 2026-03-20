import type { LearningStats } from "@/components/practice/types";

export const XP_PER_PRACTICE = 10;
export const XP_BONUS_90_PLUS = 5;
export const XP_PER_LEVEL = 100;
export const CELEBRATION_VISIBLE_MS = 7000;
export const INITIAL_PRACTICE_TEXT = "The weather in Vancouver is often rainy.";

export const EMPTY_LEARNING_STATS: LearningStats = {
  totalPractices: 0,
  streakDays: 0,
  level: 1,
  xpInLevel: 0,
  xpToNextLevel: XP_PER_LEVEL,
  levelProgressPercent: 0,
};
