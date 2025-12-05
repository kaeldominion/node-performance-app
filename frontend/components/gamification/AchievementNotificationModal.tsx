'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AchievementIcon } from '../achievements/AchievementIcon';
import { Icons } from '@/lib/iconMapping';

interface AchievementNotificationModalProps {
  achievement: {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    xpReward: number;
    category: string;
  };
  onClose: () => void;
  onShare?: () => void;
}

export function AchievementNotificationModal({ 
  achievement, 
  onClose,
  onShare
}: AchievementNotificationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Play achievement unlock sound
    try {
      const achievementSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSdTgwOUKbj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBtpvfDknU4MDlCm4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC');
      achievementSound.volume = 0.7;
      achievementSound.play().catch(() => {
        // Fallback: use Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1000;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
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

  const rarityColors = {
    COMMON: { bg: 'bg-gray-500/20', border: 'border-gray-500', text: 'text-gray-400' },
    RARE: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' },
    EPIC: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400' },
    LEGENDARY: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400' },
  };

  const colors = rarityColors[achievement.rarity];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative bg-dark border-4 ${colors.border} rounded-lg p-12 max-w-md w-full mx-4 transform transition-all duration-500 animate-achievement-pop`}
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'achievementPop 0.6s ease-out',
        }}
      >
        {/* Confetti effect based on rarity */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: achievement.rarity === 'LEGENDARY' ? 30 : achievement.rarity === 'EPIC' ? 20 : 15 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 ${colors.border.replace('border-', 'bg-')} rounded-full`}
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
          {/* Achievement Icon */}
          <div className="mb-6 flex justify-center animate-bounce">
            <AchievementIcon 
              icon={achievement.icon} 
              rarity={achievement.rarity} 
              size="xl"
            />
          </div>

          {/* Achievement Unlocked Text */}
          <div className={`text-sm uppercase tracking-[0.2em] font-bold mb-2 ${colors.text}`}>
            Achievement Unlocked!
          </div>

          {/* Achievement Name */}
          <h2 className={`text-3xl font-heading font-bold mb-2 ${colors.text}`}>
            {achievement.name}
          </h2>

          {/* Description */}
          <p className="text-muted-text text-lg mb-4">
            {achievement.description}
          </p>

          {/* XP Reward */}
          <div className="bg-node-volt/20 border border-node-volt/50 rounded-lg p-4 mb-6">
            <div className="text-sm text-muted-text mb-1">XP Reward</div>
            <div className="text-2xl font-bold text-node-volt">
              +{achievement.xpReward} XP
            </div>
          </div>

          {/* Rarity Badge */}
          <div className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6 ${colors.bg} ${colors.text} border ${colors.border}`}>
            {achievement.rarity}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            {onShare && (
              <button
                onClick={() => {
                  onShare();
                  setShow(false);
                  setTimeout(onClose, 300);
                }}
                className="px-6 py-3 bg-node-volt/20 border border-node-volt/50 text-node-volt font-heading font-bold uppercase tracking-[0.1em] hover:bg-node-volt/30 transition-colors rounded-lg"
              >
                Share
              </button>
            )}
            <button
              onClick={() => {
                setShow(false);
                setTimeout(onClose, 300);
              }}
              className="px-6 py-3 bg-node-volt text-dark font-heading font-bold uppercase tracking-[0.1em] hover:bg-text-white transition-colors rounded-lg"
            >
              Continue
            </button>
          </div>
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
    @keyframes achievementPop {
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
  if (!document.head.querySelector('style[data-achievement-modal]')) {
    style.setAttribute('data-achievement-modal', 'true');
    document.head.appendChild(style);
  }
}

