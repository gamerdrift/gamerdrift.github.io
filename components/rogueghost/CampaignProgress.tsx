"use client";

import React from 'react';
import { MissionData } from '../../data/missions';

interface CampaignProgressProps {
  missions: MissionData[];
  selectedMissionId: string;
  onSelectMission: (mission: MissionData) => void;
}

export default function CampaignProgress({
  missions,
  selectedMissionId,
  onSelectMission,
}: CampaignProgressProps) {
  return (
    <div className="w-full bg-[#0c0f16]/90 border border-slate-800 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs">🗺️</span>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
            CAMPAIGN_PROGRESSION // SEASON 01
          </h3>
        </div>
        <span className="text-[9px] text-[#00f0ff] font-bold tracking-widest uppercase">
          SECTOR 1 OF {missions.length} ACTIVE
        </span>
      </div>

      {/* Visual Timeline Track */}
      <div className="relative py-4 px-2">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-8 h-0.5 bg-gradient-to-r from-[#00f0ff] to-[#00f0ff]/20 -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: `${Math.max(10, ((missions.findIndex(m => m.id === selectedMissionId) + 1) / missions.length) * 100)}%`,
          }}
        />

        {/* Nodes */}
        <div className="relative z-10 flex justify-between items-center">
          {missions.map((mission, index) => {
            const isSelected = mission.id === selectedMissionId;
            const isAvailable = mission.playable;
            
            return (
              <button
                key={mission.id}
                onClick={() => onSelectMission(mission)}
                className="group flex flex-col items-center focus:outline-none"
              >
                {/* Node Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-[10px] transition-all duration-300 border-2 ${
                    isSelected
                      ? 'scale-110 shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: isSelected
                      ? mission.themeColor
                      : isAvailable
                      ? 'rgba(12,15,22,0.9)'
                      : 'rgba(5,7,10,0.95)',
                    borderColor: isSelected
                      ? '#ffffff'
                      : isAvailable
                      ? mission.themeColor
                      : '#334155',
                    color: isSelected
                      ? '#000000'
                      : isAvailable
                      ? mission.themeColor
                      : '#64748b',
                  }}
                >
                  {isAvailable ? `0${index + 1}` : '🔒'}
                </div>

                {/* Node Label */}
                <div className="mt-2 text-center">
                  <div
                    className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
                      isSelected
                        ? 'text-white'
                        : isAvailable
                        ? 'text-slate-400 group-hover:text-slate-200'
                        : 'text-slate-600'
                    }`}
                  >
                    {mission.name}
                  </div>
                  <div
                    className="text-[7px] font-bold uppercase tracking-widest mt-0.5"
                    style={{
                      color: isAvailable ? mission.themeColor : '#475569',
                    }}
                  >
                    {isAvailable ? 'AVAILABLE' : 'LOCKED'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
