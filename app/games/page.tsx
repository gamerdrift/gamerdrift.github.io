"use client";

import React, { useState } from 'react';
import GameCard from '../../components/GameCard';
import { games } from '../../data/games';

export default function GamesPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Categories mapping based on game id
  const getCategory = (id: string) => {
    if (id === 'retro-racer') return 'Arcade';
    if (id === 'space-invaders') return 'Shooting';
    if (id === 'pixel-platformer') return 'Casual';
    if (id === 'snake') return 'Arcade';
    if (id === 'tetris') return 'Puzzle';
    if (id === '2048') return 'Puzzle';
    return 'Arcade';
  };

  const categories = ['All', 'Arcade', 'Shooting', 'Puzzle', 'Casual'];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeTab === 'All' || getCategory(game.id) === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full min-h-screen py-12 px-4 md:px-8 bg-cyber-grid flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        {/* Page Header */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-widest text-center neon-text">
          ARCADE TERMINALS
        </h1>
        <p className="text-text-secondary text-sm md:text-base mb-8 max-w-lg text-center font-medium">
          Access the decentralized gaming grid. Pick your node and jack in.
        </p>

        {/* Filter and Search Panel */}
        <div className="w-full max-w-3xl cyber-card p-6 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="SEARCH NODE_ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#150a21]/60 border border-neon-blue/40 rounded-lg px-4 py-2 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all duration-300"
            />
            <div className="absolute right-3 top-2.5 text-neon-blue/60 text-xs font-mono">SYS.SRC</div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`text-xs md:text-sm font-bold tracking-wider px-3.5 py-1.5 rounded transition-all duration-300 border ${
                  activeTab === cat
                    ? 'bg-neon-pink/20 border-neon-pink text-white shadow-[0_0_12px_rgba(255,0,255,0.4)]'
                    : 'bg-transparent border-neon-blue/20 text-text-secondary hover:border-neon-blue/50 hover:text-white'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center cyber-card max-w-xl text-center">
            <div className="text-neon-pink text-4xl mb-4 animate-pulse">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">NO UPLINKS FOUND</h3>
            <p className="text-text-secondary text-sm font-mono">
              The query for "{search}" returned 0 active terminal files.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
