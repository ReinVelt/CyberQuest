# Planetenpad — Scale Model of the Solar System

## Position in Game Flow
`wsrt_parking` → **planetenpad** → `wsrt_parking` (back) or `astron` (forward, gated)

## Overview
A 1 km educational walking path through the Drenthe heathland, from the outer planets to a golden Sun model near the WSRT radio telescope array. Ryan walks the path, encountering planet models on concrete pedestals, info boards with Dutch/English text, and three interactive physics experiments. The scene should feel like *being there* — boots on sand, wind in the heather, the slow revelation of scale.

## Real-World Reference
The Planetenpad at Westerbork is a permanent outdoor scale model of the solar system. Listed on Wikipedia's "Solar System model" page as the "Milky Way path" at Westerbork, Netherlands — scale 1:3,700,000,000, total length 2.5 km, walkable. For gameplay we compress it to ~1 km to keep pacing tight.

## Setting
Open Drenthe heath between the WSRT parking area and the telescope array. Sandy walking path curving gently through heather, birch, and Scots pine. Low rolling terrain. Big open sky. Quiet — only wind, skylarks, and the crunch of sand underfoot. The 14 WSRT parabolic dishes are visible at the far end of the path, growing larger as you walk toward the Sun model.

## Scale (in-game)
| | Model | Real |
|---|---|---|
| **Scale ratio** | ~1:6,000,000,000 | — |
| **1 cm =** | 60,000 km | — |
| **Sun** | 23 cm (beach ball) | 1,392,000 km |
| **Jupiter** | 2.4 cm (walnut) | 142,984 km |
| **Earth** | 2.1 mm (peppercorn) | 12,742 km |
| **Moon** | 0.6 mm at 6.4 cm from Earth | 3,474 km at 384,400 km |
| **Sun–Earth** | ~25 m | 150 million km |
| **Sun–Neptune** | ~750 m | 4.5 billion km |
| **Sun–Pluto** | ~985 m | 5.9 billion km |
| **Speed of light** | ~5 cm/s | 299,792 km/s |
| **Proxima Centauri** | 6,800 km away | 4.24 light-years |
| **Voyager 1** | ~3.5 km away | 23.5 billion km |

## Planet Markers (bottom-left → top-right along path)

| # | Planet | Distance from Sun | Model Size | Visual | Key Fact |
|---|--------|-------------------|-----------|--------|----------|
| 1 | **Pluto** | 985 m | 0.4 mm | Tiny grey speck on pedestal | Demoted 2006. You *feel* the emptiness walking here. |
| 2 | **Neptune** | 750 m | 0.8 mm | Blue-tinted sphere | Discovered by mathematics before telescope (Le Verrier) |
| 3 | **Uranus** | 480 m | 0.8 mm | Pale blue, tilted pedestal | 98° axial tilt — rolls around the Sun |
| 4 | **Saturn** | 238 m | 1.9 cm | Golden sphere + ring detail | Less dense than water — it would float |
| 5 | **Jupiter** | 130 m | 2.4 cm | Orange/brown bands, red spot | Sun–Jupiter barycenter lies outside the Sun's surface |
| 6 | **Mars** | 38 m | 1.1 mm | Red dot | Olympus Mons: 22 km high (3× Everest) |
| 7 | **Earth** | 25 m | 2.1 mm | Blue-green + Moon on wire (6.4 cm) | ISS orbits 0.07 mm above the surface at this scale |
| 8 | **Venus** | 18 m | 2.0 mm | Yellowish sphere | Rotates backwards. Day > year. 460°C surface. |
| 9 | **Mercury** | 10 m | 0.8 mm | Dark grey, cratered | Not the hottest planet — Venus wins (greenhouse) |
| ☀ | **Sun** | 0 m | 23 cm | Golden sphere on sturdy pedestal | 99.86% of all solar system mass. 15M °C core. |

## Physics Experiments

