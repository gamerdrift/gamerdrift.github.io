export interface Game {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  isExternal?: boolean;
  embedUrl?: string;
  description?: string;
  category: 'Arcade' | 'Puzzle' | 'Shooting' | 'Casual' | 'Action' | 'Retro' | 'Casino' | 'Racing';
}

export const games: Game[] = [
  {
    id: "rogue-ghost",
    title: "Rogue Ghost 3D",
    thumbnail: "/rogue_ghost_character.png",
    url: "/play/rogue-ghost/",
    isExternal: true,
    embedUrl: "/games/rogueghost/index.html",
    category: "Action",
    description: "3D Third-Person Tactical Infiltration / Stealth Action game. Infiltrate secure vaults, avoid patrol guards, rescue hostages and extract."
  },
  {
    id: "captn-ghost",
    title: "Captain Ghost 3D",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&h=500&q=80",
    url: "/play/captn-ghost/",
    isExternal: false,
    category: "Shooting",
    description: "Engage enemy hostiles in this Three.js-based 3D tactical shooter. Survive stages, manage ammo, and defeat high-value targets."
  },
  {
    id: "space-invaders",
    title: "Space Invaders Retro",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&h=500&q=80",
    url: "/play/space-invaders/",
    isExternal: false,
    category: "Retro",
    description: "Defend the galaxy from waves of descending alien invaders in this classic retro shooter clone."
  },
  {
    id: "tetris",
    title: "Block Cascade (Tetris)",
    thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&h=500&q=80",
    url: "/play/tetris/",
    isExternal: false,
    category: "Puzzle",
    description: "Stack falling blocks to clear horizontal lines. A modern cyberpunk spin on the classic block-fitting puzzle game."
  },
  {
    id: "snake",
    title: "Cyber Snake",
    thumbnail: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=400&h=500&q=80",
    url: "/play/snake/",
    isExternal: false,
    category: "Casual",
    description: "Guide your digital neon serpent to consume data packets and grow longer, avoiding the grid boundaries and your own tail."
  },
  {
    id: "retro-racer",
    title: "Vector Drift Racer",
    thumbnail: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=400&h=500&q=80",
    url: "/play/retro-racer/",
    isExternal: false,
    category: "Racing",
    description: "Drift through futuristic vector tracks. Avoid obstacles, hit nitro boosts, and beat the clock in this retro racing simulation."
  },
  {
    id: "pixel-platformer",
    title: "Pixel Platformer",
    thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=400&h=500&q=80",
    url: "/play/pixel-platformer/",
    isExternal: false,
    category: "Action",
    description: "Navigate hazard-filled grid networks, collect power-ups, and reach the secure portal in this retro-styled platformer."
  },
  {
    id: "2048",
    title: "Neon 2048",
    thumbnail: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&h=500&q=80",
    url: "/play/2048/",
    isExternal: false,
    category: "Puzzle",
    description: "Slide tiles on a 4x4 grid to merge matching numbers and reach the ultimate 2048 tile."
  }
];
