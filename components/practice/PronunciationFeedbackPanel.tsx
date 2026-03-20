import type { PronunciationFeedback } from "@/types/pronunciation";

type PronunciationFeedbackPanelProps = {
  isAnalyzing: boolean;
  aiFeedback: PronunciationFeedback | null;
  feedbackError: string | null;
};

export default function PronunciationFeedbackPanel({
  isAnalyzing,
  aiFeedback,
  feedbackError,
}: PronunciationFeedbackPanelProps) {
  if (!isAnalyzing && !aiFeedback && !feedbackError) {
    return null;
  }

  return (
    <section className="ui-card w-full max-w-2xl rounded-lg p-4">
      <h2 className="text-lg font-semibold">AI Pronunciation Feedback</h2>

      {isAnalyzing && (
        <p className="ui-text-muted mt-2">Analyzing your speech...</p>
      )}

      {feedbackError && <p className="mt-2 text-red-600">{feedbackError}</p>}

      {aiFeedback && (
        <div className="mt-3 space-y-3">
          <p>
            <strong>AI Score:</strong> {aiFeedback.overallScore}/100
          </p>
          <p>
            <strong>Rhythm Score:</strong>{" "}
            {aiFeedback.rhythmScore ?? aiFeedback.aiTimingScore ?? "-"}/100
          </p>
          <p>
            <strong>Segmental Score:</strong> {aiFeedback.segmentalScore ?? "-"}
            /100
          </p>
          <p>
            <strong>Fluency Score:</strong> {aiFeedback.fluencyScore ?? "-"}/100
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
  );
}
