/**
 * Debrief Scene - AIVD Headquarters, Zoetermeer
 * Story Part 20 - The Reckoning aftermath.
 * Multi-part dialogue with paced sections and proper cleanup.
 */

const DebriefScene = {
    id: 'debrief',
    name: 'AIVD Headquarters - Debrief',

    background: 'assets/images/scenes/debrief.svg',

    description: 'A secure conference room at AIVD headquarters in Zoetermeer. Classified screens, dark leather chairs, and the Dutch coat of arms on the wall.',

    playerStart: { x: 30, y: 75 },

    idleThoughts: [
        "This is surreal. I'm inside AIVD headquarters.",
        "Security cameras everywhere. Card readers on every door.",
        "The Den Haag skyline through those windows. A long way from Compascuum.",
        "Are they arresting me or recruiting me?",
        "Van der Berg seems... reasonable.",
        "Four agents. Three men, one woman. All business.",
        "That business card on the table. Staring at me.",
        "From amateur radio nerd to government conference room.",
        "STAATSGEHEIM on the folder. State secret. My life now.",
        "My visitor badge says BEZOEKER. Visitor. For now."
    ],

    hotspots: [
        {
            id: 'classified-screen',
            name: 'Classified Screen',
            x: 25,
            y: 18,
            width: 16,
            height: 20,
            cursor: 'pointer',
            action: function(game) {
                if (game.getFlag('debrief_complete')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'OPERATION DOSSIER. That\'s what they called it.' },
                        { speaker: 'Ryan', text: 'My entire investigation, laid out on their screens. They knew more than they let on.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Classified screens. I probably shouldn\'t stare.' }
                    ]);
                }
            }
        },
        {
            id: 'business-card',
            name: 'Van der Berg\'s Card',
            x: 42,
            y: 65,
            width: 8,
            height: 6,
            cursor: 'pointer',
            action: function(game) {
                if (game.getFlag('debrief_complete')) {
                    game.startDialogue([
                        { speaker: '', text: '*A plain white card. AIVD crest. A phone number. Nothing else.*' },
                        { speaker: 'Ryan', text: 'Van der Berg\'s direct line.' },
                        { speaker: 'Ryan', text: 'One call. That\'s all it would take.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Just a conference table. For now.' }
                    ]);
                }
            }
        },
        {
            id: 'continue-to-epilogue',
            name: 'Continue →',
            x: 40,
            y: 82,
            width: 20,
            height: 10,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                if (game.getFlag('debrief_complete')) {
                    game.loadScene('return_to_ies');
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Not yet. Still processing all this.' }
                    ]);
                }
            }
        }
    ],

    // Track timeouts/intervals for cleanup
    _timeoutIds: [],

    onEnter: function(game) {
        // Clear stale timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        game.setFlag('visited_debrief', true);

        // Show Van der Berg character
        const tid0 = setTimeout(() => {
            if (typeof game.showCharacter === 'function') {
                game.showCharacter('vandeberg', 70, 65, 0.113);
            }
        }, 300);
        this._timeoutIds.push(tid0);

        // Start multi-part debrief
        const tid1 = setTimeout(() => {
            this._playDebrief(game);
        }, 800);
        this._timeoutIds.push(tid1);
    },

    onExit: function() {
        // Clear all pending timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        // End active dialogue
        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }

        // Clean up NPC characters
        const container = document.getElementById('scene-characters');
        if (container) {
            const npcs = container.querySelectorAll('.npc-character');
            npcs.forEach(npc => npc.remove());
        }
    },

    /**
     * Multi-part debrief with paced sections.
     * Player clicks through each batch; next batch starts after a brief pause.
     */
    _playDebrief: function(game) {
        const sections = [
            // ── Arrival ──
            [
                { speaker: '', text: '11:00 AM — AIVD Headquarters, Zoetermeer' },
                { speaker: '', text: '*A black car delivers Ryan to the secure complex near Den Haag.*' },
                { speaker: 'Ryan', text: 'Card readers. Security cameras. Armed guards at the gate.' },
                { speaker: 'Ryan', text: '*Follows an escort through corridors to a conference room*' }
            ],

            // ── Introductions ──
            [
                { speaker: 'Agent Van der Berg', text: 'Herr Weylant. Or should I say, Ryan.' },
                { speaker: 'Agent Van der Berg', text: 'My name is Van der Berg. Thank you for coming to Zoetermeer.' },
                { speaker: 'Agent Van der Berg', text: 'Please, sit down. Coffee?' },
                { speaker: 'Ryan', text: '*Looks at the coat of arms on the wall, the classified screens* I think I\'ll need it.' },
                { speaker: 'Agent Van der Berg', text: '*Thin smile* It\'s been a long week for all of us.' }
            ],

            // ── The questioning ──
            [
                { speaker: '', text: '*They sit around the conference table. Coffee served in government china.*' },
                { speaker: 'Agent Van der Berg', text: 'Let\'s start from the beginning. The SSTV transmission.' },
                { speaker: 'Ryan', text: 'Visual morse code. ROT1 cipher. A photograph of my own house.' },
                { speaker: 'Agent Van der Berg', text: 'The USB drop at Ter Apel Klooster?' },
                { speaker: 'Ryan', text: 'Schematics. Evidence files. Everything Eva Weber had gathered.' }
            ],

            // ── Deeper ──
            [
                { speaker: 'Agent Van der Berg', text: 'And the Meshtastic communications?' },
                { speaker: 'Ryan', text: 'Eva guided me. She knew the facility layout. Maintenance access.' },
                { speaker: 'Agent Van der Berg', text: 'And then you infiltrated a German military facility. Alone.' },
                { speaker: 'Ryan', text: 'To stop the demonstration. To corrupt the calibration. To save Groningen.' }
            ],

            // ── Van der Berg's assessment ──
            [
                { speaker: 'Agent Van der Berg', text: '*Nods slowly* You understand this is highly irregular.' },
                { speaker: 'Agent Van der Berg', text: 'A Dutch citizen conducting an unsanctioned operation on German soil.' },
                { speaker: 'Ryan', text: 'I understand.' },
                { speaker: 'Agent Van der Berg', text: 'The Germans want to give you a medal. Or arrest you. They can\'t decide which.' },
                { speaker: 'Ryan', text: 'And the Dutch?' }
            ],

            // ── AIVD context ──
            [
                { speaker: 'Agent Van der Berg', text: '*Exchanges a glance with his colleagues*' },
                { speaker: 'Agent Van der Berg', text: 'We\'ve been tracking Russian influence operations in the border region for years.' },
                { speaker: 'Agent Van der Berg', text: 'We suspected something at Steckerdoser Heide. Could never get proof.' },
                { speaker: 'Agent Van der Berg', text: 'You handed us the entire case on a silver platter.' }
            ],

            // ── The official position ──
            [
                { speaker: 'Agent Van der Berg', text: 'The official position of the AIVD is this:' },
                { speaker: 'Agent Van der Berg', text: 'You are a private citizen who received unsolicited information…' },
                { speaker: 'Agent Van der Berg', text: '…and acted in good faith to prevent imminent harm to human life.' },
                { speaker: 'Ryan', text: 'So…?' }
            ],

            // ── The offer ──
            [
                { speaker: 'Agent Van der Berg', text: 'Unofficially…' },
                { speaker: 'Agent Van der Berg', text: '*Leans forward* We could use someone with your skills.' },
                { speaker: 'Ryan', text: 'Are you recruiting me?' },
                { speaker: 'Agent Van der Berg', text: 'I\'m suggesting your talents might be better utilised with institutional support.' },
                { speaker: 'Agent Van der Berg', text: 'Think about it.' }
            ],

            // ── Departure ──
            [
                { speaker: '', text: '*Van der Berg places a plain white business card on the table*' },
                { speaker: 'Agent Van der Berg', text: 'My direct line. When you\'re ready.' },
                { speaker: '', text: '*The agents stand. Coffee cups empty.*' },
                { speaker: 'Agent Van der Berg', text: 'Thank you, Ryan. For what you did.' },
                { speaker: 'Agent Van der Berg', text: 'You may have saved thousands of lives.' }
            ],

            // ── Ryan's reflection in the car ──
            [
                { speaker: '', text: '*A black car waits outside. The Den Haag skyline recedes in the mirror.*' },
                { speaker: 'Ryan', text: '*In the back of the car, staring at the business card*' },
                { speaker: 'Ryan', text: 'AIVD. Dutch Intelligence.' },
                { speaker: 'Ryan', text: 'From freelance hacker to… what? Government agent?' },
                { speaker: 'Ryan', text: 'Is that who I am now?' },
                { speaker: 'Ryan', text: '*Watches the flat Dutch landscape scroll past*' },
                { speaker: 'Ryan', text: 'First things first. I need to talk to Ies. Tell her everything.' }
            ]
        ];

        let sectionIndex = 0;

        const playNext = () => {
            if (sectionIndex >= sections.length) {
                game.setFlag('debrief_complete', true);
                game.showNotification('Click to continue…');
                const tid = setTimeout(() => {
                    game.loadScene('return_to_ies');
                }, 10000);
                this._timeoutIds.push(tid);
                return;
            }

            const section = sections[sectionIndex];
            sectionIndex++;
            game.startDialogue(section);

            // Wait for player to finish clicking through, then pause before next
            const poll = setInterval(() => {
                if (!game.isDialogueActive) {
                    clearInterval(poll);
                    const tid = setTimeout(playNext, 1200);
                    this._timeoutIds.push(tid);
                }
            }, 250);
            this._timeoutIds.push(poll);
        };

        playNext();
    }
};

// Scene will be registered in index.html initGame() function
