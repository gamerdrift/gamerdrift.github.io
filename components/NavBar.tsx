"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NavBar() {
  const [dark, setDark] = useState<boolean>(true);

  // Load preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('prefers-dark');
    if (stored !== null) {
      setDark(stored === 'true');
    }
  }, []);

  // Apply class to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('prefers-dark', String(dark));
  }, [dark]);

  return (
    <nav className="w-full bg-card-bg border-b border-neon-pink/20 py-4 px-6 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      <div className="flex space-x-6 items-center">
        <Link href="/" className="text-xl font-extrabold text-white tracking-widest neon-text">
          GAMERDRIFT
        </Link>
        <div className="flex space-x-4">
          <Link href="/" className="text-text-primary hover:text-neon-blue font-medium transition-colors duration-200">Home</Link>
          <Link href="/games" className="text-text-primary hover:text-neon-blue font-medium transition-colors duration-200">Games</Link>
          <Link href="/leaderboard" className="text-text-primary hover:text-neon-blue font-medium transition-colors duration-200">Leaderboard</Link>
          <Link href="/contact" className="text-text-primary hover:text-neon-blue font-medium transition-colors duration-200">Contact</Link>
        </div>
      </div>
      <button 
        onClick={() => setDark(!dark)} 
        className="neon-button text-xs py-1.5 px-3 bg-neon-pink/20 hover:bg-neon-pink/40 border border-neon-pink rounded"
      >
        {dark ? '⚡ LIGHT UPLINK' : '🌙 DARK MATRIX'}
      </button>
    </nav>
  );
}
