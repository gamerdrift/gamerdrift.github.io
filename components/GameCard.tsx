"use client";

import React from 'react';

interface Game {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

export default function GameCard({ game }: { game: Game }) {
  return (
    <div className="cyber-card neon bg-gray-900 bg-opacity-50 backdrop-blur-lg rounded-lg p-4 flex flex-col items-center hover:scale-105 transform transition duration-300">
      <img src={game.thumbnail} alt={game.title} className="w-full h-48 object-cover rounded" />
      <h3 className="mt-2 text-lg font-semibold text-white text-center">{game.title}</h3>
      <a
        href={game.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 neon-button px-4 py-2 bg-neon bg-opacity-20 rounded"
      >
        Play
      </a>
    </div>
  );
}
