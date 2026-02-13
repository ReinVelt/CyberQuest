/**
 * Facility Server Room Scene - Evidence extraction and confrontation
 * Final act location
 */

const FacilityServerScene = {
    id: 'facility_server',
    name: 'Server Room - Basement',
    
    background: 'assets/images/scenes/facility_server.svg',
    
    description: 'Air-conditioned server room. Racks of equipment humming. This is where the secrets are kept.',
    
    playerStart: { x: 20, y: 85 },
    
    idleThoughts: [
        "Rows of servers. So much data.",
        "Air conditioning is loud. Good cover.",
        "Where's that terminal Eva mentioned?",
        "Time is running out.",
        "Get the evidence. Get out."
    ],
    
    state: {
        doorUnlocked: false,
        terminalAccessed: false,
        evidenceDownloaded: false,
        confrontationStarted: false
    },
    
    hotspots: [
        {
            id: 'server_door',
            name: 'Server Room Door',
            x: 5.21,
            y: 64.81,
            width: 9.38,
            height: 29.63,
            cursor: 'look',
            action: function(game) {
                if (FacilityServerScene.state.doorUnlocked) {
                    game.showDialogue([
                        "Door is open. Server room beyond.",
                        "No turning back now."
                    ], "Ryan");
                } else {
                    game.showDialogue([
                        "Biometric lock. Fingerprint scanner and keypad.",
                        "Eva said there's an override code: 2847"
                    ], "Ryan");
                }
            }
        },
        {
            id: 'override_panel',
            name: 'Maintenance Override',
            x: 2.60,
            y: 77.78,
            width: 1.82,
            height: 5.56,
            cursor: 'pointer',
            enabled: () => !FacilityServerScene.state.doorUnlocked,
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Blue maintenance panel. Right where Eva said.' },
                    { speaker: 'Ryan', text: '*Types: 2-8-4-7*' },
                    { speaker: '', text: '*CLICK* Red light turns green.' },
                    { speaker: '', text: '*Door lock disengages*' },
                    { speaker: 'Ryan', text: 'I\'m in. Server room ahead.' }
                ]);
                
                FacilityServerScene.state.doorUnlocked = true;
                
                setTimeout(() => {
                    game.showNotification('Server room unlocked - Find the terminal');
                }, 2000);
            }
        },
        {
            id: 'server_racks',
            name: 'Server Racks',
            x: 10.42,
            y: 18.52,
            width: 57.29,
            height: 55.56,
            cursor: 'look',
            action: function(game) {
                game.showDialogue([
                    "Racks of blade servers. Enterprise-grade equipment.",
                    "Cables everywhere. Blinking status LEDs.",
                    "This is German military infrastructure. Top tier."
                ], "Ryan");
            }
        },
        {
            id: 'terminal',
            name: 'Air-Gapped Terminal',
            x: 78.13,
            y: 50.93,
            width: 10.42,
            height: 13.89,
            cursor: 'pointer',
            enabled: () => FacilityServerScene.state.doorUnlocked && !FacilityServerScene.state.evidenceDownloaded,
            action: function(game) {
                if (!FacilityServerScene.state.terminalAccessed) {
                    FacilityServerScene.state.terminalAccessed = true;
                    
                    game.startDialogue([
                        { speaker: '', text: '*Black terminal case. Isolated from network.*' },
                        { speaker: 'Ryan', text: '*Powers on terminal*' },
                        { speaker: '', text: '*Boot sequence. Login prompt appears.*' },
                        { speaker: 'Ryan', text: 'Need credentials. Eva?' },
                        { speaker: 'Eva (Mesh)', text: 'Try: username "volkov_d", password "Moskau_1991"' },
                        { speaker: 'Ryan', text: '*Types carefully*' },
                        { speaker: '', text: '*SYSTEM ACCESS GRANTED - DR. DMITRI VOLKOV*' },
                        { speaker: 'Ryan', text: 'I\'m in. His personal account.' }
                    ]);
                    
                    setTimeout(() => {
                        game.showNotification('Access granted - Download the evidence');
                    }, 2500);
                } else if (!FacilityServerScene.state.evidenceDownloaded) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: '*Navigates filesystem*' },
                        { speaker: '', text: '*Opens: /ZERFALL/PHASE_3/*' },
                        { speaker: 'Ryan', text: 'Financial transfers... FSB routing codes... Target coordinates.' },
                        { speaker: 'Ryan', text: 'Hamburg. Amsterdam. Berlin. All three cities.' },
                        { speaker: 'Ryan', text: 'Ambulance systems. Hospital equipment. Traffic control.' },
                        { speaker: 'Ryan', text: 'Deployment date: 72 hours from now.' },
                        { speaker: 'Eva (Mesh)', text: 'Copy everything. USB drive in the drawer.' },
                        { speaker: 'Ryan', text: '*Finds drive. Inserts it.*' },
                        { speaker: '', text: '*File transfer begins...*' },
                        { speaker: '', text: '*Progress: 34%... 67%... 89%...*' }
                    ]);
                    
                    setTimeout(() => {
                        FacilityServerScene.state.evidenceDownloaded = true;
                        
                        game.startDialogue([
                            { speaker: '', text: '*100% COMPLETE*' },
                            { speaker: 'Ryan', text: 'Got it. All of it.' },
                            { speaker: 'Ryan', text: 'Let\'s—' }
                        ]);
                        
                        // Trigger Volkov confrontation
                        setTimeout(() => {
                            startVolkovConfrontation(game);
                        }, 2000);
                    }, 4000);
                } else {
                    game.showDialogue(["Evidence is already downloaded."], "Ryan");
                }
            }
        },
        {
            id: 'cooling_system',
            name: 'Cooling System',
            x: 2.60,
            y: 13.89,
            width: 6.25,
            height: 23.15,
            cursor: 'look',
            action: function(game) {
                game.showDialogue([
                    "Industrial air conditioning. Keeping the servers cool.",
                    "The noise is actually helpful. Covers my movements."
                ], "Ryan");
            }
        },
        {
            id: 'volkov_npc',
            name: 'Dmitri Volkov',
            x: 16,
            y: 63,
            width: 5.2,
            height: 18,
            cursor: 'pointer',
            enabled: () => FacilityServerScene.state.confrontationStarted,
            action: function(game) {
                game.showDialogue([
                    "Dr. Dmitri Volkov. The architect of Operation ZERFALL.",
                    "Cold, calculating. A scientist who chose profit over humanity."
                ], "Ryan");
            }
        },
        {
            id: 'kubecka_npc',
            name: 'Chris Kubecka',
            x: 0.5,
            y: 62,
            width: 5.2,
            height: 18,
            cursor: 'pointer',
            enabled: () => FacilityServerScene.state.confrontationStarted && game.getFlag('kubecka_arrived'),
            action: function(game) {
                game.showDialogue([
                    "Chris Kubecka. American cybersecurity expert.",
                    "Works with NATO cyber defense. Been tracking ZERFALL for months.",
                    "Right person, right place, right time."
                ], "Ryan");
            }
        },
        {
            id: 'eva_npc',
            name: 'Eva Weber',
            x: 22,
            y: 63.4,
            width: 5.2,
            height: 18,
            cursor: 'pointer',
            enabled: () => FacilityServerScene.state.confrontationStarted && game.getFlag('eva_arrived'),
            action: function(game) {
                game.showDialogue([
                    "Eva Weber. BND agent. Klaus's daughter.",
                    "She risked everything - her career, her freedom - to stop this.",
                    "Her father would be proud."
                ], "Ryan");
            }
        }
    ],
    
    onEnter: (game) => {
        game.showNotification('Server Room - Find the air-gapped terminal');
        
        // Create character elements in DOM (append, don't replace to preserve player character)
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            // Remove any existing NPC characters from previous visits
            const existingVolkov = document.getElementById('volkov_character');
            const existingKubecka = document.getElementById('kubecka_character');
            const existingEva = document.getElementById('eva_character');
            if (existingVolkov) existingVolkov.remove();
            if (existingKubecka) existingKubecka.remove();
            if (existingEva) existingEva.remove();
            
            // Create Volkov
            const volkov = document.createElement('img');
            volkov.id = 'volkov_character';
            volkov.src = 'assets/images/characters/volkov_southpark.svg';
            volkov.style.cssText = 'position: absolute; left: 16%; bottom: 0; width: 5.2%; height: auto; opacity: 0; transition: opacity 1s; pointer-events: none; z-index: 10;';
            charactersContainer.appendChild(volkov);
            
            // Create Kubecka
            const kubecka = document.createElement('img');
            kubecka.id = 'kubecka_character';
            kubecka.src = 'assets/images/characters/kubecka_southpark.svg';
            kubecka.style.cssText = 'position: absolute; left: 0.5%; bottom: 0; width: 5.2%; height: auto; opacity: 0; transition: opacity 0.8s; pointer-events: none; z-index: 10;';
            charactersContainer.appendChild(kubecka);
            
            // Create Eva
            const eva = document.createElement('img');
            eva.id = 'eva_character';
            eva.src = 'assets/images/characters/eva_southpark.svg';
            eva.style.cssText = 'position: absolute; left: 22%; bottom: 0; width: 5.2%; height: auto; opacity: 0; transition: opacity 0.8s; pointer-events: none; z-index: 10;';
            charactersContainer.appendChild(eva);
        }
        
        setTimeout(() => {
            game.startDialogue([
                { speaker: '', text: '*Basement corridor. Concrete walls. Cold.*' },
                { speaker: 'Ryan', text: 'Server room door ahead.' },
                { speaker: 'Ryan', text: 'Blue override panel on the right. Code: 2847' }
            ]);
        }, 1000);
    },
    
    onExit: () => {
        // Remove NPC character elements (but preserve player character)
        const volkov = document.getElementById('volkov_character');
        const kubecka = document.getElementById('kubecka_character');
        const eva = document.getElementById('eva_character');
        if (volkov) volkov.remove();
        if (kubecka) kubecka.remove();
        if (eva) eva.remove();
    }
};

