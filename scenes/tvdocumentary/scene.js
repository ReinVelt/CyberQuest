/**
 * TV Documentary Scene — "Drenthe: The Unexpected Tech Hub"
 * BBC / Netflix-grade cinematic documentary with:
 *   - Web Audio API synthesised sound FX (whooshes, drones, impacts)
 *   - Ken Burns camera motion on backgrounds
 *   - Cinematic cross-fade transitions
 *   - BBC-style lower-third nameplates (below quote bubbles)
 *   - Film grain, scan lines, vignette overlays
 *   - Progress timeline bar
 */

const TvdocumentaryScene = {
    id: 'tvdocumentary',
    name: 'TV Documentary',

    background: 'assets/images/scenes/tvdocumentary.svg',
    backgroundColor: '#000000',

    description: 'Watching a documentary about Drenthe\'s wireless technology pioneers.',

    playerStart: { x: 50, y: 85 },

    // 🎬 Movie Mode: skip the documentary
    accessibilityPath: ['skip_docu'],

    hotspots: [
        {
            id: 'skip_docu',
            name: '⏭ Skip Documentary',
            x: 2, y: 2, width: 15, height: 8,
            cursor: 'pointer',
            action: (game) => {
                TvdocumentaryScene._cleanupDocumentary();
                game.setFlag('tv_documentary_watched', true);
                game.setFlag('documentary_completed_once', true);
                game.loadScene('livingroom');
            }
        }
    ],

    /* ═══════════════════════════════════════════════════════
     *  AUDIO ENGINE — Cinematic Documentary Sound Design
     *  Rich layered Web Audio API synthesis with reverb,
     *  noise textures, evolving pads, and ambient music bed
     * ═══════════════════════════════════════════════════════ */
    _audioCtx: null,
    _masterGain: null,
    _reverbNodes: {},   // keyed by 'duration-decay'
    _noiseBuffer: null,

    _getAudioCtx() {
        if (!this._audioCtx) {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._audioCtx.state === 'suspended') {
            this._audioCtx.resume();
        }
        // Create master gain (soft-limits overall volume)
        if (!this._masterGain) {
            this._masterGain = this._audioCtx.createGain();
            this._masterGain.gain.value = 0.7;
            this._masterGain.connect(this._audioCtx.destination);
        }
        return this._audioCtx;
    },

    /** Get or create a shared white-noise buffer (1 second) */
    _getNoiseBuffer() {
        if (this._noiseBuffer) return this._noiseBuffer;
        const ctx = this._getAudioCtx();
        const len = ctx.sampleRate;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        this._noiseBuffer = buf;
        return buf;
    },

    /** Create a convolution reverb impulse response (cached per unique params) */
    _createReverb(duration = 2.5, decay = 2.0) {
        const key = `${duration}-${decay}`;
        if (this._reverbNodes[key]) return this._reverbNodes[key];
        const ctx = this._getAudioCtx();
        const len = ctx.sampleRate * duration;
        const buf = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const data = buf.getChannelData(ch);
            for (let i = 0; i < len; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
            }
        }
        const conv = ctx.createConvolver();
        conv.buffer = buf;
        this._reverbNodes[key] = conv;
        // Wire reverb → master
        conv.connect(this._masterGain);
        return conv;
    },

    /** Helper: create a noise source node */
    _createNoise(ctx) {
        const src = ctx.createBufferSource();
        src.buffer = this._getNoiseBuffer();
        src.loop = true;
        return src;
    },

    /* ─── WHOOSH — layered noise sweep with reverb ─── */
    _playWhoosh() {
        try {
            const ctx = this._getAudioCtx();
            const now = ctx.currentTime;
            const rev = this._createReverb();
            const master = this._masterGain;

            // Layer 1: filtered noise sweep (the "air" texture)
            const noise = this._createNoise(ctx);
            const nGain = ctx.createGain();
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass';
            bp.Q.value = 1.2;
            bp.frequency.setValueAtTime(300, now);
            bp.frequency.exponentialRampToValueAtTime(4000, now + 0.18);
            bp.frequency.exponentialRampToValueAtTime(200, now + 0.6);
            nGain.gain.setValueAtTime(0, now);
            nGain.gain.linearRampToValueAtTime(0.18, now + 0.06);
            nGain.gain.linearRampToValueAtTime(0.12, now + 0.18);
            nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
            noise.connect(bp).connect(nGain);
            nGain.connect(master);
            nGain.connect(rev);

            // Layer 2: tonal sweep for body
            const osc = ctx.createOscillator();
            const oGain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(2500, now + 0.15);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.55);
            oGain.gain.setValueAtTime(0, now);
            oGain.gain.linearRampToValueAtTime(0.06, now + 0.04);
            oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc.connect(oGain);
            oGain.connect(master);
            oGain.connect(rev);

            noise.start(now);
            noise.stop(now + 0.8);
            osc.start(now);
            osc.stop(now + 0.7);
        } catch (e) { /* silent fail */ }
    },

    /* ─── IMPACT — deep cinematic boom with sub-bass, transient & reverb tail ─── */
    _playImpact() {
        try {
            const ctx = this._getAudioCtx();
            const now = ctx.currentTime;
            const rev = this._createReverb();
            const master = this._masterGain;

            // Sub-bass thud
            const sub = ctx.createOscillator();
            const subGain = ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(90, now);
            sub.frequency.exponentialRampToValueAtTime(25, now + 1.2);
            subGain.gain.setValueAtTime(0.22, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            sub.connect(subGain);
            subGain.connect(master);
            subGain.connect(rev);

            // Mid transient punch
            const mid = ctx.createOscillator();
            const midGain = ctx.createGain();
            mid.type = 'triangle';
            mid.frequency.setValueAtTime(250, now);
            mid.frequency.exponentialRampToValueAtTime(60, now + 0.3);
            midGain.gain.setValueAtTime(0.12, now);
            midGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            mid.connect(midGain);
            midGain.connect(master);

            // Noise crack layer
            const noise = this._createNoise(ctx);
            const nGain = ctx.createGain();
            const hp = ctx.createBiquadFilter();
            hp.type = 'highpass';
            hp.frequency.value = 2000;
            nGain.gain.setValueAtTime(0.1, now);
            nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            noise.connect(hp).connect(nGain);
            nGain.connect(master);
            nGain.connect(rev);

            sub.start(now); sub.stop(now + 1.6);
            mid.start(now); mid.stop(now + 0.4);
            noise.start(now); noise.stop(now + 0.15);
        } catch (e) { /* silent fail */ }
    },

    /* ─── DRONE — rich evolving ambient pad with LFO modulation ─── */
    _playDrone() {
        try {
            const ctx = this._getAudioCtx();
            const now = ctx.currentTime;
            const rev = this._createReverb(3.5, 1.8);
            const master = this._masterGain;

            // Master drone gain (for fade-out)
            const droneGain = ctx.createGain();
            droneGain.gain.setValueAtTime(0, now);
            droneGain.gain.linearRampToValueAtTime(1, now + 3);
            droneGain.connect(master);

            // Warm filter
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.value = 350;
            lp.Q.value = 0.7;
            lp.connect(droneGain);
            lp.connect(rev);

            // LFO for filter modulation (slow breathing)
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.type = 'sine';
            lfo.frequency.value = 0.08; // very slow
            lfoGain.gain.value = 100;
            lfo.connect(lfoGain);
            lfoGain.connect(lp.frequency);
            lfo.start(now);

            // 4 detuned oscillators for richness
            const freqs = [55, 82.5, 110, 165]; // A1, E2, A2, E3
            const types = ['sine', 'sine', 'triangle', 'sine'];
            const gains = [0.07, 0.05, 0.03, 0.02];
            const oscs = freqs.map((f, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = types[i];
                o.frequency.value = f;
                // Slight random detune for warmth
                o.detune.value = (Math.random() - 0.5) * 12;
                g.gain.value = gains[i];
                o.connect(g).connect(lp);
                o.start(now);
                return o;
            });

            // Sub-bass breathe layer (very slow vibrato)
            const subLfo = ctx.createOscillator();
            const subLfoG = ctx.createGain();
            subLfo.type = 'sine';
            subLfo.frequency.value = 0.15;
            subLfoG.gain.value = 3;
            subLfo.connect(subLfoG);
            oscs[0] && subLfoG.connect(oscs[0].frequency);
            subLfo.start(now);

            return () => {
                const t = ctx.currentTime;
                droneGain.gain.linearRampToValueAtTime(0.001, t + 2);
                setTimeout(() => {
                    oscs.forEach(o => { try { o.stop(); } catch(e){} });
                    try { lfo.stop(); subLfo.stop(); } catch(e){}
                }, 2200);
            };
        } catch (e) { return () => {}; }
    },

    /* ─── TICK — warm piano-like pluck with harmonics ─── */
    _playTick() {
        try {
            const ctx = this._getAudioCtx();
            const now = ctx.currentTime;
            const master = this._masterGain;
            const rev = this._createReverb();

            // Fundamental
            const baseFreq = 800 + Math.random() * 300;
            const harmonics = [1, 2, 3, 5];
            const hGains = [0.05, 0.025, 0.012, 0.006];

            harmonics.forEach((h, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = baseFreq * h;
                gain.gain.setValueAtTime(hGains[i], now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2 + i * 0.05);
                osc.connect(gain);
                gain.connect(master);
                if (i === 0) gain.connect(rev);
                osc.start(now);
                osc.stop(now + 0.3 + i * 0.05);
            });
        } catch (e) { /* silent fail */ }
    },

    /* ─── RISER — multi-layered tension build ─── */
    _playRiser() {
        try {
            const ctx = this._getAudioCtx();
            const now = ctx.currentTime;
            const rev = this._createReverb();
            const master = this._masterGain;

            // Tonal sweep
            const osc = ctx.createOscillator();
            const oGain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 2.0);
            oGain.gain.setValueAtTime(0, now);
            oGain.gain.linearRampToValueAtTime(0.05, now + 0.3);
            oGain.gain.linearRampToValueAtTime(0.07, now + 1.6);
            oGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.setValueAtTime(400, now);
            lp.frequency.exponentialRampToValueAtTime(3000, now + 2.0);
            osc.connect(lp).connect(oGain);
            oGain.connect(master);
            oGain.connect(rev);

            // Noise texture rising underneath
            const noise = this._createNoise(ctx);
            const nGain = ctx.createGain();
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass';
            bp.Q.value = 2;
            bp.frequency.setValueAtTime(500, now);
            bp.frequency.exponentialRampToValueAtTime(5000, now + 2.0);
            nGain.gain.setValueAtTime(0, now);
            nGain.gain.linearRampToValueAtTime(0.04, now + 1.0);
            nGain.gain.linearRampToValueAtTime(0.08, now + 1.8);
            nGain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);
            noise.connect(bp).connect(nGain);
            nGain.connect(master);

            // Sub-bass swell
            const sub = ctx.createOscillator();
            const sGain = ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(55, now);
            sub.frequency.linearRampToValueAtTime(80, now + 2.0);
            sGain.gain.setValueAtTime(0, now);
            sGain.gain.linearRampToValueAtTime(0.08, now + 1.5);
            sGain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);
            sub.connect(sGain);
            sGain.connect(master);

            osc.start(now); osc.stop(now + 2.4);
            noise.start(now); noise.stop(now + 2.5);
            sub.start(now); sub.stop(now + 2.5);
        } catch (e) { /* silent fail */ }
    },

    /* ─── CHIME — bell-like harmonics with pentatonic resolution ─── */
    _playChime() {
        try {
            const ctx = this._getAudioCtx();
            const now = ctx.currentTime;
            const rev = this._createReverb();
            const master = this._masterGain;

            // Pentatonic: C5, D5, E5, G5, A5, C6
            const notes = [523, 587, 659, 784, 880, 1047];
            notes.forEach((freq, i) => {
                const t = now + i * 0.18;
                // Fundamental + 2nd partial for bell-like quality
                [1, 2.76].forEach((partial, pi) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = pi === 0 ? 'sine' : 'triangle';
                    osc.frequency.value = freq * partial;
                    const vol = pi === 0 ? 0.06 : 0.015;
                    gain.gain.setValueAtTime(0, t);
                    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2 - pi * 0.3);
                    osc.connect(gain);
                    gain.connect(master);
                    gain.connect(rev);
                    osc.start(t);
                    osc.stop(t + 1.4);
                });
            });
        } catch (e) { /* silent fail */ }
    },

    /* ─── MUSIC BED — gentle ambient generative music ─── */
    _playMusicBed() {
        try {
            const ctx = this._getAudioCtx();
            const now = ctx.currentTime;
            const rev = this._createReverb(4, 1.5);
            const master = this._masterGain;

            const musicGain = ctx.createGain();
            musicGain.gain.setValueAtTime(0, now);
            musicGain.gain.linearRampToValueAtTime(1, now + 4);

            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.value = 600;
            lp.Q.value = 0.5;
            lp.connect(musicGain);
            musicGain.connect(master);

            // Warm pad — slow chord tones
            // Am → C → F → G progression (gentle, cinematic)
            const chords = [
                [220, 261.6, 329.6],    // Am (A3, C4, E4)
                [261.6, 329.6, 392],     // C  (C4, E4, G4)
                [174.6, 220, 261.6],     // F  (F3, A3, C4)
                [196, 246.9, 293.7],     // G  (G3, B3, D4)
            ];

            const chordDur = 8; // seconds per chord
            let activeOscs = [];

            const playChord = (chordIdx) => {
                const chord = chords[chordIdx % chords.length];
                const t = ctx.currentTime;

                chord.forEach((freq) => {
                    // Two detuned oscillators per note for warmth
                    [-4, 4].forEach((detune) => {
                        const osc = ctx.createOscillator();
                        const g = ctx.createGain();
                        osc.type = 'sine';
                        osc.frequency.value = freq;
                        osc.detune.value = detune;
                        g.gain.setValueAtTime(0, t);
                        g.gain.linearRampToValueAtTime(0.025, t + 1.5);
                        g.gain.linearRampToValueAtTime(0.025, t + chordDur - 1.5);
                        g.gain.linearRampToValueAtTime(0, t + chordDur);
                        osc.connect(g).connect(lp);
                        g.connect(rev);
                        osc.start(t);
                        osc.stop(t + chordDur + 0.1);
                        activeOscs.push(osc);
                    });
                });

                // Simple arpeggio on top (sparse, atmospheric)
                const arpNotes = [...chord, chord[0] * 2]; // octave up
                arpNotes.forEach((freq, i) => {
                    const at = t + i * 1.8 + 0.5;
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = freq * 2; // one octave up
                    g.gain.setValueAtTime(0, at);
                    g.gain.linearRampToValueAtTime(0.015, at + 0.1);
                    g.gain.exponentialRampToValueAtTime(0.001, at + 2.5);
                    osc.connect(g).connect(lp);
                    g.connect(rev);
                    osc.start(at);
                    osc.stop(at + 3);
                    activeOscs.push(osc);
                });
            };

            // Start chord progression loop
            let chordIndex = 0;
            let stopped = false;
            const scheduleNext = () => {
                if (stopped) return;
                playChord(chordIndex);
                chordIndex++;
                TvdocumentaryScene._musicTimer = setTimeout(scheduleNext, chordDur * 1000);
            };
            scheduleNext();

            return () => {
                stopped = true;
                clearTimeout(TvdocumentaryScene._musicTimer);
                const t = ctx.currentTime;
                musicGain.gain.linearRampToValueAtTime(0.001, t + 2);
                setTimeout(() => {
                    activeOscs.forEach(o => { try { o.stop(); } catch(e){} });
                    activeOscs = [];
                }, 2500);
            };
        } catch (e) { return () => {}; }
    },
    _musicTimer: null,

    /* ═══════════════════════════════════════════════════════
     *  CLEANUP
     * ═══════════════════════════════════════════════════════ */
    _cleanupDocumentary() {
        const overlay = document.getElementById('docu-overlay');
        if (overlay) overlay.remove();
        const style = document.getElementById('docu-style');
        if (style) style.remove();
        if (TvdocumentaryScene._stopDrone) {
            TvdocumentaryScene._stopDrone();
            TvdocumentaryScene._stopDrone = null;
        }
        if (TvdocumentaryScene._musicStop) {
            TvdocumentaryScene._musicStop();
            TvdocumentaryScene._musicStop = null;
        }
        // Stop any ongoing TTS
        TvdocumentaryScene._stopSpeech();
    },

    _stopDrone: null,
    _musicStop: null,

    /** Speak text via the game voice system (with speaker profile). Returns a Promise. */
    _speak(text, speaker = 'Documentary') {
        try {
            const vm = window.voiceManager;
            if (vm && vm.enabled) {
                // vm.speak() internally cancels any prior utterance
                return vm.speak(text, speaker); // returns a Promise
            }
        } catch (e) { /* TTS not critical */ }
        return Promise.resolve();
    },

    /** Stop any ongoing TTS */
    _stopSpeech() {
        try {
            const vm = window.voiceManager;
            if (vm) vm.stop();
        } catch (e) { /* silent */ }
    },

    /* ═══════════════════════════════════════════════════════
     *  MAIN DOCUMENTARY OVERLAY
     * ═══════════════════════════════════════════════════════ */
    showDocumentaryOverlay(game) {
        const self = TvdocumentaryScene;

        // ── CSS ──
        const style = document.createElement('style');
        style.id = 'docu-style';
        style.textContent = `
            /* ═══════ BASE OVERLAY ═══════ */
            #docu-overlay {
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: #000;
                z-index: 8000;
                overflow: hidden;
                font-family: 'Helvetica Neue', 'Arial', sans-serif;
            }

            /* ═══════ SCREEN CONTAINER ═══════ */
            .docu-screen {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                opacity: 0;
                transition: opacity 1.2s ease-in-out;
            }
            .docu-screen.active { opacity: 1; }

            /* ═══════ BACKGROUND — Ken Burns ═══════ */
            .docu-bg {
                position: absolute;
                top: -5%; left: -5%;
                width: 110%; height: 110%;
                background-size: cover;
                background-position: center;
                filter: brightness(0.6) contrast(1.1) saturate(0.9);
                animation: kenBurns 12s ease-in-out forwards;
            }
            @keyframes kenBurns {
                0%   { transform: scale(1) translate(0, 0); }
                100% { transform: scale(1.08) translate(-1%, -1%); }
            }

            /* ═══════ LETTERBOX BARS ═══════ */
            .docu-letterbox-top,
            .docu-letterbox-bottom {
                position: absolute;
                left: 0; width: 100%;
                background: #000;
                z-index: 50;
                pointer-events: none;
            }
            .docu-letterbox-top    { top: 0; height: 6%; }
            .docu-letterbox-bottom { bottom: 0; height: 6%; }

            /* ═══════ FILM GRAIN OVERLAY ═══════ */
            .docu-grain {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.06'/%3E%3C/svg%3E");
                opacity: 0.4;
                mix-blend-mode: overlay;
                pointer-events: none;
                z-index: 40;
                animation: grainShift 0.3s steps(4) infinite;
            }
            @keyframes grainShift {
                0%   { transform: translate(0, 0); }
                25%  { transform: translate(-2px, 3px); }
                50%  { transform: translate(3px, -1px); }
                75%  { transform: translate(-1px, -2px); }
                100% { transform: translate(2px, 1px); }
            }

            /* ═══════ SCAN LINES ═══════ */
            .docu-scanlines {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.06) 2px,
                    rgba(0,0,0,0.06) 4px
                );
                pointer-events: none;
                z-index: 41;
            }

            /* ═══════ VIGNETTE ═══════ */
            .docu-vignette {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%);
                pointer-events: none;
                z-index: 42;
            }

            /* ═══════ TITLE CARD — BBC style ═══════ */
            .docu-title-card {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                width: 85%;
                z-index: 20;
            }
            .docu-title-card h1 {
                font-size: 3.8em;
                font-weight: 100;
                letter-spacing: 14px;
                color: #fff;
                text-transform: uppercase;
                margin: 0 0 20px 0;
                opacity: 0;
                animation: titleReveal 2s ease-out 0.3s forwards;
                text-shadow: 0 2px 30px rgba(0,0,0,0.8);
            }
            .docu-title-card h2 {
                font-size: 1.6em;
                font-weight: 300;
                letter-spacing: 4px;
                color: #c0c0c0;
                margin: 0;
                opacity: 0;
                animation: subtitleReveal 1.5s ease-out 1.2s forwards;
                text-shadow: 0 2px 20px rgba(0,0,0,0.8);
            }
            .docu-title-card .docu-accent {
                display: block;
                width: 80px;
                height: 2px;
                background: #e63946;
                margin: 25px auto;
                opacity: 0;
                animation: lineGrow 1s ease-out 0.8s forwards;
            }

            @keyframes titleReveal {
                0%   { opacity: 0; transform: translateY(20px); letter-spacing: 20px; }
                100% { opacity: 1; transform: translateY(0); letter-spacing: 14px; }
            }
            @keyframes subtitleReveal {
                0%   { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes lineGrow {
                0%   { opacity: 0; width: 0; }
                100% { opacity: 1; width: 80px; }
            }

            /* ═══════ CHAPTER CARD ═══════ */
            .docu-chapter {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                z-index: 20;
                opacity: 0;
                animation: chapterReveal 1.5s ease-out 0.2s forwards;
            }
            .docu-chapter .chapter-num {
                font-size: 1em;
                font-weight: 300;
                letter-spacing: 8px;
                color: #e63946;
                text-transform: uppercase;
                margin: 0 0 12px 0;
            }
            .docu-chapter .chapter-title {
                font-size: 2.8em;
                font-weight: 100;
                letter-spacing: 8px;
                color: #fff;
                text-transform: uppercase;
                margin: 0;
                text-shadow: 0 2px 30px rgba(0,0,0,0.8);
            }
            .docu-chapter .chapter-line {
                display: block;
                width: 60px;
                height: 2px;
                background: #e63946;
                margin: 18px auto 0;
            }
            @keyframes chapterReveal {
                0%   { opacity: 0; transform: translate(-50%, -40%); }
                100% { opacity: 1; transform: translate(-50%, -50%); }
            }

            /* ═══════ CHARACTER ENTRANCE ═══════ */
            .docu-character-scene {
                position: absolute;
                bottom: 0; left: 0;
                width: 100%; height: 100%;
            }
            .docu-character {
                position: absolute;
                bottom: 6%;
                left: 5%;
                opacity: 0;
                transform: translateX(-60px) scale(0.95);
                transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                z-index: 10;
            }
            .docu-character.active {
                opacity: 1;
                transform: translateX(0) scale(1);
            }
            .docu-character img {
                height: 60vh;
                filter: drop-shadow(0 10px 50px rgba(0,0,0,0.9));
            }

            /* ═══════ NAMEPLATE — BBC lower-third ═══════ */
            .docu-nameplate {
                position: absolute;
                bottom: 10%;
                left: 5%;
                display: flex;
                align-items: stretch;
                transform: translateX(-110%);
                animation: nameplateSlide 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.6s forwards;
                z-index: 15;
            }
            .docu-nameplate .np-accent {
                width: 5px;
                background: #e63946;
                flex-shrink: 0;
            }
            .docu-nameplate .np-content {
                background: rgba(0, 0, 0, 0.85);
                padding: 14px 28px 14px 18px;
                backdrop-filter: blur(10px);
            }
            .docu-nameplate h3 {
                font-size: 1.6em;
                font-weight: 600;
                color: #fff;
                margin: 0 0 4px 0;
                letter-spacing: 1px;
            }
            .docu-nameplate p {
                font-size: 1em;
                color: #aaa;
                margin: 0;
                font-weight: 300;
                letter-spacing: 0.5px;
            }
            @keyframes nameplateSlide {
                0%   { transform: translateX(-110%); }
                100% { transform: translateX(0); }
            }

            /* ═══════ QUOTE BUBBLE — above nameplate ═══════ */
            .docu-quote-bubble {
                position: absolute;
                bottom: 24%;
                right: 6%;
                width: 42%;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(20px);
                padding: 28px 35px;
                border-left: 4px solid #e63946;
                border-radius: 4px;
                box-shadow: 0 15px 60px rgba(0,0,0,0.6);
                opacity: 0;
                transform: translateY(20px);
                animation: quoteReveal 0.8s ease-out 1s forwards;
                z-index: 14;
            }
            .docu-quote-bubble::before {
                content: '\\201C';
                position: absolute;
                top: -8px;
                left: 14px;
                font-size: 4em;
                color: rgba(230, 57, 70, 0.4);
                font-family: Georgia, serif;
                line-height: 1;
            }
            .docu-quote-bubble p {
                font-size: 1.4em;
                font-weight: 300;
                color: #eee;
                margin: 0;
                line-height: 1.65;
                text-shadow: 0 1px 8px rgba(0,0,0,0.7);
                position: relative;
                z-index: 1;
            }
            @keyframes quoteReveal {
                0%   { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }

            /* ═══════ TEXT OVERLAY — narration ═══════ */
            .docu-text-overlay {
                position: absolute;
                bottom: 10%;
                left: 50%;
                transform: translateX(-50%);
                width: 70%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(15px);
                padding: 28px 45px;
                border-left: 4px solid #e63946;
                border-radius: 4px;
                box-shadow: 0 10px 50px rgba(0,0,0,0.7);
                opacity: 0;
                animation: textSlideUp 0.8s ease-out 0.3s forwards;
                z-index: 20;
            }
            .docu-text-overlay p {
                font-size: 1.4em;
                font-weight: 300;
                color: #ddd;
                margin: 10px 0;
                line-height: 1.7;
                text-align: left;
                text-shadow: 0 1px 6px rgba(0,0,0,0.6);
            }
            .docu-text-overlay a {
                display: inline-block;
                margin-top: 12px;
                padding: 10px 24px;
                background: rgba(230, 57, 70, 0.25);
                border: 1px solid rgba(230, 57, 70, 0.6);
                border-radius: 4px;
                color: #fff;
                text-decoration: none;
                font-weight: 400;
                font-size: 0.9em;
                letter-spacing: 1px;
                transition: all 0.3s ease;
            }
            .docu-text-overlay a:hover {
                background: rgba(230, 57, 70, 0.5);
                box-shadow: 0 0 20px rgba(230, 57, 70, 0.4);
            }
            @keyframes textSlideUp {
                0%   { opacity: 0; transform: translate(-50%, 30px); }
                100% { opacity: 1; transform: translate(-50%, 0); }
            }

            /* ═══════ CONTINUE BUTTON ═══════ */
            .docu-continue {
                position: absolute;
                bottom: 2%;
                right: 3%;
                font-size: 0.95em;
                font-weight: 500;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: #aaa;
                background: rgba(0,0,0,0.6);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 4px;
                padding: 10px 24px;
                cursor: pointer;
                z-index: 55;
                transition: all 0.3s ease;
                backdrop-filter: blur(5px);
            }
            .docu-continue:hover {
                color: #fff;
                border-color: #e63946;
                background: rgba(230, 57, 70, 0.2);
                box-shadow: 0 0 20px rgba(230, 57, 70, 0.3);
            }

            /* ═══════ TIMELINE BAR ═══════ */
            .docu-timeline {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: rgba(255,255,255,0.08);
                z-index: 55;
            }
            .docu-timeline-fill {
                height: 100%;
                background: #e63946;
                width: 0%;
                transition: width 0.3s ease;
            }

            /* ═══════ STEP COUNTER ═══════ */
            .docu-step-counter {
                position: absolute;
                top: 2.5%;
                right: 3%;
                font-size: 0.8em;
                font-weight: 300;
                letter-spacing: 3px;
                color: rgba(255,255,255,0.3);
                z-index: 55;
            }

            /* ═══════ NETWORK BRAND ═══════ */
            .docu-brand {
                position: absolute;
                top: 2.5%;
                left: 3%;
                font-size: 0.7em;
                font-weight: 600;
                letter-spacing: 4px;
                text-transform: uppercase;
                color: rgba(255,255,255,0.2);
                z-index: 55;
            }

            /* ═══════ FACT LINE (yellow — properly aligned) ═══════ */
            .docu-fact {
                display: block;
                margin-top: 14px;
                padding: 10px 18px;
                background: rgba(230, 170, 0, 0.12);
                border-left: 3px solid #e6aa00;
                border-radius: 2px;
                font-size: 0.85em !important;
                color: #e6d280 !important;
                font-style: italic;
                line-height: 1.5 !important;
            }

            /* ═══════ INTERVIEW BG CHAPTER LABEL ═══════ */
            .docu-chapter-label {
                position: absolute;
                top: 8%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 0.85em;
                font-weight: 300;
                letter-spacing: 6px;
                text-transform: uppercase;
                color: rgba(255,255,255,0.25);
                z-index: 18;
                padding: 8px 20px;
                border: 1px solid rgba(255,255,255,0.1);
            }

            /* ═══════ GLOBAL TRANSITIONS ═══════ */
            .docu-screen { animation: screenFadeIn 0.5s ease forwards; }
            @keyframes screenFadeIn {
                0%   { opacity: 0; }
                100% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // ── Overlay container ──
        const overlay = document.createElement('div');
        overlay.id = 'docu-overlay';
        document.body.appendChild(overlay);

        // Start background drone + ambient music bed
        self._stopDrone = self._playDrone();
        self._musicStop = self._playMusicBed();

        // ── Documentary sequence ──
        const sequence = [
            // ─── 0: COLD OPEN ───
            {
                duration: 8000,
                sound: 'impact',
                voice: { text: 'Drenthe. The Unexpected Tech Hub. From quiet heathlands came wireless innovations that changed the world.', speaker: 'Documentary' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdocumentary.svg');"></div>
                    <div class="docu-title-card">
                        <h1>DRENTHE</h1>
                        <span class="docu-accent"></span>
                        <h2>The Unexpected Tech Hub</h2>
                    </div>
                `
            },
            // ─── 1: NARRATOR — introduces the theme ───
            {
                duration: 10000,
                sound: 'whoosh',
                voice: { text: 'In the north-east of the Netherlands lies Drenthe. A province of rolling heathlands, ancient dolmens, and vast open skies. It is also home to some of the most revolutionary wireless technology ever created.', speaker: 'Documentary' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdocumentary.svg'); animation-duration: 14s;"></div>
                    <div class="docu-text-overlay">
                        <p>In the north-east of the Netherlands lies Drenthe &mdash; a province of rolling heathlands, ancient dolmens, and vast open skies.</p>
                        <p>It is also home to some of the most revolutionary wireless technology ever created.</p>
                    </div>
                `
            },
            // ─── 2: CHAPTER 1 CARD ───
            {
                duration: 7000,
                sound: 'impact',
                voice: { text: 'Chapter One. The Dishes of Drenthe. Modern antenna technology and the science of radio astronomy.', speaker: 'Documentary' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_wsrt.svg'); animation-duration: 10s;"></div>
                    <div class="docu-chapter">
                        <div class="chapter-num">Chapter One</div>
                        <div class="chapter-title">THE DISHES OF DRENTHE</div>
                        <span class="chapter-line"></span>
                    </div>
                `
            },
            // ─── 3: DAVID PRINSLOO — intro ───
            {
                duration: 11000,
                sound: 'whoosh',
                character: true,
                voice: { text: 'My specialty is phased array technology. Thousands of small antennas working as one giant ear to the universe. We can listen to signals that have been travelling for billions of years.', speaker: 'David Prinsloo' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg');"></div>
                    <div class="docu-chapter-label">Chapter 1 &mdash; The Dishes of Drenthe</div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/david_prinsloo_southpark.svg" alt="Dr. David Prinsloo">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <div class="np-accent"></div>
                        <div class="np-content">
                            <h3>Dr. David Prinsloo</h3>
                            <p>Antenna Engineer &middot; TU Eindhoven</p>
                        </div>
                    </div>
                    <div class="docu-quote-bubble">
                        <p>My specialty is phased array technology &mdash; thousands of small antennas working as one giant ear to the universe. We can listen to signals that have been travelling for billions of years.</p>
                    </div>
                `
            },
            // ─── 4: DAVID PRINSLOO — antennas explained ───
            {
                duration: 11000,
                sound: 'tick',
                character: true,
                voice: { text: 'The beauty of a phased array is that you steer the beam electronically, not mechanically. No moving parts. You combine the signals from each individual antenna with precise time delays, and suddenly you have a virtual dish the size of a football field.', speaker: 'David Prinsloo' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg'); animation-direction: reverse;"></div>
                    <div class="docu-chapter-label">Chapter 1 &mdash; The Dishes of Drenthe</div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/david_prinsloo_southpark.svg" alt="Dr. David Prinsloo">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <div class="np-accent"></div>
                        <div class="np-content">
                            <h3>Dr. David Prinsloo</h3>
                            <p>Antenna Engineer &middot; TU Eindhoven</p>
                        </div>
                    </div>
                    <div class="docu-quote-bubble">
                        <p>The beauty of a phased array is that you steer the beam electronically, not mechanically. No moving parts. You combine the signals from each individual antenna with precise time delays, and suddenly you have a virtual dish the size of a football field.</p>
                    </div>
                `
            },
            // ─── 5: DAVID PRINSLOO — lunar telescope ───
            {
                duration: 12000,
                sound: 'riser',
                character: true,
                voice: { text: 'We are designing antennas for the lunar far side. Radio telescopes on the Moon, completely shielded from Earth\'s radio interference. The Dark Ages Explorer will listen for signals from the very first stars, over thirteen billion years ago. It is the ultimate quiet zone for radio astronomy.', speaker: 'David Prinsloo' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg');"></div>
                    <div class="docu-chapter-label">Chapter 1 &mdash; The Dishes of Drenthe</div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/david_prinsloo_southpark.svg" alt="Dr. David Prinsloo">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <div class="np-accent"></div>
                        <div class="np-content">
                            <h3>Dr. David Prinsloo</h3>
                            <p>Antenna Engineer &middot; TU Eindhoven</p>
                        </div>
                    </div>
                    <div class="docu-quote-bubble">
                        <p>We're designing antennas for the lunar far side &mdash; radio telescopes on the Moon, completely shielded from Earth's radio interference. The Dark Ages Explorer will listen for signals from the very first stars, over thirteen billion years ago. It is the ultimate quiet zone for radio astronomy.</p>
                    </div>
                `
            },
            // ─── 6: NARRATOR — transition to LOFAR ───
            {
                duration: 9000,
                sound: 'whoosh',
                voice: { text: 'The principles that David describes are not just theoretical. Just ninety kilometres north, in the peat bogs of Drenthe, they have been put to practice on an unprecedented scale.', speaker: 'Documentary' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_wsrt.svg'); animation-direction: reverse; animation-duration: 12s;"></div>
                    <div class="docu-text-overlay">
                        <p>The principles that David describes are not just theoretical.</p>
                        <p>Just ninety kilometres north, in the peat bogs of Drenthe, they have been put to practice on an unprecedented scale.</p>
                    </div>
                `
            },
            // ─── 7: CHAPTER 2 CARD ───
            {
                duration: 7000,
                sound: 'impact',
                voice: { text: 'Chapter Two. Software That Sees. LOFAR, the digital telescope that rewrote the rules of radio astronomy.', speaker: 'Documentary' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_lofar.svg');"></div>
                    <div class="docu-chapter">
                        <div class="chapter-num">Chapter Two</div>
                        <div class="chapter-title">SOFTWARE THAT SEES</div>
                        <span class="chapter-line"></span>
                    </div>
                `
            },
            // ─── 8: CEES BASSA — digital telescope ───
            {
                duration: 12000,
                sound: 'whoosh',
                character: true,
                voice: { text: 'We built the most advanced digital radio telescope on Earth. Fifty thousand simple antennas spread across Europe, all connected by fibre optics. No moving parts whatsoever. The genius is entirely in the software. We combine the signals digitally, and the computer does the pointing.', speaker: 'Cees Bassa' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg');"></div>
                    <div class="docu-chapter-label">Chapter 2 &mdash; Software That Sees</div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/cees_bassa_southpark.svg" alt="Cees Bassa">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <div class="np-accent"></div>
                        <div class="np-content">
                            <h3>Cees Bassa</h3>
                            <p>ASTRON Scientist &middot; LOFAR Team</p>
                        </div>
                    </div>
                    <div class="docu-quote-bubble">
                        <p>We built the most advanced digital radio telescope on Earth. Fifty thousand simple antennas spread across Europe, all connected by fibre optics. No moving parts whatsoever. The genius is entirely in the software &mdash; the computer does the pointing.</p>
                    </div>
                `
            },
            // ─── 9: CEES BASSA — beamforming ───
            {
                duration: 11000,
                sound: 'tick',
                character: true,
                voice: { text: 'We can point the telescope anywhere in the sky, without moving a single antenna. It is all done with mathematics. We add tiny time delays to each signal, and they combine constructively in exactly the direction we want. We can even look at multiple parts of the sky simultaneously.', speaker: 'Cees Bassa' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg'); animation-direction: reverse;"></div>
                    <div class="docu-chapter-label">Chapter 2 &mdash; Software That Sees</div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/cees_bassa_southpark.svg" alt="Cees Bassa">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <div class="np-accent"></div>
                        <div class="np-content">
                            <h3>Cees Bassa</h3>
                            <p>ASTRON Scientist &middot; LOFAR Team</p>
                        </div>
                    </div>
                    <div class="docu-quote-bubble">
                        <p>We can point the telescope anywhere in the sky &mdash; without moving a single antenna. It is all done with mathematics. We add tiny time delays to each signal, and they combine constructively in exactly the direction we want. We can even look at multiple parts of the sky simultaneously.</p>
                    </div>
                `
            },
            // ─── 10: CEES BASSA — Starlink interference ───
            {
                duration: 12000,
                sound: 'riser',
                character: true,
                voice: { text: 'Then came Starlink. We discovered that SpaceX satellites were leaking unintended radio emissions right into our observation frequencies. Thousands of satellites, drowning out the faintest whispers from the cosmos. I converted the interference patterns into sound and video to show people what we were losing. It was like trying to listen to a pin drop at a rock concert.', speaker: 'Cees Bassa' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg');"></div>
                    <div class="docu-chapter-label">Chapter 2 &mdash; Software That Sees</div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/cees_bassa_southpark.svg" alt="Cees Bassa">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <div class="np-accent"></div>
                        <div class="np-content">
                            <h3>Cees Bassa</h3>
                            <p>ASTRON Scientist &middot; LOFAR Team</p>
                        </div>
                    </div>
                    <div class="docu-quote-bubble">
                        <p>Then came Starlink. We discovered that SpaceX satellites were leaking unintended radio emissions right into our observation frequencies. Thousands of satellites, drowning out the faintest whispers from the cosmos. I converted the interference patterns into sound and video to show people what we were losing. It was like trying to listen to a pin drop at a rock concert.</p>
                    </div>
                `
            },
            // ─── 11: NARRATOR — transition to Bluetooth ───
            {
                duration: 9000,
                sound: 'whoosh',
                voice: { text: 'While Drenthe scientists pushed the boundaries of listening to the universe, a Dutch engineer working in Emmen was about to change the way every device on Earth communicates.', speaker: 'Documentary' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_lofar.svg'); animation-direction: reverse; animation-duration: 12s;"></div>
                    <div class="docu-text-overlay">
                        <p>While Drenthe scientists pushed the boundaries of listening to the universe, a Dutch engineer in Emmen was about to change the way every device on Earth communicates.</p>
                    </div>
                `
            },
            // ─── 12: CHAPTER 3 CARD ───
            {
                duration: 8000,
                sound: 'riser',
                voice: { text: 'Chapter Three. Bluetooth. Named after the Viking king Harald Bluetooth, who united the warring tribes of Denmark. In the early nineteen-nineties, engineer Jaap Haartsen developed a short-range wireless protocol at Ericsson.', speaker: 'Documentary' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_bluetooth.svg');"></div>
                    <div class="docu-chapter">
                        <div class="chapter-num">Chapter Three</div>
                        <div class="chapter-title">BLUETOOTH</div>
                        <span class="chapter-line"></span>
                    </div>
                    <div class="docu-text-overlay">
                        <p>Named after Viking king Harald Bl&aring;tand &mdash; "Bluetooth" &mdash; who united the tribes of Denmark.</p>
                        <p><span class="docu-fact">In the early 1990s, Dutch engineer Jaap Haartsen developed a short-range wireless protocol at Ericsson in Emmen.</span></p>
                    </div>
                `
            },
            // ─── 13: JAAP HAARTSEN — frequency hopping ───
            {
                duration: 12000,
                sound: 'whoosh',
                character: true,
                voice: { text: 'The challenge was enormous. We needed a protocol that could work in the unlicensed spectrum, the same crowded band used by microwave ovens and baby monitors. The solution was frequency-hopping spread spectrum. The radio hops between seventy-nine different frequencies, sixteen hundred times per second. If another device is on one frequency, you have already moved to the next one.', speaker: 'Jaap Haartsen' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg');"></div>
                    <div class="docu-chapter-label">Chapter 3 &mdash; Bluetooth</div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/jaap_haartsen_southpark.svg" alt="Jaap Haartsen">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <div class="np-accent"></div>
                        <div class="np-content">
                            <h3>Jaap Haartsen</h3>
                            <p>Inventor of Bluetooth &middot; Ericsson</p>
                        </div>
                    </div>
                    <div class="docu-quote-bubble">
                        <p>The challenge was enormous. We needed a protocol that could work in the unlicensed spectrum, the same crowded band used by microwave ovens and baby monitors. The solution was frequency-hopping spread spectrum. The radio hops between 79 frequencies, 1,600 times per second. If another device is on one frequency, you've already moved to the next one.</p>
                    </div>
                `
            },
            // ─── 14: JAAP HAARTSEN — impact ───
            {
                duration: 11000,
                sound: 'tick',
                character: true,
                voice: { text: 'When we started, people said short-range wireless would never replace cables. Now over five billion Bluetooth devices ship every single year. Your phone, your car, your hearing aids, your medical devices. The technology has become invisible, and that was always the goal. The best technology is the kind you never notice.', speaker: 'Jaap Haartsen' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg'); animation-direction: reverse;"></div>
                    <div class="docu-chapter-label">Chapter 3 &mdash; Bluetooth</div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/jaap_haartsen_southpark.svg" alt="Jaap Haartsen">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <div class="np-accent"></div>
                        <div class="np-content">
                            <h3>Jaap Haartsen</h3>
                            <p>Inventor of Bluetooth &middot; Ericsson</p>
                        </div>
                    </div>
                    <div class="docu-quote-bubble">
                        <p>When we started, people said short-range wireless would never replace cables. Now over five billion Bluetooth devices ship every single year. Your phone, your car, your hearing aids, your medical devices. The technology has become invisible, and that was always the goal. The best technology is the kind you never notice.</p>
                    </div>
                    <div class="docu-text-overlay" style="top: 6%; right: 4%; bottom: auto; left: auto; width: auto; transform: none; animation-delay: 1.2s; text-align: right;">
                        <p><a href="https://www.youtube.com/watch?v=IAHM4SoT3eY" target="_blank">&#127909; Watch Real Interview &rarr;</a></p>
                    </div>
                `
            },
            // ─── 15: NARRATOR — the connection ───
            {
                duration: 10000,
                sound: 'whoosh',
                voice: { text: 'Three technologies. Three engineers. All connected to this quiet corner of the Netherlands. The phased arrays that listen to the cosmos, the digital telescope that sees without moving, and the protocol that connects five billion devices. Sometimes the most profound innovations emerge from the most unexpected places.', speaker: 'Documentary' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdocumentary.svg'); animation-duration: 14s;"></div>
                    <div class="docu-text-overlay">
                        <p>Three technologies. Three engineers. All connected to this quiet corner of the Netherlands.</p>
                        <p>The phased arrays that listen to the cosmos, the digital telescope that sees without moving, and the protocol that connects five billion devices.</p>
                    </div>
                `
            },
            // ─── 16: OUTRO ───
            {
                duration: 8000,
                sound: 'chime',
                voice: { text: 'The Drenthe Legacy. Sometimes genius lives in the Dutch countryside.', speaker: 'Documentary' },
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdocumentary.svg'); animation-direction: reverse;"></div>
                    <div class="docu-title-card">
                        <h1>THE DRENTHE LEGACY</h1>
                        <span class="docu-accent"></span>
                        <h2>Sometimes genius lives in the Dutch countryside</h2>
                    </div>
                `
            }
        ];

        let currentStep = 0;

        const showStep = () => {
            if (currentStep >= sequence.length) {
                // Documentary finished
                setTimeout(() => {
                    self._cleanupDocumentary();
                    game.setFlag('tv_documentary_watched', true);
                    game.setFlag('documentary_completed_once', true);

                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Incredible documentary. Those engineers are remarkable.' },
                        { speaker: 'Ryan', text: 'Now I really need to check my radio equipment.' }
                    ]);

                    game.sceneTimeout(() => {
                        game.loadScene('livingroom');
                    }, 3000);
                }, 1000);
                return;
            }

            const step = sequence[currentStep];

            // Play sound FX
            try {
                switch (step.sound) {
                    case 'whoosh':  self._playWhoosh(); break;
                    case 'impact':  self._playImpact(); break;
                    case 'tick':    self._playTick(); break;
                    case 'riser':   self._playRiser(); break;
                    case 'chime':   self._playChime(); break;
                }
            } catch (e) { /* audio not critical */ }

            // Speak voice-over / interview dialogue via TTS
            // speechDone resolves when TTS finishes (or immediately if no TTS)
            let speechDone = Promise.resolve();
            if (step.voice) {
                speechDone = new Promise(resolve => {
                    setTimeout(() => {
                        self._speak(step.voice.text, step.voice.speaker || 'Documentary')
                            .then(resolve)
                            .catch(resolve);
                    }, 600);  // slight delay so sound FX lands first
                });
            }

            // Calculate minimum reading time from word count (~160 WPM comfortable reading)
            // This guarantees text stays on screen long enough even if TTS isn't working
            const voiceText = step.voice ? step.voice.text : '';
            const wordCount = voiceText.split(/\s+/).filter(w => w).length;
            const minReadMs = Math.max(4000, wordCount * 375);  // ~160 WPM, floor 4s
            const minReadTimer = new Promise(resolve => setTimeout(resolve, minReadMs));

            // Build screen
            const screen = document.createElement('div');
            screen.className = 'docu-screen';
            screen.innerHTML = step.content;

            // Add cinematic overlays
            screen.innerHTML += `
                <div class="docu-grain"></div>
                <div class="docu-scanlines"></div>
                <div class="docu-vignette"></div>
                <div class="docu-letterbox-top"></div>
                <div class="docu-letterbox-bottom"></div>
            `;

            // Add brand watermark
            const brand = document.createElement('div');
            brand.className = 'docu-brand';
            brand.textContent = 'NPO DOC';
            screen.appendChild(brand);

            // Add step counter
            const counter = document.createElement('div');
            counter.className = 'docu-step-counter';
            counter.textContent = `${currentStep + 1} / ${sequence.length}`;
            screen.appendChild(counter);

            // Timeline bar
            const timeline = document.createElement('div');
            timeline.className = 'docu-timeline';
            const fill = document.createElement('div');
            fill.className = 'docu-timeline-fill';
            fill.style.width = `${((currentStep + 1) / sequence.length) * 100}%`;
            timeline.appendChild(fill);
            screen.appendChild(timeline);

            // Continue button
            const continueBtn = document.createElement('div');
            continueBtn.className = 'docu-continue';
            continueBtn.textContent = currentStep < sequence.length - 1 ? 'CONTINUE ▸' : 'FINISH ▸';
            continueBtn.onclick = () => {
                self._stopSpeech();
                screen.style.opacity = '0';
                setTimeout(() => {
                    screen.remove();
                    currentStep++;
                    showStep();
                }, 600);
            };
            screen.appendChild(continueBtn);

            overlay.appendChild(screen);

            // Trigger entrance animations
            setTimeout(() => {
                screen.classList.add('active');

                // Animate character if present
                if (step.character) {
                    const character = screen.querySelector('.docu-character');
                    if (character) {
                        setTimeout(() => character.classList.add('active'), 200);
                    }
                }
            }, 50);

            // Auto-advance: wait for BOTH speech AND minimum reading time, then pause
            Promise.all([speechDone, minReadTimer]).then(() => {
                const pauseMs = (window.game && window.game.settings)
                    ? (window.game.settings.docuPauseDuration ?? 1500)
                    : 1500;
                setTimeout(() => {
                    if (screen.parentElement) {
                        continueBtn.click();
                    }
                }, pauseMs);
            });
        };

        showStep();
    },

    /* ═══════════════════════════════════════════════════════
     *  SCENE LIFECYCLE
     * ═══════════════════════════════════════════════════════ */
    onEnter(game) {
        if (game.player) game.player.hide();

        setTimeout(() => {
            TvdocumentaryScene.showDocumentaryOverlay(game);
        }, 500);
    },

    onExit(game) {
        TvdocumentaryScene._cleanupDocumentary();
        if (game.player) game.player.show();
    }
};

// Register the scene
if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(TvdocumentaryScene);
}
