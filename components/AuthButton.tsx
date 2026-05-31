"use client";

import React from 'react';

export default function AuthButton() {
  const handleAuth = () => {
    // Placeholder: In a real app, integrate Firebase auth or other provider.
    alert('Auth button clicked! Implement login here.');
  };

  return (
    <button
      onClick={handleAuth}
      className="neon-button px-4 py-2 bg-neon bg-opacity-20 rounded"
    >
      Sign In / Register
    </button>
  );
}
