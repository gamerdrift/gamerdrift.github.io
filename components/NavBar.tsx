"use client";

import React from 'react';
import Link from 'next/link';
import AuthButton from './AuthButton';

export default function NavBar() {
  return (
    <nav className="w-full h-20 bg-card-bg border-b border-neon-pink/20 px-8 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      <div className="flex space-x-6 items-center">
        <Link href="/" className="text-xl font-extrabold text-white tracking-widest neon-text">
          GAMERDRIFT
        </Link>
        <div className="flex space-x-12 items-center">
          <Link href="/" className="metallic-tab px-4 py-2 text-sm tracking-wide">
            Home
          </Link>
          <Link href="/games" className="metallic-tab px-4 py-2 text-sm tracking-wide">
            Games
          </Link>
          <Link href="/leaderboard" className="metallic-tab px-4 py-2 text-sm tracking-wide">
            Leaderboard
          </Link>
          <Link href="/contact" className="metallic-tab px-4 py-2 text-sm tracking-wide">
            Contact
          </Link>
        </div>
      </div>
      <AuthButton />
    </nav>
  );
}
