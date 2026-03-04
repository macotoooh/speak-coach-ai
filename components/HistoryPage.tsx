"use client";

import { useState } from "react";
import type { PracticeRecord } from "@/types/PracticeRecord";

const STORAGE_KEY = "practiceHistory";
const MAX_ITEMS = 20;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const loadHistory = (): PracticeRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as PracticeRecord[]) : [];
    const sorted = [...parsed].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sorted.slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
};

export default function HistoryPage() {
  const [records] = useState<PracticeRecord[]>(loadHistory);

  return (
    <main className="flex min-h-full flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold">History</h1>

      {records.length === 0 ? (
        <p className="text-gray-600">No practice history yet.</p>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <article key={record.id} className="max-w-2xl rounded-lg border p-4">
              <p className="text-sm text-gray-500">{formatDate(record.createdAt)}</p>
              <p className="mt-2">{record.sentence}</p>
              <p className="mt-2 font-medium">Score: {record.pronunciationScore}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
