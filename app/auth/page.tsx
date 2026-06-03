"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../lib/state/UserContext';

export default function AuthPage() {
  const router = useRouter();
  const { user, login, register } = useUser();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'Drifter' | 'Creator' | 'Admin'>('Drifter');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already logged in, redirect or display status
  if (user) {
    return (
      <div className="w-full min-h-[80vh] py-16 px-4 md:px-8 bg-cyber-grid flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-[#130722]/80 border border-neon-blue/40 rounded-2xl p-8 text-center backdrop-blur-lg shadow-[0_0_30px_rgba(0,240,255,0.15)]">
          <div className="w-20 h-20 rounded-full border-2 border-neon-blue bg-black mx-auto flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-bounce">
            🟢
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-widest mt-6 mb-2 uppercase neon-text">
            UPLINK ACTIVE
          </h2>
          <p className="text-xs font-mono text-[#00f0ff] tracking-widest mb-6">
            CONNECTED AS {user.username.toUpperCase()}
          </p>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            You are already connected to the GamerDrift gaming deck. Access your personal dashboard.
          </p>
          <button 
            onClick={() => router.push('/profile/')}
            className="w-full py-3 rounded-lg font-bold text-sm text-center text-white bg-gradient-to-r from-neon-blue to-neon-pink hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300 font-mono tracking-wider"
          >
            ENTER PROFILE DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = username.trim();
    if (!trimmed) {
      setErrorMsg('Please input a valid drifter tag identifier.');
      return;
    }

    if (activeTab === 'login') {
      const success = login(trimmed);
      if (success) {
        setSuccessMsg('Session established successfully! Launching interface...');
        setTimeout(() => router.push('/profile/'), 1000);
      } else {
        setErrorMsg('Drifter node tag not found. Please register.');
      }
    } else {
      const success = register(trimmed, role);
      if (success) {
        setSuccessMsg('Profile created! Initializing cyber uplink...');
        setTimeout(() => router.push('/profile/'), 1000);
      } else {
        setErrorMsg('Tag identifier already active. Pick a unique username.');
      }
    }
  };

  return (
    <div className="w-full min-h-[85vh] py-16 px-4 md:px-8 bg-cyber-grid flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-[#130722]/80 border border-neon-blue/20 rounded-2xl p-6 md:p-8 backdrop-blur-lg shadow-[0_0_30px_rgba(0,240,255,0.1)] relative">
        
        {/* Glowing border accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-[50px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-pink/5 rounded-full blur-[50px] pointer-events-none"></div>

        {/* Header logo title */}
        <div className="text-center mb-8">
          <h2 className="text-xs font-bold tracking-[0.25em] text-neon-pink font-mono uppercase mb-1">
            GAMERDRIFT AUTH PORTAL
          </h2>
          <h1 className="text-2xl font-extrabold text-white tracking-widest uppercase">
            CONNECT IDENTITY
          </h1>
        </div>

        {/* Selector Tabs */}
        <div className="grid grid-cols-2 bg-black/40 border border-white/5 rounded-lg p-1 mb-6 font-mono text-xs">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`py-2 rounded font-bold transition-all ${
              activeTab === 'login' 
                ? 'bg-neon-blue/20 border border-neon-blue/30 text-white shadow-[0_0_8px_rgba(0,240,255,0.25)]' 
                : 'text-text-secondary hover:text-white'
            }`}
          >
            [ LOG_IN ]
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`py-2 rounded font-bold transition-all ${
              activeTab === 'register' 
                ? 'bg-neon-pink/20 border border-neon-pink/30 text-white shadow-[0_0_8px_rgba(255,0,255,0.25)]' 
                : 'text-text-secondary hover:text-white'
            }`}
          >
            [ REGISTER ]
          </button>
        </div>

        {/* Message HUD */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded bg-red-500/10 border border-red-500/40 text-[10px] font-mono text-white text-center">
            ⚠️ {errorMsg.toUpperCase()}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded bg-neon-blue/10 border border-neon-blue/40 text-[10px] font-mono text-white text-center animate-pulse">
            ⚡ {successMsg.toUpperCase()}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-mono text-xs text-white">
          
          {/* Username Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-neon-blue font-bold tracking-wider uppercase">DRIFTER TAG IDENTIFIER *</label>
            <input
              type="text"
              placeholder="e.g. Hex_Netrunner"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-black/60 border border-white/10 rounded px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all duration-300"
              required
            />
          </div>

          {/* Role selection for registration (highly convenient for testing roles!) */}
          {activeTab === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-neon-pink font-bold tracking-wider uppercase">SELECT GATEWAY ROLE *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="bg-black/60 border border-white/10 rounded px-4 py-2.5 text-white focus:outline-none focus:border-neon-pink transition-all duration-300"
              >
                <option value="Drifter">DRIFTER (DEFAULT GAMER)</option>
                <option value="Creator">CREATOR (GAME DEVELOPER)</option>
                <option value="Admin">ADMINISTRATOR (SITE MODERATOR)</option>
              </select>
              <span className="text-[9px] text-gray-500">Pick Admin or Creator to unlock specific dashboard decks instantly!</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-bold text-xs text-center text-white transition-all duration-300 tracking-widest mt-2 hover:scale-[1.02] ${
              activeTab === 'login' 
                ? 'bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                : 'bg-gradient-to-r from-neon-pink to-neon-purple hover:shadow-[0_0_15px_rgba(255,0,255,0.3)]'
            }`}
          >
            {activeTab === 'login' ? 'INITIALIZE CONNECTION' : 'ESTABLISH COGNITIVE LINK'}
          </button>

          {/* Quick seeded profiles */}
          <div className="border-t border-white/5 pt-4 mt-2">
            <span className="text-[9px] text-gray-500 block mb-2 text-center uppercase tracking-wider">Seeded Test Profiles Available</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUsername('AdminDrifter')}
                className="px-2 py-1 bg-black/40 border border-white/5 hover:border-neon-blue text-[9px] rounded text-center truncate"
                title="Root Sysop Admin"
              >
                AdminDrifter
              </button>
              <button
                type="button"
                onClick={() => setUsername('NeoCreator')}
                className="px-2 py-1 bg-black/40 border border-white/5 hover:border-neon-blue text-[9px] rounded text-center truncate"
                title="Developer Creator"
              >
                NeoCreator
              </button>
              <button
                type="button"
                onClick={() => setUsername('Hex_Netrunner')}
                className="px-2 py-1 bg-black/40 border border-white/5 hover:border-neon-blue text-[9px] rounded text-center truncate"
                title="Regular Drifter User"
              >
                Hex_Netrunner
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
