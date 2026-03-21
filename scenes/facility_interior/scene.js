/**
 * Facility Interior Scene - Inside the compound
 * Corridors leading to server room basement
 */

const FacilityInteriorScene = {
    id: 'facility_interior',
    name: 'Inside Steckerdoser Heide',
    
    background: 'assets/images/scenes/facility_interior.svg',
    
    description: 'Inside the compound. Sterile corridors. Fluorescent lights. The hum of ventilation systems.',
    
    playerStart: { x: 15, y: 85 },

    // 🎬 Accessibility / Movie Mode — contact Eva mesh, descend to server room
    accessibilityPath: ['eva_mesh', 'basement_stairs'],

    idleThoughts: [
        "Stay quiet. Move fast.",
        "Someone could turn that corner any second.",
        "Where's the basement access?",
        "Eva's guidance is keeping me alive.",
        "No cameras here. Good."
    ],
    
    state: {
        basementUnlocked: false,
        doorCodeEntered: false
    },
    
    hotspots: [
        {
            id: 'main_corridor',
            name: 'Main Corridor',
            x: 25,
            y: 30,
            width: 50,
            height: 40,
            cursor: 'look',
            action: function(game) {
                game.showDialogue([
                    "Long corridor. Doors on both sides.",
                    "Signs in German: 'LABOR 3', 'TECHNIK', 'ZUTRITT VERBOTEN'",
                    "Empty at this hour. Night shift is minimal."
                ], "Ryan");
            }
        },
        {
            id: 'eva_mesh',
            name: 'Meshtastic Device',
            x: 85,
            y: 5,
            width: 10,
            height: 8,
            cursor: 'pointer',
            action: function(game) {
                if (!FacilityInteriorScene.state.basementUnlocked) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: '*Checks Meshtastic — one hand steadying against the wall*' },
                        { speaker: 'Eva (Mesh)', text: 'Ryan. Status.' },
                        { speaker: 'Ryan', text: 'Inside. End of corridor. Which way?' },
                        { speaker: 'Eva (Mesh)', text: 'End of corridor. Stairwell marked KELLER B. Basement level. Server room is behind the first fire door.' },
                        { speaker: 'Eva (Mesh)', text: 'Biometric lock on server room. Override code: 2847. Don\'t type slowly.' },
                        { speaker: 'Ryan', text: 'Copy. Anything I should know?' },
                        { speaker: 'Eva (Mesh)', text: 'Night guard does rounds every 40 min. He was at your position 22 minutes ago. You have maybe 18 minutes before he loops back.' },
                        { speaker: 'Eva (Mesh)', text: 'Also — Volkov\'s in Lab 3. Working late. Don\'t make noise past that door.' },
                        { speaker: 'Ryan', text: 'Got it. Moving.' }
                    ]);
                    
                    setTimeout(() => {
                        game.showNotification('18 minutes before guard returns — reach the stairwell');
                        FacilityInteriorScene.state.basementUnlocked = true;
                    }, 1500);
                } else {
                    game.showDialogue([
                        "Eva's guidance: Basement stairwell marked KELLER B. Override code: 2847.",
                        "18-minute window. Guard rounds every 40 min."
                    ], "Ryan");
                }
            }
        },
        {
            id: 'security_office',
            name: 'Security Office',
            // SVG: translate(150, 480), rect width=180, height=280
            x: (150 / 1920) * 100,    // 7.81%
            y: (480 / 1080) * 100,    // 44.44%
            width: (180 / 1920) * 100, // 9.38%
            height: (280 / 1080) * 100, // 25.93%
            cursor: 'look',
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*Light is on inside. Voices — low, distracted.*' },
                    { speaker: 'Ryan', text: '*Presses close to wall beside the door*' },
                    { speaker: 'Narrator', text: '*German radio crackle. Two guards. Coffee mugs.*' },
                    { speaker: 'Ryan', text: 'Two of them. Not looking at the monitors. Talking football.' },
                    { speaker: 'Ryan', text: 'If they glance at cam feed 3... it\'s blank. They\'ll notice eventually.' },
                    { speaker: 'Ryan', text: 'Keep moving. Don\'t stop.' }
                ]);
            }
        },
        {
            id: 'lab_door',
            name: 'Laboratory 3',
            // SVG: translate(450, 500), rect width=160, height=250
            x: (450 / 1920) * 100,    // 23.44%
            y: (500 / 1080) * 100,    // 46.30%
            width: (160 / 1920) * 100, // 8.33%
            height: (250 / 1080) * 100, // 23.15%
            cursor: 'look',
            action: function(game) {
                game.showDialogue([
                    "'LABOR 3 - ELEKTRONIK'",
                    "Through the window: workbenches, oscilloscopes, drone components.",
                    "This is where they build it. The weapons."
                ], "Ryan");
            }
        },
        {
            id: 'basement_stairs',
            name: 'Basement Stairwell',
            // SVG: translate(1550, 520), rect width=140, height=220
            x: (1550 / 1920) * 100,   // 80.73%
            y: (520 / 1080) * 100,    // 48.15%
            width: (140 / 1920) * 100, // 7.29%
            height: (220 / 1080) * 100, // 20.37%
            cursor: 'pointer',
            enabled: () => FacilityInteriorScene.state.basementUnlocked,
            action: function(game) {
                game.startDialogue([
                    { speaker: 'Ryan', text: '*Reaches the stairwell door. Hand on the handle.*' },
                    { speaker: 'Narrator', text: '*Footsteps. Behind him. Heavy. Measured.*' },
                    { speaker: 'Ryan', text: '*Freezes*' },
                    { speaker: 'Narrator', text: '*A guard rounds the far corner. Doesn\'t look left.*' },
                    { speaker: 'Narrator', text: '*Keys jingle. He pushes through the exterior door. Gone.*' },
                    { speaker: 'Ryan', text: '*Lets out a slow breath* Not the 18-minute guard. A second one.' },
                    { speaker: 'Ryan', text: 'Eva didn\'t know about him. There\'s always something she didn\'t know.' },
                    { speaker: 'Narrator', text: '*Opens the stairwell door. Concrete stairs descending into dimness.*' },
                    { speaker: 'Ryan', text: 'Basement level. Server room. This is what it\'s all for.' },
                    { speaker: 'Narrator', text: '*Descends. Fluorescent lights hum. Air is colder. Colder.*' }
                ]);
                
                game.sceneTimeout(() => {
                    game.loadScene('laser_corridor');
                }, 3000);
            }
        },
        {
            id: 'exit_compound',
            name: '← Exit to Perimeter',
            x: 5,
            y: 85,
            width: 15,
            height: 12,
            cursor: 'exit',
            cssClass: 'hotspot-nav',
            skipWalk: true,
            action: function(game) {
                game.showDialogue([
                    "Back to the perimeter? Not yet.",
                    "Need to get that evidence first."
                ], "Ryan");
            }
        }
    ],
    
    // ── Ambient Audio ───────────────────────────────────────────
    _audioCtx: null, _audioNodes: [], _audioIntervals: [],
    _getAudioCtx: function() {
        if (!this._audioCtx) {
            try { this._audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch(e) { return null; }
        }
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },
    _stopAmbientAudio: function() {
        this._audioIntervals.forEach(function(id) { clearInterval(id); });
        this._audioIntervals = [];
        this._audioNodes.forEach(function(n) { try { if (n.stop) n.stop(); n.disconnect(); } catch(e) {} });
        this._audioNodes = [];
        if (this._audioCtx) { try { this._audioCtx.close(); } catch(e) {} this._audioCtx = null; }
    },
    _startAmbientAudio: function() {
        var self = this, ctx = this._getAudioCtx();
        if (!ctx) return;
        try {
            var master = ctx.createGain();
            master.gain.setValueAtTime(0, ctx.currentTime);
            master.gain.linearRampToValueAtTime(1, ctx.currentTime + 3);
            master.connect(ctx.destination);
            self._audioNodes.push(master);
            // ── fluorescent light hum (120 Hz) ──
            var fl = ctx.createOscillator(); fl.type = 'sine'; fl.frequency.value = 120;
            var flG = ctx.createGain(); flG.gain.value = 0.018;
            fl.connect(flG).connect(master); fl.start();
            self._audioNodes.push(fl, flG);
            // ── HVAC hiss ──
            var buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var hvac = ctx.createBufferSource(); hvac.buffer = buf; hvac.loop = true;
            var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
            var hG = ctx.createGain(); hG.gain.value = 0.020;
            hvac.connect(bp).connect(hG).connect(master); hvac.start();
            self._audioNodes.push(hvac, bp, hG);
            // ── subtle tension drone ──
            var dr = ctx.createOscillator(); dr.type = 'sine'; dr.frequency.value = 43;
            var drG = ctx.createGain(); drG.gain.value = 0.015;
            dr.connect(drG).connect(master); dr.start();
            self._audioNodes.push(dr, drG);
        } catch(e) {}
    },

    onEnter: (game) => {
        FacilityInteriorScene._startAmbientAudio();
        // Show ally coordination overlay
        if (window.AllyOverlay) window.AllyOverlay.show(game);
        game.showNotification('Inside the compound - Find the server room');
        
        if (!game.getFlag('facility_interior_entered')) {
            game.setFlag('facility_interior_entered', true);
            game.setFlag('entered_facility', true);
            
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*Inside Steckerdoser Heide. Fluorescent lights. Empty corridors.*' },
                    { speaker: 'Ryan', text: 'Night shift, minimal staff. Eva was right about that.' },
                    { speaker: 'Ryan', text: '*Meshtastic buzzes once — incoming*' },
                    { speaker: 'Ryan', text: 'Check the Meshtastic. Eva will have guidance.' }
                ]);
            }, 1000);
        }
    },
    
    onExit: () => {
        FacilityInteriorScene._stopAmbientAudio();
        if (window.AllyOverlay) window.AllyOverlay.hide();
    }
};
