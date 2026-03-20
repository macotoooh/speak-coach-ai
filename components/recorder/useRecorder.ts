"use client";

import { useEffect, useRef, useState } from "react";

type UseRecorderParams = {
  onRecorded: (audioBlob: Blob) => void;
  disabled?: boolean;
};

export default function useRecorder({
  onRecorded,
  disabled = false,
}: UseRecorderParams) {
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

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      cleanupStream();
      mediaRecorderRef.current = null;
    };
  }, []);

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
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "inactive"
    ) {
      return;
    }

    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return {
    isRecording,
    toggleRecording: isRecording ? stopRecording : startRecording,
  };
}
