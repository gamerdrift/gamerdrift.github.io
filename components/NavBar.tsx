"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Games', href: '/games' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <nav className="w-full h-16 bg-[#0c0517]/70 border-b border-neon-blue/20 flex justify-center items-center backdrop-blur-md sticky top-[90px] md:top-[120px] z-40 transition-all duration-300 shadow-[0_4px_15px_rgba(0,240,255,0.05)]">
      <div className="flex space-x-6 md:space-x-12 items-center px-4 overflow-x-auto scrollbar-none py-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${
                isActive ? 'diamond-tab' : 'metallic-tab'
              } px-6 py-2.5 md:px-10 md:py-3 text-sm md:text-base font-extrabold tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
