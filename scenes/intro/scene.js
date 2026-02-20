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
                    <p class="glitch-text">📍 COMPASCUUM, DRENTHE, NETHERLANDS</p>
                    <p class="fade-in-text">📅 February 9, 2026 | ⏰ 07:45 AM</p>
                </div>
                
                <p class="paragraph fade-in">The province everyone forgets.</p>
                
                <p class="paragraph fade-in">Drenthe. Rural Netherlands. Quiet heathlands stretching to the horizon. Ancient dolmens. Narrow canals reflecting morning clouds.</p>
                
                <p class="paragraph emphasis-glow">But beneath this peaceful surface lies something extraordinary.</p>
                
                <p class="paragraph fade-in">Hidden in these fields: the Westerbork Radio Telescope. LOFAR's 50,000 antennas. Listening posts that pierce the cosmos itself.</p>
                
                <p class="paragraph fade-in">The innovations born here revolutionized our world. Bluetooth. WiFi mesh networks. 5G beam-forming algorithms. Technology connecting five billion devices worldwide—all rooted in these forgotten northern fields.</p>
                
                <h2 class="divider">⸻ ✦ ⸻</h2>
                
                <p class="emphasis name-reveal">Meet Ryan Weylant.</p>
                
                <p class="paragraph fade-in">Age 55. Software architect. Radio specialist. Hacker in the truest sense.</p>
                
                <p class="paragraph fade-in">A man who never met a signal he couldn't decode. A puzzle he couldn't solve. A system he couldn't break.</p>
                
                <p class="paragraph fade-in">Home: a white farmhouse by the canal. Partner: Ies, sleeping peacefully upstairs. Three dogs—Tino, Kessy, and ET the pug—curled in their beds, unaware of what's coming.</p>
                
                <p class="paragraph emphasis-glow">His garage is his sanctuary.</p>
                
                <p class="paragraph fade-in">3D printers humming softly. Oscilloscopes tracing invisible waves. Component drawers organized with obsessive precision.</p>
                
                <p class="paragraph fade-in">On his workbench: HackRF One SDR. Flipper Zero. WiFi Pineapple. Meshtastic LoRa nodes. SSTV satellite terminal. Every tool hand-selected. Every capability considered.</p>
                
                <p class="paragraph fade-in">His network spans the nation's brightest minds: Dr. David Prinsloo at TU Eindhoven. Cees Bassa at ASTRON. Jaap Haartsen—the inventor of Bluetooth itself.</p>
                
                <p class="paragraph fade-in">When they face impossible problems, they call Ryan.</p>
                
                <p class="emphasis philosophy">His philosophy: <span class="emphasis-glow">Be curious. Stay methodical. Never surrender.</span></p>
                
                <h2 class="divider pulse-slow">⸻ ✦ ⸻</h2>
                
                <p class="paragraph fade-in">This morning feels ordinary.</p>
                
                <p class="paragraph fade-in">Espresso machine warming. Radio frequencies cycling through the spectrum. Another day in paradise.</p>
                
                <p class="emphasis warning pulse-fast">He has absolutely no idea.</p>
                
                <p class="paragraph warning-text">In eighteen minutes, everything changes.</p>
                
                <p class="paragraph warning-text">A transmission will arrive that shouldn't exist. Encrypted with algorithms no civilian should possess. Coordinates pointing to a location that's supposed to be abandoned.</p>
                
                <p class="paragraph emphasis-glow">A conspiracy at the highest levels of power.</p>
                
                <p class="paragraph warning-text">A secret nations have killed to protect.</p>
                
                <h2 class="divider pulse-slow">⸻ ✦ ⸻</h2>
                
                <p class="paragraph sinister">Deep beneath The Hague, in a bunker that doesn't officially exist:</p>
                
                <p class="paragraph sinister">Screens glow in the darkness. AI systems monitor every frequency. Every transmission. Every anomaly.</p>
                
                <p class="paragraph sinister">People in dark suits have protocols. Response teams on standby. Assets embedded across the country.</p>
                
                <p class="paragraph sinister">Methods refined over decades. Methods that leave no trace.</p>
                
                <p class="emphasis warning pulse-fast">But they don't know about Ryan Weylant.</p>
                
                <p class="paragraph emphasis-glow">They don't know what he's capable of when pushed.</p>
                
                <p class="paragraph emphasis-glow">They don't realize they've just made their first mistake.</p>
                
                <p class="paragraph emphasis-glow">Their last mistake.</p>
                
                <h2 class="divider pulse-slow">⸻ ✦ ⸻</h2>
                
                <div class="title-container">
                    <h1 class="title glitch-text">CYBERQUEST</h1>
                    <h1 class="subtitle pulse-glow">OPERATION ZERFALL</h1>
                    <p class="tagline">The truth is hidden in the signal.</p>
                </div>
                
                <div class="intro-end-spacer"></div>
                <p class="click-to-continue pulse-fast">▶ Click to begin your mission ◀</p>
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
                background: radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%) !important;
                z-index: 9999 !important;
                overflow: hidden !important;
                color: #ffd700 !important;
                font-family: 'Courier New', monospace !important;
                cursor: pointer !important;
                display: block !important;
                transition: opacity 4s ease-in-out !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            
            #intro-scroll::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    repeating-linear-gradient(
                        0deg,
                        rgba(0, 255, 255, 0.03) 0px,
                        transparent 1px,
                        transparent 2px,
                        rgba(0, 255, 255, 0.03) 3px
                    );
                pointer-events: none;
                animation: scanlines 8s linear infinite;
            }
            
            @keyframes scanlines {
                0% { transform: translateY(0); }
                100% { transform: translateY(10px); }
            }
            
            .intro-content {
                position: absolute !important;
                width: 90% !important;
                max-width: 1400px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                text-align: center !important;
                line-height: 2.2 !important;
                will-change: top !important;
                font-weight: bold !important;
                letter-spacing: 2px !important;
            }
            
            @keyframes introScroll {
                0% {
                    top: 30%;
                    opacity: 1;
                }
                95% {
                    opacity: 1;
                }
                100% {
                    top: -300%;
                    opacity: 1;
                }
            }
            
            .intro-spacer {
                height: 2vh;
            }
            
            .intro-end-spacer {
                height: 50vh;
            }
            
            .location-header {
                text-align: center;
                font-size: 1.3em;
                margin: 30px 0 50px 0;
                color: #00ffff;
                letter-spacing: 4px;
                text-transform: uppercase;
                font-weight: bold;
            }
            
            .location-header p {
                margin: 12px 0;
                text-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
            }
            
            .intro-content .paragraph {
                font-size: 1.6em;
                margin: 30px auto;
                line-height: 2.2;
                color: #e0e0e0;
                max-width: 1200px;
                text-shadow: 0 0 10px rgba(224, 224, 224, 0.3);
            }
            
            .intro-content .paragraph.fade-in {
                animation: fadeIn 2s ease-in;
            }
            
            @keyframes fadeIn {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            
            .intro-content .emphasis {
                font-size: 2.2em;
                margin: 45px 0;
                color: #ffeb3b;
                text-align: center;
                font-style: italic;
                text-shadow: 0 0 30px rgba(255, 235, 59, 0.7);
                font-weight: bold;
                letter-spacing: 3px;
            }
            
            .intro-content .emphasis.name-reveal {
                font-size: 2.8em;
                color: #00ffff;
                text-shadow: 0 0 40px rgba(0, 255, 255, 0.8);
                animation: glow 3s ease-in-out infinite;
            }
            
            .intro-content .emphasis.philosophy {
                font-size: 2em;
                color: #4db8ff;
                font-style: normal;
            }
            
            .intro-content .emphasis-glow {
                color: #ffd700;
                text-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
                font-weight: bold;
            }
            
            .intro-content .emphasis.warning {
                color: #ff3333;
                font-size: 2.4em;
                text-shadow: 0 0 50px rgba(255, 51, 51, 0.9);
                animation: pulse-warning 2s ease-in-out infinite;
            }
            
            .intro-content .warning-text {
                color: #ff6666;
                text-shadow: 0 0 20px rgba(255, 102, 102, 0.6);
            }
            
            .intro-content .sinister {
                color: #9999ff;
                text-shadow: 0 0 15px rgba(153, 153, 255, 0.5);
                font-style: italic;
            }
            
            @keyframes pulse-warning {
                0%, 100% { 
                    text-shadow: 0 0 30px rgba(255, 51, 51, 0.6);
                    transform: scale(1);
                }
                50% { 
                    text-shadow: 0 0 60px rgba(255, 51, 51, 1);
                    transform: scale(1.05);
                }
            }
            
            @keyframes glow {
                0%, 100% { 
                    text-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
                }
                50% { 
                    text-shadow: 0 0 60px rgba(0, 255, 255, 1);
                }
            }
            
            .intro-content h2.divider {
                text-align: center;
                font-size: 2.5em;
                margin: 60px 0;
                color: #4db8ff;
                font-weight: normal;
                letter-spacing: 20px;
                text-shadow: 0 0 30px rgba(77, 184, 255, 0.6);
            }
            
            .intro-content h2.pulse-slow {
                animation: glow 4s ease-in-out infinite;
            }
            
            .title-container {
                margin: 80px 0;
            }
            
            .intro-content h1.title {
                font-size: 4.5em;
                margin: 70px 0 30px 0;
                color: #00ffff;
                text-transform: uppercase;
                letter-spacing: 25px;
                text-align: center;
                font-weight: bold;
                text-shadow: 0 0 60px rgba(0, 255, 255, 1);
                animation: title-glow 3s ease-in-out infinite;
            }
            
            @keyframes title-glow {
                0%, 100% { 
                    text-shadow: 0 0 40px rgba(0, 255, 255, 0.8),
                                 0 0 80px rgba(0, 255, 255, 0.4);
                }
                50% { 
                    text-shadow: 0 0 80px rgba(0, 255, 255, 1),
                                 0 0 120px rgba(0, 255, 255, 0.6);
                }
            }
            
            .intro-content h1.subtitle {
                font-size: 2.6em;
                margin: 0 0 30px 0;
                color: #ffd700;
                text-transform: uppercase;
                letter-spacing: 15px;
                text-align: center;
                font-weight: normal;
                text-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
            }
            
            .intro-content .subtitle.pulse-glow {
                animation: glow 2.5s ease-in-out infinite;
            }
            
            .intro-content .tagline {
                font-size: 1.6em;
                color: #ffeb3b;
                font-style: italic;
                margin-top: 20px;
                text-shadow: 0 0 20px rgba(255, 235, 59, 0.6);
                letter-spacing: 3px;
            }
            
            .glitch-text {
                animation: glitch 5s infinite;
            }
            
            @keyframes glitch {
                0%, 90%, 100% {
                    transform: translate(0);
                }
                92% {
                    transform: translate(-2px, 2px);
                }
                94% {
                    transform: translate(2px, -2px);
                }
                96% {
                    transform: translate(-1px, 1px);
                }
                98% {
                    transform: translate(1px, -1px);
                }
            }
            
            .click-to-continue {
                font-size: 1.8em !important;
                color: #00ffff !important;
                text-align: center;
                margin: 50px 0 !important;
                text-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
                font-weight: bold;
                letter-spacing: 4px;
            }
            
            .pulse-fast {
                animation: pulse-fast 1.5s ease-in-out infinite;
            }
            
            @keyframes pulse-fast {
                0%, 100% { 
                    opacity: 1;
                    transform: scale(1);
                }
                50% { 
                    opacity: 0.6;
                    transform: scale(1.05);
                }
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
                    content.style.animation = 'introScroll 120s linear 0s 1 normal forwards';
                    console.log('Intro animation started:', {
                        element: content,
                        animation: window.getComputedStyle(content).animation,
                        top: window.getComputedStyle(content).top
                    });
                }
            });
        });
        
        // Phase tracking: false = scroller showing, true = background revealed
        let scrollerDone = false;

        // Click handler — two phases
        introOverlay.addEventListener('click', () => {
            if (scrollerDone) return; // ignore clicks during fade
            scrollerDone = true;

            // Phase 1: fade out the dark scroller to reveal SVG background
            introOverlay.style.opacity = '0';
            introOverlay.style.pointerEvents = 'none';

            setTimeout(() => {
                // Remove scroller and its styles
                introOverlay.remove();
                const styleElement = document.getElementById('intro-scroll-style');
                if (styleElement) styleElement.remove();

                // Show a dark veil over the background that fades out,
                // plus a "click to continue" prompt
                const bgPrompt = document.createElement('div');
                bgPrompt.id = 'intro-bg-prompt';
                bgPrompt.innerHTML = `
                    <div class="ibp-inner">
                        <div class="ibp-location">📍 Compascuum, Drenthe</div>
                        <div class="ibp-click">▶ &nbsp; CLICK TO CONTINUE</div>
                    </div>`;
                bgPrompt.style.cssText = [
                    'position:fixed', 'inset:0', 'z-index:9998',
                    'background:rgba(0,0,0,0.85)',
                    'display:flex', 'align-items:center', 'justify-content:center',
                    'cursor:pointer',
                    'transition:background 3s ease-out'
                ].join(';');

                // Inner text styles injected via a tiny style block
                const ps = document.createElement('style');
                ps.id = 'intro-prompt-style';
                ps.textContent = `
                    #intro-bg-prompt .ibp-inner {
                        text-align: center;
                        font-family: 'Courier New', monospace;
                        color: #ffffffcc;
                        user-select: none;
                    }
                    #intro-bg-prompt .ibp-location {
                        font-size: 1.1em;
                        letter-spacing: 4px;
                        color: #80ccdd;
                        margin-bottom: 28px;
                        opacity: 0;
                        animation: ibpFadeIn 2s ease-out 1.5s forwards;
                    }
                    #intro-bg-prompt .ibp-click {
                        font-size: 1.5em;
                        letter-spacing: 6px;
                        font-weight: bold;
                        color: #ffffff;
                        opacity: 0;
                        animation: ibpFadeIn 1.5s ease-out 2.5s forwards,
                                   ibpPulse 2s ease-in-out 4s infinite;
                    }
                    @keyframes ibpFadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes ibpPulse {
                        0%,100% { opacity: 1; }
                        50%     { opacity: 0.45; }
                    }
                `;
                document.head.appendChild(ps);
                document.body.appendChild(bgPrompt);

                // Slowly lift the dark veil to reveal the scene
                requestAnimationFrame(() => {
                    bgPrompt.style.background = 'rgba(0,0,0,0.0)';
                });

                // Phase 2: click anywhere to continue to home
                bgPrompt.addEventListener('click', () => {
                    bgPrompt.style.transition = 'opacity 0.6s ease-in';
                    bgPrompt.style.opacity = '0';
                    setTimeout(() => {
                        bgPrompt.remove();
                        document.getElementById('intro-prompt-style')?.remove();
                        if (charactersContainer) charactersContainer.style.display = '';
                        game.voiceEnabled = originalVoiceState;
                        game.loadScene('home');
                    }, 650);
                });

            }, 4100); // wait for 4s transition + tiny buffer
        });
    },
    
    onExit: function(game) {
        // Clean up all intro elements
        document.getElementById('intro-scroll')?.remove();
        document.getElementById('intro-scroll-style')?.remove();
        document.getElementById('intro-bg-prompt')?.remove();
        document.getElementById('intro-prompt-style')?.remove();

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
