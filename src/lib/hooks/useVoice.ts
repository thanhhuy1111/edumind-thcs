"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseVoiceOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export function useVoice(options?: UseVoiceOptions) {
  const lang = options?.lang || "vi-VN";
  const rate = options?.rate || 0.95;
  const pitch = options?.pitch || 1.0;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [micSupported, setMicSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSupported("speechSynthesis" in window);
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setMicSupported(!!SpeechRecognition);
    }
  }, []);

  // Text-To-Speech
  const speak = useCallback(
    async (text: string) => {
      if (typeof window === "undefined" || !text) return;

      // Stop any current audio or speech
      stopSpeaking();

      // Attempt server voice synthesis first (if Gemini TTS audio is returned)
      try {
        const res = await fetch("/api/ai/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audioBase64) {
            const audio = new Audio(`data:${data.mimeType || "audio/mp3"};base64,${data.audioBase64}`);
            currentAudioRef.current = audio;
            setIsSpeaking(true);

            audio.onended = () => {
              setIsSpeaking(false);
              currentAudioRef.current = null;
            };
            audio.onerror = () => {
              setIsSpeaking(false);
              currentAudioRef.current = null;
              // Fallback to browser TTS if audio playback failed
              speakWithBrowserTTS(text);
            };

            await audio.play();
            return;
          }
        }
      } catch (err) {
        console.warn("Server voice synthesis fallback to Browser TTS:", err);
      }

      speakWithBrowserTTS(text);
    },
    [lang, rate, pitch]
  );

  const speakWithBrowserTTS = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find((v) => v.lang.includes("vi"));
      if (viVoice) utterance.voice = viVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [lang, rate, pitch]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined") return;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Speech-To-Text (Microphone)
  const startListening = useCallback(
    (onResult: (transcript: string) => void, onError?: (err: any) => void) => {
      if (typeof window === "undefined") return;
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert("Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói qua Micro.");
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript || "";
          if (transcript) {
            onResult(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          if (onError) onError(event.error);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Speech recognition startup error:", err);
        setIsListening(false);
      }
    },
    [lang]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    isListening,
    supported,
    micSupported,
  };
}
