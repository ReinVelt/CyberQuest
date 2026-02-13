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
            x: 55,
            y: 30,
            width: 20,
            height: 25,
            cursor: 'pointer',
            action: (game) => {
                if (!game.getFlag('tv_watched')) {
                    game.setFlag('tv_watched', true);
                    game.startDialogue([
                        { speaker: 'TV Narrator', text: '🎬 "Drenthe: The Unexpected Tech Hub" - A Documentary' },
                        { speaker: 'TV Narrator', text: 'From the quiet heathlands of northern Netherlands came wireless innovations that changed the world.' },
                        { speaker: '', text: '═══════════════════════════════════════════' },
                        
                        // WSRT Segment
                        { speaker: 'TV Narrator', text: '📡 CHAPTER 1: WESTERBORK SYNTHESIS RADIO TELESCOPE' },
                        { speaker: '', text: '*Documentary shows fourteen massive dish antennas across Drenthe heathland*' },
                        { speaker: 'TV Narrator', text: 'Since 1970, the Westerbork Synthesis Radio Telescope has listened to the cosmos.' },
                        { speaker: 'TV Narrator', text: 'Fourteen 25-meter dishes working in perfect synchronization, forming a single massive telescope.' },
                        { speaker: 'Dr. Henk Visser', text: 'What makes WSRT special is the synthesis imaging technique - combining signals from multiple dishes.' },
                        { speaker: '', text: '*Dr. Henk Visser, ASTRON Radio Astronomer, appears on screen*' },
                        { speaker: 'Dr. Henk Visser', text: 'We detect pulsars, map distant galaxies, and study cosmic phenomena no single telescope could see.' },
                        { speaker: 'TV Narrator', text: 'Dr. Visser\'s team developed advanced signal processing algorithms that influenced modern wireless tech.' },
                        { speaker: '', text: '' },
                        
                        // LOFAR Segment
                        { speaker: 'TV Narrator', text: '🌐 CHAPTER 2: LOFAR - THE LOW-FREQUENCY ARRAY' },
                        { speaker: '', text: '*Documentary shows thousands of simple antennas spread across Europe*' },
                        { speaker: 'TV Narrator', text: 'LOFAR represents a revolutionary approach: thousands of simple antennas instead of giant dishes.' },
                        { speaker: 'TV Narrator', text: 'Over 50,000 antennas across Europe, with its core in Drenthe, detecting the universe\'s lowest frequencies.' },
                        { speaker: 'Marieke', text: 'The magic is in the software - beam-forming algorithms that make the array act as one giant telescope.' },
                        { speaker: '', text: '*Marieke, Retired LOFAR Technician, explains the technology*' },
                        { speaker: 'Marieke', text: 'I worked on the digital signal processing. Each antenna sends data to supercomputers that combine it in real-time.' },
                        { speaker: 'Marieke', text: 'The same beam-forming principles are now used in 5G networks and modern WiFi systems.' },
                        { speaker: 'TV Narrator', text: 'LOFAR detects signals from the early universe, but also monitors space weather and studies solar storms.' },
                        { speaker: '', text: '' },
                        
                        // Bluetooth Segment  
                        { speaker: 'TV Narrator', text: '📱 CHAPTER 3: BLUETOOTH - CONNECTING THE WORLD' },
                        { speaker: '', text: '*Documentary shows the evolution of wireless communication*' },
                        { speaker: 'TV Narrator', text: 'In the 1990s, Ericsson established a major Bluetooth research center in the Netherlands.' },
                        { speaker: 'Pieter', text: 'We were tasked with creating a universal short-range wireless standard.' },
                        { speaker: '', text: '*Pieter, Former Ericsson Bluetooth Engineer, shares his experience*' },
                        { speaker: 'Pieter', text: 'Fifteen years developing protocols that now connect billions of devices - phones, cars, headphones, IoT.' },
                        { speaker: 'Pieter', text: 'The challenge was balancing power efficiency, security, and compatibility across manufacturers.' },
                        { speaker: 'TV Narrator', text: 'Dutch engineers pioneered frequency-hopping spread spectrum techniques that made Bluetooth robust.' },
                        { speaker: 'Pieter', text: 'We learned from LOFAR\'s signal processing and WSRT\'s interference mitigation strategies.' },
                        { speaker: 'TV Narrator', text: 'Today, Bluetooth connects over 5 billion devices annually - a protocol born in Dutch innovation.' },
                        { speaker: '', text: '' },
                        
                        // Conclusion
                        { speaker: 'TV Narrator', text: '🌟 EPILOGUE: THE DRENTHE LEGACY' },
                        { speaker: 'TV Narrator', text: 'From radio telescopes listening to distant galaxies to protocols connecting everyday devices...' },
                        { speaker: 'TV Narrator', text: 'Drenthe\'s quiet countryside became an unlikely birthplace of wireless innovation.' },
                        { speaker: 'TV Narrator', text: 'Dr. Henk Visser, Marieke, and Pieter represent a generation of engineers who shaped modern connectivity.' },
                        { speaker: 'TV Narrator', text: 'Their work reminds us: sometimes the most profound technologies emerge from unexpected places.' },
                        { speaker: '', text: '═══════════════════════════════════════════' },
                        { speaker: 'Ies', text: 'Incredible! I had no idea Ryan knew these people. He should really watch this.' },
                        { speaker: 'Ryan', text: 'Wait... Marieke, Henk, Pieter? Those are my contacts!' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'TV Narrator', text: 'Now showing: "The Future of Radio Astronomy" - Exploring next-generation telescope arrays...' },
                        { speaker: 'Ies', text: 'Still an amazing documentary. You should watch the whole thing, Ryan!' }
                    ]);
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
                        { speaker: 'Ies', text: 'They interviewed actual engineers! A Dr. Henk Visser from ASTRON...' },
                        { speaker: 'Ies', text: 'A woman named Marieke who worked on LOFAR beam-forming...' },
                        { speaker: 'Ies', text: 'And a Pieter who developed Bluetooth protocols at Ericsson!' },
                        { speaker: 'Ryan', text: '...Those are my contacts. Henk, Marieke, and Pieter.' },
                        { speaker: 'Ies', text: 'Really? Your hacker friends are famous engineers? That\'s amazing!' },
                        { speaker: 'Ryan', text: 'They\'re more than friends. They\'re the best signal processing minds in the Netherlands.' },
                        { speaker: 'Ies', text: 'You should watch it! The dogs are keeping me company if you want to go to your mancave.' },
                        { speaker: 'Ryan', text: 'I might watch it later. Got some radio work to check first.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ies', text: 'The documentary is really well done! You should watch the whole thing.' },
                        { speaker: 'Ies', text: 'I had no idea wireless technology from Drenthe was so important globally!' },
                        { speaker: 'Ryan', text: 'Yeah, we\'ve got some brilliant people here. I\'ll watch it later.' }
                    ]);
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
                        { speaker: 'Ryan', text: 'Hey Tino and Kessy! Sleeping well?' },
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
            x: 1,
            y: 48,
            width: 9,
            height: 27,
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
        
        // Add Ies sitting on armchair watching TV (smaller than Ryan)
        setTimeout(() => {
            game.showCharacter('ies', 15, 62, 0.18);
        }, 100);
        
        // Add two white dogs on the couch (1/3 size)
        setTimeout(() => {
            game.showCharacter('dog_white', 75, 52, 0.16);
            game.showCharacter('dog_white', 85, 52, 0.16);
        }, 200);
        
        // Add pug on the floor (1/3 size, will walk around via CSS)
        setTimeout(() => {
            game.showCharacter('pug', 30, 75, 0.13);
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
                    { speaker: 'Ryan', text: 'Peaceful scene. Maybe I should check what they\'re showing...' }
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
