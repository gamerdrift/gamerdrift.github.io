"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

export interface LeaderboardEntry {
  username: string;
  totalWon: number;
  biggestWin: number;
  lastWinDate: string;
}

interface CasinoTelemetry {
  totalBets: number;      // Total wagers in Drift Coins
  totalPayouts: number;   // Total payouts in Drift Coins
  playCounts: Record<string, number>; // Username -> Number of spins/hands
  losingStreaks: Record<string, number>; // Username -> Number of consecutive losses
}

interface CasinoContextType {
  totalBets: number;
  totalPayouts: number;
  houseMargin: number;
  availablePool: number;
  leaderboard: LeaderboardEntry[];
  checkWinAllowed: (username: string, betAmount: number, winPotential: number) => boolean;
  processBet: (betAmount: number) => boolean;
  processPayout: (winAmount: number, isWin: boolean) => void;
  getLeaderboard: () => LeaderboardEntry[];
  addManualWin: (username: string, winAmount: number) => void;
}

const CasinoContext = createContext<CasinoContextType | undefined>(undefined);

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { username: "Hex_Netrunner", totalWon: 98400, biggestWin: 25000, lastWinDate: "2026-06-30" },
  { username: "Desert_Fox", totalWon: 88100, biggestWin: 12000, lastWinDate: "2026-06-29" },
  { username: "GhostInGrid", totalWon: 79300, biggestWin: 15000, lastWinDate: "2026-06-28" },
  { username: "ZeroCool", totalWon: 64200, biggestWin: 8000, lastWinDate: "2026-06-29" },
  { username: "AcidBurn", totalWon: 59000, biggestWin: 9500, lastWinDate: "2026-06-30" },
  { username: "LordNikon", totalWon: 48500, biggestWin: 6000, lastWinDate: "2026-06-27" },
  { username: "Neo_One", totalWon: 41200, biggestWin: 18000, lastWinDate: "2026-06-30" },
  { username: "Trinity_Sec", totalWon: 39800, biggestWin: 5500, lastWinDate: "2026-06-29" },
  { username: "Morpheus_Neb", totalWon: 35000, biggestWin: 10000, lastWinDate: "2026-06-28" },
  { username: "Cypher_Deal", totalWon: 31000, biggestWin: 4500, lastWinDate: "2026-06-26" },
  { username: "Tank_Loader", totalWon: 29500, biggestWin: 4000, lastWinDate: "2026-06-25" },
  { username: "Apoc_Grid", totalWon: 27000, biggestWin: 3500, lastWinDate: "2026-06-24" },
  { username: "Switch_Mode", totalWon: 25400, biggestWin: 6200, lastWinDate: "2026-06-29" },
  { username: "DeusEx_Machina", totalWon: 22100, biggestWin: 5000, lastWinDate: "2026-06-28" },
  { username: "Johnny_Silver", totalWon: 19800, biggestWin: 7000, lastWinDate: "2026-06-30" },
  { username: "V_NightCity", totalWon: 17500, biggestWin: 3800, lastWinDate: "2026-06-29" },
  { username: "Rogue_Operator", totalWon: 15400, biggestWin: 4200, lastWinDate: "2026-06-28" },
  { username: "GridSeeker", totalWon: 13200, biggestWin: 3000, lastWinDate: "2026-06-27" },
  { username: "ShadowRunner", totalWon: 11000, biggestWin: 2500, lastWinDate: "2026-06-26" },
  { username: "Crasher_99", totalWon: 9800, biggestWin: 2000, lastWinDate: "2026-06-25" }
];

