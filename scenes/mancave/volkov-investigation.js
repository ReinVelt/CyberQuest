/**
 * Mancave – Volkov Investigation Cinematic Sequence
 * ═══════════════════════════════════════════════════════════
 * Multi-phase investigation with dramatic reveals:
 *   Phase 1 – Volkov deep dive (red atmosphere, email evidence)
 *   Phase 2 – Test signatures ("V." reveal)
 *   Phase 3 – Chris Kubecka OSINT (Signal chat, SPEKTR reveal)
 *   Phase 4 – Dead Ends montage (coffee, clock, pacing)
 *   Phase 5 – ZERFALL discovery (news clippings, connection lines)
 *   Phase 6 – Chris follow-up (ZERFALL confirmation)
 *
 * Flags set: volkov_investigated, contacted_kubecka, discovered_zerfall
 * Quests: completes contact_kubecka, adds identify_eva
 * ═══════════════════════════════════════════════════════════
 */

window.MancaveVolkovInvestigation = (function () {
    'use strict';
    const MC = window.MancaveCinematic;

    /* ── Volkov email content ─────────────────────────────── */
    const VOLKOV_EMAIL = {
        from: 'weber.klaus@steckerdoser-rd.mil.de',
        to: 'schmidt.anna@steckerdoser-rd.mil.de',
        subject: 'RE: Consultant concerns',
        date: '2024-06-15 09:42',
        paragraphs: [
            'Anna,',
            'I share your concerns about Dr. V\'s access level. His contributions to the signal propagation algorithms have been invaluable, but his background check is still pending from BND. I\'ve raised this with Director Hoffmann twice. Both times I was told to "focus on delivery."',
            'The pressure from above is immense. Someone wants this project completed regardless of protocol.',
            'I\'ve done some digging on my own (don\'t tell anyone). Volkov\'s work history has gaps. Big gaps. The companies he claims to have worked for in the 90s? Some don\'t exist anymore. Some never existed. His academic credentials check out, but everything before 1998 is fuzzy.',
            'Anna, I think we have a mole. Or worse — our entire project might be compromised from the inside.',
            'But when I raised this with Hoffmann, he shut me down. Hard. Said Volkov was "personally vouched for at the highest levels" and that questioning him was "above my pay grade."',
            'I don\'t know what to do. Do we keep working on this and hope for the best? Or do we risk our careers to blow the whistle?',
            'Klaus',
            'PS: Delete this email after reading. I\'m serious.'
        ],
        highlights: [
            { text: 'background check is still pending', class: 'mc-highlight-yellow' },
            { text: 'gaps. Big gaps', class: 'mc-highlight' },
            { text: 'Some never existed', class: 'mc-highlight' },
            { text: 'personally vouched for at the highest levels', class: 'mc-highlight' },
            { text: 'above my pay grade', class: 'mc-highlight' },
            { text: 'mole', class: 'mc-highlight' },
            { text: 'compromised from the inside', class: 'mc-highlight' },
            { text: 'Delete this email', class: 'mc-highlight' }
        ]
    };

    /* ── Chris Kubecka OSINT messages ─────────────────────── */
    const KUBECKA_MESSAGES_1 = [
        { from: 'Ryan', text: 'Chris — need your OSINT magic. Looking into someone named Volkov, possibly Russian, working on RF weapons research in Germany. High stakes, short timeline. Can you dig?', timestamp: '08:42' },
        { from: 'Chris Kubecka', text: 'Volkov? I know that name. Give me an hour.', timestamp: '08:44' },
        { from: 'Chris Kubecka', text: 'Okay, this is interesting. Dimitri Volkov, 52, former Soviet military researcher. Officially "defected" in 1998 after the USSR collapse. Worked at various European defense contractors under different names — Volkov is his real one.', timestamp: '09:37' },
        { from: 'Chris Kubecka', text: 'Here\'s the kicker: he was part of a Soviet program called СПЕКТР (Spektr) in the late 80s. Classified RF research. The program was supposedly shut down, but rumors in certain circles say the research continued... privately.', timestamp: '09:38' },
        { from: 'Chris Kubecka', text: 'I\'ve seen his name pop up in connection with some very nasty drone incidents in Ukraine. Signal jamming, GPS spoofing — but more targeted than usual. Like someone knew exactly which frequencies to hit.', timestamp: '09:39' },
        { from: 'Chris Kubecka', text: 'If he\'s at that German facility, they didn\'t hire a consultant. They hired the architect of Soviet RF warfare.\n\nBe careful, Ryan. People who dig into Volkov tend to have accidents.\n\nI\'ll keep looking. Watch your back.', timestamp: '09:41' }
    ];

    const KUBECKA_MESSAGES_2 = [
        { from: 'Ryan', text: 'Chris — the Reichsbürger connection. Was Volkov ever linked to that network?', timestamp: '12:18' },
        { from: 'Chris Kubecka', text: 'Jesus, Ryan. I dug deeper after your message.', timestamp: '12:23' },
        { from: 'Chris Kubecka', text: 'Volkov\'s name appears in leaked FSB documents from 2019. He\'s listed as a "technical asset" for something called Operation ZERFALL — German for "decay" or "collapse."', timestamp: '12:24' },
        { from: 'Chris Kubecka', text: 'The operation\'s goal: "preparation of conditions for political transition in target nation."\n\nI found references to "technical disruption capabilities" being developed "within target infrastructure." That\'s Project Echo.', timestamp: '12:25' },
        { from: 'Chris Kubecka', text: 'The Reichsbürger plot was the political arm. Echo is the technical arm. They\'re meant to work TOGETHER.\n\nThe 2022 arrests set them back, but they didn\'t stop. They just went deeper underground.', timestamp: '12:27' },
        { from: 'Chris Kubecka', text: 'Ryan, this is beyond us. This needs BND, NATO, someone with actual power. But you need PROOF they can\'t ignore. Hard evidence of Russian control.\n\nFind "E". They\'re your key.\n\nStay safe.', timestamp: '12:29' }
    ];

    /* ══════════════════════════════════════════════════════════
       PHASE 1 & 2: VOLKOV DEEP DIVE + Email + Test signatures
       ══════════════════════════════════════════════════════════ */
    function phaseVolkovDive(game, onDone) {
        game.setFlag('volkov_investigated', true);
        game.setStoryPart(11);

        MC.initAudio();
        const ov = MC.createOverlay({ phaseLabel: 'INVESTIGATING VOLKOV' });
        MC.startDrone(30, 31, 70);

        const content = MC.getContent();
        content.innerHTML = '';

        // Opening dialogue
        const openDiv = document.createElement('div');
        openDiv.style.cssText = 'text-align:center;margin-bottom:20px;';
        content.appendChild(openDiv);

        MC.revealDialogue(openDiv, [
            { speaker: 'Ryan', text: 'Three allies on board. Now... who is Volkov, really?' },
            { speaker: '', text: '*Opens evidence files, searching for clues*' },
            { speaker: 'Ryan', text: 'Scanning email metadata... here! Internal email flagged:' }
        ], { pauseBetween: 2000 });

        // Show email after dialogue
        MC.schedule(() => {
            MC.setPhaseLabel('INTERNAL EMAIL — SECURITY CONCERNS');
            content.innerHTML = '';

            const emailCard = document.createElement('div');
            emailCard.className = 'mc-doc-card';
            emailCard.innerHTML = `
                <div class="mc-doc-header">
                    <div class="mc-doc-title" style="color:#ffcc00;">✉ Internal Email</div>
                    <div class="mc-doc-meta">
                        From: ${VOLKOV_EMAIL.from}<br>
                        To: ${VOLKOV_EMAIL.to}<br>
                        Subject: ${VOLKOV_EMAIL.subject}<br>
                        Date: ${VOLKOV_EMAIL.date}
                    </div>
                </div>
                <div class="mc-doc-body mc-scroll-area" style="max-height:45vh;"></div>
            `;
            content.appendChild(emailCard);

            const body = emailCard.querySelector('.mc-doc-body');
            const fullText = VOLKOV_EMAIL.paragraphs.join('\n\n');

            MC.typewrite(body, fullText, {
                speed: 15,
                highlights: VOLKOV_EMAIL.highlights,
                onDone: () => {
                    // Ryan's reaction to email
                    MC.schedule(() => {
                        const reaction = document.createElement('div');
                        reaction.style.cssText = 'margin-top:15px;';
                        content.appendChild(reaction);

                        MC.revealDialogue(reaction, [
                            { speaker: 'Ryan', text: 'Background check STILL pending. Gaps in work history.' },
                            { speaker: 'Ryan', text: '"Personally vouched for at the highest levels"' },
                            { speaker: 'Ryan', text: 'Someone powerful is protecting him. This goes deep.' }
                        ], { pauseBetween: 2000 });
                    }, 1000);

                    // Phase 2: Test signatures
                    MC.schedule(() => {
                        MC.setPhaseLabel('TEST REPORT SIGNATURES');
                        content.innerHTML = '';

                        const sigDiv = document.createElement('div');
                        sigDiv.style.cssText = 'text-align:center;';
                        content.appendChild(sigDiv);

                        // Flash test IDs
                        const testIds = ['ECHO-7', 'ECHO-8', 'ECHO-9', 'ECHO-10', 'ECHO-11', 'ECHO-12'];
                        const idContainer = document.createElement('div');
                        idContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:20px 0;';
                        sigDiv.appendChild(idContainer);

                        testIds.forEach((id, i) => {
                            MC.schedule(() => {
                                const badge = document.createElement('span');
                                badge.style.cssText = 'background:rgba(255,0,0,0.15);border:1px solid rgba(255,0,0,0.3);padding:8px 16px;border-radius:4px;color:#ff4444;font-weight:bold;font-size:14px;animation:mc-fadeIn 0.3s ease;display:inline-block;';
                                badge.textContent = id;
                                idContainer.appendChild(badge);
                                MC.playBeep(400 + i * 50);
                            }, i * 400);
                        });

                        // Big "V." reveal
                        MC.schedule(() => {
                            const vReveal = document.createElement('div');
                            vReveal.style.cssText = 'margin:30px 0;font-size:64px;font-weight:bold;color:#ff4444;text-shadow:0 0 40px rgba(255,0,0,0.5);animation:mc-stampIn 0.5s ease;';
                            vReveal.textContent = 'Signed: "V."';
                            sigDiv.appendChild(vReveal);
                            MC.playImpact();
                            MC.screenShake();
                            MC.redPulse(3000);
                        }, testIds.length * 400 + 800);

                        // Ryan's conclusion
                        MC.schedule(() => {
                            const conclusionDiv = document.createElement('div');
                            conclusionDiv.style.cssText = 'margin-top:20px;';
                            sigDiv.appendChild(conclusionDiv);

                            MC.revealDialogue(conclusionDiv, [
                                { speaker: 'Ryan', text: 'Every single deadly test signed by "V."' },
                                { speaker: 'Ryan', text: 'Volkov designed it. Volkov tested it. Volkov KILLED for it.' },
                                { speaker: 'Ryan', text: 'This isn\'t a German weapon. It\'s a Russian weapon built on German soil.' },
                                { speaker: 'Ryan', text: 'I need someone with OSINT skills. Someone who digs up ghosts.' },
                                { speaker: 'Ryan', text: 'Time to call Chris Kubecka.' }
                            ], {
                                pauseBetween: 2200,
                                onDone: () => {
                                    game.addQuest({
                                        id: 'contact_kubecka',
                                        name: 'Contact Chris Kubecka',
                                        description: 'Reach out to Chris "The Hacktress" Kubecka for OSINT investigation on Dimitri Volkov.',
                                        hint: 'Use your phone to send a secure Signal message'
                                    });
                                    MC.schedule(onDone, 1500);
                                }
                            });
                        }, testIds.length * 400 + 3500);
                    }, 9000);
                }
            });
        }, 8000);
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 3: KUBECKA OSINT (first contact)
       ══════════════════════════════════════════════════════════ */
    function phaseKubecka(game, onDone) {
        game.setFlag('contacted_kubecka', true);
        game.setStoryPart(12);

        MC.initAudio();
        const ov = MC.createOverlay({ phaseLabel: 'OSINT — CHRIS KUBECKA' });
        MC.startDrone(38, 39.5, 110);

        const content = MC.getContent();
        content.innerHTML = '';

        // Dossier intro
        const dossier = document.createElement('div');
        dossier.className = 'mc-dossier';
        dossier.innerHTML = `
            <div class="mc-dossier-avatar">🕵️</div>
            <div class="mc-dossier-name">Chris Kubecka</div>
            <div class="mc-dossier-title">OSINT Specialist — "The Hacktress"</div>
            <div class="mc-dossier-specialty">Open-source intelligence, cyber warfare, digital forensics</div>
        `;
        content.appendChild(dossier);
        MC.playPaperShuffle();

        MC.schedule(() => {
            content.innerHTML = '';

            // Chat header
            const header = document.createElement('div');
            header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:15px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1);animation:mc-fadeIn 0.4s ease;';
            header.innerHTML = `
                <div style="font-size:24px;">🔒</div>
                <div>
                    <div style="color:#fff;font-weight:bold;font-size:14px;">Chris Kubecka</div>
                    <div style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:2px;">SIGNAL</div>
                </div>
            `;
            content.appendChild(header);

            const chatArea = document.createElement('div');
            chatArea.className = 'mc-chat-container mc-scroll-area';
            chatArea.style.maxHeight = '50vh';
            content.appendChild(chatArea);

            MC.revealChat(chatArea, KUBECKA_MESSAGES_1, 'Ryan', {
                typingDelay: 1200,
                msgDelay: 1500,
                onDone: () => {
                    // SPEKTR reveal
                    MC.schedule(() => {
                        const spektr = document.createElement('div');
                        spektr.style.cssText = 'text-align:center;margin:20px 0;padding:15px;border:1px solid rgba(255,0,0,0.3);border-radius:4px;background:rgba(80,0,0,0.1);animation:mc-stampIn 0.5s ease;';
                        spektr.innerHTML = `
                            <div style="font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:4px;">PROGRAM IDENTIFIED</div>
                            <div style="font-size:28px;font-weight:bold;color:#ff4444;margin:8px 0;text-shadow:0 0 20px rgba(255,0,0,0.3);">СПЕКТР (SPEKTR)</div>
                            <div style="font-size:12px;color:rgba(255,255,255,0.5);">Soviet Classified RF Research — 1980s</div>
                        `;
                        content.appendChild(spektr);
                        MC.playImpact();
                        MC.playAlarmSting();
                    }, 1000);

                    MC.schedule(() => {
                        game.completeQuest('contact_kubecka');
                        game.showNotification('SPEKTR program connection confirmed');
                        MC.stopDrone(1.5);
                        MC.schedule(() => {
                            MC.destroyOverlay(0.8);
                            MC.schedule(() => MC.destroyAudio(), 1000);
                            game.showNotification('Click phone again to continue investigation');
                        }, 500);
                        if (onDone) onDone();
                    }, 4000);
                }
            });
        }, 2800);

        MC.onSkip(() => {
            MC.clearAllTimers();
            MC.stopDrone(0.5);
            MC.destroyOverlay(0.4);
            MC.schedule(() => MC.destroyAudio(), 600);
            game.completeQuest('contact_kubecka');
            game.showNotification('SPEKTR program connection confirmed');
            game.showNotification('Click phone again to continue investigation');
        });
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 4 + 5 + 6: DEAD ENDS → ZERFALL → CHRIS FOLLOW-UP
       ══════════════════════════════════════════════════════════ */
    function phaseZerfall(game, onDone) {
        game.setFlag('discovered_zerfall', true);
        game.setStoryPart(13);

        MC.initAudio();
        const ov = MC.createOverlay({ phaseLabel: 'DEAD ENDS' });
        MC.startDrone(25, 26.5, 80);

        const content = MC.getContent();
        content.innerHTML = '';

        // Dead ends montage — quick-cut style
        const montage = document.createElement('div');
        montage.style.cssText = 'text-align:center;';
        content.appendChild(montage);

        const montageLines = [
            { text: '☕ Coffee #12. Lost count.', style: 'color:rgba(255,255,255,0.5);font-size:14px;' },
            { text: 'WHY would Germany build this? For WHOM?', style: 'color:#ffcc00;font-size:16px;font-weight:bold;' },
            { text: 'HOW did Volkov get in?', style: 'color:#ff4444;font-size:16px;font-weight:bold;' },
            { text: '...', style: 'color:rgba(255,255,255,0.3);font-size:24px;' },
            { text: 'Wait. Wrong question.', style: 'color:#00ccff;font-size:15px;' },
            { text: 'What if Germany DOESN\'T know?', style: 'color:#00ff41;font-size:18px;font-weight:bold;text-shadow:0 0 15px rgba(0,255,65,0.3);' },
            { text: 'Foreign operation. Russian assets. German resources.', style: 'color:#fff;font-size:15px;' }
        ];

        montageLines.forEach((line, i) => {
            MC.schedule(() => {
                const div = document.createElement('div');
                div.style.cssText = `padding:12px 0;opacity:0;animation:mc-fadeIn 0.5s ease forwards;${line.style}`;
                div.textContent = line.text;
                montage.appendChild(div);
                MC.playBeep(300 + i * 80);
            }, i * 1800);
        });

        // Phase 5: ZERFALL discovery
        MC.schedule(() => {
            MC.setPhaseLabel('DISCOVERY — REICHSBÜRGER CONNECTION');
            game.setStoryPart(14);
            content.innerHTML = '';

            const researchDiv = document.createElement('div');
            researchDiv.style.cssText = 'text-align:center;';
            content.appendChild(researchDiv);

            // News clippings fly in
            const clippings = [
                { date: 'Dec 2022', text: 'REICHSBÜRGER COUP PLOT', detail: '25 conspirators arrested. Plan: Storm Bundestag.' },
                { date: 'Dec 2022', text: 'RUSSIAN CONNECTION', detail: 'Conspirators in contact with Moscow.' },
                { date: '2024-2026', text: 'PROJECT ECHO TESTING', detail: '8 dead. RF weapon at Steckerdoser Heide.' },
                { date: '???', text: 'OPERATION ZERFALL', detail: 'Echo was meant to SUPPORT the coup.' }
            ];

            const clippingContainer = document.createElement('div');
            clippingContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:15px;justify-content:center;margin:20px 0;';
            researchDiv.appendChild(clippingContainer);

            clippings.forEach((clip, i) => {
                MC.schedule(() => {
                    const card = document.createElement('div');
                    card.style.cssText = `
                        background:rgba(30,30,35,0.9);border:1px solid rgba(255,255,255,0.15);
                        padding:15px 20px;border-radius:4px;width:180px;text-align:center;
                        animation:${i % 2 === 0 ? 'mc-slideLeft' : 'mc-slideRight'} 0.5s ease;
                    `;
                    if (i === clippings.length - 1) {
                        card.style.borderColor = 'rgba(255,0,0,0.5)';
                        card.style.background = 'rgba(80,0,0,0.15)';
                    }
                    card.innerHTML = `
                        <div style="font-size:10px;color:rgba(255,255,255,0.3);">${clip.date}</div>
                        <div style="font-size:14px;font-weight:bold;color:${i === clippings.length - 1 ? '#ff4444' : '#ffcc00'};margin:6px 0;">${clip.text}</div>
                        <div style="font-size:11px;color:rgba(255,255,255,0.5);">${clip.detail}</div>
                    `;
                    clippingContainer.appendChild(card);
                    MC.playPaperShuffle();

                    if (i === clippings.length - 1) {
                        MC.playImpact();
                        MC.screenShake();
                    }
                }, i * 1500);
            });

            // ZERFALL title slam
            MC.schedule(() => {
                const zerfall = document.createElement('div');
                zerfall.style.cssText = 'margin:30px 0;text-align:center;animation:mc-stampIn 0.5s ease;';
                zerfall.innerHTML = `
                    <div style="font-size:10px;letter-spacing:6px;color:rgba(255,255,255,0.3);">FSB OPERATION</div>
                    <div style="font-size:48px;font-weight:bold;color:#ff4444;text-shadow:0 0 40px rgba(255,0,0,0.4);letter-spacing:8px;">ZERFALL</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:8px;">"Decay" — "Collapse"</div>
                `;
                researchDiv.appendChild(zerfall);
                MC.playImpact();
                MC.flash();
                MC.redPulse(4000);
            }, clippings.length * 1500 + 1000);

            // Connection explanation
            MC.schedule(() => {
                const explanation = document.createElement('div');
                explanation.style.cssText = 'margin-top:15px;text-align:left;max-width:600px;margin-left:auto;margin-right:auto;';
                researchDiv.appendChild(explanation);

                MC.revealDialogue(explanation, [
                    { speaker: 'Ryan', text: 'Reichsbürger = political arm. Echo = technical arm.' },
                    { speaker: 'Ryan', text: 'Disable communications. Crash emergency vehicles. Create chaos.' },
                    { speaker: 'Ryan', text: 'The coup failed in 2022. But the weapon didn\'t stop.' },
                    { speaker: 'Ryan', text: 'I need to message Chris again.' }
                ], { pauseBetween: 2200 });
            }, clippings.length * 1500 + 4000);

            // Phase 6: Chris follow-up chat
            MC.schedule(() => {
                MC.setPhaseLabel('CHRIS KUBECKA — ZERFALL CONFIRMATION');
                content.innerHTML = '';

                const chatArea = document.createElement('div');
                chatArea.className = 'mc-chat-container mc-scroll-area';
                chatArea.style.maxHeight = '55vh';
                content.appendChild(chatArea);

                MC.revealChat(chatArea, KUBECKA_MESSAGES_2, 'Ryan', {
                    typingDelay: 1200,
                    msgDelay: 1500,
                    onDone: () => {
                        MC.schedule(() => {
                            game.addQuest({
                                id: 'identify_eva',
                                name: 'Identify "E"',
                                description: 'The whistleblower "E" is the key to proving Russian control. Find out who they are.',
                                hint: 'Analyze the photo E sent. Look for clues in the image metadata and reflections.'
                            });
                            game.showNotification('Operation ZERFALL discovered');

                            MC.stopDrone(2);
                            MC.schedule(() => {
                                MC.destroyOverlay(1);
                                MC.schedule(() => MC.destroyAudio(), 1200);
                                game.showNotification('Click phone again to analyze the photo');
                                if (onDone) onDone();
                            }, 1500);
                        }, 1000);
                    }
                });
            }, clippings.length * 1500 + 14000);
        }, montageLines.length * 1800 + 1000);

        MC.onSkip(() => {
            MC.clearAllTimers();
            MC.stopDrone(0.5);
            MC.destroyOverlay(0.4);
            MC.schedule(() => MC.destroyAudio(), 600);
            game.addQuest({
                id: 'identify_eva',
                name: 'Identify "E"',
                description: 'The whistleblower "E" is the key to proving Russian control. Find out who they are.',
                hint: 'Analyze the photo E sent. Look for clues in the image metadata and reflections.'
            });
            game.showNotification('Operation ZERFALL discovered — click phone to analyze the photo');
        });
    }

    /* ══════════════════════════════════════════════════════════
       COMBINED ENTRY: Volkov investigation (Phase 1+2 → prompt for phone)
       ══════════════════════════════════════════════════════════ */
    function playVolkovDive(game) {
        function skipAll() {
            MC.clearAllTimers();
            MC.stopDrone(0.5);
            MC.destroyOverlay(0.4);
            MC.schedule(() => MC.destroyAudio(), 600);
            game.setFlag('volkov_investigated', true);
            game.addQuest({
                id: 'contact_kubecka',
                name: 'Contact Chris Kubecka',
                description: 'Reach out to Chris Kubecka for OSINT investigation on Dimitri Volkov.',
                hint: 'Use your phone to send a secure Signal message'
            });
            game.showNotification('Use your secure phone to contact Kubecka');
        }

        phaseVolkovDive(game, () => {
            MC.stopDrone(1.5);
            MC.schedule(() => {
                MC.destroyOverlay(0.8);
                MC.schedule(() => MC.destroyAudio(), 1000);
                game.showNotification('Use your secure phone on the desk');
            }, 500);
        });

        MC.onSkip(skipAll);
    }

    /**
     * playKubecka(game) — Phone click when volkov_investigated && !contacted_kubecka
     */
    function playKubecka(game) {
        phaseKubecka(game);
    }

    /**
     * playZerfall(game) — Phone click when contacted_kubecka && !discovered_zerfall
     */
    function playZerfall(game) {
        phaseZerfall(game);
    }

    return {
        playVolkovDive,
        playKubecka,
        playZerfall
    };
})();
