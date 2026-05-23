// procedural audio generator using Web Audio API
class AudioSynthesizer {
    constructor() {
        this.ctx = null;
        this.masterVolume = null;
        this.musicVolume = null;
        this.sfxVolume = null;
        this.musicInterval = null;
        this.tempo = 130; // BPM
        this.isMusicPlaying = false;
        this.currentStage = 1;
        this.hevVoiceEnabled = true;
    }

    init() {
        if (this.ctx) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();

        this.masterVolume = this.ctx.createGain();
        this.masterVolume.gain.setValueAtTime(0.8, this.ctx.currentTime);
        this.masterVolume.connect(this.ctx.destination);

        this.musicVolume = this.ctx.createGain();
        this.musicVolume.gain.setValueAtTime(0.4, this.ctx.currentTime);
        this.musicVolume.connect(this.masterVolume);

        this.sfxVolume = this.ctx.createGain();
        this.sfxVolume.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.sfxVolume.connect(this.masterVolume);
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    // SFX: Pistol Shot
    playPistol() {
        this.init();
        this.resume();
        const now = this.ctx.currentTime;

        // Gunshot body (Noise)
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1000, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.12);
        noiseFilter.Q.setValueAtTime(4, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        // Gunshot crack (Oscillator)
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

        oscGain.gain.setValueAtTime(0.6, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        // Connections
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxVolume);

        osc.connect(oscGain);
        oscGain.connect(this.sfxVolume);

        noise.start(now);
        noise.stop(now + 0.15);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    // SFX: Shotgun Shot
    playShotgun() {
        this.init();
        this.resume();
        const now = this.ctx.currentTime;

        // Massive noise burst
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(120, now + 0.3);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(1.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        // Low rumble
        const rumble = this.ctx.createOscillator();
        const rumbleGain = this.ctx.createGain();
        rumble.type = 'triangle';
        rumble.frequency.setValueAtTime(90, now);
        rumble.frequency.linearRampToValueAtTime(20, now + 0.25);
        rumbleGain.gain.setValueAtTime(0.8, now);
        rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxVolume);

        rumble.connect(rumbleGain);
        rumbleGain.connect(this.sfxVolume);

        noise.start(now);
        noise.stop(now + 0.4);
        rumble.start(now);
        rumble.stop(now + 0.3);

        // Mechanical Reload pump sound after 0.5s
        setTimeout(() => this.playReloadClick(0.08), 500);
        setTimeout(() => this.playReloadClick(0.12), 700);
    }

    // SFX: Assault Rifle (M4) Shot
    playAssaultRifle() {
        this.init();
        this.resume();
        const now = this.ctx.currentTime;

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.08);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.06);

        oscGain.gain.setValueAtTime(0.4, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxVolume);

        osc.connect(oscGain);
        oscGain.connect(this.sfxVolume);

        noise.start(now);
        noise.stop(now + 0.1);
        osc.start(now);
        osc.stop(now + 0.07);
    }

