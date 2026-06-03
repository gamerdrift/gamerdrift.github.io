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
      className="group relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-neon-blue/20 bg-card-bg hover:border-neon-pink hover:shadow-[0_0_20px_rgba(255,0,255,0.4)] transition-all duration-300 block cursor-pointer hover:-translate-y-1 hover:scale-[1.02] transform"
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
        <span className="text-[8px] font-bold tracking-widest font-mono text-neon-blue border border-neon-blue/40 bg-black/60 px-1.5 py-0.5 rounded">
          {game.category.toUpperCase()}
        </span>
        {game.plays > 4000 && (
          <span className="text-[8px] font-bold tracking-widest font-mono text-neon-pink border border-neon-pink/40 bg-black/60 px-1.5 py-0.5 rounded animate-pulse">
            HOT
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 flex space-x-1.5 z-20">
        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className={`w-7 h-7 rounded border flex items-center justify-center text-xs transition-all ${
            favorited 
              ? 'bg-neon-pink/20 border-neon-pink text-neon-pink shadow-[0_0_8px_rgba(255,0,255,0.4)]' 
              : 'bg-black/60 border-white/10 text-white hover:border-neon-pink hover:text-neon-pink'
          }`}
          title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          {favorited ? '❤️' : '♡'}
        </button>

        {/* Share Button */}
        <button
          onClick={shareGame}
          className={`w-7 h-7 rounded border flex items-center justify-center text-[10px] transition-all bg-black/60 border-white/10 text-white hover:border-neon-blue hover:text-neon-blue ${
            copied ? 'border-neon-blue text-neon-blue shadow-[0_0_8px_rgba(0,240,255,0.4)]' : ''
          }`}
          title="Copy Link"
        >
          {copied ? '✓' : '🔗'}
        </button>
      </div>
      
      {/* Bottom Information Details */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-1.5">
        
        {/* Play counts and Ratings stars */}
        <div className="flex justify-between items-center text-[9px] font-mono text-gray-500">
          <span className="flex items-center gap-1">
            ⭐️ {game.rating > 0 ? game.rating : 'N/A'}
          </span>
          <span>
            👁️ {game.plays.toLocaleString()} plays
          </span>
        </div>

        <h3 className="text-sm font-extrabold text-white tracking-wide group-hover:text-neon-pink transition-colors duration-300 truncate">
          {game.title}
        </h3>
        
        <p className="text-[10px] text-gray-500 truncate leading-relaxed max-h-4 group-hover:text-gray-400">
          {game.description || 'Access terminal files and download static gameplay frame.'}
        </p>

        {/* Quick Play CTA on hover */}
        <div className="h-0 group-hover:h-8 opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-300 mt-1">
          <div className="w-full h-full bg-gradient-to-r from-neon-pink/30 to-neon-blue/30 border border-neon-blue/30 rounded flex items-center justify-center text-[10px] font-bold tracking-widest text-white uppercase group-hover:animate-pulse">
            ⚡ LAUNCH GAME NODE ⚡
          </div>
        </div>
      </div>
    </Link>
  );
}
