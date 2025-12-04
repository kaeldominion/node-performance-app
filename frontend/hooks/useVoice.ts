'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useVoice() {
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    if (!synthRef.current) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 0.8;

    synthRef.current.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  return { speak, cancel };
}

