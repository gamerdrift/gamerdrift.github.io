"use client";

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useUser } from '../lib/state/UserContext';
import { useChat } from '../lib/state/ChatContext';
import { isFirebaseMock } from '../lib/firebase';

// Strategic default map targets
const STRATEGIC_LOCATIONS = [
  { name: "PENTAGON HQ", coords: [38.8719, -77.0563] as [number, number], desc: "US Command Grid - Cyber Defense Division", code: "SEC-USA-NORAD" },
  { name: "TOKYO HQ NODE", coords: [35.6762, 139.6503] as [number, number], desc: "Eastern Sector Gateway - Quantum Relay", code: "SEC-JPN-QGATE" },
  { name: "CHERNOBYL GRID", coords: [51.2741, 30.2241] as [number, number], desc: "Secondary Sarcophagus Energy Node", code: "SEC-UKR-CORE" },
  { name: "SYDNEY OUTPOST", coords: [-33.8688, 151.2093] as [number, number], desc: "Southern Hemisphere Uplink Grid", code: "SEC-AUS-UPNK" },
  { name: "GIBRALTAR GATE", coords: [36.1408, -5.3536] as [number, number], desc: "Mediterranean Comm-Line Monitor", code: "SEC-GIB-GATE" },
  { name: "GAMERDRIFT CORE", coords: [12.9716, 77.5946] as [number, number], desc: "Primary Server Center Cluster", code: "SEC-IND-BLR" },
];

// Beacon Types
type BeaconType = 'comms' | 'strike' | 'supply' | 'hazard';

interface Beacon {
  id: string;
  type: BeaconType;
  coords: [number, number];
  name: string;
  timestamp: string;
}

// Interactive sound synthesizer utilizing Web Audio API
class TacticalAudio {
  private ctx: AudioContext | null = null;
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.2;

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      
      this.startHum();
    } catch (e) {
      console.warn("Audio Context initialization failed:", e);
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  getMuted() {
    return this.isMuted;
  }

  getVolume() {
    return this.volume;
  }

  private startHum() {
    if (!this.ctx || !this.masterGain) return;
    try {
      this.humOsc1 = this.ctx.createOscillator();
      this.humOsc2 = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();

      this.humOsc1.type = 'sine';
      this.humOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // Low 55Hz hum

      this.humOsc2.type = 'triangle';
      this.humOsc2.frequency.setValueAtTime(110, this.ctx.currentTime); // 110Hz upper hum

      this.humGain.gain.setValueAtTime(0.015, this.ctx.currentTime); // Quiet background volume

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.humOsc1.connect(this.humGain);
      this.humOsc2.connect(this.humGain);
      this.humGain.connect(filter);
      filter.connect(this.masterGain);

      this.humOsc1.start();
      this.humOsc2.start();
    } catch (e) {
      console.warn("Server hum generation failed:", e);
    }
  }

  playClick(freq = 1000, duration = 0.04) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playSonarPing() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const time = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, time);
      osc.frequency.exponentialRampToValueAtTime(220, time + 2.0);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 2.0);

      const delay = this.ctx.createDelay();
      delay.delayTime.setValueAtTime(0.4, time);

      const feedback = this.ctx.createGain();
      feedback.gain.setValueAtTime(0.35, time);

      osc.connect(gain);
      gain.connect(this.masterGain);

      gain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      feedback.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 2.1);
    } catch (e) {}
  }

  playDegauss() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const time = this.ctx.currentTime;
      
      // Synthesize raw tube discharge static
      const bufferSize = this.ctx.sampleRate * 1.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

      const lowOsc = this.ctx.createOscillator();
      lowOsc.type = 'sawtooth';
      lowOsc.frequency.setValueAtTime(150, time);
      lowOsc.frequency.linearRampToValueAtTime(12, time + 1.0);

      const lowGain = this.ctx.createGain();
      lowGain.gain.setValueAtTime(0.25, time);
      lowGain.gain.linearRampToValueAtTime(0.001, time + 1.0);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, time);
      filter.frequency.exponentialRampToValueAtTime(30, time + 1.2);

      noise.connect(noiseGain);
      lowOsc.connect(lowGain);

      noiseGain.connect(filter);
      lowGain.connect(filter);
      filter.connect(this.masterGain);

      noise.start(time);
      noise.stop(time + 1.3);
      lowOsc.start(time);
      lowOsc.stop(time + 1.1);
    } catch (e) {}
  }

  playAlarm() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const time = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, time);
      osc.frequency.linearRampToValueAtTime(780, time + 0.25);
      osc.frequency.linearRampToValueAtTime(520, time + 0.5);

      gain.gain.setValueAtTime(0.07, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.65);
    } catch (e) {}
  }

  cleanup() {
    if (this.humOsc1) { try { this.humOsc1.stop(); } catch(e){} }
    if (this.humOsc2) { try { this.humOsc2.stop(); } catch(e){} }
    if (this.ctx) {
      try { this.ctx.close(); } catch(e){}
      this.ctx = null;
    }
  }
}

