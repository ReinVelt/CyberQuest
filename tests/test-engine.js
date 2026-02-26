/**
 * CyberQuest Engine Test Suite
 * Lightweight test framework + comprehensive unit tests
 */

// ── Minimal Test Framework ──────────────────────────────────────────

const TestRunner = {
    suites: [],
    results: { passed: 0, failed: 0, errors: [] },
    output: document.getElementById('test-output'),

    suite(name, fn) {
        this.suites.push({ name, fn });
    },

    async run() {
        for (const suite of this.suites) {
            const header = document.createElement('h2');
            header.textContent = suite.name;
            this.output.appendChild(header);

            const container = document.createElement('div');
            container.className = 'test-suite';
            this.output.appendChild(container);

            try {
                await suite.fn(this._createAssert(container));
            } catch (err) {
                this._addResult(container, false, `Suite error: ${err.message}`);
            }
        }
        this._showSummary();
    },

    _createAssert(container) {
        const self = this;
        /** Safely stringify a value, handling circular refs */
        function _safe(v) {
            try { return JSON.stringify(v); } catch { return String(v); }
        }
        return {
            ok(value, message) {
                self._addResult(container, !!value, message);
            },
            equal(actual, expected, message) {
                const pass = actual === expected;
                const msg = pass ? message : `${message} (expected ${_safe(expected)}, got ${_safe(actual)})`;
                self._addResult(container, pass, msg);
            },
            deepEqual(actual, expected, message) {
                const pass = _safe(actual) === _safe(expected);
                const msg = pass ? message : `${message} (mismatch)`;
                self._addResult(container, pass, msg);
            },
            throws(fn, message) {
                let threw = false;
                try { fn(); } catch (e) { threw = true; }
                self._addResult(container, threw, message);
            },
            doesNotThrow(fn, message) {
                let threw = false;
                let error = null;
                try { fn(); } catch (e) { threw = true; error = e; }
                const msg = threw ? `${message} (threw: ${error?.message})` : message;
                self._addResult(container, !threw, msg);
            },
            async asyncDoesNotThrow(fn, message) {
                let threw = false;
                let error = null;
                try { await fn(); } catch (e) { threw = true; error = e; }
                const msg = threw ? `${message} (threw: ${error?.message})` : message;
                self._addResult(container, !threw, msg);
            }
        };
    },

    _addResult(container, pass, message) {
        if (pass) {
            this.results.passed++;
        } else {
            this.results.failed++;
            this.results.errors.push(message);
        }
        const div = document.createElement('div');
        div.className = `test-case ${pass ? 'pass' : 'fail'}`;
        div.textContent = `${pass ? '✓' : '✗'} ${message}`;
        container.appendChild(div);
    },

    _showSummary() {
        const el = document.getElementById('test-summary');
        const total = this.results.passed + this.results.failed;
        const allPass = this.results.failed === 0;
        el.className = `summary ${allPass ? 'all-pass' : 'has-fail'}`;
        el.innerHTML = `
            ${allPass ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}<br>
            Passed: ${this.results.passed} / ${total}<br>
            Failed: ${this.results.failed}
        `;
    }
};

// ── Helpers ────────────────────────────────────────────────────────

/** Create a mock storage (localStorage replacement) */
function createMockStorage() {
    const store = {};
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { for (const k in store) delete store[k]; },
        _store: store
    };
}

/** Create a fresh engine instance with injected deps */
function createTestEngine(overrides = {}) {
    const defaultDeps = {
        storage: createMockStorage(),
        voiceManager: null,
        PlayerCharacter: null,  // skip player by default
        EvidenceViewer: null,
        PasswordPuzzle: null,
        ChatInterface: null,
        ...overrides
    };
    const engine = new CyberQuestEngine(defaultDeps);
    engine.init();
    return engine;
}

// ── Test Suites ────────────────────────────────────────────────────

// 1. ENGINE_CONFIG
TestRunner.suite('ENGINE_CONFIG Constants', (assert) => {
    assert.ok(typeof ENGINE_CONFIG === 'object', 'ENGINE_CONFIG exists');
    assert.ok(Object.isFrozen(ENGINE_CONFIG), 'ENGINE_CONFIG is frozen');
    assert.equal(ENGINE_CONFIG.TRANSITION_DURATION, 500, 'TRANSITION_DURATION is 500');
    assert.equal(ENGINE_CONFIG.DEFAULT_TIME, '08:00', 'DEFAULT_TIME is 08:00');
    assert.equal(ENGINE_CONFIG.DEFAULT_DAY, 1, 'DEFAULT_DAY is 1');
    assert.ok(ENGINE_CONFIG.NOTIFICATION_DURATION > 0, 'NOTIFICATION_DURATION is positive');
});

