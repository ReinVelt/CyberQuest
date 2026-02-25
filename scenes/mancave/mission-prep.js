/**
 * Mancave – Mission Prep Cinematic Sequence
 * ═══════════════════════════════════════════════════════════
 * Pre-infiltration preparation sequence:
 *   Phase 1 — Gear Check (interactive equipment verification)
 *   Phase 2 — Ally Coordination (Cees monitoring, Jaap dead-man-switch, David standby)
 *   Phase 3 — Ies Goodbye (emotional farewell without full truth)
 *
 * Triggered from mancave when all allies are ready and Eva has been contacted.
 * Uses MancaveCinematic shared utilities.
 *
 * Flags set: mission_prep_complete
 * ═══════════════════════════════════════════════════════════
 */

window.MancaveMissionPrep = (function () {
    'use strict';
    const MC = window.MancaveCinematic;

    /* ── Gear list — items Ryan needs ── */
    const GEAR_LIST = [
        { name: 'HackRF One + Portapack', icon: '📻', desc: 'Software-defined radio. Frequency scanning, signal capture.' },
        { name: 'Flipper Zero', icon: '🐬', desc: 'RFID, NFC, sub-GHz. Badge cloning capability.' },
        { name: 'WiFi Pineapple', icon: '🍍', desc: 'Network auditing. Rogue AP for credential capture.' },
        { name: 'Night Vision Monocular', icon: '🌙', desc: 'Gen 2+ surplus. Perimeter navigation in darkness.' },
        { name: 'Meshtastic Node', icon: '📡', desc: 'Off-grid comms. Eva contact frequency: 906.875 MHz.' },
        { name: 'Air-Gapped Laptop', icon: '💻', desc: 'Kali Linux. Data extraction and evidence packaging.' },
        { name: 'External Drive (encrypted)', icon: '💾', desc: 'VeraCrypt. 256-bit AES. For the server room data.' },
        { name: 'USB Rubber Ducky', icon: '🦆', desc: 'Keystroke injection. Quick-deploy exploit payloads.' }
    ];

    /* ══════════════════════════════════════════════════════════
       PHASE 1: GEAR CHECK — animated equipment verification
       ══════════════════════════════════════════════════════════ */
    function phase1_gearCheck(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('GEAR CHECK — 22:00');
            content.innerHTML = '';

            const gearDiv = document.createElement('div');
            gearDiv.style.cssText = 'width:100%;max-width:650px;margin:0 auto;';
            content.appendChild(gearDiv);

            // Header
            const header = document.createElement('div');
            header.style.cssText = 'text-align:center;margin-bottom:20px;';
            header.innerHTML = `
                <div style="font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.3);">OPERATION BRIEFCASE</div>
                <div style="font-size:16px;color:#00ff41;margin-top:5px;">Equipment Manifest</div>
            `;
            gearDiv.appendChild(header);

            // Gear items appear one by one
            let delay = 500;
            GEAR_LIST.forEach((item, idx) => {
                MC.schedule(() => {
                    const row = document.createElement('div');
                    row.style.cssText = `
                        display:flex;align-items:center;gap:12px;
                        padding:8px 12px;margin-bottom:4px;
                        background:rgba(0,255,65,0.02);
                        border-left:2px solid rgba(0,255,65,0.1);
                        opacity:0;animation:mc-fadeIn 0.4s ease forwards;
                        font-size:12px;
                    `;

                    // Checkmark animation after brief delay
                    row.innerHTML = `
                        <span style="font-size:18px;">${item.icon}</span>
                        <div style="flex:1;">
                            <div style="color:#c0c0c0;font-weight:bold;">${item.name}</div>
                            <div style="color:rgba(255,255,255,0.35);font-size:10px;">${item.desc}</div>
                        </div>
                        <span class="gear-check-${idx}" style="color:rgba(255,255,255,0.2);">○</span>
                    `;
                    gearDiv.appendChild(row);
                    MC.playBeep(800 + idx * 100, 0.04);

                    // Check mark after 600ms
                    MC.schedule(() => {
                        const check = row.querySelector(`.gear-check-${idx}`);
                        if (check) {
                            check.textContent = '✓';
                            check.style.color = '#00ff41';
                            check.style.fontWeight = 'bold';
                        }
                        row.style.borderLeftColor = 'rgba(0,255,65,0.4)';
                    }, 600);
                }, delay);
                delay += 800;
            });

            // "All systems go" confirmation
            MC.schedule(() => {
                const confirm = document.createElement('div');
                confirm.style.cssText = 'text-align:center;margin-top:20px;padding:12px;border:1px solid rgba(0,255,65,0.3);border-radius:4px;animation:mc-fadeIn 0.6s ease;';
                confirm.innerHTML = `
                    <div style="color:#00ff41;font-size:14px;font-weight:bold;">ALL SYSTEMS GO</div>
                    <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:4px;">8/8 items verified</div>
                `;
                gearDiv.appendChild(confirm);
                MC.playImpact();
            }, delay + 500);

            MC.schedule(resolve, delay + 2500);
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 2: ALLY COORDINATION — split-screen comms check
       ══════════════════════════════════════════════════════════ */
    function phase2_allyCoordination(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('ALLY COORDINATION — 22:15');
            content.innerHTML = '';

            const coordDiv = document.createElement('div');
            coordDiv.style.cssText = 'width:100%;max-width:650px;margin:0 auto;';
            content.appendChild(coordDiv);

            const allies = [
                {
                    name: 'Cees Bassa', role: 'WSRT Monitoring',
                    icon: '📡',
                    messages: [
                        { speaker: 'Ryan', text: 'Cees, I\'m going in tonight. 23:00. Can you monitor the WSRT dishes for unusual RF activity from Steckerdoser Heide?' },
                        { speaker: 'Cees', text: 'Already on it. I\'ve aimed two dishes toward the facility. Any anomalous RF burst and I\'ll see it.' },
                        { speaker: 'Cees', text: 'If Echo activates, even for a test, I\'ll know within seconds. I\'ll warn you over Meshtastic.' },
                        { speaker: 'Ryan', text: 'You\'re the early warning system.' },
                        { speaker: 'Cees', text: 'LOFAR stations are listening too. Go get them, Ryan.' }
                    ]
                },
                {
                    name: 'Jaap Haartsen', role: 'Dead Man\'s Switch',
                    icon: '🔐',
                    messages: [
                        { speaker: 'Ryan', text: 'Jaap, the dead man\'s switch. If I don\'t check in by 04:00, release everything.' },
                        { speaker: 'Jaap', text: 'Understood. I have the evidence package encrypted on three separate servers.' },
                        { speaker: 'Jaap', text: 'If the timer runs out — Der Spiegel, The Guardian, Bellingcat. All at once.' },
                        { speaker: 'Ryan', text: 'Let\'s hope it doesn\'t come to that.' },
                        { speaker: 'Jaap', text: 'Let\'s hope. But if it does — they won\'t be able to suppress this.' }
                    ]
                },
                {
                    name: 'David Prinsloo', role: 'Technical Standby',
                    icon: '🔧',
                    messages: [
                        { speaker: 'Ryan', text: 'David. I might need remote RF analysis tonight. Stand by?' },
                        { speaker: 'David', text: 'My gear is ready. SDR running, spectrum analyzer warmed up.' },
                        { speaker: 'David', text: 'If you send me a frequency burst, I can triangulate interference patterns from here.' },
                        { speaker: 'Ryan', text: 'Thanks, David. One more thing — if this goes wrong—' },
                        { speaker: 'David', text: 'It won\'t. And if it does, I\'ll make sure they can\'t bury it. Now stop being dramatic and go save the world.' }
                    ]
                }
            ];

            let delay = 0;

            allies.forEach((ally, aIdx) => {
                MC.schedule(() => {
                    const card = document.createElement('div');
                    card.style.cssText = `
                        margin-bottom:15px;padding:12px;
                        border:1px solid rgba(0,255,65,0.15);
                        border-radius:4px;
                        background:rgba(0,255,65,0.02);
                        opacity:0;animation:mc-fadeIn 0.5s ease forwards;
                    `;
                    card.innerHTML = `
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                            <span style="font-size:20px;">${ally.icon}</span>
                            <div>
                                <div style="color:#00ff41;font-size:13px;font-weight:bold;">${ally.name}</div>
                                <div style="color:rgba(255,255,255,0.35);font-size:10px;letter-spacing:2px;">${ally.role.toUpperCase()}</div>
                            </div>
                            <div style="margin-left:auto;color:rgba(0,255,65,0.5);font-size:10px;">● ONLINE</div>
                        </div>
                        <div class="ally-msgs-${aIdx}" style="padding-left:28px;"></div>
                    `;
                    coordDiv.appendChild(card);
                    MC.playBeep(1000, 0.05);

                    // Reveal messages
                    const msgContainer = card.querySelector(`.ally-msgs-${aIdx}`);
                    let msgDelay = 600;
                    ally.messages.forEach(msg => {
                        MC.schedule(() => {
                            const line = document.createElement('div');
                            const isRyan = msg.speaker === 'Ryan';
                            line.style.cssText = `
                                font-size:11px;padding:3px 0;
                                color:${isRyan ? 'rgba(255,255,255,0.5)' : '#c0c0c0'};
                                opacity:0;animation:mc-fadeIn 0.3s ease forwards;
                            `;
                            line.innerHTML = `<span style="color:${isRyan ? '#888' : '#00ff41'};font-weight:bold;">${msg.speaker}:</span> ${msg.text}`;
                            msgContainer.appendChild(line);
                            MC.playTypeTick();
                        }, msgDelay);
                        msgDelay += 900;
                    });
                }, delay);
                delay += 5500;
            });

            MC.schedule(resolve, delay + 1000);
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 3: IES GOODBYE — emotional departure
       ══════════════════════════════════════════════════════════ */
    function phase3_iesGoodbye(content, game) {
        return new Promise(resolve => {
            MC.setPhaseLabel('22:30 — DEPARTURE');
            content.innerHTML = '';

            const goodbyeDiv = document.createElement('div');
            goodbyeDiv.style.cssText = 'max-width:600px;margin:0 auto;text-align:center;';
            content.appendChild(goodbyeDiv);

            MC.revealDialogue(goodbyeDiv, [
                { speaker: '', text: '*Ryan walks to the kitchen. Ies is reading on the couch. The dogs are asleep.*' },
                { speaker: 'Ies', text: 'You\'re going somewhere.' },
                { speaker: 'Ryan', text: 'Just... a late-night drive. Testing some equipment.' },
                { speaker: 'Ies', text: '*Puts down her book. Looks at him carefully.*' },
                { speaker: 'Ies', text: 'You\'re wearing your black jacket. You packed a bag. And you have that look.' },
                { speaker: 'Ryan', text: 'What look?' },
                { speaker: 'Ies', text: 'The one where you\'re about to do something stupid and brave.' },
                { speaker: '', text: '*Long pause. The dog clock ticks on the wall.*' },
                { speaker: 'Ies', text: 'I won\'t ask. Just... come home.' },
                { speaker: 'Ryan', text: 'I will. I promise.' },
                { speaker: 'Ies', text: '*Stands up. Hugs him. Holds on tight.*' },
                { speaker: 'Ies', text: 'The dogs will be waiting. I\'ll be waiting.' },
                { speaker: '', text: '*Tino lifts his head, watches Ryan pick up the bag.*' },
                { speaker: '', text: '*ET opens one eye, decides it\'s not food-related, and goes back to sleep.*' },
                { speaker: 'Ryan', text: '*At the door* I love you.' },
                { speaker: 'Ies', text: 'I know. Now go.' }
            ], {
                pauseBetween: 2200,
                onDone: resolve
            });
        });
    }

    /* ══════════════════════════════════════════════════════════
       MAIN ENTRY POINT
       ══════════════════════════════════════════════════════════ */
    function play(game) {
        game.setFlag('mission_prep_complete', true);

        MC.initAudio();
        const ov = MC.createOverlay({ phaseLabel: 'MISSION PREP', className: 'mc-terminal-green' });
        MC.startDrone(28, 29.5, 70);

        const content = MC.getContent();
        content.innerHTML = '';

        // Opening
        const openDiv = document.createElement('div');
        openDiv.style.cssText = 'text-align:center;margin-bottom:15px;';
        content.appendChild(openDiv);

        MC.revealDialogue(openDiv, [
            { speaker: 'Ryan', text: 'Tonight\'s the night. Eva said 23:00. North entrance.' },
            { speaker: 'Ryan', text: 'Two hours. Time to make sure everything\'s ready.' },
            { speaker: '', text: '*Ryan begins methodically checking each piece of equipment*' }
        ], { pauseBetween: 1500 });

        MC.schedule(() => {
            content.innerHTML = '';
            phase1_gearCheck(content).then(() => {
                return phase2_allyCoordination(content);
            }).then(() => {
                return phase3_iesGoodbye(content, game);
            }).then(() => {
                MC.stopDrone(2);
                MC.schedule(() => {
                    game.showNotification('Mission prep complete — head to the garden to drive to the facility');
                    MC.destroyOverlay(1);
                    MC.schedule(() => MC.destroyAudio(), 1200);
                }, 500);
            });
        }, 6000);

        MC.onSkip(() => {
            MC.clearAllTimers();
            MC.stopDrone(0.5);
            MC.destroyOverlay(0.4);
            MC.schedule(() => MC.destroyAudio(), 600);
            game.setFlag('mission_prep_complete', true);
            game.showNotification('Mission prep complete — head to the garden');
        });
    }

    return { play };
})();
