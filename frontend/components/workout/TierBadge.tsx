'use client';

interface TierBadgeProps {
  tier: 'SILVER' | 'GOLD' | 'BLACK';
}

export default function TierBadge({ tier }: TierBadgeProps) {
  const colors = {
    SILVER: 'bg-concrete-grey text-text-white border border-border-dark',
    GOLD: 'bg-yellow-500 text-deep-asphalt',
    BLACK: 'bg-tech-grey text-node-volt border border-node-volt',
  };

  return (
    <span className={`px-3 py-1 rounded text-sm font-bold ${colors[tier]}`}>
      {tier}
    </span>
  );
}

