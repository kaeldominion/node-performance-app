'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'tv';

export interface LayoutConfig {
  breakpoint: Breakpoint;
  timerFontSize: string;
  sectionTitleSize: string;
  exerciseNameSize: string;
  gridColumns: number;
  spacing: string;
  touchTargetSize: string;
}

const LAYOUT_CONFIGS: Record<Breakpoint, LayoutConfig> = {
  mobile: {
    breakpoint: 'mobile',
    timerFontSize: '8rem', // 8rem+ on mobile
    sectionTitleSize: '3rem', // 5xl equivalent
    exerciseNameSize: '1.5rem', // 2xl equivalent
    gridColumns: 1,
    spacing: '1rem',
    touchTargetSize: '44px',
  },
  tablet: {
    breakpoint: 'tablet',
    timerFontSize: '10rem',
    sectionTitleSize: '4rem', // 6xl equivalent
    exerciseNameSize: '2rem', // 3xl equivalent
    gridColumns: 2,
    spacing: '1.5rem',
    touchTargetSize: '48px',
  },
  desktop: {
    breakpoint: 'desktop',
    timerFontSize: '12rem', // 12rem+ on desktop
    sectionTitleSize: '5rem', // 7xl equivalent
    exerciseNameSize: '2.5rem', // 4xl equivalent
    gridColumns: 3,
    spacing: '2rem',
    touchTargetSize: '52px',
  },
  tv: {
    breakpoint: 'tv',
    timerFontSize: '16rem', // 16rem+ for large TV
    sectionTitleSize: '7rem',
    exerciseNameSize: '3.5rem',
    gridColumns: 4,
    spacing: '3rem',
    touchTargetSize: '60px',
  },
};

export function useResponsiveLayout() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [config, setConfig] = useState<LayoutConfig>(LAYOUT_CONFIGS.desktop);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      let newBreakpoint: Breakpoint;
      if (width < 640) {
        newBreakpoint = 'mobile';
      } else if (width < 1024) {
        newBreakpoint = 'tablet';
      } else if (width < 1920) {
        newBreakpoint = 'desktop';
      } else {
        newBreakpoint = 'tv';
      }

      if (newBreakpoint !== breakpoint) {
        setBreakpoint(newBreakpoint);
        setConfig(LAYOUT_CONFIGS[newBreakpoint]);
      }
    };

    // Initial check
    updateBreakpoint();

    // Listen for resize events
    window.addEventListener('resize', updateBreakpoint);
    
    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', updateBreakpoint);

    return () => {
      window.removeEventListener('resize', updateBreakpoint);
      window.removeEventListener('orientationchange', updateBreakpoint);
    };
  }, [breakpoint]);

  // Get responsive font size based on breakpoint
  const getResponsiveSize = (baseSize: string, multiplier: number = 1) => {
    const sizeMap: Record<Breakpoint, number> = {
      mobile: 0.8,
      tablet: 1,
      desktop: 1.2,
      tv: 1.5,
    };
    
    const base = parseFloat(baseSize);
    const unit = baseSize.replace(/[\d.]/g, '');
    return `${base * sizeMap[breakpoint] * multiplier}${unit}`;
  };

  // Get grid columns for exercise cards
  const getExerciseGridColumns = (sectionType?: string) => {
    // EMOM sections might need more columns
    if (sectionType === 'EMOM' && breakpoint === 'desktop') {
      return 4;
    }
    if (sectionType === 'EMOM' && breakpoint === 'tv') {
      return 5;
    }
    return config.gridColumns;
  };

  return {
    breakpoint,
    config,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isTV: breakpoint === 'tv',
    getResponsiveSize,
    getExerciseGridColumns,
  };
}


