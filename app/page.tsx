"use client";

import React from 'react';
import Link from 'next/link';
import { useUser } from '../lib/state/UserContext';
import { useGames } from '../lib/state/GameContext';
import TacticalRadar3D from '../components/TacticalRadar3D';
import GamingHeroTablet from '../components/GamingHeroTablet';
import initialArticlesRaw from '../data/newsData.json';

interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  content: string;
  imageUrl: string;
  readTime: string;
}

const displayArticles = initialArticlesRaw && initialArticlesRaw.length > 0 
  ? (initialArticlesRaw as Article[]).slice(0, 3)
  : [
      {
        id: "patch-1.4",
        title: "CUNNING_CATS NITRO balance patches 1.4 deployed",
        category: "CunningCats Updates",
        date: "2026-06-04",
        summary: "",
        content: "",
        imageUrl: "",
        readTime: ""
      },
      {
        id: "stealth-maps",
        title: "SANDBATH mission stealth maps coordinates released",
        category: "RogueGhost tactics",
        date: "2026-06-03",
        summary: "",
        content: "",
        imageUrl: "",
        readTime: ""
      },
      {
        id: "rtx-5080",
        title: "RTX 5080 Tactical ray-tracing latency benchmark",
        category: "Hardware Reviews",
        date: "2026-06-03",
        summary: "",
        content: "",
        imageUrl: "",
        readTime: ""
      }
    ];

