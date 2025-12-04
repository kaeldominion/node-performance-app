'use client';

import { useState, useCallback } from 'react';

export function useWorkoutProgress(totalSections: number) {
  const [currentSection, setCurrentSection] = useState(0);

  const updateProgress = useCallback((sectionIndex: number) => {
    setCurrentSection(sectionIndex);
  }, []);

  const progress = totalSections > 0 ? ((currentSection + 1) / totalSections) * 100 : 0;

  return {
    progress,
    currentSection,
    updateProgress,
  };
}

