/**
 * Living Room Scene - Ryan's home, where Ies watches TV
 */

const LivingroomScene = {
    id: 'livingroom',
    name: 'Living Room',
    
    background: 'assets/images/scenes/livingroom.svg',
    
    description: 'A cozy living room with a TV showing a documentary.',
    
    playerStart: { x: 50, y: 70 },
    
    hotspots: [
        {
            id: 'tv',
            name: 'Watch TV',
            x: 45,
            y: 17,
            width: 30,
            height: 38,
            cursor: 'pointer',
            action: (game) => {
                if (!game.getFlag('saw_tv_documentary')) {
                    game.setFlag('saw_tv_documentary', true);
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The TV is showing a documentary about Drenthe\'s wireless pioneers.' },
                        { speaker: '', text: '*"Drenthe: The Unexpected Tech Hub"*' },
                        { speaker: 'Ryan', text: 'WSRT, LOFAR, and Bluetooth... might be worth watching.' }
                    ]);
                    setTimeout(() => {
                        game.loadScene('tvdocumentary');
                    }, 2000);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The documentary is playing. Should I watch it again?' }
                    ]);
                    setTimeout(() => {
                        game.loadScene('tvdocumentary');
                    }, 1500);
                }
            }
        },
        {
            id: 'ies',
            x: 12,
            y: 48,
            width: 15,
            height: 20,
            cursor: 'pointer',
            action: (game) => {
                if (!game.getFlag('talked_to_ies')) {
                    game.setFlag('talked_to_ies', true);
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Hey Ies, watching documentaries again?' },
                        { speaker: 'Ies', text: 'Ryan! This one is fascinating - it\'s about Drenthe\'s wireless technology pioneers.' },
                        { speaker: 'Ies', text: 'They\'re featuring WSRT, LOFAR, and the Ericsson Bluetooth engineers.' },
                        { speaker: 'Ryan', text: 'Wait, LOFAR and WSRT? Those are serious radio astronomy projects.' },
                        { speaker: 'Ies', text: 'They interviewed actual engineers! A Dr. David Prinsloo from TU Eindhoven...' },
                        { speaker: 'Ies', text: 'A man named Cees Bassa who works with LOFAR and satellite tracking...' },
                        { speaker: 'Ies', text: 'And Jaap Haartsen who invented Bluetooth at Ericsson!' },
                        { speaker: 'Ryan', text: '...Those are my contacts. David, Cees, and Jaap.' },
                        { speaker: 'Ies', text: 'Really? Your hacker friends are famous engineers? That\'s amazing!' },
                        { speaker: 'Ryan', text: 'They\'re more than friends. They\'re the best signal processing minds in the Netherlands.' },
                        { speaker: 'Ies', text: 'You should watch it! The dogs are keeping me company if you want to go to your mancave.' },
                        { speaker: 'Ryan', text: 'I might watch it later. Got some radio work to check first.' }
                    ]);
                } else {
                    const watchedDoc = game.getFlag('tv_documentary_watched');
                    if (watchedDoc) {
                        game.startDialogue([
                            { speaker: 'Ies', text: 'So, did you watch the whole documentary?' },
                            { speaker: 'Ryan', text: 'Yeah, it was incredible. David Prinsloo, Cees Bassa, and Jaap Haartsen are true pioneers.' },
                            { speaker: 'Ies', text: 'I told you it was good! They made Drenthe famous for wireless tech.' },
                            { speaker: 'Ryan', text: 'It definitely gave me a new appreciation for their work.' }
                        ]);
                    } else {
                        game.startDialogue([
                            { speaker: 'Ies', text: 'The documentary is really well done! You should watch the whole thing.' },
                            { speaker: 'Ies', text: 'I had no idea wireless technology from Drenthe was so important globally!' },
                            { speaker: 'Ryan', text: 'Yeah, we\'ve got some brilliant people here. Maybe I should watch it.' }
                        ]);
                    }
                }
            }
        },
        {
            id: 'couch_dogs',
            x: 73,
            y: 48,
            width: 18,
            height: 22,
            cursor: 'pointer',
            action: (game) => {
                const responses = [
                    [
                        { speaker: 'Ryan', text: 'Hey Kino and Kessy! Sleeping well?' },
                        { speaker: '', text: '*Both dogs are curled up, peaceful and content*' },
                        { speaker: '', text: '*Tino yawns softly without opening his eyes*' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'You two are spoiled, you know that?' },
                        { speaker: '', text: '*Kessy shifts slightly in her sleep*' },
                        { speaker: '', text: '*Perfect spots on the couch, as always*' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'Sound asleep, both of them.' },
                        { speaker: '', text: '*Tino\'s ear twitches at Ryan\'s voice but he stays asleep*' },
                        { speaker: 'Ies', text: 'They\'ve been napping all afternoon!' }
                    ]
                ];
                
                const responseIndex = (game.getFlag('dog_interactions') || 0) % responses.length;
                game.setFlag('dog_interactions', (game.getFlag('dog_interactions') || 0) + 1);
                game.startDialogue(responses[responseIndex]);
            }
        },
        {
            id: 'pug',
            x: 30,
            y: 72,
            width: 30,
            height: 12,
            cursor: 'pointer',
            action: (game) => {
                const responses = [
                    [
                        { speaker: 'Ryan', text: 'ET! Come here little guy!' },
                        { speaker: '', text: '*The pug waddles over, tongue hanging out*' },
                        { speaker: 'Ryan', text: 'Such a good boy!' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'Still walking around, ET?' },
                        { speaker: '', text: '*Snort snort* The pug is on patrol!' },
                        { speaker: 'Ies', text: 'He never stops exploring!' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'Why don\'t you join Tino and Kessy on the couch?' },
                        { speaker: '', text: '*The pug looks at the couch, then continues walking*' },
                        { speaker: 'Ryan', text: 'Too busy, I see.' }
                    ],
                    [
                        { speaker: '', text: '*ET snuffles around the coffee table*' },
                        { speaker: 'Ryan', text: 'Looking for snacks? There are none here!' },
                        { speaker: '', text: '*The pug gives Ryan a disappointed look*' }
                    ]
                ];
                
                const responseIndex = (game.getFlag('pug_interactions') || 0) % responses.length;
                game.setFlag('pug_interactions', (game.getFlag('pug_interactions') || 0) + 1);
                game.startDialogue(responses[responseIndex]);
            }
        },
        {
            id: 'to_home',
            name: 'Door to Kitchen',
            x: 0.5,
            y: 45,
            width: 11,
            height: 32,
            cursor: 'pointer',
            targetScene: 'home'
        }
    ],
    
    onEnter: (game) => {
        // Remove any existing NPC characters from previous visits (preserve player character)
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            const npcCharacters = charactersContainer.querySelectorAll('.npc-character');
            npcCharacters.forEach(npc => npc.remove());
        }
        
        // Add Ies sitting on armchair watching TV (smaller than Ryan - 14% scale)
        setTimeout(() => {
            game.showCharacter('ies', 15, 62, 0.14);
        }, 100);
        
        // Add two white dogs on the couch (smaller - 13% scale)
        setTimeout(() => {
            game.showCharacter('dog_white', 75, 52, 0.13);
            game.showCharacter('dog_white', 85, 52, 0.13);
        }, 200);
        
        // Add pug on the floor (smallest - 11% scale, will walk around via CSS)
        setTimeout(() => {
            game.showCharacter('pug', 30, 75, 0.11);
        }, 300);
        
        // Welcome message
        if (!game.getFlag('visited_livingroom')) {
            game.setFlag('visited_livingroom', true);
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The living room. Ies is watching TV.' },
                    { speaker: '', text: '*On screen: "Drenthe: The Unexpected Tech Hub" - Documentary*' },
                    { speaker: '', text: '*Tino and Kessy are sleeping peacefully on the couch*' },
                    { speaker: '', text: '*ET the pug waddles around exploring*' },
                    { speaker: 'Ryan', text: 'That documentary looks interesting... wireless technology from Drenthe?' },
                    { speaker: 'Ryan', text: 'I should watch this before heading to the mancave. Might learn something.' }
                ]);
            }, 500);
        } else if (game.getFlag('documentary_completed_once') && !game.getFlag('post_documentary_reminder_shown')) {
            game.setFlag('post_documentary_reminder_shown', true);
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Okay, documentary watched. Time to get to work in the mancave.' },
                    { speaker: 'Ies', text: 'Told you it was good! Your friends are amazing.' },
                    { speaker: 'Ryan', text: 'Yeah... it gives me new perspective on the signals I work with.' }
                ]);
            }, 500);
        }
    },
    
    onExit: () => {
        // Remove NPC character elements (preserve player character)
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            const npcCharacters = charactersContainer.querySelectorAll('.npc-character');
            npcCharacters.forEach(npc => npc.remove());
        }
    }
};
