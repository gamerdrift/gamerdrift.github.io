import React from 'react';
import NavBar from '../../components/NavBar';
import GameCard from '../../components/GameCard';
import { games } from '../../data/games';

export default function LeaderboardPage() {
  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, user: 'PlayerOne', score: 9800 },
    { rank: 2, user: 'GamerGirl', score: 8700 },
    { rank: 3, user: 'RetroMaster', score: 8300 },
  ];

  return (
    <div className="container flex flex-col items-center py-6">
      <NavBar />
      <h1 className="text-3xl font-bold text-white mb-6 neon">Leaderboard</h1>
      <table className="min-w-full bg-card-bg border border-neon-pink rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-neon-pink">
            <th className="px-4 py-2 text-left text-white">Rank</th>
            <th className="px-4 py-2 text-left text-white">User</th>
            <th className="px-4 py-2 text-left text-white">Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry) => (
            <tr key={entry.rank} className="border-b border-neon-pink/30">
              <td className="px-4 py-2 text-white">{entry.rank}</td>
              <td className="px-4 py-2 text-white">{entry.user}</td>
              <td className="px-4 py-2 text-white">{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
