import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";

type ReviewModeBannerProps = {
  sentence: string;
  onExit: () => void;
};

export default function ReviewModeBanner({
  sentence,
  onExit,
}: ReviewModeBannerProps) {
  return (
    <section className="w-full max-w-2xl rounded-lg border border-sky-300 bg-sky-50 p-4 text-sky-950 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Review mode
          </p>
          <p className="text-sm">
            Replaying a saved practice sentence. You can listen, record, and
            save a new result from here.
          </p>
          <p className="text-sm font-medium">{sentence}</p>
        </div>
        <Button
          onClick={onExit}
          variant={BUTTON_VARIANTS.secondary}
          size={BUTTON_SIZES.sm}
          className="sm:w-auto"
        >
          Exit review
        </Button>
      </div>
    </section>
  );
}
