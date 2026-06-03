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
      className="diamond-tab px-4 py-2 text-sm tracking-wide"
    >
      Sign In / Register
    </button>
  );
}
