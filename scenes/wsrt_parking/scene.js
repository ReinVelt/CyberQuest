/**
 * WSRT/Memorial Parking Scene
 * Central parking area serving the WSRT, Westerbork Memorial, and Planetenpad.
 * Located between the three destinations in the Drenthe heathland.
 *
 * Direction board shows:
 *   → Herinneringscentrum Kamp Westerbork (200 m)
 *   → WSRT / ASTRON (400 m)
 *   → Planetenpad — schaalmodel zonnestelsel (1000 m wandeling)
 *
 * Reached from: garden → volvo → driving_day → wsrt_parking
 *               or on foot from ASTRON / memorial / planetenpad
 * Exits: walk to memorial, walk to WSRT, walk planetenpad, drive home
 */

const WsrtParkingScene = {
    id: 'wsrt_parking',
    name: 'WSRT Parking',

    background: 'assets/images/scenes/wsrt_parking.svg',

    description: 'A gravel parking area on the Drenthe heath. A wooden direction board points to the Memorial, the WSRT, and the Planetenpad. The Volvo sits in the shade of a birch tree.',

    playerStart: { x: 50, y: 85 },

    // 🎬 Accessibility / Movie Mode — visit destinations in story order:
    //   1. WSRT / ASTRON (once astron_unlocked)
    //   2. Westerbork Memorial (once astron visited)
    //   3. Drive home
    //   Planetenpad is optional — not forced in movie mode.
    // 🎬 Accessibility / Movie Mode — visit destinations in story order:
    //   1. WSRT / ASTRON (once astron_unlocked)
    //   2. Lofar Superterp (after astron visit — day drive to Exloo)
    //   3. Westerbork Memorial (after Lofar)
    //   4. Drive home
    //   Planetenpad is optional — not forced in movie mode.
    accessibilityPath: [
        async function(game) {
            if (!game.getFlag('visited_westerbork_memorial')) {
                // 1. Visit Westerbork Memorial first (before ASTRON)
                game.loadScene('westerbork_memorial');
            } else if (game.getFlag('astron_unlocked') && !game.getFlag('visited_astron')) {
                // 2. Visit ASTRON / WSRT (after Westerbork)
                game.loadScene('astron');
            } else if (game.getFlag('visited_astron') && !game.getFlag('visited_lofar')) {
                // 3. Drive to Lofar Superterp
                game.setFlag('driving_destination', 'lofar');
                game.loadScene('driving_day');
            } else {
                // 4. All done — drive home
                game.setFlag('driving_destination', 'home_from_wsrt_parking');
                const hour = parseInt((game.gameState.time || '14:00').split(':')[0], 10);
                if (hour >= 20 || hour < 7) {
                    game.loadScene('driving');
                } else {
                    game.loadScene('driving_day');
                }
            }
        },
    ],

    idleThoughts: [
        "Three destinations from one parking lot. Only in Drenthe.",
        "The Volvo ticks quietly as the engine cools.",
        "I can see the WSRT dishes from here. Still impressive.",
        "Wind rustles through the heather. Otherwise silence.",
        "A magpie watches me from the birch tree. Judgmental.",
        "Fresh Drenthe air. Smells like heather and damp earth.",
    ],

    _timeoutIds: [],

    hotspots: [
        // ── Direction Board (main interactive element) ──
        {
            id: 'direction_board',
            name: 'Direction Board',
            x: 30,
            y: 40,
            width: 28,
            height: 24,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*A weathered wooden direction board stands at the edge of the parking area*' },
                    { speaker: 'Narrator', text: '→ Herinneringscentrum Kamp Westerbork — 200 m' },
                    { speaker: 'Narrator', text: '→ WSRT / ASTRON — 400 m' },
                    { speaker: 'Narrator', text: '→ Planetenpad (schaalmodel zonnestelsel) — 1000 m wandeling' },
                    { speaker: 'Ryan', text: 'Three paths from one parking spot. Memorial, radio telescope, and a scale model of the solar system.' },
                    { speaker: 'Ryan', text: 'Only in the middle of Drenthe.' },
                ]);
            }
        },

        // ── Walk to Memorial (200 m) ──
        {
            id: 'walk_memorial',
            name: 'Memorial → 200m',
            x: 0,
            y: 55,
            width: 12,
            height: 25,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*A gravel path leads south through the heather toward the memorial*' },
                    { speaker: 'Ryan', text: 'The memorial. Two hundred metres through the heath.' },
                    { speaker: 'Narrator', text: '*Ryan starts walking. The WSRT dishes are visible to the west.*' },
                ], () => {
                    game.loadScene('westerbork_memorial');
                });
            }
        },

        // ── Walk to WSRT / ASTRON (400 m) ──
        {
            id: 'walk_wsrt',
            name: 'WSRT → 400m',
            x: 88,
            y: 55,
            width: 12,
            height: 25,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                if (!game.getFlag('astron_unlocked')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The WSRT control room is 400 metres along that path. I can see the dishes.' },
                        { speaker: 'Ryan', text: 'But I don\'t have an appointment with anyone there. No reason to walk over.' },
                    ]);
                    return;
                }
                game.startDialogue([
                    { speaker: 'Narrator', text: '*A paved path heads west toward the radio telescope array*' },
                    { speaker: 'Ryan', text: 'The WSRT. Four hundred metres. Cees should be in the control room.' },
                    { speaker: 'Narrator', text: '*Ryan walks past the heather. The 14 dishes grow larger with each step.*' },
                ], () => {
                    game.loadScene('astron');
                });
            }
        },

        // ── Walk Planetenpad (1000 m) ──
        {
            id: 'walk_planetenpad',
            name: 'Planetenpad → 1 km',
            x: 43,
            y: 29,
            width: 14,
            height: 10,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                if (game.getFlag('planetenpad_complete')) {
                    game.startDialogue([
                        { speaker: 'Narrator', text: 'The Planetenpad. One kilometre through the heath, past scale models of all the planets.' },
                        { speaker: 'Narrator', text: 'I walked it already. Impressive how big the solar system feels, even at scale.' },
                        { speaker: 'Narrator', text: '*Ryan starts down the path again, past the Pluto marker*' },
                    ], () => {
                        game.loadScene('planetenpad');
                    });
                } else {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*A narrow path heads north into the heath. A small sign reads: PLANETENPAD — Schaalmodel Zonnestelsel*' },
                        { speaker: 'Narrator', text: 'A scale model of the solar system? One kilometre walk from Pluto to the Sun.' },
                        { speaker: 'Narrator', text: 'That\'s... actually kind of cool. Let\'s see how big space really is.' },
                        { speaker: 'Narrator', text: '*Ryan starts down the path. The first marker is already visible ahead.*' },
                    ], () => {
                        game.loadScene('planetenpad');
                    });
                }
            }
        },

        // ── The Volvo (drive home) ──
        {
            id: 'volvo',
            name: 'The Volvo',
            x: 60,
            y: 70,
            width: 25,
            height: 20,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The Volvo. Ready to head home whenever I am.' },
                    { speaker: 'Narrator', text: '*Ryan gets in and starts the engine*' },
                ], () => {
                    game.setFlag('driving_destination', 'home_from_wsrt_parking');
                    // Decide day/night driving
                    const hour = parseInt((game.gameState.time || '14:00').split(':')[0], 10);
                    if (hour >= 20 || hour < 7) {
                        game.loadScene('driving');
                    } else {
                        game.loadScene('driving_day');
                    }
                });
            }
        },

        // ── Information kiosk (near direction board) ──
        {
            id: 'info_kiosk',
            name: 'Information Panel',
            x: 15,
            y: 30,
            width: 18,
            height: 20,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Narrator', text: '📚 HERINNERINGSCENTRUM KAMP WESTERBORK — BEZOEKERSGEBIED' },
                    { speaker: 'Narrator', text: 'This area lies between the former Camp Westerbork (now a national memorial) and the Westerbork Synthesis Radio Telescope (WSRT).' },
                    { speaker: 'Narrator', text: 'The WSRT was built in the 1960s on the adjacent heathland. Fourteen 25-metre radio dishes form a 2.7 km east-west baseline.' },
                    { speaker: 'Narrator', text: 'The Planetenpad is a walking route featuring a scale model of our solar system. Starting from the outer planets near this parking area, the path leads 1 kilometre to a sun model near the WSRT.' },
                    { speaker: 'Narrator', text: 'At this scale, the Earth is smaller than a marble and the Sun is the size of a beach ball. The distances between planets are vast — even in miniature.' },
                    { speaker: 'Ryan', text: 'History, science, and education. All from one gravel car park in the middle of Drenthe.' },
                ]);
            }
        },

        // ── Heathland view ──
        {
            id: 'heathland',
            name: 'Drenthe Heathland',
            x: 0,
            y: 15,
            width: 35,
            height: 25,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Classic Drenthe heathland. Purple heather in summer, brown scrub in winter.' },
                    { speaker: 'Ryan', text: 'Flat to every horizon. That\'s why they built the radio telescope here — no hills to block the signal.' },
                    { speaker: 'Ryan', text: 'And why they built the camp here. Remote. Out of sight. Out of mind.' },
                    { speaker: 'Ryan', text: 'Same geography, different purposes. The duality of this place never stops hitting me.' },
                ]);
            }
        },

        // ── WSRT dishes in background ──
        {
            id: 'dishes_distant',
            name: 'WSRT Dishes (distant)',
            x: 65,
            y: 15,
            width: 35,
            height: 25,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The WSRT dishes, lined up along the horizon. Fourteen of them, stretching almost three kilometres.' },
                    { speaker: 'Ryan', text: 'From here they look like white flowers growing out of the heath.' },
                    { speaker: 'Ryan', text: 'Each one is 25 metres across. Together they form a synthesis array — combining radio waves into images of the cosmos.' },
                    { speaker: 'Ryan', text: 'Operational since 1970. Over fifty years of listening to the universe.' },
                ]);
            }
        },
    ],

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
            // ── wind across heather ──
            var buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var wind = ctx.createBufferSource(); wind.buffer = buf; wind.loop = true;
            var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380;
            var wG = ctx.createGain(); wG.gain.value = 0.032;
            wind.connect(lp).connect(wG).connect(master); wind.start();
            self._audioNodes.push(wind, lp, wG);
            // ── gust modulation ──
            var lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.08;
            var lfoG = ctx.createGain(); lfoG.gain.value = 0.012;
            lfo.connect(lfoG).connect(wG.gain); lfo.start();
            self._audioNodes.push(lfo, lfoG);
            // ── distant WSRT dish motor hum ──
            var mot = ctx.createOscillator(); mot.type = 'sine'; mot.frequency.value = 58;
            var motG = ctx.createGain(); motG.gain.value = 0.015;
            mot.connect(motG).connect(master); mot.start();
            self._audioNodes.push(mot, motG);
        } catch(e) {}
    },

    onEnter: function(game) {
        WsrtParkingScene._startAmbientAudio();
        // Clear any leftover timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        if (!game.getFlag('visited_wsrt_parking')) {
            game.setFlag('visited_wsrt_parking', true);

            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*The Volvo rolls into a small gravel parking area. A wooden direction board stands at the edge of the heath.*' },
                    { speaker: 'Ryan', text: 'This is it. The WSRT parking area.' },
                    { speaker: 'Ryan', text: 'Three paths diverge from here. The memorial, the radio telescope, and...' },
                    { speaker: 'Narrator', text: '*Ryan reads the third sign*' },
                    { speaker: 'Ryan', text: '"Planetenpad — Schaalmodel Zonnestelsel." A scale model of the solar system. One kilometre.' },
                    { speaker: 'Ryan', text: 'Interesting. But first things first.' },
                ]);
            }, 500);
        } else {
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*Back at the WSRT parking area. The direction board, the heather, the distant dishes.*' },
                    { speaker: 'Ryan', text: 'Same three paths. Same flat Drenthe sky.' },
                ]);
            }, 300);
        }
    },

    onExit: function() {
        WsrtParkingScene._stopAmbientAudio();
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }
    }
};

// Register scene
if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(WsrtParkingScene);
}
