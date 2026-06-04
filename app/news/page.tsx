"use client";

import React, { useState } from 'react';

interface Article {
  id: string;
  title: string;
  category: 'Gaming News' | 'Technology News' | 'AI News' | 'Hardware Reviews' | 'Esports' | 'Game Updates' | 'Community Events';
  date: string;
  summary: string;
  content: string;
  imageUrl: string;
  readTime: string;
}

const initialArticles: Article[] = [
  {
    id: 'news-1',
    title: 'CunningCats Nitro Patch 1.4: Desert Storm Combat Racing Balance Update',
    category: 'Game Updates',
    date: '2026-06-03',
    summary: 'The latest balancing patch tunes heavy vehicle armor values and upgrades weapon pickup drop rates in the Sandbath circuit.',
    content: 'Drifters, GamerDrift Command has dispatched Patch 1.4 for the CunningCats battle racers. Heavy vehicle armor has been increased by 12% to protect against heat-seeking fish bone missiles, while Nitro boost decay rates have been optimized. A brand new sandstorm weather effects engine has been introduced to the Sandbath Arena, creating visual hazards and tactical shielding opportunities. Global matchmaking lobbies are now updated to prioritize lower-latency nodes.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    readTime: '3 min read'
  },
  {
    id: 'news-2',
    title: 'RogueGhost Secret Intel: Inside the Sandbath Rescue Operation',
    category: 'Gaming News',
    date: '2026-06-02',
    summary: 'Strategic dispatch details for the hostage rescue campaign in Sandbath, detailing target locations and stealth grids.',
    content: 'Incoming tactical analysis from RogueGhost Command details the newly added Sandbath mission sector. Infiltrators must bypass the outer detection grids using low-frequency signal dampers. Hostage scientists are detained in the secondary hangar vault. Enemy AI units utilize adaptive search paths; we recommend utilizing shadow cover and avoiding open sand tiles. Progression unlocks include the silenced carbon rifle.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read'
  },
  {
    id: 'news-3',
    title: 'Review: RTX 5080 Tactical Gaming Edition - Worth the Credits?',
    category: 'Hardware Reviews',
    date: '2026-05-30',
    summary: 'A deep-dive benchmark review of the latest GPU architecture running 4K real-time ray-traced gaming arrays.',
    content: 'We benchmarked the brand new RTX 5080 Tactical edition on our GamerDrift simulator arrays. Clocking a solid 144fps in extreme sandstorm storm cycles on CunningCats at 4K resolution, the card runs relatively cool at 68C. Frame generation algorithms have been optimized to bypass standard rendering latency, shaving off 8ms of input delay. Our verdict: it is an essential core processor for competitive esports setups.',
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80',
    readTime: '6 min read'
  },
  {
    id: 'news-4',
    title: 'AI in Esports: Adaptive Enemies in RogueGhost Set New Benchmark',
    category: 'AI News',
    date: '2026-05-28',
    summary: 'How neural network behavioral algorithms are reshaping tactical gameplay and NPC strategic intelligence.',
    content: 'The developers behind RogueGhost have published their neural network agent logs. NPCs in the Forestfun and Snowblow maps no longer follow preset patrol paths. Instead, they dynamically share target coordinates and adjust search grids based on sounds detected. This neural system pushes the limits of modern tactical action shooters, creating authentic, unpredictable combat missions.',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read'
  },
  {
    id: 'news-5',
    title: 'GamerDrift Global Tournaments: Clan Wars Registration Open',
    category: 'Esports',
    date: '2026-05-25',
    summary: 'Drifters, register your clans for the upcoming tactical championship. Command credits and exclusive badges await.',
    content: 'Registration portals are open for the GamerDrift Season 2 Championship. Teams of 4 will compete across both CunningCats racing speeds and RogueGhost extraction grids. The winning squad takes home a total of 15,000 Command credits, a customized metallic badge on their drifter files, and hardware gear sponsorships.',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    readTime: '2 min read'
  }
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const categories = ['All', 'Gaming News', 'Technology News', 'AI News', 'Hardware Reviews', 'Esports', 'Game Updates', 'Community Events'];

  const filteredArticles = selectedCategory === 'All'
    ? initialArticles
    : initialArticles.filter(art => art.category === selectedCategory);

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-black relative">
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Newsroom Header */}
        <div className="border-b border-[#00f0ff]/20 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-[10px] font-mono text-[#ff9f00] tracking-[0.3em] uppercase block mb-1">OPERATIONAL TRANSMISSIONS</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-widest font-mono">NEWS_CENTER</h1>
          </div>
          <span className="text-[9px] font-mono text-[#00f0ff] bg-[#00f0ff]/5 border border-[#00f0ff]/20 px-3 py-1">
            UPLINK_STATUS: SYNCHRONIZED // FEED_ACTIVE
          </span>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-900 pb-5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-[10px] font-mono border uppercase transition-all ${
                selectedCategory === cat
                  ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                  : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map(art => (
            <div 
              key={art.id}
              className="hud-panel cursor-pointer flex flex-col h-full hover:-translate-y-1"
              onClick={() => setActiveArticle(art)}
            >
              <div className="relative h-48 w-full bg-slate-950 overflow-hidden border-b border-slate-900">
                <img 
                  src={art.imageUrl} 
                  alt={art.title} 
                  className="w-full h-full object-cover opacity-75 hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-3 left-3 bg-black/85 border border-[#ff9f00]/30 text-[#ff9f00] text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider">
                  {art.category}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mb-2">
                  <span>{art.date}</span>
                  <span>{art.readTime}</span>
                </div>
                <h2 className="text-base font-bold text-white font-mono mb-2 hover:text-[#00f0ff] transition-colors uppercase leading-snug">
                  {art.title}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {art.summary}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-900 flex justify-between items-center text-[9px] font-mono text-[#00f0ff]">
                  <span>READ_FULL_COMMISSION &gt;</span>
                  <span className="text-slate-600">ID: {art.id.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal expand article */}
        {activeArticle && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="hud-panel max-w-2xl w-full bg-[#0c0f16] max-h-[85vh] overflow-y-auto flex flex-col relative">
              <button 
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 w-8 h-8 border border-[#ff9f00]/30 text-[#ff9f00] flex items-center justify-center font-bold hover:bg-[#ff9f00]/10 z-10"
              >
                ✕
              </button>

              <div className="h-64 relative bg-slate-950">
                <img 
                  src={activeArticle.imageUrl} 
                  alt={activeArticle.title} 
                  className="w-full h-full object-cover opacity-70" 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0c0f16] to-transparent h-32"></div>
                <span className="absolute top-4 left-4 bg-black/90 border border-[#00f0ff]/30 text-[#00f0ff] text-[9px] font-mono px-2.5 py-1 uppercase">
                  {activeArticle.category}
                </span>
              </div>

              <div className="p-6 md:p-8 flex flex-col">
                <div className="flex gap-4 items-center text-[10px] font-mono text-slate-500 mb-3">
                  <span>DISPATCH_DATE: {activeArticle.date}</span>
                  <span>// {activeArticle.readTime}</span>
                </div>

                <h1 className="text-xl md:text-2xl font-extrabold text-white font-mono tracking-wide uppercase leading-tight mb-4 border-b border-slate-900 pb-3">
                  {activeArticle.title}
                </h1>

                <p className="text-xs text-[#ff9f00] font-mono mb-4 leading-relaxed bg-[#ff9f00]/5 border border-[#ff9f00]/20 p-3">
                  SUMMARY: {activeArticle.summary}
                </p>

                <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-4">
                  {activeArticle.content.split('\n\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                <div className="border-t border-slate-900 mt-6 pt-4 flex justify-between items-center text-[9px] font-mono text-slate-500">
                  <span>SIGNALS_ENCRYPTED: GamerDrift HQ</span>
                  <span>UPLINK_TERMINATED</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
