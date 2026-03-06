/**
 * CyberQuest - Core Game Engine
 * Sierra-style adventure game engine
 */

/** @type {Object} Engine configuration constants */
const ENGINE_CONFIG = Object.freeze({
    TRANSITION_DURATION: 500,
    SCENE_CHANGE_DELAY: 300,
    INVENTORY_AUTO_CLOSE: 2000,
    TYPEWRITER_SPEED: 40,
    NOTIFICATION_DURATION: 3000,
    NOTIFICATION_FADE: 500,
    DEFAULT_TIME: '08:00',
    DEFAULT_DAY: 1,
    HOURS_IN_DAY: 24,
    MINUTES_IN_HOUR: 60,
});

/**
 * Scene → clock mapping.
 * When entering a scene the game clock is set to at least this value.
 * If the current clock is already past this time (player explored freely),
 * the clock is NOT wound backwards — only forward jumps are applied.
 * Scenes not listed here leave the clock unchanged.
 */
const SCENE_TIME_MAP = Object.freeze({
    // ── Day 1 — Monday Feb 9 ──
    intro:                { day: 1, time: '07:27' },
    home:                 { day: 1, time: '07:45' },
    livingroom:           { day: 1, time: '08:00' },
    tvdocumentary:        { day: 1, time: '08:15' },
    mancave:              { day: 1, time: '09:00' },
    sstv_terminal:        { day: 1, time: '11:00' },
    sdr_bench:            { day: 1, time: '16:15' },
    garden:               { day: 1, time: '17:00' },
    garden_back:          { day: 1, time: '17:00' },
    klooster:             { day: 1, time: '22:55' },
    usb_discovery:        { day: 1, time: '22:55' },
    car_discovery:        { day: 1, time: '23:15' },

    // ── Day 2 — Tuesday Feb 10 ──
    dwingeloo:            { day: 2, time: '11:00' },
    westerbork_memorial:  { day: 2, time: '12:00' },
    hackerspace:          { day: 2, time: '13:00' },
    hackerspace_classroom:{ day: 2, time: '13:30' },
    astron:               { day: 2, time: '15:30' },
    lofar:                { day: 2, time: '16:00' },
    facility:             { day: 2, time: '21:47' },
    facility_interior:    { day: 2, time: '22:06' },
    laser_corridor:       { day: 2, time: '22:07' },
    facility_server:      { day: 2, time: '22:08' },

    // ── Day 3 — Wednesday Feb 11 ──
    long_night:           { day: 3, time: '01:00' },
    debrief:              { day: 3, time: '11:00' },
    return_to_max:        { day: 3, time: '20:00' },
    morning_after:        { day: 4, time: '08:00' },

    // ── Epilogue — May 2026 ──
    epilogue:             { day: 90, time: '14:00' },
});

/**
 * Utility: attach both click and touchend handlers to an element.
 * @param {HTMLElement} el
 * @param {Function} handler
 */
function addInteractionHandler(el, handler) {
    if (!el) return;
    el.addEventListener('click', handler);
    el.addEventListener('touchend', handler);
}

class CyberQuestEngine {
    /**
     * @param {Object} [deps] - Optional dependency overrides for testing
     * @param {Object} [deps.voiceManager]
     * @param {Function} [deps.PlayerCharacter]
     * @param {Function} [deps.EvidenceViewer]
     * @param {Function} [deps.PasswordPuzzle]
     * @param {Function} [deps.ChatInterface]
     * @param {Storage} [deps.storage] - Storage backend (default: localStorage)
     */
    constructor(deps = {}) {
        this.currentScene = null;
        this.scenes = {};
        this.inventory = [];
        this._defaultGameState = Object.freeze({
            storyPart: 0,
            questsCompleted: [],
            activeQuests: [],
            flags: {},
            evidence: [],
            evidenceViewed: [],
            time: ENGINE_CONFIG.DEFAULT_TIME,
            day: ENGINE_CONFIG.DEFAULT_DAY
        });
        this._saveVersion = 2; // Bump when save format changes
        this.gameState = JSON.parse(JSON.stringify(this._defaultGameState));
        this.dialogueQueue = [];
        this.isDialogueActive = false;
        this.isPuzzleActive = false;
        this.initialized = false;
        this._sceneLoading = false;
        this.voiceEnabled = true;
        this.voiceManager = null;
        this.player = null;
        this.evidenceViewer = null;
        this.passwordPuzzle = null;
        this.chatInterface = null;
        this.typewriterAbortController = null;
        this.isPaused = false;
        this._autoAdvanceTimer = null;
        
        // Dependency injection for testing
        this._deps = deps;
        this._storage = deps.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
        
        // Track event handlers for cleanup
        this._boundHandlers = [];
        
        // Track scene-scoped timeouts — auto-cleared on scene exit
        this._sceneTimeouts = [];

        // Mutable per-session settings (mirrors ENGINE_CONFIG defaults)
        this.settings = {
            textSpeed:         40,  // ms per character (0 = instant)
            animSpeed:        500,  // ms for scene fade transitions (0 = none)
            autoAdvanceDelay:   0,  // ms before auto-advancing dialogue (0 = manual)
            docuPauseDuration: 1500, // ms pause after documentary speech finishes
            accessibilityMode: false, // 🎬 Movie mode — auto-plays story path, voices and puzzles
        };

        // Accessibility mode runner state
        this.accessibilityMode = false;
        this._accessibilityRunnerActive = false;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        // Create DOM structure
        this.createGameContainer();
        this._loadSettings();
        this._applySettings();
        this.bindEvents();
        this.loadGameState();
        
        // Initialize voice manager (ensure it's connected)
        this.voiceManager = this._resolveDep('voiceManager', 'voiceManager');
        if (this.voiceManager) {
            console.log('Voice system connected');
        } else {
            console.warn('Voice system not available');
        }
        
        // Initialize player character
        this.initPlayer();
        
        // Initialize evidence viewer
        const EvidenceViewerClass = this._resolveDep('EvidenceViewer', 'EvidenceViewer');
        if (EvidenceViewerClass) {
            this.evidenceViewer = new EvidenceViewerClass(this);
            console.log('Evidence viewer initialized');
        }
        
        // Initialize password puzzle system
        const PasswordPuzzleClass = this._resolveDep('PasswordPuzzle', 'PasswordPuzzle');
        if (PasswordPuzzleClass) {
            this.passwordPuzzle = new PasswordPuzzleClass(this);
            console.log('Password puzzle system initialized');
        }
        
        // Initialize chat interface
        const ChatInterfaceClass = this._resolveDep('ChatInterface', 'ChatInterface');
        if (ChatInterfaceClass) {
            this.chatInterface = new ChatInterfaceClass(this);
            console.log('Chat interface initialized');
        }
        
        console.log('CyberQuest Engine initialized');
    }
    
    /**
     * Resolve a dependency: if explicitly provided (even as null), use it;
     * otherwise fall back to the window global.
     */
    _resolveDep(depKey, globalKey) {
        if (depKey in this._deps) return this._deps[depKey];
        return (typeof window !== 'undefined' ? window[globalKey] : null) || null;
    }

    initPlayer() {
        const PlayerCharacterClass = this._resolveDep('PlayerCharacter', 'PlayerCharacter');
        if (PlayerCharacterClass) {
            this.player = new PlayerCharacterClass(this);
            this.player.init();
            console.log('Player character initialized');
        }
    }
    
    createGameContainer() {
        const container = document.getElementById('game-container');
        if (!container) {
            console.error('Game container not found');
            return;
        }
        
        container.innerHTML = `
            <div id="game-top-bar">
                <div id="inventory-bar">
                    <div id="inventory-toggle">
                        <span class="icon">🎒</span>
                        <span class="label">Inventory</span>
                    </div>
                    <div id="inventory-items" class="hidden"></div>
                </div>
                <div id="time-display">
                    <span id="game-day">Day 1</span>
                    <span id="game-time">08:00</span>
                </div>
                <div id="quest-log">
                    <div id="quest-toggle">
                        <span class="icon">📋</span>
                        <span class="label">Quests</span>
                    </div>
                    <div id="quest-list" class="hidden"></div>
                </div>
            </div>
            <div id="scene-wrapper">
                <div id="scene-container">
                    <div id="scene-background"></div>
                    <div id="scene-hotspots"></div>
                    <div id="scene-characters"></div>
                    <div id="scene-transition-overlay">
                        <div class="trans-curtain"></div>
                        <div class="trans-sweep"></div>
                        <div class="trans-flash"></div>
                    </div>
                    <div id="ui-overlay">
                        <div id="dialogue-box" class="hidden">
                            <div id="dialogue-portrait"></div>
                            <div id="dialogue-content">
                                <div id="dialogue-speaker"></div>
                                <div id="dialogue-text"></div>
                            </div>
                            <div id="dialogue-continue">Click to continue...</div>
                        </div>
                    </div>
                    <div id="puzzle-overlay" class="hidden">
                        <div id="puzzle-container"></div>
                    </div>
                </div>
            </div>
            <div id="game-bottom-bar">
                <div id="game-menu">
                    <button id="menu-pause" title="Pause / Resume (P)">⏸️ Pause</button>
                    <button id="menu-voice" title="Toggle Voice">🔊 Voice</button>
                    <button id="menu-movie" title="Toggle Movie / Accessibility Mode">🎬 Movie</button>
                    <button id="menu-hint" title="What to do next (H)" style="background:rgba(255,200,0,0.12);border-color:#ffcc00;color:#ffcc00;">💡 Hint</button>
                    <button id="menu-save">💾 Save</button>
                    <button id="menu-load">📂 Load</button>
                    <button id="menu-settings">⚙️ Settings</button>
                </div>
            </div>
            <div id="pause-overlay" class="hidden">
                <div id="pause-content">
                    <div id="pause-icon">⏸️</div>
                    <div id="pause-title">PAUSED</div>
                    <div id="pause-hint">Click here or press P to resume</div>
                </div>
            </div>
            <div id="notification-area"></div>
            <div id="accessibility-badge" class="hidden">🎬 Movie Mode</div>
        `;
    }
    
    /**
     * Register a global event handler and track it for cleanup.
     * @param {EventTarget} target
     * @param {string} event
     * @param {Function} handler
     * @param {Object} [options]
     */
    _addTrackedListener(target, event, handler, options) {
        target.addEventListener(event, handler, options);
        this._boundHandlers.push({ target, event, handler, options });
    }
    
