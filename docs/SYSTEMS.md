# CyberQuest: Game Systems Documentation
**Last Updated:** February 27, 2026  
**Version:** 1.1

---

## Table of Contents
1. [Core Engine Systems](#core-engine-systems)
2. [Scene Management](#scene-management)
3. [Dialogue System](#dialogue-system)
4. [Inventory System](#inventory-system)
5. [Quest System](#quest-system)
6. [Evidence Viewer](#evidence-viewer)
7. [Password Puzzle System](#password-puzzle-system)
8. [Chat Interface](#chat-interface)
9. [Voice Narration](#voice-narration)
10. [Save/Load System](#save-load-system)
11. [Player Character](#player-character)
12. [Flag System](#flag-system)
13. [Accessibility / Movie Mode](#accessibility--movie-mode)

---

## Core Engine Systems

### CyberQuestEngine
**File:** `engine/game.js`  
**Lines:** 2704

The central engine that coordinates all game systems.

#### Engine Configuration

All timing constants live in a frozen `ENGINE_CONFIG` object:

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

#### Initialization Sequence
```javascript
1. createGameContainer()      // Build DOM structure
2. bindEvents()                // Attach event listeners
3. loadGameState()             // Restore saved progress
4. initPlayer()                // Spawn player character
5. Initialize subsystems:
   - Evidence Viewer
   - Password Puzzle
   - Chat Interface
   - Voice Manager
```

#### Game State Structure
```javascript
gameState: {
  storyPart: 0,              // Numeric story progression (0-20)
  questsCompleted: [],       // Array of completed quest IDs
  activeQuests: [],          // Array of quest objects
  flags: {},                 // Key-value boolean flags
  evidence: [],              // Collected evidence items
  evidenceViewed: [],        // IDs of evidence documents viewed
  time: '08:00',             // In-game time (HH:MM format)
  day: 1                     // Current day number
}
```

> **Save version:** `_saveVersion = 2`. The `loadGame()` method merges saved state
> over a fresh default, so new fields are always initialised even on old saves.

#### Core Event Handlers
- **Dialogue Click:** Advance dialogue on click/touch
- **Scene Click:** Walk player to clicked position
- **Hotspot Click:** Execute hotspot action
- **Inventory Toggle:** Show/hide inventory bar
- **Quest Toggle:** Show/hide quest log
- **Menu Buttons:** Pause, Save, Load, Settings, Voice toggle
- **Keyboard:** `P` pause/resume, `Space` advance dialogue, `V` voice toggle, `D` debug panel, `Escape` resume if paused

---

## Scene Management

### Scene Loading Process

**Method:** `loadScene(sceneId, transition = 'fade')`

**Steps:**
1. Call `onExit()` on current scene (cleanup)
2. Apply fade-out transition (500ms)
3. Set `currentScene` to new scene ID
4. Load background SVG
5. Apply scene-specific CSS class
6. Set background color (if specified)
7. Load hotspots onto scene
8. Position player character (or hide if no playerStart)
9. Call `onEnter()` on new scene (initialization)
10. Apply fade-in transition (500ms)
11. Update URL hash for navigation

**Transition Types:**
- `'fade'` - Crossfade (default, 500ms)
- `'instant'` - No transition
- Future: `'slide'`, `'wipe'`, etc.

### Hotspot System

**Hotspot Structure:**
```javascript
{
  id: 'unique_id',              // Unique identifier
  name: 'Display Name',         // Shown on hover/click (tooltip)
  x: 20,                        // X position (% of scene width)
  y: 30,                        // Y position (% of scene height)
  width: 15,                    // Width (%)
  height: 10,                   // Height (%)
  cursor: 'pointer',            // CSS cursor: pointer, look, talk, use
  cssClass: 'hotspot-nav',      // Extra CSS class (optional)
  icon: 'assets/images/…svg',   // Image overlaid on hotspot (optional)
  label: 'Go North',            // Text label overlaid on hotspot (optional)
  visible: true,                // false = not rendered at all
  skipWalk: false,              // true = execute immediately, skip player walk
  lookMessage: 'A sturdy door.',// Ryan thinks this on click (optional)
  disabledMessage: 'Locked.',   // Thought shown when enabled === false
  failMessage: 'Need a key.',   // Thought shown when condition fails

  // Dynamic enable guard (function or static boolean)
  enabled: function(game) { return game.getFlag('door_unlocked'); },

  // Prerequisite flag check (string = flag name, or function)
  condition: 'picked_up_usb',

  // Option 1: Direct scene transition
  targetScene: 'other_scene',

  // Option 2: Custom action function
  action: function(game) {
    // Custom behavior
  },

  // Option 3: Interactions pattern (look / use / default)
  interactions: {
    look: function(game) { game.playerThink('I see a control panel.'); },
    use:  function(game) { game.startDialogue([...]); },
  },

  // Shorthand: auto-add item on click
  item: { id: 'usb', name: 'USB Stick', icon: '💾' },

  // Shorthand: auto-start dialogue on click
  dialogue: [ { speaker: 'Ryan', text: 'Hello.' } ],
}
```

**Cursor Types:**
- `pointer` - Default interaction (blue highlight)
- `look` - Examination (magnifying glass)
- `talk` - Conversation (speech bubble)
- `use` - Use item (hand icon)
- `move` - Navigation (arrow)

**Rendering:**
Hotspots are created as invisible DIV overlays positioned absolutely within the scene container. On hover, they receive a visual highlight (cyan glow) and show the cursor type.

---

## Dialogue System

**Location:** Integrated in `engine/game.js`

### Starting Dialogue

```javascript
// Full form — optional onComplete callback fires when dialogue ends:
game.startDialogue([
  { 
    speaker: 'Ryan',           // Speaker name (or '' for narration)
    text: 'What is this?',     // Dialogue text
    portrait: 'path/to.jpg'    // Optional portrait override
  },
  { speaker: 'Max', text: 'It looks dangerous.' },
  { speaker: '', text: '*alarm blares*' }  // Narration/sound effect
], function(game) {
  // Called when all lines are done
});

// Convenience shorthand (all lines share the same speaker):
game.showDialogue(['Coffee first.', 'Then we talk.'], 'Ryan');
```

**Auto-portrait lookup:** if no `portrait` is given, the engine derives the
portrait path from the speaker name via an internal `PORTRAIT_MAP`.

### Dialogue Box Structure

**HTML:**
```html
<div id="dialogue-box">
  <div id="dialogue-portrait"></div>
  <div id="dialogue-content">
    <div id="dialogue-speaker">Speaker Name</div>
    <div id="dialogue-text">Dialogue text...</div>
  </div>
  <div id="dialogue-continue">Click to continue...</div>
</div>
```

**Visual Design:**
- Dark semi-transparent background
- Cyan/green accent colors
- Monospace font for text
- Portrait on left (if provided)
- "Click to continue" prompt at bottom

### Typewriter Effect

Text appears character-by-character:
```javascript
ENGINE_CONFIG.TYPEWRITER_SPEED = 40  // milliseconds per character
```

An `AbortController` (`typewriterAbortController`) cancels in-flight typing
whenever the player advances or the game is paused.

**Skip Functionality:**
- Click during typing → complete current line instantly
- Click after typing complete → advance to next line

### Voice Integration

If voice narration is enabled and available:
1. Text starts typing
2. Voice synthesis begins speaking simultaneously
3. Voice can be interrupted by clicking
4. Next line waits for voice to finish (or skip)

---

## Inventory System

**Location:** Integrated in `engine/game.js`

### Adding Items

```javascript
game.addToInventory({
  id: 'usb_stick',
  name: 'USB Stick',
  icon: '💾',                    // Emoji or image path
  description: 'A black USB stick from the dead drop.'
});

// Shorthand:
game.addItem({ id: 'item_id', name: 'Item', icon: '🔧' });
```

### Item Structure

```javascript
{
  id: 'unique_id',         // Unique identifier
  name: 'Item Name',       // Display name
  icon: '🔧',              // Emoji or 'assets/images/icons/item.svg'
  description: 'Text'      // Shown on hover/click
}
```

### UI Display

**Location:** Bottom-right of screen (overlays scene)

**Features:**
- Toggle button: 🎒 Inventory
- Expandable item list
- Icon grid display
- Hover shows item name + description
- Click item for detailed view (future feature)

### Item Checking

```javascript
if (game.hasItem('flipper_zero')) {
  // Player has Flipper Zero
}
```

### Removing Items

```javascript
game.removeFromInventory('item_id');
```

---

## Quest System

**Location:** Integrated in `engine/game.js`

### Quest Structure

```javascript
{
  id: 'quest_id',
  name: 'Quest Title',
  description: 'What the player needs to do',
  hint: 'Optional hint text',          // Shows with 💡 icon
  progress: [],                         // Array of step IDs completed
  onComplete: function(game) {          // Callback when quest finishes
    // Reward, flag setting, etc.
  }
}
```

### Adding Quests

```javascript
// Full object:
game.addQuest({
  id: 'investigate_signal',
  name: 'Investigate the Signal',
  description: 'Analyze the SSTV transmission in the mancave.',
  hint: 'Check the SSTV terminal'
});

// Shorthand (legacy support):
game.addQuest('quest_id', 'Quest Name', 'Description');
```

### Quest Manager API

For compatibility with scene scripts:
```javascript
game.questManager.isActive('quest_id')      // Check if quest active
game.questManager.hasQuest('quest_id')      // Active or completed
game.questManager.updateProgress(id, step)  // Mark step complete
game.questManager.complete('quest_id')      // Complete quest
game.questManager.getProgress('quest_id')   // Get progress array
```

### Completing Quests

```javascript
game.completeQuest('quest_id');
// - Removes from active quests
// - Adds to completed list
// - Shows notification
// - Calls onComplete() if defined
```

### UI Display

**Location:** Top-right of screen

**Features:**
- Toggle button: 📋 Quests
- Expandable quest list
- Active quests only (completed quests hidden)
- Each quest shows:
  - Quest name (bold)
  - Description
  - Hint (if provided, with 💡)

---

## Evidence Viewer

**File:** `engine/evidence-viewer.js`  
**Lines:** 612

Full-screen document viewing system for evidence, emails, photos, schematics.

### API

The engine exposes `game.showEvidence(documentData)` which delegates to
`evidenceViewer.showDocument(documentData)`. Document type is set via the
`type` field of the data object.

### Document Types

#### 1. Text / Report
```javascript
game.showEvidence({
  id: 'usb_readme',
  type: 'text',          // or 'report'
  title: 'README.txt',
  author: 'E. Weber',
  date: 'Feb 9, 2026',
  classification: 'CONFIDENTIAL',  // Optional
  content: 'Document text content…'
  // content can also be an array of strings for multi-page documents
});
```

#### 2. Email
```javascript
game.showEvidence({
  id: 'email_001',
  type: 'email',
  title: 'Email: Project Status',
  // All standard fields: author, date, content, etc.
  content: 'From: volkov@…\nTo: hoffmann@…\n\nEmail body…'
});
```

#### 3. Image / Schematic
```javascript
game.showEvidence({
  id: 'facility_schematic',
  type: 'image',        // or 'schematic'
  title: 'Facility Floor Plan',
  content: 'assets/images/evidence/floorplan.svg'
});
```

#### 4. onRead Callback

Any document can include an `onRead` callback fired the first time it is viewed:
```javascript
game.showEvidence({
  id: 'critical_doc',
  type: 'text',
  title: '…',
  content: '…',
  onRead: function(game) {
    game.setFlag('read_critical_doc', true);
    game.completeQuest('find_evidence');
  }
});
```

### Controls

**Navigation:**
- **Back Button** (top-left) - Close evidence viewer
- **Previous/Next** - If multiple documents (future feature)
- **Zoom** - For images (future feature)

**Keyboard Shortcuts:**
- `Escape` - Close viewer
- `Arrow Keys` - Navigate documents (future)

### Evidence Tracking

```javascript
game.hasViewedEvidence('document_id')  // Returns true/false
game.addEvidence(evidenceData)         // Store in gameState.evidence
```

Viewed document IDs are stored in `evidenceViewer.documentHistory` and
sync'd into `gameState.evidenceViewed` on every save.

---

## Password Puzzle System

**File:** `engine/puzzles/password-puzzle.js`

Interactive password and cipher puzzle interface.

### Basic Password Puzzle

```javascript
game.passwordPuzzle.show({
  title: 'Enter Password',
  description: 'Optional context text',
  correctPassword: 'SECRET',         // Case-sensitive
  hint: 'Optional hint text',
  
  onSuccess: function(game) {
    // Called when correct password entered
    game.setFlag('puzzle_solved', true);
    game.showNotification('Access granted!');
  },
  
  onCancel: function(game) {
    // Called when player cancels puzzle
  }
});
```

### ROT1 Cipher Puzzle

For the SSTV message decryption:

```javascript
game.passwordPuzzle.showROT1Puzzle({
  title: 'Decode ROT1 Message',
  encryptedText: 'XBSOJOH - QSPKFDU FDIP',
  hint: 'Each letter is shifted forward by 1',
  
  onSuccess: function(game, decodedText) {
    game.showNotification('Message decoded!');
    // decodedText = "WARNING - PROJECT ECHO"
  }
});
```

**ROT1 Decoder:**
- Visual alphabet reference (A↔B, B↔C, etc.)
- Input field for decryption attempt
- Automatic validation
- Helps player understand cipher without being tedious

### Numeric Code

For keypads and number locks:

```javascript
game.passwordPuzzle.show({
  title: 'Enter Code',
  type: 'numeric',              // Only numbers allowed
  correctPassword: '1234',
  maxLength: 4,                 // Limit input length
  onSuccess: function(game) { }
});
```

### UI Features

**Visual Design:**
- Full-screen overlay (dark background)
- Centered puzzle box
- Input field with focus
- Submit button + Cancel button
- Hint shown below input (if provided)

**Input Handling:**
- Text input field (or number pad for numeric)
- Enter key submits answer
- Escape key cancels puzzle
- Case-sensitive by default (configurable)

**Feedback:**
- Incorrect: Red flash + error message
- Correct: Green flash + success callback
- Hint: 💡 icon + hint text

---

## Chat Interface

**File:** `engine/chat-interface.js`

Signal/WhatsApp-style encrypted chat UI.

### Showing Chat Conversation

```javascript
game.chatInterface.show({
  contact: 'Chris Kubecka',
  avatar: 'assets/images/portraits/chris.jpg',  // Optional
  
  messages: [
    { 
      sender: 'Ryan',              // 'Ryan' or contact name
      text: 'Need your help',
      time: '10:23'
    },
    { 
      sender: 'Chris',
      text: 'What do you need?',
      time: '10:24'
    },
    { 
      sender: 'Ryan',
      text: 'Looking into someone named Volkov',
      time: '10:25'
    }
  ],
  
  onClose: function(game) {
    // Called when chat is closed
  }
});
```

### Message Structure

```javascript
{
  sender: 'Name',        // Determines bubble alignment
  text: 'Message',       // Message content
  time: 'HH:MM',        // Timestamp (optional)
  status: 'sent'        // sent, delivered, read (optional)
}
```

### Visual Design

**Chat Window:**
- Full-screen overlay
- Header: Contact name + avatar + close button
- Message area: Scrollable conversation
- Footer: "End-to-end encrypted" indicator

**Message Bubbles:**
- Sender (Ryan): Right-aligned, blue background
- Receiver: Left-aligned, gray background
- Rounded corners
- Timestamp below each message
- Status indicators (checkmarks)

**Typing Indicator (Future):**
```javascript
{ type: 'typing', sender: 'Chris' }  // Shows "..." animation
```

### Advanced Features

**Message Sequencing:**
Messages can be revealed progressively with delays:
```javascript
game.chatInterface.showSequence({
  contact: 'Eva',
  sequence: [
    { delay: 1000, message: { sender: 'Eva', text: 'Are you there?' } },
    { delay: 2000, message: { sender: 'Ryan', text: 'Yes, I'm here' } },
    { delay: 1500, message: { sender: 'Eva', text: 'Good. Listen carefully...' } }
  ]
});
```

**Attachments (Future):**
```javascript
{
  sender: 'Eva',
  type: 'attachment',
  filename: 'schematics.pdf',
  icon: '📄',
  onClick: function(game) {
    game.showEvidence({ ... });
  }
}
```

---

## Pause System

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

**Keyboard:** `P` toggles pause; `Escape` also resumes if paused.

---

## Voice Narration

**File:** `engine/voice.js`

Text-to-speech system using Web Speech API.

### VoiceManager Class

```javascript
const voiceManager = new VoiceManager();
```

**Methods:**
- `speak(text, options)` - Speak text
- `stop()` - Stop current speech
- `pause()` - Pause speech
- `resume()` - Resume paused speech
- `getVoices()` - Get available system voices
- `setVoice(voiceName)` - Set speaker voice

### Character Voice Profiles

The VoiceManager has built-in profiles for all named characters:

```javascript
// Protagonist
'Ryan':          { pitch: 0.90, rate: 0.95, lang: 'en-GB', … }
"Ryan's Thoughts": { pitch: 0.85, rate: 0.90, … }

// Contacts / allies
'Max':           { pitch: 1.15, rate: 0.95, … }   // Dutch female
'Eva':           { pitch: 1.15, rate: 0.90, … }   // German female
'Chris Kubecka': { pitch: 1.10, rate: 1.00, lang: 'en-US', … }
'David Prinsloo':{ pitch: 0.95, rate: 1.00, … }
'Cees Bassa':    { pitch: 1.00, rate: 0.95, … }
'Jaap Haartsen': { pitch: 0.88, rate: 0.92, … }

// Antagonist
'Volkov':        { pitch: 0.70, rate: 0.85, … }   // Deep, menacing

// Hackerspace members (Dennis, Sophie, Marco, Kim, Joris, Linda, Aisha, …)
// Documentary narrator, Presenter, Narrator, and more
// See engine/voice.js for the full list.
```

**Voice archetypes** (`britishMale`, `britishFemale`, `americanFemale`) reduce
duplication — each profile inherits preferred voice names and language tag.

### Usage in Dialogue

```javascript
game.startDialogue([
  { speaker: 'Ryan', text: 'This will be spoken aloud' }
]);
// Voice automatically speaks based on character profile
```

### Toggle Voice

```javascript
game.toggleVoice();  // Enable/disable voice narration
```

**UI Button:**
- 🔊 Voice (enabled)
- 🔇 Muted (disabled)

### Browser Support

**Supported:**
- Chrome/Edge (excellent)
- Firefox (good, limited voices)
- Safari (good on macOS/iOS)

**Fallback:**
If Web Speech API not available, dialogue functions normally without voice.

### Voice Selection

```javascript
// Get available voices:
const voices = voiceManager.getVoices();

// Filter by language:
const enVoices = voices.filter(v => v.lang.startsWith('en'));

// Set specific voice:
voiceManager.setVoice('Google US English');
```

---

## Save/Load System

**Location:** Integrated in `engine/game.js`

Uses browser localStorage for persistent save data.

### Save Data Structure

```javascript
{
  version: 2,                          // _saveVersion (integer, bumped on format changes)
  timestamp: '2026-02-27T14:00:00Z',   // ISO 8601 timestamp
  currentScene: 'mancave',
  voiceEnabled: true,
  gameState: {
    storyPart: 5,
    questsCompleted: ['decode_message'],
    activeQuests: [...],
    flags: { … },
    evidence: [...],
    evidenceViewed: ['usb_readme', 'email_001'],
    time: '14:30',
    day: 1
  },
  inventory: [...]
}
```

### Saving

```javascript
game.saveGame();              // Manual save to auto-slot — shows 'Game saved!' notification
game.saveGame(true);          // Silent auto-save (no notification)
game.saveGame(false, 2);      // Save to named Slot 2
game.openSaveSlotModal('save'); // Open 3-slot picker UI
```

Auto-save fires on **every scene transition** (silent, no notification).

### Loading

```javascript
game.loadGame();              // Load from auto-slot
game.loadGame(2);             // Load from Slot 2
game.openSaveSlotModal('load'); // Open 3-slot picker UI
```

**On startup**, `loadGameState()` checks the URL hash — if it matches a
registered scene the game jumps directly there (dev/debug convenience).

### Storage Key

```javascript
localStorage.getItem('cyberquest_save')     // Auto-save / legacy slot
localStorage.getItem('cyberquest_save_1')   // Named Slot 1
localStorage.getItem('cyberquest_save_2')   // Named Slot 2
localStorage.getItem('cyberquest_save_3')   // Named Slot 3
localStorage.getItem('cyberquest_settings') // User settings (text/anim speed)
localStorage.removeItem('cyberquest_save')  // Delete auto-save
```

---

## Player Character

**File:** `engine/player.js`

Visual player avatar that moves through scenes.

### PlayerCharacter Class

```javascript
const player = new PlayerCharacter(game);
player.init();
```

### Rendering

**HTML Structure:**
```html
<div id="scene-characters">
  <div id="player-character" class="character">
    <div class="character-sprite">🧑‍💻</div>
    <div class="character-name">Ryan</div>
    <div class="thought-bubble hidden"></div>
  </div>
</div>
```

**Visual:**
- Emoji sprite: 🧑‍💻 (default)
- Or custom image: `assets/images/characters/ryan.png`
- Name label below
- Thought bubble above (when thinking)

### Movement

**Click-to-Move:**
```javascript
// Scene click handler (in game.js)
sceneContainer.addEventListener('click', (e) => {
  if (!dialogueActive && !puzzleActive) {
    const rect = sceneContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    game.player.moveTo(x, y);
  }
});
```

**Animation:**
- Smooth transition (CSS transition)
- Duration: 500ms (configurable)
- Easing: ease-in-out

### Positioning

**Percentage-Based:**
- X: 0-100% of scene width
- Y: 0-100% of scene height
- Bottom-aligned (feet at Y position)

**Scene Start Position:**
```javascript
playerStart: { x: 50, y: 85 }  // Center-bottom
```

### Idle Thoughts

**Random Thought Display:**
```javascript
game.player.think();  // Shows random thought from current scene

// Scene defines thoughts:
idleThoughts: [
  "Coffee. Now.",
  "This place is quiet.",
  "Should check email..."
]
```

**Thought Bubble:**
- Appears above player
- Fades in, displays 3 seconds, fades out
- Randomly triggered every 15-30 seconds
- Can be triggered manually

### Visibility Control

```javascript
game.player.show();  // Make visible
game.player.hide();  // Hide (for cinematic scenes)
```

**Hidden scenes:** Intro, Documentary, Credits, Driving (no player movement)

---

## Flag System

**Location:** Integrated in `engine/game.js`

Boolean flags track game progress and unlock content.

### Setting Flags

```javascript
game.setFlag('sstv_decoded', true);
game.setFlag('usb_analyzed', true);
game.setFlag('visited_klooster', true);
```

### Checking Flags

```javascript
if (game.getFlag('sstv_decoded')) {
  // Player has decoded SSTV message
}
```

### Common Flags

**Story Progress:**
- `intro_complete`
- `espresso_made`
- `watched_documentary`
- `sstv_decoded`
- `usb_found`
- `usb_analyzed`
- `driving_destination` (string: 'klooster', 'facility')
- `visited_klooster`
- `visited_facility`
- `evidence_downloaded`
- `test_sabotaged`
- `game_complete`

**Character Interactions:**
- `talked_to_max`
- `called_david`
- `called_cees`
- `called_jaap`
- `contacted_eva`

**UI Unlocks:**
- `planboard_unlocked`
- `regional_map_unlocked`
- `videocall_unlocked`

**Puzzle States:**
- `password_solved`
- `gate_opened`
- `camera_disabled`
- `basement_unlocked`

### Flag Persistence

Flags are saved/loaded automatically with game state.

### Advanced Flag Usage

**Conditional Dialogue:**
```javascript
if (game.getFlag('sstv_decoded')) {
  dialogue = [
    { speaker: 'Ryan', text: 'I decoded that message.' }
  ];
} else {
  dialogue = [
    { speaker: 'Ryan', text: 'I should decode that message.' }
  ];
}
game.startDialogue(dialogue);
```

**Hotspot Activation:**
```javascript
{
  id: 'locked_door',
  action: function(game) {
    if (game.getFlag('has_keycard')) {
      game.setFlag('door_unlocked', true);
      game.loadScene('next_area');
    } else {
      game.startDialogue([
        { speaker: 'Ryan', text: 'It's locked. I need a keycard.' }
      ]);
    }
  }
}
```

**Quest Gating:**
```javascript
if (game.getFlag('evidence_stage_1')) {
  game.addQuest({
    id: 'evidence_stage_2',
    name: 'Deeper Investigation',
    description: 'Continue analyzing the evidence.'
  });
}
```

---

## System Integration Example

Here's how all systems work together in a typical interaction:

**Scenario:** Player clicks on USB stick in Klooster scene

```javascript
// 1. Hotspot triggers action
{
  id: 'usb_stick',
  action: function(game) {
    
    // 2. Add item to inventory
    game.addToInventory({
      id: 'usb_stick',
      name: 'USB Stick',
      icon: '💾'
    });
    
    // 3. Set flag for future checks
    game.setFlag('usb_found', true);
    
    // 4. Start dialogue; pass callback for post-dialogue logic
    game.startDialogue([
      { speaker: 'Ryan', text: 'Found it. A black USB stick.' },
      { speaker: '', text: '*Pockets the device carefully*' }
    ], function(game) {
      // 5. After last dialogue line, add quest
      game.addQuest({
        id: 'analyze_usb',
        name: 'Analyze USB Contents',
        description: 'Take the USB stick back to the mancave for analysis.',
        hint: 'Use the laptop in the mancave'
      });
      
      // 6. Complete previous quest
      game.completeQuest('find_usb');
      
      // saveGame fires automatically on the next scene transition
    });
  }
}
```

**Result:**
- USB added to inventory ✓
- Flag set for usb_found ✓
- Dialogue plays with voice ✓
- New quest appears in quest log ✓
- Old quest marked complete ✓
- Progress auto-saved ✓

---

## Performance Considerations

### Memory Management

**Scene Cleanup:**
- `onExit()` removes temporary elements
- `clearSceneTimeouts()` cancels all `sceneTimeout()` timers automatically on scene exit
- `_boundHandlers` tracked globally; full cleanup via `game.destroy()`
- Character sprites removed

**Scene-scoped Timers:**

Use `game.sceneTimeout(fn, delay)` instead of bare `setTimeout` for anything
that should not fire after the player has left the scene:
```javascript
game.sceneTimeout(() => { game.showNotification('Beep!'); }, 3000);
```

**Asset Loading:**
- SVGs loaded on-demand per scene
- No preloading (fast initial load)
- Browser caching handles repeat visits

### Optimization Tips

**Dialogue System:**
- Typewriter effect can be instant-skipped
- Voice synthesis runs async (non-blocking)

**Hotspots:**
- Only active scene's hotspots rendered
- Hitbox calculations use percentage positioning (viewport-independent)

**Save System:**
- LocalStorage limited to ~5MB (plenty for text-based game)
- Save operations async (non-blocking)

---

## Debugging Systems

### Console Commands

**Scene Control:**
```javascript
game.loadScene('scene_id');           // Jump to scene
game.currentScene;                    // Current scene ID
Object.keys(game.scenes);             // List all scenes
```

**State Inspection:**
```javascript
game.gameState;                       // Current state
game.inventory;                       // Current items
game.getFlag('flag_name');           // Check flag
```

**Flag Manipulation:**
```javascript
game.setFlag('any_flag', true);      // Set flag
game.gameState.flags = {};            // Reset all flags
```

**Quest Debugging:**
```javascript
game.gameState.activeQuests;          // See active quests
game.completeQuest('quest_id');       // Force complete
game.addQuest({...});                 // Add test quest
```

**Inventory Testing:**
```javascript
game.addItem({ id: 'test', name: 'Test', icon: '⚙️' });
game.removeFromInventory('item_id');
```

---

## Future System Enhancements

### Planned
- [ ] Achievement system (track milestones)
- [ ] Statistics (time played, scenes visited, choices made)
- [x] Multiple save slots (3-5 slots) ✅
- [ ] Cloud save sync
- [x] Accessibility mode (movie mode — full auto-play) ✅
- [ ] Hint system (progressive hints on timers)

### Under Consideration
- [ ] Mini-games (hacking simulations)
- [ ] Branching narrative (player choices affect outcome)
- [ ] Character relationship tracking
- [ ] Skill system (hacking, social engineering, etc.)
- [ ] Time pressure mechanics (optional hard mode)

---

## Accessibility / Movie Mode

**Location:** `engine/game.js`  
**Toggle:** `🎬 Movie` button in bottom bar, or `game.toggleAccessibilityMode()`  
**Indicator:** Persistent `🎬 Movie Mode` badge (bottom-right)

A special game state in which CyberQuest plays itself as a movie. The entire story — all scenes, dialogues, animations, and puzzles — executes automatically in the optimal story order without skipping any content.

### Behaviour

| Feature | Normal Mode | Movie Mode |
|---------|------------|------------|
| Dialogue advance | Click / Space | Auto after TTS finishes |
| Password puzzles | Player types answer | UI shown → answer typed automatically |
| Scene traversal | Click hotspots | Runner executes hotspot path |
| All scenes visited | Player chooses | Yes — optimal story path |

### Scene Path Definition

Each story-critical scene defines an `accessibilityPath` array on its scene object. Entries are either **hotspot ID strings** or **async functions** for conditional / custom navigation.

```javascript
const MyScene = {
    id: 'my_scene',
    accessibilityPath: [
        'hotspot_id_1',          // string: runner finds + executes this hotspot
        'hotspot_id_2',
        async function(game) {   // function: custom logic (e.g. conditional drive)
            if (game.getFlag('some_flag')) {
                game.loadScene('next_scene');
            }
        }
    ],
    hotspots: [ ... ]
};
```

**Runner behaviour per entry:**
- **String**: waits for idle → 600 ms pause → walks player to hotspot → executes action
- **Function**: waits for idle → 600 ms pause → awaits the function → waits for any triggered scene load to settle
- Scene change detected mid-run → runner stops (new scene runner takes over)
- Hotspot `enabled` / `condition` guards respected (disabled hotspots are skipped)

### Engine Methods

```javascript
game.toggleAccessibilityMode()        // Toggle movie mode on/off
game.accessibilityMode                // Current state (boolean)
game._startAccessibilityRunner(scene) // Start runner for loaded scene
game._stopAccessibilityRunner()       // Interrupt runner
game._waitForIdle(timeout)            // Wait: no dialogue / puzzle / scene load
```

### Optimal Story Path

All story scenes in order:

| Scene | Key accessibilityPath entries |
|-------|-------------------------------|
| `intro` | Auto-cinematic (no path) |
| `home` | `espresso-machine` → conditional nav to `livingroom` or `mancave` |
| `livingroom` | `tv` → `to_home` |
| `tvdocumentary` | Auto-cinematic (no path) |
| `mancave` | Full multi-visit path: `laptop`, `sstv-terminal`, conditional `sdr_bench`, `hackrf`, USB analysis, allies, Eva contact, videocall, planboard, gear, exit |
| `sdr_bench` | `sstv_decoder` → `back_to_mancave` |
| `garden` | Function: drive to `klooster` → `astron` → `facility` based on flags |
| `driving` / `driving_day` | Auto-cinematic (no path) |
| `klooster` | `bench` → `volvo` |
| `usb_discovery` | Auto-cinematic (no path) |
| `car_discovery` | `usb_stick` → `car` |
| `videocall` | `call_david` → `call_cees` → `call_jaap` → `exit_videocall` |
| `planboard` | `back-button` |
| `wsrt_parking` | `walk_planetenpad` |
| `planetenpad` | Skip cinematic → `continue_to_wsrt` |
| `astron` | `cees-bassa` → `wall-monitors` → `door-exit` |
| `facility` | `trash_bin` → `camera` → `control_panel` |
| `facility_interior` | `eva_mesh` → `basement_stairs` |
| `facility_server` | Auto-cinematic → loads `driving(home_from_facility)` → `long_night` |
| `long_night` | Auto-cinematic (no path) |
| `debrief` | `continue-to-epilogue` |
| `return_to_max` | `continue-morning` |
| `morning_after` | `continue-epilogue` |
| `epilogue` | Auto-cinematic (no path) |
| `credits` | Auto-cinematic (no path) |

### Key Flags Used by Runner

| Flag | Set by | Checked by |
|------|--------|------------|
| `tv_documentary_watched` | `tvdocumentary` scene | `home` path function |
| `message_decoded` | `sdr_bench` (SSTV decode) | `mancave` path function (skip sdr_bench re-entry) |
| `videocall_done` | `exit_videocall` hotspot | `mancave` path function (skip re-launch) |
| `visited_planboard` | `planboard` back-button | `mancave` path function (skip re-entry) |
| `astron_unlocked` | `mancave/ally-recruitment.js` | `garden` path function (drive to WSRT) |
| `drove_to_facility` | `garden` path function | `garden` path function (drive to facility) |

---

**End of Systems Documentation**
