'use client';

interface TierBadgeProps {
  tier: 'SILVER' | 'GOLD' | 'BLACK';
}

export default function TierBadge({ tier }: TierBadgeProps) {
  const colors = {
    SILVER: 'bg-panel text-text-white thin-border',
    GOLD: 'bg-yellow-500 text-dark',
    BLACK: 'bg-panel text-node-volt border border-node-volt',
  };

  return (
    <span className={`px-3 py-1 rounded text-sm font-bold ${colors[tier]}`}>
      {tier}
    </span>
  );
}

