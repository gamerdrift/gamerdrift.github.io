// scripts/generate_dummy_games.js
// Generates placeholder game data (public‑domain style) for the UI.

const fs = require('fs');
const path = require('path');

function createDummyGames(count = 100) {
  const games = [];
  for (let i = 1; i <= count; i++) {
    games.push({
      id: `game-${i}`,
      title: `Demo Game ${i}`,
      description: `Placeholder demo game #${i}. Replace with real game URL later.`,
      thumbnail: `https://via.placeholder.com/1920x1080?text=Game+${i}`,
      gameUrl: `https://example.com/dummy-game-${i}.html`,
      tags: ['demo', 'placeholder'],
      license: 'Public Domain',
    });
  }
  return games;
}

const outDir = path.join(__dirname, '..', 'public_data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'games.json');
fs.writeFileSync(outPath, JSON.stringify(createDummyGames(100), null, 2), 'utf8');
console.log(`Generated 100 dummy games at ${outPath}`);
