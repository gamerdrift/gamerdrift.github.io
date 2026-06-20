"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useGames, GameComment } from '../../../lib/state/GameContext';
import { useUser } from '../../../lib/state/UserContext';

export default function GameClientRunner({ gameId }: { gameId: string }) {
  const { games, comments, addComment, addToHistory } = useGames();
  const { user, gainXP } = useUser();
  const game = games.find((g) => g.id === gameId);

  const cabinetRef = useRef<HTMLDivElement>(null);

  // Layout & UI States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Review System States
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  // Toggle layout mode
  const toggleFullscreen = () => {
    const cabinet = cabinetRef.current;
    if (!cabinet) return;
    if (!document.fullscreenElement) {
      cabinet.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    const author = user ? user.username : 'GuestDrifter';
    addComment(gameId, author, reviewRating, reviewText);
    setReviewText('');
    gainXP(25); // Reward XP for review
  };

  // Add game to play history on start
  useEffect(() => {
    if (isPlaying) {
      addToHistory(gameId);
    }
  }, [isPlaying, gameId]);

  const startGame = () => {
    setIsPlaying(true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-xs text-[#00f0ff]">
        <div className="animate-pulse tracking-[0.2em] uppercase">UPLINK_ESTABLISHED // CACHE_INIT...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-xs text-neon-pink">
        <div className="border border-neon-pink/40 p-8 rounded-lg bg-neon-pink/5 text-center max-w-sm flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-widest uppercase">ERROR: NODE_NOT_FOUND</h2>
          <p className="text-slate-500">The requested coordinate segment does not exist or has been de-allocated from the subgrid.</p>
          <Link href="/" className="mt-2 neon-button text-xs py-2 px-6">
            RETURN_TO_CORE
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-white p-4 md:p-8 font-mono select-none">
      
      {/* Top Breadcrumb HUD */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center text-[10px] text-slate-500 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-neon-blue transition">GAMERDRIFT</Link>
          <span>/</span>
          <span className="text-slate-300 uppercase">SUBGRID_UPLINK // {game.title}</span>
        </div>
        <div className="hidden sm:flex gap-4">
          <span>LATENCY: 22ms</span>
          <span>FPS: 60/60</span>
          <span>STATUS: SECURED_NODE</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Game Cabinet Column */}
        <div className={`flex-1 flex flex-col ${isTheaterMode ? 'w-full' : ''}`}>
          
          {/* Cabinet Header bar */}
          <div className="flex justify-between items-center bg-[#07070b] border-t border-x border-white/10 rounded-t-lg px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
              <span className="font-bold tracking-wider text-slate-300">CABINET_NODE: {game.id.toUpperCase()}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className={`px-3 py-1 border rounded text-[10px] transition-all duration-150 ${
                  isTheaterMode 
                    ? 'border-neon-blue text-neon-blue bg-neon-blue/10' 
                    : 'border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                THEATER_MODE
              </button>
              <button 
                onClick={toggleFullscreen}
                className="px-3 py-1 border border-slate-800 text-slate-500 rounded text-[10px] hover:text-slate-300 transition-all duration-150"
              >
                FULLSCREEN
              </button>
            </div>
          </div>

          {/* Core Cabinet Frame */}
          <div 
            ref={cabinetRef}
            className={`relative border-2 border-white/10 bg-black aspect-video rounded-b-lg overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] ${
              isFullscreen ? 'w-screen h-screen rounded-none border-none' : ''
            }`}
          >
            {/* Scanlines layer */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

            {/* CRT Screen Glow */}
            <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_80px_rgba(0,240,255,0.07)]" />

            {/* Game Screen Content */}
            {!isPlaying ? (
              <div className="absolute inset-0 bg-[#020204] z-20 flex flex-col items-center justify-center p-6 text-center">
                {/* Visual background placeholder */}
                <div 
                  className="absolute inset-0 opacity-15 bg-cover bg-center filter grayscale blur-sm"
                  style={{ backgroundImage: `url(${game.thumbnail})` }}
                />
                
                {/* Cyberpunk boot console details */}
                <div className="relative z-30 flex flex-col items-center max-w-lg gap-6">
                  <div className="flex flex-col gap-1.5">
                    <h1 className="text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-purple-500 to-neon-pink uppercase neon-text">
                      {game.title}
                    </h1>
                    <span className="text-[9px] text-slate-500 tracking-[0.3em] uppercase">
                      SECURED SATELLITE COMMS LINK // GAMERDRIFT.COM
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-sm">
                    {game.description}
                  </p>

                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={startGame}
                      className="neon-button text-xl px-10 py-3 bg-neon-blue/20 hover:bg-neon-blue/45 transition border border-neon-blue rounded-lg font-bold tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                    >
                      BOOT_GAME_SIGNAL
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                src={`${game.embedUrl}${typeof window !== 'undefined' ? window.location.search : ''}`}
                className="w-full h-full border-none bg-black relative z-20"
                allow="autoplay; gamepad; keyboard; fullscreen"
                allowFullScreen
              />
            )}
          </div>

          {/* How to play Cheatsheet */}
          <div className="cyber-card p-6 mt-8 w-full text-text-secondary">
            <h3 className="text-lg font-bold text-white mb-4 tracking-wider uppercase font-sans border-b border-white/10 pb-2 flex items-center gap-2">
              <span>🎮</span> TRANSMISSION PARAMETERS & CONTROLS
            </h3>
            <ul className="list-disc pl-5 flex flex-col gap-3.5 font-mono text-xs text-slate-400">
              <li><strong className="text-neon-blue">MOVE & STRAFE</strong>: Press <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">W</kbd> / <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">A</kbd> / <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">S</kbd> / <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">D</kbd> or <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">ARROW KEYS</kbd>.</li>
              <li><strong className="text-neon-blue">LOOK & AIM</strong>: Lock the camera by right-clicking on the grid screen, then move your mouse.</li>
              <li><strong className="text-neon-blue">FIRE WEAPON</strong>: Left click anywhere on the target screen. Recoils weapon and decreases stealth.</li>
              <li><strong className="text-neon-pink">TACTICAL POSTURES</strong>: Press <kbd className="bg-black border border-neon-pink px-2 py-0.5 rounded text-white text-[10px]">CTRL</kbd> to crouch, and press <kbd className="bg-black border border-neon-pink px-2 py-0.5 rounded text-white text-[10px]">Z</kbd> to lie prone. Prone crawls significantly boost stealth cover.</li>
              <li><strong className="text-neon-pink">LEANING SIGHTS</strong>: Hold <kbd className="bg-black border border-neon-pink px-2 py-0.5 rounded text-white text-[10px]">Q</kbd> to lean left, and hold <kbd className="bg-black border border-neon-pink px-2 py-0.5 rounded text-white text-[10px]">E</kbd> to lean right.</li>
              <li><strong className="text-neon-purple">DMR ZOOM</strong>: Click the <kbd className="bg-black border border-neon-purple px-2 py-0.5 rounded text-white text-[10px]">MIDDLE MOUSE BUTTON</kbd> to cycle magnification levels (**Normal**, **ADS**, **DMR Sniper**).</li>
              <li><strong className="text-neon-green">TACTICAL GOGGLES</strong>: Press <kbd className="bg-black border border-neon-green px-2 py-0.5 rounded text-white text-[10px]">T</kbd> to toggle Thermal Vision, and press <kbd className="bg-black border border-neon-green px-2 py-0.5 rounded text-white text-[10px]">N</kbd> to toggle Night Vision Goggles.</li>
            </ul>
          </div>

          {/* Review comments thread */}
          <div className="cyber-card p-6 mt-8 w-full text-text-secondary flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white tracking-wider uppercase font-sans border-b border-white/10 pb-2 flex items-center gap-2">
              <span>📝</span> DRIFTER COMMS CENTER (REVIEWS)
            </h3>

            {/* Form */}
            <form onSubmit={handlePostReview} className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-neon-blue">POST TELEMETRY TRANSMISSION:</span>
                
                {/* Rating selection */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono">STARS:</span>
                  <div className="flex bg-black/40 rounded p-1 border border-white/5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`w-6 h-6 text-xs transition-all ${
                          reviewRating >= star ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your game review or report telemetry data..."
                rows={3}
                required
                className="w-full bg-[#150a21]/60 border border-neon-pink/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 font-mono text-xs focus:outline-none focus:border-neon-pink focus:shadow-[0_0_8px_rgba(255,0,255,0.2)] resize-none"
              />

              <button
                type="submit"
                className="neon-button self-end font-bold tracking-widest text-xs py-2 px-6 uppercase"
              >
                BROADCAST REVIEW
              </button>
            </form>

            {/* Comments list */}
            <div className="flex flex-col gap-3.5 mt-2 max-h-80 overflow-y-auto pr-2 scrollbar-none">
              {(comments[gameId] || []).length > 0 ? (
                (comments[gameId] || []).map((comm: GameComment) => (
                  <div key={comm.id} className="p-3 bg-black/40 border border-white/5 rounded-lg flex flex-col gap-2 transition-all hover:border-neon-blue/10">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-neon-blue font-bold">{comm.username}</span>
                      <span className="text-gray-600">{comm.date}</span>
                    </div>
                    <div className="flex text-yellow-400 text-[10px]">
                      {Array.from({ length: comm.rating }).map((_, i) => <span key={i}>★</span>)}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{comm.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center font-mono text-xs text-gray-500 py-6">
                  No transmissions found. Be the first to broadcast telemetry for this node.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
