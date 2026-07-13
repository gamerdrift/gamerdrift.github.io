import React from 'react';
import Link from 'next/link';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'eSports - GamerDrift',
  description: 'Explore the GamerDrift eSports experience and competitive highlights.',
};

const FEATURED_ESPORTS = [
  {
    id: 'chess-master',
    title: 'Chess Master',
    subtitle: 'Premium tactical chess with AI, cinematic HUDs, and touch-ready controls.',
    badge: 'NEW • PLAYABLE',
    image: '/games/chess-poster.svg',
  },
];

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

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-[#00f0ff]/20 bg-black/35 overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.08)]">
            <div className="relative h-[320px] md:h-[430px]">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/games/chess-poster.svg')" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute left-6 top-6 rounded-full border border-[#00f0ff]/40 bg-[#00f0ff]/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.3em] text-[#00f0ff]">
                {FEATURED_ESPORTS[0].badge}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.12em]">{FEATURED_ESPORTS[0].title}</h2>
                <p className="mt-3 max-w-xl text-sm md:text-base text-slate-300 leading-7">{FEATURED_ESPORTS[0].subtitle}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/play/chess-master" className="rounded-full bg-[#00f0ff] px-5 py-2.5 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:scale-[1.02]">
                    Play now
                  </Link>
                  <a href="/games/chess-master.html" target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black uppercase tracking-[0.2em] text-white/80 transition hover:border-[#00f0ff] hover:text-[#00f0ff]">
                    Open full screen
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
            <div className="text-[#00f0ff] font-mono text-xs uppercase tracking-[0.3em]">Tournament Briefing</div>
            <h3 className="mt-3 text-xl font-black uppercase tracking-[0.16em]">Premium competitive deck</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              GamerDrift now hosts a premium chess experience where players can take on a sharp AI opponent, challenge their tactics, and play comfortably on mobile, tablet, or desktop.
            </p>
            <div className="mt-6 space-y-3">
              {['Adaptive AI', 'Mobile-ready board', 'Cinematic eSports visuals', 'Instant rematch'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
