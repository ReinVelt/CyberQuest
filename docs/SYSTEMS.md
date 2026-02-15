# CyberQuest: Game Systems Documentation
**Last Updated:** February 15, 2026  
**Version:** 1.0

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

---

## Core Engine Systems

### CyberQuestEngine
**File:** `engine/game.js`  
**Lines:** 1490

The central engine that coordinates all game systems.

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
  time: '08:00',             // In-game time (HH:MM format)
  day: 1                     // Current day number
}
```

#### Core Event Handlers
- **Dialogue Click:** Advance dialogue on click/touch
- **Scene Click:** Walk player to clicked position
- **Hotspot Click:** Execute hotspot action
- **Inventory Toggle:** Show/hide inventory bar
- **Quest Toggle:** Show/hide quest log
- **Menu Buttons:** Save, load, settings, voice toggle

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
  name: 'Display Name',         // Shown on hover/click
  x: 20,                        // X position (% of scene width)
  y: 30,                        // Y position (% of scene height)
  width: 15,                    // Width (%)
  height: 10,                   // Height (%)
  cursor: 'pointer',            // CSS cursor: pointer, look, talk, use
  
  // Option 1: Direct scene transition
  targetScene: 'other_scene',
  
  // Option 2: Custom action function
  action: function(game) {
    // Custom behavior
  }
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
game.startDialogue([
  { 
    speaker: 'Ryan',           // Speaker name (or '' for narration)
    text: 'What is this?',     // Dialogue text
    portrait: 'path/to.jpg'    // Optional portrait image
  },
  { speaker: 'Ies', text: 'It looks dangerous.' },
  { speaker: '', text: '*alarm blares*' }  // Narration/sound effect
]);
```

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

Text appears character-by-character with configurable speed:
```javascript
typewriterSpeed: 30  // milliseconds per character
```

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
**Lines:** 530

Full-screen document viewing system for evidence, emails, photos, schematics.

### Document Types

#### 1. Email
```javascript
game.showEvidence({
  type: 'email',
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Email Subject',
  body: 'Email body text...',
  timestamp: 'Feb 10, 2026 14:32'
});
```

**Rendering:**
- Email header (From, To, Subject, Date)
- Body text (formatted with line breaks)
- Reply chain support (nested emails)

#### 2. Document
```javascript
game.showEvidence({
  type: 'document',
  title: 'Document Title',
  subtitle: 'Optional subtitle',
  author: 'Author Name',
  date: 'Feb 10, 2026',
  classification: 'CONFIDENTIAL',    // Optional
  content: 'Document text content...'
});
```

**Rendering:**
- Header with title, author, date
- Classification marking (if present)
- Body text (formatted)
- Supports markdown-style formatting

#### 3. Image
```javascript
game.showEvidence({
  type: 'image',
  title: 'Image Title',
  imagePath: 'assets/images/evidence/photo.jpg',
  caption: 'Optional caption',
  metadata: 'EXIF: Date, Location, etc.'  // Optional
});
```

**Rendering:**
- Centered image
- Title above
- Caption below
- Metadata footer

#### 4. Chat Log
```javascript
game.showEvidence({
  type: 'chat',
  title: 'Signal Conversation',
  contact: 'Chris Kubecka',
  messages: [
    { sender: 'Ryan', text: 'Message', time: '10:23' },
    { sender: 'Chris', text: 'Reply', time: '10:24' }
  ]
});
```

**Rendering:**
- Chat bubble interface
- Left-aligned (sent) and right-aligned (received)
- Timestamps
- Contact name in header

### Controls

**Navigation:**
- **Back Button** (top-left) - Close evidence viewer
- **Previous/Next** - If multiple documents (future feature)
- **Zoom** - For images (future feature)

**Keyboard Shortcuts:**
- `Escape` - Close viewer
- `Arrow Keys` - Navigate documents (future)

### Evidence Tracking

**Viewed Evidence:**
```javascript
game.hasViewedEvidence('document_id')  // Returns true/false
```

Evidence viewing is tracked in game state for quest progression.

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

```javascript
voices: {
  'Ryan': {
    rate: 0.9,          // Speed (0.1 to 10)
    pitch: 0.8,         // Pitch (0 to 2)
    volume: 1.0,        // Volume (0 to 1)
    voiceName: 'Google US English'  // Preferred voice
  },
  'Ies': {
    rate: 1.0,
    pitch: 1.2,
    voiceName: 'Google UK English Female'
  },
  'Narrator': {
    rate: 0.85,
    pitch: 0.7,
    volume: 0.9
  }
}
```

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
  version: '1.0',
  timestamp: 1707996345678,      // Unix timestamp
  currentScene: 'mancave',
  gameState: {
    storyPart: 5,
    questsCompleted: ['decode_message'],
    activeQuests: [...],
    flags: { ... },
    time: '14:30',
    day: 1
  },
  inventory: [...],
  viewedEvidence: [...]
}
```

### Saving Game

**Manual Save:**
```javascript
game.saveGameState();
// Saves to localStorage under key: 'cyberquest_save'
```

**Auto-Save:**
Game automatically saves:
- On scene transition
- After quest completion
- After important story flags

**Save Notification:**
"Game saved" notification appears briefly.

### Loading Game

**On Game Start:**
```javascript
game.loadGameState();
// Restores all progress from localStorage
```

**Load from Menu:**
Future feature: Multiple save slots

### Save Data Management

**Check for Save:**
```javascript
if (localStorage.getItem('cyberquest_save')) {
  // Save exists
}
```

**Delete Save:**
```javascript
localStorage.removeItem('cyberquest_save');
```

**Export Save (Future):**
```javascript
const saveData = game.exportSaveData();
// Returns JSON string for backup
```

**Import Save (Future):**
```javascript
game.importSaveData(jsonString);
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
- `talked_to_ies`
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
    
    // 4. Start dialogue sequence
    game.startDialogue([
      { speaker: 'Ryan', text: 'Found it. A black USB stick.' },
      { speaker: '', text: '*Pockets the device carefully*' }
    ]);
    
    // 5. After dialogue, add quest
    setTimeout(() => {
      game.addQuest({
        id: 'analyze_usb',
        name: 'Analyze USB Contents',
        description: 'Take the USB stick back to the mancave for analysis.',
        hint: 'Use the laptop in the mancave'
      });
      
      // 6. Complete previous quest
      game.completeQuest('find_usb');
      
      // 7. Save progress
      game.saveGameState();
      
    }, 5000);  // Wait for dialogue to finish
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
- Event listeners detached
- Timers/intervals cleared
- Character sprites removed

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
- [ ] Multiple save slots (3-5 slots)
- [ ] Cloud save sync
- [ ] Accessibility mode (skip puzzles, auto-solve)
- [ ] Hint system (progressive hints on timers)

### Under Consideration
- [ ] Mini-games (hacking simulations)
- [ ] Branching narrative (player choices affect outcome)
- [ ] Character relationship tracking
- [ ] Skill system (hacking, social engineering, etc.)
- [ ] Time pressure mechanics (optional hard mode)

---

**End of Systems Documentation**
