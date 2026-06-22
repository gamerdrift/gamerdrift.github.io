"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const MAPS = [
  {
    id: 'sandbath',
    name: 'SANDBATH',
    subtitle: 'Desert Grid — Sector SB-44',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '/map_sandbath.png',
    themeColor: '#ff9f00',
    threat: 'HIGH',
    enemies: '4 GUARDS',
    objective: 'ELIMINATE ALL HOSTILES + EXTRACT',
  },
  {
    id: 'snowblow',
    name: 'SNOWBLOW',
    subtitle: 'Arctic Outpost — Sector SW-07',
    status: 'COMING SOON',
    statusColor: '#00f0ff',
    image: '/map_snowblow.png',
    themeColor: '#00f0ff',
    threat: 'EXTREME',
    enemies: '8 GUARDS + 2 SNIPERS',
    objective: 'EXTRACT DATA DRIVE FROM SERVER',
  },
  {
    id: 'cargology',
    name: 'CARGOLOGY',
    subtitle: 'Industrial Terminal — Sector CG-22',
    status: 'COMING SOON',
    statusColor: '#ff9f00',
    image: '/map_cargology.png',
    themeColor: '#ff6600',
    threat: 'VERY HIGH',
    enemies: '10 GUARDS + 2 GUN EMPLACEMENTS',
    objective: 'RESCUE HOSTAGES — REACH EXTRACT TRUCK',
  },
  {
    id: 'forestfun',
    name: 'FORESTFUN',
    subtitle: 'Woodland Combat Zone — Sector FF-13',
    status: 'COMING SOON',
    statusColor: '#a855f7',
    image: '/map_forestfun.png',
    themeColor: '#4ade80',
    threat: 'EXTREME',
    enemies: '8 GUARDS + 3 PATROL DOGS',
    objective: 'PLANT CHARGE AT FUEL DEPOT + EXTRACT',
  },
];

