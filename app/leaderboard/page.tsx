"use client";

import React, { useState } from 'react';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState('ALL-TIME');

  // Extended mock leaderboard database with cyberpunk details
  const leaderboardData: Record<string, typeof allTimeUsers> = {
    'ALL-TIME': [
      { rank: 1, name: 'Hex_Netrunner', xp: 98, score: '482,900 pts', node: 'TOKYO_GATE', avatar: 'H' },
      { rank: 2, name: 'NeonSamurai', xp: 82, score: '412,400 pts', node: 'NEO_OSAKA', avatar: 'N' },
      { rank: 3, name: 'Drift_Spectre', xp: 75, score: '389,100 pts', node: 'SEOUL_CORE', avatar: 'D' },
      { rank: 4, name: 'GlitchWeaver', xp: 61, score: '320,500 pts', node: 'BERLIN_SYS', avatar: 'G' },
      { rank: 5, name: 'Vortex_Rider', xp: 54, score: '298,700 pts', node: 'SF_GRID', avatar: 'V' },
      { rank: 6, name: 'Bit_Crusher', xp: 48, score: '254,200 pts', node: 'LON_CENTRAL', avatar: 'B' },
      { rank: 7, name: 'CipherZero', xp: 42, score: '221,900 pts', node: 'MUMBAI_UP', avatar: 'C' }
    ],
    'WEEKLY': [
      { rank: 1, name: 'Drift_Spectre', xp: 75, score: '98,200 pts', node: 'SEOUL_CORE', avatar: 'D' },
      { rank: 2, name: 'Hex_Netrunner', xp: 98, score: '94,500 pts', node: 'TOKYO_GATE', avatar: 'H' },
      { rank: 3, name: 'GlitchWeaver', xp: 61, score: '88,100 pts', node: 'BERLIN_SYS', avatar: 'G' },
      { rank: 4, name: 'ZeroCool', xp: 37, score: '76,300 pts', node: 'NYC_SUB', avatar: 'Z' },
      { rank: 5, name: 'NeonSamurai', xp: 82, score: '72,100 pts', node: 'NEO_OSAKA', avatar: 'N' }
    ]
  };

  const currentLeaderboard = leaderboardData[timeframe] || leaderboardData['ALL-TIME'];

  return (
    <div className="w-full min-h-screen py-12 px-4 md:px-8 bg-cyber-grid flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Page Header */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-widest text-center neon-text">
          RANK REGISTRY
        </h1>
        <p className="text-text-secondary text-sm md:text-base mb-8 text-center font-medium">
          Decentralized global high scores. Syncing node metadata in real-time.
        </p>

        {/* Timeframe selector tabs */}
        <div className="flex bg-[#150a21]/80 p-1.5 rounded-lg border border-neon-pink/20 mb-8 w-64 justify-between">
          {['ALL-TIME', 'WEEKLY'].map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeframe(tab)}
              className={`w-[48%] py-1.5 rounded text-xs font-bold tracking-wider transition-all duration-300 ${
                timeframe === tab
                  ? 'bg-neon-pink/20 text-white border border-neon-pink/40 shadow-[0_0_10px_rgba(255,0,255,0.3)]'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Leaderboard registry listing */}
        <div className="w-full flex flex-col gap-4">
          {currentLeaderboard.map((user, idx) => {
            const isFirst = user.rank === 1;
            const isSecond = user.rank === 2;
            const isThird = user.rank === 3;

            let glowClass = 'border-neon-pink/20 hover:border-neon-pink/50';
            let rankBadge = 'text-text-secondary border-text-secondary/30';
            let rankGlowText = 'text-white';

            if (isFirst) {
              glowClass = 'border-[#ffd700]/40 shadow-[0_0_15px_rgba(255,215,0,0.15)] hover:border-[#ffd700]';
              rankBadge = 'bg-[#ffd700]/20 border-[#ffd700] text-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.4)]';
              rankGlowText = 'text-[#ffd700] font-extrabold';
            } else if (isSecond) {
              glowClass = 'border-neon-blue/40 shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:border-neon-blue';
              rankBadge = 'bg-neon-blue/20 border-neon-blue text-neon-blue shadow-[0_0_8px_rgba(0,240,255,0.4)]';
              rankGlowText = 'text-neon-blue font-bold';
            } else if (isThird) {
              glowClass = 'border-neon-pink/40 shadow-[0_0_15px_rgba(255,0,255,0.15)] hover:border-neon-pink';
              rankBadge = 'bg-neon-pink/20 border-neon-pink text-neon-pink shadow-[0_0_8px_rgba(255,0,255,0.4)]';
              rankGlowText = 'text-neon-pink font-bold';
            }

            return (
              <div
                key={user.name}
                className={`cyber-card flex flex-col md:flex-row items-center justify-between p-4 md:p-5 border gap-4 transition-all duration-300 ${glowClass}`}
              >
                {/* User Info Group */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono border text-lg font-bold flex-shrink-0 ${rankBadge}`}>
                    #{user.rank}
                  </div>

                  {/* Profile Avatar / Logo */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-neon-pink/30 to-neon-blue/30 border border-white/10 flex items-center justify-center font-bold text-white tracking-wider flex-shrink-0">
                    {user.avatar}
                  </div>

                  {/* Profile Username & Sub-Node */}
                  <div className="flex flex-col">
                    <span className={`text-base font-bold tracking-wide ${rankGlowText}`}>
                      {user.name}
                    </span>
                    <span className="text-[10px] text-text-secondary font-mono tracking-wider">
                      UPLINK: {user.node}
                    </span>
                  </div>
                </div>

                {/* Level / XP Progress visualizer */}
                <div className="flex flex-col w-full md:w-56 gap-1">
                  <div className="flex justify-between text-[11px] font-mono text-text-secondary">
                    <span>NEURAL SYNC_LVL: {Math.floor(user.xp / 10) + 1}</span>
                    <span>{user.xp % 10 * 10}%</span>
                  </div>
                  <div className="w-full bg-[#150a21] h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-neon-pink to-neon-blue h-full rounded-full"
                      style={{ width: `${(user.xp % 10) * 10 || 10}%` }}
                    />
                  </div>
                </div>

                {/* High Score Panel */}
                <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                  <span className="text-xs text-text-secondary font-mono uppercase tracking-widest mb-0.5">SCORE_REFS</span>
                  <span className="text-xl font-extrabold text-white font-mono tracking-wider text-shadow">
                    {user.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const allTimeUsers = [
  { rank: 1, name: 'Hex_Netrunner', xp: 98, score: '482,900 pts', node: 'TOKYO_GATE', avatar: 'H' }
];
