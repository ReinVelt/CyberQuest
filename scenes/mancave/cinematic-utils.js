/**
 * Mancave Cinematic Utilities
 * ═══════════════════════════════════════════════════════════
 * Shared helpers for all mancave cinematic modules:
 *   - Web Audio engine (drone, beep, impact, heartbeat, type-tick, ringtone)
 *   - DOM overlay builder (letterbox, vignette, scanlines, skip button)
 *   - Typewriter text reveal
 *   - Phased content scheduler
 *   - CSS effect injection (screen-shake, flash, red-pulse)
 *   - Cleanup / destroy helpers
 * ═══════════════════════════════════════════════════════════
 */

window.MancaveCinematic = (function () {
    'use strict';

    /* ── State ────────────────────────────────────────────── */
    let _audioCtx = null;
    let _masterGain = null;
    let _droneGain = null;
    let _droneFilter = null;
    let _audioNodes = [];
    let _timeoutIds = [];
    let _intervalIds = [];
    let _animFrameId = null;
    let _styleEl = null;
    let _overlayEl = null;
    let _skipCallback = null;
    let _isActive = false;

    /* ══════════════════════════════════════════════════════════
       SCHEDULING
       ══════════════════════════════════════════════════════════ */
    function schedule(fn, ms) {
        const id = setTimeout(fn, ms);
        _timeoutIds.push(id);
        return id;
    }

    function repeat(fn, ms) {
        const id = setInterval(fn, ms);
        _intervalIds.push(id);
        return id;
    }

    function clearAllTimers() {
        _timeoutIds.forEach(id => clearTimeout(id));
        _timeoutIds = [];
        _intervalIds.forEach(id => clearInterval(id));
        _intervalIds = [];
        if (_animFrameId) { cancelAnimationFrame(_animFrameId); _animFrameId = null; }
    }

    /* ══════════════════════════════════════════════════════════
       WEB AUDIO ENGINE
       ══════════════════════════════════════════════════════════ */
    function initAudio() {
        if (_audioCtx) return;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            const ctx = new AC();
            _audioCtx = ctx;
            const master = ctx.createGain();
            master.gain.value = 0.3;
            master.connect(ctx.destination);
            _masterGain = master;
        } catch (e) { console.warn('MancaveCinematic audio init failed:', e); }
    }

    function getAudioCtx() { return _audioCtx; }

    /** Low ominous drone — two detuned sawtooths + LP filter */
    function startDrone(freqA, freqB, filterFreq) {
        if (!_audioCtx) return;
        const ctx = _audioCtx;
        const droneA = ctx.createOscillator();
        const droneB = ctx.createOscillator();
        const droneGainNode = ctx.createGain();
        const droneFilterNode = ctx.createBiquadFilter();
        droneA.type = 'sawtooth'; droneA.frequency.value = freqA || 36;
        droneB.type = 'sawtooth'; droneB.frequency.value = freqB || 37.3;
        droneFilterNode.type = 'lowpass';
        droneFilterNode.frequency.value = filterFreq || 100;
        droneFilterNode.Q.value = 5;
        droneGainNode.gain.value = 0;
        droneA.connect(droneFilterNode);
        droneB.connect(droneFilterNode);
        droneFilterNode.connect(droneGainNode);
        droneGainNode.connect(_masterGain);
        droneA.start(); droneB.start();
        droneGainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 2.5);
        _droneGain = droneGainNode;
        _droneFilter = droneFilterNode;
        _audioNodes.push(droneA, droneB);
    }

    /** Fade drone out over `dur` seconds */
    function stopDrone(dur) {
        if (_droneGain && _audioCtx) {
            _droneGain.gain.linearRampToValueAtTime(0, _audioCtx.currentTime + (dur || 2));
        }
    }

    /** Short data-blip beep */
    function playBeep(freq, volume) {
        if (!_audioCtx) return;
        const ctx = _audioCtx, t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = (freq || 1200) + Math.random() * 400;
        g.gain.setValueAtTime(volume || 0.07, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(g); g.connect(_masterGain);
        osc.start(t); osc.stop(t + 0.07);
    }

    /** Typewriter keystroke tick */
    function playTypeTick() {
        if (!_audioCtx) return;
        const ctx = _audioCtx, t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 800 + Math.random() * 600;
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
        osc.connect(g); g.connect(_masterGain);
        osc.start(t); osc.stop(t + 0.04);
    }

    /** Bass impact thud */
    function playImpact() {
        if (!_audioCtx) return;
        const ctx = _audioCtx, t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);
        g.gain.setValueAtTime(0.6, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(g); g.connect(_masterGain);
        osc.start(t); osc.stop(t + 0.55);
        // Click layer
        const n = ctx.createBufferSource();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        n.buffer = buf;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.25, t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        n.connect(ng); ng.connect(_masterGain);
        n.start(t);
    }

    /** Heartbeat pulse */
    function playHeartbeat() {
        if (!_audioCtx) return;
        const ctx = _audioCtx, t = ctx.currentTime;
        [0, 0.15].forEach(offset => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(55, t + offset);
            osc.frequency.exponentialRampToValueAtTime(30, t + offset + 0.2);
            g.gain.setValueAtTime(offset === 0 ? 0.4 : 0.25, t + offset);
            g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.25);
            osc.connect(g); g.connect(_masterGain);
            osc.start(t + offset); osc.stop(t + offset + 0.3);
        });
    }

    /** Phone ringtone — two-tone sine bursts */
    function playRingtone(rings) {
        if (!_audioCtx) return;
        const ctx = _audioCtx;
        rings = rings || 3;
        for (let r = 0; r < rings; r++) {
            const base = r * 1.2;
            [0, 0.15, 0.3, 0.45].forEach(offset => {
                const t = ctx.currentTime + base + offset;
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = offset < 0.3 ? 440 : 480;
                g.gain.setValueAtTime(0.12, t);
                g.gain.setValueAtTime(0, t + 0.12);
                osc.connect(g); g.connect(_masterGain);
                osc.start(t); osc.stop(t + 0.13);
            });
        }
    }

    /** Dramatic alarm sting */
    function playAlarmSting() {
        if (!_audioCtx) return;
        const ctx = _audioCtx, t = ctx.currentTime;
        [660, 880, 660, 880].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0.1, t + i * 0.15);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.12);
            osc.connect(g); g.connect(_masterGain);
            osc.start(t + i * 0.15); osc.stop(t + i * 0.15 + 0.13);
        });
    }

    /** Paper/document shuffle sound */
    function playPaperShuffle() {
        if (!_audioCtx) return;
        const ctx = _audioCtx, t = ctx.currentTime;
        const n = ctx.createBufferSource();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2) * 0.3;
        }
        n.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 3000; filter.Q.value = 0.5;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.15, t);
        n.connect(filter); filter.connect(g); g.connect(_masterGain);
        n.start(t);
    }

    /** Clean up all audio */
    function destroyAudio() {
        _audioNodes.forEach(n => { try { n.stop(); } catch (e) { /* ok */ } });
        _audioNodes = [];
        if (_audioCtx) {
            try { _audioCtx.close(); } catch (e) { /* ok */ }
            _audioCtx = null;
        }
        _masterGain = null;
        _droneGain = null;
        _droneFilter = null;
    }

    /* ══════════════════════════════════════════════════════════
       CSS EFFECTS
       ══════════════════════════════════════════════════════════ */
    function injectStyles() {
        if (_styleEl) return;
        _styleEl = document.createElement('style');
        _styleEl.textContent = `
            /* ── Mancave Cinematic Shared Styles ── */
            @keyframes mc-fadeIn { from{opacity:0} to{opacity:1} }
            @keyframes mc-fadeOut { from{opacity:1} to{opacity:0} }
            @keyframes mc-slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
            @keyframes mc-slideDown { from{transform:translateY(-40px);opacity:0} to{transform:translateY(0);opacity:1} }
            @keyframes mc-slideLeft { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
            @keyframes mc-slideRight { from{transform:translateX(-60px);opacity:0} to{transform:translateX(0);opacity:1} }
            @keyframes mc-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
            @keyframes mc-scanline { from{transform:translateY(-100%)} to{transform:translateY(100%)} }
            @keyframes mc-shake {
                0%,100%{transform:translate(0)}
                10%{transform:translate(-4px,2px)}
                30%{transform:translate(3px,-3px)}
                50%{transform:translate(-2px,4px)}
                70%{transform:translate(4px,-1px)}
                90%{transform:translate(-3px,3px)}
            }
            @keyframes mc-typing { from{width:0} to{width:100%} }
            @keyframes mc-blink { 0%,100%{border-color:rgba(0,255,65,0.8)} 50%{border-color:transparent} }
            @keyframes mc-glow { 0%,100%{text-shadow:0 0 5px currentColor} 50%{text-shadow:0 0 20px currentColor, 0 0 40px currentColor} }
            @keyframes mc-stampIn {
                0%{transform:scale(3) rotate(-15deg);opacity:0}
                60%{transform:scale(1) rotate(-15deg);opacity:1}
                100%{transform:scale(1) rotate(-12deg);opacity:0.8}
            }
            @keyframes mc-redPulse {
                0%,100%{background:rgba(180,0,0,0)} 50%{background:rgba(180,0,0,0.15)}
            }
            @keyframes mc-ringBounce {
                0%,100%{transform:rotate(0)} 15%{transform:rotate(15deg)} 30%{transform:rotate(-12deg)}
                45%{transform:rotate(8deg)} 60%{transform:rotate(-5deg)} 75%{transform:rotate(2deg)}
            }

            .mc-overlay {
                position:fixed; inset:0; z-index:9500;
                background:rgba(0,0,0,0.95);
                display:flex; flex-direction:column; align-items:center; justify-content:center;
                font-family:'Courier New',monospace; color:#e0e0e0;
                overflow:hidden;
            }
            .mc-overlay * { box-sizing:border-box; }

            /* Letterbox bars */
            .mc-letterbox-top, .mc-letterbox-bot {
                position:absolute; left:0; right:0; height:60px;
                background:#000; z-index:9510;
            }
            .mc-letterbox-top { top:0; }
            .mc-letterbox-bot { bottom:0; }

            /* Vignette */
            .mc-vignette {
                position:absolute; inset:0; z-index:9505;
                background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.7) 100%);
                pointer-events:none;
            }

            /* Scanlines */
            .mc-scanlines {
                position:absolute; inset:0; z-index:9506;
                background:repeating-linear-gradient(
                    0deg,
                    transparent, transparent 2px,
                    rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px
                );
                pointer-events:none;
            }

            /* Skip button */
            .mc-skip-btn {
                position:absolute; bottom:80px; right:30px; z-index:9520;
                background:rgba(255,255,255,0.1); color:#aaa;
                border:1px solid rgba(255,255,255,0.2);
                padding:8px 20px; font-size:13px; cursor:pointer;
                font-family:'Courier New',monospace;
                border-radius:3px;
                transition:all 0.2s;
            }
            .mc-skip-btn:hover { background:rgba(255,255,255,0.2); color:#fff; }

            /* Content area */
            .mc-content {
                position:relative; z-index:9508;
                max-width:900px; width:90%;
                padding:80px 20px;
                display:flex; flex-direction:column;
                align-items:center; justify-content:center;
            }

            /* Phase label */
            .mc-phase-label {
                position:absolute; top:75px; left:50%; transform:translateX(-50%);
                z-index:9515;
                font-size:11px; letter-spacing:6px; text-transform:uppercase;
                color:rgba(255,255,255,0.3);
                animation: mc-fadeIn 0.8s ease;
            }

            /* Typewriter text container */
            .mc-typewriter {
                font-family:'Courier New',monospace;
                line-height:1.7; font-size:14px;
                white-space:pre-wrap; word-wrap:break-word;
                text-align:left; width:100%;
            }
            .mc-typewriter .mc-cursor {
                display:inline-block; width:8px; height:16px;
                background:rgba(0,255,65,0.8);
                animation:mc-blink 0.7s infinite;
                vertical-align:text-bottom; margin-left:2px;
            }
            .mc-typewriter .mc-highlight {
                color:#ff4444; text-shadow:0 0 8px rgba(255,0,0,0.5);
                font-weight:bold;
            }
            .mc-typewriter .mc-highlight-green {
                color:#00ff41; text-shadow:0 0 8px rgba(0,255,65,0.5);
                font-weight:bold;
            }
            .mc-typewriter .mc-highlight-yellow {
                color:#ffcc00; text-shadow:0 0 8px rgba(255,204,0,0.5);
                font-weight:bold;
            }

            /* Document card */
            .mc-doc-card {
                background:rgba(20,25,20,0.95);
                border:1px solid rgba(0,255,65,0.2);
                border-radius:4px; padding:25px 30px;
                width:100%; max-width:800px;
                box-shadow:0 0 30px rgba(0,255,65,0.05);
                animation:mc-fadeIn 0.6s ease;
            }
            .mc-doc-card .mc-doc-header {
                border-bottom:1px solid rgba(0,255,65,0.15);
                padding-bottom:12px; margin-bottom:15px;
            }
            .mc-doc-card .mc-doc-title {
                font-size:16px; font-weight:bold; color:#00ff41;
                letter-spacing:2px;
            }
            .mc-doc-card .mc-doc-meta {
                font-size:11px; color:rgba(255,255,255,0.4);
                margin-top:5px;
            }
            .mc-doc-card .mc-doc-body {
                font-size:13px; line-height:1.8; color:#c0c0c0;
            }
            .mc-doc-card .mc-doc-classification {
                position:absolute; top:50%; left:50%;
                transform:translate(-50%,-50%) rotate(-12deg);
                font-size:42px; font-weight:bold;
                color:rgba(255,0,0,0.08);
                letter-spacing:8px; pointer-events:none;
                white-space:nowrap;
            }

            /* Dialogue line */
            .mc-dialogue-line {
                padding:8px 0; opacity:0;
                animation:mc-fadeIn 0.5s ease forwards;
                font-size:15px; line-height:1.6;
            }
            .mc-dialogue-line .mc-speaker {
                color:#00ccff; font-weight:bold; margin-right:8px;
            }
            .mc-dialogue-line .mc-action {
                color:rgba(255,255,255,0.5); font-style:italic;
            }

            /* Chat message bubble */
            .mc-chat-container {
                width:100%; max-width:700px;
                display:flex; flex-direction:column; gap:6px;
                padding:20px 0;
            }
            .mc-chat-msg {
                max-width:80%; padding:10px 16px;
                border-radius:12px; font-size:13px;
                line-height:1.5; position:relative;
                opacity:0; animation:mc-fadeIn 0.4s ease forwards;
            }
            .mc-chat-msg.mc-msg-self {
                align-self:flex-end;
                background:rgba(0,100,200,0.3);
                border:1px solid rgba(0,140,255,0.3);
                color:#aaddff;
                border-bottom-right-radius:4px;
            }
            .mc-chat-msg.mc-msg-other {
                align-self:flex-start;
                background:rgba(40,40,40,0.8);
                border:1px solid rgba(255,255,255,0.1);
                color:#d0d0d0;
                border-bottom-left-radius:4px;
            }
            .mc-chat-msg .mc-msg-sender {
                font-size:10px; font-weight:bold; margin-bottom:4px;
                color:rgba(255,255,255,0.5);
            }
            .mc-chat-msg .mc-msg-time {
                font-size:9px; color:rgba(255,255,255,0.3);
                text-align:right; margin-top:4px;
            }
            .mc-chat-typing {
                align-self:flex-start; padding:8px 16px;
                background:rgba(40,40,40,0.5);
                border-radius:12px; font-size:13px;
                color:rgba(255,255,255,0.4);
                animation:mc-pulse 1s infinite;
            }

            /* Dossier card */
            .mc-dossier {
                background:rgba(15,15,20,0.95);
                border:1px solid rgba(255,255,255,0.15);
                border-radius:6px; padding:30px;
                width:100%; max-width:500px;
                text-align:center;
                animation:mc-slideUp 0.6s ease;
                box-shadow:0 4px 40px rgba(0,0,0,0.5);
            }
            .mc-dossier .mc-dossier-avatar {
                width:80px; height:80px;
                background:rgba(255,255,255,0.05);
                border:2px solid rgba(255,255,255,0.2);
                border-radius:50%; margin:0 auto 15px;
                display:flex; align-items:center; justify-content:center;
                font-size:32px; color:rgba(255,255,255,0.3);
            }
            .mc-dossier .mc-dossier-name {
                font-size:20px; font-weight:bold; color:#fff;
                margin-bottom:4px;
            }
            .mc-dossier .mc-dossier-title {
                font-size:12px; color:rgba(255,255,255,0.5);
                letter-spacing:2px; text-transform:uppercase;
                margin-bottom:12px;
            }
            .mc-dossier .mc-dossier-specialty {
                font-size:13px; color:#00ccff;
                padding:8px; background:rgba(0,100,200,0.1);
                border-radius:4px;
            }

            /* Option card (for Dilemma) */
            .mc-option-card {
                background:rgba(30,30,35,0.9);
                border:1px solid rgba(255,255,255,0.15);
                border-radius:6px; padding:20px 24px;
                width:100%; max-width:700px;
                margin:8px 0; cursor:default;
                transition:all 0.5s;
            }
            .mc-option-card.mc-option-rejected {
                opacity:0.3; border-color:rgba(255,0,0,0.2);
                transform:scale(0.97);
            }
            .mc-option-card.mc-option-rejected .mc-option-stamp {
                display:block;
            }
            .mc-option-card.mc-option-selected {
                border-color:rgba(0,255,65,0.5);
                box-shadow:0 0 20px rgba(0,255,65,0.1);
            }
            .mc-option-card .mc-option-num {
                font-size:11px; color:rgba(255,255,255,0.3);
                letter-spacing:3px; text-transform:uppercase;
                margin-bottom:6px;
            }
            .mc-option-card .mc-option-title {
                font-size:16px; font-weight:bold; color:#ccc;
                margin-bottom:8px;
            }
            .mc-option-card .mc-option-desc {
                font-size:13px; color:rgba(255,255,255,0.5);
                line-height:1.5;
            }
            .mc-option-card .mc-option-stamp {
                display:none; float:right; margin-top:-30px;
                font-size:24px; font-weight:bold;
                color:rgba(255,0,0,0.5);
                transform:rotate(-12deg);
            }

            /* Counter / running total */
            .mc-counter {
                position:absolute; top:80px; right:40px; z-index:9515;
                font-size:14px; color:#ff4444;
                text-shadow:0 0 10px rgba(255,0,0,0.5);
                text-align:right;
            }
            .mc-counter .mc-counter-num {
                font-size:36px; font-weight:bold;
                display:block;
            }
            .mc-counter .mc-counter-label {
                font-size:10px; letter-spacing:3px;
                text-transform:uppercase;
                color:rgba(255,100,100,0.6);
            }

            /* Stamp overlay (CLASSIFIED, etc.) */
            .mc-stamp {
                font-size:48px; font-weight:bold;
                color:rgba(255,0,0,0.15);
                transform:rotate(-12deg);
                letter-spacing:8px;
                animation:mc-stampIn 0.4s ease;
                pointer-events:none;
                position:absolute; top:50%; left:50%;
                white-space:nowrap;
            }

            /* Screen-shake class */
            .mc-screen-shake {
                animation:mc-shake 0.4s ease;
            }

            /* Flash effect */
            .mc-flash {
                position:absolute; inset:0; z-index:9530;
                background:#fff; pointer-events:none;
                animation:mc-fadeOut 0.5s ease forwards;
            }

            /* Red pulse effect */
            .mc-red-pulse {
                position:absolute; inset:0; z-index:9505;
                pointer-events:none;
                animation:mc-redPulse 1.5s ease infinite;
            }

            /* Incoming call overlay */
            .mc-incoming-call {
                position:fixed; top:0; left:0; right:0;
                z-index:9600;
                background:linear-gradient(180deg, rgba(0,100,200,0.9) 0%, rgba(0,60,120,0.95) 100%);
                padding:20px 30px;
                display:flex; align-items:center; gap:20px;
                animation:mc-slideDown 0.5s ease;
                box-shadow:0 4px 30px rgba(0,0,0,0.5);
            }
            .mc-incoming-call .mc-call-icon {
                font-size:36px;
                animation:mc-ringBounce 0.5s ease infinite;
            }
            .mc-incoming-call .mc-call-info {
                flex:1;
            }
            .mc-incoming-call .mc-call-label {
                font-size:11px; letter-spacing:3px;
                color:rgba(255,255,255,0.6); text-transform:uppercase;
                font-family:'Courier New',monospace;
            }
            .mc-incoming-call .mc-call-name {
                font-size:20px; font-weight:bold; color:#fff;
                font-family:'Courier New',monospace;
            }

            /* Ally recruited stamp */
            .mc-ally-stamp {
                position:absolute; top:50%; left:50%;
                transform:translate(-50%,-50%);
                z-index:9515;
                font-size:28px; font-weight:bold;
                color:#00ff41; letter-spacing:6px;
                text-shadow:0 0 30px rgba(0,255,65,0.5);
                animation:mc-stampIn 0.5s ease;
                white-space:nowrap;
            }

            /* Team assembled layout */
            .mc-team-assembled {
                display:flex; gap:30px; flex-wrap:wrap;
                justify-content:center; align-items:center;
            }
            .mc-team-assembled .mc-dossier {
                width:200px; animation:mc-slideUp 0.6s ease;
            }

            /* Green terminal style (for USB analysis) */
            .mc-terminal-green {
                color:#00ff41; text-shadow:0 0 5px rgba(0,255,65,0.3);
            }
            .mc-terminal-green .mc-doc-card {
                border-color:rgba(0,255,65,0.3);
            }

            /* Scrollable content */
            .mc-scroll-area {
                max-height:60vh; overflow-y:auto;
                padding-right:10px;
                scrollbar-width:thin;
                scrollbar-color:rgba(255,255,255,0.2) transparent;
            }
            .mc-scroll-area::-webkit-scrollbar { width:6px; }
            .mc-scroll-area::-webkit-scrollbar-track { background:transparent; }
            .mc-scroll-area::-webkit-scrollbar-thumb {
                background:rgba(255,255,255,0.2); border-radius:3px;
            }
        `;
        document.head.appendChild(_styleEl);
    }

    function removeStyles() {
        if (_styleEl) { _styleEl.remove(); _styleEl = null; }
    }

    /* ══════════════════════════════════════════════════════════
       OVERLAY DOM
       ══════════════════════════════════════════════════════════ */
    /**
     * Create the cinematic overlay with letterbox, vignette, scanlines, skip button.
     * Returns the overlay element. Content goes inside .mc-content child.
     */
    function createOverlay(opts) {
        opts = opts || {};
        destroyOverlay(); // remove any existing
        injectStyles();

        const ov = document.createElement('div');
        ov.className = 'mc-overlay';
        if (opts.className) ov.classList.add(opts.className);
        ov.style.opacity = '0';
        ov.innerHTML = `
            <div class="mc-letterbox-top"></div>
            <div class="mc-letterbox-bot"></div>
            <div class="mc-vignette"></div>
            ${opts.scanlines !== false ? '<div class="mc-scanlines"></div>' : ''}
            ${opts.phaseLabel ? `<div class="mc-phase-label">${opts.phaseLabel}</div>` : ''}
            <div class="mc-content"></div>
            <button class="mc-skip-btn">SKIP ▸▸</button>
        `;
        document.body.appendChild(ov);
        _overlayEl = ov;
        _isActive = true;

        // Fade in
        requestAnimationFrame(() => {
            ov.style.transition = 'opacity 0.8s ease';
            ov.style.opacity = '1';
        });

        // Skip button
        const skipBtn = ov.querySelector('.mc-skip-btn');
        skipBtn.addEventListener('click', () => {
            if (_skipCallback) _skipCallback();
        });

        return ov;
    }

    function getOverlay() { return _overlayEl; }
    function getContent() { return _overlayEl ? _overlayEl.querySelector('.mc-content') : null; }
    function isActive() { return _isActive; }

    function setPhaseLabel(text) {
        if (!_overlayEl) return;
        let label = _overlayEl.querySelector('.mc-phase-label');
        if (!label) {
            label = document.createElement('div');
            label.className = 'mc-phase-label';
            _overlayEl.appendChild(label);
        }
        label.style.animation = 'none';
        label.offsetHeight; // reflow
        label.textContent = text;
        label.style.animation = 'mc-fadeIn 0.8s ease';
    }

    function onSkip(fn) {
        _skipCallback = fn;
    }

    /** Fade out and remove the overlay */
    function destroyOverlay(duration) {
        _isActive = false;
        _skipCallback = null;
        if (!_overlayEl) return;
        const ov = _overlayEl;
        _overlayEl = null;
        ov.style.transition = `opacity ${duration || 0.6}s ease`;
        ov.style.opacity = '0';
        setTimeout(() => { ov.remove(); }, (duration || 0.6) * 1000 + 50);
    }

    /** Full cleanup of everything */
    function fullCleanup() {
        clearAllTimers();
        destroyAudio();
        destroyOverlay(0);
        removeStyles();
        _isActive = false;
    }

    /* ══════════════════════════════════════════════════════════
       TYPEWRITER
       ══════════════════════════════════════════════════════════ */
    /**
     * Type text character-by-character into a container.
     * @param {HTMLElement} container - Where to type into
     * @param {string} text - Text to type
     * @param {Object} opts - { speed, highlights, onChar, onDone }
     *   highlights: [{text:'keyword', class:'mc-highlight'}]
     */
    function typewrite(container, text, opts) {
        opts = opts || {};
        const speed = opts.speed || 30;
        const highlights = opts.highlights || [];
        let idx = 0;
        let cursor = document.createElement('span');
        cursor.className = 'mc-cursor';
        container.appendChild(cursor);

        function findHighlight(pos) {
            for (const h of highlights) {
                if (text.substring(pos).startsWith(h.text)) {
                    return h;
                }
            }
            return null;
        }

        return new Promise(resolve => {
            function tick() {
                if (idx >= text.length) {
                    cursor.remove();
                    if (opts.onDone) opts.onDone();
                    resolve();
                    return;
                }

                const hl = findHighlight(idx);
                if (hl) {
                    const span = document.createElement('span');
                    span.className = hl.class || 'mc-highlight';
                    span.textContent = hl.text;
                    container.insertBefore(span, cursor);
                    idx += hl.text.length;
                    playTypeTick();
                    if (opts.onChar) opts.onChar(idx);
                    schedule(tick, speed * hl.text.length * 0.3);
                } else {
                    const ch = text[idx];
                    const tn = document.createTextNode(ch);
                    container.insertBefore(tn, cursor);
                    idx++;
                    if (ch !== ' ' && ch !== '\n') playTypeTick();
                    if (opts.onChar) opts.onChar(idx);
                    schedule(tick, ch === '\n' ? speed * 3 : speed);
                }
            }
            tick();
        });
    }

    /* ══════════════════════════════════════════════════════════
       DIALOGUE REVEAL
       ══════════════════════════════════════════════════════════ */
    /**
     * Show dialogue lines one at a time in a container.
     * @param {HTMLElement} container
     * @param {Array} lines - [{speaker, text}]
     * @param {Object} opts - { delay, pauseBetween, onDone }
     */
    function revealDialogue(container, lines, opts) {
        opts = opts || {};
        const delay = opts.delay || 0;
        const pause = opts.pauseBetween || 1800;

        return new Promise(resolve => {
            let i = 0;
            function showNext() {
                if (i >= lines.length) {
                    if (opts.onDone) opts.onDone();
                    resolve();
                    return;
                }
                const line = lines[i];
                const div = document.createElement('div');
                div.className = 'mc-dialogue-line';
                div.style.animationDelay = '0s';

                if (line.text && line.text.startsWith('*') && line.text.endsWith('*')) {
                    div.innerHTML = `<span class="mc-action">${line.text}</span>`;
                } else if (line.speaker) {
                    div.innerHTML = `<span class="mc-speaker">${line.speaker}:</span> ${line.text}`;
                } else {
                    div.innerHTML = `<span class="mc-action">${line.text}</span>`;
                }

                container.appendChild(div);
                playBeep(800 + i * 100, 0.04);

                // Auto-scroll
                if (container.scrollHeight > container.clientHeight) {
                    container.scrollTop = container.scrollHeight;
                }

                i++;
                schedule(showNext, pause);
            }
            schedule(showNext, delay);
        });
    }

    /* ══════════════════════════════════════════════════════════
       CHAT REVEAL
       ══════════════════════════════════════════════════════════ */
    /**
     * Reveal chat messages one by one, with typing indicator for "other" messages.
     * @param {HTMLElement} container - .mc-chat-container element
     * @param {Array} messages - [{from, text, timestamp}]
     * @param {string} selfName - name of the player (e.g. 'Ryan')
     * @param {Object} opts - { typingDelay, msgDelay, onDone }
     */
    function revealChat(container, messages, selfName, opts) {
        opts = opts || {};
        const typingDelay = opts.typingDelay || 1200;
        const msgDelay = opts.msgDelay || 1500;

        return new Promise(resolve => {
            let i = 0;
            function showNext() {
                if (i >= messages.length) {
                    if (opts.onDone) opts.onDone();
                    resolve();
                    return;
                }
                const msg = messages[i];
                const isSelf = msg.from === selfName || msg.from === 'Ryan';

                if (!isSelf) {
                    // Show typing indicator first
                    const typing = document.createElement('div');
                    typing.className = 'mc-chat-typing';
                    typing.textContent = msg.from + ' is typing...';
                    container.appendChild(typing);
                    container.scrollTop = container.scrollHeight;

                    schedule(() => {
                        typing.remove();
                        appendMsg(msg, isSelf);
                        i++;
                        schedule(showNext, msgDelay);
                    }, typingDelay);
                } else {
                    appendMsg(msg, isSelf);
                    i++;
                    schedule(showNext, msgDelay);
                }
            }

            function appendMsg(msg, isSelf) {
                const div = document.createElement('div');
                div.className = `mc-chat-msg ${isSelf ? 'mc-msg-self' : 'mc-msg-other'}`;
                div.innerHTML = `
                    <div class="mc-msg-sender">${msg.from}</div>
                    <div>${msg.text.replace(/\\n/g, '<br>')}</div>
                    <div class="mc-msg-time">${msg.timestamp || ''}</div>
                `;
                container.appendChild(div);
                playBeep(isSelf ? 1000 : 700, 0.04);
                container.scrollTop = container.scrollHeight;
            }

            schedule(showNext, 500);
        });
    }

    /* ══════════════════════════════════════════════════════════
       INCOMING CALL OVERLAY
       ══════════════════════════════════════════════════════════ */
    /**
     * Show incoming call animation, then play dialogue through game engine.
     * @param {Object} game - game engine ref
     * @param {string} callerName
     * @param {Array} dialogueLines - [{speaker, text}]
     */
    function playIncomingCall(game, callerName, dialogueLines) {
        initAudio();
        injectStyles();
        playRingtone(3);

        const banner = document.createElement('div');
        banner.className = 'mc-incoming-call';
        banner.innerHTML = `
            <div class="mc-call-icon">📞</div>
            <div class="mc-call-info">
                <div class="mc-call-label">Incoming Video Call</div>
                <div class="mc-call-name">${callerName}</div>
            </div>
        `;
        document.body.appendChild(banner);

        // After 3.5s, remove banner and start dialogue
        setTimeout(() => {
            banner.style.animation = 'mc-fadeOut 0.5s ease forwards';
            setTimeout(() => {
                banner.remove();
                game.startDialogue(dialogueLines);
            }, 500);
        }, 3500);
    }

    /* ══════════════════════════════════════════════════════════
       EFFECTS
       ══════════════════════════════════════════════════════════ */
    function screenShake() {
        if (!_overlayEl) return;
        _overlayEl.classList.add('mc-screen-shake');
        setTimeout(() => _overlayEl.classList.remove('mc-screen-shake'), 400);
    }

    function flash() {
        if (!_overlayEl) return;
        const f = document.createElement('div');
        f.className = 'mc-flash';
        _overlayEl.appendChild(f);
        setTimeout(() => f.remove(), 600);
    }

    function redPulse(duration) {
        if (!_overlayEl) return;
        const rp = document.createElement('div');
        rp.className = 'mc-red-pulse';
        _overlayEl.appendChild(rp);
        setTimeout(() => rp.remove(), duration || 3000);
    }

    /* ══════════════════════════════════════════════════════════
       PUBLIC API
       ══════════════════════════════════════════════════════════ */
    return {
        // Scheduling
        schedule, repeat, clearAllTimers,
        // Audio
        initAudio, getAudioCtx, startDrone, stopDrone,
        playBeep, playTypeTick, playImpact, playHeartbeat,
        playRingtone, playAlarmSting, playPaperShuffle, destroyAudio,
        // Overlay
        createOverlay, getOverlay, getContent, isActive,
        setPhaseLabel, onSkip, destroyOverlay, fullCleanup,
        injectStyles, removeStyles,
        // Typewriter
        typewrite,
        // Dialogue
        revealDialogue,
        // Chat
        revealChat,
        // Incoming call
        playIncomingCall,
        // Effects
        screenShake, flash, redPulse
    };
})();
