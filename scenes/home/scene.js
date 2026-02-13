/**
 * Scene: Home (Kitchen)
 * Starting scene - Ryan's farmhouse kitchen in Compascuum
 */

const HomeScene = {
    id: 'home',
    name: 'Home - Kitchen',
    
    // SVG background
    background: 'assets/images/scenes/home.svg',
    
    // Player starting position
    playerStart: { x: 50, y: 85 },
    
    // Random idle thoughts for this scene
    idleThoughts: [
        "Coffee. Now.",
        "Nice and quiet... for once.",
        "This place is a mess.",
        "Another day, another hack.",
        "Check my email... or not.",
        "Canal view never gets old."
    ],
    
    hotspots: [
        {
            id: 'espresso-machine',
            name: 'Espresso Machine',
            // SVG: translate(1200, 380), rect width=140, height=120
            x: 62.50,
            y: 35.19,
            width: 7.29,
            height: 11.11,
            cursor: 'pointer',
            lookMessage: "My trusty Italian espresso maker. Can't start the day without it.",
            action: function(game) {
                if (game.getFlag('made_espresso')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Already had my double dose. Time to work.' }
                    ]);
                } else {
                    game.setFlag('made_espresso', true);
                    game.setStoryPart(1);
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Okay, espresso time. Extra strong, double dose.' },
                        { speaker: '', text: '*The rich aroma fills the kitchen*' },
                        { speaker: 'Ryan', text: 'Perfect. Now I can actually think. Mancave time.' }
                    ]);
                    game.advanceTime(15);
                }
            }
        },
        {
            id: 'window',
            name: 'Kitchen Window',
            // SVG: translate(500, 120), outer frame x=-15, y=-15, w=430, h=380
            x: 25.26,
            y: 9.72,
            width: 22.40,
            height: 35.19,
            cursor: 'pointer',
            lookMessage: "The canal looks peaceful today. Such a nice view.",
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The canal is calm today. Peaceful.' },
                    { speaker: 'Ryan', text: 'I can see the road. Quiet as always.' },
                    { speaker: 'Ryan', text: 'That\'s what I love about Compascuum. Nothing ever happens here.' }
                ]);
            }
        },
        {
            id: 'door-livingroom',
            name: 'Door to Living Room',
            // SVG: translate(250, 200), rect x=-10, y=-10, w=180, h=570
            x: 13.02,
            y: 17.59,
            width: 9.38,
            height: 52.78,
            cursor: 'pointer',
            targetScene: 'livingroom'
        },
        {
            id: 'door-mancave',
            name: 'Door to Mancave',
            // SVG: translate(1700, 200), rect x=-10, y=-10, w=180, h=570
            x: 88.02,
            y: 17.59,
            width: 9.38,
            height: 52.78,
            cursor: 'pointer',
            condition: function(game) {
                return game.getFlag('made_espresso');
            },
            failMessage: 'I should make my espresso first. Can\'t think without caffeine.',
            targetScene: 'mancave'
        },
        {
            id: 'door-garden',
            name: 'Back Door (Garden)',
            // SVG: translate(50, 200), rect x=-10, y=-10, w=180, h=570
            x: 2.08,
            y: 17.59,
            width: 9.38,
            height: 52.78,
            cursor: 'pointer',
            targetScene: 'garden'
        },
        {
            id: 'clock',
            name: 'Wall Clock',
            // SVG: translate(350, 150), circle r=50
            x: 15.63,
            y: 9.26,
            width: 5.21,
            height: 9.26,
            cursor: 'pointer',
            lookMessage: "An old clock. It's been keeping time for years.",
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: '8:15 AM. Still early.' },
                    { speaker: 'Ryan', text: 'That clock\'s been ticking since I moved in.' }
                ]);
            }
        },
        {
            id: 'counter',
            name: 'Kitchen Counter',
            // SVG: rect x=1050, y=500, width=520, height=250
            x: 54.69,
            y: 46.30,
            width: 27.08,
            height: 23.15,
            cursor: 'pointer',
            lookMessage: "My counter. A bit cluttered, but I know where everything is.",
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My counter. Coffee cups, magazines, bills.' },
                    { speaker: 'Ryan', text: 'Should clean this up... but eh, future Ryan\'s problem.' }
                ]);
            }
        }
    ],
    
    onEnter: function(game) {
        // Remove any existing NPC characters from previous scenes
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            const npcCharacters = charactersContainer.querySelectorAll('.npc-character');
            npcCharacters.forEach(npc => npc.remove());
        }
        
        // First time entering the game
        if (!game.getFlag('game_started')) {
            game.setFlag('game_started', true);
            game.showNotification('Welcome to CyberQuest');
            
            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: 'Compascuum, Netherlands. Another morning.' },
                    { speaker: '', text: 'Ryan Weylant, hacker. Age 55. Lives with Ies and three dogs.' },
                    { speaker: 'Ryan', text: 'Coffee. Need coffee.' }
                ]);
            }, 1000);
        }
        
        // Update scene background with CSS class
        document.getElementById('scene-background').className = 'scene-home';
    },
    
    onExit: () => {
        // Remove any NPC characters when leaving home scene
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            const npcCharacters = charactersContainer.querySelectorAll('.npc-character');
            npcCharacters.forEach(npc => npc.remove());
        }
    }
};

// Register scene when loaded
if (window.game) {
    window.game.registerScene('home', HomeScene);
}

// Export for module systems
if (typeof module !== 'undefined') {
    module.exports = HomeScene;
}
