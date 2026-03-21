# Contributing to CyberQuest

**Last Updated:** March 21, 2026
**Version:** 1.3

Welcome! CyberQuest is open source under [CC BY-SA 4.0](LICENSE). Contributions
of all kinds are welcome — bug reports, new scenes, art, code, translations, and
documentation.

---

## Table of Contents
1. [Development Setup](#1-development-setup)
2. [Development Philosophy (PDCA)](#2-development-philosophy-pdca)
3. [Ways to Contribute](#3-ways-to-contribute)
4. [Responsive Design Requirements](#4-responsive-design-requirements)
5. [Code Style](#5-code-style)
6. [Scene Creation Checklist](#6-scene-creation-checklist)
7. [Naming Conventions](#7-naming-conventions)
8. [Asset Guidelines](#8-asset-guidelines)
9. [Dialogue Writing Guide](#9-dialogue-writing-guide)
10. [Story Consistency Rules](#10-story-consistency-rules)
11. [Testing Checklist](#11-testing-checklist)
12. [Submitting Changes](#12-submitting-changes)

---

## 1. Development Setup

No build process. No install required.

```bash
# Clone the repository
git clone https://github.com/ReinVelt/CyberQuest.git
cd CyberQuest

# Option A: open directly (simplest)
open index.html

# Option B: local server (recommended — avoids CORS issues with SVGs)
python -m http.server 8000
# Then visit: http://localhost:8000
```

For unit tests, open `tests/test-runner.html` in a browser.
All 179 tests must pass before submitting changes.

---

## 2. Development Philosophy (PDCA)

We use **Plan → Do → Check → Act** for every feature or scene.

### Plan
- Define the objective clearly before writing code
- Create a design document (`design.md`) inside the scene folder covering:
  - Story purpose: what does this scene accomplish?
  - User interactions and expected outcomes
  - Required assets (SVGs, portraits, audio)
  - Acceptance criteria for completion
- Review story consistency with `docs/STORY.md` before introducing new plot elements
- Ask the core team before making story decisions that affect other scenes

### Do
- Implement one scene or feature at a time
- Create a working prototype first, then refine
- Follow the folder structure in [TECHNICAL_REFERENCE.md](docs/TECHNICAL_REFERENCE.md) exactly
- Commit incrementally with descriptive messages

### Check
- Test each scene for:
  - Visual quality and immersion
  - Interaction responsiveness
  - Story continuity and logic
  - Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
  - Mobile touch controls
- Run the full unit test suite (`tests/test-runner.html`)
- Verify acceptance criteria from the Plan phase

### Act
- Fix all issues found in Check
- Update documentation alongside code
- Standardise successful patterns and add them here

---

## 3. Ways to Contribute

### Bug Reports
- Open a [GitHub Issue](https://github.com/ReinVelt/CyberQuest/issues)
- Include: browser + version, OS, steps to reproduce, expected vs actual behaviour
- Attach console output if available

### New Scenes
- Follow the scene creation checklist below
- Create a `design.md` first, get feedback before implementing

### Translations
- Dutch (`nl`) and German (`de`) are highest priority
- Create locale files in a new `locales/` directory
- Contact the team before starting (coordinate with any in-progress translation work)

### Code
- Engine improvements → see [TECHNICAL_REFERENCE.md](docs/TECHNICAL_REFERENCE.md)
- New systems → discuss in an Issue before implementing
- Performance fixes → include before/after measurements

### Art / Assets
- SVG scene backgrounds (target < 500 KB per file)
- Character portraits (PNG or SVG, ~256 × 256 px)
- UI icons (SVG preferred, 48 × 48 px grid)

### Documentation
- Fix errors or outdated information
- Add code examples for undocumented patterns
- Write walkthroughs or tutorials (in a separate `guides/` directory)

---

## 4. Responsive Design Requirements

All scenes must be fully responsive:

| Breakpoint | Range | Requirements |
|------------|-------|-------------|
| Smartphone | 320 px – 480 px | Touch-friendly controls, portrait mode supported, simplified hotspot layout |
| Tablet | 481 px – 1024 px | Adaptive layout, touch and pointer events both work |
| Desktop / Big Screen | 1025 px+ | Full visual experience, keyboard + mouse controls |

- Use CSS media queries and flexbox/grid for layout
- Images and SVGs must scale (percentage sizing, `viewBox` set)
- Minimum touch target size: **44 × 44 px**
- Test on at least one mobile device or emulator before submitting

---

## 5. Code Style

**Language:** Vanilla JavaScript (ES6+). No TypeScript, no transpilation.

| Rule | Detail |
|------|--------|
| Semicolons | Yes |
| Quotes | Single quotes for JS strings |
| Indentation | 4 spaces (no tabs) |
| `var` | Never — use `const` / `let` |
| Arrow functions | Preferred for callbacks |
| Comments | Explain *why*, not *what*. Remove `console.log` before submitting. |
| Modularity | One scene per `scene.js` file; large scenes split into sub-modules |
| No globals | Everything namespaced under the scene object or passed via `game` |

**Example hotspot:**
```javascript
{
  id: 'sstv_terminal',
  name: 'SSTV Terminal',
  x: 35, y: 40, width: 12, height: 18,
  cursor: 'look',
  action: function(game) {
    if (game.getFlag('sstv_transmission_received')) {
      game.loadScene('sdr_bench');
    } else {
      game.playerThink('Just static for now.');
    }
  }
}
```

---

## 6. Scene Creation Checklist

Before marking a scene done, verify every item:

**Story & Design**
- [ ] Scene has a clear, single purpose in the narrative
- [ ] Purpose documented in `design.md` (or scene comment header)
- [ ] Story flags set/checked match the canonical list in `FLOW_ANALYSIS.md`
- [ ] No new flags introduced without updating `FLOW_ANALYSIS.md`
- [ ] At least one obvious hotspot so the player knows what to do

**Code**
- [ ] Scene file follows the standard object structure (see `TECHNICAL_REFERENCE.md §3`)
- [ ] `id` matches the folder name exactly
- [ ] `onEnter` / `onExit` clean up any DOM elements or timers they create
- [ ] All `sceneTimeout()` used instead of bare `setTimeout`
- [ ] Scene registered in `index.html` via `<script src="…">`
- [ ] `accessibilityPath` defined so Movie Mode can traverse the scene

**Content**
- [ ] All hotspots have appropriate `cursor` values
- [ ] Dialogue matches the character voice (see §9 below)
- [ ] Idle thoughts provide character flavour (minimum 3)

**Technical**
- [ ] SVG background < 500 KB
- [ ] Scene reachable from at least one other scene
- [ ] Scene exits to at least one other scene (no dead ends)
- [ ] Works on mobile (touch targets ≥ 44 px)
- [ ] No console errors
- [ ] 179/179 unit tests still pass

---

## 7. Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Scene ID | `snake_case` | `facility_server` |
| Scene directory | Same as scene ID | `scenes/facility_server/` |
| Hotspot ID | `kebab-case` | `sstv-terminal`, `door-to-mancave` |
| Flag name | `snake_case` | `sstv_decoded`, `visited_klooster` |
| Quest ID | `snake_case` | `decode_sstv_signal` |
| Evidence document ID | `snake_case` | `usb_readme`, `email_volkov_01` |
| Item ID | `snake_case` | `usb_stick`, `flipper_zero` |
| SVG background | `{scene_id}.svg` | `facility_server.svg` |
| Scene sub-module | `{topic}.js` | `usb-analysis.js`, `ally-recruitment.js` |

---

## 8. Asset Guidelines

### SVG Scene Backgrounds
- Keep file size < 500 KB (optimise with Inkscape or SVGO)
- Set a proper `viewBox="0 0 1920 1080"` (16:9 aspect ratio)
- Avoid embedding binary images (raster backgrounds) — keep SVG vector-only
- Append `?v=N` to the `background` path when making visual updates, to force cache-bust
- Night scenes: dark palette (blues, near-blacks). Day scenes: warmer tones.

### Character Portraits
- Dimensions: 256 × 256 px minimum (square)
- Format: PNG (transparency) or SVG
- South Park flat aesthetic: bold outlines, flat fills, minimal shading
- Consistent eye-line and framing across all characters

### Inventory Icons
- Format: SVG preferred; PNG fallback (48 × 48 px)
- Single colour or simple two-tone
- Must be recognisable at 32 px

### Evidence Documents
- Real document aesthetic: letterhead, timestamps, classification markings
- Use in-world fonts (monospace for terminals, sans-serif for corporate docs)
- Keep content plausible within the fiction

---

## 9. Dialogue Writing Guide

### Ryan's Voice
- Dry, understated humour ("Well. That's not normal.")
- Technical but accessible (explains concepts without lecturing)
- Self-deprecating ("I'm probably overthinking this")
- Never panics — methodical even under stress

### Max's Voice
- Warm, grounded, practical
- Gently sceptical of Ryan's obsessions ("Not another antenna project…")
- Does not use technical jargon

### Antagonists (Volkov, Hoffmann)
- Professional, cold, clipped
- Do not monologue — short statements only

### General Rules
- Lines should be ≤ 2 sentences; break longer exchanges into multiple lines
- Use `{ speaker: '', text: '…' }` for narration, sound effects, and stage directions
- Avoid exposition dumps — characters should only say what they would naturally say in context
- Dialogue should advance the story *or* reveal character — not both at once
- Test all dialogue with voice narration enabled to check pacing

---

## 10. Story Consistency Rules

- **Do not change established facts** without updating `docs/STORY.md` first
- **Ryan is 42 years old**, lives in Compascuum, drives a Volvo 240 estate
- **USB dead-drop location:** monastery bench at Ter Apel Klooster (Day 1, 23:03)
- **In-game dates:** Day 1 = Monday 9 February. See `SCENE_TIME_MAP` in `TECHNICAL_REFERENCE.md §1` for canonical times
- **ROT1 cipher** is the only cipher used for SSTV messages (intentionally weak)
- **No fail states** — the game never locks the player out or ends prematurely
- Any new ally must appear in the documentary or be introduced via Kubecka's network
- **Ask before changing** any story point that involves a real person or institution

---

## 11. Testing Checklist

```
[ ] 179/179 unit tests pass (tests/test-runner.html)
[ ] Works in Chrome, Firefox, Safari, Edge (latest)
[ ] Mobile touch controls functional (iOS + Android)
[ ] Save / load persists correctly across scene changes
[ ] No console errors or warnings
[ ] Scene transitions smooth (no flicker, no hang)
[ ] Dialogue sequences complete and voice narration plays
[ ] Puzzles solvable with correct inputs
[ ] Evidence viewer displays all document types correctly
[ ] Movie Mode traverses scene without stalling
[ ] Inventory items appear and descriptions show on hover
```

---

## 12. Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-scene-name`
3. Implement and test your changes
4. Commit with a descriptive message:
   ```
   feat: add planetenpad walk scene between garden and WSRT

   - New scene: planetenpad (ID: planetenpad)
   - Connects garden_back → wsrt_parking
   - Sets flag: visited_planetenpad
   - Adds idle dialogue referencing WSRT dishes
   ```
5. Open a Pull Request against `development` (not `main`)
6. Fill in the PR template (story purpose, testing done, screenshots)
7. Wait for review — we aim to respond within 7 days

---

*CyberQuest is built with curiosity, code, and coffee. Welcome aboard.*
