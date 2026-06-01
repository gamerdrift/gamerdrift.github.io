"use client";

import React, { useEffect, useRef, useState } from 'react';
import { games } from '../../../data/games';
import NavBar from '../../../components/NavBar';
import Link from 'next/link';

export default function GameClientRunner({ gameId }: { gameId: string }) {
  const game = games.find((g) => g.id === gameId);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // States specific to 2048 (non-canvas game)
  const [grid2048, setGrid2048] = useState<number[][]>([]);

  // 1. SNAKE GAME LOGIC
  const runSnake = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grid = 20;
    let count = 0;
    let snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }, { x: 120, y: 160 }];
    let dx = grid;
    let dy = 0;
    let apple = { x: 320, y: 320 };
    let currentScore = 0;

    const getRandomInt = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min) + min);
    };

    const resetApple = () => {
      apple.x = getRandomInt(0, 20) * grid;
      apple.y = getRandomInt(0, 20) * grid;
    };

    let animId: number;

    const loop = () => {
      if (!isPlaying || gameOver) return;
      animId = requestAnimationFrame(loop);

      // Slow game loop to 15 fps
      if (++count < 6) return;
      count = 0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move snake
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };

      // Wall collision
      if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }

      // Self collision
      for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
          setGameOver(true);
          setIsPlaying(false);
          return;
        }
      }

      snake.unshift(head);

      // Eat apple
      if (head.x === apple.x && head.y === apple.y) {
        currentScore += 100;
        setScore(currentScore);
        resetApple();
      } else {
        snake.pop();
      }

      // Draw apple
      ctx.fillStyle = '#ff00ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff00ff';
      ctx.fillRect(apple.x, apple.y, grid - 2, grid - 2);

      // Draw snake
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      snake.forEach((cell, index) => {
        ctx.fillRect(cell.x, cell.y, grid - 2, grid - 2);
      });
      ctx.shadowBlur = 0; // reset
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && dx === 0) {
        dx = -grid; dy = 0;
      } else if (e.key === 'ArrowUp' && dy === 0) {
        dx = 0; dy = -grid;
      } else if (e.key === 'ArrowRight' && dx === 0) {
        dx = grid; dy = 0;
      } else if (e.key === 'ArrowDown' && dy === 0) {
        dx = 0; dy = grid;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  };

  // 2. TETRIS GAME LOGIC
  const runTetris = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grid = 20;
    const cols = 12;
    const rows = 20;
    let board = Array.from({ length: rows }, () => Array(cols).fill(0));
    let currentScore = 0;
    let count = 0;

    const SHAPES = [
      [[1, 1, 1, 1]],
      [[1, 1, 1], [0, 1, 0]],
      [[1, 1, 1], [1, 0, 0]],
      [[1, 1, 1], [0, 0, 1]],
      [[1, 1], [1, 1]],
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1, 1], [1, 1, 0]]
    ];

    const COLORS = ['#00f0ff', '#ff00ff', '#b400ff', '#ffff00', '#00ff00', '#ff0000', '#ff8000'];

    let piece = {
      matrix: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      row: 0,
      col: 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };

    const collide = (matrix: number[][], row: number, col: number) => {
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            const nextRow = row + r;
            const nextCol = col + c;
            if (nextCol < 0 || nextCol >= cols || nextRow >= rows || (nextRow >= 0 && board[nextRow][nextCol])) {
              return true;
            }
          }
        }
      }
      return false;
    };

    const merge = () => {
      piece.matrix.forEach((r, rowIdx) => {
        r.forEach((val, colIdx) => {
          if (val) {
            board[piece.row + rowIdx][piece.col + colIdx] = piece.color;
          }
        });
      });
    };

    const rotate = (matrix: number[][]) => {
      const N = matrix.length;
      const M = matrix[0].length;
      let rotated = Array.from({ length: M }, () => Array(N).fill(0));
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < M; c++) {
          rotated[c][N - 1 - r] = matrix[r][c];
        }
      }
      return rotated;
    };

    const clearLines = () => {
      let linesCleared = 0;
      for (let r = rows - 1; r >= 0; r--) {
        if (board[r].every(val => val !== 0)) {
          board.splice(r, 1);
          board.unshift(Array(cols).fill(0));
          linesCleared++;
          r++; // Check same row index again
        }
      }
      if (linesCleared > 0) {
        currentScore += linesCleared * linesCleared * 100;
        setScore(currentScore);
      }
    };

    const resetPiece = () => {
      piece.matrix = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      piece.row = 0;
      piece.col = 4;
      piece.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (collide(piece.matrix, piece.row, piece.col)) {
        setGameOver(true);
        setIsPlaying(false);
      }
    };

    let animId: number;

    const loop = () => {
      if (!isPlaying || gameOver) return;
      animId = requestAnimationFrame(loop);

      if (++count < 30) return; // Drop every 30 frames
      count = 0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move piece down
      piece.row++;
      if (collide(piece.matrix, piece.row, piece.col)) {
        piece.row--;
        merge();
        clearLines();
        resetPiece();
      }

      // Draw board
      board.forEach((r, rowIdx) => {
        r.forEach((val, colIdx) => {
          if (val) {
            ctx.fillStyle = val as string;
            ctx.fillRect(colIdx * grid, rowIdx * grid, grid - 1, grid - 1);
          }
        });
      });

      // Draw active piece
      ctx.fillStyle = piece.color;
      piece.matrix.forEach((r, rowIdx) => {
        r.forEach((val, colIdx) => {
          if (val) {
            ctx.fillRect((piece.col + colIdx) * grid, (piece.row + rowIdx) * grid, grid - 1, grid - 1);
          }
        });
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        piece.col--;
        if (collide(piece.matrix, piece.row, piece.col)) piece.col++;
      } else if (e.key === 'ArrowRight') {
        piece.col++;
        if (collide(piece.matrix, piece.row, piece.col)) piece.col--;
      } else if (e.key === 'ArrowDown') {
        piece.row++;
        if (collide(piece.matrix, piece.row, piece.col)) piece.row--;
      } else if (e.key === 'ArrowUp') {
        const rotated = rotate(piece.matrix);
        const oldMatrix = piece.matrix;
        piece.matrix = rotated;
        if (collide(piece.matrix, piece.row, piece.col)) {
          piece.matrix = oldMatrix;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  };

  // 3. SPACE INVADERS LOGIC
  const runSpaceInvaders = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let playerX = 180;
    const playerY = 360;
    const playerWidth = 40;
    const playerHeight = 15;

    let bullets: { x: number; y: number }[] = [];
    let invaders: { x: number; y: number; width: number; height: number; alive: boolean }[] = [];
    let invaderSpeed = 1;
    let invaderDirection = 1;
    let currentScore = 0;

    // Initialize invaders
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        invaders.push({
          x: 40 + col * 50,
          y: 30 + row * 40,
          width: 30,
          height: 20,
          alive: true
        });
      }
    }

    let leftPressed = false;
    let rightPressed = false;

    let animId: number;

    const loop = () => {
      if (!isPlaying || gameOver) return;
      animId = requestAnimationFrame(loop);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move player
      if (leftPressed && playerX > 0) playerX -= 4;
      if (rightPressed && playerX < canvas.width - playerWidth) playerX += 4;

      // Draw player
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(playerX, playerY, playerWidth, playerHeight);

      // Move and draw bullets
      ctx.fillStyle = '#ffff00';
      bullets = bullets.filter(bullet => {
        bullet.y -= 6;
        ctx.fillRect(bullet.x, bullet.y, 4, 10);
        return bullet.y > 0;
      });

      // Move and draw invaders
      let hitSide = false;
      invaders.forEach(invader => {
        if (!invader.alive) return;

        invader.x += invaderSpeed * invaderDirection;
        if (invader.x <= 0 || invader.x >= canvas.width - invader.width) {
          hitSide = true;
        }

        // Draw alien
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(invader.x, invader.y, invader.width, invader.height);

        // Check alien reaching player line
        if (invader.y + invader.height >= playerY) {
          setGameOver(true);
          setIsPlaying(false);
        }
      });

      if (hitSide) {
        invaderDirection *= -1;
        invaders.forEach(invader => {
          invader.y += 10;
        });
      }

      // Collisions
      bullets.forEach((bullet, bIdx) => {
        invaders.forEach(invader => {
          if (invader.alive &&
              bullet.x >= invader.x &&
              bullet.x <= invader.x + invader.width &&
              bullet.y >= invader.y &&
              bullet.y <= invader.y + invader.height) {
            invader.alive = false;
            bullets.splice(bIdx, 1);
            currentScore += 200;
            setScore(currentScore);
          }
        });
      });

      // Win check
      if (invaders.every(inv => !inv.alive)) {
        // Next level
        invaderSpeed += 0.5;
        invaders.forEach(inv => { inv.alive = true; inv.y = 30; });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && isPlaying) leftPressed = true;
      if (e.key === 'ArrowRight' && isPlaying) rightPressed = true;
      if ((e.key === ' ' || e.key === 'Spacebar') && isPlaying) {
        bullets.push({ x: playerX + playerWidth / 2 - 2, y: playerY });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') leftPressed = false;
      if (e.key === 'ArrowRight') rightPressed = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  };

  // 4. RETRO RACER LOGIC
  const runRetroRacer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let playerX = 180;
    const playerWidth = 35;
    const playerHeight = 60;
    const playerY = 300;

    let obstacles: { x: number; y: number; width: number; height: number; speed: number }[] = [];
    let currentScore = 0;
    let roadOffset = 0;

    let leftPressed = false;
    let rightPressed = false;

    let animId: number;

    const loop = () => {
      if (!isPlaying || gameOver) return;
      animId = requestAnimationFrame(loop);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw scrolling road
      roadOffset = (roadOffset + 5) % 40;
      ctx.fillStyle = '#111';
      ctx.fillRect(80, 0, 240, canvas.height);

      ctx.fillStyle = '#fff';
      // Road borders
      ctx.fillRect(80, 0, 5, canvas.height);
      ctx.fillRect(315, 0, 5, canvas.height);

      // Center dashed line
      for (let y = -40 + roadOffset; y < canvas.height; y += 40) {
        ctx.fillRect(198, y, 4, 20);
      }

      // Move player
      if (leftPressed && playerX > 85) playerX -= 5;
      if (rightPressed && playerX < 315 - playerWidth) playerX += 5;

      // Draw player car
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(playerX, playerY, playerWidth, playerHeight);

      // Spawning obstacles
      if (Math.random() < 0.02) {
        obstacles.push({
          x: Math.random() * (220 - playerWidth) + 90,
          y: -60,
          width: playerWidth,
          height: playerHeight,
          speed: Math.random() * 3 + 4
        });
      }

      // Update and draw obstacles
      obstacles = obstacles.filter(obs => {
        obs.y += obs.speed;
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Collision Check
        if (
          playerX < obs.x + obs.width &&
          playerX + playerWidth > obs.x &&
          playerY < obs.y + obs.height &&
          playerY + playerHeight > obs.y
        ) {
          setGameOver(true);
          setIsPlaying(false);
        }

        if (obs.y > canvas.height) {
          currentScore += 50;
          setScore(currentScore);
          return false;
        }
        return true;
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') leftPressed = true;
      if (e.key === 'ArrowRight') rightPressed = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') leftPressed = false;
      if (e.key === 'ArrowRight') rightPressed = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  };

  // 5. PIXEL PLATFORMER LOGIC
  const runPixelPlatformer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let player = { x: 100, y: 300, vx: 0, vy: 0, width: 20, height: 30, jumping: false };
    const gravity = 0.5;
    const groundY = 350;

    let obstacles: { x: number; width: number; height: number; speed: number }[] = [];
    let currentScore = 0;

    let jumpPressed = false;

    let animId: number;

    const loop = () => {
      if (!isPlaying || gameOver) return;
      animId = requestAnimationFrame(loop);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = '#222';
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(0, groundY, canvas.width, 4);

      // Physics
      if (jumpPressed && !player.jumping) {
        player.vy = -10;
        player.jumping = true;
      }

      player.vy += gravity;
      player.y += player.vy;

      if (player.y >= groundY - player.height) {
        player.y = groundY - player.height;
        player.vy = 0;
        player.jumping = false;
      }

      // Draw player
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // Spawn obstacles
      if (Math.random() < 0.015) {
        obstacles.push({
          x: canvas.width,
          width: 15,
          height: Math.random() * 20 + 20,
          speed: 4
        });
      }

      // Move and draw obstacles
      obstacles = obstacles.filter(obs => {
        obs.x -= obs.speed;
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(obs.x, groundY - obs.height, obs.width, obs.height);

        // Collision Check
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y + player.height > groundY - obs.height
        ) {
          setGameOver(true);
          setIsPlaying(false);
        }

        if (obs.x < -obs.width) {
          currentScore += 100;
          setScore(currentScore);
          return false;
        }
        return true;
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Spacebar') {
        jumpPressed = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Spacebar') {
        jumpPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  };

  // 6. 2048 LOGIC (DOM BASED)
  const init2048 = () => {
    let grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    grid = addNumber2048(grid);
    grid = addNumber2048(grid);
    setGrid2048(grid);
    setScore(0);
    setGameOver(false);
  };

  const addNumber2048 = (grid: number[][]) => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
    return grid;
  };

  const handle2048Input = (direction: 'up' | 'down' | 'left' | 'right') => {
    let grid = JSON.parse(JSON.stringify(grid2048));
    let moved = false;
    let currentScore = score;

    const rotateGrid = (g: number[][]) => {
      let next = Array.from({ length: 4 }, () => Array(4).fill(0));
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          next[c][3 - r] = g[r][c];
        }
      }
      return next;
    };

    let rotations = 0;
    if (direction === 'up') rotations = 1;
    if (direction === 'right') rotations = 2;
    if (direction === 'down') rotations = 3;

    for (let i = 0; i < rotations; i++) {
      grid = rotateGrid(grid);
    }

    for (let r = 0; r < 4; r++) {
      let row = grid[r].filter((v: number) => v !== 0);
      let nextRow = [];
      for (let i = 0; i < row.length; i++) {
        if (row[i] === row[i + 1]) {
          nextRow.push(row[i] * 2);
          currentScore += row[i] * 2;
          i++;
          moved = true;
        } else {
          nextRow.push(row[i]);
        }
      }
      while (nextRow.length < 4) nextRow.push(0);
      if (JSON.stringify(grid[r]) !== JSON.stringify(nextRow)) {
        moved = true;
      }
      grid[r] = nextRow;
    }

    const revRotations = (4 - rotations) % 4;
    for (let i = 0; i < revRotations; i++) {
      grid = rotateGrid(grid);
    }

    if (moved) {
      grid = addNumber2048(grid);
      setGrid2048(grid);
      setScore(currentScore);

      let canMove = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (grid[r][c] === 0) canMove = true;
          if (r < 3 && grid[r][c] === grid[r + 1][c]) canMove = true;
          if (c < 3 && grid[r][c] === grid[r][c + 1]) canMove = true;
        }
      }
      if (!canMove) {
        setGameOver(true);
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    if (gameId === '2048') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') handle2048Input('up');
        if (e.key === 'ArrowDown') handle2048Input('down');
        if (e.key === 'ArrowLeft') handle2048Input('left');
        if (e.key === 'ArrowRight') handle2048Input('right');
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }

    if (gameId === 'snake') return runSnake();
    if (gameId === 'tetris') return runTetris();
    if (gameId === 'space-invaders') return runSpaceInvaders();
    if (gameId === 'retro-racer') return runRetroRacer();
    if (gameId === 'pixel-platformer') return runPixelPlatformer();
  }, [isPlaying, gameId, grid2048]);

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    if (gameId === '2048') {
      init2048();
    }
  };

  if (!game) {
    return (
      <div className="container flex flex-col items-center justify-center py-20 text-white">
        <h2 className="text-3xl neon">Game Not Found</h2>
        <Link href="/" className="mt-4 neon-button">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center py-6">
      <NavBar />
      <div className="w-full max-w-4xl flex flex-col items-center mt-4">
        <div className="flex justify-between w-full mb-4 px-4">
          <h2 className="text-3xl font-bold text-white neon">{game.title}</h2>
          <div className="text-xl font-bold text-neon-blue neon">
            Score: <span className="text-white">{score}</span>
          </div>
        </div>

        {/* CRT Arcade Cabinet Screen */}
        <div className="relative w-full max-w-xl aspect-[4/3] bg-black border-4 border-neon-pink rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,0,255,0.3)]">
          <div className="absolute inset-0 scanlines pointer-events-none z-10 opacity-30"></div>
          <div className="absolute inset-0 bg-radial-crt pointer-events-none z-15"></div>

          {!isPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              {gameOver && <h3 className="text-4xl text-neon-pink font-extrabold mb-4 neon animate-pulse">GAME OVER</h3>}
              <button
                onClick={startGame}
                className="neon-button text-2xl px-8 py-3 bg-neon-pink/30 hover:bg-neon-pink/50 transition border border-neon-pink rounded-lg"
              >
                {gameOver ? 'RETRY' : 'START GAME'}
              </button>
            </div>
          )}

          {gameId === '2048' ? (
            <div className="w-full h-full flex items-center justify-center bg-[#150a21]">
              <div className="grid grid-cols-4 gap-3 p-4 bg-[#231238] rounded-xl w-[320px] h-[320px]">
                {grid2048.map((row, rIdx) =>
                  row.map((val, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className="flex items-center justify-center font-bold text-2xl rounded-lg transition duration-150"
                      style={{
                        background: val === 0 ? '#1b0e2b' : `hsl(${(Math.log2(val) * 35) % 360}, 80%, 45%)`,
                        boxShadow: val > 0 ? `0 0 12px hsl(${(Math.log2(val) * 35) % 360}, 80%, 45%)` : 'none',
                        color: val === 0 ? 'transparent' : '#fff'
                      }}
                    >
                      {val > 0 ? val : ''}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full h-full object-contain block bg-[#0a000f]"
            />
          )}
        </div>

        {/* Controls Overlay info */}
        <div className="cyber-card p-6 mt-8 w-full max-w-xl text-text-secondary">
          <h3 className="text-xl font-semibold text-white mb-3 neon">HOW TO PLAY</h3>
          {gameId === 'snake' && <p className="text-lg">Use the Arrow Keys (▲ ▼ ◀ ▶) on your keyboard to navigate the snake. Eat neon pink apples and do not hit the walls or yourself!</p>}
          {gameId === 'tetris' && <p className="text-lg">Use Arrow Left/Right (◀ ▶) to move, Arrow Down (▼) to drop, and Arrow Up (▲) to rotate the falling block pieces. Clear complete rows to score!</p>}
          {gameId === 'space-invaders' && <p className="text-lg">Use Arrow Left/Right (◀ ▶) to move your spaceship. Press Spacebar to shoot lasers. Eliminate all alien invaders before they reach your spaceship line!</p>}
          {gameId === 'retro-racer' && <p className="text-lg">Use Arrow Left/Right (◀ ▶) to steer your car. Avoid crashing into the purple obstacle vehicles spawning on the highway!</p>}
          {gameId === 'pixel-platformer' && <p className="text-lg">Press Arrow Up (▲) or Spacebar to jump over incoming purple spike obstacles. Timing is critical to get a high score!</p>}
          {gameId === '2048' && <p className="text-lg">Use Arrow Keys (▲ ▼ ◀ ▶) to slide the tiles. When two tiles with the same number touch, they merge into one! Reach the 2048 tile to win!</p>}
        </div>

        <Link href="/" className="mt-6 text-neon-blue hover:underline">
          ◀ Back to Arcade Lobby
        </Link>
      </div>
    </div>
  );
}
