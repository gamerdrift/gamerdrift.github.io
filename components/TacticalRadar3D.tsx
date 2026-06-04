"use client";

import React, { useEffect, useRef } from 'react';

export default function TacticalRadar3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null);
  const threeInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let active = true;
    let frameId: number;

    const initThree = async () => {
      try {
        // Try importing Three.js dynamically
        const THREE = await import('three');
        if (!active || !containerRef.current) return;

        const width = containerRef.current.clientWidth || 400;
        const height = containerRef.current.clientHeight || 400;

        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        camera.position.set(0, 150, 200);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        containerRef.current.appendChild(renderer.domElement);
        threeInitialized.current = true;

        // Hide fallback canvas if WebGL works
        if (fallbackCanvasRef.current) {
          fallbackCanvasRef.current.style.display = 'none';
        }

        // 2. Add Wireframe Radar Grid Plane
        const gridHelper = new THREE.GridHelper(200, 20, 0x00f0ff, 0x00f0ff);
        (gridHelper.material as any).opacity = 0.25;
        (gridHelper.material as any).transparent = true;
        scene.add(gridHelper);

        // 3. Add Concentric Circles (sonar rings)
        const ringGeo1 = new THREE.RingGeometry(40, 41, 64);
        const ringGeo2 = new THREE.RingGeometry(80, 81, 64);
        const ringGeo3 = new THREE.RingGeometry(120, 121, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
        
        const ring1 = new THREE.Mesh(ringGeo1, ringMat);
        const ring2 = new THREE.Mesh(ringGeo2, ringMat);
        const ring3 = new THREE.Mesh(ringGeo3, ringMat);
        
        ring1.rotation.x = Math.PI / 2;
        ring2.rotation.x = Math.PI / 2;
        ring3.rotation.x = Math.PI / 2;
        
        scene.add(ring1);
        scene.add(ring2);
        scene.add(ring3);

        // 4. Central Rotating Wireframe Diamond (Represents Tactical Game Art)
        const octaGeo = new THREE.OctahedronGeometry(25, 1);
        const octaMat = new THREE.MeshBasicMaterial({
          color: 0xff9f00, // tactical amber
          wireframe: true,
          transparent: true,
          opacity: 0.8
        });
        const targetMesh = new THREE.Mesh(octaGeo, octaMat);
        targetMesh.position.y = 15;
        scene.add(targetMesh);

        // 5. Radar Sweep Blade
        const sweepGeo = new THREE.PlaneGeometry(120, 120);
        const sweepMat = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.1,
          blending: THREE.AdditiveBlending
        });
        const sweepMesh = new THREE.Mesh(sweepGeo, sweepMat);
        sweepMesh.rotation.x = Math.PI / 2;
        scene.add(sweepMesh);

        // 6. Floating Sandstorm Particle System
        const particleCount = 200;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 200;     // X
          positions[i+1] = Math.random() * 80;            // Y (elevation)
          positions[i+2] = (Math.random() - 0.5) * 200;   // Z
        }
        
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMat = new THREE.PointsMaterial({
          color: 0xff9f00, // Amber particles
          size: 1.5,
          transparent: true,
          opacity: 0.6
        });
        
        const particlesSystem = new THREE.Points(particleGeo, particleMat);
        scene.add(particlesSystem);

        // 7. Animation Loop
        const animate = () => {
          if (!active) return;
          
          targetMesh.rotation.y += 0.01;
          targetMesh.rotation.x += 0.005;
          
          // Sweep sweep rotates
          sweepMesh.rotation.z -= 0.02;
          
          // Shift particles (sandstorm simulation)
          const positionsArr = particlesSystem.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount * 3; i += 3) {
            positionsArr[i] += 0.4; // drift X
            positionsArr[i+2] += 0.2; // drift Z
            if (positionsArr[i] > 100) positionsArr[i] = -100;
            if (positionsArr[i+2] > 100) positionsArr[i+2] = -100;
          }
          particlesSystem.geometry.attributes.position.needsUpdate = true;

          renderer.render(scene, camera);
          frameId = requestAnimationFrame(animate);
        };
        
        animate();

        // Handle Resizing
        const handleResize = () => {
          if (!containerRef.current) return;
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (containerRef.current && renderer.domElement) {
            containerRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
        };

      } catch (err) {
        console.warn('Three.js initialization skipped, loading 2D fallback radar sweep:', err);
        initFallback2D();
      }
    };

    // 2D Vector Radar Fallback
    const initFallback2D = () => {
      const canvas = fallbackCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 380;
      canvas.width = size;
      canvas.height = size;
      const center = size / 2;
      let angle = 0;

      // Seed targets
      const targets = [
        { r: 70, theta: 0.5, size: 4, label: 'CAT_RCR_1' },
        { r: 120, theta: 2.1, size: 3, label: 'GHOST_AGNT_4' },
        { r: 150, theta: 4.8, size: 5, label: 'BASE_HQ' }
      ];

      const draw2D = () => {
        if (!active) return;
        ctx.fillStyle = 'rgba(5, 7, 10, 0.2)'; // trail sweep effect
        ctx.fillRect(0, 0, size, size);

        // Outer scopes rings
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1;
        for (let r = 40; r <= 160; r += 40) {
          ctx.beginPath();
          ctx.arc(center, center, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Radar sweep line
        angle += 0.015;
        const sweepX = center + Math.cos(angle) * 160;
        const sweepY = center + Math.sin(angle) * 160;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(sweepX, sweepY);
        ctx.stroke();

        // Cross sectors
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(center - 170, center);
        ctx.lineTo(center + 170, center);
        ctx.moveTo(center, center - 170);
        ctx.lineTo(center, center + 170);
        ctx.stroke();

        // Targets
        targets.forEach(t => {
          const x = center + Math.cos(t.theta) * t.r;
          const y = center + Math.sin(t.theta) * t.r;
          
          // Draw target node dot
          ctx.fillStyle = '#ff9f00'; // Amber targets
          ctx.beginPath();
          ctx.arc(x, y, t.size, 0, Math.PI * 2);
          ctx.fill();

          // Blinking wireframe brackets
          if (Math.abs(angle % (Math.PI * 2) - t.theta) < 0.4) {
            ctx.strokeStyle = '#39ff14';
            ctx.strokeRect(x - 8, y - 8, 16, 16);
            ctx.fillStyle = '#39ff14';
            ctx.font = '8px monospace';
            ctx.fillText(t.label, x + 10, y - 3);
          }
        });

        frameId = requestAnimationFrame(draw2D);
      };

      draw2D();
    };

    // Run loader
    initThree();

    return () => {
      active = false;
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center bg-black/40 border border-[#00f0ff]/10 p-4">
      {/* Three.js container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      
      {/* 2D Canvas fallback */}
      <canvas 
        ref={fallbackCanvasRef} 
        className="block relative z-10 border border-slate-900 bg-black/80 rounded-full"
      />

      {/* Grid overlay aesthetics */}
      <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500 uppercase tracking-widest">SONAR_HUD_ACTIVE // 3D_VECTOR</div>
      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-[#00f0ff] uppercase tracking-wider animate-pulse">GRID_ALIGN_SECURE</div>
    </div>
  );
}
