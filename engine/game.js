/**
 * CyberQuest - Core Game Engine
 * Sierra-style adventure game engine
 */

class CyberQuestEngine {
    constructor() {
        this.currentScene = null;
        this.scenes = {};
        this.inventory = [];
        this.gameState = {
            storyPart: 0,
            questsCompleted: [],
            activeQuests: [],
            flags: {},
            time: '08:00',
            day: 1
        };
        this.dialogueQueue = [];
        this.isDialogueActive = false;
        this.isPuzzleActive = false;
        this.initialized = false;
        this.voiceEnabled = true;
        this.voiceManager = window.voiceManager || null;
        this.player = null;
        this.evidenceViewer = null;
        this.passwordPuzzle = null;
        this.chatInterface = null;
        this.typewriterAbortController = null;
    }
    
    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        // Create DOM structure
        this.createGameContainer();
        this.bindEvents();
        this.loadGameState();
        
        // Initialize voice manager (ensure it's connected)
        this.voiceManager = window.voiceManager || null;
        if (this.voiceManager) {
            console.log('Voice system connected');
        } else {
            console.warn('Voice system not available');
        }
        
        // Initialize player character
        this.initPlayer();
        
        // Initialize evidence viewer
        if (window.EvidenceViewer) {
            this.evidenceViewer = new EvidenceViewer(this);
            console.log('Evidence viewer initialized');
        }
        
        // Initialize password puzzle system
        if (window.PasswordPuzzle) {
            this.passwordPuzzle = new PasswordPuzzle(this);
            console.log('Password puzzle system initialized');
        }
        
        // Initialize chat interface
        if (window.ChatInterface) {
            this.chatInterface = new ChatInterface(this);
            console.log('Chat interface initialized');
        }
        
