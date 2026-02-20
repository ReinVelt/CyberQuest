/**
 * Klooster Scene - Ter Apel Monastery
 * Late-night USB drop location. No direct meeting - mysterious contact "E" leaves USB on Volvo.
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
        "Check everywhere. Then the car.",
        "Gothic architecture is unsettling at night.",
        "They're watching. I can feel it.",
        "Every shadow looks suspicious.",
        "Medieval stone tells no tales.",
        "This courtyard echoes weirdly.",
        "Centuries of secrets here.",
        "Should have brought a flashlight.",
        "Too quiet. Way too quiet.",
        "Someone was here recently.",
        "Trust the process, they said.",
        "Hope this wasn't a trap.",
        "Full moon. How cinematic.",
        "My paranoia meter is maxed.",
        "Time to go home."
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
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The museum entrance. Heavy oak doors, probably centuries old.' },
                    { speaker: 'Ryan', text: 'A sign says GESLOTEN - closed. Not surprising at this hour.' }
                ]);
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
            cursor: 'pointer',
            action: function(game) {
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
                look: (game) => {
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
                look: (game) => {
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
                look: (game) => {
                    game.showDialogue([
                        "A cold stone bench. Monks used these for meditation.",
                        "I use it for waiting."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'volvo',
            name: 'My Volvo',
            // SVG: translate(1450,700), w=400, h=300
            // Simplified coordinates - the car is in the bottom right
            x: 75,
            y: 65,
            width: 21,
            height: 28,
            cursor: 'pointer',
            skipWalk: false,
            lookMessage: function(game) {
                if (game.getFlag('picked_up_usb')) {
                    return "My Volvo. Time to drive home and check that USB.";
                }
                return "My old Volvo. Parked in the shadows.";
            },
            action: function(game) {
                console.log('[Klooster] Volvo clicked. Flags:', {
                    found_usb_stick: game.getFlag('found_usb_stick'),
                    picked_up_usb: game.getFlag('picked_up_usb')
                });
                
                if (!game.getFlag('found_usb_stick')) {
                    // First time approaching the car - discover the USB stick
                    game.setFlag('found_usb_stick', true);
                    console.log('[Klooster] Setting found_usb_stick flag and loading car_discovery scene');
                    
                    // Transition to the close-up car discovery scene
                    game.sceneTimeout(() => {
                        console.log('[Klooster] Now calling loadScene for car_discovery');
                        game.loadScene('car_discovery');
                    }, 500);
                } else if (game.getFlag('picked_up_usb')) {
                    // Already picked up USB, allow driving home
                    game.startDialogue([
                        { speaker: 'Ryan', text: '*Gets in the car*' },
                        { speaker: '', text: '*Engine starts. Time to head home.*' }
                    ]);
                    
                    game.sceneTimeout(() => {
                        console.log('Klooster: Setting driving_destination to home');
                        game.setFlag('driving_destination', 'home');
                        console.log('Klooster: Loading driving scene');
                        game.loadScene('driving');
                    }, 2000);
                } else {
                    // Found USB but haven't picked it up yet - go back to car discovery
                    game.loadScene('car_discovery');
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
                look: (game) => {
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
                look: (game) => {
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
                look: (game) => {
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
                look: (game) => {
                    game.showDialogue([
                        "A nearly full moon.",
                        "Perfect for clandestine meetings, ironically."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'westerbork-sign',
            name: 'Road Sign: Westerbork Memorial',
            x: 2,
            y: 50,
            width: 10,
            height: 20,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The road sign. Westerbork — 12 km. The memorial is just down the road from here.' },
                    { speaker: 'Ryan', text: 'I\'ve been meaning to go. Something about this whole situation keeps pulling me toward that place.' },
                ], () => {
                    game.loadScene('westerbork_memorial');
                });
            }
        }
    ],
    
    // Scene entry
    onEnter: function(game) {
        console.log('[Klooster] Scene entered');
        console.log('[Klooster] Hotspots:', this.hotspots.map(h => h.id));
        game.showNotification('Arrived at Ter Apel Klooster - Click the Volvo (bottom right)');
        
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
    onExit: function(game) {
        console.log('[Klooster] Scene exited');
    }
};

// Scene will be registered in index.html initGame() function
