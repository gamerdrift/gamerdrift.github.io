"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFirebaseMock, auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs,
  updateDoc
} from 'firebase/firestore';

export interface Achievement {
  title: string;
  description: string;
  unlockedAt: string;
  xpReward: number;
}

export interface UserProfile {
  username: string;
  role: 'Drifter' | 'Creator' | 'Admin';
  level: number;
  xp: number;
  xpToNextLevel: number;
  badges: string[];
  achievements: Achievement[];
  registeredAt: string;
  driftCoins: number;
  isVIP: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  allUsers: UserProfile[];
  login: (username: string, password?: string) => Promise<boolean>;
  register: (username: string, password?: string, email?: string, role?: 'Drifter' | 'Creator' | 'Admin') => Promise<boolean>;
  logout: () => void;
  gainXP: (amount: number) => void;
  triggerLevelUp: () => void;
  unlockedAchievementAlert: string | null;
  clearAchievementAlert: () => void;
  addCoins: (amount: number) => void;
  buyVIP: () => Promise<boolean>;
  claimDailyBonus: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [unlockedAchievementAlert, setUnlockedAchievementAlert] = useState<string | null>(null);

  // 1. Initial State Loading
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isFirebaseMock) {
      // Load registered users database in Mock Mode
      const storedUsers = localStorage.getItem('gamerdrift_users_db');
      let dbUsers: UserProfile[] = [];

      if (storedUsers) {
        dbUsers = JSON.parse(storedUsers);
      } else {
        // Seed default accounts
        dbUsers = [
          {
            username: 'AdminDrifter',
            role: 'Admin',
            level: 12,
            xp: 450,
            xpToNextLevel: 1000,
            badges: ['Sysop', 'Founder', 'Glitch Master', 'VIP Drifter'],
            achievements: [
              { title: 'Server Genesis', description: 'Initialize the main gaming deck.', unlockedAt: new Date('2026-05-01').toLocaleDateString(), xpReward: 500 }
            ],
            registeredAt: new Date('2026-05-01').toISOString(),
            driftCoins: 1000,
            isVIP: true
          },
          {
            username: 'NeoCreator',
            role: 'Creator',
            level: 5,
            xp: 120,
            xpToNextLevel: 500,
            badges: ['Architect', 'Uplink Ingestor'],
            achievements: [
              { title: 'Ingest Successful', description: 'Upload your first HTML5 gaming node.', unlockedAt: new Date('2026-05-15').toLocaleDateString(), xpReward: 200 }
            ],
            registeredAt: new Date('2026-05-15').toISOString(),
            driftCoins: 150,
            isVIP: false
          },
          {
            username: 'Hex_Netrunner',
            role: 'Drifter',
            level: 10,
            xp: 980,
            xpToNextLevel: 1000,
            badges: ['Drifter Leader', '8K Enthusiast'],
            achievements: [],
            registeredAt: new Date('2026-05-18').toISOString(),
            driftCoins: 300,
            isVIP: false
          }
        ];
        localStorage.setItem('gamerdrift_users_db', JSON.stringify(dbUsers));
      }
      setAllUsers(dbUsers);

      // Load active session user
      const activeSession = localStorage.getItem('gamerdrift_active_user');
      if (activeSession) {
        setUser(JSON.parse(activeSession));
      }
    } else {
      // Sync all users from Firestore
      const syncUsers = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'users'));
          const users: UserProfile[] = [];
          querySnapshot.forEach((docSnap) => {
            const d = docSnap.data();
            users.push({
              username: d.username || docSnap.id,
              role: d.role || 'Drifter',
              level: d.level || 1,
              xp: d.xp || 0,
              xpToNextLevel: d.xpToNextLevel || 100,
              badges: d.badges || [],
              achievements: d.achievements || [],
              registeredAt: d.registeredAt || new Date().toISOString(),
              driftCoins: d.driftCoins || 200,
              isVIP: d.isVIP || false
            });
          });
          setAllUsers(users);
        } catch (e) {
          console.warn("Could not sync users from Firestore:", e);
        }
      };
      syncUsers();

      // Load active session user from localStorage
      const activeSession = localStorage.getItem('gamerdrift_active_user');
      if (activeSession) {
        setUser(JSON.parse(activeSession));
      }
    }
  }, []);

  // 2. Authentication Logic
  const login = async (username: string, password?: string): Promise<boolean> => {
    const trimmed = username.trim();
    if (!trimmed) return false;

    if (isFirebaseMock) {
      // Find user in mock db
      const foundUser = allUsers.find(u => u.username.toLowerCase() === trimmed.toLowerCase());
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('gamerdrift_active_user', JSON.stringify(foundUser));
        return true;
      } else {
        // If user not found, auto-create as new "Drifter" account in mock mode
        return register(trimmed, password || 'password123', `${trimmed.toLowerCase()}@gamerdrift.com`, 'Drifter');
      }
    }

    // --- OFFICIAL FIREBASE LOGIN ---
    // Translate Username to simulated email format under the hood
    const emailStr = trimmed.includes('@') ? trimmed : `${trimmed.toLowerCase()}@gamerdrift.com`;
    const pwdStr = password || 'password123'; // Default fallback password if none provided (e.g. from Admin bypasses)

    try {
      await signInWithEmailAndPassword(auth, emailStr, pwdStr);
      // Fetch profile details from Firestore
      const docSnap = await getDoc(doc(db, 'users', trimmed.toLowerCase()));
      if (docSnap.exists()) {
        const d = docSnap.data();
        const activeProfile: UserProfile = {
          username: d.username || trimmed,
          role: d.role || 'Drifter',
          level: d.level || 1,
          xp: d.xp || 0,
          xpToNextLevel: d.xpToNextLevel || 100,
          badges: d.badges || [],
          achievements: d.achievements || [],
          registeredAt: d.registeredAt || new Date().toISOString(),
          driftCoins: d.driftCoins || 200,
          isVIP: d.isVIP || false
        };
        setUser(activeProfile);
        localStorage.setItem('gamerdrift_active_user', JSON.stringify(activeProfile));
        
        // Sync user presence to online
        await setDoc(doc(db, 'users', trimmed.toLowerCase()), { status: 'online' }, { merge: true });
        return true;
      } else {
        // If user document does not exist in Firestore yet (auth exists), create default profile
        const newProfile: UserProfile = {
          username: trimmed,
          role: 'Drifter',
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          badges: ['Drifter Node'],
          achievements: [],
          registeredAt: new Date().toISOString(),
          driftCoins: 200,
          isVIP: false
        };
        await setDoc(doc(db, 'users', trimmed.toLowerCase()), {
          ...newProfile,
          status: 'online'
        });
        setUser(newProfile);
        localStorage.setItem('gamerdrift_active_user', JSON.stringify(newProfile));
        return true;
      }
    } catch (error) {
      console.error("Firebase Login failed:", error);
      return false;
    }
  };

  const register = async (
    username: string, 
    password?: string, 
    email?: string, 
    role: 'Drifter' | 'Creator' | 'Admin' = 'Drifter'
  ): Promise<boolean> => {
    const trimmed = username.trim();
    if (!trimmed) return false;

    if (isFirebaseMock) {
      // Duplicate check
      if (allUsers.some(u => u.username.toLowerCase() === trimmed.toLowerCase())) {
        return false;
      }

      const newUser: UserProfile = {
        username: trimmed,
        role,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        badges: [role === 'Admin' ? 'Sysop' : role === 'Creator' ? 'Architect' : 'Drifter Node'],
        achievements: [
          {
            title: 'Cyber Uplink Est.',
            description: 'Create your GamerDrift drifter profile.',
            unlockedAt: new Date().toLocaleDateString(),
            xpReward: 50
          }
        ],
        registeredAt: new Date().toISOString(),
        driftCoins: 200,
        isVIP: false
      };

      const updatedDb = [...allUsers, newUser];
      setAllUsers(updatedDb);
      localStorage.setItem('gamerdrift_users_db', JSON.stringify(updatedDb));

      setUser(newUser);
      localStorage.setItem('gamerdrift_active_user', JSON.stringify(newUser));
      return true;
    }

    // --- OFFICIAL FIREBASE REGISTRATION ---
    const emailStr = email || `${trimmed.toLowerCase()}@gamerdrift.com`;
    const pwdStr = password || 'password123';

    try {
      // Check if document exists first in Firestore to prevent duplicate usernames
      const docSnap = await getDoc(doc(db, 'users', trimmed.toLowerCase()));
      if (docSnap.exists()) {
        return false;
      }

      // Create Firebase Auth credentials
      await createUserWithEmailAndPassword(auth, emailStr, pwdStr);

      const newUser: UserProfile = {
        username: trimmed,
        role,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        badges: [role === 'Admin' ? 'Sysop' : role === 'Creator' ? 'Architect' : 'Drifter Node'],
        achievements: [
          {
            title: 'Cyber Uplink Est.',
            description: 'Create your GamerDrift drifter profile.',
            unlockedAt: new Date().toLocaleDateString(),
            xpReward: 50
          }
        ],
        registeredAt: new Date().toISOString(),
        driftCoins: 200,
        isVIP: false
      };

      // Create Firestore User Document
      await setDoc(doc(db, 'users', trimmed.toLowerCase()), {
        ...newUser,
        email: emailStr,
        status: 'online'
      });

      setUser(newUser);
      localStorage.setItem('gamerdrift_active_user', JSON.stringify(newUser));

      // Append to local state list
      setAllUsers(prev => [...prev.filter(u => u.username.toLowerCase() !== trimmed.toLowerCase()), newUser]);
      return true;
    } catch (error) {
      console.error("Firebase Registration failed:", error);
      return false;
    }
  };

  const logout = async () => {
    if (user && !isFirebaseMock) {
      try {
        // Mark offline in Firestore
        await setDoc(doc(db, 'users', user.username.toLowerCase()), { status: 'offline' }, { merge: true });
        await signOut(auth);
      } catch (e) {
        console.error("Firebase logout presence sync failed:", e);
      }
    }
    setUser(null);
    localStorage.removeItem('gamerdrift_active_user');
  };

  // 3. User XP & Achievements Progression
  const gainXP = async (amount: number) => {
    if (!user) return;

    const multiplier = user.isVIP ? 2 : 1;
    const finalXpGained = amount * multiplier;
    const coinsEarned = Math.floor(finalXpGained / 2);

    let newXp = user.xp + finalXpGained;
    let newLevel = user.level;
    let newXpToNext = user.xpToNextLevel;
    let levelUpOccurred = false;

    // Handle Level Up Ticks (XP cap increases dynamically)
    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel += 1;
      newXpToNext = Math.floor(newXpToNext * 1.5);
      levelUpOccurred = true;
    }

    const updatedUser: UserProfile = {
      ...user,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newXpToNext,
      driftCoins: (user.driftCoins || 0) + coinsEarned,
      badges: levelUpOccurred && newLevel === 5 
        ? [...user.badges, 'Elite Hacker']
        : levelUpOccurred && newLevel === 10
        ? [...user.badges, 'Cyber Legend']
        : user.badges
    };

    setUser(updatedUser);
    localStorage.setItem('gamerdrift_active_user', JSON.stringify(updatedUser));

    if (levelUpOccurred) {
      setUnlockedAchievementAlert(`Sync Level Up! You reached Level ${newLevel}`);
    }

    if (isFirebaseMock) {
      // Sync local storage DB
      setAllUsers(prevDb => {
        const updatedDb = prevDb.map(u => u.username.toLowerCase() === user.username.toLowerCase() ? updatedUser : u);
        localStorage.setItem('gamerdrift_users_db', JSON.stringify(updatedDb));
        return updatedDb;
      });
    } else {
      // Sync Firestore profile fields
      try {
        const userRef = doc(db, 'users', user.username.toLowerCase());
        await updateDoc(userRef, {
          xp: newXp,
          level: newLevel,
          xpToNextLevel: newXpToNext,
          badges: updatedUser.badges
        });
      } catch (e) {
        console.error("Firestore XP sync failed:", e);
      }
    }
  };

  const triggerLevelUp = () => {
    gainXP(15);
  };

  const clearAchievementAlert = () => {
    setUnlockedAchievementAlert(null);
  };

  const addCoins = async (amount: number) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      driftCoins: (user.driftCoins || 0) + amount
    };
    setUser(updatedUser);
    localStorage.setItem('gamerdrift_active_user', JSON.stringify(updatedUser));

    if (isFirebaseMock) {
      setAllUsers(prevDb => {
        const updatedDb = prevDb.map(u => u.username.toLowerCase() === user.username.toLowerCase() ? updatedUser : u);
        localStorage.setItem('gamerdrift_users_db', JSON.stringify(updatedDb));
        return updatedDb;
      });
    } else {
      try {
        const userRef = doc(db, 'users', user.username.toLowerCase());
        await updateDoc(userRef, {
          driftCoins: updatedUser.driftCoins
        });
      } catch (e) {
        console.error("Firestore coins sync failed:", e);
      }
    }
  };

  const buyVIP = async (): Promise<boolean> => {
    if (!user) return false;
    const updatedUser: UserProfile = {
      ...user,
      isVIP: true,
      badges: user.badges.includes('VIP Drifter') ? user.badges : [...user.badges, 'VIP Drifter']
    };
    setUser(updatedUser);
    localStorage.setItem('gamerdrift_active_user', JSON.stringify(updatedUser));

    if (isFirebaseMock) {
      setAllUsers(prevDb => {
        const updatedDb = prevDb.map(u => u.username.toLowerCase() === user.username.toLowerCase() ? updatedUser : u);
        localStorage.setItem('gamerdrift_users_db', JSON.stringify(updatedDb));
        return updatedDb;
      });
    } else {
      try {
        const userRef = doc(db, 'users', user.username.toLowerCase());
        await updateDoc(userRef, {
          isVIP: true,
          badges: updatedUser.badges
        });
      } catch (e) {
        console.error("Firestore VIP sync failed:", e);
      }
    }
    setUnlockedAchievementAlert(`Drift VIP Pass Activated! Welcome to the elite grid.`);
    return true;
  };

  const claimDailyBonus = () => {
    if (!user) return;
    addCoins(100);
    setUnlockedAchievementAlert(`Daily Uplink Bonus! Earned 100 Drift Coins.`);
  };

  return (
    <UserContext.Provider value={{
      user,
      allUsers,
      login,
      register,
      logout,
      gainXP,
      triggerLevelUp,
      unlockedAchievementAlert,
      clearAchievementAlert,
      addCoins,
      buyVIP,
      claimDailyBonus
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
