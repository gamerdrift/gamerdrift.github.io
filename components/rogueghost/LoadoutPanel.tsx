"use client";

import React from 'react';
import { MissionData } from '../../data/missions';

interface LoadoutPanelProps {
  mission: MissionData;
}

export default function LoadoutPanel({ mission }: LoadoutPanelProps) {
  const loadout = mission.recommendedLoadout;

  const items = [
    {
      slot: 'PRIMARY WEAPON',
      name: loadout.primary,
      icon: '🎯',
      specs: '3-Round Burst • Integrated Laser • DMR Scope',
      status: 'EQUIPPED',
      color: '#00f0ff',
    },
    {
      slot: 'SECONDARY WEAPON',
      name: loadout.secondary,
      icon: '🔫',
      specs: '9mm Suppressed Subsonic • High Capacity Clip',
      status: 'READY',
      color: '#ff9f00',
    },
    {
      slot: 'TACTICAL OPTICS',
      name: loadout.tactical,
      icon: '🕶️',
      specs: 'Thermal Goggles [T] • Night Vision [N]',
      status: 'ACTIVE',
      color: '#4ade80',
    },
    {
      slot: 'STEALTH EQUIPMENT',
      name: loadout.equipment,
      icon: '🛡️',
      specs: 'Signal Jammer • Lightweight Ballistic Armor',
      status: 'MOUNTED',
      color: '#a855f7',
    },
  ];

  return (
    <div className="w-full bg-[#0c0f16]/90 border border-slate-800 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs">⚔️</span>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
            TACTICAL_LOADOUT // CONFIGURATION
          </h3>
        </div>
        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
          MISSION RECOMMENDED
        </span>
      </div>

      {/* Grid of Slots */}
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 bg-black/40 border border-slate-900 p-2.5 rounded-lg hover:border-slate-800 transition-colors group"
          >
            <div
              className="w-9 h-9 rounded flex items-center justify-center text-base shrink-0 border"
              style={{
                borderColor: `${item.color}40`,
                backgroundColor: `${item.color}10`,
              }}
            >
              {item.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-500 tracking-wider uppercase">
                  {item.slot}
                </span>
                <span
                  className="text-[7px] font-extrabold uppercase px-1.5 py-0.2 rounded"
                  style={{
                    color: item.color,
                    backgroundColor: `${item.color}15`,
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  {item.status}
                </span>
              </div>
              <div className="text-xs font-bold text-white tracking-wide uppercase truncate mt-0.5">
                {item.name}
              </div>
              <div className="text-[8px] text-slate-500 font-sans truncate">
                {item.specs}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
