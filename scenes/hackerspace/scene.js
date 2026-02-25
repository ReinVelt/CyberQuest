/**
 * Hackerspace Drenthe Scene
 * Located in Coevorden, inside a repurposed school building.
 * Workshops: metal working, 3D printing, soldering, CNC plasma/steel/lathe/milling, welding.
 * Accessible after mancave is unlocked (documentary watched).
 */

const HackerspaceScene = {
    id: 'hackerspace',
    name: 'Hackerspace Drenthe',

    background: 'assets/images/scenes/hackerspace.svg',

    description: 'Hackerspace Drenthe — a community maker space in a former school building in Coevorden.',

    playerStart: { x: 90, y: 85 },

    // ── NPC Characters placed at workstations ──────────────────────
    _characters: [
        { name: 'Dennis',  key: 'hacker_male_2',   x: 41, y: 73, scale: 0.075 }, // soldering bench
        { name: 'Sophie',  key: 'hacker_female_1',  x: 84, y: 62, scale: 0.075 }, // 3D printers
        { name: 'Marco',   key: 'hacker_male_1',    x: 12, y: 62, scale: 0.075 }, // CNC area
        { name: 'Kim',     key: 'hacker_female_4',  x: 66, y: 60, scale: 0.075 }, // welding
        { name: 'Joris',   key: 'hacker_male_3',    x: 50, y: 73, scale: 0.075 }, // near electronics
        { name: 'Linda',   key: 'hacker_female_2',  x: 6,  y: 76, scale: 0.075 }, // metal workbench
    ],

    _spawnCharacters: function(game) {
        this._characters.forEach(c => {
            game.showCharacter(c.key, c.x, c.y, c.scale);
        });
    },

    _removeCharacters: function() {
        const container = document.getElementById('scene-characters');
        if (container) {
            container.querySelectorAll('.npc-character').forEach(el => el.remove());
        }
    },

    hotspots: [

        // ── CNC Plasma Cutter ──
        {
            id: 'cnc_plasma',
            name: 'CNC Plasma Cutter',
            x: 6,
            y: 35,
            width: 15,
            height: 25,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A CNC plasma cutter. Cuts through steel plate like butter using an ionised gas jet at 20,000°C.' },
                    { speaker: 'Ryan', text: 'You feed it a DXF file, clamp down the plate, and it traces whatever shape you want. Incredible precision for something that runs on compressed air and electricity.' },
                    { speaker: 'Ryan', text: 'The cutting bed is about 1200 by 800 mm. Not industrial scale, but more than enough for brackets, enclosures, artistic metalwork.' },
                    { speaker: '', text: '📚 PLASMA CUTTING: An electrically conductive gas channel ionises the air between the torch and the workpiece. The plasma arc reaches temperatures up to 22,000°C — hot enough to melt and blow away the metal.' },
                ]);
            }
        },

        // ── CNC Steel Cutter ──
        {
            id: 'cnc_steel',
            name: 'CNC Steel Cutter',
            x: 21,
            y: 35,
            width: 12,
            height: 25,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A CNC milling-type steel cutter. Enclosed chamber with coolant system — cleaner cuts than plasma, but slower.' },
                    { speaker: 'Ryan', text: 'It\'s running right now. 3200 RPM, coolant spraying. Whoever set this job probably left it running overnight.' },
                    { speaker: 'Ryan', text: 'These machines cost serious money. Having one in a community hackerspace is remarkable.' },
                ]);
            }
        },

        // ── CNC Lathe ──
        {
            id: 'cnc_lathe',
            name: 'CNC Lathe',
            x: 30,
            y: 42,
            width: 16,
            height: 18,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A CNC lathe — computer-controlled. The workpiece spins while a cutting tool shapes it with sub-millimetre precision.' },
                    { speaker: 'Ryan', text: 'Perfect for making shafts, bushings, connectors, anything cylindrically symmetric. The chuck rotates at 1200 RPM.' },
                    { speaker: 'Ryan', text: 'Look at those metal shavings curling off — each one is a perfect spiral. There\'s something satisfying about watching a lathe work.' },
                    { speaker: '', text: '📚 CNC LATHE: Computer Numerical Control lathes can produce parts accurate to ±0.01mm. The G-code programs control tool position, feed rate, and spindle speed simultaneously.' },
                ]);
            }
        },

        // ── CNC Milling Machine ──
        {
            id: 'cnc_mill',
            name: 'CNC Milling Machine',
            x: 48,
            y: 39,
            width: 11,
            height: 23,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A CNC milling machine. Three-axis control, reading G-code. The endmill is chewing through aluminium right now.' },
                    { speaker: 'Ryan', text: 'Milling removes material from a stationary workpiece using a rotating cutter. It can create flat surfaces, slots, pockets, complex 3D contours.' },
                    { speaker: 'Ryan', text: 'The DRO reads out position on all three axes. Someone\'s machining what looks like a custom enclosure.' },
                    { speaker: '', text: '📚 CNC MILLING: Modern CNC mills can run unattended, executing hundreds of programmed tool paths. CAM software translates 3D models directly into machining instructions.' },
                ]);
            }
        },

        // ── Welding Station ──
        {
            id: 'welding',
            name: 'Welding Station',
            x: 62,
            y: 40,
            width: 16,
            height: 20,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A MIG/MAG welding station. 180 amps, argon/CO₂ shielding gas, wire feed spool. Red welding curtains on both sides to protect bystanders.' },
                    { speaker: 'Ryan', text: 'Someone\'s been busy — look at that bead. Clean, consistent penetration. A skilled welder works here.' },
                    { speaker: 'Ryan', text: 'They\'ve even got a gas bottle set up. Proper workshop this, not just hobby stuff.' },
                    { speaker: '', text: '📚 MIG/MAG WELDING: Metal Inert/Active Gas welding feeds a continuous wire electrode through a gun. The arc melts both wire and base metal. Shielding gas protects the weld pool from atmospheric contamination.' },
                ]);
            }
        },

        // ── 3D Print Workshop ──
        {
            id: 'printing_3d',
            name: '3D Print Workshop',
            x: 79,
            y: 35,
            width: 19,
            height: 26,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A whole rack of 3D printers. Prusa MK4, Prusa XL, Bambu X1C. All printing simultaneously — the hum of stepper motors and cooling fans.' },
                    { speaker: 'Ryan', text: 'Filament spools in every colour. PLA, PETG, maybe some ABS. The Bambu has an enclosed chamber, probably printing something that needs heat retention.' },
                    { speaker: 'Ryan', text: 'Bottom shelf is full of finished prints. A Benchy — the classic test boat — a gear, a vase, a phone stand, and... is that a skull?' },
                    { speaker: 'Ryan', text: 'Anyone can come here and use these machines. Upload your STL, slice it, print it. That\'s the maker spirit — making together.' },
                    { speaker: '', text: '📚 FDM 3D PRINTING: Fused Deposition Modelling melts thermoplastic filament and deposits it layer by layer. A typical layer height is 0.2mm — meaning a 10cm tall object requires 500 layers. Modern slicers like PrusaSlicer and OrcaSlicer handle the toolpath generation automatically.' },
                ]);
            }
        },

        // ── Soldering Workshop ──
        {
            id: 'soldering',
            name: 'Soldering Workshop',
            x: 35,
            y: 63,
            width: 19,
            height: 10,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The soldering bench. Hakko FX-951, Weller WE1010 — professional-grade stations, both running at 350°C and up.' },
                    { speaker: 'Ryan', text: 'PCBs, components, solder wire. Looks like someone\'s been assembling an ESP32 project. Nice.' },
                    { speaker: 'Ryan', text: 'And that\'s a Rigol DS1054Z oscilloscope. Four channels, 50 MHz bandwidth. The hackerspace\'s best friend for debugging electronics.' },
                    { speaker: '', text: '📚 SOLDERING: Joining electronic components by melting a tin-lead or lead-free alloy (solder) to form a conductive bond. Modern lead-free solder melts at ~217°C. A good soldering iron heats to 350°C for quick, clean joints.' },
                ]);
            }
        },

        // ── Metal Workbench ──
        {
            id: 'metalwork',
            name: 'Metal Workbench',
            x: 2,
            y: 60,
            width: 14,
            height: 16,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A heavy steel workbench with a bench vise, angle grinder, and a full pegboard of hand tools. Hammers, files, wrenches, calipers.' },
                    { speaker: 'Ryan', text: 'This is where you do the manual work — deburring edges, fitting parts, grinding welds smooth. No amount of CNC replaces hands-on metalwork.' },
                    { speaker: 'Ryan', text: 'These calipers are Mitutoyo — someone here takes measurement seriously. 0.01mm resolution.' },
                ]);
            }
        },

        // ── Hackerspace Banner / Sign ──
        {
            id: 'banner',
            name: 'Hackerspace Drenthe',
            x: 38,
            y: 26,
            width: 24,
            height: 6,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: '"Hackerspace Drenthe — Coevorden — Est. 2019 — Open for all makers." That\'s the spirit.' },
                    { speaker: 'Ryan', text: 'A hackerspace is a community workshop where anyone can come and build things. You pay a small membership fee and get access to tools worth tens of thousands of euros.' },
                    { speaker: 'Ryan', text: 'The hacker ethic: access to tools, sharing knowledge, learning by making. These places keep craftsmanship alive.' },
                    { speaker: '', text: '📚 HACKERSPACES: Community-operated workspaces where people share tools, knowledge, and ideas. The movement started in Germany (Chaos Computer Club, 1981) and spread worldwide. The Netherlands has dozens, from Frack in Leeuwarden to Hack42 in Arnhem.' },
                ]);
            }
        },

        // ── Safety Equipment ──
        {
            id: 'safety',
            name: 'Safety Glasses',
            x: 2,
            y: 31,
            width: 4,
            height: 3,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Safety glasses rack. Rule number one in any workshop: protect your eyes. Metal shavings, sparks, UV from welding — all bad for eyeballs.' },
                    { speaker: 'Ryan', text: 'Good that they have these right at the entrance. Safety culture is the mark of a well-run space.' },
                ]);
            }
        },

        // ── First Aid Kit ──
        {
            id: 'first_aid',
            name: 'First Aid Kit',
            x: 78,
            y: 31,
            width: 2,
            height: 3,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'First aid kit. When you work with plasma cutters, angle grinders, and soldering irons, you need one nearby.' },
                ]);
            }
        },

        // ── HSD Logo on Wall ──
        {
            id: 'logo_wall',
            name: 'HSD Logo',
            x: 47,
            y: 44,
            width: 6,
            height: 10,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The Hackerspace Drenthe gear logo, painted right on the wall. HSD. A maker space where you can build anything, from a birdhouse to a CNC-machined drone frame.' },
                ]);
            }
        },

        // ═══════════════════════════════════════════════════════════
        // ── NPC Characters ────────────────────────────────────────
        // ═══════════════════════════════════════════════════════════

        // ── Dennis — at the soldering bench ──
        {
            id: 'npc_dennis',
            name: 'Dennis',
            x: 39,
            y: 63,
            width: 7,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('dennis_talks') || 0;
                game.setFlag('dennis_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Dennis', text: '*adjusts glasses and looks up from the PCB* Oh, hey. Dennis. I keep the soldering stations running around here.' },
                        { speaker: 'Dennis', text: 'Right now I\'m reflowing a LoRa gateway board. TTGO T-Beam with an SX1276 — nice little module. 868 MHz, perfect for Drenthe.' },
                        { speaker: 'Ryan', text: 'LoRa gateway? You\'re building the mesh network infrastructure?' },
                        { speaker: 'Dennis', text: 'We\'ve got twelve nodes across Coevorden already. Solar-powered, mounted on church towers and farm buildings. Coverage is about 80% of the municipality.' },
                        { speaker: 'Dennis', text: 'Want to add another node? I\'ve got spare ESP32 boards. Come to the next soldering workshop — every other Thursday.' },
                    ],
                    [
                        { speaker: 'Dennis', text: '*waves soldering iron for emphasis* You know what most people get wrong about soldering? Temperature.' },
                        { speaker: 'Dennis', text: 'Everyone cranks it to 400°C and wonders why their joints are cold. Use 330°C with good flux and a proper tip. Let the thermal mass do the work.' },
                        { speaker: 'Ryan', text: 'Cold joints at high temperature? That sounds counterintuitive.' },
                        { speaker: 'Dennis', text: 'Too hot burns off the flux before it can clean the surfaces. Then the solder just balls up instead of wetting the pad. Physics, man.' },
                        { speaker: '', text: '📚 SOLDERING TIP: A "cold solder joint" looks dull and grainy instead of shiny. It happens when the pad or component lead wasn\'t heated enough for the solder to flow properly. Ironically, excessive iron temperature makes this worse by destroying the flux.' },
                    ],
                    [
                        { speaker: 'Dennis', text: 'Hey, check this out. Built a spectrum analyser from a Raspberry Pi and an RTL-SDR dongle. Total cost: €35.' },
                        { speaker: 'Dennis', text: 'It scans 24 MHz to 1.7 GHz and displays a waterfall plot. I use it to debug our LoRa network — you can see the chirp spread spectrum signals clear as day.' },
                        { speaker: 'Ryan', text: 'SDR on a Pi? That\'s my kind of project. What software?' },
                        { speaker: 'Dennis', text: 'SDR++. Open source, runs beautifully on the Pi 5. The 2.4 GHz clock is fast enough for real-time demodulation now.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Sophie — at the 3D printers ──
        {
            id: 'npc_sophie',
            name: 'Sophie',
            x: 82,
            y: 52,
            width: 7,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('sophie_talks') || 0;
                game.setFlag('sophie_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Sophie', text: '*looks up from a Prusa printer, screwdriver in hand* Hey! I\'m Sophie. I run the 3D print workshop here.' },
                        { speaker: 'Sophie', text: 'These babies print 24/7. Right now I\'m doing a custom enclosure for a Meshtastic node — weatherproof, UV-resistant PETG, with mounting brackets for a solar panel.' },
                        { speaker: 'Ryan', text: 'Custom enclosures for IoT nodes? That\'s practical engineering.' },
                        { speaker: 'Sophie', text: 'That\'s what a hackerspace IS. Someone needs a bracket, a case, a gear — we model it in FreeCAD and print it. Same day. No waiting for shipping from China.' },
                        { speaker: 'Sophie', text: 'I teach a CAD workshop every first Tuesday of the month. Beginners welcome — we start with a pencil holder and end with parametric designs.' },
                    ],
                    [
                        { speaker: 'Sophie', text: '*holds up a translucent green print* Look. This is a chirp spread spectrum visualisation — 3D-printed from actual captured LoRa data.' },
                        { speaker: 'Sophie', text: 'Dennis gave me the waterfall data, I wrote a Python script to convert it to an STL, and this is the result. You can literally hold radio signals in your hand.' },
                        { speaker: 'Ryan', text: 'That\'s... actually beautiful. Art meets engineering.' },
                        { speaker: 'Sophie', text: 'Exactly! The maker movement isn\'t just about function. We make things beautiful, tactile, personal. Every print tells a story.' },
                        { speaker: '', text: '📚 STL (Standard Tessellation Language): A 3D file format using triangular facets to describe surfaces. Nearly all 3D printers accept STL files. Modern alternatives like 3MF include colour, material, and metadata information.' },
                    ],
                    [
                        { speaker: 'Sophie', text: 'Want to hear something cool? The Bambu X1C can do automatic filament changes. Four colours in one print, no manual intervention.' },
                        { speaker: 'Sophie', text: 'I printed the Hackerspace Drenthe gear logo in four-colour PETG. It\'s on the wall behind you.' },
                        { speaker: 'Ryan', text: 'The big gear logo? I thought that was painted!' },
                        { speaker: 'Sophie', text: '*grins* Nope. 620mm diameter, printed in 16 sections, glued together. 43 hours of print time total. My personal record.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Marco — in the CNC area ──
        {
            id: 'npc_marco',
            name: 'Marco',
            x: 10,
            y: 52,
            width: 7,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('marco_talks') || 0;
                game.setFlag('marco_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Marco', text: '*pulls down ear protection* Yo! Marco. I\'m the CNC guy. Plasma, lathe, mill — if it cuts metal, I operate it.' },
                        { speaker: 'Marco', text: 'Right now I\'m cutting brackets for the LoRa gateway mounts. Dennis designs the electronics, Sophie prints the enclosures, and I cut the mounting hardware.' },
                        { speaker: 'Ryan', text: 'A full production pipeline inside a hackerspace?' },
                        { speaker: 'Marco', text: 'That\'s what happens when maker skills combine. Electronics, 3D printing, metalwork — each discipline makes the others better.' },
                        { speaker: 'Marco', text: 'The plasma cutter does the rough shapes, then the mill does precision work. 0.05mm tolerance on the mounting holes. Try getting THAT from a hobby drill press.' },
                    ],
                    [
                        { speaker: 'Marco', text: '*shows phone screen* Check out this DXF I drew. It\'s a custom antenna mount for the church tower in Dalen.' },
                        { speaker: 'Marco', text: 'The pastor said we could mount a LoRa gateway on the tower, but we needed a bracket that fits the 200-year-old stonework without drilling. So I designed a clamp system.' },
                        { speaker: 'Ryan', text: 'Mounting modern mesh networking equipment on a medieval church tower. That\'s quite the combination.' },
                        { speaker: 'Marco', text: '*laughs* Welcome to Drenthe. We make it work with what we have. The tower gives us 30 metres of height — the range is incredible from up there.' },
                        { speaker: '', text: '📚 DXF (Drawing Exchange Format): An Autodesk format for 2D CAD drawings. CNC machines read DXF files to trace cutting paths. The format stores vectors as lines, arcs, and polylines — perfect for plasma and laser cutters.' },
                    ],
                    [
                        { speaker: 'Marco', text: 'Fun fact: this CNC plasma cutter was built by hackerspace members. We bought the stepper motors online, welded the frame ourselves, and Dennis wrote the GRBL firmware.' },
                        { speaker: 'Marco', text: 'Total cost: about €2000. A commercial machine with these specs runs €15,000 easy.' },
                        { speaker: 'Ryan', text: 'You built your own CNC machine? From scratch?' },
                        { speaker: 'Marco', text: 'That\'s hackerspace philosophy, man. Why buy it when you can build it better? We know every bolt, every motor step, every line of code.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Kim — at the welding station ──
        {
            id: 'npc_kim',
            name: 'Kim',
            x: 64,
            y: 50,
            width: 7,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('kim_talks') || 0;
                game.setFlag('kim_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Kim', text: '*flips up welding helmet* Kim. I do the welding and the heavy fabrication. Don\'t let the leather jacket fool you — I\'m certified MIG, TIG, and stick.' },
                        { speaker: 'Kim', text: 'Right now I\'m building a solar panel frame for a LoRa gateway. Galvanised steel, 40x40mm box section. It\'ll survive any Drenthe storm.' },
                        { speaker: 'Ryan', text: 'That\'s a serious frame. How many of these have you made?' },
                        { speaker: 'Kim', text: 'Seven so far. Each one custom-fitted to the installation site. The church tower ones are different from the farm building ones. You can\'t just bolt a standard bracket onto a 17th-century ridge beam.' },
                    ],
                    [
                        { speaker: 'Kim', text: '*taps the welding table* You know what I love about MIG welding? It\'s honest. You can see immediately if the joint is good or bad.' },
                        { speaker: 'Kim', text: 'A good weld bead is smooth, consistent, with even ripples. Bad weld? Porosity, undercut, spatter. The metal doesn\'t lie.' },
                        { speaker: 'Ryan', text: 'You sound like you take this seriously.' },
                        { speaker: 'Kim', text: 'Dead serious. A bad weld on a LoRa mast at 30 metres? That\'s a safety issue. I X-ray my structural welds. Marco thinks I\'m crazy, but I sleep well.' },
                        { speaker: '', text: '📚 WELD INSPECTION: Non-destructive testing (NDT) methods include visual inspection, dye penetrant testing, ultrasonic testing, and radiographic (X-ray) examination. Each reveals different defect types — surface cracks, porosity, lack of fusion, or inclusions.' },
                    ],
                    [
                        { speaker: 'Kim', text: 'I also teach the safety courses here. Workshop safety is non-negotiable.' },
                        { speaker: 'Kim', text: 'New members get a two-hour induction: eye protection, hearing protection, fire extinguisher locations, emergency stop buttons, proper lifting technique.' },
                        { speaker: 'Kim', text: 'Last year some kid tried to use the angle grinder in flip-flops. *shakes head* Not on my watch.' },
                        { speaker: 'Ryan', text: 'Safety culture. The mark of a professional workshop.' },
                        { speaker: 'Kim', text: 'Exactly. We\'re hackers, not cowboys. You can innovate AND be safe.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Joris — near the electronics area ──
        {
            id: 'npc_joris',
            name: 'Joris',
            x: 48,
            y: 63,
            width: 7,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('joris_talks') || 0;
                game.setFlag('joris_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Joris', text: '*pushes glasses up, closes laptop* Hey there. Joris. I\'m the software guy in a hardware space.' },
                        { speaker: 'Joris', text: 'I maintain the hackerspace\'s internal network, the wiki, the member management system. All self-hosted on a Proxmox cluster of refurbished Dell servers.' },
                        { speaker: 'Ryan', text: 'Self-hosted everything? Running what OS?' },
                        { speaker: 'Joris', text: '*points at hoodie* What do you think? Arch Linux on the servers, NixOS on my workstation. BTW, I use Arch.' },
                        { speaker: 'Ryan', text: '*smiles* Of course you do.' },
                        { speaker: 'Joris', text: 'I also wrote the firmware for our access control system. ESP32, RFID reader, MQTT to Home Assistant. Members badge in, the system logs who\'s in the building. Fire safety regulation.' },
                    ],
                    [
                        { speaker: 'Joris', text: 'Want to see something neat? *opens terminal* This is our Grafana dashboard. Real-time data from all twelve LoRa nodes across Coevorden.' },
                        { speaker: 'Joris', text: 'Signal strength, packet loss, battery voltage, temperature. Every five minutes, each node phones home. I store it in InfluxDB and visualise it here.' },
                        { speaker: 'Ryan', text: 'You\'re monitoring the entire mesh network from here?' },
                        { speaker: 'Joris', text: 'Not just monitoring — alerting. If a node drops offline for more than 30 minutes, I get a Telegram notification. Usually it\'s a solar panel covered in bird poop. Yes, that happens.' },
                        { speaker: '', text: '📚 GRAFANA + INFLUXDB: A common monitoring stack. InfluxDB is a time-series database optimised for sensor data. Grafana provides beautiful dashboards with real-time graphs, alerts, and annotations. Together they power most IoT monitoring setups.' },
                    ],
                    [
                        { speaker: 'Joris', text: 'I\'m also working on a MeshCore repeater firmware fork. Added over-the-air updates so we don\'t have to climb church towers every time we push a bug fix.' },
                        { speaker: 'Joris', text: 'The trick is keeping the update payload under 100KB so it fits in a single LoRa transmission burst. Differential updates, compressed with zstd.' },
                        { speaker: 'Ryan', text: 'OTA updates over LoRa? That\'s ambitious with the low bandwidth.' },
                        { speaker: 'Joris', text: 'At SF7 on 868 MHz, we get about 5.5 kbps. A 100KB update takes about 150 seconds. Not fast, but way faster than driving to Dalen with a USB cable.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Linda — at the metal workbench ──
        {
            id: 'npc_linda',
            name: 'Linda',
            x: 4,
            y: 66,
            width: 7,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('linda_talks') || 0;
                game.setFlag('linda_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Linda', text: '*sets down coffee mug and adjusts reading glasses* Oh, hello dear. I\'m Linda. I\'m the bookkeeper — and the unofficial den mother of this place.' },
                        { speaker: 'Linda', text: 'I handle the finances, the insurance, the building lease. Someone has to make sure the lights stay on while these lot play with their toys.' },
                        { speaker: 'Ryan', text: 'The business side of a hackerspace?' },
                        { speaker: 'Linda', text: 'It\'s a foundation — Stichting Hackerspace Drenthe. We have 43 paying members, a municipal subsidy, and the occasional corporate workshop. Budget is tight but we make it work.' },
                        { speaker: 'Linda', text: 'I also manage our grant applications. Last year we got €12,000 from the province for STEM education workshops for secondary school kids. That funded the Bambu printer.' },
                    ],
                    [
                        { speaker: 'Linda', text: '*sips coffee* You know what nobody talks about with hackerspaces? Community. These young people — Dennis, Sophie, Marco — they\'d be sitting alone at home otherwise.' },
                        { speaker: 'Linda', text: 'Here they build things together, teach each other, argue about Linux distributions. It\'s a family. A loud, nerdy, slightly dangerous family.' },
                        { speaker: 'Ryan', text: 'That sounds like the original hacker ethic. Community through building.' },
                        { speaker: 'Linda', text: 'My late husband was an electronics technician at Philips. He\'d have loved this place. I joined after he passed — to keep busy, to learn. Now I can solder better than most of them, and I\'m 63.' },
                        { speaker: 'Linda', text: '*winks* Don\'t tell Dennis I said that. His ego is fragile.' },
                    ],
                    [
                        { speaker: 'Linda', text: 'We\'re planning an open day next month. Want to help spread the word?' },
                        { speaker: 'Linda', text: 'We\'ll have live demos of the CNC machines, a 3D printing workshop, a soldering course for beginners, and Joris is doing a LoRa network demo.' },
                        { speaker: 'Ryan', text: 'Sounds great. How do people usually find out about this place?' },
                        { speaker: 'Linda', text: 'Word of mouth, mostly. And our website — Joris keeps it running on a Raspberry Pi in the server room. *laughs* Yes, we have a server room. It\'s actually a broom closet.' },
                    ],
                    [
                        { speaker: 'Linda', text: '*thoughtful look* You know, you remind me of someone. A couple of years ago, a young German woman visited one of our Tuesday presentations.' },
                        { speaker: 'Linda', text: 'Eva, I think her name was. Very sharp, very technical. She asked Dennis all sorts of questions about LoRa security, mesh networking, off-grid communication.' },
                        { speaker: 'Ryan', text: 'German? I don\'t remember that.' },
                        { speaker: 'Linda', text: 'You weren\'t here that evening. She only came once, but she made an impression. Said she was in the area visiting friends. Something about a dog training session?' },
                        { speaker: 'Linda', text: 'Funny — I remember because she asked about you specifically. "Is the radio guy here tonight?" Dennis told her you\'d probably be at the next meeting, but she never came back.' },
                        { speaker: 'Ryan', text: '...' },
                        { speaker: 'Linda', text: 'Nice lady though. Had a rescue dog with her in the car. Black Shepherd mix, if I remember right. *smiles* I always remember the dogs.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Exit Door → drive back home ──
        {
            id: 'exit_door',
            name: '← Drive Home',
            x: 95,
            y: 39,
            width: 5,
            height: 22,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Time to head home. Good session tonight.' }
                ], function() {
                    game.setFlag('driving_destination', 'home_from_hackerspace');
                    game.loadScene('driving_day');
                });
            }
        },

        // ── Classroom Door ──
        {
            id: 'classroom_door',
            name: 'Classroom →',
            x: 46,
            y: 39,
            width: 7,
            height: 22,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            targetScene: 'hackerspace_classroom'
        }
    ],

    onEnter: function(game) {
        // Clear any leftover NPC characters
        this._removeCharacters();

        // Spawn the workshop crew
        setTimeout(() => { this._spawnCharacters(game); }, 200);

        if (!game.getFlag('visited_hackerspace')) {
            game.setFlag('visited_hackerspace', true);
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Hackerspace Drenthe in Coevorden. Housed in an old school building — high ceilings, big windows, concrete floor.' },
                    { speaker: 'Ryan', text: 'The smell of machine oil and solder flux. CNC machines humming, 3D printers clicking away, the occasional arc flash from the welding station.' },
                    { speaker: 'Ryan', text: 'And people. Makers, hackers, builders — each at their workstation, deep in their projects. This is where things get made.' },
                    { speaker: 'Ryan', text: 'This is where people build things. Real things, with real tools. I love it.' },
                ]);
            }, 500);
        } else {
            setTimeout(() => {
                const greetings = [
                    [{ speaker: 'Ryan', text: 'Back at the hackerspace. The crew\'s all here tonight.' }],
                    [{ speaker: 'Ryan', text: 'Hackerspace Drenthe. The machines are running, the coffee is flowing.' }],
                    [{ speaker: 'Ryan', text: 'The familiar hum of stepper motors and the smell of solder flux. Good to be back.' }],
                ];
                game.startDialogue(greetings[Math.floor(Math.random() * greetings.length)]);
            }, 500);
        }
    },

    _startAmbientAudio: function(game) {
        if (this._ambientRunning) return;
        this._ambientRunning = true;
        const ctx = game.audioContext || (game.audioContext = new (window.AudioContext || window.webkitAudioContext)());

        // Low machine hum (CNC background)
        const hum = ctx.createOscillator();
        hum.type = 'sawtooth';
        hum.frequency.value = 60;
        const humGain = ctx.createGain();
        humGain.gain.value = 0.015;
        hum.connect(humGain).connect(ctx.destination);
        hum.start();

        // Higher whine (spindle)
        const whine = ctx.createOscillator();
        whine.type = 'sine';
        whine.frequency.value = 1200;
        const whineGain = ctx.createGain();
        whineGain.gain.value = 0.008;
        whine.connect(whineGain).connect(ctx.destination);
        whine.start();

        // Periodic clicking (3D printer stepper motors)
        const clickInterval = setInterval(() => {
            if (!this._ambientRunning) { clearInterval(clickInterval); return; }
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.value = 800 + Math.random() * 400;
            const g = ctx.createGain();
            g.gain.value = 0.01;
            g.gain.setTargetAtTime(0, ctx.currentTime + 0.02, 0.01);
            osc.connect(g).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        }, 150 + Math.random() * 100);

        this._ambientNodes = [hum, whine];
        this._ambientGains = [humGain, whineGain];
        this._clickInterval = clickInterval;
    },

    _stopAmbientAudio: function() {
        this._ambientRunning = false;
        if (this._ambientNodes) {
            this._ambientNodes.forEach(n => { try { n.stop(); } catch(e) {} });
        }
        if (this._clickInterval) clearInterval(this._clickInterval);
        this._ambientNodes = null;
        this._ambientGains = null;
    },

    onExit: function() {
        this._removeCharacters();
        this._stopAmbientAudio();
    }
};

if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(HackerspaceScene);
}
