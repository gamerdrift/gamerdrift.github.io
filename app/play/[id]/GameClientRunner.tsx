"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { useGames, GameComment } from '../../../lib/state/GameContext';
import { useUser } from '../../../lib/state/UserContext';
import InteractiveGameCard from '../../../components/InteractiveGameCard';

export default function GameClientRunner({ gameId }: { gameId: string }) {
  const { games, comments, addComment, addToHistory } = useGames();
  const { user, gainXP } = useUser();
  const game = games.find((g) => g.id === gameId);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cabinetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout & UI States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [ammo, setAmmo] = useState(30);
  const [maxAmmo] = useState(30);
  const [stage, setStage] = useState(1);
  const [inCover, setInCover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize stage from search parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('stage');
      if (s) {
        const val = parseInt(s, 10);
        if (val >= 1 && val <= 5) {
          setStage(val);
        }
      }
    }
  }, []);

  // Review System States
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  // Related Games Selection
  const relatedGames = games.filter(g => g.id !== gameId && g.approved).slice(0, 4);

  // Toggle layout mode
  const toggleFullscreen = () => {
    const cabinet = cabinetRef.current;
    if (!cabinet) return;
    if (!document.fullscreenElement) {
      cabinet.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    const author = user ? user.username : 'GuestDrifter';
    addComment(gameId, author, reviewRating, reviewText);
    setReviewText('');
    gainXP(25); // Reward XP for review
  };

  // Add game to play history on start
  useEffect(() => {
    if (isPlaying) {
      addToHistory(gameId);
    }
  }, [isPlaying, gameId]);

  const playSound = (type: 'shoot' | 'explosion' | 'hit' | 'clear' | 'land' | 'gameover') => {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'shoot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'hit') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'explosion') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(10, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'clear') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'land') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      }
    } catch (e) {
      console.warn("AudioContext block failed", e);
    }
  };

  // -------------------------------------------------------------
  // 3D CAPTN.GHOST GAME ENGINE ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    if (gameId !== 'captn-ghost' || !isPlaying || gameOver || gameWon) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // WebGL Renderer Setup
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07020d, 0.015);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    const cameraGroup = new THREE.Group();
    cameraGroup.position.set(0, 2, 10);
    cameraGroup.add(camera);
    scene.add(cameraGroup);

    // Dynamic Weather Particles setup
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      velocities.push(0.1 + Math.random() * 0.2); // Y speed
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Choose particle color by stage theme
    let particleColor = 0x00f0ff; // Rain
    if (stage === 3) particleColor = 0xff8c00; // Ash
    if (stage === 4) particleColor = 0xc2a678; // Sandstorm
    if (stage === 5) particleColor = 0x3b6b12; // Falling leaves

    const particleMaterial = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.15,
      transparent: true,
      opacity: 0.6
    });
    const weatherParticles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(weatherParticles);

    // Procedural Camouflage Material Canvas Generator
    const createCamoMaterial = (type: string) => {
      const textureCanvas = document.createElement('canvas');
      textureCanvas.width = 128;
      textureCanvas.height = 128;
      const textureCtx = textureCanvas.getContext('2d');
      if (textureCtx) {
        let colors = ['#2d4a22', '#1a3311', '#4d5c43']; // forest
        if (type === 'desert') colors = ['#c2a678', '#d6be96', '#4d412e'];
        if (type === 'snowy') colors = ['#e6ecef', '#bec5c8', '#42484a'];
        if (type === 'navy') colors = ['#1d2d44', '#3e5c76', '#0d1321'];

        textureCtx.fillStyle = colors[0];
        textureCtx.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 20; i++) {
          textureCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          textureCtx.beginPath();
          textureCtx.arc(Math.random() * 128, Math.random() * 128, 10 + Math.random() * 15, 0, Math.PI * 2);
          textureCtx.fill();
        }
      }
      const texture = new THREE.CanvasTexture(textureCanvas);
      return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 });
    };

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Point Light for Muzzle Flash
    const flashLight = new THREE.PointLight(0xffaa00, 0, 10);
    camera.add(flashLight);
    flashLight.position.set(0.3, -0.2, -1);

    // Procedural Weapon Model attached to Camera
    const weaponGroup = new THREE.Group();
    weaponGroup.position.set(0.4, -0.3, -0.8);
    camera.add(weaponGroup);

    // Gun barrel
    const barrelGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
    barrelGeom.rotateX(Math.PI / 2);
    const steelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 });
    const barrel = new THREE.Mesh(barrelGeom, steelMaterial);
    barrel.position.set(0, 0, -0.2);
    weaponGroup.add(barrel);

    // Gun body
    const bodyGeom = new THREE.BoxGeometry(0.04, 0.06, 0.3);
    const gunBody = new THREE.Mesh(bodyGeom, steelMaterial);
    weaponGroup.add(gunBody);

    // Scope
    const scopeGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.12, 8);
    scopeGeom.rotateX(Math.PI / 2);
    const scope = new THREE.Mesh(scopeGeom, steelMaterial);
    scope.position.set(0, 0.04, 0);
    weaponGroup.add(scope);

    // Staging Level Geometry Nodes
    const buildEnvironment = () => {
      // Floor
      const floorGeom = new THREE.PlaneGeometry(60, 200);
      floorGeom.rotateX(-Math.PI / 2);
      const floorMat = new THREE.MeshStandardMaterial({ color: 0x100d20, roughness: 0.9 });
      const floor = new THREE.Mesh(floorGeom, floorMat);
      floor.position.set(0, 0, -50);
      floor.receiveShadow = true;
      scene.add(floor);

      // Environment props depending on Stage
      const propGroup = new THREE.Group();
      scene.add(propGroup);

      if (stage === 1) { // Container Yard
        for (let i = 0; i < 25; i++) {
          const size = 2 + Math.random() * 3;
          const boxGeom = new THREE.BoxGeometry(size, size, size * 2);
          const boxMat = new THREE.MeshStandardMaterial({ 
            color: Math.random() > 0.5 ? 0x00f0ff : 0xff00ff,
            metalness: 0.7 
          });
          const box = new THREE.Mesh(boxGeom, boxMat);
          box.position.set(
            (Math.random() - 0.5) * 30,
            size / 2,
            -Math.random() * 100
          );
          box.castShadow = true;
          box.receiveShadow = true;
          propGroup.add(box);
        }
      } else if (stage === 2) { // Cargo Ship
        // Draw guardrails
        const railGeom = new THREE.BoxGeometry(40, 1, 0.1);
        const rail = new THREE.Mesh(railGeom, steelMaterial);
        rail.position.set(0, 1, -20);
        propGroup.add(rail);
      } else if (stage === 4) { // Afghan Desert
        // Add clay huts
        const hutGeom = new THREE.BoxGeometry(4, 3, 4);
        const hutMat = createCamoMaterial('desert');
        for (let i = 0; i < 6; i++) {
          const hut = new THREE.Mesh(hutGeom, hutMat);
          hut.position.set(
            (Math.random() > 0.5 ? 8 : -8) + (Math.random() - 0.5) * 3,
            1.5,
            -15 - i * 20
          );
          hut.castShadow = true;
          propGroup.add(hut);
        }
      } else { // default hangar / jungle foliage
        const leafGeom = new THREE.SphereGeometry(1, 8, 8);
        const trunkGeom = new THREE.CylinderGeometry(0.1, 0.1, 3);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x3b6b12 });
        for (let i = 0; i < 15; i++) {
          const tree = new THREE.Group();
          const trunk = new THREE.Mesh(trunkGeom, steelMaterial);
          const leaves = new THREE.Mesh(leafGeom, leafMat);
          leaves.position.y = 1.5;
          tree.add(trunk);
          tree.add(leaves);
          tree.position.set(
            (Math.random() - 0.5) * 30,
            1.5,
            -Math.random() * 100
          );
          propGroup.add(tree);
        }
      }
    };
    buildEnvironment();

    // Spawning Enemies
    const enemies: { mesh: THREE.Group; type: 'soldier' | 'drone'; health: number; py: number; speed: number; direction: number }[] = [];
    const spawnEnemy = () => {
      const enemyGroup = new THREE.Group();

      const isDrone = Math.random() > 0.6;
      if (isDrone) {
        // Drone sphere model
        const droneGeom = new THREE.SphereGeometry(0.3, 12, 12);
        const droneMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff });
        const drone = new THREE.Mesh(droneGeom, droneMat);
        enemyGroup.add(drone);
        enemyGroup.position.set((Math.random() - 0.5) * 10, 3 + Math.random() * 2, cameraGroup.position.z - 15);
        scene.add(enemyGroup);
        enemies.push({ mesh: enemyGroup, type: 'drone', health: 40, py: enemyGroup.position.y, speed: 0.05, direction: Math.random() > 0.5 ? 1 : -1 });
      } else {
        // Soldier humanoid model
        const soldierMat = createCamoMaterial(stage === 4 ? 'desert' : stage === 3 ? 'snowy' : 'forest');
        
        // Head
        const headGeom = new THREE.SphereGeometry(0.18, 10, 10);
        const head = new THREE.Mesh(headGeom, soldierMat);
        head.position.y = 0.9;
        enemyGroup.add(head);

        // Helmet
        const helmetGeom = new THREE.SphereGeometry(0.2, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2);
        const helmet = new THREE.Mesh(helmetGeom, steelMaterial);
        helmet.position.y = 0.92;
        enemyGroup.add(helmet);

        // Torso
        const torsoGeom = new THREE.CylinderGeometry(0.22, 0.15, 0.7);
        const torso = new THREE.Mesh(torsoGeom, soldierMat);
        torso.position.y = 0.4;
        enemyGroup.add(torso);

        enemyGroup.position.set((Math.random() - 0.5) * 12, 0.5, cameraGroup.position.z - 15 - Math.random() * 5);
        scene.add(enemyGroup);
        enemies.push({ mesh: enemyGroup, type: 'soldier', health: 100, py: enemyGroup.position.y, speed: 0.03, direction: Math.random() > 0.5 ? 1 : -1 });
      }
    };

    // Initial spawns
    for (let i = 0; i < 3; i++) spawnEnemy();

    // Spawn timer
    const spawnInterval = setInterval(() => {
      if (enemies.length < 5) spawnEnemy();
    }, 3000);

    // Raycast hit detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleShoot = (e: MouseEvent) => {
      e.preventDefault();
      
      // Check ammo
      let currentAmmo = 0;
      setAmmo(prev => {
        if (prev <= 0) return 0;
        currentAmmo = prev - 1;
        return currentAmmo;
      });

      if (currentAmmo === 0) {
        // Trigger empty clip click
        return;
      }

      // Muzzle Flash animation
      flashLight.intensity = 2.5;
      weaponGroup.position.z += 0.12; // Recoil pushback
      weaponGroup.rotation.x -= 0.05; // Recoil barrel lift

      setTimeout(() => {
        flashLight.intensity = 0;
      }, 50);

      // Mouse coords
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check intersect enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const children = enemy.mesh.children;
        const intersects = raycaster.intersectObjects(children);

        if (intersects.length > 0) {
          // Hit! Damage enemy
          enemy.health -= 35;
          setScore(prev => prev + 50);

          // Spawn blood splatter/sparks particles
          const sparkGeom = new THREE.BufferGeometry();
          const sparkPos = new Float32Array(15 * 3);
          const contactPoint = intersects[0].point;
          for (let j = 0; j < 15; j++) {
            sparkPos[j * 3] = contactPoint.x + (Math.random() - 0.5) * 0.2;
            sparkPos[j * 3 + 1] = contactPoint.y + (Math.random() - 0.5) * 0.2;
            sparkPos[j * 3 + 2] = contactPoint.z + (Math.random() - 0.5) * 0.2;
          }
          sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
          const sparkMat = new THREE.PointsMaterial({
            color: enemy.type === 'drone' ? 0x00f0ff : 0xff0000,
            size: 0.1,
            transparent: true,
            opacity: 0.8
          });
          const sparks = new THREE.Points(sparkGeom, sparkMat);
          scene.add(sparks);
          setTimeout(() => scene.remove(sparks), 300);

          if (enemy.health <= 0) {
            // Kill enemy
            scene.remove(enemy.mesh);
            enemies.splice(i, 1);
            setScore(prev => prev + 150);
            gainXP(5); // Reward XP for kill
          }
          break; // hit first target
        }
      }
    };

    window.addEventListener('click', handleShoot);

    // Keyboard Key Handling
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setInCover(true);
        // Translate camera down in cover
        cameraGroup.position.y = 1.0;
        // Auto reload
        setTimeout(() => {
          setAmmo(maxAmmo);
        }, 1000);
      }
      if (e.key === 'r' || e.key === 'R') {
        // Lower gun reload animation
        weaponGroup.position.y -= 0.3;
        setTimeout(() => {
          setAmmo(maxAmmo);
          weaponGroup.position.y += 0.3;
        }, 800);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        setInCover(false);
        cameraGroup.position.y = 2.0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse movement sway
    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Apply lerp target values to scope sway
      camera.rotation.y = -x * 0.15;
      camera.rotation.x = y * 0.12;

      weaponGroup.position.x = 0.4 - x * 0.05;
      weaponGroup.position.y = -0.3 + y * 0.05;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // -------------------------------------------------------------
    // Game Loop
    // -------------------------------------------------------------
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let moveProgress = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Auto resize WebGL renderer if container bounds change (e.g. entering/leaving fullscreen)
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }

      const delta = clock.getDelta();

      // Recoil recovery
      if (weaponGroup.position.z > -0.8) weaponGroup.position.z -= delta * 0.8;
      if (weaponGroup.rotation.x < 0) weaponGroup.rotation.x += delta * 0.4;

      // Weather animation
      const posAttr = weatherParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        posAttr.setY(i, posAttr.getY(i) - velocities[i]);
        if (posAttr.getY(i) < 0) {
          posAttr.setY(i, 20); // Reset height
        }
      }
      posAttr.needsUpdate = true;

      // Camera rail path move simulation
      if (enemies.length === 0) {
        moveProgress += delta * 2;
        cameraGroup.position.z -= delta * 1.5;
        
        // Progress to next Stage
        if (cameraGroup.position.z < -100) {
          cameraGroup.position.z = 10;
          setStage(prev => {
            if (prev >= 5) {
              setGameWon(true);
              setIsPlaying(false);
              return 5;
            }
            return prev + 1;
          });
        }
      }

      // Update enemies
      enemies.forEach((enemy, idx) => {
        // Move back and forth
        enemy.mesh.position.x += enemy.speed * enemy.direction;
        if (Math.abs(enemy.mesh.position.x) > 6) {
          enemy.direction *= -1;
        }

        // Float drone height
        if (enemy.type === 'drone') {
          enemy.mesh.position.y = enemy.py + Math.sin(clock.getElapsedTime() * 5 + idx) * 0.3;
        }

        // Enemy fires at player
        if (Math.random() < 0.005 && !inCover) {
          setHealth(prev => {
            const next = prev - 8;
            if (next <= 0) {
              setGameOver(true);
              setIsPlaying(false);
            }
            return Math.max(0, next);
          });
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup listeners
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(spawnInterval);
      window.removeEventListener('click', handleShoot);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPlaying, gameId, stage, inCover]);

  // -------------------------------------------------------------
  // 3D SPACE INVADERS GAME ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    if (gameId !== 'space-invaders' || !isPlaying || gameOver || gameWon) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050010, 0.02);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, -5);

    const starCount = 300;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 60;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      starPos[i * 3 + 2] = -Math.random() * 80;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xff00ff, 0.8);
    dirLight.position.set(5, 15, 5);
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(30, 30, 0x00f0ff, 0x071b2d);
    gridHelper.position.set(0, -0.5, -5);
    scene.add(gridHelper);

    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 9);
    scene.add(playerGroup);

    const shipMaterial = new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.2, metalness: 0.8 });
    const noseGeom = new THREE.ConeGeometry(0.3, 1.2, 4);
    noseGeom.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeom, shipMaterial);
    playerGroup.add(nose);

    const wingGeom = new THREE.BoxGeometry(1.6, 0.1, 0.5);
    const wings = new THREE.Mesh(wingGeom, shipMaterial);
    wings.position.set(0, -0.1, 0.2);
    playerGroup.add(wings);

    let targetX = 0;
    let currentX = 0;

    const keysPressed: { [key: string]: boolean } = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        fireLaser();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    interface Laser {
      mesh: THREE.Mesh;
      dir: number;
    }
    const lasers: Laser[] = [];

    interface Alien {
      mesh: THREE.Group;
      type: number;
      initialX: number;
      initialZ: number;
      hp: number;
    }
    let aliens: Alien[] = [];
    let alienDirection = 1;
    let alienMoveSpeed = 1.0;
    let alienDescendZ = 0;

    const spawnAlienWave = () => {
      aliens.forEach(a => scene.remove(a.mesh));
      aliens = [];

      const rows = 3;
      const cols = 5;
      const spacingX = 2.5;
      const spacingZ = 2.0;

      const colors = [0xff00ff, 0x39ff14, 0xffff00];
      for (let r = 0; r < rows; r++) {
        const alienMaterial = new THREE.MeshStandardMaterial({
          color: colors[r % colors.length],
          emissive: colors[r % colors.length],
          emissiveIntensity: 0.3,
          roughness: 0.4
        });

        for (let c = 0; c < cols; c++) {
          const alienGroup = new THREE.Group();
          const bodyGeom = new THREE.BoxGeometry(0.8, 0.6, 0.8);
          const body = new THREE.Mesh(bodyGeom, alienMaterial);
          alienGroup.add(body);

          const wingGeom = new THREE.BoxGeometry(1.2, 0.1, 0.3);
          const wing = new THREE.Mesh(wingGeom, alienMaterial);
          wing.position.y = 0.2;
          alienGroup.add(wing);

          const x = (c - (cols - 1) / 2) * spacingX;
          const z = -12 + r * spacingZ;
          alienGroup.position.set(x, 0, z);
          scene.add(alienGroup);

          aliens.push({
            mesh: alienGroup,
            type: r,
            initialX: x,
            initialZ: z,
            hp: 20 + stage * 10
          });
        }
      }
      alienMoveSpeed = 0.8 + stage * 0.3;
      alienDescendZ = 0;
    };

    spawnAlienWave();

    const laserMatPlayer = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const laserMatAlien = new THREE.MeshBasicMaterial({ color: 0xff3333 });
    const laserGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 4);
    laserGeom.rotateX(Math.PI / 2);

    const fireLaser = () => {
      const laserMesh = new THREE.Mesh(laserGeom, laserMatPlayer);
      laserMesh.position.set(playerGroup.position.x, playerGroup.position.y, playerGroup.position.z - 0.8);
      scene.add(laserMesh);
      lasers.push({ mesh: laserMesh, dir: -1 });
      playSound('shoot');
    };

    const spawnAlienLaser = (alien: Alien) => {
      const laserMesh = new THREE.Mesh(laserGeom, laserMatAlien);
      laserMesh.position.set(alien.mesh.position.x, alien.mesh.position.y, alien.mesh.position.z + 0.8);
      scene.add(laserMesh);
      lasers.push({ mesh: laserMesh, dir: 1 });
      playSound('shoot');
    };

    interface Explosion {
      points: THREE.Points;
      age: number;
      maxAge: number;
    }
    const explosions: Explosion[] = [];

    const createExplosion = (pos: THREE.Vector3, color: number) => {
      const count = 20;
      const geom = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;

        velocities[i * 3] = (Math.random() - 0.5) * 8;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 6;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 8;
      }

      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

      const mat = new THREE.PointsMaterial({
        color: color,
        size: 0.15,
        transparent: true,
        opacity: 0.9
      });

      const points = new THREE.Points(geom, mat);
      scene.add(points);
      explosions.push({ points, age: 0, maxAge: 0.3 });
    };

    const handleTouchLeft = () => { targetX = Math.max(-7, targetX - 1.2); };
    const handleTouchRight = () => { targetX = Math.min(7, targetX + 1.2); };
    const handleTouchFire = () => { fireLaser(); };

    (window as any).driftTouchLeft = handleTouchLeft;
    (window as any).driftTouchRight = handleTouchRight;
    (window as any).driftTouchFire = handleTouchFire;

    const clock = new THREE.Clock();
    let animId: number;
    let lastAlienFire = 0;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);
      
      // Auto resize WebGL renderer if container bounds change (e.g. entering/leaving fullscreen)
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (keysPressed['ArrowLeft'] || keysPressed['KeyA']) {
        targetX = Math.max(-7, targetX - delta * 12);
      }
      if (keysPressed['ArrowRight'] || keysPressed['KeyD']) {
        targetX = Math.min(7, targetX + delta * 12);
      }

      currentX += (targetX - currentX) * 0.25;
      playerGroup.position.x = currentX;

      let hitSide = false;
      aliens.forEach(a => {
        a.mesh.position.x += alienDirection * alienMoveSpeed * delta;
        a.mesh.position.z = a.initialZ + alienDescendZ;

        if (a.mesh.position.x > 7.5 || a.mesh.position.x < -7.5) {
          hitSide = true;
        }

        if (a.mesh.position.z >= 8.5) {
          setGameOver(true);
          setIsPlaying(false);
          playSound('gameover');
        }
      });

      if (hitSide) {
        alienDirection *= -1;
        alienDescendZ += 1.0;
        aliens.forEach(a => {
          a.mesh.position.x += alienDirection * alienMoveSpeed * delta;
        });
      }

      if (time - lastAlienFire > Math.max(0.5, 2.5 - stage * 0.4)) {
        if (aliens.length > 0) {
          const shooter = aliens[Math.floor(Math.random() * aliens.length)];
          spawnAlienLaser(shooter);
          lastAlienFire = time;
        }
      }

      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        l.mesh.position.z += l.dir * 18 * delta;

        if (l.dir === -1) {
          let hit = false;
          for (let j = aliens.length - 1; j >= 0; j--) {
            const a = aliens[j];
            const dist = l.mesh.position.distanceTo(a.mesh.position);
            if (dist < 1.0) {
              hit = true;
              scene.remove(l.mesh);
              lasers.splice(i, 1);

              a.hp -= 20;
              if (a.hp <= 0) {
                createExplosion(a.mesh.position, 0xff00ff);
                scene.remove(a.mesh);
                aliens.splice(j, 1);
                setScore(prev => prev + 150);
                gainXP(10);
                playSound('explosion');

                if (aliens.length === 0) {
                  playSound('clear');
                  setStage(prev => prev + 1);
                  spawnAlienWave();
                }
              } else {
                playSound('hit');
              }
              break;
            }
          }
          if (hit) continue;
        }

        if (l.dir === 1) {
          const dist = l.mesh.position.distanceTo(playerGroup.position);
          if (dist < 1.0) {
            scene.remove(l.mesh);
            lasers.splice(i, 1);
            playSound('hit');

            setHealth(prev => {
              const next = prev - 20;
              if (next <= 0) {
                setGameOver(true);
                setIsPlaying(false);
                playSound('gameover');
              }
              return Math.max(0, next);
            });
            continue;
          }
        }

        if (l.mesh.position.z < -25 || l.mesh.position.z > 25) {
          scene.remove(l.mesh);
          lasers.splice(i, 1);
        }
      }

      for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        exp.age += delta;
        const posAttr = exp.points.geometry.attributes.position as THREE.BufferAttribute;
        const velAttr = exp.points.geometry.attributes.velocity as THREE.BufferAttribute;

        for (let j = 0; j < posAttr.count; j++) {
          posAttr.setX(j, posAttr.getX(j) + velAttr.getX(j) * delta);
          posAttr.setY(j, posAttr.getY(j) + velAttr.getY(j) * delta);
          posAttr.setZ(j, posAttr.getZ(j) + velAttr.getZ(j) * delta);
        }
        posAttr.needsUpdate = true;

        if (exp.age > exp.maxAge) {
          scene.remove(exp.points);
          explosions.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      lasers.forEach(l => scene.remove(l.mesh));
      aliens.forEach(a => scene.remove(a.mesh));
      explosions.forEach(exp => scene.remove(exp.points));
      scene.remove(stars);
      scene.remove(gridHelper);
      scene.remove(playerGroup);
      delete (window as any).driftTouchLeft;
      delete (window as any).driftTouchRight;
      delete (window as any).driftTouchFire;
    };
  }, [isPlaying, gameId, stage]);

  // -------------------------------------------------------------
  // 3D TETRIS GAME ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    if (gameId !== 'tetris' || !isPlaying || gameOver || gameWon) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c001f, 0.015);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 18);
    camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00ffff, 0.8);
    dirLight.position.set(5, 10, 10);
    scene.add(dirLight);

    const cageGeom = new THREE.BoxGeometry(10, 20, 1);
    const cageEdges = new THREE.EdgesGeometry(cageGeom);
    const cageMat = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 2 });
    const cage = new THREE.LineSegments(cageEdges, cageMat);
    scene.add(cage);

    const COLS = 10;
    const ROWS = 20;
    const grid: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    const blockMeshes: (THREE.Mesh | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

    const TETROMINOES: Record<string, { shape: number[][]; color: number }> = {
      I: { shape: [[1,1,1,1]], color: 0x00ffff },
      O: { shape: [[1,1],[1,1]], color: 0xffff00 },
      T: { shape: [[0,1,0],[1,1,1]], color: 0xaa00ff },
      S: { shape: [[0,1,1],[1,1,0]], color: 0x00ff00 },
      Z: { shape: [[1,1,0],[0,1,1]], color: 0xff0000 },
      J: { shape: [[1,0,0],[1,1,1]], color: 0x0000ff },
      L: { shape: [[0,0,1],[1,1,1]], color: 0xffaa00 }
    };
    const keys = Object.keys(TETROMINOES);

    let currentShape: number[][] = [];
    let currentColor = 0x000000;
    const currentPieceGroup = new THREE.Group();
    scene.add(currentPieceGroup);

    let pieceCol = 0;
    let pieceRow = 0;

    const blockGeom = new THREE.BoxGeometry(0.95, 0.95, 0.95);

    const spawnPiece = () => {
      const type = keys[Math.floor(Math.random() * keys.length)];
      currentShape = TETROMINOES[type].shape;
      currentColor = TETROMINOES[type].color;

      pieceCol = Math.floor((COLS - currentShape[0].length) / 2);
      pieceRow = 0;

      currentPieceGroup.clear();
      const material = new THREE.MeshStandardMaterial({
        color: currentColor,
        emissive: currentColor,
        emissiveIntensity: 0.4,
        roughness: 0.2
      });

      for (let r = 0; r < currentShape.length; r++) {
        for (let c = 0; c < currentShape[r].length; c++) {
          if (currentShape[r][c] !== 0) {
            const mesh = new THREE.Mesh(blockGeom, material);
            mesh.position.set(c, -r, 0);
            currentPieceGroup.add(mesh);
          }
        }
      }

      updatePieceGroupPosition();

      if (checkCollision(pieceCol, pieceRow, currentShape)) {
        setGameOver(true);
        setIsPlaying(false);
        playSound('gameover');
      }
    };

    const updatePieceGroupPosition = () => {
      const x = pieceCol - 4.5;
      const y = 9.5 - pieceRow;
      currentPieceGroup.position.set(x, y, 0);
    };

    const checkCollision = (col: number, row: number, shape: number[][]) => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 0) {
            const nextCol = col + c;
            const nextRow = row + r;

            if (nextCol < 0 || nextCol >= COLS || nextRow >= ROWS) {
              return true;
            }

            if (nextRow >= 0 && grid[nextRow][nextCol] !== 0) {
              return true;
            }
          }
        }
      }
      return false;
    };

    const rotateShape = (shape: number[][]) => {
      const rCount = shape.length;
      const cCount = shape[0].length;
      const rotated = Array.from({ length: cCount }, () => Array(rCount).fill(0));
      for (let r = 0; r < rCount; r++) {
        for (let c = 0; c < cCount; c++) {
          rotated[c][rCount - 1 - r] = shape[r][c];
        }
      }
      return rotated;
    };

    const rotatePiece = () => {
      const nextShape = rotateShape(currentShape);
      if (!checkCollision(pieceCol, pieceRow, nextShape)) {
        currentShape = nextShape;
        currentPieceGroup.clear();
        const material = new THREE.MeshStandardMaterial({
          color: currentColor,
          emissive: currentColor,
          emissiveIntensity: 0.4,
          roughness: 0.2
        });
        for (let r = 0; r < currentShape.length; r++) {
          for (let c = 0; c < currentShape[r].length; c++) {
            if (currentShape[r][c] !== 0) {
              const mesh = new THREE.Mesh(blockGeom, material);
              mesh.position.set(c, -r, 0);
              currentPieceGroup.add(mesh);
            }
          }
        }
        updatePieceGroupPosition();
        playSound('land');
      }
    };

    const movePiece = (dirCol: number, dirRow: number) => {
      const nextCol = pieceCol + dirCol;
      const nextRow = pieceRow + dirRow;

      if (!checkCollision(nextCol, nextRow, currentShape)) {
        pieceCol = nextCol;
        pieceRow = nextRow;
        updatePieceGroupPosition();
        return true;
      }
      return false;
    };

    const lockPiece = () => {
      const material = new THREE.MeshStandardMaterial({
        color: currentColor,
        roughness: 0.3,
        metalness: 0.1
      });

      for (let r = 0; r < currentShape.length; r++) {
        for (let c = 0; c < currentShape[r].length; c++) {
          if (currentShape[r][c] !== 0) {
            const nextCol = pieceCol + c;
            const nextRow = pieceRow + r;

            if (nextRow >= 0 && nextRow < ROWS && nextCol >= 0 && nextCol < COLS) {
              grid[nextRow][nextCol] = currentColor;

              const mesh = new THREE.Mesh(blockGeom, material);
              mesh.position.set(nextCol - 4.5, 9.5 - nextRow, 0);
              scene.add(mesh);
              blockMeshes[nextRow][nextCol] = mesh;
            }
          }
        }
      }

      currentPieceGroup.clear();
      playSound('land');
      checkLines();
      spawnPiece();
    };

    const checkLines = () => {
      let linesCleared = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        const isFull = grid[r].every(val => val !== 0);
        if (isFull) {
          linesCleared++;
          for (let c = 0; c < COLS; c++) {
            const mesh = blockMeshes[r][c];
            if (mesh) {
              scene.remove(mesh);
            }
            grid[r][c] = 0;
            blockMeshes[r][c] = null;
          }

          for (let rShift = r; rShift > 0; rShift--) {
            grid[rShift] = [...grid[rShift - 1]];
            blockMeshes[rShift] = [...blockMeshes[rShift - 1]];
            for (let c = 0; c < COLS; c++) {
              const mesh = blockMeshes[rShift][c];
              if (mesh) {
                mesh.position.y = 9.5 - rShift;
              }
            }
          }
          grid[0] = Array(COLS).fill(0);
          blockMeshes[0] = Array(COLS).fill(null);
          r++;
        }
      }

      if (linesCleared > 0) {
        setScore(prev => prev + linesCleared * 200 * stage);
        gainXP(linesCleared * 15);
        playSound('clear');
        if (Math.random() < 0.3) {
          setStage(prev => Math.min(10, prev + 1));
        }
      }
    };

    const handleTetrisLeft = () => { movePiece(-1, 0); };
    const handleTetrisRight = () => { movePiece(1, 0); };
    const handleTetrisRotate = () => { rotatePiece(); };
    const handleTetrisDrop = () => {
      if (!movePiece(0, 1)) {
        lockPiece();
      }
    };

    (window as any).driftTetrisLeft = handleTetrisLeft;
    (window as any).driftTetrisRight = handleTetrisRight;
    (window as any).driftTetrisRotate = handleTetrisRotate;
    (window as any).driftTetrisDrop = handleTetrisDrop;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        movePiece(-1, 0);
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        movePiece(1, 0);
      }
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyR') {
        e.preventDefault();
        rotatePiece();
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        if (!movePiece(0, 1)) {
          lockPiece();
        }
      }
      if (e.code === 'Space') {
        e.preventDefault();
        while (movePiece(0, 1)) {}
        lockPiece();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    spawnPiece();

    let animId: number;
    let lastDropTime = 0;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);
      
      // Auto resize WebGL renderer if container bounds change (e.g. entering/leaving fullscreen)
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }

      const time = clock.getElapsedTime();

      const dropSpeed = Math.max(0.1, 1.0 - stage * 0.08);
      if (time - lastDropTime > dropSpeed) {
        if (!movePiece(0, 1)) {
          lockPiece();
        }
        lastDropTime = time;
      }

      camera.position.x = Math.sin(time * 0.8) * 1.5;
      camera.position.y = Math.cos(time * 0.8) * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    const clock = new THREE.Clock();
    gameLoop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      scene.remove(cage);
      scene.remove(currentPieceGroup);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const mesh = blockMeshes[r][c];
          if (mesh) scene.remove(mesh);
        }
      }
      delete (window as any).driftTetrisLeft;
      delete (window as any).driftTetrisRight;
      delete (window as any).driftTetrisRotate;
      delete (window as any).driftTetrisDrop;
    };
  }, [isPlaying, gameId, stage]);

  // Game startup initializer
  const startGame = () => {
    setScore(0);
    setHealth(100);
    setAmmo(maxAmmo);
    setStage(1);
    setGameOver(false);
    setGameWon(false);
    setIsPlaying(true);
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
    <div className="w-full flex-grow bg-[#090311] py-8 px-4 md:px-8 flex flex-col items-center relative overflow-hidden" ref={containerRef}>
      
      {/* Background elements */}
      <div className="absolute inset-0 bg-cyber-grid opacity-5 pointer-events-none z-0"></div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Main gameplay panel */}
        <div className={`flex-grow flex flex-col items-center transition-all ${isTheaterMode ? 'w-full' : 'lg:w-[70%]'}`}>
          
          {/* Header controls overlay */}
          <div className="flex justify-between w-full mb-4 items-center">
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wider neon-text uppercase">{game.title}</h2>
              <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest">{game.category} TERMINAL</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className="text-[10px] font-mono font-bold tracking-widest px-3 py-1.5 border border-neon-purple text-neon-purple hover:bg-neon-purple/20 hover:text-white rounded transition-all duration-300"
              >
                [ {isTheaterMode ? 'STANDARD_MODE' : 'THEATER_MODE'} ]
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-[10px] font-mono font-bold tracking-widest px-3 py-1.5 border border-neon-blue text-neon-blue hover:bg-neon-blue/20 hover:text-white rounded transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
              >
                [ ⛶ FULLSCREEN ]
              </button>
            </div>
          </div>

          {/* CRT Cabinet Box Frame */}
          <div 
            ref={cabinetRef}
            className={`relative bg-black transition-all duration-300 flex items-center justify-center ${
              isFullscreen 
                ? 'fixed inset-0 w-screen h-screen z-50 border-0 rounded-none' 
                : isTheaterMode
                ? 'w-full aspect-[21/9] border-4 border-neon-pink rounded-xl overflow-hidden shadow-[0_0_40px_rgba(255,0,255,0.4)]'
                : 'w-full aspect-[4/3] max-w-2xl border-4 border-neon-pink rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,0,255,0.3)]'
            }`}
          >
            {/* Exit Fullscreen overlay */}
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 z-40 text-xs font-mono font-bold tracking-widest px-3 py-1.5 bg-black/80 border border-neon-pink text-neon-pink hover:bg-neon-pink/20 hover:text-white rounded transition-all"
              >
                EXIT FULLSCREEN [ESC]
              </button>
            )}

            {/* Retro CRT Overlays */}
            <div className="absolute inset-0 scanlines pointer-events-none z-10 opacity-30"></div>
            <div className="absolute inset-0 bg-radial-crt pointer-events-none z-15"></div>

            {/* Menu Panel HUD */}
            {!isPlaying && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-20 gap-4">
                {gameOver && <h3 className="text-4xl text-neon-pink font-black tracking-wider animate-pulse neon-text">SYS_COLLAPSE: GAME OVER</h3>}
                {gameWon && <h3 className="text-4xl text-neon-blue font-black tracking-wider animate-pulse neon-text">SYS_CLEARED: VICTORY</h3>}
                <button
                  onClick={startGame}
                  className="neon-button text-xl px-8 py-3 bg-neon-pink/30 hover:bg-neon-pink/50 transition border border-neon-pink rounded-lg font-bold tracking-widest"
                >
                  {gameOver ? 'RELOAD_TERMINAL' : gameWon ? 'PLAY_AGAIN' : 'BOOT_GAME_SIGNAL'}
                </button>
              </div>
            )}

            {/* Dynamic Game Rendering Canvas */}
            {gameId === 'captn-ghost' || gameId === 'space-invaders' || gameId === 'tetris' ? (
              <canvas
                ref={canvasRef}
                className="w-full h-full bg-[#05000a] block cursor-crosshair"
              />
            ) : (
              // Fallback default iframe for legacy HTML5 games
              isPlaying ? (
                <iframe
                  src={game.embedUrl || 'https://hextris.github.io/hextris/'}
                  className="w-full h-full border-none bg-black"
                  allow="autoplay; gamepad; keyboard; fullscreen"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              ) : (
                <div className="w-full h-full bg-[#0a000f] flex items-center justify-center text-text-secondary">
                  <div className="text-center p-4">
                    <p className="text-lg font-semibold text-neon-blue mb-2">Preparing External Subgrid...</p>
                    <p className="text-xs text-slate-500 font-mono">Connect to open-source game host via iframe tunnel</p>
                  </div>
                </div>
              )
            )}

            {/* Captn.Ghost HUD Overlay */}
            {isPlaying && gameId === 'captn-ghost' && (
              <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between pointer-events-none font-mono text-xs select-none">
                
                {/* Health & Armor */}
                <div className="flex flex-col gap-1 p-2 rounded bg-black/60 border border-neon-pink/30 text-neon-pink shadow-[0_0_8px_rgba(255,0,255,0.15)]">
                  <div className="font-bold">HEV_HEALTH: {health}%</div>
                  <div className="w-24 bg-[#1b0d2d] h-1.5 rounded overflow-hidden">
                    <div className="bg-neon-pink h-full" style={{ width: `${health}%` }} />
                  </div>
                </div>

                {/* Tactical HUD center cover indicator */}
                {inCover && (
                  <div className="self-center px-4 py-1.5 rounded border border-neon-blue bg-black/80 text-neon-blue animate-pulse font-extrabold text-sm tracking-wider">
                    DODGING IN COVER (RELOADING)
                  </div>
                )}

                {/* Score and Stage */}
                <div className="flex flex-col gap-1 items-center p-2 rounded bg-black/60 border border-neon-blue/30 text-neon-blue shadow-[0_0_8px_rgba(0,240,255,0.15)]">
                  <div className="font-bold">STAGE: {stage} / 5</div>
                  <div>SCORE: {score.toLocaleString()}</div>
                </div>

                {/* Ammo indicator */}
                <div className="flex flex-col gap-1 items-end p-2 rounded bg-black/60 border border-neon-blue/30 text-neon-blue shadow-[0_0_8px_rgba(0,240,255,0.15)]">
                  <div className="font-bold">MAG: {ammo} / {maxAmmo}</div>
                  <div className="w-20 bg-[#071b2d] h-1.5 rounded overflow-hidden flex justify-end">
                    <div className="bg-neon-blue h-full" style={{ width: `${(ammo / maxAmmo) * 100}%` }} />
                  </div>
                </div>

              </div>
            )}

            {/* Space Invaders HUD Overlay */}
            {isPlaying && gameId === 'space-invaders' && (
              <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between pointer-events-none font-mono text-xs select-none">
                <div className="flex flex-col gap-1 p-2 rounded bg-black/60 border border-neon-pink/30 text-neon-pink">
                  <div className="font-bold">SHIP_INTEGRITY: {health}%</div>
                  <div className="w-24 bg-[#1b0d2d] h-1.5 rounded overflow-hidden">
                    <div className="bg-neon-pink h-full" style={{ width: `${health}%` }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-center p-2 rounded bg-black/60 border border-neon-blue/30 text-neon-blue">
                  <div className="font-bold">STAGE: {stage}</div>
                  <div>SCORE: {score.toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Tetris HUD Overlay */}
            {isPlaying && gameId === 'tetris' && (
              <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between pointer-events-none font-mono text-xs select-none">
                <div className="flex flex-col gap-1 p-2 rounded bg-black/60 border border-neon-pink/30 text-neon-pink">
                  <div className="font-bold">SPEED_MULT: x{stage}</div>
                </div>
                <div className="flex flex-col gap-1 items-center p-2 rounded bg-black/60 border border-neon-blue/30 text-neon-blue">
                  <div className="font-bold">GRID LEVEL: {stage}</div>
                  <div>SCORE: {score.toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Mobile Touch Controls Overlays */}
            {isPlaying && isMobile && (gameId === 'space-invaders' || gameId === 'tetris') && (
              <div className="absolute inset-x-0 bottom-16 z-30 flex justify-center gap-6 px-4 pointer-events-auto">
                {gameId === 'space-invaders' && (
                  <div className="flex gap-4 w-full justify-between items-center max-w-sm">
                    <div className="flex gap-2 animate-glow">
                      <button
                        onTouchStart={() => (window as any).driftTouchLeft?.()}
                        className="w-12 h-12 rounded-full border border-neon-blue bg-black/80 text-neon-blue text-lg font-bold active:bg-neon-blue active:text-black flex items-center justify-center select-none"
                      >
                        ◀
                      </button>
                      <button
                        onTouchStart={() => (window as any).driftTouchRight?.()}
                        className="w-12 h-12 rounded-full border border-neon-blue bg-black/80 text-neon-blue text-lg font-bold active:bg-neon-blue active:text-black flex items-center justify-center select-none"
                      >
                        ▶
                      </button>
                    </div>
                    <button
                      onTouchStart={() => (window as any).driftTouchFire?.()}
                      className="w-16 h-16 rounded-full border-2 border-neon-pink bg-black/80 text-neon-pink text-xs font-black tracking-widest active:bg-neon-pink active:text-black flex items-center justify-center select-none"
                    >
                      FIRE
                    </button>
                  </div>
                )}
                {gameId === 'tetris' && (
                  <div className="flex gap-4 w-full justify-between items-center max-w-sm">
                    <div className="flex gap-2">
                      <button
                        onTouchStart={() => (window as any).driftTetrisLeft?.()}
                        className="w-10 h-10 rounded-full border border-neon-blue bg-black/80 text-neon-blue text-base font-bold active:bg-neon-blue active:text-black flex items-center justify-center select-none"
                      >
                        ◀
                      </button>
                      <button
                        onTouchStart={() => (window as any).driftTetrisRight?.()}
                        className="w-10 h-10 rounded-full border border-neon-blue bg-black/80 text-neon-blue text-base font-bold active:bg-neon-blue active:text-black flex items-center justify-center select-none"
                      >
                        ▶
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onTouchStart={() => (window as any).driftTetrisRotate?.()}
                        className="w-12 h-12 rounded-full border-2 border-neon-purple bg-black/80 text-neon-purple text-xs font-bold active:bg-neon-purple active:text-black flex items-center justify-center select-none"
                      >
                        ROT
                      </button>
                      <button
                        onTouchStart={() => (window as any).driftTetrisDrop?.()}
                        className="w-12 h-12 rounded-full border-2 border-neon-pink bg-black/80 text-neon-pink text-xs font-bold active:bg-neon-pink active:text-black flex items-center justify-center select-none"
                      >
                        DROP
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* How to play Cheatsheet */}
          <div className="cyber-card p-6 mt-8 w-full text-text-secondary">
            <h3 className="text-lg font-bold text-white mb-3 tracking-wider uppercase font-sans border-b border-white/10 pb-2">
              👾 TRANSMISSION PARAMETERS & CONTROLS
            </h3>
            {gameId === 'captn-ghost' ? (
              <ul className="list-disc pl-5 flex flex-col gap-2 font-mono text-xs text-text-secondary">
                <li><strong className="text-neon-blue">AIMING / ROTATION</strong>: Move your mouse around the grid screen. The camera and scopes will sway smoothly.</li>
                <li><strong className="text-neon-blue">FIRE LASER GUN</strong>: Left click anywhere on the target screen. Recoils gun and consumes ammo.</li>
                <li><strong className="text-neon-pink">TAKE COVER / RELOAD</strong>: Hold the <kbd className="bg-black border border-neon-pink px-2 py-0.5 rounded text-white text-[10px]">SPACEBAR</kbd>. Translates the camera down, shields you from laser fire, and reloads your ammunition clip.</li>
                <li><strong className="text-neon-pink">MANUAL RELOAD</strong>: Press <kbd className="bg-black border border-neon-pink px-2 py-0.5 rounded text-white text-[10px]">R</kbd> keys.</li>
              </ul>
            ) : gameId === 'space-invaders' ? (
              <ul className="list-disc pl-5 flex flex-col gap-2 font-mono text-xs text-text-secondary">
                <li><strong className="text-neon-blue">STEER SHIP</strong>: Press <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">A</kbd> / <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">D</kbd> or <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">Left</kbd> / <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">Right</kbd> arrows.</li>
                <li><strong className="text-neon-blue">FIRE LASER</strong>: Press the <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">SPACEBAR</kbd> key.</li>
                <li><strong className="text-neon-pink">MOBILE</strong>: Tap the on-screen Left/Right arrows to move, and the pink FIRE button to shoot.</li>
              </ul>
            ) : gameId === 'tetris' ? (
              <ul className="list-disc pl-5 flex flex-col gap-2 font-mono text-xs text-text-secondary">
                <li><strong className="text-neon-blue">SLIDE BLOCKS</strong>: Press <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">A</kbd> / <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">D</kbd> or <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">Left</kbd> / <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">Right</kbd> arrows.</li>
                <li><strong className="text-neon-blue">ROTATE PIECE</strong>: Press <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">W</kbd> or <kbd className="bg-black border border-neon-blue px-2 py-0.5 rounded text-white text-[10px]">Up</kbd> arrow.</li>
                <li><strong className="text-neon-pink">SOFT DROP</strong>: Press <kbd className="bg-black border border-neon-pink px-2 py-0.5 rounded text-white text-[10px]">S</kbd> or <kbd className="bg-black border border-neon-pink px-2 py-0.5 rounded text-white text-[10px]">Down</kbd> arrow.</li>
                <li><strong className="text-neon-pink">HARD DROP</strong>: Press the <kbd className="bg-black border border-neon-pink px-2 py-0.5 rounded text-white text-[10px]">SPACEBAR</kbd> key.</li>
                <li><strong className="text-neon-blue">MOBILE</strong>: Use the on-screen direction controls and rotate/drop action pads.</li>
              </ul>
            ) : (
              <p className="text-xs font-mono">{game.description || 'Access open-source game. Enjoy!'}</p>
            )}
          </div>

          {/* Review comments thread */}
          <div className="cyber-card p-6 mt-8 w-full text-text-secondary flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white tracking-wider uppercase font-sans border-b border-white/10 pb-2">
              📝 DRIFTER COMMS CENTER (REVIEWS)
            </h3>

            {/* Form */}
            <form onSubmit={handlePostReview} className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-neon-blue">POST TELEMETRY TRANSMISSION:</span>
                
                {/* Rating selection */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono">STARS:</span>
                  <div className="flex bg-black/40 rounded p-1 border border-white/5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`w-6 h-6 text-xs transition-all ${
                          reviewRating >= star ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your game review or report telemetry data..."
                rows={3}
                required
                className="w-full bg-[#150a21]/60 border border-neon-pink/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 font-mono text-xs focus:outline-none focus:border-neon-pink focus:shadow-[0_0_8px_rgba(255,0,255,0.2)] resize-none"
              />

              <button
                type="submit"
                className="neon-button self-end font-bold tracking-widest text-xs py-2 px-6 uppercase"
              >
                BROADCAST REVIEW
              </button>
            </form>

            {/* Comments list */}
            <div className="flex flex-col gap-3.5 mt-2 max-h-80 overflow-y-auto pr-2 scrollbar-none">
              {(comments[gameId] || []).length > 0 ? (
                (comments[gameId] || []).map((comm: GameComment) => (
                  <div key={comm.id} className="p-3 bg-black/40 border border-white/5 rounded-lg flex flex-col gap-2 transition-all hover:border-neon-blue/10">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-neon-blue font-bold">{comm.username}</span>
                      <span className="text-gray-600">{comm.date}</span>
                    </div>
                    <div className="flex text-yellow-400 text-[10px]">
                      {Array.from({ length: comm.rating }).map((_, i) => <span key={i}>★</span>)}
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed font-sans">{comm.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center font-mono text-xs text-gray-500 py-6">
                  No transmissions found. Be the first to broadcast telemetry for this node.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar recommendations widget */}
        {!isTheaterMode && (
          <div className="w-full lg:w-[30%] flex flex-col gap-6 flex-shrink-0">
            <h3 className="text-base font-bold text-white tracking-widest font-mono border-b border-neon-blue/20 pb-2 uppercase pl-1">
              ⚡ SIMILAR UPLINKS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {relatedGames.map(game => (
                <div key={game.id} className="w-full">
                  <InteractiveGameCard game={game} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
