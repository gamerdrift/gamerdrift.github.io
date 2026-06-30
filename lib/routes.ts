export function getPlayUrl(gameId: string, mission?: string) {
  return mission
    ? `/play/${gameId}/?mission=${encodeURIComponent(mission)}`
    : `/play/${gameId}/`;
}

export const ROGUE_GHOST_DEFAULT_MISSION = 'snowblow';
