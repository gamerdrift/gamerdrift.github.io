"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '../../lib/state/UserContext';
import { useGames } from '../../lib/state/GameContext';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  targetGame: string;
  gameId: string;
  power: number;
  status: 'SCANNING' | 'ANALYZING' | 'RE-COMPILING' | 'IDLE';
  currentTask: string;
  authority: string;
}

const initialAgents: Agent[] = [
  { id: 'ag-1', name: 'AGENT_PHANTOM_01', avatar: '🕵️‍♂️', targetGame: 'Captn.Ghost', gameId: 'captn-ghost', power: 98.4, status: 'SCANNING', currentTask: 'Crawling GitHub for tactical ray-casting vectors...', authority: 'ROOT_SHELL / GODOT_ACCESS' },
  { id: 'ag-2', name: 'AGENT_NITRO_03', avatar: '🏎️', targetGame: 'Retro Racer', gameId: 'retro-racer', power: 95.1, status: 'ANALYZING', currentTask: 'Scraping physics coefficient matrices from stackoverflow.com...', authority: 'ROOT_SHELL / GODOT_ACCESS' },
  { id: 'ag-3', name: 'AGENT_COSMO_09', avatar: '👾', targetGame: 'Space Invaders', gameId: 'space-invaders', power: 92.7, status: 'IDLE', currentTask: 'Idle. Listening to galaxy broadcast telemetry...', authority: 'ROOT_SHELL / COMPILER_ACCESS' },
  { id: 'ag-4', name: 'AGENT_JUMPER_04', avatar: '🏃', targetGame: 'Pixel Platformer', gameId: 'pixel-platformer', power: 94.2, status: 'SCANNING', currentTask: 'Extracting gravity scaling properties from physics forums...', authority: 'ROOT_SHELL / GODOT_ACCESS' },
  { id: 'ag-5', name: 'AGENT_SERPENT_07', avatar: '🐍', targetGame: 'Retro Snake', gameId: 'snake', power: 89.6, status: 'RE-COMPILING', currentTask: 'Compiling 3D neon skin shaders in Godot project...', authority: 'ROOT_SHELL / GODOT_ACCESS' },
  { id: 'ag-6', name: 'AGENT_TETRA_02', avatar: '🧩', targetGame: 'Block Tetris', gameId: 'tetris', power: 97.3, status: 'ANALYZING', currentTask: 'Parsing grid collision optimizations on Reddit...', authority: 'ROOT_SHELL / COMPILER_ACCESS' },
  { id: 'ag-7', name: 'AGENT_MERGE_05', avatar: '🔢', targetGame: '2048 Puzzle', gameId: '2048', power: 91.0, status: 'IDLE', currentTask: 'Idle. Indexing grid arithmetic patterns...', authority: 'ROOT_SHELL / COMPILER_ACCESS' }
];

interface Patch {
  id: string;
  agentId: string;
  gameTitle: string;
  patchTitle: string;
  description: string;
  sourceUrl: string;
  difficulty: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAX';
  status: 'PENDING' | 'COMPILING' | 'DEPLOYED';
}

const initialPatches: Patch[] = [
  { id: 'pt-1', agentId: 'ag-2', gameTitle: 'Retro Racer', patchTitle: 'WebGL 3D Tread Shaders', description: 'Enhance tire tracks with 3D particles and responsive drift smoke using Godot Compatibility shaders.', sourceUrl: 'github.com/godot-shaders/racer-smoke', difficulty: 'MEDIUM', status: 'PENDING' },
  { id: 'pt-2', agentId: 'ag-5', gameTitle: 'Retro Snake', patchTitle: '3D Extrusion meshes', description: 'Replace flat 2D canvas blocks with glowing 3D cylindrical segments utilizing root engine matrix layouts.', sourceUrl: 'reddit.com/r/gamedev/snake3d', difficulty: 'HIGH', status: 'PENDING' },
  { id: 'pt-3', agentId: 'ag-1', gameTitle: 'Captn.Ghost', patchTitle: 'Tactical Ray-traced shadows', description: 'Uplink 3D Ray-casting vectors to project realistic dynamic volumetric shadow maps around target drones.', sourceUrl: 'github.com/aaa-arcade/volumetric-shadows', difficulty: 'MAX', status: 'PENDING' },
  { id: 'pt-4', agentId: 'ag-6', gameTitle: 'Block Tetris', patchTitle: 'Neon Glassmorphism blocks', description: 'Enhance standard puzzle block sprites into reflective glass-like materials with realtime background refraction.', sourceUrl: 'stackoverflow.com/questions/canvas-glassmorphism', difficulty: 'LOW', status: 'PENDING' }
];

