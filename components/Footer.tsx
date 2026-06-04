"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [ping, setPing] = useState(14);
  const [activeNodes, setActiveNodes] = useState(1024);

  useEffect(() => {
    const interval = setInterval(() => {
      setPing(prev => Math.max(10, Math.min(45, prev + Math.floor(Math.random() * 5) - 2)));
      setActiveNodes(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const commandLinks = [
    { name: 'Home Deck', href: '/' },
    { name: 'Tactical Newsroom', href: '/news' },
    { name: 'About Dossier', href: '/about' },
    { name: 'Comms Uplink', href: '/contact' }
  ];

  const intelLinks = [
    { name: 'Games Database', href: '/games' },
    { name: 'CunningCats Racing', href: '/cunningcats' },
    { name: 'RogueGhost Operations', href: '/rogueghost' },
    { name: 'Leaderboards Matrix', href: '/leaderboard' }
  ];

  const operationsLinks = [
    { name: 'Community Clan Files', href: '/community' },
    { name: 'Tournament Schedules', href: '/tournaments' },
    { name: 'Quartermaster Store', href: '/store' },
    { name: 'Secure Terminal Auth', href: '/auth' }
  ];

  return (
    <footer className="w-full bg-[#05070a] border-t border-[#00f0ff]/20 pt-12 pb-8 px-4 md:px-8 relative overflow-hidden font-mono text-[11px] text-slate-400">
      
      {/* Background Grid Lines Overlay */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
        
        {/* Column 1: Command Brand & Telemetry */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-white tracking-[0.25em] uppercase">
              GAMER<span className="text-[#00f0ff]">DRIFT</span> HQ
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed uppercase">
            SECURE DECENTRALIZED OPERATIONS CENTRE. ALL DRIFTER UPLINKS LOGGED AND ROUTED THROUGH ZERO-LATENCY SECURE GATEWAY SHIELDS.
          </p>
          
          {/* Telemetry readout widgets */}
          <div className="grid grid-cols-2 gap-2 mt-2 bg-black/40 border border-slate-800 p-2.5 max-w-xs">
            <div>
              <span className="text-slate-600 block text-[9px] uppercase tracking-wider">NET_LATENCY</span>
              <span className="text-[#00f0ff] font-bold text-xs">{ping}ms <span className="text-[8px] text-slate-500 font-normal">// SYNCED</span></span>
            </div>
            <div>
              <span className="text-slate-600 block text-[9px] uppercase tracking-wider">ACTIVE_NODES</span>
              <span className="text-[#ff9f00] font-bold text-xs">{activeNodes} <span className="text-[8px] text-slate-500 font-normal">// UPLINKED</span></span>
            </div>
            <div className="col-span-2 border-t border-slate-800/80 pt-1.5 mt-1.5 flex justify-between items-center text-[9px]">
              <span>SECURE_ENCRYPTION_MODE</span>
              <span className="text-[#39ff14] animate-pulse">AES-256</span>
            </div>
          </div>
        </div>

        {/* Column 2: Command Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[#00f0ff] uppercase tracking-wider font-bold text-[10px] border-b border-[#00f0ff]/20 pb-1.5">
            [ COMMAND ]
          </h4>
          <ul className="flex flex-col gap-2">
            {commandLinks.map(link => (
              <li key={link.name}>
                <Link href={link.href} className="hover:text-white hover:underline transition-colors uppercase text-[10px]">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Intel Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[#ff9f00] uppercase tracking-wider font-bold text-[10px] border-b border-[#ff9f00]/20 pb-1.5">
            [ INTELLIGENCE ]
          </h4>
          <ul className="flex flex-col gap-2">
            {intelLinks.map(link => (
              <li key={link.name}>
                <Link href={link.href} className="hover:text-white hover:underline transition-colors uppercase text-[10px]">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Ops & Store */}
        <div className="flex flex-col gap-3">
          <h4 className="text-slate-200 uppercase tracking-wider font-bold text-[10px] border-b border-slate-800 pb-1.5">
            [ LOGISTICS ]
          </h4>
          <ul className="flex flex-col gap-2">
            {operationsLinks.map(link => (
              <li key={link.name}>
                <Link href={link.href} className="hover:text-white hover:underline transition-colors uppercase text-[10px]">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Broadcast Uplink Subscription & Socials */}
      <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-900">
        
        {/* Newsletter subscription form */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] uppercase text-[#00f0ff] tracking-wider font-bold">SECURE LOGS BROADCAST BROADCASTING</span>
          <p className="text-[9px] text-slate-500 uppercase leading-relaxed max-w-sm">
            Receive intel digests, operational updates, and tournament schedules directly in your inbox registry.
          </p>
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="INPUT DRIFTER EMAIL..."
                className="bg-black/60 border border-[#00f0ff]/30 px-3 py-2 text-white placeholder-slate-700 text-[10px] focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_8px_rgba(0,240,255,0.2)] transition-all flex-grow"
              />
              <button
                type="submit"
                className="px-3.5 bg-[#00f0ff]/10 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/20 font-bold uppercase text-[9px] tracking-wider"
              >
                SYNC
              </button>
            </form>
          ) : (
            <div className="text-[10px] text-[#39ff14] border border-[#39ff14]/30 bg-[#39ff14]/5 p-2 max-w-sm text-center animate-pulse">
              ⚡ DRIFTER NODE REGISTERED FOR DIRECT INTEL
            </div>
          )}
        </div>

        {/* Social nodes */}
        <div className="flex flex-col md:items-end gap-3">
          <span className="text-[10px] uppercase text-slate-500 tracking-wider">COMMAND CHANNELS</span>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'DISCORD_NET', icon: '👾' },
              { name: 'STEAM_GRID', icon: '🎮' },
              { name: 'GITHUB_REPOS', icon: '🐙' },
              { name: 'COMMMS_X', icon: '✖️' }
            ].map(soc => (
              <a
                key={soc.name}
                href="#"
                className="text-[9px] font-bold tracking-wider text-[#00f0ff] border border-[#00f0ff]/20 bg-black/40 hover:bg-[#00f0ff]/15 hover:border-[#00f0ff]/60 px-2.5 py-1.5 transition-all"
              >
                {soc.icon} {soc.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Security Dossier footer bottom */}
      <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-slate-900/60 flex flex-col sm:flex-row justify-between items-center text-[9px] text-slate-600 gap-4">
        <span>© 2026 GAMERDRIFT HQ. REGISTRATION MATRIX: #404261-GD.</span>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-[#00f0ff] transition-colors">SECURITY_PROTOCOL</a>
          <a href="#" className="hover:text-[#ff9f00] transition-colors">PRIVACY_POLICY</a>
          <a href="#" className="hover:text-white transition-colors">TERMINAL_USAGE_POLICY</a>
        </div>
      </div>
    </footer>
  );
}
