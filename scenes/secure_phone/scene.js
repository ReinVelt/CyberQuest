/**
 * Secure Phone Scene — Ryan's Signal-encrypted phone in the mancave
 * Handles: Kubecka contact, ZERFALL discovery, Eva photo reveal, Meshtastic pointer.
 *
 * Reached from: mancave → secure-phone hotspot
 * Returns to:   mancave (via back_to_mancave)
 */

const SecurePhoneScene = {
    id: 'secure_phone',
    name: 'Secure Phone',

    background: 'assets/images/scenes/secure_phone.svg',

    description: 'Ryan\'s Signal-encrypted phone. Dark screen, no SIM, runs over WiFi only.',

    playerStart: { x: 50, y: 80 },

    // 🎬 Accessibility / Movie Mode
    accessibilityPath: ['phone_screen', 'back_to_mancave'],

    idleThoughts: [
        "Encrypted. End-to-end. Still not enough.",
        "Signal is gold. Don't call people on plain GSM.",
        "No SIM card. WiFi only. Harder to triangulate.",
        "Chris Kubecka picks up on the first ring. Always.",
    ],

    hotspots: [
        // ── Phone Screen ───────────────────────────────────────────────
        {
            id: 'phone_screen',
            name: 'Phone Screen',
            x: 5,
            y: 5,
            width: 85,
            height: 80,
            cursor: 'pointer',
            action: function(game) {
                // ── Part 12: Contact Chris Kubecka ──
                if (game.getFlag('volkov_investigated') && !game.getFlag('contacted_kubecka')) {
                    window.MancaveVolkovInvestigation.playKubecka(game);
                    return;
                }

                // ── Part 13+14: Dead ends & ZERFALL discovery ──
                if (game.getFlag('contacted_kubecka') && !game.getFlag('discovered_zerfall')) {
                    window.MancaveVolkovInvestigation.playZerfall(game);
                    return;
                }

                // ── Part 15: Photo analysis — Eva identity reveal ──
                if (game.getFlag('discovered_zerfall') && !game.getFlag('identified_eva')) {
                    window.MancaveEvaReveal.play(game);
                    return;
                }

                // ── After Eva identified — point to Meshtastic ──
                if (game.getFlag('identified_eva') && !game.getFlag('eva_contacted')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Eva Weber. IT Security Analyst. Whistleblower.' },
                        { speaker: 'Ryan', text: 'Need to contact her securely. Off-grid.' },
                        { speaker: 'Ryan', text: 'Wait — the USB README. "Think mesh. 906.875." She\'s on Meshtastic!' },
                        { speaker: 'Ryan', text: '906.875 MHz. That\'s the EU LoRa frequency. She\'s been listening this whole time.' }
                    ]);
                    return;
                }

                // ── Idle ──
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My secure phone. Signal encrypted. For conversations that matter.' }
                ]);
            }
        },

        // ── Back to Mancave ────────────────────────────────────────────
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

    onEnter: function(game) {},
    onExit: function(game) {}
};

if (typeof module !== 'undefined') {
    module.exports = SecurePhoneScene;
}
