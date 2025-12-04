'use client';

import SectionWarmup from './SectionWarmup';

interface SectionWaveProps {
  title: string;
  note?: string;
  blocks: any[];
}

export default function SectionWave(props: SectionWaveProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <h2 className="text-5xl font-bold mb-4 text-center">{props.title}</h2>
      {props.note && <p className="text-muted-text text-xl mb-8">{props.note}</p>}
      <div className="w-full max-w-4xl">
        <SectionWarmup {...props} />
      </div>
    </div>
  );
}

