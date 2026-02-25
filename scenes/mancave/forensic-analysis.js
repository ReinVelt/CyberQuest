/**
 * Mancave – Forensic Analysis Cinematic Sequence
 * ═══════════════════════════════════════════════════════════
 * Professional forensic examination of the USB stick:
 *   Phase 1 — Air-Gapped Boot (ThinkPad boot sequence animation)
 *   Phase 2 — Write-Blocker (hardware forensic bridge visual)
 *   Phase 3 — Checksums & Verification (SHA-256 hashing animation)
 *   Phase 4 — Sandbox Execution (isolated analysis environment)
 *
 * Plays BEFORE the main USB analysis cinematic.
 * Triggered from the air-gapped laptop when USB stick is in inventory.
 * Uses MancaveCinematic shared utilities.
 *
 * Flags set: forensic_prep_complete
 * ═══════════════════════════════════════════════════════════
 */

window.MancaveForensicAnalysis = (function () {
    'use strict';
    const MC = window.MancaveCinematic;

    /* ══════════════════════════════════════════════════════════
       PHASE 1: AIR-GAPPED BOOT — ThinkPad startup sequence
       ══════════════════════════════════════════════════════════ */
    function phase1_boot(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('AIR-GAPPED SYSTEM BOOT');
            content.innerHTML = '';

            const bootDiv = document.createElement('div');
            bootDiv.style.cssText = 'width:100%;max-width:600px;margin:0 auto;font-size:12px;';
            content.appendChild(bootDiv);

            const lines = [
                { text: 'ThinkPad X230 — Air-Gapped Forensic Workstation', color: '#00ff41', delay: 0 },
                { text: 'BIOS: Coreboot v4.19 (Libreboot)', color: 'rgba(255,255,255,0.5)', delay: 400 },
                { text: 'RAM: 16 GB DDR3 (ECC)', color: 'rgba(255,255,255,0.5)', delay: 200 },
                { text: 'Storage: Samsung 870 EVO 500GB (encrypted)', color: 'rgba(255,255,255,0.5)', delay: 200 },
                { text: '', delay: 100 },
                { text: '⚠ NETWORK INTERFACES: DISABLED', color: '#ffcc00', delay: 600, bold: true },
                { text: '  WiFi: REMOVED (hardware kill)', color: '#ffcc00', delay: 300 },
                { text: '  Bluetooth: REMOVED (hardware kill)', color: '#ffcc00', delay: 200 },
                { text: '  Ethernet: DISCONNECTED', color: '#ffcc00', delay: 200 },
                { text: '', delay: 100 },
                { text: 'Loading Kali Linux (forensic mode)...', color: 'rgba(255,255,255,0.5)', delay: 800 },
                { text: '  [████████████████████████████████] 100%', color: '#00ff41', delay: 1200 },
                { text: '', delay: 100 },
                { text: 'root@airgapped:~# ', color: '#00ff41', delay: 600 },
                { text: 'FORENSIC WORKSTATION READY', color: '#00ff41', delay: 400, bold: true },
                { text: 'No network. No leaks. No traces.', color: 'rgba(255,255,255,0.3)', delay: 300 }
            ];

            let totalDelay = 0;
            lines.forEach(line => {
                totalDelay += line.delay;
                MC.schedule(() => {
                    const div = document.createElement('div');
                    div.style.cssText = `
                        opacity:0;animation:mc-fadeIn 0.2s ease forwards;
                        padding:1px 0;
                        color:${line.color};
                        ${line.bold ? 'font-weight:bold;' : ''}
                    `;
                    div.textContent = line.text;
                    bootDiv.appendChild(div);
                    if (line.text.startsWith('⚠') || line.bold) MC.playBeep(1000, 0.05);
                    else if (line.text.startsWith('root@')) MC.playTypeTick();
                }, totalDelay);
            });

            MC.schedule(resolve, totalDelay + 1500);
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 2: WRITE-BLOCKER — hardware forensic bridge
       ══════════════════════════════════════════════════════════ */
    function phase2_writeBlocker(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('WRITE-BLOCKER ENGAGED');
            content.innerHTML = '';

            const wbDiv = document.createElement('div');
            wbDiv.style.cssText = 'width:100%;max-width:600px;margin:0 auto;text-align:center;';
            content.appendChild(wbDiv);

            // Device visual
            const device = document.createElement('div');
            device.style.cssText = `
                margin:20px auto;padding:20px;max-width:400px;
                border:2px solid rgba(0,255,65,0.3);border-radius:8px;
                background:rgba(0,255,65,0.02);
                animation:mc-fadeIn 0.6s ease;
            `;
            device.innerHTML = `
                <div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.3);margin-bottom:10px;">HARDWARE DEVICE</div>
                <div style="font-size:16px;color:#00ff41;font-weight:bold;margin-bottom:5px;">Tableau T35u Forensic Bridge</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:15px;">USB 3.0 Write-Blocker</div>
                <div style="display:flex;justify-content:center;gap:15px;font-size:11px;">
                    <div style="padding:5px 10px;border:1px solid rgba(0,255,65,0.2);border-radius:4px;">
                        <div style="color:rgba(255,255,255,0.3);">READ</div>
                        <div style="color:#00ff41;font-weight:bold;">ENABLED</div>
                    </div>
                    <div style="padding:5px 10px;border:1px solid rgba(255,0,0,0.3);border-radius:4px;">
                        <div style="color:rgba(255,255,255,0.3);">WRITE</div>
                        <div style="color:#ff4444;font-weight:bold;">BLOCKED</div>
                    </div>
                </div>
            `;
            wbDiv.appendChild(device);
            MC.playImpact();

            // Explanation
            MC.schedule(() => {
                const explain = document.createElement('div');
                explain.style.cssText = 'margin-top:15px;font-size:11px;color:rgba(255,255,255,0.5);animation:mc-fadeIn 0.4s ease;';
                explain.innerHTML = `
                    <div style="margin-bottom:8px;">USB inserted through hardware write-blocker.</div>
                    <div style="margin-bottom:4px;">✓ Data can be READ from the USB</div>
                    <div style="margin-bottom:4px;">✗ No data can be WRITTEN to the USB</div>
                    <div style="margin-bottom:4px;">✓ Filesystem metadata preserved</div>
                    <div>✓ Evidence integrity maintained for court</div>
                `;
                wbDiv.appendChild(explain);
            }, 1500);

            MC.schedule(resolve, 4000);
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 3: CHECKSUMS — SHA-256 hashing animation
       ══════════════════════════════════════════════════════════ */
    function phase3_checksums(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('EVIDENCE INTEGRITY — SHA-256');
            content.innerHTML = '';

            const hashDiv = document.createElement('div');
            hashDiv.style.cssText = 'width:100%;max-width:650px;margin:0 auto;font-size:11px;';
            content.appendChild(hashDiv);

            const files = [
                { name: 'README.txt', size: '2.4 KB', hash: 'a7f3b2c8d4e6f1a9b5c7d3e8f2a4b6c8d1e3f5a7b9c2d4e6f8a1b3c5d7e9f0a2' },
                { name: 'schematics_echo.pdf', size: '4.7 MB', hash: 'b8e4c3d5f7a2b6c9d1e5f3a8b4c7d2e6f9a3b5c8d4e7f1a9b6c2d5e8f3a7b1c4' },
                { name: 'evidence.zip.enc', size: '89.3 MB', hash: 'c9f5d4e6a8b3c7d2e1f6a4b9c5d8e3f7a2b6c1d4e9f5a8b3c7d2e6f1a9b4c8d5' },
                { name: 'calibration_logs/', size: '12.1 MB', hash: 'd1a6e5f7b4c8d3e2f9a5b1c6d7e4f8a3b9c2d5e1f6a7b4c8d3e9f2a6b1c5d8e7' },
                { name: 'hoffmann_private/', size: '3.2 MB', hash: 'e2b7f6a8c5d9e4f3a1b6c7d2e8f5a9b3c4d1e6f7a2b8c5d9e3f4a1b6c7d2e8f5' }
            ];

            let delay = 0;
            files.forEach((file, idx) => {
                MC.schedule(() => {
                    const row = document.createElement('div');
                    row.style.cssText = `
                        display:flex;align-items:center;gap:8px;
                        padding:6px 8px;margin-bottom:3px;
                        border-left:2px solid rgba(0,255,65,0.1);
                        opacity:0;animation:mc-fadeIn 0.3s ease forwards;
                    `;
                    row.innerHTML = `
                        <div style="min-width:180px;">
                            <span style="color:#c0c0c0;">${file.name}</span>
                            <span style="color:rgba(255,255,255,0.25);font-size:10px;margin-left:5px;">${file.size}</span>
                        </div>
                        <div class="hash-${idx}" style="color:rgba(255,255,255,0.2);font-family:monospace;font-size:9px;word-break:break-all;">Computing...</div>
                        <div class="check-${idx}" style="min-width:16px;"></div>
                    `;
                    hashDiv.appendChild(row);
                    MC.playTypeTick();

                    // Hash appears after delay
                    MC.schedule(() => {
                        const hashEl = row.querySelector(`.hash-${idx}`);
                        const checkEl = row.querySelector(`.check-${idx}`);
                        if (hashEl) {
                            hashEl.textContent = file.hash;
                            hashEl.style.color = 'rgba(0,255,65,0.4)';
                        }
                        if (checkEl) {
                            checkEl.textContent = '✓';
                            checkEl.style.color = '#00ff41';
                        }
                        MC.playBeep(1200, 0.04);
                    }, 800 + idx * 200);
                }, delay);
                delay += 1200;
            });

            // Summary
            MC.schedule(() => {
                const summary = document.createElement('div');
                summary.style.cssText = `
                    margin-top:15px;padding:10px;text-align:center;
                    border:1px solid rgba(0,255,65,0.2);border-radius:4px;
                    animation:mc-fadeIn 0.5s ease;
                `;
                summary.innerHTML = `
                    <div style="color:#00ff41;font-size:12px;font-weight:bold;">ALL HASHES VERIFIED</div>
                    <div style="color:rgba(255,255,255,0.35);font-size:10px;margin-top:4px;">Evidence chain of custody intact</div>
                `;
                hashDiv.appendChild(summary);
                MC.playImpact();
            }, delay + 1500);

            MC.schedule(resolve, delay + 3500);
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 4: SANDBOX — isolated execution environment
       ══════════════════════════════════════════════════════════ */
    function phase4_sandbox(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('SANDBOX ENVIRONMENT');
            content.innerHTML = '';

            const sbDiv = document.createElement('div');
            sbDiv.style.cssText = 'width:100%;max-width:600px;margin:0 auto;';
            content.appendChild(sbDiv);

            const commands = [
                { cmd: 'root@airgapped:~# firejail --net=none --private bash', delay: 600, color: '#00ff41' },
                { cmd: '  Sandbox created. PID namespace isolated.', delay: 500, color: 'rgba(255,255,255,0.5)' },
                { cmd: '  Network: DENIED', delay: 300, color: '#ffcc00' },
                { cmd: '  Filesystem: READ-ONLY overlay', delay: 300, color: '#ffcc00' },
                { cmd: '  Processes: ISOLATED', delay: 300, color: '#ffcc00' },
                { cmd: '', delay: 100 },
                { cmd: 'sandbox@airgapped:~$ mount -o ro /dev/sdb1 /mnt/usb', delay: 600, color: '#00ff41' },
                { cmd: '  Mounted: /mnt/usb (read-only)', delay: 400, color: 'rgba(255,255,255,0.5)' },
                { cmd: '', delay: 100 },
                { cmd: 'sandbox@airgapped:~$ ls -la /mnt/usb/', delay: 600, color: '#00ff41' },
                { cmd: '  drwxr-xr-x  README.txt', delay: 200, color: 'rgba(255,255,255,0.5)' },
                { cmd: '  drwxr-xr-x  schematics_echo.pdf', delay: 200, color: 'rgba(255,255,255,0.5)' },
                { cmd: '  drwxr-xr-x  evidence.zip.enc', delay: 200, color: '#ffcc00' },
                { cmd: '  drwxr-xr-x  calibration_logs/', delay: 200, color: 'rgba(255,255,255,0.5)' },
                { cmd: '', delay: 100 },
                { cmd: '  ╔═══════════════════════════════════════╗', delay: 400, color: '#00ff41' },
                { cmd: '  ║  FORENSIC ANALYSIS ENVIRONMENT READY  ║', delay: 200, color: '#00ff41' },
                { cmd: '  ╚═══════════════════════════════════════╝', delay: 200, color: '#00ff41' }
            ];

            let totalDelay = 0;
            commands.forEach(c => {
                totalDelay += c.delay;
                MC.schedule(() => {
                    const line = document.createElement('div');
                    line.style.cssText = `
                        opacity:0;animation:mc-fadeIn 0.2s ease forwards;
                        padding:1px 0;font-size:11px;
                        color:${c.color};
                    `;
                    line.textContent = c.cmd;
                    sbDiv.appendChild(line);
                    if (c.cmd.includes('#') || c.cmd.includes('$')) MC.playTypeTick();
                }, totalDelay);
            });

            MC.schedule(resolve, totalDelay + 2000);
        });
    }

    /* ══════════════════════════════════════════════════════════
       MAIN ENTRY POINT
       ══════════════════════════════════════════════════════════ */
    function play(game) {
        game.setFlag('forensic_prep_complete', true);

        MC.initAudio();
        const ov = MC.createOverlay({ phaseLabel: 'FORENSIC ANALYSIS PREP', className: 'mc-terminal-green' });
        MC.startDrone(30, 31.5, 80);

        const content = MC.getContent();
        content.innerHTML = '';

        // Opening
        const openDiv = document.createElement('div');
        openDiv.style.cssText = 'text-align:center;margin-bottom:15px;';
        content.appendChild(openDiv);

        MC.revealDialogue(openDiv, [
            { speaker: 'Ryan', text: '"TRUST THE PROCESS - AIR-GAPPED ONLY." They weren\'t kidding.' },
            { speaker: 'Ryan', text: 'Before I look at what\'s on this USB, I need to do this properly.' },
            { speaker: 'Ryan', text: 'Forensic workstation. Write-blocker. Checksums. By the book.' },
            { speaker: '', text: '*Ryan reaches for the ThinkPad X230 on the lower shelf*' }
        ], { pauseBetween: 1500 });

        MC.schedule(() => {
            content.innerHTML = '';
            phase1_boot(content).then(() => {
                return phase2_writeBlocker(content);
            }).then(() => {
                return phase3_checksums(content);
            }).then(() => {
                return phase4_sandbox(content);
            }).then(() => {
                MC.stopDrone(2);
                MC.schedule(() => {
                    game.showNotification('Forensic environment ready — click air-gapped laptop to analyze USB');
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
            game.setFlag('forensic_prep_complete', true);
            game.showNotification('Forensic prep complete — click air-gapped laptop to analyze USB');
        });
    }

    return { play };
})();
