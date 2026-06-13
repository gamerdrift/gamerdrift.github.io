"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../lib/state/UserContext';
import { useChat } from '../../lib/state/ChatContext';
import { isFirebaseMock } from '../../lib/firebase';

export default function ChatHubPage() {
  const { user, login, register, logout } = useUser();
  const { 
    activeRoom, 
    messages, 
    roomUsers, 
    activePmRecipient, 
    pmMessages, 
    joinRoom, 
    sendMessage, 
    sendPrivateMessage, 
    setActivePmRecipient 
  } = useChat();

  // local states
  const [chatUsername, setChatUsername] = useState('');
  const [chatPassword, setChatPassword] = useState('');
  const [chatEmail, setChatEmail] = useState('');
  const [chatAuthMode, setChatAuthMode] = useState<'login' | 'register'>('login');
  const [chatAuthError, setChatAuthError] = useState('');
  const [chatAuthSuccess, setChatAuthSuccess] = useState('');
  const [chatMessageText, setChatMessageText] = useState('');
  const [chatPmText, setChatPmText] = useState('');
  const [regionInput, setRegionInput] = useState('');
  const [sysTime, setSysTime] = useState('');

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Set document title dynamically
  useEffect(() => {
    document.title = "GamerDrift | Live Chat-Hub";
    
    // Update system clock
    const updateTime = () => {
      const d = new Date();
      setSysTime(d.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat window to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, pmMessages, activePmRecipient, user]);

  // Audio click synthesizer
  const playClickSound = (freq = 1200, dur = 0.08) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + dur);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {}
  };

  // Switch Room handler (Region jumps)
  const handleRoomJump = (e: React.FormEvent) => {
    e.preventDefault();
    if (regionInput.trim()) {
      playClickSound(1000, 0.1);
      const newRoom = regionInput.trim();
      joinRoom(newRoom);
      setRegionInput('');
    }
  };

  const selectPreseededRoom = (room: string) => {
    playClickSound(950, 0.08);
    joinRoom(room);
  };

  const PRESEEDED_ROOMS = [
    'GLOBAL_HQ',
    'TOKYO_GRID',
    'LONDON_SECTOR',
    'USA_WEST_COAST',
    'BERLIN_GATEWAY',
    'SANDBATH_ARENA'
  ];

  return (
    <div className="w-full h-screen bg-[#03060a] text-slate-300 font-mono text-[9px] flex flex-col relative select-text overflow-hidden">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none z-0" />
      <div className="absolute inset-0 screen-scanlines pointer-events-none z-10 opacity-20" />
      <div className="absolute inset-0 pointer-events-none z-10" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.95)' }} />

      {/* CHATHUB HEADER */}
      <header className="p-3 bg-black/80 border-b border-[#00f0ff]/20 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border border-[#00f0ff] flex items-center justify-center bg-black/60 relative">
            <svg className="w-3.5 h-3.5 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <title>GamerDrift | Live Chat-Hub</title>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[10px] tracking-widest uppercase flex items-center space-x-0.5"><span className="text-[#39ff14]">G</span><span className="text-[#39ff14]">A</span><span className="text-[#39ff14]">M</span><span className="text-[#00f0ff]">E</span><span className="text-[#00f0ff]">R</span><span className="text-[#00f0ff]">D</span><span className="text-[#00f0ff]">R</span><span className="text-[#00f0ff]">I</span><span className="text-[#00f0ff]">F</span><span className="text-[#ff0099]">T</span><span className="text-[#ff0099]">|</span><span className="text-[#ff3333]">LIVE</span><span className="text-[#ff0099]">|</span><span className="text-[#39ff14]">CHAT</span><span className="text-[#ff9f00]">-HUB</span></span>
            <span className="text-[7px] text-[#ff9f00] uppercase tracking-wider">DRIFT_LINK: ONLINE // SECURE PORTAL</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[7.5px] bg-[#39ff14]/15 border border-[#39ff14]/30 text-[#39ff14] px-1.5 py-0.5 uppercase tracking-widest rounded">
            {isFirebaseMock ? 'SANDBOX DECK' : 'FIREBASE UPLINK'}
          </div>
          <div className="text-slate-500 hidden sm:block text-[8px] bg-black/40 border border-slate-900 px-2 py-0.5">
            SYS_TIME: <span className="text-white font-bold">{sysTime || "SYNCHRONIZING..."}</span>
          </div>
          {user && (
            <button 
              onClick={() => {
                playClickSound(500, 0.12);
                logout();
              }}
              className="px-2 py-0.5 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-white font-bold uppercase tracking-wider text-[7.5px] transition-colors"
            >
              DISCONNECT
            </button>
          )}
        </div>
      </header>

      {/* CORE DISPLAY WINDOW */}
      <div className="flex-grow flex relative overflow-hidden z-10">
        {!user ? (
          /* --- LOGIN / REGISTER PAGE --- */
          <div className="w-full h-full flex items-center justify-center p-4 bg-black/40 relative z-20">
            <div className="w-full max-w-sm border border-slate-900 bg-[#06090e]/95 p-6 relative">
              <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#00f0ff]" />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#ff9f00]" />
              
              <div className="text-center mb-4 border-b border-slate-900 pb-3">
                <span className="text-[9px] text-[#ff9f00] tracking-widest font-extrabold uppercase block">IDENTITY DECK VALIDATION</span>
                <p className="text-[7.5px] text-slate-500 mt-1 uppercase">ESTABLISH COGNITIVE LINK TO COMMENCE GLOBAL CHATHUB BROADCASTS</p>
              </div>

              {/* Login / Register Toggle Tabs */}
              <div className="grid grid-cols-2 border border-slate-900 p-0.5 bg-black/40 mb-4">
                <button
                  onClick={() => { playClickSound(800, 0.05); setChatAuthMode('login'); setChatAuthError(''); }}
                  className={`py-1.5 text-[8.5px] font-bold transition-colors ${chatAuthMode === 'login' ? 'bg-[#00f0ff]/10 text-[#00f0ff]' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  [ SIGN IN ]
                </button>
                <button
                  onClick={() => { playClickSound(800, 0.05); setChatAuthMode('register'); setChatAuthError(''); }}
                  className={`py-1.5 text-[8.5px] font-bold transition-colors ${chatAuthMode === 'register' ? 'bg-[#ff9f00]/10 text-[#ff9f00]' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  [ SIGN UP ]
                </button>
              </div>

              {/* Warnings / Errors */}
              {chatAuthError && (
                <div className="p-2 mb-4 bg-red-950/20 border border-red-500/40 text-[7.5px] text-red-400 text-center uppercase tracking-wider font-bold">
                  ▲ {chatAuthError}
                </div>
              )}
              {chatAuthSuccess && (
                <div className="p-2 mb-4 bg-[#39ff14]/10 border border-[#39ff14]/30 text-[7.5px] text-[#39ff14] text-center uppercase animate-pulse font-bold">
                  ✓ {chatAuthSuccess}
                </div>
              )}

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setChatAuthError('');
                  setChatAuthSuccess('');
                  playClickSound(1000, 0.08);
                  if (chatAuthMode === 'login') {
                    const success = await login(chatUsername, chatPassword);
                    if (success) {
                      setChatAuthSuccess('SECURE UPLINK MATCHED.');
                    } else {
                      setChatAuthError('AUTH FAILED: TAG NOT FOUND OR CODE MISMATCH.');
                    }
                  } else {
                    const success = await register(chatUsername, chatPassword, chatEmail, 'Drifter');
                    if (success) {
                      setChatAuthSuccess('IDENTIFIER CREATED.');
                    } else {
                      setChatAuthError('DUPLICATE TAG OR INTEGRITY TIMEOUT.');
                    }
                  }
                }}
                className="space-y-3"
              >
                {chatAuthMode === 'register' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500 uppercase text-[7px] tracking-wider">TELEMETRY EMAIL:</span>
                    <input
                      type="email"
                      required
                      value={chatEmail}
                      onChange={(e) => setChatEmail(e.target.value)}
                      placeholder="mail@domain.com"
                      className="bg-slate-950 border border-slate-900 px-2.5 py-1.5 text-white focus:outline-none focus:border-[#ff9f00] text-[8.5px] transition-colors"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 uppercase text-[7px] tracking-wider">DRIFTER ID TAG:</span>
                  <input
                    type="text"
                    required
                    value={chatUsername}
                    onChange={(e) => setChatUsername(e.target.value)}
                    placeholder="e.g. Hex_Netrunner"
                    className="bg-slate-950 border border-slate-900 px-2.5 py-1.5 text-white focus:outline-none focus:border-[#00f0ff] text-[8.5px] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 uppercase text-[7px] tracking-wider">PASSCODE SECURITY:</span>
                  <input
                    type="password"
                    required
                    value={chatPassword}
                    onChange={(e) => setChatPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-950 border border-slate-900 px-2.5 py-1.5 text-white focus:outline-none focus:border-[#00f0ff] text-[8.5px] transition-colors"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-2 text-black font-extrabold uppercase text-[8px] tracking-widest hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                  style={{ backgroundColor: chatAuthMode === 'login' ? '#00f0ff' : '#ff9f00' }}
                >
                  {chatAuthMode === 'login' ? 'INITIALIZE CONNECTION' : 'ESTABLISH COGNITIVE LINK'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* --- AUTHENTICATED PANEL LAYOUT --- */
          <div className="w-full h-full flex flex-col md:flex-row overflow-hidden relative">
            
            {/* LEFT PANELS: ROOMS & REGION SEARCH (Yahoo Messenger Style) */}
            <div className="w-full md:w-[150px] bg-black/60 border-b md:border-b-0 md:border-r border-slate-900 flex flex-col shrink-0">
              
              {/* Region Locator & jumps */}
              <div className="p-3 border-b border-slate-900 flex flex-col gap-2">
                <span className="text-[7.5px] text-[#ff9f00] uppercase font-bold tracking-wider">🌐 REGION LOCATOR</span>
                <form onSubmit={handleRoomJump} className="flex gap-1">
                  <input
                    type="text"
                    required
                    value={regionInput}
                    onChange={(e) => setRegionInput(e.target.value)}
                    placeholder="CITY OR STATE..."
                    className="flex-grow bg-slate-950 border border-slate-800 px-1.5 py-1 text-white placeholder-slate-700 text-[8px] focus:outline-none focus:border-[#ff9f00]"
                  />
                  <button 
                    type="submit"
                    className="px-2 bg-[#ff9f00]/10 border border-[#ff9f00] text-[#ff9f00] hover:bg-[#ff9f00]/25 text-[7px] uppercase font-bold"
                  >
                    JUMP
                  </button>
                </form>
              </div>

              {/* Preseeded list */}
              <div className="flex-grow overflow-y-auto p-2 flex flex-col gap-1.5">
                <span className="text-[7.5px] text-slate-500 uppercase font-black tracking-wider px-1 mb-1">CHATHUB STATIONS</span>
                {PRESEEDED_ROOMS.map(rm => (
                  <button
                    key={rm}
                    onClick={() => selectPreseededRoom(rm)}
                    className={`text-left px-2 py-1.5 border text-[7.5px] font-bold uppercase transition-all truncate ${
                      activeRoom === rm 
                        ? 'border-[#00f0ff]/50 bg-[#00f0ff]/10 text-[#00f0ff] font-extrabold shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                        : 'border-slate-950 bg-black/30 text-slate-400 hover:text-white hover:bg-slate-900/25'
                    }`}
                  >
                    📡 {rm.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {/* Status details card */}
              <div className="p-2.5 bg-[#ff9f00]/5 border-t border-slate-900 text-slate-400 text-[7.5px] space-y-1">
                <div>DRIFTER: <span className="font-bold text-white">{user.username.toUpperCase()}</span></div>
                <div>RANK: <span className="font-bold text-[#ff9f00]">L{user.level} // RECRUIT</span></div>
                <div>SEC_KEY: <span className="font-mono text-slate-500">AES-255-GCM</span></div>
              </div>
            </div>

            {/* CENTER PANEL: MESSAGE STREAMS */}
            <div className="flex-grow flex flex-col overflow-hidden min-h-[300px] bg-black/10">
              
              {/* Active Header for chat channel */}
              <div className="px-3 py-2 bg-black/60 border-b border-slate-900 flex justify-between items-center text-[8px] text-slate-400 shrink-0">
                {activePmRecipient ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#ff9f00] tracking-wide">🔒 PRIVATE SECURE LINK: {activePmRecipient.toUpperCase()}</span>
                    <span className="text-[7px] text-slate-600 font-normal">COMM-DECK ENCRYPTED</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white tracking-wide">📡 BROADCAST STATION: {activeRoom.replace(/_/g, ' ')}</span>
                    <span className="text-[7.5px] text-[#39ff14] bg-[#39ff14]/10 border border-[#39ff14]/30 px-1 py-0.5 rounded font-black tracking-wider animate-pulse">LIVE FEED</span>
                  </div>
                )}

                {activePmRecipient && (
                  <button 
                    onClick={() => {
                      playClickSound(600, 0.08);
                      setActivePmRecipient(null);
                    }}
                    className="text-[7.5px] text-[#00f0ff] hover:underline font-bold uppercase"
                  >
                    &lt;&lt; BACK TO STATION
                  </button>
                )}
              </div>

              {/* Message scroll viewport */}
              <div 
                ref={chatScrollRef}
                className="flex-grow overflow-y-auto p-3.5 space-y-3 select-text scrollbar-thin scrollbar-thumb-slate-900"
              >
                {(!activePmRecipient ? messages : pmMessages).map((msg) => {
                  const isSys = msg.sender === 'SYS_LINK';
                  const isSelf = msg.sender.toLowerCase() === user.username.toLowerCase();
                  
                  return (
                    <div key={msg.id} className="flex flex-col leading-relaxed animate-[fadeIn_0.15s_ease-out]">
                      <div className="flex justify-between items-baseline text-[7.5px] text-slate-600 mb-0.5 font-mono">
                        <span className={`font-extrabold uppercase tracking-wide ${
                          isSys 
                            ? 'text-red-400' 
                            : isSelf 
                            ? 'text-[#39ff14]' 
                            : 'text-[#00f0ff]'
                        }`}>
                          {isSys ? '⚡ ' : ''}{msg.sender}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className={`text-[8.5px] font-sans tracking-wide leading-relaxed uppercase ${
                        isSys 
                          ? 'text-slate-500 font-bold bg-[#ff3333]/5 border border-[#ff3333]/15 px-2 py-1.5 rounded' 
                          : 'text-slate-200'
                      }`}>
                        {msg.text}
                      </p>
                    </div>
                  );
                })}

                {(!activePmRecipient ? messages : pmMessages).length === 0 && (
                  <div className="text-center py-20 text-slate-700 uppercase tracking-widest text-[8px]">
                    -- NO GRID SIGNALS DETECTED IN THIS REGION --
                  </div>
                )}
              </div>

              {/* MESSAGE BROADCAST FORM */}
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  playClickSound(500, 0.05);
                  if (!activePmRecipient) {
                    if (!chatMessageText.trim()) return;
                    await sendMessage(chatMessageText);
                    setChatMessageText('');
                  } else {
                    if (!chatPmText.trim()) return;
                    await sendPrivateMessage(activePmRecipient, chatPmText);
                    setChatPmText('');
                  }
                }}
                className="p-2.5 border-t border-slate-900 bg-black/70 flex gap-2 shrink-0"
              >
                <input
                  type="text"
                  required
                  value={!activePmRecipient ? chatMessageText : chatPmText}
                  onChange={(e) => {
                    if (!activePmRecipient) setChatMessageText(e.target.value);
                    else setChatPmText(e.target.value);
                  }}
                  placeholder={!activePmRecipient ? `BROADCAST TRANSMISSION TO ${activeRoom.replace(/_/g, ' ')}...` : `SECURE PRIVATE MESSAGE TO ${activePmRecipient.toUpperCase()}...`}
                  className="flex-grow bg-slate-950 border border-slate-800 px-3 py-2 text-white placeholder-slate-700 focus:outline-none focus:border-[#00f0ff] text-[8.5px] font-mono transition-colors"
                />
                <button 
                  type="submit" 
                  className="px-4 bg-black hover:bg-slate-950 border text-[8.5px] uppercase font-black transition-colors"
                  style={{ borderColor: '#00f0ff', color: '#00f0ff' }}
                >
                  SEND
                </button>
              </form>
            </div>

            {/* RIGHT PANEL: REGION MEMBERS LIST (Yahoo Messenger Style) */}
            {!activePmRecipient && (
              <div className="w-full md:w-[160px] bg-black/60 border-t md:border-t-0 md:border-l border-slate-900 flex flex-col shrink-0 overflow-hidden">
                <div className="px-2.5 py-1.5 bg-slate-950 border-b border-slate-900 flex justify-between text-[7px] text-slate-500 uppercase tracking-widest font-extrabold shrink-0">
                  <span>ROOM MEMBERS ({roomUsers.length})</span>
                  <span>CLICK TO DM</span>
                </div>
                <div className="flex-grow overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-900">
                  {roomUsers.map((rUser) => {
                    const isMe = rUser.username.toLowerCase() === user.username.toLowerCase();
                    return (
                      <div 
                        key={rUser.username}
                        onClick={() => {
                          if (isMe) return;
                          playClickSound(950, 0.06);
                          setActivePmRecipient(rUser.username);
                        }}
                        className={`flex justify-between items-center p-1.5 border rounded text-[7.5px] transition-all ${
                          isMe 
                            ? 'bg-[#39ff14]/5 border-[#39ff14]/20 cursor-default' 
                            : 'bg-black/40 border-slate-900 hover:border-[#00f0ff]/50 hover:bg-slate-950 cursor-pointer shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${rUser.status === 'online' ? 'bg-[#39ff14] animate-pulse' : 'bg-slate-700'}`} />
                          <div className="flex flex-col truncate">
                            <span className="font-extrabold text-white uppercase truncate">{rUser.username}</span>
                            <span className="text-[6.5px] text-slate-500 uppercase truncate">
                              LVL {rUser.level} {rUser.playing !== 'None' ? `// ${rUser.playing}` : ''}
                            </span>
                          </div>
                        </div>
                        <span className="text-[6.5px] text-slate-600 font-extrabold uppercase shrink-0">{rUser.role}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
