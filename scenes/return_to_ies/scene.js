/**
 * Scene: Return to Ies — The Homecoming
 * ═══════════════════════════════════════════════════════════
 * After the AIVD debrief in Den Haag, Ryan returns home
 * late at night. Ies is waiting up. He tells her everything.
 *
 * Emotional, intimate scene in the living room.
 * Cinematic auto-play dialogue with ambient audio.
 *
 * Flow: debrief → return_to_ies → morning_after
 * Background: livingroom.svg (same living room, night mood)
 * Flags set: return_to_ies_complete
 * ═══════════════════════════════════════════════════════════
 */

const ReturnToIesScene = {
    id: 'return_to_ies',
    name: 'Return to Ies',

    background: 'assets/images/scenes/livingroom.svg',

    description: 'The living room at night. A single lamp glows. Ies is curled up on the couch, waiting.',

    playerStart: { x: 80, y: 85 },

    _timeoutIds: [],
    _audioCtx: null,
    _audioNodes: [],

    hotspots: [
        {
            id: 'continue-morning',
            name: 'Continue →',
            x: 40,
            y: 82,
            width: 20,
            height: 10,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function (game) {
                if (game.getFlag('return_to_ies_complete')) {
                    game.startDialogue([
                        { speaker: '', text: '*Hours later. The fire has burned to embers. The dogs are asleep. Ies rests her head on Ryan\'s shoulder.*' },
                        { speaker: '', text: '*Outside, the first grey light of dawn touches the flat Drenthe horizon.*' }
                    ]);
                    game.sceneTimeout(() => {
                        game.loadScene('morning_after');
                    }, 5000);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'I need to finish telling Ies everything first.' }
                    ]);
                }
            }
        }
    ],

    onEnter(game) {
        // ── Cleanup ──
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        this._stopAudio();

        // Remove lingering NPC sprites
        const chars = document.getElementById('scene-characters');
        if (chars) {
            chars.querySelectorAll('.npc-character').forEach(n => n.remove());
        }

        // ── Night overlay — dim the room ──
        this._addNightOverlay();

        // ── Ambient audio — crackling fire, ticking clock, soft wind ──
        this._startAmbientAudio();

        // ── Show dogs after a beat (Ies is already in the livingroom SVG) ──
        game.sceneTimeout(() => {
            game.showCharacter('dog_white', 35, 77, 0.12);
            game.showCharacter('dog_white', 40, 78, 0.12);
            game.showCharacter('pug', 38, 83, 0.10);
        }, 400);

        // ── Cinematic entrance ──
        game.sceneTimeout(() => {
            this._playHomecoming(game);
        }, 1200);
    },

    onExit() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        this._stopAudio();
        this._removeNightOverlay();

        const chars = document.getElementById('scene-characters');
        if (chars) {
            chars.querySelectorAll('.npc-character').forEach(n => n.remove());
        }

        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }
    },

    /* ═══════════════════════════════════════════════════════
     *  Night overlay
     * ═══════════════════════════════════════════════════════ */
    _addNightOverlay() {
        const existing = document.getElementById('night-overlay-rti');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'night-overlay-rti';
        Object.assign(overlay.style, {
            position: 'absolute',
            inset: '0',
            background: 'radial-gradient(ellipse at 35% 40%, rgba(30,25,15,0.25) 0%, rgba(10,8,20,0.55) 100%)',
            pointerEvents: 'none',
            zIndex: '1',
            transition: 'opacity 2s ease',
            opacity: '0'
        });
        const sceneEl = document.getElementById('game-scene') || document.getElementById('scene-container');
        if (sceneEl) {
            sceneEl.style.position = 'relative';
            sceneEl.appendChild(overlay);
            requestAnimationFrame(() => { overlay.style.opacity = '1'; });
        }
    },

    _removeNightOverlay() {
        const overlay = document.getElementById('night-overlay-rti');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 2000);
        }
    },

    /* ═══════════════════════════════════════════════════════
     *  Ambient audio — warm, quiet living-room at night
     * ═══════════════════════════════════════════════════════ */
    _startAmbientAudio() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._audioCtx = ctx;
            const master = ctx.createGain();
            master.gain.value = 0.08;
            master.connect(ctx.destination);

            // ── Fireplace crackle (filtered noise bursts) ──
            const noiseLen = ctx.sampleRate * 2;
            const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
            const noiseData = noiseBuf.getChannelData(0);
            for (let i = 0; i < noiseLen; i++) noiseData[i] = Math.random() * 2 - 1;

            const fireNoise = ctx.createBufferSource();
            fireNoise.buffer = noiseBuf;
            fireNoise.loop = true;
            const fireFilt = ctx.createBiquadFilter();
            fireFilt.type = 'bandpass';
            fireFilt.frequency.value = 600;
            fireFilt.Q.value = 1.5;
            const fireGain = ctx.createGain();
            fireGain.gain.value = 0.4;
            fireNoise.connect(fireFilt).connect(fireGain).connect(master);
            fireNoise.start();
            this._audioNodes.push(fireNoise);

            // ── Soft low hum (house ambience) ──
            const hum = ctx.createOscillator();
            hum.type = 'sine';
            hum.frequency.value = 50;
            const humGain = ctx.createGain();
            humGain.gain.value = 0.08;
            hum.connect(humGain).connect(master);
            hum.start();
            this._audioNodes.push(hum);

            // ── Ticking clock ──
            const tickLoop = () => {
                if (!this._audioCtx) return;
                const tick = ctx.createOscillator();
                tick.type = 'sine';
                tick.frequency.value = 2800;
                const tickEnv = ctx.createGain();
                tickEnv.gain.setValueAtTime(0.15, ctx.currentTime);
                tickEnv.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
                tick.connect(tickEnv).connect(master);
                tick.start();
                tick.stop(ctx.currentTime + 0.04);
                this._audioNodes.push(tick);
                const next = 950 + Math.random() * 100; // slight drift
                const tid = setTimeout(tickLoop, next);
                this._timeoutIds.push(tid);
            };
            const tid = setTimeout(tickLoop, 2000);
            this._timeoutIds.push(tid);

        } catch (e) {
            console.warn('ReturnToIes: audio init failed', e);
        }
    },

    _stopAudio() {
        this._audioNodes.forEach(n => { try { n.stop(); } catch (_) {} });
        this._audioNodes = [];
        if (this._audioCtx) {
            try { this._audioCtx.close(); } catch (_) {}
            this._audioCtx = null;
        }
    },

    /* ═══════════════════════════════════════════════════════
     *  Cinematic dialogue — auto-play sections
     * ═══════════════════════════════════════════════════════ */
    _playHomecoming(game) {
        const sections = [

            // ── 1. Arrival — the car, the driveway ──
            [
                { speaker: '', text: 'Late evening — Compascuum' },
                { speaker: '', text: '*A black government car pulls into the gravel driveway. Engine cuts. Silence.*' },
                { speaker: '', text: '*Ryan climbs out. The air smells like peat and cut grass. Home.*' },
                { speaker: '', text: '*Through the window he can see a single lamp. She\'s still up.*' },
                { speaker: 'Ryan', text: '*Hesitates at the front door. Takes a breath.*' },
                { speaker: 'Ryan', text: 'How do you even begin to explain something like this?' }
            ],

            // ── 2. The door opens ──
            [
                { speaker: '', text: '*The door opens before he can reach the handle.*' },
                { speaker: 'Ies', text: 'Ryan.' },
                { speaker: '', text: '*She\'s been crying. She tries to hide it. Can\'t.*' },
                { speaker: 'Ies', text: 'I\'ve been watching the news. All day. Every channel.' },
                { speaker: 'Ies', text: '"Major intelligence operation in Lower Saxony." "Russian cell dismantled." "Dutch civilian involvement."' },
                { speaker: 'Ryan', text: 'Ies, I—' },
                { speaker: 'Ies', text: '*Pulls him into a tight hug. Doesn\'t let go for a long time.*' },
                { speaker: '', text: '*Tino and Kessy scramble over, tails going wild. ET snorts from between their legs.*' }
            ],

            // ── 3. Settling in ──
            [
                { speaker: '', text: '*They sit on the couch. Two cups of tea. The fire is down to embers but still warm.*' },
                { speaker: 'Ies', text: 'Where do I even start?' },
                { speaker: 'Ryan', text: 'I owe you the whole story. From the beginning.' },
                { speaker: 'Ies', text: '...I think I need to hear it.' },
                { speaker: '', text: '*Tino rests his head on Ryan\'s foot. Kessy curls up next to Ies.*' }
            ],

            // ── 4. The signal — how it started ──
            [
                { speaker: 'Ryan', text: 'It started with a signal. On the SDR. A pattern in the noise that shouldn\'t have been there.' },
                { speaker: 'Ryan', text: 'I thought it was amateur radio interference at first. Then I decoded it.' },
                { speaker: 'Ryan', text: 'Military-grade encryption. Coming from somewhere near the German border.' },
                { speaker: 'Ies', text: '...From your mancave? You picked this up from our house?' },
                { speaker: 'Ryan', text: 'The LOFAR array helped. Cees and David confirmed the coordinates.' },
                { speaker: 'Ies', text: 'Cees Bassa. The satellite man.' },
                { speaker: 'Ryan', text: 'Yes. He tracked the signal source. A former military facility. Steckerdoser Heide.' }
            ],

            // ── 5. Eva ──
            [
                { speaker: 'Ies', text: 'And the woman? Eva?' },
                { speaker: '', text: '*Ryan pauses. This is the hard part.*' },
                { speaker: 'Ryan', text: 'Eva Weber. German intelligence. Her father was involved years ago — died trying to expose the same operation.' },
                { speaker: 'Ryan', text: 'She contacted me because of my radio work. She needed someone who could read the signals.' },
                { speaker: 'Ies', text: '*Quietly* That woman at the dog training weekend. Tony Knight\'s workshop. I introduced you.' },
                { speaker: 'Ryan', text: 'Wait. You knew her?' },
                { speaker: 'Ies', text: 'I didn\'t *know* her. She was there with a rescue dog. Seemed lovely. I introduced her to you because she asked about antennas.' },
                { speaker: 'Ryan', text: 'I have zero memory of that.' },
                { speaker: 'Ies', text: 'Of course you don\'t. You were elbow-deep in a circuit board.' },
                { speaker: 'Ies', text: '*Small laugh through tears* She was watching you. I thought she was just curious.' }
            ],

            // ── 6. The facility — the danger ──
            [
                { speaker: 'Ies', text: 'The news said someone broke into the facility. A *civilian*.' },
                { speaker: '', text: '*Long silence. The fire pops.*' },
                { speaker: 'Ryan', text: '...That was me.' },
                { speaker: 'Ies', text: '*Her hands tighten around the tea cup*' },
                { speaker: 'Ryan', text: 'Volkov — the Russian commander — had weaponized the satellite infrastructure. The whole array.' },
                { speaker: 'Ryan', text: 'He could disrupt communications across northern Europe. Aviation, emergency services, military.' },
                { speaker: 'Ryan', text: 'The countdown was already running, Ies. Hours. Not days.' },
                { speaker: 'Ies', text: 'And you went IN there? Into a military compound? With armed guards?' },
                { speaker: 'Ryan', text: 'There was no other option. Not in time.' },
                { speaker: 'Ies', text: '*Sets the cup down. Her hands are shaking.*' },
                { speaker: 'Ies', text: 'You could have died. You could be dead right now, and I\'d be reading about it on the NOS.' }
            ],

            // ── 7. The exposure — the press package ──
            [
                { speaker: 'Ryan', text: 'I transmitted everything. Jaap helped with the dead man\'s switch. David triangulated the signals. Cees confirmed via satellite.' },
                { speaker: 'Ryan', text: 'The evidence went to every major news outlet simultaneously. They couldn\'t suppress it.' },
                { speaker: 'Ies', text: 'That\'s why every phone in the country was going off this morning.' },
                { speaker: 'Ryan', text: 'The BND arrested Volkov. NATO secured the facility. It\'s over.' },
                { speaker: 'Ies', text: '*Wipes her eyes* Is it? Is it really over?' },
                { speaker: 'Ryan', text: 'The operation is. What comes next... I don\'t know yet.' }
            ],

            // ── 8. The AIVD ──
            [
                { speaker: 'Ies', text: 'Where were you today? After the news broke?' },
                { speaker: 'Ryan', text: 'Den Haag. The AIVD.' },
                { speaker: 'Ies', text: '*Stares at him* Dutch intelligence.' },
                { speaker: 'Ryan', text: 'Agent Van der Berg. He debriefed me for hours. Official statement, timeline, evidence chain.' },
                { speaker: 'Ies', text: 'Are you in trouble?' },
                { speaker: 'Ryan', text: 'No. The opposite, actually.' },
                { speaker: '', text: '*Ryan reaches into his pocket and places a plain white business card on the coffee table.*' },
                { speaker: 'Ryan', text: 'They want to recruit me. "Institutional support," Van der Berg called it.' },
                { speaker: 'Ies', text: '*Picks up the card. Turns it over. Plain white. AIVD crest.*' },
                { speaker: 'Ies', text: 'Ryan Weylant. Government agent.' },
                { speaker: 'Ryan', text: 'I didn\'t say yes.' }
            ],

            // ── 9. Ies processes ──
            [
                { speaker: '', text: '*Silence. The clock ticks. ET snores softly on the rug.*' },
                { speaker: 'Ies', text: 'I\'m trying to decide if I\'m furious or proud.' },
                { speaker: 'Ryan', text: 'Both is fine.' },
                { speaker: 'Ies', text: '*Almost laughs* Both. Yes. Both.' },
                { speaker: 'Ies', text: 'You lied to me. For days. "Just radio stuff, Ies." "Nothing interesting, Ies."' },
                { speaker: 'Ryan', text: 'I was trying to protect—' },
                { speaker: 'Ies', text: 'Don\'t. Don\'t say you were protecting me. I\'m not a child.' },
                { speaker: '', text: '*More silence. Tino whimpers softly in his sleep.*' },
                { speaker: 'Ies', text: 'You saved thousands of lives. That\'s what the news said. Thousands.' },
                { speaker: 'Ryan', text: 'I had help. David. Cees. Jaap. Eva. Even the Meshtastic community.' },
                { speaker: 'Ies', text: 'But you\'re the one who went in. You.' }
            ],

            // ── 10. Resolution — together ──
            [
                { speaker: 'Ies', text: '*Takes his hand*' },
                { speaker: 'Ies', text: 'Promise me something.' },
                { speaker: 'Ryan', text: 'Anything.' },
                { speaker: 'Ies', text: 'Next time the world needs saving, you tell me first. Before you go.' },
                { speaker: 'Ryan', text: '*Squeezes her hand* I promise.' },
                { speaker: 'Ies', text: 'And the AIVD thing... we decide together. Not just you in your mancave at 3 AM.' },
                { speaker: 'Ryan', text: 'Together. Always.' },
                { speaker: '', text: '*She leans against him. The fire glows. The dogs breathe softly.*' },
                { speaker: '', text: '*Outside, the Drenthe night is vast and quiet. Stars over the peat bogs.*' },
                { speaker: '', text: '*For the first time in weeks, Ryan feels something he\'d almost forgotten.*' },
                { speaker: '', text: '*Home.*' }
            ]
        ];

        let sectionIndex = 0;

        const playNext = () => {
            if (sectionIndex >= sections.length) {
                game.setFlag('return_to_ies_complete', true);
                game.showNotification('Click "Continue" to proceed…');
                // Auto-advance after 15 seconds
                const tid = setTimeout(() => {
                    game.loadScene('morning_after');
                }, 15000);
                this._timeoutIds.push(tid);
                return;
            }

            const section = sections[sectionIndex];
            sectionIndex++;
            game.startDialogue(section);

            // Poll until dialogue finishes, then pause before next section
            const poll = setInterval(() => {
                if (!game.isDialogueActive) {
                    clearInterval(poll);
                    const tid = setTimeout(playNext, 1500);
                    this._timeoutIds.push(tid);
                }
            }, 250);
            this._timeoutIds.push(poll);
        };

        playNext();
    }
};

// Scene will be registered in index.html initGame() function
