import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export default function CelebrationBanner() {
  return (
    <section className="w-full max-w-2xl rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
      <p className="inline-flex items-center gap-2 text-base font-bold sm:text-lg">
        <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
        <span>90+ Score! Amazing work!</span>
      </p>
      <p className="mt-1 text-sm">
        Save this result to earn bonus XP and level up faster.
      </p>
    </section>
  );
}
