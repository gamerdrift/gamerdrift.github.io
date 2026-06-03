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
        <div className="flex space-x-4">
          <Link href="/" className="text-text-primary hover:text-neon-blue font-medium transition-colors duration-200">Home</Link>
          <Link href="/games" className="text-text-primary hover:text-neon-blue font-medium transition-colors duration-200">Games</Link>
          <Link href="/leaderboard" className="text-text-primary hover:text-neon-blue font-medium transition-colors duration-200">Leaderboard</Link>
          <Link href="/contact" className="text-text-primary hover:text-neon-blue font-medium transition-colors duration-200">Contact</Link>
        </div>
      </div>
      <AuthButton />
    </nav>
  );
}
