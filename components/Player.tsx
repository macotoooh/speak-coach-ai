"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh } from "@fortawesome/free-solid-svg-icons";

type PlayerProps = {
  text: string;
  selectedText?: string;
};

export default function Player({ text, selectedText = "" }: PlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const CACHE_LIMIT = 20;

  useEffect(() => {
    const cachedAudio = audioCacheRef.current;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      for (const url of cachedAudio.values()) {
        URL.revokeObjectURL(url);
      }
      cachedAudio.clear();
      speechSynthesis.cancel();
    };
  }, []);

  const getPreferredVoice = () => {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      return null;
    }

    const preferredNames = [
      "Samantha",
      "Google US English",
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Microsoft Aria Online (Natural) - English (United States)",
    ];

    const matchedByName = preferredNames
      .map((name) => voices.find((voice) => voice.name === name))
      .find((voice) => Boolean(voice));

    if (matchedByName) {
      return matchedByName;
    }

    const englishVoice =
      voices.find((voice) => voice.lang === "en-US") ??
      voices.find((voice) => voice.lang.startsWith("en-")) ??
      voices[0];

    return englishVoice;
  };

  const speakWithBrowserVoice = (speechText: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speechText);
    const preferredVoice = getPreferredVoice();
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = "en-US";
    }

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
  };

  const evictOldestCachedAudio = () => {
    const cache = audioCacheRef.current;
    if (cache.size <= CACHE_LIMIT) {
      return;
    }

    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) {
      return;
    }

    const oldestUrl = cache.get(oldestKey);
    if (oldestUrl) {
      URL.revokeObjectURL(oldestUrl);
    }

    cache.delete(oldestKey);
  };

  const speak = async () => {
    const trimmedSelectedText = selectedText.trim();
    const speechText =
      trimmedSelectedText.length > 0 ? trimmedSelectedText : text;

    if (!speechText.trim()) {
      return;
    }

    const playAudio = async (objectUrl: string) => {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(objectUrl);
      audioRef.current = audio;
      audio.onended = () => {
        audioRef.current = null;
      };
      await audio.play();
    };

    const cachedUrl = audioCacheRef.current.get(speechText);
    if (cachedUrl) {
      speechSynthesis.cancel();
      await playAudio(cachedUrl);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: speechText }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech from TTS API.");
      }

      const audioBlob = await response.blob();

      const objectUrl = URL.createObjectURL(audioBlob);
      audioCacheRef.current.set(speechText, objectUrl);
      evictOldestCachedAudio();

      await playAudio(objectUrl);
    } catch {
      speakWithBrowserVoice(speechText);
    } finally {
      setIsLoading(false);
    }
  };

  const hasSelectedText = selectedText.trim().length > 0;

  return (
    <button
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={() => void speak()}
      disabled={isLoading}
      className="ui-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 disabled:opacity-60 sm:w-auto"
    >
      {isLoading ? (
        "Generating..."
      ) : (
        <>
          <FontAwesomeIcon icon={faVolumeHigh} className="h-4 w-4" />
          <span>{hasSelectedText ? "Listen Selection" : "Listen"}</span>
        </>
      )}
    </button>
  );
}
