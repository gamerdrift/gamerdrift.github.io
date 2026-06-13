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

// Cyberpunk simulated responses for local sandbox bot chatting
const MOCK_BOT_RESPONSES: Record<string, string[]> = {
  general: [
    "Uplink established. Scanning grid for defect AI anomalies.",
    "System check complete: Tactical radar sweep is online. Latency is looking good at <15ms.",
    "Did anyone test the CunningCats Nitro patch 1.4? The speed modifier feels insane.",
    "Sector command signals are locked. Deploying defensive beacons now.",
    "Drifter network is operational. Secure tactical command slots.",
    "Top secret brief: Forestfun sectors are showing high AI patrol density.",
    "Command core: We need to coordinate the global clan championship rosters.",
    "Uplink warning: Solar wind flare detected. Uplink signal power at 96%."
  ],
  dm: [
    "Message received, Drifter. Grid telemetry looks secure.",
    "Negative. Comm-line is encrypted via AES-255. Safe to proceed.",
    "I am currently staging stealth camouflage in Snowblow sector. Catch you soon.",
    "Uplink speed looks perfect. Meet me in the Tokyo chatroom for coordinates.",
    "Tactical node locked. Plasma load is ready."
  ]
};

const MOCK_BOTS: ChatUser[] = [
  { username: 'Hex_Netrunner', status: 'online', level: 10, role: 'Drifter', playing: 'CunningCats' },
  { username: 'NeoCreator', status: 'online', level: 5, role: 'Creator', playing: 'Developing Node' },
  { username: 'CipherZero', status: 'offline', level: 14, role: 'Drifter', playing: 'None' },
  { username: 'Desert_Fox', status: 'online', level: 8, role: 'Drifter', playing: 'RogueGhost' },
  { username: 'GhostInGrid', status: 'offline', level: 12, role: 'Admin', playing: 'None' }
];

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
        const onlineBots = roomUsers.filter(u => u.status === 'online' && u.username.toLowerCase() !== user.username.toLowerCase());
        if (onlineBots.length > 0) {
          const randomBot = onlineBots[Math.floor(Math.random() * onlineBots.length)];
          const responses = MOCK_BOT_RESPONSES.general;
          const randomText = responses[Math.floor(Math.random() * responses.length)];

          const botMsg: ChatMessage = {
            id: `msg-bot-${Date.now()}`,
            roomId: activeRoom,
            sender: randomBot.username,
            text: randomText,
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
          const botReplies = MOCK_BOT_RESPONSES.dm;
          const replyText = botReplies[Math.floor(Math.random() * botReplies.length)];

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
      roomUsers,
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