// 360 Degree Radar Sweep Widget Component
const RadarCanvas = ({ themeColor }: { themeColor: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let angle = 0;
    
    // Aesthetic radar detections
    const blips = [
      { x: 0.45, y: -0.35, size: 4.5, alpha: 0, label: "TGT-BETA" },
      { x: -0.55, y: 0.45, size: 5.0, alpha: 0, label: "DRN-SEC" },
      { x: 0.6, y: 0.6, size: 3.5, alpha: 0, label: "GLT-NODE" },
      { x: -0.3, y: -0.65, size: 4.0, alpha: 0, label: "BCN-ACTV" },
    ];
    
    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = Math.min(cx, cy) - 8;
      
      // Base grids
      ctx.strokeStyle = `${themeColor}22`;
      ctx.lineWidth = 1;
      
      // Range rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * (i / 4), 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Core axes
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();
      
      // Scan Sweep Beam
      angle = (angle + 0.012) % (Math.PI * 2);
      ctx.strokeStyle = `${themeColor}aa`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      ctx.stroke();
      
      // Draw trailing sweep wedge
      ctx.fillStyle = `${themeColor}0b`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle - 0.5, angle);
      ctx.closePath();
      ctx.fill();
      
      // Plot target blips
      blips.forEach(blip => {
        const bx = cx + blip.x * r;
        const by = cy + blip.y * r;
        
        let blipAngle = Math.atan2(blip.y, blip.x);
        if (blipAngle < 0) blipAngle += Math.PI * 2;
        
        const diff = Math.abs(angle - blipAngle);
        if (diff < 0.05) {
          blip.alpha = 1.0;
        }
        
        if (blip.alpha > 0) {
          ctx.beginPath();
          ctx.arc(bx, by, blip.size, 0, Math.PI * 2);
          ctx.fillStyle = `${themeColor}${Math.floor(blip.alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = themeColor;
          ctx.fill();
          
          // Halos
          ctx.beginPath();
          ctx.arc(bx, by, blip.size * 2 * (1.5 - blip.alpha), 0, Math.PI * 2);
          ctx.strokeStyle = `${themeColor}${Math.floor(blip.alpha * 60).toString(16).padStart(2, '0')}`;
          ctx.stroke();
          
          ctx.shadowBlur = 0; // reset
          
          // Floating Label text
          ctx.fillStyle = `${themeColor}${Math.floor(blip.alpha * 160).toString(16).padStart(2, '0')}`;
          ctx.font = '7px monospace';
          ctx.fillText(blip.label, bx + 6, by + 2);
          
          blip.alpha -= 0.003;
        }
      });
      
      animationId = requestAnimationFrame(draw);
    };
    
    draw();
    return () => cancelAnimationFrame(animationId);
  }, [themeColor]);
  
  return (
    <div className="relative p-0.5 bg-black/40 border border-slate-900 rounded-lg">
      <canvas ref={canvasRef} width={105} height={105} className="mx-auto block" />
      <div className="absolute top-0.5 right-1.5 text-[6.5px] text-slate-500 font-mono tracking-widest uppercase">SWEEP: ACTIVE</div>
    </div>
  );
};

// Telemetry graph visualizer
const TelemetryGraph = ({ themeColor }: { themeColor: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    const bars = 20;
    const width = 5;
    const gap = 1.5;
    const heights = Array(bars).fill(0).map(() => Math.random() * 16 + 4);
    
    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = `${themeColor}bb`;
      for (let i = 0; i < bars; i++) {
        heights[i] += (Math.random() - 0.5) * 3;
        if (heights[i] < 2) heights[i] = 2;
        if (heights[i] > canvas.height - 3) heights[i] = canvas.height - 3;
        
        const x = i * (width + gap) + 4;
        const y = canvas.height - heights[i];
        
        ctx.fillRect(x, y, width, heights[i]);
        
        // draw peak marker
        ctx.fillStyle = themeColor;
        ctx.fillRect(x, y - 1, width, 1);
        ctx.fillStyle = `${themeColor}bb`;
      }
      
      animationId = requestAnimationFrame(draw);
    };
    
    draw();
    return () => cancelAnimationFrame(animationId);
  }, [themeColor]);
  
  return (
    <canvas ref={canvasRef} width={135} height={25} className="bg-black/50 border border-slate-900/60 rounded block mx-auto" />
  );
};

export default function TacticalWorldMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const activeSweepMarkersRef = useRef<L.Marker[]>([]);
  const meshLinesRef = useRef<L.Polyline[]>([]);
  const beaconsRef = useRef<{ [key: string]: L.Marker }>({});
  
  // Tile layer refs for seamless dynamic changing
  const vectorLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);

  // Audio Synthesizer Class Ref
  const audioSynthRef = useRef<TacticalAudio>(new TacticalAudio());

  // Interactive Configuration States
  const [mapTheme, setMapTheme] = useState<'cyan' | 'green' | 'amber' | 'red'>('cyan');
  const [mapLayerMode, setMapLayerMode] = useState<'vector' | 'satellite'>('vector');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.2);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDegaussing, setIsDegaussing] = useState<boolean>(false);
  const [activeBeaconTool, setActiveBeaconTool] = useState<BeaconType | null>(null);
  
  // Tactical telemetry stats
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeSweep, setActiveSweep] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 20, lng: 0 });
  const [zoomLevel, setZoomLevel] = useState(2);
  const [signalStrength, setSignalStrength] = useState(99);
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [sysTime, setSysTime] = useState<string>("");

  // Context Hooks for Firebase Real-time Chat Hub
  const { user, login, register } = useUser();
  const { 
    activeRoom, 
    messages, 
    roomUsers, 
    activePmRecipient, 
    pmMessages, 
    joinRoom, 
    sendMessage, 
    sendPrivateMessage, 
    setActivePmRecipient 
  } = useChat();

  // Chat Panel UI States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatUsername, setChatUsername] = useState('');
  const [chatPassword, setChatPassword] = useState('');
  const [chatEmail, setChatEmail] = useState('');
  const [chatAuthMode, setChatAuthMode] = useState<'login' | 'register'>('login');
  const [chatAuthError, setChatAuthError] = useState('');
  const [chatAuthSuccess, setChatAuthSuccess] = useState('');
  const [chatMessageText, setChatMessageText] = useState('');
  const [chatPmText, setChatPmText] = useState('');
  
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat panel to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, pmMessages, activePmRecipient, isChatOpen]);

  // Dynamic Sector Metrics
  const [targetSector, setTargetSector] = useState({
    name: "GLOBAL DEFENSE SECTOR",
    code: "SEC-ALL-GLB",
    dangerLevel: 12,
    threatState: "STANDBY",
    radiation: "0.10 uSv/h",
    latency: "14ms",
    popIndex: "7.8 Billion",
    weather: "COMM_LINK: ACTIVE",
    wind: "NE-00 / 0.0KT"
  });

  // Theme color resolver helper
  const getThemeHex = (theme: typeof mapTheme) => {
    switch (theme) {
      case 'green': return '#39ff14';
      case 'amber': return '#ff9f00';
      case 'red': return '#ff3333';
      case 'cyan':
      default: return '#00f0ff';
    }
  };

  const activeColorHex = getThemeHex(mapTheme);

  // Sound play wrappers
  const triggerBeep = (freq?: number, dur?: number) => {
    audioSynthRef.current.playClick(freq, dur);
  };

  // Add Log Entry
  const addLog = (msg: string) => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 16));
  };

  // Web Speech API synthesized tactical readout
  const speakLocationIntelligence = (locationName: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const lowerName = locationName.toLowerCase();
    let popular = "a strategic localized node in the global network grid";
    let weatherReport = "simulated telemetry shows stable conditions with standard atmospheric flow";
    let famousPlaces = "the central administrative sector and local geographic landmarks";

    if (lowerName.includes("tokyo")) {
      popular = "a high tech metropolis merging quantum technologies and historic shrines";
      weatherReport = "clear skies with light eastern wind currents";
      famousPlaces = "the Shibuya Crossing and the ancient Sensoji Temple";
    } else if (lowerName.includes("paris")) {
      popular = "the global capital of art, fashion, and gastronomy";
      weatherReport = "mild temperatures with scattered cloud drifts";
      famousPlaces = "the Eiffel Tower, the Louvre museum, and Notre Dame cathedral";
    } else if (lowerName.includes("london")) {
      popular = "a historic city spanning Roman times to modern finance";
      weatherReport = "cool atmospheric conditions with standard light drizzle";
      famousPlaces = "the Tower of London, Big Ben, and the British Museum";
    } else if (lowerName.includes("new york")) {
      popular = "a massive cultural and financial center known as the Big Apple";
      weatherReport = "crisp air with clear visibility across the bay";
      famousPlaces = "Times Square, Central Park, and the Statue of Liberty";
    } else if (lowerName.includes("sydney")) {
      popular = "a harbor metropolis famous for its sailing sails and surf beaches";
      weatherReport = "temperate sunny climate with clear visibility";
      famousPlaces = "the Sydney Opera House and Bondi Beach";
    } else if (lowerName.includes("bangalore") || lowerName.includes("bengaluru") || lowerName.includes("gamerdrift")) {
      popular = "the Silicon Valley of India, known for its IT parks and green gardens";
      weatherReport = "perfect spring climate with soft breeze feeds";
      famousPlaces = "the Lalbagh Botanical Gardens and Bangalore Palace";
    } else if (lowerName.includes("cairo")) {
      popular = "an ancient gateway on the Nile, famous for its pharaonic monuments";
      weatherReport = "arid desert conditions with clear skies";
      famousPlaces = "the Great Pyramids of Giza and the Egyptian Museum";
    } else if (lowerName.includes("rome")) {
      popular = "the eternal city, cradled in Roman history and renaissance architecture";
      weatherReport = "warm Mediterranean air with clear skies";
      famousPlaces = "the Colosseum, the Pantheon, and the Vatican Museums";
    } else if (lowerName.includes("rio")) {
      popular = "a vibrant beach city famous for carnival and samba rhythms";
      weatherReport = "tropical humid winds with high sun ratios";
      famousPlaces = "Christ the Redeemer and Copacabana beach";
    } else if (lowerName.includes("washington") || lowerName.includes("pentagon")) {
      popular = "the federal command core of the United States";
      weatherReport = "standard seasonal temperature with moderate humidity";
      famousPlaces = "the National Mall and the Lincoln Memorial";
    } else if (lowerName.includes("gibraltar")) {
      popular = "a strategic Mediterranean gate rock with historical defense tunnels";
      weatherReport = "strong sea winds with high cloud caps";
      famousPlaces = "the Rock of Gibraltar and St. Michael's Cave";
    } else if (lowerName.includes("chernobyl")) {
      popular = "a historical exclusion grid housing the decommissioned energy core";
      weatherReport = "overcast skies with low wind dispersion feeds";
      famousPlaces = "the Pripyat ghost city and the new safe containment shelter";
    }

    const reportText = `Satellite reconnaissance report for ${locationName.split(',')[0]}. This region is popular as ${popular}. Current climate readings indicate ${weatherReport}. Recommended tactical insertion targets include ${famousPlaces}.`;
    
    // Stop ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(reportText);
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (engVoice) utterance.voice = engVoice;
    
    utterance.rate = 1.02; // digital computer speed
    utterance.pitch = 0.88; // slightly deep/authoritative
    utterance.volume = isMuted ? 0 : volume;
    
    window.speechSynthesis.speak(utterance);
  };

  // Custom tactical map icon builder
  const buildMarkerIcon = (color: string, blinking = true, labelSymbol = "") => {
    return L.divIcon({
      className: 'custom-tactical-marker-div',
      html: `
        <div style="position: relative; width: 34px; height: 34px; margin-left: -17px; margin-top: -17px;">
          <!-- Ring pulses -->
          <div class="${blinking ? 'animate-pulse' : ''}" style="
            position: absolute; 
            top: 0; left: 0; right: 0; bottom: 0; 
            border: 2px solid ${color}; 
            border-radius: 50%; 
            opacity: 0.8;
            ${blinking ? 'animation: pulse-radar 1.8s infinite ease-out;' : ''}
          "></div>
          <!-- Center Dot -->
          <div style="
            position: absolute; 
            top: 13px; left: 13px; 
            width: 8px; height: 8px; 
            background-color: ${color}; 
            border-radius: 50%; 
            box-shadow: 0 0 8px ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 5px;
            color: #000;
            font-weight: 800;
            font-family: monospace;
          ">${labelSymbol}</div>
          <!-- Target frame lines -->
          <div style="position: absolute; top: 16px; left: 2px; width: 30px; height: 1px; background-color: ${color}50;"></div>
          <div style="position: absolute; top: 2px; left: 16px; width: 1px; height: 30px; background-color: ${color}50;"></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [0, 0]
    });
  };

  // Calculate simulated telemetry index based on coordinates & display name
  const updateSectorTelemetry = (name: string, lat: number, lng: number, manualCode?: string) => {
    const absHash = Math.abs(Math.floor(lat * 314 + lng * 159));
    const danger = (absHash % 85) + 10; // 10% to 95%
    const threat = danger > 75 ? "CRITICAL ALERT" : danger > 50 ? "WARNING STATE" : "STANDBY CLEAR";
    const radVal = (0.05 + (absHash % 120) / 300).toFixed(2);
    const msLatency = Math.floor(10 + (absHash % 45));
    const pop = danger > 75 ? "RESTRICTED COMMAND" : `${(2.1 + (absHash % 140) / 10).toFixed(1)} Million`;
    
    // Simulate rough local target timezone offset
    const hoursOffset = Math.round(lng / 15);
    const targetDate = new Date();
    targetDate.setUTCHours(targetDate.getUTCHours() + hoursOffset);
    const timeStr = targetDate.toISOString().substring(11, 16) + ` GMT${hoursOffset >= 0 ? '+' : ''}${hoursOffset}`;

    const code = manualCode || `SEC-${Math.floor(Math.abs(lat)).toString().padStart(3,'0')}-${Math.floor(Math.abs(lng)).toString().padStart(3,'0')}`;

    setTargetSector({
      name: name.toUpperCase().split(',')[0],
      code,
      dangerLevel: danger,
      threatState: threat,
      radiation: `${radVal} uSv/h`,
      latency: `${msLatency}ms`,
      popIndex: pop,
      weather: `L-TIME: ${timeStr}`,
      wind: `BEAR: ${(absHash % 360)}° / ${(5 + (absHash % 50))}KT`
    });

    if (danger > 75) {
      audioSynthRef.current.playAlarm();
      addLog(`WARNING: SECTOR ${code} DECLARED HIGH HAZARD ZONE`);
    }
  };

  // 1. Initialize Map
  useEffect(() => {
    // Inject Leaflet Stylesheet Dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    if (!mapContainerRef.current) return;

    const initialMap = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
      maxBounds: [[-85, -180], [85, 180]]
    });

    mapRef.current = initialMap;

    // Build layers but keep references
    vectorLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      minZoom: 2,
    });

    satelliteLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      minZoom: 2,
    });

    labelsLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      minZoom: 2,
      zIndex: 10
    });

    // Default layer selection
    vectorLayerRef.current.addTo(initialMap);
    labelsLayerRef.current.addTo(initialMap);

    addLog("NORAD MILITARY GRID SECURED");
    addLog("ESTABLISHING ORBITAL SATELLITE COMMAND LINKS...");
    addLog("COGNITIVE DRIFT UPLINK READY // USER AUTHENTICATED");

    // Connect Global HQ Mesh Lines
    drawGlobalHQMesh(initialMap);

    // Initial Strategic markers
    STRATEGIC_LOCATIONS.forEach(loc => {
      const icon = buildMarkerIcon(activeColorHex, false);
      L.marker(loc.coords, { icon })
        .addTo(initialMap)
        .bindPopup(`
          <div class="military-popup font-mono text-[10px]">
            <h4 style="color: ${activeColorHex}; font-weight: bold; border-bottom: 1px solid ${activeColorHex}40; padding-bottom: 2px; margin: 0 0 4px 0;">${loc.name}</h4>
            <p style="margin: 2px 0; color: #e2e8f0; font-size: 8.5px;">${loc.desc}</p>
            <div style="font-size: 7.5px; color: #64748b; margin-top: 4px;">UPLINK SECURE // ${loc.code}</div>
          </div>
        `);
    });

    // Event hooks
    initialMap.on('move', () => {
      const center = initialMap.getCenter();
      setCoords({ lat: center.lat, lng: center.lng });
    });

    initialMap.on('zoomend', () => {
      const zoom = initialMap.getZoom();
      setZoomLevel(zoom);
      addLog(`RESOLVED ZOOM RATIO: SATELLITE GRID LEVEL ${zoom}`);
      audioSynthRef.current.playClick(800, 0.05);
    });

    // On-Map Clicking Handler for custom beacon drop
    initialMap.on('click', (e: L.LeafletMouseEvent) => {
      // Accessing state variable via ref or using active tool
      // Since map event handles clicks inside effect, we need to read from state or target pointer.
      // But we can check standard click target.
    });

    // Clock ticker
    const timer = setInterval(() => {
      const now = new Date();
      setSysTime(now.toISOString().substring(11, 19) + " UTC");
    }, 1000);

    const signalTimer = setInterval(() => {
      setSignalStrength(Math.floor(94 + Math.random() * 6));
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(signalTimer);
      document.head.removeChild(link);
      initialMap.remove();
      mapRef.current = null;
      audioSynthRef.current.cleanup();
    };
  }, []);

  // Sync volume with Synthesizer
  useEffect(() => {
    audioSynthRef.current.setVolume(volume);
  }, [volume]);

  // Sync mute with Synthesizer
  useEffect(() => {
    audioSynthRef.current.setMute(isMuted);
  }, [isMuted]);

  // Redraw Mesh lines when theme color changes
  useEffect(() => {
    if (mapRef.current) {
      // Clear old mesh
      meshLinesRef.current.forEach(line => line.remove());
      meshLinesRef.current = [];
      drawGlobalHQMesh(mapRef.current);
    }
  }, [mapTheme]);

  // Draw Mesh Networks
  const drawGlobalHQMesh = (map: L.Map) => {
    const meshLinks = [
      [0, 4], // Pentagon <-> Gibraltar Gate
      [4, 2], // Gibraltar Gate <-> Chernobyl Grid
      [4, 5], // Gibraltar Gate <-> GamerDrift Core
      [5, 1], // GamerDrift Core <-> Tokyo HQ Node
      [1, 3], // Tokyo HQ Node <-> Sydney Outpost
      [3, 5], // Sydney Outpost <-> GamerDrift Core
      [5, 0], // GamerDrift Core <-> Pentagon
    ];

    meshLinks.forEach(([iA, iB]) => {
      const locA = STRATEGIC_LOCATIONS[iA];
      const locB = STRATEGIC_LOCATIONS[iB];
      
      const line = L.polyline([locA.coords, locB.coords], {
        color: activeColorHex,
        weight: 1.2,
        dashArray: '6, 12',
        className: `tactical-mesh-line-${mapTheme}`
      }).addTo(map);

      meshLinesRef.current.push(line);
    });
  };

  // Map click setup (specifically for beacon deployment)
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear previous listener to avoid double bindings
    mapRef.current.off('click');
    
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      if (!activeBeaconTool) {
        // Standard Map Click - Update local coordinates and telemetry
        triggerBeep(500, 0.06);
        updateSectorTelemetry(`SECTOR_LOK_${Math.floor(Math.abs(e.latlng.lat))}`, e.latlng.lat, e.latlng.lng);
        return;
      }

      // Drop beacon
      const { lat, lng } = e.latlng;
      const bName = `${activeBeaconTool.toUpperCase()}_BCN_${Math.floor(Math.random() * 899 + 100)}`;
      const timestamp = new Date().toTimeString().split(' ')[0];
      const newB: Beacon = {
        id: Math.random().toString(),
        type: activeBeaconTool,
        coords: [lat, lng],
        name: bName,
        timestamp
      };

      setBeacons(prev => [...prev, newB]);
      addLog(`DEPLOYED ${activeBeaconTool.toUpperCase()} BEACON AT [${lat.toFixed(3)}, ${lng.toFixed(3)}]`);
      audioSynthRef.current.playAlarm();

      // Render Beacon Marker
      const beaconColor = activeBeaconTool === 'strike' ? '#ff3333' : activeBeaconTool === 'supply' ? '#39ff14' : activeBeaconTool === 'hazard' ? '#ff9f00' : '#00f0ff';
      const beaconSymbol = activeBeaconTool === 'strike' ? '💥' : activeBeaconTool === 'supply' ? '📦' : activeBeaconTool === 'hazard' ? '⚠️' : '📡';
      
      const icon = buildMarkerIcon(beaconColor, true, beaconSymbol);
      const marker = L.marker([lat, lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div class="military-popup font-mono text-[9px]">
            <h4 style="color: ${beaconColor}; font-weight: bold; margin: 0 0 3px 0; border-bottom: 1px solid ${beaconColor}40;">${bName}</h4>
            <div style="color: #fff; margin-bottom: 3px;">CLASS: ${activeBeaconTool.toUpperCase()} NODE</div>
            <div style="color: #cbd5e1;">COORDS: ${lat.toFixed(4)} / ${lng.toFixed(4)}</div>
            <div style="color: #64748b; font-size: 7.5px; margin-top: 3px;">DEPLOY TIME: ${timestamp}</div>
            <button onclick="window.removeBeacon('${newB.id}')" style="width: 100%; margin-top: 6px; padding: 2px 0; background: rgba(255,0,0,0.15); border: 1px solid rgba(255,0,0,0.4); color: #ff5f5f; font-family: monospace; font-size: 8px; cursor: pointer;">DECOMMISSION</button>
          </div>
        `);

      beaconsRef.current[newB.id] = marker;

      // Close tool
      setActiveBeaconTool(null);
    });

    // Globally expose removeBeacon function for popups
    (window as any).removeBeacon = (id: string) => {
      decommissionBeacon(id);
    };

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click');
      }
    };
  }, [activeBeaconTool]);

  const decommissionBeacon = (id: string) => {
    if (beaconsRef.current[id] && mapRef.current) {
      mapRef.current.removeLayer(beaconsRef.current[id]);
      delete beaconsRef.current[id];
    }
    setBeacons(prev => prev.filter(b => b.id !== id));
    addLog(`BEACON DECOMMISSIONED: ${id.substring(0, 5)}...`);
    triggerBeep(300, 0.15);
  };

  // 2. Tile Layers Switcher
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Remove both base layers
    if (vectorLayerRef.current) mapRef.current.removeLayer(vectorLayerRef.current);
    if (satelliteLayerRef.current) mapRef.current.removeLayer(satelliteLayerRef.current);

    if (mapLayerMode === 'vector') {
      vectorLayerRef.current?.addTo(mapRef.current);
    } else {
      satelliteLayerRef.current?.addTo(mapRef.current);
    }

    addLog(`SYS: RECONFIGURING SCAN MODE -> ${mapLayerMode.toUpperCase()}`);
    triggerBeep(700, 0.08);
  }, [mapLayerMode]);

  // 3. Labels Overlay Switcher
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (labelsLayerRef.current) {
      if (showLabels) {
        labelsLayerRef.current.addTo(mapRef.current);
        addLog("SYS: HIGH-DENSITY LABELS OVERLAY CONNECTED");
      } else {
        mapRef.current.removeLayer(labelsLayerRef.current);
        addLog("SYS: HIGHDENSITY LABELS OVERLAY MUTED");
      }
    }
    triggerBeep(850, 0.05);
  }, [showLabels]);

  // Jump to pre-defined sector
  const handleSectorJump = (loc: typeof STRATEGIC_LOCATIONS[0]) => {
    if (!mapRef.current) return;
    triggerBeep(900, 0.15);
    addLog(`SYS: TRANSLATING CAMERA FOCUS -> ${loc.name}...`);
    mapRef.current.flyTo(loc.coords, 9, { duration: 2.4 });
    updateSectorTelemetry(loc.name, loc.coords[0], loc.coords[1], loc.code);
    speakLocationIntelligence(loc.name);
    joinRoom(loc.name);
  };

  // OSM Nominatim Geocoder Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;

    setSearchLoading(true);
    triggerBeep(600, 0.1);
    addLog(`SYS: SCANNING COORDINATES FOR "${searchQuery.toUpperCase()}"...`);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await res.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const parsedLat = parseFloat(lat);
        const parsedLon = parseFloat(lon);

        mapRef.current.flyTo([parsedLat, parsedLon], 10, { duration: 2.2 });
        setCoords({ lat: parsedLat, lng: parsedLon });

        addLog(`SYS: UPLINK LOCKED [${parsedLat.toFixed(3)}, ${parsedLon.toFixed(3)}]`);
        
        // Update details based on search display name
        updateSectorTelemetry(display_name, parsedLat, parsedLon);
        speakLocationIntelligence(display_name);
        joinRoom(searchQuery);

        // Remove previous search marker
        if (searchMarkerRef.current) {
          mapRef.current.removeLayer(searchMarkerRef.current);
        }

        // Drop locate marker pin
        const locateColor = activeColorHex;
        const searchIcon = buildMarkerIcon(locateColor, true);
        const newMarker = L.marker([parsedLat, parsedLon], { icon: searchIcon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div class="military-popup font-mono text-[9.5px]">
              <h4 style="color: ${locateColor}; font-weight: bold; border-bottom: 1px solid ${locateColor}30; padding-bottom: 2.5px; margin: 0 0 3px 0;">TARGET UPLINK LOCK</h4>
              <p style="margin: 2px 0; color: #e2e8f0; font-size: 8px;">${display_name}</p>
              <div style="font-size: 7.5px; color: #64748b; margin-top: 3.5px;">COORD: ${parsedLat.toFixed(4)} / ${parsedLon.toFixed(4)}</div>
            </div>
          `);

        searchMarkerRef.current = newMarker;
        setTimeout(() => {
          newMarker.openPopup();
        }, 2000);

      } else {
        addLog(`ALERT: ZERO MAP NODES DETECTED FOR QUERY`);
        audioSynthRef.current.playAlarm();
      }
    } catch (err) {
      addLog(`ERROR: MAP SERVICE HANDSHAKE REJECTED`);
      audioSynthRef.current.playAlarm();
    } finally {
      setSearchLoading(false);
    }
  };

  // Sonar threat scan trigger
  const triggerSonarSweep = () => {
    if (!mapRef.current || activeSweep) return;
    
    setActiveSweep(true);
    audioSynthRef.current.playSonarPing();
    addLog("SYS: SCANNING LOCAL VIEWPORT FOR ANOMALIES...");

    // Clear previous threats
    activeSweepMarkersRef.current.forEach(marker => {
      if (mapRef.current) mapRef.current.removeLayer(marker);
    });
    activeSweepMarkersRef.current = [];

    setTimeout(() => {
      if (!mapRef.current) return;
      const center = mapRef.current.getCenter();
      const threatColor = '#ff3333'; // Threat Red

      const threats = [
        { label: "ANOMALOUS DRONE", lat: center.lat + (Math.random() - 0.5) * 3, lng: center.lng + (Math.random() - 0.5) * 3, desc: "Tactical air drone trace." },
        { label: "GLITCH SIGNAL", lat: center.lat + (Math.random() - 0.5) * 4.5, lng: center.lng + (Math.random() - 0.5) * 4.5, desc: "Defect data sector block." },
        { label: "DRIFT INTERCEPT", lat: center.lat + (Math.random() - 0.5) * 2.5, lng: center.lng + (Math.random() - 0.5) * 2.5, desc: "Secure proxy breach." },
      ];

      threats.forEach((th, idx) => {
        if (!mapRef.current) return;
        const icon = buildMarkerIcon(threatColor, true, "⚠️");
        const m = L.marker([th.lat, th.lng], { icon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div class="military-popup font-mono text-[9px]">
              <h4 style="color: ${threatColor}; font-weight: bold; margin: 0 0 3px 0; border-bottom: 1px solid ${threatColor}40;">[!] THREAT DETECTED</h4>
              <p style="margin: 2px 0; color: #fff; font-size: 8.5px;">${th.label}</p>
              <div style="font-size: 7.5px; color: #64748b;">${th.desc}</div>
            </div>
          `);
        
        activeSweepMarkersRef.current.push(m);
        
        setTimeout(() => {
          m.openPopup();
          audioSynthRef.current.playAlarm();
        }, idx * 500);
      });

      addLog(`WARNING: 3 RADAR THREAT ANOMALIES LOGGED`);
      setActiveSweep(false);
    }, 1800);
  };

  // Zoom control helpers
  const handleZoom = (type: 'in' | 'out') => {
    if (!mapRef.current) return;
    triggerBeep(800, 0.05);
    if (type === 'in') {
      mapRef.current.zoomIn();
    } else {
      mapRef.current.zoomOut();
    }
  };

  // CRT Screen Degauss Effect
  const handleDegauss = () => {
    if (isDegaussing) return;
    setIsDegaussing(true);
    audioSynthRef.current.playDegauss();
    addLog("SYS: INITIATING CRT MONITOR BEZEL DEGAUSS DISCHARGE...");
    setTimeout(() => {
      setIsDegaussing(false);
      addLog("SYS: CRT SCREEN RECALIBRATION COMPLETED");
    }, 1200);
  };

  return (
    <div className={`
      ${isFullscreen 
        ? 'fixed inset-0 z-50 bg-[#03060a] p-4 flex flex-col w-screen h-screen font-mono text-[11px] text-slate-300' 
        : 'w-full flex flex-col bg-black border border-slate-900 font-mono text-[11px] text-slate-300 relative select-none rounded-lg shadow-2xl h-[460px] lg:h-[510px] overflow-hidden'
      }
      transition-all duration-300 select-none
    `}>
      
      {/* Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container {
          background: #020406 !important;
          cursor: ${activeBeaconTool ? 'crosshair' : 'default'} !important;
        }
        
        /* Tactical Mesh Map Line Flow Animation */
        @keyframes mesh-line-flow {
          to { stroke-dashoffset: -24; }
        }
        .tactical-mesh-line-cyan {
          animation: mesh-line-flow 1.2s linear infinite;
          filter: drop-shadow(0 0 2px #00f0ff);
        }
        .tactical-mesh-line-green {
          animation: mesh-line-flow 1.2s linear infinite;
          filter: drop-shadow(0 0 2px #39ff14);
        }
        .tactical-mesh-line-amber {
          animation: mesh-line-flow 1.2s linear infinite;
          filter: drop-shadow(0 0 2px #ff9f00);
        }
        .tactical-mesh-line-red {
          animation: mesh-line-flow 1.2s linear infinite;
          filter: drop-shadow(0 0 2px #ff3333);
        }

        /* Tactical Theme Maps Tilting filters */
        .theme-map-cyan .leaflet-tile-container img {
          filter: invert(1) hue-rotate(185deg) brightness(0.35) contrast(1.4) saturate(2) !important;
        }
        .theme-map-green .leaflet-tile-container img {
          filter: invert(1) hue-rotate(90deg) brightness(0.5) contrast(1.5) saturate(2) !important;
        }
        .theme-map-amber .leaflet-tile-container img {
          filter: invert(1) hue-rotate(30deg) brightness(0.6) contrast(1.5) saturate(2.2) !important;
        }
        .theme-map-red .leaflet-tile-container img {
          filter: invert(1) hue-rotate(330deg) brightness(0.4) contrast(1.6) saturate(2.6) !important;
        }

        /* When on Satellite layer - keep it normal but overlay grid values */
        .theme-map-sat .leaflet-tile-container img {
          filter: brightness(0.55) contrast(1.15) saturate(0.85) !important;
        }
        .theme-map-sat.theme-map-cyan .leaflet-tile-container img { filter: brightness(0.5) contrast(1.2) hue-rotate(5deg) saturate(0.8) !important; }
        .theme-map-sat.theme-map-green .leaflet-tile-container img { filter: brightness(0.5) contrast(1.2) hue-rotate(-10deg) saturate(0.8) !important; }

        /* Leaflet popup customization */
        .leaflet-popup-content-wrapper {
          background: rgba(4, 7, 12, 0.94) !important;
          border: 1px solid ${activeColorHex}50 !important;
          color: #fff !important;
          font-family: monospace !important;
          border-radius: 4px !important;
          box-shadow: 0 0 16px ${activeColorHex}25 !important;
          padding: 1px !important;
        }
        .leaflet-popup-tip {
          background: rgba(4, 7, 12, 0.94) !important;
          border: 1px solid ${activeColorHex}50 !important;
        }

        /* Bezel Glare Effect Overlay */
        .screen-glass-overlay {
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0) 100%);
          pointer-events: none;
        }

        /* Scanlines Overlay */
        .screen-scanlines {
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.22) 50%);
          background-size: 100% 3.5px;
          pointer-events: none;
        }

        /* Pulsing crosshair keyframes */
        @keyframes pulse-radar {
          0% { transform: scale(0.2); opacity: 1; }
          75% { transform: scale(1.15); opacity: 0.15; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        /* CRT Screen degauss distortion animation */
        @keyframes degauss-glitch {
          0% { transform: scale(1, 1) skew(0deg); filter: brightness(2.5) contrast(2) saturate(0) blur(2px); }
          8% { transform: scale(1, 0.02) skew(12deg); filter: brightness(5) blur(10px); }
          15% { transform: scale(1.1, 1.1) skew(-20deg); filter: brightness(0.4) blur(1px); }
          22% { transform: scale(0.85, 0.85) skew(5deg); filter: brightness(1.8) blur(0px); }
          30% { transform: scale(1, 0.01) translate(0, 15px); filter: brightness(6) saturate(3); }
          40% { transform: scale(1.04, 1.04) skew(0deg); filter: brightness(1); }
          100% { transform: scale(1, 1); filter: none; }
        }
        .degauss-effect {
          animation: degauss-glitch 1.2s cubic-bezier(0.15, 0.85, 0.3, 1) forwards;
        }
        @keyframes red-glow-pulse {
          0% { box-shadow: 0 0 4px rgba(255, 51, 85, 0.45), inset 0 0 2px rgba(255, 51, 85, 0.2); }
          50% { box-shadow: 0 0 14px rgba(255, 51, 85, 0.95), inset 0 0 5px rgba(255, 51, 85, 0.55); }
          100% { box-shadow: 0 0 4px rgba(255, 51, 85, 0.45), inset 0 0 2px rgba(255, 51, 85, 0.2); }
        }
        .red-neon-glow-pulse {
          animation: red-glow-pulse 2s infinite ease-in-out;
          border-color: #ff3355 !important;
        }
        .red-neon-glow-pulse:focus {
          border-color: #ff003c !important;
          box-shadow: 0 0 16px rgba(255, 0, 60, 1), inset 0 0 6px rgba(255, 0, 60, 0.6) !important;
        }
      ` }} />

      {/* COMMAND CONSOLE HEADER */}
      <header className="bg-[#06090e] border-b border-slate-900 px-4 py-2.5 flex flex-col md:flex-row justify-between items-center gap-3 relative z-20 flex-shrink-0">
        
        {/* Core title and server light */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-widest text-white text-xs uppercase">GamerDrift // LIVE CHAT-HUB</span>
              <span className="text-[7.5px] bg-[#ff3333]/15 text-[#ff3333] px-1 border border-[#ff3333]/30 font-bold tracking-wider rounded animate-pulse">SECURE FEED</span>
            </div>
            <span className="text-[8.5px] text-slate-500 uppercase tracking-widest">DRIFT_LINK: ONLINE // ENCRYPTION METHOD: SEC-QUANTUM-AES</span>
          </div>
        </div>

        {/* Tactical controls & sound dials */}
        <div className="flex flex-wrap items-center gap-4 text-[9px]">
          
          {/* System Time clock */}
          <div className="bg-black/60 border border-slate-900 px-2 py-1 rounded text-slate-400 font-mono">
            SYS_TIME: <span className="text-white font-bold">{sysTime || "SYNCHRONIZING..."}</span>
          </div>

          {/* Degauss discharge button */}
          <button
            onClick={handleDegauss}
            disabled={isDegaussing}
            className="px-2 py-1 bg-black/60 border border-slate-800 hover:border-[#ff9f00] text-slate-400 hover:text-[#ff9f00] font-bold rounded uppercase flex items-center gap-1 transition-all disabled:opacity-40"
          >
            🧲 DEGAUSS
          </button>

          {/* Fullscreen toggle button */}
          <button
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              triggerBeep(950, 0.1);
              addLog(`SYS: TOGGLED FULLSCREEN SIMULATOR: ${!isFullscreen ? 'ACTIVE' : 'INACTIVE'}`);
            }}
            className="px-2 py-1 bg-black/60 border border-slate-800 hover:border-[#00f0ff] text-slate-400 hover:text-[#00f0ff] font-bold rounded uppercase flex items-center gap-1 transition-all"
          >
            {isFullscreen ? '⏹️ EXIT CMD' : '📺 FULL CONSOLE'}
          </button>

          {/* Open Region ChatRoom Button */}
          <button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              triggerBeep(900, 0.08);
            }}
            style={{ 
              borderColor: activeColorHex,
              boxShadow: `0 0 14px ${activeColorHex}50, inset 0 0 8px ${activeColorHex}25`
            }}
            className="px-3 py-1 bg-black/90 border-2 text-white font-black uppercase tracking-widest rounded hover:bg-slate-900 transition-all text-[9.5px] cursor-pointer"
          >
            💬 OPEN REGION CHATROOM [ {activeRoom} ]
          </button>

          {/* Audio interface controls */}
          <div className="flex items-center gap-2 bg-[#090d15] border border-slate-900 px-2 py-0.5 rounded">
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                triggerBeep(700, 0.08);
              }}
              className={`p-1 font-bold ${isMuted ? 'text-red-500' : 'text-[#00f0ff] hover:text-white'}`}
            >
              {isMuted ? (
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.03c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
              ) : (
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              )}
            </button>
            <span className="text-[7.5px] text-slate-600 font-bold uppercase">VOL:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const nv = parseFloat(e.target.value);
                setVolume(nv);
                if (isMuted) setIsMuted(false);
              }}
              className="w-12 h-1 bg-slate-950 accent-[#00f0ff] cursor-pointer rounded-lg appearance-none"
            />
          </div>

        </div>
      </header>

      {/* CORE SPLIT SCREEN */}
      <div className={`flex flex-col flex-grow relative overflow-hidden ${isDegaussing ? 'degauss-effect' : ''}`}>
        
        {/* TOP MAIN PORTION: 80% HEIGHT MAP SCREEN */}
        <div className={`flex-grow relative overflow-hidden border-b border-slate-900 theme-map-${mapTheme} ${mapLayerMode === 'satellite' ? 'theme-map-sat' : ''}`}>
          
          <div ref={mapContainerRef} className="w-full h-full relative z-0" />

          {/* SLIDE-OUT CHATHUB CONSOLE DRAWER */}
          <div 
            style={{ 
              borderColor: activeColorHex,
              transform: isChatOpen ? 'translateX(0)' : 'translateX(100%)',
              boxShadow: isChatOpen ? `0 0 35px ${activeColorHex}25` : 'none'
            }}
            className="absolute right-0 top-0 w-[320px] h-full bg-[#06090e]/98 border-l backdrop-blur-md z-30 transition-all duration-300 ease-in-out flex flex-col font-mono text-[9px] text-slate-300 select-text"
          >
            {/* Drawer Header */}
            <div className="p-3 border-b border-slate-900 flex justify-between items-center bg-black/45">
              <div className="flex flex-col">
                <span className="font-extrabold tracking-widest uppercase text-[10px]" style={{ color: activeColorHex }}>
                  💬 GD_COMM_LINK // CHATHUB
                </span>
                <span className="text-[7.5px] text-slate-500 uppercase mt-0.5 tracking-wider">
                  STATUS: {user ? `UPLINKED [${user.username.toUpperCase()}]` : 'OFFLINE // AUTH REQUIRED'}
                </span>
              </div>
              <button 
                onClick={() => { setIsChatOpen(false); triggerBeep(700, 0.05); }}
                className="text-slate-500 hover:text-white font-extrabold px-1.5 py-0.5 border border-slate-900 hover:border-red-500 hover:bg-red-500/10 rounded transition-all"
              >
                [X]
              </button>
            </div>

            {/* Room Indicator Ribbon */}
            <div className="px-3 py-1 bg-black/85 border-b border-slate-900 flex justify-between items-center text-[8px] text-slate-400">
              <span>ACTIVE ROOM: <span className="font-bold text-white uppercase">{activeRoom}</span></span>
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-[#39ff14] ${isFirebaseMock ? 'animate-pulse' : 'animate-ping'}`}></span>
                {isFirebaseMock ? 'SANDBOX_LINK' : 'FIREBASE_LIVE'}
              </span>
            </div>

            {/* Main Content Pane */}
            <div className="flex-grow flex flex-col justify-between overflow-hidden relative">
              {!user ? (
                /* --- GUEST REGISTER/LOGIN FORM --- */
                <div className="p-4 flex flex-col justify-center h-full gap-3">
                  <div className="text-center mb-1">
                    <span className="text-[8px] text-[#ff9f00] tracking-widest block font-bold uppercase">COMM SYSTEM VERIFICATION</span>
                    <p className="text-[7.5px] text-slate-500 uppercase mt-1">UPLINK REJECTED: AUTHORIZATION REQUIRED. ACCREDIT IDENTIFICATION TAG.</p>
                  </div>

                  <div className="grid grid-cols-2 border border-slate-900 p-0.5 bg-black/30">
                    <button
                      onClick={() => { setChatAuthMode('login'); setChatAuthError(''); }}
                      className={`py-1 text-[8.5px] font-bold ${chatAuthMode === 'login' ? 'bg-[#00f0ff]/10 text-[#00f0ff]' : 'text-slate-500'}`}
                    >
                      [ SIGN IN ]
                    </button>
                    <button
                      onClick={() => { setChatAuthMode('register'); setChatAuthError(''); }}
                      className={`py-1 text-[8.5px] font-bold ${chatAuthMode === 'register' ? 'bg-[#ff9f00]/10 text-[#ff9f00]' : 'text-slate-500'}`}
                    >
                      [ SIGN UP ]
                    </button>
                  </div>

                  {chatAuthError && (
                    <div className="p-1.5 bg-red-950/20 border border-red-500/40 text-[7.5px] text-red-400 text-center uppercase">
                      ▲ {chatAuthError}
                    </div>
                  )}

                  {chatAuthSuccess && (
                    <div className="p-1.5 bg-[#39ff14]/15 border border-[#39ff14]/30 text-[7.5px] text-[#39ff14] text-center uppercase animate-pulse">
                      ✓ {chatAuthSuccess}
                    </div>
                  )}

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setChatAuthError('');
                      setChatAuthSuccess('');
                      triggerBeep(900, 0.1);
                      if (chatAuthMode === 'login') {
                        const success = await login(chatUsername, chatPassword);
                        if (success) {
                          setChatAuthSuccess('SECURE UPLINK MATCHED.');
                        } else {
                          setChatAuthError('AUTH FAILED: TAG NOT FOUND OR CODE MISMATCH.');
                        }
                      } else {
                        const success = await register(chatUsername, chatPassword, chatEmail, 'Drifter');
                        if (success) {
                          setChatAuthSuccess('IDENTIFIER CREATED.');
                        } else {
                          setChatAuthError('DUPLICATE TAG OR INTEGRITY TIMEOUT.');
                        }
                      }
                    }}
                    className="flex flex-col gap-2.5"
                  >
                    {chatAuthMode === 'register' && (
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 uppercase text-[7.5px]">TELEMETRY MAIL:</span>
                        <input
                          type="email"
                          required
                          value={chatEmail}
                          onChange={(e) => setChatEmail(e.target.value)}
                          placeholder="mail@domain.com"
                          className="bg-slate-950 border border-slate-900 px-2 py-1.5 text-white focus:outline-none focus:border-[#ff9f00] text-[8.5px]"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500 uppercase text-[7.5px]">DRIFTER ID TAG:</span>
                      <input
                        type="text"
                        required
                        value={chatUsername}
                        onChange={(e) => setChatUsername(e.target.value)}
                        placeholder="e.g. NeoDrifter"
                        className="bg-slate-950 border border-slate-900 px-2 py-1.5 text-white focus:outline-none focus:border-[#00f0ff] text-[8.5px]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500 uppercase text-[7.5px]">PASSCODE SECURITY:</span>
                      <input
                        type="password"
                        required
                        value={chatPassword}
                        onChange={(e) => setChatPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-slate-950 border border-slate-900 px-2 py-1.5 text-white focus:outline-none focus:border-[#00f0ff] text-[8.5px]"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="mt-1 py-2 text-black font-extrabold uppercase text-[8px] tracking-widest hover:scale-[1.01] transition-all cursor-pointer"
                      style={{ backgroundColor: chatAuthMode === 'login' ? '#00f0ff' : '#ff9f00' }}
                    >
                      {chatAuthMode === 'login' ? 'INITIALIZE CONNECTION' : 'ESTABLISH COGNITIVE LINK'}
                    </button>
                  </form>
                </div>
              ) : (
                /* --- AUTHENTICATED CHAT PANEL --- */
                <div className="flex-grow flex flex-col h-full overflow-hidden justify-between">
                  
                  {/* Active DM Header if PM mode is open */}
                  {activePmRecipient ? (
                    <div className="px-3 py-1.5 bg-black/60 border-b border-slate-900 flex justify-between items-center text-[8px] text-slate-400">
                      <span className="font-bold" style={{ color: activeColorHex }}>🔒 DM_LINK: {activePmRecipient.toUpperCase()}</span>
                      <button 
                        type="button"
                        onClick={() => { setActivePmRecipient(null); triggerBeep(600, 0.05); }}
                        className="text-[7.5px] text-slate-500 hover:text-white uppercase font-bold"
                      >
                        &lt;&lt; BACK TO ROOM
                      </button>
                    </div>
                  ) : null}

                  {/* Messages Feed View */}
                  <div 
                    ref={chatScrollRef}
                    className="flex-grow overflow-y-auto p-3 space-y-2.5 scrollbar-none select-text"
                  >
                    {(!activePmRecipient ? messages : pmMessages).map((msg) => {
                      const isSys = msg.sender === 'SYS_LINK';
                      const isSelf = msg.sender.toLowerCase() === user.username.toLowerCase();
                      
                      return (
                        <div key={msg.id} className="flex flex-col leading-relaxed">
                          <div className="flex justify-between items-baseline text-[7.5px] text-slate-600 mb-0.5">
                            <span className={`font-extrabold uppercase ${
                              isSys 
                                ? 'text-red-400' 
                                : isSelf 
                                ? 'text-[#39ff14]' 
                                : 'text-[#00f0ff]'
                            }`}>
                              {isSys ? '[!] ' : ''}{msg.sender}
                            </span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <p className={`text-[8.5px] uppercase ${isSys ? 'text-slate-500 font-bold bg-[#ff3333]/5 border border-[#ff3333]/10 px-1.5 py-0.5 rounded' : 'text-slate-200'}`}>
                            {msg.text}
                          </p>
                        </div>
                      );
                    })}
                    {(!activePmRecipient ? messages : pmMessages).length === 0 && (
                      <div className="text-center py-12 text-slate-700 uppercase text-[8px]">
                        -- NO GRID TELEMETRY TRANSMISSIONS --
                      </div>
                    )}
                  </div>

                  {/* Room Online User Presence Drawer (Only shown in Room mode) */}
                  {!activePmRecipient ? (
                    <div className="h-[95px] border-t border-slate-900 bg-black/55 flex flex-col overflow-hidden shrink-0">
                      <div className="px-2.5 py-1 bg-slate-950/80 border-b border-slate-900 flex justify-between text-[7px] text-slate-500 uppercase tracking-widest font-extrabold font-sans">
                        <span>DRIFTERS IN REGION ({roomUsers.length})</span>
                        <span>CLICK TO DM</span>
                      </div>
                      <div className="flex-grow overflow-y-auto p-1.5 space-y-1 scrollbar-none">
                        {roomUsers.map((rUser) => {
                          const isMe = rUser.username.toLowerCase() === user.username.toLowerCase();
                          return (
                            <div 
                              key={rUser.username}
                              onClick={() => {
                                if (isMe) return;
                                triggerBeep(900, 0.06);
                                setActivePmRecipient(rUser.username);
                              }}
                              className={`flex justify-between items-center p-1 border rounded text-[7.5px] transition-all ${
                                isMe 
                                  ? 'bg-[#39ff14]/5 border-[#39ff14]/15 cursor-default' 
                                  : 'bg-black/30 border-slate-900 hover:border-[#00f0ff]/40 hover:bg-slate-950/45 cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1 h-1 rounded-full ${rUser.status === 'online' ? 'bg-[#39ff14]' : 'bg-slate-700'}`} />
                                <span className="font-extrabold text-white uppercase">{rUser.username}</span>
                                <span className="text-slate-600 text-[6.5px]">LVL {rUser.level} // {rUser.playing}</span>
                              </div>
                              <span className="text-[6.5px] text-slate-600 uppercase font-black">{rUser.role}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Input form */}
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      triggerBeep(500, 0.04);
                      if (!activePmRecipient) {
                        if (!chatMessageText.trim()) return;
                        await sendMessage(chatMessageText);
                        setChatMessageText('');
                      } else {
                        if (!chatPmText.trim()) return;
                        await sendPrivateMessage(activePmRecipient, chatPmText);
                        setChatPmText('');
                      }
                    }}
                    className="p-2 border-t border-slate-900 flex gap-1.5 bg-black/45 shrink-0"
                  >
                    <input
                      type="text"
                      required
                      value={!activePmRecipient ? chatMessageText : chatPmText}
                      onChange={(e) => {
                        if (!activePmRecipient) setChatMessageText(e.target.value);
                        else setChatPmText(e.target.value);
                      }}
                      placeholder={!activePmRecipient ? `BROADCAST TO ${activeRoom}...` : `DM TO ${activePmRecipient.toUpperCase()}...`}
                      className="flex-grow bg-slate-950 border border-slate-900 px-2 py-1.5 text-white placeholder-slate-700 focus:outline-none focus:border-[#00f0ff] text-[8.5px]"
                    />
                    <button 
                      type="submit" 
                      style={{ borderColor: activeColorHex, color: activeColorHex }}
                      className="px-2.5 bg-black hover:bg-slate-950 border text-[8px] uppercase font-bold"
                    >
                      SEND
                    </button>
                  </form>

                </div>
              )}
            </div>
          </div>

          {/* SCREEN DECORATION BEZELS & OVERLAYS */}
          <div className="absolute inset-0 screen-scanlines pointer-events-none z-10 opacity-30" />
          <div className="absolute inset-0 screen-glass-overlay pointer-events-none z-10" />
          
          {/* Screen vignetting */}
          <div className="absolute inset-0 pointer-events-none z-10" style={{
            boxShadow: 'inset 0 0 70px rgba(0,0,0,0.85)'
          }} />

          {/* Global crosshair reticle overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center justify-center opacity-40">
            <div className="w-14 h-14 border border-dashed rounded-full animate-spin" style={{
              borderColor: activeColorHex,
              animationDuration: '18s'
            }} />
            <div className="w-2.5 h-2.5 rounded-full absolute" style={{
              backgroundColor: activeColorHex
            }} />
            <div className="w-20 h-0.5 absolute" style={{ background: `linear-gradient(90deg, transparent, ${activeColorHex}, transparent)` }} />
            <div className="w-0.5 h-20 absolute" style={{ background: `linear-gradient(180deg, transparent, ${activeColorHex}, transparent)` }} />
          </div>

          {/* Radar sweep scan scan */}
          {activeSweep && (
            <div className="absolute inset-0 pointer-events-none z-15 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse flex items-center justify-center">
              <div className="text-[11px] font-black uppercase text-[#ff3333] tracking-widest bg-black/85 px-4 py-2 border-2 border-[#ff3333] shadow-[0_0_15px_rgba(255,51,51,0.25)] rounded">
                ☣️ SONAR VIEWPORT MATRIX SCANNING...
              </div>
            </div>
          )}

          {/* Map floating controls HUD overlay */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            <button
              onClick={() => handleZoom('in')}
              className="w-8 h-8 bg-black/85 border border-slate-800 hover:border-[#00f0ff] text-white flex items-center justify-center font-bold text-sm rounded shadow-lg hover:text-[#00f0ff] transition-all"
            >
              +
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="w-8 h-8 bg-black/85 border border-slate-800 hover:border-[#00f0ff] text-white flex items-center justify-center font-bold text-sm rounded shadow-lg hover:text-[#00f0ff] transition-all"
            >
              -
            </button>
          </div>

          {/* Active beacon placement tip overlay */}
          {activeBeaconTool && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-black/85 border border-[#ff9f00]/60 px-4 py-1.5 text-[9px] text-[#ff9f00] uppercase font-bold rounded animate-pulse shadow-lg tracking-wider">
              🎯 SELECT TARGET ON MAP TO DEPLOY {activeBeaconTool.toUpperCase()} BEACON
            </div>
          )}

        </div>

        {/* BOTTOM DECK: 20% HEIGHT INFORMATION & SYSTEMS CONTROL BAR */}
        <div className="h-[138px] flex-shrink-0 bg-[#040609] p-2 z-10 flex flex-row items-center justify-between gap-4 overflow-x-auto scrollbar-none select-none">
          
          {/* PANEL 1: CIRCULAR STRATEGIC RADAR SWEEP */}
          <div className="flex-shrink-0 flex items-center justify-center border-r border-slate-900/80 pr-4 h-full">
            <RadarCanvas themeColor={activeColorHex} />
          </div>

          {/* PANEL 2: ACTIVE TARGET COGNITIVE TELEMETRY */}
          <div className="flex-shrink-0 w-[240px] border-r border-slate-900/80 pr-4 h-full flex flex-col justify-center gap-1">
            <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest block">// TARGET TELEMETRY</span>
            <h3 className="font-extrabold text-white text-[10.5px] truncate uppercase tracking-wide">
              📍 {targetSector.name}
            </h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[8px] text-slate-400">
              <div>SEC ID: <span className="text-white font-bold">{targetSector.code}</span></div>
              <div>DANGER: <span className={targetSector.dangerLevel > 70 ? 'text-[#ff3333] font-bold' : targetSector.dangerLevel > 45 ? 'text-[#ff9f00]' : 'text-[#39ff14]'}>{targetSector.dangerLevel}%</span></div>
              <div>AIR DEF: <span className="text-white font-bold">{targetSector.threatState}</span></div>
              <div>PING: <span className="text-white font-bold">{targetSector.latency}</span></div>
              <div>CORE: <span className="text-white font-bold">{targetSector.popIndex}</span></div>
              <div>COORD: <span className="text-white font-bold">{coords.lat.toFixed(2)}N / {coords.lng.toFixed(2)}E</span></div>
            </div>
          </div>

          {/* PANEL 3: REGION LOCATOR & SHORTCUT NETWORK COORDS */}
          <div className="flex-shrink-0 w-[220px] border-r border-slate-900/80 pr-4 h-full flex flex-col justify-center gap-1.5">
            <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest block">// REGION LOCATOR & JUMPS</span>
            <form onSubmit={handleSearch} className="flex gap-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="CITY, COUNTRY..."
                disabled={searchLoading}
                className="flex-grow bg-slate-950 border border-red-500 red-neon-glow-pulse rounded px-1.5 py-0.5 text-white placeholder-slate-700 focus:outline-none text-[8.5px]"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="px-2 bg-black hover:bg-slate-900 border border-slate-900 hover:border-[#00f0ff] text-[#00f0ff] text-[8px] font-bold tracking-wider rounded disabled:opacity-40 uppercase"
              >
                {searchLoading ? '...' : 'LOCK'}
              </button>
            </form>



            <div className="flex gap-1 overflow-x-auto scrollbar-none py-1 border-t border-slate-900/60 mt-1.5">
              {STRATEGIC_LOCATIONS.slice(0, 4).map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSectorJump(loc)}
                  className="bg-slate-950 hover:bg-black border border-slate-900 hover:border-[#00f0ff]/50 px-1 py-0.5 text-[7.5px] text-slate-400 hover:text-white rounded truncate flex-shrink-0"
                >
                  📡 {loc.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* PANEL 4: BEACON COMMAND DECK */}
          <div className="flex-shrink-0 w-[240px] border-r border-slate-900/80 pr-4 h-full flex flex-col justify-center gap-1">
            <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest block">// BEACON OPERATIONS</span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'comms', label: 'COMM', border: 'border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/5', active: 'bg-[#00f0ff]/20 border-[#00f0ff] text-white' },
                { id: 'strike', label: 'STRIKE', border: 'border-[#ff3333]/40 text-[#ff3333] hover:bg-[#ff3333]/5', active: 'bg-[#ff3333]/20 border-[#ff3333] text-white' },
                { id: 'supply', label: 'SPLY', border: 'border-[#39ff14]/40 text-[#39ff14] hover:bg-[#39ff14]/5', active: 'bg-[#39ff14]/20 border-[#39ff14] text-white' },
                { id: 'hazard', label: 'HAZD', border: 'border-[#ff9f00]/40 text-[#ff9f00] hover:bg-[#ff9f00]/5', active: 'bg-[#ff9f00]/20 border-[#ff9f00] text-white' },
              ].map(tool => (
                <button
                  key={tool.id}
                  onClick={() => {
                    triggerBeep(650, 0.08);
                    setActiveBeaconTool(activeBeaconTool === tool.id ? null : (tool.id as BeaconType));
                  }}
                  className={`border py-1 text-[7.5px] font-bold rounded text-center transition-all ${
                    activeBeaconTool === tool.id ? tool.active : tool.border
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center text-[7.5px] text-slate-500 mt-1">
              <span className="truncate">BEACONS DEPLOYED: {beacons.length}</span>
              {beacons.length > 0 && (
                <button onClick={() => setBeacons([])} className="text-red-500 hover:text-white font-bold hover:underline">
                  CLEAR ALL
                </button>
              )}
            </div>
          </div>

          {/* PANEL 5: DISPLAY CONTROLS & MONITOR FILTERS */}
          <div className="flex-shrink-0 w-[240px] border-r border-slate-900/80 pr-4 h-full flex flex-col justify-center gap-1.5">
            <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest block">// MONITOR CONTROL DECK</span>
            <div className="flex gap-1 items-center justify-between">
              <div className="flex border border-slate-800 rounded overflow-hidden">
                <button
                  onClick={() => { setMapLayerMode('vector'); triggerBeep(900, 0.05); }}
                  className={`px-1.5 py-0.5 text-[7.5px] font-bold uppercase ${mapLayerMode === 'vector' ? 'bg-slate-900 text-[#00f0ff]' : 'bg-black/60 text-slate-500'}`}
                >
                  CYBER GRID
                </button>
                <button
                  onClick={() => { setMapLayerMode('satellite'); triggerBeep(900, 0.05); }}
                  className={`px-1.5 py-0.5 text-[7.5px] font-bold uppercase ${mapLayerMode === 'satellite' ? 'bg-slate-900 text-[#00f0ff]' : 'bg-black/60 text-slate-500'}`}
                >
                  ORBIT SAT
                </button>
              </div>
              <button
                onClick={() => { setShowLabels(!showLabels); triggerBeep(700, 0.05); }}
                className={`border rounded px-1.5 py-0.5 text-[7.5px] font-bold uppercase ${showLabels ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-slate-800 text-slate-500'}`}
              >
                LABELS: {showLabels ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-0.5">
              {['cyan', 'green', 'amber', 'red'].map(th => (
                <button
                  key={th}
                  onClick={() => { setMapTheme(th as any); triggerBeep(800, 0.05); }}
                  className={`border py-0.5 text-[6.5px] font-bold rounded text-center ${mapTheme === th ? 'bg-slate-900 border-white text-white' : 'bg-black/60 border-slate-900 text-slate-500'}`}
                >
                  {th.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* PANEL 6: REALTIME INTEL LOG READOUT */}
          <div className="flex-shrink-0 w-[200px] h-full flex flex-col justify-center gap-1">
            <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest block">// LOG TELEMETRY OUTPUT</span>
            <div className="bg-slate-950/80 border border-slate-900 p-1.5 rounded h-[85px] overflow-y-auto flex flex-col gap-0.5 scrollbar-none font-mono text-[7px] leading-tight">
              {logs.map((log, index) => {
                const isWarn = log.includes('WARNING') || log.includes('ERROR');
                return (
                  <div key={index} className="text-slate-400 whitespace-pre-wrap">
                    <span className="text-[#00f0ff]/60 font-semibold">{log.slice(0, 10)}</span>
                    <span className={isWarn ? 'text-red-400 font-bold' : 'text-slate-400'}>{log.slice(10)}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* COMMAND CONSOLE FOOTER SYSTEM BAR */}
      <footer className="bg-[#06090e] border-t border-slate-900 px-4 py-2 flex flex-col sm:flex-row justify-between items-center text-[8.5px] text-slate-500 relative z-20 gap-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>LAT: <span className="text-white font-bold">{coords.lat.toFixed(5)}° N</span></span>
          <span>LNG: <span className="text-white font-bold">{coords.lng.toFixed(5)}° E</span></span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span>SATELLITE SIGNAL POWER: <span className="text-[#39ff14] font-extrabold">{signalStrength}%</span></span>
        </div>
        
        <div className="font-semibold uppercase tracking-widest text-[#00f0ff] animate-pulse">
          SECURE QUANTUM LINK STATE: SYNCHRONIZED
        </div>
      </footer>

    </div>
  );
}
