/**
 * Mancave – USB Analysis Cinematic Sequence
 * ═══════════════════════════════════════════════════════════
 * Multi-phase Hollywood reveal of USB contents:
 *   Phase 1 – USB Inserted (file listing animation)
 *   Phase 2 – README.txt (typewriter reveal with highlights)
 *   Phase 3 – Schematics (SVG fade-in with STRENG GEHEIM stamp)
 *   Phase 4 – Evidence.zip password (delegates to game.showPasswordPuzzle)
 *   Phase 5 – Casualty Report (card-by-card reveal with death counter)
 *   Phase 6 – Ryan's reaction + quest update
 *
 * Flags set: usb_analyzed, viewed_schematics, evidence_unlocked
 * ═══════════════════════════════════════════════════════════
 */

window.MancaveUSBAnalysis = (function () {
    'use strict';
    const MC = window.MancaveCinematic;

    /* ── README content ────────────────────────────────────── */
    const README_TEXT = `TRUST THE PROCESS

Ryan,

If you're reading this, you received my signal and you're smarter than I thought.

What you have here is evidence of Project Echo - a radiofrequency weapon being developed at the Steckerdoser Heide facility in Germany.

The schematics are simplified but real. This device can manipulate electromagnetic fields at specific frequencies to disable electronics, crash vehicles, interrupt medical devices. Range: approximately 5 kilometers. Power output: classified, but sufficient to cause mass chaos.

The encrypted archive contains the proof you'll need: internal emails, test results, casualty reports from "calibration accidents." The password is the frequency you tuned into. You'll know it when you see it.

Time is short. 72 hours from the timestamp on this file. After that, the project moves to final testing phase. Real deployment. Real casualties.

I can't go through normal channels. The people protecting this project have infiltrated too deep - military, intelligence, possibly government. Anyone I approach directly will be silenced. Including me.

You're being watched. Use air-gapped systems only. Encrypt everything. Trust no one until you can verify their identity through secure channels.

Study the evidence. You'll see why this can't go public through conventional means. We need allies. Technical experts who understand what this technology can do. And we need them fast.

Good luck, Ryan. The fate of a lot of innocent people depends on what you do next.

- E

P.S. Destroy this USB after copying the files. It's traceable.`;

    const README_HIGHLIGHTS = [
        { text: 'Project Echo', class: 'mc-highlight-yellow' },
        { text: 'Steckerdoser Heide', class: 'mc-highlight-yellow' },
        { text: '5 kilometers', class: 'mc-highlight' },
        { text: 'mass chaos', class: 'mc-highlight' },
        { text: '72 hours', class: 'mc-highlight' },
        { text: 'Trust no one', class: 'mc-highlight' },
        { text: 'casualty reports', class: 'mc-highlight' },
        { text: 'silenced', class: 'mc-highlight' },
    ];

    /* ── Casualty incidents ───────────────────────────────── */
    const INCIDENTS = [
        {
            id: 'ECHO-7', date: '2024-03-14', distance: '3.2 km',
            event: 'BMW 5-series lost control, collided with tree',
            casualties: '1 fatality, 2 injured', freq: '2.4 GHz burst, 250ms duration',
            cover: 'Driver error, mechanical failure', dead: 1, injured: 2
        },
        {
            id: 'ECHO-8', date: '2024-06-22', distance: '4.8 km',
            event: 'Cessna 172 lost navigation and engine control',
            casualties: '2 fatalities', freq: 'Multi-band sweep, VHF/UHF',
            cover: 'Pilot error, weather conditions', dead: 2, injured: 0
        },
        {
            id: 'ECHO-9', date: '2024-09-11', distance: '2.1 km',
            event: 'Multiple vehicle collision, A31 highway',
            casualties: '3 fatalities, 7 injured', freq: '900 MHz targeted burst',
            cover: 'Fog, driver distraction', dead: 3, injured: 7
        },
        {
            id: 'ECHO-10', date: '2025-04-03', distance: '1.8 km',
            event: 'Hospital equipment failure during surgery',
            casualties: '1 fatality (cardiac arrest)', freq: '2.4 GHz sustained interference',
            cover: 'Equipment malfunction', dead: 1, injured: 0
        },
        {
            id: 'ECHO-11', date: '2025-10-19', distance: '5.3 km',
            event: 'Agricultural drone swarm lost control',
            casualties: '0 (crashed in field)', freq: 'GPS spoofing + control signal jamming',
            cover: 'Software glitch', dead: 0, injured: 0
        },
        {
            id: 'ECHO-12', date: '2026-01-28', distance: '4.1 km',
            event: 'Ambulance navigation failure + medical equipment crash',
            casualties: '1 fatality (patient died en route)', freq: 'Multi-vector attack',
            cover: 'Equipment age, maintenance issues', dead: 1, injured: 0
        }
    ];

    /* ── File listing for USB ─────────────────────────────── */
    const USB_FILES = [
        { name: 'README.txt', size: '4.2 KB', date: '2026-02-05 18:42' },
        { name: 'echo_schematics.pdf', size: '2.1 MB', date: '2026-02-04 03:17' },
        { name: 'evidence.zip', size: '847 MB', date: '2026-02-05 12:33', encrypted: true }
    ];

    /* ══════════════════════════════════════════════════════════
       PHASE 1: USB INSERTED — file listing animation
       ══════════════════════════════════════════════════════════ */
    function phase1_usbInserted(game, onDone) {
        MC.initAudio();
        const ov = MC.createOverlay({
            phaseLabel: 'USB ANALYSIS',
            className: 'mc-terminal-green'
        });
        MC.startDrone(28, 29.5, 80);

        const content = MC.getContent();
        content.innerHTML = '';

        // Terminal-style header
        const term = document.createElement('div');
        term.className = 'mc-typewriter';
        term.style.maxWidth = '700px';
        term.style.width = '100%';
        content.appendChild(term);

        // Type the mount sequence
        const mountLines = [
            '> USB device detected...',
            '> Mounting /dev/sdb1 on air-gapped system...',
            '> WARNING: Device analyzed in isolated sandbox',
            '> Scanning for threats... CLEAN',
            '> Listing contents:',
            ''
        ];

        let lineIdx = 0;
        function typeLine() {
            if (lineIdx >= mountLines.length) {
                // Show file listing
                MC.schedule(() => showFileCards(), 400);
                return;
            }
            const line = mountLines[lineIdx];
            const div = document.createElement('div');
            div.style.opacity = '0';
            div.style.animation = 'mc-fadeIn 0.3s ease forwards';
            div.textContent = line;
            if (line.includes('WARNING')) div.style.color = '#ffcc00';
            if (line.includes('CLEAN')) div.style.color = '#00ff41';
            term.appendChild(div);
            MC.playBeep(600 + lineIdx * 100);
            lineIdx++;
            MC.schedule(typeLine, 600);
        }

        function showFileCards() {
            const listing = document.createElement('div');
            listing.style.cssText = 'border:1px solid rgba(0,255,65,0.2);border-radius:4px;padding:15px;margin-top:10px;';
            term.appendChild(listing);

            USB_FILES.forEach((f, i) => {
                MC.schedule(() => {
                    const row = document.createElement('div');
                    row.style.cssText = 'padding:8px 12px;border-bottom:1px solid rgba(0,255,65,0.1);display:flex;justify-content:space-between;opacity:0;animation:mc-fadeIn 0.4s ease forwards;';
                    const nameSpan = `<span style="color:#00ff41;font-weight:bold">${f.name}</span>`;
                    const meta = `<span style="color:rgba(255,255,255,0.4);font-size:12px">${f.size} | ${f.date}${f.encrypted ? ' 🔒' : ''}</span>`;
                    row.innerHTML = nameSpan + meta;
                    listing.appendChild(row);
                    MC.playPaperShuffle();

                    if (i === USB_FILES.length - 1) {
                        MC.schedule(() => {
                            const hint = document.createElement('div');
                            hint.style.cssText = 'margin-top:15px;color:rgba(255,255,255,0.5);font-size:12px;animation:mc-fadeIn 0.5s ease;';
                            hint.textContent = '> Opening README.txt...';
                            term.appendChild(hint);

                            MC.schedule(() => onDone(), 1500);
                        }, 1200);
                    }
                }, i * 800);
            });
        }

        MC.schedule(typeLine, 800);
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 2: README.txt — typewriter reveal
       ══════════════════════════════════════════════════════════ */
    function phase2_readme(game, onDone) {
        MC.setPhaseLabel('README.txt — FROM: E');
        const content = MC.getContent();
        content.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'mc-doc-card';
        card.innerHTML = `
            <div class="mc-doc-header">
                <div class="mc-doc-title">README.txt</div>
                <div class="mc-doc-meta">Author: E | Date: 2026-02-05 18:42 | Size: 4.2 KB</div>
            </div>
            <div class="mc-doc-body mc-scroll-area" style="max-height:50vh;"></div>
        `;
        content.appendChild(card);

        const body = card.querySelector('.mc-doc-body');
        MC.typewrite(body, README_TEXT, {
            speed: 18,
            highlights: README_HIGHLIGHTS,
            onDone: () => {
                MC.schedule(() => {
                    // Ryan's reaction
                    const reaction = document.createElement('div');
                    reaction.style.cssText = 'margin-top:20px;padding-top:15px;border-top:1px solid rgba(0,255,65,0.15);';
                    content.appendChild(reaction);

                    MC.revealDialogue(reaction, [
                        { speaker: 'Ryan', text: 'Radiofrequency weapon. Steckerdoser Heide — that\'s 30 minutes from here.' },
                        { speaker: 'Ryan', text: '72 hours. They\'re moving to real deployment.' },
                        { speaker: 'Ryan', text: 'Let me check the schematics...' }
                    ], { pauseBetween: 2000, onDone: () => MC.schedule(onDone, 1500) });
                }, 1000);
            }
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 3: SCHEMATICS — fade in with classification stamp
       ══════════════════════════════════════════════════════════ */
    function phase3_schematics(game, onDone) {
        MC.setPhaseLabel('ECHO SCHEMATICS — CLASSIFIED');
        const content = MC.getContent();
        content.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'mc-doc-card';
        card.style.position = 'relative';
        card.innerHTML = `
            <div class="mc-doc-header">
                <div class="mc-doc-title">Project Echo — System Overview</div>
                <div class="mc-doc-meta">Classification: STRENG GEHEIM (TOP SECRET)</div>
            </div>
            <div class="mc-doc-body" style="text-align:center;padding:30px 0;">
                <div style="color:rgba(255,255,255,0.4);font-size:13px;margin-bottom:15px;">
                    [SCHEMATIC RENDERING]
                </div>
                <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin:20px 0;">
                    <div style="background:rgba(0,255,65,0.05);border:1px solid rgba(0,255,65,0.2);padding:15px;border-radius:4px;flex:1;min-width:150px;">
                        <div style="color:#00ff41;font-size:12px;font-weight:bold;">ANTENNA ARRAY</div>
                        <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:5px;">Phase-locked loop control</div>
                    </div>
                    <div style="background:rgba(0,255,65,0.05);border:1px solid rgba(0,255,65,0.2);padding:15px;border-radius:4px;flex:1;min-width:150px;">
                        <div style="color:#00ff41;font-size:12px;font-weight:bold;">SIGNAL PROCESSOR</div>
                        <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:5px;">Multi-band frequency targeting</div>
                    </div>
                    <div style="background:rgba(0,255,65,0.05);border:1px solid rgba(0,255,65,0.2);padding:15px;border-radius:4px;flex:1;min-width:150px;">
                        <div style="color:#00ff41;font-size:12px;font-weight:bold;">POWER AMPLIFIER</div>
                        <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:5px;">5km+ effective range</div>
                    </div>
                </div>
                <div style="color:rgba(255,0,0,0.5);font-size:10px;letter-spacing:2px;margin-top:15px;">
                    UNAUTHORIZED DISCLOSURE SUBJECT TO PROSECUTION UNDER CRIMINAL CODE §93 (TREASON)
                </div>
            </div>
        `;
        content.appendChild(card);

        // Stamp overlay after delay
        MC.schedule(() => {
            MC.playImpact();
            MC.screenShake();
            const stamp = document.createElement('div');
            stamp.className = 'mc-stamp';
            stamp.textContent = 'STRENG GEHEIM';
            stamp.style.color = 'rgba(255,0,0,0.12)';
            card.appendChild(stamp);
        }, 1200);

        // Ryan's reaction
        MC.schedule(() => {
            const reaction = document.createElement('div');
            reaction.style.cssText = 'margin-top:20px;';
            content.appendChild(reaction);

            MC.revealDialogue(reaction, [
                { speaker: 'Ryan', text: 'Directional EM pulse weapon. Multiple antenna arrays.' },
                { speaker: 'Ryan', text: 'Phase control. Signal modulation. They can target specific frequencies.' },
                { speaker: 'Ryan', text: 'Cars, planes, medical devices... this is a weapon of mass disruption.' },
                { speaker: 'Ryan', text: 'One more file: evidence.zip. Encrypted.' }
            ], { pauseBetween: 2000, onDone: () => MC.schedule(onDone, 1500) });
        }, 3000);
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 4: PASSWORD PUZZLE — delegates to game engine
       ══════════════════════════════════════════════════════════ */
    function phase4_password(game, onSuccess) {
        // Close overlay temporarily for the puzzle
        MC.stopDrone(1);
        MC.destroyOverlay(0.5);

        MC.schedule(() => {
            game.startDialogue([
                { speaker: 'Ryan', text: 'The evidence.zip file is encrypted.' },
                { speaker: 'Ryan', text: '"The password is the frequency you tuned into"' },
                { speaker: 'Ryan', text: 'That would be... 243 MHz!' }
            ]);

            MC.schedule(() => {
                game.showPasswordPuzzle({
                    id: 'evidence_unlock',
                    title: 'Encrypted Archive',
                    description: 'Enter the frequency you discovered on the military channel.\n\n"The password is the frequency you tuned into. You\'ll know it when you see it." — E',
                    correctAnswer: ['243', '243 MHz', '243MHz', '243 mhz', '243.0'],
                    hint: 'The HackRF picked up transmissions on a specific military frequency. What was it?',
                    placeholder: 'Enter frequency...',
                    inputType: 'text',
                    maxAttempts: 3,
                    onSuccess: (game) => {
                        game.setFlag('evidence_unlocked', true);
                        game.showNotification('✓ Archive decrypted!');
                        MC.schedule(() => {
                            game.startDialogue([
                                { speaker: 'Ryan', text: 'It worked! Archive is open.' },
                                { speaker: 'Ryan', text: 'Dozens of files. Internal emails, test reports...' },
                                { speaker: 'Ryan', text: '*Opens first document*' }
                            ]);
                            MC.schedule(() => onSuccess(), 4000);
                        }, 1500);
                    },
                    onFailure: (game, maxReached) => {
                        if (maxReached) {
                            game.startDialogue([
                                { speaker: 'Ryan', text: 'Wait, what was that frequency again?' },
                                { speaker: 'Ryan', text: 'I should check my HackRF logs...' }
                            ]);
                        }
                    }
                });
            }, 3000);
        }, 700);
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 5: CASUALTY REPORT — card by card with death counter
       ══════════════════════════════════════════════════════════ */
    function phase5_casualties(game, onDone) {
        MC.initAudio();
        const ov = MC.createOverlay({ phaseLabel: 'PROJECT ECHO — INCIDENT LOG' });
        MC.startDrone(24, 25.5, 70);

        const content = MC.getContent();
        content.innerHTML = '';

        // Death counter in corner
        const counter = document.createElement('div');
        counter.className = 'mc-counter';
        counter.innerHTML = '<span class="mc-counter-num">0</span><span class="mc-counter-label">CONFIRMED DEAD</span>';
        MC.getOverlay().appendChild(counter);
        let totalDead = 0;
        let totalInjured = 0;

        // Header
        const header = document.createElement('div');
        header.style.cssText = 'text-align:center;margin-bottom:20px;animation:mc-fadeIn 0.8s ease;';
        header.innerHTML = `
            <div style="color:rgba(255,0,0,0.6);font-size:10px;letter-spacing:4px;">CLASSIFICATION: STRENG GEHEIM</div>
            <div style="color:#ff4444;font-size:18px;font-weight:bold;margin:10px 0;">CALIBRATION TEST INCIDENTS</div>
            <div style="color:rgba(255,255,255,0.4);font-size:12px;">2024-03-14 to 2026-01-28</div>
        `;
        content.appendChild(header);

        // Scroll container for cards
        const scrollArea = document.createElement('div');
        scrollArea.className = 'mc-scroll-area';
        scrollArea.style.maxHeight = '55vh';
        scrollArea.style.width = '100%';
        content.appendChild(scrollArea);

        let incIdx = 0;
        function showNextIncident() {
            if (incIdx >= INCIDENTS.length) {
                // Final summary
                MC.schedule(() => {
                    MC.playImpact();
                    MC.screenShake();

                    const summary = document.createElement('div');
                    summary.style.cssText = 'margin-top:20px;padding:20px;border:2px solid rgba(255,0,0,0.4);border-radius:4px;text-align:center;animation:mc-fadeIn 0.6s ease;background:rgba(80,0,0,0.15);';
                    summary.innerHTML = `
                        <div style="color:#ff4444;font-size:16px;font-weight:bold;margin-bottom:8px;">
                            TOTAL: 8 FATALITIES — 9+ INJURED
                        </div>
                        <div style="color:rgba(255,255,255,0.5);font-size:12px;">
                            PROJECT STATUS: Proceed to Phase 3 (Urban Environment Testing)
                        </div>
                        <div style="color:rgba(255,0,0,0.6);font-size:11px;margin-top:8px;">
                            "Civilian casualties deemed ACCEPTABLE for strategic capability development"
                        </div>
                        <div style="color:rgba(255,255,255,0.3);font-size:11px;margin-top:10px;">
                            Dr. Volkov recommends increasing power output for Phase 3 — Document signed: "V"
                        </div>
                    `;
                    scrollArea.appendChild(summary);
                    scrollArea.scrollTop = scrollArea.scrollHeight;

                    MC.redPulse(3000);

                    // Ryan's reaction
                    MC.schedule(() => {
                        const reaction = document.createElement('div');
                        reaction.style.cssText = 'margin-top:15px;';
                        content.appendChild(reaction);

                        MC.revealDialogue(reaction, [
                            { speaker: 'Ryan', text: 'Eight people dead. Nine injured. And they call it "acceptable".' },
                            { speaker: 'Ryan', text: 'Signed by "V". That has to be Volkov.' },
                            { speaker: 'Ryan', text: 'Phase 3 means urban testing. More people. More casualties.' },
                            { speaker: 'Ryan', text: 'I need help. Need allies who understand what this technology can do.' },
                            { speaker: 'Ryan', text: '"E" was right. This is beyond me now.' }
                        ], {
                            pauseBetween: 2200,
                            onDone: () => MC.schedule(onDone, 2000)
                        });
                    }, 3000);
                }, 1500);
                return;
            }

            const inc = INCIDENTS[incIdx];
            const card = document.createElement('div');
            card.className = 'mc-doc-card';
            card.style.cssText = 'margin-bottom:12px;padding:18px 22px;animation:mc-slideUp 0.5s ease;';

            const hasDead = inc.dead > 0;
            if (hasDead) card.style.borderColor = 'rgba(255,0,0,0.3)';

            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <div style="color:${hasDead ? '#ff4444' : '#ffcc00'};font-weight:bold;font-size:15px;">${inc.id}</div>
                    <div style="color:rgba(255,255,255,0.4);font-size:11px;">${inc.date} | ${inc.distance} from facility</div>
                </div>
                <div style="color:#ccc;font-size:13px;margin-bottom:8px;">${inc.event}</div>
                <div style="display:flex;gap:15px;flex-wrap:wrap;font-size:11px;">
                    <div style="color:${hasDead ? '#ff4444' : '#00ff41'};">⚠ ${inc.casualties}</div>
                    <div style="color:rgba(255,255,255,0.3);">Freq: ${inc.freq}</div>
                </div>
                <div style="color:rgba(255,255,255,0.25);font-size:10px;margin-top:8px;font-style:italic;">
                    Cover story: "${inc.cover}" — STATUS: CONTAINED
                </div>
            `;
            scrollArea.appendChild(card);
            scrollArea.scrollTop = scrollArea.scrollHeight;

            // Update death counter
            totalDead += inc.dead;
            totalInjured += inc.injured;
            counter.querySelector('.mc-counter-num').textContent = totalDead;
            if (hasDead) {
                MC.playHeartbeat();
                MC.redPulse(1500);
                counter.style.animation = 'none';
                counter.offsetHeight;
                counter.style.animation = 'mc-glow 1s ease';
            } else {
                MC.playBeep(500);
            }

            incIdx++;
            MC.schedule(showNextIncident, 3000);
        }

        MC.schedule(showNextIncident, 1500);
    }

    /* ══════════════════════════════════════════════════════════
       MAIN ENTRY — orchestrate all phases
       ══════════════════════════════════════════════════════════ */

    /**
     * play(game) — entry from hub scene for first USB click.
     * Sets usb_analyzed flag and runs Phase 1 + Phase 2.
     */
    function playInsertUSB(game) {
        game.setFlag('usb_analyzed', true);
        game.setStoryPart(8);

        function skipAll() {
            MC.clearAllTimers();
            MC.stopDrone(0.5);
            MC.destroyOverlay(0.4);
            MC.schedule(() => MC.destroyAudio(), 600);
            // Set all flags as if the player watched everything
            game.setFlag('viewed_schematics', true);
            game.showNotification('Press the air-gapped laptop again to view schematics');
        }
        MC.onSkip(skipAll);

        phase1_usbInserted(game, () => {
            phase2_readme(game, () => {
                // End of first click — close overlay, prompt for schematics
                MC.stopDrone(1.5);
                MC.schedule(() => {
                    MC.destroyOverlay(0.8);
                    MC.schedule(() => MC.destroyAudio(), 1000);
                    game.showNotification('Press the air-gapped laptop again to view schematics');
                }, 500);
            });
        });
    }

    /**
     * playSchematics(game) — entry from hub for second click.
     * Sets viewed_schematics flag and runs Phase 3.
     */
    function playSchematics(game) {
        game.setFlag('viewed_schematics', true);

        function skipAll() {
            MC.clearAllTimers();
            MC.stopDrone(0.5);
            MC.destroyOverlay(0.4);
            MC.schedule(() => MC.destroyAudio(), 600);
            game.showNotification('One file remaining: evidence.zip (encrypted)');
        }
        MC.onSkip(skipAll);

        MC.initAudio();
        MC.createOverlay({ phaseLabel: 'SCHEMATIC ANALYSIS', className: 'mc-terminal-green' });
        MC.startDrone(30, 31.5, 90);

        phase3_schematics(game, () => {
            MC.stopDrone(1.5);
            MC.schedule(() => {
                MC.destroyOverlay(0.8);
                MC.schedule(() => MC.destroyAudio(), 1000);
                game.showNotification('One file remaining: evidence.zip (encrypted)');
            }, 500);
        });
    }

    /**
     * playPassword(game) — entry from hub for third click (evidence.zip).
     * Triggers password puzzle, then casualty report on success.
     */
    function playPassword(game) {
        phase4_password(game, () => {
            // After successful decryption, show casualty report
            function skipCasualties() {
                MC.clearAllTimers();
                MC.stopDrone(0.5);
                MC.destroyOverlay(0.4);
                MC.schedule(() => MC.destroyAudio(), 600);
                game.completeQuest('analyze_usb');
                game.addQuest({
                    id: 'find_allies',
                    name: 'Find Technical Allies',
                    description: 'Reach out to RF experts who can help analyze Project Echo and understand its full capabilities. Time is running out.',
                    hint: 'Think about people with expertise in radio astronomy, wireless protocols, and signal processing.'
                });
                game.showNotification('New Quest: Find Technical Allies');
            }

            phase5_casualties(game, () => {
                MC.stopDrone(2);
                MC.schedule(() => {
                    MC.destroyOverlay(1);
                    MC.schedule(() => MC.destroyAudio(), 1200);

                    game.completeQuest('analyze_usb');
                    game.addQuest({
                        id: 'find_allies',
                        name: 'Find Technical Allies',
                        description: 'Reach out to RF experts who can help analyze Project Echo and understand its full capabilities. Time is running out.',
                        hint: 'Think about people with expertise in radio astronomy, wireless protocols, and signal processing.'
                    });
                    game.showNotification('New Quest: Find Technical Allies');
                }, 500);
            });

            MC.onSkip(skipCasualties);
        });
    }

    return {
        playInsertUSB,
        playSchematics,
        playPassword
    };
})();
