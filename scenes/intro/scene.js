/**
 * Intro Scene – Cinematic Hollywood-style Multi-Act Prologue
 * Full audio-visual experience with Web Audio synthesis, canvas FX,
 * Ken Burns camera, screen shake, lens-flare title reveal, and more.
 */

const IntroScene = {
    id: 'intro',
    name: 'Prologue',
    background: 'assets/images/scenes/intro.svg',
    description: 'A quiet morning in Compascuum, Drenthe. The world is about to change.',
    playerStart: { x: 50, y: 85 },
    idleThoughts: [],
    hotspots: [],

    /* ── bookkeeping ─────────────────────────────────────────── */
    _timeoutIds: [],
    _intervalIds: [],
    _animFrameId: null,
    _audioCtx: null,
    _audioNodes: [],

    _clearTimeouts() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        this._intervalIds.forEach(id => clearInterval(id));
        this._intervalIds = [];
        if (this._animFrameId) { cancelAnimationFrame(this._animFrameId); this._animFrameId = null; }
    },
    _schedule(fn, ms) { const id = setTimeout(fn, ms); this._timeoutIds.push(id); return id; },

    /* ── AUDIO ENGINE (Web Audio API synthesis) ──────────────── */
    _initAudio() {
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            const ctx = new AC();
            this._audioCtx = ctx;

            // Master gain
            const master = ctx.createGain();
            master.gain.value = 0.35;
            master.connect(ctx.destination);
            this._masterGain = master;

            // Low drone (two detuned oscillators + LP filter)
            const droneA = ctx.createOscillator();
            const droneB = ctx.createOscillator();
            const droneGain = ctx.createGain();
            const droneFilter = ctx.createBiquadFilter();
            droneA.type = 'sawtooth'; droneA.frequency.value = 38;
            droneB.type = 'sawtooth'; droneB.frequency.value = 39.5;
            droneFilter.type = 'lowpass'; droneFilter.frequency.value = 120; droneFilter.Q.value = 4;
            droneGain.gain.value = 0;
            droneA.connect(droneFilter); droneB.connect(droneFilter);
            droneFilter.connect(droneGain); droneGain.connect(master);
            droneA.start(); droneB.start();
            // Fade drone in over 3s
            droneGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3);
            this._droneGain = droneGain;
            this._droneFilter = droneFilter;
            this._audioNodes.push(droneA, droneB);
        } catch(e) { console.warn('Audio init failed:', e); }
    },

    _playTypeTick() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 800 + Math.random() * 600;
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(g); g.connect(this._masterGain);
        osc.start(t); osc.stop(t + 0.05);
    },

    _playImpact() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx; const t = ctx.currentTime;
        // Sub bass hit
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);
        g.gain.setValueAtTime(0.7, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(g); g.connect(this._masterGain);
        osc.start(t); osc.stop(t + 0.55);
        // Click layer
        const n = ctx.createBufferSource();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        n.buffer = buf;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.3, t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        n.connect(ng); ng.connect(this._masterGain);
        n.start(t);
    },

    _playHeartbeat() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx; const t = ctx.currentTime;
        [0, 0.15].forEach(offset => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(50, t + offset);
            osc.frequency.exponentialRampToValueAtTime(30, t + offset + 0.15);
            g.gain.setValueAtTime(offset === 0 ? 0.6 : 0.35, t + offset);
            g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.25);
            osc.connect(g); g.connect(this._masterGain);
            osc.start(t + offset); osc.stop(t + offset + 0.3);
        });
    },

    _playStatic(duration) {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx; const t = ctx.currentTime;
        const n = ctx.createBufferSource();
        const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.15;
        n.buffer = buf;
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass'; f.frequency.value = 3000; f.Q.value = 0.5;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.15, t);
        g.gain.linearRampToValueAtTime(0, t + duration);
        n.connect(f); f.connect(g); g.connect(this._masterGain);
        n.start(t);
    },

    _playTitleReveal() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx; const t = ctx.currentTime;
        // Rising sweep
        const sweep = ctx.createOscillator();
        const sg = ctx.createGain();
        sweep.type = 'sawtooth';
        sweep.frequency.setValueAtTime(60, t);
        sweep.frequency.exponentialRampToValueAtTime(400, t + 1.5);
        const sf = ctx.createBiquadFilter();
        sf.type = 'lowpass'; sf.frequency.setValueAtTime(200, t);
        sf.frequency.exponentialRampToValueAtTime(2000, t + 1.5);
        sg.gain.setValueAtTime(0.2, t);
        sg.gain.linearRampToValueAtTime(0.5, t + 1.2);
        sg.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
        sweep.connect(sf); sf.connect(sg); sg.connect(this._masterGain);
        sweep.start(t); sweep.stop(t + 2.6);
        // Impact at peak
        setTimeout(() => this._playImpact(), 1500);
        // Sustain pad
        const pad = ctx.createOscillator();
        const pg = ctx.createGain();
        pad.type = 'sine'; pad.frequency.value = 110;
        pg.gain.setValueAtTime(0, t + 1.5);
        pg.gain.linearRampToValueAtTime(0.3, t + 2.5);
        pg.gain.linearRampToValueAtTime(0.15, t + 8);
        pad.connect(pg); pg.connect(this._masterGain);
        pad.start(t + 1.5); pad.stop(t + 10);
        this._audioNodes.push(pad);
    },

    _setDroneForAct(act) {
        if (!this._droneFilter || !this._droneGain || !this._audioCtx) return;
        const t = this._audioCtx.currentTime;
        const presets = {
            0:  { freq: 80,  gain: 0.15 },
            1:  { freq: 200, gain: 0.45 },
            2:  { freq: 350, gain: 0.55 },
            3:  { freq: 120, gain: 0.2  },
            4:  { freq: 100, gain: 0.2  },
            5:  { freq: 80,  gain: 0.25 },
            6:  { freq: 100, gain: 0.3  },
            7:  { freq: 140, gain: 0.35 },
            8:  { freq: 250, gain: 0.45 },
            9:  { freq: 500, gain: 0.6  },
            10: { freq: 60,  gain: 0.1  },
        };
        const p = presets[act] || presets[0];
        this._droneFilter.frequency.linearRampToValueAtTime(p.freq, t + 1.5);
        this._droneGain.gain.linearRampToValueAtTime(p.gain, t + 1.5);
    },

    _stopAudio() {
        try {
            if (this._droneGain && this._audioCtx) {
                this._droneGain.gain.linearRampToValueAtTime(0, this._audioCtx.currentTime + 0.5);
            }
            setTimeout(() => {
                this._audioNodes.forEach(n => { try { n.stop(); } catch(e){} });
                this._audioNodes = [];
                if (this._audioCtx) { this._audioCtx.close().catch(()=>{}); this._audioCtx = null; }
            }, 600);
        } catch(e) {}
    },

    /* ════════════════════════════════════════════════════════════
       ON ENTER
       ════════════════════════════════════════════════════════════ */
    onEnter(game) {
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) charactersContainer.style.display = 'none';
        const originalVoiceState = game.voiceEnabled;
        game.voiceEnabled = false;
        const dialogueBox = document.getElementById('dialogue-box');
        if (dialogueBox) dialogueBox.classList.add('hidden');

        const self = this;
        self._clearTimeouts();
        self._initAudio();

        // ─────────────────────────────────────────────────────────
        // INJECT STYLES
        // ─────────────────────────────────────────────────────────
        const style = document.createElement('style');
        style.id = 'intro-cinematic-style';
        style.textContent = `
/* === BASE === */
#cinematic-intro {
    position: fixed; inset: 0; z-index: 9999;
    background: #000; color: #fff;
    font-family: 'Georgia', 'Times New Roman', serif;
    overflow: hidden; cursor: pointer; user-select: none;
}
#cinematic-intro * { box-sizing: border-box; }

/* === LETTERBOX === */
.cine-bar {
    position: absolute; left: 0; right: 0; background: #000; z-index: 20;
    transition: height 2s ease;
}
.cine-bar-top { top: 0; height: 0; }
.cine-bar-bot { bottom: 0; height: 0; }
.cine-bar.active { height: 7.5vh; }

/* === LAYERS === */
.cine-scene {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    opacity: 0; padding: 10vh 8vw; text-align: center;
    transition: opacity 2s ease-in-out;
    will-change: opacity, transform;
}
.cine-scene.active { opacity: 1; }
.cine-scene.fade-out { opacity: 0; transition: opacity 0.8s ease-in; }
.cine-scene.kb-zoom { animation: kb-zoom-in 15s ease-in-out forwards; }
@keyframes kb-zoom-in {
    0%   { transform: scale(1) translateY(0); }
    100% { transform: scale(1.08) translateY(-1%); }
}
.cine-scene.kb-zoom-out { animation: kb-zoom-out 12s ease-in-out forwards; }
@keyframes kb-zoom-out {
    0%   { transform: scale(1.1) translateY(-1%); }
    100% { transform: scale(1) translateY(0); }
}

/* === CANVAS LAYERS === */
#cine-particles, #cine-waveform {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
}
#cine-waveform { z-index: 4; }

/* === OVERLAYS === */
.cine-scanlines {
    position: absolute; inset: 0; z-index: 6; pointer-events: none;
    background: repeating-linear-gradient(0deg,
        rgba(0,255,255,0.012) 0px, transparent 1px,
        transparent 3px, rgba(0,255,255,0.012) 4px);
    animation: cine-scan-drift 10s linear infinite;
    mix-blend-mode: screen;
}
@keyframes cine-scan-drift { to { transform: translateY(12px); } }
.cine-vignette {
    position: absolute; inset: 0; z-index: 7; pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.75) 100%);
}
.cine-grain {
    position: absolute; inset: -50%; z-index: 5; pointer-events: none;
    width: 200%; height: 200%; opacity: 0.035;
    animation: grain-shift 0.5s steps(4) infinite;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
}
@keyframes grain-shift {
    0%   { transform: translate(0,0); }
    25%  { transform: translate(-5%,-5%); }
    50%  { transform: translate(5%,2%); }
    75%  { transform: translate(-2%,5%); }
    100% { transform: translate(0,0); }
}

/* === PROGRESS DOTS === */
.cine-progress {
    position: fixed; bottom: 2.5vh; left: 50%; transform: translateX(-50%);
    z-index: 25; display: flex; gap: 10px;
    opacity: 0; transition: opacity 1s ease;
}
.cine-progress.visible { opacity: 1; }
.cine-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.2);
    transition: background 0.5s ease, box-shadow 0.5s ease;
}
.cine-dot.active {
    background: rgba(0,255,255,0.8);
    box-shadow: 0 0 8px rgba(0,255,255,0.6);
}
.cine-dot.done { background: rgba(0,255,255,0.35); }

/* === SKIP === */
.cine-skip {
    position: fixed; bottom: 2.5vh; right: 3vw; z-index: 9999;
    font-family: 'Courier New', monospace;
    font-size: 0.75em; letter-spacing: 3px;
    color: rgba(255,255,255,0.25); background: none;
    border: 1px solid rgba(255,255,255,0.1);
    padding: 6px 16px; cursor: pointer; border-radius: 2px;
    transition: color 0.3s, border-color 0.3s;
}
.cine-skip:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.4); }

/* === SCREEN SHAKE === */
@keyframes screen-shake {
    0%   { transform: translate(0,0) rotate(0); }
    10%  { transform: translate(-3px,2px) rotate(-0.3deg); }
    20%  { transform: translate(4px,-2px) rotate(0.4deg); }
    30%  { transform: translate(-2px,3px) rotate(-0.2deg); }
    40%  { transform: translate(3px,-1px) rotate(0.3deg); }
    50%  { transform: translate(-1px,2px) rotate(-0.1deg); }
    60%  { transform: translate(2px,-2px) rotate(0.2deg); }
    70%  { transform: translate(-2px,1px) rotate(-0.1deg); }
    80%  { transform: translate(1px,-1px) rotate(0.1deg); }
    100% { transform: translate(0,0) rotate(0); }
}
.shake { animation: screen-shake 0.4s ease-out; }

/* === FLASH / GLITCH === */
.cine-flash {
    position: absolute; inset: 0; z-index: 50;
    background: #fff; opacity: 0; pointer-events: none;
}
.cine-flash.fire { animation: flash-fire 0.12s ease-out forwards; }
@keyframes flash-fire { 0% { opacity: 0.6; } 100% { opacity: 0; } }
.cine-glitch-bar {
    position: absolute; left: 0; right: 0; z-index: 40;
    height: 2px; pointer-events: none; opacity: 0;
}

/* === ACT 0: BLACK HOLD === */
.scene-black { background: #000; }

/* === ACT 1: PRODUCTION CARD === */
.scene-production { background: #000; }
.prod-text {
    font-family: 'Georgia', serif;
    font-size: 1.1em; letter-spacing: 8px; text-transform: uppercase;
    color: rgba(255,255,255,0.0);
    transition: color 2s ease;
    position: relative; z-index: 5;
}
.prod-text.visible { color: rgba(255,255,255,0.65); }
.prod-text.fade { color: rgba(255,255,255,0.0); transition: color 1.2s ease; }
.prod-line {
    width: 60px; height: 1px; margin: 20px auto;
    background: rgba(255,255,255,0);
    transition: background 2s ease 0.4s, width 2s ease 0.4s;
    position: relative; z-index: 5;
}
.prod-line.visible { background: rgba(255,255,255,0.25); width: 120px; }

/* === ACT 2: BUNKER === */
.scene-bunker { background: #000; overflow: hidden; }
.bunker-label {
    position: absolute; top: 10vh; left: 4vw; z-index: 8;
    font-family: 'Courier New', monospace;
    font-size: 0.65em; letter-spacing: 5px; text-transform: uppercase;
    color: rgba(0,255,65,0.35);
    opacity: 0; animation: term-type 1s ease-out 0.5s forwards;
}
.bunker-terminal {
    font-family: 'Courier New', monospace;
    color: #00ff41; font-size: 0.9em; line-height: 1.9;
    text-align: left; max-width: 680px; width: 100%;
    text-shadow: 0 0 6px rgba(0,255,65,0.5);
    position: relative; z-index: 8;
}
.bunker-terminal .term-line {
    opacity: 0; transform: translateX(-8px);
    white-space: nowrap; overflow: hidden;
}
.bunker-terminal .term-line.typed { animation: term-type 0.5s ease-out forwards; }
@keyframes term-type { to { opacity: 1; transform: translateX(0); } }
.bunker-cursor {
    display: inline-block; width: 8px; height: 1em;
    background: #00ff41; vertical-align: text-bottom;
    animation: blink-cursor 0.65s step-end infinite;
}
@keyframes blink-cursor { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
.term-warning { color: #ff3333; text-shadow: 0 0 10px rgba(255,51,51,0.7); }
.term-highlight { color: #00ffff; text-shadow: 0 0 8px rgba(0,255,255,0.5); }
.term-classified { color: #ff6600; text-shadow: 0 0 8px rgba(255,102,0,0.5); }
.bunker-stamp {
    position: absolute; z-index: 9;
    font-family: 'Courier New', monospace;
    font-size: 4.5em; color: rgba(255,0,0,0.08);
    transform: rotate(-18deg);
    letter-spacing: 15px; font-weight: bold; text-transform: uppercase;
    pointer-events: none; opacity: 0;
}
.bunker-stamp.visible { animation: stamp-slam 0.25s ease-out forwards; }
@keyframes stamp-slam {
    0%   { opacity: 0;    transform: rotate(-18deg) scale(3); }
    60%  { opacity: 0.16; transform: rotate(-18deg) scale(0.92); }
    100% { opacity: 0.12; transform: rotate(-18deg) scale(1); }
}
.bunker-time {
    position: absolute; top: 10vh; right: 4vw; z-index: 8;
    font-family: 'Courier New', monospace;
    font-size: 0.8em; color: rgba(0,255,65,0.4); letter-spacing: 3px;
    opacity: 0; transition: opacity 1s ease;
}
.bunker-time.visible { opacity: 1; }

/* === ACT 3: BASED ON CARD === */
.scene-based { background: #000; }
.based-text {
    font-family: 'Georgia', serif;
    font-size: 1.05em; letter-spacing: 5px; text-transform: uppercase;
    color: rgba(255,255,255,0);
    transition: color 1.8s ease;
    line-height: 2.5;
    position: relative; z-index: 5;
}
.based-text.visible { color: rgba(255,255,255,0.55); }
.based-accent { color: rgba(0,255,255,0.7) !important; font-style: italic; }

/* === ACT 4: LOCATION / DATE === */
.scene-location {
    background: linear-gradient(180deg, #020a14 0%, #0a1628 50%, #020a14 100%);
}
.loc-text {
    font-family: 'Georgia', serif;
    letter-spacing: 10px; text-transform: uppercase;
    font-size: 1em; color: rgba(255,255,255,0);
    transition: color 1.5s ease, letter-spacing 2s ease;
    position: relative; z-index: 5;
}
.loc-text.visible { color: rgba(255,255,255,0.55); letter-spacing: 12px; }
.loc-place {
    font-family: 'Georgia', serif;
    font-size: 3.2em; letter-spacing: 20px; color: rgba(255,255,255,0);
    margin: 18px 0; font-weight: 300;
    transition: color 1.5s ease 0.3s, letter-spacing 2s ease 0.3s, text-shadow 2s ease 0.3s;
    position: relative; z-index: 5;
}
.loc-place.visible {
    color: #fff; letter-spacing: 24px;
    text-shadow: 0 0 80px rgba(255,255,255,0.15);
}
.loc-date {
    font-family: 'Courier New', monospace;
    font-size: 0.85em; letter-spacing: 6px;
    color: rgba(128,204,221,0); margin-top: 8px;
    transition: color 1s ease 0.8s;
    position: relative; z-index: 5;
}
.loc-date.visible { color: rgba(128,204,221,0.7); }
.loc-sep {
    width: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,255,255,0.3), transparent);
    margin: 22px auto;
    transition: width 2s ease 0.5s;
    position: relative; z-index: 5;
}
.loc-sep.visible { width: 160px; }

/* === ACT 5: AERIAL DRENTHE === */
.scene-aerial {
    background: linear-gradient(180deg, #070e1c 0%, #0f2240 30%, #15305a 50%, #0a1a35 100%);
    overflow: hidden;
}
.aerial-horizon {
    position: absolute; bottom: 38%; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 5%, rgba(180,200,255,0.08) 50%, transparent 95%);
    z-index: 4;
}
.aerial-ground {
    position: absolute; bottom: 7.5vh; left: 0; right: 0; height: 32%;
    background: linear-gradient(180deg, #0a1a0a 0%, #040a04 100%);
    z-index: 3;
}
.aerial-dishes {
    position: absolute; bottom: calc(7.5vh + 30%); left: 12%; z-index: 4;
    display: flex; gap: 45px; opacity: 0;
    transition: opacity 4s ease 1.5s;
}
.aerial-dishes.visible { opacity: 0.2; }
.dish {
    width: 28px; height: 38px;
    border-top: 2px solid rgba(200,220,255,0.5);
    border-left: 1px solid transparent; border-right: 1px solid transparent;
    border-radius: 50% 50% 0 0; position: relative;
}
.dish::after {
    content: ''; position: absolute;
    bottom: -22px; left: 50%; width: 1px; height: 22px;
    background: rgba(200,220,255,0.3); transform: translateX(-50%);
}
.aerial-stars { position: absolute; inset: 0; z-index: 2; }
.aerial-star {
    position: absolute; border-radius: 50%; background: #fff;
    animation: twinkle 3s ease-in-out infinite alternate;
}
@keyframes twinkle { 0% { opacity: 0.15; } 100% { opacity: 0.85; } }
.aerial-text {
    position: relative; z-index: 8; max-width: 880px;
}
.aerial-text p {
    font-size: 1.35em; line-height: 2.2;
    color: rgba(220,228,240,0); margin: 14px 0;
    transition: color 2s ease, transform 2s ease;
    transform: translateY(12px); letter-spacing: 0.5px;
}
.aerial-text p.visible { color: rgba(220,228,240,0.88); transform: translateY(0); }
.aerial-text .emphasis {
    color: #ffd700 !important; text-shadow: 0 0 20px rgba(255,215,0,0.35);
    font-weight: bold; font-style: italic;
}

/* === ACT 6: TURBINES === */
.scene-turbines {
    background: linear-gradient(180deg, #080d1a 0%, #0f1928 50%, #060b15 100%);
    overflow: hidden;
}
.turbine-row {
    position: absolute; bottom: 18%; left: 0; right: 0;
    display: flex; justify-content: center; gap: 4.5vw; z-index: 4;
    opacity: 0; transition: opacity 2.5s ease;
}
.turbine-row.visible { opacity: 1; }
.turbine { display: flex; flex-direction: column; align-items: center; }
.turbine-light {
    width: 4px; height: 4px; border-radius: 50%;
    background: #ff1a1a;
    box-shadow: 0 0 6px #ff1a1a, 0 0 15px rgba(255,26,26,0.35);
    animation: t-blink 2.5s ease-in-out infinite;
}
@keyframes t-blink { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }
.turbine-pole {
    width: 1.5px; height: 55px;
    background: linear-gradient(180deg, rgba(140,160,190,0.25), rgba(140,160,190,0.03));
}
.turbine-text {
    position: relative; z-index: 8; max-width: 820px;
}
.turbine-text p {
    font-size: 1.35em; line-height: 2.2; color: rgba(200,210,230,0);
    margin: 14px 0; transition: color 1.5s ease, transform 1.5s ease;
    transform: translateY(10px); letter-spacing: 0.5px;
}
.turbine-text p.visible { color: rgba(200,210,230,0.85); transform: translateY(0); }

/* === ACT 7: MEET RYAN === */
.scene-ryan {
    background: radial-gradient(ellipse at 25% 65%, #1a1408 0%, #0d0a04 40%, #000 100%);
}
.ryan-name {
    font-family: 'Courier New', monospace;
    font-size: 5em; font-weight: 200; letter-spacing: 22px;
    color: rgba(0,255,255,0);
    position: relative; z-index: 5;
    transition: color 2.5s ease, text-shadow 2.5s ease, letter-spacing 3s ease;
}
.ryan-name.visible {
    color: #00ffff; letter-spacing: 28px;
    text-shadow: 0 0 60px rgba(0,255,255,0.5), 0 0 120px rgba(0,255,255,0.15);
}
.ryan-tagline {
    font-family: 'Georgia', serif;
    font-size: 0.95em; letter-spacing: 7px; text-transform: uppercase;
    color: rgba(255,215,0,0); margin-top: 18px;
    transition: color 1.5s ease 0.5s;
    position: relative; z-index: 5;
}
.ryan-tagline.visible { color: rgba(255,215,0,0.6); }
.ryan-details {
    position: relative; z-index: 5; max-width: 780px; margin-top: 35px;
}
.ryan-details p {
    font-size: 1.15em; line-height: 2.2; color: rgba(224,224,224,0);
    margin: 10px 0; transition: color 1.5s ease, transform 1.5s ease;
    transform: translateY(8px);
}
.ryan-details p.visible { color: rgba(224,224,224,0.8); transform: translateY(0); }
.ryan-details .glow {
    color: rgba(255,215,0,0.85) !important;
    text-shadow: 0 0 12px rgba(255,215,0,0.35);
}

/* === ACT 8: ARSENAL === */
.scene-mancave {
    background: radial-gradient(ellipse at center, #050a0f 0%, #000 100%);
    overflow: hidden;
}
.mc-hud-ring {
    position: absolute; width: 500px; height: 500px;
    border: 1px solid rgba(0,255,255,0.06);
    border-radius: 50%; z-index: 3;
    animation: hud-rotate 60s linear infinite;
}
.mc-hud-ring:nth-child(2) {
    width: 400px; height: 400px;
    border-color: rgba(0,255,255,0.04);
    animation-direction: reverse; animation-duration: 45s;
}
@keyframes hud-rotate { to { transform: rotate(360deg); } }
.mc-title {
    font-family: 'Courier New', monospace;
    font-size: 1.2em; letter-spacing: 10px; text-transform: uppercase;
    color: rgba(0,255,255,0);
    margin-bottom: 22px;
    transition: color 1.5s ease;
    position: relative; z-index: 5;
}
.mc-title.visible { color: rgba(0,255,255,0.5); }
.mc-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 8px; max-width: 560px; width: 100%;
    position: relative; z-index: 5; margin-top: 5px;
}
.mc-item {
    font-family: 'Courier New', monospace;
    background: rgba(0,255,255,0.02);
    border: 1px solid rgba(0,255,255,0.0);
    padding: 14px 6px; text-align: center;
    font-size: 0.65em; letter-spacing: 2px;
    color: rgba(0,255,255,0);
    transition: all 0.6s ease;
    position: relative; overflow: hidden;
}
.mc-item.visible {
    color: rgba(0,255,255,0.7);
    border-color: rgba(0,255,255,0.12);
    background: rgba(0,255,255,0.03);
}
.mc-item::before {
    content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0,255,255,0.08), transparent);
}
.mc-item.visible::before { animation: mc-scan 0.8s ease-out forwards; }
@keyframes mc-scan { to { left: 100%; } }
.mc-subtitle {
    font-size: 1em; color: rgba(255,215,0,0);
    margin-top: 28px; max-width: 680px;
    transition: color 1.5s ease;
    position: relative; z-index: 5; line-height: 2.2;
}
.mc-subtitle.visible { color: rgba(255,215,0,0.6); }

/* === ACT 9: THE THREAT === */
.scene-threat {
    background: radial-gradient(ellipse at center, #1a0000 0%, #0a0000 40%, #000 100%);
}
.threat-text { position: relative; z-index: 5; max-width: 820px; }
.threat-text p {
    font-size: 1.45em; line-height: 2.2; margin: 16px 0;
    color: rgba(255,255,255,0); transform: translateY(12px);
    transition: color 1.8s ease, transform 1.8s ease;
}
.threat-text p.visible { transform: translateY(0); }
.t-sinister.visible { color: rgba(153,153,255,0.85); font-style: italic; text-shadow: 0 0 12px rgba(153,153,255,0.3); }
.t-warn.visible { color: #ff4444; text-shadow: 0 0 18px rgba(255,68,68,0.5); font-weight: bold; }
.t-gold.visible { color: #ffd700; text-shadow: 0 0 18px rgba(255,215,0,0.4); font-weight: bold; }
.t-defiant {
    font-size: 1.7em !important; font-weight: bold;
    font-family: 'Courier New', monospace;
}
.t-defiant.visible {
    color: #00ffff !important;
    text-shadow: 0 0 30px rgba(0,255,255,0.7), 0 0 60px rgba(0,255,255,0.3) !important;
}
.threat-pulse {
    position: absolute; inset: 0; z-index: 3; pointer-events: none;
    background: radial-gradient(ellipse at center, rgba(255,0,0,0.06), transparent 70%);
    opacity: 0;
}
.threat-pulse.beating { animation: hb-pulse 1.1s ease-in-out infinite; }
@keyframes hb-pulse {
    0%   { opacity: 0; }
    12%  { opacity: 1; }
    25%  { opacity: 0.2; }
    37%  { opacity: 0.8; }
    55%  { opacity: 0; }
    100% { opacity: 0; }
}

/* === ACT 10: TITLE REVEAL === */
.scene-title { background: #000; overflow: hidden; }
.title-ring {
    position: absolute; width: 0; height: 0;
    border: 2px solid rgba(0,255,255,0.6);
    border-radius: 50%; z-index: 4;
    pointer-events: none; opacity: 0;
}
.title-ring.burst { animation: ring-burst 2s ease-out forwards; }
@keyframes ring-burst {
    0%   { width: 0; height: 0; opacity: 0.8; border-width: 3px; }
    100% { width: 200vmax; height: 200vmax; opacity: 0; border-width: 0.5px;
           margin-left: -100vmax; margin-top: -100vmax; }
}
.title-flare {
    position: absolute; width: 600px; height: 4px; z-index: 5;
    background: linear-gradient(90deg, transparent, rgba(0,255,255,0.5) 30%, #fff 50%, rgba(0,255,255,0.5) 70%, transparent);
    pointer-events: none; opacity: 0; filter: blur(1px);
    transform: scaleX(0);
}
.title-flare.active { animation: flare-expand 1.5s ease-out forwards; }
@keyframes flare-expand {
    0%   { transform: scaleX(0); opacity: 0; }
    30%  { transform: scaleX(1.2); opacity: 1; }
    100% { transform: scaleX(2); opacity: 0; }
}
.title-main {
    font-family: 'Courier New', monospace;
    font-size: 6.5em; font-weight: bold; letter-spacing: 30px;
    text-transform: uppercase;
    color: transparent; -webkit-text-stroke: 2px rgba(0,255,255,0.5);
    position: relative; z-index: 8;
    opacity: 0; transform: scale(0.5);
    transition: all 2s cubic-bezier(0.16, 1, 0.3, 1);
}
.title-main.visible {
    opacity: 1; transform: scale(1);
    color: #00ffff; -webkit-text-stroke: 0;
    text-shadow:
        0 0 40px rgba(0,255,255,0.8),
        0 0 80px rgba(0,255,255,0.4),
        0 0 160px rgba(0,255,255,0.2),
        0 0 300px rgba(0,255,255,0.1);
    animation: title-breathe 4s ease-in-out 2s infinite;
}
@keyframes title-breathe {
    0%,100% { text-shadow: 0 0 40px rgba(0,255,255,0.8), 0 0 80px rgba(0,255,255,0.4); }
    50%     { text-shadow: 0 0 60px rgba(0,255,255,1), 0 0 120px rgba(0,255,255,0.5), 0 0 200px rgba(0,255,255,0.2); }
}
.title-line {
    width: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,255,255,0.5), transparent);
    margin: 25px auto 0; position: relative; z-index: 8;
    transition: width 2s ease 0.6s;
}
.title-line.visible { width: 250px; }
.title-sub {
    font-family: 'Georgia', serif;
    font-size: 2em; letter-spacing: 16px; font-weight: 300;
    text-transform: uppercase; color: rgba(255,215,0,0);
    margin-top: 20px;
    transition: color 1.5s ease 0.8s, text-shadow 1.5s ease 0.8s;
    position: relative; z-index: 8;
}
.title-sub.visible { color: #ffd700; text-shadow: 0 0 30px rgba(255,215,0,0.5); }
.title-tagline {
    font-family: 'Georgia', serif;
    font-size: 1.1em; letter-spacing: 4px;
    color: rgba(255,235,59,0); font-style: italic;
    margin-top: 25px; position: relative; z-index: 8;
    transition: color 2s ease 1.4s;
}
.title-tagline.visible { color: rgba(255,235,59,0.6); }
.title-begin {
    font-family: 'Courier New', monospace;
    font-size: 1.1em; letter-spacing: 6px; font-weight: bold;
    color: rgba(255,255,255,0); margin-top: 45px;
    position: relative; z-index: 8;
    transition: color 1.5s ease 2.5s;
}
.title-begin.visible {
    color: rgba(255,255,255,0.9);
    animation: begin-pulse 2.2s ease-in-out 3s infinite;
}
@keyframes begin-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

/* === RESPONSIVE === */
@media (max-width: 768px) {
    .title-main  { font-size: 2.8em; letter-spacing: 10px; }
    .title-sub   { font-size: 1.3em; letter-spacing: 8px; }
    .ryan-name   { font-size: 2.5em; letter-spacing: 8px; }
    .loc-place   { font-size: 2em; letter-spacing: 10px; }
    .bunker-terminal { font-size: 0.65em; }
    .aerial-text p, .turbine-text p, .threat-text p { font-size: 1.05em; }
    .mc-grid { grid-template-columns: repeat(2, 1fr); max-width: 300px; }
    .prod-text { font-size: 0.85em; letter-spacing: 5px; }
    .mc-hud-ring { width: 280px !important; height: 280px !important; }
    .mc-hud-ring:nth-child(2) { width: 220px !important; height: 220px !important; }
}
`;
        document.head.appendChild(style);

        // ─────────────────────────────────────────────────────────
        // BUILD DOM
        // ─────────────────────────────────────────────────────────
        const totalActs = 11; // 0..10
        const cine = document.createElement('div');
        cine.id = 'cinematic-intro';

        let dotsHTML = '<div class="cine-progress" id="cine-progress">';
        for (let i = 1; i < totalActs; i++) dotsHTML += '<div class="cine-dot" data-act="' + i + '"></div>';
        dotsHTML += '</div>';

        // Build turbines HTML
        let turbinesHTML = '';
        for (let i = 0; i < 10; i++) {
            turbinesHTML += '<div class="turbine"><div class="turbine-light" style="animation-delay:' + (i*0.3).toFixed(1) + 's"></div><div class="turbine-pole"></div></div>';
        }

        cine.innerHTML = 
            '<div class="cine-bar cine-bar-top" id="cbar-top"></div>' +
            '<div class="cine-bar cine-bar-bot" id="cbar-bot"></div>' +
            '<canvas id="cine-particles"></canvas>' +
            '<canvas id="cine-waveform"></canvas>' +
            '<div class="cine-scanlines"></div>' +
            '<div class="cine-grain"></div>' +
            '<div class="cine-vignette"></div>' +
            '<div class="cine-flash" id="cine-flash"></div>' +
            '<button class="cine-skip" id="cine-skip">SKIP &#9658;&#9658;</button>' +
            dotsHTML +

            '<!-- ACT 0: BLACK HOLD -->' +
            '<div class="cine-scene scene-black" id="scene-0"></div>' +

            '<!-- ACT 1: PRODUCTION CARD -->' +
            '<div class="cine-scene scene-production" id="scene-1">' +
                '<div class="prod-text" id="prod-1">A</div>' +
                '<div class="prod-line" id="prod-line"></div>' +
                '<div class="prod-text" id="prod-2" style="font-size:1.4em;letter-spacing:12px;margin:8px 0">CYBERQUEST</div>' +
                '<div class="prod-line" id="prod-line2"></div>' +
                '<div class="prod-text" id="prod-3">INTERACTIVE PRODUCTION</div>' +
            '</div>' +

            '<!-- ACT 2: BUNKER COLD OPEN -->' +
            '<div class="cine-scene scene-bunker" id="scene-2">' +
                '<div class="bunker-label">AIVD // CLASSIFIED // ECHELON-NL NODE 7</div>' +
                '<div class="bunker-time" id="bunker-time">07:27:14 CET</div>' +
                '<div class="bunker-terminal" id="bunker-term">' +
                    '<div class="term-line">root@sigint-den-haag:~$ <span class="bunker-cursor"></span></div>' +
                    '<div class="term-line">&gt; INITIALIZING ZERFALL MONITORING GRID...</div>' +
                    '<div class="term-line">&gt; SCANNING FREQ RANGE: 0.1 MHz &mdash; 24.000 GHz</div>' +
                    '<div class="term-line">&gt; LOFAR ARRAY: <span class="term-highlight">ONLINE</span> &nbsp;[50,412 ANTENNAS]</div>' +
                    '<div class="term-line">&gt; WSRT ARRAY:  <span class="term-highlight">ONLINE</span> &nbsp;[14 DISHES]</div>' +
                    '<div class="term-line">&gt; AI ANOMALY ENGINE: <span class="term-highlight">ACTIVE</span></div>' +
                    '<div class="term-line">&nbsp;</div>' +
                    '<div class="term-line term-warning">&#9888;  FLAGGED SUBJECT &mdash; DOSSIER #VK-7291</div>' +
                    '<div class="term-line term-classified">&nbsp;&nbsp; NAME:   WEYLANT, RYAN</div>' +
                    '<div class="term-line term-classified">&nbsp;&nbsp; LOC:    52.7924&deg;N, 7.0281&deg;E &mdash; COMPASCUUM</div>' +
                    '<div class="term-line term-classified">&nbsp;&nbsp; STATUS: ACTIVE MONITORING</div>' +
                    '<div class="term-line term-classified">&nbsp;&nbsp; THREAT: <span class="term-warning">UNDETERMINED</span></div>' +
                    '<div class="term-line">&nbsp;</div>' +
                    '<div class="term-line term-warning">&#9888;  INCOMING ANOMALY &mdash; 14.230 MHz</div>' +
                    '<div class="term-line term-warning">&#9888;  SSTV BURST &mdash; UNSCHEDULED &mdash; ORIGIN: UNKNOWN</div>' +
                    '<div class="term-line">&nbsp;</div>' +
                    '<div class="term-line">root@sigint-den-haag:~$ INITIATING COUNTERMEASURES...<span class="bunker-cursor"></span></div>' +
                '</div>' +
                '<div class="bunker-stamp" id="bunker-stamp">GEHEIM</div>' +
            '</div>' +

            '<!-- ACT 3: BASED ON CARD -->' +
            '<div class="cine-scene scene-based" id="scene-3">' +
                '<div class="based-text" id="based-text">' +
                    'BASED ON <span class="based-accent">ACTUAL TECHNOLOGY</span><br>' +
                    'DEVELOPED IN THE <span class="based-accent">PROVINCE OF DRENTHE</span>' +
                '</div>' +
            '</div>' +

            '<!-- ACT 4: LOCATION / DATE -->' +
            '<div class="cine-scene scene-location" id="scene-4">' +
                '<div class="loc-text" id="loc-region">THE NETHERLANDS</div>' +
                '<div class="loc-sep" id="loc-sep"></div>' +
                '<div class="loc-place" id="loc-place">COMPASCUUM</div>' +
                '<div class="loc-sep" id="loc-sep2"></div>' +
                '<div class="loc-text" id="loc-prov">PROVINCE OF DRENTHE</div>' +
                '<div class="loc-date" id="loc-date">FEBRUARY 9, 2026 &nbsp;|&nbsp; 07 : 45</div>' +
            '</div>' +

            '<!-- ACT 5: AERIAL DRENTHE -->' +
            '<div class="cine-scene scene-aerial" id="scene-5">' +
                '<div class="aerial-stars" id="aerial-stars"></div>' +
                '<div class="aerial-horizon"></div>' +
                '<div class="aerial-ground"></div>' +
                '<div class="aerial-dishes" id="aerial-dishes">' +
                    '<div class="dish"></div><div class="dish"></div><div class="dish"></div>' +
                    '<div class="dish"></div><div class="dish"></div><div class="dish"></div>' +
                    '<div class="dish"></div>' +
                '</div>' +
                '<div class="aerial-text" id="aerial-text">' +
                    '<p>The province everyone forgets.</p>' +
                    '<p>Quiet heathlands to the horizon. Ancient dolmens. Narrow canals reflecting the first light of dawn.</p>' +
                    '<p class="emphasis">But beneath this surface lies something extraordinary.</p>' +
                    '<p>Hidden in these fields: the Westerbork Telescope. LOFAR\'s 50,000 antennas. Listening posts that pierce the cosmos itself.</p>' +
                '</div>' +
            '</div>' +

            '<!-- ACT 6: TURBINES -->' +
            '<div class="cine-scene scene-turbines" id="scene-6">' +
                '<div class="turbine-row" id="turbine-row">' + turbinesHTML + '</div>' +
                '<div class="turbine-text" id="turbine-text">' +
                    '<p>Bluetooth. WiFi mesh networks. 5G beam-forming algorithms.</p>' +
                    '<p>Technology connecting five billion devices worldwide &mdash;</p>' +
                    '<p>all rooted in these forgotten northern fields.</p>' +
                '</div>' +
            '</div>' +

            '<!-- ACT 7: MEET RYAN -->' +
            '<div class="cine-scene scene-ryan" id="scene-7">' +
                '<div class="ryan-name" id="ryan-name">RYAN WEYLANT</div>' +
                '<div class="ryan-tagline" id="ryan-tagline">SOFTWARE ARCHITECT &nbsp;&middot;&nbsp; RADIO SPECIALIST &nbsp;&middot;&nbsp; HACKER</div>' +
                '<div class="ryan-details" id="ryan-details">' +
                    '<p>Age 55. A man who never met a signal he couldn\'t decode.</p>' +
                    '<p>A puzzle he couldn\'t solve. A system he couldn\'t break.</p>' +
                    '<p>Home: a white farmhouse by the canal. Partner: Ies.<br>Three rescue dogs &mdash; Tino, Kessy, and ET the pug.</p>' +
                    '<p class="glow">When the brightest minds face impossible problems, they call Ryan.</p>' +
                '</div>' +
            '</div>' +

            '<!-- ACT 8: ARSENAL -->' +
            '<div class="cine-scene scene-mancave" id="scene-8">' +
                '<div class="mc-hud-ring"></div>' +
                '<div class="mc-hud-ring"></div>' +
                '<div class="mc-title" id="mc-title">HIS ARSENAL</div>' +
                '<div class="mc-grid" id="mc-grid">' +
                    '<div class="mc-item">HACKRF ONE</div>' +
                    '<div class="mc-item">FLIPPER ZERO</div>' +
                    '<div class="mc-item">WIFI PINEAPPLE</div>' +
                    '<div class="mc-item">MESHTASTIC</div>' +
                    '<div class="mc-item">SSTV TERMINAL</div>' +
                    '<div class="mc-item">3D PRINTERS</div>' +
                    '<div class="mc-item">OSCILLOSCOPE</div>' +
                    '<div class="mc-item">LORA NODES</div>' +
                '</div>' +
                '<div class="mc-subtitle" id="mc-subtitle">' +
                    'His network: the nation\'s sharpest minds &mdash;<br>' +
                    '<span style="color:#00ffff">Dr. David Prinsloo</span> &middot; TU Eindhoven &nbsp;|&nbsp; ' +
                    '<span style="color:#00ffff">Cees Bassa</span> &middot; ASTRON &nbsp;|&nbsp; ' +
                    '<span style="color:#00ffff">Jaap Haartsen</span> &middot; Inventor of Bluetooth' +
                '</div>' +
            '</div>' +

            '<!-- ACT 9: THE THREAT -->' +
            '<div class="cine-scene scene-threat" id="scene-9">' +
                '<div class="threat-pulse" id="threat-pulse"></div>' +
                '<div class="threat-text" id="threat-text">' +
                    '<p class="t-sinister">Deep beneath The Hague, in a bunker that doesn\'t officially exist &mdash;</p>' +
                    '<p class="t-sinister">Screens glow in the darkness. AI systems scan every frequency. Every transmission. Every anomaly.</p>' +
                    '<p class="t-sinister">People in dark suits have protocols. Response teams on standby. Methods that leave no trace.</p>' +
                    '<p class="t-warn">In eighteen minutes, everything changes.</p>' +
                    '<p class="t-warn">A transmission that shouldn\'t exist. Encrypted with algorithms no civilian should possess.</p>' +
                    '<p class="t-gold">A conspiracy at the highest levels of power. A secret nations have killed to protect.</p>' +
                    '<p class="t-defiant">But they don\'t know about Ryan Weylant.</p>' +
                    '<p class="t-gold">They don\'t know what he\'s capable of when pushed.</p>' +
                    '<p class="t-gold">They\'ve just made their last mistake.</p>' +
                '</div>' +
            '</div>' +

            '<!-- ACT 10: TITLE REVEAL -->' +
            '<div class="cine-scene scene-title" id="scene-10">' +
                '<div class="title-ring" id="title-ring"></div>' +
                '<div class="title-flare" id="title-flare"></div>' +
                '<div class="title-main" id="title-main">CYBERQUEST</div>' +
                '<div class="title-line" id="title-line"></div>' +
                '<div class="title-sub" id="title-sub">OPERATION ZERFALL</div>' +
                '<div class="title-tagline" id="title-tagline">The truth is hidden in the signal.</div>' +
                '<div class="title-begin" id="title-begin">&#9654; &nbsp; CLICK TO BEGIN YOUR MISSION &nbsp; &#9664;</div>' +
            '</div>';

        document.body.appendChild(cine);

        // ─────────────────────────────────────────────────────────
        // PARTICLE SYSTEM (with connection lines)
        // ─────────────────────────────────────────────────────────
        const canvas = document.getElementById('cine-particles');
        const ctx = canvas.getContext('2d');
        let particles = [];
        function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        resizeCanvas();
        const resizeHandler = () => { resizeCanvas(); resizeWf(); };
        window.addEventListener('resize', resizeHandler);

        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.25,
                vy: -Math.random() * 0.3 - 0.05,
                size: Math.random() * 1.5 + 0.4,
                alpha: Math.random() * 0.25 + 0.03
            });
        }
        let particlesRunning = true;
        let particleColor = [0, 255, 255];

        function animateParticles() {
            if (!particlesRunning) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const [r,g,b] = particleColor;
            // Connection lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.04 * (1 - dist/120)) + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + p.alpha + ')';
                ctx.fill();
            });
            self._animFrameId = requestAnimationFrame(animateParticles);
        }
        animateParticles();

        // ─────────────────────────────────────────────────────────
        // WAVEFORM CANVAS (bunker scene)
        // ─────────────────────────────────────────────────────────
        const wfCanvas = document.getElementById('cine-waveform');
        const wfCtx = wfCanvas.getContext('2d');
        let waveformActive = false;
        let wfPhase = 0;
        function resizeWf() { wfCanvas.width = window.innerWidth; wfCanvas.height = window.innerHeight; }
        resizeWf();

        function drawWaveform() {
            if (!waveformActive) { wfCtx.clearRect(0, 0, wfCanvas.width, wfCanvas.height); return; }
            wfCtx.clearRect(0, 0, wfCanvas.width, wfCanvas.height);
            const w = wfCanvas.width, h = wfCanvas.height;
            const cy = h * 0.85;
            wfCtx.beginPath();
            wfCtx.moveTo(0, cy);
            for (let x = 0; x < w; x++) {
                const nx = x / w;
                const y = cy +
                    Math.sin(nx * 30 + wfPhase) * 8 +
                    Math.sin(nx * 60 + wfPhase * 1.7) * 4 +
                    Math.sin(nx * 120 + wfPhase * 3.2) * 2 +
                    (Math.random() - 0.5) * 3;
                wfCtx.lineTo(x, y);
            }
            wfCtx.strokeStyle = 'rgba(0,255,65,0.15)';
            wfCtx.lineWidth = 1;
            wfCtx.stroke();
            // Second trace
            wfCtx.beginPath();
            wfCtx.moveTo(0, cy);
            for (let x = 0; x < w; x++) {
                const nx = x / w;
                const y = cy +
                    Math.sin(nx * 25 + wfPhase * 0.8 + 1) * 6 +
                    Math.sin(nx * 80 + wfPhase * 2.3) * 3 +
                    (Math.random() - 0.5) * 2;
                wfCtx.lineTo(x, y);
            }
            wfCtx.strokeStyle = 'rgba(0,255,255,0.08)';
            wfCtx.stroke();
            wfPhase += 0.04;
            requestAnimationFrame(drawWaveform);
        }

        // ─────────────────────────────────────────────────────────
        // STARS
        // ─────────────────────────────────────────────────────────
        const starsContainer = document.getElementById('aerial-stars');
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'aerial-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 55 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            const sz = Math.random() * 2 + 0.5;
            star.style.width = sz + 'px';
            star.style.height = sz + 'px';
            starsContainer.appendChild(star);
        }

        // ─────────────────────────────────────────────────────────
        // FX HELPERS
        // ─────────────────────────────────────────────────────────
        function triggerFlash() {
            const f = document.getElementById('cine-flash');
            if (f) { f.classList.remove('fire'); void f.offsetWidth; f.classList.add('fire'); }
        }
        function triggerGlitch() {
            const container = document.getElementById('cinematic-intro');
            if (!container) return;
            for (let i = 0; i < 4; i++) {
                const bar = document.createElement('div');
                bar.className = 'cine-glitch-bar';
                bar.style.top = Math.random() * 100 + '%';
                bar.style.opacity = '0.3';
                bar.style.background = Math.random() > 0.5
                    ? 'rgba(0,255,255,0.25)' : 'rgba(255,0,0,0.25)';
                container.appendChild(bar);
                setTimeout(function() { bar.remove(); }, 80 + Math.random() * 100);
            }
        }
        function triggerShake() {
            const c = document.getElementById('cinematic-intro');
            if (c) { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }
        }
        function updateProgress(act) {
            document.querySelectorAll('.cine-dot').forEach(function(d) {
                const a = parseInt(d.dataset.act);
                d.classList.toggle('active', a === act);
                d.classList.toggle('done', a < act);
            });
        }

        // ─────────────────────────────────────────────────────────
        // SEQUENCER
        // ─────────────────────────────────────────────────────────
        let currentAct = -1;
        let finished = false;

        const actDurations = [
            1500,   // 0: black hold
            4000,   // 1: production card
            12000,  // 2: bunker
            4000,   // 3: based on
            5000,   // 4: location/date
            11000,  // 5: aerial
            8000,   // 6: turbines
            10000,  // 7: ryan
            9000,   // 8: arsenal
            14000,  // 9: threat
            0       // 10: title (waits)
        ];

        function showAct(n) {
            if (n < 0 || n >= totalActs || finished) return;
            currentAct = n;
            self._setDroneForAct(n);
            updateProgress(n);

            // Deactivate all
            document.querySelectorAll('.cine-scene').forEach(function(s) {
                s.classList.remove('active', 'kb-zoom', 'kb-zoom-out');
                s.classList.add('fade-out');
            });

            // Transition FX
            if (n > 0) {
                triggerFlash();
                if (n !== 1 && n !== 3) triggerGlitch();
                self._playStatic(0.15);
            }

            // Letterbox bars from act 2 onward
            if (n >= 2) {
                document.getElementById('cbar-top')?.classList.add('active');
                document.getElementById('cbar-bot')?.classList.add('active');
            }
            // Progress dots from act 1
            if (n >= 1) document.getElementById('cine-progress')?.classList.add('visible');

            // Particle color per act
            var colorMap = {
                0:[0,255,255], 1:[255,255,255], 2:[0,255,65], 3:[255,255,255],
                4:[100,180,220], 5:[80,150,220], 6:[150,170,200],
                7:[255,215,0], 8:[0,255,255], 9:[255,50,50], 10:[0,255,255]
            };
            particleColor = colorMap[n] || [0,255,255];

            var delay = n > 0 ? 250 : 0;
            self._schedule(function() {
                var scene = document.getElementById('scene-' + n);
                if (!scene) return;
                scene.classList.remove('fade-out');
                scene.classList.add('active');

                // Ken Burns on landscape acts
                if (n === 5 || n === 6) scene.classList.add('kb-zoom');
                if (n === 7) scene.classList.add('kb-zoom-out');

                // Per-act reveals
                var reveals = {
                    0: revealBlack, 1: revealProduction, 2: revealBunker,
                    3: revealBased, 4: revealLocation, 5: revealAerial,
                    6: revealTurbines, 7: revealRyan, 8: revealMancave,
                    9: revealThreat, 10: revealTitle
                };
                if (reveals[n]) reveals[n]();

                // Auto-advance
                if (actDurations[n] > 0) {
                    self._schedule(function() { showAct(n + 1); }, actDurations[n]);
                }
            }, delay);
        }

        // ─────────────────────────────────────────────────────────
        // PER-ACT REVEALS
        // ─────────────────────────────────────────────────────────
        function revealBlack() { /* silence */ }

        function revealProduction() {
            self._schedule(function() {
                document.getElementById('prod-1')?.classList.add('visible');
                document.getElementById('prod-line')?.classList.add('visible');
                document.getElementById('prod-2')?.classList.add('visible');
                document.getElementById('prod-line2')?.classList.add('visible');
                document.getElementById('prod-3')?.classList.add('visible');
            }, 300);
            self._schedule(function() {
                document.querySelectorAll('.prod-text').forEach(function(el) { el.classList.add('fade'); });
            }, 3200);
        }

        function revealBunker() {
            waveformActive = true;
            drawWaveform();
            document.getElementById('bunker-time')?.classList.add('visible');
            // Running clock
            var clockEl = document.getElementById('bunker-time');
            var sec = 14;
            var clockInterval = setInterval(function() {
                if (finished || currentAct !== 2) { clearInterval(clockInterval); return; }
                sec++;
                if (sec >= 60) sec = 0;
                if (clockEl) clockEl.textContent = '07:27:' + String(sec).padStart(2, '0') + ' CET';
            }, 1000);
            self._intervalIds.push(clockInterval);

            var lines = document.querySelectorAll('#bunker-term .term-line');
            lines.forEach(function(line, i) {
                self._schedule(function() {
                    line.classList.add('typed');
                    self._playTypeTick();
                }, 300 + i * 550);
            });
            // Stamp slam
            self._schedule(function() {
                var stamp = document.getElementById('bunker-stamp');
                if (stamp) stamp.classList.add('visible');
                self._playImpact();
                triggerFlash();
                triggerShake();
            }, 300 + lines.length * 550 + 300);
        }

        function revealBased() {
            waveformActive = false;
            self._schedule(function() {
                document.getElementById('based-text')?.classList.add('visible');
            }, 400);
        }

        function revealLocation() {
            self._schedule(function() {
                ['loc-region','loc-sep','loc-place','loc-sep2','loc-prov','loc-date'].forEach(function(id) {
                    document.getElementById(id)?.classList.add('visible');
                });
                self._playImpact();
            }, 200);
        }

        function revealAerial() {
            var paras = document.querySelectorAll('#aerial-text p');
            paras.forEach(function(p, i) {
                self._schedule(function() { p.classList.add('visible'); }, 500 + i * 2200);
            });
            self._schedule(function() {
                document.getElementById('aerial-dishes')?.classList.add('visible');
            }, 800);
        }

        function revealTurbines() {
            self._schedule(function() {
                document.getElementById('turbine-row')?.classList.add('visible');
            }, 200);
            var paras = document.querySelectorAll('#turbine-text p');
            paras.forEach(function(p, i) {
                self._schedule(function() { p.classList.add('visible'); }, 700 + i * 2000);
            });
        }

        function revealRyan() {
            self._schedule(function() {
                document.getElementById('ryan-name')?.classList.add('visible');
                self._playImpact();
            }, 200);
            self._schedule(function() {
                document.getElementById('ryan-tagline')?.classList.add('visible');
            }, 700);
            var paras = document.querySelectorAll('#ryan-details p');
            paras.forEach(function(p, i) {
                self._schedule(function() { p.classList.add('visible'); }, 1400 + i * 1800);
            });
        }

        function revealMancave() {
            self._schedule(function() {
                document.getElementById('mc-title')?.classList.add('visible');
            }, 200);
            var items = document.querySelectorAll('#mc-grid .mc-item');
            items.forEach(function(item, i) {
                self._schedule(function() {
                    item.classList.add('visible');
                    self._playTypeTick();
                }, 500 + i * 400);
            });
            self._schedule(function() {
                document.getElementById('mc-subtitle')?.classList.add('visible');
            }, 500 + items.length * 400 + 400);
        }

        function revealThreat() {
            var pulse = document.getElementById('threat-pulse');
            if (pulse) pulse.classList.add('beating');

            var hbCount = 0;
            var hbInterval = setInterval(function() {
                if (finished || currentAct !== 9 || hbCount > 11) { clearInterval(hbInterval); return; }
                self._playHeartbeat();
                hbCount++;
            }, 1100);
            self._intervalIds.push(hbInterval);

            var paras = document.querySelectorAll('#threat-text p');
            paras.forEach(function(p, i) {
                self._schedule(function() {
                    p.classList.add('visible');
                    if (p.classList.contains('t-defiant')) {
                        triggerFlash();
                        triggerGlitch();
                        triggerShake();
                        self._playImpact();
                    }
                    if (p.classList.contains('t-warn') && i === 3) {
                        triggerShake();
                    }
                }, 400 + i * 1350);
            });
        }

        function revealTitle() {
            self._playTitleReveal();

            self._schedule(function() {
                var ring = document.getElementById('title-ring');
                if (ring) ring.classList.add('burst');
            }, 1400);
            self._schedule(function() {
                var flare = document.getElementById('title-flare');
                if (flare) flare.classList.add('active');
            }, 1500);
            self._schedule(function() {
                document.getElementById('title-main')?.classList.add('visible');
                triggerFlash();
                triggerShake();
            }, 1500);
            self._schedule(function() {
                document.getElementById('title-line')?.classList.add('visible');
                document.getElementById('title-sub')?.classList.add('visible');
            }, 1800);
            self._schedule(function() {
                document.getElementById('title-tagline')?.classList.add('visible');
            }, 2600);
            self._schedule(function() {
                document.getElementById('title-begin')?.classList.add('visible');
            }, 3500);
        }

        // ─────────────────────────────────────────────────────────
        // CLEANUP
        // ─────────────────────────────────────────────────────────
        function cleanupAndContinue() {
            if (finished) return;
            finished = true;
            particlesRunning = false;
            waveformActive = false;
            self._clearTimeouts();
            self._stopAudio();
            window.removeEventListener('resize', resizeHandler);

            var c = document.getElementById('cinematic-intro');
            if (c) {
                // Slow 3s fade-out of the cinematic overlay to reveal the bg
                c.style.transition = 'opacity 3s ease-in-out';
                c.style.opacity = '0';

                // Make the scene background fade in nicely
                var sceneBg = document.getElementById('scene-background');
                if (sceneBg) {
                    sceneBg.style.opacity = '0';
                    sceneBg.style.transition = 'opacity 3s ease-in-out';
                    setTimeout(function() { sceneBg.style.opacity = '1'; }, 100);
                }

                setTimeout(function() {
                    c.remove();
                    document.getElementById('intro-cinematic-style')?.remove();
                    // Keep Ryan hidden — first appearance is the home scene
                    game.voiceEnabled = originalVoiceState;

                    // Hold on the background for 10 seconds before continuing
                    setTimeout(function() {
                        if (charactersContainer) charactersContainer.style.display = '';
                        game.loadScene('home');
                    }, 10000);
                }, 3200);
            }
        }

        // ─────────────────────────────────────────────────────────
        // INPUT
        // ─────────────────────────────────────────────────────────
        cine.addEventListener('click', function(e) {
            if (self._audioCtx && self._audioCtx.state === 'suspended') {
                self._audioCtx.resume();
            }
            if (e.target.id === 'cine-skip') return;
            if (currentAct === totalActs - 1) {
                cleanupAndContinue();
            } else {
                self._clearTimeouts();
                showAct(currentAct + 1);
            }
        });

        document.getElementById('cine-skip')?.addEventListener('click', function(e) {
            e.stopPropagation();
            cleanupAndContinue();
        });

        // ─────────────────────────────────────────────────────────
        // START THE SHOW
        // ─────────────────────────────────────────────────────────
        self._schedule(function() { showAct(0); }, 300);
    },

    /* ════════════════════════════════════════════════════════════
       ON EXIT
       ════════════════════════════════════════════════════════════ */
    onExit(game) {
        this._clearTimeouts();
        this._stopAudio();
        document.getElementById('cinematic-intro')?.remove();
        document.getElementById('intro-cinematic-style')?.remove();
        // Legacy cleanup
        document.getElementById('intro-scroll')?.remove();
        document.getElementById('intro-scroll-style')?.remove();
        document.getElementById('intro-bg-prompt')?.remove();
        document.getElementById('intro-prompt-style')?.remove();

        var cc = document.getElementById('scene-characters');
        if (cc) cc.style.display = '';
    }
};

// Register
if (typeof window.game !== 'undefined') {
    window.game.registerScene(IntroScene);
}