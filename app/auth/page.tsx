"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../../lib/state/UserContext';

function AuthTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') === 'register' ? 'register' : 'login';

  const { user, login, register } = useUser();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Drifter' | 'Creator' | 'Admin'>('Drifter');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already logged in, redirect
  if (user) {
    return (
      <div className="w-full min-h-[80vh] py-16 px-4 md:px-8 bg-black flex flex-col items-center justify-center font-mono text-xs">
        <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
        <div className="w-full max-w-md hud-panel p-8 text-center bg-[#0c0f16] border-[#00f0ff]/30 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative z-10">
          <div className="w-16 h-16 rounded-full border border-[#39ff14] bg-black mx-auto flex items-center justify-center text-xl text-[#39ff14] animate-pulse">
            ✓
          </div>
          <h2 className="text-lg font-bold text-white mt-6 mb-2 uppercase tracking-widest font-mono">
            SECURE LINK ESTABLISHED
          </h2>
          <p className="text-[10px] text-[#00f0ff] tracking-widest mb-6 uppercase">
            LINKED_TAG: {user.username} // ROLE: {user.role}
          </p>
          <button 
            onClick={() => router.push('/profile')}
            className="w-full py-3 bg-[#00f0ff]/10 border border-[#00f0ff] hover:bg-[#00f0ff]/20 text-[#00f0ff] font-bold tracking-widest uppercase transition-all"
          >
            ENTER THE COMMAND DECK
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
      setErrorMsg('INTEGRITY ERROR: INPUT VALID DRIFTER IDENTIFIER.');
      return;
    }

    if (activeTab === 'login') {
      const success = login(trimmed);
      if (success) {
        setSuccessMsg('SESSION SECURED. COGNITIVE SYNAPSE ALIGNING...');
        setTimeout(() => router.push('/profile'), 1000);
      } else {
        setErrorMsg('SECURE FAIL: DRIFTER IDENTIFIER NOT REGISTERED IN REGISTRY.');
      }
    } else {
      const success = register(trimmed, role);
      if (success) {
        setSuccessMsg('DRIFTER REGISTERED. INITIALIZING DATA SHEETS...');
        setTimeout(() => router.push('/profile'), 1000);
      } else {
        setErrorMsg('INTEGRITY ERROR: IDENTIFIER ALREADY ASSIGNED TO ANOTHER AGENT.');
      }
    }
  };

  const handleSocialMockLogin = (platform: string) => {
    setSuccessMsg(`CONNECTED VIA ${platform.toUpperCase()}. SYNCHRONIZING SECURE KEY...`);
    // Seed username based on platform
    const mockUser = `Drifter_${platform}_${Math.floor(Math.random() * 900 + 100)}`;
    setTimeout(() => {
      register(mockUser, 'Drifter');
      router.push('/profile');
    }, 1200);
  };

  return (
    <div className="w-full min-h-[85vh] py-16 px-4 md:px-8 bg-black flex flex-col items-center justify-center font-mono text-xs">
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-[#0c0f16] hud-panel p-6 md:p-8 relative z-10">
        
        {/* Glowing border decorations */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00f0ff]/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#ff9f00]/5 rounded-full blur-xl pointer-events-none"></div>

        {/* Header Message */}
        <div className="text-center mb-6">
          <span className="text-[9px] text-[#ff9f00] tracking-[0.35em] block mb-1">SECURE NETWORK INTAKE</span>
          <h1 className="text-xl font-black text-white tracking-widest uppercase mb-3">COMMAND_GATEWAY</h1>
          <p className="text-[10px] text-slate-500 leading-relaxed uppercase border border-slate-900 bg-black/40 p-3.5">
            "Welcome to GamerDrift Command. Access your profile, join elite players worldwide, and unlock premium gaming experiences."
          </p>
        </div>

        {/* Selector Tabs */}
        <div className="grid grid-cols-2 border border-slate-900 p-1 mb-5 bg-black/40">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`py-2 text-[10px] font-bold transition-all ${
              activeTab === 'login' 
                ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff]' 
                : 'text-slate-500 hover:text-white'
            }`}
          >
            [ SIGN IN ]
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`py-2 text-[10px] font-bold transition-all ${
              activeTab === 'register' 
                ? 'bg-[#ff9f00]/10 border border-[#ff9f00]/30 text-[#ff9f00]' 
                : 'text-slate-500 hover:text-white'
            }`}
          >
            [ SIGN UP ]
          </button>
        </div>

        {/* Messaging Logs */}
        {errorMsg && (
          <div className="mb-4 p-2 bg-red-950/20 border border-red-500/30 text-[9px] text-red-400 text-center">
            ▲ {errorMsg.toUpperCase()}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-2 bg-[#39ff14]/10 border border-[#39ff14]/30 text-[9px] text-[#39ff14] text-center animate-pulse">
            ⚡ {successMsg.toUpperCase()}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Email Input for verification setups */}
          {activeTab === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="text-[#ff9f00] font-bold uppercase tracking-wider text-[9px]">SECURE EMAIL ADDRESS *</label>
              <input
                type="email"
                placeholder="INPUT DIRECT TELEMETRY MAIL..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/60 border border-slate-800 px-3 py-2 text-white placeholder-slate-700 focus:outline-none focus:border-[#ff9f00]"
                required
              />
              <span className="text-[8px] text-slate-500 uppercase mt-0.5">// VERIFICATION LINK WILL BE DISPATCHED</span>
            </div>
          )}

          {/* Username Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[#00f0ff] font-bold uppercase tracking-wider text-[9px]">DRIFTER ID TAG *</label>
            <input
              type="text"
              placeholder="e.g. Hex_Netrunner"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-black/60 border border-slate-800 px-3 py-2 text-white placeholder-slate-700 focus:outline-none focus:border-[#00f0ff]"
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[#00f0ff] font-bold uppercase tracking-wider text-[9px]">PASSCODE SECURITY *</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/60 border border-slate-800 px-3 py-2 text-white placeholder-slate-700 focus:outline-none focus:border-[#00f0ff]"
              required
            />
            {activeTab === 'login' && (
              <button 
                type="button"
                onClick={() => setSuccessMsg('RECOVERY: PASSWORD VERIFICATION TOKENS SENT TO REGISTERED MAIL.')}
                className="text-[8px] text-slate-500 hover:text-white mt-1 text-left uppercase underline"
              >
                Forgot Security Password? Recovery Terminal
              </button>
            )}
          </div>

          {/* Registration developer/admin select */}
          {activeTab === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="text-[#ff9f00] font-bold uppercase tracking-wider text-[9px]">ASSIGN_SECTOR_ROLE *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="bg-black/60 border border-slate-800 px-2 py-2 text-white focus:outline-none focus:border-[#ff9f00]"
              >
                <option value="Drifter">DRIFTER (COMPETITIVE PLAYER)</option>
                <option value="Creator">CREATOR (STUDIO DEVELOPER)</option>
                <option value="Admin">ADMINISTRATOR (COMMAND SYSOP)</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3.5 uppercase tracking-widest text-[10px] font-bold mt-2 hover:scale-[1.01] transition-all text-black ${
              activeTab === 'login' 
                ? 'bg-[#00f0ff] hover:bg-[#00f0ff]/80 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                : 'bg-[#ff9f00] hover:bg-[#ff9f00]/80 shadow-[0_0_10px_rgba(255,159,0,0.2)]'
            }`}
          >
            {activeTab === 'login' ? 'INITIALIZE CONNECTION' : 'ESTABLISH COGNITIVE LINK'}
          </button>

          {/* Social Logins */}
          <div className="border-t border-slate-900 pt-4 mt-2">
            <span className="text-[8px] text-slate-500 block mb-2.5 text-center uppercase tracking-wider">COGNITIVE SOCIAL INTEL SHIELDS</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSocialMockLogin('Steam')}
                className="px-2 py-2 bg-black/40 border border-slate-800 hover:border-[#00f0ff] text-[9px] uppercase font-bold text-center truncate flex items-center justify-center gap-1 hover:text-white"
              >
                🎮 STEAM
              </button>
              <button
                type="button"
                onClick={() => handleSocialMockLogin('Discord')}
                className="px-2 py-2 bg-black/40 border border-slate-800 hover:border-[#00f0ff] text-[9px] uppercase font-bold text-center truncate flex items-center justify-center gap-1 hover:text-white"
              >
                👾 DISCORD
              </button>
              <button
                type="button"
                onClick={() => handleSocialMockLogin('Google')}
                className="px-2 py-2 bg-black/40 border border-slate-800 hover:border-[#00f0ff] text-[9px] uppercase font-bold text-center truncate flex items-center justify-center gap-1 hover:text-white"
              >
                🌐 GOOGLE
              </button>
            </div>
          </div>

          {/* Seeded logins helper */}
          <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-[8px] text-slate-600">
            <span>SECURE INTAKE GATE: GD-ALPHA-9</span>
            <button 
              type="button" 
              onClick={() => {
                setUsername('AdminDrifter');
                setActiveTab('login');
              }}
              className="hover:text-white underline uppercase"
            >
              Quick Test Admin Node
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-[85vh] py-16 px-4 md:px-8 bg-black flex flex-col items-center justify-center font-mono text-xs text-[#00f0ff] animate-pulse">
        [SYS] SECURING COGNITIVE SHIELDS TUNNEL...
      </div>
    }>
      <AuthTerminal />
    </Suspense>
  );
}