// 2. Constructor & Initialization
TestRunner.suite('CyberQuestEngine Constructor', (assert) => {
    const engine = createTestEngine();
    assert.ok(engine.initialized, 'Engine is initialized');
    assert.equal(engine.currentScene, null, 'No scene loaded initially');
    assert.deepEqual(engine.inventory, [], 'Empty inventory');
    assert.equal(engine.gameState.storyPart, 0, 'Story starts at part 0');
    assert.equal(engine.gameState.time, '08:00', 'Default time is 08:00');
    assert.equal(engine.gameState.day, 1, 'Default day is 1');
    assert.equal(engine.isDialogueActive, false, 'Dialogue not active');
    assert.equal(engine.isPuzzleActive, false, 'Puzzle not active');
    engine.destroy();
});

// 3. Dependency Injection
TestRunner.suite('Dependency Injection', (assert) => {
    const mockStorage = createMockStorage();
    const engine = new CyberQuestEngine({ storage: mockStorage });
    engine.init();
    assert.equal(engine._storage, mockStorage, 'Custom storage injected');
    assert.equal(engine.player, null, 'Player is null when PlayerCharacter not injected');
    assert.equal(engine.evidenceViewer, null, 'EvidenceViewer null when not injected');
    assert.equal(engine.passwordPuzzle, null, 'PasswordPuzzle null when not injected');
    assert.equal(engine.chatInterface, null, 'ChatInterface null when not injected');
    engine.destroy();
});

// 4. Flag System
TestRunner.suite('Flag System', (assert) => {
    const engine = createTestEngine();
    assert.equal(engine.getFlag('test'), undefined, 'Unknown flag returns undefined');
    engine.setFlag('test', true);
    assert.equal(engine.getFlag('test'), true, 'Set and get flag works');
    engine.setFlag('test', false);
    assert.equal(engine.getFlag('test'), false, 'Flag can be set to false');
    engine.setFlag('count', 42);
    assert.equal(engine.getFlag('count'), 42, 'Flag can hold numbers');
    engine.destroy();
});

// 5. Inventory System
TestRunner.suite('Inventory System', (assert) => {
    const engine = createTestEngine();
    
    // Valid item
    engine.addToInventory({ id: 'key', name: 'Golden Key', description: 'Opens doors' });
    assert.equal(engine.inventory.length, 1, 'Item added to inventory');
    assert.ok(engine.hasItem('key'), 'hasItem returns true for existing item');
    assert.ok(!engine.hasItem('nonexistent'), 'hasItem returns false for missing item');
    
    // Duplicate prevention
    engine.addToInventory({ id: 'key', name: 'Golden Key' });
    assert.equal(engine.inventory.length, 1, 'Duplicate item not added');
    
    // Invalid item (no id)
    engine.addToInventory({ name: 'Bad Item' });
    assert.equal(engine.inventory.length, 1, 'Item without id rejected');
    
    // Null item
    engine.addToInventory(null);
    assert.equal(engine.inventory.length, 1, 'Null item rejected');
    
    // Remove
    engine.removeFromInventory('key');
    assert.equal(engine.inventory.length, 0, 'Item removed from inventory');
    assert.ok(!engine.hasItem('key'), 'hasItem false after removal');
    
    engine.destroy();
});

