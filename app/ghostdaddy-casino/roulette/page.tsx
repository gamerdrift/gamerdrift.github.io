"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '../../../lib/state/UserContext';
import { useCasino } from '../../../lib/state/CasinoContext';

const WHEEL_NUMBERS = [
  { num: 0, color: 'green' },
  { num: 32, color: 'red' }, { num: 15, color: 'black' }, { num: 19, color: 'red' }, { num: 4, color: 'black' },
  { num: 21, color: 'red' }, { num: 2, color: 'black' }, { num: 25, color: 'red' }, { num: 17, color: 'black' },
  { num: 34, color: 'red' }, { num: 6, color: 'black' }, { num: 27, color: 'red' }, { num: 13, color: 'black' },
  { num: 36, color: 'red' }, { num: 11, color: 'black' }, { num: 30, color: 'red' }, { num: 8, color: 'black' },
  { num: 23, color: 'red' }, { num: 10, color: 'black' }, { num: 5, color: 'red' }, { num: 24, color: 'black' },
  { num: 16, color: 'red' }, { num: 33, color: 'black' }, { num: 1, color: 'red' }, { num: 20, color: 'black' },
  { num: 14, color: 'red' }, { num: 31, color: 'black' }, { num: 9, color: 'red' }, { num: 22, color: 'black' },
  { num: 18, color: 'red' }, { num: 29, color: 'black' }, { num: 7, color: 'red' }, { num: 28, color: 'black' },
  { num: 12, color: 'red' }, { num: 35, color: 'black' }, { num: 3, color: 'red' }, { num: 26, color: 'black' }
];

interface Bet {
  type: 'red' | 'black' | 'even' | 'odd' | 'number';
  value?: number; // for specific numbers
  amount: number;
}

