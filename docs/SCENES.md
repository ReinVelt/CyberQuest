# CyberQuest: Complete Scene Catalog
**Last Updated:** February 15, 2026  
**Version:** 1.0

---

## Scene Overview

**Total Scenes:** 18  
**Scene Types:** Exploration (7), Interface (4), Cinematic (4), Stealth (3)  
**Estimated Playtime:** 2-4 hours

### Scene Flow Diagram

```
┌─────────┐
│  INTRO  │ (Cinematic - 60s)
└────┬────┘
     │
┌────▼─────┐
│   HOME   │◄────┐
│ Kitchen  │     │
└──┬──┬──┬─┘     │
   │  │  │       │
   │  │  └───────┼──────────┐
   │  │          │          │
┌──▼──▼────┐ ┌──▼─────┐ ┌──▼────┐
│LIVINGROOM│ │MANCAVE │ │GARDEN │
│          │ │  (HUB) │ │       │
└─────┬────┘ └───┬────┘ └───┬───┘
      │          │           │
┌─────▼──────┐   │      ┌────▼────┐
│TV DOCU     │   │      │ VOLVO   │
│(optional)  │   │      │         │
└────────────┘   │      └────┬────┘
                 │           │
            ┌────▼───┬───────▼───┬────────┐
            │        │           │        │
      ┌─────▼─────┐  │     ┌─────▼─────┐  │
      │PLANBOARD  │  │     │VIDEO CALL │  │
      │(interface)│  │     │(interface)│  │
      └───────────┘  │     └───────────┘  │
                     │                    │
             ┌───────▼─────────┐          │
             │  REGIONAL_MAP   │          │
             │   (interface)   │          │
             └─────────────────┘          │
                                          │
                                  ┌───────▼───────┐
                                  │    DRIVING    │
                                  │  (cinematic)  │
                                  └───┬───────┬───┘
                                      │       │
                              ┌───────▼─┐   ┌─▼─────────┐
                              │KLOOSTER │   │ FACILITY  │
                              │(USB)    │   │(stealth)  │
                              └───┬─────┘   └─────┬─────┘
                                  │               │
                            ┌─────▼───────┐   ┌───▼────────────┐
                            │   DRIVING   │   │   FACILITY     │
                            │   (return)  │   │   INTERIOR     │
                            └─────┬───────┘   │   (stealth)    │
                                  │           └────────┬───────┘
                                  │                    │
                                  │           ┌────────▼────────┐
                                  │           │    FACILITY     │
                                  │           │     SERVER      │
                                  │           │    (climax)     │
                                  │           └────────┬────────┘
                                  │                    │
                                  │           ┌────────▼────────┐
                                  │           │     DEBRIEF     │
                                  │           │   (interface)   │
                                  │           └────────┬────────┘
                                  │                    │
                                  └────────────────────┤
                                                       │
                                              ┌────────▼────────┐
                                              │    EPILOGUE     │
                                              │   (cinematic)   │
                                              └────────┬────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │    CREDITS      │
                                              │   (cinematic)   │
                                              └─────────────────┘
```

---

## Scene 01: INTRO - Opening Sequence

**ID:** `intro`  
**File:** `scenes/intro/scene.js`  
**Background:** Text scroll with animated SVG  
**Type:** Cinematic  
**Player Visible:** No

### Description
A noir-style text introduction that sets the tone and provides context for the story. The text scrolls slowly upward like Star Wars opening crawl, with cyber-aesthetic styling.

### Content
- Investigation setup
- Character introduction (Ryan Weylant)
- Location (Compascuum, Netherlands)
- Tone setting (techno-thriller, hacking, espionage)

### Technical Details
- **Duration:** 60 seconds (skippable)
- **Skip:** Click/tap anywhere to skip
- **Auto-transition:** Fades to home scene after completion
- **Voice:** Optional narration
- **CSS:** Custom animation for scroll effect

### Hotspots
- **Skip Button** (anywhere) - Skip to home scene

### Progression
- Sets `intro_complete` flag
- Transitions to `home` scene automatically

---

## Scene 02: HOME - Kitchen

**ID:** `home`  
**File:** `scenes/home/scene.js`  
**Background:** `assets/images/scenes/home.svg`  
**Type:** Exploration  
**Player Visible:** Yes

### Description
Ryan's farmhouse kitchen in Compascuum. White walls, wooden furniture, espresso machine, view of canal through window. Cozy Dutch home atmosphere.

