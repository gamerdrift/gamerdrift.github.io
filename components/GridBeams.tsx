"use client";

import React, { useEffect, useState } from 'react';

interface Beam {
  id: number;
  orientation: 'horizontal' | 'vertical';
  position: number; // pixels from top or left
  duration: number; // in seconds
}

export default function GridBeams() {
  const [beams, setBeams] = useState<Beam[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const spawnBeam = () => {
      const isHorizontal = Math.random() > 0.5;
      const duration = 1.8 + Math.random() * 2.5; // random duration between 1.8s and 4.3s
      const id = Date.now() + Math.random();

      if (isHorizontal) {
        const maxRows = Math.floor(window.innerHeight / 35);
        if (maxRows <= 0) return;
        const row = Math.floor(Math.random() * maxRows);
        const newBeam: Beam = {
          id,
          orientation: 'horizontal',
          position: row * 35,
          duration,
        };
        setBeams((prev) => [...prev.slice(-8), newBeam]); // limit concurrent active elements
      } else {
        const maxCols = Math.floor(window.innerWidth / 35);
        if (maxCols <= 0) return;
        const col = Math.floor(Math.random() * maxCols);
        const newBeam: Beam = {
          id,
          orientation: 'vertical',
          position: col * 35,
          duration,
        };
        setBeams((prev) => [...prev.slice(-8), newBeam]); // limit concurrent active elements
      }
    };

    // Spawn a few initial beams with random delays
    for (let i = 0; i < 3; i++) {
      setTimeout(spawnBeam, Math.random() * 2000);
    }

    // Interval to spawn new beams
    const interval = setInterval(() => {
      spawnBeam();
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  // Garbage collector for completed beams to prevent DOM bloat
  useEffect(() => {
    if (beams.length === 0) return;
    const timer = setTimeout(() => {
      const now = Date.now();
      setBeams((prev) => prev.filter(b => now - b.id < b.duration * 1000 + 1000));
    }, 2000);
    return () => clearTimeout(timer);
  }, [beams]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {beams.map((beam) => (
        <div
          key={beam.id}
          className={beam.orientation === 'horizontal' ? 'silver-beam-h' : 'silver-beam-v'}
          style={{
            top: beam.orientation === 'horizontal' ? `${beam.position}px` : 0,
            left: beam.orientation === 'vertical' ? `${beam.position}px` : 0,
            animationDuration: `${beam.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
