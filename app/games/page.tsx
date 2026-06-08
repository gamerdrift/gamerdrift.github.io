"use client";

import React from 'react';
import InfiniteGameGrid from '../../components/InfiniteGameGrid';
import { useGames } from '../../lib/state/GameContext';

export default function GamesPage() {
  const { games } = useGames();

  // Count active live modules
  const liveGamesCount = games.filter(g => g.approved).length;

  return (
    <div className="w-full min-h-screen py-12 px-4 md:px-8 bg-[#05070a] flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        
        {/* Page Header HUD */}
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono text-neon-blue tracking-[0.35em] uppercase font-bold mb-1.5 block">
            GAMERDRIFT // NETWORK PORTALS
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-widest neon-text">
            ARCADE CABINETS
          </h1>
          <p className="text-text-secondary text-sm max-w-lg mx-auto leading-relaxed">
            Access the decentralized gaming grid. Filter by tactical categorizations, sort by ratings, and play instantly.
          </p>
          <span className="text-[9px] font-mono text-neon-pink tracking-widest block mt-3 font-semibold">
            STATUS: {liveGamesCount} ACTIVE_NODES_ONLINE // ZERO_LATENCY
          </span>
        </div>

        {/* Global Infinite game grid */}
        <div className="w-full">
          <InfiniteGameGrid games={games} />
        </div>

      </div>
    </div>
  );
}
