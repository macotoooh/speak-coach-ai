"use client";

import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";
import usePlayerTts from "@/components/player/usePlayerTts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh } from "@fortawesome/free-solid-svg-icons";

type PlayerProps = {
  text: string;
  selectedText?: string;
};

export default function Player({ text, selectedText = "" }: PlayerProps) {
  const { hasSelectedText, isLoading, speak } = usePlayerTts({
    text,
    selectedText,
  });

  return (
    <Button
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={() => void speak()}
      disabled={isLoading}
      variant={BUTTON_VARIANTS.primary}
      size={BUTTON_SIZES.lg}
      fullWidth
      className="sm:w-auto"
    >
      {isLoading ? (
        "Generating..."
      ) : (
        <>
          <FontAwesomeIcon icon={faVolumeHigh} className="h-4 w-4" />
          <span>{hasSelectedText ? "Listen Selection" : "Listen"}</span>
        </>
      )}
    </Button>
  );
}
