"use client";

import { useEffect, useRef, useState } from "react";

const CACHE_LIMIT = 20;
const DEFAULT_BROWSER_LANGUAGE = "en-US";
const PREFERRED_VOICE_NAMES = [
  "Samantha",
  "Google US English",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Microsoft Aria Online (Natural) - English (United States)",
];

type UsePlayerTtsParams = {
  text: string;
  selectedText?: string;
};

export default function usePlayerTts({
  text,
  selectedText = "",
}: UsePlayerTtsParams) {
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

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

  const getSpeechText = () => {
    const trimmedSelectedText = selectedText.trim();
    return trimmedSelectedText.length > 0 ? trimmedSelectedText : text;
  };

  const getPreferredVoice = () => {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      return null;
    }

    const matchedByName = PREFERRED_VOICE_NAMES
      .map((name) => voices.find((voice) => voice.name === name))
      .find((voice) => Boolean(voice));

    if (matchedByName) {
      return matchedByName;
    }

    return (
      voices.find((voice) => voice.lang === DEFAULT_BROWSER_LANGUAGE) ??
      voices.find((voice) => voice.lang.startsWith("en-")) ??
      voices[0]
    );
  };

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
      utterance.lang = DEFAULT_BROWSER_LANGUAGE;
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
    const speechText = getSpeechText();

    if (!speechText.trim()) {
      return;
    }

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

  return {
    hasSelectedText: selectedText.trim().length > 0,
    isLoading,
    speak,
  };
}
