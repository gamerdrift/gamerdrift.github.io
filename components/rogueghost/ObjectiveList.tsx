"use client";

import React from 'react';
import { MissionData } from '../../data/missions';

interface ObjectiveListProps {
  mission: MissionData;
}

export default function ObjectiveList({ mission }: ObjectiveListProps) {
  const m = mission;

  return (
    <div className="w-full bg-[#0c0f16]/90 border border-slate-800 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs">🎯</span>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
            MISSION_OBJECTIVES // DIRECTIVES
          </h3>
        </div>
        <span className="text-[8px] font-bold text-[#00f0ff] uppercase tracking-widest">
          {m.code}
        </span>
      </div>

      {/* Objectives */}
      <div className="space-y-3">
        {m.objectives.map((obj, i) => (
          <div
            key={i}
            className="flex items-start gap-3.5 p-3.5 rounded-lg border bg-black/40 transition-colors"
            style={{
              borderColor: i === 0 ? `${m.themeColor}50` : '#1e293b',
              backgroundColor: i === 0 ? `${m.themeColor}08` : 'rgba(0,0,0,0.4)',
            }}
          >
            {/* Step Badge */}
            <div
              className="w-8 h-8 rounded flex items-center justify-center font-black text-xs shrink-0 border"
              style={{
                borderColor: i === 0 ? m.themeColor : '#334155',
                color: i === 0 ? m.themeColor : '#64748b',
                backgroundColor: i === 0 ? `${m.themeColor}15` : 'transparent',
              }}
            >
              {obj.step}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{obj.icon}</span>
                <span
                  className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded tracking-widest"
                  style={{
                    color:
                      i === 0 ? m.themeColor : i === 1 ? '#94a3b8' : '#a855f7',
                    backgroundColor:
                      i === 0
                        ? `${m.themeColor}15`
                        : i === 1
                        ? 'rgba(148,163,184,0.1)'
                        : 'rgba(168,85,247,0.1)',
                    border: `1px solid ${
                      i === 0
                        ? `${m.themeColor}40`
                        : i === 1
                        ? '#33415580'
                        : '#a855f740'
                    }`,
                  }}
                >
                  {obj.label}
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed font-sans uppercase">
                {obj.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