function startVolkovConfrontation(game) {
    FacilityServerScene.state.confrontationStarted = true;
    game.setStoryPart(19);
    
    // Show Volkov character
    const volkovChar = document.getElementById('volkov_character');
    if (volkovChar) {
        volkovChar.style.transition = 'opacity 1s';
        volkovChar.style.opacity = '1';
    }
    
    game.startDialogue([
        { speaker: '', text: '*Footsteps in the corridor behind*' },
        { speaker: '', text: '*Door opens*' },
        { speaker: 'Volkov', text: 'Interesting technique with the gate. Old KGB tradecraft.' },
        { speaker: 'Ryan', text: '*Spins around. Dmitri Volkov stands in doorway.*' },
        { speaker: 'Volkov', text: 'You must be E\'s new friend. The Dutch hacker.' },
        { speaker: 'Volkov', text: '...' },
        { speaker: 'Ryan', text: 'It\'s over, Volkov. I have everything.' },
        { speaker: 'Ryan', text: 'ZERFALL. The FSB connection. Financial records. All of it.' },
        { speaker: 'Volkov', text: '*Smiles coldly* Perhaps.' },
        { speaker: 'Volkov', text: 'But I have something too.' },
        { speaker: '', text: '*Volkov reaches into his jacket—*' }
    ]);
    
    setTimeout(() => {
        // Show Kubecka character
        const kubeckaChar = document.getElementById('kubecka_character');
        if (kubeckaChar) {
            kubeckaChar.style.transition = 'opacity 0.8s';
            kubeckaChar.style.opacity = '1';
        }
        game.setFlag('kubecka_arrived', true);
        
        game.startDialogue([
            { speaker: 'Kubecka', text: 'I wouldn\'t.' },
            { speaker: '', text: '*Chris Kubecka steps from the shadows behind Volkov*' },
            { speaker: '', text: '*Weapon drawn. Trained on Volkov.*' },
            { speaker: 'Kubecka', text: 'Hands where I can see them, Doctor.' },
            { speaker: 'Volkov', text: '*Freezes. Calculates. Slowly raises hands.*' },
            { speaker: '', text: '*Bundeswehr military police flood the corridor*' },
            { speaker: '', text: '*Tactical gear. Automatic weapons.*' }
        ]);
        
        setTimeout(() => {
            // Show Eva character
            const evaChar = document.getElementById('eva_character');
            if (evaChar) {
                evaChar.style.transition = 'opacity 0.8s';
                evaChar.style.opacity = '1';
            }
            game.setFlag('eva_arrived', true);
            
            game.startDialogue([
                { speaker: 'Eva', text: '*Eva Weber enters with German intelligence officers*' },
                { speaker: 'Eva', text: 'Dmitri Volkov.' },
                { speaker: 'Eva', text: 'You are under arrest for espionage against the Federal Republic of Germany.' },
                { speaker: 'Volkov', text: '*Looks at Eva* Klaus\'s daughter.' },
                { speaker: 'Volkov', text: 'He would be proud. You have his fire.' },
                { speaker: 'Eva', text: 'My father is dead because of you.' },
                { speaker: 'Eva', text: 'Take him away.' },
                { speaker: '', text: '*Military police handcuff Volkov. Lead him out.*' }
            ]);
            
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Kubecka', text: '*To Ryan* Nice work. You got the evidence?' },
                    { speaker: 'Ryan', text: '*Holds up USB drive* Everything.' },
                    { speaker: 'Ryan', text: 'Financial records, deployment schedules, FSB communications.' },
                    { speaker: 'Eva', text: 'NATO command is on the line.' },
                    { speaker: 'Eva', text: 'Phase 3 will be stopped. Hamburg, Amsterdam, Berlin—all safe now.' },
                    { speaker: 'Ryan', text: 'It\'s over. Really over.' },
                    { speaker: 'Kubecka', text: 'This time.' },
                    { speaker: 'Kubecka', text: 'But people like Volkov... there\'s always another operation.' },
                    { speaker: 'Eva', text: '*To Ryan* Thank you. For my father. For everyone.' },
                    { speaker: 'Ryan', text: 'We did it together.' }
                ]);
                
                game.questManager.complete('infiltrate_facility');
                
                // Epilogue
                setTimeout(() => {
                    showEpilogue(game);
                }, 3000);
            }, 3000);
        }, 3000);
    }, 3000);
}

