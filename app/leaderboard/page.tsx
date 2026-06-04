"use client";

import React, { useState } from 'react';

interface Entry {
  rank: number;
  name: string;
  score: string;
  subText: string;
  metric: string;
}

const racerData: Record<string, Entry[]> = {
  'ALL-TIME': [
    { rank: 1, name: 'Hex_Netrunner', score: '98,400 pts', subText: 'CAPTAIN WHISKERS // SPEED_VORTEX', metric: 'SPEED: 280mph' },
    { rank: 2, name: 'Desert_Fox', score: '88,100 pts', subText: 'LT. PURR // AMBER_SHIELD', metric: 'SPEED: 245mph' },
    { rank: 3, name: 'ClawSlayer', score: '79,300 pts', subText: 'SERGEANT CLAW // DRIFT_PRO', metric: 'SPEED: 235mph' }
  ],
  'WEEKLY': [
    { rank: 1, name: 'Desert_Fox', score: '24,500 pts', subText: 'LT. PURR // AMBER_SHIELD', metric: 'SPEED: 250mph' },
    { rank: 2, name: 'Hex_Netrunner', score: '22,100 pts', subText: 'CAPTAIN WHISKERS // SPEED_VORTEX', metric: 'SPEED: 275mph' }
  ],
  'MONTHLY': [
    { rank: 1, name: 'Hex_Netrunner', score: '82,400 pts', subText: 'CAPTAIN WHISKERS // SPEED_VORTEX', metric: 'SPEED: 280mph' },
    { rank: 2, name: 'Desert_Fox', score: '74,900 pts', subText: 'LT. PURR // AMBER_SHIELD', metric: 'SPEED: 245mph' }
  ]
};

const operatorData: Record<string, Entry[]> = {
  'ALL-TIME': [
    { rank: 1, name: 'GhostInGrid', score: '142,500 pts', subText: 'SNOWBLOW EXTRACTION // SILENT', metric: 'HOSTAGES: 12/12' },
    { rank: 2, name: 'ViperTactical', score: '124,000 pts', subText: 'CARGOLOGY PURGE // COMBAT', metric: 'HOSTAGES: 10/12' },
    { rank: 3, name: 'Hex_Netrunner', score: '118,200 pts', subText: 'SANDBATH RECOVERY // STEALTH', metric: 'HOSTAGES: 9/12' }
  ],
  'WEEKLY': [
    { rank: 1, name: 'Hex_Netrunner', score: '38,500 pts', subText: 'SANDBATH RECOVERY // STEALTH', metric: 'HOSTAGES: 3/3' },
    { rank: 2, name: 'GhostInGrid', score: '36,200 pts', subText: 'SNOWBLOW EXTRACTION // SILENT', metric: 'HOSTAGES: 3/3' }
  ],
  'MONTHLY': [
    { rank: 1, name: 'GhostInGrid', score: '125,000 pts', subText: 'SNOWBLOW EXTRACTION // SILENT', metric: 'HOSTAGES: 9/9' },
    { rank: 2, name: 'ViperTactical', score: '108,200 pts', subText: 'CARGOLOGY PURGE // COMBAT', metric: 'HOSTAGES: 8/9' }
  ]
};

