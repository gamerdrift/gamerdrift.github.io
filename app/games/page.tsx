"use client";

import React, { Suspense } from 'react';
import { useGames } from '../../lib/state/GameContext';
import InfiniteGameGrid from '../../components/InfiniteGameGrid';

function GamesGridWrapper() {
  const { games } = useGames();
  return <InfiniteGameGrid games={games} />;
}

export default function GamesPage() {
  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-black relative font-mono text-xs">
      {/* Background Grid & Scanline overlays */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      <div className="scanlines"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header HUD */}
        <div className="border-b border-[#00f0ff]/20 pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-[10px] text-[#ff9f00] tracking-[0.3em] block mb-1">DRIFTER CENTRAL OPERATIONS</span>
            <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase">ARCADE_DECK</h1>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              SELECT AN APPROVED TERMINAL GATEWAY TO BOOT THE DYNAMIC RETRO SIMULATION SIGNAL
            </p>
          </div>
          <span className="text-[9px] border border-[#00f0ff]/20 bg-[#00f0ff]/5 px-3 py-1 text-[#00f0ff]">
            CHANNELS: 8 ACTIVE // SECURE_GRID
          </span>
        </div>

        {/* Dynamic Games Grid */}
        <Suspense fallback={
          <div className="w-full py-32 flex flex-col items-center justify-center font-mono text-xs text-[#00f0ff]">
            <div className="animate-pulse tracking-[0.25em] uppercase">BOOTING_ARCADE_INTERFACE // SYNCING_NODES...</div>
          </div>
        }>
          <GamesGridWrapper />
        </Suspense>

      </div>
    </div>
  );
}