### 1. Gravity Comparison (between Jupiter & Mars)
**Type:** Spring scale with planet-marked indicators
**Challenge:** Pull a handle to feel different gravitational forces
**Data:**
- Moon: 16.6% (60 kg → 10 kg)
- Mars: 37.6% (60 kg → 22.6 kg)
- Jupiter: 252.8% (60 kg → 151.7 kg)
- Sun: 2,800% (60 kg → 1,680 kg)
**Ryan's insight:** Surface gravity depends on mass AND radius. Saturn (95× Earth's mass) has less surface gravity than Earth.

### 2. Speed of Light (between Mercury & Sun)
**Type:** LED strip along the ground + info panel
**Data:**
- At this scale: ~5 cm/s
- Sun → Earth (25 m): 8 min 20 sec
- Sun → Neptune (750 m): 4 h 10 min
- Sun → Pluto (985 m): 5 h 28 min
- Nearest star (Proxima Centauri): 6,800 km at this scale
**Ryan's insight:** Even at 300,000 km/s, the nearest star is 4+ years. Space is incomprehensibly vast.

### 3. Sundial (between Saturn & Jupiter)
**Type:** Stone sundial set into ground, gnomon at 52.9° (latitude of Westerbork)
**Behaviour:** Time-of-day aware — Ryan's comment changes based on `game.gameState.time`
**Ryan's insight:** Ancient tech, still accurate, no batteries. Gnomon angle must match latitude.

## Hotspots

| ID | Name | Position | Action |
|----|------|----------|--------|
| `pluto_marker` | Pluto — Dwarf Planet | 3%, 55% | Planet dialogue + facts |
| `neptune_marker` | Neptune | 12%, 50% | Planet dialogue + facts |
| `uranus_marker` | Uranus | 20%, 47% | Planet dialogue + facts |
| `saturn_marker` | Saturn | 32%, 42% | Planet dialogue + facts |
| `jupiter_marker` | Jupiter | 42%, 38% | Planet dialogue + facts |
| `gravity_experiment` | Physics: Gravity | 49%, 35% | Experiment dialogue |
| `mars_marker` | Mars | 56%, 33% | Planet dialogue + facts |
| `earth_marker` | Earth & Moon | 62%, 30% | Planet dialogue + facts |
| `venus_marker` | Venus | 67%, 28% | Planet dialogue + facts |
| `mercury_marker` | Mercury | 73%, 25% | Planet dialogue + facts |
| `light_experiment` | Physics: Light Speed | 76%, 22% | Experiment dialogue |
| `sun_model` | The Sun Model ☀️ | 82%, 18% | Sets `planetenpad_complete` flag |
| `sundial_experiment` | Physics: Sundial | 38%, 45% | Time-aware dialogue |
| `back_to_parking` | ← Parking | 0%, 75% | → `wsrt_parking` |
| `continue_to_wsrt` | WSRT → | 92%, 15% | → `astron` (gated on `astron_unlocked`) |
| `path_overview` | The Walking Path | 25%, 60% | Overview + spacing facts |
| `wsrt_bg` | WSRT Dishes | 85%, 5% | Background observation |

## Game Flags
| Flag | Set When | Purpose |
|------|----------|---------|
| `visited_planetenpad` | First entry | Triggers intro dialogue vs. return dialogue |
| `planetenpad_complete` | Sun model reached | Could gate achievements or later dialogue |

## Hollywood / Cinematic Vision

### Walking Immersion (TODO — current scene is static)
The scene should feel like walking the path in real life. Ideas for cinematic upgrade:

1. **Multi-phase walking sequence** — Instead of one static background, the scene could transition through phases as Ryan "walks" the path:
   - Phase 1: Entrance (Pluto/Neptune/Uranus) — wide heath, distant path
   - Phase 2: Gas giants (Saturn/Jupiter) — path closer, models growing
   - Phase 3: Inner planets (Mars/Earth/Venus/Mercury) — tight composition, Sun visible ahead
   - Phase 4: Sun model — golden glow dominanting, WSRT dishes behind

2. **Animated SVG elements:**
   - Clouds drifting across the sky
   - Heather swaying in the wind
   - Skyscrapers (skylarks) circling overhead
   - Planet models casting moving shadows
   - Sun model pulsing with warm glow
   - Subtle parallax: foreground bushes move faster than distant treeline

