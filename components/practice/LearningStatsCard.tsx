import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFireFlameCurved } from "@fortawesome/free-solid-svg-icons";
import { XP_PER_LEVEL } from "@/components/practice/constants";
import type { LearningStats } from "@/components/practice/types";

type LearningStatsCardProps = {
  learningStats: LearningStats;
};

export default function LearningStatsCard({
  learningStats,
}: LearningStatsCardProps) {
  return (
    <section className="ui-card w-full max-w-2xl space-y-3 rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
          <FontAwesomeIcon icon={faFireFlameCurved} className="h-4 w-4" />
          <span>{learningStats.streakDays}-day streak</span>
        </p>
        <p className="text-sm font-semibold">
          Level {learningStats.level} • {learningStats.totalPractices} practices
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
  );
}
