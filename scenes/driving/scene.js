/**
 * Driving Scene - Volvo Interior
 * Transition scene for late-night drives with internal monologue
 */

const DrivingScene = {
    id: 'driving',
    name: 'Volvo - Night Drive',
    
    background: 'assets/images/scenes/driving.svg',
    
    description: 'Driving through the dark countryside. The dashboard glow, the hum of the engine, and racing thoughts.',
    
    // No player position - this is a cinematic scene
    playerStart: { x: 50, y: 50 },
    
    // No hotspots - this is pure dialogue/transition
    hotspots: [],
    
    // Store timeout IDs for cleanup
    _timeoutIds: [],

    // ======= WEB AUDIO: CAR RADIO + DRIVING AMBIENCE =======
    _audioCtx: null,
    _audioNodes: [],
    _audioIntervals: [],
    _radioGain: null,

    _getAudioCtx: function() {
        if (!this._audioCtx || this._audioCtx.state === 'closed') {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },

    _startDrivingAudio: function() {
        try {
            const ctx = this._getAudioCtx();
            const nodes = this._audioNodes;
            const now = ctx.currentTime;

            // ===== ENGINE HUM (separate from radio) =====
            const engineOsc = ctx.createOscillator();
            engineOsc.type = 'sawtooth';
            engineOsc.frequency.setValueAtTime(82, now);
            // Slight RPM variation
            const engineLfo = ctx.createOscillator();
            engineLfo.type = 'sine';
            engineLfo.frequency.setValueAtTime(0.3, now);
            const engineLfoGain = ctx.createGain();
            engineLfoGain.gain.setValueAtTime(4, now);
            engineLfo.connect(engineLfoGain);
            engineLfoGain.connect(engineOsc.frequency);
            engineLfo.start(now);
            const engineFilter = ctx.createBiquadFilter();
            engineFilter.type = 'lowpass';
            engineFilter.frequency.setValueAtTime(150, now);
            const engineGain = ctx.createGain();
            engineGain.gain.setValueAtTime(0, now);
            engineGain.gain.linearRampToValueAtTime(0.035, now + 2);
            engineOsc.connect(engineFilter);
            engineFilter.connect(engineGain);
            engineGain.connect(ctx.destination);
            engineOsc.start(now);
            nodes.push(engineOsc, engineLfo, engineLfoGain, engineFilter, engineGain);

            // Second harmonic for engine depth
            const engine2 = ctx.createOscillator();
            engine2.type = 'triangle';
            engine2.frequency.setValueAtTime(164, now);
            const engine2Gain = ctx.createGain();
            engine2Gain.gain.setValueAtTime(0, now);
            engine2Gain.gain.linearRampToValueAtTime(0.012, now + 2);
            const engine2Filter = ctx.createBiquadFilter();
            engine2Filter.type = 'lowpass';
            engine2Filter.frequency.setValueAtTime(250, now);
            engine2.connect(engine2Filter);
            engine2Filter.connect(engine2Gain);
            engine2Gain.connect(ctx.destination);
            engine2.start(now);
            nodes.push(engine2, engine2Gain, engine2Filter);

            // ===== ROAD/TYRE NOISE =====
            const roadBufSize = ctx.sampleRate * 2;
            const roadBuf = ctx.createBuffer(1, roadBufSize, ctx.sampleRate);
            const roadData = roadBuf.getChannelData(0);
            for (let i = 0; i < roadBufSize; i++) roadData[i] = Math.random() * 2 - 1;
            const roadSrc = ctx.createBufferSource();
            roadSrc.buffer = roadBuf;
            roadSrc.loop = true;
            const roadFilter = ctx.createBiquadFilter();
            roadFilter.type = 'bandpass';
            roadFilter.frequency.setValueAtTime(250, now);
            roadFilter.Q.setValueAtTime(0.5, now);
            const roadGain = ctx.createGain();
            roadGain.gain.setValueAtTime(0, now);
            roadGain.gain.linearRampToValueAtTime(0.02, now + 2);
            roadSrc.connect(roadFilter);
            roadFilter.connect(roadGain);
            roadGain.connect(ctx.destination);
            roadSrc.start(now);
            nodes.push(roadSrc, roadFilter, roadGain);

            // ===== CAR RADIO OUTPUT CHAIN =====
            // Everything goes: source → radioFilter → radioGain → destination
            // Bandpass simulates tinny car speakers
            const radioFilter = ctx.createBiquadFilter();
            radioFilter.type = 'bandpass';
            radioFilter.frequency.setValueAtTime(1800, now);
            radioFilter.Q.setValueAtTime(0.7, now);
            const radioGain = ctx.createGain();
            radioGain.gain.setValueAtTime(0, now);
            radioGain.gain.linearRampToValueAtTime(0.18, now + 3); // fade in after engine starts
            radioFilter.connect(radioGain);
            radioGain.connect(ctx.destination);
            this._radioGain = radioGain;
            nodes.push(radioFilter, radioGain);

            // Radio static/hiss
            const hissBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            const hissData = hissBuf.getChannelData(0);
            for (let i = 0; i < hissData.length; i++) hissData[i] = Math.random() * 2 - 1;
            const hissSrc = ctx.createBufferSource();
            hissSrc.buffer = hissBuf;
            hissSrc.loop = true;
            const hissFilter = ctx.createBiquadFilter();
            hissFilter.type = 'highpass';
            hissFilter.frequency.setValueAtTime(4000, now);
            const hissGain = ctx.createGain();
            hissGain.gain.setValueAtTime(0.005, now);
            hissSrc.connect(hissFilter);
            hissFilter.connect(hissGain);
            hissGain.connect(radioGain);
            hissSrc.start(now);
            nodes.push(hissSrc, hissFilter, hissGain);

            // ===== RADIO TUNING SWEEP (first 1.5s) =====
            const tuneOsc = ctx.createOscillator();
            tuneOsc.type = 'sine';
            tuneOsc.frequency.setValueAtTime(400, now);
            tuneOsc.frequency.exponentialRampToValueAtTime(2500, now + 0.5);
            tuneOsc.frequency.exponentialRampToValueAtTime(800, now + 1.0);
            tuneOsc.frequency.exponentialRampToValueAtTime(1200, now + 1.3);
            const tuneGain = ctx.createGain();
            tuneGain.gain.setValueAtTime(0, now);
            tuneGain.gain.linearRampToValueAtTime(0.06, now + 0.1);
            tuneGain.gain.setValueAtTime(0.04, now + 1.0);
            tuneGain.gain.linearRampToValueAtTime(0, now + 1.5);
            tuneOsc.connect(tuneGain);
            tuneGain.connect(radioGain);
            tuneOsc.start(now);
            tuneOsc.stop(now + 1.6);

            // ===== "NEVER GONNA GIVE YOU UP" - RICK ASTLEY =====
            // Key: Ab major, Tempo: 113 BPM
            const BPM = 113;
            const beatDur = 60 / BPM;       // ~0.531s
            const eighth = beatDur / 2;      // ~0.265s

            // Note frequencies (Ab major)
            const Ab4 = 415.30, Bb4 = 466.16, Db5 = 554.37, Eb5 = 622.25;
            // Bass
            const Ab2 = 103.83, Bb2 = 116.54, F2 = 87.31, Db3 = 138.59;

            // Melody: [freq, startEighth, durationEighths] (0 = rest)
            const melodySeq = [
                // Intro riff (iconic synth line, 2 bars)
                [Ab4,0,1.5],[Bb4,1.5,1],[Db5,2.5,1.5],[Ab4,4,1.5],
                [0,5.5,0.5],
                [Db5,6,1.5],[Db5,7.5,1.5],[Bb4,9,2],[0,11,1],
                [Ab4,12,1],[Bb4,13,1],[Ab4,14,0.5],[Bb4,14.5,0.5],[Db5,15,2],
                [0,17,1],[Bb4,18,1.5],[Ab4,19.5,1.5],[0,21,1],

                // "Never gonna give you up" (bars 3-4)
                [Ab4,22,1.5],[Bb4,23.5,1],[Db5,24.5,1.5],[Ab4,26,1.5],
                [0,27.5,0.5],
                [Db5,28,1.5],[Db5,29.5,1.5],[Bb4,31,2],[0,33,1],

                // "Never gonna let you down" (bars 5-6)
                [Ab4,34,1.5],[Bb4,35.5,1],[Db5,36.5,1.5],[Ab4,38,1.5],
                [0,39.5,0.5],
                [Eb5,40,1.5],[Db5,41.5,1.5],[Bb4,43,2],[0,45,1],

                // "Never gonna run around and desert you" (bars 7-8)
                [Ab4,46,1.5],[Bb4,47.5,1],[Db5,48.5,1.5],[Ab4,50,1],
                [Eb5,51,1],[Eb5,52,1],[Db5,53,1],[Bb4,54,1],
                [Ab4,55,2],[0,57,1],

                // "Never gonna make you cry" (bars 9-10)
                [Ab4,58,1.5],[Bb4,59.5,1],[Db5,60.5,1.5],[Ab4,62,1.5],
                [0,63.5,0.5],
                [Db5,64,1.5],[Db5,65.5,1.5],[Bb4,67,1],[Ab4,68,1.5],
                [0,69.5,0.5],

                // "Never gonna say goodbye" (bars 11-12)
                [Ab4,70,1.5],[Bb4,71.5,1],[Db5,72.5,1.5],[Ab4,74,1.5],
                [0,75.5,0.5],
                [Eb5,76,1.5],[Db5,77.5,1.5],[Bb4,79,2],[0,81,1],

                // "Never gonna tell a lie and hurt you" (bars 13-14)
                [Ab4,82,1.5],[Bb4,83.5,1],[Db5,84.5,1.5],[Ab4,86,1],
                [Eb5,87,1],[Eb5,88,1],[Db5,89,1],[Bb4,90,1],
                [Ab4,91,2.5],[0,93.5,2.5],
            ];

            // Bass: [freq, startEighth, durationEighths]
            const bassSeq = [];
            const bassPattern = [Ab2, Bb2, F2, Db3]; // I-II-vi-IV in Ab
            for (let bar = 0; bar < 12; bar++) {
                const startE = bar * 8;
                const note = bassPattern[bar % 4];
                bassSeq.push([note, startE, 7.5]);
            }

            const loopEighths = 96;
            const loopDur = loopEighths * eighth;
            const musicStart = now + 2; // start after radio tuning

            // Schedule function for one loop
            const scheduleLoop = (startTime) => {
                // --- Melody ---
                melodySeq.forEach(([freq, startE, durE]) => {
                    if (freq === 0) return;
                    const noteOn = startTime + startE * eighth;
                    const noteOff = noteOn + durE * eighth;

                    const osc = ctx.createOscillator();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(freq, noteOn);

                    // Vibrato for 80s synth warmth
                    const vib = ctx.createOscillator();
                    const vibG = ctx.createGain();
                    vib.type = 'sine';
                    vib.frequency.setValueAtTime(5.5, noteOn);
                    vibG.gain.setValueAtTime(3, noteOn);
                    vib.connect(vibG);
                    vibG.connect(osc.frequency);
                    vib.start(noteOn);
                    vib.stop(noteOff + 0.05);

                    const nGain = ctx.createGain();
                    nGain.gain.setValueAtTime(0, noteOn);
                    nGain.gain.linearRampToValueAtTime(0.11, noteOn + 0.015);
                    nGain.gain.setValueAtTime(0.09, noteOff - 0.02);
                    nGain.gain.linearRampToValueAtTime(0, noteOff);

                    osc.connect(nGain);
                    nGain.connect(radioFilter);
                    osc.start(noteOn);
                    osc.stop(noteOff + 0.02);
                });

                // --- Bass ---
                bassSeq.forEach(([freq, startE, durE]) => {
                    if (freq === 0) return;
                    const noteOn = startTime + startE * eighth;
                    const noteOff = noteOn + durE * eighth;

                    const osc = ctx.createOscillator();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, noteOn);
                    const nGain = ctx.createGain();
                    nGain.gain.setValueAtTime(0, noteOn);
                    nGain.gain.linearRampToValueAtTime(0.07, noteOn + 0.03);
                    nGain.gain.setValueAtTime(0.055, noteOff - 0.04);
                    nGain.gain.linearRampToValueAtTime(0, noteOff);
                    osc.connect(nGain);
                    nGain.connect(radioFilter);
                    osc.start(noteOn);
                    osc.stop(noteOff + 0.02);
                });

                // --- Kick drum on beats 1 and 3 (every 4 eighths) ---
                for (let e = 0; e < loopEighths; e += 4) {
                    const kTime = startTime + e * eighth;
                    const kOsc = ctx.createOscillator();
                    kOsc.type = 'sine';
                    kOsc.frequency.setValueAtTime(150, kTime);
                    kOsc.frequency.exponentialRampToValueAtTime(35, kTime + 0.12);
                    const kGain = ctx.createGain();
                    kGain.gain.setValueAtTime(0.1, kTime);
                    kGain.gain.exponentialRampToValueAtTime(0.001, kTime + 0.18);
                    kOsc.connect(kGain);
                    kGain.connect(radioFilter);
                    kOsc.start(kTime);
                    kOsc.stop(kTime + 0.2);
                }

                // --- Snare on beats 2 and 4 (offset by 2 eighths) ---
                for (let e = 2; e < loopEighths; e += 4) {
                    const sTime = startTime + e * eighth;
                    const sBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
                    const sData = sBuf.getChannelData(0);
                    for (let i = 0; i < sData.length; i++) {
                        sData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
                    }
                    const sSrc = ctx.createBufferSource();
                    sSrc.buffer = sBuf;
                    const sGain = ctx.createGain();
                    sGain.gain.setValueAtTime(0.06, sTime);
                    const sFilter = ctx.createBiquadFilter();
                    sFilter.type = 'bandpass';
                    sFilter.frequency.setValueAtTime(3000, sTime);
                    sFilter.Q.setValueAtTime(1, sTime);
                    sSrc.connect(sFilter);
                    sFilter.connect(sGain);
                    sGain.connect(radioFilter);
                    sSrc.start(sTime);
                }
            };

            // Pre-schedule 3 loops (~38s total - plenty for any driving scene)
            for (let i = 0; i < 3; i++) {
                scheduleLoop(musicStart + i * loopDur);
            }

            console.log('[Driving] Car radio started: Never Gonna Give You Up - Rick Astley');
        } catch (e) {
            console.warn('[Driving] Audio failed:', e);
        }
    },

    _stopDrivingAudio: function() {
        // Mute radio immediately
        if (this._radioGain) {
            try { this._radioGain.gain.setValueAtTime(0, this._audioCtx.currentTime); } catch(e) {}
            this._radioGain = null;
        }
        this._audioIntervals.forEach(id => clearInterval(id));
        this._audioIntervals = [];
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
        console.log('[Driving] Car radio stopped');
    },

    // Scene entry - determines which monologue to play
    onEnter: function(gameInstance) {
        const g = gameInstance || window.game;
        const destination = g.getFlag('driving_destination');
        
        console.log('Driving scene entered. Destination:', destination);
        
        // Clear any previous timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        // Start car radio + engine ambience
        this._startDrivingAudio();
        
        if (destination === 'klooster') {
            // Drive TO klooster - anxious, uncertain
            const timeoutId1 = setTimeout(() => {
                g.startDialogue([
                    { speaker: '', text: '*The Volvo rumbles through the darkness*' },
                    { speaker: 'Ryan', text: 'Ter Apel. 20 minutes. Maybe less at this hour.' },
                    { speaker: 'Ryan', text: 'Empty road. Good. Don\'t want anyone seeing me.' },
                    { speaker: '', text: '*Passes a dark farmhouse. A dog barks in the distance*' },
                    { speaker: 'Ryan', text: 'What am I doing? Meeting anonymous contacts at a monastery at midnight?' },
                    { speaker: 'Ryan', text: 'This is insane. This is how people disappear.' },
                    { speaker: '', text: '*The dashboard clock glows: 22:47*' },
                    { speaker: 'Ryan', text: 'But those signals. Those messages. They KNEW my equipment.' },
                    { speaker: 'Ryan', text: 'They knew I\'d decode SSTV. Knew I\'d understand.' },
                    { speaker: 'Ryan', text: 'This is big. Military frequencies. Encrypted transmissions.' },
                    { speaker: '', text: '*Approaches the monastery - silhouette against moonlight*' },
                    { speaker: 'Ryan', text: 'There it is. Ter Apel Klooster.' },
                    { speaker: 'Ryan', text: 'Centuries old. Perfect for secrets.' },
                    { speaker: 'Ryan', text: 'Let\'s see what this is about.' }
                ]);
                
                // After dialogue, transition to klooster
                const timeoutId2 = setTimeout(() => {
                    g.advanceTime(20);
                    g.setStoryPart(7);
                    g.loadScene('klooster');
                }, 16000); // ~16 seconds for dialogue
                this._timeoutIds.push(timeoutId2);
            }, 1000);
            this._timeoutIds.push(timeoutId1);
            
        } else if (destination === 'facility') {
            // Drive TO facility - infiltration night with border crossing
            const timeoutId1 = setTimeout(() => {
                g.startDialogue([
                    { speaker: '', text: '*11 PM. The Volvo cuts through darkness toward Germany*' },
                    { speaker: 'Ryan', text: 'This is it. The real thing.' },
                    { speaker: 'Ryan', text: 'Not monitoring signals. Not decoding messages. Actually infiltrating.' },
                    { speaker: '', text: '*Approaches the Dutch-German border. No checkpoint, no guards. Schengen.*' },
                    { speaker: 'Ryan', text: 'Welcome to Germany. Bundesrepublik Deutschland.' },
                    { speaker: 'Ryan', text: 'Funny how you can cross into another country without anyone noticing.' },
                    { speaker: 'Ryan', text: 'But go 10 kilometers further, and you hit military fencing.' },
                    { speaker: '', text: '*German road signs appear. Steckerdoser Heide: 8 km*' },
                    { speaker: 'Ryan', text: 'Eva said north entrance. Badge under trash bin.' },
                    { speaker: 'Ryan', text: 'If she\'s wrong. If this is a trap...' },
                    { speaker: 'Ryan', text: 'No. She\'s risking as much as me. More, even.' },
                    { speaker: '', text: '*Red lights appear through the trees. Guard tower. Radar arrays.*' },
                    { speaker: 'Ryan', text: 'There it is. Bundeswehr research facility.' },
                    { speaker: 'Ryan', text: 'Looks like something from a Cold War film. Because it IS.' },
                    { speaker: 'Ryan', text: 'Focus. Stay calm. You\'ve planned for this.' },
                    { speaker: '', text: '*Pulls off main road. Parks in shadows near perimeter.*' },
                    { speaker: 'Ryan', text: 'First: find that badge. Then we see what happens.' },
                    { speaker: 'Ryan', text: 'For Klaus Weber. For everyone Volkov has hurt.' },
                    { speaker: 'Ryan', text: 'Let\'s end this.' }
                ]);
                
                // After dialogue, transition to facility
                const timeoutId2 = setTimeout(() => {
                    g.advanceTime(25);
                    g.setStoryPart(17);
                    g.loadScene('facility');
                }, 17000); // ~17 seconds for dialogue
                this._timeoutIds.push(timeoutId2);
            }, 1000);
            this._timeoutIds.push(timeoutId1);
            
        } else if (destination === 'home') {
            // Drive FROM klooster - processing what just happened
            const timeoutId1 = setTimeout(() => {
                g.startDialogue([
                    { speaker: '', text: '*Engine starts. Headlights illuminate the parking lot*' },
                    { speaker: 'Ryan', text: 'Someone was watching. The whole time.' },
                    { speaker: 'Ryan', text: 'Watched me walk in. Search the courtyard. Get frustrated.' },
                    { speaker: '', text: '*Pulls onto the empty road*' },
                    { speaker: 'Ryan', text: 'Never meant to meet face to face.' },
                    { speaker: 'Ryan', text: 'This USB stick. "TRUST THE PROCESS - AIR-GAPPED ONLY"' },
                    { speaker: 'Ryan', text: 'They know operational security. They know MY setup.' },
                    { speaker: '', text: '*The countryside passes in darkness*' },
                    { speaker: 'Ryan', text: 'Who is "E"? Inside the facility? Outside?' },
                    { speaker: 'Ryan', text: 'Why me? Random hacker in rural Drenthe?' },
                    { speaker: 'Ryan', text: 'Unless... I\'m NOT random.' },
                    { speaker: '', text: '*Dashboard clock: 23:37*' },
                    { speaker: 'Ryan', text: 'They scanned my equipment. Identified my capabilities.' },
                    { speaker: 'Ryan', text: 'They chose me because I\'m OUTSIDE the system.' },
                    { speaker: 'Ryan', text: 'Can\'t be controlled. Can\'t be silenced easily.' },
                    { speaker: '', text: '*Approaches home - familiar darkness*' },
                    { speaker: 'Ryan', text: 'Time to plug this in. See what\'s worth all this cloak and dagger.' },
                    { speaker: 'Ryan', text: 'Air-gapped laptop. Isolated. Safe.' },
                    { speaker: 'Ryan', text: 'Let\'s see what "E" wants me to know.' }
                ]);
                
                // After dialogue, transition to mancave
                const timeoutId2 = setTimeout(() => {
                    g.advanceTime(25);
                    g.loadScene('mancave');
                    g.showNotification('Returned to mancave');
                }, 18000); // ~18 seconds for dialogue
                this._timeoutIds.push(timeoutId2);
            }, 1000);
            this._timeoutIds.push(timeoutId1);
        } else if (destination === 'astron') {
            // Drive TO WSRT - Compascuum → Westerbork (~40 min)
            const timeoutId1 = setTimeout(() => {
                g.startDialogue([
                    { speaker: '', text: '*Afternoon sun. The Volvo heads south-west on the N34*' },
                    { speaker: 'Ryan', text: 'Westerbork. Forty minutes, give or take.' },
                    { speaker: 'Ryan', text: 'Cees Bassa. Satellite tracker, amateur astronomer, radio wizard.' },
                    { speaker: 'Ryan', text: 'If anyone can verify those schematics, it\'s him.' },
                    { speaker: '', text: '*Passes Emmen. Fields and wind turbines*' },
                    { speaker: 'Ryan', text: 'He was sceptical on the Meshtastic chat.' },
                    { speaker: 'Ryan', text: '"Send me the data. I\'ll run it through the pipeline."' },
                    { speaker: 'Ryan', text: 'Then silence for six hours. Then: "Get over here. Now."' },
                    { speaker: '', text: '*Road sign: Westerbork 12 km*' },
                    { speaker: 'Ryan', text: 'Whatever he found was enough to pull me out of the mancave.' },
                    { speaker: 'Ryan', text: 'The WSRT. Fourteen dishes. Listening to the cosmos.' },
                    { speaker: 'Ryan', text: 'Today they listen for something man-made.' },
                    { speaker: '', text: '*The white dishes appear above the treeline*' },
                    { speaker: 'Ryan', text: 'There they are. Like a row of giant ears.' },
                    { speaker: 'Ryan', text: 'Let\'s hear what Cees has to say.' }
                ]);

                const timeoutId2 = setTimeout(() => {
                    g.advanceTime(40);
                    g.loadScene('astron');
                }, 16000);
                this._timeoutIds.push(timeoutId2);
            }, 1000);
            this._timeoutIds.push(timeoutId1);

        } else if (destination === 'home_from_astron') {
            // Drive back FROM WSRT - processing what Cees told us
            const timeoutId1 = setTimeout(() => {
                g.startDialogue([
                    { speaker: '', text: '*Evening. The dishes shrink in the rear-view mirror*' },
                    { speaker: 'Ryan', text: 'Confirmed. All of it. The weapon, the signal, the coordinates.' },
                    { speaker: 'Ryan', text: '53.28 north, 7.42 east. Steckerdoser Heide. Right across the border.' },
                    { speaker: '', text: '*N34 heading north-east. The sky turns orange*' },
                    { speaker: 'Ryan', text: 'Cees was shaken. A man who tracks spy satellites for fun, shaken.' },
                    { speaker: 'Ryan', text: 'Weaponised radio. Russian-school algorithms. Built on German soil.' },
                    { speaker: 'Ryan', text: 'And they gave me a mesh radio. "Come back in one piece."' },
                    { speaker: '', text: '*Headlights on. Getting dark*' },
                    { speaker: 'Ryan', text: 'Now I have proof. The schematics. Cees\'s analysis. The triangulation.' },
                    { speaker: 'Ryan', text: 'But proof means nothing without action.' },
                    { speaker: 'Ryan', text: 'Eva is counting on me. Time to plan the infiltration.' },
                    { speaker: '', text: '*Approaching Compascuum. Home*' },
                    { speaker: 'Ryan', text: 'One step closer to ending this.' }
                ]);

                const timeoutId2 = setTimeout(() => {
                    g.advanceTime(40);
                    g.loadScene('mancave');
                    g.showNotification('Returned to mancave');
                }, 14000);
                this._timeoutIds.push(timeoutId2);
            }, 1000);
            this._timeoutIds.push(timeoutId1);

        } else {
            console.warn('Driving scene: No destination set!');
            // Fallback - return to mancave
            const timeoutId = setTimeout(() => {
                g.loadScene('mancave');
            }, 2000);
            this._timeoutIds.push(timeoutId);
        }
        
        // Clear the destination flag
        g.setFlag('driving_destination', null);
    },
    
    onExit: function() {
        // Stop car radio + engine
        this._stopDrivingAudio();

        // Clear all timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        
        // Cancel any active dialogue
        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }
    }
};

// Register scene
if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(DrivingScene);
}
