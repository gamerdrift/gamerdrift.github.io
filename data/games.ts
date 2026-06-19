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
    embedUrl: "/games/rogueghost/hd.html",
    category: "Action",
    description: "3D Third-Person Tactical Infiltration / Stealth Action game. Infiltrate secure vaults, avoid patrol guards, rescue hostages and extract."
  }
];
