/**
 * Hackerspace Classroom Scene — HOLLYWOOD EDITION
 * A former school classroom used for presentations.
 * Each visit triggers a different presentation topic.
 *
 * Dynamic features:
 *   • Audience members fidget / shift in seats (subtle movement)
 *   • Ambient audio: crowd murmur, laptop typing, chair creaks, projector fan
 *   • Presentation slides auto-advance with TTS voice reading
 *   • Audience reactions (nodding emoji, hand-raise, applause)
 *   • Projector flicker / laser pointer dot VFX
 */

const HackerspaceClassroomScene = {
    id: 'hackerspace_classroom',
    name: 'Hackerspace Classroom',

    background: 'assets/images/scenes/hackerspace_classroom.svg',

    description: 'The old classroom — now used for hackerspace presentations and workshops.',

    playerStart: { x: 5, y: 90 },

    // ── All possible seat positions (row, x%, y%) ──────────────────
    // Defined as percentage positions matching the 4 rows of chairs
    _seatPositions: [
        // Row 1 (front, y≈66%)
        { x: 13.5, y: 66 }, { x: 17.5, y: 66 }, { x: 20, y: 66 },
        { x: 24, y: 66 }, { x: 27, y: 66 }, { x: 31, y: 66 },
        { x: 35, y: 66 }, { x: 38.5, y: 66 }, { x: 44, y: 66 },
        { x: 48, y: 66 }, { x: 53, y: 66 }, { x: 57, y: 66 },
        { x: 63, y: 66 }, { x: 67, y: 66 }, { x: 72, y: 66 },
        { x: 76, y: 66 }, { x: 80, y: 66 }, { x: 84, y: 66 },
        // Row 2 (y≈73%)
        { x: 15, y: 73 }, { x: 19.5, y: 73 }, { x: 24, y: 73 },
        { x: 29, y: 73 }, { x: 34, y: 73 }, { x: 39, y: 73 },
        { x: 44, y: 73 }, { x: 49, y: 73 }, { x: 54, y: 73 },
        { x: 60, y: 73 }, { x: 65, y: 73 }, { x: 70, y: 73 },
        { x: 76, y: 73 }, { x: 82, y: 73 },
        // Row 3 (y≈80.5%)
        { x: 14, y: 80.5 }, { x: 18.5, y: 80.5 }, { x: 23, y: 80.5 },
        { x: 28.5, y: 80.5 }, { x: 34, y: 80.5 }, { x: 40, y: 80.5 },
        { x: 46.5, y: 80.5 }, { x: 53, y: 80.5 }, { x: 59, y: 80.5 },
        { x: 65, y: 80.5 }, { x: 71, y: 80.5 }, { x: 78, y: 80.5 },
        // Row 4 (back, y≈88%)
        { x: 16, y: 88 }, { x: 22, y: 88 }, { x: 28.5, y: 88 },
        { x: 35.5, y: 88 }, { x: 43, y: 88 }, { x: 50, y: 88 },
        { x: 57, y: 88 }, { x: 64, y: 88 }, { x: 72, y: 88 },
        { x: 80, y: 88 },
    ],

    // ── Appearance variations for audience members ──────────────────
    // Character SVG keys for anonymous background audience
    _audienceSprites: [
        'hacker_male_1',    // Marco look
        'hacker_male_2',    // Dennis look
        'hacker_male_3',    // Joris look
        'hacker_male_4',    // Pieter look
        'hacker_female_1',  // Sophie look
        'hacker_female_2',  // Linda look
        'hacker_female_3',  // Aisha look
        'hacker_female_4',  // Kim look
    ],

    // Named characters placed at fixed seats (front two rows) with dialogue
    _namedAudience: [
        { name: 'Pieter',  key: 'hacker_male_4',   seat: { x: 24, y: 66 },  scale: 0.06 },
        { name: 'Aisha',   key: 'hacker_female_3',  seat: { x: 48, y: 66 },  scale: 0.06 },
        { name: 'Marco',   key: 'hacker_male_1',    seat: { x: 72, y: 66 },  scale: 0.06 },
        { name: 'Kim',     key: 'hacker_female_4',  seat: { x: 34, y: 73 },  scale: 0.06 },
        { name: 'Joris',   key: 'hacker_male_3',    seat: { x: 60, y: 73 },  scale: 0.06 },
    ],

    // ── Presentation topics ────────────────────────────────────────
    _presentations: [
        {
            title: 'LoRa & LoRaWAN',
            presenter: 'Jan-Willem',
            dialogue: [
                { speaker: '', text: '*A presentation is underway. The projector shows a slide about long-range radio.*' },
                { speaker: 'Presenter', text: '"LoRa stands for Long Range. It\'s a radio modulation technique using chirp spread spectrum — the frequency sweeps up or down over time."' },
                { speaker: 'Presenter', text: '"A single LoRa gateway can cover 10-15 kilometres in rural areas like Drenthe. In cities it\'s more like 2-5 km, but out here? Perfect conditions."' },
                { speaker: 'Presenter', text: '"LoRaWAN adds the network layer on top. Your sensor node sends data to a gateway, the gateway forwards it to a network server via the internet, and your application receives it."' },
                { speaker: 'Presenter', text: '"In Europe we use the 868 MHz ISM band. You get 14 dBm transmit power, duty cycle limited to 1%. That sounds restrictive, but for sensor data — temperature, humidity, soil moisture — it\'s more than enough."' },
                { speaker: '', text: '📚 LoRa uses Semtech\'s SX1276/SX1262 chips. The spreading factor (SF7-SF12) trades data rate for range. SF12 gives maximum range (~15km line-of-sight) but only 250 bits per second. SF7 gives ~11 kbps but shorter range.' },
                { speaker: 'Presenter', text: '"The Things Network provides free LoRaWAN infrastructure. Anyone can deploy a gateway. We have three in the Coevorden area alone."' },
                { speaker: 'Ryan', text: 'Interesting. Long-range, low-power radio. You could monitor an entire farm with a handful of battery-powered sensors and one gateway.' },
            ]
        },
        {
            title: 'Meshtastic',
            presenter: 'Daan',
            dialogue: [
                { speaker: '', text: '*The projector shows a map with interconnected nodes forming a mesh network.*' },
                { speaker: 'Presenter', text: '"Meshtastic is an open-source mesh networking project. It runs on cheap ESP32 boards with LoRa radios — devices like the Heltec V3 or LilyGO T-Beam."' },
                { speaker: 'Presenter', text: '"No internet required. No cell towers. No infrastructure at all. Each node relays messages to every other node within range, and those nodes relay further. A true peer-to-peer mesh."' },
                { speaker: 'Presenter', text: '"You can send text messages, GPS positions, telemetry data. The range between two nodes? Easily 5-10 km with a simple antenna. With a good antenna on a high point, we\'ve hit 80 km."' },
                { speaker: '', text: '📚 Meshtastic uses 868 MHz (EU) or 915 MHz (US) LoRa radio. Each node has a unique ID. Messages are encrypted with AES-256. The mesh can have up to 80+ nodes. Battery life on a single 18650 cell can be days to weeks depending on settings.' },
                { speaker: 'Presenter', text: '"The killer feature: it works when everything else fails. Power outage? Cell towers down? Meshtastic still works. It\'s the ultimate off-grid communication tool."' },
                { speaker: 'Ryan', text: 'Off-grid, encrypted mesh networking. No infrastructure needed. That\'s exactly the kind of resilient communication you\'d want if someone took down the regular networks...' },
            ]
        },
        {
            title: 'MeshCore',
            presenter: 'Femke',
            dialogue: [
                { speaker: '', text: '*The slide shows a network topology diagram with "store and forward" highlighted.*' },
                { speaker: 'Presenter', text: '"MeshCore is a next-generation mesh firmware, inspired by Meshtastic but built from scratch. The big difference? Store-and-forward repeaters."' },
                { speaker: 'Presenter', text: '"In Meshtastic, if two nodes can\'t reach each other and no relay is online, the message is lost. MeshCore repeaters store messages and forward them when the recipient comes within range."' },
                { speaker: 'Presenter', text: '"Think of it like post offices. Your message hops between repeaters, waiting at each one until the next hop is available. Delay-tolerant networking."' },
                { speaker: '', text: '📚 MeshCore supports multiple radio bands and can use different LoRa parameters per link. It implements a managed mesh topology rather than flooding, which reduces airtime and improves scalability compared to Meshtastic\'s approach.' },
                { speaker: 'Presenter', text: '"We\'re deploying solar-powered MeshCore repeaters on church towers across Drenthe. Even without internet, messages can cross the entire province."' },
                { speaker: 'Ryan', text: 'Store-and-forward across church towers. A mesh network that covers rural Drenthe with zero internet dependency. Clever engineering.' },
            ]
        },
        {
            title: 'Home Automation',
            presenter: 'Erik',
            dialogue: [
                { speaker: '', text: '*The screen shows a Home Assistant dashboard with temperature graphs, light controls, and energy monitoring.*' },
                { speaker: 'Presenter', text: '"Home Assistant is an open-source home automation platform. It runs on a Raspberry Pi or any small server. It integrates with over 2000 different devices and services."' },
                { speaker: 'Presenter', text: '"The key protocols: Zigbee for sensors and lights — it\'s low-power mesh networking at 2.4 GHz. Z-Wave for more reliable, less crowded communication. And MQTT as the universal message broker."' },
                { speaker: 'Presenter', text: '"My house has 47 sensors. Temperature, humidity, motion, door/window contacts, energy meters, water flow. Everything feeds into Home Assistant via a Zigbee coordinator."' },
                { speaker: '', text: '📚 MQTT (Message Queuing Telemetry Transport) is a lightweight publish/subscribe protocol. Devices publish messages to topics (e.g., "home/livingroom/temperature") and subscribers receive them. It\'s the backbone of most IoT systems.' },
                { speaker: 'Presenter', text: '"Automation example: when CO₂ exceeds 800 ppm, open the ventilation. When nobody\'s home, drop heating to 15°C. When electricity price goes negative — yes, that happens — charge the battery and turn on the boiler."' },
                { speaker: 'Ryan', text: 'MQTT, Zigbee, local processing. No cloud dependency. That\'s how you build a smart home that\'s actually under your control.' },
            ]
        },
        {
            title: 'Cybersecurity Fundamentals',
            presenter: 'Sophie',
            dialogue: [
                { speaker: '', text: '*The projector displays terminal output showing a network scan. The room is silent with attention.*' },
                { speaker: 'Presenter', text: '"Let\'s start with the basics. Every device on your network has an IP address and open ports. Each open port is a potential attack surface. Step one: know what\'s running."' },
                { speaker: 'Presenter', text: '"nmap -sV 192.168.1.0/24 — that scans your entire local network. You\'d be surprised what you find. Smart TVs running telnet, printers with open admin panels, IoT devices with default passwords."' },
                { speaker: 'Presenter', text: '"Defence in depth: network segmentation. Put your IoT devices on a separate VLAN. Your smart lightbulb should never be able to reach your file server."' },
                { speaker: '', text: '📚 DEFENCE IN DEPTH: A cybersecurity strategy using multiple layers of security controls. If one layer fails, others still protect the system. Layers include: network segmentation, firewalls, intrusion detection, encryption, authentication, and physical security.' },
                { speaker: 'Presenter', text: '"Encryption everywhere. HTTPS, WPA3, VPN tunnels, SSH keys instead of passwords. If it\'s not encrypted, assume someone is reading it."' },
                { speaker: 'Presenter', text: '"And social engineering — the human layer. The strongest encryption in the world won\'t help if someone clicks a phishing link. Training people is as important as configuring firewalls."' },
                { speaker: 'Ryan', text: 'Network segmentation, encryption, human awareness. The three pillars. She\'s right about IoT devices — they\'re often the weakest link in a home network.' },
            ]
        },
        {
            title: 'Blockchain & Decentralisation',
            presenter: 'Thomas',
            dialogue: [
                { speaker: '', text: '*A diagram of linked blocks appears on screen, each containing a hash of the previous block.*' },
                { speaker: 'Presenter', text: '"A blockchain is a distributed ledger. Every participant holds a complete copy. To add a new block, the network must reach consensus — no single authority decides what\'s true."' },
                { speaker: 'Presenter', text: '"The key insight: cryptographic hashing. Each block contains the hash of the previous block. Change one byte in any historical block, and every subsequent hash breaks. Tampering is immediately visible."' },
                { speaker: 'Presenter', text: '"Bitcoin uses proof-of-work — mining. Ethereum moved to proof-of-stake. But the real innovation isn\'t cryptocurrency. It\'s smart contracts: programs that execute automatically when conditions are met."' },
                { speaker: '', text: '📚 HASH FUNCTIONS: A cryptographic hash (e.g., SHA-256) takes any input and produces a fixed-size output. It\'s one-way (can\'t reverse it), deterministic (same input = same output), and collision-resistant (nearly impossible to find two inputs with the same hash).' },
                { speaker: 'Presenter', text: '"Use cases beyond crypto: supply chain verification, digital identity, voting systems, decentralised storage. Anywhere you need trustless verification between parties who don\'t know each other."' },
                { speaker: 'Ryan', text: 'Distributed consensus, cryptographic verification, trustless systems. The mathematics are solid. The applications beyond cryptocurrency are where it gets interesting.' },
            ]
        },
        {
            title: 'AI & Machine Learning',
            presenter: 'Lisa',
            dialogue: [
                { speaker: '', text: '*The projector shows a neural network diagram with interconnected nodes across multiple layers.*' },
                { speaker: 'Presenter', text: '"Machine learning is pattern recognition at scale. You feed a neural network millions of examples, and it learns to recognise patterns no human could explicitly program."' },
                { speaker: 'Presenter', text: '"A neural network is layers of mathematical functions. Input layer, hidden layers, output layer. Each connection has a weight. Training adjusts those weights using backpropagation — working backwards from the error."' },
                { speaker: 'Presenter', text: '"Large Language Models like GPT are transformer architectures trained on billions of text tokens. The key innovation: attention mechanisms. The model learns which words in a sentence are most relevant to each other."' },
                { speaker: '', text: '📚 TRANSFORMER ARCHITECTURE: Introduced in the 2017 paper "Attention Is All You Need". Uses self-attention to process all positions in a sequence simultaneously rather than sequentially. This parallelism enabled training on massive datasets, leading to GPT, BERT, and other foundation models.' },
                { speaker: 'Presenter', text: '"Running AI locally: you can run open-source models on your own hardware. Llama, Mistral, Phi — models that fit on a laptop with 16GB RAM. No cloud, no data sharing. Private AI."' },
                { speaker: 'Presenter', text: '"But remember: AI is a tool, not magic. It hallucinates. It reflects biases in training data. Always verify. Always think critically about outputs."' },
                { speaker: 'Ryan', text: 'Transformer attention, local inference, critical evaluation of outputs. Good overview. Running models locally means your data stays yours — important for anything security-related.' },
            ]
        },
        {
            title: 'Software Defined Radio',
            presenter: 'Martijn',
            dialogue: [
                { speaker: '', text: '*The screen shows a waterfall display with colourful signal traces across the RF spectrum.*' },
                { speaker: 'Presenter', text: '"Software Defined Radio — SDR — replaces hardware radio components with software. Instead of a fixed-frequency receiver, you get a programmable window into the entire radio spectrum."' },
                { speaker: 'Presenter', text: '"An RTL-SDR dongle costs €25. It covers 25 MHz to 1.7 GHz. That\'s FM radio, aircraft transponders, weather satellites, ISM band devices, pagers, and much more."' },
                { speaker: 'Presenter', text: '"With GNU Radio or SDR++ you can demodulate almost any signal. FM, AM, SSB, digital modes like DMR, P25, TETRA. You can even decode weather satellite images — NOAA APT and Meteor LRPT."' },
                { speaker: '', text: '📚 SDR BASICS: A traditional radio has fixed hardware for each frequency and modulation type. SDR digitises the raw radio signal and processes it in software. This means one device can receive anything within its frequency range. Higher-end SDRs like the HackRF can also transmit.' },
                { speaker: 'Presenter', text: '"For LoRa analysis, SDR is invaluable. You can see the chirp spread spectrum signals on a waterfall display. You can monitor your own LoRaWAN traffic, debug range issues, detect interference."' },
                { speaker: 'Ryan', text: 'SDR for €25. I use mine constantly. Being able to see the entire radio spectrum is like having X-ray vision for electromagnetic waves.' },
            ]
        },
        {
            title: 'MQTT & Node-RED',
            presenter: 'Pieter',
            dialogue: [
                { speaker: '', text: '*Node-RED flow diagrams fill the screen — colourful blocks connected by wires.*' },
                { speaker: 'Presenter', text: '"MQTT is the glue of IoT. A lightweight message broker. Devices publish to topics, other devices subscribe. The broker — usually Mosquitto — handles all the routing."' },
                { speaker: 'Presenter', text: '"Topic structure matters. Use hierarchy: home/floor1/bedroom/temperature. Then you can subscribe to home/# for everything, or home/floor1/+ /temperature for all floor 1 temperatures."' },
                { speaker: 'Presenter', text: '"Node-RED is visual programming for IoT. Built on Node.js. You wire together input nodes, processing nodes, and output nodes. No coding required for simple flows — but you can add JavaScript when needed."' },
                { speaker: '', text: '📚 MQTT QoS LEVELS: QoS 0 = fire and forget (no guarantee). QoS 1 = at least once (may duplicate). QoS 2 = exactly once (most reliable, most overhead). For sensor data, QoS 0 is usually fine. For commands, use QoS 1 or 2.' },
                { speaker: 'Presenter', text: '"Example flow: MQTT temperature sensor → threshold check → if above 25°C → send Telegram notification AND turn on fan via MQTT. Five nodes, zero lines of code."' },
                { speaker: 'Ryan', text: 'MQTT for message routing, Node-RED for visual logic. Together they can automate almost anything. And it all runs on a Raspberry Pi.' },
            ]
        },
        {
            title: 'Zigbee & Matter',
            presenter: 'Anke',
            dialogue: [
                { speaker: '', text: '*A slide comparing wireless protocols: Zigbee, Z-Wave, Thread, Matter, Wi-Fi, Bluetooth.*' },
                { speaker: 'Presenter', text: '"Zigbee is a mesh networking protocol at 2.4 GHz. Low power, low data rate — perfect for sensors and actuators. A Zigbee network can have hundreds of devices routing through each other."' },
                { speaker: 'Presenter', text: '"The problem was fragmentation. Philips Hue Zigbee, IKEA TRÅDFRI Zigbee, Aqara Zigbee — all slightly different profiles. Devices from different vendors didn\'t always play nice."' },
                { speaker: 'Presenter', text: '"Matter is the industry\'s answer. It\'s an application layer that works over Thread, Wi-Fi, and Ethernet. Apple, Google, Amazon, Samsung — everyone agreed on one standard."' },
                { speaker: '', text: '📚 THREAD: An IPv6-based mesh networking protocol for IoT. Uses the same 802.15.4 radio as Zigbee but with standard IP networking. Thread Border Routers bridge the mesh to your home IP network. Matter runs on top of Thread for low-power mesh devices.' },
                { speaker: 'Presenter', text: '"My recommendation: Zigbee2MQTT. It works with a €10 CC2652 coordinator and supports over 3000 devices. Local only, no cloud. Pair it with Home Assistant and you\'re set."' },
                { speaker: 'Ryan', text: 'Zigbee mesh, Thread for IP connectivity, Matter for interoperability. The IoT protocol stack is maturing. Local processing keeps everything under your control.' },
            ]
        },
        {
            title: 'Raspberry Pi & Embedded Linux',
            presenter: 'Wouter',
            dialogue: [
                { speaker: '', text: '*A Raspberry Pi 5 sits on the presenter\'s desk, connected to an HDMI display showing a terminal.*' },
                { speaker: 'Presenter', text: '"The Raspberry Pi changed everything. A full Linux computer for €40. GPIO pins for hardware interfacing. A massive community, endless tutorials, and software for every use case."' },
                { speaker: 'Presenter', text: '"The Pi 5 has a quad-core Cortex-A76 at 2.4 GHz, up to 8 GB RAM, PCIe, dual HDMI. It can run Home Assistant, Pi-hole, a media server, a Node-RED instance — all simultaneously."' },
                { speaker: 'Presenter', text: '"For headless deployment: flash an SD card with Raspberry Pi OS Lite. Enable SSH. Set a static IP. Done. You can manage it entirely remotely."' },
                { speaker: '', text: '📚 GPIO (General Purpose Input/Output): The Pi\'s 40-pin header provides digital I/O, I2C, SPI, UART, and PWM. You can read sensors, drive relays, communicate with LoRa modules, control servos — bridging the digital and physical worlds.' },
                { speaker: 'Presenter', text: '"Docker on the Pi is a game changer. Run each service in its own container: Mosquitto, Grafana, InfluxDB, Zigbee2MQTT. Isolated, reproducible, easy to update."' },
                { speaker: 'Ryan', text: 'A €40 computer running Docker containers for home automation, ad blocking, and mesh gateway duties. The Pi is the Swiss army knife of the maker world.' },
            ]
        },
        {
            title: 'Antenna Design for LoRa',
            presenter: 'Henk',
            dialogue: [
                { speaker: '', text: '*The whiteboard is covered in antenna radiation patterns and impedance calculations.*' },
                { speaker: 'Presenter', text: '"Your LoRa node\'s antenna matters more than its transmit power. A good antenna can give you 6-9 dBi gain. That\'s like multiplying your power by 4-8x — for free."' },
                { speaker: 'Presenter', text: '"For 868 MHz, a quarter-wave monopole is 82mm long. Simple, cheap, omnidirectional. But for a gateway on a rooftop, you want a colinear — a vertical stack of half-wave elements."' },
                { speaker: 'Presenter', text: '"Antenna placement is critical. Height is king. A mediocre antenna at 10 metres beats a perfect antenna at 2 metres every time. Get it above the roofline."' },
                { speaker: '', text: '📚 ANTENNA GAIN: Measured in dBi (decibels relative to isotropic). An isotropic antenna radiates equally in all directions (0 dBi). A dipole is 2.15 dBi. A colinear can be 6-9 dBi. Gain concentrates energy in the horizontal plane at the expense of vertical coverage — ideal for ground-level communication.' },
                { speaker: 'Presenter', text: '"We built a 6-element colinear from coax cable for €3. It outperforms the €50 commercial antennas. I\'ll put the build instructions on the wiki."' },
                { speaker: 'Ryan', text: 'Physics doesn\'t care about your budget. A home-built colinear antenna outperforming commercial ones — that\'s the hackerspace spirit right there.' },
            ]
        },
    ],

    hotspots: [

        // ── Projector Screen ──
        {
            id: 'screen',
            name: 'Projector Screen',
            x: 21,
            y: 10,
            width: 58,
            height: 45,
            cursor: 'pointer',
            action: (game) => {
                const idx = game.getFlag('classroom_presentation_index') || 0;
                const pres = HackerspaceClassroomScene._presentations[idx];
                game.startDialogue(pres.dialogue);
            }
        },

        // ── Presenter's Table / Laptop ──
        {
            id: 'presenter_table',
            name: 'Presenter\'s Laptop',
            x: 42,
            y: 57,
            width: 16,
            height: 6,
            cursor: 'pointer',
            action: (game) => {
                const idx = game.getFlag('classroom_presentation_index') || 0;
                const pres = HackerspaceClassroomScene._presentations[idx];
                const presName = (idx % 2 === 0) ? 'Wouter' : 'Marieke';
                game.startDialogue([
                    { speaker: 'Ryan', text: `The presenter's laptop. The slides are about "${pres.title}" — presented by ${presName}.` },
                    { speaker: 'Ryan', text: 'LibreOffice Impress on Linux. Of course. This is a hackerspace.' },
                ]);
            }
        },

        // ── Whiteboard ──
        {
            id: 'whiteboard',
            name: 'Whiteboard',
            x: 91,
            y: 14,
            width: 8,
            height: 33,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The whiteboard has scribbles from a previous session. IoT gateway diagrams, MQTT topic structures, LoRa parameters — 868 MHz, spreading factors SF7 through SF12.' },
                    { speaker: 'Ryan', text: 'Someone drew a chirp spread spectrum diagram. The frequency ramps linearly over time — that\'s how LoRa encodes data. Different spreading factors use different chirp rates.' },
                ]);
            }
        },

        // ── Coffee Corner ──
        {
            id: 'coffee',
            name: 'Coffee Corner',
            x: 83,
            y: 57,
            width: 6,
            height: 9,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Coffee thermos, cups, and cookies. Essential fuel for any evening presentation. The real networking happens here during the break.' },
                ]);
            }
        },

        // ── Poster: Open Source ──
        {
            id: 'poster_opensource',
            name: 'Open Source Poster',
            x: 1.5,
            y: 46,
            width: 5,
            height: 12,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: '"Open Source — Sharing is Caring." With a Tux the penguin logo. The philosophy that built Linux, Firefox, Arduino, Meshtastic, Home Assistant — most of the tools we rely on.' },
                    { speaker: '', text: '📚 OPEN SOURCE: Software whose source code is freely available. Anyone can inspect, modify, and distribute it. The GNU General Public License (GPL), MIT License, and Apache License are common open-source licenses with different terms.' },
                ]);
            }
        },

        // ── Poster: Meshtastic ──
        {
            id: 'poster_meshtastic',
            name: 'Meshtastic Poster',
            x: 91,
            y: 51,
            width: 8,
            height: 9,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A Meshtastic poster. Off-grid mesh network — long range, low power. Three nodes connected in a mesh topology.' },
                    { speaker: 'Ryan', text: 'The same technology I could use to set up a communication network that doesn\'t depend on any infrastructure. Useful when you can\'t trust the regular channels.' },
                ]);
            }
        },

        // ── Audience (general) ──
        {
            id: 'audience',
            name: 'Audience',
            x: 11,
            y: 66,
            width: 79,
            height: 28,
            cursor: 'pointer',
            action: (game) => {
                const count = HackerspaceClassroomScene._currentPeopleCount || 12;
                const idx = game.getFlag('classroom_presentation_index') || 0;
                const pres = HackerspaceClassroomScene._presentations[idx];
                game.startDialogue([
                    { speaker: 'Ryan', text: `About ${count} people in the audience tonight. A mix of engineers, hobbyists, students, and retirees. That\'s what I like about hackerspaces — everyone\'s welcome.` },
                    { speaker: 'Ryan', text: `They\'re all focused on the presentation about ${pres.title}. Some taking notes on laptops, others just listening.` },
                ]);
            }
        },

        // ═══════════════════════════════════════════════════════════
        // ── Named Audience Members ────────────────────────────────
        // ═══════════════════════════════════════════════════════════

        // ── Presenter (Wouter / Marieke) ──
        {
            id: 'npc_presenter',
            name: 'Presenter',
            x: 43,
            y: 52,
            width: 8,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const idx = game.getFlag('classroom_presentation_index') || 0;
                const pres = HackerspaceClassroomScene._presentations[idx];
                const isWouter = (idx % 2 === 0);
                const presName = isWouter ? 'Wouter' : 'Marieke';
                const visits = game.getFlag('presenter_talks') || 0;
                game.setFlag('presenter_talks', visits + 1);
                const lines = [
                    [
                        { speaker: presName, text: `*notices Ryan watching* Ah, a new face! Welcome. I\'m ${presName}, one of the regular presenters here at HSD.` },
                        { speaker: presName, text: `Tonight I\'m covering "${pres.title}". We try to keep it practical — theory plus hands-on.` },
                        { speaker: 'Ryan', text: `Nice setup. How often do you do these presentations?` },
                        { speaker: presName, text: 'Every Tuesday evening, 20:00 sharp. Different topic each week. We have about twelve regulars who take turns presenting. Anyone can volunteer.' },
                        { speaker: presName, text: 'After the presentation there\'s always beer and discussion. That\'s where the real learning happens.' },
                    ],
                    [
                        { speaker: presName, text: `*checking laptop* Just fine-tuning the slides for "${pres.title}". I always over-prepare.` },
                        { speaker: presName, text: 'The trick with technical presentations is examples. Every concept needs a real-world demo. Nobody remembers slides — they remember the live demo that went wrong.' },
                        { speaker: 'Ryan', text: 'The classic live demo failure.' },
                        { speaker: presName, text: '*laughs* Last month Dennis tried to demo a LoRa node live. The batteries died mid-presentation. The audience loved it — we spent 30 minutes debugging together. Best session ever.' },
                    ],
                    [
                        { speaker: presName, text: 'You know, these Tuesday sessions started with 5 people in a kitchen. Now we fill this classroom most weeks.' },
                        { speaker: presName, text: 'The key was consistency. Every Tuesday, no exceptions. Rain, snow, football finals — we present. People need something they can count on.' },
                        { speaker: 'Ryan', text: 'Building community through regularity.' },
                        { speaker: presName, text: 'Exactly. And pizza. We started ordering pizza for the break. Attendance doubled overnight.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Pieter — front row, Raspberry Pi enthusiast ──
        {
            id: 'npc_pieter_class',
            name: 'Pieter',
            x: 21,
            y: 56,
            width: 6,
            height: 12,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('pieter_class_talks') || 0;
                game.setFlag('pieter_class_talks', visits + 1);
                const idx = game.getFlag('classroom_presentation_index') || 0;
                const pres = HackerspaceClassroomScene._presentations[idx];
                const lines = [
                    [
                        { speaker: 'Pieter', text: '*looks up from a Raspberry Pi he\'s tinkering with* Hey! Pieter. Sorry, I always bring a side project. Bad habit.' },
                        { speaker: 'Pieter', text: 'I\'m setting up a Pi 5 as a Meshtastic gateway. It bridges the LoRa mesh to the internet via MQTT. The whole hackerspace network will be accessible from anywhere.' },
                        { speaker: 'Ryan', text: 'A Pi as a mesh-to-internet bridge? Elegant.' },
                        { speaker: 'Pieter', text: 'The Pi handles the heavy lifting — message routing, web dashboard, API. The LoRa radio just does the wireless part. Best of both worlds.' },
                        { speaker: '', text: '📚 MQTT BRIDGE: A device that translates between two different communication protocols. In this case, LoRa mesh messages are republished as MQTT topics, making them accessible to any internet-connected MQTT client.' },
                    ],
                    [
                        { speaker: 'Pieter', text: `*whispers* This presentation on "${pres.title}" is actually really good. I\'m learning stuff I didn\'t know.` },
                        { speaker: 'Pieter', text: 'That\'s the thing about hackerspaces. Everyone\'s an expert in something different. I know Raspberry Pi inside out, but ask me about welding? Zero.' },
                        { speaker: 'Ryan', text: 'Specialisation and collaboration.' },
                        { speaker: 'Pieter', text: 'Last week Kim taught me to solder better in five minutes than YouTube ever did. That\'s the power of in-person teaching.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Aisha — front row, IoT/cybersecurity ──
        {
            id: 'npc_aisha_class',
            name: 'Aisha',
            x: 45,
            y: 56,
            width: 6,
            height: 12,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('aisha_class_talks') || 0;
                game.setFlag('aisha_class_talks', visits + 1);
                const idx = game.getFlag('classroom_presentation_index') || 0;
                const pres = HackerspaceClassroomScene._presentations[idx];
                const lines = [
                    [
                        { speaker: 'Aisha', text: '*looks up from tablet, stylus in hand* Hi. Aisha. I\'m a cybersecurity student at NHL Stenden. This hackerspace is my second classroom.' },
                        { speaker: 'Aisha', text: 'I sketch-note every presentation. *shows tablet* Visual notes — diagrams, icons, keywords. It helps me remember and I share them on the wiki afterwards.' },
                        { speaker: 'Ryan', text: 'Visual note-taking? That\'s a good technique.' },
                        { speaker: 'Aisha', text: 'The cybersecurity presentations are my favourite. Last month we did a CTF — Capture The Flag — right here. Twelve teams, four hours, pizza delivery at midnight.' },
                        { speaker: 'Aisha', text: 'I came second. Would\'ve won if Joris hadn\'t found that SQL injection three minutes before the deadline.' },
                    ],
                    [
                        { speaker: 'Aisha', text: `*takes notes* "${pres.title}" is super relevant to my thesis.` },
                        { speaker: 'Aisha', text: 'I\'m writing about IoT security in smart agriculture. Drenthe is perfect for research — lots of farms deploying LoRa sensors with basically zero security.' },
                        { speaker: 'Ryan', text: 'Insecure agricultural IoT? What kind of vulnerabilities?' },
                        { speaker: 'Aisha', text: 'Default passwords, unencrypted LoRaWAN sessions, firmware that hasn\'t been updated since 2019. I found a soil moisture network near Emmen where I could inject false readings from 2km away.' },
                        { speaker: 'Aisha', text: 'I reported it to the farmer, of course. He had no idea his data was even transmitted wirelessly. Now he uses our hackerspace setup — properly encrypted.' },
                        { speaker: '', text: '📚 IoT SECURITY: Many IoT devices ship with default credentials, unencrypted communications, and no update mechanism. The OWASP IoT Top 10 lists common vulnerabilities. Best practices: change defaults, encrypt everything, segment your network, update firmware.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Marco — front row, CNC guy attending presentation ──
        {
            id: 'npc_marco_class',
            name: 'Marco',
            x: 69,
            y: 56,
            width: 6,
            height: 12,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('marco_class_talks') || 0;
                game.setFlag('marco_class_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Marco', text: '*without ear protection for once* Yo, it\'s me. Even CNC guys need to learn new stuff, you know?' },
                        { speaker: 'Marco', text: 'I come for the presentations AND the coffee. Linda makes the best coffee. Don\'t tell the others, but she puts a shot of Amaretto in mine.' },
                        { speaker: 'Ryan', text: 'You look different without the ear protection.' },
                        { speaker: 'Marco', text: '*laughs* I look different? I can HEAR differently. After a day with the plasma cutter, these presentations are like ASMR.' },
                    ],
                    [
                        { speaker: 'Marco', text: 'You know what I\'ve realised? The CNC and the digital stuff — it\'s all connected.' },
                        { speaker: 'Marco', text: 'The brackets I cut become antenna mounts. The antenna mounts hold LoRa gateways. The gateways form the mesh network. My metalwork literally holds the digital infrastructure together.' },
                        { speaker: 'Ryan', text: 'The physical layer supporting the digital layer.' },
                        { speaker: 'Marco', text: 'Exactly. Without someone who can weld a bracket to a church tower at 30 metres, all the fancy software in the world is useless.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Kim — second row, welding expert learning new things ──
        {
            id: 'npc_kim_class',
            name: 'Kim',
            x: 31,
            y: 63,
            width: 6,
            height: 12,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('kim_class_talks') || 0;
                game.setFlag('kim_class_talks', visits + 1);
                const lines = [
                    [
                        { speaker: 'Kim', text: '*leather jacket, no welding helmet* Different vibe without the sparks, right? I clean up nice.' },
                        { speaker: 'Kim', text: 'I come to every presentation. Even the ones about software. Especially the ones about software, actually — that\'s my weakest area.' },
                        { speaker: 'Ryan', text: 'A welder learning to code?' },
                        { speaker: 'Kim', text: 'Joris is teaching me Python. Slowly. I can read sensor data from an Arduino now and plot it in Matplotlib. Baby steps, but it feels like a superpower.' },
                        { speaker: 'Kim', text: 'Next goal: writing G-code programmatically instead of using the CAM software. Then I can generate custom cutting patterns from live data.' },
                    ],
                    [
                        { speaker: 'Kim', text: 'You know what these presentations taught me? Everything connects.' },
                        { speaker: 'Kim', text: 'I used to think welding was just welding. Now I see it as one node in a network of skills. Metalwork connects to CNC, CNC connects to CAD, CAD connects to 3D printing, 3D printing connects to electronics...' },
                        { speaker: 'Ryan', text: 'A mesh network of skills.' },
                        { speaker: 'Kim', text: '*grins* Ha! A mesh network. I like that. Yeah. That\'s exactly what a hackerspace is — a human mesh network.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Joris — second row, Linux guy ──
        {
            id: 'npc_joris_class',
            name: 'Joris',
            x: 57,
            y: 63,
            width: 6,
            height: 12,
            cursor: 'pointer',
            action: (game) => {
                const visits = game.getFlag('joris_class_talks') || 0;
                game.setFlag('joris_class_talks', visits + 1);
                const idx = game.getFlag('classroom_presentation_index') || 0;
                const pres = HackerspaceClassroomScene._presentations[idx];
                const lines = [
                    [
                        { speaker: 'Joris', text: '*typing furiously on a ThinkPad* Oh, hi. I\'m live-blogging the presentation to our Mastodon instance. Multi-tasking.' },
                        { speaker: 'Joris', text: 'We have about 200 followers on Fediverse. Mostly other hackerspaces in the Netherlands and Germany. It\'s our own little tech social network.' },
                        { speaker: 'Ryan', text: 'Mastodon? Not the usual social media.' },
                        { speaker: 'Joris', text: 'Self-hosted, federated, no algorithm, no ads, no data harvesting. We run our own instance on — you guessed it — a Raspberry Pi in the broom closet.' },
                        { speaker: 'Joris', text: 'The same Pi also runs our Gitea, our wiki, and our Matrix chat. 8GB RAM, €80 total. Beat THAT, Microsoft.' },
                    ],
                    [
                        { speaker: 'Joris', text: `*pauses typing* "${pres.title}" — I actually submitted this topic three months ago. Glad someone finally picked it up.` },
                        { speaker: 'Joris', text: 'I always sit here so I can see the presenter\'s screen AND my laptop at the same time. Optimal information density.' },
                        { speaker: 'Ryan', text: 'You optimise your seating position for information throughput?' },
                        { speaker: 'Joris', text: 'I optimise everything. My window manager is tiling, my editor is Neovim, my shell is Fish. Every keystroke counts.' },
                        { speaker: 'Joris', text: '*adjusts round glasses* Yes, I\'m that guy. And I\'m not apologising for it.' },
                    ],
                ];
                game.startDialogue(lines[visits % lines.length]);
            }
        },

        // ── Clock ──
        {
            id: 'clock',
            name: 'Clock',
            x: 92,
            y: 2,
            width: 5,
            height: 8,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'An old school clock. Still ticking. Presentations usually run from 20:00 to 22:00, with a coffee break in the middle.' },
                ]);
            }
        },

        // ── Back to Workshop ──
        {
            id: 'back_to_workshop',
            name: '← Back to Workshop',
            x: 0,
            y: 39,
            width: 4,
            height: 24,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            targetScene: 'hackerspace'
        }
    ],

    // ── Shuffle array (Fisher-Yates) ───────────────────────────────
    _shuffle: function(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    // ═══════════════════════════════════════════════════════════════
    // ── Web Audio API — Classroom Ambient Soundscape ─────────────
    // ═══════════════════════════════════════════════════════════════
    _audioCtx: null,
    _audioNodes: [],
    _audioTimers: [],
    _audioRunning: false,

    _initAudio: function() {
        if (this._audioRunning) return;
        try { this._audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return; }
        this._audioRunning = true;
        const ctx = this._audioCtx;

        const master = ctx.createGain();
        master.gain.value = 0.10;
        master.connect(ctx.destination);
        this._masterGain = master;

        // ── 1. Low crowd murmur (filtered noise) ──
        const murmurLen = ctx.sampleRate * 2;
        const murmurBuf = ctx.createBuffer(1, murmurLen, ctx.sampleRate);
        const md = murmurBuf.getChannelData(0);
        for (let i = 0; i < murmurLen; i++) md[i] = (Math.random() * 2 - 1);
        const murmur = ctx.createBufferSource();
        murmur.buffer = murmurBuf;
        murmur.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 0.8;
        const mg = ctx.createGain();
        mg.gain.value = 0.03;
        murmur.connect(bp).connect(mg).connect(master);
        murmur.start();
        this._audioNodes.push(murmur);

        // ── 2. Projector fan hum ──
        const fan = ctx.createOscillator();
        fan.type = 'triangle';
        fan.frequency.value = 120;
        const fg = ctx.createGain();
        fg.gain.value = 0.03;
        fan.connect(fg).connect(master);
        fan.start();
        this._audioNodes.push(fan);

        // ── 3. Periodic laptop keyboard clicks ──
        const keyLoop = () => {
            if (!this._audioRunning) return;
            // Burst of 3-6 keystrokes
            const count = 3 + Math.floor(Math.random() * 4);
            for (let i = 0; i < count; i++) {
                const t = ctx.currentTime + i * 0.08 + Math.random() * 0.04;
                const osc = ctx.createOscillator();
                osc.type = 'square';
                osc.frequency.value = 2000 + Math.random() * 2000;
                const g = ctx.createGain();
                g.gain.setValueAtTime(0.02, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
                osc.connect(g).connect(master);
                osc.start(t);
                osc.stop(t + 0.025);
            }
            this._audioTimers.push(setTimeout(keyLoop, 4000 + Math.random() * 8000));
        };
        this._audioTimers.push(setTimeout(keyLoop, 2000));

        // ── 4. Chair creak ──
        const creakLoop = () => {
            if (!this._audioRunning) return;
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 80 + Math.random() * 60;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.02, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.connect(g).connect(master);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
            this._audioTimers.push(setTimeout(creakLoop, 10000 + Math.random() * 15000));
        };
        this._audioTimers.push(setTimeout(creakLoop, 5000));

        // ── 5. Occasional cough ──
        const coughLoop = () => {
            if (!this._audioRunning) return;
            this._sfxCough();
            this._audioTimers.push(setTimeout(coughLoop, 20000 + Math.random() * 25000));
        };
        this._audioTimers.push(setTimeout(coughLoop, 12000));

        // ── 6. Coffee cup clink ──
        const cupLoop = () => {
            if (!this._audioRunning) return;
            this._sfxCupClink();
            this._audioTimers.push(setTimeout(cupLoop, 15000 + Math.random() * 20000));
        };
        this._audioTimers.push(setTimeout(cupLoop, 8000));
    },

    _stopAudio: function() {
        this._audioRunning = false;
        this._audioTimers.forEach(id => clearTimeout(id));
        this._audioTimers = [];
        this._audioNodes.forEach(n => { try { n.stop(); } catch(e) {} });
        this._audioNodes = [];
        if (this._audioCtx) { try { this._audioCtx.close(); } catch(e) {} this._audioCtx = null; }
    },

    _sfxCough: function() {
        if (!this._audioCtx || !this._audioRunning) return;
        const ctx = this._audioCtx;
        const now = ctx.currentTime;
        // Two-burst cough
        [0, 0.25].forEach(offset => {
            const bufLen = ctx.sampleRate * 0.15;
            const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 1;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.05, now + offset);
            g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
            src.connect(bp).connect(g).connect(this._masterGain);
            src.start(now + offset);
            src.stop(now + offset + 0.15);
        });
    },

    _sfxCupClink: function() {
        if (!this._audioCtx || !this._audioRunning) return;
        const ctx = this._audioCtx;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 2500 + Math.random() * 500;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(g).connect(this._masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
    },

    // ═══════════════════════════════════════════════════════════════
    // ── VFX: Projector flicker & laser dot ───────────────────────
    // ═══════════════════════════════════════════════════════════════
    _vfxTimers: [],
    _vfxRunning: false,

    _startVFX: function() {
        this._stopVFX();
        this._vfxRunning = true;

        // Projector screen flicker (subtle brightness change)
        const flickerLoop = () => {
            if (!this._vfxRunning) return;
            const sc = document.getElementById('scene-container');
            if (sc) {
                sc.style.filter = 'brightness(1.03)';
                setTimeout(() => { if (sc) sc.style.filter = ''; }, 80);
            }
            this._vfxTimers.push(setTimeout(flickerLoop, 8000 + Math.random() * 12000));
        };
        this._vfxTimers.push(setTimeout(flickerLoop, 3000));

        // Laser pointer dot wandering on screen area
        const laserDot = document.createElement('div');
        laserDot.id = 'hsc-laser-dot';
        laserDot.style.cssText = `
            position:absolute; width:6px; height:6px; border-radius:50%;
            background:red; box-shadow: 0 0 6px 3px rgba(255,0,0,0.6);
            pointer-events:none; z-index:25; opacity:0;
            transition: left 1.5s ease-in-out, top 1.5s ease-in-out, opacity 0.5s;
        `;
        const sceneContainer = document.getElementById('scene-container');
        if (sceneContainer) sceneContainer.appendChild(laserDot);

        const laserLoop = () => {
            if (!this._vfxRunning) return;
            // Show laser for a few seconds over the projector screen area
            const x = 25 + Math.random() * 50;
            const y = 15 + Math.random() * 35;
            laserDot.style.left = x + '%';
            laserDot.style.top = y + '%';
            laserDot.style.opacity = '1';
            setTimeout(() => { laserDot.style.opacity = '0'; }, 3000 + Math.random() * 2000);
            this._vfxTimers.push(setTimeout(laserLoop, 10000 + Math.random() * 15000));
        };
        this._vfxTimers.push(setTimeout(laserLoop, 5000));

        // Audience head-nod reactions (emoji bubbles)
        const reactionEmojis = ['👍', '🤔', '💡', '👏', '📝', '🔥', '✋'];
        const reactionLoop = () => {
            if (!this._vfxRunning) return;
            const emoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
            const x = 15 + Math.random() * 70;
            const y = 60 + Math.random() * 28;
            const el = document.createElement('div');
            el.style.cssText = `
                position:absolute; left:${x}%; top:${y}%;
                font-size:16px; pointer-events:none; z-index:26;
                animation: hsc-reaction-float 2s ease-out forwards;
            `;
            el.textContent = emoji;
            if (sceneContainer) sceneContainer.appendChild(el);
            setTimeout(() => el.remove(), 2500);
            this._vfxTimers.push(setTimeout(reactionLoop, 8000 + Math.random() * 12000));
        };
        this._vfxTimers.push(setTimeout(reactionLoop, 6000));
    },

    _stopVFX: function() {
        this._vfxRunning = false;
        this._vfxTimers.forEach(id => clearTimeout(id));
        this._vfxTimers = [];
        const dot = document.getElementById('hsc-laser-dot');
        if (dot) dot.remove();
        const sc = document.getElementById('scene-container');
        if (sc) sc.style.filter = '';
    },

    // ═══════════════════════════════════════════════════════════════
    // ── Audience Fidget Animation ────────────────────────────────
    // ═══════════════════════════════════════════════════════════════
    _fidgetTimers: [],

    _startFidgets: function() {
        this._stopFidgets();
        // Make anonymous audience members subtly shift
        const overlay = document.getElementById('classroom-people-overlay');
        if (!overlay) return;
        const imgs = overlay.querySelectorAll('img');
        imgs.forEach(img => {
            img.style.transition = 'transform 2s ease-in-out';
            const fidget = () => {
                const dx = -3 + Math.random() * 6;
                const dy = -2 + Math.random() * 4;
                const rot = -3 + Math.random() * 6;
                img.style.transform = `translate(calc(-50% + ${dx}px), calc(-100% + ${dy}px)) rotate(${rot}deg)`;
                this._fidgetTimers.push(setTimeout(fidget, 5000 + Math.random() * 8000));
            };
            this._fidgetTimers.push(setTimeout(fidget, 2000 + Math.random() * 5000));
        });
    },

    _stopFidgets: function() {
        this._fidgetTimers.forEach(id => clearTimeout(id));
        this._fidgetTimers = [];
    },

    // ── Spawn people as character SVGs ───────────────────────────────
    _spawnPeople: function(game) {
        this._removePeople();

        // 1) Place the presenter at the front
        const idx = game.getFlag('classroom_presentation_index') || 0;
        const presenterKey = (idx % 2 === 0) ? 'presenter_male' : 'presenter_female';
        game.showCharacter(presenterKey, 46, 62, 0.07);

        // 2) Place named audience members via showCharacter
        this._namedAudience.forEach(c => {
            game.showCharacter(c.key, c.seat.x, c.seat.y, c.scale);
        });

        // 3) Fill remaining seats with anonymous audience (character SVG images in overlay)
        const namedSeats = new Set(this._namedAudience.map(c => `${c.seat.x},${c.seat.y}`));
        const availableSeats = this._seatPositions.filter(
            s => !namedSeats.has(`${s.x},${s.y}`)
        );
        const anonCount = 4 + Math.floor(Math.random() * 7); // 4-10 anonymous people
        const seats = this._shuffle(availableSeats).slice(0, anonCount);
        const sprites = this._shuffle(this._audienceSprites);

        this._currentPeopleCount = this._namedAudience.length + anonCount;

        // Create overlay for anonymous audience
        const overlay = document.createElement('div');
        overlay.id = 'classroom-people-overlay';
        overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;';

        seats.forEach((seat, i) => {
            const spriteKey = sprites[i % sprites.length];
            const img = document.createElement('img');
            img.src = `assets/images/characters/${spriteKey}_southpark.svg`;
            img.style.cssText = `
                position:absolute;
                left:${seat.x}%;
                top:${seat.y}%;
                width:5%;
                height:auto;
                opacity:0.35;
                transform:translate(-50%,-100%);
                pointer-events:none;
            `;
            overlay.appendChild(img);
        });

        const sceneContainer = document.getElementById('scene-container');
        if (sceneContainer) {
            sceneContainer.appendChild(overlay);
        }
    },

    _removePeople: function() {
        // Remove anonymous overlay
        const old = document.getElementById('classroom-people-overlay');
        if (old) old.remove();
        // Remove named characters (showCharacter elements)
        const container = document.getElementById('scene-characters');
        if (container) {
            container.querySelectorAll('.npc-character').forEach(el => el.remove());
        }
    },

    onEnter: function(game) {
        // Advance to next presentation (cycling through all)
        let idx = game.getFlag('classroom_presentation_index') || 0;
        // On subsequent visits, advance to next topic
        if (game.getFlag('visited_hackerspace_classroom')) {
            idx = (idx + 1) % this._presentations.length;
        }
        game.setFlag('classroom_presentation_index', idx);

        const pres = this._presentations[idx];

        // Spawn random audience + named characters + presenter
        this._spawnPeople(game);

        // Start ambient audio
        setTimeout(() => { this._initAudio(); }, 300);

        // Start VFX (projector flicker, laser dot, audience reactions)
        setTimeout(() => { this._startVFX(); }, 1500);

        // Start audience fidget animations
        setTimeout(() => { this._startFidgets(); }, 2000);

        if (!game.getFlag('visited_hackerspace_classroom')) {
            game.setFlag('visited_hackerspace_classroom', true);
            setTimeout(() => {
                const isWouter = (idx % 2 === 0);
                const presName = isWouter ? 'Wouter' : 'Marieke';
                game.startDialogue([
                    { speaker: '', text: '*Ryan slips through the classroom door. The projector casts a blue glow across rows of faces. A low murmur of conversation.*' },
                    { speaker: '', text: `*The slide reads: "${pres.title}" — presented by ${presName}. ${this._currentPeopleCount} people fill the old school chairs.*` },
                    { speaker: 'Ryan', text: 'The old classroom. Projector, whiteboard, rows of chairs. Every week a different member gives a presentation.' },
                    { speaker: '', text: '*Someone\'s laptop keyboard clicks softly. A coffee cup clinks against a desk. The projector fan hums.*' },
                    { speaker: 'Ryan', text: 'I recognise some faces from the workshop — Pieter has a Pi on his lap, Aisha\'s sketching notes, Marco somehow looks out of place without ear protection.' },
                    { speaker: 'Ryan', text: 'This is where hackerspace members learn from each other. No professors, no grades — just people sharing what they know.' },
                ]);
            }, 600);
        } else {
            setTimeout(() => {
                const isWouter = (idx % 2 === 0);
                const presName = isWouter ? 'Wouter' : 'Marieke';
                game.startDialogue([
                    { speaker: '', text: `*The projector shows: "${pres.title}" by ${presName}. The low hum of conversation and clicking laptops fills the room.*` },
                    { speaker: 'Ryan', text: `${this._currentPeopleCount} people tonight. Good turnout for "${pres.title}".` },
                ]);
            }, 500);
        }
    },

    onExit: function() {
        this._removePeople();
        this._stopAudio();
        this._stopVFX();
        this._stopFidgets();
    }
};

if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(HackerspaceClassroomScene);
}
