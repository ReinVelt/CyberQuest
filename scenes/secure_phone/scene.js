/**
 * Secure Phone Scene — Ryan's Signal-encrypted phone in the mancave
 * Handles: Kubecka contact, ZERFALL discovery, facility map decrypt,
 *          Eva photo reveal, Meshtastic pointer, full message history.
 *
 * Reached from: mancave → secure-phone hotspot
 * Returns to:   mancave (via back_to_mancave)
 *
 * Hotspots:
 *   kubecka_chat        — main story progression
 *   encrypted_attachment — facility_map.enc decrypt
 *   message_history     — replay all received messages
 *   zerfall_notes       — read desk notes
 *   back_to_mancave     — return
 */

/**
 * Render lines directly on the phone screen — positioned over the phone hotspot.
 * `lines` is an array of { speaker, text } objects.
 * Speaker colours: System → dim green, Kubecka → cyan, Ryan → white.
 * After closing, calls optional `onClose` callback.
 */
function _showPhoneScreen(lines, onClose) {
    const existing = document.getElementById('phone-screen-overlay');
    if (existing) existing.remove();

    // Full-screen backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'phone-screen-overlay';
    backdrop.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:2000',
        'background:rgba(0,0,0,0.60)',
        'display:flex', 'align-items:flex-start', 'justify-content:flex-start',
        'cursor:pointer',
    ].join(';');

    // Phone screen panel — matches hotspot x=39% y=14% w=22% h=56%
    const panel = document.createElement('div');
    panel.style.cssText = [
        'position:absolute',
        'left:39%', 'top:14%',
        'width:22%', 'height:56%',
        'background:#050d0a',
        'border:1px solid #0d2b1a',
        'box-shadow:0 0 24px rgba(0,255,100,0.12)',
        'overflow-y:auto',
        'padding:10px 12px',
        'box-sizing:border-box',
        'cursor:default',
        'font-family:\'Courier New\',Courier,monospace',
        'font-size:10px',
        'line-height:1.6',
        'color:#00e060',
    ].join(';');
    panel.addEventListener('click', e => e.stopPropagation());

    const COLOURS = {
        System:  '#00e060',
        Kubecka: '#44ddff',
        Ryan:    '#f0f0f0',
        Narrator:'#aaaaaa',
    };

    lines.forEach(({ speaker, text }) => {
        const row = document.createElement('div');
        row.style.cssText = 'margin-bottom:4px;white-space:pre-wrap;word-break:break-word;';
        const color = COLOURS[speaker] || '#cccccc';
        if (speaker && speaker !== 'System') {
            const label = document.createElement('span');
            label.style.cssText = `color:${color};font-weight:bold;margin-right:4px;`;
            label.textContent = speaker + ':';
            row.appendChild(label);
        }
        const content = document.createElement('span');
        content.style.color = (speaker === 'System') ? '#00e060' : '#d0d0d0';
        content.textContent = text;
        row.appendChild(content);
        panel.appendChild(row);
    });

    const hint = document.createElement('div');
    hint.style.cssText = 'margin-top:10px;color:rgba(0,200,80,0.30);font-size:9px;text-align:center;';
    hint.textContent = '— tap outside or ESC to close —';
    panel.appendChild(hint);

    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);
    requestAnimationFrame(() => { panel.scrollTop = panel.scrollHeight; });

    const close = () => {
        backdrop.remove();
        document.removeEventListener('keydown', onKey);
        if (typeof onClose === 'function') onClose();
    };
    const onKey = e => { if (e.key === 'Escape') close(); };
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
}

