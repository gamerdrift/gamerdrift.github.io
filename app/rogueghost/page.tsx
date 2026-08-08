"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '../../lib/state/UserContext';
import { getPlayUrl } from '../../lib/routes';
import { MISSIONS_DATA, MissionData } from '../../data/missions';
import CampaignProgress from '../../components/rogueghost/CampaignProgress';
import MissionHero from '../../components/rogueghost/MissionHero';
import MissionSelectorCard from '../../components/rogueghost/MissionSelectorCard';
import OperativePanel from '../../components/rogueghost/OperativePanel';
import LoadoutPanel from '../../components/rogueghost/LoadoutPanel';
import ObjectiveList from '../../components/rogueghost/ObjectiveList';
import IntelPanel from '../../components/rogueghost/IntelPanel';

export default function RogueGhostCommandCenter() {
  const { user, gainXP } = useUser();
  const [selectedMission, setSelectedMission] = useState<MissionData>(MISSIONS_DATA[0]);
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);

  const playBeep = (freq = 600, dur = 0.08) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {}
  };

  const handleSelectMission = (m: MissionData) => {
    playBeep(800, 0.05);
    setSelectedMission(m);
    setLaunching(false);
    setLaunchProgress(0);
  };

  const handleDeploy = () => {
    if (!selectedMission.playable) return;
    playBeep(400, 0.25);
    setLaunching(true);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20 + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        if (user) gainXP(50);
        window.location.href = getPlayUrl('rogue-ghost', selectedMission.id);
      }
      setLaunchProgress(Math.min(100, p));
    }, 100);
  };

  const handleOpenBriefing = () => {
    playBeep(1000, 0.08);
    setBriefingModalOpen(true);
  };

  const m = selectedMission;

  return (
    <div className="w-full min-h-screen bg-[#05070a] relative font-mono text-xs text-slate-300 overflow-x-hidden pb-16">
      {/* Dynamic Background Overlays */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none" />
      <div className="scanlines pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10 space-y-8">

        {/* ── COMMAND CENTER TOP HUD HEADER ── */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between border-b pb-5 transition-colors duration-300 gap-4"
          style={{ borderColor: `${m.themeColor}30` }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-[9px] font-black px-2 py-0.5 uppercase tracking-widest rounded border"
                style={{
                  color: m.themeColor,
                  borderColor: `${m.themeColor}40`,
                  backgroundColor: `${m.themeColor}10`,
                }}
              >
                ROGUE GHOST // COMMAND CENTER
              </span>
              <span className="text-slate-600 text-[9px] font-bold">
                // SYSTEM_STATUS: ONLINE
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-[0.15em] uppercase leading-none font-sans">
              ROGUE_<span style={{ color: m.themeColor }}>GHOST</span> TACTICAL HQ
            </h1>
            <p className="text-slate-500 text-[9px] tracking-widest uppercase mt-1">
              GLOBAL STEALTH OPERATIONS • MISSION CONTROL • OPERATIVE TELEMETRY
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-[9px] uppercase hidden sm:block">
              <div className="text-slate-500 font-bold">
                OPERATIVE: <span className="text-white font-black">{user ? user.username.toUpperCase() : 'AGENT_GHOST'}</span>
              </div>
              <div className="text-slate-500 font-bold">
                CLEARANCE: <span style={{ color: m.themeColor }} className="font-extrabold">LEVEL 5 TOP SECRET</span>
              </div>
            </div>

            <Link
              href="/"
              className="px-4 py-2.5 rounded-lg border text-[10px] font-black uppercase tracking-widest border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all bg-[#0c0f16]"
            >
              [ RETURN TO BASE ]
            </Link>
          </div>
        </div>

        {/* ── CAMPAIGN PROGRESS TRACKER ── */}
        <CampaignProgress
          missions={MISSIONS_DATA}
          selectedMissionId={m.id}
          onSelectMission={handleSelectMission}
        />

        {/* ── FEATURED MISSION HERO (DOMINANT SNOWBLOW AREA) ── */}
        <MissionHero
          mission={m}
          onDeploy={handleDeploy}
          onOpenBriefing={handleOpenBriefing}
          launching={launching}
          launchProgress={launchProgress}
        />

        {/* ── MAIN WORKSPACE GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT / CENTRAL SECTOR (8 COLS): MISSION SELECTOR & OBJECTIVES */}
          <div className="lg:col-span-8 space-y-8">

            {/* SECTOR CARDS SELECTION GRID */}
            <div>
              <div className="flex justify-between items-center border-b border-slate-900 pb-2.5 mb-4">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                  // DEPLOYMENT_SECTORS
                </h3>
                <span className="text-[9px] text-slate-500 font-bold uppercase">
                  SELECT SECTOR TO INSPECT INTEL
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MISSIONS_DATA.map((mission) => (
                  <MissionSelectorCard
                    key={mission.id}
                    mission={mission}
                    isSelected={m.id === mission.id}
                    onSelect={handleSelectMission}
                  />
                ))}
              </div>
            </div>

            {/* MISSION OBJECTIVES LIST */}
            <ObjectiveList mission={m} />

            {/* FIELD INTEL & CONTROLS PANEL */}
            <IntelPanel mission={m} />
          </div>

          {/* RIGHT SIDEBAR (4 COLS): OPERATIVE DOSSIER & LOADOUT */}
          <div className="lg:col-span-4 space-y-8">
            <OperativePanel />
            <LoadoutPanel mission={m} />
          </div>
        </div>

      </div>

      {/* ── MISSION BRIEFING MODAL ── */}
      {briefingModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl bg-[#0c0f16] border-2 rounded-xl p-6 relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            style={{ borderColor: m.themeColor }}
          >
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span
                  className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border"
                  style={{
                    color: m.themeColor,
                    borderColor: `${m.themeColor}40`,
                    backgroundColor: `${m.themeColor}10`,
                  }}
                >
                  CLASSIFIED BRIEFING // {m.code}
                </span>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-1">
                  {m.name} — {m.operation}
                </h2>
                <div className="text-xs text-slate-400 font-sans uppercase">
                  {m.subtitle}
                </div>
              </div>
              <button
                onClick={() => setBriefingModalOpen(false)}
                className="w-8 h-8 rounded border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 flex items-center justify-center font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  TACTICAL BRIEFING OVERVIEW
                </span>
                <p className="text-slate-300 text-xs leading-relaxed font-sans uppercase bg-black/40 border border-slate-900 p-4 rounded-lg">
                  {m.narrativeBriefing}
                </p>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  ENVIRONMENT CONDITIONS
                </span>
                <div className="text-xs text-white font-bold bg-black/40 border border-slate-900 p-3 rounded-lg">
                  {m.environment}
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  RECOMMENDED LOADOUT
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/40 border border-slate-900 p-2.5 rounded text-slate-300">
                    <strong className="text-slate-500 block text-[8px] uppercase">PRIMARY</strong>
                    {m.recommendedLoadout.primary}
                  </div>
                  <div className="bg-black/40 border border-slate-900 p-2.5 rounded text-slate-300">
                    <strong className="text-slate-500 block text-[8px] uppercase">SECONDARY</strong>
                    {m.recommendedLoadout.secondary}
                  </div>
                  <div className="bg-black/40 border border-slate-900 p-2.5 rounded text-slate-300">
                    <strong className="text-slate-500 block text-[8px] uppercase">TACTICAL</strong>
                    {m.recommendedLoadout.tactical}
                  </div>
                  <div className="bg-black/40 border border-slate-900 p-2.5 rounded text-slate-300">
                    <strong className="text-slate-500 block text-[8px] uppercase">EQUIPMENT</strong>
                    {m.recommendedLoadout.equipment}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
              <button
                onClick={() => setBriefingModalOpen(false)}
                className="px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider border border-slate-800 text-slate-400 hover:text-white"
              >
                CLOSE
              </button>

              {m.playable && (
                <button
                  onClick={() => {
                    setBriefingModalOpen(false);
                    handleDeploy();
                  }}
                  className="px-6 py-2.5 rounded text-xs font-black uppercase tracking-widest shadow-lg"
                  style={{
                    backgroundColor: m.themeColor,
                    color: '#000000',
                  }}
                >
                  ▶ DEPLOY NOW
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
