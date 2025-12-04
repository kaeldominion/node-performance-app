'use client';

interface ArchetypeBadgeProps {
  archetype: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
}

const archetypeConfig = {
  PR1ME: {
    label: 'PR1ME',
    color: 'bg-node-volt text-dark',
    description: 'Primary Strength',
  },
  FORGE: {
    label: 'FORGE',
    color: 'bg-yellow-500 text-dark',
    description: 'Strength Superset',
  },
  ENGIN3: {
    label: 'ENGIN3',
    color: 'bg-blue-500 text-text-white',
    description: 'Hybrid EMOM',
  },
  CIRCUIT_X: {
    label: 'CIRCUIT X',
    color: 'bg-red-500 text-text-white',
    description: 'Anaerobic MetCon',
  },
  CAPAC1TY: {
    label: 'CAPAC1TY',
    color: 'bg-purple-500 text-text-white',
    description: 'Long Engine',
  },
  FLOWSTATE: {
    label: 'FLOWSTATE',
    color: 'bg-green-500 text-text-white',
    description: 'Recovery Flow',
  },
};

export default function ArchetypeBadge({ archetype, size = 'md' }: ArchetypeBadgeProps) {
  if (!archetype) return null;

  const config = archetypeConfig[archetype as keyof typeof archetypeConfig];
  if (!config) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span
      className={`${config.color} ${sizeClasses[size]} rounded font-bold inline-block`}
      title={config.description}
    >
      {config.label}
    </span>
  );
}

