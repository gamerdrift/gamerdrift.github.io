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

const gamePhotoIds = [
  "photo-1550745165-9bc0b252726f", // Retro arcade keyboard / floppy
  "photo-1511512578047-dfb367046420", // Neon console setup
  "photo-1551103782-8ab07afd45c1", // Retro arcade cabinets
  "photo-1509198397868-475647b2a1e5", // Joystick close-up
  "photo-1518709268805-4e9042af9f23", // Space invader pixel lamp
  "photo-1493711662062-fa541adb3fc8", // Retro controller
  "photo-1612287230202-1bf1d85d1bdf", // Arcade cabinet screen
  "photo-1593305841991-05c297ba4575", // CRT retro TV screen
  "photo-1566241477600-ac026ad43874", // Retro computer setup
  "photo-1614850523459-c2f4c699c52e", // Colorful abstract neon
  "photo-1508700115892-45ecd05ae2ad", // Neon blue grid lines
  "photo-1607604276583-eef5d076aa5f", // Japanese arcade bar
  "photo-1548685913-fe6574340a63", // Classic pinball machine
  "photo-1580234810907-b40315b76418", // Cyberpunk green terminal screen
  "photo-1627856013091-fed6e4e30025", // Chess board close-up
  "photo-1606144042614-b2417e99c4e3", // Multi-colored controllers
  "photo-1526304640581-d334cdbbf45e", // Green digital code rain
  "photo-1560169897-fc0cdbdfa4d5", // Neon arcade signage
  "photo-1552820728-8b83bb6b773f", // Cyberpunk glowing keyboard
  "photo-1553481187-be93c21490a9", // Arcade lobby glowing lights
  "photo-1542751371-adc38448a05e", // Gaming e-sports screens
  "photo-1538481199705-c710c4e965fc", // Cyberpunk neon city lights
  "photo-1518131398979-883be7e12be2", // Pixel art character console
  "photo-1585647347483-22b66260dfff", // Neon game block columns
  "photo-1605899435973-ca2d1a8861cf", // Futuristic gaming setup
  "photo-1568890686150-64af65720e69", // Shoot targets neon grid
  "photo-1611078489935-0cb964de46d6", // Glow room neon lighting
  "photo-1555680202-c86f0e12f086", // Cute pixel pet
  "photo-1626379616459-b2ce1d9edd77", // Sci-fi cockpit cyber concept
  "photo-1506703719100-a0f3a48c0f86", // Space galaxy stars nebula
  "photo-1516321318423-f06f85e504b3", // Digital tech abstract lines
  "photo-1563089145-599997674d42", // Retro cyber-highway grid landscape
  "photo-1579546929518-9e396f3cc809", // Vibrant colorful aura wallpaper
  "photo-1504608524841-42fe6f032b4b", // Cyber punk weather storm setup
  "photo-1531403009284-440f080d1e12", // UI elements digital board
  "photo-1504384308090-c894fdcc538d"  // Tech server room blue glow
];

const getUnsplashUrl = (photoId: string) => 
  `https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&h=500&q=80`;

