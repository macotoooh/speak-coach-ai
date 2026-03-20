import type { PracticeRecord } from "@/types/PracticeRecord";

export const PRACTICE_HISTORY_STORAGE_KEY = "practiceHistory";

export function buildPracticeFingerprint(record: {
  sentence: string;
  correction: string;
  pronunciationScore: number;
}): string {
  return `${record.sentence}::${record.correction}::${record.pronunciationScore}`;
}

export function readPracticeHistory(): PracticeRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(PRACTICE_HISTORY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PracticeRecord[]) : [];
  } catch {
    return [];
  }
}

export function readRecentPracticeHistory(limit: number): PracticeRecord[] {
  return [...readPracticeHistory()]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}

export function readPracticeRecordById(id: string): PracticeRecord | null {
  return readPracticeHistory().find((record) => record.id === id) ?? null;
}

export function readLatestPracticeFingerprint(): string | null {
  const latest = readPracticeHistory()[0];

  if (!latest) {
    return null;
  }

  return buildPracticeFingerprint({
    sentence: latest.sentence,
    correction: latest.correction,
    pronunciationScore: latest.pronunciationScore,
  });
}

export function savePracticeHistory(records: PracticeRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PRACTICE_HISTORY_STORAGE_KEY, JSON.stringify(records));
}
