/**
 * Mancave – Eva Contact Cinematic Sequence
 * ═══════════════════════════════════════════════════════════
 * Dark late-night Meshtastic contact sequence:
 *   Setup: "3 AM. Forest edge. Steckerdoser Heide." title
 *   Chat: Messages appear one-by-one, green monospace terminal style
 *   Key reveals flash/highlight (FSB, ZERFALL, 72 hours)
 *   Closing: "Tomorrow night. 11 PM." burns bright, dawn shift
 *
 * Flags set: eva_contacted
 * Quests: completes contact_eva, adds infiltrate_facility
 * ═══════════════════════════════════════════════════════════
 */

window.MancaveEvaContact = (function () {
    'use strict';
    const MC = window.MancaveCinematic;

    const EVA_MESSAGES = [
        { from: 'EVA_W', text: 'Ryan. You found me.', timestamp: '03:07' },
        { from: 'Ryan', text: 'Eva Weber. Klaus Weber\'s daughter. You have IT access to everything at that facility.', timestamp: '03:08' },
        { from: 'EVA_W', text: 'My father worked there for 20 years. Senior engineer. He started noticing discrepancies in 2023. Equipment requisitions that didn\'t match project specs. Budget items that made no sense.', timestamp: '03:09' },
        { from: 'EVA_W', text: 'He raised concerns. Wrote memos. Nobody listened. Then one day, he died. "Heart attack." Perfectly healthy man. 58 years old.', timestamp: '03:10' },
        { from: 'EVA_W', text: 'I got his job. IT Security. I had access to things he never could. Network logs. Email archives. Encrypted drives.', timestamp: '03:11' },
        { from: 'Ryan', text: 'And you found Volkov.', timestamp: '03:11' },
        { from: 'EVA_W', text: 'Dimitri Volkov. The project lead everyone trusts. But his communications don\'t go to Berlin. They go to Moscow. Encrypted channels. Direct to FSB addresses.', timestamp: '03:12' },
        { from: 'EVA_W', text: 'Director Hoffmann protects him. Blocks any investigation. Because Hoffmann is ALSO compromised. Russian asset. Both of them.', timestamp: '03:13' },
        { from: 'EVA_W', text: 'Project Echo isn\'t a German defense project. It\'s Operation ZERFALL. They\'re using German resources to build a weapon for Moscow. The Reichsbürger coup was supposed to create chaos. Echo would disable response capabilities.', timestamp: '03:14' },
        { from: 'EVA_W', text: 'But the coup failed. So they adapted. Phase 3 of testing. Urban environments. Real targets. In 72 hours.', timestamp: '03:15' },
        { from: 'Ryan', text: 'Hamburg. Amsterdam. Berlin?', timestamp: '03:15' },
        { from: 'EVA_W', text: 'I don\'t know which city. But it\'s happening. Ambulances will crash. Hospital equipment will fail. People will die. And Russia gets to watch NATO panic.', timestamp: '03:16' },
        { from: 'Ryan', text: 'Why didn\'t you go to BND? German intelligence?', timestamp: '03:17' },
        { from: 'EVA_W', text: 'Because Hoffmann has connections at the highest levels. He\'s protected. Anyone who investigates gets shut down. My father tried. Look what happened.', timestamp: '03:18' },
        { from: 'EVA_W', text: 'I need someone OUTSIDE the system. Someone with technical skills. Someone who can\'t be silenced by a phone call from Berlin.', timestamp: '03:18' },
        { from: 'EVA_W', text: 'And then I remembered. Compascuum. Tony Knight\'s dog training weekend. Two years ago. Your partner Ies and I both volunteer for the same rescue dog organisation.', timestamp: '03:19' },
        { from: 'Ryan', text: '...The dog training in Compascuum? That was you?', timestamp: '03:19' },
        { from: 'EVA_W', text: 'Ies introduced us. You showed me your mancave. We talked about SDR, about mesh networks, about OSINT. You were passionate. And honest.', timestamp: '03:20' },
        { from: 'EVA_W', text: 'You probably don\'t remember. It was just small talk for you. But I never forgot. A hacker in rural Drenthe with a full radio lab and no ties to any government or corporation.', timestamp: '03:21' },
        { from: 'EVA_W', text: 'I even went to a Hackerspace Drenthe meeting once, a few weeks later. You weren\'t there that evening. But I saw the community, the skills. It confirmed what I already knew.', timestamp: '03:22' },
        { from: 'EVA_W', text: 'When everything went wrong and I needed someone I could trust — someone outside the system — I thought of you. I found your SSTV terminal frequency. And here we are.', timestamp: '03:23' },
        { from: 'Ryan', text: 'I... I don\'t remember. But I believe you.', timestamp: '03:24' },
        { from: 'Ryan', text: 'One thing I never understood. The USB at the klooster. You\'re inside a guarded facility. How did you get it to Ter Apel?', timestamp: '03:24' },
        { from: 'EVA_W', text: 'My father. Before he died, he had a medical appointment in Emmen. He drove across the border, dropped the USB at the klooster, and drove back. A retiree visiting a monastery — no one looks twice.', timestamp: '03:25' },
        { from: 'EVA_W', text: 'He didn\'t know what was on it. I told him it was a backup of personal files. Plausible deniability. He just knew his daughter needed a favour.', timestamp: '03:25' },
        { from: 'Ryan', text: 'Your father crossed an international border to deliver a USB stick he didn\'t understand, for a daughter he trusted completely.', timestamp: '03:26' },
        { from: 'EVA_W', text: 'That\'s what fathers do. Now — what do you need me to do? What do I need YOU to do?', timestamp: '03:26' },
        { from: 'EVA_W', text: 'There\'s a secure server room. Isolated network. Where they keep the real operational plans. Deployment schedules. Target coordinates. Direct evidence of FSB control.', timestamp: '03:27' },
        { from: 'EVA_W', text: 'I can get you inside. Night shift. Minimal security. But you\'ll need to bypass biometric locks and access the air-gapped server.', timestamp: '03:28' },
        { from: 'EVA_W', text: 'Get that data. We expose EVERYTHING. BND can\'t ignore hard evidence. NATO gets involved. This ends.', timestamp: '03:29' },
        { from: 'Ryan', text: 'When?', timestamp: '03:29' },
        { from: 'EVA_W', text: 'Tomorrow night. 11 PM. North entrance. I\'ll leave a badge for you. From there, you\'re on your own until you reach the server room. Then I can guide you remotely.', timestamp: '03:30' },
        { from: 'EVA_W', text: 'This is dangerous, Ryan. If they catch you, I can\'t help. If Volkov finds out... we both disappear.', timestamp: '03:31' },
        { from: 'Ryan', text: 'I\'m in. For your father. For Marlies Bakker. For everyone they\'ve hurt.', timestamp: '03:32' },
        { from: 'EVA_W', text: 'Thank you. Tomorrow night. Be ready. Stay off the grid until then. Meshtastic only. They monitor everything else.', timestamp: '03:33' },
        { from: 'EVA_W', text: 'And Ryan — give Tino and Kessy a treat from me. I still think about those dogs.', timestamp: '03:34' },
        { from: 'Ryan', text: '...You even remember their names.', timestamp: '03:34' },
        { from: 'EVA_W', text: 'Rescue dogs, Ryan. We never forget.', timestamp: '03:35' }
    ];

    /* ══════════════════════════════════════════════════════════
       MAIN ENTRY POINT
       ══════════════════════════════════════════════════════════ */
    function play(game) {
        game.setFlag('eva_contacted', true);
        game.setStoryPart(16);

        MC.initAudio();
        const ov = MC.createOverlay({ phaseLabel: 'SECURE CONTACT — 3:00 AM' });

        // Night-specific drone — lower, more ominous
        MC.startDrone(22, 23.5, 60);

        const content = MC.getContent();
        content.innerHTML = '';

        // Location title card
        const locationCard = document.createElement('div');
        locationCard.style.cssText = 'text-align:center;animation:mc-fadeIn 1.5s ease;';
        locationCard.innerHTML = `
            <div style="font-size:10px;letter-spacing:6px;color:rgba(255,255,255,0.3);margin-bottom:12px;">LOCATION</div>
            <div style="font-size:22px;font-weight:bold;color:#fff;margin-bottom:6px;">Forest Edge — Steckerdoser Heide</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.4);">3:00 AM — Off-grid — Meshtastic only</div>
            <div style="margin:20px 0;font-size:40px;">🌲🌑🌲</div>
        `;
        content.appendChild(locationCard);

        // Opening dialogue
        MC.schedule(() => {
            const openDiv = document.createElement('div');
            openDiv.style.cssText = 'margin-top:10px;text-align:center;';
            content.appendChild(openDiv);

            MC.revealDialogue(openDiv, [
                { speaker: 'Ryan', text: '*Drives to forest edge near Steckerdoser Heide. 3 AM.*' },
                { speaker: 'Ryan', text: 'Off-grid. Away from cameras. Far from cellular towers.' },
                { speaker: 'Ryan', text: '*Powers on Meshtastic device. Scans for nodes.*' },
                { speaker: 'Ryan', text: 'There. Signal. Strong. She\'s nearby.' }
            ], { pauseBetween: 1800 });
        }, 3000);

        // Transition to chat
        MC.schedule(() => {
            MC.setPhaseLabel('MESHTASTIC — EVA_W');
            content.innerHTML = '';

            // Chat header with mesh network styling
            const header = document.createElement('div');
            header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:15px;padding-bottom:12px;border-bottom:1px solid rgba(0,255,65,0.15);animation:mc-fadeIn 0.4s ease;';
            header.innerHTML = `
                <div style="font-size:24px;">📶</div>
                <div>
                    <div style="color:#00ff41;font-weight:bold;font-size:14px;">EVA_W</div>
                    <div style="color:rgba(0,255,65,0.4);font-size:10px;letter-spacing:2px;">MESH NETWORK — ENCRYPTED</div>
                </div>
                <div style="margin-left:auto;font-size:10px;color:rgba(0,255,65,0.3);">
                    Signal: ████░ Strong
                </div>
            `;
            content.appendChild(header);

            // Chat messages area
            const chatArea = document.createElement('div');
            chatArea.className = 'mc-chat-container mc-scroll-area';
            chatArea.style.maxHeight = '55vh';
            // Green terminal style for meshtastic
            chatArea.querySelectorAll && (chatArea.style.fontFamily = "'Courier New', monospace");
            content.appendChild(chatArea);

            MC.revealChat(chatArea, EVA_MESSAGES, 'Ryan', {
                typingDelay: 1000,
                msgDelay: 1300,
                onDone: () => {
                    // Dramatic closing
                    MC.schedule(() => {
                        MC.setPhaseLabel('MISSION BRIEFING');

                        const closing = document.createElement('div');
                        closing.style.cssText = 'text-align:center;margin-top:20px;padding-top:15px;border-top:1px solid rgba(0,255,65,0.15);';
                        content.appendChild(closing);

                        // Key info burns bright
                        const missionInfo = document.createElement('div');
                        missionInfo.style.cssText = 'animation:mc-fadeIn 1s ease;margin:15px 0;';
                        missionInfo.innerHTML = `
                            <div style="font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.3);margin-bottom:12px;">INFILTRATION DETAILS</div>
                            <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;">
                                <div style="background:rgba(0,255,65,0.05);border:1px solid rgba(0,255,65,0.2);padding:12px 20px;border-radius:4px;">
                                    <div style="font-size:10px;color:rgba(255,255,255,0.4);">TIME</div>
                                    <div style="font-size:18px;font-weight:bold;color:#00ff41;">23:00</div>
                                </div>
                                <div style="background:rgba(0,255,65,0.05);border:1px solid rgba(0,255,65,0.2);padding:12px 20px;border-radius:4px;">
                                    <div style="font-size:10px;color:rgba(255,255,255,0.4);">ENTRY</div>
                                    <div style="font-size:18px;font-weight:bold;color:#00ff41;">North Gate</div>
                                </div>
                                <div style="background:rgba(0,255,65,0.05);border:1px solid rgba(0,255,65,0.2);padding:12px 20px;border-radius:4px;">
                                    <div style="font-size:10px;color:rgba(255,255,255,0.4);">TARGET</div>
                                    <div style="font-size:18px;font-weight:bold;color:#00ff41;">Server Room</div>
                                </div>
                            </div>
                        `;
                        closing.appendChild(missionInfo);
                        MC.playImpact();

                        // Departure dialogue
                        MC.schedule(() => {
                            const departDiv = document.createElement('div');
                            departDiv.style.cssText = 'margin-top:15px;';
                            closing.appendChild(departDiv);

                            MC.revealDialogue(departDiv, [
                                { speaker: 'Ryan', text: '*Drives home as the sun rises*' },
                                { speaker: 'Ryan', text: 'Tomorrow night. Everything changes.' },
                                { speaker: 'Ryan', text: 'Time to prepare. And... time to talk to Ies.' },
                                { speaker: '', text: '*That evening, 10:30 PM — Kitchen*' },
                                { speaker: 'Ryan', text: 'Ies. I need to tell you something.' },
                                { speaker: 'Ies', text: 'I know that face. Something\'s wrong.' },
                                { speaker: 'Ryan', text: 'Remember that strange radio signal I picked up? It goes deeper than I thought. Much deeper. People have died.' },
                                { speaker: 'Ryan', text: 'There\'s a weapons project across the border. Russian infiltration. A woman inside the facility needs my help tonight. The same Eva \u2014 from the dog training.' },
                                { speaker: 'Ies', text: '...' },
                                { speaker: 'Ies', text: 'How dangerous is this?' },
                                { speaker: 'Ryan', text: 'Very. But if I don\'t go, more people die. A city full of people.' },
                                { speaker: 'Ies', text: '*Takes his hand*' },
                                { speaker: 'Ies', text: 'I\'ve been married to you for thirty years. I know who you are. You wouldn\'t be telling me this if you\'d already decided not to go.' },
                                { speaker: 'Ryan', text: 'I should be back by midnight. If I\'m not...' },
                                { speaker: 'Ies', text: 'You\'ll be back. Be careful, darling. Come back safe.' },
                                { speaker: '', text: '*10:45 PM — Mancave*' },
                                { speaker: 'Ryan', text: 'Equipment ready. Flipper Zero, tools, Meshtastic.' },
                                { speaker: 'Ryan', text: 'Time to go. Volvo is in the garden.' }
                            ], {
                                pauseBetween: 2000,
                                onDone: () => {
                                    game.completeQuest('contact_eva');
                                    game.addQuest({
                                        id: 'infiltrate_facility',
                                        name: 'Infiltrate Steckerdoser Heide',
                                        description: 'Meet Eva at the north entrance at 11 PM. Bypass security and access the secure server room.',
                                        hint: 'Prepare your equipment. Bring Flipper Zero, tools, anything useful. Head to the garden for your car.'
                                    });

                                    MC.stopDrone(2);
                                    MC.schedule(() => {
                                        MC.destroyOverlay(1);
                                        MC.schedule(() => MC.destroyAudio(), 1200);
                                        game.showNotification('Infiltration planned — go to garden when ready');
                                    }, 1500);
                                }
                            });
                        }, 3000);
                    }, 1500);
                }
            });
        }, 12000);

        MC.onSkip(() => {
            MC.clearAllTimers();
            MC.stopDrone(0.5);
            MC.destroyOverlay(0.4);
            MC.schedule(() => MC.destroyAudio(), 600);
            game.completeQuest('contact_eva');
            game.addQuest({
                id: 'infiltrate_facility',
                name: 'Infiltrate Steckerdoser Heide',
                description: 'Meet Eva at the north entrance at 11 PM. Bypass security and access the secure server room.',
                hint: 'Head to the garden for your car.'
            });
            game.showNotification('Infiltration planned — go to garden when ready');
        });
    }

    return { play };
})();
