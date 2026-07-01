"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '../../lib/state/UserContext';

interface Product {
  id: string;
  name: string;
  category: 'Gaming Chairs' | 'Racing Wheels' | 'Gaming PCs' | 'Keyboards' | 'Mice' | 'Digital Vault';
  price: number;
  coinPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  affiliateUrl: string;
  features: string[];
  isDeal?: boolean;
  isDigital?: boolean;
}

const mockProducts: Product[] = [
  {
    id: 'digital-1',
    name: 'Cyber-Ghost Elite Character Skin (RogueGhost)',
    category: 'Digital Vault',
    price: 9.99,
    coinPrice: 300,
    rating: 4.9,
    reviewCount: 312,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    affiliateUrl: '#',
    features: ['Glowing cyber-mesh details', 'Exclusive reload animations', 'Premium audio feedback'],
    isDigital: true
  },
  {
    id: 'digital-2',
    name: 'Sandbath Map Expansion Key',
    category: 'Digital Vault',
    price: 4.99,
    coinPrice: 150,
    rating: 4.8,
    reviewCount: 187,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    affiliateUrl: '#',
    features: ['Unlocks Sector 5: Sand Dunes', '2 extra stealth objectives', 'Desert camo skin pack'],
    isDigital: true,
    isDeal: true
  },
  {
    id: 'digital-3',
    name: 'Tactical Amber Theme License',
    category: 'Digital Vault',
    price: 2.99,
    coinPrice: 100,
    rating: 4.7,
    reviewCount: 95,
    imageUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=400&q=80',
    affiliateUrl: '#',
    features: ['Activates warm amber HUD console theme', 'Imperial HUD logo badge', 'Premium ambient sounds'],
    isDigital: true
  },
  {
    id: 'prod-1',
    name: 'GamerDrift Nitro-Throne Command Chair',
    category: 'Gaming Chairs',
    price: 349.99,
    rating: 4.8,
    reviewCount: 142,
    imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fce6e?auto=format&fit=crop&w=400&q=80',
    affiliateUrl: 'https://amazon.com',
    features: ['Armored ergonomics', 'Tactical lumbar support', 'Desert sandstorm pattern weave'],
    isDeal: true
  },
  {
    id: 'prod-2',
    name: 'ApexForce DirectDrive Racing Wheel',
    category: 'Racing Wheels',
    price: 499.99,
    rating: 4.9,
    reviewCount: 88,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    affiliateUrl: 'https://amazon.com',
    features: ['CunningCats nitro haptics', '12 Nm torque motors', 'Carbon paddle shifters']
  },
  {
    id: 'prod-3',
    name: 'Ghost-Core Intel 9 Gaming PC',
    category: 'Gaming PCs',
    price: 2499.99,
    rating: 4.7,
    reviewCount: 31,
    imageUrl: 'https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?auto=format&fit=crop&w=400&q=80',
    affiliateUrl: 'https://amazon.com',
    features: ['RTX 5080 Tactical GPU', '32GB low-latency RAM', 'Custom liquid grid coolant'],
    isDeal: true
  },
  {
    id: 'prod-4',
    name: 'DriftClick Optical Gaming Keyboard',
    category: 'Keyboards',
    price: 129.99,
    rating: 4.6,
    reviewCount: 204,
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=400&q=80',
    affiliateUrl: 'https://amazon.com',
    features: ['Laser optical switches', 'Glowing cyan keycaps', 'Titanium cover plate']
  },
  {
    id: 'prod-5',
    name: 'Ghost-Eye Ultralight Tactical Mouse',
    category: 'Mice',
    price: 89.99,
    rating: 4.7,
    reviewCount: 165,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80',
    affiliateUrl: 'https://amazon.com',
    features: ['52g honeycomb frame', '30k DPI optical sensors', '0.1ms click latencies']
  }
];