    bindEvents() {
        // Dialogue continuation (click and touch)
        const handleDialogueInteraction = (e) => {
            if (this.isPaused) return;
            if (this.isDialogueActive && e.target.closest('#dialogue-box')) {
                e.preventDefault();
                this.advanceDialogue();
            }
        };
        this._addTrackedListener(document, 'click', handleDialogueInteraction);
        this._addTrackedListener(document, 'touchend', handleDialogueInteraction);
        
        // Scene interaction for walking (click and touch)
        const handleSceneInteraction = (e) => {
            // Don't walk if paused, clicking on UI, hotspots, or during dialogue/puzzle
            if (this.isPaused) return;
            if (this.isDialogueActive || this.isPuzzleActive) return;
            if (e.target.closest('.hotspot')) return;
            if (e.target.closest('#ui-overlay')) return;
            if (e.target.closest('#game-top-bar')) return;
            if (e.target.closest('#game-bottom-bar')) return;
            
            e.preventDefault();
            
            // Calculate position as percentage
            const sceneContainer = document.getElementById('scene-container');
            if (!sceneContainer) return;
            const rect = sceneContainer.getBoundingClientRect();
            
            // Handle both touch and mouse events — use changedTouches for touchend
            const touch = e.touches?.[0] || e.changedTouches?.[0];
            const clientX = touch ? touch.clientX : e.clientX;
            const clientY = touch ? touch.clientY : e.clientY;
            
            const x = ((clientX - rect.left) / rect.width) * 100;
            const y = ((clientY - rect.top) / rect.height) * 100;
            
            // Walk to position
            if (this.player) {
                this.player.walkTo(x, y);
            }
        };
        const sceneEl = document.getElementById('scene-container');
        if (sceneEl) {
            this._addTrackedListener(sceneEl, 'click', handleSceneInteraction);
            this._addTrackedListener(sceneEl, 'touchstart', handleSceneInteraction);
        }
        
        // Inventory toggle (click and touch)
        const inventoryToggle = document.getElementById('inventory-toggle');
        const toggleInventory = (e) => {
            e.preventDefault();
            document.getElementById('inventory-items')?.classList.toggle('hidden');
        };
        inventoryToggle?.addEventListener('click', toggleInventory);
        inventoryToggle?.addEventListener('touchend', toggleInventory);
        
        // Quest log toggle (click and touch)
        const questToggle = document.getElementById('quest-toggle');
        const toggleQuest = (e) => {
            e.preventDefault();
            document.getElementById('quest-list')?.classList.toggle('hidden');
        };
        questToggle?.addEventListener('click', toggleQuest);
        questToggle?.addEventListener('touchend', toggleQuest);
        
        // Menu buttons (click and touch)
        const addButtonHandler = (id, handler) => {
            const btn = document.getElementById(id);
            const wrappedHandler = (e) => { e.preventDefault(); handler(); };
            btn?.addEventListener('click', wrappedHandler);
            btn?.addEventListener('touchend', wrappedHandler);
        };
        addButtonHandler('menu-pause',    () => this.togglePause());
        addButtonHandler('menu-save',     () => this.openSaveSlotModal('save'));
        addButtonHandler('menu-load',     () => this.openSaveSlotModal('load'));
        addButtonHandler('menu-voice',    () => this.toggleVoice());
        addButtonHandler('menu-movie',    () => this.toggleAccessibilityMode());
        addButtonHandler('menu-hint',     () => this.showHint());
        addButtonHandler('menu-settings', () => this.openSettingsModal());
        
        // Pause overlay — click to resume
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            const resumeHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.isPaused) this.togglePause();
            };
            pauseOverlay.addEventListener('click', resumeHandler);
            pauseOverlay.addEventListener('touchend', resumeHandler);
        }
        
        // Keyboard shortcuts
        const keyHandler = (e) => {
            // Pause toggle — always available (P or Escape when paused)
            if (e.key === 'p' || e.key === 'P') {
                if (!this.isDialogueActive && !this.isPuzzleActive) {
                    this.togglePause();
                }
                return;
            }
            // Escape unpauses if paused, otherwise closes puzzle
            if (e.key === 'Escape') {
                if (this.isPaused) {
                    this.togglePause();
                    return;
                }
                this.closePuzzle();
                return;
            }
            // Block all other keys while paused
            if (this.isPaused) return;
            
            if (e.key === 'i' || e.key === 'I') {
                document.getElementById('inventory-items')?.classList.toggle('hidden');
            }
            if (e.key === ' ' && this.isDialogueActive) {
                this.advanceDialogue();
            }
            if (e.key === 'v' || e.key === 'V') {
                this.toggleVoice();
            }
            // Debug panel toggle (D key)
            if (e.key === 'd' || e.key === 'D') {
                if (!this.isDialogueActive && !this.isPuzzleActive) {
                    this.toggleDebugPanel();
                }
            }
            // Hint (H key)
            if (e.key === 'h' || e.key === 'H') {
                if (!this.isPuzzleActive) this.showHint();
            }
        };
        this._addTrackedListener(document, 'keydown', keyHandler);
    }
    
    // Scene Management
    registerScene(sceneOrId, sceneData = null) {
        // Support both registerScene(sceneObj) and registerScene(id, sceneData)
        if (typeof sceneOrId === 'object' && sceneOrId.id) {
            this.scenes[sceneOrId.id] = sceneOrId;
            console.log(`Scene registered: ${sceneOrId.id}`);
        } else if (sceneData) {
            this.scenes[sceneOrId] = sceneData;
            console.log(`Scene registered: ${sceneOrId}`);
        }
    }
    
    async loadScene(sceneId, transition = 'fade', { skipAutoSave = false } = {}) {
        // Auto-resume if paused when changing scenes
        if (this.isPaused) this.togglePause();
        
        const scene = this.scenes[sceneId];
        if (!scene) {
            console.error(`Scene not found: ${sceneId}`);
            return;
        }
        
        // Guard against overlapping scene loads
        if (this._sceneLoading) {
            console.warn(`Scene load already in progress, ignoring request for: ${sceneId}`);
            return;
        }
        this._sceneLoading = true;
        
        try {
        // Clear all scene-scoped timeouts before leaving
        this.clearSceneTimeouts();
        
        // Call onExit for the current scene before leaving
        if (this.currentScene && this.scenes[this.currentScene] && this.scenes[this.currentScene].onExit) {
            try {
                this.scenes[this.currentScene].onExit(this);
            } catch (err) {
                console.error(`Error in onExit for scene ${this.currentScene}:`, err);
            }
        }
        
        const sceneContainer = document.getElementById('scene-container');
        if (!sceneContainer) {
            console.error('Scene container not found');
            return;
        }
        
        // ── Cinematic transition out ──
        const overlay = document.getElementById('scene-transition-overlay');
        if (transition === 'fade' && overlay) {
            // Phase 1: darken + zoom-out old scene
            overlay.className = 'cine-out';
            sceneContainer.classList.add('cine-out');
            await this.wait(900);

            // Phase 2: hold at black with light sweep
            overlay.className = 'cine-hold';
            sceneContainer.style.opacity = '0';
            await this.wait(350);
        } else if (transition === 'fade') {
            sceneContainer.classList.add('fade-out');
            await this.wait(this.settings.animSpeed);
        }
        
        this.currentScene = sceneId;

        // Advance the game clock to match this scene's timeline
        this._applySceneClock(sceneId);
        
        // Auto-save on every scene transition (silent — no notification)
        // Skip during loadGame() to avoid redundant write
        if (!skipAutoSave) {
            this.saveGame(true);
        }
        
        // Load background
        const bgElement = document.getElementById('scene-background');
        
        // Remove old scene classes
        bgElement.className = '';
        
        // Add scene-specific CSS class for placeholder graphics
        bgElement.classList.add(`scene-${sceneId}`);
        bgElement.setAttribute('data-scene-name', scene.name || sceneId);
        
        if (scene.background) {
            bgElement.style.backgroundImage = `url('${scene.background}')`;
            bgElement.style.backgroundSize = '100% 100%';
            bgElement.style.backgroundRepeat = 'no-repeat';
            bgElement.style.backgroundPosition = 'center';
        } else {
            bgElement.style.backgroundImage = 'none';
        }
        if (scene.backgroundColor) {
            bgElement.style.backgroundColor = scene.backgroundColor;
        }
        
        // Load hotspots
        this.loadHotspots(scene.hotspots || []);
        
        // Set up player for this scene
        if (this.player) {
            // Set player position (entry point or default center-bottom)
            const startX = scene.playerStart?.x ?? 50;
            const startY = scene.playerStart?.y ?? 85;
            this.player.setPosition(startX, startY);
            
            // Set scene-specific idle thoughts
            if (scene.idleThoughts) {
                this.player.setIdleThoughts(scene.idleThoughts);
            }
            
            // Show or hide player based on scene settings
            if (scene.hidePlayer) {
                this.player.hide();
            } else {
                this.player.show();
            }
        }
        
        // Execute scene entry script
        if (scene.onEnter) {
            try {
                scene.onEnter(this);
            } catch (err) {
                console.error(`Error in onEnter for scene ${sceneId}:`, err);
            }
        }
        
        // ── Cinematic transition in ──
        if (transition === 'fade' && overlay) {
            // Prepare new scene slightly zoomed-in & bright
            sceneContainer.classList.remove('cine-out');
            sceneContainer.style.opacity = '';
            sceneContainer.classList.add('cine-in');

            // Phase 3: reveal new scene from black
            overlay.className = 'cine-in';
            // Force a reflow so the starting state (cine-in) is painted
            void sceneContainer.offsetWidth;
            sceneContainer.classList.add('cine-in-play');
            await this.wait(1000);

            // Cleanup
            sceneContainer.classList.remove('cine-in', 'cine-in-play');
            overlay.className = '';
        } else if (transition === 'fade') {
            sceneContainer.classList.remove('fade-out');
            sceneContainer.classList.add('fade-in');
            await this.wait(this.settings.animSpeed);
            sceneContainer.classList.remove('fade-in');
        }
        
        // Update URL hash for navigation
        if (typeof window !== 'undefined') {
            window.location.hash = sceneId;
        }
        
        console.log(`Scene loaded: ${sceneId}`);

        // 🎬 Accessibility mode: start the auto-play runner for this scene
        if (this.accessibilityMode && scene.accessibilityPath?.length) {
            // Give onEnter() and any scene-start dialogue a moment to settle
            setTimeout(() => this._startAccessibilityRunner(scene), 1500);
        }
        } finally {
            this._sceneLoading = false;
        }
    }
    
    loadHotspots(hotspots) {
        const container = document.getElementById('scene-hotspots');
        if (!container) {
            console.error('Hotspot container not found');
            return;
        }
        container.innerHTML = '';
        
        hotspots.forEach(hotspot => {
            // Skip hotspots that are explicitly hidden
            if (hotspot.visible === false) {
                return;
            }
            
            const element = document.createElement('div');
            element.className = 'hotspot';
            element.id = `hotspot-${hotspot.id}`;
            element.style.left = `${hotspot.x}%`;
            element.style.top = `${hotspot.y}%`;
            element.style.width = `${hotspot.width}%`;
            element.style.height = `${hotspot.height}%`;
            
            // Support custom CSS classes (e.g. 'hotspot-nav' for visible nav buttons)
            // Split on whitespace so callers can pass multiple classes in one string.
            if (hotspot.cssClass) {
                element.classList.add(...hotspot.cssClass.trim().split(/\s+/));
            }
            
            if (hotspot.cursor) {
                element.style.cursor = hotspot.cursor;
            }
            
            // Tooltip
            if (hotspot.name) {
                element.setAttribute('data-tooltip', hotspot.name);
            }
            
            // Icon image (for tool overlays)
            if (hotspot.icon) {
                const img = document.createElement('img');
                img.src = hotspot.icon;
                img.alt = hotspot.name || '';
                element.appendChild(img);
            }
            
            // Label text (for tool overlays)
            if (hotspot.label) {
                const lbl = document.createElement('span');
                lbl.className = 'tool-label';
                lbl.textContent = hotspot.label;
                element.appendChild(lbl);
            }
            
            // Click and touch handlers
            const handleHotspotInteraction = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleHotspotClick(hotspot);
            };
            addInteractionHandler(element, handleHotspotInteraction);
            
            container.appendChild(element);
        });
    }
    
    handleHotspotClick(hotspot) {
        if (this.isPaused || this.isDialogueActive || this.isPuzzleActive) return;
        
        // Check 'enabled' property (function or boolean)
        if (hotspot.enabled !== undefined) {
            const isEnabled = typeof hotspot.enabled === 'function' ? hotspot.enabled(this) : hotspot.enabled;
            if (!isEnabled) {
                if (hotspot.disabledMessage) {
                    this.playerThink(hotspot.disabledMessage);
                }
                return;
            }
        }
        
        // Check conditions
        if (hotspot.condition && !this.checkCondition(hotspot.condition)) {
            if (hotspot.failMessage) {
                this.playerThink(hotspot.failMessage);
            }
            return;
        }
        
        // Calculate hotspot center position for walking
        const targetX = hotspot.x + (hotspot.width / 2);
        const targetY = Math.min(hotspot.y + hotspot.height, 90); // Stay in walkable area
        
        // Walk to the hotspot, then execute action
        if (this.player && !hotspot.skipWalk) {
            this.player.walkTo(targetX, targetY, () => {
                this.executeHotspotAction(hotspot);
            });
        } else {
            this.executeHotspotAction(hotspot);
        }
    }
    
    executeHotspotAction(hotspot) {
        // If lookMessage exists, Ryan thinks out loud
        if (hotspot.lookMessage) {
            const message = typeof hotspot.lookMessage === 'function' 
                ? hotspot.lookMessage(this) 
                : hotspot.lookMessage;
            this.playerThink(message);
        }
        
        // Support 'interactions' pattern used by some scenes
        if (hotspot.interactions) {
            const interaction = hotspot.interactions.look || hotspot.interactions.use || hotspot.interactions.default;
            if (typeof interaction === 'function') {
                interaction(this);
                return; // interactions pattern handles its own actions
            }
        }
        
        // Execute action
        if (hotspot.action) {
            hotspot.action(this);
        }
        
        // Navigate to scene
        if (hotspot.targetScene) {
            // Short delay for scene transitions
            setTimeout(() => {
                this.loadScene(hotspot.targetScene);
            }, this.settings.animSpeed ? ENGINE_CONFIG.SCENE_CHANGE_DELAY : 0);
        }
        
        // Collect item
        if (hotspot.item) {
            this.addToInventory(hotspot.item);
        }
        
        // Start dialogue
        if (hotspot.dialogue) {
            this.startDialogue(hotspot.dialogue);
        }
        
        // Start puzzle
        if (hotspot.puzzle) {
            this.startPuzzle(hotspot.puzzle);
        }
    }
    
    // Player thinks out loud
    playerThink(thought) {
        if (this.player) {
            this.player.think(thought);
        } else {
            // Fallback to notification if player not available
            this.showNotification(thought);
        }
    }
    
    // Inventory System
    addToInventory(item) {
        if (!item || !item.id) {
            console.error('addToInventory: item must have an id', item);
            return;
        }
        if (!this.inventory.find(i => i.id === item.id)) {
            this.inventory.push(item);
            this.updateInventoryUI();
            this.showNotification(`Added to inventory: ${item.name || item.id}`);
            
            // Auto-open inventory briefly
            const inventoryItems = document.getElementById('inventory-items');
            if (inventoryItems) {
                inventoryItems.classList.remove('hidden');
                setTimeout(() => inventoryItems.classList.add('hidden'), ENGINE_CONFIG.INVENTORY_AUTO_CLOSE);
            }
        }
    }
    
    removeFromInventory(itemId) {
        this.inventory = this.inventory.filter(i => i.id !== itemId);
        this.updateInventoryUI();
    }
    
    hasItem(itemId) {
        return this.inventory.some(i => i.id === itemId);
    }
    
    updateInventoryUI() {
        const container = document.getElementById('inventory-items');
        if (!container) return;
        container.innerHTML = '';
        
        if (this.inventory.length === 0) {
            container.innerHTML = '<div class="inventory-empty">No items</div>';
            return;
        }
        
        this.inventory.forEach(item => {
            const element = document.createElement('div');
            element.className = 'inventory-item';
            element.innerHTML = `
                <img src="${item.icon || 'assets/images/icons/item-default.svg'}" alt="${item.name}">
                <span class="item-name">${item.name}</span>
            `;
            element.setAttribute('data-tooltip', item.description || item.name);
            const useItemHandler = (e) => {
                e.preventDefault();
                this.useItem(item);
            };
            addInteractionHandler(element, useItemHandler);
            container.appendChild(element);
        });
    }
    
    useItem(item) {
        if (item.onUse) {
            item.onUse(this);
        } else {
            this.showNotification(`You look at the ${item.name}.`);
        }
    }
    
    // Dialogue System
    startDialogue(dialogue, onComplete) {
        if (!dialogue) {
            console.error('startDialogue: dialogue is required');
            return;
        }
        this.dialogueQueue = Array.isArray(dialogue) ? [...dialogue] : [dialogue];
        this._dialogueCallback = typeof onComplete === 'function' ? onComplete : null;
        this.isDialogueActive = true;
        const dialogueBox = document.getElementById('dialogue-box');
        if (dialogueBox) dialogueBox.classList.remove('hidden');
        this.showCurrentDialogue();
    }
    
    // Simplified dialogue method - accepts array of strings and speaker name
    showDialogue(lines, speaker = 'Ryan') {
        const dialogue = lines.map(text => ({ speaker, text }));
        this.startDialogue(dialogue);
    }
    
    showCurrentDialogue() {
        if (this.dialogueQueue.length === 0) {
            this.endDialogue();
            return;
        }
        
        // Abort any ongoing typewriter effect
        if (this.typewriterAbortController) {
            this.typewriterAbortController.abort();
        }
        this.typewriterAbortController = new AbortController();
        
        const current = this.dialogueQueue[0];
        const speakerEl = document.getElementById('dialogue-speaker');
        const textEl = document.getElementById('dialogue-text');
        const portraitEl = document.getElementById('dialogue-portrait');
        
        if (!speakerEl || !textEl) {
            console.error('Dialogue DOM elements not found');
            this.endDialogue();
            return;
        }
        
        const speaker = current.speaker || 'Ryan';
        speakerEl.textContent = speaker;
        if (portraitEl) {
            // Auto-derive portrait from speaker name if not explicitly set
            const PORTRAIT_MAP = {
                'ryan':           'assets/images/characters/ryan_southpark.svg',
                'eva':            'assets/images/characters/eva_southpark.svg',
                'ies':            'assets/images/characters/ies_southpark.svg',
                'cees bassa':     'assets/images/characters/cees_bassa_southpark.svg',
                'cees':           'assets/images/characters/cees_bassa_southpark.svg',
                'volkov':         'assets/images/characters/volkov_southpark.svg',
                'david prinsloo': 'assets/images/characters/david_prinsloo_southpark.svg',
                'david':          'assets/images/characters/david_prinsloo_southpark.svg',
                'kubecka':        'assets/images/characters/kubecka_southpark.svg',
                'jaap haartsen':  'assets/images/characters/jaap_haartsen_southpark.svg',
                'jaap':           'assets/images/characters/jaap_haartsen_southpark.svg',
                'vandeberg':      'assets/images/characters/vandeberg_southpark.svg',
                // Hackerspace characters
                'dennis':         'assets/images/characters/hacker_male_2_southpark.svg',
                'sophie':         'assets/images/characters/hacker_female_1_southpark.svg',
                'marco':          'assets/images/characters/hacker_male_1_southpark.svg',
                'kim':            'assets/images/characters/hacker_female_4_southpark.svg',
                'joris':          'assets/images/characters/hacker_male_3_southpark.svg',
                'linda':          'assets/images/characters/hacker_female_2_southpark.svg',
                'pieter':         'assets/images/characters/hacker_male_4_southpark.svg',
                'aisha':          'assets/images/characters/hacker_female_3_southpark.svg',
                'wouter':         'assets/images/characters/presenter_male_southpark.svg',
                'marieke':        'assets/images/characters/presenter_female_southpark.svg',
            };
            const portraitPath = current.portrait ||
                PORTRAIT_MAP[speaker.toLowerCase()] || '';
            portraitEl.style.backgroundImage = portraitPath ? `url('${portraitPath}')` : 'none';
        }
        
        // Execute action callback if provided (for visual changes, etc.)
        if (current.action && typeof current.action === 'function') {
            current.action(this);
        }
        
        // Typewriter effect + speech in parallel; auto-advance waits for both
        // Sync the HUD clock if this line mentions a specific time
        this._syncClockToText(current.text || '');

        // ── *italic* narrator convention ──────────────────────────────────
        // If the entire text (or any segment) is wrapped in *…* it is spoken
        // by the Narrator voice. Strip the asterisks for display and override
        // the speaker label so the UI and TTS both reflect the narrator.
        let displayText = current.text || '';
        let effectiveSpeaker = speaker;
        const _isNarratorLine = /^\s*\*[^*]+\*\s*$/.test(displayText);
        if (_isNarratorLine) {
            displayText = displayText.replace(/^\s*\*|\*\s*$/g, '').trim();
            effectiveSpeaker = 'Narrator';
            speakerEl.textContent = 'Narrator';
        }

        const _twSignal = this.typewriterAbortController.signal;
        const typePromise = this.typeText(textEl, displayText, this.settings.textSpeed, _twSignal);
        const speechPromise = this.speakText(displayText, effectiveSpeaker);

        Promise.all([typePromise, speechPromise]).then(() => {
            if (_twSignal.aborted || !this.isDialogueActive) return;
            if (this.accessibilityMode) {
                // 🎬 Movie mode: auto-advance immediately after TTS finishes
                if (!this.isPaused) this.advanceDialogue();
            } else if (this.settings.autoAdvanceDelay > 0) {
                this._autoAdvanceTimer = setTimeout(() => {
                    if (this.isDialogueActive && !this.isPaused) this.advanceDialogue();
                }, this.settings.autoAdvanceDelay);
            }
        });
    }
    
    async typeText(element, text, speed = 30, signal = null) {
        element.textContent = '';
        try {
            for (let i = 0; i < text.length; i++) {
                if (signal && signal.aborted) {
                    return;
                }
                element.textContent += text[i];
                await this.wait(speed);
            }
        } catch (error) {
            // Abort or other error - just stop typing
            return;
        }
    }
    
    advanceDialogue() {
        // Clear any pending auto-advance timer
        if (this._autoAdvanceTimer) { clearTimeout(this._autoAdvanceTimer); this._autoAdvanceTimer = null; }
        // Stop current speech when advancing
        this.stopSpeech();
        
        // Abort any ongoing typewriter effect
        if (this.typewriterAbortController) {
            this.typewriterAbortController.abort();
        }
        
        this.dialogueQueue.shift();
        if (this.dialogueQueue.length > 0) {
            this.showCurrentDialogue();
        } else {
            this.endDialogue();
        }
    }
    
    endDialogue() {
        if (this._autoAdvanceTimer) { clearTimeout(this._autoAdvanceTimer); this._autoAdvanceTimer = null; }
        this.isDialogueActive = false;
        this.stopSpeech();
        
        // Abort any ongoing typewriter effect
        if (this.typewriterAbortController) {
            this.typewriterAbortController.abort();
            this.typewriterAbortController = null;
        }
        
        const dialogueBox = document.getElementById('dialogue-box');
        if (dialogueBox) dialogueBox.classList.add('hidden');
        
        // Fire completion callback if set
        const cb = this._dialogueCallback;
        this._dialogueCallback = null;
        if (cb) cb(this);
    }
    
    // Voice System Methods
    speakText(text, speaker = '') {
        if (!this.voiceManager) {
            this.voiceManager = window.voiceManager;
        }
        if (this.voiceEnabled && this.voiceManager) {
            // Ensure text is a string
            const textStr = typeof text === 'string' ? text : String(text);
            console.log(`Speaking: "${textStr.substring(0, 50)}..." as ${speaker || 'Narrator'}`);
            return this.voiceManager.speak(textStr, speaker);
        }
        return Promise.resolve();
    }

    /**
     * Speak text and wait for speech to finish (plus optional extra pause).
     * Use this in cinematic sequences to ensure timing stays in sync with voice.
     * @param {string} text - Text to speak
     * @param {string} speaker - Character name
     * @param {number} [minDuration=0] - Minimum ms to wait (even if speech is shorter)
     * @returns {Promise<void>}
     */
    async speakAndWait(text, speaker = '', minDuration = 0) {
        const speechPromise = this.speakText(text, speaker);
        const timerPromise = minDuration > 0 ? this.wait(minDuration) : Promise.resolve();
        await Promise.all([speechPromise, timerPromise]);
    }
    
    stopSpeech() {
        if (this.voiceManager) {
            this.voiceManager.stop();
        }
    }

    // ── Hint system ──────────────────────────────────────────────────────────

    /**
     * Show the next contextual hint spoken by the Narrator voice.
     * Called via the 💡 Hint button or H key.
     */
    showHint() {
        const hint = this.getNextHint();
        if (!hint) return;
        this.startDialogue([{ speaker: 'Narrator', text: '*' + hint + '*' }]);
    }

    /**
     * Returns a story-aware hint string based on current game state.
     * Ordered so the most immediately relevant hint fires first.
     */
    getNextHint() {
        const sp  = this.gameState.storyPart;
        const f   = (k) => !!this.getFlag(k);
        const hour = this.gameState.time ? parseInt(this.gameState.time.split(':')[0], 10) : 8;
        const day  = this.gameState.day || 1;

        // ── Night-time sleep reminder (highest priority) ──────────────────
        const dayKey = 'slept_day_' + day;
        if ((hour >= 22 || hour === 0 || hour === 1) && !f(dayKey) && this.currentScene !== 'bedroom') {
            return 'It is getting late and Ryan is exhausted. Head to the bedroom and get some sleep. Tomorrow will be a long day.';
        }

        // ── Day 1: Morning ────────────────────────────────────────────────
        if (sp === 0 || !f('game_started')) {
            return 'Good morning. Start by making espresso — Ryan never skips coffee. Click on the espresso machine in the kitchen.';
        }
        if (!f('made_espresso')) {
            return 'Click on the espresso machine in the kitchen to brew Ryan\'s morning coffee.';
        }
        if (!f('visited_livingroom')) {
            return 'Coffee made. Go to the living room through the door on the right. Something might be on TV this morning.';
        }
        if (!f('tv_documentary_watched')) {
            return 'Turn on the television in the living room. There is a documentary about Drenthe and the radio telescopes worth watching.';
        }
        if (!f('visited_mancave') || sp < 2) {
            return 'Go to the mancave — the door in the kitchen with the skull sticker. Ryan\'s SDR radio and computer are in there.';
        }
        if (!f('frequency_tuned') || !f('military_frequency')) {
            return 'Open the SDR radio receiver in the mancave and scan the frequencies. There is unusual activity on a restricted military band.';
        }
        if (!f('sstv_transmission_received')) {
            return 'Keep monitoring the military frequency. An SSTV transmission is incoming — a slow-scan TV image encoded in radio.';
        }
        if (!f('first_message_decoded')) {
            return 'An SSTV image was received. Open the SSTV decoder and decode the image. There is a hidden message inside.';
        }
        if (!f('second_message_decoded')) {
            return 'A second transmission is expected on the same frequency. Keep monitoring. Someone is making contact via shortwave radio.';
        }
        if (!f('sstv_decoded') || !f('sstv_coordinates_known')) {
            return 'Analyse the decoded SSTV images at the SDR bench. GPS coordinates are embedded in the transmission.';
        }
        if (!f('klooster_unlocked') && !f('visited_planboard')) {
            return 'Check the planboard in the mancave to review what you know. The coordinates point somewhere specific.';
        }
        if (!f('klooster_unlocked')) {
            return 'The coordinates lead to Klooster Ter Apel, a medieval monastery in south Drenthe. The message says 23:00 tonight. Be there.';
        }

        // ── Day 1: Night drive ────────────────────────────────────────────
        if (!f('visited_garden')) {
            return 'It is time to go. Walk through the garden to the car. The Klooster is about an hour\'s drive south.';
        }
        if (!f('found_usb_stick') || !f('picked_up_usb')) {
            return 'You are at the Klooster. Look carefully around your Volvo in the car park. Someone may have left something on the car.';
        }
        if (!f('usb_analyzed')) {
            return 'You found a USB stick taped to your car. Do NOT plug it into any networked machine. Use the air-gapped laptop in the mancave for safety.';
        }

        // ── Day 2: Morning investigation ──────────────────────────────────
        if (!f('evidence_unlocked') || !f('viewed_schematics')) {
            return 'The USB stick is full of files. Open the evidence viewer in the mancave and study the schematics carefully. What is this device?';
        }
        if (!f('started_ally_search')) {
            return 'The schematics show a weapons-grade signal jammer. This is serious. Ryan needs allies. Start reaching out through the mancave comms.';
        }
        if (!f('cees_contacted')) {
            return 'Contact Cees Bassa at ASTRON in Dwingeloo. He works with the Westerbork radio telescope and will recognise the frequencies.';
        }
        if (!f('jaap_contacted')) {
            return 'Contact Jaap Haartsen — the inventor of Bluetooth. His expertise in wireless protocols may be key to understanding the device.';
        }
        if (!f('all_allies_contacted') || !f('contacted_allies')) {
            return 'Keep reaching out to your network. Each contact has a piece of the puzzle. Check the mancave communications panel.';
        }
        if (!f('volkov_investigated')) {
            return 'Investigate Volkov using the darkweb search tools in the mancave. His background connects to the Steckerdoser Heide research history.';
        }
        if (!f('contacted_kubecka')) {
            return 'Jan Kubecka at ASTRON has access to the signal interference logs. Contact him — he may know where these transmissions originate.';
        }
        if (!f('identified_eva')) {
            return 'Analyse the photographs in the USB evidence. One face keeps appearing. Use the facial recognition tool to identify this person.';
        }
        if (!f('eva_contacted')) {
            return 'You identified Eva Weber — a signals engineer placed inside the German facility. Make secure contact with her via the encrypted channel.';
        }

        // ── Day 2: Field operations ───────────────────────────────────────
        if (!f('visited_dwingeloo')) {
            return 'Drive to the Dwingeloo radio telescope. Someone placed a relay transmitter near the dish to hijack its frequency band.';
        }
        if (!f('dwingeloo_transmitter_found')) {
            return 'Search around the base of the Dwingeloo telescope carefully. The relay transmitter will be small and well camouflaged.';
        }
        if (!f('visited_westerbork_memorial')) {
            return 'Head to the Westerbork Memorial. The Zerfall network has a hidden Bluetooth surveillance node somewhere on the grounds.';
        }
        if (!f('westerbork_bt_cracked') || !f('zerfall_network_mapped')) {
            return 'Inspect the camera installation at Westerbork. Use your Flipper Zero to crack its Bluetooth encryption and map the Zerfall network nodes.';
        }
        if (!f('visited_hackerspace')) {
            return 'Visit Hackerspace Drenthe in Coevorden. The local hacker community may have observed the strange frequency activity.';
        }
        if (!f('astron_unlocked') || !f('visited_astron')) {
            return 'Drive to ASTRON. Cees Bassa is ready to help use the Westerbork Synthesis Radio Telescope to triangulate the signal source.';
        }
        if (!f('schematics_verified') || !f('signal_triangulated')) {
            return 'Work with Cees at ASTRON. Feed the device schematics into the telescope analysis software to pinpoint the transmitter location.';
        }

        // ── Day 2: Infiltration ───────────────────────────────────────────
        if (!f('facility_unlocked') || !f('drove_to_facility')) {
            return 'The signal is coming from a research compound at Steckerdoser Heide just across the German border. Drive there tonight. Go dark.';
        }
        if (!f('badge_cloned')) {
            return 'At the facility perimeter, use your Flipper Zero to scan and clone the RFID security badge from a guard. You need it to pass the gate.';
        }
        if (!f('entered_facility')) {
            return 'Badge cloned. Approach the gate carefully and use the cloned credential to enter the facility grounds.';
        }
        if (!f('facility_password_solved')) {
            return 'Inside the facility, find the locked terminal room. Solve the password challenge to gain access to the inner corridors.';
        }
        if (!f('laser_corridor_complete')) {
            return 'Navigate the laser corridor. Analyse the grid frequency first, then use the HackRF to jam the motion sensors. Finally bypass the biometric panel.';
        }
        if (!f('data_extracted')) {
            return 'You are in the server room. Find the Operation Zerfall data partition and extract it. Use the Meshtastic radio to transmit proof to your allies.';
        }

        // ── Day 3: Aftermath ──────────────────────────────────────────────
        if (!f('debrief_complete')) {
            return 'It is over. Get home. Sleep. Tomorrow you debrief with IES and face the consequences of what you found.';
        }
        if (!f('epilogue_complete')) {
            return 'Head to the epilogue scene. Three months have passed. Find out what happened to everyone.';
        }
        return 'The story is complete. Explore freely, or start a new game from the menu.';
    }
    
    toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        const btn = document.getElementById('menu-voice');
        if (btn) {
            btn.textContent = this.voiceEnabled ? '🔊 Voice' : '🔇 Muted';
            btn.title = this.voiceEnabled ? 'Voice On - Click to Mute' : 'Voice Off - Click to Enable';
            btn.classList.toggle('muted', !this.voiceEnabled);
        }
        if (!this.voiceEnabled) {
            this.stopSpeech();
        }
        this.showNotification(this.voiceEnabled ? 'Voice enabled' : 'Voice muted');
        return this.voiceEnabled;
    }

    // ── Accessibility / Movie Mode ─────────────────────────────────────────────

    /**
     * Toggle accessibility (movie) mode on/off.
     * In movie mode the game auto-plays the good story path:
     *   - Dialogue auto-advances after TTS finishes
     *   - Puzzles are displayed and auto-solved
     *   - Hotspots defined in scene.accessibilityPath are clicked automatically
     */
    toggleAccessibilityMode() {
        this.accessibilityMode = !this.accessibilityMode;
        this.settings.accessibilityMode = this.accessibilityMode;
        this._saveSettings();
        this._updateAccessibilityBadge();

        if (this.accessibilityMode) {
            this.showNotification('🎬 Movie Mode ON — sit back and enjoy the story');
            // If a scene with an accessibilityPath is already active, start runner
            const scene = this.scenes?.[this.currentScene];
            if (scene?.accessibilityPath?.length) {
                setTimeout(() => this._startAccessibilityRunner(scene), 500);
            }
        } else {
            this._stopAccessibilityRunner();
            this.showNotification('🎮 Movie Mode OFF — manual control restored');
        }
        return this.accessibilityMode;
    }

    /** Update the 🎬 badge visibility and the menu button label. */
    _updateAccessibilityBadge() {
        const badge = document.getElementById('accessibility-badge');
        if (badge) badge.classList.toggle('hidden', !this.accessibilityMode);

        const btn = document.getElementById('menu-movie');
        if (btn) {
            btn.textContent = this.accessibilityMode ? '🎬 Movie ON' : '🎬 Movie';
            btn.classList.toggle('accessibility-active', this.accessibilityMode);
        }
    }

    /**
     * 🎬 Accessibility runner: walks through scene.accessibilityPath in order,
     * triggering each hotspot as if the player clicked it, and waiting for
     * dialogue/puzzles to finish before moving to the next.
     * @param {Object} scene - The scene object that was just loaded
     */
    async _startAccessibilityRunner(scene) {
        // Cancel any existing runner
        this._accessibilityRunnerActive = false;
        await this.wait(50); // let old runner notice the flag
        this._accessibilityRunnerActive = true;

        const path   = scene.accessibilityPath || [];
        const looping = scene.accessibilityLooping === true;
        console.log(`[🎬] Starting accessibility runner for ${this.currentScene}`, looping ? '(looping)' : '');

        /**
         * Run one full pass through the path.
         * Returns true if the scene changed (caller should abort).
         */
        const runPass = async () => {
            for (const entry of path) {
                if (!this._accessibilityRunnerActive || !this.accessibilityMode) return true;
                if (this.currentScene !== scene.id && scene.id !== undefined) return true;

                await this._waitForIdle();
                if (!this._accessibilityRunnerActive || !this.accessibilityMode) return true;

                await this.wait(600);
                if (!this._accessibilityRunnerActive || !this.accessibilityMode) return true;

                // ── Function entry ──────────────────────────────────────────────
                if (typeof entry === 'function') {
                    console.log(`[🎬] fn entry in '${this.currentScene}'`);
                    await entry(this);
                    await this.wait(300);
                    await this._waitForIdle(30000);
                    if (this.currentScene !== scene.id && scene.id !== undefined) return true;
                    continue;
                }

                // ── String hotspot entry — retry while it produces new flags ────
                const hotspotId = entry;
                // Allow hotspots to declare their own max retries (e.g. NPCs that set a
                // one-shot _met flag need only 1 retry — the second try sees no change).
                const _preHotspot = (this.scenes?.[this.currentScene]?.hotspots || []).find(h => h.id === hotspotId);
                let retries = _preHotspot?.accessibilityRetries ?? 5;
                while (retries-- > 0) {
                    if (!this._accessibilityRunnerActive || !this.accessibilityMode) return true;
                    if (this.currentScene !== scene.id && scene.id !== undefined) return true;

                    const hotspots = this.scenes?.[this.currentScene]?.hotspots || [];
                    const hotspot  = hotspots.find(h => h.id === hotspotId);
                    if (!hotspot) {
                        console.warn(`[🎬] Hotspot '${hotspotId}' not found — skipping`);
                        break;
                    }

                    if (hotspot.enabled !== undefined) {
                        const en = typeof hotspot.enabled === 'function' ? hotspot.enabled(this) : hotspot.enabled;
                        if (!en) { console.warn(`[🎬] Skip disabled '${hotspotId}'`); break; }
                    }
                    if (hotspot.condition && !this.checkCondition(hotspot.condition)) {
                        console.warn(`[🎬] Skip '${hotspotId}': condition not met`); break;
                    }

                    if (this.player && !hotspot.skipWalk) {
                        const tx = hotspot.x + (hotspot.width  || 0) / 2;
                        const ty = Math.min(hotspot.y + (hotspot.height || 0), 90);
                        await new Promise(resolve => this.player.walkTo(tx, ty, resolve));
                    }
                    if (!this._accessibilityRunnerActive || !this.accessibilityMode) return true;

                    const flagsBefore = JSON.stringify(this.gameState.flags);
                    console.log(`[🎬] Executing '${hotspotId}'`);
                    this.executeHotspotAction(hotspot);
                    await this.wait(300);
                    await this._waitForIdle(30000);
                    if (this.currentScene !== scene.id && scene.id !== undefined) return true;

                    // If no flags changed → this action is done; move to next entry
                    if (JSON.stringify(this.gameState.flags) === flagsBefore) break;

                    // Flags changed (action had an effect) → try same hotspot again
                    console.log(`[🎬] '${hotspotId}' changed flags — retrying (${retries} left)`);
                    await this.wait(600);
                }
            }
            return false; // completed pass without scene change
        };

        if (!looping) {
            await runPass();
        } else {
            // Looping mode: repeat passes until stable AND no pending garden destination
            let loopGuard = 0;
            do {
                if (!this._accessibilityRunnerActive || !this.accessibilityMode) break;
                if (this.currentScene !== scene.id && scene.id !== undefined) break;

                const flagsBefore = JSON.stringify(this.gameState.flags);
                const sceneChanged = await runPass();
                if (sceneChanged) break;

                const flagsAfter = JSON.stringify(this.gameState.flags);
                const changed = flagsBefore !== flagsAfter;
                const pending = this._gardenHasPendingDestination();

                console.log(`[🎬] Loop pass done — flags changed: ${changed}, pending garden: ${pending}`);

                if (!changed && !pending) break;          // stable → stop
                if (++loopGuard > 20) {
                    console.warn('[🎬] Loop guard hit (20) — stopping to avoid infinite loop');
                    break;
                }

                await this.wait(800);
            } while (this._accessibilityRunnerActive && this.accessibilityMode
                     && this.currentScene === scene.id);
        }

        console.log(`[🎬] Accessibility runner finished for ${scene.id ?? this.currentScene}`);
    }

    /** Signal the current accessibility runner to stop. */
    _stopAccessibilityRunner() {
        this._accessibilityRunnerActive = false;
    }

    /**
     * Returns true when the garden Volvo picker has at least one unvisited
     * destination that the story requires the player to drive to.
     * Used by the looping mancave runner to decide when to exit to garden.
     */
    _gardenHasPendingDestination() {
        const f = this.gameState.flags;
        const kloosterPending    = f.klooster_unlocked      && !f.visited_klooster;
        const dwingelooPending   = f.eva_contacted          && !f.visited_dwingeloo;
        const westerborkPending  = f.visited_dwingeloo      && !f.visited_westerbork_memorial;
        const hackerspacePending = f.visited_westerbork_memorial && !f.visited_hackerspace;
        const astronPending      = f.astron_unlocked        && !f.visited_astron;
        const facilityPending    = this.questManager?.hasQuest('infiltrate_facility') && !f.drove_to_facility;
        return !!(kloosterPending || dwingelooPending || westerborkPending || hackerspacePending || astronPending || facilityPending);
    }

    /**
     * Wait until the engine is fully idle: no active dialogue, puzzle, or scene load.
     * @param {number} [timeout=20000] - Maximum wait in ms before giving up
     * @returns {Promise<void>}
     */
    async _waitForIdle(timeout = 20000) {
        const start = Date.now();
        while (this.isDialogueActive || this.isPuzzleActive || this._sceneLoading
               || document.querySelector('.mc-overlay')
               || document.querySelector('.ls-overlay')) {
            if (Date.now() - start > timeout) {
                console.warn('[🎬] _waitForIdle timed out');
                break;
            }
            await this.wait(150);
        }
    }

    /**
     * Pauses CSS animations, speech, typewriter, and blocks all interaction.
     * @returns {boolean} new pause state
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        
        const overlay = document.getElementById('pause-overlay');
        const btn = document.getElementById('menu-pause');
        const sceneWrapper = document.getElementById('scene-wrapper');
        const sceneContainer = document.getElementById('scene-container');
        
        if (this.isPaused) {
            // --- PAUSE ---
            // Show overlay
            if (overlay) overlay.classList.remove('hidden');
            
            // Update button
            if (btn) {
                btn.textContent = '▶️ Resume';
                btn.title = 'Resume Game (P)';
                btn.classList.add('paused');
            }
            
            // Freeze all CSS animations in the scene
            if (sceneContainer) {
                sceneContainer.style.animationPlayState = 'paused';
                sceneContainer.querySelectorAll('*').forEach(el => {
                    el.style.animationPlayState = 'paused';
                });
            }
            
            // Pause speech synthesis
            if (this.voiceManager?.synth?.speaking) {
                try { this.voiceManager.synth.pause(); } catch (e) { /* ignore */ }
            }
            
            // Pause typewriter by aborting current and storing state
            if (this.typewriterAbortController) {
                this._typewriterWasPaused = true;
                this.typewriterAbortController.abort();
            }
            
            // Freeze player idle timer
            if (this.player?._idleTimer) {
                clearTimeout(this.player._idleTimer);
                this.player._idleFrozen = true;
            }
            
            console.log('Game PAUSED');
        } else {
            // --- RESUME ---
            // Hide overlay
            if (overlay) overlay.classList.add('hidden');
            
            // Update button
            if (btn) {
                btn.textContent = '⏸️ Pause';
                btn.title = 'Pause / Resume (P)';
                btn.classList.remove('paused');
            }
            
            // Unfreeze all CSS animations
            if (sceneContainer) {
                sceneContainer.style.animationPlayState = '';
                sceneContainer.querySelectorAll('*').forEach(el => {
                    el.style.animationPlayState = '';
                });
            }
            
            // Resume speech synthesis
            if (this.voiceManager?.synth?.paused) {
                try { this.voiceManager.synth.resume(); } catch (e) { /* ignore */ }
            }
            
            // Restart player idle timer
            if (this.player?._idleFrozen) {
                this.player._idleFrozen = false;
                if (this.player.startIdleTimer) {
                    this.player.startIdleTimer();
                }
            }
            
            this._typewriterWasPaused = false;
            
            console.log('Game RESUMED');
        }
        
        return this.isPaused;
    }

    // Quest Manager API (for compatibility with scene scripts)
    get questManager() {
        const self = this;
        return {
            isActive: (questId) => self.gameState.activeQuests.some(q => q.id === questId),
            hasQuest: (questId) => self.gameState.activeQuests.some(q => q.id === questId) || 
                                   self.gameState.questsCompleted.includes(questId),
            addQuest: (quest) => self.addQuest(quest),
            updateProgress: (questId, step) => {
                const quest = self.gameState.activeQuests.find(q => q.id === questId);
                if (quest) {
                    quest.progress = quest.progress || [];
                    if (!quest.progress.includes(step)) {
                        quest.progress.push(step);
                    }
                    self.updateQuestUI();
                }
            },
            complete: (questId) => self.completeQuest(questId),
            getProgress: (questId) => {
                const quest = self.gameState.activeQuests.find(q => q.id === questId);
                return quest?.progress || [];
            }
        };
    }
    
    // Quest System - supports both addQuest(obj) and addQuest(id, name, description)
    addQuest(questOrId, name = null, description = null) {
        let quest;
        if (typeof questOrId === 'object') {
            quest = questOrId;
        } else {
            quest = { id: questOrId, name: name || questOrId, description: description || '' };
        }
        
        if (!quest.id) {
            console.error('addQuest: quest must have an id', quest);
            return;
        }
        
        // Skip if quest is already active or was already completed
        if (this.gameState.activeQuests.find(q => q.id === quest.id) ||
            this.gameState.questsCompleted.includes(quest.id)) {
            return;
        }
        this.gameState.activeQuests.push(quest);
        this.updateQuestUI();
        this.showNotification(`New Quest: ${quest.name || quest.id}`);
    }
    
    // Add item to inventory (shortcut method)
    addItem(item) {
        this.addToInventory(item);
    }
    
    completeQuest(questId) {
        const quest = this.gameState.activeQuests.find(q => q.id === questId);
        if (quest) {
            this.gameState.activeQuests = this.gameState.activeQuests.filter(q => q.id !== questId);
            this.gameState.questsCompleted.push(questId);
            this.updateQuestUI();
            this.showNotification(`Quest Completed: ${quest.name}`);
            
            if (quest.onComplete) {
                quest.onComplete(this);
            }
        }
    }
    
    updateQuestUI() {
        const container = document.getElementById('quest-list');
        if (!container) return;
        container.innerHTML = '';
        
        if (this.gameState.activeQuests.length === 0) {
            container.innerHTML = '<div class="quest-empty">No active quests</div>';
            return;
        }
        
        this.gameState.activeQuests.forEach(quest => {
            const element = document.createElement('div');
            element.className = 'quest-item';
            element.innerHTML = `
                <div class="quest-name">${quest.name}</div>
                <div class="quest-description">${quest.description}</div>
                ${quest.hint ? `<div class="quest-hint"><button class="quest-hint-btn">💡 Hint</button><p class="quest-hint-text hidden">${quest.hint}</p></div>` : ''}
            `;
            const hintBtn = element.querySelector('.quest-hint-btn');
            if (hintBtn) {
                hintBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    hintBtn.nextElementSibling.classList.toggle('hidden');
                });
            }
            container.appendChild(element);
        });
    }
    
    // Puzzle System
    startPuzzle(puzzleConfig) {
        if (this.accessibilityMode) {
            // 🎬 Movie mode: show the puzzle UI, then fill fields one by one and submit
            this._autoSolveLegacyPuzzle(puzzleConfig);
            return;
        }
        this.isPuzzleActive = true;
        const overlay = document.getElementById('puzzle-overlay');
        const container = document.getElementById('puzzle-container');
        
        overlay.classList.remove('hidden');
        
        // Load puzzle based on type
        switch (puzzleConfig.type) {
            case 'rot1':
                this.loadROT1Puzzle(container, puzzleConfig);
                break;
            case 'frequency':
                this.loadFrequencyPuzzle(container, puzzleConfig);
                break;
            case 'password':
                this.loadPasswordPuzzle(container, puzzleConfig);
                break;
            default:
                console.error(`Unknown puzzle type: ${puzzleConfig.type}`);
        }
    }
    
    loadROT1Puzzle(container, config) {
        container.innerHTML = `
            <div class="puzzle rot1-puzzle">
                <h2>🔐 Encrypted Message</h2>
                <div class="puzzle-description">
                    <p>The message appears to be encoded. Decode it to reveal its contents.</p>
                </div>
                <div class="encrypted-message">
                    <code>${config.encryptedText}</code>
                </div>
                ${config.hint ? `<div class="puzzle-hint"><button id="hint-btn">💡 Hint</button><p id="hint-text" class="hidden">${config.hint}</p></div>` : ''}
                <div class="puzzle-input">
                    <label>Your decoded message:</label>
                    <textarea id="puzzle-answer" rows="3" placeholder="Enter the decoded message..."></textarea>
                </div>
                <div class="puzzle-actions">
                    <button id="puzzle-submit" class="btn-primary">Submit</button>
                    <button id="puzzle-close" class="btn-secondary">Close</button>
                </div>
            </div>
        `;
        
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            const hintHandler = (e) => {
                e.preventDefault();
                document.getElementById('hint-text').classList.toggle('hidden');
            };
            hintBtn.addEventListener('click', hintHandler);
            hintBtn.addEventListener('touchend', hintHandler);
        }
        
        const submitBtn = document.getElementById('puzzle-submit');
        const submitHandler = (e) => {
            e.preventDefault();
            const answer = document.getElementById('puzzle-answer').value.trim().toUpperCase();
            const solution = config.solution.toUpperCase();
            
            if (answer === solution || answer.includes(solution.substring(0, 20))) {
                this.puzzleSolved(config);
            } else {
                this.showNotification('That doesn\'t seem right. Try again.');
            }
        };
        submitBtn.addEventListener('click', submitHandler);
        submitBtn.addEventListener('touchend', submitHandler);
        
        const closeBtn = document.getElementById('puzzle-close');
        const closeHandler = (e) => {
            e.preventDefault();
            this.closePuzzle();
        };
        closeBtn.addEventListener('click', closeHandler);
        closeBtn.addEventListener('touchend', closeHandler);
    }
    
    loadPasswordPuzzle(container, config) {
        container.innerHTML = `
            <div class="puzzle password-puzzle">
                <h2>🔒 Password Required</h2>
                <div class="puzzle-description">
                    <p>${config.description || 'Enter the password to continue.'}</p>
                </div>
                ${config.hint ? `<div class="puzzle-hint"><button id="hint-btn">💡 Hint</button><p id="hint-text" class="hidden">${config.hint}</p></div>` : ''}
                <div class="puzzle-input">
                    <input type="text" id="puzzle-answer" placeholder="Enter password..." autocomplete="off">
                </div>
                <div class="puzzle-actions">
                    <button id="puzzle-submit" class="btn-primary">Submit</button>
                    <button id="puzzle-close" class="btn-secondary">Close</button>
                </div>
            </div>
        `;
        
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            const hintHandler = (e) => {
                e.preventDefault();
                document.getElementById('hint-text').classList.toggle('hidden');
            };
            hintBtn.addEventListener('click', hintHandler);
            hintBtn.addEventListener('touchend', hintHandler);
        }
        
        const submitBtn = document.getElementById('puzzle-submit');
        const submitHandler = (e) => {
            e.preventDefault();
            const answer = document.getElementById('puzzle-answer').value.trim();
            if (answer === config.solution) {
                this.puzzleSolved(config);
            } else {
                this.showNotification('Incorrect password.');
            }
        };
        submitBtn.addEventListener('click', submitHandler);
        submitBtn.addEventListener('touchend', submitHandler);
        
        const closeBtn = document.getElementById('puzzle-close');
        const closeHandler = (e) => {
            e.preventDefault();
            this.closePuzzle();
        };
        closeBtn.addEventListener('click', closeHandler);
        closeBtn.addEventListener('touchend', closeHandler);
    }
    
    loadFrequencyPuzzle(container, config) {
        container.innerHTML = `
            <div class="puzzle frequency-puzzle">
                <h2>📻 Tune the Frequency</h2>
                <div class="puzzle-description">
                    <p>${config.description || 'Adjust the frequency to pick up the signal.'}</p>
                </div>
                <div class="frequency-display">
                    <span id="freq-value">${config.startFreq || 100.0}</span> MHz
                </div>
                <div class="frequency-controls">
                    <button id="freq-down-10">-10</button>
                    <button id="freq-down-1">-1</button>
                    <button id="freq-down-01">-0.1</button>
                    <input type="range" id="freq-slider" min="${config.minFreq || 50}" max="${config.maxFreq || 500}" step="0.1" value="${config.startFreq || 100}">
                    <button id="freq-up-01">+0.1</button>
                    <button id="freq-up-1">+1</button>
                    <button id="freq-up-10">+10</button>
                </div>
                <div class="signal-indicator">
                    <div class="signal-bar" id="signal-strength"></div>
                </div>
                <div class="puzzle-actions">
                    <button id="puzzle-submit" class="btn-primary">Lock Frequency</button>
                    <button id="puzzle-close" class="btn-secondary">Close</button>
                </div>
            </div>
        `;
        
        let currentFreq = config.startFreq || 100.0;
        const targetFreq = config.solution;
        
        const updateFreq = (delta) => {
            currentFreq = Math.max(config.minFreq || 50, Math.min(config.maxFreq || 500, currentFreq + delta));
            currentFreq = Math.round(currentFreq * 10) / 10;
            document.getElementById('freq-value').textContent = currentFreq.toFixed(1);
            document.getElementById('freq-slider').value = currentFreq;
            
            // Update signal strength
            const distance = Math.abs(currentFreq - targetFreq);
            const strength = Math.max(0, 100 - (distance * 10));
            document.getElementById('signal-strength').style.width = `${strength}%`;
        };
        
        // Add button handlers with both click and touch events
        const addFreqHandler = (id, delta) => {
            const btn = document.getElementById(id);
            const handler = (e) => { e.preventDefault(); updateFreq(delta); };
            btn.addEventListener('click', handler);
            btn.addEventListener('touchend', handler);
        };
        
        addFreqHandler('freq-down-10', -10);
        addFreqHandler('freq-down-1', -1);
        addFreqHandler('freq-down-01', -0.1);
        addFreqHandler('freq-up-01', 0.1);
        addFreqHandler('freq-up-1', 1);
        addFreqHandler('freq-up-10', 10);
        
        document.getElementById('freq-slider').addEventListener('input', (e) => {
            currentFreq = parseFloat(e.target.value);
            document.getElementById('freq-value').textContent = currentFreq.toFixed(1);
            const distance = Math.abs(currentFreq - targetFreq);
            const strength = Math.max(0, 100 - (distance * 10));
            document.getElementById('signal-strength').style.width = `${strength}%`;
        });
        
        const submitBtn = document.getElementById('puzzle-submit');
        const submitHandler = (e) => {
            e.preventDefault();
            if (Math.abs(currentFreq - targetFreq) < 0.5) {
                this.puzzleSolved(config);
            } else {
                this.showNotification('No clear signal at this frequency.');
            }
        };
        submitBtn.addEventListener('click', submitHandler);
        submitBtn.addEventListener('touchend', submitHandler);
        
        const closeBtn = document.getElementById('puzzle-close');
        const closeHandler = (e) => {
            e.preventDefault();
            this.closePuzzle();
        };
        closeBtn.addEventListener('click', closeHandler);
        closeBtn.addEventListener('touchend', closeHandler);
    }
    
    puzzleSolved(config) {
        this.showNotification('✓ Puzzle solved!');
        this.setFlag(config.id + '_solved', true);
        
        if (config.questId) {
            this.completeQuest(config.questId);
        }
        
        if (config.onSolve) {
            config.onSolve(this);
        }
        
        this.closePuzzle();
    }
    
    closePuzzle() {
        this.isPuzzleActive = false;
        const overlay = document.getElementById('puzzle-overlay');
        const container = document.getElementById('puzzle-container');
        if (overlay) overlay.classList.add('hidden');
        if (container) container.innerHTML = '';
    }
    
    // Game State
    setFlag(flag, value) {
        this.gameState.flags[flag] = value;
    }
    
    getFlag(flag) {
        return this.gameState.flags[flag];
    }
    
    checkCondition(condition) {
        if (typeof condition === 'function') {
            return condition(this);
        }
        if (typeof condition === 'string') {
            return this.getFlag(condition);
        }
        return true;
    }
    
    /**
     * Parse a time mention from spoken/typed dialogue text and advance the
     * HUD clock if a recognisable time was found.  Never goes backwards.
     * Handles:
     *   • HH:MM (24-h)          "het is 22:47", "at 09:00"
     *   • H:MM AM/PM             "8:15 AM", "11:30 pm"
     *   • N o'clock              "8 o'clock", "acht uur"
     *   • "half past N"          → N:30
     *   • "quarter past/to N"    → N:15 / (N-1):45
     *   • Dutch digital (same HH:MM regex covers it)
     */
    _syncClockToText(text) {
        if (!text) return;
        let h = null, m = 0;

        // ── 1. HH:MM with optional AM/PM ─────────────────────────────────
        const digitalRe = /\b(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?\b/;
        const d = text.match(digitalRe);
        if (d) {
            h = parseInt(d[1], 10);
            m = parseInt(d[2], 10);
            const meridiem = (d[3] || '').toLowerCase();
            if (meridiem === 'pm' && h < 12) h += 12;
            if (meridiem === 'am' && h === 12) h = 0;
        }

        // ── 2. "N o'clock" / "N uur" (Dutch) ─────────────────────────────
        if (h === null) {
            const oRe = /\b(\d{1,2})\s+(?:o'clock|uur)\b/i;
            const o = text.match(oRe);
            if (o) { h = parseInt(o[1], 10); m = 0; }
        }

        // ── 3. "half past N" ──────────────────────────────────────────────
        if (h === null) {
            const halfRe = /\bhalf\s+past\s+(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/i;
            const hp = text.match(halfRe);
            if (hp) {
                h = this._wordToNum(hp[1]);
                m = 30;
            }
        }

        // ── 4. "quarter past N" / "quarter to N" ─────────────────────────
        if (h === null) {
            const qpRe = /\bquarter\s+past\s+(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/i;
            const qp = text.match(qpRe);
            if (qp) { h = this._wordToNum(qp[1]); m = 15; }
        }
        if (h === null) {
            const qtRe = /\bquarter\s+to\s+(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/i;
            const qt = text.match(qtRe);
            if (qt) { h = this._wordToNum(qt[1]) - 1; m = 45; if (h < 0) h = 23; }
        }

        if (h === null || isNaN(h) || h < 0 || h > 23 || m < 0 || m > 59) return;

        const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        // Try on the current day first; setTime guards against going backwards.
        // If still on current day it won't advance, try next day for AM times
        // that clearly come after a late-night scene (e.g. 22:00 → "8:15 AM").
        const [curH] = this.gameState.time.split(':').map(Number);
        const day = (h < curH && h < 12) ? this.gameState.day + 1 : this.gameState.day;
        this.setTime(day, timeStr);
    }

    /** Map English number words to integers, or parse numeric strings. */
    _wordToNum(w) {
        const MAP = {
            one:1, two:2, three:3, four:4, five:5, six:6,
            seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12
        };
        return MAP[w.toLowerCase()] ?? parseInt(w, 10);
    }

    advanceTime(minutes) {
        if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) {
            console.warn('advanceTime: invalid minutes value', minutes);
            return;
        }
        const [hours, mins] = this.gameState.time.split(':').map(Number);
        let totalMins = hours * 60 + mins + minutes;
        const dayMinutes = ENGINE_CONFIG.HOURS_IN_DAY * ENGINE_CONFIG.MINUTES_IN_HOUR;
        
        if (totalMins >= dayMinutes) {
            totalMins -= dayMinutes;
            this.gameState.day++;
            const dayEl = document.getElementById('game-day');
            if (dayEl) dayEl.textContent = `Day ${this.gameState.day}`;
        }
        
        const newHours = Math.floor(totalMins / 60);
        const newMins = totalMins % 60;
        this.gameState.time = `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
        const timeEl = document.getElementById('game-time');
        if (timeEl) timeEl.textContent = this.gameState.time;
    }

    /**
     * Set the game clock to an absolute day + time.
     * Only moves the clock FORWARD — never backwards.
     * @param {number} day
     * @param {string} time  e.g. '14:30'
     */
    setTime(day, time) {
        const [newH, newM] = time.split(':').map(Number);
        const [curH, curM] = this.gameState.time.split(':').map(Number);
        const newTotal = day * 1440 + newH * 60 + newM;
        const curTotal = this.gameState.day * 1440 + curH * 60 + curM;
        if (newTotal <= curTotal) return;   // never wind back

        this.gameState.day = day;
        this.gameState.time = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;

        const dayEl = document.getElementById('game-day');
        const timeEl = document.getElementById('game-time');
        if (dayEl) dayEl.textContent = `Day ${day}`;
        if (timeEl) timeEl.textContent = this.gameState.time;
    }

    /**
     * Auto-apply scene clock from SCENE_TIME_MAP (called inside loadScene).
     * @param {string} sceneId
     */
    _applySceneClock(sceneId) {
        const entry = SCENE_TIME_MAP[sceneId];
        if (entry) this.setTime(entry.day, entry.time);
    }
    
    setStoryPart(part) {
        this.gameState.storyPart = part;
    }
    
    // Notifications
    showNotification(message, duration = ENGINE_CONFIG.NOTIFICATION_DURATION) {
        const area = document.getElementById('notification-area');
        if (!area) {
            console.log(`[Notification] ${message}`);
            return;
        }
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        area.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), ENGINE_CONFIG.NOTIFICATION_FADE);
        }, duration);
    }
    
    // Evidence Viewer
    showEvidence(documentData) {
        if (this.evidenceViewer) {
            this.evidenceViewer.showDocument(documentData);
        } else {
            console.error('Evidence viewer not initialized');
            this.showNotification('Cannot display document');
        }
    }
    
    hasViewedEvidence(documentId) {
        return this.evidenceViewer ? this.evidenceViewer.hasViewed(documentId) : false;
    }

    addEvidence(evidenceData) {
        // Store evidence in game state and show notification
        if (!evidenceData || !evidenceData.id) {
            console.error('addEvidence: evidence must have an id', evidenceData);
            return;
        }
        if (!this.gameState.evidence) {
            this.gameState.evidence = [];
        }
        if (!this.gameState.evidence.find(e => e.id === evidenceData.id)) {
            this.gameState.evidence.push(evidenceData);
        }
    }
    
    // Password Puzzle System
    showPasswordPuzzle(config) {
        if (this.accessibilityMode) {
            // 🎬 Movie mode: show puzzle, auto-type correct answer, submit
            this._autoSolvePuzzle(config);
            return;
        }
        if (this.passwordPuzzle) {
            this.passwordPuzzle.show(config);
        } else {
            console.error('Password puzzle system not initialized');
            this.showNotification('Cannot display puzzle');
        }
    }

    /**
     * 🎬 Auto-solve a PasswordPuzzle (new system) in accessibility/movie mode.
     * Shows the puzzle UI, then types the correct answer into each field one by one.
     */
    async _autoSolvePuzzle(config) {
        if (!this.passwordPuzzle) {
            // No puzzle UI — just call onSuccess directly
            if (config.onSuccess) config.onSuccess(this);
            return;
        }

        this.passwordPuzzle.show(config);

        // Wait for the puzzle UI to render
        await this.wait(900);

        // Collect all input/textarea fields in the puzzle overlay, in DOM order
        const puzzleEl = document.getElementById('password-puzzle');
        const inputs = puzzleEl
            ? Array.from(puzzleEl.querySelectorAll('input, textarea'))
            : [document.getElementById('password-input')].filter(Boolean);

        if (!inputs.length) {
            if (config.onSuccess) config.onSuccess(this);
            return;
        }

        // Build answer list — use correctAnswer or correctPassword; each index maps to a field
        const rawAnswers = Array.isArray(config.correctAnswer)
            ? config.correctAnswer
            : config.correctAnswer
                ? [config.correctAnswer]
                : config.correctPassword
                    ? [config.correctPassword]
                    : [];

        // Type into each field one by one
        for (let f = 0; f < inputs.length; f++) {
            const input  = inputs[f];
            const answer = rawAnswers[f] ?? rawAnswers[0] ?? '';

            input.value = '';
            input.focus();
            for (let i = 0; i < answer.length; i++) {
                input.value += answer[i];
                input.dispatchEvent(new Event('input', { bubbles: true }));
                await this.wait(80);
            }
            // Brief pause between fields before moving to the next one
            if (f < inputs.length - 1) await this.wait(400);
        }

        await this.wait(600);

        // Submit
        if (this.passwordPuzzle && this.passwordPuzzle.isActive) {
            this.passwordPuzzle.checkAnswer();
        }
    }

    /**
     * 🎬 Auto-solve a legacy startPuzzle() puzzle in accessibility/movie mode.
     * Renders the full puzzle UI, fills each field one by one, then submits.
     * Handles types: 'rot1', 'password' (text input), 'frequency' (slider).
     */
    async _autoSolveLegacyPuzzle(config) {
        // Render the puzzle UI exactly as startPuzzle() would (minus the interceptor)
        this.isPuzzleActive = true;
        const overlay   = document.getElementById('puzzle-overlay');
        const container = document.getElementById('puzzle-container');
        if (!overlay || !container) {
            this.puzzleSolved(config);
            return;
        }
        overlay.classList.remove('hidden');
        switch (config.type) {
            case 'rot1':      this.loadROT1Puzzle(container, config);       break;
            case 'frequency': this.loadFrequencyPuzzle(container, config);  break;
            case 'password':  this.loadPasswordPuzzle(container, config);   break;
            default:
                this.puzzleSolved(config);
                return;
        }

        // Wait for the UI to render
        await this.wait(900);

        if (config.type === 'frequency') {
            // ── Frequency puzzle: animate the slider from start → target ──
            const slider    = document.getElementById('freq-slider');
            const freqLabel = document.getElementById('freq-value');
            const sigBar    = document.getElementById('signal-strength');
            if (slider) {
                const target = parseFloat(config.solution);
                let cur      = parseFloat(slider.value);
                const step   = cur <= target ? 0.5 : -0.5;
                while (Math.abs(cur - target) >= Math.abs(step) + 0.01) {
                    cur = Math.round((cur + step) * 10) / 10;
                    slider.value = cur;
                    if (freqLabel) freqLabel.textContent = cur.toFixed(1);
                    if (sigBar) {
                        const proximity = Math.max(0, 100 - Math.abs(cur - target) * 10);
                        sigBar.style.width = proximity + '%';
                    }
                    slider.dispatchEvent(new Event('input', { bubbles: true }));
                    await this.wait(80);
                }
                // Land exactly on target
                slider.value = target;
                if (freqLabel) freqLabel.textContent = target.toFixed(1);
                if (sigBar) sigBar.style.width = '100%';
                slider.dispatchEvent(new Event('input', { bubbles: true }));
            }
            await this.wait(600);
        } else {
            // ── rot1 / password: find ALL text inputs/textareas, fill each one by one ──
            const puzzleOverlay = document.getElementById('puzzle-overlay') || document;
            const inputs = Array.from(
                puzzleOverlay.querySelectorAll('#puzzle-answer, .puzzle input, .puzzle textarea')
            );
            const answers = Array.isArray(config.solution)
                ? config.solution
                : [config.solution || ''];

            for (let f = 0; f < inputs.length; f++) {
                const inp    = inputs[f];
                const answer = answers[f] ?? answers[0] ?? '';
                inp.value = '';
                inp.focus();
                for (let i = 0; i < answer.length; i++) {
                    inp.value += answer[i];
                    inp.dispatchEvent(new Event('input', { bubbles: true }));
                    await this.wait(80);
                }
                // Brief pause before moving to the next field
                if (f < inputs.length - 1) await this.wait(400);
            }
            await this.wait(600);
        }

        // Click submit (or fall back to direct puzzleSolved)
        const submitBtn = document.getElementById('puzzle-submit');
        if (submitBtn) {
            submitBtn.click();
        } else {
            this.puzzleSolved(config);
        }
    }
    
    isPuzzleSolved(puzzleId) {
        return this.passwordPuzzle ? this.passwordPuzzle.isSolved(puzzleId) : false;
    }
    
    // Chat Interface System
    showChat(config) {
        if (this.chatInterface) {
            this.chatInterface.showConversation(config);
        } else {
            console.error('Chat interface not initialized');
            this.showNotification('Cannot display chat');
        }
    }
    
    addChatMessage(conversationId, message, immediate = false) {
        if (this.chatInterface) {
            this.chatInterface.addMessage(conversationId, message, immediate);
        }
    }
    
    async sendChatMessagesWithDelay(conversationId, messages, delay = 2000) {
        if (this.chatInterface) {
            return this.chatInterface.sendMessagesWithDelay(conversationId, messages, delay);
        }
    }
    
    // Save/Load
    saveGame(silent = false, slot = 0) {
        try {
            if (!this._storage) {
                if (!silent) this.showNotification('Save unavailable — no storage.');
                return false;
            }

            // Sync evidence viewer state into gameState before save
            if (this.evidenceViewer && Array.isArray(this.evidenceViewer.documentHistory)) {
                this.gameState.evidenceViewed = [...this.evidenceViewer.documentHistory];
            }

            const saveData = {
                version: this._saveVersion,
                slot,
                slotLabel: slot > 0 ? `Slot ${slot}` : 'Auto',
                currentScene: this.currentScene,
                inventory: this.inventory,
                gameState: this.gameState,
                voiceEnabled: this.voiceEnabled,
                timestamp: new Date().toISOString()
            };

            const key = this._getSaveKey(slot);
            this._storage.setItem(key, JSON.stringify(saveData));
            if (!silent) {
                const label = slot > 0 ? ` (Slot ${slot})` : '';
                this.showNotification(`Game saved${label}!`);
            }
            console.log(`[Save] key=${key}, scene=${this.currentScene}, items=${this.inventory.length}, flags=${Object.keys(this.gameState.flags).length}, quests=${this.gameState.activeQuests.length}`);
            return true;
        } catch (err) {
            console.error('Failed to save game:', err);
            if (!silent) this.showNotification('Failed to save game.');
            return false;
        }
    }
    
    loadGame(slot = 0) {
        try {
            // Try the requested slot; for slot 1 fall back to the legacy key for migration
            const key = this._getSaveKey(slot);
            let raw = this._storage ? this._storage.getItem(key) : null;
            if (!raw && slot === 1) {
                raw = this._storage ? this._storage.getItem('cyberquest_save') : null;
            }
            if (!raw) {
                this.showNotification('No save file found.');
                return false;
            }

            const data = JSON.parse(raw);

            // --- Inventory ---
            this.inventory = Array.isArray(data.inventory) ? data.inventory : [];

            // --- Game state: merge saved over defaults so new fields get defaults ---
            const defaults = JSON.parse(JSON.stringify(this._defaultGameState));
            this.gameState = { ...defaults, ...data.gameState };

            // Guard nested structures
            this.gameState.flags            = (typeof this.gameState.flags === 'object' && this.gameState.flags !== null) ? this.gameState.flags : {};
            this.gameState.activeQuests      = Array.isArray(this.gameState.activeQuests) ? this.gameState.activeQuests : [];
            this.gameState.questsCompleted   = Array.isArray(this.gameState.questsCompleted) ? this.gameState.questsCompleted : [];
            this.gameState.evidence          = Array.isArray(this.gameState.evidence) ? this.gameState.evidence : [];
            this.gameState.evidenceViewed    = Array.isArray(this.gameState.evidenceViewed) ? this.gameState.evidenceViewed : [];

            // --- Restore sub-system state ---
            // Evidence viewer viewed-document history
            if (this.evidenceViewer && Array.isArray(this.gameState.evidenceViewed)) {
                this.evidenceViewer.documentHistory = [...this.gameState.evidenceViewed];
            }

            // Voice preference
            if (typeof data.voiceEnabled === 'boolean') {
                this.voiceEnabled = data.voiceEnabled;
            }

            // --- Update all UI ---
            this.updateInventoryUI();
            this.updateQuestUI();
            const dayEl = document.getElementById('game-day');
            const timeEl = document.getElementById('game-time');
            if (dayEl) dayEl.textContent = `Day ${this.gameState.day}`;
            if (timeEl) timeEl.textContent = this.gameState.time;

            // --- Navigate to saved scene ---
            if (data.currentScene) {
                this.loadScene(data.currentScene, 'fade', { skipAutoSave: true });
            }

            console.log(`[Load] scene=${data.currentScene}, items=${this.inventory.length}, flags=${Object.keys(this.gameState.flags).length}, quests=${this.gameState.activeQuests.length}, evidence=${this.gameState.evidence.length}`);
            const slotLabel = data.slot > 0 ? ` (Slot ${data.slot})` : '';
            this.showNotification(`Game loaded${slotLabel}!`);
            return true;
        } catch (err) {
            console.error('Failed to load game:', err);
            this.showNotification('Failed to load saved game. Save data may be corrupted.');
            return false;
        }
    }

    // ── Save-slot helpers ──────────────────────────────────────────────────────

    /**
     * Return the localStorage key for a save slot.
     * Slot 0 = legacy auto-save key.  Slots 1-3 = named slots.
     * @param {number} slot
     * @returns {string}
     */
    _getSaveKey(slot) {
        if (!slot || slot < 1) return 'cyberquest_save';
        return `cyberquest_save_${slot}`;
    }

    /** Read persisted settings from localStorage and merge over defaults. */
    _loadSettings() {
        try {
            const raw = this._storage ? this._storage.getItem('cyberquest_settings') : null;
            if (raw) {
                const saved = JSON.parse(raw);
                if (typeof saved.textSpeed        === 'number')  this.settings.textSpeed        = saved.textSpeed;
                if (typeof saved.animSpeed        === 'number')  this.settings.animSpeed        = saved.animSpeed;
                if (typeof saved.autoAdvanceDelay === 'number')  this.settings.autoAdvanceDelay = saved.autoAdvanceDelay;
                if (typeof saved.docuPauseDuration === 'number') this.settings.docuPauseDuration = saved.docuPauseDuration;
                if (typeof saved.accessibilityMode === 'boolean') this.settings.accessibilityMode = saved.accessibilityMode;
            }
        } catch (e) {
            console.warn('[Settings] Failed to load settings:', e);
        }
    }

    /** Persist current settings to localStorage. */
    _saveSettings() {
        try {
            if (this._storage) {
                this._storage.setItem('cyberquest_settings', JSON.stringify(this.settings));
            }
        } catch (e) {
            console.warn('[Settings] Failed to save settings:', e);
        }
    }

    /**
     * Apply current settings to live engine state.
     * Call after _loadSettings() or after the user changes a slider.
     */
    _applySettings() {
        // Voice speech rate
        if (this.voiceManager && typeof this.voiceManager.setRate === 'function') {
            // Map autoAdvanceDelay to a speech rate: 0→1.0, 500→0.9, 1000→0.8
            // (voice rate is independently user-controlled via voice profiles;
            //  we only nudge it slightly based on dialogue speed preference)
        }
        // textSpeed and animSpeed are read inline at call-sites — no extra work needed here.
        // Restore accessibilityMode from persisted setting.
        this.accessibilityMode = !!this.settings.accessibilityMode;
        this._updateAccessibilityBadge();
        console.log('[Settings] applied:', JSON.stringify(this.settings));
    }

    // ── Save-slot picker modal ─────────────────────────────────────────────────

    /**
     * Open a 3-slot save/load picker.
     * @param {'save'|'load'} mode
     */
    openSaveSlotModal(mode) {
        // Remove any existing instance
        document.getElementById('save-slot-modal')?.remove();

        const NUM_SLOTS = 3;

        // Read existing slot data for display
        const slots = [];
        for (let i = 1; i <= NUM_SLOTS; i++) {
            const key = this._getSaveKey(i);
            const raw = this._storage ? this._storage.getItem(key) : null;
            if (raw) {
                try {
                    const d = JSON.parse(raw);
                    slots.push({
                        slot: i,
                        scene: d.currentScene || '—',
                        storyPart: d.gameState?.storyPart ?? '?',
                        timestamp: d.timestamp ? new Date(d.timestamp).toLocaleString() : '—',
                        empty: false,
                        raw: d
                    });
                } catch {
                    slots.push({ slot: i, empty: true });
                }
            } else {
                // Check legacy key for slot 1 migration
                const legacyRaw = i === 1 && this._storage ? this._storage.getItem('cyberquest_save') : null;
                if (legacyRaw) {
                    try {
                        const d = JSON.parse(legacyRaw);
                        slots.push({
                            slot: i,
                            scene: d.currentScene || '—',
                            storyPart: d.gameState?.storyPart ?? '?',
                            timestamp: d.timestamp ? new Date(d.timestamp).toLocaleString() : '(legacy save)',
                            empty: false,
                            raw: d
                        });
                    } catch {
                        slots.push({ slot: i, empty: true });
                    }
                } else {
                    slots.push({ slot: i, empty: true });
                }
            }
        }

        const title = mode === 'save' ? '💾 Save Game' : '📂 Load Game';

        const cardsHtml = slots.map(s => {
            if (s.empty) {
                return `
                    <div class="slot-card slot-card--empty" data-slot="${s.slot}">
                        <div class="slot-card__number">Slot ${s.slot}</div>
                        <div class="slot-card__info slot-card__info--empty">— Empty —</div>
                        ${mode === 'save' ? `<button class="slot-action-btn" data-slot="${s.slot}" data-action="save">Save Here</button>` : `<button class="slot-action-btn slot-action-btn--disabled" disabled>Empty</button>`}
                    </div>`;
            }
            const sceneName = s.scene.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return `
                <div class="slot-card" data-slot="${s.slot}">
                    <div class="slot-card__header">
                        <span class="slot-card__number">Slot ${s.slot}</span>
                        <button class="slot-delete-btn" data-slot="${s.slot}" title="Delete save">✕</button>
                    </div>
                    <div class="slot-card__scene">${sceneName}</div>
                    <div class="slot-card__meta">Part ${s.storyPart}</div>
                    <div class="slot-card__timestamp">${s.timestamp}</div>
                    ${mode === 'save'
                        ? `<button class="slot-action-btn slot-action-btn--overwrite" data-slot="${s.slot}" data-action="save">Overwrite</button>`
                        : `<button class="slot-action-btn" data-slot="${s.slot}" data-action="load">Load</button>`}
                </div>`;
        }).join('');

        const modal = document.createElement('div');
        modal.id = 'save-slot-modal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content save-slot-modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" id="save-slot-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="save-slot-grid">${cardsHtml}</div>
                </div>
            </div>`;

        document.body.appendChild(modal);

        // Close button
        modal.querySelector('#save-slot-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

        // Action buttons (save / load)
        modal.querySelectorAll('.slot-action-btn[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = parseInt(btn.dataset.slot, 10);
                const action = btn.dataset.action;
                modal.remove();
                if (action === 'save') {
                    this.saveGame(false, slot);
                } else if (action === 'load') {
                    this.loadGame(slot);
                }
            });
        });

        // Delete buttons
        modal.querySelectorAll('.slot-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = parseInt(btn.dataset.slot, 10);
                const key = this._getSaveKey(slot);
                if (confirm(`Delete Slot ${slot} save? This cannot be undone.`)) {
                    this._storage?.removeItem(key);
                    // Also remove legacy key if slot 1
                    if (slot === 1) this._storage?.removeItem('cyberquest_save');
                    modal.remove();
                    this.openSaveSlotModal(mode); // refresh
                }
            });
        });
    }

    // ── Settings modal ─────────────────────────────────────────────────────────

    openSettingsModal() {
        document.getElementById('settings-modal')?.remove();

        // Snapshot current values so Cancel can restore them
        const prev = { ...this.settings };

        const textLabels  = { 0: 'Instant', 15: 'Fast', 40: 'Normal', 80: 'Slow' };
        const animLabels  = { 0: 'None', 200: 'Fast', 500: 'Normal', 1000: 'Slow' };
        const autoLabels  = { 0: 'Manual', 1500: 'Fast', 3000: 'Normal', 5000: 'Slow' };
        const docuLabels  = { 0: 'None', 500: 'Quick', 1500: 'Normal', 3000: 'Relaxed', 5000: 'Slow' };

        const labelFor = (map, val) => {
            // Find closest key
            const keys = Object.keys(map).map(Number);
            const closest = keys.reduce((a, b) => Math.abs(b - val) < Math.abs(a - val) ? b : a);
            return map[closest] || val + 'ms';
        };

        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content settings-modal-content">
                <div class="modal-header">
                    <h2>⚙️ Settings</h2>
                    <button class="modal-close" id="settings-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="settings-section">
                        <h3 class="settings-section-title">Dialogue &amp; Text</h3>

                        <div class="settings-row">
                            <div class="settings-row__labels">
                                <span class="settings-row__name">Text Speed</span>
                                <span class="settings-row__value" id="lbl-text-speed">${labelFor(textLabels, this.settings.textSpeed)}</span>
                            </div>
                            <div class="settings-row__presets">
                                <button class="preset-btn${this.settings.textSpeed===0?' preset-btn--active':''}" data-target="textSpeed" data-value="0">Instant</button>
                                <button class="preset-btn${this.settings.textSpeed===15?' preset-btn--active':''}" data-target="textSpeed" data-value="15">Fast</button>
                                <button class="preset-btn${this.settings.textSpeed===40?' preset-btn--active':''}" data-target="textSpeed" data-value="40">Normal</button>
                                <button class="preset-btn${this.settings.textSpeed===80?' preset-btn--active':''}" data-target="textSpeed" data-value="80">Slow</button>
                            </div>
                            <input class="settings-slider" type="range" id="slider-text-speed"
                                min="0" max="100" step="5" value="${this.settings.textSpeed}">
                        </div>

                        <div class="settings-row">
                            <div class="settings-row__labels">
                                <span class="settings-row__name">Auto-advance</span>
                                <span class="settings-row__value" id="lbl-auto-advance">${labelFor(autoLabels, this.settings.autoAdvanceDelay)}</span>
                            </div>
                            <div class="settings-row__presets">
                                <button class="preset-btn${this.settings.autoAdvanceDelay===0?' preset-btn--active':''}" data-target="autoAdvanceDelay" data-value="0">Manual</button>
                                <button class="preset-btn${this.settings.autoAdvanceDelay===1500?' preset-btn--active':''}" data-target="autoAdvanceDelay" data-value="1500">Fast</button>
                                <button class="preset-btn${this.settings.autoAdvanceDelay===3000?' preset-btn--active':''}" data-target="autoAdvanceDelay" data-value="3000">Normal</button>
                                <button class="preset-btn${this.settings.autoAdvanceDelay===5000?' preset-btn--active':''}" data-target="autoAdvanceDelay" data-value="5000">Slow</button>
                            </div>
                            <input class="settings-slider" type="range" id="slider-auto-advance"
                                min="0" max="6000" step="500" value="${this.settings.autoAdvanceDelay}">
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3 class="settings-section-title">Documentary</h3>

                        <div class="settings-row">
                            <div class="settings-row__labels">
                                <span class="settings-row__name">Pause After Speech</span>
                                <span class="settings-row__value" id="lbl-docu-pause">${labelFor(docuLabels, this.settings.docuPauseDuration)}</span>
                            </div>
                            <div class="settings-row__presets">
                                <button class="preset-btn${this.settings.docuPauseDuration===0?' preset-btn--active':''}" data-target="docuPauseDuration" data-value="0">None</button>
                                <button class="preset-btn${this.settings.docuPauseDuration===500?' preset-btn--active':''}" data-target="docuPauseDuration" data-value="500">Quick</button>
                                <button class="preset-btn${this.settings.docuPauseDuration===1500?' preset-btn--active':''}" data-target="docuPauseDuration" data-value="1500">Normal</button>
                                <button class="preset-btn${this.settings.docuPauseDuration===3000?' preset-btn--active':''}" data-target="docuPauseDuration" data-value="3000">Relaxed</button>
                                <button class="preset-btn${this.settings.docuPauseDuration===5000?' preset-btn--active':''}" data-target="docuPauseDuration" data-value="5000">Slow</button>
                            </div>
                            <input class="settings-slider" type="range" id="slider-docu-pause"
                                min="0" max="6000" step="250" value="${this.settings.docuPauseDuration}">
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3 class="settings-section-title">Visuals</h3>

                        <div class="settings-row">
                            <div class="settings-row__labels">
                                <span class="settings-row__name">Animation Speed</span>
                                <span class="settings-row__value" id="lbl-anim-speed">${labelFor(animLabels, this.settings.animSpeed)}</span>
                            </div>
                            <div class="settings-row__presets">
                                <button class="preset-btn${this.settings.animSpeed===0?' preset-btn--active':''}" data-target="animSpeed" data-value="0">None</button>
                                <button class="preset-btn${this.settings.animSpeed===200?' preset-btn--active':''}" data-target="animSpeed" data-value="200">Fast</button>
                                <button class="preset-btn${this.settings.animSpeed===500?' preset-btn--active':''}" data-target="animSpeed" data-value="500">Normal</button>
                                <button class="preset-btn${this.settings.animSpeed===1000?' preset-btn--active':''}" data-target="animSpeed" data-value="1000">Slow</button>
                            </div>
                            <input class="settings-slider" type="range" id="slider-anim-speed"
                                min="0" max="1200" step="100" value="${this.settings.animSpeed}">
                        </div>
                    </div>

                    <div class="settings-footer">
                        <button class="settings-btn settings-btn--apply" id="settings-apply">Apply &amp; Close</button>
                        <button class="settings-btn settings-btn--cancel" id="settings-cancel">Cancel</button>
                        <button class="settings-btn settings-btn--reset" id="settings-reset">Reset to Defaults</button>
                    </div>
                </div>
            </div>`;

        document.body.appendChild(modal);

        // Live label map
        const labelMap = {
            'slider-text-speed':   { lblId: 'lbl-text-speed',    map: textLabels,  key: 'textSpeed' },
            'slider-auto-advance': { lblId: 'lbl-auto-advance',   map: autoLabels,  key: 'autoAdvanceDelay' },
            'slider-docu-pause':   { lblId: 'lbl-docu-pause',     map: docuLabels,  key: 'docuPauseDuration' },
            'slider-anim-speed':   { lblId: 'lbl-anim-speed',     map: animLabels,  key: 'animSpeed' },
        };

        // Update label + active preset buttons when slider moves
        const syncPresets = (key, val) => {
            modal.querySelectorAll(`.preset-btn[data-target="${key}"]`).forEach(b => {
                b.classList.toggle('preset-btn--active', parseInt(b.dataset.value, 10) === val);
            });
        };

        Object.entries(labelMap).forEach(([sliderId, cfg]) => {
            const slider = modal.querySelector(`#${sliderId}`);
            const lbl    = modal.querySelector(`#${cfg.lblId}`);
            slider?.addEventListener('input', () => {
                const v = parseInt(slider.value, 10);
                this.settings[cfg.key] = v;
                if (lbl) lbl.textContent = labelFor(cfg.map, v);
                syncPresets(cfg.key, v);
            });
        });

        // Preset buttons update slider + label
        modal.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.target;
                const val = parseInt(btn.dataset.value, 10);
                this.settings[key] = val;
                // Update corresponding slider
                const cfg = Object.values(labelMap).find(c => c.key === key);
                if (cfg) {
                    const slider = modal.querySelector(`#${Object.keys(labelMap).find(k => labelMap[k].key === key)}`);
                    if (slider) slider.value = val;
                    const lbl = modal.querySelector(`#${cfg.lblId}`);
                    if (lbl) lbl.textContent = labelFor(cfg.map, val);
                }
                syncPresets(key, val);
            });
        });

        const close = () => modal.remove();

        modal.querySelector('#settings-close').addEventListener('click', () => {
            // Close without saving — restore previous values
            Object.assign(this.settings, prev);
            close();
        });

        modal.querySelector('#settings-cancel').addEventListener('click', () => {
            Object.assign(this.settings, prev);
            close();
        });

        modal.querySelector('#settings-apply').addEventListener('click', () => {
            this._applySettings();
            this._saveSettings();
            this.showNotification('Settings saved.');
            close();
        });

        modal.querySelector('#settings-reset').addEventListener('click', () => {
            this.settings.textSpeed        = 40;
            this.settings.animSpeed        = 500;
            this.settings.autoAdvanceDelay = 0;
            this.settings.docuPauseDuration = 1500;
            // Reset sliders
            Object.entries(labelMap).forEach(([sliderId, cfg]) => {
                const slider = modal.querySelector(`#${sliderId}`);
                if (slider) slider.value = this.settings[cfg.key];
                const lbl = modal.querySelector(`#${cfg.lblId}`);
                if (lbl) lbl.textContent = labelFor(cfg.map, this.settings[cfg.key]);
                syncPresets(cfg.key, this.settings[cfg.key]);
            });
        });

        modal.addEventListener('click', e => { if (e.target === modal) { Object.assign(this.settings, prev); close(); } });
    }

    loadGameState() {
        // Check URL hash for direct scene loading
        const hash = window.location.hash.substring(1);
        if (hash && this.scenes[hash]) {
            this.loadScene(hash);
        }
    }
    
    // Character Display System
    showCharacter(characterName, x, y, scale = 0.3) {
        if (!characterName) {
            console.error('showCharacter: characterName is required');
            return null;
        }
        const charactersContainer = document.getElementById('scene-characters');
        if (!charactersContainer) {
            console.error('Characters container not found');
            return null;
        }
        
        // Create character image element
        const character = document.createElement('img');
        character.className = 'npc-character';
        character.src = `assets/images/characters/${characterName}_southpark.svg`;
        character.style.cssText = `
            position: absolute; 
            left: ${x}%; 
            bottom: ${100 - y}%; 
            width: ${scale * 100}%; 
            height: auto; 
            opacity: 0; 
            transition: opacity 0.8s; 
            pointer-events: none; 
            z-index: 10;
        `;
        
        // Add unique ID if same character appears multiple times
        character.setAttribute('data-character', characterName);
        
        charactersContainer.appendChild(character);
        
        // Fade in
        requestAnimationFrame(() => {
            character.style.opacity = '1';
        });
        
        return character;
    }
    
    // Utilities
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Scene-scoped setTimeout — automatically cleared when leaving the current scene.
     * Use this instead of raw setTimeout() in scene code to prevent stale timers.
     * @param {Function} fn - callback
     * @param {number} delay - milliseconds
     * @returns {number} timeout ID
     */
    sceneTimeout(fn, delay) {
        const id = setTimeout(() => {
            // Remove from tracking array when it naturally fires
            this._sceneTimeouts = this._sceneTimeouts.filter(t => t !== id);
            fn();
        }, delay);
        this._sceneTimeouts.push(id);
        return id;
    }
    
    /**
     * Clear all pending scene-scoped timeouts. Called automatically on scene exit.
     */
    clearSceneTimeouts() {
        if (this._sceneTimeouts) {
            this._sceneTimeouts.forEach(id => clearTimeout(id));
            this._sceneTimeouts = [];
        }
    }
    
    // Debug Panel for Testing
    toggleDebugPanel() {
        let panel = document.getElementById('debug-panel');
        if (panel) {
            // Remove old panel and recreate with fresh data
            if (!panel.classList.contains('hidden')) {
                panel.classList.add('hidden');
                return;
            }
            panel.remove();
        }
        panel = this.createDebugPanel();
        panel.classList.remove('hidden');
    }
    
    createDebugPanel() {
        const _g = this;
        const f = (name) => _g.getFlag(name);
        const fb = (name) => {
            const val = f(name);
            const cls = val ? 'flag-on' : 'flag-off';
            const tick = val ? '✓' : '✗';
            return `<button class="debug-flag-btn ${cls}" onclick="game.debugToggleFlag('${name}')">${name}:${tick}</button>`;
        };
        const cur = _g.gameState;
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.className = 'debug-panel';

        // Scene jump helper
        const sb = (scene, label, extra) => {
            const cmd = extra ? `${extra}game.loadScene('${scene}');game.toggleDebugPanel()` : `game.loadScene('${scene}');game.toggleDebugPanel()`;
            const active = cur.currentScene === scene ? ' style="background:#00ff88;color:#000;font-weight:bold"' : '';
            return `<button onclick="${cmd}"${active}>${label || scene}</button>`;
        };
        // Driving scene helper
        const drv = (dest, scene, label) => {
            return `<button onclick="game.setFlag('driving_destination','${dest}');game.loadScene('${scene}');game.toggleDebugPanel()">${label}</button>`;
        };
        // Story part indicator
        const sp = (n) => {
            const active = cur.storyPart === n;
            return `<span class="dbg-sp ${active ? 'dbg-sp-active' : ''}" onclick="game.debugSetStoryPart(${n})" title="Click to set story part ${n}">SP${n}</span>`;
        };

        panel.innerHTML = `
            <div class="debug-header">
                🛠️ DEBUG TIMELINE — D to close
                &nbsp;|&nbsp; Scene: <b>${cur.currentScene || 'none'}</b>
                &nbsp;|&nbsp; Story Part: <b>${cur.storyPart}</b>
                &nbsp;|&nbsp; Day ${cur.day} ${cur.time || ''}
                &nbsp;|&nbsp;
                <button onclick="game.debugAutoplay()" id="dbg-autoplay-btn" style="background:#00cc66;color:#000;font-weight:bold;padding:2px 8px;border:none;border-radius:3px;cursor:pointer;">▶ Autoplay</button>
                <button onclick="game.debugStopAutoplay()" style="background:#cc3300;color:#fff;font-weight:bold;padding:2px 8px;border:none;border-radius:3px;cursor:pointer;">■ Stop</button>
            </div>
            <div class="debug-content">

            <!-- ═══════════ DAY 1 — MONDAY FEB 9 ═══════════ -->
            <div class="dbg-day">
                <div class="dbg-day-header">📅 DAY 1 — Monday Feb 9 — Morning</div>

                <div class="dbg-step">
                    <div class="dbg-time">07:27</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('intro','🎬 Intro')} ${sp(0)} — Ryan wakes, game starts</div>
                        <div class="dbg-flags">${fb('game_started')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">07:45</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('home','🏠 Home (Kitchen)')} ${sp(1)} — Make espresso, discover mancave door</div>
                        <div class="dbg-flags">${fb('made_espresso')}${fb('espresso_count')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">08:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('livingroom','🛋️ Living Room')} — IES calls, dog greets Ryan</div>
                        <div class="dbg-flags">${fb('visited_livingroom')}${fb('talked_to_max')}${fb('dog_interactions')}${fb('pug_interactions')}${fb('fireplace_interactions')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">08:15</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('tvdocumentary','📺 TV Documentary')} — Watch Drenthe documentary</div>
                        <div class="dbg-flags">${fb('saw_tv_documentary')}${fb('tv_documentary_watched')}${fb('documentary_completed_once')}${fb('post_documentary_reminder_shown')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">09:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('mancave','🖥️ Mancave')} ${sp(2)} — Explore mancave, find SDR radio, tune military frequency</div>
                        <div class="dbg-flags">
                            ${fb('visited_mancave')}${fb('frequency_tuned')}${fb('military_frequency')}
                            ${fb('father_call_count')}${fb('mother_call_count')}${fb('checked_email')}
                        </div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">11:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('sstv_terminal','📺 SSTV Terminal')} ${sp(3)}${sp(4)}${sp(5)}${sp(6)} — Receive SSTV transmissions, decode two messages, unlock Klooster</div>
                        <div class="dbg-flags">
                            ${fb('sstv_transmission_received')}${fb('first_message_decoded')}${fb('second_transmission_ready')}
                            ${fb('second_message_decoded')}${fb('message_decoded')}${fb('klooster_unlocked')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="dbg-day">
                <div class="dbg-day-header">📅 DAY 1 — Monday Feb 9 — Afternoon</div>

                <div class="dbg-step">
                    <div class="dbg-time">16:15</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('sdr_bench','📡 SDR Bench')} — Decode SSTV image of Ryan's house</div>
                        <div class="dbg-flags">${fb('visited_sdr_bench')}${fb('sstv_decoded')}${fb('sstv_coordinates_known')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">16:30</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('planboard','📋 Planboard')} — Review investigation board</div>
                        <div class="dbg-flags">${fb('visited_planboard')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">16:45</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('videocall','📹 Video Call')} — Contact IES / allies</div>
                        <div class="dbg-flags">${fb('visited_videocall')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">17:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('garden','🌳 Garden')} ${sb('garden_back','🌿 Garden Back')} — Go to car</div>
                        <div class="dbg-flags">${fb('visited_garden')}${fb('visited_garden_back')}${fb('klooster_unlocked')}</div>
                    </div>
                </div>
            </div>

            <div class="dbg-day">
                <div class="dbg-day-header">📅 DAY 1 — Monday Feb 9 — Night</div>

                <div class="dbg-step">
                    <div class="dbg-time">22:30</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${drv('klooster','driving','🚗 Drive → Klooster')} ${sp(7)} — Night drive to Ter Apel</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">22:55</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('klooster','⛪ Klooster')} — Medieval monastery, find USB on car</div>
                        <div class="dbg-flags">${fb('visited_klooster')}${fb('first_klooster_visit')}${fb('checked_courtyard')}${fb('found_usb_stick')}${fb('saw_usb_first_time')}${fb('picked_up_usb')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">23:15</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('car_discovery','🚙 Car Discovery')} — Find USB stick taped to Volvo</div>
                        <div class="dbg-flags">${fb('found_usb_stick')}${fb('picked_up_usb')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">23:30</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${drv('home','driving','🚗 Drive → Home')} — Return to Compascuum</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">00:15</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('bedroom','🛏️ Sleep — Bedroom')} — Ryan sleeps until 07:00 Day 2</div>
                        <div class="dbg-flags">${fb('slept_day_1')}</div>
                    </div>
                </div>
            </div>

            <!-- ═══════════ DAY 2 — TUESDAY FEB 10 ═══════════ -->
            <div class="dbg-day">
                <div class="dbg-day-header">📅 DAY 2 — Tuesday Feb 10 — Morning (Mancave Investigation)</div>

                <div class="dbg-step">
                    <div class="dbg-time">08:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('mancave','🖥️ Mancave — USB Analysis')} ${sp(8)} — Analyse USB on air-gapped laptop</div>
                        <div class="dbg-flags">${fb('usb_analyzed')}${fb('evidence_unlocked')}${fb('viewed_schematics')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">08:30</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('mancave','🖥️ Mancave — Dilemma')} ${sp(9)} — Acknowledge the threat, begin ally search</div>
                        <div class="dbg-flags">${fb('started_ally_search')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">09:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('mancave','🖥️ Mancave — Recruit Allies')} ${sp(10)} — Contact Cees, Jaap, Henk</div>
                        <div class="dbg-flags">${fb('cees_contacted')}${fb('jaap_contacted')}${fb('henk_contacted')}${fb('contacted_allies')}${fb('all_allies_contacted')}${fb('has_flipper_zero')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">09:30</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('mancave','🖥️ Mancave — Volkov Investigation')} ${sp(11)}${sp(12)}${sp(13)}${sp(14)} — Track Volkov, contact Kubecka, discover Zerfall</div>
                        <div class="dbg-flags">${fb('volkov_investigated')}${fb('contacted_kubecka')}${fb('collected_evidence')}${fb('discovered_zerfall')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">10:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('mancave','🖥️ Mancave — Eva Reveal')} ${sp(15)} — Photo analysis, identify Eva Weber</div>
                        <div class="dbg-flags">${fb('identified_eva')}${fb('eva_contacted')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">10:30</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('mancave','🖥️ Mancave — Eva Contact')} ${sp(16)} — Establish contact with Eva</div>
                        <div class="dbg-flags">${fb('eva_contacted')}</div>
                    </div>
                </div>
            </div>

            <div class="dbg-day">
                <div class="dbg-day-header">📅 DAY 2 — Tuesday Feb 10 — Field Operations</div>

                <div class="dbg-step">
                    <div class="dbg-time">11:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('dwingeloo','📡 Dwingeloo Radio Telescope')} — Find relay transmitter, signal log</div>
                        <div class="dbg-flags">${fb('visited_dwingeloo')}${fb('dwingeloo_broadcast_found')}${fb('dwingeloo_transmitter_found')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">12:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('westerbork_memorial','🏛️ Westerbork Memorial')} — Inspect cameras, crack Bluetooth node</div>
                        <div class="dbg-flags">${fb('visited_westerbork_memorial')}${fb('westerbork_camera_inspected')}${fb('westerbork_bt_cracked')}${fb('bt_camera_quest_started')}${fb('zerfall_network_mapped')}${fb('zerfall_duration_known')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">13:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('hackerspace','🔧 Hackerspace')} ${sb('hackerspace_classroom','🎓 Classroom')} — Community presentation</div>
                        <div class="dbg-flags">${fb('visited_hackerspace')}${fb('visited_hackerspace_classroom')}${fb('classroom_presentation_index')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">15:30</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">
                            ${drv('astron','driving_day','🚗 Drive → ASTRON')}
                            ${sb('astron','🔭 ASTRON / WSRT')} — Verify schematics, triangulate signal
                        </div>
                        <div class="dbg-flags">${fb('visited_astron')}${fb('astron_unlocked')}${fb('astron_complete')}${fb('schematics_verified')}${fb('signal_triangulated')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">17:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${drv('home_from_astron','driving_day','🚗 Drive → Home')} — Return, prepare for infiltration</div>
                    </div>
                </div>
            </div>

            <div class="dbg-day">
                <div class="dbg-day-header">📅 DAY 2 — Tuesday Feb 10 — Night Infiltration</div>

                <div class="dbg-step">
                    <div class="dbg-time">20:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('regional_map','🗺️ Regional Map')} — Plan route to facility</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">21:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('drone_hunt','🛸 Drone Hunt')} — GPS spoofing, eliminate surveillance drones</div>
                        <div class="dbg-flags">${fb('drone_hunt_started')}${fb('meshtastic_decoy_placed')}${fb('hackrf_ready')}${fb('survived_thermal_scan')}${fb('gps_frequency_set')}${fb('tx_power_set')}${fb('spoof_target_set')}${fb('gps_spoof_executed')}${fb('drones_eliminated')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">21:47</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">
                            ${drv('facility','driving','🚗 Drive → Facility')} ${sp(17)}
                            ${sb('facility','🏭 Facility Gate')} ${sp(18)} — Infiltrate Steckerdoser Heide
                        </div>
                        <div class="dbg-flags">${fb('facility_unlocked')}${fb('drove_to_facility')}${fb('entered_facility')}${fb('badge_cloned')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">22:06</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('facility_interior','🏢 Facility Interior')} — Navigate corridors</div>
                        <div class="dbg-flags">${fb('facility_interior_entered')}${fb('facility_password_solved')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">22:07</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('laser_corridor','🔴 Laser Corridor')} — Disable lasers, jam motion sensors, bypass biometric</div>
                        <div class="dbg-flags">${fb('laser_corridor_entered')}${fb('laser_grid_analysed')}${fb('motion_sensors_analysed')}${fb('biometric_panel_activated')}${fb('ir_frequency_set')}${fb('lasers_disabled')}${fb('jam_frequency_set')}${fb('sensors_jammed')}${fb('biometric_code_entered')}${fb('server_door_unlocked')}${fb('laser_corridor_complete')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">22:08</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('facility_server','💾 Server Room')} ${sp(19)}${sp(20)} — Extract data, neutralise Operation Zerfall</div>
                        <div class="dbg-flags">${fb('data_extracted')}${fb('eva_arrived')}${fb('kubecka_arrived')}${fb('discovered_zerfall')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">23:30</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${drv('home','driving','🚗 Drive → Home')} — Escape across the border, return to Compascuum</div>
                        <div style="font-size:0.75em;color:#aaa;margin-top:2px;">Day rolls into Day 3 past midnight → sleep is slept_day_3 after long_night</div>
                    </div>
                </div>
            </div>

            <!-- ═══════════ DAY 3 — WEDNESDAY FEB 11 ═══════════ -->
            <div class="dbg-day">
                <div class="dbg-day-header">📅 DAY 3 — Wednesday Feb 11 — Long Night &amp; Sleep</div>

                <div class="dbg-step">
                    <div class="dbg-time">01:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('long_night','🌙 Long Night')} — Process the mission, secure the data</div>
                        <div class="dbg-flags">${fb('visited_long_night')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">03:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('bedroom','🛏️ Sleep — Bedroom')} — Ryan sleeps until 07:00 Day 4</div>
                        <div class="dbg-flags">${fb('slept_day_3')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">08:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('morning_after','☀️ Morning After')} — Day 4, after sleeping</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">11:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('debrief','📝 Debrief')} — Review with IES</div>
                        <div class="dbg-flags">${fb('visited_debrief')}${fb('debrief_complete')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time">20:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('return_to_max','🎤 Return to IES')} — Hollywood ending</div>
                        <div class="dbg-flags">${fb('visited_return_to_max')}${fb('return_to_max_complete')}</div>
                    </div>
                </div>
            </div>

            <!-- ═══════════ EPILOGUE ═══════════ -->
            <div class="dbg-day">
                <div class="dbg-day-header">📅 EPILOGUE — May 2026</div>

                <div class="dbg-step">
                    <div class="dbg-time">14:00</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('epilogue','🌅 Epilogue')} — 3 months later</div>
                        <div class="dbg-flags">${fb('visited_epilogue')}${fb('epilogue_complete')}</div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time"></div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row">${sb('credits','🎬 Credits')} — Roll credits</div>
                    </div>
                </div>
            </div>

            <!-- ═══════════ TOOLS SECTION ═══════════ -->
            <div class="dbg-day" style="border-color:#555;">
                <div class="dbg-day-header" style="color:#ccc;">🧰 Tools &amp; Presets</div>

                <div class="dbg-step">
                    <div class="dbg-time" style="color:#888;">SP</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row" style="font-size:0.78rem;color:#888;">Story Part: <b style="color:#00ff88">${cur.storyPart}</b> — click to set →
                            ${[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n => `<button onclick="game.debugSetStoryPart(${n})" ${cur.storyPart === n ? 'style="background:#00ff88;color:#000;font-weight:bold"' : ''} class="dbg-sp-btn">${n}</button>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time" style="color:#888;">🎒</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row" style="font-size:0.78rem;color:#888;">Inventory:</div>
                        <div>
                            <button onclick="game.giveDebugItem('flipper_zero')">Flipper Zero</button>
                            <button onclick="game.giveDebugItem('meshtastic')">Meshtastic</button>
                            <button onclick="game.giveDebugItem('usb_stick')">USB Stick</button>
                            <button onclick="game.giveDebugItem('wifi_pineapple')">WiFi Pineapple</button>
                            <button onclick="game.giveDebugItem('hackrf')">HackRF One</button>
                            <button onclick="game.giveDebugItem('night_vision')">Night Vision</button>
                            <button onclick="game.giveDebugItem('security_badge')">Security Badge</button>
                            <button onclick="game.giveDebugItem('astron_mesh_radio')">Astron Mesh</button>
                        </div>
                        <div style="margin-top:4px;">
                            <span style="font-size:0.72rem;color:#888;">Evidence: </span>
                            <button onclick="game.giveDebugItem('sstv_decoded_image')">SSTV Image</button>
                            <button onclick="game.giveDebugItem('dwingeloo_signal_log')">Dwingeloo Log</button>
                            <button onclick="game.giveDebugItem('relay_transmitter')">Relay Transmitter</button>
                            <button onclick="game.giveDebugItem('modified_camera')">Modified Camera</button>
                            <button onclick="game.giveDebugItem('zerfall_bt_node')">Zerfall BT Node</button>
                        </div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time" style="color:#888;">⚡</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row" style="font-size:0.78rem;color:#888;">Quick Presets:</div>
                        <div>
                            <button onclick="game.setupKloosterTest();game.toggleDebugPanel()">✅ Klooster Test</button>
                            <button onclick="game.debugPreset('unlock_field')">✅ Field Ops (SP 8)</button>
                            <button onclick="game.debugPreset('unlock_facility')">✅ Facility (SP 12)</button>
                            <button onclick="game.debugPreset('complete_all')">✅ ALL Flags True</button>
                            <button onclick="game.debugPreset('reset_all')" style="border-color:#ff4444;color:#ff4444">⛔ Reset ALL</button>
                        </div>
                    </div>
                </div>

                <div class="dbg-step">
                    <div class="dbg-time" style="color:#888;">🧪</div>
                    <div class="dbg-body">
                        <div class="dbg-scene-row" style="font-size:0.78rem;color:#888;">Test Tools:</div>
                        <div>
                            <button onclick="game.testEvidenceViewer()">Evidence Viewer</button>
                            <button onclick="game.testPasswordPuzzle()">Password Puzzle</button>
                            <button onclick="game.testChatSignal()">Signal Chat</button>
                            <button onclick="game.testChatMeshtastic()">Meshtastic Chat</button>
                            <button onclick="game.testChatBBS()">BBS Terminal</button>
                        </div>
                    </div>
                </div>
            </div>

            </div>
        `;

        // Add CSS (only once)
        if (!document.getElementById('debug-panel-styles')) {
            const style = document.createElement('style');
            style.id = 'debug-panel-styles';
            style.textContent = `
                .debug-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.97);
                    border: 2px solid #00ff88;
                    border-radius: 8px;
                    padding: 20px;
                    z-index: 9999;
                    width: 92vw;
                    max-width: 900px;
                    max-height: 88vh;
                    overflow-y: auto;
                    font-family: 'Courier New', monospace;
                }
                .debug-panel.hidden { display: none; }
                .debug-header {
                    color: #00ff88;
                    font-size: 0.9rem;
                    font-weight: bold;
                    margin-bottom: 14px;
                    text-align: center;
                    border-bottom: 1px solid #00ff88;
                    padding-bottom: 10px;
                    position: sticky;
                    top: -20px;
                    background: rgba(0,0,0,0.97);
                    z-index: 1;
                    padding-top: 4px;
                }
                .debug-content { color: #eaeaea; }

                /* Day block */
                .dbg-day {
                    border-left: 3px solid #00ff88;
                    margin: 0 0 16px 12px;
                    padding-left: 0;
                }
                .dbg-day-header {
                    color: #00ff88;
                    font-size: 0.85rem;
                    font-weight: bold;
                    padding: 6px 12px;
                    background: rgba(0,255,136,0.06);
                    border-bottom: 1px solid rgba(0,255,136,0.15);
                    margin-bottom: 2px;
                }

                /* Timeline step */
                .dbg-step {
                    display: flex;
                    align-items: flex-start;
                    padding: 5px 0 5px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    position: relative;
                }
                .dbg-step::before {
                    content: '';
                    position: absolute;
                    left: -2px;
                    top: 12px;
                    width: 8px;
                    height: 8px;
                    background: #00ff88;
                    border-radius: 50%;
                    border: 2px solid #000;
                    z-index: 1;
                }
                .dbg-time {
                    width: 52px;
                    min-width: 52px;
                    color: #ffaa00;
                    font-size: 0.78rem;
                    font-weight: bold;
                    padding: 4px 6px 0 14px;
                    text-align: right;
                }
                .dbg-body {
                    flex: 1;
                    padding: 2px 8px;
                }
                .dbg-scene-row {
                    font-size: 0.82rem;
                    margin-bottom: 3px;
                }
                .dbg-flags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 2px;
                }

                /* Buttons inside timeline */
                .dbg-body button, .dbg-scene-row button {
                    background: #111;
                    color: #00ff88;
                    border: 1px solid #00ff88;
                    padding: 3px 7px;
                    margin: 1px 2px;
                    cursor: pointer;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.76rem;
                }
                .dbg-body button:hover, .dbg-scene-row button:hover {
                    background: #00ff88;
                    color: #000;
                }
                .dbg-sp-btn {
                    padding: 2px 5px !important;
                    font-size: 0.7rem !important;
                    min-width: 22px;
                    text-align: center;
                }

                /* Story part badges */
                .dbg-sp {
                    display: inline-block;
                    background: #1a1a2a;
                    color: #667;
                    border: 1px solid #334;
                    border-radius: 3px;
                    padding: 1px 4px;
                    font-size: 0.65rem;
                    margin: 0 1px;
                    cursor: pointer;
                    vertical-align: middle;
                }
                .dbg-sp:hover { color: #00ff88; border-color: #00ff88; }
                .dbg-sp-active {
                    background: #0a2e1a;
                    color: #00ff88;
                    border-color: #00ff88;
                    font-weight: bold;
                }

                /* Flag buttons */
                .debug-flag-btn {
                    padding: 2px 5px;
                    margin: 1px;
                    cursor: pointer;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.68rem;
                    border: 1px solid;
                }
                .debug-flag-btn.flag-on {
                    background: #0a2e1a;
                    border-color: #00ff88;
                    color: #00ff88;
                }
                .debug-flag-btn.flag-off {
                    background: #111;
                    border-color: #333;
                    color: #444;
                }
                .debug-flag-btn:hover { background: #00ff88 !important; color: #000 !important; border-color: #00ff88 !important; }

                /* Scrollbar */
                .debug-panel::-webkit-scrollbar { width: 6px; }
                .debug-panel::-webkit-scrollbar-track { background: #111; }
                .debug-panel::-webkit-scrollbar-thumb { background: #00ff88; border-radius: 3px; }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(panel);
        return panel;
    }

    debugToggleFlag(name) {
        this.setFlag(name, !this.getFlag(name));
        const old = document.getElementById('debug-panel');
        if (old) old.remove();
        this.createDebugPanel();
    }

    /**
     * Walk through every dbg-step scene button in order,
     * triggering each with a random 8-12 s delay between steps.
     * Skips bedroom/driving steps that would steal control from autoplay.
     */
    debugAutoplay() {
        this.debugStopAutoplay(); // clear any previous run
        const SKIP_SCENES = new Set(['bedroom', 'driving', 'driving_day']);
        const panel = document.getElementById('debug-panel');
        if (!panel) return;
        // Collect the first <button> inside each dbg-scene-row (the scene jump button)
        const steps = Array.from(panel.querySelectorAll('.dbg-step .dbg-scene-row button:first-child'))
            .filter(btn => {
                // Skip buttons whose onclick contains a skipped scene name
                const oc = btn.getAttribute('onclick') || '';
                return !Array.from(SKIP_SCENES).some(s => oc.includes(`'${s}'`));
            });
        if (!steps.length) { this.showNotification('Autoplay: no steps found'); return; }
        this._apIndex = 0;
        this.showNotification(`▶ Autoplay — ${steps.length} steps`);
        const next = () => {
            if (this._apIndex >= steps.length) {
                this.showNotification('Autoplay complete');
                this._apTimer = null;
                return;
            }
            const btn = steps[this._apIndex++];
            btn.click();
            const delay = 8000 + Math.random() * 4000; // 8-12 s
            this._apTimer = setTimeout(next, delay);
        };
        next();
    }

    debugStopAutoplay() {
        if (this._apTimer) {
            clearTimeout(this._apTimer);
            this._apTimer = null;
            this.showNotification('■ Autoplay stopped');
        }
    }

    debugSetStoryPart(n) {
        this.gameState.storyPart = n;
        this.showNotification(`Story Part set to ${n}`);
        const old = document.getElementById('debug-panel');
        if (old) old.remove();
        this.createDebugPanel();
    }

    debugPreset(preset) {
        const ALL_FLAGS = [
            'game_started','made_espresso','espresso_count','talked_to_max','saw_tv_documentary',
            'tv_documentary_watched','documentary_completed_once','post_documentary_reminder_shown',
            'visited_livingroom','visited_garden','visited_mancave','visited_sdr_bench',
            'visited_dwingeloo','visited_westerbork_memorial','visited_astron','visited_planboard','visited_hackerspace','visited_hackerspace_classroom','classroom_presentation_index',
            'visited_videocall','visited_facility','visited_debrief','visited_epilogue',
            'dog_interactions','pug_interactions','fireplace_interactions',
            'frequency_tuned','military_frequency','sstv_transmission_received','sstv_decoded',
            'sstv_coordinates_known','second_transmission_ready','first_message_decoded',
            'second_message_decoded','message_decoded',
            'klooster_unlocked','first_klooster_visit','checked_courtyard',
            'found_usb_stick','saw_usb_first_time','picked_up_usb',
            'usb_analyzed','evidence_unlocked','viewed_schematics','started_ally_search',
            'volkov_investigated','collected_evidence','contacted_allies','all_allies_contacted','checked_email',
            'cees_contacted','jaap_contacted','henk_contacted','contacted_kubecka',
            'eva_contacted','identified_eva','has_flipper_zero',
            'dwingeloo_broadcast_found','dwingeloo_transmitter_found',
            'westerbork_camera_inspected','westerbork_bt_cracked','bt_camera_quest_started',
            'zerfall_network_mapped','zerfall_duration_known',
            'astron_unlocked','astron_complete','schematics_verified','signal_triangulated',
            'facility_unlocked','drove_to_facility','entered_facility','facility_interior_entered',
            'facility_password_solved','badge_cloned','data_extracted','discovered_zerfall',
            'eva_arrived','kubecka_arrived',
            'debrief_complete','epilogue_complete'
        ];
        const FIELD_FLAGS = [
            'frequency_tuned','military_frequency','sstv_transmission_received','sstv_decoded',
            'sstv_coordinates_known','klooster_unlocked','first_klooster_visit','found_usb_stick',
            'picked_up_usb','usb_analyzed','evidence_unlocked','dwingeloo_broadcast_found',
            'visited_dwingeloo','visited_westerbork_memorial','bt_camera_quest_started',
            'westerbork_bt_cracked','zerfall_network_mapped'
        ];
        const FACILITY_FLAGS = [
            ...FIELD_FLAGS,
            'astron_unlocked','astron_complete','schematics_verified','signal_triangulated',
            'facility_unlocked','drove_to_facility'
        ];
        if (preset === 'complete_all') {
            ALL_FLAGS.forEach(fl => this.setFlag(fl, true));
            this.gameState.storyPart = 18;
            this.showNotification('All flags set to TRUE, story part 18');
        } else if (preset === 'reset_all') {
            ALL_FLAGS.forEach(fl => this.setFlag(fl, false));
            this.gameState.storyPart = 0;
            this.showNotification('All flags RESET, story part 0');
        } else if (preset === 'unlock_field') {
            FIELD_FLAGS.forEach(fl => this.setFlag(fl, true));
            this.gameState.storyPart = 8;
            this.showNotification('Field Ops unlocked — story part 8');
        } else if (preset === 'unlock_facility') {
            FACILITY_FLAGS.forEach(fl => this.setFlag(fl, true));
            this.gameState.storyPart = 12;
            this.showNotification('Facility unlocked — story part 12');
        }
        const old = document.getElementById('debug-panel');
        if (old) old.remove();
        this.createDebugPanel();
    }
    
    /**
     * Clean up all engine resources. Call when the engine is being destroyed.
     */
    destroy() {
        // Remove all tracked event listeners
        for (const { target, event, handler, options } of this._boundHandlers) {
            target.removeEventListener(event, handler, options);
        }
        this._boundHandlers = [];
        
        // Stop speech
        this.stopSpeech();
        
        // Abort typewriter
        if (this.typewriterAbortController) {
            this.typewriterAbortController.abort();
            this.typewriterAbortController = null;
        }
        
        // Destroy player
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        
        // Clean up debug panel styles
        const debugStyles = document.getElementById('debug-panel-styles');
        if (debugStyles) debugStyles.remove();
        const debugPanel = document.getElementById('debug-panel');
        if (debugPanel) debugPanel.remove();
        
        this.initialized = false;
        console.log('CyberQuest Engine destroyed');
    }
    
    setupKloosterTest() {
        // Set all necessary flags and state to test Klooster scene
        this.setFlag('made_espresso', true);
        this.setFlag('visited_mancave', true);
        this.setFlag('first_message_decoded', true);
        this.setFlag('second_message_decoded', true);
        this.setFlag('klooster_unlocked', true);
        this.gameState.storyPart = 7;
        
        // Add quest
        this.addQuest({
            id: 'go_to_klooster',
            name: 'Meet at Ter Apel Klooster',
            description: 'Someone wants to meet at 23:00',
            hint: 'Check the parking area'
        });
        
        // Give items
        this.addItem({
            id: 'flipper_zero',
            name: 'Flipper Zero',
            description: 'Multi-tool device for RFID, NFC, infrared, and GPIO hacking.',
            icon: 'assets/images/icons/flipper-zero.svg'
        });
        
        this.showNotification('✅ Klooster test setup complete!');
        this.loadScene('klooster');
    }
    
    giveDebugItem(itemId) {
        const items = {
            flipper_zero: {
                id: 'flipper_zero',
                name: 'Flipper Zero',
                description: 'Multi-tool device for RFID, NFC, infrared, and GPIO hacking.',
                icon: 'assets/images/icons/flipper-zero.svg'
            },
            meshtastic: {
                id: 'meshtastic',
                name: 'Meshtastic Device',
                description: 'LoRa mesh network radio for off-grid communications.',
                icon: 'assets/images/icons/meshtastic.svg'
            },
            usb_stick: {
                id: 'usb_stick',
                name: 'USB Stick',
                description: 'Black USB stick with note: TRUST THE PROCESS - AIR-GAPPED ONLY',
                icon: 'assets/images/icons/usb-stick.svg'
            },
            wifi_pineapple: {
                id: 'wifi_pineapple',
                name: 'WiFi Pineapple',
                description: 'Wireless auditing device for network reconnaissance.',
                icon: 'assets/images/icons/wifi-pineapple.svg'
            },
            hackrf: {
                id: 'hackrf',
                name: 'HackRF One',
                description: 'Open-source software-defined radio (1 MHz – 6 GHz).',
                icon: 'assets/images/icons/hackrf.svg'
            },
            night_vision: {
                id: 'night_vision',
                name: 'Night Vision Goggles',
                description: 'Military surplus night vision goggles.',
                icon: 'assets/images/icons/night-vision.svg'
            },
            sstv_decoded_image: {
                id: 'sstv_decoded_image',
                name: 'SSTV Decoded Image',
                description: 'Surveillance photo of Ryan\'s farmhouse decoded from SSTV transmission on 14.230 MHz. Hidden steganographic data: GPS coordinates near Westerbork + timestamp.',
                icon: 'assets/images/icons/evidence.svg'
            },
            dwingeloo_signal_log: {
                id: 'dwingeloo_signal_log',
                name: 'Dwingeloo Signal Log',
                description: 'RF signal log from the Dwingeloo telescope facility.',
                icon: 'assets/images/icons/evidence.svg'
            },
            relay_transmitter: {
                id: 'relay_transmitter',
                name: 'Relay Transmitter',
                description: 'Modified signal relay transmitter found at Westerbork.',
                icon: 'assets/images/icons/evidence.svg'
            },
            modified_camera: {
                id: 'modified_camera',
                name: 'Modified Camera',
                description: 'Surveillance camera with a hidden Bluetooth transmitter.',
                icon: 'assets/images/icons/evidence.svg'
            },
            zerfall_bt_node: {
                id: 'zerfall_bt_node',
                name: 'Zerfall BT Node',
                description: 'Bluetooth network node from Project Zerfall infrastructure.',
                icon: 'assets/images/icons/evidence.svg'
            }
        };

        if (items[itemId]) {
            this.addItem(items[itemId]);
        }
    }
    
    testEvidenceViewer() {
        // Test with a sample text document
        this.showEvidence({
            id: 'test_readme',
            type: 'text',
            title: 'README.txt',
            author: 'E',
            date: '2026-02-05',
            content: `TRUST THE PROCESS

Ryan,

If you're reading this, you received my signal and you're smarter than I thought.

What you have here is evidence of Project Echo - a radiofrequency weapon being developed at the Steckerdoser Heide facility in Germany.

The files are encrypted. The password is the frequency you tuned into. You'll know when you see it.

Time is short. 72 hours from the timestamp on this file.

Study the evidence. You'll see why this can't go public through normal channels. The people protecting this project have infiltrated too deep.

You're being watched. Use air-gapped systems only.

Good luck.

- E`,
            onRead: (game) => {
                console.log('Test document read!');
            }
        });
    }
    
    testPasswordPuzzle() {
        // Test with the frequency password puzzle (243 MHz)
        this.showPasswordPuzzle({
            id: 'test_frequency',
            title: 'Encrypted Archive',
            description: 'Enter the frequency you discovered on the military channel. Format: XXX (MHz)',
            correctAnswer: ['243', '243 MHz', '243MHz', '243 mhz'],
            hint: 'Think back to the signal you intercepted. What frequency was it on?',
            placeholder: 'Enter frequency...',
            inputType: 'text',
            maxAttempts: 5,
            onSuccess: (game) => {
                game.showNotification('✓ Archive unlocked!');
                console.log('Test puzzle solved!');
            },
            onFailure: (game, maxReached) => {
                if (maxReached) {
                    game.showNotification('✗ Archive locked. Try again later.');
                }
            }
        });
    }
    
    testChatSignal() {
        // Test Signal conversation with Chris Kubecka
        this.showChat({
            id: 'test_signal',
            type: 'signal',
            contact: 'Chris Kubecka',
            contactSubtitle: '+1 (555) 0123',
            messages: [
                {
                    from: 'Ryan',
                    text: 'Chris - need your OSINT magic. Looking into someone named Volkov, possibly Russian, working on RF weapons research in Germany. High stakes, short timeline. Can you dig?',
                    timestamp: '14:23'
                },
                {
                    from: 'Chris Kubecka',
                    text: 'Volkov? I know that name. Give me an hour.',
                    timestamp: '14:25'
                },
                {
                    from: 'Chris Kubecka',
                    text: 'Okay, this is interesting. Dimitri Volkov, 52, former Soviet military researcher. Officially "defected" in 1998 after the USSR collapse.',
                    timestamp: '15:18'
                },
                {
                    from: 'Chris Kubecka',
                    text: 'Here\'s the kicker: he was part of a Soviet program called СПЕКТР (Spektr) in the late 80s. Classified RF research. The program was supposedly shut down, but rumors say the research continued... privately.',
                    timestamp: '15:19'
                },
                {
                    from: 'Chris Kubecka',
                    text: 'If he\'s at that German facility, they didn\'t hire a consultant. They hired the architect of Soviet RF warfare.\n\nBe careful, Ryan. People who dig into Volkov tend to have accidents.',
                    timestamp: '15:20'
                }
            ]
        });
    }
    
    testChatMeshtastic() {
        // Test Meshtastic conversation
        this.showChat({
            id: 'test_meshtastic',
            type: 'meshtastic',
            contact: 'Cees Bassa',
            contactSubtitle: 'Node: NL-DRN-042',
            messages: [
                {
                    from: 'Ryan',
                    text: '[ENCRYPTED] Need to talk. Secure channel. M.',
                    timestamp: '22:15'
                },
                {
                    from: 'Cees Bassa',
                    text: '[ACK] Switching to private mesh. What\'s up?',
                    timestamp: '22:17'
                },
                {
                    from: 'Ryan',
                    text: 'Got something big. RF weapon development. German facility. Need signal analysis expertise.',
                    timestamp: '22:18'
                },
                {
                    from: 'Cees Bassa',
                    text: 'How big? And how dangerous?',
                    timestamp: '22:19'
                },
                {
                    from: 'Ryan',
                    text: 'Civilian casualties already. Test "accidents". This thing can crash cars, planes, disable pacemakers.',
                    timestamp: '22:20'
                },
                {
                    from: 'Cees Bassa',
                    text: '...Jesus. Send me the schematics over dead drop. Will analyze.',
                    timestamp: '22:23'
                }
            ]
        });
    }
    
    testChatBBS() {
        // Test BBS conversation
        this.showChat({
            id: 'test_bbs',
            type: 'bbs',
            contact: '>>> SHADOWBOARD BBS',
            contactSubtitle: 'Connected: 2400 baud',
            messages: [
                {
                    from: 'SYSOP',
                    text: '=== SECURE MESSAGE BOARD ===\n> Private area for: PIETER',
                    timestamp: '03:42'
                },
                {
                    from: 'Ryan',
                    text: 'P - Old friend. Got RF tech puzzle. Bluetooth/wireless vulnerabilities. Need your brain. Still awake?',
                    timestamp: '03:43'
                },
                {
                    from: 'Pieter',
                    text: 'Ryan? Damn, haven\'t heard from you in ages. What kind of RF tech?',
                    timestamp: '03:47'
                },
                {
                    from: 'Ryan',
                    text: 'Military-grade signal manipulation. Can disable electronics at range. Probably EM pulse variant.',
                    timestamp: '03:48'
                },
                {
                    from: 'Pieter',
                    text: 'Shit. That\'s not just tech. That\'s a weapon. Where\'d you find this?',
                    timestamp: '03:49'
                },
                {
                    from: 'Ryan',
                    text: 'German facility. But Russian fingerprints all over it. Need to understand how it works before I can stop it.',
                    timestamp: '03:50'
                },
                {
                    from: 'Pieter',
                    text: 'Send me what you have. Encrypted. Let me see if it matches any known attack vectors.',
                    timestamp: '03:52'
                }
            ]
        });
    }
}

// Export for use
window.CyberQuestEngine = CyberQuestEngine;
