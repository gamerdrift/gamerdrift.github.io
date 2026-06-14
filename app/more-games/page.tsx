"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface MoreGame {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  url: string;
  category: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  engine?: string;
  isNew?: boolean;
  is3D?: boolean;
}

const moreGames: MoreGame[] = [
  // ── 3D / HD Games ────────────────────────────────────────────────────
  {
    id: 'hexgl',
    title: 'HexGL 3D',
    subtitle: 'Futuristic Hovercraft Racer',
    thumbnail: '/hexgl_thumb.png',
    url: '/play/hexgl/',
    category: 'Racing',
    badge: '3D',
    badgeColor: '#00f0ff',
    description: 'Pilot a neon hovercraft at hypersonic speeds across a hexagonal track suspended in deep space. Built with Three.js WebGL.',
    engine: 'Three.js',
    isNew: true,
    is3D: true,
  },
  {
    id: 'three-fps',
    title: 'Three.js FPS',
    subtitle: '3D First-Person Shooter',
    thumbnail: '/threefps_thumb.png',
    url: '/play/three-fps/',
    category: 'Shooting',
    badge: '3D',
    badgeColor: '#00f0ff',
    description: 'Immersive 3D FPS with ammo.js physics, animated mutant enemies, AK-47 weapon system, bullet decals, and dynamic lighting.',
    engine: 'Three.js + ammo.js',
    isNew: true,
    is3D: true,
  },
  {
    id: 'simple-3d-fps',
    title: 'Babylon.js Arena FPS',
    subtitle: '3D Arena Combat',
    thumbnail: '/babylonfps_thumb.png',
    url: '/play/simple-3d-fps/',
    category: 'Shooting',
    badge: '3D',
    badgeColor: '#00f0ff',
    description: 'Full 3D arena first-person shooter powered by Babylon.js with real-time shadows, PBR materials, and smooth combat controls.',
    engine: 'Babylon.js',
    isNew: true,
    is3D: true,
  },
  {
    id: 'javascript-racer',
    title: 'Javascript Racer',
    subtitle: 'Retro OutRun Racing',
    thumbnail: '/jsracer_thumb.png',
    url: '/play/javascript-racer/',
    category: 'Racing',
    badge: 'HD',
    badgeColor: '#ff9f00',
    description: 'High-speed pseudo-3D retro racing game inspired by OutRun. Choose straight roads, curves, or hilly terrain with traffic.',
    engine: 'HTML5 Canvas',
    isNew: true,
    is3D: false,
  },
  // ── Classic Arcade ────────────────────────────────────────────────────
  {
    id: 'asteroids-js',
    title: 'Asteroids 2D',
    subtitle: 'Space Rock Shooter',
    thumbnail: '/asteroids_thumb.png',
    url: '/play/asteroids-js/',
    category: 'Shooting',
    badge: 'CLASSIC',
    badgeColor: '#a855f7',
    description: 'Blast tumbling asteroids and evade alien saucers in this faithful HTML5 recreation of the arcade classic.',
    engine: 'HTML5 Canvas',
    isNew: true,
    is3D: false,
  },
  {
    id: 'hextris',
    title: 'Hextris Hexagon',
    subtitle: 'Hexagonal Puzzle Game',
    thumbnail: '/hextris_thumb.png',
    url: '/play/hextris/',
    category: 'Puzzle',
    badge: 'LIVE',
    badgeColor: '#22c55e',
    description: 'Rotate a glowing hexagon to catch and match falling colored blocks. Fast-paced and endlessly addictive.',
    engine: 'HTML5 Canvas',
    isNew: false,
    is3D: false,
  },
  {
    id: 'clumsy-bird',
    title: 'Clumsy Bird',
    subtitle: 'Flap & Dodge Challenge',
    thumbnail: '/clumsybird_thumb.png',
    url: '/play/clumsy-bird/',
    category: 'Casual',
    badge: 'FUN',
    badgeColor: '#f59e0b',
    description: 'Tap to flap your wings and squeeze through pipe gaps. One wrong move and it\'s game over — can you beat your high score?',
    engine: 'melonJS',
    isNew: false,
    is3D: false,
  },
  {
    id: 'pacman-html5',
    title: 'Pacman Classic',
    subtitle: 'Original Arcade Maze',
    thumbnail: '/pacman_thumb.png',
    url: '/play/pacman-html5/',
    category: 'Arcade',
    badge: 'ICONIC',
    badgeColor: '#eab308',
    description: 'The full original Pac-Man experience. Devour pellets, collect power-ups, and evade Blinky, Pinky, Inky, and Clyde.',
    engine: 'HTML5 Canvas',
    isNew: false,
    is3D: false,
  },
  {
    id: 'minesweeper-js',
    title: 'Minesweeper Classic',
    subtitle: 'Tactical Mine Defusal',
    thumbnail: '/minesweeper_thumb.png',
    url: '/play/minesweeper-js/',
    category: 'Puzzle',
    badge: 'TACTICAL',
    badgeColor: '#10b981',
    description: 'Defuse the minefield using number clues. Choose Beginner, Intermediate, or All-Out Expert mode.',
    engine: 'HTML5',
    isNew: false,
    is3D: false,
  },
];

