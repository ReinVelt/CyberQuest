/**
 * Mancave – Eva Reveal Cinematic Sequence
 * ═══════════════════════════════════════════════════════════
 * CSI-style photo analysis and identity discovery:
 *   Phase 1 – Photo Analysis (SSTV image, EXIF data, reflection enhance)
 *   Phase 2 – Identity Match (email metadata search, surname connection)
 *   Phase 3 – Personnel File (section-by-section classified reveal)
 *   Phase 4 – Ryan's Realization (dramatic dialogue)
 *
 * Flags set: identified_eva
 * Quests: completes identify_eva, adds contact_eva
 * ═══════════════════════════════════════════════════════════
 */

window.MancaveEvaReveal = (function () {
    'use strict';
    const MC = window.MancaveCinematic;

    /* ── Personnel file sections ──────────────────────────── */
    const PERSONNEL_SECTIONS = [
        {
            title: 'BASIC INFORMATION',
            content: `NAME: Weber, Eva Marie
DATE OF BIRTH: 1994-03-17 (Age 31)
POSITION: IT Security Analyst
DEPARTMENT: Information Systems
CLEARANCE: Level 3 (SECRET)
EMPLOYMENT START: 2018-06-01`
        },
        {
            title: 'EDUCATION',
            content: `MSc Computer Science, TU Munich (2016)
BSc IT Security, TU Darmstadt (2014)
Specialization: Network Security, Cryptography`
        },
        {
            title: 'PREVIOUS EMPLOYMENT',
            content: `Siemens AG, Cybersecurity Division (2016-2018)
Internship: Federal Office for Information Security (BSI) (2015)`
        },
        {
            title: 'FAMILY CONNECTIONS',
            content: `Father: Dr. Klaus Weber (Senior Engineer, same facility)
Mother: Deceased (2019)`,
            highlight: true
        },
        {
            title: 'SECURITY NOTES',
            content: `Clearance renewed 2024-08 without incident
Access to all internal communication systems
Responsible for network monitoring and intrusion detection
Has raised concerns about network anomalies (see incident log 2024-07-22)`,
            highlight: true
        },
        {
            title: 'SUPERVISOR EVALUATION',
            content: `"Highly competent. Sometimes too inquisitive about matters outside her purview. Reminds her father."
— Director Hoffmann, 2024 annual review`,
            highlight: true
        }
    ];

    /* ══════════════════════════════════════════════════════════
       PHASE 1: PHOTO ANALYSIS — CSI-style enhance sequence
       ══════════════════════════════════════════════════════════ */
    function phase1_photoAnalysis(content) {
        return new Promise(resolve => {
            const analysisDiv = document.createElement('div');
            analysisDiv.style.cssText = 'text-align:center;width:100%;';
            content.appendChild(analysisDiv);

            // SSTV Image placeholder
            const imageFrame = document.createElement('div');
            imageFrame.style.cssText = `
                width:300px; height:200px; margin:0 auto 20px;
                background:rgba(20,25,20,0.9);
                border:2px solid rgba(0,255,65,0.3);
                border-radius:4px;
                display:flex; align-items:center; justify-content:center;
                position:relative; overflow:hidden;
            `;
            imageFrame.innerHTML = `
                <img src="assets/images/scenes/sstv_decoded.svg" alt="SSTV Decoded — Ryan's farmhouse" style="width:100%;height:100%;object-fit:cover;opacity:0.9;" />
                <div style="position:absolute;top:8px;left:8px;font-size:8px;color:rgba(0,255,65,0.5);letter-spacing:2px;text-shadow:0 0 4px rgba(0,255,65,0.3);">SSTV DECODED — 14.230 MHz</div>
                <div style="position:absolute;bottom:10px;right:10px;font-size:9px;color:rgba(255,255,255,0.3);">Surveillance photo — Ryan's house</div>
            `;
            analysisDiv.appendChild(imageFrame);

            // Terminal commands
            const terminal = document.createElement('div');
            terminal.className = 'mc-typewriter';
            terminal.style.cssText = 'text-align:left;max-width:600px;margin:10px auto;font-size:12px;';
            analysisDiv.appendChild(terminal);

            const commands = [
                { cmd: '> exiftool sstv_image.png', delay: 800 },
                { cmd: '  Camera: NIKON D750', delay: 600 },
                { cmd: '  Serial: 6024***', delay: 400, highlight: true },
                { cmd: '  GPS: [STRIPPED]', delay: 400 },
                { cmd: '  Date: 2026-02-04 22:17:33', delay: 400 },
                { cmd: '', delay: 200 },
                { cmd: '> enhance --region=window_reflection --factor=4x', delay: 1000 },
                { cmd: '  [PROCESSING] ████████████████████ 100%', delay: 1200 },
                { cmd: '  Detected: HUMAN FIGURE in reflection', delay: 600, highlight: true },
                { cmd: '  Gender: Female | Hair: Long', delay: 400 },
                { cmd: '  Object detected: LANYARD / FACILITY BADGE', delay: 400, highlight: true },
                { cmd: '', delay: 200 },
                { cmd: '> MATCH: Steckerdoser Heide R&D badge format', delay: 800, highlight: true }
            ];

            let cmdIdx = 0;
            let totalDelay = 0;

            commands.forEach(c => {
                totalDelay += c.delay;
                MC.schedule(() => {
                    const line = document.createElement('div');
                    line.style.cssText = `opacity:0;animation:mc-fadeIn 0.3s ease forwards;padding:2px 0;${c.highlight ? 'color:#00ff41;font-weight:bold;' : 'color:rgba(255,255,255,0.6);'}`;
                    line.textContent = c.cmd;
                    terminal.appendChild(line);
                    if (c.cmd.startsWith('>')) MC.playBeep(1000);
                    else if (c.highlight) MC.playBeep(1400, 0.06);

                    if (c.cmd.includes('ENHANCE') || c.cmd.includes('enhance')) {
                        // Zoom effect on image
                        imageFrame.style.transition = 'all 1.5s ease';
                        imageFrame.style.transform = 'scale(1.1)';
                        imageFrame.style.borderColor = 'rgba(0,255,65,0.6)';
                    }
                }, totalDelay);
            });

            MC.schedule(resolve, totalDelay + 1500);
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 2: IDENTITY MATCH — email search animation
       ══════════════════════════════════════════════════════════ */
    function phase2_identityMatch(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('EMAIL METADATA SEARCH');
            content.innerHTML = '';

            const matchDiv = document.createElement('div');
            matchDiv.style.cssText = 'text-align:center;width:100%;';
            content.appendChild(matchDiv);

            const searchLines = [
                { text: '> grep -r "weber" email_archive/*.eml', color: 'rgba(255,255,255,0.6)' },
                { text: '  Searching 2,847 emails...', color: 'rgba(255,255,255,0.4)' },
                { text: '  24 matches found', color: '#ffcc00' },
                { text: '', color: '' },
                { text: '  CC: weber.eva@steckerdoser-rd.mil.de', color: '#00ff41', bold: true },
                { text: '', color: '' },
                { text: '> whois weber.eva → WEBER, Eva Marie', color: '#00ff41', bold: true },
                { text: '> relation weber.klaus weber.eva', color: 'rgba(255,255,255,0.6)' },
                { text: '  MATCH: Father → Daughter', color: '#ff4444', bold: true }
            ];

            const termDiv = document.createElement('div');
            termDiv.className = 'mc-typewriter';
            termDiv.style.cssText = 'text-align:left;max-width:600px;margin:20px auto;font-size:13px;';
            matchDiv.appendChild(termDiv);

            let delay = 0;
            searchLines.forEach(line => {
                delay += 900;
                MC.schedule(() => {
                    const div = document.createElement('div');
                    div.style.cssText = `opacity:0;animation:mc-fadeIn 0.3s ease forwards;padding:3px 0;color:${line.color};${line.bold ? 'font-weight:bold;' : ''}`;
                    div.textContent = line.text;
                    termDiv.appendChild(div);
                    if (line.bold) MC.playBeep(1200, 0.06);
                }, delay);
            });

            // Connection reveal
            MC.schedule(() => {
                const connection = document.createElement('div');
                connection.style.cssText = 'margin:25px auto;max-width:500px;padding:20px;border:1px solid rgba(255,0,0,0.3);border-radius:4px;background:rgba(80,0,0,0.1);animation:mc-fadeIn 0.6s ease;text-align:center;';
                connection.innerHTML = `
                    <div style="display:flex;justify-content:center;align-items:center;gap:30px;">
                        <div style="text-align:center;">
                            <div style="font-size:12px;color:rgba(255,255,255,0.4);">Father</div>
                            <div style="font-size:15px;font-weight:bold;color:#ffcc00;">Klaus Weber</div>
                            <div style="font-size:10px;color:rgba(255,255,255,0.3);">Wrote concern email</div>
                        </div>
                        <div style="font-size:24px;color:#ff4444;">→</div>
                        <div style="text-align:center;">
                            <div style="font-size:12px;color:rgba(255,255,255,0.4);">Daughter</div>
                            <div style="font-size:15px;font-weight:bold;color:#ff4444;">Eva Weber</div>
                            <div style="font-size:10px;color:rgba(255,255,255,0.3);">IT Security Analyst</div>
                        </div>
                    </div>
                `;
                matchDiv.appendChild(connection);
                MC.playImpact();
            }, delay + 1500);

            MC.schedule(resolve, delay + 4000);
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 3: PERSONNEL FILE — section by section reveal
       ══════════════════════════════════════════════════════════ */
    function phase3_personnelFile(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('PERSONNEL FILE — CLASSIFIED');
            content.innerHTML = '';

            const fileCard = document.createElement('div');
            fileCard.className = 'mc-doc-card';
            fileCard.style.position = 'relative';
            fileCard.innerHTML = `
                <div class="mc-doc-header">
                    <div class="mc-doc-title">Personnel File — Eva Weber</div>
                    <div class="mc-doc-meta">STECKERDOSER HEIDE R&D FACILITY | Last Updated: 2025-11-03</div>
                </div>
                <div class="mc-doc-body mc-scroll-area" style="max-height:50vh;"></div>
            `;
            content.appendChild(fileCard);

            // STRENG GEHEIM watermark
            MC.schedule(() => {
                const stamp = document.createElement('div');
                stamp.className = 'mc-doc-classification';
                stamp.textContent = 'STRENG GEHEIM';
                fileCard.appendChild(stamp);
            }, 500);

            const body = fileCard.querySelector('.mc-doc-body');
            let sectionDelay = 1000;

            PERSONNEL_SECTIONS.forEach((section, i) => {
                MC.schedule(() => {
                    const sectionDiv = document.createElement('div');
                    sectionDiv.style.cssText = `
                        margin-bottom:18px;opacity:0;animation:mc-fadeIn 0.6s ease forwards;
                        ${section.highlight ? 'padding:10px;background:rgba(255,255,0,0.03);border-left:2px solid rgba(255,204,0,0.3);' : ''}
                    `;
                    sectionDiv.innerHTML = `
                        <div style="font-size:10px;letter-spacing:3px;color:${section.highlight ? '#ffcc00' : 'rgba(255,255,255,0.4)'};margin-bottom:6px;font-weight:bold;">${section.title}</div>
                        <div style="font-size:12px;color:#c0c0c0;line-height:1.7;white-space:pre-wrap;">${section.content}</div>
                    `;
                    body.appendChild(sectionDiv);
                    body.scrollTop = body.scrollHeight;

                    MC.playPaperShuffle();
                    if (section.highlight) MC.playBeep(1100, 0.05);
                }, sectionDelay);

                sectionDelay += 2500;
            });

            MC.schedule(resolve, sectionDelay + 500);
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 4: RYAN'S REALIZATION
       ══════════════════════════════════════════════════════════ */
    function phase4_flashback(content) {
        return new Promise(resolve => {
            MC.setPhaseLabel('MEMORY — TWO YEARS AGO');
            content.innerHTML = '';

            const fb = document.createElement('div');
            fb.style.cssText = 'width:100%;max-width:550px;margin:0 auto;text-align:center;';
            content.appendChild(fb);

            // Warm-tone flashback container
            const memory = document.createElement('div');
            memory.style.cssText = `
                padding:20px;border-radius:10px;
                background:linear-gradient(135deg,rgba(255,180,50,0.06),rgba(255,220,130,0.04));
                border:1px solid rgba(255,200,80,0.15);
                animation:mc-fadeIn 1.2s ease;
            `;
            memory.innerHTML = `
                <div style="font-size:10px;color:rgba(255,200,80,0.5);text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">
                    ☀ Compascuum — Two Years Ago ☀
                </div>
                <div style="font-size:30px;margin:10px 0;">🐕 🌿 🐕‍🦺</div>
                <div style="font-size:11px;color:rgba(255,220,150,0.7);line-height:1.7;margin-top:10px;text-align:left;" class="fb-text"></div>
            `;
            fb.appendChild(memory);

            const textArea = memory.querySelector('.fb-text');

            const moments = [
                { text: 'A sunny Saturday morning. The Tony Knight rescue dog training field.', delay: 0 },
                { text: 'Ies is there with the dogs — volunteering like she does every month.', delay: 2000 },
                { text: '"Ryan, this is Eva. She\'s from Germany. Also rescue dogs."', delay: 2000 },
                { text: 'A handshake. Warm smile. She seemed genuinely interested in the dogs.', delay: 2200 },
                { text: 'Later that afternoon — she came to the house. Ies gave her the tour.', delay: 2200 },
                { text: 'Then the mancave. Her eyes went wide at the radio equipment.', delay: 2000 },
                { text: '"You built all this yourself? The SDR setup, the Meshtastic mesh?"', delay: 2200 },
                { text: 'Sharp questions. Very sharp. About frequencies, encryption, off-grid comms.', delay: 2200 },
                { text: 'A busy weekend. Nice woman. And then... life moved on. I forgot.', delay: 2000 },
                { text: 'But she didn\'t forget.', delay: 2500 }
            ];

            let delay = 800;
            moments.forEach(m => {
                delay += m.delay;
                MC.schedule(() => {
                    const line = document.createElement('div');
                    line.textContent = m.text;
                    line.style.cssText = 'margin-bottom:6px;opacity:0;animation:mc-fadeIn 0.6s ease forwards;';
                    textArea.appendChild(line);
                    if (m.text.includes('forgot')) MC.playImpact();
                }, delay);
            });

            MC.schedule(resolve, delay + 3000);
        });
    }

    function phase4_realization(content, game) {
        return new Promise(resolve => {
            const reaction = document.createElement('div');
            reaction.style.cssText = 'margin-top:20px;padding-top:15px;border-top:1px solid rgba(255,255,255,0.1);';
            content.appendChild(reaction);

            MC.revealDialogue(reaction, [
                { speaker: 'Ryan', text: 'IT Security Analyst. Network access to everything.' },
                { speaker: 'Ryan', text: 'Klaus Weber\'s daughter. He wrote the concern email.' },
                { speaker: 'Ryan', text: '"Too inquisitive about matters outside her purview"' },
                { speaker: 'Ryan', text: 'She found something. Tried to raise concerns. Got shut down.' },
                { speaker: 'Ryan', text: 'So she went outside. Found me. But HOW?' },
                { speaker: 'Ryan', text: 'Wait. Weber. Eva Weber...' }
            ], {
                pauseBetween: 2000,
                onDone: () => {
                    // ── Dog training flashback ──
                    MC.schedule(() => {
                        phase4_flashback(content).then(() => {
                            MC.setPhaseLabel('REALIZATION');
                            content.innerHTML = '';
                            const postFb = document.createElement('div');
                            postFb.style.cssText = 'margin-top:15px;';
                            content.appendChild(postFb);

                            MC.revealDialogue(postFb, [
                                { speaker: 'Ryan', text: 'She remembered the hacker in Drenthe with the radio lab and no government ties.' },
                                { speaker: 'Ryan', text: 'Eva Weber. "E". The whistleblower. She chose me because she\'d BEEN here.' },
                                { speaker: 'Ryan', text: 'Now I need to contact her. Securely.' }
                            ], {
                                pauseBetween: 2000,
                                onDone: () => {
                                    game.completeQuest('identify_eva');
                                    game.addQuest({
                                        id: 'contact_eva',
                                        name: 'Contact Eva Weber',
                                        description: 'Establish secure communication with Eva Weber using Meshtastic off-grid network.',
                                        hint: 'Eva mentioned coordinates in her message. Check the Meshtastic device.'
                                    });
                                    MC.schedule(resolve, 1500);
                                }
                            });
                        });
                    }, 500);
                }
            });
        });
    }

    /* ══════════════════════════════════════════════════════════
       MAIN ENTRY POINT
       ══════════════════════════════════════════════════════════ */
    function play(game) {
        game.setFlag('identified_eva', true);
        game.setStoryPart(15);

        MC.initAudio();
        const ov = MC.createOverlay({ phaseLabel: 'PHOTO ANALYSIS', className: 'mc-terminal-green' });
        MC.startDrone(32, 33.5, 90);

        const content = MC.getContent();
        content.innerHTML = '';

        // Opening dialogue
        const openDiv = document.createElement('div');
        openDiv.style.cssText = 'text-align:center;margin-bottom:15px;';
        content.appendChild(openDiv);

        MC.revealDialogue(openDiv, [
            { speaker: 'Ryan', text: 'How does E know me? Why choose a random hacker in Drenthe?' },
            { speaker: 'Ryan', text: 'There must be a connection. Something personal. But first — the photo.' },
            { speaker: '', text: '*Pulls up SSTV image on air-gapped laptop*' }
        ], { pauseBetween: 1800 });

        MC.schedule(() => {
            content.innerHTML = '';
            phase1_photoAnalysis(content).then(() => {
                return phase2_identityMatch(content);
            }).then(() => {
                return phase3_personnelFile(content);
            }).then(() => {
                return phase4_realization(content, game);
            }).then(() => {
                MC.stopDrone(2);
                MC.schedule(() => {
                    game.showNotification('Eva Weber identified as "E"');
                    MC.destroyOverlay(1);
                    MC.schedule(() => MC.destroyAudio(), 1200);
                }, 500);
            });
        }, 7000);

        MC.onSkip(() => {
            MC.clearAllTimers();
            MC.stopDrone(0.5);
            MC.destroyOverlay(0.4);
            MC.schedule(() => MC.destroyAudio(), 600);
            game.setFlag('identified_eva', true);
            game.completeQuest('identify_eva');
            game.addQuest({
                id: 'contact_eva',
                name: 'Contact Eva Weber',
                description: 'Establish secure communication with Eva Weber using Meshtastic.',
                hint: 'Check the Meshtastic device.'
            });
            game.showNotification('Eva Weber identified — use Meshtastic to contact her');
        });
    }

    return { play };
})();
