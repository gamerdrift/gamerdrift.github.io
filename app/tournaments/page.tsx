"use client";

import React, { useState } from 'react';

interface Tournament {
  id: string;
  title: string;
  game: string;
  prizePool: string;
  startDate: string;
  status: 'Registration Open' | 'In Progress' | 'Completed';
  bracketType: string;
  registeredCount: number;
}

const mockTournaments: Tournament[] = [
  { id: 't-1', title: 'CunningCats Nitro Grand Prix', game: 'CunningCats', prizePool: '$5,000 Credits', startDate: '2026-06-15', status: 'Registration Open', bracketType: 'Double Elimination', registeredCount: 28 },
  { id: 't-2', title: 'RogueGhost Shadow extraction', game: 'RogueGhost', prizePool: '$10,000 Credits', startDate: '2026-06-20', status: 'Registration Open', bracketType: 'Single Elimination', registeredCount: 16 },
  { id: 't-3', title: 'Decentralized Retro Cup', game: 'Retro Racer / Space Invaders', prizePool: '$2,500 Credits', startDate: '2026-06-01', status: 'In Progress', bracketType: 'Swiss Round', registeredCount: 64 }
];

export default function TournamentsPage() {
  const [registeredList, setRegisteredList] = useState<string[]>([]);
  const [selectedTourney, setSelectedTourney] = useState<Tournament | null>(null);

  const handleRegister = (tourneyId: string) => {
    setRegisteredList(prev => [...prev, tourneyId]);
    setSelectedTourney(null);
  };

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-black relative font-mono text-xs text-slate-300">
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="border-b border-[#00f0ff]/20 pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-[10px] text-[#ff9f00] tracking-[0.3em] block mb-1">DRIFTER COMBAT BRACKETS</span>
            <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase">TOURNAMENTS</h1>
          </div>
          <span className="text-[9px] border border-[#00f0ff]/20 bg-[#00f0ff]/5 px-3 py-1 text-[#00f0ff]">
            ESPORTS_NETWORK: SYNCED
          </span>
        </div>

        {/* Tournaments Grid list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {mockTournaments.map(t => {
            const isReg = registeredList.includes(t.id);
            return (
              <div key={t.id} className="hud-panel p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[8px] text-[#ff9f00] uppercase tracking-wider font-bold border border-[#ff9f00]/30 px-1">{t.game}</span>
                    <span className={`text-[8px] uppercase ${t.status === 'Registration Open' ? 'text-[#39ff14]' : t.status === 'In Progress' ? 'text-[#00f0ff] animate-pulse' : 'text-slate-500'}`}>{t.status}</span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-white uppercase font-sans mb-3 leading-snug">{t.title}</h3>
                  
                  <div className="space-y-1.5 text-[10px] text-slate-400">
                    <div>PRIZEPOOL: <span className="text-[#39ff14] font-bold">{t.prizePool}</span></div>
                    <div>START_TIME: <span className="font-bold text-white">{t.startDate}</span></div>
                    <div>BRACKETING: <span className="font-bold text-white">{t.bracketType}</span></div>
                    <div>REGISTRATION: <span className="font-bold text-white">{t.registeredCount} / 64 Drifters</span></div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-900 flex justify-between items-center gap-2">
                  {t.status === 'Registration Open' ? (
                    isReg ? (
                      <span className="text-[#39ff14] text-[9px] uppercase tracking-wider font-bold">✓ SECURED_SLOT</span>
                    ) : (
                      <button 
                        onClick={() => setSelectedTourney(t)}
                        className="hud-btn px-3 py-1.5 text-[9px] w-full"
                      >
                        RESERVE_SLOT
                      </button>
                    )
                  ) : (
                    <span className="text-slate-500 text-[9px] uppercase">LOBBIES_LOCKED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* LIVE TOURNAMENT BRACKET DISPLAY */}
        <div className="hud-panel p-5">
          <h3 className="text-sm font-bold text-white border-b border-[#00f0ff]/20 pb-2 mb-6 uppercase tracking-wider">
            LIVE_BRACKET_TELEMETRY: RETRO_CUP_ Swiss
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Round 1 (Quarterfinals) */}
            <div className="flex flex-col gap-8">
              <span className="text-slate-500 uppercase tracking-widest text-[9px]">QUARTERFINALS</span>
              
              <div className="bg-black/60 border border-slate-900 p-2 flex flex-col gap-1 relative">
                <div className="flex justify-between items-center text-white">
                  <span className="font-bold">1. Hex_Netrunner</span>
                  <span className="text-[#39ff14] font-bold">2</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>8. CipherZero</span>
                  <span>0</span>
                </div>
                <div className="absolute right-0 top-1/2 w-4 h-0.5 bg-[#00f0ff] translate-x-4"></div>
              </div>

              <div className="bg-black/60 border border-slate-900 p-2 flex flex-col gap-1 relative">
                <div className="flex justify-between items-center text-slate-500">
                  <span>4. DriftMaster99</span>
                  <span>1</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span className="font-bold">5. NeoCreator</span>
                  <span className="text-[#39ff14] font-bold">2</span>
                </div>
                <div className="absolute right-0 top-1/2 w-4 h-0.5 bg-[#00f0ff] translate-x-4"></div>
              </div>
            </div>

            {/* Round 2 (Semifinals) */}
            <div className="flex flex-col gap-16 md:pl-4">
              <span className="text-[#ff9f00] uppercase tracking-widest text-[9px]">SEMIFINAL LOBBY</span>
              
              <div className="bg-black/60 border border-[#00f0ff]/40 p-2 flex flex-col gap-1 relative">
                <div className="flex justify-between items-center text-[#00f0ff]">
                  <span className="font-bold">Hex_Netrunner</span>
                  <span className="animate-pulse font-mono font-bold">LIVE</span>
                </div>
                <div className="flex justify-between items-center text-[#00f0ff]">
                  <span className="font-bold">NeoCreator</span>
                  <span className="animate-pulse font-mono font-bold">LIVE</span>
                </div>
                <div className="absolute left-0 top-1/4 w-4 h-0.5 bg-[#00f0ff] -translate-x-4"></div>
                <div className="absolute left-0 top-3/4 w-4 h-0.5 bg-[#00f0ff] -translate-x-4"></div>
                <div className="absolute right-0 top-1/2 w-4 h-0.5 bg-[#ff9f00] translate-x-4"></div>
              </div>
            </div>

            {/* Round 3 (Finals) */}
            <div className="flex flex-col gap-8 md:pl-4">
              <span className="text-[#39ff14] uppercase tracking-widest text-[9px]">FINALS CHAMPION</span>
              
              <div className="bg-black/80 border border-[#ff9f00] p-4 flex flex-col items-center justify-center text-center gap-1.5 relative">
                <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-[#ff9f00] -translate-x-4"></div>
                <div className="text-3xl">🏆</div>
                <span className="text-white font-extrabold tracking-widest uppercase">SECURE_CHAMPION</span>
                <span className="text-slate-500 uppercase text-[9px]">TBD // PENDING_MATCH</span>
              </div>
            </div>

          </div>
        </div>

        {/* Signup confirmation modal */}
        {selectedTourney && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="hud-panel max-w-sm w-full bg-[#0c0f16] p-6 relative">
              <button 
                onClick={() => setSelectedTourney(null)}
                className="absolute top-4 right-4 w-7 h-7 border border-[#ff9f00]/30 text-[#ff9f00] flex items-center justify-center font-bold hover:bg-[#ff9f00]/10"
              >
                ✕
              </button>

              <h2 className="text-sm font-extrabold text-white border-b border-slate-900 pb-2 mb-4 uppercase tracking-wider">
                TOURNAMENT_INTAKE_REGISTRATION
              </h2>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-4 uppercase">
                Uplink details for <span className="text-white font-bold">{selectedTourney.title}</span>. Entering this queue logs your drifter tags onto active match schedules.
              </p>

              <div className="flex flex-col gap-3 font-mono text-[10px]">
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span>PRIZEPOOL</span>
                  <span className="text-[#39ff14] font-bold">{selectedTourney.prizePool}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span>DISPATCH_GATE</span>
                  <span className="text-white">{selectedTourney.bracketType}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setSelectedTourney(null)}
                  className="w-1/2 border border-slate-800 text-slate-500 text-center py-2 uppercase font-bold"
                >
                  ABORT
                </button>
                <button 
                  onClick={() => handleRegister(selectedTourney.id)}
                  className="w-1/2 bg-[#00f0ff] text-black text-center py-2 uppercase font-bold tracking-wider"
                >
                  SECURE_SLOT
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
