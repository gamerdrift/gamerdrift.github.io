const fs = require('fs');
const path = './app/moregames/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const gamesList = [
  {
    id: 'neon-overdrive',
    name: 'NEON OVERDRIVE: PROTOCOL ZERO',
    subtitle: 'Cyberpunk Action RPG // Unreal Engine 5.5 Nanite & Lumen // Real-Time RTX Path Tracing // High-Def Graphics',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#00f0ff',
    image: '',
    themeColor: '#00f0ff',
    threat: 'CRITICAL',
    enemies: 'MEGACORP ENFORCERS',
    objective: 'INFILTRATE SECURE MAINFRAME'
  },
  {
    id: 'star-vanguard-inf',
    name: 'STAR VANGUARD: INFINITY',
    subtitle: 'Deep Space Combat Simulator // Photorealistic 4K HDR Cosmic Assets // Volumetric Nebulae // AAA Fidelity',
    status: 'BETA // EARLY ACCESS',
    statusColor: '#ff9f00',
    image: '',
    themeColor: '#ff9f00',
    threat: 'EXTREME',
    enemies: 'ALIEN ARMADA & REAPERS',
    objective: 'DEFEND THE ORBITAL SHIPYARDS'
  },
  {
    id: 'elder-quest-rune',
    name: 'ELDER QUEST: RUNEBLADE',
    subtitle: 'Open-World Dark Fantasy RPG // Ultra-High Definition 8K Photogrammetry // Dynamic Weather & Ray-Traced Shadowing',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#a855f7',
    image: '',
    themeColor: '#a855f7',
    threat: 'VERY HIGH',
    enemies: 'UNDEAD HORDE & DRAGONS',
    objective: 'SLAY THE CORRUPTED ELDER DRAGON'
  },
  {
    id: 'blacksite-zh',
    name: 'BLACKSITE: ZERO HOUR',
    subtitle: 'Tier 1 Tactical Military Shooter // 8K Scan Real-World Environments // High-Fidelity Weapon Audio // AAA Tactical',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '',
    themeColor: '#39ff14',
    threat: 'LETHAL',
    enemies: 'HOSTILE MERCENARIES',
    objective: 'RESCUE THE HOSTAGE LEADER & EXTRACT'
  },
  {
    id: 'neon-syndicate-drift',
    name: 'NEON SYNDICATE: DRIFT',
    subtitle: 'Next-Gen Street Racing // High-Definition Vehicle Tessellation // Volumetric Smoke FX // Cyberpunk Visuals',
    status: 'COMING SOON',
    statusColor: '#ff0055',
    image: '',
    themeColor: '#ff0055',
    threat: 'MODERATE',
    enemies: 'STREET RACER GANGS',
    objective: 'WIN THE UNDERGROUND METRO RACE'
  },
  {
    id: 'void-walker-ds',
    name: 'VOID WALKER: DEEP SPACE',
    subtitle: 'Cosmic Survival RPG // Advanced Particle Simulation // Procedural 4K Planetary Textures // AAA Sci-Fi',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#00f0ff',
    image: '',
    themeColor: '#00f0ff',
    threat: 'HIGH',
    enemies: 'SPACE PIRATES & FAUNA',
    objective: 'SURVIVE THE EVENT HORIZON'
  },
  {
    id: 'blood-steel-valor',
    name: 'BLOOD & STEEL: VALOR',
    subtitle: 'Medieval Melee Combat Simulator // PhysX Real-Time Armor Splintering // 4K Weapon Tessellation // AAA Historical',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#ff9f00',
    image: '',
    themeColor: '#ff9f00',
    threat: 'VERY HIGH',
    enemies: 'ROGUE WARLORDS & KNIGHTS',
    objective: 'CONQUER THE NORTHERN FORTRESS'
  },
  {
    id: 'ghost-recon-sv',
    name: 'GHOST RECON: SILENT VOW',
    subtitle: 'Open-World Tactical Stealth // Ray-Traced Foliage Occlusion // Thermal & Night-Vision Render Passes // AAA Stealth',
    status: 'ALPHA // TESTING',
    statusColor: '#a855f7',
    image: '',
    themeColor: '#a855f7',
    threat: 'EXTREME',
    enemies: 'ROGUE GHOST SQUADRONS',
    objective: 'SABOTAGE COMM TOWERS SILENTLY'
  },
  {
    id: 'glitch-system-reb',
    name: 'GLITCH IN THE SYSTEM: REBELLION',
    subtitle: 'Cyberpunk Puzzle Platformer // Ray-Traced Neon Wetness // Metahuman Physics Animations // Neon Style',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '',
    themeColor: '#39ff14',
    threat: 'LOW',
    enemies: 'SECURITY DRONES & SENTINELS',
    objective: 'HACK THE DISTRICT NETWORK'
  },
  {
    id: 'galactic-empire-citadel',
    name: 'GALACTIC EMPIRE: CITADEL',
    subtitle: 'AAA 4X Strategic Space War // DLSS 3.5 Ray Reconstruction // Massive Scale Space Fleets // Sci-Fi strategy',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#ff0055',
    image: '',
    themeColor: '#ff0055',
    threat: 'HIGH',
    enemies: 'RIVAL GALACTIC EMPIRES',
    objective: 'COLONIZE THE NEXUS PRIME PLANET'
  },
  {
    id: 'cyber-punisher-ret',
    name: 'CYBER PUNISHER: RETRIBUTION',
    subtitle: 'Next-Gen Cyberpunk Slasher // Photorealistic Katana Combat // 240Hz High Refresh Logic // AAA Combat',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#00f0ff',
    image: '',
    themeColor: '#00f0ff',
    threat: 'CRITICAL',
    enemies: 'YAKUZA CYBORGS',
    objective: 'ELIMINATE THE ENFORCER CHIEF'
  },
  {
    id: 'quantum-singularity-beyond',
    name: 'QUANTUM SINGULARITY: BEYOND',
    subtitle: 'Sci-Fi Action-Adventure // Real-Time Black Hole Gravitational Lensing // Physics-Based Gravity Guns',
    status: 'BETA // EARLY ACCESS',
    statusColor: '#ff9f00',
    image: '',
    themeColor: '#ff9f00',
    threat: 'LETHAL',
    enemies: 'VOID ANOMALIES',
    objective: 'STABILIZE THE QUANTUM CORE'
  },
  {
    id: 'rune-wardens-chron',
    name: 'RUNE WARDENS: CHRONICLES',
    subtitle: 'Fantasy Action RPG // Magic Particle Chaos Physics // Advanced Character Subsurface Scattering // AAA Magic',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#a855f7',
    image: '',
    themeColor: '#a855f7',
    threat: 'HIGH',
    enemies: 'DARK SPELLCASTERS',
    objective: 'RESTORE THE RUNE STONE BALANCE'
  },
  {
    id: 'apex-cmd-zeus',
    name: 'APEX COMMAND: OPERATION ZEUS',
    subtitle: 'Tactical Squad RTS // Real-Time Destructible Cover Physics // Realistic Fire & Smoke Telemetry // AAA RTS',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '',
    themeColor: '#39ff14',
    threat: 'HIGH',
    enemies: 'REBEL MILITARY FORCES',
    objective: 'EXTRACT ASSETS & CONTROL SECTOR'
  },
  {
    id: 'synthetic-horizon-evol',
    name: 'SYNTHETIC HORIZON: EVOLUTION',
    subtitle: 'Cyberpunk Cyber-Slasher // Real-Time Liquid Metal Shaders // Subsurface Skin Physics // AAA RPG',
    status: 'COMING SOON',
    statusColor: '#ff0055',
    image: '',
    themeColor: '#ff0055',
    threat: 'CRITICAL',
    enemies: 'AI OVERLORD UNIT',
    objective: 'DISSOLVE THE MAIN SERVERS'
  },
  {
    id: 'event-horizon-ext',
    name: 'EVENT HORIZON: EXTRACTION',
    subtitle: 'Sci-Fi Survival Horror // Next-Gen Dynamic Shadow Mapping // Dolby Atmos Ray-Traced Audio // AAA Horror',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#00f0ff',
    image: '',
    themeColor: '#00f0ff',
    threat: 'CRITICAL',
    enemies: 'COSMIC HORRORS',
    objective: 'RECOVER SCRAP & EVACUATE CREW'
  },
  {
    id: 'shadow-colossus-reborn',
    name: 'SHADOW OF COLOSSUS: REBORN',
    subtitle: 'Epic Boss-Rush Action // Photorealistic Fur Shader Physics // Colossal Nanite Statues // AAA Fantasy',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#ff9f00',
    image: '',
    themeColor: '#ff9f00',
    threat: 'EXTREME',
    enemies: 'COLOSSAL STONE GUARDIANS',
    objective: 'SCALE AND SHATTER THE CORE SPIRIT'
  },
  {
    id: 'zero-hour-sabotage',
    name: 'ZERO HOUR: SABOTAGE',
    subtitle: 'CQB Tactical Infiltration // Ultra-Realistic Decal & Bullet Hole Physics // Ray-Traced Reflections',
    status: 'ALPHA // TESTING',
    statusColor: '#a855f7',
    image: '',
    themeColor: '#a855f7',
    threat: 'LETHAL',
    enemies: 'HOSTAGE TAKERS',
    objective: 'CLEAR BUILDING & HOSTAGE RESCUE'
  },
  {
    id: 'netrunner-nexus-gate',
    name: 'NETRUNNER: NEXUS GATE',
    subtitle: 'Tactical Cybernetic Hacking Simulator // 3D Matrix Rendering // Quantum Cyber-Decks // AAA Cyberpunk',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '',
    themeColor: '#39ff14',
    threat: 'LETHAL',
    enemies: 'AI SENTINELS',
    objective: 'BYPASS FIREWALL & EXTRACT INTEL'
  },
  {
    id: 'aetherblade-ascension',
    name: 'AETHERBLADE: ASCENSION',
    subtitle: 'High-Fantasy Aerial Slasher // Volumetric Sky & Cloud Rendering // Real-Time Sword Reflections',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#ff0055',
    image: '',
    themeColor: '#ff0055',
    threat: 'HIGH',
    enemies: 'SKY BEASTS & GRIFFINS',
    objective: 'RECLAIM THE FLOATING TEMPLE'
  },
  {
    id: 'chronicles-eldoria',
    name: 'CHRONICLES OF ELDORIA',
    subtitle: 'High-Fantasy Open World RPG // Unreal Engine 5.5 Metahuman NPCs // Ray-Traced Magic Aura',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#00f0ff',
    image: '',
    themeColor: '#00f0ff',
    threat: 'VERY HIGH',
    enemies: 'ELDRITCH CONSPIRATORS',
    objective: 'UNCOVER THE KINGDOM MEMORY'
  },
  {
    id: 'spectre-division-zero',
    name: 'SPECTRE DIVISION: ZERO',
    subtitle: 'Next-Gen Cyberpunk Infiltration RPG // Real-time Neon Lighting Passes // Ray-Traced Shadow Mapping',
    status: 'BETA // EARLY ACCESS',
    statusColor: '#ff9f00',
    image: '',
    themeColor: '#ff9f00',
    threat: 'HIGH',
    enemies: 'AI SECURITY DIVISION',
    objective: 'PURGE SECURE TERMINALS'
  },
  {
    id: 'void-voyager-protocol',
    name: 'VOID VOYAGER: PROTOCOL',
    subtitle: 'Deep-Space Sci-Fi Survival Sim // Unreal Engine 5 Nanite Texturing // Ray-Traced Ambient Occlusion',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#a855f7',
    image: '',
    themeColor: '#a855f7',
    threat: 'EXTREME',
    enemies: 'VOID HARVESTERS',
    objective: 'ESCORT THE RESEARCH CONTAINER'
  },
  {
    id: 'front-line-ds',
    name: 'FRONT LINE: DESERT SHIELD',
    subtitle: 'Large Scale Combined Arms Sandbox // 120Hz Server-Side Physics // Dynamic Real-Time Dust Storms',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '',
    themeColor: '#39ff14',
    threat: 'HIGH',
    enemies: 'ENEMY ARMORED DIVISION',
    objective: 'DESTROY ARMORED ADVANCE LINES'
  },
  {
    id: 'glitch-weaver-matrix',
    name: 'GLITCH WEAVER: MATRIX',
    subtitle: 'Cyberpunk Platformer // Real-Time Glitch & Static FX // Photorealistic Neon Shader Reflections',
    status: 'COMING SOON',
    statusColor: '#ff0055',
    image: '',
    themeColor: '#ff0055',
    threat: 'MODERATE',
    enemies: 'MAINFRAME GLITCH UNITS',
    objective: 'RESTORE SYSTEM CONGRUENCE'
  },
  {
    id: 'cosmo-command-regime',
    name: 'COSMO-COMMAND: REGIME',
    subtitle: 'Space Fleets Real-Time Command Sim // Photorealistic Nebula Ray-Tracing // Volumetric Lasers',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#00f0ff',
    image: '',
    themeColor: '#00f0ff',
    threat: 'HIGH',
    enemies: 'REBEL BATTLECRUISERS',
    objective: 'ELIMINATE COMMAND FLEET'
  },
  {
    id: 'soulforge-destruction',
    name: 'SOULFORGE: DESTRUCTIVE CHAOS',
    subtitle: 'Dark Fantasy Hack-n-Slash RPG // 8K Scan Gothic Environments // Real-Time Blood Mesh Simulation',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#ff9f00',
    image: '',
    themeColor: '#ff9f00',
    threat: 'VERY HIGH',
    enemies: 'DEMONIC ASCENDANTS',
    objective: 'SEAL THE SOULFORGE PIT'
  },
  {
    id: 'operation-stormbringer',
    name: 'OPERATION: STORMBRINGER',
    subtitle: 'Tactical Shooter // Realistic Rainy Forest Shader // Dynamic Wind & Bullet Drop Physics // AAA Tactical',
    status: 'ALPHA // TESTING',
    statusColor: '#a855f7',
    image: '',
    themeColor: '#a855f7',
    threat: 'EXTREME',
    enemies: 'COMMANDO LEADER TARGETS',
    objective: 'NEUTRALIZE RADAR STATIONS'
  },
  {
    id: 'terminal-core-hack',
    name: 'TERMINAL CORE: SYSTEM HACK',
    subtitle: 'Cyberpunk VR Hacker // Real-Time Volumetric Data Streams // Subsurface Interface Reflections',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '',
    themeColor: '#39ff14',
    threat: 'LOW',
    enemies: 'BLACK-HAT INTRUDERS',
    objective: 'SECURE INFRASTRUCTURE NODES'
  },
  {
    id: 'dark-matter-anomaly',
    name: 'DARK MATTER: ANOMALY',
    subtitle: 'Sci-Fi Survival Sim // Gravitational Singularity Ray-Tracing // Deep Void Particle FX // AAA Sci-Fi',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#ff0055',
    image: '',
    themeColor: '#ff0055',
    threat: 'HIGH',
    enemies: 'DARK MATTER APPARITIONS',
    objective: 'SEAL QUANTUM VOIDS'
  },
  {
    id: 'mythos-valhalla',
    name: 'MYTHOS: VALHALLA',
    subtitle: 'Epic Norse Action RPG // Ultra-High Definition Snow Shaders // Metahuman Valkyrie Characters',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#00f0ff',
    image: '',
    themeColor: '#00f0ff',
    threat: 'VERY HIGH',
    enemies: 'FROST GIANTS',
    objective: 'DEFEND VALHALLA CITADEL'
  },
  {
    id: 'silent-assassin-shadow',
    name: 'SILENT ASSASSIN: SHADOW',
    subtitle: 'Tactical Stealth Action // Ray-Traced Reflection Surfaces // Real-Time Cloth & Shadow Physics',
    status: 'BETA // EARLY ACCESS',
    statusColor: '#ff9f00',
    image: '',
    themeColor: '#ff9f00',
    threat: 'HIGH',
    enemies: 'CORRUPTED SECURITY UNITS',
    objective: 'ELIMINATE GENERAL VALEZ'
  },
  {
    id: 'binary-shadow-hack',
    name: 'BINARY SHADOW: MAINFRAME',
    subtitle: 'Cyberpunk Action Hack // Real-Time Data Matrix Projection // Dynamic Cybernetic Soundscapes',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#a855f7',
    image: '',
    themeColor: '#a855f7',
    threat: 'CRITICAL',
    enemies: 'CYBER WATCHDOGS',
    objective: 'PURGE SEC-SERVERS'
  },
  {
    id: 'starhawk-rebellion',
    name: 'STARHAWK: REBELLION',
    subtitle: 'Space Fleet Starfighter RPG // Dynamic Laser Volumetrics // Particle Collision Telemetry',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '',
    themeColor: '#39ff14',
    threat: 'EXTREME',
    enemies: 'REGIME BATTLESHIPS',
    objective: 'DESTROY RADAR ARRAYS'
  },
  {
    id: 'frostfell-ice-age',
    name: 'FROSTFELL: ICE AGE',
    subtitle: 'Fantasy Survival Sandbox // Dynamic Glacier Tessellation // Real-Time Frostbite Screen Shaders',
    status: 'COMING SOON',
    statusColor: '#ff0055',
    image: '',
    themeColor: '#ff0055',
    threat: 'MODERATE',
    enemies: 'ICE FIENDS & WINTER HORDE',
    objective: 'STOKE THE PRIMAL FORGE'
  },
  {
    id: 'apex-predator-hunter',
    name: 'APEX PREDATOR: HUNTER',
    subtitle: 'Tactical Safari Hunter // Photogrammetric Foliage Scans // Ray-Traced Ambient Light Occlusion',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#00f0ff',
    image: '',
    themeColor: '#00f0ff',
    threat: 'HIGH',
    enemies: 'APEX MUTATED BEASTS',
    objective: 'COLLECT TISSUE SAMPLES'
  },
  {
    id: 'deus-ex-machina-apex',
    name: 'DEUS EX MACHINA: APEX',
    subtitle: 'Cyberpunk Metaphysical RPG // Unreal Engine 5.5 Lumen Lighting // Photorealistic Cybernetic Skins',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#ff9f00',
    image: '',
    themeColor: '#ff9f00',
    threat: 'VERY HIGH',
    enemies: 'MACHINA AI GOD',
    objective: 'SEVER LOGICAL MATRIX CHAIN'
  },
  {
    id: 'nebula-voyager-galaxy',
    name: 'NEBULA VOYAGER: GALAXY',
    subtitle: 'Sci-Fi Space Exploration RPG // Procedural 8K Planetary Texturing // Ray-Traced Laser Reflections',
    status: 'ALPHA // TESTING',
    statusColor: '#a855f7',
    image: '',
    themeColor: '#a855f7',
    threat: 'EXTREME',
    enemies: 'NEBULA PIRATE DREADNOUGHTS',
    objective: 'SECURE ANOMALY COMPASS DATA'
  },
  {
    id: 'celestial-realm-gate',
    name: 'CELESTIAL REALM: GATE',
    subtitle: 'Fantasy Mythology Combat RPG // Ray-Traced Cloud Formations // Divine Magic Dynamic Particle FX',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '',
    themeColor: '#39ff14',
    threat: 'HIGH',
    enemies: 'FALLEN DEITIES',
    objective: 'ACTIVATE ELDER CONSTELLATIONS'
  },
  {
    id: 'hostile-contact-outpost',
    name: 'HOSTILE CONTACT: OUTPOST',
    subtitle: 'Tactical Survival Outpost RPG // Destructible Physics Meshes // High-Definition Weather Shader',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#ff0055',
    image: '',
    themeColor: '#ff0055',
    threat: 'HIGH',
    enemies: 'HOSTILE RAIDERS',
    objective: 'DEFEND COMMS INFRASTRUCTURE'
  },
  {
    id: 'carbon-edge-redux',
    name: 'CARBON EDGE: REDUX',
    subtitle: 'Cyberpunk Slasher 2 // Ultra-Sharp Katana Dynamic Physics // Ray-Traced Reflection Mapping',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#00f0ff',
    image: '',
    themeColor: '#00f0ff',
    threat: 'CRITICAL',
    enemies: 'ELITE YAKUZA CYBORGS',
    objective: 'DEFEND NEON CITADEL NETWORK'
  },
  {
    id: 'galactic-core-destiny',
    name: 'GALACTIC CORE: DESTINY',
    subtitle: 'Sci-Fi Flight RTS // Real-Time Volumetric Warp Fields // Photorealistic Solar Ejection FX',
    status: 'BETA // EARLY ACCESS',
    statusColor: '#ff9f00',
    image: '',
    themeColor: '#ff9f00',
    threat: 'HIGH',
    enemies: 'BATTLE SHIP FLEETS',
    objective: 'SHATTER THE CORE DEFENSES'
  },
  {
    id: 'abyssal-gate-rising',
    name: 'ABYSSAL GATE: RISING',
    subtitle: 'Dark Fantasy Magic RPG // Real-Time Water Flow Mesh // Ultra-Deep Shadow Passes',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#a855f7',
    image: '',
    themeColor: '#a855f7',
    threat: 'VERY HIGH',
    enemies: 'ABYSSAL COMMANDERS',
    objective: 'SEAL THE ABYSSAL DEEP RIFT'
  },
  {
    id: 'ironclad-cmd-defense',
    name: 'IRONCLAD COMMAND: DEFENSE',
    subtitle: 'Tactical Base Defense RTS // PhysX Bullet Impact Physics // Unreal Engine 5.5 Nanite Base assets',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '',
    themeColor: '#39ff14',
    threat: 'HIGH',
    enemies: 'ARMY ASSAULT VEHICLES',
    objective: 'RETAIN CONTROL OF THE FORTRESS'
  },
  {
    id: 'subgrid-nexus-sys',
    name: 'SUBGRID NEXUS: SYSTEM',
    subtitle: 'Cyberpunk Matrix Hacking Sim // Dynamic Laser Grid Obstacles // 3D Audio Vector Fields',
    status: 'COMING SOON',
    statusColor: '#ff0055',
    image: '',
    themeColor: '#ff0055',
    threat: 'MODERATE',
    enemies: 'CYBER GUARD AI CHIEF',
    objective: 'SABOTAGE CENTRAL DATABASE'
  },
  {
    id: 'astro-miner-deep-dig',
    name: 'ASTRO-MINER: DEEP DIG',
    subtitle: 'Sci-Fi Asteroid Mining Sim // Ultra-Detailed Ore Particle FX // Ray-Traced Flashlight Refractions',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#00f0ff',
    image: '',
    themeColor: '#00f0ff',
    threat: 'HIGH',
    enemies: 'VOID STONE CRABS',
    objective: 'COLLECT ASTEROID RARE ORE'
  },
  {
    id: 'dragonfire-resurrection',
    name: 'DRAGONFIRE: RESURRECTION',
    subtitle: 'Open-World Fantasy RPG // Photorealistic Volumetric Fire Shaders // Ultra-Sharp Dragon Scales',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#ff9f00',
    image: '',
    themeColor: '#ff9f00',
    threat: 'VERY HIGH',
    enemies: 'ELDER FIRE DRAGONS',
    objective: 'SLAY THE RESURRECTED FIRE WYRM'
  },
  {
    id: 'splinter-protocol-intel',
    name: 'SPLINTER PROTOCOL: INTEL',
    subtitle: 'Tactical Stealth RPG // Ray-Traced Silhouette Occlusion // Hyper-Fidelity Stealth Audio',
    status: 'ALPHA // TESTING',
    statusColor: '#a855f7',
    image: '',
    themeColor: '#a855f7',
    threat: 'EXTREME',
    enemies: 'ELITE COMMANDO SQUADS',
    objective: 'INFILTRATE & EXTRACT INTEL'
  },
  {
    id: 'project-aegis-shield',
    name: 'PROJECT: AEGIS SHIELD',
    subtitle: 'Cyberpunk Defense Shooter // Photorealistic Shield Impact Shaders // High-Definition Wet Reflective Roadways',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#39ff14',
    image: '',
    themeColor: '#39ff14',
    threat: 'HIGH',
    enemies: 'ROGUE SECURITY DRONES',
    objective: 'DEFEND AEGIS SHIELD GENERATOR'
  },
  {
    id: 'warlords-iron-siege',
    name: 'WARLORDS OF IRON: SIEGE',
    subtitle: 'Medieval Castle Defense Sim // Ultra-HD Stone Fracturing Physics // Realistic Dynamic Arrow Physics',
    status: 'ACTIVE // PLAYABLE',
    statusColor: '#ff0055',
    image: '',
    themeColor: '#ff0055',
    threat: 'VERY HIGH',
    enemies: 'CASTLE ARMORED ASSAULT UNITS',
    objective: 'DEFEND THE CASTLE CITADEL LINES'
  }
];

