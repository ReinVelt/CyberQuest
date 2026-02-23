/**
 * Driving Day Scene - Volvo Interior (Daytime)
 * Transition scene for daytime drives through the Drenthe countryside.
 * Used for: Compascuum ↔ WSRT/ASTRON (Westerbork, ~40 min each way)
 *
 * Destinations handled:
 *   'astron'           → drive TO WSRT to meet Cees Bassa
 *   'home_from_astron' → drive back FROM WSRT after Cees's briefing
 *
 * Audio: Car radio tuned to RTV Drenthe (regional Dutch broadcaster)
 *        — Web Audio API synthesised jingle, news, weather & pop music
 */

const DrivingDayScene = {
    id: 'driving_day',
    name: 'Volvo - Day Drive',

    background: 'assets/images/scenes/driving_day.svg',

    description: 'Afternoon sun through the windscreen. Flat Drenthe fields, WSRT dishes on the horizon, your thoughts running ahead of the car.',

    playerStart: { x: 50, y: 50 },
    hotspots: [],

    // Store timeout IDs for cleanup
    _timeoutIds: [],

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

    /** Speak RTV Drenthe radio news via TTS */
    _speakRadioNews(destination) {
        try {
            const vm = window.voiceManager;
            if (!vm) return;

            // Build news bulletin based on where the player is going
            let bulletin;
            if (destination === 'astron') {
                bulletin = 'RTV Drenthe, het nieuws. ' +
                    'Goedemiddag. ' +
                    'Good afternoon, this is RTV Drenthe news. ' +
                    'The Westerbork Synthesis Radio Telescope completed its annual maintenance cycle this week. ' +
                    'ASTRON reports all fourteen dishes are back online and calibrated for the summer observation season. ' +
                    'In other news, the province of Drenthe has approved new funding for the Radio Quiet Zone around the telescope array. ' +
                    'And now the weather. ' +
                    'Partly cloudy this afternoon with temperatures around sixteen degrees. ' +
                    'Light winds from the south-west. Dry through the evening. ' +
                    'That was RTV Drenthe. Music continues.';
            } else {
                bulletin = 'RTV Drenthe, het nieuws. ' +
                    'Good evening, this is RTV Drenthe news. ' +
                    'Local authorities in Emmen have announced roadworks on the N34 near Coevorden starting next week. ' +
                    'Expect delays of up to fifteen minutes during peak hours. ' +
                    'The Drenthe provincial council confirmed additional investment in fibre optic infrastructure for rural areas. ' +
                    'And the weather outlook. ' +
                    'Clear skies this evening, cooling to nine degrees overnight. ' +
                    'Tomorrow, sunshine with occasional clouds. Highs of seventeen. ' +
                    'That was RTV Drenthe. Back to the music.';
            }

            // Delay the TTS to start after the news jingle
            setTimeout(() => {
                if (vm.speak) {
                    vm.stop();
                    vm.speak(bulletin, 'Documentary');
                }
            }, 8500); // after jingle + pips + news stinger

        } catch (e) {
            console.warn('[DrivingDay] Radio TTS failed:', e);
        }
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

        // Start RTV Drenthe autoradio
        this._startRadio();
        this._speakRadioNews(destination);

        if (destination === 'astron') {
            // Compascuum → Westerbork (~40 min, afternoon)
            const t1 = setTimeout(() => {
                g.startDialogue([
                    { speaker: '',      text: '*Afternoon sun on the N34. The Volvo heads south-west toward Westerbork.*' },
                    { speaker: '',      text: '*The autoradio is tuned to RTV Drenthe. A jingle plays, followed by the afternoon news.*' },
                    { speaker: 'Ryan',  text: 'Forty minutes. Maybe less — no tractors on a Thursday afternoon.' },
                    { speaker: 'Ryan',  text: 'Cees Bassa. Satellite tracker, ASTRON researcher, amateur radio wizard.' },
                    { speaker: 'Ryan',  text: 'If anyone can verify those schematics, it\'s him.' },
                    { speaker: '',      text: '*The flat Drenthe fields stretch to every horizon. Wind turbines turning slowly.*' },
                    { speaker: 'Ryan',  text: 'He was sceptical on the Meshtastic chat.' },
                    { speaker: 'Ryan',  text: '"Send me the data. I\'ll run it through the pipeline."' },
                    { speaker: 'Ryan',  text: 'Then silence for six hours. Then: "Get over here. Now."' },
                    { speaker: '',      text: '*Road sign flashes past: Westerbork 12 km*' },
                    { speaker: 'Ryan',  text: 'Whatever he found in that data was enough to pull me out of the mancave.' },
                    { speaker: 'Ryan',  text: 'ASTRON. Fourteen WSRT dishes listening to the cosmos.' },
                    { speaker: 'Ryan',  text: 'Today they listen for something man-made.' },
                    { speaker: '',      text: '*White parabolic dishes appear above the treeline, glinting in the sun.*' },
                    { speaker: 'Ryan',  text: 'There they are. Fourteen ears, all pointing the same way.' },
                    { speaker: 'Ryan',  text: 'Let\'s hear what Cees has to say.' }
                ]);

                const t2 = setTimeout(() => {
                    g.advanceTime(40);
                    g.loadScene('astron');
                }, 17000);
                this._timeoutIds.push(t2);
            }, 1000);
            this._timeoutIds.push(t1);

        } else if (destination === 'home_from_astron') {
            // Westerbork → Compascuum (~40 min, evening light)
            const t1 = setTimeout(() => {
                g.startDialogue([
                    { speaker: '',      text: '*The WSRT dishes shrink in the rear-view mirror. Golden evening light.*' },
                    { speaker: '',      text: '*RTV Drenthe plays softly on the autoradio. Evening news, then Dutch pop music.*' },
                    { speaker: 'Ryan',  text: 'Confirmed. All of it. The weapon, the signal, the coordinates.' },
                    { speaker: 'Ryan',  text: '53.28 north, 7.42 east. Steckerdoser Heide. Right across the German border.' },
                    { speaker: '',      text: '*N34 heading north-east. Sky turning orange over the fields.*' },
                    { speaker: 'Ryan',  text: 'Cees was shaken. A man who tracks spy satellites for fun — shaken.' },
                    { speaker: 'Ryan',  text: 'Weaponised radio. Russian-school signal processing algorithms. Built on German soil.' },
                    { speaker: 'Ryan',  text: 'And he gave me a Meshtastic node. "Come back in one piece."' },
                    { speaker: '',      text: '*A canal barge passes below a bridge. The engine hum fills the cabin.*' },
                    { speaker: 'Ryan',  text: 'Now I have proof. The schematics. Cees\'s spectral analysis. The triangulated coordinates.' },
                    { speaker: 'Ryan',  text: 'But proof means nothing without action.' },
                    { speaker: 'Ryan',  text: 'Eva is counting on me. Time to plan the infiltration.' },
                    { speaker: '',      text: '*Approaching Compascuum. The outline of the farmhouse against the darkening sky.*' },
                    { speaker: 'Ryan',  text: 'One step closer. Try not to get killed on the next step.' }
                ]);

                const t2 = setTimeout(() => {
                    g.advanceTime(40);
                    g.loadScene('mancave');
                    g.showNotification('Returned to mancave');
                }, 15000);
                this._timeoutIds.push(t2);
            }, 1000);
            this._timeoutIds.push(t1);

        } else {
            console.warn('[DrivingDay] No recognised destination set! Flag was:', destination);
            const t = setTimeout(() => {
                g.loadScene('mancave');
            }, 2000);
            this._timeoutIds.push(t);
        }

        // Clear destination flag
        g.setFlag('driving_destination', null);
    },

    onExit: function() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        // Stop RTV Drenthe radio
        this._stopRadio();

        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }
    }
};

// Register scene
if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(DrivingDayScene);
}
