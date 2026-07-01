"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '../../../lib/state/UserContext';
import { useCasino } from '../../../lib/state/CasinoContext';

const SYMBOLS = [
  { char: '💀', name: 'Cyber Skull', multiplier: 50, weight: 1, color: '#ff0055' },
  { char: '💾', name: 'Data Chip', multiplier: 25, weight: 2, color: '#00f0ff' },
  { char: '⚡', name: 'Power Core', multiplier: 15, weight: 3, color: '#ff9f00' },
  { char: '🛡️', name: 'Shield Link', multiplier: 10, weight: 4, color: '#a855f7' },
  { char: '🪙', name: 'Drift Token', multiplier: 5, weight: 6, color: '#39ff14' },
  { char: '👾', name: 'System Glitch', multiplier: 0, weight: 8, color: '#64748b' }
];

export default function GhostSlots() {
  const { user } = useUser();
  const { checkWinAllowed, processBet, processPayout, houseMargin } = useCasino();

  const [bet, setBet] = useState(10);
  const [reels, setReels] = useState(['🪙', '🪙', '🪙']);
  const [spinning, setSpinning] = useState(false);
  const [resultMessage, setResultMessage] = useState('INSERT COINS AND DEPLOY REELS');
  const [winAmount, setWinAmount] = useState(0);

  // Stats
  const [sessionSpins, setSessionSpins] = useState(0);
  const [sessionWon, setSessionWon] = useState(0);

  // Audio Synth Helper
  const playSound = (freq: number, type: OscillatorType = 'sine', duration = 0.1, volume = 0.05) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  const playReelTick = () => playSound(400, 'square', 0.05, 0.02);
  const playWinSound = () => {
    playSound(523.25, 'triangle', 0.15, 0.08); // C5
    setTimeout(() => playSound(659.25, 'triangle', 0.15, 0.08), 100); // E5
    setTimeout(() => playSound(783.99, 'triangle', 0.3, 0.08), 200); // G5
  };
  const playLossSound = () => {
    playSound(180, 'sawtooth', 0.3, 0.05);
  };

  const handleBetChange = (amount: number) => {
    if (spinning) return;
    playSound(600, 'sine', 0.05);
    setBet(prev => Math.max(10, Math.min(prev + amount, user ? user.driftCoins : 1000)));
  };

  const spin = () => {
    if (spinning) return;
    if (!user || user.driftCoins < bet) {
      playSound(200, 'sine', 0.2);
      setResultMessage('ERROR: INSUFFICIENT DRIFT BALANCE');
      return;
    }

    setSpinning(true);
    setResultMessage('ESTABLISHING QUANTUM SYNC...');
    setWinAmount(0);

    // Process Bet in casino context
    const betSuccess = processBet(bet);
    if (!betSuccess) {
      setSpinning(false);
      setResultMessage('TRANSACTION ABORTED BY PROTOCOL');
      return;
    }

    setSessionSpins(prev => prev + 1);
    playSound(300, 'sawtooth', 0.1);

    // Reels Animation Ticks
    let counter = 0;
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char
      ]);
      playReelTick();
      counter++;
      if (counter >= 15) {
        clearInterval(interval);
        determineOutcome();
      }
    }, 100);
  };

  const determineOutcome = () => {
    // 1. Roll raw random outcome
    let r1 = getRandomSymbol();
    let r2 = getRandomSymbol();
    let r3 = getRandomSymbol();

    // Calculate potential win
    let matchingSymbol = null;
    let potentialMultiplier = 0;

    if (r1.char === r2.char && r2.char === r3.char) {
      matchingSymbol = r1;
      potentialMultiplier = r1.multiplier;
    } else if (r1.char === r2.char || r2.char === r3.char || r1.char === r3.char) {
      // 2 symbols match: minor award (e.g. 2x multiplier)
      matchingSymbol = r2; // whichever is middle or matching
      potentialMultiplier = 2;
    }

    let winSum = bet * potentialMultiplier;

    // 2. Perform AI Balancing Audit
    // If win is detected, verify against House Edge controller.
    if (winSum > 0) {
      const allowed = checkWinAllowed(user!.username, bet, winSum);
      if (!allowed) {
        // OVERRIDE: Modify the outcome to a loss to enforce the 60% house edge.
        r1 = SYMBOLS[5]; // Glitch
        r2 = SYMBOLS[4]; // Drift token
        r3 = SYMBOLS[5]; // Glitch
        winSum = 0;
      }
    }

    // Set the finalized reels
    setReels([r1.char, r2.char, r3.char]);
    
    // Process Payout in casino context
    processPayout(winSum, winSum > 0);

    // Finalize UI state
    setSpinning(false);
    if (winSum > 0) {
      playWinSound();
      setResultMessage(`SUCCESS // WIN AMOUNT: 🪙 ${winSum} COINS`);
      setWinAmount(winSum);
      setSessionWon(prev => prev + winSum);
    } else {
      playLossSound();
      setResultMessage('SYNC LOST // GLITCH ENCOUNTERED. SYSTEM EDGE MAINTAINED.');
    }
  };

  const getRandomSymbol = () => {
    const totalWeight = SYMBOLS.reduce((sum, sym) => sum + sym.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const sym of SYMBOLS) {
      rand -= sym.weight;
      if (rand <= 0) return sym;
    }
    return SYMBOLS[SYMBOLS.length - 1];
  };

  return (
    <div className="w-full min-h-screen bg-[#05070a] relative font-mono text-xs text-slate-300 overflow-x-hidden">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none" />
      <div className="scanlines" />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 relative z-10 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#00f0ff]/30 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold px-2 py-0.5 uppercase border border-[#00f0ff]/40 text-[#00f0ff] bg-[#00f0ff]/10">
                SLOT_TERMINAL: 01
              </span>
              <span className="text-slate-600 text-[9px]">// GHOSTDADDY_CASINO</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-[0.15em] uppercase leading-none">
              GHOST_<span className="text-[#00f0ff] hologram-text">SLOTS</span>
            </h1>
            <p className="text-slate-600 text-[9px] tracking-widest uppercase mt-1">ALIGN NEON SYMBOLS // HOUSE EDGE CONTROL ACTIVE</p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="text-right text-[9px] text-slate-500 uppercase">
              <div>OPERATIVE BALANCE: <span className="text-white font-black">🪙 {user ? user.driftCoins : 0}</span></div>
              <div>HOUSE MARGIN: <span className="text-[#ff9f00] font-bold">{(houseMargin * 100).toFixed(1)}%</span></div>
            </div>
            <Link href="/ghostdaddy-casino" className="text-[10px] font-bold tracking-widest px-3 py-2 border border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300 transition-all">
              [ LEAVE MACHINE ]
            </Link>
          </div>
        </div>

        {/* SLOT MACHINE CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: THE REELS TERMINAL */}
          <div className="md:col-span-8 space-y-6">
            
            {/* The slot window */}
            <div className="w-full bg-[#0c0f16]/90 border-2 border-[#00f0ff] rounded-xl p-8 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative overflow-hidden">
              <div className="absolute top-2 left-2 text-[8px] text-[#00f0ff] font-bold tracking-widest uppercase">REEL MATRIX TELEMETRY</div>
              
              {/* Reels Display */}
              <div className="grid grid-cols-3 gap-6 py-12 px-4 bg-black/60 border border-slate-900 rounded-lg relative">
                {reels.map((char, index) => {
                  const symbolObj = SYMBOLS.find(s => s.char === char) || SYMBOLS[5];
                  return (
                    <div
                      key={index}
                      className="aspect-square flex flex-col items-center justify-center bg-[#07090e] border border-slate-800 rounded-xl relative shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] overflow-hidden group"
                    >
                      {/* Vertical line indicator */}
                      <div className="absolute inset-y-0 left-1/2 w-[1px] bg-slate-900 pointer-events-none" />
                      
                      {/* Spinning glow effect */}
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 opacity-20 pointer-events-none ${
                          spinning ? 'animate-pulse' : ''
                        }`}
                        style={{ backgroundColor: symbolObj.color }}
                      />

                      <span
                        className={`text-6xl select-none ${spinning ? 'animate-bounce' : ''}`}
                        style={{ filter: `drop-shadow(0 0 15px ${symbolObj.color}80)` }}
                      >
                        {char}
                      </span>
                      <span className="text-[7.5px] text-slate-600 mt-2 font-bold uppercase select-none">{symbolObj.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Status Message Terminal */}
              <div className="mt-6 bg-[#07090e] border border-slate-900 p-3 rounded font-mono text-center relative">
                <div className="absolute top-1 left-2 text-[7px] text-slate-700">ALERT_LOG:</div>
                <span className={`text-[10px] tracking-wider uppercase font-bold ${
                  winAmount > 0 ? 'text-[#39ff14]' : resultMessage.includes('ERROR') ? 'text-[#ff0055]' : 'text-slate-400'
                }`}>
                  {resultMessage}
                </span>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="hud-panel p-6 bg-black/60 rounded-xl border border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* Bet Controls */}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <span className="text-[9.5px] text-slate-500 uppercase tracking-widest font-bold">// ADJUST WAGER</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBetChange(-10)}
                    disabled={spinning || bet <= 10}
                    className="w-10 h-10 border border-slate-800 bg-[#090b11] hover:border-slate-600 text-white font-black text-sm rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <div className="px-6 py-2 border border-[#00f0ff]/30 bg-black text-[#00f0ff] font-extrabold text-sm min-w-[80px] text-center rounded">
                    🪙 {bet}
                  </div>
                  <button
                    onClick={() => handleBetChange(10)}
                    disabled={spinning || (user ? bet >= user.driftCoins : false)}
                    className="w-10 h-10 border border-slate-800 bg-[#090b11] hover:border-slate-600 text-white font-black text-sm rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                  <button
                    onClick={() => { if (!spinning && user) setBet(Math.min(user.driftCoins, 500)); }}
                    disabled={spinning}
                    className="px-3 py-2.5 border border-slate-800 bg-[#090b11] hover:border-slate-600 text-slate-400 font-bold text-[9px] uppercase tracking-wider rounded transition-all"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Spin Trigger */}
              <button
                onClick={spin}
                disabled={spinning || !user || user.driftCoins < bet}
                className="w-full sm:w-60 py-4 bg-[#00f0ff] text-black font-black tracking-[0.25em] text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:bg-[#00f0ff]/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {spinning ? 'SPINNING MATRIX...' : '▶ TRIGGER DEPLOYMENT'}
              </button>

            </div>

          </div>

          {/* RIGHT COLUMN: REWARD PAYOUT LEGEND */}
          <div className="md:col-span-4 space-y-4">
            
            <div className="hud-panel p-5 bg-[#0c0f16]/60 border border-slate-900 rounded-lg">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold block border-b border-slate-900 pb-2 mb-3">// PAYOUT MATRIX</span>
              
              <div className="space-y-2">
                {SYMBOLS.map(sym => (
                  <div key={sym.char} className="flex justify-between items-center py-1.5 border-b border-slate-900/60 last:border-b-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{sym.char}</span>
                      <div>
                        <span className="text-[10px] text-white font-bold uppercase">{sym.name}</span>
                        <div className="text-[8px] text-slate-600">CHANCE: {sym.weight > 6 ? 'HIGH' : sym.weight > 2 ? 'MEDIUM' : 'RARE'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {sym.multiplier > 0 ? (
                        <span className="font-extrabold font-mono" style={{ color: sym.color }}>
                          {sym.multiplier}x Bet
                        </span>
                      ) : (
                        <span className="text-slate-600 font-extrabold font-mono">LOSS</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SESSION STATISTICS */}
            <div className="hud-panel p-4 bg-black/60 border border-slate-900 rounded-lg text-[9.5px]">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold block border-b border-slate-900 pb-2 mb-3">// MACHINE SESSION TELEMETRY</span>
              <div className="space-y-2 text-slate-400">
                <div className="flex justify-between">
                  <span>SESSION SPINS:</span>
                  <span className="text-white font-extrabold font-mono">{sessionSpins}</span>
                </div>
                <div className="flex justify-between">
                  <span>SESSION WON:</span>
                  <span className="text-[#39ff14] font-extrabold font-mono">🪙 {sessionWon}</span>
                </div>
                <div className="flex justify-between">
                  <span>NET SINK/GAIN:</span>
                  <span className={`font-extrabold font-mono ${sessionWon - (sessionSpins * bet) >= 0 ? 'text-[#39ff14]' : 'text-[#ff0055]'}`}>
                    {sessionWon - (sessionSpins * bet) >= 0 ? '+' : ''}{sessionWon - (sessionSpins * bet)} Coins
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
