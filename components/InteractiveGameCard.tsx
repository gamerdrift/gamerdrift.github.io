"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useGames, GameSubmission } from '../lib/state/GameContext';
import { useUser } from '../lib/state/UserContext';

export default function InteractiveGameCard({ game }: { game: GameSubmission }) {
  const { isFavorite, addFavorite, removeFavorite } = useGames();
  const { user, gainXP } = useUser();
  const [copied, setCopied] = useState(false);

  const favorited = isFavorite(game.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorited) {
      removeFavorite(game.id);
    } else {
      addFavorite(game.id);
      if (user) gainXP(10); // Award XP for adding to favorites
    }
  };

  const shareGame = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/play/${game.id}/`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      if (user) gainXP(5); // Award XP for sharing
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Link 
      href={game.url}
      className="group relative w-full flex flex-col rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] hover:border-[#00f0ff]/60 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:scale-[1.02] transform"
    >
      {/* Poster Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-black/60 border-b border-[#00f0ff]/15">
        {/* Background Poster Image */}
        <img 
          src={game.thumbnail} 
          alt={game.title} 
          className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-90 transition-all duration-700" 
        />
        
        {/* Subtle gradient overlay for depth only - no grid/scanlines */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

        {/* Decorative HUD Corner Bracket Marks on Hover */}
        <div className="absolute inset-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#00f0ff]"></div>
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#00f0ff]"></div>
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#00f0ff]"></div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#00f0ff]"></div>
        </div>

        {/* Tags / HUD metrics (Top Left / Right) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
          <span className="text-[8px] font-black tracking-widest font-mono text-[#00f0ff] border border-[#00f0ff]/30 bg-black/85 px-2 py-0.5 rounded-sm">
            {game.category.toUpperCase()}
          </span>
          {game.plays > 4000 && (
            <span className="text-[8px] font-black tracking-widest font-mono text-[#ff00ff] border border-[#ff00ff]/30 bg-black/85 px-2 py-0.5 rounded-sm animate-pulse shadow-[0_0_5px_rgba(255,0,255,0.2)]">
              SYS_HOT
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex space-x-1.5 z-20">
          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className={`w-7 h-7 border rounded flex items-center justify-center text-xs transition-all ${
              favorited 
                ? 'bg-[#ff9f00]/15 border-[#ff9f00] text-[#ff9f00] shadow-[0_0_10px_rgba(255,159,0,0.3)]' 
                : 'bg-black/85 border-slate-800 text-white hover:border-[#ff9f00] hover:text-[#ff9f00] hover:scale-105'
            }`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {favorited ? '❤️' : '♡'}
          </button>

          {/* Share Button */}
          <button
            onClick={shareGame}
            className={`w-7 h-7 border rounded flex items-center justify-center text-[10px] transition-all bg-black/85 border-slate-800 text-white hover:border-[#00f0ff] hover:text-[#00f0ff] hover:scale-105 ${
              copied ? 'border-[#00f0ff] text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)]' : ''
            }`}
            title="Copy Link"
          >
            {copied ? '✓' : '🔗'}
          </button>
        </div>
      </div>
      
      {/* Bottom Details Panel (Not positioned on top of image, dynamic height) */}
      <div className="p-3.5 flex flex-col gap-2 flex-grow justify-between bg-black/30 relative z-25">
        
        <div className="flex flex-col gap-1.5">
          {/* Play counts and Ratings stars */}
          <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold tracking-wide">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              ⭐ {game.rating > 0 ? game.rating : 'N/A'}
            </span>
            <span className="group-hover:text-slate-300 transition-colors">
              👁 {game.plays.toLocaleString()}
            </span>
          </div>

          {/* Title - bold, clear, readable */}
          <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-[#00f0ff] transition-colors duration-300 leading-snug font-sans">
            {game.title}
          </h3>
          
          {/* Description - clean, sentence case, readable */}
          <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 group-hover:line-clamp-none group-hover:text-slate-200 transition-all duration-300">
            {game.description || 'Click to launch this game.'}
          </p>
        </div>

        {/* Play CTA Button */}
        <div className="w-full mt-2.5 py-2.5 bg-gradient-to-r from-[#00f0ff]/10 to-[#0066ff]/10 border border-[#00f0ff]/25 group-hover:from-[#00f0ff]/20 group-hover:to-[#0066ff]/20 group-hover:border-[#00f0ff]/70 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase shadow-none group-hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300 font-sans">
          <span className="text-sm">▶</span> PLAY NOW
        </div>
      </div>
    </Link>
  );
}
