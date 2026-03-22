/**
 * Scene: Sit-Mower — Pseudo-3D Lawn Mowing Mini-Game
 * ═══════════════════════════════════════════════════════════
 * First-person pseudo-3D mowing game. Drive the zitmaaier
 * through Ryan's back garden. Mow every patch of grass,
 * avoid trees, berry bushes, and the three dogs.
 * Finish when all grass is cut.
 *
 * Controls:
 *   Desktop:  Arrow keys / WASD, or click/drag on game view
 *   Mobile:   Tap & hold to steer + drive, tap dashboard to brake
 *   Mini-map: Top-right corner shows overhead progress
 * ═══════════════════════════════════════════════════════════
 */

const SitMowerScene = {
    id: 'sitmower',
    name: 'Zitmaaier — Mowing the Lawn',
    background: null,
    description: 'First-person view from the sit-mower. Time to cut this grass.',
    playerStart: { x: -100, y: -100 },
    hotspots: [],
    accessibilityPath: [],  // mini-game auto-completes and transitions to garden_back
    hidePlayer: true,

    /* ── Constants ──────────────────────────────────────────── */
    GRID_W: 32,
    GRID_H: 32,
    CELL_SIZE: 3,
    DRAW_DIST: 40,
    TURN_SPEED: 2.4,
    ACCEL: 1.0,
    BRAKE: 1.5,
    FRICTION: 0.4,
    MAX_SPEED: 1.4,
    REVERSE_MAX: 0.5,

    /* ── Obstacle types ────────────────────────────────────── */
    OBS_NONE: 0,
    OBS_TREE: 1,
    OBS_BUSH: 2,
    OBS_DOG: 3,
    OBS_FIREDRUM: 4,

    /* ── State ─────────────────────────────────────────────── */
    _canvas: null,
    _ctx: null,
    _hud: null,
    _raf: null,
    _running: false,
    _lastTime: 0,
    _keys: {},
    _px: 0, _py: 0,
    _angle: 0,
    _speed: 0,
    _grid: null,
    _obstacles: [],
    _dogs: [],
    _totalGrass: 0,
    _mowedCount: 0,
    _collisionTimer: 0,
    _shakeTimer: 0,
    _engineOsc: null,
    _engineGain: null,
    _audioCtx: null,
    _finished: false,
    _introShown: false,

    /* ── Point-and-click / touch state ─────────────────────── */
    _pointerDown: false,
    _pointerX: 0.5,
    _pointerY: 0.5,
    _autoGas: false,
    _autoBrake: false,
    _autoSteer: 0,
    _tapIndicator: null,
    _isTouch: false,
    _birds: [],
    _sunAngle: 0,
    _gpsNav: false,
    _gpsTarget: null,

    /* ═══════════════════════════════════════════════════════════
     *  LIFECYCLE
     * ═══════════════════════════════════════════════════════════ */

    onEnter(game) {
        this._game = game;
        this._finished = false;
        this._introShown = false;
        this._keys = {};
        this._speed = 0;
        this._collisionTimer = 0;
        this._shakeTimer = 0;
        this._pointerDown = false;
        this._autoGas = false;
        this._autoBrake = false;
        this._autoSteer = 0;
        this._tapIndicator = null;
        this._isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        this._sunAngle = 0;
        this._gpsNav = false;
        this._gpsTarget = null;

        // Spawn birds
        this._birds = [];
        for (let i = 0; i < 6; i++) {
            this._birds.push({
                x: Math.random(),
                y: 0.04 + Math.random() * 0.18,
                speed: 0.012 + Math.random() * 0.02,
                wingPhase: Math.random() * Math.PI * 2,
                wingSpeed: 6 + Math.random() * 4,
                size: 3 + Math.random() * 3,
                drift: (Math.random() - 0.5) * 0.003,
            });
        }

        // Build canvas
        const container = document.getElementById('scene-container');
        if (!container) return;
        container.style.background = '#1a3a12';

        // Hide standard scene elements
        const bg = document.getElementById('scene-background');
        if (bg) bg.style.display = 'none';
        const hs = document.getElementById('scene-hotspots');
        if (hs) hs.style.display = 'none';

        this._canvas = document.createElement('canvas');
        this._canvas.id = 'mower-canvas';
        this._canvas.style.cssText = `
            position:absolute;top:0;left:0;width:100%;height:100%;
            display:block;image-rendering:pixelated;z-index:1;
            touch-action:none;-webkit-touch-callout:none;user-select:none;
        `;
        container.appendChild(this._canvas);
        this._resizeCanvas();

        // HUD overlay
        this._hud = document.createElement('div');
        this._hud.id = 'mower-hud';
        this._hud.style.cssText = `
            position:absolute;top:0;left:0;width:100%;height:100%;
            pointer-events:none;font-family:monospace;color:#fff;z-index:2;
        `;
        container.appendChild(this._hud);

        // Exit button (persistent, not inside HUD innerHTML)
        this._exitBtn = document.createElement('div');
        this._exitBtn.id = 'mower-exit-btn';
        this._exitBtn.textContent = '[U] Exit mower';
        this._exitBtn.style.cssText = `
            position:absolute;top:6px;left:50%;transform:translateX(-50%);
            background:rgba(0,0,0,0.55);padding:3px 12px;border-radius:4px;
            font-size:clamp(9px, 2vw, 12px);font-family:monospace;color:rgba(255,255,255,0.6);
            cursor:pointer;pointer-events:auto;backdrop-filter:blur(3px);
            border:1px solid rgba(255,255,255,0.15);white-space:nowrap;z-index:3;
        `;
        this._exitBtn.addEventListener('click', () => this._exitToGarden());
        this._exitBtn.addEventListener('touchend', (e) => { e.preventDefault(); this._exitToGarden(); });
        container.appendChild(this._exitBtn);

        // GPS Nav button
        this._gpsBtn = document.createElement('div');
        this._gpsBtn.id = 'mower-gps-btn';
        this._gpsBtn.textContent = '[G] GPS Nav';
        this._gpsBtn.style.cssText = `
            position:absolute;top:6px;right:30%;transform:translateX(50%);
            background:rgba(0,0,0,0.55);padding:3px 12px;border-radius:4px;
            font-size:clamp(9px, 2vw, 12px);font-family:monospace;color:rgba(255,255,255,0.6);
            cursor:pointer;pointer-events:auto;backdrop-filter:blur(3px);
            border:1px solid rgba(255,255,255,0.15);white-space:nowrap;z-index:3;
        `;
        this._gpsBtn.addEventListener('click', () => {
            this._gpsNav = !this._gpsNav;
            this._gpsTarget = null;
            this._game.showNotification(this._gpsNav ? '📡 GPS Nav: ON — Auto-pilot engaged' : '📡 GPS Nav: OFF — Manual control');
        });
        this._gpsBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this._gpsNav = !this._gpsNav;
            this._gpsTarget = null;
            this._game.showNotification(this._gpsNav ? '📡 GPS Nav: ON — Auto-pilot engaged' : '📡 GPS Nav: OFF — Manual control');
        });
        container.appendChild(this._gpsBtn);

        this._ctx = this._canvas.getContext('2d', { alpha: false });

        // Build garden grid and obstacles
        this._buildGarden();

        // Starting position: safely inside the garden, facing north
        this._px = (this.GRID_W / 2) * this.CELL_SIZE;
        this._py = (this.GRID_H - 4) * this.CELL_SIZE;
        this._angle = -Math.PI / 2;

        // ── Keyboard input ──
        this._onKeyDown = (e) => {
            if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS'].includes(e.code)) {
                this._keys[e.code] = true;
                e.preventDefault();
            }
            if (e.code === 'KeyU') {
                e.preventDefault();
                this._exitToGarden();
            }
            if (e.code === 'KeyG') {
                e.preventDefault();
                this._gpsNav = !this._gpsNav;
                this._gpsTarget = null;
                this._game.showNotification(this._gpsNav ? '📡 GPS Nav: ON — Auto-pilot engaged' : '📡 GPS Nav: OFF — Manual control');
            }
        };
        this._onKeyUp = (e) => { this._keys[e.code] = false; };
        this._onResize = () => this._resizeCanvas();
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
        window.addEventListener('resize', this._onResize);

        // ── Pointer / touch input (tap-to-drive) ──
        this._setupPointerControls();

        // Start engine sound + music
        this._startEngineAudio();
        this._startMusic();

        // Show intro message then start
        const controlHint = this._isTouch
            ? 'Tap and hold to steer and drive. Tap the dashboard to brake.'
            : 'Arrow keys / WASD to drive. Or click and hold to steer.';
        game.startDialogue([
            { speaker: 'Ryan', text: '*Klimt op de zitmaaier* Right. The grass isn\'t going to cut itself.' },
            { speaker: 'Ryan', text: 'Mow every patch. Avoid the trees, bushes, and the dogs.' },
            { speaker: 'Ryan', text: controlHint },
        ], () => {
            this._introShown = true;
            this._running = true;
            this._lastTime = performance.now();
            this._gameLoop();
        });
    },

    onExit() {
        this._running = false;
        if (this._raf) cancelAnimationFrame(this._raf);
        this._raf = null;
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
        window.removeEventListener('resize', this._onResize);
        this._removePointerControls();
        this._stopMusic();
        this._stopEngineAudio();

        // Remove injected elements
        if (this._canvas) { this._canvas.remove(); this._canvas = null; }
        if (this._hud) { this._hud.remove(); this._hud = null; }
        if (this._exitBtn) { this._exitBtn.remove(); this._exitBtn = null; }
        if (this._gpsBtn) { this._gpsBtn.remove(); this._gpsBtn = null; }

        // Restore hidden scene elements
        const bg = document.getElementById('scene-background');
        if (bg) bg.style.display = '';
        const hs = document.getElementById('scene-hotspots');
        if (hs) hs.style.display = '';
        const container = document.getElementById('scene-container');
        if (container) container.style.background = '';

        this._ctx = null;
        this._grid = null;
        this._obstacles = [];
        this._dogs = [];
    },

    /* ═══════════════════════════════════════════════════════════
     *  POINTER / TOUCH CONTROLS  (tap-to-drive)
     * ═══════════════════════════════════════════════════════════
     *
     *  Screen layout (normalised Y):
     *    0.00 – 0.12  →  HUD / mini-map zone (ignore taps)
     *    0.12 – 0.82  →  3D view: tap & hold = steer + accelerate
     *    0.82 – 1.00  →  Dashboard: tap = brake / reverse
     *
     *  Steering:
     *    pointerX < 0.35  →  turn left   (proportional)
     *    pointerX > 0.65  →  turn right  (proportional)
     *    0.35 – 0.65      →  straight
     *
     * ═══════════════════════════════════════════════════════════ */

    _setupPointerControls() {
        const canvas = this._canvas;
        if (!canvas) return;

        const norm = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) / rect.width,
                y: (clientY - rect.top) / rect.height,
            };
        };

        const onDown = (e) => {
            e.preventDefault();
            const p = norm(e);
            this._pointerDown = true;
            this._pointerX = p.x;
            this._pointerY = p.y;
            this._updatePointerSteering(p.x, p.y);
            this._tapIndicator = { x: p.x, y: p.y, age: 0 };
        };
        const onMove = (e) => {
            e.preventDefault();
            if (!this._pointerDown) return;
            const p = norm(e);
            this._pointerX = p.x;
            this._pointerY = p.y;
            this._updatePointerSteering(p.x, p.y);
        };
        const onUp = (e) => {
            e.preventDefault();
            this._pointerDown = false;
            this._autoGas = false;
            this._autoBrake = false;
            this._autoSteer = 0;
        };

        this._ptrDown = onDown;
        this._ptrMove = onMove;
        this._ptrUp   = onUp;
        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseup', onUp);
        canvas.addEventListener('mouseleave', onUp);
        canvas.addEventListener('touchstart', onDown, { passive: false });
        canvas.addEventListener('touchmove', onMove, { passive: false });
        canvas.addEventListener('touchend', onUp, { passive: false });
        canvas.addEventListener('touchcancel', onUp, { passive: false });
    },

    _removePointerControls() {
        const c = this._canvas;
        if (!c) return;
        c.removeEventListener('mousedown', this._ptrDown);
        c.removeEventListener('mousemove', this._ptrMove);
        c.removeEventListener('mouseup', this._ptrUp);
        c.removeEventListener('mouseleave', this._ptrUp);
        c.removeEventListener('touchstart', this._ptrDown);
        c.removeEventListener('touchmove', this._ptrMove);
        c.removeEventListener('touchend', this._ptrUp);
        c.removeEventListener('touchcancel', this._ptrUp);
    },

    _updatePointerSteering(px, py) {
        if (py < 0.12) {
            this._autoGas = false;
            this._autoBrake = false;
            this._autoSteer = 0;
            return;
        }
        if (py > 0.82) {
            this._autoGas = false;
            this._autoBrake = true;
            this._autoSteer = 0;
            return;
        }
        this._autoGas = true;
        this._autoBrake = false;
        if (px < 0.35)      this._autoSteer = -((0.35 - px) / 0.35);
        else if (px > 0.65) this._autoSteer = (px - 0.65) / 0.35;
        else                this._autoSteer = 0;
    },

    /* ═══════════════════════════════════════════════════════════
     *  GARDEN GENERATION
     * ═══════════════════════════════════════════════════════════ */

    _buildGarden() {
        const W = this.GRID_W, H = this.GRID_H;
        // Grid: 0 = unmowed grass, 1 = mowed, -1 = obstacle cell
        this._grid = [];
        for (let y = 0; y < H; y++) {
            this._grid[y] = [];
            for (let x = 0; x < W; x++) {
                // Border cells are fence/hedgerow
                this._grid[y][x] = (x === 0 || x === W-1 || y === 0 || y === H-1) ? -1 : 0;
            }
        }

        this._obstacles = [];
        this._dogs = [];

        // ── Trees (fixed) ──
        const trees = [
            { x: 5,  y: 5,  r: 2.5, label: 'Apple tree (Elstar)' },
            { x: 12, y: 4,  r: 2.2, label: 'Apple tree (Jonagold)' },
            { x: 8,  y: 7,  r: 2.0, label: 'Pear tree (Conference)' },
            { x: 3,  y: 8,  r: 1.8, label: 'Cherry tree' },
            { x: 20, y: 5,  r: 3.0, label: 'Walnut tree' },
            { x: 26, y: 10, r: 1.5, label: 'Plum tree' },
        ];
        trees.forEach(t => {
            this._addObstacle(this.OBS_TREE, t.x, t.y, t.r, t.label);
        });

        // ── Berry bushes (line along back fence area) ──
        const bushes = [
            { x: 14, y: 3, r: 1.2, label: 'Stekelbessen' },
            { x: 17, y: 3, r: 1.0, label: 'Kruisbessen' },
            { x: 20, y: 3, r: 1.3, label: 'Frambozen' },
            { x: 23, y: 3, r: 1.1, label: 'Japanse wijnbes' },
            { x: 26, y: 4, r: 1.0, label: 'Bramen' },
            { x: 10, y: 14, r: 1.0, label: 'Gooseberry' },
            { x: 24, y: 18, r: 1.2, label: 'Raspberry patch' },
        ];
        bushes.forEach(b => {
            this._addObstacle(this.OBS_BUSH, b.x, b.y, b.r, b.label);
        });

        // ── Fire drum (old oil drum) in the centre ──
        this._addObstacle(this.OBS_FIREDRUM, 16, 16, 1.0, 'Vuurton');

        // ── Dogs (moving obstacles) ──
        const dogs = [
            { x: 15, y: 20, r: 0.8, label: 'Tino',  speed: 6,  pattern: 'run' },
            { x: 22, y: 25, r: 0.7, label: 'Kessy', speed: 2,  pattern: 'lazy' },
            { x: 18, y: 22, r: 0.6, label: 'ET',    speed: 3,  pattern: 'sniff' },
        ];
        dogs.forEach(d => {
            const obs = this._addObstacle(this.OBS_DOG, d.x, d.y, d.r, d.label);
            obs.speed = d.speed;
            obs.pattern = d.pattern;
            obs.dirAngle = Math.random() * Math.PI * 2;
            obs.changeTimer = 2 + Math.random() * 3;
            obs.startX = d.x * this.CELL_SIZE;
            obs.startY = d.y * this.CELL_SIZE;
            this._dogs.push(obs);
        });

        // Mark obstacle cells on the grid
        this._obstacles.forEach(obs => {
            const cx = Math.floor(obs.wx / this.CELL_SIZE);
            const cy = Math.floor(obs.wy / this.CELL_SIZE);
            const cr = Math.ceil(obs.radius / this.CELL_SIZE) + 1;
            for (let dy = -cr; dy <= cr; dy++) {
                for (let dx = -cr; dx <= cr; dx++) {
                    const gx = cx + dx, gy = cy + dy;
                    if (gx > 0 && gx < W-1 && gy > 0 && gy < H-1) {
                        const dist = Math.sqrt(dx*dx + dy*dy) * this.CELL_SIZE;
                        if (dist < obs.radius && obs.type !== this.OBS_DOG) {
                            this._grid[gy][gx] = -1;
                        }
                    }
                }
            }
        });

        // Count mowable cells
        this._totalGrass = 0;
        this._mowedCount = 0;
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                if (this._grid[y][x] === 0) this._totalGrass++;
            }
        }
    },

    _addObstacle(type, gx, gy, radius, label) {
        const obs = {
            type,
            wx: gx * this.CELL_SIZE,
            wy: gy * this.CELL_SIZE,
            radius: radius * this.CELL_SIZE,
            label,
            gx, gy,
        };
        this._obstacles.push(obs);
        return obs;
    },

    /* ═══════════════════════════════════════════════════════════
     *  MAIN GAME LOOP
     * ═══════════════════════════════════════════════════════════ */

    _gameLoop() {
        if (!this._running) return;
        const now = performance.now();
        const dt = Math.min((now - this._lastTime) / 1000, 0.05); // Cap at 50ms
        this._lastTime = now;

        this._update(dt);
        this._render();
        this._updateHUD();

        this._raf = requestAnimationFrame(() => this._gameLoop());
    },

    /* ═══════════════════════════════════════════════════════════
     *  GPS NAV AUTOPILOT — finds nearest unmowed cell, steers toward it
     * ═══════════════════════════════════════════════════════════ */

    _updateGpsNav(dt) {
        const GS = this.GRID_SIZE;
        const CS = this.CELL_SIZE;
        const grid = this._grid;

        // Find nearest unmowed cell (spiral scan from player position)
        const pgx = Math.floor(this._px / CS);
        const pgy = Math.floor(this._py / CS);

        if (!this._gpsTarget || grid[this._gpsTarget.gy]?.[this._gpsTarget.gx] !== 0) {
            // Need a new target — find closest unmowed cell
            let bestDist = Infinity;
            let best = null;
            for (let r = 0; r < GS; r++) {
                for (let dy = -r; dy <= r; dy++) {
                    for (let dx = -r; dx <= r; dx++) {
                        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue; // shell only
                        const gx = pgx + dx, gy = pgy + dy;
                        if (gx < 1 || gx >= GS - 1 || gy < 1 || gy >= GS - 1) continue;
                        if (grid[gy][gx] !== 0) continue; // skip mowed/obstacle/out-of-bounds
                        const dist = dx * dx + dy * dy;
                        if (dist < bestDist) { bestDist = dist; best = { gx, gy }; }
                    }
                }
                if (best) break;
            }
            this._gpsTarget = best;
            if (!best) {
                // All mowed! Stop
                this._gpsNav = false;
                this._speed = 0;
                this._game.showNotification('\ud83c\udf1f GPS Nav: Complete! All grass mowed!');
                return;
            }
        }

        // Target world position (center of cell)
        const tx = (this._gpsTarget.gx + 0.5) * CS;
        const ty = (this._gpsTarget.gy + 0.5) * CS;
        const dx = tx - this._px;
        const dy = ty - this._py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Desired angle toward target
        const targetAngle = Math.atan2(dy, dx);

        // Compute angle difference (shortest path)
        let angleDiff = targetAngle - this._angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Steering: smooth turn toward target
        const TURN_RATE = 2.5;
        if (angleDiff > 0.05) {
            this._angle += TURN_RATE * dt;
        } else if (angleDiff < -0.05) {
            this._angle -= TURN_RATE * dt;
        }

        // Throttle: constant cruising speed for neat mowing
        const TARGET_SPEED = this.MAX_SPEED * 0.75;
        if (this._speed < TARGET_SPEED) {
            this._speed += this.ACCEL * dt;
        }
        this._speed = Math.min(this._speed, this.MAX_SPEED);

        // Move (same physics as manual)
        const cosA = Math.cos(this._angle);
        const sinA = Math.sin(this._angle);
        const newX = this._px + cosA * this._speed * dt;
        const newY = this._py + sinA * this._speed * dt;

        // Boundary clamp
        const margin = CS;
        const mapSize = GS * CS;
        this._px = Math.max(margin, Math.min(mapSize - margin, newX));
        this._py = Math.max(margin, Math.min(mapSize - margin, newY));

        // Obstacle avoidance: if about to hit an obstacle, pick a new target
        for (const obs of this._obstacles) {
            if (obs.type === this.OBS_DOG) continue;
            const odx = this._px - obs.wx;
            const ody = this._py - obs.wy;
            const oDist = Math.sqrt(odx * odx + ody * ody);
            if (oDist < obs.radius + CS * 0.5) {
                // Push away and find new target
                this._px += (odx / oDist) * CS * 0.3;
                this._py += (ody / oDist) * CS * 0.3;
                this._gpsTarget = null; // re-search
                break;
            }
        }

        // Mowing (same logic as manual)
        if (this._speed > 0.1) {
            const gx = Math.floor(this._px / CS);
            const gy = Math.floor(this._py / CS);
            if (gx >= 0 && gx < GS && gy >= 0 && gy < GS && grid[gy][gx] === 0) {
                grid[gy][gx] = 1;
                this._mowedCount++;
                if (this._mowedCount >= this._totalGrass) {
                    this._gpsNav = false;
                    this._finished = true;
                    this._game.showNotification('\ud83c\udf1f All grass mowed! Well done!');
                }
            }
        }

        // Update engine sound
        this._updateEngineSound();
    },

    /* ═══════════════════════════════════════════════════════════
     *  UPDATE (Physics, mowing, collisions)
     * ═══════════════════════════════════════════════════════════ */

    _update(dt) {
        if (this._finished) return;
        const K = this._keys;

        // ── GPS Nav autopilot ──
        if (this._gpsNav) {
            this._updateGpsNav(dt);
            // Update GPS button appearance
            if (this._gpsBtn) this._gpsBtn.style.color = '#00ff66';
            return; // GPS handles all movement
        } else {
            if (this._gpsBtn) this._gpsBtn.style.color = 'rgba(255,255,255,0.6)';
        }

        // ── Combine keyboard + pointer input ──
        const kbLeft  = K['ArrowLeft']  || K['KeyA'];
        const kbRight = K['ArrowRight'] || K['KeyD'];
        const kbUp    = K['ArrowUp']    || K['KeyW'];
        const kbDown  = K['ArrowDown']  || K['KeyS'];

        let steer = 0;
        if (kbLeft)       steer = -1;
        else if (kbRight) steer = 1;
        else if (this._pointerDown) steer = this._autoSteer;

        let wantsGas   = kbUp   || (this._pointerDown && this._autoGas);
        let wantsBrake = kbDown || (this._pointerDown && this._autoBrake);

        // ── Steering ──
        const turnMul = Math.abs(this._speed) > 0.2 ? 1 : 0.3;
        this._angle += steer * this.TURN_SPEED * dt * turnMul;

        // ── Acceleration ──
        if (wantsGas) {
            this._speed += this.ACCEL * dt;
            if (this._speed > this.MAX_SPEED) this._speed = this.MAX_SPEED;
        } else if (wantsBrake) {
            this._speed -= this.BRAKE * dt;
            if (this._speed < -this.REVERSE_MAX) this._speed = -this.REVERSE_MAX;
        } else {
            // Friction
            if (this._speed > 0) {
                this._speed -= this.FRICTION * dt;
                if (this._speed < 0) this._speed = 0;
            } else if (this._speed < 0) {
                this._speed += this.FRICTION * dt;
                if (this._speed > 0) this._speed = 0;
            }
        }

        // ── Movement ──
        const dx = Math.cos(this._angle) * this._speed * dt;
        const dy = Math.sin(this._angle) * this._speed * dt;
        const nx = this._px + dx;
        const ny = this._py + dy;

        // Boundary check
        const margin = this.CELL_SIZE * 1.2;
        const maxX = (this.GRID_W - 1) * this.CELL_SIZE - margin;
        const maxY = (this.GRID_H - 1) * this.CELL_SIZE - margin;

        let blocked = false;
        if (nx < margin || nx > maxX || ny < margin || ny > maxY) {
            blocked = true;
        }

        // Collision with static obstacles
        if (!blocked) {
            for (const obs of this._obstacles) {
                if (obs.type === this.OBS_DOG) continue; // Dogs handled separately
                const odx = nx - obs.wx;
                const ody = ny - obs.wy;
                const dist = Math.sqrt(odx*odx + ody*ody);
                if (dist < obs.radius * 0.7 + this.CELL_SIZE * 0.3) {
                    blocked = true;
                    break;
                }
            }
        }

        if (blocked) {
            // Halt rather than endlessly bouncing
            this._speed = 0;
            this._shakeTimer = 0.12;
            if (this._collisionTimer <= 0) {
                this._collisionTimer = 1.0;
                this._game.showNotification('💥 Bump! Watch out!');
            }
        } else {
            this._px = nx;
            this._py = ny;
        }

        // ── Dog collision (soft — dogs run away) ──
        for (const dog of this._dogs) {
            const ddx = this._px - dog.wx;
            const ddy = this._py - dog.wy;
            const dist = Math.sqrt(ddx*ddx + ddy*ddy);
            if (dist < dog.radius + this.CELL_SIZE * 0.8) {
                // Dog dodges away
                dog.dirAngle = Math.atan2(-ddy, -ddx) + (Math.random() - 0.5) * 0.5;
                dog.speed = 12; // Sprint away
                dog.changeTimer = 2;
                if (this._collisionTimer <= 0) {
                    this._collisionTimer = 2;
                    const msgs = [
                        `🐕 ${dog.label} dodges out of the way!`,
                        `🐕 Whoa! ${dog.label}! Move it!`,
                        `🐕 ${dog.label} yelps and runs!`,
                    ];
                    this._game.showNotification(msgs[Math.floor(Math.random() * msgs.length)]);
                }
            }
        }

        // ── Mow current cell ──
        const gx = Math.floor(this._px / this.CELL_SIZE);
        const gy = Math.floor(this._py / this.CELL_SIZE);
        if (gx > 0 && gx < this.GRID_W-1 && gy > 0 && gy < this.GRID_H-1) {
            if (this._grid[gy][gx] === 0 && Math.abs(this._speed) > 0.1) {
                this._grid[gy][gx] = 1;
                this._mowedCount++;
            }
            // Also mow adjacent cell for mower width
            const offsets = [[1,0],[-1,0],[0,1],[0,-1]];
            const forward = offsets[Math.floor(Math.random() * offsets.length)];
            const ax = gx + forward[0], ay = gy + forward[1];
            if (ax > 0 && ax < this.GRID_W-1 && ay > 0 && ay < this.GRID_H-1) {
                if (this._grid[ay][ax] === 0 && Math.abs(this._speed) > 0.3) {
                    this._grid[ay][ax] = 1;
                    this._mowedCount++;
                }
            }
        }

        // ── Update dogs ──
        this._updateDogs(dt);

        // ── Timers ──
        if (this._collisionTimer > 0) this._collisionTimer -= dt;
        if (this._shakeTimer > 0) this._shakeTimer -= dt;
        if (this._tapIndicator) {
            this._tapIndicator.age += dt;
            if (this._tapIndicator.age > 0.5) this._tapIndicator = null;
        }

        // ── Engine sound pitch ──
        this._updateEngineSound();

        // ── Check win ──
        if (this._mowedCount >= this._totalGrass * 0.92) { // 92% = good enough
            this._finished = true;
            this._speed = 0;
            this._running = false;
            this._game.setFlag('garden_mowed');
            setTimeout(() => {
                this._game.startDialogue([
                    { speaker: 'Ryan', text: '*Zet de motor uit* Done. Every blade of grass at exactly the same height.' },
                    { speaker: 'Ryan', text: 'Heerlijk. The garden looks perfect.' },
                    { speaker: 'Ryan', text: 'And I just solved... absolutely nothing. But the lawn is great.' },
                    { speaker: 'Ryan', text: 'Back to reality.' },
                ], () => {
                    this._game.loadScene('garden_back');
                });
            }, 500);
        }
    },

    _updateDogs(dt) {
        const CS = this.CELL_SIZE;
        const margin = CS * 2;
        const maxCoord = (this.GRID_W - 2) * CS;

        for (const dog of this._dogs) {
            dog.changeTimer -= dt;

            // Change direction periodically
            if (dog.changeTimer <= 0) {
                if (dog.pattern === 'run') {
                    dog.dirAngle = Math.random() * Math.PI * 2;
                    dog.speed = 4 + Math.random() * 4;
                    dog.changeTimer = 1 + Math.random() * 2;
                } else if (dog.pattern === 'lazy') {
                    dog.dirAngle = Math.random() * Math.PI * 2;
                    dog.speed = Math.random() > 0.5 ? (1 + Math.random() * 2) : 0;
                    dog.changeTimer = 3 + Math.random() * 5;
                } else { // sniff
                    dog.dirAngle += (Math.random() - 0.5) * 1.5;
                    dog.speed = 1 + Math.random() * 3;
                    dog.changeTimer = 1.5 + Math.random() * 2;
                }
            }

            // Move
            dog.wx += Math.cos(dog.dirAngle) * dog.speed * dt;
            dog.wy += Math.sin(dog.dirAngle) * dog.speed * dt;

            // Keep in bounds
            if (dog.wx < margin) { dog.wx = margin; dog.dirAngle = Math.random() * Math.PI - Math.PI/2; }
            if (dog.wx > maxCoord) { dog.wx = maxCoord; dog.dirAngle = Math.PI + Math.random() * Math.PI - Math.PI/2; }
            if (dog.wy < margin) { dog.wy = margin; dog.dirAngle = Math.random() * Math.PI; }
            if (dog.wy > maxCoord) { dog.wy = maxCoord; dog.dirAngle = -Math.random() * Math.PI; }

            // Avoid static obstacles
            for (const obs of this._obstacles) {
                if (obs === dog || obs.type === this.OBS_DOG) continue;
                const ddx = dog.wx - obs.wx;
                const ddy = dog.wy - obs.wy;
                const dist = Math.sqrt(ddx*ddx + ddy*ddy);
                if (dist < obs.radius + dog.radius) {
                    dog.dirAngle = Math.atan2(ddy, ddx);
                    dog.wx += Math.cos(dog.dirAngle) * 2;
                    dog.wy += Math.sin(dog.dirAngle) * 2;
                }
            }

            // Gradually slow sprint speed back to normal
            if (dog.speed > 8) dog.speed -= dt * 4;
        }
    },

    /* ═══════════════════════════════════════════════════════════
     *  PSEUDO-3D RENDERING
     * ═══════════════════════════════════════════════════════════ */

    _resizeCanvas() {
        if (!this._canvas) return;
        const rect = this._canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const maxW = 640, maxH = 420;
        const w = Math.min(Math.round(rect.width * dpr * 0.6), maxW);
        const h = Math.min(Math.round(rect.height * dpr * 0.6), maxH);
        this._canvas.width = Math.max(w, 320);
        this._canvas.height = Math.max(h, 240);
    },

    _render() {
        const ctx = this._ctx;
        const W = this._canvas.width;
        const H = this._canvas.height;
        const CS = this.CELL_SIZE;

        // Camera shake (subtle)
        let shakeX = 0, shakeY = 0;
        if (this._shakeTimer > 0) {
            shakeX = (Math.random() - 0.5) * 3;
            shakeY = (Math.random() - 0.5) * 3;
        }

        ctx.save();
        ctx.translate(shakeX, shakeY);

        // ── Sky with sun and atmosphere ──
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.42);
        skyGrad.addColorStop(0, '#2a6ab5');
        skyGrad.addColorStop(0.3, '#5a9dd8');
        skyGrad.addColorStop(0.65, '#87ceeb');
        skyGrad.addColorStop(0.85, '#c2e4f0');
        skyGrad.addColorStop(1, '#d8eee8');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H * 0.42);

        const now = performance.now();

        // ── Sun ──
        const sunX = W * 0.75;
        const sunY = H * 0.10;
        const sunR = Math.min(W, H) * 0.04;
        // Sun glow (large soft halo)
        const glowGrad = ctx.createRadialGradient(sunX, sunY, sunR * 0.3, sunX, sunY, sunR * 6);
        glowGrad.addColorStop(0, 'rgba(255,255,200,0.5)');
        glowGrad.addColorStop(0.3, 'rgba(255,240,150,0.15)');
        glowGrad.addColorStop(1, 'rgba(255,220,100,0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, W, H * 0.42);
        // Sun rays (subtle)
        ctx.save();
        ctx.globalAlpha = 0.08;
        const rayAngle = now / 8000;
        for (let r = 0; r < 8; r++) {
            const a = rayAngle + r * Math.PI / 4;
            ctx.beginPath();
            ctx.moveTo(sunX, sunY);
            ctx.lineTo(sunX + Math.cos(a) * sunR * 7, sunY + Math.sin(a) * sunR * 7);
            ctx.lineTo(sunX + Math.cos(a + 0.12) * sunR * 7, sunY + Math.sin(a + 0.12) * sunR * 7);
            ctx.fillStyle = '#fffbe0';
            ctx.fill();
        }
        ctx.restore();
        // Sun disc
        ctx.fillStyle = '#fff8d0';
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fffef5';
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // ── Clouds (volumetric layered) ──
        const cloudTime = now / 1000;
        const cloudDefs = [
            { x0: 0.08, y: 0.06, w: 65, h: 16, speed: 0.008, puffs: 4 },
            { x0: 0.30, y: 0.13, w: 90, h: 20, speed: 0.005, puffs: 5 },
            { x0: 0.55, y: 0.04, w: 50, h: 12, speed: 0.010, puffs: 3 },
            { x0: 0.80, y: 0.17, w: 75, h: 18, speed: 0.007, puffs: 5 },
            { x0: 0.15, y: 0.22, w: 55, h: 14, speed: 0.006, puffs: 3 },
            { x0: 0.60, y: 0.25, w: 45, h: 11, speed: 0.012, puffs: 3 },
        ];
        for (const cd of cloudDefs) {
            const baseX = ((cd.x0 * W + cloudTime * cd.speed * W) % (W + cd.w * 2.5)) - cd.w;
            const baseY = cd.y * H;
            // Shadow
            ctx.fillStyle = 'rgba(120,150,180,0.08)';
            for (let p = 0; p < cd.puffs; p++) {
                const px = baseX + (p / cd.puffs) * cd.w * 0.8;
                const py = baseY + 3 + Math.sin(p * 1.7) * cd.h * 0.15;
                ctx.beginPath();
                ctx.ellipse(px, py, cd.w / cd.puffs * 0.9, cd.h * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            // Bright body
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            for (let p = 0; p < cd.puffs; p++) {
                const px = baseX + (p / cd.puffs) * cd.w * 0.8;
                const py = baseY + Math.sin(p * 1.7) * cd.h * 0.15;
                ctx.beginPath();
                ctx.ellipse(px, py, cd.w / cd.puffs * 0.85, cd.h * 0.65, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            // Highlight top
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            for (let p = 0; p < cd.puffs; p++) {
                const px = baseX + (p / cd.puffs) * cd.w * 0.8;
                const py = baseY - cd.h * 0.15 + Math.sin(p * 1.7) * cd.h * 0.1;
                ctx.beginPath();
                ctx.ellipse(px, py, cd.w / cd.puffs * 0.55, cd.h * 0.35, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // ── Birds ──
        ctx.strokeStyle = '#1a1a2a';
        ctx.lineWidth = 1.5;
        for (const bird of this._birds) {
            bird.x += bird.speed / 60;
            bird.y += bird.drift / 60;
            bird.wingPhase += bird.wingSpeed / 60;
            if (bird.x > 1.1) { bird.x = -0.08; bird.y = 0.04 + Math.random() * 0.2; }
            if (bird.y < 0.02 || bird.y > 0.30) bird.drift *= -1;
            const bx = bird.x * W;
            const by = bird.y * H;
            const wing = Math.sin(bird.wingPhase) * bird.size * 0.8;
            const s = bird.size;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(bx - s * 1.5, by - wing);
            ctx.quadraticCurveTo(bx - s * 0.4, by - wing * 0.5 - s * 0.3, bx, by);
            ctx.quadraticCurveTo(bx + s * 0.4, by - wing * 0.5 - s * 0.3, bx + s * 1.5, by - wing);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // ── Wind turbines on northern horizon ──
        // Camera is looking at angle this._angle (-PI/2 = north)
        // Turbines are placed at fixed world positions far north (y < 0)
        const turbHorizonY = H * 0.42;
        const turbCosA = Math.cos(this._angle);
        const turbSinA = Math.sin(this._angle);
        const turbines = [
            { wx: 10, wy: -30 },
            { wx: 30, wy: -25 },
            { wx: 55, wy: -32 },
            { wx: 75, wy: -28 },
            { wx: 95, wy: -35 },
        ];
        const turbTime = now * 0.001;
        for (const tb of turbines) {
            const relX = tb.wx - this._px;
            const relY = tb.wy - this._py;
            const camZ = relX * turbCosA + relY * turbSinA;
            const camXt = relX * (-turbSinA) + relY * turbCosA;
            if (camZ < 5) continue; // behind or too close
            const sx = W / 2 + (camXt / camZ) * W * 0.8;
            if (sx < -50 || sx > W + 50) continue;
            const sy = turbHorizonY - 2; // just above horizon
            const tScale = Math.max(0.3, Math.min(1, 30 / camZ));
            const towerH = 35 * tScale;
            const bladeLen = 18 * tScale;
            // Tower
            ctx.strokeStyle = 'rgba(180,180,190,0.6)';
            ctx.lineWidth = Math.max(1, 2 * tScale);
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx, sy - towerH);
            ctx.stroke();
            // Nacelle
            ctx.fillStyle = 'rgba(200,200,210,0.7)';
            ctx.fillRect(sx - 2 * tScale, sy - towerH - 1.5 * tScale, 4 * tScale, 3 * tScale);
            // Rotating blades
            const hubX = sx, hubY = sy - towerH;
            const rotSpeed = 1.5 + (tb.wx * 0.01); // slight variation
            ctx.strokeStyle = 'rgba(220,220,230,0.7)';
            ctx.lineWidth = Math.max(1, 1.5 * tScale);
            for (let bl = 0; bl < 3; bl++) {
                const ba = turbTime * rotSpeed + bl * (Math.PI * 2 / 3);
                ctx.beginPath();
                ctx.moveTo(hubX, hubY);
                ctx.lineTo(hubX + Math.cos(ba) * bladeLen, hubY + Math.sin(ba) * bladeLen);
                ctx.stroke();
            }
        }

        // ── Ground plane (pseudo-3D scanlines) ──
        const horizonY = H * 0.42;
        const dashY = Math.floor(H * 0.82);
        const cosA = Math.cos(this._angle);
        const sinA = Math.sin(this._angle);
        const perpX = -sinA;
        const perpY = cosA;

        // Collect sprites to draw (sorted by distance later)
        const sprites = [];

        for (let screenY = Math.floor(horizonY); screenY < dashY; screenY++) {
            const rowDist = (H * 0.8) / (screenY - horizonY + 1);
            const worldScale = rowDist / 10;

            // World coordinates at center of this scanline
            const centerWX = this._px + cosA * rowDist * 0.3;
            const centerWY = this._py + sinA * rowDist * 0.3;

            for (let screenX = 0; screenX < W; screenX += 2) {
                const xOffset = (screenX - W/2) / (W/2);
                const wx = centerWX + perpX * xOffset * rowDist * 0.45;
                const wy = centerWY + perpY * xOffset * rowDist * 0.45;

                const gx = Math.floor(wx / CS);
                const gy = Math.floor(wy / CS);

                // Sub-pixel position within cell for micro-detail
                const fracX = (wx / CS) - gx;
                const fracY = (wy / CS) - gy;
                // Deterministic per-cell hash for variation
                const hash = ((gx * 2654435761 + gy * 340573321) >>> 0) & 0xFFFF;
                const h8 = hash & 0xFF;
                const h4 = hash & 0xF;
                // Wind sway (subtle time-based)
                const windT = now * 0.001;
                const windSway = Math.sin(windT * 1.2 + gx * 0.7 + gy * 0.5) * 0.3;

                let r, g, b;
                if (gx < 0 || gx >= this.GRID_W || gy < 0 || gy >= this.GRID_H) {
                    // Steel mesh fence
                    const isMesh = (gx + gy) % 2 === 0;
                    r = isMesh ? 138 : 96; g = isMesh ? 138 : 104; b = isMesh ? 138 : 96;
                } else {
                    const cell = this._grid[gy][gx];
                    if (cell === -1) {
                        // Soil/mulch — earthy with pebble variation
                        const pebble = ((h8 * 3) & 0xF);
                        r = 62 + pebble + (fracX > 0.7 ? 8 : 0);
                        g = 44 + pebble;
                        b = 26 + (pebble >> 1);
                    } else if (cell === 1) {
                        // ── MOWED LAWN ──
                        // Professional mowing stripes: alternating light/dark bands
                        const stripeDir = Math.floor((gx * cosA + gy * sinA) * 0.5);
                        const stripe = stripeDir % 2 === 0;
                        // Base green
                        const baseG = stripe ? 165 : 145;
                        const baseR = stripe ? 88 : 76;
                        const baseB = stripe ? 48 : 40;
                        // Per-cell micro variation (clover patches, slight wear)
                        const mv = (h4 - 7);
                        r = baseR + mv;
                        g = baseG + mv * 2;
                        b = baseB + mv;
                        // Sunlight highlight — cells facing the sun direction get a warm boost
                        const sunDot = fracX * 0.6 + fracY * 0.3;
                        if (sunDot > 0.5) { r += 8; g += 12; b += 3; }
                        // Fresh-cut sheen (specular on close-up)
                        if (rowDist < 8) {
                            const spec = ((h8 + Math.floor(fracX * 7)) & 0x7);
                            if (spec < 2) { r += 15; g += 20; b += 8; }
                        }
                    } else {
                        // ── UNMOWED TALL GRASS ──
                        // Multi-tone natural grass with depth
                        const baseG = 88 + (h4 * 3);
                        const baseR = 28 + (h4 * 2);
                        const baseB = 14 + h4;
                        // Clump variation — some cells are darker (shade), some lighter (sun-facing)
                        const clump = Math.sin(gx * 1.3 + gy * 0.9) * 0.5 + 0.5;
                        r = Math.floor(baseR + clump * 18);
                        g = Math.floor(baseG + clump * 25);
                        b = Math.floor(baseB + clump * 8);
                        // Wind-driven colour shift (lighter = sunlit tips waving)
                        const windLit = (windSway + 0.3) * 12;
                        g += Math.floor(windLit);
                        r += Math.floor(windLit * 0.3);
                        // Sub-cell darkness at base (grass shadowing itself)
                        if (fracY > 0.7) { r -= 6; g -= 10; b -= 3; }
                        // Dew sparkle on nearby cells
                        if (rowDist < 6 && ((h8 + Math.floor(fracX * 11)) & 0xF) === 0) {
                            r += 30; g += 35; b += 25;
                        }
                    }
                }

                // Clamp
                r = r < 0 ? 0 : r > 255 ? 255 : r;
                g = g < 0 ? 0 : g > 255 ? 255 : g;
                b = b < 0 ? 0 : b > 255 ? 255 : b;

                // Distance fog — warm atmospheric (blends toward hazy sky blue)
                const fog = Math.min(rowDist / 40, 0.7);
                const fogR = 200, fogG = 215, fogB = 225;
                const ff = fog * 0.45;
                const fr = Math.floor(r * (1 - ff) + fogR * ff);
                const fg = Math.floor(g * (1 - ff) + fogG * ff);
                const fb = Math.floor(b * (1 - ff) + fogB * ff);
                ctx.fillStyle = `rgb(${fr},${fg},${fb})`;
                ctx.globalAlpha = 1;
                ctx.fillRect(screenX, screenY, 2, 1);

                // ── Grass blade tips protruding above scanline (unmowed, close) ──
                if (rowDist < 15 && gx >= 0 && gx < this.GRID_W && gy >= 0 && gy < this.GRID_H) {
                    const cellVal = this._grid[gy] && this._grid[gy][gx];
                    if (cellVal === 0) {
                        // Multiple blade shapes per pixel column — scattered randomly
                        const seed1 = (gx * 41 + gy * 67 + screenX) & 0x3F;
                        // Extra hash for random sub-pixel scatter
                        const scatter = ((gx * 73 ^ gy * 137 ^ screenX * 31) & 0xFF) / 255;
                        if (seed1 < 10) { // slightly more blades
                            const rawH = 1 + (seed1 & 1) + ((scatter > 0.7) ? 1 : 0);
                            const distScale = Math.max(0.3, 1 - rowDist / 15);
                            const bladeH = Math.round(rawH * distScale);
                            // Randomized x offset so blades don't align to pixel grid
                            const xOff = (scatter - 0.5) * 2.4;
                            const sway = Math.sin(windT * 2.5 + gx * 1.1 + seed1) * 1.2;
                            const tipG = 45 + (seed1 * 7 & 0x3F);
                            const tipR = 12 + (seed1 & 0xF) + Math.floor(scatter * 8);
                            ctx.fillStyle = `rgb(${tipR},${tipG},${tipR >> 1})`;
                            ctx.fillRect(screenX + sway + xOff, screenY - bladeH, 1, bladeH);
                            // Occasional yellow seed head
                            if ((seed1 & 0x7) === 0 && rowDist < 8) {
                                ctx.fillStyle = '#d4c44a';
                                ctx.fillRect(screenX + sway + xOff, screenY - bladeH - 1, 1, 1);
                            }
                        }
                    } else if (cellVal === 1 && rowDist < 6) {
                        // Mowed grass — tiny clipping particles scattered
                        const seed2 = (gx * 53 + gy * 29 + screenX) & 0x3F;
                        if (seed2 < 2) {
                            ctx.fillStyle = 'rgba(120,170,60,0.4)';
                            ctx.fillRect(screenX, screenY, 1, 1);
                        }
                    }
                }
            }
        }
        ctx.globalAlpha = 1;

        // ── Draw obstacles as billboard sprites ──
        const spritesToDraw = [];
        for (const obs of this._obstacles) {
            // Transform to camera space
            const relX = obs.wx - this._px;
            const relY = obs.wy - this._py;

            // Rotate to camera
            const camZ = relX * cosA + relY * sinA;     // Depth
            const camX = relX * perpX + relY * perpY;   // Lateral

            if (camZ < 1 || camZ > 50) continue; // Behind camera or too far

            const screenX = W/2 + (camX / camZ) * W * 0.8;
            const scale = (H * 0.5) / camZ;
            const spriteH = obs.radius * scale * 1.5;
            const spriteW = obs.radius * scale * 1.2;
            const screenSpriteY = horizonY + (H * 0.8) / camZ - spriteH;

            spritesToDraw.push({
                obs, screenX, screenSpriteY, spriteW, spriteH, camZ, scale
            });
        }

        // Sort back-to-front
        spritesToDraw.sort((a, b) => b.camZ - a.camZ);

        for (const sp of spritesToDraw) {
            const fog = Math.min(sp.camZ / 50, 0.8);
            ctx.globalAlpha = 1 - fog * 0.4;
            this._drawSprite(ctx, sp);
        }
        ctx.globalAlpha = 1;

        // ── Mower dashboard / cockpit overlay ──
        this._drawDashboard(ctx, W, H, dashY);

        // ── Tap indicator ──
        if (this._tapIndicator) {
            const ti = this._tapIndicator;
            const alpha = Math.max(0, 1 - ti.age * 2);
            const r = 8 + ti.age * 30;
            ctx.strokeStyle = `rgba(255,255,200,${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ti.x * W, ti.y * H, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // ── Mini-map ──
        this._drawMiniMap(ctx, W, H);

        ctx.restore();
    },

    _drawSprite(ctx, sp) {
        const { obs, screenX, screenSpriteY, spriteW, spriteH } = sp;

        if (obs.type === this.OBS_TREE) {
            // Trunk
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(screenX - spriteW*0.12, screenSpriteY + spriteH*0.5, spriteW*0.24, spriteH*0.5);
            // Canopy
            ctx.fillStyle = '#1a6a1a';
            ctx.beginPath();
            ctx.ellipse(screenX, screenSpriteY + spriteH*0.35, spriteW*0.5, spriteH*0.4, 0, 0, Math.PI*2);
            ctx.fill();
            // Highlight
            ctx.fillStyle = '#2a8a2a';
            ctx.beginPath();
            ctx.ellipse(screenX - spriteW*0.1, screenSpriteY + spriteH*0.25, spriteW*0.3, spriteH*0.25, 0, 0, Math.PI*2);
            ctx.fill();
        } else if (obs.type === this.OBS_BUSH) {
            // Bush — round green blob
            ctx.fillStyle = '#3a7a2a';
            ctx.beginPath();
            ctx.ellipse(screenX, screenSpriteY + spriteH*0.5, spriteW*0.5, spriteH*0.4, 0, 0, Math.PI*2);
            ctx.fill();
            // Berries
            ctx.fillStyle = '#cc3333';
            for (let i = 0; i < 4; i++) {
                const bx = screenX + (Math.sin(i*2.1) * spriteW*0.25);
                const by = screenSpriteY + spriteH*0.35 + (Math.cos(i*1.7) * spriteH*0.15);
                ctx.beginPath();
                ctx.arc(bx, by, spriteW*0.04+1, 0, Math.PI*2);
                ctx.fill();
            }
        } else if (obs.type === this.OBS_DOG) {
            // Dog — simple shape
            const colors = {
                'Tino':  '#f5f5f0',
                'Kessy': '#e8e0d0',
                'ET':    '#c8a882',
            };
            const bodyColor = colors[obs.label] || '#aa8866';
            // Body
            ctx.fillStyle = bodyColor;
            ctx.beginPath();
            ctx.ellipse(screenX, screenSpriteY + spriteH*0.6, spriteW*0.4, spriteH*0.25, 0, 0, Math.PI*2);
            ctx.fill();
            // Head
            ctx.beginPath();
            const headX = screenX + Math.cos(obs.dirAngle || 0) * spriteW * 0.2;
            ctx.arc(headX, screenSpriteY + spriteH*0.4, spriteW*0.18, 0, Math.PI*2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(headX - spriteW*0.06, screenSpriteY + spriteH*0.37, 1, 0, Math.PI*2);
            ctx.arc(headX + spriteW*0.06, screenSpriteY + spriteH*0.37, 1, 0, Math.PI*2);
            ctx.fill();
            // Tail
            ctx.strokeStyle = bodyColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            const tailX = screenX - Math.cos(obs.dirAngle || 0) * spriteW * 0.3;
            ctx.moveTo(tailX, screenSpriteY + spriteH*0.55);
            ctx.quadraticCurveTo(tailX - spriteW*0.15, screenSpriteY + spriteH*0.2, tailX - spriteW*0.05, screenSpriteY + spriteH*0.35);
            ctx.stroke();
            // Label
            if (sp.camZ < 15) {
                ctx.fillStyle = '#fff';
                ctx.font = '6px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(obs.label, screenX, screenSpriteY + spriteH * 0.15);
            }
        } else if (obs.type === this.OBS_FIREDRUM) {
            // ── Fire Drum (old oil drum with flames & smoke) ──
            const t = performance.now() / 1000;
            const drumW = spriteW * 0.35;
            const drumH = spriteH * 0.45;
            const drumX = screenX - drumW / 2;
            const drumY = screenSpriteY + spriteH * 0.55;

            // Shadow on ground
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(screenX, drumY + drumH + 2, drumW * 0.8, drumH * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();

            // Drum body — rusty dark metal cylinder
            const drumGrad = ctx.createLinearGradient(drumX, drumY, drumX + drumW, drumY);
            drumGrad.addColorStop(0, '#3a3028');
            drumGrad.addColorStop(0.3, '#5a4a38');
            drumGrad.addColorStop(0.6, '#4a3a2a');
            drumGrad.addColorStop(1, '#2a2218');
            ctx.fillStyle = drumGrad;
            ctx.fillRect(drumX, drumY, drumW, drumH);

            // Drum rim (top)
            ctx.fillStyle = '#6a5a48';
            ctx.beginPath();
            ctx.ellipse(screenX, drumY, drumW * 0.5, drumH * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            // Drum rim (bottom)
            ctx.fillStyle = '#3a2a18';
            ctx.beginPath();
            ctx.ellipse(screenX, drumY + drumH, drumW * 0.5, drumH * 0.06, 0, 0, Math.PI * 2);
            ctx.fill();

            // Rust streaks
            ctx.fillStyle = 'rgba(120,60,20,0.3)';
            ctx.fillRect(drumX + drumW * 0.2, drumY + drumH * 0.3, drumW * 0.08, drumH * 0.5);
            ctx.fillRect(drumX + drumW * 0.6, drumY + drumH * 0.15, drumW * 0.06, drumH * 0.6);

            // ── FIRE — animated flames above the drum ──
            const flameBaseY = drumY;
            const flameCount = 7;
            for (let i = 0; i < flameCount; i++) {
                const seed = i * 1.7;
                const phase = t * (3 + i * 0.5) + seed;
                const fx = screenX + Math.sin(phase * 1.3) * drumW * 0.3 + (i - flameCount / 2) * drumW * 0.08;
                const fh = spriteH * (0.25 + Math.sin(phase) * 0.1 + Math.random() * 0.04);
                const fw = drumW * (0.15 + Math.sin(phase * 0.7) * 0.05);

                // Outer flame (orange-red)
                const flameGrad = ctx.createLinearGradient(fx, flameBaseY, fx, flameBaseY - fh);
                flameGrad.addColorStop(0, 'rgba(255,80,0,0.8)');
                flameGrad.addColorStop(0.4, 'rgba(255,160,20,0.6)');
                flameGrad.addColorStop(0.7, 'rgba(255,220,50,0.3)');
                flameGrad.addColorStop(1, 'rgba(255,255,100,0)');
                ctx.fillStyle = flameGrad;
                ctx.beginPath();
                ctx.moveTo(fx - fw, flameBaseY);
                ctx.quadraticCurveTo(fx - fw * 0.5, flameBaseY - fh * 0.7, fx + Math.sin(phase * 2) * fw * 0.3, flameBaseY - fh);
                ctx.quadraticCurveTo(fx + fw * 0.5, flameBaseY - fh * 0.7, fx + fw, flameBaseY);
                ctx.fill();
            }

            // Inner bright core flames
            for (let i = 0; i < 3; i++) {
                const phase = t * (4 + i) + i * 2.3;
                const fx = screenX + Math.sin(phase * 1.5) * drumW * 0.12;
                const fh = spriteH * (0.15 + Math.sin(phase) * 0.05);
                const fw = drumW * 0.08;
                ctx.fillStyle = `rgba(255,255,${150 + Math.floor(Math.sin(phase) * 50)},0.7)`;
                ctx.beginPath();
                ctx.moveTo(fx - fw, flameBaseY);
                ctx.quadraticCurveTo(fx, flameBaseY - fh, fx + fw, flameBaseY);
                ctx.fill();
            }

            // Fire glow (radial light on surroundings)
            const glowR = spriteW * 0.8;
            const fireGlow = ctx.createRadialGradient(screenX, flameBaseY - spriteH * 0.1, 0, screenX, flameBaseY, glowR);
            fireGlow.addColorStop(0, 'rgba(255,120,20,0.15)');
            fireGlow.addColorStop(0.5, 'rgba(255,80,0,0.05)');
            fireGlow.addColorStop(1, 'rgba(255,60,0,0)');
            ctx.fillStyle = fireGlow;
            ctx.fillRect(screenX - glowR, flameBaseY - glowR, glowR * 2, glowR * 2);

            // ── SMOKE — rising grey particles ──
            ctx.globalAlpha = 0.35;
            for (let i = 0; i < 5; i++) {
                const phase = t * (0.8 + i * 0.3) + i * 3.1;
                const age = (phase % 3) / 3; // 0..1 lifecycle
                const sx = screenX + Math.sin(phase * 0.7) * drumW * 0.4 + Math.sin(phase * 1.3) * drumW * 0.2;
                const sy = flameBaseY - spriteH * (0.2 + age * 0.6);
                const sr = drumW * (0.06 + age * 0.18);
                const grey = 100 + Math.floor(age * 80);
                ctx.fillStyle = `rgba(${grey},${grey},${grey + 10},${0.5 - age * 0.45})`;
                ctx.beginPath();
                ctx.arc(sx, sy, sr, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // Embers / sparks
            for (let i = 0; i < 4; i++) {
                const phase = t * (2 + i * 0.7) + i * 1.9;
                const age = (phase % 2) / 2;
                const ex = screenX + Math.sin(phase * 2.3) * drumW * 0.5;
                const ey = flameBaseY - spriteH * (0.1 + age * 0.5);
                if (age < 0.8) {
                    ctx.fillStyle = `rgba(255,${180 + Math.floor(age * 70)},50,${0.9 - age})`;
                    ctx.fillRect(ex, ey, 1, 1);
                }
            }

            // Label
            if (sp.camZ < 15) {
                ctx.fillStyle = '#ffcc44';
                ctx.font = '6px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('🔥 Vuurton', screenX, screenSpriteY + spriteH * 0.1);
            }
        }
    },

    _drawDashboard(ctx, W, H, dashY) {
        const dashH = H - dashY;

        // Dashboard background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, dashY, W, dashH);
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, dashY, W, 2);

        // Mower hood edges
        ctx.fillStyle = '#c41e1e';
        const hoodW = Math.round(W * 0.12);
        const hoodH = Math.round(dashH * 0.4);
        ctx.beginPath();
        ctx.moveTo(0, dashY);
        ctx.lineTo(hoodW * 2, dashY);
        ctx.lineTo(hoodW, dashY - hoodH);
        ctx.lineTo(0, dashY - hoodH);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(W, dashY);
        ctx.lineTo(W - hoodW * 2, dashY);
        ctx.lineTo(W - hoodW, dashY - hoodH);
        ctx.lineTo(W, dashY - hoodH);
        ctx.fill();

        // Steering wheel
        const wheelX = W / 2;
        const wheelY = dashY + dashH * 0.45;
        const wheelR = Math.min(dashH * 0.35, 18);

        let steerTilt = 0;
        if (this._keys['ArrowLeft'] || this._keys['KeyA']) steerTilt = -0.4;
        else if (this._keys['ArrowRight'] || this._keys['KeyD']) steerTilt = 0.4;
        else if (this._pointerDown) steerTilt = this._autoSteer * 0.5;

        ctx.save();
        ctx.translate(wheelX, wheelY);
        ctx.rotate(steerTilt);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = Math.max(3, wheelR * 0.25);
        ctx.beginPath();
        ctx.arc(0, 0, wheelR, 0, Math.PI*2);
        ctx.stroke();
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-wheelR*0.85, 0); ctx.lineTo(wheelR*0.85, 0);
        ctx.moveTo(0, -wheelR*0.85); ctx.lineTo(0, wheelR*0.5);
        ctx.stroke();
        ctx.restore();

        // Speed gauge (left)
        const gaugeW = Math.round(W * 0.16);
        const gaugeH = Math.round(dashH * 0.6);
        const gaugeY = dashY + (dashH - gaugeH) / 2;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(6, gaugeY, gaugeW, gaugeH);
        ctx.strokeStyle = '#444';
        ctx.strokeRect(6, gaugeY, gaugeW, gaugeH);
        ctx.fillStyle = '#00ff66';
        const fontSize = Math.max(8, Math.round(gaugeH * 0.45));
        ctx.font = `${fontSize}px monospace`;
        ctx.textAlign = 'left';
        const speedKmh = Math.abs(Math.round(this._speed * 3.6));
        ctx.fillText(`${speedKmh} km/h`, 10, gaugeY + gaugeH * 0.7);

        // Progress gauge (right)
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(W - gaugeW - 6, gaugeY, gaugeW, gaugeH);
        ctx.strokeStyle = '#444';
        ctx.strokeRect(W - gaugeW - 6, gaugeY, gaugeW, gaugeH);
        const pct = this._totalGrass > 0 ? Math.round((this._mowedCount / this._totalGrass) * 100) : 0;
        ctx.fillStyle = pct >= 90 ? '#00ff66' : '#ffcc00';
        ctx.fillText(`${pct}%`, W - gaugeW - 2, gaugeY + gaugeH * 0.7);

        // Exhaust particles
        if (Math.abs(this._speed) > 0.3) {
            ctx.fillStyle = 'rgba(150,150,150,0.3)';
            for (let i = 0; i < 3; i++) {
                const ex = hoodW * 0.8 + Math.random() * hoodW * 0.5;
                const ey = dashY - hoodH - Math.random() * hoodH;
                ctx.beginPath();
                ctx.arc(ex, ey, 2 + Math.random() * 3, 0, Math.PI*2);
                ctx.fill();
            }
        }

        // ── Touch zone indicators (visible on touch devices) ──
        if (this._isTouch && this._running) {
            ctx.globalAlpha = this._pointerDown ? 0.05 : 0.12;
            ctx.fillStyle = '#fff';
            ctx.font = `${Math.round(H * 0.08)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('◀', W * 0.1, H * 0.5);
            ctx.fillText('▶', W * 0.9, H * 0.5);
            ctx.fillText('▲', W * 0.5, H * 0.25);
            ctx.font = `${Math.round(dashH * 0.3)}px sans-serif`;
            ctx.fillText('■', W * 0.5, dashY + dashH * 0.85);
            ctx.globalAlpha = 1;
        }
    },

    /* ═══════════════════════════════════════════════════════════
     *  HUD
     * ═══════════════════════════════════════════════════════════ */

    _updateHUD() {
        if (!this._hud) return;
        const pct = this._totalGrass > 0 ? Math.round((this._mowedCount / this._totalGrass) * 100) : 0;
        const barColor = pct >= 90 ? '#00ff66' : pct >= 50 ? '#ffcc00' : '#ff6644';
        const controlHint = this._isTouch
            ? 'tap to steer &amp; drive · tap bottom to brake'
            : '← → steer · ↑ gas · ↓ brake · [G] GPS';
        const gpsStatus = this._gpsNav
            ? '<span style="color:#00ff66">📡 GPS NAV</span>'
            : '';

        this._hud.innerHTML = `
            <div style="position:absolute;top:6px;left:8px;
                        background:rgba(0,0,0,0.55);padding:4px 10px;border-radius:4px;
                        font-size:clamp(10px, 2.5vw, 14px);white-space:nowrap;
                        backdrop-filter:blur(3px);">
                MOWED: <span style="color:${barColor}">${pct}%</span> ${gpsStatus}
                <div style="width:clamp(60px,20vw,120px);height:5px;background:#333;
                            border-radius:3px;margin-top:2px;">
                    <div style="width:${pct}%;height:100%;background:${barColor};
                                border-radius:3px;transition:width 0.3s;"></div>
                </div>
            </div>
            <div style="position:absolute;bottom:clamp(60px,22%,90px);left:50%;
                        transform:translateX(-50%);
                        font-size:clamp(8px, 1.8vw, 11px);color:rgba(255,255,255,0.4);
                        white-space:nowrap;pointer-events:none;">
                ${controlHint}
            </div>
            ${this._finished ? `
                <div style="position:absolute;top:35%;left:50%;transform:translate(-50%,-50%);
                            font-size:clamp(18px,5vw,28px);color:#00ff66;
                            text-shadow:0 0 20px #00ff6688;text-align:center;">
                    ✓ LAWN COMPLETE!
                </div>
            ` : ''}
        `;
    },

    /* ═══════════════════════════════════════════════════════════
     *  ENGINE AUDIO
     * ═══════════════════════════════════════════════════════════ */

    _startEngineAudio() {
        try {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const ctx = this._audioCtx;

            // Engine as bass oscillator — plays the bass line rhythm
            // Sawtooth for gritty engine tone, pitch modulated by speed
            this._engineOsc = ctx.createOscillator();
            this._engineOsc.type = 'sawtooth';
            this._engineOsc.frequency.value = 45;

            // Second oscillator for deeper sub-bass throb
            this._engineOsc2 = ctx.createOscillator();
            this._engineOsc2.type = 'triangle';
            this._engineOsc2.frequency.value = 22;

            this._engineGain = ctx.createGain();
            this._engineGain.gain.value = 0.06;

            this._engineGain2 = ctx.createGain();
            this._engineGain2.gain.value = 0.04;

            // Filter for muffled engine/bass sound
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 280;
            filter.Q.value = 2;

            this._engineOsc.connect(filter);
            this._engineOsc2.connect(filter);
            filter.connect(this._engineGain);
            this._engineGain.connect(ctx.destination);
            this._engineOsc2.connect(this._engineGain2);
            this._engineGain2.connect(ctx.destination);
            this._engineOsc.start();
            this._engineOsc2.start();
            this._engineFilter = filter;
        } catch(e) {
            // Audio not available
        }
    },

    _updateEngineSound() {
        if (!this._engineOsc) return;
        const absSpeed = Math.abs(this._speed);
        // Bass-line pitch: tied to speed, musical intervals
        // Idle ≈ A1 (55Hz), cruising ≈ A2 (110Hz)
        const basePitch = 55 + absSpeed * 40;
        this._engineOsc.frequency.value = basePitch;
        if (this._engineOsc2) this._engineOsc2.frequency.value = basePitch * 0.5;
        // Rhythmic throb: pulsing gain simulating engine beat
        const throb = 0.5 + Math.sin(performance.now() * 0.012 * (1 + absSpeed * 2)) * 0.3;
        this._engineGain.gain.value = (0.04 + absSpeed * 0.05) * throb;
        if (this._engineGain2) this._engineGain2.gain.value = (0.03 + absSpeed * 0.03) * throb;
        // Open filter with speed
        if (this._engineFilter) {
            this._engineFilter.frequency.value = 180 + absSpeed * 250;
        }
    },

    _stopEngineAudio() {
        try {
            if (this._engineOsc) { this._engineOsc.stop(); this._engineOsc = null; }
            if (this._engineOsc2) { this._engineOsc2.stop(); this._engineOsc2 = null; }
            if (this._audioCtx) { this._audioCtx.close(); this._audioCtx = null; }
            this._engineGain = null;
            this._engineGain2 = null;
            this._engineFilter = null;
        } catch(e) {}
    },

    /* ═══════════════════════════════════════════════════════════
     *  MUSIC — Chiptune "Für Elise" loop (Beethoven)
     * ═══════════════════════════════════════════════════════════ */

    _startMusic() {
        try {
            const ctx = this._audioCtx;
            if (!ctx) return;

            // Note frequencies (all octaves needed)
            const C3=131, D3=147, E3=165, F3=175, G3=196, Ab3=208, A3=220, Bb3=233, B3=247;
            const C4=262, D4=294, Eb4=311, E4=330, F4=349, G4=392, Ab4=415, A4=440, Bb4=466, B4=494;
            const C5=523, D5=587, Eb5=622, E5=659, F5=698, G5=784, A5=880, B5=988;

            // Full Für Elise — all 3 sections (A-B-A-C-A)
            // [freq, duration in beats] — 0 = rest
            const melody = [
                // ════ Section A (first statement) ════
                // m1-2: the famous motif
                [E5,.5],[Eb5,.5],[E5,.5],[Eb5,.5],[E5,.5],[B4,.5],[D5,.5],[C5,.5],
                // m3-4
                [A4,1],[0,.5],[C4,.5],[E4,.5],[A4,.5],
                [B4,1],[0,.5],[E4,.5],[Ab4,.5],[B4,.5],
                // m5-6
                [C5,1],[0,.5],[E4,.5],[E5,.5],[Eb5,.5],
                [E5,.5],[Eb5,.5],[E5,.5],[B4,.5],[D5,.5],[C5,.5],
                // m7-8
                [A4,1],[0,.5],[C4,.5],[E4,.5],[A4,.5],
                [B4,1],[0,.5],[E4,.5],[C5,.5],[B4,.5],
                [A4,1],[0,1],

                // ════ Section A (repeat) ════
                [E5,.5],[Eb5,.5],[E5,.5],[Eb5,.5],[E5,.5],[B4,.5],[D5,.5],[C5,.5],
                [A4,1],[0,.5],[C4,.5],[E4,.5],[A4,.5],
                [B4,1],[0,.5],[E4,.5],[Ab4,.5],[B4,.5],
                [C5,1],[0,.5],[E4,.5],[E5,.5],[Eb5,.5],
                [E5,.5],[Eb5,.5],[E5,.5],[B4,.5],[D5,.5],[C5,.5],
                [A4,1],[0,.5],[C4,.5],[E4,.5],[A4,.5],
                [B4,1],[0,.5],[E4,.5],[C5,.5],[B4,.5],
                [A4,1],[0,1],

                // ════ Section B (lyrical middle section in F major) ════
                // m25-28
                [B4,.5],[C5,.5],[D5,.5],[E5,1.5],
                [G4,.5],[F5,.5],[E5,.5],[D5,1.5],
                [F4,.5],[E5,.5],[D5,.5],[C5,1.5],
                [E4,.5],[D5,.5],[C5,.5],[B4,1],
                // m29-32
                [0,.5],[E4,.5],[E5,.5],[0,.5],[E5,.5],[E5,.5],
                [E5,.5],[Eb5,.5],[E5,.5],[Eb5,.5],[E5,.5],[Eb5,.5],
                [E5,.5],[Eb5,.5],[E5,.5],[B4,.5],[D5,.5],[C5,.5],
                [A4,1],[0,1],

                // ════ Section A (da capo) ════
                [E5,.5],[Eb5,.5],[E5,.5],[Eb5,.5],[E5,.5],[B4,.5],[D5,.5],[C5,.5],
                [A4,1],[0,.5],[C4,.5],[E4,.5],[A4,.5],
                [B4,1],[0,.5],[E4,.5],[Ab4,.5],[B4,.5],
                [C5,1],[0,.5],[E4,.5],[E5,.5],[Eb5,.5],
                [E5,.5],[Eb5,.5],[E5,.5],[B4,.5],[D5,.5],[C5,.5],
                [A4,1],[0,.5],[C4,.5],[E4,.5],[A4,.5],
                [B4,1],[0,.5],[E4,.5],[C5,.5],[B4,.5],
                [A4,1],[0,1],

                // ════ Section C (dramatic, A minor → F major) ════
                // m51-54  
                [C5,.5],[C5,.5],[C5,.5],[C5,.5],[C5,.5],[C5,.5],
                [C5,.5],[D5,.25],[Eb5,.25],[F5,.5],[Ab4,.5],[F5,.5],
                [Eb5,.5],[D5,.5],[Eb5,.5],[F5,.5],[Eb5,.5],[D5,.5],
                [C5,1],[0,.5],[Bb4,.5],[A4,.5],[Bb4,.5],
                // m55-58: tension/release descending
                [A4,.5],[G4,.5],[A4,.5],[B4,.5],[C5,1],
                [D5,.5],[Eb5,.5],[E5,.5],[F5,.5],[A4,.5],[C5,.5],
                [B4,.5],[A4,.5],[G4,.5],[A4,.5],[B4,.5],[C5,.5],
                [D5,1],[0,.5],[G4,.5],[D5,.5],[C5,.5],
                // m59-62: return to A theme bridge
                [B4,.5],[A4,.5],[Ab4,.5],[A4,.5],[B4,.5],[C5,.5],
                [D5,.5],[E5,1],[E4,.5],[F5,.5],[E5,.5],
                [Eb5,.5],[E5,.5],[Eb5,.5],[E5,.5],[Eb5,.5],[E5,.5],
                [Eb5,.5],[E5,.5],[B4,.5],[D5,.5],[C5,.5],[0,.5],

                // ════ Section A (final statement) ════
                [E5,.5],[Eb5,.5],[E5,.5],[Eb5,.5],[E5,.5],[B4,.5],[D5,.5],[C5,.5],
                [A4,1],[0,.5],[C4,.5],[E4,.5],[A4,.5],
                [B4,1],[0,.5],[E4,.5],[Ab4,.5],[B4,.5],
                [C5,1],[0,.5],[E4,.5],[E5,.5],[Eb5,.5],
                [E5,.5],[Eb5,.5],[E5,.5],[B4,.5],[D5,.5],[C5,.5],
                [A4,1],[0,.5],[C4,.5],[E4,.5],[A4,.5],
                [B4,1],[0,.5],[E4,.5],[C5,.5],[B4,.5],
                // Final cadence
                [A4,1.5],[0,.5],[A4,.5],[B4,.25],[C5,.25],[A4,2],
                // Rest before loop
                [0, 2],
            ];

            // Bass line (left hand simplified arpeggios for full piece)
            const bass = [
                // Section A (1st)
                [A3,1],[0,1],[A3,1],[E3,1],[A3,1],[E3,1],
                [A3,1],[0,1],[A3,1],[E3,1],[A3,1],[E3,1],
                [A3,1],[E3,1],[A3,2],
                // Section A (repeat)
                [A3,1],[0,1],[A3,1],[E3,1],[A3,1],[E3,1],
                [A3,1],[0,1],[A3,1],[E3,1],[A3,1],[E3,1],
                [A3,1],[E3,1],[A3,2],
                // Section B
                [C4,2],[G3,2],[F3,2],[C4,2],
                [A3,2],[E3,2],[A3,2],[0,2],
                // Section A (da capo)
                [A3,1],[0,1],[A3,1],[E3,1],[A3,1],[E3,1],
                [A3,1],[0,1],[A3,1],[E3,1],[A3,1],[E3,1],
                [A3,1],[E3,1],[A3,2],
                // Section C
                [F3,2],[Ab3,2],[Bb3,2],[F3,2],
                [C3,2],[G3,2],[D3,2],[G3,2],
                [E3,2],[A3,2],[E3,2],[0,2],
                // Section A (final)
                [A3,1],[0,1],[A3,1],[E3,1],[A3,1],[E3,1],
                [A3,1],[0,1],[A3,1],[E3,1],[A3,1],[E3,1],
                [A3,2],[A3,2],[A3,2],
                [0,2],
            ];

            const bpm = 130;
            const beatSec = 60 / bpm;

            let totalBeats = 0;
            melody.forEach(n => totalBeats += n[1]);
            this._musicLoopSec = totalBeats * beatSec;

            // Master music gain
            this._musicGain = ctx.createGain();
            this._musicGain.gain.value = 0.12;

            // Warm low-pass filter
            this._musicLPF = ctx.createBiquadFilter();
            this._musicLPF.type = 'lowpass';
            this._musicLPF.frequency.value = 2200;
            this._musicLPF.Q.value = 1;

            this._musicGain.connect(this._musicLPF);
            this._musicLPF.connect(ctx.destination);

            this._musicPlaying = true;

            const scheduleVoice = (notes, waveType, vol, startTime) => {
                let t = startTime;
                const oscs = [];
                for (const [freq, beats] of notes) {
                    const dur = beats * beatSec;
                    if (freq > 0) {
                        const osc = ctx.createOscillator();
                        osc.type = waveType;
                        osc.frequency.value = freq;
                        const g = ctx.createGain();
                        // Envelope: attack-sustain-release
                        g.gain.setValueAtTime(0, t);
                        g.gain.linearRampToValueAtTime(vol, t + 0.015);
                        g.gain.setValueAtTime(vol * 0.85, t + dur * 0.6);
                        g.gain.linearRampToValueAtTime(0, t + dur - 0.01);
                        osc.connect(g);
                        g.connect(this._musicGain);
                        osc.start(t);
                        osc.stop(t + dur);
                        oscs.push(osc);
                    }
                    t += dur;
                }
                return oscs;
            };

            const scheduleLoop = () => {
                if (!this._musicPlaying) return;
                const start = ctx.currentTime + 0.08;
                scheduleVoice(melody, 'square', 0.08, start);
                // No separate bass voice — the engine IS the bass line
                this._musicTimeout = setTimeout(
                    () => scheduleLoop(),
                    (this._musicLoopSec - 0.3) * 1000
                );
            };

            scheduleLoop();
        } catch(e) { /* music not critical */ }
    },

    _exitToGarden() {
        if (this._finished) return;
        this._finished = true;
        this._running = false;
        this._speed = 0;
        if (this._raf) cancelAnimationFrame(this._raf);
        this._raf = null;
        this._game.startDialogue([
            { speaker: 'Ryan', text: '*Steps off the mower* Enough mowing for now.' },
        ], () => {
            this._game.loadScene('garden_back');
        });
    },

    _stopMusic() {
        this._musicPlaying = false;
        if (this._musicTimeout) { clearTimeout(this._musicTimeout); this._musicTimeout = null; }
        try {
            if (this._musicGain) { this._musicGain.disconnect(); }
            if (this._musicLPF) { this._musicLPF.disconnect(); }
        } catch(e) {}
        this._musicGain = null;
        this._musicLPF = null;
    },

    /* ═══════════════════════════════════════════════════════════
     *  MINI-MAP (top-right corner)
     * ═══════════════════════════════════════════════════════════ */

    _drawMiniMap(ctx, W, H) {
        const mapSize = Math.min(Math.round(W * 0.22), Math.round(H * 0.28), 100);
        const mx = W - mapSize - 6;
        const my = 6;
        const cellPx = mapSize / this.GRID_W;

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(mx - 2, my - 2, mapSize + 4, mapSize + 4);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(mx - 2, my - 2, mapSize + 4, mapSize + 4);

        // Grid cells
        for (let gy = 0; gy < this.GRID_H; gy++) {
            for (let gx = 0; gx < this.GRID_W; gx++) {
                const cell = this._grid[gy][gx];
                if (cell === -1) ctx.fillStyle = '#3a2a12';
                else if (cell === 1) ctx.fillStyle = '#5a9a32';
                else ctx.fillStyle = '#1e5510';
                ctx.fillRect(mx + gx * cellPx, my + gy * cellPx,
                             Math.ceil(cellPx), Math.ceil(cellPx));
            }
        }

        // Obstacles on top
        for (const obs of this._obstacles) {
            const ox = mx + (obs.wx / this.CELL_SIZE) * cellPx;
            const oy = my + (obs.wy / this.CELL_SIZE) * cellPx;
            const or = Math.max((obs.radius / this.CELL_SIZE) * cellPx * 0.5, 1.5);
            if (obs.type === this.OBS_TREE) ctx.fillStyle = '#0a4a0a';
            else if (obs.type === this.OBS_BUSH) ctx.fillStyle = '#2a5a1a';
            else if (obs.type === this.OBS_DOG) ctx.fillStyle = '#ffcc44';
            else if (obs.type === this.OBS_FIREDRUM) ctx.fillStyle = '#ff6622';
            ctx.beginPath();
            ctx.arc(ox, oy, or, 0, Math.PI * 2);
            ctx.fill();
        }

        // Player arrow
        const ppx = mx + (this._px / this.CELL_SIZE) * cellPx;
        const ppy = my + (this._py / this.CELL_SIZE) * cellPx;
        const arrowLen = Math.max(cellPx * 2.5, 4);
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.moveTo(ppx + Math.cos(this._angle) * arrowLen,
                   ppy + Math.sin(this._angle) * arrowLen);
        ctx.lineTo(ppx + Math.cos(this._angle + 2.5) * arrowLen * 0.5,
                   ppy + Math.sin(this._angle + 2.5) * arrowLen * 0.5);
        ctx.lineTo(ppx + Math.cos(this._angle - 2.5) * arrowLen * 0.5,
                   ppy + Math.sin(this._angle - 2.5) * arrowLen * 0.5);
        ctx.fill();

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = `${Math.max(7, Math.round(mapSize * 0.07))}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText('MAP', mx + mapSize - 2, my + mapSize + Math.round(mapSize * 0.1));
    },
};
