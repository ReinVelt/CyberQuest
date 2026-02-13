/**
 * Driving Scene - Volvo Interior
 * Transition scene for late-night drives with internal monologue
 */

const DrivingScene = {
    id: 'driving',
    name: 'Volvo - Night Drive',
    
    background: 'assets/images/scenes/driving.svg',
    
    description: 'Driving through the dark countryside. The dashboard glow, the hum of the engine, and racing thoughts.',
    
    // No player position - this is a cinematic scene
    playerStart: { x: 50, y: 50 },
    
    // No hotspots - this is pure dialogue/transition
    hotspots: [],
    
    // Store timeout IDs for cleanup
    _timeoutIds: [],
    
    // Scene entry - determines which monologue to play
    onEnter: function(gameInstance) {
        const g = gameInstance || window.game;
        const destination = g.getFlag('driving_destination');
        
        console.log('Driving scene entered. Destination:', destination);
        
        // Clear any previous timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        
        if (destination === 'klooster') {
            // Drive TO klooster - anxious, uncertain
            const timeoutId1 = setTimeout(() => {
                g.startDialogue([
                    { speaker: '', text: '*The Volvo rumbles through the darkness*' },
                    { speaker: 'Ryan', text: 'Ter Apel. 20 minutes. Maybe less at this hour.' },
                    { speaker: 'Ryan', text: 'Empty road. Good. Don\'t want anyone seeing me.' },
                    { speaker: '', text: '*Passes a dark farmhouse. A dog barks in the distance*' },
                    { speaker: 'Ryan', text: 'What am I doing? Meeting anonymous contacts at a monastery at midnight?' },
                    { speaker: 'Ryan', text: 'This is insane. This is how people disappear.' },
                    { speaker: '', text: '*The dashboard clock glows: 22:47*' },
                    { speaker: 'Ryan', text: 'But those signals. Those messages. They KNEW my equipment.' },
                    { speaker: 'Ryan', text: 'They knew I\'d decode SSTV. Knew I\'d understand.' },
                    { speaker: 'Ryan', text: 'This is big. Military frequencies. Encrypted transmissions.' },
                    { speaker: '', text: '*Approaches the monastery - silhouette against moonlight*' },
                    { speaker: 'Ryan', text: 'There it is. Ter Apel Klooster.' },
                    { speaker: 'Ryan', text: 'Centuries old. Perfect for secrets.' },
                    { speaker: 'Ryan', text: 'Let\'s see what this is about.' }
                ]);
                
                // After dialogue, transition to klooster
                const timeoutId2 = setTimeout(() => {
                    g.advanceTime(20);
                    g.setStoryPart(7);
                    g.loadScene('klooster');
                }, 16000); // ~16 seconds for dialogue
                this._timeoutIds.push(timeoutId2);
            }, 1000);
            this._timeoutIds.push(timeoutId1);
            
        } else if (destination === 'facility') {
            // Drive TO facility - infiltration night with border crossing
            const timeoutId1 = setTimeout(() => {
                g.startDialogue([
                    { speaker: '', text: '*11 PM. The Volvo cuts through darkness toward Germany*' },
                    { speaker: 'Ryan', text: 'This is it. The real thing.' },
                    { speaker: 'Ryan', text: 'Not monitoring signals. Not decoding messages. Actually infiltrating.' },
                    { speaker: '', text: '*Approaches the Dutch-German border. No checkpoint, no guards. Schengen.*' },
                    { speaker: 'Ryan', text: 'Welcome to Germany. Bundesrepublik Deutschland.' },
                    { speaker: 'Ryan', text: 'Funny how you can cross into another country without anyone noticing.' },
                    { speaker: 'Ryan', text: 'But go 10 kilometers further, and you hit military fencing.' },
                    { speaker: '', text: '*German road signs appear. Steckerdoser Heide: 8 km*' },
                    { speaker: 'Ryan', text: 'Eva said north entrance. Badge under trash bin.' },
                    { speaker: 'Ryan', text: 'If she\'s wrong. If this is a trap...' },
                    { speaker: 'Ryan', text: 'No. She\'s risking as much as me. More, even.' },
                    { speaker: '', text: '*Red lights appear through the trees. Guard tower. Radar arrays.*' },
                    { speaker: 'Ryan', text: 'There it is. Bundeswehr research facility.' },
                    { speaker: 'Ryan', text: 'Looks like something from a Cold War film. Because it IS.' },
                    { speaker: 'Ryan', text: 'Focus. Stay calm. You\'ve planned for this.' },
                    { speaker: '', text: '*Pulls off main road. Parks in shadows near perimeter.*' },
                    { speaker: 'Ryan', text: 'First: find that badge. Then we see what happens.' },
                    { speaker: 'Ryan', text: 'For Klaus Weber. For everyone Volkov has hurt.' },
                    { speaker: 'Ryan', text: 'Let\'s end this.' }
                ]);
                
                // After dialogue, transition to facility
                const timeoutId2 = setTimeout(() => {
                    g.advanceTime(25);
                    g.setStoryPart(17);
                    g.loadScene('facility');
                }, 17000); // ~17 seconds for dialogue
                this._timeoutIds.push(timeoutId2);
            }, 1000);
            this._timeoutIds.push(timeoutId1);
            
        } else if (destination === 'home') {
            // Drive FROM klooster - processing what just happened
            const timeoutId1 = setTimeout(() => {
                g.startDialogue([
                    { speaker: '', text: '*Engine starts. Headlights illuminate the parking lot*' },
                    { speaker: 'Ryan', text: 'Someone was watching. The whole time.' },
                    { speaker: 'Ryan', text: 'Watched me walk in. Search the courtyard. Get frustrated.' },
                    { speaker: '', text: '*Pulls onto the empty road*' },
                    { speaker: 'Ryan', text: 'Never meant to meet face to face.' },
                    { speaker: 'Ryan', text: 'This USB stick. "TRUST THE PROCESS - AIR-GAPPED ONLY"' },
                    { speaker: 'Ryan', text: 'They know operational security. They know MY setup.' },
                    { speaker: '', text: '*The countryside passes in darkness*' },
                    { speaker: 'Ryan', text: 'Who is "E"? Inside the facility? Outside?' },
                    { speaker: 'Ryan', text: 'Why me? Random hacker in rural Drenthe?' },
                    { speaker: 'Ryan', text: 'Unless... I\'m NOT random.' },
                    { speaker: '', text: '*Dashboard clock: 23:37*' },
                    { speaker: 'Ryan', text: 'They scanned my equipment. Identified my capabilities.' },
                    { speaker: 'Ryan', text: 'They chose me because I\'m OUTSIDE the system.' },
                    { speaker: 'Ryan', text: 'Can\'t be controlled. Can\'t be silenced easily.' },
                    { speaker: '', text: '*Approaches home - familiar darkness*' },
                    { speaker: 'Ryan', text: 'Time to plug this in. See what\'s worth all this cloak and dagger.' },
                    { speaker: 'Ryan', text: 'Air-gapped laptop. Isolated. Safe.' },
                    { speaker: 'Ryan', text: 'Let\'s see what "E" wants me to know.' }
                ]);
                
                // After dialogue, transition to mancave
                const timeoutId2 = setTimeout(() => {
                    g.advanceTime(25);
                    g.loadScene('mancave');
                    g.showNotification('Returned to mancave');
                }, 18000); // ~18 seconds for dialogue
                this._timeoutIds.push(timeoutId2);
            }, 1000);
            this._timeoutIds.push(timeoutId1);
        } else {
            console.warn('Driving scene: No destination set!');
            // Fallback - return to mancave
            const timeoutId = setTimeout(() => {
                g.loadScene('mancave');
            }, 2000);
            this._timeoutIds.push(timeoutId);
        }
        
        // Clear the destination flag
        g.setFlag('driving_destination', null);
    },
    
    onExit: function() {
        // Clear all timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
        
        // Cancel any active dialogue
        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }
    }
};

// Register scene
if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(DrivingScene);
}