export default function Home() {
  const { user } = useUser();
  const { games } = useGames();

  // Get active games count
  const activeGamesCount = games.filter(g => g.approved).length;

  return (
    <div className="w-full min-h-screen bg-black text-slate-300 relative font-mono text-xs">
      
      {/* Background Grid & Scanline overlays */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      <div className="scanlines"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10 space-y-12">
        
        {/* Welcome Telemetry link HUD */}
        <div className="w-full bg-[#0c0f16]/90 border border-[#00f0ff]/20 px-4 py-2.5 flex justify-between items-center text-[10px] shadow-[inset_0_0_8px_rgba(0,240,255,0.05)]">
          <span className="text-[#00f0ff] font-bold tracking-wider animate-pulse">
            🛰️ DRIFTER_LINK: ONLINE // ACCESS_GRANTED: {user ? user.username.toUpperCase() : "AGENT_3"}
          </span>
          <span className="text-slate-400 hidden sm:inline">
            COGNITIVE_SYNC: <span className="text-[#ff9f00] font-bold">LVL {user ? user.level : 3}</span> // SECURE_UPLINK
          </span>
        </div>

        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-slate-900 pb-12">
          
          {/* Left Column: Logo, Info & Gaming Tablet (aligned to map height) */}
          <div className="lg:col-span-6 w-full h-auto lg:h-[528px] flex flex-col justify-between gap-4">
            
            {/* Top row: Logo (left) & Info/Metrics (right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Logo */}
              <div className="w-full flex justify-start">
                <img 
                  src="/Mylogo_CyberpunkStyle.png" 
                  alt="GamerDrift Cyberpunk Logo" 
                  className="w-[300px] h-auto object-contain filter drop-shadow-[0_0_15px_rgba(0,240,255,0.25)]" 
                />
              </div>

              {/* Info details */}
              <div className="space-y-3 flex flex-col justify-start">
                <div className="space-y-1.5">
                  <span className="text-[8.5px] text-[#ff9f00] tracking-[0.25em] uppercase font-bold block">TACTICAL MULTIPLAYER INTERFACE</span>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-widest font-sans uppercase leading-none">
                    ENTER THE <span className="text-[#00f0ff] hologram-text">DRIFT</span>
                  </h1>
                  <p className="text-slate-400 text-[10px] font-sans uppercase leading-relaxed max-w-[260px] mt-2">
                    Race. Fight. Conquer. Experience the next generation of competitive gaming networks with GamerDrift. Secure tactical command slots now.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link 
                    href="/games" 
                    className="px-4 py-2.5 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-sans font-bold tracking-widest text-[9px] uppercase shadow-[0_0_10px_rgba(0,240,255,0.25)] transition-all"
                  >
                    PLAY NOW
                  </Link>
                  <Link 
                    href="/more-games" 
                    className="px-4 py-2.5 bg-[#a855f7]/10 border border-[#a855f7]/50 hover:bg-[#a855f7]/20 hover:border-[#a855f7] text-[#a855f7] font-sans font-bold tracking-widest text-[9px] uppercase transition-all shadow-[0_0_8px_rgba(168,85,247,0.1)] hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                  >
                    🎮 MORE GAMES
                  </Link>
                  <Link 
                    href="/community" 
                    className="px-4 py-2.5 bg-transparent border border-slate-700 hover:border-[#ff9f00] hover:text-[#ff9f00] text-slate-400 font-sans font-bold tracking-widest text-[9px] uppercase transition-all"
                  >
                    JOIN COMMUNITY
                  </Link>
                </div>

                {/* Quick Metrics display */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-900 pt-3 max-w-[260px]">
                  <div>
                    <span className="text-slate-600 block text-[8px] uppercase">NODES</span>
                    <span className="text-white text-xs font-extrabold">{activeGamesCount}+ ON</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[8px] uppercase">LATENCY</span>
                    <span className="text-[#39ff14] text-xs font-extrabold">&lt; 15ms</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[8px] uppercase">ENCRYPT</span>
                    <span className="text-[#ff9f00] text-xs font-extrabold">AES-255</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom row: The 3D Intel Gaming Tablet */}
            <div className="flex-grow w-full">
              <GamingHeroTablet />
            </div>

          </div>

          {/* Right Column: Map Tile */}
          <div className="lg:col-span-6 w-full lg:mt-0 mt-4">
            <div className="hud-panel p-2">
              <TacticalRadar3D />
            </div>
          </div>
        </section>

        {/* FLAGSHIP FEATURED GAMES SECTION */}
        <section className="space-y-6">
          <div className="border-b border-slate-900 pb-3 flex justify-between items-end">
            <h2 className="text-lg font-bold text-white tracking-widest uppercase">// FLAGSHIP_OPERATIONS</h2>
            <span className="text-[9px] text-[#00f0ff]">TACTICAL_COMMUNICATION_CHANNELS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* CunningCats Game Card */}
            <div className="hud-panel p-6 bg-gradient-to-br from-[#0c0f16] to-[#05070a] flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute right-0 top-0 text-slate-800/10 text-9xl font-bold -mr-8 -mt-8 pointer-events-none">CATS</div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-[#ff9f00] text-black font-extrabold px-2 py-0.5 text-[9px] uppercase">GAME_01</span>
                  <span className="text-slate-500 uppercase text-[9px] font-bold">GENRE: COMBAT RACING</span>
                </div>
                
                <h3 className="text-xl font-extrabold text-white tracking-wider uppercase font-sans mb-3">CUNNING_CATS</h3>
                <p className="text-slate-400 text-xs leading-relaxed uppercase mb-5">
                  High-speed desert combat racing with armored cat operatives. Customize heavy weapons, build custom engines, and trigger nitro speeds.
                </p>

                <div className="grid grid-cols-2 gap-4 bg-black/40 border border-slate-900 p-3 mb-5 text-[10px] text-slate-500">
                  <div>
                    <span className="text-slate-600 block text-[9px] uppercase">FEATURES:</span>
                    <ul className="list-disc pl-3 mt-1.5 space-y-1">
                      <li>Character selection</li>
                      <li>Vehicle Customizer</li>
                      <li>Nitro boosts</li>
                      <li>Leaderboards</li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[9px] uppercase">TACTICAL:</span>
                    <ul className="list-disc pl-3 mt-1.5 space-y-1">
                      <li>Armored sandstorms</li>
                      <li>Weapon pickups</li>
                      <li>Plasma lasers</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Link 
                href="/cunningcats" 
                className="w-full bg-[#ff9f00] text-black font-sans font-bold text-center py-3 uppercase tracking-widest text-[10px] hover:bg-[#ff9f00]/80 shadow-[0_0_12px_rgba(255,159,0,0.15)] mt-auto"
              >
                DISPATCH_TO_CUNNINGCATS &gt;&gt;
              </Link>
            </div>

            {/* RogueGhost Game Card */}
            <div className="hud-panel p-6 bg-gradient-to-br from-[#0c0f16] to-[#05070a] flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute right-0 top-0 text-slate-800/10 text-9xl font-bold -mr-8 -mt-8 pointer-events-none">GHOST</div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-[#00f0ff] text-black font-extrabold px-2 py-0.5 text-[9px] uppercase">GAME_02</span>
                  <span className="text-slate-500 uppercase text-[9px] font-bold">GENRE: TACTICAL SHOOTER</span>
                </div>
                
                <h3 className="text-xl font-extrabold text-white tracking-wider uppercase font-sans mb-3">ROGUE_GHOST</h3>
                <p className="text-slate-400 text-xs leading-relaxed uppercase mb-5">
                  Single-player tactical operation. Infiltrate frozen research posts, navigate forested blocks, and extract hostage scientists.
                </p>

                <div className="grid grid-cols-2 gap-4 bg-black/40 border border-slate-900 p-3 mb-5 text-[10px] text-slate-500">
                  <div>
                    <span className="text-slate-600 block text-[9px] uppercase">MAP_SECTORS:</span>
                    <ul className="list-disc pl-3 mt-1.5 space-y-1">
                      <li>Snowblow (Outpost)</li>
                      <li>Forestfun (Wooded)</li>
                      <li>Cargology (Industrial)</li>
                      <li>Sandbath (Desert Grid)</li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[9px] uppercase">TACTICAL:</span>
                    <ul className="list-disc pl-3 mt-1.5 space-y-1">
                      <li>Stealth Camouflage</li>
                      <li>Hostage Extraction</li>
                      <li>Defect AI purging</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Link 
                href="/rogueghost" 
                className="w-full bg-[#00f0ff] text-black font-sans font-bold text-center py-3 uppercase tracking-widest text-[10px] hover:bg-[#00f0ff]/80 shadow-[0_0_12px_rgba(0,240,255,0.15)] mt-auto"
              >
                DEPLOY_MISSION_ROGUEGHOST &gt;&gt;
              </Link>
            </div>

          </div>
        </section>

        {/* NEWS, LEADERBOARDS & STORE GRID ROW */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* News Center Column */}
          <div className="hud-panel p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">INTEL_NEWSFEED</h3>
              <Link href="/news" className="text-[#00f0ff] text-[9px] hover:underline uppercase">ALL_POSTS &gt;</Link>
            </div>
            
            <div className="space-y-3.5">
              {displayArticles.map((art, idx) => (
                <div 
                  key={art.id} 
                  className={idx < displayArticles.length - 1 ? "border-b border-slate-900/60 pb-3" : ""}
                >
                  <span className={`text-[8px] font-bold block uppercase ${
                    art.category.toLowerCase().includes('cats') || art.category.toLowerCase().includes('gaming')
                      ? 'text-[#ff9f00]'
                      : art.category.toLowerCase().includes('ghost') || art.category.toLowerCase().includes('technology') || art.category.toLowerCase().includes('ai')
                      ? 'text-[#00f0ff]'
                      : 'text-slate-500'
                  }`}>
                    {art.category}
                  </span>
                  <Link href="/news" className="text-white hover:text-[#00f0ff] font-bold uppercase block mt-1 leading-snug line-clamp-2">
                    {art.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Column */}
          <div className="hud-panel p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">SCORE_MATRIX</h3>
              <Link href="/leaderboard" className="text-[#00f0ff] text-[9px] hover:underline uppercase">FULL_BOARD &gt;</Link>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center bg-black/40 border border-slate-900 p-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#ff9f00]/10 border border-[#ff9f00]/30 text-[#ff9f00] flex items-center justify-center text-[9px] font-bold font-sans">#1</span>
                  <span className="font-bold text-white uppercase">Hex_Netrunner</span>
                </div>
                <span className="text-[#ff9f00] font-bold">98.4k pts</span>
              </div>
              
              <div className="flex justify-between items-center bg-black/40 border border-slate-900 p-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] flex items-center justify-center text-[9px] font-bold font-sans">#2</span>
                  <span className="font-bold text-white uppercase">Desert_Fox</span>
                </div>
                <span className="text-slate-400 font-bold">88.1k pts</span>
              </div>

              <div className="flex justify-between items-center bg-black/40 border border-slate-900 p-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#39ff14]/10 border border-[#39ff14]/20 text-[#39ff14] flex items-center justify-center text-[9px] font-bold font-sans">#3</span>
                  <span className="font-bold text-white uppercase">GhostInGrid</span>
                </div>
                <span className="text-slate-500 font-bold">79.3k pts</span>
              </div>
            </div>
          </div>

          {/* Store showcase column */}
          <div className="hud-panel p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">STORE_TELEMETRY</h3>
              <Link href="/store" className="text-[#00f0ff] text-[9px] hover:underline uppercase">QUARTERMASTER &gt;</Link>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 border-b border-slate-900/60 pb-2.5">
                <div className="w-10 h-10 bg-slate-950 border border-slate-900 flex-shrink-0 flex items-center justify-center text-lg">💺</div>
                <div className="flex-grow">
                  <span className="text-white font-bold block uppercase leading-none">Command Chair</span>
                  <span className="text-slate-500 text-[8px] uppercase mt-0.5">Desert Sandstorm weave</span>
                </div>
                <span className="text-[#39ff14] font-bold font-mono">$349.99</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-950 border border-slate-900 flex-shrink-0 flex items-center justify-center text-lg">⚙️</div>
                <div className="flex-grow">
                  <span className="text-white font-bold block uppercase leading-none">Racing Wheel</span>
                  <span className="text-slate-500 text-[8px] uppercase mt-0.5">12 Nm direct-drive</span>
                </div>
                <span className="text-[#39ff14] font-bold font-mono">$499.99</span>
              </div>
            </div>
          </div>

        </section>

        {/* COMMUNITY CHALLENGES */}
        <section className="hud-panel p-5 bg-[#00f0ff]/5 border-[#00f0ff]/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div>
              <span className="text-[9px] text-[#00f0ff] uppercase tracking-widest font-bold">COMMUNITY_CHALLENGE_GRID</span>
              <h3 className="text-sm font-extrabold text-white uppercase mt-1">NEUTRALIZE 10,000 ROGUE_GHOST BOTS GLOBALLY</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase">ALL DRIFTERS ACCRUE DUAL-XP MODIFIERS UPON MILESTONE COMPLETION.</p>
            </div>
            <Link 
              href="/community" 
              className="hud-btn px-4 py-2 bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/20 shrink-0 font-bold"
            >
              LINK_CLAN_FILE
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
