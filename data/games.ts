export interface Game {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

export const games: Game[] = [
  { id: "1", title: "Retro Racer", thumbnail: "/wood_texture.png", url: "#" },
  { id: "2", title: "Space Invaders", thumbnail: "/wood_texture.png", url: "#" },
  { id: "3", title: "Pixel Platformer", thumbnail: "/wood_texture.png", url: "#" },
];
