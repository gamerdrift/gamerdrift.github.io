"use client";

import React from 'react';
import { games } from '../data/games';

// Simple static slider with placeholder images
export default function HeroSlider() {
  const sliderGames = games.slice(0, 3);
  return (
    <div className="w-full overflow-hidden rounded-lg mb-8">
      <div className="flex space-x-4 animate-slide">
        {sliderGames.map((game) => (
          <a
            key={game.id}
            href={game.url}
            className="flex-shrink-0 w-1/3 animate-glow hover:scale-102 transform transition duration-300"
          >
            <img
              src={game.thumbnail}
              alt={game.title}
              className="w-full h-48 object-cover rounded-lg neon"
            />
            <h4 className="mt-2 text-center text-white neon">{game.title}</h4>
          </a>
        ))}
      </div>
    </div>
  );
}
