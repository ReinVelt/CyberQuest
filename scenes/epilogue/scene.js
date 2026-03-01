/**
 * Epilogue Scene - Three Months Later
 * Final wrap-up showing outcomes and new beginnings.
 * Plays a multi-part narrated sequence, then transitions to credits.
 */

const EpilogueScene = {
    id: 'epilogue',
    name: 'Three Months Later',

    background: 'assets/images/scenes/epilogue.svg',

    description: 'Spring has arrived in Compascuum. The world has changed. So has Ryan.',

    playerStart: { x: 50, y: 85 },

    idleThoughts: [
        "Strange how quiet life feels after everything.",
        "The birds are louder now. Or maybe I just notice them.",
        "Spring in Drenthe. Best time of year.",
        "The espresso machine is still my most reliable ally.",
        "Van der Berg's card is still on the fridge.",
        "Three months. Feels like three years.",
        "The antenna still picks up strange signals. Always will.",
        "Sometimes I wonder what Cees is hearing on the WSRT.",
        "Eva's out there somewhere. Doing what she does.",
        "This farmhouse has seen some things."
    ],

    // 🎬 Movie Mode
    accessibilityPath: ['continue-to-credits'],

    hotspots: [
        {
            id: 'continue-to-credits',
            name: 'Continue →',
            x: 40,
            y: 80,
            width: 20,
            height: 12,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                if (game.getFlag('epilogue_complete')) {
                    game.loadScene('credits');
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Not yet. Still taking it all in.' }
                    ]);
                }
            }
        }
    ],

    // Track timeouts for cleanup
    _timeoutIds: [],

    // ── Ambient Audio ───────────────────────────────────────────
    _audioCtx: null, _audioNodes: [], _audioIntervals: [],
    _getAudioCtx: function() {
        if (!this._audioCtx) {
            try { this._audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch(e) { return null; }
        }
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },
    _stopAmbientAudio: function() {
        this._audioIntervals.forEach(function(id) { clearInterval(id); });
        this._audioIntervals = [];
        this._audioNodes.forEach(function(n) { try { if (n.stop) n.stop(); n.disconnect(); } catch(e) {} });
        this._audioNodes = [];
        if (this._audioCtx) { try { this._audioCtx.close(); } catch(e) {} this._audioCtx = null; }
    },
    _startAmbientAudio: function() {
        var self = this, ctx = this._getAudioCtx();
        if (!ctx) return;
        try {
            var master = ctx.createGain();
            master.gain.setValueAtTime(0, ctx.currentTime);
            master.gain.linearRampToValueAtTime(1, ctx.currentTime + 4);
            master.connect(ctx.destination);
            self._audioNodes.push(master);
            // ── gentle outdoor breeze ──
            var buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var wind = ctx.createBufferSource(); wind.buffer = buf; wind.loop = true;
            var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
            var wG = ctx.createGain(); wG.gain.value = 0.022;
            wind.connect(lp).connect(wG).connect(master); wind.start();
            self._audioNodes.push(wind, lp, wG);
            // ── resolution birdsong ──
            [2800, 4200].forEach(function(baseF, idx) {
                var bi = setInterval(function() {
                    if (!self._audioCtx) return;
                    var t = ctx.currentTime;
                    var osc = ctx.createOscillator(); osc.type = 'sine';
                    osc.frequency.setValueAtTime(baseF, t);
                    osc.frequency.linearRampToValueAtTime(baseF + 400, t + 0.1);
                    var env = ctx.createGain();
                    env.gain.setValueAtTime(0, t);
                    env.gain.linearRampToValueAtTime(0.025, t + 0.02);
                    env.gain.linearRampToValueAtTime(0, t + 0.18);
                    osc.connect(env).connect(master); osc.start(t); osc.stop(t + 0.2);
                    self._audioNodes.push(osc, env);
                }, 3000 + idx * 1700 + Math.random() * 4000);
                self._audioIntervals.push(bi);
            });
        } catch(e) {}
    },

    onEnter: function(game) {
        EpilogueScene._startAmbientAudio();
        // Clear stale timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        game.setFlag('visited_epilogue', true);

        // Play multi-part epilogue with pacing between sections
        this._playEpilogue(game);
    },

    onExit: function() {
        EpilogueScene._stopAmbientAudio();
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }
    },

    /**
     * Multi-part epilogue with natural pauses between sections.
     * Each section is a separate dialogue call so the player clicks
     * through at their own pace.
     */
    _playEpilogue: function(game) {
        const sections = [
            // ── Title card ──
            [
                { speaker: '', text: '— THREE MONTHS LATER — May 2026 —' },
                { speaker: '', text: 'Spring light fills the farmhouse windows. The heath is in bloom.' }
            ],

            // ── The facility ──
            [
                { speaker: 'Narrator', text: 'The Steckerdoser Heide facility has been shut down pending a full security review.' },
                { speaker: 'Narrator', text: 'Seven German officials arrested in connection with Operation ZERFALL.' },
                { speaker: 'Narrator', text: 'The Bundestag passed new vetting requirements within weeks.' }
            ],

            // ── Volkov ──
            [
                { speaker: 'Narrator', text: 'Dimitri Volkov awaits trial in a maximum-security prison outside Munich.' },
                { speaker: 'Narrator', text: 'He\'s negotiating with American intelligence for a lighter sentence.' },
                { speaker: 'Narrator', text: 'Offering information about other SPEKTR-derived programs — a dark legacy.' }
            ],

            // ── Hoffmann ──
            [
                { speaker: 'Narrator', text: 'Director Hoffmann made a full confession in exchange for witness protection.' },
                { speaker: 'Narrator', text: 'He\'s somewhere in Canada now, living under a new name.' },
                { speaker: 'Narrator', text: 'Looking over his shoulder for the rest of his life.' }
            ],

            // ── Chris Kubecka ──
            [
                { speaker: 'Narrator', text: 'Chris Kubecka published a comprehensive report on Operation ZERFALL.' },
                { speaker: 'Narrator', text: 'Tracing Russian influence operations across seven European countries.' },
                { speaker: 'Narrator', text: 'Now required reading at NATO intelligence agencies.' }
            ],

            // ── Cees Bassa ──
            [
                { speaker: 'Narrator', text: 'Cees Bassa went back to his work at ASTRON.' },
                { speaker: 'Narrator', text: 'But he keeps his radio receivers tuned to interesting frequencies.' },
                { speaker: 'Narrator', text: 'Just in case.' }
            ],

            // ── David Prinsloo ──
            [
                { speaker: 'Narrator', text: 'David Prinsloo returned to his antenna research at TU Eindhoven.' },
                { speaker: 'Narrator', text: 'But Operation ZERFALL gave him a new perspective on RF security.' },
                { speaker: 'Narrator', text: 'He now advises Dutch defence on electromagnetic vulnerabilities. Between lectures.' }
            ],

            // ── Jaap Haartsen ──
            [
                { speaker: 'Narrator', text: 'Jaap Haartsen returned to his work at Dopple, his consumer electronics company in Assen.' },
                { speaker: 'Narrator', text: 'The National Inventors Hall of Fame inductee took on a new client: a German defence contractor.' },
                { speaker: 'Narrator', text: 'The father of Bluetooth, improving their wireless vetting procedures. The irony isn\'t lost on him.' }
            ],

            // ── Eva Weber ──
            [
                { speaker: 'Narrator', text: 'Eva Weber testified before a closed session of the German parliament.' },
                { speaker: 'Narrator', text: 'Her identity remains classified.' },
                { speaker: 'Narrator', text: 'Rumours say she\'s working for a European cybersecurity agency now.' },
                { speaker: 'Narrator', text: 'No one can confirm it. That\'s how she prefers it.' }
            ],

            // ── Ryan ──
            [
                { speaker: 'Narrator', text: 'And Ryan Weylant?' },
                { speaker: 'Narrator', text: 'He took the meeting with Agent Van der Berg.' },
                { speaker: 'Narrator', text: 'Then politely declined the job offer.' },
                { speaker: 'Narrator', text: 'Ryan Weylant doesn\'t do offices. Doesn\'t do chains of command.' },
                { speaker: 'Narrator', text: 'But he left his number. "If the shit really hits the fan… call me."' },
                { speaker: 'Narrator', text: 'Van der Berg smiled. She\'d expected nothing less.' },
                { speaker: 'Narrator', text: 'These days, when strange signals appear on his SSTV terminal…' },
                { speaker: 'Narrator', text: '…he still investigates. On his own terms.' },
                { speaker: 'Narrator', text: 'Freelance. Independent. Dangerous when needed.' },
                { speaker: 'Narrator', text: 'Some people can\'t be tamed. Just aimed.' }
            ],

            // ── Closing ──
            [
                { speaker: '', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
                { speaker: '', text: 'CYBERQUEST: OPERATION ZERFALL' },
                { speaker: '', text: 'Sometimes, one person with the right skills,' },
                { speaker: '', text: 'the courage to act, and a strong espresso…' },
                { speaker: '', text: 'can change the world.' },
                { speaker: '', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' }
            ]
        ];

        let sectionIndex = 0;

        const playNext = () => {
            if (sectionIndex >= sections.length) {
                // All sections done — mark complete, auto-transition
                game.setFlag('epilogue_complete', true);
                game.showNotification('Click to continue to credits…');
                const tid = setTimeout(() => {
                    game.loadScene('credits');
                }, 8000);
                this._timeoutIds.push(tid);
                return;
            }

            const section = sections[sectionIndex];
            sectionIndex++;

            game.startDialogue(section);

            // Poll for dialogue completion, then pause before next section
            const poll = setInterval(() => {
                if (!game.isDialogueActive) {
                    clearInterval(poll);
                    const tid = setTimeout(playNext, 1200);
                    this._timeoutIds.push(tid);
                }
            }, 250);
            this._timeoutIds.push(poll);
        };

        // Begin after brief opening pause
        const tid = setTimeout(playNext, 1000);
        this._timeoutIds.push(tid);
    }
};

// Scene will be registered in index.html initGame() function
