"use client";

import React, { useState } from 'react';
import { useUser } from '../../lib/state/UserContext';
import { useChat } from '../../lib/state/ChatContext';

interface Clan {
  name: string;
  tag: string;
  description: string;
  members: number;
  rank: number;
  level: number;
  logoColor: string;
}

interface ForumTopic {
  id: string;
  title: string;
  replies: number;
  author: string;
  lastActive: string;
  category: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  rewardBadge?: string;
}

const mockClans: Clan[] = [
  { name: 'Ghost Squad Tactical', tag: 'GST', description: 'Elite tactical RogueGhost specialists operating in high-difficulty hostage zones.', members: 42, rank: 1, level: 15, logoColor: 'border-[#00f0ff] text-[#00f0ff]' },
  { name: 'Desert Cat Racers', tag: 'DCR', description: 'CunningCats nitro drifters who dominate the Sandbath speed records.', members: 38, rank: 2, level: 14, logoColor: 'border-[#ff9f00] text-[#ff9f00]' },
  { name: 'Cyber Intel Syndicate', tag: 'CIS', description: 'Network decoders and hardware enthusiasts compiling global highscores.', members: 29, rank: 3, level: 12, logoColor: 'border-[#39ff14] text-[#39ff14]' }
];

const mockForums: ForumTopic[] = [
  { id: 'f-1', title: 'CunningCats: Captain Whiskers vs Sergeant Claw vehicle builds?', category: 'Combat Tactics', replies: 28, author: 'DriftMaster99', lastActive: '5m ago' },
  { id: 'f-2', title: 'RogueGhost: Sandbath extraction zone guard path timings', category: 'Mission Strategy', replies: 14, author: 'GhostInTheGrid', lastActive: '12m ago' },
  { id: 'f-3', title: 'Best racing wheels for low latency gameplay?', category: 'Hardware Uplink', replies: 37, author: 'RigbuilderPro', lastActive: '1h ago' },
  { id: 'f-4', title: 'Season 2 Clan Championship roster declarations thread', category: 'Tournaments', replies: 49, author: 'CommandCenter', lastActive: '3h ago' }
];

const mockChallenges: Challenge[] = [
  { id: 'ch-1', title: 'Nitro Drift Grand Master', description: 'Burn nitro for a total of 120 seconds in CunningCats.', xpReward: 500, progress: 85, target: 120, rewardBadge: 'TireSlayer' },
  { id: 'ch-2', title: 'Ghost Operative Specialist', description: 'Rescue 10 hostage scientists without triggering detection grids.', xpReward: 800, progress: 4, target: 10, rewardBadge: 'SilentGhost' },
  { id: 'ch-3', title: 'Node Conqueror', description: 'Complete 10 games from the decentralized arcade archive grid.', xpReward: 300, progress: 7, target: 10 }
];

