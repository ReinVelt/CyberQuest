/**
 * Scene: Garden
 * The view behind Ryan's house - wind turbines, German border, antenna
 */

const GardenScene = {
    id: 'garden',
    name: 'Garden - Backyard',
    
    background: 'assets/images/scenes/garden.svg',
    
    // Player starting position
    playerStart: { x: 50, y: 85 },
    
    // Random idle thoughts for this scene
    idleThoughts: [
        "Fresh air... nice.",
        "Those turbines are hypnotic.",
        "Germany's just over there.",
        "Antenna picking up weird stuff.",
        "Should maintain this more.",
        "Beautiful evening... espionage aside.",
        "Wind patterns tell their own story.",
        "Birds don't care about borders.",
        "That Volvo's seen some adventures.",
        "Garden therapy. Works every time.",
        "Clouds moving fast tonight.",
        "Rural life suits me fine.",
        "Clean air, clear signals.",
        "This antenna array is my pride.",
        "Nature and technology coexist.",
        "Every direction has a view.",
        "Crickets and RF noise.",
        "Could use some weeding.",
        "Peaceful. For now.",
        "This is why I moved here."
    ],
    
    hotspots: [
        {
            id: 'wind-turbines',
            name: 'Wind Turbines',
            // SVG: Three turbines at translate(800,200), (950,180), (1100,220)
            // Spans: x=795 to 1106 (~311px), y=100 to 460 (~360px)
            x: (795 / 1920) * 100,    // 41.41%
            y: (100 / 1080) * 100,    // 9.26%
            width: (311 / 1920) * 100, // 16.20%
            height: (360 / 1080) * 100, // 33.33%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: '16 wind turbines, 500 meters away. On the German border.' },
                    { speaker: 'Ryan', text: 'Red lights flicker at night. Some find it annoying.' },
                    { speaker: 'Ryan', text: 'I find it calming. Reminds me the world keeps moving.' },
                    { speaker: 'Ryan', text: 'Steckerdoser Heide facility... not far from here.' }
                ]);
            }
        },
        {
            id: 'antenna',
            name: 'Large Antenna',
            // SVG: house at translate(50,300), antenna at translate(100,-20)
            // Yagi at x=-60, y=-140, w=120; mast goes to y=-150
            // Actual: x=50+100-60=90, y=300-20-150=130, w=120, h=150
            x: (90 / 1920) * 100,     // 4.69%
            y: (130 / 1080) * 100,    // 12.04%
            width: (120 / 1920) * 100, // 6.25%
            height: (150 / 1080) * 100, // 13.89%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My antenna array. For amateur radio.' },
                    { speaker: 'Ryan', text: 'Picks up signals from far away. VHF, UHF, satellites.' },
                    { speaker: 'Ryan', text: 'Neighbors think I\'m crazy. They\'re not wrong.' }
                ]);
            }
        },
        {
            id: 'flower-beds',
            name: 'Flower Beds',
            // SVG: Left bed at translate(450,500), Right at translate(750,520)
            // Left: ellipse rx=100 → x=450-20=430; Right: extends to 750+200=950
            // Combined: x=430, y=460, w=520, h=110
            x: (430 / 1920) * 100,    // 22.40%
            y: (460 / 1080) * 100,    // 42.59%
            width: (520 / 1920) * 100, // 27.08%
            height: (110 / 1080) * 100, // 10.19%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'I keep some flowers growing. Adds color.' },
                    { speaker: 'Ryan', text: 'Low-maintenance stuff. I\'m a hacker, not a gardener.' }
                ]);
            }
        },
        {
            id: 'landscape',
            name: 'View of Acres',
            // SVG: Distant grass y=400-500, width=1920
            x: (420 / 1920) * 100,    // 21.88%
            y: (370 / 1080) * 100,    // 34.26%
            width: (1100 / 1920) * 100, // 57.29%
            height: (110 / 1080) * 100, // 10.19%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Endless flat Drenthe. Acres to the horizon.' },
                    { speaker: 'Ryan', text: 'Germany in the distance. Fields, farms, turbines.' },
                    { speaker: 'Ryan', text: 'Quiet. Peaceful. Nothing ever happens here.' },
                    { speaker: 'Ryan', text: 'Or so I thought...' }
                ]);
            }
        },
        {
            id: 'shed',
            name: 'Garden Shed',
            // SVG: translate(1500,400), roof at y=-20, base h=180
            // Actual: x=1500, y=380, w=200, h=250
            x: (1500 / 1920) * 100,   // 78.13%
            y: (380 / 1080) * 100,    // 35.19%
            width: (200 / 1920) * 100, // 10.42%
            height: (250 / 1080) * 100, // 23.15%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The garden shed. Full of tools I never use.' },
                    { speaker: 'Ryan', text: 'And probably a few spiders.' }
                ]);
            }
        },
        {
            id: 'bench',
            name: 'Garden Bench',
            // SVG: translate(1000,580), w=150, h=80
            x: (1000 / 1920) * 100,   // 52.08%
            y: (580 / 1080) * 100,    // 53.70%
            width: (150 / 1920) * 100, // 7.81%
            height: (80 / 1080) * 100, // 7.41%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A nice spot to sit and think.' },
                    { speaker: 'Ryan', text: 'Or debug code on my laptop.' }
                ]);
            }
        },
        {
            id: 'tree',
            name: 'Large Tree',
            // SVG: translate(1700,300), trunk at x=-20, canopy rx=120, ry=100
            // Actual: x=1580, y=200, w=240, h=350
            x: (1580 / 1920) * 100,   // 82.29%
            y: (200 / 1080) * 100,    // 18.52%
            width: (240 / 1920) * 100, // 12.50%
            height: (350 / 1080) * 100, // 32.41%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A big old oak tree. Been here longer than the house.' }
                ]);
            }
        },
        {
            id: 'house-back',
            name: 'Farmhouse Back',
            // SVG: translate(50,300), roof from y=-30 to y=100, house to y=350
            // Actual: x=50, y=270, w=350, h=280
            x: (50 / 1920) * 100,     // 2.60%
            y: (270 / 1080) * 100,    // 25.00%
            width: (350 / 1920) * 100, // 18.23%
            height: (280 / 1080) * 100, // 25.93%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Home sweet home. An old Dutch farmhouse.' },
                    { speaker: 'Ryan', text: 'Thick walls, good insulation... and plenty of space for antennas.' }
                ]);
            }
        },
        {
            id: 'door-house',
            name: 'Back Door to House',
            // SVG: house at translate(50,300), door at translate(250,150)
            // Actual: x=50+250=300, y=300+150=450, w=80, h=200
            x: (300 / 1920) * 100,    // 15.63%
            y: (450 / 1080) * 100,    // 41.67%
            width: (80 / 1920) * 100,  // 4.17%
            height: (200 / 1080) * 100, // 18.52%
            cursor: 'pointer',
            targetScene: 'home'
        },
        {
            id: 'volvo',
            name: 'Old Volvo',
            // SVG: Parked near the shed on right side
            x: 78,
            y: 55,
            width: 10,
            height: 15,
            cursor: 'pointer',
            action: function(game) {
                // Part 17: Drive to facility for infiltration
                if (game.questManager.hasQuest('infiltrate_facility') && !game.getFlag('drove_to_facility')) {
                    game.setFlag('drove_to_facility', true);
                    game.startDialogue([
                        { speaker: 'Ryan', text: '11 PM. Time to go.' },
                        { speaker: 'Ryan', text: 'Flipper Zero - check. Tools - check. Meshtastic - check.' },
                        { speaker: 'Ryan', text: 'Eva is waiting. Let\'s do this.' }
                    ]);
                    
                    setTimeout(() => {
                        game.setFlag('driving_destination', 'facility');
                        game.loadScene('driving');
                    }, 3000);
                    return;
                }
                
                // Part 7: Drive to Klooster
                if (game.getFlag('klooster_unlocked')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My old Volvo. Reliable, anonymous, untraceable.' },
                        { speaker: 'Ryan', text: 'Ter Apel is 20 minutes from here. Time to go.' }
                    ]);
                    
                    setTimeout(() => {
                        console.log('Garden: Setting driving_destination to klooster');
                        game.setFlag('driving_destination', 'klooster');
                        console.log('Garden: Loading driving scene');
                        game.loadScene('driving');
                    }, 2000);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My old Volvo. Parked behind the shed.' },
                        { speaker: 'Ryan', text: 'No reason to go anywhere right now.' }
                    ]);
                }
            }
        }
    ],
    
    onEnter: function(game) {
        document.getElementById('scene-background').className = 'scene-garden';
        
        if (!game.getFlag('visited_garden')) {
            game.setFlag('visited_garden', true);
            game.startDialogue([
                { speaker: '', text: 'The garden. View of the Dutch-German border.' },
                { speaker: 'Ryan', text: 'Fresh air. Almost want to go for a walk.' },
                { speaker: 'Ryan', text: 'Almost.' }
            ]);
        }
    }
};

// Register scene when loaded
if (window.game) {
    window.game.registerScene('garden', GardenScene);
}

if (typeof module !== 'undefined') {
    module.exports = GardenScene;
}
