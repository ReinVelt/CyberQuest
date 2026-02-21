/**
 * Credits Scene — Cinematic Hollywood-style End Credits
 * ═══════════════════════════════════════════════════════════
 * Multi-act presentation with Web Audio soundtrack, star field,
 * animated role cards, typewriter reveals, lens-flare title,
 * and parallax scrolling.
 *
 * Acts:
 *   0 – Black hold (1.5s)
 *   1 – Title reveal "CYBERQUEST: OPERATION ZERFALL"
 *   2 – Production card "A GAME BY REIN VELT"
 *   3 – Cast roll (character cards slide in one at a time)
 *   4 – "Based on Real Technology" (typewriter reveals)
 *   5 – Fictional disclaimer
 *   6 – Inspiration & Thanks
 *   7 – Final title + copyright + return button
 * ═══════════════════════════════════════════════════════════
 */

const CreditsScene = {
    id: 'credits',
    name: 'Credits',
    background: 'assets/images/scenes/credits.svg',
    description: 'Thank you for playing CyberQuest: Operation ZERFALL',
    playerStart: { x: 50, y: 50 },
    hotspots: [],

    /* ── bookkeeping ────────────────────────────────────────── */
    _timeoutIds: [],
    _intervalIds: [],
    _animFrameId: null,
    _audioCtx: null,
    _audioNodes: [],
    _styleEl: null,
    _overlayEl: null,
    _skipped: false,

    _clearTimers() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        this._intervalIds.forEach(id => clearInterval(id));
        this._intervalIds = [];
        if (this._animFrameId) { cancelAnimationFrame(this._animFrameId); this._animFrameId = null; }
    },
    _schedule(fn, ms) { const id = setTimeout(fn, ms); this._timeoutIds.push(id); return id; },
    _repeat(fn, ms)   { const id = setInterval(fn, ms); this._intervalIds.push(id); return id; },

    /* ══════════════════════════════════════════════════════════
       AUDIO ENGINE — Ambient credits soundtrack (synthesised)
       ══════════════════════════════════════════════════════════ */
    _initAudio() {
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            const ctx = new AC();
            this._audioCtx = ctx;

            // Master
            const master = ctx.createGain();
            master.gain.value = 0.28;
            master.connect(ctx.destination);
            this._masterGain = master;

            // Warm pad (two detuned saws through LP filter)
            const padA = ctx.createOscillator();
            const padB = ctx.createOscillator();
            const padGain = ctx.createGain();
            const padFilter = ctx.createBiquadFilter();
            padA.type = 'sawtooth'; padA.frequency.value = 55;
            padB.type = 'sawtooth'; padB.frequency.value = 55.8;
            padFilter.type = 'lowpass'; padFilter.frequency.value = 180; padFilter.Q.value = 2;
            padGain.gain.value = 0;
            padA.connect(padFilter); padB.connect(padFilter);
            padFilter.connect(padGain); padGain.connect(master);
            padA.start(); padB.start();
            padGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 4);
            this._padGain = padGain;
            this._padFilter = padFilter;
            this._audioNodes.push(padA, padB);

            // Higher shimmer layer
            const shimA = ctx.createOscillator();
            const shimB = ctx.createOscillator();
            const shimGain = ctx.createGain();
            const shimFilter = ctx.createBiquadFilter();
            shimA.type = 'sine'; shimA.frequency.value = 220;
            shimB.type = 'triangle'; shimB.frequency.value = 330;
            shimFilter.type = 'lowpass'; shimFilter.frequency.value = 400; shimFilter.Q.value = 1;
            shimGain.gain.value = 0;
            shimA.connect(shimFilter); shimB.connect(shimFilter);
            shimFilter.connect(shimGain); shimGain.connect(master);
            shimA.start(); shimB.start();
            shimGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 6);
            this._shimGain = shimGain;
            this._audioNodes.push(shimA, shimB);
        } catch(e) { console.warn('Credits audio init failed:', e); }
    },

    _playNote(freq, dur, delay) {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx, t = ctx.currentTime + (delay || 0);
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.12, t + 0.08);
        g.gain.linearRampToValueAtTime(0.06, t + dur * 0.6);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g); g.connect(this._masterGain);
        osc.start(t); osc.stop(t + dur + 0.05);
    },

    _playTitleReveal() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx, t = ctx.currentTime;
        // Rising sweep
        const sweep = ctx.createOscillator();
        const sg = ctx.createGain();
        const sf = ctx.createBiquadFilter();
        sweep.type = 'sawtooth';
        sweep.frequency.setValueAtTime(55, t);
        sweep.frequency.exponentialRampToValueAtTime(350, t + 1.8);
        sf.type = 'lowpass'; sf.frequency.setValueAtTime(150, t);
        sf.frequency.exponentialRampToValueAtTime(1800, t + 1.8);
        sg.gain.setValueAtTime(0.15, t);
        sg.gain.linearRampToValueAtTime(0.45, t + 1.5);
        sg.gain.exponentialRampToValueAtTime(0.001, t + 3);
        sweep.connect(sf); sf.connect(sg); sg.connect(this._masterGain);
        sweep.start(t); sweep.stop(t + 3.1);
        // Impact at peak
        this._schedule(() => this._playImpact(), 1800);
        // Sustain pad swell
        if (this._padFilter) {
            this._padFilter.frequency.linearRampToValueAtTime(500, t + 2.5);
            this._padFilter.frequency.linearRampToValueAtTime(200, t + 6);
        }
    },

    _playImpact() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx, t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(75, t);
        osc.frequency.exponentialRampToValueAtTime(22, t + 0.4);
        g.gain.setValueAtTime(0.65, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.connect(g); g.connect(this._masterGain);
        osc.start(t); osc.stop(t + 0.6);
        // Noise transient
        const n = ctx.createBufferSource();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.025, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        n.buffer = buf;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.25, t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        n.connect(ng); ng.connect(this._masterGain);
        n.start(t);
    },

    _playCardReveal() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx, t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 600 + Math.random() * 400;
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(g); g.connect(this._masterGain);
        osc.start(t); osc.stop(t + 0.15);
    },

    _playTypeTick() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx, t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 700 + Math.random() * 500;
        g.gain.setValueAtTime(0.04, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc.connect(g); g.connect(this._masterGain);
        osc.start(t); osc.stop(t + 0.04);
    },

    _setMood(filterFreq, padGainVal, shimGainVal, dur) {
        if (!this._audioCtx) return;
        const t = this._audioCtx.currentTime;
        if (this._padFilter) this._padFilter.frequency.linearRampToValueAtTime(filterFreq, t + dur);
        if (this._padGain) this._padGain.gain.linearRampToValueAtTime(padGainVal, t + dur);
        if (this._shimGain) this._shimGain.gain.linearRampToValueAtTime(shimGainVal, t + dur);
    },

    _stopAudio() {
        try {
            if (this._padGain && this._audioCtx) {
                const t = this._audioCtx.currentTime;
                this._padGain.gain.linearRampToValueAtTime(0, t + 1.5);
                if (this._shimGain) this._shimGain.gain.linearRampToValueAtTime(0, t + 1.5);
            }
            setTimeout(() => {
                this._audioNodes.forEach(n => { try { n.stop(); } catch(e){} });
                this._audioNodes = [];
                if (this._audioCtx) { this._audioCtx.close().catch(()=>{}); this._audioCtx = null; }
            }, 1700);
        } catch(e) {}
    },

    /* ══════════════════════════════════════════════════════════
       STAR FIELD CANVAS
       ══════════════════════════════════════════════════════════ */
    _initStarField(canvas) {
        const ctx = canvas.getContext('2d');
        const stars = [];
        const self = this;
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        this._resizeHandler = resize;
        window.addEventListener('resize', resize);

        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.5 + 0.3,
                speed: Math.random() * 0.15 + 0.02,
                alpha: Math.random() * 0.6 + 0.2,
                flicker: Math.random() * Math.PI * 2
            });
        }

        const draw = () => {
            if (self._skipped) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const time = Date.now() * 0.001;
            stars.forEach(s => {
                s.y -= s.speed;
                if (s.y < -5) { s.y = canvas.height + 5; s.x = Math.random() * canvas.width; }
                const flick = Math.sin(time * 2 + s.flicker) * 0.2 + 0.8;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 220, 255, ${s.alpha * flick})`;
                ctx.fill();
            });
            self._animFrameId = requestAnimationFrame(draw);
        };
        draw();
    },

    /* ══════════════════════════════════════════════════════════
       TYPEWRITER UTILITY
       ══════════════════════════════════════════════════════════ */
    _typewrite(el, text, speed) {
        const self = this;
        return new Promise(resolve => {
            let i = 0;
            const spd = speed || 30;
            const tick = () => {
                if (self._skipped || i >= text.length) { el.textContent = text; resolve(); return; }
                el.textContent = text.slice(0, ++i);
                self._playTypeTick();
                self._schedule(tick, spd + Math.random() * 15);
            };
            tick();
        });
    },

    /* ══════════════════════════════════════════════════════════
       ON ENTER
       ══════════════════════════════════════════════════════════ */
    onEnter(game) {
        const self = this;
        self._skipped = false;
        self._clearTimers();
        self._initAudio();

        // Hide game UI
        const chars = document.getElementById('scene-characters');
        if (chars) chars.style.display = 'none';
        const dlg = document.getElementById('dialogue-box');
        if (dlg) dlg.classList.add('hidden');

        /* ── INJECT STYLES ─────────────────────────────────── */
        const style = document.createElement('style');
        style.id = 'cr-style';
        style.textContent = `
/* ═══ CREDITS CINEMATIC ═══ */
#cr-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: #000; color: #fff;
    font-family: 'Georgia','Times New Roman', serif;
    overflow: hidden; user-select: none;
}
#cr-overlay * { box-sizing: border-box; }

/* Star canvas */
#cr-stars { position: absolute; inset: 0; z-index: 1; }

/* Letterbox */
.cr-bar { position: absolute; left: 0; right: 0; background: #000; z-index: 50;
    transition: height 2s ease; }
.cr-bar-top { top: 0; height: 12vh; }
.cr-bar-bot { bottom: 0; height: 12vh; }
.cr-bar.narrow { height: 6vh; }

/* Overlays */
.cr-vignette { position: absolute; inset: 0; z-index: 4; pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%); }
.cr-scanlines { position: absolute; inset: 0; z-index: 5; pointer-events: none;
    background: repeating-linear-gradient(0deg,
        rgba(200,220,255,0.008) 0px, transparent 1px,
        transparent 3px, rgba(200,220,255,0.008) 4px);
    animation: cr-scan-drift 12s linear infinite; mix-blend-mode: screen; }