function showEpilogue(game) {
    game.setStoryPart(20);
    
    game.startDialogue([
        { speaker: '', text: '═══════════════════════════════════════' },
        { speaker: '', text: 'EPILOGUE' },
        { speaker: '', text: '═══════════════════════════════════════' },
        { speaker: '', text: '' },
        { speaker: '', text: 'Three months later.' },
        { speaker: '', text: '' },
        { speaker: 'Ryan', text: '*Back in my mancave. Coffee in hand. Radio frequencies humming.*' },
        { speaker: 'Ryan', text: 'Volkov is awaiting trial in Berlin. High-security wing.' },
        { speaker: 'Ryan', text: 'The evidence held up. Ironclad.' },
        { speaker: 'Ryan', text: 'ZERFALL never launched. Hamburg, Amsterdam, Berlin—all safe.' },
        { speaker: 'Ryan', text: '1.2 million people who don\'t know how close they came.' },
        { speaker: '', text: '' },
        { speaker: 'Ryan', text: 'Eva was promoted. Leads NATO\'s new cyber defense task force now.' },
        { speaker: 'Ryan', text: 'Chris Kubecka went back to Geneva. We email sometimes.' },
        { speaker: 'Ryan', text: 'She says hi. Asks if I need any more "exciting field work".' },
        { speaker: 'Ryan', text: 'David got his equipment back. Still drives that rusty Opel.' },
        { speaker: 'Ryan', text: 'Still complains about everything. Some things never change.' },
        { speaker: '', text: '' },
        { speaker: 'Ryan', text: '*Meshtastic device chirps*' },
        { speaker: '', text: '*Message from EVA_W: "Thanks again. -E"*' },
        { speaker: 'Ryan', text: '*Smiles. Types back: "Anytime."*' },
        { speaker: '', text: '' },
        { speaker: 'Ryan', text: 'Outside, the Dutch countryside is quiet.' },
        { speaker: 'Ryan', text: 'Agricultural land stretching to the horizon.' },
        { speaker: 'Ryan', text: 'My Volvo sits in the garden. License plate still Dutch.' },
        { speaker: 'Ryan', text: 'Still boxy. Still reliable. Still anonymous.' },
        { speaker: 'Ryan', text: 'Sometimes I still scan old frequencies.' },
        { speaker: 'Ryan', text: 'Listen to the static between stations.' },
        { speaker: 'Ryan', text: 'Sometimes I wonder what else is out there.' },
        { speaker: 'Ryan', text: 'What other operations are running right now.' },
        { speaker: '', text: '' },
        { speaker: 'Ryan', text: 'But tonight?' },
        { speaker: 'Ryan', text: 'Tonight I just drink my coffee.' },
        { speaker: 'Ryan', text: 'Check my radio gear.' },
        { speaker: 'Ryan', text: 'And know that, this time,' },
        { speaker: 'Ryan', text: 'We won.' },
        { speaker: '', text: '' },
        { speaker: '', text: '═══════════════════════════════════════' },
        { speaker: '', text: 'MISSION COMPLETE' },
        { speaker: '', text: '═══════════════════════════════════════' },
        { speaker: '', text: '' },
        { speaker: '', text: '[Continue for epilogue...]' }
    ]);
    
    // Transition to AIVD debrief
    setTimeout(() => {
        game.loadScene('debrief');
    }, 5000);
}
