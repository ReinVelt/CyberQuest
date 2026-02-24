/**
 * Scene: Laser Corridor — Security Gauntlet
 * ═══════════════════════════════════════════════════════════
 * Underground corridor beneath the Steckerdoser Heide facility.
 * Three layers of automated security must be defeated using
 * hacking tools collected throughout the game.
 *
 * Phases:
 *   1. Laser Grid Analysis (Flipper Zero IR — puzzle: 38 kHz)
 *   2. Motion Sensor Bypass (HackRF ultrasonic jam — puzzle: 40 kHz)
 *   3. Biometric Override (Eva's code — puzzle: 2847)
 *   4. Entry — transition to facility_server
 * ═══════════════════════════════════════════════════════════
 */

const LaserCorridorScene = {
    id: 'laser_corridor',
    name: 'Basement Level B — Security Corridor',

    background: 'assets/images/scenes/laser_corridor.svg',

    description: 'A concrete corridor deep beneath the facility. Red laser beams criss-cross the passage. Motion sensor pods pulse on the ceiling. A heavy steel door blocks the server room.',

    playerStart: { x: 8, y: 88 },

    idleThoughts: [
        'Laser grid. Motion sensors. Biometric lock. Three layers.',
        'Classic defence-in-depth. But every system has a weakness.',
        'Flipper Zero handles IR. HackRF handles RF. Brain handles the rest.',
        'Eva\'s code. 2847. Don\'t forget it.',
        'Those sparks don\'t look safe.',
        'Steam from the pipes. Like a movie set down here.',
        'Volkov spent serious money on this corridor.',
        'Standard IR modulation. Should be 38 kHz.'
    ],

    // ── Scene state ──────────────────────────────────────────
    state: {
        phase: 1,
        // Phase 1: Laser Grid
        laserAnalysed: false,
        laserFrequencySet: false,
        lasersDisabled: false,
        // Phase 2: Motion Sensors
        sensorsAnalysed: false,
        jamFrequencySet: false,
        sensorsDisabled: false,
        // Phase 3: Biometric
        panelActivated: false,
        codeEntered: false,
        doorUnlocked: false
    },

    // ── Hotspots ─────────────────────────────────────────────
    hotspots: [

        /* ═══ LASER GRID — Phase 1 ═══════════════════════════ */
        {
            id: 'laser_grid',
            name: 'Laser Grid',
            x: 25,
            y: 30,
            width: 50,
            height: 35,
            cursor: 'look',
            action: function(game) {
                const s = LaserCorridorScene.state;
                if (s.lasersDisabled) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Lasers are down. Emitters dark. Safe to pass.' }
                    ]);
                } else if (s.laserAnalysed) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'IR laser grid. Modulated at 38 kHz.' },
                        { speaker: 'Ryan', text: 'Flipper Zero can replay the shutdown command.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: '', text: '*Red beams slice through the corridor — sweeping, pulsing, lethal*' },
                        { speaker: 'Ryan', text: 'Laser tripwire grid. Industrial security.' },
                        { speaker: 'Ryan', text: 'IR emitters on both walls. Break a beam and alarms go off.' },
                        { speaker: 'Ryan', text: 'Five beams. Some sweeping, one vertical slicer.' },
                        { speaker: 'Ryan', text: 'No way through physically. Need to shut them down.' },
                        { speaker: 'Ryan', text: 'If I can find the control frequency, the Flipper Zero can replay a shutdown.' }
                    ]);
                }
            }
        },

        /* ── FLIPPER ZERO SCAN — Analyse + puzzle ─────────── */
        {
            id: 'flipper_zero_scan',
            name: 'Flipper Zero',
            x: 5,
            y: 65,
            width: 12,
            height: 12,
            cursor: 'pointer',
            enabled: (game) => {
                const s = LaserCorridorScene.state;
                return s.phase === 1 && !s.lasersDisabled;
            },
            action: function(game) {
                const s = LaserCorridorScene.state;

                if (!s.laserAnalysed) {
                    // First interaction: analyse
                    game.startDialogue([
                        { speaker: '', text: '*Ryan pulls the Flipper Zero from his jacket*' },
                        { speaker: 'Ryan', text: 'Flipper Zero. Swiss army knife for hackers.' },
                        { speaker: 'Ryan', text: 'IR transceiver, RFID, sub-GHz radio, GPIO — all in one.' },
                        { speaker: '', text: '*Points the IR receiver at the nearest emitter*' },
                        { speaker: 'Ryan', text: 'The emitters use modulated infrared. Like a TV remote on steroids.' },
                        { speaker: 'Ryan', text: 'Standard consumer IR operates at 38 kHz modulation.' },
                        { speaker: 'Ryan', text: 'Military would use non-standard frequencies. But Volkov cut corners.' },
                        { speaker: 'Ryan', text: 'Let me capture the signal and replay the shutdown command.' },
                        { speaker: 'Ryan', text: 'First: set the IR demodulation frequency on the Flipper.' }
                    ], () => {
                        s.laserAnalysed = true;
                        game.setFlag('laser_grid_analysed', true);
                        game.showNotification('Flipper Zero IR receiver active');
                        // Now show the puzzle
                        setTimeout(() => {
                            LaserCorridorScene._showLaserPuzzle(game);
                        }, 1000);
                    });
                } else if (!s.laserFrequencySet) {
                    // Already analysed, show puzzle again
                    LaserCorridorScene._showLaserPuzzle(game);
                } else if (!s.lasersDisabled) {
                    // Frequency set, execute shutdown
                    LaserCorridorScene._disableLasers(game);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Flipper did its job. Lasers are history.' }
                    ]);
                }
            }
        },

        /* ═══ MOTION SENSORS — Phase 2 ═══════════════════════ */
        {
            id: 'motion_sensors',
            name: 'Motion Sensors',
            x: 30,
            y: 18,
            width: 40,
            height: 12,
            cursor: 'look',
            action: function(game) {
                const s = LaserCorridorScene.state;
                if (s.phase < 2) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Sensor pods on the ceiling. Currently dormant.' },
                        { speaker: 'Ryan', text: 'Probably a backup system. Lasers first.' }
                    ]);
                } else if (s.sensorsDisabled) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Sensors are blind. HackRF jamming signal is doing its work.' }
                    ]);
                } else if (s.sensorsAnalysed) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Ultrasonic motion sensors. 40 kHz Doppler.' },
                        { speaker: 'Ryan', text: 'HackRF can flood that frequency with noise.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: '', text: '*The sensor pods\' LEDs shift from green to angry red*' },
                        { speaker: '', text: '*Faint ultrasonic pulsing — barely audible. Like tinnitus.*' },
                        { speaker: 'Ryan', text: 'Backup system activated. Ultrasonic motion sensors.' },
                        { speaker: 'Ryan', text: 'They send out 40 kHz sound pulses. Inaudible to most humans.' },
                        { speaker: 'Ryan', text: 'When the returning echo shifts in frequency — Doppler effect — they know something moved.' },
                        { speaker: 'Ryan', text: 'Three pods. Overlapping coverage. No blind spots.' },
                        { speaker: 'Ryan', text: 'But if I flood 40 kHz with noise, the sensors can\'t distinguish echoes from garbage.' },
                        { speaker: 'Ryan', text: 'HackRF One. Time to jam.' }
                    ], () => {
                        s.sensorsAnalysed = true;
                        game.setFlag('motion_sensors_analysed', true);
                        game.showNotification('Sensor frequency identified — use HackRF');
                    });
                }
            }
        },

        /* ── HACKRF JAM — Jam sensors + puzzle ────────────── */
        {
            id: 'hackrf_jam',
            name: 'HackRF One',
            x: 5,
            y: 50,
            width: 12,
            height: 12,
            cursor: 'pointer',
            enabled: (game) => {
                const s = LaserCorridorScene.state;
                return s.phase === 2 && !s.sensorsDisabled;
            },
            action: function(game) {
                const s = LaserCorridorScene.state;

                if (!s.sensorsAnalysed) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'HackRF One. But I need to know what I\'m jamming first.' },
                        { speaker: 'Ryan', text: 'Check the sensors — identify the frequency.' }
                    ]);
                } else if (!s.jamFrequencySet) {
                    game.startDialogue([
                        { speaker: '', text: '*Ryan connects the antenna to the HackRF*' },
                        { speaker: 'Ryan', text: 'HackRF One. 1 MHz to 6 GHz. Transmit and receive.' },
                        { speaker: 'Ryan', text: 'Those sensors use ultrasonic — technically sound, not radio.' },
                        { speaker: 'Ryan', text: 'But the HackRF drives a piezo transducer through the GPIO pins.' },
                        { speaker: 'Ryan', text: 'Improvised ultrasonic jammer. Set the frequency and blast noise.' }
                    ], () => {
                        LaserCorridorScene._showSensorPuzzle(game);
                    });
                } else if (!s.sensorsDisabled) {
                    LaserCorridorScene._disableSensors(game);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'HackRF jamming at 40 kHz. Sensors are deaf.' }
                    ]);
                }
            }
        },

        /* ═══ BIOMETRIC PANEL — Phase 3 ═══════════════════════ */
        {
            id: 'biometric_panel',
            name: 'Biometric Panel',
            // Near far-right wall, by the door
            x: 65,
            y: 35,
            width: 8,
            height: 12,
            cursor: 'pointer',
            enabled: (game) => {
                const s = LaserCorridorScene.state;
                return s.phase >= 3;
            },
            action: function(game) {
                const s = LaserCorridorScene.state;

                if (s.phase < 3) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Biometric panel. Can\'t reach it yet — lasers in the way.' }
                    ]);
                } else if (s.doorUnlocked) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Panel shows green. Door is unlocked.' }
                    ]);
                } else if (!s.panelActivated) {
                    game.startDialogue([
                        { speaker: '', text: '*Ryan approaches the biometric panel beside the steel door*' },
                        { speaker: 'Ryan', text: 'Fingerprint scanner with keypad override.' },
                        { speaker: 'Ryan', text: 'The scanner wants an enrolled print. I\'m not in the system.' },
                        { speaker: 'Ryan', text: 'But Eva said there\'s an override code. Emergency maintenance access.' },
                        { speaker: 'Ryan', text: 'She sent it via Meshtastic earlier. Let me check...' },
                        { speaker: '', text: '*Glances at the Meshtastic log on his phone*' },
                        { speaker: 'Eva (Mesh)', text: 'Override code: 2847' },
                        { speaker: 'Ryan', text: '2847. Right. Let\'s try the keypad.' }
                    ], () => {
                        s.panelActivated = true;
                        game.setFlag('biometric_panel_activated', true);
                        LaserCorridorScene._showBiometricPuzzle(game);
                    });
                } else if (!s.codeEntered) {
                    LaserCorridorScene._showBiometricPuzzle(game);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Code accepted. The door is ready.' }
                    ]);
                }
            }
        },

        /* ═══ SERVER DOOR — Final exit (Phase 4) ═════════════ */
        {
            id: 'server_door',
            name: 'Server Room Door',
            x: 38,
            y: 28,
            width: 24,
            height: 38,
            cursor: 'pointer',
            action: function(game) {
                const s = LaserCorridorScene.state;

                if (s.doorUnlocked && s.phase === 4) {
                    // Enter the server room
                    game.startDialogue([
                        { speaker: '', text: '*Ryan grips the massive handle and pulls*' },
                        { speaker: '', text: '*The steel door swings open with a deep mechanical groan*' },
                        { speaker: '', text: '*Cold air rushes out. The hum of server fans. Blinking LEDs in the darkness.*' },
                        { speaker: 'Ryan', text: 'The server room. This is it.' },
                        { speaker: 'Ryan', text: 'Weber\'s evidence. Volkov\'s secrets. Everything is in there.' },
                        { speaker: 'Ryan', text: 'For Klaus. For Eva. For everyone Volkov crushed.' },
                        { speaker: '', text: '*Steps through the threshold*' }
                    ], () => {
                        game.setFlag('laser_corridor_complete', true);
                        game.loadScene('facility_server');
                    });
                } else if (s.doorUnlocked) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Door is unlocked. Ready to enter the server room.' }
                    ]);
                } else if (s.phase >= 3) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: '"SERVER RAUM". Heavy steel. Reinforced.' },
                        { speaker: 'Ryan', text: 'Need to crack the biometric panel first.' }
                    ]);
                } else if (s.phase === 2) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Can\'t approach. Motion sensors would trigger.' },
                        { speaker: 'Ryan', text: 'Deal with the sensors first.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Heavy door at the end. "SERVER RAUM" stencilled on steel.' },
                        { speaker: 'Ryan', text: 'Not going anywhere near it with those lasers active.' }
                    ]);
                }
            }
        },

        /* ═══ ATMOSPHERIC HOTSPOTS ════════════════════════════ */

        {
            id: 'security_camera_broken',
            name: 'Broken Camera',
            x: 48,
            y: 22,
            width: 6,
            height: 6,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Security camera. Disabled. Wire dangling.' },
                    { speaker: 'Ryan', text: 'Eva\'s work? Or someone else doesn\'t want eyes down here.' },
                    { speaker: 'Ryan', text: 'Either way — one less thing to worry about.' }
                ]);
            }
        },

        {
            id: 'pipe_leak',
            name: 'Leaking Pipe',
            x: 12,
            y: 14,
            width: 10,
            height: 8,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: '', text: '*Water drips from a corroded pipe joint. Steam wisps drift across the corridor.*' },
                    { speaker: 'Ryan', text: 'Old infrastructure. This facility has layers of history.' },
                    { speaker: 'Ryan', text: 'Cold War bunker foundations, NATO upgrades, now Volkov\'s playground.' },
                    { speaker: 'Ryan', text: 'The pipes are sweating. Probably coolant for the servers below.' }
                ]);
            }
        },

        {
            id: 'cable_runs',
            name: 'Cable Bundles',
            x: 2,
            y: 2,
            width: 25,
            height: 6,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Fibre optic and Cat6A bundles. Thick ones.' },
                    { speaker: 'Ryan', text: 'Running from the surface down to the server room.' },
                    { speaker: 'Ryan', text: 'Multiple redundant paths. This place was built to stay online.' },
                    { speaker: 'Ryan', text: 'Weber knew what he found here. That\'s why they killed him.' }
                ]);
            }
        },

        {
            id: 'sparking_conduit',
            name: 'Sparking Conduit',
            x: 82,
            y: 18,
            width: 8,
            height: 8,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: '', text: '*CRACK — a spark arcs from the damaged junction box*' },
                    { speaker: 'Ryan', text: 'Damaged conduit. Exposed wiring.' },
                    { speaker: 'Ryan', text: 'Wouldn\'t want to touch that. 230 volts, European standard.' },
                    { speaker: 'Ryan', text: 'Adds to the ambience though. Very Hollywood.' }
                ]);
            }
        },

        {
            id: 'emergency_exit',
            name: '← Back to Stairs',
            x: 2,
            y: 85,
            width: 10,
            height: 12,
            cursor: 'exit',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                const s = LaserCorridorScene.state;
                if (s.phase >= 3) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Back up the stairs? Not a chance.' },
                        { speaker: 'Ryan', text: 'I\'m this close. The server room is RIGHT THERE.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'No. I didn\'t come this far to turn back.' },
                        { speaker: 'Ryan', text: 'Three layers of security. I have three hacker tools.' },
                        { speaker: 'Ryan', text: 'This is what I do.' }
                    ]);
                }
            }
        }
    ],

    // ═══════════════════════════════════════════════════════════
    // SCENE LIFECYCLE
    // ═══════════════════════════════════════════════════════════

    onEnter: (game) => {
        const s = LaserCorridorScene.state;

        // Reset state
        s.phase = 1;
        s.laserAnalysed = false;
        s.laserFrequencySet = false;
        s.lasersDisabled = false;
        s.sensorsAnalysed = false;
        s.jamFrequencySet = false;
        s.sensorsDisabled = false;
        s.panelActivated = false;
        s.codeEntered = false;
        s.doorUnlocked = false;

        game.setFlag('laser_corridor_entered', true);
        game.showNotification('Basement Level B — Security Corridor');

        setTimeout(() => {
            game.startDialogue([
                { speaker: '', text: '*Concrete stairs end. A heavy fire door opens into a long corridor.*' },
                { speaker: '', text: '*Red laser beams sweep back and forth. Emergency lights pulse crimson.*' },
                { speaker: '', text: '*Steam drifts from leaking pipes. Sparks arc from a damaged conduit.*' },
                { speaker: 'Ryan', text: '...Whoa.' },
                { speaker: 'Ryan', text: 'Laser tripwire grid. Motion sensors on the ceiling. Biometric lock on the door.' },
                { speaker: 'Ryan', text: 'Three layers of security. Classic defence-in-depth.' },
                { speaker: 'Ryan', text: 'Good thing I brought three hacking tools.' },
                { speaker: '', text: '*Pats the Flipper Zero in his jacket pocket*' },
                { speaker: 'Ryan', text: 'Flipper for the IR lasers. HackRF for the sensors. Eva\'s code for the door.' },
                { speaker: 'Ryan', text: 'One layer at a time. Start with the lasers.' }
            ]);
        }, 1200);

        // Quest
        if (!game.questManager.hasQuest('breach_corridor')) {
            game.addQuest({
                id: 'breach_corridor',
                name: 'Breach the Security Corridor',
                description: 'Three layers of automated security protect the server room. Defeat the laser grid, motion sensors, and biometric lock using your hacking tools.',
                hint: 'Use the Flipper Zero to analyse the laser grid\'s IR frequency.'
            });
        }
    },

    onExit: () => {
        // Cleanup
    },

    // ═══════════════════════════════════════════════════════════
    // PUZZLE HELPERS
    // ═══════════════════════════════════════════════════════════

    /** Phase 1 puzzle: IR modulation frequency */
    _showLaserPuzzle: (game) => {
        if (game.passwordPuzzle) {
            game.passwordPuzzle.show({
                id: 'ir_modulation_freq',
                title: '📡 IR Demodulation Frequency',
                description: 'Set the Flipper Zero\'s IR receiver to the correct demodulation frequency.<br><br>Consumer IR devices (remotes, sensors, security emitters) use a standard modulation frequency to distinguish signal from ambient light.<br><br>What is the standard IR carrier frequency in kHz?',
                correctAnswer: ['38', '38 kHz', '38kHz', '38khz'],
                hint: 'Standard consumer IR modulation: 38 kHz. Used by TV remotes, security sensors, and apparently — Volkov\'s laser grid.',
                placeholder: 'Frequency in kHz...',
                inputType: 'text',
                maxAttempts: 5,
                onSuccess: (g) => {
                    const s = LaserCorridorScene.state;
                    s.laserFrequencySet = true;
                    game.setFlag('ir_frequency_set', true);
                    game.showNotification('IR frequency locked: 38 kHz');
                    game.startDialogue([
                        { speaker: '', text: '*Flipper Zero display: IR DEMOD 38 kHz — SIGNAL CAPTURED*' },
                        { speaker: 'Ryan', text: '38 kHz. Standard consumer IR. Volkov cheaped out on security.' },
                        { speaker: 'Ryan', text: 'Flipper captured the emitter handshake. Now replay the shutdown sequence.' },
                        { speaker: 'Ryan', text: 'Use the Flipper again to transmit.' }
                    ]);
                },
                onFailure: (g) => {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Not that frequency. Think consumer electronics.' },
                        { speaker: 'Ryan', text: 'Every TV remote in the world uses this carrier frequency.' },
                        { speaker: 'Ryan', text: 'It\'s the de facto standard. 38...' }
                    ]);
                }
            });
        }
    },

    /** Phase 1 completion: disable lasers */
    _disableLasers: (game) => {
        const s = LaserCorridorScene.state;
        game.startDialogue([
            { speaker: '', text: '*Ryan points the Flipper Zero at the nearest emitter*' },
            { speaker: '', text: '*FLIPPER ZERO: REPLAYING IR SEQUENCE...*' },
            { speaker: '', text: '*The first laser beam flickers — and dies*' },
            { speaker: '', text: '*One by one, the red beams wink out*' },
            { speaker: '', text: '*The sweeping vertical slicer stutters, fades, goes dark*' },
            { speaker: '', text: '*Last beam — the floor tripwire — flickers twice, then nothing*' },
            { speaker: '', text: '*Darkness. The corridor\'s red haze fades to emergency lighting only.*' },
            { speaker: 'Ryan', text: 'All five beams down. Flipper Zero — the €200 skeleton key.' },
            { speaker: 'Ryan', text: '38 kilohertz. Same as a TV remote. Million-euro security system.' },
            { speaker: '', text: '*A soft whirring starts above — sensor pods activating*' },
            { speaker: 'Ryan', text: '...And there\'s the backup. Motion sensors just woke up.' }
        ], () => {
            s.lasersDisabled = true;
            s.phase = 2;
            game.setFlag('lasers_disabled', true);
            game.showNotification('Lasers disabled — motion sensors activated!');
        });
    },

    /** Phase 2 puzzle: ultrasonic jamming frequency */
    _showSensorPuzzle: (game) => {
        if (game.passwordPuzzle) {
            game.passwordPuzzle.show({
                id: 'ultrasonic_jam_freq',
                title: '🔊 Ultrasonic Jamming Frequency',
                description: 'Configure the HackRF\'s piezo transducer to jam the motion sensors.<br><br>The sensors use ultrasonic Doppler: they emit a carrier wave and listen for frequency shifts caused by movement.<br><br>What is the standard frequency for ultrasonic motion sensors in kHz?',
                correctAnswer: ['40', '40 kHz', '40kHz', '40khz'],
                hint: 'Standard ultrasonic sensors operate at 40 kHz. Same frequency as the popular HC-SR04 module used by hobbyists worldwide.',
                placeholder: 'Frequency in kHz...',
                inputType: 'text',
                maxAttempts: 5,
                onSuccess: (g) => {
                    const s = LaserCorridorScene.state;
                    s.jamFrequencySet = true;
                    game.setFlag('jam_frequency_set', true);
                    game.showNotification('Jamming frequency set: 40 kHz');
                    game.startDialogue([
                        { speaker: '', text: '*HackRF display: ULTRASONIC JAM 40 kHz — READY*' },
                        { speaker: 'Ryan', text: '40 kHz. Same as every HC-SR04 sensor on Amazon.' },
                        { speaker: 'Ryan', text: 'Flood the air with 40 kHz noise. Sensors can\'t hear their own echoes.' },
                        { speaker: 'Ryan', text: 'Activate the jammer.' }
                    ]);
                },
                onFailure: (g) => {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Not quite. Standard ultrasonic sensors. Think Arduino basics.' },
                        { speaker: 'Ryan', text: 'HC-SR04, SRF05... they all use the same frequency.' },
                        { speaker: 'Ryan', text: 'Forty-something kHz. Very standard.' }
                    ]);
                }
            });
        }
    },

    /** Phase 2 completion: disable sensors */
    _disableSensors: (game) => {
        const s = LaserCorridorScene.state;
        game.startDialogue([
            { speaker: '', text: '*Ryan activates the HackRF jammer*' },
            { speaker: '', text: '*HackRF: TRANSMITTING — 40 kHz BROADBAND NOISE*' },
            { speaker: '', text: '*The transducer emits a high-pitched whine*' },
            { speaker: 'Ryan', text: 'Can barely hear it. Right at the edge of human range.' },
            { speaker: '', text: '*Sensor pod 1: LED shifts from red to confused amber flickering*' },
            { speaker: '', text: '*Sensor pod 2: LED strobes wildly, then goes dark*' },
            { speaker: '', text: '*Sensor pod 3: a final angry red pulse, then nothing*' },
            { speaker: 'Ryan', text: 'Sensors are blind. The HackRF is flooding their echo channel.' },
            { speaker: 'Ryan', text: 'They can\'t distinguish movement from noise. Effectively deaf.' },
            { speaker: 'Ryan', text: 'Two layers down. One to go.' },
            { speaker: '', text: '*Ryan moves down the corridor. Footsteps echo on concrete.*' },
            { speaker: 'Ryan', text: 'The biometric panel. Eva\'s override code.' },
            { speaker: 'Ryan', text: 'Last barrier between me and Volkov\'s servers.' }
        ], () => {
            s.sensorsDisabled = true;
            s.phase = 3;
            game.setFlag('sensors_jammed', true);
            game.showNotification('Sensors jammed — approach the biometric panel');
        });
    },

    /** Phase 3 puzzle: biometric override code */
    _showBiometricPuzzle: (game) => {
        if (game.passwordPuzzle) {
            game.passwordPuzzle.show({
                id: 'biometric_override',
                title: '🔐 Biometric Override Code',
                description: 'Enter the emergency maintenance override code for the biometric lock.<br><br>Eva Petrova provided this code via secure Meshtastic mesh network earlier in the mission.<br><br>Check your Meshtastic message log.',
                correctAnswer: ['2847'],
                hint: 'Eva\'s Meshtastic message: "Override code: 2847"',
                placeholder: 'Enter 4-digit code...',
                inputType: 'text',
                maxAttempts: 5,
                onSuccess: (g) => {
                    const s = LaserCorridorScene.state;
                    s.codeEntered = true;
                    game.setFlag('biometric_code_entered', true);
                    game.showNotification('Override code accepted');
                    LaserCorridorScene._unlockDoor(game);
                },
                onFailure: (g) => {
                    game.startDialogue([
                        { speaker: '', text: '*Panel flashes red: ACCESS DENIED*' },
                        { speaker: 'Ryan', text: 'Wrong code. Think. Eva sent it via Meshtastic.' },
                        { speaker: 'Ryan', text: 'Four digits. When we were upstairs in the corridor.' }
                    ]);
                }
            });
        }
    },

    /** Phase 3 completion: unlock door */
    _unlockDoor: (game) => {
        const s = LaserCorridorScene.state;
        game.startDialogue([
            { speaker: '', text: '*Ryan types 2-8-4-7 on the keypad*' },
            { speaker: '', text: '*A long pause. The panel hums.*' },
            { speaker: '', text: '*CLICK*' },
            { speaker: '', text: '*Panel display shifts: red → amber → GREEN*' },
            { speaker: '', text: '*BIOMETRIC: OVERRIDE ACCEPTED*' },
            { speaker: '', text: '*Deep mechanical CLUNK from inside the steel door*' },
            { speaker: '', text: '*The lock indicator changes from red to green*' },
            { speaker: 'Ryan', text: '...It worked. Eva\'s code. 2847.' },
            { speaker: 'Ryan', text: 'Three layers of security. Flipper Zero. HackRF. And Eva.' },
            { speaker: 'Ryan', text: 'Defence-in-depth means nothing when every layer has a weakness.' },
            { speaker: '', text: '*The heavy steel door shifts slightly — unsealed, ready to open*' },
            { speaker: 'Ryan', text: 'The server room is right through that door.' },
            { speaker: 'Ryan', text: 'This is it.' }
        ], () => {
            s.doorUnlocked = true;
            s.phase = 4;
            game.setFlag('server_door_unlocked', true);

            game.questManager.updateProgress('breach_corridor', 'door_unlocked');
            game.completeQuest('breach_corridor');
            game.showNotification('Door unlocked — Enter the server room');
        });
    }
};

// Register scene
if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(LaserCorridorScene);
}
