# Drone Hunt — The Forest

## Overview
Hollywood-style action scene where Ryan evades Volkov's surveillance drones in the Steckerdoser Heide forest using his HackRF One for GPS spoofing.

## Placement in Game Flow
- **Before**: `driving` scene (destination 'facility') — Ryan parks the Volvo on a forest track near the facility
- **After**: `facility` scene — Ryan reaches the facility perimeter
- **Story Part**: Set to 17 on entry (infiltration night)

## Narrative Context
After parking in the forest 2km from the facility, Ryan begins moving through the Steckerdoser woods on foot. He's setting up the Meshtastic decoy (Raspberry Pi + cellular modem) when a surveillance drone detects unusual thermal signatures. Multiple quadcopters with thermal imaging converge on his position. Ryan must use his HackRF One to spoof GPS signals and crash/misdirect the drones.

## Scene Phases

### Phase 1: Arrival & Decoy Setup
- Ryan arrives at treeline, dark forest environment
- Hotspot: Set up Meshtastic decoy (Raspberry Pi on fallen tree)
- Educational content about Meshtastic mesh networking and LoRa

### Phase 2: Drone Detection
- Buzzing sound — drone appears overhead
- Thermal camera sweeps the area  
- Ryan must hide behind cover (tree trunk hotspot)
- Educational content about thermal imaging, IR signatures

### Phase 3: GPS Spoofing
- Ryan recognises commercial DJI-style drones — vulnerable to GPS spoofing
- Opens HackRF One from backpack
- Interactive puzzle: configure the GPS spoof
  - Set frequency to 1575.42 MHz (GPS L1 C/A signal)
  - Set power level (too high = detectable, too low = ineffective)
  - Choose spoofed coordinates (200m south — into the swamp)
- Educational content about GPS L1 signal structure, HackRF capabilities, why civilian GPS is vulnerable

### Phase 4: The Spoof
- HackRF transmits fake GPS signals
- Drones' navigation systems override with spoofed coordinates
- Drones drift south, one crashes into trees, others fly into boggy terrain
- Ryan has a clear path to the facility

### Phase 5: Proceed to Facility
- Hotspot: Continue through forest to facility perimeter
- Loads facility scene

## Gameplay Hotspots

| ID | Name | Phase | Action |
|----|------|-------|--------|
| `fallen_tree` | Fallen Tree | 1 | Set up Meshtastic decoy |
| `backpack` | Backpack | 1-3 | Check/use equipment |
| `tree_cover` | Pine Trees | 2 | Hide from drone thermal scan |
| `drone_overhead` | Surveillance Drone | 2-3 | Observe/analyze the drone |
| `hackrf_device` | HackRF One | 3 | Configure GPS spoofing |
| `gps_frequency` | GPS Frequency Dial | 3 | Set L1 frequency (1575.42 MHz) |
| `power_level` | Transmit Power | 3 | Calibrate spoof signal power |
| `spoof_target` | Target Coordinates | 3 | Pick where drones should go |
| `execute_spoof` | Execute Spoof | 3 | Launch the GPS spoof attack |
| `forest_path` | Forest Path | 5 | Proceed to facility |

## Educational Content
- **GPS L1 C/A**: Civilian GPS operates at 1575.42 MHz with no authentication. C/A = Coarse/Acquisition code. Any device can generate fake signals.
- **HackRF One**: Open-source SDR transceiver, 1 MHz–6 GHz. Can transmit as well as receive. Used by researchers and security professionals.
- **GPS Spoofing**: Sending counterfeit GPS signals to deceive receivers. Commercial drones rely on GPS for position hold — corrupt the signal, corrupt the navigation.
- **Thermal Imaging**: FLIR cameras detect infrared radiation (body heat ~37°C). Trees and terrain are cooler. Human silhouette stands out at night.
- **Meshtastic**: LoRa-based mesh network. No infrastructure needed. Messages hop node-to-node. Range: several km per hop. Used for off-grid comms.

## Audio Design
- Forest ambience: wind in pines, distant owl, rustling leaves
- Drone buzzing: synthesized quadcopter rotor noise (increases as drones approach)
- HackRF: electronic chirp/sweep when transmitting
- Drone crash: impact + rotor splutter + silence

## SVG Background
Dark pine forest at night. Moonlight filtering through canopy. Fallen tree in foreground. Forest floor with ferns and pine needles. Distant red lights of facility through trees. Drone searchlight beam cutting through darkness above.
