/**
 * Scene: Garden Back — Achtertuin
 * ═══════════════════════════════════════════════════════════
 * The back garden behind Ryan's farmhouse. A peaceful spot
 * with a steel drum fire pit, old pallets, a sit-on mower,
 * fruit trees, berry bushes, and three dogs living their
 * best lives.
 * ═══════════════════════════════════════════════════════════
 */

const GardenBackScene = {
    id: 'garden_back',
    name: 'Achtertuin — Back Garden',

    background: 'assets/images/scenes/garden_back.svg',

    description: 'The back garden. Fruit trees sway in the breeze. Berry bushes line the fence. The steel fire drum crackles. The sit-mower waits on the grass. Dogs enjoy the sunshine.',

    playerStart: { x: 10, y: 88 },

    idleThoughts: [
        'Appels, peren, frambozen... nature provides.',
        'The fire drum is hypnotic. Good for thinking.',
        'Tino is having the time of his life.',
        'ET is sniffing everything. Classic pug.',
        'Kessy found her sunspot. Smart dog.',
        'Should burn those pallets tonight.',
        'The mower needs a ride. Grass is getting long.',
        'Mowing always clears my head.',
        'Stekelbessen are almost ripe.',
        'Japanse wijnbes. Best kept secret in the garden.',
        'Nothing beats fresh fruit from your own trees.',
        'Dogs, fire, fruit trees. Simple life.',
        'The best ideas come on the mower.',
        'Peaceful here. Almost too peaceful.',
        'Kruisbessen jam. Ies makes the best.',
        'That pug has zero shame.',
        'Fresh air and engine noise. Perfect combination.',
        'A developer\'s garden. Half wild, half maintained.',
        'The fire drum is my think tank.',
        'Rode the mower for an hour yesterday. Solved two bugs.',
        'The walnut tree must be older than most people in the village.',
        'Walnuts by the fire. Autumn tradition.',
        'The schuilstal is crooked but I love it.',
        'Tuinhuis life. Porch, coffee, no meetings.',
        'The cabin porch is the best seat in the garden.'
    ],

    // ── Hotspots ─────────────────────────────────────────────
    hotspots: [

        /* ═══ FIRE DRUM ═══ */
        {
            id: 'fire_drum',
            name: 'Steel Fire Drum',
            // SVG: translate(850, 620), drum is about 60w x 90h with flames
            x: (800 / 1920) * 100,
            y: (540 / 1080) * 100,
            width: (100 / 1920) * 100,
            height: (150 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: '', text: '*The fire crackles and pops. Sparks spiral upward into the evening air.*' },
                    { speaker: 'Ryan', text: 'Nothing beats a vuurkorf. Steel drum, holes punched in, pallets on top.' },
                    { speaker: 'Ryan', text: 'Simple engineering. Maximum atmosphere.' },
                    { speaker: 'Ryan', text: 'Stare at the flames long enough and your brain starts solving problems on its own.' },
                    { speaker: 'Ryan', text: 'Some of my best ideas came from right here. Fire and silence.' }
                ]);
            }
        },

        /* ═══ OLD PALLETS ═══ */
        {
            id: 'pallets',
            name: 'Old Pallets',
            // SVG: translate(730, 660)
            x: (720 / 1920) * 100,
            y: (645 / 1080) * 100,
            width: (100 / 1920) * 100,
            height: (50 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Stack of old pallets. Free fuel.' },
                    { speaker: 'Ryan', text: 'Neighbours throw them away. I collect them.' },
                    { speaker: 'Ryan', text: 'Break them up, feed them to the fire drum. Burns for hours.' },
                    { speaker: 'Ryan', text: 'Recycling, Drenthe style.' }
                ]);
            }
        },

        /* ═══ SIT-ON MOWER ═══ */
        {
            id: 'sit_mower',
            name: 'Sit-on Mower',
            // SVG: translate(1600, 620)
            x: (1510 / 1920) * 100,
            y: (580 / 1080) * 100,
            width: (180 / 1920) * 100,
            height: (120 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                const thoughts = [
                    [
                        { speaker: '', text: '*Ryan looks at the sit-on mower. The grass IS getting long.*' },
                        { speaker: 'Ryan', text: 'The zitmaaier. Best thinking machine ever built.' },
                        { speaker: 'Ryan', text: 'Something about the rhythm. Engine humming, blades spinning, rows appearing.' },
                        { speaker: 'Ryan', text: 'Your hands steer but your brain wanders. Free-association mode.' },
                        { speaker: 'Ryan', text: 'I\'ve solved more bugs on this mower than at my desk.' },
                        { speaker: 'Ryan', text: 'Monotone motion frees the creative mind. It\'s almost meditative.' },
                        { speaker: 'Ryan', text: 'Maybe I should take a ride. The grass needs it. And so does my brain.' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'The mower. My mobile think tank.' },
                        { speaker: 'Ryan', text: 'Last week I rode for ninety minutes. Came back with the solution to a race condition.' },
                        { speaker: 'Ryan', text: 'The lawn looked perfect too. Win-win.' },
                        { speaker: 'Ryan', text: 'There\'s research on this. Repetitive physical tasks activate the default mode network.' },
                        { speaker: 'Ryan', text: 'Same brain state as showering or long drives. Where creativity lives.' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'Green machine. Twelve horsepower of creative inspiration.' },
                        { speaker: 'Ryan', text: 'Ies says I mow too often. I say I\'m working.' },
                        { speaker: 'Ryan', text: 'She doesn\'t buy it. But the lawn looks great.' }
                    ]
                ];
                const idx = Math.floor(Math.random() * thoughts.length);
                game.startDialogue(thoughts[idx]);
            }
        },

        /* ═══ FRUIT TREES ═══ */
        {
            id: 'apple_trees',
            name: 'Apple Trees',
            // SVG: translate(250,460) and translate(650,465)
            x: (180 / 1920) * 100,
            y: (400 / 1080) * 100,
            width: (200 / 1920) * 100,
            height: (180 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Apple trees. Two of them.' },
                    { speaker: 'Ryan', text: 'Elstar and Jonagold. Good Dutch varieties.' },
                    { speaker: 'Ryan', text: 'In autumn we have more apples than we know what to do with.' },
                    { speaker: 'Ryan', text: 'Appelmoes, appeltaart, appelstroop... and still bags left over for the neighbours.' }
                ]);
            }
        },

        {
            id: 'pear_tree',
            name: 'Pear Tree',
            // SVG: translate(450, 450)
            x: (400 / 1920) * 100,
            y: (390 / 1080) * 100,
            width: (100 / 1920) * 100,
            height: (170 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Peer tree. Conference pears.' },
                    { speaker: 'Ryan', text: 'Ies makes stoofpeertjes in red wine with cinnamon.' },
                    { speaker: 'Ryan', text: 'Best autumn dessert in existence.' },
                    { speaker: 'Ryan', text: 'The tree is older than the house I think. Still produces every year.' }
                ]);
            }
        },

        {
            id: 'cherry_tree',
            name: 'Cherry Tree',
            // SVG: translate(130, 470)
            x: (90 / 1920) * 100,
            y: (430 / 1080) * 100,
            width: (80 / 1920) * 100,
            height: (110 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Kersenboom. Cherry tree.' },
                    { speaker: 'Ryan', text: 'The birds eat half of them before I get a chance.' },
                    { speaker: 'Ryan', text: 'Can\'t complain. Fair trade for the singing.' }
                ]);
            }
        },

        /* ═══ BERRY BUSHES ═══ */
        {
            id: 'berry_bushes',
            name: 'Berry Bushes',
            // SVG: 1050-1460 x range, near fence
            x: (1030 / 1920) * 100,
            y: (410 / 1080) * 100,
            width: (450 / 1920) * 100,
            height: (70 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The berry collection. My pride and joy.' },
                    { speaker: 'Ryan', text: 'Stekelbessen — gooseberries. Sour but perfect for jam.' },
                    { speaker: 'Ryan', text: 'Kruisbessen — more gooseberries, the red variety. Ies uses them for taart.' },
                    { speaker: 'Ryan', text: 'Frambozen — raspberries. Never make it inside. I eat them straight off the bush.' },
                    { speaker: 'Ryan', text: 'And the Japanse wijnbes. Japanese wineberry.' },
                    { speaker: 'Ryan', text: 'Orange-red berries with a sweet-tart flavour. Like raspberries but more complex.' },
                    { speaker: 'Ryan', text: 'Grows like crazy. The fuzzy red canes spread everywhere.' },
                    { speaker: 'Ryan', text: 'Best kept secret in Dutch gardens. Nobody knows about them.' }
                ]);
            }
        },

        /* ═══ DOGS ═══ */
        {
            id: 'tino',
            name: 'Tino',
            // SVG: translate(1100, 700) — running white dog
            x: (1065 / 1920) * 100,
            y: (680 / 1080) * 100,
            width: (80 / 1920) * 100,
            height: (50 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                const lines = [
                    [
                        { speaker: '', text: '*Tino races across the lawn, tongue flapping, pure joy*' },
                        { speaker: 'Ryan', text: 'Tino! Good boy!' },
                        { speaker: 'Ryan', text: 'This dog runs laps for no reason. Just... happy to be alive.' },
                        { speaker: 'Ryan', text: 'Can\'t argue with that philosophy.' }
                    ],
                    [
                        { speaker: '', text: '*Tino stops briefly, looks at Ryan, then sprints off again*' },
                        { speaker: 'Ryan', text: 'Crazy hond. Where does the energy come from?' },
                        { speaker: 'Ryan', text: 'Wish I could bottle that.' }
                    ]
                ];
                game.startDialogue(lines[Math.floor(Math.random() * lines.length)]);
            }
        },

        {
            id: 'kessy',
            name: 'Kessy',
            // SVG: translate(1250, 750) — lying in the sun
            x: (1215 / 1920) * 100,
            y: (740 / 1080) * 100,
            width: (70 / 1920) * 100,
            height: (30 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: '', text: '*Kessy lies stretched out in a warm sunbeam. Eyes half-closed.*' },
                    { speaker: 'Ryan', text: 'Kessy found her spot. Smart girl.' },
                    { speaker: 'Ryan', text: 'White fur absorbs the sun. She\'ll lie there for hours.' },
                    { speaker: 'Ryan', text: 'Zen master in dog form. We should all be more like Kessy.' }
                ]);
            }
        },

        {
            id: 'et_pug',
            name: 'ET',
            // SVG: translate(920, 710) — pug sniffing near fire
            x: (900 / 1920) * 100,
            y: (695 / 1080) * 100,
            width: (55 / 1920) * 100,
            height: (40 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                const lines = [
                    [
                        { speaker: '', text: '*ET snuffles along the grass, nose glued to the ground*' },
                        { speaker: 'Ryan', text: 'ET. The pug. Named after the movie, not the alien.' },
                        { speaker: 'Ryan', text: '...Actually, maybe the alien. Look at that face.' },
                        { speaker: 'Ryan', text: 'Sniff, sniff, sniff. His whole universe is one centimetre above ground level.' }
                    ],
                    [
                        { speaker: '', text: '*ET looks up with those enormous pug eyes*' },
                        { speaker: 'Ryan', text: 'Hey buddy. Whatcha smelling?' },
                        { speaker: '', text: '*ET snorts, then goes back to sniffing*' },
                        { speaker: 'Ryan', text: 'Cool. Carry on.' }
                    ]
                ];
                game.startDialogue(lines[Math.floor(Math.random() * lines.length)]);
            }
        },

        /* ═══ DOG MESS ═══ */
        {
            id: 'dog_mess',
            name: '...',
            x: (1335 / 1920) * 100,
            y: (810 / 1080) * 100,
            width: (35 / 1920) * 100,
            height: (25 / 1080) * 100,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: '', text: '*Ryan nearly steps in something*' },
                    { speaker: 'Ryan', text: '...Ah. The joys of dog ownership.' },
                    { speaker: 'Ryan', text: 'Three dogs, one garden. You do the math.' },
                    { speaker: 'Ryan', text: 'I\'ll get the shovel. Later.' }
                ]);
            }
        },

        /* ═══ CAMP CHAIRS (by fire) ═══ */
        {
            id: 'camp_chairs',
            name: 'Garden Chairs',
            // SVG: near fire drum, 780-950 x range
            x: (770 / 1920) * 100,
            y: (610 / 1080) * 100,
            width: (80 / 1920) * 100,
            height: (60 / 1080) * 100,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Two camp chairs by the fire. One for me, one for Ies.' },
                    { speaker: 'Ryan', text: 'Evening ritual. Fire, coffee, dogs running around.' },
                    { speaker: 'Ryan', text: 'Sometimes we talk. Sometimes just the fire talks.' },
                    { speaker: 'Ryan', text: 'Best part of the day.' }
                ]);
            }
        },

        /* ═══ SCHUILSTAL (stable/shelter) ═══ */
        {
            id: 'schuilstal',
            name: 'Schuilstal',
            // SVG: translate(820, 335) — behind the fire drum
            x: (790 / 1920) * 100,
            y: (320 / 1080) * 100,
            width: (120 / 1920) * 100,
            height: (80 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                const lines = [
                    [
                        { speaker: 'Ryan', text: 'De schuilstal. Little shelter out back.' },
                        { speaker: 'Ryan', text: 'Used to keep the previous owner\'s sheep dry. Now it stores firewood and old garden tools.' },
                        { speaker: 'Ryan', text: 'There\'s still hay in the back. The dogs like sleeping there when it rains.' },
                        { speaker: 'Ryan', text: 'Bit crooked, but it\'s stood for thirty years. Good enough.' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'The schuilstal. Classic Drenthe countryside feature.' },
                        { speaker: 'Ryan', text: 'Every farmhouse has one. Open on one side, roof that keeps the worst off.' },
                        { speaker: 'Ryan', text: 'ET sleeps in there when it thunders. Pugs are not brave dogs.' }
                    ]
                ];
                game.startDialogue(lines[Math.floor(Math.random() * lines.length)]);
            }
        },

        /* ═══ WALNUT TREE ═══ */
        {
            id: 'walnut_tree',
            name: 'Walnut Tree',
            // SVG: translate(1080, 290) — big tree right of schuilstal
            x: (990 / 1920) * 100,
            y: (250 / 1080) * 100,
            width: (180 / 1920) * 100,
            height: (150 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'De notenboom. The walnut tree.' },
                    { speaker: 'Ryan', text: 'Massive thing. Must be sixty, seventy years old.' },
                    { speaker: 'Ryan', text: 'In autumn the walnuts fall by the hundreds. We crack them by the fire.' },
                    { speaker: 'Ryan', text: 'Ies makes walnotentaart. Absolute killer recipe.' },
                    { speaker: 'Ryan', text: 'The canopy is so wide it shades half the back garden. Perfect on hot days.' },
                    { speaker: 'Ryan', text: 'One of the reasons we bought this place.' }
                ]);
            }
        },

        /* ═══ CABIN ═══ */
        {
            id: 'cabin',
            name: 'Garden Cabin',
            // SVG: translate(1620, 310) — small cabin with porch, far right
            x: (1600 / 1920) * 100,
            y: (290 / 1080) * 100,
            width: (100 / 1920) * 100,
            height: (100 / 1080) * 100,
            cursor: 'pointer',
            action: function(game) {
                const lines = [
                    [
                        { speaker: 'Ryan', text: 'The tuinhuis. Garden cabin.' },
                        { speaker: 'Ryan', text: 'Small but functional. Got a porch for sitting with coffee.' },
                        { speaker: 'Ryan', text: 'Inside there\'s a workbench, some tools, and way too many empty flowerpots.' },
                        { speaker: 'Ryan', text: 'In summer I sometimes work from here. Laptop on the porch, dogs at my feet.' },
                        { speaker: 'Ryan', text: 'Best office in the world. No commute.' }
                    ],
                    [
                        { speaker: 'Ryan', text: 'Tuinhuis. Our little cabin in the back.' },
                        { speaker: 'Ryan', text: 'Ies uses it for potting plants. I use it for escaping phone calls.' },
                        { speaker: 'Ryan', text: 'Works for both of us.' }
                    ]
                ];
                game.startDialogue(lines[Math.floor(Math.random() * lines.length)]);
            }
        },

        /* ═══ FENCE / LANDSCAPE ═══ */
        {
            id: 'fence_view',
            name: 'Garden Fence',
            x: (500 / 1920) * 100,
            y: (390 / 1080) * 100,
            width: (500 / 1920) * 100,
            height: (30 / 1080) * 100,
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Wooden fence. Marks the edge of the achtertuin.' },
                    { speaker: 'Ryan', text: 'Beyond it — flat Drenthe as far as the eye can see.' },
                    { speaker: 'Ryan', text: 'Hedges, fields, the occasional farmhouse.' },
                    { speaker: 'Ryan', text: 'Quiet country. That\'s why we\'re here.' }
                ]);
            }
        },

        /* ═══ NAVIGATION ═══ */
        {
            id: 'gate_to_garden',
            name: '← Garden (Front)',
            // SVG: gate at translate(30, 415)
            x: (20 / 1920) * 100,
            y: (400 / 1080) * 100,
            width: (60 / 1920) * 100,
            height: (70 / 1080) * 100,
            cursor: 'exit',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            targetScene: 'garden'
        }
    ],

    // ═══════════════════════════════════════════════════════════
    // SCENE LIFECYCLE
    // ═══════════════════════════════════════════════════════════

    _audioNodes: [],
    _audioIntervals: [],

    _startAmbientAudio: function() {
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var master = ctx.createGain();
            master.gain.value = 0.04;
            master.connect(ctx.destination);
            this._audioNodes.push(master);

            // Wind through trees
            var windBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
            var windData = windBuf.getChannelData(0);
            for (var i = 0; i < windData.length; i++) {
                windData[i] = (Math.random() * 2 - 1) * 0.3;
            }
            var wind = ctx.createBufferSource();
            wind.buffer = windBuf;
            wind.loop = true;
            var windFilter = ctx.createBiquadFilter();
            windFilter.type = 'lowpass';
            windFilter.frequency.value = 200;
            var windGain = ctx.createGain();
            windGain.gain.value = 0.6;
            wind.connect(windFilter).connect(windGain).connect(master);
            wind.start();
            this._audioNodes.push(wind, windFilter, windGain);

            // Fire crackle
            var self = this;
            var crackleInterval = setInterval(function() {
                try {
                    var t = ctx.currentTime;
                    var osc = ctx.createOscillator();
                    osc.type = 'sawtooth';
                    osc.frequency.value = 100 + Math.random() * 500;
                    var g = ctx.createGain();
                    g.gain.setValueAtTime(0, t);
                    g.gain.linearRampToValueAtTime(0.015 + Math.random() * 0.01, t + 0.005);
                    g.gain.linearRampToValueAtTime(0, t + 0.03 + Math.random() * 0.02);
                    osc.connect(g).connect(master);
                    osc.start(t);
                    osc.stop(t + 0.06);
                } catch (e) {}
            }, 200 + Math.random() * 400);
            self._audioIntervals.push(crackleInterval);

            // Birds
            var birdInterval = setInterval(function() {
                if (Math.random() > 0.4) return;
                try {
                    var t = ctx.currentTime;
                    var osc = ctx.createOscillator();
                    osc.type = 'sine';
                    var baseFreq = 2000 + Math.random() * 2000;
                    osc.frequency.setValueAtTime(baseFreq, t);
                    osc.frequency.linearRampToValueAtTime(baseFreq + 400, t + 0.08);
                    osc.frequency.linearRampToValueAtTime(baseFreq - 200, t + 0.15);
                    var g = ctx.createGain();
                    g.gain.setValueAtTime(0, t);
                    g.gain.linearRampToValueAtTime(0.008, t + 0.02);
                    g.gain.linearRampToValueAtTime(0, t + 0.2);
                    osc.connect(g).connect(master);
                    osc.start(t);
                    osc.stop(t + 0.25);
                } catch (e) {}
            }, 2000 + Math.random() * 3000);
            self._audioIntervals.push(birdInterval);

            // Dog barking — synced to 26s chase cycle
            // Dogs sprint at 18-24s of each 26s cycle, barking excitedly
            var cycleStart = ctx.currentTime;
            var barkInterval = setInterval(function() {
                try {
                    var elapsed = (ctx.currentTime - cycleStart) % 26;
                    // Only bark during chase phase (18-24s)
                    if (elapsed < 18 || elapsed > 24) return;

                    var t = ctx.currentTime;

                    // Tino bark — deeper, louder (bigger dog)
                    if (Math.random() > 0.3) {
                        var tinoBase = 180 + Math.random() * 40;
                        var osc1 = ctx.createOscillator();
                        osc1.type = 'sawtooth';
                        osc1.frequency.setValueAtTime(tinoBase, t);
                        osc1.frequency.linearRampToValueAtTime(tinoBase * 1.8, t + 0.04);
                        osc1.frequency.linearRampToValueAtTime(tinoBase * 0.7, t + 0.12);
                        var g1 = ctx.createGain();
                        g1.gain.setValueAtTime(0, t);
                        g1.gain.linearRampToValueAtTime(0.025, t + 0.01);
                        g1.gain.linearRampToValueAtTime(0.02, t + 0.06);
                        g1.gain.linearRampToValueAtTime(0, t + 0.15);
                        var f1 = ctx.createBiquadFilter();
                        f1.type = 'bandpass';
                        f1.frequency.value = 400;
                        f1.Q.value = 2;
                        osc1.connect(f1).connect(g1).connect(master);
                        osc1.start(t);
                        osc1.stop(t + 0.18);
                    }

                    // Kessy bark — higher, yappy (slightly smaller)
                    if (Math.random() > 0.4) {
                        var kessyDelay = 0.08 + Math.random() * 0.12;
                        var kessyBase = 280 + Math.random() * 60;
                        var osc2 = ctx.createOscillator();
                        osc2.type = 'sawtooth';
                        osc2.frequency.setValueAtTime(kessyBase, t + kessyDelay);
                        osc2.frequency.linearRampToValueAtTime(kessyBase * 2, t + kessyDelay + 0.03);
                        osc2.frequency.linearRampToValueAtTime(kessyBase * 0.8, t + kessyDelay + 0.1);
                        var g2 = ctx.createGain();
                        g2.gain.setValueAtTime(0, t + kessyDelay);
                        g2.gain.linearRampToValueAtTime(0.02, t + kessyDelay + 0.01);
                        g2.gain.linearRampToValueAtTime(0.015, t + kessyDelay + 0.05);
                        g2.gain.linearRampToValueAtTime(0, t + kessyDelay + 0.12);
                        var f2 = ctx.createBiquadFilter();
                        f2.type = 'bandpass';
                        f2.frequency.value = 600;
                        f2.Q.value = 2.5;
                        osc2.connect(f2).connect(g2).connect(master);
                        osc2.start(t + kessyDelay);
                        osc2.stop(t + kessyDelay + 0.15);
                    }
                } catch (e) {}
            }, 180 + Math.random() * 120);
            self._audioIntervals.push(barkInterval);

        } catch (e) {
            console.log('[GardenBack] Audio init failed:', e);
        }
    },

    _stopAmbientAudio: function() {
        this._audioIntervals.forEach(function(id) { clearInterval(id); });
        this._audioIntervals = [];
        this._audioNodes.forEach(function(node) {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) {}
        });
        this._audioNodes = [];
    },

    onEnter: function(game) {
        this._startAmbientAudio();

        if (!game.getFlag('visited_garden_back')) {
            game.setFlag('visited_garden_back', true);
            game.startDialogue([
                { speaker: '', text: '*The back garden. Warm afternoon sun. Dogs on the lawn. Fire drum crackling.*' },
                { speaker: 'Ryan', text: 'Achtertuin. My favourite spot.' },
                { speaker: 'Ryan', text: 'Fruit trees, berry bushes, the fire drum, the mower...' },
                { speaker: 'Ryan', text: 'Everything a man needs.' }
            ]);
        }
    },

    onExit: function(game) {
        this._stopAmbientAudio();
    }
};

// Register scene
if (window.game) {
    window.game.registerScene('garden_back', GardenBackScene);
}

if (typeof module !== 'undefined') {
    module.exports = GardenBackScene;
}
