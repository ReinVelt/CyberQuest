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

    description: 'Ryan\'s laptop running Kali Linux. Browser tabs, terminal windows, and a dead man\'s switch script running in the background.',

    playerStart: { x: 50, y: 80 },

    // 🎬 Accessibility / Movie Mode
    // Click the screen (which fires its action + any overlay), then go back.
    // _waitForIdle will pause between the two items until any mc-overlay is gone.
    accessibilityPath: ['laptop_screen', 'back_to_mancave'],

    idleThoughts: [
        "Kali Linux. The hacker's Swiss Army knife.",
        "That dead man's switch script is still running.",
        "52 unread emails. I should deal with those.",
        "Open tabs: ProtonMail, Shodan, GitHub, and WikiLeaks. Standard morning.",
        "VPN is up. Tor is running. I'm invisible. Probably.",
    ],

    hotspots: [
        // ── Laptop Screen (main interaction) ──────────────────────────
        {
            id: 'laptop_screen',
            name: 'Laptop Screen',
            x: 5,
            y: 5,
            width: 85,
            height: 80,
            cursor: 'pointer',
            action: function(game) {

                // ── Part 9: The Dilemma (evidence unlocked, not yet decided) ──
                if (game.getFlag('evidence_unlocked') && !game.getFlag('started_ally_search')) {
                    window.MancaveDilemma.play(game);
                    return;
                }

                // ── Part 10: Contact allies ──
                if (game.getFlag('started_ally_search') && !game.getFlag('all_allies_contacted')) {
                    if (!game.getFlag('contacted_allies')) {
                        window.MancaveAllyRecruitment.play(game);
                    } else {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'Allies are reviewing the evidence. Need to investigate Volkov next.' }
                        ]);
                    }
                    return;
                }

                // ── Part 11: Investigate Volkov ──
                if (game.getFlag('all_allies_contacted') && !game.getFlag('volkov_investigated')) {
                    window.MancaveVolkovInvestigation.playVolkovDive(game);
                    return;
                }

                // ── Done: summary after all laptop tasks complete ──
                if (game.getFlag('volkov_investigated')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Volkov: Russian agent. 8 dead. Infiltrated German military R&D.' },
                        { speaker: 'Ryan', text: 'Need Chris Kubecka to dig deeper. OSINT is her specialty.' },
                        { speaker: 'Ryan', text: 'The secure phone. That\'s how I reach her.' }
                    ]);
                    setTimeout(() => {
                        game.showNotification('Use the secure phone to contact Chris Kubecka');
                    }, 1500);
                    return;
                }

                // ── Early game: Check email ──
                if (!game.getFlag('checked_email')) {
                    game.setFlag('checked_email', true);
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Let\'s see what\'s in my inbox...' },
                        { speaker: '', text: '*Ryan scrolls through emails*' },
                        { speaker: 'Ryan', text: 'Newsletter, spam, another newsletter...' },
                        { speaker: 'Ryan', text: 'Nothing urgent. Nothing interesting.' },
                        { speaker: 'Ryan', text: 'No freelance work either.' },
                        { speaker: '', text: '*Ryan opens a code editor*' },
                        { speaker: 'Ryan', text: 'Alright. Back to this auth module.' },
                        { speaker: '', text: '*Typing. Coffee getting cold.*' },
                        { speaker: 'Ryan', text: 'Where was I...' }
                    ]);
                    game.advanceTime(60);
                    setTimeout(() => {
                        game.showNotification('Something strange is happening with the SSTV terminal...');
                    }, 6000);
                    return;
                }

                // ── Idle ──
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My trusty laptop running Kali Linux. Everything I need for... research.' }
                ]);
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
            master.gain.linearRampToValueAtTime(1, ctx.currentTime + 3);
            master.connect(ctx.destination);
            self._audioNodes.push(master);
            // ── laptop fan drone ──
            var buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var fan = ctx.createBufferSource(); fan.buffer = buf; fan.loop = true;
            var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 550;
            var fanG = ctx.createGain(); fanG.gain.value = 0.032;
            fan.connect(lp).connect(fanG).connect(master); fan.start();
            self._audioNodes.push(fan, lp, fanG);
            // ── 60 Hz power hum ──
            var hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 60;
            var humG = ctx.createGain(); humG.gain.value = 0.012;
            hum.connect(humG).connect(master); hum.start();
            self._audioNodes.push(hum, humG);
            // ── occasional keypress tick ──
            var ki = setInterval(function() {
                if (!self._audioCtx) return;
                var t = ctx.currentTime;
                var osc = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = 1400;
                var env = ctx.createGain();
                env.gain.setValueAtTime(0.03, t);
                env.gain.linearRampToValueAtTime(0, t + 0.01);
                osc.connect(env).connect(master); osc.start(t); osc.stop(t + 0.012);
                self._audioNodes.push(osc, env);
            }, 400 + Math.random() * 800);
            self._audioIntervals.push(ki);
        } catch(e) {}
    },

    onEnter: function(game) { LaptopScene._startAmbientAudio(); },
    onExit: function(game) { LaptopScene._stopAmbientAudio(); }
};

if (typeof module !== 'undefined') {
    module.exports = LaptopScene;
}
