/**
 * Scene: The Long Night — Post-Facility Evidence Review & The Reckoning
 * ═══════════════════════════════════════════════════════════
 * After facility infiltration, Ryan returns home to the mancave.
 * Multi-phase cinematic sequence:
 *   Phase 1 — 01:30 AM: Arrival & evidence review (Hoffmann's logs)
 *   Phase 2 — 03:00 AM: Eva's midnight Meshtastic messages
 *   Phase 3 — 06:00 AM: Test failure confirmation (ZERFALL neutralised)
 *   Phase 4 — 06:30 AM: Press package preparation (Der Spiegel, The Guardian, Bellingcat)
 *   Phase 5 — 07:30 AM: The countdown — click SEND
 *   Phase 6 — 08:00 AM: News breaks — "The Reckoning"
 *   Phase 7 — 09:00 AM: BND phone call & AIVD arrives
 *
 * Reuses mancave.svg background.
 * Flags set: long_night_complete, press_sent, news_broken, bnd_called
 * Story Part: 19 → 20
 * ═══════════════════════════════════════════════════════════
 */

const LongNightScene = {
    id: 'long_night',
    name: 'The Long Night',

    background: 'assets/images/scenes/mancave.svg',
    accessibilityPath: [],  // auto-transitions to debrief after story choice

    description: 'Back in the mancave. The extracted data fills screen after screen. Coffee grows cold. The weight of what you\'ve uncovered is staggering.',

    playerStart: { x: 20, y: 85 },
    hotspots: [],

    _timeoutIds: [],
    _intervalIds: [],
    _audioCtx: null,
    _audioNodes: [],

    /* ── Audio: Mancave late-night ambience ── */
    _getAudioCtx() {
        if (!this._audioCtx || this._audioCtx.state === 'closed') {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },

    _startAmbience() {
        try {
            const ctx = this._getAudioCtx();
            const now = ctx.currentTime;

            // Low computer hum
            const hum = ctx.createOscillator();
            hum.type = 'sawtooth';
            hum.frequency.setValueAtTime(50, now);
            const humFilt = ctx.createBiquadFilter();
            humFilt.type = 'lowpass';
            humFilt.frequency.setValueAtTime(80, now);
            const humGain = ctx.createGain();
            humGain.gain.setValueAtTime(0, now);
            humGain.gain.linearRampToValueAtTime(0.02, now + 3);
            hum.connect(humFilt);
            humFilt.connect(humGain);
            humGain.connect(ctx.destination);
            hum.start(now);
            this._audioNodes.push(hum, humFilt, humGain);

            // Keyboard typing bursts (periodic)
            this._intervalIds.push(setInterval(() => {
                if (Math.random() < 0.3) {
                    const t = ctx.currentTime;
                    const count = 3 + Math.floor(Math.random() * 8);
                    for (let i = 0; i < count; i++) {
                        const osc = ctx.createOscillator();
                        osc.type = 'square';
                        osc.frequency.setValueAtTime(800 + Math.random() * 600, t + i * 0.08);
                        const g = ctx.createGain();
                        g.gain.setValueAtTime(0.015, t + i * 0.08);
                        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.03);
                        osc.connect(g);
                        g.connect(ctx.destination);
                        osc.start(t + i * 0.08);
                        osc.stop(t + i * 0.08 + 0.04);
                    }
                }
            }, 4000));

            // Clock ticking (subtle)
            this._intervalIds.push(setInterval(() => {
                const t = ctx.currentTime;
                const tick = ctx.createOscillator();
                tick.type = 'sine';
                tick.frequency.setValueAtTime(2400, t);
                const tg = ctx.createGain();
                tg.gain.setValueAtTime(0.008, t);
                tg.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
                tick.connect(tg);
                tg.connect(ctx.destination);
                tick.start(t);
                tick.stop(t + 0.03);
            }, 1000));

        } catch (e) {
            console.warn('[LongNight] Audio failed:', e);
        }
    },

    _stopAmbience() {
        this._intervalIds.forEach(id => clearInterval(id));
        this._intervalIds = [];
        this._audioNodes.forEach(n => {
            try { if (n.stop) n.stop(); if (n.disconnect) n.disconnect(); } catch(e) {}
        });
        this._audioNodes = [];
        if (this._audioCtx && this._audioCtx.state !== 'closed') {
            this._audioCtx.close().catch(() => {});
            this._audioCtx = null;
        }
    },

    /* ── Scene Entry ── */
    onEnter(game) {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        this._intervalIds.forEach(id => clearInterval(id));
        this._intervalIds = [];

        this._startAmbience();
        game.setStoryPart(19);
        game.setFlag('visited_long_night', true);

        const tid = setTimeout(() => this._playSequence(game), 800);
        this._timeoutIds.push(tid);
    },

    onExit() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        this._stopAmbience();
        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }
    },

    /* ── Decision overlay ── */
    _showDecisionOverlay(game, onChoice) {
        const container = document.getElementById('scene-container') || document.body;

        const wrap = document.createElement('div');
        wrap.id = 'long-night-decision';
        wrap.style.cssText = [
            'position:absolute', 'inset:0',
            'background:rgba(0,0,0,0.82)',
            'display:flex', 'flex-direction:column',
            'align-items:center', 'justify-content:center',
            'z-index:80', 'font-family:\'Courier New\',monospace',
            'padding:40px 32px', 'gap:20px',
        ].join(';');

        const label = document.createElement('div');
        label.style.cssText = 'color:#7ab8e8;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;opacity:0.8;';
        label.textContent = '07:30 AM  —  THREE DRAFTS. CURSOR BLINKING.';

        const question = document.createElement('div');
        question.style.cssText = 'color:#ddeeff;font-size:16px;line-height:1.8;max-width:480px;text-align:center;margin-bottom:12px;';
        question.textContent = 'What do you do with the evidence?';

        const mkBtn = (title, subtitle, handler) => {
            const b = document.createElement('button');
            b.style.cssText = [
                'background:rgba(10,20,50,0.7)',
                'border:1px solid rgba(80,140,255,0.3)',
                'border-radius:6px', 'color:#c8e6ff',
                'font-family:\'Courier New\',monospace', 'font-size:13px',
                'padding:14px 22px', 'cursor:pointer',
                'width:100%', 'max-width:440px',
                'text-align:left', 'line-height:1.6',
                'transition:border-color 0.2s,background 0.2s',
            ].join(';');
            b.onmouseenter = () => { b.style.borderColor = 'rgba(80,180,255,0.7)'; b.style.background = 'rgba(20,40,100,0.8)'; };
            b.onmouseleave = () => { b.style.borderColor = 'rgba(80,140,255,0.3)'; b.style.background = 'rgba(10,20,50,0.7)'; };
            b.innerHTML = `<span style="color:#00ccff;font-weight:bold;">${title}</span><br><span style="font-size:11px;opacity:0.7;">${subtitle}</span>`;
            b.onclick = () => { wrap.remove(); handler(); };
            return b;
        };

        const btnPress = mkBtn(
            'Send to Der Spiegel, The Guardian, and Bellingcat.',
            'Go fully public. No controlling the story after this.',
            () => { game.setFlag('press_sent', true); onChoice('press'); }
        );
        const btnBND = mkBtn(
            'Route everything through Eva to the BND.',
            'Quiet arrests. No public story. You stay anonymous.',
            () => { game.setFlag('bnd_only', true); onChoice('bnd'); }
        );
        const btnUnder = mkBtn(
            'Encrypt and hold. Release when it\'s safe.',
            'Volkov stays free for now. But your family stays safe.',
            () => { game.setFlag('underground_chosen', true); onChoice('underground'); }
        );

        wrap.append(label, question, btnPress, btnBND, btnUnder);
        container.appendChild(wrap);
    },

    /* ── Main Sequence ── */
    _playSequence(game) {
        const sections_common = [

            // ── Arrival breath: the house is still ──
            [
                { speaker: 'Narrator', text: '01:28 AM — Gravel driveway. Farmhouse dark. A dog noses at the glass.' },
                { speaker: 'Narrator', text: '*Ryan stands at the back door for a moment. Just standing. Coat still wet from the drizzle.*' },
                { speaker: 'Narrator', text: 'Inside: the espresso machine. The familiar desk. Max asleep upstairs. Normal. Everything looks completely normal.' },
                { speaker: 'Ryan', text: 'Fourteen hours ago I was debugging antenna firmware in this kitchen.' },
                { speaker: 'Ryan', text: '*pats the dog, takes a breath* OK. Let\'s see what we pulled.' },
            ],

            // ── Phase 1: Evidence Review (01:30) ──
            [
                { speaker: 'Narrator', text: '01:30 AM — Mancave, Compascuum' },
                { speaker: 'Narrator', text: '*Ryan stumbles through the door. Hands shaking. Coat still wet from the drizzle.*' },
                { speaker: 'Ryan', text: 'I can\'t believe that worked. I can\'t believe I\'m alive.' },
                { speaker: 'Narrator', text: '*Drops bag. Plugs external drive into air-gapped laptop.*' },
                { speaker: 'Ryan', text: 'Focus. Focus. What did we pull from that server?' },
                { speaker: 'Narrator', text: '*Files begin loading. Folders upon folders.*' }
            ],

            // ── Hoffmann's logs — the smoking gun ──
            [
                { speaker: 'Narrator', text: '*01:47 AM*' },
                { speaker: 'Ryan', text: 'Wait. This folder — HOFFMANN_PRIVATE. Director Hoffmann\'s personal logs.' },
                { speaker: 'Narrator', text: '*Opens encrypted log. The password from the server works here too.*' },
                { speaker: 'Ryan', text: '"January 2024: Volkov requests additional calibration funding. Approved without oversight."' },
                { speaker: 'Ryan', text: '"March 2024: Test Event Gamma — 3 casualties. Classified as equipment malfunction."' },
                { speaker: 'Ryan', text: '"May 2024: Weber (Sr.) raising questions. Handle through HR. Recommend medical leave."' },
                { speaker: 'Ryan', text: 'He KNEW. Hoffmann knew Klaus Weber was onto them.' },
                { speaker: 'Ryan', text: '"June 2024: Weber situation resolved. Natural causes. No further action."' },
                { speaker: 'Ryan', text: '*Stares at screen*' },
                { speaker: 'Ryan', text: '"Natural causes." They murdered Eva\'s father and wrote it in a log like a parking ticket.' }
            ],

            // ── More evidence ──
            [
                { speaker: 'Narrator', text: '*02:15 AM — Coffee #1.*' },
                { speaker: 'Ryan', text: 'Target coordinates. Hamburg — Eppendorf hospital district. Amsterdam — server cluster near Schiphol. Berlin — railway switching grid.' },
                { speaker: 'Ryan', text: 'This isn\'t a test. This is a deployment plan.' },
                { speaker: 'Ryan', text: 'And the calibration data I corrupted? It was supposed to be the final validation before Phase 3.' },
                { speaker: 'Ryan', text: '*Leans back* We didn\'t just collect evidence. We stopped the attack.' },
                { speaker: 'Ryan', text: 'At least... for now.' }
            ],

            // ── Phase 2: Eva\'s Messages (03:00) ──
            [
                { speaker: 'Narrator', text: '03:00 AM — *Meshtastic device chirps*' },
                { speaker: 'Narrator', text: '*Message from EVA_W*' },
                { speaker: 'Eva (Meshtastic)', text: 'Ryan. You made it. I saw the server access logs. The data extraction triggered alarms after you left.' },
                { speaker: 'Eva (Meshtastic)', text: 'Volkov is furious. Hoffmann is making phone calls. They don\'t know it was us yet, but they\'re suspicious.' },
                { speaker: 'Ryan (Meshtastic)', text: 'I have everything. Hoffmann\'s logs. Target coordinates. The full ZERFALL operational plan.' },
                { speaker: 'Eva (Meshtastic)', text: 'Then we need to act fast. Once they discover the data is compromised, they\'ll start destroying evidence.' },
                { speaker: 'Ryan (Meshtastic)', text: 'Working on it. I\'ll have something ready by morning.' },
                { speaker: 'Eva (Meshtastic)', text: 'Be careful. And Ryan — thank you. For my father.' },
                { speaker: 'Narrator', text: '*Connection drops. The mesh network falls silent.*' }
            ],

            // ── Phase 3: Test Failure Confirmation (06:00) ──
            [
                { speaker: 'Narrator', text: '06:00 AM — *Dawn light creeps through the mancave windows*' },
                { speaker: 'Narrator', text: '*Coffee #4. Ryan\'s eyes are red, but his hands are steady now.*' },
                { speaker: 'Ryan', text: 'The calibration data. If I corrupted it correctly, their 06:00 systems check should...' },
                { speaker: 'Narrator', text: '*Meshtastic chirps*' },
                { speaker: 'Eva (Meshtastic)', text: 'ZERFALL test sequence FAILED. Calibration mismatch. System offline.' },
                { speaker: 'Eva (Meshtastic)', text: 'Volkov is screaming at engineers. Hoffmann just arrived. They\'re trying to restore from backup but it\'ll take days.' },
                { speaker: 'Ryan', text: 'Days we can use. The weapon is offline. Now we decide what to do next.' }
            ],

            // ── Phase 4: Press Package Prep (06:30) ──
            [
                { speaker: 'Narrator', text: '06:30 AM — Press Package Preparation' },
                { speaker: 'Ryan', text: 'Three packages. Three journalists I trust with my life.' },
                { speaker: 'Narrator', text: '*Types furiously. Encrypts. Double-checks.*' },
                { speaker: 'Ryan', text: 'Der Spiegel — they broke the NSA story. They\'ll understand the technical details.' },
                { speaker: 'Ryan', text: 'The Guardian — international reach. Makes it impossible to suppress.' },
                { speaker: 'Ryan', text: 'Bellingcat — open-source investigation. They\'ll verify independently.' },
                { speaker: 'Ryan', text: 'Each package contains: Hoffmann\'s logs. Target coordinates. Volkov\'s FSB communications. The casualty reports.' },
                { speaker: 'Ryan', text: 'And my own account. Timestamped. Hash-verified. Undeniable.' }
            ],

            // ── Phase 5a: The Countdown setup (07:30) — decision follows ──
            [
                { speaker: 'Narrator', text: '07:30 AM — The mancave is quiet. Coffee #5 sits untouched.' },
                { speaker: 'Ryan', text: '*Stares at three email drafts. Cursor blinking.*' },
                { speaker: 'Ryan', text: 'There\'s no going back after this.' },
                { speaker: 'Ryan', text: 'Once I hit send, I become a whistleblower. A target.' },
                { speaker: 'Ryan', text: 'The Russian FSB will know my name. German security services. Maybe my own government.' },
                { speaker: 'Ryan', text: '*Looks at the photo of Max and the dogs on his desk*' },
                { speaker: 'Ryan', text: 'Max is still asleep upstairs. She doesn\'t know what I did last night.' },
                { speaker: 'Ryan', text: 'She doesn\'t know what I\'m about to do.' },
                { speaker: 'Ryan', text: '*Deep breath*' },
                { speaker: 'Ryan', text: 'For Klaus Weber. For Marlies Bakker. For the 1.2 million people in Hamburg, Amsterdam, and Berlin who will never know how close they came.' },
            ],
        ];

        const sections_press_end = [
            // ── 5b-A: Press send ──
            [
                { speaker: 'Narrator', text: '*Click.*' },
                { speaker: 'Narrator', text: '📨 SENT — Der Spiegel' },
                { speaker: 'Narrator', text: '📨 SENT — The Guardian' },
                { speaker: 'Narrator', text: '📨 SENT — Bellingcat' },
                { speaker: 'Ryan', text: 'It\'s done.' }
            ],
            // ── Phase 6: The Reckoning — News Breaks (08:00) ──
            [
                { speaker: 'Narrator', text: '════════════════════════════════════════' },
                { speaker: 'Narrator', text: '08:00 AM — THE RECKONING' },
                { speaker: 'Narrator', text: '════════════════════════════════════════' },
                { speaker: 'Narrator', text: '*Ryan\'s phone begins to vibrate. Then ring. Then vibrate again.*' },
                { speaker: 'Narrator', text: '*Laptop notifications cascade*' },
                { speaker: 'Narrator', text: '🔴 DER SPIEGEL: "ZERFALL — Russische Spione unterwandern deutsches Militärforschungszentrum"' },
                { speaker: 'Narrator', text: '🔴 THE GUARDIAN: "Russian agents infiltrated German weapons lab, leaked documents reveal"' },
                { speaker: 'Narrator', text: '🔴 BELLINGCAT: "Operation ZERFALL: How a Dutch hacker exposed an FSB operation inside NATO"' },
                { speaker: 'Ryan', text: '*Watches the headlines scroll. Hands trembling.*' },
                { speaker: 'Ryan', text: 'It\'s out. It can\'t be stopped now.' },
                { speaker: 'Narrator', text: '*More notifications*' },
                { speaker: 'Narrator', text: '📺 NOS JOURNAAL: "Nederlander ontmaskert Russische spionageoperatie in Duitsland"' },
                { speaker: 'Narrator', text: '📺 ARD TAGESSCHAU: "Spionageskandal an Bundeswehr-Forschungseinrichtung"' },
                { speaker: 'Narrator', text: '📺 BBC: "NATO facility compromised by Russian intelligence operation"' }
            ],
            // ── Phase 7: BND + AIVD (09:00) ──
            [
                { speaker: 'Narrator', text: '09:00 AM — *The secure phone rings.*' },
                { speaker: 'Ryan', text: '*Unknown number. German prefix. BND?*' },
                { speaker: 'Narrator', text: '*Ryan answers.*' },
                { speaker: 'BND Officer', text: 'Herr Weylant. Bundesnachrichtendienst. We need to talk.' },
                { speaker: 'Ryan', text: 'I imagine you do.' },
                { speaker: 'BND Officer', text: 'We\'ve just arrested Director Hoffmann. Dimitri Volkov is in custody.' },
                { speaker: 'BND Officer', text: 'Your evidence package was... thorough. Extremely thorough.' },
                { speaker: 'Ryan', text: 'That was the point.' },
                { speaker: 'BND Officer', text: 'We\'ll need you to come in. For your own protection as much as ours.' },
                { speaker: 'Ryan', text: 'I\'ll cooperate. But on my terms.' },
                { speaker: 'BND Officer', text: 'We\'ll be in touch. Don\'t leave the country.' }
            ],
            // ── AIVD Arrives ──
            [
                { speaker: 'Narrator', text: '09:30 AM — *A black car pulls into the driveway*' },
                { speaker: 'Narrator', text: '*Two people in suits walk to the door. Dutch plates.*' },
                { speaker: 'Max', text: '*From upstairs* Ryan? There are people at the door.' },
                { speaker: 'Ryan', text: 'I know. I\'ll handle it.' },
                { speaker: 'Narrator', text: '*Opens the door*' },
                { speaker: 'AIVD Agent', text: 'Meneer Weylant? Binnenlandse Veiligheidsdienst.' },
                { speaker: 'AIVD Agent', text: 'We\'d like you to come with us to Zoetermeer. Voluntarily, of course.' },
                { speaker: 'Ryan', text: '*Looks back at Max on the stairs. At the dogs. At his life.*' },
                { speaker: 'Ryan', text: 'Give me five minutes.' },
                { speaker: 'Narrator', text: '*Ryan grabs his coat. Kisses Max. Pats the dogs.*' },
                { speaker: 'Max', text: 'Ryan... what did you do?' },
                { speaker: 'Ryan', text: 'The right thing. I hope.' },
                { speaker: 'Narrator', text: '*The black car drives south toward Den Haag. Ryan watches Drenthe disappear in the mirror.*' }
            ],
            // ── Transition ──
            [
                { speaker: 'Narrator', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
                { speaker: 'Narrator', text: 'THE LONG NIGHT IS OVER' },
                { speaker: 'Narrator', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' }
            ]
        ];

        const sections_bnd_end = [
            // ── 5b-B: Quiet handoff to Eva ──
            [
                { speaker: 'Ryan', text: '*Opens Meshtastic. Types carefully.*' },
                { speaker: 'Ryan (Meshtastic)', text: 'Eva. The package is ready. All three packages — Hoffmann, Volkov, coordinates, casualty data. Routing to you only. Your call what happens next.' },
                { speaker: 'Eva (Meshtastic)', text: 'Received. I\'m taking this to BND Director Maier personally. He\'s clean — I\'ve verified him.' },
                { speaker: 'Eva (Meshtastic)', text: 'No public leak. Volkov and Hoffmann will be in custody before noon. Quietly.' },
                { speaker: 'Ryan (Meshtastic)', text: 'And ZERFALL? The whole operation?' },
                { speaker: 'Eva (Meshtastic)', text: 'Dismantled. Classified. The public may never know.' },
                { speaker: 'Ryan', text: '*Sits back. Closes the laptop.*' },
                { speaker: 'Ryan', text: 'Maybe that\'s enough. Maybe this one happens in the dark.' }
            ],
            // ── Phase 6-B: Quiet arrests ──
            [
                { speaker: 'Narrator', text: '09:15 AM — *A single Meshtastic message.* No headlines.' },
                { speaker: 'Eva (Meshtastic)', text: 'Done. Hoffmann in custody. Volkov detained at the facility. BND handling it as an internal security matter.' },
                { speaker: 'Eva (Meshtastic)', text: 'Your name doesn\'t appear anywhere. Ryan Weylant never existed in this story.' },
                { speaker: 'Ryan', text: '*Stares at the screen*' },
                { speaker: 'Ryan', text: 'Fourteen people are alive today because of something that will never be reported.' },
                { speaker: 'Ryan', text: '*Long pause* ...I think I can live with that.' }
            ],
            // ── AIVD Arrives (same) ──
            [
                { speaker: 'Narrator', text: '10:00 AM — *A black car pulls into the driveway*' },
                { speaker: 'Narrator', text: '*Two people in suits walk to the door. Dutch plates.*' },
                { speaker: 'Max', text: '*From upstairs* Ryan? There are people at the door.' },
                { speaker: 'Ryan', text: 'I know. I\'ll handle it.' },
                { speaker: 'Narrator', text: '*Opens the door*' },
                { speaker: 'AIVD Agent', text: 'Meneer Weylant? We\'d like to ask you a few questions. About some activity near the German border last night.' },
                { speaker: 'Ryan', text: 'Of course. Come in. Coffee?' },
                { speaker: 'Narrator', text: '*The AIVD agent looks surprised. Ryan smiles. He was ready for this.*' }
            ],
            // ── Transition ──
            [
                { speaker: 'Narrator', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
                { speaker: 'Narrator', text: 'THE LONG NIGHT IS OVER' },
                { speaker: 'Narrator', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' }
            ]
        ];

        const sections_underground_end = [
            // ── 5b-C: Hold the evidence ──
            [
                { speaker: 'Ryan', text: '*Opens terminal. Creates an encrypted dead-drop.*' },
                { speaker: 'Ryan', text: 'Three mirrors. Two journalists who don\'t know I exist yet. Time-locked release: 90 days.' },
                { speaker: 'Ryan', text: 'If I disappear — it goes public automatically. If I\'m fine — I release it when I\'m certain Max is safe.' },
                { speaker: 'Ryan (Meshtastic)', text: 'Eva. Stalling. Need 48 hours. Volkov must not know we have the full picture yet.' },
                { speaker: 'Eva (Meshtastic)', text: 'Understood. I can give you 36. After that, BND moves with or without us.' },
                { speaker: 'Ryan', text: '*Closes the lid. For now, the world stays the same.*' },
                { speaker: 'Ryan', text: 'Volkov is still free. But so is the evidence. And it\'s pointing at him like a loaded weapon.' }
            ],
            // ── Phase 6-C: The wait ──
            [
                { speaker: 'Narrator', text: '08:00 AM — *No headlines. No phone calls. Just birds.*' },
                { speaker: 'Ryan', text: 'This is either the smartest or the stupidest thing I\'ve ever done.' },
                { speaker: 'Ryan', text: 'Volkov has 36 hours to think he got away with it.' },
                { speaker: 'Ryan', text: 'Then Eva moves. And when she does, I release everything.' },
                { speaker: 'Ryan', text: 'The silence is temporary. The evidence is permanent.' },
                { speaker: 'Narrator', text: '[ Three weeks later, the BND made its arrests. ]' },
                { speaker: 'Narrator', text: '[ Four weeks after that, Ryan Weylant sent his first package to Der Spiegel. ]' }
            ],
            // ── Brief outro (no AIVD visit yet — they don't know yet) ──
            [
                { speaker: 'Narrator', text: '*Ryan sits in the mancave. The dogs have fallen asleep under the desk.*' },
                { speaker: 'Narrator', text: 'Max comes downstairs just before ten. She makes two coffees without being asked.' },
                { speaker: 'Max', text: '*sets a mug down quietly* You should sleep.' },
                { speaker: 'Ryan', text: 'I know. I will.' },
                { speaker: 'Max', text: 'Whatever it is — you did what you had to do. Right?' },
                { speaker: 'Ryan', text: '...Yeah. I think so.' }
            ],
            // ── Transition ──
            [
                { speaker: 'Narrator', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
                { speaker: 'Narrator', text: 'THE LONG NIGHT IS OVER' },
                { speaker: 'Narrator', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' }
            ]
        ];

        // Helper: play a linear array of sections in sequence
        const playLinear = (sections, onDone) => {
            let idx = 0;
            const next = () => {
                if (idx >= sections.length) { onDone(); return; }
                const section = sections[idx++];
                game.startDialogue(section);
                const poll = setInterval(() => {
                    if (!game.isDialogueActive) {
                        clearInterval(poll);
                        const tid = setTimeout(next, 1200);
                        this._timeoutIds.push(tid);
                    }
                }, 250);
                this._timeoutIds.push(poll);
            };
            next();
        };

        const finalise = (flag_map) => {
            game.setFlag('long_night_complete', true);
            if (flag_map.press)       { game.setFlag('press_sent', true); game.setFlag('news_broken', true); game.setFlag('bnd_called', true); }
            if (flag_map.bnd)         { game.setFlag('bnd_only', true); }
            if (flag_map.underground) { game.setFlag('underground_chosen', true); }
            game.setStoryPart(20);
            const tid = setTimeout(() => { game.loadScene('debrief'); }, 5000);
            this._timeoutIds.push(tid);
        };

        // Play the common opening, then show the decision, then branch
        playLinear(sections_common, () => {
            this._showDecisionOverlay(game, (choice) => {
                if (choice === 'press') {
                    playLinear(sections_press_end, () => finalise({ press: true }));
                } else if (choice === 'bnd') {
                    playLinear(sections_bnd_end, () => finalise({ bnd: true }));
                } else {
                    playLinear(sections_underground_end, () => finalise({ underground: true }));
                }
            });
        });
    }
};

// Register
if (typeof window.game !== 'undefined') {
    window.game.registerScene(LongNightScene);
} else if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(LongNightScene);
}
