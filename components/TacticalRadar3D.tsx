"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import TacticalWorldMap with SSR disabled since Leaflet relies on the browser's 'window' object.
const TacticalWorldMapInstance = dynamic(
  () => import('./TacticalWorldMap'),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[320px] md:h-[460px] flex flex-col items-center justify-center bg-[#05070a] border border-[#00f0ff]/10 p-6 font-mono text-[11px] text-slate-400 rounded-lg overflow-hidden">
        {/* Radar grids back drop */}
        <div className="absolute inset-0 bg-[#07090e] opacity-25 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        
        {/* Scanner Sweep Indicator */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center z-10">
          {/* Pulsing circles */}
          <div className="absolute inset-0 border border-dashed border-[#00f0ff]/40 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-4 border border-[#00f0ff]/20 rounded-full animate-reverse-spin" style={{ animationDuration: '12s' }} />
          <div className="absolute inset-8 border border-dashed border-[#00f0ff]/50 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
          
          {/* Inner pulse */}
          <div className="absolute w-3 h-3 bg-[#00f0ff] rounded-full animate-ping" />
          <div className="absolute w-2 h-2 bg-[#00f0ff] rounded-full" />
        </div>
        
        <div className="font-extrabold tracking-widest text-[#00f0ff] animate-pulse uppercase text-center z-10">
          🛰️ CONNECTING ORBITAL FEED...
        </div>
        <div className="text-[9px] text-slate-600 mt-2.5 uppercase tracking-[0.2em] text-center z-10">
          UPLINK STATUS: SYNCHRONIZING SECURE NODE
        </div>

        {/* Dynamic style tag for spinner animation helpers */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes reverse-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          .animate-reverse-spin {
            animation: reverse-spin linear infinite;
          }
        ` }} />
      </div>
    )
  }
);

export default function TacticalRadar3D() {
  return <TacticalWorldMapInstance />;
}