// 6. Quest System
TestRunner.suite('Quest System', (assert) => {
    const engine = createTestEngine();
    
    engine.addQuest({ id: 'q1', name: 'Find the key', description: 'Search the room' });
    assert.equal(engine.gameState.activeQuests.length, 1, 'Quest added');
    assert.ok(engine.questManager.isActive('q1'), 'questManager.isActive works');
    assert.ok(engine.questManager.hasQuest('q1'), 'questManager.hasQuest works');
    
    // Duplicate prevention
    engine.addQuest({ id: 'q1', name: 'Find the key' });
    assert.equal(engine.gameState.activeQuests.length, 1, 'Duplicate quest not added');
    
    // Quest without id
    engine.addQuest({ name: 'Bad Quest' });
    assert.equal(engine.gameState.activeQuests.length, 1, 'Quest without id rejected');
    
    // Complete quest
    engine.completeQuest('q1');
    assert.equal(engine.gameState.activeQuests.length, 0, 'Quest removed on complete');
    assert.ok(engine.gameState.questsCompleted.includes('q1'), 'Quest in completed list');
    assert.ok(engine.questManager.hasQuest('q1'), 'hasQuest true for completed quest');
    assert.ok(!engine.questManager.isActive('q1'), 'isActive false for completed quest');
    
    // String shortcut
    engine.addQuest('q2', 'Second Quest', 'Do something');
    assert.equal(engine.gameState.activeQuests.length, 1, 'String-based addQuest works');
    
    engine.destroy();
});

// 7. Time System
TestRunner.suite('Time System', (assert) => {
    const engine = createTestEngine();
    
    assert.equal(engine.gameState.time, '08:00', 'Initial time correct');
    
    engine.advanceTime(30);
    assert.equal(engine.gameState.time, '08:30', 'Advance 30 minutes');
    
    engine.advanceTime(90);
    assert.equal(engine.gameState.time, '10:00', 'Advance 90 minutes crosses hour');
    
    // Invalid input
    engine.advanceTime(-10);
    assert.equal(engine.gameState.time, '10:00', 'Negative minutes rejected');
    
    engine.advanceTime(NaN);
    assert.equal(engine.gameState.time, '10:00', 'NaN minutes rejected');
    
    engine.advanceTime('hello');
    assert.equal(engine.gameState.time, '10:00', 'String minutes rejected');
    
    // Day rollover
    engine.gameState.time = '23:00';
    engine.advanceTime(120);
    assert.equal(engine.gameState.day, 2, 'Day advances on midnight rollover');
    assert.equal(engine.gameState.time, '01:00', 'Time wraps correctly');
    
    engine.destroy();
});

// 8. Scene Registration & Loading
TestRunner.suite('Scene Management', async (assert) => {
    const engine = createTestEngine();
    
    let enterCalled = false;
    let exitCalled = false;
    
    engine.registerScene({
        id: 'test-scene',
        name: 'Test Scene',
        hotspots: [],
        onEnter: (game) => { enterCalled = true; },
        onExit: (game) => { exitCalled = true; }
    });
    
    assert.ok(engine.scenes['test-scene'], 'Scene registered');
    
    await engine.loadScene('test-scene', 'none');
    assert.equal(engine.currentScene, 'test-scene', 'Scene loaded');
    assert.ok(enterCalled, 'onEnter callback executed');
    
    // Register second scene
    engine.registerScene({
        id: 'test-scene-2',
        name: 'Test Scene 2',
        hotspots: []
    });
    
    await engine.loadScene('test-scene-2', 'none');
    assert.ok(exitCalled, 'onExit callback executed on scene change');
    
    // Load non-existent scene
    await engine.loadScene('nonexistent', 'none');
    assert.equal(engine.currentScene, 'test-scene-2', 'Non-existent scene load does nothing');
    
    engine.destroy();
});

// 9. Scene Loading Guard (race condition prevention)
TestRunner.suite('Scene Loading Guard', async (assert) => {
    const engine = createTestEngine();
    let loadCount = 0;
    
    engine.registerScene({
        id: 'slow-scene',
        name: 'Slow Scene',
        hotspots: [],
        onEnter: () => { loadCount++; }
    });
    
    // Two simultaneous loads (second should be rejected)
    const p1 = engine.loadScene('slow-scene', 'fade');
    const p2 = engine.loadScene('slow-scene', 'fade');
    await Promise.all([p1, p2]);
    
    assert.equal(loadCount, 1, 'Concurrent scene load blocked');
    engine.destroy();
});

