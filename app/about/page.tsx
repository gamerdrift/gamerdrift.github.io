"use client";

import React from 'react';

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-black relative font-mono text-xs text-slate-300">
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto relative z-10 space-y-10">
        
        {/* Header */}
        <div className="border-b border-[#00f0ff]/20 pb-4 flex justify-between items-end">
          <div>
            <span className="text-[10px] text-[#ff9f00] tracking-[0.3em] block mb-1">STUDIO SPECIFICATIONS DOSSIER</span>
            <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase">ABOUT_GAMERDRIFT</h1>
          </div>
          <span className="text-[9px] border border-[#00f0ff]/20 bg-[#00f0ff]/5 px-3 py-1 text-[#00f0ff]">
            INTEL_STATUS: CLASSIFIED
          </span>
        </div>

        {/* Mission Dossier */}
        <div className="hud-panel p-6 space-y-4">
          <h2 className="text-sm font-extrabold text-[#00f0ff] uppercase tracking-wider">// PLATFORM_MISSION</h2>
          <p className="text-[11px] text-slate-400 leading-relaxed uppercase">
            GAMERDRIFT WAS FOUNDED IN 2026 AS AN ELITE EXPERIMENTAL AAA WEB STUDIOS PROJECT. OUR OBJECTIVE IS TO MERGE HIGH-FIDELITY tactical dashboard UX WITH LOW-LATENCY BROWSER GAMING PACKETS.
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed uppercase">
            WE STRIVE TO REMOVE BROWSER BOUNDARIES. BY PACKAGING DYNAMIC GRAPHICS, SECURE PERSISTENCE SHEETS, AND ADVANCED CANVAS ALGORITHMS, WE BRING ARCADE CABINET INTENSITY DIRECTLY TO YOUR DESKTOP AND MOBILE NODES.
          </p>
        </div>

        {/* Platform blueprints - simulated system specifications */}
        <div className="hud-panel p-6">
          <h2 className="text-sm font-extrabold text-[#ff9f00] uppercase tracking-wider mb-4">// COMMAND_CENTER_BLUEPRINTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/40 border border-slate-900 p-4">
              <span className="text-white font-bold block mb-1 uppercase">CLIENT_NODES</span>
              <p className="text-[10px] text-slate-500 leading-relaxed uppercase">
                BUILT ON THE NEXT.JS APP ROUTER FRAMEWORK, COMPILED VIA TSX COMPILER ENGINES FOR EXTREME CLIENT SPEED.
              </p>
            </div>
            <div className="bg-black/40 border border-slate-900 p-4">
              <span className="text-white font-bold block mb-1 uppercase">MOBILE_ADAPTER</span>
              <p className="text-[10px] text-slate-500 leading-relaxed uppercase">
                INTEGRATED PWA SERVICE WORKERS CACHE CORE PACKETS, PREPARING INTEL FOR ANDROID AND IOS SHELL DEPLOYMENT.
              </p>
            </div>
            <div className="bg-black/40 border border-slate-900 p-4">
              <span className="text-white font-bold block mb-1 uppercase">DATABASE_SHIELD</span>
              <p className="text-[10px] text-slate-500 leading-relaxed uppercase">
                SUPABASE POSTGRESQL INTEGRATION PROVIDES REAL-TIME RECORD PERSISTENCE FOR DRIFTER RANKS AND SCORE SHEETS.
              </p>
            </div>
          </div>
        </div>

        {/* Crew dossier */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-900 pb-2">
            // OPERATIONAL_CREW_DOSSIER
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="hud-panel p-5 bg-black/40">
              <span className="text-[9px] text-[#ff9f00] uppercase block">GySOP / ARCHITECT</span>
              <span className="text-sm font-extrabold text-white uppercase block mt-1">Eva_Shaikh</span>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed uppercase">
                OVERSEES CORE TELEMETRY SYSTEMS, WEBGL ENGINE COUPLING, AND COMMAND CENTER INTERFACES.
              </p>
            </div>
            
            <div className="hud-panel p-5 bg-black/40">
              <span className="text-[9px] text-[#00f0ff] uppercase block">TACTICAL DESIGNER</span>
              <span className="text-sm font-extrabold text-white uppercase block mt-1">Ayaan_Shaikh</span>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed uppercase">
                CRAFTED THE TACTICAL AMBER HUD GRID SYSTEM, COMPONENT BLUEPRINTS, AND RACING PHYSICS LOOPS.
              </p>
            </div>

            <div className="hud-panel p-5 bg-black/40">
              <span className="text-[9px] text-[#39ff14] uppercase block">DEV OPERATIVE</span>
              <span className="text-sm font-extrabold text-white uppercase block mt-1">Jafer_Shaikh</span>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed uppercase">
                TRAINED ROGUEGHOST ADAPTIVE Guard AGENTS AND DEVELOPED SECURE DATABASE SHEETS.
              </p>
            </div>
          </div>
        </div>

        {/* Development logs timeline */}
        <div className="hud-panel p-6">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">// HISTORICAL_TRANSMISSION_LOGS</h2>
          <div className="space-y-4 border-l border-[#00f0ff]/20 pl-4 ml-2">
            <div className="relative">
              <span className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-[#00f0ff] border border-black shadow-[0_0_8px_rgba(0,240,255,0.8)]"></span>
              <span className="text-[9px] text-slate-500 font-bold block">2026.06.04 // CURRENT</span>
              <span className="text-white font-bold block uppercase mt-0.5">LAUNCHED COMMAND HUB v2.6</span>
              <p className="text-[10px] text-slate-500 mt-1 uppercase">ESTABLISHED SECURE AUTHENTICATION TERMINALS, ADDED NEWS DECK, STORE MODULES, AND PLAYABLE MINIGAMES.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-[#ff9f00] border border-black"></span>
              <span className="text-[9px] text-slate-500 font-bold block">2026.05.15</span>
              <span className="text-white font-bold block uppercase mt-0.5">COMPLETED ROGUEGHOST AI ENGINES</span>
              <p className="text-[10px] text-slate-500 mt-1 uppercase">INTEGRATED ADAPTIVE PATROL PATHS AND HOSTAGE EXTRACTION BLUEPRINTS ON Forestfun MAP.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-slate-700 border border-black"></span>
              <span className="text-[9px] text-slate-500 font-bold block">2026.05.01</span>
              <span className="text-white font-bold block uppercase mt-0.5">ESTABLISHED PLATFORM ARCHITECTURE</span>
              <p className="text-[10px] text-slate-500 mt-1 uppercase">INITIALIZED MAIN COMMAND GRID FRAMEWORK, ROUTING MATRIX, AND CORE THEME SETTINGS.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
