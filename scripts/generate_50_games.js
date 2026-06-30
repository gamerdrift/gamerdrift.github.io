const fs = require('fs');
const path = './app/moregames/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const baseGames = [
  { name: 'CYBER RUNNER 2077', sub: 'Neon City Streets - Action RPG', theme: '#00f0ff', img: '/cyberpunk.png' },
  { name: 'STAR VANGUARD', sub: 'Deep Space Combat Simulator', theme: '#ff9f00', img: '/scifi.png' },
  { name: 'ELDER QUEST', sub: 'Dark Fantasy Open World', theme: '#a855f7', img: '/fantasy.png' },
  { name: 'BLACKSITE: ZERO', sub: 'Tier 1 Tactical Shooter', theme: '#39ff14', img: '/tactical.png' },
  { name: 'NEON SYNDICATE', sub: 'Underground Street Racing', theme: '#ff0055', img: '/cyberpunk.png' },
  { name: 'VOID WALKER', sub: 'Space Exploration Survival', theme: '#00f0ff', img: '/scifi.png' },
  { name: 'BLOOD & STEEL', sub: 'Medieval Combat Simulator', theme: '#ff9f00', img: '/fantasy.png' },
  { name: 'GHOST RECON: ELITE', sub: 'Covert Operations', theme: '#a855f7', img: '/tactical.png' },
  { name: 'GLITCH IN THE SYSTEM', sub: 'Cyberpunk Puzzle Platformer', theme: '#39ff14', img: '/cyberpunk.png' },
  { name: 'GALACTIC EMPIRE', sub: '4X Grand Strategy', theme: '#ff0055', img: '/scifi.png' }
];

let generatedGames = [];
for (let i = 0; i < 50; i++) {
  const base = baseGames[i % 10];
  generatedGames.push({
    id: `game-${i + 1}`,
    name: `${base.name} ${Math.floor(i / 10) > 0 ? 'V' + (Math.floor(i / 10) + 1) : ''}`.trim(),
    subtitle: base.sub,
    status: 'ACTIVE // PLAYABLE',
    statusColor: base.theme,
    image: base.img,
    themeColor: base.theme,
    threat: 'HIGH',
    enemies: 'VARIOUS',
    objective: 'COMPLETE THE MISSION'
  });
}

const mockGamesString = 'const MOCK_GAMES: GameMetadata[] = ' + JSON.stringify(generatedGames, null, 2) + ';';

content = content.replace(/const MOCK_GAMES: GameMetadata\[\] = \[[\s\S]*?\];/, mockGamesString);
fs.writeFileSync(path, content);
console.log('Successfully updated to 50 games');
