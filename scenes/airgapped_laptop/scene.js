/**
 * Air-Gapped Laptop Scene — ThinkPad X230 forensic workstation
 * Handles: forensic boot prep, USB file listing, README reveal,
 *          schematics analysis, evidence.zip password puzzle,
 *          casualty report. Write-blocker + Faraday bag as bonus hotspots.
 *
 * Reached from: mancave → airgapped-laptop hotspot
 * Returns to:   mancave (via back_to_mancave)
 *
 * Hotspots:
 *   airgapped_screen    — main forensic analysis (multi-phase, flag-driven)
 *   session_logs        — scrollable terminal replay of all past sessions
 *   write_blocker       — examine the Tableau T35u hardware
 *   faraday_bag         — examine the Faraday shielding bag
 *   forensic_notes      — read investigator notes on desk
 *   back_to_mancave     — return
 */

/**
 * Build a scrollable terminal-style session log from story flags.
 * Returns an array of plain text lines for _showLaptopTerminal().
 */
function _buildAirgappedSessionLog(game) {
    const msgs = [
        '╔══════════════════════════════════════════════════════╗',
        '║       FORENSIC SESSION LOG — ThinkPad X230           ║',
        '║       root@airgapped — Air-Gap Verified               ║',
        '╚══════════════════════════════════════════════════════╝',
    ];

    // ── Session 1: Forensic Boot & Prep ──────────────────────
    if (game.getFlag('forensic_prep_complete')) {
        msgs.push(
            '',
            '[ SESSION 1 — FORENSIC ENVIRONMENT SETUP ]',
            'System:   ThinkPad X230  |  Kali Linux (forensic mode)',
            'Network:  ALL INTERFACES REMOVED (hardware kill)',
            'Firmware: Coreboot v4.19 (Libreboot)',
            'Bridge:   Tableau T35u — READ ENABLED / WRITE BLOCKED',
            'SHA-256 checksums verified: 5 files  ✓',
            'Sandbox:  Firejail --net=none --private  ACTIVE',
            'Status:   FORENSIC ENVIRONMENT READY — No leaks. No traces.',
        );
    }

    // ── Session 2: USB File Listing + README ─────────────────
    if (game.getFlag('usb_analyzed')) {
        msgs.push(
            '',
            '[ SESSION 2 — USB ANALYSIS: EVIDENCE_01 ]',
            '> mount /dev/sdb1 (read-only via Tableau T35u)',
            '> ls /mnt/usb/:',
            '  README.txt              4.2 KB  2026-02-05 18:42',
            '  echo_schematics.pdf     2.1 MB  2026-02-04 03:17',
            '  evidence.zip            847 MB  2026-02-05 12:33  🔒',
            '',
            '── README.txt ──────────────────────── FROM: E',
            '"Ryan, If you\'re reading this, you received my signal and you\'re smarter than I thought."',
            '"Project Echo — an RF weapon at Steckerdoser Heide, Germany."',
            '"Range: ~5 km. Can disable electronics, crash vehicles, interrupt medical devices."',
            '"The encrypted archive: internal emails, test results, casualty reports."',
            '"The password is the frequency you tuned into. You\'ll know it when you see it."',
            '"72 hours from the file timestamp. After that — real deployment. Real casualties."',
            '"Use air-gapped systems only. Encrypt everything. Trust no one until verified."',
            '"Good luck, Ryan. — E"',
            '"P.S. 906.875. I\'m listening."',
        );
    }

    // ── Session 3: Schematics ─────────────────────────────────
    if (game.getFlag('viewed_schematics')) {
        msgs.push(
            '',
            '[ SESSION 3 — ECHO SCHEMATICS  ⚠ STRENG GEHEIM ]',
            'File: echo_schematics.pdf  |  Classification: TOP SECRET',
            'System architecture: phase-locked antenna array, multi-band signal processor',
            'Power amplifier rated for 5 km+ effective range',
            'Targeting: GPS spoofing + selective frequency jamming (900 MHz / 2.4 GHz / VHF/UHF)',
            '[Ryan] Directional EM pulse weapon. They can disable anything electronic.',
            '[Ryan] Cars, planes, medical devices — all vulnerable within 5 km.',
        );
    }

    // ── Session 4: Evidence.zip + Casualty Report ─────────────
    if (game.getFlag('evidence_unlocked')) {
        msgs.push(
            '',
            '[ SESSION 4 — EVIDENCE.ZIP DECRYPTED ]',
            'Password: 243 MHz  |  Archive integrity: ✓',
            '',
            '── PROJECT ECHO — INCIDENT LOG ─────────────────────',
            'ECHO-7   2024-03-14  BMW 5-series   → 1 dead, 2 injured',
            '         Cover: "Driver error"   |  Freq: 2.4 GHz burst, 250ms',
            'ECHO-8   2024-06-22  Cessna 172    → 2 dead',
            '         Cover: "Pilot error"    |  Freq: Multi-band VHF/UHF sweep',
            'ECHO-9   2024-09-11  A31 highway   → 3 dead, 7 injured',
            '         Cover: "Fog/distraction" |  Freq: 900 MHz targeted burst',
            'ECHO-10  2025-04-03  SURGERY TABLE → 1 dead (Marlies Bakker, 67, oma van 4)',
            '         Cover: "Equipment failure"|  Freq: 2.4 GHz sustained interference',
            'ECHO-11  2025-10-19  Drone swarm   → no fatalities',
            '         Cover: "Software glitch"  |  Freq: GPS spoof + control jam',
            'ECHO-12  2026-01-28  Ambulance     → 1 dead (patient en route)',
            '         Cover: "Equipment age"    |  Freq: Multi-vector attack',
            '',
            '    ████  8 FATALITIES  ·  9+ INJURED  ████',
            '"Civilian casualties deemed ACCEPTABLE" — signed: V',
            '"Phase 3 authorization pending — Urban Environment Testing"',
        );

        // Tally score
        const phases = [
            game.getFlag('forensic_prep_complete'),
            game.getFlag('usb_analyzed'),
            game.getFlag('viewed_schematics'),
            game.getFlag('evidence_unlocked'),
        ].filter(Boolean).length;

        msgs.push(
            '',
            `══ ${phases}/4 sessions complete — Evidence integrity: MAINTAINED ══`,
            'All files remain encrypted on air-gapped ThinkPad. Never touched a network.',
        );
    }

    if (msgs.length <= 4) {
        msgs.push(
            '',
            '[ NO SESSIONS RECORDED ]',
            'Insert USB stick and click the forensic workstation to begin.',
        );
    }

    return msgs;
}

