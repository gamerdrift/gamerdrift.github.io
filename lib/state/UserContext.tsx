"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

interface UserContextType {
  user: UserProfile | null;
  allUsers: UserProfile[];
  login: (username: string) => boolean;
  register: (username: string, role?: 'Drifter' | 'Creator' | 'Admin') => boolean;
  logout: () => void;
  gainXP: (amount: number) => void;
  triggerLevelUp: () => void;
  unlockedAchievementAlert: string | null;
  clearAchievementAlert: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [unlockedAchievementAlert, setUnlockedAchievementAlert] = useState<string | null>(null);

  // 1. Initial State Loading from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load registered users database
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
          badges: ['Sysop', 'Founder', 'Glitch Master'],
          achievements: [
            { title: 'Server Genesis', description: 'Initialize the main gaming deck.', unlockedAt: new Date('2026-05-01').toLocaleDateString(), xpReward: 500 }
          ],
          registeredAt: new Date('2026-05-01').toISOString()
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
          registeredAt: new Date('2026-05-15').toISOString()
        },
        {
          username: 'Hex_Netrunner',
          role: 'Drifter',
          level: 10,
          xp: 980,
          xpToNextLevel: 1000,
          badges: ['Drifter Leader', '8K Enthusiast'],
          achievements: [],
          registeredAt: new Date('2026-05-18').toISOString()
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
  }, []);

  // 2. Authentication Logic
  const login = (username: string): boolean => {
    const trimmed = username.trim();
    if (!trimmed) return false;

    // Find user in db
    const foundUser = allUsers.find(u => u.username.toLowerCase() === trimmed.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('gamerdrift_active_user', JSON.stringify(foundUser));
      return true;
    } else {
      // If user not found, auto-create as new "Drifter" account
      return register(trimmed, 'Drifter');
    }
  };

  const register = (username: string, role: 'Drifter' | 'Creator' | 'Admin' = 'Drifter'): boolean => {
    const trimmed = username.trim();
    if (!trimmed) return false;

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
      registeredAt: new Date().toISOString()
    };

    const updatedDb = [...allUsers, newUser];
    setAllUsers(updatedDb);
    localStorage.setItem('gamerdrift_users_db', JSON.stringify(updatedDb));

    setUser(newUser);
    localStorage.setItem('gamerdrift_active_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gamerdrift_active_user');
  };

  // 3. User XP & Achievements Progression
  const gainXP = (amount: number) => {
    if (!user) return;

    setUser(prevUser => {
      if (!prevUser) return null;
      let newXp = prevUser.xp + amount;
      let newLevel = prevUser.level;
      let newXpToNext = prevUser.xpToNextLevel;
      let levelUpOccurred = false;

      // Handle Level Up Ticks (XP cap increases dynamically)
      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = Math.floor(newXpToNext * 1.5);
        levelUpOccurred = true;
      }

      const updatedUser: UserProfile = {
        ...prevUser,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNext,
        badges: levelUpOccurred && newLevel === 5 
          ? [...prevUser.badges, 'Elite Hacker']
          : levelUpOccurred && newLevel === 10
          ? [...prevUser.badges, 'Cyber Legend']
          : prevUser.badges
      };

      if (levelUpOccurred) {
        setUnlockedAchievementAlert(`Sync Level Up! You reached Level ${newLevel}`);
      }

      // Sync active user and user database in LocalStorage
      localStorage.setItem('gamerdrift_active_user', JSON.stringify(updatedUser));
      
      setAllUsers(prevDb => {
        const updatedDb = prevDb.map(u => u.username === prevUser.username ? updatedUser : u);
        localStorage.setItem('gamerdrift_users_db', JSON.stringify(updatedDb));
        return updatedDb;
      });

      return updatedUser;
    });
  };

  const triggerLevelUp = () => {
    gainXP(15);
  };

  const clearAchievementAlert = () => {
    setUnlockedAchievementAlert(null);
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
      clearAchievementAlert
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
