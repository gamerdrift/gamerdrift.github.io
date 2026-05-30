import React, { useEffect, useState } from 'react';
import GameCard from '../components/GameCard';
import HeroSlider from '../components/HeroSlider';

export default function Home() {
  const [games, setGames] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetch(`/api/games?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => setGames(prev => [...prev, ...data.games]));
  }, [page]);

  const loadMore = () => setPage(p => p + 1);

  return (
    <div className="container">
      <HeroSlider />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
      <button className="neon-button mt-8" onClick={loadMore}>Load More</button>
    </div>
  );
}
