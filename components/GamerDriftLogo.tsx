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
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-pink" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Gradients */}
        <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00f0ff" />
          <stop offset="50%" stop-color="#b400ff" />
          <stop offset="100%" stop-color="#ff00ff" />
        </linearGradient>
      </defs>
      
      {/* Icon Group */}
      <g transform="translate(20, 10)">
        {/* Outer Hexagon Crest */}
        <polygon 
          points="50,5 95,30 95,80 50,105 5,80 5,30" 
          fill="none" 
          stroke="url(#cyber-grad)" 
          strokeWidth="3" 
          filter="url(#glow-pink)" 
        />
        {/* Inner Gaming Core */}
        <path d="M 30,45 L 70,45 L 50,75 Z" fill="url(#cyber-grad)" opacity="0.8" />
        <path d="M 50,25 L 35,45 L 65,45 Z" fill="#ffffff" />
        {/* Drift Trail Lines */}
        <line x1="15" y1="90" x2="45" y2="90" stroke="#00f0ff" strokeWidth="4" strokeLinecap="round" filter="url(#glow-cyan)" />
        <line x1="25" y1="98" x2="55" y2="98" stroke="#ff00ff" strokeWidth="4" strokeLinecap="round" filter="url(#glow-pink)" />
      </g>
      
      {/* Typography Group */}
      <g transform="translate(130, 72)">
        {/* Glowing brand text */}
        <text 
          x="0" 
          y="0" 
          fontFamily="'Space Grotesk', 'Inter', sans-serif" 
          fontWeight="900" 
          fontSize="32" 
          fill="#ffffff" 
          letterSpacing="4" 
          filter="url(#glow-cyan)"
        >
          GAMER
        </text>
        <text 
          x="135" 
          y="0" 
          fontFamily="'Space Grotesk', 'Inter', sans-serif" 
          fontWeight="900" 
          fontSize="32" 
          fill="url(#cyber-grad)" 
          letterSpacing="4" 
          filter="url(#glow-pink)"
        >
          DRIFT
        </text>
        
        {/* Subtitle */}
        <text 
          x="2" 
          y="24" 
          fontFamily="'Space Grotesk', 'Inter', sans-serif" 
          fontWeight="600" 
          fontSize="11" 
          fill="#9f9fb5" 
          letterSpacing="7"
        >
          PREMIUM HUB
        </text>
      </g>
    </svg>
  );
}
