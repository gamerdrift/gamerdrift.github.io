"use client";

import React from 'react';
import Link from 'next/link';
import { useUser } from '../lib/state/UserContext';
import TacticalRadar3D from '../components/TacticalRadar3D';
import GamingHeroTablet from '../components/GamingHeroTablet';
import { getPlayUrl, ROGUE_GHOST_DEFAULT_MISSION } from '../lib/routes';
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
      },
      {
        id: "v02-patch",
        title: "ROGUE_GHOST v0.2 — Cargology Industrial sector live",
        category: "RogueGhost Updates",
        date: "2026-06-14",
        summary: "",
        content: "",
        imageUrl: "",
        readTime: ""
      }
    ];

export default function Home() {
  const { user } = useUser();

  return (
    <div className="w-full min-h-screen bg-black text-slate-300 relative font-mono text-xs">

      {/* Background Grid & Scanline overlays */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      <div className="scanlines"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10 space-y-12">

        {/* Welcome Telemetry HUD */}
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

          {/* Left Column */}
          <div className="lg:col-span-6 w-full h-auto lg:h-[528px] flex flex-col justify-between gap-4">

            {/* Top: Logo + Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* Logo */}
              <div className="w-full flex justify-start">
                <img
                  src="/Mylogo_CyberpunkStyle.png"
                  alt="GamerDrift Cyberpunk Logo"
                  className="w-[300px] h-auto object-contain filter drop-shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                />
              </div>

              {/* Info */}
              <div className="space-y-3 flex flex-col justify-start">
                <div className="space-y-1.5">
                  <span className="text-[8.5px] text-[#ff9f00] tracking-[0.25em] uppercase font-bold block">TACTICAL STEALTH OPERATION</span>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-widest font-sans uppercase leading-none">
                    ENTER <span className="text-[#00f0ff] hologram-text">ROGUE GHOST</span>
                  </h1>
                  <p className="text-slate-400 text-[10px] font-sans uppercase leading-relaxed max-w-[260px] mt-2">
                    Infiltrate. Eliminate. Extract. The world's most immersive 3D tactical stealth experience — built for the next generation.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    href={getPlayUrl('rogue-ghost', ROGUE_GHOST_DEFAULT_MISSION)}
                    className="px-4 py-2.5 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-sans font-bold tracking-widest text-[9px] uppercase shadow-[0_0_10px_rgba(0,240,255,0.25)] transition-all"
                  >
                    ▶ DEPLOY NOW
                  </Link>
                  <Link
                    href="/rogueghost"
                    className="px-4 py-2.5 bg-[#a855f7]/10 border border-[#a855f7]/50 hover:bg-[#a855f7]/20 hover:border-[#a855f7] text-[#a855f7] font-sans font-bold tracking-widest text-[9px] uppercase transition-all shadow-[0_0_8px_rgba(168,85,247,0.1)] hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                  >
                    🎮 MISSION INTEL
                  </Link>
                  <Link
                    href="/community"
                    className="px-4 py-2.5 bg-transparent border border-slate-700 hover:border-[#ff9f00] hover:text-[#ff9f00] text-slate-400 font-sans font-bold tracking-widest text-[9px] uppercase transition-all"
                  >
                    JOIN COMMUNITY
                  </Link>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-900 pt-3 max-w-[260px]">
                  <div>
                    <span className="text-slate-600 block text-[8px] uppercase">MAPS</span>
                    <span className="text-white text-xs font-extrabold">4 SECTORS</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[8px] uppercase">LATENCY</span>
                    <span className="text-[#39ff14] text-xs font-extrabold">&lt; 15ms</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[8px] uppercase">ENGINE</span>
                    <span className="text-[#ff9f00] text-xs font-extrabold">GODOT 4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: 3D Tablet */}
            <div className="flex-grow w-full">
              <GamingHeroTablet />
            </div>
          </div>

          {/* Right Column: Radar Map */}
          <div className="lg:col-span-6 w-full lg:mt-0 mt-4">
            <div className="hud-panel p-2">
              <TacticalRadar3D />
            </div>
          </div>
        </section>

        {/* FLAGSHIP OPERATION: ROGUE GHOST */}
        <section className="space-y-6">
          <div className="border-b border-slate-900 pb-3 flex justify-between items-end">
            <h2 className="text-lg font-bold text-white tracking-widest uppercase">// FLAGSHIP_OPERATION</h2>
            <span className="text-[9px] text-[#00f0ff]">CLASSIFIED_INTEL_FEED</span>
          </div>

          {/* Full-width RogueGhost hero card */}
          <div className="hud-panel p-8 bg-gradient-to-br from-[#0c0f16] to-[#05070a] flex flex-col lg:flex-row gap-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 text-slate-800/10 text-[10rem] font-bold -mr-8 -mt-8 pointer-events-none select-none">GHOST</div>

            {/* Left: Details */}
            <div className="flex-1 flex flex-col justify-between gap-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-[#00f0ff] text-black font-extrabold px-2 py-0.5 text-[9px] uppercase">GAME_01 — ACTIVE</span>
                  <span className="text-slate-500 uppercase text-[9px] font-bold">GENRE: TACTICAL STEALTH ACTION</span>
                </div>

                <h3 className="text-3xl font-extrabold text-white tracking-wider uppercase font-sans mb-3">
                  ROGUE_<span className="text-[#00f0ff]">GHOST</span>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed uppercase mb-5 max-w-xl">
                  Single-player tactical operation. Infiltrate frozen research posts, navigate forested blocks, breach industrial cargo terminals, and extract hostage scientists from scorching desert grids.
                </p>

                <div className="grid grid-cols-2 gap-6 bg-black/40 border border-slate-900 p-4 mb-5 text-[10px] text-slate-500">
                  <div>
                    <span className="text-slate-600 block text-[9px] uppercase mb-2">MAP_SECTORS:</span>
                    <ul className="list-disc pl-3 space-y-1.5">
                      <li><span className="text-white">Snowblow</span> — Arctic Outpost</li>
                      <li><span className="text-white">Forestfun</span> — Wooded Terrain</li>
                      <li><span className="text-white">Cargology</span> — Industrial Terminal</li>
                      <li><span className="text-white">Sandbath</span> — Desert Grid</li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[9px] uppercase mb-2">TACTICAL_MODULES:</span>
                    <ul className="list-disc pl-3 space-y-1.5">
                      <li>Stealth Camouflage System</li>
                      <li>Hostage Extraction Protocol</li>
                      <li>Defect AI Guard Purging</li>
                      <li>Dynamic Patrol Routes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Link
                  href={getPlayUrl('rogue-ghost', ROGUE_GHOST_DEFAULT_MISSION)}
                  className="px-6 py-3 bg-[#00f0ff] text-black font-sans font-bold uppercase tracking-widest text-[10px] hover:bg-[#00f0ff]/80 shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all"
                >
                  ▶ DEPLOY_MISSION
                </Link>
                <Link
                  href="/rogueghost"
                  className="px-6 py-3 bg-transparent border border-[#00f0ff]/50 text-[#00f0ff] font-sans font-bold uppercase tracking-widest text-[10px] hover:bg-[#00f0ff]/10 transition-all"
                >
                  FULL_MISSION_BRIEF
                </Link>
              </div>
            </div>

            {/* Right: Character art */}
            <div className="lg:w-64 flex-shrink-0 flex items-center justify-center">
              <img
                src="/rogue_ghost_character.png"
                alt="Rogue Ghost Operative"
                className="w-48 lg:w-full h-auto object-contain filter drop-shadow-[0_0_30px_rgba(0,240,255,0.35)]"
              />
            </div>
          </div>
        </section>

        {/* NEWS, LEADERBOARDS & STORE GRID ROW */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* News Center */}
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
                    art.category.toLowerCase().includes('ghost') || art.category.toLowerCase().includes('rogue')
                      ? 'text-[#00f0ff]'
                      : art.category.toLowerCase().includes('hardware') || art.category.toLowerCase().includes('tech')
                      ? 'text-[#a855f7]'
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

          {/* Leaderboard */}
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

          {/* Store Showcase */}
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

        {/* COMMUNITY CHALLENGE */}
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
