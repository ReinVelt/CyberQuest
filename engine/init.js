// Game Initialization
// Extracted from index.html to comply with Content-Security-Policy script-src 'self'

let game = null;

// Loading progress simulation
const loadingProgress = document.getElementById('loading-progress');
const loadingStatus = document.getElementById('loading-status');
const loadingScreen = document.getElementById('loading-screen');
const titleScreen = document.getElementById('title-screen');

const loadingSteps = [
    { progress: 20, status: 'Loading engine...' },
    { progress: 40, status: 'Initializing scenes...' },
    { progress: 60, status: 'Loading assets...' },
    { progress: 80, status: 'Configuring systems...' },
    { progress: 100, status: 'Ready!' }
];

let currentStep = 0;

function updateLoading() {
    if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        loadingProgress.style.width = step.progress + '%';
        loadingStatus.textContent = step.status;
        currentStep++;

        if (currentStep < loadingSteps.length) {
            setTimeout(updateLoading, 400);
        } else {
            setTimeout(showTitleScreen, 500);
        }
    }
}

function showTitleScreen() {
    loadingScreen.classList.add('hidden');
    titleScreen.classList.add('visible');

    // Check for saved game (autosave slot takes priority over legacy slot)
    const savedGame = localStorage.getItem('cyberquest_autosave') || localStorage.getItem('cyberquest_save');
    if (savedGame) {
        document.getElementById('btn-continue').disabled = false;
    }
}

function initGame() {
    // Initialize game engine
    game = new CyberQuestEngine();

    // Make game globally accessible
    window.game = game;

    // Register all scenes
    game.registerScene(IntroScene);
    game.registerScene(HomeScene);
    game.registerScene(LivingroomScene);
    game.registerScene(TvdocumentaryScene);
    game.registerScene(TvnewsScene);
    game.registerScene(MancaveScene);
    game.registerScene(LaptopScene);
    game.registerScene(SstvTerminalScene);
    game.registerScene(SecurePhoneScene);
    game.registerScene(AirgappedLaptopScene);
    game.registerScene(PlanboardScene);
    game.registerScene(RegionalMapScene);
    game.registerScene(VideocallScene);
    game.registerScene(GardenScene);
    game.registerScene(GardenBackScene);
    game.registerScene(SitMowerScene);
    game.registerScene(KloosterScene);
    game.registerScene(UsbDiscoveryScene);
    game.registerScene(CarDiscoveryScene);
    game.registerScene(DrivingScene);
    game.registerScene(DrivingDayScene);
    game.registerScene(DwingelooScene);
    game.registerScene(SdrBenchScene);
    game.registerScene(WesterborkMemorialScene);
    game.registerScene(AstronScene);
    game.registerScene(WsrtParkingScene);
    game.registerScene(PlanetenpadScene);
    game.registerScene(LofarScene);
    game.registerScene(FacilityScene);
    game.registerScene(FacilityInteriorScene);
    game.registerScene(LaserCorridorScene);
    game.registerScene(FacilityServerScene);
    game.registerScene(LongNightScene);
    game.registerScene(BedroomScene);
    game.registerScene(DroneHuntScene);
    game.registerScene(DebriefScene);
    game.registerScene(ReturnToMaxScene);
    game.registerScene(MorningAfterScene);
    game.registerScene(EpilogueScene);
    game.registerScene(HackerspaceScene);
    game.registerScene(HackerspaceClassroomScene);
    game.registerScene(CreditsScene);

    // Initialize the game
    game.init();
}

function startNewGame() {
    titleScreen.classList.remove('visible');

    // Clear any existing save
    localStorage.removeItem('cyberquest_autosave');
    localStorage.removeItem('cyberquest_save');

    // Clear URL hash so loadGameState() inside init() does not
    // race against our explicit loadScene('intro') call below.
    window.location.hash = '';

    // Initialize and start
    initGame();

    // Load starting scene (intro prologue)
    game.loadScene('intro');
}

function continueGame() {
    titleScreen.classList.remove('visible');

    // Clear URL hash so loadGameState() inside init() does not
    // interfere with loadGame() restoring the proper saved scene.
    window.location.hash = '';

    // Initialize game
    initGame();

    // Load saved state
    game.loadGame();

    game.showNotification('Game loaded successfully');
}

function showAbout() {
    // Render changelog dynamically from engine/changelog.js
    const container = document.getElementById('about-changelog');
    if (container && typeof CYBERQUEST_CHANGELOG !== 'undefined' && !container._rendered) {
        container._rendered = true;
        container.innerHTML = CYBERQUEST_CHANGELOG.map((entry, i) => {
            const versionColor = i === 0 ? '#00ff88' : '#777';
            const itemColor   = i === 0 ? '#00cc55' : '';
            const itemStyle   = itemColor ? ` style="color:${itemColor}"` : '';
            const topMargin   = i === 0 ? '' : ' style="margin-top:6px"';
            return [
                `<div${topMargin} style="color:${versionColor}${i > 0 ? ';margin-top:6px' : ''};margin-bottom:${i === 0 ? '4' : '0'}px">${entry.version} — ${entry.date}</div>`,
                ...entry.items.map(item => `<div${itemStyle}>• ${item}</div>`),
            ].join('');
        }).join('');
    }
    document.getElementById('about-modal').style.display = 'flex';
}

function hideAbout() {
    document.getElementById('about-modal').style.display = 'none';
}

// Event listeners
document.getElementById('btn-new-game').addEventListener('click', startNewGame);
document.getElementById('btn-continue').addEventListener('click', continueGame);
document.getElementById('btn-about').addEventListener('click', showAbout);
document.getElementById('close-about').addEventListener('click', hideAbout);
document.getElementById('about-modal').addEventListener('click', (e) => {
    if (e.target.id === 'about-modal') hideAbout();
});

// Debug help hint
console.log('%c🛠️ DEBUG MODE: Press D key in-game to open debug panel', 'color: #00ff88; font-size: 14px; font-weight: bold;');

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideAbout();
    }
});

// Start loading sequence when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateLoading, 300);
});
