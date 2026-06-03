"use client";

import React from 'react';
import Link from 'next/link';
import AuthButton from './AuthButton';

export default function LogoNavBar() {
  return (
    <header className="w-full h-[90px] md:h-[120px] bg-[#0c0517]/85 backdrop-blur-md border-b border-neon-pink/20 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50 transition-all duration-300">
      {/* Cyberpunk hanging plate for Logo */}
      <div className="flex items-center h-full">
        <Link href="/" className="relative z-10 block transition-transform duration-300 hover:scale-[1.03] active:scale-95">
          <div className="bg-[#12021c] border-2 border-t-0 border-neon-blue rounded-b-2xl px-6 py-4 shadow-[0_10px_25px_rgba(0,240,255,0.35),inset_0_1px_2px_rgba(255,255,255,0.1)] flex items-center justify-center -mt-[2px]">
            <img 
              src="/mylogo.png" 
              alt="GamerDrift Logo" 
              className="h-12 w-[180px] sm:h-16 sm:w-[240px] md:h-[80px] md:w-[300px] object-fill filter drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
            />
          </div>
        </Link>
      </div>

      {/* Auth Button */}
      <div className="flex items-center">
        <AuthButton />
      </div>
    </header>
  );
}
