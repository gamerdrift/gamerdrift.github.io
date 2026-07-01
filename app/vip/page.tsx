"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '../../lib/state/UserContext';
import Link from 'next/link';

export default function VIPPage() {
  const { user, buyVIP, addCoins, claimDailyBonus } = useUser();
  const [purchaseMethod, setPurchaseMethod] = useState<'coins' | 'stripe' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Stripe form fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');

  // VIP cockpit state
  const [customTheme, setCustomTheme] = useState<'cyan' | 'pink' | 'amber' | 'green'>('cyan');

  // Auto-format card inputs
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(v);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      setCardExpiry(`${v.substring(0, 2)}/${v.substring(2, 4)}`);
    } else {
      setCardExpiry(v);
    }
  };

  const playBeepSound = (freq = 440) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } catch {}
  };

  const handleCoinPurchase = async () => {
    if (!user) return;
    if ((user.driftCoins || 0) < 500) {
      setErrorMsg("INSUFFICIENT DRIFT_COINS balance. Earn more by playing or watching transmissions.");
      playBeepSound(220);
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    playBeepSound(600);

    setTimeout(async () => {
      // Deduct coins
      addCoins(-500);
      await buyVIP();
      setIsProcessing(false);
      setSuccess(true);
      playBeepSound(880);
    }, 2000);
  };

  const handleStripePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
      setErrorMsg("CREDENTIAL ERROR: Fill all telemetry bank coordinates.");
      playBeepSound(220);
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    playBeepSound(600);

    setTimeout(async () => {
      await buyVIP();
      setIsProcessing(false);
      setSuccess(true);
      playBeepSound(880);
    }, 2500);
  };

  // Get theme glow shadows
  const getThemeColor = () => {
    switch (customTheme) {
      case 'pink': return '#ff0055';
      case 'amber': return '#ff9f00';
      case 'green': return '#39ff14';
      default: return '#00f0ff';
    }
  };

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-black relative font-mono text-xs text-slate-300">
      {/* Background elements */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      <div className="scanlines"></div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Telemetry Header */}
        <div className="border-b border-[#00f0ff]/20 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-[9px] text-[#ff9f00] tracking-[0.3em] uppercase block mb-1">PREMIUM ACCESS MODULE</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-widest leading-none">
              DRIFT_PASS <span className="text-[#00f0ff] uppercase font-light">VIP</span>
            </h1>
          </div>
          <span className="text-[9px] text-[#39ff14] bg-[#39ff14]/5 border border-[#39ff14]/20 px-3 py-1 flex items-center gap-1.5 uppercase font-bold animate-pulse">
            <span className="w-1.5 h-1.5 bg-[#39ff14] rounded-full"></span> SECURE GATEWAY ENCRYPTED
          </span>
        </div>

        {/* IF USER ALREADY HAS VIP */}
        {user?.isVIP ? (
          <div 
            className="hud-panel p-6 md:p-8 bg-[#070a10]/95 border-2 rounded-xl transition-all duration-500 space-y-6"
            style={{ 
              borderColor: getThemeColor(),
              boxShadow: `0 0 25px ${getThemeColor()}20`
            }}
          >
            {/* VIP Cockpit welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                  ⚡ WELCOME BACK, DRIFTER ELITE
                </h2>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">
                  DRIFT_PASS SUBSCRIPTION STATUS: <span className="text-[#39ff14] font-bold">ACTIVE (PERPETUAL LICENSE)</span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={claimDailyBonus}
                  className="px-4 py-2 bg-[#ff9f00]/10 border border-[#ff9f00]/50 hover:bg-[#ff9f00]/25 text-[#ff9f00] font-bold text-[9px] tracking-wider uppercase transition-all"
                >
                  🎁 CLAIM DAILY VIP BONUS
                </button>
              </div>
            </div>

            {/* Cockpit grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* VIP Perks stats */}
              <div className="space-y-4 bg-black/40 border border-slate-900 p-4 rounded-lg">
                <h3 className="text-white font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1.5">
                  &gt; RUNTIME PERKS ENHANCED
                </h3>
                <ul className="space-y-2.5 text-[10px]">
                  <li className="flex justify-between items-center text-[#39ff14]">
                    <span>COIN ACQUISITION MULTIPLIER:</span>
                    <span className="font-bold border border-[#39ff14]/30 px-1.5 py-0.5 bg-[#39ff14]/10">2.0X (ACTIVE)</span>
                  </li>
                  <li className="flex justify-between items-center text-[#39ff14]">
                    <span>EXPERIENCE GAIN DECK TICK:</span>
                    <span className="font-bold border border-[#39ff14]/30 px-1.5 py-0.5 bg-[#39ff14]/10">2.0X (ACTIVE)</span>
                  </li>
                  <li className="flex justify-between items-center text-[#ff9f00]">
                    <span>UNLOCKED USER CLASSIFICATION:</span>
                    <span className="font-bold">VIP DRIFTER ELITE</span>
                  </li>
                  <li className="flex justify-between items-center text-[#00f0ff]">
                    <span>CHAT CUSTOMIZATION COLOR:</span>
                    <span className="font-bold">CYBER GLOW UNLOCKED</span>
                  </li>
                </ul>
              </div>

              {/* Theme Console customizer */}
              <div className="space-y-4 bg-black/40 border border-slate-900 p-4 rounded-lg">
                <h3 className="text-white font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1.5">
                  &gt; SYSTEM CORE THEME SELECTOR
                </h3>
                <p className="text-slate-400 text-[9.5px] leading-relaxed">
                  Modify the telemetry hud aesthetic color spectrum below. Changes apply instantly to your terminal cockpit dashboard.
                </p>

                <div className="grid grid-cols-4 gap-2 pt-2">
                  {[
                    { id: 'cyan', label: 'Cyan', color: '#00f0ff' },
                    { id: 'pink', label: 'Pink', color: '#ff0055' },
                    { id: 'amber', label: 'Amber', color: '#ff9f00' },
                    { id: 'green', label: 'Green', color: '#39ff14' }
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setCustomTheme(theme.id as any);
                        playBeepSound(500);
                      }}
                      className={`py-2 border text-[9px] uppercase font-bold text-center tracking-wider transition-all ${
                        customTheme === theme.id 
                          ? 'text-black' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                      style={{
                        borderColor: theme.color,
                        backgroundColor: customTheme === theme.id ? theme.color : 'transparent',
                        boxShadow: customTheme === theme.id ? `0 0 10px ${theme.color}35` : 'none'
                      }}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 text-center">
              <Link 
                href="/store"
                className="inline-block px-6 py-2.5 bg-transparent border text-white hover:text-black font-sans font-bold tracking-widest text-[9.5px] uppercase transition-all duration-300"
                style={{
                  borderColor: getThemeColor(),
                  boxShadow: `0 0 10px ${getThemeColor()}20`,
                  backgroundImage: `linear-gradient(to right, transparent 50%, ${getThemeColor()} 50%)`,
                  backgroundSize: '200% 100%',
                  backgroundPosition: 'left bottom',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundPosition = 'right bottom';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundPosition = 'left bottom';
                }}
              >
                ◀ VISIT PREMIUM STORE VAULT
              </Link>
            </div>
          </div>
        ) : (
          /* IF USER DOES NOT HAVE VIP YET */
          <div className="space-y-6">
            
            {/* Promo grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="hud-panel p-5 bg-[#070a10]/80 border border-[#ff9f00]/30 hover:border-[#ff9f00] transition-colors space-y-2">
                <span className="text-xl">💰</span>
                <h3 className="text-white text-[11px] font-black uppercase tracking-wider">2X COIN REWARDS</h3>
                <p className="text-slate-400 text-[9.5px] leading-relaxed">
                  Earn double Drift Coins on all play-to-earn news interactions, gaming maps extracts, and operations.
                </p>
              </div>

              <div className="hud-panel p-5 bg-[#070a10]/80 border border-[#00f0ff]/30 hover:border-[#00f0ff] transition-colors space-y-2">
                <span className="text-xl">⚡</span>
                <h3 className="text-white text-[11px] font-black uppercase tracking-wider">2X XP MULTIPLIER</h3>
                <p className="text-slate-400 text-[9.5px] leading-relaxed">
                  Level up your drifter deck at double velocity. Rank higher on the global leaderboards with ease.
                </p>
              </div>

              <div className="hud-panel p-5 bg-[#070a10]/80 border border-[#39ff14]/30 hover:border-[#39ff14] transition-colors space-y-2">
                <span className="text-xl">💎</span>
                <h3 className="text-white text-[11px] font-black uppercase tracking-wider">EXCLUSIVE VAULTS</h3>
                <p className="text-slate-400 text-[9.5px] leading-relaxed">
                  Unlock access to the premium store vault keys, custom character skins, and limited VIP badges.
                </p>
              </div>

            </div>

            {/* Purchase Terminals */}
            {!purchaseMethod ? (
              <div className="hud-panel p-8 bg-gradient-to-b from-[#070a10] to-black border border-slate-900 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="space-y-2 max-w-md">
                  <h2 className="text-base font-extrabold text-white uppercase tracking-wider">ACTIVATE DRIFT PASS VIP</h2>
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    Connecting to the command deck requires validating credentials. Choose your payment method below to establish premium link.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <button
                    onClick={() => { setPurchaseMethod('coins'); playBeepSound(450); }}
                    className="px-5 py-3 border border-[#ff9f00] bg-[#ff9f00]/10 hover:bg-[#ff9f00]/20 text-[#ff9f00] font-bold tracking-widest text-[9.5px] uppercase transition-all shadow-[0_0_12px_rgba(255,159,0,0.1)] text-center"
                  >
                    💳 500 DRIFT COINS
                  </button>
                  <button
                    onClick={() => { setPurchaseMethod('stripe'); playBeepSound(450); }}
                    className="px-5 py-3 border border-[#00f0ff] bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] font-bold tracking-widest text-[9.5px] uppercase transition-all shadow-[0_0_12px_rgba(0,240,255,0.1)] text-center"
                  >
                    💵 MOCK SUBSCRIPTION ($4.99/mo)
                  </button>
                </div>
              </div>
            ) : success ? (
              /* Success terminal receipt view */
              <div className="hud-panel p-8 bg-[#0a100f] border border-[#39ff14] rounded-xl text-center space-y-6 animate-pulse-slow">
                <div className="w-16 h-16 border-2 border-[#39ff14] rounded-full flex items-center justify-center mx-auto bg-[#39ff14]/10 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                  <span className="text-[#39ff14] text-2xl">✔</span>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-white text-lg font-black tracking-widest uppercase">CONNECTION STABLISHED SUCCESSFUL</h2>
                  <p className="text-[#39ff14] text-[10px] uppercase font-bold tracking-wider">
                    DECK LICENSE WRITTEN // VIP DRIFTER DEPLOYED IN CLIENT MEMORY
                  </p>
                </div>
                
                <p className="text-slate-400 text-[9.5px] max-w-sm mx-auto leading-relaxed">
                  Your VIP benefits (2x multipliers, custom profiles) are now active in the system core telemetry. Welcome to the elite grid.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setPurchaseMethod(null);
                      playBeepSound(500);
                    }}
                    className="px-5 py-2 bg-[#39ff14] text-black hover:bg-[#39ff14]/80 font-bold tracking-wider text-[9.5px] uppercase transition-all shadow-[0_0_12px_rgba(57,255,20,0.25)]"
                  >
                    ▶ LOAD VIP COCKPIT TERMINAL
                  </button>
                </div>
              </div>
            ) : (
              /* Purchase Form interface */
              <div className="hud-panel p-6 md:p-8 bg-[#0c0f16]/95 border-2 rounded-xl relative transition-all duration-300" style={{ borderColor: purchaseMethod === 'coins' ? '#ff9f00' : '#00f0ff' }}>
                <button
                  onClick={() => { setPurchaseMethod(null); setErrorMsg(''); playBeepSound(350); }}
                  className="absolute top-4 right-4 w-7 h-7 border border-slate-800 text-slate-500 hover:border-slate-500 hover:text-white flex items-center justify-center font-bold font-mono transition-colors"
                >
                  ✕
                </button>

                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 mb-5 uppercase tracking-wide text-[9px] font-bold">
                    ⚠️ ALERT: {errorMsg}
                  </div>
                )}

                {/* Coins Purchase Method */}
                {purchaseMethod === 'coins' && (
                  <div className="space-y-6">
                    <h3 className="text-white text-sm font-black uppercase tracking-wider border-b border-slate-900 pb-2">
                      🪙 BUY VIP DECK VIA DRIFT_COINS
                    </h3>
                    <div className="flex justify-between items-center bg-black/40 border border-slate-800 p-4">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[8px] uppercase tracking-wider block">YOUR BALANCE</span>
                        <span className="text-[#ff9f00] text-base font-black">🪙 {user?.driftCoins || 0} COINS</span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-slate-500 text-[8px] uppercase tracking-wider block">LICENSE PRICE</span>
                        <span className="text-[#ff9f00] text-base font-black">🪙 500 COINS</span>
                      </div>
                    </div>
                    
                    <p className="text-slate-400 text-[9.5px] leading-relaxed">
                      Confirming will deduct 500 Drift Coins from your wallet balance and write the permanent VIP license to your active node session.
                    </p>

                    <button
                      onClick={handleCoinPurchase}
                      disabled={isProcessing}
                      className="w-full py-3 bg-[#ff9f00] hover:bg-[#ff9f00]/80 text-black font-extrabold tracking-widest text-[10px] uppercase transition-all shadow-[0_0_15px_rgba(255,159,0,0.25)] flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <span className="animate-pulse">DECRYPTING AND DEDUCTING...</span>
                      ) : (
                        '✔ CONFIRM DEDUCTION & ACQUIRE VIP'
                      )}
                    </button>
                  </div>
                )}

                {/* Credit Card / Stripe Purchase Method */}
                {purchaseMethod === 'stripe' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-900 pb-2 flex justify-between items-center">
                      <h3 className="text-white text-sm font-black uppercase tracking-wider">
                        💳 MOCK STRIPE GATEWAY TERMINAL
                      </h3>
                      <span className="text-[7.5px] text-[#00f0ff] font-bold uppercase tracking-wider border border-[#00f0ff]/30 px-1.5 py-0.5 bg-[#00f0ff]/10">
                        USD $4.99/mo (SIMULATED)
                      </span>
                    </div>

                    <form onSubmit={handleStripePurchase} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="space-y-1">
                          <label className="text-slate-500 text-[8.5px] uppercase tracking-wider block">CARDHOLDER NAME</label>
                          <input
                            type="text"
                            required
                            placeholder="NEO NETRUNNER"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full bg-black border border-slate-800 hover:border-[#00f0ff]/50 focus:border-[#00f0ff] px-3 py-2 text-white placeholder-slate-700 focus:outline-none uppercase font-mono transition-colors text-[9.5px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-500 text-[8.5px] uppercase tracking-wider block">CREDIT CARD NUMBER</label>
                          <input
                            type="text"
                            required
                            maxLength={19}
                            placeholder="4000 1234 5678 9010"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            className="w-full bg-black border border-slate-800 hover:border-[#00f0ff]/50 focus:border-[#00f0ff] px-3 py-2 text-white placeholder-slate-700 focus:outline-none font-mono transition-colors text-[9.5px]"
                          />
                        </div>

                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        
                        <div className="space-y-1">
                          <label className="text-slate-500 text-[8.5px] uppercase tracking-wider block">EXPIRY DATE (MM/YY)</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            placeholder="12/29"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            className="w-full bg-black border border-slate-800 hover:border-[#00f0ff]/50 focus:border-[#00f0ff] px-3 py-2 text-white placeholder-slate-700 focus:outline-none font-mono transition-colors text-[9.5px] text-center"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-500 text-[8.5px] uppercase tracking-wider block">SECURITY CVC CODE</label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            placeholder="***"
                            value={cardCVC}
                            onChange={(e) => setCardCVC(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-black border border-slate-800 hover:border-[#00f0ff]/50 focus:border-[#00f0ff] px-3 py-2 text-white placeholder-slate-700 focus:outline-none font-mono transition-colors text-[9.5px] text-center"
                          />
                        </div>

                      </div>

                      <p className="text-slate-500 text-[8px] leading-relaxed uppercase">
                        🔒 THIS IS A SECURE SANDBOX TRANSACTION FOR DEMONSTRATION. NO ACTUAL DOLLARS WILL BE CHARGED. PRESS SUBMIT TO SIMULATE COMPLETED STRIPE DEPOSIT.
                      </p>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-3 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-extrabold tracking-widest text-[10px] uppercase transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <span className="animate-pulse">AUTHORIZING AND SYNCING DECK...</span>
                        ) : (
                          '▶ SUBMIT SECURE TELEMETRY DEPOSIT'
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
