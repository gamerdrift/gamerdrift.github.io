"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '../../lib/state/UserContext';

export default function RogueGhostPage() {
  const { user, gainXP } = useUser();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'briefing' | 'controls' | 'telemetry'>('briefing');
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    const container = gameContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
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

  const playBeep = (freq = 440, duration = 0.1) => {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const startWebGLGame = () => {
    setIsPlaying(true);
    playBeep(600, 0.2);
    if (user) {
      gainXP(50); // reward XP for launching the real Godot simulator
    }
  };

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-[#05070a] relative font-mono text-xs text-slate-300">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      <div className="scanlines"></div>

      <div 
        ref={gameContainerRef}
        className={`relative z-10 flex flex-col gap-6 ${
          isFullscreen 
            ? 'fixed inset-0 w-screen h-screen z-50 p-8 bg-[#05070a] overflow-y-auto max-w-full' 
            : 'max-w-6xl mx-auto'
        }`}
      >
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#00f0ff]/20 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                FLAGSHIP_NODE: 02
              </span>
              <span className="text-slate-500">//</span>
              <span className="text-slate-500 uppercase tracking-widest text-[9px]">GODOT_WebGL_SIMULATOR</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase leading-none">
              ROGUE_GHOST <span className="text-[#00f0ff] hologram-text">3D</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => {
                setIsTheaterMode(!isTheaterMode);
                playBeep(450, 0.05);
              }}
              className="text-[10px] font-bold tracking-widest px-3 py-2 border border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff]/10 rounded transition-all duration-300"
            >
              [ {isTheaterMode ? 'STANDARD_VIEW' : 'THEATER_VIEW'} ]
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-[10px] font-bold tracking-widest px-3 py-2 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/10 rounded transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
            >
              {isFullscreen ? '[ EXIT_FULLSCREEN ]' : '[ ⛶ FULLSCREEN ]'}
            </button>
            <Link 
              href="/games"
              className="text-[10px] font-bold tracking-widest px-3 py-2 border border-slate-700 text-slate-400 hover:border-slate-500 rounded transition-all"
            >
              [ BACK_TO_ARCADE ]
            </Link>
          </div>
        </div>

        {/* Main Interface Layout */}
        <div className={`flex flex-col lg:flex-row gap-8 items-start`}>
          
          {/* Game Cabinet Column */}
          <div className={`w-full transition-all duration-300 ${isTheaterMode ? 'lg:w-full' : 'lg:w-[65%]'}`}>
            <div className="relative bg-[#020305] border-4 border-[#ff00ff] rounded-xl overflow-hidden shadow-[0_0_35px_rgba(255,0,255,0.25)] aspect-[16/9]">
              
              {/* CRT Screen Overlays */}
              <div className="absolute inset-0 bg-radial-crt pointer-events-none z-20"></div>

              {/* Startup Boot Interface */}
              {!isPlaying ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 p-6 text-center">
                  <div className="text-5xl mb-4 animate-bounce">🕵️‍♂️</div>
                  <h2 className="text-lg font-bold text-white tracking-widest uppercase mb-2">
                    ROGUE_GHOST TACTICAL DECK
                  </h2>
                  <p className="text-[10px] text-slate-500 max-w-xs uppercase leading-relaxed mb-6">
                    Infiltrate frozen outposts, purge rogue security AI, rescue hostages, and exit under cover of darkness. Powered by Godot Engine.
                  </p>
                  <button
                    onClick={startWebGLGame}
                    className="px-8 py-3 bg-[#00f0ff]/20 hover:bg-[#00f0ff]/40 text-[#00f0ff] border-2 border-[#00f0ff] rounded font-bold tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  >
                    DEPLOY MISSION &gt;&gt;
                  </button>
                </div>
              ) : (
                <iframe
                  src="/games/rogueghost/index.html"
                  className="w-full h-full border-none bg-black"
                  allow="autoplay; gamepad; keyboard; fullscreen"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups allow-pointer-lock"
                />
              )}
            </div>

            {/* Cabinet Sub-panel */}
            <div className="mt-4 p-3 bg-[#0c0f16]/90 border border-slate-900 rounded flex justify-between items-center text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-ping"></span>
                UPLINK_SECURE // LATENCY: 8ms
              </span>
              <span className="text-[#00f0ff] font-bold">WebGL_SYSTEM: ONLINE // 60 FPS</span>
            </div>
          </div>

          {/* Intel & Briefings Column */}
          {!isTheaterMode && (
            <div className="w-full lg:w-[35%] flex flex-col gap-5 flex-shrink-0">
              
              {/* Tabs */}
              <div className="flex border-b border-slate-900">
                {(['briefing', 'controls', 'telemetry'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      playBeep(500, 0.05);
                    }}
                    className={`flex-1 py-2 font-bold tracking-wider text-[10px] uppercase border-t border-x transition-all ${
                      activeTab === tab 
                        ? 'border-t-[#00f0ff] border-x-slate-900 bg-[#0c0f16] text-[#00f0ff]' 
                        : 'border-transparent border-b-slate-900 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="hud-panel p-5 min-h-[300px] bg-[#0c0f16]/60">
                {activeTab === 'briefing' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold">
                      <span>TACTICAL MISSION PARAMETERS</span>
                      <span className="text-[#ff9f00]">CONFIDENTIAL // AGENT_EYES</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#00f0ff] font-bold block">OPERATIONAL SECTOR:</span>
                      <p className="text-slate-400 leading-relaxed font-sans text-xs">
                        Snowblow Outpost. Extremely low temperatures, restricted visibility. High concentrations of patrol guard drones and automated thermal cameras.
                      </p>
                    </div>

                    <div className="space-y-1 pt-2">
                      <span className="text-[10px] text-[#ff9f00] font-bold block">MISSION OBJECTIVE:</span>
                      <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 text-xs">
                        <li>Locate and unlock the three hostage pods in secure vaults.</li>
                        <li>Maintain low stealth profile index. Alarm triggered at 100% detection.</li>
                        <li>Reach the helicopter extraction zone only after securing all hostages.</li>
                      </ol>
                    </div>
                  </div>
                )}

                {activeTab === 'controls' && (
                  <div className="space-y-4 text-xs">
                    <div className="text-[9px] text-slate-500 font-bold">OPERATIVE DIRECTIVES</div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[#00f0ff] font-bold block mb-1">WASD / ARROWS</span>
                        <span className="text-slate-400">Move the Rogue Ghost operator.</span>
                      </div>
                      <div>
                        <span className="text-[#00f0ff] font-bold block mb-1">MOUSE ROTATION</span>
                        <span className="text-slate-400">Rotate the camera and align weapon sights.</span>
                      </div>
                      <div>
                        <span className="text-[#00f0ff] font-bold block mb-1">LEFT MOUSE CLICK</span>
                        <span className="text-slate-400">Fire weapon (Silenced Carbine or Blade projectile).</span>
                      </div>
                      <div>
                        <span className="text-[#ff9f00] font-bold block mb-1">SHIFT (HOLD)</span>
                        <span className="text-slate-400">Crouch to slide under security beams and reduce noise footprints.</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'telemetry' && (
                  <div className="space-y-4">
                    <div className="text-[9px] text-slate-500 font-bold">SYSTEM TELEMETRY INTEGRITY</div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">SIMULATOR ENGINE:</span>
                        <span className="text-white font-bold">Godot 4.6.3 WebAssembly</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">RENDER METHOD:</span>
                        <span className="text-[#00f0ff]">WebGL 2.0 (Compatibility)</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">CLIENT RESOLUTION:</span>
                        <span className="text-white">1280 x 720 (Scaled Aspect)</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">AUDIO OUT:</span>
                        <span className="text-[#39ff14] font-bold">ACTIVE (WebAudio API)</span>
                      </div>

                      <div className="border-t border-slate-900 pt-3">
                        <span className="text-slate-500 block text-[9px] uppercase mb-1">OPERATOR NOTES:</span>
                        <p className="text-[10px] text-slate-600 font-sans italic leading-relaxed">
                          For best performance, close background browser tabs. Enable browser hardware acceleration if framerate drops below 60.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pilot Card */}
              <div className="hud-panel p-4 flex items-center gap-3 bg-gradient-to-r from-[#0c0f16] to-[#05070a]">
                <div className="w-9 h-9 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-base">
                  👨‍✈️
                </div>
                <div>
                  <span className="text-slate-500 text-[8px] block uppercase">DRIFTER COMMANDER</span>
                  <span className="text-white font-bold block uppercase">{user ? user.username : 'GUEST_OPERATIVE'}</span>
                  <span className="text-[#39ff14] text-[8px] font-bold block mt-0.5">SYNC_COEF: 99.8%</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