export default function CommunityPage() {
  const { user } = useUser();
  const { roomUsers } = useChat();
  const [activeTab, setActiveTab] = useState<'clans' | 'forums' | 'challenges'>('clans');
  const [friendInput, setFriendInput] = useState('');
  const [friends, setFriends] = useState<any[]>([]);

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (friendInput.trim()) {
      setFriends(prev => [
        ...prev,
        { username: friendInput.trim(), status: 'Offline', level: 1, playing: 'None' }
      ]);
      setFriendInput('');
    }
  };

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-black relative font-mono text-xs">
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left 3 Columns: Main Community Portal */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Header */}
          <div className="border-b border-[#00f0ff]/20 pb-4 flex justify-between items-end">
            <div>
              <span className="text-[10px] text-[#ff9f00] tracking-[0.2em] block mb-1">DRIFTER CORPS HUB</span>
              <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase">COMMUNITY_FILES</h1>
            </div>
            <span className="text-[9px] border border-[#00f0ff]/20 bg-[#00f0ff]/5 px-3 py-1 text-[#00f0ff]">
              COMM_LINK: SECURE // ONLINE
            </span>
          </div>

          {/* Tab toggles */}
          <div className="flex border-b border-slate-900 pb-2">
            {[
              { id: 'clans', label: '[ CLAN REGISTRIES ]' },
              { id: 'forums', label: '[ FORUM INTEL ]' },
              { id: 'challenges', label: '[ COMMUNITY CHALLENGES ]' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 font-bold transition-all ${
                  activeTab === tab.id
                    ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] -mb-[2px]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <div className="flex-grow">
            
            {/* CLANS */}
            {activeTab === 'clans' && (
              <div className="flex flex-col gap-4">
                {mockClans.map(clan => (
                  <div key={clan.name} className="hud-panel p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-3 flex items-start gap-4">
                      {/* Clan Emblem Wireframe */}
                      <div className={`w-12 h-12 border-2 ${clan.logoColor} bg-black/40 flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                        {clan.tag}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-white uppercase">{clan.name}</h2>
                          <span className="text-[#ff9f00] text-[9px] border border-[#ff9f00]/30 px-1">RANK #{clan.rank}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{clan.description}</p>
                      </div>
                    </div>
                    <div className="flex md:flex-col justify-between items-center md:items-end gap-2 border-t md:border-t-0 border-slate-900 pt-3 md:pt-0">
                      <div>
                        <span className="text-slate-600 block text-[9px] uppercase">MEMBERS</span>
                        <span className="text-white font-bold">{clan.members} / 50</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block text-[9px] uppercase">CLAN_LEVEL</span>
                        <span className="text-[#00f0ff] font-bold">LVL {clan.level}</span>
                      </div>
                      <button className="hud-btn mt-1.5 px-3 py-1 text-[9px]">UPLINK_JOIN</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FORUMS */}
            {activeTab === 'forums' && (
              <div className="hud-panel p-4 flex flex-col gap-2">
                <div className="grid grid-cols-12 text-[10px] text-slate-500 font-bold border-b border-slate-800 pb-2 mb-2">
                  <div className="col-span-6 uppercase">DISCUSSION TOPIC</div>
                  <div className="col-span-2 uppercase">SECTOR</div>
                  <div className="col-span-2 uppercase text-center">REPLIES</div>
                  <div className="col-span-2 uppercase text-right">LAST_UPLINK</div>
                </div>
                {mockForums.map(top => (
                  <div key={top.id} className="grid grid-cols-12 items-center py-2.5 border-b border-slate-900/60 hover:bg-slate-900/25 px-1.5">
                    <div className="col-span-6 flex flex-col">
                      <span className="text-white hover:text-[#00f0ff] cursor-pointer font-bold uppercase">{top.title}</span>
                      <span className="text-[9px] text-slate-600">POSTED BY: {top.author.toUpperCase()}</span>
                    </div>
                    <div className="col-span-2 text-slate-400 font-bold">{top.category}</div>
                    <div className="col-span-2 text-center text-[#ff9f00] font-bold">{top.replies}</div>
                    <div className="col-span-2 text-right text-slate-500">{top.lastActive}</div>
                  </div>
                ))}
                <button className="hud-btn mt-4 self-start px-4 py-2">COMPILE_NEW_TOPIC</button>
              </div>
            )}

            {/* CHALLENGES */}
            {activeTab === 'challenges' && (
              <div className="flex flex-col gap-4">
                {mockChallenges.map(ch => {
                  const percent = Math.min(100, Math.floor((ch.progress / ch.target) * 100));
                  return (
                    <div key={ch.id} className="hud-panel p-5 flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-grow flex flex-col">
                        <h2 className="text-sm font-bold text-white uppercase">{ch.title}</h2>
                        <p className="text-[11px] text-slate-400 mt-1">{ch.description}</p>
                        
                        {/* Progress slider bar */}
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex-grow bg-slate-950 h-2 border border-slate-900">
                            <div className="bg-gradient-to-r from-[#00f0ff] to-[#ff9f00] h-full" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{ch.progress} / {ch.target}</span>
                        </div>
                      </div>

                      <div className="flex md:flex-col justify-between items-center md:items-end md:justify-center gap-2 border-t md:border-t-0 border-slate-900 pt-3 md:pt-0 shrink-0 min-w-[120px]">
                        <div className="text-right">
                          <span className="text-slate-600 block text-[9px] uppercase">XP REWARD</span>
                          <span className="text-[#39ff14] font-bold">+{ch.xpReward} XP</span>
                        </div>
                        {ch.rewardBadge && (
                          <div className="text-right mt-1">
                            <span className="text-slate-600 block text-[9px] uppercase">BADGE</span>
                            <span className="text-[#ff9f00] font-bold border border-[#ff9f00]/30 px-1 text-[9px]">{ch.rewardBadge}</span>
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">{percent}% SYNCED</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Friends Uplink System */}
        <div className="flex flex-col gap-6">
          <div className="hud-panel p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white border-b border-[#00f0ff]/20 pb-2 uppercase tracking-wider">
              FRIENDS_MATRIX
            </h3>
            
            {/* Friends list */}
            <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
              {roomUsers.map(friend => (
                <div key={friend.username} className="flex justify-between items-center bg-black/40 border border-slate-900 p-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-white uppercase">{friend.username}</span>
                    <span className="text-[8px] text-slate-600 uppercase">LEVEL {friend.level} // {friend.playing}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${friend.status === 'online' ? 'bg-[#39ff14] animate-pulse' : 'bg-slate-700'}`}></span>
                    <span className="text-[9px] text-slate-500 uppercase">{friend.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add friend form */}
            <form onSubmit={handleAddFriend} className="flex gap-2 mt-2">
              <input
                type="text"
                required
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
                placeholder="DRIFTER TAG..."
                className="bg-black/60 border border-slate-800 px-2 py-1.5 text-[10px] text-white placeholder-slate-700 focus:outline-none focus:border-[#00f0ff] flex-grow"
              />
              <button type="submit" className="px-2.5 bg-[#00f0ff]/10 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/20 text-[9px] uppercase font-bold">LINK</button>
            </form>
          </div>

          {/* Community Challenge Status card */}
          {user && (
            <div className="hud-panel p-5 bg-[#ff9f00]/5 border-[#ff9f00]/20 flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 text-slate-900/20 text-7xl font-bold -mb-4 -mr-4 pointer-events-none">XP</div>
              <h3 className="text-xs font-extrabold text-[#ff9f00] uppercase tracking-wider">DRIFTER_STATUS</h3>
              <div className="text-[11px] text-slate-300 space-y-1">
                <div>DRIFTER: <span className="font-bold text-white">{user.username.toUpperCase()}</span></div>
                <div>RANKING: <span className="font-bold text-white">RECRUIT LEVEL {user.level}</span></div>
                <div>SYNCED_XP: <span className="font-bold text-white">{user.xp} XP</span></div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
