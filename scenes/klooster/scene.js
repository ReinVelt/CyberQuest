/**
 * Klooster Scene - Ter Apel Monastery
 * Late-night USB drop location. No direct meeting - mysterious contact "E" leaves USB on Volvo.
 */

const KloosterScene = {
    id: 'klooster',
    name: 'Ter Apel Klooster',
    
    // SVG background - monastery at night
    background: 'assets/images/scenes/klooster.svg',
    
    // Ambient description
    description: 'The ancient Ter Apel monastery stands in solemn silence. Gothic arches frame a courtyard where centuries of secrets have been whispered.',
    
    // Player starting position
    playerStart: { x: 75, y: 85 },
    
    // Random idle thoughts for this scene
    idleThoughts: [
        "This place creeps me out...",
        "No one's here.",
        "Was this all a joke?",
        "Perfect spot for... nothing, apparently.",
        "Monks never imagined this.",
        "Check everywhere. Then the car.",
        "Gothic architecture is unsettling at night.",
        "They're watching. I can feel it.",
        "Every shadow looks suspicious.",
        "Medieval stone tells no tales.",
        "This courtyard echoes weirdly.",
        "Centuries of secrets here.",
        "Should have brought a flashlight.",
        "Too quiet. Way too quiet.",
        "Someone was here recently.",
        "Trust the process, they said.",
        "Hope this wasn't a trap.",
        "Full moon. How cinematic.",
        "My paranoia meter is maxed.",
        "Time to go home."
    ],
    
    // Scene hotspots
    hotspots: [
        {
            id: 'entrance',
            name: 'Main Entrance',
            // SVG: tower at translate(450,50), entrance at translate(50,350)
            // Door area: x=450+50=500, y=50+350=400, w=150, h=250
            x: (500 / 1920) * 100,    // 26.04%
            y: (400 / 1080) * 100,    // 37.04%
            width: (150 / 1920) * 100, // 7.81%
            height: (250 / 1080) * 100, // 23.15%
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The museum entrance. Heavy oak doors, probably centuries old.' },
                    { speaker: 'Ryan', text: 'A sign says GESLOTEN - closed. Not surprising at this hour.' }
                ]);
            }
        },
        {
            id: 'courtyard',
            name: 'Courtyard',
            // SVG: rect x=100, y=700, w=950, h=380
            x: (100 / 1920) * 100,    // 5.21%
            y: (700 / 1080) * 100,    // 64.81%
            width: (950 / 1920) * 100, // 49.48%
            height: (270 / 1080) * 100, // 25.00%
            cursor: 'pointer',
            action: function(game) {
                if (!game.getFlag('checked_courtyard')) {
                    game.setFlag('checked_courtyard', true);
                    game.startDialogue([
                        { speaker: 'Ryan', text: '23:00. Exactly when they said.' },
                        { speaker: 'Ryan', text: 'Nobody here. Surprise, surprise.' },
                        { speaker: '', text: '*He waits in the shadows for fifteen minutes*' },
                        { speaker: 'Ryan', text: 'Screw this. Maybe it was all a joke.' },
                        { speaker: 'Ryan', text: 'Better check my car.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Still no one. Time to go.' }
                    ]);
                }
            }
        },
        {
            id: 'garden',
            name: 'Hedge Garden',
            // SVG: translate(1100,450), w=300, h=350
            x: (1100 / 1920) * 100,   // 57.29%
            y: (450 / 1080) * 100,    // 41.67%
            width: (300 / 1920) * 100, // 15.63%
            height: (350 / 1080) * 100, // 32.41%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "A carefully maintained hedge maze, part of the monastery historic gardens.",
                        "Good for hiding. Bad for quick escapes."
                    ], "Ryan observes");
                }
            }
        },
        {
            id: 'well',
            name: 'Ancient Well',
            // SVG: translate(400,750), w=150, frame goes to y=-70
            // Actual: x=400, y=680, w=150, h=150
            x: (400 / 1920) * 100,    // 20.83%
            y: (680 / 1080) * 100,    // 62.96%
            width: (150 / 1920) * 100, // 7.81%
            height: (150 / 1080) * 100, // 13.89%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "An old stone well, probably medieval.",
                        "I wonder how many secrets have been dropped down there over the centuries."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'bench',
            name: 'Stone Bench',
            // SVG: translate(600,850), w=180, h=55
            x: (600 / 1920) * 100,    // 31.25%
            y: (850 / 1080) * 100,    // 78.70%
            width: (180 / 1920) * 100, // 9.38%
            height: (65 / 1080) * 100, // 6.02%
            cursor: 'use',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "A cold stone bench. Monks used these for meditation.",
                        "I use it for waiting."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'volvo',
            name: 'My Volvo',
            // SVG: translate(1450,700), w=400, h=300
            // Simplified coordinates - the car is in the bottom right
            x: 75,
            y: 65,
            width: 21,
            height: 28,
            cursor: 'pointer',
            skipWalk: false,
            lookMessage: function(game) {
                if (game.getFlag('picked_up_usb')) {
                    return "My Volvo. Time to drive home and check that USB.";
                }
                return "My old Volvo. Parked in the shadows.";
            },
            action: function(game) {
                console.log('[Klooster] Volvo clicked. Flags:', {
                    found_usb_stick: game.getFlag('found_usb_stick'),
                    picked_up_usb: game.getFlag('picked_up_usb')
                });
                
                if (!game.getFlag('found_usb_stick')) {
                    // First time approaching the car — play Hollywood cinematic
                    console.log('[Klooster] First Volvo click → USB discovery cinematic');
                    
                    game.sceneTimeout(() => {
                        game.loadScene('usb_discovery');
                    }, 500);
                } else if (game.getFlag('picked_up_usb')) {
                    // Already picked up USB, allow driving home
                    game.startDialogue([
                        { speaker: 'Ryan', text: '*Gets in the car*' },
                        { speaker: '', text: '*Engine starts. Time to head home.*' }
                    ]);
                    
                    game.sceneTimeout(() => {
                        console.log('Klooster: Setting driving_destination to home');
                        game.setFlag('driving_destination', 'home');
                        console.log('Klooster: Loading driving scene');
                        game.loadScene('driving');
                    }, 2000);
                } else {
                    // Found USB but haven't picked it up yet - go back to car discovery
                    game.loadScene('car_discovery');
                }
            }
        },
        {
            id: 'left-wing',
            name: 'Monastery Left Wing',
            // SVG: translate(100,200), w=400, h=500
            x: (80 / 1920) * 100,     // 4.17%
            y: (100 / 1080) * 100,    // 9.26%
            width: (420 / 1920) * 100, // 21.88%
            height: (600 / 1080) * 100, // 55.56%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "The left wing of the monastery. Gothic architecture at its finest.",
                        "The windows glow faintly. Some kind of security lighting inside."
                    ], "Ryan observes");
                }
            }
        },
        {
            id: 'right-wing',
            name: 'Monastery Right Wing',
            // SVG: translate(650,200), w=400, h=500
            x: (630 / 1920) * 100,    // 32.81%
            y: (100 / 1080) * 100,    // 9.26%
            width: (420 / 1920) * 100, // 21.88%
            height: (550 / 1080) * 100, // 50.93%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "The right wing. More Gothic windows.",
                        "The architecture is impressive, even in the dark."
                    ], "Ryan observes");
                }
            }
        },
        {
            id: 'tower',
            name: 'Central Tower',
            // SVG: translate(450,50), tower w=250, cross to y=-130
            x: (450 / 1920) * 100,    // 23.44%
            y: (0 / 1080) * 100,      // 0%
            width: (250 / 1920) * 100, // 13.02%
            height: (400 / 1080) * 100, // 37.04%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "The central tower rises into the night sky.",
                        "A cross at the top. A rose window beneath it.",
                        "Medieval craftsmanship that has lasted centuries."
                    ], "Ryan observes");
                }
            }
        },
        {
            id: 'moon',
            name: 'Moon',
            // SVG: circle cx=1650, cy=150, r=80 (with glow)
            x: (1570 / 1920) * 100,   // 81.77%
            y: (70 / 1080) * 100,     // 6.48%
            width: (160 / 1920) * 100, // 8.33%
            height: (160 / 1080) * 100, // 14.81%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "A nearly full moon.",
                        "Perfect for clandestine meetings, ironically."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'westerbork-sign',
            name: 'Road Sign: Westerbork Memorial',
            x: 2,
            y: 50,
            width: 10,
            height: 20,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The road sign. Westerbork — 12 km. The memorial is just down the road from here.' },
                    { speaker: 'Ryan', text: 'I\'ve been meaning to go. Something about this whole situation keeps pulling me toward that place.' },
                ], () => {
                    game.loadScene('westerbork_memorial');
                });
            }
        }
    ],
    
    // ======= WEB AUDIO: CREEPY NIGHT AMBIENCE =======
    _audioCtx: null,
    _audioNodes: [],
    _audioIntervals: [],
    _audioTimeouts: [],

    _getAudioCtx: function() {
        if (!this._audioCtx || this._audioCtx.state === 'closed') {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._audioCtx.state === 'suspended') {
            this._audioCtx.resume();
        }
        return this._audioCtx;
    },

    _startCreepyAudio: function() {
        try {
            const ctx = this._getAudioCtx();
            const nodes = this._audioNodes;
            const intervals = this._audioIntervals;
            const timeouts = this._audioTimeouts;
            const now = ctx.currentTime;

            // === 1. LOW RUMBLING DRONE (ominous sub-bass) ===
            const droneOsc = ctx.createOscillator();
            const droneGain = ctx.createGain();
            const droneFilter = ctx.createBiquadFilter();
            droneOsc.type = 'sawtooth';
            droneOsc.frequency.setValueAtTime(38, now);
            // Slow pitch drift for unease
            droneOsc.frequency.setValueAtTime(38, now);
            droneOsc.frequency.linearRampToValueAtTime(42, now + 15);
            droneOsc.frequency.linearRampToValueAtTime(36, now + 30);
            droneOsc.frequency.linearRampToValueAtTime(40, now + 45);
            droneFilter.type = 'lowpass';
            droneFilter.frequency.setValueAtTime(80, now);
            droneGain.gain.setValueAtTime(0, now);
            droneGain.gain.linearRampToValueAtTime(0.06, now + 4);
            droneOsc.connect(droneFilter);
            droneFilter.connect(droneGain);
            droneGain.connect(ctx.destination);
            droneOsc.start(now);
            nodes.push(droneOsc, droneGain, droneFilter);

            // === 2. WIND HOWLING (filtered noise with LFO modulation) ===
            const windBufferSize = ctx.sampleRate * 4;
            const windBuffer = ctx.createBuffer(1, windBufferSize, ctx.sampleRate);
            const windData = windBuffer.getChannelData(0);
            for (let i = 0; i < windBufferSize; i++) {
                windData[i] = (Math.random() * 2 - 1);
            }
            const windSrc = ctx.createBufferSource();
            windSrc.buffer = windBuffer;
            windSrc.loop = true;
            const windFilter = ctx.createBiquadFilter();
            windFilter.type = 'bandpass';
            windFilter.frequency.setValueAtTime(300, now);
            windFilter.Q.setValueAtTime(1.5, now);
            const windGain = ctx.createGain();
            windGain.gain.setValueAtTime(0, now);
            windGain.gain.linearRampToValueAtTime(0.04, now + 3);
            // Wind LFO for gusting
            const windLfo = ctx.createOscillator();
            const windLfoGain = ctx.createGain();
            windLfo.type = 'sine';
            windLfo.frequency.setValueAtTime(0.15, now);
            windLfoGain.gain.setValueAtTime(0.025, now);
            windLfo.connect(windLfoGain);
            windLfoGain.connect(windGain.gain);
            windLfo.start(now);
            // Wind filter sweep
            const windFilterLfo = ctx.createOscillator();
            const windFilterLfoGain = ctx.createGain();
            windFilterLfo.type = 'sine';
            windFilterLfo.frequency.setValueAtTime(0.07, now);
            windFilterLfoGain.gain.setValueAtTime(150, now);
            windFilterLfo.connect(windFilterLfoGain);
            windFilterLfoGain.connect(windFilter.frequency);
            windFilterLfo.start(now);
            windSrc.connect(windFilter);
            windFilter.connect(windGain);
            windGain.connect(ctx.destination);
            windSrc.start(now);
            nodes.push(windSrc, windFilter, windGain, windLfo, windLfoGain, windFilterLfo, windFilterLfoGain);

            // === 3. OWL HOOTING (periodic, two-note hoot) ===
            const scheduleOwl = () => {
                const t = ctx.currentTime;
                const owlGain = ctx.createGain();
                owlGain.gain.setValueAtTime(0, t);
                owlGain.connect(ctx.destination);
                // First hoot
                const owl1 = ctx.createOscillator();
                owl1.type = 'sine';
                owl1.frequency.setValueAtTime(380, t);
                owl1.frequency.exponentialRampToValueAtTime(320, t + 0.35);
                const owl1Gain = ctx.createGain();
                owl1Gain.gain.setValueAtTime(0, t);
                owl1Gain.gain.linearRampToValueAtTime(0.04, t + 0.05);
                owl1Gain.gain.setValueAtTime(0.04, t + 0.25);
                owl1Gain.gain.linearRampToValueAtTime(0, t + 0.4);
                owl1.connect(owl1Gain);
                owl1Gain.connect(ctx.destination);
                owl1.start(t);
                owl1.stop(t + 0.45);
                // Second hoot (lower, longer)
                const owl2 = ctx.createOscillator();
                owl2.type = 'sine';
                owl2.frequency.setValueAtTime(300, t + 0.6);
                owl2.frequency.exponentialRampToValueAtTime(260, t + 1.2);
                const owl2Gain = ctx.createGain();
                owl2Gain.gain.setValueAtTime(0, t + 0.6);
                owl2Gain.gain.linearRampToValueAtTime(0.05, t + 0.7);
                owl2Gain.gain.setValueAtTime(0.05, t + 1.0);
                owl2Gain.gain.linearRampToValueAtTime(0, t + 1.3);
                owl2.connect(owl2Gain);
                owl2Gain.connect(ctx.destination);
                owl2.start(t + 0.6);
                owl2.stop(t + 1.4);
            };
            // First owl after 5s, then every 12-25s
            timeouts.push(setTimeout(() => {
                scheduleOwl();
                intervals.push(setInterval(() => {
                    if (Math.random() < 0.7) scheduleOwl();
                }, 12000 + Math.random() * 13000));
            }, 5000));

            // === 4. DISTANT CHURCH BELL (single toll, rare) ===
            const scheduleBell = () => {
                const t = ctx.currentTime;
                const bellOsc = ctx.createOscillator();
                bellOsc.type = 'sine';
                bellOsc.frequency.setValueAtTime(220, t);
                const bellOsc2 = ctx.createOscillator();
                bellOsc2.type = 'sine';
                bellOsc2.frequency.setValueAtTime(440, t);
                const bellGain = ctx.createGain();
                bellGain.gain.setValueAtTime(0, t);
                bellGain.gain.linearRampToValueAtTime(0.03, t + 0.1);
                bellGain.gain.exponentialRampToValueAtTime(0.001, t + 4);
                const bellFilter = ctx.createBiquadFilter();
                bellFilter.type = 'bandpass';
                bellFilter.frequency.setValueAtTime(300, t);
                bellFilter.Q.setValueAtTime(2, t);
                bellOsc.connect(bellFilter);
                bellOsc2.connect(bellFilter);
                bellFilter.connect(bellGain);
                bellGain.connect(ctx.destination);
                bellOsc.start(t);
                bellOsc2.start(t);
                bellOsc.stop(t + 4.5);
                bellOsc2.stop(t + 4.5);
            };
            // Bell every 30-60s
            timeouts.push(setTimeout(() => {
                scheduleBell();
                intervals.push(setInterval(() => {
                    if (Math.random() < 0.5) scheduleBell();
                }, 30000 + Math.random() * 30000));
            }, 15000));

            // === 5. CRICKETS (rapid clicking chirps) ===
            const scheduleCricket = () => {
                const t = ctx.currentTime;
                const cricketGain = ctx.createGain();
                cricketGain.gain.setValueAtTime(0.02, t);
                cricketGain.connect(ctx.destination);
                for (let i = 0; i < 6; i++) {
                    const cOsc = ctx.createOscillator();
                    cOsc.type = 'square';
                    cOsc.frequency.setValueAtTime(4200 + Math.random() * 800, t + i * 0.06);
                    const cGain = ctx.createGain();
                    cGain.gain.setValueAtTime(0, t + i * 0.06);
                    cGain.gain.linearRampToValueAtTime(0.015, t + i * 0.06 + 0.01);
                    cGain.gain.linearRampToValueAtTime(0, t + i * 0.06 + 0.04);
                    cOsc.connect(cGain);
                    cGain.connect(ctx.destination);
                    cOsc.start(t + i * 0.06);
                    cOsc.stop(t + i * 0.06 + 0.05);
                }
            };
            intervals.push(setInterval(() => {
                if (Math.random() < 0.6) scheduleCricket();
            }, 2000 + Math.random() * 1500));

            // === 6. CREAKING WOOD / GATE (metallic groan) ===
            const scheduleCreak = () => {
                const t = ctx.currentTime;
                const creakOsc = ctx.createOscillator();
                creakOsc.type = 'sawtooth';
                creakOsc.frequency.setValueAtTime(80, t);
                creakOsc.frequency.linearRampToValueAtTime(120, t + 0.3);
                creakOsc.frequency.linearRampToValueAtTime(60, t + 0.8);
                creakOsc.frequency.linearRampToValueAtTime(100, t + 1.2);
                const creakFilter = ctx.createBiquadFilter();
                creakFilter.type = 'bandpass';
                creakFilter.frequency.setValueAtTime(600, t);
                creakFilter.Q.setValueAtTime(8, t);
                const creakGain = ctx.createGain();
                creakGain.gain.setValueAtTime(0, t);
                creakGain.gain.linearRampToValueAtTime(0.02, t + 0.15);
                creakGain.gain.setValueAtTime(0.015, t + 0.8);
                creakGain.gain.linearRampToValueAtTime(0, t + 1.5);
                creakOsc.connect(creakFilter);
                creakFilter.connect(creakGain);
                creakGain.connect(ctx.destination);
                creakOsc.start(t);
                creakOsc.stop(t + 1.6);
            };
            // Creak every 20-45s
            intervals.push(setInterval(() => {
                if (Math.random() < 0.4) scheduleCreak();
            }, 20000 + Math.random() * 25000));

            // === 7. DISTANT DOG BARK (very far away) ===
            const scheduleDog = () => {
                const t = ctx.currentTime;
                const barkCount = 2 + Math.floor(Math.random() * 3);
                for (let i = 0; i < barkCount; i++) {
                    const bark = ctx.createOscillator();
                    bark.type = 'sawtooth';
                    bark.frequency.setValueAtTime(250, t + i * 0.35);
                    bark.frequency.exponentialRampToValueAtTime(180, t + i * 0.35 + 0.12);
                    const barkFilter = ctx.createBiquadFilter();
                    barkFilter.type = 'bandpass';
                    barkFilter.frequency.setValueAtTime(400, t);
                    barkFilter.Q.setValueAtTime(3, t);
                    const barkGain = ctx.createGain();
                    barkGain.gain.setValueAtTime(0, t + i * 0.35);
                    barkGain.gain.linearRampToValueAtTime(0.012, t + i * 0.35 + 0.03);
                    barkGain.gain.linearRampToValueAtTime(0, t + i * 0.35 + 0.15);
                    bark.connect(barkFilter);
                    barkFilter.connect(barkGain);
                    barkGain.connect(ctx.destination);
                    bark.start(t + i * 0.35);
                    bark.stop(t + i * 0.35 + 0.2);
                }
            };
            // Dog every 25-50s
            timeouts.push(setTimeout(() => {
                scheduleDog();
                intervals.push(setInterval(() => {
                    if (Math.random() < 0.35) scheduleDog();
                }, 25000 + Math.random() * 25000));
            }, 20000));

            // === 8. EERIE TONAL WHISPERS (dissonant pad) ===
            const scheduleWhisper = () => {
                const t = ctx.currentTime;
                const freqs = [180, 185, 270, 275]; // slightly detuned for unease
                freqs.forEach(f => {
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, t);
                    const g = ctx.createGain();
                    g.gain.setValueAtTime(0, t);
                    g.gain.linearRampToValueAtTime(0.008, t + 2);
                    g.gain.setValueAtTime(0.008, t + 4);
                    g.gain.linearRampToValueAtTime(0, t + 6);
                    osc.connect(g);
                    g.connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 6.5);
                });
            };
            // Whisper pad every 30-60s
            timeouts.push(setTimeout(() => {
                scheduleWhisper();
                intervals.push(setInterval(() => {
                    if (Math.random() < 0.45) scheduleWhisper();
                }, 30000 + Math.random() * 30000));
            }, 10000));

            // === 9. RANDOM TWIG SNAP (sharp transient) ===
            const scheduleSnap = () => {
                const t = ctx.currentTime;
                const snapBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
                const snapData = snapBuffer.getChannelData(0);
                for (let i = 0; i < snapData.length; i++) {
                    snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.01));
                }
                const snapSrc = ctx.createBufferSource();
                snapSrc.buffer = snapBuffer;
                const snapFilter = ctx.createBiquadFilter();
                snapFilter.type = 'highpass';
                snapFilter.frequency.setValueAtTime(2000, t);
                const snapGain = ctx.createGain();
                snapGain.gain.setValueAtTime(0.04, t);
                snapGain.gain.linearRampToValueAtTime(0, t + 0.08);
                snapSrc.connect(snapFilter);
                snapFilter.connect(snapGain);
                snapGain.connect(ctx.destination);
                snapSrc.start(t);
            };
            // Snap every 15-40s
            intervals.push(setInterval(() => {
                if (Math.random() < 0.3) scheduleSnap();
            }, 15000 + Math.random() * 25000));

            // === 10. WATER DRIP IN WELL (occasional hollow plop) ===
            const scheduleDrip = () => {
                const t = ctx.currentTime;
                const dripOsc = ctx.createOscillator();
                dripOsc.type = 'sine';
                dripOsc.frequency.setValueAtTime(1200, t);
                dripOsc.frequency.exponentialRampToValueAtTime(400, t + 0.08);
                const dripGain = ctx.createGain();
                dripGain.gain.setValueAtTime(0.025, t);
                dripGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                const dripFilter = ctx.createBiquadFilter();
                dripFilter.type = 'bandpass';
                dripFilter.frequency.setValueAtTime(800, t);
                dripFilter.Q.setValueAtTime(5, t);
                dripOsc.connect(dripFilter);
                dripFilter.connect(dripGain);
                dripGain.connect(ctx.destination);
                dripOsc.start(t);
                dripOsc.stop(t + 0.4);
            };
            // Drip every 5-12s
            intervals.push(setInterval(() => {
                if (Math.random() < 0.5) scheduleDrip();
            }, 5000 + Math.random() * 7000));

            // === 11. HEARTBEAT-LIKE PULSE (very subtle, builds tension) ===
            const heartOsc = ctx.createOscillator();
            heartOsc.type = 'sine';
            heartOsc.frequency.setValueAtTime(40, now);
            const heartGain = ctx.createGain();
            heartGain.gain.setValueAtTime(0, now);
            const heartLfo = ctx.createOscillator();
            heartLfo.type = 'sine';
            heartLfo.frequency.setValueAtTime(1.1, now); // ~66 bpm
            const heartLfoGain = ctx.createGain();
            heartLfoGain.gain.setValueAtTime(0.012, now);
            heartLfo.connect(heartLfoGain);
            heartLfoGain.connect(heartGain.gain);
            heartOsc.connect(heartGain);
            heartGain.connect(ctx.destination);
            heartOsc.start(now);
            heartLfo.start(now);
            nodes.push(heartOsc, heartGain, heartLfo, heartLfoGain);

            console.log('[Klooster] Creepy ambient audio started (11 layers)');
        } catch (e) {
            console.warn('[Klooster] Audio failed:', e);
        }
    },

    _stopCreepyAudio: function() {
        // Stop all intervals
        this._audioIntervals.forEach(id => clearInterval(id));
        this._audioIntervals = [];
        // Stop all timeouts
        this._audioTimeouts.forEach(id => clearTimeout(id));
        this._audioTimeouts = [];
        // Stop all audio nodes
        this._audioNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) { /* already stopped */ }
        });
        this._audioNodes = [];
        // Close context
        if (this._audioCtx && this._audioCtx.state !== 'closed') {
            this._audioCtx.close().catch(() => {});
            this._audioCtx = null;
        }
        console.log('[Klooster] Creepy ambient audio stopped');
    },

    // Scene entry
    onEnter: function(game) {
        console.log('[Klooster] Scene entered');
        console.log('[Klooster] Hotspots:', this.hotspots.map(h => h.id));
        game.showNotification('Arrived at Ter Apel Klooster - Click the Volvo (bottom right)');

        // Start creepy ambient audio
        this._startCreepyAudio();
        
        if (!game.getFlag('first_klooster_visit')) {
            game.setFlag('first_klooster_visit', true);
            
            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: '22:55. Five minutes early.' },
                    { speaker: 'Ryan', text: 'The monastery looks abandoned.' },
                    { speaker: 'Ryan', text: 'Dark windows. Locked doors. No signs of life.' },
                    { speaker: 'Ryan', text: 'But E said 23:00. Check the courtyard.' }
                ]);
            }, 500);
        }
    },
    
    // Scene exit
    onExit: function(game) {
        this._stopCreepyAudio();
        console.log('[Klooster] Scene exited');
    }
};

// Scene will be registered in index.html initGame() function
