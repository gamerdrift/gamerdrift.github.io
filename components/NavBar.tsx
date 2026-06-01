"use client";

import React, { useEffect, useState } from 'react';

export default function NavBar() {
  const [dark, setDark] = useState<boolean>(false);

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
    <nav className="neon-button w-full bg-neon bg-opacity-20 py-3 px-4 flex justify-between items-center mb-6">
      <div className="flex space-x-4">
        <a href="/" className="text-white hover:underline">Home</a>
        <a href="/games" className="text-white hover:underline">Games</a>
        <a href="/leaderboard" className="text-white hover:underline">Leaderboard</a>
        <a href="/contact" className="text-white hover:underline">Contact</a>
      </div>
      <button onClick={() => setDark(!dark)} className="neon-button px-3 py-1">
        {dark ? 'Light Mode' : 'Dark Mode'}
      </button>
    </nav>
  );
}
