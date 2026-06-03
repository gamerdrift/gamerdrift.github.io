"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '../../lib/state/UserContext';
import { useGames } from '../../lib/state/GameContext';

const PRESET_THUMBNAILS = [
  { id: 'neon-cyber', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&h=500&q=80', label: 'Neon Setup' },
  { id: 'arcade-glow', url: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=400&h=500&q=80', label: 'Arcade Sign' },
  { id: 'synthwave', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&h=500&q=80', label: 'Cyber Grid' },
  { id: 'gamepad', url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=400&h=500&q=80', label: 'Controllers' }
];

export default function CreatorPage() {
  const { user, login } = useUser();
  const { games, submitGame, rejectSubmission } = useGames();

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Arcade' | 'Puzzle' | 'Shooting' | 'Casual' | 'Action' | 'Retro'>('Arcade');
  const [description, setDescription] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [thumbnail, setThumbnail] = useState(PRESET_THUMBNAILS[0].url);
  const [customThumbnail, setCustomThumbnail] = useState('');
  
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle unauthorized users
  const isCreatorOrAdmin = user && (user.role === 'Creator' || user.role === 'Admin');

  if (!isCreatorOrAdmin) {
    return (
      <div className="w-full min-h-[80vh] py-16 px-4 md:px-8 bg-cyber-grid flex flex-col items-center justify-center">
        <div className="w-full max-w-lg bg-[#130722]/80 border border-neon-pink/40 rounded-2xl p-8 text-center backdrop-blur-lg shadow-[0_0_30px_rgba(255,0,255,0.15)] relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-neon-pink bg-black flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,0,255,0.4)]">
            🔒
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-widest mt-6 mb-2 uppercase neon-text">
            CREATOR KEY REQUIRED
          </h2>
          <p className="text-xs font-mono text-[#ff00ff] tracking-widest mb-6">
            UPLINK SYSTEM AUTHORITY FAILED
          </p>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            Uploading games requires Creator or Admin privileges. Log in with a developer profile to access the code compiler deck.
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => login('NeoCreator')}
              className="w-full py-3 rounded-lg font-bold text-xs text-center text-black bg-[#00f0ff] hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all duration-300 tracking-widest font-mono"
            >
              ⚡ QUICK LOGIN: NEOCREATOR (DEVELOPER)
            </button>
            <Link href="/auth/" className="w-full py-3 rounded-lg border border-white/20 font-bold text-xs text-center text-white bg-black/40 hover:bg-black/60 hover:border-white/40 transition-all duration-300 tracking-widest font-mono">
              MANUAL AUTH UPLINK
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter games submitted by the active user
  const mySubmissions = games.filter(g => g.submittedBy === user.username);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitSuccess(false);

    if (!title.trim() || !description.trim() || !embedUrl.trim()) {
      setErrorMsg('Please compile all required tactical node parameters.');
      return;
    }

    // Submit Game
    const gameData = {
      title: title.trim(),
      category,
      description: description.trim(),
      url: `/play/submitted-game-${Date.now()}/`,
      embedUrl: embedUrl.trim(),
      thumbnail: customThumbnail.trim() || thumbnail,
      isExternal: true
    };

    submitGame(gameData, user.username);

    // Reset Form
    setTitle('');
    setDescription('');
    setEmbedUrl('');
    setCustomThumbnail('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-cyber-grid flex flex-col items-center">
      <div className="w-full max-w-6xl">
        
        {/* Header HUD */}
        <div className="mb-8">
          <span className="text-[10px] font-mono text-neon-blue tracking-[0.35em] uppercase font-bold mb-1 block">
            CREATOR DECK // COMPILER INTERFACE
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wider uppercase">
            DEVELOPER CONSOLE
          </h1>
          <p className="text-text-secondary text-xs font-mono mt-1">
            INGEST HTML5 EMBEDDABLE TERMINAL LOGIC DIRECTLY TO THE GAMING SHIELD
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Submission Form */}
          <div className="lg:col-span-1.5 flex flex-col gap-6">
            <div className="bg-[#130722]/60 border border-neon-blue/20 rounded-xl p-6 backdrop-blur-md">
              <h3 className="text-sm font-black text-white font-mono tracking-wider uppercase mb-5 pb-2 border-b border-white/5 flex items-center gap-2">
                <span className="text-neon-blue">■</span> INGEST GAME NODE
              </h3>

              {submitSuccess && (
                <div className="mb-5 p-4 rounded bg-neon-blue/10 border border-neon-blue text-xs font-mono text-white flex items-center gap-2 shadow-[0_0_12px_rgba(0,240,255,0.1)]">
                  ⚡ NODE PACKET SUBMITTED // PENDING MODERATION APPROVAL
                </div>
              )}

              {errorMsg && (
                <div className="mb-5 p-4 rounded bg-neon-pink/10 border border-neon-pink text-xs font-mono text-white flex items-center gap-2">
                  ⚠️ {errorMsg.toUpperCase()}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-mono text-xs text-white">
                
                {/* Game Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-neon-blue font-bold tracking-wider">GAME TITLE *</label>
                  <input
                    type="text"
                    placeholder="e.g. CYBER SHIELDS 2088"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black/60 border border-white/10 rounded px-3.5 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue focus:shadow-[0_0_8px_rgba(0,240,255,0.25)] transition-all duration-300"
                    required
                  />
                </div>

                {/* Category select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-neon-blue font-bold tracking-wider">GRID CATEGORY *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="bg-black/60 border border-white/10 rounded px-3.5 py-2 text-white focus:outline-none focus:border-neon-blue transition-all duration-300"
                  >
                    <option value="Arcade">ARCADE</option>
                    <option value="Puzzle">PUZZLE</option>
                    <option value="Shooting">SHOOTING</option>
                    <option value="Casual">CASUAL</option>
                    <option value="Action">ACTION</option>
                    <option value="Retro">RETRO</option>
                  </select>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-neon-blue font-bold tracking-wider">DESCRIPTION BRIEF *</label>
                  <textarea
                    placeholder="Tactical overview and controls sheet summary..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="bg-black/60 border border-white/10 rounded px-3.5 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue transition-all duration-300"
                    required
                  />
                </div>

                {/* Embed URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-neon-blue font-bold tracking-wider">IFRAME EMBED LINK *</label>
                  <input
                    type="url"
                    placeholder="https://example.com/game/"
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    className="bg-black/60 border border-white/10 rounded px-3.5 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue transition-all duration-300"
                    required
                  />
                  <span className="text-[9px] text-gray-500">Supports standard HTTPS HTML5 game containers.</span>
                </div>

                {/* Thumbnail Art Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-neon-blue font-bold tracking-wider">COVER POSTER ART</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_THUMBNAILS.map(t => (
                      <div 
                        key={t.id}
                        onClick={() => {
                          setThumbnail(t.url);
                          setCustomThumbnail('');
                        }}
                        className={`relative rounded overflow-hidden aspect-video border cursor-pointer hover:border-neon-blue/80 transition-all ${
                          thumbnail === t.url && !customThumbnail ? 'border-[#00f0ff] ring-1 ring-[#00f0ff]' : 'border-white/10'
                        }`}
                      >
                        <img src={t.url} className="w-full h-full object-cover" alt={t.label} />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[8px] font-bold tracking-wider text-center p-0.5">
                          {t.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="OR INPUT CUSTOM POSTER IMAGE URL..."
                    value={customThumbnail}
                    onChange={(e) => {
                      setCustomThumbnail(e.target.value);
                    }}
                    className="bg-black/60 border border-white/10 rounded px-3.5 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue transition-all duration-300 mt-2"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-lg font-bold text-xs text-center text-white bg-gradient-to-r from-neon-pink to-neon-blue hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all duration-300 tracking-widest mt-2"
                >
                  🚀 INGEST COMPILER PACKET
                </button>

              </form>
            </div>
          </div>

          {/* Right Column: Submitted Catalog */}
          <div className="lg:col-span-1.5 flex flex-col gap-6">
            <div className="bg-[#130722]/60 border border-neon-blue/20 rounded-xl p-6 backdrop-blur-md flex-grow">
              <h3 className="text-sm font-black text-white font-mono tracking-wider uppercase mb-5 pb-2 border-b border-white/5 flex items-center gap-2">
                <span className="text-neon-pink">■</span> YOUR UPLOADED CHANNELS
              </h3>

              {mySubmissions.length > 0 ? (
                <div className="flex flex-col gap-4 font-mono text-xs">
                  {mySubmissions.map((game) => (
                    <div key={game.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex gap-4 hover:border-neon-pink/30 transition-all duration-300">
                      <div className="w-16 h-20 rounded overflow-hidden flex-shrink-0 bg-gray-900 border border-white/10">
                        <img src={game.thumbnail} className="w-full h-full object-cover" alt={game.title} />
                      </div>
                      
                      <div className="flex flex-col justify-between flex-grow">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-extrabold text-white uppercase">{game.title}</h4>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${
                              game.approved 
                                ? 'bg-neon-blue/10 border border-neon-blue text-neon-blue' 
                                : 'bg-yellow-500/10 border border-yellow-500 text-yellow-500 animate-pulse'
                            }`}>
                              {game.approved ? 'LIVE_GRID' : 'PENDING_MOD'}
                            </span>
                          </div>
                          <span className="text-[8px] text-neon-pink font-bold uppercase tracking-widest">{game.category}</span>
                          <p className="text-[10px] text-text-secondary mt-1 line-clamp-2 leading-normal">{game.description}</p>
                        </div>

                        <div className="flex space-x-2 mt-3 pt-3 border-t border-white/5 justify-end">
                          {game.approved && (
                            <Link href={`/play/${game.id}/`} className="px-3 py-1 rounded border border-neon-blue/30 text-[9px] hover:bg-neon-blue hover:text-black transition-all">
                              TEST FRAME
                            </Link>
                          )}
                          <button 
                            onClick={() => rejectSubmission(game.id)}
                            className="px-3 py-1 rounded border border-red-500/30 text-red-500 text-[9px] hover:bg-red-500/20 transition-all"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <div className="text-2xl mb-2">📁</div>
                  <p className="text-xs font-mono text-text-secondary">No submitted gaming files registered under user profile.</p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
