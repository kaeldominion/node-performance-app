'use client';

import { useState } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { getTierDisplayValue } from './tierDisplayUtils';
import { Icons } from '@/lib/iconMapping';

interface CollapsibleExerciseCardProps {
  block: any;
  isActive?: boolean;
  sectionColor?: string;
  compact?: boolean; // For EMOM/grid layouts
}

export function CollapsibleExerciseCard({ 
  block, 
  isActive = false, 
  sectionColor,
  compact = false 
}: CollapsibleExerciseCardProps) {
  const { config, isMobile, isTablet } = useResponsiveLayout();
  const { theme } = useTheme();

  // On mobile, start collapsed; on desktop, show more by default
  const shouldStartCollapsed = isMobile && !compact;
  const [isCollapsed, setIsCollapsed] = useState(shouldStartCollapsed);

  const hasDetails = block.exerciseInstructions || block.description || block.tempo || block.loadPercentage;
  const showExpandButton = isMobile && hasDetails && !compact;

  return (
    <div
      className={`
        bg-panel thin-border rounded-lg transition-all
        ${isActive ? 'border-2 border-node-volt' : ''}
        ${compact ? 'p-3' : 'p-4'}
      `}
      style={{
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* Header - Always Visible */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {block.label && (
            <div
              className="text-node-volt font-mono font-bold mb-1"
              style={{
                fontSize: compact ? '0.875rem' : isMobile ? '1rem' : '1.25rem',
              }}
            >
              {block.label}
            </div>
          )}
          <h3
            className="font-bold uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: compact 
                ? (isMobile ? '0.875rem' : '1rem')
                : (isMobile ? '1rem' : '1.5rem'),
              lineHeight: 1.2,
              color: 'var(--text-white)',
            }}
          >
            {block.exerciseName}
          </h3>
        </div>
        
        {/* Expand/Collapse Button - Mobile Only */}
        {showExpandButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            className="flex-shrink-0 p-1 text-node-volt hover:bg-node-volt/10 rounded transition-colors"
            aria-label={isCollapsed ? 'Show details' : 'Hide details'}
          >
            <Icons.CHEVRON_DOWN 
              size={20} 
              className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
            />
          </button>
        )}
      </div>

      {/* Image - Collapsible on Mobile */}
      {block.exerciseImageUrl && (
        <div 
          className={`mb-2 rounded overflow-hidden bg-transparent mx-auto transition-all ${
            isCollapsed && isMobile ? 'hidden' : ''
          }`}
          style={{ 
            aspectRatio: '1', 
            maxHeight: compact ? '80px' : (isMobile ? '100px' : '120px'),
            width: compact ? '80px' : (isMobile ? '100px' : '120px'),
          }}
        >
          <img
            src={block.exerciseImageUrl}
            alt={block.exerciseName}
            className="w-full h-full object-cover"
            style={{
              filter: theme === 'dark' 
                ? 'brightness(0) saturate(100%) invert(85%) sepia(100%) saturate(10000%) hue-rotate(30deg)'
                : 'brightness(0) saturate(100%) invert(30%) sepia(100%) saturate(10000%) hue-rotate(200deg)',
            }}
          />
        </div>
      )}

      {/* Rep Scheme - Always Visible if present */}
      {block.repScheme && (
        <div
          className="text-node-volt font-bold mb-2"
          style={{
            fontSize: compact ? '0.75rem' : (isMobile ? '0.875rem' : '1rem'),
            fontFamily: 'var(--font-space-grotesk)',
          }}
        >
          {block.repScheme}
        </div>
      )}

      {/* Collapsible Details */}
      <div className={`transition-all overflow-hidden ${isCollapsed && isMobile ? 'max-h-0' : 'max-h-[500px]'}`}>
        {/* Instructions */}
        {block.exerciseInstructions && (
          <div 
            className="text-muted-text italic mb-2"
            style={{
              fontSize: compact ? '0.625rem' : (isMobile ? '0.75rem' : '0.875rem'),
              lineHeight: 1.4,
            }}
          >
            {block.exerciseInstructions}
          </div>
        )}

        {/* Description */}
        {block.description && (
          <p
            className="text-muted-text mb-2"
            style={{
              fontSize: compact ? '0.625rem' : (isMobile ? '0.75rem' : '0.875rem'),
            }}
          >
            {block.description}
          </p>
        )}

        {/* Tempo and Load */}
        {(block.tempo || block.loadPercentage) && (
          <div className="space-y-1 mb-2">
            {block.tempo && (
              <div 
                className="text-muted-text"
                style={{ fontSize: compact ? '0.625rem' : (isMobile ? '0.75rem' : '0.875rem') }}
              >
                Tempo: <span className="text-node-volt font-bold">{block.tempo}</span>
              </div>
            )}
            {block.loadPercentage && (
              <div 
                className="text-muted-text"
                style={{ fontSize: compact ? '0.625rem' : (isMobile ? '0.75rem' : '0.875rem') }}
              >
                Load: <span className="text-node-volt font-bold">{block.loadPercentage}</span>
              </div>
            )}
          </div>
        )}

        {/* Tier Prescriptions */}
        {(block.tierSilver || block.tierGold || block.tierBlack) && (
          <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-3'}`}>
            {block.tierSilver && (
              <div className="bg-panel thin-border rounded p-2" style={{ borderColor: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.1)' }}>
                <div className="text-xs mb-1 font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>SILVER</div>
                <div className="font-medium text-xs" style={{ color: '#94a3b8' }}>
                  {getTierDisplayValue(block.tierSilver, block.exerciseName, block)}
                </div>
              </div>
            )}
            {block.tierGold && (
              <div className="bg-panel thin-border rounded p-2" style={{ borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                <div className="text-xs mb-1 font-bold uppercase tracking-wider" style={{ color: '#fbbf24' }}>GOLD</div>
                <div className="font-medium text-xs" style={{ color: '#fbbf24' }}>
                  {getTierDisplayValue(block.tierGold, block.exerciseName, block)}
                </div>
              </div>
            )}
            {block.tierBlack && (
              <div className="bg-panel thin-border rounded p-2 border-node-volt" style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(31, 41, 55, 0.8)' }}>
                <div className="text-xs mb-1 font-bold uppercase tracking-wider text-node-volt">BLACK</div>
                <div className="font-medium text-xs text-node-volt">
                  {getTierDisplayValue(block.tierBlack, block.exerciseName, block)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tap Hint on Mobile */}
      {isMobile && hasDetails && isCollapsed && !compact && (
        <div className="text-xs text-muted-text text-center mt-2 italic">
          Tap to view details
        </div>
      )}
    </div>
  );
}

