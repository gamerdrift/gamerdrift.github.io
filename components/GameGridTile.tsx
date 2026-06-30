"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export interface GameMetadata {
  id: string;
  name: string;
  subtitle: string;
  status: string;
  statusColor: string;
  image: string; // The main poster
  themeColor: string;
  threat: string;
  enemies: string;
  objective: string;
}

interface GameGridTileProps {
  game: GameMetadata;
}

export default function GameGridTile({ game }: GameGridTileProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const playClick = () => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.07);
    } catch {}
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: x * 10, y: -y * 10 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setRotate({ x: 0, y: 0 }); setIsHovered(false); }}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.y}deg) rotateY(${rotate.x}deg)`,
        transition: isHovered ? 'none' : 'transform 0.5s ease',
        borderColor: game.themeColor,
        boxShadow: `0 8px 32px rgba(0,0,0,0.8), inset 0 0 20px ${game.themeColor}22`,
      }}
      className="w-full h-[250px] bg-[#070a10]/95 border-2 rounded-xl flex relative overflow-hidden select-none font-mono text-[10px] text-slate-300 group"
    >
      {/* Tablet chrome */}
      <div className="absolute top-2 left-2 text-[7px] text-slate-600 font-bold uppercase tracking-widest z-20">
        💻 TAC_INTEL_TABLET // GAME: {game.name}
      </div>
      <div className="absolute top-2.5 right-12 flex items-center gap-1.5 z-20">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
        </span>
        <span className="text-[6.5px] text-slate-600 uppercase font-black tracking-widest">SYS RUN</span>
      </div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-slate-800/80 rounded-r border-r border-slate-900 z-20" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-slate-800/80 rounded-l border-l border-slate-900 z-20" />
      <div className="absolute bottom-2 left-2 text-[7px] text-slate-700 z-20">[+]</div>
      <div className="absolute bottom-2 right-2 text-[7px] text-slate-700 z-20">[+]</div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.03] to-transparent h-1/2 animate-pulse z-[15]" />

      {/* Main Panel (Full Width) */}
      <div className="w-full h-full flex flex-col relative z-10 overflow-hidden">
        
        {/* Game Poster Image Area */}
        <div className="relative flex-1 overflow-hidden bg-black">
          <img
            src={game.image}
            alt={`${game.name} poster`}
            className="w-full h-full object-cover"
            style={{
              transform: isHovered ? 'scale(1.08)' : 'scale(1.0)',
              transition: 'transform 0.4s ease',
              filter: 'saturate(1.2) contrast(1.05)',
              opacity: 0.9,
            }}
          />

          {/* Scan line overlay */}
          <div className="absolute inset-0 pointer-events-none z-10"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)' }}
          />

          {/* Top-left sector badge */}
          <div className="absolute top-8 left-2 z-20 flex flex-col gap-1">
            <div
              className="text-[7px] font-black tracking-[0.2em] uppercase px-2 py-0.5"
              style={{ backgroundColor: `${game.themeColor}22`, border: `1px solid ${game.themeColor}60`, color: game.themeColor }}
            >
              TITLE: {game.name}
            </div>
            <div
              className="text-[6px] font-bold tracking-wider uppercase px-2 py-0.5 w-fit"
              style={{ color: game.statusColor, border: `1px solid ${game.statusColor}40`, backgroundColor: `${game.statusColor}10` }}
            >
              ● {game.status}
            </div>
          </div>

          {/* Hover overlay with objective */}
          <div className={`absolute inset-0 bg-black/60 z-20 flex flex-col justify-center items-center p-4 text-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="text-xl font-bold tracking-widest uppercase mb-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {game.name}
            </h3>
            <p className="text-xs text-slate-300 max-w-[90%] mb-4 leading-relaxed font-sans">{game.subtitle}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[8px] text-slate-400 uppercase tracking-widest text-left w-full max-w-[80%] border-t border-slate-700 pt-2">
              <div><span className="text-slate-500">THREAT:</span> <span className="text-red-400">{game.threat}</span></div>
              <div><span className="text-slate-500">TARGET:</span> {game.enemies}</div>
              <div className="col-span-2"><span className="text-slate-500">OBJ:</span> <span style={{ color: game.themeColor }}>{game.objective}</span></div>
            </div>
          </div>
        </div>

        {/* Bottom strip: deploy CTA */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#05070a]/90 border-t border-slate-900/60 flex-shrink-0 z-30 relative">
          <div className="text-[7px] text-slate-500 uppercase tracking-widest">
            {game.id}_INITIATE_LINK
          </div>
          <Link
            href={`/play/${game.id}`}
            onClick={playClick}
            className="text-[8px] font-extrabold uppercase px-4 py-1.5 tracking-widest transition-all hover:scale-105"
            style={{
              border: `1px solid ${game.themeColor}`,
              color: game.themeColor,
              backgroundColor: `${game.themeColor}15`,
              boxShadow: `0 0 10px ${game.themeColor}40`,
            }}
          >
            ▶ PLAY NOW
          </Link>
        </div>
      </div>
    </div>
  );
}
