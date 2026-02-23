/**
 * Scene: Garden
 * The view behind Ryan's house - wind turbines, German border, antenna
 */

const GardenScene = {
    id: 'garden',
    name: 'Garden - Backyard',
    
    background: 'assets/images/scenes/garden.svg',
    
    // Player starting position
    playerStart: { x: 50, y: 85 },
    
    // Random idle thoughts for this scene
    idleThoughts: [
        "Fresh air... nice.",
        "Those turbines are hypnotic.",
        "Germany's just over there.",
        "Antenna picking up weird stuff.",
        "Should maintain this more.",
        "Beautiful evening... espionage aside.",
        "Wind patterns tell their own story.",
        "Birds don't care about borders.",
        "That Volvo's seen some adventures.",
        "Garden therapy. Works every time.",
        "Clouds moving fast tonight.",
        "Rural life suits me fine.",
        "Clean air, clear signals.",
        "This antenna array is my pride.",
        "Nature and technology coexist.",
        "Every direction has a view.",
        "Crickets and RF noise.",
        "Could use some weeding.",
        "Peaceful. For now.",
        "This is why I moved here."
    ],
    
    hotspots: [
        {
            id: 'wind-turbines',
            name: 'Wind Turbines',
            // SVG: Three turbines at translate(800,200), (950,180), (1100,220)
            // Spans: x=795 to 1106 (~311px), y=100 to 460 (~360px)
            x: (795 / 1920) * 100,    // 41.41%
            y: (100 / 1080) * 100,    // 9.26%
            width: (311 / 1920) * 100, // 16.20%
            height: (360 / 1080) * 100, // 33.33%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: '16 wind turbines, 500 meters away. On the German border.' },
                    { speaker: 'Ryan', text: 'Red lights flicker at night. Some find it annoying.' },
                    { speaker: 'Ryan', text: 'I find it calming. Reminds me the world keeps moving.' },
                    { speaker: 'Ryan', text: 'Steckerdoser Heide facility... not far from here.' }
                ]);
            }
        },
        {
            id: 'antenna',
            name: 'Large Antenna',
            // SVG: house at translate(50,300), antenna at translate(100,-20)
            // Yagi at x=-60, y=-140, w=120; mast goes to y=-150
            // Actual: x=50+100-60=90, y=300-20-150=130, w=120, h=150
            x: (90 / 1920) * 100,     // 4.69%
            y: (130 / 1080) * 100,    // 12.04%
            width: (120 / 1920) * 100, // 6.25%
            height: (150 / 1080) * 100, // 13.89%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My antenna array. For amateur radio.' },
                    { speaker: 'Ryan', text: 'Picks up signals from far away. VHF, UHF, satellites.' },
                    { speaker: 'Ryan', text: 'Neighbors think I\'m crazy. They\'re not wrong.' }
                ]);
            }
        },
        {
            id: 'flower-beds',
            name: 'Flower Beds',
            // SVG: Left bed at translate(650,500), Right at translate(750,520)
            // Left: ellipse rx=100 cx=80 → abs x=630; Right: rx=120 cx=100 → abs x=970
            // Combined: x=630, y=488, w=340, h=112
            x: (630 / 1920) * 100,    // 32.81%
            y: (488 / 1080) * 100,    // 45.19%
            width: (340 / 1920) * 100, // 17.71%
            height: (112 / 1080) * 100, // 10.37%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'I keep some flowers growing. Adds color.' },
                    { speaker: 'Ryan', text: 'Low-maintenance stuff. I\'m a hacker, not a gardener.' }
                ]);
            }
        },
        {
            id: 'landscape',
            name: 'View of Acres',
            // SVG: Distant grass y=400-500, width=1920
            x: (420 / 1920) * 100,    // 21.88%
            y: (370 / 1080) * 100,    // 34.26%
            width: (1100 / 1920) * 100, // 57.29%
            height: (110 / 1080) * 100, // 10.19%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Endless flat Drenthe. Acres to the horizon.' },
                    { speaker: 'Ryan', text: 'Germany in the distance. Fields, farms, turbines.' },
                    { speaker: 'Ryan', text: 'Quiet. Peaceful. Nothing ever happens here.' },
                    { speaker: 'Ryan', text: 'Or so I thought...' }
                ]);
            }
        },
        {
            id: 'shed',
            name: 'Garden Shed',
            // SVG: translate(1500,400), roof at y=-20, base h=180
            // Actual: x=1500, y=380, w=200, h=250
            x: (1500 / 1920) * 100,   // 78.13%
            y: (380 / 1080) * 100,    // 35.19%
            width: (200 / 1920) * 100, // 10.42%
            height: (250 / 1080) * 100, // 23.15%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The garden shed. Full of tools I never use.' },
                    { speaker: 'Ryan', text: 'And probably a few spiders.' }
                ]);
            }
        },
        {
            id: 'bench',
            name: 'Garden Bench',
            // SVG: translate(1000,580), w=150, h=80
            x: (1000 / 1920) * 100,   // 52.08%
            y: (580 / 1080) * 100,    // 53.70%
            width: (150 / 1920) * 100, // 7.81%
            height: (80 / 1080) * 100, // 7.41%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A nice spot to sit and think.' },
                    { speaker: 'Ryan', text: 'Or debug code on my laptop.' }
                ]);
            }
        },
        {
            id: 'tree',
            name: 'Large Tree',
            // SVG: translate(1700,300), canopy top at cy=60-ry=60→abs y=300, trunk to y=350→abs y=650
            // Actual: x=1570, y=300, w=270, h=350
            x: (1570 / 1920) * 100,   // 81.77%
            y: (300 / 1080) * 100,    // 27.78%
            width: (270 / 1920) * 100, // 14.06%
            height: (350 / 1080) * 100, // 32.41%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'A big old oak tree. Been here longer than the house.' }
                ]);
            }
        },
        {
            id: 'house-back',
            name: 'Farmhouse Back',
            // SVG: translate(50,300), roof from y=-30 to y=100, house to y=350
            // Actual: x=50, y=270, w=350, h=280
            x: (50 / 1920) * 100,     // 2.60%
            y: (270 / 1080) * 100,    // 25.00%
            width: (350 / 1920) * 100, // 18.23%
            height: (280 / 1080) * 100, // 25.93%
            cursor: 'pointer',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'Home sweet home. An old Dutch farmhouse.' },
                    { speaker: 'Ryan', text: 'Thick walls, good insulation... and plenty of space for antennas.' }
                ]);
            }
        },
        {
            id: 'door-house',
            name: 'Back Door to House',
            // SVG: house at translate(50,300), door at translate(250,150)
            // Actual: x=50+250=300, y=300+150=450, w=80, h=200
            x: (300 / 1920) * 100,    // 15.63%
            y: (450 / 1080) * 100,    // 41.67%
            width: (80 / 1920) * 100,  // 4.17%
            height: (200 / 1080) * 100, // 18.52%
            cursor: 'pointer',
            targetScene: 'home'
        },
        {
            id: 'mancave',
            name: 'Mancave',
            // SVG: translate(400,370), garage door at x=20,y=110 w=120 h=170
            // Actual: x=400+20=420, y=370+110=480, w=120, h=170
            x: (420 / 1920) * 100,    // 21.88%
            y: (480 / 1080) * 100,    // 44.44%
            width: (120 / 1920) * 100, // 6.25%
            height: (170 / 1080) * 100, // 15.74%
            cursor: 'pointer',
            targetScene: 'mancave'
        },
        {
            id: 'volvo',
            name: 'Old Volvo',
            // SVG: Parked near the shed on right side
            x: 78,
            y: 55,
            width: 10,
            height: 15,
            cursor: 'pointer',
            action: function(game) {
                GardenScene._showVolvoDestinations(game);
            }
        }
    ],

    /* ─── Volvo Destination Picker ─────────────────────────────── */

    _injectPickerStyles: function() {
        if (document.getElementById('volvo-picker-style')) return;
        const style = document.createElement('style');
        style.id = 'volvo-picker-style';
        style.textContent = `
/* === VOLVO DESTINATION PICKER === */
#volvo-picker-overlay {
    position: fixed; inset: 0; z-index: 8000;
    background: rgba(0,0,0,0.85);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.4s ease;
    cursor: default;
}
#volvo-picker-overlay.visible { opacity: 1; }

.volvo-picker {
    background: linear-gradient(180deg, #0a1520 0%, #070d14 100%);
    border: 1px solid rgba(0,255,255,0.15);
    border-radius: 4px; padding: 0; width: 480px; max-width: 92vw;
    max-height: 85vh; overflow-y: auto;
    box-shadow: 0 0 60px rgba(0,255,255,0.08), 0 0 1px rgba(0,255,255,0.3);
    position: relative;
}

/* Header */
.vp-header {
    padding: 22px 28px 16px;
    border-bottom: 1px solid rgba(0,255,255,0.08);
    text-align: center;
}
.vp-car-ascii {
    font-family: 'Courier New', monospace;
    font-size: 0.55em; line-height: 1.15;
    color: rgba(0,255,255,0.25);
    margin-bottom: 12px; white-space: pre;
    letter-spacing: 1px;
}
.vp-title {
    font-family: 'Courier New', monospace;
    font-size: 1.1em; letter-spacing: 6px;
    color: rgba(0,255,255,0.7);
    text-transform: uppercase; margin: 0;
}
.vp-subtitle {
    font-family: 'Georgia', serif;
    font-size: 0.78em; color: rgba(255,255,255,0.3);
    margin-top: 6px; letter-spacing: 1px;
}

/* Destination list */
.vp-destinations {
    padding: 8px 12px 12px;
}

.vp-dest {
    display: flex; align-items: stretch; gap: 14px;
    padding: 14px 16px; margin: 6px 0;
    background: rgba(0,255,255,0.02);
    border: 1px solid rgba(0,255,255,0.06);
    border-radius: 3px; cursor: pointer;
    transition: all 0.25s ease;
    position: relative; overflow: hidden;
}
.vp-dest:hover {
    background: rgba(0,255,255,0.06);
    border-color: rgba(0,255,255,0.2);
    transform: translateX(3px);
}
.vp-dest:hover .vp-dest-name { color: #00ffff; }
.vp-dest:active { transform: translateX(3px) scale(0.99); }

/* Scan line on hover */
.vp-dest::before {
    content: ''; position: absolute;
    top: 0; left: -100%; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0,255,255,0.04), transparent);
    transition: left 0.4s ease;
    pointer-events: none;
}
.vp-dest:hover::before { left: 100%; }

/* Completed / visited */
.vp-dest.visited {
    opacity: 0.35; cursor: default;
    border-color: rgba(255,255,255,0.04);
}
.vp-dest.visited:hover {
    background: rgba(0,255,255,0.02);
    border-color: rgba(255,255,255,0.06);
    transform: none;
}
.vp-dest.visited .vp-dest-name { color: rgba(255,255,255,0.4) !important; }

/* Urgent / recommended */
.vp-dest.urgent {
    border-color: rgba(255,215,0,0.2);
    background: rgba(255,215,0,0.03);
}
.vp-dest.urgent:hover {
    border-color: rgba(255,215,0,0.35);
    background: rgba(255,215,0,0.06);
}
.vp-dest.urgent .vp-dest-name { color: #ffd700; }
.vp-dest.urgent:hover .vp-dest-name { color: #ffe44d; }

/* Icon */
.vp-dest-icon {
    font-size: 1.6em; min-width: 36px;
    display: flex; align-items: center; justify-content: center;
}

/* Text block */
.vp-dest-info { flex: 1; min-width: 0; }
.vp-dest-name {
    font-family: 'Courier New', monospace;
    font-size: 0.88em; letter-spacing: 2px;
    color: rgba(255,255,255,0.75);
    text-transform: uppercase;
    transition: color 0.25s ease;
    margin: 0 0 3px;
}
.vp-dest-desc {
    font-family: 'Georgia', serif;
    font-size: 0.78em; color: rgba(255,255,255,0.35);
    line-height: 1.5; margin: 0;
}
.vp-dest-meta {
    display: flex; align-items: center; gap: 12px;
    margin-top: 6px;
}
.vp-dest-distance {
    font-family: 'Courier New', monospace;
    font-size: 0.65em; letter-spacing: 1px;
    color: rgba(0,255,255,0.45);
}
.vp-dest-tag {
    font-family: 'Courier New', monospace;
    font-size: 0.55em; letter-spacing: 2px;
    padding: 2px 8px; border-radius: 2px;
    text-transform: uppercase;
}
.vp-tag-night {
    color: rgba(100,140,255,0.7);
    background: rgba(100,140,255,0.08);
    border: 1px solid rgba(100,140,255,0.15);
}
.vp-tag-day {
    color: rgba(255,200,80,0.7);
    background: rgba(255,200,80,0.08);
    border: 1px solid rgba(255,200,80,0.15);
}
.vp-tag-visited {
    color: rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
}
.vp-tag-urgent {
    color: rgba(255,80,80,0.8);
    background: rgba(255,80,80,0.08);
    border: 1px solid rgba(255,80,80,0.15);
    animation: vp-urgent-pulse 2s ease-in-out infinite;
}
@keyframes vp-urgent-pulse {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.5; }
}

/* Arrow */
.vp-dest-arrow {
    display: flex; align-items: center;
    font-family: 'Courier New', monospace;
    font-size: 1.1em; color: rgba(0,255,255,0.15);
    transition: color 0.25s ease, transform 0.25s ease;
}
.vp-dest:hover .vp-dest-arrow { color: rgba(0,255,255,0.5); transform: translateX(3px); }
.vp-dest.visited .vp-dest-arrow { display: none; }

/* Footer */
.vp-footer {
    padding: 12px 28px 18px;
    border-top: 1px solid rgba(0,255,255,0.06);
    text-align: center;
}
.vp-stay-btn {
    font-family: 'Courier New', monospace;
    font-size: 0.72em; letter-spacing: 3px;
    color: rgba(255,255,255,0.25);
    background: none; border: 1px solid rgba(255,255,255,0.08);
    padding: 8px 24px; cursor: pointer;
    border-radius: 2px; text-transform: uppercase;
    transition: all 0.25s ease;
}
.vp-stay-btn:hover {
    color: rgba(255,255,255,0.6);
    border-color: rgba(255,255,255,0.2);
}

/* Responsive */
@media (max-width: 520px) {
    .volvo-picker { width: 96vw; }
    .vp-header { padding: 16px 18px 12px; }
    .vp-dest { padding: 10px 12px; }
    .vp-dest-icon { font-size: 1.3em; min-width: 28px; }
    .vp-dest-name { font-size: 0.78em; }
    .vp-car-ascii { font-size: 0.45em; }
}
`;
        document.head.appendChild(style);
    },

    _getAvailableDestinations: function(game) {
        const destinations = [];

        // Ter Apel Klooster — night drive east
        if (game.getFlag('klooster_unlocked')) {
            const visited = !!game.getFlag('visited_klooster');
            destinations.push({
                id: 'klooster',
                name: 'Ter Apel Klooster',
                desc: 'Medieval monastery. Someone is watching.',
                distance: '20 min · East',
                icon: '🏛',
                drivingScene: 'driving',
                drivingDest: 'klooster',
                night: true,
                visited: visited,
                urgent: !visited
            });
        }

        // ASTRON / WSRT — day drive south-west
        if (game.getFlag('astron_unlocked')) {
            const visited = !!game.getFlag('visited_astron');
            destinations.push({
                id: 'astron',
                name: 'ASTRON / WSRT',
                desc: 'Westerbork Synthesis Radio Telescope. Cees Bassa.',
                distance: '40 min · South-west',
                icon: '📡',
                drivingScene: 'driving_day',
                drivingDest: 'astron',
                night: false,
                visited: visited,
                urgent: !visited
            });
        }

        // Steckerdoser Heide — night infiltration
        if (game.questManager && game.questManager.hasQuest('infiltrate_facility')) {
            const visited = !!game.getFlag('drove_to_facility');
            destinations.push({
                id: 'facility',
                name: 'Steckerdoser Heide',
                desc: 'German military research facility. Eva is waiting.',
                distance: '15 min · South (border)',
                icon: '⚠️',
                drivingScene: 'driving',
                drivingDest: 'facility',
                night: true,
                visited: visited,
                urgent: !visited,
                onSelect: function() { game.setFlag('drove_to_facility', true); }
            });
        }

        // Dwingeloo Observatory — accessible after visiting ASTRON
        if (game.getFlag('visited_astron')) {
            destinations.push({
                id: 'dwingeloo',
                name: 'Dwingeloo Observatory',
                desc: 'Historic 25-metre radio telescope, deep in the forest.',
                distance: '35 min · South-west',
                icon: '🔭',
                directScene: 'dwingeloo',
                night: false,
                visited: !!game.getFlag('visited_dwingeloo'),
                urgent: false
            });
        }

        // Westerbork Memorial — accessible after visiting klooster
        if (game.getFlag('visited_klooster')) {
            destinations.push({
                id: 'westerbork',
                name: 'Westerbork Memorial',
                desc: 'Camp Westerbork. A place to remember.',
                distance: '30 min · South-west',
                icon: '✡️',
                directScene: 'westerbork_memorial',
                night: false,
                visited: !!game.getFlag('visited_westerbork_memorial'),
                urgent: false
            });
        }

        return destinations;
    },

    _showVolvoDestinations: function(game) {
        this._injectPickerStyles();

        const destinations = this._getAvailableDestinations(game);

        // No destinations unlocked yet
        if (destinations.length === 0) {
            game.startDialogue([
                { speaker: 'Ryan', text: 'My old Volvo 240. She\'s parked behind the shed.' },
                { speaker: 'Ryan', text: 'No reason to go anywhere right now.' }
            ]);
            return;
        }

        // Check if anything is actually available (not visited)
        const available = destinations.filter(function(d) { return !d.visited; });
        if (available.length === 0) {
            game.startDialogue([
                { speaker: 'Ryan', text: 'My old Volvo 240. She\'s earned her rest today.' },
                { speaker: 'Ryan', text: 'Already been everywhere I need to go.' }
            ]);
            return;
        }

        // Remove existing picker if any
        var existing = document.getElementById('volvo-picker-overlay');
        if (existing) existing.remove();

        // Build the overlay
        var overlay = document.createElement('div');
        overlay.id = 'volvo-picker-overlay';

        var picker = document.createElement('div');
        picker.className = 'volvo-picker';

        // Header with ASCII Volvo
        picker.innerHTML =
            '<div class="vp-header">' +
                '<div class="vp-car-ascii">' +
                    '        _______________\n' +
                    '       //  ___   ___   \\\\\n' +
                    '  ____//__|___|_|___|__\\\\____\n' +
                    ' |  _     VOLVO 240     _   |\n' +
                    ' |_( )_________________( )__|\n' +
                    '   (___) PD-55-NL  (___)\n' +
                '</div>' +
                '<div class="vp-title">Where to, Ryan?</div>' +
                '<div class="vp-subtitle">Choose your destination</div>' +
            '</div>' +
            '<div class="vp-destinations" id="vp-dest-list"></div>' +
            '<div class="vp-footer">' +
                '<button class="vp-stay-btn" id="vp-stay-btn">Stay here</button>' +
            '</div>';

        overlay.appendChild(picker);
        document.body.appendChild(overlay);

        // Populate destinations
        var destList = document.getElementById('vp-dest-list');
        var self = this;

        destinations.forEach(function(dest) {
            var card = document.createElement('div');
            card.className = 'vp-dest';
            if (dest.visited) card.classList.add('visited');
            if (dest.urgent && !dest.visited) card.classList.add('urgent');

            // Tags
            var tags = '';
            if (dest.visited) {
                tags += '<span class="vp-dest-tag vp-tag-visited">Visited</span>';
            } else {
                if (dest.night) {
                    tags += '<span class="vp-dest-tag vp-tag-night">Night</span>';
                } else {
                    tags += '<span class="vp-dest-tag vp-tag-day">Day</span>';
                }
                if (dest.urgent) {
                    tags += '<span class="vp-dest-tag vp-tag-urgent">Story</span>';
                }
            }

            card.innerHTML =
                '<div class="vp-dest-icon">' + dest.icon + '</div>' +
                '<div class="vp-dest-info">' +
                    '<div class="vp-dest-name">' + dest.name + '</div>' +
                    '<div class="vp-dest-desc">' + dest.desc + '</div>' +
                    '<div class="vp-dest-meta">' +
                        '<span class="vp-dest-distance">' + dest.distance + '</span>' +
                        tags +
                    '</div>' +
                '</div>' +
                '<div class="vp-dest-arrow">&#9654;</div>';

            if (!dest.visited) {
                card.addEventListener('click', function() {
                    self._closePicker();

                    // Pre-drive callback (e.g. set flags)
                    if (dest.onSelect) dest.onSelect();

                    if (dest.drivingScene) {
                        // Full driving scene with monologue
                        game.setFlag('driving_destination', dest.drivingDest);
                        game.loadScene(dest.drivingScene);
                    } else if (dest.directScene) {
                        // Direct scene load (no driving monologue)
                        game.loadScene(dest.directScene);
                    }
                });
            }

            destList.appendChild(card);
        });

        // Stay button
        document.getElementById('vp-stay-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            self._closePicker();
        });

        // Click overlay background to close
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) self._closePicker();
        });

        // Escape key to close
        self._pickerEscHandler = function(e) {
            if (e.key === 'Escape') self._closePicker();
        };
        document.addEventListener('keydown', self._pickerEscHandler);

        // Fade in
        requestAnimationFrame(function() {
            overlay.classList.add('visible');
        });
    },

    _closePicker: function() {
        var overlay = document.getElementById('volvo-picker-overlay');
        if (overlay) {
            overlay.classList.remove('visible');
            setTimeout(function() { overlay.remove(); }, 400);
        }
        if (this._pickerEscHandler) {
            document.removeEventListener('keydown', this._pickerEscHandler);
            this._pickerEscHandler = null;
        }
    },

    /* ═══════════════════════════════════════════════════════
     *  AMBIENT NATURE AUDIO — Web Audio API synthesis
     *  Birds singing, bees buzzing, wind, distant turbines
     * ═══════════════════════════════════════════════════════ */
    _audioCtx: null,
    _audioNodes: [],
    _audioIntervals: [],

    _getAudioCtx: function() {
        if (!this._audioCtx) {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },

    _startAmbientAudio: function() {
        var self = this;
        try {
            var ctx = self._getAudioCtx();
            var master = ctx.createGain();
            master.gain.setValueAtTime(0, ctx.currentTime);
            master.gain.linearRampToValueAtTime(1, ctx.currentTime + 3);
            master.connect(ctx.destination);
            self._audioNodes.push(master);

            // ── WIND (filtered noise via oscillators) ──
            var windGain = ctx.createGain();
            windGain.gain.value = 0.025;
            var windFilter = ctx.createBiquadFilter();
            windFilter.type = 'lowpass';
            windFilter.frequency.value = 400;
            // Simulate wind with detuned oscillators
            for (var w = 0; w < 3; w++) {
                var windOsc = ctx.createOscillator();
                windOsc.type = 'sawtooth';
                windOsc.frequency.value = 80 + w * 15;
                windOsc.detune.value = Math.random() * 20 - 10;
                var windOscGain = ctx.createGain();
                windOscGain.gain.value = 0.01;
                windOsc.connect(windOscGain).connect(windFilter);
                windOsc.start();
                self._audioNodes.push(windOsc, windOscGain);
            }
            windFilter.connect(windGain).connect(master);
            self._audioNodes.push(windFilter, windGain);

            // Wind modulation (gusts)
            var windLfo = ctx.createOscillator();
            windLfo.type = 'sine';
            windLfo.frequency.value = 0.15;
            var windLfoGain = ctx.createGain();
            windLfoGain.gain.value = 0.012;
            windLfo.connect(windLfoGain).connect(windGain.gain);
            windLfo.start();
            self._audioNodes.push(windLfo, windLfoGain);

            // ── DISTANT TURBINE HUM ──
            var turbGain = ctx.createGain();
            turbGain.gain.value = 0.008;
            var turbFilter = ctx.createBiquadFilter();
            turbFilter.type = 'bandpass';
            turbFilter.frequency.value = 120;
            turbFilter.Q.value = 2;
            var turbOsc = ctx.createOscillator();
            turbOsc.type = 'sine';
            turbOsc.frequency.value = 55;
            turbOsc.connect(turbFilter).connect(turbGain).connect(master);
            turbOsc.start();
            self._audioNodes.push(turbOsc, turbFilter, turbGain);

            // Turbine blade swoosh (very subtle LFO)
            var turbLfo = ctx.createOscillator();
            turbLfo.type = 'sine';
            turbLfo.frequency.value = 0.8;
            var turbLfoGain = ctx.createGain();
            turbLfoGain.gain.value = 0.003;
            turbLfo.connect(turbLfoGain).connect(turbGain.gain);
            turbLfo.start();
            self._audioNodes.push(turbLfo, turbLfoGain);

            // ── BIRD SONGS (periodic chirps) ──
            function chirpBird(delay, baseFreq, pattern) {
                var interval = setInterval(function() {
                    if (!self._audioCtx) return;
                    try {
                        var now = ctx.currentTime;
                        var birdGain = ctx.createGain();
                        var birdFilter = ctx.createBiquadFilter();
                        birdFilter.type = 'bandpass';
                        birdFilter.frequency.value = baseFreq;
                        birdFilter.Q.value = 8;
                        birdGain.gain.setValueAtTime(0, now);

                        var noteTime = now;
                        for (var n = 0; n < pattern.length; n++) {
                            var note = pattern[n];
                            var osc = ctx.createOscillator();
                            osc.type = 'sine';
                            osc.frequency.setValueAtTime(note.freq, noteTime);
                            if (note.slide) {
                                osc.frequency.linearRampToValueAtTime(note.slide, noteTime + note.dur);
                            }
                            osc.connect(birdFilter);
                            birdGain.gain.setValueAtTime(0, noteTime);
                            birdGain.gain.linearRampToValueAtTime(note.vol || 0.04, noteTime + 0.01);
                            birdGain.gain.linearRampToValueAtTime(note.vol || 0.04, noteTime + note.dur - 0.02);
                            birdGain.gain.linearRampToValueAtTime(0, noteTime + note.dur);
                            osc.start(noteTime);
                            osc.stop(noteTime + note.dur + 0.01);
                            noteTime += note.dur + (note.gap || 0.05);
                        }
                        birdFilter.connect(birdGain).connect(master);
                    } catch (e) { /* silent */ }
                }, delay + Math.random() * 2000);
                self._audioIntervals.push(interval);
            }

            // Robin song — descending trill
            chirpBird(3000, 3000, [
                { freq: 3200, slide: 3600, dur: 0.08, vol: 0.03 },
                { freq: 3600, slide: 3200, dur: 0.1, vol: 0.035 },
                { freq: 3400, slide: 2800, dur: 0.12, vol: 0.03 },
                { freq: 2800, dur: 0.06, vol: 0.025, gap: 0.1 },
                { freq: 3000, slide: 3500, dur: 0.08, vol: 0.03 },
                { freq: 3500, slide: 2600, dur: 0.15, vol: 0.035 }
            ]);

            // Blackbird — slower melodic phrase
            chirpBird(5000, 2200, [
                { freq: 2200, slide: 2800, dur: 0.2, vol: 0.03, gap: 0.08 },
                { freq: 2600, dur: 0.15, vol: 0.025, gap: 0.06 },
                { freq: 2400, slide: 1800, dur: 0.25, vol: 0.03, gap: 0.15 },
                { freq: 2000, slide: 2400, dur: 0.18, vol: 0.025 }
            ]);

            // Great tit — "teacher teacher" two-note
            chirpBird(4000, 3800, [
                { freq: 3800, dur: 0.12, vol: 0.025, gap: 0.08 },
                { freq: 3200, dur: 0.12, vol: 0.025, gap: 0.2 },
                { freq: 3800, dur: 0.12, vol: 0.025, gap: 0.08 },
                { freq: 3200, dur: 0.12, vol: 0.025 }
            ]);

            // Distant cuckoo (low, periodic)
            chirpBird(8000, 800, [
                { freq: 700, dur: 0.3, vol: 0.015, gap: 0.25 },
                { freq: 550, dur: 0.35, vol: 0.012 }
            ]);

            // Sparrow chatter (quick random chirps)
            chirpBird(2500, 4500, [
                { freq: 4200, dur: 0.04, vol: 0.02, gap: 0.03 },
                { freq: 4800, dur: 0.03, vol: 0.018, gap: 0.04 },
                { freq: 4500, dur: 0.04, vol: 0.02, gap: 0.03 },
                { freq: 4000, dur: 0.05, vol: 0.015 }
            ]);

            // ── BEE BUZZ (continuous, subtle) ──
            var beeGain = ctx.createGain();
            beeGain.gain.value = 0.006;
            var beeFilter = ctx.createBiquadFilter();
            beeFilter.type = 'bandpass';
            beeFilter.frequency.value = 220;
            beeFilter.Q.value = 3;
            var beeOsc1 = ctx.createOscillator();
            beeOsc1.type = 'sawtooth';
            beeOsc1.frequency.value = 190;
            var beeOsc2 = ctx.createOscillator();
            beeOsc2.type = 'square';
            beeOsc2.frequency.value = 195;
            beeOsc1.connect(beeFilter);
            beeOsc2.connect(beeFilter);
            beeFilter.connect(beeGain).connect(master);
            beeOsc1.start();
            beeOsc2.start();
            self._audioNodes.push(beeOsc1, beeOsc2, beeFilter, beeGain);

            // Bee buzz modulation (fly-by effect)
            var beeLfo = ctx.createOscillator();
            beeLfo.type = 'sine';
            beeLfo.frequency.value = 0.3;
            var beeLfoGain = ctx.createGain();
            beeLfoGain.gain.value = 30;
            beeLfo.connect(beeLfoGain).connect(beeOsc1.frequency);
            beeLfo.start();
            self._audioNodes.push(beeLfo, beeLfoGain);

            // ── CRICKET CHIRPS (evening atmosphere) ──
            var cricketInterval = setInterval(function() {
                if (!self._audioCtx) return;
                try {
                    var now = ctx.currentTime;
                    for (var c = 0; c < 3 + Math.floor(Math.random() * 3); c++) {
                        var cOsc = ctx.createOscillator();
                        var cGain = ctx.createGain();
                        cOsc.type = 'sine';
                        cOsc.frequency.value = 5500 + Math.random() * 1000;
                        var t = now + c * 0.06;
                        cGain.gain.setValueAtTime(0, t);
                        cGain.gain.linearRampToValueAtTime(0.008, t + 0.01);
                        cGain.gain.linearRampToValueAtTime(0, t + 0.04);
                        cOsc.connect(cGain).connect(master);
                        cOsc.start(t);
                        cOsc.stop(t + 0.05);
                    }
                } catch (e) { /* silent */ }
            }, 1200 + Math.random() * 800);
            self._audioIntervals.push(cricketInterval);

        } catch (e) {
            console.log('[Garden] Audio init failed:', e);
        }
    },

    _stopAmbientAudio: function() {
        this._audioIntervals.forEach(function(id) { clearInterval(id); });
        this._audioIntervals = [];
        this._audioNodes.forEach(function(node) {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) { /* already stopped */ }
        });
        this._audioNodes = [];
    },

    /* ═══════════════════════════════════════════════════════
     *  SCENE LIFECYCLE
     * ═══════════════════════════════════════════════════════ */
    onEnter: function(game) {
        document.getElementById('scene-background').className = 'scene-garden';

        // Start ambient nature sounds
        this._startAmbientAudio();
        
        if (!game.getFlag('visited_garden')) {
            game.setFlag('visited_garden', true);
            game.startDialogue([
                { speaker: '', text: 'The garden. View of the Dutch-German border.' },
                { speaker: 'Ryan', text: 'Fresh air. Almost want to go for a walk.' },
                { speaker: 'Ryan', text: 'Almost.' }
            ]);
        }
    },

    onExit: function(game) {
        this._stopAmbientAudio();
    }
};

// Register scene when loaded
if (window.game) {
    window.game.registerScene('garden', GardenScene);
}

if (typeof module !== 'undefined') {
    module.exports = GardenScene;
}
