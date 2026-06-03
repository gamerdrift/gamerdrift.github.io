"use client";

import React from 'react';

export default function GamerDriftLogo() {
  return (
    <svg 
      width="400" 
      height="120" 
      viewBox="0 0 400 120" 
      xmlns="http://www.w3.org/2000/svg"
      className="hover:scale-105 transition-transform duration-300 select-none cursor-pointer"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-pink" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-text" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Gradients */}
        <linearGradient id="text-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00d2ff" />
          <stop offset="45%" stopColor="#00f0ff" />
          <stop offset="60%" stopColor="#b400ff" />
          <stop offset="100%" stopColor="#ff00d9" />
        </linearGradient>
      </defs>

      {/* Speed Glitch Lines in Background */}
      <g transform="translate(15, 10)">
        <line x1="-15" y1="40" x2="35" y2="40" stroke="#00f0ff" strokeWidth="2.5" opacity="0.65" filter="url(#glow-cyan)" />
        <line x1="-25" y1="65" x2="15" y2="65" stroke="#00f0ff" strokeWidth="1.5" opacity="0.4" />
        <line x1="85" y1="35" x2="135" y2="35" stroke="#ff00d9" strokeWidth="2.5" opacity="0.65" filter="url(#glow-pink)" />
        <line x1="95" y1="75" x2="145" y2="75" stroke="#ff00d9" strokeWidth="1.5" opacity="0.4" />
      </g>
      
      {/* Icon Group (G and D Split Controller) */}
      <g transform="translate(15, 10)">
        {/* 3D Bevel Shadows Underneath */}
        <path 
          d="M 55,25 L 35,25 C 20,25 10,38 10,58 C 10,78 20,95 32,95 C 42,95 47,85 47,70 L 47,55 L 55,55" 
          fill="none" 
          stroke="#002d47" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          transform="translate(2, 4)" 
        />
        <path 
          d="M 65,55 L 75,55 L 75,70 C 75,85 80,95 90,95 C 102,95 112,78 112,58 C 112,38 102,25 87,25 L 65,25 Z" 
          fill="none" 
          stroke="#420038" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          transform="translate(2, 4)" 
        />

        {/* Foreground Neon Elements */}
        {/* G - Left Controller Handle (Blue/Cyan) */}
        <path 
          d="M 55,25 L 35,25 C 20,25 10,38 10,58 C 10,78 20,95 32,95 C 42,95 47,85 47,70 L 47,55 L 55,55" 
          fill="none" 
          stroke="#00d2ff" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter="url(#glow-cyan)" 
        />
        {/* D - Right Controller Handle (Pink/Magenta) */}
        <path 
          d="M 65,55 L 75,55 L 75,70 C 75,85 80,95 90,95 C 102,95 112,78 112,58 C 112,38 102,25 87,25 L 65,25 Z" 
          fill="none" 
          stroke="#ff00d9" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter="url(#glow-pink)" 
        />
      </g>
      
      {/* Typography Group */}
      <g transform="translate(142, 66)">
        {/* GAMERDRIFT brand text */}
        <text 
          x="0" 
          y="0" 
          fontFamily="'Orbitron', 'Space Grotesk', 'Inter', sans-serif" 
          fontWeight="900" 
          fontStyle="italic"
          fontSize="33" 
          fill="url(#text-grad)" 
          letterSpacing="1" 
          filter="url(#glow-text)"
        >
          GAMERDRIFT
        </text>
        
        {/* Left Accent Line */}
        <line x1="0" y1="20" x2="52" y2="20" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow-cyan)" />
        
        {/* esports center subtext */}
        <text 
          x="110" 
          y="24" 
          fontFamily="'Space Grotesk', 'Inter', sans-serif" 
          fontWeight="500" 
          fontSize="11.5" 
          fill="#ffffff" 
          letterSpacing="4"
          textAnchor="middle"
        >
          esports center
        </text>

        {/* Right Accent Line */}
        <line x1="168" y1="20" x2="220" y2="20" stroke="#ff00d9" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow-pink)" />
      </g>
    </svg>
  );
}