/**
 * Render terminal lines directly onto the laptop screen area.
 * Creates a positioned overlay matching the airgapped_screen hotspot.
 * Click anywhere or press ESC to dismiss.
 */
function _showLaptopTerminal(lines) {
    // Remove any existing terminal overlay
    const existing = document.getElementById('airgapped-terminal-overlay');
    if (existing) existing.remove();

    // Full-screen backdrop to capture dismiss clicks
    const backdrop = document.createElement('div');
    backdrop.id = 'airgapped-terminal-overlay';
    backdrop.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:2000',
        'display:flex', 'align-items:flex-start', 'justify-content:center',
        'background:rgba(0,0,0,0.55)',
        'cursor:pointer',
    ].join(';');

    // Terminal window — sized & positioned to sit over the laptop screen
    // Scene hotspot: x=33% y=10% w=32% h=50% of viewport
    const term = document.createElement('div');
    term.style.cssText = [
        'position:absolute',
        'left:33%', 'top:10%',
        'width:32%', 'height:50%',
        'background:#0a0f0a',
        'border:2px solid #1a3a1a',
        'box-shadow:0 0 32px rgba(0,255,65,0.18), inset 0 0 60px rgba(0,0,0,0.8)',
        'overflow-y:auto',
        'padding:12px 14px',
        'box-sizing:border-box',
        'cursor:default',
        'font-family:\'Courier New\',Courier,monospace',
        'font-size:11px',
        'line-height:1.55',
        'color:#00ff41',
        // CRT scanline overlay
        'background-image:repeating-linear-gradient(transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px)',
    ].join(';');

    // Stop clicks inside the terminal from closing
    term.addEventListener('click', e => e.stopPropagation());

    // Render lines
    lines.forEach(line => {
        const div = document.createElement('div');
        div.style.cssText = 'white-space:pre;min-height:1em;';
        if (line.startsWith('[Ryan]')) {
            div.style.color = '#88ddff';
            div.textContent = line;
        } else if (line.startsWith('[ SESSION') || line.startsWith('══')) {
            div.style.color = '#ffcc00';
            div.style.fontWeight = 'bold';
            div.textContent = line;
        } else if (line.includes('FATALITIES') || line.includes('ACCEPTABLE') || line.includes('dead')) {
            div.style.color = '#ff4444';
            div.textContent = line;
        } else if (line.startsWith('╔') || line.startsWith('║') || line.startsWith('╚')) {
            div.style.color = '#00cc33';
            div.textContent = line;
        } else {
            div.textContent = line;
        }
        term.appendChild(div);
    });

    // Close hint
    const hint = document.createElement('div');
    hint.style.cssText = 'margin-top:12px;color:rgba(0,255,65,0.35);font-size:10px;text-align:right;';
    hint.textContent = '[ click outside or ESC to close ]';
    term.appendChild(hint);

    backdrop.appendChild(term);
    document.body.appendChild(backdrop);

    // Scroll to bottom after render
    requestAnimationFrame(() => { term.scrollTop = term.scrollHeight; });

    const close = () => { backdrop.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
}

