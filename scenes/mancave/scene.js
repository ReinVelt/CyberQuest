/**
 * Scene: Mancave (Garage) — Cinematic Hub
 * ═══════════════════════════════════════════════════════════
 * Ryan's tech lab — central hub scene.
 * Delegates major story sequences to cinematic modules:
 *   - MancaveUSBAnalysis    (usb-analysis.js)
 *   - MancaveDilemma        (dilemma.js)
 *   - MancaveAllyRecruitment (ally-recruitment.js)
 *   - MancaveVolkovInvestigation (volkov-investigation.js)
 *   - MancaveEvaReveal      (eva-reveal.js)
 *   - MancaveEvaContact     (eva-contact.js)
 * All share MancaveCinematic utilities (cinematic-utils.js).
 * ═══════════════════════════════════════════════════════════
 */

const MancaveScene = {
    id: 'mancave',
    name: 'Mancave - Tech Lab',

    background: 'assets/images/scenes/mancave.svg',

    playerStart: { x: 20, y: 85 },

    // 🎬 Accessibility / Movie Mode — full mancave story path (all visits)
    accessibilityPath: [
        // ── Laptop (email → dilemma → ally recruitment → Volkov investigation) ──
        // Only enter when there is real work:
        //   - first visit: check email (!checked_email)
        //   - after USB/evidence found: dilemma → ally recruit → Volkov dive
        // Skip entirely while waiting for SSTV chain (checked_email set, evidence not yet unlocked)
        // and skip once Volkov is fully investigated (nothing left on the laptop).
        async function(game) {
            const hasWork = !game.getFlag('checked_email')
                || (game.getFlag('evidence_unlocked') && !game.getFlag('volkov_investigated'));
            if (hasWork) {
                game.loadScene('laptop');
            }
        },
        // ── SSTV Terminal pass 1: receive first transmission ──
        async function(game) {
            if (!game.getFlag('sstv_transmission_received')) {
                game.loadScene('sstv_terminal');
            }
        },
        async function(game) {
            // Only visit SDR bench if message not yet decoded (avoids re-entry loop)
            if (!game.getFlag('message_decoded')) {
                game.loadScene('sdr_bench');
            }
        },
        'hackrf',        // tune to 243 MHz, trigger second transmission
        // ── SSTV Terminal pass 2: decode second message → klooster_unlocked ──
        async function(game) {
            if (game.getFlag('second_transmission_ready') && !game.getFlag('klooster_unlocked')) {
                game.loadScene('sstv_terminal');
            }
        },
        'airgapped-laptop', // forensic analysis + USB analysis (visit 2+)
        // ── Secure Phone: Kubecka → Zerfall → Eva identification ──
        async function(game) {
            if (game.getFlag('volkov_investigated') && !game.getFlag('eva_contacted')) {
                game.loadScene('secure_phone');
            }
        },
        'meshtastic',       // Eva contact + mission prep (visit 2+)
        async function(game) {
            // Launch videocall only once — after Eva contacted
            if (game.getFlag('eva_contacted') && !game.getFlag('videocall_done')) {
                game.loadScene('videocall');
            }
        },
        async function(game) {
            // Visit planboard once — after USB discovered or SSTV decoded
            if ((game.getFlag('sstv_decoded') || game.getFlag('picked_up_usb'))
                    && !game.getFlag('visited_planboard')) {
                game.loadScene('planboard');
            }
        },
        'flipper-zero',  // gear pickup: Flipper Zero
        'wifi-pineapple',// gear pickup: WiFi Pineapple
        'night-vision',  // gear pickup: night vision
        async function(game) {
            // Exit to garden only when there is a Volvo destination waiting.
            // The engine loop will call this every pass, so guard carefully.
            if (game._gardenHasPendingDestination()) {
                game.loadScene('garden');
            }
        },
    ],

    // Loop the path on every mancave visit: keep cycling hotspots (retrying
    // those that produce new flags) until nothing changes AND no new garden
    // destination is pending.  The engine breaks automatically when stable.
    accessibilityLooping: true,

    idleThoughts: [
        "Need more coffee...",
        "Check the signal analyzer.",
        "Should update my dead man's switch.",
        "Flipper Zero firmware needs updating.",
        "The SSTV terminal is humming.",
        "When did I last sleep?",
        "Drenthe: land of radio silence. Perfect for listening.",
        "Wonder what's on 243 MHz today."
    ],

    hotspots: [
        /* ── SSTV Terminal ────────────────────────────────── */
        {
            id: 'sstv-terminal',
            name: 'SSTV Terminal',
            // SVG: desk translate(250,450) + SSTV translate(300,0)
            // Bezel: rect x=-20,y=-20,w=340,h=240 → abs (530,430)-(870,670)
            x: (530 / 1920) * 100,    // 27.60%
            y: (430 / 1080) * 100,    // 39.81%
            width: (340 / 1920) * 100, // 17.71%
            height: (240 / 1080) * 100, // 22.22%
            cursor: 'pointer',
            action: function(game) {
                game.loadScene('sstv_terminal');
            }
        },

        /* ── SDR Workbench ────────────────────────────────── */
        {
            id: 'sdr-workbench',
            name: 'SDR Workbench',
            x: 70.8,
            y: 46.3,
            width: 6.5,
            height: 13.0,
            cursor: 'pointer',
            action: function(game) {
                game.loadScene('sdr_bench');
            }
        },

        /* ── Laptop (main) ────────────────────────────────── */
        {
            id: 'laptop',
            name: 'Laptop',
            x: 13.02,
            y: 43.52,
            width: 10.42,
            height: 13.89,
            cursor: 'pointer',
            action: function(game) {
                game.loadScene('laptop');
            }
        },

        /* ── Air-Gapped Laptop (USB analysis) ─────────────── */
        {
            id: 'airgapped-laptop',
            name: 'Air-Gapped Laptop',
            // SVG: translate(180, 455), shelf + laptop, w≈115, h≈151
            x: (180 / 1920) * 100,     // 9.38%
            y: (455 / 1080) * 100,     // 42.13%
            width: (115 / 1920) * 100,  // 5.99%
            height: (151 / 1080) * 100, // 13.98%
            cursor: 'pointer',
            lookMessage: "My air-gapped laptop. Never been online. Perfect for analyzing suspicious files.",
            action: function(game) {
                if (!game.hasItem('usb_stick')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My air-gapped laptop. Totally isolated from networks.' },
                        { speaker: 'Ryan', text: 'Use it for analyzing suspicious files. Can\'t be too careful.' }
                    ]);
                    return;
                }

                // ── Forensic prep: First click with USB — boot forensic environment ──
                if (!game.getFlag('forensic_prep_complete')) {
                    window.MancaveForensicAnalysis.play(game);
                    return;
                }

                // ── Phase 1+2: Second click — insert USB + README ──
                if (!game.getFlag('usb_analyzed')) {
                    window.MancaveUSBAnalysis.playInsertUSB(game);
                    return;
                }

                // ── Phase 3: Second click — Schematics ──
                if (game.getFlag('usb_analyzed') && !game.getFlag('viewed_schematics')) {
                    window.MancaveUSBAnalysis.playSchematics(game);
                    return;
                }

                // ── Phase 4+5: Third click — Password + Casualty report ──
                if (game.getFlag('viewed_schematics') && !game.getFlag('evidence_unlocked')) {
                    window.MancaveUSBAnalysis.playPassword(game);
                    return;
                }

                // After everything is viewed
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The USB evidence is clear: 8 dead, more planned.' },
                    { speaker: 'Ryan', text: 'Project Echo is a weapon. And Volkov is using German resources to perfect it.' },
                    { speaker: 'Ryan', text: 'I need allies. People with RF expertise who can help.' }
                ]);
            }
        },

        /* ── HackRF One with Portapack ────────────────────── */
        {
            id: 'hackrf',
            name: 'HackRF One with Portapack',
            x: 62.50,
            y: 49.07,
            width: 7.81,
            height: 7.41,
            cursor: 'pointer',
            action: function(game) {
                if (game.getFlag('message_decoded') && !game.getFlag('frequency_tuned')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Message said military frequency from Steckerdoser Heide.' },
                        { speaker: 'Ryan', text: 'Let\'s tune the HackRF and see what we get.' }
                    ]);

                    setTimeout(() => {
                        game.startPuzzle({
                            id: 'frequency_tune',
                            type: 'frequency',
                            description: 'Tune to the military frequency from the Steckerdoser Heide facility.',
                            startFreq: 100.0,
                            minFreq: 50,
                            maxFreq: 500,
                            solution: 243.0,
                            onSolve: function(g) {
                                g.setFlag('frequency_tuned', true);
                                g.setFlag('military_frequency', 243);
                                g.setStoryPart(4);
                                g.startDialogue([
                                    { speaker: '', text: '*Static crackles, then clear signal*' },
                                    { speaker: 'Ryan', text: 'Got something! Repeating data burst on 243 MHz.' },
                                    { speaker: 'Ryan', text: 'Military emergency frequency. Someone\'s broadcasting.' },
                                    { speaker: 'Ryan', text: 'Steckerdoser Heide is only 30 minutes away...' },
                                    { speaker: 'Ryan', text: 'Check it out? Or wait for more?' }
                                ]);

                                setTimeout(() => {
                                    g.setFlag('second_transmission_ready', true);
                                    g.showNotification('⚠️ NEW TRANSMISSION: The SSTV terminal has incoming data!');
                                    g.addQuest({
                                        id: 'check_sstv_again',
                                        name: 'Check SSTV Terminal',
                                        description: 'The SSTV terminal received a new transmission. Check it to decode the second message.',
                                        hint: 'Click on the SSTV terminal (left monitor).'
                                    });
                                }, 4000);
                            }
                        });
                    }, 500);
                } else if (game.getFlag('frequency_tuned')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The HackRF is locked onto 243 MHz. Still picking up those data bursts.' },
                        { speaker: 'Ryan', text: 'The facility is just 30 minutes away...' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My HackRF One with Portapack. Software Defined Radio at its finest.' },
                        { speaker: 'Ryan', text: 'I can receive and transmit on almost any frequency with this beauty.' }
                    ]);
                }
            }
        },

        /* ── Flipper Zero ─────────────────────────────────── */
        {
            id: 'flipper-zero',
            name: 'Flipper Zero',
            x: 62.50,
            y: 60.19,
            width: 5.21,
            height: 4.63,
            cursor: 'pointer',
            action: function(game) {
                if (!game.hasItem('flipper_zero')) {
                    game.addToInventory({
                        id: 'flipper_zero',
                        name: 'Flipper Zero',
                        description: 'Multi-tool device for RFID, NFC, infrared, and GPIO hacking.',
                        icon: 'assets/images/icons/flipper-zero.svg'
                    });
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My Flipper Zero. Never leave home without it.' },
                        { speaker: 'Ryan', text: 'RFID, NFC, infrared, sub-GHz radio... this little guy can do it all.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'I\'ve already got my Flipper Zero. It\'s in my pocket.' }
                    ]);
                }
            }
        },

        /* ── WiFi Pineapple ───────────────────────────────── */
        {
            id: 'wifi-pineapple',
            name: 'WiFi Pineapple',
            x: 68.0,
            y: 67.0,
            width: 4.0,
            height: 5.5,
            cursor: 'pointer',
            action: function(game) {
                if (!game.hasItem('wifi_pineapple')) {
                    game.addToInventory({
                        id: 'wifi_pineapple',
                        name: 'WiFi Pineapple',
                        description: 'Portable WiFi auditing tool for network penetration testing.',
                        icon: 'assets/images/icons/wifi-pineapple.svg'
                    });
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'WiFi Pineapple. Perfect for network auditing on the go.' },
                        { speaker: 'Ryan', text: 'Might come in handy if I need to intercept wireless traffic.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Already packed the WiFi Pineapple.' }
                    ]);
                }
            }
        },

        /* ── Night Vision Monocular ──────────────────────── */
        {
            id: 'night-vision',
            name: 'Night Vision Monocular',
            x: 78.0,
            y: 38.0,
            width: 3.5,
            height: 5.0,
            cursor: 'pointer',
            action: function(game) {
                if (!game.hasItem('night_vision')) {
                    game.addToInventory({
                        id: 'night_vision',
                        name: 'Night Vision Monocular',
                        description: 'Military-grade night vision device. Essential for nocturnal operations.',
                        icon: 'assets/images/icons/night-vision.svg'
                    });
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Night vision monocular. Bought from surplus years ago.' },
                        { speaker: 'Ryan', text: 'If this goes south, I might need to move in the dark.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Night vision already in my bag.' }
                    ]);
                }
            }
        },

        /* ── Espresso Machine ─────────────────────────────── */
        {
            id: 'espresso-machine',
            name: 'Espresso Machine',
            x: 15.0,
            y: 65.0,
            width: 4.0,
            height: 8.0,
            cursor: 'pointer',
            action: function(game) {
                const coffeeCount = game.getFlag('espresso_count') || 0;
                game.setFlag('espresso_count', coffeeCount + 1);
                const newCount = coffeeCount + 1;

                const responses = [
                    { speaker: 'Ryan', text: '*Makes espresso. The machine hisses and gurgles.*' },
                    { speaker: 'Ryan', text: `Coffee number ${newCount}. Still coherent... mostly.` }
                ];

                if (newCount === 1) {
                    responses[1] = { speaker: 'Ryan', text: 'First espresso of the session. Fuel for the brain.' };
                } else if (newCount === 3) {
                    responses[1] = { speaker: 'Ryan', text: 'Third espresso. Now we\'re cooking with gas.' };
                } else if (newCount === 5) {
                    responses[1] = { speaker: 'Ryan', text: 'Fifth espresso. I can taste colors now.' };
                } else if (newCount === 8) {
                    responses[1] = { speaker: 'Ryan', text: 'Eight espressos. My heart is a drum machine.' };
                } else if (newCount >= 10) {
                    responses[1] = { speaker: 'Ryan', text: `Espresso #${newCount}. I've transcended the need for sleep.` };
                }

                game.startDialogue(responses);
                game.advanceTime(5);
            }
        },

        /* ── Server Rack ──────────────────────────────────── */
        {
            id: 'server-rack',
            name: 'Server Rack',
            x: 85.94,
            y: 18.52,
            width: 10.42,
            height: 55.56,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My personal server. Runs a few services, hosts my projects.' },
                    { speaker: 'Ryan', text: 'Also has my dead man\'s switch configured. Just in case.' },
                    { speaker: 'Ryan', text: 'If I don\'t check in regularly, it sends out an encrypted package to trusted contacts.' }
                ]);
            }
        },

        /* ── Meshtastic Nodes ─────────────────────────────── */
        {
            id: 'meshtastic',
            name: 'Meshtastic Nodes',
            x: 71.88,
            y: 55.56,
            width: 4.17,
            height: 11.11,
            cursor: 'pointer',
            action: function(game) {
                // ── Part 15b: Configure Meshtastic for Eva ──
                if (game.getFlag('identified_eva') && !game.getFlag('meshtastic_configured')) {
                    window.MancaveMeshtasticSetup.play(game);
                    return;
                }

                // ── Part 16: Contact Eva via Meshtastic ──
                if (game.getFlag('identified_eva') && !game.getFlag('eva_contacted')) {
                    window.MancaveEvaContact.play(game);
                    return;
                }

                // ── Part 16b: Mission Prep — after Eva contacted ──
                if (game.getFlag('eva_contacted') && !game.getFlag('mission_prep_complete')) {
                    window.MancaveMissionPrep.play(game);
                    return;
                }

                // After mission prep — reminder
                if (game.getFlag('mission_prep_complete')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Gear packed. Allies standing by. Eva waiting at the facility.' },
                        { speaker: 'Ryan', text: 'Time to go. Through the garden to the Volvo.' }
                    ]);
                    return;
                }

                // After Eva contacted but before mission prep — redirect
                if (game.getFlag('eva_contacted')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Eva is waiting. Tomorrow night. 11 PM. North entrance.' },
                        { speaker: 'Ryan', text: 'I need to prepare. Check my equipment. Make sure I\'m ready.' }
                    ]);
                    return;
                }

                // Default: Pickup item
                if (!game.hasItem('meshtastic')) {
                    game.addToInventory({
                        id: 'meshtastic',
                        name: 'Meshtastic Node',
                        description: 'Long-range, low-power mesh networking device. Perfect for off-grid communication.',
                        icon: 'assets/images/icons/meshtastic.svg'
                    });
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Meshtastic nodes. Decentralized mesh networking.' },
                        { speaker: 'Ryan', text: 'No cell towers, no internet required. Messages hop from device to device.' },
                        { speaker: 'Ryan', text: 'I\'ll take one. You never know when you need secure comms.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'I\'ve got a Meshtastic node already. Useful stuff.' }
                    ]);
                }
            }
        },

        /* ── Secure Phone ─────────────────────────────────── */
        {
            id: 'secure-phone',
            name: 'Secure Phone',
            x: 25.0,
            y: 42.0,
            width: 6.0,
            height: 12.0,
            cursor: 'pointer',
            lookMessage: "My encrypted phone with Signal. For serious conversations only.",
            action: function(game) {
                game.loadScene('secure_phone');
            }
        },

        /* ── Video Conference Terminal ─────────────────────── */
        {
            id: 'video-terminal',
            name: 'Video Conference Terminal',
            x: 65.1,
            y: 25.9,
            width: 12.5,
            height: 18.5,
            cursor: 'pointer',
            lookMessage: 'Secure video terminal for encrypted calls with my contacts.',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Video terminal — encrypted connection to David Prinsloo, Cees Bassa, and Jaap Haartsen.' },
                    { speaker: 'Ryan', text: 'Let\'s see who\'s available...' }
                ]);
                game.sceneTimeout(() => {
                    game.loadScene('videocall');
                }, 1000);
            }
        },

        /* ── Door to House ────────────────────────────────── */
        {
            id: 'door-house',
            name: 'Door to House',
            x: 1.56,
            y: 23.15,
            width: 7.29,
            height: 46.30,
            cursor: 'pointer',
            targetScene: 'home'
        },

        /* ── Side Door to Garden ──────────────────────────── */
        {
            id: 'door-garden',
            name: 'Side Door to Garden',
            x: 95,
            y: 50,
            width: 4,
            height: 30,
            cursor: 'pointer',
            action: function(game) {
                if (game.getFlag('klooster_unlocked')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Time to head out. The Volvo is parked in the back.' }
                    ]);
                    game.sceneTimeout(() => {
                        game.loadScene('garden');
                    }, 1500);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The side door leads to the garden. Nice for some fresh air.' }
                    ]);
                    game.sceneTimeout(() => {
                        game.loadScene('garden');
                    }, 1500);
                }
            }
        },

        /* ── Investigation Board ──────────────────────────── */
        {
            id: 'investigation-board',
            name: 'Investigation Board',
            x: 70,
            y: 15,
            width: 12,
            height: 15,
            cursor: 'pointer',
            lookMessage: "My investigation board. All the clues connected with red string. Very detective movie.",
            action: function(game) {
                if (!game.getFlag('sstv_decoded') && !game.getFlag('picked_up_usb')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Empty cork board. Waiting for a mystery to solve.' }
                    ]);
                    return;
                }
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Let me check what I\'ve got so far...' }
                ]);
                game.sceneTimeout(() => {
                    game.loadScene('planboard');
                }, 1500);
            }
        },

        /* ── Regional Map ─────────────────────────────────── */
        {
            id: 'regional-map',
            name: 'Regional Map',
            x: 50,
            y: 60,
            width: 10,
            height: 12,
            cursor: 'pointer',
            lookMessage: "Regional map showing all the locations. Good for planning routes.",
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Let me check the map. See where everything is...' }
                ]);
                game.sceneTimeout(() => {
                    game.loadScene('regional_map');
                }, 1500);
            }
        }
    ],

    /* ══════════════════════════════════════════════════════════
       ON ENTER — Welcome + random incoming calls (cinematic)
       ══════════════════════════════════════════════════════════ */
    onEnter: function(game) {
        document.getElementById('scene-background').className = 'scene-mancave';

        if (!game.getFlag('visited_mancave')) {
            game.setFlag('visited_mancave', true);
            game.startDialogue([
                { speaker: 'Ryan', text: 'My mancave. My lab.' },
                { speaker: 'Ryan', text: 'Everything a hacker needs: radios, computers, tools.' },
                { speaker: 'Ryan', text: 'Check emails and get to work.' }
            ]);
        }

        // Random incoming calls from mother or father-in-law (with cinematic ring)
        const MC = window.MancaveCinematic;
        const randomCallChance = Math.random();
        const motherCallCount = game.getFlag('mother_call_count') || 0;
        const fatherCallCount = game.getFlag('father_call_count') || 0;

        // Mother calls sometimes when you've been busy
        if (randomCallChance < 0.15 && motherCallCount < 3 && game.getFlag('sstv_decoded')) {
            game.setFlag('mother_call_count', motherCallCount + 1);
            setTimeout(() => {
                MC.playIncomingCall(game, 'Mother', [
                    { speaker: '', text: '📞 *Incoming video call...*' },
                    { speaker: '', text: '*Mother calling*' },
                    { speaker: 'Mother', text: 'Ryan! Finally! I haven\'t heard from you in days!' },
                    { speaker: 'Ryan', text: 'Hi Mom. Sorry, I\'ve been busy with work.' },
                    { speaker: 'Mother', text: 'Too busy for your mother? When are you coming to visit?' },
                    { speaker: 'Mother', text: 'I\'ll cook your favorite — stamppot with rookworst and gravy!' },
                    { speaker: 'Ryan', text: 'That sounds amazing, Mom. Soon, I promise.' },
                    { speaker: 'Mother', text: 'You always say "soon"! It\'s been three weeks!' },
                    { speaker: 'Mother', text: 'I made erwtensoep. Froze some for you.' },
                    { speaker: 'Ryan', text: 'You\'re the best. I really will come visit.' },
                    { speaker: 'Mother', text: 'You look tired, schat. Are you eating properly?' },
                    { speaker: 'Ryan', text: 'Yes, Mom. Ies takes good care of me.' },
                    { speaker: 'Mother', text: 'Good. Don\'t forget your old mother! Love you, lieverd.' },
                    { speaker: 'Ryan', text: 'Love you too, Mom.' }
                ]);
            }, 3000);
        }

        // Father-in-law calls with technical questions
        if (randomCallChance > 0.85 && fatherCallCount < 3) {
            game.setFlag('father_call_count', fatherCallCount + 1);
            const questions = [
                [
                    { speaker: '', text: '📞 *Incoming video call...*' },
                    { speaker: '', text: '*Father-in-Law calling*' },
                    { speaker: 'Father-in-Law', text: 'Ryan! Quick question — you got a minute?' },
                    { speaker: 'Ryan', text: 'Sure, what\'s up?' },
                    { speaker: 'Father-in-Law', text: 'My 3D printer keeps under-extruding on the first layer.' },
                    { speaker: 'Father-in-Law', text: 'Z-offset is set correctly. Bed is leveled. What am I missing?' },
                    { speaker: 'Ryan', text: 'Check your nozzle temperature. Might be too low.' },
                    { speaker: 'Ryan', text: 'Also, flow rate — try bumping it to 105% for the first layer.' },
                    { speaker: 'Father-in-Law', text: 'Ah! I had it at 200°C for PLA. Should go to 210?' },
                    { speaker: 'Ryan', text: 'Yeah, 210-215 for the first layer helps with bed adhesion.' },
                    { speaker: 'Father-in-Law', text: 'Perfect! I\'ll try that. Thanks!' },
                    { speaker: 'Ryan', text: 'No problem. Let me know how it goes.' },
                    { speaker: 'Father-in-Law', text: 'Will do! Coffee sometime?' },
                    { speaker: 'Ryan', text: 'Sounds good!' }
                ],
                [
                    { speaker: '', text: '📞 *Incoming video call...*' },
                    { speaker: '', text: '*Father-in-Law calling*' },
                    { speaker: 'Father-in-Law', text: 'Ryan, got a weird Arduino issue.' },
                    { speaker: 'Ryan', text: 'What\'s happening?' },
                    { speaker: 'Father-in-Law', text: 'Reading analog values from a potentiometer. They\'re super noisy.' },
                    { speaker: 'Father-in-Law', text: 'Jumping all over the place. 512, 489, 523, 501...' },
                    { speaker: 'Ryan', text: 'Classic noise problem. Add a small capacitor across the pot terminals.' },
                    { speaker: 'Ryan', text: '0.1µF should smooth it out. Also use analogRead averaging in code.' },
                    { speaker: 'Father-in-Law', text: 'Average multiple readings?' },
                    { speaker: 'Ryan', text: 'Yeah, take 10 readings, discard outliers, average the rest.' },
                    { speaker: 'Father-in-Law', text: 'Makes sense. Software and hardware filtering together!' },
                    { speaker: 'Ryan', text: 'Exactly. Should give you stable values.' },
                    { speaker: 'Father-in-Law', text: 'Brilliant! This is why I call you. Thanks!' },
                    { speaker: 'Ryan', text: 'Anytime!' }
                ],
                [
                    { speaker: '', text: '📞 *Incoming video call...*' },
                    { speaker: '', text: '*Father-in-Law calling*' },
                    { speaker: 'Father-in-Law', text: 'Hey Ryan! Quick one — stepper motor question.' },
                    { speaker: 'Ryan', text: 'Shoot.' },
                    { speaker: 'Father-in-Law', text: 'NEMA 17 stepper gets hot after running for 20 minutes.' },
                    { speaker: 'Father-in-Law', text: 'Like, really hot. Too hot to touch. Is that normal?' },
                    { speaker: 'Ryan', text: 'Depends. What\'s your driver current set to?' },
                    { speaker: 'Father-in-Law', text: 'Uh... whatever the default was?' },
                    { speaker: 'Ryan', text: 'That\'s probably your issue. Check the motor specs — likely 1.5A max.' },
                    { speaker: 'Ryan', text: 'Set your driver to about 70% of that. 1.0-1.2A should be good.' },
                    { speaker: 'Father-in-Law', text: 'Too much current means too much heat!' },
                    { speaker: 'Ryan', text: 'Exactly. Adjust the little potentiometer on your driver board.' },
                    { speaker: 'Father-in-Law', text: 'Got it. I\'ll tune it down. Thanks!' },
                    { speaker: 'Ryan', text: 'No problem. Don\'t burn down your workshop!' },
                    { speaker: 'Father-in-Law', text: '*Laughs* I\'ll try not to!' }
                ]
            ];

            const questionIndex = fatherCallCount % questions.length;
            setTimeout(() => {
                MC.playIncomingCall(game, 'Father-in-Law', questions[questionIndex]);
            }, 3000);
        }
    }
};

// Register scene when loaded
if (window.game) {
    window.game.registerScene('mancave', MancaveScene);
}

if (typeof module !== 'undefined') {
    module.exports = MancaveScene;
}
