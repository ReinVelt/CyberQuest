# CyberQuest: Project Overview & Documentation Index
**Last Updated:** March 21, 2026  
**Version:** 1.3  
**Status:** Production Ready

---

## Quick Start

**Play the game:** Open `index.html` in a modern web browser  
**No installation required** - Pure HTML/JS/CSS  
**Mobile friendly** - Touch controls supported  
**Save/load** - Automatic progress saving via localStorage

---

## What is CyberQuest?

**CyberQuest: Operation ZERFALL** is a Sierra-style point-and-click adventure game featuring realistic hacking scenarios, RF signal analysis, and espionage. 

**Genre:** Techno-thriller / Detective Adventure  
**Playtime:** 2-4 hours  
**Difficulty:** Medium (puzzles are logical, not obscure)  
**Rating:** Teen+ (themes of espionage, mild tension, no violence)

### Story Premise

You are **Ryan Weylant**, a 42-year-old Dutch hacker living in Compascuum, Netherlands. Your quiet life analyzing radio signals is disrupted when you receive a mysterious SSTV transmission from a German military facility. What starts as curiosity becomes a race against time to expose a Russian infiltration operation and prevent mass casualties.

### Core Gameplay

- **Point-and-click navigation** through 34 handcrafted scenes
- **Dialogue-driven story** with branching conversations
- **Puzzle solving** (ciphers, passwords, stealth challenges)
- **Evidence collection** (emails, documents, schematics)
- **Investigation board** (organize clues detective-style)
- **No fail states** (story-focused, not punishing)

---

## Documentation Structure

This project contains comprehensive documentation across multiple files:

### � [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md)
**Complete technical reference — engine + systems API**
- Core engine architecture and constants
- Scene object structure and loading process
- Full API for all 12 game systems (dialogue, inventory, quests, evidence, puzzles, chat, voice, save/load, player, flags, Movie Mode)
- Asset structure and scene catalog
- Technical stack, development guide, and debugging commands

**Read this if:** You want to understand how the engine works, contribute code, or write a new scene.

---

### 🗺️ [SCENES.md](SCENES.md)
**Complete catalog of all 34 scenes**
- Scene descriptions and backgrounds
- Hotspot maps with positions
- Dialogue sequences
- Story progression logic
- State management per scene
- Visual flow diagrams

**Read this if:** You want to understand scene content, add hotspots, or create new scenes.

---

### 🔍 [FLOW_ANALYSIS.md](FLOW_ANALYSIS.md)
**QA report — scene flow, flag registry, navigation verification**
- Story part progression (all 20 parts verified)
- Complete playthrough path diagram
- Per-scene flag analysis
- Dead-end and unreachable scene checks
- Full flag registry with set/check locations

**Read this if:** You're checking story flow integrity, debugging flag issues, or verifying scene connectivity.

---

### 📖 [STORY.md](STORY.md)
**Narrative bible — complete story, character motivations, and plot**
- Full story from Part 0 to Part 20 + Epilogue
- All dialogue and character interactions
- Quest descriptions
- Puzzle solutions
- Story logic and branching

**Read this if:** You want to understand the full narrative, character motivations, and plot.

---

### 🎬 [STORYBOARD.md](STORYBOARD.md)
**Visual storyboard with panel-by-panel breakdowns**
- Shot types and camera angles
- Animation notes and character details
- Originally for potential video adaptation

**Read this if:** You're interested in cinematic presentation or adapting the story to other media.

---

### 🎭 [SCREENPLAY.md](SCREENPLAY.md)
**South Park-style animated short screenplay**
- Full dialogue script for the opening act
- Comedic timing notes and character voice
- Stage directions and scene transitions

**Read this if:** You want to understand character voice and comedic tone for writing new dialogue.

---

### 🤝 [CONTRIBUTING.md](../CONTRIBUTING.md)
**Contributing guide — code, art, scenes, and story**
- Development setup and PDCA workflow
- Scene creation checklist
- Code style and naming conventions
- Asset guidelines and dialogue writing
- Story consistency rules and testing checklist

**Read this if:** You want to contribute to the project.

