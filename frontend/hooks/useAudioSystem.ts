'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export type SoundEffect = 'beep' | 'beep2' | 'beep3' | 'fanfare' | 'transition' | 'complete' | 'warning' | 'tick';
export type VoiceCue = 'exercise' | 'round' | 'station' | 'phase' | 'time' | 'countdown';

interface AudioSettings {
  muted: boolean;
  volume: number; // 0-1
  soundEffectsEnabled: boolean;
  voiceCuesEnabled: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  muted: false,
  volume: 0.8,
  soundEffectsEnabled: true,
  voiceCuesEnabled: true,
};

export function useAudioSystem() {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const stored = localStorage.getItem('audioSettings');
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        speechSynthesisRef.current = window.speechSynthesis;
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audioSettings', JSON.stringify(settings));
    }
  }, [settings]);

  // Generate beep sound using Web Audio API
  const generateBeep = useCallback((frequency: number, duration: number, type: 'beep' | 'beep2' | 'beep3' = 'beep') => {
    if (!audioContextRef.current || settings.muted || !settings.soundEffectsEnabled) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different beep types
    if (type === 'beep2') {
      oscillator.frequency.setValueAtTime(frequency * 1.2, audioContext.currentTime);
    } else if (type === 'beep3') {
      oscillator.frequency.setValueAtTime(frequency * 0.8, audioContext.currentTime);
    } else {
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    }

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(settings.volume * 0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }, [settings.muted, settings.soundEffectsEnabled, settings.volume]);

  // Play sound effect
  const playSound = useCallback((sound: SoundEffect, options?: { count?: number }) => {
    if (settings.muted || !settings.soundEffectsEnabled) return;

    switch (sound) {
      case 'beep':
        generateBeep(800, 0.1);
        break;
      case 'beep2':
        generateBeep(1000, 0.15, 'beep2');
        break;
      case 'beep3':
        generateBeep(600, 0.2, 'beep3');
        break;
      case 'fanfare':
        // Play a sequence of beeps for fanfare
        generateBeep(523, 0.1); // C
        setTimeout(() => generateBeep(659, 0.1), 100); // E
        setTimeout(() => generateBeep(784, 0.2), 200); // G
        break;
      case 'transition':
        generateBeep(440, 0.2);
        break;
      case 'complete':
        generateBeep(880, 0.3);
        break;
      case 'warning':
        generateBeep(400, 0.3);
        break;
      case 'tick':
        generateBeep(1000, 0.05);
        break;
    }
  }, [settings.muted, settings.soundEffectsEnabled, generateBeep]);

  // Play voice cue using TTS
  const playVoice = useCallback((cue: VoiceCue, text?: string, options?: { count?: number; phase?: 'work' | 'rest' }) => {
    if (settings.muted || !settings.voiceCuesEnabled || !speechSynthesisRef.current) return;

    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance();
    
    let message = text;
    if (!message) {
      const messages: Record<VoiceCue, string> = {
        exercise: 'Next exercise',
        round: options?.count ? `Round ${options.count}` : 'Round',
        station: options?.count ? `Station ${options.count}` : 'Station',
        phase: options?.phase === 'work' ? 'Work' : 'Rest',
        time: options?.count ? `${options.count} seconds remaining` : 'Time remaining',
        countdown: options?.count ? `${options.count}` : 'Get ready',
      };
      message = messages[cue];
    }

    utterance.text = message;
    utterance.rate = 1.2;
    utterance.pitch = 1.0;
    utterance.volume = settings.volume;

    speechSynthesisRef.current.speak(utterance);
  }, [settings.muted, settings.voiceCuesEnabled, settings.volume]);

  // Play countdown beeps (3-2-1)
  const playCountdown = useCallback((count: number, onComplete?: () => void) => {
    if (settings.muted || !settings.soundEffectsEnabled) {
      if (onComplete) setTimeout(onComplete, count * 1000);
      return;
    }

    let remaining = count;
    const interval = setInterval(() => {
      if (remaining > 0) {
        playVoice('countdown', undefined, { count: remaining });
        generateBeep(800, 0.1);
        remaining--;
      } else {
        clearInterval(interval);
        generateBeep(1000, 0.3);
        playVoice('countdown', 'Go!');
        if (onComplete) onComplete();
      }
    }, 1000);
  }, [settings.muted, settings.soundEffectsEnabled, playVoice, generateBeep]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const toggleMute = useCallback(() => {
    setSettings(prev => ({ ...prev, muted: !prev.muted }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const toggleSoundEffects = useCallback(() => {
    setSettings(prev => ({ ...prev, soundEffectsEnabled: !prev.soundEffectsEnabled }));
  }, []);

  const toggleVoiceCues = useCallback(() => {
    setSettings(prev => ({ ...prev, voiceCuesEnabled: !prev.voiceCuesEnabled }));
  }, []);

  return {
    settings,
    playSound,
    playVoice,
    playCountdown,
    updateSettings,
    toggleMute,
    setVolume,
    toggleSoundEffects,
    toggleVoiceCues,
  };
}