// Dynamically generate unique high-definition Unsplash poster URLs for each game based on its category/theme
gamesList.forEach((game, index) => {
  let keywords = 'gaming';
  if (game.themeColor === '#00f0ff') keywords = 'cyberpunk,neon,gaming';
  else if (game.themeColor === '#ff9f00') keywords = 'scifi,spaceship,space';
  else if (game.themeColor === '#a855f7') keywords = 'fantasy,castle,dragon';
  else if (game.themeColor === '#39ff14') keywords = 'soldier,tactical,military';
  else if (game.themeColor === '#ff0055') {
    if (game.id.includes('drift') || game.id.includes('race') || game.id.includes('nexus')) {
      keywords = 'cyberpunk,racing,car';
    } else {
      keywords = 'cyberpunk,neon,hologram';
    }
  }
  
  // Use unique signature (sig) to force Unsplash to return a unique image for each tile
  game.image = `https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80`; // Fallback base
  game.image = `https://images.unsplash.com/featured/400x250/?${keywords}&sig=${index + 1}`;
});

const mockGamesString = 'const MOCK_GAMES: GameMetadata[] = ' + JSON.stringify(gamesList, null, 2) + ';';

content = content.replace(/const MOCK_GAMES: GameMetadata\[\] = \[[\s\S]*?\];/, mockGamesString);
fs.writeFileSync(path, content);
console.log('Successfully updated to 50 unique premium AAA games with dynamic high-definition visual posters');
