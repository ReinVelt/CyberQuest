/**
 * CyberQuest - Core Game Engine
 * Sierra-style adventure game engine
 */

/** @type {Object} Engine configuration constants */
const ENGINE_CONFIG = Object.freeze({
    TRANSITION_DURATION: 500,
    SCENE_CHANGE_DELAY: 300,
    INVENTORY_AUTO_CLOSE: 2000,
    TYPEWRITER_SPEED: 30,
    NOTIFICATION_DURATION: 3000,
    NOTIFICATION_FADE: 500,
    DEFAULT_TIME: '08:00',
    DEFAULT_DAY: 1,
    HOURS_IN_DAY: 24,
    MINUTES_IN_HOUR: 60,
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
            time: ENGINE_CONFIG.DEFAULT_TIME,
            day: ENGINE_CONFIG.DEFAULT_DAY
        });
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
        
        // Dependency injection for testing
        this._deps = deps;
        this._storage = deps.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
        
        // Track event handlers for cleanup
        this._boundHandlers = [];
        
        // Track scene-scoped timeouts — auto-cleared on scene exit
        this._sceneTimeouts = [];
    }
    
    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        // Create DOM structure
        this.createGameContainer();
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
                    <button id="menu-voice" title="Toggle Voice">🔊 Voice</button>
                    <button id="menu-save">💾 Save</button>
                    <button id="menu-load">📂 Load</button>
                    <button id="menu-settings">⚙️ Settings</button>
                </div>
            </div>
            <div id="notification-area"></div>
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
            if (this.isDialogueActive && e.target.closest('#dialogue-box')) {
                e.preventDefault();
                this.advanceDialogue();
            }
        };
        this._addTrackedListener(document, 'click', handleDialogueInteraction);
        this._addTrackedListener(document, 'touchend', handleDialogueInteraction);
        
        // Scene interaction for walking (click and touch)
        const handleSceneInteraction = (e) => {
            // Don't walk if clicking on UI, hotspots, or during dialogue/puzzle
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
        addButtonHandler('menu-save', () => this.saveGame());
        addButtonHandler('menu-load', () => this.loadGame());
        addButtonHandler('menu-voice', () => this.toggleVoice());
        
        // Keyboard shortcuts
        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                this.closePuzzle();
            }
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
    
    async loadScene(sceneId, transition = 'fade') {
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
        
        // Transition out
        if (transition === 'fade') {
            sceneContainer.classList.add('fade-out');
            await this.wait(ENGINE_CONFIG.TRANSITION_DURATION);
        }
        
        this.currentScene = sceneId;
        
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
        
        // Transition in
        if (transition === 'fade') {
            sceneContainer.classList.remove('fade-out');
            sceneContainer.classList.add('fade-in');
            await this.wait(ENGINE_CONFIG.TRANSITION_DURATION);
            sceneContainer.classList.remove('fade-in');
        }
        
        // Update URL hash for navigation
        if (typeof window !== 'undefined') {
            window.location.hash = sceneId;
        }
        
        console.log(`Scene loaded: ${sceneId}`);
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
            
            if (hotspot.cursor) {
                element.style.cursor = hotspot.cursor;
            }
            
            // Tooltip
            if (hotspot.name) {
                element.setAttribute('data-tooltip', hotspot.name);
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
        if (this.isDialogueActive || this.isPuzzleActive) return;
        
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
            }, ENGINE_CONFIG.SCENE_CHANGE_DELAY);
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
                <img src="${item.icon || 'assets/images/item-default.png'}" alt="${item.name}">
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
    startDialogue(dialogue) {
        if (!dialogue) {
            console.error('startDialogue: dialogue is required');
            return;
        }
        this.dialogueQueue = Array.isArray(dialogue) ? [...dialogue] : [dialogue];
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
            };
            const portraitPath = current.portrait ||
                PORTRAIT_MAP[speaker.toLowerCase()] || '';
            portraitEl.style.backgroundImage = portraitPath ? `url('${portraitPath}')` : 'none';
        }
        
        // Execute action callback if provided (for visual changes, etc.)
        if (current.action && typeof current.action === 'function') {
            current.action(this);
        }
        
        // Typewriter effect
        this.typeText(textEl, current.text || '', ENGINE_CONFIG.TYPEWRITER_SPEED, this.typewriterAbortController.signal);
        
        // Speak the dialogue
        this.speakText(current.text, speaker);
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
        this.isDialogueActive = false;
        this.stopSpeech();
        
        // Abort any ongoing typewriter effect
        if (this.typewriterAbortController) {
            this.typewriterAbortController.abort();
            this.typewriterAbortController = null;
        }
        
        const dialogueBox = document.getElementById('dialogue-box');
        if (dialogueBox) dialogueBox.classList.add('hidden');
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
            this.voiceManager.speak(textStr, speaker);
        }
    }
    
    stopSpeech() {
        if (this.voiceManager) {
            this.voiceManager.stop();
        }
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
        
        if (!this.gameState.activeQuests.find(q => q.id === quest.id)) {
            this.gameState.activeQuests.push(quest);
            this.updateQuestUI();
            this.showNotification(`New Quest: ${quest.name || quest.id}`);
        }
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
                ${quest.hint ? `<div class="quest-hint">💡 ${quest.hint}</div>` : ''}
            `;
            container.appendChild(element);
        });
    }
    
    // Puzzle System
    startPuzzle(puzzleConfig) {
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
        if (this.passwordPuzzle) {
            this.passwordPuzzle.show(config);
        } else {
            console.error('Password puzzle system not initialized');
            this.showNotification('Cannot display puzzle');
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
    saveGame() {
        try {
            const saveData = {
                currentScene: this.currentScene,
                inventory: this.inventory,
                gameState: this.gameState,
                timestamp: new Date().toISOString()
            };
            if (this._storage) {
                this._storage.setItem('cyberquest_save', JSON.stringify(saveData));
            }
            this.showNotification('Game saved!');
        } catch (err) {
            console.error('Failed to save game:', err);
            this.showNotification('Failed to save game.');
        }
    }
    
    loadGame() {
        try {
            const saveData = this._storage ? this._storage.getItem('cyberquest_save') : null;
            if (saveData) {
                const data = JSON.parse(saveData);
                this.inventory = Array.isArray(data.inventory) ? data.inventory : [];
                // Merge with defaults to ensure all fields exist
                const defaults = JSON.parse(JSON.stringify(this._defaultGameState));
                this.gameState = { ...defaults, ...data.gameState };
                // Ensure nested structures exist
                this.gameState.flags = this.gameState.flags || {};
                this.gameState.activeQuests = Array.isArray(this.gameState.activeQuests) ? this.gameState.activeQuests : [];
                this.gameState.questsCompleted = Array.isArray(this.gameState.questsCompleted) ? this.gameState.questsCompleted : [];
                
                this.updateInventoryUI();
                this.updateQuestUI();
                const dayEl = document.getElementById('game-day');
                const timeEl = document.getElementById('game-time');
                if (dayEl) dayEl.textContent = `Day ${this.gameState.day}`;
                if (timeEl) timeEl.textContent = this.gameState.time;
                if (data.currentScene) {
                    this.loadScene(data.currentScene);
                }
                this.showNotification('Game loaded!');
            } else {
                this.showNotification('No save file found.');
            }
        } catch (err) {
            console.error('Failed to load game:', err);
            this.showNotification('Failed to load saved game. Save data may be corrupted.');
        }
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
        if (!panel) {
            panel = this.createDebugPanel();
        }
        panel.classList.toggle('hidden');
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

        panel.innerHTML = `
            <div class="debug-header">🛠️ DEBUG PANEL — D to close &nbsp;|&nbsp; Scene: <b>${cur.currentScene || 'none'}</b> &nbsp;|&nbsp; Story Part: <b>${cur.storyPart}</b></div>
            <div class="debug-content">

                <div class="debug-section">
                    <h3>📍 Jump to Scene</h3>
                    <div class="debug-scene-grid">
                        <span class="scene-group">— Intro / Home —</span>
                        <button onclick="game.loadScene('intro');game.toggleDebugPanel()">intro</button>
                        <button onclick="game.loadScene('home');game.toggleDebugPanel()">home</button>
                        <button onclick="game.loadScene('livingroom');game.toggleDebugPanel()">livingroom</button>
                        <button onclick="game.loadScene('tvdocumentary');game.toggleDebugPanel()">tvdocumentary</button>
                        <span class="scene-group">— Mancave Hub —</span>
                        <button onclick="game.loadScene('mancave');game.toggleDebugPanel()">mancave</button>
                        <button onclick="game.loadScene('sdr_bench');game.toggleDebugPanel()">sdr_bench</button>
                        <button onclick="game.loadScene('planboard');game.toggleDebugPanel()">planboard</button>
                        <button onclick="game.loadScene('videocall');game.toggleDebugPanel()">videocall</button>
                        <span class="scene-group">— Outdoors / Travel —</span>
                        <button onclick="game.loadScene('garden');game.toggleDebugPanel()">garden</button>
                        <button onclick="game.loadScene('regional_map');game.toggleDebugPanel()">regional_map</button>
                        <button onclick="game.setFlag('driving_destination','klooster');game.loadScene('driving');game.toggleDebugPanel()">driving→klooster</button>
                        <button onclick="game.setFlag('driving_destination','home');game.loadScene('driving');game.toggleDebugPanel()">driving→home</button>
                        <button onclick="game.setFlag('driving_destination','facility');game.loadScene('driving');game.toggleDebugPanel()">driving→facility</button>
                        <button onclick="game.setFlag('driving_destination','astron');game.loadScene('driving_day');game.toggleDebugPanel()">driving_day→astron</button>
                        <button onclick="game.setFlag('driving_destination','home_from_astron');game.loadScene('driving_day');game.toggleDebugPanel()">driving_day→home</button>
                        <span class="scene-group">— Field Locations —</span>
                        <button onclick="game.loadScene('klooster');game.toggleDebugPanel()">klooster</button>
                        <button onclick="game.loadScene('car_discovery');game.toggleDebugPanel()">car_discovery</button>
                        <button onclick="game.loadScene('dwingeloo');game.toggleDebugPanel()">dwingeloo</button>
                        <button onclick="game.loadScene('westerbork_memorial');game.toggleDebugPanel()">westerbork_memorial</button>
                        <span class="scene-group">— WSRT / ASTRON —</span>
                        <button onclick="game.loadScene('astron');game.toggleDebugPanel()">astron</button>
                        <span class="scene-group">— Facility —</span>
                        <button onclick="game.loadScene('facility');game.toggleDebugPanel()">facility</button>
                        <button onclick="game.loadScene('facility_interior');game.toggleDebugPanel()">facility_interior</button>
                        <button onclick="game.loadScene('facility_server');game.toggleDebugPanel()">facility_server</button>
                        <span class="scene-group">— Endgame —</span>
                        <button onclick="game.loadScene('debrief');game.toggleDebugPanel()">debrief</button>
                        <button onclick="game.loadScene('epilogue');game.toggleDebugPanel()">epilogue</button>
                        <button onclick="game.loadScene('credits');game.toggleDebugPanel()">credits</button>
                    </div>
                </div>

                <div class="debug-section">
                    <h3>📖 Story Part &nbsp;<small style="color:#888">current: <b>${cur.storyPart}</b></small></h3>
                    ${[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(n => `<button onclick="game.debugSetStoryPart(${n})" ${cur.storyPart === n ? 'style="background:#00ff88;color:#000;font-weight:bold"' : ''}>${n}</button>`).join('')}
                </div>

                <div class="debug-section">
                    <h3>🚩 Flags &nbsp;<small style="color:#888">click to toggle — <span style="color:#00ff88">green=true</span> / dim=false</small></h3>
                    <div class="debug-flags-grid">
                        <span class="flag-group">— Game Start / Home —</span>
                        ${fb('game_started')}${fb('made_espresso')}${fb('espresso_count')}${fb('talked_to_ies')}
                        ${fb('saw_tv_documentary')}${fb('tv_documentary_watched')}${fb('documentary_completed_once')}${fb('post_documentary_reminder_shown')}
                        <span class="flag-group">— Visited Scenes —</span>
                        ${fb('visited_livingroom')}${fb('visited_garden')}${fb('visited_mancave')}${fb('visited_sdr_bench')}
                        ${fb('visited_dwingeloo')}${fb('visited_westerbork_memorial')}${fb('visited_astron')}${fb('visited_planboard')}
                        ${fb('visited_videocall')}${fb('visited_facility')}${fb('visited_debrief')}${fb('visited_epilogue')}
                        <span class="flag-group">— Interactions / Counters —</span>
                        ${fb('dog_interactions')}${fb('pug_interactions')}${fb('fireplace_interactions')}
                        ${fb('father_call_count')}${fb('mother_call_count')}
                        <span class="flag-group">— SSTV / Signal —</span>
                        ${fb('frequency_tuned')}${fb('military_frequency')}${fb('sstv_transmission_received')}${fb('sstv_decoded')}
                        ${fb('sstv_coordinates_known')}${fb('second_transmission_ready')}
                        ${fb('first_message_decoded')}${fb('second_message_decoded')}${fb('message_decoded')}
                        <span class="flag-group">— Klooster —</span>
                        ${fb('klooster_unlocked')}${fb('first_klooster_visit')}${fb('checked_courtyard')}
                        ${fb('found_usb_stick')}${fb('saw_usb_first_time')}${fb('picked_up_usb')}
                        <span class="flag-group">— Investigation —</span>
                        ${fb('usb_analyzed')}${fb('evidence_unlocked')}${fb('viewed_schematics')}${fb('started_ally_search')}
                        ${fb('volkov_investigated')}${fb('collected_evidence')}${fb('contacted_allies')}${fb('all_allies_contacted')}${fb('checked_email')}
                        <span class="flag-group">— Allies —</span>
                        ${fb('cees_contacted')}${fb('jaap_contacted')}${fb('henk_contacted')}${fb('contacted_kubecka')}
                        ${fb('eva_contacted')}${fb('identified_eva')}${fb('has_flipper_zero')}
                        <span class="flag-group">— Field: Dwingeloo / Westerbork —</span>
                        ${fb('dwingeloo_broadcast_found')}${fb('dwingeloo_transmitter_found')}
                        ${fb('westerbork_camera_inspected')}${fb('westerbork_bt_cracked')}
                        ${fb('bt_camera_quest_started')}${fb('zerfall_network_mapped')}${fb('zerfall_duration_known')}
                        <span class="flag-group">— WSRT / ASTRON —</span>
                        ${fb('astron_unlocked')}${fb('astron_complete')}${fb('schematics_verified')}${fb('signal_triangulated')}
                        <span class="flag-group">— Facility —</span>
                        ${fb('facility_unlocked')}${fb('drove_to_facility')}${fb('entered_facility')}${fb('facility_interior_entered')}
                        ${fb('facility_password_solved')}${fb('badge_cloned')}${fb('data_extracted')}
                        ${fb('discovered_zerfall')}${fb('eva_arrived')}${fb('kubecka_arrived')}
                        <span class="flag-group">— Endgame —</span>
                        ${fb('debrief_complete')}${fb('epilogue_complete')}
                    </div>
                </div>

                <div class="debug-section">
                    <h3>🎒 Give Items</h3>
                    <span style="color:#888;font-size:0.78rem">Inventory: </span>
                    <button onclick="game.giveDebugItem('flipper_zero')">Flipper Zero</button>
                    <button onclick="game.giveDebugItem('meshtastic')">Meshtastic</button>
                    <button onclick="game.giveDebugItem('usb_stick')">USB Stick</button>
                    <button onclick="game.giveDebugItem('wifi_pineapple')">WiFi Pineapple</button>
                    <button onclick="game.giveDebugItem('hackrf')">HackRF One</button>
                    <button onclick="game.giveDebugItem('night_vision')">Night Vision</button>
                    <br/>
                    <span style="color:#888;font-size:0.78rem">Evidence: </span>
                    <button onclick="game.giveDebugItem('sstv_decoded_image')">SSTV Image</button>
                    <button onclick="game.giveDebugItem('dwingeloo_signal_log')">Dwingeloo Log</button>
                    <button onclick="game.giveDebugItem('relay_transmitter')">Relay Transmitter</button>
                    <button onclick="game.giveDebugItem('modified_camera')">Modified Camera</button>
                    <button onclick="game.giveDebugItem('zerfall_bt_node')">Zerfall BT Node</button>
                </div>

                <div class="debug-section">
                    <h3>⚡ Quick Presets</h3>
                    <button onclick="game.setupKloosterTest();game.toggleDebugPanel()">✅ Klooster Test</button>
                    <button onclick="game.debugPreset('unlock_field')">✅ Unlock Field Ops (part 8)</button>
                    <button onclick="game.debugPreset('unlock_facility')">✅ Unlock Facility (part 12)</button>
                    <button onclick="game.debugPreset('complete_all')">✅ Set ALL Flags True</button>
                    <button onclick="game.debugPreset('reset_all')" style="border-color:#ff4444;color:#ff4444">⛔ Reset ALL Flags</button>
                </div>

                <div class="debug-section">
                    <h3>🧪 Test Tools</h3>
                    <button onclick="game.testEvidenceViewer()">Evidence Viewer</button>
                    <button onclick="game.testPasswordPuzzle()">Password Puzzle</button>
                    <button onclick="game.testChatSignal()">Signal Chat</button>
                    <button onclick="game.testChatMeshtastic()">Meshtastic Chat</button>
                    <button onclick="game.testChatBBS()">BBS Terminal</button>
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
                    max-width: 1100px;
                    max-height: 88vh;
                    overflow-y: auto;
                    font-family: 'Courier New', monospace;
                }
                .debug-panel.hidden { display: none; }
                .debug-header {
                    color: #00ff88;
                    font-size: 0.95rem;
                    font-weight: bold;
                    margin-bottom: 14px;
                    text-align: center;
                    border-bottom: 1px solid #00ff88;
                    padding-bottom: 10px;
                }
                .debug-content { color: #eaeaea; }
                .debug-section {
                    margin-bottom: 12px;
                    padding: 10px;
                    background: rgba(0,255,136,0.04);
                    border-radius: 4px;
                }
                .debug-section h3 {
                    color: #00ff88;
                    font-size: 0.85rem;
                    margin: 0 0 8px 0;
                }
                .debug-section button {
                    background: #111;
                    color: #00ff88;
                    border: 1px solid #00ff88;
                    padding: 4px 8px;
                    margin: 2px;
                    cursor: pointer;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.78rem;
                }
                .debug-section button:hover { background: #00ff88; color: #000; }
                .debug-scene-grid, .debug-flags-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 3px;
                    align-items: center;
                }
                .scene-group, .flag-group {
                    color: #666;
                    font-size: 0.72rem;
                    width: 100%;
                    margin-top: 5px;
                    display: block;
                }
                .debug-flag-btn {
                    padding: 3px 7px;
                    margin: 2px;
                    cursor: pointer;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.72rem;
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

    debugSetStoryPart(n) {
        this.gameState.storyPart = n;
        this.showNotification(`Story Part set to ${n}`);
        const old = document.getElementById('debug-panel');
        if (old) old.remove();
        this.createDebugPanel();
    }

    debugPreset(preset) {
        const ALL_FLAGS = [
            'game_started','made_espresso','espresso_count','talked_to_ies','saw_tv_documentary',
            'tv_documentary_watched','documentary_completed_once','post_documentary_reminder_shown',
            'visited_livingroom','visited_garden','visited_mancave','visited_sdr_bench',
            'visited_dwingeloo','visited_westerbork_memorial','visited_astron','visited_planboard',
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
                description: 'Image decoded from SSTV transmission — shows facility coordinates.',
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
