"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '../../lib/state/UserContext';
import { useCasino } from '../../lib/state/CasinoContext';

const CASINO_GAMES = [
  {
    id: 'slots',
    name: 'GHOST SLOTS',
    subtitle: 'Cyberpunk Multi-Line Reels',
    description: 'Spin the neon grid! Align holographic cyber-skulls, data chips, and power cores for maximum multipliers. Enforces house safety protocols.',
    category: 'slots',
    risk: 'HIGH',
    rtp: '96.2%',
    maxWin: '500x',
    poster: '/ghost_slots_poster.png',
    themeColor: '#00f0ff',
    borderGlow: 'shadow-[0_0_20px_rgba(0,240,255,0.25)]',
    classification: 'CLASS: MULTI-LINE REELS',
    path: '/ghostdaddy-casino/slots'
  },
  {
    id: 'blackjack',
    name: 'NEON BLACKJACK',
    subtitle: 'Holographic Tactical Cards',
    description: 'Engage the dealer head-on. Hit, stand, or double down on a virtual grid array to hit 21. Real-time probability balancing active.',
    category: 'cards',
    risk: 'MEDIUM',
    rtp: '99.1%',
    maxWin: '2.5x',
    poster: '/neon_blackjack_poster.png',
    themeColor: '#39ff14',
    borderGlow: 'shadow-[0_0_20px_rgba(57,255,20,0.25)]',
    classification: 'CLASS: CARD OPERATIONS',
    path: '/ghostdaddy-casino/blackjack'
  },
  {
    id: 'roulette',
    name: 'CYBER ROULETTE',
    subtitle: 'Quantum Wheel Terminal',
    description: 'Bet on single numbers, red/black sectors, or grids. Spin the neon ring inside the control room matrix and collect payouts.',
    category: 'wheels',
    risk: 'MEDIUM',
    rtp: '97.3%',
    maxWin: '36x',
    poster: '/cyber_roulette_poster.png',
    themeColor: '#ff9f00',
    borderGlow: 'shadow-[0_0_20px_rgba(255,159,0,0.25)]',
    classification: 'CLASS: WHEEL SECTORS',
    path: '/ghostdaddy-casino/roulette'
  },
  {
    id: 'plinko',
    name: 'PLINKO MATRIX',
    subtitle: 'Gravity Physics Dropper',
    description: 'Drop digital chips from the top peg node array. Watch them bounce dynamically and land in high-value multiplier slots.',
    category: 'multipliers',
    risk: 'VERY HIGH',
    rtp: '98.5%',
    maxWin: '1000x',
    poster: '/cyber_plinko_poster.png',
    themeColor: '#ff0055',
    borderGlow: 'shadow-[0_0_20px_rgba(255,0,85,0.25)]',
    classification: 'CLASS: PHYSICS MULTIPLIER',
    path: '/ghostdaddy-casino/plinko'
  }
];

