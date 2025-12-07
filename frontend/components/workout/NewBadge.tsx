'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface NewBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
};

export default function NewBadge({ size = 'sm' }: NewBadgeProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <span
      className={`${isDark ? 'bg-node-volt text-dark' : 'bg-blue-500 text-white'} ${sizeClasses[size]} rounded font-bold inline-block`}
      title="New workout - not yet previewed"
    >
      NEW
    </span>
  );
}

