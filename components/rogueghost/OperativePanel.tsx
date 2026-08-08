"use client";

import React from 'react';
import { useUser } from '../../lib/state/UserContext';

export default function OperativePanel() {
  const { user } = useUser();

  const codename = user ? user.username.toUpperCase() : 'GHOST_OPERATIVE_03';
  const level = user ? user.level : 3;
  const xp = user ? user.xp : 340;
  const nextXp = level * 250;
  const xpPercent = Math.min(100, Math.floor((xp / nextXp) * 100));

  return (
    <div className="w-full bg-[#0c0f16]/90 border border-slate-800 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs">👤</span>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
            OPERATIVE_DOSSIER
          </h3>
        </div>
        <span className="text-[8px] font-extrabold text-[#39ff14] border border-[#39ff14]/30 bg-[#39ff14]/10 px-2 py-0.5 uppercase tracking-widest">
          ● READY_FOR_DEPLOYMENT
        </span>
      </div>

      {/* Profile Card */}
      <div className="flex items-center gap-4 bg-black/40 border border-slate-900 p-3 rounded-lg mb-4">
        <div className="w-12 h-12 bg-[#00f0ff]/10 border border-[#00f0ff]/40 rounded-lg flex items-center justify-center text-xl text-[#00f0ff] font-black shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
          {codename.substring(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-slate-500 text-[8px] font-bold tracking-widest uppercase">CODENAME</div>
          <div className="text-sm font-black text-white tracking-wider uppercase truncate">
            {codename}
          </div>
          <div className="text-[#ff9f00] text-[9px] font-bold tracking-widest uppercase mt-0.5">
            CLEARANCE: LEVEL 5 TOP SECRET
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-[10px]">
        <div className="bg-black/30 border border-slate-900/80 p-2.5 rounded-lg">
          <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider block">OPERATIVE LEVEL</span>
          <span className="text-white text-base font-black">LVL {level}</span>
        </div>

        <div className="bg-black/30 border border-slate-900/80 p-2.5 rounded-lg">
          <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider block">STEALTH RATING</span>
          <span className="text-[#00f0ff] text-base font-black">98.4% SILENT</span>
        </div>

        <div className="bg-black/30 border border-slate-900/80 p-2.5 rounded-lg">
          <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider block">COMBAT ACCURACY</span>
          <span className="text-[#ff9f00] text-base font-black">87.2% ACC</span>
        </div>

        <div className="bg-black/30 border border-slate-900/80 p-2.5 rounded-lg">
          <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider block">DEPLOYMENTS</span>
          <span className="text-slate-300 text-base font-black">14 COMPLETED</span>
        </div>
      </div>

      {/* XP Progression Bar */}
      <div className="mt-4 pt-3 border-t border-slate-900">
        <div className="flex justify-between text-[8px] font-bold text-slate-400 mb-1.5 uppercase">
          <span>PROGRESSION XP</span>
          <span className="text-[#00f0ff]">{xp} / {nextXp} XP ({xpPercent}%)</span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
          <div
            className="h-full bg-gradient-to-r from-[#00f0ff] to-[#a855f7] rounded-full transition-all duration-500"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
