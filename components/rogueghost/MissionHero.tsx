"use client";

import React from 'react';
import { MissionData } from '../../data/missions';

interface MissionHeroProps {
  mission: MissionData;
  onDeploy: () => void;
  onOpenBriefing: () => void;
  launching: boolean;
  launchProgress: number;
}

export default function MissionHero({
  mission,
  onDeploy,
  onOpenBriefing,
  launching,
  launchProgress,
}: MissionHeroProps) {
  const m = mission;

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border-2 ${m.borderGlow} transition-all duration-500`}
      style={{ borderColor: m.themeColor }}
    >
      {/* Background Poster Artwork */}
      <div className="relative aspect-[16/8] md:aspect-[16/7] lg:aspect-[16/6] w-full overflow-hidden">
        <img
          key={m.id}
          src={m.heroImage}
          alt={m.name}
          className="w-full h-full object-cover"
          style={{
            filter: 'saturate(1.3) contrast(1.1) brightness(0.75)',
          }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070a] via-[#05070a]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/40 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)',
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-4 left-5 right-5 flex justify-between items-start z-10">
          <div>
            <div
              className="text-[9px] font-black tracking-[0.3em] uppercase mb-1 flex items-center gap-1.5"
              style={{ color: m.accentColor }}
            >
              <span className="animate-pulse">◈</span> {m.operation}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              {m.classification} // SECTOR {m.code}
            </div>
          </div>

          <span
            className="text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded border shadow-lg backdrop-blur-sm"
            style={{
              borderColor: m.playable ? m.themeColor : '#475569',
              color: m.playable ? m.themeColor : '#94a3b8',
              backgroundColor: m.playable ? `${m.themeColor}20` : 'rgba(30,41,59,0.8)',
              boxShadow: m.playable ? `0 0 15px ${m.themeColor}30` : 'none',
            }}
          >
            {m.playable ? '● SECTOR AVAILABLE' : '🔒 CLASSIFIED — LOCKED'}
          </span>
        </div>

        {/* Main Content Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
          <div className="max-w-3xl space-y-4">
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.25em] block mb-1">
                FEATURED OPERATION // {m.season}
              </span>
              <h1
                className="text-4xl md:text-6xl font-black tracking-[0.15em] uppercase leading-none font-sans"
                style={{
                  color: m.themeColor,
                  textShadow: `0 0 35px ${m.themeColor}60, 0 0 70px ${m.themeColor}20`,
                }}
              >
                {m.name}
              </h1>
              <div className="text-sm font-bold text-white uppercase tracking-wider mt-1">
                {m.subtitle}
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed max-w-2xl font-sans uppercase">
              {m.narrativeBriefing}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-xl">
              <div className="bg-black/60 border border-slate-800 p-2.5 rounded-lg text-center backdrop-blur-sm">
                <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider block">THREAT LEVEL</span>
                <span className="font-extrabold text-xs mt-0.5 block" style={{ color: m.themeColor }}>
                  {m.threat}
                </span>
              </div>

              <div className="bg-black/60 border border-slate-800 p-2.5 rounded-lg text-center backdrop-blur-sm">
                <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider block">TARGET FOES</span>
                <span className="font-extrabold text-xs text-white mt-0.5 block">
                  {m.enemyCount}
                </span>
              </div>

              <div className="bg-black/60 border border-slate-800 p-2.5 rounded-lg text-center backdrop-blur-sm">
                <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider block">MISSION REWARD</span>
                <span className="font-extrabold text-xs text-[#ff9f00] mt-0.5 block">
                  +{m.rewardXP} XP
                </span>
              </div>

              <div className="bg-black/60 border border-slate-800 p-2.5 rounded-lg text-center backdrop-blur-sm">
                <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider block">EST. DURATION</span>
                <span className="font-extrabold text-xs text-slate-300 mt-0.5 block">
                  {m.estimatedDuration}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4 items-center">
              {m.playable ? (
                !launching ? (
                  <button
                    onClick={onDeploy}
                    className="px-8 py-4 text-sm md:text-base font-black tracking-[0.25em] uppercase rounded-lg transition-all duration-300 shadow-lg relative overflow-hidden group hover:scale-[1.02]"
                    style={{
                      backgroundColor: m.themeColor,
                      color: '#000000',
                      boxShadow: `0 0 30px ${m.themeColor}50`,
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span>▶</span> DEPLOY OPERATIVE
                    </span>
                  </button>
                ) : (
                  <div
                    className="px-8 py-4 rounded-lg border-2 relative overflow-hidden min-w-[240px]"
                    style={{ borderColor: m.themeColor }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-150"
                      style={{
                        width: `${launchProgress}%`,
                        backgroundColor: `${m.themeColor}40`,
                      }}
                    />
                    <div
                      className="relative z-10 text-center text-xs font-black tracking-widest uppercase"
                      style={{ color: m.themeColor }}
                    >
                      DEPLOYING OPERATIVE... {Math.floor(launchProgress)}%
                    </div>
                  </div>
                )
              ) : (
                <div className="px-8 py-4 rounded-lg border border-slate-800 bg-slate-950/80 text-center text-xs font-black tracking-widest uppercase text-slate-600 cursor-not-allowed">
                  🔒 SECTOR CLASSIFIED — DEPLOYMENT LOCKED
                </div>
              )}

              <button
                onClick={onOpenBriefing}
                className="px-6 py-4 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:bg-white/5 border-slate-700 text-slate-300 hover:border-slate-500"
              >
                📋 MISSION BRIEFING
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
