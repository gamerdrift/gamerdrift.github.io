"use client";

import React from 'react';
import Link from 'next/link';
import { useUser } from '../../lib/state/UserContext';
import { useGames } from '../../lib/state/GameContext';
import InteractiveGameCard from '../../components/InteractiveGameCard';

export default function ProfilePage() {
  const { user } = useUser();
  const { games, favorites, history } = useGames();

  // If user is not logged in, prompt to authenticate
  if (!user) {
    return (
      <div className="w-full min-h-[80vh] py-16 px-4 md:px-8 bg-cyber-grid flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-[#130722]/80 border border-neon-pink/40 rounded-2xl p-8 text-center backdrop-blur-lg shadow-[0_0_30px_rgba(255,0,255,0.15)] relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-neon-pink bg-black flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,0,255,0.4)] animate-pulse">
            🔒
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-widest mt-6 mb-2 uppercase neon-text">
            ACCESS DENIED
          </h2>
          <p className="text-xs font-mono text-[#ff00ff] tracking-widest mb-6">
            UPLINK SECURE PROTOCOL INITIATED
          </p>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            This sector of the GamerDrift gaming deck requires an authorized drifter profile. Please log in or establish a new node connection.
          </p>
          <Link href="/auth/" className="w-full py-3 rounded-lg font-bold text-sm text-center block text-white bg-gradient-to-r from-neon-pink to-neon-blue hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all duration-300">
            CONNECT IDENTITY
          </Link>
        </div>
      </div>
    );
  }

  // Filter games for favorites and history shelves
  const favoriteGames = games.filter(g => favorites.includes(g.id) && g.approved);
  const historyGames = games.filter(g => history.includes(g.id) && g.approved).slice(0, 4);

  // Compute XP progress percentage
  const xpPercentage = Math.min(100, Math.floor((user.xp / user.xpToNextLevel) * 100));

  // Determine Rank based on Level
  let rankTitle = 'Space Cadet';
  if (user.level >= 5) rankTitle = 'Elite Cyber Hacker';
  if (user.level >= 10) rankTitle = 'Grid Master';
  if (user.role === 'Admin') rankTitle = 'Systems Architect';

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-cyber-grid flex flex-col items-center">
      <div className="w-full max-w-6xl">
        
        {/* Profile overview banner */}
        <div className="w-full bg-[#130722]/70 border border-neon-blue/20 rounded-2xl p-6 md:p-8 mb-10 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-pink/5 rounded-full blur-[100px] pointer-events-none"></div>

          {/* User info */}
          <div className="flex flex-col md:flex-row items-center gap-6 z-10 w-full md:w-auto">
            <div className="w-20 h-20 rounded-2xl border-2 border-neon-blue bg-black/60 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(0,240,255,0.25)] flex-shrink-0">
              👾
            </div>
            <div className="flex flex-col text-center md:text-left">
              <span className="text-[10px] font-mono text-neon-blue tracking-[0.25em] uppercase font-bold mb-1">
                {user.role} TERMINAL // LVL {user.level}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide uppercase mb-1">
                {user.username}
              </h1>
              <span className="text-[11px] font-mono text-text-secondary">
                RANK: <span className="text-neon-pink font-bold">{rankTitle.toUpperCase()}</span> // EST: {new Date(user.registeredAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full md:w-80 flex flex-col z-10 font-mono text-xs">
            <div className="flex justify-between mb-1.5 font-bold">
              <span className="text-neon-blue">XP LEVEL PROGRESS</span>
              <span className="text-white">{user.xp} / {user.xpToNextLevel} XP</span>
            </div>
            <div className="w-full h-3 bg-black/60 rounded-full border border-white/5 overflow-hidden p-0.5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-pink shadow-[0_0_8px_rgba(255,0,255,0.5)] transition-all duration-500" 
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-gray-500 mt-1.5 text-right font-semibold">
              {100 - xpPercentage}% XP UNTIL LEVEL UP SYSTEM CYCLE
            </span>
          </div>
        </div>

        {/* Dashboard Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left Column: Badges & Achievements */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            
            {/* Badges Container */}
            <div className="bg-[#130722]/50 border border-neon-blue/20 rounded-xl p-5 md:p-6 backdrop-blur-md">
              <h3 className="text-sm font-black text-white font-mono tracking-wider uppercase mb-4 pb-2 border-b border-white/5 flex items-center gap-2">
                <span className="text-neon-blue">■</span> EARNED BADGES
              </h3>
              
              {user.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {user.badges.map((badge, idx) => (
                    <span 
                      key={idx} 
                      className="text-[9px] font-bold font-mono tracking-widest text-[#00f0ff] border border-[#00f0ff]/40 bg-black/60 px-2.5 py-1.5 rounded-lg shadow-[inset_0_0_8px_rgba(0,240,255,0.1)] hover:border-[#ff00ff] hover:text-[#ff00ff] hover:shadow-[0_0_12px_rgba(255,0,255,0.2)] transition-all duration-300"
                    >
                      🛡️ {badge.toUpperCase()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-mono text-text-secondary">No cryptographic badges unlocked yet.</p>
              )}
            </div>

            {/* Achievements Container */}
            <div className="bg-[#130722]/50 border border-neon-blue/20 rounded-xl p-5 md:p-6 backdrop-blur-md">
              <h3 className="text-sm font-black text-white font-mono tracking-wider uppercase mb-4 pb-2 border-b border-white/5 flex items-center gap-2">
                <span className="text-neon-pink">■</span> UNLOCKED ACHIEVEMENTS
              </h3>
              
              {user.achievements.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {user.achievements.map((ach, idx) => (
                    <div key={idx} className="bg-black/40 border border-white/5 rounded-lg p-3 flex justify-between items-center hover:border-neon-pink/30 transition-all duration-300">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase">{ach.title}</span>
                        <span className="text-[10px] text-text-secondary leading-relaxed mt-0.5">{ach.description}</span>
                        <span className="text-[8px] font-mono text-gray-600 mt-1">LOGGED: {ach.unlockedAt}</span>
                      </div>
                      <div className="text-[10px] font-mono font-bold text-neon-blue border border-neon-blue/30 bg-neon-blue/5 px-2 py-1 rounded">
                        +{ach.xpReward} XP
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-mono text-text-secondary">Explore arcade units to log accomplishments.</p>
              )}
            </div>

          </div>

          {/* Right Columns: Play Logs & Favorites */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* History Shelf */}
            <div className="bg-[#130722]/50 border border-neon-blue/20 rounded-xl p-5 md:p-6 backdrop-blur-md">
              <h3 className="text-sm font-black text-white font-mono tracking-wider uppercase mb-5 pb-2 border-b border-white/5 flex items-center gap-2">
                <span className="text-neon-blue">■</span> RECENT DEPLOYMENTS
              </h3>
              
              {historyGames.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {historyGames.map((game) => (
                    <InteractiveGameCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs font-mono text-text-secondary mb-3">No activity logs recorded in this session block.</p>
                  <Link href="/games/" className="inline-block text-[10px] font-bold font-mono tracking-widest border border-neon-blue text-neon-blue hover:bg-neon-blue/20 hover:text-white px-4 py-2 rounded transition-all duration-300">
                    ACQUIRE GAME NODES
                  </Link>
                </div>
              )}
            </div>

            {/* Favorites Grid */}
            <div className="bg-[#130722]/50 border border-neon-blue/20 rounded-xl p-5 md:p-6 backdrop-blur-md">
              <h3 className="text-sm font-black text-white font-mono tracking-wider uppercase mb-5 pb-2 border-b border-white/5 flex items-center gap-2">
                <span className="text-neon-pink">■</span> FAVORITE CABINETS
              </h3>
              
              {favoriteGames.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {favoriteGames.map((game) => (
                    <InteractiveGameCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs font-mono text-text-secondary mb-3">Your favorited grid nodes will compile here.</p>
                  <Link href="/games/" className="inline-block text-[10px] font-bold font-mono tracking-widest border border-neon-pink text-neon-pink hover:bg-neon-pink/20 hover:text-white px-4 py-2 rounded transition-all duration-300">
                    DISCOVER CABINETS
                  </Link>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
