'use client';

import { useCallback } from 'react';

export function useAudioCues() {
  const playCue = useCallback((cue: 'start' | 'work' | 'rest' | 'complete' | 'transition' | 'countdown', count?: number) => {
    // Use Web Speech API for TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance();
      
      const messages: Record<string, string> = {
        start: 'Workout started',
        work: 'Work phase',
        rest: 'Rest phase',
        complete: 'Section complete',
        transition: 'Next section',
        countdown: count ? `${count}` : 'Three',
      };

      utterance.text = messages[cue] || '';
      utterance.rate = 1.2;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return { playCue };
}

