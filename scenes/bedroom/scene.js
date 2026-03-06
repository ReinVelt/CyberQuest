/**
 * Bedroom Scene — Night
 * Everyone sleeping. No speech, no voices.
 * Random dream think-balloons float above Ryan, Ax, Max, Kessy and Tino.
 */

const BedroomScene = {
    id: 'bedroom',
    name: 'Bedroom — Night',

    background: 'assets/images/scenes/bedroom.svg',
    description: 'Dark bedroom. Everyone asleep. The only sounds are soft breathing and the creak of the house settling.',

    hidePlayer: true,
    playerStart: { x: 50, y: 50 },
    hotspots: [
        {
            id: 'door-home',
            name: 'Kitchen Door',
            // SVG: frame x=47 y=448 w=186 h=392, floor y=840
            x: 2.45,
            y: 41.48,
            width: 9.69,
            height: 36.30,
            cursor: 'pointer',
            targetScene: 'home'
        }
    ],

    // ── Dream content per dreamer ─────────────────────────────────────────
    _dreams: {
        ryan: [
            'A signal. Repeating. Follow the signal.',
            'Lines of code unspooling in the dark.',
            'Radio towers under a bruised sky.',
            'A face behind frosted glass. It knows me.',
            'Coordinates blinking on a map: 53.28°N  7.42°E.',
            'The Volvo. Dark road. Headlights off.',
            'Oscilloscopes. Waveforms. Something wrong in the noise.',
            'A door that shouldn\'t open — opens.',
            'The WSRT dishes all point at me.',
            'Running. The flashlight dies.',
        ],
        ax: [
            'Hands in warm clay. A vase taking shape.',
            'Grandmother\'s kitchen. The smell of cardamom.',
            'A sun-drenched garden. No deadlines.',
            'Her red bicycle in the summer rain.',
            'Pine forest at dawn, fog between the trunks.',
            'An old recipe book, pages soft as skin.',
            'Stars from the roof. No sirens.',
            'The sea. Flat horizon. Nobody else.',
        ],
        max: [
            '🍖  The kibble bowl. Bottomless.',
            'A squeaky toy that never stops squeaking.',
            'Warm sunlit floorboards, all to myself.',
            'Ryan\'s lap. Always available. Always warm.',
            '🥓  Bacon. So much bacon.',
            'The postman runs. I run faster.',
            'Belly rubs. Continuous. No end.',
            'A garden full of interesting smells.',
        ],
        kessy: [
            'Running across endless summer fields.',
            'Tennis balls. Raining. From the sky.',
            'Swimming in a cool river. Forever.',
            'The whole forest, just for me.',
            'Chasing butterflies through tall grass.',
            'A stick — the perfect stick.',
            'Everyone home. All at once.',
            'Rolling in something incredible.',
        ],
        tino: [
            'The mand, but softer. Much softer.',
            'A long walk across the heather.',
            'Digging a very, very deep hole.',
            'Other dogs. Lots of them. All friendly.',
            '🦴  A bone, found and reburied. Found again.',
            'The whole sofa, just for me.',
            'That smell from the kitchen. Getting closer.',
            'A slow jog beside the bike. Wind in the ears.',
        ],
    },

    // ── Balloon anchor positions (% of 1920×1080 SVG space) ──────────────
    // balloon appears above each sleeper's head
    _anchors: {
        ryan:  { left: '31%', top: '33%' },   // above Ryan's southpark head on left pillow
        ax:    { left: '58%', top: '33%' },   // above Ax's pillow (right)
        max:   { left: '40%', top: '38%' },   // above pug on duvet
        kessy: { left: '44%', top: '60%' },   // above Kessy at foot of bed
        tino:  { left: '82%', top: '62%' },   // above Tino's basket
    },

    // ── Internal state ────────────────────────────────────────────────────
    _overlay: null,
    _timers: [],
    _audioCtx: null,
    _audioNodes: [],

    // ── Audio: very soft night ambience (low wind + slow breathing rhythm) ─
    _startAudio: function() {
        try {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const ctx = this._audioCtx;
            const master = ctx.createGain();
            master.gain.setValueAtTime(0, ctx.currentTime);
            master.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 4);
            master.connect(ctx.destination);
            this._audioNodes.push(master);

            // Low filtered noise — night air / room tone
            const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
            const d   = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            const src = ctx.createBufferSource();
            src.buffer = buf; src.loop = true;
            const lp  = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 140;
            const ng  = ctx.createGain(); ng.gain.value = 0.018;
            src.connect(lp).connect(ng).connect(master);
            src.start();
            this._audioNodes.push(src, lp, ng);

            // Very slow LFO wobble on the noise (mimics breathing rhythm ~0.2 Hz)
            const lfo   = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.22;
            const lfoG  = ctx.createGain(); lfoG.gain.value = 0.008;
            lfo.connect(lfoG).connect(ng.gain);
            lfo.start();
            this._audioNodes.push(lfo, lfoG);
        } catch (e) {}
    },

    _stopAudio: function() {
        this._audioNodes.forEach(n => { try { if (n.stop) n.stop(); n.disconnect(); } catch(e) {} });
        this._audioNodes = [];
        if (this._audioCtx) { try { this._audioCtx.close(); } catch(e) {} this._audioCtx = null; }
    },

    // ── Think-balloon DOM overlay ─────────────────────────────────────────
    _buildOverlay: function() {
        const div = document.createElement('div');
        div.id = 'bedroom-dream-overlay';
        div.style.cssText = [
            'position:absolute',
            'inset:0',
            'pointer-events:none',
            'overflow:hidden',
            'z-index:10',
        ].join(';');
        document.getElementById('scene-container').appendChild(div);
        this._overlay = div;

        // Inject keyframes once
        if (!document.getElementById('bedroom-dream-style')) {
            const s = document.createElement('style');
            s.id = 'bedroom-dream-style';
            s.textContent = `
                @keyframes dreamFadeIn  { from { opacity:0; transform:translateY(12px) scale(0.92); }
                                           to   { opacity:1; transform:translateY(0)   scale(1);    } }
                @keyframes dreamFadeOut { from { opacity:1; transform:translateY(0)    scale(1);    }
                                           to   { opacity:0; transform:translateY(-10px) scale(0.95);} }
                .dream-balloon {
                    position: absolute;
                    max-width: 230px;
                    background: rgba(240,238,255,0.93);
                    border: 1.5px solid rgba(160,155,210,0.5);
                    border-radius: 22px;
                    padding: 10px 14px;
                    font-family: 'Georgia', serif;
                    font-size: 13px;
                    font-style: italic;
                    color: #3a3560;
                    line-height: 1.5;
                    box-shadow: 0 4px 18px rgba(80,60,140,0.18), 0 1px 4px rgba(80,60,140,0.12);
                    text-align: center;
                    animation: dreamFadeIn 1.2s ease forwards;
                    filter: drop-shadow(0 2px 8px rgba(80,60,140,0.15));
                }
                .dream-balloon.fading {
                    animation: dreamFadeOut 1.4s ease forwards;
                }
                /* Think-bubble tail: three descending circles */
                .dream-bubble-tail {
                    position: absolute;
                    bottom: -22px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3px;
                }
                .dream-bubble-tail span {
                    display: block;
                    border-radius: 50%;
                    background: rgba(240,238,255,0.88);
                    border: 1px solid rgba(160,155,210,0.45);
                }
            `;
            document.head.appendChild(s);
        }
    },

    _showDream: function(dreamer, text) {
        if (!this._overlay) return;
        const anchor = this._anchors[dreamer];
        if (!anchor) return;

        // Create balloon
        const balloon = document.createElement('div');
        balloon.className = 'dream-balloon';

        // Dreamer label (small, muted)
        const label = document.createElement('div');
        label.style.cssText = 'font-size:10px;opacity:0.55;margin-bottom:5px;letter-spacing:0.05em;text-transform:uppercase;font-style:normal;';
        label.textContent = dreamer === 'max' ? 'Max 🐾' :
                            dreamer === 'kessy' ? 'Kessy 🐾' :
                            dreamer === 'tino'  ? 'Tino 🐾'  :
                            dreamer.charAt(0).toUpperCase() + dreamer.slice(1);
        balloon.appendChild(label);

        // Dream text
        const p = document.createElement('div');
        p.textContent = text;
        balloon.appendChild(p);

        // Think-bubble tail (3 circles, descending)
        const tail = document.createElement('div');
        tail.className = 'dream-bubble-tail';
        [9, 6, 4].forEach(size => {
            const c = document.createElement('span');
            c.style.cssText = `width:${size}px;height:${size}px;`;
            tail.appendChild(c);
        });
        balloon.appendChild(tail);

        // Position: anchor is bottom-center of the balloon
        // We nudge slightly randomly so overlapping balloons don't stack exactly
        const jitterX = (Math.random() - 0.5) * 4;
        const jitterY = (Math.random() - 0.5) * 3;
        balloon.style.left   = `calc(${anchor.left} + ${jitterX}%)`;
        balloon.style.top    = `calc(${anchor.top}  + ${jitterY}%)`;
        balloon.style.transform = 'translateX(-50%)';

        this._overlay.appendChild(balloon);

        // Fade out after display duration, then remove
        const displayMs = 4500 + Math.random() * 2000;
        const t1 = setTimeout(() => {
            balloon.classList.add('fading');
            const t2 = setTimeout(() => {
                if (balloon.parentNode) balloon.parentNode.removeChild(balloon);
            }, 1400);
            this._timers.push(t2);
        }, displayMs);
        this._timers.push(t1);
    },

    // ── Dream scheduler: picks a random dreamer and dream at a random interval ─
    _scheduleDream: function() {
        const dreamers = Object.keys(this._dreams);
        const minGap = 3200, maxGap = 7000;

        const tick = () => {
            // Pick a random dreamer
            const dreamer = dreamers[Math.floor(Math.random() * dreamers.length)];
            const pool    = this._dreams[dreamer];
            const text    = pool[Math.floor(Math.random() * pool.length)];
            this._showDream(dreamer, text);

            // Schedule next
            const delay = minGap + Math.random() * (maxGap - minGap);
            const t = setTimeout(tick, delay);
            this._timers.push(t);
        };

        // Stagger the first few so scene doesn't pop all at once
        dreamers.forEach((dreamer, i) => {
            const t = setTimeout(() => {
                const pool = this._dreams[dreamer];
                const text = pool[Math.floor(Math.random() * pool.length)];
                this._showDream(dreamer, text);
            }, 800 + i * 1400);
            this._timers.push(t);
        });

        // Start the random loop after initial stagger settles
        const t = setTimeout(tick, 800 + dreamers.length * 1400 + 2000);
        this._timers.push(t);
    },

    // ── Scene lifecycle ───────────────────────────────────────────────────
    onEnter: function(game) {
        this._timers = [];
        this._audioNodes = [];
        this._startAudio();
        this._buildOverlay();
        this._scheduleDream();

        // Disable player character rendering for this cinematic
        const pc = document.getElementById('player-character');
        if (pc) pc.style.display = 'none';

        // Auto-awaken mechanic: if entering at night, advance clock to 07:00
        // next day and return to the home/kitchen scene after a short sleep delay.
        const _bedHour = (game.gameState && game.gameState.time)
            ? parseInt(game.gameState.time.split(':')[0], 10)
            : -1;
        const _isNight = (_bedHour >= 22 || _bedHour === 0 || _bedHour === 1);
        if (_isNight) {
            const _currentDay = (game.gameState && game.gameState.day) || 1;
            const _sleepDayKey = 'slept_day_' + _currentDay;
            const _wakeT = setTimeout(() => {
                // Guard: only fire if still in bedroom
                if (window.game && window.game.currentScene !== 'bedroom') return;
                game.setTime(_currentDay + 1, '07:00');
                game.setFlag(_sleepDayKey, true);
                // Flag that Ryan needs coffee when he wakes up
                game.setFlag('made_espresso', false);
                game.setFlag('needs_morning_coffee', true);
                game.loadScene('home');
            }, 9000);
            this._timers.push(_wakeT);
        }
    },

    onExit: function() {
        // Clear all timers
        this._timers.forEach(t => clearTimeout(t));
        this._timers = [];

        // Remove overlay
        if (this._overlay) {
            this._overlay.parentNode && this._overlay.parentNode.removeChild(this._overlay);
            this._overlay = null;
        }

        // Remove injected style
        const s = document.getElementById('bedroom-dream-style');
        if (s) s.parentNode && s.parentNode.removeChild(s);

        // Restore player
        const pc = document.getElementById('player-character');
        if (pc) pc.style.display = '';

        this._stopAudio();
    },
};

if (typeof window !== 'undefined' && window.GameRegistry) {
    window.GameRegistry.register(BedroomScene);
}
