"use client";

import React, { useState } from 'react';

const captnGhostMaps = [
  {
    id: "container-yard",
    title: "Container Yard",
    subtitle: "TACTICAL ZONE 01",
    thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&h=800&q=80",
    description: "Tac-Ops briefing: Breach the high-density container yard. Watch out for patrolling air drones and utilize cargo crates as cover.",
    stage: 1,
    theme: "Glitch-neon urban maze with cargo boxes",
    stats: "DIFF: STANDARD // DEPLOYED: ACTIVE"
  },
  {
    id: "cargo-vessel",
    title: "Cargo Vessel",
    subtitle: "TACTICAL ZONE 02",
    thumbnail: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=600&h=800&q=80",
    description: "Tac-Ops briefing: Secure the deck of a rain-slicked naval tanker under stormy lighting. Keep an eye on target drones spawning in the high wind.",
    stage: 2,
    theme: "Rain-slicked naval tanker deck under stormy lighting",
    stats: "DIFF: HARD // ENVIRONMENT: STORM"
  },
  {
    id: "airport-hangar",
    title: "Airport Hangar",
    subtitle: "TACTICAL ZONE 03",
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&h=800&q=80",
    description: "Tac-Ops briefing: Penetrate the massive steel depot staging facility. Extremely cold ambient temperatures. Watch for high-speed target locks.",
    stage: 3,
    theme: "Massive snowy/ash steel depot staging facility",
    stats: "DIFF: EXPERT // TEMPERATURE: -14C"
  },
  {
    id: "desert-ruins",
    title: "Afghan Desert",
    subtitle: "TACTICAL ZONE 04",
    thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&h=800&q=80",
    description: "Tac-Ops briefing: Navigate burning desert clay huts under severe sandstorms. Visibility is low. Keep behind brick walls to reload.",
    stage: 4,
    theme: "Burning Afghan clay huts under sandstorms",
    stats: "DIFF: ELITE // VISIBILITY: 15%"
  },
  {
    id: "jungle-outpost",
    title: "Jungle POW Outpost",
    subtitle: "TACTICAL ZONE 05",
    thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&h=800&q=80",
    description: "Tac-Ops briefing: Infiltrate the camouflaged jungle canopy and eliminate defensive target nodes. Organic foliage provides natural visual cover.",
    stage: 5,
    theme: "Camouflaged jungle canopy with organic foliage",
    stats: "DIFF: DOOMSDAY // DEPLOYED: OFF-GRID"
  }
];

