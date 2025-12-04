'use client';

import SectionWarmup from './SectionWarmup';

interface SectionFlowProps {
  title: string;
  note?: string;
  blocks: any[];
}

export default function SectionFlow(props: SectionFlowProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <h2 className="text-5xl font-bold mb-4 text-center">{props.title}</h2>
      {props.note && (
        <p className="text-muted-text text-xl mb-4 text-center italic">
          {props.note}
        </p>
      )}
      <p className="text-node-volt text-lg mb-8 text-center">
        Focus on precision, breath, and quality of movement
      </p>
      <div className="w-full max-w-4xl">
        <SectionWarmup {...props} />
      </div>
    </div>
  );
}

