"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function AuthButton() {
  const router = useRouter();
  const handleAuth = () => {
    // Navigate to a dedicated auth page (you can implement Firebase here later)
    router.push('/auth');
  };

  return (
    <button
      onClick={handleAuth}
      className="metal-plate-tab px-6 py-3 text-xs sm:px-8 sm:py-3.5 sm:text-sm md:px-10 md:py-4 md:text-base lg:px-12 lg:py-[18px] lg:text-lg font-extrabold tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap"
    >
      Sign In / Register
    </button>
  );
}
