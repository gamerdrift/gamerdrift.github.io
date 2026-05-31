import React from 'react';
import Head from 'next/head';
import GameCard from '../components/GameCard';
import HeroSlider from '../components/HeroSlider';
import AuthButton from '../components/AuthButton';

// Static placeholder data; replace with real data if needed
const games: any[] = [];

export default function Home() {
  return (
    <>
      <Head>
        <title>GamerDrift – Premium Gaming Hub</title>
        <meta name="description" content="Discover and play premium retro games with glass‑morphic UI and neon accents." />
        <meta property="og:title" content="GamerDrift Gaming Hub" />
        <meta property="og:description" content="Play classic arcade games with a modern, premium design." />
        <meta property="og:image" content="/wood_texture.png" />
        <meta property="og:url" content="https://gamerdrift.github.io" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="container flex flex-col items-center">
        <div className="flex justify-end w-full mb-4">
          <AuthButton />
        </div>
        <HeroSlider />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        <button className="neon-button mt-8">Load More</button>
      </div>
    </>
  );
}
