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
            id: 'call_david',
            name: 'Call Dr. David Prinsloo',
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
                        { speaker: '', text: '📹 *Connecting to Dr. David Prinsloo...*' },
                        { speaker: '', text: '*Video feed stabilizes - David appears in his TU Eindhoven lab with antenna arrays behind him*' },
                        { speaker: 'Dr. David Prinsloo', text: 'Ryan! You made it out safely. I was worried.' },
                        { speaker: 'Ryan', text: 'The facility... David, what the hell is Operation Zerfall really about?' },
                        { speaker: 'David Prinsloo', text: 'I wish I could tell you more. All I know is it involves classified signal interception.' },
                        { speaker: 'David Prinsloo', text: 'Something about using LOFAR and WSRT infrastructure for government surveillance.' },
                        { speaker: 'Ryan', text: 'They had entire server rooms dedicated to this. Military-grade encryption.' },
                        { speaker: 'David Prinsloo', text: 'Be careful, Ryan. If they know you\'ve been inside...' },
                        { speaker: 'Ryan', text: 'I know. But I need to understand what they\'re hiding.' },
                        { speaker: 'David Prinsloo', text: 'If you need technical analysis of any signals, send them my way. Encrypted channel only.' }
                    ]);
                } else if (hasTransmission) {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Dr. David Prinsloo...*' },
                        { speaker: '', text: '*Video feed stabilizes - David appears at his TU/e workstation*' },
                        { speaker: 'Dr. David Prinsloo', text: 'Ryan! Good to see you. What\'s on your mind?' },
                        { speaker: 'Ryan', text: 'David, I intercepted something strange on 14.23 MHz this morning.' },
                        { speaker: 'David Prinsloo', text: 'Amateur band? What kind of signal?' },
                        { speaker: 'Ryan', text: 'SSTV transmission. Military-grade encryption. Coordinates to a facility.' },
                        { speaker: 'David Prinsloo', text: '*Leans forward* That\'s... unusual. SSTV is typically for ham radio hobbyists.' },
                        { speaker: 'David Prinsloo', text: 'Military using it suggests they\'re hiding in plain sight. Old-school steganography.' },
                        { speaker: 'Ryan', text: 'The coordinates point to something near Westerbork. Any facilities there?' },
                        { speaker: 'David Prinsloo', text: 'Besides WSRT? There are some old government buildings from the Cold War era.' },
                        { speaker: 'David Prinsloo', text: 'Officially decommissioned. But officially doesn\'t mean much, does it?' },
                        { speaker: 'Ryan', text: 'I might need to investigate in person.' },
                        { speaker: 'David Prinsloo', text: 'Be careful. If this is active military intelligence... you could attract attention.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Dr. David Prinsloo...*' },
                        { speaker: '', text: '*Video feed stabilizes - David in his TU Eindhoven lab. Phased array antenna diagrams on wall behind him*' },
                        { speaker: 'Dr. David Prinsloo', text: 'Ryan! How are the frequencies treating you this morning?' },
                        { speaker: 'Ryan', text: 'Just checking in. Saw the documentary about antenna technology and LOFAR yesterday.' },
                        { speaker: 'David Prinsloo', text: '*Chuckles* Ah yes, the Dutch wireless legacy piece. They made us look very serious.' },
                        { speaker: 'David Prinsloo', text: 'Did you know they filmed me in our antenna testing lab with prototype arrays behind me?' },
                        { speaker: 'David Prinsloo', text: 'The director wanted "dramatic scientific atmosphere" or something.' },
                        { speaker: 'Ryan', text: 'It worked. Very impressive. Ies was fascinated.' },
                        { speaker: 'David Prinsloo', text: 'How are your own radio projects going? Still monitoring satellites?' },
                        { speaker: 'Ryan', text: 'Always. Actually, I should get back to it. Talk soon?' },
                        { speaker: 'David Prinsloo', text: 'Anytime, Ryan. You know where to find me - listening to the universe.' }
                    ]);
                }
            }
        },
        {
            id: 'call_cees',
            name: 'Call Cees Bassa',
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
                        { speaker: '', text: '📹 *Connecting to Cees Bassa...*' },
                        { speaker: '', text: '*Video feed connects - Cees appears with a miniature LOFAR antenna model on his desk*' },
                        { speaker: 'Cees Bassa', text: 'Ryan! I heard through the grapevine you cracked something big?' },
                        { speaker: 'Ryan', text: 'You could say that. Beam-forming algorithms were the key.' },
                        { speaker: 'Cees Bassa', text: '*Eyes widen* You used LOFAR principles for cryptography? Brilliant!' },
                        { speaker: 'Ryan', text: 'The password was based on your exact antenna configuration. 25 antennas, specific pattern.' },
                        { speaker: 'Cees Bassa', text: 'Someone in intelligence must have worked with us. That\'s not public knowledge.' },
                        { speaker: 'Cees Bassa', text: 'The core station layout... Ryan, that\'s classified infrastructure data.' },
                        { speaker: 'Ryan', text: 'Which means government is deeply involved in whatever this is.' },
                        { speaker: 'Cees Bassa', text: 'What did you find once you got in?' },
                        { speaker: 'Ryan', text: 'Evidence. Lots of it. But I need to analyze it properly.' },
                        { speaker: 'Cees Bassa', text: 'If you need help with signal processing or pattern analysis, I\'m here. Encrypted only.' }
                    ]);
                } else if (hasTransmission) {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Cees Bassa...*' },
                        { speaker: '', text: '*Video feed connects - Cees appears drinking coffee*' },
                        { speaker: 'Cees Bassa', text: 'Ryan! Morning! Well, almost afternoon for me.' },
                        { speaker: 'Ryan', text: 'Cees, I need to pick your brain about beam-forming patterns.' },
                        { speaker: 'Cees Bassa', text: 'Oh? Working on a LOFAR-related project?' },
                        { speaker: 'Ryan', text: 'Something like that. How many antennas in your core station configuration?' },
                        { speaker: 'Cees Bassa', text: 'The main array? We typically use 25 antenna elements in specific geometric patterns.' },
                        { speaker: 'Cees Bassa', text: 'Each positioned to maximize signal coherence. Why do you ask?' },
                        { speaker: 'Ryan', text: 'Just curious about the math. The spatial correlation algorithms fascinate me.' },
                        { speaker: 'Cees Bassa', text: 'It\'s beautiful mathematics. Phase delays, interference patterns, coherent summation...' },
                        { speaker: 'Cees Bassa', text: 'You can create a synthetic aperture larger than any physical dish could be.' },
                        { speaker: 'Ryan', text: 'Amazing work. Thanks for the insight.' },
                        { speaker: 'Cees Bassa', text: 'Anytime! Call if you need more technical details.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Cees Bassa...*' },
                        { speaker: '', text: '*Video feed connects - Cees appears relaxed in his home office, garden visible through window behind him*' },
                        { speaker: 'Cees Bassa', text: 'Ryan! So good to see your face! How\'s life in Compascuum?' },
                        { speaker: 'Ryan', text: 'Quiet and peaceful. Saw you on that documentary about Drenthe tech.' },
                        { speaker: 'Cees Bassa', text: '*Laughs* Oh that! They made such a big deal about beam-forming.' },
                        { speaker: 'Cees Bassa', text: 'I mean, yes, it\'s important work, but I was just doing my job at LOFAR.' },
                        { speaker: 'Ryan', text: 'Your work ended up in 5G networks worldwide. That\'s impressive.' },
                        { speaker: 'Cees Bassa', text: 'True. Strange to think my signal processing code is running on millions of devices.' },
                        { speaker: 'Cees Bassa', text: 'Never imagined radio astronomy would lead to telecommunications.' },
                        { speaker: 'Ryan', text: 'How\'s retirement treating you?' },
                        { speaker: 'Cees Bassa', text: 'Wonderfully! I still consult occasionally, but mostly I garden and read.' },
                        { speaker: 'Cees Bassa', text: 'Though I do miss the technical challenges sometimes.' },
                        { speaker: 'Ryan', text: 'Well, if I find any interesting signal puzzles, you\'ll be my first call.' },
                        { speaker: 'Cees Bassa', text: '*Smiles* I\'d like that. Stay curious, Ryan!' }
                    ]);
                }
            }
        },
        {
            id: 'call_jaap',
            name: 'Call Jaap Haartsen',
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
                        { speaker: '', text: '📹 *Connecting to Jaap Haartsen...*' },
                        { speaker: '', text: '*Video feed connects - Jaap Haartsen in home office, Bluetooth certification plaques on wall*' },
                        { speaker: 'Jaap Haartsen', text: 'Ryan. You look stressed. What\'s going on?' },
                        { speaker: 'Ryan', text: 'I need your expertise. Bluetooth protocol analysis - can you help?' },
                        { speaker: 'Jaap Haartsen', text: 'Of course. What are we looking at?' },
                        { speaker: 'Ryan', text: 'Government surveillance devices. Modified Bluetooth with custom frequency hopping.' },
                        { speaker: 'Jaap Haartsen', text: '*Serious expression* That\'s... concerning. Send me the packet captures.' },
                        { speaker: 'Ryan', text: 'They\'re using your protocols for mass surveillance. Jaap, this is big.' },
                        { speaker: 'Jaap Haartsen', text: 'Jesus. I designed Bluetooth for device connectivity, not government spying.' },
                        { speaker: 'Jaap Haartsen', text: 'But yes, the frequency hopping makes it nearly impossible to jam or intercept.' },
                        { speaker: 'Jaap Haartsen', text: 'Someone with deep knowledge of the protocol architecture created this.' },
                        { speaker: 'Ryan', text: 'Can you trace the modifications? Find who implemented them?' },
                        { speaker: 'Jaap Haartsen', text: 'I can try. Give me a few hours to analyze the patterns.' },
                        { speaker: 'Jaap Haartsen', text: 'Ryan... be careful with this. If they\'re watching Bluetooth traffic...' },
                        { speaker: 'Ryan', text: 'I know. Using encrypted channels only from now on.' }
                    ]);
                } else if (visitedFacility) {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Jaap Haartsen...*' },
                        { speaker: '', text: '*Video feed connects - Jaap Haartsen looks concerned*' },
                        { speaker: 'Jaap Haartsen', text: 'Ryan, are you okay? You look like you\'ve been through something.' },
                        { speaker: 'Ryan', text: 'Long story. Let\'s just say I went somewhere I wasn\'t supposed to be.' },
                        { speaker: 'Jaap Haartsen', text: 'The facility near Westerbork?' },
                        { speaker: 'Ryan', text: 'How did you—' },
                        { speaker: 'Jaap Haartsen', text: 'I\'ve heard rumors. Old Ericsson colleagues mentioned government contracts there.' },
                        { speaker: 'Jaap Haartsen', text: 'Bluetooth-based surveillance systems. I didn\'t want to believe it.' },
                        { speaker: 'Ryan', text: 'It\'s real. And it\'s massive.' },
                        { speaker: 'Jaap Haartsen', text: 'What are you going to do?' },
                        { speaker: 'Ryan', text: 'Find out who\'s running it. And why.' },
                        { speaker: 'Jaap Haartsen', text: 'Let me know if you need technical analysis. I know these protocols better than anyone.' },
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: '', text: '📹 *Connecting to Jaap Haartsen...*' },
                        { speaker: '', text: '*Video feed connects - Jaap Haartsen in smart home office, multiple screens visible*' },
                        { speaker: 'Jaap Haartsen', text: 'Ryan! Good timing - I just saw your message from last week.' },
                        { speaker: 'Ryan', text: 'No worries. Just wanted to say the documentary was great.' },
                        { speaker: 'Jaap Haartsen', text: 'Thanks! Fifteen years of Bluetooth work condensed into five minutes.' },
                        { speaker: 'Jaap Haartsen', text: 'They didn\'t even mention the hardest parts - the security layers, the pairing protocols...' },
                        { speaker: 'Ryan', text: 'The frequency-hopping spread spectrum was impressive enough.' },
                        { speaker: 'Jaap Haartsen', text: 'Ah yes! 1600 hops per second across 79 channels. Beautiful engineering.' },
                        { speaker: 'Jaap Haartsen', text: 'Learned a lot from LOFAR\'s signal processing work, actually.' },
                        { speaker: 'Jaap Haartsen', text: 'Cees Bassa\'s algorithms inspired some of our interference mitigation.' },
                        { speaker: 'Ryan', text: 'It\'s amazing how connected all this tech is.' },
                        { speaker: 'Jaap Haartsen', text: 'Absolutely. We all built on each other\'s work. That\'s how innovation happens.' },
                        { speaker: 'Ryan', text: 'Well, thanks for the chat. I\'ll let you get back to it.' },
                        { speaker: 'Jaap Haartsen', text: 'Anytime, Ryan. Keep hacking the good hack!' }
                    ]);
                }
            }
        },
        {
            id: 'exit_videocall',
            name: 'End Call →',
            x: 83.3,
            y: 81.5,
            width: 8.3,
            height: 5.6,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
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
                    { speaker: '', text: '*Three video slots available: David Prinsloo, Cees Bassa, and Jaap Haartsen*' },
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
