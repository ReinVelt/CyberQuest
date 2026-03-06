/**
 * Westerbork Memorial Scene
 * Herinneringscentrum Kamp Westerbork — former transit camp, now memorial.
 * Located 200 m from the WSRT radio telescope array.
 * The same ground now houses WSRT and a covert Bluetooth surveillance node.
 * Reached from: garden → volvo → driving_day → westerbork_memorial
 *              or on foot from ASTRON/WSRT (200 m)
 * Purpose: moral weight of surveillance story + key Bluetooth evidence discovery
 */

const WesterborkMemorialScene = {
    id: 'westerbork_memorial',
    name: 'Westerbork Memorial',

    background: 'assets/images/scenes/westerbork_memorial.svg',

    description: 'Herinneringscentrum Kamp Westerbork. Former transit camp, 1942–1945. WSRT dishes visible on the horizon.',

    playerStart: { x: 50, y: 85 },

    // 🎬 Accessibility / Movie Mode
    // Study the memorial, inspect the modified surveillance camera (Flipper Zero
    // should already be in inventory from the mancave gear section), then walk
    // back to WSRT parking.
    accessibilityPath: [
        'memorial_monument',   // historical context
        'railway_track',       // emotional core of the scene
        'surveillance_camera', // key evidence: Zerfall BT node (needs Flipper Zero)
        'walk_to_wsrt',        // ← back to wsrt_parking hub
    ],

    hotspots: [
        // ── Railway Track ──
        {
            id: 'railway_track',
            name: 'The Railway Track',
            x: 43.75,
            y: 58,
            width: 12.5,
            height: 42,
            cursor: 'pointer',
            action: (game) => {
                const knowsSurveillance = game.getFlag('visited_klooster');
                if (knowsSurveillance) {
                    // Ryan knows about the surveillance network from the USB analysis
                    game.startDialogue([
                        { speaker: 'Ryan', text: '...' },
                        { speaker: 'Ryan', text: 'The track ends here. Right here.' },
                        { speaker: 'Ryan', text: 'Between 1942 and 1945, 102,000 people were put on trains from this spot. To Auschwitz. To Sobibor. To Bergen-Belsen.' },
                        { speaker: 'Ryan', text: 'Anne Frank was on one of those trains.' },
                        { speaker: 'Narrator', text: '*Silence*' },
                        { speaker: 'Ryan', text: 'The Nazis built this camp specifically as a holding and sorting facility. They monitored everyone here. Catalogued them. Assigned them numbers.' },
                        { speaker: 'Ryan', text: 'And now, less than two kilometres from here, someone is running a mass surveillance operation. Using the same ground. The same infrastructure.' },
                        { speaker: 'Ryan', text: 'I don\'t think that\'s a coincidence. I think someone chose this location deliberately.' },
                    ]);
                } else {
                    // Ryan has only been to ASTRON — doesn't know about the surveillance network yet
                    game.startDialogue([
                        { speaker: 'Ryan', text: '...' },
                        { speaker: 'Ryan', text: 'The track ends here. Right here.' },
                        { speaker: 'Ryan', text: 'Between 1942 and 1945, 102,000 people were put on trains from this spot. To Auschwitz. To Sobibor. To Bergen-Belsen.' },
                        { speaker: 'Ryan', text: 'Anne Frank was on one of those trains.' },
                        { speaker: 'Narrator', text: '*Silence*' },
                        { speaker: 'Ryan', text: 'The Nazis built this camp specifically as a holding and sorting facility. They monitored everyone here. Catalogued them. Assigned them numbers.' },
                        { speaker: 'Ryan', text: 'Bureaucratic efficiency applied to genocide. The worst part is how ordinary it all was.' },
                        { speaker: 'Ryan', text: 'And just 200 metres away, the WSRT dishes listen to the cosmos. The contrast is almost unbearable.' },
                    ]);
                }
            }
        },

        // ── Memorial Monument ──
        {
            id: 'memorial_monument',
            name: 'Memorial Monument',
            x: 37.5,
            y: 37.8,
            width: 25,
            height: 17,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*The stone columns stand on either side of the track. Carved into the left column: a Star of David.*' },
                    { speaker: 'Ryan', text: '"Kamp Westerbork 1942–1945." Simple. The dates say everything.' },
                    { speaker: 'Ryan', text: 'More than sixty percent of the deportees were Dutch Jews. The Netherlands had one of the highest deportation rates in Western Europe.' },
                    { speaker: 'Ryan', text: 'The historian Presser called it the "Night of the Girondins" — ordinary bureaucratic efficiency applied to a genocide.' },
                    { speaker: 'Narrator', text: '📚 EDUCATIONAL: Westerbork was originally built in 1939 as a refugee camp for German Jewish refugees. In 1942 the Nazis requisitioned it as a transit camp (Durchgangslager). Today it is a national memorial and documentation centre.' },
                ]);
            }
        },

        // ── Surveillance Camera (KEY GAMEPLAY ELEMENT) ──
        {
            id: 'surveillance_camera',
            name: 'Security Camera',
            // SVG: pole from y=410 to y=700, camera arm from x=1096 to x=1225
            x: (1096 / 1600) * 100,    // 68.50%
            y: (408 / 900) * 100,       // 45.33%
            width: (130 / 1600) * 100,  // 8.13%
            height: (292 / 900) * 100,  // 32.44%
            cursor: 'pointer',
            action: (game) => {
                // Already solved
                if (game.getFlag('westerbork_bt_cracked')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Already documented the Zerfall node. The Flipper caught everything I need.' },
                    ]);
                    return;
                }

                const hasFlipperZero = game.hasItem('flipper_zero');

                // ── Phase 1: Inspect camera (no Flipper or first look) ──────
                if (!game.getFlag('westerbork_camera_inspected')) {
                    const knownNetwork = game.getFlag('visited_klooster');
                    const inspectLines = knownNetwork ? [
                        { speaker: 'Ryan', text: 'That\'s... not a standard memorial camera.' },
                        { speaker: 'Narrator', text: '*Ryan looks more closely at the housing*' },
                        { speaker: 'Ryan', text: 'Hikvision body, but the internals are modified. I can see a secondary PCB through the ventilation slot.' },
                        { speaker: 'Ryan', text: 'That\'s a Bluetooth module. And the LED on the back — it\'s pulsing. Three short blinks, long pause, repeat.' },
                        { speaker: 'Ryan', text: 'No legitimate security camera needs a BLE transmitter. 100-metre Bluetooth range is useless for camera control.' },
                        { speaker: 'Ryan', text: 'The USB data mentioned sensor nodes broadcasting every 90 seconds. This is one of them. Right here on the memorial.' },
                        { speaker: 'Ryan', text: hasFlipperZero
                            ? 'I\'ve got my Flipper Zero. I can scan what it\'s transmitting. Let me try.' 
                            : 'I need the Flipper Zero to read the beacon. I should come back with it.' },
                        { speaker: 'Narrator', text: hasFlipperZero
                            ? '💡 Click the camera again to run the Flipper Zero BLE scan.'
                            : '💡 HINT: Collect the Flipper Zero from the mancave, then return here.' },
                    ] : [
                        { speaker: 'Ryan', text: 'A security camera on a heritage site...' },
                        { speaker: 'Narrator', text: '*Ryan looks more closely*' },
                        { speaker: 'Ryan', text: 'Wait. Hikvision housing, but something has been added — a second PCB through the ventilation slot.' },
                        { speaker: 'Ryan', text: 'That\'s a Bluetooth module. And the LED is pulsing in a deliberate pattern. Three blinks, long pause, three blinks...' },
                        { speaker: 'Ryan', text: 'Why does a memorial camera need Bluetooth? BLE range is at best 100 metres. This isn\'t for camera control.' },
                        { speaker: 'Ryan', text: hasFlipperZero
                            ? 'Good thing I have the Flipper Zero. I can read what it\'s broadcasting right now.' 
                            : 'If I had my Flipper Zero I could scan what it\'s broadcasting. I should come back.' },
                        { speaker: 'Narrator', text: hasFlipperZero
                            ? '💡 Click the camera again to run the Flipper Zero BLE scan.'
                            : '💡 HINT: Get the Flipper Zero from the mancave, then return here.' },
                    ];

                    game.startDialogue(inspectLines, () => {
                        game.setFlag('westerbork_camera_inspected', true);
                        game.addEvidence({
                            id: 'modified_camera',
                            name: 'Modified Surveillance Camera',
                            description: 'Security camera at Westerbork memorial with non-standard Bluetooth module. LED pulses three short blinks / long pause — structured transmission. Likely a ZERFALL sensor node.',
                            icon: '📷'
                        });
                        game.showNotification('📷 Evidence added: Modified Surveillance Camera');
                        if (!game.getFlag('bt_camera_quest_started')) {
                            game.setFlag('bt_camera_quest_started', true);
                            game.addQuest({
                                id: 'trace_bluetooth_network',
                                name: 'Trace the Bluetooth Network',
                                description: 'A modified camera at Westerbork memorial is transmitting Bluetooth signals. Use the Flipper Zero to scan it and identify the node.',
                                hint: 'The USB data mentioned spoofed Apple manufacturer IDs (0x004C) and a 90-second transmission interval.'
                            });
                        }
                    });
                    return;
                }

                // ── Phase 2: Flipper Zero required ───────────────────────────
                if (!hasFlipperZero) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'I can see the Bluetooth module is active — the LED is still pulsing.' },
                        { speaker: 'Ryan', text: 'I need the Flipper Zero to read the BLE beacon. It\'s in the mancave.' },
                        { speaker: 'Narrator', text: '💡 HINT: Collect the Flipper Zero from the mancave gear section, then come back.' },
                    ]);
                    return;
                }

                // ── Phase 3: Flipper Zero BLE Puzzle ─────────────────────────
                // Show a Flipper Zero OLED-style UI listing 3 BLE devices.
                // Player must identify the ZERFALL node using two clues from
                // the USB data: (1) spoofed Apple mfr ID 0x004C,
                //               (2) 90-second advertisement interval.
                // Devices A and B are plausible distractors.
                WesterborkMemorialScene._showFlipperPuzzle(game);
            }
        },

        // ── WSRT Dishes (background) ──
        {
            id: 'wsrt_horizon',
            name: 'WSRT Dishes (distant)',
            x: 0,
            y: 38,
            width: 25,
            height: 15,
            cursor: 'pointer',
            action: (game) => {
                const knowsSurveillance = game.getFlag('visited_klooster');
                if (knowsSurveillance) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The WSRT dishes. Just 300 metres away.' },
                        { speaker: 'Ryan', text: 'The radio telescope was built in the 1960s, right next to this memorial. They chose this flat, radio-quiet stretch of Drenthe deliberately.' },
                        { speaker: 'Ryan', text: 'In a way, I understand the irony. This ground was used to watch and catalogue people. Now it watches the cosmos.' },
                        { speaker: 'Ryan', text: 'Except someone has decided to start watching people again.' },
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The WSRT dishes. Just 300 metres away. I was there an hour ago with Cees.' },
                        { speaker: 'Ryan', text: 'The radio telescope was built in the 1960s, right next to this memorial. They chose this flat, radio-quiet stretch of Drenthe deliberately.' },
                        { speaker: 'Ryan', text: 'This ground was used to watch and catalogue people. Now it watches the cosmos.' },
                        { speaker: 'Ryan', text: 'History and science, side by side. The contrast is staggering.' },
                    ]);
                }
            }
        },

        // ── Information Board ──
        {
            id: 'info_board',
            name: 'Herinneringscentrum Information Board',
            x: 6.25,
            y: 50,
            width: 19,
            height: 9,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Narrator', text: '📚 HERINNERINGSCENTRUM KAMP WESTERBORK' },
                    { speaker: 'Narrator', text: 'From 1942 to 1945, Westerbork served as the main transit camp for Jewish, Sinti, and Roma deportees in the Netherlands.' },
                    { speaker: 'Narrator', text: '102,000 people were deported in 93 transports. Most to Auschwitz-Birkenau and Sobibor. Survival rate: under 5%.' },
                    { speaker: 'Narrator', text: 'Notable deportees include Anne Frank and her family (August 1944), Etty Hillesum, and Philip Mechanicus.' },
                    { speaker: 'Narrator', text: 'The camp was run with meticulous record-keeping — lists, numbers, categories. The bureaucracy of the Holocaust was arguably its most disturbing feature.' },
                    { speaker: 'Narrator', text: 'Today the site is a national monument. The original barrack footprints, the railway track, and the command post building remain as markers.' },
                ]);
            }
        },

        // ── Barbed Wire ──
        {
            id: 'barbed_wire',
            name: 'Remnant Barbed Wire',
            x: 6,
            y: 68,
            width: 18,
            height: 7,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Preserved remnants of the perimeter wire. Left here as part of the memorial.' },
                    { speaker: 'Ryan', text: 'The same wire that kept 102,000 people in. It\'s just iron and steel. The humans on both sides of it are what matters.' },
                ]);
            }
        },

        // ── Walk to WSRT Parking (back to hub) ──
        {
            id: 'walk_to_wsrt',
            name: '← Parking',
            x: 0,
            y: 60,
            width: 8,
            height: 20,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Back to the parking area. The WSRT and the Planetenpad are from there too.' },
                    { speaker: 'Narrator', text: '*Ryan walks across the field toward the parking area*' }
                ], () => {
                    game.loadScene('wsrt_parking');
                });
            }
        },

        // ── Drive home (via parking → Volvo) ──
        {
            id: 'drive_home',
            name: '← Drive Home',
            x: 0,
            y: 80,
            width: 8,
            height: 20,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Time to head home. I need to process all of this.' },
                    { speaker: 'Narrator', text: '*Ryan walks back to the parking area*' }
                ], () => {
                    game.loadScene('wsrt_parking');
                });
            }
        }
    ],

    // ── Flipper Zero BLE Puzzle ──────────────────────────────────────────
    // Shows a Flipper Zero OLED-style interface listing 3 BLE devices.
    // Player identifies the ZERFALL node using two clues already established
    // by the USB analysis:  (1) spoofed Apple mfr 0x004C
    //                       (2) 90-second advertisement interval
    _showFlipperPuzzle: function(game) {
        const existing = document.getElementById('flipper-puzzle-overlay');
        if (existing) existing.remove();

        // Three devices: B is the decoy that looks almost right, C is correct.
        const DEVICES = [
            {
                label: 'A',
                name: 'HK-WB-CAM-01',
                mac:  'B4:A3:82:11:CC:05',
                mfr:  '0x0085  (Hikvision)',
                rssi: '-41 dBm',
                interval: '10 s',
                hint: 'Standard camera vendor ID. Normal status beacon.'
            },
            {
                label: 'B',
                name: 'iBeacon-DE4A',
                mac:  'DE:4A:FF:90:12:AA',
                mfr:  '0x004C  (Apple Inc.)',
                rssi: '-58 dBm',
                interval: '1 s',
                hint: 'Apple mfr ID — but 1-second interval is normal iBeacon behaviour.'
            },
            {
                label: 'C',
                name: 'UNKNOWN-4C-7B',
                mac:  'D0:4A:A1:7B:C2:03',
                mfr:  '0x004C  (Apple Inc.)  ⚑',
                rssi: '-63 dBm',
                interval: '90 s  ⚑',
                hint: null   // correct — no hint, player deduces from clues
            },
        ];
        const CORRECT = 'C';

        const overlay = document.createElement('div');
        overlay.id = 'flipper-puzzle-overlay';
        overlay.style.cssText = [
            'position:fixed','inset:0','z-index:3000',
            'background:rgba(0,0,0,0.82)',
            'display:flex','align-items:center','justify-content:center',
            'font-family:"Courier New",Courier,monospace',
        ].join(';');

        // ── Flipper Zero shell ──
        const shell = document.createElement('div');
        shell.style.cssText = [
            'background:#1a1a1f',
            'border:3px solid #ff6600',
            'border-radius:16px',
            'width:520px','max-width:95vw',
            'padding:0 0 18px 0',
            'box-shadow:0 0 40px rgba(255,102,0,0.25)',
        ].join(';');

        // Flipper top bar
        shell.innerHTML = `
            <div style="background:#ff6600;border-radius:12px 12px 0 0;padding:8px 16px;
                        display:flex;align-items:center;gap:10px;">
                <span style="font-size:20px;">🐬</span>
                <span style="color:#000;font-weight:bold;font-size:13px;letter-spacing:1px;">
                    FLIPPER ZERO — BLE Scanner
                </span>
                <span style="margin-left:auto;color:#000;font-size:10px;opacity:0.7;">v0.82.3</span>
            </div>

            <!-- OLED screen area -->
            <div id="fp-screen" style="
                background:#0a1a0a;margin:12px 14px 6px;border-radius:6px;
                border:1px solid #1a3a1a;padding:12px 14px;
                min-height:220px;
            ">
                <div style="color:#00cc44;font-size:9px;letter-spacing:3px;
                            margin-bottom:8px;">SCANNING... BLE ADV CHANNELS 37/38/39</div>
                <div id="fp-scan-progress" style="color:#006622;font-size:9px;
                            margin-bottom:10px;">
                    ████████████████ 100%  —  3 devices found
                </div>
                <div style="color:#00aa33;font-size:8px;letter-spacing:2px;
                            border-bottom:1px solid #0d2a0d;padding-bottom:6px;
                            margin-bottom:8px; display:grid;
                            grid-template-columns:1.2fr 2fr 1.3fr 1fr 1fr;">
                    <span>#</span><span>NAME</span><span>MFR ID</span>
                    <span>RSSI</span><span>INTV</span>
                </div>
                <div id="fp-device-list"></div>
            </div>

            <!-- Clue reminder -->
            <div style="margin:0 14px 10px;padding:8px 10px;
                        background:rgba(255,204,0,0.06);border:1px solid rgba(255,204,0,0.2);
                        border-radius:4px;font-size:9px;color:#ccaa22;">
                📋 USB data: <em>Nodes use spoofed Apple mfr ID (0x004C) and broadcast every 90 seconds.</em>
            </div>

            <!-- Question -->
            <div style="margin:0 14px;color:#eeeeee;font-size:11px;margin-bottom:10px;">
                Which device is the ZERFALL surveillance node?
            </div>
            <div id="fp-buttons" style="display:flex;gap:10px;padding:0 14px;flex-wrap:wrap;"></div>
            <div id="fp-feedback" style="padding:8px 14px 0;font-size:10px;min-height:20px;"></div>
        `;

        overlay.appendChild(shell);
        document.body.appendChild(overlay);

        // Populate device list
        const list = document.getElementById('fp-device-list');
        DEVICES.forEach(d => {
            const row = document.createElement('div');
            row.style.cssText = [
                'display:grid',
                'grid-template-columns:1.2fr 2fr 1.3fr 1fr 1fr',
                'gap:2px',
                'font-size:9px',
                'padding:5px 0',
                'border-bottom:1px solid #0d1f0d',
                'color:#00bb33',
                'line-height:1.5',
            ].join(';');
            row.innerHTML = `
                <span style="color:#00ff44;font-weight:bold;">${d.label}</span>
                <span>${d.name}</span>
                <span style="color:${d.mfr.includes('⚑') ? '#ffcc00' : '#007722'}">${d.mfr.replace(' ⚑','')}</span>
                <span>${d.rssi}</span>
                <span style="color:${d.interval.includes('⚑') ? '#ffcc00' : '#007722'}">${d.interval.replace(' ⚑','')}</span>
            `;
            list.appendChild(row);
        });

        // Choice buttons
        const btnContainer = document.getElementById('fp-buttons');
        const feedback = document.getElementById('fp-feedback');
        let attempts = 0;

        DEVICES.forEach(d => {
            const btn = document.createElement('button');
            btn.style.cssText = [
                'background:#0d1f0d','border:1px solid #00aa33',
                'color:#00cc44','padding:7px 18px','border-radius:4px',
                'font-family:"Courier New",Courier,monospace','font-size:11px',
                'cursor:pointer','letter-spacing:1px',
                'transition:background 0.15s',
            ].join(';');
            btn.textContent = `Device ${d.label}`;
            btn.onmouseover = () => { btn.style.background = '#152a15'; };
            btn.onmouseout  = () => { btn.style.background = '#0d1f0d'; };

            btn.onclick = () => {
                if (d.label === CORRECT) {
                    // ── SUCCESS ──
                    feedback.style.color = '#00ff44';
                    feedback.textContent = '✓ MATCH — device C: spoofed 0x004C + 90s interval = ZERFALL node confirmed.';
                    btnContainer.querySelectorAll('button').forEach(b => b.disabled = true);

                    setTimeout(() => {
                        overlay.remove();
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'Device C. "UNKNOWN-4C-7B" — spoofed as Apple hardware, broadcasting every 90 seconds exactly.' },
                            { speaker: 'Ryan', text: 'The MAC: D0:4A:A1. That prefix... let me check. That\'s not an Apple OUI. It\'s been fabricated.' },
                            { speaker: 'Narrator', text: '*The Flipper Zero captures the full BLE advertisement frame*' },
                            { speaker: 'Ryan', text: 'Node name in the payload: "ZERFALL-NODE-WB01". There it is.' },
                            { speaker: 'Ryan', text: 'Encrypted HCI payload. Timestamp counter. And the MAC structure matches what the USB logs described.' },
                            { speaker: 'Ryan', text: 'Right here. On a Holocaust memorial. They put their surveillance node on a Holocaust memorial.' },
                            { speaker: 'Narrator', text: '*Ryan stands still for a moment*' },
                            { speaker: 'Ryan', text: 'I\'ve got the data. Let\'s go.' },
                        ], () => {
                            game.setFlag('westerbork_bt_cracked', true);
                            game.setFlag('zerfall_network_mapped', true);
                            game.addEvidence({
                                id: 'zerfall_bt_node',
                                name: 'ZERFALL-NODE-WB01 Bluetooth Data',
                                description: 'BLE beacon at Westerbork: name "ZERFALL-NODE-WB01", spoofed Apple mfr ID (0x004C), MAC D0:4A:A1:7B:C2:03. Transmits encrypted HCI payload every 90 seconds. MAC prefix matches other Zerfall nodes.',
                                icon: '📱'
                            });
                            game.showNotification('📱 Evidence added: ZERFALL-NODE-WB01 Bluetooth data');
                            game.completeQuest('trace_bluetooth_network');
                        });
                    }, 1800);

                } else {
                    // ── WRONG ──
                    attempts++;
                    btn.style.background  = '#2a0d0d';
                    btn.style.borderColor = '#cc2222';
                    btn.style.color       = '#cc4444';
                    btn.disabled = true;

                    if (d.label === 'A') {
                        feedback.style.color = '#cc6644';
                        feedback.textContent = '✗ Device A — manufacturer 0x0085 is genuine Hikvision. Not 0x004C. Normal camera beacon.';
                    } else {
                        feedback.style.color = '#cc6644';
                        feedback.textContent = '✗ Device B — 0x004C matches, but 1-second interval is standard iBeacon. The USB data said 90 seconds.';
                    }

                    if (attempts >= 2) {
                        setTimeout(() => {
                            feedback.style.color = '#ffcc44';
                            feedback.innerHTML += '<br>💡 Both clues must match: manufacturer 0x004C <em>and</em> 90-second interval.';
                        }, 400);
                    }
                }
            };
            btnContainer.appendChild(btn);
        });

        // ESC or click outside closes (before solved — just dismisses)
        overlay.addEventListener('click', e => {
            if (e.target === overlay) overlay.remove();
        });
        const onKey = e => {
            if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); }
        };
        document.addEventListener('keydown', onKey);
    },

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
            master.gain.linearRampToValueAtTime(1, ctx.currentTime + 5);
            master.connect(ctx.destination);
            self._audioNodes.push(master);
            // ── very gentle breeze through grass ──
            var buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var wind = ctx.createBufferSource(); wind.buffer = buf; wind.loop = true;
            var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260;
            var wG = ctx.createGain(); wG.gain.value = 0.018;
            wind.connect(lp).connect(wG).connect(master); wind.start();
            self._audioNodes.push(wind, lp, wG);
            // ── solemn low hum ──
            var hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 48;
            var humG = ctx.createGain(); humG.gain.value = 0.010;
            hum.connect(humG).connect(master); hum.start();
            self._audioNodes.push(hum, humG);
            // ── occasional distant bird (sparse, solemn) ──
            var bi = setInterval(function() {
                if (!self._audioCtx) return;
                var t = ctx.currentTime;
                var osc = ctx.createOscillator(); osc.type = 'sine';
                osc.frequency.setValueAtTime(2200, t);
                osc.frequency.linearRampToValueAtTime(2600, t + 0.15);
                var env = ctx.createGain();
                env.gain.setValueAtTime(0, t);
                env.gain.linearRampToValueAtTime(0.016, t + 0.03);
                env.gain.linearRampToValueAtTime(0, t + 0.20);
                osc.connect(env).connect(master); osc.start(t); osc.stop(t + 0.22);
                self._audioNodes.push(osc, env);
            }, 8000 + Math.random() * 12000);
            self._audioIntervals.push(bi);
        } catch(e) {}
    },

    onEnter: (game) => {
        WesterborkMemorialScene._startAmbientAudio();
        if (!game.getFlag('visited_westerbork_memorial')) {
            game.setFlag('visited_westerbork_memorial', true);
            const knowsSurveillance = game.getFlag('visited_klooster');
            setTimeout(() => {
                if (knowsSurveillance) {
                    // Ryan has USB data, knows about the surveillance network
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The memorial. I\'ve been here before but it never gets easier.' },
                        { speaker: 'Ryan', text: 'The railway track. The stones. The flat Drenthe sky.' },
                        { speaker: 'Narrator', text: '*Ryan is quiet for a moment*' },
                        { speaker: 'Ryan', text: 'The USB data mentioned sensor nodes across the region. And the WSRT signal logs pointed toward this area.' },
                        { speaker: 'Ryan', text: 'If they\'ve placed surveillance equipment on a Holocaust memorial site...' },
                        { speaker: 'Ryan', text: 'That camera on the pole. It doesn\'t look right.' },
                    ]);
                } else {
                    // Ryan only knows about WSRT radio anomalies — visiting after ASTRON
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The memorial. I\'ve been here before but it never gets easier.' },
                        { speaker: 'Ryan', text: 'The railway track. The stones. The flat Drenthe sky.' },
                        { speaker: 'Narrator', text: '*Ryan is quiet for a moment*' },
                        { speaker: 'Ryan', text: 'Cees mentioned the WSRT dishes are just 200 metres away. The same ground, but worlds apart.' },
                        { speaker: 'Ryan', text: 'Hmm. That camera on the pole — is that new? Something about it looks off.' },
                    ]);
                }
            }, 600);
        }
    },

    onExit: () => { WesterborkMemorialScene._stopAmbientAudio(); }
};

if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(WesterborkMemorialScene);
}