// 10. Save/Load System
TestRunner.suite('Save/Load System', (assert) => {
    const mockStorage = createMockStorage();
    const engine = createTestEngine({ storage: mockStorage });
    
    // Set up state
    engine.addToInventory({ id: 'test', name: 'Test Item' });
    engine.setFlag('tested', true);
    engine.setFlag('count', 42);
    engine.gameState.storyPart = 5;
    engine.gameState.evidence = [{ id: 'doc1', type: 'text', title: 'Evidence' }];
    engine.gameState.evidenceViewed = ['doc1'];
    engine.voiceEnabled = false;
    engine.currentScene = 'mancave';
    engine.addQuest({ id: 'quest1', name: 'Test Quest', description: 'Desc', hint: 'Hint' });
    
    // Save
    const saved = engine.saveGame(true);
    assert.ok(saved, 'saveGame returns true on success');
    assert.ok(mockStorage.getItem('cyberquest_save'), 'Save data written to storage');
    
    // Verify save data structure
    const saveData = JSON.parse(mockStorage.getItem('cyberquest_save'));
    assert.equal(saveData.currentScene, 'mancave', 'Scene saved');
    assert.equal(saveData.inventory.length, 1, 'Inventory saved');
    assert.equal(saveData.gameState.storyPart, 5, 'Story part in save data');
    assert.equal(saveData.voiceEnabled, false, 'Voice pref in save data');
    assert.equal(saveData.gameState.evidence.length, 1, 'Evidence in save data');
    assert.equal(saveData.gameState.evidenceViewed.length, 1, 'Evidence history in save data');
    assert.equal(Object.keys(saveData.gameState.flags).length, 2, 'All flags in save data');
    assert.equal(saveData.gameState.activeQuests.length, 1, 'Active quests in save data');
    assert.ok(saveData.version, 'Save includes version');
    assert.ok(saveData.timestamp, 'Save includes timestamp');
    
    // Create new engine and load
    const engine2 = createTestEngine({ storage: mockStorage });
    engine2.registerScene({ id: 'mancave', hotspots: [] });
    const loaded = engine2.loadGame();
    
    assert.ok(loaded, 'loadGame returns true on success');
    assert.equal(engine2.inventory.length, 1, 'Inventory restored');
    assert.equal(engine2.inventory[0].id, 'test', 'Inventory item ID correct');
    assert.equal(engine2.inventory[0].name, 'Test Item', 'Inventory item name correct');
    assert.equal(engine2.gameState.storyPart, 5, 'Story part restored');
    assert.equal(engine2.getFlag('tested'), true, 'Flags restored');
    assert.equal(engine2.getFlag('count'), 42, 'Numeric flag restored');
    assert.equal(engine2.voiceEnabled, false, 'Voice pref restored');
    assert.equal(engine2.gameState.evidence.length, 1, 'Evidence restored');
    assert.equal(engine2.gameState.evidenceViewed.length, 1, 'Evidence viewed restored');
    assert.equal(engine2.gameState.activeQuests.length, 1, 'Active quests restored');
    assert.equal(engine2.gameState.activeQuests[0].hint, 'Hint', 'Quest hint restored');
    
    engine.destroy();
    engine2.destroy();
});

// 11. Save/Load with corrupted data
TestRunner.suite('Save/Load Error Handling', (assert) => {
    const mockStorage = createMockStorage();
    mockStorage.setItem('cyberquest_save', 'NOT VALID JSON{{{');
    
    const engine = createTestEngine({ storage: mockStorage });
    
    const result1 = engine.loadGame();
    assert.ok(!result1, 'Corrupted data returns false');
    
    // Missing fields
    mockStorage.setItem('cyberquest_save', JSON.stringify({ gameState: {} }));
    const result2 = engine.loadGame();
    assert.ok(result2, 'Partial data loads successfully');
    
    assert.ok(engine.gameState.flags, 'Flags exist after partial load');
    assert.ok(Array.isArray(engine.gameState.activeQuests), 'activeQuests is array after partial load');
    assert.ok(Array.isArray(engine.gameState.questsCompleted), 'questsCompleted is array after partial load');
    assert.ok(Array.isArray(engine.gameState.evidence), 'evidence is array after partial load');
    assert.ok(Array.isArray(engine.gameState.evidenceViewed), 'evidenceViewed is array after partial load');
    assert.equal(engine.gameState.storyPart, 0, 'storyPart defaults after partial load');
    assert.equal(engine.gameState.day, 1, 'day defaults after partial load');
    
    // Null storage
    const engine3 = createTestEngine({ storage: null });
    const result3 = engine3.saveGame(true);
    assert.ok(!result3, 'Save with null storage returns false');
    
    engine.destroy();
    engine3.destroy();
});

