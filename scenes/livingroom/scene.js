/**
 * Living Room Scene - Ryan's home, where Max watches TV
 */

const LivingroomScene = {
    id: 'livingroom',
    name: 'Living Room',
    
    background: 'assets/images/scenes/livingroom.svg',
    
    description: 'A cozy living room with a TV showing a documentary.',

    playerStart: { x: 50, y: 70 },

    // 🎬 Accessibility / Movie Mode — meet Max, watch documentary, then return home
    accessibilityPath: ['tv', 'max', 'to_home'],

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
            id: 'max',
            x: 21,
            y: 30,
            width: 12,
            height: 35,
            cursor: 'pointer',
            action: (game) => {
                const docWatched = game.getFlag('tv_documentary_watched');

                if (!game.getFlag('talked_to_max')) {
                    game.setFlag('talked_to_max', true);

                    if (!docWatched) {
                        // First meeting — doc not watched yet: Max pitches the documentary
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'Hey Max, watching documentaries again?' },
                            { speaker: 'Max', text: 'Ryan! This one is fascinating — it\'s about Drenthe\'s wireless technology pioneers.' },
                            { speaker: 'Max', text: 'They\'re featuring WSRT, LOFAR, and the Ericsson Bluetooth engineers.' },
                            { speaker: 'Ryan', text: 'Wait, LOFAR and WSRT? Those are serious radio astronomy projects.' },
                            { speaker: 'Max', text: 'They interviewed actual engineers! A Dr. David Prinsloo from TU Eindhoven...' },
                            { speaker: 'Max', text: 'A man named Cees Bassa who works with LOFAR and satellite tracking...' },
                            { speaker: 'Max', text: 'And Jaap Haartsen who invented Bluetooth at Ericsson!' },
                            { speaker: 'Ryan', text: '...Those are my contacts. David, Cees, and Jaap.' },
                            { speaker: 'Max', text: 'Really? Your hacker friends are famous engineers? That\'s amazing!' },
                            { speaker: 'Ryan', text: 'They\'re more than friends. They\'re the best signal processing minds in the Netherlands.' },
                            { speaker: 'Max', text: 'You should watch it! The dogs are keeping me company if you want to go to your mancave.' },
                            { speaker: 'Ryan', text: 'I might watch it later. Got some radio work to check first.' }
                        ]);
                    } else {
                        // First meeting but doc already watched — skip to news
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'Hey Max, anything interesting on?' },
                            { speaker: 'Max', text: 'Just switched to the news. RTV Drenthe is covering those strange signal outages across the province.' },
                            { speaker: 'Max', text: 'Mobile networks, GPS, even some weather stations. Nobody knows what\'s causing it.' },
                            { speaker: 'Ryan', text: 'That\'s... not random interference. That\'s directed jamming.' },
                            { speaker: 'Max', text: 'They said the Antennebureau is investigating but have no comment yet.' },
                            { speaker: 'Ryan', text: 'Of course they don\'t. This has someone\'s fingerprints all over it.' }
                        ]);
                    }

                } else if (!docWatched) {
                    // Talked before, doc still not watched — nudge again
                    game.startDialogue([
                        { speaker: 'Max', text: 'The documentary is still on! You really should watch the whole thing.' },
                        { speaker: 'Max', text: 'I had no idea wireless technology from Drenthe was so important globally!' },
                        { speaker: 'Ryan', text: 'Yeah, we\'ve got some brilliant people here. I\'ll sit down and watch it properly.' }
                    ]);

                } else {
                    // Doc watched — talk about the latest news
                    game.startDialogue([
                        { speaker: 'Max', text: 'Did you see the RTV Drenthe news?' },
                        { speaker: 'Ryan', text: 'Not yet. What\'s going on?' },
                        { speaker: 'Max', text: 'More unexplained signal outages. GPS, mobile, even some industrial sensors near Emmen.' },
                        { speaker: 'Max', text: 'The reporter called it "unprecedented interference" but the authorities just say they\'re looking into it.' },
                        { speaker: 'Ryan', text: 'That\'s the same pattern I\'ve been tracking from the mancave. Not natural.' },
                        { speaker: 'Max', text: 'Should I be worried?' },
                        { speaker: 'Ryan', text: 'Not here. But someone out there is making a lot of noise on purpose.' }
                    ]);
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
                        { speaker: 'Max', text: 'They love that spot! Been there all afternoon.' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'Rescue dogs. Both of them. Hard to imagine anyone giving them up.' },
                        { speaker: 'Max', text: 'Remember Tony Knight? The dog whisperer? When he came to Compascuum for the training weekend?' },
                        { speaker: 'Ryan', text: 'Vaguely. That was... two years ago?' },
                        { speaker: 'Max', text: 'Tino was still nervous around strangers back then. Tony worked with him for twenty minutes and he was a different dog.' },
                        { speaker: 'Max', text: 'I met so many lovely people that weekend. Other rescue dog volunteers from all over. Even a German woman... what was her name... Eva, I think.' },
                        { speaker: 'Ryan', text: 'I don\'t remember her.' },
                        { speaker: 'Max', text: 'You talked to her! I introduced you. She was interested in your tech stuff. You showed her the mancave.' },
                        { speaker: 'Ryan', text: '...Really? I have no memory of that at all.' },
                        { speaker: 'Max', text: '*shrugs* You get so absorbed in your projects. A person could walk through your mancave and you\'d forget the next day.' },
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
                        { speaker: 'Max', text: 'The dogs agree with you!' }
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
                        { speaker: 'Max', text: 'He never stops exploring!' }
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
            { id: 'tvnews',        label: 'RTV Drenthe',  desc: 'Regionaal nieuws',             icon: '📺' }
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

            // ── 1. Fireplace base hiss (warm filtered noise, continuous) ──
            var buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var hiss = ctx.createBufferSource(); hiss.buffer = buf; hiss.loop = true;
            var lp1 = ctx.createBiquadFilter(); lp1.type = 'lowpass'; lp1.frequency.value = 900;
            var hp1 = ctx.createBiquadFilter(); hp1.type = 'highpass'; hp1.frequency.value = 180;
            var hG = ctx.createGain(); hG.gain.value = 0.030;
            hiss.connect(lp1); lp1.connect(hp1); hp1.connect(hG); hG.connect(master);
            hiss.start();
            self._audioNodes.push(hiss, lp1, hp1, hG);

            // ── 2. Deep warm fire rumble (LFO breathing) ──
            var rumble = ctx.createOscillator(); rumble.type = 'sine'; rumble.frequency.value = 40;
            var rf = ctx.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 90;
            var lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.12;
            var lfoG = ctx.createGain(); lfoG.gain.value = 0.006;
            lfo.connect(lfoG);
            var rG = ctx.createGain(); rG.gain.value = 0.011;
            lfoG.connect(rG.gain); rumble.connect(rf); rf.connect(rG); rG.connect(master);
            rumble.start(); lfo.start();
            self._audioNodes.push(rumble, rf, rG, lfo, lfoG);

            // ── 3. Crispy fire crackle bursts (random, occasional) ──
            function fireCrackle() {
                if (!self._audioCtx) return;
                var t = ctx.currentTime;
                var pops = 2 + Math.floor(Math.random() * 5); // 2–6 pops per burst
                for (var p = 0; p < pops; p++) {
                    (function(offset) {
                        var noiseLen = 0.010 + Math.random() * 0.030;
                        var nb = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * noiseLen), ctx.sampleRate);
                        var nd = nb.getChannelData(0);
                        for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
                        var ns = ctx.createBufferSource(); ns.buffer = nb;
                        var bpf = ctx.createBiquadFilter(); bpf.type = 'bandpass';
                        bpf.frequency.value = 700 + Math.random() * 1600; bpf.Q.value = 0.4 + Math.random() * 2;
                        var env = ctx.createGain();
                        var st = t + offset;
                        env.gain.setValueAtTime(0, st);
                        env.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.09, st + 0.003);
                        env.gain.exponentialRampToValueAtTime(0.0001, st + noiseLen);
                        ns.connect(bpf); bpf.connect(env); env.connect(master);
                        ns.start(st); ns.stop(st + noiseLen + 0.01);
                        self._audioNodes.push(ns, bpf, env);
                    })(p * (0.035 + Math.random() * 0.11));
                }
                // next burst: 3–13 seconds
                var id = setTimeout(fireCrackle, 3000 + Math.random() * 10000);
                self._audioIntervals.push(id);
            }
            self._audioIntervals.push(setTimeout(fireCrackle, 1200 + Math.random() * 2000));

            // ── 4. Dog snoring (two dogs: Tino + Kessy) ──
            function dogSnore(basePitch, cycleMs, startDelay) {
                var id = setTimeout(function snoreLoop() {
                    if (!self._audioCtx) return;
                    var t = ctx.currentTime;
                    var dur = 0.45 + Math.random() * 0.5;
                    // nasal sawtooth through tight low-pass = convincing snore
                    var osc = ctx.createOscillator(); osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(basePitch * 0.75, t);
                    osc.frequency.linearRampToValueAtTime(basePitch * 1.25, t + dur * 0.55); // inhale rises
                    osc.frequency.linearRampToValueAtTime(basePitch * 0.55, t + dur);        // exhale falls
                    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
                    lp.frequency.value = 260 + Math.random() * 60; lp.Q.value = 3.8;
                    var env = ctx.createGain();
                    env.gain.setValueAtTime(0, t);
                    env.gain.linearRampToValueAtTime(0.038 + Math.random() * 0.018, t + 0.09);
                    env.gain.setValueAtTime(0.034, t + dur * 0.65);
                    env.gain.linearRampToValueAtTime(0, t + dur + 0.1);
                    osc.connect(lp); lp.connect(env); env.connect(master);
                    osc.start(t); osc.stop(t + dur + 0.12);
                    self._audioNodes.push(osc, lp, env);
                    // next breath after gap (+/- variance)
                    var nextId = setTimeout(snoreLoop, cycleMs + (Math.random() * 1400 - 700));
                    self._audioIntervals.push(nextId);
                }, startDelay);
                self._audioIntervals.push(id);
            }
            dogSnore(88,  2900,  900); // Tino  — deeper, slower (bigger white dog)
            dogSnore(115, 2300, 2700); // Kessy — slightly higher, quicker breathing

            // ── 5. Outside birds (nice sunny weather — occasional) ──
            function birdChirp() {
                if (!self._audioCtx) return;
                var t = ctx.currentTime;
                var chirps = 1 + Math.floor(Math.random() * 4);
                for (var c = 0; c < chirps; c++) {
                    (function(ci) {
                        var freq = 2100 + Math.random() * 1900;
                        var len  = 0.04 + Math.random() * 0.10;
                        var st   = t + ci * (0.11 + Math.random() * 0.20);
                        var osc  = ctx.createOscillator(); osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, st);
                        osc.frequency.linearRampToValueAtTime(freq * (1.15 + Math.random() * 0.35), st + len * 0.5);
                        osc.frequency.linearRampToValueAtTime(freq * 0.88, st + len);
                        // light vibrato
                        var vib  = ctx.createOscillator(); vib.type = 'sine';
                        vib.frequency.value = 16 + Math.random() * 10;
                        var vibG = ctx.createGain(); vibG.gain.value = 28;
                        vib.connect(vibG); vibG.connect(osc.frequency);
                        var env  = ctx.createGain();
                        env.gain.setValueAtTime(0, st);
                        env.gain.linearRampToValueAtTime(0.016 + Math.random() * 0.014, st + 0.012);
                        env.gain.linearRampToValueAtTime(0, st + len + 0.025);
                        osc.connect(env); env.connect(master);
                        osc.start(st); osc.stop(st + len + 0.04);
                        vib.start(st); vib.stop(st + len + 0.04);
                        self._audioNodes.push(osc, vib, vibG, env);
                    })(c);
                }
                // next bird: 9–30 seconds
                var id = setTimeout(birdChirp, 9000 + Math.random() * 21000);
                self._audioIntervals.push(id);
            }
            self._audioIntervals.push(setTimeout(birdChirp, 3500 + Math.random() * 5000));

            // ── 6. Dog fart variations (rare comedic events — thanks ET) ──
            var fartTypes = [
                { dur: 0.16, f0: 65,  f1: 48,  vol: 0.048, lpf: 210 }, // quick squeaky toot
                { dur: 0.60, f0: 48,  f1: 28,  vol: 0.060, lpf: 155 }, // long slow rumbler
                { dur: 0.07, f0: 85,  f1: 72,  vol: 0.038, lpf: 195 }, // tiny blip
                { dur: 0.95, f0: 42,  f1: 22,  vol: 0.068, lpf: 138 }, // epic extended fluffer
                { dur: 0.28, f0: 60,  f1: 50,  vol: 0.050, lpf: 182 }, // mid wavering
                { dur: 0.40, f0: 55,  f1: 38,  vol: 0.055, lpf: 165 }, // polite but unmistakable
            ];
            function dogFart() {
                if (!self._audioCtx) return;
                var v = fartTypes[Math.floor(Math.random() * fartTypes.length)];
                var t = ctx.currentTime;
                // noise body
                var nb = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * (v.dur + 0.06)), ctx.sampleRate);
                var nd = nb.getChannelData(0);
                for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
                var ns = ctx.createBufferSource(); ns.buffer = nb;
                var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = v.lpf; lp.Q.value = 4.2;
                // sub-osc for the signature low rumble
                var osc = ctx.createOscillator(); osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(v.f0, t);
                osc.frequency.linearRampToValueAtTime(v.f1, t + v.dur * 0.75);
                osc.frequency.setValueAtTime(v.f1 * 0.65, t + v.dur);
                var lp2 = ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = v.lpf * 0.78;
                var env = ctx.createGain();
                env.gain.setValueAtTime(0, t);
                env.gain.linearRampToValueAtTime(v.vol, t + 0.013);
                // slight wobble mid-fart (authentic dog experience)
                env.gain.setValueAtTime(v.vol * 0.88, t + v.dur * 0.35);
                env.gain.setValueAtTime(v.vol * 1.05, t + v.dur * 0.65);
                env.gain.linearRampToValueAtTime(0, t + v.dur + 0.05);
                ns.connect(lp); lp.connect(env);
                osc.connect(lp2); lp2.connect(env);
                env.connect(master);
                ns.start(t); ns.stop(t + v.dur + 0.07);
                osc.start(t); osc.stop(t + v.dur + 0.07);
                self._audioNodes.push(ns, lp, osc, lp2, env);
                // next fart: 28–95 seconds (they're dogs, not machines)
                var id = setTimeout(dogFart, 28000 + Math.random() * 67000);
                self._audioIntervals.push(id);
            }
            self._audioIntervals.push(setTimeout(dogFart, 22000 + Math.random() * 28000));

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
        
        // Max is drawn directly in the livingroom SVG (sitting on armchair)
        
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
                    { speaker: 'Ryan', text: 'The living room. Max is watching TV.' },
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
                    { speaker: 'Max', text: 'Told you it was good! Your friends are amazing.' },
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
