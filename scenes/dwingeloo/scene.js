/**
 * Dwingeloo Radio Observatory Scene
 * Historic 25m single-dish telescope, operational since 1956.
 * Reached from regional_map via the Dwingeloo marker.
 * Purpose: educational about Dutch radio astronomy history + find old Cold War broadcast.
 */

const DwingelooScene = {
    id: 'dwingeloo',
    name: 'Dwingeloo Radio Observatory',

    background: 'assets/images/scenes/dwingeloo.svg',

    description: 'The historic Dwingeloo Radio Telescope — 25 metres, built 1956, UNESCO World Heritage Site.',

    playerStart: { x: 50, y: 85 },

    // 🎬 Accessibility / Movie Mode
    accessibilityPath: [
        'telescope_dish',     // look at the dish, learn its history
        'control_building',   // find broadcast log → sets dwingeloo_broadcast_found
        'telescope_fence',    // discover relay transmitter → sets dwingeloo_transmitter_found
        async function(game) {
            // Drive home after finding transmitter
            game.setFlag('driving_destination', 'home_from_dwingeloo');
            game.loadScene('driving_day');
        }
    ],

    hotspots: [
        // ── The Telescope Dish ──
        {
            id: 'telescope_dish',
            name: 'Dwingeloo Telescope — 25m Dish',
            x: 36,
            y: 16,
            width: 30,
            height: 40,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Twenty-five metres across. Built in 1956. For thirty years it was the world\'s largest fully steerable radio telescope.' },
                    { speaker: 'Ryan', text: 'It discovered that the Milky Way has spiral arms — the same structure as other galaxies. That was 1958. Jan Oort and his team used the 21 cm hydrogen line.' },
                    { speaker: 'Ryan', text: 'The 21 cm line — hydrogen emits radio waves at exactly 1420.405752 MHz when its electron flips spin. Every hydrogen atom in the universe does this.' },
                    { speaker: 'Ryan', text: 'By mapping where this signal came from, they mapped our entire galaxy. From right here, in Drenthe.' },
                    { speaker: 'Narrator', text: '📚 EDUCATIONAL: The Dwingeloo telescope is now operated by the Camras Foundation (CAMRAS = C.A. Muller Radio Astronomy Station). Volunteers run it for amateur radio and outreach. It\'s on the UNESCO World Heritage list.' },
                ]);
            }
        },

        // ── Control Building ──
        {
            id: 'control_building',
            name: 'Observatory Control Building',
            x: 14.5,
            y: 68,
            width: 16,
            height: 13,
            cursor: 'pointer',
            action: (game) => {
                const foundBroadcast = game.getFlag('dwingeloo_broadcast_found');
                if (foundBroadcast) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The control room. Old hardware, but still functional. And that anomalous broadcast is still logged in the receiver records.' },
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The control building is unlocked — it\'s a volunteer-run observatory. Anyone can visit on open days.' },
                        { speaker: 'Narrator', text: '*Ryan steps inside. Banks of vintage equipment line the walls alongside modern computers*' },
                        { speaker: 'Ryan', text: 'Beautiful. Original 1950s receivers next to modern SDR setups. The volunteers keep it all running.' },
                        { speaker: 'Ryan', text: 'Wait... the logging computer shows something unusual.' },
                        { speaker: 'Narrator', text: '*Ryan reads the screen*' },
                        { speaker: 'Ryan', text: '"PERIODIC SIGNAL — 1420.500 MHz — STRUCTURED PATTERN — FIRST DETECTED 14 DAYS AGO"' },
                        { speaker: 'Ryan', text: '1420.500 MHz. That\'s just 95 kHz above the hydrogen line. Close enough to hide in the noise for most observers.' },
                        { speaker: 'Ryan', text: 'But someone with access to this telescope noticed it. The signal has structure — it\'s not natural. It\'s data.' },
                        { speaker: 'Ryan', text: 'And it\'s been broadcasting for two weeks. Whatever Operation Zerfall is, it\'s been active longer than I thought.' },
                    ], () => {
                        game.setFlag('dwingeloo_broadcast_found', true);
                        game.setFlag('zerfall_duration_known', true);
                        game.addEvidence({
                            id: 'dwingeloo_signal_log',
                            name: 'Dwingeloo Signal Log',
                            description: 'Observatory log shows a structured signal at 1420.500 MHz — 95 kHz above the hydrogen line — active for 14+ days. Consistent with a covert data broadcast using natural radio frequency as cover.',
                            icon: '📋'
                        });
                        game.showNotification('📋 Evidence added: Dwingeloo Signal Log');
                    });
                }
            }
        },

        // ── Information Sign ──
        {
            id: 'info_sign',
            name: 'Information Sign',
            x: 67,
            y: 71,
            width: 9,
            height: 10,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Narrator', text: '📚 DWINGELOO TELESCOPE — KEY FACTS' },
                    { speaker: 'Narrator', text: 'Diameter: 25 metres. Built: 1956. Decommissioned as research instrument: 1999.' },
                    { speaker: 'Narrator', text: 'Major discoveries: spiral arm structure of the Milky Way (1958), several new galaxies behind the galactic plane hidden by dust.' },
                    { speaker: 'Narrator', text: 'Current status: operated by CAMRAS volunteers. Used for amateur radio, SETI (Search for Extraterrestrial Intelligence), and educational outreach.' },
                    { speaker: 'Narrator', text: 'The telescope can still receive signals from spacecraft. In 2014 volunteers tracked the Rosetta comet mission.' },
                    { speaker: 'Narrator', text: 'UNESCO World Heritage Site (2024) as part of the Dutch Radio Telescope Sites.' },
                ]);
            }
        },

        // ── Gate / Fence puzzle ──
        {
            id: 'telescope_fence',
            name: 'Perimeter Fence',
            x: 13,
            y: 78,
            width: 48,
            height: 5,
            cursor: 'pointer',
            action: (game) => {
                const foundBroadcast = game.getFlag('dwingeloo_broadcast_found');
                if (foundBroadcast) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The fence. Someone attached a small RF transmitter to the base of the mount — I can see it from here.' },
                        { speaker: 'Ryan', text: 'It\'s using the telescope structure as an antenna. Clever. The telescope\'s own metalwork amplifies the signal.' },
                        { speaker: 'Ryan', text: 'That\'s how they\'re broadcasting on the hydrogen line frequency without a large dedicated transmitter.' },
                        { speaker: 'Ryan', text: 'I\'m not going to touch it. This is evidence. But now I know — the facility near Westerbork is the source of the commands, and Dwingeloo is just a relay node.' },
                    ], () => {
                        game.setFlag('dwingeloo_transmitter_found', true);
                        game.addEvidence({
                            id: 'relay_transmitter',
                            name: 'Covert Relay Transmitter',
                            description: 'Small RF transmitter attached to Dwingeloo telescope structure. Uses the 25m dish metalwork as a parasitic antenna to broadcast the 1420.500 MHz signal. Evidence of sophisticated infrastructure for Operation Zerfall.',
                            icon: '📡'
                        });
                        game.showNotification('📡 Evidence added: Covert Relay Transmitter');
                    });
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'A simple wire perimeter fence. The gate is open — open day today, probably.' },
                    ]);
                }
            }
        },

        // ── Education: 21cm Hydrogen Line ──
        {
            id: 'hydrogen_line_info',
            name: 'Hydrogen Line Receiver (inside window)',
            x: 15.5,
            y: 67,
            width: 5,
            height: 5,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Narrator', text: '📚 THE 21 CM HYDROGEN LINE' },
                    { speaker: 'Narrator', text: 'Hydrogen is the most common element in the universe. When a hydrogen atom\'s single electron flips its spin direction, it emits a radio wave at exactly 1420.405752 MHz.' },
                    { speaker: 'Narrator', text: 'This wavelength (21 cm) passes through dust clouds that block visible light. Radio telescopes can map the entire Milky Way using this signal.' },
                    { speaker: 'Narrator', text: 'The frequency is internationally protected — no transmitters allowed near 1420 MHz. Except someone near Westerbork is ignoring that rule.' },
                    { speaker: 'Narrator', text: 'SETI researchers often monitor the hydrogen line for alien signals, reasoning that any intelligent civilisation would know about it.' },
                ]);
            }
        },

        // ── Back to regional_map ──
        {
            id: 'back_to_map',
            name: '← Back to Map',
            x: 0,
            y: 80,
            width: 8,
            height: 20,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            targetScene: 'regional_map'
        }
    ],

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
            master.gain.linearRampToValueAtTime(1, ctx.currentTime + 4);
            master.connect(ctx.destination);
            self._audioNodes.push(master);
            // ── wind ──
            var buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var wind = ctx.createBufferSource(); wind.buffer = buf; wind.loop = true;
            var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
            var wG = ctx.createGain(); wG.gain.value = 0.028;
            wind.connect(lp).connect(wG).connect(master); wind.start();
            self._audioNodes.push(wind, lp, wG);
            // ── Dwingeloo telescope motor hum ──
            var mot = ctx.createOscillator(); mot.type = 'sine'; mot.frequency.value = 62;
            var motG = ctx.createGain(); motG.gain.value = 0.012;
            mot.connect(motG).connect(master); mot.start();
            self._audioNodes.push(mot, motG);
            // ── bird chirp ──
            var bi = setInterval(function() {
                if (!self._audioCtx) return;
                var t = ctx.currentTime;
                var osc = ctx.createOscillator(); osc.type = 'sine';
                osc.frequency.setValueAtTime(2800, t);
                osc.frequency.linearRampToValueAtTime(3200, t + 0.08);
                var env = ctx.createGain();
                env.gain.setValueAtTime(0, t);
                env.gain.linearRampToValueAtTime(0.028, t + 0.02);
                env.gain.linearRampToValueAtTime(0, t + 0.12);
                osc.connect(env).connect(master); osc.start(t); osc.stop(t + 0.14);
                self._audioNodes.push(osc, env);
            }, 4000 + Math.random() * 6000);
            self._audioIntervals.push(bi);
        } catch(e) {}
    },

    onEnter: (game) => {
        DwingelooScene._startAmbientAudio();
        if (!game.getFlag('visited_dwingeloo')) {
            game.setFlag('visited_dwingeloo', true);
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The Dwingeloo Radio Observatory. 1956. A piece of Dutch scientific history standing in the middle of Drenthe.' },
                    { speaker: 'Ryan', text: 'The volunteers keep it running. Open to visitors. I\'ve been here a dozen times.' },
                    { speaker: 'Ryan', text: 'But today I\'m not here for nostalgia. Something strange is being broadcast from this area.' },
                ]);
            }, 500);
        }
    },

    onExit: () => { DwingelooScene._stopAmbientAudio(); }
};

if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(DwingelooScene);
}
