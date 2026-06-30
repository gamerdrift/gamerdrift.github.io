"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '../../lib/state/UserContext';
import { getPlayUrl } from '../../lib/routes';

// ─── MAP DATA ───────────────────────────────────────────────────────────────
const MISSIONS = [
  {
    id: 'sandbath',
    code: 'SB-44',
    name: 'SANDBATH',
    subtitle: 'Desert Military Compound',
    season: 'SEASON 01',
    status: 'COMING SOON',
    playable: false,
    mapImage: '/map_sandbath.png',
    themeColor: '#ff9f00',
    glowColor: 'rgba(255,159,0,0.35)',
    accentColor: '#ffcc44',
    bgGradient: 'from-[#1a0e00] via-[#0d0700] to-[#05070a]',
    borderGlow: 'shadow-[0_0_40px_rgba(255,159,0,0.2)]',
    classification: 'OPERATION: SCORCHED EARTH',
    environment: 'Arid desert, +42°C, golden-hour sun, long shadows',
    threat: 'HIGH',
    enemyCount: '4 GUARDS',
    timeLimit: '08:00',
    reward: '500 XP',
    objectives: [
      { step: '01', icon: '🎯', label: 'PRIMARY', text: 'Eliminate all 4 hostile guards within the compound perimeter.' },
      { step: '02', icon: '🏃', label: 'SECONDARY', text: 'Reach the smoke-flare extraction zone in the northern sector of the compound.' },
      { step: '03', icon: '🔇', label: 'BONUS', text: 'Complete the mission without triggering alarm systems for stealth multiplier.' },
    ],
    intel: [
      'Enemy patrols rotate clockwise — intercept during blind-spot transitions.',
      'Sandbag clusters at grid refs B2, C4, D2 provide full crouched cover.',
      'Extraction smoke is active — approach from the west side to avoid sniper line.',
    ],
    controls: [
      { key: 'WASD', action: 'Move operative' },
      { key: 'MOUSE', action: 'Aim / Look' },
      { key: 'LMB', action: 'Shoot' },
      { key: 'R', action: 'Reload' },
      { key: 'SHIFT', action: 'Sprint' },
      { key: 'C', action: 'Crouch' },
      { key: 'F', action: 'Fullscreen' },
    ],
  },
  {
    id: 'snowblow',
    code: 'SW-07',
    name: 'SNOWBLOW',
    subtitle: 'Arctic Research Outpost',
    season: 'SEASON 02',
    status: 'ACTIVE',
    playable: true,
    mapImage: '/map_snowblow.png',
    themeColor: '#00f0ff',
    glowColor: 'rgba(0,240,255,0.35)',
    accentColor: '#88eeff',
    bgGradient: 'from-[#00101a] via-[#000d14] to-[#05070a]',
    borderGlow: 'shadow-[0_0_40px_rgba(0,240,255,0.2)]',
    classification: 'OPERATION: FROZEN PROTOCOL',
    environment: 'Arctic tundra, −28°C, active blizzard, visibility 25m',
    threat: 'EXTREME',
    enemyCount: '6 GUARDS + 2 SNIPERS',
    timeLimit: '12:00',
    reward: '900 XP',
    objectives: [
      { step: '01', icon: '💾', label: 'PRIMARY', text: 'Breach the research lab server room on Floor 2 and extract the classified data drive.' },
      { step: '02', icon: '🚁', label: 'SECONDARY', text: 'Reach the helipad extraction zone without triggering rooftop sniper alerts.' },
      { step: '03', icon: '❄️', label: 'BONUS', text: 'Disable the thermal camera array to earn the "Ghost Protocol" commendation.' },
    ],
    intel: [
      'Rooftop snipers rotate 180° every 45 seconds — use snowdrift cover to advance.',
      'The underground bunker tunnel connects the lab to the barracks — use for silent flanking.',
      'Frozen lake crossing (SW sector) is exposed — only attempt during blizzard whiteout.',
    ],
    controls: [
      { key: 'WASD', action: 'Move operative' },
      { key: 'MOUSE', action: 'Aim / Look' },
      { key: 'LMB', action: 'Shoot' },
      { key: 'R', action: 'Reload' },
      { key: 'SHIFT', action: 'Sprint' },
      { key: 'C', action: 'Crouch' },
    ],
  },
  {
    id: 'cargology',
    code: 'CG-22',
    name: 'CARGOLOGY',
    subtitle: 'Industrial Cargo Terminal',
    season: 'SEASON 03',
    status: 'COMING SOON',
    playable: false,
    mapImage: '/map_cargology.png',
    themeColor: '#ff6600',
    glowColor: 'rgba(255,102,0,0.35)',
    accentColor: '#ffaa44',
    bgGradient: 'from-[#1a0800] via-[#0d0500] to-[#05070a]',
    borderGlow: 'shadow-[0_0_40px_rgba(255,102,0,0.2)]',
    classification: 'OPERATION: IRON HARBOUR',
    environment: 'Industrial docklands, +12°C, sodium lighting, industrial smog',
    threat: 'VERY HIGH',
    enemyCount: '10 GUARDS + 2 GUN EMPLACEMENTS',
    timeLimit: '15:00',
    reward: '1200 XP',
    objectives: [
      { step: '01', icon: '🧑‍🔬', label: 'PRIMARY', text: 'Breach the main warehouse and rescue 3 hostage scientists from separate holding rooms.' },
      { step: '02', icon: '🚚', label: 'SECONDARY', text: 'Navigate the shipping container maze to the extraction truck at the north gate.' },
      { step: '03', icon: '💣', label: 'BONUS', text: 'Destroy the oil tanker fuel line to prevent enemy reinforcement deployment.' },
    ],
    intel: [
      'Shipping container corridors create tight CQC zones — use silenced carbine in close quarters.',
      'The moving freight train cuts across the central route — time your crossing between passes.',
      'Mounted gun on the tanker deck covers the north exit — must be neutralized or flanked via maintenance tunnel.',
    ],
    controls: [
      { key: 'WASD', action: 'Move operative' },
      { key: 'MOUSE', action: 'Aim / Look' },
      { key: 'LMB', action: 'Shoot' },
      { key: 'R', action: 'Reload' },
      { key: 'SHIFT', action: 'Sprint' },
      { key: 'C', action: 'Crouch' },
    ],
  },
  {
    id: 'forestfun',
    code: 'FF-13',
    name: 'FORESTFUN',
    subtitle: 'Dense Woodland Combat Zone',
    season: 'SEASON 04',
    status: 'COMING SOON',
    playable: false,
    mapImage: '/map_forestfun.png',
    themeColor: '#4ade80',
    glowColor: 'rgba(74,222,128,0.35)',
    accentColor: '#86efac',
    bgGradient: 'from-[#001a08] via-[#000d05] to-[#05070a]',
    borderGlow: 'shadow-[0_0_40px_rgba(74,222,128,0.2)]',
    classification: 'OPERATION: DARK CANOPY',
    environment: 'Temperate forest, −5°C, night op, rain, 15m visibility',
    threat: 'EXTREME',
    enemyCount: '8 GUARDS + 3 PATROL DOGS',
    timeLimit: '10:00',
    reward: '1000 XP',
    objectives: [
      { step: '01', icon: '💥', label: 'PRIMARY', text: 'Plant the explosive charge at the logging camp fuel depot to destroy enemy supply chain.' },
      { step: '02', icon: '🌉', label: 'SECONDARY', text: 'Reach extraction at the river bridge before the 8-minute countdown expires.' },
      { step: '03', icon: '🐕', label: 'BONUS', text: 'Neutralize all 3 patrol dogs silently to prevent compound-wide alert protocol.' },
    ],
    intel: [
      'Night operation — enemy guards carry flashlights. Stay out of beam arc or risk instant detection.',
      'Patrol dogs detect scent — move downwind (westward) when navigating around kennel positions.',
      'Underground tunnel network (south spawn → village) allows fully silent approach to the fuel depot.',
    ],
    controls: [
      { key: 'WASD', action: 'Move operative' },
      { key: 'MOUSE', action: 'Aim / Look' },
      { key: 'LMB', action: 'Shoot' },
      { key: 'R', action: 'Reload' },
      { key: 'SHIFT', action: 'Sprint' },
      { key: 'C', action: 'Crouch' },
    ],
  },
  {
    id: 'desert',
    code: 'DS-02',
    name: 'DESERT STORM',
    subtitle: 'Sand Sector — Ruins Breach',
    season: 'SEASON 05',
    status: 'COMING SOON',
    playable: false,
    mapImage: '/map_snowblow.png',
    themeColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.35)',
    accentColor: '#fcd34d',
    bgGradient: 'from-[#1a0e00] via-[#0d0700] to-[#05070a]',
    borderGlow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]',
    classification: 'OPERATION: SANDSTRIKE ALPHA',
    environment: 'Desert ruins, +48°C, sandstorm active, visibility 30m',
    threat: 'HIGH',
    enemyCount: '5 AK-47 GUARDS + 1 COMMANDER',
    timeLimit: '10:00',
    reward: '750 XP',
    objectives: [
      { step: '01', icon: '🏚️', label: 'PRIMARY', text: 'Infiltrate the desert ruins compound and rescue 2 hostages from enemy captivity.' },
      { step: '02', icon: '📁', label: 'SECONDARY', text: 'Collect 3 enemy intel clues before reaching the extraction beacon.' },
      { step: '03', icon: '🔇', label: 'BONUS', text: 'Eliminate the enemy Commander silently to prevent a full perimeter lockdown.' },
    ],
    intel: [
      'Enemy guards carry AK-47s — engage from behind cover, prioritise flanking angles.',
      'Sandstorm reduces enemy sightlines — use it to cross open ground between dunes.',
      'Hostages are held in the northwest ruins — approach from the east via collapsed wall.',
    ],
    controls: [
      { key: 'WASD', action: 'Move operative' },
      { key: 'MOUSE', action: 'Aim / Look' },
      { key: 'LMB', action: 'Shoot (M16)' },
      { key: 'SHIFT', action: 'Sprint' },
      { key: 'CTRL', action: 'Crouch' },
      { key: 'Z', action: 'Prone' },
      { key: 'F', action: 'Fullscreen' },
    ],
  },
  {
    id: 'night',
    code: 'NO-03',
    name: 'NIGHT OPS',
    subtitle: 'Midnight Infiltration — Outpost Zero',
    season: 'SEASON 05',
    status: 'COMING SOON',
    playable: false,
    mapImage: '/map_snowblow.png',
    themeColor: '#818cf8',
    glowColor: 'rgba(129,140,248,0.35)',
    accentColor: '#a5b4fc',
    bgGradient: 'from-[#06000f] via-[#030008] to-[#05070a]',
    borderGlow: 'shadow-[0_0_40px_rgba(129,140,248,0.2)]',
    classification: 'OPERATION: NIGHTFALL ZERO',
    environment: 'Pitch-black outpost, −8°C, no moonlight, heavy fog',
    threat: 'EXTREME',
    enemyCount: '8 AK-47 GUARDS + ROOFTOP SNIPER',
    timeLimit: '12:00',
    reward: '1100 XP',
    objectives: [
      { step: '01', icon: '🌑', label: 'PRIMARY', text: 'Navigate total darkness to locate and rescue the hostage from the outpost hold.' },
      { step: '02', icon: '👁️', label: 'SECONDARY', text: 'Use Thermal Goggles [T] to spot hidden enemies through fog and walls.' },
      { step: '03', icon: '🔕', label: 'BONUS', text: 'Silence all 8 guards before reaching the extraction beacon for the Ghost Rating.' },
    ],
    intel: [
      'Thermal Goggles [T] reveal enemy heat signatures through fog — essential in this sector.',
      'Rooftop sniper has a 270° arc — use building overhangs to stay off sightlines.',
      'Fog thickens at ground level — crawl [Z] to stay below detection threshold of perimeter sensors.',
    ],
    controls: [
      { key: 'WASD', action: 'Move operative' },
      { key: 'MOUSE', action: 'Aim / Look' },
      { key: 'LMB', action: 'Shoot (M16)' },
      { key: 'T', action: '🔥 Thermal Goggles' },
      { key: 'SHIFT', action: 'Sprint' },
      { key: 'CTRL', action: 'Crouch' },
      { key: 'Z', action: 'Prone' },
      { key: 'F', action: 'Fullscreen' },
    ],
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function RogueGhostPage() {
  const { user, gainXP } = useUser();
  const [selectedMission, setSelectedMission] = useState(MISSIONS[0]);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'objectives' | 'intel' | 'controls'>('objectives');
  const gameRef = useRef<HTMLDivElement>(null);

  const playBeep = (freq = 600, dur = 0.08) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch {}
  };

  const selectMission = (m: typeof MISSIONS[0]) => {
    playBeep(800, 0.05);
    setSelectedMission(m);
    setBriefingOpen(false);
    setLaunching(false);
    setLaunchProgress(0);
    setActiveTab('objectives');
  };

  const openBriefing = () => {
    playBeep(1000, 0.1);
    setBriefingOpen(true);
  };

  const launchMission = () => {
    if (!selectedMission.playable) return;
    setLaunching(true);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        if (user) gainXP(50);
        window.location.href = getPlayUrl('rogue-ghost', selectedMission.id);
      }
      setLaunchProgress(Math.min(100, p));
    }, 120);
    playBeep(400, 0.3);
  };

  const m = selectedMission;

  return (
    <div className="w-full min-h-screen bg-[#05070a] relative font-mono text-xs text-slate-300 overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none" />
      <div className="scanlines" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b pb-5 mb-8" style={{ borderColor: `${m.themeColor}30` }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider border" style={{ color: m.themeColor, borderColor: `${m.themeColor}40`, backgroundColor: `${m.themeColor}10` }}>
                FLAGSHIP_NODE: 01
              </span>
              <span className="text-slate-600 text-[9px]">// MISSION_SELECT_TERMINAL</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-[0.15em] uppercase leading-none">
              ROGUE_<span style={{ color: m.themeColor, textShadow: `0 0 20px ${m.themeColor}60` }}>GHOST</span>
            </h1>
            <p className="text-slate-600 text-[9px] tracking-widest uppercase mt-1">// SELECT DEPLOYMENT SECTOR — REVIEW BRIEFING — DEPLOY OPERATIVE</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="text-right text-[9px] text-slate-600 uppercase">
              <div>OPERATIVE: <span className="text-white font-bold">{user ? user.username.toUpperCase() : 'GUEST'}</span></div>
              <div>CLEARANCE: <span style={{ color: m.themeColor }} className="font-bold">TOP SECRET</span></div>
            </div>
            <Link href="/" className="text-[10px] font-bold tracking-widest px-3 py-2 border border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300 transition-all">
              [ HOME ]
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── LEFT: MISSION SELECTOR CARDS ── */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="text-[9px] text-slate-600 uppercase tracking-wider font-bold border-b border-slate-900 pb-2">// DEPLOYMENT SECTORS</div>

            {MISSIONS.map((mission, idx) => (
              <button
                key={mission.id}
                onClick={() => selectMission(mission)}
                className={`w-full text-left relative overflow-hidden rounded-lg border-2 transition-all duration-300 group ${
                  selectedMission.id === mission.id
                    ? 'scale-[1.02]'
                    : 'opacity-70 hover:opacity-100 hover:scale-[1.01]'
                }`}
                style={{
                  borderColor: selectedMission.id === mission.id ? mission.themeColor : '#1e293b',
                  boxShadow: selectedMission.id === mission.id ? `0 0 20px ${mission.themeColor}30` : 'none',
                }}
              >
                {/* Map thumbnail */}
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={mission.mapImage}
                    alt={mission.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ filter: 'saturate(1.1) contrast(1.05)' }}
                  />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(5,7,10,0.95) 20%, transparent 70%)` }} />
                  {/* Scan lines */}
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px)' }} />

                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className="text-[7px] font-black uppercase tracking-wider px-2 py-0.5"
                      style={{
                        backgroundColor: mission.playable ? `${mission.themeColor}25` : 'rgba(30,41,59,0.8)',
                        border: `1px solid ${mission.playable ? mission.themeColor : '#334155'}`,
                        color: mission.playable ? mission.themeColor : '#64748b',
                      }}
                    >
                      {mission.playable ? '● ACTIVE' : '⧖ ' + mission.status}
                    </span>
                  </div>

                  {/* Season */}
                  <div className="absolute top-2 left-2 text-[7px] text-slate-500 font-bold tracking-wider">{mission.season}</div>

                  {/* Locked indicator overlay */}
                  {!mission.playable && (
                    <div className="absolute inset-0 bg-[#0f172a]/70 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <span className="text-[9px] font-black tracking-[0.2em] text-red-500/80 border border-red-500/30 px-2.5 py-1 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">LOCKED</span>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-3 py-2 bg-[#0c0f16]">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-black text-sm tracking-wider uppercase" style={{ color: selectedMission.id === mission.id ? mission.themeColor : '#94a3b8' }}>
                        {mission.name}
                      </div>
                      <div className="text-[8px] text-slate-600 uppercase">{mission.subtitle}</div>
                    </div>
                    <div className="text-right text-[8px]">
                      <div className="text-slate-500">THREAT</div>
                      <div className="font-bold" style={{ color: mission.threat === 'EXTREME' ? '#ff4444' : mission.threat === 'VERY HIGH' ? '#ff6600' : '#ff9f00' }}>
                        {mission.threat}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active indicator bar */}
                {selectedMission.id === mission.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: mission.themeColor, boxShadow: `0 0 8px ${mission.themeColor}` }} />
                )}
              </button>
            ))}
          </div>

          {/* ── RIGHT: MISSION POSTER + BRIEFING ── */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* MISSION POSTER — cinematic hero image */}
            <div
              className={`relative w-full rounded-xl overflow-hidden border-2 ${m.borderGlow}`}
              style={{ borderColor: m.themeColor, aspectRatio: '16/7' }}
            >
              <img
                key={m.id}
                src={m.mapImage}
                alt={m.name}
                className="w-full h-full object-cover"
                style={{
                  filter: 'saturate(1.3) contrast(1.1) brightness(0.85)',
                  transition: 'all 0.4s ease',
                }}
              />

              {/* Gradient overlays */}
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(5,7,10,0.85) 0%, transparent 50%, rgba(5,7,10,0.4) 100%)` }} />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(5,7,10,0.95) 0%, transparent 60%)` }} />
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)' }} />

              {/* Top-left classification */}
              <div className="absolute top-4 left-5 z-10">
                <div className="text-[8px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: m.accentColor }}>
                  ◈ {m.classification}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{m.season} // GRID REF: {m.code}</div>
              </div>

              {/* Top-right status */}
              <div className="absolute top-4 right-5 z-10 text-right">
                <span
                  className="text-[8px] font-black tracking-widest uppercase px-3 py-1.5 inline-block"
                  style={{ border: `1px solid ${m.themeColor}`, color: m.themeColor, backgroundColor: `${m.themeColor}15`, boxShadow: `0 0 12px ${m.themeColor}30` }}
                >
                  {m.playable ? '● SECTOR ACTIVE' : '⧖ CLASSIFIED — LOCKED'}
                </span>
              </div>

              {/* Restricted access overlay */}
              {!m.playable && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
                  <div className="border border-red-500/30 bg-red-950/20 px-6 py-3 rounded-lg text-center backdrop-blur-sm shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse">
                    <div className="text-[10px] text-red-500 font-bold tracking-[0.4em] uppercase mb-1">ACCESS RESTRICTED</div>
                    <div className="text-2xl font-black text-white tracking-[0.25em] uppercase">COMING SOON</div>
                    <div className="text-[8px] text-slate-500 tracking-widest mt-1">OPERATIVE RECONNAISSANCE PENDING</div>
                  </div>
                </div>
              )}

              {/* Bottom: mission title + stats */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{m.subtitle}</div>
                    <h2
                      className="text-4xl md:text-5xl font-black tracking-[0.15em] uppercase leading-none"
                      style={{ color: m.themeColor, textShadow: `0 0 30px ${m.themeColor}60, 0 0 60px ${m.themeColor}20` }}
                    >
                      {m.name}
                    </h2>
                    <div className="text-[10px] text-slate-400 uppercase mt-1 font-bold tracking-wider">{m.environment}</div>
                  </div>

                  {/* Quick stats */}
                  <div className="flex gap-4 flex-shrink-0">
                    {[
                      { label: 'ENEMIES', value: m.enemyCount },
                      { label: 'TIME LIMIT', value: m.timeLimit },
                      { label: 'REWARD', value: m.reward },
                    ].map(stat => (
                      <div key={stat.label} className="text-center px-3 py-2 bg-black/60 border border-slate-800 min-w-[70px]">
                        <div className="text-[7px] text-slate-600 uppercase tracking-wider">{stat.label}</div>
                        <div className="font-black text-[10px] mt-0.5" style={{ color: m.themeColor }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── BRIEFING PANEL ── */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: `${m.themeColor}30`, boxShadow: `0 0 25px ${m.themeColor}10` }}
            >
              {/* Tab bar */}
              <div className="flex border-b" style={{ borderColor: `${m.themeColor}20`, backgroundColor: 'rgba(12,15,22,0.9)' }}>
                {(['objectives', 'intel', 'controls'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); playBeep(600, 0.04); }}
                    className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all"
                    style={{
                      color: activeTab === tab ? m.themeColor : '#475569',
                      borderBottom: activeTab === tab ? `2px solid ${m.themeColor}` : '2px solid transparent',
                      backgroundColor: activeTab === tab ? `${m.themeColor}08` : 'transparent',
                    }}
                  >
                    {tab === 'objectives' ? '🎯 OBJECTIVES' : tab === 'intel' ? '📡 FIELD INTEL' : '🎮 CONTROLS'}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className={`p-6 bg-gradient-to-br ${m.bgGradient} min-h-[200px]`}>

                {/* OBJECTIVES TAB */}
                {activeTab === 'objectives' && (
                  <div className="space-y-4">
                    <div className="text-[9px] text-slate-600 uppercase tracking-wider font-bold mb-4">
                      // MISSION OBJECTIVES — {m.classification}
                    </div>
                    {m.objectives.map((obj, i) => (
                      <div
                        key={i}
                        className="flex gap-4 p-4 rounded-lg border relative overflow-hidden group"
                        style={{
                          borderColor: i === 0 ? `${m.themeColor}40` : '#1e293b',
                          backgroundColor: i === 0 ? `${m.themeColor}08` : 'rgba(12,15,22,0.6)',
                        }}
                      >
                        {/* Step indicator */}
                        <div
                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg font-black text-sm border"
                          style={{
                            borderColor: i === 0 ? m.themeColor : '#334155',
                            color: i === 0 ? m.themeColor : '#475569',
                            backgroundColor: i === 0 ? `${m.themeColor}15` : 'transparent',
                          }}
                        >
                          {obj.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg leading-none">{obj.icon}</span>
                            <span
                              className="text-[8px] font-black tracking-widest uppercase px-2 py-0.5"
                              style={{
                                color: i === 0 ? m.themeColor : i === 1 ? '#94a3b8' : '#a855f7',
                                backgroundColor: i === 0 ? `${m.themeColor}15` : i === 1 ? 'rgba(148,163,184,0.1)' : 'rgba(168,85,247,0.1)',
                                border: `1px solid ${i === 0 ? m.themeColor + '40' : i === 1 ? '#33415580' : '#a855f740'}`,
                              }}
                            >
                              {obj.label}
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed font-sans">{obj.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* INTEL TAB */}
                {activeTab === 'intel' && (
                  <div className="space-y-4">
                    <div className="text-[9px] text-slate-600 uppercase tracking-wider font-bold mb-4">
                      // FIELD INTELLIGENCE — CLASSIFIED UPLINK
                    </div>
                    {m.intel.map((item, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-4 rounded-lg border"
                        style={{ borderColor: `${m.themeColor}20`, backgroundColor: 'rgba(0,0,0,0.4)' }}
                      >
                        <div
                          className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-black mt-0.5"
                          style={{ backgroundColor: `${m.themeColor}20`, color: m.themeColor, border: `1px solid ${m.themeColor}40` }}
                        >
                          {i + 1}
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed font-sans">{item}</p>
                      </div>
                    ))}

                    {/* Map preview in intel tab */}
                    <div className="mt-4 rounded-lg overflow-hidden border" style={{ borderColor: `${m.themeColor}20` }}>
                      <div className="text-[8px] font-bold px-3 py-1.5 uppercase tracking-wider" style={{ backgroundColor: `${m.themeColor}10`, color: m.themeColor }}>
                        ◈ TACTICAL OVERHEAD MAP — {m.name} // GRID {m.code}
                      </div>
                      <img src={m.mapImage} alt={`${m.name} tactical map`} className="w-full object-cover" style={{ maxHeight: '200px', filter: 'saturate(1.2)' }} />
                    </div>
                  </div>
                )}

                {/* CONTROLS TAB */}
                {activeTab === 'controls' && (
                  <div>
                    <div className="text-[9px] text-slate-600 uppercase tracking-wider font-bold mb-4">
                      // OPERATIVE KEYBINDING DIRECTIVES
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {m.controls.map((ctrl, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg border"
                          style={{ borderColor: `${m.themeColor}15`, backgroundColor: 'rgba(0,0,0,0.3)' }}
                        >
                          <kbd
                            className="flex-shrink-0 px-2.5 py-1.5 rounded text-[9px] font-black tracking-wider uppercase"
                            style={{
                              backgroundColor: `${m.themeColor}15`,
                              border: `1px solid ${m.themeColor}50`,
                              color: m.themeColor,
                              boxShadow: `0 2px 0 ${m.themeColor}30`,
                              minWidth: '50px',
                              textAlign: 'center',
                            }}
                          >
                            {ctrl.key}
                          </kbd>
                          <span className="text-slate-400 text-xs font-sans">{ctrl.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── DEPLOY BUTTON ── */}
            <div className="flex items-center gap-4">
              {m.playable ? (
                <div className="flex-1">
                  {!launching ? (
                    <button
                      onClick={launchMission}
                      className="w-full py-4 text-base font-black tracking-[0.3em] uppercase transition-all duration-300 rounded-lg relative overflow-hidden group"
                      style={{
                        backgroundColor: `${m.themeColor}20`,
                        border: `2px solid ${m.themeColor}`,
                        color: m.themeColor,
                        boxShadow: `0 0 25px ${m.themeColor}25`,
                      }}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: `${m.themeColor}15` }} />
                      <span className="relative z-10">▶ DEPLOY OPERATIVE — {m.name}</span>
                    </button>
                  ) : (
                    <div
                      className="w-full py-4 rounded-lg border-2 relative overflow-hidden"
                      style={{ borderColor: m.themeColor }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 transition-all duration-150"
                        style={{ width: `${launchProgress}%`, backgroundColor: `${m.themeColor}30` }}
                      />
                      <div className="relative z-10 text-center text-[11px] font-black tracking-widest uppercase" style={{ color: m.themeColor }}>
                        DEPLOYING OPERATIVE... {Math.floor(launchProgress)}%
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="flex-1 py-4 rounded-lg border-2 border-dashed text-center text-[11px] font-black tracking-widest uppercase text-slate-600"
                  style={{ borderColor: '#1e293b' }}
                >
                  ⧖ SECTOR CLASSIFIED — {m.season} DEPLOYMENT PENDING
                </div>
              )}

              {m.playable ? (
                <Link
                  href={getPlayUrl('rogue-ghost', selectedMission.id)}
                  className="px-5 py-4 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-all hover:border-slate-600 hover:text-slate-300 border-slate-800 text-slate-400 whitespace-nowrap"
                >
                  QUICK LAUNCH →
                </Link>
              ) : (
                <button
                  disabled
                  className="px-5 py-4 rounded-lg border text-[9px] font-bold uppercase tracking-wider border-slate-900 text-slate-700 cursor-not-allowed whitespace-nowrap"
                >
                  LOCKED
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
