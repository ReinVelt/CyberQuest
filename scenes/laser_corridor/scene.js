/**
 * Scene: Laser Corridor — Security Gauntlet
 * ═══════════════════════════════════════════════════════════
 * Underground corridor beneath the Steckerdoser Heide facility.
 * Three layers of automated security must be defeated using
 * hacking tools collected throughout the game.
 *
 * Phases:
 *   1. Laser Grid Analysis (Flipper Zero IR — puzzle: 38 kHz)
 *   2. Motion Sensor Bypass (HackRF ultrasonic jam — puzzle: 40 kHz)
 *   3. Biometric Override (Eva's code — puzzle: 2847)
 *   4. Entry — transition to facility_server
 * ═══════════════════════════════════════════════════════════
 */

const LaserCorridorScene = {
    id: 'laser_corridor',
    name: 'Basement Level B — Security Corridor',

    background: 'assets/images/scenes/laser_corridor.svg',

    description: 'A concrete corridor deep beneath the facility. Red laser beams criss-cross the passage. Motion sensor pods pulse on the ceiling. A heavy steel door blocks the server room.',

    playerStart: { x: 8, y: 88 },

    // 🎬 Movie Mode: step through each obstacle phase in order, then enter server room
    // The runner retries hotspots that change flags, naturally advancing phases 1→2→3→4.
    accessibilityPath: [
        'laser_grid',
        'flipper_zero_scan',
        'motion_sensors',
        'hackrf_jam',
        'biometric_panel',
        'server_door',
    ],

    idleThoughts: [
        'Laser grid. Motion sensors. Biometric lock. Three layers.',
        'Classic defence-in-depth. But every system has a weakness.',
        'Flipper Zero handles IR. HackRF handles RF. Brain handles the rest.',
        'Eva\'s code. 2847. Don\'t forget it.',
        'Those sparks don\'t look safe.',
        'Steam from the pipes. Like a movie set down here.',
        'Volkov spent serious money on this corridor.',
        'Standard IR modulation. Should be 38 kHz.'
    ],

    /* ═══════════════════════════════════════════════════════════
     *  AUDIO ENGINE — Web Audio API synthesised SFX
     *  Bunker ambience, laser hum, sparks, pipe drips, phase SFX
     * ═══════════════════════════════════════════════════════════ */
    _audioCtx: null,
    _audioNodes: [],
    _audioIntervals: [],
    _masterGain: null,
    _laserGain: null,
    _sensorGain: null,
    _ambienceGain: null,

    _getAudioCtx() {
        if (!this._audioCtx || this._audioCtx.state === 'closed') {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            this._audioCtx = new AC();
        }
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },

    /** Start all ambient audio layers */
    _initAudio() {
        try {
            const ctx = this._getAudioCtx();
            if (!ctx) return;
            const now = ctx.currentTime;

            // Master gain — fade in over 2s
            const master = ctx.createGain();
            master.gain.setValueAtTime(0, now);
            master.gain.linearRampToValueAtTime(1, now + 2);
            master.connect(ctx.destination);
            this._masterGain = master;
            this._audioNodes.push(master);

            // ── TENSION DRONE (sub-bass bunker atmosphere) ──
            const droneOsc = ctx.createOscillator();
            droneOsc.type = 'sawtooth';
            droneOsc.frequency.value = 36;
            const droneFilter = ctx.createBiquadFilter();
            droneFilter.type = 'lowpass';
            droneFilter.frequency.value = 80;
            droneFilter.Q.value = 3;
            const droneGain = ctx.createGain();
            droneGain.gain.value = 0.04;
            droneOsc.connect(droneFilter).connect(droneGain).connect(master);
            droneOsc.start();
            this._audioNodes.push(droneOsc, droneFilter, droneGain);
            this._ambienceGain = droneGain;

            // Drone slow pitch wobble
            const droneLfo = ctx.createOscillator();
            droneLfo.type = 'sine';
            droneLfo.frequency.value = 0.15;
            const droneLfoG = ctx.createGain();
            droneLfoG.gain.value = 2;
            droneLfo.connect(droneLfoG).connect(droneOsc.frequency);
            droneLfo.start();
            this._audioNodes.push(droneLfo, droneLfoG);

            // ── EMERGENCY LIGHT HUM (50 Hz mains buzz) ──
            const mainsOsc = ctx.createOscillator();
            mainsOsc.type = 'square';
            mainsOsc.frequency.value = 50;
            const mainsFilter = ctx.createBiquadFilter();
            mainsFilter.type = 'bandpass';
            mainsFilter.frequency.value = 100;
            mainsFilter.Q.value = 5;
            const mainsGain = ctx.createGain();
            mainsGain.gain.value = 0.008;
            mainsOsc.connect(mainsFilter).connect(mainsGain).connect(master);
            mainsOsc.start();
            this._audioNodes.push(mainsOsc, mainsFilter, mainsGain);

            // ── LASER HUM (characteristic IR emitter buzz) ──
            const laserGain = ctx.createGain();
            laserGain.gain.value = 0.035;
            this._laserGain = laserGain;

            [120, 180, 240].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = i === 0 ? 'sawtooth' : 'square';
                osc.frequency.value = freq;
                osc.detune.value = Math.random() * 6 - 3;
                const g = ctx.createGain();
                g.gain.value = 0.015 - i * 0.003;
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = freq;
                filter.Q.value = 8;
                osc.connect(filter).connect(g).connect(laserGain);
                osc.start();
                this._audioNodes.push(osc, g, filter);
            });

            // Laser pulsing modulation
            const laserLfo = ctx.createOscillator();
            laserLfo.type = 'sine';
            laserLfo.frequency.value = 0.3;
            const laserLfoG = ctx.createGain();
            laserLfoG.gain.value = 0.015;
            laserLfo.connect(laserLfoG).connect(laserGain.gain);
            laserLfo.start();
            this._audioNodes.push(laserLfo, laserLfoG);

            laserGain.connect(master);
            this._audioNodes.push(laserGain);

            // ── WATER DRIP (random timed plips) ──
            const dripInterval = setInterval(() => {
                try {
                    if (!this._audioCtx || this._audioCtx.state === 'closed') {
                        clearInterval(dripInterval);
                        return;
                    }
                    const t = ctx.currentTime;
                    const freq = 1800 + Math.random() * 600;
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t);
                    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.08);
                    const g = ctx.createGain();
                    g.gain.setValueAtTime(0.03 + Math.random() * 0.02, t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
                    osc.connect(g).connect(master);
                    osc.start(t);
                    osc.stop(t + 0.15);
                } catch (e) { /* ctx might be gone */ }
            }, 2000 + Math.random() * 4000);
            this._audioIntervals.push(dripInterval);

            // ── SPARK CRACKLE (random timed electrical arcs) ──
            const sparkInterval = setInterval(() => {
                try {
                    if (!this._audioCtx || this._audioCtx.state === 'closed') {
                        clearInterval(sparkInterval);
                        return;
                    }
                    const t = ctx.currentTime;
                    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
                    const data = buf.getChannelData(0);
                    for (let s = 0; s < data.length; s++) {
                        data[s] = (Math.random() * 2 - 1) * Math.exp(-s / (ctx.sampleRate * 0.01));
                    }
                    const src = ctx.createBufferSource();
                    src.buffer = buf;
                    const sparkFilter = ctx.createBiquadFilter();
                    sparkFilter.type = 'highpass';
                    sparkFilter.frequency.value = 3000;
                    const sparkGain = ctx.createGain();
                    sparkGain.gain.setValueAtTime(0.08 + Math.random() * 0.06, t);
                    sparkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
                    src.connect(sparkFilter).connect(sparkGain).connect(master);
                    src.start(t);

                    // Double spark sometimes
                    if (Math.random() > 0.6) {
                        const buf2 = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
                        const d2 = buf2.getChannelData(0);
                        for (let s = 0; s < d2.length; s++) {
                            d2[s] = (Math.random() * 2 - 1) * Math.exp(-s / (ctx.sampleRate * 0.008));
                        }
                        const src2 = ctx.createBufferSource();
                        src2.buffer = buf2;
                        const g2 = ctx.createGain();
                        g2.gain.setValueAtTime(0.05, t + 0.08);
                        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
                        src2.connect(sparkFilter).connect(g2).connect(master);
                        src2.start(t + 0.07);
                    }
                } catch (e) { /* ctx might be gone */ }
            }, 3000 + Math.random() * 5000);
            this._audioIntervals.push(sparkInterval);

        } catch (e) {
            console.warn('[LaserCorridor] Audio init failed:', e);
        }
    },

    // ─── ONE-SHOT SFX ─────────────────────────────────────────

    /** Flipper Zero electronic chirp */
    _sfxFlipperBeep() {
        try {
            const ctx = this._getAudioCtx();
            if (!ctx) return;
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.linearRampToValueAtTime(1800, t + 0.08);
            osc.frequency.setValueAtTime(2200, t + 0.12);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.06, t);
            g.gain.setValueAtTime(0.08, t + 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1500;
            filter.Q.value = 2;
            osc.connect(filter).connect(g).connect(this._masterGain || ctx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
        } catch (e) { /* silent */ }
    },

    /** Flipper IR replay (descending confirmation tones) */
    _sfxFlipperReplay() {
        try {
            const ctx = this._getAudioCtx();
            if (!ctx) return;
            const t = ctx.currentTime;
            const dest = this._masterGain || ctx.destination;
            [1600, 1200, 800].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = 'square';
                osc.frequency.value = freq;
                const g = ctx.createGain();
                g.gain.setValueAtTime(0, t + i * 0.15);
                g.gain.linearRampToValueAtTime(0.06, t + i * 0.15 + 0.02);
                g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.12);
                osc.connect(g).connect(dest);
                osc.start(t + i * 0.15);
                osc.stop(t + i * 0.15 + 0.15);
            });
        } catch (e) { /* silent */ }
    },

    /** Laser beam dying — descending whine + pop */
    _sfxLaserDie(delay) {
        try {
            const ctx = this._getAudioCtx();
            if (!ctx) return;
            const t = ctx.currentTime + (delay || 0);
            const dest = this._masterGain || ctx.destination;
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.6);
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, t);
            filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.07, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
            osc.connect(filter).connect(g).connect(dest);
            osc.start(t);
            osc.stop(t + 0.75);
            // Pop at the end
            const pop = ctx.createOscillator();
            pop.type = 'sine';
            pop.frequency.value = 60;
            const popG = ctx.createGain();
            popG.gain.setValueAtTime(0.1, t + 0.5);
            popG.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            pop.connect(popG).connect(dest);
            pop.start(t + 0.5);
            pop.stop(t + 0.65);
        } catch (e) { /* silent */ }
    },

    /** Sensor activation whir (servo spin-up) */
    _sfxSensorActivate() {
        try {
            const ctx = this._getAudioCtx();
            if (!ctx) return;
            const t = ctx.currentTime;
            const dest = this._masterGain || ctx.destination;
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, t);
            osc.frequency.exponentialRampToValueAtTime(600, t + 1.5);
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 400;
            filter.Q.value = 3;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.04, t + 0.3);
            g.gain.setValueAtTime(0.04, t + 1.2);
            g.gain.exponentialRampToValueAtTime(0.001, t + 2);
            osc.connect(filter).connect(g).connect(dest);
            osc.start(t);
            osc.stop(t + 2.1);
        } catch (e) { /* silent */ }
    },

    /** HackRF ultrasonic jam (high-pitched interference whine) */
    _sfxHackRFJam() {
        try {
            const ctx = this._getAudioCtx();
            if (!ctx) return;
            const t = ctx.currentTime;
            const dest = this._masterGain || ctx.destination;
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(8000, t);
            osc.frequency.linearRampToValueAtTime(12000, t + 0.5);
            osc.frequency.setValueAtTime(10000, t + 1);
            osc.frequency.linearRampToValueAtTime(14000, t + 2);
            osc.frequency.exponentialRampToValueAtTime(6000, t + 3);
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 10000;
            filter.Q.value = 2;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.03, t + 0.3);
            g.gain.setValueAtTime(0.04, t + 1);
            g.gain.linearRampToValueAtTime(0.02, t + 2.5);
            g.gain.exponentialRampToValueAtTime(0.001, t + 3.5);
            osc.connect(filter).connect(g).connect(dest);
            osc.start(t);
            osc.stop(t + 3.6);
            // Warbling modulation
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 6;
            const lfoG = ctx.createGain();
            lfoG.gain.value = 800;
            lfo.connect(lfoG).connect(osc.frequency);
            lfo.start(t);
            lfo.stop(t + 3.6);
        } catch (e) { /* silent */ }
    },

    /** Sensor jam/die sound (stuttering off) */
    _sfxSensorDie(delay) {
        try {
            const ctx = this._getAudioCtx();
            if (!ctx) return;
            const t = ctx.currentTime + (delay || 0);
            const dest = this._masterGain || ctx.destination;
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(500, t);
            osc.frequency.exponentialRampToValueAtTime(80, t + 0.8);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.05, t);
            g.gain.setValueAtTime(0.01, t + 0.1);
            g.gain.setValueAtTime(0.06, t + 0.15);
            g.gain.setValueAtTime(0.01, t + 0.25);
            g.gain.setValueAtTime(0.04, t + 0.35);
            g.gain.setValueAtTime(0.01, t + 0.5);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
            osc.connect(g).connect(dest);
            osc.start(t);
            osc.stop(t + 1);
        } catch (e) { /* silent */ }
    },

    /** Heavy mechanical door clunk */
    _sfxDoorClunk() {
        try {
            const ctx = this._getAudioCtx();
            if (!ctx) return;
            const t = ctx.currentTime;
            const dest = this._masterGain || ctx.destination;
            // Deep impact thud
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(60, t);
            osc.frequency.exponentialRampToValueAtTime(25, t + 0.4);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.3, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.connect(g).connect(dest);
            osc.start(t);
            osc.stop(t + 0.55);
            // Metallic ring
            const ring = ctx.createOscillator();
            ring.type = 'sine';
            ring.frequency.value = 440;
            const ringG = ctx.createGain();
            ringG.gain.setValueAtTime(0.04, t + 0.02);
            ringG.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
            const ringF = ctx.createBiquadFilter();
            ringF.type = 'bandpass';
            ringF.frequency.value = 500;
            ringF.Q.value = 10;
            ring.connect(ringF).connect(ringG).connect(dest);
            ring.start(t);
            ring.stop(t + 0.85);
            // Noise burst (mechanical clatter)
            const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let s = 0; s < data.length; s++) {
                data[s] = (Math.random() * 2 - 1) * Math.exp(-s / (ctx.sampleRate * 0.02));
            }
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const nG = ctx.createGain();
            nG.gain.setValueAtTime(0.08, t);
            nG.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            const nF = ctx.createBiquadFilter();
            nF.type = 'lowpass';
            nF.frequency.value = 1200;
            src.connect(nF).connect(nG).connect(dest);
            src.start(t);
        } catch (e) { /* silent */ }
    },

    /** Keypad beep */
    _sfxKeypadBeep() {
        try {
            const ctx = this._getAudioCtx();
            if (!ctx) return;
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 1047;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.06, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.connect(g).connect(this._masterGain || ctx.destination);
            osc.start(t);
            osc.stop(t + 0.12);
        } catch (e) { /* silent */ }
    },

    /** Biometric success chime (ascending arpeggio) */
    _sfxBiometricSuccess() {
        try {
            const ctx = this._getAudioCtx();
            if (!ctx) return;
            const t = ctx.currentTime;
            const dest = this._masterGain || ctx.destination;
            [523, 659, 784, 1047].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq;
                const g = ctx.createGain();
                g.gain.setValueAtTime(0, t + i * 0.12);
                g.gain.linearRampToValueAtTime(0.06, t + i * 0.12 + 0.02);
                g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.25);
                osc.connect(g).connect(dest);
                osc.start(t + i * 0.12);
                osc.stop(t + i * 0.12 + 0.3);
            });
        } catch (e) { /* silent */ }
    },

    /** Fade out laser hum (called during _disableLasers) */
    _fadeOutLaserHum() {
        try {
            if (this._laserGain && this._audioCtx) {
                const t = this._audioCtx.currentTime;
                this._laserGain.gain.setValueAtTime(this._laserGain.gain.value, t);
                this._laserGain.gain.linearRampToValueAtTime(0, t + 2.5);
            }
        } catch (e) { /* silent */ }
    },

    /** Stop all audio and clean up */
    _stopAudio() {
        this._audioIntervals.forEach(id => clearInterval(id));
        this._audioIntervals = [];
        this._audioNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) { /* already stopped */ }
        });
        this._audioNodes = [];
        if (this._audioCtx) {
            try { this._audioCtx.close(); } catch (e) { /* ok */ }
            this._audioCtx = null;
        }
        this._masterGain = null;
        this._laserGain = null;
        this._sensorGain = null;
        this._ambienceGain = null;
    },

    // ── Scene state ──────────────────────────────────────────
    state: {
        phase: 1,
        // Phase 1: Laser Grid
        laserAnalysed: false,
        laserFrequencySet: false,
        lasersDisabled: false,
        // Phase 2: Motion Sensors
        sensorsAnalysed: false,
        jamFrequencySet: false,
        sensorsDisabled: false,
        // Phase 3: Biometric
        panelActivated: false,
        codeEntered: false,
        doorUnlocked: false
    },

    // ── Hotspots ─────────────────────────────────────────────
    hotspots: [

        /* ═══ LASER GRID — Phase 1 ═══════════════════════════ */
        {
            id: 'laser_grid',
            name: 'Laser Grid',
            x: 25,
            y: 30,
            width: 50,
            height: 35,
            cursor: 'look',
            action: function(game) {
                const s = LaserCorridorScene.state;
                if (s.lasersDisabled) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Lasers are down. Emitters dark. Safe to pass.' }
                    ]);
                } else if (s.laserAnalysed) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'IR laser grid. Modulated at 38 kHz.' },
                        { speaker: 'Ryan', text: 'Flipper Zero can replay the shutdown command.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*Red beams slice through the corridor — sweeping, pulsing, lethal*' },
                        { speaker: 'Ryan', text: 'Laser tripwire grid. Industrial security.' },
                        { speaker: 'Ryan', text: 'IR emitters on both walls. Break a beam and alarms go off.' },
                        { speaker: 'Ryan', text: 'Five beams. Some sweeping, one vertical slicer.' },
                        { speaker: 'Ryan', text: 'No way through physically. Need to shut them down.' },
                        { speaker: 'Ryan', text: 'If I can find the control frequency, the Flipper Zero can replay a shutdown.' }
                    ]);
                }
            }
        },

        /* ── FLIPPER ZERO SCAN — Analyse + puzzle ─────────── */
        {
            id: 'flipper_zero_scan',
            name: 'Flipper Zero',
            x: 3,
            y: 62,
            width: 10,
            height: 16,
            cursor: 'pointer',
            cssClass: 'hotspot-tool',
            icon: 'assets/images/icons/flipper-zero.svg',
            label: 'Flipper Zero',
            action: function(game) {
                const s = LaserCorridorScene.state;

                // Not the right phase — give context
                if (s.lasersDisabled) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Flipper did its job. Lasers are history.' }
                    ]);
                    return;
                }
                if (s.phase !== 1) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Don\'t need the Flipper right now. Different problem.' }
                    ]);
                    return;
                }

                if (!s.laserAnalysed) {
                    // First interaction: analyse
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*Ryan pulls the Flipper Zero from his jacket*' },
                        { speaker: 'Ryan', text: 'Flipper Zero. Swiss army knife for hackers.' },
                        { speaker: 'Ryan', text: 'IR transceiver, RFID, sub-GHz radio, GPIO — all in one.' },
                        { speaker: 'Narrator', text: '*Points the IR receiver at the nearest emitter*' },
                        { speaker: 'Ryan', text: 'The emitters use modulated infrared. Like a TV remote on steroids.' },
                        { speaker: 'Ryan', text: 'Standard consumer IR operates at 38 kHz modulation.' },
                        { speaker: 'Ryan', text: 'Military would use non-standard frequencies. But Volkov cut corners.' },
                        { speaker: 'Ryan', text: 'Let me capture the signal and replay the shutdown command.' },
                        { speaker: 'Ryan', text: 'First: set the IR demodulation frequency on the Flipper.' }
                    ], () => {
                        s.laserAnalysed = true;
                        game.setFlag('laser_grid_analysed', true);
                        LaserCorridorScene._sfxFlipperBeep();
                        game.showNotification('Flipper Zero IR receiver active');
                        // Now show the puzzle
                        setTimeout(() => {
                            LaserCorridorScene._showLaserPuzzle(game);
                        }, 1000);
                    });
                } else if (!s.laserFrequencySet) {
                    // Already analysed, show puzzle again
                    LaserCorridorScene._showLaserPuzzle(game);
                } else {
                    // Frequency set, execute shutdown
                    LaserCorridorScene._disableLasers(game);
                }
            }
        },

        /* ═══ MOTION SENSORS — Phase 2 ═══════════════════════ */
        {
            id: 'motion_sensors',
            name: 'Motion Sensors',
            x: 30,
            y: 18,
            width: 40,
            height: 12,
            cursor: 'look',
            action: function(game) {
                const s = LaserCorridorScene.state;
                if (s.phase < 2) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Sensor pods on the ceiling. Currently dormant.' },
                        { speaker: 'Ryan', text: 'Probably a backup system. Lasers first.' }
                    ]);
                } else if (s.sensorsDisabled) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Sensors are blind. HackRF jamming signal is doing its work.' }
                    ]);
                } else if (s.sensorsAnalysed) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Ultrasonic motion sensors. 40 kHz Doppler.' },
                        { speaker: 'Ryan', text: 'HackRF can flood that frequency with noise.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*The sensor pods\' LEDs shift from green to angry red*' },
                        { speaker: 'Narrator', text: '*Faint ultrasonic pulsing — barely audible. Like tinnitus.*' },
                        { speaker: 'Ryan', text: 'Backup system activated. Ultrasonic motion sensors.' },
                        { speaker: 'Ryan', text: 'They send out 40 kHz sound pulses. Inaudible to most humans.' },
                        { speaker: 'Ryan', text: 'When the returning echo shifts in frequency — Doppler effect — they know something moved.' },
                        { speaker: 'Ryan', text: 'Three pods. Overlapping coverage. No blind spots.' },
                        { speaker: 'Ryan', text: 'But if I flood 40 kHz with noise, the sensors can\'t distinguish echoes from garbage.' },
                        { speaker: 'Ryan', text: 'HackRF One. Time to jam.' }
                    ], () => {
                        s.sensorsAnalysed = true;
                        game.setFlag('motion_sensors_analysed', true);
                        game.showNotification('Sensor frequency identified — use HackRF');
                    });
                }
            }
        },

        /* ── HACKRF JAM — Jam sensors + puzzle ────────────── */
        {
            id: 'hackrf_jam',
            name: 'HackRF One',
            x: 14,
            y: 62,
            width: 10,
            height: 16,
            cursor: 'pointer',
            cssClass: 'hotspot-tool',
            icon: 'assets/images/icons/hackrf.svg',
            label: 'HackRF One',
            action: function(game) {
                const s = LaserCorridorScene.state;

                // Not the right phase — give context
                if (s.sensorsDisabled) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'HackRF jamming at 40 kHz. Sensors are deaf.' }
                    ]);
                    return;
                }
                if (s.phase < 2) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'HackRF One. Powerful, but I need to deal with the lasers first.' }
                    ]);
                    return;
                }
                if (s.phase > 2) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'HackRF\'s doing its job. Sensors are down.' }
                    ]);
                    return;
                }

                if (!s.sensorsAnalysed) {
                    // In accessibility mode, skip straight to jamming
                    if (game.accessibilityMode) {
                        s.sensorsAnalysed = true;
                        game.setFlag('motion_sensors_analysed', true);
                        LaserCorridorScene._showSensorPuzzle(game);
                        return;
                    }
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'HackRF One. But I need to know what I\'m jamming first.' },
                        { speaker: 'Ryan', text: 'Check the sensors — identify the frequency.' }
                    ]);
                } else if (!s.jamFrequencySet) {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*Ryan connects the antenna to the HackRF*' },
                        { speaker: 'Ryan', text: 'HackRF One. 1 MHz to 6 GHz. Transmit and receive.' },
                        { speaker: 'Ryan', text: 'Those sensors use ultrasonic — technically sound, not radio.' },
                        { speaker: 'Ryan', text: 'But the HackRF drives a piezo transducer through the GPIO pins.' },
                        { speaker: 'Ryan', text: 'Improvised ultrasonic jammer. Set the frequency and blast noise.' }
                    ], () => {
                        LaserCorridorScene._showSensorPuzzle(game);
                    });
                } else {
                    LaserCorridorScene._disableSensors(game);
                }
            }
        },

        /* ═══ BIOMETRIC PANEL — Phase 3 ═══════════════════════ */
        {
            id: 'biometric_panel',
            name: 'Biometric Panel',
            // Near far-right wall, by the door
            x: 65,
            y: 35,
            width: 8,
            height: 12,
            cursor: 'pointer',
            action: function(game) {
                const s = LaserCorridorScene.state;

                if (s.phase === 1) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Biometric panel by the door. Can\'t reach it — lasers in the way.' },
                        { speaker: 'Ryan', text: 'One step at a time. Lasers first.' }
                    ]);
                    return;
                }
                if (s.phase === 2) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Biometric panel. But motion sensors would spot me before I get there.' },
                        { speaker: 'Ryan', text: 'Deal with the sensors first.' }
                    ]);
                    return;
                }

                if (s.doorUnlocked) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Panel shows green. Door is unlocked.' }
                    ]);
                } else if (!s.panelActivated) {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*Ryan approaches the biometric panel beside the steel door*' },
                        { speaker: 'Ryan', text: 'Fingerprint scanner with keypad override.' },
                        { speaker: 'Ryan', text: 'The scanner wants an enrolled print. I\'m not in the system.' },
                        { speaker: 'Ryan', text: 'But Eva said there\'s an override code. Emergency maintenance access.' },
                        { speaker: 'Ryan', text: 'She sent it via Meshtastic earlier. Let me check...' },
                        { speaker: 'Narrator', text: '*Glances at the Meshtastic log on his phone*' },
                        { speaker: 'Eva (Mesh)', text: 'Override code: 2847' },
                        { speaker: 'Ryan', text: '2847. Right. Let\'s try the keypad.' }
                    ], () => {
                        s.panelActivated = true;
                        game.setFlag('biometric_panel_activated', true);
                        LaserCorridorScene._showBiometricPuzzle(game);
                    });
                } else if (!s.codeEntered) {
                    LaserCorridorScene._showBiometricPuzzle(game);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Code accepted. The door is ready.' }
                    ]);
                }
            }
        },

        /* ═══ SERVER DOOR — Final exit (Phase 4) ═════════════ */
        {
            id: 'server_door',
            name: 'Server Room Door',
            x: 38,
            y: 28,
            width: 24,
            height: 38,
            cursor: 'pointer',
            action: function(game) {
                const s = LaserCorridorScene.state;

                if (s.doorUnlocked && s.phase === 4) {
                    // Enter the server room
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*Ryan grips the massive handle and pulls*' },
                        { speaker: 'Narrator', text: '*The steel door swings open with a deep mechanical groan*' },
                        { speaker: 'Narrator', text: '*Cold air rushes out. The hum of server fans. Blinking LEDs in the darkness.*' },
                        { speaker: 'Ryan', text: 'The server room. This is it.' },
                        { speaker: 'Ryan', text: 'Weber\'s evidence. Volkov\'s secrets. Everything is in there.' },
                        { speaker: 'Ryan', text: 'For Klaus. For Eva. For everyone Volkov crushed.' },
                        { speaker: 'Narrator', text: '*Steps through the threshold*' }
                    ], () => {
                        game.setFlag('laser_corridor_complete', true);
                        game.loadScene('facility_server');
                    });
                } else if (s.doorUnlocked) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Door is unlocked. Ready to enter the server room.' }
                    ]);
                } else if (s.phase >= 3) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: '"SERVER RAUM". Heavy steel. Reinforced.' },
                        { speaker: 'Ryan', text: 'Need to crack the biometric panel first.' }
                    ]);
                } else if (s.phase === 2) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Can\'t approach. Motion sensors would trigger.' },
                        { speaker: 'Ryan', text: 'Deal with the sensors first.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Heavy door at the end. "SERVER RAUM" stencilled on steel.' },
                        { speaker: 'Ryan', text: 'Not going anywhere near it with those lasers active.' }
                    ]);
                }
            }
        },

        /* ═══ ATMOSPHERIC HOTSPOTS ════════════════════════════ */

        {
            id: 'security_camera_broken',
            name: 'Broken Camera',
            x: 48,
            y: 22,
            width: 6,
            height: 6,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Security camera. Disabled. Wire dangling.' },
                    { speaker: 'Ryan', text: 'Eva\'s work? Or someone else doesn\'t want eyes down here.' },
                    { speaker: 'Ryan', text: 'Either way — one less thing to worry about.' }
                ]);
            }
        },

        {
            id: 'pipe_leak',
            name: 'Leaking Pipe',
            x: 12,
            y: 14,
            width: 10,
            height: 8,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*Water drips from a corroded pipe joint. Steam wisps drift across the corridor.*' },
                    { speaker: 'Ryan', text: 'Old infrastructure. This facility has layers of history.' },
                    { speaker: 'Ryan', text: 'Cold War bunker foundations, NATO upgrades, now Volkov\'s playground.' },
                    { speaker: 'Ryan', text: 'The pipes are sweating. Probably coolant for the servers below.' }
                ]);
            }
        },

        {
            id: 'cable_runs',
            name: 'Cable Bundles',
            x: 2,
            y: 2,
            width: 25,
            height: 6,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Fibre optic and Cat6A bundles. Thick ones.' },
                    { speaker: 'Ryan', text: 'Running from the surface down to the server room.' },
                    { speaker: 'Ryan', text: 'Multiple redundant paths. This place was built to stay online.' },
                    { speaker: 'Ryan', text: 'Weber knew what he found here. That\'s why they killed him.' }
                ]);
            }
        },

        {
            id: 'sparking_conduit',
            name: 'Sparking Conduit',
            x: 82,
            y: 18,
            width: 8,
            height: 8,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*CRACK — a spark arcs from the damaged junction box*' },
                    { speaker: 'Ryan', text: 'Damaged conduit. Exposed wiring.' },
                    { speaker: 'Ryan', text: 'Wouldn\'t want to touch that. 230 volts, European standard.' },
                    { speaker: 'Ryan', text: 'Adds to the ambience though. Very Hollywood.' }
                ]);
            }
        },

        {
            id: 'emergency_exit',
            name: '← Back to Stairs',
            x: 2,
            y: 85,
            width: 10,
            height: 12,
            cursor: 'exit',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                const s = LaserCorridorScene.state;
                if (s.phase >= 3) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Back up the stairs? Not a chance.' },
                        { speaker: 'Ryan', text: 'I\'m this close. The server room is RIGHT THERE.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'No. I didn\'t come this far to turn back.' },
                        { speaker: 'Ryan', text: 'Three layers of security. I have three hacker tools.' },
                        { speaker: 'Ryan', text: 'This is what I do.' }
                    ]);
                }
            }
        }
    ],

    // ═══════════════════════════════════════════════════════════
    // SCENE LIFECYCLE
    // ═══════════════════════════════════════════════════════════

    onEnter: (game) => {
        const s = LaserCorridorScene.state;

        // Reset state
        s.phase = 1;
        s.laserAnalysed = false;
        s.laserFrequencySet = false;
        s.lasersDisabled = false;
        s.sensorsAnalysed = false;
        s.jamFrequencySet = false;
        s.sensorsDisabled = false;
        s.panelActivated = false;
        s.codeEntered = false;
        s.doorUnlocked = false;

        game.setFlag('laser_corridor_entered', true);
        game.showNotification('Basement Level B — Security Corridor');

        // Create dynamic overlay elements (lasers, sensors, door lock, biometric)
        LaserCorridorScene._createOverlays();

        // Start ambient audio (bunker drone, laser hum, drips, sparks)
        LaserCorridorScene._initAudio();

        setTimeout(() => {
            game.startDialogue([
                { speaker: 'Narrator', text: '*Concrete stairs end. A heavy fire door opens into a long corridor.*' },
                { speaker: 'Narrator', text: '*Red laser beams sweep back and forth. Emergency lights pulse crimson.*' },
                { speaker: 'Narrator', text: '*Steam drifts from leaking pipes. Sparks arc from a damaged conduit.*' },
                { speaker: 'Ryan', text: '...Whoa.' },
                { speaker: 'Ryan', text: 'Laser tripwire grid. Motion sensors on the ceiling. Biometric lock on the door.' },
                { speaker: 'Ryan', text: 'Three layers of security. Classic defence-in-depth.' },
                { speaker: 'Ryan', text: 'Good thing I brought three hacking tools.' },
                { speaker: 'Narrator', text: '*Pats the Flipper Zero in his jacket pocket*' },
                { speaker: 'Ryan', text: 'Flipper for the IR lasers. HackRF for the sensors. Eva\'s code for the door.' },
                { speaker: 'Ryan', text: 'One layer at a time. Start with the lasers.' }
            ]);
        }, 1200);

        // Quest
        if (!game.questManager.hasQuest('breach_corridor')) {
            game.addQuest({
                id: 'breach_corridor',
                name: 'Breach the Security Corridor',
                description: 'Three layers of automated security protect the server room. Defeat the laser grid, motion sensors, and biometric lock using your hacking tools.',
                hint: 'Use the Flipper Zero to analyse the laser grid\'s IR frequency.'
            });
        }

        // Set initial tool overlay state (Flipper active, HackRF dimmed)
        setTimeout(() => LaserCorridorScene._updateToolOverlays(), 100);
    },

    onExit: () => {
        // Remove dynamic overlays
        const overlay = document.getElementById('laser-corridor-overlay');
        if (overlay) overlay.remove();
        // Stop all audio
        LaserCorridorScene._stopAudio();
    },

    /** Update tool overlay visual state based on current phase */
    _updateToolOverlays: () => {
        const s = LaserCorridorScene.state;
        const flipperEl = document.getElementById('hotspot-flipper_zero_scan');
        const hackrfEl  = document.getElementById('hotspot-hackrf_jam');
        if (flipperEl) {
            flipperEl.classList.toggle('tool-disabled', s.phase !== 1);
        }
        if (hackrfEl) {
            hackrfEl.classList.toggle('tool-disabled', s.phase !== 2);
        }
    },

    // ═══════════════════════════════════════════════════════════
    // PUZZLE HELPERS
    // ═══════════════════════════════════════════════════════════

    /** Phase 1 puzzle: IR modulation frequency */
    _showLaserPuzzle: (game) => {
        // Auto-solve in movie/accessibility mode
        if (game.accessibilityMode) {
            if (LaserCorridorScene.state.laserFrequencySet) return; // idempotent
            LaserCorridorScene.state.laserFrequencySet = true;
            game.setFlag('ir_frequency_set', true);
            game.showNotification('IR frequency locked: 38 kHz');
            game.startDialogue([
                { speaker: 'Narrator', text: '*Flipper Zero display: IR DEMOD 38 kHz — SIGNAL CAPTURED*' },
                { speaker: 'Ryan', text: '38 kHz. Standard consumer IR. Flipper captured the emitter handshake.' },
                { speaker: 'Ryan', text: 'Replaying shutdown sequence now.' }
            ], () => LaserCorridorScene._disableLasers(game));
            return;
        }
        if (game.passwordPuzzle) {
            game.passwordPuzzle.show({
                id: 'ir_modulation_freq',
                title: '📡 IR Demodulation Frequency',
                description: 'Set the Flipper Zero\'s IR receiver to the correct demodulation frequency.<br><br>Consumer IR devices (remotes, sensors, security emitters) use a standard modulation frequency to distinguish signal from ambient light.<br><br>What is the standard IR carrier frequency in kHz?',
                correctAnswer: ['38', '38 kHz', '38kHz', '38khz'],
                hint: 'Standard consumer IR modulation: 38 kHz. Used by TV remotes, security sensors, and apparently — Volkov\'s laser grid.',
                placeholder: 'Frequency in kHz...',
                inputType: 'text',
                maxAttempts: 5,
                onSuccess: (g) => {
                    const s = LaserCorridorScene.state;
                    s.laserFrequencySet = true;
                    game.setFlag('ir_frequency_set', true);
                    game.showNotification('IR frequency locked: 38 kHz');
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*Flipper Zero display: IR DEMOD 38 kHz — SIGNAL CAPTURED*' },
                        { speaker: 'Ryan', text: '38 kHz. Standard consumer IR. Volkov cheaped out on security.' },
                        { speaker: 'Ryan', text: 'Flipper captured the emitter handshake. Now replay the shutdown sequence.' },
                        { speaker: 'Ryan', text: 'Use the Flipper again to transmit.' }
                    ]);
                },
                onFailure: (g) => {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Not that frequency. Think consumer electronics.' },
                        { speaker: 'Ryan', text: 'Every TV remote in the world uses this carrier frequency.' },
                        { speaker: 'Ryan', text: 'It\'s the de facto standard. 38...' }
                    ]);
                }
            });
        }
    },

    /** Phase 1 completion: disable lasers with animated beam death */
    _disableLasers: (game) => {
        const s = LaserCorridorScene.state;
        game.startDialogue([
            { speaker: 'Narrator', text: '*Ryan points the Flipper Zero at the nearest emitter*' },
            { speaker: 'Narrator', text: '*FLIPPER ZERO: REPLAYING IR SEQUENCE...*' },
            { speaker: 'Narrator', text: '*The first laser beam flickers — and dies*' },
            { speaker: 'Narrator', text: '*One by one, the red beams wink out*' },
            { speaker: 'Narrator', text: '*The sweeping vertical slicer stutters, fades, goes dark*' },
            { speaker: 'Narrator', text: '*Last beam — the floor tripwire — flickers twice, then nothing*' },
            { speaker: 'Narrator', text: '*Darkness. The corridor\'s red haze fades to emergency lighting only.*' },
            { speaker: 'Ryan', text: 'All five beams down. Flipper Zero — the €200 skeleton key.' },
            { speaker: 'Ryan', text: '38 kilohertz. Same as a TV remote. Million-euro security system.' },
            { speaker: 'Narrator', text: '*A soft whirring starts above — sensor pods activating*' },
            { speaker: 'Ryan', text: '...And there\'s the backup. Motion sensors just woke up.' }
        ], () => {
            s.lasersDisabled = true;
            s.phase = 2;
            game.setFlag('lasers_disabled', true);
            game.showNotification('Lasers disabled — motion sensors activated!');
            LaserCorridorScene._updateToolOverlays();

            // Audio: Flipper replay SFX + fade laser hum + beam death sounds
            LaserCorridorScene._sfxFlipperReplay();
            LaserCorridorScene._fadeOutLaserHum();
            [0, 0.4, 0.8, 1.2, 1.6].forEach(d => LaserCorridorScene._sfxLaserDie(d));

            // Animate lasers dying one by one
            LaserCorridorScene._animateLaserDeath();
            // Activate sensor pods (green dormant → red active) + activation whir
            LaserCorridorScene._sfxSensorActivate();
            LaserCorridorScene._activateSensors();
        });
    },

    /** Phase 2 puzzle: ultrasonic jamming frequency */
    _showSensorPuzzle: (game) => {
        // Auto-solve in movie/accessibility mode
        if (game.accessibilityMode) {
            if (LaserCorridorScene.state.jamFrequencySet) return; // idempotent
            LaserCorridorScene.state.jamFrequencySet = true;
            game.setFlag('jam_frequency_set', true);
            game.showNotification('Jamming frequency set: 40 kHz');
            game.startDialogue([
                { speaker: 'Narrator', text: '*HackRF display: ULTRASONIC JAM 40 kHz — READY*' },
                { speaker: 'Ryan', text: '40 kHz. Sensors flooded. They cannot hear their own echoes.' }
            ], () => LaserCorridorScene._disableSensors(game));
            return;
        }
        if (game.passwordPuzzle) {
            game.passwordPuzzle.show({
                id: 'ultrasonic_jam_freq',
                title: '🔊 Ultrasonic Jamming Frequency',
                description: 'Configure the HackRF\'s piezo transducer to jam the motion sensors.<br><br>The sensors use ultrasonic Doppler: they emit a carrier wave and listen for frequency shifts caused by movement.<br><br>What is the standard frequency for ultrasonic motion sensors in kHz?',
                correctAnswer: ['40', '40 kHz', '40kHz', '40khz'],
                hint: 'Standard ultrasonic sensors operate at 40 kHz. Same frequency as the popular HC-SR04 module used by hobbyists worldwide.',
                placeholder: 'Frequency in kHz...',
                inputType: 'text',
                maxAttempts: 5,
                onSuccess: (g) => {
                    const s = LaserCorridorScene.state;
                    s.jamFrequencySet = true;
                    game.setFlag('jam_frequency_set', true);
                    game.showNotification('Jamming frequency set: 40 kHz');
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*HackRF display: ULTRASONIC JAM 40 kHz — READY*' },
                        { speaker: 'Ryan', text: '40 kHz. Same as every HC-SR04 sensor on Amazon.' },
                        { speaker: 'Ryan', text: 'Flood the air with 40 kHz noise. Sensors can\'t hear their own echoes.' },
                        { speaker: 'Ryan', text: 'Activate the jammer.' }
                    ]);
                },
                onFailure: (g) => {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Not quite. Standard ultrasonic sensors. Think Arduino basics.' },
                        { speaker: 'Ryan', text: 'HC-SR04, SRF05... they all use the same frequency.' },
                        { speaker: 'Ryan', text: 'Forty-something kHz. Very standard.' }
                    ]);
                }
            });
        }
    },

    /** Phase 2 completion: disable sensors with animated jam sequence */
    _disableSensors: (game) => {
        const s = LaserCorridorScene.state;
        game.startDialogue([
            { speaker: 'Narrator', text: '*Ryan activates the HackRF jammer*' },
            { speaker: 'Narrator', text: '*HackRF: TRANSMITTING — 40 kHz BROADBAND NOISE*' },
            { speaker: 'Narrator', text: '*The transducer emits a high-pitched whine*' },
            { speaker: 'Ryan', text: 'Can barely hear it. Right at the edge of human range.' },
            { speaker: 'Narrator', text: '*Sensor pod 1: LED shifts from red to confused amber flickering*' },
            { speaker: 'Narrator', text: '*Sensor pod 2: LED strobes wildly, then goes dark*' },
            { speaker: 'Narrator', text: '*Sensor pod 3: a final angry red pulse, then nothing*' },
            { speaker: 'Ryan', text: 'Sensors are blind. The HackRF is flooding their echo channel.' },
            { speaker: 'Ryan', text: 'They can\'t distinguish movement from noise. Effectively deaf.' },
            { speaker: 'Ryan', text: 'Two layers down. One to go.' },
            { speaker: 'Narrator', text: '*Ryan moves down the corridor. Footsteps echo on concrete.*' },
            { speaker: 'Ryan', text: 'The biometric panel. Eva\'s override code.' },
            { speaker: 'Ryan', text: 'Last barrier between me and Volkov\'s servers.' }
        ], () => {
            s.sensorsDisabled = true;
            s.phase = 3;
            game.setFlag('sensors_jammed', true);
            game.showNotification('Sensors jammed — approach the biometric panel');
            LaserCorridorScene._updateToolOverlays();

            // Audio: HackRF jam whine + individual sensor death sounds
            LaserCorridorScene._sfxHackRFJam();
            [0, 0.5, 1.0].forEach(d => LaserCorridorScene._sfxSensorDie(d));

            // Animate sensors jamming and dying
            LaserCorridorScene._animateSensorDeath();
        });
    },

    /** Phase 3 puzzle: biometric override code */
    _showBiometricPuzzle: (game) => {
        // Auto-solve in movie/accessibility mode
        if (game.accessibilityMode) {
            if (LaserCorridorScene.state.codeEntered) return; // idempotent
            LaserCorridorScene.state.codeEntered = true;
            game.setFlag('biometric_code_entered', true);
            game.showNotification('Override code accepted: 2847');
            LaserCorridorScene._unlockDoor(game);
            return;
        }
        if (game.passwordPuzzle) {
            game.passwordPuzzle.show({
                id: 'biometric_override',
                title: '🔐 Biometric Override Code',
                description: 'Enter the emergency maintenance override code for the biometric lock.<br><br>Eva Petrova provided this code via secure Meshtastic mesh network earlier in the mission.<br><br>Check your Meshtastic message log.',
                correctAnswer: ['2847'],
                hint: 'Eva\'s Meshtastic message: "Override code: 2847"',
                placeholder: 'Enter 4-digit code...',
                inputType: 'text',
                maxAttempts: 5,
                onSuccess: (g) => {
                    const s = LaserCorridorScene.state;
                    s.codeEntered = true;
                    game.setFlag('biometric_code_entered', true);
                    game.showNotification('Override code accepted');
                    LaserCorridorScene._unlockDoor(game);
                },
                onFailure: (g) => {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*Panel flashes red: ACCESS DENIED*' },
                        { speaker: 'Ryan', text: 'Wrong code. Think. Eva sent it via Meshtastic.' },
                        { speaker: 'Ryan', text: 'Four digits. When we were upstairs in the corridor.' }
                    ]);
                }
            });
        }
    },

    /** Phase 3 completion: unlock door with visual feedback */
    _unlockDoor: (game) => {
        const s = LaserCorridorScene.state;
        game.startDialogue([
            { speaker: 'Narrator', text: '*Ryan types 2-8-4-7 on the keypad*' },
            { speaker: 'Narrator', text: '*A long pause. The panel hums.*' },
            { speaker: 'Narrator', text: '*CLICK*' },
            { speaker: 'Narrator', text: '*Panel display shifts: red → amber → GREEN*' },
            { speaker: 'Narrator', text: '*BIOMETRIC: OVERRIDE ACCEPTED*' },
            { speaker: 'Narrator', text: '*Deep mechanical CLUNK from inside the steel door*' },
            { speaker: 'Narrator', text: '*The lock indicator changes from red to green*' },
            { speaker: 'Ryan', text: '...It worked. Eva\'s code. 2847.' },
            { speaker: 'Ryan', text: 'Three layers of security. Flipper Zero. HackRF. And Eva.' },
            { speaker: 'Ryan', text: 'Defence-in-depth means nothing when every layer has a weakness.' },
            { speaker: 'Narrator', text: '*The heavy steel door shifts slightly — unsealed, ready to open*' },
            { speaker: 'Ryan', text: 'The server room is right through that door.' },
            { speaker: 'Ryan', text: 'This is it.' }
        ], () => {
            s.doorUnlocked = true;
            s.phase = 4;
            game.setFlag('server_door_unlocked', true);

            game.questManager.updateProgress('breach_corridor', 'door_unlocked');
            game.completeQuest('breach_corridor');
            game.showNotification('Door unlocked — Enter the server room');

            // Audio: keypad beep, success chime, mechanical clunk
            LaserCorridorScene._sfxKeypadBeep();
            setTimeout(() => LaserCorridorScene._sfxBiometricSuccess(), 300);
            setTimeout(() => LaserCorridorScene._sfxDoorClunk(), 900);

            // Animate door lock: red → green
            LaserCorridorScene._animateDoorUnlock();
            // Update biometric panel: LOCKED → UNLOCKED
            LaserCorridorScene._animateBiometricUnlock();
        });
    },

    // ═══════════════════════════════════════════════════════════
    // DYNAMIC OVERLAY SYSTEM
    // ═══════════════════════════════════════════════════════════

    /**
     * Create the inline SVG overlay with all dynamic elements:
     * - Laser beams (5 beams + emitter LEDs + haze) — Phase 1
     * - Sensor pods (3 pods with LEDs + cones) — visible all phases
     * - Door lock indicator — until unlocked
     * - Biometric panel status LED + text — until unlocked
     */
    _createOverlays: () => {
        // Remove any existing overlay
        const old = document.getElementById('laser-corridor-overlay');
        if (old) old.remove();

        // Fetch pre-built SVG overlay; all groups are accessed later via
        // document.getElementById('overlay-lasers' | 'overlay-sensors' | ...)
        fetch('assets/images/overlayimg/laser-corridor-overlay.svg')
            .then(r => r.text())
            .then(svgText => {
                const tmp = document.createElement('div');
                tmp.innerHTML = svgText;
                const svgEl = tmp.querySelector('svg');
                const container = document.getElementById('scene-container');
                if (svgEl && container) container.appendChild(svgEl);
            });
    },

    // ═══════════════════════════════════════════════════════════
    // OVERLAY ANIMATIONS
    // ═══════════════════════════════════════════════════════════

    /** Animate laser beams dying one by one, then remove laser group */
    _animateLaserDeath: () => {
        const laserGroup = document.getElementById('overlay-lasers');
        if (!laserGroup) return;

        const beams = laserGroup.querySelectorAll('.laser-beam');
        const leds  = laserGroup.querySelectorAll('.emitter-led');
        const haze  = laserGroup.querySelector('.laser-haze');

        // Stagger beam death: beam 1 at 0ms, beam 3 at 400ms, beam 2 at 800ms, beam 5 at 1200ms, beam 4 at 1600ms
        const deathOrder = [0, 2, 1, 4, 3]; // indices matching data-beam 1,3,2,5,4
        deathOrder.forEach((idx, i) => {
            const beam = beams[idx];
            if (!beam) return;
            setTimeout(() => {
                beam.style.animation = 'laser-flicker-die 0.8s ease-out forwards';
            }, i * 400);
        });

        // Fade emitter LEDs
        leds.forEach((led, i) => {
            setTimeout(() => {
                // Stop SMIL animation and fade
                const anims = led.querySelectorAll('animate');
                anims.forEach(a => a.setAttribute('repeatCount', '0'));
                led.style.transition = 'opacity 0.6s ease-out';
                led.setAttribute('opacity', '0.05');
                led.setAttribute('fill', '#330000');
            }, 600 + i * 400);
        });

        // Fade haze
        if (haze) {
            setTimeout(() => {
                const anims = haze.querySelectorAll('animate');
                anims.forEach(a => a.setAttribute('repeatCount', '0'));
                haze.style.transition = 'opacity 2s ease-out';
                haze.setAttribute('opacity', '0');
            }, 1800);
        }

        // Remove entire laser group after animations complete
        setTimeout(() => {
            if (laserGroup.parentNode) {
                laserGroup.style.transition = 'opacity 0.5s';
                laserGroup.style.opacity = '0';
                setTimeout(() => laserGroup.remove(), 600);
            }
        }, 3200);
    },

    /** Activate sensor pods: dormant green → active red pulsing with cones */
    _activateSensors: () => {
        const sensorGroup = document.getElementById('overlay-sensors');
        if (!sensorGroup) return;

        const pods = sensorGroup.querySelectorAll('.sensor-pod');
        pods.forEach((pod, i) => {
            setTimeout(() => {
                const led = pod.querySelector('.sensor-led');
                const cone = pod.querySelector('.sensor-cone');

                if (led) {
                    // Stop SMIL dormant animation
                    const anims = led.querySelectorAll('animate');
                    anims.forEach(a => a.remove());
                    // Flash to red
                    led.setAttribute('fill', '#ff2200');
                    led.setAttribute('opacity', '0.8');

                    // Create new active SMIL pulsing animation
                    const NS = 'http://www.w3.org/2000/svg';
                    const anim = document.createElementNS(NS, 'animate');
                    anim.setAttribute('attributeName', 'opacity');
                    anim.setAttribute('values', '0.8;0.2;0.8');
                    anim.setAttribute('dur', (1.8 + i * 0.2) + 's');
                    anim.setAttribute('repeatCount', 'indefinite');
                    led.appendChild(anim);
                }

                if (cone) {
                    // Brighten cone + change color to red-ish
                    cone.setAttribute('fill', 'rgba(255,40,0,0.03)');
                    cone.setAttribute('opacity', '1');

                    const NS = 'http://www.w3.org/2000/svg';
                    const anim = document.createElementNS(NS, 'animate');
                    anim.setAttribute('attributeName', 'opacity');
                    anim.setAttribute('values', '1;0.3;1');
                    anim.setAttribute('dur', (2 + i * 0.3) + 's');
                    anim.setAttribute('repeatCount', 'indefinite');
                    cone.appendChild(anim);
                }
            }, i * 300);
        });
    },

    /** Animate sensors getting jammed: red → amber flicker → dark */
    _animateSensorDeath: () => {
        const sensorGroup = document.getElementById('overlay-sensors');
        if (!sensorGroup) return;

        const pods = sensorGroup.querySelectorAll('.sensor-pod');
        pods.forEach((pod, i) => {
            const led = pod.querySelector('.sensor-led');
            const cone = pod.querySelector('.sensor-cone');

            setTimeout(() => {
                if (led) {
                    // Remove SMIL animations
                    const anims = led.querySelectorAll('animate');
                    anims.forEach(a => a.remove());

                    // Amber flicker phase
                    led.setAttribute('fill', '#ffaa00');
                    led.setAttribute('opacity', '0.9');

                    // Fast strobe
                    let flicks = 0;
                    const strobeInterval = setInterval(() => {
                        flicks++;
                        const on = flicks % 2 === 0;
                        led.setAttribute('opacity', on ? '0.8' : '0.1');
                        led.setAttribute('fill', on ? '#ffaa00' : '#ff4400');
                        if (flicks > 8) {
                            clearInterval(strobeInterval);
                            // Go dark
                            led.setAttribute('fill', '#220800');
                            led.setAttribute('opacity', '0.15');
                        }
                    }, 100);
                }

                if (cone) {
                    // Remove SMIL and fade
                    const anims = cone.querySelectorAll('animate');
                    anims.forEach(a => a.remove());
                    cone.style.transition = 'opacity 1s ease-out';
                    cone.setAttribute('opacity', '0');
                }
            }, i * 500);
        });

        // Fade entire sensor overlay after jam completes
        setTimeout(() => {
            if (sensorGroup.parentNode) {
                // Keep housings barely visible (dead hardware)
                pods.forEach(pod => {
                    const led = pod.querySelector('.sensor-led');
                    if (led) {
                        led.setAttribute('opacity', '0.08');
                        led.setAttribute('fill', '#111');
                    }
                });
            }
        }, 2500);
    },

    /** Animate door lock indicator: red → green */
    _animateDoorUnlock: () => {
        const lockGroup = document.getElementById('overlay-door-lock');
        if (!lockGroup) return;

        const dot  = lockGroup.querySelector('.lock-dot');
        const ring = lockGroup.querySelector('.lock-ring');

        if (dot) {
            // Remove SMIL pulse
            const anims = dot.querySelectorAll('animate');
            anims.forEach(a => a.remove());

            // Flash sequence: red → amber → green
            dot.setAttribute('fill', '#ff8800');
            dot.setAttribute('opacity', '0.9');

            setTimeout(() => {
                dot.setAttribute('fill', '#00ff40');
                dot.setAttribute('opacity', '1');

                // Add gentle green pulse
                const NS = 'http://www.w3.org/2000/svg';
                const anim = document.createElementNS(NS, 'animate');
                anim.setAttribute('attributeName', 'opacity');
                anim.setAttribute('values', '1;0.6;1');
                anim.setAttribute('dur', '2s');
                anim.setAttribute('repeatCount', 'indefinite');
                dot.appendChild(anim);
            }, 400);
        }

        if (ring) {
            // Remove SMIL and switch to green
            const anims = ring.querySelectorAll('animate');
            anims.forEach(a => a.remove());
            ring.setAttribute('stroke', '#00ff40');
            ring.setAttribute('opacity', '0.3');

            setTimeout(() => {
                ring.style.transition = 'opacity 2s';
                ring.setAttribute('opacity', '0');
            }, 1500);
        }
    },

    /** Animate biometric panel: LOCKED → UNLOCKED */
    _animateBiometricUnlock: () => {
        const bioGroup = document.getElementById('overlay-biometric');
        if (!bioGroup) return;

        const led  = bioGroup.querySelector('.bio-led');
        const text = bioGroup.querySelector('.bio-status-text');

        if (led) {
            const anims = led.querySelectorAll('animate');
            anims.forEach(a => a.remove());
            led.setAttribute('fill', '#00ff40');
            led.setAttribute('opacity', '0.8');

            const NS = 'http://www.w3.org/2000/svg';
            const anim = document.createElementNS(NS, 'animate');
            anim.setAttribute('attributeName', 'opacity');
            anim.setAttribute('values', '0.8;0.5;0.8');
            anim.setAttribute('dur', '2s');
            anim.setAttribute('repeatCount', 'indefinite');
            led.appendChild(anim);
        }

        if (text) {
            text.setAttribute('fill', '#00ff40');
            text.textContent = 'UNLOCKED';
        }
    }
};

// Register scene
if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(LaserCorridorScene);
}
