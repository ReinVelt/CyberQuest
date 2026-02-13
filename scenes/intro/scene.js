/**
 * Intro Scene - Story Part 0
 * Prologue establishing Ryan's character and setting
 */

const IntroScene = {
    id: 'intro',
    name: 'Prologue',
    
    background: 'assets/images/scenes/intro.svg',
    
    description: 'A quiet morning in Compascuum, Drenthe. The world is about to change.',
    
    playerStart: { x: 50, y: 85 },
    
    idleThoughts: [],
    
    hotspots: [],
    
    onEnter: function(game) {
        // Hide ALL characters during prologue narration (including player)
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            charactersContainer.style.display = 'none';
        }
        
        // Disable voice for intro
        const originalVoiceState = game.voiceEnabled;
        game.voiceEnabled = false;
        
        // Hide dialogue box if visible
        const dialogueBox = document.getElementById('dialogue-box');
        if (dialogueBox) {
            dialogueBox.classList.add('hidden');
        }
        
        // Create scrolling intro overlay
        const introOverlay = document.createElement('div');
        introOverlay.id = 'intro-scroll';
        introOverlay.innerHTML = `
            <div class="intro-content">
                <div class="intro-spacer"></div>
                
                <div class="location-header">
                    <p>📍 COMPASCUUM, DRENTHE, NETHERLANDS</p>
                    <p>📅 February 9, 2026 | ⏰ 07:45 AM</p>
                </div>
                
                <p class="paragraph">Drenthe. Rural Netherlands. Quiet heathlands and canals. A province most people forget exists.</p>
                
                <p class="paragraph">But these fields hide something remarkable: the Westerbork Radio Telescope and LOFAR - over 50,000 antennas listening to the universe. The innovations developed here pioneered Bluetooth, WiFi mesh networks, and 5G beam-forming. Technology connecting five billion devices worldwide, rooted in these quiet northern fields.</p>
                
                <h2>⸻</h2>
                
                <p class="emphasis">Meet Ryan Weylant.</p>
                
                <p class="paragraph">55. Software developer. Radio enthusiast. Problem solver who never met a signal he couldn't decode or a puzzle he couldn't solve.</p>
                
                <p class="paragraph">He lives in a white farmhouse by the canal with his partner Ies and three dogs - Tino, Kessy, and ET the pug. They're still sleeping as Ryan starts his morning routine.</p>
                
                <p class="paragraph">His garage is where the magic happens. 3D printers, oscilloscopes, and component drawers line the walls. On his workbench: HackRF One SDR, Flipper Zero, WiFi Pineapple, Meshtastic LoRa devices, and an SSTV satellite terminal. Every tool chosen for a purpose.</p>
                
                <p class="paragraph">His network spans the country: Dr. David Prinsloo at TU Eindhoven, Cees Bassa at ASTRON, Jaap Haartsen who invented Bluetooth. When they have impossible problems, they call Ryan.</p>
                
                <p class="emphasis">His philosophy: Be curious. Stay methodical. Never give up.</p>
                
                <h2>⸻</h2>
                
                <p class="paragraph">This morning seems normal. Espresso machine warming up. Radio frequencies to check. Another routine day.</p>
                
                <p class="emphasis warning">He has no idea everything is about to change.</p>
                
                <p class="paragraph">In eighteen minutes, a transmission will arrive. A signal that shouldn't exist. Encrypted with algorithms no civilian should possess. Coordinates pointing to something impossible.</p>
                
                <p class="paragraph">A conspiracy at the highest levels. A secret nations have killed to protect.</p>
                
                <h2>⸻</h2>
                
                <p class="paragraph">In a bunker beneath The Hague, screens glow. AI systems monitor every frequency. People in dark suits have protocols. Assets. Methods that leave no trace.</p>
                
                <p class="emphasis">But they don't know about Ryan Weylant.</p>
                
                <p class="paragraph">They don't know what he's capable of.</p>
                
                <h2>⸻</h2>
                
                <h1 class="title">CYBERQUEST</h1>
                <h1 class="subtitle">OPERATION ZERFALL</h1>
                
                <div class="intro-end-spacer"></div>
                <p class="click-to-continue">Click to begin your mission...</p>
                <div class="intro-spacer"></div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.id = 'intro-scroll-style';
        style.textContent = `
            #intro-scroll {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: #000 !important;
                z-index: 9999 !important;
                overflow: hidden !important;
                color: #ffd700 !important;
                font-family: 'Arial', sans-serif !important;
                cursor: pointer !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            
            .intro-content {
                position: absolute !important;
                width: 90% !important;
                max-width: 1600px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                text-align: center !important;
                line-height: 2 !important;
                will-change: top !important;
                font-weight: bold !important;
                letter-spacing: 3px !important;
            }
            
            @keyframes introScroll {
                0% {
                    top: 100%;
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    top: -150%;
                    opacity: 0;
                }
            }
            
            .intro-spacer {
                height: 20vh;
            }
            
            .intro-end-spacer {
                height: 50vh;
            }
            
            .location-header {
                text-align: center;
                font-size: 1.2em;
                margin: 30px 0 40px 0;
                color: #4db8ff;
                letter-spacing: 3px;
                text-transform: uppercase;
                font-weight: bold;
            }
            
            .location-header p {
                margin: 8px 0;
            }
            
            .intro-content .paragraph {
                font-size: 1.5em;
                margin: 25px 0;
                line-height: 2;
                color: #ffd700;
            }
            
            .intro-content .emphasis {
                font-size: 1.8em;
                margin: 35px 0;
                color: #ffeb3b;
                text-align: center;
                font-style: italic;
                text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            }
            
            .intro-content .emphasis.warning {
                color: #ff4444;
                font-size: 2em;
                text-shadow: 0 0 30px rgba(255, 68, 68, 0.6);
            }
            
            .intro-content h2 {
                text-align: center;
                font-size: 1.8em;
                margin: 40px 0;
                color: #4db8ff;
                font-weight: normal;
                letter-spacing: 10px;
            }
            
            .intro-content h1.title {
                font-size: 3.5em;
                margin: 60px 0 20px 0;
                color: #4db8ff;
                text-transform: uppercase;
                letter-spacing: 15px;
                text-align: center;
                font-weight: bold;
                text-shadow: 0 0 40px rgba(77, 184, 255, 0.8);
            }
            
            .intro-content h1.subtitle {
                font-size: 2.2em;
                margin: 0 0 50px 0;
                color: #ffd700;
                text-transform: uppercase;
                letter-spacing: 10px;
                text-align: center;
                font-weight: normal;
                text-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
            }
            
            .click-to-continue {
                font-size: 1.4em !important;
                color: #4db8ff !important;
                text-align: center;
                animation: pulse 2s infinite;
                margin: 40px 0 !important;
                text-shadow: 0 0 20px rgba(77, 184, 255, 0.6);
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
            }
        `;
        document.head.appendChild(style);
        
        // Add to page
        document.body.appendChild(introOverlay);
        
        // Force animation to start after element is in DOM
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const content = introOverlay.querySelector('.intro-content');
                if (content) {
                    content.style.animation = 'introScroll 90s linear 0s 1 normal forwards';
                    console.log('Intro animation started:', {
                        element: content,
                        animation: window.getComputedStyle(content).animation,
                        top: window.getComputedStyle(content).top
                    });
                }
            });
        });
        
        // Click to skip to home scene
        introOverlay.addEventListener('click', () => {
            introOverlay.remove();
            
            // Remove style element
            const styleElement = document.getElementById('intro-scroll-style');
            if (styleElement) {
                styleElement.remove();
            }
            
            // Restore character visibility
            if (charactersContainer) {
                charactersContainer.style.display = '';
            }
            
            // Restore voice state
            game.voiceEnabled = originalVoiceState;
            
            // Transition to home scene
            game.loadScene('home');
        });
    },
    
    onExit: function(game) {
        // Clean up intro overlay if it exists
        const introOverlay = document.getElementById('intro-scroll');
        if (introOverlay) {
            introOverlay.remove();
        }
        
        // Clean up style element
        const styleElement = document.getElementById('intro-scroll-style');
        if (styleElement) {
            styleElement.remove();
        }
        
        // Ensure characters are visible when leaving intro scene
        const charactersContainer = document.getElementById('scene-characters');
        if (charactersContainer) {
            charactersContainer.style.display = '';
        }
    }
};

// Register scene
if (typeof window.game !== 'undefined') {
    window.game.registerScene(IntroScene);
}
