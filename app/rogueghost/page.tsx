"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../lib/state/UserContext';
import { useGames } from '../../lib/state/GameContext';

interface Mission {
  id: string;
  name: string;
  theme: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CLASSIFIED';
  bgColor: string;
  wallColor: string;
  playerColor: string;
}

const missions: Mission[] = [
  { id: 'm-1', name: 'Snowblow Extraction', theme: 'Snowy Outpost', description: 'Infiltrate a frozen research vault to recover hostage scientists in extreme cold weather.', difficulty: 'MEDIUM', bgColor: '#182430', wallColor: '#e2e8f0', playerColor: '#00f0ff' },
  { id: 'm-2', name: 'Forestfun Camouflage', theme: 'Wooded Sector', description: 'Navigate deep vegetation blocks, avoid infrared scout towers, and extract the commander.', difficulty: 'EASY', bgColor: '#0b160b', wallColor: '#22c55e', playerColor: '#39ff14' },
  { id: 'm-3', name: 'Cargology Hangar', theme: 'Industrial Dock', description: 'Infiltrate the automated cargo logistics depot and purge defective security bots.', difficulty: 'HARD', bgColor: '#0f0f12', wallColor: '#ff3333', playerColor: '#ff9f00' },
  { id: 'm-4', name: 'Sandbath Fortification', theme: 'Desert Ruins', description: 'Bypass long-range sensor grids under cover of an active desert sandstorm.', difficulty: 'CLASSIFIED', bgColor: '#1c140a', wallColor: '#ffb703', playerColor: '#ffffff' }
];

