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

    /* ── Main Sequence ── */
    _playSequence(game) {
        const sections = [
            // ── Phase 1: Arrival & Evidence Review (01:30) ──
            [
                { speaker: '', text: '01:30 AM — Mancave, Compascuum' },
                { speaker: '', text: '*Ryan stumbles through the door. Hands shaking. Coat still wet from the drizzle.*' },
                { speaker: 'Ryan', text: 'I can\'t believe that worked. I can\'t believe I\'m alive.' },
                { speaker: '', text: '*Drops bag. Plugs external drive into air-gapped laptop.*' },
                { speaker: 'Ryan', text: 'Focus. Focus. What did we pull from that server?' },
                { speaker: '', text: '*Files begin loading. Folders upon folders.*' }
            ],

            // ── Hoffmann's logs — the smoking gun ──
            [
                { speaker: '', text: '*01:47 AM*' },
                { speaker: 'Ryan', text: 'Wait. This folder — HOFFMANN_PRIVATE. Director Hoffmann\'s personal logs.' },
                { speaker: '', text: '*Opens encrypted log. The password from the server works here too.*' },
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
                { speaker: '', text: '*02:15 AM — Coffee #1.*' },
                { speaker: 'Ryan', text: 'Target coordinates. Hamburg — Eppendorf hospital district. Amsterdam — server cluster near Schiphol. Berlin — railway switching grid.' },
                { speaker: 'Ryan', text: 'This isn\'t a test. This is a deployment plan.' },
                { speaker: 'Ryan', text: 'And the calibration data I corrupted? It was supposed to be the final validation before Phase 3.' },
                { speaker: 'Ryan', text: '*Leans back* We didn\'t just collect evidence. We stopped the attack.' },
                { speaker: 'Ryan', text: 'At least... for now.' }
            ],

            // ── Phase 2: Eva's Messages (03:00) ──
            [
                { speaker: '', text: '03:00 AM — *Meshtastic device chirps*' },
                { speaker: '', text: '*Message from EVA_W*' },
                { speaker: 'Eva (Meshtastic)', text: 'Ryan. You made it. I saw the server access logs. The data extraction triggered alarms after you left.' },
                { speaker: 'Eva (Meshtastic)', text: 'Volkov is furious. Hoffmann is making phone calls. They don\'t know it was us yet, but they\'re suspicious.' },
                { speaker: 'Ryan (Meshtastic)', text: 'I have everything. Hoffmann\'s logs. Target coordinates. The full ZERFALL operational plan.' },
                { speaker: 'Eva (Meshtastic)', text: 'Then we need to act fast. Once they discover the data is compromised, they\'ll start destroying evidence.' },
                { speaker: 'Ryan (Meshtastic)', text: 'Working on it. I\'ll have something ready by morning.' },
                { speaker: 'Eva (Meshtastic)', text: 'Be careful. And Ryan — thank you. For my father.' },
                { speaker: '', text: '*Connection drops. The mesh network falls silent.*' }
            ],

            // ── Phase 3: Test Failure Confirmation (06:00) ──
            [
                { speaker: '', text: '06:00 AM — *Dawn light creeps through the mancave windows*' },
                { speaker: '', text: '*Coffee #4. Ryan\'s eyes are red, but his hands are steady now.*' },
                { speaker: 'Ryan', text: 'The calibration data. If I corrupted it correctly, their 06:00 systems check should...' },
                { speaker: '', text: '*Meshtastic chirps*' },
                { speaker: 'Eva (Meshtastic)', text: 'ZERFALL test sequence FAILED. Calibration mismatch. System offline.' },
                { speaker: 'Eva (Meshtastic)', text: 'Volkov is screaming at engineers. Hoffmann just arrived. They\'re trying to restore from backup but it\'ll take days.' },
                { speaker: 'Ryan', text: 'Days we can use. The weapon is offline. Now we go public.' }
            ],

            // ── Phase 4: Press Package (06:30) ──
            [
                { speaker: '', text: '06:30 AM — Press Package Preparation' },
                { speaker: 'Ryan', text: 'Three packages. Three journalists I trust with my life.' },
                { speaker: '', text: '*Types furiously. Encrypts. Double-checks.*' },
                { speaker: 'Ryan', text: 'Der Spiegel — they broke the NSA story. They\'ll understand the technical details.' },
                { speaker: 'Ryan', text: 'The Guardian — international reach. Makes it impossible to suppress.' },
                { speaker: 'Ryan', text: 'Bellingcat — open-source investigation. They\'ll verify independently.' },
                { speaker: 'Ryan', text: 'Each package contains: Hoffmann\'s logs. Target coordinates. Volkov\'s FSB communications. The casualty reports.' },
                { speaker: 'Ryan', text: 'And my own account. Timestamped. Hash-verified. Undeniable.' }
            ],

            // ── Phase 5: The Countdown (07:30) ──
            [
                { speaker: '', text: '07:30 AM — The mancave is quiet. Coffee #5 sits untouched.' },
                { speaker: 'Ryan', text: '*Stares at three email drafts. Cursor blinking.*' },
                { speaker: 'Ryan', text: 'There\'s no going back after this.' },
                { speaker: 'Ryan', text: 'Once I hit send, I become a whistleblower. A target.' },
                { speaker: 'Ryan', text: 'The Russian FSB will know my name. German security services. Maybe my own government.' },
                { speaker: 'Ryan', text: '*Looks at the photo of Ies and the dogs on his desk*' },
                { speaker: 'Ryan', text: 'Ies is still asleep upstairs. She doesn\'t know what I did last night.' },
                { speaker: 'Ryan', text: 'She doesn\'t know what I\'m about to do.' },
                { speaker: 'Ryan', text: '*Deep breath*' },
                { speaker: 'Ryan', text: 'For Klaus Weber. For Marlies Bakker. For the 1.2 million people in Hamburg, Amsterdam, and Berlin who will never know how close they came.' },
                { speaker: '', text: '*Click.*' },
                { speaker: '', text: '📨 SENT — Der Spiegel' },
                { speaker: '', text: '📨 SENT — The Guardian' },
                { speaker: '', text: '📨 SENT — Bellingcat' },
                { speaker: 'Ryan', text: 'It\'s done.' }
            ],

            // ── Phase 6: The Reckoning — News Breaks (08:00) ──
            [
                { speaker: '', text: '════════════════════════════════════════' },
                { speaker: '', text: '08:00 AM — THE RECKONING' },
                { speaker: '', text: '════════════════════════════════════════' },
                { speaker: '', text: '*Ryan\'s phone begins to vibrate. Then ring. Then vibrate again.*' },
                { speaker: '', text: '*Laptop notifications cascade*' },
                { speaker: '', text: '🔴 DER SPIEGEL: "ZERFALL — Russische Spione unterwandern deutsches Militärforschungszentrum"' },
                { speaker: '', text: '🔴 THE GUARDIAN: "Russian agents infiltrated German weapons lab, leaked documents reveal"' },
                { speaker: '', text: '🔴 BELLINGCAT: "Operation ZERFALL: How a Dutch hacker exposed an FSB operation inside NATO"' },
                { speaker: 'Ryan', text: '*Watches the headlines scroll. Hands trembling.*' },
                { speaker: 'Ryan', text: 'It\'s out. It can\'t be stopped now.' },
                { speaker: '', text: '*More notifications*' },
                { speaker: '', text: '📺 NOS JOURNAAL: "Nederlander ontmaskert Russische spionageoperatie in Duitsland"' },
                { speaker: '', text: '📺 ARD TAGESSCHAU: "Spionageskandal an Bundeswehr-Forschungseinrichtung"' },
                { speaker: '', text: '📺 BBC: "NATO facility compromised by Russian intelligence operation"' }
            ],

            // ── Phase 7: BND + AIVD (09:00) ──
            [
                { speaker: '', text: '09:00 AM — *The secure phone rings.*' },
                { speaker: 'Ryan', text: '*Unknown number. German prefix. BND?*' },
                { speaker: '', text: '*Ryan answers.*' },
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
                { speaker: '', text: '09:30 AM — *A black car pulls into the driveway*' },
                { speaker: '', text: '*Two people in suits walk to the door. Dutch plates.*' },
                { speaker: 'Ies', text: '*From upstairs* Ryan? There are people at the door.' },
                { speaker: 'Ryan', text: 'I know. I\'ll handle it.' },
                { speaker: '', text: '*Opens the door*' },
                { speaker: 'AIVD Agent', text: 'Meneer Weylant? Binnenlandse Veiligheidsdienst.' },
                { speaker: 'AIVD Agent', text: 'We\'d like you to come with us to Zoetermeer. Voluntarily, of course.' },
                { speaker: 'Ryan', text: '*Looks back at Ies on the stairs. At the dogs. At his life.*' },
                { speaker: 'Ryan', text: 'Give me five minutes.' },
                { speaker: '', text: '*Ryan grabs his coat. Kisses Ies. Pats the dogs.*' },
                { speaker: 'Ies', text: 'Ryan... what did you do?' },
                { speaker: 'Ryan', text: 'The right thing. I hope.' },
                { speaker: '', text: '*The black car drives south toward Den Haag. Ryan watches Drenthe disappear in the mirror.*' }
            ],

            // ── Transition ──
            [
                { speaker: '', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
                { speaker: '', text: 'THE LONG NIGHT IS OVER' },
                { speaker: '', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' }
            ]
        ];

        let sectionIndex = 0;

        const playNext = () => {
            if (sectionIndex >= sections.length) {
                game.setFlag('long_night_complete', true);
                game.setFlag('press_sent', true);
                game.setFlag('news_broken', true);
                game.setFlag('bnd_called', true);
                game.setStoryPart(20);

                const tid = setTimeout(() => {
                    game.loadScene('debrief');
                }, 5000);
                this._timeoutIds.push(tid);
                return;
            }

            const section = sections[sectionIndex];
            sectionIndex++;
            game.startDialogue(section);

            const poll = setInterval(() => {
                if (!game.isDialogueActive) {
                    clearInterval(poll);
                    const tid = setTimeout(playNext, 1200);
                    this._timeoutIds.push(tid);
                }
            }, 250);
            this._timeoutIds.push(poll);
        };

        playNext();
    }
};

// Register
if (typeof window.game !== 'undefined') {
    window.game.registerScene(LongNightScene);
} else if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(LongNightScene);
}
