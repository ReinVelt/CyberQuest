/**
 * USB Discovery — Hollywood Cinematic Scene
 * 
 * A tense, multi-shot cinematic that plays ONCE when Ryan walks to his Volvo
 * at Ter Apel Klooster and discovers the USB stick on the door handle.
 * 
 * Flow: klooster (click Volvo) → usb_discovery (cinematic) → car_discovery (pick up USB)
 * Only triggers when !picked_up_usb. If already picked up, klooster skips straight to driving.
 */

const UsbDiscoveryScene = {
    id: 'usb_discovery',
    name: 'The Drop',
    background: 'assets/images/scenes/usb_discovery.svg',
    description: 'Something is wrong. Someone was here.',
    playerStart: { x: 50, y: 50 },
    hotspots: [],

    _timeoutIds: [],
    _audioCtx: null,
    _audioNodes: [],

    // ─── CLEANUP ────────────────────────────────────────────
    _clearTimeouts: function() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];
    },

    _t: function(fn, ms) {
        const id = setTimeout(fn, ms);
        this._timeoutIds.push(id);
        return id;
    },

    // ─── AUDIO ENGINE: SUSPENSE SCORE ───────────────────────
    _getAudioCtx: function() {
        if (!this._audioCtx || this._audioCtx.state === 'closed') {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },

    _startSuspenseAudio: function() {
        try {
            const ctx = this._getAudioCtx();
            const nodes = this._audioNodes;
            const now = ctx.currentTime;

            // === SUB-BASS TENSION DRONE ===
            const drone = ctx.createOscillator();
            drone.type = 'sawtooth';
            drone.frequency.setValueAtTime(32, now);
            drone.frequency.linearRampToValueAtTime(38, now + 8);
            drone.frequency.linearRampToValueAtTime(44, now + 18);
            drone.frequency.linearRampToValueAtTime(52, now + 25);
            const droneFilter = ctx.createBiquadFilter();
            droneFilter.type = 'lowpass';
            droneFilter.frequency.setValueAtTime(60, now);
            droneFilter.frequency.linearRampToValueAtTime(120, now + 25);
            const droneGain = ctx.createGain();
            droneGain.gain.setValueAtTime(0, now);
            droneGain.gain.linearRampToValueAtTime(0.04, now + 3);
            droneGain.gain.linearRampToValueAtTime(0.08, now + 20);
            droneGain.gain.linearRampToValueAtTime(0, now + 28);
            drone.connect(droneFilter);
            droneFilter.connect(droneGain);
            droneGain.connect(ctx.destination);
            drone.start(now);
            drone.stop(now + 29);
            nodes.push(drone, droneFilter, droneGain);

            // === RISING PITCH (Shepard-like tension) ===
            [220, 330, 440].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq * 0.5, now + 8);
                osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 25);
                const g = ctx.createGain();
                g.gain.setValueAtTime(0, now);
                g.gain.linearRampToValueAtTime(0, now + 8);
                g.gain.linearRampToValueAtTime(0.012, now + 12);
                g.gain.linearRampToValueAtTime(0.025, now + 22);
                g.gain.linearRampToValueAtTime(0, now + 26);
                osc.connect(g);
                g.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 27);
                nodes.push(osc, g);
            });

            // === HEARTBEAT (accelerating) ===
            const scheduleBeats = () => {
                let t = ctx.currentTime + 2;
                let interval = 1.0; // starts at 60 bpm
                for (let i = 0; i < 30 && t < ctx.currentTime + 26; i++) {
                    const beatOsc = ctx.createOscillator();
                    beatOsc.type = 'sine';
                    beatOsc.frequency.setValueAtTime(45, t);
                    beatOsc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
                    const beatGain = ctx.createGain();
                    const vol = Math.min(0.06, 0.02 + i * 0.002);
                    beatGain.gain.setValueAtTime(0, t);
                    beatGain.gain.linearRampToValueAtTime(vol, t + 0.03);
                    beatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                    beatOsc.connect(beatGain);
                    beatGain.connect(ctx.destination);
                    beatOsc.start(t);
                    beatOsc.stop(t + 0.3);
                    t += interval;
                    interval = Math.max(0.35, interval * 0.92); // accelerate
                }
            };
            scheduleBeats();

            // === FOOTSTEPS ON GRAVEL (timed with shots) ===
            const scheduleFootstep = (time) => {
                const t = ctx.currentTime + time;
                const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
                const data = buf.getChannelData(0);
                for (let i = 0; i < data.length; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
                }
                const src = ctx.createBufferSource();
                src.buffer = buf;
                const filt = ctx.createBiquadFilter();
                filt.type = 'bandpass';
                filt.frequency.setValueAtTime(800 + Math.random() * 400, t);
                filt.Q.setValueAtTime(1.5, t);
                const g = ctx.createGain();
                g.gain.setValueAtTime(0.05, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
                src.connect(filt);
                filt.connect(g);
                g.connect(ctx.destination);
                src.start(t);
            };
            // Footsteps during approach shots (seconds 4-12)
            [4.2, 4.8, 5.5, 6.1, 6.8, 7.4, 8.1, 8.7, 9.4, 10.0, 10.5, 11.0].forEach(scheduleFootstep);

            // === DISCOVERY STING (at ~18s when USB is revealed) ===
            const stingTime = now + 18;
            const stingOsc = ctx.createOscillator();
            stingOsc.type = 'sawtooth';
            stingOsc.frequency.setValueAtTime(180, stingTime);
            stingOsc.frequency.exponentialRampToValueAtTime(90, stingTime + 1.5);
            const sting2 = ctx.createOscillator();
            sting2.type = 'sine';
            sting2.frequency.setValueAtTime(270, stingTime);
            sting2.frequency.exponentialRampToValueAtTime(135, stingTime + 1.5);
            const stingGain = ctx.createGain();
            stingGain.gain.setValueAtTime(0, stingTime);
            stingGain.gain.linearRampToValueAtTime(0.06, stingTime + 0.05);
            stingGain.gain.exponentialRampToValueAtTime(0.001, stingTime + 2.5);
            const stingFilter = ctx.createBiquadFilter();
            stingFilter.type = 'lowpass';
            stingFilter.frequency.setValueAtTime(400, stingTime);
            stingOsc.connect(stingFilter);
            sting2.connect(stingFilter);
            stingFilter.connect(stingGain);
            stingGain.connect(ctx.destination);
            stingOsc.start(stingTime);
            sting2.start(stingTime);
            stingOsc.stop(stingTime + 3);
            sting2.stop(stingTime + 3);
            nodes.push(stingOsc, sting2, stingGain, stingFilter);

            // === WIND (constant bed) ===
            const windSize = ctx.sampleRate * 3;
            const windBuf = ctx.createBuffer(1, windSize, ctx.sampleRate);
            const windData = windBuf.getChannelData(0);
            for (let i = 0; i < windSize; i++) windData[i] = Math.random() * 2 - 1;
            const windSrc = ctx.createBufferSource();
            windSrc.buffer = windBuf;
            windSrc.loop = true;
            const windFilt = ctx.createBiquadFilter();
            windFilt.type = 'bandpass';
            windFilt.frequency.setValueAtTime(250, now);
            windFilt.Q.setValueAtTime(1.2, now);
            const windGain = ctx.createGain();
            windGain.gain.setValueAtTime(0, now);
            windGain.gain.linearRampToValueAtTime(0.03, now + 2);
            windGain.gain.setValueAtTime(0.03, now + 24);
            windGain.gain.linearRampToValueAtTime(0, now + 28);
            windSrc.connect(windFilt);
            windFilt.connect(windGain);
            windGain.connect(ctx.destination);
            windSrc.start(now);
            windSrc.stop(now + 29);
            nodes.push(windSrc, windFilt, windGain);

        } catch(e) {
            console.warn('[USB Discovery] Audio failed:', e);
        }
    },

    _stopAudio: function() {
        this._audioNodes.forEach(n => {
            try { if (n.stop) n.stop(); if (n.disconnect) n.disconnect(); } catch(e) {}
        });
        this._audioNodes = [];
        if (this._audioCtx && this._audioCtx.state !== 'closed') {
            this._audioCtx.close().catch(() => {});
            this._audioCtx = null;
        }
    },

    // ─── SCENE ENTRY ────────────────────────────────────────
    onEnter: function(game) {
        const self = this;
        self._clearTimeouts();
        self._startSuspenseAudio();

        // ─── INJECT STYLES ──────────────────────────────────
        const style = document.createElement('style');
        style.id = 'usb-discovery-style';
        style.textContent = `
/* === BASE === */
#usb-discovery-cine {
    position: fixed; inset: 0; z-index: 9999;
    background: #000; color: #fff;
    font-family: 'Georgia', 'Times New Roman', serif;
    overflow: hidden; cursor: default; user-select: none;
}
#usb-discovery-cine * { box-sizing: border-box; }

/* === LETTERBOX BARS === */
.ud-bar {
    position: absolute; left: 0; right: 0; background: #000; z-index: 30;
    transition: height 1.5s ease;
}
.ud-bar-top { top: 0; height: 0; }
.ud-bar-bot { bottom: 0; height: 0; }
.ud-bar.active { height: 8vh; }

/* === SHOT (each "camera angle") === */
.ud-shot {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    opacity: 0; text-align: center;
    transition: opacity 1.2s ease-in-out;
    will-change: opacity, transform;
}
.ud-shot.active { opacity: 1; }

/* === VIGNETTE / GRAIN === */
.ud-vignette {
    position: absolute; inset: 0; z-index: 10; pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%);
}
.ud-grain {
    position: absolute; inset: 0; z-index: 11; pointer-events: none; opacity: 0.04;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.ud-scanlines {
    position: absolute; inset: 0; z-index: 12; pointer-events: none; opacity: 0.02;
    background: repeating-linear-gradient(
        transparent 0px, transparent 1px,
        rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px
    );
}

/* === TYPOGRAPHY === */
.ud-location {
    font-family: 'Courier New', monospace;
    font-size: clamp(10px, 1.2vw, 16px);
    letter-spacing: 4px; text-transform: uppercase;
    color: #8a8a6a; opacity: 0;
    animation: ud-fade-in 1.5s 0.5s forwards;
}
.ud-time {
    font-family: 'Courier New', monospace;
    font-size: clamp(8px, 1vw, 13px);
    letter-spacing: 3px; color: #6a6a5a;
    margin-top: 6px; opacity: 0;
    animation: ud-fade-in 1.5s 1s forwards;
}
.ud-narration {
    font-family: 'Georgia', serif;
    font-size: clamp(14px, 2vw, 28px);
    line-height: 1.8; color: #c8c4b8;
    max-width: 65vw; opacity: 0;
    animation: ud-fade-in 1.5s 0.3s forwards;
}
.ud-thought {
    font-family: 'Georgia', serif;
    font-style: italic;
    font-size: clamp(16px, 2.4vw, 32px);
    line-height: 1.6; color: #e8e0d0;
    max-width: 55vw; opacity: 0;
    text-shadow: 0 0 40px rgba(255,200,100,0.15);
}
.ud-whisper {
    font-family: 'Courier New', monospace;
    font-size: clamp(11px, 1.5vw, 20px);
    letter-spacing: 6px; text-transform: uppercase;
    color: #ffcc44; opacity: 0;
    text-shadow: 0 0 20px rgba(255,200,50,0.3);
}
.ud-reveal {
    font-family: 'Georgia', serif;
    font-size: clamp(20px, 3vw, 42px);
    font-weight: bold; letter-spacing: 2px;
    color: #fff; opacity: 0;
    text-shadow: 0 0 30px rgba(255,255,255,0.3);
}

/* === ANIMATIONS === */
@keyframes ud-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes ud-slow-zoom {
    from { transform: scale(1); }
    to   { transform: scale(1.08); }
}
@keyframes ud-pan-right {
    from { transform: translateX(0); }
    to   { transform: translateX(-3%); }
}
@keyframes ud-pan-left {
    from { transform: translateX(0); }
    to   { transform: translateX(3%); }
}
@keyframes ud-pulse-glow {
    0%, 100% { text-shadow: 0 0 20px rgba(255,200,50,0.2); }
    50%      { text-shadow: 0 0 40px rgba(255,200,50,0.5); }
}
@keyframes ud-breathe {
    0%, 100% { opacity: 0.6; }
    50%      { opacity: 1; }
}
@keyframes ud-flash {
    0%   { opacity: 0.7; }
    100% { opacity: 0; }
}

/* === VISUAL ELEMENTS === */
.ud-bg-image {
    position: absolute; inset: 0;
    background-size: cover; background-position: center;
    z-index: 0;
}
.ud-flash-overlay {
    position: absolute; inset: 0; z-index: 25;
    background: #fff; opacity: 0; pointer-events: none;
}

/* === SKIP BUTTON === */
.ud-skip {
    position: fixed; bottom: 3vh; right: 3vw; z-index: 9999;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.4); padding: 8px 18px; border-radius: 4px;
    font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px;
    cursor: pointer; transition: all 0.3s;
}
.ud-skip:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }
`;
        document.head.appendChild(style);

        // ─── BUILD DOM ──────────────────────────────────────
        const cine = document.createElement('div');
        cine.id = 'usb-discovery-cine';

        cine.innerHTML =
            '<div class="ud-bar ud-bar-top" id="ud-bar-top"></div>' +
            '<div class="ud-bar ud-bar-bot" id="ud-bar-bot"></div>' +
            '<div class="ud-vignette"></div>' +
            '<div class="ud-grain"></div>' +
            '<div class="ud-scanlines"></div>' +
            '<div class="ud-flash-overlay" id="ud-flash"></div>' +
            '<button class="ud-skip" id="ud-skip">SKIP ▶▶</button>' +

            // SHOT 1: ESTABLISH — Parking lot, dark monastery in background
            '<div class="ud-shot" id="ud-shot-1" style="background:#0a0a18">' +
                '<div class="ud-bg-image" style="' +
                    'background: linear-gradient(to bottom, #0f0f28 0%, #1a1a35 40%, #0a0f12 70%, #080a0c 100%);' +
                    'animation: ud-slow-zoom 6s ease-out forwards;' +
                '"></div>' +
                '<div style="position:relative;z-index:5">' +
                    '<div class="ud-location">Ter Apel Klooster — Parking Lot</div>' +
                    '<div class="ud-time">23:14 — 14 minutes past the meet</div>' +
                '</div>' +
            '</div>' +

            // SHOT 2: RYAN WALKS — silhouette, long shot
            '<div class="ud-shot" id="ud-shot-2" style="background:#080810">' +
                '<div class="ud-bg-image" style="' +
                    'background: linear-gradient(170deg, #0a0a1a 0%, #101020 50%, #080810 100%);' +
                    'animation: ud-pan-right 5s ease-out forwards;' +
                '"></div>' +
                '<div style="position:relative;z-index:5">' +
                    '<div class="ud-narration" style="animation-delay:0.5s">Gravel crunches underfoot.</div>' +
                    '<div class="ud-narration" style="animation-delay:1.8s;margin-top:20px">No one came. No one was ever going to come.</div>' +
                '</div>' +
            '</div>' +

            // SHOT 3: INNER MONOLOGUE — close-up feel
            '<div class="ud-shot" id="ud-shot-3" style="background:#0a0a12">' +
                '<div style="position:relative;z-index:5;padding:0 12vw">' +
                    '<div class="ud-thought" style="animation: ud-fade-in 2s 0.3s forwards">This was a test. Someone wanted to see<br>if I\'d actually show up.</div>' +
                    '<div class="ud-thought" style="animation: ud-fade-in 2s 2s forwards;margin-top:30px;font-size:clamp(13px,1.8vw,24px);color:#a09880">And I did. Like an idiot.</div>' +
                '</div>' +
            '</div>' +

            // SHOT 4: CAR APPROACH — the Volvo in shadow
            '<div class="ud-shot" id="ud-shot-4" style="background:#080a10">' +
                '<div class="ud-bg-image" style="' +
                    'background: linear-gradient(to top, #0a0f12 0%, #0f1520 50%, #0a0a18 100%);' +
                    'animation: ud-slow-zoom 5s ease-out forwards;' +
                '"></div>' +
                '<div style="position:relative;z-index:5">' +
                    '<div class="ud-narration" style="animation-delay:0.3s">The Volvo sits alone under the old oak.</div>' +
                    '<div class="ud-narration" style="animation-delay:2s;margin-top:16px;color:#9a968a">Moonlight catches something on the door handle.</div>' +
                '</div>' +
            '</div>' +

            // SHOT 5: FREEZE — "wait, what?"
            '<div class="ud-shot" id="ud-shot-5" style="background:#0a0808">' +
                '<div style="position:relative;z-index:5">' +
                    '<div class="ud-thought" style="animation: ud-fade-in 0.8s 0.2s forwards;font-size:clamp(22px,3.5vw,48px)">Wait.</div>' +
                '</div>' +
            '</div>' +

            // SHOT 6: CLOSE-UP — door handle detail, something taped
            '<div class="ud-shot" id="ud-shot-6" style="background:#0c0c10">' +
                '<div class="ud-bg-image" style="' +
                    'background: radial-gradient(ellipse at 45% 50%, #1a1a2a 0%, #0a0a14 60%, #060608 100%);' +
                    'animation: ud-slow-zoom 4s ease-out forwards;' +
                '"></div>' +
                '<div style="position:relative;z-index:5">' +
                    '<div class="ud-narration" style="animation-delay:0.3s">A black USB stick. Taped to the underside of the handle.</div>' +
                    '<div class="ud-whisper" style="animation: ud-fade-in 2s 2s forwards;margin-top:30px;animation: ud-fade-in 2s 2s forwards, ud-pulse-glow 2s 3s infinite">' +
                        'TRUST THE PROCESS — AIR-GAPPED ONLY' +
                    '</div>' +
                '</div>' +
            '</div>' +

            // SHOT 7: REALIZATION — the drop already happened
            '<div class="ud-shot" id="ud-shot-7" style="background:#0a0a0a">' +
                '<div style="position:relative;z-index:5;padding:0 10vw">' +
                    '<div class="ud-thought" style="animation: ud-fade-in 1.5s 0.3s forwards">They watched me walk in.</div>' +
                    '<div class="ud-thought" style="animation: ud-fade-in 1.5s 1.5s forwards;margin-top:16px">Watched me search the courtyard.</div>' +
                    '<div class="ud-thought" style="animation: ud-fade-in 1.5s 2.8s forwards;margin-top:16px">Watched me give up.</div>' +
                    '<div class="ud-thought" style="animation: ud-fade-in 1.5s 4.2s forwards;margin-top:30px;color:#e0d0a0;font-size:clamp(18px,2.6vw,36px)">The car was the dead drop all along.</div>' +
                '</div>' +
            '</div>' +

            // SHOT 8: TITLE CARD — dramatic punctuation
            '<div class="ud-shot" id="ud-shot-8" style="background:#000">' +
                '<div style="position:relative;z-index:5">' +
                    '<div class="ud-reveal" style="animation: ud-fade-in 2s 0.5s forwards">THE DROP</div>' +
                '</div>' +
            '</div>';

        document.getElementById('game-container').appendChild(cine);

        // ─── LETTERBOX ON ───────────────────────────────────
        self._t(() => {
            document.getElementById('ud-bar-top')?.classList.add('active');
            document.getElementById('ud-bar-bot')?.classList.add('active');
        }, 200);

        // ─── SHOT SEQUENCER ─────────────────────────────────
        const shots = [
            { id: 1, start: 500,   dur: 5000  },  // Establish: parking lot
            { id: 2, start: 5500,  dur: 5500  },  // Walking on gravel
            { id: 3, start: 11000, dur: 5000  },  // Inner monologue
            { id: 4, start: 16000, dur: 4500  },  // Car approach
            { id: 5, start: 20500, dur: 1800  },  // "Wait." (short, punchy)
            { id: 6, start: 22300, dur: 5500  },  // Close-up door handle + USB text
            { id: 7, start: 27800, dur: 7000  },  // Realization sequence
            { id: 8, start: 34800, dur: 3500  },  // Title card
        ];

        let activeShot = null;
        shots.forEach(shot => {
            // SHOW shot
            self._t(() => {
                if (activeShot) activeShot.classList.remove('active');
                const el = document.getElementById('ud-shot-' + shot.id);
                if (el) {
                    el.classList.add('active');
                    activeShot = el;
                }
            }, shot.start);

            // HIDE shot
            self._t(() => {
                const el = document.getElementById('ud-shot-' + shot.id);
                if (el) el.classList.remove('active');
            }, shot.start + shot.dur);
        });

        // Flash on USB reveal (shot 6)
        self._t(() => {
            const flash = document.getElementById('ud-flash');
            if (flash) {
                flash.style.opacity = '0.6';
                flash.style.transition = 'opacity 0.8s ease-out';
                setTimeout(() => { flash.style.opacity = '0'; }, 50);
            }
        }, 22300);

        // ─── TRANSITION TO CAR_DISCOVERY ────────────────────
        const totalDuration = 38500;

        self._t(() => {
            self._endCinematic(game);
        }, totalDuration);

        // ─── SKIP BUTTON ────────────────────────────────────
        const skipBtn = document.getElementById('ud-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                self._endCinematic(game);
            });
        }

        // Click anywhere to show skip hint
        cine.addEventListener('click', (e) => {
            if (e.target.id !== 'ud-skip') {
                const skip = document.getElementById('ud-skip');
                if (skip) {
                    skip.style.color = 'rgba(255,255,255,0.7)';
                    setTimeout(() => { skip.style.color = ''; }, 1500);
                }
            }
        });

        // Set flags
        game.setFlag('found_usb_stick', true);
        game.setFlag('usb_cinematic_played', true);
    },

    _endCinematic: function(game) {
        this._clearTimeouts();
        this._stopAudio();

        // Fade out
        const cine = document.getElementById('usb-discovery-cine');
        if (cine) {
            cine.style.transition = 'opacity 1.5s ease';
            cine.style.opacity = '0';
            setTimeout(() => {
                cine.remove();
                document.getElementById('usb-discovery-style')?.remove();
                // Transition to the interactive car_discovery scene
                game.loadScene('car_discovery');
            }, 1600);
        } else {
            document.getElementById('usb-discovery-style')?.remove();
            game.loadScene('car_discovery');
        }
    },

    // ─── SCENE EXIT (cleanup) ───────────────────────────────
    onExit: function(game) {
        this._clearTimeouts();
        this._stopAudio();
        document.getElementById('usb-discovery-cine')?.remove();
        document.getElementById('usb-discovery-style')?.remove();
    }
};
