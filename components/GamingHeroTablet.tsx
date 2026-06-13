"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface GameData {
  id: 'ghost' | 'cats';
  name: string;
  genre: string;
  classification: string;
  mission: string;
  brief: string;
  stats: { label: string; value: string; color: string }[];
  image: string;
  themeColor: string;
  glowColor: string;
  dispatchUrl: string;
}

const GAMES: GameData[] = [
  {
    id: 'ghost',
    name: 'ROGUE_GHOST',
    genre: 'GENRE: STEALTH TACTICAL SHOOTER',
    classification: 'SEC-LEVEL: TOP SECRET',
    mission: 'OPERATION: PURGE DEFECT AI GRID',
    brief: 'INFILTRATE FROZEN OUTPOSTS AND FORESTED SECTORS. STAGE STEALTH CAMOUFLAGE AND ELIMINATE REBEL ROBOT PLATOONS.',
    dispatchUrl: '/rogueghost',
    themeColor: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.4)',
    image: '/rogue_ghost_character.png',
    stats: [
      { label: 'STEALTH ACTIVE', value: '98%', color: 'text-[#39ff14]' },
      { label: 'BATTERY CELL', value: '4.8V', color: 'text-slate-400' },
      { label: 'HOSTAGE SCAN', value: 'STANDBY', color: 'text-[#ff9f00]' },
    ]
  },
  {
    id: 'cats',
    name: 'CUNNING_CATS',
    genre: 'GENRE: COMBAT DESERT RACING',
    classification: 'SEC-LEVEL: CONFIDENTIAL',
    mission: 'OPERATION: SANDSTORM NITRO RAGE',
    brief: 'DRIVE HEAVILY ARMORED VECHICLES LOADED WITH PLASMA LASERS. DEPLOY NITRO NITRO AND RACE THROUGH HEAVY SANDSTORMS.',
    dispatchUrl: '/cunningcats',
    themeColor: '#ff9f00',
    glowColor: 'rgba(255, 159, 0, 0.4)',
    image: '/cunning_cat_character.png',
    stats: [
      { label: 'NITRO CAPACITY', value: '100%', color: 'text-[#39ff14]' },
      { label: 'SHELL THICK', value: '80mm', color: 'text-slate-400' },
      { label: 'WEAPON LOAD', value: 'PLASMA', color: 'text-[#ff3333]' },
    ]
  }
];

