"use client";

import React, { useState, useEffect, useRef } from 'react';
import InteractiveGameCard from './InteractiveGameCard';
import { GameSubmission } from '../lib/state/GameContext';

export default function InfiniteGameGrid({ games }: { games: GameSubmission[] }) {
  const [itemsToShow, setItemsToShow] = useState(12);
  const [sortBy, setSortBy] = useState<'plays' | 'rating' | 'alphabetical' | 'newest'>('plays');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Action', 'Shooting', 'Racing', 'Casual', 'Puzzle', 'Retro', 'Multiplayer', 'Arcade'];

  // Filter games based on category
  const filteredGames = games.filter(g => {
    if (!g.approved) return false;
    return selectedCategory === 'All' || g.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Sort games based on controls
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === 'plays') return b.plays - a.plays;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
    if (sortBy === 'newest') return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    return 0;
  });

  const visibleGames = sortedGames.slice(0, itemsToShow);

  // Setup infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && itemsToShow < sortedGames.length) {
          // Mock loading delay for premium arcade aesthetic
          setTimeout(() => {
            setItemsToShow(prev => Math.min(prev + 12, sortedGames.length));
          }, 400);
        }
      },
      { threshold: 0.1 }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, [itemsToShow, sortedGames.length]);

  // Reset page size on sorting/category change
  useEffect(() => {
    setItemsToShow(12);
  }, [sortBy, selectedCategory]);

  return (
    <div className="w-full mt-10">
      {/* Filtering and Sorting HUD */}
      <div className="w-full flex flex-col lg:flex-row gap-5 justify-between items-center bg-[#0c0f16]/90 border border-[#00f0ff]/20 rounded-lg p-4 md:p-6 mb-8 backdrop-blur-md">
        
        {/* Categories filters tabs */}
        <div className="flex flex-wrap gap-2 justify-center lg:justify-start flex-grow">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-mono tracking-wider px-3 py-1.5 border transition-all duration-200 ${
                selectedCategory === cat
                  ? 'border-[#ff9f00] bg-[#ff9f00]/10 text-white shadow-[0_0_10px_rgba(255,159,0,0.15)]'
                  : 'bg-transparent border-slate-900 text-slate-400 hover:border-[#00f0ff]/30 hover:text-white'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sorting selection Dropdown */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <span className="text-[10px] font-bold font-mono text-[#00f0ff] tracking-widest">SORT_BY:</span>
          <div className="flex bg-black/40 rounded-lg p-1 border border-slate-900">
            {[
              { id: 'plays', label: '🔥 POPULAR' },
              { id: 'rating', label: '⭐️ RATED' },
              { id: 'newest', label: '⚡ NEWEST' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSortBy(item.id as any)}
                className={`text-[9px] font-bold font-mono px-3 py-1 rounded transition-all ${
                  sortBy === item.id 
                    ? 'bg-[#00f0ff]/10 text-white border border-[#00f0ff]/30 shadow-[0_0_8px_rgba(0,240,255,0.15)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Endless Grid */}
      {visibleGames.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 w-full">
          {visibleGames.map((game) => (
            <InteractiveGameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="w-full py-16 flex flex-col items-center justify-center border border-[#ff9f00]/30 bg-[#0c0f16] max-w-xl mx-auto text-center">
          <div className="text-[#ff9f00] text-3xl mb-3 animate-pulse">⚠️</div>
          <h3 className="text-lg font-bold text-white mb-1">GRID NODE OFFLINE</h3>
          <p className="text-slate-500 text-xs font-mono">
            No approved terminal packets found for {selectedCategory.toUpperCase()} category.
          </p>
        </div>
      )}

      {/* Intersection Observer Anchor with Skeleton Cards */}
      {itemsToShow < sortedGames.length && (
        <div ref={bottomRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 w-full mt-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div 
              key={idx} 
              className="w-full aspect-[4/5] bg-slate-950 border border-slate-900 animate-pulse flex items-center justify-center text-[10px] font-mono text-slate-700"
            >
              BUFF_GRID_NODE...
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