export default function CasinoHome() {
  const { user, claimDailyBonus } = useUser();
  const { totalBets, totalPayouts, houseMargin, leaderboard } = useCasino();
  const [activeCategory, setActiveCategory] = useState<'all' | 'slots' | 'cards' | 'wheels' | 'multipliers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState(CASINO_GAMES[0]);
  
  // Loading Deployment State
  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);

  const handleDeploy = (game: typeof CASINO_GAMES[0]) => {
    setDeploying(true);
    setDeployProgress(0);
    const interval = setInterval(() => {
      setDeployProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            window.location.href = game.path;
          }, 300);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 10;
      });
    }, 100);
  };

  const filteredGames = CASINO_GAMES.filter(g => {
    const matchesCategory = activeCategory === 'all' || g.category === activeCategory;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-[#05070a] relative font-mono text-xs text-slate-300 overflow-x-hidden">
      {/* Background scanlines and grid */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none" />
      <div className="scanlines" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10 space-y-10">

        {/* ── LIVE TELEMETRY DECK ── */}
        <div className="w-full bg-[#0c0f16]/90 border border-[#00f0ff]/20 px-4 py-3 flex flex-wrap justify-between items-center text-[10px] shadow-[inset_0_0_8px_rgba(0,240,255,0.05)] gap-4">
          <span className="text-[#00f0ff] font-bold tracking-wider animate-pulse flex items-center gap-2">
            📡 GHOSTDADDY_CASINO: ONLINE // COIN_POOL: SECURE
          </span>
          <div className="flex gap-6 flex-wrap text-slate-400">
            <span>CUMULATIVE BETS: <span className="text-white font-bold">{totalBets.toLocaleString()} COINS</span></span>
            <span>TOTAL PAYOUTS: <span className="text-[#39ff14] font-bold">{totalPayouts.toLocaleString()} COINS</span></span>
            <span>HOUSE MARGIN: <span className="text-[#ff9f00] font-bold">{(houseMargin * 100).toFixed(2)}%</span></span>
            <span>STATUS: <span className="text-[#39ff14] font-bold">STABLE (60% REVENUE HELD)</span></span>
          </div>
        </div>

        {/* ── BANNER SECTION ── */}
        <div className="hud-panel p-8 bg-gradient-to-br from-[#0c0f16] to-[#05070a] flex flex-col md:flex-row gap-8 relative overflow-hidden border border-slate-900">
          <div className="absolute right-0 top-0 text-slate-800/10 text-[8rem] font-bold -mr-4 -mt-4 pointer-events-none select-none">CASINO</div>
          
          <div className="flex-1 flex flex-col justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#ff9f00]/10 border border-[#ff9f00]/40 text-[#ff9f00] font-extrabold px-2 py-0.5 text-[9px] uppercase">
                  ⚡ HOUSE ADVANTAGE ENGINE v1.2
                </span>
                <span className="text-slate-500 uppercase text-[9px] font-bold">Clearance: Level 3</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-widest font-sans uppercase leading-none mb-3">
                GHOSTDADDY_<span className="text-[#00f0ff]">CASINO</span>
              </h1>
              <p className="text-slate-400 text-xs leading-relaxed uppercase max-w-xl">
                Welcome to the high-stakes cybernetic grid. Place bets using virtual Drift Coins. Play Slots, Blackjack, Roulette, or Plinko. All payouts are automatically balanced in real-time.
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              {user ? (
                <>
                  <button
                    onClick={claimDailyBonus}
                    className="px-6 py-3 bg-[#ff9f00] text-black font-sans font-bold uppercase tracking-widest text-[10px] hover:bg-[#ff9f00]/80 shadow-[0_0_15px_rgba(255,159,0,0.2)] transition-all"
                  >
                    🪙 CLAIM DAILY 100 COINS
                  </button>
                  <Link
                    href="/profile"
                    className="px-6 py-3 bg-transparent border border-slate-700 text-slate-400 font-sans font-bold uppercase tracking-widest text-[10px] hover:border-white hover:text-white transition-all"
                  >
                    MY COMMAND DECK
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="px-6 py-3 bg-[#00f0ff] text-black font-sans font-bold uppercase tracking-widest text-[10px] hover:bg-[#00f0ff]/80 shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all"
                >
                  ▶ CONNECT AGENT PROFILE
                </Link>
              )}
            </div>
          </div>

          <div className="md:w-72 flex-shrink-0 flex items-center justify-center relative z-10">
            <img
              src="/ghostdaddy_casino_banner.png"
              alt="GhostDaddy Casino Mascot"
              className="w-48 md:w-full h-auto object-contain filter drop-shadow-[0_0_20px_rgba(0,240,255,0.25)] rounded-lg border border-[#00f0ff]/20"
            />
          </div>
        </div>

        {/* ── MAIN CASINO INTERFACE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: CATEGORIES & CARDS LIST */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Category selection */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold mb-1">// CATEGORY FILTER</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'ALL FILES', icon: '📁' },
                  { id: 'slots', label: 'SLOTS', icon: '🎰' },
                  { id: 'cards', label: 'CARD GAMES', icon: '🃏' },
                  { id: 'wheels', label: 'WHEELS', icon: '🎡' },
                  { id: 'multipliers', label: 'MULTIPLIERS', icon: '🚀' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`py-2 px-3 border text-[10px] font-bold text-left flex items-center gap-2 rounded transition-all ${
                      activeCategory === cat.id
                        ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                        : 'border-slate-800 bg-[#090b11]/80 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">// SEARCH ARCHIVE</span>
              <input
                type="text"
                placeholder="ENTER TERMINAL GAME ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-slate-800 px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff] transition-all"
              />
            </div>

            {/* Game Selection Cards list in Rogue Ghost style */}
            <div className="space-y-3 pt-2">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold block border-b border-slate-900 pb-1.5">// MODULE DIRECTORY</span>
              
              {filteredGames.map(game => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  className={`w-full text-left relative overflow-hidden rounded-lg border-2 transition-all duration-300 group flex flex-col ${
                    selectedGame.id === game.id ? 'scale-[1.01]' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: selectedGame.id === game.id ? game.themeColor : '#1e293b',
                    boxShadow: selectedGame.id === game.id ? `0 0 15px ${game.themeColor}20` : 'none'
                  }}
                >
                  <div className="relative h-24 overflow-hidden w-full">
                    <img
                      src={game.poster}
                      alt={game.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: 'brightness(0.7) saturate(1.1)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f16] to-transparent" />
                    
                    {/* Glowing active indicator */}
                    <div className="absolute top-2 right-2">
                      <span
                        className="text-[7px] font-black uppercase tracking-wider px-2 py-0.5 border"
                        style={{
                          backgroundColor: `${game.themeColor}15`,
                          borderColor: game.themeColor,
                          color: game.themeColor
                        }}
                      >
                        ● DEPLOYABLE
                      </span>
                    </div>

                    <div className="absolute top-2 left-2 text-[7px] text-slate-500 font-bold uppercase">{game.classification}</div>
                  </div>

                  <div className="px-3 py-2 bg-[#0c0f16] w-full flex justify-between items-center border-t border-slate-900">
                    <div>
                      <div className="font-black text-xs tracking-wider uppercase" style={{ color: selectedGame.id === game.id ? game.themeColor : '#94a3b8' }}>
                        {game.name}
                      </div>
                      <div className="text-[8px] text-slate-600 uppercase">{game.subtitle}</div>
                    </div>
                    <div className="text-right text-[8px]">
                      <div className="text-slate-500">RISK</div>
                      <div className="font-bold" style={{ color: game.risk === 'VERY HIGH' || game.risk === 'HIGH' ? '#ff0055' : '#ff9f00' }}>
                        {game.risk}
                      </div>
                    </div>
                  </div>

                  {selectedGame.id === game.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: game.themeColor, boxShadow: `0 0 8px ${game.themeColor}` }} />
                  )}
                </button>
              ))}

              {filteredGames.length === 0 && (
                <div className="text-slate-600 text-center py-6 border border-dashed border-slate-900 uppercase">
                  No matching gaming nodes detected.
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: DETAILED SELECTED GAME PANEL */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Cinematic game display panel */}
            <div
              className={`relative w-full rounded-xl overflow-hidden border-2 ${selectedGame.borderGlow}`}
              style={{ borderColor: selectedGame.themeColor, aspectRatio: '16/7' }}
            >
              <img
                src={selectedGame.poster}
                alt={selectedGame.name}
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.7) contrast(1.1) saturate(1.2)' }}
              />

              {/* Cover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-black/60" />
              
              {/* Classification metadata */}
              <div className="absolute top-4 left-5">
                <div className="text-[8px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: selectedGame.themeColor }}>
                  ◈ {selectedGame.classification}
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">TELEMETRY UPLINK STATUS: READY</div>
              </div>

              {/* Status details */}
              <div className="absolute top-4 right-5">
                <span
                  className="text-[8px] font-black tracking-widest uppercase px-3 py-1.5 border inline-block"
                  style={{
                    borderColor: selectedGame.themeColor,
                    color: selectedGame.themeColor,
                    backgroundColor: `${selectedGame.themeColor}10`
                  }}
                >
                  SYSTEMS ONLINE
                </span>
              </div>

              {/* Bottom detail row */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{selectedGame.subtitle}</div>
                    <h2
                      className="text-3xl md:text-4xl font-black tracking-wider uppercase leading-none"
                      style={{ color: selectedGame.themeColor, textShadow: `0 0 20px ${selectedGame.themeColor}40` }}
                    >
                      {selectedGame.name}
                    </h2>
                    <p className="text-slate-400 text-[10px] leading-relaxed max-w-lg mt-2 font-sans">
                      {selectedGame.description}
                    </p>
                  </div>

                  {/* Micro stats table */}
                  <div className="flex gap-3 flex-shrink-0">
                    {[
                      { label: 'RTP RATING', value: selectedGame.rtp },
                      { label: 'MAX WIN', value: selectedGame.maxWin },
                      { label: 'HOUSE RISK', value: selectedGame.risk }
                    ].map((stat, i) => (
                      <div key={i} className="text-center px-3 py-2 bg-black/80 border border-slate-900 min-w-[75px]">
                        <div className="text-[7px] text-slate-500 uppercase tracking-wider">{stat.label}</div>
                        <div className="font-black text-[9px] mt-0.5" style={{ color: selectedGame.themeColor }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Launch deployment interface */}
            <div className="flex flex-col gap-4">
              
              <div className="hud-panel p-5 bg-[#0c0f16]/40 border-slate-900 rounded-lg">
                <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2 font-bold">// OPERATIONS DIRECTIVE</div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 font-sans">
                    <div className="text-white font-bold text-xs uppercase font-mono">STABILITY CONTRACT ASSURED</div>
                    <div className="text-slate-400 text-[10px] max-w-md">
                      Bets are paid out immediately based on state pools. House guarantees an overall margin of 60% with instant balancing mechanics.
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#ff9f00] bg-[#ff9f00]/10 border border-[#ff9f00]/20 px-2.5 py-1 rounded">
                      YOUR DRIFT BALANCE: 🪙 {user ? user.driftCoins : 0}
                    </span>
                  </div>
                </div>
              </div>

              {!deploying ? (
                <button
                  onClick={() => handleDeploy(selectedGame)}
                  className="w-full py-4 text-sm font-black tracking-[0.25em] uppercase transition-all duration-300 rounded-lg relative overflow-hidden group"
                  style={{
                    backgroundColor: `${selectedGame.themeColor}15`,
                    border: `2px solid ${selectedGame.themeColor}`,
                    color: selectedGame.themeColor,
                    boxShadow: `0 0 15px ${selectedGame.themeColor}20`
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: `${selectedGame.themeColor}10` }} />
                  <span className="relative z-10">▶ INITIALIZE CORE MODULE: {selectedGame.name}</span>
                </button>
              ) : (
                <div
                  className="w-full py-4 rounded-lg border-2 relative overflow-hidden"
                  style={{ borderColor: selectedGame.themeColor }}
                >
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-150"
                    style={{ width: `${deployProgress}%`, backgroundColor: `${selectedGame.themeColor}25` }}
                  />
                  <div className="relative z-10 text-center text-[10px] font-black tracking-widest uppercase" style={{ color: selectedGame.themeColor }}>
                    DEPLOYING CASINO SECTOR MODULE... {Math.min(100, deployProgress)}%
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* ── DAILY CHALLENGES SECTION ── */}
        <section className="hud-panel p-5 bg-[#ff9f00]/5 border-[#ff9f00]/20 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div>
              <span className="text-[9px] text-[#ff9f00] uppercase tracking-widest font-bold">CASINO_CHALLENGE_FEED</span>
              <h3 className="text-sm font-extrabold text-white uppercase mt-1">COMPLETE 20 CASINO ROUNDS TO WIN 500 BONUS DRIFT COINS</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase">LOYAL DRIFTERS ALWAYS SECURE POSITIVE RETURNS UNDER BALANCED AI CONTRACT.</p>
            </div>
            <button
              onClick={() => alert("Casino telemetry active. Play games to automatically progress daily challenges!")}
              className="px-4 py-2 bg-[#ff9f00]/10 border border-[#ff9f00] text-[#ff9f00] hover:bg-[#ff9f00]/20 font-bold uppercase text-[9px] tracking-wider rounded"
            >
              TRACK OPERATIONS
            </button>
          </div>
        </section>

        {/* ── LEADERBOARD (WINNER BOARD - TOP 20) ── */}
        <section className="hud-panel p-6 border-slate-900 bg-black/60 rounded-xl space-y-4">
          <div className="border-b border-slate-900 pb-3 flex justify-between items-end">
            <div>
              <h2 className="text-base font-bold text-white tracking-wider uppercase">// GHOSTDADDY_CASINO WINNER BOARD (TOP 20)</h2>
              <p className="text-[9px] text-slate-500 uppercase mt-0.5">Top-earning hackers globally who breached the casino payout pool</p>
            </div>
            <span className="text-[9px] text-[#00f0ff] animate-pulse uppercase tracking-widest font-bold">● MATRIX_FEED: LIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
            {leaderboard.map((player, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-[#07090e] border border-slate-900 hover:border-slate-800 p-2.5 rounded transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 flex items-center justify-center font-bold font-sans rounded border text-[9px] ${
                      idx === 0
                        ? 'bg-[#ff9f00]/10 border-[#ff9f00]/40 text-[#ff9f00]'
                        : idx === 1
                        ? 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff]'
                        : idx === 2
                        ? 'bg-[#ff0055]/10 border-[#ff0055]/40 text-[#ff0055]'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-extrabold text-white uppercase tracking-wide">{player.username}</span>
                    <div className="text-[7.5px] text-slate-600 uppercase mt-0.5">LAST SECURED WIN: {player.lastWinDate}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[#39ff14] font-extrabold font-mono">🪙 {player.totalWon.toLocaleString()}</div>
                  <div className="text-[8px] text-slate-500 uppercase">BIGGEST: {player.biggestWin.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
