"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '../../../lib/state/UserContext';
import { useCasino } from '../../../lib/state/CasinoContext';

const ROW_COUNT = 8;
const MULTIPLIERS = [10, 3, 1.2, 0.4, 0.1, 0.4, 1.2, 3, 10];
const MULTIPLIER_COLORS = [
  '#ff0055', '#ff4400', '#ff9f00', '#a855f7', '#64748b', '#a855f7', '#ff9f00', '#ff4400', '#ff0055'
];

interface Point {
  x: number;
  y: number;
}

export default function PlinkoMatrix() {
  const { user } = useUser();
  const { checkWinAllowed, processBet, processPayout, houseMargin } = useCasino();

  const [bet, setBet] = useState(10);
  const [dropping, setDropping] = useState(false);
  const [resultMessage, setResultMessage] = useState('DROP CHIPS INTO THE PEGS ARRAY');
  const [winAmount, setWinAmount] = useState(0);

  // Ball coordinate tracking
  const [ballPos, setBallPos] = useState<Point>({ x: 150, y: 30 });
  const [ballPath, setBallPath] = useState<Point[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);

  // Stats
  const [sessionDrops, setSessionDrops] = useState(0);
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

  const playBounce = () => playSound(650, 'triangle', 0.05, 0.03);
  const playWinSound = () => {
    playSound(440, 'sine', 0.12, 0.08);
    setTimeout(() => playSound(554.37, 'sine', 0.12, 0.08), 80);
    setTimeout(() => playSound(659.25, 'sine', 0.12, 0.08), 160);
    setTimeout(() => playSound(880.00, 'sine', 0.3, 0.08), 240);
  };
  const playLossSound = () => playSound(180, 'sawtooth', 0.25, 0.04);

  const handleBetChange = (amount: number) => {
    if (dropping) return;
    playSound(600, 'sine', 0.05);
    setBet(prev => Math.max(10, Math.min(prev + amount, user ? user.driftCoins : 1000)));
  };

  // Peg position calculation
  const getPegPositions = (): Point[] => {
    const positions: Point[] = [];
    const boardWidth = 300;
    const startY = 60;
    const rowSpacing = 30;

    for (let r = 0; r < ROW_COUNT; r++) {
      const pegCount = r + 3;
      const rowWidth = (pegCount - 1) * 20;
      const startX = (boardWidth - rowWidth) / 2;
      const y = startY + r * rowSpacing;

      for (let p = 0; p < pegCount; p++) {
        positions.push({ x: startX + p * 20, y });
      }
    }
    return positions;
  };

  const dropChip = () => {
    if (dropping) return;
    if (!user || user.driftCoins < bet) {
      playSound(200, 'sine', 0.2);
      setResultMessage('ERROR: INSUFFICIENT DRIFT BALANCE');
      return;
    }

    setDropping(true);
    setWinAmount(0);
    setResultMessage('LAUNCHING GRAVITY CHIP...');

    const betSuccess = processBet(bet);
    if (!betSuccess) {
      setDropping(false);
      return;
    }

    setSessionDrops(prev => prev + 1);
    playSound(500, 'square', 0.08);

    // Calculate final slot outcome
    // There are 9 buckets (index 0 to 8)
    // A standard Plinko walk is a Galton board. Total Left/Right choices = ROW_COUNT
    // If the path makes L choices, the bucket index is L.
    // L follows a Binomial distribution.
    let leftChoices = 0;
    const pathTaken: Point[] = [{ x: 150, y: 30 }];
    let currentX = 150;
    let currentY = 30;

    const rowSpacing = 30;
    const startY = 60;

    // Generate trial path
    for (let r = 0; r < ROW_COUNT; r++) {
      const isLeft = Math.random() < 0.5;
      if (isLeft) {
        leftChoices++;
        currentX -= 10;
      } else {
        currentX += 10;
      }
      currentY = startY + r * rowSpacing;
      pathTaken.push({ x: currentX, y: currentY });
    }

    // Land position in bucket
    const finalSlot = leftChoices; // 0 to ROW_COUNT (8)
    const multiplier = MULTIPLIERS[finalSlot];
    let potentialWin = Math.floor(bet * multiplier);

    // AI balancing validation
    if (potentialWin > 0) {
      const allowed = checkWinAllowed(user.username, bet, potentialWin);
      if (!allowed) {
        // OVERRIDE: Shift path to land in a low multiplier bucket (e.g. 0.4x or 0.1x)
        // Mid buckets are indices 3, 4, 5
        const safeSlots = [3, 4, 5];
        const forcedSlot = safeSlots[Math.floor(Math.random() * safeSlots.length)];
        
        // Re-construct path leading to forcedSlot
        currentX = 150;
        currentY = 30;
        const forcedPath: Point[] = [{ x: 150, y: 30 }];
        
        // Walk down, making decisions to end up at (forcedSlot)
        // total right turns must equal forcedSlot
        let rightsNeeded = forcedSlot;
        for (let r = 0; r < ROW_COUNT; r++) {
          const rowsLeft = ROW_COUNT - r;
          let turnRight = false;
          if (rightsNeeded > 0 && (rightsNeeded >= rowsLeft || Math.random() < 0.5)) {
            turnRight = true;
            rightsNeeded--;
          }
          currentX += turnRight ? 10 : -10;
          currentY = startY + r * rowSpacing;
          forcedPath.push({ x: currentX, y: currentY });
        }

        // Finalize overridden parameters
        potentialWin = Math.floor(bet * MULTIPLIERS[forcedSlot]);
        setBallPath(forcedPath);
      } else {
        setBallPath(pathTaken);
      }
    } else {
      setBallPath(pathTaken);
    }

    setCurrentPathIndex(0);
  };

  // Ball dropping animation trigger
  useEffect(() => {
    if (ballPath.length === 0 || currentPathIndex >= ballPath.length) return;

    const interval = setTimeout(() => {
      const targetPos = ballPath[currentPathIndex];
      setBallPos(targetPos);
      playBounce();
      setCurrentPathIndex(prev => prev + 1);
    }, 150);

    return () => clearTimeout(interval);
  }, [ballPath, currentPathIndex]);

  // Finalize drop payout
  useEffect(() => {
    if (ballPath.length > 0 && currentPathIndex === ballPath.length) {
      // Find final x coordinate to see which bucket it hits
      const finalX = ballPos.x;
      // Map finalX to slot (range 150 - ROW_COUNT*10 to 150 + ROW_COUNT*10)
      // center is 150, left is 70, right is 230
      const idx = Math.round((finalX - 70) / 20);
      const slotIndex = Math.max(0, Math.min(idx, MULTIPLIERS.length - 1));
      const mult = MULTIPLIERS[slotIndex];
      const payoutVal = Math.floor(bet * mult);

      processPayout(payoutVal, payoutVal > 0);
      setDropping(false);
      setBallPath([]);

      if (payoutVal > bet) {
        playWinSound();
        setWinAmount(payoutVal);
        setSessionWon(prev => prev + payoutVal);
        setResultMessage(`SUCCESS // BOUNCED INTO ${mult}x SLOT // WON: 🪙 ${payoutVal}`);
      } else if (payoutVal > 0) {
        playSound(400, 'sine', 0.15, 0.05);
        setWinAmount(payoutVal);
        setSessionWon(prev => prev + payoutVal);
        setResultMessage(`RETURNED // MULTIPLIER: ${mult}x // RETURNED: 🪙 ${payoutVal}`);
      } else {
        playLossSound();
        setResultMessage('DEAD LOCK // MULTIPLIER 0x // HOUSES SECURES SINK.');
      }
    }
  }, [currentPathIndex]);

  const pegPositions = getPegPositions();

  return (
    <div className="w-full min-h-screen bg-[#05070a] relative font-mono text-xs text-slate-300 overflow-x-hidden">
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none" />
      <div className="scanlines" />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 relative z-10 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#ff0055]/30 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold px-2 py-0.5 uppercase border border-[#ff0055]/40 text-[#ff0055] bg-[#ff0055]/10">
                PEG_TERMINAL: 04
              </span>
              <span className="text-slate-600 text-[9px]">// GHOSTDADDY_CASINO</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-[0.15em] uppercase leading-none">
              PLINKO_<span className="text-[#ff0055] hologram-text">MATRIX</span>
            </h1>
            <p className="text-slate-600 text-[9px] tracking-widest uppercase mt-1">GRAVITY CHIP PHYSICS DROPS // SYSTEM MARGIN CONTROLS ACTIVE</p>
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

        {/* INTERACTION SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* THE GRAVITY BOARD DISPLAY */}
          <div className="md:col-span-8 flex flex-col items-center justify-center bg-[#0c0f16]/90 border-2 border-[#ff0055] p-6 rounded-xl shadow-[0_0_30px_rgba(255,0,85,0.15)] relative">
            <span className="absolute top-2 left-2 text-[8px] text-[#ff0055] tracking-widest uppercase">GRAVITY PEG ARRAY INTERACTION</span>
            
            {/* The SVG Pegboard */}
            <div className="relative w-80 h-[360px] bg-black/50 border border-slate-900 rounded-lg p-2 my-4">
              <svg width="100%" height="100%" viewBox="0 0 300 340">
                {/* Board grid pegs */}
                {pegPositions.map((peg, i) => (
                  <circle
                    key={i}
                    cx={peg.x}
                    cy={peg.y}
                    r="2.5"
                    fill="#334155"
                    stroke="#ff0055"
                    strokeWidth="0.5"
                    className="animate-pulse"
                  />
                ))}

                {/* Dropped Chip Ball */}
                {(dropping || ballPath.length > 0) && (
                  <circle
                    cx={ballPos.x}
                    cy={ballPos.y}
                    r="5.5"
                    fill="#ff0055"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    style={{ filter: 'drop-shadow(0 0 8px #ff0055)' }}
                  />
                )}

                {/* Multiplier buckets at bottom */}
                {MULTIPLIERS.map((m, i) => {
                  const w = 24;
                  const h = 20;
                  const x = 7 + i * 32;
                  const y = 310;
                  const color = MULTIPLIER_COLORS[i];

                  return (
                    <g key={i}>
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill={`${color}15`}
                        stroke={color}
                        strokeWidth="1"
                        rx="2"
                      />
                      <text
                        x={x + w / 2}
                        y={y + h / 2 + 1}
                        fill={color}
                        fontSize="6.5"
                        fontWeight="black"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                      >
                        {m}x
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Logs display */}
            <div className="w-full bg-[#07090e] border border-slate-900 p-2.5 rounded text-center">
              <span className={`text-[9.5px] uppercase font-bold tracking-wider ${
                winAmount > bet ? 'text-[#39ff14]' : winAmount > 0 ? 'text-[#ff9f00]' : 'text-slate-500'
              }`}>
                {resultMessage}
              </span>
            </div>

          </div>

          {/* CONTROLS & STATISTICS */}
          <div className="md:col-span-4 space-y-4">
            
            {/* Betting setup */}
            <div className="hud-panel p-5 bg-black/60 border border-slate-900 rounded-xl flex flex-col gap-4">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold block border-b border-slate-900 pb-2 mb-1">// ADAPT CHIP COST</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBetChange(-10)}
                  disabled={dropping || bet <= 10}
                  className="w-10 h-10 border border-slate-800 bg-[#090b11] hover:border-slate-600 text-white font-black text-sm rounded transition-all disabled:opacity-30"
                >
                  -
                </button>
                <div className="px-6 py-2 border border-[#ff0055]/30 bg-black text-[#ff0055] font-extrabold text-sm min-w-[80px] text-center rounded">
                  🪙 {bet}
                </div>
                <button
                  onClick={() => handleBetChange(10)}
                  disabled={dropping || (user ? bet >= user.driftCoins : false)}
                  className="w-10 h-10 border border-slate-800 bg-[#090b11] hover:border-slate-600 text-white font-black text-sm rounded transition-all disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <button
                onClick={dropChip}
                disabled={dropping || !user || user.driftCoins < bet}
                className="w-full py-4 bg-[#ff0055] text-white font-black tracking-[0.2em] text-xs uppercase rounded hover:bg-[#ff0055]/80 transition-all shadow-[0_0_12px_rgba(255,0,85,0.25)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {dropping ? 'DROP IN PROGRESS...' : '▶ LAUNCH PHYSICS CHIP'}
              </button>
            </div>

            {/* Multiplier probability guide */}
            <div className="hud-panel p-5 bg-[#0c0f16]/60 border border-slate-900 rounded-lg text-[10px]">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold block border-b border-slate-900 pb-2 mb-3">// MATRIX PROBABILITY</span>
              <div className="space-y-1.5 text-slate-400">
                <p>Outer buckets (10x, 3x) represent outlier bounces (low probability).</p>
                <p>Inner buckets (0.1x, 0.4x) represent central normal distributions (high probability).</p>
                <p>Risk is optimized dynamically to match target house margins of 60%.</p>
              </div>
            </div>

            {/* Telemetry logs */}
            <div className="hud-panel p-4 bg-black/60 border border-slate-900 rounded-lg text-[9.5px]">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold block border-b border-slate-900 pb-2 mb-3">// TELEMETRY DECK</span>
              <div className="space-y-2 text-slate-400">
                <div className="flex justify-between">
                  <span>TOTAL LAUNCHES:</span>
                  <span className="text-white font-extrabold font-mono">{sessionDrops}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUMULATIVE RETURN:</span>
                  <span className="text-[#39ff14] font-extrabold font-mono">🪙 {sessionWon}</span>
                </div>
                <div className="flex justify-between">
                  <span>NET BALANCE:</span>
                  <span className={`font-extrabold font-mono ${sessionWon - (sessionDrops * bet) >= 0 ? 'text-[#39ff14]' : 'text-[#ff0055]'}`}>
                    {sessionWon - (sessionDrops * bet) >= 0 ? '+' : ''}{sessionWon - (sessionDrops * bet)} Coins
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
