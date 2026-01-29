'use client';

import React from 'react';
import { OptimizedMap } from '@/components/map/OptimizedMap';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 relative">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex absolute top-0 left-0 p-4 pointer-events-none">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          LocalGov DX Intelligence&nbsp;
          <code className="font-mono font-bold">Prototype</code>
        </p>
      </div>

      <div className="absolute inset-0 w-full h-full">
        <OptimizedMap />
      </div>
    </main>
  );
}
