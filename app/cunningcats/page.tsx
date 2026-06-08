"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../lib/state/UserContext';
import { useGames } from '../../lib/state/GameContext';

interface Character {
  id: string;
  name: string;
  avatar: string;
  speed: number;
  armor: number;
  special: string;
}

const characters: Character[] = [
  { id: 'cat-1', name: 'Captain Whiskers', avatar: '🐱‍👤', speed: 85, armor: 40, special: 'Nitro Reflex' },
  { id: 'cat-2', name: 'Sergeant Claw', avatar: '🐱‍🚀', speed: 65, armor: 70, special: 'Shield Burst' },
  { id: 'cat-3', name: 'Lt. Purr', avatar: '🐱‍💻', speed: 50, armor: 90, special: 'Rocket Barrage' }
];

export default function CunningCatsPage() {
  const { user, gainXP } = useUser();
  const { rateGame } = useGames();

  // Selection Phase States
  const [selectedChar, setSelectedChar] = useState<Character>(characters[0]);
  const [vehicleColor, setVehicleColor] = useState('#ff9f00'); // Amber
  const [selectedWeapon, setSelectedWeapon] = useState('Laser Blaster');
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'gameover'>('setup');

  // Game Score & Stats
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [nitro, setNitro] = useState(100);
  const [health, setHealth] = useState(100);
  const [speedVal, setSpeedVal] = useState(120);

  // Canvas Reference
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

  // Game Loop Variables
  const playerX = useRef(180);
  const keys = useRef<{ [key: string]: boolean }>({});
  const obstacles = useRef<{ x: number; y: number; width: number; height: number; type: 'rock' | 'mine' | 'ammo' }[]>([]);
  const ammoCount = useRef(3);
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; color: string; size: number }[]>([]);
  const bullets = useRef<{ x: number; y: number }[]>([]);

  // Sound generator helpers
  const playBeep = (freq = 440, duration = 0.1) => {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setHealth(100);
    setNitro(100);
    setSpeedVal(120);
    playerX.current = 180;
    obstacles.current = [];
    bullets.current = [];
    ammoCount.current = 3;
    keys.current = {};
    playBeep(600, 0.3);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        // Fire bullet
        if (ammoCount.current > 0) {
          bullets.current.push({ x: playerX.current + 15, y: 350 });
          ammoCount.current -= 1;
          playBeep(800, 0.05);
        } else {
          playBeep(200, 0.1); // No ammo click
        }
      }
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
  }, [gameState]);

  // Main Canvas Render loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let obstacleTimer = 0;
    let localScore = 0;

    const gameLoop = () => {
      // Clear Screen
      ctx.fillStyle = '#05070a';
      ctx.fillRect(0, 0, 400, 450);

      // Draw Desert Highway Grid lines
      ctx.strokeStyle = 'rgba(255, 159, 0, 0.08)'; // tactical amber
      ctx.lineWidth = 1;
      // Verticals
      for (let i = 0; i <= 400; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 450);
        ctx.stroke();
      }
      // Horizontals
      const scrollOffset = (Date.now() / 8) % 40;
      for (let i = scrollOffset; i <= 450; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(400, i);
        ctx.stroke();
      }

      // Draw Highway Shoulders
      ctx.fillStyle = '#121620';
      ctx.fillRect(0, 0, 50, 450);
      ctx.fillRect(350, 0, 50, 450);

      ctx.strokeStyle = '#ff9f00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 0);
      ctx.lineTo(50, 450);
      ctx.moveTo(350, 0);
      ctx.lineTo(350, 450);
      ctx.stroke();

      // Handle Inputs (Left/Right)
      const baseSpeed = selectedChar.speed / 15;
      let activeSpeed = baseSpeed;
      
      // Nitro Boost triggers
      let usingNitro = false;
      if (keys.current['ArrowUp'] || keys.current['KeyW']) {
        setNitro(prev => {
          if (prev > 0) {
            usingNitro = true;
            activeSpeed *= 1.8;
            setSpeedVal(Math.floor(120 + prev * 1.5));
            return Math.max(0, prev - 0.5);
          }
          setSpeedVal(120);
          return 0;
        });
      } else {
        setNitro(prev => Math.min(100, prev + 0.15));
        setSpeedVal(120);
      }

      if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
        playerX.current = Math.max(55, playerX.current - activeSpeed);
      }
      if (keys.current['ArrowRight'] || keys.current['KeyD']) {
        playerX.current = Math.min(315, playerX.current + activeSpeed);
      }

      // Generate sandstorm particles from wheels
      if (Math.random() < (usingNitro ? 0.8 : 0.3)) {
        particles.current.push({
          x: playerX.current + 15 + (Math.random() * 10 - 5),
          y: 410,
          vx: Math.random() * 4 - 2,
          vy: Math.random() * 4 + 4,
          color: usingNitro ? '#00f0ff' : '#ff9f00',
          size: Math.random() * 4 + 1
        });
      }

      // Spawn obstacles / ammo crates
      obstacleTimer += 1;
      const spawnRate = usingNitro ? 30 : 50;
      if (obstacleTimer >= spawnRate) {
        obstacleTimer = 0;
        const lane = 60 + Math.floor(Math.random() * 4) * 70;
        const rand = Math.random();
        if (rand < 0.2) {
          obstacles.current.push({ x: lane, y: -40, width: 25, height: 25, type: 'ammo' });
        } else if (rand < 0.5) {
          obstacles.current.push({ x: lane, y: -40, width: 30, height: 15, type: 'mine' });
        } else {
          obstacles.current.push({ x: lane, y: -40, width: 35, height: 35, type: 'rock' });
        }
      }

      // Draw & Update bullets
      ctx.fillStyle = '#00f0ff';
      bullets.current.forEach((b, idx) => {
        b.y -= 10;
        ctx.fillRect(b.x, b.y, 4, 12);
        // Bullet out of bounds
        if (b.y < 0) bullets.current.splice(idx, 1);
      });

      // Update & Draw obstacles
      obstacles.current.forEach((obs, idx) => {
        obs.y += usingNitro ? 7 : 4;

        // Draw obstacle
        if (obs.type === 'ammo') {
          // Ammo crate
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = '#000000';
          ctx.font = '9px monospace';
          ctx.fillText('AM', obs.x + 4, obs.y + 16);
        } else if (obs.type === 'mine') {
          // Tactical Mine
          ctx.fillStyle = '#ff3333';
          ctx.beginPath();
          ctx.arc(obs.x + 15, obs.y + 7.5, 10, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Desert barricade / Rock
          ctx.fillStyle = '#555555';
          ctx.strokeStyle = '#ff9f00';
          ctx.lineWidth = 1;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        }

        // Bullet collision with obstacle
        bullets.current.forEach((b, bIdx) => {
          if (
            b.x >= obs.x && b.x <= obs.x + obs.width &&
            b.y >= obs.y && b.y <= obs.y + obs.height
          ) {
            // Blow up obstacle
            bullets.current.splice(bIdx, 1);
            obstacles.current.splice(idx, 1);
            localScore += 50;
            setScore(localScore);
            playBeep(300, 0.15);
            // Spawn explosion particles
            for (let k = 0; k < 8; k++) {
              particles.current.push({
                x: obs.x + obs.width/2,
                y: obs.y + obs.height/2,
                vx: Math.random() * 8 - 4,
                vy: Math.random() * 8 - 4,
                color: '#ff9f00',
                size: Math.random() * 5 + 2
              });
            }
          }
        });

        // Player Collision Check
        if (
          playerX.current < obs.x + obs.width &&
          playerX.current + 30 > obs.x &&
          380 < obs.y + obs.height &&
          420 > obs.y
        ) {
          // Collide!
          obstacles.current.splice(idx, 1);
          if (obs.type === 'ammo') {
            ammoCount.current = Math.min(10, ammoCount.current + 2);
            localScore += 100;
            setScore(localScore);
            playBeep(700, 0.1);
          } else {
            // Take damage
            const dmgVal = obs.type === 'mine' ? 30 : 20;
            const mitigated = Math.floor(dmgVal * (1 - selectedChar.armor / 120));
            setHealth(prev => {
              const current = prev - mitigated;
              if (current <= 0) {
                // Game Over
                setGameState('gameover');
                playBeep(120, 0.8);
                // Sync high score
                setHighScore(old => {
                  const finalScore = Math.max(old, localScore);
                  if (user) {
                    // Gain XP based on score
                    gainXP(Math.floor(localScore / 10));
                  }
                  return finalScore;
                });
                return 0;
              }
              playBeep(250, 0.2);
              return current;
            });
          }
        }

        // Out of bounds cleanup
        if (obs.y > 450) {
          obstacles.current.splice(idx, 1);
          localScore += 10;
          setScore(localScore);
        }
      });

      // Draw Particles
      particles.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.95; // fade size
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        if (p.size < 0.5) particles.current.splice(idx, 1);
      });

      // Draw Player Armored vehicle
      ctx.fillStyle = vehicleColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      // Main Chassis
      ctx.fillRect(playerX.current, 380, 30, 40);
      ctx.strokeRect(playerX.current, 380, 30, 40);
      // Wheels
      ctx.fillStyle = '#111111';
      ctx.fillRect(playerX.current - 4, 385, 4, 10);
      ctx.fillRect(playerX.current + 30, 385, 4, 10);
      ctx.fillRect(playerX.current - 4, 405, 4, 10);
      ctx.fillRect(playerX.current + 30, 405, 4, 10);
      // Windshield
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(playerX.current + 4, 390, 22, 8);
      // Weapon mounted turret
      ctx.fillStyle = '#555555';
      ctx.fillRect(playerX.current + 12, 372, 6, 12);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(playerX.current + 14, 368, 2, 6); // muzzle

      // Draw Player Cat Emoji avatar on top
      ctx.font = '12px sans-serif';
      ctx.fillText(selectedChar.avatar, playerX.current + 9, 412);

      // HUD text values inside Canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(5, 5, 100, 38);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(5, 5, 100, 38);
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px monospace';
      ctx.fillText(`WEAPON: ${selectedWeapon.slice(0, 5)}`, 10, 16);
      ctx.fillText(`SHELLS: [${ammoCount.current}]`, 10, 26);
      ctx.fillText(`SPEED: ${speedVal}MPH`, 10, 36);

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState, selectedChar, vehicleColor, selectedWeapon]);

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
        
        {/* Setup Selection Deck */}
        <div className="md:col-span-5 flex flex-col gap-5">
          
          <div className="border-b border-[#ff9f00]/30 pb-3 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[9px] text-[#ff9f00] uppercase tracking-wider block">GamerDrift Operations</span>
              <h1 className="text-2xl font-extrabold text-white tracking-widest uppercase">CUNNING_CATS</h1>
              <span className="text-[8px] text-slate-500 uppercase mt-0.5 block">COMBAT RACING SYSTEM TERMINAL</span>
            </div>
            
            <button
              onClick={toggleFullscreen}
              className="text-[10px] font-mono font-bold tracking-widest px-3 py-1.5 border border-[#ff9f00] text-[#ff9f00] hover:bg-[#ff9f00]/20 hover:text-white rounded transition-all duration-300 shadow-[0_0_10px_rgba(255,159,0,0.1)]"
            >
              {isFullscreen ? '[ ⛶ EXIT ]' : '[ ⛶ FULLSCREEN ]'}
            </button>
          </div>

          {gameState === 'setup' && (
            <>
              {/* Select Character */}
              <div className="hud-panel p-4 flex flex-col gap-3">
                <span className="text-[#00f0ff] font-bold uppercase">SELECT_CAT_OPERATIVE</span>
                <div className="grid grid-cols-3 gap-2">
                  {characters.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedChar(cat);
                        playBeep(500, 0.08);
                      }}
                      className={`p-2 border flex flex-col items-center gap-1.5 transition-all ${
                        selectedChar.id === cat.id
                          ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white'
                          : 'border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl">{cat.avatar}</span>
                      <span className="text-[8px] font-bold text-center leading-none">{cat.name.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
                {/* Char attributes */}
                <div className="bg-black/40 border border-slate-900 p-2.5 space-y-1 text-[9px] text-slate-400">
                  <div className="flex justify-between">
                    <span>AGILITY_ENGINE:</span>
                    <span className="text-[#00f0ff] font-bold">{selectedChar.speed}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DEFENSIVE_ARMOR:</span>
                    <span className="text-[#ff9f00] font-bold">{selectedChar.armor}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SPECIALIZATION:</span>
                    <span className="text-white font-bold">{selectedChar.special}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle customizer paint */}
              <div className="hud-panel p-4 flex flex-col gap-3">
                <span className="text-[#00f0ff] font-bold uppercase">VEHICLE_CHASSIS_ARMOR</span>
                <div className="flex gap-3">
                  {[
                    { hex: '#ff9f00', name: 'Desert Amber' },
                    { hex: '#00f0ff', name: 'Cyber Cyan' },
                    { hex: '#ff3333', name: 'Rogue Red' }
                  ].map(color => (
                    <button
                      key={color.hex}
                      onClick={() => {
                        setVehicleColor(color.hex);
                        playBeep(450, 0.08);
                      }}
                      className={`flex-grow py-2 border text-[9px] font-bold text-center transition-all`}
                      style={{ 
                        borderColor: vehicleColor === color.hex ? color.hex : 'transparent',
                        backgroundColor: color.hex + '15',
                        color: color.hex
                      }}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weapon Configuration */}
              <div className="hud-panel p-4 flex flex-col gap-3">
                <span className="text-[#00f0ff] font-bold uppercase">WEAPON_PAYLOAD</span>
                <div className="grid grid-cols-2 gap-2">
                  {['Laser Blaster', 'Bone Missile', 'Gatling Cannon', 'Plasma Beam'].map(wpn => (
                    <button
                      key={wpn}
                      onClick={() => {
                        setSelectedWeapon(wpn);
                        playBeep(400, 0.08);
                      }}
                      className={`p-2 border text-[9px] uppercase font-bold text-center transition-all ${
                        selectedWeapon === wpn
                          ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white'
                          : 'border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {wpn}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full bg-[#ff9f00] text-black font-extrabold py-3.5 uppercase tracking-widest text-center text-xs hover:bg-[#ff9f00]/80 shadow-[0_0_15px_rgba(255,159,0,0.3)] transition-all"
              >
                DEPLOY_TO_DESERT_GRID &gt;&gt;
              </button>
            </>
          )}

          {gameState !== 'setup' && (
            <div className="hud-panel p-5 flex flex-col gap-4">
              <span className="text-[#00f0ff] font-bold uppercase border-b border-slate-900 pb-2 block">TELEMETRY_DASHBOARD</span>
              
              <div className="space-y-4">
                {/* Health Meter */}
                <div>
                  <div className="flex justify-between font-bold text-[9px] mb-1">
                    <span>CHASSIS_INTEGRITY</span>
                    <span className={health > 30 ? 'text-[#39ff14]' : 'text-red-500'}>{health}%</span>
                  </div>
                  <div className="w-full bg-slate-950 border border-slate-900 h-2.5 p-0.5">
                    <div 
                      className={`h-full transition-all duration-300 ${health > 30 ? 'bg-[#39ff14]' : 'bg-red-500 animate-pulse'}`} 
                      style={{ width: `${health}%` }} 
                    />
                  </div>
                </div>

                {/* Nitro Meter */}
                <div>
                  <div className="flex justify-between font-bold text-[9px] mb-1">
                    <span>NITRO_BOOST_COMPRESSION</span>
                    <span className="text-[#ff9f00]">{Math.floor(nitro)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 border border-slate-900 h-2.5 p-0.5">
                    <div 
                      className="h-full bg-[#ff9f00] transition-all" 
                      style={{ width: `${nitro}%` }} 
                    />
                  </div>
                </div>

                {/* Score */}
                <div className="flex justify-between border-t border-slate-900 pt-3">
                  <span>SCORE_REGISTRY:</span>
                  <span className="text-white font-extrabold text-sm">{score} PTS</span>
                </div>

                <div className="flex justify-between">
                  <span>BEST_RECORD:</span>
                  <span className="text-slate-500 font-bold">{highScore} PTS</span>
                </div>
              </div>

              {gameState === 'gameover' && (
                <div className="border-t border-red-500/20 pt-4 flex flex-col gap-3">
                  <div className="text-center bg-red-950/20 border border-red-500/30 p-3 text-red-400 font-bold uppercase text-[10px]">
                    CRITICAL DAMAGE. CHASSIS BREACHED.
                  </div>
                  {user && score > 0 && (
                    <div className="text-center text-[#39ff14] text-[9px] uppercase">
                      + {Math.floor(score / 10)} XP SYNCHRONIZED TO PROFILE
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setGameState('setup')} 
                      className="border border-slate-800 text-slate-500 py-2.5 uppercase font-bold"
                    >
                      GARAGE
                    </button>
                    <button 
                      onClick={startGame} 
                      className="bg-[#00f0ff] text-black py-2.5 uppercase font-bold tracking-wider"
                    >
                      RE-DEPLOY
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Playable Area Canvas */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="hud-panel bg-slate-950 border-[#00f0ff]/30 p-2 overflow-hidden flex justify-center items-center relative">
            
            {gameState === 'setup' && (
              <div className="absolute inset-0 bg-[#05070a]/95 flex flex-col items-center justify-center text-center p-6 z-10 gap-3 border border-[#ff9f00]/10">
                <span className="text-4xl">🏎️💨</span>
                <h2 className="text-sm font-extrabold text-[#ff9f00] uppercase tracking-widest">VEHICLE DISPATCH READY</h2>
                <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed uppercase">
                  CONFIGURE COGNITIVE CAT OPERATIVES AND HEAVY ARMAMENT SCHEMAS IN THE LEFT COMMAND SHELF, THEN DISPATCH TO RUNTIME HIGHLIGHTS.
                </p>
                <div className="border border-slate-900 bg-black/60 p-3 text-left space-y-1.5 font-mono text-[9px] max-w-xs text-slate-500 mt-2">
                  <div>CONTROLS GUIDE:</div>
                  <div className="text-slate-300">A / D or LEFT / RIGHT: STEER CHASSIS</div>
                  <div className="text-slate-300">W or UP ARROW: NITRO BOOST (SPEED+)</div>
                  <div className="text-slate-300">SPACEBAR: SHOOT MOUNTED WEAPONS</div>
                </div>
              </div>
            )}

            <canvas 
              ref={canvasRef} 
              width={400} 
              height={450} 
              className="bg-black/60 border border-slate-900"
            />
          </div>

          <div className="hud-panel p-4 text-[10px] text-slate-500 flex justify-between items-center bg-[#05070a]">
            <span>NODE_ID: cunning_cats_racing_runtime</span>
            <span className="text-[#00f0ff] font-bold">STATUS: RUNNING // CANVAS_READY</span>
          </div>
        </div>

      </div>
    </div>
  );
}
