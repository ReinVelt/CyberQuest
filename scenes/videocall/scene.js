/**
 * Video Call Scene - Live connection with contacts
 * Interactive video conference interface
 */

const VideocallScene = {
    id: 'videocall',
    name: 'Video Call',
    
    background: 'assets/images/scenes/videocall.svg',
    
    description: 'Secure video conference terminal in the mancave.',
    
    playerStart: { x: 50, y: 85 },
    
    hotspots: [
        {
            id: 'call_henk',
            name: 'Call Dr. Henk Visser',
            x: 6.25,
            y: 18.5,
            width: 25,
            height: 33.3,
            cursor: 'pointer',
            action: (game) => {
                const hasTransmission = game.getFlag('sstv_decoded');
                const visitedFacility = game.getFlag('visited_facility');
                
                if (visitedFacility) {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Dr. Henk Visser...*' },
                        { speaker: '', text: '*Video feed stabilizes - Henk appears with WSRT dishes visible through window behind him*' },
                        { speaker: 'Henk', text: 'Ryan! You made it out safely. I was worried.' },
                        { speaker: 'Ryan', text: 'The facility... Henk, what the hell is Operation Zerfall really about?' },
                        { speaker: 'Henk', text: 'I wish I could tell you more. All I know is it involves classified signal interception.' },
                        { speaker: 'Henk', text: 'Something about using LOFAR and WSRT infrastructure for government surveillance.' },
                        { speaker: 'Ryan', text: 'They had entire server rooms dedicated to this. Military-grade encryption.' },
                        { speaker: 'Henk', text: 'Be careful, Ryan. If they know you\'ve been inside...' },
                        { speaker: 'Ryan', text: 'I know. But I need to understand what they\'re hiding.' },
                        { speaker: 'Henk', text: 'If you need technical analysis of any signals, send them my way. Encrypted channel only.' }
                    ]);
                } else if (hasTransmission) {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Dr. Henk Visser...*' },
                        { speaker: '', text: '*Video feed stabilizes - Henk appears wearing headphones, radio equipment visible*' },
                        { speaker: 'Henk', text: 'Ryan! Good to see you. What\'s on your mind?' },
                        { speaker: 'Ryan', text: 'Henk, I intercepted something strange on 14.23 MHz this morning.' },
                        { speaker: 'Henk', text: 'Amateur band? What kind of signal?' },
                        { speaker: 'Ryan', text: 'SSTV transmission. Military-grade encryption. Coordinates to a facility.' },
                        { speaker: 'Henk', text: '*Leans forward* That\'s... unusual. SSTV is typically for ham radio hobbyists.' },
                        { speaker: 'Henk', text: 'Military using it suggests they\'re hiding in plain sight. Old-school steganography.' },
                        { speaker: 'Ryan', text: 'The coordinates point to something near Westerbork. Any facilities there?' },
                        { speaker: 'Henk', text: 'Besides WSRT? There are some old government buildings from the Cold War era.' },
                        { speaker: 'Henk', text: 'Officially decommissioned. But officially doesn\'t mean much, does it?' },
                        { speaker: 'Ryan', text: 'I might need to investigate in person.' },
                        { speaker: 'Henk', text: 'Be careful. If this is active military intelligence... you could attract attention.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Dr. Henk Visser...*' },
                        { speaker: '', text: '*Video feed stabilizes - Henk appears in his ASTRON office, star charts on wall*' },
                        { speaker: 'Henk', text: 'Ryan! How are the frequencies treating you this morning?' },
                        { speaker: 'Ryan', text: 'Just checking in. Saw the documentary about WSRT and LOFAR yesterday.' },
                        { speaker: 'Henk', text: '*Chuckles* Ah yes, the Dutch wireless legacy piece. They made us look very serious.' },
                        { speaker: 'Henk', text: 'Did you know they interviewed me on location with all fourteen dishes behind me?' },
                        { speaker: 'Henk', text: 'The director wanted "dramatic scientific atmosphere" or something.' },
                        { speaker: 'Ryan', text: 'It worked. Very impressive. Ies was fascinated.' },
                        { speaker: 'Henk', text: 'How are your own radio projects going? Still monitoring satellites?' },
                        { speaker: 'Ryan', text: 'Always. Actually, I should get back to it. Talk soon?' },
                        { speaker: 'Henk', text: 'Anytime, Ryan. You know where to find me - listening to the universe.' }
                    ]);
                }
            }
        },
        {
            id: 'call_marieke',
            name: 'Call Marieke',
            x: 37.5,
            y: 18.5,
            width: 25,
            height: 33.3,
            cursor: 'pointer',
            action: (game) => {
                const hasTransmission = game.getFlag('sstv_decoded');
                const solvedPassword = game.getFlag('facility_password_solved');
                
                if (solvedPassword) {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Marieke...*' },
                        { speaker: '', text: '*Video feed connects - Marieke appears in her home workshop, LOFAR antenna model visible*' },
                        { speaker: 'Marieke', text: 'Ryan! I heard through the grapevine you cracked something big?' },
                        { speaker: 'Ryan', text: 'You could say that. Beam-forming algorithms were the key.' },
                        { speaker: 'Marieke', text: '*Eyes widen* You used LOFAR principles for cryptography? Brilliant!' },
                        { speaker: 'Ryan', text: 'The password was based on your exact antenna configuration. 25 antennas, specific pattern.' },
                        { speaker: 'Marieke', text: 'Someone in intelligence must have worked with us. That\'s not public knowledge.' },
                        { speaker: 'Marieke', text: 'The core station layout... Ryan, that\'s classified infrastructure data.' },
                        { speaker: 'Ryan', text: 'Which means government is deeply involved in whatever this is.' },
                        { speaker: 'Marieke', text: 'What did you find once you got in?' },
                        { speaker: 'Ryan', text: 'Evidence. Lots of it. But I need to analyze it properly.' },
                        { speaker: 'Marieke', text: 'If you need help with signal processing or pattern analysis, I\'m here. Encrypted only.' }
                    ]);
                } else if (hasTransmission) {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Marieke...*' },
                        { speaker: '', text: '*Video feed connects - Marieke in casual clothes, drinking coffee*' },
                        { speaker: 'Marieke', text: 'Ryan! Morning! Well, almost afternoon for me.' },
                        { speaker: 'Ryan', text: 'Marieke, I need to pick your brain about beam-forming patterns.' },
                        { speaker: 'Marieke', text: 'Oh? Working on a LOFAR-related project?' },
                        { speaker: 'Ryan', text: 'Something like that. How many antennas in your core station configuration?' },
                        { speaker: 'Marieke', text: 'The main array? We typically use 25 antenna elements in specific geometric patterns.' },
                        { speaker: 'Marieke', text: 'Each positioned to maximize signal coherence. Why do you ask?' },
                        { speaker: 'Ryan', text: 'Just curious about the math. The spatial correlation algorithms fascinate me.' },
                        { speaker: 'Marieke', text: 'It\'s beautiful mathematics. Phase delays, interference patterns, coherent summation...' },
                        { speaker: 'Marieke', text: 'You can create a synthetic aperture larger than any physical dish could be.' },
                        { speaker: 'Ryan', text: 'Amazing work. Thanks for the insight.' },
                        { speaker: 'Marieke', text: 'Anytime! Call if you need more technical details.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Marieke...*' },
                        { speaker: '', text: '*Video feed connects - Marieke appears relaxed, garden visible through window*' },
                        { speaker: 'Marieke', text: 'Ryan! So good to see your face! How\'s life in Compascuum?' },
                        { speaker: 'Ryan', text: 'Quiet and peaceful. Saw you on that documentary about Drenthe tech.' },
                        { speaker: 'Marieke', text: '*Laughs* Oh that! They made such a big deal about beam-forming.' },
                        { speaker: 'Marieke', text: 'I mean, yes, it\'s important work, but I was just doing my job at LOFAR.' },
                        { speaker: 'Ryan', text: 'Your work ended up in 5G networks worldwide. That\'s impressive.' },
                        { speaker: 'Marieke', text: 'True. Strange to think my signal processing code is running on millions of devices.' },
                        { speaker: 'Marieke', text: 'Never imagined radio astronomy would lead to telecommunications.' },
                        { speaker: 'Ryan', text: 'How\'s retirement treating you?' },
                        { speaker: 'Marieke', text: 'Wonderfully! I still consult occasionally, but mostly I garden and read.' },
                        { speaker: 'Marieke', text: 'Though I do miss the technical challenges sometimes.' },
                        { speaker: 'Ryan', text: 'Well, if I find any interesting signal puzzles, you\'ll be my first call.' },
                        { speaker: 'Marieke', text: '*Smiles* I\'d like that. Stay curious, Ryan!' }
                    ]);
                }
            }
        },
        {
            id: 'call_pieter',
            name: 'Call Pieter',
            x: 68.75,
            y: 18.5,
            width: 25,
            height: 33.3,
            cursor: 'pointer',
            action: (game) => {
                const hasEvidence = game.getFlag('collected_evidence');
                const visitedFacility = game.getFlag('visited_facility');
                
                if (hasEvidence) {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Pieter...*' },
                        { speaker: '', text: '*Video feed connects - Pieter in home office, Bluetooth certification plaques on wall*' },
                        { speaker: 'Pieter', text: 'Ryan. You look stressed. What\'s going on?' },
                        { speaker: 'Ryan', text: 'I need your expertise. Bluetooth protocol analysis - can you help?' },
                        { speaker: 'Pieter', text: 'Of course. What are we looking at?' },
                        { speaker: 'Ryan', text: 'Government surveillance devices. Modified Bluetooth with custom frequency hopping.' },
                        { speaker: 'Pieter', text: '*Serious expression* That\'s... concerning. Send me the packet captures.' },
                        { speaker: 'Ryan', text: 'They\'re using your protocols for mass surveillance. Pieter, this is big.' },
                        { speaker: 'Pieter', text: 'Jesus. I designed Bluetooth for device connectivity, not government spying.' },
                        { speaker: 'Pieter', text: 'But yes, the frequency hopping makes it nearly impossible to jam or intercept.' },
                        { speaker: 'Pieter', text: 'Someone with deep knowledge of the protocol architecture created this.' },
                        { speaker: 'Ryan', text: 'Can you trace the modifications? Find who implemented them?' },
                        { speaker: 'Pieter', text: 'I can try. Give me a few hours to analyze the patterns.' },
                        { speaker: 'Pieter', text: 'Ryan... be careful with this. If they\'re watching Bluetooth traffic...' },
                        { speaker: 'Ryan', text: 'I know. Using encrypted channels only from now on.' }
                    ]);
                } else if (visitedFacility) {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Pieter...*' },
                        { speaker: '', text: '*Video feed connects - Pieter looks concerned*' },
                        { speaker: 'Pieter', text: 'Ryan, are you okay? You look like you\'ve been through something.' },
                        { speaker: 'Ryan', text: 'Long story. Let\'s just say I went somewhere I wasn\'t supposed to be.' },
                        { speaker: 'Pieter', text: 'The facility near Westerbork?' },
                        { speaker: 'Ryan', text: 'How did you—' },
                        { speaker: 'Pieter', text: 'I\'ve heard rumors. Old Ericsson colleagues mentioned government contracts there.' },
                        { speaker: 'Pieter', text: 'Bluetooth-based surveillance systems. I didn\'t want to believe it.' },
                        { speaker: 'Ryan', text: 'It\'s real. And it\'s massive.' },
                        { speaker: 'Pieter', text: 'What are you going to do?' },
                        { speaker: 'Ryan', text: 'Find out who\'s running it. And why.' },
                        { speaker: 'Pieter', text: 'Let me know if you need technical analysis. I know these protocols better than anyone.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Pieter...*' },
                        { speaker: '', text: '*Video feed connects - Pieter in smart home office, multiple screens visible*' },
                        { speaker: 'Pieter', text: 'Ryan! Good timing - I just saw your message from last week.' },
                        { speaker: 'Ryan', text: 'No worries. Just wanted to say the documentary was great.' },
                        { speaker: 'Pieter', text: 'Thanks! Fifteen years of Bluetooth work condensed into five minutes.' },
                        { speaker: 'Pieter', text: 'They didn\'t even mention the hardest parts - the security layers, the pairing protocols...' },
                        { speaker: 'Ryan', text: 'The frequency-hopping spread spectrum was impressive enough.' },
                        { speaker: 'Pieter', text: 'Ah yes! 1600 hops per second across 79 channels. Beautiful engineering.' },
                        { speaker: 'Pieter', text: 'Learned a lot from LOFAR\'s signal processing work, actually.' },
                        { speaker: 'Pieter', text: 'Marieke\'s algorithms inspired some of our interference mitigation.' },
                        { speaker: 'Ryan', text: 'It\'s amazing how connected all this tech is.' },
                        { speaker: 'Pieter', text: 'Absolutely. We all built on each other\'s work. That\'s how innovation happens.' },
                        { speaker: 'Ryan', text: 'Well, thanks for the chat. I\'ll let you get back to it.' },
                        { speaker: 'Pieter', text: 'Anytime, Ryan. Keep hacking the good hack!' }
                    ]);
                }
            }
        },
        {
            id: 'exit_videocall',
            name: 'End Call',
            x: 83.3,
            y: 81.5,
            width: 8.3,
            height: 5.6,
            cursor: 'pointer',
            targetScene: 'mancave'
        }
    ],
    
    onEnter: (game) => {
        // Welcome message
        if (!game.getFlag('visited_videocall')) {
            game.setFlag('visited_videocall', true);
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Secure video conference terminal. I can call my technical contacts from here.' },
                    { speaker: '', text: '*Three video slots available: Henk, Marieke, and Pieter*' },
                    { speaker: 'Ryan', text: 'End-to-end encrypted. No one can intercept these calls.' },
                    { speaker: 'Ryan', text: 'Mom and my father-in-law call me sometimes too, but on the regular phone.' }
                ]);
            }, 500);
        }
    },
    
    onExit: () => {
        // Nothing to clean up
    }
};

// Register scene
if (typeof window.game !== 'undefined') {
    window.game.registerScene(VideocallScene);
}
