/**
 * Klooster Scene - Ter Apel Monastery
 * Meeting location with Eva Weber
 */

const KloosterScene = {
    id: 'klooster',
    name: 'Ter Apel Klooster',
    
    // SVG background - monastery at night
    background: 'assets/images/scenes/klooster.svg',
    
    // Ambient description
    description: 'The ancient Ter Apel monastery stands in solemn silence. Gothic arches frame a courtyard where centuries of secrets have been whispered.',
    
    // Player starting position
    playerStart: { x: 75, y: 85 },
    
    // Random idle thoughts for this scene
    idleThoughts: [
        "This place creeps me out...",
        "No one's here.",
        "Was this all a joke?",
        "Perfect spot for... nothing, apparently.",
        "Monks never imagined this.",
        "Check everywhere. Then the car."
    ],
    
    // Scene hotspots
    hotspots: [
        {
            id: 'entrance',
            name: 'Main Entrance',
            // SVG: tower at translate(450,50), entrance at translate(50,350)
            // Door area: x=450+50=500, y=50+350=400, w=150, h=250
            x: (500 / 1920) * 100,    // 26.04%
            y: (400 / 1080) * 100,    // 37.04%
            width: (150 / 1920) * 100, // 7.81%
            height: (250 / 1080) * 100, // 23.15%
            cursor: 'look',
            interactions: {
                look: () => {
                    game.showDialogue([
                        "The museum entrance. Heavy oak doors, probably centuries old.",
                        "A sign says GESLOTEN - closed. Not surprising at this hour."
                    ], "Ryan observes");
                },
                use: () => {
                    game.showDialogue([
                        "The doors are locked. The museum is closed.",
                        "But that is not why I am here anyway."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'courtyard',
            name: 'Courtyard',
            // SVG: rect x=100, y=700, w=950, h=380
            x: (100 / 1920) * 100,    // 5.21%
            y: (700 / 1080) * 100,    // 64.81%
            width: (950 / 1920) * 100, // 49.48%
            height: (270 / 1080) * 100, // 25.00%
            cursor: 'walk',
            interactions: {
                look: () => {
                    game.showDialogue([
                        "The central courtyard. Empty. Silent.",
                        "No one is here. Nothing is happening."
                    ], "Ryan observes");
                },
                use: () => {
                    if (!game.getFlag('checked_courtyard')) {
                        game.setFlag('checked_courtyard', true);
                        game.startDialogue([
                            { speaker: 'Ryan', text: '23:00. Exactly when they said.' },
                            { speaker: 'Ryan', text: 'Nobody here. Surprise, surprise.' },
                            { speaker: '', text: '*He waits in the shadows for fifteen minutes*' },
                            { speaker: 'Ryan', text: 'Screw this. Maybe it was all a joke.' },
                            { speaker: 'Ryan', text: 'Better check my car.' }
                        ]);
                    } else {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'Still no one. Time to go.' }
                        ]);
                    }
                }
            }
        },
        {
            id: 'garden',
            name: 'Hedge Garden',
            // SVG: translate(1100,450), w=300, h=350
            x: (1100 / 1920) * 100,   // 57.29%
            y: (450 / 1080) * 100,    // 41.67%
            width: (300 / 1920) * 100, // 15.63%
            height: (350 / 1080) * 100, // 32.41%
            cursor: 'look',
            interactions: {
                look: () => {
                    game.showDialogue([
                        "A carefully maintained hedge maze, part of the monastery historic gardens.",
                        "Good for hiding. Bad for quick escapes."
                    ], "Ryan observes");
                }
            }
        },
        {
            id: 'well',
            name: 'Ancient Well',
            // SVG: translate(400,750), w=150, frame goes to y=-70
            // Actual: x=400, y=680, w=150, h=150
            x: (400 / 1920) * 100,    // 20.83%
            y: (680 / 1080) * 100,    // 62.96%
            width: (150 / 1920) * 100, // 7.81%
            height: (150 / 1080) * 100, // 13.89%
            cursor: 'look',
            interactions: {
                look: () => {
                    game.showDialogue([
                        "An old stone well, probably medieval.",
                        "I wonder how many secrets have been dropped down there over the centuries."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'bench',
            name: 'Stone Bench',
            // SVG: translate(600,850), w=180, h=55
            x: (600 / 1920) * 100,    // 31.25%
            y: (850 / 1080) * 100,    // 78.70%
            width: (180 / 1920) * 100, // 9.38%
            height: (65 / 1080) * 100, // 6.02%
            cursor: 'use',
            interactions: {
                look: () => {
                    game.showDialogue([
                        "A cold stone bench. Monks used these for meditation.",
                        "I use it for waiting."
                    ], "Ryan");
                },
                use: () => {
                    game.showDialogue([
                        "I sit and wait...",
                        "The cold stone reminds me to stay alert."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'volvo',
            name: 'My Volvo',
            // SVG: translate(1450,700), w=400, h=300
            x: (1450 / 1920) * 100,   // 75.52%
            y: (700 / 1080) * 100,    // 64.81%
            width: (400 / 1920) * 100, // 20.83%
            height: (300 / 1080) * 100, // 27.78%
            cursor: 'use',
            lookMessage: function(game) {
                if (game.getFlag('found_usb_stick')) {
                    return "My Volvo. Time to drive home and check that USB.";
                }
                return "My old Volvo. Parked in the shadows.";
            },
            action: function(game) {
                if (!game.getFlag('found_usb_stick')) {
                    game.setFlag('found_usb_stick', true);
                    
                    game.startDialogue([
                        { speaker: '', text: '*Ryan approaches the Volvo*' },
                        { speaker: 'Ryan', text: 'Time to go home. What a waste of—' },
                        { speaker: 'Ryan', text: 'Wait. What the hell?' },
                        { speaker: '', text: '*There is something under the door handle*' },
                        { speaker: 'Ryan', text: 'A USB stick. Someone WAS here.' },
                        { speaker: '', text: '*A piece of tape wrapped around it with handwritten text:*' },
                        { speaker: '', text: '"TRUST THE PROCESS - AIR-GAPPED ONLY"' },
                        { speaker: 'Ryan', text: 'They watched me walk in. Watched me look around.' },
                        { speaker: 'Ryan', text: 'Never meant to meet face-to-face.' },
                        { speaker: 'Ryan', text: 'This IS the meeting.' }
                    ]);
                    
                    // Give USB stick item
                    game.addItem({
                        id: 'usb_stick',
                        name: 'USB Stick',
                        description: 'Black USB stick with note: "TRUST THE PROCESS - AIR-GAPPED ONLY". Whatever is on this drive, someone risked everything to deliver it.',
                        icon: 'assets/images/icons/usb-stick.svg'
                    });
                    
                    // Complete go_to_klooster quest and add new one
                    if (game.questManager.hasQuest('go_to_klooster')) {
                        game.questManager.complete('go_to_klooster');
                    }
                    
                    game.addQuest({
                        id: 'analyze_usb',
                        name: 'Analyze USB Stick',
                        description: 'Examine the USB stick on an air-gapped machine. Find out what "E" wants me to see.',
                        hint: 'Use the air-gapped laptop in the mancave'
                    });
                    
                    setTimeout(() => {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'Back to the mancave. Time to see what this is.' }
                        ]);
                        
                        setTimeout(() => {
                            game.showNotification('Click the Volvo to drive home');
                        }, 2000);
                    }, 2000);
                } else {
                    // Allow player to leave and go back to mancave
                    game.startDialogue([
                        { speaker: 'Ryan', text: '*Gets in the car*' },
                        { speaker: '', text: '*Engine starts. Time to head home.*' }
                    ]);
                    
                    setTimeout(() => {
                        console.log('Klooster: Setting driving_destination to home');
                        game.setFlag('driving_destination', 'home');
                        console.log('Klooster: Loading driving scene');
                        game.loadScene('driving');
                    }, 2000);
                }
            }
        },
        {
            id: 'left-wing',
            name: 'Monastery Left Wing',
            // SVG: translate(100,200), w=400, h=500
            x: (80 / 1920) * 100,     // 4.17%
            y: (100 / 1080) * 100,    // 9.26%
            width: (420 / 1920) * 100, // 21.88%
            height: (600 / 1080) * 100, // 55.56%
            cursor: 'look',
            interactions: {
                look: () => {
                    game.showDialogue([
                        "The left wing of the monastery. Gothic architecture at its finest.",
                        "The windows glow faintly. Some kind of security lighting inside."
                    ], "Ryan observes");
                }
            }
        },
        {
            id: 'right-wing',
            name: 'Monastery Right Wing',
            // SVG: translate(650,200), w=400, h=500
            x: (630 / 1920) * 100,    // 32.81%
            y: (100 / 1080) * 100,    // 9.26%
            width: (420 / 1920) * 100, // 21.88%
            height: (550 / 1080) * 100, // 50.93%
            cursor: 'look',
            interactions: {
                look: () => {
                    game.showDialogue([
                        "The right wing. More Gothic windows.",
                        "The architecture is impressive, even in the dark."
                    ], "Ryan observes");
                }
            }
        },
        {
            id: 'tower',
            name: 'Central Tower',
            // SVG: translate(450,50), tower w=250, cross to y=-130
            x: (450 / 1920) * 100,    // 23.44%
            y: (0 / 1080) * 100,      // 0%
            width: (250 / 1920) * 100, // 13.02%
            height: (400 / 1080) * 100, // 37.04%
            cursor: 'look',
            interactions: {
                look: () => {
                    game.showDialogue([
                        "The central tower rises into the night sky.",
                        "A cross at the top. A rose window beneath it.",
                        "Medieval craftsmanship that has lasted centuries."
                    ], "Ryan observes");
                }
            }
        },
        {
            id: 'moon',
            name: 'Moon',
            // SVG: circle cx=1650, cy=150, r=80 (with glow)
            x: (1570 / 1920) * 100,   // 81.77%
            y: (70 / 1080) * 100,     // 6.48%
            width: (160 / 1920) * 100, // 8.33%
            height: (160 / 1080) * 100, // 14.81%
            cursor: 'look',
            interactions: {
                look: () => {
                    game.showDialogue([
                        "A nearly full moon.",
                        "Perfect for clandestine meetings, ironically."
                    ], "Ryan");
                }
            }
        }
    ],
    
    // Scene entry
    onEnter: () => {
        game.showNotification('Arrived at Ter Apel Klooster');
        
        if (!game.getFlag('first_klooster_visit')) {
            game.setFlag('first_klooster_visit', true);
            
            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: '22:55. Five minutes early.' },
                    { speaker: 'Ryan', text: 'The monastery looks abandoned.' },
                    { speaker: 'Ryan', text: 'Dark windows. Locked doors. No signs of life.' },
                    { speaker: 'Ryan', text: 'But E said 23:00. Check the courtyard.' }
                ]);
            }, 500);
        }
    },
    
    // Scene exit
    onExit: () => {
        // Cleanup
    }
};

// Register scene when script loads
if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(KloosterScene);
}
