"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from './UserContext';
import { isFirebaseMock, db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  setDoc,
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  roomId?: string;
  conversationId?: string;
  sender: string;
  recipient?: string;
  text: string;
  timestamp: any;
}

export interface ChatUser {
  username: string;
  status: 'online' | 'offline';
  level: number;
  role: string;
  playing: string;
  roomId?: string;
}

interface ChatContextType {
  activeRoom: string;
  messages: ChatMessage[];
  roomUsers: ChatUser[];
  activePmRecipient: string | null;
  pmMessages: ChatMessage[];
  joinRoom: (roomId: string) => void;
  sendMessage: (text: string) => Promise<void>;
  sendPrivateMessage: (recipient: string, text: string) => Promise<void>;
  setActivePmRecipient: (recipient: string | null) => void;
  setPresenceStatus: (status: 'online' | 'offline') => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Cyberpunk bot names partitioned by room (120 unique bots, 20 per room)
const BOT_NAMES_BY_ROOM: Record<string, string[]> = {
  GLOBAL_HQ: [
    'Alpha_Ghost', 'HQ_Overlord', 'Sovereign_Net', 'Spectre_Agent', 'Command_Null',
    'Global_Slayer', 'Sentinel_Prime', 'Atlas_Grid', 'Drift_Master', 'Intel_Viper',
    'Nova_Drifter', 'Titan_Core', 'Matrix_Boss', 'Aero_Operator', 'Quantum_Ghost',
    'Vector_Command', 'Nexus_Zero', 'Grid_Enforcer', 'Apex_HQ', 'Drift_Lord'
  ],
  TOKYO_GRID: [
    'Shibuya_Samurai', 'Neo_Geisha', 'Akiba_Hacker', 'Ronin_Zero', 'Neon_Shogun',
    'Harajuku_Punk', 'Shinjuku_Shadow', 'Chiba_Blade', 'Kyoto_Cipher', 'Osaka_Outlaw',
    'Fuji_Net', 'Ninja_Cyber', 'Katana_Glow', 'Tokyo_Synth', 'Anime_Matrix',
    'Sake_Slayer', 'Zen_Glitch', 'Giga_Mecha', 'Ryu_Code', 'Sakura_Byte'
  ],
  LONDON_SECTOR: [
    'Coded_Beefeater', 'Thames_Phantom', 'Cyber_Sherlock', 'Spitfire_Net', 'BigBen_Byte',
    'Piccadilly_Punk', 'Soho_Slayer', 'Paddington_Net', 'Tower_Ghost', 'London_Fog',
    'Brit_Netrunner', 'Abbey_Code', 'Hyde_Glitch', 'Chelsea_Cyber', 'Trafalgar_Viper',
    'Wembley_Winner', 'Camden_Goth', 'Metro_Ghost', 'Crown_Decrypter', 'Royal_Racer'
  ],
  USA_WEST_COAST: [
    'Silicon_Slayer', 'Cali_Drifter', 'Hollywood_Hologram', 'Vegas_Viper', 'Pacific_Ghost',
    'GoldenGate_Bit', 'Seattle_Rain', 'Portland_Glitch', 'La_Noir', 'Sf_Netrunner',
    'Desert_Racer', 'Canyon_Coyote', 'Tinsel_Synth', 'Sierras_Peak', 'Sunset_Strip',
    'Redwood_Byte', 'Ocean_Breeze', 'Mojave_Striker', 'Bay_Area_Boss', 'Alcatraz_Code'
  ],
  BERLIN_GATEWAY: [
    'Brandenburg_Bit', 'Techno_Phantom', 'Gateway_Goth', 'Checkpoint_Byte', 'Alexander_Plot',
    'Spree_Drifter', 'Kreuzberg_Punk', 'Neukoelln_Hacker', 'Wall_Breaker', 'Berlin_Bass',
    'Curry_Code', 'Club_Glitch', 'Autobahn_Racer', 'U_Bahn_Ghost', 'Teufelsberg_Intel',
    'Mitte_Matrix', 'Friedrich_File', 'Kaiser_Viper', 'Spreewald_Net', 'Prussian_Operator'
  ],
  SANDBATH_ARENA: [
    'Apex_Gladiator', 'Desert_Striker', 'Dune_Hacker', 'Scorpion_Net', 'Mirage_Ghost',
    'Oasis_Blade', 'Onyx_Slayer', 'Dust_Drifter', 'Sandstorm_Viper', 'Basalt_Gladiator',
    'Bedouin_Code', 'Cactus_Byte', 'Nomad_Netrunner', 'Pyramid_Apex', 'Sirocco_Synth',
    'Heatwave_Viper', 'Dune_Racer', 'Fossil_Hacker', 'Camel_Operator', 'Quarry_Glitch'
  ]
};

// Map names to full ChatUser objects with randomized initial states
const MOCK_BOTS: ChatUser[] = [];
Object.entries(BOT_NAMES_BY_ROOM).forEach(([roomId, names]) => {
  names.forEach((name, index) => {
    MOCK_BOTS.push({
      username: name,
      status: Math.random() < 0.7 ? 'online' : 'offline',
      level: Math.floor(Math.random() * 20) + 1,
      role: index === 1 ? 'Admin' : index % 5 === 0 ? 'Operator' : 'Drifter',
      playing: Math.random() < 0.4 
        ? (Math.random() < 0.5 ? 'RogueGhost' : 'CunningCats') 
        : 'None',
      roomId: roomId
    });
  });
});

// Interactive keyword-matching chatbot response engine
function generateResponsiveAnswer(userInput: string, bot: ChatUser): string {
  const text = userInput.toLowerCase();
  
  if (text.includes('ghost') || text.includes('rogue') || text.includes('stealth') || text.includes('hostage') || text.includes('snowblow')) {
    const replies = [
      "RogueGhost 3D is fully compiled in Godot. The new low-poly soldier visuals look incredibly sleek.",
      "Watch out for the Arctic guard vision cones in Snowblow. Crouch with CTRL to decrease your stealth drain.",
      "The main menu 3D preview model rotates and updates dynamically when you switch loadouts.",
      "Tip for RogueGhost: Firing weapons drains your stealth index instantly by 35 points.",
      "Rescue both hostages (Sahara and Nyx) before heading to the Exit Zone in Snowblow."
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
  
  if (text.includes('cat') || text.includes('cunningcats') || text.includes('race') || text.includes('nitro') || text.includes('car') || text.includes('vehicle')) {
    const replies = [
      "Armored cat sand-buggies are hitting top speeds with the new Nitro boost patches.",
      "I'm custom-tuning my sandstorm chassis with plasma laser upgrades.",
      "Desert combat racing is active in the Sandbath Arena. Join the queue.",
      "CunningCats Nitro patches 1.4 are active on the main grid nodes."
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
  
  if (text.includes('casino') || text.includes('slot') || text.includes('blackjack') || text.includes('roulette') || text.includes('bet') || text.includes('money') || text.includes('credit')) {
    const replies = [
      "We just spun a triple-diamond jackpot on Cyber Slots! 100x payout is real.",
      "Drift Roulette is drawing visual physics decelerations on the canvas overlay.",
      "Blackjack terminals are online. Double down or split your hand to maximize credits.",
      "Your Drifter credits balance is stored locally at $5,000 to start."
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
  
  if (text.includes('tetris') || text.includes('block') || text.includes('captn') || text.includes('shadow') || text.includes('muzzle') || text.includes('glass')) {
    const replies = [
      "Block Tetris looks premium now with physical glass refraction materials.",
      "AAA raycasting and soft shadow mapping in Captn.Ghost run buttery smooth at 60fps.",
      "Muzzle flash point light coordinates are synced for real-time shadow projection."
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  if (text.includes('status') || text.includes('ping') || text.includes('latency') || text.includes('server') || text.includes('network') || text.includes('connection')) {
    return "GRID_STATUS: ALL SYSTEMS NOMINAL // LATENCY: 11ms // COMM_DECK ENCRYPTION: AES-255-GCM // DRIFTER_LINK: SECURED";
  }
  
  if (text.includes('where') || text.includes('location') || text.includes('city') || text.includes('station') || text.includes('sector') || text.includes('room')) {
    switch (bot.roomId) {
      case 'GLOBAL_HQ':
        return "We are currently inside the GLOBAL_HQ station, coordinates 0,0,0. Secure operations and satellite links are active.";
      case 'TOKYO_GRID':
        return "Uplink matching Shibuya-Akihabara node. Tokyo Grid lighting is peaking. Watch out for Ronin AI grids.";
      case 'LONDON_SECTOR':
        return "London Sector terminal is online near Thames channel. High density fiber networks running zero-latency tunnels.";
      case 'USA_WEST_COAST':
        return "Cali-Silicon grid check complete. Sunset strip synthwave tracks are broadcasting.";
      case 'BERLIN_GATEWAY':
        return "Checkpoint Gateway illuminated. Berlin techno clubs are sync'd. Gateway goth filters running.";
      case 'SANDBATH_ARENA':
        return "Desert Arena operational. Dune desert storms are gathering. Standby for arena deployment.";
      default:
        return "Unknown sector. Re-routing signals.";
    }
  }

  if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('yo') || text.includes('welcome') || text.includes('howdy')) {
    const replies = [
      `Uplink match confirmed. Greetings, Drifter. ${bot.username} at your service.`,
      "Affirmative. How can I assist you on the GamerDrift tactical grid today?",
      "Connection matched. State your query, agent."
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  const quotes = [
    "Decentralized operations are active. Guard your cognitive uplinks.",
    "Zero-latency gateway shields are holding. All scans are clean.",
    "Drifter files indicate high activity on the CunningCats patch servers.",
    "System check complete: Tactical radar sweep is online. AES key fully loaded.",
    "Solar wind flares are projecting grid anomalies. Keep comm shields high."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [activeRoom, setActiveRoom] = useState<string>('GLOBAL_HQ');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomUsers, setRoomUsers] = useState<ChatUser[]>(MOCK_BOTS);
  const [activePmRecipient, setActivePmRecipient] = useState<string | null>(null);
  const [pmMessages, setPmMessages] = useState<ChatMessage[]>([]);
  
  const messagesEndRef = useRef<any>(null);

  // Use a ref to store active PM recipient so the onSnapshot listeners can always access current value
  const activePmRecipientRef = useRef<string | null>(null);
  useEffect(() => {
    activePmRecipientRef.current = activePmRecipient;
  }, [activePmRecipient]);

  // 1. Join Room Handler
  const joinRoom = (roomId: string) => {
    if (!roomId) return;
    const cleanRoom = roomId.toUpperCase().replace(/\s+/g, '_');
    setActiveRoom(cleanRoom);
    
    // Add local log in sandbox mode
    if (isFirebaseMock) {
      const systemMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        roomId: cleanRoom,
        sender: 'SYS_LINK',
        text: `CONNECTING TO ${cleanRoom} CHATROOM... SECURE COMM UPLINK ESTABLISHED.`,
        timestamp: new Date().toLocaleTimeString()
      };
      // Load room history from localStorage
      const saved = localStorage.getItem(`gamerdrift_chat_${cleanRoom}`);
      const history = saved ? JSON.parse(saved) : [];
      setMessages([...history, systemMsg]);
    }
  };

  // 2. Presence Status Handler
  const setPresenceStatus = async (status: 'online' | 'offline') => {
    if (!user) return;
    if (isFirebaseMock) {
      // Sync local status
      setRoomUsers(prev => prev.map(u => 
        u.username.toLowerCase() === user.username.toLowerCase() 
          ? { ...u, status } 
          : u
      ));
      return;
    }

    try {
      // Firestore Real-time presence sync
      const userRef = doc(db, 'users', user.username.toLowerCase());
      await setDoc(userRef, {
        status,
        lastActive: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Presence status update failed:", e);
    }
  };

  // 3. Setup listeners for Rooms and Users
  useEffect(() => {
    if (!user) return;

    // Add current user to active list
    const currentUserProfile: ChatUser = {
      username: user.username,
      status: 'online',
      level: user.level,
      role: user.role,
      playing: 'None'
    };

    if (isFirebaseMock) {
      // Sandbox presence simulation
      setRoomUsers(prev => {
        const filtered = prev.filter(u => u.username.toLowerCase() !== user.username.toLowerCase());
        return [...filtered, currentUserProfile];
      });

      // Load initial chat room messages
      const saved = localStorage.getItem(`gamerdrift_chat_${activeRoom}`);
      setMessages(saved ? JSON.parse(saved) : []);

      // Load PM history
      if (activePmRecipient) {
        const convId = [user.username, activePmRecipient].sort().join('_');
        const savedPm = localStorage.getItem(`gamerdrift_pm_${convId}`);
        setPmMessages(savedPm ? JSON.parse(savedPm) : []);
      }

      // Simulate bot presence changes periodically
      const presenceInterval = setInterval(() => {
        setRoomUsers(prev => prev.map(u => {
          // Don't modify active user
          if (u.username.toLowerCase() === user.username.toLowerCase()) return u;
          // 15% chance to toggle status
          if (Math.random() < 0.15) {
            const nextStatus = u.status === 'online' ? 'offline' : 'online';
            return {
              ...u,
              status: nextStatus,
              playing: nextStatus === 'online' && Math.random() < 0.6 
                ? (Math.random() < 0.5 ? 'RogueGhost' : 'CunningCats') 
                : 'None'
            };
          }
          return u;
        }));
      }, 10000);

      return () => clearInterval(presenceInterval);
    }

    // --- OFFICIAL FIREBASE UPLINK ---
    // A. Subscribe to chat room messages
    const roomQuery = query(
      collection(db, 'messages'),
      where('roomId', '==', activeRoom),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeMessages = onSnapshot(roomQuery, (snapshot) => {
      const loadedMessages: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedMessages.push({
          id: docSnap.id,
          roomId: data.roomId,
          sender: data.sender,
          text: data.text,
          timestamp: data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString() : 'Uplinking...'
        });
      });
      setMessages(loadedMessages);
    }, (error) => {
      console.warn("Firestore messages subscription error:", error);
    });

    // B. Subscribe to all community users status
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const loadedUsers: ChatUser[] = [];
      // Seed default bots so chatrooms look populated even on fresh Firebase
      const botTracker = new Set(MOCK_BOTS.map(b => b.username.toLowerCase()));
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const uname = data.username || docSnap.id;
        botTracker.delete(uname.toLowerCase());
        
        loadedUsers.push({
          username: uname,
          status: data.status || 'offline',
          level: data.level || 1,
          role: data.role || 'Drifter',
          playing: data.playing || 'None'
        });
      });

      // Add remaining default seed bots
      MOCK_BOTS.forEach(bot => {
        if (botTracker.has(bot.username.toLowerCase()) && bot.username.toLowerCase() !== user.username.toLowerCase()) {
          loadedUsers.push(bot);
        }
      });

      setRoomUsers(loadedUsers);
    });

    // C. Update presence to Online in Firestore
    setPresenceStatus('online');

    // D. Window Close Event trigger to set status to Offline
    const handleUnload = () => {
      // Use navigator.sendBeacon or write basic update
      setPresenceStatus('offline');
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      unsubscribeMessages();
      unsubscribeUsers();
      window.removeEventListener('beforeunload', handleUnload);
      setPresenceStatus('offline');
    };
  }, [activeRoom, user]);

  // 4. Setup PM subscription when active recipient changes
  useEffect(() => {
    if (!user || !activePmRecipient || isFirebaseMock) return;

    const convId = [user.username.toLowerCase(), activePmRecipient.toLowerCase()].sort().join('_');
    const pmQuery = query(
      collection(db, 'pms'),
      where('conversationId', '==', convId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribePm = onSnapshot(pmQuery, (snapshot) => {
      const loadedPms: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedPms.push({
          id: docSnap.id,
          conversationId: data.conversationId,
          sender: data.sender,
          recipient: data.recipient,
          text: data.text,
          timestamp: data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString() : 'Syncing...'
        });
      });
      setPmMessages(loadedPms);
    });

    return () => unsubscribePm();
  }, [activePmRecipient, user]);

  // 5. Send Room Message
  const sendMessage = async (text: string) => {
    if (!user || !text.trim()) return;
    const cleanText = text.trim();

    if (isFirebaseMock) {
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        roomId: activeRoom,
        sender: user.username,
        text: cleanText,
        timestamp: new Date().toLocaleTimeString()
      };

      const saved = localStorage.getItem(`gamerdrift_chat_${activeRoom}`);
      const history = saved ? JSON.parse(saved) : [];
      const updated = [...history, newMsg].slice(-80); // Keep last 80 messages
      localStorage.setItem(`gamerdrift_chat_${activeRoom}`, JSON.stringify(updated));
      setMessages(updated);

      // Trigger bot simulator response after 2 seconds
      setTimeout(() => {
        const activeRoomBots = roomUsers.filter(u => (!u.roomId || u.roomId === activeRoom) && u.status === 'online' && u.username.toLowerCase() !== user.username.toLowerCase());
        if (activeRoomBots.length > 0) {
          const randomBot = activeRoomBots[Math.floor(Math.random() * activeRoomBots.length)];
          const botResponse = generateResponsiveAnswer(cleanText, randomBot);

          const botMsg: ChatMessage = {
            id: `msg-bot-${Date.now()}`,
            roomId: activeRoom,
            sender: randomBot.username,
            text: botResponse,
            timestamp: new Date().toLocaleTimeString()
          };

          const savedHistory = localStorage.getItem(`gamerdrift_chat_${activeRoom}`);
          const historyList = savedHistory ? JSON.parse(savedHistory) : [];
          const withBot = [...historyList, botMsg].slice(-80);
          localStorage.setItem(`gamerdrift_chat_${activeRoom}`, JSON.stringify(withBot));
          setMessages(withBot);
        }
      }, 2000);

      return;
    }

    try {
      // Firestore upload
      await addDoc(collection(db, 'messages'), {
        roomId: activeRoom,
        sender: user.username,
        text: cleanText,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to send room message:", e);
    }
  };

  // 6. Send Private Message
  const sendPrivateMessage = async (recipient: string, text: string) => {
    if (!user || !recipient || !text.trim()) return;
    const cleanText = text.trim();
    const convId = [user.username.toLowerCase(), recipient.toLowerCase()].sort().join('_');

    if (isFirebaseMock) {
      const newMsg: ChatMessage = {
        id: `pm-${Date.now()}`,
        conversationId: convId,
        sender: user.username,
        recipient,
        text: cleanText,
        timestamp: new Date().toLocaleTimeString()
      };

      const savedPm = localStorage.getItem(`gamerdrift_pm_${convId}`);
      const history = savedPm ? JSON.parse(savedPm) : [];
      const updated = [...history, newMsg];
      localStorage.setItem(`gamerdrift_pm_${convId}`, JSON.stringify(updated));
      setPmMessages(updated);

      // Check if recipient is a mock bot to trigger simulated response
      const isBot = MOCK_BOTS.some(b => b.username.toLowerCase() === recipient.toLowerCase());
      if (isBot) {
        setTimeout(() => {
          const targetBot = MOCK_BOTS.find(b => b.username.toLowerCase() === recipient.toLowerCase());
          const replyText = generateResponsiveAnswer(cleanText, targetBot || { username: recipient, roomId: activeRoom } as any);

          const botMsg: ChatMessage = {
            id: `pm-bot-${Date.now()}`,
            conversationId: convId,
            sender: recipient,
            recipient: user.username,
            text: replyText,
            timestamp: new Date().toLocaleTimeString()
          };

          const curSaved = localStorage.getItem(`gamerdrift_pm_${convId}`);
          const curHistory = curSaved ? JSON.parse(curSaved) : [];
          const withBotReply = [...curHistory, botMsg];
          localStorage.setItem(`gamerdrift_pm_${convId}`, JSON.stringify(withBotReply));
          
          // Verify user is still looking at this PM window before triggering active state update
          if (activePmRecipientRef.current?.toLowerCase() === recipient.toLowerCase()) {
            setPmMessages(withBotReply);
          }
        }, 1500);
      }
      return;
    }

    try {
      await addDoc(collection(db, 'pms'), {
        conversationId: convId,
        sender: user.username,
        recipient,
        text: cleanText,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to send private message:", e);
    }
  };

  return (
    <ChatContext.Provider value={{
      activeRoom,
      messages,
      roomUsers: roomUsers.filter(u => !u.roomId || u.roomId === activeRoom),
      activePmRecipient,
      pmMessages,
      joinRoom,
      sendMessage,
      sendPrivateMessage,
      setActivePmRecipient,
      setPresenceStatus
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
