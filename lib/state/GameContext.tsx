"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { games as initialGames, Game } from '../../data/games';

export interface GameComment {
  id: string;
  username: string;
  rating: number;
  text: string;
  date: string;
}

export interface GameSubmission extends Game {
  approved: boolean;
  submittedBy: string;
  submittedAt: string;
  plays: number;
  rating: number;
  ratingsCount: number;
}

interface GameContextType {
  games: GameSubmission[];
  favorites: string[];
  history: string[];
  comments: Record<string, GameComment[]>;
  addFavorite: (gameId: string) => void;
  removeFavorite: (gameId: string) => void;
  isFavorite: (gameId: string) => boolean;
  addToHistory: (gameId: string) => void;
  submitGame: (gameData: Omit<Game, 'id'>, username: string) => void;
  approveSubmission: (gameId: string) => void;
  rejectSubmission: (gameId: string) => void;
  addComment: (gameId: string, username: string, rating: number, text: string) => void;
  incrementPlayCount: (gameId: string) => void;
  rateGame: (gameId: string, rating: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [games, setGames] = useState<GameSubmission[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [comments, setComments] = useState<Record<string, GameComment[]>>({});

  // 1. Load Initial and LocalStorage State
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Cache-bust: if stored games contain any non-rogue-ghost static IDs, wipe and reseed
    const storedGames = localStorage.getItem('gamerdrift_games');
    const CURRENT_VERSION = 'rogue-ghost-only-v1';
    const storedVersion = localStorage.getItem('gamerdrift_version');
    if (storedVersion !== CURRENT_VERSION) {
      localStorage.removeItem('gamerdrift_games');
      localStorage.removeItem('gamerdrift_comments');
      localStorage.setItem('gamerdrift_version', CURRENT_VERSION);
    }
    let loadedGames: GameSubmission[] = [];

    if (storedGames) {
      const parsedGames: GameSubmission[] = JSON.parse(storedGames);
      // Synchronize localStorage games list with data/games.ts static list.
      // 1. Keep custom submissions (their IDs start with 'submitted-game-')
      const customSubmissions = parsedGames.filter(g => g.id.startsWith('submitted-game-'));
      
      // 2. Keep static games only if they are present in the current data/games.ts array,
      // and update their metadata to match initialGames in case we corrected IDs/urls/descriptions.
      const initialGamesMap = new Map(initialGames.map(g => [g.id, g]));
      const existingStaticGames = parsedGames.filter(g => initialGamesMap.has(g.id));
      
      const updatedStaticGames = initialGames.map(ig => {
        const existing = existingStaticGames.find(eg => eg.id === ig.id);
        return {
          ...ig,
          approved: true,
          submittedBy: existing?.submittedBy || 'System',
          submittedAt: existing?.submittedAt || new Date('2026-05-01').toISOString(),
          plays: existing?.plays ?? (Math.floor(Math.random() * 5000) + 1200),
          rating: existing?.rating ?? Number((4.0 + Math.random() * 0.9).toFixed(1)),
          ratingsCount: existing?.ratingsCount ?? (Math.floor(Math.random() * 200) + 45)
        };
      });

      loadedGames = [...updatedStaticGames, ...customSubmissions];
      localStorage.setItem('gamerdrift_games', JSON.stringify(loadedGames));
    } else {
      // Map static games to extend play count, ratings, and approved status
      loadedGames = initialGames.map(g => ({
        ...g,
        approved: true,
        submittedBy: 'System',
        submittedAt: new Date('2026-05-01').toISOString(),
        plays: Math.floor(Math.random() * 5000) + 1200,
        rating: Number((4.0 + Math.random() * 0.9).toFixed(1)),
        ratingsCount: Math.floor(Math.random() * 200) + 45
      }));
      localStorage.setItem('gamerdrift_games', JSON.stringify(loadedGames));
    }
    setGames(loadedGames);

    // Load Favorites
    const storedFavorites = localStorage.getItem('gamerdrift_favorites');
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites));

    // Load History
    const storedHistory = localStorage.getItem('gamerdrift_history');
    if (storedHistory) setHistory(JSON.parse(storedHistory));

