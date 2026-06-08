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
      className="group relative w-full flex flex-col rounded-xl overflow-hidden border border-[#00f0ff]/20 bg-[#0c0f16]/95 hover:border-[#00f0ff] hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all duration-500 cursor-pointer hover:-translate-y-1.5 hover:scale-[1.02] transform"
    >
      {/* Poster Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-black/60 border-b border-[#00f0ff]/15">
        {/* Background Poster Image */}
        <img 
          src={game.thumbnail} 
          alt={game.title} 
          className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-90 transition-all duration-700" 
        />
        
        {/* Cyber Gradient Overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

        {/* Cyber Scanline Grid Overlay */}
        <div className="absolute inset-0 bg-tactical-grid opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-500"></div>
        <div className="absolute inset-0 scanlines opacity-5 pointer-events-none group-hover:opacity-15 transition-opacity duration-500"></div>

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
          <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold tracking-widest font-mono">
            <span className="flex items-center gap-1 text-[#ff9f00]">
              ⭐️ {game.rating > 0 ? game.rating : 'N/A'}
            </span>
            <span className="group-hover:text-slate-400">
              👁️ {game.plays.toLocaleString()} PLAYS
            </span>
          </div>

          {/* Title - Orbitron / Space Grotesk */}
          <h3 className="text-xs md:text-sm font-extrabold text-white tracking-widest group-hover:text-[#00f0ff] transition-colors duration-300 uppercase leading-snug font-sans">
            {game.title}
          </h3>
          
          {/* Description - wraps on hover instead of truncating */}
          <p className="text-[10px] text-slate-500 leading-normal uppercase line-clamp-2 group-hover:line-clamp-none group-hover:text-slate-300 transition-all duration-300">
            {game.description || 'Access terminal files and download static gameplay frame.'}
          </p>
        </div>

        {/* Play CTA Button */}
        <div className="w-full mt-2 py-2 bg-[#00f0ff]/5 border border-[#00f0ff]/20 group-hover:bg-[#00f0ff]/15 group-hover:border-[#00f0ff] rounded flex items-center justify-center text-[9px] font-black tracking-widest text-[#00f0ff] uppercase shadow-[inset_0_0_6px_rgba(0,240,255,0.05)] group-hover:shadow-[0_0_12px_rgba(0,240,255,0.25)] transition-all duration-300 font-mono">
          🚀 INITIALIZE CABINET 🚀
        </div>
      </div>
    </Link>
  );
}
