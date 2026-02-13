/**
 * TV Documentary Scene - Watching "Drenthe: The Unexpected Tech Hub"
 * A documentary about the pioneers who invented LOFAR, WSRT, and Bluetooth
 */

const TvdocumentaryScene = {
    id: 'tvdocumentary',
    name: 'TV Documentary',
    
    background: 'assets/images/scenes/tvdocumentary.svg',
    backgroundColor: '#000000',
    
    description: 'Watching a documentary about Drenthe\'s wireless technology pioneers.',
    
    playerStart: { x: 50, y: 85 },
    
    hotspots: [
        {
            id: 'skip_docu',
            name: '⏭ Skip Documentary',
            x: 2,
            y: 2,
            width: 15,
            height: 8,
            cursor: 'pointer',
            action: (game) => {
                // Remove documentary overlay
                const overlay = document.getElementById('docu-overlay');
                if (overlay) overlay.remove();
                
                const style = document.getElementById('docu-style');
                if (style) style.remove();
                
                game.setFlag('tv_documentary_watched', true);
                game.setFlag('documentary_completed_once', true);
                game.loadScene('livingroom');
            }
        }
    ],
    
    // Documentary sequence manager
    showDocumentaryOverlay: (game) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'docu-overlay';
        
        // Add styles
        const style = document.createElement('style');
        style.id = 'docu-style';
        style.textContent = `
            #docu-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                z-index: 8000;
                overflow: hidden;
                font-family: 'Arial', sans-serif;
            }
            
            .docu-screen {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transition: opacity 1s ease-in-out;
            }
            
            .docu-screen.active {
                opacity: 1;
            }
            
            .docu-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-size: cover;
                background-position: center;
                filter: brightness(0.7);
            }
            
            .docu-title-card {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                width: 90%;
                z-index: 10;
            }
            
            .docu-title-card h1 {
                font-size: 4em;
                color: #4db8ff;
                text-transform: uppercase;
                letter-spacing: 8px;
                margin: 0 0 30px 0;
                text-shadow: 0 0 40px rgba(77, 184, 255, 1), 0 0 80px rgba(77, 184, 255, 0.5);
                animation: titlePulse 3s ease-in-out infinite;
            }
            
            .docu-title-card h2 {
                font-size: 2.2em;
                color: #ffd700;
                letter-spacing: 4px;
                margin: 0;
                text-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
                animation: fadeInUp 2s ease-out 0.8s both;
            }
            
            .docu-chapter {
                position: absolute;
                top: 8%;
                left: 50%;
                transform: translateX(-50%) scale(0);
                font-size: 2.2em;
                color: #fff;
                text-transform: uppercase;
                letter-spacing: 5px;
                padding: 20px 50px;
                border: 4px solid #4db8ff;
                background: rgba(0, 20, 40, 0.95);
                backdrop-filter: blur(10px);
                box-shadow: 0 0 50px rgba(77, 184, 255, 0.6);
                animation: zoomIn 1s ease-out 0.3s forwards;
                z-index: 10;
            }
            
            .docu-character-scene {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            
            .docu-character {
                position: absolute;
                bottom: 0;
                left: 10%;
                opacity: 0;
                transform: translateX(-100px) scale(0.8);
                transition: all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                z-index: 5;
            }
            
            .docu-character.active {
                opacity: 1;
                transform: translateX(0) scale(1);
            }
            
            .docu-character img {
                height: 65vh;
                filter: drop-shadow(0 10px 40px rgba(0, 0, 0, 0.9));
            }
            
            .docu-nameplate {
                position: absolute;
                bottom: 20%;
                left: 35%;
                background: linear-gradient(135deg, rgba(0, 20, 60, 0.95), rgba(0, 40, 80, 0.95));
                padding: 20px 35px;
                border-left: 6px solid #ffd700;
                border-radius: 0 10px 10px 0;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
                transform: translateX(-100%);
                animation: slideInFromLeft 1s ease-out 0.5s forwards;
                z-index: 8;
                min-width: 400px;
            }
            
            .docu-nameplate h3 {
                font-size: 2.2em;
                color: #fff;
                margin: 0 0 8px 0;
                font-weight: bold;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            }
            
            .docu-nameplate p {
                font-size: 1.4em;
                color: #4db8ff;
                margin: 0;
                font-style: italic;
            }
            
            .docu-quote-bubble {
                position: absolute;
                bottom: 25%;
                right: 8%;
                width: 45%;
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(77, 184, 255, 0.15));
                backdrop-filter: blur(15px);
                padding: 30px 40px;
                border: 3px solid rgba(255, 215, 0, 0.5);
                border-radius: 20px;
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(255, 215, 0, 0.1);
                transform: scale(0) rotate(-5deg);
                animation: popIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.8s forwards;
                z-index: 9;
            }
            
            .docu-quote-bubble::before {
                content: '"';
                position: absolute;
                top: -20px;
                left: 20px;
                font-size: 6em;
                color: rgba(255, 215, 0, 0.3);
                font-family: Georgia, serif;
            }
            
            .docu-quote-bubble p {
                font-size: 1.7em;
                color: #fff;
                margin: 0;
                line-height: 1.6;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
                position: relative;
                z-index: 1;
            }
            
            .docu-text-overlay {
                position: absolute;
                bottom: 12%;
                left: 50%;
                transform: translateX(-50%);
                width: 75%;
                background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 80, 0.9));
                padding: 30px 50px;
                border-top: 4px solid #ffd700;
                border-bottom: 4px solid #4db8ff;
                box-shadow: 0 10px 50px rgba(0, 0, 0, 0.8);
                animation: slideUpFade 1s ease-out;
                z-index: 10;
            }
            
            .docu-text-overlay p {
                font-size: 1.8em;
                color: #fff;
                margin: 12px 0;
                line-height: 1.7;
                text-align: center;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
            }
            
            .docu-text-overlay a {
                display: inline-block;
                margin-top: 15px;
                padding: 12px 30px;
                background: rgba(77, 184, 255, 0.3);
                border: 2px solid #4db8ff;
                border-radius: 5px;
                text-decoration: none;
                transition: all 0.3s ease;
            }
            
            .docu-text-overlay a:hover {
                background: rgba(77, 184, 255, 0.6);
                transform: scale(1.05);
                box-shadow: 0 0 20px rgba(77, 184, 255, 0.8);
            }
            
            .docu-continue {
                position: absolute;
                bottom: 4%;
                right: 4%;
                font-size: 1.5em;
                color: #fff;
                background: linear-gradient(135deg, rgba(77, 184, 255, 0.8), rgba(77, 184, 255, 0.5));
                animation: pulse 2s infinite;
                cursor: pointer;
                padding: 15px 35px;
                border: 3px solid #4db8ff;
                border-radius: 8px;
                box-shadow: 0 5px 25px rgba(77, 184, 255, 0.5);
                z-index: 15;
                font-weight: bold;
                letter-spacing: 2px;
                transition: all 0.3s ease;
            }
            
            .docu-continue:hover {
                background: linear-gradient(135deg, rgba(77, 184, 255, 1), rgba(77, 184, 255, 0.8));
                transform: scale(1.1);
                box-shadow: 0 8px 35px rgba(77, 184, 255, 0.8);
            }
            
            @keyframes titlePulse {
                0%, 100% { 
                    text-shadow: 0 0 40px rgba(77, 184, 255, 1), 0 0 80px rgba(77, 184, 255, 0.5);
                }
                50% { 
                    text-shadow: 0 0 60px rgba(77, 184, 255, 1), 0 0 120px rgba(77, 184, 255, 0.8);
                }
            }
            
            @keyframes fadeInUp {
                from { 
                    opacity: 0;
                    transform: translate(-50%, 20px);
                }
                to { 
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
            
            @keyframes zoomIn {
                from {
                    transform: translateX(-50%) scale(0);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes slideInFromLeft {
                from { 
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to { 
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes popIn {
                0% {
                    transform: scale(0) rotate(-5deg);
                    opacity: 0;
                }
                70% {
                    transform: scale(1.1) rotate(2deg);
                }
                100% {
                    transform: scale(1) rotate(0deg);
                    opacity: 1;
                }
            }
            
            @keyframes slideUpFade {
                from { 
                    opacity: 0;
                    transform: translate(-50%, 50px);
                }
                to { 
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
            }
            
            @keyframes pulse {
                0%, 100% { 
                    opacity: 1;
                    box-shadow: 0 5px 25px rgba(77, 184, 255, 0.5);
                }
                50% { 
                    opacity: 0.8;
                    box-shadow: 0 8px 35px rgba(77, 184, 255, 0.8);
                }
            }
        `;
        document.head.appendChild(style);
        
        // Define documentary sequence
        const sequence = [
            {
                duration: 5000,
                background: 'assets/images/scenes/tvdocumentary.svg',
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdocumentary.svg');"></div>
                    <div class="docu-title-card">
                        <h1>🎬 DRENTHE: THE UNEXPECTED TECH HUB</h1>
                        <h2>A Documentary About Wireless Innovation</h2>
                    </div>
                `
            },
            {
                duration: 7000,
                background: 'assets/images/scenes/tvdoc_wsrt.svg',
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_wsrt.svg');"></div>
                    <div class="docu-chapter">📡 CHAPTER 1: MODERN ANTENNA TECHNOLOGY</div>
                    <div class="docu-text-overlay">
                        <p>The Netherlands has a rich history of radio astronomy...</p>
                        <p>From WSRT's massive dishes to cutting-edge digital antennas.</p>
                    </div>
                `
            },
            {
                duration: 8000,
                background: 'assets/images/scenes/tvdoc_interview.svg',
                character: 'david',
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg');"></div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/david_prinsloo_southpark.svg" alt="Dr. David Prinsloo">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <h3>Dr. David Prinsloo</h3>
                        <p>Antenna Engineer, TU Eindhoven</p>
                    </div>
                    <div class="docu-quote-bubble">
                        <p>"My specialty is phased array technology - thousands of small antennas working as one."</p>
                    </div>
                `
            },
            {
                duration: 7000,
                background: 'assets/images/scenes/tvdoc_interview.svg',
                character: 'david',
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg');"></div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/david_prinsloo_southpark.svg" alt="Dr. David Prinsloo">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <h3>Dr. David Prinsloo</h3>
                        <p>Antenna Engineer, TU Eindhoven</p>
                    </div>
                    <div class="docu-quote-bubble">
                        <p>"We're designing antennas for the lunar far side - radio telescopes on the moon."</p>
                    </div>
                `
            },
            {
                duration: 7000,
                background: 'assets/images/scenes/tvdoc_lofar.svg',
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_lofar.svg');"></div>
                    <div class="docu-chapter">🌐 CHAPTER 2: LOFAR - THE LOW-FREQUENCY ARRAY</div>
                    <div class="docu-text-overlay">
                        <p>Over 50,000 antennas across Europe.</p>
                        <p>Its core right here in Drenthe - listening to the cosmos.</p>
                    </div>
                `
            },
            {
                duration: 8000,
                background: 'assets/images/scenes/tvdoc_interview.svg',
                character: 'cees',
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg');"></div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/cees_bassa_southpark.svg" alt="Cees Bassa">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <h3>Cees Bassa</h3>
                        <p>ASTRON Scientist, LOFAR Team</p>
                    </div>
                    <div class="docu-quote-bubble">
                        <p>"We built the most advanced digital radio telescope on Earth. The genius is in the software."</p>
                    </div>
                `
            },
            {
                duration: 7000,
                background: 'assets/images/scenes/tvdoc_interview.svg',
                character: 'cees',
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg');"></div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/cees_bassa_southpark.svg" alt="Cees Bassa">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <h3>Cees Bassa</h3>
                        <p>ASTRON Scientist, LOFAR Team</p>
                    </div>
                    <div class="docu-quote-bubble">
                        <p>"We can point the telescope anywhere - without moving a single antenna!"</p>
                    </div>
                `
            },
            {
                duration: 7000,
                background: 'assets/images/scenes/tvdoc_bluetooth.svg',
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_bluetooth.svg');"></div>
                    <div class="docu-chapter">📱 CHAPTER 3: BLUETOOTH - CONNECTING THE WORLD</div>
                    <div class="docu-text-overlay">
                        <p>In 1994, a Dutch engineer invented a revolutionary protocol.</p>
                        <p>His name: Jaap Haartsen. His invention: Bluetooth.</p>
                    </div>
                `
            },
            {
                duration: 9000,
                background: 'assets/images/scenes/tvdoc_interview.svg',
                character: 'jaap',
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdoc_interview.svg');"></div>
                    <div class="docu-character-scene">
                        <div class="docu-character">
                            <img src="assets/images/characters/jaap_haartsen_southpark.svg" alt="Jaap Haartsen">
                        </div>
                    </div>
                    <div class="docu-nameplate">
                        <h3>Jaap Haartsen</h3>
                        <p>Inventor of Bluetooth</p>
                    </div>
                    <div class="docu-text-overlay">
                        <p>Today, over 5 billion Bluetooth devices ship annually worldwide.</p>
                        <p><a href="https://www.youtube.com/watch?v=IAHM4SoT3eY" target="_blank">🎥 Watch Real Interview →</a></p>
                    </div>
                `
            },
            {
                duration: 6000,
                background: 'assets/images/scenes/tvdocumentary.svg',
                content: `
                    <div class="docu-bg" style="background-image: url('assets/images/scenes/tvdocumentary.svg');"></div>
                    <div class="docu-title-card">
                        <h1>THE DRENTHE LEGACY</h1>
                        <h2>Sometimes genius lives in the Dutch countryside.</h2>
                    </div>
                `
            }
        ];
        
        let currentStep = 0;
        
        const showStep = () => {
            if (currentStep >= sequence.length) {
                // Documentary finished
                setTimeout(() => {
                    overlay.remove();
                    style.remove();
                    game.setFlag('tv_documentary_watched', true);
                    game.setFlag('documentary_completed_once', true);
                    
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Incredible documentary. Those engineers are remarkable.' },
                        { speaker: 'Ryan', text: 'Now I really need to check my radio equipment.' }
                    ]);
                    
                    setTimeout(() => {
                        game.loadScene('livingroom');
                    }, 3000);
                }, 1000);
                return;
            }
            
            const step = sequence[currentStep];
            
            // Create screen
            const screen = document.createElement('div');
            screen.className = 'docu-screen';
            screen.innerHTML = step.content;
            
            // Add continue button
            const continueBtn = document.createElement('div');
            continueBtn.className = 'docu-continue';
            continueBtn.textContent = '▶ CONTINUE';
            continueBtn.onclick = () => {
                screen.style.opacity = '0';
                setTimeout(() => {
                    screen.remove();
                    currentStep++;
                    showStep();
                }, 500);
            };
            screen.appendChild(continueBtn);
            
            overlay.appendChild(screen);
            
            // Trigger animations after DOM insertion
            setTimeout(() => {
                screen.classList.add('active');
                
                // Animate character if present
                const character = screen.querySelector('.docu-character');
                if (character) {
                    setTimeout(() => character.classList.add('active'), 300);
                }
            }, 100);
            
            // Auto-advance
            setTimeout(() => {
                if (screen.parentElement) {
                    continueBtn.click();
                }
            }, step.duration);
        };
        
        document.body.appendChild(overlay);
        showStep();
    },
    
    
    onEnter: (game) => {
        // Hide player during documentary (they're sitting watching)
        if (game.player) {
            game.player.hide();
        }
        
        // Start animated documentary
        if (!game.getFlag('tv_documentary_watched')) {
            setTimeout(() => {
                TvdocumentaryScene.showDocumentaryOverlay(game);
            }, 500);
        } else {
            // Already watched - show short recap
            game.startDialogue([
                { speaker: 'Ryan', text: 'I\'ve already seen this documentary.' },
                { speaker: 'Ryan', text: 'Those engineers are incredible. Time to get back to work.' }
            ]);
            setTimeout(() => {
                game.loadScene('livingroom');
            }, 2000);
        }
    },
    
    onExit: (game) => {
        // Show player again when exiting
        if (game.player) {
            game.player.show();
        }
    }
};

// Register the scene
if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(TvdocumentaryScene);
}