export default function CyberRoulette() {
  const { user } = useUser();
  const { checkWinAllowed, processBet, processPayout, houseMargin } = useCasino();

  const [betSize, setBetSize] = useState(10);
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [winningNumber, setWinningNumber] = useState<{ num: number; color: string } | null>(null);
  const [resultMessage, setResultMessage] = useState('PLACE DIGITAL WAGERS ON THE GRID');
  const [winAmount, setWinAmount] = useState(0);

  // Stats
  const [sessionSpins, setSessionSpins] = useState(0);
  const [sessionWon, setSessionWon] = useState(0);

  // Audio Synth
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

  const playTick = () => playSound(800, 'sine', 0.04, 0.02);
  const playWinSound = () => {
    playSound(440, 'triangle', 0.1, 0.06); // A4
    setTimeout(() => playSound(554.37, 'triangle', 0.1, 0.06), 80); // C#5
    setTimeout(() => playSound(659.25, 'triangle', 0.1, 0.06), 160); // E5
    setTimeout(() => playSound(880.00, 'triangle', 0.25, 0.06), 240); // A5
  };
  const playLossSound = () => playSound(140, 'sawtooth', 0.3, 0.04);

  const totalWageredAmount = activeBets.reduce((sum, b) => sum + b.amount, 0);

  const selectBetSize = (size: number) => {
    playSound(600, 'sine', 0.05);
    setBetSize(size);
  };

  const addBet = (type: Bet['type'], value?: number) => {
    if (spinning) return;
    playSound(500, 'sine', 0.05);

    if (!user || user.driftCoins < totalWageredAmount + betSize) {
      setResultMessage('ERROR: INSUFFICIENT DRIFT BALANCE');
      return;
    }

    // Check duplicate bets
    const index = activeBets.findIndex(b => b.type === type && b.value === value);
    if (index !== -1) {
      const updated = [...activeBets];
      updated[index].amount += betSize;
      setActiveBets(updated);
    } else {
      setActiveBets([...activeBets, { type, value, amount: betSize }]);
    }
    setResultMessage('BET PLACED ON GRID BOARD');
  };

  const clearBets = () => {
    if (spinning) return;
    playSound(300, 'sine', 0.05);
    setActiveBets([]);
    setResultMessage('GRID BETTING ARCHIVE CLEARED');
  };

  const calculatePayoutForNumber = (numObj: typeof WHEEL_NUMBERS[0], betsList: Bet[]): number => {
    let totalWin = 0;
    for (const b of betsList) {
      if (b.type === 'red' && numObj.color === 'red') {
        totalWin += b.amount * 2;
      } else if (b.type === 'black' && numObj.color === 'black') {
        totalWin += b.amount * 2;
      } else if (b.type === 'even' && numObj.num !== 0 && numObj.num % 2 === 0) {
        totalWin += b.amount * 2;
      } else if (b.type === 'odd' && numObj.num % 2 !== 0) {
        totalWin += b.amount * 2;
      } else if (b.type === 'number' && b.value === numObj.num) {
        totalWin += b.amount * 36;
      }
    }
    return totalWin;
  };

  const spin = () => {
    if (spinning) return;
    if (activeBets.length === 0) {
      setResultMessage('ERROR: PLACE A BET BEFORE SPINNING');
      return;
    }

    setSpinning(true);
    setResultMessage('ROTATING QUANTUM RING MATRIX...');
    setWinningNumber(null);
    setWinAmount(0);

    // Deduct total bet size from user coins
    const betSuccess = processBet(totalWageredAmount);
    if (!betSuccess) {
      setSpinning(false);
      setResultMessage('TRANSACTION ERROR');
      return;
    }

    setSessionSpins(prev => prev + 1);

    // Calculate outcome
    let selectedSlot = WHEEL_NUMBERS[Math.floor(Math.random() * WHEEL_NUMBERS.length)];
    let potentialPayout = calculatePayoutForNumber(selectedSlot, activeBets);

    // AI balancing verification
    if (potentialPayout > 0) {
      const allowed = checkWinAllowed(user!.username, totalWageredAmount, potentialPayout);
      if (!allowed) {
        // OVERRIDE: Select a slot that will result in a loss (or minimum payout).
        // Try all slots, find one that pays out 0 or the absolute minimum possible.
        let safestSlot = WHEEL_NUMBERS[0];
        let minPay = 999999;
        
        // Shuffle the search to maintain randomness in losing slots
        const shuffledWheel = [...WHEEL_NUMBERS].sort(() => Math.random() - 0.5);
        for (const slot of shuffledWheel) {
          const payout = calculatePayoutForNumber(slot, activeBets);
          if (payout < minPay) {
            minPay = payout;
            safestSlot = slot;
          }
        }
        selectedSlot = safestSlot;
        potentialPayout = minPay;
      }
    }

    // Animation variables
    const targetIndex = WHEEL_NUMBERS.findIndex(w => w.num === selectedSlot.num);
    const degreePerSlot = 360 / WHEEL_NUMBERS.length;
    // Calculate ending degree to land on targetIndex
    const finalRot = 1440 + (360 - (targetIndex * degreePerSlot));

    // Spin animation ticks
    let currentRot = wheelRotation % 360;
    setWheelRotation(currentRot);

    let progress = 0;
    const duration = 2500; // ms
    const startTime = performance.now();

    const animateWheel = (time: number) => {
      const elapsed = time - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      // Easing out curve
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      const rot = currentRot + (finalRot - currentRot) * easeOutQuad;
      setWheelRotation(rot);

      if (progress < 1) {
        requestAnimationFrame(animateWheel);
      } else {
        finalizeSpin(selectedSlot, potentialPayout);
      }
    };

    requestAnimationFrame(animateWheel);
  };

  const finalizeSpin = (slot: typeof WHEEL_NUMBERS[0], payout: number) => {
    setSpinning(false);
    setWinningNumber(slot);
    processPayout(payout, payout > 0);

    if (payout > 0) {
      playWinSound();
      setWinAmount(payout);
      setSessionWon(prev => prev + payout);
      setResultMessage(`WIN CONFIRMED // NUM: ${slot.num} (${slot.color.toUpperCase()}) // PAYOUT: 🪙 ${payout}`);
    } else {
      playLossSound();
      setResultMessage(`LOST // NUM: ${slot.num} (${slot.color.toUpperCase()}) // HOUSE COLLECTS WAGER`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#05070a] relative font-mono text-xs text-slate-300 overflow-x-hidden">
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none" />
      <div className="scanlines" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 relative z-10 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#ff9f00]/30 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold px-2 py-0.5 uppercase border border-[#ff9f00]/40 text-[#ff9f00] bg-[#ff9f00]/10">
                WHEEL_TERMINAL: 03
              </span>
              <span className="text-slate-600 text-[9px]">// GHOSTDADDY_CASINO</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-[0.15em] uppercase leading-none">
              CYBER_<span className="text-[#ff9f00] hologram-text">ROULETTE</span>
            </h1>
            <p className="text-slate-600 text-[9px] tracking-widest uppercase mt-1">SPIN THE QUANTUM RING // DYNAMIC PAYOUT PROTECTION</p>
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

        {/* BOARD VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* THE SPINNING WHEEL CANVAS */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#0c0f16]/90 border-2 border-[#ff9f00] p-6 rounded-xl shadow-[0_0_30px_rgba(255,159,0,0.15)] relative">
            <span className="absolute top-2 left-2 text-[8.5px] text-[#ff9f00] tracking-widest uppercase">QUANTUM SPIN MATRIX</span>
            
            {/* The SVG Wheel */}
            <div className="relative w-64 h-64 my-6 flex items-center justify-center">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 200 200"
                style={{ transform: `rotate(${wheelRotation}deg)`, transition: spinning ? 'none' : 'transform 0.1s ease-out' }}
                className="select-none"
              >
                {/* Outer metallic ring */}
                <circle cx="100" cy="100" r="96" fill="#040508" stroke="#ff9f00" strokeWidth="2" />
                <circle cx="100" cy="100" r="88" fill="none" stroke="#ff9f00" strokeWidth="1" strokeDasharray="3,3" />

                {/* Slices */}
                {WHEEL_NUMBERS.map((n, i) => {
                  const angle = (360 / WHEEL_NUMBERS.length);
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;

                  const rad1 = (startAngle - 90) * Math.PI / 180;
                  const rad2 = (endAngle - 90) * Math.PI / 180;

                  const x1 = 100 + 84 * Math.cos(rad1);
                  const y1 = 100 + 84 * Math.sin(rad1);
                  const x2 = 100 + 84 * Math.cos(rad2);
                  const y2 = 100 + 84 * Math.sin(rad2);

                  const path = `M 100 100 L ${x1} ${y1} A 84 84 0 0 1 ${x2} ${y2} Z`;
                  const colorCode = n.color === 'green' ? '#39ff14' : n.color === 'red' ? '#ff0055' : '#111520';

                  return (
                    <g key={n.num}>
                      <path d={path} fill={colorCode} stroke="#ff9f00" strokeWidth="0.4" />
                      {/* Text */}
                      {(() => {
                        const midAngle = startAngle + angle / 2 - 90;
                        const textRad = midAngle * Math.PI / 180;
                        const tx = 100 + 72 * Math.cos(textRad);
                        const ty = 100 + 72 * Math.sin(textRad);
                        return (
                          <text
                            x={tx}
                            y={ty}
                            fill="#ffffff"
                            fontSize="5.5"
                            fontWeight="bold"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                          >
                            {n.num}
                          </text>
                        );
                      })()}
                    </g>
                  );
                })}

                {/* Center cap */}
                <circle cx="100" cy="100" r="28" fill="#040508" stroke="#ff9f00" strokeWidth="1.5" />
              </svg>

              {/* Target Selector Pointer */}
              <div className="absolute top-0 left-1/2 -ml-2 -mt-1 w-4 h-4 bg-white border-2 border-red-600 rounded-full flex items-center justify-center z-20 shadow-md">
                <span className="text-[7px]">▼</span>
              </div>

              {/* Winning Number overlay */}
              {winningNumber && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-full pointer-events-none select-none z-10"
                >
                  <div
                    className="w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 shadow-2xl animate-bounce"
                    style={{
                      backgroundColor: winningNumber.color === 'green' ? '#39ff14' : winningNumber.color === 'red' ? '#ff0055' : '#111520',
                      borderColor: '#ff9f00'
                    }}
                  >
                    <span className="text-2xl font-black text-white leading-none">{winningNumber.num}</span>
                    <span className="text-[7px] text-white font-extrabold uppercase mt-1">{winningNumber.color}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Spin logs */}
            <div className="w-full bg-[#07090e] border border-slate-900 p-2.5 rounded text-center">
              <span className={`text-[9.5px] uppercase font-bold tracking-wider ${
                winAmount > 0 ? 'text-[#39ff14]' : resultMessage.includes('LOST') ? 'text-slate-500' : 'text-[#ff9f00]'
              }`}>
                {resultMessage}
              </span>
            </div>

          </div>

          {/* THE BETTING TABLE GRID */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* The Grid table */}
            <div className="w-full bg-[#0c0f16]/90 border border-slate-900 rounded-xl p-6 space-y-5">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">// DIGITAL BETTING TABLE</span>
              
              {/* Numbers array 1-36 */}
              <div className="grid grid-cols-6 gap-2">
                <button
                  onClick={() => addBet('number', 0)}
                  disabled={spinning}
                  className="col-span-6 py-2.5 bg-[#39ff14]/15 border border-[#39ff14]/40 hover:border-[#39ff14] text-white font-extrabold text-sm rounded transition-all disabled:opacity-40"
                >
                  0 (GREEN CORES)
                </button>

                {Array.from({ length: 36 }).map((_, idx) => {
                  const val = idx + 1;
                  const numObj = WHEEL_NUMBERS.find(w => w.num === val) || { color: 'red' };
                  const isPlaced = activeBets.some(b => b.type === 'number' && b.value === val);

                  return (
                    <button
                      key={val}
                      onClick={() => addBet('number', val)}
                      disabled={spinning}
                      className={`py-2 border text-xs font-bold rounded transition-all relative ${
                        isPlaced ? 'border-yellow-400 font-black' : 'border-slate-800'
                      }`}
                      style={{
                        backgroundColor: numObj.color === 'red' ? 'rgba(255,0,85,0.2)' : 'rgba(17,21,32,0.8)',
                        color: isPlaced ? '#fcd34d' : '#fff'
                      }}
                    >
                      {val}
                      {isPlaced && (
                        <span className="absolute top-0.5 right-1 text-[7px] text-yellow-400">🪙</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Outside Bets */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { type: 'red', label: 'RED (2x)', bg: 'bg-[#ff0055]/10 border-[#ff0055]/30 hover:border-[#ff0055]' },
                  { type: 'black', label: 'BLACK (2x)', bg: 'bg-black/60 border-slate-700 hover:border-white' },
                  { type: 'even', label: 'EVEN (2x)', bg: 'bg-slate-900 border-slate-800 hover:border-slate-600' },
                  { type: 'odd', label: 'ODD (2x)', bg: 'bg-slate-900 border-slate-800 hover:border-slate-600' }
                ].map(out => {
                  const isPlaced = activeBets.some(b => b.type === out.type);
                  return (
                    <button
                      key={out.type}
                      onClick={() => addBet(out.type as any)}
                      disabled={spinning}
                      className={`py-3 border text-[10px] font-bold rounded transition-all relative ${out.bg} ${
                        isPlaced ? 'border-yellow-400 text-yellow-400' : 'text-slate-300'
                      }`}
                    >
                      {out.label}
                      {isPlaced && <span className="absolute top-1 right-1.5 text-[7px]">🪙</span>}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* CHIP SELECTION & CONTROLS */}
            <div className="hud-panel p-6 bg-black/60 border border-slate-900 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Bet values */}
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <span className="text-[9.5px] text-slate-500 uppercase tracking-widest font-bold">// SECTOR CHIP WAGER SIZE</span>
                <div className="flex gap-2">
                  {[10, 50, 100, 500].map(val => (
                    <button
                      key={val}
                      onClick={() => selectBetSize(val)}
                      disabled={spinning}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-extrabold text-[10px] transition-all ${
                        betSize === val
                          ? 'border-[#ff9f00] bg-[#ff9f00]/15 text-[#ff9f00] shadow-[0_0_10px_rgba(255,159,0,0.25)]'
                          : 'border-slate-800 bg-[#07090e] text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      🪙{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Active Bet Wagers */}
              <div className="text-center w-full md:w-auto">
                <div className="text-[9px] text-slate-600 uppercase tracking-wider">CUMULATIVE STAKE:</div>
                <div className="text-xl font-extrabold text-[#39ff14] mt-0.5">🪙 {totalWageredAmount} COINS</div>
              </div>

              {/* Spin trigger & Clear */}
              <div className="flex gap-2 w-full md:w-80">
                <button
                  onClick={clearBets}
                  disabled={spinning || activeBets.length === 0}
                  className="px-4 py-3 bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-950/40 rounded transition-all text-[10px] font-bold uppercase tracking-wider"
                >
                  CLEAR
                </button>
                <button
                  onClick={spin}
                  disabled={spinning || activeBets.length === 0}
                  className="flex-1 py-3 bg-[#ff9f00] text-black font-black tracking-[0.2em] text-xs uppercase rounded hover:bg-[#ff9f00]/80 transition-all shadow-[0_0_12px_rgba(255,159,0,0.2)] disabled:opacity-40"
                >
                  {spinning ? 'SPINNING WHEEL...' : '▶ LAUNCH SPIN'}
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
