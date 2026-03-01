/**
 * Living Room Scene - Ryan's home, where Ies watches TV
 */

const LivingroomScene = {
    id: 'livingroom',
    name: 'Living Room',
    
    background: 'assets/images/scenes/livingroom.svg',
    
    description: 'A cozy living room with a TV showing a documentary.',

    playerStart: { x: 50, y: 70 },

    // 🎬 Accessibility / Movie Mode — watch documentary, then return home
    accessibilityPath: ['tv', 'to_home'],

    hotspots: [
        {
            id: 'tv',
            name: 'Watch TV',
            x: 46,
            y: 7,
            width: 22,
            height: 32,
            cursor: 'pointer',
            action: (game) => {
                if (!game.getFlag('saw_tv_documentary')) {
                    game.setFlag('saw_tv_documentary', true);
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The TV is showing a documentary about Drenthe\'s wireless pioneers.' },
                        { speaker: '', text: '*"Drenthe: The Unexpected Tech Hub"*' },
                        { speaker: 'Ryan', text: 'WSRT, LOFAR, and Bluetooth... might be worth watching.' }
                    ]);
                    game.sceneTimeout(() => {
                        game.loadScene('tvdocumentary');
                    }, 2000);
                } else if (game.accessibilityMode) {
                    // 🎬 Movie mode: auto-pick next unwatched channel
                    if (!game.getFlag('tv_documentary_watched')) {
                        game.loadScene('tvdocumentary');
                    } else if (!game.getFlag('tv_news_watched')) {
                        game.loadScene('tvnews');
                    }
                    // If both watched, do nothing (path continues to to_home)
                } else {
                    // Show channel picker overlay
                    LivingroomScene._showChannelPicker(game);
                }
            }
        },
        {
            id: 'ies',
            x: 21,
            y: 30,
            width: 12,
            height: 35,
            cursor: 'pointer',
            action: (game) => {
                if (!game.getFlag('talked_to_ies')) {
                    game.setFlag('talked_to_ies', true);
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Hey Ies, watching documentaries again?' },
                        { speaker: 'Ies', text: 'Ryan! This one is fascinating - it\'s about Drenthe\'s wireless technology pioneers.' },
                        { speaker: 'Ies', text: 'They\'re featuring WSRT, LOFAR, and the Ericsson Bluetooth engineers.' },
                        { speaker: 'Ryan', text: 'Wait, LOFAR and WSRT? Those are serious radio astronomy projects.' },
                        { speaker: 'Ies', text: 'They interviewed actual engineers! A Dr. David Prinsloo from TU Eindhoven...' },
                        { speaker: 'Ies', text: 'A man named Cees Bassa who works with LOFAR and satellite tracking...' },
                        { speaker: 'Ies', text: 'And Jaap Haartsen who invented Bluetooth at Ericsson!' },
                        { speaker: 'Ryan', text: '...Those are my contacts. David, Cees, and Jaap.' },
                        { speaker: 'Ies', text: 'Really? Your hacker friends are famous engineers? That\'s amazing!' },
                        { speaker: 'Ryan', text: 'They\'re more than friends. They\'re the best signal processing minds in the Netherlands.' },
                        { speaker: 'Ies', text: 'You should watch it! The dogs are keeping me company if you want to go to your mancave.' },
                        { speaker: 'Ryan', text: 'I might watch it later. Got some radio work to check first.' }
                    ]);
                } else {
                    const watchedDoc = game.getFlag('tv_documentary_watched');
                    if (watchedDoc) {
                        game.startDialogue([
                            { speaker: 'Ies', text: 'So, did you watch the whole documentary?' },
                            { speaker: 'Ryan', text: 'Yeah, it was incredible. David Prinsloo, Cees Bassa, and Jaap Haartsen are true pioneers.' },
                            { speaker: 'Ies', text: 'I told you it was good! They made Drenthe famous for wireless tech.' },
                            { speaker: 'Ryan', text: 'It definitely gave me a new appreciation for their work.' }
                        ]);
                    } else {
                        game.startDialogue([
                            { speaker: 'Ies', text: 'The documentary is really well done! You should watch the whole thing.' },
                            { speaker: 'Ies', text: 'I had no idea wireless technology from Drenthe was so important globally!' },
                            { speaker: 'Ryan', text: 'Yeah, we\'ve got some brilliant people here. Maybe I should watch it.' }
                        ]);
                    }
                }
            }
        },
        {
            id: 'fireplace_dogs',
            x: 33,
            y: 71,
            width: 12,
            height: 8,
            cursor: 'pointer',
            action: (game) => {
                const responses = [
                    [
                        { speaker: 'Ryan', text: 'Hey Tino and Kessy! Warm enough by the fire?' },
                        { speaker: '', text: '*Both dogs are curled up on the rug, basking in the warmth*' },
                        { speaker: '', text: '*Tino yawns softly without opening his eyes*' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'You two are spoiled, you know that? Best spot in the house.' },
                        { speaker: '', text: '*Kessy shifts slightly, stretching closer to the fireplace*' },
                        { speaker: '', text: '*The fire crackles gently*' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'Sound asleep by the fire, both of them.' },
                        { speaker: '', text: '*Tino\'s ear twitches at Ryan\'s voice but he stays asleep*' },
                        { speaker: 'Ies', text: 'They love that spot! Been there all afternoon.' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'Rescue dogs. Both of them. Hard to imagine anyone giving them up.' },
                        { speaker: 'Ies', text: 'Remember Tony Knight? The dog whisperer? When he came to Compascuum for the training weekend?' },
                        { speaker: 'Ryan', text: 'Vaguely. That was... two years ago?' },
                        { speaker: 'Ies', text: 'Tino was still nervous around strangers back then. Tony worked with him for twenty minutes and he was a different dog.' },
                        { speaker: 'Ies', text: 'I met so many lovely people that weekend. Other rescue dog volunteers from all over. Even a German woman... what was her name... Eva, I think.' },
                        { speaker: 'Ryan', text: 'I don\'t remember her.' },
                        { speaker: 'Ies', text: 'You talked to her! I introduced you. She was interested in your tech stuff. You showed her the mancave.' },
                        { speaker: 'Ryan', text: '...Really? I have no memory of that at all.' },
                        { speaker: 'Ies', text: '*shrugs* You get so absorbed in your projects. A person could walk through your mancave and you\'d forget the next day.' },
                    ]
                ];
                
                const responseIndex = (game.getFlag('dog_interactions') || 0) % responses.length;
                game.setFlag('dog_interactions', (game.getFlag('dog_interactions') || 0) + 1);
                game.startDialogue(responses[responseIndex]);
            }
        },
        {
            id: 'fireplace',
            name: 'Fireplace',
            x: 33,
            y: 22,
            width: 11,
            height: 45,
            cursor: 'pointer',
            action: (game) => {
                const responses = [
                    [
                        { speaker: 'Ryan', text: 'Nice fire going. The old brick fireplace really warms the room.' },
                        { speaker: '', text: '*The flames dance and crackle softly*' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'That mantel clock has been there since we moved in.' },
                        { speaker: '', text: '*The fire pops, sending a tiny spark up the chimney*' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'Nothing beats a real fire on a Drenthe evening.' },
                        { speaker: 'Ies', text: 'The dogs agree with you!' }
                    ]
                ];
                const idx = (game.getFlag('fireplace_interactions') || 0) % responses.length;
                game.setFlag('fireplace_interactions', (game.getFlag('fireplace_interactions') || 0) + 1);
                game.startDialogue(responses[idx]);
            }
        },
        {
            id: 'pug',
            x: 32,
            y: 80,
            width: 20,
            height: 10,
            cursor: 'pointer',
            action: (game) => {
                const responses = [
                    [
                        { speaker: 'Ryan', text: 'ET! Come here little guy!' },
                        { speaker: '', text: '*The pug waddles over, tongue hanging out*' },
                        { speaker: 'Ryan', text: 'Such a good boy!' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'Still walking around, ET?' },
                        { speaker: '', text: '*Snort snort* The pug is on patrol!' },
                        { speaker: 'Ies', text: 'He never stops exploring!' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'Why don\'t you join Tino and Kessy on the couch?' },
                        { speaker: '', text: '*The pug looks at the couch, then continues walking*' },
                        { speaker: 'Ryan', text: 'Too busy, I see.' }
                    ],
                    [
                        { speaker: '', text: '*ET snuffles around the coffee table*' },
                        { speaker: 'Ryan', text: 'Looking for snacks? There are none here!' },
                        { speaker: '', text: '*The pug gives Ryan a disappointed look*' }
                    ]
                ];
                
                const responseIndex = (game.getFlag('pug_interactions') || 0) % responses.length;
                game.setFlag('pug_interactions', (game.getFlag('pug_interactions') || 0) + 1);
                game.startDialogue(responses[responseIndex]);
            }
        },
        {
            id: 'to_home',
            name: 'Door to Kitchen',
            x: 1,
            y: 17,
            width: 10,
            height: 50,
            cursor: 'pointer',
            targetScene: 'home'
        }
    ],

    /* ═══════════════════════════════════════════════════
     *  CHANNEL PICKER — TV remote overlay
     * ═══════════════════════════════════════════════════ */
    _showChannelPicker(game) {
        // Remove any existing picker
        const existing = document.getElementById('channel-picker-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'channel-picker-overlay';
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', zIndex: '9000',
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Courier New', monospace"
        });

        const channels = [
            { id: 'tvdocumentary', label: 'NPO DOC', desc: 'Drenthe: The Unexpected Tech Hub', icon: '🎬' },
            { id: 'tvnews',        label: 'NOS Journaal', desc: 'Latest news',                  icon: '📺' }
        ];

        const card = document.createElement('div');
        Object.assign(card.style, {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '2px solid #0f3460', borderRadius: '12px',
            padding: '28px 32px', minWidth: '340px', maxWidth: '440px',
            boxShadow: '0 0 40px rgba(15,52,96,0.6)'
        });

        const title = document.createElement('div');
        title.textContent = '📡  SELECT CHANNEL';
        Object.assign(title.style, {
            color: '#e0e0e0', fontSize: '15px', fontWeight: 'bold',
            textAlign: 'center', marginBottom: '18px', letterSpacing: '2px'
        });
        card.appendChild(title);

        channels.forEach(ch => {
            const btn = document.createElement('button');
            btn.innerHTML = `<span style="font-size:22px;margin-right:10px">${ch.icon}</span>
                             <span><strong style="color:#e0e0e0">${ch.label}</strong>
                             <br><small style="color:#8899aa">${ch.desc}</small></span>`;
            Object.assign(btn.style, {
                display: 'flex', alignItems: 'center', width: '100%',
                padding: '12px 16px', marginBottom: '10px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.2s, border-color 0.2s'
            });
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(15,52,96,0.6)';
                btn.style.borderColor = '#4a9eff';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255,255,255,0.06)';
                btn.style.borderColor = 'rgba(255,255,255,0.12)';
            });
            btn.addEventListener('click', () => {
                overlay.remove();
                game.loadScene(ch.id);
            });
            card.appendChild(btn);
        });

        // Cancel / back button
        const cancel = document.createElement('button');
        cancel.textContent = '✕  Back';
        Object.assign(cancel.style, {
            display: 'block', margin: '14px auto 0', padding: '6px 18px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px', color: '#8899aa', cursor: 'pointer',
            fontSize: '12px', fontFamily: 'inherit',
            transition: 'color 0.2s'
        });
        cancel.addEventListener('mouseenter', () => { cancel.style.color = '#e0e0e0'; });
        cancel.addEventListener('mouseleave', () => { cancel.style.color = '#8899aa'; });
        cancel.addEventListener('click', () => overlay.remove());
        card.appendChild(cancel);

        overlay.appendChild(card);

        // Close on overlay click (outside card)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        document.body.appendChild(overlay);
    },

    // ── Ambient Audio ───────────────────────────────────────────
    _audioCtx: null, _audioNodes: [], _audioIntervals: [],
    _getAudioCtx: function() {
        if (!this._audioCtx) {
            try { this._audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch(e) { return null; }
        }
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },
    _stopAmbientAudio: function() {
        this._audioIntervals.forEach(function(id) { clearInterval(id); });
        this._audioIntervals = [];
        this._audioNodes.forEach(function(n) { try { if (n.stop) n.stop(); n.disconnect(); } catch(e) {} });
        this._audioNodes = [];
        if (this._audioCtx) { try { this._audioCtx.close(); } catch(e) {} this._audioCtx = null; }
    },
    _startAmbientAudio: function() {
        var self = this, ctx = this._getAudioCtx();
        if (!ctx) return;
        try {
            var master = ctx.createGain();
            master.gain.setValueAtTime(0, ctx.currentTime);
            master.gain.linearRampToValueAtTime(0.72, ctx.currentTime + 5);
            master.connect(ctx.destination);
            self._audioNodes.push(master);
            // ── fireplace base hiss (warm filtered noise, continuous) ──
            var buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var hiss = ctx.createBufferSource(); hiss.buffer = buf; hiss.loop = true;
            var lp1 = ctx.createBiquadFilter(); lp1.type = 'lowpass'; lp1.frequency.value = 900;
            var hp1 = ctx.createBiquadFilter(); hp1.type = 'highpass'; hp1.frequency.value = 180;
            var hG = ctx.createGain(); hG.gain.value = 0.032;
            hiss.connect(lp1).connect(hp1).connect(hG).connect(master); hiss.start();
            self._audioNodes.push(hiss, lp1, hp1, hG);
            // ── occasional soft crackle pops (very sparse) ──
            var buf2 = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d2 = buf2.getChannelData(0);
            for (var i = 0; i < d2.length; i++) d2[i] = Math.random() > 0.9996 ? (Math.random() * 2 - 1) * 1.2 : (Math.random() * 2 - 1) * 0.04;
            var crk = ctx.createBufferSource(); crk.buffer = buf2; crk.loop = true;
            var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.4;
            var cG = ctx.createGain(); cG.gain.value = 0.045;
            crk.connect(bp).connect(cG).connect(master); crk.start();
            self._audioNodes.push(crk, bp, cG);
            // ── deep warm fire rumble (sine, very soft) ──
            var rumble = ctx.createOscillator(); rumble.type = 'sine'; rumble.frequency.value = 40;
            var rf = ctx.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 90;
            // slow LFO breathing on the rumble
            var lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.12;
            var lfoG = ctx.createGain(); lfoG.gain.value = 0.006;
            lfo.connect(lfoG);
            var rG = ctx.createGain(); rG.gain.value = 0.011;
            lfoG.connect(rG.gain);
            rumble.connect(rf).connect(rG).connect(master);
            rumble.start(); lfo.start();
            self._audioNodes.push(rumble, rf, rG, lfo, lfoG);
            // ── distant soft clock tick (very quiet, subtle) ──
            var ti = setInterval(function() {
                if (!self._audioCtx) return;
                var t = ctx.currentTime;
                var osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 720;
                var env = ctx.createGain();
                env.gain.setValueAtTime(0, t);
                env.gain.linearRampToValueAtTime(0.010, t + 0.004);
                env.gain.linearRampToValueAtTime(0, t + 0.035);
                osc.connect(env).connect(master); osc.start(t); osc.stop(t + 0.04);
                self._audioNodes.push(osc, env);
            }, 1000);
            self._audioIntervals.push(ti);
        } catch(e) {}
    },

    onEnter: (game) => {
        LivingroomScene._startAmbientAudio();
        // Remove any existing NPC characters from previous visits (preserve player character)
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            const npcCharacters = charactersContainer.querySelectorAll('.npc-character');
            npcCharacters.forEach(npc => npc.remove());
        }
        
        // Ies is drawn directly in the livingroom SVG (sitting on armchair)
        
        // Add two white dogs on the rug by the fireplace
        setTimeout(() => {
            game.showCharacter('dog_white', 35, 77, 0.13);
            game.showCharacter('dog_white', 40, 78, 0.13);
        }, 200);
        
        // Add pug on the floor (smallest - walks around)
        setTimeout(() => {
            game.showCharacter('pug', 38, 82, 0.11);
        }, 300);
        
        // Welcome message
        if (!game.getFlag('visited_livingroom')) {
            game.setFlag('visited_livingroom', true);
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The living room. Ies is watching TV.' },
                    { speaker: '', text: '*On screen: "Drenthe: The Unexpected Tech Hub" - Documentary*' },
                    { speaker: '', text: '*Tino and Kessy are sleeping peacefully on the rug by the fireplace*' },
                    { speaker: '', text: '*ET the pug waddles around exploring*' },
                    { speaker: 'Ryan', text: 'That documentary looks interesting... wireless technology from Drenthe?' },
                    { speaker: 'Ryan', text: 'I should watch this before heading to the mancave. Might learn something.' }
                ]);
            }, 500);
        } else if (game.getFlag('documentary_completed_once') && !game.getFlag('post_documentary_reminder_shown')) {
            game.setFlag('post_documentary_reminder_shown', true);
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Okay, documentary watched. Time to get to work in the mancave.' },
                    { speaker: 'Ies', text: 'Told you it was good! Your friends are amazing.' },
                    { speaker: 'Ryan', text: 'Yeah... it gives me new perspective on the signals I work with.' }
                ]);
            }, 500);
        }
    },
    
    onExit: () => {
        LivingroomScene._stopAmbientAudio();
        // Remove NPC character elements (preserve player character)
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            const npcCharacters = charactersContainer.querySelectorAll('.npc-character');
            npcCharacters.forEach(npc => npc.remove());
        }
        // Remove channel picker if still open (e.g. player navigated away)
        document.getElementById('channel-picker-overlay')?.remove();
    }
};
