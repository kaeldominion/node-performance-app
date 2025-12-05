'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LevelUpModalProps {
  level: number;
  levelName?: string;
  nextLevel?: number;
  nextLevelName?: string;
  xpToNextLevel?: number;
  onClose: () => void;
}

export function LevelUpModal({ 
  level, 
  levelName, 
  nextLevel, 
  nextLevelName, 
  xpToNextLevel,
  onClose 
}: LevelUpModalProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Play level-up sound
    try {
      const levelUpSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSdTgwOUKbj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBtpvfDknU4MDlCm4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC');
      levelUpSound.volume = 0.7;
      levelUpSound.play().catch(() => {
        // Fallback: use Web Audio API for a simple beep
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      });
    } catch (e) {
      // Sound failed, continue without it
    }

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  if (!mounted || !show) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-dark border-4 border-node-volt rounded-lg p-12 max-w-md w-full mx-4 transform transition-all duration-500 animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'levelUpPulse 0.6s ease-out',
        }}
      >
        {/* Confetti effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-node-volt rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `confetti${i} 2s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center relative z-10">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-4xl font-heading font-bold text-node-volt mb-2">
            LEVEL UP!
          </h2>
          <div className="text-8xl font-heading font-bold text-text-white mb-2">
            {level}
          </div>
          {levelName && (
            <div className="text-2xl font-heading font-bold text-node-volt mb-4">
              {levelName}
            </div>
          )}
          <p className="text-muted-text text-lg mb-4">
            You've reached level <span className="text-node-volt font-bold">{level}</span>
            {levelName && <span className="text-node-volt"> • {levelName}</span>}!
          </p>
          {nextLevel && nextLevelName && xpToNextLevel && xpToNextLevel > 0 && (
            <div className="bg-node-volt/10 border border-node-volt/30 rounded-lg p-4 mb-6">
              <div className="text-sm text-muted-text mb-1">Next Level Available</div>
              <div className="text-lg font-semibold text-node-volt mb-1">
                Level {nextLevel} • {nextLevelName}
              </div>
              <div className="text-xs text-muted-text">
                {xpToNextLevel.toLocaleString()} XP to go
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setShow(false);
              setTimeout(onClose, 300);
            }}
            className="px-8 py-3 bg-node-volt text-dark font-heading font-bold uppercase tracking-[0.2em] hover:bg-text-white transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes levelUpPulse {
      0% {
        transform: scale(0.5) rotate(-10deg);
        opacity: 0;
      }
      50% {
        transform: scale(1.1) rotate(5deg);
      }
      100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
    }
    
    @keyframes confetti0 {
      0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translate(50px, 200px) rotate(360deg);
        opacity: 0;
      }
    }
    
    @keyframes bounce-in {
      0% {
        transform: scale(0.3);
        opacity: 0;
      }
      50% {
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

