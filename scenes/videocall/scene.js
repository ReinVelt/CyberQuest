/**
 * Video Call Scene - Live connection with contacts
 * Interactive video conference interface
 */

const VideocallScene = {
    id: 'videocall',
    name: 'Video Call',
    
    background: 'assets/images/scenes/videocall.svg',
    
    description: 'Secure video conference terminal in the mancave.',
    
    playerStart: { x: 50, y: 85 },

    // 🎬 Accessibility / Movie Mode — call all three allies, then exit
    accessibilityPath: ['call_david', 'call_cees', 'call_jaap', 'exit_videocall'],

    hotspots: [
        {
            id: 'call_david',
            name: 'Call Dr. David Prinsloo',
            x: 6.25,
            y: 18.5,
            width: 25,
            height: 33.3,
            cursor: 'pointer',
            action: (game) => {
                const hasTransmission = game.getFlag('sstv_decoded');
                const visitedFacility = game.getFlag('visited_facility');
                
                if (visitedFacility) {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '📹 *Connecting to Dr. David Prinsloo...*' },
                        { speaker: 'Narrator', text: '*Video feed stabilizes — David appears in his TU Eindhoven lab with antenna arrays behind him*' },
                        { speaker: 'Dr. David Prinsloo', text: 'Ryan! You made it out. I\'ve been staring at my phone for hours.' },
                        { speaker: 'Ryan', text: 'The facility is real. Server rooms full of test data — casualties documented down to the serial number.' },
                        { speaker: 'David Prinsloo', text: 'The schematics I analysed — 900 MHz, 2.4 GHz, GPS disruption — it\'s all deployed?' },
                        { speaker: 'Ryan', text: 'Phased array mounted on a trailer. Five-kilometre kill radius, tuneable across the whole band.' },
                        { speaker: 'David Prinsloo', text: '*Long exhale* Eight confirmed casualties, Ryan. That was in the schematics.' },
                        { speaker: 'David Prinsloo', text: 'And the phase-control algorithms — Russian school. Volkov\'s fingerprints are everywhere.' },
                        { speaker: 'Ryan', text: 'I have the server data. Encrypted, but it\'s everything.' },
                        { speaker: 'David Prinsloo', text: 'Get it to someone who can act on it. AIVD, maybe Europol. This is beyond us now.' }
                    ]);
                } else if (hasTransmission) {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '📹 *Connecting to Dr. David Prinsloo...*' },
                        { speaker: 'Narrator', text: '*Video feed stabilizes — David appears at his TU/e workstation*' },
                        { speaker: 'Dr. David Prinsloo', text: 'Ryan! Good to see you. What\'s on your mind?' },
                        { speaker: 'Ryan', text: 'David, I picked up an SSTV transmission on 14.230 MHz. Image mode — Martin M2.' },
                        { speaker: 'David Prinsloo', text: 'Amateur band? What kind of content?' },
                        { speaker: 'Ryan', text: 'A surveillance photo of my own farmhouse. Steganographic GPS coordinates hidden in it.' },
                        { speaker: 'David Prinsloo', text: '*Leans forward* That\'s not amateur. Whoever sent that knows exactly what they\'re doing.' },
                        { speaker: 'David Prinsloo', text: 'SSTV with stego payload — that\'s old-school signals intelligence. Military tradecraft.' },
                        { speaker: 'Ryan', text: 'The GPS points to something near Westerbork. Not the WSRT — further east, across the border.' },
                        { speaker: 'David Prinsloo', text: 'Steckerdoser Heide? There are rumours about a facility there. Officially decommissioned.' },
                        { speaker: 'David Prinsloo', text: 'But \'officially\' doesn\'t mean much when there\'s military R&D involved.' },
                        { speaker: 'Ryan', text: 'I need to find out what\'s there.' },
                        { speaker: 'David Prinsloo', text: 'Be careful. If someone\'s photographing your house AND transmitting coordinates... you\'re already on their radar.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '📹 *Connecting to Dr. David Prinsloo...*' },
                        { speaker: 'Narrator', text: '*Video feed stabilizes - David in his TU Eindhoven lab. Phased array antenna diagrams on wall behind him*' },
                        { speaker: 'Dr. David Prinsloo', text: 'Ryan! How are the frequencies treating you this morning?' },
                        { speaker: 'Ryan', text: 'Just checking in. Saw the documentary about antenna technology and Lofar yesterday.' },
                        { speaker: 'David Prinsloo', text: '*Chuckles* Ah yes, the Dutch wireless legacy piece. They made us look very serious.' },
                        { speaker: 'David Prinsloo', text: 'Did you know they filmed me in our antenna testing lab with prototype arrays behind me?' },
                        { speaker: 'David Prinsloo', text: 'The director wanted "dramatic scientific atmosphere" or something.' },
                        { speaker: 'Ryan', text: 'It worked. Very impressive. Max was fascinated.' },
                        { speaker: 'David Prinsloo', text: 'How are your own radio projects going? Still monitoring satellites?' },
                        { speaker: 'Ryan', text: 'Always. Actually, I should get back to it. Talk soon?' },
                        { speaker: 'David Prinsloo', text: 'Anytime, Ryan. You know where to find me - listening to the universe.' }
                    ]);
                }
            }
        },
        {
            id: 'call_cees',
            name: 'Call Cees Bassa',
            x: 37.5,
            y: 18.5,
            width: 25,
            height: 33.3,
            cursor: 'pointer',
            action: (game) => {
                const hasTransmission = game.getFlag('sstv_decoded');
                const solvedPassword = game.getFlag('facility_password_solved');
                
                if (solvedPassword) {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '📹 *Connecting to Cees Bassa...*' },
                        { speaker: 'Narrator', text: '*Video feed connects — Cees appears at the WSRT control desk, dishes visible through the window behind him*' },
                        { speaker: 'Cees Bassa', text: 'Ryan! You\'re out? The mesh radio went dark for three hours — I nearly called the police.' },
                        { speaker: 'Ryan', text: 'I got in. Server room, data extracted. The triangulation was dead-on.' },
                        { speaker: 'Cees Bassa', text: 'So the calibration beacon we tracked — it really led to a weapons facility?' },
                        { speaker: 'Ryan', text: 'Phased array EM cannon. Exactly what the schematics described. Five-kilometre kill radius.' },
                        { speaker: 'Cees Bassa', text: '*Shakes head* The signal-processing code in those schematics... Russian school, no question.' },
                        { speaker: 'Ryan', text: 'Volkov. FSB. And they documented everything — casualties, field tests, deployment schedules.' },
                        { speaker: 'Cees Bassa', text: 'This needs to go to AIVD immediately. My signed analysis is still on your dead-drop.' },
                        { speaker: 'Cees Bassa', text: 'Ryan — you did good. The dishes are still listening if you need anything else.' }
                    ]);
                } else if (hasTransmission) {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '📹 *Connecting to Cees Bassa...*' },
                        { speaker: 'Narrator', text: '*Video feed connects — Cees appears with satellite tracking software on his second monitor*' },
                        { speaker: 'Cees Bassa', text: 'Ryan! I was just looking at that SSTV image you forwarded.' },
                        { speaker: 'Ryan', text: 'The surveillance photo? What did you find?' },
                        { speaker: 'Cees Bassa', text: '14.230 MHz, Martin M2 mode — someone knows their SSTV protocols.' },
                        { speaker: 'Cees Bassa', text: 'And the steganographic GPS payload? That\'s not amateur work. That\'s tradecraft.' },
                        { speaker: 'Ryan', text: 'The coordinates point east, near the German border.' },
                        { speaker: 'Cees Bassa', text: 'If you bring me the full schematics, I can run them through ASTRON\'s signal-analysis pipeline.' },
                        { speaker: 'Cees Bassa', text: 'Fourteen dishes and a supercomputer — we can triangulate any active transmitter in the region.' },
                        { speaker: 'Ryan', text: 'I might take you up on that. This is getting serious.' },
                        { speaker: 'Cees Bassa', text: 'Come to WSRT when you\'re ready. I\'ll clear the schedule. Encrypted channels only from now on.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '📹 *Connecting to Cees Bassa...*' },
                        { speaker: 'Narrator', text: '*Video feed connects - Cees appears relaxed in his home office, garden visible through window behind him*' },
                        { speaker: 'Cees Bassa', text: 'Ryan! So good to see your face! How\'s life in Compascuum?' },
                        { speaker: 'Ryan', text: 'Quiet and peaceful. Saw you on that documentary about Drenthe tech.' },
                        { speaker: 'Cees Bassa', text: '*Laughs* Oh that! They made such a big deal about beam-forming.' },
                        { speaker: 'Cees Bassa', text: 'I mean, yes, it\'s important work, but I was just doing my job at Lofar.' },
                        { speaker: 'Ryan', text: 'Your work ended up in 5G networks worldwide. That\'s impressive.' },
                        { speaker: 'Cees Bassa', text: 'True. Strange to think my signal processing code is running on millions of devices.' },
                        { speaker: 'Cees Bassa', text: 'Never imagined radio astronomy would lead to telecommunications.' },
                        { speaker: 'Ryan', text: 'Well, if I find any interesting signal puzzles, you\'ll be my first call.' },
                        { speaker: 'Cees Bassa', text: '*Smiles* I\'d like that. Stay curious, Ryan!' }
                    ]);
                }
            }
        },
        {
            id: 'call_jaap',
            name: 'Call Jaap Haartsen',
            x: 68.75,
            y: 18.5,
            width: 25,
            height: 33.3,
            cursor: 'pointer',
            action: (game) => {
                const hasEvidence = game.getFlag('collected_evidence');
                const visitedFacility = game.getFlag('visited_facility');
                
                if (hasEvidence) {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '📹 *Connecting to Jaap Haartsen...*' },
                        { speaker: 'Narrator', text: '*Video feed connects — Jaap Haartsen in home office, Bluetooth certifications on the wall behind him*' },
                        { speaker: 'Jaap Haartsen', text: 'Ryan. You look like you haven\'t slept.' },
                        { speaker: 'Ryan', text: 'Jaap, I need to ask you something. DEF CON 2003 — you mentioned meeting a Russian researcher.' },
                        { speaker: 'Jaap Haartsen', text: '...Dmitri. He said he was an independent consultant.' },
                        { speaker: 'Ryan', text: 'His real name is Dr. Alexei Volkov. FSB. He built an EM weapon that\'s killed eight people.' },
                        { speaker: 'Jaap Haartsen', text: '*Long silence* He kept asking me about medical device protocols. Pacemakers. Insulin pumps.' },
                        { speaker: 'Jaap Haartsen', text: 'I thought he was doing safety research. God, I even explained the interference thresholds.' },
                        { speaker: 'Ryan', text: 'It\'s not your fault. He deceived everyone. But your testimony places him at the start of this.' },
                        { speaker: 'Jaap Haartsen', text: 'Twenty years ago he was already planning this. *Rubs face* What do you need from me?' },
                        { speaker: 'Ryan', text: 'A signed statement. DEF CON, the questions about medical devices, the name he used.' },
                        { speaker: 'Jaap Haartsen', text: 'You\'ll have it within the hour. Encrypted.' }
                    ]);
                } else if (visitedFacility) {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '📹 *Connecting to Jaap Haartsen...*' },
                        { speaker: 'Narrator', text: '*Video feed connects — Jaap Haartsen looks concerned*' },
                        { speaker: 'Jaap Haartsen', text: 'Ryan, are you okay? You look like you\'ve been through something.' },
                        { speaker: 'Ryan', text: 'I infiltrated Steckerdoser Heide. The RF weapon — it\'s real, Jaap.' },
                        { speaker: 'Jaap Haartsen', text: 'The phased array David described? Multi-band EM weapon?' },
                        { speaker: 'Ryan', text: 'Trailer-mounted. Five-klick radius. Eight confirmed casualties in the test data.' },
                        { speaker: 'Jaap Haartsen', text: 'And the Bluetooth vulnerability angle — pacemakers, insulin pumps...' },
                        { speaker: 'Ryan', text: 'The schematics show deliberate targeting of medical device frequencies. 2.4 GHz band.' },
                        { speaker: 'Jaap Haartsen', text: 'That\'s... that\'s exactly what that man at DEF CON was asking me about. Two decades ago.' },
                        { speaker: 'Ryan', text: 'Volkov. Russian FSB. He\'s been planning this for twenty years.' },
                        { speaker: 'Jaap Haartsen', text: 'If you need a technical witness — someone who can confirm the medical device attack vector — I\'m in.' },
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Narrator', text: '📹 *Connecting to Jaap Haartsen...*' },
                        { speaker: 'Narrator', text: '*Video feed connects - Jaap Haartsen in smart home office, multiple screens visible*' },
                        { speaker: 'Jaap Haartsen', text: 'Ryan! Good timing - I just saw your message from last week.' },
                        { speaker: 'Ryan', text: 'No worries. Just wanted to say the documentary was great.' },
                        { speaker: 'Jaap Haartsen', text: 'Thanks! Fifteen years of Bluetooth work condensed into five minutes.' },
                        { speaker: 'Jaap Haartsen', text: 'They didn\'t even mention the hardest parts - the security layers, the pairing protocols...' },
                        { speaker: 'Ryan', text: 'The frequency-hopping spread spectrum was impressive enough.' },
                        { speaker: 'Jaap Haartsen', text: 'Ah yes! 1600 hops per second across 79 channels. Beautiful engineering.' },
                        { speaker: 'Jaap Haartsen', text: 'Learned a lot from Lofar\'s signal processing work, actually.' },
                        { speaker: 'Jaap Haartsen', text: 'Cees Bassa\'s algorithms inspired some of our interference mitigation.' },
                        { speaker: 'Ryan', text: 'It\'s amazing how connected all this tech is.' },
                        { speaker: 'Jaap Haartsen', text: 'Absolutely. We all built on each other\'s work. That\'s how innovation happens.' },
                        { speaker: 'Ryan', text: 'Well, thanks for the chat. I\'ll let you get back to it.' },
                        { speaker: 'Jaap Haartsen', text: 'Anytime, Ryan. Keep hacking the good hack!' }
                    ]);
                }
            }
        },
        {
            id: 'exit_videocall',
            name: 'End Call →',
            x: 83.3,
            y: 81.5,
            width: 8.3,
            height: 5.6,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                // Mark videocall done so the mancave runner doesn't re-trigger it
                game.setFlag('videocall_done', true);
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
            master.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
            master.connect(ctx.destination);
            self._audioNodes.push(master);
            // ── room tone (quiet indoor) ──
            var buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var room = ctx.createBufferSource(); room.buffer = buf; room.loop = true;
            var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
            var rG = ctx.createGain(); rG.gain.value = 0.016;
            room.connect(lp).connect(rG).connect(master); room.start();
            self._audioNodes.push(room, lp, rG);
            // ── video call connection hum (440 Hz soft) ──
            var tone = ctx.createOscillator(); tone.type = 'sine'; tone.frequency.value = 440;
            var tG = ctx.createGain(); tG.gain.value = 0.008;
            tone.connect(tG).connect(master); tone.start();
            self._audioNodes.push(tone, tG);
        } catch(e) {}
    },

    onEnter: (game) => {
        VideocallScene._startAmbientAudio();
        // Welcome message
        if (!game.getFlag('visited_videocall')) {
            game.setFlag('visited_videocall', true);
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Secure video conference terminal. I can call my technical contacts from here.' },
                    { speaker: 'Narrator', text: '*Three video slots available: David Prinsloo, Cees Bassa, and Jaap Haartsen*' },
                    { speaker: 'Ryan', text: 'End-to-end encrypted. No one can intercept these calls.' },
                    { speaker: 'Ryan', text: 'Mom and my father-in-law call me sometimes too, but on the regular phone.' }
                ]);
            }, 500);
        }
    },
    
    onExit: () => {
        VideocallScene._stopAmbientAudio();
        // Nothing to clean up
    }
};

// Register scene
if (typeof window.game !== 'undefined') {
    window.game.registerScene(VideocallScene);
}
