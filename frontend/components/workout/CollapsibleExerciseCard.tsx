'use client';

import { useState } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { getTierDisplayValue } from './tierDisplayUtils';
import { Icons } from '@/lib/iconMapping';

interface CollapsibleExerciseCardProps {
  block: any;
  isActive?: boolean;
  isRestPhase?: boolean; // Highlight during rest phase (softer, "get ready" style)
  sectionColor?: string;
  compact?: boolean; // For EMOM/grid layouts or when another card is expanded
  largeText?: boolean; // For 2-4 box layouts with larger text
  showFullDescription?: boolean; // Show longDescription when there are only 1-2 cards
  onClick?: () => void; // Optional click handler to set active exercise
  showTiersAlways?: boolean; // Force tiers to always be visible and expanded
  isExpanded?: boolean; // Controlled expanded state (for accordion)
  onExpandChange?: (expanded: boolean) => void; // Callback when expand state changes
  style?: React.CSSProperties; // Optional inline styles (for grid column span)
}

export function CollapsibleExerciseCard({ 
  block, 
  isActive = false,
  isRestPhase = false,
  sectionColor,
  compact = false,
  largeText = false,
  showFullDescription = false,
  onClick,
  showTiersAlways = false,
  isExpanded,
  onExpandChange,
  style
}: CollapsibleExerciseCardProps) {
  const { config, isMobile, isTablet } = useResponsiveLayout();
  const { theme } = useTheme();

  // On mobile, start collapsed; on desktop, show more by default
  // If showTiersAlways is true, never collapse (for EMOM sections)
  // If isExpanded is controlled, use that; otherwise use local state
  const shouldStartCollapsed = showTiersAlways ? false : (isMobile && !compact);
  const [internalCollapsed, setInternalCollapsed] = useState(shouldStartCollapsed);
  
  // Use controlled state if provided, otherwise use internal state
  const isCollapsed = isExpanded !== undefined ? !isExpanded : internalCollapsed;
  
  const handleCollapseChange = (newCollapsed: boolean) => {
    if (isExpanded !== undefined && onExpandChange) {
      // Controlled mode
      onExpandChange(!newCollapsed);
    } else {
      // Uncontrolled mode
      setInternalCollapsed(newCollapsed);
    }
  };

  // DEBUG: Log block data to console (only once per unique exercise)
  if (typeof window !== 'undefined' && block.exerciseName) {
    const debugKey = `debugged_${block.exerciseName}`;
    if (!(window as any)[debugKey]) {
      (window as any)[debugKey] = true;
      console.log(`[Block Debug] ${block.exerciseName}:`, {
        shortDescription: block.shortDescription || 'MISSING',
        longDescription: block.longDescription ? `${block.longDescription.substring(0, 50)}...` : 'MISSING',
        description: block.description ? `${block.description.substring(0, 50)}...` : 'MISSING',
      });
    }
  }

  const hasDetails = block.exerciseInstructions || block.longDescription || block.description || block.tempo || block.loadPercentage || block.tierSilver || block.tierGold || block.tierBlack;
  // Always show expand button on mobile if there are details to show
  const showExpandButton = isMobile && hasDetails && !compact;

  // Active highlight color - blue in light mode, green in dark mode (matching timer)
  const activeBorderColor = theme === 'light' ? '#0066ff' : '#ccff00';
  const activeBgColor = theme === 'light' ? 'rgba(0, 102, 255, 0.1)' : 'rgba(204, 255, 0, 0.1)';
  const hoverBorderColor = theme === 'light' ? 'rgba(0, 102, 255, 0.5)' : 'rgba(204, 255, 0, 0.5)';
  
  // Rest phase highlight - softer, "get ready" style
  const restBorderColor = theme === 'light' ? '#4a9eff' : '#4a9eff'; // Blue for rest
  const restBgColor = theme === 'light' ? 'rgba(74, 158, 255, 0.08)' : 'rgba(74, 158, 255, 0.08)';

  return (
    <div
      className={`
        bg-panel thin-border rounded-lg transition-all relative
        ${onClick || (isMobile && showExpandButton) ? 'cursor-pointer' : ''}
        ${largeText ? (isMobile ? 'p-3' : 'p-6') : (compact ? 'p-2' : (isMobile ? 'p-3' : 'p-4'))}
      `}
      style={{
        ...style, // Apply passed-in styles (for grid column span)
        minHeight: 0,
        maxHeight: '100%',
        height: !isMobile ? '100%' : 'auto', // Full height on desktop/tablet
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        // Accordion behavior on mobile: expanded cards grow, collapsed cards shrink
        ...(isMobile ? {
          flexShrink: isCollapsed ? 1 : 0,
          flexGrow: isCollapsed ? 0 : 1,
          maxHeight: isCollapsed ? '60px' : 'none', // Collapsed cards have smaller max height
          minHeight: isCollapsed ? '50px' : 'auto',
          transition: 'flex-grow 0.3s ease, flex-shrink 0.3s ease, max-height 0.3s ease',
          overflow: isCollapsed ? 'hidden' : 'visible',
        } : {}),
        // NØDE Ø symbol background watermark
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ctext x=\'50%25\' y=\'50%25\' font-size=\'80\' font-weight=\'bold\' text-anchor=\'middle\' dominant-baseline=\'middle\' fill=\'rgba(204,255,0,0.03)\' font-family=\'system-ui\'%3EØ%3C/text%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
        backgroundSize: '120px 120px',
        backgroundPosition: 'center',
        ...(isActive ? {
          borderWidth: '2px',
          borderColor: sectionColor || activeBorderColor,
          backgroundColor: sectionColor ? `${sectionColor}15` : activeBgColor,
          boxShadow: sectionColor ? `0 0 20px ${sectionColor}40` : `0 0 20px ${activeBorderColor}40`,
        } : isRestPhase ? {
          borderWidth: '1px',
          borderColor: restBorderColor,
          backgroundColor: restBgColor,
          boxShadow: `0 0 10px ${restBorderColor}20`,
          opacity: 0.9,
        } : {}),
        ...(onClick && !isActive ? {
          ':hover': {
            borderColor: hoverBorderColor,
          }
        } : {}),
      }}
      onMouseEnter={(e) => {
        if (onClick && !isActive) {
          e.currentTarget.style.borderColor = hoverBorderColor;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !isActive) {
          e.currentTarget.style.borderColor = '';
        }
      }}
      onClick={(e) => {
        // On mobile, if card is collapsed, clicking anywhere should expand it
        if (isMobile && isCollapsed && isExpanded !== undefined) {
          // Card is in controlled mode (accordion), clicking should expand it
          e.stopPropagation();
          handleCollapseChange(false);
        } else if (onClick) {
          onClick();
        }
      }}
    >
      {/* Floating Info Icon - Top Right Corner */}
      {block.longDescription && !isMobile && (
        <div 
          className="absolute top-2 right-2 z-10"
          onMouseEnter={(e) => {
            const tooltip = e.currentTarget.querySelector('.info-tooltip') as HTMLElement;
            if (tooltip) {
              tooltip.style.opacity = '1';
              tooltip.style.visibility = 'visible';
            }
          }}
          onMouseLeave={(e) => {
            const tooltip = e.currentTarget.querySelector('.info-tooltip') as HTMLElement;
            if (tooltip) {
              tooltip.style.opacity = '0';
              tooltip.style.visibility = 'hidden';
            }
          }}
        >
          <Icons.INFO 
            size={largeText ? 18 : (compact ? 14 : 16)} 
            className="text-muted-text hover:text-node-volt transition-colors cursor-help"
          />
          {/* Tooltip - Shows on hover */}
          <div 
            className="info-tooltip absolute right-0 top-full mt-2 w-64 p-3 bg-panel thin-border rounded-lg pointer-events-none z-50 shadow-lg transition-all"
            style={{ 
              opacity: 0,
              visibility: 'hidden',
            }}
          >
            <p className="text-xs text-text-white leading-relaxed">
              {block.longDescription}
            </p>
          </div>
        </div>
      )}
      <div className={`flex flex-1 ${isMobile && (block.tierSilver || block.tierGold || block.tierBlack) ? 'flex-row gap-3' : 'flex-col'}`} style={{ minHeight: 0, flex: 1 }}>
        {/* Main Content - Left Side */}
        <div className="flex-1 min-w-0 flex flex-col" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Header - Always Visible */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              {block.label && (
                <div
                  className="text-node-volt font-mono font-bold mb-1"
                  style={{
                    fontSize: largeText 
                      ? (isMobile ? '1.125rem' : isTablet ? '1.375rem' : '1.875rem')
                      : (compact ? '0.875rem' : isMobile ? '1rem' : isTablet ? '0.9375rem' : '1.125rem'),
                  }}
                >
                  {block.label}
                </div>
              )}
              <div className="flex items-center gap-2">
                <h3
                  className="font-bold uppercase tracking-wider flex-1"
                  style={{
                    fontFamily: 'var(--font-space-grotesk)',
                    fontSize: largeText
                      ? (isMobile ? '1rem' : isTablet ? '1.125rem' : '1.625rem')
                      : (compact 
                        ? (isMobile ? '0.875rem' : isTablet ? '0.875rem' : '1rem')
                        : (isMobile ? '1rem' : isTablet ? '1rem' : '1.375rem')),
                    lineHeight: 1.2,
                    color: 'var(--text-white)',
                  }}
                >
                  {block.exerciseName}
                </h3>
              </div>
              {/* Description - Show full description if showFullDescription is true (1-2 cards), otherwise show short */}
              {showFullDescription && !isMobile && block.longDescription ? (
                <div
                  className="text-muted-text mb-2"
                  style={{
                    fontSize: largeText
                      ? (isMobile ? '0.75rem' : isTablet ? '0.8125rem' : '0.9375rem')
                      : (compact ? '0.625rem' : (isMobile ? '0.75rem' : isTablet ? '0.75rem' : '0.875rem')),
                    lineHeight: 1.4,
                  }}
                >
                  {block.longDescription}
                </div>
              ) : (() => {
                const shortDesc = block.shortDescription;
                // Only show if it exists, is a string, and is actually short
                if (shortDesc && typeof shortDesc === 'string' && shortDesc.length > 0 && shortDesc.length <= 80) {
                  return (
                    <div
                      className="text-muted-text mb-2"
                      style={{
                        fontSize: largeText
                          ? (isMobile ? '0.75rem' : isTablet ? '0.875rem' : '0.9375rem')
                          : (compact ? '0.625rem' : (isMobile ? '0.75rem' : isTablet ? '0.8125rem' : '0.875rem')),
                        lineHeight: 1.4,
                      }}
                    >
                      {shortDesc}
                    </div>
                  );
                }
                // Show NOTHING if shortDescription is missing, too long, or invalid
                return null;
              })()}
            </div>
            
            {/* Expand/Collapse Button - Mobile Only */}
            {showExpandButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCollapseChange(!isCollapsed);
                }}
                className="flex-shrink-0 p-2 text-node-volt hover:bg-node-volt/10 rounded transition-colors touch-manipulation"
                aria-label={isCollapsed ? 'Show details' : 'Hide details'}
                style={{ 
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icons.CHEVRON_DOWN 
                  size={20} 
                  className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                />
              </button>
            )}
          </div>

          {/* Rep Scheme - Always Visible if present */}
          {block.repScheme && (
            <div
              className="text-node-volt font-bold mb-2"
              style={{
                fontSize: largeText
                  ? (isMobile ? '0.9375rem' : isTablet ? '0.9375rem' : '1.125rem')
                  : (compact ? '0.8125rem' : (isMobile ? '0.875rem' : isTablet ? '0.875rem' : '1rem')),
                fontFamily: 'var(--font-space-grotesk)',
              }}
            >
              {block.repScheme}
            </div>
          )}

          {/* Collapsible Details - Show when expanded or on desktop */}
          {(!isCollapsed || !isMobile || showTiersAlways) && (block.exerciseInstructions || block.tempo || block.loadPercentage || block.tierSilver || block.tierGold || block.tierBlack) && (
            <div className="transition-all overflow-hidden">
              {/* Instructions - ONLY show if it's short (< 150 chars) to prevent long descriptions */}
              {block.exerciseInstructions && block.exerciseInstructions.length < 150 && (
                <div 
                  className="text-muted-text italic mb-2"
                  style={{
                    fontSize: largeText
                      ? (isMobile ? '0.8125rem' : isTablet ? '0.8125rem' : '0.9375rem')
                      : (compact ? '0.75rem' : (isMobile ? '0.8125rem' : isTablet ? '0.75rem' : '0.875rem')),
                    lineHeight: 1.4,
                  }}
                >
                  {block.exerciseInstructions}
                </div>
              )}

              {/* Tempo and Load */}
              {(block.tempo || block.loadPercentage) && (
                <div className="space-y-1 mb-2">
                  {block.tempo && (
                    <div 
                      className="text-muted-text"
                      style={{ 
                        fontSize: largeText
                          ? (isMobile ? '0.8125rem' : isTablet ? '0.875rem' : '0.9375rem')
                          : (compact ? '0.75rem' : (isMobile ? '0.8125rem' : isTablet ? '0.8125rem' : '0.875rem'))
                      }}
                    >
                      Tempo: <span className="text-node-volt font-bold">{block.tempo}</span>
                    </div>
                  )}
                  {block.loadPercentage && (
                    <div 
                      className="text-muted-text"
                      style={{ 
                        fontSize: largeText
                          ? (isMobile ? '0.75rem' : isTablet ? '0.875rem' : '0.9375rem')
                          : (compact ? '0.625rem' : (isMobile ? '0.75rem' : isTablet ? '0.8125rem' : '0.875rem'))
                      }}
                    >
                      Load: <span className="text-node-volt font-bold">{block.loadPercentage}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Long Description - NEVER show in main card content */}
          {/* Desktop: Use info icon tooltip (see line 82-94) */}
          {/* Mobile: Will be shown in a separate expandable section below if needed */}
          {/* Removed from here to prevent it from showing by default */}

          {/* Tier Prescriptions - Always at Bottom on Desktop/Tablet */}
          {(block.tierSilver || block.tierGold || block.tierBlack) && !isMobile && (
            <div className={`grid gap-1.5 mt-auto ${compact ? 'grid-cols-3' : 'grid-cols-3'}`} style={{ marginTop: 'auto' }}>
              {block.tierSilver && (
                <div className={`bg-panel thin-border rounded ${showTiersAlways ? (compact ? 'p-2' : 'p-2.5') : (compact ? 'p-1' : 'p-1.5')}`} style={{ borderColor: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.1)' }}>
                  <div className={`${showTiersAlways ? (compact ? 'text-[10px]' : 'text-xs') : (compact ? 'text-[9px]' : 'text-[10px]')} mb-0.5 font-bold uppercase tracking-wider`} style={{ color: '#94a3b8' }}>SILVER</div>
                  <div className={`font-medium ${showTiersAlways ? (compact ? 'text-[10px]' : 'text-xs') : (compact ? 'text-[9px]' : 'text-[10px]')}`} style={{ color: '#94a3b8' }}>
                    {getTierDisplayValue(block.tierSilver, block.exerciseName, block)}
                  </div>
                </div>
              )}
              {block.tierGold && (
                <div className={`bg-panel thin-border rounded ${showTiersAlways ? (compact ? 'p-2' : 'p-2.5') : (compact ? 'p-1' : 'p-1.5')}`} style={{ borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                  <div className={`${showTiersAlways ? (compact ? 'text-[10px]' : 'text-xs') : (compact ? 'text-[9px]' : 'text-[10px]')} mb-0.5 font-bold uppercase tracking-wider`} style={{ color: '#fbbf24' }}>GOLD</div>
                  <div className={`font-medium ${showTiersAlways ? (compact ? 'text-[10px]' : 'text-xs') : (compact ? 'text-[9px]' : 'text-[10px]')}`} style={{ color: '#fbbf24' }}>
                    {getTierDisplayValue(block.tierGold, block.exerciseName, block)}
                  </div>
                </div>
              )}
              {block.tierBlack && (
                <div className={`bg-panel thin-border rounded ${showTiersAlways ? (compact ? 'p-2' : 'p-2.5') : (compact ? 'p-1' : 'p-1.5')} border-node-volt`} style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(31, 41, 55, 0.8)' }}>
                  <div className={`${showTiersAlways ? (compact ? 'text-[10px]' : 'text-xs') : (compact ? 'text-[9px]' : 'text-[10px]')} mb-0.5 font-bold uppercase tracking-wider`} style={{ color: '#ffffff' }}>BLACK</div>
                  <div className={`font-medium ${showTiersAlways ? (compact ? 'text-[10px]' : 'text-xs') : (compact ? 'text-[9px]' : 'text-[10px]')}`} style={{ color: '#ffffff' }}>
                    {getTierDisplayValue(block.tierBlack, block.exerciseName, block)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

          {/* Tier Prescriptions - Right Side Column on Mobile (only when not collapsed) */}
        {isMobile && !isCollapsed && (block.tierSilver || block.tierGold || block.tierBlack) && (
          <div className="flex-shrink-0 flex flex-col gap-1.5">
            {block.tierSilver && (
              <div className={`bg-panel thin-border rounded px-2 py-1.5 flex items-center gap-1.5`} style={{ borderColor: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.1)', minWidth: '80px' }}>
                <div className={`text-[10px] font-bold uppercase tracking-wider flex-shrink-0`} style={{ color: '#94a3b8' }}>SILVER</div>
                <div className={`font-medium text-xs truncate`} style={{ color: '#94a3b8' }}>
                  {getTierDisplayValue(block.tierSilver, block.exerciseName, block)}
                </div>
              </div>
            )}
            {block.tierGold && (
              <div className={`bg-panel thin-border rounded px-2 py-1.5 flex items-center gap-1.5`} style={{ borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)', minWidth: '80px' }}>
                <div className={`text-[10px] font-bold uppercase tracking-wider flex-shrink-0`} style={{ color: '#fbbf24' }}>GOLD</div>
                <div className={`font-medium text-xs truncate`} style={{ color: '#fbbf24' }}>
                  {getTierDisplayValue(block.tierGold, block.exerciseName, block)}
                </div>
              </div>
            )}
            {block.tierBlack && (
              <div className={`bg-panel thin-border rounded px-2 py-1.5 flex items-center gap-1.5 border-node-volt`} style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(31, 41, 55, 0.8)', minWidth: '80px' }}>
                <div className={`text-[10px] font-bold uppercase tracking-wider flex-shrink-0 text-text-white`}>BLACK</div>
                <div className={`font-medium text-xs truncate text-text-white`}>
                  {getTierDisplayValue(block.tierBlack, block.exerciseName, block)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Long Description - COMPLETELY REMOVED - Only available via info icon tooltip on desktop */}
      {/* DO NOT show longDescription anywhere in the card - it should ONLY be in the tooltip */}

      {/* Tap Hint on Mobile */}
      {isMobile && hasDetails && isCollapsed && !compact && (
        <div className="text-xs text-muted-text text-center mt-2 italic">
          Tap to view details
        </div>
      )}
    </div>
  );
}

