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

  // Navigation Links
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Games', href: '/games' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Contact', href: '/contact' }
  ];

  // Categories for Mega Menu
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

  // UI Open/Close States
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Refs for clicking outside to close panels
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  // Notifications Array
  const [notifications, setNotifications] = useState([
    { id: '1', text: 'New Release: Space Shooter is now online!', read: false, time: '2h ago' },
    { id: '2', text: 'Drifter Badge unlocked: "Cyber Uplink Est."', read: false, time: '1d ago' },
    { id: '3', text: 'Weekly high score board is reset.', read: true, time: '3d ago' }
  ]);

  // Handle Search input change
  const filteredSuggestions = searchQuery.trim().length > 0 
    ? games
        .filter(g => g.approved && g.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
    : [];

  // Typo tolerance suggestions (Fuzzy match)
  const getFuzzySuggestions = () => {
    if (searchQuery.trim().length < 2) return [];
    return games
      .filter(g => {
        if (!g.approved) return false;
        const title = g.title.toLowerCase();
        const query = searchQuery.toLowerCase();
        // Check if query shares at least 2 chars or starts with same letter
        return title.startsWith(query[0]) && (title.includes(query) || query.split('').filter(char => title.includes(char)).length > 3);
      })
      .slice(0, 3);
  };

  const fuzzySuggestions = searchQuery.trim().length > 0 && filteredSuggestions.length === 0
    ? getFuzzySuggestions()
    : [];

  // Theme Toggle Effect
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  // Click outside listener
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      router.push(`/games/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="w-full h-[90px] md:h-[110px] bg-[#090311]/90 backdrop-blur-lg border-b border-neon-blue/20 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50 transition-all duration-300">
      <div className="flex items-center space-x-6 lg:space-x-10 h-full flex-grow overflow-hidden">
        {/* Cyberpunk hanging plate for Logo */}
        <Link href="/" className="relative z-50 block transition-transform duration-300 hover:scale-[1.03] active:scale-95 flex-shrink-0">
          <div className="bg-[#12021c] border-2 border-t-0 border-neon-blue rounded-b-2xl px-4 py-3 shadow-[0_10px_25px_rgba(0,240,255,0.35),inset_0_1px_2px_rgba(255,255,255,0.1)] flex items-center justify-center -mt-[2px] w-[180px] sm:w-[230px] md:w-[250px] h-[70px] sm:h-[85px] md:h-[95px]">
            <img 
              src="/mylogo.png" 
              alt="GamerDrift Logo" 
              className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
            />
          </div>
        </Link>

        {/* Navigation Tabs Aligned in Row */}
        <nav className="hidden lg:flex items-center space-x-6 overflow-x-auto scrollbar-none py-2 flex-shrink-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  isActive ? 'metal-plate-tab-active' : 'metal-plate-tab'
                } px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Mega Menu Toggle */}
          <div className="relative" ref={megaMenuRef}>
            <button
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className={`metal-plate-tab px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-1.5 ${
                megaMenuOpen ? 'border-neon-pink text-neon-pink' : ''
              }`}
            >
              CATEGORIES <span className="text-[10px]">{megaMenuOpen ? '▲' : '▼'}</span>
            </button>

            {megaMenuOpen && (
              <div className="absolute top-12 left-0 w-[420px] bg-[#12021c]/95 border border-neon-pink/40 rounded-xl p-4 shadow-[0_10px_30px_rgba(255,0,255,0.25)] backdrop-blur-md grid grid-cols-2 gap-2.5 z-50 transition-all duration-300 animate-fade-in">
                <div className="col-span-2 text-[10px] font-bold tracking-widest font-mono text-neon-pink mb-1 pb-1 border-b border-neon-pink/10">
                  UPLINK TERMINAL CHANNELS
                </div>
                {megaMenuCategories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setMegaMenuOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-neon-blue/10 bg-black/40 hover:bg-neon-blue/10 hover:border-neon-blue/40 text-sm font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-white hover:text-neon-blue">{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Interactive Search Bar, Profile, Notifications & Toggles */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        
        {/* Instant Autocomplete Search */}
        <div className="relative hidden md:block w-64 lg:w-72" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="SEARCH NODE_ID..."
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#150a21]/60 border border-neon-blue/40 rounded-lg pl-4 pr-10 py-2 text-white placeholder-gray-500 font-mono text-xs focus:outline-none focus:border-neon-blue focus:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all duration-300"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-neon-blue hover:text-neon-pink text-xs font-bold transition-colors">
              🔍
            </button>
          </form>

          {/* Autocomplete Predictions Panel */}
          {searchFocused && (searchQuery.trim().length > 0) && (
            <div className="absolute top-11 left-0 right-0 bg-[#0f0719]/95 border border-neon-blue/40 rounded-xl p-3 shadow-[0_10px_30px_rgba(0,240,255,0.25)] backdrop-blur-md z-50 flex flex-col gap-2 animate-fade-in">
              <div className="text-[10px] font-bold tracking-widest font-mono text-neon-blue border-b border-neon-blue/10 pb-1 flex justify-between">
                <span>PREDICTIVE SEARCH UPLINKS</span>
                <span className="animate-pulse">ONLINE</span>
              </div>
              
              {/* Direct matches */}
              {filteredSuggestions.map(g => (
                <Link
                  key={g.id}
                  href={`/play/${g.id}/`}
                  onClick={() => {
                    setSearchQuery('');
                    setSearchFocused(false);
                  }}
                  className="flex items-center gap-3 p-1.5 rounded hover:bg-neon-blue/15 transition-all text-xs font-medium text-white hover:text-neon-blue"
                >
                  <img src={g.thumbnail} alt={g.title} className="w-8 h-8 rounded object-cover border border-neon-blue/20" />
                  <div className="flex flex-col truncate">
                    <span className="font-bold truncate">{g.title}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{g.category.toUpperCase()}</span>
                  </div>
                </Link>
              ))}

              {/* Fuzzy Match (typo tolerance) matches */}
              {fuzzySuggestions.map(g => (
                <Link
                  key={g.id}
                  href={`/play/${g.id}/`}
                  onClick={() => {
                    setSearchQuery('');
                    setSearchFocused(false);
                  }}
                  className="flex items-center gap-3 p-1.5 rounded hover:bg-neon-pink/15 transition-all text-xs font-medium text-white hover:text-neon-pink"
                >
                  <img src={g.thumbnail} alt={g.title} className="w-8 h-8 rounded object-cover border border-neon-pink/20" />
                  <div className="flex flex-col truncate">
                    <span className="font-bold truncate">{g.title} <span className="text-[9px] text-neon-pink font-mono">[Suggested]</span></span>
                    <span className="text-[10px] text-gray-500 font-mono">{g.category.toUpperCase()}</span>
                  </div>
                </Link>
              ))}

              {filteredSuggestions.length === 0 && fuzzySuggestions.length === 0 && (
                <div className="text-[11px] font-mono text-gray-500 text-center py-4">
                  No direct nodes found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle Triggers */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-10 h-10 rounded-lg border border-neon-blue/20 flex items-center justify-center text-white bg-[#150a21]/40 hover:border-neon-blue hover:text-neon-blue hover:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all duration-300"
          title="Toggle Cyber Grid Theme"
        >
          {isDark ? '🌙' : '☀️'}
        </button>

        {/* Notifications Panel */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-10 h-10 rounded-lg border border-neon-blue/20 flex items-center justify-center text-white bg-[#150a21]/40 hover:border-neon-blue hover:text-neon-blue hover:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all duration-300 relative"
          >
            🔔
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute top-12 right-0 w-[300px] bg-[#12021c]/95 border border-neon-pink/30 rounded-xl p-3 shadow-[0_10px_30px_rgba(255,0,255,0.2)] backdrop-blur-md z-50 flex flex-col gap-2 animate-fade-in">
              <div className="text-[10px] font-bold tracking-widest font-mono text-neon-pink border-b border-neon-pink/10 pb-1.5 flex justify-between items-center">
                <span>SYSTEM NOTIFICATIONS</span>
                <button 
                  onClick={markAllNotificationsRead}
                  className="text-[9px] text-neon-blue hover:underline font-bold"
                >
                  Mark all read
                </button>
              </div>
              <div className="flex flex-col max-h-64 overflow-y-auto gap-2 scrollbar-none">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-2 rounded border text-xs flex flex-col gap-1 transition-all ${
                      n.read 
                        ? 'bg-black/20 border-white/5 text-gray-400' 
                        : 'bg-neon-pink/5 border-neon-pink/20 text-white'
                    }`}
                  >
                    <span>{n.text}</span>
                    <span className="text-[9px] text-gray-500 font-mono">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Profile Area */}
        <div className="relative" ref={profileRef}>
          {user ? (
            <div className="flex items-center gap-2">
              {/* Profile Avatar Trigger */}
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-lg border-2 border-neon-blue bg-gradient-to-tr from-neon-pink/20 to-neon-blue/20 hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-white flex items-center justify-center relative shadow-[0_0_12px_rgba(0,240,255,0.3)]"
              >
                {user.username[0].toUpperCase()}
                <span className="absolute -bottom-1 -right-1 bg-neon-pink text-white text-[8px] font-bold font-mono px-1 rounded-full border border-black">
                  L{user.level}
                </span>
              </button>

              {/* Profile Menu Dropdown */}
              {profileOpen && (
                <div className="absolute top-12 right-0 w-56 bg-[#12021c]/95 border border-neon-blue/40 rounded-xl p-3.5 shadow-[0_10px_30px_rgba(0,240,255,0.25)] backdrop-blur-md z-50 flex flex-col gap-3.5 animate-fade-in font-mono text-xs text-text-secondary">
                  <div className="border-b border-neon-blue/10 pb-2">
                    <div className="font-extrabold text-white text-sm tracking-wide font-sans">{user.username}</div>
                    <div className="text-[9px] font-mono text-neon-blue uppercase tracking-wider">{user.role} NODE STATUS</div>
                  </div>

                  {/* Level & XP Meter */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span>SYNC_LEVEL {user.level}</span>
                      <span>{user.xp} / {user.xpToNextLevel} XP</span>
                    </div>
                    <div className="w-full bg-[#1b0e2d] h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="bg-gradient-to-r from-neon-pink to-neon-blue h-full rounded-full"
                        style={{ width: `${(user.xp / user.xpToNextLevel) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="p-2 rounded hover:bg-neon-blue/10 hover:text-white transition flex items-center gap-2 border border-transparent hover:border-neon-blue/20"
                    >
                      👤 Drifter Dashboard
                    </Link>
                    {user.role === 'Creator' && (
                      <Link
                        href="/creator"
                        onClick={() => setProfileOpen(false)}
                        className="p-2 rounded hover:bg-neon-purple/10 hover:text-white transition flex items-center gap-2 border border-transparent hover:border-neon-purple/20"
                      >
                        ⚙️ Creator Portal
                      </Link>
                    )}
                    {user.role === 'Admin' && (
                      <>
                        <Link
                          href="/creator"
                          onClick={() => setProfileOpen(false)}
                          className="p-2 rounded hover:bg-neon-purple/10 hover:text-white transition flex items-center gap-2 border border-transparent hover:border-neon-purple/20"
                        >
                          ⚙️ Creator Portal
                        </Link>
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="p-2 rounded hover:bg-neon-pink/10 hover:text-white transition flex items-center gap-2 border border-transparent hover:border-neon-pink/20"
                        >
                          ⚔️ Admin Command Deck
                        </Link>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                      router.push('/');
                    }}
                    className="w-full mt-1 border border-neon-pink/40 bg-neon-pink/10 hover:bg-neon-pink/25 text-white font-bold py-2 rounded transition-colors text-center font-sans tracking-widest text-[10px] uppercase"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/auth" 
              className="metal-plate-tab px-4 py-2 sm:px-6 sm:py-2.5 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap block"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 rounded-lg border border-neon-pink/20 flex lg:hidden items-center justify-center text-white bg-[#150a21]/40 hover:border-neon-pink hover:text-neon-pink transition-all duration-300"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Sidebar Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[90px] md:top-[110px] bg-[#0c0517]/95 border-t border-neon-blue/20 backdrop-blur-lg z-45 lg:hidden flex flex-col p-6 gap-6 animate-fade-in overflow-y-auto">
          {/* Mobile Search input */}
          <div className="relative w-full">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="SEARCH NODE_ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-neon-blue/30 rounded-lg pl-4 pr-10 py-3 text-white placeholder-gray-600 font-mono text-sm focus:outline-none"
              />
              <button type="submit" className="absolute right-3 top-3.5 text-neon-blue">
                🔍
              </button>
            </form>
          </div>

          {/* Main Links */}
          <div className="flex flex-col gap-3">
            <div className="text-[10px] font-bold tracking-widest font-mono text-neon-blue border-b border-neon-blue/10 pb-1">
              PLATFORM PATHWAYS
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-4 rounded-lg font-bold tracking-wide uppercase text-sm border ${
                  pathname === link.href 
                    ? 'border-neon-blue/40 bg-neon-blue/10 text-white' 
                    : 'border-white/5 bg-black/20 text-text-secondary hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Categories Grid */}
          <div className="flex flex-col gap-3">
            <div className="text-[10px] font-bold tracking-widest font-mono text-neon-pink border-b border-neon-pink/10 pb-1">
              CATEGORY STREAMS
            </div>
            <div className="grid grid-cols-2 gap-2">
              {megaMenuCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-3 rounded-lg border border-white/5 bg-black/30 text-xs font-semibold text-text-secondary hover:text-white"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
