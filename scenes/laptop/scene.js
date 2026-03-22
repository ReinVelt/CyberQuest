/**
 * Laptop Scene — Ryan's networked Kali Linux laptop
 * Handles: email check, the dilemma, ally recruitment, Volkov investigation.
 *
 * Reached from: mancave → laptop hotspot
 * Returns to:   mancave (via back_to_mancave)
 */

const LaptopScene = {
    id: 'laptop',
    name: 'Laptop — Kali Linux',

    background: 'assets/images/scenes/laptop.svg',

    description: 'Ryan\'s laptop running Linux. Browser tabs, terminal windows, and a dead man\'s switch script running in the background.',

    playerStart: { x: 50, y: 80 },

    // 🎬 Accessibility / Movie Mode
    // Screen auto-opens on enter; runner just waits for it to close then navigates back.
    accessibilityPath: [
        async function(game) {
            // Wait until all pending laptop work is done before returning to mancave.
            // Mirrors the same guard used by mancave's accessibilityPath to decide
            // whether to send the player here in the first place.
            function needsWork() {
                return !game.getFlag('checked_email')
                    || (game.getFlag('evidence_unlocked') && !game.getFlag('volkov_investigated'));
            }
            var deadline = Date.now() + 300000; // 5-min safety cap
            while (needsWork() && Date.now() < deadline) {
                await new Promise(function(r) { setTimeout(r, 1500); });
            }
            game.loadScene('mancave');
        }
    ],

    idleThoughts: [
        "Kali Linux. The hacker's Swiss Army knife.",
        "That dead man's switch script is still running.",
        "52 unread emails. I should deal with those.",
        "Open tabs: ProtonMail, Shodan, GitHub, and WikiLeaks. Standard morning.",
        "VPN is up. Tor is running. I'm invisible. Probably.",
    ],

    hotspots: [
        // ── Laptop Screen — re-opens the display if closed ────────────
        {
            id: 'laptop_screen',
            name: 'Laptop Screen',
            x: 5,
            y: 5,
            width: 85,
            height: 80,
            cursor: 'pointer',
            action: function(game) {
                LaptopScene._openScreen(game);
            }
        },

        // ── Back to Mancave ───────────────────────────────────────────
        {
            id: 'back_to_mancave',
            name: '← Mancave',
            x: 88,
            y: 88,
            width: 12,
            height: 12,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                game.loadScene('mancave');
            }
        }
    ],

    // ── Open (or re-open) the screen overlay ────────────────────────────
    _openScreen: function(game) {
        var opts = LaptopScene._getScreenOpts(game);
        if (window.LaptopScreen) {
            window.LaptopScreen.show(game, opts);
        } else if (opts.onComplete) {
            opts.onComplete();
        }
    },

    // ── Screen narrative + onComplete actions — no popup dialogs ────────
    _getScreenOpts: function(game) {

        // Part 9: USB evidence analysed — play dilemma cinematic
        if (game.getFlag('evidence_unlocked') && !game.getFlag('started_ally_search')) {
            return {
                narrative: [
                    { speaker: '',      text: '* The USB drive. Everything is on it. *' },
                    { speaker: 'Ryan',  text: 'FSB. Eight dead. ZERFALL is real.' },
                    { speaker: 'Ryan',  text: 'I have to decide what to do with this.' }
                ],
                onComplete: function() { window.MancaveDilemma.play(game); }
            };
        }

        // Part 10: Ally recruitment
        if (game.getFlag('started_ally_search') && !game.getFlag('all_allies_contacted')) {
            if (!game.getFlag('contacted_allies')) {
                return {
                    narrative: [
                        { speaker: 'Ryan', text: 'Cees, Jaap, David. They need to know.' },
                        { speaker: 'Ryan', text: 'Composing encrypted messages — one chance to get this right.' }
                    ],
                    onComplete: function() { window.MancaveAllyRecruitment.play(game); }
                };
            }
            return {
                narrative: [
                    { speaker: 'Ryan', text: 'Messages sent. Three allies alerted.' },
                    { speaker: 'Ryan', text: 'Volkov is still out there. Need to dig deeper.' }
                ]
            };
        }

        // Part 11: Volkov OSINT dive
        if (game.getFlag('all_allies_contacted') && !game.getFlag('volkov_investigated')) {
            return {
                narrative: [
                    { speaker: 'Ryan', text: 'Dr. Dieter Wolff. That\'s your cover name.' },
                    { speaker: '',      text: '* Ryan starts the OSINT deep-dive *' }
                ],
                onComplete: function() { window.MancaveVolkovInvestigation.playVolkovDive(game); }
            };
        }

        // Done: point to secure phone
        if (game.getFlag('volkov_investigated')) {
            return {
                narrative: [
                    { speaker: 'Ryan', text: 'Volkov. FSB. Eight people dead.' },
                    { speaker: 'Ryan', text: 'Chris Kubecka can go deeper. I need the secure phone.' }
                ],
                onComplete: function() {
                    game.showNotification('Use the secure phone to contact Chris Kubecka');
                }
            };
        }

        // Early game: first email check
        if (!game.getFlag('checked_email')) {
            game.setFlag('checked_email', true);
            game.advanceTime(60);
            return {
                narrative: [
                    { speaker: 'Ryan', text: 'Newsletter, spam...' },
                    { speaker: '',      text: '* Ryan pauses on the third message *' },
                    { speaker: 'Ryan', text: 'Anonymous. PGP-encrypted. "They know about Project ECHO."' },
                    { speaker: 'Ryan', text: '"Your dead man\'s switch is the only thing keeping this from going dark."' },
                    { speaker: '',      text: '* Ryan leans back. Hands not quite steady. *' },
                    { speaker: 'Ryan', text: 'Dead man\'s switch: armed. 71 hours. Good.' },
                    { speaker: 'Ryan', text: 'Back to the auth module. Pretend everything is normal.' }
                ],
                onComplete: function() {
                    setTimeout(function() {
                        game.showNotification('Something strange is happening with the SSTV terminal...');
                    }, 3000);
                }
            };
        }

        // Idle
        return { narrative: [] };
    },

    // ── Ambient Audio — Biosphere-style arctic drones ────────────────────
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
        this._audioIntervals.forEach(function(id) { clearTimeout(id); clearInterval(id); });
        this._audioIntervals = [];
        this._audioNodes.forEach(function(n) { try { if (n.stop) n.stop(); n.disconnect(); } catch(e) {} });
        this._audioNodes = [];
        if (this._audioCtx) { try { this._audioCtx.close(); } catch(e) {} this._audioCtx = null; }
    },
    _startAmbientAudio: function() {
        // Biosphere-style: deep organ drone + arctic wind noise + sparse pentatonic sparkles
        var self = this, ctx = this._getAudioCtx();
        if (!ctx) return;
        try {
            var t = ctx.currentTime;
            // master compressor + output gain
            var comp = ctx.createDynamicsCompressor();
            comp.threshold.value = -22; comp.ratio.value = 4;
            comp.connect(ctx.destination);
            var master = ctx.createGain();
            master.gain.setValueAtTime(0, t);
            master.gain.linearRampToValueAtTime(0.82, t + 7);
            master.connect(comp);
            self._audioNodes.push(master, comp);

            // ── 1. Deep drone cluster ──
            [[40, 0.038], [40.7, 0.030], [80.2, 0.022]].forEach(function(pair) {
                var f = pair[0], g = pair[1];
                var osc = ctx.createOscillator();
                osc.type = 'sine'; osc.frequency.value = f;
                var lfo = ctx.createOscillator();
                lfo.type = 'sine'; lfo.frequency.value = 0.07 + Math.random() * 0.04;
                var lfoG = ctx.createGain(); lfoG.gain.value = g * 0.3;
                var gainN = ctx.createGain(); gainN.gain.value = g;
                lfo.connect(lfoG); lfoG.connect(gainN.gain);
                osc.connect(gainN); gainN.connect(master);
                osc.start(t); lfo.start(t);
                self._audioNodes.push(osc, lfo, lfoG, gainN);
            });

            // ── 2. Arctic wind ──
            var wBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
            var wd = wBuf.getChannelData(0);
            for (var i = 0; i < wd.length; i++) wd[i] = Math.random() * 2 - 1;
            var wind = ctx.createBufferSource();
            wind.buffer = wBuf; wind.loop = true; wind.start(t);
            var windLp = ctx.createBiquadFilter();
            windLp.type = 'lowpass'; windLp.frequency.value = 160; windLp.Q.value = 0.6;
            windLp.frequency.linearRampToValueAtTime(520, t + 35);
            windLp.frequency.linearRampToValueAtTime(160, t + 70);
            windLp.frequency.linearRampToValueAtTime(520, t + 105);
            var windBp = ctx.createBiquadFilter();
            windBp.type = 'bandpass'; windBp.frequency.value = 220; windBp.Q.value = 1.8;
            var windG = ctx.createGain(); windG.gain.value = 0.038;
            wind.connect(windLp); windLp.connect(windBp); windBp.connect(windG); windG.connect(master);
            self._audioNodes.push(wind, windLp, windBp, windG);

            // ── 3. Atmosphere pad (sawtooth → LP → gain) ──
            var pad = ctx.createOscillator();
            pad.type = 'sawtooth'; pad.frequency.value = 110.2;
            var padLp = ctx.createBiquadFilter();
            padLp.type = 'lowpass'; padLp.frequency.value = 320; padLp.Q.value = 2.2;
            padLp.frequency.linearRampToValueAtTime(700, t + 28);
            padLp.frequency.linearRampToValueAtTime(300, t + 56);
            var padTr = ctx.createOscillator();
            padTr.type = 'sine'; padTr.frequency.value = 0.042;
            var padTrG = ctx.createGain(); padTrG.gain.value = 0.006;
            var padG = ctx.createGain(); padG.gain.value = 0.018;
            padTr.connect(padTrG); padTrG.connect(padG.gain);
            pad.connect(padLp); padLp.connect(padG); padG.connect(master);
            pad.start(t); padTr.start(t);
            self._audioNodes.push(pad, padLp, padTr, padTrG, padG);

            // ── 4. Sparse melodic events (D minor pentatonic) ──
            var NOTES = [146.8, 174.6, 220, 261.6, 293.7, 349.2];
            function sparkNote() {
                var ctx2 = self._getAudioCtx();
                if (!ctx2) return;
                var now = ctx2.currentTime;
                var f   = NOTES[Math.floor(Math.random() * NOTES.length)];
                var atk = 2.5 + Math.random() * 1.5;
                var rel = 8 + Math.random() * 6;
                var osc = ctx2.createOscillator();
                osc.type = 'sine'; osc.frequency.value = f;
                var env = ctx2.createGain();
                env.gain.setValueAtTime(0, now);
                env.gain.linearRampToValueAtTime(0.042, now + atk);
                env.gain.linearRampToValueAtTime(0, now + atk + rel);
                osc.connect(env); env.connect(master);
                osc.start(now); osc.stop(now + atk + rel + 0.1);
                self._audioNodes.push(osc, env);
            }
            (function scheduleNote(delay) {
                var id = setTimeout(function() {
                    if (!self._audioCtx) return;
                    sparkNote();
                    scheduleNote(9000 + Math.random() * 18000);
                }, delay);
                self._audioIntervals.push(id);
            }(3000 + Math.random() * 6000));

            // ── 5. Rare high shimmer ──
            var SHIMMER = [587.3, 659.3, 880];
            (function scheduleShimmer(delay) {
                var id2 = setTimeout(function() {
                    if (!self._audioCtx) return;
                    var ctx3 = self._getAudioCtx();
                    var now  = ctx3.currentTime;
                    var f2   = SHIMMER[Math.floor(Math.random() * SHIMMER.length)];
                    var osc2 = ctx3.createOscillator();
                    osc2.type = 'sine'; osc2.frequency.value = f2;
                    var env2 = ctx3.createGain();
                    env2.gain.setValueAtTime(0, now);
                    env2.gain.linearRampToValueAtTime(0.012, now + 4);
                    env2.gain.linearRampToValueAtTime(0, now + 18);
                    osc2.connect(env2); env2.connect(master);
                    osc2.start(now); osc2.stop(now + 19);
                    self._audioNodes.push(osc2, env2);
                    scheduleShimmer(28000 + Math.random() * 35000);
                }, delay);
                self._audioIntervals.push(id2);
            }(15000 + Math.random() * 20000));

            // ── 6. Laptop fan texture ──
            var fanBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var fanD = fanBuf.getChannelData(0);
            for (var j = 0; j < fanD.length; j++) fanD[j] = Math.random() * 2 - 1;
            var fan = ctx.createBufferSource(); fan.buffer = fanBuf; fan.loop = true;
            var fanLp = ctx.createBiquadFilter(); fanLp.type = 'lowpass'; fanLp.frequency.value = 440;
            var fanG = ctx.createGain(); fanG.gain.value = 0.015;
            fan.connect(fanLp); fanLp.connect(fanG); fanG.connect(master); fan.start(t);
            var hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 60;
            var humG = ctx.createGain(); humG.gain.value = 0.006;
            hum.connect(humG); humG.connect(master); hum.start(t);
            self._audioNodes.push(fan, fanLp, fanG, hum, humG);

        } catch(e) { /* audio unavailable */ }
    },

    onEnter: function(game) {
        LaptopScene._startAmbientAudio();
        // Open the screen immediately — slight delay so scene fade-in finishes first
        setTimeout(function() {
            LaptopScene._openScreen(game);
        }, 350);
    },
    onExit:  function(game) {
        LaptopScene._stopAmbientAudio();
        // Close screen if player leaves mid-session (e.g. accessibility runner)
        if (window.LaptopScreen) window.LaptopScreen.hide();
    }
};

if (typeof module !== 'undefined') {
    module.exports = LaptopScene;
}
