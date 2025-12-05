'use client';

import Link from 'next/link';

interface LogoProps {
  className?: string;
  showOS?: boolean;
}

export function Logo({ className = '', showOS = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      {/* Green square with Ø symbol */}
      <div className="w-8 h-8 bg-node-volt text-dark font-heading font-bold text-lg flex items-center justify-center flex-shrink-0">
        Ø
      </div>
      {/* NØDE OS text */}
      <span className="text-2xl font-bold font-heading tracking-tight">
        N<span className="text-node-volt">Ø</span>DE{showOS && <span className="text-muted-text text-lg ml-1">OS</span>}
      </span>
    </Link>
  );
}

