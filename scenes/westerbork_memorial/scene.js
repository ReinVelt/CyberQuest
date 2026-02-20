/**
 * Westerbork Memorial Scene
 * Herinneringscentrum Kamp Westerbork — former transit camp, now memorial.
 * The same ground now houses WSRT and a covert Bluetooth surveillance node.
 * Reached from: klooster (or regional_map WSRT hotspot)
 * Purpose: moral weight of surveillance story + key Bluetooth evidence discovery
 */

const WesterborkMemorialScene = {
    id: 'westerbork_memorial',
    name: 'Westerbork Memorial',

    background: 'assets/images/scenes/westerbork_memorial.svg',

    description: 'Herinneringscentrum Kamp Westerbork. Former transit camp, 1942–1945. WSRT dishes visible on the horizon.',

    playerStart: { x: 50, y: 85 },

    hotspots: [
        // ── Railway Track ──
        {
            id: 'railway_track',
            name: 'The Railway Track',
            x: 43.75,
            y: 58,
            width: 12.5,
            height: 42,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: '...' },
                    { speaker: 'Ryan', text: 'The track ends here. Right here.' },
                    { speaker: 'Ryan', text: 'Between 1942 and 1945, 102,000 people were put on trains from this spot. To Auschwitz. To Sobibor. To Bergen-Belsen.' },
                    { speaker: 'Ryan', text: 'Anne Frank was on one of those trains.' },
                    { speaker: '', text: '*Silence*' },
                    { speaker: 'Ryan', text: 'The Nazis built this camp specifically as a holding and sorting facility. They monitored everyone here. Catalogued them. Assigned them numbers.' },
                    { speaker: 'Ryan', text: 'And now, less than two kilometres from here, someone is running a mass surveillance operation. Using the same ground. The same infrastructure.' },
                    { speaker: 'Ryan', text: 'I don\'t think that\'s a coincidence. I think someone chose this location deliberately.' },
                ]);
            }
        },

        // ── Memorial Monument ──
        {
            id: 'memorial_monument',
            name: 'Memorial Monument',
            x: 37.5,
            y: 37.8,
            width: 25,
            height: 17,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: '', text: '*The stone columns stand on either side of the track. Carved into the left column: a Star of David.*' },
                    { speaker: 'Ryan', text: '"Kamp Westerbork 1942–1945." Simple. The dates say everything.' },
                    { speaker: 'Ryan', text: 'More than sixty percent of the deportees were Dutch Jews. The Netherlands had one of the highest deportation rates in Western Europe.' },
                    { speaker: 'Ryan', text: 'The historian Presser called it the "Night of the Girondins" — ordinary bureaucratic efficiency applied to a genocide.' },
                    { speaker: '', text: '📚 EDUCATIONAL: Westerbork was originally built in 1939 as a refugee camp for German Jewish refugees. In 1942 the Nazis requisitioned it as a transit camp (Durchgangslager). Today it is a national memorial and documentation centre.' },
                ]);
            }
        },

        // ── Surveillance Camera (KEY GAMEPLAY ELEMENT) ──
        {
            id: 'surveillance_camera',
            name: 'Security Camera',
            x: 73.75,
            y: 49.4,
            width: 6,
            height: 14,
            cursor: 'pointer',
            action: (game) => {
                const cameraInspected = game.getFlag('westerbork_camera_inspected');
                const hasFlipperZero = game.hasItem('flipper_zero');

                if (cameraInspected && !game.getFlag('westerbork_bt_cracked')) {
                    if (hasFlipperZero) {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'The camera. Let me try the Flipper Zero on it now.' },
                            { speaker: '', text: '*Ryan holds the Flipper Zero near the camera and runs a Bluetooth scan*' },
                            { speaker: '', text: '*The device lights up — multiple devices detected*' },
                            { speaker: 'Ryan', text: '"ZERFALL-NODE-WB01" — there it is. Advertising on Bluetooth Low Energy.' },
                            { speaker: 'Ryan', text: 'Manufacturer ID: 0x004C... spoofed Apple identifier. Whoever built this disguised it as consumer hardware.' },
                            { speaker: 'Ryan', text: 'I can read the beacon data. It\'s broadcasting HCI packets with encrypted payload. Frequency of transmission: every 90 seconds.' },
                            { speaker: 'Ryan', text: 'And the MAC address — partially randomised but with a fixed prefix. I can use that to track other nodes in the network.' },
                        ], () => {
                            game.setFlag('westerbork_bt_cracked', true);
                            game.setFlag('zerfall_network_mapped', true);
                            game.addEvidence({
                                id: 'zerfall_bt_node',
                                name: 'ZERFALL-NODE-WB01 Bluetooth Data',
                                description: 'Bluetooth LE beacon at Westerbork memorial: device name "ZERFALL-NODE-WB01", spoofed Apple manufacturer ID (0x004C), MAC prefix consistent with other Zerfall nodes. Transmits encrypted HCI payload every 90 seconds.',
                                icon: '📱'
                            });
                            game.showNotification('📱 Evidence added: Bluetooth Zerfall Node data');
                            game.completeQuest('trace_bluetooth_network');
                        });
                    } else {
                        game.startDialogue([
                            { speaker: 'Ryan', text: 'I need my Flipper Zero to properly scan this camera\'s Bluetooth module. It\'s back in the mancave.' },
                        ]);
                    }
                } else if (cameraInspected) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Already documented the Zerfall node here. The Flipper caught everything I need.' },
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'That\'s... not a standard memorial camera.' },
                        { speaker: '', text: '*Ryan looks more closely*' },
                        { speaker: 'Ryan', text: 'The housing is a Hikvision body but the internals have been modified. I can see a secondary PCB through the ventilation slot.' },
                        { speaker: 'Ryan', text: 'That\'s a Bluetooth module. A surveillance camera with a Bluetooth transmitter bolted in.' },
                        { speaker: 'Ryan', text: 'No legitimate security system needs that. Bluetooth range is at best 100 metres. This isn\'t for camera control.' },
                        { speaker: 'Ryan', text: 'It\'s a beacon. It\'s broadcasting something. And the LED is pulsing in a pattern — not random.' },
                        { speaker: 'Ryan', text: 'If I had the Flipper Zero, I could read what it\'s transmitting. I need to come back with it.' },
                        { speaker: '', text: '💡 HINT: Get the Flipper Zero from the mancave, then return here.' },
                    ], () => {
                        game.setFlag('westerbork_camera_inspected', true);
                        game.addEvidence({
                            id: 'modified_camera',
                            name: 'Modified Surveillance Camera',
                            description: 'Security camera at Westerbork memorial with non-standard Bluetooth module installed. LED pulses in structured pattern. Located on pole near the railway track.',
                            icon: '📷'
                        });
                        game.showNotification('📷 Evidence added: Modified Surveillance Camera');
                        if (!game.getFlag('bt_camera_quest_started')) {
                            game.setFlag('bt_camera_quest_started', true);
                            game.addQuest({
                                id: 'trace_bluetooth_network',
                                name: 'Trace the Bluetooth Network',
                                description: 'A modified camera at Westerbork memorial is transmitting Bluetooth signals. Return with the Flipper Zero to read the beacon data.'
                            });
                        }
                    });
                }
            }
        },

        // ── WSRT Dishes (background) ──
        {
            id: 'wsrt_horizon',
            name: 'WSRT Dishes (distant)',
            x: 0,
            y: 38,
            width: 25,
            height: 15,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The WSRT dishes. Just a couple of kilometres away.' },
                    { speaker: 'Ryan', text: 'The radio telescope was built in the 1960s, right next to this memorial. They chose this flat, radio-quiet stretch of Drenthe deliberately.' },
                    { speaker: 'Ryan', text: 'In a way, I understand the irony. This ground was used to watch and catalogue people. Now it watches the cosmos.' },
                    { speaker: 'Ryan', text: 'Except someone has decided to start watching people again.' },
                ]);
            }
        },

        // ── Information Board ──
        {
            id: 'info_board',
            name: 'Herinneringscentrum Information Board',
            x: 6.25,
            y: 50,
            width: 19,
            height: 9,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: '', text: '📚 HERINNERINGSCENTRUM KAMP WESTERBORK' },
                    { speaker: '', text: 'From 1942 to 1945, Westerbork served as the main transit camp for Jewish, Sinti, and Roma deportees in the Netherlands.' },
                    { speaker: '', text: '102,000 people were deported in 93 transports. Most to Auschwitz-Birkenau and Sobibor. Survival rate: under 5%.' },
                    { speaker: '', text: 'Notable deportees include Anne Frank and her family (August 1944), Etty Hillesum, and Philip Mechanicus.' },
                    { speaker: '', text: 'The camp was run with meticulous record-keeping — lists, numbers, categories. The bureaucracy of the Holocaust was arguably its most disturbing feature.' },
                    { speaker: '', text: 'Today the site is a national monument. The original barrack footprints, the railway track, and the command post building remain as markers.' },
                ]);
            }
        },

        // ── Barbed Wire ──
        {
            id: 'barbed_wire',
            name: 'Remnant Barbed Wire',
            x: 6,
            y: 68,
            width: 15,
            height: 7,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Preserved remnants of the perimeter wire. Left here as part of the memorial.' },
                    { speaker: 'Ryan', text: 'The same wire that kept 102,000 people in. It\'s just iron and steel. The humans on both sides of it are what matters.' },
                ]);
            }
        },

        // ── Back to klooster ──
        {
            id: 'back_to_klooster',
            name: 'Back to Ter Apel Klooster',
            x: 0,
            y: 80,
            width: 8,
            height: 20,
            cursor: 'pointer',
            targetScene: 'klooster'
        },

        // ── Also reachable from regional_map ──
        {
            id: 'back_to_map',
            name: 'Back to Regional Map',
            x: 92,
            y: 80,
            width: 8,
            height: 20,
            cursor: 'pointer',
            targetScene: 'regional_map'
        }
    ],

    onEnter: (game) => {
        if (!game.getFlag('visited_westerbork_memorial')) {
            game.setFlag('visited_westerbork_memorial', true);
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The memorial. I\'ve been here before but it never gets easier.' },
                    { speaker: 'Ryan', text: 'The railway track. The stones. The flat Drenthe sky.' },
                    { speaker: '', text: '*Ryan is quiet for a moment*' },
                    { speaker: 'Ryan', text: 'I came here because the WSRT signal logs pointed toward this area. But something else caught my eye.' },
                    { speaker: 'Ryan', text: 'That camera on the pole. It doesn\'t look right.' },
                ]);
            }, 600);
        }
    },

    onExit: () => {}
};

if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(WesterborkMemorialScene);
}