---

### 🔒 [SECURITY_AUDIT.md](SECURITY_AUDIT.md)
**Static security audit — all findings resolved**
- OWASP-aligned review of all engine code
- 6 findings (all fixed in v1.2)
- Threat model and confirmed non-issues

**Read this if:** You need to assess the security posture of the codebase.

---

## Project Statistics

### Codebase

| Component | Files | Lines of Code | Size |
|-----------|-------|---------------|------|
| **Engine** | 6 | ~5,500 | ~270 KB |
| **Scenes** | 34 | ~22,500 | ~1.1 MB |
| **Assets (SVG)** | 20+ | N/A | ~10 MB |
| **Documentation** | 9 | N/A | ~500 KB |
| **Total** | 67+ | ~28,000+ | ~12 MB |

### Content

| Category | Count |
|----------|-------|
| **Scenes** | 34 |
| **Hotspots** | ~250+ |
| **Dialogue Lines** | ~2,000+ |
| **Evidence Documents** | ~40+ |
| **Quests** | ~20+ |
| **Puzzles** | 5+ |
| **Characters** | 15+ |
| **Locations** | 10+ (mapped) |

### Gameplay

| Metric | Value |
|--------|-------|
| **Estimated Playtime** | 2-4 hours |
| **Average Scene Duration** | 5-15 minutes |
| **Replay Value** | Moderate (story-driven) |
| **Difficulty** | Medium |
| **Accessibility** | High (skippable content, save anywhere) |

---

## Technical Stack

