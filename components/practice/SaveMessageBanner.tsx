import { getSaveMessageTone } from "@/components/practice/helpers";

type SaveMessageBannerProps = {
  saveMessage: string;
};

export default function SaveMessageBanner({
  saveMessage,
}: SaveMessageBannerProps) {
  const saveMessageTone = getSaveMessageTone(saveMessage);

  return (
    <p
      role={saveMessageTone === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`w-full max-w-2xl rounded-md border px-3 py-2 text-sm font-medium ${
        saveMessageTone === "success"
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : saveMessageTone === "error"
            ? "border-red-300 bg-red-50 text-red-800"
            : "border-amber-300 bg-amber-50 text-amber-800"
      }`}
    >
      {saveMessage}
    </p>
  );
}