3. **Sound design:**
   - Sandy footsteps (rhythm tied to walking)
   - Wind in the heather (constant gentle wash)
   - Skylark song (intermittent, rising)
   - Distant drone of WSRT servos (growing louder toward end)
   - Spring scale creak (gravity experiment)
   - LED chirp/beep (light speed experiment)
   - Stone grating (sundial interaction)

4. **Background depth layers:**
   - **Far background**: Sky gradient + clouds + distant WSRT dishes
   - **Mid background**: Tree line (birch, Scots pine) + distant heather
   - **Path layer**: Sandy walking path with footprint details
   - **Object layer**: Planet pedestals, experiment panels, info boards
   - **Near foreground**: Heather bushes, grass tufts, wildflowers overlapping scene edges
   - Foreground elements should overlap hotspot area slightly for depth

5. **Dialogue staging:**
   - Ryan crouches to examine tiny planet models (Pluto, Mercury)
   - Ryan stands back and looks up at Jupiter/Saturn
   - Ryan shields eyes when looking toward the Sun model
   - Wind ruffles his jacket during exposed heath sections
   - He reads info boards with genuine curiosity

6. **Environmental storytelling:**
   - Footprints of previous visitors in the sand
   - A weathered bench between Jupiter and Mars ("rustpunt")
   - A pair of binoculars-on-a-pole pointing at the WSRT
   - Children's drawings pinned to an info board
   - A forgotten water bottle near Saturn (life detail)

## SVG Background Design

### Current Elements
- Open sky with gradient (#3a6095 → #c0d4e8)
- Cumulus clouds (3)
- 5 distant WSRT dishes (top-right, 45% opacity)
- Distant tree line (simple rectangles)
- Heathland ground fill (#6a7a5a → #4a5a38)
- Heather patches (purple-brown ellipses)
- Sandy path (diagonal bottom-left to top-right, curved)
- 9 planet pedestals with spheres and labels
- Sun model with radial gradient glow
- 3 experiment panels (gravity, light speed, sundial)
- Info boards at each planet (green rectangles)
- Entrance sign (PLANETENPAD)
- Grass tufts along path
- 2 skylarks (flying silhouettes)
- Navigation labels (← Parkeerplaats, WSRT →)

### Desired Improvements
- **More trees**: Birch trees (white bark detail), Scots pines (dark green triangular canopy) scattered behind the path. Cluster 3-5 trees at mid-distance. Individual trees closer for framing.
- **Foreground bushes**: Large heather/gorse bushes overlapping bottom edge of scene. Creates depth and frames the interactive area. Some should partially obscure the path for realism.
- **Ground texture variety**: Mix sand, grass, heather, bare earth patches. Not uniform.
- **More wildlife detail**: Dragonfly near water (if any), butterfly near heather, rabbit partially hidden in bush.
- **Bench**: Wooden bench ("rustpunt") between gas giants and inner planets.
- **Binoculars pole**: Near the Sun model, pointing at WSRT.
- **Path footprints**: Faint shoe impressions in the sand.
- **Seasonal detail**: If time allows, support seasonal variants (purple heather = late summer, brown = winter).

## Story Connection
- **Narrative role**: Quiet, reflective scene. A break from the thriller tension.
- **Character beat**: Ryan's love of science shines through — this is who he is underneath the hacker exterior
- **Thematic**: The incomprehensible scale of the universe vs. the intimate human drama of the story. "The universe doesn't care about your to-do list."
- **WSRT connection**: The path physically leads toward the WSRT dishes — from models to real science. A fitting metaphor.

## Technical Notes
- Background: SVG 1600×900 viewBox
- Hotspot positions: percentage-based for responsive layout
- Planet data stored in `_planets` object for DRY dialogue generation
- Sun model interaction sets `planetenpad_complete` flag on first visit
- Sundial experiment reads `game.gameState.time` for dynamic response
- WSRT exit gated on `astron_unlocked` flag
- Scene registered via `window.game.registerScene(PlanetenpadScene)`
