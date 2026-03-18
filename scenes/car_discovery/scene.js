/**
 * Bench Discovery Scene - USB Stick Under the Stone Bench
 * Ryan retrieves the USB stick taped under the stone bench at Ter Apel Klooster
 */

const CarDiscoveryScene = {
    id: 'car_discovery',
    name: 'Stone Bench',
    
    // SVG background - monastery bench with USB detail inset
    background: 'assets/images/scenes/car_discovery.svg',
    
    // Ambient description
    description: 'The stone bench in the monastery courtyard. Something is taped underneath the seat.',
    
    // Player starting position (off-screen, this is a static discovery scene)
    playerStart: { x: 50, y: 90 },

    // 🎥 Accessibility / Movie Mode
    accessibilityPath: ['usb_stick', 'under_bench', 'car'],

    // Scene hotspots
    hotspots: [
        {
            id: 'usb_stick',
            name: 'USB Stick',
            // The USB stick is in the detail inset - upper right quadrant
            // Inset box: translate(1150,150), rect 700x550 → abs (1150,150)-(1850,700)
            x: 60,   // (1150/1920) * 100
            y: 14,   // (150/1080) * 100
            width: 36.5,  // (700/1920) * 100
            height: 51,   // (550/1080) * 100
            cursor: 'use',
            action: function(game) {
                if (!game.getFlag('picked_up_usb')) {
                    game.setFlag('picked_up_usb', true);
                    
                    game.startDialogue([
                        { speaker: 'Narrator', text: '*Ryan carefully peels the USB stick from under the stone bench*' },
                        { speaker: 'Ryan', text: 'A piece of tape wrapped around it with handwritten text...' },
                        { speaker: 'Narrator', text: '"TRUST THE PROCESS - AIR-GAPPED ONLY"' },
                        { speaker: 'Ryan', text: 'They watched me walk in. Watched me search the courtyard.' },
                        { speaker: 'Ryan', text: 'Never meant to meet face-to-face.' },
                        { speaker: 'Ryan', text: 'This IS the meeting.' },
                        { speaker: 'Ryan', text: 'Back to the mancave. Time to see what this is.' }
                    ]);
                    
                    // Give USB stick item
                    game.addItem({
                        id: 'usb_stick',
                        name: 'USB Stick',
                        description: 'Black USB stick with note: "TRUST THE PROCESS - AIR-GAPPED ONLY". Taped under a monastery bench — whoever left this planned every detail.',
                        icon: 'assets/images/icons/usb-stick.svg'
                    });
                    
                    // Complete go_to_klooster quest and add new one
                    if (game.questManager && game.questManager.hasQuest('go_to_klooster')) {
                        game.questManager.complete('go_to_klooster');
                    }
                    
                    game.addQuest({
                        id: 'analyze_usb',
                        name: 'Analyze USB Stick',
                        description: 'Examine the USB stick on an air-gapped machine. Find out what "E" wants me to see.',
                        hint: 'Use the air-gapped laptop in the mancave'
                    });
                    
                    setTimeout(() => {
                        game.showNotification('Click the car to get in and drive home');
                    }, 2000);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Already got the USB stick. Time to go home.' }
                    ]);
                }
            }
        },
        {
            id: 'under_bench',
            name: 'Underside of Bench',
            // The central underside of the bench seat (between the legs)
            x: 21,  // (400/1920) * 100
            y: 44,  // (480/1080) * 100
            width: 58,  // (1120/1920) * 100
            height: 11,  // (115/1080) * 100
            cursor: 'look',
            action: function(game) {
                if (!game.getFlag('picked_up_usb')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Wait. What the hell?' },
                        { speaker: 'Ryan', text: 'There\'s something taped under the bench seat...' },
                        { speaker: 'Narrator', text: '*A USB stick. Someone WAS here.*' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Just the empty bench now. The USB is safely in my pocket.' }
                    ]);
                }
            }
        },
        {
            id: 'car',
            name: 'Get in Car',
            // Volvo parked in background (left side)
            x: 2,
            y: 55,
            width: 20,
            height: 28,
            cursor: 'use',
            action: function(game) {
                if (game.getFlag('picked_up_usb')) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: '*Gets in the car*' },
                        { speaker: 'Narrator', text: '*Engine starts. Time to head home.*' }
                    ]);
                    
                    game.sceneTimeout(() => {
                        console.log('Car Discovery: Setting driving_destination to home');
                        game.setFlag('driving_destination', 'home');
                        console.log('Car Discovery: Loading driving scene');
                        game.loadScene('driving');
                    }, 2000);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Not yet. I need to get that USB stick from under the bench.' }
                    ]);
                }
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
            // ── night wind ──
            var buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var wind = ctx.createBufferSource(); wind.buffer = buf; wind.loop = true;
            var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 280;
            var wG = ctx.createGain(); wG.gain.value = 0.030;
            wind.connect(lp).connect(wG).connect(master); wind.start();
            self._audioNodes.push(wind, lp, wG);
        } catch(e) {}
    },

    // Scene entry
    onEnter: function(game) {
        CarDiscoveryScene._startAmbientAudio();
        console.log('[Car Discovery] Scene entered');
        console.log('[Car Discovery] Flags:', {
            saw_usb_first_time: game.getFlag('saw_usb_first_time'),
            picked_up_usb: game.getFlag('picked_up_usb')
        });
        
        if (!game.getFlag('saw_usb_first_time')) {
            game.setFlag('saw_usb_first_time', true);
            
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Narrator', text: '*Ryan passes the stone bench on the way to his car*' },
                    { speaker: 'Ryan', text: 'Nobody came. What a waste—' },
                    { speaker: 'Ryan', text: 'Wait. What the hell?' },
                    { speaker: 'Ryan', text: 'There\'s something taped under the bench...' }
                ]);
                
                setTimeout(() => {
                    game.showNotification('⚠️ Click the USB STICK in the detail box (upper right) to examine it!');
                }, 3000);
            }, 500);
        } else {
            // Returning to scene
            if (!game.getFlag('picked_up_usb')) {
                game.showNotification('Click the USB STICK in the detail box (upper right)');
            } else {
                game.showNotification('Click the car to drive home');
            }
        }
    },
    
    // Scene exit
    onExit: function(game) {
        CarDiscoveryScene._stopAmbientAudio();
        console.log('[Car Discovery] Scene exited');
    }
};

// Scene will be registered in index.html initGame() function
