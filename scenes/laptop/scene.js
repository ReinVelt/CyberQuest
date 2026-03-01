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
                        { speaker: 'Ryan', text: 'Newsletter, spam, another newsletter... nothing urgent.' },
                        { speaker: 'Ryan', text: 'No freelance work either. Back to my project.' },
                        { speaker: '', text: '*Ryan starts coding*' },
                        { speaker: 'Ryan', text: 'Now, where was I with this auth module...' }
                    ]);
                    game.advanceTime(60);
                    setTimeout(() => {
                        game.showNotification('Something strange is happening with the SSTV terminal...');
                    }, 3000);
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

    onEnter: function(game) {},
    onExit: function(game) {}
};

if (typeof module !== 'undefined') {
    module.exports = LaptopScene;
}
