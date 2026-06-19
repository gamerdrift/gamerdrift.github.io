import React, { Suspense } from 'react';
import { games } from '../../../data/games';
import GameClientRunner from './GameClientRunner';

export async function generateStaticParams() {
  return games.map((game) => ({
    id: game.id,
  }));
}

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-xs text-[#00f0ff]">
        <div className="animate-pulse tracking-[0.2em] uppercase">UPLINK_ESTABLISHED // CACHE_INIT...</div>
      </div>
    }>
      <GameClientRunner gameId={id} />
    </Suspense>
  );
}
