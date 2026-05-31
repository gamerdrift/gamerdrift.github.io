"use client";

import React from 'react';

// Simple static slider with placeholder images
export default function HeroSlider() {
  const placeholderGames = [
    { id: '1', title: 'Retro Racer', thumbnail: '/wood_texture.png', url: '#' },
    { id: '2', title: 'Space Invaders', thumbnail: '/wood_texture.png', url: '#' },
    { id: '3', title: 'Pixel Platformer', thumbnail: '/wood_texture.png', url: '#' },
  ];
  return (
    <div className="w-full overflow-hidden rounded-lg mb-8">
      <div className="flex space-x-4 animate-slide">
        {placeholderGames.map((game) => (
          <a
            key={game.id}
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-1/3"
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
