# CyberQuest: Technical Reference
**Last Updated:** March 21, 2026
**Version:** 1.3
**Status:** Production
**Audience:** Developers contributing to or extending the engine and scene system.

> This document is the single authoritative technical reference for CyberQuest.
> It merges what was previously split across `GAME_ARCHITECTURE.md` and `SYSTEMS.md`.
> For scene content (hotspot layouts, dialogue, story flags per scene) see [SCENES.md](SCENES.md).
> For contributing guidelines see [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Table of Contents
1. [Overview](#1-overview)
2. [Core Engine](#2-core-engine)
3. [Scene System](#3-scene-system)
4. [Systems API Reference](#4-systems-api-reference)
   - [Dialogue System](#41-dialogue-system)
   - [Inventory System](#42-inventory-system)
   - [Quest System](#43-quest-system)
   - [Evidence Viewer](#44-evidence-viewer)
   - [Password Puzzle System](#45-password-puzzle-system)
   - [Chat Interface](#46-chat-interface)
   - [Pause System](#47-pause-system)
   - [Voice Narration](#48-voice-narration)
   - [Save / Load System](#49-saveload-system)
   - [Player Character](#410-player-character)
   - [Flag System](#411-flag-system)
   - [Accessibility / Movie Mode](#412-accessibility--movie-mode)
5. [Asset Structure](#5-asset-structure)
6. [Scene Catalog](#6-scene-catalog)
7. [Technical Stack](#7-technical-stack)
8. [Development Guide](#8-development-guide)

---

## 1. Overview

**CyberQuest: Operation ZERFALL** is a Sierra-style point-and-click adventure game built with vanilla JavaScript, HTML5, and SVG graphics. The game follows Ryan Weylant, a Dutch hacker who uncovers a Russian infiltration operation within a German military R&D facility.

### Design Philosophy
- **Accessibility-first** — Fully playable on desktop and mobile; Movie Mode enables full hands-free playthrough
- **No build process** — Pure HTML/JS/CSS; open `index.html` and go
- **SVG graphics** — Scalable, lightweight, and editable with any text editor
- **Modular architecture** — Scenes and systems are independent and reusable
- **Progressive enhancement** — Voice narration and advanced features degrade gracefully

### Top-Level Game Flow
```
Loading Screen → Title Screen → Intro Scene → Main Game → Epilogue → Credits
```

### Engine Constants

All timing constants live in a frozen `ENGINE_CONFIG` object in `engine/game.js`:

```javascript
const ENGINE_CONFIG = Object.freeze({
    TRANSITION_DURATION: 500,   // ms — scene fade
    SCENE_CHANGE_DELAY:  300,   // ms — delay before loading next scene
    INVENTORY_AUTO_CLOSE: 2000, // ms — auto-close inventory flash
    TYPEWRITER_SPEED:    40,    // ms per character
    NOTIFICATION_DURATION: 3000,// ms — notification display time
    NOTIFICATION_FADE:   500,   // ms — notification fade-out
    DEFAULT_TIME: '08:00',
    DEFAULT_DAY:  1,
});
```

### Scene-Clock Map

`SCENE_TIME_MAP` maps every scene to a canonical in-game day/time.
When a scene is entered the clock advances to that value — but **never backwards**.
Scenes not listed leave the clock unchanged.

```javascript
const SCENE_TIME_MAP = Object.freeze({
    // Day 1 — Mon Feb 9
    intro:          { day: 1, time: '07:27' },
    home:           { day: 1, time: '07:45' },
    mancave:        { day: 1, time: '09:00' },
    sdr_bench:      { day: 1, time: '16:15' },
    klooster:       { day: 1, time: '22:55' },
    car_discovery:  { day: 1, time: '23:15' },
    // Day 2 — Tue Feb 10
    dwingeloo:      { day: 2, time: '11:00' },
    astron:         { day: 2, time: '15:30' },
    facility:       { day: 2, time: '21:47' },
    facility_server:{ day: 2, time: '22:08' },
    // Day 3+
    long_night:     { day: 3, time: '01:00' },
    morning_after:  { day: 4, time: '08:00' },
    epilogue:       { day: 90, time: '14:00' },
    // See engine/game.js SCENE_TIME_MAP for the complete list
});
```

---

## 2. Core Engine

### CyberQuestEngine Class
**Location:** `engine/game.js` (~4,000 lines)

The central engine coordinates all game systems.

#### Key Properties

```javascript
{
  currentScene: null,           // Current scene ID string
  scenes: {},                   // All registered scene objects
  inventory: [],                // Player inventory items
  _saveVersion: 2,              // Save file format version
  gameState: {
    storyPart: 0,               // Numeric story progression (0–20)
    questsCompleted: [],        // Completed quest IDs
    activeQuests: [],           // Active quest objects
    flags: {},                  // Key-value boolean flags
    evidence: [],               // Collected evidence items
    evidenceViewed: [],         // IDs of evidence documents viewed
    time: '08:00',              // In-game time (HH:MM)
    day: 1                      // Current day number
  },
  dialogueQueue: [],            // Queued dialogue sequences
  isDialogueActive: false,
  isPuzzleActive: false,
  isPaused: false,
  _sceneLoading: false,         // Scene transition guard
  voiceEnabled: true,
  typewriterAbortController: null,
  _sceneTimeouts: [],           // Auto-cleared on scene exit
  _boundHandlers: [],           // Global event handlers tracked for cleanup
  player: PlayerCharacter,
  evidenceViewer: EvidenceViewer,
  passwordPuzzle: PasswordPuzzle,
  chatInterface: ChatInterface
}
```

> **Save version:** `_saveVersion = 2`. `loadGame()` merges saved state over a
> fresh default, so new fields are always initialised even on old saves.

#### Initialization Sequence

```javascript
1. createGameContainer()      // Build DOM structure
2. bindEvents()               // Attach global event listeners
3. loadGameState()            // Restore saved progress (or start fresh)
4. initPlayer()               // Spawn player character
5. // Initialise subsystems:
   new EvidenceViewer(game)
   new PasswordPuzzle(game)
   new ChatInterface(game)
   new VoiceManager(game)
```

#### Core Event Handlers

| Event | Action |
|-------|--------|
| Click / tap dialogue box | Advance dialogue (or skip typewriter) |
| Click scene background | Walk player to clicked position |
| Click hotspot | Execute hotspot action |
| `I` key | Toggle inventory bar |
| `Q` key | Toggle quest log |
| `P` key | Pause / resume |
| `Space` | Advance dialogue |
| `V` key | Toggle voice narration |
| `D` key | Toggle debug panel |
| `Escape` | Resume if paused; close overlays |

#### Core Methods

**Scene Management**
```javascript
game.registerScene(sceneObj)          // Register a scene object
game.loadScene(sceneId, transition)   // Load and display a scene ('fade'|'instant')
game.loadHotspots(hotspots)           // Create interactive hotspots for current scene
game.handleHotspotClick(hotspot)      // Process hotspot interaction
```

**Game State**
```javascript
game.setFlag(flagId, value)           // Set a boolean flag
game.getFlag(flagId)                  // Get a flag value
game.setStoryPart(n)                  // Advance story progression counter
game.setTime(day, time)               // Advance in-game clock (never winds back)
game.saveGame(silent?, slot?)         // Persist state to localStorage
game.loadGame(slot?)                  // Restore state from localStorage
game.destroy()                        // Full engine teardown (all event listeners removed)
```

**Inventory & Quests**
```javascript
game.addToInventory(item)             // Add item to inventory
game.removeFromInventory(itemId)      // Remove item by ID
game.hasItem(itemId)                  // boolean — does player have item?
game.addQuest(quest)                  // Add quest to active quests
game.completeQuest(questId)           // Mark quest complete
game.updateQuestUI()                  // Refresh quest display
```

**Dialogue**
```javascript
game.startDialogue(dialogueArray, onComplete?)  // Begin dialogue sequence
game.advanceDialogue()                           // Show next line
game.endDialogue()                               // Close dialogue box
game.speak(text, speaker)                        // Trigger voice (optional)
```

**Utility**
```javascript
game.showNotification(message)                   // Temporary notification
game.playerThink(thought)                        // Player's internal monologue
game.wait(ms)                                    // Async delay (Promise)
game.advanceTime(hours)                          // Progress in-game time
game.sceneTimeout(fn, delay)                     // setTimeout auto-cleared on scene exit
game.togglePause()
game.toggleDebugPanel()
game.addEvidence(evidenceData)                   // Add evidence to gameState
game.showEvidence(documentData)                  // Open evidence viewer
game.hasViewedEvidence(id)                       // boolean
game.showPasswordPuzzle(config)                  // Show password puzzle overlay
game.showChat(config)                            // Show chat interface
game.addChatMessage(conversationId, message)
game.sendChatMessagesWithDelay(id, messages, delay)
```

---

## 3. Scene System

### Scene Object Structure

Each scene is a plain JavaScript object:

```javascript
const SceneName = {
  id: 'scene_id',                      // Unique string identifier
  name: 'Scene Display Name',
  background: 'assets/images/scenes/name.svg',
  description: 'One-line scene description',
  playerStart: { x: 50, y: 85 },       // Spawn position (% of scene)

  idleThoughts: [                       // Shown randomly when player idles
    'Thought text…',
  ],

  hotspots: [
    {
      id: 'hotspot_id',
      name: 'Display Name',
      x: 10, y: 20,                     // Position (%)
      width: 15, height: 20,            // Size (%)
      cursor: 'pointer',                // CSS cursor type
      action: function(game) { },       // Click handler (mutually exclusive with targetScene)
      targetScene: 'other_scene',       // Shorthand transition
    }
  ],

  state: { /* scene-local mutable state */ },

  accessibilityPath: [ /* hotspot IDs or async functions — see §4.12 */ ],

  onEnter: function(game) { },          // Called after scene background loads
  onExit:  function(game) { }           // Called before scene unloads
};

// Self-register when loaded by index.html:
if (typeof game !== 'undefined') {
  game.registerScene(SceneName);
}
```

### Scene Loading Process

**Method:** `loadScene(sceneId, transition = 'fade')`

1. Call `onExit()` on current scene
2. Apply fade-out transition (500 ms)
3. Set `currentScene` to new scene ID
4. Load background SVG
5. Apply scene-specific CSS class
6. Set background colour (if specified)
7. Load hotspots
8. Position or hide player character
9. Call `onEnter()` on new scene
10. Apply fade-in transition (500 ms)
11. Update URL hash

**Transition types:** `'fade'` (default, 500 ms cross-fade) | `'instant'`

### Hotspot Structure (Full)

```javascript
{
  id: 'unique_id',
  name: 'Display Name',
  x: 20, y: 30,                  // Position (%)
  width: 15, height: 10,         // Size (%)
  cursor: 'pointer',             // pointer | look | talk | use | move
  cssClass: 'hotspot-nav',       // Extra CSS class (optional)
  icon: 'assets/images/…svg',    // Image overlaid on hotspot (optional)
  label: 'Go North',             // Text label overlaid (optional)
  visible: true,                 // false = not rendered
  skipWalk: false,               // true = execute without player walk animation
  lookMessage: 'A sturdy door.', // Ryan thinks this on look cursor (optional)
  disabledMessage: 'Locked.',    // Thought when enabled === false
  failMessage: 'Need a key.',    // Thought when condition fails

  // Dynamic enable guard
  enabled: function(game) { return game.getFlag('door_unlocked'); },

  // Prerequisite flag check (string = flag name, or function)
  condition: 'picked_up_usb',

  // Option A: direct scene transition
  targetScene: 'other_scene',

  // Option B: custom action
  action: function(game) { /* … */ },

  // Option C: look/use interaction map
  interactions: {
    look: function(game) { game.playerThink('A control panel.'); },
    use:  function(game) { game.startDialogue([...]); },
  },

  // Shorthand: auto-add item on click
  item: { id: 'usb', name: 'USB Stick', icon: '💾' },

  // Shorthand: auto-start dialogue on click
  dialogue: [ { speaker: 'Ryan', text: 'Hello.' } ],
}
```

**Cursor types:**

| Value | Visual | Meaning |
|-------|--------|---------|
| `pointer` | Blue highlight | Default interaction |
| `look` | Magnifying glass | Examine |
| `talk` | Speech bubble | Conversation |
| `use` | Hand | Use/operate |
| `move` | Arrow | Navigation |

---

## 4. Systems API Reference

### 4.1 Dialogue System

**Location:** Integrated in `engine/game.js`

#### Starting Dialogue

```javascript
// Full form — onComplete fires when all lines are shown:
game.startDialogue([
  { speaker: 'Ryan', text: 'What is this?', portrait: 'path/to.jpg' },
  { speaker: 'Max',  text: 'It looks dangerous.' },
  { speaker: '',     text: '*alarm blares*' }     // Narration / sound note
], function(game) {
  // Called after final line
});

// Convenience: all lines share same speaker
game.showDialogue(['Coffee first.', 'Then we talk.'], 'Ryan');
```

**Auto-portrait:** If no `portrait` field is given, the engine resolves one from
`PORTRAIT_MAP` using the speaker name.

#### Dialogue Box HTML

```html
<div id="dialogue-box">
  <div id="dialogue-portrait"></div>
  <div id="dialogue-content">
    <div id="dialogue-speaker">Speaker Name</div>
    <div id="dialogue-text">…</div>
  </div>
  <div id="dialogue-continue">Click to continue…</div>
</div>
```

#### Typewriter Effect

```javascript
ENGINE_CONFIG.TYPEWRITER_SPEED = 40  // ms per character
```

An `AbortController` (`typewriterAbortController`) cancels in-flight typing
whenever the player advances or the game is paused. Clicking while text is
still typing completes the line instantly; clicking again advances.

#### Voice Integration

If voice is enabled:
1. Text starts typing
2. TTS synthesis begins simultaneously
3. Clicking interrupts voice and advances
4. Next line waits for TTS to finish (or skip)

---

### 4.2 Inventory System

**Location:** Integrated in `engine/game.js`

```javascript
// Add item
game.addToInventory({
  id: 'usb_stick',
  name: 'USB Stick',
  icon: '💾',        // Emoji or 'assets/images/icons/item.svg'
  description: 'A black USB stick from the dead drop.'
});

// Shorthand
game.addItem({ id: 'item_id', name: 'Item', icon: '🔧' });

// Check / remove
game.hasItem('flipper_zero');         // boolean
game.removeFromInventory('item_id');
```

**Item structure:**

```javascript
{
  id: 'unique_id',
  name: 'Item Name',
  icon: '🔧',          // Emoji or SVG path
  description: 'Text'
}
```

**UI:** Bottom-right overlay. Toggle button (🎒). Expandable grid; hover shows name + description.

---

### 4.3 Quest System

**Location:** Integrated in `engine/game.js`

```javascript
// Add quest (full form)
game.addQuest({
  id: 'investigate_signal',
  name: 'Investigate the Signal',
  description: 'Analyze the SSTV transmission in the mancave.',
  hint: 'Check the SSTV terminal',
  onComplete: function(game) { /* reward */ }
});

// Shorthand (legacy support)
game.addQuest('quest_id', 'Quest Name', 'Description');
```

**Quest Manager API** (used inside scene scripts):

```javascript
game.questManager.isActive('quest_id')       // Active but not completed
game.questManager.hasQuest('quest_id')       // Active or completed
game.questManager.updateProgress(id, step)   // Mark a progress step complete
game.questManager.complete('quest_id')       // Complete quest
game.questManager.getProgress('quest_id')    // Returns progress array
```

**Completing a quest:**

```javascript
game.completeQuest('quest_id');
// Removes from active list, adds to completed, shows notification, calls onComplete()
```

**UI:** Top-right overlay. Toggle button (📋). Shows active quest names, descriptions, and hints (💡).

---

### 4.4 Evidence Viewer

**File:** `engine/evidence-viewer.js` (~612 lines)

```javascript
game.showEvidence(documentData)
game.addEvidence(evidenceData)         // Store in gameState.evidence
game.hasViewedEvidence('doc_id')       // boolean
```

#### Document Types

```javascript
// Text / Report
game.showEvidence({
  id: 'usb_readme',
  type: 'text',        // or 'report'
  title: 'README.txt',
  author: 'E. Weber',
  date: 'Feb 9, 2026',
  classification: 'CONFIDENTIAL',   // optional
  content: 'Document text…'        // or array of strings for multi-page
});

// Email
game.showEvidence({
  id: 'email_001',
  type: 'email',
  title: 'Email: Project Status',
  content: 'From: volkov@…\nTo: hoffmann@…\n\nBody…'
});

// Image / Schematic
game.showEvidence({
  id: 'facility_schematic',
  type: 'image',       // or 'schematic'
  title: 'Facility Floor Plan',
  content: 'assets/images/evidence/floorplan.svg'
});
```

#### onRead Callback

```javascript
game.showEvidence({
  id: 'critical_doc', type: 'text', title: '…', content: '…',
  onRead: function(game) {
    game.setFlag('read_critical_doc', true);
    game.completeQuest('find_evidence');
  }
});
```

Viewed document IDs are stored in `evidenceViewer.documentHistory` and
synced into `gameState.evidenceViewed` on every save.

---

### 4.5 Password Puzzle System

**File:** `engine/puzzles/password-puzzle.js`

```javascript
// Standard password
game.passwordPuzzle.show({
  title: 'Enter Password',
  description: 'Optional context',
  correctPassword: 'SECRET',     // case-sensitive
  hint: 'Optional hint',
  onSuccess: function(game) { game.setFlag('puzzle_solved', true); },
  onCancel: function(game) { }
});

// ROT1 cipher puzzle
game.passwordPuzzle.showROT1Puzzle({
  title: 'Decode ROT1 Message',
  encryptedText: 'XBSOJOH - QSPKFDU FDIP',
  hint: 'Each letter is shifted forward by 1',
  onSuccess: function(game, decodedText) {
    game.showNotification('Message decoded!');
    // decodedText === "WARNING - PROJECT ECHO"
  }
});

// Numeric code (keypad)
game.passwordPuzzle.show({
  title: 'Enter Code',
  type: 'numeric',
  correctPassword: '1234',
  maxLength: 4,
  onSuccess: function(game) { }
});
```

**Feedback:** Incorrect → red flash + message. Correct → green flash + callback. `Escape` cancels.

---

### 4.6 Chat Interface

**File:** `engine/chat-interface.js`

Signal/WhatsApp-style encrypted chat overlay.

```javascript
game.chatInterface.show({
  contact: 'Chris Kubecka',
  avatar: 'assets/images/portraits/chris.jpg',  // optional
  messages: [
    { sender: 'Ryan',  text: 'Need your help',             time: '10:23' },
    { sender: 'Chris', text: 'What do you need?',          time: '10:24' },
    { sender: 'Ryan',  text: 'Looking into a man, Volkov', time: '10:25' }
  ],
  onClose: function(game) { }
});
```

**Message structure:**
```javascript
{
  sender: 'Name',       // determines bubble alignment (Ryan = right, other = left)
  text: 'Message',
  time: 'HH:MM',        // optional timestamp
  status: 'sent'        // sent | delivered | read (optional)
}
```

**Progressive reveal:**
```javascript
game.chatInterface.showSequence({
  contact: 'Eva',
  sequence: [
    { delay: 1000, message: { sender: 'Eva',  text: 'Are you there?' } },
    { delay: 2000, message: { sender: 'Ryan', text: "Yes, I'm here" } },
    { delay: 1500, message: { sender: 'Eva',  text: 'Good. Listen carefully…' } }
  ]
});
```

---

### 4.7 Pause System

**Location:** Integrated in `engine/game.js`

`game.togglePause()` freezes the entire game state:

| Effect | Paused | Resumed |
|--------|--------|---------|
| Pause overlay | Shown | Hidden |
| CSS animations | `animationPlayState: paused` | Restored |
| Speech synthesis | `.pause()` | `.resume()` |
| Typewriter | Aborted | — |
| Player idle timer | Cleared | Restarted |
| Hotspot / dialogue clicks | Blocked | Unblocked |

**Keyboard:** `P` toggles; `Escape` resumes if paused.

---

### 4.8 Voice Narration

**File:** `engine/voice.js`

Text-to-speech via Web Speech API.

#### VoiceManager Methods

```javascript
const voiceManager = new VoiceManager(game);
voiceManager.speak(text, options)   // Speak text
voiceManager.stop()                 // Stop current speech
voiceManager.pause()
voiceManager.resume()
voiceManager.getVoices()            // Array of available system voices
voiceManager.setVoice(voiceName)
game.toggleVoice()                  // Enable / disable globally
```

#### Character Voice Profiles

The VoiceManager has built-in profiles for all named characters:

```javascript
'Ryan':            { pitch: 0.90, rate: 0.95, lang: 'en-GB' }
"Ryan's Thoughts": { pitch: 0.85, rate: 0.90 }
'Max':             { pitch: 1.15, rate: 0.95 }   // Dutch female
'Eva':             { pitch: 1.15, rate: 0.90 }   // German female
'Chris Kubecka':   { pitch: 1.10, rate: 1.00, lang: 'en-US' }
'David Prinsloo':  { pitch: 0.95, rate: 1.00 }
'Cees Bassa':      { pitch: 1.00, rate: 0.95 }
'Jaap Haartsen':   { pitch: 0.88, rate: 0.92 }
'Volkov':          { pitch: 0.70, rate: 0.85 }   // Deep, menacing
// Hackerspace members, Narrator, Presenter, etc. → see engine/voice.js
```

Voice archetypes (`britishMale`, `britishFemale`, `americanFemale`) reduce
duplication; each profile inherits preferred voice names and language tag.

#### Browser Support

| Browser | Quality |
|---------|---------|
| Chrome / Edge | Excellent |
| Firefox | Good (limited voices) |
| Safari macOS / iOS | Good |
| Unsupported browsers | Dialogue works normally, no speech |

---

### 4.9 Save/Load System

**Location:** Integrated in `engine/game.js`

#### Save Data Structure

```javascript
{
  version: 2,
  timestamp: '2026-02-27T14:00:00Z',
  currentScene: 'mancave',
  voiceEnabled: true,
  gameState: {
    storyPart: 5,
    questsCompleted: ['decode_message'],
    activeQuests: [ /* … */ ],
    flags: { /* … */ },
    evidence: [ /* … */ ],
    evidenceViewed: ['usb_readme', 'email_001'],
    time: '14:30',
    day: 1
  },
  inventory: [ /* … */ ]
}
```

#### Saving

```javascript
game.saveGame();             // Manual save (auto-slot) — shows notification
game.saveGame(true);         // Silent auto-save
game.saveGame(false, 2);     // Save to named Slot 2
game.openSaveSlotModal('save');  // Open 3-slot picker UI
```

Auto-save fires silently on every scene transition.

#### Loading

```javascript
game.loadGame();             // Load from auto-slot
game.loadGame(2);            // Load from Slot 2
game.openSaveSlotModal('load');  // Open 3-slot picker UI
```

On startup, `loadGameState()` checks the URL hash — if it matches a registered
scene the game jumps directly there (useful for development).

#### localStorage Keys

```javascript
'cyberquest_save'     // Auto-save / legacy slot
'cyberquest_save_1'   // Slot 1
'cyberquest_save_2'   // Slot 2
'cyberquest_save_3'   // Slot 3
'cyberquest_settings' // User settings (text speed, animation speed)
```

---

### 4.10 Player Character

**File:** `engine/player.js`

#### PlayerCharacter Class

```javascript
const player = new PlayerCharacter(game);
player.init();
```

#### Rendered HTML

```html
<div id="scene-characters">
  <div id="player-character" class="character">
    <div class="character-sprite">🧑‍💻</div>
    <div class="character-name">Ryan</div>
    <div class="thought-bubble hidden"></div>
  </div>
</div>
```

#### Methods

```javascript
player.moveTo(x, y)    // CSS transition to percentage position
player.show()          // Make visible
player.hide()          // Hide (cinematic scenes)
player.think()         // Display random thought from scene's idleThoughts
```

**Positioning:** Percentage-based (0–100% width/height). Bottom-aligned (feet at Y). Smooth CSS transition (500 ms ease-in-out).

**Idle thoughts:** Randomly triggered every 15–30 s, or called manually. Thought bubble fades in, displays 3 s, fades out.

**Hidden scenes (no player):** intro, tvdocumentary, credits, all driving scenes.

---

### 4.11 Flag System

**Location:** Integrated in `engine/game.js`

Boolean flags track game progress and gate content.

```javascript
game.setFlag('sstv_decoded', true);
game.getFlag('sstv_decoded');        // true | undefined

// Conditional dialogue
const dialogue = game.getFlag('sstv_decoded')
  ? [{ speaker: 'Ryan', text: 'I decoded that message.' }]
  : [{ speaker: 'Ryan', text: 'I should decode that message.' }];

// Hotspot with condition
{
  id: 'locked_door',
  enabled: function(game) { return game.getFlag('has_keycard'); },
  disabledMessage: "It's locked. I need a keycard.",
  action: function(game) { game.loadScene('next_area'); }
}
```

Flags are automatically saved/loaded with game state. See [FLOW_ANALYSIS.md](FLOW_ANALYSIS.md) for a complete registry of all flags in the game.

#### Common Flag Groups

| Group | Examples |
|-------|---------|
| Story progress | `intro_complete`, `espresso_made`, `sstv_decoded`, `usb_found`, `usb_analyzed`, `evidence_downloaded`, `test_sabotaged`, `game_complete` |
| Character interactions | `talked_to_max`, `called_david`, `called_cees`, `called_jaap`, `contacted_eva` |
| UI unlocks | `planboard_unlocked`, `regional_map_unlocked`, `videocall_unlocked` |
| Puzzle states | `password_solved`, `gate_opened`, `camera_disabled`, `basement_unlocked` |

---

### 4.12 Accessibility / Movie Mode

**Location:** `engine/game.js`
**Toggle:** `🎬 Movie` button in bottom bar, or `game.toggleAccessibilityMode()`

A special mode in which CyberQuest plays itself as a movie. The entire story —
all scenes, dialogues, animations, and puzzles — executes automatically in the
optimal story order.

#### Behaviour

| Feature | Normal Mode | Movie Mode |
|---------|------------|------------|
| Dialogue advance | Click / Space | Auto after TTS finishes |
| Password puzzles | Player types answer | UI shown → answer typed automatically |
| Scene traversal | Click hotspots | Runner executes `accessibilityPath` |
| All scenes visited | Player chooses | Yes — optimal story path |

#### Scene Path Definition

Each scene defines an `accessibilityPath` array. Entries are **hotspot ID strings**
or **async functions**:

```javascript
const MyScene = {
  id: 'my_scene',
  accessibilityPath: [
    'hotspot_id_1',            // runner walks to + executes this hotspot
    'hotspot_id_2',
    async function(game) {     // custom logic (e.g. conditional navigation)
      if (game.getFlag('some_flag')) {
        game.loadScene('next_scene');
      }
    }
  ],
  hotspots: [ /* … */ ]
};
```

**Runner rules per entry:**
- **String** — waits for idle → 600 ms pause → walks player to hotspot → executes action
- **Function** — waits for idle → 600 ms pause → awaits function → waits for any triggered scene load
- Scene change mid-run → runner stops (new scene's runner takes over)
- `enabled` / `condition` guards respected — disabled hotspots are skipped

#### Engine Methods

```javascript
game.toggleAccessibilityMode()           // Toggle on/off
game.accessibilityMode                   // boolean
game._startAccessibilityRunner(scene)    // Start runner for loaded scene
game._stopAccessibilityRunner()          // Interrupt runner
game._waitForIdle(timeout)               // Wait: no dialogue/puzzle/scene-load in flight
```

#### Key Runner Flags

| Flag | Set by | Checked by |
|------|--------|------------|
| `tv_documentary_watched` | `tvdocumentary` scene | `home` path function |
| `message_decoded` | `sdr_bench` | `mancave` path function |
| `videocall_done` | `exit_videocall` hotspot | `mancave` path function |
| `visited_planboard` | `planboard` back-button | `mancave` path function |
| `astron_unlocked` | `mancave/ally-recruitment.js` | `garden` path function |
| `drove_to_facility` | `garden` path function | `garden` path function |

---

## 5. Asset Structure

```
CyberQuest/
├── index.html                      # Main entry point
├── engine/
│   ├── game.js                     # Main engine (~4,000 lines)
│   ├── player.js                   # Player character
│   ├── voice.js                    # Voice narration
│   ├── evidence-viewer.js          # Evidence display system
│   ├── chat-interface.js           # Chat UI
│   ├── changelog.js                # In-game changelog data
│   ├── init.js                     # Engine bootstrap
│   ├── styles.css                  # All game styles
│   └── puzzles/
│       └── password-puzzle.js      # Password / cipher puzzles
├── scenes/                         # 34 scene directories
│   ├── intro/scene.js
│   ├── home/scene.js
│   ├── mancave/
│   │   ├── scene.js
│   │   ├── usb-analysis.js
│   │   ├── dilemma.js
│   │   ├── ally-recruitment.js
│   │   ├── volkov-investigation.js
│   │   ├── eva-reveal.js
│   │   ├── eva-contact.js
│   │   ├── forensic-analysis.js
│   │   ├── meshtastic-setup.js
│   │   ├── mission-prep.js
│   │   └── cinematic-utils.js
│   └── …                           # One directory per scene
├── assets/
│   ├── fonts/
│   └── images/
│       ├── characters/             # Character sprites and portraits
│       ├── evidence/               # Documents, photos for evidence viewer
│       ├── icons/                  # UI icons and inventory items
│       │   ├── flipper-zero.svg
│       │   ├── meshtastic.svg
│       │   └── …
│       ├── overlayimg/             # Overlay SVGs (grain, effects)
│       └── scenes/                 # Scene backgrounds (SVG, ~10 MB total)
│           ├── home.svg
│           ├── mancave.svg
│           ├── facility.svg
│           └── …
├── docs/                           # Documentation
└── tests/
    ├── test-engine.js
    └── test-runner.html
```

---

## 6. Scene Catalog

### Complete Scene List (34 Scenes)

| # | Scene ID | Name | Type | Story Phase |
|---|----------|------|------|-------------|
| 1 | `intro` | Opening Sequence | Cinematic | Prologue |
| 2 | `home` | Kitchen | Exploration | Act 1: Setup |
| 3 | `livingroom` | Living Room | Exploration | Act 1: Setup |
| 4 | `tvdocumentary` | TV Documentary | Cinematic | Act 1: Context |
| 5 | `mancave` | Mancave Hub | Hub (multi-module) | Act 1–3: Investigation |
| 6 | `sdr_bench` | SDR Workbench | Interface | Act 1: SSTV Decoding |
| 7 | `planboard` | Investigation Board | Interface | Act 2: Analysis |
| 8 | `regional_map` | Regional Map | Interface | Act 2: Geography |
| 9 | `videocall` | Video Conference | Interface | Act 2: Allies |
| 10 | `garden` | Backyard Garden | Exploration | Act 1–3: Transitions |
| 11 | `garden_back` | Back Garden | Exploration | Act 1–3: Transitions |
| 12 | `sitmower` | Lawn Mowing Mini-Game | Exploration | Act 1: Garden |
| 13 | `car_discovery` | Bench Discovery (Klooster) | Story | Act 1: Setup |
| 14 | `usb_discovery` | USB Discovery | Story | Act 2: Evidence |
| 15 | `driving` | Night Drive | Cinematic | Act 2–3: Transitions |
| 16 | `driving_day` | Daytime Drive | Cinematic | Act 2: Transitions |
| 17 | `klooster` | Ter Apel Monastery | Exploration | Act 2: Dead Drop |
| 18 | `dwingeloo` | Dwingeloo Observatory | Exploration | Act 2: Allies |
| 19 | `westerbork_memorial` | Westerbork Memorial | Exploration | Act 2: Allies |
| 20 | `astron` | ASTRON Campus | Exploration | Act 2: Allies |
| 21 | `lofar` | LOFAR Station | Exploration | Act 2: Allies |
| 22 | `hackerspace` | Hackerspace Drenthe | Exploration | Act 2: Allies |
| 23 | `hackerspace_classroom` | Hackerspace Classroom | Exploration | Act 2: Allies |
| 24 | `drone_hunt` | Drone Hunt | Stealth/Puzzle | Act 3: Preparation |
| 25 | `facility` | Facility Exterior | Stealth | Act 3: Infiltration |
| 26 | `facility_interior` | Facility Corridors | Stealth | Act 3: Infiltration |
| 27 | `laser_corridor` | Laser Corridor | Stealth/Puzzle | Act 3: Infiltration |
| 28 | `facility_server` | Server Room | Climax | Act 3: Confrontation |
| 29 | `long_night` | Long Night | Story | Act 3: Aftermath |
| 30 | `debrief` | Aftermath | Interface | Act 3: Resolution |
| 31 | `return_to_max` | Return to Max | Story | Act 3: Resolution |
| 32 | `morning_after` | Morning After | Story | Act 3: Resolution |
| 33 | `epilogue` | Three Months Later | Cinematic | Epilogue |
| 34 | `credits` | End Credits | Cinematic | Epilogue |

For per-scene flag details, hotspot maps, and transition graphs see [SCENES.md](SCENES.md) and [FLOW_ANALYSIS.md](FLOW_ANALYSIS.md).

---

## 7. Technical Stack

### Core Technologies

| Layer | Technology |
|-------|------------|
| Structure | HTML5 |
| Styling | CSS3 (flexbox, grid, CSS animations) |
| Logic | Vanilla JavaScript ES6+ |
| Graphics | SVG (inline and external) |

### Browser APIs Used

| API | Purpose |
|-----|---------|
| Web Speech API | Optional TTS narration |
| localStorage | Save game state |
| Pointer Events | Unified touch + mouse input |
| History API | Scene-based URL hash routing |

### No External Dependencies

- No frameworks (React, Vue, Angular, etc.)
- No libraries (jQuery, Lodash, etc.)
- No bundlers (Webpack, Rollup, Vite, etc.)
- No transpilation required
- **Result:** Open `index.html` → plays. No install, no build, no network.

### Browser Support

- **Minimum:** Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile:** iOS Safari 13+, Chrome Mobile 80+
- **Recommended:** Any modern browser from 2021+

### Performance Characteristics

| Metric | Value |
|--------|-------|
| Initial load | < 2 seconds |
| Memory | ~50–80 MB |
| Total asset size | ~15 MB |
| HTML/CSS/JS | ~500 KB |
| SVG scenes | ~10 MB |

---

## 8. Development Guide

### Adding a New Scene

1. **Create the scene directory and files:**
   ```
   scenes/new_scene/
   ├── scene.js
   └── design.md    (optional — document intent and hotspot layout)
   ```

2. **Create the SVG background:**
   ```
   assets/images/scenes/new_scene.svg
   ```
   Append `?v=1` to the path in `scene.js` to force cache-bust on first deploy.

3. **Implement `scene.js`:**
   ```javascript
   const NewScene = {
     id: 'new_scene',
     name: 'New Scene Name',
     background: 'assets/images/scenes/new_scene.svg?v=1',
     playerStart: { x: 50, y: 85 },
     idleThoughts: ['Hmm…'],
     hotspots: [],
     onEnter: function(game) { },
     onExit:  function(game) { }
   };

   if (typeof game !== 'undefined') {
     game.registerScene(NewScene);
   }
   ```

4. **Register in `index.html`:**
   ```html
   <script src="scenes/new_scene/scene.js"></script>
   ```

5. **Add transitions** — update hotspots in connecting scenes to link here.

6. **Add `accessibilityPath`** — so Movie Mode can traverse the scene automatically.

7. **Run tests:** open `tests/test-runner.html` and confirm 179/179 pass.

### System Integration: Full Example

**Scenario:** Player clicks USB stick hotspot in Klooster scene.

```javascript
{
  id: 'usb_stick',
  action: function(game) {

    // 1. Add to inventory
    game.addToInventory({ id: 'usb_stick', name: 'USB Stick', icon: '💾' });

    // 2. Set flag
    game.setFlag('usb_found', true);

    // 3. Dialogue with post-dialogue callback
    game.startDialogue([
      { speaker: 'Ryan', text: 'Found it. A black USB stick.' },
      { speaker: '',     text: '*pockets the device carefully*' }
    ], function(game) {

      // 4. Complete previous quest
      game.completeQuest('find_usb');

      // 5. Add the next quest
      game.addQuest({
        id: 'analyze_usb',
        name: 'Analyze USB Contents',
        description: 'Take the USB stick back to the mancave.',
        hint: 'Use the laptop in the mancave'
      });

      // Auto-save fires on the next scene transition
    });
  }
}
```

**Result:** inventory updated ✓, flag set ✓, dialogue + voice play ✓,
quest log updated ✓, auto-saved on next scene change ✓.

### Debugging

**In-browser console commands:**

```javascript
// Scene control
game.loadScene('scene_id');
game.currentScene;
Object.keys(game.scenes);

// State inspection
game.gameState;
game.inventory;
game.getFlag('flag_name');

// Flag manipulation
game.setFlag('any_flag', true);
game.gameState.flags = {};   // reset all flags

// Quest debugging
game.gameState.activeQuests;
game.completeQuest('quest_id');

// Inventory testing
game.addItem({ id: 'test', name: 'Test', icon: '⚙️' });
game.removeFromInventory('item_id');
```

**Enable verbose logging:**
```javascript
game.debugMode = true;
```

**Toggle Movie Mode from console:**
```javascript
game.toggleAccessibilityMode();
```

### Performance Tips

- Use `game.sceneTimeout(fn, delay)` instead of bare `setTimeout` — it auto-cancels when the player leaves the scene
- SVGs should be < 500 KB each
- Keep hotspot count < 10 per scene
- Call `game.destroy()` in test harnesses to clean up all event listeners
- `onExit()` must remove any DOM elements or timers the scene creates

---

**End of Technical Reference**
