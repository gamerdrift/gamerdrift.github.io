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
      className="group relative w-full aspect-[4/5] rounded overflow-hidden border border-[#00f0ff]/20 bg-[#0c0f16] hover:border-[#ff9f00] hover:shadow-[0_0_15px_rgba(255,159,0,0.15)] transition-all duration-300 block cursor-pointer hover:-translate-y-1 hover:scale-[1.02] transform"
    >
      {/* Background Poster Image */}
      <img 
        src={game.thumbnail} 
        alt={game.title} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent group-hover:from-black/98 transition-colors duration-300"></div>

      {/* Tags / HUD metrics (Top Left / Right) */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-20">
        <span className="text-[8px] font-bold tracking-widest font-mono text-[#00f0ff] border border-[#00f0ff]/40 bg-black/80 px-1.5 py-0.5">
          {game.category.toUpperCase()}
        </span>
        {game.plays > 4000 && (
          <span className="text-[8px] font-bold tracking-widest font-mono text-[#ff9f00] border border-[#ff9f00]/40 bg-black/80 px-1.5 py-0.5 animate-pulse">
            HOT
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 flex space-x-1.5 z-20">
        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className={`w-7 h-7 border flex items-center justify-center text-xs transition-all ${
            favorited 
              ? 'bg-[#ff9f00]/10 border-[#ff9f00] text-[#ff9f00] shadow-[0_0_8px_rgba(255,159,0,0.2)]' 
              : 'bg-black/80 border-slate-800 text-white hover:border-[#ff9f00] hover:text-[#ff9f00]'
          }`}
          title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          {favorited ? '❤️' : '♡'}
        </button>

        {/* Share Button */}
        <button
          onClick={shareGame}
          className={`w-7 h-7 border flex items-center justify-center text-[10px] transition-all bg-black/80 border-slate-800 text-white hover:border-[#00f0ff] hover:text-[#00f0ff] ${
            copied ? 'border-[#00f0ff] text-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.2)]' : ''
          }`}
          title="Copy Link"
        >
          {copied ? '✓' : '🔗'}
        </button>
      </div>
      
      {/* Bottom Information Details */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-1.5 font-mono">
        
        {/* Play counts and Ratings stars */}
        <div className="flex justify-between items-center text-[9px] text-slate-500">
          <span className="flex items-center gap-1">
            ⭐️ {game.rating > 0 ? game.rating : 'N/A'}
          </span>
          <span>
            👁️ {game.plays.toLocaleString()} plays
          </span>
        </div>

        <h3 className="text-xs font-bold text-white tracking-wide group-hover:text-[#ff9f00] transition-colors duration-300 truncate uppercase">
          {game.title}
        </h3>
        
        <p className="text-[10px] text-slate-500 truncate leading-relaxed max-h-4 group-hover:text-slate-400 uppercase">
          {game.description || 'Access terminal files and download static gameplay frame.'}
        </p>

        {/* Quick Play CTA on hover */}
        <div className="h-0 group-hover:h-8 opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-300 mt-1">
          <div className="w-full h-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[9px] font-bold tracking-widest text-[#00f0ff] uppercase group-hover:animate-pulse">
            ⚡ LAUNCH GAME NODE ⚡
          </div>
        </div>
      </div>
    </Link>
  );
}