export default function GlassCarousel() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % captnGhostMaps.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + captnGhostMaps.length) % captnGhostMaps.length);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center py-10 relative select-none">
      {/* Background Neon Grid Accent */}
      <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none"></div>

      {/* Flagship Header */}
      <div className="text-center mb-8 z-10">
        <h2 className="text-xs font-bold tracking-[0.25em] text-neon-pink font-mono uppercase mb-2 animate-pulse">
          ⚡ FLAGSHIP OPERATIONS TERMINAL ⚡
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wider uppercase font-sans">
          CAPTN.GHOST CAMPAIGNS
        </h1>
        <p className="text-text-secondary text-xs font-mono mt-1">
          REPLICATING MULTI-THEME 3D WEBGL RAIL-SHOOTER DEPLOYMENTS
        </p>
      </div>

      {/* Main Carousel Display */}
      <div className="relative w-full h-[460px] flex items-center justify-center overflow-hidden">
        {captnGhostMaps.map((map, index) => {
          let offset = index - activeIndex;
          if (offset < -captnGhostMaps.length / 2) offset += captnGhostMaps.length;
          if (offset > captnGhostMaps.length / 2) offset -= captnGhostMaps.length;

          const isCenter = offset === 0;
          const isLeft = offset === -1;
          const isRight = offset === 1;
          const isFarLeft = offset < -1;
          const isFarRight = offset > 1;

          let transformStyle = '';
          let opacityStyle = '0';
          let zIndexStyle = '0';

          if (isCenter) {
            transformStyle = 'translate3d(0, 0, 100px) scale(1.1)';
            opacityStyle = '1';
            zIndexStyle = '30';
          } else if (isLeft) {
            transformStyle = 'translate3d(-250px, 0, 0px) scale(0.9) rotateY(20deg)';
            opacityStyle = '0.7';
            zIndexStyle = '20';
          } else if (isRight) {
            transformStyle = 'translate3d(250px, 0, 0px) scale(0.9) rotateY(-20deg)';
            opacityStyle = '0.7';
            zIndexStyle = '20';
          } else if (isFarLeft) {
            transformStyle = 'translate3d(-420px, 0, -100px) scale(0.7) rotateY(40deg)';
            opacityStyle = '0.2';
            zIndexStyle = '10';
          } else if (isFarRight) {
            transformStyle = 'translate3d(420px, 0, -100px) scale(0.7) rotateY(-40deg)';
            opacityStyle = '0.2';
            zIndexStyle = '10';
          }

          return (
            <div
              key={map.id}
              className="absolute w-[310px] h-[410px] rounded-2xl transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden cursor-pointer"
              style={{
                transform: transformStyle,
                opacity: opacityStyle,
                zIndex: zIndexStyle,
                backdropFilter: 'blur(20px)',
                background: isCenter 
                  ? 'linear-gradient(135deg, rgba(255, 0, 255, 0.12), rgba(0, 240, 255, 0.12))' 
                  : 'rgba(20, 10, 30, 0.55)',
                border: isCenter 
                  ? '2px solid #ff00ff' 
                  : '1px solid rgba(0, 240, 255, 0.25)',
                boxShadow: isCenter
                  ? '0 0 35px rgba(255, 0, 255, 0.35), inset 0 0 15px rgba(0, 240, 255, 0.25)'
                  : '0 8px 25px rgba(0, 0, 0, 0.6)',
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
              onClick={() => {
                if (!isCenter) {
                  setActiveIndex(index);
                }
              }}
            >
              {/* Card Image Overlay */}
              <div className="relative w-full h-[180px] overflow-hidden">
                <img
                  src={map.thumbnail}
                  alt={map.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090311] via-transparent to-transparent opacity-90"></div>
                
                {/* HUD Overlay */}
                <div className="absolute top-3 left-3 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest text-[#ff00ff] border border-[#ff00ff]/40 bg-black/75 font-mono">
                  {map.subtitle}
                </div>
              </div>

              {/* Tactical briefing writeup */}
              <div className="p-4 flex flex-col items-center flex-grow justify-between text-center bg-black/40">
                <div className="w-full">
                  <h3 className="text-lg font-black text-white tracking-wider mb-1 neon-text uppercase">
                    {map.title}
                  </h3>
                  <span className="text-[9px] font-mono text-neon-blue tracking-widest block mb-2">
                    {map.stats}
                  </span>
                  <p className="text-[10px] text-gray-400 font-mono leading-relaxed h-[68px] overflow-y-auto px-1 scrollbar-none">
                    {map.description}
                  </p>
                </div>

                {isCenter ? (
                  <a
                    href={`/play/captn-ghost/?stage=${map.stage}`}
                    className="w-full py-2.5 rounded-lg font-bold text-xs text-center transition-all duration-300 transform hover:scale-[1.03] active:scale-95 text-white tracking-widest shadow-[0_0_15px_rgba(255,0,255,0.4)]"
                    style={{
                      background: 'linear-gradient(45deg, #ff00ff, #00f0ff)',
                      boxShadow: '0 0 15px rgba(255, 0, 255, 0.4)'
                    }}
                  >
                    DEPLOY NODE
                  </a>
                ) : (
                  <div className="text-[9px] text-[#00f0ff]/60 font-mono tracking-widest uppercase hover:text-neon-pink">
                    [ CLICK TO INITIALIZE ]
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Carousel Navigation Controller */}
      <div className="flex space-x-6 mt-6 items-center">
        <button
          onClick={prevSlide}
          className="w-10 h-10 rounded-full border border-[#00f0ff]/40 bg-black/40 flex items-center justify-center text-white hover:border-[#ff00ff] hover:text-[#ff00ff] hover:bg-black/60 transition-all duration-300 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
        >
          ◀
        </button>
        <div className="flex space-x-2">
          {captnGhostMaps.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                idx === activeIndex 
                  ? 'bg-[#ff00ff] w-5 shadow-[0_0_8px_#ff00ff]' 
                  : 'bg-gray-600 hover:bg-[#00f0ff]'
              }`}
            ></div>
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="w-10 h-10 rounded-full border border-[#00f0ff]/40 bg-black/40 flex items-center justify-center text-white hover:border-[#ff00ff] hover:text-[#ff00ff] hover:bg-black/60 transition-all duration-300 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