export default function StorePage() {
  const { user, addCoins, gainXP } = useUser();
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Custom checkout options
  const [paymentOption, setPaymentOption] = useState<'coins' | 'stripe'>('coins');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories = ['All', 'Digital Vault', 'Gaming Chairs', 'Racing Wheels', 'Gaming PCs', 'Keyboards', 'Mice'];

  const filteredProducts = selectedCat === 'All'
    ? mockProducts
    : mockProducts.filter(p => p.category === selectedCat);

  // Set default payment method when a product is clicked
  useEffect(() => {
    if (selectedProduct) {
      setPaymentOption(selectedProduct.isDigital ? 'coins' : 'stripe');
      setCardNumber('');
      setCardExpiry('');
      setCardCVC('');
      setCardName('');
      setErrorMsg('');
    }
  }, [selectedProduct]);

  // Credit card formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    setCardNumber(parts.length > 0 ? parts.join(' ') : v);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      setCardExpiry(`${v.substring(0, 2)}/${v.substring(2, 4)}`);
    } else {
      setCardExpiry(v);
    }
  };

  const playTickSound = (high = false) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(high ? 900 : 400, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch {}
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("UPLINK_ERROR: Sign in to establish drifter transaction links.");
      playTickSound(false);
      return;
    }

    if (paymentOption === 'coins') {
      const cost = selectedProduct?.coinPrice || Math.floor((selectedProduct?.price || 0) * 50);
      if (user.driftCoins < cost) {
        setErrorMsg(`INSUFFICIENT DRIFT_COINS: Need ${cost} coins, balance is ${user.driftCoins}.`);
        playTickSound(false);
        return;
      }

      setIsOrdering(true);
      setErrorMsg('');
      playTickSound(true);

      setTimeout(() => {
        addCoins(-cost);
        gainXP(30);
        setIsOrdering(false);
        setOrderComplete(true);
        setTimeout(() => {
          setOrderComplete(false);
          setSelectedProduct(null);
        }, 3000);
      }, 2000);
    } else {
      // Mock Stripe Card transaction
      if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
        setErrorMsg("CREDENTIAL_ERROR: Fill in all credit telemetry credentials.");
        playTickSound(false);
        return;
      }

      setIsOrdering(true);
      setErrorMsg('');
      playTickSound(true);

      setTimeout(() => {
        gainXP(50);
        setIsOrdering(false);
        setOrderComplete(true);
        setTimeout(() => {
          setOrderComplete(false);
          setSelectedProduct(null);
        }, 3000);
      }, 2500);
    }
  };

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-black relative font-mono text-xs">
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="border-b border-[#00f0ff]/20 pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-[10px] text-[#ff9f00] tracking-[0.3em] block mb-1">DRIFTER QUARTERMASTER LOGISTICS</span>
            <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase">STORE_DECK</h1>
          </div>
          <span className="text-[9px] border border-[#00f0ff]/20 bg-[#00f0ff]/5 px-3 py-1 text-[#00f0ff]">
            SUPPLY_LINE: SECURE // RATES_AFFILIATED
          </span>
        </div>

        {/* Top featured deals bar */}
        <div className="hud-panel p-5 bg-[#ff9f00]/5 border-[#ff9f00]/30 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-left">
            <span className="bg-[#ff9f00] text-black font-extrabold px-2 py-1 text-[10px] uppercase animate-pulse">FEATURED_DEAL</span>
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase">SAVE 15% ON GHOST-CORE TACTICAL COMPUTERS</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Use voucher code <span className="text-[#00f0ff] font-bold">DRIFTER_CORE_50</span> at dropshipping intake.</p>
            </div>
          </div>
          <button onClick={() => setSelectedCat('Gaming PCs')} className="hud-btn px-4 py-2 border-[#ff9f00] text-[#ff9f00] hover:bg-[#ff9f00]/10 shrink-0">VIEW_SPECIFICATIONS</button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 text-[10px] border uppercase transition-all ${
                selectedCat === cat
                  ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff]'
                  : 'border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {filteredProducts.map(p => (
            <div key={p.id} className="hud-panel p-4 flex flex-col h-full">
              <div className="relative h-44 bg-slate-950/80 border border-slate-900 overflow-hidden mb-4">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover opacity-75 hover:scale-105 transition-transform duration-300" />
                {p.isDeal && (
                  <span className="absolute top-2.5 left-2.5 bg-[#ff9f00] text-black font-bold text-[8px] px-1.5 py-0.5 uppercase">DEAL</span>
                )}
                {p.isDigital ? (
                  <span className="absolute bottom-2.5 right-2.5 bg-black/85 text-[#ff9f00] font-bold border border-[#ff9f00]/40 text-[10px] px-2 py-0.5">🪙 {p.coinPrice} COINS</span>
                ) : (
                  <span className="absolute bottom-2.5 right-2.5 bg-black/85 text-white font-bold border border-slate-800 text-[10px] px-2 py-0.5">${p.price}</span>
                )}
              </div>
              
              <div className="flex flex-col flex-grow">
                <span className="text-[9px] text-[#ff9f00] uppercase tracking-wider">{p.category}</span>
                <h3 className="text-xs font-bold text-white uppercase mt-1 leading-snug">{p.name}</h3>
                
                {/* Features list */}
                <ul className="text-[10px] text-slate-500 mt-3 space-y-1 leading-relaxed flex-grow">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex gap-1.5 items-center">
                      <span className="text-[#00f0ff]">»</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Rating review block */}
                <div className="flex gap-2 items-center mt-4 text-[9px] text-slate-400">
                  <span className="text-yellow-500">★ {p.rating}</span>
                  <span>({p.reviewCount} verified drifters)</span>
                </div>

                {/* Purchase Button */}
                <div className="grid grid-cols-1 mt-4 pt-4 border-t border-slate-900">
                  <button 
                    onClick={() => setSelectedProduct(p)}
                    className="bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black text-center py-2 text-[9px] uppercase font-bold tracking-widest shadow-[0_0_8px_rgba(0,240,255,0.15)] hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {p.isDigital ? '🔓 REDEEM DIGITAL ITEM' : '💳 ACQUIRE HARDWARE LINK'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* COMPARISON TABLE */}
        <div className="hud-panel p-5 mb-8">
          <h2 className="text-sm font-bold text-white border-b border-[#00f0ff]/20 pb-2 mb-4 uppercase tracking-wider">
            HARDWARE_SPEC_COMPARISON
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold text-[9px]">
                  <th className="py-2.5 uppercase">PRODUCT NAME</th>
                  <th className="py-2.5 uppercase">CATEGORY</th>
                  <th className="py-2.5 uppercase">TOLERANCE / SPECS</th>
                  <th className="py-2.5 uppercase">RATING SCORE</th>
                  <th className="py-2.5 uppercase text-right">CREDITS VALUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                <tr>
                  <td className="py-3 font-bold text-white uppercase">GamerDrift Nitro Chair</td>
                  <td className="py-3 text-slate-500">Chairs</td>
                  <td className="py-3">Armored weave, 160° tilt</td>
                  <td className="py-3 text-[#39ff14]">★ 4.8 / 5</td>
                  <td className="py-3 text-right text-[#00f0ff] font-bold">$349.99</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-white uppercase">ApexForce Steering Wheel</td>
                  <td className="py-3 text-slate-500">Racing Wheels</td>
                  <td className="py-3">12 Nm torque, direct-drive</td>
                  <td className="py-3 text-[#39ff14]">★ 4.9 / 5</td>
                  <td className="py-3 text-right text-[#00f0ff] font-bold">$499.99</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-white uppercase">Ghost-Core Intel 9 PC</td>
                  <td className="py-3 text-slate-500">Gaming PCs</td>
                  <td className="py-3">RTX 5080, custom cooling grid</td>
                  <td className="py-3 text-[#39ff14]">★ 4.7 / 5</td>
                  <td className="py-3 text-right text-[#00f0ff] font-bold">$2499.99</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Dropshipping/Order checkout modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="hud-panel max-w-md w-full bg-[#0c0f16]/95 border border-[#00f0ff]/30 p-6 relative font-mono text-[10px]">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-7 h-7 border border-[#ff9f00]/30 text-[#ff9f00] flex items-center justify-center font-bold hover:bg-[#ff9f00]/10"
              >
                ✕
              </button>

              <h2 className="text-sm font-extrabold text-white border-b border-slate-900 pb-2 mb-4 uppercase tracking-widest">
                {selectedProduct.isDigital ? '🔐 DIGITAL VAULT DECRYPTOR' : '🚛 DIRECT DROPSHIP INTAKE'}
              </h2>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 mb-4 uppercase font-bold">
                  ⚠️ WARNING: {errorMsg}
                </div>
              )}

              {/* Product preview card */}
              <div className="mb-4 bg-black/60 border border-slate-800 p-3.5 flex justify-between items-center rounded">
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">Selected Module</span>
                  <span className="text-white font-bold uppercase block text-xs mt-0.5">{selectedProduct.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-slate-500 uppercase block">Cost</span>
                  <span className="text-[#00f0ff] font-black text-xs block mt-0.5">
                    {paymentOption === 'coins' 
                      ? `🪙 ${selectedProduct.coinPrice || Math.floor(selectedProduct.price * 50)} Coins` 
                      : `$${selectedProduct.price}`}
                  </span>
                </div>
              </div>

              {!orderComplete ? (
                <div className="space-y-4">
                  
                  {/* Payment option tabs */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentOption('coins')}
                      className={`py-2 text-[8px] font-bold uppercase border transition-all ${
                        paymentOption === 'coins' 
                          ? 'border-[#ff9f00] bg-[#ff9f00]/10 text-[#ff9f00]' 
                          : 'border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      🪙 DRIFT COINS
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentOption('stripe')}
                      className={`py-2 text-[8px] font-bold uppercase border transition-all ${
                        paymentOption === 'stripe' 
                          ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff]' 
                          : 'border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      💳 STRIPE CREDIT
                    </button>
                  </div>

                  <form onSubmit={handleOrderSubmit} className="space-y-4 font-mono text-[10px]">
                    {paymentOption === 'coins' ? (
                      <div className="space-y-3 bg-black/30 border border-slate-900 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 uppercase text-[8px]">YOUR WALLET BALANCE:</span>
                          <span className="text-[#ff9f00] font-black">🪙 {user?.driftCoins || 0} COINS</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-900 pt-2 text-slate-400">
                          <span>DEDUCTION AMOUNT:</span>
                          <span className="font-bold text-[#ff9f00]">🪙 {selectedProduct.coinPrice || Math.floor(selectedProduct.price * 50)} COINS</span>
                        </div>
                        <p className="text-[8px] text-slate-500 leading-relaxed uppercase pt-1 border-t border-slate-900">
                          Confirming the transaction will deduct virtual coins from your client session database and generate immediate download coordinates.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Live debit card graphic */}
                        <div className="w-full h-28 rounded-lg bg-gradient-to-br from-[#0c0f16] to-[#04060a] border border-[#00f0ff]/40 p-3 relative flex flex-col justify-between overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                          <div className="flex justify-between items-start">
                            <span className="text-[#00f0ff] font-bold tracking-widest text-[8px]">DRIFT_DECK CARD</span>
                            <span className="text-slate-600 font-black">💳</span>
                          </div>
                          
                          <div className="text-white text-xs font-mono tracking-[0.25em] text-center my-2 select-none">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>

                          <div className="flex justify-between items-center text-[7.5px] text-slate-500">
                            <div>
                              <span className="block text-[6px] uppercase tracking-wider text-slate-600">CARDHOLDER</span>
                              <span className="text-slate-300 font-bold uppercase">{cardName || 'NEO NETRUNNER'}</span>
                            </div>
                            <div className="text-right">
                              <span className="block text-[6px] uppercase tracking-wider text-slate-600">EXPIRY</span>
                              <span className="text-slate-300 font-bold">{cardExpiry || 'MM/YY'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card input forms */}
                        <div className="space-y-2.5 pt-1.5">
                          <div className="flex flex-col gap-1">
                            <label className="text-slate-500 text-[8px] uppercase">CARDHOLDER NAME</label>
                            <input 
                              type="text" 
                              required 
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              className="bg-black/60 border border-slate-800 focus:border-[#00f0ff] px-3 py-1.5 text-white placeholder-slate-700 focus:outline-none uppercase" 
                              placeholder="e.g. NEO NETRUNNER" 
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-slate-500 text-[8px] uppercase">CARD NUMBER</label>
                            <input 
                              type="text" 
                              required 
                              maxLength={19}
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              className="bg-black/60 border border-slate-800 focus:border-[#00f0ff] px-3 py-1.5 text-white placeholder-slate-700 focus:outline-none" 
                              placeholder="e.g. 4000 1234 5678 9010" 
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-slate-500 text-[8px] uppercase">EXPIRY (MM/YY)</label>
                              <input 
                                type="text" 
                                required 
                                maxLength={5}
                                value={cardExpiry}
                                onChange={handleExpiryChange}
                                className="bg-black/60 border border-slate-800 focus:border-[#00f0ff] px-3 py-1.5 text-white placeholder-slate-700 focus:outline-none text-center" 
                                placeholder="12/29" 
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-slate-500 text-[8px] uppercase">CVC CODE</label>
                              <input 
                                type="password" 
                                required 
                                maxLength={4}
                                value={cardCVC}
                                onChange={(e) => setCardCVC(e.target.value.replace(/[^0-9]/g, ''))}
                                className="bg-black/60 border border-slate-800 focus:border-[#00f0ff] px-3 py-1.5 text-white placeholder-slate-700 focus:outline-none text-center" 
                                placeholder="***" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isOrdering}
                      className="w-full bg-[#00f0ff] text-black font-extrabold py-3 uppercase tracking-widest mt-2 hover:bg-[#00f0ff]/80 disabled:opacity-50 transition-all flex justify-center items-center"
                      style={{
                        backgroundColor: paymentOption === 'coins' ? '#ff9f00' : '#00f0ff',
                        boxShadow: paymentOption === 'coins' ? '0 0 10px rgba(255,159,0,0.15)' : '0 0 10px rgba(0,240,255,0.15)'
                      }}
                    >
                      {isOrdering ? 'TRANSMITTING_ORDER_TELEMETRY...' : 'FINALIZE_TRANSACTION_LINK'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-[#39ff14] flex items-center justify-center text-xl text-[#39ff14] animate-bounce">✓</div>
                  <h3 className="text-xs font-bold text-white uppercase">ORDER PACKETS TRANSMITTED</h3>
                  <p className="text-[10px] text-[#39ff14] leading-relaxed uppercase">
                    {selectedProduct.isDigital 
                      ? 'TELEMETRY DECRYPTED SUCCESSFUL: Vault download coordinates logged to system.'
                      : 'Dropshipping requisition established. Tracking codes logged to system. Check drifter communication logs.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
