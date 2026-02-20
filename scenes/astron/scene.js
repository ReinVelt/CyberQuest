/**
 * WSRT Scene — Westerbork Synthesis Radio Telescope
 * Ryan visits Cees Bassa at the WSRT radio telescope array to have
 * the Project Echo schematics verified and triangulate the facility's
 * signal using the LOFAR low-frequency array.
 *
 * The WSRT is located between Westerbork and Hooghalen in Drenthe.
 * It is operated by ASTRON, whose headquarters are in Dwingeloo.
 *
 * Triggers:  mancave (after USB analysed + Cees contacted)
 * Exits:     driving → home/mancave
 * Key flags: visited_astron, schematics_verified, signal_triangulated, astron_complete
 */

const AstronScene = {
    id: 'astron',
    name: 'WSRT — Westerbork',

    background: 'assets/images/scenes/astron.svg',

    description: 'The Westerbork Synthesis Radio Telescope — 14 iconic dishes stretching across the Drenthe heath, between Westerbork and Hooghalen. Operated by ASTRON.',

    playerStart: { x: 15, y: 85 },

    idleThoughts: [
        "These dishes have been listening to the universe since the seventies.",
        "Fourteen 25-metre parabolic antennas. Impressive.",
        "Cees spends his nights tracking satellites from here.",
        "The silence is deafening. Perfect for radio work.",
        "Between Westerbork and Hooghalen. Former Camp Westerbork land. Radio-quiet zone.",
        "This is where they discovered SpaceX interference.",
        "LOFAR, WSRT, Apertif — Drenthe punches above its weight.",
        "Hard to believe we're 40 minutes from home.",
        "Wonder what the dishes are pointing at right now.",
        "Peaceful place to do terrifying analysis.",
        "The world's problems feel small next to a radio telescope.",
        "Signals from billions of light-years away… and one from 30 km.",
        "If anyone can spot an anomalous RF signature, it's these guys.",
        "Science and espionage collide on a Tuesday afternoon.",
        "Birds avoid the array. Smart birds.",
        "That feed horn could pick up a mobile phone on the moon.",
        "Cees doesn't look like he's slept in days. Solidarity.",
        "The heathland smells like rain and peat.",
        "Green screen glow on his face. Classic.",
        "This place makes my mancave look like a toy set."
    ],

    // ─── internal state for timeouts ───
    _timeoutIds: [],

    // ─────────────────────────────────────────────
    //  Hotspot definitions (% coords based on 1920×1080 SVG)
    // ─────────────────────────────────────────────
    hotspots: [
        // ── Cees Bassa (character near hero dish) ──
        {
            id: 'cees-bassa',
            name: 'Cees Bassa',
            // SVG: translate(960,590), figure ≈30×80
            x: (945 / 1920) * 100,      // ~49.2 %
            y: (575 / 1080) * 100,       // ~53.2 %
            width: (50 / 1920) * 100,    // ~2.6 %
            height: (100 / 1080) * 100,  // ~9.3 %
            cursor: 'pointer',
            action: function(game) {
                AstronScene._talkToCees(game);
            }
        },

        // ── Hero dish (Dish 7, translate 1020,310) ──
        {
            id: 'hero-dish',
            name: 'WSRT Dish #7',
            x: (1020 / 1920) * 100,
            y: (310 / 1080) * 100,
            width: (100 / 1920) * 100,
            height: (200 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                if (game.getFlag('signal_triangulated')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Dish 7. Just helped us pinpoint an illegal weapons facility.' },
                        { speaker: 'Ryan', text: 'Bet the Dutch government didn\'t plan for THIS use case.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: '25-metre parabolic dish. One of fourteen, spread over 1.5 kilometres.' },
                        { speaker: 'Ryan', text: 'Hydrogen-line receivers, multi-feed systems… this thing hears whispers from across the galaxy.' },
                        { speaker: 'Ryan', text: 'And right now it\'s going to listen for something much closer.' }
                    ]);
                }
            }
        },

        // ── Dish array (spanning left dishes) ──
        {
            id: 'dish-array',
            name: 'WSRT Array',
            x: (80 / 1920) * 100,
            y: (380 / 1080) * 100,
            width: (900 / 1920) * 100,
            height: (130 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The Westerbork Synthesis Radio Telescope. Built in 1970.' },
                    { speaker: 'Ryan', text: 'Fourteen dishes working in concert, synthesising a virtual antenna hundreds of metres wide.' },
                    { speaker: 'Ryan', text: 'Interferometry. The same principle that makes LOFAR work.' },
                    { speaker: 'Ryan', text: 'And the same principle we can use to triangulate a signal source.' }
                ]);
            }
        },

        // ── WSRT control building ──
        {
            id: 'control-building',
            name: 'WSRT Control Building',
            // SVG: translate(1350,540), 200×120
            x: (1345 / 1920) * 100,
            y: (515 / 1080) * 100,
            width: (210 / 1920) * 100,
            height: (145 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                if (game.getFlag('schematics_verified')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The WSRT control room. Cees ran the analysis on the correlator upstairs.' },
                        { speaker: 'Ryan', text: 'World-class signal processing infrastructure — repurposed for counter-espionage.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The WSRT control building. Where the data from all fourteen dishes gets correlated.' },
                        { speaker: 'Ryan', text: 'Some of the most powerful radio-astronomy computers in the country are in there.' },
                        { speaker: 'Ryan', text: 'Cees said he\'d run the schematics through the ASTRON signal-analysis pipeline.' }
                    ]);
                }
            }
        },

        // ── Equipment table (laptop + HackRF) ──
        {
            id: 'equipment',
            name: 'Signal Analysis Equipment',
            // SVG: translate(750,640), table ~100×60
            x: (745 / 1920) * 100,
            y: (630 / 1080) * 100,
            width: (110 / 1920) * 100,
            height: (40 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                AstronScene._useEquipment(game);
            }
        },

        // ── Volvo (leave) ──
        {
            id: 'volvo',
            name: 'Volvo (Leave)',
            // SVG: translate(80,960), car ~170×100
            x: (75 / 1920) * 100,
            y: (955 / 1080) * 100,
            width: (180 / 1920) * 100,
            height: (110 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                if (game.getFlag('astron_complete')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Got what we came for. Schematics verified. Signal pinpointed.' },
                        { speaker: 'Ryan', text: 'Time to head home and plan the next move.' }
                    ]);
                    const timeoutId = setTimeout(() => {
                        game.setFlag('driving_destination', 'home_from_astron');
                        game.loadScene('driving');
                    }, 2000);
                    AstronScene._timeoutIds.push(timeoutId);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My Volvo. Not leaving yet — still work to do here.' }
                    ]);
                }
            }
        },

        // ── Info sign ──
        {
            id: 'info-sign',
            name: 'WSRT Information Sign',
            x: (660 / 1920) * 100,
            y: (675 / 1080) * 100,
            width: (60 / 1920) * 100,
            height: (55 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: '"Westerbork Synthesis Radio Telescope — since 1970."' },
                    { speaker: 'Ryan', text: 'Operated by ASTRON, the Netherlands Institute for Radio Astronomy.' },
                    { speaker: 'Ryan', text: 'This place has been decoding the universe for over fifty years.' },
                    { speaker: 'Ryan', text: 'Today it helps decode something a lot closer to home.' }
                ]);
            }
        }
    ],

    // ═══════════════════════════════════════════════
    //  Scene lifecycle
    // ═══════════════════════════════════════════════

    onEnter: function(game) {
        // Apply CSS fallback class
        const bg = document.getElementById('scene-background');
        if (bg) bg.className = 'scene-astron';

        // Clear any leftover timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        // First visit introduction
        if (!game.getFlag('visited_astron')) {
            game.setFlag('visited_astron', true);

            game.startDialogue([
                { speaker: '', text: '*Ryan parks the Volvo at the edge of the WSRT compound*' },
                { speaker: 'Ryan', text: 'There it is. Fourteen dishes, all pointing at the sky.' },
                { speaker: 'Ryan', text: 'The WSRT. Westerbork Synthesis Radio Telescope. Operational since 1970.' },
                { speaker: '', text: '*A figure waves from near Dish 7 — Cees Bassa, tablet in hand*' },
                { speaker: 'Cees Bassa', text: 'Ryan! Over here. I\'ve been expecting you.' },
                { speaker: 'Cees Bassa', text: 'I ran the schematics you sent through our signal-analysis pipeline overnight.' },
                { speaker: 'Cees Bassa', text: 'You\'re going to want to sit down for this.' },
                { speaker: 'Ryan', text: 'That bad?' },
                { speaker: 'Cees Bassa', text: 'That REAL. Come on, let me show you.' }
            ]);
        } else {
            game.startDialogue([
                { speaker: '', text: '*The dishes hum softly, tracking across the sky*' },
                { speaker: 'Ryan', text: 'Back at the WSRT. Cees is near the array.' }
            ]);
        }
    },

    onExit: function() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }
    },

    // ═══════════════════════════════════════════════
    //  Scene-specific interaction handlers
    // ═══════════════════════════════════════════════

    /**
     * Talk to Cees Bassa — multi-stage conversation
     */
    _talkToCees: function(game) {
        // Stage 1: Verify the schematics
        if (!game.getFlag('schematics_verified')) {
            game.startDialogue([
                { speaker: 'Cees Bassa', text: 'Okay. Here\'s what I found.' },
                { speaker: 'Cees Bassa', text: 'The antenna array in these schematics uses phased-array beam-steering.' },
                { speaker: 'Cees Bassa', text: 'Similar to what we use in LOFAR — digital beamforming, hundreds of elements working in phase.' },
                { speaker: 'Cees Bassa', text: 'But the power levels are INSANE. This isn\'t for listening. It\'s for projecting.' },
                { speaker: 'Ryan', text: 'Projecting what?' },
                { speaker: 'Cees Bassa', text: 'Concentrated electromagnetic energy. Multi-band, tuneable from 100 MHz to 6 GHz.' },
                { speaker: 'Cees Bassa', text: 'At these power levels? It would overload any unshielded electronics within five kilometres.' },
                { speaker: 'Cees Bassa', text: 'Cars would stall. Phones would brick. Medical implants would…' },
                { speaker: '', text: '*Cees trails off, shaking his head*' },
                { speaker: 'Cees Bassa', text: 'Ryan, this is weaponised radio. Pure and simple.' },
                { speaker: 'Cees Bassa', text: 'And the signal-processing algorithms? They\'re not German. The coding style, the variable naming — it\'s Russian school.' },
                { speaker: 'Ryan', text: 'Volkov.' },
                { speaker: 'Cees Bassa', text: 'Whoever designed this trained in Soviet-era signal warfare. No question.' },
                { speaker: 'Cees Bassa', text: 'The math is elegant. Terrifyingly elegant.' },
                { speaker: 'Ryan', text: 'Can you put that in a report? Something that would hold up with intelligence services?' },
                { speaker: 'Cees Bassa', text: 'Already done. Encrypted PDF on your dead-drop. My professional analysis, signed.' },
                { speaker: 'Cees Bassa', text: 'I also found something else. The schematics reference a calibration beacon.' },
                { speaker: 'Cees Bassa', text: 'A low-power test signal that the weapon emits continuously — for alignment.' },
                { speaker: 'Ryan', text: 'A beacon… that we could track?' },
                { speaker: 'Cees Bassa', text: 'With the right equipment? Absolutely. Like a lighthouse for an EM cannon.' },
                { speaker: 'Cees Bassa', text: 'And I happen to have 14 radio telescopes and a supercomputer.' },
                { speaker: 'Cees Bassa', text: 'Go set up your HackRF at the equipment table. I\'ll configure the dishes.' }
            ]);

            game.setFlag('schematics_verified', true);
            game.showNotification('Schematics verified by Cees Bassa — RF weapon confirmed');

            // Add quest for triangulation
            const tid = setTimeout(() => {
                if (game.questManager && typeof game.questManager.addQuest === 'function') {
                    game.questManager.addQuest({
                        id: 'triangulate_signal',
                        name: 'Triangulate Echo Beacon',
                        description: 'Use the equipment table to combine HackRF data with WSRT dishes and triangulate Project Echo\'s calibration beacon.',
                        hint: 'Click the signal analysis equipment near the dishes.'
                    });
                }
                game.showNotification('New quest: Triangulate Echo Beacon');
            }, 2000);
            this._timeoutIds.push(tid);
            return;
        }

        // Stage 2: After triangulation
        if (game.getFlag('signal_triangulated') && !game.getFlag('astron_complete')) {
            game.startDialogue([
                { speaker: 'Cees Bassa', text: 'The coordinates match Steckerdoser Heide. Dead on.' },
                { speaker: 'Cees Bassa', text: 'Ryan… what are you going to do with all this?' },
                { speaker: 'Ryan', text: 'Eva is inside. She asked for my help. I\'m going in.' },
                { speaker: 'Cees Bassa', text: 'You\'re going to infiltrate a military facility. Alone.' },
                { speaker: 'Ryan', text: 'With the right badge and the right timing? Yes.' },
                { speaker: 'Cees Bassa', text: '*Sighs* At least take a secure mesh radio. If things go sideways, I can monitor from here.' },
                { speaker: 'Ryan', text: 'Thanks, Cees. For everything.' },
                { speaker: 'Cees Bassa', text: 'Don\'t thank me. Stop them. That\'s all the thanks I need.' },
                { speaker: 'Cees Bassa', text: 'And Ryan? Come back in one piece. I need my Meshtastic buddy.' }
            ]);

            game.setFlag('astron_complete', true);

            // Add inventory item: ASTRON mesh radio
            const tid = setTimeout(() => {
                if (typeof game.addInventoryItem === 'function') {
                    game.addInventoryItem({
                        id: 'astron_mesh_radio',
                        name: 'ASTRON Mesh Radio',
                        description: 'Secure Meshtastic node linked to ASTRON\'s monitoring system. Cees can track your position.',
                        icon: '📡'
                    });
                }
                game.showNotification('Received ASTRON Mesh Radio from Cees');

                // Unlock facility infiltration quest
                setTimeout(() => {
                    if (game.questManager && typeof game.questManager.addQuest === 'function') {
                        game.questManager.addQuest({
                            id: 'infiltrate_facility',
                            name: 'Infiltrate Steckerdoser Heide',
                            description: 'Drive to the facility under cover of darkness and find a way inside.',
                            hint: 'Head home, prepare your gear, then take the Volvo from the garden.'
                        });
                    }
                    game.setFlag('facility_unlocked', true);
                    game.showNotification('New quest: Infiltrate Steckerdoser Heide');
                }, 2500);
            }, 1500);
            this._timeoutIds.push(tid);
            return;
        }

        // Stage 3: Done — flavour text
        if (game.getFlag('astron_complete')) {
            game.startDialogue([
                { speaker: 'Cees Bassa', text: 'Still here? Go do what you need to do. I\'ll keep the dishes listening.' },
                { speaker: 'Ryan', text: 'On my way. Take care, Cees.' }
            ]);
            return;
        }

        // Fallback between stages (schematics verified, awaiting triangulation)
        game.startDialogue([
            { speaker: 'Cees Bassa', text: 'Set up the HackRF on the equipment table. I\'ve got the dishes configured.' },
            { speaker: 'Cees Bassa', text: 'Once we combine the data, we can triangulate that beacon.' }
        ]);
    },

    /**
     * Equipment table — signal triangulation puzzle
     */
    _useEquipment: function(game) {
        if (game.getFlag('signal_triangulated')) {
            game.startDialogue([
                { speaker: 'Ryan', text: 'Target confirmed: 53.28°N, 7.42°E. Steckerdoser Heide.' },
                { speaker: 'Ryan', text: 'Data\'s saved. Time to talk to Cees.' }
            ]);
            return;
        }

        if (!game.getFlag('schematics_verified')) {
            game.startDialogue([
                { speaker: 'Ryan', text: 'My HackRF and laptop. Ready for signal analysis.' },
                { speaker: 'Ryan', text: 'Need to talk to Cees first — he\'s the expert here.' }
            ]);
            return;
        }

        // Triangulation sequence — interactive puzzle
        game.startDialogue([
            { speaker: 'Ryan', text: 'HackRF is scanning… looking for that calibration beacon Cees mentioned.' },
            { speaker: '', text: '*The laptop screen fills with a waterfall display — noise across multiple bands*' },
            { speaker: 'Ryan', text: 'There\'s a lot of interference. LOFAR stations, satellite downlinks, commercial radio…' },
            { speaker: 'Ryan', text: 'Need to isolate the right frequency. Cees said the beacon would be in the military band.' }
        ]);

        // Launch the frequency-tuning puzzle
        const tid = setTimeout(() => {
            game.showPuzzle({
                type: 'input',
                title: '📡 Beacon Frequency Isolation',
                description: 'The Project Echo calibration beacon broadcasts on a military frequency.\nEnter the frequency (in MHz) from the original SSTV intercept to lock on.',
                placeholder: 'Frequency in MHz (e.g. 243)',
                hint: 'Remember the military frequency Ryan tuned his HackRF to in the mancave. It was mentioned in the first decoded SSTV message.',
                answer: function(input) {
                    // Accept the canonical military frequency from the story
                    const freq = String(input).trim().replace(/[^0-9.]/g, '');
                    // Accept 243 or 243.0 (UHF military emergency/guard freq used in story)
                    return freq === '243' || freq === '243.0' || freq === '243.00';
                },
                onSolve: function(game) {
                    game.setFlag('signal_triangulated', true);
                    game.completeQuest('triangulate_signal');

                    game.startDialogue([
                        { speaker: '', text: '*The HackRF locks onto 243 MHz — a faint but steady pulse appears*' },
                        { speaker: 'Ryan', text: 'There it is! The beacon. Faint, but the WSRT dishes are amplifying it.' },
                        { speaker: '', text: '*On the laptop, 14 signal traces converge into a single bearing*' },
                        { speaker: 'Ryan', text: 'Triangulation in progress… combining dish baselines…' },
                        { speaker: '', text: '*A map renders with a red crosshair — right on Steckerdoser Heide*' },
                        { speaker: 'Ryan', text: 'Got it. 53.28°N, 7.42°E. Steckerdoser Heide facility. Dead centre.' },
                        { speaker: 'Ryan', text: 'The beacon is real. The weapon is real. The location is confirmed.' },
                        { speaker: 'Ryan', text: 'Now we know EXACTLY where it is. Talk to Cees — time to plan.' }
                    ]);

                    game.showNotification('Signal triangulated! Target: Steckerdoser Heide confirmed');
                },
                onClose: function(game) {
                    // Cancelled — nothing to clean up
                }
            });
        }, 4000);
        this._timeoutIds.push(tid);
    }
};

// ── Export for test environments ──
if (typeof module !== 'undefined') {
    module.exports = AstronScene;
}
