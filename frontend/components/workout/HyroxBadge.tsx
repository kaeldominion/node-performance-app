'use client';

interface HyroxBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
};

export default function HyroxBadge({ size = 'md' }: HyroxBadgeProps) {
  return (
    <span
      className={`bg-orange-600 text-text-white ${sizeClasses[size]} rounded font-bold inline-block`}
      title="HYROX-style 90-minute conditioning workout"
    >
      HYROX
    </span>
  );
}

