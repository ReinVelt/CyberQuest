/**
 * Planetenpad Scene — Cinematic Walking Experience
 * A 1 km walking path from the outer planets to a sun model near WSRT.
 *
 * Hollywood-style immersive scene: the player physically walks the path
 * through multi-phase cinematic sequences with environmental narration,
 * ambient soundscapes, parallax zoom, and atmospheric overlays.
 *
 * Scale: approximately 1:6,000,000,000 (1 cm ≈ 60,000 km)
 *   - Sun model: ~23 cm diameter (beach ball sized)
 *   - Earth: ~2 mm (peppercorn)
 *   - Jupiter: ~24 mm (walnut)
 *
 * Reached from: wsrt_parking → planetenpad
 * Exits: back to parking, or forward to WSRT
 */

const PlanetenpadScene = {
    id: 'planetenpad',
    name: 'Planetenpad',

    background: 'assets/images/scenes/planetenpad.svg',

    description: 'A walking path through the Drenthe heath. Planet models on pedestals line the trail, growing closer together as you approach the distant Sun model.',

    playerStart: { x: 8, y: 88 },

    // 🎬 Accessibility / Movie Mode — skip the walking cinematic, then continue to WSRT
    accessibilityPath: [
        async function(game) {
            // Fast-skip the cinematic walk in movie mode
            if (window.PlanetenpadScene && window.PlanetenpadScene._cinematicActive) {
                window.PlanetenpadScene._skipCinematic();
                await game.wait(2000);
            }
        },
        'continue_to_wsrt',
    ],

    idleThoughts: [
        "A model of the solar system at walking scale. My inner nerd is happy.",
        "Hard to believe Neptune is a full 750 metres from the Sun model.",
        "The heather crunches underfoot. Quiet out here.",
        "If the Sun is 23 centimetres, then Alpha Centauri would be 6,800 kilometres away.",
        "Pluto got demoted in 2006. But it still has a marker here.",
        "WSRT dishes visible at the end of the path. Science everywhere.",
        "Educational walking routes. Very Dutch. Very wholesome.",
        "At this scale, Voyager 1 would be about 3.5 kilometres from here.",
    ],

    _timeoutIds: [],
    _intervalIds: [],
    _animFrameId: null,
    _audioCtx: null,
    _audioNodes: [],
    _overlay: null,
    _cinematicActive: false,

    // ═══════════════════════════════════════════════
    //  Planet data (for educational dialogue)
    // ═══════════════════════════════════════════════
    _planets: {
        pluto:   { name: 'Pluto',   emoji: '⚪', dist: '985 m', real: '5.9 billion km', size: '0.4 mm', fact: 'Demoted to dwarf planet in 2006. But at this distance from the Sun model, you really feel how far out it orbits.' },
        neptune: { name: 'Neptune', emoji: '🔵', dist: '750 m', real: '4.5 billion km', size: '0.8 mm', fact: 'Neptune was discovered mathematically before it was seen through a telescope. Urbain Le Verrier predicted its position from irregularities in the orbit of Uranus.' },
        uranus:  { name: 'Uranus',  emoji: '🔵', dist: '480 m', real: '2.9 billion km', size: '0.8 mm', fact: 'Uranus rotates on its side — its axis is tilted 98 degrees. It essentially rolls around the Sun like a ball. Probably caused by a massive collision early in the solar system.' },
        saturn:  { name: 'Saturn',  emoji: '🪐', dist: '238 m', real: '1.4 billion km', size: '1.9 cm', fact: 'Saturn\'s density is less than water. If you had a bathtub big enough, it would float. Its rings are mostly ice particles, some as small as grains of sand, others as large as houses.' },
        jupiter: { name: 'Jupiter', emoji: '🟠', dist: '130 m', real: '778 million km',  size: '2.4 cm', fact: 'Jupiter is so massive that it doesn\'t orbit the Sun — the Sun and Jupiter orbit a shared centre of gravity (barycenter) that lies just outside the Sun\'s surface.' },
        mars:    { name: 'Mars',    emoji: '🔴', dist: '38 m',  real: '228 million km',  size: '1.1 mm', fact: 'Mars has the tallest volcano in the solar system — Olympus Mons, 22 km high. Nearly three times the height of Everest.' },
        earth:   { name: 'Earth',   emoji: '🌍', dist: '25 m',  real: '150 million km',  size: '2.1 mm', fact: 'At this scale, the Moon would be 6.4 centimetres from Earth. And the International Space Station would orbit just 0.07 millimetres above the surface.' },
        venus:   { name: 'Venus',   emoji: '🟡', dist: '18 m',  real: '108 million km',  size: '2.0 mm', fact: 'Venus rotates backwards compared to most planets — the Sun rises in the west. A day on Venus is longer than its year: 243 Earth days to rotate once, 225 to orbit the Sun.' },
        mercury: { name: 'Mercury', emoji: '⚫', dist: '10 m',  real: '58 million km',   size: '0.8 mm', fact: 'Mercury has no atmosphere and temperatures swing from -180°C at night to 430°C during the day. Despite being closest to the Sun, it\'s not the hottest planet — Venus holds that record due to its greenhouse effect.' },
    },

    // ═══════════════════════════════════════════════
    //  Walking phases — the cinematic walk-through
    //  Each phase positions player along the path
    //  and triggers narration + environmental detail
    // ═══════════════════════════════════════════════
    _walkPhases: [
        // Phase 0: Entrance — Pluto & the outer darkness
        {
            playerTarget: { x: 8, y: 88 },
            bgZoom: 1.0, bgOffsetX: 0, bgOffsetY: 0,
            narration: [
                { speaker: 'Narrator', text: '*A narrow sandy path winds through the Drenthe heathland. A wooden sign at the trailhead reads:*' },
                { speaker: 'Narrator', text: '*PLANETENPAD — Schaalmodel van ons Zonnestelsel — Wandel van Pluto naar de Zon — 1 kilometer*' },
                { speaker: 'Narrator', text: '*The air smells of warm heather and pine resin. A skylark trills somewhere overhead.*' },
            ]
        },
        // Phase 1: Walk to Pluto marker
        {
            playerTarget: { x: 12, y: 86 },
            bgZoom: 1.05, bgOffsetX: -2, bgOffsetY: -1,
            narration: [
                { speaker: 'Narrator', text: '*A few steps in. The first pedestal appears — barely visible. A tiny sphere, smaller than a grain of rice.*' },
                { speaker: 'Narrator', text: '*A green information board reads: PLUTO — 985 m van de Zon*' },
            ]
        },
        // Phase 2: Walking the outer void — Neptune
        {
            playerTarget: { x: 22, y: 82 },
            bgZoom: 1.08, bgOffsetX: -6, bgOffsetY: -3,
            narration: [
                { speaker: 'Narrator', text: '*The heather stretches out on both sides. Purple blooms sway gently in the wind. Birch trees rustle overhead.*' },
                { speaker: 'Narrator', text: '*After a long stretch of empty path, another pedestal. A blue-tinted sphere.*' },
                { speaker: 'Narrator', text: '*🔵 NEPTUNE — 750 m from the Sun*' },
            ]
        },
        // Phase 3: Uranus & the swaying heather
        {
            playerTarget: { x: 30, y: 78 },
            bgZoom: 1.10, bgOffsetX: -10, bgOffsetY: -5,
            narration: [
                { speaker: 'Narrator', text: '*The path curves slightly. A butterfly drifts past, orange wings catching the light.*' },
                { speaker: 'Narrator', text: '*Another pedestal emerges from the waist-high heather.*' },
                { speaker: 'Narrator', text: '*🔵 URANUS — 480 m from the Sun*' },
            ]
        },
        // Phase 4: Saturn — the showpiece
        {
            playerTarget: { x: 40, y: 73 },
            bgZoom: 1.15, bgOffsetX: -15, bgOffsetY: -8,
            narration: [
                { speaker: 'Narrator', text: '*The gaps between planets are shrinking. A Scots pine towers beside the path, its trunk rough with bark.*' },
                { speaker: 'Narrator', text: '*A golden sphere with delicate rings — the most detailed model on the path.*' },
                { speaker: 'Narrator', text: '*🪐 SATURN — 238 m from the Sun*' },
            ]
        },
        // Phase 5: The sundial & Jupiter
        {
            playerTarget: { x: 52, y: 68 },
            bgZoom: 1.20, bgOffsetX: -22, bgOffsetY: -12,
            narration: [
                { speaker: 'Narrator', text: '*A stone sundial is set beside the path. The gnomon casts a sharp shadow across roman numerals.*' },
                { speaker: 'Narrator', text: '*Further along — the largest planet model. About the size of a walnut, with painted bands.*' },
                { speaker: 'Narrator', text: '*🟠 JUPITER — 130 m from the Sun*' },
            ]
        },
        // Phase 6: Gravity experiment & the wooden bench
        {
            playerTarget: { x: 58, y: 65 },
            bgZoom: 1.22, bgOffsetX: -26, bgOffsetY: -14,
            narration: [
                { speaker: 'Narrator', text: '*An interactive panel stands between the gas giants and inner planets. A spring scale with planet-marked indicators.*' },
                { speaker: 'Narrator', text: '*🔬 EXPERIMENT: HOW MUCH DO YOU WEIGH ON OTHER PLANETS?*' },
                { speaker: 'Narrator', text: '*A weathered wooden bench offers a view across the entire path. Ryan pauses.*' },
            ]
        },
        // Phase 7: Mars, Earth, Venus, Mercury — the inner rush
        {
            playerTarget: { x: 72, y: 62 },
            bgZoom: 1.30, bgOffsetX: -34, bgOffsetY: -18,
            narration: [
                { speaker: 'Narrator', text: '*Now the planets come fast. Mars — a red pinhead. Earth — two millimetres of blue-green.*' },
                { speaker: 'Narrator', text: '*Venus — yellowish, almost identical to Earth in size. Mercury — a dark speck with craters.*' },
            ]
        },
        // Phase 8: Light speed experiment
        {
            playerTarget: { x: 80, y: 62 },
            bgZoom: 1.35, bgOffsetX: -40, bgOffsetY: -20,
            narration: [
                { speaker: 'Narrator', text: '*An information panel with LED strips along the ground.*' },
                { speaker: 'Narrator', text: '*🔬 EXPERIMENT: HOW FAST IS LIGHT? — At this scale, light travels 5 cm per second.*' },
            ]
        },
        // Phase 9: The Sun — arrival
        {
            playerTarget: { x: 88, y: 62 },
            bgZoom: 1.40, bgOffsetX: -48, bgOffsetY: -22,
            narration: [
                { speaker: 'Narrator', text: '*At the end of the path — a bright golden sphere on a sturdy pedestal. About the size of a beach ball. It seems to glow in the afternoon light.*' },
                { speaker: 'Narrator', text: '*☀️ THE SUN — diameter 23 cm | Real: 1,392,000 km — 99.86% of all mass in the solar system.*' },
                { speaker: 'Narrator', text: '*Beyond the sun model, the WSRT dishes are visible through the trees — 14 parabolic ears listening to the void of space this path just walked through.*' },
            ]
        },
    ],

    // ═══════════════════════════════════════════════
    //  INTERNAL HELPERS
    // ═══════════════════════════════════════════════

    _clearTimeouts() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        (this._intervalIds || []).forEach(id => clearInterval(id));
        this._intervalIds = [];
        if (this._animFrameId) { cancelAnimationFrame(this._animFrameId); this._animFrameId = null; }
    },

    _schedule(fn, ms) {
        const id = setTimeout(fn, ms);
        this._timeoutIds.push(id);
        return id;
    },

    // ═══════════════════════════════════════════════
    //  AUDIO ENGINE — ambient outdoor soundscape
    // ═══════════════════════════════════════════════

    _initAudio() {
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            const ctx = new AC();
            this._audioCtx = ctx;

            // Master gain
            const master = ctx.createGain();
            master.gain.value = 0.25;
            master.connect(ctx.destination);
            this._masterGain = master;

            // Wind — filtered noise
            this._startWind(ctx, master);

        } catch(e) { console.warn('Planetenpad audio init failed:', e); }
    },

    _startWind(ctx, master) {
        const bufSize = ctx.sampleRate * 4;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1);

        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.8;

        const windGain = ctx.createGain();
        windGain.gain.value = 0;
        windGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 4);

        noise.connect(filter);
        filter.connect(windGain);
        windGain.connect(master);
        noise.start();

        this._windGain = windGain;
        this._windFilter = filter;
        this._audioNodes.push(noise);

        // Gentle wind modulation
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15;
        lfoGain.gain.value = 60;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        this._audioNodes.push(lfo);
    },

    _playFootstep() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx;
        const t = ctx.currentTime;

        // Crunch on sand/gravel
        const n = ctx.createBufferSource();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        n.buffer = buf;

        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = 1200 + Math.random() * 800;
        f.Q.value = 0.6;

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.08 + Math.random() * 0.04, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        n.connect(f);
        f.connect(g);
        g.connect(this._masterGain);
        n.start(t);
    },

    _playBirdChirp() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx;
        const t = ctx.currentTime;

        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        const baseFreq = 2000 + Math.random() * 2000;
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.linearRampToValueAtTime(baseFreq * (0.8 + Math.random() * 0.5), t + 0.06);
        osc.frequency.linearRampToValueAtTime(baseFreq * (0.9 + Math.random() * 0.3), t + 0.12);
        g.gain.setValueAtTime(0.03, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(g);
        g.connect(this._masterGain);
        osc.start(t);
        osc.stop(t + 0.2);
    },

    _stopAudio() {
        try {
            if (this._windGain && this._audioCtx) {
                this._windGain.gain.linearRampToValueAtTime(0, this._audioCtx.currentTime + 1);
            }
            setTimeout(() => {
                this._audioNodes.forEach(n => { try { n.stop(); } catch(e){} });
                this._audioNodes = [];
                if (this._audioCtx) { this._audioCtx.close().catch(()=>{}); this._audioCtx = null; }
            }, 1200);
        } catch(e) {}
    },

    // ═══════════════════════════════════════════════
    //  CINEMATIC OVERLAY — immersive walking UI
    // ═══════════════════════════════════════════════

    _injectCinematicStyles() {
        if (document.getElementById('planetenpad-cinematic-style')) return;
        const style = document.createElement('style');
        style.id = 'planetenpad-cinematic-style';
        style.textContent = `
/* Planetenpad cinematic letterbox */
.pp-bar {
    position: fixed; left: 0; right: 0; background: #000; z-index: 10001;
    transition: height 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
}
.pp-bar-top { top: 0; height: 0; }
.pp-bar-bot { bottom: 0; height: 0; }
.pp-bar.active { height: 6vh; }

/* Walking narration overlay */
.pp-narration {
    position: fixed; bottom: 8vh; left: 5vw; right: 5vw; z-index: 10005;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: clamp(0.85em, 1.8vw, 1.15em);
    line-height: 1.7; color: #e8e8e0;
    text-shadow: 0 2px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5);
    text-align: center;
    opacity: 0; transition: opacity 0.8s ease;
    pointer-events: none;
    max-width: 800px; margin: 0 auto;
}
.pp-narration.visible { opacity: 1; }
.pp-narration .pp-speaker {
    display: block; font-family: 'Courier New', monospace;
    font-size: 0.7em; letter-spacing: 3px; text-transform: uppercase;
    color: rgba(0,255,255,0.6); margin-bottom: 6px;
}

/* Phase indicator dots */
.pp-phase-dots {
    position: fixed; bottom: 2vh; left: 50%; transform: translateX(-50%);
    z-index: 10006; display: flex; gap: 8px;
    opacity: 0; transition: opacity 1s ease 2s;
}
.pp-phase-dots.visible { opacity: 1; }
.pp-phase-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: rgba(255,255,255,0.15);
    transition: background 0.5s ease, box-shadow 0.5s ease;
}
.pp-phase-dot.active {
    background: rgba(0,255,255,0.7);
    box-shadow: 0 0 6px rgba(0,255,255,0.5);
}
.pp-phase-dot.done { background: rgba(0,255,255,0.25); }

/* Skip button */
.pp-skip {
    position: fixed; bottom: 2vh; right: 3vw; z-index: 10007;
    font-family: 'Courier New', monospace;
    font-size: 0.7em; letter-spacing: 2px;
    color: rgba(255,255,255,0.2); background: none;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 4px 14px; cursor: pointer; border-radius: 2px;
    transition: color 0.3s, border-color 0.3s;
}
.pp-skip:hover { color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.3); }

/* Vignette overlay for depth */
.pp-vignette {
    position: fixed; inset: 0; z-index: 10000;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.4) 100%);
    opacity: 0; transition: opacity 2s ease;
}
.pp-vignette.active { opacity: 1; }

/* Background zoom transition */
#scene-background.pp-zoomed {
    transition: transform 3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Walking indicator */
.pp-walking-indicator {
    position: fixed; top: 50%; right: 3vw; z-index: 10005;
    transform: translateY(-50%);
    font-family: 'Courier New', monospace;
    font-size: 0.65em; letter-spacing: 2px;
    color: rgba(255,255,255,0.15);
    writing-mode: vertical-rl; text-orientation: mixed;
    opacity: 0; transition: opacity 1s ease;
    pointer-events: none;
}
.pp-walking-indicator.visible { opacity: 1; }

/* Ambient particle layer */
.pp-particles {
    position: fixed; inset: 0; z-index: 10002;
    pointer-events: none; overflow: hidden;
}
.pp-particle {
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,0.15);
    animation: pp-float linear infinite;
}
@keyframes pp-float {
    0% { transform: translateY(0) translateX(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
}

/* Heather pollen / dust motes */
.pp-mote {
    position: absolute; width: 2px; height: 2px; border-radius: 50%;
    background: rgba(255,240,200,0.3);
}
`;
        document.head.appendChild(style);
    },

    _createCinematicOverlay() {
        // Build DOM
        const overlay = document.createElement('div');
        overlay.id = 'pp-cinematic';

        // Letterbox bars
        const barTop = document.createElement('div');
        barTop.className = 'pp-bar pp-bar-top';
        const barBot = document.createElement('div');
        barBot.className = 'pp-bar pp-bar-bot';
        overlay.appendChild(barTop);
        overlay.appendChild(barBot);

        // Vignette
        const vignette = document.createElement('div');
        vignette.className = 'pp-vignette';
        overlay.appendChild(vignette);

        // Narration box
        const narration = document.createElement('div');
        narration.className = 'pp-narration';
        narration.id = 'pp-narration';
        overlay.appendChild(narration);

        // Particle layer
        const particles = document.createElement('div');
        particles.className = 'pp-particles';
        particles.id = 'pp-particles';
        overlay.appendChild(particles);

        // Phase dots
        const dots = document.createElement('div');
        dots.className = 'pp-phase-dots';
        dots.id = 'pp-phase-dots';
        for (let i = 0; i < this._walkPhases.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'pp-phase-dot';
            dot.dataset.phase = i;
            dots.appendChild(dot);
        }
        overlay.appendChild(dots);

        // Walking indicator
        const walkInd = document.createElement('div');
        walkInd.className = 'pp-walking-indicator';
        walkInd.id = 'pp-walk-indicator';
        walkInd.textContent = '▸ WALKING';
        overlay.appendChild(walkInd);

        // Skip button
        const skip = document.createElement('button');
        skip.className = 'pp-skip';
        skip.textContent = 'SKIP ▸▸';
        skip.onclick = () => this._skipCinematic();
        overlay.appendChild(skip);

        document.body.appendChild(overlay);
        this._overlay = overlay;

        // Spawn dust motes
        this._spawnParticles(particles);

        // Activate letterbox + vignette after a beat
        this._schedule(() => {
            barTop.classList.add('active');
            barBot.classList.add('active');
            vignette.classList.add('active');
            dots.classList.add('visible');
        }, 300);

        return overlay;
    },

    _spawnParticles(container) {
        // Floating dust / pollen motes
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'pp-particle';
            p.style.left = (Math.random() * 100) + '%';
            p.style.bottom = -(Math.random() * 20) + '%';
            p.style.width = (1 + Math.random() * 2) + 'px';
            p.style.height = p.style.width;
            p.style.animationDuration = (15 + Math.random() * 25) + 's';
            p.style.animationDelay = (Math.random() * 15) + 's';
            container.appendChild(p);
        }
    },

    _removeCinematicOverlay() {
        // Fade out bars + vignette
        const overlay = this._overlay;
        if (!overlay) return;

        const bars = overlay.querySelectorAll('.pp-bar');
        const vignette = overlay.querySelector('.pp-vignette');
        bars.forEach(b => b.classList.remove('active'));
        if (vignette) vignette.classList.remove('active');

        // Reset background zoom
        const bg = document.getElementById('scene-background');
        if (bg) {
            bg.style.transform = '';
            bg.classList.remove('pp-zoomed');
        }

        this._schedule(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            this._overlay = null;
        }, 2000);

        this._cinematicActive = false;
    },

    _skipCinematic() {
        this._clearTimeouts();
        this._cinematicActive = false;

        // Stop any TTS currently playing
        if (window.game) window.game.stopSpeech();

        // Hide narration immediately
        const narr = document.getElementById('pp-narration');
        if (narr) narr.classList.remove('visible');

        // Set final player position
        const game = window.game;
        if (game && game.player) {
            game.player.setPosition(88, 62);
            game.player.face('right');
        }

        // Mark completed
        if (game) {
            game.setFlag('planetenpad_walked', true);
            game.setFlag('planetenpad_complete', true);
            game.setFlag('visited_planetenpad', true);
        }

        // Clean up overlay
        this._removeCinematicOverlay();
    },

    // ═══════════════════════════════════════════════
    //  BACKGROUND ZOOM — Ken Burns effect
    // ═══════════════════════════════════════════════

    _applyBgZoom(phase) {
        const bg = document.getElementById('scene-background');
        if (!bg) return;

        bg.classList.add('pp-zoomed');
        const z = phase.bgZoom || 1.0;
        const ox = phase.bgOffsetX || 0;
        const oy = phase.bgOffsetY || 0;
        bg.style.transform = `scale(${z}) translate(${ox}%, ${oy}%)`;
    },

    // ═══════════════════════════════════════════════
    //  PHASE NARRATION — typewriter-style reveal
    // ═══════════════════════════════════════════════

    _showNarration(lines, callback) {
        const container = document.getElementById('pp-narration');
        if (!container) { if (callback) callback(); return; }

        // Tiny helper — cancellable sleep that still registers in _timeoutIds
        const sleep = (ms) => new Promise(resolve => this._schedule(resolve, ms));

        const showNext = async (lineIdx) => {
            if (!this._cinematicActive) return;

            if (lineIdx >= lines.length) {
                // Last line finished — brief hold, then fade out and call back
                await sleep(1200);
                if (!this._cinematicActive) return;
                container.classList.remove('visible');
                await sleep(800);
                if (!this._cinematicActive) return;
                if (callback) callback();
                return;
            }

            const line = lines[lineIdx];

            // Build HTML content
            let html = '';
            if (line.speaker && line.speaker !== 'Narrator') {
                html += `<span class="pp-speaker">${line.speaker}</span>`;
            }
            let text = line.text;
            text = text.replace(/\*([^*]+)\*/g, '<em style="color:rgba(200,210,220,0.7);font-style:italic;">$1</em>');
            html += text;

            container.innerHTML = html;
            container.classList.add('visible');

            // Speak via TTS and WAIT for it to finish before advancing
            const speechPromise = window.game
                ? window.game.speakText(line.text, line.speaker || 'Narrator')
                : Promise.resolve();

            // Play footstep occasionally during narration
            if (Math.random() < 0.3) this._playFootstep();

            // Wait for TTS to complete
            await speechPromise;
            if (!this._cinematicActive) return;

            // Brief visual hold after speech ends, then fade out
            await sleep(400);
            if (!this._cinematicActive) return;
            container.classList.remove('visible');
            await sleep(500);

            showNext(lineIdx + 1);
        };

        showNext(0);
    },

    // ═══════════════════════════════════════════════
    //  PHASE DOTS — progress tracking
    // ═══════════════════════════════════════════════

    _updatePhaseDots(currentPhase) {
        const dots = document.querySelectorAll('.pp-phase-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('active', 'done');
            if (i < currentPhase) dot.classList.add('done');
            if (i === currentPhase) dot.classList.add('active');
        });
    },

    // ═══════════════════════════════════════════════
    //  MAIN CINEMATIC WALK SEQUENCE
    // ═══════════════════════════════════════════════

    _startCinematicWalk(game) {
        this._cinematicActive = true;
        this._injectCinematicStyles();
        this._createCinematicOverlay();
        this._initAudio();

        // Hide dialogue box during cinematic
        const dialogueBox = document.getElementById('dialogue-box');
        if (dialogueBox) dialogueBox.classList.add('hidden');

        // Random bird chirps during walk
        const birdInterval = setInterval(() => {
            if (!this._cinematicActive) return;
            if (Math.random() < 0.4) this._playBirdChirp();
        }, 6000);
        this._intervalIds.push(birdInterval);

        // Footstep rhythm during walking
        const footstepInterval = setInterval(() => {
            if (!this._cinematicActive) return;
            if (game.player && game.player.isWalking) {
                this._playFootstep();
            }
        }, 700);
        this._intervalIds.push(footstepInterval);

        // Show walking indicator
        const walkInd = document.getElementById('pp-walk-indicator');

        // Start at phase 0
        let currentPhase = 0;

        const executePhase = (phaseIdx) => {
            if (!this._cinematicActive || phaseIdx >= this._walkPhases.length) {
                // Walk complete
                this._finishCinematicWalk(game);
                return;
            }

            const phase = this._walkPhases[phaseIdx];
            currentPhase = phaseIdx;
            this._updatePhaseDots(phaseIdx);

            // Apply background zoom
            this._applyBgZoom(phase);

            // Walk player to target position
            const target = phase.playerTarget;
            if (walkInd) walkInd.classList.add('visible');

            game.player.walkTo(target.x, target.y, () => {
                // Arrived — hide walking indicator
                if (walkInd) walkInd.classList.remove('visible');

                // Brief pause to let the scene breathe
                this._schedule(() => {
                    // Show narration for this phase
                    this._showNarration(phase.narration, () => {
                        // Small beat between phases
                        this._schedule(() => {
                            executePhase(phaseIdx + 1);
                        }, 600);
                    });
                }, 500);
            });
        };

        // Initial delay to let letterbox and vignette appear
        this._schedule(() => executePhase(0), 1500);
    },

    _finishCinematicWalk(game) {
        this._cinematicActive = false;

        game.setFlag('planetenpad_walked', true);
        game.setFlag('planetenpad_complete', true);

        // Final narration
        const narr = document.getElementById('pp-narration');
        if (narr) {
            narr.innerHTML = '<em style="color:rgba(200,210,220,0.7);font-style:italic;">The walk is complete. The solar system in a kilometre.</em>';
            narr.classList.add('visible');
        }

        this._schedule(() => {
            this._removeCinematicOverlay();
            this._stopAudio();

            // Restore normal game UI
            this._schedule(() => {
                // Show ending dialogue through normal system
                game.startDialogue([
                    { speaker: 'Narrator', text: '*Ryan stands beside the sun model. The WSRT dishes loom beyond the trees.*' },
                    { speaker: 'Narrator', text: '*The path back leads to the parking area. Or there\'s a trail forward toward the WSRT.*' },
                ]);
            }, 1500);
        }, 3000);
    },

    // ═══════════════════════════════════════════════
    //  HOTSPOTS — available after cinematics
    // ═══════════════════════════════════════════════
    hotspots: [
        // ── Pluto & Kuiper Belt marker (path entrance) ──
        {
            id: 'pluto_marker',
            name: 'Pluto — Dwarf Planet',
            x: 1,
            y: 60,
            width: 7,
            height: 15,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/pluto.svg',
            label: 'Pluto',
            action: function(game) {
                const p = PlanetenpadScene._planets.pluto;
                game.startDialogue([
                    { speaker: 'Narrator', text: `*A small pedestal with a tiny sphere — barely visible. A sign reads: "${p.name}"*` },
                    { speaker: 'Narrator', text: `⚪ PLUTO — ${p.dist} from the Sun model | Real distance: ${p.real}` },
                    { speaker: 'Narrator', text: `Model size: ${p.size} | ${p.fact}` },
                ]);
            }
        },

        // ── Neptune ──
        {
            id: 'neptune_marker',
            name: 'Neptune',
            x: 9,
            y: 55,
            width: 7,
            height: 12,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/neptune.svg',
            label: 'Neptune',
            action: function(game) {
                const p = PlanetenpadScene._planets.neptune;
                game.startDialogue([
                    { speaker: 'Narrator', text: `*A blue-tinted sphere on a dark pedestal*` },
                    { speaker: 'Narrator', text: `🔵 NEPTUNE — ${p.dist} from the Sun model | Real distance: ${p.real}` },
                    { speaker: 'Narrator', text: `Model size: ${p.size} | ${p.fact}` },
                ]);
            }
        },

        // ── Uranus ──
        {
            id: 'uranus_marker',
            name: 'Uranus',
            x: 17,
            y: 50,
            width: 7,
            height: 12,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/uranus.svg',
            label: 'Uranus',
            action: function(game) {
                const p = PlanetenpadScene._planets.uranus;
                game.startDialogue([
                    { speaker: 'Narrator', text: `*A pale blue sphere on a tilted pedestal*` },
                    { speaker: 'Narrator', text: `🔵 URANUS — ${p.dist} from the Sun model | Real distance: ${p.real}` },
                    { speaker: 'Narrator', text: `Model size: ${p.size} | ${p.fact}` },
                ]);
            }
        },

        // ── Saturn ──
        {
            id: 'saturn_marker',
            name: 'Saturn',
            x: 29,
            y: 42,
            width: 8,
            height: 14,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/saturn.svg',
            label: 'Saturn',
            action: function(game) {
                const p = PlanetenpadScene._planets.saturn;
                game.startDialogue([
                    { speaker: 'Narrator', text: `*A golden sphere with delicate rings — the most detailed model on the path*` },
                    { speaker: 'Narrator', text: `🪐 SATURN — ${p.dist} from the Sun model | Real distance: ${p.real}` },
                    { speaker: 'Narrator', text: `Model size: ${p.size} (with rings ~4 cm) | ${p.fact}` },
                ]);
            }
        },

        // ── Jupiter ──
        {
            id: 'jupiter_marker',
            name: 'Jupiter',
            x: 38,
            y: 38,
            width: 8,
            height: 14,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/jupiter.svg',
            label: 'Jupiter',
            action: function(game) {
                const p = PlanetenpadScene._planets.jupiter;
                game.startDialogue([
                    { speaker: 'Narrator', text: `*The largest planet model on the path — about the size of a walnut*` },
                    { speaker: 'Narrator', text: `🟠 JUPITER — ${p.dist} from the Sun model | Real distance: ${p.real}` },
                    { speaker: 'Narrator', text: `Model size: ${p.size} | ${p.fact}` },
                ]);
            }
        },

        // ── Gravity Experiment ──
        {
            id: 'gravity_experiment',
            name: 'Physics: Gravity',
            x: 45,
            y: 35,
            width: 8,
            height: 12,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/experiment.svg',
            label: 'Gravity',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*An interactive panel between the gas giants and inner planets*' },
                    { speaker: 'Narrator', text: '🔬 EXPERIMENT: HOW MUCH DO YOU WEIGH ON OTHER PLANETS?' },
                    { speaker: 'Narrator', text: '• Moon: 16.6% of Earth — Mars: 37.6% — Jupiter: 252.8% — Sun: 2,800%' },
                ]);
            }
        },

        // ── Mars ──
        {
            id: 'mars_marker',
            name: 'Mars',
            x: 52,
            y: 33,
            width: 7,
            height: 10,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/mars.svg',
            label: 'Mars',
            action: function(game) {
                const p = PlanetenpadScene._planets.mars;
                game.startDialogue([
                    { speaker: 'Narrator', text: `*A tiny red sphere. Barely a millimetre across.*` },
                    { speaker: 'Narrator', text: `🔴 MARS — ${p.dist} from the Sun model | Real distance: ${p.real}` },
                    { speaker: 'Narrator', text: `Model size: ${p.size} | ${p.fact}` },
                ]);
            }
        },

        // ── Earth & Moon ──
        {
            id: 'earth_marker',
            name: 'Earth & Moon',
            x: 59,
            y: 30,
            width: 8,
            height: 10,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/earth.svg',
            label: 'Earth',
            action: function(game) {
                const p = PlanetenpadScene._planets.earth;
                game.startDialogue([
                    { speaker: 'Narrator', text: `*Two tiny spheres — one blue-green, one grey, mounted 6.4 cm apart*` },
                    { speaker: 'Narrator', text: `🌍 EARTH — ${p.dist} from the Sun model | Real distance: ${p.real}` },
                    { speaker: 'Narrator', text: `Model size: ${p.size} | ${p.fact}` },
                ]);
            }
        },

        // ── Venus ──
        {
            id: 'venus_marker',
            name: 'Venus',
            x: 64,
            y: 28,
            width: 7,
            height: 9,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/venus.svg',
            label: 'Venus',
            action: function(game) {
                const p = PlanetenpadScene._planets.venus;
                game.startDialogue([
                    { speaker: 'Narrator', text: `*A yellowish sphere, almost identical in size to the Earth model*` },
                    { speaker: 'Narrator', text: `🟡 VENUS — ${p.dist} from the Sun model | Real distance: ${p.real}` },
                    { speaker: 'Narrator', text: `Model size: ${p.size} | ${p.fact}` },
                ]);
            }
        },

        // ── Mercury ──
        {
            id: 'mercury_marker',
            name: 'Mercury',
            x: 69,
            y: 25,
            width: 7,
            height: 9,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/mercury.svg',
            label: 'Mercury',
            action: function(game) {
                const p = PlanetenpadScene._planets.mercury;
                game.startDialogue([
                    { speaker: 'Narrator', text: `*A dark, cratered sphere. Smallest of the planetary models.*` },
                    { speaker: 'Narrator', text: `⚫ MERCURY — ${p.dist} from the Sun model | Real distance: ${p.real}` },
                    { speaker: 'Narrator', text: `Model size: ${p.size} | ${p.fact}` },
                ]);
            }
        },

        // ── Light Speed Experiment ──
        {
            id: 'light_experiment',
            name: 'Physics: Light Speed',
            x: 74,
            y: 22,
            width: 8,
            height: 10,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/lightspeed.svg',
            label: 'Light Speed',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*An information panel with LED light strips*' },
                    { speaker: 'Narrator', text: '🔬 EXPERIMENT: HOW FAST IS LIGHT? — At this scale: ~5 cm/s' },
                    { speaker: 'Narrator', text: '• Sun→Earth: 8 min 20 s — Sun→Neptune: 4 h 10 min — Sun→Pluto: 5 h 28 min' },
                    { speaker: 'Narrator', text: '• Nearest star at this scale: 6,800 km away (London to Lahore)' },
                ]);
            }
        },

        // ── Sun Model ──
        {
            id: 'sun_model',
            name: 'The Sun Model ☀️',
            x: 80,
            y: 18,
            width: 12,
            height: 16,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/sun.svg',
            label: '☀ The Sun',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*A bright golden sphere on a sturdy pedestal. About the size of a beach ball.*' },
                    { speaker: 'Narrator', text: '☀️ THE SUN — diameter 23 cm | Real: 1,392,000 km — 99.86% of all mass in the solar system' },
                ]);
            }
        },

        // ── Sundial Experiment ──
        {
            id: 'sundial_experiment',
            name: 'Physics: Sundial',
            x: 34,
            y: 45,
            width: 8,
            height: 10,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/sundial.svg',
            label: 'Sundial',
            action: function(game) {
                const hour = parseInt((game.gameState.time || '14:00').split(':')[0], 10);
                const timeDesc = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
                game.startDialogue([
                    { speaker: 'Narrator', text: '*A large stone sundial set into the ground beside the path*' },
                    { speaker: 'Narrator', text: '🔬 EXPERIMENT: TELLING TIME BY THE SUN' },
                ]);
            }
        },

        // ── Wooden bench ──
        {
            id: 'bench',
            name: 'Wooden Bench',
            x: 42,
            y: 38,
            width: 6,
            height: 8,
            cursor: 'pointer',
            icon: 'assets/images/icons/planetenpad/bench.svg',
            label: 'Bench',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*A weathered wooden bench between the gas giants and inner planets. A view across the entire path.*' },
                ]);
            }
        },

        // ── WSRT Dishes in background ──
        {
            id: 'wsrt_bg',
            name: 'WSRT Dishes',
            x: 85,
            y: 5,
            width: 15,
            height: 15,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                ]);
            }
        },

        // ── The path ──
        {
            id: 'path_overview',
            name: 'The Walking Path',
            x: 20,
            y: 60,
            width: 50,
            height: 10,
            cursor: 'pointer',
            action: function(game) {
                if (!game.getFlag('planetenpad_walked')) {
                    // Trigger the cinematic walk if not done yet
                    PlanetenpadScene._startCinematicWalk(game);
                } else {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*A sandy path stretches through the heathland toward the distant WSRT dishes*' },
                    ]);
                }
            }
        },

        // ── Back to parking ──
        {
            id: 'back_to_parking',
            name: '← Parking',
            x: 0,
            y: 80,
            width: 6,
            height: 18,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*Ryan turns back toward the parking area*' },
                ], () => {
                    game.loadScene('wsrt_parking');
                });
            }
        },

        // ── Continue to WSRT ──
        {
            id: 'continue_to_wsrt',
            name: 'WSRT →',
            x: 93,
            y: 15,
            width: 7,
            height: 20,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                if (!game.getFlag('astron_unlocked')) {
                    game.startDialogue([
                    ]);
                    return;
                }
                game.startDialogue([
                    { speaker: 'Narrator', text: '*Past the sun model, the path leads straight to the WSRT*' },
                ], () => {
                    game.loadScene('astron');
                });
            }
        },
    ],

    // ═══════════════════════════════════════════════
    //  ON ENTER — start the experience
    // ═══════════════════════════════════════════════
    onEnter: function(game) {
        this._clearTimeouts();

        if (!game.getFlag('visited_planetenpad')) {
            game.setFlag('visited_planetenpad', true);

            // First visit — launch the cinematic walking experience
            this._schedule(() => {
                this._startCinematicWalk(game);
            }, 800);

        } else if (!game.getFlag('planetenpad_walked')) {
            // Been here before but haven't done the full walk
            this._schedule(() => {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*The Planetenpad stretches ahead. Click the path to walk it.*' },
                ]);
            }, 400);
        } else {
            // Full walk completed — free roam
            game.player.setPosition(88, 62);
            this._schedule(() => {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*The Planetenpad. Planet markers line the sandy path through the Drenthe heath.*' },
                ]);
            }, 300);
        }
    },

    onExit: function() {
        this._clearTimeouts();
        this._cinematicActive = false;

        // Clean up overlay if present
        if (this._overlay && this._overlay.parentNode) {
            this._overlay.parentNode.removeChild(this._overlay);
            this._overlay = null;
        }

        // Remove cinematic styles from background
        const bg = document.getElementById('scene-background');
        if (bg) {
            bg.style.transform = '';
            bg.classList.remove('pp-zoomed');
        }

        // Stop audio
        this._stopAudio();

        // Stop any TTS
        if (window.game) window.game.stopSpeech();

        // Remove injected stylesheet
        const style = document.getElementById('planetenpad-cinematic-style');
        if (style) style.remove();

        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }
    }
};

// Register scene
if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(PlanetenpadScene);
}
