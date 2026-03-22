/**
 * Scene: Morning After — Processing the Aftermath
 * ═══════════════════════════════════════════════════════════
 * After the AIVD debrief, Ryan returns home to process everything.
 * Quiet, reflective scene. Eva's emotional Protonmail, 247 unread emails,
 * AIVD business card on desk, and a moment with Max.
 *
 * Between debrief and epilogue — the calm after the storm.
 *
 * Reuses mancave.svg background (Ryan's back in his lab).
 * Flags set: morning_after_complete
 * ═══════════════════════════════════════════════════════════
 */

const MorningAfterScene = {
    id: 'morning_after',
    name: 'The Morning After',

    background: 'assets/images/scenes/mancave.svg',

    description: 'The mancave is quiet. For the first time in days, there\'s no urgency. Just the hum of equipment and the weight of what happened.',

    playerStart: { x: 20, y: 85 },

    // 🎬 Accessibility / Movie Mode — read Eva's email, talk to Max, then continue
    accessibilityPath: ['protonmail', 'max-moment', 'continue-epilogue'],

    idleThoughts: [
        "247 unread emails. Most of them can wait forever.",
        "Van der Berg's card is still in my pocket.",
        "The dogs need a walk. I need a walk.",
        "Max hasn't said much. She's processing too.",
        "My face is probably all over the internet by now.",
        "That coffee is cold. Like the last three.",
        "The radio frequencies are quiet today. Just static.",
        "I should call Mom before she sees the news."
    ],

    hotspots: [
        {
            id: 'laptop-emails',
            name: 'Laptop — 247 Emails',
            x: 13.02,
            y: 43.52,
            width: 10.42,
            height: 13.89,
            cursor: 'pointer',
            action: function(game) {
                if (!game.getFlag('checked_morning_emails')) {
                    game.setFlag('checked_morning_emails', true);
                    game.startDialogue([
                        { speaker: 'Ryan', text: '*Opens laptop. 247 unread emails.*' },
                        { speaker: 'Ryan', text: 'Journalists. Researchers. Government officials. People I\'ve never heard of.' },
                        { speaker: 'Ryan', text: '"Request for comment." "Urgent interview request." "Thank you for your courage."' },
                        { speaker: 'Ryan', text: '*Scrolls past dozens of media requests*' },
                        { speaker: 'Ryan', text: 'One from David: "You absolute madman. Drinks are on me. Forever."' },
                        { speaker: 'Ryan', text: 'One from Cees: "The WSRT dishes picked up some interesting chatter today. Call me."' },
                        { speaker: 'Ryan', text: 'One from Jaap: "Dead man\'s switch can stand down. Well done."' },
                        { speaker: 'Ryan', text: '*Closes laptop* Not today. Today I just... exist.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: '253 now. They keep coming. Later.' }
                    ]);
                }
            }
        },
        {
            id: 'protonmail',
            name: 'Protonmail — Eva\'s Message',
            x: 24.0,
            y: 42.0,
            width: 7.0,
            height: 12.0,
            cursor: 'pointer',
            action: function(game) {
                if (!game.getFlag('read_eva_email')) {
                    game.setFlag('read_eva_email', true);
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*A single Protonmail notification. From Eva Weber.*' },
                        { speaker: 'Narrator', text: '' },
                        { speaker: 'Eva (email)', text: 'Ryan,' },
                        { speaker: 'Eva (email)', text: 'I\'m writing this from a BND safehouse in Munich. They\'re keeping me here while they process Volkov and Hoffmann.' },
                        { speaker: 'Eva (email)', text: 'I read your press package. Every word. You captured it perfectly. The technical details, the human cost, the urgency.' },
                        { speaker: 'Eva (email)', text: 'My father would have been proud. He spent his last years trying to do what we did in one night.' },
                        { speaker: 'Eva (email)', text: 'They\'re offering me a position. NATO cyber defense. I think I\'ll take it.' },
                        { speaker: 'Eva (email)', text: 'One day I\'d like to visit Compascuum again. Meet Tino and Kessy properly. Let Max know I\'m sorry for what I put you through.' },
                        { speaker: 'Eva (email)', text: 'Thank you, Ryan. For believing a stranger. For risking everything.' },
                        { speaker: 'Eva (email)', text: '— Eva' },
                        { speaker: 'Eva (email)', text: 'P.S. Destroy this email. Old habits.' },
                        { speaker: 'Narrator', text: '' },
                        { speaker: 'Ryan', text: '*Stares at the screen for a long time*' },
                        { speaker: 'Ryan', text: '*Types: "Your father already was proud. Come visit anytime. The dogs miss you."*' },
                        { speaker: 'Ryan', text: '*Send. Delete.*' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Eva\'s email. Already deleted. Like she asked.' }
                    ]);
                }
            }
        },
        {
            id: 'aivd-card',
            name: 'AIVD Business Card',
            x: 42.0,
            y: 60.0,
            width: 6.0,
            height: 5.0,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*A plain white card on the desk. AIVD crest. Van der Berg\'s number.*' },
                    { speaker: 'Ryan', text: '"When you\'re ready," he said.' },
                    { speaker: 'Ryan', text: 'Am I ready? Government agent? Me?' },
                    { speaker: 'Ryan', text: 'The hacker from Compascuum, working for Dutch intelligence.' },
                    { speaker: 'Ryan', text: '*Turns the card over. Blank on the back.*' },
                    { speaker: 'Ryan', text: 'I\'ll think about it. Tomorrow. Or next week. Or never.' },
                    { speaker: 'Ryan', text: 'But I\'m keeping the card.' }
                ]);
            }
        },
        {
            id: 'max-moment',
            name: 'Max at the door',
            x: 1.56,
            y: 23.15,
            width: 7.29,
            height: 46.30,
            cursor: 'pointer',
            action: function(game) {
                if (!game.getFlag('morning_max_talk')) {
                    game.setFlag('morning_max_talk', true);
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*Max appears in the doorway. Two cups of espresso. She doesn\'t set them down yet.*' },
                        { speaker: 'Max', text: 'You\'re still down here.' },
                        { speaker: 'Ryan', text: 'Couldn\'t sleep.' },
                        { speaker: 'Max', text: '*Closes the door behind her. Sets one cup on the desk, keeps the other.*' },
                        { speaker: 'Max', text: 'I\'ve been thinking since last night. There\'s something I didn\'t ask.' },
                        { speaker: 'Max', text: 'Not in the heat of it. But in the cold light of this morning.' },
                        { speaker: 'Ryan', text: 'Okay.' },
                        { speaker: 'Max', text: 'What if Eva Weber had been FSB?' },
                        { speaker: 'Ryan', text: 'She wasn\'t—' },
                        { speaker: 'Max', text: 'I know she wasn\'t. NOW. But when she first sent that SSTV transmission? When you drove to Ter Apel alone at midnight?' },
                        { speaker: 'Max', text: 'You didn\'t know.' },
                        { speaker: 'Ryan', text: '*Quietly* No. Not for certain.' },
                        { speaker: 'Max', text: 'You built a case from a stranger\'s USB stick. You drove to Germany. You broke into a military facility.' },
                        { speaker: 'Max', text: 'What if she was a trap?' },
                        { speaker: 'Narrator', text: '*Ryan looks at the Flipper Zero on the desk. The HackRF. The Meshtastic nodes.*' },
                        { speaker: 'Ryan', text: 'I verified everything I could. The schematics matched WSRT data going back years. The RF anomalies were real.' },
                        { speaker: 'Ryan', text: 'I wasn\'t flying blind. I was... as sure as I could be.' },
                        { speaker: 'Max', text: '*Carefully* And that was enough for you to go alone. Without telling me.' },
                        { speaker: 'Ryan', text: 'I kept you out of it deliberately. To protect you.' },
                        { speaker: 'Max', text: 'I\'m not fragile.' },
                        { speaker: 'Ryan', text: '...No. You\'re not. I know that.' },
                        { speaker: 'Max', text: 'You calculated guard rotations. Security frequencies. Override codes.' },
                        { speaker: 'Max', text: 'You didn\'t calculate what it would do to me \u2014 watching Groningen on the news, not knowing if you were inside the blast radius.' },
                        { speaker: 'Ryan', text: 'Max, I\u2014' },
                        { speaker: 'Max', text: '*voice tight* I would have wanted to know. Even if the answer was terrifying.' },
                        { speaker: 'Narrator', text: '*Silence. The equipment hums. Outside, Tino shifts in his sleep.*' },
                        { speaker: 'Ryan', text: 'You\'re right. I made that call without you, and I shouldn\'t have.' },
                        { speaker: 'Ryan', text: 'I\'m sorry.' },
                        { speaker: 'Narrator', text: '*A long pause.*' },
                        { speaker: 'Max', text: '*Sets the espresso down. Sits on the workbench.*' },
                        { speaker: 'Max', text: 'People were going to die. You stopped it. I don\'t know anyone else in this world who would have done what you did.' },
                        { speaker: 'Max', text: 'I\'m furious. And I\'m terrified. And...' },
                        { speaker: 'Max', text: '*drops to a murmur* ...I love you. You absolute idiot.' },
                        { speaker: 'Ryan', text: '*exhales* Yeah.' },
                        { speaker: 'Max', text: 'Van der Berg\'s card. I saw it on the desk.' },
                        { speaker: 'Ryan', text: 'I haven\'t decided anything.' },
                        { speaker: 'Max', text: 'Good. We decide it together. But not today.' },
                        { speaker: 'Max', text: 'Today we walk the dogs. Eat stamppot. Be completely, aggressively normal.' },
                        { speaker: 'Ryan', text: '*Smiles \u2014 the first real one in days* Normal sounds perfect.' },
                        { speaker: 'Narrator', text: '*Tino and Kessy trot in, tails wagging. ET snorts from the hallway.*' },
                        { speaker: 'Max', text: 'See? They don\'t care about Russian spies. They want dinner.' },
                        { speaker: 'Ryan', text: '*Laughs* The real priorities.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The door to the house. Max is making dinner. Normal. Blissfully normal.' }
                    ]);
                }
            }
        },
        {
            id: 'continue-epilogue',
            name: 'Continue →',
            x: 40,
            y: 82,
            width: 20,
            height: 10,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                const emailRead = game.getFlag('read_eva_email');
                const iesTalk = game.getFlag('morning_max_talk');

                if (emailRead && iesTalk) {
                    game.setFlag('morning_after_complete', true);
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*Days pass. Then weeks. Then months.*' },
                        { speaker: 'Narrator', text: '*The world moves on. But some things have changed forever.*' }
                    ]);
                    game.sceneTimeout(() => {
                        game.loadScene('epilogue');
                    }, 4000);
                } else if (!emailRead && !iesTalk) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Not ready to move on. There\'s an email I should read. And Max is at the door.' }
                    ]);
                } else if (!emailRead) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'There\'s a Protonmail notification I should check first.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Should talk to Max first. She\'s at the door.' }
                    ]);
                }
            }
        }
    ],

    _timeoutIds: [],

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
            // ── morning lab hum (lighter than night mancave) ──
            var buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var fan = ctx.createBufferSource(); fan.buffer = buf; fan.loop = true;
            var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
            var fanG = ctx.createGain(); fanG.gain.value = 0.030;
            fan.connect(lp).connect(fanG).connect(master); fan.start();
            self._audioNodes.push(fan, lp, fanG);
            // ── morning birds outside window ──
            var bi = setInterval(function() {
                if (!self._audioCtx) return;
                var t = ctx.currentTime;
                [3000, 3600, 2700].forEach(function(f, i) {
                    var osc = ctx.createOscillator(); osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, t + i * 0.13);
                    osc.frequency.linearRampToValueAtTime(f + 300, t + i * 0.13 + 0.08);
                    var env = ctx.createGain();
                    env.gain.setValueAtTime(0, t + i * 0.13);
                    env.gain.linearRampToValueAtTime(0.022, t + i * 0.13 + 0.02);
                    env.gain.linearRampToValueAtTime(0, t + i * 0.13 + 0.11);
                    osc.connect(env).connect(master); osc.start(t); osc.stop(t + i * 0.13 + 0.15);
                    self._audioNodes.push(osc, env);
                });
            }, 5000 + Math.random() * 8000);
            self._audioIntervals.push(bi);
        } catch(e) {}
    },

    onEnter(game) {
        MorningAfterScene._startAmbientAudio();
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        game.setFlag('visited_morning_after', true);

        // Extend idle thoughts with path-specific reactions to the player's endgame choice
        const pathThoughts = [];
        if (game.getFlag('press_sent') || game.getFlag('news_broken')) {
            pathThoughts.push(
                "Der Spiegel ran the headline at 06:00. There's no un-ringing that bell.",
                "Press requests from seventeen countries. I stopped counting at noon.",
                "Bellingcat's open-source satellite analysis just confirmed our facility coordinates."
            );
        } else if (game.getFlag('bnd_only')) {
            pathThoughts.push(
                "The arrests were quiet. Hoffmann and Volkov, gone overnight. No press, no names.",
                "Nobody outside the BND knows I exist. That's what I asked for. I think.",
                "Quiet justice feels strange. It still counts. I keep telling myself that."
            );
        } else if (game.getFlag('underground_chosen')) {
            pathThoughts.push(
                "The encrypted package is set. Three weeks until it's safe to release.",
                "Max asked why I'm still tense. I said I'm just tired. She didn't believe me.",
                "The Spiegel journalist is sitting on the folder right now. Waiting for my signal."
            );
        }
        if (pathThoughts.length) {
            game.player.setIdleThoughts([...MorningAfterScene.idleThoughts, ...pathThoughts]);
        }

        const tid = setTimeout(() => {
            game.startDialogue([
                { speaker: 'Narrator', text: 'The next morning — Mancave, Compascuum' },
                { speaker: 'Narrator', text: '*Ryan sits in his chair. The equipment hums around him. For the first time in days, there is no crisis.*' },
                { speaker: 'Ryan', text: 'It\'s quiet. Almost too quiet.' },
                { speaker: 'Ryan', text: 'No Meshtastic alerts. No encrypted calls. No countdown.' },
                { speaker: 'Ryan', text: 'Just... morning.' },
                { speaker: 'Narrator', text: '*247 unread emails on the laptop. An AIVD card on the desk. A Protonmail notification.*' }
            ]);
        }, 800);
        this._timeoutIds.push(tid);
    },

    onExit() {
        MorningAfterScene._stopAmbientAudio();
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }
    }
};

// Register
if (typeof window.game !== 'undefined') {
    window.game.registerScene(MorningAfterScene);
} else if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(MorningAfterScene);
}