// 12. Condition Checking
TestRunner.suite('Condition Checking', (assert) => {
    const engine = createTestEngine();
    
    assert.ok(engine.checkCondition(null), 'Null condition returns true');
    assert.ok(engine.checkCondition(undefined), 'Undefined condition returns true');
    
    engine.setFlag('open', true);
    assert.ok(engine.checkCondition('open'), 'String condition checks flag');
    assert.ok(!engine.checkCondition('closed'), 'Missing flag returns falsy');
    
    assert.ok(engine.checkCondition(() => true), 'Function condition returning true');
    assert.ok(!engine.checkCondition(() => false), 'Function condition returning false');
    
    engine.destroy();
});

// 13. Hotspot Handling
TestRunner.suite('Hotspot Handling', async (assert) => {
    const engine = createTestEngine();
    let actionCalled = false;
    let interactionCalled = false;
    
    // Test action-based hotspot
    engine.executeHotspotAction({
        action: (game) => { actionCalled = true; }
    });
    assert.ok(actionCalled, 'Action callback executed');
    
    // Test interactions-based hotspot
    engine.executeHotspotAction({
        interactions: {
            look: (game) => { interactionCalled = true; }
        }
    });
    assert.ok(interactionCalled, 'Interactions.look callback executed');
    
    // Test enabled check
    let blockedAction = false;
    engine.handleHotspotClick({
        x: 50, y: 50, width: 10, height: 10,
        enabled: false,
        action: () => { blockedAction = true; },
        skipWalk: true
    });
    assert.ok(!blockedAction, 'Disabled hotspot blocks action');
    
    // Test enabled with function
    let enabledAction = false;
    engine.handleHotspotClick({
        x: 50, y: 50, width: 10, height: 10,
        enabled: () => true,
        action: (game) => { enabledAction = true; },
        skipWalk: true
    });
    assert.ok(enabledAction, 'Enabled function returning true allows action');
    
    engine.destroy();
});

// 14. Notification System
TestRunner.suite('Notification System', (assert) => {
    const engine = createTestEngine();
    
    assert.doesNotThrow(() => {
        engine.showNotification('Test notification');
    }, 'showNotification does not throw');
    
    const area = document.getElementById('notification-area');
    assert.ok(area, 'Notification area exists');
    assert.ok(area.children.length > 0, 'Notification element created');
    
    engine.destroy();
});

// 15. Story Part
TestRunner.suite('Story Part Management', (assert) => {
    const engine = createTestEngine();
    
    assert.equal(engine.gameState.storyPart, 0, 'Initial story part is 0');
    engine.setStoryPart(5);
    assert.equal(engine.gameState.storyPart, 5, 'Story part updated');
    
    engine.destroy();
});

// 16. Destroy & Cleanup
TestRunner.suite('Engine Destroy & Cleanup', (assert) => {
    const engine = createTestEngine();
    
    assert.doesNotThrow(() => {
        engine.destroy();
    }, 'Engine destroys without error');
    
    assert.equal(engine.initialized, false, 'Initialized flag cleared');
    assert.equal(engine._boundHandlers.length, 0, 'All event handlers removed');
    
    // Double destroy should be safe
    assert.doesNotThrow(() => {
        engine.destroy();
    }, 'Double destroy is safe');
});

// 17. addInteractionHandler utility
TestRunner.suite('addInteractionHandler Utility', (assert) => {
    let clicked = false;
    const el = document.createElement('button');
    
    addInteractionHandler(el, () => { clicked = true; });
    el.click();
    assert.ok(clicked, 'Click handler works');
    
    // Null element should not throw
    assert.doesNotThrow(() => {
        addInteractionHandler(null, () => {});
    }, 'Null element does not throw');
});

// 18. ChatInterface
TestRunner.suite('ChatInterface', (assert) => {
    const engine = createTestEngine();
    const chat = new ChatInterface(engine);
    
    // Validation
    assert.doesNotThrow(() => {
        chat.showConversation(null);
    }, 'Null config does not crash');
    
    assert.doesNotThrow(() => {
        chat.showConversation({});
    }, 'Empty config does not crash');
    
    // Valid conversation
    chat.showConversation({
        id: 'test',
        type: 'signal',
        contact: 'Alice',
        messages: [{ from: 'Alice', text: 'Hello!' }]
    });
    assert.ok(chat.isOpen, 'Chat opens');
    assert.ok(document.getElementById('chat-interface'), 'Chat DOM created');
    
    // formatMessageText
    assert.equal(chat.formatMessageText(null), '', 'Null text returns empty');
    assert.equal(chat.formatMessageText(undefined), '', 'Undefined text returns empty');
    assert.ok(chat.formatMessageText('Hello\nWorld').includes('<br>'), 'Line breaks converted');
    
    // XSS sanitization
    const xss = chat.formatMessageText('<script>alert("xss")</script>');
    assert.ok(!xss.includes('<script>'), 'Script tags sanitized');
    
    // Close
    chat.close();
    assert.ok(!chat.isOpen, 'Chat closes');
    assert.equal(chat._escHandler, null, 'ESC handler cleaned up');
    
    engine.destroy();
});