@keyframes cr-scan-drift { to { transform: translateY(10px); } }
.cr-grain { position: absolute; inset: -50%; z-index: 3; pointer-events: none;
    width: 200%; height: 200%; opacity: 0.025;
    animation: cr-grain-shift 0.6s steps(4) infinite;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.85' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E"); }
@keyframes cr-grain-shift {
    0%   { transform: translate(0,0); }
    25%  { transform: translate(-4%,-6%); }
    50%  { transform: translate(5%,3%); }
    75%  { transform: translate(-3%,5%); }
    100% { transform: translate(0,0); } }

/* Content area (centered) */
.cr-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    z-index: 10; text-align: center; width: 90%; max-width: 850px;
    opacity: 0; transition: opacity 1.8s ease; }
.cr-content.visible { opacity: 1; }
.cr-content.fade-out { opacity: 0; transition: opacity 1s ease; }

/* Skip */
.cr-skip { position: fixed; bottom: 2vh; right: 3vw; z-index: 99999;
    font-family: 'Courier New', monospace; font-size: 0.7em; letter-spacing: 3px;
    color: rgba(255,255,255,0.2); background: none;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 5px 14px; cursor: pointer; border-radius: 2px;
    transition: color 0.3s, border-color 0.3s; }
.cr-skip:hover { color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.3); }