CyberQuest uses only vanilla HTML/CSS/JavaScript — no frameworks, no build process, no external dependencies. Open `index.html` to run. For API details, browser support targets, and performance characteristics see [TECHNICAL_REFERENCE.md §7](TECHNICAL_REFERENCE.md#7-technical-stack).

---

## Character Roster

### Protagonists

**Ryan Weylant** (Player Character)
- Age: 42
- Occupation: Software developer, hacker, RF enthusiast
- Location: Compascuum, Netherlands
- Personality: Curious, methodical, MacGyver-style problem solver
- Skills: Hacking, signal analysis, electronics

**Eva Weber** ("E" - The Whistleblower)
- Age: ~30
- Occupation: IT Analyst at Steckerdoser Heide facility
- Role: Inside contact, provides evidence
- Motivation: Father threatened, prevent mass casualties
- Skills: System access, encryption, courage

### Allies

**Max Weylant**
- Role: Ryan's wife
- Personality: Pragmatic, supportive, grounded
- Function: Domestic anchor, normal life representation

**Dr. David Prinsloo**
- Institution: TU Eindhoven
- Expertise: Antenna technology, RF engineering
- Role: Technical advisor

**Cees Bassa**
- Institution: ASTRON (LOFAR)
- Expertise: Radio astronomy, signal processing
- Role: Signal analysis support

**Jaap Haartsen**
- Background: Bluetooth inventor (Ericsson)
- Expertise: Wireless protocols, encryption
- Role: Security and communication advice

**Chris Kubecka** ("The Hacktress")
- Background: Former US Air Force, security researcher
- Expertise: OSINT, offensive security, Russian operations
- Role: Intelligence gathering, OSINT analysis

**Pieter**
- Background: Former underground network member
- Expertise: Covert operations, contacts
- Role: Support network, logistics

### Antagonists

**Dr. Dimitri Volkov**
- Age: 52
- Background: Former Soviet military researcher
- Program: SPEKTR (Soviet RF warfare)
- Current: Lead consultant, Project Echo
- Status: Russian agent infiltrating German facility

**Director Hoffmann**
- Role: Facility director at Steckerdoser Heide
- Status: Compromised, working with Volkov
- Motivation: Unknown (coercion? ideology? money?)

### Supporting

**ET** (The Pug)
- Species: Dog
- Role: Emotional support, comic relief
- Skills: Being adorable, seeking snacks

---

## Key Locations

### Netherlands (Drenthe Province)

**1. Compascuum (52.81°N, 6.97°E)**
- Ryan's farmhouse (home base)
- White house, red roof, canal view
- Mancave workshop (investigation hub)

**2. Ter Apel (52.9°N, 7.1°E)**
- Medieval monastery
- Dead drop location (USB stick)
- 15km from Compascuum

**3. LOFAR Station - Exloo (52.91°N, 6.50°E)**
- Low-frequency radio telescope array
- Cees Bassa's workplace
- 60km west of Ter Apel

**4. WSRT - Westerbork (52.9°N, 6.6°E)**
- Historic radio telescope (14 dishes)
- Research station
- 50km west of Ter Apel

### Germany

**5. Steckerdoser Heide Facility (53.3°N, 7.4°E)**
- Military R&D compound
- Project Echo location
- 44km northeast of Ter Apel
- High security: fences, cameras, guards

**6. Meppen (52.69°N, 7.29°E)**
- Border town
- Reference point
- 30km southeast of Ter Apel

**Distance Between:** ~30 minutes drive from Compascuum to facility

---

## Key Technologies & Concepts

### Real Technologies Featured

**SSTV (Slow Scan Television)**
- Amateur radio image transmission
- Used for satellite downlinks
- Morse code + image transmission (game mechanic)

**HackRF One + PortaPack**
- Software-defined radio (SDR)
- Frequency analysis (1 MHz - 6 GHz)
- Signal recording and playback

**Flipper Zero**
- Multi-tool for RF, NFC, IR, GPIO
- Sub-GHz signal analyzer
- Used for security research

**Meshtastic**
- Off-grid mesh network communication
- LoRa-based, encrypted
- No infrastructure needed

**LOFAR (Low-Frequency Array)**
- Digital radio telescope
- Thousands of antennas across Europe
- Signal processing, satellite tracking

**Bluetooth**
- Invented by Jaap Haartsen (real person)
- Frequency-hopping wireless protocol
- Named after King Harald Bluetooth

### Fictional Technologies

**Project Echo**
- RF disruption weapon (fictionalized)
- Based on real EMP/RF weapon research
- Capabilities dramatized for gameplay

**Operation ZERFALL**
- Fictional Russian op
- Inspired by real influence operations
- "Zerfall" = German for "decay/collapse"

### Cipher Used

**ROT1 (Caesar Cipher, shift 1)**
- Each letter shifted forward by 1
- Example: A→B, B→C, WARNING→XBSOJOH
- Intentionally weak (plot point: meant to be decoded)
- Player solves as puzzle

---

## Development Philosophy

### Story First
- **Narrative-driven:** Story and characters are the priority
- **No grinding:** Progression is story-based, not stat-based
- **Meaningful choices:** Player decisions affect dialogue (future: affect outcome)

### Accessibility
- **No fail states:** Can't get stuck (future: hint system)
- **Save anywhere:** Automatic progress saving
- **Skip options:** Can skip cutscenes, puzzles have hints
- **Mobile-friendly:** Touch controls, responsive layout

### Realism with Drama
- **Real tech:** Based on actual hacking tools, RF concepts
- **Dramatic license:** Capabilities enhanced for gameplay
- **Plausible fiction:** Story inspired by real operations (Reichsbürger plot, Russian influence)

### Open Development
- **No DRM:** Just HTML files
- **Readable code:** Well-commented, modular
- **Educational:** Learning opportunity for web game development
- **Moddable:** Easy to create custom scenes/content

---

## Future Enhancements

### Planned (v1.4+)
- [ ] Achievement system
- [ ] Multiple save slots (3-5)
- [ ] Statistics tracking (time played, choices made)
- [ ] Hint system (progressive hints on timer)
- [ ] Accessibility mode (skip puzzles, etc.)
- [ ] Dutch translation
- [ ] German translation

### Under Consideration
- [ ] Branching endings (player choices matter more)
- [ ] Additional epilogue variations
- [ ] Mini-games (spectrum analyzer, etc.)
- [ ] Character relationship tracking
- [ ] New Game+ mode (harder puzzles, time limits)

### Community Requests
- [ ] Multiplayer co-op investigation
- [ ] User-generated scenes/stories
- [ ] VR support for immersive scenes
- [ ] Audio/music (currently minimal)

---

## Contributing

### Ways to Contribute

**1. Bug Reports**
- Test gameplay, report issues
- Check browser compatibility
- Verify story consistency

**2. Content**
- New scenes (follow structure in SCENES.md)
- Translation (Dutch, German, others)
- Voice acting (Web Speech API voices)

**3. Code**
- Engine improvements (see [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md))
- New game systems (see [TECHNICAL_REFERENCE.md §3](TECHNICAL_REFERENCE.md))
- Performance optimization

**4. Assets**
- SVG scene backgrounds
- Character portraits
- UI icons
- Sound effects (future)

**5. Documentation**
- Tutorial videos
- Walkthrough guides
- Code examples

### Development Setup

```bash
# Clone repository
git clone https://github.com/ReinVelt/CyberQuest.git
cd CyberQuest

# No build process! Just open in browser:
open index.html

# Or use a local server (recommended):
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Code Style
- **Vanilla JavaScript** (ES6+)
- **No transpilation** (must run in modern browsers)
- **Comments:** Explain "why", not "what"
- **Modularity:** One scene per file, systems separated

### Testing Checklist
- [x] **Unit tests: 179/179 passing** (`tests/test-runner.html`)
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Mobile touch controls functional
- [ ] Save/load persists correctly
- [ ] No console errors
- [ ] Scene transitions smooth
- [ ] Dialogue progresses correctly
- [ ] Puzzles solvable
- [ ] Evidence viewer displays properly

---

## License & Credits

### Game License
[Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (CC BY-SA 4.0) — © 2025–2026 Rein Velt.  
You may share and adapt this work for any purpose, provided you give credit to Rein Velt and distribute derivatives under the same license. See `LICENSE` for full terms.

### Technology Credits
- **Web Speech API** (W3C standard)
- **SVG** (W3C standard)
- **localStorage** (W3C standard)

### Story Inspiration
- Real-world technologies (LOFAR, Bluetooth, SSTV)
- Reichsbürger coup plot (December 2022)
- Russian influence operations (public reporting)
- Drenthe wireless technology history

### Special Thanks
- ASTRON (LOFAR information)
- TU Eindhoven (antenna research)
- Bluetooth SIG (protocol history)
- Security research community
- Beta testers

### Disclaimer
**This is a work of fiction.** While inspired by real technologies and events, all characters, organizations, and incidents portrayed are either products of imagination or used fictitiously. This game is not a guide for illegal activities.

---

## FAQ

**Q: Do I need to install anything?**  
A: No! Just open `index.html` in a web browser.

**Q: Does it work offline?**  
A: Yes, completely. No internet connection required after downloading files.

**Q: Can I play on mobile?**  
A: Yes, touch controls are fully supported.

**Q: How long does it take to play?**  
A: 2-4 hours for a complete playthrough.

**Q: Are there multiple endings?**  
A: Currently one main ending (epilogue). Future versions may add branching outcomes.

**Q: Is the hacking realistic?**  
A: The technologies are real, but capabilities are dramatized for gameplay.

**Q: Can I create my own scenes?**  
A: Yes! See SCENES.md for structure and examples.

**Q: Is there voice acting?**  
A: Optional text-to-speech narration using Web Speech API (browser-dependent).

**Q: Can I save my progress?**  
A: Yes, automatically saves via `localStorage` in your browser. Can load save from menu.

**Q: What if I get stuck?**  
A: Quest log provides hints. Future versions will have progressive hint system.

**Q: Does the game collect any data about me?**  
A: No. See the Privacy & Data section below.

---

## Privacy & Data

**CyberQuest does not collect, transmit, or store any personal data. Full stop.**

### What data exists

| What | Where it lives | Sent to a server? |
|------|----------------|-------------------|
| Save game (progress, flags, inventory) | Your browser's `localStorage` | ❌ Never |
| Game statistics | Not tracked at all | ❌ Never |
| Playtime / choices made | Not tracked at all | ❌ Never |
| Analytics / telemetry | None — zero | ❌ Never |
| Personal information | None collected | ❌ Never |

### What this game does NOT have

| Thing | Present? |
|-------|----------|
| Advertisements | ❌ No |
| Google Analytics (or any analytics) | ❌ No |
| Tracking pixels / beacon calls | ❌ No |
| Third-party scripts (CDN, social, etc.) | ❌ No |
| Cookies | ❌ No |
| Accounts / sign-up / login | ❌ No |
| Cookie consent banners | ❌ No |
| Dark patterns | ❌ No |
| Newsletter popups / nag screens | ❌ No |
| Paywalls / microtransactions | ❌ No |

### Technology stack

The game is **100% plain HTML + CSS + JavaScript + images**. No frameworks, no bundlers, no external dependencies, no phone-home code. The full source is readable in any text editor.

- Runs entirely in your browser with **no internet connection required after download**.
- Your save data exists **only on your device**. Clearing browser `localStorage` deletes it permanently.
- **GDPR-compliant by design** — there is no data processing to report because no data is processed.

---

## Contact & Support

**Issues:** [GitHub Issues](https://github.com/ReinVelt/CyberQuest/issues)  
**Repository:** [github.com/ReinVelt/CyberQuest](https://github.com/ReinVelt/CyberQuest)  
**Documentation:** This repository (`docs/` folder)  
**Author:** Rein Velt

---

## Version History

**v1.3 (March 21, 2026)**
- ✅ Documentation refactored: GAME_ARCHITECTURE.md + SYSTEMS.md merged into TECHNICAL_REFERENCE.md
- ✅ RULES.md expanded into CONTRIBUTING.md at repo root
- ✅ GAME_FLOW_ANALYSIS.md renamed to FLOW_ANALYSIS.md with QA preamble
- ✅ Duplicate sections stripped from SCENES.md
- ✅ Missing changelog versions added (v0.7.0-alpha through v1.2)
- ✅ 34th scene confirmed in documentation

**v1.2 (March 7, 2026)**
- ✅ Engine storage null-injection bug fixed (DI now uses `'in'` check)
- ✅ All 179 unit tests passing (24 suites)
- ✅ Cache-busters unified (`?v=7`)
- ✅ CC BY-SA 4.0 License added
- ✅ README and all documentation updated for production
- ✅ Stale `.bak` files removed from repository
- ✅ Debug HTML files excluded via `.gitignore`

**v1.1 (February 27, 2026)**
- ✅ Expanded to 33 scenes (15 new scenes)
- ✅ Pause system added
- ✅ Scene-based clock (SCENE_TIME_MAP)
- ✅ Save format v2 (evidence tracking)
- ✅ Debug panel overhauled
- ✅ Hackerspace / Dwingeloo / ASTRON / LOFAR / Westerbork scenes
- ✅ Laser corridor stealth scene
- ✅ Long night / morning after / return to max scenes
- ✅ Drone hunt scene

**v1.0 (February 15, 2026)**
- ✅ Complete game (18 scenes)
- ✅ All core systems implemented
- ✅ Full story (20 parts + epilogue)
- ✅ Documentation complete
- ✅ Mobile support
- ✅ Save/load system
- ✅ Voice narration (optional)

---

## Quick Links

- **[Start Playing](../index.html)** - Open the game
- **[Technical Reference](TECHNICAL_REFERENCE.md)** - Engine + systems API
- **[Scenes](SCENES.md)** - Scene catalog (34 scenes)
- **[Story](STORY.md)** - Full screenplay
- **[Flow Analysis](FLOW_ANALYSIS.md)** - Scene transitions and flag registry
- **[Security Audit](SECURITY_AUDIT.md)** - Static security audit (all findings resolved)
- **[Contributing](../CONTRIBUTING.md)** - Scene checklist, code style, story rules
- **[Assets](../assets/)** - All game assets
- **[Engine](../engine/)** - Core engine code

---

**CyberQuest: Operation ZERFALL**  
*A techno-thriller adventure built with curiosity, code, and coffee.*

**Status:** Production Ready ✅  
**Last Updated:** March 21, 2026
**Version:** 1.3

---

*"When strange signals appear, investigate. But don't do it alone."* - Ryan Weylant
