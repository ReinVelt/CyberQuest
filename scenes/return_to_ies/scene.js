/**
 * Scene: Return to Max — The Homecoming  ★ HOLLYWOOD EDITION ★
 * ═══════════════════════════════════════════════════════════
 * After the AIVD debrief in Den Haag, Ryan returns home
 * late at night. Max is waiting up. He tells her everything.
 *
 * Cinematic layer-cake:
 *  ▸ Letterbox bars + fade-in
 *  ▸ Headlight sweep on arrival
 *  ▸ Warm fireplace glow pulsing
 *  ▸ Emotional synthesized piano stings per section
 *  ▸ Layered ambient audio (fire, wind, clock, dog whimper)
 *  ▸ Dog idle fidget animations
 *  ▸ Section-transition cinematic wipes
 *  ▸ Vignette intensity shifts with dramatic beats
 *
 * Flow: debrief → return_to_max → morning_after
 * Background: livingroom.svg (Max baked into SVG)
 * Flags set: return_to_max_complete
 * ═══════════════════════════════════════════════════════════
 */

const ReturnToMaxScene = {
    id: 'return_to_max',
    name: 'Return to Max',

    background: 'assets/images/scenes/livingroom.svg',
    description: 'The living room at night. A single lamp glows. Max is curled up on the couch, waiting.',
    playerStart: { x: 80, y: 85 },

    // 🎬 Accessibility / Movie Mode — continue to next morning
    accessibilityPath: ['continue-morning'],

    _timeoutIds: [],
    _intervalIds: [],
    _audioCtx: null,
    _audioNodes: [],
    _masterGain: null,
    _dogAnimRAF: null,

    hotspots: [
        {
            id: 'continue-morning',
            name: 'Continue →',
            x: 40, y: 82, width: 20, height: 10,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action(game) {
                if (game.getFlag('return_to_max_complete')) {
                    game.startDialogue([
                        { speaker: '', text: '*Hours later. The fire has burned to embers. The dogs are asleep. Max rests her head on Ryan\'s shoulder.*' },
                        { speaker: '', text: '*Outside, the first grey light of dawn touches the flat Drenthe horizon.*' }
                    ]);
                    game.sceneTimeout(() => game.loadScene('morning_after'), 5000);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'I need to finish telling Max everything first.' }
                    ]);
                }
            }
        }
    ],

    /* ═══════════════════════════════════════════════════════
     *  LIFECYCLE
     * ═══════════════════════════════════════════════════════ */
    onEnter(game) {
        this._cleanup();

        const chars = document.getElementById('scene-characters');
        if (chars) chars.querySelectorAll('.npc-character').forEach(n => n.remove());

        // ── Visual layers ──
        this._addNightOverlay();
        this._addFireplaceGlow();
        this._addLetterbox();

        // ── Audio ──
        this._startAmbientAudio();

        // ── Dogs (Max is already in SVG bg) ──
        game.sceneTimeout(() => {
            game.showCharacter('dog_white', 35, 77, 0.12);
            game.showCharacter('dog_white', 40, 78, 0.12);
            game.showCharacter('pug', 38, 83, 0.10);
            this._startDogFidget();
        }, 600);

        // ── Cinematic entrance: black → headlight → reveal ──
        this._cinematicOpen(game);
    },

    onExit() {
        this._cleanup();
        this._removeAllOverlays();

        const chars = document.getElementById('scene-characters');
        if (chars) chars.querySelectorAll('.npc-character').forEach(n => n.remove());

        if (window.game && window.game.isDialogueActive) window.game.endDialogue();
    },

    _cleanup() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._intervalIds.forEach(id => clearInterval(id));
        this._timeoutIds = [];
        this._intervalIds = [];
        this._stopAudio();
        if (this._dogAnimRAF) cancelAnimationFrame(this._dogAnimRAF);
        this._dogAnimRAF = null;
    },

    /* ═══════════════════════════════════════════════════════
     *  NIGHT OVERLAY + VIGNETTE
     * ═══════════════════════════════════════════════════════ */
    _addNightOverlay() {
        this._removeEl('rti-night');
        const el = document.createElement('div');
        el.id = 'rti-night';
        Object.assign(el.style, {
            position: 'absolute', inset: '0',
            background: 'radial-gradient(ellipse at 35% 40%, rgba(30,25,15,0.20) 0%, rgba(8,5,18,0.62) 100%)',
            pointerEvents: 'none', zIndex: '2',
            transition: 'opacity 3s ease, background 2s ease',
            opacity: '0'
        });
        this._sceneEl().appendChild(el);
        requestAnimationFrame(() => { el.style.opacity = '1'; });
    },

    /** Pulse the vignette darker for dramatic beats */
    _pulseVignette(intensity = 0.75, durationMs = 3000) {
        const el = document.getElementById('rti-night');
        if (!el) return;
        el.style.background = `radial-gradient(ellipse at 35% 40%, rgba(30,25,15,${0.15 + intensity * 0.15}) 0%, rgba(8,5,18,${0.55 + intensity * 0.20}) 100%)`;
        const tid = setTimeout(() => {
            el.style.background = 'radial-gradient(ellipse at 35% 40%, rgba(30,25,15,0.20) 0%, rgba(8,5,18,0.62) 100%)';
        }, durationMs);
        this._timeoutIds.push(tid);
    },

    /* ═══════════════════════════════════════════════════════
     *  FIREPLACE GLOW — warm orange pulse behind fire area
     * ═══════════════════════════════════════════════════════ */
    _addFireplaceGlow() {
        this._removeEl('rti-fireglow');
        const el = document.createElement('div');
        el.id = 'rti-fireglow';
        Object.assign(el.style, {
            position: 'absolute',
            left: '28%', top: '20%', width: '18%', height: '50%',
            background: 'radial-gradient(circle, rgba(255,140,40,0.18) 0%, rgba(255,80,10,0.06) 50%, transparent 75%)',
            pointerEvents: 'none', zIndex: '1',
            animation: 'rti-fire-pulse 3s ease-in-out infinite alternate',
            filter: 'blur(8px)'
        });
        this._sceneEl().appendChild(el);
        this._injectCSS('rti-fire-css', `
            @keyframes rti-fire-pulse {
                0%   { opacity: 0.6; transform: scale(1); }
                50%  { opacity: 1;   transform: scale(1.06); }
                100% { opacity: 0.7; transform: scale(0.97); }
            }
        `);
    },

    /* ═══════════════════════════════════════════════════════
     *  LETTERBOX BARS — cinematic widescreen
     * ═══════════════════════════════════════════════════════ */
    _addLetterbox() {
        this._removeEl('rti-ltop');
        this._removeEl('rti-lbot');

        const make = (id, pos) => {
            const el = document.createElement('div');
            el.id = id;
            Object.assign(el.style, {
                position: 'absolute', left: '0', right: '0',
                height: '0%', background: '#000',
                pointerEvents: 'none', zIndex: '50',
                transition: 'height 1.8s cubic-bezier(0.22,0.61,0.36,1)'
            });
            el.style[pos] = '0';
            this._sceneEl().appendChild(el);
            return el;
        };

        this._ltop = make('rti-ltop', 'top');
        this._lbot = make('rti-lbot', 'bottom');

        // Open with bars fully closed, then reveal
        requestAnimationFrame(() => {
            this._ltop.style.height = '8%';
            this._lbot.style.height = '8%';
        });
    },

    _removeLetterbox() {
        ['rti-ltop', 'rti-lbot'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.style.height = '0%'; setTimeout(() => el.remove(), 2000); }
        });
    },

    /* ═══════════════════════════════════════════════════════
     *  HEADLIGHT SWEEP — car arrival effect
     * ═══════════════════════════════════════════════════════ */
    _headlightSweep() {
        this._removeEl('rti-headlight');
        const el = document.createElement('div');
        el.id = 'rti-headlight';
        Object.assign(el.style, {
            position: 'absolute', inset: '0',
            pointerEvents: 'none', zIndex: '4',
            background: 'linear-gradient(110deg, transparent 0%, rgba(255,240,200,0.3) 20%, rgba(255,240,200,0.08) 40%, transparent 60%)',
            transform: 'translateX(-120%)',
            transition: 'transform 2.5s cubic-bezier(0.25,0.46,0.45,0.94), opacity 1s ease'
        });
        this._sceneEl().appendChild(el);
        requestAnimationFrame(() => { el.style.transform = 'translateX(120%)'; });
        const tid = setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => this._removeEl('rti-headlight'), 1500);
        }, 2800);
        this._timeoutIds.push(tid);
    },

    /* ═══════════════════════════════════════════════════════
     *  DOG FIDGET ANIMATIONS
     * ═══════════════════════════════════════════════════════ */
    _startDogFidget() {
        const fidget = () => {
            const dogs = document.querySelectorAll('.npc-character');
            if (!dogs.length) return;
            const pick = dogs[Math.floor(Math.random() * dogs.length)];
            if (!pick) return;

            // Random micro-movement
            const r = Math.random();
            if (r < 0.3) {
                // Ear twitch — quick scale pulse
                pick.style.transition = 'transform 0.3s ease';
                pick.style.transform += ' scaleY(1.04)';
                setTimeout(() => { pick.style.transform = pick.style.transform.replace(' scaleY(1.04)', ''); }, 400);
            } else if (r < 0.5) {
                // Tail wag — oscillate X
                pick.style.transition = 'transform 0.15s ease';
                const orig = pick.style.left;
                pick.style.transform += ' translateX(2px)';
                setTimeout(() => { pick.style.transform += ' translateX(-4px)'; }, 150);
                setTimeout(() => { pick.style.transform += ' translateX(2px)'; }, 300);
                setTimeout(() => { pick.style.transform = pick.style.transform.replace(/ translateX\(-?\d+px\)/g, ''); }, 450);
            } else if (r < 0.65) {
                // Breathing — slow vertical
                pick.style.transition = 'transform 1.5s ease';
                pick.style.transform += ' translateY(-1px)';
                setTimeout(() => { pick.style.transform = pick.style.transform.replace(' translateY(-1px)', ''); }, 1500);
            }
        };

        const loop = () => {
            fidget();
            const next = 2000 + Math.random() * 4000;
            const tid = setTimeout(loop, next);
            this._timeoutIds.push(tid);
        };
        const tid = setTimeout(loop, 3000);
        this._timeoutIds.push(tid);
    },

    /* ═══════════════════════════════════════════════════════
     *  SECTION TITLE CARD — cinematic text overlay
     * ═══════════════════════════════════════════════════════ */
    _showTitleCard(text, subtext = '') {
        this._removeEl('rti-titlecard');
        const el = document.createElement('div');
        el.id = 'rti-titlecard';
        el.innerHTML = `
            <div style="font-size:clamp(18px,3vw,32px);font-weight:300;letter-spacing:0.15em;
                        text-transform:uppercase;color:rgba(255,255,255,0.9);text-shadow:0 2px 20px rgba(0,0,0,0.8);
                        margin-bottom:8px">${text}</div>
            ${subtext ? `<div style="font-size:clamp(11px,1.5vw,16px);font-weight:300;letter-spacing:0.3em;
                        color:rgba(200,180,160,0.7);text-transform:uppercase">${subtext}</div>` : ''}
        `;
        Object.assign(el.style, {
            position: 'absolute', inset: '0',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', zIndex: '55',
            opacity: '0', transition: 'opacity 1.5s ease'
        });
        this._sceneEl().appendChild(el);
        requestAnimationFrame(() => { el.style.opacity = '1'; });
        const tid = setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => this._removeEl('rti-titlecard'), 1500);
        }, 3500);
        this._timeoutIds.push(tid);
    },

    /* ═══════════════════════════════════════════════════════
     *  CINEMATIC WIPE — between sections
     * ═══════════════════════════════════════════════════════ */
    _sectionWipe(callback, delayMs = 800) {
        this._removeEl('rti-wipe');
        const el = document.createElement('div');
        el.id = 'rti-wipe';
        Object.assign(el.style, {
            position: 'absolute', inset: '0',
            background: 'rgba(0,0,0,0.85)',
            pointerEvents: 'none', zIndex: '45',
            opacity: '0', transition: 'opacity 0.7s ease'
        });
        this._sceneEl().appendChild(el);
        requestAnimationFrame(() => { el.style.opacity = '1'; });

        const tid = setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => this._removeEl('rti-wipe'), 800);
            if (callback) callback();
        }, delayMs);
        this._timeoutIds.push(tid);
    },

    /* ═══════════════════════════════════════════════════════
     *  AMBIENT AUDIO — 6-layer night atmosphere
     * ═══════════════════════════════════════════════════════ */
    _startAmbientAudio() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._audioCtx = ctx;
            const master = ctx.createGain();
            master.gain.value = 0;
            master.connect(ctx.destination);
            this._masterGain = master;

            // Fade master in over 4s
            master.gain.linearRampToValueAtTime(0.10, ctx.currentTime + 4);

            // ── 1. Fireplace crackle (filtered noise) ──
            const noiseLen = ctx.sampleRate * 2;
            const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
            const nd = noiseBuf.getChannelData(0);
            for (let i = 0; i < noiseLen; i++) nd[i] = Math.random() * 2 - 1;

            const fire = ctx.createBufferSource();
            fire.buffer = noiseBuf; fire.loop = true;
            const fireBP = ctx.createBiquadFilter();
            fireBP.type = 'bandpass'; fireBP.frequency.value = 550; fireBP.Q.value = 1.2;
            const fireG = ctx.createGain(); fireG.gain.value = 0.35;
            fire.connect(fireBP).connect(fireG).connect(master);
            fire.start();
            this._audioNodes.push(fire);

            // ── 2. Wind outside (very low filtered noise swell) ──
            const wind = ctx.createBufferSource();
            wind.buffer = noiseBuf; wind.loop = true;
            const windLP = ctx.createBiquadFilter();
            windLP.type = 'lowpass'; windLP.frequency.value = 200;
            const windG = ctx.createGain(); windG.gain.value = 0.15;
            // Slow wind swell
            const windLFO = ctx.createOscillator();
            windLFO.type = 'sine'; windLFO.frequency.value = 0.08;
            const windLFOG = ctx.createGain(); windLFOG.gain.value = 0.06;
            windLFO.connect(windLFOG).connect(windG.gain);
            windLFO.start();
            wind.connect(windLP).connect(windG).connect(master);
            wind.start();
            this._audioNodes.push(wind, windLFO);

            // ── 3. House hum ──
            const hum = ctx.createOscillator();
            hum.type = 'sine'; hum.frequency.value = 50;
            const humG = ctx.createGain(); humG.gain.value = 0.04;
            hum.connect(humG).connect(master);
            hum.start();
            this._audioNodes.push(hum);

            // ── 4. Clock tick ──
            const tickLoop = () => {
                if (!this._audioCtx) return;
                const t = ctx.currentTime;
                // Tick
                const osc = ctx.createOscillator();
                osc.type = 'sine'; osc.frequency.value = 2600;
                const env = ctx.createGain();
                env.gain.setValueAtTime(0.10, t);
                env.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
                osc.connect(env).connect(master);
                osc.start(t); osc.stop(t + 0.03);
                // Tock (slightly lower)
                const tid2 = setTimeout(() => {
                    if (!this._audioCtx) return;
                    const t2 = ctx.currentTime;
                    const osc2 = ctx.createOscillator();
                    osc2.type = 'sine'; osc2.frequency.value = 2200;
                    const env2 = ctx.createGain();
                    env2.gain.setValueAtTime(0.07, t2);
                    env2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.025);
                    osc2.connect(env2).connect(master);
                    osc2.start(t2); osc2.stop(t2 + 0.03);
                }, 480);
                this._timeoutIds.push(tid2);
                const next = 960 + Math.random() * 80;
                const tid = setTimeout(tickLoop, next);
                this._timeoutIds.push(tid);
            };
            const tid = setTimeout(tickLoop, 3000);
            this._timeoutIds.push(tid);

            // ── 5. Random fireplace pop/crackle ──
            const popLoop = () => {
                if (!this._audioCtx) return;
                const t = ctx.currentTime;
                const pop = ctx.createOscillator();
                pop.type = 'sawtooth';
                pop.frequency.setValueAtTime(300 + Math.random() * 400, t);
                pop.frequency.exponentialRampToValueAtTime(80, t + 0.08);
                const popEnv = ctx.createGain();
                popEnv.gain.setValueAtTime(0.12 + Math.random() * 0.08, t);
                popEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                pop.connect(popEnv).connect(master);
                pop.start(t); pop.stop(t + 0.12);
                const next = 3000 + Math.random() * 8000;
                const tid = setTimeout(popLoop, next);
                this._timeoutIds.push(tid);
            };
            const tid2 = setTimeout(popLoop, 5000);
            this._timeoutIds.push(tid2);

            // ── 6. Occasional dog whimper/sigh ──
            const dogLoop = () => {
                if (!this._audioCtx) return;
                const t = ctx.currentTime;
                // Short descending tone — like a sleeping dog sigh
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(280 + Math.random() * 80, t);
                osc.frequency.exponentialRampToValueAtTime(140, t + 0.5);
                const env = ctx.createGain();
                env.gain.setValueAtTime(0.03, t);
                env.gain.linearRampToValueAtTime(0.05, t + 0.1);
                env.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
                const filt = ctx.createBiquadFilter();
                filt.type = 'lowpass'; filt.frequency.value = 500;
                osc.connect(filt).connect(env).connect(master);
                osc.start(t); osc.stop(t + 0.55);
                const next = 15000 + Math.random() * 25000;
                const tid = setTimeout(dogLoop, next);
                this._timeoutIds.push(tid);
            };
            const tid3 = setTimeout(dogLoop, 8000);
            this._timeoutIds.push(tid3);

        } catch (e) {
            console.warn('ReturnToMax: audio init failed', e);
        }
    },

    /* ═══════════════════════════════════════════════════════
     *  EMOTIONAL PIANO STINGS — synthesized per-section
     *  Simple: 2-4 note chords with slow attack, long release
     * ═══════════════════════════════════════════════════════ */
    _playPianoSting(notes, duration = 3) {
        if (!this._audioCtx || !this._masterGain) return;
        const ctx = this._audioCtx;
        const t = ctx.currentTime;
        const chordGain = ctx.createGain();
        chordGain.gain.setValueAtTime(0, t);
        chordGain.gain.linearRampToValueAtTime(0.12, t + 0.8);
        chordGain.gain.linearRampToValueAtTime(0.08, t + duration * 0.6);
        chordGain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        chordGain.connect(this._masterGain);

        for (const freq of notes) {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            // Add slight shimmer
            const shimmer = ctx.createOscillator();
            shimmer.type = 'sine';
            shimmer.frequency.value = freq * 2.01; // slight detune for warmth
            const shimG = ctx.createGain();
            shimG.gain.value = 0.03;
            shimmer.connect(shimG).connect(chordGain);
            osc.connect(chordGain);
            osc.start(t); osc.stop(t + duration + 0.1);
            shimmer.start(t); shimmer.stop(t + duration + 0.1);
        }
    },

    // Named chord presets (frequencies in Hz)
    _chords: {
        arrival:    [261.6, 329.6, 392.0],       // C major — hope
        embrace:    [220.0, 277.2, 329.6],        // A minor — tenderness
        settling:   [246.9, 311.1, 370.0],        // B minor — quiet
        signal:     [293.7, 349.2, 440.0],        // D minor — tension
        eva:        [261.6, 311.1, 370.0],        // C minor — complexity
        danger:     [233.1, 277.2, 349.2],        // Bb minor — danger
        exposure:   [293.7, 370.0, 440.0],        // D major — resolve
        aivd:       [261.6, 329.6, 392.0, 493.9], // Cmaj7 — change
        processing: [220.0, 261.6, 329.6],        // Am — weight
        resolution: [261.6, 329.6, 392.0, 523.3], // C — warmth/home
    },

    _stopAudio() {
        this._audioNodes.forEach(n => { try { n.stop(); } catch (_) {} });
        this._audioNodes = [];
        if (this._audioCtx) {
            try { this._audioCtx.close(); } catch (_) {}
            this._audioCtx = null;
            this._masterGain = null;
        }
    },

    /* ═══════════════════════════════════════════════════════
     *  CINEMATIC OPEN — full black, title, headlight, reveal
     * ═══════════════════════════════════════════════════════ */
    _cinematicOpen(game) {
        // Full black overlay
        this._removeEl('rti-blackout');
        const black = document.createElement('div');
        black.id = 'rti-blackout';
        Object.assign(black.style, {
            position: 'absolute', inset: '0',
            background: '#000', pointerEvents: 'none', zIndex: '60',
            opacity: '1', transition: 'opacity 2.5s ease'
        });
        this._sceneEl().appendChild(black);

        // Phase 1: Title card on black (1s delay)
        const t1 = setTimeout(() => {
            this._showTitleCard('Compascuum', 'Late Evening');
        }, 800);
        this._timeoutIds.push(t1);

        // Phase 2: Headlight sweep (3.5s)
        const t2 = setTimeout(() => {
            this._headlightSweep();
        }, 3500);
        this._timeoutIds.push(t2);

        // Phase 3: Fade from black (5s)
        const t3 = setTimeout(() => {
            black.style.opacity = '0';
            setTimeout(() => this._removeEl('rti-blackout'), 3000);
        }, 5000);
        this._timeoutIds.push(t3);

        // Phase 4: Start dialogue (6.5s)
        const t4 = setTimeout(() => {
            this._playHomecoming(game);
        }, 6500);
        this._timeoutIds.push(t4);
    },

    /* ═══════════════════════════════════════════════════════
     *  DIALOGUE SECTIONS with per-section VFX triggers
     * ═══════════════════════════════════════════════════════ */
    _playHomecoming(game) {
        const chords = this._chords;

        const sections = [
            // ── 1. Arrival — the car, the driveway ──
            {
                chord: chords.arrival,
                vfx: () => { /* headlight already played */ },
                lines: [
                    { speaker: '', text: '*A black government car pulls into the gravel driveway. Engine cuts. Silence.*' },
                    { speaker: '', text: '*Ryan climbs out. The air smells like peat and cut grass. Home.*' },
                    { speaker: '', text: '*Through the window he can see a single lamp. She\'s still up.*' },
                    { speaker: 'Ryan', text: '*Hesitates at the front door. Takes a breath.*' },
                    { speaker: 'Ryan', text: 'How do you even begin to explain something like this?' }
                ]
            },

            // ── 2. The door opens ──
            {
                chord: chords.embrace,
                vfx: () => { this._pulseVignette(0.3, 6000); },
                lines: [
                    { speaker: '', text: '*The door opens before he can reach the handle.*' },
                    { speaker: 'Max', text: 'Ryan.' },
                    { speaker: '', text: '*She\'s been crying. She tries to hide it. Can\'t.*' },
                    { speaker: 'Max', text: 'I\'ve been watching the news. All day. Every channel.' },
                    { speaker: 'Max', text: '"Major intelligence operation in Lower Saxony." "Russian cell dismantled." "Dutch civilian involvement."' },
                    { speaker: 'Ryan', text: 'Max, I—' },
                    { speaker: 'Max', text: '*Pulls him into a tight hug. Doesn\'t let go for a long time.*' },
                    { speaker: '', text: '*Tino and Kessy scramble over, tails going wild. ET snorts from between their legs.*' }
                ]
            },

            // ── 3. Settling in ──
            {
                chord: chords.settling,
                vfx: () => {},
                lines: [
                    { speaker: '', text: '*They sit on the couch. Two cups of tea. The fire is down to embers but still warm.*' },
                    { speaker: 'Max', text: 'Where do I even start?' },
                    { speaker: 'Ryan', text: 'I owe you the whole story. From the beginning.' },
                    { speaker: 'Max', text: '...I think I need to hear it.' },
                    { speaker: '', text: '*Tino rests his head on Ryan\'s foot. Kessy curls up next to Max.*' }
                ]
            },

            // ── 4. The signal — how it started ──
            {
                chord: chords.signal,
                vfx: () => { this._pulseVignette(0.4, 4000); },
                lines: [
                    { speaker: 'Ryan', text: 'It started with a signal. On the SDR. A pattern in the noise that shouldn\'t have been there.' },
                    { speaker: 'Ryan', text: 'I thought it was amateur radio interference at first. Then I decoded it.' },
                    { speaker: 'Ryan', text: 'Military-grade encryption. Coming from somewhere near the German border.' },
                    { speaker: 'Max', text: '...From your mancave? You picked this up from our house?' },
                    { speaker: 'Ryan', text: 'The LOFAR array helped. Cees and David confirmed the coordinates.' },
                    { speaker: 'Max', text: 'Cees Bassa. The satellite man.' },
                    { speaker: 'Ryan', text: 'Yes. He tracked the signal source. A former military facility. Steckerdoser Heide.' }
                ]
            },

            // ── 5. Eva ──
            {
                chord: chords.eva,
                vfx: () => { this._pulseVignette(0.5, 5000); },
                lines: [
                    { speaker: 'Max', text: 'And the woman? Eva?' },
                    { speaker: '', text: '*Ryan pauses. This is the hard part.*' },
                    { speaker: 'Ryan', text: 'Eva Weber. German intelligence. Her father was involved years ago — died trying to expose the same operation.' },
                    { speaker: 'Ryan', text: 'She contacted me because of my radio work. She needed someone who could read the signals.' },
                    { speaker: 'Max', text: '*Quietly* That woman at the dog training weekend. Tony Knight\'s workshop. I introduced you.' },
                    { speaker: 'Ryan', text: 'Wait. You knew her?' },
                    { speaker: 'Max', text: 'I didn\'t *know* her. She was there with a rescue dog. Seemed lovely. I introduced her to you because she asked about antennas.' },
                    { speaker: 'Ryan', text: 'I have zero memory of that.' },
                    { speaker: 'Max', text: 'Of course you don\'t. You were elbow-deep in a circuit board.' },
                    { speaker: 'Max', text: '*Small laugh through tears* She was watching you. I thought she was just curious.' }
                ]
            },

            // ── 6. The facility — the danger ──
            {
                chord: chords.danger,
                vfx: () => { this._pulseVignette(0.8, 8000); },
                lines: [
                    { speaker: 'Max', text: 'The news said someone broke into the facility. A *civilian*.' },
                    { speaker: '', text: '*Long silence. The fire pops.*' },
                    { speaker: 'Ryan', text: '...That was me.' },
                    { speaker: 'Max', text: '*Her hands tighten around the tea cup*' },
                    { speaker: 'Ryan', text: 'Volkov — the Russian commander — had weaponized the satellite infrastructure. The whole array.' },
                    { speaker: 'Ryan', text: 'He could disrupt communications across northern Europe. Aviation, emergency services, military.' },
                    { speaker: 'Ryan', text: 'The countdown was already running, Max. Hours. Not days.' },
                    { speaker: 'Max', text: 'And you went IN there? Into a military compound? With armed guards?' },
                    { speaker: 'Ryan', text: 'There was no other option. Not in time.' },
                    { speaker: 'Max', text: '*Sets the cup down. Her hands are shaking.*' },
                    { speaker: 'Max', text: 'You could have died. You could be dead right now, and I\'d be reading about it on the NOS.' }
                ]
            },

            // ── 7. The exposure — the press package ──
            {
                chord: chords.exposure,
                vfx: () => { this._pulseVignette(0.3, 4000); },
                lines: [
                    { speaker: 'Ryan', text: 'I transmitted everything. Jaap helped with the dead man\'s switch. David triangulated the signals. Cees confirmed via satellite.' },
                    { speaker: 'Ryan', text: 'The evidence went to every major news outlet simultaneously. They couldn\'t suppress it.' },
                    { speaker: 'Max', text: 'That\'s why every phone in the country was going off this morning.' },
                    { speaker: 'Ryan', text: 'The BND arrested Volkov. NATO secured the facility. It\'s over.' },
                    { speaker: 'Max', text: '*Wipes her eyes* Is it? Is it really over?' },
                    { speaker: 'Ryan', text: 'The operation is. What comes next... I don\'t know yet.' }
                ]
            },

            // ── 8. The AIVD ──
            {
                chord: chords.aivd,
                vfx: () => {},
                lines: [
                    { speaker: 'Max', text: 'Where were you today? After the news broke?' },
                    { speaker: 'Ryan', text: 'Den Haag. The AIVD.' },
                    { speaker: 'Max', text: '*Stares at him* Dutch intelligence.' },
                    { speaker: 'Ryan', text: 'Agent Van der Berg. He debriefed me for hours. Official statement, timeline, evidence chain.' },
                    { speaker: 'Max', text: 'Are you in trouble?' },
                    { speaker: 'Ryan', text: 'No. The opposite, actually.' },
                    { speaker: '', text: '*Ryan reaches into his pocket and places a plain white business card on the coffee table.*' },
                    { speaker: 'Ryan', text: 'They want to recruit me. "Institutional support," Van der Berg called it.' },
                    { speaker: 'Max', text: '*Picks up the card. Turns it over. Plain white. AIVD crest.*' },
                    { speaker: 'Max', text: 'Ryan Weylant. Government agent.' },
                    { speaker: 'Ryan', text: 'I didn\'t say yes.' }
                ]
            },

            // ── 9. Max processes ──
            {
                chord: chords.processing,
                vfx: () => { this._pulseVignette(0.6, 6000); },
                lines: [
                    { speaker: '', text: '*Silence. The clock ticks. ET snores softly on the rug.*' },
                    { speaker: 'Max', text: 'I\'m trying to decide if I\'m furious or proud.' },
                    { speaker: 'Ryan', text: 'Both is fine.' },
                    { speaker: 'Max', text: '*Almost laughs* Both. Yes. Both.' },
                    { speaker: 'Max', text: 'You lied to me. For days. "Just radio stuff, Max." "Nothing interesting, Max."' },
                    { speaker: 'Ryan', text: 'I was trying to protect—' },
                    { speaker: 'Max', text: 'Don\'t. Don\'t say you were protecting me. I\'m not a child.' },
                    { speaker: '', text: '*More silence. Tino whimpers softly in his sleep.*' },
                    { speaker: 'Max', text: 'You saved thousands of lives. That\'s what the news said. Thousands.' },
                    { speaker: 'Ryan', text: 'I had help. David. Cees. Jaap. Eva. Even the Meshtastic community.' },
                    { speaker: 'Max', text: 'But you\'re the one who went in. You.' }
                ]
            },

            // ── 10. Resolution — together ──
            {
                chord: chords.resolution,
                vfx: () => {
                    // Warm the whole scene — slightly golden vignette
                    const el = document.getElementById('rti-night');
                    if (el) el.style.background = 'radial-gradient(ellipse at 35% 40%, rgba(50,40,20,0.10) 0%, rgba(15,10,25,0.45) 100%)';
                    // Boost fireplace glow
                    const fg = document.getElementById('rti-fireglow');
                    if (fg) fg.style.opacity = '1.0';
                },
                lines: [
                    { speaker: 'Max', text: '*Takes his hand*' },
                    { speaker: 'Max', text: 'Promise me something.' },
                    { speaker: 'Ryan', text: 'Anything.' },
                    { speaker: 'Max', text: 'Next time the world needs saving, you tell me first. Before you go.' },
                    { speaker: 'Ryan', text: '*Squeezes her hand* I promise.' },
                    { speaker: 'Max', text: 'And the AIVD thing... we decide together. Not just you in your mancave at 3 AM.' },
                    { speaker: 'Ryan', text: 'Together. Always.' },
                    { speaker: '', text: '*She leans against him. The fire glows. The dogs breathe softly.*' },
                    { speaker: '', text: '*Outside, the Drenthe night is vast and quiet. Stars over the peat bogs.*' },
                    { speaker: '', text: '*For the first time in weeks, Ryan feels something he\'d almost forgotten.*' },
                    { speaker: '', text: '*Home.*' }
                ]
            }
        ];

        let idx = 0;

        const playNext = () => {
            if (idx >= sections.length) {
                // ── Finale: remove letterbox, set flag, auto-advance ──
                this._removeLetterbox();
                game.setFlag('return_to_max_complete', true);
                game.showNotification('Click "Continue" to proceed…');
                const tid = setTimeout(() => game.loadScene('morning_after'), 15000);
                this._timeoutIds.push(tid);
                return;
            }

            const sec = sections[idx];
            idx++;

            // VFX & music per section
            sec.vfx();
            this._playPianoSting(sec.chord, 5);

            // Play dialogue
            game.startDialogue(sec.lines);

            // Poll until done, then wipe → next
            const poll = setInterval(() => {
                if (!game.isDialogueActive) {
                    clearInterval(poll);
                    if (idx < sections.length) {
                        this._sectionWipe(() => {
                            const tid = setTimeout(playNext, 600);
                            this._timeoutIds.push(tid);
                        }, 900);
                    } else {
                        const tid = setTimeout(playNext, 1500);
                        this._timeoutIds.push(tid);
                    }
                }
            }, 250);
            this._intervalIds.push(poll);
        };

        playNext();
    },

    /* ═══════════════════════════════════════════════════════
     *  UTILITY HELPERS
     * ═══════════════════════════════════════════════════════ */
    _sceneEl() {
        const el = document.getElementById('game-scene') || document.getElementById('scene-container');
        if (el) el.style.position = 'relative';
        return el;
    },

    _removeEl(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    },

    _removeAllOverlays() {
        ['rti-night', 'rti-fireglow', 'rti-ltop', 'rti-lbot',
         'rti-headlight', 'rti-titlecard', 'rti-wipe', 'rti-blackout'].forEach(id => this._removeEl(id));
        this._removeInjectedCSS('rti-fire-css');
    },

    _injectCSS(id, css) {
        this._removeInjectedCSS(id);
        const style = document.createElement('style');
        style.id = id;
        style.textContent = css;
        document.head.appendChild(style);
    },

    _removeInjectedCSS(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
};

// Scene will be registered in index.html initGame() function