const AirgappedLaptopScene = {
    id: 'airgapped_laptop',
    name: 'Air-Gapped Forensic Workstation',

    background: 'assets/images/scenes/airgapped_laptop.svg',

    description: 'A ThinkPad X230 with all network interfaces physically removed. Kali Linux forensic mode. A Tableau T35u write-blocker bridges the USB evidence.',

    playerStart: { x: 50, y: 80 },

    // 🎬 Movie Mode: work through all analysis phases, review log, then back
    accessibilityPath: ['airgapped_screen', 'session_logs', 'back_to_mancave'],

    idleThoughts: [
        "Air-gapped means air-gapped. WiFi card physically removed.",
        "ThinkPad X230 — Coreboot firmware, full disk encryption.",
        "The Tableau T35u write-blocker: nothing gets written back to the USB.",
        "SHA-256 checksums before and after. Evidence chain of custody.",
        "Firejail sandbox. Even the processes can't talk to each other.",
        "72 hours. The clock is running.",
        "Marlies Bakker. Sixty-seven. Four grandchildren.",
    ],

    hotspots: [

        // ── Main Screen — forensic analysis (multi-phase) ──────────────
        {
            id: 'airgapped_screen',
            name: 'Forensic Workstation',
            x: 33, y: 10, width: 32, height: 50,
            cursor: 'pointer',
            action: function(game) {

                // Need USB stick to do anything useful
                if (!game.hasItem('usb_stick')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My air-gapped ThinkPad. Totally off the grid.' },
                        { speaker: 'Ryan', text: 'Nothing goes in or out unless I put it there physically.' },
                        { speaker: 'Ryan', text: 'I need something to analyze first.' },
                    ]);
                    return;
                }

                // Phase 0 — forensic boot + write-blocker + checksums + sandbox
                if (!game.getFlag('forensic_prep_complete')) {
                    window.MancaveForensicAnalysis.play(game);
                    return;
                }

                // Phase 1+2 — USB file listing + README reveal
                if (!game.getFlag('usb_analyzed')) {
                    window.MancaveUSBAnalysis.playInsertUSB(game);
                    return;
                }

                // Phase 3 — echo schematics
                if (!game.getFlag('viewed_schematics')) {
                    window.MancaveUSBAnalysis.playSchematics(game);
                    return;
                }

                // Phase 4+5 — evidence.zip password + casualty report
                if (!game.getFlag('evidence_unlocked')) {
                    window.MancaveUSBAnalysis.playPassword(game);
                    return;
                }

                // All phases complete — show full session history log
                _showLaptopTerminal(_buildAirgappedSessionLog(game));
            }
        },

        // ── Session Logs — terminal replay of all past analysis sessions ──
        {
            id: 'session_logs',
            name: '📋 Session Log',
            x: 66, y: 10, width: 7, height: 8,
            cursor: 'look',
            action: function(game) {
                _showLaptopTerminal(_buildAirgappedSessionLog(game));
            }
        },

        // ── Write-Blocker hardware ──────────────────────────────────────
        {
            id: 'write_blocker',
            name: 'Tableau T35u',
            x: 72, y: 57, width: 14, height: 15,
            cursor: 'look',
            action: function(game) {
                const inserted = game.hasItem('usb_stick') || game.getFlag('usb_analyzed');
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Tableau T35u — the industry standard for forensic USB bridging.' },
                    { speaker: 'Ryan', text: 'READ light is green. WRITE light is permanently red. Nothing can write back to the evidence drive.' },
                    inserted
                        ? { speaker: 'Ryan', text: 'USB activity LED is blinking. Active analysis session in progress.' }
                        : { speaker: 'Ryan', text: 'No device connected yet.' },
                    { speaker: 'Ryan', text: 'When you appear in court with this evidence, the write-blocker is what proves you didn\'t tamper with it.' },
                ]);
            }
        },

        // ── Faraday Bag ────────────────────────────────────────────────
        {
            id: 'faraday_bag',
            name: 'Faraday Bag',
            x: 18, y: 64, width: 9, height: 12,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Mission Darkness TitanRF Faraday bag. 80 dB attenuation.' },
                    { speaker: 'Ryan', text: 'Any mobile phone or USB device inside is completely isolated.' },
                    { speaker: 'Ryan', text: 'GSM, WiFi, Bluetooth, NFC — all blocked.' },
                    { speaker: 'Ryan', text: 'The USB from the README: "trust the process — air-gapped only." They weren\'t joking.' },
                ]);
            }
        },

        // ── Forensic Notes ─────────────────────────────────────────────
        {
            id: 'forensic_notes',
            name: 'Forensic Notes',
            x: 86, y: 72, width: 11, height: 23,
            cursor: 'look',
            action: function(game) {
                if (!game.getFlag('usb_analyzed')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My forensic log. Step-by-step chain-of-custody record.' },
                        { speaker: 'Ryan', text: 'Nothing written here yet. Need to actually run the analysis first.' },
                    ]);
                    return;
                }

                // Full session log once evidence is unlocked; brief notes otherwise
                if (game.getFlag('evidence_unlocked')) {
                    _showLaptopTerminal(_buildAirgappedSessionLog(game));
                    return;
                }

                const lines = [
                    { speaker: 'Ryan', text: 'My forensic log. Step-by-step chain-of-custody record.' },
                    { speaker: 'Ryan', text: 'USB label: EVIDENCE_01. SHA-256 matches record. Write-blocker verified.' },
                ];

                if (game.getFlag('viewed_schematics')) {
                    lines.push({ speaker: 'Ryan', text: 'Schematics: directional EM pulse weapon. Phase-locked antenna array. 5km range.' });
                }

                lines.push({ speaker: 'Ryan', text: '⚠ Destroy USB after copying files. — E' });
                game.startDialogue(lines);
            }
        },

        // ── Back to Mancave ────────────────────────────────────────────
        {
            id: 'back_to_mancave',
            name: '← Mancave',
            x: 88, y: 88, width: 12, height: 12,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                game.loadScene('mancave');
            }
        }
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
            master.gain.linearRampToValueAtTime(1, ctx.currentTime + 3);
            master.connect(ctx.destination);
            self._audioNodes.push(master);
            // ── computer fan drone ──
            var buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var fan = ctx.createBufferSource(); fan.buffer = buf; fan.loop = true;
            var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650;
            var fanG = ctx.createGain(); fanG.gain.value = 0.04;
            fan.connect(lp).connect(fanG).connect(master); fan.start();
            self._audioNodes.push(fan, lp, fanG);
            // ── 60 Hz power hum ──
            var hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 60;
            var humG = ctx.createGain(); humG.gain.value = 0.015;
            hum.connect(humG).connect(master); hum.start();
            self._audioNodes.push(hum, humG);
            // ── 120 Hz fluorescent flicker ──
            var fl = ctx.createOscillator(); fl.type = 'sine'; fl.frequency.value = 120;
            var flG = ctx.createGain(); flG.gain.value = 0.008;
            fl.connect(flG).connect(master); fl.start();
            self._audioNodes.push(fl, flG);
            // ── periodic HDD seek click ──
            var ci = setInterval(function() {
                if (!self._audioCtx) return;
                var t = ctx.currentTime;
                var osc = ctx.createOscillator(); osc.type = 'square'; osc.frequency.value = 900;
                var env = ctx.createGain();
                env.gain.setValueAtTime(0.04, t);
                env.gain.linearRampToValueAtTime(0, t + 0.012);
                osc.connect(env).connect(master); osc.start(t); osc.stop(t + 0.015);
                self._audioNodes.push(osc, env);
            }, 3500 + Math.random() * 6000);
            self._audioIntervals.push(ci);
        } catch(e) {}
    },

    onEnter: function(game) { AirgappedLaptopScene._startAmbientAudio(); },
    onExit: function(game) {
        AirgappedLaptopScene._stopAmbientAudio();
        // Remove terminal overlay if player exits while the modal is open
        document.getElementById('airgapped-terminal-overlay')?.remove();
    }
};

if (typeof module !== 'undefined') {
    module.exports = AirgappedLaptopScene;
}
