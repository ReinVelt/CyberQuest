/**
 * Mancave – Meshtastic Setup Cinematic Sequence
 * ═══════════════════════════════════════════════════════════
 * Interactive Meshtastic device configuration:
 *   Phase 1 — Device power-on (boot sequence animation)
 *   Phase 2 — Frequency configuration (906.875 MHz EU LoRa)
 *   Phase 3 — Encryption setup (AES-256 key exchange)
 *   Phase 4 — Channel configuration & node discovery
 *
 * Plays when clicking Meshtastic after identifying Eva but before contacting her.
 * Uses MancaveCinematic shared utilities.
 *
 * Flags set: meshtastic_configured
 * ═══════════════════════════════════════════════════════════
 */

window.MancaveMeshtasticSetup = (function () {
    'use strict';
    const MC = window.MancaveCinematic;

    /* ══════════════════════════════════════════════════════════
       PHASE 1: DEVICE BOOT — Meshtastic firmware startup
       ══════════════════════════════════════════════════════════ */
    function phase1_boot(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('MESHTASTIC — POWER ON');
            content.innerHTML = '';

            const bootDiv = document.createElement('div');
            bootDiv.style.cssText = 'width:100%;max-width:500px;margin:0 auto;';
            content.appendChild(bootDiv);

            // Device visual
            const device = document.createElement('div');
            device.style.cssText = `
                margin:15px auto;padding:20px;max-width:300px;
                border:2px solid rgba(0,255,65,0.2);border-radius:12px;
                background:rgba(0,20,0,0.4);text-align:center;
                animation:mc-fadeIn 0.8s ease;
            `;
            device.innerHTML = `
                <div style="font-size:26px;margin-bottom:8px;">📡</div>
                <div style="font-size:14px;color:#00ff41;font-weight:bold;">LILYGO T-Beam</div>
                <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:3px;">ESP32 + SX1276 LoRa + GPS</div>
                <div class="mesh-screen" style="margin:15px auto;width:200px;height:80px;background:rgba(0,0,0,0.6);border:1px solid rgba(0,255,65,0.15);border-radius:4px;font-size:10px;color:#00ff41;text-align:left;padding:8px;font-family:monospace;overflow:hidden;"></div>
            `;
            bootDiv.appendChild(device);

            const screen = device.querySelector('.mesh-screen');

            const bootLines = [
                { text: 'Meshtastic v2.3.4', delay: 500 },
                { text: 'SX1276 init... OK', delay: 400 },
                { text: 'GPS acquiring...', delay: 600 },
                { text: 'GPS fix: 52.8°N 7.0°E', delay: 800 },
                { text: 'LoRa: 906.875 MHz', delay: 400 },
                { text: 'Ready.', delay: 300 }
            ];

            let delay = 800;
            bootLines.forEach(line => {
                MC.schedule(() => {
                    const div = document.createElement('div');
                    div.textContent = line.text;
                    div.style.opacity = '0';
                    div.style.animation = 'mc-fadeIn 0.2s ease forwards';
                    screen.appendChild(div);
                    MC.playBeep(900, 0.03);
                }, delay);
                delay += line.delay;
            });

            MC.schedule(resolve, delay + 1000);
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 2: FREQUENCY CONFIG — LoRa parameters
       ══════════════════════════════════════════════════════════ */
    function phase2_frequency(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('FREQUENCY CONFIGURATION');
            content.innerHTML = '';

            const freqDiv = document.createElement('div');
            freqDiv.style.cssText = 'width:100%;max-width:600px;margin:0 auto;';
            content.appendChild(freqDiv);

            const params = [
                { label: 'Region', value: 'EU_868', note: 'European ISM band (863-870 MHz)' },
                { label: 'Frequency', value: '906.875 MHz', note: 'Eva\'s specified channel — "think mesh"', highlight: true },
                { label: 'Bandwidth', value: '250 kHz', note: 'Long range mode' },
                { label: 'Spreading Factor', value: 'SF12', note: 'Maximum range, slower data rate' },
                { label: 'TX Power', value: '20 dBm', note: 'Legal maximum for EU region' },
                { label: 'Coding Rate', value: '4/8', note: 'Maximum error correction' }
            ];

            const terminal = document.createElement('div');
            terminal.style.cssText = 'font-size:11px;';
            freqDiv.appendChild(terminal);

            let delay = 0;
            params.forEach(p => {
                MC.schedule(() => {
                    const row = document.createElement('div');
                    row.style.cssText = `
                        display:flex;align-items:center;gap:10px;
                        padding:6px 8px;margin-bottom:3px;
                        border-left:2px solid ${p.highlight ? 'rgba(255,204,0,0.4)' : 'rgba(0,255,65,0.1)'};
                        background:${p.highlight ? 'rgba(255,204,0,0.03)' : 'transparent'};
                        opacity:0;animation:mc-fadeIn 0.3s ease forwards;
                    `;
                    row.innerHTML = `
                        <span style="min-width:130px;color:rgba(255,255,255,0.4);">${p.label}:</span>
                        <span style="color:${p.highlight ? '#ffcc00' : '#00ff41'};font-weight:bold;min-width:120px;">${p.value}</span>
                        <span style="color:rgba(255,255,255,0.25);font-size:10px;">${p.note}</span>
                    `;
                    terminal.appendChild(row);
                    MC.playTypeTick();
                    if (p.highlight) MC.playBeep(1200, 0.06);
                }, delay);
                delay += 700;
            });

            // Ryan's reaction
            MC.schedule(() => {
                const react = document.createElement('div');
                react.style.cssText = 'margin-top:15px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05);animation:mc-fadeIn 0.4s ease;';
                freqDiv.appendChild(react);

                MC.revealDialogue(react, [
                    { speaker: 'Ryan', text: '906.875 MHz. Exactly what Eva said in the README.' },
                    { speaker: 'Ryan', text: 'EU LoRa band. Legal. Anonymous. No registration required.' },
                    { speaker: 'Ryan', text: 'Range with SF12 should be 10+ kilometers in flat terrain. More than enough for Drenthe.' }
                ], { pauseBetween: 1500 });
            }, delay + 500);

            MC.schedule(resolve, delay + 6000);
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 3: ENCRYPTION — AES-256 channel security
       ══════════════════════════════════════════════════════════ */
    function phase3_encryption(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('ENCRYPTION — AES-256');
            content.innerHTML = '';

            const encDiv = document.createElement('div');
            encDiv.style.cssText = 'width:100%;max-width:600px;margin:0 auto;text-align:center;';
            content.appendChild(encDiv);

            const steps = [
                { text: '> meshtastic --set encryption.enabled true', delay: 600, cmd: true },
                { text: '  Encryption: ENABLED', delay: 400, color: '#00ff41' },
                { text: '', delay: 100 },
                { text: '> meshtastic --set encryption.key [generating...]', delay: 800, cmd: true },
                { text: '  Generating 256-bit AES key...', delay: 600, color: 'rgba(255,255,255,0.5)' },
                { text: '  Key: ████████████████████████████████', delay: 800, color: '#00ff41' },
                { text: '  (derived from shared secret in USB README)', delay: 400, color: 'rgba(255,255,255,0.3)' },
                { text: '', delay: 100 },
                { text: '> meshtastic --set channel.name "ZERFALL"', delay: 600, cmd: true },
                { text: '  Channel: ZERFALL (encrypted)', delay: 400, color: '#ffcc00' },
                { text: '', delay: 100 },
                { text: '  ╔════════════════════════════════════╗', delay: 400, color: '#00ff41' },
                { text: '  ║  SECURE CHANNEL ESTABLISHED        ║', delay: 200, color: '#00ff41' },
                { text: '  ║  AES-256 | SF12 | 906.875 MHz     ║', delay: 200, color: '#00ff41' },
                { text: '  ╚════════════════════════════════════╝', delay: 200, color: '#00ff41' }
            ];

            const terminal = document.createElement('div');
            terminal.style.cssText = 'text-align:left;font-size:11px;';
            encDiv.appendChild(terminal);

            let delay = 0;
            steps.forEach(s => {
                delay += s.delay;
                MC.schedule(() => {
                    const line = document.createElement('div');
                    line.style.cssText = `
                        opacity:0;animation:mc-fadeIn 0.2s ease forwards;
                        padding:1px 0;
                        color:${s.cmd ? '#00ff41' : (s.color || 'rgba(255,255,255,0.5)')};
                    `;
                    line.textContent = s.text;
                    terminal.appendChild(line);
                    if (s.cmd) MC.playTypeTick();
                    else if (s.text.includes('ESTABLISHED')) MC.playImpact();
                }, delay);
            });

            MC.schedule(resolve, delay + 2000);
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 4: NODE DISCOVERY — scan for EVA_W
       ══════════════════════════════════════════════════════════ */
    function phase4_discovery(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('NODE DISCOVERY');
            content.innerHTML = '';

            const discDiv = document.createElement('div');
            discDiv.style.cssText = 'width:100%;max-width:500px;margin:0 auto;text-align:center;';
            content.appendChild(discDiv);

            // Scanning animation
            const scanDiv = document.createElement('div');
            scanDiv.style.cssText = 'margin:20px 0;';
            scanDiv.innerHTML = `
                <div style="font-size:12px;color:rgba(255,255,255,0.4);">Scanning mesh network...</div>
                <div style="margin:10px 0;font-size:24px;">📡 ·····</div>
            `;
            discDiv.appendChild(scanDiv);

            MC.schedule(() => {
                scanDiv.innerHTML = `
                    <div style="font-size:12px;color:#00ff41;">Node detected!</div>
                    <div style="margin:15px auto;padding:15px;max-width:300px;border:1px solid rgba(0,255,65,0.3);border-radius:6px;background:rgba(0,255,65,0.03);">
                        <div style="font-size:14px;color:#00ff41;font-weight:bold;">EVA_W</div>
                        <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:4px;">
                            RSSI: -67 dBm | SNR: 9.5 dB<br>
                            Hops: 1 | Last seen: 2s ago
                        </div>
                        <div style="font-size:10px;color:#ffcc00;margin-top:6px;">● ONLINE — Encrypted channel</div>
                    </div>
                `;
                MC.playImpact();
            }, 3000);

            // Ryan's reaction
            MC.schedule(() => {
                const react = document.createElement('div');
                react.style.cssText = 'margin-top:15px;animation:mc-fadeIn 0.4s ease;';
                discDiv.appendChild(react);

                MC.revealDialogue(react, [
                    { speaker: 'Ryan', text: 'There she is. EVA_W. Strong signal — she\'s close. Or the mesh is hopping well.' },
                    { speaker: 'Ryan', text: 'Encrypted channel. Off-grid. No cell towers. No logs.' },
                    { speaker: 'Ryan', text: 'Time to make contact.' }
                ], { pauseBetween: 1500, onDone: resolve });
            }, 5000);
        });
    }

    /* ══════════════════════════════════════════════════════════
       MAIN ENTRY POINT
       ══════════════════════════════════════════════════════════ */
    function play(game) {
        game.setFlag('meshtastic_configured', true);

        MC.initAudio();
        const ov = MC.createOverlay({ phaseLabel: 'MESHTASTIC SETUP', className: 'mc-terminal-green' });
        MC.startDrone(26, 27.5, 65);

        const content = MC.getContent();
        content.innerHTML = '';

        // Opening
        const openDiv = document.createElement('div');
        openDiv.style.cssText = 'text-align:center;margin-bottom:15px;';
        content.appendChild(openDiv);

        MC.revealDialogue(openDiv, [
            { speaker: 'Ryan', text: '"Think mesh. 906.875." That\'s what Eva\'s README said.' },
            { speaker: 'Ryan', text: 'Meshtastic. Off-grid mesh networking. No internet, no cell towers.' },
            { speaker: 'Ryan', text: 'If she\'s listening on 906.875, I need to configure my node to match.' },
            { speaker: '', text: '*Ryan picks up the LILYGO T-Beam from the shelf*' }
        ], { pauseBetween: 1500 });

        MC.schedule(() => {
            content.innerHTML = '';
            phase1_boot(content).then(() => {
                return phase2_frequency(content);
            }).then(() => {
                return phase3_encryption(content);
            }).then(() => {
                return phase4_discovery(content);
            }).then(() => {
                MC.stopDrone(2);
                MC.schedule(() => {
                    game.showNotification('Meshtastic configured — click the Meshtastic node to contact Eva');
                    MC.destroyOverlay(1);
                    MC.schedule(() => MC.destroyAudio(), 1200);
                }, 500);
            });
        }, 7500);

        MC.onSkip(() => {
            MC.clearAllTimers();
            MC.stopDrone(0.5);
            MC.destroyOverlay(0.4);
            MC.schedule(() => MC.destroyAudio(), 600);
            game.setFlag('meshtastic_configured', true);
            game.showNotification('Meshtastic configured — click node to contact Eva');
        });
    }

    return { play };
})();
