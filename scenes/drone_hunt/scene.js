/**
 * Scene: Drone Hunt — Steckerdoser Heide Forest
 * ═══════════════════════════════════════════════════════════
 * Hollywood action scene. Ryan must evade Volkov's surveillance
 * drones using GPS spoofing via HackRF One.
 *
 * Phases:
 *   1. Arrival & Decoy Setup (Meshtastic Pi)
 *   2. Drone Detection (hide from thermal scan)
 *   3. GPS Spoofing (configure HackRF — puzzle)
 *   4. The Spoof (drones crash into swamp)
 *   5. Proceed to Facility
 * ═══════════════════════════════════════════════════════════
 */

const DroneHuntScene = {
    id: 'drone_hunt',
    name: 'Steckerdoser Heide — Forest',

    background: 'assets/images/scenes/drone_hunt.svg',

    description: 'A narrow road vanishes into dark forest near the Steckerdoser Heide. Drone rotors hum in the cold air. The facility\'s red lights pulse beyond the treeline.',

    playerStart: { x: 20, y: 88 },

    idleThoughts: [
        'Those rotors are getting closer...',
        'Stay low. Stay quiet.',
        'HackRF should handle civilian GPS.',
        '1575.42 MHz. Burned into my brain.',
        'Heather smells nice. Terrible time to notice.',
        'Volkov\'s toys. Let\'s break them.',
        'Swamp to the south. Perfect drone graveyard.',
        'GPS L1 has zero authentication. Amateur hour.'
    ],

    // Scene state tracking
    state: {
        phase: 1,              // Current phase (1-5)
        decoyPlaced: false,    // Meshtastic decoy set up
        hiddenFromScan: false, // Survived first drone scan
        hackrfReady: false,    // HackRF opened
        frequencySet: false,   // 1575.42 MHz locked
        powerSet: false,       // TX power calibrated
        targetSet: false,      // Spoof coordinates chosen
        spoofExecuted: false,  // GPS spoof launched
        dronesDown: false      // Drones crashed / redirected
    },

    hotspots: [
        /* ── FALLEN TREE — Meshtastic decoy placement (Phase 1) ─── */
        {
            id: 'fallen_tree',
            name: 'Fallen Tree',
            // Mid-left area of moorland
            x: 5,
            y: 62,
            width: 12,
            height: 8,
            cursor: 'pointer',
            enabled: (game) => {
                const s = DroneHuntScene.state;
                return s.phase === 1 && !s.decoyPlaced;
            },
            action: function(game) {
                const s = DroneHuntScene.state;
                game.startDialogue([
                    { speaker: '', text: '*Ryan crouches beside a moss-covered pine*' },
                    { speaker: 'Ryan', text: 'Perfect spot. Hidden from aerial view.' },
                    { speaker: '', text: '*Pulls a Raspberry Pi and cellular modem from the backpack*' },
                    { speaker: 'Ryan', text: 'Meshtastic node — LoRa mesh network. No infrastructure needed.' },
                    { speaker: 'Ryan', text: 'Messages hop node-to-node. Range: several kilometres per hop.' },
                    { speaker: 'Ryan', text: 'This little decoy will broadcast dummy traffic on 868 MHz.' },
                    { speaker: 'Ryan', text: 'If they\'re scanning for signals, they\'ll investigate THIS spot.' },
                    { speaker: '', text: '*Secures the Pi under bark. Green LED pulses.*' },
                    { speaker: 'Ryan', text: 'Decoy is live. Now I move — quiet and fast.' }
                ], () => {
                    s.decoyPlaced = true;
                    game.setFlag('meshtastic_decoy_placed', true);
                    game.showNotification('Meshtastic decoy deployed');

                    // Advance to phase 2 after a beat
                    setTimeout(() => {
                        DroneHuntScene._startPhase2(game);
                    }, 2500);
                });
            }
        },

        /* ── BACKPACK — Equipment check (all phases) ─── */
        {
            id: 'backpack',
            name: 'Backpack',
            // Near cabin — matches SVG translate(460,625)
            x: (460 / 1920) * 100,
            y: (625 / 1080) * 100,
            width: (40 / 1920) * 100,
            height: (45 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                const s = DroneHuntScene.state;

                if (s.phase >= 3 && !s.hackrfReady) {
                    // Phase 3: pull out HackRF
                    game.startDialogue([
                        { speaker: '', text: '*Ryan kneels beside the backpack*' },
                        { speaker: 'Ryan', text: 'HackRF One. Open-source SDR. 1 MHz to 6 GHz.' },
                        { speaker: 'Ryan', text: 'Can transmit AND receive. That\'s the key.' },
                        { speaker: 'Ryan', text: 'Those DJI drones use civilian GPS — L1 C/A signal.' },
                        { speaker: 'Ryan', text: 'No authentication. No encryption. Wide open.' },
                        { speaker: '', text: '*Connects the antenna. Green LED illuminates.*' },
                        { speaker: 'Ryan', text: 'All I need is the right frequency, power level, and target coordinates.' },
                        { speaker: 'Ryan', text: 'Let\'s bring these things down.' }
                    ], () => {
                        s.hackrfReady = true;
                        game.setFlag('hackrf_ready', true);
                        game.showNotification('HackRF One activated');
                    });
                } else if (s.phase < 3) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My gear. HackRF One, laptop, Flipper Zero, cables.' },
                        { speaker: 'Ryan', text: 'Not yet. First things first.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'HackRF is powered up and ready.' },
                        { speaker: 'Ryan', text: 'Need to configure the spoof parameters.' }
                    ]);
                }
            }
        },

        /* ── TREE COVER — Hide from thermal sweep (Phase 2) ─── */
        {
            id: 'tree_cover',
            name: 'Dense Pines',
            // Left area, near treeline
            x: 2,
            y: 40,
            width: 10,
            height: 18,
            cursor: 'pointer',
            enabled: (game) => {
                const s = DroneHuntScene.state;
                return s.phase === 2 && !s.hiddenFromScan;
            },
            action: function(game) {
                const s = DroneHuntScene.state;
                game.startDialogue([
                    { speaker: '', text: '*A searchlight sweeps across the heide*' },
                    { speaker: 'Ryan', text: 'MOVE!' },
                    { speaker: '', text: '*Dives behind thick pine trunks*' },
                    { speaker: '', text: '*The drone hovers — FLIR camera rotating*' },
                    { speaker: 'Ryan', text: 'Thermal imaging. Body heat shows up like a beacon at 37°C.' },
                    { speaker: 'Ryan', text: 'But pine needles scatter infrared. Dense canopy helps.' },
                    { speaker: '', text: '*Holding breath. Drone passes overhead. Searchlight moves on.*' },
                    { speaker: 'Ryan', text: '...It\'s moving toward the decoy. The Meshtastic signal worked.' },
                    { speaker: 'Ryan', text: 'But it\'ll come back. More are coming.' },
                    { speaker: 'Ryan', text: 'I need to deal with these drones. Permanently.' }
                ], () => {
                    s.hiddenFromScan = true;
                    game.setFlag('survived_thermal_scan', true);
                    game.showNotification('Survived thermal scan');

                    setTimeout(() => {
                        DroneHuntScene._startPhase3(game);
                    }, 2000);
                });
            }
        },

        /* ── DRONE OVERHEAD — Observe / analyse (Phase 2-3) ─── */
        {
            id: 'drone_overhead',
            name: 'Surveillance Drone',
            // Upper area — the animated drones pass through here
            x: 30,
            y: 5,
            width: 40,
            height: 18,
            cursor: 'look',
            action: function(game) {
                const s = DroneHuntScene.state;
                if (s.phase < 2) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'I can hear rotors in the distance. Not close yet.' },
                        { speaker: 'Ryan', text: 'Set up the decoy first.' }
                    ]);
                } else if (s.phase === 2 && !s.hiddenFromScan) {
                    game.startDialogue([
                        { speaker: '', text: '*Drone searchlight sweeps dangerously close*' },
                        { speaker: 'Ryan', text: 'DJI Matrice series. Commercial quadcopter.' },
                        { speaker: 'Ryan', text: 'FLIR thermal camera. Probably Zenmuse XT2.' },
                        { speaker: 'Ryan', text: 'Human body at 37°C against cold moorland...' },
                        { speaker: 'Ryan', text: 'I need cover. NOW. Those pine trees!' }
                    ]);
                } else if (!s.spoofExecuted) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'DJI platform. Civilian GPS receiver. No SAASM.' },
                        { speaker: 'Ryan', text: 'Uses L1 C/A at 1575.42 MHz. Coarse/Acquisition code.' },
                        { speaker: 'Ryan', text: 'Zero authentication. Strongest signal wins.' },
                        { speaker: 'Ryan', text: 'The HackRF can overpower real satellites from the ground.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The swamp can have them.' }
                    ]);
                }
            }
        },

        /* ── HACKRF DEVICE — GPS frequency dial (Phase 3) ─── */
        {
            id: 'gps_frequency',
            name: 'GPS Frequency',
            // Lower center — puzzle interaction area
            x: 35,
            y: 75,
            width: 12,
            height: 10,
            cursor: 'pointer',
            enabled: (game) => {
                const s = DroneHuntScene.state;
                return s.phase === 3 && s.hackrfReady && !s.frequencySet;
            },
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'GPS L1 civilian frequency. I know this cold.' },
                    { speaker: 'Ryan', text: 'C/A code — Coarse/Acquisition. The one civilian receivers use.' },
                    { speaker: 'Ryan', text: 'Military P(Y) code is encrypted. But L1 C/A? Wide open.' }
                ], () => {
                    // Password puzzle: enter GPS L1 frequency
                    if (game.passwordPuzzle) {
                        game.passwordPuzzle.show({
                            id: 'gps_l1_frequency',
                            title: '📡 GPS L1 C/A Frequency',
                            description: 'Set the HackRF transmit frequency to the GPS L1 Civilian (C/A) signal.<br><br>This is the frequency all civilian GPS receivers listen on.<br>Format: four digits, dot, two digits — in MHz.',
                            correctAnswer: ['1575.42', '1575,42'],
                            hint: 'GPS L1 C/A operates at 1575.42 MHz. All civilian receivers — including drone navigation — use this frequency.',
                            placeholder: 'Enter frequency in MHz...',
                            inputType: 'text',
                            maxAttempts: 5,
                            onSuccess: (g) => {
                                const s = DroneHuntScene.state;
                                s.frequencySet = true;
                                game.setFlag('gps_frequency_set', true);
                                game.showNotification('Frequency locked: 1575.42 MHz');
                                game.startDialogue([
                                    { speaker: '', text: '*HackRF display: TX FREQ 1575.42 MHz — LOCKED*' },
                                    { speaker: 'Ryan', text: '1575.42 MHz. GPS L1 C/A. Locked and loaded.' },
                                    { speaker: 'Ryan', text: 'Now: transmit power. Too high and every receiver for miles knows. Too low and the drones ignore it.' }
                                ]);
                                DroneHuntScene._checkSpoofReady(game);
                            },
                            onFailure: (g) => {
                                game.startDialogue([
                                    { speaker: 'Ryan', text: 'That\'s not right. Think. GPS L1 civilian frequency...' },
                                    { speaker: 'Ryan', text: 'Every GPS receiver in the world listens on this one frequency.' }
                                ]);
                            }
                        });
                    }
                });
            }
        },

        /* ── POWER LEVEL — TX power calibration (Phase 3) ─── */
        {
            id: 'power_level',
            name: 'Transmit Power',
            // Near the frequency dial
            x: 50,
            y: 75,
            width: 12,
            height: 10,
            cursor: 'pointer',
            enabled: (game) => {
                const s = DroneHuntScene.state;
                return s.phase === 3 && s.hackrfReady && !s.powerSet;
            },
            action: function(game) {
                const s = DroneHuntScene.state;
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Transmit power. Critical parameter.' },
                    { speaker: 'Ryan', text: 'Real GPS satellites are 20,200 km up. Their signal is WEAK by the time it reaches ground.' },
                    { speaker: 'Ryan', text: 'HackRF maximum is about 15 dBm. Roughly 30 milliwatts.' },
                    { speaker: 'Ryan', text: 'The drones are maybe 100 meters up. I need just enough to overpower the real signal.' },
                    { speaker: 'Ryan', text: 'Set it to about -5 dBm. Subtle. Believable. Like a slightly stronger satellite.' }
                ], () => {
                    if (game.passwordPuzzle) {
                        game.passwordPuzzle.show({
                            id: 'tx_power_level',
                            title: '⚡ Transmit Power Calibration',
                            description: 'Set HackRF transmit power to overpower GPS satellites but stay subtle.<br><br>Real GPS signal strength at ground level: about -130 dBm<br>HackRF max output: +15 dBm<br><br>You need just enough to be the strongest "satellite" without being obvious.<br>Format: negative number in dBm.',
                            correctAnswer: ['-5', '-5 dBm', '-5dBm', '-10', '-10 dBm'],
                            hint: 'GPS satellite signals arrive at about -130 dBm. A subtle spoof from 100m away needs roughly -5 to -10 dBm. Enough to win, not enough to scream.',
                            placeholder: 'Enter power in dBm...',
                            inputType: 'text',
                            maxAttempts: 5,
                            onSuccess: (g) => {
                                s.powerSet = true;
                                game.setFlag('tx_power_set', true);
                                game.showNotification('TX power calibrated');
                                game.startDialogue([
                                    { speaker: '', text: '*HackRF display: TX POWER -5 dBm — CALIBRATED*' },
                                    { speaker: 'Ryan', text: 'Subtle. The drones\' receivers will accept this as a legitimate satellite.' },
                                    { speaker: 'Ryan', text: 'Now: WHERE to send them. Target coordinates.' }
                                ]);
                                DroneHuntScene._checkSpoofReady(game);
                            },
                            onFailure: (g) => {
                                game.startDialogue([
                                    { speaker: 'Ryan', text: 'Not quite. I need a signal strong enough to overpower real GPS, but subtle.' },
                                    { speaker: 'Ryan', text: 'Think: negative dBm range. Single digits. Just a whisper louder than reality.' }
                                ]);
                            }
                        });
                    }
                });
            }
        },

        /* ── SPOOF TARGET — Choose coordinates (Phase 3) ─── */
        {
            id: 'spoof_target',
            name: 'Target Coordinates',
            // Right side, toward swamp
            x: 65,
            y: 72,
            width: 14,
            height: 10,
            cursor: 'pointer',
            enabled: (game) => {
                const s = DroneHuntScene.state;
                return s.phase === 3 && s.hackrfReady && !s.targetSet;
            },
            action: function(game) {
                const s = DroneHuntScene.state;
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Where to send them... The swamp. 200 meters south.' },
                    { speaker: 'Ryan', text: 'Soft ground, standing water, reeds. Perfect drone graveyard.' },
                    { speaker: 'Ryan', text: 'The spoof will convince them they\'re drifting NORTH of their patrol zone.' },
                    { speaker: 'Ryan', text: 'Their autopilot will "correct" by flying south — straight into the bog.' }
                ], () => {
                    if (game.passwordPuzzle) {
                        game.passwordPuzzle.show({
                            id: 'spoof_coordinates',
                            title: '🎯 Spoof Target Coordinates',
                            description: 'The drones patrol at your position. You want to spoof a location that makes them think they\'re 200m too far NORTH.<br><br>Their autopilot will compensate by flying SOUTH — toward the swamp.<br><br>How many meters should the spoofed position differ from reality?',
                            correctAnswer: ['200', '200m', '200 m', '200 meters'],
                            hint: 'Spoof the GPS to show them 200m north of reality. Their autopilot auto-corrects south — into the swamp.',
                            placeholder: 'Offset in meters...',
                            inputType: 'text',
                            maxAttempts: 5,
                            onSuccess: (g) => {
                                s.targetSet = true;
                                game.setFlag('spoof_target_set', true);
                                game.showNotification('Target coordinates locked');
                                game.startDialogue([
                                    { speaker: '', text: '*HackRF display: SPOOF OFFSET +200m NORTH — TARGET LOCKED*' },
                                    { speaker: '', text: '*The swamp pools glint coldly in the moonlight*' },
                                    { speaker: 'Ryan', text: '200 meters. Into the bog. Let\'s see them fly out of that.' }
                                ]);
                                DroneHuntScene._checkSpoofReady(game);
                            },
                            onFailure: (g) => {
                                game.startDialogue([
                                    { speaker: 'Ryan', text: 'Think about the distance. Not too far — they\'d reject a sudden jump.' },
                                    { speaker: 'Ryan', text: 'The swamp is about 200 meters south. Just enough to trap them.' }
                                ]);
                            }
                        });
                    }
                });
            }
        },

        /* ── EXECUTE SPOOF — Launch the attack (Phase 3→4) ─── */
        {
            id: 'execute_spoof',
            name: 'Execute GPS Spoof',
            // Center-bottom, prominent action
            x: 42,
            y: 82,
            width: 16,
            height: 8,
            cursor: 'pointer',
            enabled: (game) => {
                const s = DroneHuntScene.state;
                return s.phase === 3 && s.frequencySet && s.powerSet && s.targetSet && !s.spoofExecuted;
            },
            action: function(game) {
                DroneHuntScene._executeSpoof(game);
            }
        },

        /* ── FOREST PATH — Proceed to facility (Phase 5) ─── */
        {
            id: 'forest_path',
            name: 'Path to Facility',
            // Right edge, toward the dirt track
            x: 82,
            y: 50,
            width: 16,
            height: 30,
            cursor: 'exit',
            enabled: (game) => {
                return DroneHuntScene.state.phase === 5;
            },
            action: function(game) {
                game.startDialogue([
                    { speaker: '', text: '*Distant rotor sounds have gone silent. The path is clear.*' },
                    { speaker: 'Ryan', text: 'Drones are down. The way through is open.' },
                    { speaker: 'Ryan', text: 'Two kilometres through the forest. Then the fence.' },
                    { speaker: 'Ryan', text: 'Eva said north entrance. Badge under the trash bin.' },
                    { speaker: 'Ryan', text: 'Let\'s end this.' }
                ], () => {
                    game.advanceTime(15);
                    game.loadScene('facility');
                });
            }
        },

        /* ── HUNTING CABIN — Atmospheric look (all phases) ─── */
        {
            id: 'cabin',
            name: 'Hunting Cabin',
            // SVG translate(280,520), cabin body 0-160 wide, -20 to 130 tall
            x: (280 / 1920) * 100,
            y: (500 / 1080) * 100,
            width: (175 / 1920) * 100,
            height: (155 / 1080) * 100,
            cursor: 'look',
            action: function(game) {
                const s = DroneHuntScene.state;
                if (s.phase <= 2) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Old jagdhütte. Hunting cabin. Abandoned.' },
                        { speaker: 'Ryan', text: 'Good cover from aerial surveillance. Thick walls, solid roof.' },
                        { speaker: 'Ryan', text: 'Someone left a light on. Or a timer. Doesn\'t matter.' },
                        { speaker: 'Ryan', text: 'This is my staging point. Backpack\'s inside.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The cabin. My little fortress in the heide.' },
                        { speaker: 'Ryan', text: 'Thank whoever built this a hundred years ago.' }
                    ]);
                }
            }
        },

        /* ── SWAMP — Atmospheric look (all phases) ─── */
        {
            id: 'swamp',
            name: 'Swamp Pools',
            // SVG translate(550,700), rx=200
            x: (350 / 1920) * 100,
            y: (660 / 1080) * 100,
            width: (400 / 1920) * 100,
            height: (80 / 1080) * 100,
            cursor: 'look',
            action: function(game) {
                const s = DroneHuntScene.state;
                if (s.dronesDown) {
                    game.startDialogue([
                        { speaker: '', text: '*Broken drone rotors protrude from the dark water*' },
                        { speaker: 'Ryan', text: 'GPS spoofing. Civilian drones never stood a chance.' },
                        { speaker: 'Ryan', text: '1575.42 MHz. No authentication. Game over.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Moorland bog. Dark water. Bottomless muck.' },
                        { speaker: 'Ryan', text: 'Not where you want to crash-land a quadcopter.' },
                        { speaker: 'Ryan', text: '...Actually, that\'s EXACTLY where I want them to land.' }
                    ]);
                }
            }
        },

        /* ── FACILITY GLOW — Look at distant facility ─── */
        {
            id: 'facility_glow',
            name: 'Facility Lights',
            // Upper-right — red glow area
            x: 80,
            y: 30,
            width: 18,
            height: 15,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Red lights through the trees. Tower beacons pulsing.' },
                    { speaker: 'Ryan', text: 'Steckerdoser Heide. Bundeswehr research facility.' },
                    { speaker: 'Ryan', text: 'Volkov is in there. Running his operation.' },
                    { speaker: 'Ryan', text: 'Two kilometres of forest and a fence between me and the truth.' }
                ]);
            }
        }
    ],

    // ─── Scene entry ─────────────────────────────────────────
    onEnter: (game) => {
        const s = DroneHuntScene.state;

        // Reset state on entry
        s.phase = 1;
        s.decoyPlaced = false;
        s.hiddenFromScan = false;
        s.hackrfReady = false;
        s.frequencySet = false;
        s.powerSet = false;
        s.targetSet = false;
        s.spoofExecuted = false;
        s.dronesDown = false;

        game.setFlag('drone_hunt_started', true);

        game.showNotification('Steckerdoser Heide — Forest');

        setTimeout(() => {
            game.startDialogue([
                { speaker: '', text: '*2 km from the facility. The Volvo is hidden behind a berm.*' },
                { speaker: '', text: '*Cold October wind sweeps across dark moorland. Heather crunches underfoot.*' },
                { speaker: 'Ryan', text: 'This is as close as I can drive. Rest of the way is on foot.' },
                { speaker: 'Ryan', text: 'First thing: set up the Meshtastic decoy. Draw attention to the wrong spot.' },
                { speaker: '', text: '*Distant hum of rotors. Drone patrol. They\'re already flying.*' },
                { speaker: 'Ryan', text: 'They\'ve got drones up. Thermal cameras. Searchlights.' },
                { speaker: 'Ryan', text: 'Good thing I brought the HackRF.' },
                { speaker: 'Ryan', text: 'Find the fallen tree. Set the decoy. Then deal with those drones.' }
            ]);
        }, 1000);

        // Quest
        if (!game.questManager.hasQuest('evade_drones')) {
            game.addQuest({
                id: 'evade_drones',
                name: 'Evade the Drones',
                description: 'Volkov\'s surveillance drones patrol the forest with thermal cameras. Use your HackRF One to spoof their GPS and clear the path to the facility.',
                hint: 'Set up the Meshtastic decoy on the fallen tree first.'
            });
        }
    },

    // ─── Scene exit ──────────────────────────────────────────
    onExit: () => {
        // Cleanup
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE TRANSITIONS (private-ish helpers)
    // ═══════════════════════════════════════════════════════════

    /** Phase 2: Drone detected — hide from thermal scan */
    _startPhase2: (game) => {
        const s = DroneHuntScene.state;
        s.phase = 2;

        game.startDialogue([
            { speaker: '', text: '*BUZZZZZZ — rotor noise swells overhead*' },
            { speaker: '', text: '*A searchlight beam slashes across the moorland*' },
            { speaker: 'Ryan', text: 'Drone! They found the decoy signal — but they\'re sweeping wide!' },
            { speaker: '', text: '*Thermal camera rotates. White-hot beam scanning.*' },
            { speaker: 'Ryan', text: 'FLIR thermal imaging. My body heat is 37°C against cold heather.' },
            { speaker: 'Ryan', text: 'I\'m a glowing target. Need to get behind those pine trees — NOW!' }
        ]);
    },

    /** Phase 3: HackRF time — configure spoof parameters */
    _startPhase3: (game) => {
        const s = DroneHuntScene.state;
        s.phase = 3;

        game.startDialogue([
            { speaker: '', text: '*Three more drones converge. The sky buzzes with rotors.*' },
            { speaker: 'Ryan', text: 'Multiple contacts. They\'re running a search grid.' },
            { speaker: 'Ryan', text: 'The decoy bought time but they\'re methodical. They\'ll find me.' },
            { speaker: 'Ryan', text: 'Unless...' },
            { speaker: '', text: '*Glances at the backpack near the cabin*' },
            { speaker: 'Ryan', text: 'HackRF One. GPS spoofing. These are commercial DJI drones.' },
            { speaker: 'Ryan', text: 'Civilian GPS — L1 C/A signal at 1575.42 MHz. Zero authentication.' },
            { speaker: 'Ryan', text: 'If I broadcast a stronger GPS signal than the real satellites...' },
            { speaker: 'Ryan', text: 'Their navigation will believe MY coordinates over reality.' },
            { speaker: 'Ryan', text: 'Backpack. HackRF. Let\'s do this.' }
        ], () => {
            game.showNotification('Configure the HackRF to spoof GPS signals');
        });
    },

    /** Check if all three spoof parameters are set */
    _checkSpoofReady: (game) => {
        const s = DroneHuntScene.state;
        if (s.frequencySet && s.powerSet && s.targetSet) {
            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: '*HackRF display: ALL PARAMETERS SET*' },
                    { speaker: '', text: '*FREQ: 1575.42 MHz | PWR: -5 dBm | OFFSET: +200m N*' },
                    { speaker: 'Ryan', text: 'Frequency. Power. Target. Everything\'s locked.' },
                    { speaker: 'Ryan', text: 'One button. One press. These drones go into the swamp.' },
                    { speaker: 'Ryan', text: 'Execute the spoof.' }
                ], () => {
                    game.showNotification('All parameters set — Execute the GPS spoof!');
                });
            }, 1500);
        }
    },

    /** Phase 4: Execute the spoof — cinematic sequence */
    _executeSpoof: (game) => {
        const s = DroneHuntScene.state;
        s.spoofExecuted = true;
        s.phase = 4;
        game.setFlag('gps_spoof_executed', true);

        game.startDialogue([
            { speaker: '', text: '*Ryan\'s finger hovers over the TRANSMIT key*' },
            { speaker: 'Ryan', text: '1575.42 MHz. Minus five dBm. Two hundred metres north offset.' },
            { speaker: 'Ryan', text: 'Here goes everything.' },
            { speaker: '', text: '*PRESS*' },
            { speaker: '', text: '* * *' },
            { speaker: '', text: '*The HackRF\'s green LED blazes. Fake GPS signals flood the frequency.*' },
            { speaker: '', text: '*For one heartbeat — nothing happens.*' },
            { speaker: '', text: '*Then — the lead drone STUTTERS. Its searchlight swings wild.*' },
            { speaker: 'Ryan', text: 'It\'s working. The nav system is accepting the spoofed coordinates.' },
            { speaker: '', text: '*One by one, the drones\' flight paths warp. South. Toward the swamp.*' },
            { speaker: '', text: '*Their autopilots "correct" for a position error that doesn\'t exist.*' },
            { speaker: '', text: '*SPLASH — the first drone clips the reeds and tumbles into brackish water*' },
            { speaker: '', text: '*CRACK — a second hits a dead pine, rotors shattering, spiralling down*' },
            { speaker: '', text: '*The third banks hard, fighting its own navigation — THUD — into the bog*' },
            { speaker: 'Ryan', text: 'Yes! YES!' },
            { speaker: '', text: '*The fourth drone — high altitude spotter — wobbles, then drifts south*' },
            { speaker: '', text: '*Its red navigational light fades into the darkness over the swamp*' },
            { speaker: '', text: '*Silence. For the first time in minutes, true silence.*' },
            { speaker: 'Ryan', text: '...' },
            { speaker: 'Ryan', text: 'GPS spoofing. No encryption, no authentication, no chance.' },
            { speaker: 'Ryan', text: 'That\'s why military uses P(Y) code and SAASM. Civilians don\'t.' },
            { speaker: 'Ryan', text: 'Four drones. Four million euros of Volkov\'s hardware. In the mud.' }
        ], () => {
            s.dronesDown = true;
            s.phase = 5;
            game.setFlag('drones_eliminated', true);

            game.questManager.updateProgress('evade_drones', 'drones_spoofed');
            game.completeQuest('evade_drones');
            game.showNotification('Drones eliminated — path to facility clear');

            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The forest is quiet. The path ahead is clear.' },
                    { speaker: 'Ryan', text: 'Two kilometres to the facility fence.' },
                    { speaker: 'Ryan', text: 'For Klaus Weber. For Eva. For everyone.' },
                    { speaker: 'Ryan', text: 'Let\'s finish this.' }
                ]);
            }, 3000);
        });
    }
};

// Register scene
if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(DroneHuntScene);
}
