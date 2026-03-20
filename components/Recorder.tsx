"use client";

import useRecorder from "@/components/recorder/useRecorder";
import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop } from "@fortawesome/free-solid-svg-icons";

type Props = {
  onRecorded: (audioBlob: Blob) => void;
  disabled?: boolean;
};

export default function Recorder({ onRecorded, disabled = false }: Props) {
  const { isRecording, toggleRecording } = useRecorder({
    onRecorded,
    disabled,
  });

  return (
    <Button
      onClick={() => void toggleRecording()}
      disabled={disabled}
      variant={BUTTON_VARIANTS.accent}
      size={BUTTON_SIZES.lg}
      fullWidth
      className="sm:w-auto"
    >
      {isRecording ? (
        <>
          <FontAwesomeIcon icon={faStop} className="h-4 w-4" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faMicrophone} className="h-4 w-4" />
          <span>Record</span>
        </>
      )}
    </Button>
  );
}