// 19. EvidenceViewer
TestRunner.suite('EvidenceViewer', (assert) => {
    const engine = createTestEngine();
    const viewer = new EvidenceViewer(engine);
    
    // Show text document
    viewer.showDocument({
        id: 'doc1',
        type: 'text',
        title: 'Test Doc',
        content: 'Hello world'
    });
    assert.ok(viewer.isOpen, 'Viewer opens');
    assert.ok(document.getElementById('evidence-viewer'), 'Viewer DOM created');
    assert.ok(viewer.hasViewed('doc1'), 'Document tracked as viewed');
    
    // Multi-page
    viewer.showDocument({
        id: 'doc2',
        type: 'text',
        title: 'Multi-page',
        content: ['Page 1', 'Page 2', 'Page 3']
    });
    assert.equal(viewer.totalPages, 3, 'Total pages correct');
    assert.equal(viewer.currentPage, 1, 'Starts on page 1');
    
    viewer.nextPage();
    assert.equal(viewer.currentPage, 2, 'Next page works');
    
    viewer.previousPage();
    assert.equal(viewer.currentPage, 1, 'Previous page works');
    
    // Bounds checking
    viewer.previousPage(); // Should stay at 1
    assert.equal(viewer.currentPage, 1, 'Cannot go below page 1');
    
    // formatTextContent null safety
    assert.equal(viewer.formatTextContent(null), '', 'Null text returns empty');
    assert.equal(viewer.formatTextContent(undefined), '', 'Undefined text returns empty');
    
    // formatEmailContent validation
    const emailHtml = viewer.formatEmailContent(null);
    assert.ok(emailHtml.includes('Invalid'), 'Null email shows error message');
    
    const validEmail = viewer.formatEmailContent({
        from: 'a@b.com', to: 'c@d.com', subject: 'Hi', date: '2026-01-01', body: 'Test'
    });
    assert.ok(validEmail.includes('a@b.com'), 'Valid email renders from');
    
    viewer.close();
    assert.ok(!viewer.isOpen, 'Viewer closes');
    assert.equal(viewer._escHandler, null, 'ESC handler cleaned up');
    
    engine.destroy();
});

// 20. PasswordPuzzle
TestRunner.suite('PasswordPuzzle', (assert) => {
    const engine = createTestEngine();
    const puzzle = new PasswordPuzzle(engine);
    
    let solved = false;
    puzzle.show({
        id: 'test-pw',
        title: 'Test',
        description: 'Enter password',
        correctAnswer: 'secret',
        onSuccess: () => { solved = true; }
    });
    
    assert.ok(puzzle.isActive, 'Puzzle active');
    assert.ok(document.getElementById('password-puzzle'), 'Puzzle DOM created');
    
    // Close & cleanup
    puzzle.close();
    assert.ok(!puzzle.isActive, 'Puzzle inactive after close');
    assert.equal(puzzle._escHandler, null, 'ESC handler cleaned up');
    assert.equal(puzzle.currentPuzzle, null, 'Current puzzle cleared');
    
    // checkAnswer guard when not active
    assert.doesNotThrow(() => {
        puzzle.checkAnswer();
    }, 'checkAnswer when inactive does not crash');
    
    engine.destroy();
});