### Story Purpose
- Tutorial scene (introduce controls)
- Character establishment (Ryan's personality)
- Morning routine (make espresso)
- Gateway to other house areas

### Hotspots

#### 1. Espresso Machine
- **Position:** (20, 40) 15x25
- **Cursor:** use
- **Action:** Make espresso (required for mancave access)
- **Dialogue:** "Time for my morning ritual..."
- **Result:** Sets `espresso_made` flag, adds "☕ Espresso" to inventory

#### 2. Door to Livingroom
- **Position:** (5, 45) 8x30
- **Cursor:** pointer
- **Action:** Navigate to livingroom scene
- **Target:** `livingroom`

#### 3. Door to Mancave
- **Position:** (85, 40) 10x35
- **Cursor:** pointer
- **Action:** Navigate to mancave (requires espresso)
- **Check:** If no espresso, dialogue: "I need coffee first."
- **Target:** `mancave`

#### 4. Backdoor to Garden
- **Position:** (70, 55) 12x30
- **Cursor:** pointer
- **Action:** Navigate to garden scene
- **Target:** `garden`

### Idle Thoughts (16)
- "Coffee. Now."
- "Nice and quiet... for once."
- "This place is a mess."
- "Another day, another hack."
- "Check my email... or not."
- "Canal view never gets old."
- "Need to call Ies later."
- "That chair looks comfortable."
- "Dutch countryside, best countryside."
- "Morning light hits just right here."
- "Should probably eat something."
- "This kitchen's seen better days."
- "Radio on or off? Decisions."
- "Peace and quiet. Rare commodity."
- "Home sweet surveillance-free home."
- "Neighbors probably think I'm weird."

### State Management
- **onEnter:** Check if espresso made, display appropriate thought
- **onExit:** Remove NPC characters if present

---

## Scene 03: LIVINGROOM - Living Room

**ID:** `livingroom`  
**File:** `scenes/livingroom/scene.js`  
**Background:** `assets/images/scenes/livingroom.svg`  
**Type:** Exploration  
**Player Visible:** Yes

### Description
Cozy living room with couch, TV, family photos on walls. Ies (wife) here watching TV. ET the pug lounging nearby.

### Story Purpose
- Character interaction (talk to Ies)
- Optional lore (watch documentary)
- Pet the dog (because why not)
- World-building (normal life before chaos)

### Characters
- **Ies** - Ryan's wife, pragmatic, supportive
- **ET** - Pug, adorable, snack-motivated

### Hotspots

#### 1. TV
- **Position:** (40, 30) 25x20
- **Cursor:** look
- **Action:** Watch documentary (launches tvdocumentary scene)
- **Dialogue:** "Maybe I should watch that documentary Ies mentioned."
- **Target:** `tvdocumentary`
- **Sets:** `watched_documentary` flag

#### 2. Ies (Wife)
- **Position:** (20, 50) 15x25
- **Cursor:** talk
- **Action:** Conversation with Ies
- **Dialogue:** Multiple conversation options
  - General chat about day
  - Ask about documentary
  - Family topics
- **State:** Tracks conversation count

#### 3. ET the Pug
- **Position:** (70, 70) 10x15
- **Cursor:** use (pet)
- **Action:** Pet the dog
- **Responses:** 4 randomized pet interactions
  - Tail wag + happy grunt
  - Rolls over for belly rubs
  - Sniffs around for snacks
  - Disappointed look (no treats)
- **State:** Cycles through responses

#### 4. Door to Kitchen
- **Position:** (0.5, 45) 11x32
- **Cursor:** pointer
- **Action:** Return to kitchen
- **Target:** `home`

### Idle Thoughts
- "Ies knows something's up."
- "ET needs a walk later."
- "TV remote is... somewhere."
- "This couch is too comfortable."

### State Management
- **onEnter:** Spawn Ies and ET characters if not present
- **onExit:** Keep characters (they live here)

---

## Scene 04: TVDOCUMENTARY - Documentary Viewing

**ID:** `tvdocumentary`  
**File:** `scenes/tvdocumentary/scene.js`  
**Background:** `assets/images/scenes/tvdocumentary.svg`  
**Type:** Cinematic / Lore  
**Player Visible:** No

### Description
Full-screen TV viewing experience. Documentary about Drenthe's wireless technology pioneers. Educational and establishes future allies.

### Story Purpose
- Introduce future allies (David, Cees, Jaap)
- Explain their expertise (radio, LOFAR, Bluetooth)
- Establish credibility (why Ryan trusts them)
- Optional (skip doesn't affect progression)

### Content Structure

#### Chapter 1: Antenna Technology (Dr. David Prinsloo)
- **Institution:** TU Eindhoven
- **Expertise:** Modern antenna design, radio astronomy
- **Contribution:** Revolutionary antenna arrays for radio telescopes
- **Duration:** ~45 seconds

#### Chapter 2: LOFAR (Cees Bassa)
- **Institution:** ASTRON
- **Expertise:** LOFAR digital telescope, satellite tracking
- **Contribution:** Low-frequency radio astronomy, signal processing
- **Duration:** ~50 seconds

#### Chapter 3: Bluetooth (Jaap Haartsen) 
- **Institution:** Ericsson (1990s)
- **Expertise:** Wireless protocols, frequency hopping
- **Contribution:** Invented Bluetooth protocol
- **Duration:** ~40 seconds

### Technical Details
- **Total Duration:** ~2.5 minutes (skippable)
- **Narration:** Documentary narrator voice
- **Visuals:** Static documentary frame with overlays
- **Text:** Typewriter effect for subtitles

### Hotspots

#### Skip Documentary
- **Position:** (2, 2) 15x8
- **Label:** "⏭ Skip Documentary"
- **Action:** Return to livingroom
- **Target:** `livingroom`

### Progression
- Sets `watched_documentary` flag
- Returns to `livingroom` when complete

---

## Scene 05: MANCAVE - Workshop (HUB)

**ID:** `mancave`  
**File:** `scenes/mancave/scene.js`  
**Background:** `assets/images/scenes/mancave.svg`  
**Type:** Investigation Hub  
**Player Visible:** Yes

### Description
Ryan's workshop/garage. High-tech hacker paradise. Equipment everywhere: 3D printer, laser cutter, oscilloscope, server rack, laptop, SSTV terminal, HackRF, Flipper Zero, Meshtastic devices, LED displays, soldering station.

### Story Purpose
- **Central hub** for investigation
- Access investigation tools (planboard, map, videocall)
- Receive transmissions (SSTV)
- Analyze evidence (laptop)
- Manage equipment (hacking tools)

### Major Hotspots

#### 1. Laptop
- **Position:** (45, 55) 15x12
- **Cursor:** use
- **Action:** Multiple interaction states
  - **Initial:** Check email, browse
  - **After SSTV:** Decrypt ROT1 message (puzzle)
  - **After USB:** Analyze USB contents (evidence viewer)
  - **Late game:** Review all collected evidence
- **Sets flags:** 
  - `sstv_decoded` (after ROT1 puzzle)
  - `usb_analyzed` (after USB analysis)

#### 2. SSTV Terminal
- **Position:** (25, 40) 18x20
- **Cursor:** look
- **Action:** Story-triggered transmission reception
  - **Part 1:** Morse code pattern (visual)
  - **Part 2:** Photo of Ryan's house (threat)
  - **Part 3:** Additional coordinates
- **Animation:** Shows static → pattern → image
- **Sets flag:** `sstv_received`

#### 3. HackRF One
- **Position:** (60, 48) 12x10
- **Cursor:** use
- **Action:** Radio frequency analysis
  - Tune to military frequency
  - Record signal bursts
  - Analyze spectrum
- **Required for:** Decoding encrypted transmissions

#### 4. Flipper Zero
- **Position:** (70, 52) 10x8
- **Cursor:** use
- **Action:** RF hacking tool
  - Sub-GHz analysis
  - NFC/RFID
  - IR remote
- **Required for:** Facility camera disable
- **Adds to inventory:** When picked up before facility mission

#### 5. Meshtastic Device
- **Position:** (35, 60) 10x8
- **Cursor:** use
- **Action:** Secure mesh network communication
- **Usage:** Contact Eva during facility infiltration
- **Adds to inventory:** When picked up before facility mission

#### 6. Planboard Button
- **Position:** (10, 10) 18x8
- **Label:** "📋 Investigation Board"
- **Cursor:** pointer
- **Action:** Open planboard scene
- **Target:** `planboard`
- **Unlock:** Available after SSTV decoded

#### 7. Regional Map Button
- **Position:** (10, 20) 18x8
- **Label:** "🗺 Regional Map"
- **Cursor:** pointer
- **Action:** Open regional map
- **Target:** `regional_map`
- **Unlock:** Available after USB found

#### 8. Videocall Button
- **Position:** (10, 30) 18x8
- **Label:** "📹 Secure Calls"
- **Cursor:** pointer
- **Action:** Open videocall interface
- **Target:** `videocall`
- **Unlock:** Available after needing expert help

#### 9. Door to Home/Garden
- **Position:** (85, 50) 12x35
- **Cursor:** pointer
- **Action:** Return to home or garden
- **Target:** `home` or `garden` (contextual)

### Equipment Inventory
- 3D Printer (background element)
- Laser Cutter (background element)
- Oscilloscope (usable for signal analysis)
- Server Rack (terminal access)
- LED Displays (status indicators)
- Soldering Station (tool for repairs)
- Various cables and components

### Idle Thoughts
- "Need more coffee."
- "Where did I put that adapter?"
- "Should organize this mess... someday."
- "The code compiles, therefore I am."
- "Another day in the cave."

### State Management
- **onEnter:** Check story progress, update available interactions
- **onExit:** Save current equipment state

---

## Scene 06: PLANBOARD - Investigation Board

**ID:** `planboard`  
**File:** `scenes/planboard/scene.js`  
**Background:** `assets/images/scenes/planboard.svg`  
**Type:** Interface  
**Player Visible:** No

### Description
Detective-style cork board with photos, documents, red string connecting evidence. Visual organization of the investigation.

### Story Purpose
- Organize collected clues
- Review suspect profiles
- Track timeline of events
- Visualize connections between people/places/evidence

### Dossier System

#### 1. Volkov Dossier
- **Position:** (10, 22) 13x25
- **Unlock:** After USB analyzed
- **Content:**
  - Full name: Dr. Dimitri Volkov
  - Age: 52
  - Background: Former Soviet RF researcher
  - History: SPEKTR program (1980s)
  - Current: Lead consultant at Steckerdoser Heide
  - Suspicious: Incomplete background check
  - Connection: Operation ZERFALL

#### 2. Eva Weber Dossier
- **Position:** (25, 22) 14x31
- **Unlock:** After first Meshtastic contact
- **Content:**
  - Name: Eva Weber
  - Role: IT Analyst at facility
  - Status: Whistleblower (codename: "E")
  - Risk: Father has Parkinson's, threatened
  - Motivation: Prevent mass casualties
  - Skills: System access, encryption

#### 3. Facility Dossier
- **Position:** (56, 22) 13x25
- **Unlock:** After SSTV decoded or USB analyzed
- **Content:**
  - Name: Steckerdoser Heide R&D Facility
  - Location: Germany, near Meppen
  - Distance: 30km from Compascuum
  - Classification: Military research
  - Project: Echo (RF weapon development)
  - Security: High (cameras, guards, fencing)

#### 4. Weapon Dossier
- **Position:** (72, 22) 17x31
- **Unlock:** After viewing schematics
- **Content:**
  - Name: Project Echo
  - Type: RF disruption weapon
  - Range: 50km radius
  - Capabilities: 
    * Disable pacemakers
    * Crash vehicles
    * Disrupt communications
    * Target: Groningen transformer station
  - Status: Final test scheduled

#### 5. README Dossier
- **Position:** (8, 59) 21x26
- **Unlock:** After USB analyzed
- **Content:**
  - USB README file contents
  - Instructions from Eva
  - Dead drop location (Klooster)
  - Communication protocol (Meshtastic)
  - Infiltration guidance

#### 6. Experts Dossier
- **Position:** (33, 59) 16x26
- **Unlock:** After visiting videocall
- **Content:**
  - Dr. David Prinsloo (antenna expert)
  - Cees Bassa (LOFAR specialist)
  - Jaap Haartsen (Bluetooth inventor)
  - Chris Kubecka (OSINT expert)
  - Pieter (underground network)
  - Expertise areas for each contact

#### 7. Timeline Dossier
- **Position:** (52, 59) 19x26
- **Unlock:** After USB analyzed
- **Content:**
  - Chronological event list
  - Feb 10: SSTV transmission
  - Feb 11: USB drop
  - Feb 12: Evidence analysis
  - Feb 13: Facility infiltration
  - Feb 14: Final test (prevented)
  - Feb 15: Exposure

#### 8. Network Dossier (Future)
- **Position:** (75, 59) 15x26
- **Unlock:** After debrief
- **Content:**
  - Operation ZERFALL structure
  - Russian FSB connections
  - Reichsbürger links
  - German officials (compromised)
  - Financial trails

### Hotspots

#### Back Button
- **Position:** (2, 2) 8x6
- **Label:** "← Back"
- **Action:** Return to mancave
- **Target:** `mancave`

### Visual Design
- Cork board texture
- Polaroid-style photos
- Red string connections
- Sticky notes with handwriting
- Newspaper clippings
- Classified stamps

### Interaction
- Click dossier → Opens evidence viewer
- Shows photo + text document
- Evidence viewer has close button

---

## Scene 07: REGIONAL_MAP - Area Map

**ID:** `regional_map`  
**File:** `scenes/regional_map/scene.js`  
**Background:** `assets/images/scenes/regional_map.svg`  
**Type:** Interface  
**Player Visible:** No

### Description
Michelin-style paper road map showing Northern Netherlands and Germany border region. Accurate GPS coordinates. Shows investigation area geography.

### Map Style
- **Aesthetic:** Michelin paper route map
- **Colors:** Cream background, red roads, green/blue markers
- **Features:** Roads, forests, farmland, compass rose, scale bar
- **Border:** Netherlands (west) | Germany (east)

### Locations (6)

#### 1. Compascuum (Home)
- **Coordinates:** 52.81°N, 6.97°E (Emmer-Compascuum)
- **Map Position:** (830, 630)
- **Marker:** Green circle (home base)
- **Label:** "Home - Emmer-Compascuum"
- **Description:** Ryan's farmhouse. Investigation headquarters.
- **Province:** Drenthe, Netherlands

#### 2. Ter Apel (Meeting Point)
- **Coordinates:** 52.9°N, 7.1°E
- **Map Position:** (960, 540) - CENTER
- **Marker:** Blue circle (meeting/dead drop)
- **Label:** "Ter Apel - Monastery"
- **Description:** Medieval monastery. USB dead drop location.
- **Distance from home:** ~15km northeast

#### 3. LOFAR (Research Station)
- **Coordinates:** 52.91°N, 6.50°E
- **Map Position:** (360, 530)
- **Marker:** Orange circle (research facility)
- **Label:** "LOFAR Station - Exloo"
- **Description:** Low-frequency radio telescope array. Cees Bassa's workplace.
- **Distance:** ~60km west of center

#### 4. WSRT (Research Station)
- **Coordinates:** 52.9°N, 6.6°E
- **Map Position:** (460, 540)
- **Marker:** Orange circle (research facility)
- **Label:** "Westerbork Telescope"
- **Description:** Historic radio telescope. 14 dish array.
- **Distance:** ~50km west of center

#### 5. Facility (Target)
- **Coordinates:** 53.3°N, 7.4°E
- **Map Position:** (1260, 140)
- **Marker:** Red circle with warning triangle (danger)
- **Label:** "Steckerdoser Heide - Military R&D"
- **Description:** German military research facility. Project Echo location.
- **Distance:** ~44km northeast (Germany)
- **Security:** High

#### 6. Meppen (Reference)
- **Coordinates:** 52.69°N, 7.29°E
- **Map Position:** (1150, 750)
- **Marker:** Gray circle (reference point)
- **Label:** "Meppen - Border Town"
- **Description:** German border town. Staging area.
- **Distance:** ~30km southeast

### Map Features

#### A37 Highway
- **Route:** West to east across map
- **Path:** x100 → x1150 at y≈750
- **Width:** 6px red line
- **Markers:** 3 white boxes with "A37" text
- **Purpose:** Major route to Germany

#### Netherlands/Germany Border
- **Position:** Vertical line at x=1055
- **Style:** Red dashed line
- **Labels:** "NEDERLAND" (west), "DEUTSCHLAND" (east)

#### Landscape Features
- **Forests:** 5 green ellipses with dotted pattern
- **Farmland:** 5 rectangles with horizontal line pattern
- **Trees:** 8 scattered green circles
- **Opacity:** 0.6 (subtle background)

#### Distance Indicators
- **Toggle:** "Show Distances" button
- **Display:** Route number boxes (Michelin style)
- **Distances:** 15km, 30km, 44km, 50km, 60km between locations
- **Colors:** Colored borders matching location markers

### Controls

#### Back Button
- **Position:** (2.6, 2.8) 5.2x3.7
- **Label:** "← Back"
- **Action:** Return to mancave

#### Toggle Distances Button
- **Position:** (8.9, 2.8) 7.3x3.7
- **Label:** "Show Distances" / "Hide Distances"
- **Action:** Toggle distance indicator visibility (opacity 0/1)

### Location Hotspots
Each location clickable → shows info popup:
- Location name
- GPS coordinates
- Description
- Distance from home
- Story relevance

### Visual Elements
- **Scale Bar:** 0-50-100km ruler at (100, 960)
- **Compass Rose:** Simple N arrow at (1750, 950)
- **Legend:** 5 marker types explained at (1650, 120)
- **Title:** "Northern Netherlands - Germany / Regional Route Map" centered top

---

## Scene 08: VIDEOCALL - Secure Video Conference

**ID:** `videocall`  
**File:** `scenes/videocall/scene.js`  
**Background:** `assets/images/scenes/videocall.svg`  
**Type:** Interface  
**Player Visible:** No

### Description
Video conference screen with three contact slots. Ryan's secure communication terminal for reaching expert allies.

### Story Purpose
- Get technical advice from experts
- Share evidence and get analysis
- Build support network
- Branching dialogue based on progress

### Contact System

#### 1. Dr. David Prinsloo
- **Institution:** TU Eindhoven
- **Expertise:** Antenna technology, RF engineering
- **Personality:** Academic, methodical, cautious
- **Hotspot:** (6.25, 18.5) 25x33.3

**Conversation States:**
- **Initial:** General introductions, explain situation
- **After SSTV:** Ask about signal propagation, frequency analysis
- **After facility visit:** Debrief, discuss findings
- **Post-infiltration:** Congratulations, offer continued support

**Key Dialogue:**
- Explains how RF weapons work
- Provides technical validation of Project Echo
- Suggests protective measures
- Warns about dangers of powerful RF

#### 2. Cees Bassa
- **Institution:** ASTRON (LOFAR)
- **Expertise:** Radio astronomy, signal processing, satellite tracking
- **Personality:** Pragmatic,直接, experienced
- **Hotspot:** (37.5, 18.5) 25x33.3

**Conversation States:**
- **Initial:** Reminisce about previous collaborations
- **After SSTV:** Help decode signal patterns
- **After USB:** Analyze transmission protocols
- **Post-infiltration:** Monitor emergency frequencies

**Key Dialogue:**
- Explains LOFAR capabilities for signal detection
- Offers to monitor frequencies for Russian activity
- Provides SIGINT analysis
- Comments on signal propagation algorithms

#### 3. Jaap Haartsen
- **Background:** Bluetooth inventor (Ericsson)
- **Expertise:** Wireless protocols, frequency hopping, encryption
- **Personality:** Inventor mindset, creative problem-solving
- **Hotspot:** (68.75, 18.5) 25x33.3

**Conversation States:**
- **Initial:** Discuss wireless security
- **After USB:** Analyze encryption protocols
- **Meshtastic planning:** Explain secure mesh communication
- **Post-infiltration:** Celebrate successful operation

**Key Dialogue:**
- Explains frequency-hopping techniques
- Advises on secure communication methods
- Discusses Bluetooth vs. older RF tech
- Provides encryption best practices

### Back Button
- **Position:** (2, 2) 8x6
- **Label:** "← Back"
- **Action:** Return to mancave
- **Target:** `mancave`

### Technical Details
- **Encryption Indicator:** "End-to-end encrypted" shown
- **Connection Animation:** "Connecting..." → Video feed
- **Audio:** Optional voice for contacts
- **State Tracking:** Each contact remembers previous conversations

### Visual Design
- Three video screen placeholders
- Contact names below each screen
- Professional video call aesthetic
- Muted colors (terminal/screen look)
- Connection status indicators

---

## Scene 09: GARDEN - Backyard

**ID:** `garden`  
**File:** `scenes/garden/scene.js`  
**Background:** `assets/images/scenes/garden.svg`  
**Type:** Exploration / Transition  
**Player Visible:** Yes

### Description
Ryan's backyard garden. Flowers, grass, view over acres to German border. 16 windturbines visible ~500m east. Large antenna near turbines. Volvo estate parked near shed.

### Story Purpose
- Observation point (windturbines, distant facility)
- Access to car for travel
- Peaceful contrast before infiltration
- Return point after missions

### Hotspots

#### 1. Windturbines (distant view)
- **Position:** (75, 30) 20x15
- **Cursor:** look
- **Action:** Observe windturbines and interference
- **Dialogue varies by story progress:**
  - Early: "Those turbines have been acting strange..."
  - Mid: "Interference coming from that direction."
  - Late: "That's where the facility is. 30km away."

#### 2. Volvo Estate (Car)
- **Position:** (78, 55) 10x15
- **Cursor:** use
- **Action:** Depends on quest state
  - **Quest: visit_klooster** → Driving scene → Klooster
  - **Quest: infiltrate_facility** → Driving scene → Facility
  - **No quest:** "No reason to drive anywhere right now."

**Driving Dialogue:**
- **To Klooster:** Nervous anticipation, meeting unknown contact
- **To Facility:** High tension, infiltration prep, equipment check

#### 3. Antenna (near border)
- **Position:** (85, 25) 8x12
- **Cursor:** look
- **Action:** Examine large antenna structure
- **Dialogue:** "Probably for the wind farm communications. Or is it?"

#### 4. Door to House
- **Position:** (15, 60) 10x25
- **Cursor:** pointer
- **Action:** Return to kitchen
- **Target:** `home`

### Idle Thoughts
- "Peaceful out here."
- "Germany is right there."
- "Those turbines never stop."
- "Need to check the car oil."
- "Wonder what Ies is doing."
- "Could use some fresh air walks."

### State Management
- **onEnter:** Check driving flags, update car availability
- **onExit:** Set driving destination if applicable

---

## Scene 10: CAR_DISCOVERY (Merged/Deprecated)

**ID:** `car_discovery`  
**File:** `scenes/car_discovery/scene.js`  
**Status:** May be merged with garden scene

### Description
Close-up view of Ryan's Volvo 240 estate. Establishes transportation option.

**Note:** In current implementation, car interactions happen in garden scene. This dedicated scene may be used for special "preparing for journey" moments.

---

## Scene 11: DRIVING - Night Drive

**ID:** `driving`  
**File:** `scenes/driving/scene.js`  
**Background:** `assets/images/scenes/driving.svg`  
**Type:** Cinematic Transition  
**Player Visible:** No

### Description
Interior view of Volvo. Dashboard glow, windshield shows dark countryside. Atmospheric transition scene with internal monologue.

### Story Purpose
- Transition between locations
- Build tension before arrival
- Character introspection
- Cinematic pacing

### Destination Handling

**Triggered by flag:** `driving_destination`

#### Destination: Klooster
**Dialogue Sequence:**
```
Ryan: "Ter Apel. 15 minutes away."
Ryan: "Meeting someone I don't know. With evidence I haven't seen."
Ryan: "This could be a setup. This could be a trap."
Ryan: "But if it's real... if someone inside that facility is reaching out..."
Ryan: "I have to know."
```
**Duration:** ~20 seconds  
**Mood:** Nervous anticipation  
**Auto-transition:** → `klooster` scene

#### Destination: Facility
**Dialogue Sequence:**
```
Ryan: "11 PM. Time to go."
Ryan: "Flipper Zero - check. Tools - check. Meshtastic - check."
Ryan: "Eva is waiting. Let's do this."
Ryan: "No cameras. No alarms. In and out."
Ryan: "Just a walk in the park. A highly secured, guarded park."
```
**Duration:** ~25 seconds  
**Mood:** High tension, focus  
**Auto-transition:** → `facility` scene

#### Return Home
**Dialogue Sequence:**
```
Ryan: "Made it. In one piece."
Ryan: "USB stick feels heavy in my pocket."
Ryan: "Time to see what's really going on."
```
**Duration:** ~15 seconds  
**Mood:** Relief, anticipation  
**Auto-transition:** → `mancave` scene

### Technical Details
- **No hotspots** (cinematic, non-interactive)
- **Auto-progression** (timed dialogue → scene transition)
- **Timeout handling** (clears timeouts on exit)
- **Dashboard animation** (subtle glow, speed indicator)

---

## Scene 12: KLOOSTER - Ter Apel Monastery

**ID:** `klooster`  
**File:** `scenes/klooster/scene.js`  
**Background:** `assets/images/scenes/klooster.svg`  
**Type:** Exploration / Story Event  
**Player Visible:** Yes

### Description
Medieval monastery at night. Stone walls, arched doorways, courtyard with bench. Moonlight. Quiet, mysterious atmosphere.

### Story Purpose
- Dead drop location (retrieve USB stick)
- First physical evidence obtained
- Meet location suggested by Eva
- Turn point: from curiosity to active investigation

### Hotspots

#### 1. Monastery Entrance
- **Position:** (45, 35) 20x30
- **Cursor:** look
- **Action:** Examine monastery building
- **Dialogue:** "13th century. Still standing. Built to last."

#### 2. Bench with USB Stick
- **Position:** (30, 60) 18x15
- **Cursor:** use
- **Action:** Find and take USB stick
- **Sequence:**
  1. "A bench. Just like the message said."
  2. "Something taped underneath..."
  3. "*Carefully detaches a black USB stick*"
  4. "Got it. Now to analyze this back home."
- **Result:**
  - Adds USB stick💾 to inventory
  - Sets `usb_found` flag
  - Completes `find_usb` quest
  - Adds `analyze_usb` quest
- **One-time only:** Hotspot disabled after collection

#### 3. Look Around
- **Position:** (60, 25) 25x20
- **Cursor:** look
- **Action:** Survey surroundings
- **Dialogue:** "Quiet. No one around. Good."

#### 4. Car (Leave)
- **Position:** (10, 70) 15x20
- **Cursor:** use
- **Action:** Return to car
- **Sequence:**
  1. Check if USB collected
  2. If yes: "Time to head back."
  3. Transition → driving (return home) → mancave
  4. If no: "I came here for a reason. Better find what I'm looking for."

### Idle Thoughts
- "Creepy at night."
- "Hope no one followed me."
- "What's on that USB stick?"
- "Eva risked a lot for this."

### State Management
- **onEnter:** Set nighttime atmosphere, play arrival dialogue
- **onExit:** Clear scene state, prepare return journey

---

## Scene 13: FACILITY - Exterior (Stealth)

**ID:** `facility`  
**File:** `scenes/facility/scene.js`  
**Background:** `assets/images/scenes/facility.svg`  
**Type:** Stealth / Puzzle  
**Player Visible:** Yes

### Description
Steckerdoser Heide military R&D facility at night. Tall chain-link fences, security cameras, floodlights, guard patrol paths visible. Menacing compound.

### Story Purpose
- Infiltration challenge
- Apply learned skills (Flipper Zero, Meshtastic)
- Tension peak before climax
- Work with Eva remotely

### Security Challenges

#### 1. Security Camera
- **Position:** (35, 15) 8x10
- **Cursor:** use (with Flipper Zero)
- **Action:** Disable camera
- **Requirements:**
  - Must have Flipper Zero in inventory
  - Eva must provide frequency (Meshtastic)
- **Sequence:**
  1. "Camera covering the east gate."
  2. *Contacts Eva via Meshtastic*
  3. Eva: "Camera frequency is 2.4GHz standard. Flipper should handle it."
  4. *Uses Flipper Zero*
  5. "Camera loop engaged. 60 seconds."
- **Result:** Sets `camera_disabled` flag, starts 60s timer

#### 2. Main Gate (Locked)
- **Position:** (48, 45) 12x20
- **Cursor:** use
- **Action:** Attempt to open gate
- **Requirements:** Password from Eva
- **Sequence:**
  1. "Electronic lock. Keypad."
  2. *Message from Eva*: "Code is 7739. Maintenance override."
  3. **Password Puzzle:** Enter 7739
  4. *Lock beeps, gate unlocks*
  5. "I'm in."
- **Result:** Sets `gate_opened` flag, enables entry

#### 3. Guard Patrol
- **Position:** (60, 35) 15x25
- **Cursor:** look
- **Action:** Observe guard pattern
- **Dialogue:**
  - "Guard patrol. Predictable route."
  - "30 second intervals. Tight."
  - "Need to time this perfectly."
- **Mechanic:** Must wait for right moment
- **Fail condition:** If clicked during patrol → alarm

#### 4. Eva Contact (Meshtastic)
- **Position:** (10, 10) 20x10
- **Label:** "📡 Contact Eva"
- **Cursor:** pointer
- **Action:** Secure mesh communication
- **Features:**
  - Real-time guidance
  - Camera frequency
  - Gate code
  - Encouragement
- **Chat Interface:** Shows encrypted message exchange

#### 5. Proceed to Interior
- **Position:** (70, 50) 15x20
- **Cursor:** pointer
- **Action:** Enter facility building
- **Requirements:**
  - Camera disabled
  - Gate opened
  - Guard avoided
- **Target:** `facility_interior`

### Fail States

**Alarm Triggered:**
- **Causes:**
  - Clicked while guard is near
  - Took too long (camera reactivates)
  - Wrong password (multiple attempts)
- **Result:**
  - Alarm klaxon sound
  - "ALARM! FACILITY LOCKDOWN!"
  - Scene resets (try again)

### Idle Thoughts
- "Stay calm. Focus."
- "Way outside my comfort zone."
- "Eva better know what she's doing."
- "One wrong move, it's over."

### State Management
- **onEnter:** Initialize security state, spawn guard patrol
- **onExit:** Clear timers, save infiltration progress

---

## Scene 14: FACILITY_INTERIOR - Corridors (Stealth)

**ID:** `facility_interior`  
**File:** `scenes/facility_interior/scene.js`  
**Background:** `assets/images/scenes/facility_interior.svg`  
**Type:** Stealth / Exploration  
**Player Visible:** Yes

### Description
Inside the compound. Sterile corridors, fluorescent lighting, ventilation hum. Doors labeled in German. Clinical, oppressive atmosphere.

### Story Purpose
- Navigate to server room basement
- Build tension (constant detection risk)
- Environmental storytelling (military R&D aesthetic)
- Final barrier before climax

### Hotspots

#### 1. Main Corridor
- **Position:** (25, 30) 50x40
- **Cursor:** look
- **Action:** Examine corridor
- **Dialogue:**
  - "Sterile. Cold. Very German."
  - "Signs in German: Labor (Lab), Büro (Office), Keller (Basement)."
  - "I need the basement. Keller."

#### 2. Office Doors (Background)
- **Position:** (15, 35) 18x25
- **Cursor:** look
- **Action:** Locked offices
- **Dialogue:** "Offices. All dark. Empty at this hour."

#### 3. Lab Doors (Background)
- **Position:** (65, 38) 18x25
- **Cursor:** look
- **Action:** Lab observation
- **Dialogue:** "Lab equipment visible through window. Project Echo hardware?"

#### 4. Basement Access Door
- **Position:** (45, 55) 15x30
- **Cursor:** use
- **Action:** Access server room basement
- **Requirements:** Eva's code
- **Sequence:**
  1. "Basement access. Keycard reader."
  2. *Eva via Meshtastic*: "Server room is downstairs. Code: B4-7722."
  3. **Keypad Interaction:** Enter B4-7722
  4. *Door unlocks with pneumatic hiss*
  5. "Stairwell. Going down."
- **Result:** Sets `basement_unlocked` flag
- **Target:** `facility_server` (after code entry)

#### 5. Security Terminal (Optional)
- **Position:** (75, 48) 12x15
- **Cursor:** look
- **Action:** Check security status
- **Dialogue:**
  - "Security terminal. All lights green."
  - "No alerts. Yet."
  - "Stay invisible."

### Environmental Details
- Fluorescent lights pulse/flicker slightly
- Ventilation system hum (ambient sound)
- Footsteps echo (player movement)
- Occasional distant door slam
- German text on signs and doors

### Idle Thoughts
- "Stay quiet. Move fast."
- "Someone could turn that corner any second."
- "Where's the basement access?"
- "Eva's guidance is keeping me alive."
- "No cameras here. Good."

### State Management
- **onEnter:** Set infiltration mode, hide UI elements for immersion
- **onExit:** Prepare server room entry

---

## Scene 15: FACILITY_SERVER - Server Room (CLIMAX)

**ID:** `facility_server`  
**File:** `scenes/facility_server/scene.js`  
**Background:** `assets/images/scenes/facility_server.svg`  
**Type:** Puzzle / Climax  
**Player Visible:** Yes

### Description
Server room basement. Racks of servers, cable trays, terminal workstations, control panels. Hum of cooling fans. Dim emergency lighting. Project Echo's digital heart.

### Story Purpose
- **Climax of the game**
- Access Volkov's account
- Download incriminating evidence
- Sabotage weapon test
- High-stakes decision point

### Hotspots

#### 1. Main Server Terminal
- **Position:** (40, 45) 25x20
- **Cursor:** use
- **Action:** Multiple stages

**Stage 1: Password Entry**
- **Challenge:** Access Volkov's account
- **Password Puzzle:** "Dr. V. Volkov - Personal Account"
- **Clues:** Eva provides hint: "His password is SPEKTR - the Soviet program."
- **Correct Password:** `SPEKTR`
- **Success:**
  - "SYSTEM ACCESS GRANTED - DR. DMITRI VOLKOV"
  - Sets `volkov_account_accessed` flag

**Stage 2: Evidence Download**
- **Action:** Download files from Volkov's directory
- **Sequence:**
  1. *Navigate filesystem: /ZERFALL/PHASE_3/*
  2. "Financial transfers... FSB routing codes... Target coordinates."
  3. "Hamburg. Amsterdam. Berlin. All three cities."
  4. "Ambulance systems. Hospital equipment. Traffic control."
  5. "Deployment date: 72 hours from now."
  6. *Insert USB stick, begin download*
  7. **Progress bar:** 847 MB (15 seconds)
  8. "Download complete. This is everything."
- **Result:**
  - Sets `evidence_downloaded` flag
  - Updates USB stick item description
  - Adds evidence collection to game state

**Stage 3: Test Sabotage**
- **Action:** Sabotage Groningen transformer test
- **Sequence:**
  1. Eva (urgent): "Ryan! They're starting the test! Transformer 7 in Groningen!"
  2. "Active test detected: TARGET_GRONINGEN_T07"
  3. "Estimated casualties: 200+ (pacemaker failures, vehicle crashes)"
  4. **Choice Point:** "I can stop this."
  5. *Access test control panel*
  6. **Options:**
     - Abort test (clean, traceable)
     - Sabotage parameters (messy, deniable)
  7. Player chooses: most choose sabotage
  8. *Enters false calibration data*
  9. "TEST FAILURE - SAFETY PROTOCOLS ENGAGED"
  10. "It worked. The test aborted. No casualties."
- **Result:**
  - Sets `test_sabotaged` flag
  - Sets `lives_saved` flag
  - Completes major quest

#### 2. Control Panel (Emergency)
- **Position:** (65, 50) 20x18
- **Cursor:** use
- **Action:** Monitor test status
- **Display:**
  - Target: Groningen Transformer Station
  - Range: 44 km
  - Power: 50 MW
  - Status: CHARGING → FIRING → ABORTED

#### 3. Eva Communication (Ongoing)
- **Position:** (10, 10) 18x8
- **Label:** "📡 Eva (Encrypted)"
- **Action:** Real-time guidance
- **Messages:**
  - "You're running out of time!"
  - "Volkov is in the building!"
  - "Download faster!"
  - "Security is coming!"

#### 4. Exit (Extraction)
- **Position:** (80, 60) 15x25
- **Cursor:** pointer
- **Action:** Leave server room
- **Requirements:**
  - Evidence downloaded
  - Test sabotaged (optional but recommended)
- **Sequence:**
  1. "Got everything. Time to get out."
  2. Eva: "Security alerted! Extraction point: north fence!"
  3. "Running..."
  4. *Fade to black*
  5. *AUTO-TRANSITION* → `debrief` (5 seconds)

### Tension Mechanics

**Timer Pressure:**
- Visual countdown: "Time until security sweep: 3:00"
- Updates every 30 seconds
- Creates urgency without hard failure

**Alert Level:**
- Green: Undetected
- Yellow: Suspicious activity logged
- Red: Security en route (hurry!)

**Eva's Status:**
- Provides updates on Volkov's location
- Warns about security movements
- Emotional support ( "You can do this!")

### Outcomes

**Success:**
- All evidence downloaded
- Test sabotaged
- Lives saved in Groningen
- Clean escape
- → Debrief scene

**Partial Success (rare):**
- Evidence downloaded but test proceeds
- Player guilt, consequences mentioned

**Failure (should not happen):**
- Captured by security
- → Game over, restart scene

### Idle Thoughts
- "This is it."
- "Everything depends on this."
- "Download faster..."
- "Please don't let security find me."

### State Management
- **onEnter:** Maximum tension, dramatic music
- **onExit:** Clear all timers, save final game state

---

## Scene 16: DEBRIEF - Aftermath

**ID:** `debrief`  
**File:** `scenes/debrief/scene.js`  
**Background:** `assets/images/scenes/debrief.svg`  
**Type:** Interface / Story Resolution  
**Player Visible:** No

### Description
Information display / journal interface. Review of what was accomplished, immediate aftermath, next steps.

### Story Purpose
- Immediate resolution (escaped safely)
- Evidence secured confirmation
- Eva's status update
- Transition to epilogue (3 months later)

### Content Sections

#### 1. Escape Summary
- **Title:** "EXTRACTION SUCCESSFUL"
- **Content:**
  - Made it out of facility undetected
  - Eva covered digital tracks
  - No injuries
  - Evidence secured: 847 MB

#### 2. Evidence Secured
- **Title:** "WHAT WE HAVE"
- **List:**
  - Financial transfers (FSB routing codes)
  - Operation ZERFALL documentation
  - Target lists (Hamburg, Amsterdam, Berlin)
  - Volkov's personal emails
  - Test results and casualty reports
  - Schematics (Project Echo weapon)

#### 3. Test Results
- **Title:** "GRONINGEN TRANSFORMER - STATUS"
- **Content:**
  - Test ABORTED
  - Zero casualties
  - Facility blamed equipment malfunction
  - Security investigating sabotage
  - Bought time to expose operation

#### 4. Eva Weber
- **Title:** "WHISTLEBLOWER STATUS"
- **Content:**
  - Eva followed extraction plan
  - In contact with BND (German intelligence)
  - Protective custody arranged
  - Father safe
  - Waiting for evidence release

#### 5. Next Steps
- **Title:** "THE PLAN"
- **Content:**
  - 07:30 tomorrow: Simultaneous release
  - Eva → BND field office
  - Ryan → Press (23 journalists)
  - Public exposure = protection
  - No going back

#### 6. Current Time
- **Display:** "06:30 - One hour until release"

### Hotspot

#### Continue to Epilogue
- **Position:** (45, 85) 20x10
- **Label:** "One Hour Later..."
- **Cursor:** pointer
- **Action:** Transition to epilogue
- **Target:** `epilogue`

### Visual Design
- Journal/log aesthetic
- Monospace font
- Green text on dark background (terminal-like)
- Checkmarks for completed objectives
- Timestamps throughout

### State Review
Players can review collected evidence:
- Evidence items listable
- Flags achieved shown
- Quests completed displayed

---

## Scene 17: EPILOGUE - Three Months Later

**ID:** `epilogue`  
**File:** `scenes/epilogue/scene.js`  
**Background:** `assets/images/scenes/epilogue.svg`  
**Type:** Cinematic Resolution  
**Player Visible:** No

### Description
Spring scene. Ryan's garden in daytime. Flowers blooming. Peaceful. Narration of outcomes three months after exposure.

### Story Purpose
- Long-term resolution
- Character fate summaries
- World impact
- Ryan's new path
- Hopeful ending

### Narration Sequence

#### Time Card
- **Display:** "📅 THREE MONTHS LATER"
- **Subtext:** "🌸 May 2026"

#### 1. The Facility
- **Outcome:** Steckerdoser Heide shut down
- **Status:** Complete security review ongoing
- **Personnel:** Seven officials arrested
- **Investigation:** German parliament inquiry

#### 2. Dimitri Volkov
- **Status:** Awaiting trial, maximum security prison (Munich)
- **Cooperation:** Refused (German authorities)
- **Negotiation:** Talking to Americans about SPEKTR programs
- **Future:** Long prison sentence likely

#### 3. Director Hoffmann
- **Status:** Witness protection
- **Location:** Canada (new identity)
- **Confession:** Full cooperation for protection
- **Future:** Looking over shoulder forever

#### 4. Eva Weber
- **Status:** Testified before German parliament (closed session)
- **Identity:** Classified
- **Rumors:** Working for European cybersecurity agency
- **Confirmation:** None official

#### 5. Chris Kubecka
- **Action:** Published comprehensive ZERFALL report
- **Impact:** Required reading at NATO intelligence agencies
- **Scope:** Traced operations across 7 European countries
- **Continuing:** Still investigating related networks

#### 6. Cees Bassa
- **Status:** Back to LOFAR research
- **Hobby:** Monitoring interesting frequencies "just in case"
- **Attitude:** Ready to help again

#### 7. Pieter
- **Action:** Started security consulting firm
- **First Client:** German defense contractor (vetting procedures)
- **Business:** Thriving

#### 8. Ryan Weylant
- **Decision:** Took meeting with AIVD (Dutch intelligence)
- **Training:** Completed program in The Hague
- **Current:** Working with AIVD
- **Status:** "When strange signals appear now, he doesn't investigate alone. He has backup."

#### 9. The Bigger Picture
- **Impact:** Operation ZERFALL network exposed
- **Arrests:** 7 German officials, connections in Poland, Czech Republic, possibly France
- **Ongoing:** Investigation continues
- **Message:** "This is just the beginning."

### Visual Progression
- **Start:** Morning light, garden peaceful
- **Middle:** Montage of news headlines, photos of arrested officials
- **End:** Return to garden, Ryan at laptop, coffee in hand

### Final Message
- **Text:** "And Ryan Weylant? He took the meeting with Van der Berg. Then another meeting. Then a training program in The Hague."
- **Text:** "These days, when strange signals appear on his SSTV terminal, he doesn't investigate alone."
- **Text:** "He has backup now."

### Duration
- **Total:** ~90 seconds
- **Auto-progression:** Timed dialogue sequence
- **Skip:** Click to speed through
- **Transition:** → Credits

---

## Scene 18: CREDITS - End Credits

**ID:** `credits`  
**File:** `scenes/credits/scene.js`  
**Background:** `assets/images/scenes/credits.svg`  
**Type:** Cinematic  
**Player Visible:** No

### Description
Scrolling credits over stylized cyber background. Acknowledgments, technology credits, story inspiration.

### Content Sections

#### Game Title
- **Display:** "CYBERQUEST: OPERATION ZERFALL"
- **Subtitle:** "A Techno-Thriller Adventure"

#### Created By
- Creator name/team
- Development period
- Version number

#### Story & Design
- Writer
- Story consultants
- Technical advisors
- Real-world inspiration sources

#### Technical Credits
- **Engine:** Custom JavaScript
- **Graphics:** SVG illustrations
- **Voice:** Web Speech API
- **Persistence:** localStorage API

#### Special Thanks
- Beta testers
- RF/hacking community advisors
- Dutch and German language consultants
- Real locations featured (Compascuum, LOFAR, etc.)

#### Technology Acknowledgments
- LOFAR (ASTRON)
- Westerbork Telescope
- Bluetooth SIG
- TU Eindhoven
- Open-source tools referenced

#### Disclaimer
- **Fiction Notice:** "This is a work of fiction. Any similarity to real persons, organizations, or events is coincidental."
- **Technical Accuracy:** "RF technology depicted is based on real principles but capabilities are dramatized for gameplay."
- **No Hacking Guide:** "This game is not a tutorial for illegal activities."

#### Legal
- Copyright notice
- License information
- Privacy policy (no data collected)

### Hotspot

#### Play Again
- **Position:** (40, 90) 20x8
- **Label:** "Play Again"
- **Cursor:** pointer
- **Action:** Return to title screen (or intro)
- **Result:** Can start new game or load save

### Visual Design
- Slow upward scroll (Star Wars style)
- Cyber-green text on dark background
- Occasional glitch effects
- Background: abstract circuit patterns

### Duration
- **Total:** ~2-3 minutes scrolling
- **Skip:** Click to stop scrolling, show Play Again button
- **Music:** Credits music (if implemented)

---

## Scene Summary Statistics

| Category | Count | Notes |
|----------|-------|-------|
| **Total Scenes** | 18 | Complete game |
| **Exploration** | 7 | Player walks around, interacts |
| **Interface** | 4 | Evidence, map, planboard, videocall |
| **Cinematic** | 4 | Intro, documentary, epilogue, credits |
| **Stealth** | 3 | Facility exterior, interior, server |
| **Average Playtime** | 2-4 hrs | Depends on reading speed, exploration |
| **Total Dialogue Lines** | ~800+ | Estimated across all scenes |
| **Unique Hotspots** | ~120+ | Interactive elements |
| **Evidence Documents** | ~30+ | Emails, PDFs, images viewable |
| **Puzzles** | 5 | ROT1, passwords, stealth challenges |

---

## Scene Development Guidelines

### Creating New Scenes

1. **Choose scene type:** Exploration, Interface, Cinematic, or Stealth
2. **Define story purpose:** What does this scene accomplish?
3. **Design hotspots:** What can player interact with?
4. **Write dialogue:** All interactions need dialogue
5. **Set flags:** What progress does this scene enable?
6. **Connect transitions:** How does player reach this scene? Leave it?

### Quality Checklist

- [ ] Scene has clear purpose in story
- [ ] Player knows what to do (at least one obvious hotspot)
- [ ] Idle thoughts provide character flavor
- [ ] Hotspots have appropriate cursors
- [ ] Transitions tested (can reach scene, can leave scene)
- [ ] Flags set/checked correctly
- [ ] Dialogue matches character voice
- [ ] onEnter/onExit handle cleanup properly

### Performance Tips

- Keep SVG files optimized (< 500 KB each)
- Limit hotspots to essentials (< 10 per scene)
- Use efficient dialogue (don't overwrite)
- Clean up timers in onExit
- Remove temporary elements properly

---

**End of Scene Catalog**
