/**
 * Car Discovery Scene - USB Stick on Door Handle
 * Ryan discovers the USB stick left under his Volvo's door handle at Ter Apel Klooster
 */

const CarDiscoveryScene = {
    id: 'car_discovery',
    name: 'Volvo Door Handle',
    
    // SVG background - close-up of car door with USB stick
    background: 'assets/images/scenes/car_discovery.svg',
    
    // Ambient description
    description: 'A close-up view of the Volvo\'s door handle. Something is hidden underneath.',
    
    // Player starting position (off-screen, this is a static discovery scene)
    playerStart: { x: 50, y: 90 },
    
    // Scene hotspots
    hotspots: [
        {
            id: 'usb_stick',
            name: 'USB Stick',
            // The USB stick is in the detail inset - upper right quadrant
            // Inset box: translate(1150,150), rect 700x550 → abs (1150,150)-(1850,700)
            x: 60,   // (1150/1920) * 100
            y: 14,   // (150/1080) * 100
            width: 36.5,  // (700/1920) * 100
            height: 51,   // (550/1080) * 100
            cursor: 'use',
            action: function(game) {
                if (!game.getFlag('picked_up_usb')) {
                    game.setFlag('picked_up_usb', true);
                    
                    game.startDialogue([
                        { speaker: '', text: '*Ryan carefully removes the USB stick from under the door handle*' },
                        { speaker: 'Ryan', text: 'A piece of tape wrapped around it with handwritten text...' },
                        { speaker: '', text: '"TRUST THE PROCESS - AIR-GAPPED ONLY"' },
                        { speaker: 'Ryan', text: 'They watched me walk in. Watched me look around.' },
                        { speaker: 'Ryan', text: 'Never meant to meet face-to-face.' },
                        { speaker: 'Ryan', text: 'This IS the meeting.' },
                        { speaker: 'Ryan', text: 'Back to the mancave. Time to see what this is.' }
                    ]);
                    
                    // Give USB stick item
                    game.addItem({
                        id: 'usb_stick',
                        name: 'USB Stick',
                        description: 'Black USB stick with note: "TRUST THE PROCESS - AIR-GAPPED ONLY". Whatever is on this drive, someone risked everything to deliver it.',
                        icon: 'assets/images/icons/usb-stick.svg'
                    });
                    
                    // Complete go_to_klooster quest and add new one
                    if (game.questManager && game.questManager.hasQuest('go_to_klooster')) {
                        game.questManager.complete('go_to_klooster');
                    }
                    
                    game.addQuest({
                        id: 'analyze_usb',
                        name: 'Analyze USB Stick',
                        description: 'Examine the USB stick on an air-gapped machine. Find out what "E" wants me to see.',
                        hint: 'Use the air-gapped laptop in the mancave'
                    });
                    
                    setTimeout(() => {
                        game.showNotification('Click the car to get in and drive home');
                    }, 2000);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Already got the USB stick. Time to go home.' }
                    ]);
                }
            }
        },
        {
            id: 'door_handle',
            name: 'Door Handle',
            // Actual car door handle on the left side
            x: 35,  // (670/1920) * 100
            y: 65,  // (700/1080) * 100
            width: 10,  // (190/1920) * 100
            height: 10,  // (108/1080) * 100
            cursor: 'look',
            action: function(game) {
                if (!game.getFlag('picked_up_usb')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Wait. What the hell?' },
                        { speaker: 'Ryan', text: 'There\'s something under the door handle...' },
                        { speaker: '', text: '*A USB stick. Someone WAS here.*' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Just the door handle now. The USB stick is safely in my pocket.' }
                    ]);
                }
            }
        },
        {
            id: 'car',
            name: 'Get in Car',
            // Entire car body area: translate(250,400), body from x=60 to x=1220
            // Abs: x=310 to x=1470, y=600 to y=905
            x: 13,    // (250/1920) * 100
            y: 55,    // (600/1080) * 100
            width: 64, // (1220/1920) * 100 — covers full car including rear
            height: 35, // (380/1080) * 100
            cursor: 'use',
            action: function(game) {
                if (game.getFlag('picked_up_usb')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: '*Gets in the car*' },
                        { speaker: '', text: '*Engine starts. Time to head home.*' }
                    ]);
                    
                    game.sceneTimeout(() => {
                        console.log('Car Discovery: Setting driving_destination to home');
                        game.setFlag('driving_destination', 'home');
                        console.log('Car Discovery: Loading driving scene');
                        game.loadScene('driving');
                    }, 2000);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Not yet. There\'s something on the door handle...' }
                    ]);
                }
            }
        }
    ],
    
    // Scene entry
    onEnter: function(game) {
        console.log('[Car Discovery] Scene entered');
        console.log('[Car Discovery] Flags:', {
            saw_usb_first_time: game.getFlag('saw_usb_first_time'),
            picked_up_usb: game.getFlag('picked_up_usb')
        });
        
        if (!game.getFlag('saw_usb_first_time')) {
            game.setFlag('saw_usb_first_time', true);
            
            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: '*Ryan approaches the Volvo*' },
                    { speaker: 'Ryan', text: 'Time to go home. What a waste of—' },
                    { speaker: 'Ryan', text: 'Wait. What the hell?' },
                    { speaker: 'Ryan', text: 'There\'s something taped under the door handle...' }
                ]);
                
                setTimeout(() => {
                    game.showNotification('⚠️ Click the USB STICK in the detail box (upper right) to examine it!');
                }, 3000);
            }, 500);
        } else {
            // Returning to scene
            if (!game.getFlag('picked_up_usb')) {
                game.showNotification('Click the USB STICK in the detail box (upper right)');
            } else {
                game.showNotification('Click the car to drive home');
            }
        }
    },
    
    // Scene exit
    onExit: function(game) {
        console.log('[Car Discovery] Scene exited');
    }
};

// Scene will be registered in index.html initGame() function
