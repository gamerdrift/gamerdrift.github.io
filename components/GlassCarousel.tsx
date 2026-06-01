"use client";

import React, { useState } from 'react';
import { games } from '../data/games';

export default function GlassCarousel() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % games.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + games.length) % games.length);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center py-10 relative select-none">
      {/* Background Neon Grid Accent */}
      <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none"></div>

      {/* Main Carousel Display */}
      <div className="relative w-full h-[450px] flex items-center justify-center overflow-hidden">
        {games.map((game, index) => {
          // Calculate relative position offset
          let offset = index - activeIndex;
          if (offset < -games.length / 2) offset += games.length;
          if (offset > games.length / 2) offset -= games.length;

          const isCenter = offset === 0;
          const isLeft = offset === -1;
          const isRight = offset === 1;
          const isFarLeft = offset < -1;
          const isFarRight = offset > 1;

          // Compute interactive transition styles dynamically
          let transformStyle = '';
          let opacityStyle = '0';
          let zIndexStyle = '0';

          if (isCenter) {
            transformStyle = 'translate3d(0, 0, 100px) scale(1.1)';
            opacityStyle = '1';
            zIndexStyle = '30';
          } else if (isLeft) {
            transformStyle = 'translate3d(-240px, 0, 0px) scale(0.9) rotateY(25deg)';
            opacityStyle = '0.7';
            zIndexStyle = '20';
          } else if (isRight) {
            transformStyle = 'translate3d(240px, 0, 0px) scale(0.9) rotateY(-25deg)';
            opacityStyle = '0.7';
            zIndexStyle = '20';
          } else if (isFarLeft) {
            transformStyle = 'translate3d(-400px, 0, -100px) scale(0.7) rotateY(45deg)';
            opacityStyle = '0.2';
            zIndexStyle = '10';
          } else if (isFarRight) {
            transformStyle = 'translate3d(400px, 0, -100px) scale(0.7) rotateY(-45deg)';
            opacityStyle = '0.2';
            zIndexStyle = '10';
          }

          return (
            <div
              key={game.id}
              className="absolute w-[300px] h-[400px] rounded-2xl transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden cursor-pointer"
              style={{
                transform: transformStyle,
                opacity: opacityStyle,
                zIndex: zIndexStyle,
                backdropFilter: 'blur(20px)',
                background: isCenter 
                  ? 'linear-gradient(135deg, rgba(255, 0, 255, 0.08), rgba(0, 240, 255, 0.08))' 
                  : 'rgba(20, 10, 30, 0.4)',
                border: isCenter 
                  ? '2px solid #ff00ff' 
                  : '1px solid rgba(0, 240, 255, 0.2)',
                boxShadow: isCenter
                  ? '0 0 30px rgba(255, 0, 255, 0.3), inset 0 0 15px rgba(0, 240, 255, 0.2)'
                  : '0 4px 15px rgba(0, 0, 0, 0.5)',
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
              onClick={() => {
                if (!isCenter) {
                  setActiveIndex(index);
                }
              }}
            >
              {/* Card Image Overlay & Reflex */}
              <div className="relative w-full h-[200px] overflow-hidden">
                <img
                  src={game.thumbnail}
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                {/* 8K Ultra Glow Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                <div className="absolute top-2 right-3 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest text-[#00f0ff] border border-[#00f0ff]/50 bg-black/60">
                  8K ULTRA
                </div>
              </div>

              {/* Game details */}
              <div className="p-5 flex flex-col items-center flex-grow justify-between text-center bg-black/40">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-wide mb-1 neon-text">
                    {game.title}
                  </h3>
                  <p className="text-xs text-gray-400 max-h-[48px] overflow-hidden">
                    {game.id === 'retro-racer' && 'Race through synthwave horizons and dodge cyber obstacles.'}
                    {game.id === 'space-invaders' && 'Defend the galaxy against incoming alien invaders.'}
                    {game.id === 'pixel-platformer' && 'Jump over neon hazards and survive the run.'}
                    {game.id === 'snake' && 'Eat neon fruit to grow your digital snake longer.'}
                    {game.id === 'tetris' && 'Align cybernetic block formations to clear lines.'}
                    {game.id === '2048' && 'Slide and merge numerical logic nodes to hit 2048.'}
                  </p>
                </div>

                {isCenter ? (
                  <a
                    href={game.url}
                    className="w-full py-2.5 rounded-lg font-bold text-sm text-center transition-all duration-300 transform hover:scale-105 active:scale-95 text-white shadow-[0_0_15px_rgba(255,0,255,0.4)]"
                    style={{
                      background: 'linear-gradient(45deg, #ff00ff, #00f0ff)',
                      boxShadow: '0 0 15px rgba(255, 0, 255, 0.4)'
                    }}
                  >
                    PLAY NOW
                  </a>
                ) : (
                  <div className="text-xs text-[#00f0ff]/70 font-semibold tracking-wider uppercase">
                    Click to Focus
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
          className="w-12 h-12 rounded-full border border-[#00f0ff]/40 bg-black/40 flex items-center justify-center text-white hover:border-[#ff00ff] hover:text-[#ff00ff] hover:bg-black/60 transition-all duration-300 shadow-[0_0_8px_rgba(0,240,255,0.2)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]"
        >
          ◀
        </button>
        <div className="flex space-x-2">
          {games.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                idx === activeIndex 
                  ? 'bg-[#ff00ff] w-6 shadow-[0_0_8px_#ff00ff]' 
                  : 'bg-gray-600 hover:bg-[#00f0ff]'
              }`}
            ></div>
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="w-12 h-12 rounded-full border border-[#00f0ff]/40 bg-black/40 flex items-center justify-center text-white hover:border-[#ff00ff] hover:text-[#ff00ff] hover:bg-black/60 transition-all duration-300 shadow-[0_0_8px_rgba(0,240,255,0.2)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