const SecurePhoneScene = {
    id: 'secure_phone',
    name: 'Secure Phone',

    background: 'assets/images/scenes/secure_phone.svg',

    description: 'Ryan\'s Signal-encrypted phone. Dark screen, no SIM, runs over WiFi only.',

    playerStart: { x: 50, y: 80 },

    // 🎬 Accessibility / Movie Mode
    accessibilityPath: ['kubecka_chat', 'back_to_mancave'],

    idleThoughts: [
        "Encrypted. End-to-end. Still not enough.",
        "Signal is gold. Don't call people on plain GSM.",
        "No SIM card. WiFi only. Harder to triangulate.",
        "Chris Kubecka picks up on the first ring. Always.",
        "AES-256-GCM. Perfect forward secrecy. Every key is one-time.",
    ],

    hotspots: [

        // ── Signal Chat — Kubecka ──────────────────────────────────
        {
            id: 'kubecka_chat',
            name: 'Signal — Kubecka',
            x: 39, y: 14, width: 22, height: 56,
            cursor: 'pointer',
            action: function(game) {

                // Part 12: Contact Kubecka
                if (game.getFlag('volkov_investigated') && !game.getFlag('contacted_kubecka')) {
                    window.MancaveVolkovInvestigation.playKubecka(game);
                    return;
                }

                // Part 13+14: ZERFALL nodes
                if (game.getFlag('contacted_kubecka') && !game.getFlag('discovered_zerfall')) {
                    window.MancaveVolkovInvestigation.playZerfall(game);
                    return;
                }

                // Part 15: Eva identity reveal
                if (game.getFlag('discovered_zerfall') && !game.getFlag('identified_eva')) {
                    window.MancaveEvaReveal.play(game);
                    return;
                }

                // After Eva — point to Meshtastic
                if (game.getFlag('identified_eva') && !game.getFlag('eva_contacted')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Eva Weber. IT Security Analyst. Whistleblower.' },
                        { speaker: 'Ryan', text: 'Need to contact her securely. Off-grid.' },
                        { speaker: 'Ryan', text: 'Wait — the USB README. "Think mesh. 869.525." She\'s on Meshtastic!' },
                        { speaker: 'Ryan', text: '869.525 MHz. EU LoRa band. She\'s been listening this whole time.' }
                    ]);
                    return;
                }

                // Idle / revisit
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My secure phone. Signal encrypted, WiFi only.' },
                    { speaker: 'Ryan', text: 'Kubecka is quiet. No new messages. That\'s either good or very bad.' },
                ]);
            }
        },

        // ── Encrypted Attachment ──────────────────────────────────
        {
            id: 'encrypted_attachment',
            name: '📎 facility_map.enc',
            x: 39, y: 49, width: 11, height: 13,
            cursor: 'pointer',
            action: function(game) {

                if (!game.getFlag('discovered_zerfall')) {
                    _showPhoneScreen([
                        { speaker: 'System', text: '> ENCRYPTED — AES-256-GCM' },
                        { speaker: 'System', text: '> Decryption key required.' },
                        { speaker: 'System', text: '> Ask Kubecka.' },
                    ]);
                    return;
                }

                if (!game.getFlag('facility_map_decrypted')) {
                    const sysLines = [
                        { speaker: 'System', text: '> Decrypting facility_map.enc...' },
                        { speaker: 'System', text: '> Key: 0xA8F3C2-MATCH ✓  HMAC verified ✓' },
                        { speaker: 'System', text: '> File decrypted. Rendering...' },
                    ];
                    _showPhoneScreen(sysLines, function() {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'A floor plan. Three levels below ground.' },
                            { speaker: 'Ryan', text: 'Server room is on B-3. Emergency access shaft — outside entry, 4-digit code.' },
                            { speaker: 'Ryan', text: 'Kubecka already mapped the whole thing. This woman is something else.' },
                        ]);
                    });
                    game.setFlag('facility_map_decrypted', true);
                    return;
                }

                // Already decrypted — remind
                game.startDialogue([
                    { speaker: 'Ryan', text: '[facility_map.enc — already decrypted]' },
                    { speaker: 'Ryan', text: 'B-3. Server room. Emergency shaft — 4-digit code from outside.' },
                ]);
            }
        },

        // ── Message History ───────────────────────────────────────
        {
            id: 'message_history',
            name: '📋 Scroll History',
            x: 39, y: 71, width: 22, height: 7,
            cursor: 'pointer',
            action: function(game) {

                if (!game.getFlag('contacted_kubecka')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'No messages yet. I haven\'t reached out to Kubecka.' },
                    ]);
                    return;
                }

                // Build full log from flags
                const msgs = [
                    { speaker: 'System', text: '━━━━ SIGNAL LOG — KUBECKA ━━━━' },
                    { speaker: 'System', text: 'AES-256-GCM  |  Forward Secrecy  |  Timer: 7d' },
                ];

                if (game.getFlag('contacted_kubecka')) {
                    msgs.push(
                        { speaker: 'Kubecka', text: 'Signal only from now on. Delete this chain after reading.' },
                        { speaker: 'Ryan', text: 'Understood. Volkov profile: GRU — 161st Specialist Centre.' },
                    );
                }

                if (game.getFlag('discovered_zerfall')) {
                    msgs.push(
                        { speaker: 'Kubecka', text: 'I have ZERFALL intercepts. Bluetooth mesh — 3 active nodes in Drenthe.' },
                        { speaker: 'Ryan', text: 'Westerbork dish area. Need a Flipper Zero to crack the BT node.' },
                        { speaker: 'Kubecka', text: 'Sending facility_map.enc. AES key via dead drop. Act fast.' },
                    );
                }

                if (game.getFlag('facility_map_decrypted')) {
                    msgs.push(
                        { speaker: 'Ryan', text: '[Decrypted] B-3 server room. Emergency shaft — 4-digit code.' },
                    );
                }

                if (game.getFlag('identified_eva')) {
                    msgs.push(
                        { speaker: 'Kubecka', text: 'The photo — Eva Weber. She went dark 6 months ago. Left breadcrumbs.' },
                        { speaker: 'Kubecka', text: 'Follow the LoRa signal. 869.525 MHz. She\'s waiting.' },
                        { speaker: 'Ryan', text: 'She\'s on Meshtastic. She planned for someone to find her.' },
                    );
                }

                if (game.getFlag('eva_contacted')) {
                    msgs.push(
                        { speaker: 'Ryan', text: 'Eva is in. She has inside access. We go to the facility together.' },
                    );
                }

                // Count unlocked stages
                const stages = [
                    game.getFlag('contacted_kubecka'),
                    game.getFlag('discovered_zerfall'),
                    game.getFlag('facility_map_decrypted'),
                    game.getFlag('identified_eva'),
                ].filter(Boolean).length;

                msgs.push(
                    { speaker: 'System', text: `━━━━ END OF LOG — ${msgs.length - 2} messages ━━━━` },
                    { speaker: 'System', text: `Intelligence level: ${stages}/4 — ${['Minimal', 'Limited', 'Moderate', 'Solid', 'Complete'][stages]}` },
                );

                _showPhoneScreen(msgs);
            }
        },

        // ── ZERFALL Notes on Desk ─────────────────────────────────
        {
            id: 'zerfall_notes',
            name: 'ZERFALL Notes',
            x: 67, y: 61, width: 14, height: 29,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My notes. Everything I know about ZERFALL.' },
                    { speaker: 'Ryan', text: 'BT-node-A confirmed at Westerbork. Node-B suspected on the facility roof. Node-C is mobile.' },
                    { speaker: 'Ryan', text: 'Kubecka says the Bluetooth mesh is the command-and-control backbone for ZERFALL.' },
                    { speaker: 'Ryan', text: 'Take out all three nodes simultaneously — ZERFALL goes blind. That\'s the window.' },
                ]);
            }
        },

        // ── Back to Mancave ───────────────────────────────────────
        {
            id: 'back_to_mancave',
            name: '← Mancave',
            x: 88, y: 88, width: 12, height: 12,
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
            master.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
            master.connect(ctx.destination);
            self._audioNodes.push(master);
            // ── encrypted line static ──
            var buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var stat = ctx.createBufferSource(); stat.buffer = buf; stat.loop = true;
            var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 1.5;
            var sG = ctx.createGain(); sG.gain.value = 0.018;
            stat.connect(bp).connect(sG).connect(master); stat.start();
            self._audioNodes.push(stat, bp, sG);
            // ── low carrier tone (350 Hz dial-like) ──
            var tone = ctx.createOscillator(); tone.type = 'sine'; tone.frequency.value = 350;
            var tG = ctx.createGain(); tG.gain.value = 0.012;
            tone.connect(tG).connect(master); tone.start();
            self._audioNodes.push(tone, tG);
            // ── encryption handshake beep (periodic) ──
            var ei = setInterval(function() {
                if (!self._audioCtx) return;
                var t = ctx.currentTime;
                var osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 1080;
                var env = ctx.createGain();
                env.gain.setValueAtTime(0.025, t);
                env.gain.linearRampToValueAtTime(0, t + 0.04);
                osc.connect(env).connect(master); osc.start(t); osc.stop(t + 0.05);
                self._audioNodes.push(osc, env);
            }, 4000 + Math.random() * 6000);
            self._audioIntervals.push(ei);
        } catch(e) {}
    },

    onEnter: function(game) { SecurePhoneScene._startAmbientAudio(); },
    onExit: function(game) {
        SecurePhoneScene._stopAmbientAudio();
        // Remove phone screen modal if player exits while it is open
        document.getElementById('phone-screen-overlay')?.remove();
    }
};

if (typeof module !== 'undefined') {
    module.exports = SecurePhoneScene;
}
