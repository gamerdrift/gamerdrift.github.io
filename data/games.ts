export interface Game {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

export const games: Game[] = [
  { id: "retro-racer", title: "Retro Racer", thumbnail: "/retro_racer_thumb.png", url: "/play/retro-racer/" },
  { id: "space-invaders", title: "Space Invaders", thumbnail: "/space_invaders_thumb.png", url: "/play/space-invaders/" },
  { id: "pixel-platformer", title: "Pixel Platformer", thumbnail: "/pixel_platformer_thumb.png", url: "/play/pixel-platformer/" },
  { id: "snake", title: "Retro Snake", thumbnail: "/snake_thumb.png", url: "/play/snake/" },
  { id: "tetris", title: "Block Tetris", thumbnail: "/tetris_thumb.png", url: "/play/tetris/" },
  { id: "2048", title: "2048 Puzzle", thumbnail: "/game_2048_thumb.png", url: "/play/2048/" },
];
