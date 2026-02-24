# Laser Corridor — Security Gauntlet

## Position in Game Flow
`facility_interior` → **laser_corridor** → `facility_server`

## Concept
After descending the basement stairs, Ryan enters a high-security corridor protecting the server room. Three layers of automated security must be defeated using hacking skills and the tools he's collected throughout the game.

## Setting
Underground corridor beneath the Steckerdoser Heide facility. Concrete walls, steel-reinforced door at the far end. Red and green laser beams criss-cross the corridor. Motion sensor pods on the ceiling. A biometric panel guards the final door. Emergency lighting casts everything in an eerie red/green glow. Industrial pipes and cable runs along the ceiling.

## 4 Phases

### Phase 1: Laser Grid Analysis
Ryan arrives at the corridor entrance. Visible laser grid blocks the path. He must analyze the laser pattern using his Flipper Zero's IR analyzer to identify the control frequency.
- **Puzzle**: Identify the laser modulation frequency — `38` (kHz, standard IR modulation)
- **Action**: Flipper Zero captures and replays the shutdown command

### Phase 2: Motion Sensor Bypass  
With lasers down, motion sensors activate as backup. Ultrasonic sensors sweep the corridor. Ryan must use the HackRF to jam the sensor frequency.
- **Puzzle**: Set the correct ultrasonic jamming frequency — `40` (kHz, standard ultrasonic sensor freq)
- **Action**: HackRF broadcasts jamming signal, sensors go blind

### Phase 3: Biometric Override
The server room door has a biometric fingerprint lock. Eva provided the override sequence via Meshtastic.
- **Puzzle**: Enter the override code — `2847` (from Eva's earlier message in facility_interior)
- **Action**: Lock disengages with a mechanical clunk

### Phase 4: Entry
Door opens. Transition to facility_server scene.

## Hotspots
1. **laser_grid** — The visible laser beams blocking the corridor
2. **flipper_zero_scan** — Use Flipper Zero to analyze lasers
3. **motion_sensors** — Ceiling-mounted ultrasonic pods
4. **hackrf_jam** — Use HackRF to jam motion sensors
5. **biometric_panel** — Fingerprint reader / keypad on the door
6. **server_door** — Heavy steel door to server room (final exit)
7. **security_camera_broken** — Smashed camera (Eva's work)
8. **pipe_leak** — Dripping pipe adding atmosphere
9. **cable_runs** — Network cables (look: educational about facility infrastructure)
10. **emergency_exit** — Retreat back to stairs (disabled after Phase 2)

## Hollywood Elements
- Animated laser beams sweeping and pulsing
- Red alert lighting that shifts to green on success
- Sparking electrical conduits
- Steam/fog from pipe leaks
- Countdown timer feel (dialogue-driven urgency)
- Screen shake on heavy door mechanics

## Educational Content
- IR modulation frequencies (38 kHz standard for consumer IR)
- Ultrasonic motion sensor principles (40 kHz Doppler)
- Biometric security bypass techniques
- Defense-in-depth security architecture
