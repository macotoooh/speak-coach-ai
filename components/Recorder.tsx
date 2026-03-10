"use client";

import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop } from "@fortawesome/free-solid-svg-icons";

type Props = {
  onRecorded: (audioBlob: Blob) => void;
  disabled?: boolean;
};

export default function Recorder({ onRecorded, disabled = false }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const cleanupStream = () => {
    if (!streamRef.current) {
      return;
    }

    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const startRecording = async () => {
    if (isRecording || disabled) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        onRecorded(audioBlob);
        cleanupStream();
        mediaRecorderRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      alert("Microphone access failed.");
      cleanupStream();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return;
    }

    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled}
      className="ui-btn-accent inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 disabled:opacity-60 sm:w-auto"
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
    </button>
  );
}
