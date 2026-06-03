"use client";

import React, { useRef, useEffect, useState } from 'react';
import InteractiveGameCard from './InteractiveGameCard';
import { GameSubmission } from '../lib/state/GameContext';

interface GameRowProps {
  title: string;
  games: GameSubmission[];
  loading?: boolean;
}

export default function GameRow({ title, games, loading = false }: GameRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Handle horizontal scroll metrics for showing/hiding arrows
  const checkScroll = () => {
    const row = rowRef.current;
    if (!row) return;
    setShowLeftArrow(row.scrollLeft > 10);
    setShowRightArrow(row.scrollLeft < row.scrollWidth - row.clientWidth - 10);
  };

  useEffect(() => {
    const row = rowRef.current;
    if (row) {
      row.addEventListener('scroll', checkScroll);
      // Run once on load
      checkScroll();
    }
    return () => {
      if (row) row.removeEventListener('scroll', checkScroll);
    };
  }, [games, loading]);

  const scroll = (direction: 'left' | 'right') => {
    const row = rowRef.current;
    if (!row) return;
    const scrollAmount = row.clientWidth * 0.75;
    row.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col mb-10 relative">
        <h3 className="text-sm font-extrabold text-gray-500 font-mono tracking-widest uppercase mb-4 pl-1">
          {title}
        </h3>
        <div className="flex space-x-6 overflow-x-hidden py-2 w-full">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div 
              key={idx} 
              className="w-48 sm:w-56 aspect-[4/5] rounded-xl bg-[#1b0d2d]/40 border border-white/5 animate-pulse flex-shrink-0 flex items-center justify-center text-xs font-mono text-gray-700"
            >
              LOADING_PACKET...
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (games.length === 0) return null;

  return (
    <div className="w-full flex flex-col mb-10 relative group">
      {/* Title */}
      <div className="flex items-center justify-between mb-4 pl-1">
        <h3 className="text-base md:text-lg font-black text-white font-sans tracking-wide uppercase flex items-center gap-2">
          <span className="text-neon-pink">■</span> {title}
        </h3>
        <span className="text-[10px] text-neon-blue font-mono uppercase tracking-widest group-hover:animate-pulse">
          {games.length} NODES_ONLINE
        </span>
      </div>

      {/* Navigation Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-[-20px] top-[50%] translate-y-[-50%] w-10 h-10 rounded-full border border-neon-blue/40 bg-[#090311]/90 flex items-center justify-center text-white hover:border-[#ff00ff] hover:text-[#ff00ff] z-30 transition-all duration-300 shadow-[0_0_8px_rgba(0,240,255,0.2)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]"
        >
          ◀
        </button>
      )}

      {/* Main Scroller Content */}
      <div 
        ref={rowRef}
        className="flex space-x-6 overflow-x-auto scrollbar-none py-2 w-full select-none scroll-smooth pr-6"
      >
        {games.map((game) => (
          <div key={game.id} className="w-48 sm:w-56 flex-shrink-0 transition-transform duration-300">
            <InteractiveGameCard game={game} />
          </div>
        ))}
      </div>

      {/* Navigation Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-[-10px] top-[50%] translate-y-[-50%] w-10 h-10 rounded-full border border-neon-blue/40 bg-[#090311]/90 flex items-center justify-center text-white hover:border-[#ff00ff] hover:text-[#ff00ff] z-30 transition-all duration-300 shadow-[0_0_8px_rgba(0,240,255,0.2)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]"
        >
          ▶
        </button>
      )}
    </div>
  );
}