    // SFX: Reload Clicks
    playReloadClick(gainMultiplier = 0.1) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);

        gain.gain.setValueAtTime(0.3 * gainMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.sfxVolume);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playReloadSound() {
        this.init();
        this.resume();
        const now = this.ctx.currentTime;
        // Mechanical clink
        this.playReloadClick(0.8);
        setTimeout(() => this.playReloadClick(0.5), 150);
        setTimeout(() => {
            // Chamber sliding forward
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now + 0.35);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.45);
            gain.gain.setValueAtTime(0.15, now + 0.35);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
            osc.connect(gain);
            gain.connect(this.sfxVolume);
            osc.start(now + 0.35);
            osc.stop(now + 0.5);
        }, 50);
    }

    // SFX: Explosion (Barrels, Rockets, Grenades)
    playExplosion() {
        this.init();
        this.resume();
        const now = this.ctx.currentTime;

        // Noise base
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + 1.2);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(2.0, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

        // Low bass thump
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(100, now);
        sub.frequency.exponentialRampToValueAtTime(20, now + 0.6);

        subGain.gain.setValueAtTime(1.5, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxVolume);

        sub.connect(subGain);
        subGain.connect(this.sfxVolume);

        noise.start(now);
        noise.stop(now + 1.6);
        sub.start(now);
        sub.stop(now + 0.7);
    }

    // SFX: Enemy hit / splash
    playHit() {
        this.init();
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.08);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxVolume);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // SFX: Player hurt (classic grunting sound combined with suit warning)
    playPlayerHurt() {
        this.init();
        this.resume();
        const now = this.ctx.currentTime;

        // HEV alert beep
        const beep = this.ctx.createOscillator();
        const beepGain = this.ctx.createGain();
        beep.type = 'sine';
        beep.frequency.setValueAtTime(1800, now);
        beepGain.gain.setValueAtTime(0.4, now);
        beepGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        beep.connect(beepGain);
        beepGain.connect(this.sfxVolume);
        beep.start(now);
        beep.stop(now + 0.16);

        // Low grunt
        const grunt = this.ctx.createOscillator();
        const gruntGain = this.ctx.createGain();
        grunt.type = 'sawtooth';
        grunt.frequency.setValueAtTime(90, now);
        grunt.frequency.linearRampToValueAtTime(50, now + 0.15);

        gruntGain.gain.setValueAtTime(0.5, now);
        gruntGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        grunt.connect(gruntGain);
        gruntGain.connect(this.sfxVolume);
        grunt.start(now);
        grunt.stop(now + 0.16);
    }

    // HEV Suit Alerts (Modular audio bleep sequences)
    playHevWarning(type) {
        if (!this.hevVoiceEnabled) return;
        this.init();
        this.resume();
        const now = this.ctx.currentTime;

        const speakBeep = (freq, duration, delay) => {
            setTimeout(() => {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
                osc.connect(gain);
                gain.connect(this.sfxVolume);
                osc.start(t);
                osc.stop(t + duration);
            }, delay);
        };

        if (type === 'critical') {
            // Rhythmic emergency tone (HEV Flatline warning)
            speakBeep(1200, 0.3, 0);
            speakBeep(1200, 0.3, 350);
            speakBeep(1200, 0.3, 700);
        } else if (type === 'major_fracture') {
            // "Major fracture detected" -> High to Low to Mid tones
            speakBeep(880, 0.15, 0);
            speakBeep(520, 0.15, 180);
            speakBeep(660, 0.25, 360);
        } else if (type === 'minor_lacerations') {
            // "Minor lacerations detected" -> Quick chirp sequence
            speakBeep(980, 0.1, 0);
            speakBeep(880, 0.1, 120);
            speakBeep(1200, 0.15, 240);
        } else if (type === 'shield_empty') {
            // "Power cell depleted" -> Depleted sweep
            speakBeep(440, 0.2, 0);
            speakBeep(220, 0.4, 200);
        } else if (type === 'shield_charge') {
            // Shield charging chimes
            speakBeep(520, 0.1, 0);
            speakBeep(659, 0.1, 80);
            speakBeep(784, 0.12, 160);
            speakBeep(1046, 0.15, 240);
        } else if (type === 'combat_ready') {
            // Boot-up diagnostic chime (HEV boot)
            speakBeep(600, 0.1, 0);
            speakBeep(800, 0.1, 100);
            speakBeep(1000, 0.1, 200);
            speakBeep(1200, 0.2, 300);
        }
    }

    // SFX: Enemy drone firing / laser warning sound
    playDroneBeep() {
        this.init();
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2200, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxVolume);

        osc.start(now);
        osc.stop(now + 0.11);
    }

    // Dynamic Synth Soundtrack
    startMusic() {
        if (this.isMusicPlaying) return;
        this.init();
        this.resume();
        this.isMusicPlaying = true;

        let step = 0;
        const stepDuration = 60 / this.tempo / 2; // Eighth notes

        // Progressive basslines based on current stage
        const basslines = {
            1: [110, 110, 110, 130, 110, 110, 146, 130], // Stage 1 (A minor groove)
            2: [73, 73, 98, 73, 73, 110, 98, 87],       // Stage 2 (D minor industrial)
            3: [82, 82, 82, 98, 82, 82, 123, 110],       // Stage 3 (E minor driving metal)
            4: [65, 65, 87, 65, 65, 98, 87, 73],         // Stage 4 (C minor tension)
            5: [55, 55, 55, 55, 65, 65, 73, 82]          // Stage 5 (Boss/A minor epic build)
        };

        const playMusicStep = () => {
            if (!this.isMusicPlaying || !this.ctx) return;
            const now = this.ctx.currentTime;

            const baseNotes = basslines[this.currentStage] || basslines[1];
            const currentNoteFreq = baseNotes[step % baseNotes.length];

            // 1. Synthesize Bassline
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = 'sawtooth';
            // Scale octave
            bassOsc.frequency.setValueAtTime(currentNoteFreq, now);

            // Add low-pass filter to keep bass warm and avoid clipping
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(250, now);

            bassGain.gain.setValueAtTime(0.25, now);
            // Decay slightly to separate notes
            bassGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration - 0.02);

            bassOsc.connect(filter);
            filter.connect(bassGain);
            bassGain.connect(this.musicVolume);

            bassOsc.start(now);
            bassOsc.stop(now + stepDuration - 0.01);

            // 2. Synthesize High-Hat (ticks on 8th notes, noise based)
            if (step % 2 === 1) {
                const hatSource = this.ctx.createBufferSource();
                hatSource.buffer = this.createNoiseBuffer();

                const hatFilter = this.ctx.createBiquadFilter();
                hatFilter.type = 'highpass';
                hatFilter.frequency.setValueAtTime(8000, now);

                const hatGain = this.ctx.createGain();
                hatGain.gain.setValueAtTime(0.03, now);
                hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

                hatSource.connect(hatFilter);
                hatFilter.connect(hatGain);
                hatGain.connect(this.musicVolume);

                hatSource.start(now);
                hatSource.stop(now + 0.05);
            }

            // 3. Synthesize Kick Drum (on beats 1, 3, 5, 7)
            if (step % 4 === 0) {
                const kickOsc = this.ctx.createOscillator();
                const kickGain = this.ctx.createGain();
                kickOsc.type = 'sine';
                kickOsc.frequency.setValueAtTime(150, now);
                kickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.1);

                kickGain.gain.setValueAtTime(0.6, now);
                kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                kickOsc.connect(kickGain);
                kickGain.connect(this.musicVolume);

                kickOsc.start(now);
                kickOsc.stop(now + 0.13);
            }

            // 4. Synthesize Snare Drum (on beats 2 and 6)
            if (step % 8 === 4) {
                // Snare noise
                const snareSource = this.ctx.createBufferSource();
                snareSource.buffer = this.createNoiseBuffer();

                const snareFilter = this.ctx.createBiquadFilter();
                snareFilter.type = 'bandpass';
                snareFilter.frequency.setValueAtTime(1000, now);

                const snareGain = this.ctx.createGain();
                snareGain.gain.setValueAtTime(0.18, now);
                snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

                snareSource.connect(snareFilter);
                snareFilter.connect(snareGain);
                snareGain.connect(this.musicVolume);

                snareSource.start(now);
                snareSource.stop(now + 0.16);

                // Snare body tone
                const snareTone = this.ctx.createOscillator();
                const snareToneGain = this.ctx.createGain();
                snareTone.type = 'triangle';
                snareTone.frequency.setValueAtTime(180, now);
                snareToneGain.gain.setValueAtTime(0.15, now);
                snareToneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

                snareTone.connect(snareToneGain);
                snareToneGain.connect(this.musicVolume);

                snareTone.start(now);
                snareTone.stop(now + 0.11);
            }

            step++;
            // Schedule the next beat
            const delay = stepDuration * 1000;
            this.musicInterval = setTimeout(playMusicStep, delay);
        };

        playMusicStep();
    }

    stopMusic() {
        this.isMusicPlaying = false;
        if (this.musicInterval) {
            clearTimeout(this.musicInterval);
            this.musicInterval = null;
        }
    }

    setStage(stageIndex) {
        this.currentStage = stageIndex;
        // Bump tempo slightly on harder stages to build tension
        this.tempo = 130 + (stageIndex - 1) * 5;
    }
}

// Export single global instance
window.gameAudio = new AudioSynthesizer();
