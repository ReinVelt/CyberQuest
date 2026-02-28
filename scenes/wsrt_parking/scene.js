/**
 * WSRT/Memorial Parking Scene
 * Central parking area serving the WSRT, Westerbork Memorial, and Planetenpad.
 * Located between the three destinations in the Drenthe heathland.
 *
 * Direction board shows:
 *   → Herinneringscentrum Kamp Westerbork (200 m)
 *   → WSRT / ASTRON (400 m)
 *   → Planetenpad — schaalmodel zonnestelsel (1000 m wandeling)
 *
 * Reached from: garden → volvo → driving_day → wsrt_parking
 *               or on foot from ASTRON / memorial / planetenpad
 * Exits: walk to memorial, walk to WSRT, walk planetenpad, drive home
 */

const WsrtParkingScene = {
    id: 'wsrt_parking',
    name: 'WSRT Parking',

    background: 'assets/images/scenes/wsrt_parking.svg',

    description: 'A gravel parking area on the Drenthe heath. A wooden direction board points to the Memorial, the WSRT, and the Planetenpad. The Volvo sits in the shade of a birch tree.',

    playerStart: { x: 50, y: 85 },

    idleThoughts: [
        "Three destinations from one parking lot. Only in Drenthe.",
        "The Volvo ticks quietly as the engine cools.",
        "I can see the WSRT dishes from here. Still impressive.",
        "Wind rustles through the heather. Otherwise silence.",
        "A magpie watches me from the birch tree. Judgmental.",
        "Fresh Drenthe air. Smells like heather and damp earth.",
    ],

    _timeoutIds: [],

    hotspots: [
        // ── Direction Board (main interactive element) ──
        {
            id: 'direction_board',
            name: 'Direction Board',
            x: 35,
            y: 30,
            width: 30,
            height: 35,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: '', text: '*A weathered wooden direction board stands at the edge of the parking area*' },
                    { speaker: '', text: '→ Herinneringscentrum Kamp Westerbork — 200 m' },
                    { speaker: '', text: '→ WSRT / ASTRON — 400 m' },
                    { speaker: '', text: '→ Planetenpad (schaalmodel zonnestelsel) — 1000 m wandeling' },
                    { speaker: 'Ryan', text: 'Three paths from one parking spot. Memorial, radio telescope, and a scale model of the solar system.' },
                    { speaker: 'Ryan', text: 'Only in the middle of Drenthe.' },
                ]);
            }
        },

        // ── Walk to Memorial (200 m) ──
        {
            id: 'walk_memorial',
            name: 'Memorial → 200m',
            x: 0,
            y: 55,
            width: 12,
            height: 25,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                game.startDialogue([
                    { speaker: '', text: '*A gravel path leads south through the heather toward the memorial*' },
                    { speaker: 'Ryan', text: 'The memorial. Two hundred metres through the heath.' },
                    { speaker: '', text: '*Ryan starts walking. The WSRT dishes are visible to the west.*' },
                ], () => {
                    game.loadScene('westerbork_memorial');
                });
            }
        },

        // ── Walk to WSRT / ASTRON (400 m) ──
        {
            id: 'walk_wsrt',
            name: 'WSRT → 400m',
            x: 88,
            y: 55,
            width: 12,
            height: 25,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                if (!game.getFlag('astron_unlocked')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The WSRT control room is 400 metres along that path. I can see the dishes.' },
                        { speaker: 'Ryan', text: 'But I don\'t have an appointment with anyone there. No reason to walk over.' },
                    ]);
                    return;
                }
                game.startDialogue([
                    { speaker: '', text: '*A paved path heads west toward the radio telescope array*' },
                    { speaker: 'Ryan', text: 'The WSRT. Four hundred metres. Cees should be in the control room.' },
                    { speaker: '', text: '*Ryan walks past the heather. The 14 dishes grow larger with each step.*' },
                ], () => {
                    game.loadScene('astron');
                });
            }
        },

        // ── Walk Planetenpad (1000 m) ──
        {
            id: 'walk_planetenpad',
            name: 'Planetenpad → 1 km',
            x: 44,
            y: 0,
            width: 12,
            height: 15,
            cursor: 'pointer',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                if (game.getFlag('planetenpad_complete')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The Planetenpad. One kilometre through the heath, past scale models of all the planets.' },
                        { speaker: 'Ryan', text: 'I walked it already. Impressive how big the solar system feels, even at scale.' },
                        { speaker: '', text: '*Ryan starts down the path again, past the Pluto marker*' },
                    ], () => {
                        game.loadScene('planetenpad');
                    });
                } else {
                    game.startDialogue([
                        { speaker: '', text: '*A narrow path heads north into the heath. A small sign reads: PLANETENPAD — Schaalmodel Zonnestelsel*' },
                        { speaker: 'Ryan', text: 'A scale model of the solar system? One kilometre walk from Pluto to the Sun.' },
                        { speaker: 'Ryan', text: 'That\'s... actually kind of cool. Let\'s see how big space really is.' },
                        { speaker: '', text: '*Ryan starts down the path. The first marker is already visible ahead.*' },
                    ], () => {
                        game.loadScene('planetenpad');
                    });
                }
            }
        },

        // ── The Volvo (drive home) ──
        {
            id: 'volvo',
            name: 'The Volvo',
            x: 60,
            y: 70,
            width: 25,
            height: 20,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The Volvo. Ready to head home whenever I am.' },
                    { speaker: '', text: '*Ryan gets in and starts the engine*' },
                ], () => {
                    game.setFlag('driving_destination', 'home_from_wsrt_parking');
                    // Decide day/night driving
                    const hour = parseInt((game.gameState.time || '14:00').split(':')[0], 10);
                    if (hour >= 20 || hour < 7) {
                        game.loadScene('driving');
                    } else {
                        game.loadScene('driving_day');
                    }
                });
            }
        },

        // ── Information kiosk (near direction board) ──
        {
            id: 'info_kiosk',
            name: 'Information Panel',
            x: 15,
            y: 30,
            width: 18,
            height: 20,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: '', text: '📚 HERINNERINGSCENTRUM KAMP WESTERBORK — BEZOEKERSGEBIED' },
                    { speaker: '', text: 'This area lies between the former Camp Westerbork (now a national memorial) and the Westerbork Synthesis Radio Telescope (WSRT).' },
                    { speaker: '', text: 'The WSRT was built in the 1960s on the adjacent heathland. Fourteen 25-metre radio dishes form a 2.7 km east-west baseline.' },
                    { speaker: '', text: 'The Planetenpad is a walking route featuring a scale model of our solar system. Starting from the outer planets near this parking area, the path leads 1 kilometre to a sun model near the WSRT.' },
                    { speaker: '', text: 'At this scale, the Earth is smaller than a marble and the Sun is the size of a beach ball. The distances between planets are vast — even in miniature.' },
                    { speaker: 'Ryan', text: 'History, science, and education. All from one gravel car park in the middle of Drenthe.' },
                ]);
            }
        },

        // ── Heathland view ──
        {
            id: 'heathland',
            name: 'Drenthe Heathland',
            x: 0,
            y: 15,
            width: 35,
            height: 25,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Classic Drenthe heathland. Purple heather in summer, brown scrub in winter.' },
                    { speaker: 'Ryan', text: 'Flat to every horizon. That\'s why they built the radio telescope here — no hills to block the signal.' },
                    { speaker: 'Ryan', text: 'And why they built the camp here. Remote. Out of sight. Out of mind.' },
                    { speaker: 'Ryan', text: 'Same geography, different purposes. The duality of this place never stops hitting me.' },
                ]);
            }
        },

        // ── WSRT dishes in background ──
        {
            id: 'dishes_distant',
            name: 'WSRT Dishes (distant)',
            x: 65,
            y: 15,
            width: 35,
            height: 25,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The WSRT dishes, lined up along the horizon. Fourteen of them, stretching almost three kilometres.' },
                    { speaker: 'Ryan', text: 'From here they look like white flowers growing out of the heath.' },
                    { speaker: 'Ryan', text: 'Each one is 25 metres across. Together they form a synthesis array — combining radio waves into images of the cosmos.' },
                    { speaker: 'Ryan', text: 'Operational since 1970. Over fifty years of listening to the universe.' },
                ]);
            }
        },
    ],

    onEnter: function(game) {
        // Clear any leftover timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        if (!game.getFlag('visited_wsrt_parking')) {
            game.setFlag('visited_wsrt_parking', true);

            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: '*The Volvo rolls into a small gravel parking area. A wooden direction board stands at the edge of the heath.*' },
                    { speaker: 'Ryan', text: 'This is it. The WSRT parking area.' },
                    { speaker: 'Ryan', text: 'Three paths diverge from here. The memorial, the radio telescope, and...' },
                    { speaker: '', text: '*Ryan reads the third sign*' },
                    { speaker: 'Ryan', text: '"Planetenpad — Schaalmodel Zonnestelsel." A scale model of the solar system. One kilometre.' },
                    { speaker: 'Ryan', text: 'Interesting. But first things first.' },
                ]);
            }, 500);
        } else {
            setTimeout(() => {
                game.startDialogue([
                    { speaker: '', text: '*Back at the WSRT parking area. The direction board, the heather, the distant dishes.*' },
                    { speaker: 'Ryan', text: 'Same three paths. Same flat Drenthe sky.' },
                ]);
            }, 300);
        }
    },

    onExit: function() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }
    }
};

// Register scene
if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(WsrtParkingScene);
}