const categoryColors: Record<string, string> = {
  Racing: '#00f0ff',
  Shooting: '#ff4444',
  Puzzle: '#a855f7',
  Arcade: '#eab308',
  Casual: '#f59e0b',
  Action: '#ff9f00',
};

export default function MoreGamesPage() {
  const [filter, setFilter] = useState<'All' | '3D' | 'Arcade' | 'Racing' | 'Shooting' | 'Puzzle' | 'Casual'>('All');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filters = ['All', '3D', 'Racing', 'Shooting', 'Puzzle', 'Arcade', 'Casual'] as const;

  const filteredGames = moreGames.filter(g => {
    if (filter === 'All') return true;
    if (filter === '3D') return g.is3D;
    return g.category === filter;
  });

  const threeDGames = moreGames.filter(g => g.is3D);
  const classicGames = moreGames.filter(g => !g.is3D);

  return (
    <div
      className="w-full min-h-screen"
      style={{ background: 'linear-gradient(180deg, #020408 0%, #05070a 40%, #080b12 100%)' }}
    >
      {/* ── Hero Header ────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '80px', paddingBottom: '60px' }}>
        {/* Animated background grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, rgba(0,240,255,0.07) 0%, transparent 70%)',
        }} />

        <div className="relative z-10 text-center px-4">
          <span style={{
            display: 'block',
            fontSize: '10px',
            fontFamily: 'monospace',
            letterSpacing: '0.35em',
            color: '#00f0ff',
            fontWeight: 700,
            marginBottom: '12px',
            textTransform: 'uppercase',
          }}>
            GAMERDRIFT // EXPANDED ARCADE NETWORK
          </span>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '0.08em',
            lineHeight: 1.1,
            textTransform: 'uppercase',
            marginBottom: '16px',
            textShadow: '0 0 40px rgba(0,240,255,0.3)',
          }}>
            MORE GAMES
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '15px',
            maxWidth: '520px',
            margin: '0 auto 24px',
            lineHeight: 1.7,
          }}>
            Explore our extended arcade vault — featuring 3D WebGL masterpieces, retro classics, and HD arcade games. All native, all free, all instant.
          </p>
          {/* Stats bar */}
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'TOTAL GAMES', value: `${moreGames.length}` },
              { label: '3D ENGINES', value: '3' },
              { label: 'LATENCY', value: 'ZERO' },
              { label: 'COST', value: 'FREE' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#00f0ff', fontFamily: 'monospace' }}>{s.value}</div>
                <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#475569', fontFamily: 'monospace' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ────────────────────────────────── */}
      <div style={{ padding: '0 24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '48px',
          padding: '16px 20px',
          background: 'rgba(12,15,22,0.9)',
          border: '1px solid rgba(0,240,255,0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(12px)',
        }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 18px',
                fontSize: '10px',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                border: `1px solid ${filter === f ? '#00f0ff' : 'rgba(255,255,255,0.08)'}`,
                background: filter === f ? 'rgba(0,240,255,0.1)' : 'transparent',
                color: filter === f ? 'white' : '#64748b',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: filter === f ? '0 0 12px rgba(0,240,255,0.15)' : 'none',
              }}
            >
              {f === '3D' ? '🎮 3D GAMES' : f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── Featured 3D Games Banner ────────────────── */}
        {(filter === 'All' || filter === '3D') && (
          <div style={{ marginBottom: '56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, #00f0ff, transparent)' }} />
              <span style={{
                fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.3em', color: '#00f0ff', fontWeight: 700,
              }}>
                ◈ FEATURED 3D &amp; HD GAMES
              </span>
              <div style={{ height: '2px', flex: 1, background: 'linear-gradient(270deg, #00f0ff, transparent)' }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              {threeDGames.map(game => (
                <Link key={game.id} href={game.url} style={{ textDecoration: 'none' }}>
                  <div
                    onMouseEnter={() => setHoveredId(game.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      position: 'relative',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: `1px solid ${hoveredId === game.id ? '#00f0ff' : 'rgba(255,255,255,0.08)'}`,
                      background: '#0d1117',
                      transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                      transform: hoveredId === game.id ? 'translateY(-8px) scale(1.02)' : 'none',
                      boxShadow: hoveredId === game.id ? '0 20px 60px rgba(0,240,255,0.2)' : '0 4px 20px rgba(0,0,0,0.5)',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          transition: 'transform 0.6s ease',
                          transform: hoveredId === game.id ? 'scale(1.08)' : 'scale(1)',
                        }}
                      />
                      {/* Gradient overlay */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                      }} />
                      {/* Top badges */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', zIndex: 10 }}>
                        <span style={{
                          padding: '3px 10px', fontSize: '9px', fontWeight: 900, fontFamily: 'monospace',
                          letterSpacing: '0.2em', borderRadius: '4px',
                          background: `${game.badgeColor}22`, border: `1px solid ${game.badgeColor}66`,
                          color: game.badgeColor,
                        }}>
                          {game.badge}
                        </span>
                        {game.isNew && (
                          <span style={{
                            padding: '3px 10px', fontSize: '9px', fontWeight: 900, fontFamily: 'monospace',
                            letterSpacing: '0.2em', borderRadius: '4px',
                            background: 'rgba(255,0,128,0.15)', border: '1px solid rgba(255,0,128,0.4)',
                            color: '#ff0080', animation: 'pulse 2s infinite',
                          }}>
                            NEW
                          </span>
                        )}
                      </div>
                      {/* Engine badge */}
                      <div style={{
                        position: 'absolute', top: '12px', right: '12px',
                        padding: '3px 8px', fontSize: '8px', fontFamily: 'monospace',
                        background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#94a3b8', borderRadius: '4px',
                      }}>
                        {game.engine}
                      </div>
                      {/* HUD corners on hover */}
                      {hoveredId === game.id && (
                        <>
                          <div style={{ position: 'absolute', top: 8, left: 8, width: 16, height: 16, borderTop: '2px solid #00f0ff', borderLeft: '2px solid #00f0ff' }} />
                          <div style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderTop: '2px solid #00f0ff', borderRight: '2px solid #00f0ff' }} />
                          <div style={{ position: 'absolute', bottom: 8, left: 8, width: 16, height: 16, borderBottom: '2px solid #00f0ff', borderLeft: '2px solid #00f0ff' }} />
                          <div style={{ position: 'absolute', bottom: 8, right: 8, width: 16, height: 16, borderBottom: '2px solid #00f0ff', borderRight: '2px solid #00f0ff' }} />
                        </>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '20px' }}>
                      <div style={{ fontSize: '10px', fontFamily: 'monospace', color: categoryColors[game.category] || '#00f0ff', letterSpacing: '0.2em', marginBottom: '6px' }}>
                        {game.category.toUpperCase()}
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: '0 0 4px', letterSpacing: '0.02em' }}>
                        {game.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.6 }}>
                        {game.subtitle}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.7, margin: '0 0 20px' }}>
                        {game.description}
                      </p>
                      {/* Play button */}
                      <div style={{
                        width: '100%', padding: '12px 0', textAlign: 'center',
                        background: hoveredId === game.id
                          ? 'linear-gradient(90deg, rgba(0,240,255,0.2), rgba(0,102,255,0.2))'
                          : 'linear-gradient(90deg, rgba(0,240,255,0.06), rgba(0,102,255,0.06))',
                        border: `1px solid ${hoveredId === game.id ? 'rgba(0,240,255,0.6)' : 'rgba(0,240,255,0.15)'}`,
                        borderRadius: '8px',
                        fontSize: '11px', fontWeight: 700, fontFamily: 'monospace',
                        letterSpacing: '0.25em', color: '#00f0ff',
                        transition: 'all 0.3s ease',
                        boxShadow: hoveredId === game.id ? '0 0 20px rgba(0,240,255,0.2)' : 'none',
                      }}>
                        ▶ LAUNCH GAME
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Classic Arcade Games Grid ─────────────────── */}
        {(filter === 'All' || !['3D'].includes(filter)) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, #a855f7, transparent)' }} />
              <span style={{
                fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.3em', color: '#a855f7', fontWeight: 700,
              }}>
                ◈ CLASSIC &amp; ARCADE GAMES
              </span>
              <div style={{ height: '2px', flex: 1, background: 'linear-gradient(270deg, #a855f7, transparent)' }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px',
            }}>
              {filteredGames.filter(g => !g.is3D).map(game => (
                <Link key={game.id} href={game.url} style={{ textDecoration: 'none' }}>
                  <div
                    onMouseEnter={() => setHoveredId(game.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: `1px solid ${hoveredId === game.id ? (categoryColors[game.category] || '#00f0ff') : 'rgba(255,255,255,0.07)'}`,
                      background: '#0d1117',
                      transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                      transform: hoveredId === game.id ? 'translateY(-6px) scale(1.03)' : 'none',
                      boxShadow: hoveredId === game.id
                        ? `0 16px 40px ${(categoryColors[game.category] || '#00f0ff')}33`
                        : '0 2px 12px rgba(0,0,0,0.4)',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                          transform: hoveredId === game.id ? 'scale(1.1)' : 'scale(1)',
                        }}
                      />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                      }} />
                      {/* Badge */}
                      <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                        <span style={{
                          padding: '2px 8px', fontSize: '8px', fontWeight: 900, fontFamily: 'monospace',
                          letterSpacing: '0.15em', borderRadius: '3px',
                          background: `${game.badgeColor}22`, border: `1px solid ${game.badgeColor}55`,
                          color: game.badgeColor,
                        }}>
                          {game.badge}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '14px' }}>
                      <div style={{ fontSize: '9px', fontFamily: 'monospace', color: categoryColors[game.category] || '#64748b', letterSpacing: '0.18em', marginBottom: '4px' }}>
                        {game.category.toUpperCase()}
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'white', margin: '0 0 4px' }}>
                        {game.title}
                      </h3>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {game.description}
                      </p>
                      <div style={{
                        width: '100%', padding: '9px 0', textAlign: 'center',
                        background: hoveredId === game.id ? `${categoryColors[game.category] || '#00f0ff'}18` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${hoveredId === game.id ? (categoryColors[game.category] || '#00f0ff') + '55' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: '6px',
                        fontSize: '9px', fontWeight: 700, fontFamily: 'monospace',
                        letterSpacing: '0.2em', color: categoryColors[game.category] || '#00f0ff',
                        transition: 'all 0.25s ease',
                      }}>
                        ▶ PLAY NOW
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Back to all games ─────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: '64px', paddingBottom: '48px' }}>
          <Link href="/games" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '14px 36px',
            background: 'transparent',
            border: '1px solid rgba(0,240,255,0.3)',
            borderRadius: '8px',
            color: '#00f0ff',
            fontSize: '11px', fontWeight: 700, fontFamily: 'monospace',
            letterSpacing: '0.25em', textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}>
            ← BACK TO MAIN ARCADE
          </Link>
        </div>
      </div>
    </div>
  );
}
