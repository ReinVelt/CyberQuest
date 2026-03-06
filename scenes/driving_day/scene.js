/**
 * Driving Day Scene - Volvo Interior (Daytime)
 * Transition scene for daytime drives through the Drenthe countryside.
 * Used for: Compascuum ↔ WSRT/ASTRON (Westerbork, ~40 min each way)
 *
 * Destinations handled:
 *   'astron'                → drive TO WSRT to meet Cees Bassa
 *   'home_from_astron'      → drive back FROM WSRT after Cees's briefing
 *   'westerbork'            → drive TO Westerbork Memorial
 *   'home_from_westerbork'  → drive back FROM Westerbork Memorial to garden
 *   'hackerspace'            → drive TO Hackerspace Drenthe in Coevorden
 *   'home_from_hackerspace'  → drive back FROM Hackerspace to garden
 *
 * Audio: Car radio tuned to RTV Drenthe (regional Dutch broadcaster)
 *        — Web Audio API synthesised jingle, news, weather & pop music
 */

const DrivingDayScene = {
    id: 'driving_day',
    name: 'Volvo - Day Drive',

    background: 'assets/images/scenes/driving_day.svg',

    description: 'Afternoon sun through the windscreen. Flat Drenthe fields, WSRT dishes on the horizon, your thoughts running ahead of the car.',

    hidePlayer: true, // Ryan is inside the Volvo
    playerStart: { x: 50, y: 50 },
    hotspots: [],

    // Store timeout IDs for cleanup
    _timeoutIds: [],
    _wordRevealInterval: null,

    // ======= WEB AUDIO: RTV DRENTHE CAR RADIO =======
    _audioCtx: null,
    _audioNodes: [],
    _radioGain: null,

    _getAudioCtx() {
        if (!this._audioCtx || this._audioCtx.state === 'closed') {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },

    _startRadio() {
        try {
            const ctx = this._getAudioCtx();
            const nodes = this._audioNodes;
            const now = ctx.currentTime;

            // ===== ENGINE HUM =====
            const engineOsc = ctx.createOscillator();
            engineOsc.type = 'sawtooth';
            engineOsc.frequency.setValueAtTime(82, now);
            const engineLfo = ctx.createOscillator();
            engineLfo.type = 'sine';
            engineLfo.frequency.setValueAtTime(0.25, now);
            const engineLfoG = ctx.createGain();
            engineLfoG.gain.setValueAtTime(3.5, now);
            engineLfo.connect(engineLfoG);
            engineLfoG.connect(engineOsc.frequency);
            engineLfo.start(now);
            const engineFilt = ctx.createBiquadFilter();
            engineFilt.type = 'lowpass';
            engineFilt.frequency.setValueAtTime(140, now);
            const engineGain = ctx.createGain();
            engineGain.gain.setValueAtTime(0, now);
            engineGain.gain.linearRampToValueAtTime(0.03, now + 2);
            engineOsc.connect(engineFilt);
            engineFilt.connect(engineGain);
            engineGain.connect(ctx.destination);
            engineOsc.start(now);
            nodes.push(engineOsc, engineLfo, engineLfoG, engineFilt, engineGain);

            // Second harmonic
            const eng2 = ctx.createOscillator();
            eng2.type = 'triangle';
            eng2.frequency.setValueAtTime(164, now);
            const eng2G = ctx.createGain();
            eng2G.gain.setValueAtTime(0, now);
            eng2G.gain.linearRampToValueAtTime(0.01, now + 2);
            const eng2F = ctx.createBiquadFilter();
            eng2F.type = 'lowpass';
            eng2F.frequency.value = 250;
            eng2.connect(eng2F);
            eng2F.connect(eng2G);
            eng2G.connect(ctx.destination);
            eng2.start(now);
            nodes.push(eng2, eng2G, eng2F);

            // ===== ROAD / TYRE NOISE =====
            const roadLen = ctx.sampleRate * 2;
            const roadBuf = ctx.createBuffer(1, roadLen, ctx.sampleRate);
            const rd = roadBuf.getChannelData(0);
            for (let i = 0; i < roadLen; i++) rd[i] = Math.random() * 2 - 1;
            const roadSrc = ctx.createBufferSource();
            roadSrc.buffer = roadBuf;
            roadSrc.loop = true;
            const roadFilt = ctx.createBiquadFilter();
            roadFilt.type = 'bandpass';
            roadFilt.frequency.value = 250;
            roadFilt.Q.value = 0.5;
            const roadG = ctx.createGain();
            roadG.gain.setValueAtTime(0, now);
            roadG.gain.linearRampToValueAtTime(0.018, now + 2);
            roadSrc.connect(roadFilt);
            roadFilt.connect(roadG);
            roadG.connect(ctx.destination);
            roadSrc.start(now);
            nodes.push(roadSrc, roadFilt, roadG);

            // ===== CAR RADIO OUTPUT CHAIN =====
            const radioFilt = ctx.createBiquadFilter();
            radioFilt.type = 'bandpass';
            radioFilt.frequency.value = 1800;
            radioFilt.Q.value = 0.7;
            const radioGain = ctx.createGain();
            radioGain.gain.setValueAtTime(0, now);
            radioGain.gain.linearRampToValueAtTime(0.16, now + 3);
            radioFilt.connect(radioGain);
            radioGain.connect(ctx.destination);
            this._radioGain = radioGain;
            nodes.push(radioFilt, radioGain);

            // Radio static/hiss
            const hissLen = ctx.sampleRate * 2;
            const hissBuf = ctx.createBuffer(1, hissLen, ctx.sampleRate);
            const hd = hissBuf.getChannelData(0);
            for (let i = 0; i < hissLen; i++) hd[i] = Math.random() * 2 - 1;
            const hissSrc = ctx.createBufferSource();
            hissSrc.buffer = hissBuf;
            hissSrc.loop = true;
            const hissFilt = ctx.createBiquadFilter();
            hissFilt.type = 'highpass';
            hissFilt.frequency.value = 4500;
            const hissG = ctx.createGain();
            hissG.gain.setValueAtTime(0.004, now);
            hissSrc.connect(hissFilt);
            hissFilt.connect(hissG);
            hissG.connect(radioGain);
            hissSrc.start(now);
            nodes.push(hissSrc, hissFilt, hissG);

            // ===== TUNING SWEEP (1.5s) =====
            const tuneOsc = ctx.createOscillator();
            tuneOsc.type = 'sine';
            tuneOsc.frequency.setValueAtTime(500, now);
            tuneOsc.frequency.exponentialRampToValueAtTime(2200, now + 0.4);
            tuneOsc.frequency.exponentialRampToValueAtTime(700, now + 0.9);
            tuneOsc.frequency.exponentialRampToValueAtTime(1100, now + 1.2);
            const tuneG = ctx.createGain();
            tuneG.gain.setValueAtTime(0, now);
            tuneG.gain.linearRampToValueAtTime(0.05, now + 0.1);
            tuneG.gain.setValueAtTime(0.03, now + 0.9);
            tuneG.gain.linearRampToValueAtTime(0, now + 1.4);
            tuneOsc.connect(tuneG);
            tuneG.connect(radioGain);
            tuneOsc.start(now);
            tuneOsc.stop(now + 1.5);

            // ══════════════════════════════════════════════
            //  RTV DRENTHE — Regional Radio
            //  Structure: Jingle → News → Weather → Music
            // ══════════════════════════════════════════════

            const radioStart = now + 2; // after tuning
            const eighth = 0.25;        // base timing unit

            // --- Helper: play a note on the radio ---
            const playNote = (freq, start, dur, type = 'square', vol = 0.09) => {
                if (!freq) return;
                const o = ctx.createOscillator();
                o.type = type;
                o.frequency.setValueAtTime(freq, start);
                const g = ctx.createGain();
                g.gain.setValueAtTime(0, start);
                g.gain.linearRampToValueAtTime(vol, start + 0.01);
                g.gain.setValueAtTime(vol * 0.85, start + dur - 0.02);
                g.gain.linearRampToValueAtTime(0, start + dur);
                o.connect(g);
                g.connect(radioFilt);
                o.start(start);
                o.stop(start + dur + 0.02);
            };

            // --- Helper: click/pip (time signal) ---
            const playPip = (time, freq = 1000, dur = 0.08) => {
                const o = ctx.createOscillator();
                o.type = 'sine';
                o.frequency.value = freq;
                const g = ctx.createGain();
                g.gain.setValueAtTime(0.12, time);
                g.gain.exponentialRampToValueAtTime(0.001, time + dur);
                o.connect(g);
                g.connect(radioFilt);
                o.start(time);
                o.stop(time + dur + 0.01);
            };

            // ═════ PART 1: RTV DRENTHE JINGLE (bars 0–4, ~4s) ═════
            // Bright, major key, upbeat — typical Dutch regional radio
            // Key of C major, 120 BPM feel
            const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46,
                  G5 = 783.99, A5 = 880.00, B4 = 493.88, C6 = 1046.50;
            const C3 = 130.81, E3 = 164.81, G3 = 196.00, A3 = 220.00;

            let t = radioStart;

            // Ascending fanfare: C-E-G-C (bright and proud)
            playNote(C5, t, 0.3, 'square', 0.1);
            playNote(E5, t + 0.32, 0.3, 'square', 0.1);
            playNote(G5, t + 0.64, 0.3, 'square', 0.1);
            playNote(C6, t + 0.96, 0.5, 'square', 0.12);
            // Bass underneath
            playNote(C3, t, 1.5, 'sawtooth', 0.06);

            // Second phrase — bouncy descending (G-E-D-C-E-G)
            t = radioStart + 1.6;
            playNote(G5, t, 0.2, 'square', 0.09);
            playNote(E5, t + 0.22, 0.2, 'square', 0.09);
            playNote(D5, t + 0.44, 0.2, 'square', 0.09);
            playNote(C5, t + 0.66, 0.2, 'square', 0.09);
            playNote(E5, t + 0.88, 0.25, 'square', 0.1);
            playNote(G5, t + 1.15, 0.4, 'square', 0.11);
            // Bass
            playNote(G3, t, 0.8, 'sawtooth', 0.05);
            playNote(C3, t + 0.8, 0.8, 'sawtooth', 0.05);

            // Resolving chord: C major spread (held)
            t = radioStart + 3.2;
            playNote(C5, t, 0.8, 'triangle', 0.07);
            playNote(E5, t, 0.8, 'triangle', 0.07);
            playNote(G5, t, 0.8, 'triangle', 0.07);
            playNote(C3, t, 0.8, 'sawtooth', 0.05);

            // ═════ PART 2: TIME SIGNAL PIPS (4.2s – 5.5s) ═════
            const pipStart = radioStart + 4.2;
            playPip(pipStart);
            playPip(pipStart + 0.3);
            playPip(pipStart + 0.6);
            playPip(pipStart + 0.9);
            playPip(pipStart + 1.2, 1400, 0.3); // long final pip (the hour)

            // ═════ PART 3: NEWS THEME (5.8s – 8.5s) ═════
            // Urgent, minor key — typical news stinger
            // A minor / C minor feel
            const Ab4 = 415.30, Bb4 = 466.16, Eb4 = 311.13, F4 = 349.23;
            const Db4 = 277.18, Gb4 = 369.99;

            t = radioStart + 5.8;
            // Rapid ascending motif (urgency)
            playNote(Eb4, t, 0.15, 'square', 0.1);
            playNote(F4, t + 0.16, 0.15, 'square', 0.1);
            playNote(Ab4, t + 0.32, 0.15, 'square', 0.1);
            playNote(Bb4, t + 0.48, 0.3, 'square', 0.12);
            // Descending answer
            playNote(Ab4, t + 0.85, 0.15, 'square', 0.1);
            playNote(Gb4, t + 1.02, 0.15, 'square', 0.1);
            playNote(F4, t + 1.18, 0.15, 'square', 0.1);
            playNote(Eb4, t + 1.36, 0.5, 'square', 0.11);
            // Repeat with higher finish
            playNote(Eb4, t + 2.0, 0.12, 'square', 0.1);
            playNote(F4, t + 2.14, 0.12, 'square', 0.1);
            playNote(Ab4, t + 2.28, 0.12, 'square', 0.1);
            playNote(Bb4, t + 2.42, 0.12, 'square', 0.1);
            playNote(C5, t + 2.56, 0.6, 'square', 0.13);  // resolved on C

            // ═════ PART 4: SPOKEN NEWS (via TTS — triggered separately) ═════
            // TTS is triggered from onEnter after a delay — see _speakRadioNews()

            // ═════ PART 5: WEATHER JINGLE + POP MUSIC (~16s onward) ═════
            // Short ascending motif → sustained pop music

            // Weather jingle (bright, simple — like a doorbell melody)
            t = radioStart + 16;
            playNote(E5, t, 0.2, 'triangle', 0.08);
            playNote(G5, t + 0.25, 0.2, 'triangle', 0.08);
            playNote(A5, t + 0.5, 0.2, 'triangle', 0.08);
            playNote(G5, t + 0.75, 0.2, 'triangle', 0.08);
            playNote(E5, t + 1.0, 0.4, 'triangle', 0.09);
            playNote(C3, t, 1.4, 'sawtooth', 0.04);

            // ═════ PART 6: POP MUSIC — "Golden Earring - Radar Love" vibe ═════
            // Dutch classic! Key of F# minor, 130 BPM driving rhythm
            const BPM = 130;
            const beat = 60 / BPM;           // ~0.462s
            const e8 = beat / 2;             // ~0.231s

            // Fsharp minor pentatonic
            const Fs4 = 369.99, A4 = 440.00, Cs5 = 554.37;
            const Fs3 = 185.00, A2 = 110.00, B2 = 123.47, E2 = 82.41;

            const musicStart = radioStart + 18;

            // Driving bass riff (repeating 2 bar pattern)
            const bassRiff = [
                [Fs3, 0, 1.5], [Fs3, 2, 1.5], [A2, 4, 1.5], [B2, 6, 1],
                [Fs3, 8, 1.5], [Fs3, 10, 1.5], [E2, 12, 1.5], [Fs3, 14, 1]
            ];
            const riffEighths = 16;
            const riffDur = riffEighths * e8;

            // Melody (catchy hook)
            const melRiff = [
                [Fs4, 0, 1.5], [A4, 2, 1], [Cs5, 3, 2], [A4, 5, 1],
                [Fs4, 6, 1], [E5, 8, 2], [D5, 10, 1], [Cs5, 11, 1],
                [A4, 12, 2], [Fs4, 14, 1.5]
            ];

            // Schedule 4 loops (~14.2s total)
            for (let loop = 0; loop < 4; loop++) {
                const loopT = musicStart + loop * riffDur;

                // Bass
                bassRiff.forEach(([freq, startE, durE]) => {
                    playNote(freq, loopT + startE * e8, durE * e8, 'sawtooth', 0.055);
                });

                // Melody
                melRiff.forEach(([freq, startE, durE]) => {
                    playNote(freq, loopT + startE * e8, durE * e8, 'square', 0.08);
                });

                // Kick on 1 and 3
                for (let e = 0; e < riffEighths; e += 4) {
                    const kT = loopT + e * e8;
                    const ko = ctx.createOscillator();
                    ko.type = 'sine';
                    ko.frequency.setValueAtTime(140, kT);
                    ko.frequency.exponentialRampToValueAtTime(35, kT + 0.12);
                    const kg = ctx.createGain();
                    kg.gain.setValueAtTime(0.08, kT);
                    kg.gain.exponentialRampToValueAtTime(0.001, kT + 0.16);
                    ko.connect(kg);
                    kg.connect(radioFilt);
                    ko.start(kT);
                    ko.stop(kT + 0.18);
                }

                // Snare on 2 and 4
                for (let e = 2; e < riffEighths; e += 4) {
                    const sT = loopT + e * e8;
                    const sBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
                    const sd = sBuf.getChannelData(0);
                    for (let i = 0; i < sd.length; i++) sd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
                    const sSrc = ctx.createBufferSource();
                    sSrc.buffer = sBuf;
                    const sg = ctx.createGain();
                    sg.gain.setValueAtTime(0.05, sT);
                    const sf = ctx.createBiquadFilter();
                    sf.type = 'bandpass';
                    sf.frequency.value = 3000;
                    sf.Q.value = 1;
                    sSrc.connect(sf);
                    sf.connect(sg);
                    sg.connect(radioFilt);
                    sSrc.start(sT);
                }
            }

            console.log('[DrivingDay] RTV Drenthe autoradio started');
        } catch (e) {
            console.warn('[DrivingDay] Audio failed:', e);
        }
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
        lbl.textContent = stationLabel || 'RTV DRENTHE — MIDDAG-NIEUWS';
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

    /**
     * Speak the RTV Drenthe news bulletin via TTS.
     * Shows a radio display overlay and returns a Promise that resolves when
     * the bulletin finishes speaking. The scene transition chains onto this Promise
     * so the news always plays in full before the destination loads.
     * A 'Doorgaan' skip button lets the player advance early.
     */
    _speakRadioNews: function(destination) {
        const vm = window.voiceManager;

        // Multiple bulletin variants per destination — a different one plays each drive.
        const BULLETINS = {
            wsrt_parking: [
                'RTV Drenthe, het nieuws. Goedemiddag. ' +
                'All fourteen dishes of the Westerbork Synthesis Radio Telescope are back online following this week\'s calibration. ' +
                'ASTRON says a new all-sky survey begins Tuesday. The survey will focus on mapping low-frequency emissions from distant galaxies. ' +
                'The Herinneringscentrum Kamp Westerbork received a record number of school groups this month. ' +
                'The car park at the Westerbork Memorial is free for visitors. ' +
                'Weather: partly cloudy, fifteen degrees. Light south-westerly wind. Dry afternoon. ' +
                'RTV Drenthe. Fijne middag.',

                'RTV Drenthe, het nieuws. Goedemiddag. ' +
                'Astronomers at ASTRON are investigating an anomalous low-frequency signal logged by the Westerbork array. The Dutch Radiocommunications Agency has been notified. ' +
                'The Westerbork Memorial hosts a new exhibition on surveillance and digital rights this month. Entrance is free on Saturdays. ' +
                'The N371 between Westerbork and Beilen is clear of roadworks. ' +
                'Weather: sunny afternoon, sixteen degrees. ' +
                'RTV Drenthe.',
            ],
            dwingeloo: [
                'RTV Drenthe, het nieuws. Goedemiddag. ' +
                'The Dwingeloo radio telescope, a historical twenty-five-metre dish managed by the CAMRAS foundation, marks its seventieth anniversary this year. ' +
                'The instrument made headlines in the nineteen fifties as the first to map the spiral arms of our galaxy. Today it is operated largely by volunteers. ' +
                'ASTRON in Dwingeloo says the Westerbork array has logged a second anomalous signal event at the frequency under investigation. The Radiocommunications Agency has been informed. ' +
                'Weather: mild afternoon, fourteen degrees. Some cloud. ' +
                'RTV Drenthe.',

                'RTV Drenthe, middag-nieuws. ' +
                'The Dwingeloo radio telescope will be open to amateur astronomers this weekend, weather permitting. ' +
                'The surrounding nature reserve Dwingelderveld is popular for hiking and cycling. Overnight temperatures expected to drop below five degrees later this week. ' +
                'ASTRON researchers monitoring the anomalous frequency band near the German border say the signal pattern is consistent with a relay transmitter operating in short bursts to avoid detection. ' +
                'Weather: partly cloudy, thirteen degrees. Light southerly breeze. ' +
                'RTV Drenthe. Fijne middag.',
            ],
            home_from_dwingeloo: [
                'RTV Drenthe, middag-nieuws. Goedemiddag. ' +
                'Volunteers at the Dwingeloo radio telescope have reported unusual interference patterns in the dish\'s recent observation logs. CAMRAS has forwarded the data to ASTRON. ' +
                'The Dutch Radiocommunications Agency says field investigators have been deployed to the Drenthe-Germany border area to search for unlicensed transmitters. ' +
                'Weather: fourteen degrees. Largely dry with some cloud. ' +
                'RTV Drenthe.',

                'RTV Drenthe, middag-nieuws. ' +
                'ASTRON has confirmed that interference logged by the Dwingeloo telescope matches the profile of a relay transmitter, designed to boost a signal originating further east across the German border. ' +
                'The Dutch and German Radiocommunications authorities are in contact. The investigation is ongoing. ' +
                'Weather: cloudy, twelve degrees. Dry. ' +
                'RTV Drenthe.',
            ],
            astron: [
                'RTV Drenthe, het nieuws. Goedemiddag. ' + +
                'The Dutch Radiocommunications Agency has opened a formal inquiry into a possible illegal transmission on restricted frequencies near the German border. ASTRON declined to comment on the nature of the signal. ' +
                'The ASTRON visitor centre in Dwingeloo is open until five p.m. today. ' +
                'Weather: clear afternoon, seventeen degrees. ' +
                'RTV Drenthe.',

                'RTV Drenthe, middag-nieuws. Goedemiddag. ' +
                'ASTRON in Dwingeloo has confirmed it is working with the Dutch Radiocommunications Agency on an ongoing signal investigation. Scientists say the source of the anomalous transmission has been narrowed to within a few kilometres near the German border. ' +
                'The low-frequency data has been shared with European partners in the Lofar network. ' +
                'Weather: partly cloudy, fifteen degrees. Light breeze from the south. ' +
                'RTV Drenthe. Fijne middag.',
            ],
            westerbork: [
                'RTV Drenthe, het nieuws. Goedemiddag. ' +
                'The Herinneringscentrum Kamp Westerbork marks eighty years since the final deportation transport this year. ' +
                'The memorial currently hosts an exhibition on surveillance and digital rights. The WSRT dishes behind the memorial continue monitoring an anomalous frequency band flagged by ASTRON researchers. ' +
                'An educational programme for secondary schools on the history of Westerbork is fully booked through the autumn. ' +
                'Weather: sunny afternoon, fifteen degrees. Light breeze. ' +
                'RTV Drenthe.',

                'RTV Drenthe, middag-nieuws. ' +
                'The Westerbork Memorial this week marks a solemn anniversary. ' +
                'Historians and scientists gathered here to reflect on how surveillance shaped the fate of over one hundred thousand people deported from this site between nineteen forty-two and nineteen forty-four. ' +
                'The co-location of the modern Westerbork Synthesis Radio Telescope nearby serves as a reminder of how science can be used for both knowledge and harm. ' +
                'Weather: cloud and sunshine, fourteen degrees. ' +
                'RTV Drenthe.',
            ],
            home_from_westerbork: [
                'RTV Drenthe, het nieuws. Goedemiddag. ' +
                'ASTRON researchers confirm an unusual signal logged by the Westerbork array has been triangulated to the German side of the border near Steckerdoser Heide. ' +
                'The Dutch Radiocommunications Agency is coordinating with its German counterpart, the Bundesnetzagentur. No further details have been released. ' +
                'The Westerbork Memorial was visited by over five hundred people today. ' +
                'Weather: clear, eleven degrees. Dry through the evening. ' +
                'RTV Drenthe.',

                'RTV Drenthe, avond-nieuws. Goedenavond. ' +
                'German federal police have confirmed they are aware of the Dutch Radiocommunications Agency investigation but declined to elaborate. ' +
                'ASTRON says a second anomalous signal was detected briefly on the same frequency band this afternoon, before disappearing. ' +
                'The situation is being monitored. Amateur radio operators are asked to remain vigilant. ' +
                'Weather: ten degrees. Clear evening ahead. ' +
                'RTV Drenthe.',
            ],
            home_from_wsrt_parking: [
                'RTV Drenthe, het nieuws. Goedemiddag. ' +
                'All WSRT dishes are online. The ASTRON science team reports clear skies for tonight\'s observation window. ' +
                'The Herinneringscentrum Kamp Westerbork has extended its digital-rights exhibition through the end of the month. Entrance is free. ' +
                'The Drenthe cycle route network near Hoogeveen has been extended by twelve kilometres this autumn. ' +
                'Weather: clear evening, twelve degrees. ' +
                'RTV Drenthe.',

                'RTV Drenthe, avond-nieuws. ' +
                'ASTRON scientists say tonight\'s observation window is ideal. The Westerbork array will scan a broad southern sky sector after nightfall. ' +
                'The signal investigation remains ongoing. ASTRON and the Radiocommunications Agency will issue a joint statement when analysis is complete. ' +
                'Weather: clear, eleven degrees. Light northerly wind. ' +
                'RTV Drenthe.',
            ],
            home_from_astron: [
                'RTV Drenthe, het nieuws. Goedenavond. ' +
                'ASTRON scientists have confirmed the anomalous signal detected by the Westerbork array originates from coordinates in Lower Saxony, Germany. ' +
                'The Dutch and German Radiocommunications authorities say the signal used encoding techniques not associated with any licensed operator. ' +
                'German federal police have launched an investigation near the Steckerdoser Heide area, a protected nature reserve in Lower Saxony adjacent to the Dutch border. ' +
                'Weather: clear evening, nine degrees. ' +
                'RTV Drenthe.',

                'RTV Drenthe, avond-nieuws. Goedenavond. ' +
                'Breaking this hour: ASTRON has shared signal analysis data with the Dutch military intelligence service, the MIVD, following a request by the Ministry of Defence. ' +
                'The anomalous transmission used frequency-hopping spread-spectrum techniques normally associated with military or intelligence communications hardware. ' +
                'ASTRON director says the science community has a duty to report such findings. ' +
                'Weather: nine degrees and clear. Frost possible overnight in open areas. ' +
                'RTV Drenthe.',
            ],
            hackerspace: [
                'RTV Drenthe, avond-nieuws. Goedenavond. ' +
                'Hackerspace Drenthe in Coevorden celebrates its second anniversary this month. ' +
                'The maker space hosts eighty active members with weekly sessions in 3D printing, electronics and mesh networking. The municipality of Coevorden confirmed a digital infrastructure grant for rural communities in south Drenthe. ' +
                'Tonight the hackerspace hosts an open evening from seven p.m. Visitors are welcome. ' +
                'Weather: clear evening, twelve degrees. ' +
                'RTV Drenthe. Prettige avond.',

                'RTV Drenthe, avond-nieuws. ' +
                'The Dutch amateur radio society VERON reports growing interest in low-power LoRa mesh networks following coverage of the Drenthe signal investigation. ' +
                'Hackerspace Drenthe has seen a sharp rise in membership enquiries this month. ' +
                'A presentation on open hardware and SDR, software defined radio, is on the programme for tonight\'s open session in Coevorden. ' +
                'Weather: eleven degrees. Dry. Light southerly wind. ' +
                'RTV Drenthe.',
            ],
            home_from_hackerspace: [
                'RTV Drenthe, laat avond-nieuws. Goedenavond. ' +
                'The Hackerspace Drenthe session concluded with a presentation on LoRa mesh networking. ' +
                'Attendees heard how low-power sensor networks can provide resilient communications in rural areas with limited infrastructure, a topic of increasing interest given recent events near Westerbork. ' +
                'The N34 near Coevorden is clear following earlier maintenance works. ' +
                'Weather: clear, eight degrees. ' +
                'RTV Drenthe. Goedenacht.',

                'RTV Drenthe, avond-nieuws. ' +
                'A joint presentation by Hackerspace Drenthe and VERON members tonight drew the largest audience of the year. ' +
                'Speakers demonstrated a working LoRa mesh node network spanning twenty kilometres across rural Drenthe, using open-hardware radios. ' +
                'Several attendees expressed interest in linking nodes to the amateur radio community around Westerbork. ' +
                'Weather: eight degrees. Clear night ahead. Good visibility. ' +
                'RTV Drenthe.',
            ],
            lofar: [
                'RTV Drenthe, het nieuws. Goedemiddag. ' +
                'The Lofar low-frequency radio telescope in Exloo is expanding its international baseline. New partner stations in Poland and Sweden are expected online next quarter. ' +
                'ASTRON researchers say Lofar will join the investigation into an anomalous signal near the German border, providing complementary baseline data to the Westerbork array. ' +
                'The Lofar core site near Exloo is not open to public visitors. ' +
                'Weather: overcast afternoon, thirteen degrees. ' +
                'RTV Drenthe.',

                'RTV Drenthe, middag-nieuws. ' +
                'Lofar is the world\'s largest low-frequency radio telescope, with stations spread across Europe. The core array in Exloo, Drenthe, contains the highest density of antennas. ' +
                'Scientists say Lofar\'s sensitivity in the frequency band used by the anomalous signal near Westerbork makes it an ideal tool to characterise the source. ' +
                'Results are expected to be shared with the Radiocommunications Agency within days. ' +
                'Weather: light cloud, fourteen degrees. Dry afternoon. ' +
                'RTV Drenthe.',
            ],
            home_from_lofar: [
                'RTV Drenthe, avond-nieuws. Goedenavond. ' +
                'ASTRON confirms Lofar has recorded a previously unlogged signal in the frequency band under investigation near the German border. ' +
                'The data has been shared with the Dutch Radiocommunications Agency and, at the agency\'s request, with the Bundesnetzagentur in Germany. ' +
                'Scientists say this is now a cross-border investigation involving at least three national authorities. ' +
                'Weather: partly cloudy, ten degrees. ' +
                'RTV Drenthe. Goedenacht.',

                'RTV Drenthe, avond-nieuws. ' +
                'The Lofar data released today matches the profile of a signal previously detected only in classified military spectra, according to anonymous sources close to the investigation. ' +
                'ASTRON and the Radiocommunications Agency declined to confirm or deny this characterisation. ' +
                'The Dutch parliament\'s defence committee has requested a briefing from the Minister of Defence on the matter. ' +
                'Weather: ten degrees. Cloud increasing overnight. ' +
                'RTV Drenthe. Goedenacht.',
            ],
        };

        const pool    = BULLETINS[destination] || ['RTV Drenthe, het nieuws. Goedemiddag. Rustige dag in Drenthe. Weer: aangenaam. RTV Drenthe.'];
        const bulletin = pool[Math.floor(Math.random() * pool.length)];

        const isEvening = destination && (destination.includes('hackerspace') || destination.includes('lofar') || destination.includes('from_'));
        const stationLabel = isEvening ? 'RTV DRENTHE — AVOND-NIEUWS' : 'RTV DRENTHE — MIDDAG-NIEUWS';

        return new Promise(resolve => {
            // Show overlay — skip button resolves the promise immediately
            const skipAndResolve = () => {
                this._removeRadioOverlay();
                resolve();
            };
            this._showRadioOverlay(bulletin, stationLabel, skipAndResolve);

            // Speak after jingle + pips settle (6 s); resolve when TTS finishes
            const tid = setTimeout(() => {
                if (!window.game || window.game.currentScene !== 'driving_day') {
                    resolve();
                    return;
                }
                if (vm && typeof vm.speak === 'function') {
                    vm.speak(bulletin, 'Documentary').then(() => {
                        const t2 = setTimeout(() => {
                            this._removeRadioOverlay();
                            resolve();
                        }, 2500);
                        this._timeoutIds.push(t2);
                    });
                } else {
                    // No TTS fallback: estimate reading time
                    const readMs = Math.max(20000, bulletin.split(' ').length * 450);
                    const t2 = setTimeout(() => {
                        this._removeRadioOverlay();
                        resolve();
                    }, readMs);
                    this._timeoutIds.push(t2);
                }
            }, 6000);
            this._timeoutIds.push(tid);
        });
    },

    _stopRadio() {
        if (this._radioGain) {
            try { this._radioGain.gain.setValueAtTime(0, this._audioCtx.currentTime); } catch(e) {}
            this._radioGain = null;
        }
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
        // Stop TTS
        try {
            const vm = window.voiceManager;
            if (vm && vm.stop) vm.stop();
        } catch(e) {}
        console.log('[DrivingDay] RTV Drenthe radio stopped');
    },

    onEnter: function(gameInstance) {
        const g = gameInstance || window.game;
        const destination = g.getFlag('driving_destination');

        console.log('[DrivingDay] Scene entered. Destination:', destination);

        // Clear any previous timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        // Start RTV Drenthe Web Audio: engine hum, road noise, jingle, pips, news stinger, pop music.
        // _speakRadioNews() speaks the TTS bulletin over the stinger and returns a Promise that
        // resolves when the bulletin finishes. Each destination's dialogue is chained onto that
        // Promise so the news always plays first, uninterrupted (no dialogue box is active while
        // the news plays, so the dialogue click handler cannot cancel it).
        this._startRadio();

        // Clear destination flag before the async chain so it isn't read stale later
        g.setFlag('driving_destination', null);

        this._speakRadioNews(destination).then(() => {
            if (!window.game || window.game.currentScene !== 'driving_day') return;

            const TR = {
                wsrt_parking:           { advance: 40, scene: 'wsrt_parking',  notify: null },
                astron:                 { advance: 40, scene: 'wsrt_parking',  notify: null },
                dwingeloo:              { advance: 30, scene: 'dwingeloo',      notify: null },
                home_from_dwingeloo:    { advance: 30, scene: 'garden',         notify: 'Returned to garden' },
                westerbork:             { advance: 40, scene: 'wsrt_parking',  notify: null },
                home_from_westerbork:   { advance: 40, scene: 'garden',        notify: 'Returned to garden' },
                home_from_wsrt_parking: { advance: 40, scene: 'garden',        notify: 'Returned to garden' },
                home_from_astron:       { advance: 40, scene: 'mancave',       notify: 'Returned to mancave' },
                hackerspace:            { advance: 25, scene: 'hackerspace',   notify: null },
                home_from_hackerspace:  { advance: 25, scene: 'garden',        notify: 'Returned to garden' },
                lofar:                  { advance: 30, scene: 'lofar',         notify: null },
                home_from_lofar:        { advance: 30, scene: 'garden',        notify: 'Returned to garden' },
            };
            const tr = TR[destination] || { advance: 30, scene: 'mancave', notify: null };
            g.advanceTime(tr.advance);
            if (tr.notify) g.showNotification(tr.notify);
            g.loadScene(tr.scene);
        });
    },

    onExit: function() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        // Remove radio overlay and word-reveal interval
        this._removeRadioOverlay();

        // Stop RTV Drenthe radio
        this._stopRadio();

        if (window.game && window.game.isDialogueActive) {
            window.game._dialogueCallback = null; // prevent callback firing during exit
            window.game.endDialogue();
        }
    }
};

// Register scene
if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(DrivingDayScene);
}