// 21. PlayerCharacter
TestRunner.suite('PlayerCharacter', (assert) => {
    const engine = createTestEngine();
    const player = new PlayerCharacter(engine);
    
    assert.equal(player.x, 50, 'Default x position');
    assert.equal(player.y, 85, 'Default y position');
    assert.equal(player.walkSpeed, 0.5, 'Walk speed is consistent property');
    
    // init creates DOM elements
    player.init();
    assert.ok(player.element, 'Element created');
    assert.ok(player.thoughtBubble, 'Thought bubble created');
    
    // think null safety
    assert.doesNotThrow(() => {
        player.think('Test thought', 100);
    }, 'think does not throw');
    assert.ok(player.isThinking, 'Becomes thinking state');
    
    // setPosition
    player.setPosition(20, 70);
    assert.equal(player.x, 20, 'X position updated');
    assert.equal(player.y, 70, 'Y position updated');
    
    // face
    player.face('left');
    assert.equal(player.facing, 'left', 'Facing updated');
    
    // hide / show
    player.hide();
    assert.ok(player.element.classList.contains('hidden'), 'Player hidden');
    player.show();
    assert.ok(!player.element.classList.contains('hidden'), 'Player shown');
    
    // destroy
    player.destroy();
    assert.equal(player.element, null, 'Element nulled');
    assert.equal(player.thoughtBubble, null, 'Thought bubble nulled');
    assert.equal(player.idleThoughtInterval, null, 'Idle interval cleared');
    assert.equal(player._thinkTimeout, null, 'Think timeout cleared');
    
    // walkTo without element should not crash
    assert.doesNotThrow(() => {
        player.walkTo(50, 80);
    }, 'walkTo after destroy does not crash');
    
    engine.destroy();
});

// 22. VoiceManager
TestRunner.suite('VoiceManager', (assert) => {
    // VoiceManager is a singleton; test its API surface
    const vm = new VoiceManager();
    
    assert.ok(typeof vm.speak === 'function', 'speak method exists');
    assert.ok(typeof vm.stop === 'function', 'stop method exists');
    assert.ok(typeof vm.toggle === 'function', 'toggle method exists');
    assert.ok(typeof vm.diagnose === 'function', 'diagnose method exists');
    assert.ok(typeof vm.getVoiceForCharacter === 'function', 'getVoiceForCharacter exists');
    
    // Character profiles use archetypes
    assert.ok(vm.characterProfiles['Ryan'], 'Ryan profile exists');
    assert.ok(vm.characterProfiles['Eva'], 'Eva profile exists');
    assert.equal(vm.characterProfiles['Ryan'].lang, 'en-GB', 'Ryan lang correct');
    
    // stop should be safe even without active speech
    assert.doesNotThrow(() => {
        vm.stop();
    }, 'stop() without active speech does not throw');
    
    // setVolume clamps
    vm.setVolume(2);
    assert.equal(vm.volume, 1, 'Volume clamped to max 1');
    vm.setVolume(-1);
    assert.equal(vm.volume, 0, 'Volume clamped to min 0');
    
    // toggle
    vm.enabled = true;
    const result = vm.toggle();
    assert.equal(result, false, 'Toggle returns new state');
    assert.equal(vm.enabled, false, 'Enabled toggled to false');
});

// 23. Dialogue System
TestRunner.suite('Dialogue System', (assert) => {
    const engine = createTestEngine();
    
    // startDialogue with null
    assert.doesNotThrow(() => {
        engine.startDialogue(null);
    }, 'startDialogue(null) does not crash');
    
    // startDialogue with valid data
    engine.startDialogue([
        { speaker: 'Ryan', text: 'Hello' },
        { speaker: 'Eva', text: 'Hi there' }
    ]);
    assert.ok(engine.isDialogueActive, 'Dialogue active');
    assert.equal(engine.dialogueQueue.length, 2, 'Two items in queue');
    
    // Advance
    engine.advanceDialogue();
    assert.equal(engine.dialogueQueue.length, 1, 'Queue advanced');
    
    // End dialogue
    engine.endDialogue();
    assert.ok(!engine.isDialogueActive, 'Dialogue ended');
    assert.equal(engine.typewriterAbortController, null, 'Typewriter controller cleared');
    
    engine.destroy();
});

// 24. showDialogue shortcut
TestRunner.suite('showDialogue Shortcut', (assert) => {
    const engine = createTestEngine();
    
    engine.showDialogue(['Line one', 'Line two'], 'TestSpeaker');
    assert.ok(engine.isDialogueActive, 'Dialogue active via shortcut');
    assert.equal(engine.dialogueQueue.length, 2, 'Queue has 2 items');
    assert.equal(engine.dialogueQueue[0].speaker, 'TestSpeaker', 'Speaker set correctly');
    
    engine.endDialogue();
    engine.destroy();
});

// Run all tests
TestRunner.run();
