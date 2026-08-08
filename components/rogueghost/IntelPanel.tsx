"use client";

import React, { useState } from 'react';
import { MissionData } from '../../data/missions';

interface IntelPanelProps {
  mission: MissionData;
}

export default function IntelPanel({ mission }: IntelPanelProps) {
  const m = mission;
  const [activeSubTab, setActiveSubTab] = useState<'intel' | 'controls'>('intel');

  return (
    <div className="w-full bg-[#0c0f16]/90 border border-slate-800 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      {/* Tab Switcher Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSubTab('intel')}
            className={`text-xs font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${
              activeSubTab === 'intel'
                ? 'text-[#00f0ff] border-[#00f0ff]'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            📡 FIELD_INTEL
          </button>
          <button
            onClick={() => setActiveSubTab('controls')}
            className={`text-xs font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${
              activeSubTab === 'controls'
                ? 'text-[#00f0ff] border-[#00f0ff]'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            🎮 OPERATIVE_CONTROLS
          </button>
        </div>
        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
          CLASSIFIED UPLINK
        </span>
      </div>

      {activeSubTab === 'intel' ? (
        <div className="space-y-4">
          <div className="space-y-2.5">
            {m.intel.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg border border-slate-900 bg-black/40"
              >
                <span
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 border"
                  style={{
                    color: m.themeColor,
                    borderColor: `${m.themeColor}40`,
                    backgroundColor: `${m.themeColor}10`,
                  }}
                >
                  {idx + 1}
                </span>
                <p className="text-slate-300 text-xs leading-relaxed font-sans uppercase">
                  {item}
                </p>
              </div>
            ))}
          </div>

          {/* Tactical Overhead Map Preview */}
          <div className="rounded-lg overflow-hidden border border-slate-900 mt-3 relative group">
            <div className="text-[8px] font-bold px-3 py-1.5 uppercase tracking-widest bg-black/80 text-slate-400 border-b border-slate-900 flex justify-between items-center">
              <span>◈ TACTICAL OVERHEAD MAP — {m.name}</span>
              <span className="text-[#00f0ff]">GRID {m.code}</span>
            </div>
            <img
              src={m.mapImage}
              alt={`${m.name} overhead map`}
              className="w-full h-36 object-cover filter saturate-120 group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {m.controls.map((ctrl, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-900 bg-black/40"
            >
              <kbd
                className="px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider text-center shrink-0 border"
                style={{
                  backgroundColor: `${m.themeColor}15`,
                  borderColor: `${m.themeColor}40`,
                  color: m.themeColor,
                  minWidth: '55px',
                }}
              >
                {ctrl.key}
              </kbd>
              <span className="text-slate-300 text-xs font-sans uppercase">
                {ctrl.action}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
