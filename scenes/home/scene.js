/**
 * Scene: Home (Kitchen)
 * Starting scene - Ryan's farmhouse kitchen in Compascuum
 */

const HomeScene = {
    id: 'home',
    name: 'Home - Kitchen',
    
    // SVG background
    background: 'assets/images/scenes/home.svg',
    
    // Player starting position
    playerStart: { x: 50, y: 85 },
    
    // Random idle thoughts for this scene
    idleThoughts: [
        "Coffee. Now.",
        "Nice and quiet... for once.",
        "This place is a mess.",
        "Another day, another hack.",
        "Check my email... or not.",
        "Canal view never gets old.",
        "Need to call Ies later.",
        "That chair looks comfortable.",
        "Dutch countryside, best countryside.",
        "Morning light hits just right here.",
        "Should probably eat something.",
        "This kitchen's seen better days.",
        "Radio on or off? Decisions.",
        "Peace and quiet. Rare commodity.",
        "Home sweet surveillance-free home.",
        "Neighbors probably think I'm weird.",
        "Living off the grid, sort of.",
        "Old farmhouse charm.",
        "Better here than in the city.",
        "Just me and the signals."
    ],
    
    hotspots: [
        {
            id: 'espresso-machine',
            name: 'Espresso Machine',
            // SVG: translate(1200, 380), rect width=140, height=120
            x: 62.50,
            y: 35.19,
            width: 7.29,
            height: 11.11,
            cursor: 'pointer',
            lookMessage: "My trusty Italian espresso maker. Can't start the day without it.",
            action: function(game) {
                if (game.getFlag('made_espresso')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Already had my double dose. Time to work.' }
                    ]);
                } else {
                    game.setFlag('made_espresso', true);
                    game.setStoryPart(1);
                    // Play coffee machine sound sequence
                    if (HomeScene._playCoffeeMachine) HomeScene._playCoffeeMachine();
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Okay, espresso time. Extra strong, double dose.' },
                        { speaker: '', text: '*The machine whirrs to life, grinding beans... hissing steam... rich aroma fills the kitchen*' },
                        { speaker: 'Ryan', text: 'Perfect. Now I can actually think.' },
                        { speaker: 'Ryan', text: 'I should check what Ies is watching in the living room before heading to my mancave.' }
                    ]);
                    game.advanceTime(15);
                }
            }
        },
        {
            id: 'window',
            name: 'Kitchen Window',
            // SVG: translate(500, 120), outer frame x=-15, y=-15, w=430, h=380
            x: 25.26,
            y: 9.72,
            width: 22.40,
            height: 35.19,
            cursor: 'pointer',
            lookMessage: "The canal looks peaceful today. Such a nice view.",
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The canal is calm today. Peaceful.' },
                    { speaker: 'Ryan', text: 'I can see the road. Quiet as always.' },
                    { speaker: 'Ryan', text: 'That\'s what I love about Compascuum. Nothing ever happens here.' }
                ]);
            }
        },
        {
            id: 'door-livingroom',
            name: 'Door to Living Room',
            // SVG: translate(250, 200), rect x=-10, y=-10, w=180, h=570
            x: 13.02,
            y: 17.59,
            width: 9.38,
            height: 52.78,
            cursor: 'pointer',
            targetScene: 'livingroom'
        },
        {
            id: 'door-mancave',
            name: 'Door to Mancave',
            // SVG: translate(1700, 200), rect x=-10, y=-10, w=180, h=570
            x: 88.02,
            y: 17.59,
            width: 9.38,
            height: 52.78,
            cursor: 'pointer',
            condition: function(game) {
                return game.getFlag('tv_documentary_watched');
            },
            failMessage: 'I should check out that documentary Ies is watching in the living room first. Might learn something useful.',
            targetScene: 'mancave'
        },
        {
            id: 'door-garden',
            name: 'Back Door (Garden)',
            // SVG: translate(50, 200), rect x=-10, y=-10, w=180, h=570
            x: 2.08,
            y: 17.59,
            width: 9.38,
            height: 52.78,
            cursor: 'pointer',
            targetScene: 'garden'
        },
        {
            id: 'clock',
            name: 'Wall Clock',
            // SVG: translate(350, 150), circle r=50
            x: 15.63,
            y: 9.26,
            width: 5.21,
            height: 9.26,
            cursor: 'pointer',
            lookMessage: "An old clock. It's been keeping time for years.",
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: '8:15 AM. Still early.' },
                    { speaker: 'Ryan', text: 'That clock\'s been ticking since I moved in.' }
                ]);
            }
        },
        {
            id: 'counter',
            name: 'Kitchen Counter',
            // SVG: rect x=1050, y=500, width=520, height=250
            x: 54.69,
            y: 46.30,
            width: 27.08,
            height: 23.15,
            cursor: 'pointer',
            lookMessage: "My counter. A bit cluttered, but I know where everything is.",
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My counter. Coffee cups, magazines, bills.' },
                    { speaker: 'Ryan', text: 'Should clean this up... but eh, future Ryan\'s problem.' }
                ]);
            }
        }
    ],
    
    // ======= WEB AUDIO: KITCHEN AMBIENCE + COFFEE MACHINE =======
    _audioCtx: null,
    _audioNodes: [],
    _audioIntervals: [],
    _audioTimeouts: [],

    _getAudioCtx: function() {
        if (!this._audioCtx || this._audioCtx.state === 'closed') {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },

    _startKitchenAmbience: function() {
        try {
            const ctx = this._getAudioCtx();
            const nodes = this._audioNodes;
            const intervals = this._audioIntervals;
            const timeouts = this._audioTimeouts;
            const now = ctx.currentTime;

            // === 1. CLOCK TICKING ===
            const scheduleTick = () => {
                const t = ctx.currentTime;
                // Tick
                const tickBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.02), ctx.sampleRate);
                const tickData = tickBuf.getChannelData(0);
                for (let i = 0; i < tickData.length; i++) {
                    tickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.003));
                }
                const tickSrc = ctx.createBufferSource();
                tickSrc.buffer = tickBuf;
                const tickFilter = ctx.createBiquadFilter();
                tickFilter.type = 'bandpass';
                tickFilter.frequency.setValueAtTime(3500, t);
                tickFilter.Q.setValueAtTime(5, t);
                const tickGain = ctx.createGain();
                tickGain.gain.setValueAtTime(0.025, t);
                tickSrc.connect(tickFilter);
                tickFilter.connect(tickGain);
                tickGain.connect(ctx.destination);
                tickSrc.start(t);
            };
            intervals.push(setInterval(scheduleTick, 1000));

            // === 2. BIRDS OUTSIDE WINDOW (cheerful morning birds) ===
            // Robin song
            const scheduleRobin = () => {
                const t = ctx.currentTime;
                const noteCount = 4 + Math.floor(Math.random() * 4);
                for (let i = 0; i < noteCount; i++) {
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    const freq = 2200 + Math.random() * 1200;
                    osc.frequency.setValueAtTime(freq, t + i * 0.12);
                    osc.frequency.exponentialRampToValueAtTime(freq * (0.85 + Math.random() * 0.3), t + i * 0.12 + 0.08);
                    const g = ctx.createGain();
                    g.gain.setValueAtTime(0, t + i * 0.12);
                    g.gain.linearRampToValueAtTime(0.015, t + i * 0.12 + 0.02);
                    g.gain.linearRampToValueAtTime(0, t + i * 0.12 + 0.1);
                    osc.connect(g);
                    g.connect(ctx.destination);
                    osc.start(t + i * 0.12);
                    osc.stop(t + i * 0.12 + 0.12);
                }
            };
            timeouts.push(setTimeout(() => {
                scheduleRobin();
                intervals.push(setInterval(() => {
                    if (Math.random() < 0.5) scheduleRobin();
                }, 4000 + Math.random() * 5000));
            }, 2000));

            // Sparrow chatter
            const scheduleSparrow = () => {
                const t = ctx.currentTime;
                for (let i = 0; i < 3; i++) {
                    const osc = ctx.createOscillator();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(3800 + Math.random() * 400, t + i * 0.08);
                    const g = ctx.createGain();
                    g.gain.setValueAtTime(0, t + i * 0.08);
                    g.gain.linearRampToValueAtTime(0.01, t + i * 0.08 + 0.02);
                    g.gain.linearRampToValueAtTime(0, t + i * 0.08 + 0.06);
                    osc.connect(g);
                    g.connect(ctx.destination);
                    osc.start(t + i * 0.08);
                    osc.stop(t + i * 0.08 + 0.07);
                }
            };
            intervals.push(setInterval(() => {
                if (Math.random() < 0.4) scheduleSparrow();
            }, 6000 + Math.random() * 6000));

            // === 3. DISTANT DOG BARK (Ryan has dogs) ===
            const scheduleDogBark = () => {
                const t = ctx.currentTime;
                const osc = ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, t);
                osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(500, t);
                filter.Q.setValueAtTime(2, t);
                const g = ctx.createGain();
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.015, t + 0.02);
                g.gain.linearRampToValueAtTime(0, t + 0.1);
                osc.connect(filter);
                filter.connect(g);
                g.connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.12);
            };
            timeouts.push(setTimeout(() => {
                scheduleDogBark();
                intervals.push(setInterval(() => {
                    if (Math.random() < 0.25) scheduleDogBark();
                }, 15000 + Math.random() * 20000));
            }, 8000));

            // === 4. FRIDGE HUM (low continuous drone) ===
            const fridgeOsc = ctx.createOscillator();
            fridgeOsc.type = 'sine';
            fridgeOsc.frequency.setValueAtTime(120, now);
            const fridgeGain = ctx.createGain();
            fridgeGain.gain.setValueAtTime(0, now);
            fridgeGain.gain.linearRampToValueAtTime(0.008, now + 2);
            const fridgeFilter = ctx.createBiquadFilter();
            fridgeFilter.type = 'lowpass';
            fridgeFilter.frequency.setValueAtTime(180, now);
            fridgeOsc.connect(fridgeFilter);
            fridgeFilter.connect(fridgeGain);
            fridgeGain.connect(ctx.destination);
            fridgeOsc.start(now);
            nodes.push(fridgeOsc, fridgeGain, fridgeFilter);

            // === 5. WATER DRIP FROM SINK (occasional) ===
            const scheduleDrip = () => {
                const t = ctx.currentTime;
                const dOsc = ctx.createOscillator();
                dOsc.type = 'sine';
                dOsc.frequency.setValueAtTime(1800, t);
                dOsc.frequency.exponentialRampToValueAtTime(600, t + 0.04);
                const dG = ctx.createGain();
                dG.gain.setValueAtTime(0.012, t);
                dG.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                dOsc.connect(dG);
                dG.connect(ctx.destination);
                dOsc.start(t);
                dOsc.stop(t + 0.2);
            };
            intervals.push(setInterval(() => {
                if (Math.random() < 0.35) scheduleDrip();
            }, 4000 + Math.random() * 4000));

            console.log('[Home] Kitchen ambience started');
        } catch (e) {
            console.warn('[Home] Ambience failed:', e);
        }
    },

    // Coffee machine sound sequence (~12 seconds)
    _playCoffeeMachine: function() {
        try {
            const ctx = HomeScene._getAudioCtx();
            const now = ctx.currentTime;

            // Phase 1: BUTTON CLICK (t=0)
            const clickBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.015), ctx.sampleRate);
            const clickData = clickBuf.getChannelData(0);
            for (let i = 0; i < clickData.length; i++) {
                clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.002));
            }
            const clickSrc = ctx.createBufferSource();
            clickSrc.buffer = clickBuf;
            const clickGain = ctx.createGain();
            clickGain.gain.setValueAtTime(0.06, now);
            const clickFilter = ctx.createBiquadFilter();
            clickFilter.type = 'highpass';
            clickFilter.frequency.setValueAtTime(2000, now);
            clickSrc.connect(clickFilter);
            clickFilter.connect(clickGain);
            clickGain.connect(ctx.destination);
            clickSrc.start(now);

            // Phase 2: PUMP WHIRRING (t=0.3, ~2s) — motor starting up
            const pumpOsc = ctx.createOscillator();
            pumpOsc.type = 'sawtooth';
            pumpOsc.frequency.setValueAtTime(60, now + 0.3);
            pumpOsc.frequency.linearRampToValueAtTime(180, now + 1.5);
            pumpOsc.frequency.setValueAtTime(180, now + 2.3);
            const pumpFilter = ctx.createBiquadFilter();
            pumpFilter.type = 'bandpass';
            pumpFilter.frequency.setValueAtTime(300, now + 0.3);
            pumpFilter.Q.setValueAtTime(2, now + 0.3);
            const pumpGain = ctx.createGain();
            pumpGain.gain.setValueAtTime(0, now + 0.3);
            pumpGain.gain.linearRampToValueAtTime(0.04, now + 0.8);
            pumpGain.gain.setValueAtTime(0.04, now + 2.0);
            pumpGain.gain.linearRampToValueAtTime(0, now + 2.5);
            pumpOsc.connect(pumpFilter);
            pumpFilter.connect(pumpGain);
            pumpGain.connect(ctx.destination);
            pumpOsc.start(now + 0.3);
            pumpOsc.stop(now + 2.6);

            // Phase 3: GRINDING BEANS (t=2.5, ~3s) — harsh noise
            const grindBufSize = Math.floor(ctx.sampleRate * 3);
            const grindBuf = ctx.createBuffer(1, grindBufSize, ctx.sampleRate);
            const grindData = grindBuf.getChannelData(0);
            for (let i = 0; i < grindBufSize; i++) {
                grindData[i] = (Math.random() * 2 - 1) * (0.7 + 0.3 * Math.sin(i / 80));
            }
            const grindSrc = ctx.createBufferSource();
            grindSrc.buffer = grindBuf;
            const grindFilter = ctx.createBiquadFilter();
            grindFilter.type = 'bandpass';
            grindFilter.frequency.setValueAtTime(800, now + 2.5);
            grindFilter.Q.setValueAtTime(1.5, now + 2.5);
            // Grind frequency sweeping (beans getting finer)
            grindFilter.frequency.linearRampToValueAtTime(1200, now + 4.5);
            grindFilter.frequency.linearRampToValueAtTime(1500, now + 5.5);
            const grindGain = ctx.createGain();
            grindGain.gain.setValueAtTime(0, now + 2.5);
            grindGain.gain.linearRampToValueAtTime(0.05, now + 3.0);
            grindGain.gain.setValueAtTime(0.05, now + 5.0);
            grindGain.gain.linearRampToValueAtTime(0, now + 5.5);
            grindSrc.connect(grindFilter);
            grindFilter.connect(grindGain);
            grindGain.connect(ctx.destination);
            grindSrc.start(now + 2.5);
            grindSrc.stop(now + 5.6);

            // Grind vibration undertone
            const grindVib = ctx.createOscillator();
            grindVib.type = 'square';
            grindVib.frequency.setValueAtTime(45, now + 2.5);
            const grindVibGain = ctx.createGain();
            grindVibGain.gain.setValueAtTime(0, now + 2.5);
            grindVibGain.gain.linearRampToValueAtTime(0.02, now + 3.0);
            grindVibGain.gain.setValueAtTime(0.02, now + 5.0);
            grindVibGain.gain.linearRampToValueAtTime(0, now + 5.5);
            const grindVibFilter = ctx.createBiquadFilter();
            grindVibFilter.type = 'lowpass';
            grindVibFilter.frequency.setValueAtTime(100, now + 2.5);
            grindVib.connect(grindVibFilter);
            grindVibFilter.connect(grindVibGain);
            grindVibGain.connect(ctx.destination);
            grindVib.start(now + 2.5);
            grindVib.stop(now + 5.6);

            // Phase 4: PRESSURISED BREWING (t=5.8, ~3s) — hissing steam
            const brewBufSize = Math.floor(ctx.sampleRate * 3.5);
            const brewBuf = ctx.createBuffer(1, brewBufSize, ctx.sampleRate);
            const brewData = brewBuf.getChannelData(0);
            for (let i = 0; i < brewBufSize; i++) {
                brewData[i] = (Math.random() * 2 - 1);
            }
            const brewSrc = ctx.createBufferSource();
            brewSrc.buffer = brewBuf;
            const brewFilter = ctx.createBiquadFilter();
            brewFilter.type = 'highpass';
            brewFilter.frequency.setValueAtTime(3000, now + 5.8);
            const brewFilter2 = ctx.createBiquadFilter();
            brewFilter2.type = 'bandpass';
            brewFilter2.frequency.setValueAtTime(6000, now + 5.8);
            brewFilter2.Q.setValueAtTime(2, now + 5.8);
            const brewGain = ctx.createGain();
            brewGain.gain.setValueAtTime(0, now + 5.8);
            brewGain.gain.linearRampToValueAtTime(0.03, now + 6.3);
            brewGain.gain.setValueAtTime(0.035, now + 7.5);
            brewGain.gain.linearRampToValueAtTime(0.04, now + 8.0);
            brewGain.gain.linearRampToValueAtTime(0, now + 9.3);
            brewSrc.connect(brewFilter);
            brewFilter.connect(brewFilter2);
            brewFilter2.connect(brewGain);
            brewGain.connect(ctx.destination);
            brewSrc.start(now + 5.8);
            brewSrc.stop(now + 9.4);

            // Pressure build undertone
            const pressOsc = ctx.createOscillator();
            pressOsc.type = 'sine';
            pressOsc.frequency.setValueAtTime(200, now + 5.8);
            pressOsc.frequency.linearRampToValueAtTime(350, now + 8.0);
            const pressGain = ctx.createGain();
            pressGain.gain.setValueAtTime(0, now + 5.8);
            pressGain.gain.linearRampToValueAtTime(0.015, now + 6.5);
            pressGain.gain.setValueAtTime(0.015, now + 8.0);
            pressGain.gain.linearRampToValueAtTime(0, now + 9.3);
            pressOsc.connect(pressGain);
            pressGain.connect(ctx.destination);
            pressOsc.start(now + 5.8);
            pressOsc.stop(now + 9.4);

            // Phase 5: DRIPPING / POURING (t=9.5, ~2.5s) — coffee into cup
            const dripStart = now + 9.5;
            for (let d = 0; d < 15; d++) {
                const dt = dripStart + d * 0.15 + Math.random() * 0.05;
                const dripOsc = ctx.createOscillator();
                dripOsc.type = 'sine';
                dripOsc.frequency.setValueAtTime(1400 + Math.random() * 400, dt);
                dripOsc.frequency.exponentialRampToValueAtTime(500 + Math.random() * 200, dt + 0.06);
                const dripGain = ctx.createGain();
                dripGain.gain.setValueAtTime(0.02 + Math.random() * 0.01, dt);
                dripGain.gain.exponentialRampToValueAtTime(0.001, dt + 0.12);
                dripOsc.connect(dripGain);
                dripGain.connect(ctx.destination);
                dripOsc.start(dt);
                dripOsc.stop(dt + 0.15);
            }

            // Phase 6: FINAL STEAM BURST (t=12, ~0.5s)
            const steamBufSize = Math.floor(ctx.sampleRate * 0.8);
            const steamBuf = ctx.createBuffer(1, steamBufSize, ctx.sampleRate);
            const steamData = steamBuf.getChannelData(0);
            for (let i = 0; i < steamBufSize; i++) {
                steamData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.2));
            }
            const steamSrc = ctx.createBufferSource();
            steamSrc.buffer = steamBuf;
            const steamFilter = ctx.createBiquadFilter();
            steamFilter.type = 'highpass';
            steamFilter.frequency.setValueAtTime(4000, now + 12);
            const steamGain = ctx.createGain();
            steamGain.gain.setValueAtTime(0.04, now + 12);
            steamGain.gain.linearRampToValueAtTime(0, now + 12.8);
            steamSrc.connect(steamFilter);
            steamFilter.connect(steamGain);
            steamGain.connect(ctx.destination);
            steamSrc.start(now + 12);

            // Phase 7: MACHINE DONE BEEP (t=12.5)
            const beepOsc = ctx.createOscillator();
            beepOsc.type = 'sine';
            beepOsc.frequency.setValueAtTime(1200, now + 12.5);
            const beepGain = ctx.createGain();
            beepGain.gain.setValueAtTime(0, now + 12.5);
            beepGain.gain.linearRampToValueAtTime(0.04, now + 12.55);
            beepGain.gain.setValueAtTime(0.04, now + 12.7);
            beepGain.gain.linearRampToValueAtTime(0, now + 12.75);
            // Second beep
            beepGain.gain.linearRampToValueAtTime(0.04, now + 12.95);
            beepGain.gain.setValueAtTime(0.04, now + 13.1);
            beepGain.gain.linearRampToValueAtTime(0, now + 13.15);
            beepOsc.connect(beepGain);
            beepGain.connect(ctx.destination);
            beepOsc.start(now + 12.5);
            beepOsc.stop(now + 13.2);

            console.log('[Home] Coffee machine sequence started (13s)');
        } catch (e) {
            console.warn('[Home] Coffee machine audio failed:', e);
        }
    },

    _stopKitchenAudio: function() {
        this._audioIntervals.forEach(id => clearInterval(id));
        this._audioIntervals = [];
        this._audioTimeouts.forEach(id => clearTimeout(id));
        this._audioTimeouts = [];
        this._audioNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) {}
        });
        this._audioNodes = [];
        if (this._audioCtx && this._audioCtx.state !== 'closed') {
            this._audioCtx.close().catch(() => {});
            this._audioCtx = null;
        }
        console.log('[Home] Kitchen audio stopped');
    },

    onEnter: function(game) {
        // Remove any existing NPC characters from previous scenes
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            const npcCharacters = charactersContainer.querySelectorAll('.npc-character');
            npcCharacters.forEach(npc => npc.remove());
        }
        
        // First time entering the game
        if (!game.getFlag('game_started')) {
            game.setFlag('game_started', true);
            game.showNotification('Welcome to CyberQuest');
            
            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: 'Compascuum, Netherlands. Another morning.' },
                    { speaker: '', text: 'Ryan Weylant, hacker. Age 55. Lives with Ies and three rescue dogs.' },
                    { speaker: 'Ryan', text: 'Coffee. Need coffee.' }
                ]);
            }, 1000);
        }
        
        // Guide player after returning from klooster with USB
        if (game.hasItem('usb_stick') && !game.getFlag('usb_analyzed')) {
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Home. Time to check that USB stick.' },
                    { speaker: 'Ryan', text: 'The air-gapped laptop in the mancave. No network, no risk.' }
                ]);
                setTimeout(() => {
                    game.showNotification('Head to the mancave — use the air-gapped laptop');
                }, 2000);
            }, 800);
        }

        // Update scene background with CSS class
        document.getElementById('scene-background').className = 'scene-home';

        // Start ambient kitchen sounds
        HomeScene._startKitchenAmbience();
    },
    
    onExit: function() {
        // Remove any NPC characters when leaving home scene
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            const npcCharacters = charactersContainer.querySelectorAll('.npc-character');
            npcCharacters.forEach(npc => npc.remove());
        }
        // Stop all kitchen audio
        HomeScene._stopKitchenAudio();
    }
};

// Register scene when loaded
if (window.game) {
    window.game.registerScene('home', HomeScene);
}

// Export for module systems
if (typeof module !== 'undefined') {
    module.exports = HomeScene;
}