export default function RogueGhostPage() {
  const { user, gainXP } = useUser();
  const { rateGame } = useGames();

  // Setup states
  const [selectedMission, setSelectedMission] = useState<Mission>(missions[0]);
  const [weapon, setWeapon] = useState('Silenced Carbine');
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'gameover' | 'completed'>('setup');

  // Stats
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [stealthLevel, setStealthLevel] = useState(100);
  const [hostagesRescued, setHostagesRescued] = useState(0);
  const [hostagesTotal, setHostagesTotal] = useState(3);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Fullscreen state & ref
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    const container = gameContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Game state references
  const playerPos = useRef({ x: 200, y: 400 });
  const keys = useRef<{ [key: string]: boolean }>({});
  const enemies = useRef<{ x: number; y: number; vx: number; vy: number; range: number; angle: number; speed: number }[]>([]);
  const hostages = useRef<{ x: number; y: number; rescued: boolean }[]>([]);
  const exitGate = useRef({ x: 200, y: 30, radius: 20 });
  const bullets = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);
  const mousePos = useRef({ x: 200, y: 200 });

  const playBeep = (freq = 440, duration = 0.1) => {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const startMission = () => {
    setGameState('playing');
    setScore(0);
    setHealth(100);
    setStealthLevel(100);
    setHostagesRescued(0);
    setHostagesTotal(3);
    
    playerPos.current = { x: 200, y: 400 };
    bullets.current = [];
    keys.current = {};

    // Spawn Hostages
    hostages.current = [
      { x: 80, y: 150, rescued: false },
      { x: 320, y: 150, rescued: false },
      { x: 200, y: 100, rescued: false }
    ];

    // Spawn Patrol Guards
    const difficultyLevel = selectedMission.difficulty;
    const count = difficultyLevel === 'EASY' ? 2 : difficultyLevel === 'MEDIUM' ? 3 : 4;
    enemies.current = Array.from({ length: count }, (_, idx) => ({
      x: 100 + idx * 80,
      y: 180 + idx * 30,
      vx: (Math.random() > 0.5 ? 1.5 : -1.5) * (idx + 1) * 0.6,
      vy: 0,
      range: 80,
      angle: 0,
      speed: (idx + 1) * 0.8
    }));

    playBeep(400, 0.4);
  };

  // Click handler to shoot
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Direction vector
    const dx = clickX - playerPos.current.x;
    const dy = clickY - playerPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      bullets.current.push({
        x: playerPos.current.x,
        y: playerPos.current.y,
        vx: (dx / dist) * 7,
        vy: (dy / dist) * 7
      });
      setStealthLevel(prev => Math.max(0, prev - 15)); // firing reveals location
      playBeep(600, 0.05);
    }
  };

  // Movement Tracking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update Mouse Coordinates relative to canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Loop Game Updates
  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localScore = 0;

    const gameLoop = () => {
      // Clear Screen with mission specific theme color
      ctx.fillStyle = selectedMission.bgColor;
      ctx.fillRect(0, 0, 400, 450);

      // Radar scanline grids
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 400; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 450);
        ctx.moveTo(0, i);
        ctx.lineTo(400, i);
        ctx.stroke();
      }

      // Draw Walls (Obstacles inside coordinates)
      ctx.fillStyle = selectedMission.wallColor + '20';
      ctx.strokeStyle = selectedMission.wallColor + '50';
      ctx.lineWidth = 1;
      const walls = [
        { x: 50, y: 280, w: 100, h: 15 },
        { x: 250, y: 280, w: 100, h: 15 },
        { x: 120, y: 120, w: 160, h: 15 }
      ];
      walls.forEach(w => {
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeRect(w.x, w.y, w.w, w.h);
      });

      // Draw Extraction Zone
      ctx.fillStyle = 'rgba(57, 255, 20, 0.1)';
      ctx.strokeStyle = '#39ff14';
      ctx.beginPath();
      ctx.arc(exitGate.current.x, exitGate.current.y, exitGate.current.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '8px monospace';
      ctx.fillStyle = '#39ff14';
      ctx.fillText('EXTRACT', exitGate.current.x - 18, exitGate.current.y + 3);

      // Move player WASD controls
      let moveSpeed = 2.5;
      let dx = 0;
      let dy = 0;
      if (keys.current['KeyW'] || keys.current['ArrowUp']) dy -= moveSpeed;
      if (keys.current['KeyS'] || keys.current['ArrowDown']) dy += moveSpeed;
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) dx -= moveSpeed;
      if (keys.current['KeyD'] || keys.current['ArrowRight']) dx += moveSpeed;

      // Update position with simple boundary collisions
      const nextX = playerPos.current.x + dx;
      const nextY = playerPos.current.y + dy;
      
      let collideWall = false;
      walls.forEach(w => {
        if (
          nextX + 6 > w.x && nextX - 6 < w.x + w.w &&
          nextY + 6 > w.y && nextY - 6 < w.y + w.h
        ) {
          collideWall = true;
        }
      });

      if (!collideWall) {
        playerPos.current.x = Math.max(10, Math.min(390, nextX));
        playerPos.current.y = Math.max(10, Math.min(440, nextY));
      }

      // Recover stealth slightly over time if not moving fast
      if (dx === 0 && dy === 0) {
        setStealthLevel(prev => Math.min(100, prev + 0.2));
      } else {
        setStealthLevel(prev => Math.min(100, Math.max(0, prev - 0.05)));
      }

      // Update & Draw bullets
      ctx.fillStyle = '#00f0ff';
      bullets.current.forEach((b, idx) => {
        b.x += b.vx;
        b.y += b.vy;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Bullet wall hit
        walls.forEach(w => {
          if (b.x >= w.x && b.x <= w.x + w.w && b.y >= w.y && b.y <= w.y + w.h) {
            bullets.current.splice(idx, 1);
          }
        });

        // Out of bounds
        if (b.x < 0 || b.x > 400 || b.y < 0 || b.y > 450) {
          bullets.current.splice(idx, 1);
        }
      });

      // Update & Draw Hostages
      hostages.current.forEach((hos, idx) => {
        if (!hos.rescued) {
          // Draw hostage (Blue dot)
          ctx.fillStyle = '#0066ff';
          ctx.strokeStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(hos.x, hos.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Proximity rescue check
          const dist = Math.sqrt(
            Math.pow(playerPos.current.x - hos.x, 2) + 
            Math.pow(playerPos.current.y - hos.y, 2)
          );
          if (dist < 15) {
            hos.rescued = true;
            localScore += 200;
            setScore(localScore);
            setHostagesRescued(prev => {
              const current = prev + 1;
              playBeep(700, 0.15);
              return current;
            });
          }
        }
      });

      // Update & Draw guards
      enemies.current.forEach((enemy, idx) => {
        enemy.x += enemy.vx;
        
        // Boundaries bounce
        if (enemy.x > 320 || enemy.x < 80) {
          enemy.vx *= -1;
        }

        // Draw guard (Red dot)
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw dynamic searchlight cone (Yellow alert)
        const facingLeft = enemy.vx < 0;
        const angleStart = facingLeft ? Math.PI - 0.5 : -0.5;
        const angleEnd = facingLeft ? Math.PI + 0.5 : 0.5;

        ctx.fillStyle = 'rgba(255, 159, 0, 0.1)';
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y);
        ctx.arc(enemy.x, enemy.y, enemy.range, angleStart, angleEnd);
        ctx.lineTo(enemy.x, enemy.y);
        ctx.fill();

        // vision cone detect player
        const dx = playerPos.current.x - enemy.x;
        const dy = playerPos.current.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < enemy.range) {
          const playerAngle = Math.atan2(dy, dx);
          let detected = false;
          if (facingLeft) {
            if (playerAngle > Math.PI - 0.6 || playerAngle < -Math.PI + 0.6) detected = true;
          } else {
            if (playerAngle > -0.6 && playerAngle < 0.6) detected = true;
          }

          if (detected) {
            // Spotted! Trigger alarms
            setHealth(prev => {
              const current = Math.max(0, prev - 1.5);
              if (current <= 0) {
                setGameState('gameover');
                playBeep(100, 0.6);
                setHighScore(old => Math.max(old, localScore));
              }
              return current;
            });
            // Draw red tracking laser
            ctx.strokeStyle = '#ff3333';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(enemy.x, enemy.y);
            ctx.lineTo(playerPos.current.x, playerPos.current.y);
            ctx.stroke();
            playBeep(330, 0.03);
          }
        }

        // Bullet hit guard
        bullets.current.forEach((b, bIdx) => {
          const hitDist = Math.sqrt(Math.pow(b.x - enemy.x, 2) + Math.pow(b.y - enemy.y, 2));
          if (hitDist < 10) {
            bullets.current.splice(bIdx, 1);
            enemies.current.splice(idx, 1);
            localScore += 150;
            setScore(localScore);
            playBeep(450, 0.1);
          }
        });
      });

      // Draw Player Operator (Tactical Green/Cyan)
      ctx.fillStyle = selectedMission.playerColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(playerPos.current.x, playerPos.current.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Gun aiming line
      const aimDx = mousePos.current.x - playerPos.current.x;
      const aimDy = mousePos.current.y - playerPos.current.y;
      const aimDist = Math.sqrt(aimDx * aimDx + aimDy * aimDy);
      if (aimDist > 0) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(playerPos.current.x, playerPos.current.y);
        ctx.lineTo(
          playerPos.current.x + (aimDx / aimDist) * 30,
          playerPos.current.y + (aimDy / aimDist) * 30
        );
        ctx.stroke();
      }

      // Check win condition (All hostages rescued & inside extraction zone)
      const distToExit = Math.sqrt(
        Math.pow(playerPos.current.x - exitGate.current.x, 2) + 
        Math.pow(playerPos.current.y - exitGate.current.y, 2)
      );
      
      const allRescued = hostages.current.every(h => h.rescued);

      if (distToExit < exitGate.current.radius && allRescued) {
        // WIN MISSION!
        setGameState('completed');
        playBeep(880, 0.3);
        setTimeout(() => playBeep(1100, 0.4), 150);
        // Recalc scores & sync XP
        const timeBonus = 500;
        const finalScore = localScore + timeBonus;
        setScore(finalScore);
        setHighScore(old => Math.max(old, finalScore));
        if (user) {
          gainXP(Math.floor(finalScore / 10));
        }
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState, selectedMission]);

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-black relative font-mono text-xs text-slate-300">
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      
      <div 
        ref={gameContainerRef}
        className={`relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 ${
          isFullscreen 
            ? 'fixed inset-0 w-screen h-screen z-50 p-8 bg-[#05070a] overflow-y-auto max-w-full' 
            : 'max-w-4xl mx-auto'
        }`}
      >
        
        {/* Left Side: Setup Column */}
        <div className="md:col-span-5 flex flex-col gap-5">
          <div className="border-b border-[#00f0ff]/20 pb-3 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[9px] text-[#00f0ff] uppercase tracking-wider block">GamerDrift Tactical Operations</span>
              <h1 className="text-2xl font-extrabold text-white tracking-widest uppercase">ROGUE_GHOST</h1>
              <span className="text-[8px] text-slate-500 uppercase mt-0.5 block">STEALTH CAMPAIGN ENCRYPTED</span>
            </div>
            
            <button
              onClick={toggleFullscreen}
              className="text-[10px] font-mono font-bold tracking-widest px-3 py-1.5 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/20 hover:text-white rounded transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
            >
              {isFullscreen ? '[ ⛶ EXIT ]' : '[ ⛶ FULLSCREEN ]'}
            </button>
          </div>

          {gameState === 'setup' && (
            <>
              {/* Select Mission */}
              <div className="hud-panel p-4 flex flex-col gap-3">
                <span className="text-[#00f0ff] font-bold uppercase">SELECT_SECTOR_MISSION</span>
                <div className="flex flex-col gap-2">
                  {missions.map(mis => (
                    <button
                      key={mis.id}
                      onClick={() => {
                        setSelectedMission(mis);
                        playBeep(450, 0.08);
                      }}
                      className={`p-2.5 border text-left flex flex-col gap-1 transition-all ${
                        selectedMission.id === mis.id
                          ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white'
                          : 'border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{mis.name}</span>
                        <span className={`text-[8px] font-mono px-1 border ${mis.difficulty === 'CLASSIFIED' ? 'border-[#ff9f00] text-[#ff9f00]' : 'border-slate-800'}`}>{mis.difficulty}</span>
                      </div>
                      <span className="text-[9px] text-slate-500">{mis.theme}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weapon Config */}
              <div className="hud-panel p-4 flex flex-col gap-3">
                <span className="text-[#ff9f00] font-bold uppercase">OPERATIVE_EQUIPMENT</span>
                <div className="grid grid-cols-2 gap-2">
                  {['Silenced Carbine', 'Combat Knife', 'Marksman Rifle', 'EMP Grenade'].map(wpn => (
                    <button
                      key={wpn}
                      onClick={() => {
                        setWeapon(wpn);
                        playBeep(400, 0.08);
                      }}
                      className={`p-2 border text-[9px] uppercase font-bold text-center transition-all ${
                        weapon === wpn
                          ? 'border-[#ff9f00] bg-[#ff9f00]/10 text-white'
                          : 'border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {wpn}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startMission}
                className="w-full bg-[#00f0ff] text-black font-extrabold py-3.5 uppercase tracking-widest text-center text-xs hover:bg-[#00f0ff]/80 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
              >
                DEPLOY_TACTICAL_AGENT &gt;&gt;
              </button>
            </>
          )}

          {gameState !== 'setup' && (
            <div className="hud-panel p-5 flex flex-col gap-4">
              <span className="text-[#00f0ff] font-bold uppercase border-b border-slate-900 pb-2 block">HUD_MISSION_GAUGES</span>
              
              <div className="space-y-4">
                {/* Health */}
                <div>
                  <div className="flex justify-between font-bold text-[9px] mb-1">
                    <span>OPERATIVE_INTEGRITY</span>
                    <span className="text-[#39ff14]">{Math.floor(health)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 border border-slate-900 h-2.5 p-0.5">
                    <div className="bg-[#39ff14] h-full" style={{ width: `${health}%` }} />
                  </div>
                </div>

                {/* Stealth level */}
                <div>
                  <div className="flex justify-between font-bold text-[9px] mb-1">
                    <span>INFRARED_CAMOUFLAGE</span>
                    <span className="text-[#00f0ff]">{Math.floor(stealthLevel)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 border border-slate-900 h-2.5 p-0.5">
                    <div className="bg-[#00f0ff] h-full" style={{ width: `${stealthLevel}%` }} />
                  </div>
                </div>

                {/* Hostages */}
                <div className="flex justify-between border-t border-slate-900 pt-3">
                  <span>HOSTAGES_EXTRACTED:</span>
                  <span className="text-white font-extrabold text-sm">{hostagesRescued} / {hostagesTotal}</span>
                </div>

                {/* Score */}
                <div className="flex justify-between">
                  <span>OPERATIONAL_CREDITS:</span>
                  <span className="text-[#ff9f00] font-extrabold">{score} PTS</span>
                </div>
              </div>

              {/* Gameover / Win triggers */}
              {gameState === 'gameover' && (
                <div className="border-t border-red-500/20 pt-4 flex flex-col gap-3">
                  <div className="text-center bg-red-950/20 border border-red-500/30 p-3 text-red-400 font-bold uppercase text-[10px]">
                    AGENT_TERMINATED. INFILTRATION_FAILED.
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setGameState('setup')} className="border border-slate-800 text-slate-500 py-2.5 uppercase font-bold">DISPATCH</button>
                    <button onClick={startMission} className="bg-[#ff9f00] text-black py-2.5 uppercase font-bold tracking-wider">RE-DEPLOY</button>
                  </div>
                </div>
              )}

              {gameState === 'completed' && (
                <div className="border-t border-[#39ff14]/20 pt-4 flex flex-col gap-3">
                  <div className="text-center bg-[#39ff14]/10 border border-[#39ff14]/30 p-3 text-[#39ff14] font-bold uppercase text-[10px] animate-pulse">
                    MISSION_ACCOMPLISHED. SYSTEM_SECURED.
                  </div>
                  {user && (
                    <div className="text-center text-[#39ff14] text-[9px] uppercase">
                      + {Math.floor(score / 10)} XP ACCRUED IN PROFILE SHEET
                    </div>
                  )}
                  <button onClick={() => setGameState('setup')} className="w-full bg-[#00f0ff] text-black py-3 uppercase font-bold tracking-widest">
                    RETURN_TO_INTEL
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="hud-panel bg-slate-950 border-[#00f0ff]/30 p-2 overflow-hidden flex justify-center items-center relative">
            
            {gameState === 'setup' && (
              <div className="absolute inset-0 bg-[#05070a]/95 flex flex-col items-center justify-center text-center p-6 z-10 gap-3 border border-[#00f0ff]/10">
                <span className="text-4xl">🕵️‍♂️🔫</span>
                <h2 className="text-sm font-extrabold text-[#00f0ff] uppercase tracking-widest font-mono">MISSION BRIEFING DISPATCH</h2>
                <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed uppercase">
                  INFILTRATE THE SECTORS, NEUTRALIZE DEFECTIVE SECURITY BOTS, SECURE THE HOSTAGES, AND ADVANCE TO THE EXTRACT ZONE.
                </p>
                <div className="border border-slate-900 bg-black/60 p-3 text-left space-y-1.5 font-mono text-[9px] max-w-xs text-slate-500 mt-2">
                  <div>TACTICAL CONTROLS:</div>
                  <div className="text-slate-300">W / A / S / D or ARROWS: MOVE GHOST</div>
                  <div className="text-slate-300">MOUSE COORDINATES: AIM WEAPONS</div>
                  <div className="text-slate-300">LEFT MOUSE CLICK: DISCHARGE PAYLOAD</div>
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={400}
              height={450}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              className="bg-black/60 border border-slate-900 cursor-crosshair"
            />
          </div>

          <div className="hud-panel p-4 text-[10px] text-slate-500 flex justify-between items-center bg-[#05070a]">
            <span>NODE_ID: rogue_ghost_stealth_runtime</span>
            <span className="text-[#00f0ff] font-bold">STATUS: CAM_ACTIVE // READY</span>
          </div>
        </div>

      </div>
    </div>
  );
}