export default function GamingHeroTablet() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [scanlineOffset, setScanlineOffset] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeGame = GAMES[activeIdx];

  // Auto-Slide Cycle (pauses on hover)
  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % GAMES.length);
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered]);

  // Audio click synthesizer
  const playClickSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  };

  const handleNext = () => {
    playClickSound();
    setActiveIdx(prev => (prev + 1) % GAMES.length);
  };

  const handlePrev = () => {
    playClickSound();
    setActiveIdx(prev => (prev - 1 + GAMES.length) % GAMES.length);
  };

  // 3D Tilting Transform
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setRotate({ x: x * 12, y: -y * 12 }); // Max 12 degrees tilt
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.y}deg) rotateY(${rotate.x}deg)`,
        transition: isHovered ? 'none' : 'transform 0.5s ease',
        borderColor: activeGame.themeColor,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), inset 0 0 16px ${activeGame.glowColor}`
      }}
      className="w-full h-[310px] bg-[#070a10]/95 border-2 rounded-xl flex relative overflow-hidden select-none font-mono text-[10px] text-slate-300"
    >
      
      {/* 3D TABLET AESTHETICS - Bezel, Corner brackets & Grips */}
      <div className="absolute top-2 left-2 text-[7px] text-slate-600 font-bold uppercase tracking-widest z-20">
        💻 TAC_INTEL_TABLET v7.8 // DISPATCH_LINK: ESTABLISHED
      </div>

      {/* Flashing power light LED */}
      <div className="absolute top-2.5 right-12 flex items-center gap-1.5 z-20">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
        </span>
        <span className="text-[6.5px] text-slate-600 uppercase font-black tracking-widest">SYS RUN</span>
      </div>

      {/* Side Tablet Handle Grip Bar Decoration (Left & Right margins) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-slate-800/80 rounded-r border-r border-slate-900 z-20" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-slate-800/80 rounded-l border-l border-slate-900 z-20" />

      {/* Left grip screws */}
      <div className="absolute bottom-2 left-2 text-[7px] text-slate-700 z-20">[+]</div>
      <div className="absolute bottom-2 right-2 text-[7px] text-slate-700 z-20">[+]</div>

      {/* Slide scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-1/2 animate-pulse z-15" />

      {/* LEFT SIDE: GAME INTEL INFO */}
      <div className="w-[55%] p-4 flex flex-col justify-between relative z-10 select-none border-r border-slate-900/80">
        
        <div className="space-y-2 mt-2">
          {/* SEC CLASSIFICATION & GENRE */}
          <div className="flex justify-between items-center text-[7.5px] text-slate-500 font-bold uppercase">
            <span>{activeGame.classification}</span>
            <span>{activeGame.genre}</span>
          </div>

          {/* GAME TITLE */}
          <h2 
            style={{ color: activeGame.themeColor, textShadow: `0 0 8px ${activeGame.themeColor}50` }}
            className="text-lg font-black tracking-wider uppercase font-sans animate-pulse"
          >
            {activeGame.name}
          </h2>

          {/* ACTIVE OPERATION STATUS */}
          <div className="bg-black/50 border border-slate-900 px-2 py-1 text-[8.5px] text-white/90 rounded tracking-wide font-semibold">
            🎯 {activeGame.mission}
          </div>

          {/* DETAILED BRIEFING */}
          <p className="text-slate-400 text-[8.5px] leading-relaxed uppercase pt-1 line-clamp-3">
            {activeGame.brief}
          </p>
        </div>

        {/* SYSTEM STATS READOUT */}
        <div className="space-y-1.5 pt-2 border-t border-slate-900/60">
          <div className="grid grid-cols-3 gap-2 text-[7.5px] uppercase text-slate-500">
            {activeGame.stats.map((st, idx) => (
              <div key={idx} className="flex flex-col">
                <span>{st.label}</span>
                <span className={`font-bold text-[9px] mt-0.5 ${st.color}`}>{st.value}</span>
              </div>
            ))}
          </div>

          {/* DISPATCH CTA LINK BUTTON */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <Link 
              href={activeGame.dispatchUrl}
              style={{
                borderColor: activeGame.themeColor,
                backgroundColor: `${activeGame.themeColor}10`,
                boxShadow: `0 0 10px ${activeGame.themeColor}15`
              }}
              className="px-3.5 py-1.5 border text-[8.5px] font-extrabold rounded hover:bg-opacity-20 hover:text-white uppercase transition-all"
            >
              DEPLOY MISSION &gt;&gt;
            </Link>

            {/* Slider Switch Buttons */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handlePrev}
                className="w-5 h-5 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-white font-extrabold flex items-center justify-center rounded text-[8px] transition-all active:scale-95"
              >
                &lt;
              </button>
              <button 
                onClick={handleNext}
                className="w-5 h-5 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-white font-extrabold flex items-center justify-center rounded text-[8px] transition-all active:scale-95"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: 8K COLORFUL CHARACTERS PICTURE */}
      <div className="w-[45%] h-full relative overflow-hidden bg-black/80">
        
        {/* Actual Character Image */}
        <img 
          src={activeGame.image} 
          alt={`${activeGame.name} Game Character`} 
          className="w-full h-full object-cover transition-all duration-700 ease-out select-none"
          style={{
            transform: isHovered ? 'scale(1.06)' : 'scale(1.0)',
            opacity: 0.9
          }}
        />

        {/* Screen glares/hologram graphics overlay on top of image */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/85 via-transparent to-black/10 z-10" />
        <div className="absolute inset-0 screen-scanlines opacity-15 pointer-events-none z-10" />
        
        {/* Holographic targeting reticle grid */}
        <div 
          style={{ borderColor: `${activeGame.themeColor}40` }}
          className="absolute inset-3 border border-dashed rounded pointer-events-none z-10 flex flex-col justify-between p-1 opacity-60"
        >
          {/* Top crosshairs */}
          <div className="flex justify-between text-[6.5px] text-slate-500">
            <span>LOCK_ACQR</span>
            <span>TGT: 14.8KM</span>
          </div>
          
          {/* Center tiny reticle */}
          <div className="self-center flex items-center justify-center">
            <div 
              style={{ borderColor: activeGame.themeColor, animationDuration: '10s' }}
              className="w-6 h-6 border border-dashed rounded-full animate-spin"
            />
            <div style={{ backgroundColor: activeGame.themeColor }} className="w-1 h-1 rounded-full absolute" />
          </div>

          {/* Bottom telemetry indicators */}
          <div className="flex justify-between items-end text-[6px] text-slate-500 font-sans">
            <span>GD-OPERATIVE</span>
            <span>GRID_OK</span>
          </div>
        </div>

      </div>

    </div>
  );
}
