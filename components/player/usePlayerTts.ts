"use client";

import { useEffect, useRef, useState } from "react";
import {
  faPause,
  faPlay,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";

const CACHE_LIMIT = 20;
const DEFAULT_BROWSER_LANGUAGE = "en-US";
export const PLAYBACK_SPEED_OPTIONS = [0.75, 1, 1.25] as const;
export const DEFAULT_PLAYBACK_SPEED = 1;
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

type PlaybackState = "idle" | "loading" | "playing" | "paused";
type PlaybackEngine = "audio" | "browser" | null;

export default function usePlayerTts({
  text,
  selectedText = "",
}: UsePlayerTtsParams) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [playbackRate, setPlaybackRate] = useState<number>(DEFAULT_PLAYBACK_SPEED);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const playbackEngineRef = useRef<PlaybackEngine>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isRepeatEnabledRef = useRef(isRepeatEnabled);
  const browserPlaybackTokenRef = useRef(0);

  useEffect(() => {
    isRepeatEnabledRef.current = isRepeatEnabled;

    if (audioRef.current) {
      audioRef.current.loop = isRepeatEnabled;
    }
  }, [isRepeatEnabled]);

  useEffect(() => {
    const cachedAudio = audioCacheRef.current;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      utteranceRef.current = null;

      for (const url of cachedAudio.values()) {
        URL.revokeObjectURL(url);
      }

      cachedAudio.clear();
      browserPlaybackTokenRef.current += 1;
      speechSynthesis.cancel();
    };
  }, []);

  const resetPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    browserPlaybackTokenRef.current += 1;
    utteranceRef.current = null;
    playbackEngineRef.current = null;
    setPlaybackState("idle");
  };

  const getSpeechText = () => {
    const trimmedSelectedText = selectedText.trim();
    return trimmedSelectedText.length > 0 ? trimmedSelectedText : text;
  };

  const getPreferredVoice = () => {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      return null;
    }

    const matchedByName = PREFERRED_VOICE_NAMES.map((name) =>
      voices.find((voice) => voice.name === name),
    ).find((voice) => Boolean(voice));

    if (matchedByName) {
      return matchedByName;
    }

    return (
      voices.find((voice) => voice.lang === DEFAULT_BROWSER_LANGUAGE) ??
      voices.find((voice) => voice.lang.startsWith("en-")) ??
      voices[0]
    );
  };

  const playAudio = async (
    objectUrl: string,
    rate: number = playbackRate,
  ) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    browserPlaybackTokenRef.current += 1;
    speechSynthesis.cancel();

    const audio = new Audio(objectUrl);
    audio.loop = isRepeatEnabledRef.current;
    audio.playbackRate = rate;
    audioRef.current = audio;
    playbackEngineRef.current = "audio";
    audio.onplay = () => {
      setPlaybackState("playing");
    };
    audio.onpause = () => {
      if (audio.ended) {
        return;
      }

      setPlaybackState("paused");
    };
    audio.onended = () => {
      resetPlayback();
    };
    audio.onerror = () => {
      resetPlayback();
    };
    await audio.play();
  };

  const speakWithBrowserVoice = (
    speechText: string,
    rate: number = playbackRate,
  ) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    browserPlaybackTokenRef.current += 1;
    const playbackToken = browserPlaybackTokenRef.current;
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speechText);
    utteranceRef.current = utterance;
    playbackEngineRef.current = "browser";
    const preferredVoice = getPreferredVoice();
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = DEFAULT_BROWSER_LANGUAGE;
    }

    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => {
      setPlaybackState("playing");
    };
    utterance.onpause = () => {
      setPlaybackState("paused");
    };
    utterance.onresume = () => {
      setPlaybackState("playing");
    };
    utterance.onend = () => {
      if (browserPlaybackTokenRef.current !== playbackToken) {
        return;
      }

      if (isRepeatEnabledRef.current) {
        speakWithBrowserVoice(speechText, rate);
        return;
      }

      resetPlayback();
    };
    utterance.onerror = () => {
      if (browserPlaybackTokenRef.current !== playbackToken) {
        return;
      }

      resetPlayback();
    };
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

    setPlaybackState("loading");

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
      setPlaybackState((currentState) =>
        currentState === "loading" ? "idle" : currentState,
      );
    }
  };

  const pause = () => {
    if (playbackEngineRef.current === "audio" && audioRef.current) {
      audioRef.current.pause();
      return;
    }

    if (playbackEngineRef.current === "browser" && speechSynthesis.speaking) {
      speechSynthesis.pause();
    }
  };

  const resume = async () => {
    if (playbackEngineRef.current === "audio" && audioRef.current) {
      await audioRef.current.play();
      return;
    }

    if (playbackEngineRef.current === "browser" && speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  };

  const updatePlaybackRate = (nextRate: number) => {
    setPlaybackRate(nextRate);

    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }

    if (
      playbackEngineRef.current === "browser" &&
      (playbackState === "playing" || playbackState === "paused")
    ) {
      const speechText = getSpeechText();
      speechSynthesis.cancel();
      speakWithBrowserVoice(speechText, nextRate);
    }
  };

  const toggleRepeat = () => {
    setIsRepeatEnabled((currentValue) => !currentValue);
  };

  const togglePlayback = async () => {
    if (playbackState === "loading") {
      return;
    }

    if (playbackState === "playing") {
      pause();
      return;
    }

    if (playbackState === "paused") {
      await resume();
      return;
    }

    await speak();
  };

  const getLabel = () => {
    if (playbackState === "loading") {
      return "Generating...";
    }

    if (playbackState === "playing") {
      return "Pause";
    }

    if (playbackState === "paused") {
      return "Resume";
    }

    return selectedText.trim().length > 0 ? "Listen Selection" : "Listen";
  };

  const getIcon = () => {
    if (playbackState === "playing") {
      return faPause;
    }

    if (playbackState === "paused") {
      return faPlay;
    }

    return faVolumeHigh;
  };

  return {
    label: getLabel(),
    icon: getIcon(),
    isLoading: playbackState === "loading",
    isRepeatEnabled,
    playbackRate,
    playbackSpeedOptions: PLAYBACK_SPEED_OPTIONS,
    togglePlayback,
    toggleRepeat,
    updatePlaybackRate,
  };
}
