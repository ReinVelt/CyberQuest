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

    description: 'Inside the WSRT control room — panoramic window overlooking the 14 radio dishes. Monitors hum with data feeds. Operated by ASTRON.',

    playerStart: { x: 50, y: 90 },

    idleThoughts: [
        "These dishes have been listening to the universe since the seventies.",
        "Fourteen 25-metre parabolic antennas, visible right through that window.",
        "Cees spends his nights tracking satellites from this room.",
        "The hum of the servers is oddly calming.",
        "Between Westerbork and Hooghalen. Former Camp Westerbork land. Radio-quiet zone.",
        "This is where they discovered SpaceX interference.",
        "LOFAR, WSRT, Apertif — Drenthe punches above its weight.",
        "Hard to believe we're 40 minutes from home.",
        "The monitors show data from all fourteen dishes in real time.",
        "Peaceful place to do terrifying analysis.",
        "The control room walls muffle the Drenthe wind.",
        "Signals from billions of light-years away… and one from 30 km.",
        "If anyone can spot an anomalous RF signature, it's these guys.",
        "Science and espionage collide on a Tuesday afternoon.",
        "That feed horn could pick up a mobile phone on the moon.",
        "Cees doesn't look like he's slept in days. Solidarity.",
        "Smells like coffee and solder in here. Classic lab.",
        "Green screen glow on his face. Classic.",
        "This place makes my mancave look like a toy set."
    ],

    // ─── internal state for timeouts ───
    _timeoutIds: [],

    // ─────────────────────────────────────────────
    //  Hotspot definitions (% coords based on 1920×1080 SVG)
    // ─────────────────────────────────────────────
    hotspots: [
        // ── Cees Bassa (standing at his workstation, right of center) ──
        {
            id: 'cees-bassa',
            name: 'Cees Bassa',
            x: 57,
            y: 58,
            width: 13,
            height: 34,
            cursor: 'pointer',
            action: function(game) {
                AstronScene._talkToCees(game);
            }
        },

        // ── Panoramic window (dishes visible through glass, 16:9) ──
        {
            id: 'window-dishes',
            name: 'WSRT Dish Array',
            // SVG: window x:410, y:80, 1100×618
            x: (410 / 1920) * 100,       // ~21.4 %
            y: (80 / 1080) * 100,         // ~7.4 %
            width: (1100 / 1920) * 100,   // ~57.3 %
            height: (618 / 1080) * 100,   // ~57.2 %
            cursor: 'pointer',
            action: function(game) {
                if (game.getFlag('signal_triangulated')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The dishes just helped us pinpoint an illegal weapons facility.' },
                        { speaker: 'Ryan', text: 'Bet the Dutch government didn\'t plan for THIS use case.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Fourteen 25-metre parabolic dishes, spreading 1.5 kilometres across the heath.' },
                        { speaker: 'Ryan', text: 'Hydrogen-line receivers, multi-feed systems… this array hears whispers from across the galaxy.' },
                        { speaker: 'Ryan', text: 'The Westerbork Synthesis Radio Telescope. Operational since 1970.' },
                        { speaker: 'Ryan', text: 'And right now it\'s going to listen for something much closer.' }
                    ]);
                }
            }
        },

        // ── Wall monitors (below window sill) ──
        {
            id: 'wall-monitors',
            name: 'WSRT Status Monitors',
            // SVG: 4 monitors at y:720, spanning under window
            x: (410 / 1920) * 100,        // ~21.4 %
            y: (720 / 1080) * 100,         // ~66.7 %
            width: (1100 / 1920) * 100,    // ~57.3 %
            height: (75 / 1080) * 100,     // ~6.9 %
            cursor: 'pointer',
            action: function(game) {
                if (game.getFlag('schematics_verified')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The WSRT correlator status. All fourteen dishes online and tracking.' },
                        { speaker: 'Ryan', text: 'World-class signal processing infrastructure — repurposed for counter-espionage.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Wall-mounted status screens. LOFAR array status, RF spectrum, dish pointing coords.' },
                        { speaker: 'Ryan', text: 'Some of the most powerful radio-astronomy computers in the country feed these displays.' },
                        { speaker: 'Ryan', text: 'Cees said he\'d run the schematics through the ASTRON signal-analysis pipeline.' }
                    ]);
                }
            }
        },

        // ── Signal analysis equipment (Ryan's HackRF + laptop on desk) ──
        {
            id: 'equipment',
            name: 'Signal Analysis Equipment',
            // SVG: translate(350,749), equipment spans ~220×65
            x: (350 / 1920) * 100,        // ~18.2 %
            y: (749 / 1080) * 100,         // ~69.4 %
            width: (230 / 1920) * 100,     // ~12.0 %
            height: (65 / 1080) * 100,     // ~6.0 %
            cursor: 'pointer',
            action: function(game) {
                AstronScene._useEquipment(game);
            }
        },

        // ── Server rack (left wall) ──
        {
            id: 'server-rack',
            name: 'Server Rack',
            // SVG: translate(20,80), 85×720
            x: (20 / 1920) * 100,         // ~1.0 %
            y: (80 / 1080) * 100,          // ~7.4 %
            width: (90 / 1920) * 100,      // ~4.7 %
            height: (720 / 1080) * 100,    // ~66.7 %
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Server rack. ASTRON\'s on-site correlator and data storage.' },
                    { speaker: 'Ryan', text: 'These machines process terabytes of radio data every day.' },
                    { speaker: 'Ryan', text: 'The blinking LEDs look healthy. Green across the board — mostly.' }
                ]);
            }
        },

        // ── Door (exit — right wall) ──
        {
            id: 'door-exit',
            name: 'Exit Door',
            // SVG: translate(1740,280), 140×579
            x: (1740 / 1920) * 100,       // ~90.6 %
            y: (280 / 1080) * 100,         // ~25.9 %
            width: (150 / 1920) * 100,     // ~7.8 %
            height: (579 / 1080) * 100,    // ~53.6 %
            cursor: 'pointer',
            action: function(game) {
                if (game.getFlag('astron_complete')) {
                    // Offer choice: drive home or walk to nearby memorial
                    if (game.getFlag('visited_klooster') && !game.getFlag('visited_westerbork_memorial')) {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'Got what we came for. Schematics verified. Signal pinpointed.' },
                            { speaker: 'Ryan', text: 'The Westerbork Memorial is just 200 metres from here, across the heath.' },
                            { speaker: 'Ryan', text: 'I should check it out before heading home.' }
                        ], () => {
                            game.loadScene('westerbork_memorial');
                        });
                    } else {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'Got what we came for. Schematics verified. Signal pinpointed.' },
                            { speaker: 'Ryan', text: 'Time to head home and plan the next move.' }
                        ], () => {
                            game.setFlag('driving_destination', 'home_from_astron');
                            game.loadScene('driving_day');
                        });
                    }
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The exit. Not leaving yet — still work to do here.' }
                    ]);
                }
            }
        },

        // ── Walk to Westerbork Memorial (200 m across the heath) ──
        {
            id: 'walk-to-memorial',
            name: 'Westerbork Memorial →',
            x: 92,
            y: 80,
            width: 8,
            height: 20,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                if (!game.getFlag('visited_klooster')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The memorial is just across the field. Maybe 200 metres.' },
                        { speaker: 'Ryan', text: 'But I don\'t have a reason to go there right now.' }
                    ]);
                    return;
                }
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The memorial is just 200 metres across the heath. I can walk there.' },
                    { speaker: '', text: '*Ryan steps outside and crosses the field toward the memorial site*' }
                ], () => {
                    game.loadScene('westerbork_memorial');
                });
            }
        },

        // ── ASTRON plaque (right of window, at monitor height) ──
        {
            id: 'astron-plaque',
            name: 'ASTRON Plaque',
            // SVG: translate(1540,720), 90×50
            x: (1540 / 1920) * 100,       // ~80.2 %
            y: (720 / 1080) * 100,         // ~66.7 %
            width: (95 / 1920) * 100,      // ~4.9 %
            height: (55 / 1080) * 100,     // ~5.1 %
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: '"ASTRON — Netherlands Institute for Radio Astronomy."' },
                    { speaker: 'Ryan', text: 'Operated the WSRT since the seventies, then built LOFAR.' },
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

        // Remove any existing NPC characters from previous visits
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            const npcCharacters = charactersContainer.querySelectorAll('.npc-character');
            npcCharacters.forEach(npc => npc.remove());
        }

        // Show Cees Bassa South Park character (same height as Ryan: ~30% scene height)
        setTimeout(() => {
            game.showCharacter('cees_bassa', 58, 90, 0.11);
        }, 100);

        // First visit introduction
        if (!game.getFlag('visited_astron')) {
            game.setFlag('visited_astron', true);

            game.startDialogue([
                { speaker: '', text: '*Ryan steps into the WSRT control room. Through the panoramic window, fourteen dishes stretch across the heath.*' },
                { speaker: 'Ryan', text: 'Impressive. All that radio astronomy hardware, controlled from this one room.' },
                { speaker: '', text: '*Cees Bassa looks up from his workstation, tablet in hand*' },
                { speaker: 'Cees Bassa', text: 'Ryan! Come in. Close the door behind you.' },
                { speaker: 'Cees Bassa', text: 'I ran the schematics you sent through our signal-analysis pipeline overnight.' },
                { speaker: 'Cees Bassa', text: 'You\'re going to want to sit down for this.' },
                { speaker: 'Ryan', text: 'That bad?' },
                { speaker: 'Cees Bassa', text: 'That REAL. Come on, let me show you.' }
            ]);
        } else {
            game.startDialogue([
                { speaker: '', text: '*The monitors hum softly. Through the window, dishes track across the sky.*' },
                { speaker: 'Ryan', text: 'Back in the control room. Cees is at his workstation.' }
            ]);
        }
    },

    onExit: function() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        // Remove NPC characters
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            const npcCharacters = charactersContainer.querySelectorAll('.npc-character');
            npcCharacters.forEach(npc => npc.remove());
        }

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
                { speaker: 'Cees Bassa', text: 'And I happen to have 14 radio telescopes and a supercomputer, all controlled from this room.' },
                { speaker: 'Cees Bassa', text: 'Go set up your HackRF at the equipment station. I\'ll configure the dishes from here.' }
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
                        hint: 'Click the signal analysis equipment on the desk.'
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
                { speaker: 'Cees Bassa', text: '*Sighs* At least take a secure mesh radio. If things go sideways, I can monitor from the control room.' },
                { speaker: 'Ryan', text: 'Thanks, Cees. For everything.' },
                { speaker: 'Cees Bassa', text: 'Don\'t thank me. Stop them. That\'s all the thanks I need.' },
                { speaker: 'Cees Bassa', text: 'And Ryan? Come back in one piece. I need my Meshtastic buddy.' }
            ]);

            game.setFlag('astron_complete', true);

            // Add inventory item: ASTRON mesh radio
            const tid = setTimeout(() => {
                game.addItem({
                    id: 'astron_mesh_radio',
                    name: 'ASTRON Mesh Radio',
                    description: 'Secure Meshtastic node linked to ASTRON\'s monitoring system. Cees can track your position.',
                    icon: '📡'
                });
                game.showNotification('Received ASTRON Mesh Radio from Cees');

                // Unlock facility infiltration quest (only if not already created by Eva contact)
                setTimeout(() => {
                    if (!game.questManager.hasQuest('infiltrate_facility')) {
                        game.addQuest({
                            id: 'infiltrate_facility',
                            name: 'Infiltrate Steckerdoser Heide',
                            description: 'Drive to the facility under cover of darkness and find a way inside.',
                            hint: 'Head home, prepare your gear, then take the Volvo from the garden.'
                        });
                    }
                    game.setFlag('facility_unlocked', true);
                }, 2500);
            }, 1500);
            this._timeoutIds.push(tid);
            return;
        }

        // Stage 3: Done — flavour text
        if (game.getFlag('astron_complete')) {
            game.startDialogue([
                { speaker: 'Cees Bassa', text: 'Still here? Go do what you need to do. I\'ll keep the dishes listening from this room.' },
                { speaker: 'Ryan', text: 'On my way. Take care, Cees.' }
            ]);
            return;
        }

        // Fallback between stages (schematics verified, awaiting triangulation)
        game.startDialogue([
            { speaker: 'Cees Bassa', text: 'Set up the HackRF on the equipment station. I\'ve got the dishes configured from the console.' },
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
                { speaker: 'Ryan', text: 'My HackRF and laptop, set up on the desk. Ready for signal analysis.' },
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
            game.showPasswordPuzzle({
                title: '📡 Beacon Frequency Isolation',
                description: 'The Project Echo calibration beacon broadcasts on a military frequency.<br>Enter the frequency (in MHz) from the original SSTV intercept to lock on.',
                placeholder: 'Frequency in MHz (e.g. 243)',
                hint: 'Remember the military frequency Ryan tuned his HackRF to in the mancave. It was mentioned in the first decoded SSTV message.',
                correctAnswer: ['243', '243.0', '243.00'],
                onSuccess: function(game) {
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
