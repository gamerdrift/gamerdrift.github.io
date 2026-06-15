"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useGames } from '../lib/state/GameContext';
import { useUser } from '../lib/state/UserContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { games } = useGames();
  const { user, logout } = useUser();

  if (pathname === '/chat-hub') return null;

  // Navigation Structure
  const primaryLinks = [
    { name: 'Home', href: '/' },
    { name: 'RogueGhost', href: '/rogueghost' },
    { name: 'News', href: '/news' },
    { name: 'Community', href: '/community' },
    { name: 'Leaderboards', href: '/leaderboard' },
    { name: 'Tournaments', href: '/tournaments' },
    { name: 'Store', href: '/store' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const megaMenuCategories = [
    { name: 'Action', href: '/games/?category=Action', icon: '⚔️' },
    { name: 'Shooting', href: '/games/?category=Shooting', icon: '🔫' },
    { name: 'Racing', href: '/games/?category=Racing', icon: '🏎️' },
    { name: 'Casual', href: '/games/?category=Casual', icon: '🎯' },
    { name: 'Puzzle', href: '/games/?category=Puzzle', icon: '🧩' },
    { name: 'Retro', href: '/games/?category=Retro', icon: '👾' },
    { name: 'Multiplayer', href: '/games/?category=Multiplayer', icon: '👥' },
    { name: 'Arcade', href: '/games/?category=Arcade', icon: '🕹️' }
  ];

  // UI States
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refs for click-outside
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  // Pre-seeded tactical alerts
  const [notifications, setNotifications] = useState([
    { id: '1', text: 'TACTICAL ALERT: RogueGhost – New Sandbath mission sector is now live!', read: false, time: '2h ago' },
    { id: '2', text: 'SECURE_LINK: RogueGhost v0.2 Cargology map coordinates released.', read: false, time: '1d ago' },
    { id: '3', text: 'SYSTEM: Weekly global leaderboard scores compiled.', read: true, time: '3d ago' }
  ]);

  // Autocomplete search matching
  const filteredSuggestions = searchQuery.trim().length > 0 
    ? games
        .filter(g => g.approved && g.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      router.push(`/rogueghost`);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-[#05070a]/90 backdrop-blur-md border-b border-[#00f0ff]/20 px-4 lg:px-8 py-3 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50">
      
      {/* Top row: Brand & Operations panel toggles */}
      <div className="w-full md:w-auto flex justify-between items-center">
        {/* Futuristic Military Badge Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10 border border-[#00f0ff] flex items-center justify-center bg-black/80 shadow-[0_0_15px_rgba(0,240,255,0.25)] group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all">
            <div className="absolute inset-0.5 border border-[#00f0ff]/40 bg-gradient-to-br from-black to-[#05070a] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-[#00f0ff]"></div>
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#00f0ff]"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-[0.2em] font-mono text-lg group-hover:text-[#00f0ff] transition-colors leading-none">GAMERDRIFT</span>
            <span className="text-[#ff9f00] text-[9px] font-mono tracking-[0.25em] leading-none uppercase mt-1">COMMAND_ deck v2.6</span>
          </div>
        </Link>

        {/* Mobile controls */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 border border-[#00f0ff]/30 flex items-center justify-center text-white bg-black/60 relative"
          >
            🔔
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#ff9f00]" />
            )}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 border border-[#00f0ff]/30 flex items-center justify-center text-white bg-black/60 font-bold"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Main Navigation Telemetry Deck */}
      <nav className="hidden md:flex flex-wrap justify-center items-center gap-2 my-3 md:my-0 lg:max-w-6xl">
        {primaryLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-[11px] md:text-xs font-mono font-bold tracking-wider uppercase border rounded-md transition-all duration-300 ${
                isActive 
                  ? 'border-[#00f0ff]/50 bg-[#00f0ff]/10 text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.2)]' 
                  : 'border-slate-800/80 bg-[#090b11]/60 text-slate-400 hover:text-white hover:border-[#00f0ff]/30 hover:bg-[#00f0ff]/5'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Secure link actions, Search, Alerts & User Node */}
      <div className="hidden md:flex items-center space-x-3.5">
        
        {/* Secure Node Search */}
        <div className="relative w-44 lg:w-56" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="SEARCH NODE_ID..."
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-[#00f0ff]/30 px-3 py-1.5 text-white placeholder-slate-600 font-mono text-[10px] focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
            />
            <button type="submit" className="absolute right-2.5 top-1.5 text-[#00f0ff] hover:text-[#ff9f00] text-xs">
              🔍
            </button>
          </form>

          {/* Autocomplete Predictive Uplink */}
          {searchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute top-9 left-0 right-0 bg-[#0c0f16] border border-[#00f0ff]/30 p-2.5 shadow-[0_10px_25px_rgba(0,240,255,0.15)] z-50 flex flex-col gap-1.5 font-mono text-[10px]">
              <div className="text-[#00f0ff] border-b border-[#00f0ff]/10 pb-1 flex justify-between">
                <span>PREDICTIVE SEARCH</span>
                <span className="animate-pulse">ONLINE</span>
              </div>
              {filteredSuggestions.map(g => (
                <Link
                  key={g.id}
                  href={`/play/${g.id}/`}
                  onClick={() => {
                    setSearchQuery('');
                    setSearchFocused(false);
                  }}
                  className="flex items-center gap-2 p-1 hover:bg-[#00f0ff]/10 transition-colors text-white"
                >
                  <img src={g.thumbnail} alt={g.title} className="w-6 h-6 object-cover border border-[#00f0ff]/10" />
                  <span className="truncate hover:text-[#00f0ff]">{g.title}</span>
                </Link>
              ))}
              {filteredSuggestions.length === 0 && (
                <div className="text-slate-500 text-center py-2">No matching nodes found.</div>
              )}
            </div>
          )}
        </div>

        {/* Tactical alerts bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 border border-[#00f0ff]/30 flex items-center justify-center text-white bg-black/60 hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all relative"
            title="Operational Telemetry Alerts"
          >
            🔔
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff9f00] animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute top-11 right-0 w-72 bg-[#0c0f16] border border-[#00f0ff]/30 p-3.5 shadow-[0_10px_30px_rgba(0,240,255,0.2)] z-50 flex flex-col gap-2 font-mono text-[10px]">
              <div className="text-[#ff9f00] border-b border-[#ff9f00]/10 pb-1.5 flex justify-between items-center font-bold">
                <span>INTEL BROADCASTS</span>
                <button onClick={markAllNotificationsRead} className="text-[#00f0ff] hover:underline text-[9px]">Mark read</button>
              </div>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-2 border ${n.read ? 'bg-black/20 border-slate-800 text-slate-400' : 'bg-[#ff9f00]/5 border-[#ff9f00]/20 text-white'}`}>
                    <div>{n.text}</div>
                    <div className="text-[8px] text-slate-500 mt-1">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Secure User Intake / Sign In */}
        <div className="relative" ref={profileRef}>
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="h-9 px-3 border border-[#00f0ff] bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] font-mono text-[10px] tracking-wider uppercase flex items-center gap-2 transition-all shadow-[0_0_8px_rgba(0,240,255,0.2)]"
              >
                <span>{user.username.toUpperCase()}</span>
                <span className="bg-[#ff9f00] text-black font-bold px-1 text-[8px] rounded">L{user.level}</span>
              </button>

              {profileOpen && (
                <div className="absolute top-11 right-0 w-52 bg-[#0c0f16] border border-[#00f0ff]/30 p-3 shadow-[0_10px_25px_rgba(0,240,255,0.2)] z-50 flex flex-col gap-3 font-mono text-[10px] text-slate-300">
                  <div className="border-b border-[#00f0ff]/10 pb-2">
                    <div className="font-extrabold text-white text-xs">{user.username}</div>
                    <div className="text-[8px] text-[#ff9f00] mt-0.5 uppercase">{user.role} INTERFACE ACTIVE</div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[8px]">
                      <span>XP: {user.xp} / {user.xpToNextLevel}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                      <div className="bg-[#ff9f00] h-full" style={{ width: `${(user.xp / user.xpToNextLevel) * 100}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-2">
                    <Link href="/profile" onClick={() => setProfileOpen(false)} className="hover:text-[#00f0ff] py-1">COMMAND DECK</Link>
                    {user.role === 'Admin' && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)} className="hover:text-[#ff9f00] py-1">SYSOP PANEL</Link>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                      router.push('/');
                    }}
                    className="w-full border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-white font-bold py-1.5 transition-colors uppercase text-[9px] tracking-widest mt-1"
                  >
                    DISCONNECT
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link 
                href="/auth" 
                className="px-3.5 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase border border-[#00f0ff]/40 text-[#00f0ff] bg-transparent hover:bg-[#00f0ff]/10 transition-all"
              >
                Sign In
              </Link>
              <Link 
                href="/auth?tab=register" 
                className="px-3.5 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase border border-[#ff9f00] text-black bg-[#ff9f00] hover:bg-[#ff9f00]/80 transition-all shadow-[0_0_10px_rgba(255,159,0,0.2)]"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Visible on toggle) */}
      {mobileMenuOpen && (
        <div className="w-full md:hidden flex flex-col mt-4 border-t border-[#00f0ff]/20 pt-4 gap-4 font-mono text-xs">
          
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="SEARCH NODE_ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/80 border border-[#00f0ff]/20 px-3 py-2 text-white text-xs"
            />
            <button type="submit" className="absolute right-3 top-2 text-[#00f0ff]">🔍</button>
          </form>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <div className="text-[9px] text-[#00f0ff] border-b border-[#00f0ff]/10 pb-1 uppercase tracking-wider font-bold">PATHWAYS</div>
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 border border-transparent transition-all ${
                  pathname === link.href 
                    ? 'border-[#00f0ff]/20 bg-[#00f0ff]/5 text-[#00f0ff]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-2">
            <div className="text-[9px] text-[#ff9f00] border-b border-[#ff9f00]/10 pb-1 uppercase tracking-wider font-bold">CATEGORY FILTER</div>
            <div className="grid grid-cols-2 gap-1.5">
              {megaMenuCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 p-2 bg-black/40 border border-slate-800 text-[10px] text-slate-300"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User profile controls on mobile */}
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
            {user ? (
              <div className="flex flex-col gap-2 bg-slate-900/40 p-3 border border-[#00f0ff]/10">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs">{user.username}</span>
                  <span className="bg-[#ff9f00] text-black font-bold px-1.5 py-0.5 text-[9px] rounded">L{user.level}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="py-2 bg-black/40 border border-slate-800 text-center text-[10px] hover:text-[#00f0ff]">Command Deck</Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      router.push('/');
                    }}
                    className="py-2 bg-red-950/20 border border-red-500/20 text-center text-[10px] text-red-400 hover:bg-red-900/20"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full py-2 bg-transparent border border-[#00f0ff]/30 text-center hover:bg-[#00f0ff]/10 text-white font-bold text-xs uppercase">Sign In</Link>
                <Link href="/auth?tab=register" onClick={() => setMobileMenuOpen(false)} className="w-full py-2 bg-[#ff9f00] border border-[#ff9f00] text-center hover:bg-[#ff9f00]/80 text-black font-bold text-xs uppercase">Join Now</Link>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
