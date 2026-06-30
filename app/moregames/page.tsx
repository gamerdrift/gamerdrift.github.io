import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import GameGridTile, { GameMetadata } from '../../components/GameGridTile';

export const metadata = {
  title: 'More Games - GamerDrift',
  description: 'Explore a curated list of high-definition AAA games on GamerDrift.',
};

// Mock data using the generated posters
const MOCK_GAMES: GameMetadata[] = [
  {
    id: 'cyber-runner',
    name: 'CYBER RUNNER 2077',
    subtitle: 'Neon City Streets - Action RPG',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#00f0ff',
    image: '/cyberpunk.png',
    themeColor: '#00f0ff',
    threat: 'HIGH',
    enemies: 'CYBORGS, GANGS',
    objective: 'INFILTRATE MEGACORP HQ',
  },
  {
    id: 'star-vanguard',
    name: 'STAR VANGUARD',
    subtitle: 'Deep Space Combat Simulator',
    status: 'BETA // EARLY ACCESS',
    statusColor: '#ff9f00',
    image: '/scifi.png',
    themeColor: '#ff9f00',
    threat: 'EXTREME',
    enemies: 'ALIEN ARMADA',
    objective: 'DEFEND THE ORBITAL STATION',
  },
  {
    id: 'dragon-slayer',
    name: 'ELDER QUEST',
    subtitle: 'Dark Fantasy Open World',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#a855f7',
    image: '/fantasy.png',
    themeColor: '#a855f7',
    threat: 'VERY HIGH',
    enemies: 'UNDEAD, DRAGONS',
    objective: 'SLAY THE ANCIENT WYRM',
  },
  {
    id: 'tactical-ops',
    name: 'BLACKSITE: ZERO',
    subtitle: 'Tier 1 Tactical Shooter',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '/tactical.png',
    themeColor: '#39ff14',
    threat: 'LETHAL',
    enemies: 'HOSTILE MERCENARIES',
    objective: 'RESCUE HVT & EXTRACT',
  },
  // Repeating some games to fill the grid up to 10 as requested
  {
    id: 'cyber-runner-2',
    name: 'NEON SYNDICATE',
    subtitle: 'Underground Street Racing',
    status: 'COMING SOON',
    statusColor: '#ff0055',
    image: '/cyberpunk.png',
    themeColor: '#ff0055',
    threat: 'MODERATE',
    enemies: 'RIVAL RACERS',
    objective: 'WIN THE GRAND PRIX',
  },
  {
    id: 'star-vanguard-2',
    name: 'VOID WALKER',
    subtitle: 'Space Exploration Survival',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#00f0ff',
    image: '/scifi.png',
    themeColor: '#00f0ff',
    threat: 'HIGH',
    enemies: 'ENVIRONMENT, PIRATES',
    objective: 'SURVIVE THE NEBULA',
  },
  {
    id: 'dragon-slayer-2',
    name: 'BLOOD & STEEL',
    subtitle: 'Medieval Combat Simulator',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#ff9f00',
    image: '/fantasy.png',
    themeColor: '#ff9f00',
    threat: 'VERY HIGH',
    enemies: 'ARMORED KNIGHTS',
    objective: 'CONQUER THE CASTLE',
  },
  {
    id: 'tactical-ops-2',
    name: 'GHOST RECON: ELITE',
    subtitle: 'Covert Operations',
    status: 'ALPHA // TESTING',
    statusColor: '#a855f7',
    image: '/tactical.png',
    themeColor: '#a855f7',
    threat: 'EXTREME',
    enemies: 'ROGUE AGENTS',
    objective: 'SECURE THE INTEL',
  },
  {
    id: 'cyber-runner-3',
    name: 'GLITCH IN THE SYSTEM',
    subtitle: 'Cyberpunk Puzzle Platformer',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '/cyberpunk.png',
    themeColor: '#39ff14',
    threat: 'LOW',
    enemies: 'SECURITY DRONES',
    objective: 'HACK THE MAINFRAME',
  },
  {
    id: 'star-vanguard-3',
    name: 'GALACTIC EMPIRE',
    subtitle: '4X Grand Strategy',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#ff0055',
    image: '/scifi.png',
    themeColor: '#ff0055',
    threat: 'HIGH',
    enemies: 'RIVAL FACTIONS',
    objective: 'CONQUER THE GALAXY',
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

      <Header />
      
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Page Title & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-[#00f0ff]/30 pb-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-2 w-2 bg-[#00f0ff] animate-pulse" />
              <span className="text-[#00f0ff] font-mono text-sm tracking-[0.2em] uppercase">Global Database</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              MORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#ff9f00]">GAMES</span>
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl font-mono text-xs">
              BROWSE OUR EXPANDING ROSTER OF HIGH-DEFINITION TITLES. ENGAGE IN VARIOUS COMBAT SCENARIOS, EXPLORE ALIEN WORLDS, OR TACKLE TACTICAL OPERATIONS.
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

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_GAMES.map((game, idx) => (
            <GameGridTile key={idx} game={game} />
          ))}
        </div>

        {/* Load More CTA */}
        <div className="mt-16 text-center flex justify-center">
          <button className="group relative inline-flex items-center justify-center px-8 py-3 font-mono font-bold text-white transition-all duration-200 bg-transparent border-2 border-[#ff9f00] hover:bg-[#ff9f00]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff9f00]">
            <span className="tracking-widest uppercase text-sm">LOAD MORE RECORDS</span>
            <span className="absolute inset-0 border border-[#ff9f00] group-hover:scale-105 transition-transform duration-300 opacity-50" />
            <span className="absolute inset-0 border border-[#ff9f00] group-hover:scale-110 transition-transform duration-500 opacity-20" />
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}
