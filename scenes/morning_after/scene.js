/**
 * Scene: Morning After — Processing the Aftermath
 * ═══════════════════════════════════════════════════════════
 * After the AIVD debrief, Ryan returns home to process everything.
 * Quiet, reflective scene. Eva's emotional Protonmail, 247 unread emails,
 * AIVD business card on desk, and a moment with Ies.
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

    idleThoughts: [
        "247 unread emails. Most of them can wait forever.",
        "Van der Berg's card is still in my pocket.",
        "The dogs need a walk. I need a walk.",
        "Ies hasn't said much. She's processing too.",
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
                        { speaker: '', text: '*A single Protonmail notification. From Eva Weber.*' },
                        { speaker: '', text: '' },
                        { speaker: 'Eva (email)', text: 'Ryan,' },
                        { speaker: 'Eva (email)', text: 'I\'m writing this from a BND safehouse in Munich. They\'re keeping me here while they process Volkov and Hoffmann.' },
                        { speaker: 'Eva (email)', text: 'I read your press package. Every word. You captured it perfectly. The technical details, the human cost, the urgency.' },
                        { speaker: 'Eva (email)', text: 'My father would have been proud. He spent his last years trying to do what we did in one night.' },
                        { speaker: 'Eva (email)', text: 'They\'re offering me a position. NATO cyber defense. I think I\'ll take it.' },
                        { speaker: 'Eva (email)', text: 'One day I\'d like to visit Compascuum again. Meet Tino and Kessy properly. Let Ies know I\'m sorry for what I put you through.' },
                        { speaker: 'Eva (email)', text: 'Thank you, Ryan. For believing a stranger. For risking everything.' },
                        { speaker: 'Eva (email)', text: '— Eva' },
                        { speaker: 'Eva (email)', text: 'P.S. Destroy this email. Old habits.' },
                        { speaker: '', text: '' },
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
                    { speaker: '', text: '*A plain white card on the desk. AIVD crest. Van der Berg\'s number.*' },
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
            id: 'ies-moment',
            name: 'Ies at the door',
            x: 1.56,
            y: 23.15,
            width: 7.29,
            height: 46.30,
            cursor: 'pointer',
            action: function(game) {
                if (!game.getFlag('morning_ies_talk')) {
                    game.setFlag('morning_ies_talk', true);
                    game.startDialogue([
                        { speaker: '', text: '*Ies appears in the doorway. Two cups of espresso.*' },
                        { speaker: 'Ies', text: 'You\'re still down here.' },
                        { speaker: 'Ryan', text: 'Couldn\'t sleep. Too much in my head.' },
                        { speaker: 'Ies', text: '*Sets the espresso down. Sits on the workbench.*' },
                        { speaker: 'Ies', text: 'I read the articles. All of them.' },
                        { speaker: 'Ryan', text: 'And?' },
                        { speaker: 'Ies', text: '*Long pause*' },
                        { speaker: 'Ies', text: 'You infiltrated a military facility. In Germany. At night. Alone.' },
                        { speaker: 'Ryan', text: 'I wasn\'t alone. Eva was—' },
                        { speaker: 'Ies', text: 'You could have DIED, Ryan.' },
                        { speaker: '', text: '*Silence. The equipment hums.*' },
                        { speaker: 'Ies', text: 'But you saved people. A lot of people.' },
                        { speaker: 'Ies', text: 'I\'m furious. And terrified. And... proud. All at once.' },
                        { speaker: 'Ryan', text: 'The AIVD wants to—' },
                        { speaker: 'Ies', text: 'I know. Van der Berg\'s card. I saw it.' },
                        { speaker: 'Ies', text: 'Let\'s not decide anything today. Today we walk the dogs. Eat stamppot. Be normal.' },
                        { speaker: 'Ryan', text: '*Smiles* Normal sounds perfect.' },
                        { speaker: '', text: '*Tino and Kessy trot in, tails wagging. ET snorts from the hallway.*' },
                        { speaker: 'Ies', text: 'See? They don\'t care about Russian spies. They want dinner.' },
                        { speaker: 'Ryan', text: '*Laughs* The real priorities.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The door to the house. Ies is making dinner. Normal. Blissfully normal.' }
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
                const iesTalk = game.getFlag('morning_ies_talk');

                if (emailRead && iesTalk) {
                    game.setFlag('morning_after_complete', true);
                    game.startDialogue([
                        { speaker: '', text: '*Days pass. Then weeks. Then months.*' },
                        { speaker: '', text: '*The world moves on. But some things have changed forever.*' }
                    ]);
                    game.sceneTimeout(() => {
                        game.loadScene('epilogue');
                    }, 4000);
                } else if (!emailRead && !iesTalk) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Not ready to move on. There\'s an email I should read. And Ies is at the door.' }
                    ]);
                } else if (!emailRead) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'There\'s a Protonmail notification I should check first.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Should talk to Ies first. She\'s at the door.' }
                    ]);
                }
            }
        }
    ],

    _timeoutIds: [],

    onEnter(game) {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        game.setFlag('visited_morning_after', true);

        const tid = setTimeout(() => {
            game.startDialogue([
                { speaker: '', text: 'The next morning — Mancave, Compascuum' },
                { speaker: '', text: '*Ryan sits in his chair. The equipment hums around him. For the first time in days, there is no crisis.*' },
                { speaker: 'Ryan', text: 'It\'s quiet. Almost too quiet.' },
                { speaker: 'Ryan', text: 'No Meshtastic alerts. No encrypted calls. No countdown.' },
                { speaker: 'Ryan', text: 'Just... morning.' },
                { speaker: '', text: '*247 unread emails on the laptop. An AIVD card on the desk. A Protonmail notification.*' }
            ]);
        }, 800);
        this._timeoutIds.push(tid);
    },

    onExit() {
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
