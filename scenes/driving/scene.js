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
    _wordRevealInterval: null,

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

            // Melody from original MIDI (Ch 15 lead synth, +1 octave)
            // [freq, startEighth, durationEighths]
            const melodySeq = [
                // Bar 1-2: "We're no strangers to love / You know the rules"
                [554.4,1,0.46],[554.4,2,0.92],[466.2,3,0.92],[554.4,4,0.92],[622.3,5,1.38],
                [523.3,9,0.92],[466.2,10,0.92],[523.3,11,1.38],[466.2,12.5,0.46],[415.3,13,1.38],
                // Bar 3-4: "and so do I / A full commitment's what I'm thinking of"
                [466.2,17,0.46],[466.2,18,0.92],[523.3,19,0.92],[554.4,20,0.92],[466.2,21,0.92],
                [415.3,23,0.92],[830.6,24,1.38],[830.6,26,0.92],[622.3,27,2.83],
                // Bar 5-6: "You wouldn't get this from any other guy"
                [466.2,33,0.46],[466.2,34,0.92],[523.3,35,0.92],[554.4,36,0.92],[466.2,37,0.92],
                [554.4,38,0.92],[622.3,39,0.92],[523.3,41,0.92],[466.2,42,0.92],
                [523.3,43,1.38],[466.2,44.5,0.46],[415.3,45,1.38],
                // Bar 7-8: "I just wanna tell you how I'm feeling"
                [466.2,49,0.46],[466.2,50,0.92],[523.3,51,0.92],[554.4,52,0.92],[466.2,53,0.92],
                [415.3,54,0.92],[622.3,56,0.46],[622.3,57,0.46],[622.3,58,0.92],
                [698.5,59,0.92],[622.3,60,3.33],
                // Bar 9-10: "Gotta make you understand"
                [554.4,64,4.83],[622.3,69,0.92],[698.5,70,0.92],[554.4,71,0.92],
                [622.3,72,0.46],[622.3,73,0.46],[622.3,74,0.92],[698.5,75,0.92],
                [622.3,76,0.92],[415.3,77,0.92],[415.3,78,1.83],
                // Bar 11-12: "Never gonna give you up"
                [466.2,84,0.92],[523.3,85,0.92],[554.4,86,0.92],[466.2,87,0.92],
                [622.3,89,0.92],[698.5,90,0.92],[622.3,91,2.33],
                [415.3,94,0.46],[466.2,94.5,0.46],[554.4,95,0.46],[466.2,95.5,0.46],
                // Bar 13: "Never gonna let you down"
                [698.5,96,1.38],[698.5,98,0.92],[622.3,99,2.83],
                [415.3,102,0.46],[466.2,102.5,0.46],[554.4,103,0.46],[466.2,103.5,0.46],
                // Bar 14: "Never gonna run around and desert you"
                [622.3,104,1.38],[622.3,106,0.92],[554.4,107,1.38],
                [523.3,108.5,0.46],[466.2,109,0.92],
                [415.3,110,0.46],[466.2,110.5,0.46],[554.4,111,0.46],[466.2,111.5,0.46],
                // Bar 15-16: "Never gonna make you cry / never gonna say goodbye"
                [554.4,112,1.83],[622.3,114,0.92],[523.3,115,1.38],
                [466.2,116.5,0.46],[415.3,117,0.92],[415.3,118,0.92],[622.3,119,2.83],
                [554.4,122,3.83],
                [415.3,126,0.46],[466.2,126.5,0.46],[554.4,127,0.46],[466.2,127.5,0.46],
            ];

            // Bass from original MIDI (Ch 2 synth bass, +2 octaves)
            // [freq, startEighth, durationEighths]
            const bassSeq = [
                // Bar 1 (Ab)
                [233.1,0,0.46],[233.1,1,0.46],[233.1,1.5,0.46],[277.2,2.5,0.46],
                [261.6,3,0.46],[207.7,4,1],[233.1,5,0.46],[174.6,7,0.46],[207.7,7.5,0.46],
                // Bar 2 (Ab)
                [233.1,8,0.46],[207.7,9,0.46],[233.1,9.5,0.46],[277.2,10.5,0.46],
                [261.6,11,0.46],[174.6,15,0.46],[207.7,15.5,0.46],
                // Bar 3 (Ab)
                [233.1,16,0.46],[233.1,17,0.46],[233.1,17.5,0.46],[277.2,18.5,0.46],
                [261.6,19,0.46],[207.7,20,1],[233.1,21,0.46],[233.1,23,0.46],[233.1,23.5,0.46],
                // Bar 4 (Eb/Ab)
                [155.6,24,0.46],[155.6,25,0.46],[155.6,25.5,0.46],[155.6,26.5,0.46],
                [207.7,27,0.46],[207.7,29,0.46],[207.7,29.5,0.46],[207.7,30,0.46],
                [174.6,31,0.46],[207.7,31.5,0.46],
                // Bar 5 (Ab)
                [233.1,32,0.46],[233.1,33,0.46],[233.1,33.5,0.46],[277.2,34.5,0.46],
                [261.6,35,0.46],[207.7,36,1],[233.1,37,0.46],[174.6,39,0.46],[207.7,39.5,0.46],
                // Bar 6 (Ab)
                [233.1,40,0.46],[207.7,41,0.46],[233.1,41.5,0.46],[277.2,42.5,0.46],
                [261.6,43,0.46],[174.6,47,0.46],[207.7,47.5,0.46],
                // Bar 7 (Ab)
                [233.1,48,0.46],[233.1,49,0.46],[233.1,49.5,0.46],[277.2,50.5,0.46],
                [261.6,51,0.46],[207.7,52,1],[233.1,53,0.46],[233.1,55,0.46],[233.1,55.5,0.46],
                // Bar 8 (Eb/Ab)
                [155.6,56,0.46],[155.6,57,0.46],[155.6,57.5,0.46],[155.6,58.5,0.46],
                [207.7,59,0.46],[207.7,61,0.46],[207.7,61.5,0.46],[207.7,62,0.46],
                [174.6,63,0.46],[207.7,63.5,0.46],
                // Bar 9 (Ab)
                [233.1,64,0.46],[233.1,65,0.46],[233.1,65.5,0.46],[277.2,66.5,0.46],
                [261.6,67,0.46],[207.7,68,1],[233.1,69,0.46],[174.6,71,0.46],[207.7,71.5,0.46],
                // Bar 10 (Ab)
                [233.1,72,0.46],[207.7,73,0.46],[233.1,73.5,0.46],[277.2,74.5,0.46],
                [261.6,75,0.46],[174.6,79,0.46],[207.7,79.5,0.46],
                // Bar 11 (Ab)
                [233.1,80,0.46],[233.1,81,0.46],[233.1,81.5,0.46],[277.2,82.5,0.46],
                [261.6,83,0.46],[207.7,84,0.46],[233.1,85,0.46],[174.6,87,0.46],[207.7,87.5,0.46],
                // Bar 12 (Ab)
                [233.1,88,0.46],[207.7,89,0.46],[233.1,89.5,0.46],[277.2,90.5,0.46],
                [261.6,91,0.46],[174.6,95,0.46],[207.7,95.5,0.46],
                // Bar 13 (Eb/Ab)
                [155.6,96,0.46],[155.6,97,0.46],[155.6,97.5,0.46],[261.6,98.5,0.46],
                [233.1,99,0.46],[207.7,100,0.46],[207.7,101,0.46],[174.6,103,0.46],[207.7,103.5,0.46],
                // Bar 14 (F/Bb)
                [174.6,104,0.46],[174.6,105,0.46],[174.6,105.5,0.46],[261.6,106.5,0.46],
                [233.1,107,0.46],[233.1,109,0.46],[233.1,109.5,0.46],[233.1,110,0.46],
                [261.6,110.5,0.46],[233.1,111.5,0.46],
                // Bar 15 (Eb/Ab)
                [155.6,112,0.46],[155.6,113,0.46],[155.6,113.5,0.46],[261.6,114.5,0.46],
                [233.1,115,0.46],[207.7,116,0.46],[207.7,117,0.46],[207.7,119,0.46],[207.7,119.5,0.46],
                // Bar 16 (F/Ab)
                [174.6,120,0.46],[174.6,121,0.46],[174.6,121.5,0.46],[261.6,122.5,0.46],
                [233.1,123,0.46],[207.7,125,0.46],[207.7,126,0.46],[207.7,126.5,0.46],[277.2,127.5,0.46],
            ];

            const loopEighths = 128;
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

            // Pre-schedule 3 loops (~102s total - plenty for any driving scene)
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

    // ── Radio display overlay ─────────────────────────────────────────────
    _showRadioOverlay: function(bulletin, stationLabel, onSkip) {
        const existing = document.getElementById('driving-radio-overlay');
        if (existing) existing.remove();
        if (this._wordRevealInterval) { clearInterval(this._wordRevealInterval); this._wordRevealInterval = null; }

        const wrap = document.createElement('div');
        wrap.id = 'driving-radio-overlay';
        wrap.style.cssText = [
            'position:absolute', 'top:16px', 'right:20px', 'width:360px',
            'background:rgba(8,10,16,0.92)',
            'border:1px solid rgba(80,160,255,0.28)',
            'border-radius:10px', 'padding:14px 18px 12px',
            'z-index:50', 'font-family:\'Courier New\',monospace', 'color:#c8e6ff',
            'box-shadow:0 4px 28px rgba(0,60,160,0.45)',
        ].join(';');

        const hdr = document.createElement('div');
        hdr.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;border-bottom:1px solid rgba(80,160,255,0.18);padding-bottom:8px;';
        const dot = document.createElement('span');
        dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#ff4444;flex-shrink:0;animation:radioPulse 1.2s ease-in-out infinite;';
        const lbl = document.createElement('span');
        lbl.style.cssText = 'font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;color:#7ab8e8;font-weight:bold;';
        lbl.textContent = stationLabel || 'RTV DRENTHE — NACHT-NIEUWS';
        const live = document.createElement('span');
        live.style.cssText = 'margin-left:auto;font-size:11px;opacity:0.55;';
        live.textContent = '▶ LIVE';
        hdr.append(dot, lbl, live);

        const txt = document.createElement('div');
        txt.id = 'driving-radio-text';
        txt.style.cssText = 'font-size:12.5px;line-height:1.75;color:#ddeeff;max-height:220px;overflow-y:auto;white-space:pre-wrap;word-break:break-word;';

        const btn = document.createElement('button');
        btn.textContent = 'Doorgaan »';
        btn.style.cssText = [
            'margin-top:10px', 'width:100%',
            'background:rgba(30,60,130,0.55)',
            'border:1px solid rgba(80,140,255,0.35)',
            'border-radius:5px', 'color:#a8d0ff',
            'font-family:\'Courier New\',monospace', 'font-size:11px',
            'padding:5px 10px', 'cursor:pointer', 'letter-spacing:0.08em',
        ].join(';');
        btn.onclick = onSkip;

        wrap.append(hdr, txt, btn);

        if (!document.getElementById('driving-radio-style')) {
            const s = document.createElement('style');
            s.id = 'driving-radio-style';
            s.textContent = '@keyframes radioPulse{0%,100%{opacity:1}50%{opacity:0.15}}';
            document.head.appendChild(s);
        }
        (document.getElementById('scene-container') || document.body).appendChild(wrap);

        // Word-by-word reveal
        const words = bulletin.split(' ');
        let i = 0;
        this._wordRevealInterval = setInterval(() => {
            const el = document.getElementById('driving-radio-text');
            if (!el) { clearInterval(this._wordRevealInterval); return; }
            if (i < words.length) { el.textContent += (i > 0 ? ' ' : '') + words[i++]; el.scrollTop = el.scrollHeight; }
            else clearInterval(this._wordRevealInterval);
        }, 110);
    },

    _removeRadioOverlay: function() {
        const el = document.getElementById('driving-radio-overlay');
        if (el) el.remove();
        if (this._wordRevealInterval) { clearInterval(this._wordRevealInterval); this._wordRevealInterval = null; }
    },

    // ── Returns time-appropriate Dutch greeting + programme label based on game hour ──
    _getGreeting: function(hour) {
        // hour: 0-23 from game time HH:MM
        if (hour >= 5  && hour < 12) return { greeting: 'Goedemorgen', label: 'OCHTEND-NIEUWS' };
        if (hour >= 12 && hour < 18) return { greeting: 'Goedemiddag', label: 'MIDDAG-NIEUWS'  };
        if (hour >= 18 && hour < 22) return { greeting: 'Goedenavond', label: 'AVOND-NIEUWS'   };
        return                               { greeting: 'Goedenacht',  label: 'NACHT-NIEUWS'   };
    },

    // ── RTV Drenthe / NPO Radio 1 night bulletins — multiple variants per destination ──
    _speakRadioNews: function(destination, game) {
        const g  = game || window.game;
        const vm = window.voiceManager;

        // Multiple bulletin variants per destination — picked at random each drive.
        // Bulletins are ~60-90 words (50-75 s at normal TTS rate) so the full bulletin
        // plays before the scene transitions. TTS completion drives the transition.
        const BULLETINS = {
            klooster: [
                'RTV Drenthe, nacht-nieuws. ' +
                'Het is bijna middernacht in Drenthe. ' +
                'Residents near Ter Apel have reported unusual vehicle activity on rural roads this evening. ' +
                'Local police say there is no cause for concern. ' +
                'The Westerbork radio telescope team has filed a signal interference report with the Dutch Radiocommunications Agency. An unidentified transmission on restricted military frequencies was logged earlier tonight. ' +
                'The N391 between Ter Apel and Emmen is clear. No incidents reported. ' +
                'Weather: clear skies, four degrees. Light frost possible on rural bridges. ' +
                'This is RTV Drenthe. Goedenacht.',

                'RTV Drenthe, nacht-nieuws. ' +
                'Het is middernacht. Een korte bulletijn. ' +
                'Astronomers at ASTRON have noted interference on a restricted frequency band. The Dutch Radiocommunications Agency is monitoring the situation. ' +
                'Police in Emmen report no major incidents this evening. ' +
                'Border crossing Ter Apel is operating on normal overnight schedule. The Westerbork Memorial will be open from nine o\'clock tomorrow morning. ' +
                'Weather: clear, two degrees. Possible frost before dawn on rural roads. Drive carefully. ' +
                'RTV Drenthe. Goedenacht.',
            ],
            home: [
                'RTV Drenthe, nacht-nieuws. ' +
                'Het is na middernacht. Goedenacht Drenthe. ' +
                'ASTRON confirms an anomalous signal logged near Dwingeloo is under formal investigation by the Dutch Radiocommunications Agency. ' +
                'In Lower Saxony, German federal police have acknowledged reports of an unidentified individual near the Steckerdoser Heide research area earlier this week. ' +
                'A late-night lane closure on the N366 near Ter Apel has been lifted. Normal traffic flow is restored. ' +
                'Weather: clear and cold. Two degrees. Frost on exposed surfaces before dawn. ' +
                'More news at six. This is RTV Drenthe. Goedenacht.',

                'RTV Drenthe, nacht-nieuws. ' +
                'Het is laat in de nacht. ' +
                'Dutch and German authorities are cooperating on an investigation into illegal signal transmissions near the German border in Drenthe. ' +
                'ASTRON in Dwingeloo declined to release details of its ongoing signal analysis. ' +
                'Amateur radio operators across Drenthe are advised to report any unusual frequency activity to the Radiocommunications Agency hotline at zero eight hundred, zero three zero three. ' +
                'The N34 between Coevorden and Emmen is clear. ' +
                'Weather: one degree. Watch for black ice on ungritted roads overnight. Stay safe. ' +
                'This is RTV Drenthe. Goedenacht.',
            ],
            facility: [
                'NPO Radio 1, middernacht-nieuws. ' +
                'Dutch and German border agencies are operating under an elevated information-sharing protocol following security concerns in the Steckerdoser Heide area of Lower Saxony. ' +
                'The Bundeswehr has declined to comment on reports of unusual activity at a research installation near the Dutch border. ' +
                'Dutch and German Radiocommunications authorities have jointly identified illegal transmissions on air-defence frequencies originating from the German side of the border. ' +
                'The Dutch National Cyber Security Centre has issued an advisory to operators of critical communications infrastructure. ' +
                'Weather: overcast. Ten degrees. Light rain spreading from the west after two a.m. ' +
                'This is NPO Radio 1.',

                'NPO Radio 1, middernacht. Breaking news at this hour. ' +
                'Sources close to the Dutch Ministry of Defence confirm that military frequencies were accessed by an unlicensed transmitter operating near the German border in Drenthe earlier tonight. ' +
                'The MIVD, Dutch military intelligence, is reported to be involved in the investigation. ' +
                'German authorities confirm they are aware of the incident and are cooperating with the Dutch side. ' +
                'Civilian services are unaffected. There is no public safety risk, authorities say. ' +
                'Weather: ten degrees. Rain likely before three a.m. ' +
                'NPO Radio 1. Het nieuws in de nacht.',
            ],
            home_from_facility: [
                'NPO Radio 1, vroeg-ochtend nieuws. Het is net na één uur. ' +
                'Breaking: German authorities confirm an incident at the Steckerdoser Heide research facility in Lower Saxony. Details are withheld for operational security reasons. No casualties are reported. ' +
                'The Dutch National Cyber Security Centre has raised its alert level for critical infrastructure operators. ' +
                'The anomalous transmission near Dwingeloo tracked by ASTRON has gone silent. The Radiocommunications Agency says its investigation continues. ' +
                'The N391 border crossing at Ter Apel remains open for essential traffic. ' +
                'Weather: overcast, nine degrees. Rain clearing by dawn. ' +
                'This is NPO Radio 1.',

                'NPO Radio 1. Het is vroeg in de ochtend. ' +
                'German state broadcaster NDR is reporting that an unspecified security incident occurred near the Dutch-German border in Lower Saxony overnight. Sources describe it as a research facility communications breach. ' +
                'Dutch authorities have not confirmed the incident publicly. ' +
                'ASTRON scientists are monitoring a frequency band that went silent following the incident. ' +
                'Weather: nine degrees. Clearing skies before first light. ' +
                'NPO Radio 1. Goedemorgen.',
            ],
            hackerspace: [
                'RTV Drenthe, avond-nieuws. Goedenavond Drenthe. ' +
                'Hackerspace Drenthe in Coevorden marks its second anniversary this month. The maker space now hosts eighty active members with weekly sessions in 3D printing, electronics and amateur radio. ' +
                'The municipality of Coevorden has confirmed a new digital infrastructure grant for rural communities in south Drenthe, worth half a million euros. ' +
                'The Dutch amateur radio society VERON reports increased interest in low-power mesh networks following news of the Westerbork signal investigation. ' +
                'Weather: twelve degrees. Light south-westerly wind. Pleasant evening ahead. ' +
                'RTV Drenthe. Prettige avond.',

                'RTV Drenthe, avond-nieuws. ' +
                'Coevorden municipality is piloting a smart-city sensor network in the town centre, drawing on expertise from local tech community volunteers, including members of Hackerspace Drenthe. ' +
                'The N34 is clear of roadworks as of this evening. ' +
                'A presentation on LoRa mesh networking attracted a full house at the hackerspace last week. Organisers say follow-up sessions are planned. ' +
                'Weather: eleven degrees. Dry evening. Light cloud. ' +
                'RTV Drenthe.',
            ],
            home_from_wsrt_parking: [
                'RTV Drenthe, nacht-nieuws. Het is na middernacht. ' +
                'ASTRON confirms all fourteen Westerbork synthesis radio telescope dishes are back online following calibration. A new all-sky survey begins Tuesday. ' +
                'The Herinneringscentrum Kamp Westerbork received a record number of school groups this month, with over two thousand pupils visiting the memorial site. ' +
                'The anomalous signal investigation continues. No new public statement is expected before morning. ' +
                'The N371 between Westerbork and Beilen is clear. ' +
                'Weather: clear and cool. Six degrees. ' +
                'RTV Drenthe. Goedenacht.',

                'RTV Drenthe, nacht-nieuws. Een rustige nacht in Drenthe. ' +
                'Westerbork radio telescope observers report clear skies and a productive observing window tonight. ' +
                'The Dutch Radiocommunications Agency has not released further details on the signal investigation. Amateur radio operators are asked to report any unusual frequencies on the agency hotline. ' +
                'Assen city centre is quiet. No incidents reported this evening. ' +
                'Weather: five degrees. Clear skies and good visibility. ' +
                'RTV Drenthe. Goedenacht.',
            ],
            home_from_hackerspace: [
                'RTV Drenthe, laat nacht-nieuws. Goedenacht Drenthe. ' +
                'The Hackerspace Drenthe evening concluded with a well-attended presentation on LoRa mesh networking and low-power sensor arrays. ' +
                'Organisers say the techniques demonstrated tonight have direct applications in remote monitoring across rural Drenthe. Follow-up sessions are planned for next month. ' +
                'Coevorden is quiet overnight. Emergency services report no major incidents. ' +
                'The N34 near Coevorden is clear. ' +
                'Weather: eight degrees. Clear sky. Good visibility. ' +
                'RTV Drenthe. Goedenacht.',

                'RTV Drenthe, nacht-nieuws. Het is laat. Een korte bulletijn. ' +
                'Amateur radio and open hardware communities across Drenthe are growing. Hackerspace Drenthe reports its highest-ever monthly attendance this month. ' +
                'VERON, the Dutch amateur radio society, will hold a regional meet in Hoogeveen next Saturday. All licensed operators are welcome. ' +
                'Weather: seven degrees. Quiet night ahead. ' +
                'RTV Drenthe. Goedenacht.',
            ],
        };

        const ROUTES = {
            klooster:               { advance: 20, scene: 'klooster',    part: 7,    notify: null },
            facility:               { advance: 25, scene: 'drone_hunt',  part: 17,   notify: null },
            home:                   { advance: 25, scene: 'home',        part: null, notify: 'Arrived home' },
            home_from_facility:     { advance: 30, scene: 'long_night',  part: null, notify: null },
            hackerspace:            { advance: 25, scene: 'hackerspace', part: null, notify: null },
            home_from_wsrt_parking: { advance: 20, scene: 'home',        part: null, notify: 'Arrived home' },
            home_from_hackerspace:  { advance: 25, scene: 'home',        part: null, notify: 'Arrived home' },
        };
        const tr = ROUTES[destination] || { advance: 20, scene: 'mancave', part: null, notify: null };

        // Pick a random bulletin variant for this drive
        const pool    = BULLETINS[destination] || ['RTV Drenthe, nacht-nieuws. Rustige nacht in Drenthe. Weer: koud en helder. RTV Drenthe. Goedenacht.'];
        let bulletin  = pool[Math.floor(Math.random() * pool.length)];

        // ── Swap greeting words to match game time ──
        const rawTime   = (g.gameState && g.gameState.time) ? g.gameState.time : '23:00';
        const gameHour  = parseInt(rawTime.split(':')[0], 10);
        const gObj      = this._getGreeting(gameHour);
        // Replace any Dutch time-of-day greeting in the chosen bulletin text
        bulletin = bulletin.replace(
            /Goedenacht|Goedenavond|Goedemiddag|Goedemorgen/g,
            gObj.greeting
        );

        const isNPO      = (destination === 'facility' || destination === 'home_from_facility');
        const stationLabel = (isNPO ? 'NPO RADIO 1' : 'RTV DRENTHE') + ' — ' + gObj.label;

        // Transition — called when TTS finishes (or skip pressed)
        const doTransition = () => {
            if (!window.game || window.game.currentScene !== 'driving') return;
            this._removeRadioOverlay();
            if (tr.part !== null && g.setStoryPart) g.setStoryPart(tr.part);
            g.advanceTime(tr.advance);
            if (tr.notify) g.showNotification(tr.notify);
            g.loadScene(tr.scene);
        };

        // Show radio card on screen immediately
        this._showRadioOverlay(bulletin, stationLabel, doTransition);

        // Speak 2 s in (after engine/tuning sounds settle); transition fires when TTS finishes
        const tid = setTimeout(() => {
            if (!window.game || window.game.currentScene !== 'driving') return;
            if (vm && typeof vm.speak === 'function') {
                vm.speak(bulletin, 'Documentary').then(() => {
                    const t2 = setTimeout(doTransition, 2500);
                    this._timeoutIds.push(t2);
                });
            } else {
                // Fallback: estimate reading time (~450 ms/word)
                const readMs = Math.max(20000, bulletin.split(' ').length * 450);
                const t2 = setTimeout(doTransition, readMs);
                this._timeoutIds.push(t2);
            }
        }, 2000);
        this._timeoutIds.push(tid);
    },

    // Scene entry — Rick Astley on the car radio, RTV Drenthe news, auto-transition
    onEnter: function(gameInstance) {
        const g = gameInstance || window.game;
        const destination = g.getFlag('driving_destination');
        g.setFlag('driving_destination', null);

        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        this._startDrivingAudio();
        this._speakRadioNews(destination, g);
    },


    onExit: function() {
        // Stop car radio + engine
        this._stopDrivingAudio();

        // Remove radio overlay and word-reveal interval
        this._removeRadioOverlay();

        // Clear all timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        
        // Cancel any active dialogue
        if (window.game && window.game.isDialogueActive) {
            window.game._dialogueCallback = null; // prevent callback firing during exit
            window.game.endDialogue();
        }
    }
};

// Register scene
if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(DrivingScene);
}
