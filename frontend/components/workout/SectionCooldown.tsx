'use client';

import SectionWarmup from './SectionWarmup';

interface SectionCooldownProps {
  title: string;
  note?: string;
  blocks: any[];
}

export default function SectionCooldown(props: SectionCooldownProps) {
  return <SectionWarmup {...props} />;
}

