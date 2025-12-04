'use client';

interface TierBadgeProps {
  tier: 'SILVER' | 'GOLD' | 'BLACK';
}

export default function TierBadge({ tier }: TierBadgeProps) {
  const colors = {
    SILVER: 'bg-gray-600 text-white',
    GOLD: 'bg-yellow-600 text-white',
    BLACK: 'bg-gray-900 text-node-volt border border-node-volt',
  };

  return (
    <span className={`px-3 py-1 rounded text-sm font-bold ${colors[tier]}`}>
      {tier}
    </span>
  );
}

