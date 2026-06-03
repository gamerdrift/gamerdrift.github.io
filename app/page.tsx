import React from 'react';
import Head from 'next/head';
import GameCard from '../components/GameCard';
import GlassCarousel from '../components/GlassCarousel';
import { games } from '../data/games';

export default function Home() {
  return (
    <>
      <Head>
        <title>GamerDrift – Premium Gaming Hub</title>
        <meta name="description" content="Discover and play premium retro games with glass‑morphic UI and neon accents." />
        <meta property="og:title" content="GamerDrift Gaming Hub" />
        <meta property="og:description" content="Play classic arcade games with a modern, premium design." />
        <meta property="og:image" content="/wood_texture.png" />
        <meta property="og:url" content="https://gamerdrift.com" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="w-full min-h-screen pt-4 pb-12 px-4 md:px-8 bg-cyber-grid flex flex-col items-center">
        <div className="w-full max-w-6xl flex flex-col items-center mt-6">
          {/* Futuristic 3D Glass Carousel Selector */}
          <GlassCarousel />

          <div className="w-full mt-12 border-t border-neon-pink/20 pt-10">
            <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-wider neon">ALL ARCADE TERMINALS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
          <button className="neon-button mt-8">Load More</button>
        </div>
      </div>
    </>
  );
}
