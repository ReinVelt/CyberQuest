/**
 * Mancave – The Dilemma Cinematic Sequence
 * ═══════════════════════════════════════════════════════════
 * Hollywood-style choice presentation:
 *   Four options slide in as cards, each with Ryan's inner monologue.
 *   Options 1-3 get rejected (gray out with ✗ stamp).
 *   Option 4 glows green — "the only real choice."
 *
 * Flags set: started_ally_search
 * ═══════════════════════════════════════════════════════════
 */

window.MancaveDilemma = (function () {
    'use strict';
    const MC = window.MancaveCinematic;

    const OPTIONS = [
        {
            num: 'OPTION 1',
            title: 'Contact Authorities',
            desc: 'Dutch police? AIVD? "Some stranger gave me German military secrets." Yeah, that\'ll go well.',
            monologue: 'I actually thought about it. Really thought about it. Call the AIVD, hand it all over, let the professionals handle it. But E said it herself — the people protecting this project have infiltrated military AND intelligence. What if I call the one person who reports to the wrong person? Marlies Bakker ends up as a footnote in a classified file that never sees daylight.',
            rejected: true,
            direction: 'mc-slideRight'
        },
        {
            num: 'OPTION 2',
            title: 'Go to the Press',
            desc: 'WikiLeaks, Der Spiegel. Blow this wide open.',
            monologue: '72 hours isn\'t enough time. And I\'d become target number one. Blown whistle, blown life. Max, the dogs — they\'d all be in the spotlight.',
            rejected: true,
            direction: 'mc-slideLeft'
        },
        {
            num: 'OPTION 3',
            title: 'Walk Away',
            desc: 'Delete everything. Pretend this never happened.',
            monologue: 'Marlies Bakker. 67. Four grandchildren. She went in to get her hip replaced and they used her surgery as a calibration test. ECHO-10. The report filed it under "equipment malfunction, patient pre-existing condition." She\'s a line in a log. An experiment result. Walk away from THAT? ...Who am I kidding? That was never an option.',
            rejected: true,
            direction: 'mc-slideRight'
        },
        {
            num: 'OPTION 4',
            title: 'Verify. Find Allies.',
            desc: 'People who understand RF tech. Build a case so solid they can\'t ignore it. Then decide.',
            monologue: 'I know exactly who to call. Time to reach out.',
            rejected: false,
            direction: 'mc-slideUp'
        }
    ];

    function play(game) {
        game.setFlag('started_ally_search', true);
        game.setStoryPart(9);

        MC.initAudio();
        const ov = MC.createOverlay({ phaseLabel: 'THE DILEMMA' });
        MC.startDrone(40, 41.5, 120);

        const content = MC.getContent();
        content.innerHTML = '';

        // Opening lines
        const openingDiv = document.createElement('div');
        openingDiv.style.cssText = 'text-align:center;margin-bottom:30px;';
        content.appendChild(openingDiv);

        MC.revealDialogue(openingDiv, [
            { speaker: 'Ryan', text: 'Eight people dead. More planned. What do I do with this?' }
        ], { pauseBetween: 2500, useTTS: true, ttsGap: 1000 });

        // After opening, reveal cards one by one
        MC.schedule(() => {
            const cardsContainer = document.createElement('div');
            cardsContainer.style.cssText = 'width:100%;max-width:700px;';
            content.appendChild(cardsContainer);

            let optIdx = 0;
            function showOption() {
                if (optIdx >= OPTIONS.length) return;

                const opt = OPTIONS[optIdx];
                const card = document.createElement('div');
                card.className = 'mc-option-card';
                card.style.animation = `${opt.direction} 0.6s ease`;
                card.innerHTML = `
                    <div class="mc-option-num">${opt.num}</div>
                    <div class="mc-option-title">${opt.title}</div>
                    <div class="mc-option-desc">${opt.desc}</div>
                    <div class="mc-option-stamp">✗ REJECTED</div>
                `;
                cardsContainer.appendChild(card);
                MC.playPaperShuffle();
                content.scrollTop = content.scrollHeight;

                // Show monologue after card appears — give time to read first
                MC.schedule(() => {
                    const mono = document.createElement('div');
                    mono.className = 'mc-dialogue-line';
                    mono.style.cssText = 'padding-left:20px;margin-bottom:8px;';
                    mono.innerHTML = `<span class="mc-speaker">Ryan:</span> ${opt.monologue}`;
                    cardsContainer.appendChild(mono);
                    content.scrollTop = content.scrollHeight;

                    // Speak the monologue and wait for TTS before greying out
                    const vm = window.voiceManager;
                    const speakDone = (vm && vm.enabled)
                        ? vm.speak(opt.monologue, 'Ryan')
                        : Promise.resolve();

                    speakDone.then(() => {
                        // If rejected, show a button the player must click to confirm rejection
                        if (opt.rejected) {
                            const rejectBtn = document.createElement('button');
                            rejectBtn.className = 'mc-reject-btn';
                            rejectBtn.textContent = '— Reject this option →';
                            rejectBtn.style.cssText = [
                                'display:block', 'margin:14px 0 0 20px',
                                'background:none',
                                'border:1px solid rgba(255,80,80,0.35)',
                                'color:rgba(255,150,150,0.75)',
                                'font-family:\'Courier New\',monospace',
                                'font-size:0.7em', 'letter-spacing:3px',
                                'padding:6px 16px', 'cursor:pointer',
                                'border-radius:2px',
                                'transition:border-color 0.2s,color 0.2s',
                            ].join(';');
                            rejectBtn.addEventListener('mouseenter', () => {
                                rejectBtn.style.borderColor = 'rgba(255,80,80,0.7)';
                                rejectBtn.style.color = 'rgba(255,150,150,1)';
                            });
                            rejectBtn.addEventListener('mouseleave', () => {
                                rejectBtn.style.borderColor = 'rgba(255,80,80,0.35)';
                                rejectBtn.style.color = 'rgba(255,150,150,0.75)';
                            });
                            rejectBtn.addEventListener('click', () => {
                                rejectBtn.remove();
                                card.classList.add('mc-option-rejected');
                                MC.playBeep(300, 0.08);
                                optIdx++;
                                MC.schedule(showOption, 1800);
                            });
                            cardsContainer.appendChild(rejectBtn);
                        } else {
                            // Selected! Glow green
                            MC.schedule(() => {
                                card.classList.add('mc-option-selected');
                                card.querySelector('.mc-option-title').style.color = '#00ff41';
                                MC.playImpact();
                                MC.flash();

                                // Final dialogue
                                MC.schedule(() => {
                                    MC.stopDrone(2);
                                    MC.schedule(() => {
                                        MC.destroyOverlay(1);
                                        MC.schedule(() => MC.destroyAudio(), 1200);
                                        game.showNotification('Click the laptop again to contact allies');
                                    }, 3500);
                                }, 2500);
                            }, 2500);
                        }
                    });
                }, 2000);
            }

            showOption();
        }, 6000);

        // Skip handler
        MC.onSkip(() => {
            MC.clearAllTimers();
            MC.stopDrone(0.5);
            MC.destroyOverlay(0.4);
            MC.schedule(() => MC.destroyAudio(), 600);
            game.showNotification('Click the laptop again to contact allies');
        });
    }

    return { play };
})();
