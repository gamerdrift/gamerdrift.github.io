"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '../../lib/state/UserContext';

// Cyber Slots Symbols
const SLOTS_SYMBOLS = [
  { char: '🍒', weight: 40, payout: 2 },
  { char: '🍋', weight: 30, payout: 3 },
  { char: '💎', weight: 15, payout: 5 },
  { char: '🔔', weight: 10, payout: 10 },
  { char: '7️⃣', weight: 4, payout: 25 },
  { char: '🎮', weight: 1, payout: 100 } // GamerDrift Badge
];

// Blackjack Cards
interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  score: number;
}
const SUITS: Card['suit'][] = ['♠', '♥', '♦', '♣'];
const VALUES = [
  { val: '2', score: 2 }, { val: '3', score: 3 }, { val: '4', score: 4 },
  { val: '5', score: 5 }, { val: '6', score: 6 }, { val: '7', score: 7 },
  { val: '8', score: 8 }, { val: '9', score: 9 }, { val: '10', score: 10 },
  { val: 'J', score: 10 }, { val: 'Q', score: 10 }, { val: 'K', score: 10 },
  { val: 'A', score: 11 }
];

export default function CasinoPage() {
  const { user, gainXP } = useUser();

  // Selected game: slots | blackjack | roulette
  const [activeTab, setActiveTab] = useState<'slots' | 'blackjack' | 'roulette'>('slots');
  const [balance, setBalance] = useState<number>(5000); // Drifter Casino Credits
  const [bet, setBet] = useState<number>(100);

  // Audio Context Synthesizer
  const playSound = (type: 'win' | 'lose' | 'spin' | 'deal' | 'click') => {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'deal') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'spin') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'lose') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  // Sync balance with LocalStorage and check query parameter for active tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gamerdrift_casino_balance');
      if (stored) {
        setBalance(parseInt(stored, 10));
      } else {
        localStorage.setItem('gamerdrift_casino_balance', '5000');
      }

      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'slots' || tabParam === 'blackjack' || tabParam === 'roulette') {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const updateBalance = (amount: number) => {
    setBalance(prev => {
      const next = prev + amount;
      localStorage.setItem('gamerdrift_casino_balance', next.toString());
      return next;
    });
  };

  const handleBetChange = (amount: number) => {
    playSound('click');
    setBet(amount);
  };

  // =============================================================
  // 1. CYBER SLOTS IMPLEMENTATION
  // =============================================================
  const [reels, setReels] = useState<string[]>(['🍒', '🍒', '🍒']);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [slotsResultText, setSlotsResultText] = useState<string>('PULL LEVER TO STAGE SPIN');

  const spinSlots = () => {
    if (isSpinning || balance < bet) {
      if (balance < bet) playSound('lose');
      return;
    }
    playSound('spin');
    setIsSpinning(true);
    updateBalance(-bet);
    setSlotsResultText('DISPATCHING MATRIX CYCLES...');

    let spinTime = 0;
    const interval = setInterval(() => {
      setReels([
        SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)].char,
        SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)].char,
        SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)].char
      ]);
      spinTime += 100;
      if (spinTime >= 1500) {
        clearInterval(interval);
        evaluateSlots();
      }
    }, 100);
  };

  const evaluateSlots = () => {
    // Generate final random weights
    const getFinalSymbol = () => {
      let r = Math.random() * 100;
      let cumulative = 0;
      for (let sym of SLOTS_SYMBOLS) {
        cumulative += sym.weight;
        if (r <= cumulative) return sym;
      }
      return SLOTS_SYMBOLS[0];
    };

    const finalResult = [getFinalSymbol(), getFinalSymbol(), getFinalSymbol()];
    const finalChars = finalResult.map(s => s.char);
    setReels(finalChars);

    // Matches evaluation
    if (finalChars[0] === finalChars[1] && finalChars[1] === finalChars[2]) {
      // 3 of a kind
      const multiplier = finalResult[0].payout;
      const winAmount = bet * multiplier;
      updateBalance(winAmount);
      playSound('win');
      setSlotsResultText(`JACKPOT COMBO! +$${winAmount} Credits [${multiplier}x Payout]`);
      gainXP(50);
    } else if (finalChars[0] === finalChars[1] || finalChars[1] === finalChars[2] || finalChars[0] === finalChars[2]) {
      // 2 of a kind
      let matchChar = finalChars[0] === finalChars[1] ? finalChars[0] : finalChars[2];
      let matchSym = SLOTS_SYMBOLS.find(s => s.char === matchChar)!;
      const winAmount = Math.floor(bet * (matchSym.payout * 0.4));
      updateBalance(winAmount);
      playSound('win');
      setSlotsResultText(`MINORITY MATCH! +$${winAmount} Credits`);
      gainXP(15);
    } else {
      playSound('lose');
      setSlotsResultText('SYS_ERROR: DECRYPTION FAILED. TRY AGAIN.');
    }
    setIsSpinning(false);
  };

  // =============================================================
  // 2. NEON BLACKJACK IMPLEMENTATION
  // =============================================================
  const [blackjackState, setBlackjackState] = useState<'betting' | 'playing' | 'dealer-turn' | 'gameover'>('betting');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [bjResultText, setBjResultText] = useState<string>('');
  
  const generateDeck = (): Card[] => {
    let deck: Card[] = [];
    SUITS.forEach(suit => {
      VALUES.forEach(val => {
        deck.push({ suit, value: val.val, score: val.score });
      });
    });
    // Shuffle
    return deck.sort(() => Math.random() - 0.5);
  };

  const deckRef = useRef<Card[]>([]);

  const calculateHandScore = (hand: Card[]): number => {
    let total = hand.reduce((sum, card) => sum + card.score, 0);
    let aces = hand.filter(card => card.value === 'A').length;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return total;
  };

  const startBlackjack = () => {
    if (balance < bet) {
      playSound('lose');
      return;
    }
    playSound('deal');
    updateBalance(-bet);
    deckRef.current = generateDeck();

    let p1 = deckRef.current.pop()!;
    let d1 = deckRef.current.pop()!;
    let p2 = deckRef.current.pop()!;
    let d2 = deckRef.current.pop()!;

    const pHand = [p1, p2];
    const dHand = [d1, d2];

    setPlayerHand(pHand);
    setDealerHand(dHand);
    setBlackjackState('playing');
    setBjResultText('MAKE YOUR PLAY');

    // Check Natural Blackjack
    if (calculateHandScore(pHand) === 21) {
      // Natural Blackjack!
      setBlackjackState('gameover');
      const winAmount = Math.floor(bet * 2.5);
      updateBalance(winAmount);
      playSound('win');
      setBjResultText(`NATURAL BLACKJACK! +$${winAmount} Credits`);
      gainXP(40);
    }
  };

  const hitBlackjack = () => {
    if (blackjackState !== 'playing') return;
    playSound('deal');
    const newCard = deckRef.current.pop()!;
    const nextHand = [...playerHand, newCard];
    setPlayerHand(nextHand);

    let score = calculateHandScore(nextHand);
    if (score > 21) {
      // Bust
      setBlackjackState('gameover');
      playSound('lose');
      setBjResultText('SYS_BUSTED: SCORE EXCEEDED 21.');
    }
  };

  const standBlackjack = () => {
    if (blackjackState !== 'playing') return;
    setBlackjackState('dealer-turn');

    let currentDealer = [...dealerHand];
    
    const playDealerTurn = () => {
      let dScore = calculateHandScore(currentDealer);
      let pScore = calculateHandScore(playerHand);

      if (dScore < 17) {
        playSound('deal');
        currentDealer.push(deckRef.current.pop()!);
        setDealerHand([...currentDealer]);
        setTimeout(playDealerTurn, 800);
      } else {
        // Evaluate hands
        setBlackjackState('gameover');
        if (dScore > 21) {
          const winAmount = bet * 2;
          updateBalance(winAmount);
          playSound('win');
          setBjResultText(`DEALER BUST! WINNER +$${winAmount} Credits`);
          gainXP(25);
        } else if (dScore < pScore) {
          const winAmount = bet * 2;
          updateBalance(winAmount);
          playSound('win');
          setBjResultText(`VICTORY! HIGHER SCORE +$${winAmount} Credits`);
          gainXP(25);
        } else if (dScore > pScore) {
          playSound('lose');
          setBjResultText(`DEALER WINS WITH ${dScore}.`);
        } else {
          updateBalance(bet); // Return bet
          playSound('click');
          setBjResultText('PUSH STALEMATE. BET RETURNED.');
        }
      }
    };

    setTimeout(playDealerTurn, 500);
  };

  // =============================================================
  // 3. DRIFTER ROULETTE IMPLEMENTATION
  // =============================================================
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<'RED' | 'BLACK' | null>(null);
  const [selectedType, setSelectedType] = useState<'EVEN' | 'ODD' | null>(null);
  const [rouletteState, setRouletteState] = useState<'betting' | 'spinning' | 'result'>('betting');
  const [rouletteWinNumber, setRouletteWinNumber] = useState<number | null>(null);
  const [rouletteResultText, setRouletteResultText] = useState<string>('PLACE CHIPS ON NEON GRID');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef<number>(0);
  const angularVelocityRef = useRef<number>(0);

  const ROULETTE_NUMBERS = [
    { num: 0, color: 'GREEN' },
    { num: 32, color: 'RED' }, { num: 15, color: 'BLACK' }, { num: 19, color: 'RED' }, { num: 4, color: 'BLACK' },
    { num: 21, color: 'RED' }, { num: 2, color: 'BLACK' }, { num: 25, color: 'RED' }, { num: 17, color: 'BLACK' },
    { num: 34, color: 'RED' }, { num: 6, color: 'BLACK' }, { num: 27, color: 'RED' }, { num: 13, color: 'BLACK' },
    { num: 36, color: 'RED' }, { num: 11, color: 'BLACK' }, { num: 30, color: 'RED' }, { num: 8, color: 'BLACK' },
    { num: 23, color: 'RED' }, { num: 10, color: 'BLACK' }, { num: 5, color: 'RED' }, { num: 24, color: 'BLACK' },
    { num: 16, color: 'RED' }, { num: 33, color: 'BLACK' }, { num: 1, color: 'RED' }, { num: 20, color: 'BLACK' },
    { num: 14, color: 'RED' }, { num: 31, color: 'BLACK' }, { num: 9, color: 'RED' }, { num: 22, color: 'BLACK' },
    { num: 18, color: 'RED' }, { num: 29, color: 'BLACK' }, { num: 7, color: 'RED' }, { num: 28, color: 'BLACK' },
    { num: 12, color: 'RED' }, { num: 35, color: 'BLACK' }, { num: 3, color: 'RED' }, { num: 26, color: 'BLACK' }
  ];

  // Draw Roulette Wheel
  useEffect(() => {
    if (activeTab !== 'roulette') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const drawWheel = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) - 20;

      // Update rotation
      rotationRef.current += angularVelocityRef.current;
      angularVelocityRef.current *= 0.985; // deceleration

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotationRef.current);

      // Draw wheel circle
      ctx.fillStyle = '#080017';
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw segments
      const segmentAngle = (Math.PI * 2) / ROULETTE_NUMBERS.length;
      ROULETTE_NUMBERS.forEach((item, idx) => {
        let angle = idx * segmentAngle;
        ctx.fillStyle = item.color === 'RED' ? '#ff2a2a' : item.color === 'BLACK' ? '#111111' : '#39ff14';
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius - 4, angle, angle + segmentAngle);
        ctx.closePath();
        ctx.fill();

        // White border lines
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Numbers text
        ctx.save();
        ctx.rotate(angle + segmentAngle / 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.num.toString(), radius - 15, 0);
        ctx.restore();
      });

      ctx.restore();

      // Outer static ring
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
      ctx.stroke();

      // Center glowing pin
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f0ff';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Static target pointer
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - radius - 5);
      ctx.lineTo(cx + 8, cy - radius - 5);
      ctx.lineTo(cx, cy - radius + 15);
      ctx.closePath();
      ctx.fill();

      // Check if spinning is done
      if (rouletteState === 'spinning' && angularVelocityRef.current < 0.002) {
        angularVelocityRef.current = 0;
        evaluateRoulette();
      } else {
        animId = requestAnimationFrame(drawWheel);
      }
    };

    drawWheel();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, rouletteState]);

  const spinRoulette = () => {
    let hasBet = selectedNumbers.length > 0 || selectedColor !== null || selectedType !== null;
    if (rouletteState === 'spinning' || balance < bet || !hasBet) {
      if (!hasBet) setRouletteResultText('SYS_WARN: PLACE AT LEAST ONE CHIP TO COMMENCE.');
      if (balance < bet) playSound('lose');
      return;
    }
    playSound('spin');
    setRouletteState('spinning');
    updateBalance(-bet);
    setRouletteResultText('SPINNING GRID ENERGY...');

    angularVelocityRef.current = 0.45 + Math.random() * 0.2;
  };

  const evaluateRoulette = () => {
    // Determine winning number based on rotation
    // Pointer is at -Math.PI / 2 (top pointing down)
    // Find what segment is aligned with top
    let normRotation = (rotationRef.current % (Math.PI * 2));
    if (normRotation < 0) normRotation += Math.PI * 2;

    // Angle of target segment
    let topAngle = (1.5 * Math.PI - normRotation) % (Math.PI * 2);
    if (topAngle < 0) topAngle += Math.PI * 2;

    const segmentAngle = (Math.PI * 2) / ROULETTE_NUMBERS.length;
    let winningIndex = Math.floor(topAngle / segmentAngle) % ROULETTE_NUMBERS.length;
    let winner = ROULETTE_NUMBERS[winningIndex];

    setRouletteWinNumber(winner.num);
    setRouletteState('result');

    // Win Evaluation
    let totalWin = 0;
    let matchesCount = 0;

    // Check exact number bet
    if (selectedNumbers.includes(winner.num.toString())) {
      totalWin += bet * 35;
      matchesCount++;
    }

    // Check color bet
    if (selectedColor === winner.color) {
      totalWin += bet * 2;
      matchesCount++;
    }

    // Check even/odd bet
    if (selectedType !== null && winner.num !== 0) {
      let isEven = winner.num % 2 === 0;
      if (selectedType === 'EVEN' && isEven) {
        totalWin += bet * 2;
        matchesCount++;
      } else if (selectedType === 'ODD' && !isEven) {
        totalWin += bet * 2;
        matchesCount++;
      }
    }

    if (totalWin > 0) {
      updateBalance(totalWin);
      playSound('win');
      setRouletteResultText(`BALL LANDED ON ${winner.num} (${winner.color}). WINNER +$${totalWin} Credits!`);
      gainXP(30);
    } else {
      playSound('lose');
      setRouletteResultText(`BALL LANDED ON ${winner.num} (${winner.color}). DECRYPTION MISMATCH.`);
    }
  };

  const clearRouletteBets = () => {
    playSound('click');
    setSelectedNumbers([]);
    setSelectedColor(null);
    setSelectedType(null);
    setRouletteResultText('BETS CLEARED');
  };

  const toggleNumberBet = (numStr: string) => {
    playSound('click');
    setSelectedNumbers(prev => 
      prev.includes(numStr) ? prev.filter(n => n !== numStr) : [...prev, numStr]
    );
  };

  return (
    <div className="w-full min-h-screen py-12 px-4 md:px-8 bg-[#05070a] relative font-mono text-xs text-slate-300">
      
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      <div className="scanlines"></div>

      <div className="max-w-6xl mx-auto flex flex-col gap-6 relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#ff00ff]/20 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff]/30 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                DECENTRALIZED NODE: PARLOR
              </span>
              <span className="text-slate-500">//</span>
              <span className="text-slate-500 uppercase tracking-widest text-[9px]">REALTIME_BALANCES</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase leading-none">
              NEON_GRID <span className="text-[#ff00ff] hologram-text">CASINO</span>
            </h1>
          </div>

          <div className="flex flex-col md:items-end mt-4 md:mt-0 gap-1.5">
            <div className="flex gap-2">
              <span className="text-slate-500 font-bold uppercase text-[9px]">CREDIT BALANCE:</span>
              <span className="text-[#39ff14] font-black text-sm tracking-wider font-mono">${balance.toLocaleString()} CREDITS</span>
            </div>
            {user && (
              <span className="text-[9px] text-slate-500 uppercase">SYNCHRONIZING PROFILE: {user.username.toUpperCase()} (L{user.level})</span>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-900 bg-[#0c0f16]/90 p-1.5 rounded-lg">
          {[
            { id: 'slots', label: '🎰 CYBER SLOTS', color: 'text-neon-pink border-t-neon-pink' },
            { id: 'blackjack', label: '🃏 NEON BLACKJACK', color: 'text-neon-blue border-t-neon-blue' },
            { id: 'roulette', label: '🎡 DRIFT ROULETTE', color: 'text-neon-purple border-t-neon-purple' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                playSound('click');
              }}
              className={`flex-1 py-3 text-[10px] md:text-xs font-bold uppercase border-t-2 transition-all rounded-md ${
                activeTab === tab.id
                  ? `${tab.color} bg-white/5 shadow-[inset_0_0_8px_rgba(255,255,255,0.02)]`
                  : 'border-transparent text-slate-500 hover:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Betting Controls Bar */}
        <div className="hud-panel p-4 bg-[#0c0f16]/80 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-bold text-[9px]">ACTIVE BET SCHEME:</span>
            <span className="text-[#ff9f00] font-black text-sm font-mono">${bet}</span>
          </div>

          <div className="flex gap-2">
            {[10, 50, 100, 500].map(amt => (
              <button
                key={amt}
                onClick={() => handleBetChange(amt)}
                className={`px-3 py-1.5 font-bold font-mono text-[9px] border rounded transition-all ${
                  bet === amt 
                    ? 'border-[#ff9f00] bg-[#ff9f00]/10 text-white shadow-[0_0_8px_rgba(255,159,0,0.2)]'
                    : 'border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700'
                }`}
              >
                ${amt}
              </button>
            ))}
            <button
              onClick={() => handleBetChange(Math.min(balance, 1000))}
              className="px-3 py-1.5 font-bold font-mono text-[9px] border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded"
            >
              MAX
            </button>
          </div>
        </div>

        {/* =============================================================
            CYBER SLOTS GRID PANEL
            ============================================================= */}
        {activeTab === 'slots' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Slot Machine */}
            <div className="md:col-span-8 hud-panel p-8 flex flex-col items-center gap-8 bg-[#0c0f16]/70 relative overflow-hidden">
              
              {/* Top Banner */}
              <div className="text-center">
                <span className="text-[#ff00ff] font-extrabold tracking-widest text-[10px] block animate-pulse">SPIN MATRICES MATCHING CHANNELS</span>
              </div>

              {/* Glowing Reels Deck */}
              <div className="flex gap-4 md:gap-6 bg-black border-4 border-[#ff00ff] p-5 rounded-2xl shadow-[0_0_25px_rgba(255,0,255,0.2)] w-full max-w-sm justify-center">
                {reels.map((symbol, idx) => (
                  <div 
                    key={idx} 
                    className={`w-20 h-24 bg-[#110526] border border-[#ff00ff]/30 rounded-xl flex items-center justify-center text-4xl shadow-[inset_0_0_12px_rgba(255,0,255,0.08)] select-none ${
                      isSpinning ? 'animate-bounce' : ''
                    }`}
                  >
                    {symbol}
                  </div>
                ))}
              </div>

              {/* Pull Lever Command */}
              <button
                onClick={spinSlots}
                disabled={isSpinning || balance < bet}
                className={`w-full max-w-sm py-4 bg-[#ff00ff]/20 hover:bg-[#ff00ff]/40 text-[#ff00ff] border-2 border-[#ff00ff] rounded-lg font-black tracking-[0.2em] text-xs transition-all uppercase ${
                  isSpinning || balance < bet ? 'opacity-40 cursor-not-allowed' : 'shadow-[0_0_15px_rgba(255,0,255,0.25)] hover:scale-[1.01]'
                }`}
              >
                {isSpinning ? 'SPINNING...' : 'PULL SHIFT LEVER &gt;&gt;'}
              </button>

              {/* Status Indicator */}
              <div className="w-full text-center border-t border-slate-900 pt-4">
                <span className={`font-bold font-mono text-[9px] uppercase tracking-widest ${
                  slotsResultText.includes('WIN') || slotsResultText.includes('JACKPOT') ? 'text-[#39ff14]' : 'text-slate-500'
                }`}>
                  STATUS: {slotsResultText}
                </span>
              </div>
            </div>

            {/* Payout Chart */}
            <div className="md:col-span-4 hud-panel p-5 bg-[#0c0f16]/90 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">
                📡 DECRYPTION PAYOUT CHART
              </h3>
              <div className="flex flex-col gap-2 font-mono text-[10px] text-slate-400">
                {SLOTS_SYMBOLS.map(sym => (
                  <div key={sym.char} className="flex justify-between items-center bg-black/40 border border-slate-900 p-2">
                    <span className="text-lg">{sym.char} {sym.char} {sym.char}</span>
                    <span className="text-white font-extrabold">{sym.payout}x Payout</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =============================================================
            NEON BLACKJACK GRID PANEL
            ============================================================= */}
        {activeTab === 'blackjack' && (
          <div className="hud-panel p-8 bg-[#0c0f16]/70 flex flex-col items-center gap-6 relative">
            
            {blackjackState === 'betting' ? (
              <div className="py-12 flex flex-col items-center text-center gap-4">
                <span className="text-5xl">🃏</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-widest">DEALER MATRIX READY</h3>
                <p className="text-[10px] text-slate-500 max-w-xs uppercase leading-relaxed">
                  CHOOSE BET VALUES IN THE TOP CONTROLLER, THEN DEAL CHIPS TO INITIATE HAND SYNCHRONIZATION.
                </p>
                <button
                  onClick={startBlackjack}
                  disabled={balance < bet}
                  className="px-8 py-3 bg-[#00f0ff]/20 hover:bg-[#00f0ff]/40 text-[#00f0ff] border-2 border-[#00f0ff] rounded font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                >
                  DEAL CHIPS
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-8">
                
                {/* Dealer Hand */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[8px] text-slate-500 font-bold uppercase">DEALER HAND:</span>
                  <div className="flex gap-2">
                    {dealerHand.map((card, idx) => {
                      const hideCard = blackjackState === 'playing' && idx === 1;
                      return (
                        <div 
                          key={idx} 
                          className={`w-14 h-20 bg-[#110526] border-2 rounded-lg flex flex-col justify-between p-2 shadow-lg ${
                            hideCard ? 'border-red-500 animate-pulse' : 'border-[#00f0ff]'
                          }`}
                        >
                          {hideCard ? (
                            <div className="w-full h-full flex items-center justify-center text-red-500 text-lg">❓</div>
                          ) : (
                            <>
                              <div className="text-[10px] font-bold leading-none">{card.value}</div>
                              <div className={`text-center text-lg leading-none ${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-slate-200'}`}>{card.suit}</div>
                              <div className="text-[10px] font-bold leading-none text-right">{card.value}</div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {blackjackState !== 'playing' && (
                    <span className="text-[9px] font-bold text-neon-blue font-mono uppercase">DEALER SCORE: {calculateHandScore(dealerHand)}</span>
                  )}
                </div>

                {/* Player Hand */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[8px] text-slate-500 font-bold uppercase">PLAYER HAND:</span>
                  <div className="flex gap-2">
                    {playerHand.map((card, idx) => (
                      <div 
                        key={idx} 
                        className="w-14 h-20 bg-[#110526] border-2 border-[#ff9f00] rounded-lg flex flex-col justify-between p-2 shadow-lg"
                      >
                        <div className="text-[10px] font-bold leading-none">{card.value}</div>
                        <div className={`text-center text-lg leading-none ${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-slate-200'}`}>{card.suit}</div>
                        <div className="text-[10px] font-bold leading-none text-right">{card.value}</div>
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-[#ff9f00] font-mono uppercase">PLAYER SCORE: {calculateHandScore(playerHand)}</span>
                </div>

                {/* Action controls */}
                <div className="flex justify-center gap-4 border-t border-slate-900 pt-6">
                  {blackjackState === 'playing' ? (
                    <>
                      <button
                        onClick={hitBlackjack}
                        className="px-6 py-2 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/10 font-bold rounded uppercase tracking-wider"
                      >
                        HIT
                      </button>
                      <button
                        onClick={standBlackjack}
                        className="px-6 py-2 border border-[#ff9f00] text-[#ff9f00] hover:bg-[#ff9f00]/10 font-bold rounded uppercase tracking-wider"
                      >
                        STAND
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setBlackjackState('betting')}
                      className="px-6 py-2 bg-[#ff00ff]/20 border border-[#ff00ff] text-white font-bold rounded uppercase tracking-wider hover:bg-[#ff00ff]/30"
                    >
                      PLAY AGAIN
                    </button>
                  )}
                </div>

                {/* Result Info */}
                <div className="text-center mt-2">
                  <span className="font-bold font-mono text-[9px] uppercase tracking-widest text-[#39ff14]">
                    RESULT: {bjResultText}
                  </span>
                </div>

              </div>
            )}

          </div>
        )}

        {/* =============================================================
            DRIFTER ROULETTE GRID PANEL
            ============================================================= */}
        {activeTab === 'roulette' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Spinning Wheel */}
            <div className="lg:col-span-5 hud-panel p-6 flex flex-col items-center gap-4 bg-[#0c0f16]/70 relative">
              <canvas
                ref={canvasRef}
                width={260}
                height={260}
                className="bg-black/20 border border-slate-800 rounded-full shadow-lg"
              />
              <button
                onClick={spinRoulette}
                disabled={rouletteState === 'spinning'}
                className={`w-full py-3 bg-[#a800ff]/20 hover:bg-[#a800ff]/40 text-[#c259ff] border-2 border-[#a800ff] rounded font-bold uppercase tracking-wider ${
                  rouletteState === 'spinning' ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {rouletteState === 'spinning' ? 'SPINNING...' : 'RELEASE BALL'}
              </button>
              <div className="text-center text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-2 w-full uppercase">
                STATUS: {rouletteResultText}
              </div>
            </div>

            {/* Betting Board Grid */}
            <div className="lg:col-span-7 hud-panel p-5 bg-[#0c0f16]/90 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  🎰 ROULETTE BOARD BET SHEETS
                </h3>
                <button
                  onClick={clearRouletteBets}
                  className="text-red-400 text-[9px] hover:underline uppercase"
                >
                  CLEAR BETS
                </button>
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-12 gap-1 font-mono text-[9px] bg-black/60 p-2.5 border border-slate-900">
                
                {/* 0 Green slot */}
                <button
                  onClick={() => toggleNumberBet('0')}
                  className={`col-span-12 py-2 border font-bold text-center transition-all ${
                    selectedNumbers.includes('0') 
                      ? 'border-[#39ff14] bg-[#39ff14]/10 text-white' 
                      : 'border-slate-800 text-[#39ff14]'
                  }`}
                >
                  0 (GREEN)
                </button>

                {/* 1-36 slots */}
                {Array.from({ length: 36 }).map((_, i) => {
                  const num = i + 1;
                  const item = ROULETTE_NUMBERS.find(r => r.num === num)!;
                  const isSelected = selectedNumbers.includes(num.toString());
                  return (
                    <button
                      key={num}
                      onClick={() => toggleNumberBet(num.toString())}
                      className={`col-span-2 py-2.5 border font-bold text-center transition-all rounded ${
                        isSelected 
                          ? 'border-white bg-white/20 text-white font-extrabold shadow-[0_0_6px_rgba(255,255,255,0.25)]' 
                          : item.color === 'RED'
                          ? 'border-slate-800 bg-[#ff2a2a]/10 text-red-500 hover:border-slate-700'
                          : 'border-slate-800 bg-black text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}

                {/* Outer Bets Red/Black/Even/Odd */}
                <div className="col-span-12 grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-900">
                  <button
                    onClick={() => {
                      playSound('click');
                      setSelectedColor(prev => prev === 'RED' ? null : 'RED');
                    }}
                    className={`py-2 border font-bold text-center transition-all rounded text-red-500 ${
                      selectedColor === 'RED' ? 'border-red-500 bg-red-500/10 text-white' : 'border-slate-800 bg-black'
                    }`}
                  >
                    RED (2x)
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setSelectedColor(prev => prev === 'BLACK' ? null : 'BLACK');
                    }}
                    className={`py-2 border font-bold text-center transition-all rounded text-slate-200 ${
                      selectedColor === 'BLACK' ? 'border-white bg-white/10 text-white' : 'border-slate-800 bg-black'
                    }`}
                  >
                    BLACK (2x)
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setSelectedType(prev => prev === 'EVEN' ? null : 'EVEN');
                    }}
                    className={`py-2 border font-bold text-center transition-all rounded text-[#00f0ff] ${
                      selectedType === 'EVEN' ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white' : 'border-slate-800 bg-black'
                    }`}
                  >
                    EVEN (2x)
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setSelectedType(prev => prev === 'ODD' ? null : 'ODD');
                    }}
                    className={`py-2 border font-bold text-center transition-all rounded text-[#00f0ff] ${
                      selectedType === 'ODD' ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white' : 'border-slate-800 bg-black'
                    }`}
                  >
                    ODD (2x)
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