export default function GamingHeroTablet() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeMap = MAPS[activeIdx];

  // Auto-cycle every 4s, pause on hover
  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      goNext();
    }, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isHovered, activeIdx]);

  const goTo = (idx: number) => {
    if (idx === activeIdx) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveIdx(idx);
      setTransitioning(false);
    }, 180);
  };

  const goNext = () => goTo((activeIdx + 1) % MAPS.length);
  const goPrev = () => goTo((activeIdx - 1 + MAPS.length) % MAPS.length);

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
        borderColor: activeMap.themeColor,
        boxShadow: `0 8px 32px rgba(0,0,0,0.8), inset 0 0 20px ${activeMap.themeColor}22`,
      }}
      className="w-full h-[310px] bg-[#070a10]/95 border-2 rounded-xl flex relative overflow-hidden select-none font-mono text-[10px] text-slate-300"
    >
      {/* Tablet chrome */}
      <div className="absolute top-2 left-2 text-[7px] text-slate-600 font-bold uppercase tracking-widest z-20">
        💻 TAC_INTEL_TABLET v7.8 // MAP_SELECTOR: ACTIVE
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

      {/* ─── LEFT PANEL: MAP DISPLAY ─── */}
      <div className="w-[55%] h-full flex flex-col relative z-10 border-r border-slate-900/80 overflow-hidden">

        {/* Map image area — fills most of the left panel */}
        <div className="relative flex-1 overflow-hidden bg-black">
          <img
            key={activeMap.id}
            src={activeMap.image}
            alt={`${activeMap.name} map`}
            className="w-full h-full object-cover"
            style={{
              opacity: transitioning ? 0 : 0.92,
              transform: transitioning ? 'scale(1.04)' : (isHovered ? 'scale(1.04)' : 'scale(1.0)'),
              transition: 'opacity 0.18s ease, transform 0.4s ease',
              filter: 'saturate(1.2) contrast(1.05)',
            }}
          />

          {/* Scan line overlay */}
          <div className="absolute inset-0 pointer-events-none z-10"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)' }}
          />

          {/* Top-left sector badge */}
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
            <div
              className="text-[7px] font-black tracking-[0.2em] uppercase px-2 py-0.5"
              style={{ backgroundColor: `${activeMap.themeColor}22`, border: `1px solid ${activeMap.themeColor}60`, color: activeMap.themeColor }}
            >
              SECTOR: {activeMap.name}
            </div>
            <div
              className="text-[6px] font-bold tracking-wider uppercase px-2 py-0.5 w-fit"
              style={{ color: activeMap.statusColor, border: `1px solid ${activeMap.statusColor}40`, backgroundColor: `${activeMap.statusColor}10` }}
            >
              ● {activeMap.status}
            </div>
          </div>

          {/* Bottom overlay: mission intel */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-3 py-2"
            style={{ background: 'linear-gradient(to top, rgba(5,7,10,0.95) 60%, transparent)' }}
          >
            <div className="text-[6.5px] text-slate-500 uppercase tracking-wider mb-0.5">{activeMap.subtitle}</div>
            <div className="flex justify-between items-center">
              <div className="flex gap-3 text-[7px]">
                <span className="text-slate-600">THREAT: <span className="text-red-400 font-bold">{activeMap.threat}</span></span>
                <span className="text-slate-600">TARGETS: <span className="text-slate-300 font-bold">{activeMap.enemies}</span></span>
              </div>
            </div>
            <div className="text-[6.5px] text-slate-500 uppercase mt-0.5 tracking-wide truncate">
              OBJ: <span style={{ color: activeMap.themeColor }}>{activeMap.objective}</span>
            </div>
          </div>

          {/* Left/Right nav arrows over the image */}
          <button
            onClick={() => { playClick(); goPrev(); }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-30 w-6 h-6 flex items-center justify-center text-white bg-black/60 border border-slate-700 hover:border-slate-500 rounded transition-all text-[9px] font-bold"
          >‹</button>
          <button
            onClick={() => { playClick(); goNext(); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-30 w-6 h-6 flex items-center justify-center text-white bg-black/60 border border-slate-700 hover:border-slate-500 rounded transition-all text-[9px] font-bold"
          >›</button>
        </div>

        {/* Bottom strip: map selector dots + deploy CTA */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#05070a]/90 border-t border-slate-900/60 flex-shrink-0">
          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {MAPS.map((m, i) => (
              <button
                key={m.id}
                onClick={() => { playClick(); goTo(i); }}
                title={m.name}
                className="transition-all duration-200"
                style={{
                  width: i === activeIdx ? '18px' : '5px',
                  height: '5px',
                  borderRadius: '3px',
                  backgroundColor: i === activeIdx ? activeMap.themeColor : '#334155',
                  boxShadow: i === activeIdx ? `0 0 6px ${activeMap.themeColor}` : 'none',
                }}
              />
            ))}
            <span className="text-[6.5px] text-slate-600 ml-1 uppercase tracking-wider">{activeIdx + 1}/{MAPS.length} SECTORS</span>
          </div>

          {/* Deploy CTA */}
          <Link
            href={`/play/rogue-ghost/?mission=${activeMap.id}`}
            className="text-[7.5px] font-extrabold uppercase px-3 py-1 tracking-wider transition-all hover:opacity-80"
            style={{
              border: `1px solid ${activeMap.themeColor}`,
              color: activeMap.themeColor,
              backgroundColor: `${activeMap.themeColor}15`,
              boxShadow: `0 0 8px ${activeMap.themeColor}20`,
            }}
          >
            ▶ DEPLOY
          </Link>
        </div>
      </div>

      {/* ─── RIGHT SIDE: CHARACTER IMAGE (unchanged) ─── */}
      <div className="w-[45%] h-full relative overflow-hidden bg-black/80">
        <img
          src="/rogue_ghost_character.png"
          alt="Rogue Ghost Operative"
          className="w-full h-full object-cover transition-all duration-700 ease-out select-none"
          style={{
            transform: isHovered ? 'scale(1.06)' : 'scale(1.0)',
            opacity: 0.9,
          }}
        />
        {/* Overlays */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/85 via-transparent to-black/10 z-10" />
        <div className="absolute inset-0 screen-scanlines opacity-15 pointer-events-none z-10" />

        {/* Holographic reticle */}
        <div
          style={{ borderColor: `${activeMap.themeColor}40` }}
          className="absolute inset-3 border border-dashed rounded pointer-events-none z-10 flex flex-col justify-between p-1 opacity-60"
        >
          <div className="flex justify-between text-[6.5px] text-slate-500">
            <span>LOCK_ACQR</span>
            <span>TGT: 14.8KM</span>
          </div>
          <div className="self-center flex items-center justify-center">
            <div
              style={{ borderColor: activeMap.themeColor, animationDuration: '10s' }}
              className="w-6 h-6 border border-dashed rounded-full animate-spin"
            />
            <div style={{ backgroundColor: activeMap.themeColor }} className="w-1 h-1 rounded-full absolute" />
          </div>
          <div className="flex justify-between items-end text-[6px] text-slate-500 font-sans">
            <span>GD-OPERATIVE</span>
            <span>GRID_OK</span>
          </div>
        </div>
      </div>

    </div>
  );
}
