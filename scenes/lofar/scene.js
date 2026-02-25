/**
 * Scene: LOFAR Superterp — Low Frequency Array Core
 * ═══════════════════════════════════════════════════════════
 * Accessible by day drive after visiting ASTRON.
 * Educational scene about digital beamforming and signal processing.
 * Cees Bassa meets Ryan at the Superterp — the dense antenna core.
 *
 * Flags set: visited_lofar, lofar_briefing_complete
 * ═══════════════════════════════════════════════════════════
 */

const LofarScene = {
    id: 'lofar',
    name: 'LOFAR Superterp',

    background: 'assets/images/scenes/lofar.svg',

    description: 'The LOFAR Superterp: six stations of low-frequency antennas clustered in a Dutch field. No dishes — just thousands of small antennas, listening to the universe in radio.',

    playerStart: { x: 15, y: 80 },

    idleThoughts: [
        "Thousands of antennas. No moving parts. Just mathematics.",
        "Digital beamforming — pointing a telescope with software.",
        "The radio-quiet zone protects these sensitive receivers.",
        "LOFAR can see the entire sky at once. Incredible.",
        "These antennas listen to frequencies most people ignore.",
        "Cees knows this system inside out.",
        "The computing power here rivals a small supercomputer.",
        "Nature and technology side by side. Very Dutch.",
        "Same principles as radar. Same principles as Project Echo.",
        "If Echo operates in the RF spectrum, LOFAR could detect it."
    ],

    hotspots: [
        {
            id: 'lba-antennas',
            name: 'Low Band Antennas',
            x: 10,
            y: 30,
            width: 25,
            height: 35,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Low Band Antennas — LBA. Simple crossed dipoles on the ground.' },
                    { speaker: 'Ryan', text: '10 to 90 MHz. They look like metal spiders lying in a field.' },
                    { speaker: 'Cees', text: 'Each one is cheap. The magic is in the combination.' },
                    { speaker: 'Cees', text: 'We take signals from all of them and correlate in software.' },
                    { speaker: 'Cees', text: 'No moving parts. No motors. Just electrons and mathematics.' }
                ]);
            }
        },
        {
            id: 'hba-tiles',
            name: 'High Band Antenna Tiles',
            x: 40,
            y: 25,
            width: 25,
            height: 30,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Those black tiles — HBA. High Band Antennas. 110 to 250 MHz.' },
                    { speaker: 'Cees', text: 'Each tile is a 4x4 array of bow-tie elements under a polystyrene cover.' },
                    { speaker: 'Cees', text: 'They operate at higher frequencies than the LBA. Sharper resolution.' },
                    { speaker: 'Ryan', text: 'Same frequency range as the military emergency band.' },
                    { speaker: 'Cees', text: '*Nods* 243 MHz sits right in the HBA range. That\'s why I noticed those transmissions.' }
                ]);
            }
        },
        {
            id: 'processing-cabinet',
            name: 'Processing Cabinet',
            x: 70,
            y: 40,
            width: 15,
            height: 25,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The station processing cabinet. Where raw antenna signals become data.' },
                    { speaker: 'Cees', text: 'Each station digitizes all antennas simultaneously. 200 MHz bandwidth. 16-bit ADC.' },
                    { speaker: 'Cees', text: 'The data streams to our central processor in Groningen via dedicated fibre.' },
                    { speaker: 'Ryan', text: 'How much data?' },
                    { speaker: 'Cees', text: 'At full rate? About 13 terabits per second. The entire LOFAR array generates more data per day than the Large Hadron Collider.' },
                    { speaker: 'Ryan', text: 'And you can point this at anything. Retroactively.' },
                    { speaker: 'Cees', text: 'That\'s the beauty of digital beamforming. The data is everything, everywhere, all at once. We decide WHERE to look after the fact.' }
                ]);
            }
        },
        {
            id: 'cees-lofar',
            name: 'Cees Bassa',
            x: 55,
            y: 60,
            width: 12,
            height: 20,
            cursor: 'pointer',
            action: function(game) {
                if (!game.getFlag('lofar_briefing_complete')) {
                    game.setFlag('lofar_briefing_complete', true);
                    game.startDialogue([
                        { speaker: 'Cees', text: 'Ryan, I wanted to show you this in person.' },
                        { speaker: 'Cees', text: 'LOFAR has 52 stations across Europe. 38 in the Netherlands, 14 international.' },
                        { speaker: 'Cees', text: 'Each station is an array of antennas that work together through software.' },
                        { speaker: 'Ryan', text: 'Digital beamforming. Like a giant interferometer.' },
                        { speaker: 'Cees', text: 'Exactly. And here\'s what matters for our situation:' },
                        { speaker: 'Cees', text: 'The same mathematics that let us image distant galaxies can detect artificial RF patterns.' },
                        { speaker: 'Cees', text: 'Project Echo operates in frequencies that LOFAR was built to observe.' },
                        { speaker: 'Ryan', text: 'You\'re saying LOFAR could detect Echo if it activates?' },
                        { speaker: 'Cees', text: 'Not just detect. Characterize. Map the beam pattern. Measure the power output.' },
                        { speaker: 'Cees', text: 'I\'ve already set up a monitoring pipeline. If Echo transmits, we\'ll have scientific proof in minutes.' },
                        { speaker: 'Ryan', text: 'That\'s... incredibly useful. Hard evidence that even intelligence agencies can\'t dispute.' },
                        { speaker: 'Cees', text: 'Peer-reviewed sensor data from the world\'s most sensitive radio telescope. Good luck denying that.' },
                        { speaker: 'Cees', text: 'I\'ll be monitoring from ASTRON during your operation. Meshtastic channel 3 if you need me.' },
                        { speaker: 'Ryan', text: 'Thanks, Cees. For everything.' },
                        { speaker: 'Cees', text: 'Thank me when it\'s over. And when you can, come back here properly. I\'ll give you the full tour.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Cees', text: 'Any more questions about the setup?' },
                        { speaker: 'Ryan', text: 'Just admiring the view. Thousands of antennas in a Dutch cow pasture.' },
                        { speaker: 'Cees', text: 'Best telescope in the world. And the cows don\'t seem to mind.' }
                    ]);
                }
            }
        },
        {
            id: 'field-panorama',
            name: 'Panoramic View',
            x: 0,
            y: 0,
            width: 100,
            height: 20,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The Drenthe countryside stretches in every direction. Flat. Green. Quiet.' },
                    { speaker: 'Ryan', text: 'And in the middle of it, one of the most powerful scientific instruments on Earth.' },
                    { speaker: 'Ryan', text: 'You\'d never know it was here unless you knew what to look for.' },
                    { speaker: 'Ryan', text: 'Just like the signals it detects. Hidden in the noise. Waiting to be found.' }
                ]);
            }
        },
        {
            id: 'drive-home',
            name: '← Return to car',
            x: 0,
            y: 75,
            width: 10,
            height: 20,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Time to head back. Lots to process.' }
                ]);
                game.sceneTimeout(() => {
                    game.setFlag('driving_destination', 'home_from_lofar');
                    game.loadScene('driving_day');
                }, 1500);
            }
        }
    ],

    // ── Audio: LOFAR field ambience ── 
    _audioCtx: null,
    _audioNodes: [],
    _audioIntervals: [],

    _getAudioCtx() {
        if (!this._audioCtx || this._audioCtx.state === 'closed') {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },

    _startAmbience() {
        try {
            const ctx = this._getAudioCtx();
            const now = ctx.currentTime;

            // Wind through open fields
            const windBuf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
            const wd = windBuf.getChannelData(0);
            for (let i = 0; i < wd.length; i++) wd[i] = Math.random() * 2 - 1;
            const windSrc = ctx.createBufferSource();
            windSrc.buffer = windBuf;
            windSrc.loop = true;
            const windFilt = ctx.createBiquadFilter();
            windFilt.type = 'bandpass';
            windFilt.frequency.setValueAtTime(350, now);
            windFilt.Q.setValueAtTime(1, now);
            const windGain = ctx.createGain();
            windGain.gain.setValueAtTime(0, now);
            windGain.gain.linearRampToValueAtTime(0.035, now + 2);
            // Wind gusting LFO
            const windLfo = ctx.createOscillator();
            windLfo.type = 'sine';
            windLfo.frequency.setValueAtTime(0.12, now);
            const windLfoG = ctx.createGain();
            windLfoG.gain.setValueAtTime(0.02, now);
            windLfo.connect(windLfoG);
            windLfoG.connect(windGain.gain);
            windLfo.start(now);
            windSrc.connect(windFilt);
            windFilt.connect(windGain);
            windGain.connect(ctx.destination);
            windSrc.start(now);
            this._audioNodes.push(windSrc, windFilt, windGain, windLfo, windLfoG);

            // Subtle electronic hum from processing cabinets
            const hum = ctx.createOscillator();
            hum.type = 'sine';
            hum.frequency.setValueAtTime(50, now);
            const humGain = ctx.createGain();
            humGain.gain.setValueAtTime(0, now);
            humGain.gain.linearRampToValueAtTime(0.01, now + 3);
            hum.connect(humGain);
            humGain.connect(ctx.destination);
            hum.start(now);
            this._audioNodes.push(hum, humGain);

            // Birdsong (daytime — meadow pipits)
            this._audioIntervals.push(setInterval(() => {
                if (Math.random() < 0.4) {
                    const t = ctx.currentTime;
                    const notes = 4 + Math.floor(Math.random() * 6);
                    for (let i = 0; i < notes; i++) {
                        const osc = ctx.createOscillator();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(3000 + Math.random() * 2000, t + i * 0.08);
                        const g = ctx.createGain();
                        g.gain.setValueAtTime(0.012, t + i * 0.08);
                        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.06);
                        osc.connect(g);
                        g.connect(ctx.destination);
                        osc.start(t + i * 0.08);
                        osc.stop(t + i * 0.08 + 0.07);
                    }
                }
            }, 3500));

        } catch (e) {
            console.warn('[LOFAR] Audio failed:', e);
        }
    },

    _stopAmbience() {
        this._audioIntervals.forEach(id => clearInterval(id));
        this._audioIntervals = [];
        this._audioNodes.forEach(n => {
            try { if (n.stop) n.stop(); if (n.disconnect) n.disconnect(); } catch(e) {}
        });
        this._audioNodes = [];
        if (this._audioCtx && this._audioCtx.state !== 'closed') {
            this._audioCtx.close().catch(() => {});
            this._audioCtx = null;
        }
    },

    onEnter(game) {
        game.setFlag('visited_lofar', true);
        this._startAmbience();

        if (!game.getFlag('first_lofar_visit')) {
            game.setFlag('first_lofar_visit', true);
            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: 'LOFAR Superterp — Exloo, Drenthe' },
                    { speaker: '', text: '*A vast field of antennas stretches to the horizon. No dishes — just rows of delicate metal structures and black tiles.*' },
                    { speaker: 'Cees', text: 'Welcome to LOFAR, Ryan. The world\'s largest low-frequency radio telescope.' },
                    { speaker: 'Cees', text: 'What you see here is the Superterp — the dense core. Six stations, thousands of antennas.' },
                    { speaker: 'Ryan', text: 'It doesn\'t look like a telescope at all.' },
                    { speaker: 'Cees', text: 'That\'s because it isn\'t one — it\'s thousands. Combined by math. Click around, I\'ll explain.' }
                ]);
            }, 500);
        }
    },

    onExit() {
        this._stopAmbience();
    }
};

// Register
if (typeof window.game !== 'undefined') {
    window.game.registerScene(LofarScene);
} else if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(LofarScene);
}
