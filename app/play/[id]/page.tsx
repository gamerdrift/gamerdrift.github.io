import React from 'react';
import { games } from '../../../data/games';
import GameClientRunner from './GameClientRunner';

export async function generateStaticParams() {
  return games.map((game) => ({
    id: game.id,
  }));
}

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const gameId = resolvedParams.id;
  return <GameClientRunner gameId={gameId} />;
}
