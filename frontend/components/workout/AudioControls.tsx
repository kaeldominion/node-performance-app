'use client';

import { useState } from 'react';
import { useAudioSystem } from '@/hooks/useAudioSystem';
import { Icons } from '@/lib/iconMapping';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface AudioControlsProps {
  compact?: boolean;
}

export function AudioControls({ compact = false }: AudioControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const {
    settings,
    toggleMute,
    setVolume,
    toggleSoundEffects,
    toggleVoiceCues,
  } = useAudioSystem();
  const { config } = useResponsiveLayout();

  if (compact) {
    return (
      <button
        onClick={toggleMute}
        className="bg-panel/90 backdrop-blur-sm thin-border text-text-white px-3 py-1.5 rounded-lg hover:bg-panel transition-colors"
        style={{ minWidth: config.touchTargetSize, minHeight: config.touchTargetSize }}
        title={settings.muted ? 'Unmute' : 'Mute'}
      >
        {settings.muted ? (
          <Icons.X size={18} />
        ) : (
          <span className="text-sm">🔊</span>
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="bg-panel/90 backdrop-blur-sm thin-border text-text-white px-3 py-1.5 rounded-lg hover:bg-panel transition-colors flex items-center gap-2"
        style={{ minWidth: config.touchTargetSize, minHeight: config.touchTargetSize }}
      >
        {settings.muted ? <Icons.X size={18} /> : <span>🔊</span>}
        <span className="hidden sm:inline text-xs">Audio</span>
      </button>

      {showSettings && (
        <div className="absolute right-0 top-full mt-2 bg-panel thin-border rounded-lg p-4 min-w-[250px] z-50 space-y-4">
          {/* Mute Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-text">Mute All</label>
            <button
              onClick={toggleMute}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                settings.muted
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-panel/50 thin-border text-muted-text hover:bg-panel'
              }`}
            >
              {settings.muted ? 'Muted' : 'Unmuted'}
            </button>
          </div>

          {/* Volume Slider */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-node-volt"
              disabled={settings.muted}
            />
          </div>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-text">Sound Effects</label>
            <button
              onClick={toggleSoundEffects}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                settings.soundEffectsEnabled
                  ? 'bg-node-volt/20 border-node-volt text-node-volt'
                  : 'bg-panel/50 thin-border text-muted-text hover:bg-panel'
              }`}
            >
              {settings.soundEffectsEnabled ? 'On' : 'Off'}
            </button>
          </div>

          {/* Voice Cues Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-text">Voice Cues</label>
            <button
              onClick={toggleVoiceCues}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                settings.voiceCuesEnabled
                  ? 'bg-node-volt/20 border-node-volt text-node-volt'
                  : 'bg-panel/50 thin-border text-muted-text hover:bg-panel'
              }`}
            >
              {settings.voiceCuesEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


