export interface MissionObjective {
  step: string;
  icon: string;
  label: 'PRIMARY' | 'SECONDARY' | 'BONUS';
  text: string;
}

export interface MissionControl {
  key: string;
  action: string;
}

export type MissionStatus = 'AVAILABLE' | 'LOCKED' | 'COMING_SOON' | 'COMPLETED' | 'IN_PROGRESS';

export interface MissionData {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  operation: string;
  season: string;
  status: MissionStatus;
  playable: boolean;
  mapImage: string;
  heroImage: string;
  themeColor: string;
  glowColor: string;
  accentColor: string;
  borderGlow: string;
  bgGradient: string;
  classification: string;
  environment: string;
  threat: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH' | 'EXTREME';
  enemyCount: string;
  timeLimit: string;
  rewardXP: number;
  rewardIntel: string;
  estimatedDuration: string;
  narrativeBriefing: string;
  objectives: MissionObjective[];
  intel: string[];
  recommendedLoadout: {
    primary: string;
    secondary: string;
    tactical: string;
    equipment: string;
  };
  controls: MissionControl[];
}

export const MISSIONS_DATA: MissionData[] = [
  {
    id: 'snowblow',
    code: 'SW-07',
    name: 'SNOWBLOW',
    subtitle: 'Arctic Research Outpost Zero',
    operation: 'OPERATION: WHITEOUT',
    season: 'FLAGSHIP SECTOR',
    status: 'AVAILABLE',
    playable: true,
    mapImage: '/map_snowblow.png',
    heroImage: '/map_snowblow.png',
    themeColor: '#00f0ff',
    glowColor: 'rgba(0,240,255,0.35)',
    accentColor: '#88eeff',
    bgGradient: 'from-[#00101a] via-[#000d14] to-[#05070a]',
    borderGlow: 'shadow-[0_0_40px_rgba(0,240,255,0.25)]',
    classification: 'TOP SECRET // FROZEN PROTOCOL',
    environment: 'Arctic tundra, −28°C, active blizzard, visibility 25m',
    threat: 'EXTREME',
    enemyCount: '6 GUARDS + 2 SNIPERS',
    timeLimit: '12:00',
    rewardXP: 900,
    rewardIntel: 'CLASSIFIED_DATA_DRIVE_07',
    estimatedDuration: '10-15 MINS',
    narrativeBriefing: 'A tactical reconnaissance team has gone silent inside Arctic Outpost Zero. Infiltrate the frozen compound, retrieve classified server drives, rescue trapped research personnel, and reach the helipad extraction zone before whiteout conditions collapse all communications.',
    objectives: [
      { step: '01', icon: '💾', label: 'PRIMARY', text: 'Breach the research lab server room on Floor 2 and extract the classified data drive.' },
      { step: '02', icon: '🚁', label: 'SECONDARY', text: 'Reach the helipad extraction zone without triggering rooftop sniper alerts.' },
      { step: '03', icon: '❄️', label: 'BONUS', text: 'Disable the thermal camera array to earn the "Ghost Protocol" commendation.' },
    ],
    intel: [
      'Rooftop snipers rotate 180° every 45 seconds — use snowdrift cover to advance.',
      'The underground bunker tunnel connects the lab to the barracks — use for silent flanking.',
      'Frozen lake crossing (SW sector) is exposed — only attempt during blizzard whiteout.',
    ],
    recommendedLoadout: {
      primary: 'Silenced DMR Carbine (3-Burst)',
      secondary: 'Suppressed Sidearm',
      tactical: 'Thermal Goggles [T]',
      equipment: 'Arctic Stealth Suit',
    },
    controls: [
      { key: 'WASD', action: 'Move operative' },
      { key: 'MOUSE', action: 'Aim / Look' },
      { key: 'LMB', action: 'Shoot' },
      { key: 'R', action: 'Reload' },
      { key: 'SHIFT', action: 'Sprint / Hold Breath' },
      { key: 'C / CTRL', action: 'Crouch / Slide' },
      { key: 'Z', action: 'Prone stance' },
      { key: 'T', action: 'Toggle Thermal Goggles' },
      { key: 'N', action: 'Toggle Night Vision' },
      { key: 'F', action: 'Toggle Silencer Suppressor' },
    ],
  },
  {
    id: 'forestfun',
    code: 'FF-13',
    name: 'FORESTFUN',
    subtitle: 'Dense Woodland Combat Zone',
    operation: 'OPERATION: DARK CANOPY',
    season: 'SEASON 02',
    status: 'LOCKED',
    playable: false,
    mapImage: '/map_forestfun.png',
    heroImage: '/map_forestfun.png',
    themeColor: '#4ade80',
    glowColor: 'rgba(74,222,128,0.35)',
    accentColor: '#86efac',
    bgGradient: 'from-[#001a08] via-[#000d05] to-[#05070a]',
    borderGlow: 'shadow-[0_0_40px_rgba(74,222,128,0.2)]',
    classification: 'CLASSIFIED // RECON PENDING',
    environment: 'Temperate forest, −5°C, night op, rain, 15m visibility',
    threat: 'VERY HIGH',
    enemyCount: '8 GUARDS + 3 PATROL DOGS',
    timeLimit: '10:00',
    rewardXP: 1000,
    rewardIntel: 'FUEL_DEPOT_SCHEMATIC',
    estimatedDuration: '12-18 MINS',
    narrativeBriefing: 'Enemy supply networks use dense woodland cover to transport heavy munitions. Plant explosive charges at the central logging camp fuel depot and extract via river bridge before patrol hounds pinpoint your scent.',
    objectives: [
      { step: '01', icon: '💥', label: 'PRIMARY', text: 'Plant explosive charge at the logging camp fuel depot.' },
      { step: '02', icon: '🌉', label: 'SECONDARY', text: 'Reach extraction at river bridge before countdown expires.' },
      { step: '03', icon: '🐕', label: 'BONUS', text: 'Neutralize patrol dogs silently to prevent compound alert.' },
    ],
    intel: [
      'Night operation — enemy guards carry flashlights. Stay out of light beams.',
      'Patrol dogs detect scent — move downwind when navigating around kennels.',
    ],
    recommendedLoadout: {
      primary: 'Suppressed Submachine Gun',
      secondary: 'Combat Blade',
      tactical: 'Night Vision Goggles [N]',
      equipment: 'Ghillie Camouflage',
    },
    controls: [
      { key: 'WASD', action: 'Move operative' },
      { key: 'MOUSE', action: 'Aim / Look' },
      { key: 'LMB', action: 'Attack' },
    ],
  },
  {
    id: 'cargology',
    code: 'CG-22',
    name: 'CARGOLOGY',
    subtitle: 'Industrial Cargo Terminal',
    operation: 'OPERATION: IRON HARBOUR',
    season: 'SEASON 03',
    status: 'LOCKED',
    playable: false,
    mapImage: '/map_cargology.png',
    heroImage: '/map_cargology.png',
    themeColor: '#ff6600',
    glowColor: 'rgba(255,102,0,0.35)',
    accentColor: '#ffaa44',
    bgGradient: 'from-[#1a0800] via-[#0d0500] to-[#05070a]',
    borderGlow: 'shadow-[0_0_40px_rgba(255,102,0,0.2)]',
    classification: 'CLASSIFIED // RECON PENDING',
    environment: 'Industrial docklands, +12°C, sodium lighting, smog',
    threat: 'VERY HIGH',
    enemyCount: '10 GUARDS + 2 TURRETS',
    timeLimit: '15:00',
    rewardXP: 1200,
    rewardIntel: 'HARBOUR_MANIFEST_KEY',
    estimatedDuration: '15-20 MINS',
    narrativeBriefing: 'Breach the main warehouse, rescue 3 hostage scientists, navigate shipping container mazes, and secure extraction trucks before heavy reinforcements block the dock perimeter.',
    objectives: [
      { step: '01', icon: '🧑‍🔬', label: 'PRIMARY', text: 'Breach warehouse and rescue 3 hostage scientists.' },
      { step: '02', icon: '🚚', label: 'SECONDARY', text: 'Navigate container maze to north gate extraction truck.' },
      { step: '03', icon: '💣', label: 'BONUS', text: 'Destroy oil tanker fuel line to block reinforcements.' },
    ],
    intel: [
      'Container corridors create tight CQC zones — weapon control is critical.',
      'Moving freight train cuts across central route — time your crossing.',
    ],
    recommendedLoadout: {
      primary: 'Tactical Carbine Rifle',
      secondary: 'Heavy Pistol',
      tactical: 'Flashbang Grenades',
      equipment: 'Body Armor Vest',
    },
    controls: [
      { key: 'WASD', action: 'Move operative' },
      { key: 'MOUSE', action: 'Aim / Look' },
    ],
  },
  {
    id: 'sandbath',
    code: 'SB-44',
    name: 'SANDBATH',
    subtitle: 'Desert Military Compound',
    operation: 'OPERATION: SCORCHED EARTH',
    season: 'SEASON 04',
    status: 'LOCKED',
    playable: false,
    mapImage: '/map_sandbath.png',
    heroImage: '/map_sandbath.png',
    themeColor: '#ff9f00',
    glowColor: 'rgba(255,159,0,0.35)',
    accentColor: '#ffcc44',
    bgGradient: 'from-[#1a0e00] via-[#0d0700] to-[#05070a]',
    borderGlow: 'shadow-[0_0_40px_rgba(255,159,0,0.2)]',
    classification: 'CLASSIFIED // RECON PENDING',
    environment: 'Arid desert, +42°C, golden-hour sun, long shadows',
    threat: 'HIGH',
    enemyCount: '4 GUARDS',
    timeLimit: '08:00',
    rewardXP: 500,
    rewardIntel: 'DESERT_OUTPOST_MAP',
    estimatedDuration: '8-10 MINS',
    narrativeBriefing: 'Infiltrate arid desert ruins, neutralize perimeter patrols, collect tactical telemetry clues, and extract at the designated smoke flare beacon.',
    objectives: [
      { step: '01', icon: '🎯', label: 'PRIMARY', text: 'Eliminate hostile guards within compound perimeter.' },
      { step: '02', icon: '🏃', label: 'SECONDARY', text: 'Reach smoke flare extraction zone in north sector.' },
    ],
    intel: [
      'Enemy patrols rotate clockwise — intercept during blind-spot transitions.',
    ],
    recommendedLoadout: {
      primary: 'Marksmanship Rifle',
      secondary: 'Standard Sidearm',
      tactical: 'Smoke Grenade',
      equipment: 'Desert Camo Suit',
    },
    controls: [
      { key: 'WASD', action: 'Move operative' },
    ],
  },
];

export function getMissionById(id: string): MissionData {
  return MISSIONS_DATA.find(m => m.id === id) || MISSIONS_DATA[0];
}
