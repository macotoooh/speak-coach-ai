"use client";

import type { ReactNode } from "react";
import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";
import usePlayerTts from "@/components/player/usePlayerTts";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type PlayerProps = {
  text: string;
  selectedText?: string;
  auxiliaryActions?: ReactNode;
};

export default function Player({
  text,
  selectedText = "",
  auxiliaryActions,
}: PlayerProps) {
  const {
    label,
    icon,
    isLoading,
    isRepeatEnabled,
    playbackRate,
    playbackSpeedOptions,
    togglePlayback,
    toggleRepeat,
    updatePlaybackRate,
  } = usePlayerTts({
    text,
    selectedText,
  });

  return (
    <div className="ui-card w-full max-w-3xl rounded-2xl border border-border p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <Button
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => void togglePlayback()}
            disabled={isLoading}
            variant={BUTTON_VARIANTS.primary}
            size={BUTTON_SIZES.lg}
            fullWidth
            className="lg:w-auto lg:min-w-52"
          >
            {isLoading ? (
              "Generating..."
            ) : (
              <>
                <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                <span>{label}</span>
              </>
            )}
          </Button>
          {auxiliaryActions}
        </div>

        <div className="flex flex-col gap-3 border-t border-border/80 pt-3 lg:flex-row lg:items-center lg:justify-between">
          <Button
            onClick={toggleRepeat}
            variant={BUTTON_VARIANTS.secondary}
            size={BUTTON_SIZES.sm}
            fullWidth
            aria-pressed={isRepeatEnabled}
            className={`lg:w-auto ${
              isRepeatEnabled ? "ui-btn-speed-active" : "ui-btn-speed"
            } font-medium`}
          >
            <FontAwesomeIcon icon={faRepeat} className="h-3.5 w-3.5" />
            <span>{isRepeatEnabled ? "Repeat On" : "Repeat Off"}</span>
          </Button>

          <div className="grid grid-cols-3 gap-2 rounded-lg bg-surface-2 p-1 lg:min-w-72">
            {playbackSpeedOptions.map((speed) => (
              <Button
                key={speed}
                onClick={() => updatePlaybackRate(speed)}
                aria-pressed={playbackRate === speed}
                variant={BUTTON_VARIANTS.secondary}
                size={BUTTON_SIZES.sm}
                className={`w-full ${
                  playbackRate === speed ? "ui-btn-speed-active" : "ui-btn-speed"
                } font-medium`}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
