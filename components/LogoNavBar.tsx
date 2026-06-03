"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButton from './AuthButton';

export default function LogoNavBar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Games', href: '/games' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <header className="w-full h-[90px] md:h-[120px] bg-[#0c0517]/85 backdrop-blur-md border-b border-neon-pink/20 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50 transition-all duration-300">
      <div className="flex items-center space-x-6 md:space-x-12 h-full flex-grow overflow-hidden">
        {/* Cyberpunk hanging plate for Logo */}
        <Link href="/" className="relative z-10 block transition-transform duration-300 hover:scale-[1.03] active:scale-95 flex-shrink-0">
          <div className="bg-[#12021c] border-2 border-t-0 border-neon-blue rounded-b-2xl px-6 py-4 shadow-[0_10px_25px_rgba(0,240,255,0.35),inset_0_1px_2px_rgba(255,255,255,0.1)] flex items-center justify-center -mt-[2px]">
            <img 
              src="/mylogo.png" 
              alt="GamerDrift Logo" 
              className="h-12 w-[180px] sm:h-16 sm:w-[240px] md:h-[80px] md:w-[300px] object-fill filter drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
            />
          </div>
        </Link>

        {/* Navigation Tabs aligned in one row next to the logo */}
        <nav className="flex items-center space-x-8 lg:space-x-14 overflow-x-auto scrollbar-none py-2 flex-grow justify-start">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  isActive ? 'metal-plate-tab-active' : 'metal-plate-tab'
                } px-6 py-3 text-xs sm:px-8 sm:py-3.5 sm:text-sm md:px-10 md:py-4 md:text-base lg:px-12 lg:py-[18px] lg:text-lg font-extrabold tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Auth Button */}
      <div className="flex items-center space-x-4 flex-shrink-0 pl-4">
        <AuthButton />
      </div>
    </header>
  );
}
