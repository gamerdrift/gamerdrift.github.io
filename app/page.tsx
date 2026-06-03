"use client";

import React from 'react';
import GlassCarousel from '../components/GlassCarousel';
import GameRow from '../components/GameRow';
import InfiniteGameGrid from '../components/InfiniteGameGrid';
import { useGames } from '../lib/state/GameContext';
import { useUser } from '../lib/state/UserContext';

export default function Home() {
  const { games, history } = useGames();
  const { user } = useUser();

  // 1. Filter and sort games for home shelves
  const liveGames = games.filter(g => g.approved);

  // Trending shelf (sorted by play count)
  const trendingGames = [...liveGames].sort((a, b) => b.plays - a.plays).slice(0, 8);

  // Recently played shelf (continue playing)
  const historyGames = liveGames.filter(g => history.includes(g.id));

  // Recommended shelf (sorted by rating, excluding trending ones if possible)
  const recommendedGames = [...liveGames]
    .sort((a, b) => b.rating - a.rating)
    .filter(g => !trendingGames.slice(0, 4).map(t => t.id).includes(g.id))
    .slice(0, 8);

  // Multiplayer shelf (chess, tictactoe, or arena descriptions)
  const multiplayerGames = liveGames.filter(g => 
    g.title.toLowerCase().includes('chess') || 
    g.title.toLowerCase().includes('tic') || 
    g.title.toLowerCase().includes('vs') || 
    g.description?.toLowerCase().includes('multiplayer') || 
    g.description?.toLowerCase().includes('opponent')
  ).slice(0, 8);

  return (
    <div className="w-full min-h-screen pt-4 pb-16 px-4 md:px-8 bg-cyber-grid flex flex-col items-center">
      
      {/* Welcome Banner HUD for Logged-In Drifters */}
      {user && (
        <div className="w-full max-w-5xl bg-black/40 border border-neon-blue/20 rounded-xl px-5 py-3.5 mb-2 flex justify-between items-center text-xs font-mono backdrop-blur-md">
          <span className="text-[#00f0ff] font-bold tracking-wider">
            🛰️ DRIFTER_LINK: SECURE_ESTABLISHED // WELCOME BACK, {user.username.toUpperCase()}
          </span>
          <span className="text-white hidden sm:inline">
            LEVEL: <span className="text-[#ff00ff] font-black">{user.level}</span> // XP: {user.xp}
          </span>
        </div>
      )}

      <div className="w-full max-w-5xl flex flex-col items-center mt-4">
        
        {/* Flagship GlassCarousel Map briefings */}
        <GlassCarousel />

        {/* Continue playing shelf (visible only when there's history) */}
        {historyGames.length > 0 && (
          <div className="w-full mt-10">
            <GameRow title="CONTINUE DRIFTING" games={historyGames} />
          </div>
        )}

        {/* Trending Shelf */}
        <div className="w-full mt-10">
          <GameRow title="TRENDING NOW" games={trendingGames} />
        </div>

        {/* Recommended Shelf */}
        <div className="w-full mt-6">
          <GameRow title="RECOMMENDED FOR YOU" games={recommendedGames} />
        </div>

        {/* Multiplayer Shelf */}
        {multiplayerGames.length > 0 && (
          <div className="w-full mt-6">
            <GameRow title="MULTIPLAYER ARENAS" games={multiplayerGames} />
          </div>
        )}

        {/* Endless Grid Header & Element */}
        <div className="w-full mt-16 border-t border-neon-pink/20 pt-10">
          <div className="text-center mb-6">
            <h2 className="text-xs font-mono font-black text-neon-pink tracking-[0.25em] uppercase mb-1">
              ⚡ DECENTRALIZED ARCHIVE GRID ⚡
            </h2>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase">
              EXPLORE ALL CABINETS
            </h1>
          </div>

          <InfiniteGameGrid games={games} />
        </div>

      </div>
    </div>
  );
}
