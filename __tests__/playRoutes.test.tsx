import { games } from '../data/games';

describe('play route registry', () => {
  it('registers the featured More Games ids so they can be launched', () => {
    const ids = new Set(games.map((game) => game.id));

    ['neon-overdrive', 'star-vanguard-inf', 'elder-quest-rune'].forEach((id) => {
      expect(ids.has(id)).toBe(true);
    });
  });
});
