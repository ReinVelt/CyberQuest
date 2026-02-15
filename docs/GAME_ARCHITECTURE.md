# CyberQuest: Game Architecture Documentation
**Last Updated:** February 15, 2026  
**Version:** 1.0  
**Status:** Production

---

## Table of Contents
1. [Overview](#overview)
2. [Core Engine](#core-engine)
3. [Scene System](#scene-system)
4. [Game Systems](#game-systems)
5. [Asset Structure](#asset-structure)
6. [Scene Catalog](#scene-catalog)
7. [Technical Stack](#technical-stack)

---

## Overview

**CyberQuest: Operation ZERFALL** is a Sierra-style point-and-click adventure game built with vanilla JavaScript, HTML5, and SVG graphics. The game follows Ryan Weylant, a Dutch hacker who uncovers a Russian infiltration operation within a German military R&D facility.

### Design Philosophy
- **Accessibility-first**: Fully playable on desktop and mobile devices
- **No build process**: Pure HTML/JS/CSS for easy deployment and modification
- **SVG graphics**: Scalable, lightweight, and easy to edit
- **Modular architecture**: Scenes and systems are independent and reusable
- **Progressive enhancement**: Voice narration and advanced features degrade gracefully

### Game Flow
```
Loading Screen → Title Screen → Intro Scene → Main Game → Epilogue → Credits
```

---

## Core Engine

### CyberQuestEngine Class
**Location:** `engine/game.js` (1490 lines)

The main game engine manages all game state, scene transitions, and system coordination.

#### Core Responsibilities
- Scene management and transitions
- Game state persistence (save/load)
- Inventory system
- Quest system
- Dialogue system
- Flag management
- Time progression
- Notification system

#### Key Properties
```javascript
{
  currentScene: null,           // Current scene ID
  scenes: {},                   // Registered scene objects
  inventory: [],                // Player inventory items
  gameState: {
    storyPart: 0,              // Current story progression
    questsCompleted: [],       // Completed quest IDs
    activeQuests: [],          // Active quest objects
    flags: {},                 // Boolean flags for game state
    time: '08:00',             // In-game time
    day: 1                     // Current day
  },
  dialogueQueue: [],           // Queued dialogue sequences
  isDialogueActive: false,     // Dialogue system state
  isPuzzleActive: false,       // Puzzle system state
  voiceEnabled: true,          // Voice narration toggle
  player: PlayerCharacter,     // Player character instance
  evidenceViewer: EvidenceViewer,  // Evidence display system
  passwordPuzzle: PasswordPuzzle,  // Password puzzle system
  chatInterface: ChatInterface     // Chat UI system
}
```

#### Core Methods

**Scene Management**
- `registerScene(sceneObj)` - Register a scene for loading
- `loadScene(sceneId, transition)` - Load and display a scene
- `loadHotspots(hotspots)` - Create interactive hotspots
- `handleHotspotClick(hotspot)` - Process hotspot interactions

**Game State**
- `setFlag(flagId, value)` - Set a boolean flag
- `getFlag(flagId)` - Get a flag value
- `saveGameState()` - Persist state to localStorage
- `loadGameState()` - Restore state from localStorage

**Inventory & Quests**
- `addToInventory(item)` - Add item to player inventory
- `removeFromInventory(itemId)` - Remove item
- `hasItem(itemId)` - Check if player has item
- `addQuest(quest)` - Add quest to active quests
- `completeQuest(questId)` - Mark quest as completed
- `updateQuestUI()` - Refresh quest display

**Dialogue System**
- `startDialogue(dialogueArray)` - Begin dialogue sequence
- `advanceDialogue()` - Show next dialogue line
- `endDialogue()` - Close dialogue box
- `speak(text, speaker)` - Trigger voice narration (optional)

**Utility**
- `showNotification(message)` - Display temporary notification
- `playerThink(thought)` - Show player's internal monologue
- `wait(ms)` - Async delay utility
- `advanceTime(hours)` - Progress in-game time

---

## Scene System

### Scene Structure

Each scene is a JavaScript object with a standardized structure:

```javascript
const SceneName = {
  id: 'scene_id',                    // Unique identifier
  name: 'Scene Display Name',         // Human-readable name
  background: 'assets/path.svg',      // SVG background path
  description: 'Scene description',   // Text description
  playerStart: { x: 50, y: 85 },     // Player spawn position (%)
  
  idleThoughts: [                    // Random thoughts when idle
    "Thought 1...",
    "Thought 2..."
  ],
  
  hotspots: [                        // Interactive areas
    {
      id: 'hotspot_id',
      name: 'Hotspot Display Name',
      x: 10, y: 20,                  // Position (%)
      width: 15, height: 20,         // Size (%)
      cursor: 'pointer',             // CSS cursor type
      action: function(game) { },    // Click handler
      targetScene: 'other_scene'     // Optional: scene transition
    }
  ],
  
  state: {                           // Scene-specific state
    // Custom properties
  },
  
  onEnter: function(game) { },       // Called when scene loads
  onExit: function(game) { }         // Called when scene unloads
};
```

### Hotspot Types

**Door/Transition Hotspots**
- Navigate between scenes
- Can have dialogue/checks before transition
- Use `targetScene` property for automatic transitions

**Interaction Hotspots**
- Objects to examine or interact with
- Use `action` function for custom behavior
- Can trigger dialogue, add items, set flags

**Character Hotspots**
- NPCs with dialogue trees
- Use `action` to show character portraits and conversations

**Puzzle Hotspots**
- Trigger puzzle interfaces
- Use `action` to call puzzle systems (password, cipher, etc.)

### Scene Registration

Scenes register themselves on load:
```javascript
if (typeof game !== 'undefined') {
  game.registerScene(SceneName);
}
```

---

## Game Systems

### 1. Player Character System
**Location:** `engine/player.js`

Manages the player avatar that moves through scenes.

**Features:**
- Click-to-move navigation
- Idle animations
- Random idle thoughts
- Character visibility control

**Key Methods:**
- `moveTo(x, y)` - Move player to position
- `show()` / `hide()` - Toggle visibility
- `think()` - Display random thought bubble

---

### 2. Dialogue System
**Location:** `engine/game.js` (integrated)

Handles all text-based conversations and narration.

**Features:**
- Sequential dialogue arrays
- Speaker names and portraits
- Typewriter text effect
- Voice narration integration
- Click/tap to advance

**Usage:**
```javascript
game.startDialogue([
  { speaker: 'Ryan', text: 'What is this?' },
  { speaker: 'Ies', text: 'It looks like trouble.' },
  { speaker: '', text: '*sound effect*' }
]);
```

---

### 3. Inventory System
**Location:** `engine/game.js` (integrated)

Visual inventory bar at bottom of screen.

**Features:**
- Icon-based item display
- Item descriptions on hover
- Persistent across scenes
- Save/load support

**Item Structure:**
```javascript
{
  id: 'item_id',
  name: 'Item Name',
  icon: '🔧',  // Emoji or image path
  description: 'Item description'
}
```

---

### 4. Quest System
**Location:** `engine/game.js` (integrated)

Track player objectives and progression.

**Features:**
- Active quest list (sidebar toggle)
- Quest completion notifications
- Progress tracking
- Hint system

**Quest Structure:**
```javascript
{
  id: 'quest_id',
  name: 'Quest Name',
  description: 'What to do',
  hint: 'Optional hint text',
  progress: [],  // Array of completed steps
  onComplete: function(game) { }  // Callback
}
```

---

### 5. Evidence Viewer System
**Location:** `engine/evidence-viewer.js`

Full-screen document/evidence display.

**Features:**
- Email viewer (threaded conversations)
- Document reader (technical papers, memos)
- Image viewer (photos, schematics)
- Chat log viewer (text messages)
- Navigation controls (back, zoom)

**Usage:**
```javascript
game.showEvidence({
  type: 'email',
  from: 'sender@email.com',
  to: 'recipient@email.com',
  subject: 'Email Subject',
  body: 'Email content...',
  timestamp: 'Feb 10, 2026'
});
```

---

### 6. Password Puzzle System
**Location:** `engine/puzzles/password-puzzle.js`

Interactive password entry and code-breaking puzzles.

**Features:**
- Visual password entry UI
- Multiple password types (numeric, alphanumeric, cipher)
- Hint system
- Success/failure callbacks
- ROT1 decoder integration

**Usage:**
```javascript
game.passwordPuzzle.show({
  title: 'Enter Password',
  correctPassword: 'SECRET',
  hint: 'Optional hint',
  onSuccess: function(game) { },
  onCancel: function(game) { }
});
```

---

### 7. Chat Interface System
**Location:** `engine/chat-interface.js`

Signal/WhatsApp-style chat conversations.

**Features:**
- Threaded message history
- Contact list
- Typing indicators
- Timestamp display
- End-to-end encrypted aesthetic

**Usage:**
```javascript
game.chatInterface.show({
  contact: 'Chris Kubecka',
  messages: [
    { sender: 'Ryan', text: 'Need your help', time: '10:23' },
    { sender: 'Chris', text: 'What do you need?', time: '10:24' }
  ]
});
```

---

### 8. Voice Narration System
**Location:** `engine/voice.js`

Text-to-speech narration for dialogue.

**Features:**
- Web Speech API integration
- Character voice profiles
- Toggle on/off
- Queue management
- Fallback for unsupported browsers

**Configuration:**
```javascript
{
  Ryan: { rate: 0.9, pitch: 0.8, voice: 'male' },
  Ies: { rate: 1.0, pitch: 1.2, voice: 'female' }
}
```

---

## Asset Structure

```
CyberQuest/
├── assets/
│   ├── audio/                     # Sound effects and music
│   ├── fonts/                     # Custom fonts
│   └── images/
│       ├── characters/            # Character sprites/portraits
│       ├── evidence/              # Documents, photos for evidence viewer
│       ├── icons/                 # UI icons and inventory items
│       │   ├── flipper-zero.svg
│       │   ├── meshtastic.svg
│       │   └── ...
│       └── scenes/                # Scene backgrounds (SVG)
│           ├── home.svg
│           ├── mancave.svg
│           ├── facility.svg
│           ├── regional_map.svg
│           └── ...
├── docs/                          # Documentation
├── engine/                        # Core game systems
│   ├── game.js                    # Main engine
│   ├── player.js                  # Player character
│   ├── voice.js                   # Voice narration
│   ├── evidence-viewer.js         # Evidence system
│   ├── chat-interface.js          # Chat UI
│   ├── styles.css                 # Game styles
│   └── puzzles/
│       └── password-puzzle.js     # Password/cipher puzzles
├── scenes/                        # All game scenes
│   ├── intro/
│   │   └── scene.js
│   ├── home/
│   │   ├── scene.js
│   │   └── design.md              # Scene design notes
│   └── ...
└── index.html                     # Main entry point
```

---

## Scene Catalog

### Complete Scene List (18 Scenes)

| # | Scene ID | Name | Type | Story Phase |
|---|----------|------|------|-------------|
| 1 | **intro** | Opening Sequence | Cinematic | Prologue |
| 2 | **home** | Kitchen | Exploration | Act 1: Setup |
| 3 | **livingroom** | Living Room | Exploration | Act 1: Setup |
| 4 | **tvdocumentary** | TV Documentary | Cinematic | Act 1: Context |
| 5 | **mancave** | Mancave Workshop | Hub | Act 1-3: Investigation |
| 6 | **planboard** | Investigation Board | Interface | Act 2: Analysis |
| 7 | **regional_map** | Regional Map | Interface | Act 2: Geography |
| 8 | **videocall** | Video Conference | Interface | Act 2: Allies |
| 9 | **garden** | Backyard Garden | Exploration | Act 1-3: Transitions |
| 10 | **car_discovery** | Volvo Discovery | Exploration | Act 1: Setup |
| 11 | **driving** | Night Drive | Cinematic | Act 2-3: Transitions |
| 12 | **klooster** | Ter Apel Monastery | Exploration | Act 2: Dead Drop |
| 13 | **facility** | Facility Exterior | Stealth | Act 3: Infiltration |
| 14 | **facility_interior** | Facility Corridors | Stealth | Act 3: Infiltration |
| 15 | **facility_server** | Server Room | Climax | Act 3: Confrontation |
| 16 | **debrief** | Aftermath | Interface | Act 3: Resolution |
| 17 | **epilogue** | Three Months Later | Cinematic | Epilogue |
| 18 | **credits** | End Credits | Cinematic | Epilogue |

---

### Scene Details

#### 1. INTRO - Opening Sequence
**Background:** `assets/images/scenes/intro_scroll.svg`  
**Type:** Cinematic text scroll  
**Duration:** ~60 seconds (skippable)

**Purpose:** Set the tone and context with a noir-style text introduction.

**Key Features:**
- Slow-scrolling text
- Ambient cyber-noir styling
- Auto-transitions to home scene
- Skippable with click/tap

---

#### 2. HOME - Kitchen
**Background:** `assets/images/scenes/home.svg`  
**Type:** Interactive exploration  
**Hotspots:** 4 (espresso machine, door to living room, door to mancave, backdoor to garden)

**Purpose:** Player's home base. Introduction to controls and basic mechanics.

**Key Interactions:**
- Make espresso (required to access mancave)
- Navigate to other house areas
- Exit to garden

**Idle Thoughts:** 16 random comments about coffee, work, Dutch countryside

---

#### 3. LIVINGROOM - Living Room
**Background:** `assets/images/scenes/livingroom.svg`  
**Type:** Interactive exploration  
**Hotspots:** 4 (TV, Ies, ET the pug, door to kitchen)

**Purpose:** Meet Ies (wife) and learn about the documentary. Optional lore.

**Key Interactions:**
- Chat with Ies about daily life
- Watch documentary (transitions to tvdocumentary scene)
- Pet ET the pug (randomized responses)
- Return to kitchen

---

#### 4. TVDOCUMENTARY - Documentary Viewing
**Background:** `assets/images/scenes/tvdocumentary.svg`  
**Type:** Cinematic story scene  
**Hotspots:** 1 (skip button)

**Purpose:** Provide backstory on Drenthe's wireless technology pioneers.

**Key Content:**
- Chapter 1: Dr. David Prinsloo (antenna technology, TU Eindhoven)
- Chapter 2: Cees Bassa (LOFAR, satellite tracking, ASTRON)
- Chapter 3: Jaap Haartsen (Bluetooth invention, Ericsson)

**Technical Note:** Full documentary text with typewriter effect. Establishes future allies.

---

#### 5. MANCAVE - Workshop
**Background:** `assets/images/scenes/mancave.svg`  
**Type:** Investigation hub  
**Hotspots:** 10+ (laptop, SSTV terminal, equipment, door)

**Purpose:** Central hub for investigation. Access to evidence, communications, tools.

**Key Features:**
- SSTV terminal (receives transmissions)
- Laptop (email, research, decryption)
- HackRF, Flipper Zero, Meshtastic (hacking tools)
- Door to home/garden
- **Planboard button** (opens investigation board)
- **Regional Map button** (opens area map)
- **Videocall button** (opens contact list)

**State Tracking:**
- SSTV transmission received
- USB stick analyzed
- Evidence collected
- Equipment status

---

#### 6. PLANBOARD - Investigation Board
**Background:** `assets/images/scenes/planboard.svg`  
**Type:** Interactive interface  
**Hotspots:** 10 (dossier buttons, back button)

**Purpose:** Visual organization of clues, suspects, locations, evidence.

**Dossiers:**
1. **Volkov** - Main antagonist profile
2. **Eva Weber** - Whistleblower identity
3. **Facility** - Steckerdoser Heide details
4. **Weapon** - Project Echo specifications
5. **README** - Decoded USB instructions
6. **Experts** - Allied contacts (David, Cees, Jaap)
7. **Timeline** - Event chronology
8. **Network** - Russian operation structure

**Unlock Conditions:** Dossiers unlock as player progresses through story flags.

---

#### 7. REGIONAL_MAP - Area Map
**Background:** `assets/images/scenes/regional_map.svg`  
**Type:** Interactive map interface  
**Hotspots:** 8 (6 locations + back + toggle distances)

**Purpose:** Show geographic layout of investigation area.

**Style:** Michelin paper route map aesthetic

**Locations:**
1. **Compascuum** (52.81°N, 6.97°E) - Home base, green marker
2. **Ter Apel** (52.9°N, 7.1°E) - Monastery, blue marker, USB drop
3. **LOFAR** (52.91°N, 6.50°E) - Research station, orange marker, ~60km W
4. **WSRT** (52.9°N, 6.6°E) - Westerbork telescope, orange marker, ~50km W
5. **Facility** (53.3°N, 7.4°E) - Target location, red marker with warning, Germany
6. **Meppen** (52.69°N, 7.29°E) - Border town, gray marker, Germany

**Features:**
- Toggle distance markers (km between locations)
- Country border visualization (NL/DE)
- A37 highway route
- Landscape features (forests, farmland)
- Location info popups on click

---

#### 8. VIDEOCALL - Secure Video Conference
**Background:** `assets/images/scenes/videocall.svg`  
**Type:** Interactive interface  
**Hotspots:** 4 (3 contact buttons + back)

**Purpose:** Communicate with expert allies for help and information.

**Contacts:**
1. **Dr. David Prinsloo** - Antenna expert (TU Eindhoven)
2. **Cees Bassa** - LOFAR specialist (ASTRON)
3. **Jaap Haartsen** - Bluetooth inventor

**Features:**
- Branching dialogue based on game progress
- Different conversations depending on evidence collected
- Sets flags for quest progression
- Encrypted connection aesthetic

**State Tracking:** Each contact remembers previous conversations.

---

#### 9. GARDEN - Backyard
**Background:** `assets/images/scenes/garden.svg`  
**Type:** Exploration/transition  
**Hotspots:** 3-4 (windturbines, Volvo car, door to house)

**Purpose:** Observation point for distant facility. Access to car for travel.

**Key Features:**
- View windturbines on German border
- Car enables travel to Klooster and Facility
- Different dialogues based on story progression
- Returns to mancave or transitions to driving scene

**Story Phases:**
- Early: Curiosity about interference
- Mid: Planning trip to Klooster for USB drop
- Late: Preparing for facility infiltration

---

#### 10. CAR_DISCOVERY - Volvo Discovery
**Background:** `assets/images/scenes/car_discovery.svg`  
**Type:** Story moment  
**Hotspots:** 2 (car, back to garden)

**Purpose:** Establish that Ryan has transportation. Volvo 240 estate introduction.

**Note:** This scene may be merged with garden scene in current implementation.

---

#### 11. DRIVING - Night Drive
**Background:** `assets/images/scenes/driving.svg`  
**Type:** Cinematic transition  
**Hotspots:** None

**Purpose:** Atmospheric transition between locations with internal monologue.

**Destinations:**
- **To Klooster:** Nervous anticipation, meeting unknown contact
- **To Facility:** High tension, infiltration preparation
- **Return Home:** Processing events, exhaustion

**Technical:** Auto-transitions after dialogue sequence. Destination set by `driving_destination` flag.

---

#### 12. KLOOSTER - Ter Apel Monastery
**Background:** `assets/images/scenes/klooster.svg`  
**Type:** Exploration/story  
**Hotspots:** 4 (monastery entrance, bench with USB, car, look around)

**Purpose:** Dead drop location. Retrieve USB stick from Eva Weber.

**Key Sequence:**
1. Arrive at night
2. Explore monastery grounds
3. Find USB stick on bench
4. Add to inventory
5. Quest: "Analyze USB contents" given
6. Return to car → drives home automatically

**Mood:** Tense, mysterious. First physical evidence obtained.

---

#### 13. FACILITY - Steckerdoser Heide Exterior
**Background:** `assets/images/scenes/facility.svg`  
**Type:** Stealth/puzzle  
**Hotspots:** 6 (camera, gate, fence section, guard patrol, Eva contact)

**Purpose:** Infiltration planning. Disable security and enter compound.

**Tasks:**
1. Disable security camera (Flipper Zero required)
2. Communicate with Eva via Meshtastic
3. Unlock gate (password from Eva)
4. Avoid guards
5. Proceed to facility interior

**Fail States:** 
- Alarm triggered → restart sequence
- Detected by guards → restart sequence

---

#### 14. FACILITY_INTERIOR - Corridors
**Background:** `assets/images/scenes/facility_interior.svg`  
**Type:** Stealth/exploration  
**Hotspots:** 5 (corridors, doors, basement access, security terminal)

**Purpose:** Navigate inside facility to reach server room basement.

**Tasks:**
1. Find basement access door
2. Bypass security terminal (Eva provides code)
3. Descend to server room
4. Avoid detection

**Mood:** High tension. Sterile corridors, fluorescent lights, constant danger.

---

#### 15. FACILITY_SERVER - Server Room Confrontation
**Background:** `assets/images/scenes/facility_server.svg`  
**Type:** Climax/puzzle  
**Hotspots:** 4 (server terminal, control panel, evidence download, exit)

**Purpose:** Final confrontation. Access Volkov's account, download evidence, sabotage weapon test.

**Key Sequence:**
1. Password puzzle (Dr. Volkov's credentials)
2. Download incriminating files
3. Sabotage transformer test (prevent Groningen casualties)
4. Eva calls for extraction
5. Transition to debrief

**Climax:** Player must act quickly. Timer implied. Evidence obtained is crucial for epilogue.

---

#### 16. DEBRIEF - Aftermath Interface
**Background:** `assets/images/scenes/debrief.svg`  
**Type:** Interface/story  
**Hotspots:** Variable (review evidence, reflect on choices)

**Purpose:** Immediate aftermath of infiltration. Review what was accomplished.

**Content:**
- Evidence successfully extracted
- Test sabotaged, lives saved
- Eva's status
- Next steps (contact authorities)
- Transition to epilogue

---

#### 17. EPILOGUE - Three Months Later
**Background:** `assets/images/scenes/epilogue.svg`  
**Type:** Cinematic  
**Hotspots:** None (auto-progression)

**Purpose:** Show long-term consequences of player's actions.

**Outcomes:**
- Facility shut down
- Volkov and Hoffmann arrested
- Operation ZERFALL exposed
- Eva Weber safe
- Ryan offered job with AIVD
- Allies updated (Cees, Pieter, Chris)

**Mood:** Hopeful resolution. Justice served. New beginning for Ryan.

**Duration:** ~90 seconds, then transitions to credits.

---

#### 18. CREDITS - End Credits
**Background:** `assets/images/scenes/credits.svg`  
**Type:** Cinematic  
**Hotspots:** 1 (replay button)

**Purpose:** Acknowledge contributors, tech used, story inspiration.

**Content:**
- Game created by [creator info]
- Special thanks
- Technology credits (Web Speech API, etc.)
- Story consultants
- Beta testers
- "Play Again" button → returns to title screen

---

## Technical Stack

### Core Technologies
- **HTML5** - Structure and DOM manipulation
- **CSS3** - Styling, animations, responsive layout
- **Vanilla JavaScript (ES6+)** - All game logic
- **SVG** - Scalable vector graphics for all scenes

### Browser APIs Used
- **Web Speech API** - Text-to-speech narration (optional feature)
- **localStorage** - Save/load game state
- **Pointer Events** - Touch and mouse input handling
- **History API** - Scene-based URL routing

### No External Dependencies
- No frameworks (React, Vue, etc.)
- No libraries (jQuery, etc.)
- No bundlers (Webpack, Rollup, etc.)
- No transpilation required
- **Result:** Fast loading, easy debugging, maximum compatibility

### Browser Support
- **Minimum:** Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile:** iOS Safari 13+, Chrome Mobile 80+
- **Recommended:** Modern browsers from 2020+

### Performance Characteristics
- **Load time:** < 2 seconds on modern connections
- **Memory usage:** ~50-80 MB typical
- **Asset size:** 
  - Total: ~15 MB
  - HTML/CSS/JS: ~500 KB
  - SVG scenes: ~10 MB
  - Images/icons: ~3 MB
  - Audio: ~2 MB (if implemented)

---

## Development Workflow

### Adding a New Scene

1. **Create scene directory:**
   ```
   scenes/new_scene/
   ├── scene.js
   └── design.md (optional)
   ```

2. **Create SVG background:**
   ```
   assets/images/scenes/new_scene.svg
   ```

3. **Implement scene.js:**
   ```javascript
   const NewScene = {
     id: 'new_scene',
     name: 'New Scene Name',
     background: 'assets/images/scenes/new_scene.svg',
     playerStart: { x: 50, y: 85 },
     hotspots: [],
     onEnter: function(game) { },
     onExit: function(game) { }
   };
   
   if (typeof game !== 'undefined') {
     game.registerScene(NewScene);
   }
   ```

4. **Register in index.html:**
   ```html
   <script src="scenes/new_scene/scene.js"></script>
   ```

5. **Add transitions:**
   Update hotspots in connected scenes to link to new scene.

---

### Debugging Tools

**Console Logging:**
Every major system logs its actions. Enable verbose logging:
```javascript
game.debugMode = true;
```

**Save State Inspector:**
View current game state:
```javascript
console.log(JSON.stringify(game.gameState, null, 2));
```

**Scene Testing:**
Jump to specific scene:
```javascript
game.loadScene('scene_id');
```

**Flag Manipulation:**
```javascript
game.setFlag('flag_name', true);
game.getFlag('flag_name');
```

---

## Future Enhancements

### Planned Features
- [ ] Achievement system
- [ ] Multiple save slots
- [ ] Difficulty settings
- [ ] Accessibility options (high contrast, larger text)
- [ ] Mobile-specific UI improvements
- [ ] Additional language support (Dutch, German)
- [ ] Expanded epilogue with player choices affecting outcome

### Under Consideration
- [ ] Multiplayer/co-op investigation mode
- [ ] User-generated content (custom scenes)
- [ ] Integration with real OSINT tools
- [ ] VR support for immersive scenes

---

## Conclusion

CyberQuest demonstrates that complex narrative games can be built with simple, accessible web technologies. The modular architecture allows for easy expansion, modification, and maintenance. The lack of external dependencies ensures longevity - this game will run in browsers for years to come without toolkit rot or broken dependencies.

For questions or contributions, see the main README.md file.

---

**End of Architecture Documentation**