/* Progress dots */
.cr-progress { position: fixed; bottom: 2.5vh; left: 50%; transform: translateX(-50%);
    z-index: 99998; display: flex; gap: 10px;
    opacity: 0; transition: opacity 1s ease; }
.cr-progress.visible { opacity: 1; }
.cr-dot { width: 5px; height: 5px; border-radius: 50%;
    background: rgba(255,255,255,0.15);
    transition: background 0.5s ease, box-shadow 0.5s ease; }
.cr-dot.active { background: rgba(200,180,255,0.8);
    box-shadow: 0 0 6px rgba(200,180,255,0.5); }
.cr-dot.done { background: rgba(200,180,255,0.3); }

/* Flash */
.cr-flash { position: absolute; inset: 0; z-index: 40;
    background: #fff; opacity: 0; pointer-events: none; }
.cr-flash.fire { animation: cr-flash-fire 0.15s ease-out forwards; }
@keyframes cr-flash-fire { 0% { opacity: 0.4; } 100% { opacity: 0; } }

/* ─── ACT 1: TITLE ─── */
.cr-title-main {
    font-size: 3.2em; font-weight: 300; letter-spacing: 18px;
    text-transform: uppercase; color: rgba(255,255,255,0);
    transition: color 2s ease, letter-spacing 3s ease, text-shadow 2s ease;
    line-height: 1.3; }
.cr-title-main.visible {
    color: #fff; letter-spacing: 22px;
    text-shadow: 0 0 60px rgba(180,160,255,0.3), 0 0 120px rgba(100,140,255,0.15); }
.cr-title-sub {
    font-family: 'Courier New', monospace; font-size: 1.1em;
    letter-spacing: 10px; text-transform: uppercase;
    color: rgba(200,180,255,0); margin-top: 16px;
    transition: color 1.5s ease 0.5s; }
.cr-title-sub.visible { color: rgba(200,180,255,0.7); }
.cr-title-sep {
    width: 0; height: 1px; margin: 24px auto;
    background: linear-gradient(90deg, transparent, rgba(200,180,255,0.4), transparent);
    transition: width 2.5s ease 0.3s; }
.cr-title-sep.visible { width: 200px; }
.cr-title-tagline {
    font-size: 0.85em; font-style: italic; letter-spacing: 3px;
    color: rgba(255,255,255,0); transition: color 2s ease 1.2s; }
.cr-title-tagline.visible { color: rgba(255,255,255,0.35); }

/* Lens flare */
.cr-lens-flare {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    width: 300px; height: 2px; z-index: 12; pointer-events: none;
    background: linear-gradient(90deg, transparent 0%, rgba(200,180,255,0.6) 40%,
        rgba(255,255,255,0.9) 50%, rgba(200,180,255,0.6) 60%, transparent 100%);
    opacity: 0; filter: blur(1px);
    transition: opacity 0.8s ease, width 2s ease; }
.cr-lens-flare.fire { opacity: 1; width: 110vw; }
.cr-lens-flare.fade { opacity: 0; transition: opacity 2s ease; }

/* ─── ACT 2: PRODUCTION CARD ─── */
.cr-prod-label {
    font-size: 0.9em; letter-spacing: 8px; text-transform: uppercase;
    color: rgba(255,255,255,0); transition: color 2s ease; }
.cr-prod-label.visible { color: rgba(255,255,255,0.5); }
.cr-prod-name {
    font-size: 2.2em; font-weight: 300; letter-spacing: 12px;
    color: rgba(255,255,255,0); margin-top: 14px;
    transition: color 2s ease 0.5s; }
.cr-prod-name.visible { color: rgba(255,255,255,0.85); }
.cr-prod-line {
    width: 0; height: 1px; margin: 24px auto; background: rgba(255,255,255,0.15);
    transition: width 2s ease 0.3s; }
.cr-prod-line.visible { width: 100px; }

/* ─── ACT 3: CAST CARDS ─── */
.cr-section-header {
    font-size: 0.7em; letter-spacing: 8px; text-transform: uppercase;
    color: rgba(200,180,255,0.5); margin-bottom: 40px;
    opacity: 0; transform: translateY(10px);
    transition: all 1s ease; }
.cr-section-header.visible { opacity: 1; transform: translateY(0); }

.cr-cast-card {
    display: flex; align-items: center; gap: 28px;
    padding: 18px 28px; margin: 16px auto;
    max-width: 560px; border-radius: 4px;
    background: rgba(255,255,255,0.02);
    border-left: 2px solid rgba(200,180,255,0.25);
    opacity: 0; transform: translateX(-30px);
    transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
.cr-cast-card.visible { opacity: 1; transform: translateX(0); }
.cr-cast-card.from-right { transform: translateX(30px);
    border-left: none; border-right: 2px solid rgba(200,180,255,0.25); }
.cr-cast-card.from-right.visible { transform: translateX(0); }
.cr-cast-name {
    font-size: 1.2em; font-weight: 400; color: #fff;
    letter-spacing: 2px; white-space: nowrap; }
.cr-cast-role {
    font-size: 0.8em; color: rgba(200,180,255,0.6);
    letter-spacing: 1px; font-style: italic; }
.cr-cast-dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
    background: rgba(200,180,255,0.4); }

/* ─── ACT 4: TECH SECTIONS ─── */
.cr-tech-title {
    font-family: 'Courier New', monospace;
    font-size: 0.7em; letter-spacing: 6px; text-transform: uppercase;
    color: rgba(0,255,255,0.6); margin-bottom: 18px;
    opacity: 0; transition: opacity 1s ease; }
.cr-tech-title.visible { opacity: 1; }
.cr-tech-block {
    text-align: left; max-width: 620px; margin: 0 auto 32px;
    padding: 20px 24px; border-radius: 3px;
    background: rgba(0,20,30,0.4);
    border: 1px solid rgba(0,255,255,0.06);
    opacity: 0; transform: translateY(12px);
    transition: all 1s ease; }
.cr-tech-block.visible { opacity: 1; transform: translateY(0); }
.cr-tech-block.fade-up { opacity: 0; transform: translateY(-8px);
    transition: all 0.8s ease; }
.cr-tech-name {
    font-family: 'Courier New', monospace;
    font-size: 0.95em; color: #00ffff; letter-spacing: 3px;
    margin-bottom: 8px; text-transform: uppercase; }
.cr-tech-desc {
    font-size: 0.85em; color: rgba(255,255,255,0.55);
    line-height: 1.8; font-family: 'Georgia', serif; }
.cr-tech-desc .hl { color: rgba(0,255,255,0.7); }

/* ─── ACT 5: DISCLAIMER ─── */
.cr-disclaimer {
    font-size: 0.75em; letter-spacing: 2px;
    color: rgba(255,255,255,0); max-width: 540px;
    margin: 14px auto; line-height: 1.8;
    font-family: 'Courier New', monospace;
    transition: color 1.5s ease; }
.cr-disclaimer.visible { color: rgba(255,255,255,0.3); }

/* ─── ACT 6: THANKS ─── */
.cr-thanks-item {
    font-size: 1em; letter-spacing: 2px;
    color: rgba(255,255,255,0); margin: 14px 0;
    transition: color 1.2s ease; line-height: 1.8; }
.cr-thanks-item.visible { color: rgba(255,255,255,0.6); }
.cr-thanks-accent { color: rgba(255,215,0,0.7) !important; }

/* ─── ACT 7: FINAL ─── */
.cr-final-title {
    font-size: 2.8em; font-weight: 300; letter-spacing: 14px;
    text-transform: uppercase; color: rgba(255,255,255,0);
    transition: color 2.5s ease, text-shadow 2.5s ease; }
.cr-final-title.visible {
    color: #fff;
    text-shadow: 0 0 80px rgba(200,180,255,0.2), 0 0 150px rgba(100,140,255,0.1); }
.cr-copyright {
    font-family: 'Courier New', monospace; font-size: 0.75em;
    letter-spacing: 4px; color: rgba(255,255,255,0);
    margin-top: 16px; transition: color 2s ease 0.8s; }
.cr-copyright.visible { color: rgba(255,255,255,0.3); }
.cr-sierra {
    font-size: 0.8em; font-style: italic; letter-spacing: 2px;
    color: rgba(255,255,255,0); margin-top: 8px;
    transition: color 2s ease 1.2s; }
.cr-sierra.visible { color: rgba(255,255,255,0.25); }
.cr-return {
    font-family: 'Courier New', monospace; font-size: 0.8em;
    letter-spacing: 4px; color: rgba(200,180,255,0);
    cursor: pointer; padding: 12px 28px;
    border: 1px solid rgba(200,180,255,0);
    border-radius: 3px; margin-top: 40px; display: inline-block;
    transition: all 1.5s ease; }
.cr-return.visible { color: rgba(200,180,255,0.5);
    border-color: rgba(200,180,255,0.15); }
.cr-return:hover { color: rgba(200,180,255,0.9);
    border-color: rgba(200,180,255,0.4);
    box-shadow: 0 0 20px rgba(200,180,255,0.1); }
`;
        document.head.appendChild(style);
        self._styleEl = style;

        /* ── BUILD OVERLAY DOM ─────────────────────────────── */
        const overlay = document.createElement('div');
        overlay.id = 'cr-overlay';
        overlay.innerHTML = `
            <canvas id="cr-stars"></canvas>
            <div class="cr-vignette"></div>
            <div class="cr-scanlines"></div>
            <div class="cr-grain"></div>
            <div class="cr-bar cr-bar-top"></div>
            <div class="cr-bar cr-bar-bot"></div>
            <div class="cr-flash" id="cr-flash"></div>
            <div class="cr-content" id="cr-content"></div>
            <div class="cr-progress" id="cr-progress"></div>
            <button class="cr-skip" id="cr-skip">SKIP</button>
        `;
        document.body.appendChild(overlay);
        self._overlayEl = overlay;

        // Star field
        self._initStarField(overlay.querySelector('#cr-stars'));

        // Progress dots (7 acts)
        const progEl = overlay.querySelector('#cr-progress');
        for (let i = 0; i < 7; i++) {
            const dot = document.createElement('div');
            dot.className = 'cr-dot';
            dot.dataset.act = i;
            progEl.appendChild(dot);
        }

        // Skip button
        overlay.querySelector('#cr-skip').addEventListener('click', () => {
            self._skipToEnd(game);
        });

        // Letterbox bars animate in
        self._schedule(() => {
            overlay.querySelectorAll('.cr-bar').forEach(b => b.classList.add('narrow'));
            progEl.classList.add('visible');
        }, 200);

        // Start act sequence
        self._schedule(() => self._runActs(game), 1500);
    },

    /* ══════════════════════════════════════════════════════════
       ACT SEQUENCE
       ══════════════════════════════════════════════════════════ */
    _setAct(n) {
        const dots = document.querySelectorAll('.cr-dot');
        dots.forEach((d, i) => {
            d.classList.remove('active');
            if (i < n) d.classList.add('done');
            if (i === n) d.classList.add('active');
        });
    },

    async _runActs(game) {
        const self = this;
        const content = document.getElementById('cr-content');
        if (!content || self._skipped) return;

        const wait = ms => new Promise(r => { self._schedule(r, ms); });
        const fadeIn = () => {
            content.classList.remove('fade-out');
            content.classList.add('visible');
        };
        const fadeOut = () => new Promise(r => {
            content.classList.add('fade-out');
            content.classList.remove('visible');
            self._schedule(r, 1200);
        });
        const clear = () => { content.innerHTML = ''; };

        /* ─── ACT 1: TITLE REVEAL ─────────────────────────── */
        if (self._skipped) return;
        self._setAct(0);
        clear();
        content.innerHTML = `
            <div class="cr-lens-flare" id="cr-flare"></div>
            <div class="cr-title-main" id="cr-title">CYBERQUEST</div>
            <div class="cr-title-sep" id="cr-sep"></div>
            <div class="cr-title-sub" id="cr-subtitle">OPERATION ZERFALL</div>
            <div class="cr-title-tagline" id="cr-tagline">A Sierra-inspired cybersecurity adventure</div>
        `;
        fadeIn();
        await wait(800);
        if (self._skipped) return;

        self._playTitleReveal();
        content.querySelector('#cr-title').classList.add('visible');
        content.querySelector('#cr-sep').classList.add('visible');
        await wait(600);
        if (self._skipped) return;

        // Lens flare + flash at impact moment
        self._schedule(() => {
            const flare = content.querySelector('#cr-flare');
            if (flare) flare.classList.add('fire');
            const flash = document.getElementById('cr-flash');
            if (flash) { flash.classList.add('fire'); self._schedule(() => flash.classList.remove('fire'), 200); }
        }, 1200);

        content.querySelector('#cr-subtitle').classList.add('visible');
        await wait(2500);
        if (self._skipped) return;

        const flare = content.querySelector('#cr-flare');
        if (flare) flare.classList.add('fade');
        content.querySelector('#cr-tagline').classList.add('visible');
        await wait(3500);
        if (self._skipped) return;
        await fadeOut();

        /* ─── ACT 2: PRODUCTION CARD ─────────────────────── */
        self._setAct(1);
        clear();
        content.innerHTML = `
            <div class="cr-prod-line" id="cr-pl1"></div>
            <div class="cr-prod-label" id="cr-plabel">GAME DESIGN &amp; DEVELOPMENT</div>
            <div class="cr-prod-name" id="cr-pname">REIN VELT</div>
            <div class="cr-prod-line" id="cr-pl2"></div>
        `;
        fadeIn();
        await wait(600);
        if (self._skipped) return;

        // Soft chord
        self._playNote(262, 1.5, 0);    // C4
        self._playNote(330, 1.5, 0.3);  // E4
        self._playNote(392, 2.0, 0.6);  // G4

        content.querySelector('#cr-pl1').classList.add('visible');
        content.querySelector('#cr-plabel').classList.add('visible');
        content.querySelector('#cr-pname').classList.add('visible');
        content.querySelector('#cr-pl2').classList.add('visible');
        await wait(4500);
        if (self._skipped) return;
        await fadeOut();

        /* ─── ACT 3: CAST ROLL ────────────────────────────── */
        self._setAct(2);
        self._setMood(250, 0.3, 0.08, 2);
        clear();

        const cast = [
            { name: 'RYAN WEYLANT',      role: 'Dutch Hacker & Protagonist' },
            { name: 'EVA WEBER',          role: 'IT Security Analyst / Whistleblower' },
            { name: 'DR. DMITRI VOLKOV',  role: 'Russian Scientist / Antagonist' },
            { name: 'CHRIS KUBECKA',      role: 'Cybersecurity Expert' },
            { name: 'DR. DAVID PRINSLOO', role: 'TU Eindhoven Antenna Engineer' },
            { name: 'CEES BASSA',         role: 'ASTRON Radio Astronomer' },
            { name: 'JAAP HAARTSEN',      role: 'Bluetooth Inventor / Ericsson' },
        ];

        let castHTML = '<div class="cr-section-header" id="cr-cast-hdr">THE CAST</div>';
        cast.forEach((c, i) => {
            const dir = i % 2 === 0 ? '' : 'from-right';
            castHTML += `<div class="cr-cast-card ${dir}" id="cr-cc-${i}">
                <div class="cr-cast-dot"></div>
                <div>
                    <div class="cr-cast-name">${c.name}</div>
                    <div class="cr-cast-role">${c.role}</div>
                </div>
            </div>`;
        });
        content.innerHTML = castHTML;
        fadeIn();
        await wait(400);
        if (self._skipped) return;

        content.querySelector('#cr-cast-hdr').classList.add('visible');
        await wait(600);

        for (let i = 0; i < cast.length; i++) {
            if (self._skipped) return;
            self._playCardReveal();
            const card = content.querySelector(`#cr-cc-${i}`);
            if (card) card.classList.add('visible');
            await wait(900);
        }

        await wait(2500);
        if (self._skipped) return;
        await fadeOut();

        /* ─── ACT 4: REAL TECHNOLOGY ─────────────────────── */
        self._setAct(3);
        self._setMood(350, 0.25, 0.1, 2);
        clear();

        const techSections = [
            {
                name: 'MESHTASTIC NETWORKS',
                desc: 'Real off-grid communication using <span class="hl">LoRa radio</span>. Decentralized — no internet, no cell towers. Used by privacy advocates, hikers, and emergency responders worldwide.'
            },
            {
                name: 'FLIPPER ZERO',
                desc: 'Multi-tool device for <span class="hl">hardware hacking</span> and RF analysis. RFID, NFC, infrared, sub-GHz radio. The Swiss Army knife of security researchers.'
            },
            {
                name: 'CHRIS KUBECKA',
                desc: 'Real cybersecurity expert. Helped <span class="hl">Saudi Aramco</span> recover from one of history\'s most devastating cyberattacks. Works with international organizations on cyber defense.'
            },
            {
                name: 'TER APEL MONASTERY',
                desc: 'Real <span class="hl">15th-century monastery</span> in Groningen, Netherlands. Now a museum. Located near the German border — historically a meeting place for secretive groups.'
            },
            {
                name: 'RF WEAPONS RESEARCH',
                desc: 'Actual area of <span class="hl">military research since the 1950s</span>. High-power microwave weapons can disable electronics and aircraft. Health effects remain debated and classified.'
            },
            {
                name: 'CHAOS COMPUTER CLUB',
                desc: 'Europe\'s largest hacker association, <span class="hl">founded 1981</span> in Germany. Annual Congress in Hamburg. Advocates for transparency, privacy, and digital rights.'
            },
            {
                name: 'INTELLIGENCE AGENCIES',
                desc: '<span class="hl">BND</span> (German foreign intelligence) and <span class="hl">AIVD</span> (Dutch General Intelligence) — real agencies known for sophisticated cyber operations and NATO collaboration.'
            }
        ];

        // Show in groups of 3, 2, 2 with typewriter headers
        let techHTML = '<div class="cr-tech-title" id="cr-tech-hdr">BASED ON REAL TECHNOLOGY &amp; EVENTS</div>';
        techSections.forEach((t, i) => {
            techHTML += `<div class="cr-tech-block" id="cr-tb-${i}">
                <div class="cr-tech-name" id="cr-tn-${i}"></div>
                <div class="cr-tech-desc">${t.desc}</div>
            </div>`;
        });
        content.innerHTML = techHTML;
        fadeIn();
        await wait(400);
        if (self._skipped) return;

        content.querySelector('#cr-tech-hdr').classList.add('visible');
        await wait(800);

        const groups = [[0,1,2], [3,4], [5,6]];
        for (let gi = 0; gi < groups.length; gi++) {
            const group = groups[gi];
            if (self._skipped) return;

            // Melody phrase per group
            self._playNote(392, 0.8, 0);   // G4
            self._playNote(440, 0.8, 0.2); // A4
            self._playNote(523, 1.2, 0.4); // C5

            for (const i of group) {
                if (self._skipped) return;
                const block = content.querySelector(`#cr-tb-${i}`);
                const nameEl = content.querySelector(`#cr-tn-${i}`);
                if (block) block.classList.add('visible');
                if (nameEl) await self._typewrite(nameEl, techSections[i].name, 40);
                await wait(300);
            }
            await wait(2800);

            // Fade out current group before next (except last)
            if (gi < groups.length - 1) {
                for (const i of group) {
                    const block = content.querySelector(`#cr-tb-${i}`);
                    if (block) block.classList.add('fade-up');
                }
                await wait(800);
                for (const i of group) {
                    const block = content.querySelector(`#cr-tb-${i}`);
                    if (block) block.style.display = 'none';
                }
            }
        }

        await wait(2000);
        if (self._skipped) return;
        await fadeOut();

        /* ─── ACT 5: FICTIONAL DISCLAIMER ────────────────── */
        self._setAct(4);
        clear();
        content.innerHTML = `
            <div class="cr-section-header" id="cr-fict-hdr">FICTIONAL ELEMENTS</div>
            <div class="cr-disclaimer" id="cr-d1">Operation ZERFALL and Steckerdoser Heide are fictional.</div>
            <div class="cr-disclaimer" id="cr-d2">Dr. Dmitri Volkov, Ryan Weylant, and Eva Weber are fictional characters.</div>
            <div class="cr-disclaimer" id="cr-d3">Specific plot events are dramatized for storytelling purposes.</div>
        `;
        fadeIn();
        await wait(500);
        if (self._skipped) return;

        content.querySelector('#cr-fict-hdr').classList.add('visible');
        await wait(800);
        if (self._skipped) return;
        content.querySelector('#cr-d1').classList.add('visible');
        await wait(1200);
        if (self._skipped) return;
        content.querySelector('#cr-d2').classList.add('visible');
        await wait(1200);
        if (self._skipped) return;
        content.querySelector('#cr-d3').classList.add('visible');
        await wait(3000);
        if (self._skipped) return;
        await fadeOut();

        /* ─── ACT 6: INSPIRATION & THANKS ────────────────── */
        self._setAct(5);
        self._setMood(300, 0.35, 0.12, 2);
        clear();

        const thanks = [
            { text: 'INSPIRED BY', accent: true },
            { text: 'Real events in cybersecurity and intelligence' },
            { text: 'The hacker ethic of transparency and accountability' },
            { text: 'Classic point-and-click adventure games' },
            { text: 'The Dutch countryside and its hidden history' },
            { text: 'Concerns about weaponized technology' },
            { text: '' },
            { text: 'SPECIAL THANKS', accent: true },
            { text: 'The Chaos Computer Club community' },
            { text: 'Meshtastic developers and users' },
            { text: 'Security researchers who keep us safe' },
            { text: 'Everyone fighting for digital rights' },
        ];

        let thanksHTML = '';
        thanks.forEach((t, i) => {
            const cls = t.accent ? 'cr-thanks-item cr-thanks-accent' : 'cr-thanks-item';
            thanksHTML += `<div class="${cls}" id="cr-th-${i}">${t.text || '&nbsp;'}</div>`;
        });
        content.innerHTML = thanksHTML;
        fadeIn();
        await wait(400);

        // Closing melody
        self._playNote(523, 1.0, 0);    // C5
        self._playNote(494, 1.0, 0.3);  // B4
        self._playNote(440, 1.0, 0.6);  // A4
        self._playNote(392, 2.0, 0.9);  // G4
        self._playNote(523, 2.5, 1.5);  // C5

        for (let i = 0; i < thanks.length; i++) {
            if (self._skipped) return;
            content.querySelector(`#cr-th-${i}`).classList.add('visible');
            await wait(thanks[i].text === '' ? 400 : 800);
        }
        await wait(4000);
        if (self._skipped) return;
        await fadeOut();

        /* ─── ACT 7: FINAL TITLE ─────────────────────────── */
        self._setAct(6);
        self._setMood(180, 0.4, 0.06, 3);
        clear();
        content.innerHTML = `
            <div class="cr-final-title" id="cr-ft">THANK YOU<br>FOR PLAYING</div>
            <div class="cr-copyright" id="cr-cp">&copy; 2026 REIN VELT</div>
            <div class="cr-sierra" id="cr-si">A Sierra-inspired cybersecurity adventure</div>
            <div class="cr-return" id="cr-ret">RETURN TO TITLE</div>
        `;
        fadeIn();
        await wait(600);
        if (self._skipped) return;

        // Final chord
        self._playNote(262, 1.5, 0);    // C4
        self._playNote(330, 1.5, 0.4);  // E4
        self._playNote(392, 1.5, 0.8);  // G4
        self._playNote(523, 3.0, 1.2);  // C5

        content.querySelector('#cr-ft').classList.add('visible');
        content.querySelector('#cr-cp').classList.add('visible');
        content.querySelector('#cr-si').classList.add('visible');
        await wait(3000);
        if (self._skipped) return;

        const retBtn = content.querySelector('#cr-ret');
        retBtn.classList.add('visible');
        retBtn.addEventListener('click', () => self._exitCredits(game));

        // Slowly fade soundtrack
        self._setMood(100, 0.15, 0.02, 10);
    },

    /* ══════════════════════════════════════════════════════════
       SKIP / EXIT
       ══════════════════════════════════════════════════════════ */
    _skipToEnd(game) {
        if (this._skipped) return;
        this._skipped = true;
        this._clearTimers();

        const content = document.getElementById('cr-content');
        if (content) {
            content.classList.remove('visible', 'fade-out');
            content.innerHTML = `
                <div class="cr-final-title visible">THANK YOU<br>FOR PLAYING</div>
                <div class="cr-copyright visible">&copy; 2026 REIN VELT</div>
                <div class="cr-sierra visible">A Sierra-inspired cybersecurity adventure</div>
                <div class="cr-return visible" id="cr-ret-skip">RETURN TO TITLE</div>
            `;
            requestAnimationFrame(() => content.classList.add('visible'));
            content.querySelector('#cr-ret-skip').addEventListener('click', () => {
                this._exitCredits(game);
            });
        }

        // Mark all dots done
        document.querySelectorAll('.cr-dot').forEach(d => {
            d.classList.remove('active');
            d.classList.add('done');
        });
    },

    _exitCredits(game) {
        this._skipped = true;
        this._clearTimers();
        this._stopAudio();

        const overlay = this._overlayEl;
        if (overlay) {
            overlay.style.transition = 'opacity 1.5s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                if (this._styleEl) this._styleEl.remove();
                if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
                const chars = document.getElementById('scene-characters');
                if (chars) chars.style.display = '';
                window.location.reload();
            }, 1600);
        } else {
            window.location.reload();
        }
    },

    /* ══════════════════════════════════════════════════════════
       ON EXIT (cleanup)
       ══════════════════════════════════════════════════════════ */
    onExit(game) {
        this._skipped = true;
        this._clearTimers();
        this._stopAudio();
        if (this._overlayEl) this._overlayEl.remove();
        if (this._styleEl) this._styleEl.remove();
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
        const chars = document.getElementById('scene-characters');
        if (chars) chars.style.display = '';
    }
};
