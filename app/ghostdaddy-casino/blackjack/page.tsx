"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '../../../lib/state/UserContext';
import { useCasino } from '../../../lib/state/CasinoContext';

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  score: number;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const VALUES = [
  { val: '2', score: 2 },
  { val: '3', score: 3 },
  { val: '4', score: 4 },
  { val: '5', score: 5 },
  { val: '6', score: 6 },
  { val: '7', score: 7 },
  { val: '8', score: 8 },
  { val: '9', score: 9 },
  { val: '10', score: 10 },
  { val: 'J', score: 10 },
  { val: 'Q', score: 10 },
  { val: 'K', score: 10 },
  { val: 'A', score: 11 }
];

export default function NeonBlackjack() {
  const { user } = useUser();
  const { checkWinAllowed, processBet, processPayout, houseMargin } = useCasino();

  const [bet, setBet] = useState(10);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'resolved'>('betting');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [resultMessage, setResultMessage] = useState('PLACE WAGER TO RECEIVE DECK sync');
  const [winAmount, setWinAmount] = useState(0);

  // Stats
  const [sessionHands, setSessionHands] = useState(0);
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

  const playCardDraw = () => playSound(500, 'triangle', 0.08, 0.04);
  const playWinSound = () => {
    playSound(587.33, 'sine', 0.15, 0.08); // D5
    setTimeout(() => playSound(698.46, 'sine', 0.15, 0.08), 100); // F5
    setTimeout(() => playSound(880.00, 'sine', 0.3, 0.08), 200); // A5
  };
  const playLossSound = () => {
    playSound(150, 'sawtooth', 0.35, 0.05);
  };

  // Deck generation
  const createDeck = (): Card[] => {
    const newDeck: Card[] = [];
    for (const suit of SUITS) {
      for (const val of VALUES) {
        newDeck.push({ suit, value: val.val, score: val.score });
      }
    }
    // Shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  const getHandTotal = (hand: Card[]): number => {
    let total = hand.reduce((sum, card) => sum + card.score, 0);
    let aces = hand.filter(c => c.value === 'A').length;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return total;
  };

  const handleBetChange = (amount: number) => {
    if (gameState !== 'betting') return;
    playSound(600, 'sine', 0.05);
    setBet(prev => Math.max(10, Math.min(prev + amount, user ? user.driftCoins : 1000)));
  };

  const dealHand = () => {
    if (gameState !== 'betting') return;
    if (!user || user.driftCoins < bet) {
      playSound(200, 'sine', 0.2);
      setResultMessage('ERROR: INSUFFICIENT DRIFT BALANCE');
      return;
    }

    // Process Bet wagers
    const betSuccess = processBet(bet);
    if (!betSuccess) {
      setResultMessage('TRANSACTION ABORTED BY PROTOCOL');
      return;
    }

    setSessionHands(prev => prev + 1);
    setWinAmount(0);

    const freshDeck = createDeck();
    const pHand = [freshDeck.pop()!, freshDeck.pop()!];
    const dHand = [freshDeck.pop()!, freshDeck.pop()!];

    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDeck(freshDeck);
    setGameState('playing');
    setResultMessage('DECISION MATRIX ENABLED: HIT OR STAND?');

    playCardDraw();
    setTimeout(playCardDraw, 150);

    // Natural Blackjack check
    if (getHandTotal(pHand) === 21) {
      // Player has natural Blackjack!
      // Verify payout permission
      const winVal = Math.floor(bet * 2.5);
      const allowed = checkWinAllowed(user.username, bet, winVal);
      if (allowed) {
        setGameState('resolved');
        processPayout(winVal, true);
        playWinSound();
        setWinAmount(winVal);
        setSessionWon(prev => prev + winVal);
        setResultMessage(`BLACKJACK // SECURITY REWARDS AWARDED: 🪙 ${winVal} COINS`);
      } else {
        // Enforce House Edge Override: Shift dealer second card to hit a natural Blackjack tie.
        dHand[1] = { suit: '♠', value: 'A', score: 11 };
        setDealerHand(dHand);
        setGameState('resolved');
        processPayout(bet, true); // Push (refund bet)
        setResultMessage('NATURAL TYPED // SPLIT PUSH REFUNDED.');
      }
    }
  };

  const hit = () => {
    if (gameState !== 'playing') return;
    playCardDraw();

    const activeDeck = [...deck];
    let nextCard = activeDeck.pop()!;

    // House Edge Safety Audit:
    // If the player hits, and drawing nextCard would give them a safe total, but the house edge safety trigger is currently breached (<60% edge overall),
    // we can swap the card to bust them!
    const currentTotal = getHandTotal(playerHand);
    const potentialTotal = getHandTotal([...playerHand, nextCard]);
    if (potentialTotal > 21) {
      // They are going to bust anyway, let it happen
    } else {
      // Swap card if win is not allowed to keep house safe
      const winNotAllowed = !checkWinAllowed(user!.username, bet, bet * 2);
      if (winNotAllowed && currentTotal >= 12) {
        // Swap nextCard for a card that will cause player to bust (>21)
        const scoreNeededToBust = 22 - currentTotal;
        const bustCards = VALUES.filter(v => v.score >= scoreNeededToBust);
        if (bustCards.length > 0) {
          const chosenBustVal = bustCards[Math.floor(Math.random() * bustCards.length)];
          nextCard = { suit: SUITS[Math.floor(Math.random() * 4)], value: chosenBustVal.val, score: chosenBustVal.score };
        }
      }
    }

    const updatedHand = [...playerHand, nextCard];
    setPlayerHand(updatedHand);
    setDeck(activeDeck);

    const total = getHandTotal(updatedHand);
    if (total > 21) {
      // Player Busts
      setGameState('resolved');
      processPayout(0, false);
      playLossSound();
      setResultMessage('OVERFLOW EXCEEDED // OPERATIVE BUSTED.');
    }
  };

  const stand = () => {
    if (gameState !== 'playing') return;
    setGameState('dealerTurn');
    setResultMessage('DEALER RESOLVING OPERATIONS...');

    let activeDeck = [...deck];
    let dHand = [...dealerHand];

    const playerTotal = getHandTotal(playerHand);
    
    // Check if player has potential win
    const potentialPayout = bet * 2;
    const isWinAllowed = checkWinAllowed(user!.username, bet, potentialPayout);

    // Run dealer draw loop
    const runDealerTurn = () => {
      let dealerTotal = getHandTotal(dHand);
      
      // Dealer hits on soft 16, stands on 17
      if (dealerTotal < 17) {
        playCardDraw();
        let nextCard = activeDeck.pop()!;

        // AI balancing check
        if (!isWinAllowed) {
          // If win is NOT allowed, we can force dealer card to be highly beneficial to the dealer (e.g. hitting 20 or 21)
          const diff = 21 - dealerTotal;
          if (diff >= 2 && diff <= 11) {
            // Force the card to help dealer get to exactly 20 or 21
            const targetScore = diff === 11 ? 10 : diff; // or A
            const targetVal = VALUES.find(v => v.score === targetScore);
            if (targetVal) {
              nextCard = { suit: '♠', value: targetVal.val, score: targetVal.score };
            }
          }
        }

        dHand.push(nextCard);
        setDealerHand(dHand);
        setDeck(activeDeck);
        setTimeout(runDealerTurn, 400);
      } else {
        // Dealer stops, resolve outcome
        resolveWinner(dHand);
      }
    };

    setTimeout(runDealerTurn, 400);
  };

  const doubleDown = () => {
    if (gameState !== 'playing' || user!.driftCoins < bet) return;

    // Deduct double bet
    const betSuccess = processBet(bet);
    if (!betSuccess) return;

    const doubledBet = bet * 2;
    setBet(doubledBet);

    // Draw one card
    playCardDraw();
    const activeDeck = [...deck];
    const nextCard = activeDeck.pop()!;
    const updatedHand = [...playerHand, nextCard];
    setPlayerHand(updatedHand);
    setDeck(activeDeck);

    const total = getHandTotal(updatedHand);
    if (total > 21) {
      setGameState('resolved');
      processPayout(0, false);
      playLossSound();
      setResultMessage('OVERFLOW EXCEEDED // OPERATIVE BUSTED.');
    } else {
      // Continue to dealer turn with doubled stakes
      setGameState('dealerTurn');
      setResultMessage('DEALER RESOLVING OPERATIONS...');
      
      let dHand = [...dealerHand];
      const playerTotal = getHandTotal(updatedHand);
      const isWinAllowed = checkWinAllowed(user!.username, doubledBet, doubledBet * 2);

      const runDealerTurn = () => {
        let dealerTotal = getHandTotal(dHand);
        if (dealerTotal < 17) {
          playCardDraw();
          let nextCard = activeDeck.pop()!;
          if (!isWinAllowed) {
            const diff = 21 - dealerTotal;
            if (diff >= 2 && diff <= 11) {
              const targetVal = VALUES.find(v => v.score === (diff === 11 ? 10 : diff));
              if (targetVal) nextCard = { suit: '♠', value: targetVal.val, score: targetVal.score };
            }
          }
          dHand.push(nextCard);
          setDealerHand(dHand);
          setTimeout(runDealerTurn, 400);
        } else {
          resolveWinner(dHand, doubledBet);
        }
      };
      setTimeout(runDealerTurn, 400);
    }
  };

  const resolveWinner = (finalDealerHand: Card[], activeBetVal = bet) => {
    const pTotal = getHandTotal(playerHand);
    const dTotal = getHandTotal(finalDealerHand);

    setGameState('resolved');

    if (dTotal > 21) {
      // Dealer bust
      const winVal = activeBetVal * 2;
      processPayout(winVal, true);
      playWinSound();
      setWinAmount(winVal);
      setSessionWon(prev => prev + winVal);
      setResultMessage(`DEALER BUSTED // REWARD GRANTED: 🪙 ${winVal} COINS`);
    } else if (pTotal > dTotal) {
      // Player higher
      const winVal = activeBetVal * 2;
      processPayout(winVal, true);
      playWinSound();
      setWinAmount(winVal);
      setSessionWon(prev => prev + winVal);
      setResultMessage(`VICTORY SECURED // DEALER BEATEN. REWARD: 🪙 ${winVal} COINS`);
    } else if (pTotal < dTotal) {
      // Dealer higher
      processPayout(0, false);
      playLossSound();
      setResultMessage('DEALER BEATS HAND // SYSTEM CONSTRAINTS REMAIN ACTIVE.');
    } else {
      // Push (Tie)
      processPayout(activeBetVal, true); // Refund bet
      setResultMessage('HAND MATCHED // BREAK EVEN PUSH DETECTED.');
    }
  };

  const resetGame = () => {
    playSound(600, 'sine', 0.05);
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setResultMessage('PLACE WAGER TO RECEIVE DECK sync');
    setWinAmount(0);
    // Reset bet size if it was doubled
    if (bet > user!.driftCoins) {
      setBet(10);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#05070a] relative font-mono text-xs text-slate-300 overflow-x-hidden">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none" />
      <div className="scanlines" />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 relative z-10 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#39ff14]/30 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold px-2 py-0.5 uppercase border border-[#39ff14]/40 text-[#39ff14] bg-[#39ff14]/10">
                CARD_TERMINAL: 02
              </span>
              <span className="text-slate-600 text-[9px]">// GHOSTDADDY_CASINO</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-[0.15em] uppercase leading-none">
              NEON_<span className="text-[#39ff14] hologram-text">BLACKJACK</span>
            </h1>
            <p className="text-slate-600 text-[9px] tracking-widest uppercase mt-1">BEAT THE DEALER // BALANCING ALGORITHM ONLINE</p>
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

        {/* BOARD PLATFORM */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* THE BOARD DISPLAY */}
          <div className="md:col-span-8 space-y-6">
            
            <div className="w-full bg-[#0c0f16]/90 border-2 border-[#39ff14]/80 rounded-xl p-8 shadow-[0_0_30px_rgba(57,255,20,0.15)] relative overflow-hidden flex flex-col gap-8 min-h-[400px]">
              <div className="absolute top-2 left-2 text-[8px] text-[#39ff14] font-bold tracking-widest uppercase">HOLOGRAPHIC CARD TABLE</div>
              
              {/* DEALER ROW */}
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>DEALER HAND {gameState === 'playing' ? '(1 CARD CONCEALED)' : ''}</span>
                  <span className="font-extrabold text-white">
                    TOTAL: {gameState === 'playing' ? '?' : getHandTotal(dealerHand)}
                  </span>
                </div>

                <div className="flex gap-4">
                  {dealerHand.map((card, idx) => {
                    const isConcealed = gameState === 'playing' && idx === 1;
                    return (
                      <div
                        key={idx}
                        className={`w-20 h-28 border-2 rounded-lg flex flex-col justify-between p-2 shadow-lg relative overflow-hidden transition-all ${
                          isConcealed
                            ? 'border-slate-800 bg-slate-950/80'
                            : 'border-[#39ff14] bg-black/80'
                        }`}
                      >
                        {isConcealed ? (
                          <div className="absolute inset-0 flex items-center justify-center text-[#ff9f00] font-black text-xl animate-pulse bg-[#ff9f00]/5">
                            🔒
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="font-extrabold text-sm text-white leading-none">{card.value}</span>
                              <span className="text-lg leading-none" style={{ color: card.suit === '♥' || card.suit === '♦' ? '#ff0055' : '#39ff14' }}>
                                {card.suit}
                              </span>
                            </div>
                            
                            <div className="text-3xl text-center self-center" style={{ color: card.suit === '♥' || card.suit === '♦' ? '#ff0055' : '#39ff14' }}>
                              {card.suit}
                            </div>

                            <div className="flex justify-between transform rotate-180">
                              <span className="font-extrabold text-sm text-white leading-none">{card.value}</span>
                              <span className="text-lg leading-none" style={{ color: card.suit === '♥' || card.suit === '♦' ? '#ff0055' : '#39ff14' }}>
                                {card.suit}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {dealerHand.length === 0 && (
                    <div className="w-20 h-28 border border-dashed border-slate-900 rounded-lg flex items-center justify-center text-slate-800">
                      EMPTY
                    </div>
                  )}
                </div>
              </div>

              {/* CARD DIVIDER GRID */}
              <div className="h-[2px] bg-[#39ff14]/20 border-b border-dashed border-[#39ff14]/30 w-full" />

              {/* PLAYER ROW */}
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>YOUR HAND</span>
                  <span className="font-extrabold text-[#39ff14]">
                    TOTAL: {getHandTotal(playerHand)}
                  </span>
                </div>

                <div className="flex gap-4">
                  {playerHand.map((card, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-28 border-2 border-[#39ff14] bg-black/80 rounded-lg flex flex-col justify-between p-2 shadow-lg relative overflow-hidden transition-all hover:scale-105"
                    >
                      <div className="flex justify-between">
                        <span className="font-extrabold text-sm text-white leading-none">{card.value}</span>
                        <span className="text-lg leading-none" style={{ color: card.suit === '♥' || card.suit === '♦' ? '#ff0055' : '#39ff14' }}>
                          {card.suit}
                        </span>
                      </div>
                      
                      <div className="text-3xl text-center self-center" style={{ color: card.suit === '♥' || card.suit === '♦' ? '#ff0055' : '#39ff14' }}>
                        {card.suit}
                      </div>

                      <div className="flex justify-between transform rotate-180">
                        <span className="font-extrabold text-sm text-white leading-none">{card.value}</span>
                        <span className="text-lg leading-none" style={{ color: card.suit === '♥' || card.suit === '♦' ? '#ff0055' : '#39ff14' }}>
                          {card.suit}
                        </span>
                      </div>
                    </div>
                  ))}
                  {playerHand.length === 0 && (
                    <div className="w-20 h-28 border border-dashed border-slate-900 rounded-lg flex items-center justify-center text-slate-800">
                      EMPTY
                    </div>
                  )}
                </div>
              </div>

              {/* Terminal message */}
              <div className="bg-[#07090e] border border-slate-900 p-2.5 rounded font-mono text-center relative mt-2">
                <div className="absolute top-1 left-2 text-[7px] text-slate-700">STATUS_FEED:</div>
                <span className={`text-[9.5px] uppercase font-bold tracking-wider ${
                  winAmount > 0 ? 'text-[#39ff14]' : resultMessage.includes('BUSTED') || resultMessage.includes('ERROR') ? 'text-[#ff0055]' : 'text-slate-400'
                }`}>
                  {resultMessage}
                </span>
              </div>

            </div>

            {/* ACTION TRIGGERS */}
            <div className="hud-panel p-6 bg-black/60 rounded-xl border border-slate-900 flex flex-col gap-4">
              
              {gameState === 'betting' ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
                  {/* Bet configuration */}
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <span className="text-[9.5px] text-slate-500 uppercase tracking-widest font-bold">// WAGER QUANTUM</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBetChange(-10)}
                        disabled={bet <= 10}
                        className="w-10 h-10 border border-slate-800 bg-[#090b11] hover:border-slate-600 text-white font-black text-sm rounded transition-all disabled:opacity-30"
                      >
                        -
                      </button>
                      <div className="px-6 py-2 border border-[#39ff14]/30 bg-black text-[#39ff14] font-extrabold text-sm min-w-[80px] text-center rounded">
                        🪙 {bet}
                      </div>
                      <button
                        onClick={() => handleBetChange(10)}
                        disabled={user ? bet >= user.driftCoins : false}
                        className="w-10 h-10 border border-slate-800 bg-[#090b11] hover:border-slate-600 text-white font-black text-sm rounded transition-all disabled:opacity-30"
                      >
                        +
                      </button>
                      <button
                        onClick={() => { if (user) setBet(Math.min(user.driftCoins, 500)); }}
                        className="px-3 py-2.5 border border-slate-800 bg-[#090b11] hover:border-slate-600 text-slate-400 font-bold text-[9px] uppercase tracking-wider rounded transition-all"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={dealHand}
                    className="w-full sm:w-60 py-4 bg-[#39ff14] text-black font-black tracking-[0.25em] text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.25)] hover:bg-[#39ff14]/80 transition-all"
                  >
                    ▶ DEAL HAND
                  </button>
                </div>
              ) : gameState === 'playing' ? (
                <div className="grid grid-cols-3 gap-4 w-full">
                  <button
                    onClick={hit}
                    className="py-4 bg-[#39ff14]/20 border-2 border-[#39ff14] text-[#39ff14] font-black uppercase text-xs tracking-wider rounded-lg hover:bg-[#39ff14]/30 transition-all"
                  >
                    HIT
                  </button>
                  <button
                    onClick={stand}
                    className="py-4 bg-slate-900 border-2 border-slate-700 text-slate-300 font-black uppercase text-xs tracking-wider rounded-lg hover:border-slate-500 hover:text-white transition-all"
                  >
                    STAND
                  </button>
                  <button
                    onClick={doubleDown}
                    disabled={user!.driftCoins < bet}
                    className="py-4 bg-[#ff9f00]/20 border-2 border-[#ff9f00] text-[#ff9f00] font-black uppercase text-xs tracking-wider rounded-lg hover:bg-[#ff9f00]/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Double your wager for exactly one more card"
                  >
                    DOUBLE
                  </button>
                </div>
              ) : (
                <button
                  onClick={resetGame}
                  className="w-full py-4 bg-[#39ff14] text-black font-black tracking-[0.25em] text-xs uppercase rounded-lg hover:bg-[#39ff14]/80 transition-all"
                >
                  ▶ SECURE NEXT HAND
                </button>
              )}

            </div>

          </div>

          {/* THE STATISTICS & GUIDE */}
          <div className="md:col-span-4 space-y-4">
            
            {/* INSTRUCTIONS */}
            <div className="hud-panel p-5 bg-[#0c0f16]/60 border border-slate-900 rounded-lg">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold block border-b border-slate-900 pb-2 mb-3">// HOUSE INSTRUCTIONS</span>
              
              <ul className="space-y-2 list-disc pl-3 text-slate-400 text-[10.5px]">
                <li>Dealer stands on <span className="text-white font-bold">17</span> and hits on soft <span className="text-white font-bold">16</span>.</li>
                <li>Double Down allowed on any starting pair of cards, drawing exactly one card.</li>
                <li>Natural Blackjack awards <span className="text-[#39ff14] font-bold">3:2 (2.5x bet)</span>.</li>
                <li>Splits & side bets are currently in encryption phase.</li>
              </ul>
            </div>

            {/* STATISTICS */}
            <div className="hud-panel p-4 bg-black/60 border border-slate-900 rounded-lg text-[9.5px]">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold block border-b border-slate-900 pb-2 mb-3">// OPERATIVE STATISTICS</span>
              <div className="space-y-2 text-slate-400">
                <div className="flex justify-between">
                  <span>HANDS ENCOUNTERED:</span>
                  <span className="text-white font-extrabold font-mono">{sessionHands}</span>
                </div>
                <div className="flex justify-between">
                  <span>HANDS WON:</span>
                  <span className="text-[#39ff14] font-extrabold font-mono">🪙 {sessionWon}</span>
                </div>
                <div className="flex justify-between">
                  <span>NET PULL:</span>
                  <span className={`font-extrabold font-mono ${sessionWon - (sessionHands * bet) >= 0 ? 'text-[#39ff14]' : 'text-[#ff0055]'}`}>
                    {sessionWon - (sessionHands * bet) >= 0 ? '+' : ''}{sessionWon - (sessionHands * bet)} Coins
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
