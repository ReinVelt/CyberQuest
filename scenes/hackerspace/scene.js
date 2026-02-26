/**
 * Hackerspace Drenthe Scene — HOLLYWOOD EDITION
 * Located in Coevorden, inside a repurposed school building.
 * Workshops: metal working, 3D printing, soldering, CNC plasma/steel/lathe/milling, welding.
 *
 * Dynamic features:
 *   • NPC characters move between workstations on idle patrol paths
 *   • Full Web Audio API synthesized ambient soundscape (machines, sparks, hum)
 *   • Periodic ambient voice chatter (TTS snippets from NPCs)
 *   • Welding flash / spark VFX overlay
 *   • Cinematic entrance sequence with camera pan feeling
 */

const HackerspaceScene = {
    id: 'hackerspace',
    name: 'Hackerspace Drenthe',

    background: 'assets/images/scenes/hackerspace.svg',

    description: 'Hackerspace Drenthe — a community maker space in a former school building in Coevorden.',

    playerStart: { x: 90, y: 85 },

    // ═══════════════════════════════════════════════════════════════
    // ── NPC Characters with patrol paths ──────────────────────────
    // ═══════════════════════════════════════════════════════════════
    _characters: [
        { name: 'Dennis',  key: 'hacker_male_2',   home: { x: 41, y: 73 }, scale: 0.075,
          patrol: [{ x: 41, y: 73 }, { x: 38, y: 73 }, { x: 35, y: 68 }, { x: 41, y: 73 }] },
        { name: 'Sophie',  key: 'hacker_female_1',  home: { x: 84, y: 62 }, scale: 0.075,
          patrol: [{ x: 84, y: 62 }, { x: 80, y: 65 }, { x: 88, y: 60 }, { x: 84, y: 62 }] },
        { name: 'Marco',   key: 'hacker_male_1',    home: { x: 12, y: 62 }, scale: 0.075,
          patrol: [{ x: 12, y: 62 }, { x: 18, y: 60 }, { x: 25, y: 65 }, { x: 12, y: 62 }] },
        { name: 'Kim',     key: 'hacker_female_4',  home: { x: 66, y: 60 }, scale: 0.075,
          patrol: [{ x: 66, y: 60 }, { x: 70, y: 63 }, { x: 62, y: 58 }, { x: 66, y: 60 }] },
        { name: 'Joris',   key: 'hacker_male_3',    home: { x: 50, y: 73 }, scale: 0.075,
          patrol: [{ x: 50, y: 73 }, { x: 46, y: 70 }, { x: 54, y: 75 }, { x: 50, y: 73 }] },
        { name: 'Linda',   key: 'hacker_female_2',  home: { x: 6,  y: 76 }, scale: 0.075,
          patrol: [{ x: 6, y: 76 }, { x: 10, y: 74 }, { x: 14, y: 78 }, { x: 6, y: 76 }] },
    ],

    // ── Character element refs for animation ──
    _charElements: [],
    _patrolTimers: [],
    _vfxTimers: [],

    _spawnCharacters: function(game) {
        this._charElements = [];
        this._characters.forEach((c, i) => {
            const el = game.showCharacter(c.key, c.home.x, c.home.y, c.scale);
            if (el) {
                el.style.transition = 'left 3s ease-in-out, bottom 3s ease-in-out, opacity 0.8s';
                el.setAttribute('data-npc-name', c.name);
                this._charElements[i] = el;
            }
        });
    },

    _removeCharacters: function() {
        const container = document.getElementById('scene-characters');
        if (container) {
            container.querySelectorAll('.npc-character').forEach(el => el.remove());
        }
        this._charElements = [];
    },

    // ═══════════════════════════════════════════════════════════════
    // ── NPC Patrol Movement ───────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════
    _startPatrols: function() {
        this._stopPatrols();
        this._characters.forEach((c, i) => {
            let step = 0;
            const patrol = () => {
                const el = this._charElements[i];
                if (!el) return;
                step = (step + 1) % c.patrol.length;
                const target = c.patrol[step];
                el.style.left = target.x + '%';
                el.style.bottom = (100 - target.y) + '%';
            };
            // Stagger patrol starts, move every 4-7 seconds
            const delay = 3000 + Math.random() * 4000;
            const interval = 4000 + Math.random() * 3000;
            const startTimer = setTimeout(() => {
                patrol();
                const loopTimer = setInterval(patrol, interval);
                this._patrolTimers.push(loopTimer);
            }, delay);
            this._patrolTimers.push(startTimer);
        });
    },

    _stopPatrols: function() {
        this._patrolTimers.forEach(id => { clearTimeout(id); clearInterval(id); });
        this._patrolTimers = [];
    },

    // ═══════════════════════════════════════════════════════════════
    // ── Welding Flash / Spark VFX ────────────────────────────────
    // ═══════════════════════════════════════════════════════════════
    _startVFX: function() {
        this._stopVFX();
        // Welding sparks flash near Kim's station
        const sparkLoop = () => {
            if (!this._vfxRunning) return;
            this._weldFlash();
            const next = 5000 + Math.random() * 10000;
            this._vfxTimers.push(setTimeout(sparkLoop, next));
        };
        this._vfxRunning = true;
        this._vfxTimers.push(setTimeout(sparkLoop, 3000));

        // Occasional 3D printer "ding" flash near Sophie's station
        const printerDing = () => {
            if (!this._vfxRunning) return;
            this._printerFlash();
            this._vfxTimers.push(setTimeout(printerDing, 15000 + Math.random() * 20000));
        };
        this._vfxTimers.push(setTimeout(printerDing, 8000));
    },

    _stopVFX: function() {
        this._vfxRunning = false;
        this._vfxTimers.forEach(id => clearTimeout(id));
        this._vfxTimers = [];
        const el = document.getElementById('hs-vfx-overlay');
        if (el) el.remove();
    },

    _ensureVFXOverlay: function() {
        let overlay = document.getElementById('hs-vfx-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'hs-vfx-overlay';
            overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:20;overflow:hidden;';
            const sc = document.getElementById('scene-container');
            if (sc) sc.appendChild(overlay);
        }
        return overlay;
    },

    _weldFlash: function() {
        const overlay = this._ensureVFXOverlay();
        // Bright blue-white flash at welding position
        const flash = document.createElement('div');
        flash.className = 'hs-weld-flash';
        flash.style.cssText = `
            position:absolute; left:66%; top:42%;
            width:14px; height:14px; border-radius:50%;
            background:radial-gradient(circle, #fff 0%, #8af 40%, transparent 70%);
            box-shadow: 0 0 30px 15px rgba(130,200,255,0.7), 0 0 60px 30px rgba(100,150,255,0.3);
            animation: hs-weld-pulse 0.15s ease-in-out 5;
            pointer-events:none;
        `;
        overlay.appendChild(flash);
        // Throw sparks
        for (let s = 0; s < 8; s++) {
            const spark = document.createElement('div');
            const angle = Math.random() * Math.PI * 2;
            const dist = 20 + Math.random() * 60;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            spark.style.cssText = `
                position:absolute; left:66%; top:42%;
                width:3px; height:3px; border-radius:50%;
                background:#ffa; box-shadow: 0 0 4px 2px rgba(255,200,50,0.8);
                pointer-events:none;
                animation: hs-spark-fly 0.4s ease-out forwards;
                --spark-dx: ${dx}px; --spark-dy: ${dy}px;
            `;
            setTimeout(() => overlay.appendChild(spark), s * 50);
        }
        // Play welding sound
        this._sfxWeldBurst();
        // Cleanup
        setTimeout(() => {
            flash.remove();
            overlay.querySelectorAll('[style*="hs-spark-fly"]').forEach(el => el.remove());
        }, 1200);
    },

    _printerFlash: function() {
        const overlay = this._ensureVFXOverlay();
        const ding = document.createElement('div');
        ding.style.cssText = `
            position:absolute; left:85%; top:45%;
            color:#0f0; font-size:14px; font-weight:bold; font-family:monospace;
            animation: hs-printer-ding 2s ease-out forwards;
            pointer-events:none; text-shadow: 0 0 6px #0f0;
        `;
        ding.textContent = '✓ PRINT COMPLETE';
        overlay.appendChild(ding);
        this._sfxPrinterDing();
        setTimeout(() => ding.remove(), 2500);
    },

    // ═══════════════════════════════════════════════════════════════
    // ── Web Audio API — Synthesized Soundscape ───────────────────
    // ═══════════════════════════════════════════════════════════════
    _audioCtx: null,
    _audioNodes: [],
    _audioTimers: [],
    _audioRunning: false,

    _initAudio: function() {
        if (this._audioRunning) return;
        try {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { return; }
        this._audioRunning = true;
        const ctx = this._audioCtx;

        // Master gain — kept low for pleasant background ambience
        const master = ctx.createGain();
        master.gain.value = 0.12;
        master.connect(ctx.destination);
        this._masterGain = master;

        // ── 1. Low machine hum (CNC background) ──
        const hum = ctx.createOscillator();
        hum.type = 'triangle';
        hum.frequency.value = 55;
        const humGain = ctx.createGain();
        humGain.gain.value = 0.08;
        hum.connect(humGain).connect(master);
        hum.start();
        this._audioNodes.push(hum);

        // ── 2. 50 Hz mains hum ──
        const mains = ctx.createOscillator();
        mains.type = 'sine';
        mains.frequency.value = 50;
        const mainsGain = ctx.createGain();
        mainsGain.gain.value = 0.025;
        mains.connect(mainsGain).connect(master);
        mains.start();
        this._audioNodes.push(mains);

        // ── 3. Soft spindle whine (CNC mill, subtle background) ──
        const whine = ctx.createOscillator();
        whine.type = 'sine';
        whine.frequency.value = 900;
        const whineGain = ctx.createGain();
        whineGain.gain.value = 0.008;
        // Slow LFO modulation on pitch
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 40;
        lfo.connect(lfoGain).connect(whine.frequency);
        lfo.start();
        whine.connect(whineGain).connect(master);
        whine.start();
        this._audioNodes.push(whine, lfo);

        // ── 4. 3D printer stepper clicks ──
        const clickLoop = () => {
            if (!this._audioRunning) return;
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.value = 400 + Math.random() * 300;
            const g = ctx.createGain();
            g.gain.value = 0.008;
            g.gain.setTargetAtTime(0, ctx.currentTime + 0.01, 0.006);
            osc.connect(g).connect(master);
            osc.start();
            osc.stop(ctx.currentTime + 0.02);
            const next = 200 + Math.random() * 200;
            this._audioTimers.push(setTimeout(clickLoop, next));
        };
        this._audioTimers.push(setTimeout(clickLoop, 500));

        // ── 5. Periodic angle grinder burst ──
        const grinderLoop = () => {
            if (!this._audioRunning) return;
            this._sfxGrinderBurst();
            this._audioTimers.push(setTimeout(grinderLoop, 25000 + Math.random() * 30000));
        };
        this._audioTimers.push(setTimeout(grinderLoop, 15000));

        // ── 6. Occasional compressed air blast ──
        const airLoop = () => {
            if (!this._audioRunning) return;
            this._sfxAirBlast();
            this._audioTimers.push(setTimeout(airLoop, 30000 + Math.random() * 25000));
        };
        this._audioTimers.push(setTimeout(airLoop, 20000));

        // ── 7. Random metal clang ──
        const clangLoop = () => {
            if (!this._audioRunning) return;
            this._sfxMetalClang();
            this._audioTimers.push(setTimeout(clangLoop, 18000 + Math.random() * 20000));
        };
        this._audioTimers.push(setTimeout(clangLoop, 10000));

        // ── 8. Coffee machine gurgle ──
        const coffeeLoop = () => {
            if (!this._audioRunning) return;
            this._sfxCoffeeGurgle();
            this._audioTimers.push(setTimeout(coffeeLoop, 25000 + Math.random() * 20000));
        };
        this._audioTimers.push(setTimeout(coffeeLoop, 15000));
    },

    _stopAudio: function() {
        this._audioRunning = false;
        this._audioTimers.forEach(id => clearTimeout(id));
        this._audioTimers = [];
        this._audioNodes.forEach(n => { try { n.stop(); } catch(e) {} });
        this._audioNodes = [];
        if (this._audioCtx) {
            try { this._audioCtx.close(); } catch(e) {}
            this._audioCtx = null;
        }
    },

    // ── SFX: Welding burst (bright noise + ring) ──
    _sfxWeldBurst: function() {
        if (!this._audioCtx || !this._audioRunning) return;
        const ctx = this._audioCtx;
        const now = ctx.currentTime;
        // White noise burst
        const bufSize = ctx.sampleRate * 0.3;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 3000;
        bp.Q.value = 2;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        noise.connect(bp).connect(g).connect(this._masterGain);
        noise.start(now);
        noise.stop(now + 0.3);
        // Arc crackle overtone
        const arc = ctx.createOscillator();
        arc.type = 'sawtooth';
        arc.frequency.value = 600;
        const ag = ctx.createGain();
        ag.gain.setValueAtTime(0.03, now);
        ag.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        arc.connect(ag).connect(this._masterGain);
        arc.start(now);
        arc.stop(now + 0.2);
    },

    // ── SFX: Angle grinder burst ──
    _sfxGrinderBurst: function() {
        if (!this._audioCtx || !this._audioRunning) return;
        const ctx = this._audioCtx;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(4000, now + 0.3);
        osc.frequency.setValueAtTime(4000, now + 0.3);
        osc.frequency.linearRampToValueAtTime(3000, now + 1.2);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.02, now + 0.2);
        g.gain.setValueAtTime(0.02, now + 0.8);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
        osc.connect(g).connect(this._masterGain);
        osc.start(now);
        osc.stop(now + 1.5);
        // Soft high overtone (no harsh scream)
        const scream = ctx.createOscillator();
        scream.type = 'sine';
        scream.frequency.value = 3000 + Math.random() * 1500;
        const sg = ctx.createGain();
        sg.gain.setValueAtTime(0, now + 0.1);
        sg.gain.linearRampToValueAtTime(0.01, now + 0.4);
        sg.gain.setValueAtTime(0.01, now + 0.8);
        sg.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        scream.connect(sg).connect(this._masterGain);
        scream.start(now + 0.1);
        scream.stop(now + 1.3);
    },

    // ── SFX: Compressed air blast ──
    _sfxAirBlast: function() {
        if (!this._audioCtx || !this._audioRunning) return;
        const ctx = this._audioCtx;
        const now = ctx.currentTime;
        const bufSize = ctx.sampleRate * 0.6;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 2000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.03, now + 0.05);
        g.gain.setValueAtTime(0.03, now + 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        src.connect(hp).connect(g).connect(this._masterGain);
        src.start(now);
        src.stop(now + 0.6);
    },

    // ── SFX: Metal clang (workshop hammer) ──
    _sfxMetalClang: function() {
        if (!this._audioCtx || !this._audioRunning) return;
        const ctx = this._audioCtx;
        const now = ctx.currentTime;
        // Ring at metallic frequency
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 800 + Math.random() * 500;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.04, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(g).connect(this._masterGain);
        osc.start(now);
        osc.stop(now + 0.6);
        // Transient click
        const click = ctx.createOscillator();
        click.type = 'square';
        click.frequency.value = 2000;
        const cg = ctx.createGain();
        cg.gain.setValueAtTime(0.03, now);
        cg.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
        click.connect(cg).connect(this._masterGain);
        click.start(now);
        click.stop(now + 0.03);
    },

    // ── SFX: Coffee machine gurgle ──
    _sfxCoffeeGurgle: function() {
        if (!this._audioCtx || !this._audioRunning) return;
        const ctx = this._audioCtx;
        const now = ctx.currentTime;
        for (let i = 0; i < 6; i++) {
            const t = now + i * 0.15 + Math.random() * 0.05;
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 200 + Math.random() * 150;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.02, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.connect(g).connect(this._masterGain);
            osc.start(t);
            osc.stop(t + 0.15);
        }
    },

    // ── SFX: Printer ding ──
    _sfxPrinterDing: function() {
        if (!this._audioCtx || !this._audioRunning) return;
        const ctx = this._audioCtx;
        const now = ctx.currentTime;
        [880, 1100, 1320].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.08, now + i * 0.12);
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
            osc.connect(g).connect(this._masterGain);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.35);
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // ── Ambient NPC Voice Chatter (TTS) ──────────────────────────
    // ═══════════════════════════════════════════════════════════════
    _chatterLines: [
        { name: 'Dennis',  text: 'Hand me the flux pen, will you?' },
        { name: 'Sophie',  text: 'This PETG is stringing like crazy. Need to bump retraction.' },
        { name: 'Marco',   text: 'The plasma torch needs a new electrode. Third one this week.' },
        { name: 'Kim',     text: 'Whoever left the angle grinder on the floor — not cool.' },
        { name: 'Joris',   text: 'InfluxDB is throwing write errors again. Probably disk space.' },
        { name: 'Linda',   text: 'Coffee anyone? Fresh pot just brewed.' },
        { name: 'Dennis',  text: 'Check this out — clean solder joints on the first try.' },
        { name: 'Sophie',  text: 'Print time estimate: seven hours. Reality: twelve hours.' },
        { name: 'Marco',   text: 'The DXF looks good. Starting the plasma cutter now.' },
        { name: 'Kim',     text: 'Safety glasses on! I\'m striking an arc.' },
        { name: 'Joris',   text: 'Grafana alert — node seven in Dalen is offline again. Probably pigeons.' },
        { name: 'Linda',   text: 'Has anyone seen the Mitutoyo calipers? They were right here.' },
        { name: 'Dennis',  text: 'The oscilloscope shows a beautiful 868 MHz chirp. LoRa is alive.' },
        { name: 'Sophie',  text: 'Bambu X1C just finished. Come look at this multicolour gear!' },
        { name: 'Marco',   text: 'CNC is done. Beautiful cuts. Zero burrs.' },
        { name: 'Kim',     text: 'That weld bead is gorgeous. Come see — perfect ripples.' },
    ],
    _chatterTimer: null,

    _startChatter: function() {
        this._stopChatter();
        const doChatter = () => {
            if (!this._audioRunning) return;
            // Pick a random line and speak it with TTS if available
            const line = this._chatterLines[Math.floor(Math.random() * this._chatterLines.length)];
            if (window.voiceManager && window.voiceManager.enabled && window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(line.text);
                utterance.volume = 0.25; // Background chatter — quiet
                utterance.rate = 0.95 + Math.random() * 0.15;
                utterance.pitch = 0.8 + Math.random() * 0.4;
                try { window.speechSynthesis.speak(utterance); } catch(e) {}
            }
            // Also flash a subtle text bubble over the NPC
            this._showChatterBubble(line.name, line.text);
            const next = 12000 + Math.random() * 18000;
            this._chatterTimer = setTimeout(doChatter, next);
        };
        this._chatterTimer = setTimeout(doChatter, 5000 + Math.random() * 5000);
    },

    _stopChatter: function() {
        if (this._chatterTimer) { clearTimeout(this._chatterTimer); this._chatterTimer = null; }
    },

    _showChatterBubble: function(npcName, text) {
        const overlay = this._ensureVFXOverlay();
        // Find the NPC element to position the bubble near them
        const npcEl = this._charElements.find(el => el && el.getAttribute('data-npc-name') === npcName);
        let leftPct = 50, topPct = 50;
        if (npcEl) {
            leftPct = parseFloat(npcEl.style.left) || 50;
            topPct = 100 - (parseFloat(npcEl.style.bottom) || 50) - 12;
        }
        const bubble = document.createElement('div');
        bubble.className = 'hs-chatter-bubble';
        bubble.style.cssText = `
            position:absolute; left:${leftPct}%; top:${topPct}%;
            transform: translateX(-50%);
            background:rgba(0,0,0,0.75); color:#eee; border:1px solid #555;
            border-radius:8px; padding:4px 10px; font-size:11px; max-width:200px;
            white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
            pointer-events:none; z-index:25;
            animation: hs-bubble-fade 4s ease-out forwards;
        `;
        bubble.innerHTML = `<strong style="color:#7bf">${npcName}:</strong> ${text}`;
        overlay.appendChild(bubble);
        setTimeout(() => bubble.remove(), 4500);
    },

    hotspots: [

        // ── CNC Plasma Cutter ──
        {
            id: 'cnc_plasma',
            name: 'CNC Plasma Cutter',
            x: 6,
            y: 35,
            width: 15,
            height: 25,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A CNC plasma cutter. Cuts through steel plate like butter using an ionised gas jet at 20,000°C.' },
                    { speaker: 'Ryan', text: 'You feed it a DXF file, clamp down the plate, and it traces whatever shape you want. Incredible precision for something that runs on compressed air and electricity.' },
                    { speaker: 'Ryan', text: 'The cutting bed is about 1200 by 800 mm. Not industrial scale, but more than enough for brackets, enclosures, artistic metalwork.' },
                    { speaker: '', text: '📚 PLASMA CUTTING: An electrically conductive gas channel ionises the air between the torch and the workpiece. The plasma arc reaches temperatures up to 22,000°C — hot enough to melt and blow away the metal.' },
                ]);
            }
        },

        // ── CNC Steel Cutter ──
        {
            id: 'cnc_steel',
            name: 'CNC Steel Cutter',
            x: 21,
            y: 35,
            width: 12,
            height: 25,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A CNC milling-type steel cutter. Enclosed chamber with coolant system — cleaner cuts than plasma, but slower.' },
                    { speaker: 'Ryan', text: 'It\'s running right now. 3200 RPM, coolant spraying. Whoever set this job probably left it running overnight.' },
                    { speaker: 'Ryan', text: 'These machines cost serious money. Having one in a community hackerspace is remarkable.' },
                ]);
            }
        },

        // ── CNC Lathe ──
        {
            id: 'cnc_lathe',
            name: 'CNC Lathe',
            x: 30,
            y: 42,
            width: 16,
            height: 18,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A CNC lathe — computer-controlled. The workpiece spins while a cutting tool shapes it with sub-millimetre precision.' },
                    { speaker: 'Ryan', text: 'Perfect for making shafts, bushings, connectors, anything cylindrically symmetric. The chuck rotates at 1200 RPM.' },
                    { speaker: 'Ryan', text: 'Look at those metal shavings curling off — each one is a perfect spiral. There\'s something satisfying about watching a lathe work.' },
                    { speaker: '', text: '📚 CNC LATHE: Computer Numerical Control lathes can produce parts accurate to ±0.01mm. The G-code programs control tool position, feed rate, and spindle speed simultaneously.' },
                ]);
            }
        },

        // ── CNC Milling Machine ──
        {
            id: 'cnc_mill',
            name: 'CNC Milling Machine',
            x: 48,
            y: 39,
            width: 11,
            height: 23,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A CNC milling machine. Three-axis control, reading G-code. The endmill is chewing through aluminium right now.' },
                    { speaker: 'Ryan', text: 'Milling removes material from a stationary workpiece using a rotating cutter. It can create flat surfaces, slots, pockets, complex 3D contours.' },
                    { speaker: 'Ryan', text: 'The DRO reads out position on all three axes. Someone\'s machining what looks like a custom enclosure.' },
                    { speaker: '', text: '📚 CNC MILLING: Modern CNC mills can run unattended, executing hundreds of programmed tool paths. CAM software translates 3D models directly into machining instructions.' },
                ]);
            }
        },

        // ── Welding Station ──
        {
            id: 'welding',
            name: 'Welding Station',
            x: 62,
            y: 40,
            width: 16,
            height: 20,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A MIG/MAG welding station. 180 amps, argon/CO₂ shielding gas, wire feed spool. Red welding curtains on both sides to protect bystanders.' },
                    { speaker: 'Ryan', text: 'Someone\'s been busy — look at that bead. Clean, consistent penetration. A skilled welder works here.' },
                    { speaker: 'Ryan', text: 'They\'ve even got a gas bottle set up. Proper workshop this, not just hobby stuff.' },
                    { speaker: '', text: '📚 MIG/MAG WELDING: Metal Inert/Active Gas welding feeds a continuous wire electrode through a gun. The arc melts both wire and base metal. Shielding gas protects the weld pool from atmospheric contamination.' },
                ]);
            }
        },

        // ── 3D Print Workshop ──
        {
            id: 'printing_3d',
            name: '3D Print Workshop',
            x: 79,
            y: 35,
            width: 19,
            height: 26,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A whole rack of 3D printers. Prusa MK4, Prusa XL, Bambu X1C. All printing simultaneously — the hum of stepper motors and cooling fans.' },
                    { speaker: 'Ryan', text: 'Filament spools in every colour. PLA, PETG, maybe some ABS. The Bambu has an enclosed chamber, probably printing something that needs heat retention.' },
                    { speaker: 'Ryan', text: 'Bottom shelf is full of finished prints. A Benchy — the classic test boat — a gear, a vase, a phone stand, and... is that a skull?' },
                    { speaker: 'Ryan', text: 'Anyone can come here and use these machines. Upload your STL, slice it, print it. That\'s the maker spirit — making together.' },
                    { speaker: '', text: '📚 FDM 3D PRINTING: Fused Deposition Modelling melts thermoplastic filament and deposits it layer by layer. A typical layer height is 0.2mm — meaning a 10cm tall object requires 500 layers. Modern slicers like PrusaSlicer and OrcaSlicer handle the toolpath generation automatically.' },
                ]);
            }
        },

        // ── Soldering Workshop ──
        {
            id: 'soldering',
            name: 'Soldering Workshop',
            x: 35,
            y: 63,
            width: 19,
            height: 10,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The soldering bench. Hakko FX-951, Weller WE1010 — professional-grade stations, both running at 350°C and up.' },
                    { speaker: 'Ryan', text: 'PCBs, components, solder wire. Looks like someone\'s been assembling an ESP32 project. Nice.' },
                    { speaker: 'Ryan', text: 'And that\'s a Rigol DS1054Z oscilloscope. Four channels, 50 MHz bandwidth. The hackerspace\'s best friend for debugging electronics.' },
                    { speaker: '', text: '📚 SOLDERING: Joining electronic components by melting a tin-lead or lead-free alloy (solder) to form a conductive bond. Modern lead-free solder melts at ~217°C. A good soldering iron heats to 350°C for quick, clean joints.' },
                ]);
            }
        },

        // ── Metal Workbench ──
        {
            id: 'metalwork',
            name: 'Metal Workbench',
            x: 2,
            y: 60,
            width: 14,
            height: 16,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A heavy steel workbench with a bench vise, angle grinder, and a full pegboard of hand tools. Hammers, files, wrenches, calipers.' },
                    { speaker: 'Ryan', text: 'This is where you do the manual work — deburring edges, fitting parts, grinding welds smooth. No amount of CNC replaces hands-on metalwork.' },
                    { speaker: 'Ryan', text: 'These calipers are Mitutoyo — someone here takes measurement seriously. 0.01mm resolution.' },
                ]);
            }
        },

        // ── Hackerspace Banner / Sign ──
        {
            id: 'banner',
            name: 'Hackerspace Drenthe',
            x: 38,
            y: 26,
            width: 24,
            height: 6,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: '"Hackerspace Drenthe — Coevorden — Est. 2019 — Open for all makers." That\'s the spirit.' },
                    { speaker: 'Ryan', text: 'A hackerspace is a community workshop where anyone can come and build things. You pay a small membership fee and get access to tools worth tens of thousands of euros.' },
                    { speaker: 'Ryan', text: 'The hacker ethic: access to tools, sharing knowledge, learning by making. These places keep craftsmanship alive.' },
                    { speaker: '', text: '📚 HACKERSPACES: Community-operated workspaces where people share tools, knowledge, and ideas. The movement started in Germany (Chaos Computer Club, 1981) and spread worldwide. The Netherlands has dozens, from Frack in Leeuwarden to Hack42 in Arnhem.' },
                ]);
            }
        },

        // ── Safety Equipment ──
        {
            id: 'safety',
            name: 'Safety Glasses',
            x: 2,
            y: 31,
            width: 4,
            height: 3,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Safety glasses rack. Rule number one in any workshop: protect your eyes. Metal shavings, sparks, UV from welding — all bad for eyeballs.' },
                    { speaker: 'Ryan', text: 'Good that they have these right at the entrance. Safety culture is the mark of a well-run space.' },
                ]);
            }
        },

        // ── First Aid Kit ──
        {
            id: 'first_aid',
            name: 'First Aid Kit',
            x: 78,
            y: 31,
            width: 2,
            height: 3,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'First aid kit. When you work with plasma cutters, angle grinders, and soldering irons, you need one nearby.' },
                ]);
            }
        },

        // ── HSD Logo on Wall ──
        {
            id: 'logo_wall',
            name: 'HSD Logo',
            x: 47,
            y: 44,
            width: 6,
            height: 10,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The Hackerspace Drenthe gear logo, painted right on the wall. HSD. A maker space where you can build anything, from a birdhouse to a CNC-machined drone frame.' },
                ]);
            }
        },

        // ═══════════════════════════════════════════════════════════
        // ── NPC Characters ────────────────────────────────────────
        // ═══════════════════════════════════════════════════════════

        // ── Dennis — at the soldering bench ──
        {
            id: 'npc_dennis',
            name: 'Dennis',
            x: 39,
            y: 63,
            width: 7,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('dennis_talks') || 0;
                game.setFlag('dennis_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Dennis', text: '*adjusts glasses and looks up from the PCB* Oh, hey. Dennis. I keep the soldering stations running around here.' },
                        { speaker: 'Dennis', text: 'Right now I\'m reflowing a LoRa gateway board. TTGO T-Beam with an SX1276 — nice little module. 868 MHz, perfect for Drenthe.' },
                        { speaker: 'Ryan', text: 'LoRa gateway? You\'re building the mesh network infrastructure?' },
                        { speaker: 'Dennis', text: 'We\'ve got twelve nodes across Coevorden already. Solar-powered, mounted on church towers and farm buildings. Coverage is about 80% of the municipality.' },
                        { speaker: 'Dennis', text: 'Want to add another node? I\'ve got spare ESP32 boards. Come to the next soldering workshop — every other Thursday.' },
                    ],
                    [
                        { speaker: 'Dennis', text: '*waves soldering iron for emphasis* You know what most people get wrong about soldering? Temperature.' },
                        { speaker: 'Dennis', text: 'Everyone cranks it to 400°C and wonders why their joints are cold. Use 330°C with good flux and a proper tip. Let the thermal mass do the work.' },
                        { speaker: 'Ryan', text: 'Cold joints at high temperature? That sounds counterintuitive.' },
                        { speaker: 'Dennis', text: 'Too hot burns off the flux before it can clean the surfaces. Then the solder just balls up instead of wetting the pad. Physics, man.' },
                        { speaker: '', text: '📚 SOLDERING TIP: A "cold solder joint" looks dull and grainy instead of shiny. It happens when the pad or component lead wasn\'t heated enough for the solder to flow properly. Ironically, excessive iron temperature makes this worse by destroying the flux.' },
                    ],
                    [
                        { speaker: 'Dennis', text: 'Hey, check this out. Built a spectrum analyser from a Raspberry Pi and an RTL-SDR dongle. Total cost: €35.' },
                        { speaker: 'Dennis', text: 'It scans 24 MHz to 1.7 GHz and displays a waterfall plot. I use it to debug our LoRa network — you can see the chirp spread spectrum signals clear as day.' },
                        { speaker: 'Ryan', text: 'SDR on a Pi? That\'s my kind of project. What software?' },
                        { speaker: 'Dennis', text: 'SDR++. Open source, runs beautifully on the Pi 5. The 2.4 GHz clock is fast enough for real-time demodulation now.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Sophie — at the 3D printers ──
        {
            id: 'npc_sophie',
            name: 'Sophie',
            x: 82,
            y: 52,
            width: 7,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('sophie_talks') || 0;
                game.setFlag('sophie_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Sophie', text: '*looks up from a Prusa printer, screwdriver in hand* Hey! I\'m Sophie. I run the 3D print workshop here.' },
                        { speaker: 'Sophie', text: 'These babies print 24/7. Right now I\'m doing a custom enclosure for a Meshtastic node — weatherproof, UV-resistant PETG, with mounting brackets for a solar panel.' },
                        { speaker: 'Ryan', text: 'Custom enclosures for IoT nodes? That\'s practical engineering.' },
                        { speaker: 'Sophie', text: 'That\'s what a hackerspace IS. Someone needs a bracket, a case, a gear — we model it in FreeCAD and print it. Same day. No waiting for shipping from China.' },
                        { speaker: 'Sophie', text: 'I teach a CAD workshop every first Tuesday of the month. Beginners welcome — we start with a pencil holder and end with parametric designs.' },
                    ],
                    [
                        { speaker: 'Sophie', text: '*holds up a translucent green print* Look. This is a chirp spread spectrum visualisation — 3D-printed from actual captured LoRa data.' },
                        { speaker: 'Sophie', text: 'Dennis gave me the waterfall data, I wrote a Python script to convert it to an STL, and this is the result. You can literally hold radio signals in your hand.' },
                        { speaker: 'Ryan', text: 'That\'s... actually beautiful. Art meets engineering.' },
                        { speaker: 'Sophie', text: 'Exactly! The maker movement isn\'t just about function. We make things beautiful, tactile, personal. Every print tells a story.' },
                        { speaker: '', text: '📚 STL (Standard Tessellation Language): A 3D file format using triangular facets to describe surfaces. Nearly all 3D printers accept STL files. Modern alternatives like 3MF include colour, material, and metadata information.' },
                    ],
                    [
                        { speaker: 'Sophie', text: 'Want to hear something cool? The Bambu X1C can do automatic filament changes. Four colours in one print, no manual intervention.' },
                        { speaker: 'Sophie', text: 'I printed the Hackerspace Drenthe gear logo in four-colour PETG. It\'s on the wall behind you.' },
                        { speaker: 'Ryan', text: 'The big gear logo? I thought that was painted!' },
                        { speaker: 'Sophie', text: '*grins* Nope. 620mm diameter, printed in 16 sections, glued together. 43 hours of print time total. My personal record.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Marco — in the CNC area ──
        {
            id: 'npc_marco',
            name: 'Marco',
            x: 10,
            y: 52,
            width: 7,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('marco_talks') || 0;
                game.setFlag('marco_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Marco', text: '*pulls down ear protection* Yo! Marco. I\'m the CNC guy. Plasma, lathe, mill — if it cuts metal, I operate it.' },
                        { speaker: 'Marco', text: 'Right now I\'m cutting brackets for the LoRa gateway mounts. Dennis designs the electronics, Sophie prints the enclosures, and I cut the mounting hardware.' },
                        { speaker: 'Ryan', text: 'A full production pipeline inside a hackerspace?' },
                        { speaker: 'Marco', text: 'That\'s what happens when maker skills combine. Electronics, 3D printing, metalwork — each discipline makes the others better.' },
                        { speaker: 'Marco', text: 'The plasma cutter does the rough shapes, then the mill does precision work. 0.05mm tolerance on the mounting holes. Try getting THAT from a hobby drill press.' },
                    ],
                    [
                        { speaker: 'Marco', text: '*shows phone screen* Check out this DXF I drew. It\'s a custom antenna mount for the church tower in Dalen.' },
                        { speaker: 'Marco', text: 'The pastor said we could mount a LoRa gateway on the tower, but we needed a bracket that fits the 200-year-old stonework without drilling. So I designed a clamp system.' },
                        { speaker: 'Ryan', text: 'Mounting modern mesh networking equipment on a medieval church tower. That\'s quite the combination.' },
                        { speaker: 'Marco', text: '*laughs* Welcome to Drenthe. We make it work with what we have. The tower gives us 30 metres of height — the range is incredible from up there.' },
                        { speaker: '', text: '📚 DXF (Drawing Exchange Format): An Autodesk format for 2D CAD drawings. CNC machines read DXF files to trace cutting paths. The format stores vectors as lines, arcs, and polylines — perfect for plasma and laser cutters.' },
                    ],
                    [
                        { speaker: 'Marco', text: 'Fun fact: this CNC plasma cutter was built by hackerspace members. We bought the stepper motors online, welded the frame ourselves, and Dennis wrote the GRBL firmware.' },
                        { speaker: 'Marco', text: 'Total cost: about €2000. A commercial machine with these specs runs €15,000 easy.' },
                        { speaker: 'Ryan', text: 'You built your own CNC machine? From scratch?' },
                        { speaker: 'Marco', text: 'That\'s hackerspace philosophy, man. Why buy it when you can build it better? We know every bolt, every motor step, every line of code.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Kim — at the welding station ──
        {
            id: 'npc_kim',
            name: 'Kim',
            x: 64,
            y: 50,
            width: 7,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('kim_talks') || 0;
                game.setFlag('kim_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Kim', text: '*flips up welding helmet* Kim. I do the welding and the heavy fabrication. Don\'t let the leather jacket fool you — I\'m certified MIG, TIG, and stick.' },
                        { speaker: 'Kim', text: 'Right now I\'m building a solar panel frame for a LoRa gateway. Galvanised steel, 40x40mm box section. It\'ll survive any Drenthe storm.' },
                        { speaker: 'Ryan', text: 'That\'s a serious frame. How many of these have you made?' },
                        { speaker: 'Kim', text: 'Seven so far. Each one custom-fitted to the installation site. The church tower ones are different from the farm building ones. You can\'t just bolt a standard bracket onto a 17th-century ridge beam.' },
                    ],
                    [
                        { speaker: 'Kim', text: '*taps the welding table* You know what I love about MIG welding? It\'s honest. You can see immediately if the joint is good or bad.' },
                        { speaker: 'Kim', text: 'A good weld bead is smooth, consistent, with even ripples. Bad weld? Porosity, undercut, spatter. The metal doesn\'t lie.' },
                        { speaker: 'Ryan', text: 'You sound like you take this seriously.' },
                        { speaker: 'Kim', text: 'Dead serious. A bad weld on a LoRa mast at 30 metres? That\'s a safety issue. I X-ray my structural welds. Marco thinks I\'m crazy, but I sleep well.' },
                        { speaker: '', text: '📚 WELD INSPECTION: Non-destructive testing (NDT) methods include visual inspection, dye penetrant testing, ultrasonic testing, and radiographic (X-ray) examination. Each reveals different defect types — surface cracks, porosity, lack of fusion, or inclusions.' },
                    ],
                    [
                        { speaker: 'Kim', text: 'I also teach the safety courses here. Workshop safety is non-negotiable.' },
                        { speaker: 'Kim', text: 'New members get a two-hour induction: eye protection, hearing protection, fire extinguisher locations, emergency stop buttons, proper lifting technique.' },
                        { speaker: 'Kim', text: 'Last year some kid tried to use the angle grinder in flip-flops. *shakes head* Not on my watch.' },
                        { speaker: 'Ryan', text: 'Safety culture. The mark of a professional workshop.' },
                        { speaker: 'Kim', text: 'Exactly. We\'re hackers, not cowboys. You can innovate AND be safe.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Joris — near the electronics area ──
        {
            id: 'npc_joris',
            name: 'Joris',
            x: 48,
            y: 63,
            width: 7,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('joris_talks') || 0;
                game.setFlag('joris_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Joris', text: '*pushes glasses up, closes laptop* Hey there. Joris. I\'m the software guy in a hardware space.' },
                        { speaker: 'Joris', text: 'I maintain the hackerspace\'s internal network, the wiki, the member management system. All self-hosted on a Proxmox cluster of refurbished Dell servers.' },
                        { speaker: 'Ryan', text: 'Self-hosted everything? Running what OS?' },
                        { speaker: 'Joris', text: '*points at hoodie* What do you think? Arch Linux on the servers, NixOS on my workstation. BTW, I use Arch.' },
                        { speaker: 'Ryan', text: '*smiles* Of course you do.' },
                        { speaker: 'Joris', text: 'I also wrote the firmware for our access control system. ESP32, RFID reader, MQTT to Home Assistant. Members badge in, the system logs who\'s in the building. Fire safety regulation.' },
                    ],
                    [
                        { speaker: 'Joris', text: 'Want to see something neat? *opens terminal* This is our Grafana dashboard. Real-time data from all twelve LoRa nodes across Coevorden.' },
                        { speaker: 'Joris', text: 'Signal strength, packet loss, battery voltage, temperature. Every five minutes, each node phones home. I store it in InfluxDB and visualise it here.' },
                        { speaker: 'Ryan', text: 'You\'re monitoring the entire mesh network from here?' },
                        { speaker: 'Joris', text: 'Not just monitoring — alerting. If a node drops offline for more than 30 minutes, I get a Telegram notification. Usually it\'s a solar panel covered in bird poop. Yes, that happens.' },
                        { speaker: '', text: '📚 GRAFANA + INFLUXDB: A common monitoring stack. InfluxDB is a time-series database optimised for sensor data. Grafana provides beautiful dashboards with real-time graphs, alerts, and annotations. Together they power most IoT monitoring setups.' },
                    ],
                    [
                        { speaker: 'Joris', text: 'I\'m also working on a MeshCore repeater firmware fork. Added over-the-air updates so we don\'t have to climb church towers every time we push a bug fix.' },
                        { speaker: 'Joris', text: 'The trick is keeping the update payload under 100KB so it fits in a single LoRa transmission burst. Differential updates, compressed with zstd.' },
                        { speaker: 'Ryan', text: 'OTA updates over LoRa? That\'s ambitious with the low bandwidth.' },
                        { speaker: 'Joris', text: 'At SF7 on 868 MHz, we get about 5.5 kbps. A 100KB update takes about 150 seconds. Not fast, but way faster than driving to Dalen with a USB cable.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Linda — at the metal workbench ──
        {
            id: 'npc_linda',
            name: 'Linda',
            x: 4,
            y: 66,
            width: 7,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('linda_talks') || 0;
                game.setFlag('linda_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Linda', text: '*sets down coffee mug and adjusts reading glasses* Oh, hello dear. I\'m Linda. I\'m the bookkeeper — and the unofficial den mother of this place.' },
                        { speaker: 'Linda', text: 'I handle the finances, the insurance, the building lease. Someone has to make sure the lights stay on while these lot play with their toys.' },
                        { speaker: 'Ryan', text: 'The business side of a hackerspace?' },
                        { speaker: 'Linda', text: 'It\'s a foundation — Stichting Hackerspace Drenthe. We have 43 paying members, a municipal subsidy, and the occasional corporate workshop. Budget is tight but we make it work.' },
                        { speaker: 'Linda', text: 'I also manage our grant applications. Last year we got €12,000 from the province for STEM education workshops for secondary school kids. That funded the Bambu printer.' },
                    ],
                    [
                        { speaker: 'Linda', text: '*sips coffee* You know what nobody talks about with hackerspaces? Community. These young people — Dennis, Sophie, Marco — they\'d be sitting alone at home otherwise.' },
                        { speaker: 'Linda', text: 'Here they build things together, teach each other, argue about Linux distributions. It\'s a family. A loud, nerdy, slightly dangerous family.' },
                        { speaker: 'Ryan', text: 'That sounds like the original hacker ethic. Community through building.' },
                        { speaker: 'Linda', text: 'My late husband was an electronics technician at Philips. He\'d have loved this place. I joined after he passed — to keep busy, to learn. Now I can solder better than most of them, and I\'m 63.' },
                        { speaker: 'Linda', text: '*winks* Don\'t tell Dennis I said that. His ego is fragile.' },
                    ],
                    [
                        { speaker: 'Linda', text: 'We\'re planning an open day next month. Want to help spread the word?' },
                        { speaker: 'Linda', text: 'We\'ll have live demos of the CNC machines, a 3D printing workshop, a soldering course for beginners, and Joris is doing a LoRa network demo.' },
                        { speaker: 'Ryan', text: 'Sounds great. How do people usually find out about this place?' },
                        { speaker: 'Linda', text: 'Word of mouth, mostly. And our website — Joris keeps it running on a Raspberry Pi in the server room. *laughs* Yes, we have a server room. It\'s actually a broom closet.' },
                    ],
                    [
                        { speaker: 'Linda', text: '*thoughtful look* You know, you remind me of someone. A couple of years ago, a young German woman visited one of our Tuesday presentations.' },
                        { speaker: 'Linda', text: 'Eva, I think her name was. Very sharp, very technical. She asked Dennis all sorts of questions about LoRa security, mesh networking, off-grid communication.' },
                        { speaker: 'Ryan', text: 'German? I don\'t remember that.' },
                        { speaker: 'Linda', text: 'You weren\'t here that evening. She only came once, but she made an impression. Said she was in the area visiting friends. Something about a dog training session?' },
                        { speaker: 'Linda', text: 'Funny — I remember because she asked about you specifically. "Is the radio guy here tonight?" Dennis told her you\'d probably be at the next meeting, but she never came back.' },
                        { speaker: 'Ryan', text: '...' },
                        { speaker: 'Linda', text: 'Nice lady though. Had a rescue dog with her in the car. Black Shepherd mix, if I remember right. *smiles* I always remember the dogs.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Exit Door → drive back home ──
        {
            id: 'exit_door',
            name: '← Drive Home',
            x: 95,
            y: 39,
            width: 5,
            height: 22,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Time to head home. Good session tonight.' }
                ], function() {
                    game.setFlag('driving_destination', 'home_from_hackerspace');
                    game.loadScene('driving_day');
                });
            }
        },

        // ── Classroom Door ──
        {
            id: 'classroom_door',
            name: 'Classroom →',
            x: 46,
            y: 39,
            width: 7,
            height: 22,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            targetScene: 'hackerspace_classroom'
        }
    ],

    onEnter: function(game) {
        // Clear any leftover NPC characters
        this._removeCharacters();

        // Spawn the workshop crew with fade-in
        setTimeout(() => { this._spawnCharacters(game); }, 200);

        // Start NPC patrol movement after they've appeared
        setTimeout(() => { this._startPatrols(); }, 2000);

        // Start synthesized ambient audio
        setTimeout(() => { this._initAudio(); }, 300);

        // Start VFX (welding sparks, printer dings)
        setTimeout(() => { this._startVFX(); }, 2000);

        // Start ambient voice chatter
        setTimeout(() => { this._startChatter(); }, 4000);

        if (!game.getFlag('visited_hackerspace')) {
            game.setFlag('visited_hackerspace', true);

            // ── Cinematic entrance sequence ──
            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: '*The heavy steel door swings open. A wall of sound hits Ryan — machine hum, stepper motors, the crackle of a welding arc.*' },
                    { speaker: 'Ryan', text: 'Hackerspace Drenthe in Coevorden. Housed in an old school building — high ceilings, big windows, concrete floor.' },
                    { speaker: '', text: '*The CNC plasma cutter throws blue sparks across the far wall. A row of 3D printers click in rhythm. The air smells of machine oil, solder flux, and fresh coffee.*' },
                    { speaker: 'Ryan', text: 'People everywhere. Makers, hackers, builders — each at their workstation, deep in their projects.' },
                    { speaker: '', text: '*Kim flips her welding helmet down — CRACK — an arc strikes. Marco feeds steel into the plasma cutter. Sophie swaps a filament spool. Dennis hunches over a PCB.*' },
                    { speaker: 'Ryan', text: 'This is where things get made. This is where people build things. Real things, with real tools.' },
                    { speaker: 'Ryan', text: 'I love it.' },
                ]);
            }, 600);
        } else {
            setTimeout(() => {
                const greetings = [
                    [
                        { speaker: '', text: '*The familiar symphony of machines greets Ryan. Stepper motors, plasma hiss, the distant ring of a hammer on steel.*' },
                        { speaker: 'Ryan', text: 'Back at the hackerspace. The crew\'s all here tonight.' },
                    ],
                    [
                        { speaker: '', text: '*A welding arc flashes blue in the corner. The 3D printers click away like mechanical crickets.*' },
                        { speaker: 'Ryan', text: 'Hackerspace Drenthe. The machines are running, the coffee is flowing.' },
                    ],
                    [
                        { speaker: '', text: '*The angle grinder screams briefly, then quiets. Someone laughs near the soldering bench.*' },
                        { speaker: 'Ryan', text: 'The familiar hum of stepper motors and the smell of solder flux. Good to be back.' },
                    ],
                ];
                game.startDialogue(greetings[Math.floor(Math.random() * greetings.length)]);
            }, 500);
        }
    },

    onExit: function() {
        this._removeCharacters();
        this._stopPatrols();
        this._stopAudio();
        this._stopVFX();
        this._stopChatter();
    }
};

if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(HackerspaceScene);
}