    // Load Comments
    const storedComments = localStorage.getItem('gamerdrift_comments');
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    } else {
      // Pre-seed some mock reviews for RogueGhost
      const seededComments: Record<string, GameComment[]> = {
        'rogue-ghost': [
          { id: '1', username: 'Hex_Netrunner', rating: 5, text: 'Insane stealth mechanics. The Sandbath sector AI is brutal!', date: new Date('2026-06-10').toLocaleDateString() },
          { id: '2', username: 'GhostInGrid', rating: 5, text: 'Best browser tactical game I have ever played. Triple-A quality.', date: new Date('2026-06-12').toLocaleDateString() },
          { id: '3', username: 'Desert_Fox', rating: 4, text: 'Smooth controls. Cargology map is my favourite sector.', date: new Date('2026-06-13').toLocaleDateString() }
        ]
      };
      setComments(seededComments);
      localStorage.setItem('gamerdrift_comments', JSON.stringify(seededComments));
    }
  }, []);

  // 2. Favorite Management
  const addFavorite = (gameId: string) => {
    setFavorites(prev => {
      if (prev.includes(gameId)) return prev;
      const updated = [...prev, gameId];
      localStorage.setItem('gamerdrift_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFavorite = (gameId: string) => {
    setFavorites(prev => {
      const updated = prev.filter(id => id !== gameId);
      localStorage.setItem('gamerdrift_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (gameId: string) => favorites.includes(gameId);

  // 3. Play History Management
  const addToHistory = (gameId: string) => {
    setHistory(prev => {
      const filtered = prev.filter(id => id !== gameId);
      const updated = [gameId, ...filtered].slice(0, 10); // Keep last 10 games
      localStorage.setItem('gamerdrift_history', JSON.stringify(updated));
      return updated;
    });
    incrementPlayCount(gameId);
  };

  // 4. Ingest and Moderate Game Submissions
  const submitGame = (gameData: Omit<Game, 'id'>, username: string) => {
    const newId = `submitted-game-${Date.now()}`;
    const newSubmission: GameSubmission = {
      ...gameData,
      id: newId,
      url: `/play/${newId}/`,
      approved: false, // Must be approved by Admin
      submittedBy: username,
      submittedAt: new Date().toISOString(),
      plays: 0,
      rating: 0,
      ratingsCount: 0
    };

    setGames(prev => {
      const updated = [...prev, newSubmission];
      localStorage.setItem('gamerdrift_games', JSON.stringify(updated));
      return updated;
    });
  };

  const approveSubmission = (gameId: string) => {
    setGames(prev => {
      const updated = prev.map(game => {
        if (game.id === gameId) {
          return { ...game, approved: true };
        }
        return game;
      });
      localStorage.setItem('gamerdrift_games', JSON.stringify(updated));
      return updated;
    });
  };

  const rejectSubmission = (gameId: string) => {
    setGames(prev => {
      const updated = prev.filter(game => game.id !== gameId);
      localStorage.setItem('gamerdrift_games', JSON.stringify(updated));
      return updated;
    });
  };

  // 5. Comments, Play counts & Rating Actions
  const addComment = (gameId: string, username: string, rating: number, text: string) => {
    const newComment: GameComment = {
      id: `comment-${Date.now()}`,
      username,
      rating,
      text,
      date: new Date().toLocaleDateString()
    };

    setComments(prev => {
      const gameComments = prev[gameId] || [];
      const updated = {
        ...prev,
        [gameId]: [newComment, ...gameComments]
      };
      localStorage.setItem('gamerdrift_comments', JSON.stringify(updated));
      return updated;
    });

    // Automatically recalculate rating average for the game
    rateGame(gameId, rating);
  };

  const incrementPlayCount = (gameId: string) => {
    setGames(prev => {
      const updated = prev.map(game => {
        if (game.id === gameId) {
          return { ...game, plays: game.plays + 1 };
        }
        return game;
      });
      localStorage.setItem('gamerdrift_games', JSON.stringify(updated));
      return updated;
    });
  };

  const rateGame = (gameId: string, userRating: number) => {
    setGames(prev => {
      const updated = prev.map(game => {
        if (game.id === gameId) {
          const totalRatingSum = (game.rating * game.ratingsCount) + userRating;
          const newCount = game.ratingsCount + 1;
          const newAvg = Number((totalRatingSum / newCount).toFixed(1));
          return { ...game, rating: newAvg, ratingsCount: newCount };
        }
        return game;
      });
      localStorage.setItem('gamerdrift_games', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <GameContext.Provider value={{
      games,
      favorites,
      history,
      comments,
      addFavorite,
      removeFavorite,
      isFavorite,
      addToHistory,
      submitGame,
      approveSubmission,
      rejectSubmission,
      addComment,
      incrementPlayCount,
      rateGame
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGames() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
}
