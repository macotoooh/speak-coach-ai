"use client";

import { useMemo, useState } from "react";
import type { PracticeRecord } from "@/types/PracticeRecord";

const STORAGE_KEY = "practiceHistory";

const loadHistory = (): PracticeRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PracticeRecord[]) : [];
  } catch {
    return [];
  }
};

export default function ProgressPage() {
  const [records] = useState<PracticeRecord[]>(loadHistory);

  const stats = useMemo(() => {
    const totalPractices = records.length;
    const averagePronunciationScore =
      totalPractices === 0
        ? 0
        : Math.round(
            records.reduce((sum, item) => sum + item.pronunciationScore, 0) /
              totalPractices,
          );

    return { totalPractices, averagePronunciationScore };
  }, [records]);

  return (
    <main className="flex min-h-full flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Progress</h1>

      <section className="ui-card w-full max-w-xl space-y-3 wrap-break-word rounded-lg p-4">
        <p>
          <strong>Total practices:</strong> {stats.totalPractices}
        </p>
        <p>
          <strong>Average pronunciation score:</strong>{" "}
          {stats.averagePronunciationScore}
        </p>
      </section>
    </main>
  );
}