const clanData: Record<string, Entry[]> = {
  'ALL-TIME': [
    { rank: 1, name: 'Ghost Squad Tactical', score: 'GST', subText: '42 MEMBERS // LVL 15', metric: 'WAR_CREDITS: 52,000' },
    { rank: 2, name: 'Desert Cat Racers', score: 'DCR', subText: '38 MEMBERS // LVL 14', metric: 'WAR_CREDITS: 46,500' },
    { rank: 3, name: 'Cyber Intel Syndicate', score: 'CIS', subText: '29 MEMBERS // LVL 12', metric: 'WAR_CREDITS: 32,000' }
  ],
  'WEEKLY': [
    { rank: 1, name: 'Desert Cat Racers', score: 'DCR', subText: '38 MEMBERS // LVL 14', metric: 'WAR_CREDITS: 12,000' },
    { rank: 2, name: 'Ghost Squad Tactical', score: 'GST', subText: '42 MEMBERS // LVL 15', metric: 'WAR_CREDITS: 11,500' }
  ],
  'MONTHLY': [
    { rank: 1, name: 'Ghost Squad Tactical', score: 'GST', subText: '42 MEMBERS // LVL 15', metric: 'WAR_CREDITS: 42,000' },
    { rank: 2, name: 'Desert Cat Racers', score: 'DCR', subText: '38 MEMBERS // LVL 14', metric: 'WAR_CREDITS: 38,900' }
  ]
};

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<'ALL-TIME' | 'WEEKLY' | 'MONTHLY'>('ALL-TIME');
  const [category, setCategory] = useState<'racers' | 'operators' | 'clans'>('racers');

  const getActiveData = (): Entry[] => {
    const db = category === 'racers' 
      ? racerData 
      : category === 'operators' 
      ? operatorData 
      : clanData;
    return db[timeframe] || [];
  };

  const activeEntries = getActiveData();

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-black relative font-mono text-xs text-slate-300">
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="border-b border-[#00f0ff]/20 pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-[10px] text-[#ff9f00] tracking-[0.3em] block mb-1">GLOBAL SCORE REGISTRY</span>
            <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase">LEADERBOARDS</h1>
          </div>
          <span className="text-[9px] border border-[#00f0ff]/20 bg-[#00f0ff]/5 px-3 py-1 text-[#00f0ff]">
            RECORD_INTEGRITY: SECURE // ZERO_LATENCY
          </span>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          
          {/* Category Tabs */}
          <div className="flex border border-slate-900 bg-black/40 p-1">
            {[
              { id: 'racers', label: 'TOP_RACERS' },
              { id: 'operators', label: 'TOP_OPERATORS' },
              { id: 'clans', label: 'CLAN_RANKINGS' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as any)}
                className={`px-3 py-1.5 font-bold uppercase transition-all ${
                  category === cat.id
                    ? 'bg-[#00f0ff]/10 text-[#00f0ff]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Timeframe Selectors */}
          <div className="flex border border-slate-900 bg-black/40 p-1">
            {['ALL-TIME', 'WEEKLY', 'MONTHLY'].map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t as any)}
                className={`px-3 py-1.5 font-bold uppercase transition-all ${
                  timeframe === t
                    ? 'bg-[#ff9f00]/10 text-[#ff9f00]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

        </div>

        {/* Leaderboard Table List */}
        <div className="flex flex-col gap-4">
          {activeEntries.map(entry => {
            const isFirst = entry.rank === 1;
            const isSecond = entry.rank === 2;
            const isThird = entry.rank === 3;

            let borderGlow = 'border-slate-900';
            let rankGlow = 'text-slate-400 border-slate-800';
            let titleColor = 'text-white';

            if (isFirst) {
              borderGlow = 'border-[#ff9f00]/50 shadow-[0_0_12px_rgba(255,159,0,0.15)]';
              rankGlow = 'bg-[#ff9f00]/10 border-[#ff9f00]/40 text-[#ff9f00]';
              titleColor = 'text-[#ff9f00] font-extrabold';
            } else if (isSecond) {
              borderGlow = 'border-[#00f0ff]/40 shadow-[0_0_12px_rgba(0,240,255,0.15)]';
              rankGlow = 'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]';
              titleColor = 'text-[#00f0ff]';
            } else if (isThird) {
              borderGlow = 'border-[#39ff14]/30';
              rankGlow = 'bg-[#39ff14]/10 border-[#39ff14]/20 text-[#39ff14]';
              titleColor = 'text-[#39ff14]';
            }

            return (
              <div 
                key={entry.name}
                className={`hud-panel p-4 flex flex-col sm:flex-row justify-between items-center gap-4 ${borderGlow}`}
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  
                  {/* Rank circle */}
                  <div className={`w-8 h-8 border flex items-center justify-center font-bold font-sans text-xs ${rankGlow}`}>
                    #{entry.rank}
                  </div>

                  {/* Name and SubText */}
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold uppercase tracking-wide ${titleColor}`}>{entry.name}</span>
                    <span className="text-[9px] text-slate-500 uppercase mt-0.5">{entry.subText}</span>
                  </div>

                </div>

                {/* Metric and highscore values */}
                <div className="flex justify-between sm:justify-end items-center gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-900 pt-3.5 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-slate-600 block text-[8px] uppercase">OPERATIONAL_METRIC</span>
                    <span className="text-slate-400 font-bold uppercase">{entry.metric}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-600 block text-[8px] uppercase">SCORE_VALUE</span>
                    <span className="text-white font-extrabold text-sm tracking-wider">{entry.score}</span>
                  </div>
                </div>

              </div>
            );
          })}

          {activeEntries.length === 0 && (
            <div className="text-center py-10 border border-slate-900 text-slate-600">
              NO COMPILATION LOGS AVAILABLE FOR THIS TIMEFRAME CORE.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