        console.log('CyberQuest Engine initialized');
    }
    
    initPlayer() {
        if (window.PlayerCharacter) {
            this.player = new window.PlayerCharacter(this);
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
            <div id="scene-container">
                <div id="scene-background"></div>
                <div id="scene-hotspots"></div>
                <div id="scene-characters"></div>
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
                <div id="inventory-bar">
                    <div id="inventory-toggle">
                        <span class="icon">🎒</span>
                        <span class="label">Inventory</span>
                    </div>
                    <div id="inventory-items" class="hidden"></div>
                </div>
                <div id="quest-log">
                    <div id="quest-toggle">
                        <span class="icon">📋</span>
                        <span class="label">Quests</span>
                    </div>
                    <div id="quest-list" class="hidden"></div>
                </div>
                <div id="game-menu">
                    <button id="menu-voice" title="Toggle Voice">🔊 Voice</button>
                    <button id="menu-save">💾 Save</button>
                    <button id="menu-load">📂 Load</button>
                    <button id="menu-settings">⚙️ Settings</button>
                </div>
            </div>
            <div id="puzzle-overlay" class="hidden">
                <div id="puzzle-container"></div>
            </div>
            <div id="notification-area"></div>
            <div id="time-display">
                <span id="game-day">Day 1</span>
                <span id="game-time">08:00</span>
            </div>
        `;
    }
    
    bindEvents() {
        // Dialogue continuation (click and touch)
        const handleDialogueInteraction = (e) => {
            if (this.isDialogueActive && e.target.closest('#dialogue-box')) {
                e.preventDefault();
                this.advanceDialogue();
            }
        };
        document.addEventListener('click', handleDialogueInteraction);
        document.addEventListener('touchend', handleDialogueInteraction);
        
        // Scene interaction for walking (click and touch)
        const handleSceneInteraction = (e) => {
            // Don't walk if clicking on UI, hotspots, or during dialogue/puzzle
            if (this.isDialogueActive || this.isPuzzleActive) return;
            if (e.target.closest('.hotspot')) return;
            if (e.target.closest('#ui-overlay')) return;
            
            e.preventDefault();
            
            // Calculate position as percentage
            const sceneContainer = document.getElementById('scene-container');
            const rect = sceneContainer.getBoundingClientRect();
            
            // Handle both touch and mouse events
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const x = ((clientX - rect.left) / rect.width) * 100;
            const y = ((clientY - rect.top) / rect.height) * 100;
            
            // Walk to position
            if (this.player) {
                this.player.walkTo(x, y);
            }
        };
        document.getElementById('scene-container')?.addEventListener('click', handleSceneInteraction);
        document.getElementById('scene-container')?.addEventListener('touchstart', handleSceneInteraction);
        
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
        document.addEventListener('keydown', (e) => {
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
        });
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
        
        // Call onExit for the current scene before leaving
        if (this.currentScene && this.scenes[this.currentScene] && this.scenes[this.currentScene].onExit) {
            this.scenes[this.currentScene].onExit(this);
        }
        
        const sceneContainer = document.getElementById('scene-container');
        
        // Transition out
        if (transition === 'fade') {
            sceneContainer.classList.add('fade-out');
            await this.wait(500);
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
            scene.onEnter(this);
        }
        
        // Transition in
        if (transition === 'fade') {
            sceneContainer.classList.remove('fade-out');
            sceneContainer.classList.add('fade-in');
            await this.wait(500);
            sceneContainer.classList.remove('fade-in');
        }
        
        // Update URL hash for navigation
        window.location.hash = sceneId;
        
        console.log(`Scene loaded: ${sceneId}`);
    }
    
    loadHotspots(hotspots) {
        const container = document.getElementById('scene-hotspots');
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
            element.addEventListener('click', handleHotspotInteraction);
            element.addEventListener('touchstart', handleHotspotInteraction);
            
            container.appendChild(element);
        });
    }
    
    handleHotspotClick(hotspot) {
        if (this.isDialogueActive || this.isPuzzleActive) return;
        
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
        
        // Execute action
        if (hotspot.action) {
            hotspot.action(this);
        }
        
        // Navigate to scene
        if (hotspot.targetScene) {
            // Short delay for scene transitions
            setTimeout(() => {
                this.loadScene(hotspot.targetScene);
            }, 300);
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
        if (!this.inventory.find(i => i.id === item.id)) {
            this.inventory.push(item);
            this.updateInventoryUI();
            this.showNotification(`Added to inventory: ${item.name}`);
            
            // Auto-open inventory briefly
            const inventoryItems = document.getElementById('inventory-items');
            inventoryItems.classList.remove('hidden');
            setTimeout(() => inventoryItems.classList.add('hidden'), 2000);
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
            element.addEventListener('click', useItemHandler);
            element.addEventListener('touchend', useItemHandler);
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
        this.dialogueQueue = Array.isArray(dialogue) ? [...dialogue] : [dialogue];
        this.isDialogueActive = true;
        document.getElementById('dialogue-box').classList.remove('hidden');
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
        
        const speaker = current.speaker || 'Ryan';
        speakerEl.textContent = speaker;
        portraitEl.style.backgroundImage = current.portrait ? `url('${current.portrait}')` : '';
        
        // Execute action callback if provided (for visual changes, etc.)
        if (current.action && typeof current.action === 'function') {
            current.action(this);
        }
        
        // Typewriter effect
        this.typeText(textEl, current.text, 30, this.typewriterAbortController.signal);
        
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
        
        document.getElementById('dialogue-box').classList.add('hidden');
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
        
        if (!this.gameState.activeQuests.find(q => q.id === quest.id)) {
            this.gameState.activeQuests.push(quest);
            this.updateQuestUI();
            this.showNotification(`New Quest: ${quest.name}`);
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
        document.getElementById('puzzle-overlay').classList.add('hidden');
        document.getElementById('puzzle-container').innerHTML = '';
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
        const [hours, mins] = this.gameState.time.split(':').map(Number);
        let totalMins = hours * 60 + mins + minutes;
        
        if (totalMins >= 24 * 60) {
            totalMins -= 24 * 60;
            this.gameState.day++;
            document.getElementById('game-day').textContent = `Day ${this.gameState.day}`;
        }
        
        const newHours = Math.floor(totalMins / 60);
        const newMins = totalMins % 60;
        this.gameState.time = `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
        document.getElementById('game-time').textContent = this.gameState.time;
    }
    
    setStoryPart(part) {
        this.gameState.storyPart = part;
    }
    
    // Notifications
    showNotification(message, duration = 3000) {
        const area = document.getElementById('notification-area');
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        area.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
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
        const saveData = {
            currentScene: this.currentScene,
            inventory: this.inventory,
            gameState: this.gameState,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('cyberquest_save', JSON.stringify(saveData));
        this.showNotification('Game saved!');
    }
    
    loadGame() {
        const saveData = localStorage.getItem('cyberquest_save');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.inventory = data.inventory || [];
            this.gameState = data.gameState || this.gameState;
            this.updateInventoryUI();
            this.updateQuestUI();
            document.getElementById('game-day').textContent = `Day ${this.gameState.day}`;
            document.getElementById('game-time').textContent = this.gameState.time;
            if (data.currentScene) {
                this.loadScene(data.currentScene);
            }
            this.showNotification('Game loaded!');
        } else {
            this.showNotification('No save file found.');
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
        const charactersContainer = document.getElementById('scene-characters');
        if (!charactersContainer) {
            console.error('Characters container not found');
            return;
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
    
    // Debug Panel for Testing
    toggleDebugPanel() {
        let panel = document.getElementById('debug-panel');
        if (!panel) {
            panel = this.createDebugPanel();
        }
        panel.classList.toggle('hidden');
    }
    
    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.className = 'debug-panel';
        panel.innerHTML = `
            <div class="debug-header">🛠️ DEBUG PANEL (Press D to close)</div>
            <div class="debug-content">
                <div class="debug-section">
                    <h3>Jump to Scene:</h3>
                    <button onclick="game.loadScene('home');game.toggleDebugPanel()">Home</button>
                    <button onclick="game.loadScene('mancave');game.toggleDebugPanel()">Mancave</button>
                    <button onclick="game.loadScene('garden');game.toggleDebugPanel()">Garden</button>
                    <button onclick="game.loadScene('klooster');game.toggleDebugPanel()">Klooster</button>
                    <button onclick="game.setFlag('driving_destination','klooster');game.loadScene('driving');game.toggleDebugPanel()">Driving→K</button>
                    <button onclick="game.setFlag('driving_destination','home');game.loadScene('driving');game.toggleDebugPanel()">Driving→H</button>
                    <button onclick="game.loadScene('facility');game.toggleDebugPanel()">Facility</button>
                </div>
                <div class="debug-section">
                    <h3>Quick Setup for Klooster Test:</h3>
                    <button onclick="game.setupKloosterTest();game.toggleDebugPanel()">Setup + Go to Klooster</button>
                </div>
                <div class="debug-section">
                    <h3>Give Items:</h3>
                    <button onclick="game.giveDebugItem('flipper_zero')">Flipper Zero</button>
                    <button onclick="game.giveDebugItem('meshtastic')">Meshtastic</button>
                    <button onclick="game.giveDebugItem('usb_stick')">USB Stick</button>
                </div>
                <div class="debug-section">
                    <h3>Set Flags:</h3>
                    <button onclick="game.setFlag('made_espresso', true)">Made Espresso</button>
                    <button onclick="game.setFlag('first_message_decoded', true)">Decoded Msg 1</button>
                    <button onclick="game.setFlag('second_message_decoded', true)">Decoded Msg 2</button>
                    <button onclick="game.setFlag('klooster_unlocked', true)">Klooster Unlocked</button>
                </div>
                <div class="debug-section">
                    <h3>Test Evidence Viewer:</h3>
                    <button onclick="game.testEvidenceViewer()">Show Test Document</button>
                </div>
                <div class="debug-section">
                    <h3>Test Password Puzzle:</h3>
                    <button onclick="game.testPasswordPuzzle()">Show Test Puzzle</button>
                </div>
                <div class="debug-section">
                    <h3>Test Chat Interface:</h3>
                    <button onclick="game.testChatSignal()">Signal Chat</button>
                    <button onclick="game.testChatMeshtastic()">Meshtastic</button>
                    <button onclick="game.testChatBBS()">BBS Terminal</button>
                </div>
                <div class="debug-section">
                    <h3>State:</h3>
                    <button onclick="game.showNotification('Story Part: ' + game.gameState.storyPart)">Show Story Part</button>
                    <button onclick="game.gameState.storyPart = 0; game.showNotification('Reset to Part 0')">Reset Story</button>
                </div>
            </div>
        `;
        
        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .debug-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid #00ff88;
                border-radius: 8px;
                padding: 20px;
                z-index: 9999;
                min-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
            }
            .debug-panel.hidden {
                display: none;
            }
            .debug-header {
                color: #00ff88;
                font-size: 1.2rem;
                font-weight: bold;
                margin-bottom: 15px;
                text-align: center;
                border-bottom: 1px solid #00ff88;
                padding-bottom: 10px;
            }
            .debug-content {
                color: #eaeaea;
            }
            .debug-section {
                margin-bottom: 20px;
                padding: 10px;
                background: rgba(0, 255, 136, 0.05);
                border-radius: 4px;
            }
            .debug-section h3 {
                color: #00ff88;
                font-size: 0.9rem;
                margin: 0 0 10px 0;
            }
            .debug-section button {
                background: #1a1a2e;
                color: #00ff88;
                border: 1px solid #00ff88;
                padding: 5px 10px;
                margin: 3px;
                cursor: pointer;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
            }
            .debug-section button:hover {
                background: #00ff88;
                color: #1a1a2e;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(panel);
        return panel;
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