export function CasinoProvider({ children }: { children: React.ReactNode }) {
  const { user, addCoins } = useUser();
  const [telemetry, setTelemetry] = useState<CasinoTelemetry>({
    totalBets: 10000,   // Seeded base bets to prevent division by zero and provide a starting pool
    totalPayouts: 4000, // Seeded base payouts (exactly 40%)
    playCounts: {},
    losingStreaks: {}
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Load telemetry and leaderboard from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedTelemetry = localStorage.getItem('ghostdaddy_casino_telemetry');
    if (storedTelemetry) {
      setTelemetry(JSON.parse(storedTelemetry));
    } else {
      // Seed default telemetry
      const initialTelemetry: CasinoTelemetry = {
        totalBets: 10000,
        totalPayouts: 4000,
        playCounts: {},
        losingStreaks: {}
      };
      localStorage.setItem('ghostdaddy_casino_telemetry', JSON.stringify(initialTelemetry));
      setTelemetry(initialTelemetry);
    }

    const storedLeaderboard = localStorage.getItem('ghostdaddy_casino_leaderboard');
    if (storedLeaderboard) {
      setLeaderboard(JSON.parse(storedLeaderboard));
    } else {
      localStorage.setItem('ghostdaddy_casino_leaderboard', JSON.stringify(DEFAULT_LEADERBOARD));
      setLeaderboard(DEFAULT_LEADERBOARD);
    }
  }, []);

  const saveTelemetry = (updated: CasinoTelemetry) => {
    setTelemetry(updated);
    localStorage.setItem('ghostdaddy_casino_telemetry', JSON.stringify(updated));
  };

  const saveLeaderboard = (updated: LeaderboardEntry[]) => {
    setLeaderboard(updated);
    localStorage.setItem('ghostdaddy_casino_leaderboard', JSON.stringify(updated));
  };

  // Math Metrics
  const { totalBets, totalPayouts } = telemetry;
  const houseMargin = totalBets > 0 ? (totalBets - totalPayouts) / totalBets : 0.60;
  const availablePool = (0.40 * totalBets) - totalPayouts;

  /**
   * AI Balancing Rule Engine
   * Validates if a win of a certain size is currently permissible by the house safety protocols.
   */
  const checkWinAllowed = (username: string, betAmount: number, winPotential: number): boolean => {
    const nextTotalBets = totalBets + betAmount;
    const nextTotalPayouts = totalPayouts + winPotential;
    const nextHouseMargin = (nextTotalBets - nextTotalPayouts) / nextTotalBets;

    // RULE 1: House margin must NEVER drop below 60%.
    if (nextHouseMargin < 0.60) {
      // If we are strictly below 60%, reject the high win potential
      return false;
    }

    // RULE 2: Available Pool check
    if (winPotential > availablePool + betAmount) {
      return false;
    }

    // RULE 3: Regular player loyalty bias
    // Players who invest multiple times regardless of size MUST win periodically.
    const plays = telemetry.playCounts[username] || 0;
    const streak = telemetry.losingStreaks[username] || 0;
    if (plays > 8 && streak > 4) {
      // If a regular player has lost multiple times consecutively, we bypass default random failure
      // to guarantee they win at least a small reward
      return true;
    }

    return true;
  };

  /**
   * Processes a wager, deducts from user profile, and registers the bet.
   */
  const processBet = (betAmount: number): boolean => {
    if (!user || user.driftCoins < betAmount || betAmount <= 0) return false;

    // Deduct coins from user balance
    addCoins(-betAmount);

    // Update telemetry
    const username = user.username;
    const updatedTelemetry: CasinoTelemetry = {
      ...telemetry,
      totalBets: telemetry.totalBets + betAmount,
      playCounts: {
        ...telemetry.playCounts,
        [username]: (telemetry.playCounts[username] || 0) + 1
      },
      losingStreaks: {
        ...telemetry.losingStreaks,
        [username]: (telemetry.losingStreaks[username] || 0) + 1
      }
    };
    saveTelemetry(updatedTelemetry);
    return true;
  };

  /**
   * Processes a hand/spin payout, updates telemetry and leaderboard, and updates user coins.
   */
  const processPayout = (winAmount: number, isWin: boolean) => {
    if (!user) return;
    const username = user.username;

    let updatedLosingStreak = telemetry.losingStreaks[username] || 0;
    if (isWin && winAmount > 0) {
      updatedLosingStreak = 0; // reset losing streak
      addCoins(winAmount);
    }

    const updatedTelemetry: CasinoTelemetry = {
      ...telemetry,
      totalPayouts: telemetry.totalPayouts + winAmount,
      losingStreaks: {
        ...telemetry.losingStreaks,
        [username]: updatedLosingStreak
      }
    };
    saveTelemetry(updatedTelemetry);

    // Update leaderboard if the win is significant
    if (isWin && winAmount >= 100) {
      updateLeaderboard(username, winAmount);
    }
  };

  const updateLeaderboard = (username: string, winAmount: number) => {
    const dateStr = new Date().toISOString().split('T')[0];
    const index = leaderboard.findIndex(l => l.username.toLowerCase() === username.toLowerCase());

    let updatedLeaderboard = [...leaderboard];
    if (index !== -1) {
      const entry = updatedLeaderboard[index];
      updatedLeaderboard[index] = {
        ...entry,
        totalWon: entry.totalWon + winAmount,
        biggestWin: Math.max(entry.biggestWin, winAmount),
        lastWinDate: dateStr
      };
    } else {
      updatedLeaderboard.push({
        username,
        totalWon: winAmount,
        biggestWin: winAmount,
        lastWinDate: dateStr
      });
    }

    // Sort by total won and slice top 20
    updatedLeaderboard.sort((a, b) => b.totalWon - a.totalWon);
    updatedLeaderboard = updatedLeaderboard.slice(0, 20);
    saveLeaderboard(updatedLeaderboard);
  };

  const getLeaderboard = () => {
    return leaderboard;
  };

  const addManualWin = (username: string, winAmount: number) => {
    updateLeaderboard(username, winAmount);
  };

  return (
    <CasinoContext.Provider value={{
      totalBets,
      totalPayouts,
      houseMargin,
      availablePool,
      leaderboard,
      checkWinAllowed,
      processBet,
      processPayout,
      getLeaderboard,
      addManualWin
    }}>
      {children}
    </CasinoContext.Provider>
  );
}

export function useCasino() {
  const context = useContext(CasinoContext);
  if (!context) {
    throw new Error('useCasino must be used within a CasinoProvider');
  }
  return context;
}
