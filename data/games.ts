export interface Game {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  isExternal?: boolean;
  embedUrl?: string;
  description?: string;
  category: 'Arcade' | 'Puzzle' | 'Shooting' | 'Casual' | 'Action' | 'Retro' | 'Casino' | 'Racing' | 'Strategy';
}

const buildPlayableGame = (
  id: string,
  title: string,
  thumbnail: string,
  description: string,
  category: Game['category'],
  embedUrl?: string
): Game => ({
  id,
  title,
  thumbnail,
  url: `/play/${id}/`,
  isExternal: true,
  embedUrl: embedUrl ?? `/games/mission-runner.html?gameId=${id}&title=${encodeURIComponent(title)}`,
  description,
  category,
});

export const games: Game[] = [
  buildPlayableGame(
    'rogue-ghost',
    'Rogue Ghost 3D',
    '/rogue_ghost_character.png',
    '3D Third-Person Tactical Infiltration / Stealth Action game. Infiltrate secure vaults, avoid patrol guards, rescue hostages and extract.',
    'Action'
  ),
  buildPlayableGame(
    'chess-master',
    'Chess Master',
    '/games/chess-poster.svg',
    'A premium tactical chess experience with AI opposition, rapid match flow, and a cinematic eSports presentation built for desktop, tablet, and mobile.',
    'Strategy',
    '/games/chess-master.html'
  ),
  buildPlayableGame(
    'neon-overdrive',
    'Neon Overdrive: Protocol Zero',
    '/cyberpunk.png',
    'A neon-soaked cyberpunk mission where you infiltrate a hostile mainframe and survive the digital storm.',
    'Arcade'
  ),
  buildPlayableGame(
    'star-vanguard-inf',
    'Star Vanguard: Infinity',
    '/scifi.png',
    'Command a starfighter through a hostile orbital warzone and defend the last beacon in the sector.',
    'Shooting'
  ),
  buildPlayableGame(
    'elder-quest-rune',
    'Elder Quest: Runeblade',
    '/fantasy.png',
    'A high-fidelity fantasy dungeon run with ancient runes, elite guardians, and devastating boss battles.',
    'Action'
  ),
  buildPlayableGame(
    'blacksite-zh',
    'Blacksite: Zero Hour',
    '/tactical.png',
    'Storm a tactical blacksite, rescue the hostages, and extract before the counterstrike arrives.',
    'Shooting'
  ),
  buildPlayableGame(
    'neon-syndicate-drift',
    'Neon Syndicate: Drift',
    '/cyberpunk.png',
    'Take the underground neon drag route, outpace rival racers, and dominate the city grid.',
    'Racing'
  ),
  buildPlayableGame(
    'void-walker-ds',
    'Void Walker: Deep Space',
    '/scifi.png',
    'Survive the event horizon and unlock the hidden core of a broken starship corridor.',
    'Arcade'
  ),
  buildPlayableGame(
    'blood-steel-valor',
    'Blood & Steel: Valor',
    '/fantasy.png',
    'Storm the northern fortress and seize the throne in a brutal melee campaign.',
    'Action'
  ),
  buildPlayableGame(
    'ghost-recon-sv',
    'Ghost Recon: Silent Vow',
    '/tactical.png',
    'Execute a silent breach through enemy towers and take control of the compromised perimeter.',
    'Shooting'
  ),
  buildPlayableGame(
    'glitch-system-reb',
    'Glitch in the System: Rebellion',
    '/cyberpunk.png',
    'Hack the district network and break through the synthetic security grid in this neon puzzle run.',
    'Puzzle'
  ),
  buildPlayableGame(
    'galactic-empire-citadel',
    'Galactic Empire: Citadel',
    '/scifi.png',
    'Deploy fleets across a war-torn galaxy and conquer the nexus world before your rivals.',
    'Strategy'
  ),
  buildPlayableGame(
    'cyber-punisher-ret',
    'Cyber Punisher: Retribution',
    '/cyberpunk.png',
    'A fast, brutal cyberpunk revenge mission where every strike pushes you closer to the core target.',
    'Action'
  ),
  buildPlayableGame(
    'quantum-singularity-beyond',
    'Quantum Singularity: Beyond',
    '/scifi.png',
    'Use gravitic weaponry to stabilize a collapsing quantum core and survive the singularity collapse.',
    'Arcade'
  ),
  buildPlayableGame(
    'rune-wardens-chron',
    'Rune Wardens: Chronicles',
    '/fantasy.png',
    'Gather relics, break spell wards, and restore the shattered runic balance in this magical action quest.',
    'Action'
  ),
  buildPlayableGame(
    'apex-cmd-zeus',
    'Apex Command: Operation Zeus',
    '/tactical.png',
    'Command a strike squad through a real-time tactical assault and seize the critical military assets.',
    'Shooting'
  ),
  buildPlayableGame(
    'synthetic-horizon-evol',
    'Synthetic Horizon: Evolution',
    '/cyberpunk.png',
    'Fight through an AI-controlled megacity and fracture the central core before it adapts again.',
    'Action'
  ),
  buildPlayableGame(
    'event-horizon-ext',
    'Event Horizon: Extraction',
    '/scifi.png',
    'Recover the crew, survive the corrupted station, and escape the falling event horizon.',
    'Arcade'
  ),
  buildPlayableGame(
    'shadow-colossus-reborn',
    'Shadow of Colossus: Reborn',
    '/fantasy.png',
    'Climb colossal ruins, shatter ancient guardians, and end the curse at the heart of the mountain.',
    'Action'
  ),
  buildPlayableGame(
    'zero-hour-sabotage',
    'Zero Hour: Sabotage',
    '/tactical.png',
    'Infiltrate the enemy stronghold, disable the signal relay, and blast your way to extraction.',
    'Shooting'
  ),
];

export function resolveGame(id: string): Game | undefined {
  const normalizedId = id?.toLowerCase();
  return games.find((game) => game.id.toLowerCase() === normalizedId);
}
