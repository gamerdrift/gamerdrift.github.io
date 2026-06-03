"use client";

import React from 'react';
import Link from 'next/link';

interface Game {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link 
      href={game.url}
      className="group relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-neon-blue/20 bg-card-bg hover:border-neon-pink hover:shadow-[0_0_20px_rgba(255,0,255,0.4)] transition-all duration-300 block cursor-pointer hover:scale-105 transform"
    >
      {/* Background Poster Image */}
      <img 
        src={game.thumbnail} 
        alt={game.title} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95 transition-colors duration-300"></div>
      
      {/* Glassmorphic Title Plate at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-[2px]">
        <h3 className="text-sm md:text-base font-bold text-white tracking-wide group-hover:text-neon-pink transition-colors duration-300 truncate text-center">
          {game.title}
        </h3>
      </div>
    </Link>
  );
}
