import React from 'react';
import Footer from '../../components/Footer';
import type { GameMetadata } from '../../components/GameGridTile';

export const metadata = {
  title: 'eSports - GamerDrift',
  description: 'Explore the GamerDrift eSports experience and upcoming competitive highlights.',
};

const MOCK_GAMES: GameMetadata[] = [];

export default function MoreGamesPage() {
  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-[#00f0ff]/30 flex flex-col relative overflow-hidden">
      {/* Tactical Background Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#00f0ff15 1px, transparent 1px), linear-gradient(90deg, #00f0ff15 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00f0ff]/10 blur-[120px] pointer-events-none rounded-full" />

      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Page Title & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-[#00f0ff]/30 pb-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-2 w-2 bg-[#00f0ff] animate-pulse" />
              <span className="text-[#00f0ff] font-mono text-sm tracking-[0.2em] uppercase">Global Database</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#ff9f00]">eSports</span>
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl font-mono text-xs">
              THIS SPACE IS NOW RESERVED FOR THE GAMERDRIFT ESPORTS EXPERIENCE. LIVE COMPETITIONS, HIGHLIGHTS, AND FUTURE EVENTS WILL APPEAR HERE.
            </p>
          </div>
          <div className="mt-4 md:mt-0 font-mono text-right hidden sm:block">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Available Titles</div>
            <div className="text-2xl font-bold text-white">100+</div>
          </div>
        </div>

        {/* Filters (Mock) */}
        <div className="flex flex-wrap gap-2 mb-8 font-mono text-xs">
          {['ALL', 'ACTION', 'RPG', 'SHOOTER', 'STRATEGY', 'RACING'].map((filter, i) => (
            <button 
              key={filter}
              className={`px-4 py-1.5 border transition-all uppercase tracking-wider ${
                i === 0 
                  ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'border-slate-800 text-slate-400 hover:border-[#00f0ff]/50 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Empty eSports State */}
        <div className="rounded-2xl border border-[#00f0ff]/20 bg-black/30 p-10 text-center">
          <div className="text-[#00f0ff] font-mono text-sm uppercase tracking-[0.25em] mb-3">Live roster status</div>
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-3">No live eSports titles are active right now</h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-mono text-xs leading-6">
            The eSports section is currently being refreshed for upcoming tournaments, live events, and competitive drops. Check back soon for the next briefing.
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}
