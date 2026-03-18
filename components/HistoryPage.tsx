"use client";

import { useState } from "react";
import { readRecentPracticeHistory } from "@/lib/practice-history";
import type { PracticeRecord } from "@/types/PracticeRecord";

const MAX_ITEMS = 20;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export default function HistoryPage() {
  const [records] = useState<PracticeRecord[]>(() =>
    readRecentPracticeHistory(MAX_ITEMS),
  );

  return (
    <main className="flex min-h-full flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold sm:text-3xl">History</h1>

      {records.length === 0 ? (
        <p className="ui-text-muted">No practice history yet.</p>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <article
              key={record.id}
              className="ui-card w-full max-w-2xl wrap-break-word rounded-lg p-4"
            >
              <p className="ui-text-muted text-sm">
                {formatDate(record.createdAt)}
              </p>
              <p className="mt-2">{record.sentence}</p>
              <p className="mt-2 font-medium">
                Score: {record.pronunciationScore}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
