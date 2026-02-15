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
            // The USB stick on the door handle - make it prominent
            x: 35,
            y: 45,
            width: 30,
            height: 20,
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
            x: 30,
            y: 40,
            width: 40,
            height: 30,
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
            x: 15,
            y: 35,
            width: 70,
            height: 50,
            cursor: 'use',
            action: function(game) {
                if (game.getFlag('picked_up_usb')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: '*Gets in the car*' },
                        { speaker: '', text: '*Engine starts. Time to head home.*' }
                    ]);
                    
                    setTimeout(() => {
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
    onEnter: () => {
        game.showNotification('Discovered something on the car...');
        
        if (!game.getFlag('saw_usb_first_time')) {
            game.setFlag('saw_usb_first_time', true);
            
            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: '*Ryan approaches the Volvo*' },
                    { speaker: 'Ryan', text: 'Time to go home. What a waste of—' },
                    { speaker: 'Ryan', text: 'Wait. What the hell?' }
                ]);
                
                setTimeout(() => {
                    game.showNotification('Click the USB stick to examine it');
                }, 2000);
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
    game.registerScene(CarDiscoveryScene);
}
