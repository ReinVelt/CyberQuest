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
            monologue: '72 hours isn\'t enough time. And I\'d become target number one. Blown whistle, blown life. Ies, the dogs — they\'d all be in the spotlight.',
            rejected: true,
            direction: 'mc-slideLeft'
        },
        {
            num: 'OPTION 3',
            title: 'Walk Away',
            desc: 'Delete everything. Pretend this never happened.',
            monologue: 'A 67-year-old grandmother went into surgery and never came out because some Russian needed to calibrate his toy. Walk away from that? ...Who am I kidding? That was never an option.',
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
        ], { pauseBetween: 1500 });

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

                // Show monologue after card appears
                MC.schedule(() => {
                    const mono = document.createElement('div');
                    mono.className = 'mc-dialogue-line';
                    mono.style.cssText = 'padding-left:20px;margin-bottom:8px;';
                    mono.innerHTML = `<span class="mc-speaker">Ryan:</span> ${opt.monologue}`;
                    cardsContainer.appendChild(mono);

                    // If rejected, gray out after monologue
                    if (opt.rejected) {
                        MC.schedule(() => {
                            card.classList.add('mc-option-rejected');
                            MC.playBeep(300, 0.08);

                            optIdx++;
                            MC.schedule(showOption, 1200);
                        }, 1500);
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
                                }, 2000);
                            }, 1500);
                        }, 1500);
                    }
                }, 1000);
            }

            showOption();
        }, 3000);

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
