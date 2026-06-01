import React from 'react';
import GameCard from '../../components/GameCard';
import { games } from '../../data/games';

export default function GamesPage() {
  return (
    <div className="container flex flex-col items-center py-6">
      <h1 className="text-3xl font-bold text-white mb-6 neon">All Games</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
