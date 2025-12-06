'use client';

import { useState } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useDeckAnimations } from '@/hooks/useDeckAnimations';
import { useTheme } from '@/contexts/ThemeContext';
import { getTierDisplayValue, isErgMachine, isBodyweightRepExercise } from './tierDisplayUtils';

interface ExerciseCardProps {
  block: any;
  isActive?: boolean;
  onClick?: () => void;
  sectionColor?: string;
}

export function ExerciseCard({ block, isActive = false, onClick, sectionColor }: ExerciseCardProps) {
  const { config, isMobile } = useResponsiveLayout();
  const { getPulseClass } = useDeckAnimations();
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Use volt green in dark mode, section color in light mode
  const activeBorderColor = theme === 'dark' 
    ? 'var(--node-volt)' 
    : (sectionColor || 'var(--node-volt)');

  const isErg = isErgMachine(block.exerciseName);
  const isBodyweightRep = isBodyweightRepExercise(block.exerciseName);
  const pulseClass = isActive ? getPulseClass() : '';

  const renderTierDisplay = (tier: any, tierName: string, tierColor: string) => {
    if (!tier) return null;
    
    const displayValue = getTierDisplayValue(tier, block.exerciseName);
    
    // For BLACK tier, use dark background with white text for visibility in both modes
    const isBlackTier = tierName === 'BLACK';
    
    // BLACK tier styling: dark background with white text and visible border
    let bgColor: string;
    let textColor: string;
    let borderColor: string;
    let labelColor: string;
    
    if (isBlackTier) {
      // In dark mode: use slightly lighter dark background, in light mode: use dark-contrast
      bgColor = theme === 'dark' ? '#1a1a1a' : 'var(--dark-contrast)';
      textColor = '#ffffff'; // Always white text for BLACK tier
      borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)';
      labelColor = 'rgba(255, 255, 255, 0.7)'; // Slightly muted white for label
    } else if (tierName === 'SILVER') {
      // SILVER tier: slate blue for better readability
      bgColor = theme === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.15)';
      textColor = '#94a3b8'; // Slate blue - much more readable than grey
      borderColor = '#94a3b8';
      labelColor = '#94a3b8';
    } else if (tierName === 'GOLD') {
      // GOLD tier: warm amber/gold
      bgColor = theme === 'dark' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)';
      textColor = '#fbbf24'; // Amber gold - more readable
      borderColor = '#fbbf24';
      labelColor = '#fbbf24';
    } else {
      // Fallback for other tiers
      bgColor = `${tierColor}15`;
      textColor = tierColor;
      borderColor = tierColor;
      labelColor = 'var(--muted-text)';
    }
    
    return (
      <div
        className="thin-border p-2"
        style={{
          borderColor: borderColor,
          backgroundColor: bgColor,
          borderWidth: '1px',
          borderStyle: 'solid',
        }}
      >
        <div 
          className="text-xs mb-1 uppercase tracking-wider font-mono"
          style={{
            color: labelColor,
          }}
        >
          {tierName}
        </div>
        <div
          className="font-bold uppercase tracking-wider"
          style={{
            color: textColor,
            fontSize: isMobile ? '0.875rem' : '1rem',
            fontFamily: 'var(--font-space-grotesk)',
          }}
        >
          {displayValue}
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        bg-panel thin-border p-4 transition-colors cursor-pointer h-full flex flex-col
        ${isActive ? 'border-2' : 'hover:border-node-volt'}
        ${pulseClass}
      `}
      style={{
        minHeight: 0,
        overflow: 'hidden',
        borderColor: isActive ? activeBorderColor : undefined,
      }}
    >
      {/* Exercise Image - Brutalist Style */}
      {block.exerciseImageUrl && (
        <div className="mb-3 rounded overflow-hidden bg-transparent" style={{ aspectRatio: '1', maxHeight: '120px' }}>
          <img
            src={block.exerciseImageUrl}
            alt={block.exerciseName}
            className="w-full h-full object-cover"
            style={{
              filter: theme === 'dark' 
                ? 'brightness(0) saturate(100%) invert(85%) sepia(100%) saturate(10000%) hue-rotate(30deg)' // Volt green (#ccff00) for dark mode
                : 'brightness(0) saturate(100%) invert(30%) sepia(100%) saturate(10000%) hue-rotate(200deg)', // Blue (#0066ff) for light mode
            }}
          />
        </div>
      )}

      {/* Exercise Instructions */}
      {block.exerciseInstructions && (
        <div className="mb-3 text-xs text-muted-text italic leading-relaxed">
          {block.exerciseInstructions}
        </div>
      )}

      {/* Label - Brutalist */}
      {block.label && (
        <div
          className="text-node-volt font-mono font-bold mb-2 uppercase tracking-wider"
          style={{
            fontSize: isMobile ? '1rem' : '1.25rem',
          }}
        >
          {block.label}
        </div>
      )}

      {/* Exercise Name - Brutalist */}
      <h3
        className="font-bold mb-2 uppercase tracking-wider"
        style={{
          fontFamily: 'var(--font-space-grotesk)',
          fontSize: isMobile ? '1rem' : '1.125rem',
          lineHeight: 1.2,
          color: 'var(--text-white)',
        }}
      >
        {block.exerciseName}
      </h3>

      {/* Short Description - ONLY show shortDescription, NEVER longDescription or description */}
      {block.shortDescription && block.shortDescription.length < 100 && (
        <p
          className="text-muted-text mb-3 text-xs uppercase tracking-wider"
          style={{
            lineHeight: 1.4,
          }}
        >
          {block.shortDescription}
        </p>
      )}
      {/* DO NOT show block.description or block.longDescription - they should NEVER appear */}

      {/* Rep Scheme */}
      {block.repScheme && !isErg && (
        <div
          className="text-node-volt font-bold mb-3 uppercase tracking-wider"
          style={{
            fontSize: isMobile ? '0.875rem' : '1rem',
            fontFamily: 'var(--font-space-grotesk)',
          }}
        >
          {block.repScheme}
        </div>
      )}

      {/* Tempo and Load */}
      {(block.tempo || block.loadPercentage) && (
        <div className="space-y-1 mb-3">
          {block.tempo && (
            <div className="text-xs text-muted-text uppercase tracking-wider">
              Tempo: <span className="text-node-volt font-bold">{block.tempo}</span>
            </div>
          )}
          {block.loadPercentage && (
            <div className="text-xs text-muted-text uppercase tracking-wider">
              Load: <span className="text-node-volt font-bold">{block.loadPercentage}</span>
            </div>
          )}
        </div>
      )}

      {/* Tier Prescriptions - Brutalist */}
      {(block.tierSilver || block.tierGold || block.tierBlack) && (
        <div className="space-y-2 mt-auto">
          {block.tierSilver && renderTierDisplay(block.tierSilver, 'SILVER', '#94a3b8')}
          {block.tierGold && renderTierDisplay(block.tierGold, 'GOLD', '#fbbf24')}
          {block.tierBlack && renderTierDisplay(block.tierBlack, 'BLACK', '#ffffff')}
        </div>
      )}

      {/* Active Indicator - Brutalist */}
      {isActive && (
        <div 
          className="absolute top-2 right-2 w-2 h-2" 
          style={{ backgroundColor: activeBorderColor }}
        />
      )}
    </div>
  );
}