const logTemplates = [
  { prefix: 'FETCHING', text: 'scraping HTML5 game coordinates from open-source repositories...' },
  { prefix: 'ANALYZING', text: 'processing Reddit strategy feeds for player telemetry enhancements...' },
  { prefix: 'UPLINKING', text: 'established secure socket tunnel to local compiler terminal.' },
  { prefix: 'PARSING', text: 'reading stackoverflow.com shader questions for WebGL acceleration ideas...' },
  { prefix: 'COMPILING', text: 'writing modular patch segments to games database folder...' },
  { prefix: 'SECURITY', text: 'access granted: root credentials synchronized to project files.' },
  { prefix: 'INTEGRATING', text: 'rebuilding Godot 3D coordinates package for browser compatibility...' }
];

export default function AIAgentsPage() {
  const { user, gainXP } = useUser();
  const { games } = useGames();
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [patches, setPatches] = useState<Patch[]>(initialPatches);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeCompilingPatchId, setActiveCompilingPatchId] = useState<string | null>(null);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);
  const compilerBottomRef = useRef<HTMLDivElement>(null);

  // Sound generator helpers
  const playBeep = (freq = 440, duration = 0.1, type: OscillatorType = 'sine') => {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Seed initial logs
  useEffect(() => {
    const initialLogs = Array.from({ length: 8 }).map(() => {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      return `[${new Date().toLocaleTimeString()}] [${agent.name}] ${template.prefix}: ${template.text}`;
    });
    setLogs(initialLogs);
  }, []);

  // Scroll to bottom helper
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (compilerBottomRef.current) {
      compilerBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [compileLogs]);

  // Periodic scraper simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random agent and template
      const randomAgentIndex = Math.floor(Math.random() * agents.length);
      const agent = agents[randomAgentIndex];
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      
      // Update Agent Status occasionally
      setAgents(prev => prev.map((a, idx) => {
        if (idx === randomAgentIndex) {
          const statuses: Agent['status'][] = ['SCANNING', 'ANALYZING', 'IDLE', 'RE-COMPILING'];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          const tasks = [
            `Crawling ${template.prefix.toLowerCase()} targets...`,
            `Parsing game specifications in Godot compiler...`,
            `Integrating dynamic telemetry scripts...`,
            `Idle. Listening for remote packet signals...`
          ];
          return {
            ...a,
            status: newStatus,
            currentTask: newStatus === 'IDLE' ? 'Idle. Listening to network feeds...' : tasks[Math.floor(Math.random() * tasks.length)]
          };
        }
        return a;
      }));

      // Append log
      const newLog = `[${new Date().toLocaleTimeString()}] [${agent.name}] ${template.prefix}: ${template.text}`;
      setLogs(prev => [...prev.slice(-49), newLog]); // keep last 50 logs

      // Ambient tick beep
      if (Math.random() < 0.3) {
        playBeep(880, 0.02);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [agents]);

  // Handle patch compiler simulation
  const handleDeployPatch = (patchId: string) => {
    if (activeCompilingPatchId) return; // Wait for current compilation
    setActiveCompilingPatchId(patchId);
    setCompileProgress(0);
    setPatches(prev => prev.map(p => p.id === patchId ? { ...p, status: 'COMPILING' } : p));
    playBeep(400, 0.1, 'sawtooth');

    const patch = patches.find(p => p.id === patchId)!;
    const stages = [
      `[SYS_INFO] CONNECTING TO COMPILER DECK PORTS...`,
      `[SYS_INFO] ESTABLISHING DIRECTORY MOUNT [${patch.gameTitle.toUpperCase()}_DIR]`,
      `[SECURITY] VERIFYING AGENT SIGNATURE: G-SHELL ACCESS GRANTED`,
      `[GODOT] PARSING GDSCENE NODE DIRECTIVES...`,
      `[CRAWLER] DOWNLOADING DATA STREAM FROM [${patch.sourceUrl}]...`,
      `[CRAWLER] INGESTED: 4,129 KB DATA PACKETS`,
      `[COMPILER] INJECTING GRAPHICS OPTIMIZATIONS (2D -> 3D VOLUMETRIC GRAPHICS)...`,
      `[COMPILER] APPLIED GL_COMPATIBILITY SHADER INJECTION`,
      `[GODOT] Headless CLI packaging release...`,
      `[SYS_INFO] RE-COMPILING WEBGL BUILD SHELLS...`,
      `[SUCCESS] GAME CODE REBIASED AND COMPILED SUCCESSFULLY!`,
      `[DEPLOY] COPYING ASSETS TO PRODUCTION NODE /public/games/${patch.gameTitle.toLowerCase().replace(/[^a-z]/g, '')}/`
    ];

    let currentStage = 0;
    setCompileLogs([stages[0]]);

    const interval = setInterval(() => {
      currentStage += 1;
      if (currentStage < stages.length) {
        setCompileLogs(prev => [...prev, stages[currentStage]]);
        setCompileProgress(Math.floor((currentStage / stages.length) * 100));
        playBeep(600 + currentStage * 30, 0.05, 'sine');
      } else {
        clearInterval(interval);
        setCompileProgress(100);
        setCompileLogs(prev => [...prev, `[STATUS] PATCH SUCCESSFULLY DEPLOYED AND DECENTRALIZED!`]);
        
        // Award XP
        if (user) {
          gainXP(100);
        }
        playBeep(880, 0.3, 'sine');
        setTimeout(() => playBeep(1100, 0.2, 'sine'), 100);

        setPatches(prev => prev.map(p => p.id === patchId ? { ...p, status: 'DEPLOYED' } : p));
        setActiveCompilingPatchId(null);
      }
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-[#05070a] relative font-mono text-xs text-slate-300">
      
      {/* Background Grid & Scanline Overlay */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      <div className="scanlines"></div>

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header telemetry HUD */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#ff9f00]/20 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#ff9f00]/10 text-[#ff9f00] border border-[#ff9f00]/30 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                NODE_INTELLIGENCE: ACTIVE
              </span>
              <span className="text-slate-500">//</span>
              <span className="text-slate-500 uppercase tracking-widest text-[9px]">WWW_WEB_CRAWLER_UNITS</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase leading-none">
              AI_AGENTS <span className="text-[#ff9f00] hologram-text">CORE</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0 text-[10px] text-slate-500">
            <span>UPLINK_BANDWIDTH: <span className="text-white font-bold">1.2 GB/s</span></span>
            <span>//</span>
            <span>SECURE_THREADS: <span className="text-[#39ff14] font-bold">ONLINE</span></span>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-[#0c0f16]/90 border border-slate-900 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-slate-400">
          <div className="max-w-2xl">
            <span className="text-[#ff9f00] font-bold uppercase block mb-1">🤖 DRIFTER COGNITIVE ENHANCEMENT MATRIX</span>
            <p className="text-[10px] leading-relaxed uppercase">
              These autonomous intelligence units are assigned to platform game cabinets (excluding rogue_ghost and cunning_cats). They scan the web (forums, GitHub, and strategies) to harvest code patches, re-compile asset shells, and upgrade games with 3D shaders and advanced features. They are granted full root access to local directories, compiler terminals, and Godot project assets.
            </p>
          </div>
          {user && (
            <div className="bg-black/60 border border-slate-800 p-2.5 flex-shrink-0 text-center rounded min-w-[120px]">
              <span className="text-slate-500 text-[8px] uppercase block">CURRENT DRIFTER</span>
              <span className="text-[#00f0ff] font-bold block">{user.username.toUpperCase()}</span>
              <span className="text-[#ff9f00] text-[9px] font-bold block mt-0.5">LEVEL {user.level} // L-XP: {user.xp}</span>
            </div>
          )}
        </div>

        {/* Dashboard grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Agents Console Table */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Console Matrix panel */}
            <div className="hud-panel p-5 bg-[#0c0f16]/90 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2 flex items-center gap-2">
                <span className="text-[#ff9f00]">■</span> ACTIVE_AGENTS_CONSOLE_MATRIX
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest font-bold">
                      <th className="pb-2">AGENT_ID</th>
                      <th className="pb-2">TARGET_GAME</th>
                      <th className="pb-2 text-right">COGNITIVE_SYNC</th>
                      <th className="pb-2 text-center">STATUS</th>
                      <th className="pb-2 pl-4">CURRENT_CRAWL_TARGET</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {agents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-3 flex items-center gap-2">
                          <span className="text-base">{agent.avatar}</span>
                          <div>
                            <span className="font-bold block text-white">{agent.name}</span>
                            <span className="text-[8px] text-slate-500 block">{agent.authority}</span>
                          </div>
                        </td>
                        <td className="py-3 font-bold text-[#00f0ff] uppercase">{agent.targetGame}</td>
                        <td className="py-3 text-right font-bold text-amber-500">{agent.power.toFixed(1)}%</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 text-[8px] font-bold rounded-sm border uppercase ${
                            agent.status === 'SCANNING' ? 'border-[#00f0ff]/30 bg-[#00f0ff]/5 text-[#00f0ff]' :
                            agent.status === 'ANALYZING' ? 'border-[#ff9f00]/30 bg-[#ff9f00]/5 text-[#ff9f00]' :
                            agent.status === 'RE-COMPILING' ? 'border-[#ff00ff]/30 bg-[#ff00ff]/5 text-[#ff00ff] animate-pulse' :
                            'border-slate-800 text-slate-500'
                          }`}>
                            {agent.status}
                          </span>
                        </td>
                        <td className="py-3 pl-4 max-w-[200px] truncate text-slate-400 italic">
                          {agent.currentTask}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Autonomous Broadcaster Terminal Logs */}
            <div className="hud-panel p-5 bg-black flex flex-col gap-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-900 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-ping"></span>
                  AUTONOMOUS_SCRAPER_BROADCASTER_UPLINK
                </span>
                <span className="text-slate-500 text-[8px]">LOGS: {logs.length} RECORDED</span>
              </h3>

              {/* Logs Box */}
              <div className="h-56 bg-slate-950/90 border border-slate-900 rounded p-3 overflow-y-auto text-slate-500 font-mono text-[9px] flex flex-col gap-1.5 scrollbar-none">
                {logs.map((log, index) => (
                  <div key={index} className="leading-relaxed hover:text-white transition-colors">
                    {log}
                  </div>
                ))}
                <div ref={consoleBottomRef} />
              </div>
            </div>

          </div>

          {/* Right: Enhancement Patches Control Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Patches Proposal Panel */}
            <div className="hud-panel p-5 bg-[#0c0f16]/90 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2 flex items-center gap-2">
                <span className="text-[#ff9f00]">■</span> ENHANCEMENT_PATCHES_QUEUE
              </h3>

              <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-none">
                {patches.map((patch) => (
                  <div 
                    key={patch.id} 
                    className="bg-black/60 border border-slate-900 rounded-lg p-3.5 flex flex-col gap-2.5 hover:border-slate-800 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[#ff9f00] text-[8px] font-bold block uppercase">{patch.gameTitle}</span>
                        <span className="text-white font-extrabold text-xs block uppercase mt-0.5">{patch.patchTitle}</span>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                        patch.difficulty === 'LOW' ? 'border-[#39ff14]/30 bg-[#39ff14]/5 text-[#39ff14]' :
                        patch.difficulty === 'MEDIUM' ? 'border-[#00f0ff]/30 bg-[#00f0ff]/5 text-[#00f0ff]' :
                        patch.difficulty === 'HIGH' ? 'border-[#ff9f00]/30 bg-[#ff9f00]/5 text-[#ff9f00]' :
                        'border-[#ff00ff]/30 bg-[#ff00ff]/5 text-[#ff00ff] animate-pulse'
                      }`}>
                        {patch.difficulty}
                      </span>
                    </div>

                    <p className="text-[9px] text-slate-400 leading-relaxed uppercase">{patch.description}</p>
                    
                    <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold border-t border-slate-900 pt-2">
                      <span>SRC: {patch.sourceUrl}</span>
                      <span>STATUS: {patch.status}</span>
                    </div>

                    {patch.status === 'PENDING' ? (
                      <button
                        onClick={() => handleDeployPatch(patch.id)}
                        disabled={!!activeCompilingPatchId}
                        className={`w-full py-2 bg-[#ff9f00]/10 hover:bg-[#ff9f00]/30 text-[#ff9f00] border border-[#ff9f00]/30 font-bold tracking-widest text-[9px] uppercase transition-all rounded ${
                          activeCompilingPatchId ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.01]'
                        }`}
                      >
                        APPROVE & DEPLOY UPLINK &gt;&gt;
                      </button>
                    ) : patch.status === 'COMPILING' ? (
                      <div className="w-full bg-[#ff00ff]/5 border border-[#ff00ff]/20 text-center py-2 text-[#ff00ff] font-bold text-[9px] uppercase animate-pulse">
                        UPLINK COMPILING LOGS...
                      </div>
                    ) : (
                      <div className="w-full bg-[#39ff14]/5 border border-[#39ff14]/20 text-center py-2 text-[#39ff14] font-bold text-[9px] uppercase tracking-widest">
                        DEPLOYED & ROOT STAGED ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Compiler Console box */}
            {activeCompilingPatchId && (
              <div className="hud-panel p-5 bg-[#12071a]/90 border border-[#ff00ff]/30 flex flex-col gap-3 shadow-[0_0_20px_rgba(255,0,255,0.1)]">
                <h3 className="text-xs font-bold text-[#ff00ff] uppercase tracking-wider pb-2 border-b border-[#ff00ff]/20 flex justify-between items-center">
                  <span>ROOT_COMPILER_SHELL</span>
                  <span className="text-[#ff00ff] font-bold">{compileProgress}%</span>
                </h3>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 border border-slate-900 h-2 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ff00ff] to-[#00f0ff] transition-all duration-300"
                    style={{ width: `${compileProgress}%` }}
                  />
                </div>

                {/* Terminal stage outputs */}
                <div className="h-40 bg-black/90 border border-slate-900 p-2.5 overflow-y-auto text-[#ff00ff] font-mono text-[8px] flex flex-col gap-1 scrollbar-none">
                  {compileLogs.map((log, index) => (
                    <div key={index} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                  <div ref={compilerBottomRef} />
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
