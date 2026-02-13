/**
 * Epilogue Scene - Three Months Later
 * Final wrap-up showing outcomes and new beginnings
 */

const EpilogueScene = {
    id: 'epilogue',
    name: 'Three Months Later',
    
    background: 'assets/images/scenes/epilogue.svg',
    
    description: 'Spring has arrived in Compascuum. The world has changed. So has Ryan.',
    
    playerStart: { x: 50, y: 85 },
    
    idleThoughts: [],
    
    hotspots: [],
    
    onEnter: function(game) {
        // Show epilogue sequence
        setTimeout(() => {
            game.startDialogue([
                { speaker: '', text: '📅 THREE MONTHS LATER' },
                { speaker: '', text: '🌸 May 2026' },
                { speaker: '', text: '' },
                
                // Facility
                { speaker: 'Narrator', text: 'The Steckerdoser Heide facility has been shut down pending a complete security review.' },
                { speaker: 'Narrator', text: 'Seven German officials arrested in connection with Operation ZERFALL.' },
                { speaker: 'Narrator', text: 'New vetting requirements passed by German parliament.' },
                { speaker: '', text: '' },
                
                // Volkov
                { speaker: 'Narrator', text: 'Dimitri Volkov awaits trial in a maximum-security prison outside Munich.' },
                { speaker: 'Narrator', text: 'He\'s negotiating with American intelligence for a lighter sentence.' },
                { speaker: 'Narrator', text: 'Information about other SPEKTR-derived programs - a dark legacy.' },
                { speaker: '', text: '' },
                
                // Hoffmann
                { speaker: 'Narrator', text: 'Director Hoffmann made a full confession in exchange for witness protection.' },
                { speaker: 'Narrator', text: 'He\'s somewhere in Canada now, living under a new name.' },
                { speaker: 'Narrator', text: 'Looking over his shoulder for the rest of his life.' },
                { speaker: '', text: '' },
                
                // Chris
                { speaker: 'Narrator', text: 'Chris Kubecka published a comprehensive report on Operation ZERFALL.' },
                { speaker: 'Narrator', text: 'Tracing Russian influence operations across seven European countries.' },
                { speaker: 'Narrator', text: 'Now required reading at NATO intelligence agencies.' },
                { speaker: '', text: '' },
                
                // Cees Bassa
                { speaker: 'Narrator', text: 'Cees Bassa went back to his work at ASTRON.' },
                { speaker: 'Narrator', text: 'But keeps her radio equipment tuned to interesting frequencies.' },
                { speaker: 'Narrator', text: 'Just in case.' },
                { speaker: '', text: '' },
                
                // Jaap Haartsen
                { speaker: 'Narrator', text: 'Jaap Haartsen started a security consulting firm.' },
                { speaker: 'Narrator', text: 'His first client: a German defense contractor.' },
                { speaker: 'Narrator', text: 'Improving their vetting procedures.' },
                { speaker: '', text: '' },
                
                // Eva
                { speaker: 'Narrator', text: 'Eva Weber testified before a closed session of the German parliament.' },
                { speaker: 'Narrator', text: 'Her identity remains classified.' },
                { speaker: 'Narrator', text: 'Rumors say she\'s working for a European cybersecurity agency now.' },
                { speaker: 'Narrator', text: 'No one can confirm it.' },
                { speaker: '', text: '' },
                
                // Ryan
                { speaker: 'Narrator', text: 'And Ryan Weylant?' },
                { speaker: 'Narrator', text: 'He took the meeting with Agent Van der Berg.' },
                { speaker: 'Narrator', text: 'Then another meeting. Then a training program in The Hague.' },
                { speaker: '', text: '' },
                { speaker: 'Narrator', text: 'These days, when strange signals appear on his SSTV terminal...' },
                { speaker: 'Narrator', text: '...he doesn\'t investigate alone.' },
                { speaker: '', text: '' },
                { speaker: 'Narrator', text: 'He has backup now.' },
                { speaker: '', text: '' },
                
                // Thank you message
                { speaker: '', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
                { speaker: '', text: '' },
                { speaker: '', text: '🎮 THANK YOU FOR PLAYING' },
                { speaker: '', text: '' },
                { speaker: '', text: 'CYBERQUEST: OPERATION ZERFALL' },
                { speaker: '', text: '' },
                { speaker: 'Project Echo Exposed', text: '✓ Russian infiltration revealed' },
                { speaker: 'Lives Saved', text: '✓ Groningen demonstration prevented' },
                { speaker: 'Truth Uncovered', text: '✓ Operation ZERFALL disrupted' },
                { speaker: 'Justice Served', text: '✓ Hoffmann and Volkov in custody' },
                { speaker: 'Hero Emerged', text: '✓ Eva Weber - The Whistleblower' },
                { speaker: '', text: '' },
                { speaker: '', text: 'Sometimes, one person with the right skills,' },
                { speaker: '', text: 'the courage to act, and a strong espresso' },
                { speaker: '', text: 'can change the world.' },
                { speaker: '', text: '' },
                { speaker: '', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' }
            ]);
            
            // After dialogue, go to credits
            setTimeout(() => {
                game.loadScene('credits');
            }, 3000);
        }, 500);
    }
};

// Register scene
if (typeof window.game !== 'undefined') {
    window.game.registerScene(EpilogueScene);
}
