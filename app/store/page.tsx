"use client";

import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: 'Gaming Chairs' | 'Racing Wheels' | 'Gaming PCs' | 'Graphics Cards' | 'Keyboards' | 'Mice' | 'Headsets' | 'Controllers' | 'Streaming Equipment';
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  affiliateUrl: string;
  features: string[];
  isDeal?: boolean;
}

const mockProducts: Product[] = [
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
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const categories = ['All', 'Gaming Chairs', 'Racing Wheels', 'Gaming PCs', 'Graphics Cards', 'Keyboards', 'Mice', 'Headsets', 'Controllers', 'Streaming Equipment'];

  const filteredProducts = selectedCat === 'All'
    ? mockProducts
    : mockProducts.filter(p => p.category === selectedCat);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      setOrderComplete(true);
      setTimeout(() => setOrderComplete(false), 4000);
    }, 2000);
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
                <span className="absolute bottom-2.5 right-2.5 bg-black/85 text-white font-bold border border-slate-800 text-[10px] px-2 py-0.5">${p.price}</span>
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

                {/* Affiliate & Purchase button */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-900">
                  <a 
                    href={p.affiliateUrl} 
                    target="_blank"
                    className="border border-[#00f0ff]/40 bg-transparent text-[#00f0ff] hover:bg-[#00f0ff]/10 text-center py-2 text-[9px] uppercase font-bold tracking-wider"
                  >
                    AMAZON_LINK
                  </a>
                  <button 
                    onClick={() => setSelectedProduct(p)}
                    className="bg-[#ff9f00] text-black hover:bg-[#ff9f00]/80 text-center py-2 text-[9px] uppercase font-bold tracking-wider"
                  >
                    DIRECT_UPLINK
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="hud-panel max-w-md w-full bg-[#0c0f16] p-6 relative">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-7 h-7 border border-[#ff9f00]/30 text-[#ff9f00] flex items-center justify-center font-bold hover:bg-[#ff9f00]/10"
              >
                ✕
              </button>

              <h2 className="text-sm font-extrabold text-white border-b border-slate-900 pb-2 mb-4 uppercase tracking-wider">
                DIRECT_DROPSHIP_INTAKE
              </h2>

              <div className="mb-4 bg-black/40 border border-slate-800 p-3">
                <span className="text-[9px] text-slate-500 uppercase block">Selected Module</span>
                <span className="text-white font-bold uppercase block">{selectedProduct.name}</span>
                <span className="text-[#00f0ff] font-bold block mt-1">${selectedProduct.price}</span>
              </div>

              {!orderComplete ? (
                <form onSubmit={handleOrderSubmit} className="flex flex-col gap-4 font-mono text-[10px]">
                  <div className="flex flex-col gap-1">
                    <label className="text-[#ff9f00] font-bold uppercase">Drifter Delivery Address *</label>
                    <input 
                      type="text" 
                      required 
                      className="bg-black/60 border border-slate-800 px-3 py-2 text-white placeholder-slate-700" 
                      placeholder="e.g. Sector 4, Neo-Tokyo, Grid 9" 
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[#00f0ff] font-bold uppercase">Secure Transaction Token *</label>
                    <input 
                      type="password" 
                      required 
                      className="bg-black/60 border border-slate-800 px-3 py-2 text-white placeholder-slate-700" 
                      placeholder="••••••••••••••••" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isOrdering}
                    className="w-full bg-[#ff9f00] text-black font-extrabold py-3 uppercase tracking-widest mt-2 hover:bg-[#ff9f00]/80 disabled:opacity-50"
                  >
                    {isOrdering ? 'TRANSMITTING_ORDER_REQUISITION...' : 'FINALIZE_DROPSHIP_UPLINK'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-[#39ff14] flex items-center justify-center text-xl text-[#39ff14] animate-bounce">✓</div>
                  <h3 className="text-xs font-bold text-white uppercase">ORDER PACKETS TRANSMITTED</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed uppercase">Dropshipping requisition established. Tracking codes logged to system. Check drifter communications logs.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
