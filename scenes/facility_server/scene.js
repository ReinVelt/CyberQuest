/**
 * Facility Server Room – Cinematic Climax
 * ═══════════════════════════════════════════════════════════
 * Multi-phase Hollywood-style sequence:
 *   Phase 0 – Descent (atmospheric entry)
 *   Phase 1 – Override Panel (door unlock)
 *   Phase 2 – Terminal Access + Evidence Download (progress bar)
 *   Phase 3 – Volkov Confrontation (red shift, heartbeat audio)
 *   Phase 4 – Kubecka Arrives (weapon draw, freeze)
 *   Phase 5 – Eva's Arrest (Bundeswehr MPs flood in)
 *   Phase 6 – Aftermath dialogue + transition to debrief
 *
 * Features: Web Audio (drone, heartbeat, alarms, data blips),
 *           CSS cinematics (letterbox, screen-shake, red pulse,
 *           scanlines, alert strobes, HUD overlays),
 *           progress bar with fake filesystem, NPC reveals.
 * ═══════════════════════════════════════════════════════════
 */

const FacilityServerScene = {
    id: 'facility_server',
    name: 'Server Room - Basement',
    background: 'assets/images/scenes/facility_server.svg',
    description: 'Air-conditioned server room. Racks of equipment humming. This is where the secrets are kept.',
    playerStart: { x: 20, y: 85 },

    idleThoughts: [
        "Rows of servers. So much data.",
        "Air conditioning is loud. Good cover.",
        "Where's that terminal Eva mentioned?",
        "Time is running out.",
        "Get the evidence. Get out."
    ],

    state: {
        doorUnlocked: false,
        terminalAccessed: false,
        evidenceDownloaded: false,
        confrontationStarted: false,
        phase: -1
    },

    /* ── bookkeeping ─────────────────────────────────────────── */
    _timeoutIds: [],
    _intervalIds: [],
    _animFrameId: null,
    _audioCtx: null,
    _audioNodes: [],
    _styleEl: null,
    _overlayEl: null,

    _clearTimeouts() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        this._intervalIds.forEach(id => clearInterval(id));
        this._intervalIds = [];
        if (this._animFrameId) { cancelAnimationFrame(this._animFrameId); this._animFrameId = null; }
    },
    _schedule(fn, ms) { const id = setTimeout(fn, ms); this._timeoutIds.push(id); return id; },
    _repeat(fn, ms) { const id = setInterval(fn, ms); this._intervalIds.push(id); return id; },

    /* ── AUDIO ENGINE ────────────────────────────────────────── */
    _initAudio() {
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            const ctx = new AC();
            this._audioCtx = ctx;
            const master = ctx.createGain();
            master.gain.value = 0.3;
            master.connect(ctx.destination);
            this._masterGain = master;

            // Ominous low drone
            const droneA = ctx.createOscillator();
            const droneB = ctx.createOscillator();
            const droneGain = ctx.createGain();
            const droneFilter = ctx.createBiquadFilter();
            droneA.type = 'sawtooth'; droneA.frequency.value = 32;
            droneB.type = 'sawtooth'; droneB.frequency.value = 33.2;
            droneFilter.type = 'lowpass'; droneFilter.frequency.value = 90; droneFilter.Q.value = 5;
            droneGain.gain.value = 0;
            droneA.connect(droneFilter); droneB.connect(droneFilter);
            droneFilter.connect(droneGain); droneGain.connect(master);
            droneA.start(); droneB.start();
            droneGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 3);
            this._droneGain = droneGain;
            this._droneFilter = droneFilter;
            this._audioNodes.push(droneA, droneB);
        } catch(e) { console.warn('ServerRoom audio init failed:', e); }
    },

    _playBeep() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx, t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = 1200 + Math.random() * 400;
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(g); g.connect(this._masterGain);
        osc.start(t); osc.stop(t + 0.07);
    },

    _playDataBlip() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx, t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square'; osc.frequency.value = 600 + Math.random() * 800;
        g.gain.setValueAtTime(0.04, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc.connect(g); g.connect(this._masterGain);
        osc.start(t); osc.stop(t + 0.04);
    },

    _playImpact() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx, t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(22, t + 0.4);
        g.gain.setValueAtTime(0.7, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.connect(g); g.connect(this._masterGain);
        osc.start(t); osc.stop(t + 0.6);
        // noise click
        const n = ctx.createBufferSource();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        n.buffer = buf;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.25, t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        n.connect(ng); ng.connect(this._masterGain);
        n.start(t);
    },

    _playHeartbeat() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx, t = ctx.currentTime;
        [0, 0.14].forEach(offset => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(48, t + offset);
            osc.frequency.exponentialRampToValueAtTime(28, t + offset + 0.18);
            g.gain.setValueAtTime(offset === 0 ? 0.65 : 0.35, t + offset);
            g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.25);
            osc.connect(g); g.connect(this._masterGain);
            osc.start(t + offset); osc.stop(t + offset + 0.3);
        });
    },

    _playAlarm() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx, t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.setValueAtTime(660, t + 0.15);
        osc.frequency.setValueAtTime(880, t + 0.3);
        osc.frequency.setValueAtTime(660, t + 0.45);
        g.gain.setValueAtTime(0.12, t);
        g.gain.linearRampToValueAtTime(0, t + 0.6);
        osc.connect(g); g.connect(this._masterGain);
        osc.start(t); osc.stop(t + 0.65);
    },

    _playDoorUnlock() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx, t = ctx.currentTime;
        // Electronic confirm
        [800, 1000, 1200].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine'; osc.frequency.value = freq;
            g.gain.setValueAtTime(0.1, t + i * 0.12);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.15);
            osc.connect(g); g.connect(this._masterGain);
            osc.start(t + i * 0.12); osc.stop(t + i * 0.12 + 0.2);
        });
        // Mechanical clunk
        this._schedule(() => this._playImpact(), 400);
    },

    _playTransferComplete() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx, t = ctx.currentTime;
        [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle'; osc.frequency.value = freq;
            g.gain.setValueAtTime(0.08, t + i * 0.15);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.3);
            osc.connect(g); g.connect(this._masterGain);
            osc.start(t + i * 0.15); osc.stop(t + i * 0.15 + 0.35);
        });
    },

    _setDroneIntensity(freq, gain, dur) {
        if (!this._droneFilter || !this._audioCtx) return;
        const t = this._audioCtx.currentTime;
        this._droneFilter.frequency.linearRampToValueAtTime(freq, t + dur);
        this._droneGain.gain.linearRampToValueAtTime(gain, t + dur);
    },

    _stopAudio() {
        try {
            if (this._droneGain && this._audioCtx) {
                this._droneGain.gain.linearRampToValueAtTime(0, this._audioCtx.currentTime + 0.8);
            }
            setTimeout(() => {
                this._audioNodes.forEach(n => { try { n.stop(); } catch(e){} });
                this._audioNodes = [];
                if (this._audioCtx) { this._audioCtx.close().catch(()=>{}); this._audioCtx = null; }
            }, 900);
        } catch(e) {}
    },

    /* ── HOTSPOTS (minimal — cinematics drive the scene) ─────── */
    hotspots: [
        {
            id: 'server_racks',
            name: 'Server Racks',
            x: 10.42,
            y: 18.52,
            width: 57.29,
            height: 55.56,
            cursor: 'look',
            action: function(game) {
                game.showDialogue([
                    "Racks of blade servers. Enterprise-grade equipment.",
                    "Cables everywhere. Blinking status LEDs.",
                    "This is German military infrastructure. Top tier."
                ], "Ryan");
            }
        },
        {
            id: 'cooling_system',
            name: 'Cooling System',
            x: 2.60,
            y: 13.89,
            width: 6.25,
            height: 23.15,
            cursor: 'look',
            action: function(game) {
                game.showDialogue([
                    "Industrial air conditioning. Keeping the servers cool.",
                    "The noise is actually helpful. Covers my movements."
                ], "Ryan");
            }
        },
        {
            id: 'volkov_npc',
            name: 'Dmitri Volkov',
            x: 16, y: 63, width: 5.2, height: 18,
            cursor: 'pointer',
            enabled: () => FacilityServerScene.state.confrontationStarted,
            action: function(game) {
                game.showDialogue([
                    "Dr. Dmitri Volkov. The architect of Operation ZERFALL.",
                    "Cold, calculating. A scientist who chose power over humanity."
                ], "Ryan");
            }
        },
        {
            id: 'kubecka_npc',
            name: 'Chris Kubecka',
            x: 0.5, y: 62, width: 5.2, height: 18,
            cursor: 'pointer',
            enabled: (game) => FacilityServerScene.state.confrontationStarted && game.getFlag('kubecka_arrived'),
            action: function(game) {
                game.showDialogue([
                    "Chris Kubecka. American cybersecurity expert.",
                    "Works with NATO cyber defense. Been tracking ZERFALL for months.",
                    "Right person, right place, right time."
                ], "Ryan");
            }
        },
        {
            id: 'eva_npc',
            name: 'Eva Weber',
            x: 22, y: 63.4, width: 5.2, height: 18,
            cursor: 'pointer',
            enabled: (game) => FacilityServerScene.state.confrontationStarted && game.getFlag('eva_arrived'),
            action: function(game) {
                game.showDialogue([
                    "Eva Weber. BND agent. Klaus's daughter.",
                    "She risked everything — her career, her freedom — to stop this.",
                    "Her father would be proud."
                ], "Ryan");
            }
        }
    ],

    /* ════════════════════════════════════════════════════════════
       ON ENTER — Build cinematic overlay, start Phase 0
       ════════════════════════════════════════════════════════════ */
    onEnter(game) {
        // Show ally coordination overlay
        if (window.AllyOverlay) window.AllyOverlay.show(game);
        const self = this;
        self.state = {
            doorUnlocked: false, terminalAccessed: false,
            evidenceDownloaded: false, confrontationStarted: false, phase: -1
        };
        self._clearTimeouts();
        self._initAudio();

        // Hide stuff while cinematic runs
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) charactersContainer.style.display = 'none';
        const dialogueBox = document.getElementById('dialogue-box');
        if (dialogueBox) dialogueBox.classList.add('hidden');

        // ── INJECT STYLES ────────────────────────────────────
        const style = document.createElement('style');
        style.id = 'fs-cinematic-style';
        style.textContent = `
/* === FS CINEMATIC BASE === */
#fs-overlay {
    position: fixed; inset: 0; z-index: 9000;
    pointer-events: all; overflow: hidden;
    font-family: 'Courier New', monospace;
    color: #fff; user-select: none;
}
#fs-overlay * { box-sizing: border-box; }

/* Letterbox */
.fs-bar { position: absolute; left: 0; right: 0; background: #000; z-index: 20;
    transition: height 1.5s ease; }
.fs-bar-top { top: 0; height: 0; }
.fs-bar-bot { bottom: 0; height: 0; }
.fs-bar.active { height: 6vh; }

/* Vignette / Scanlines */
.fs-vignette { position: absolute; inset: 0; z-index: 8;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%);
    pointer-events: none; }
.fs-scanlines { position: absolute; inset: 0; z-index: 9; pointer-events: none;
    background: repeating-linear-gradient(0deg,
        rgba(0,255,255,0.008) 0px, transparent 1px,
        transparent 3px, rgba(0,255,255,0.008) 4px);
    mix-blend-mode: screen; }

/* Skip */
.fs-skip {
    position: fixed; bottom: 2vh; right: 3vw; z-index: 9999;
    font-family: 'Courier New', monospace;
    font-size: 0.7em; letter-spacing: 3px;
    color: rgba(255,255,255,0.2); background: none;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 5px 14px; cursor: pointer; border-radius: 2px;
    transition: color 0.3s, border-color 0.3s;
}
.fs-skip:hover { color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.3); }

/* Central panel */
.fs-panel {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 15; text-align: center;
    width: 90%; max-width: 720px;
    opacity: 0; transition: opacity 1.5s ease;
}
.fs-panel.visible { opacity: 1; }
.fs-panel.fade-out { opacity: 0; transition: opacity 0.6s ease; }

/* Phase 0: Descent */
.fs-descent-text {
    font-size: 0.8em; letter-spacing: 4px; color: rgba(0,255,255,0.5);
    text-transform: uppercase; margin: 12px 0;
    opacity: 0; transform: translateY(10px);
    transition: all 1s ease;
}
.fs-descent-text.visible { opacity: 1; transform: translateY(0); }

/* Phase 1: Override */
.fs-override-box {
    border: 1px solid rgba(0,255,255,0.15);
    background: rgba(0,10,20,0.9);
    padding: 30px 40px; border-radius: 3px;
    max-width: 400px; margin: 0 auto;
}
.fs-override-title {
    font-size: 0.7em; letter-spacing: 6px; color: rgba(0,255,255,0.4);
    text-transform: uppercase; margin-bottom: 18px;
}
.fs-code-display {
    font-size: 3em; letter-spacing: 18px; color: #00ffff;
    text-shadow: 0 0 20px rgba(0,255,255,0.6);
    height: 60px; line-height: 60px;
}
.fs-code-display .digit { opacity: 0; transition: opacity 0.3s ease; display: inline-block; }
.fs-code-display .digit.typed { opacity: 1; }
.fs-lock-status {
    margin-top: 16px; font-size: 0.7em; letter-spacing: 4px;
    transition: color 0.5s ease;
}
.fs-lock-red { color: #ff3333; text-shadow: 0 0 8px rgba(255,51,51,0.5); }
.fs-lock-green { color: #00ff41; text-shadow: 0 0 8px rgba(0,255,65,0.5); }

/* Phase 2: Terminal + Download */
.fs-terminal {
    text-align: left; background: rgba(0,5,10,0.95);
    border: 1px solid rgba(0,255,65,0.12);
    padding: 24px 28px; border-radius: 3px;
    font-size: 0.75em; line-height: 1.9;
    max-height: 65vh; overflow-y: auto;
}
.fs-term-line {
    color: #00ff41; opacity: 0; transform: translateX(-6px);
    transition: all 0.3s ease; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
}
.fs-term-line.typed { opacity: 1; transform: translateX(0); }
.fs-term-warning { color: #ff3333 !important; text-shadow: 0 0 6px rgba(255,51,51,0.4); }
.fs-term-gold { color: #ffd700 !important; text-shadow: 0 0 6px rgba(255,215,0,0.3); }
.fs-term-cyan { color: #00ffff !important; }
.fs-term-dim { color: rgba(0,255,65,0.35) !important; }
.fs-cursor { display: inline-block; width: 7px; height: 1em;
    background: #00ff41; vertical-align: text-bottom;
    animation: fs-blink 0.6s step-end infinite; }
@keyframes fs-blink { 0%,100% { opacity:1; } 50% { opacity:0; } }

/* Download bar */
.fs-download-bar {
    margin: 16px 0 8px; border: 1px solid rgba(0,255,255,0.15);
    height: 20px; border-radius: 2px; overflow: hidden;
    position: relative; background: rgba(0,10,20,0.8);
}
.fs-download-fill {
    height: 100%; width: 0%;
    background: linear-gradient(90deg, #00ff41, #00ffff);
    transition: width 0.3s ease;
    box-shadow: 0 0 12px rgba(0,255,255,0.4);
}
.fs-download-pct {
    position: absolute; right: 8px; top: 0; line-height: 20px;
    font-size: 0.7em; color: #fff; letter-spacing: 2px;
}
.fs-file-ticker {
    font-size: 0.6em; color: rgba(0,255,255,0.5);
    letter-spacing: 1px; margin-top: 6px; height: 18px;
    overflow: hidden; text-align: left;
}

/* Red alert pulse (confrontation) */
.fs-red-pulse {
    position: absolute; inset: 0; z-index: 5;
    background: radial-gradient(ellipse at center, rgba(255,0,0,0.08), transparent 70%);
    opacity: 0; pointer-events: none;
}
.fs-red-pulse.beating { animation: fs-hb-pulse 1s ease-in-out infinite; }
@keyframes fs-hb-pulse {
    0%   { opacity: 0; } 12%  { opacity: 1; } 25% { opacity: 0.15; }
    37%  { opacity: 0.7; } 55% { opacity: 0; } 100% { opacity: 0; }
}

/* Amber alert strobe */
.fs-alert-strobe {
    position: absolute; inset: 0; z-index: 6;
    background: rgba(255,120,0,0.06); opacity: 0;
    pointer-events: none;
}
.fs-alert-strobe.active { animation: fs-strobe 0.5s ease-in-out 3; }
@keyframes fs-strobe { 0%,100% { opacity:0; } 50% { opacity:1; } }

/* Screen shake */
@keyframes fs-shake {
    0%   { transform: translate(0,0); }
    15%  { transform: translate(-3px,2px) rotate(-0.3deg); }
    30%  { transform: translate(3px,-2px) rotate(0.3deg); }
    45%  { transform: translate(-2px,1px) rotate(-0.1deg); }
    60%  { transform: translate(2px,-1px) rotate(0.2deg); }
    80%  { transform: translate(-1px,1px); }
    100% { transform: translate(0,0); }
}
.fs-shake { animation: fs-shake 0.35s ease-out; }

/* Flash */
.fs-flash {
    position: absolute; inset: 0; z-index: 50;
    background: #fff; opacity: 0; pointer-events: none;
}
.fs-flash.fire { animation: fs-flash-fire 0.1s ease-out forwards; }
@keyframes fs-flash-fire { 0% { opacity: 0.5; } 100% { opacity: 0; } }

/* Confrontation text */
.fs-confront-text {
    font-family: 'Georgia', serif;
    font-size: 1.3em; line-height: 2.2;
    color: rgba(255,255,255,0); margin: 14px 0;
    transform: translateY(8px);
    transition: all 1.5s ease;
}
.fs-confront-text.visible { transform: translateY(0); }
.fs-ct-narration { font-style: italic; }
.fs-ct-narration.visible { color: rgba(180,180,200,0.7); }
.fs-ct-volkov.visible { color: rgba(255,100,100,0.9);
    text-shadow: 0 0 12px rgba(255,100,100,0.3); }
.fs-ct-ryan.visible { color: rgba(0,255,255,0.9);
    text-shadow: 0 0 12px rgba(0,255,255,0.3); }
.fs-ct-kubecka.visible { color: rgba(255,215,0,0.9);
    text-shadow: 0 0 12px rgba(255,215,0,0.3); font-weight: bold; }
.fs-ct-eva.visible { color: rgba(180,140,255,0.9);
    text-shadow: 0 0 12px rgba(180,140,255,0.3); }
.fs-ct-bold { font-weight: bold; font-size: 1.1em; }
.fs-ct-whisper { font-size: 0.85em; letter-spacing: 2px; }

/* Phase label */
.fs-phase-label {
    position: absolute; top: 8vh; left: 50%;
    transform: translateX(-50%); z-index: 16;
    font-size: 0.55em; letter-spacing: 8px; text-transform: uppercase;
    color: rgba(255,255,255,0); transition: color 1s ease;
}
.fs-phase-label.visible { color: rgba(255,255,255,0.2); }

/* HUD corner elements */
.fs-hud-tl, .fs-hud-br {
    position: absolute; z-index: 14;
    font-size: 0.55em; letter-spacing: 2px;
    color: rgba(0,255,255,0.2);
    pointer-events: none;
}
.fs-hud-tl { top: 7vh; left: 3vw; text-align: left; }
.fs-hud-br { bottom: 7vh; right: 3vw; text-align: right; }
.fs-hud-time { color: rgba(0,255,65,0.3); }

/* NPC card reveal */
.fs-npc-card {
    position: absolute; z-index: 17;
    font-family: 'Courier New', monospace;
    font-size: 0.7em; letter-spacing: 3px;
    text-transform: uppercase; padding: 6px 16px;
    border-radius: 2px; opacity: 0;
    transform: translateY(8px);
    transition: all 0.8s ease;
}
.fs-npc-card.visible { opacity: 1; transform: translateY(0); }
.fs-npc-volkov { bottom: 32vh; left: 16%; color: #ff5555;
    border: 1px solid rgba(255,85,85,0.2); background: rgba(255,85,85,0.05); }
.fs-npc-kubecka { bottom: 32vh; left: 1%; color: #ffd700;
    border: 1px solid rgba(255,215,0,0.2); background: rgba(255,215,0,0.05); }
.fs-npc-eva { bottom: 32vh; left: 22%; color: #b48cff;
    border: 1px solid rgba(180,140,255,0.2); background: rgba(180,140,255,0.05); }

/* Aftermath */
.fs-aftermath-line {
    font-family: 'Georgia', serif;
    font-size: 1.15em; line-height: 2.4;
    color: rgba(255,255,255,0); margin: 10px 0;
    transition: color 1.5s ease;
}
.fs-aftermath-line.visible { color: rgba(255,255,255,0.8); }
.fs-aftermath-gold.visible { color: rgba(255,215,0,0.8);
    text-shadow: 0 0 10px rgba(255,215,0,0.2); }
.fs-aftermath-cyan.visible { color: rgba(0,255,255,0.8);
    text-shadow: 0 0 10px rgba(0,255,255,0.2); }
.fs-continue-btn {
    margin-top: 30px; font-family: 'Courier New', monospace;
    font-size: 0.9em; letter-spacing: 5px;
    color: rgba(255,255,255,0); cursor: pointer;
    transition: color 1.5s ease 0.5s;
    display: inline-block;
}
.fs-continue-btn.visible { color: rgba(255,255,255,0.8);
    animation: fs-continue-pulse 2.5s ease-in-out 1s infinite; }
@keyframes fs-continue-pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

@media (max-width: 768px) {
    .fs-terminal { font-size: 0.6em; padding: 14px 16px; }
    .fs-code-display { font-size: 2em; letter-spacing: 10px; }
    .fs-confront-text { font-size: 1em; }
    .fs-override-box { padding: 20px 24px; }
}
`;
        document.head.appendChild(style);
        self._styleEl = style;

        // ── BUILD OVERLAY ────────────────────────────────────
        const overlay = document.createElement('div');
        overlay.id = 'fs-overlay';
        overlay.innerHTML =
            '<div class="fs-bar fs-bar-top" id="fs-bar-top"></div>' +
            '<div class="fs-bar fs-bar-bot" id="fs-bar-bot"></div>' +
            '<div class="fs-vignette"></div>' +
            '<div class="fs-scanlines"></div>' +
            '<div class="fs-red-pulse" id="fs-red-pulse"></div>' +
            '<div class="fs-alert-strobe" id="fs-alert-strobe"></div>' +
            '<div class="fs-flash" id="fs-flash"></div>' +
            '<div class="fs-hud-tl" id="fs-hud-tl">KELLER B // SERVER ROOM<br><span class="fs-hud-time" id="fs-hud-time">23:14:37</span></div>' +
            '<div class="fs-hud-br" id="fs-hud-br">STECKERDOSER HEIDE<br>FORSCHUNGSZENTRUM</div>' +
            '<div class="fs-phase-label" id="fs-phase-label"></div>' +
            '<div class="fs-panel" id="fs-panel"></div>' +
            '<button class="fs-skip" id="fs-skip">SKIP &#9658;&#9658;</button>';
        document.body.appendChild(overlay);
        self._overlayEl = overlay;

        // HUD clock
        let hudSec = 37;
        self._repeat(() => {
            hudSec++;
            if (hudSec >= 60) hudSec = 0;
            const el = document.getElementById('fs-hud-time');
            if (el) el.textContent = '23:14:' + String(hudSec).padStart(2, '0');
        }, 1000);

        // NPC characters (hidden initially)
        if (charactersContainer) {
            ['volkov', 'kubecka', 'eva'].forEach(id => {
                const existing = document.getElementById(id + '_character');
                if (existing) existing.remove();
            });
            const npcs = [
                { id: 'volkov_character', src: 'assets/images/characters/volkov_southpark.svg', left: '16%' },
                { id: 'kubecka_character', src: 'assets/images/characters/kubecka_southpark.svg', left: '0.5%' },
                { id: 'eva_character', src: 'assets/images/characters/eva_southpark.svg', left: '22%' }
            ];
            npcs.forEach(npc => {
                const img = document.createElement('img');
                img.id = npc.id;
                img.src = npc.src;
                img.style.cssText = 'position:absolute;left:' + npc.left + ';bottom:0;width:5.2%;height:auto;opacity:0;transition:opacity 1s;pointer-events:none;z-index:10;';
                charactersContainer.appendChild(img);
            });
        }

        // ── FX HELPERS ───────────────────────────────────────
        function flash() {
            const f = document.getElementById('fs-flash');
            if (f) { f.classList.remove('fire'); void f.offsetWidth; f.classList.add('fire'); }
        }
        function shake() {
            const o = document.getElementById('fs-overlay');
            if (o) { o.classList.remove('fs-shake'); void o.offsetWidth; o.classList.add('fs-shake'); }
        }
        function setPhaseLabel(text) {
            const el = document.getElementById('fs-phase-label');
            if (!el) return;
            el.classList.remove('visible');
            el.textContent = text;
            self._schedule(() => el.classList.add('visible'), 100);
        }
        function clearPanel() {
            const p = document.getElementById('fs-panel');
            if (p) { p.classList.remove('visible'); p.classList.add('fade-out'); }
        }
        function showPanel(html) {
            const p = document.getElementById('fs-panel');
            if (!p) return;
            p.classList.remove('visible', 'fade-out');
            p.innerHTML = html;
            self._schedule(() => p.classList.add('visible'), 50);
        }

        // ── SKIP ──────────────────────────────────────────
        document.getElementById('fs-skip')?.addEventListener('click', function(e) {
            e.stopPropagation();
            self._finishAndTransition(game, charactersContainer);
        });

        // ══════════════════════════════════════════════════════
        // PHASE 0 – DESCENT
        // ══════════════════════════════════════════════════════
        self._schedule(() => {
            document.getElementById('fs-bar-top')?.classList.add('active');
            document.getElementById('fs-bar-bot')?.classList.add('active');
            setPhaseLabel('Basement Level B');

            showPanel(
                '<div class="fs-descent-text" id="fd0">Concrete stairs. Descending.</div>' +
                '<div class="fs-descent-text" id="fd1">Fluorescent lights hum above. The air turns cold.</div>' +
                '<div class="fs-descent-text" id="fd2">Server fans somewhere ahead — a low, constant roar.</div>' +
                '<div class="fs-descent-text" id="fd3" style="color:rgba(0,255,65,0.5)">KELLER B — SERVERRAUM</div>' +
                '<div class="fs-descent-text" id="fd4">Blue override panel on the right. Code: 2847.</div>'
            );

            ['fd0','fd1','fd2','fd3','fd4'].forEach((id, i) => {
                self._schedule(() => {
                    document.getElementById(id)?.classList.add('visible');
                    self._playBeep();
                }, 800 + i * 1800);
            });

            // → Phase 1
            self._schedule(() => startPhase1(), 800 + 5 * 1800 + 1500);
        }, 600);

        // ══════════════════════════════════════════════════════
        // PHASE 1 – OVERRIDE PANEL
        // ══════════════════════════════════════════════════════
        function startPhase1() {
            self.state.phase = 1;
            setPhaseLabel('Biometric Override');
            self._setDroneIntensity(130, 0.45, 2);
            clearPanel();

            self._schedule(() => {
                showPanel(
                    '<div class="fs-override-box">' +
                        '<div class="fs-override-title">Maintenance Override Panel</div>' +
                        '<div class="fs-code-display" id="fs-code">' +
                            '<span class="digit" id="fsd0">2</span>' +
                            '<span class="digit" id="fsd1">8</span>' +
                            '<span class="digit" id="fsd2">4</span>' +
                            '<span class="digit" id="fsd3">7</span>' +
                        '</div>' +
                        '<div class="fs-lock-status fs-lock-red" id="fs-lock">&#9679; LOCKED</div>' +
                    '</div>'
                );

                // Type digits one by one
                ['fsd0','fsd1','fsd2','fsd3'].forEach((id, i) => {
                    self._schedule(() => {
                        document.getElementById(id)?.classList.add('typed');
                        self._playBeep();
                    }, 600 + i * 500);
                });

                // Unlock
                self._schedule(() => {
                    const lock = document.getElementById('fs-lock');
                    if (lock) {
                        lock.classList.remove('fs-lock-red');
                        lock.classList.add('fs-lock-green');
                        lock.innerHTML = '&#9679; ACCESS GRANTED';
                    }
                    self._playDoorUnlock();
                    flash();
                    shake();
                    self.state.doorUnlocked = true;
                    game.setFlag('facility_password_solved', true);
                }, 600 + 4 * 500 + 600);

                // → Phase 2
                self._schedule(() => startPhase2(), 600 + 4 * 500 + 600 + 2500);
            }, 500);
        }

        // ══════════════════════════════════════════════════════
        // PHASE 2 – TERMINAL + EVIDENCE DOWNLOAD
        // ══════════════════════════════════════════════════════
        function startPhase2() {
            self.state.phase = 2;
            setPhaseLabel('Air-Gapped Terminal');
            self._setDroneIntensity(200, 0.5, 2);
            clearPanel();

            const files = [
                '/ZERFALL/PHASE_3/financial_transfers.enc',
                '/ZERFALL/PHASE_3/fsb_routing_codes.dat',
                '/ZERFALL/PHASE_3/target_hamburg.gpx',
                '/ZERFALL/PHASE_3/target_amsterdam.gpx',
                '/ZERFALL/PHASE_3/target_berlin.gpx',
                '/ZERFALL/PHASE_3/ambulance_exploit.py',
                '/ZERFALL/PHASE_3/hospital_firmware.bin',
                '/ZERFALL/PHASE_3/traffic_intercept.c',
                '/ZERFALL/PHASE_3/deployment_schedule.pdf',
                '/ZERFALL/PHASE_3/volkov_comms_fsb.pgp',
                '/ZERFALL/PHASE_3/signal_weapon_v3.2.elf',
                '/ZERFALL/PHASE_3/antenna_array_config.json',
                '/ZERFALL/DEPLOY/hamburg_activation.sh',
                '/ZERFALL/DEPLOY/amsterdam_activation.sh',
                '/ZERFALL/DEPLOY/berlin_activation.sh',
                '/ZERFALL/COMMS/moscow_handler_12.enc',
                '/ZERFALL/COMMS/payment_btc_wallets.csv',
                '/ZERFALL/COMMS/dead_drops_schedule.pdf',
                '/VOLKOV_PERSONAL/passport_scan_ru.jpg',
                '/VOLKOV_PERSONAL/fsb_commission_1998.pdf',
                '/VOLKOV_PERSONAL/offshore_cayman.xlsx'
            ];

            self._schedule(() => {
                const termLines = [
                    { text: 'root@airgap-srv:~$ _', cls: '' },
                    { text: '> SYSTEM: VOLKOV_D — ACCESS LEVEL: ADMINISTRATOR', cls: 'fs-term-cyan' },
                    { text: '> NAVIGATING: /ZERFALL/PHASE_3/', cls: '' },
                    { text: '', cls: 'fs-term-dim' },
                    { text: '&nbsp;&nbsp;financial_transfers.enc &nbsp; fsb_routing_codes.dat', cls: 'fs-term-dim' },
                    { text: '&nbsp;&nbsp;target_hamburg.gpx &nbsp;&nbsp;&nbsp;&nbsp; target_amsterdam.gpx', cls: 'fs-term-dim' },
                    { text: '&nbsp;&nbsp;target_berlin.gpx &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ambulance_exploit.py', cls: 'fs-term-dim' },
                    { text: '&nbsp;&nbsp;hospital_firmware.bin &nbsp;&nbsp; traffic_intercept.c', cls: 'fs-term-dim' },
                    { text: '', cls: '' },
                    { text: '&#9888; THREE CITIES. 72 HOURS.', cls: 'fs-term-warning' },
                    { text: '&#9888; AMBULANCE SYSTEMS. HOSPITAL EQUIPMENT. TRAFFIC CONTROL.', cls: 'fs-term-warning' },
                    { text: '', cls: '' },
                    { text: '> USB DRIVE DETECTED — INITIATING TRANSFER...', cls: 'fs-term-gold' }
                ];

                let html = '<div class="fs-terminal" id="fs-term">';
                termLines.forEach((line, i) => {
                    html += '<div class="fs-term-line ' + line.cls + '" id="fst' + i + '">' + line.text + '</div>';
                });
                html += '</div>';
                html += '<div class="fs-download-bar" id="fs-dlbar" style="opacity:0">' +
                    '<div class="fs-download-fill" id="fs-dlfill"></div>' +
                    '<div class="fs-download-pct" id="fs-dlpct">0%</div></div>';
                html += '<div class="fs-file-ticker" id="fs-ticker" style="opacity:0"></div>';
                showPanel(html);

                // Type lines
                termLines.forEach((line, i) => {
                    self._schedule(() => {
                        document.getElementById('fst' + i)?.classList.add('typed');
                        self._playDataBlip();
                    }, 400 + i * 500);
                });

                // Start download bar
                const dlStart = 400 + termLines.length * 500 + 800;
                self._schedule(() => {
                    const bar = document.getElementById('fs-dlbar');
                    const ticker = document.getElementById('fs-ticker');
                    if (bar) bar.style.opacity = '1';
                    if (ticker) ticker.style.opacity = '1';

                    let pct = 0;
                    let fileIdx = 0;
                    const dlInterval = setInterval(() => {
                        pct += 1 + Math.random() * 2.5;
                        if (pct > 100) pct = 100;
                        const fill = document.getElementById('fs-dlfill');
                        const pctEl = document.getElementById('fs-dlpct');
                        const tickEl = document.getElementById('fs-ticker');
                        if (fill) fill.style.width = pct.toFixed(0) + '%';
                        if (pctEl) pctEl.textContent = pct.toFixed(0) + '%';

                        // Cycle files
                        if (Math.random() > 0.4 && fileIdx < files.length) {
                            if (tickEl) tickEl.textContent = 'COPYING: ' + files[fileIdx];
                            fileIdx++;
                            self._playDataBlip();
                        }

                        if (pct >= 100) {
                            clearInterval(dlInterval);
                            if (pctEl) pctEl.textContent = '100%';
                            if (tickEl) tickEl.textContent = 'TRANSFER COMPLETE — 21 FILES — 847 MB';
                            self._playTransferComplete();
                            flash();

                            self.state.evidenceDownloaded = true;
                            game.setFlag('data_extracted', true);
                            game.setFlag('collected_evidence', true);

                            // → Phase 3 after beat
                            self._schedule(() => startPhase3(), 2000);
                        }
                    }, 180);
                    self._intervalIds.push(dlInterval);
                }, dlStart);
            }, 500);
        }

        // ══════════════════════════════════════════════════════
        // PHASE 3 – VOLKOV CONFRONTATION
        // ══════════════════════════════════════════════════════
        function startPhase3() {
            self.state.phase = 3;
            self.state.confrontationStarted = true;
            game.setStoryPart(19);
            setPhaseLabel('');
            self._setDroneIntensity(350, 0.6, 2);
            clearPanel();

            // Red pulse
            document.getElementById('fs-red-pulse')?.classList.add('beating');
            // Heartbeat
            let hbCount = 0;
            const hbInterval = setInterval(() => {
                if (self.state.phase !== 3 || hbCount > 20) { clearInterval(hbInterval); return; }
                self._playHeartbeat();
                hbCount++;
            }, 1000);
            self._intervalIds.push(hbInterval);

            // Show Volkov NPC
            const volkovChar = document.getElementById('volkov_character');
            if (volkovChar) { volkovChar.style.opacity = '1'; }

            self._schedule(() => {
                // NPC name card
                const overlay = document.getElementById('fs-overlay');
                if (overlay) {
                    const card = document.createElement('div');
                    card.className = 'fs-npc-card fs-npc-volkov';
                    card.id = 'fs-npc-volkov';
                    card.textContent = 'Dr. Dmitri Volkov';
                    overlay.appendChild(card);
                    self._schedule(() => card.classList.add('visible'), 100);
                }

                const lines = [
                    { text: '*Footsteps echo in the corridor behind you*', cls: 'fs-ct-narration' },
                    { text: '*Heavy door swings open. Blinding corridor light.*', cls: 'fs-ct-narration' },
                    { text: '"Interesting technique with the gate. Old KGB tradecraft."', cls: 'fs-ct-volkov' },
                    { text: '*You spin around. Dmitri Volkov fills the doorframe.*', cls: 'fs-ct-narration' },
                    { text: '"You must be E\'s new friend. The Dutch hacker."', cls: 'fs-ct-volkov' },
                    { text: '*His eyes move to the terminal. The USB drive. Your hands.*', cls: 'fs-ct-narration' },
                    { text: '"You have no idea what you\'re interfering with."', cls: 'fs-ct-volkov fs-ct-bold' },
                    { text: '"It\'s over, Volkov. I have everything."', cls: 'fs-ct-ryan' },
                    { text: '"ZERFALL. The FSB connection. Financial records. All of it."', cls: 'fs-ct-ryan' },
                    { text: '*Volkov\'s mouth curves. Not a smile. A calculation.*', cls: 'fs-ct-narration' },
                    { text: '"Perhaps. But I have something too."', cls: 'fs-ct-volkov' },
                    { text: '*He reaches slowly into his jacket—*', cls: 'fs-ct-narration fs-ct-bold' }
                ];

                let html = '<div id="fs-confront">';
                lines.forEach((l, i) => {
                    html += '<div class="fs-confront-text ' + l.cls + '" id="fsc' + i + '">' + l.text + '</div>';
                });
                html += '</div>';
                showPanel(html);

                lines.forEach((l, i) => {
                    self._schedule(() => {
                        const el = document.getElementById('fsc' + i);
                        if (el) el.classList.add('visible');
                        // Effects on key lines
                        if (i === 0) { self._playImpact(); shake(); } // footsteps
                        if (i === 1) flash(); // door
                        if (i === 2) self._playAlarm(); // Volkov speaks
                        if (i === 6) { shake(); self._playImpact(); } // threat
                        if (i === 11) { flash(); shake(); self._playImpact(); } // reaches into jacket
                    }, 800 + i * 1600);
                });

                // → Phase 4
                self._schedule(() => startPhase4(), 800 + lines.length * 1600 + 1500);
            }, 500);
        }

        // ══════════════════════════════════════════════════════
        // PHASE 4 – KUBECKA ARRIVES
        // ══════════════════════════════════════════════════════
        function startPhase4() {
            self.state.phase = 4;
            setPhaseLabel('');
            self._setDroneIntensity(500, 0.55, 1);
            clearPanel();

            // Stop heartbeat / red pulse
            document.getElementById('fs-red-pulse')?.classList.remove('beating');
            // Alert strobe
            document.getElementById('fs-alert-strobe')?.classList.add('active');

            // Show Kubecka
            const kubChar = document.getElementById('kubecka_character');
            if (kubChar) { kubChar.style.opacity = '1'; }
            game.setFlag('kubecka_arrived', true);

            self._schedule(() => {
                // NPC card
                const overlay = document.getElementById('fs-overlay');
                if (overlay) {
                    const card = document.createElement('div');
                    card.className = 'fs-npc-card fs-npc-kubecka';
                    card.id = 'fs-npc-kubecka';
                    card.textContent = 'Chris Kubecka — NATO Cyber';
                    overlay.appendChild(card);
                    self._schedule(() => card.classList.add('visible'), 100);
                }

                const lines = [
                    { text: '"I wouldn\'t."', cls: 'fs-ct-kubecka fs-ct-bold' },
                    { text: '*Chris Kubecka steps from the shadows behind Volkov.*', cls: 'fs-ct-narration' },
                    { text: '*Weapon drawn. Laser-steady. Trained on Volkov\'s center mass.*', cls: 'fs-ct-narration' },
                    { text: '"Hands where I can see them, Doctor."', cls: 'fs-ct-kubecka' },
                    { text: '*Volkov freezes. Calculates. Options closing like airlocks.*', cls: 'fs-ct-narration' },
                    { text: '*He raises his hands. Slowly. Deliberately.*', cls: 'fs-ct-narration' },
                    { text: '*Boots on concrete. Tactical gear. Automatic weapons.*', cls: 'fs-ct-narration fs-ct-bold' },
                    { text: '*Bundeswehr military police flood the corridor.*', cls: 'fs-ct-narration fs-ct-bold' },
                    { text: '*Red laser dots scatter across Volkov\'s chest.*', cls: 'fs-ct-narration' }
                ];

                let html = '<div id="fs-kubecka">';
                lines.forEach((l, i) => {
                    html += '<div class="fs-confront-text ' + l.cls + '" id="fsk' + i + '">' + l.text + '</div>';
                });
                html += '</div>';
                showPanel(html);

                lines.forEach((l, i) => {
                    self._schedule(() => {
                        const el = document.getElementById('fsk' + i);
                        if (el) el.classList.add('visible');
                        if (i === 0) { flash(); shake(); self._playImpact(); } // "I wouldn't"
                        if (i === 2) self._playAlarm();
                        if (i === 6) { shake(); self._playImpact(); } // MPs arrive
                        if (i === 7) self._playAlarm();
                    }, 600 + i * 1400);
                });

                // → Phase 5
                self._schedule(() => startPhase5(), 600 + lines.length * 1400 + 1500);
            }, 400);
        }

        // ══════════════════════════════════════════════════════
        // PHASE 5 – EVA'S ARREST
        // ══════════════════════════════════════════════════════
        function startPhase5() {
            self.state.phase = 5;
            setPhaseLabel('');
            self._setDroneIntensity(100, 0.25, 3);
            clearPanel();

            // Remove Volkov NPC card
            document.getElementById('fs-npc-volkov')?.remove();

            // Show Eva
            const evaChar = document.getElementById('eva_character');
            if (evaChar) { evaChar.style.opacity = '1'; }
            game.setFlag('eva_arrived', true);

            self._schedule(() => {
                // NPC card
                const overlay = document.getElementById('fs-overlay');
                if (overlay) {
                    const card = document.createElement('div');
                    card.className = 'fs-npc-card fs-npc-eva';
                    card.id = 'fs-npc-eva';
                    card.textContent = 'Eva Weber — BND';
                    overlay.appendChild(card);
                    self._schedule(() => card.classList.add('visible'), 100);
                }

                const lines = [
                    { text: '*Eva Weber enters with German intelligence officers.*', cls: 'fs-ct-narration' },
                    { text: '*She stops three paces from Volkov. Looks him in the eye.*', cls: 'fs-ct-narration' },
                    { text: '"Dmitri Volkov."', cls: 'fs-ct-eva fs-ct-bold' },
                    { text: '"You are under arrest for espionage against the Federal Republic of Germany."', cls: 'fs-ct-eva' },
                    { text: '"For the development of illegal signal weapons on German soil."', cls: 'fs-ct-eva' },
                    { text: '"And for the murder of Klaus Weber."', cls: 'fs-ct-eva fs-ct-bold' },
                    { text: '*Silence. The servers hum. A LED blinks somewhere.*', cls: 'fs-ct-narration fs-ct-whisper' },
                    { text: '"Klaus\'s daughter."', cls: 'fs-ct-volkov' },
                    { text: '"He would be proud. You have his fire."', cls: 'fs-ct-volkov' },
                    { text: '"My father is dead because of you."', cls: 'fs-ct-eva fs-ct-bold' },
                    { text: '*Her voice doesn\'t waver. Not once.*', cls: 'fs-ct-narration' },
                    { text: '"Take him away."', cls: 'fs-ct-eva' },
                    { text: '*Military police cuff Volkov. Arms behind his back.*', cls: 'fs-ct-narration' },
                    { text: '*He doesn\'t resist. He\'s already calculating appeal strategies.*', cls: 'fs-ct-narration fs-ct-whisper' },
                    { text: '*The door closes behind them. The room breathes again.*', cls: 'fs-ct-narration' }
                ];

                let html = '<div id="fs-eva">';
                lines.forEach((l, i) => {
                    html += '<div class="fs-confront-text ' + l.cls + '" id="fse' + i + '">' + l.text + '</div>';
                });
                html += '</div>';
                showPanel(html);

                lines.forEach((l, i) => {
                    self._schedule(() => {
                        const el = document.getElementById('fse' + i);
                        if (el) el.classList.add('visible');
                        if (i === 2) self._playImpact(); // "Dmitri Volkov"
                        if (i === 5) { flash(); shake(); self._playImpact(); } // murder
                        if (i === 9) self._playImpact(); // "My father"
                        if (i === 12) self._playAlarm(); // handcuffs
                    }, 600 + i * 1400);
                });

                // → Phase 6
                self._schedule(() => startPhase6(), 600 + lines.length * 1400 + 2000);
            }, 400);
        }

        // ══════════════════════════════════════════════════════
        // PHASE 6 – AFTERMATH
        // ══════════════════════════════════════════════════════
        function startPhase6() {
            self.state.phase = 6;
            setPhaseLabel('');
            self._setDroneIntensity(60, 0.1, 4);
            clearPanel();

            // Clean NPC cards
            document.querySelectorAll('.fs-npc-card').forEach(el => el.remove());
            document.getElementById('fs-alert-strobe')?.classList.remove('active');

            self._schedule(() => {
                const lines = [
                    { text: '"Nice work. You got the evidence?"', cls: 'fs-aftermath-line fs-aftermath-gold', speaker: 'Kubecka' },
                    { text: '*You hold up the USB drive. Everything.*', cls: 'fs-aftermath-line' },
                    { text: '"Financial records. Deployment schedules. FSB communications."', cls: 'fs-aftermath-line fs-aftermath-cyan' },
                    { text: '"NATO command is on the line."', cls: 'fs-aftermath-line fs-aftermath-gold', speaker: 'Eva' },
                    { text: '"Phase 3 will be stopped. Hamburg. Amsterdam. Berlin. All safe now."', cls: 'fs-aftermath-line fs-aftermath-gold' },
                    { text: '"It\'s over. Really over."', cls: 'fs-aftermath-line fs-aftermath-cyan' },
                    { text: '"This time."', cls: 'fs-aftermath-line' },
                    { text: '"But people like Volkov... there\'s always another operation."', cls: 'fs-aftermath-line' },
                    { text: '"Thank you. For my father. For everyone."', cls: 'fs-aftermath-line fs-aftermath-gold' },
                    { text: '"We did it together."', cls: 'fs-aftermath-line fs-aftermath-cyan' }
                ];

                let html = '<div id="fs-aftermath">';
                lines.forEach((l, i) => {
                    html += '<div class="' + l.cls + '" id="fsa' + i + '">' + l.text + '</div>';
                });
                html += '<div class="fs-continue-btn" id="fs-continue">&#9654; &nbsp; CONTINUE &nbsp; &#9664;</div>';
                html += '</div>';
                showPanel(html);

                lines.forEach((l, i) => {
                    self._schedule(() => {
                        document.getElementById('fsa' + i)?.classList.add('visible');
                    }, 600 + i * 1400);
                });

                // Show continue button
                self._schedule(() => {
                    document.getElementById('fs-continue')?.classList.add('visible');
                    game.questManager.complete('infiltrate_facility');
                }, 600 + lines.length * 1400 + 1000);

                // Click handler
                self._schedule(() => {
                    const btn = document.getElementById('fs-continue');
                    if (btn) {
                        btn.addEventListener('click', () => {
                            self._finishAndTransition(game, charactersContainer);
                        });
                    }
                    // Also click overlay
                    const ov = document.getElementById('fs-overlay');
                    if (ov) {
                        ov.addEventListener('click', function handler(e) {
                            if (self.state.phase === 6 && document.getElementById('fs-continue')?.classList.contains('visible')) {
                                ov.removeEventListener('click', handler);
                                self._finishAndTransition(game, charactersContainer);
                            }
                        });
                    }
                }, 600 + lines.length * 1400 + 1200);
            }, 600);
        }

        // Show notification
        game.showNotification('Server Room — Basement Level B');
    },

    /* ── FINISH + TRANSITION ──────────────────────────────────── */
    _finishAndTransition(game, charactersContainer) {
        if (this._finished) return;
        this._finished = true;
        this._clearTimeouts();
        this._stopAudio();

        const ov = document.getElementById('fs-overlay');
        if (ov) {
            ov.style.transition = 'opacity 1.5s ease';
            ov.style.opacity = '0';
            setTimeout(() => {
                ov.remove();
                this._styleEl?.remove();
                if (charactersContainer) charactersContainer.style.display = '';

                // Ensure flags set
                game.setFlag('data_extracted', true);
                game.setFlag('collected_evidence', true);
                this.state.evidenceDownloaded = true;
                this.state.confrontationStarted = true;
                game.setFlag('kubecka_arrived', true);
                game.setFlag('eva_arrived', true);
                game.setStoryPart(20);

                // Brief transition dialogue then drive home
                game.startDialogue([
                    { speaker: '', text: '═══════════════════════════════════════' },
                    { speaker: '', text: 'OPERATION ZERFALL — DATA EXTRACTED' },
                    { speaker: '', text: '═══════════════════════════════════════' },
                    { speaker: '', text: '' },
                    { speaker: 'Ryan', text: 'We have everything. Time to get out of here.' },
                    { speaker: 'Eva', text: 'Go. I\'ll cover the access logs from my end.' },
                    { speaker: 'Chris', text: 'Good luck, Ryan. Make it count.' },
                    { speaker: '', text: '*Ryan slips into the night. The Volvo waits in the shadows.*' },
                    { speaker: '', text: '' },
                    { speaker: '', text: '[Driving home...]' }
                ]);

                game.sceneTimeout(() => {
                    game.setFlag('driving_destination', 'home_from_facility');
                    game.loadScene('driving');
                }, 5000);
            }, 1600);
        }
    },

    /* ════════════════════════════════════════════════════════════
       ON EXIT
       ════════════════════════════════════════════════════════════ */
    onExit() {
        if (window.AllyOverlay) window.AllyOverlay.hide();
        this._clearTimeouts();
        this._stopAudio();
        this._finished = true;
        document.getElementById('fs-overlay')?.remove();
        document.getElementById('fs-cinematic-style')?.remove();
        this._styleEl?.remove();
        const volkov = document.getElementById('volkov_character');
        const kubecka = document.getElementById('kubecka_character');
        const eva = document.getElementById('eva_character');
        if (volkov) volkov.remove();
        if (kubecka) kubecka.remove();
        if (eva) eva.remove();
        const cc = document.getElementById('scene-characters');
        if (cc) cc.style.display = '';
    }
};

// Register
if (typeof window.game !== 'undefined') {
    window.game.registerScene(FacilityServerScene);
} else if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(FacilityServerScene);
}