/**
 * Mancave – Ally Recruitment Cinematic Sequence
 * ═══════════════════════════════════════════════════════════
 * Hollywood-style ally recruitment with dossier reveals:
 *   - Intro: "REACHING OUT" title with ally overview
 *   - Ally 1: David Prinsloo (Signal chat, typewriter reveal)
 *   - Ally 2: Cees Bassa (Meshtastic chat, typewriter reveal)
 *   - Ally 3: Jaap Haartsen (BBS chat, typewriter reveal)
 *   - Finale: "TEAM ASSEMBLED" with triple dossier layout
 *
 * Each ally gets: dossier card → typing indicator messages →
 *   "ALLY RECRUITED" stamp → dissolve transition.
 *
 * Flags set: contacted_allies, henk_contacted, cees_contacted,
 *   jaap_contacted, all_allies_contacted, astron_unlocked
 * Quests: completes find_allies
 * ═══════════════════════════════════════════════════════════
 */

window.MancaveAllyRecruitment = (function () {
    'use strict';
    const MC = window.MancaveCinematic;

    /* ── Ally data ────────────────────────────────────────── */
    const ALLIES = [
        {
            id: 'david',
            name: 'Dr. David Prinsloo',
            title: 'TU Eindhoven — Antenna Engineering',
            specialty: 'RF antenna design, lunar telescope systems, EM field modeling',
            avatar: '📡',
            chatType: 'SIGNAL',
            chatIcon: '🔒',
            flag: 'henk_contacted',
            messages: [
                { from: 'Ryan', text: 'David — long time. Need your expertise on something urgent. RF weaponization, military-grade. Have schematics that need expert analysis. Can we talk? Secure channel only.', timestamp: '04:32' },
                { from: 'Dr. David Prinsloo', text: 'Ryan? Didn\'t expect to hear from you. RF weapons? That\'s heavy. What kind of schematics are we talking about?', timestamp: '05:18' },
                { from: 'Ryan', text: 'Directional EM pulse system. Multiple antenna arrays, phase control, frequency targeting. Range 5km+. German facility. Eight confirmed casualties in testing.', timestamp: '05:20' },
                { from: 'Dr. David Prinsloo', text: 'Jesus. Eight casualties? Are you sure this is real? Not some elaborate hoax?', timestamp: '05:22' },
                { from: 'Ryan', text: 'Internal emails, test reports, casualty logs. All timestamped, all signed. This is real, David. And they\'re moving to urban testing. More people will die.', timestamp: '05:24' },
                { from: 'Dr. David Prinsloo', text: 'Send me what you have. Encrypted. If this is what you say it is, I\'ll help. But I need to verify first. This could destroy careers... or save lives.', timestamp: '05:27' },
                { from: 'Ryan', text: 'Sending now. Check your secure drop. And David? Watch your back.', timestamp: '05:28' },
                { from: 'Dr. David Prinsloo', text: 'Received. Reviewing now. Ryan... if this is legitimate, this is bigger than both of us. We\'ll need more help.', timestamp: '05:45' }
            ],
            notification: 'David Prinsloo will review the evidence'
        },
        {
            id: 'cees',
            name: 'Cees Bassa',
            title: 'ASTRON / LOFAR — Signal Processing',
            specialty: 'Radio signal analysis, satellite tracking, interference detection',
            avatar: '🔭',
            chatType: 'MESHTASTIC',
            chatIcon: '📶',
            flag: 'cees_contacted',
            messages: [
                { from: 'Ryan', text: '[ENCRYPTED] M — need your brain. Big RF problem. Military scale. Too sensitive for internet. Mesh only.', timestamp: '06:12' },
                { from: 'Cees Bassa', text: '[ACK] Ryan? Unexpected ping. Define "military scale".', timestamp: '06:18' },
                { from: 'Ryan', text: 'EM weapon. Phase-array targeting. Kills civilians for calibration. German facility, Russian tech.', timestamp: '06:19' },
                { from: 'Cees Bassa', text: 'That\'s... Jesus. How dangerous are we talking?', timestamp: '06:21' },
                { from: 'Ryan', text: 'Crashes cars. Downs planes. Fries medical equipment. 5km range confirmed. Urban testing next phase.', timestamp: '06:22' },
                { from: 'Cees Bassa', text: 'And you want me to analyze signal processing? Ryan, I have kids. This sounds like something that gets people disappeared.', timestamp: '06:24' },
                { from: 'Ryan', text: 'More people will die if we do nothing. Kids included. I need to know HOW it works to know how to STOP it. Your kids. Mine someday. Everyone\'s.', timestamp: '06:26' },
                { from: 'Cees Bassa', text: 'DAMN it, Ryan. You\'re right. Send via dead drop. I\'ll analyze off-grid. But you keep me anonymous. Always.', timestamp: '06:30' },
                { from: 'Ryan', text: 'Promise. You\'re ghost protocol all the way. Sending coordinates now.', timestamp: '06:31' },
                { from: 'Cees Bassa', text: 'File received. Analyzing. This better be worth the risk. Stay safe, Ryan.', timestamp: '06:48' }
            ],
            notification: 'Cees Bassa will analyze signal patterns'
        },
        {
            id: 'jaap',
            name: 'Jaap Haartsen',
            title: 'Bluetooth Inventor — Wireless Protocols',
            specialty: 'Wireless protocol vulnerabilities, RF countermeasures, Bluetooth security',
            avatar: '🔌',
            chatType: 'BBS (SHADOWBOARD)',
            chatIcon: '💀',
            flag: 'jaap_contacted',
            messages: [
                { from: 'SYSOP', text: '=== SECURE BOARD ===\nDead drop for: JAAP\nEncryption: ROT47+AES256', timestamp: '07:05' },
                { from: 'Ryan', text: 'J — remember when you said corporations were the enemy? Found something worse. RF weapon. Russian architect, German money, civilian casualties. Want in?', timestamp: '07:06' },
                { from: 'Jaap Haartsen', text: 'Ryan?? Hell, haven\'t heard from you in years. RF weapon? Define parameters.', timestamp: '07:23' },
                { from: 'Ryan', text: 'Multi-band EM pulse, directional. Disables electronics: cars, planes, medical gear. 5km range. Built by Soviet defector named Volkov. 8 dead so far.', timestamp: '07:25' },
                { from: 'Jaap Haartsen', text: 'VOLKOV. Holy shit. I know that name. Bluetooth conferences, 2000s. Always asking weird questions about protocol vulnerabilities. Creepy Russian dude.', timestamp: '07:27' },
                { from: 'Ryan', text: 'You MET him?? Tell me everything.', timestamp: '07:28' },
                { from: 'Jaap Haartsen', text: 'DEF CON 2003, maybe 2004. Claimed to be "independent consultant." Kept pressing me about medical device protocols — pacemakers, insulin pumps. Said it was for "security research." I got bad vibes. Avoided him after that.', timestamp: '07:31' },
                { from: 'Ryan', text: 'He was researching targets. Even back then. Jaap, I need your help. Need to understand wireless protocol vulnerabilities. How to defend against this thing.', timestamp: '07:33' },
                { from: 'Jaap Haartsen', text: 'You got it. Send me everything. If Volkov is behind this, he\'s been planning it for DECADES. This is the enemy I\'ve been waiting for. Real. Tangible. Evil.', timestamp: '07:36' },
                { from: 'Ryan', text: 'Uploading now. Encrypted. Welcome to the war, old friend.', timestamp: '07:37' },
                { from: 'Jaap Haartsen', text: 'Downloaded. Analyzing. Holy hell, Ryan. This is sophisticated. Military-grade signal processing. Decades of research. We\'ve got our work cut out for us.', timestamp: '08:15' }
            ],
            notification: 'Jaap Haartsen will analyze wireless vulnerabilities'
        }
    ];

    /* ══════════════════════════════════════════════════════════
       DOSSIER CARD REVEAL
       ══════════════════════════════════════════════════════════ */
    function showDossier(container, ally) {
        return new Promise(resolve => {
            const dossier = document.createElement('div');
            dossier.className = 'mc-dossier';
            dossier.innerHTML = `
                <div class="mc-dossier-avatar">${ally.avatar}</div>
                <div class="mc-dossier-name">${ally.name}</div>
                <div class="mc-dossier-title">${ally.title}</div>
                <div class="mc-dossier-specialty">${ally.specialty}</div>
            `;
            container.innerHTML = '';
            container.appendChild(dossier);
            MC.playPaperShuffle();
            MC.schedule(resolve, 2500);
        });
    }

    /* ══════════════════════════════════════════════════════════
       CHAT SEQUENCE FOR ONE ALLY
       ══════════════════════════════════════════════════════════ */
    function showAllyChat(container, ally) {
        return new Promise(resolve => {
            container.innerHTML = '';

            // Chat header
            const header = document.createElement('div');
            header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:15px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1);animation:mc-fadeIn 0.4s ease;';
            header.innerHTML = `
                <div style="font-size:24px;">${ally.chatIcon}</div>
                <div>
                    <div style="color:#fff;font-weight:bold;font-size:14px;">${ally.name}</div>
                    <div style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:2px;">${ally.chatType}</div>
                </div>
            `;
            container.appendChild(header);

            // Chat messages area
            const chatArea = document.createElement('div');
            chatArea.className = 'mc-chat-container mc-scroll-area';
            chatArea.style.maxHeight = '50vh';
            container.appendChild(chatArea);

            MC.revealChat(chatArea, ally.messages, 'Ryan', {
                typingDelay: 1000,
                msgDelay: 1200,
                onDone: () => MC.schedule(resolve, 800)
            });
        });
    }

    /* ══════════════════════════════════════════════════════════
       "ALLY RECRUITED" STAMP
       ══════════════════════════════════════════════════════════ */
    function showRecruitedStamp(container) {
        return new Promise(resolve => {
            const stamp = document.createElement('div');
            stamp.className = 'mc-ally-stamp';
            stamp.textContent = '✓ ALLY RECRUITED';
            container.appendChild(stamp);
            MC.playImpact();
            MC.flash();
            MC.schedule(resolve, 2000);
        });
    }

    /* ══════════════════════════════════════════════════════════
       TEAM ASSEMBLED FINALE
       ══════════════════════════════════════════════════════════ */
    function showTeamAssembled(container) {
        return new Promise(resolve => {
            container.innerHTML = '';

            // Title
            const title = document.createElement('div');
            title.style.cssText = 'text-align:center;margin-bottom:30px;animation:mc-fadeIn 0.8s ease;';
            title.innerHTML = `
                <div style="font-size:10px;letter-spacing:6px;color:rgba(255,255,255,0.3);margin-bottom:8px;">OPERATION STATUS</div>
                <div style="font-size:24px;font-weight:bold;color:#00ff41;text-shadow:0 0 20px rgba(0,255,65,0.3);">TEAM ASSEMBLED</div>
            `;
            container.appendChild(title);

            // Three mini dossiers
            const team = document.createElement('div');
            team.className = 'mc-team-assembled';
            container.appendChild(team);

            ALLIES.forEach((ally, i) => {
                MC.schedule(() => {
                    const mini = document.createElement('div');
                    mini.className = 'mc-dossier';
                    mini.style.animationDelay = `${i * 0.2}s`;
                    mini.innerHTML = `
                        <div class="mc-dossier-avatar" style="width:50px;height:50px;font-size:22px;">${ally.avatar}</div>
                        <div class="mc-dossier-name" style="font-size:14px;">${ally.name}</div>
                        <div class="mc-dossier-title" style="font-size:10px;">${ally.title.split('—')[0].trim()}</div>
                        <div style="color:#00ff41;font-size:10px;margin-top:8px;">✓ CONFIRMED</div>
                    `;
                    team.appendChild(mini);
                    MC.playBeep(800 + i * 200);
                }, i * 600);
            });

            MC.schedule(() => {
                MC.playImpact();
                resolve();
            }, ALLIES.length * 600 + 2000);
        });
    }

    /* ══════════════════════════════════════════════════════════
       MAIN ENTRY POINT
       ══════════════════════════════════════════════════════════ */
    function play(game) {
        game.setFlag('contacted_allies', true);
        game.setStoryPart(10);

        MC.initAudio();
        const ov = MC.createOverlay({ phaseLabel: 'CONTACTING ALLIES' });
        MC.startDrone(35, 36.5, 100);

        const content = MC.getContent();
        content.innerHTML = '';

        // Opening monologue
        const intro = document.createElement('div');
        intro.style.cssText = 'text-align:center;margin-bottom:20px;';
        content.appendChild(intro);

        MC.revealDialogue(intro, [
            { speaker: 'Ryan', text: 'Living in Drenthe has perks. Radio astronomy capital of the world.' },
            { speaker: 'Ryan', text: 'Three experts. Three different channels. Let\'s make contact.' }
        ], { pauseBetween: 2000 });

        // Sequentially show each ally
        let allyIdx = 0;

        function processNextAlly() {
            if (allyIdx >= ALLIES.length) {
                // All done — set flags and show team assembled
                game.setFlag('henk_contacted', true);
                game.setFlag('cees_contacted', true);
                game.setFlag('astron_unlocked', true);
                game.setFlag('jaap_contacted', true);
                game.setFlag('all_allies_contacted', true);
                game.completeQuest('find_allies');

                MC.setPhaseLabel('TEAM STATUS');
                showTeamAssembled(content).then(() => {
                    MC.stopDrone(2);
                    MC.schedule(() => {
                        MC.destroyOverlay(1);
                        MC.schedule(() => MC.destroyAudio(), 1200);
                        game.showNotification('All three allies recruited!');
                        MC.schedule(() => {
                            game.showNotification('Cees wants you at the WSRT — head to the garden when ready');
                        }, 2500);
                        MC.schedule(() => {
                            game.showNotification('Click laptop again to investigate Volkov');
                        }, 5000);
                    }, 1500);
                });
                return;
            }

            const ally = ALLIES[allyIdx];
            MC.setPhaseLabel(`ALLY ${allyIdx + 1} of 3 — ${ally.chatType}`);

            // Dossier first
            showDossier(content, ally).then(() => {
                // Then chat
                return showAllyChat(content, ally);
            }).then(() => {
                // Set individual flag
                game.setFlag(ally.flag, true);
                game.showNotification(ally.notification);

                // Recruited stamp
                return showRecruitedStamp(content);
            }).then(() => {
                allyIdx++;
                processNextAlly();
            });
        }

        MC.schedule(() => processNextAlly(), 5500);

        // Skip handler sets all flags at once
        MC.onSkip(() => {
            MC.clearAllTimers();
            MC.stopDrone(0.5);
            MC.destroyOverlay(0.4);
            MC.schedule(() => MC.destroyAudio(), 600);

            game.setFlag('henk_contacted', true);
            game.setFlag('cees_contacted', true);
            game.setFlag('astron_unlocked', true);
            game.setFlag('jaap_contacted', true);
            game.setFlag('all_allies_contacted', true);
            game.completeQuest('find_allies');
            game.showNotification('All three allies recruited!');
            MC.schedule(() => {
                game.showNotification('Click laptop again to investigate Volkov');
            }, 2000);
        });
    }

    return { play };
})();