export const games: Game[] = [
  // --- Built-in Games (7) ---
  { id: "captn-ghost", title: "Captn.Ghost", thumbnail: "/captn_ghost_preview.png", url: "/play/captn-ghost/", category: "Shooting", description: "Gritty 3D AAA action rail shooter. Breaching checkpoints, dodging cover, and eliminating target drones." },
  { id: "retro-racer", title: "Retro Racer", thumbnail: "/retro_racer_thumb.png", url: "/play/retro-racer/", category: "Arcade", description: "Steer through heavy cyber-highway traffic and survive as long as possible." },
  { id: "space-invaders", title: "Space Invaders", thumbnail: "/space_invaders_thumb.png", url: "/play/space-invaders/", category: "Shooting", description: "Blast waves of descending alien invaders before they reach your defenses." },
  { id: "pixel-platformer", title: "Pixel Platformer", thumbnail: "/pixel_platformer_thumb.png", url: "/play/pixel-platformer/", category: "Casual", description: "Jump and dodge incoming obstacles in this retro high-speed platformer runner." },
  { id: "snake", title: "Retro Snake", thumbnail: "/snake_thumb.png", url: "/play/snake/", category: "Arcade", description: "Grow your neon snake by eating pink apples. Avoid colliding with walls and yourself." },
  { id: "tetris", title: "Block Tetris", thumbnail: "/tetris_thumb.png", url: "/play/tetris/", category: "Puzzle", description: "Standard block puzzle game. Rotate falling tetromino shapes and clear rows." },
  { id: "2048", title: "2048 Puzzle", thumbnail: "/game_2048_thumb.png", url: "/play/2048/", category: "Puzzle", description: "Merge tiles of identical numbers to double their value. Reach the 2048 tile." },

  // --- HTML5 Classics & Arcade on GitHub Pages (11) ---
  { id: "hextris", title: "Hextris Hexagon", thumbnail: "/hextris_thumb.png", url: "/play/hextris/", embedUrl: "/games/hextris/index.html", category: "Puzzle", description: "Rotate the hexagon to stack falling colored blocks in matching rows of three." },
  { id: "clumsy-bird", title: "Clumsy Bird", thumbnail: "/clumsybird_thumb.png", url: "/play/clumsy-bird/", embedUrl: "/games/clumsy-bird/index.html", category: "Casual", description: "Flap your wings, dodge the wooden obstacles, and achieve a high score." },
  { id: "pacman-html5", title: "Pacman Classic", thumbnail: "/pacman_thumb.png", url: "/play/pacman-html5/", embedUrl: "/games/pacman-html5/index.html", category: "Arcade", description: "Navigate the grid, devour pac-dots, and evade Clyde, Inky, Pinky, and Blinky." },
  { id: "asteroids-js", title: "Asteroids 2D", thumbnail: "/asteroids_thumb.png", url: "/play/asteroids-js/", embedUrl: "/games/asteroids-js/index.html", category: "Shooting", description: "Control a ship in deep space, blast incoming space debris and evade alien saucers." },
  { id: "canvas-pinball", title: "Cyber Pinball", thumbnail: getUnsplashUrl("photo-1548685913-fe6574340a63"), url: "/play/canvas-pinball/", isExternal: true, embedUrl: "https://leereilly.github.io/canvas-pinball/", category: "Arcade", description: "Classic retro arcade pinball simulation made with HTML5 Canvas physics." },
  { id: "tower-blocks", title: "Tower Blocks", thumbnail: getUnsplashUrl("photo-1518131398979-883be7e12be2"), url: "/play/tower-blocks/", isExternal: true, embedUrl: "https://clintbellanger.github.io/tower_blocks/", category: "Casual", description: "Release and stack moving blocks to construct the tallest skyscraper possible." },
  { id: "javascript-racer", title: "Javascript Racer", thumbnail: "/jsracer_thumb.png", url: "/play/javascript-racer/", embedUrl: "/games/javascript-racer/v4.final.html", category: "Racing", description: "High-speed retro OutRun-style 3D racing game built in HTML5 canvas. Choose your track: straight, curves, or hills." },
  { id: "duck-hunt", title: "Duck Hunt HTML5", thumbnail: getUnsplashUrl("photo-1568890686150-64af65720e69"), url: "/play/duck-hunt/", isExternal: true, embedUrl: "https://duckhunt.js.org/", category: "Shooting", description: "Shoot down flying ducks launched by your retriever dog in this retro classic." },
  { id: "minesweeper-js", title: "Minesweeper Classic", thumbnail: "/minesweeper_thumb.png", url: "/play/minesweeper-js/", embedUrl: "/games/minesweeper-js/index.html", category: "Puzzle", description: "Uncover a grid of tiles while avoiding hidden mines using numeric cues." },
  { id: "lichess-chess", title: "Lichess Chess", thumbnail: getUnsplashUrl("photo-1627856013091-fed6e4e30025"), url: "/play/lichess-chess/", isExternal: true, embedUrl: "https://lichess.org/embed/export/fen/rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR?theme=auto&bg=auto", category: "Puzzle", description: "Play standard chess matches against AI or local players using Lichess servers." },
  { id: "solitaire-classic", title: "Solitaire Classic", thumbnail: getUnsplashUrl("photo-1606144042614-b2417e99c4e3"), url: "/play/solitaire-classic/", isExternal: true, embedUrl: "https://solitaire.github.io/", category: "Puzzle", description: "Arrange cards in chronological order from King to Ace on piles." },
  { id: "rogue-ghost", title: "Rogue Ghost 3D", thumbnail: "/rogue_ghost_character.png", url: "/play/rogue-ghost/", isExternal: true, embedUrl: "/games/rogueghost/index.html", category: "Action", description: "3D Third-Person Tactical Infiltration / Stealth Action game. Infiltrate secure vaults, avoid patrol guards, rescue hostages and extract." },
  { id: "slots", title: "Cyber Slots", thumbnail: getUnsplashUrl("photo-1607604276583-eef5d076aa5f"), url: "/casino?tab=slots", category: "Casino", description: "Spin the cyberpunk matrices, check decryptions, and hit the legendary GamerDrift badges." },
  { id: "blackjack", title: "Neon Blackjack", thumbnail: getUnsplashUrl("photo-1511512578047-dfb367046420"), url: "/casino?tab=blackjack", category: "Casino", description: "Test your score synchronization against dealer AI in neon deck terminals." },
  { id: "roulette", title: "Drift Roulette", thumbnail: getUnsplashUrl("photo-1548685913-fe6574340a63"), url: "/casino?tab=roulette", category: "Casino", description: "Decelerate the canvas grid spin wheel and decode Red/Black numbers payout grid." },
  { id: "hexgl", title: "HexGL 3D", thumbnail: "/hexgl_thumb.png", url: "/play/hexgl/", embedUrl: "/games/hexgl/index.html", category: "Racing", description: "Futuristic 3D WebGL speed racer built with Three.js. Pilot a hovercraft and dodge obstacles at sonic speeds." },
  { id: "three-fps", title: "Three.js FPS", thumbnail: "/threefps_thumb.png", url: "/play/three-fps/", embedUrl: "/games/three-fps/build/index.html", category: "Shooting", description: "Immersive 3D first-person shooter with real-time ammo.js physics, enemies, weapons, and dynamic lighting." },
  { id: "simple-3d-fps", title: "Babylon.js Arena FPS", thumbnail: "/babylonfps_thumb.png", url: "/play/simple-3d-fps/", embedUrl: "/games/simple-3d-fps/public/index.html", category: "Shooting", description: "3D arena first-person shooter powered by Babylon.js engine with HD textures, real shadows, and smooth controls." }
];
