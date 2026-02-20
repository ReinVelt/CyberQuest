/**
 * Facility Scene - Steckerdoser Heide Military R&D
 * Final act location - infiltration and evidence gathering
 */

const FacilityScene = {
    id: 'facility',
    name: 'Steckerdoser Heide Facility',
    
    // SVG background - military facility at night
    background: 'assets/images/scenes/facility.svg',
    
    // Ambient description
    description: 'The military research facility stands behind layers of fencing and surveillance. Somewhere inside, Volkov continues his work. Not for much longer.',
    
    // Player starting position
    playerStart: { x: 85, y: 85 },
    
    // Random idle thoughts for this scene
    idleThoughts: [
        "Stay calm. Focus.",
        "Security looks tight.",
        "Volkov's in there...",
        "Way outside my comfort zone.",
        "Eva better know what she's doing.",
        "One wrong move, it's over."
    ],
    
    // Scene state
    state: {
        cameraDisabled: false,
        gateOpen: false,
        alarmTriggered: false
    },
    
    // Scene hotspots
    hotspots: [
        {
            id: 'trash_bin',
            name: 'Trash Bin',
            // SVG: translate(300, 650), bin body from x=-35 to x=35, y=10 to y=90
            // Absolute: x=265 to x=335, y=660 to y=740
            x: (265 / 1920) * 100,     // 13.80%
            y: (660 / 1080) * 100,     // 61.11%
            width: (70 / 1920) * 100,   // 3.65%
            height: (80 / 1080) * 100,  // 7.41%
            cursor: 'pointer',
            enabled: (game) => game.gameState.storyPart >= 17,
            action: function(game) {
                if (!game.hasItem('security_badge')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: '*Reaches under the plastic bin liner*' },
                        { speaker: 'Ryan', text: 'There. Something taped underneath.' },
                        { speaker: '', text: '*Pulls free a security badge with keycard*' },
                        { speaker: 'Ryan', text: "Eva Weber's own ID. She's risking everything." },
                        { speaker: 'Ryan', text: 'Photo shows a woman about my age. Dark hair, determined eyes.' },
                        { speaker: 'Ryan', text: 'This badge gets me through the front gate. After that...' },
                        { speaker: 'Ryan', text: "Time to see what I'm made of." }
                    ]);
                    
                    setTimeout(() => {
                        game.addItem({
                            id: 'security_badge',
                            name: "Eva's Security Badge",
                            description: "Eva Weber's facility security badge. LEVEL 3 ACCESS. This is her entire career - and she's trusting it to a stranger.",
                            icon: 'assets/images/icons/badge.svg'
                        });
                        
                        game.questManager.updateProgress('infiltrate_facility', 'badge_acquired');
                        game.showNotification('Security badge acquired');
                        
                        setTimeout(() => {
                            game.startDialogue([
                                { speaker: 'Ryan', text: "Now: camera, then gate. Let's move." }
                            ]);
                        }, 1500);
                    }, 500);
                } else {
                    game.showDialogue(["Already have the badge."], "Ryan");
                }
            }
        },
        {
            id: 'main-building',
            name: 'Main R&D Building',
            // SVG: translate(600,150), w=600, h=400
            x: (600 / 1920) * 100,    // 31.25%
            y: (120 / 1080) * 100,    // 11.11%
            width: (600 / 1920) * 100, // 31.25%
            height: (440 / 1080) * 100, // 40.74%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "The main research building. 'FORSCHUNGSZENTRUM' - Research Center.",
                        "Multiple floors, lots of lit windows. People working late.",
                        "The server room should be in the basement, according to Eva's intel."
                    ], "Ryan analyzes");
                }
            }
        },
        {
            id: 'fence',
            name: 'Security Fence',
            // SVG: translate(0,550), h=150, full width
            x: (0 / 1920) * 100,      // 0%
            y: (550 / 1080) * 100,    // 50.93%
            width: (1920 / 1920) * 100, // 100%
            height: (150 / 1080) * 100, // 13.89%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "Military-grade fencing. Razor wire on top.",
                        "Sensors embedded in the mesh - touching it would trigger alarms.",
                        "We need to go through the gate, not over."
                    ], "Ryan analyzes");
                }
            }
        },
        {
            id: 'camera',
            name: 'Surveillance Camera',
            // SVG: translate(350,500), camera body x=-20 to x=25, y=-15 to y=50
            // Clickable area enlarged for usability (centered on visual element)
            x: 15.86,
            y: 43.92,
            width: 5,
            height: 8,
            cursor: 'pointer',
            action: function(game) {
                if (game.hasItem('flipper_zero')) {
                    const state = FacilityScene.state;
                    if (!state.cameraDisabled) {
                        game.startDialogue([
                            { speaker: 'Ryan', text: '*Pulls out Flipper Zero from jacket*' },
                            { speaker: 'Ryan', text: 'Scanning for the camera\'s wireless frequency...' },
                            { speaker: '', text: '*Device screen shows: 2.4 GHz - CCTV-CAM-N3*' },
                            { speaker: 'Ryan', text: 'Got it. Sending jamming signal...' },
                            { speaker: '', text: '*Camera LED flickers... then goes dark*' },
                            { speaker: 'Ryan', text: 'Camera disabled. 10 minutes before they notice. Move fast.' }
                        ]);
                        
                        state.cameraDisabled = true;
                        game.questManager.updateProgress('infiltrate_facility', 'camera_disabled');
                        
                        setTimeout(() => {
                            game.showNotification('Camera disabled - Approach gate now');
                        }, 2000);
                    } else {
                        game.showDialogue(["Camera is already disabled. Gate is next."], "Ryan");
                    }
                } else {
                    game.showDialogue([
                        "I need something to disable this camera...",
                        "The Flipper Zero would work. It\'s in my mancave."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'guard_post',
            name: 'Guard Tower',
            // SVG: translate(50,350), w=100, h=350
            x: (50 / 1920) * 100,     // 2.60%
            y: (350 / 1080) * 100,    // 32.41%
            width: (100 / 1920) * 100, // 5.21%
            height: (350 / 1080) * 100, // 32.41%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "The guard tower. Searchlight sweeping the perimeter.",
                        "Military police - Feldjäger. Not people to mess with.",
                        "We'll need David's distraction to draw them away."
                    ], "Ryan observes");
                }
            }
        },
        {
            id: 'radar',
            name: 'Radar Array',
            // SVG: translate(150,200), tower h=370
            x: (150 / 1920) * 100,    // 7.81%
            y: (180 / 1080) * 100,    // 16.67%
            width: (120 / 1920) * 100, // 6.25%
            height: (370 / 1080) * 100, // 34.26%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "Radar and antenna array. Probably for drone research.",
                        "The dish is rotating slowly. Scanning something."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'hangar',
            name: 'Hangar B-7',
            // SVG: translate(1300,300), path w=300, h=280
            x: (1300 / 1920) * 100,   // 67.71%
            y: (250 / 1080) * 100,    // 23.15%
            width: (300 / 1920) * 100, // 15.63%
            height: (300 / 1080) * 100, // 27.78%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "Hangar B-7. I can see the shadow of something inside.",
                        "That's the drone prototype. The target of Operation ZERFALL."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'control_panel',
            name: 'Gate Control',
            // SVG: gate at translate(800,550), booth at x+280, y+50
            // Actual: x=1080, y=600, w=80, h=150
            x: (1080 / 1920) * 100,   // 56.25%
            y: (600 / 1080) * 100,    // 55.56%
            width: (80 / 1920) * 100,  // 4.17%
            height: (150 / 1080) * 100, // 13.89%
            cursor: 'pointer',
            action: function(game) {
                    const state = FacilityScene.state;
                    if (!state.cameraDisabled) {
                        game.showDialogue([
                            "I can't approach the gate with that camera watching.",
                            "Need to disable it first."
                        ], "Ryan");
                        return;
                    }
                    
                    if (!game.hasItem('security_badge')) {
                        game.showDialogue([
                            "The gate control requires keycard access.",
                            "I need Eva's badge. Should be at the north entrance trash bin."
                        ], "Ryan");
                        return;
                    }
                    
                    if (state.gateOpen) {
                        game.showDialogue(["The gate is already open. Time to move inside."], "Ryan");
                        return;
                    }
                    
                    if (game.hasItem('flipper_zero') && game.hasItem('security_badge')) {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'This is it. Camera is down. Time to get through that gate.' },
                            { speaker: 'Ryan', text: '*Holds Eva\'s badge to the reader*' },
                            { speaker: '', text: '*BEEP* ACCESS DENIED - BADGE SUSPENDED' },
                            { speaker: 'Ryan', text: 'Shit. They suspended her credentials. Expected.' },
                            { speaker: 'Ryan', text: 'But the Flipper Zero recorded valid badge signals earlier...' },
                            { speaker: '', text: '*Replays captured RFID signal from guard\'s badge*' },
                            { speaker: '', text: '*BEEP* AUTHORIZED - LEVEL 2 ACCESS' },
                            { speaker: '', text: '*Gate mechanism clicks. Barrier slowly rises.*' },
                            { speaker: 'Ryan', text: 'We\'re in. Move fast before they check the camera logs.' }
                        ]);
                        
                        state.gateOpen = true;
                        game.setFlag('badge_cloned', true);
                        game.setStoryPart(18);
                        game.questManager.updateProgress('infiltrate_facility', 'gate_opened');
                        
                        // Load interior scene
                        game.sceneTimeout(() => {
                            game.loadScene('facility_interior');
                        }, 3000);
                    } else {
                        game.showDialogue([
                            "I need the Flipper Zero to hack this panel."
                        ], "Ryan");
                    }
                }
        },
        {
            id: 'gate',
            name: 'Security Gate',
            // SVG: translate(800,550), gate barrier at y+80, w=220
            x: (830 / 1920) * 100,    // 43.23%
            y: (550 / 1080) * 100,    // 50.93%
            width: (250 / 1920) * 100, // 13.02%
            height: (200 / 1080) * 100, // 18.52%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "The main checkpoint. Barrier gate, control booth.",
                        "Two ways in: through the gate, or not at all."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'comm_tower',
            name: 'Communications Tower',
            // SVG: translate(1700,100), tower h=500
            x: (1650 / 1920) * 100,   // 85.94%
            y: (100 / 1080) * 100,    // 9.26%
            width: (100 / 1920) * 100, // 5.21%
            height: (500 / 1080) * 100, // 46.30%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "Communications tower. Multiple antenna arrays.",
                        "Probably handles encrypted military comms. Maybe drone control signals too."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'warning_sign',
            name: 'Warning Sign',
            // SVG: translate(500,620), sign at y=-60
            x: (440 / 1920) * 100,    // 22.92%
            y: (560 / 1080) * 100,    // 51.85%
            width: (130 / 1920) * 100, // 6.77%
            height: (140 / 1080) * 100, // 12.96%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "'SPERRGEBIET - BETRETEN VERBOTEN'",
                        "Restricted area - entry forbidden. The Germans are very direct."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'military_vehicle',
            name: 'Military Vehicle',
            // SVG: translate(1500,780), w=200, h=95
            x: (1500 / 1920) * 100,   // 78.13%
            y: (780 / 1080) * 100,    // 72.22%
            width: (200 / 1920) * 100, // 10.42%
            height: (115 / 1080) * 100, // 10.65%
            cursor: 'look',
            interactions: {
                look: (game) => {
                    game.showDialogue([
                        "Bundeswehr transport vehicle. Military-grade.",
                        "I'd rather not have to explain myself to whoever drives that."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'exit',
            name: 'Retreat',
            // SVG: Road area at y=850
            x: (680 / 1920) * 100,    // 35.42%
            y: (920 / 1080) * 100,    // 85.19%
            width: (560 / 1920) * 100, // 29.17%
            height: (100 / 1080) * 100, // 9.26%
            cursor: 'exit',
            action: function(game) {
                const state = FacilityScene.state;
                if (state.alarmTriggered) {
                    game.showDialogue([
                        "No time for retreat now - we have to see this through!"
                    ], "Ryan");
                } else {
                    game.showDialogue([
                        "The path back to the van.",
                        "If things go wrong, this is our exit.",
                        "Not yet. We're too close to turn back now."
                    ], "Ryan");
                }
            }
        }
    ],
    
    // Scene entry
    onEnter: (game) => {
        const storyPart = game.gameState.storyPart;
        game.setFlag('visited_facility', true);
        
        if (storyPart === 17 && !game.hasItem('security_badge')) {
            // Part 17: Arrival and badge pickup
            game.showNotification('Arrived at Steckerdoser Heide');
            
            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: '*The facility looms in the darkness*' },
                    { speaker: 'Ryan', text: 'This is real. Military research facility.' },
                    { speaker: 'Ryan', text: 'No turning back now.' },
                    { speaker: 'Ryan', text: 'First: find that badge. Trash bin, north entrance.' },
                    { speaker: 'Ryan', text: 'Stay in shadows. Move carefully.' }
                ]);
            }, 1000);
        } else if (storyPart === 17 && game.hasItem('security_badge')) {
            // Part 17: Badge acquired, guide to next steps
            game.showNotification('Search for weaknesses in security');
        } else {
            // Other parts or default
            game.showNotification('Steckerdoser Heide Facility');
        }
        
        if (!game.questManager.hasQuest('infiltrate_facility')) {
            game.addQuest({
                id: 'infiltrate_facility',
                name: 'Infiltrate Steckerdoser Heide',
                description: "Find Eva's badge, disable security, and access the server room.",
                hint: 'Start by finding the badge at the north entrance trash bin.'
            });
        }
    },
    
    // Scene exit
    onExit: () => {
        // Cleanup
    }
};

// Register scene when script loads
if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(FacilityScene);
}
