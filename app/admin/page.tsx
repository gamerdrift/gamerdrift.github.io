"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '../../lib/state/UserContext';
import { useGames } from '../../lib/state/GameContext';

export default function AdminPage() {
  const { user, login } = useUser();
  const { games, approveSubmission, rejectSubmission, incrementPlayCount } = useGames();

  // Metrics simulation state
  const [ctrMultiplier, setCtrMultiplier] = useState(2.4);
  const [simPlayCount, setSimPlayCount] = useState(0);

  // Check admin role
  const isAdmin = user && user.role === 'Admin';

  if (!isAdmin) {
    return (
      <div className="w-full min-h-[80vh] py-16 px-4 md:px-8 bg-cyber-grid flex flex-col items-center justify-center">
        <div className="w-full max-w-lg bg-[#130722]/80 border border-neon-pink/40 rounded-2xl p-8 text-center backdrop-blur-lg shadow-[0_0_30px_rgba(255,0,255,0.15)] relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-neon-pink bg-black flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,0,255,0.4)]">
            🔒
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-widest mt-6 mb-2 uppercase neon-text">
            SYSOP LOGING REQUIRED
          </h2>
          <p className="text-xs font-mono text-[#ff00ff] tracking-widest mb-6">
            ROOT LEVEL SECURITY VIOLATION
          </p>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            Access to the platform administration console requires secure root Sysop authority credentials.
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => login('AdminDrifter')}
              className="w-full py-3 rounded-lg font-bold text-xs text-center text-black bg-neon-pink hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)] transition-all duration-300 tracking-widest font-mono"
            >
              ⚡ QUICK LOGIN: ADMINDRIFTER (ROOT SYSOP)
            </button>
            <Link href="/auth/" className="w-full py-3 rounded-lg border border-white/20 font-bold text-xs text-center text-white bg-black/40 hover:bg-black/60 hover:border-white/40 transition-all duration-300 tracking-widest font-mono">
              MANUAL AUTH UPLINK
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter pending moderations
  const pendingSubmissions = games.filter(g => !g.approved);
  const liveGames = games.filter(g => g.approved);

  // Compute total plays, averages
  const totalPlays = games.reduce((acc, g) => acc + g.plays, 0) + simPlayCount;
  const mockImpressions = totalPlays * 3.2; // 3.2 ads per session avg
  const mockCTR = (mockImpressions * (ctrMultiplier / 100)).toFixed(0);
  const mockRevenue = (totalPlays * 0.0085 * (ctrMultiplier / 2)).toFixed(2); // mock eCPM $8.50

  const handleSimulatePlay = () => {
    // Increment a random game's plays
    const randomIndex = Math.floor(Math.random() * liveGames.length);
    const selectedGame = liveGames[randomIndex];
    incrementPlayCount(selectedGame.id);
    setSimPlayCount(prev => prev + 100); // Simulate network load
  };

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-cyber-grid flex flex-col items-center">
      <div className="w-full max-w-6xl">
        
        {/* Header HUD */}
        <div className="mb-8">
          <span className="text-[10px] font-mono text-neon-pink tracking-[0.35em] uppercase font-bold mb-1 block">
            ROOT // SECURE SYSOP PANEL
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wider uppercase">
            ADMINISTRATOR DECKS
          </h1>
          <p className="text-text-secondary text-xs font-mono mt-1">
            MONITORING PLATFORM METRICS, MODERATING INGESTS, AND SIMULATING TRAFFIC SYSTEMS
          </p>
        </div>

        {/* 4 columns stats panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          
          {/* Stat 1: Total plays */}
          <div className="bg-[#130722]/60 border border-neon-blue/20 rounded-xl p-4 md:p-5 backdrop-blur-md relative overflow-hidden">
            <span className="text-[9px] font-mono text-neon-blue tracking-wider block font-bold">TOTAL PLAY LOGS</span>
            <span className="text-xl md:text-2xl font-black text-white block mt-1 tracking-wide">
              {totalPlays.toLocaleString()}
            </span>
            <span className="text-[8px] font-mono text-gray-500 block mt-2">
              UPLINK TICKS ACTIVE
            </span>
            <div className="absolute top-2 right-3 text-neon-blue opacity-25 text-xl">🕹️</div>
          </div>

          {/* Stat 2: Ad Impressions */}
          <div className="bg-[#130722]/60 border border-neon-blue/20 rounded-xl p-4 md:p-5 backdrop-blur-md relative overflow-hidden">
            <span className="text-[9px] font-mono text-neon-blue tracking-wider block font-bold">AD IMPRESSIONS</span>
            <span className="text-xl md:text-2xl font-black text-white block mt-1 tracking-wide">
              {Math.floor(mockImpressions).toLocaleString()}
            </span>
            <span className="text-[8px] font-mono text-gray-500 block mt-2 font-semibold">
              3.2 IMP / SESSION AVG
            </span>
            <div className="absolute top-2 right-3 text-neon-blue opacity-25 text-xl">📺</div>
          </div>

          {/* Stat 3: CTR Clicks */}
          <div className="bg-[#130722]/60 border border-neon-blue/20 rounded-xl p-4 md:p-5 backdrop-blur-md relative overflow-hidden">
            <span className="text-[9px] font-mono text-neon-pink tracking-wider block font-bold">SIMULATED CLICKS</span>
            <span className="text-xl md:text-2xl font-black text-white block mt-1 tracking-wide">
              {Number(mockCTR).toLocaleString()}
            </span>
            <span className="text-[8px] font-mono text-neon-pink block mt-2 font-semibold">
              CTR RATIO: {ctrMultiplier}%
            </span>
            <div className="absolute top-2 right-3 text-neon-pink opacity-25 text-xl">🖱️</div>
          </div>

          {/* Stat 4: Estimated eCPM Earnings */}
          <div className="bg-[#130722]/60 border border-[#ff00ff]/20 rounded-xl p-4 md:p-5 backdrop-blur-md relative overflow-hidden">
            <span className="text-[9px] font-mono text-neon-pink tracking-wider block font-bold">REVENUE EST ($)</span>
            <span className="text-xl md:text-2xl font-black text-white block mt-1 tracking-wide">
              ${mockRevenue}
            </span>
            <span className="text-[8px] font-mono text-gray-500 block mt-2 font-semibold">
              MOCK eCPM INDEX: $8.50
            </span>
            <div className="absolute top-2 right-3 text-neon-pink opacity-25 text-xl">💰</div>
          </div>

        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Moderation and Editor */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Moderation Queue */}
            <div className="bg-[#130722]/50 border border-neon-blue/20 rounded-xl p-5 md:p-6 backdrop-blur-md">
              <h3 className="text-sm font-black text-white font-mono tracking-wider uppercase mb-5 pb-2 border-b border-white/5 flex items-center gap-2">
                <span className="text-neon-pink animate-pulse">●</span> MODERATION QUEUE
              </h3>

              {pendingSubmissions.length > 0 ? (
                <div className="flex flex-col gap-4 font-mono text-xs">
                  {pendingSubmissions.map(game => (
                    <div key={game.id} className="bg-black/50 border border-white/5 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-neon-blue/30 transition-all duration-300">
                      <div className="flex gap-4">
                        <div className="w-12 h-14 bg-gray-900 border border-white/10 rounded overflow-hidden flex-shrink-0">
                          <img src={game.thumbnail} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-white uppercase">{game.title}</span>
                          <span className="text-[9px] text-neon-blue uppercase mt-0.5">CAT: {game.category} // BY: {game.submittedBy}</span>
                          <p className="text-[10px] text-text-secondary mt-1 max-w-md line-clamp-1">{game.description}</p>
                          <span className="text-[8px] text-gray-600 mt-1">EMBED: {game.embedUrl}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 w-full md:w-auto justify-end">
                        <button 
                          onClick={() => approveSubmission(game.id)}
                          className="px-3.5 py-1.5 rounded bg-neon-blue/20 border border-neon-blue text-white font-bold text-[10px] hover:bg-neon-blue hover:text-black transition-all"
                        >
                          APPROVE
                        </button>
                        <button 
                          onClick={() => rejectSubmission(game.id)}
                          className="px-3.5 py-1.5 rounded bg-red-500/20 border border-red-500 text-white font-bold text-[10px] hover:bg-red-500 hover:text-white transition-all"
                        >
                          REJECT
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg">
                  <div className="text-xl mb-1">👌</div>
                  <p className="text-xs font-mono text-text-secondary">Modqueue clear. No pending developer submissions.</p>
                </div>
              )}
            </div>

            {/* Terminals Manager */}
            <div className="bg-[#130722]/50 border border-neon-blue/20 rounded-xl p-5 md:p-6 backdrop-blur-md">
              <div className="flex justify-between items-center mb-5 pb-2 border-b border-white/5">
                <h3 className="text-sm font-black text-white font-mono tracking-wider uppercase flex items-center gap-2">
                  <span className="text-neon-blue">■</span> GAME TERMINALS REGISTRY
                </h3>
                <span className="text-[9px] font-mono text-gray-500">{liveGames.length} ONLINE TILES</span>
              </div>

              <div className="max-h-[350px] overflow-y-auto pr-1 scrollbar-none">
                <table className="w-full text-left font-mono text-[10px] text-white">
                  <thead>
                    <tr className="text-neon-blue border-b border-white/5 font-bold uppercase tracking-wider">
                      <th className="pb-3">TITLE</th>
                      <th className="pb-3">CATEGORY</th>
                      <th className="pb-3 text-right">PLAYS</th>
                      <th className="pb-3 text-right">RATING</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {liveGames.map(game => (
                      <tr key={game.id} className="hover:bg-white/5 transition-all">
                        <td className="py-2.5 font-bold uppercase truncate max-w-[150px]">{game.title}</td>
                        <td className="py-2.5 text-neon-pink font-bold">{game.category.toUpperCase()}</td>
                        <td className="py-2.5 text-right">{game.plays.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-yellow-500 font-bold">⭐️ {game.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: Sim Control Deck & Ad Deck */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            
            {/* Sim Control Deck */}
            <div className="bg-[#130722]/50 border border-neon-blue/20 rounded-xl p-5 md:p-6 backdrop-blur-md">
              <h3 className="text-sm font-black text-white font-mono tracking-wider uppercase mb-5 pb-2 border-b border-white/5 flex items-center gap-2">
                <span className="text-neon-blue">■</span> TRAFFIC SIMULATOR
              </h3>
              
              <p className="text-xs text-text-secondary leading-relaxed mb-6 font-mono">
                Trigger mock network packets to increment play counts on random live cabinets and check revenue scaling live.
              </p>

              <button
                onClick={handleSimulatePlay}
                className="w-full py-3 rounded-lg font-bold text-xs text-center text-white bg-gradient-to-r from-neon-blue to-neon-purple hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300 tracking-widest font-mono"
              >
                ⚡ SPARK PLAY LOOPS (+100 PLAYS)
              </button>
            </div>

            {/* Ad Controller Settings */}
            <div className="bg-[#130722]/50 border border-[#ff00ff]/20 rounded-xl p-5 md:p-6 backdrop-blur-md">
              <h3 className="text-sm font-black text-white font-mono tracking-wider uppercase mb-5 pb-2 border-b border-white/5 flex items-center gap-2">
                <span className="text-neon-pink">■</span> AD MANAGER COMPILER
              </h3>

              <div className="flex flex-col gap-5 font-mono text-xs">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-neon-pink">AD CLICK-THROUGH RATE (CTR)</span>
                    <span className="text-white">{ctrMultiplier}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.1"
                    value={ctrMultiplier}
                    onChange={(e) => setCtrMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-neon-pink bg-black/60 rounded-full h-1.5 cursor-pointer"
                  />
                  <span className="text-[9px] text-gray-500 mt-1">Adjusts simulated CTR to calculate mock earnings.</span>
                </div>

                <div className="border-t border-white/5 pt-4 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500">MOCK DENSITY INDEX:</span>
                    <span className="text-neon-blue font-bold">OPTIMIZED (MID)</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500">REWARDED-VIDEO PROMPTS:</span>
                    <span className="text-neon-blue font-semibold">[ENABLED]</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500">BANNER CHANNELS LOGS:</span>
                    <span className="text-neon-blue font-semibold">[STANDBY_ONLINE]</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
