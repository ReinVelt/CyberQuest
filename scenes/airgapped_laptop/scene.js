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
 * Returns an array of { speaker, text } entries for game.startDialogue().
 * Each entry is a line of the forensic terminal session log.
 */
function _buildAirgappedSessionLog(game) {
    const msgs = [
        { speaker: 'Terminal', text: '╔══════════════════════════════════════════════════════╗' },
        { speaker: 'Terminal', text: '║       FORENSIC SESSION LOG — ThinkPad X230           ║' },
        { speaker: 'Terminal', text: '║       root@airgapped — Air-Gap Verified               ║' },
        { speaker: 'Terminal', text: '╚══════════════════════════════════════════════════════╝' },
    ];

    // ── Session 1: Forensic Boot & Prep ──────────────────────
    if (game.getFlag('forensic_prep_complete')) {
        msgs.push(
            { speaker: 'Terminal', text: '' },
            { speaker: 'Terminal', text: '[ SESSION 1 — FORENSIC ENVIRONMENT SETUP ]' },
            { speaker: 'Terminal', text: 'System:   ThinkPad X230  |  Kali Linux (forensic mode)' },
            { speaker: 'Terminal', text: 'Network:  ALL INTERFACES REMOVED (hardware kill)' },
            { speaker: 'Terminal', text: 'Firmware: Coreboot v4.19 (Libreboot)' },
            { speaker: 'Terminal', text: 'Bridge:   Tableau T35u — READ ENABLED / WRITE BLOCKED' },
            { speaker: 'Terminal', text: 'SHA-256 checksums verified: 5 files  ✓' },
            { speaker: 'Terminal', text: 'Sandbox:  Firejail --net=none --private  ACTIVE' },
            { speaker: 'Terminal', text: 'Status:   FORENSIC ENVIRONMENT READY — No leaks. No traces.' },
        );
    }

    // ── Session 2: USB File Listing + README ─────────────────
    if (game.getFlag('usb_analyzed')) {
        msgs.push(
            { speaker: 'Terminal', text: '' },
            { speaker: 'Terminal', text: '[ SESSION 2 — USB ANALYSIS: EVIDENCE_01 ]' },
            { speaker: 'Terminal', text: '> mount /dev/sdb1 (read-only via Tableau T35u)' },
            { speaker: 'Terminal', text: '> ls /mnt/usb/:' },
            { speaker: 'Terminal', text: '  README.txt              4.2 KB  2026-02-05 18:42' },
            { speaker: 'Terminal', text: '  echo_schematics.pdf     2.1 MB  2026-02-04 03:17' },
            { speaker: 'Terminal', text: '  evidence.zip            847 MB  2026-02-05 12:33  🔒' },
            { speaker: 'Terminal', text: '' },
            { speaker: 'Terminal', text: '── README.txt ──────────────────────── FROM: E' },
            { speaker: 'Terminal', text: '"Ryan, If you\'re reading this, you received my signal and you\'re smarter than I thought."' },
            { speaker: 'Terminal', text: '"Project Echo — an RF weapon at Steckerdoser Heide, Germany."' },
            { speaker: 'Terminal', text: '"Range: ~5 km. Can disable electronics, crash vehicles, interrupt medical devices."' },
            { speaker: 'Terminal', text: '"The encrypted archive: internal emails, test results, casualty reports."' },
            { speaker: 'Terminal', text: '"The password is the frequency you tuned into. You\'ll know it when you see it."' },
            { speaker: 'Terminal', text: '"72 hours from the file timestamp. After that — real deployment. Real casualties."' },
            { speaker: 'Terminal', text: '"Use air-gapped systems only. Encrypt everything. Trust no one until verified."' },
            { speaker: 'Terminal', text: '"Good luck, Ryan. — E"' },
            { speaker: 'Terminal', text: '"P.S. 906.875. I\'m listening."' },
        );
    }

    // ── Session 3: Schematics ─────────────────────────────────
    if (game.getFlag('viewed_schematics')) {
        msgs.push(
            { speaker: 'Terminal', text: '' },
            { speaker: 'Terminal', text: '[ SESSION 3 — ECHO SCHEMATICS  ⚠ STRENG GEHEIM ]' },
            { speaker: 'Terminal', text: 'File: echo_schematics.pdf  |  Classification: TOP SECRET' },
            { speaker: 'Terminal', text: 'System architecture: phase-locked antenna array, multi-band signal processor' },
            { speaker: 'Terminal', text: 'Power amplifier rated for 5 km+ effective range' },
            { speaker: 'Terminal', text: 'Targeting: GPS spoofing + selective frequency jamming (900 MHz / 2.4 GHz / VHF/UHF)' },
            { speaker: 'Terminal', text: '[Ryan] Directional EM pulse weapon. They can disable anything electronic.' },
            { speaker: 'Terminal', text: '[Ryan] Cars, planes, medical devices — all vulnerable within 5 km.' },
        );
    }

    // ── Session 4: Evidence.zip + Casualty Report ─────────────
    if (game.getFlag('evidence_unlocked')) {
        msgs.push(
            { speaker: 'Terminal', text: '' },
            { speaker: 'Terminal', text: '[ SESSION 4 — EVIDENCE.ZIP DECRYPTED ]' },
            { speaker: 'Terminal', text: 'Password: 243 MHz  |  Archive integrity: ✓' },
            { speaker: 'Terminal', text: '' },
            { speaker: 'Terminal', text: '── PROJECT ECHO — INCIDENT LOG ─────────────────────' },
            { speaker: 'Terminal', text: 'ECHO-7   2024-03-14  BMW 5-series   → 1 dead, 2 injured' },
            { speaker: 'Terminal', text: '         Cover: "Driver error"   |  Freq: 2.4 GHz burst, 250ms' },
            { speaker: 'Terminal', text: 'ECHO-8   2024-06-22  Cessna 172    → 2 dead' },
            { speaker: 'Terminal', text: '         Cover: "Pilot error"    |  Freq: Multi-band VHF/UHF sweep' },
            { speaker: 'Terminal', text: 'ECHO-9   2024-09-11  A31 highway   → 3 dead, 7 injured' },
            { speaker: 'Terminal', text: '         Cover: "Fog/distraction" |  Freq: 900 MHz targeted burst' },
            { speaker: 'Terminal', text: 'ECHO-10  2025-04-03  SURGERY TABLE → 1 dead (Marlies Bakker, 67, oma van 4)' },
            { speaker: 'Terminal', text: '         Cover: "Equipment failure"|  Freq: 2.4 GHz sustained interference' },
            { speaker: 'Terminal', text: 'ECHO-11  2025-10-19  Drone swarm   → no fatalities' },
            { speaker: 'Terminal', text: '         Cover: "Software glitch"  |  Freq: GPS spoof + control jam' },
            { speaker: 'Terminal', text: 'ECHO-12  2026-01-28  Ambulance     → 1 dead (patient en route)' },
            { speaker: 'Terminal', text: '         Cover: "Equipment age"    |  Freq: Multi-vector attack' },
            { speaker: 'Terminal', text: '' },
            { speaker: 'Terminal', text: '    ████  8 FATALITIES  ·  9+ INJURED  ████' },
            { speaker: 'Terminal', text: '"Civilian casualties deemed ACCEPTABLE" — signed: V' },
            { speaker: 'Terminal', text: '"Phase 3 authorization pending — Urban Environment Testing"' },
        );

        // Tally score
        const phases = [
            game.getFlag('forensic_prep_complete'),
            game.getFlag('usb_analyzed'),
            game.getFlag('viewed_schematics'),
            game.getFlag('evidence_unlocked'),
        ].filter(Boolean).length;

        msgs.push(
            { speaker: 'Terminal', text: '' },
            { speaker: 'Terminal', text: `══ ${phases}/4 sessions complete — Evidence integrity: MAINTAINED ══` },
            { speaker: 'Terminal', text: 'All files remain encrypted on air-gapped ThinkPad. Never touched a network.' },
        );
    }

    if (msgs.length <= 4) {
        // Nothing logged yet
        msgs.push(
            { speaker: 'Terminal', text: '' },
            { speaker: 'Terminal', text: '[ NO SESSIONS RECORDED ]' },
            { speaker: 'Terminal', text: 'Insert USB stick and click the forensic workstation to begin.' },
        );
    }

    return msgs;
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
                game.startDialogue(_buildAirgappedSessionLog(game));
            }
        },

        // ── Session Logs — terminal replay of all past analysis sessions ──
        {
            id: 'session_logs',
            name: '📋 Session Log',
            x: 66, y: 10, width: 7, height: 8,
            cursor: 'look',
            action: function(game) {
                game.startDialogue(_buildAirgappedSessionLog(game));
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
                    game.startDialogue(_buildAirgappedSessionLog(game));
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

    onEnter: function(game) {},
    onExit: function(game) {}
};

if (typeof module !== 'undefined') {
    module.exports = AirgappedLaptopScene;
}
