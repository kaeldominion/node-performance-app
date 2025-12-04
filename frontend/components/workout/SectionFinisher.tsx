'use client';

import SectionWarmup from './SectionWarmup';

interface SectionFinisherProps {
  title: string;
  note?: string;
  blocks: any[];
}

export default function SectionFinisher(props: SectionFinisherProps) {
  return <SectionWarmup {...props} />;
}

