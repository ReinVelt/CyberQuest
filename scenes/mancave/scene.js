/**
 * Scene: Mancave (Garage)
 * Ryan's tech lab with all the hacking equipment
 */

const MancaveScene = {
    id: 'mancave',
    name: 'Mancave - Tech Lab',
    
    background: 'assets/images/scenes/mancave.svg',
    
    // Player starting position
    playerStart: { x: 20, y: 85 },
    
    // Random idle thoughts for this scene
    idleThoughts: [
        "Love this old tech smell...",
        "These cables are a nightmare.",
        "Weird RF activity today.",
        "SDR needs an update... eventually.",
        "Wonder what signals I'll catch.",
        "This stuff is older than millennials.",
        "Need to organize these SDR dongles.",
        "That antenna array took forever to calibrate.",
        "Maybe I should clean up... nah.",
        "The cold war called, wants its equipment back.",
        "Still faster than cloud computing.",
        "This is why Ies stays upstairs.",
        "Nothing beats air-gapped security.",
        "Signal processing is poetry.",
        "These racks hum like a data center.",
        "Local processing. No cloud spying.",
        "My own little SIGINT station.",
        "Every frequency tells a story.",
        "RF spectrum never sleeps.",
        "This is what freedom looks like."
    ],
    
    hotspots: [
        {
            id: 'sstv-terminal',
            name: 'SSTV Terminal',
            // SVG: desk translate(250,450) + monitor translate(300,0), bezel x=-20,y=-20,w=340,h=240
            x: 27.60,
            y: 39.81,
            width: 17.71,
            height: 22.22,
            cursor: 'pointer',
            lookMessage: "My SSTV decoder terminal. Used to receive images transmitted over radio.",
            action: function(game) {
                // Check for second transmission (after frequency puzzle)
                if (game.getFlag('second_transmission_ready') && !game.getFlag('second_message_decoded')) {
                    game.setStoryPart(5);
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Wait! New SSTV transmission!' },
                        { speaker: '', text: '*An image slowly forms, line by line...*' },
                        { speaker: 'Ryan', text: 'That\'s... MY HOUSE! Someone took a photo!' },
                        { speaker: '', text: '*More encoded text appears*' },
                        { speaker: 'Ryan', text: 'They know where I live. They\'ve been watching me.' },
                        { speaker: 'Ryan', text: 'Another encoded message. Decode time!' }
                    ]);
                    
                    // Trigger the second ROT1 puzzle
                    setTimeout(() => {
                        game.startPuzzle({
                            id: 'rot1_message_2',
                            type: 'rot1',
                            questId: 'decode_meeting',
                            encryptedText: 'XF LOPX ZPV BSF XBUDIJOH - XF OFFE ZPVS IFMQ - NFFU BU UFS BQFM LMPTUFS 23:00 - DPNF BMPOF - CSJOH ZPVS TLJMMT',
                            hint: 'Same cipher as before. ROT1 - shift each letter back by one position.',
                            solution: 'WE KNOW YOU ARE WATCHING - WE NEED YOUR HELP - MEET AT TER APEL KLOOSTER 23:00 - COME ALONE - BRING YOUR SKILLS',
                            onSolve: function(g) {
                                g.setFlag('second_message_decoded', true);
                                g.setStoryPart(6);
                                g.advanceTime(60);
                                
                                g.addQuest({
                                    id: 'go_to_klooster',
                                    name: 'Meet at Ter Apel Klooster',
                                    description: 'Someone wants to meet at the Ter Apel monastery at 23:00. They know where you live. This could be a trap... or the answer to everything.',
                                    hint: 'Head through the garden to reach your car and drive to the Klooster.'
                                });
                                
                                g.setFlag('klooster_unlocked', true);
                                
                                g.startDialogue([
                                    { speaker: 'Ryan', text: 'WE KNOW YOU ARE WATCHING - WE NEED YOUR HELP - MEET AT TER APEL KLOOSTER 23:00 - COME ALONE - BRING YOUR SKILLS' },
                                    { speaker: 'Ryan', text: 'They want to meet. Tonight. Old monastery.' },
                                    { speaker: 'Ryan', text: 'Someone\'s been watching me. Photographed my damn house.' },
                                    { speaker: 'Ryan', text: 'Could be a trap. Could be the answer.' },
                                    { speaker: 'Ryan', text: 'Flipper Zero, HackRF, laptop... and my wits.' },
                                    { speaker: 'Ryan', text: 'The garden leads to where I parked the Volvo.' }
                                ]);
                            }
                        });
                    }, 500);
                    return;
                }
                
                // After second message decoded - reminder
                if (game.getFlag('second_message_decoded')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Second message: "MEET AT TER APEL KLOOSTER 23:00"' },
                        { speaker: 'Ryan', text: 'Through the garden to my car. Time\'s ticking.' }
                    ]);
                    return;
                }
                
                // First transmission logic
                if (game.getFlag('sstv_transmission_received')) {
                    if (!game.getFlag('message_decoded')) {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'SSTV showing that pattern again. Visual morse...' },
                            { speaker: 'Ryan', text: 'Should decode this. Looks like simple cipher.' }
                        ]);
                        
                        // Trigger the ROT1 puzzle
                        setTimeout(() => {
                            game.startPuzzle({
                                id: 'rot1_message_1',
                                type: 'rot1',
                                questId: 'decode_message',
                                encryptedText: 'XBSOJOH - QSPKFDU FDIP JT DPNQSPNJTFE - NPWF UP CBDLVQ DIBOOFM - DPPSEJOBUFT GPMMPX - USVTU OP POF',
                                hint: 'In ROT1, each letter is shifted by 1. B→A, C→B, etc. Try shifting each letter back by one position in the alphabet.',
                                solution: 'WARNING - PROJECT ECHO IS COMPROMISED - MOVE TO BACKUP CHANNEL - COORDINATES FOLLOW - TRUST NO ONE',
                                onSolve: function(g) {
                                    g.setFlag('message_decoded', true);
                                    g.setStoryPart(3);
                                    g.advanceTime(30);
                                    g.startDialogue([
                                        { speaker: 'Ryan', text: 'WARNING - PROJECT ECHO IS COMPROMISED - MOVE TO BACKUP CHANNEL - COORDINATES FOLLOW - TRUST NO ONE' },
                                        { speaker: 'Ryan', text: 'Project Echo? German military R&D? Serious stuff.' },
                                        { speaker: 'Ryan', text: 'But wait... ROT1 isn\'t real encryption. Any idiot could break this.' },
                                        { speaker: 'Ryan', text: 'This was deliberate. They WANT to be found... by the right person.' },
                                        { speaker: 'Ryan', text: 'And why SSTV? That\'s for images. This whole thing is weird.' },
                                        { speaker: 'Ryan', text: 'Message mentioned a frequency. Check the HackRF.' }
                                    ]);
                                }
                            });
                        }, 500);
                    } else if (!game.getFlag('frequency_tuned')) {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'Decoded: "WARNING - PROJECT ECHO IS COMPROMISED..."' },
                            { speaker: 'Ryan', text: 'Should tune HackRF to find that military frequency.' }
                        ]);
                    } else {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'The first message has been decoded. Waiting for more transmissions...' }
                        ]);
                    }
                } else if (game.getFlag('checked_email')) {
                    // Trigger the transmission event
                    game.setFlag('sstv_transmission_received', true);
                    game.setStoryPart(2);
                    
                    game.addQuest({
                        id: 'decode_message',
                        name: 'Decipher the Message',
                        description: 'The SSTV terminal is showing a strange pattern that looks like encoded morse code. Decode the message.',
                        hint: 'The pattern suggests ROT1 encoding - each letter shifted by one position.'
                    });
                    
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Wait... the SSTV terminal! Something\'s showing!' },
                        { speaker: '', text: '*Static shifts into a pattern*' },
                        { speaker: 'Ryan', text: 'Not just noise. That looks like... visual morse?' },
                        { speaker: 'Ryan', text: 'And encoded text. Can\'t be a coincidence.' },
                        { speaker: 'Ryan', text: 'Let me analyze this...' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My SSTV terminal. Slow Scan TV - for satellite images.' },
                        { speaker: 'Ryan', text: 'Right now? Just static. Snow and noise.' },
                        { speaker: 'Ryan', text: 'Keep it running just in case.' }
                    ]);
                }
            }
        },
        {
            id: 'laptop',
            name: 'Laptop',
            // On desk - translate(0, 20) relative to desk at (250, 450)
            // Absolute: (250, 470) = (13.02%, 43.52%)
            x: 13.02,
            y: 43.52,
            width: 10.42,  // 200px laptop width
            height: 13.89, // 150px laptop height
            cursor: 'pointer',
            action: function(game) {
                // Part 9-11: After seeing evidence, use laptop to reach out to allies
                if (game.getFlag('evidence_unlocked') && !game.getFlag('started_ally_search')) {
                    game.setFlag('started_ally_search', true);
                    game.setStoryPart(9);
                    
                    // Part 9: The Dilemma
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Eight people dead. More planned. What do I do with this?' },
                        { speaker: 'Ryan', text: 'Option 1: Dutch police? AIVD? They\'d laugh me out.' },
                        { speaker: 'Ryan', text: '"Some stranger gave me German military secrets." Yeah, that\'ll go well.' },
                        { speaker: 'Ryan', text: 'Option 2: Press. WikiLeaks, Der Spiegel. But 72 hours isn\'t enough time.' },
                        { speaker: 'Ryan', text: 'And I\'d become target number one. Blown whistle, blown life.' },
                        { speaker: 'Ryan', text: 'Option 3: Walk away. Delete everything. Pretend this never happened.' },
                        { speaker: 'Ryan', text: '...Who am I kidding? That was never an option.' },
                        { speaker: 'Ryan', text: 'Option 4: Verify. Find allies. People who understand RF tech.' },
                        { speaker: 'Ryan', text: 'Build a case so solid they can\'t ignore it. Then decide.' },
                        { speaker: 'Ryan', text: 'I know exactly who to call. Time to reach out.' }
                    ]);
                    
                    setTimeout(() => {
                        game.showNotification('Click the laptop again to contact allies');
                    }, 3000);
                    return;
                }
                
                // Part 10: Contact allies (second click)
                if (game.getFlag('started_ally_search') && !game.getFlag('contacted_allies')) {
                    game.setFlag('contacted_allies', true);
                    game.setStoryPart(10);
                    
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Living in Drenthe has perks. Radio astronomy capital of the world.' },
                        { speaker: 'Ryan', text: 'David Prinsloo at TU Eindhoven - antenna engineering genius, lunar telescope designer.' },
                        { speaker: 'Ryan', text: 'Cees Bassa from LOFAR - signal processing genius. Paranoid but sharp.' },
                        { speaker: 'Ryan', text: 'Jaap Haartsen, the Bluetooth inventor. Brilliant and sharp.' },
                        { speaker: 'Ryan', text: 'Three experts. Three different channels. Let\'s make contact.' }
                    ]);
                    
                    setTimeout(() => {
                        // David Prinsloo contact via email
                        game.showChat({
                            id: 'contact_henk',
                            type: 'signal',
                            contact: 'Dr. David Prinsloo',
                            contactSubtitle: 'TU Eindhoven',
                            messages: [
                                {
                                    from: 'Ryan',
                                    text: 'David - long time. Need your expertise on something urgent. RF weaponization, military-grade. Have schematics that need expert analysis. Can we talk? Secure channel only.',
                                    timestamp: '04:32'
                                },
                                {
                                    from: 'Dr. David Prinsloo',
                                    text: 'Ryan? Didn\'t expect to hear from you. RF weapons? That\'s heavy. What kind of schematics are we talking about?',
                                    timestamp: '05:18'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'Directional EM pulse system. Multiple antenna arrays, phase control, frequency targeting. Range 5km+. German facility. Eight confirmed casualties in testing.',
                                    timestamp: '05:20'
                                },
                                {
                                    from: 'Dr. David Prinsloo',
                                    text: 'Jesus. Eight casualties? Are you sure this is real? Not some elaborate hoax?',
                                    timestamp: '05:22'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'Internal emails, test reports, casualty logs. All timestamped, all signed. This is real, David. And they\'re moving to urban testing. More people will die.',
                                    timestamp: '05:24'
                                },
                                {
                                    from: 'Dr. David Prinsloo',
                                    text: 'Send me what you have. Encrypted. If this is what you say it is, I\'ll help. But I need to verify first. This could destroy careers... or save lives.',
                                    timestamp: '05:27'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'Sending now. Check your secure drop. And David? Watch your back.',
                                    timestamp: '05:28'
                                },
                                {
                                    from: 'Dr. David Prinsloo',
                                    text: 'Received. Reviewing now. Ryan... if this is legitimate, this is bigger than both of us. We\'ll need more help.',
                                    timestamp: '05:45'
                                }
                            ],
                            onClose: (game) => {
                                game.setFlag('henk_contacted', true);
                                game.showNotification('David Prinsloo will review the evidence');
                                
                                // Trigger next contact
                                setTimeout(() => {
                                    game.showNotification('Click laptop again to contact Cees Bassa');
                                }, 2000);
                            }
                        });
                    }, 2000);
                    return;
                }
                
                // Second ally: Cees Bassa via Meshtastic
                if (game.getFlag('henk_contacted') && !game.getFlag('cees_contacted')) {
                    game.setFlag('cees_contacted', true);
                    
                    setTimeout(() => {
                        game.showChat({
                            id: 'contact_cees',
                            type: 'meshtastic',
                            contact: 'Cees Bassa',
                            contactSubtitle: 'Node: NL-DRN-042 (LoRa Mesh)',
                            messages: [
                                {
                                    from: 'Ryan',
                                    text: '[ENCRYPTED] M - need your brain. Big RF problem. Military scale. Too sensitive for internet. Mesh only.',
                                    timestamp: '06:12'
                                },
                                {
                                    from: 'Cees Bassa',
                                    text: '[ACK] Ryan? Unexpected ping. Define "military scale".',
                                    timestamp: '06:18'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'EM weapon. Phase-array targeting. Kills civilians for calibration. German facility, Russian tech.',
                                    timestamp: '06:19'
                                },
                                {
                                    from: 'Cees Bassa',
                                    text: 'That\'s... Jesus. How dangerous are we talking?',
                                    timestamp: '06:21'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'Crashes cars. Downs planes. Fries medical equipment. 5km range confirmed. Urban testing next phase.',
                                    timestamp: '06:22'
                                },
                                {
                                    from: 'Cees Bassa',
                                    text: 'And you want me to analyze signal processing? Ryan, I have kids. This sounds like something that gets people disappeared.',
                                    timestamp: '06:24'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'More people will die if we do nothing. Kids included. I need to know HOW it works to know how to STOP it. Your kids. Mine someday. Everyone\'s.',
                                    timestamp: '06:26'
                                },
                                {
                                    from: 'Cees Bassa',
                                    text: 'DAMN it, Ryan. You\'re right. Send via dead drop. I\'ll analyze off-grid. But you keep me anonymous. Always.',
                                    timestamp: '06:30'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'Promise. You\'re ghost protocol all the way. Sending coordinates now.',
                                    timestamp: '06:31'
                                },
                                {
                                    from: 'Cees Bassa',
                                    text: 'File received. Analyzing. This better be worth the risk. Stay safe, Ryan.',
                                    timestamp: '06:48'
                                }
                            ],
                            onClose: (game) => {
                                game.setFlag('cees_contacted', true);
                                game.showNotification('Cees Bassa will analyze signal patterns');
                                
                                setTimeout(() => {
                                    game.showNotification('Click laptop again to contact Jaap Haartsen');
                                }, 2000);
                            }
                        });
                    }, 500);
                    return;
                }
                
                // Third ally: Jaap Haartsen via BBS
                if (game.getFlag('cees_contacted') && !game.getFlag('jaap_contacted')) {
                    game.setFlag('jaap_contacted', true);
                    
                    setTimeout(() => {
                        game.showChat({
                            id: 'contact_jaap',
                            type: 'bbs',
                            contact: '>>> SHADOWBOARD BBS',
                            contactSubtitle: 'Connected: 2400 baud | User: JAAP',
                            messages: [
                                {
                                    from: 'SYSOP',
                                    text: '=== SECURE BOARD ===\\nDead drop for: JAAP\\nEncryption: ROT47+AES256',
                                    timestamp: '07:05'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'J - remember when you said corporations were the enemy? Found something worse. RF weapon. Russian architect, German money, civilian casualties. Want in?',
                                    timestamp: '07:06'
                                },
                                {
                                    from: 'Jaap Haartsen',
                                    text: 'Ryan?? Hell, haven\'t heard from you in years. RF weapon? Define parameters.',
                                    timestamp: '07:23'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'Multi-band EM pulse, directional. Disables electronics: cars, planes, medical gear. 5km range. Built by Soviet defector named Volkov. 8 dead so far.',
                                    timestamp: '07:25'
                                },
                                {
                                    from: 'Jaap Haartsen',
                                    text: 'VOLKOV. Holy shit. I know that name. Bluetooth conferences, 2000s. Always asking weird questions about protocol vulnerabilities. Creepy Russian dude.',
                                    timestamp: '07:27'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'You MET him?? Tell me everything.',
                                    timestamp: '07:28'
                                },
                                {
                                    from: 'Jaap Haartsen',
                                    text: 'DEF CON 2003, maybe 2004. Claimed to be "independent consultant." Kept pressing me about medical device protocols - pacemakers, insulin pumps. Said it was for "security research." I got bad vibes. Avoided him after that.',
                                    timestamp: '07:31'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'He was researching targets. Even back then. Jaap, I need your help. Need to understand wireless protocol vulnerabilities. How to defend against this thing.',
                                    timestamp: '07:33'
                                },
                                {
                                    from: 'Jaap Haartsen',
                                    text: 'You got it. Send me everything. If Volkov is behind this, he\'s been planning it for DECADES. This is the enemy I\'ve been waiting for. Real. Tangible. Evil.',
                                    timestamp: '07:36'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'Uploading now. Encrypted. Welcome to the war, old friend.',
                                    timestamp: '07:37'
                                },
                                {
                                    from: 'Jaap Haartsen',
                                    text: 'Downloaded. Analyzing. Holy hell, Ryan. This is sophisticated. Military-grade signal processing. Decades of research. We\'ve got our work cut out for us.',
                                    timestamp: '08:15'
                                }
                            ],
                            onClose: (game) => {
                                game.setFlag('jaap_contacted', true);
                                game.setFlag('all_allies_contacted', true);
                                game.completeQuest('find_allies');
                                game.showNotification('All three allies recruited!');
                                
                                // Trigger Part 11
                                setTimeout(() => {
                                    game.showNotification('Click laptop again to investigate Volkov');
                                }, 2500);
                            }
                        });
                    }, 500);
                    return;
                }
                
                // Part 11: Investigate Volkov (fourth click)
                if (game.getFlag('all_allies_contacted') && !game.getFlag('volkov_investigated')) {
                    game.setFlag('volkov_investigated', true);
                    game.setStoryPart(11);
                    
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Three allies on board. Now... who is Volkov, really?' },
                        { speaker: 'Ryan', text: '*Opens evidence files, searching for clues*' },
                        { speaker: 'Ryan', text: 'Scanning email metadata... here! Comment in schematic source:' },
                        { speaker: 'Ryan', text: '"Adjusted per Volkov specifications - 14.03.2024"' },
                        { speaker: 'Ryan', text: 'Not a German name. Russian. Let\'s dig deeper.' }
                    ]);
                    
                    setTimeout(() => {
                        // Show email evidence about Volkov
                        game.showEvidence({
                            id: 'volkov_email',
                            type: 'email',
                            title: 'Internal Email - Security Concerns',
                            content: {
                                from: 'weber.klaus@steckerdoser-rd.mil.de',
                                to: 'schmidt.anna@steckerdoser-rd.mil.de',
                                subject: 'RE: Consultant concerns',
                                date: '2024-06-15 09:42',
                                body: `Anna,

I share your concerns about Dr. V's access level. His contributions to the signal propagation algorithms have been invaluable, but his background check is still pending from BND. I've raised this with Director Hoffmann twice. Both times I was told to "focus on delivery."

The pressure from above is immense. Someone wants this project completed regardless of protocol.

I've done some digging on my own (don't tell anyone). Volkov's work history has gaps. Big gaps. The companies he claims to have worked for in the 90s? Some don't exist anymore. Some never existed. His academic credentials check out, but everything before 1998 is fuzzy.

Anna, I think we have a mole. Or worse - our entire project might be compromised from the inside.

But when I raised this with Hoffmann, he shut me down. Hard. Said Volkov was "personally vouched for at the highest levels" and that questioning him was "above my pay grade."

I don't know what to do. Do we keep working on this and hope for the best? Or do we risk our careers to blow the whistle?

Klaus

PS: Delete this email after reading. I'm serious.`
                            },
                            onRead: (game) => {
                                setTimeout(() => {
                                    game.startDialogue([
                                        { speaker: 'Ryan', text: 'Background check STILL pending. Gaps in work history.' },
                                        { speaker: 'Ryan', text: '"Personally vouched for at the highest levels"' },
                                        { speaker: 'Ryan', text: 'Someone powerful is protecting him. This goes deep.' },
                                        { speaker: 'Ryan', text: 'Let me check those test signatures...' }
                                    ]);
                                    
                                    setTimeout(() => {
                                        game.startDialogue([
                                            { speaker: '', text: '*Ryan searches test report signatures*' },
                                            { speaker: 'Ryan', text: 'ECHO-7 through ECHO-12. The deadliest tests.' },
                                            { speaker: 'Ryan', text: 'Every single one signed: "V."' },
                                            { speaker: 'Ryan', text: 'Volkov designed it. Volkov tested it. Volkov KILLED for it.' },
                                            { speaker: 'Ryan', text: 'This isn\'t a German weapon. It\'s a Russian weapon built on German soil.' },
                                            { speaker: 'Ryan', text: 'I need someone with OSINT skills. Someone who digs up ghosts.' },
                                            { speaker: 'Ryan', text: 'Time to call Chris Kubecka.' }
                                        ]);
                                        
                                        setTimeout(() => {
                                            game.addQuest({
                                                id: 'contact_kubecka',
                                                name: 'Contact Chris Kubecka',
                                                description: 'Reach out to Chris "The Hacktress" Kubecka for OSINT investigation on Dimitri Volkov. Need deep background check on this Russian operative.',
                                                hint: 'Use your phone to send a secure Signal message'
                                            });
                                            game.showNotification('New Quest: Contact Chris Kubecka');
                                            
                                            setTimeout(() => {
                                                game.showNotification('Use your secure phone on the desk');
                                            }, 2000);
                                        }, 3000);
                                    }, 4000);
                                }, 2000);
                            }
                        });
                    }, 2000);
                    return;
                }
                
                // After all parts completed
                if (game.getFlag('volkov_investigated')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Volkov: Russian agent. 8 dead. Infiltrated German military R&D.' },
                        { speaker: 'Ryan', text: 'Need Chris Kubecka to dig deeper. OSINT is her specialty.' }
                    ]);
                    return;
                }
                
                // Original early game logic
                if (!game.getFlag('checked_email')) {
                    game.setFlag('checked_email', true);
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Let\'s see what\'s in my inbox...' },
                        { speaker: '', text: '*Ryan scrolls through emails*' },
                        { speaker: 'Ryan', text: 'Newsletter, spam, another newsletter... nothing urgent.' },
                        { speaker: 'Ryan', text: 'No freelance work either. Back to my project.' },
                        { speaker: '', text: '*Ryan starts coding*' },
                        { speaker: 'Ryan', text: 'Now, where was I with this auth module...' }
                    ]);
                    game.advanceTime(60);
                    
                    // After a delay, trigger the SSTV event hint
                    setTimeout(() => {
                        game.showNotification('Something strange is happening with the SSTV terminal...');
                    }, 3000);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My trusty laptop running Kali Linux. Everything I need for... research.' }
                    ]);
                }
            }
        },
        {
            id: 'airgapped-laptop',
            name: 'Air-Gapped Laptop',
            // Separate laptop on left side of desk, never connected to internet
            x: 5.00,
            y: 42.13,
            width: 6.00,
            height: 14.00,
            cursor: 'pointer',
            lookMessage: "My air-gapped laptop. Never been online. Perfect for analyzing suspicious files.",
            action: function(game) {
                // Only accessible after getting the USB stick
                if (!game.hasItem('usb_stick')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My air-gapped laptop. Totally isolated from networks.' },
                        { speaker: 'Ryan', text: 'Use it for analyzing suspicious files. Can\'t be too careful.' }
                    ]);
                    return;
                }
                
                // USB Analysis begins!
                if (!game.getFlag('usb_analyzed')) {
                    game.setFlag('usb_analyzed', true);
                    game.setStoryPart(8);
                    
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Time to see what\'s on this USB stick.' },
                        { speaker: 'Ryan', text: '*Inserts USB into air-gapped laptop*' },
                        { speaker: '', text: '*The drive mounts*' },
                        { speaker: 'Ryan', text: 'Three files. README.txt, echo_schematics.pdf, evidence.zip' },
                        { speaker: 'Ryan', text: 'Let\'s start with the README.' }
                    ]);
                    
                    // Show README after dialogue completes
                    setTimeout(() => {
                        game.showEvidence({
                            id: 'readme_usb',
                            type: 'text',
                            title: 'README.txt',
                            author: 'E',
                            date: '2026-02-05 18:42',
                            content: `TRUST THE PROCESS

Ryan,

If you're reading this, you received my signal and you're smarter than I thought.

What you have here is evidence of Project Echo - a radiofrequency weapon being developed at the Steckerdoser Heide facility in Germany.

The schematics are simplified but real. This device can manipulate electromagnetic fields at specific frequencies to disable electronics, crash vehicles, interrupt medical devices. Range: approximately 5 kilometers. Power output: classified, but sufficient to cause mass chaos.

The encrypted archive contains the proof you'll need: internal emails, test results, casualty reports from "calibration accidents." The password is the frequency you tuned into. You'll know it when you see it.

Time is short. 72 hours from the timestamp on this file. After that, the project moves to final testing phase. Real deployment. Real casualties.

I can't go through normal channels. The people protecting this project have infiltrated too deep - military, intelligence, possibly government. Anyone I approach directly will be silenced. Including me.

You're being watched. Use air-gapped systems only. Encrypt everything. Trust no one until you can verify their identity through secure channels.

Study the evidence. You'll see why this can't go public through conventional means. We need allies. Technical experts who understand what this technology can do. And we need them fast.

Good luck, Ryan. The fate of a lot of innocent people depends on what you do next.

- E

P.S. Destroy this USB after copying the files. It's traceable.`,
                            onRead: (game) => {
                                // After reading README, prompt for schematics
                                setTimeout(() => {
                                    game.showNotification('Press the air-gapped laptop again to view schematics');
                                }, 2000);
                            }
                        });
                    }, 2000);
                } 
                // Second click: Show schematics
                else if (game.getFlag('usb_analyzed') && !game.getFlag('viewed_schematics')) {
                    game.setFlag('viewed_schematics', true);
                    
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Opening the schematics PDF...' },
                        { speaker: 'Ryan', text: '*This looks like... a directional EM pulse weapon?*' },
                        { speaker: 'Ryan', text: 'Multiple antenna arrays. Phase control. Signal modulation.' },
                        { speaker: 'Ryan', text: 'They can target specific frequencies. Cars, planes, medical devices...' }
                    ]);
                    
                    setTimeout(() => {
                        game.showEvidence({
                            id: 'echo_schematics',
                            type: 'schematic',
                            title: 'Project Echo - System Overview',
                            content: {
                                image: 'assets/images/evidence/echo-schematic.svg',
                                classification: 'STRENG GEHEIM (TOP SECRET)',
                                notes: 'Simplified diagram showing antenna array configuration, phase-locked loop control, and frequency targeting system. Full technical specifications require clearance level 4 or higher.',
                                warning: 'UNAUTHORIZED DISCLOSURE SUBJECT TO PROSECUTION UNDER CRIMINAL CODE §93 (TREASON)'
                            },
                            onRead: (game) => {
                                setTimeout(() => {
                                    game.showNotification('One file remaining: evidence.zip (encrypted)');
                                }, 2000);
                            }
                        });
                    }, 2000);
                }
                // Third click: Try to open evidence.zip (password required)
                else if (game.getFlag('viewed_schematics') && !game.getFlag('evidence_unlocked')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The evidence.zip file is encrypted.' },
                        { speaker: 'Ryan', text: '"The password is the frequency you tuned into"' },
                        { speaker: 'Ryan', text: 'That would be... 243 MHz!' }
                    ]);
                    
                    setTimeout(() => {
                        game.showPasswordPuzzle({
                            id: 'evidence_unlock',
                            title: 'Encrypted Archive',
                            description: 'Enter the frequency you discovered on the military channel.\n\n"The password is the frequency you tuned into. You\'ll know it when you see it." - E',
                            correctAnswer: ['243', '243 MHz', '243MHz', '243 mhz', '243.0'],
                            hint: 'The HackRF picked up transmissions on a specific military frequency. What was it?',
                            placeholder: 'Enter frequency...',
                            inputType: 'text',
                            maxAttempts: 3,
                            onSuccess: (game) => {
                                game.setFlag('evidence_unlocked', true);
                                game.showNotification('✓ Archive decrypted!');
                                
                                // Show first evidence document
                                setTimeout(() => {
                                    game.startDialogue([
                                        { speaker: 'Ryan', text: 'It worked! Archive is open.' },
                                        { speaker: 'Ryan', text: 'Dozens of files. Internal emails, test reports...' },
                                        { speaker: 'Ryan', text: '*Opens first document*' },
                                        { speaker: 'Ryan', text: 'Oh god. "Collateral damage during calibration tests"?' },
                                        { speaker: 'Ryan', text: 'These aren\'t accidents. They killed people testing this thing.' }
                                    ]);
                                    
                                    setTimeout(() => {
                                        game.showEvidence({
                                            id: 'casualty_report',
                                            type: 'report',
                                            title: 'ECHO Test Series - Incident Log',
                                            date: '2024-03-14 to 2026-01-28',
                                            content: [
                                                `PROJECT ECHO - CALIBRATION TEST INCIDENTS
CLASSIFICATION: STRENG GEHEIM

INCIDENT SUMMARY (2024-2026)

Test ECHO-7 (2024-03-14)
Location: 3.2 km from facility
Event: BMW 5-series lost control, collided with tree
Casualties: 1 fatality, 2 injured
Frequency: 2.4 GHz burst, 250ms duration
Official report: Driver error, mechanical failure
Status: CONTAINED

Test ECHO-8 (2024-06-22)
Location: 4.8 km from facility
Event: Cessna 172 lost navigation and engine control
Casualties: 2 fatalities
Frequency: Multi-band sweep, VHF/UHF
Official report: Pilot error, weather conditions
Status: CONTAINED

Test ECHO-9 (2024-09-11)
Location: 2.1 km from facility
Event: Multiple vehicle collision, A31 highway
Casualties: 3 fatalities, 7 injured
Frequency: 900 MHz targeted burst
Official report: Fog, driver distraction
Status: CONTAINED - Local press managed

Test ECHO-10 (2025-04-03)
Location: 1.8 km from facility
Event: Hospital equipment failure during surgery
Casualties: 1 fatality (cardiac arrest)
Frequency: 2.4 GHz sustained interference
Official report: Equipment malfunction, no investigation
Status: CONTAINED - Family compensated quietly`,
                                                
                                                `Test ECHO-11 (2025-10-19)
Location: 5.3 km from facility (extended range test)
Event: Agricultural drone swarm lost control
Casualties: 0 (crashed in field)
Frequency: GPS spoofing + control signal jamming
Official report: Software glitch
Status: CONTAINED

Test ECHO-12 (2026-01-28)
Location: 4.1 km from facility
Event: Ambulance navigation failure + medical equipment crash
Casualties: 1 fatality (patient died en route)
Frequency: Multi-vector attack (GPS, cellular, medical band)
Official report: Equipment age, maintenance issues
Status: UNDER INVESTIGATION - BND awareness suspected

TOTAL CASUALTIES: 8 confirmed fatalities, 9+ injured

PROJECT STATUS: Proceed to Phase 3 (Urban Environment Testing)

AUTHORIZATION: [REDACTED]

NOTES: 
- All incidents successfully attributed to natural causes or human error
- Local authorities complied with security directives
- Media coverage suppressed through standard protocols
- Civilian casualties deemed "acceptable" for strategic capability development
- Dr. Volkov recommends increasing power output for Phase 3 tests

-- Document signed: "V"`
                                            ],
                                            onRead: (game) => {
                                                setTimeout(() => {
                                                    game.startDialogue([
                                                        { speaker: 'Ryan', text: 'Eight people dead. Nine injured. And they call it "acceptable".' },
                                                        { speaker: 'Ryan', text: 'Signed by "V". That has to be Volkov.' },
                                                        { speaker: 'Ryan', text: 'Phase 3 means urban testing. More people. More casualties.' },
                                                        { speaker: 'Ryan', text: 'I need help. Need allies who understand what this technology can do.' },
                                                        { speaker: 'Ryan', text: '"E" was right. This is beyond me now.' }
                                                    ]);
                                                    
                                                    // Complete analyze_usb quest, add find_allies quest
                                                    setTimeout(() => {
                                                        game.completeQuest('analyze_usb');
                                                        game.addQuest({
                                                            id: 'find_allies',
                                                            name: 'Find Technical Allies',
                                                            description: 'Reach out to RF experts who can help analyze Project Echo and understand its full capabilities. Time is running out.',
                                                            hint: 'Think about people with expertise in radio astronomy, wireless protocols, and signal processing. Who do you know?'
                                                        });
                                                        
                                                        game.showNotification('New Quest: Find Technical Allies');
                                                    }, 3000);
                                                }, 2000);
                                            }
                                        });
                                    }, 2000);
                                }, 1500);
                            },
                            onFailure: (game, maxReached) => {
                                if (maxReached) {
                                    game.startDialogue([
                                        { speaker: 'Ryan', text: 'Wait, what was that frequency again?' },
                                        { speaker: 'Ryan', text: 'I should check my HackRF logs...' }
                                    ]);
                                }
                            }
                        });
                    }, 1500);
                }
                // After everything is viewed
                else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The USB evidence is clear: 8 dead, more planned.' },
                        { speaker: 'Ryan', text: 'Project Echo is a weapon. And Volkov is using German resources to perfect it.' },
                        { speaker: 'Ryan', text: 'I need allies. People with RF expertise who can help.' }
                    ]);
                }
            }
        },
        {
            id: 'hackrf',
            name: 'HackRF One with Portapack',
            // SVG: translate(1200, 530), w=150, h=80
            x: 62.50,
            y: 49.07,
            width: 7.81,
            height: 7.41,
            cursor: 'pointer',
            action: function(game) {
                if (game.getFlag('message_decoded') && !game.getFlag('frequency_tuned')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Message said military frequency from Steckerdoser Heide.' },
                        { speaker: 'Ryan', text: 'Let\'s tune the HackRF and see what we get.' }
                    ]);
                    
                    setTimeout(() => {
                        game.startPuzzle({
                            id: 'frequency_tune',
                            type: 'frequency',
                            description: 'Tune to the military frequency from the Steckerdoser Heide facility. The frequency should be in the VHF military band.',
                            startFreq: 100.0,
                            minFreq: 50,
                            maxFreq: 500,
                            solution: 243.0, // Military emergency frequency
                            onSolve: function(g) {
                                g.setFlag('frequency_tuned', true);
                                g.setFlag('military_frequency', 243);
                                g.setStoryPart(4);
                                g.startDialogue([
                                    { speaker: '', text: '*Static crackles, then clear signal*' },
                                    { speaker: 'Ryan', text: 'Got something! Repeating data burst on 243 MHz.' },
                                    { speaker: 'Ryan', text: 'Military emergency frequency. Someone\'s broadcasting.' },
                                    { speaker: 'Ryan', text: 'Steckerdoser Heide is only 30 minutes away...' },
                                    { speaker: 'Ryan', text: 'Check it out? Or wait for more?' }
                                ]);
                                
                                // Trigger second SSTV transmission after a delay
                                setTimeout(() => {
                                    g.setFlag('second_transmission_ready', true);
                                    g.showNotification('The SSTV terminal is showing a new transmission!');
                                }, 4000);
                            }
                        });
                    }, 500);
                } else if (game.getFlag('frequency_tuned')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The HackRF is locked onto 243 MHz. Still picking up those data bursts.' },
                        { speaker: 'Ryan', text: 'The facility is just 30 minutes away...' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My HackRF One with Portapack. Software Defined Radio at its finest.' },
                        { speaker: 'Ryan', text: 'I can receive and transmit on almost any frequency with this beauty.' }
                    ]);
                }
            }
        },
        {
            id: 'flipper-zero',
            name: 'Flipper Zero',
            // SVG: translate(1200, 650), w=100, h=50
            x: 62.50,
            y: 60.19,
            width: 5.21,
            height: 4.63,
            cursor: 'pointer',
            action: function(game) {
                if (!game.hasItem('flipper_zero')) {
                    game.addToInventory({
                        id: 'flipper_zero',
                        name: 'Flipper Zero',
                        description: 'Multi-tool device for RFID, NFC, infrared, and GPIO hacking.',
                        icon: 'assets/images/icons/flipper-zero.svg'
                    });
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'My Flipper Zero. Never leave home without it.' },
                        { speaker: 'Ryan', text: 'RFID, NFC, infrared, sub-GHz radio... this little guy can do it all.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'I\'ve already got my Flipper Zero. It\'s in my pocket.' }
                    ]);
                }
            }
        },
        {
            id: 'wifi-pineapple',
            name: 'WiFi Pineapple',
            // Near workbench with other tools
            x: 68.0,
            y: 67.0,
            width: 4.0,
            height: 5.5,
            cursor: 'pointer',
            action: function(game) {
                if (!game.hasItem('wifi_pineapple')) {
                    game.addToInventory({
                        id: 'wifi_pineapple',
                        name: 'WiFi Pineapple',
                        description: 'Portable WiFi auditing tool for network penetration testing.',
                        icon: 'assets/images/icons/wifi-pineapple.svg'
                    });
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'WiFi Pineapple. Perfect for network auditing on the go.' },
                        { speaker: 'Ryan', text: 'Might come in handy if I need to intercept wireless traffic.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Already packed the WiFi Pineapple.' }
                    ]);
                }
            }
        },
        {
            id: 'night-vision',
            name: 'Night Vision Monocular',
            // Near tactical equipment
            x: 78.0,
            y: 38.0,
            width: 3.5,
            height: 5.0,
            cursor: 'pointer',
            action: function(game) {
                if (!game.hasItem('night_vision')) {
                    game.addToInventory({
                        id: 'night_vision',
                        name: 'Night Vision Monocular',
                        description: 'Military-grade night vision device. Essential for nocturnal operations.',
                        icon: 'assets/images/icons/night-vision.svg'
                    });
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Night vision monocular. Bought from surplus years ago.' },
                        { speaker: 'Ryan', text: 'If this goes south, I might need to move in the dark.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Night vision already in my bag.' }
                    ]);
                }
            }
        },
        {
            id: 'espresso-machine',
            name: 'Espresso Machine',
            // SVG: Small corner unit near workbench
            x: 15.0,
            y: 65.0,
            width: 4.0,
            height: 8.0,
            cursor: 'pointer',
            action: function(game) {
                const coffeeCount = game.getFlag('espresso_count') || 0;
                game.setFlag('espresso_count', coffeeCount + 1);
                const newCount = coffeeCount + 1;
                
                const responses = [
                    { speaker: 'Ryan', text: '*Makes espresso. The machine hisses and gurgles.*' },
                    { speaker: 'Ryan', text: `Coffee number ${newCount}. Still coherent... mostly.` }
                ];
                
                if (newCount === 1) {
                    responses[1] = { speaker: 'Ryan', text: 'First espresso of the session. Fuel for the brain.' };
                } else if (newCount === 3) {
                    responses[1] = { speaker: 'Ryan', text: 'Third espresso. Now we\'re cooking with gas.' };
                } else if (newCount === 5) {
                    responses[1] = { speaker: 'Ryan', text: 'Fifth espresso. I can taste colors now.' };
                } else if (newCount === 8) {
                    responses[1] = { speaker: 'Ryan', text: 'Eight espressos. My heart is a drum machine.' };
                } else if (newCount >= 10) {
                    responses[1] = { speaker: 'Ryan', text: `Espresso #${newCount}. I\'ve transcended the need for sleep.` };
                }
                
                game.startDialogue(responses);
                game.advanceTime(5);
            }
        },
        {
            id: 'server-rack',
            name: 'Server Rack',
            // SVG: translate(1650, 200), w=200, h=600
            x: 85.94,
            y: 18.52,
            width: 10.42,
            height: 55.56,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My personal server. Runs a few services, hosts my projects.' },
                    { speaker: 'Ryan', text: 'Also has my dead man\'s switch configured. Just in case.' },
                    { speaker: 'Ryan', text: 'If I don\'t check in regularly, it sends out an encrypted package to trusted contacts.' }
                ]);
            }
        },
        {
            id: 'meshtastic',
            name: 'Meshtastic Nodes',
            // SVG: translate(1380, 600), w=80, h=120
            x: 71.88,
            y: 55.56,
            width: 4.17,
            height: 11.11,
            cursor: 'pointer',
            action: function(game) {
                // Part 16: Contact Eva Weber via Meshtastic
                if (game.getFlag('identified_eva') && !game.getFlag('eva_contacted')) {
                    game.setFlag('eva_contacted', true);
                    game.setStoryPart(16);
                    
                    game.startDialogue([
                        { speaker: 'Ryan', text: '*Drives to forest edge near Steckerdoser Heide. 3 AM.*' },
                        { speaker: 'Ryan', text: 'Off-grid. Away from cameras. Far from cellular towers.' },
                        { speaker: 'Ryan', text: 'Meshtastic is the only way she can talk without the facility knowing.' },
                        { speaker: 'Ryan', text: '*Powers on Meshtastic device. Scans for nodes.*' },
                        { speaker: 'Ryan', text: 'There. Signal. Strong. She\'s nearby.' }
                    ]);
                    
                    setTimeout(() => {
                        game.showChat({
                            id: 'eva_contact',
                            type: 'meshtastic',
                            contact: 'EVA_W',
                            contactSubtitle: 'Mesh Network',
                            messages: [
                                {
                                    from: 'EVA_W',
                                    text: 'Ryan. You found me.',
                                    timestamp: '03:07'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'Eva Weber. Klaus Weber\'s daughter. You have IT access to everything at that facility.',
                                    timestamp: '03:08'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'My father worked there for 20 years. Senior engineer. He started noticing discrepancies in 2023. Equipment requisitions that didn\'t match project specs. Budget items that made no sense.',
                                    timestamp: '03:09'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'He raised concerns. Wrote memos. Nobody listened. Then one day, he died. "Heart attack." Perfectly healthy man. 58 years old.',
                                    timestamp: '03:10'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'I got his job. IT Security. I had access to things he never could. Network logs. Email archives. Encrypted drives.',
                                    timestamp: '03:11'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'And you found Volkov.',
                                    timestamp: '03:11'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'Dimitri Volkov. The project lead everyone trusts. But his communications don\'t go to Berlin. They go to Moscow. Encrypted channels. Direct to FSB addresses.',
                                    timestamp: '03:12'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'Director Hoffmann protects him. Blocks any investigation. Because Hoffmann is ALSO compromised. Russian asset. Both of them.',
                                    timestamp: '03:13'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'Project Echo isn\'t a German defense project. It\'s Operation ZERFALL. They\'re using German resources to build a weapon for Moscow. The Reichsbürger coup was supposed to create chaos. Echo would disable response capabilities.',
                                    timestamp: '03:14'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'But the coup failed. So they adapted. Phase 3 of testing. Urban environments. Real targets. In 72 hours.',
                                    timestamp: '03:15'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'Hamburg. Amsterdam. Berlin?',
                                    timestamp: '03:15'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'I don\'t know which city. But it\'s happening. Ambulances will crash. Hospital equipment will fail. People will die. And Russia gets to watch NATO panic.',
                                    timestamp: '03:16'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'Why didn\'t you go to BND? German intelligence?',
                                    timestamp: '03:17'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'Because Hoffmann has connections at the highest levels. He\'s protected. Anyone who investigates gets shut down. My father tried. Look what happened.',
                                    timestamp: '03:18'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'I need someone OUTSIDE the system. Someone with technical skills. Someone who can\'t be silenced by a phone call from Berlin.',
                                    timestamp: '03:18'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'I scanned for technical targets near the facility. Found your SSTV terminal. Your equipment. I knew you could receive. And I knew you\'d understand.',
                                    timestamp: '03:19'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'What do you need me to do?',
                                    timestamp: '03:20'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'There\'s a secure server room. Isolated network. Where they keep the real operational plans. Deployment schedules. Target coordinates. Direct evidence of FSB control.',
                                    timestamp: '03:21'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'I can get you inside. Night shift. Minimal security. But you\'ll need to bypass biometric locks and access the air-gapped server.',
                                    timestamp: '03:22'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'Get that data. We expose EVERYTHING. BND can\'t ignore hard evidence. NATO gets involved. This ends.',
                                    timestamp: '03:23'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'When?',
                                    timestamp: '03:24'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'Tomorrow night. 11 PM. North entrance. I\'ll leave a badge for you. From there, you\'re on your own until you reach the server room. Then I can guide you remotely.',
                                    timestamp: '03:25'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'This is dangerous, Ryan. If they catch you, I can\'t help. If Volkov finds out... we both disappear.',
                                    timestamp: '03:26'
                                },
                                {
                                    from: 'Ryan',
                                    text: 'I\'m in. For your father. For everyone they\'ve hurt.',
                                    timestamp: '03:27'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'Thank you. Tomorrow night. Be ready. Stay off the grid until then. Meshtastic only. They monitor everything else.',
                                    timestamp: '03:28'
                                },
                                {
                                    from: 'EVA_W',
                                    text: 'Good luck, Ryan. The world needs hackers like you. Now more than ever.',
                                    timestamp: '03:29'
                                }
                            ],
                            onClose: (game) => {
                                game.completeQuest('contact_eva');
                                game.addQuest({
                                    id: 'infiltrate_facility',
                                    name: 'Infiltrate Steckerdoser Heide',
                                    description: 'Meet Eva at the north entrance at 11 PM. Bypass security and access the secure server room to extract evidence of Russian control.',
                                    hint: 'Prepare your equipment. Bring Flipper Zero, tools, anything that might help bypass security systems.'
                                });
                                game.showNotification('Infiltration planned for tomorrow night');
                                
                                setTimeout(() => {
                                    game.startDialogue([
                                        { speaker: 'Ryan', text: '*Drives home as the sun rises*' },
                                        { speaker: 'Ryan', text: 'Tomorrow night. Everything changes.' },
                                        { speaker: 'Ryan', text: 'Time to prepare.' }
                                    ]);
                                    
                                    setTimeout(() => {
                                        game.startDialogue([
                                            { speaker: 'Ryan', text: '*That evening, 10:45 PM*' },
                                            { speaker: 'Ryan', text: 'Equipment ready. Flipper Zero, tools, Meshtastic.' },
                                            { speaker: 'Ryan', text: 'Time to go. Volvo is in the garden.' }
                                        ]);
                                        game.showNotification('Go to garden when ready to leave');
                                    }, 3000);
                                }, 2000);
                            }
                        });
                    }, 3000);
                    return;
                }
                
                // After Eva contacted - reminder
                if (game.getFlag('eva_contacted')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Eva is waiting. Tomorrow night. 11 PM. North entrance.' },
                        { speaker: 'Ryan', text: 'I need to prepare. Check my equipment. Make sure I\'m ready.' }
                    ]);
                    return;
                }
                
                // Default: Pickup item
                if (!game.hasItem('meshtastic')) {
                    game.addToInventory({
                        id: 'meshtastic',
                        name: 'Meshtastic Node',
                        description: 'Long-range, low-power mesh networking device. Perfect for off-grid communication.',
                        icon: 'assets/images/icons/meshtastic.svg'
                    });
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Meshtastic nodes. Decentralized mesh networking.' },
                        { speaker: 'Ryan', text: 'No cell towers, no internet required. Messages hop from device to device.' },
                        { speaker: 'Ryan', text: 'I\'ll take one. You never know when you need secure comms.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'I\'ve got a Meshtastic node already. Useful stuff.' }
                    ]);
                }
            }
        },
        {
            id: 'secure-phone',
            name: 'Secure Phone',
            // On desk - translate(280, 30) relative to desk at (250, 450)
            // Absolute: (530, 480) with expanded clickable area
            x: 25.0,
            y: 42.0,
            width: 6.0,  // Larger clickable area
            height: 12.0, // Larger clickable area
            cursor: 'pointer',
            lookMessage: "My encrypted phone with Signal. For serious conversations only.",
            action: function(game) {
                // Part 12: Contact Chris Kubecka
                if (game.getFlag('volkov_investigated') && !game.getFlag('contacted_kubecka')) {
                    game.setFlag('contacted_kubecka', true);
                    game.setStoryPart(12);
                    
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Time to call in a favor. Chris Kubecka.' },
                        { speaker: 'Ryan', text: 'The Hacktress. If anyone can dig up dirt on Volkov, she can.' },
                        { speaker: 'Ryan', text: '*Opens Signal and types message*' }
                    ]);
                    
                    setTimeout(() => {
                        game.showChat({
                            id: 'chris_kubecka_osint',
                            type: 'signal',
                            contact: 'Chris Kubecka',
                            contactSubtitle: 'The Hacktress',
                            messages: [
                                {
                                    from: 'Ryan',
                                    text: 'Chris - need your OSINT magic. Looking into someone named Volkov, possibly Russian, working on RF weapons research in Germany. High stakes, short timeline. Can you dig?',
                                    timestamp: '08:42'
                                },
                                {
                                    from: 'Chris Kubecka',
                                    text: 'Volkov? I know that name. Give me an hour.',
                                    timestamp: '08:44'
                                },
                                {
                                    from: 'Chris Kubecka',
                                    text: 'Okay, this is interesting. Dimitri Volkov, 52, former Soviet military researcher. Officially "defected" in 1998 after the USSR collapse. Worked at various European defense contractors under different names - Volkov is his real one.',
                                    timestamp: '09:37'
                                },
                                {
                                    from: 'Chris Kubecka',
                                    text: 'Here\'s the kicker: he was part of a Soviet program called СПЕКТР (Spektr) in the late 80s. Classified RF research. The program was supposedly shut down, but rumors in certain circles say the research continued... privately.',
                                    timestamp: '09:38'
                                },
                                {
                                    from: 'Chris Kubecka',
                                    text: 'I\'ve seen his name pop up in connection with some very nasty drone incidents in Ukraine. Signal jamming, GPS spoofing - but more targeted than usual. Like someone knew exactly which frequencies to hit.',
                                    timestamp: '09:39'
                                },
                                {
                                    from: 'Chris Kubecka',
                                    text: 'If he\'s at that German facility, they didn\'t hire a consultant. They hired the architect of Soviet RF warfare.\n\nBe careful, Ryan. People who dig into Volkov tend to have accidents.\n\nI\'ll keep looking. Watch your back.',
                                    timestamp: '09:41'
                                }
                            ],
                            onClose: (game) => {
                                game.completeQuest('contact_kubecka');
                                game.showNotification('SPEKTR program connection confirmed');
                                
                                setTimeout(() => {
                                    game.showNotification('Click phone again to continue investigation');
                                }, 2000);
                            }
                        });
                    }, 1500);
                    return;
                }
                
                // Part 13 & 14: Dead Ends & Bigger Picture
                if (game.getFlag('contacted_kubecka') && !game.getFlag('discovered_zerfall')) {
                    game.setFlag('discovered_zerfall', true);
                    game.setStoryPart(13);
                    
                    // Part 13: Dead Ends montage
                    game.startDialogue([
                        { speaker: 'Ryan', text: '*Hours pass. Coffee number... twelve? Lost count.*' },
                        { speaker: 'Ryan', text: 'WHY would Germany build this? For WHOM? HOW did Volkov get in?' },
                        { speaker: 'Ryan', text: 'Wait. Wrong question.' },
                        { speaker: 'Ryan', text: 'What if Germany DOESN\'T know?' },
                        { speaker: 'Ryan', text: 'What if Volkov infiltrated from the inside?' },
                        { speaker: 'Ryan', text: 'Foreign operation. Russian assets. Using German resources.' },
                        { speaker: 'Ryan', text: 'Need to find the connection...' }
                    ]);
                    
                    // Part 14: Research sequence
                    setTimeout(() => {
                        game.setStoryPart(14);
                        game.startDialogue([
                            { speaker: 'Ryan', text: '*Searches news archives*' },
                            { speaker: 'Ryan', text: 'December 2022. Reichsbürger coup plot.' },
                            { speaker: 'Ryan', text: 'Prince Heinrich XIII Reuss. 25 conspirators arrested.' },
                            { speaker: 'Ryan', text: 'Plan: Storm Bundestag. Overthrow government.' },
                            { speaker: 'Ryan', text: 'And the Russian connection... they were in contact with Moscow.' },
                            { speaker: 'Ryan', text: 'Russia backing a coup. In Germany. In 2022.' },
                            { speaker: 'Ryan', text: 'What if Project Echo was supposed to HELP that coup?' },
                            { speaker: 'Ryan', text: 'Disable communications. Crash emergency vehicles. Create chaos.' },
                            { speaker: 'Ryan', text: 'The coup failed. But did the weapon project stop?' },
                            { speaker: 'Ryan', text: 'I need to message Chris again.' }
                        ]);
                        
                        // Chris's follow-up
                        setTimeout(() => {
                            game.showChat({
                                id: 'chris_zerfall',
                                type: 'signal',
                                contact: 'Chris Kubecka',
                                contactSubtitle: 'The Hacktress',
                                messages: [
                                    {
                                        from: 'Ryan',
                                        text: 'Chris - the Reichsbürger connection. Was Volkov ever linked to that network?',
                                        timestamp: '12:18'
                                    },
                                    {
                                        from: 'Chris Kubecka',
                                        text: 'Jesus, Ryan. I dug deeper after your message.',
                                        timestamp: '12:23'
                                    },
                                    {
                                        from: 'Chris Kubecka',
                                        text: 'Volkov\'s name appears in leaked FSB documents from 2019. He\'s listed as a "technical asset" for something called Operation ZERFALL - German for "decay" or "collapse."',
                                        timestamp: '12:24'
                                    },
                                    {
                                        from: 'Chris Kubecka',
                                        text: 'The operation\'s goal: "preparation of conditions for political transition in target nation."\n\nI found references to "technical disruption capabilities" being developed "within target infrastructure." That\'s Project Echo.',
                                        timestamp: '12:25'
                                    },
                                    {
                                        from: 'Chris Kubecka',
                                        text: 'The Reichsbürger plot was the political arm. Echo is the technical arm. They\'re meant to work TOGETHER.\n\nThe 2022 arrests set them back, but they didn\'t stop. They just went deeper underground.',
                                        timestamp: '12:27'
                                    },
                                    {
                                        from: 'Chris Kubecka',
                                        text: 'Ryan, this is beyond us. This needs BND, NATO, someone with actual power. But you need PROOF they can\'t ignore. Hard evidence of Russian control.\n\nFind "E". They\'re your key.\n\nStay safe.',
                                        timestamp: '12:29'
                                    }
                                ],
                                onClose: (game) => {
                                    game.addQuest({
                                        id: 'identify_eva',
                                        name: 'Identify "E"',
                                        description: 'The whistleblower "E" is the key to proving Russian control. Find out who they are and why they chose you.',
                                        hint: 'Analyze the photo E sent. Look for clues in the image metadata and reflections.'
                                    });
                                    game.showNotification('Operation ZERFALL discovered');
                                    
                                    setTimeout(() => {
                                        game.showNotification('Click phone again to analyze the photo');
                                    }, 2500);
                                }
                            });
                        }, 3000);
                    }, 3000);
                    return;
                }
                
                // Part 15: Photo analysis - Eva discovery
                if (game.getFlag('discovered_zerfall') && !game.getFlag('identified_eva')) {
                    game.setFlag('identified_eva', true);
                    game.setStoryPart(15);
                    
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'How does E know me? Why choose a random hacker in Drenthe?' },
                        { speaker: 'Ryan', text: 'Unless... they\'ve been watching. The photo of my house!' },
                        { speaker: 'Ryan', text: '*Pulls up SSTV image on air-gapped laptop*' },
                        { speaker: 'Ryan', text: 'EXIF data analysis... camera serial number fragment!' },
                        { speaker: 'Ryan', text: '"NIKON D750 - Serial: 6024***"' },
                        { speaker: 'Ryan', text: 'And in the window reflection... a figure. Female. Long hair.' },
                        { speaker: 'Ryan', text: 'Wearing a lanyard. A facility badge!' },
                        { speaker: 'Ryan', text: '*Searches leaked email metadata*' },
                        { speaker: 'Ryan', text: 'CC line in one email: weber.eva@steckerdoser-rd.mil.de' },
                        { speaker: 'Ryan', text: 'Eva Weber. Same last name as Klaus Weber.' },
                        { speaker: 'Ryan', text: 'Daughter? Sister? Let me check personnel files...' }
                    ]);
                    
                    setTimeout(() => {
                        game.showEvidence({
                            id: 'eva_personnel',
                            type: 'text',
                            title: 'Personnel File - Eva Weber',
                            date: 'Last Updated: 2025-11-03',
                            content: `STECKERDOSER HEIDE R&D FACILITY
PERSONNEL RECORD (UNCLASSIFIED)

NAME: Weber, Eva Marie
DATE OF BIRTH: 1994-03-17 (Age 31)
POSITION: IT Security Analyst
DEPARTMENT: Information Systems
CLEARANCE: Level 3 (SECRET)
EMPLOYMENT START: 2018-06-01

EDUCATION:
- MSc Computer Science, TU Munich (2016)
- BSc IT Security, TU Darmstadt (2014)
Specialization: Network Security, Cryptography

PREVIOUS EMPLOYMENT:
- Siemens AG, Cybersecurity Division (2016-2018)
- Internship: Federal Office for Information Security (BSI) (2015)

FAMILY CONNECTIONS:
- Father: Dr. Klaus Weber (Senior Engineer, same facility)
- Mother: Deceased (2019)

SECURITY NOTES:
- Clearance renewed 2024-08 without incident
- Access to all internal communication systems
- Responsible for network monitoring and intrusion detection
- Has raised concerns about network anomalies (see incident log 2024-07-22)

SUPERVISOR NOTES:
"Highly competent. Sometimes too inquisitive about matters outside her purview. Reminds her father." - Director Hoffmann, 2024 annual review`,
                            onRead: (game) => {
                                setTimeout(() => {
                                    game.startDialogue([
                                        { speaker: 'Ryan', text: 'IT Security Analyst. Network access to everything.' },
                                        { speaker: 'Ryan', text: 'Klaus Weber\'s daughter. He wrote the concern email.' },
                                        { speaker: 'Ryan', text: '"Too inquisitive about matters outside her purview"' },
                                        { speaker: 'Ryan', text: 'She found something. Tried to raise concerns. Got shut down.' },
                                        { speaker: 'Ryan', text: 'So she went outside. Found me. But HOW?' },
                                        { speaker: 'Ryan', text: 'IT Security... network monitoring... she has access to everything.' },
                                        { speaker: 'Ryan', text: 'She could have scanned external targets. Found my systems.' },
                                        { speaker: 'Ryan', text: 'Saw my SSTV terminal. My equipment. Knew I could receive.' },
                                        { speaker: 'Ryan', text: 'She chose me because I\'m OUTSIDE. Can\'t be silenced internally.' },
                                        { speaker: 'Ryan', text: 'Eva Weber. "E". The whistleblower.' },
                                        { speaker: 'Ryan', text: 'Now I need to contact her. Securely.' }
                                    ]);
                                    
                                    setTimeout(() => {
                                        game.completeQuest('identify_eva');
                                        game.addQuest({
                                            id: 'contact_eva',
                                            name: 'Contact Eva Weber',
                                            description: 'Establish secure communication with Eva Weber using Meshtastic off-grid network. She can\'t risk using internal facility communications.',
                                            hint: 'Eva mentioned coordinates in her message. Check the Meshtastic device.'
                                        });
                                        game.showNotification('Eva Weber identified as "E"');
                                    }, 4000);
                                }, 2000);
                            }
                        });
                    }, 3000);
                    return;
                }
                
                // After Eva identified - point to Meshtastic
                if (game.getFlag('identified_eva') && !game.getFlag('eva_contacted')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Eva Weber. IT Security Analyst. Whistleblower.' },
                        { speaker: 'Ryan', text: 'Need to contact her securely. Off-grid.' },
                        { speaker: 'Ryan', text: 'Meshtastic. She mentioned coordinates in an earlier transmission.' }
                    ]);
                    return;
                }
                
                // Default phone messages
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My secure phone. Signal encrypted. For conversations that matter.' }
                ]);
            }
        },
        {
            id: 'video-terminal',
            name: 'Video Conference Terminal',
            x: 65.1,
            y: 25.9,
            width: 15.6,
            height: 18.5,
            cursor: 'pointer',
            lookMessage: 'Secure video terminal for encrypted calls with my contacts.',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Video terminal - encrypted connection to David Prinsloo, Cees Bassa, and Jaap Haartsen.' },
                    { speaker: 'Ryan', text: 'Let\'s see who\'s available...' }
                ]);
                setTimeout(() => {
                    game.loadScene('videocall');
                }, 1000);
            }
        },
        {
            id: 'door-house',
            name: 'Door to House',
            // SVG: translate(30, 250), w=140, h=500
            x: 1.56,
            y: 23.15,
            width: 7.29,
            height: 46.30,
            cursor: 'pointer',
            targetScene: 'home'
        },
        {
            id: 'door-garden',
            name: 'Side Door to Garden',
            // Right side of the mancave - leads to backyard
            x: 95,
            y: 50,
            width: 4,
            height: 30,
            cursor: 'pointer',
            action: function(game) {
                if (game.getFlag('klooster_unlocked')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Time to head out. The Volvo is parked in the back.' }
                    ]);
                    setTimeout(() => {
                        game.loadScene('garden');
                    }, 1500);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The side door leads to the garden. Nice for some fresh air.' }
                    ]);
                    setTimeout(() => {
                        game.loadScene('garden');
                    }, 1500);
                }
            }
        }
    ],
    
    onEnter: function(game) {
        document.getElementById('scene-background').className = 'scene-mancave';
        
        if (!game.getFlag('visited_mancave')) {
            game.setFlag('visited_mancave', true);
            game.startDialogue([
                { speaker: 'Ryan', text: 'My mancave. My lab.' },
                { speaker: 'Ryan', text: 'Everything a hacker needs: radios, computers, tools.' },
                { speaker: 'Ryan', text: 'Check emails and get to work.' }
            ]);
        }
        
        // Random incoming calls from mother or father-in-law
        const randomCallChance = Math.random();
        const motherCallCount = game.getFlag('mother_call_count') || 0;
        const fatherCallCount = game.getFlag('father_call_count') || 0;
        
        // Mother calls sometimes when you've been busy
        if (randomCallChance < 0.15 && motherCallCount < 3 && game.getFlag('sstv_decoded')) {
            game.setFlag('mother_call_count', motherCallCount + 1);
            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: '📞 *Incoming video call...*' },
                    { speaker: '', text: '*Mother calling*' },
                    { speaker: 'Mother', text: 'Ryan! Finally! I haven\'t heard from you in days!' },
                    { speaker: 'Ryan', text: 'Hi Mom. Sorry, I\'ve been busy with work.' },
                    { speaker: 'Mother', text: 'Too busy for your mother? When are you coming to visit?' },
                    { speaker: 'Mother', text: 'I\'ll cook your favorite - stamppot with rookworst and gravy!' },
                    { speaker: 'Ryan', text: 'That sounds amazing, Mom. Soon, I promise.' },
                    { speaker: 'Mother', text: 'You always say "soon"! It\'s been three weeks!' },
                    { speaker: 'Mother', text: 'I made erwtensoep. Froze some for you.' },
                    { speaker: 'Ryan', text: 'You\'re the best. I really will come visit.' },
                    { speaker: 'Mother', text: 'You look tired, schat. Are you eating properly?' },
                    { speaker: 'Ryan', text: 'Yes, Mom. Ies takes good care of me.' },
                    { speaker: 'Mother', text: 'Good. Don\'t forget your old mother! Love you, lieverd.' },
                    { speaker: 'Ryan', text: 'Love you too, Mom.' }
                ]);
            }, 3000);
        }
        
        // Father-in-law calls with technical questions
        if (randomCallChance > 0.85 && fatherCallCount < 3) {
            game.setFlag('father_call_count', fatherCallCount + 1);
            const questions = [
                [
                    { speaker: '', text: '📞 *Incoming video call...*' },
                    { speaker: '', text: '*Father-in-Law calling*' },
                    { speaker: 'Father-in-Law', text: 'Ryan! Quick question - you got a minute?' },
                    { speaker: 'Ryan', text: 'Sure, what\'s up?' },
                    { speaker: 'Father-in-Law', text: 'My 3D printer keeps under-extruding on the first layer.' },
                    { speaker: 'Father-in-Law', text: 'Z-offset is set correctly. Bed is leveled. What am I missing?' },
                    { speaker: 'Ryan', text: 'Check your nozzle temperature. Might be too low.' },
                    { speaker: 'Ryan', text: 'Also, flow rate - try bumping it to 105% for the first layer.' },
                    { speaker: 'Father-in-Law', text: 'Ah! I had it at 200°C for PLA. Should go to 210?' },
                    { speaker: 'Ryan', text: 'Yeah, 210-215 for the first layer helps with bed adhesion.' },
                    { speaker: 'Father-in-Law', text: 'Perfect! I\'ll try that. Thanks!' },
                    { speaker: 'Ryan', text: 'No problem. Let me know how it goes.' },
                    { speaker: 'Father-in-Law', text: 'Will do! Coffee sometime?' },
                    { speaker: 'Ryan', text: 'Sounds good!' }
                ],
                [
                    { speaker: '', text: '📞 *Incoming video call...*' },
                    { speaker: '', text: '*Father-in-Law calling*' },
                    { speaker: 'Father-in-Law', text: 'Ryan, got a weird Arduino issue.' },
                    { speaker: 'Ryan', text: 'What\'s happening?' },
                    { speaker: 'Father-in-Law', text: 'Reading analog values from a potentiometer. They\'re super noisy.' },
                    { speaker: 'Father-in-Law', text: 'Jumping all over the place. 512, 489, 523, 501...' },
                    { speaker: 'Ryan', text: 'Classic noise problem. Add a small capacitor across the pot terminals.' },
                    { speaker: 'Ryan', text: '0.1µF should smooth it out. Also use analogRead averaging in code.' },
                    { speaker: 'Father-in-Law', text: 'Average multiple readings?' },
                    { speaker: 'Ryan', text: 'Yeah, take 10 readings, discard outliers, average the rest.' },
                    { speaker: 'Father-in-Law', text: 'Makes sense. Software and hardware filtering together!' },
                    { speaker: 'Ryan', text: 'Exactly. Should give you stable values.' },
                    { speaker: 'Father-in-Law', text: 'Brilliant! This is why I call you. Thanks!' },
                    { speaker: 'Ryan', text: 'Anytime!' }
                ],
                [
                    { speaker: '', text: '📞 *Incoming video call...*' },
                    { speaker: '', text: '*Father-in-Law calling*' },
                    { speaker: 'Father-in-Law', text: 'Hey Ryan! Quick one - stepper motor question.' },
                    { speaker: 'Ryan', text: 'Shoot.' },
                    { speaker: 'Father-in-Law', text: 'NEMA 17 stepper gets hot after running for 20 minutes.' },
                    { speaker: 'Father-in-Law', text: 'Like, really hot. Too hot to touch. Is that normal?' },
                    { speaker: 'Ryan', text: 'Depends. What\'s your driver current set to?' },
                    { speaker: 'Father-in-Law', text: 'Uh... whatever the default was?' },
                    { speaker: 'Ryan', text: 'That\'s probably your issue. Check the motor specs - likely 1.5A max.' },
                    { speaker: 'Ryan', text: 'Set your driver to about 70% of that. 1.0-1.2A should be good.' },
                    { speaker: 'Father-in-Law', text: 'Too much current means too much heat!' },
                    { speaker: 'Ryan', text: 'Exactly. Adjust the little potentiometer on your driver board.' },
                    { speaker: 'Father-in-Law', text: 'Got it. I\'ll tune it down. Thanks!' },
                    { speaker: 'Ryan', text: 'No problem. Don\'t burn down your workshop!' },
                    { speaker: 'Father-in-Law', text: '*Laughs* I\'ll try not to!' }
                ]
            ];
            
            const questionIndex = fatherCallCount % questions.length;
            setTimeout(() => {
                game.startDialogue(questions[questionIndex]);
            }, 3000);
        }
    }
};

// Register scene when loaded
if (window.game) {
    window.game.registerScene('mancave', MancaveScene);
}

if (typeof module !== 'undefined') {
    module.exports = MancaveScene;
}
