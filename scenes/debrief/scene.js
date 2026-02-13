/**
 * Debrief Scene - AIVD Visit to Ryan's House
 * Story Part 20 - The Reckoning aftermath
 */

const DebriefScene = {
    id: 'debrief',
    name: 'Dining Room - AIVD Debrief',
    
    background: 'assets/images/scenes/debrief.svg',
    
    description: 'Two black cars in the driveway. AIVD agents in dark suits. A formal debrief around the dining table.',
    
    playerStart: { x: 30, y: 75 },
    
    idleThoughts: [
        "This is surreal.",
        "Dutch intelligence in my kitchen.",
        "At least the espresso is good.",
        "Are they arresting me or recruiting me?",
        "Van der Berg seems... reasonable."
    ],
    
    hotspots: [],
    
    onEnter: function(game) {
        // Show AIVD agents
        setTimeout(() => {
            // Van der Berg (lead agent) - center position
            game.showCharacter('vandeberg', 70, 65, 0.28);
        }, 300);
        
        // Show debrief sequence
        setTimeout(() => {
            game.startDialogue([
                { speaker: '', text: '⏰ 11:00 AM - Ryan\'s House' },
                { speaker: '', text: '🚗 Two black cars. Dutch plates. AIVD.' },
                { speaker: '', text: '' },
                { speaker: 'Ryan', text: '*Watches from window as four people in dark suits step out*' },
                { speaker: 'Ryan', text: 'Three men and a woman. Official. Not hostile... just official.' },
                { speaker: '', text: '' },
                { speaker: 'Ryan', text: '*Opens door before they knock*' },
                { speaker: 'Agent Van der Berg', text: 'Herr Weylant. Or should I say, Ryan.' },
                { speaker: 'Agent Van der Berg', text: 'My name is Van der Berg. We have some questions. May we come in?' },
                { speaker: 'Ryan', text: 'Can I offer you an espresso?' },
                { speaker: 'Agent Van der Berg', text: '*Thin smile* That would be appreciated. It\'s been a long morning for all of us.' },
                { speaker: '', text: '' },
                
                // The debrief
                { speaker: '', text: '*They sit at the dining table, sipping espresso*' },
                { speaker: 'Agent Van der Berg', text: 'Let\'s start from the beginning. The SSTV transmission?' },
                { speaker: 'Ryan', text: '*Explains everything* Visual morse code. ROT1 cipher. House photograph...' },
                { speaker: 'Agent Van der Berg', text: 'The USB drop at Ter Apel Klooster?' },
                { speaker: 'Ryan', text: 'Schematics. Evidence files. Eva Weber\'s data.' },
                { speaker: 'Agent Van der Berg', text: 'And the Meshtastic communications?' },
                { speaker: 'Ryan', text: 'Eva guided me. She knew the facility layout. The maintenance access point.' },
                { speaker: 'Agent Van der Berg', text: 'And then you infiltrated a German military facility.' },
                { speaker: 'Ryan', text: 'To stop the demonstration. To corrupt the calibration. To save Groningen.' },
                { speaker: '', text: '' },
                
                // Van der Berg's assessment
                { speaker: 'Agent Van der Berg', text: '*Nods slowly* You understand this is highly irregular.' },
                { speaker: 'Agent Van der Berg', text: 'A Dutch citizen conducting an unsanctioned operation on German soil.' },
                { speaker: 'Ryan', text: 'I understand.' },
                { speaker: 'Agent Van der Berg', text: 'The Germans want to give you a medal. Or arrest you. They can\'t decide which.' },
                { speaker: 'Ryan', text: 'And the Dutch?' },
                { speaker: '', text: '' },
                
                // AIVD perspective
                { speaker: 'Agent Van der Berg', text: '*Exchanges glance with colleagues*' },
                { speaker: 'Agent Van der Berg', text: 'We\'ve been tracking Russian influence operations in the border region for years.' },
                { speaker: 'Agent Van der Berg', text: 'We suspected something was happening at Steckerdoser but could never get proof.' },
                { speaker: 'Agent Van der Berg', text: 'You handed us the entire case on a silver platter.' },
                { speaker: 'Ryan', text: 'So...?' },
                { speaker: '', text: '' },
                
                // The official position
                { speaker: 'Agent Van der Berg', text: 'So the official position of the AIVD is this:' },
                { speaker: 'Agent Van der Berg', text: 'You are a private citizen who received unsolicited information...' },
                { speaker: 'Agent Van der Berg', text: '...and acted in good faith to prevent harm to human life.' },
                { speaker: '', text: '' },
                
                // The offer
                { speaker: 'Agent Van der Berg', text: 'Unofficially...' },
                { speaker: 'Agent Van der Berg', text: '*Leans forward* We could use someone with your skills.' },
                { speaker: 'Agent Van der Berg', text: 'If you\'re interested.' },
                { speaker: 'Ryan', text: 'Are you... recruiting me?' },
                { speaker: 'Agent Van der Berg', text: 'I\'m suggesting that your talents might be better utilized...' },
                { speaker: 'Agent Van der Berg', text: '...with institutional support.' },
                { speaker: 'Agent Van der Berg', text: 'Think about it.' },
                { speaker: '', text: '' },
                
                // Departure
                { speaker: '', text: '*Van der Berg places a business card on the table*' },
                { speaker: 'Agent Van der Berg', text: 'My direct line. When you\'re ready.' },
                { speaker: '', text: '*The agents stand, finish their espresso*' },
                { speaker: 'Agent Van der Berg', text: 'Thank you for the coffee, Ryan. And thank you for what you did.' },
                { speaker: 'Agent Van der Berg', text: 'You may have saved thousands of lives.' },
                { speaker: '', text: '' },
                { speaker: '', text: '*The black cars drive away*' },
                { speaker: '', text: '' },
                
                // Ryan's reflection
                { speaker: 'Ryan', text: '*Alone at the dining table, staring at the business card*' },
                { speaker: 'Ryan', text: 'AIVD. Dutch Intelligence.' },
                { speaker: 'Ryan', text: 'From freelance hacker to... what? Government agent?' },
                { speaker: 'Ryan', text: 'Is that who I am now?' },
                { speaker: '', text: '' },
                { speaker: 'Ryan', text: '*Makes another espresso*' },
                { speaker: 'Ryan', text: 'I need to think about this.' },
                { speaker: '', text: '' },
                { speaker: '', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
                { speaker: '', text: 'MISSION COMPLETE' },
                { speaker: '', text: 'THE CHOICE IS YOURS' },
                { speaker: '', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' }
            ]);
            
            // Transition to epilogue after dialogue
            setTimeout(() => {
                game.loadScene('epilogue');
            }, 3000);
        }, 1000);
    },
    
    onExit: function(game) {
        // Clean up characters
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            const npcCharacters = charactersContainer.querySelectorAll('.npc-character');
            npcCharacters.forEach(npc => npc.remove());
        }
    }
};

// Register scene
if (typeof window.game !== 'undefined') {
    window.game.registerScene(DebriefScene);
}
