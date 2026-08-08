"use client";

import React from 'react';
import { MissionData } from '../../data/missions';

interface MissionSelectorCardProps {
  mission: MissionData;
  isSelected: boolean;
  onSelect: (mission: MissionData) => void;
}

export default function MissionSelectorCard({
  mission,
  isSelected,
  onSelect,
}: MissionSelectorCardProps) {
  const m = mission;

  return (
    <button
      onClick={() => onSelect(m)}
      className={`w-full text-left relative overflow-hidden rounded-xl border-2 transition-all duration-300 group ${
        isSelected
          ? 'scale-[1.02] shadow-[0_0_25px_rgba(0,240,255,0.25)]'
          : 'opacity-75 hover:opacity-100 hover:scale-[1.01]'
      }`}
      style={{
        borderColor: isSelected ? m.themeColor : '#1e293b',
        backgroundColor: '#0c0f16',
      }}
    >
      {/* Thumbnail Container */}
      <div className="relative h-32 overflow-hidden w-full">
        <img
          src={m.mapImage}
          alt={m.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ filter: 'saturate(1.1) contrast(1.05)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f16] via-[#0c0f16]/60 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border shadow"
            style={{
              backgroundColor: m.playable
                ? `${m.themeColor}25`
                : 'rgba(15,23,42,0.85)',
              borderColor: m.playable ? m.themeColor : '#334155',
              color: m.playable ? m.themeColor : '#64748b',
            }}
          >
            {m.playable ? '● AVAILABLE' : '🔒 LOCKED'}
          </span>
        </div>

        {/* Season Badge */}
        <div className="absolute top-2.5 left-2.5 text-[7px] text-slate-400 font-bold uppercase tracking-widest z-10 bg-black/60 px-2 py-0.5 rounded border border-slate-800">
          {m.season}
        </div>

        {/* Locked Overlay */}
        {!m.playable && (
          <div className="absolute inset-0 bg-[#05070a]/75 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="text-[9px] font-black tracking-[0.25em] text-slate-400 border border-slate-700 px-3 py-1 bg-slate-900/80 rounded uppercase">
              SECTOR CLASSIFIED
            </span>
          </div>
        )}
      </div>

      {/* Card Info Footer */}
      <div className="p-3.5 bg-[#0c0f16]">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
              {m.code} // {m.operation}
            </div>
            <div
              className="font-black text-base tracking-wider uppercase mt-0.5"
              style={{ color: isSelected ? m.themeColor : '#ffffff' }}
            >
              {m.name}
            </div>
            <div className="text-[9px] text-slate-400 uppercase line-clamp-1 font-sans">
              {m.subtitle}
            </div>
          </div>

          <div className="text-right text-[8px] shrink-0 ml-2">
            <div className="text-slate-500 uppercase font-bold">THREAT</div>
            <div
              className="font-black text-xs uppercase"
              style={{
                color:
                  m.threat === 'EXTREME'
                    ? '#ff4444'
                    : m.threat === 'VERY HIGH'
                    ? '#ff6600'
                    : '#ff9f00',
              }}
            >
              {m.threat}
            </div>
          </div>
        </div>
      </div>

      {/* Active Bar Indicator */}
      {isSelected && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            backgroundColor: m.themeColor,
            boxShadow: `0 0 10px ${m.themeColor}`,
          }}
        />
      )}
    </button>
  );
}
