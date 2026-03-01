/**
 * SSTV Terminal Scene — Slow Scan TV receiver in the mancave
 * Handles: first SSTV transmission + ROT1 decode, second SSTV + decode → klooster_unlocked.
 *
 * Reached from: mancave → sstv-terminal hotspot
 * Returns to:   mancave (via back_to_mancave)
 */

const SstvTerminalScene = {
    id: 'sstv_terminal',
    name: 'SSTV Terminal',

    background: 'assets/images/scenes/mancave.svg',

    description: 'A green-phosphor monitor running SSTV software. Waterfall display shows incoming signals on 14.230 MHz.',

    playerStart: { x: 50, y: 80 },

    // 🎬 Accessibility / Movie Mode
    accessibilityPath: ['sstv_screen', 'back_to_mancave'],

    idleThoughts: [
        "The waterfall display never lies.",
        "14.230 MHz — classic SSTV frequency.",
        "Slow Scan Television. Patience is a virtue.",
        "Static. Always static. Until suddenly it isn't.",
    ],

    hotspots: [
        // ── SSTV Screen ────────────────────────────────────────────────
        {
            id: 'sstv_screen',
            name: 'SSTV Screen',
            x: 5,
            y: 5,
            width: 85,
            height: 80,
            cursor: 'pointer',
            action: function(game) {
                // ── Second transmission (after HackRF frequency puzzle) ──
                if (game.getFlag('second_transmission_ready') && !game.getFlag('second_message_decoded')) {
                    game.setStoryPart(5);
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Wait! New SSTV transmission!' },
                        { speaker: '', text: '*An image slowly forms, line by line...*' },
                        { speaker: 'Ryan', text: 'That\'s... MY HOUSE! Someone took a photo!' },
                        { speaker: '', text: '*More encoded text appears*' },
                        { speaker: 'Ryan', text: 'They know where I live. They\'ve been watching me.' },
                        { speaker: 'Ryan', text: 'Another encoded message. Decode time!' }
                    ]);

                    setTimeout(() => {
                        game.startPuzzle({
                            id: 'rot1_message_2',
                            type: 'rot1',
                            questId: 'decode_meeting',
                            encryptedText: 'XF LOPX ZPV BSF XBUDIJOH - XF OFFE ZPVS IFMQ - NFFU BU UFS BQFM LMPTUFS 23:00 - DPNF BMPOF - CSJOH ZPVS TLJMMT',
                            hint: 'Same cipher as before. ROT1 — shift each letter back by one position.',
                            solution: 'WE KNOW YOU ARE WATCHING - WE NEED YOUR HELP - MEET AT TER APEL KLOOSTER 23:00 - COME ALONE - BRING YOUR SKILLS',
                            onSolve: function(g) {
                                g.setFlag('second_message_decoded', true);
                                g.setFlag('klooster_unlocked', true);
                                g.setStoryPart(6);
                                g.advanceTime(60);
                                g.completeQuest('check_sstv_again');

                                g.addQuest({
                                    id: 'go_to_klooster',
                                    name: 'Meet at Ter Apel Klooster',
                                    description: 'Someone wants to meet at the Ter Apel monastery at 23:00. They know where you live. This could be a trap... or the answer to everything.',
                                    hint: 'Use the side door to the garden (right side of scene), then get in your Volvo.'
                                });

                                setTimeout(() => {
                                    g.showNotification('✓ Klooster location unlocked! Head to the garden to reach your car.');
                                }, 2000);

                                g.startDialogue([
                                    { speaker: 'Ryan', text: 'WE KNOW YOU ARE WATCHING - WE NEED YOUR HELP - MEET AT TER APEL KLOOSTER 23:00 - COME ALONE - BRING YOUR SKILLS' },
                                    { speaker: 'Ryan', text: 'They want to meet. Tonight. Old monastery.' },
                                    { speaker: 'Ryan', text: 'Someone\'s been watching me. Photographed my damn house.' },
                                    { speaker: 'Ryan', text: 'Could be a trap. Could be the answer.' },
                                    { speaker: 'Ryan', text: 'Flipper Zero, HackRF, laptop... and my wits.' },
                                    { speaker: 'Ryan', text: 'The garden leads to where I parked the Volvo.' }
                                ]);
                            }
                        });
                    }, 500);
                    return;
                }

                // ── After second message decoded ──
                if (game.getFlag('second_message_decoded')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Second message: "MEET AT TER APEL KLOOSTER 23:00"' },
                        { speaker: 'Ryan', text: 'Through the garden to my car. Time\'s ticking.' }
                    ]);
                    return;
                }

                // ── First transmission: decode ROT1 ──
                if (game.getFlag('sstv_transmission_received')) {
                    if (!game.getFlag('message_decoded')) {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'SSTV showing that pattern again. Visual morse...' },
                            { speaker: 'Ryan', text: 'Should decode this. Looks like simple cipher.' }
                        ]);

                        setTimeout(() => {
                            game.startPuzzle({
                                id: 'rot1_message_1',
                                type: 'rot1',
                                questId: 'decode_message',
                                encryptedText: 'XBSOJOH - QSPKFDU FDIP JT DPNQSPNJTFE - NPWF UP CBDLVQ DIBOOFM - DPPSEJOBUFT GPMMPX - USVTU OP POF',
                                hint: 'In ROT1, each letter is shifted by 1. B→A, C→B, etc.',
                                solution: 'WARNING - PROJECT ECHO IS COMPROMISED - MOVE TO BACKUP CHANNEL - COORDINATES FOLLOW - TRUST NO ONE',
                                onSolve: function(g) {
                                    g.setFlag('message_decoded', true);
                                    g.setStoryPart(3);
                                    g.advanceTime(30);
                                    g.startDialogue([
                                        { speaker: 'Ryan', text: 'WARNING - PROJECT ECHO IS COMPROMISED - MOVE TO BACKUP CHANNEL - COORDINATES FOLLOW - TRUST NO ONE' },
                                        { speaker: 'Ryan', text: 'Project Echo? German military R&D? Serious stuff.' },
                                        { speaker: 'Ryan', text: 'But wait... ROT1 isn\'t real encryption. Any idiot could break this.' },
                                        { speaker: 'Ryan', text: 'This was deliberate. They WANT to be found... by the right person.' },
                                        { speaker: 'Ryan', text: 'And why SSTV? That\'s for images. This whole thing is weird.' },
                                        { speaker: 'Ryan', text: 'Message mentioned a frequency. Check the HackRF.' }
                                    ]);
                                }
                            });
                        }, 500);
                    } else if (!game.getFlag('frequency_tuned')) {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'Decoded: "WARNING - PROJECT ECHO IS COMPROMISED..."' },
                            { speaker: 'Ryan', text: 'Should tune HackRF to find that military frequency.' }
                        ]);
                    } else {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'The first message has been decoded. Waiting for more transmissions...' }
                        ]);
                    }
                    return;
                }

                // ── Trigger first transmission after email has been checked ──
                if (game.getFlag('checked_email')) {
                    game.setFlag('sstv_transmission_received', true);
                    game.setStoryPart(2);

                    game.addQuest({
                        id: 'decode_message',
                        name: 'Decipher the Message',
                        description: 'The SSTV terminal is showing a strange pattern that looks like encoded morse code. Decode the message.',
                        hint: 'The pattern suggests ROT1 encoding — each letter shifted by one position.'
                    });

                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Wait... the SSTV terminal! Something\'s showing!' },
                        { speaker: '', text: '*Static shifts into a pattern*' },
                        { speaker: 'Ryan', text: 'Not just noise. That looks like... visual morse?' },
                        { speaker: 'Ryan', text: 'And encoded text. Can\'t be a coincidence.' },
                        { speaker: 'Ryan', text: 'Let me analyze this...' }
                    ]);
                    return;
                }

                // ── Idle (before email checked) ──
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My SSTV terminal. Slow Scan TV — for satellite images.' },
                    { speaker: 'Ryan', text: 'Right now? Just static. Snow and noise.' },
                    { speaker: 'Ryan', text: 'Keep it running just in case.' }
                ]);
            }
        },

        // ── Back to Mancave ────────────────────────────────────────────
        {
            id: 'back_to_mancave',
            name: '← Mancave',
            x: 88,
            y: 88,
            width: 12,
            height: 12,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                game.loadScene('mancave');
            }
        }
    ],

    onEnter: function(game) {},
    onExit: function(game) {}
};

if (typeof module !== 'undefined') {
    module.exports = SstvTerminalScene;
}
