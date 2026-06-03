"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const footerLinks = [
    { name: 'Drifter Home', href: '/' },
    { name: 'Node Archive (Games)', href: '/games' },
    { name: 'Score Registries', href: '/leaderboard' },
    { name: 'Support Transceiver', href: '/contact' }
  ];

  const tags = [
    'Action', 'Racing', 'Shooting', 'Casual', 'Puzzle', 'Retro', 'Multiplayer', 'Arcade', '3D', 'Driving', 'Sports'
  ];

  return (
    <footer className="w-full bg-[#07020d] border-t border-neon-pink/20 pt-16 pb-8 px-4 md:px-8 relative overflow-hidden">
      {/* Background Cyber Grid Accent */}
      <div className="absolute inset-0 bg-cyber-grid opacity-5 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 relative z-10">
        
        {/* Column 1: Brand Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <span className="text-xl font-black text-white tracking-widest font-sans uppercase">
              GAMER<span className="text-neon-blue font-semibold">DRIFT</span>
            </span>
          </div>
          <p className="text-xs text-text-secondary font-mono leading-relaxed">
            The next-generation decentralized browser gaming terminal. Connect your neural node, download raw HTML5 game packets, and join standard lobbies.
          </p>
          {/* Social Neon Links */}
          <div className="flex space-x-3 mt-2">
            {['👾 Discord', '🐙 GitHub', '✖️ Twitter', '📺 YouTube'].map(soc => (
              <a
                key={soc}
                href="#"
                className="text-[10px] font-bold font-mono tracking-wider text-neon-blue border border-neon-blue/20 bg-black/40 hover:bg-neon-blue/15 hover:border-neon-blue/50 hover:text-white px-2 py-1.5 rounded transition-all duration-300 hover:-translate-y-0.5"
              >
                {soc}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold font-mono text-neon-blue uppercase tracking-widest border-b border-neon-blue/10 pb-1.5">
            TERMINAL PATHWAYS
          </h4>
          <ul className="flex flex-col gap-2.5">
            {footerLinks.map(link => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-xs font-medium text-text-secondary hover:text-neon-pink transition-colors duration-200"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Category Tags */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold font-mono text-neon-pink uppercase tracking-widest border-b border-neon-pink/10 pb-1.5">
            SECTOR STREAM TAGS
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <Link
                key={tag}
                href={`/games/?category=${tag}`}
                className="text-[9px] font-bold font-mono uppercase px-2 py-1 rounded bg-[#150a21]/50 border border-white/5 text-gray-400 hover:text-white hover:border-neon-pink/40 hover:shadow-[0_0_8px_rgba(255,0,255,0.15)] transition-all duration-300"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Column 4: Newsletter Sign up */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold font-mono text-neon-blue uppercase tracking-widest border-b border-neon-blue/10 pb-1.5">
            NEWSLETTER UPLINK
          </h4>
          <p className="text-xs text-text-secondary font-mono leading-relaxed">
            Get patch notes, tournament alerts, and new releases directly in your database.
          </p>
          
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="drifter@network.net"
                className="bg-black/60 border border-neon-blue/30 rounded-lg px-3 py-2 text-white placeholder-gray-700 font-mono text-xs focus:outline-none focus:border-neon-blue focus:shadow-[0_0_8px_rgba(0,240,255,0.2)] transition-all duration-300 flex-grow"
              />
              <button
                type="submit"
                className="neon-button text-xs py-2 px-3 font-bold tracking-wider"
              >
                JOIN
              </button>
            </form>
          ) : (
            <div className="text-[11px] font-mono text-neon-blue border border-neon-blue/30 bg-neon-blue/5 p-3 rounded-lg text-center animate-pulse">
              ⚡ Uplink Synchronized!
            </div>
          )}
        </div>

      </div>

      {/* Credits & Bottom Bar */}
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-gray-600 gap-4">
        <span>© 2026 GAMERDRIFT HQ. ALL DECENTRALIZED DATA RIGHTS RESERVED.</span>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-neon-pink transition-colors">SECURITY_PROTOCOL</a>
          <a href="#" className="hover:text-neon-pink transition-colors">PRIVACY_INDEX</a>
          <a href="#" className="hover:text-neon-pink transition-colors">TERM_CONSTRAINTS</a>
        </div>
      </div>
    </footer>
  );
}
