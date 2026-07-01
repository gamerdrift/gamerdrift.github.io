"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '../lib/state/UserContext';

const SPONSOR_ADS = [
  {
    sponsor: "KROME CYBERNETICS LTD",
    tagline: "UPGRADE YOUR BIOWARE // METAHUMAN SYNC ENABLED",
    desc: "Get 25% off the latest neural links and reflex boosters at any local district terminal. Enter code: DRIFTER2077.",
    color: "#00f0ff"
  },
  {
    sponsor: "VOID CONSTRUCTS & FLEETS",
    tagline: "STARSHIPS FOR EVERY DRIFTER // GALAXY DECK SECTOR",
    desc: "Pre-order the new Void Ranger fighter ship with upgraded warp drive and dual laser cannons. Zero down payment.",
    color: "#ff9f00"
  },
  {
    sponsor: "CHIP-SET: SHADOW CO.",
    tagline: "RUN SILENT. RUN COLD.",
    desc: "Elite cooling units and motherboard tessellations for hardcore console decks. Overclock your setup safely.",
    color: "#39ff14"
  }
];

export default function SponsorTerminal() {
  const { user, addCoins, gainXP } = useUser();
  const [adIndex, setAdIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [modalProgress, setModalProgress] = useState(0);

  // Rotate ads every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % SPONSOR_ADS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Modal loading progress animation
  useEffect(() => {
    if (!showModal) return;
    setModalProgress(0);
    const interval = setInterval(() => {
      setModalProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [showModal]);

  const activeAd = SPONSOR_ADS[adIndex];

  const playClaimSound = () => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const handleClaimCoins = () => {
    if (!user || cooldown > 0) return;
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (modalProgress >= 100) {
      addCoins(15);
      gainXP(10); // Reward a bit of XP as well!
      playClaimSound();
      setCooldown(30); // 30 second cooldown for active testing
      setShowModal(false);
    }
  };

  return (
    <div 
      className="w-full bg-[#080c12]/95 border-2 rounded-xl p-4 font-mono text-[10px] flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:shadow-[0_0_15px_rgba(0,240,255,0.15)]"
      style={{ borderColor: activeAd.color }}
    >
      {/* Background Matrix/Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '15px 15px',
        }}
      />

      {/* Header telemetry badge */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-2 z-10">
        <span className="text-[7.5px] uppercase tracking-wider font-extrabold" style={{ color: activeAd.color }}>
          ⚡ SPONSOR_FEED // SECURE_STREAM
        </span>
        <span className="bg-[#ff9f00]/10 text-[#ff9f00] px-1.5 py-0.5 rounded text-[6px] tracking-widest font-bold">
          AD_UPLINK
        </span>
      </div>

      {/* Ad Contents */}
      <div className="my-3 space-y-1.5 z-10 flex-grow">
        <div className="text-white text-xs font-black tracking-widest uppercase">{activeAd.sponsor}</div>
        <div className="font-extrabold text-[8px] uppercase tracking-widest" style={{ color: activeAd.color }}>
          &gt; {activeAd.tagline}
        </div>
        <p className="text-slate-400 text-[9px] font-sans normal-case leading-relaxed">
          {activeAd.desc}
        </p>
      </div>

      {/* Action / Claim Button */}
      <div className="mt-2 pt-2 border-t border-slate-900 z-10 flex items-center justify-between">
        <span className="text-[8px] text-slate-500 uppercase tracking-widest">
          EST_PAYOUT: <span className="text-[#ff9f00] font-bold">🪙 +15 COINS</span>
        </span>
        
        {user ? (
          <button
            onClick={handleClaimCoins}
            disabled={cooldown > 0}
            className={`px-3 py-1.5 font-bold tracking-wider text-[8px] uppercase border transition-all duration-300 ${
              cooldown > 0 
                ? 'border-slate-800 bg-transparent text-slate-600 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95'
            }`}
            style={{
              borderColor: cooldown > 0 ? '#1f2937' : activeAd.color,
              color: cooldown > 0 ? '#4b5563' : activeAd.color,
              backgroundColor: cooldown > 0 ? 'transparent' : `${activeAd.color}15`,
              boxShadow: cooldown > 0 ? 'none' : `0 0 8px ${activeAd.color}30`
            }}
          >
            {cooldown > 0 ? `RECHARGING: ${cooldown}s` : '▶ DEPLOY TRANSMISSION'}
          </button>
        ) : (
          <div className="text-slate-600 text-[8px] tracking-wider uppercase border border-slate-900 px-3 py-1.5 select-none">
            [CONNECT USER NODE TO EARN]
          </div>
        )}
      </div>

      {/* Interactive Ad Modal Screen */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div 
            className="w-full max-w-md bg-[#0a0d14]/95 border-2 rounded-xl p-6 relative font-mono text-[10px] text-slate-300 shadow-[0_0_50px_rgba(0,240,255,0.2)]"
            style={{ borderColor: activeAd.color }}
          >
            {/* Corner braces */}
            <div className="absolute top-2 left-2 text-slate-600 font-bold">[+]</div>
            <div className="absolute top-2 right-2 text-slate-600 font-bold">[+]</div>
            
            <h3 className="text-sm font-extrabold uppercase text-white tracking-widest text-center border-b border-slate-800 pb-3">
              📡 LOADING SPONSOR TELEMETRY DATA
            </h3>
            
            <div className="my-6 space-y-4">
              <div className="bg-black/60 p-4 border border-slate-800 rounded">
                <div className="text-white text-xs font-black tracking-widest mb-1">{activeAd.sponsor}</div>
                <div className="font-extrabold text-[8px] mb-3 uppercase tracking-wider" style={{ color: activeAd.color }}>
                  {activeAd.tagline}
                </div>
                <p className="text-slate-400 text-[9px] font-sans normal-case leading-relaxed">
                  {activeAd.desc}
                </p>
              </div>

              {/* Progress Loading Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] text-slate-500">
                  <span>TRANSMITTING AD TELEMETRY UPLINK...</span>
                  <span className="font-bold text-white">{modalProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-3 border border-slate-800 rounded overflow-hidden p-0.5">
                  <div 
                    className="h-full transition-all duration-100 ease-out"
                    style={{ 
                      width: `${modalProgress}%`, 
                      backgroundColor: activeAd.color,
                      boxShadow: `0 0 10px ${activeAd.color}`
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              disabled={modalProgress < 100}
              className={`w-full py-2.5 font-extrabold tracking-widest text-xs uppercase border transition-all duration-300 ${
                modalProgress < 100 
                  ? 'border-slate-800 bg-transparent text-slate-600 cursor-not-allowed'
                  : 'hover:scale-[1.02] active:scale-95 text-black'
              }`}
              style={{
                borderColor: modalProgress < 100 ? '#1f2937' : activeAd.color,
                backgroundColor: modalProgress < 100 ? 'transparent' : activeAd.color,
                boxShadow: modalProgress < 100 ? 'none' : `0 0 15px ${activeAd.color}50`
              }}
            >
              {modalProgress < 100 ? 'SECURE_CHANNEL_BUFFERING...' : '✔ CLAIM 15 COINS'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
