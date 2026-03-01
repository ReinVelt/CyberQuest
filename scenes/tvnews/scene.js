/**
 * TV News Scene — RTV Drenthe Regionaal Nieuws
 * Cinematic news overlay with story-aware content:
 *   - Early game (storyPart < 13): Normal regional Drenthe news
 *   - Mid game  (storyPart 13–16): Cryptic hints of unrest
 *   - Late game (news_broken flag): Full ZERFALL breaking news
 *
 * Uses same cinematic engine pattern as tvdocumentary scene:
 *   - Web Audio API synthesised news jingles & FX
 *   - RTV Drenthe-style lower thirds, tickers, breaking alerts
 *   - Film grain, scan lines, vignette overlays
 *   - Speech-driven auto-advance with minimum reading time
 */

const TvnewsScene = {
    id: 'tvnews',
    name: 'RTV Drenthe',
    background: 'assets/images/scenes/livingroom.svg',
    hidePlayer: true,
    playerStart: { x: 50, y: 70 },

    /* ═══════════════════════════════════════════════════════
     *  WEB AUDIO — news broadcast sound FX
     * ═══════════════════════════════════════════════════════ */
    _audioCtx: null,
    _masterGain: null,

    _initAudio() {
        if (this._audioCtx) return;
        try {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this._masterGain = this._audioCtx.createGain();
            this._masterGain.gain.value = 0.35;
            this._masterGain.connect(this._audioCtx.destination);
        } catch (e) { /* audio not critical */ }
    },

    /** RTV Drenthe regional news jingle (E5 → G5 → C6) */
    _playJingle() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx;
        const t = ctx.currentTime;
        const notes = [659.25, 783.99, 1046.50]; // E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, t + i * 0.25);
            gain.gain.linearRampToValueAtTime(0.4, t + i * 0.25 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.25 + 0.5);
            osc.connect(gain);
            gain.connect(this._masterGain);
            osc.start(t + i * 0.25);
            osc.stop(t + i * 0.25 + 0.6);
        });

        // Subtle pad underneath
        const pad = ctx.createOscillator();
        const padGain = ctx.createGain();
        pad.type = 'triangle';
        pad.frequency.value = 329.63; // E4
        padGain.gain.setValueAtTime(0, t);
        padGain.gain.linearRampToValueAtTime(0.08, t + 0.3);
        padGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        pad.connect(padGain);
        padGain.connect(this._masterGain);
        pad.start(t);
        pad.stop(t + 1.6);
    },

    /** Breaking news stinger — urgent descending tones */
    _playBreakingStinger() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx;
        const t = ctx.currentTime;
        const notes = [880, 830.6, 783.99, 659.25]; // A5→Ab5→G5→E5

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, t + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.2, t + i * 0.15 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.15 + 0.35);
            osc.connect(gain);
            gain.connect(this._masterGain);
            osc.start(t + i * 0.15);
            osc.stop(t + i * 0.15 + 0.4);
        });

        // Sub-bass impact
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(80, t + 0.6);
        sub.frequency.exponentialRampToValueAtTime(30, t + 1.5);
        subGain.gain.setValueAtTime(0.3, t + 0.6);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        sub.connect(subGain);
        subGain.connect(this._masterGain);
        sub.start(t + 0.6);
        sub.stop(t + 1.6);
    },

    /** Soft transition whoosh between segments */
    _playTransition() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx;
        const t = ctx.currentTime;
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(800, t);
        bandpass.frequency.exponentialRampToValueAtTime(3000, t + 0.2);
        bandpass.frequency.exponentialRampToValueAtTime(800, t + 0.4);
        bandpass.Q.value = 2;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        src.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(this._masterGain);
        src.start(t);
    },

    /** Ticker tape click */
    _playTick() {
        if (!this._audioCtx) return;
        const ctx = this._audioCtx;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 1200;
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.start(t);
        osc.stop(t + 0.05);
    },

    /* ═══════════════════════════════════════════════════════
     *  CLEANUP
     * ═══════════════════════════════════════════════════════ */
    _cleanupNews() {
        const overlay = document.getElementById('news-overlay');
        if (overlay) overlay.remove();
        const style = document.getElementById('news-style');
        if (style) style.remove();
        TvnewsScene._stopSpeech();
        if (TvnewsScene._tickerInterval) {
            clearInterval(TvnewsScene._tickerInterval);
            TvnewsScene._tickerInterval = null;
        }
    },

    _tickerInterval: null,

    /** Speak via game voice system. Returns Promise. */
    _speak(text, speaker = 'Documentary') {
        try {
            const vm = window.voiceManager;
            if (vm && vm.enabled) {
                return vm.speak(text, speaker);
            }
        } catch (e) { /* TTS not critical */ }
        return Promise.resolve();
    },

    _stopSpeech() {
        try {
            const vm = window.voiceManager;
            if (vm) vm.stop();
        } catch (e) { /* silent */ }
    },

    /* ═══════════════════════════════════════════════════════
     *  NEWS CONTENT — story-aware segments
     * ═══════════════════════════════════════════════════════ */
    _getNewsSequence(game) {
        const storyPart = game.gameState.storyPart || 0;
        const newsHasBroken = game.getFlag('news_broken');
        const zerfallDiscovered = game.getFlag('discovered_zerfall');

        // ────────────────────────────────────────────
        //  BREAKING NEWS — post-exposure
        // ────────────────────────────────────────────
        if (newsHasBroken) {
            return [
                // 0: BREAKING ALERT
                {
                    sound: 'breaking',
                    voice: { text: 'This is R.T.V. Drenthe with breaking news. A major international espionage scandal has been uncovered at a German military research facility near the Dutch border.', speaker: 'Documentary' },
                    isBreaking: true,
                    content: `
                        <div class="news-bg breaking"></div>
                        <div class="news-breaking-banner">
                            <div class="breaking-flash">BREAKING NEWS</div>
                        </div>
                        <div class="news-headline-box">
                            <h2>RUSSIAN SPIES INFILTRATED GERMAN MILITARY LAB</h2>
                            <p class="news-sub">Leaked documents reveal FSB operation inside NATO research facility</p>
                        </div>
                    `
                },
                // 1: THE STORY
                {
                    sound: 'transition',
                    voice: { text: 'According to documents simultaneously published by Der Spiegel, The Guardian, and Bellingcat, a Russian intelligence operation code-named Zerfall had been operating inside Steckerdoser Heide, a classified weapons testing facility in Lower Saxony.', speaker: 'Documentary' },
                    content: `
                        <div class="news-bg"></div>
                        <div class="news-lower-third">
                            <div class="lt-accent"></div>
                            <div class="lt-content">
                                <h3>Operation ZERFALL Exposed</h3>
                                <p>Simultaneous publication by Der Spiegel, The Guardian & Bellingcat</p>
                            </div>
                        </div>
                        <div class="news-text-panel">
                            <p>Documents reveal a Russian intelligence operation code-named <strong>ZERFALL</strong> had been running inside Steckerdoser Heide, a classified weapons testing facility in Lower Saxony, Germany.</p>
                            <p>The evidence was provided by an anonymous source described as a Dutch civilian.</p>
                        </div>
                    `
                },
                // 2: ARRESTS
                {
                    sound: 'transition',
                    voice: { text: 'German authorities have arrested facility director Wilhelm Hoffmann and Russian national Dimitri Volkov, believed to be an FSB operative who had posed as a senior researcher for over two years. Seven additional officials are under investigation.', speaker: 'Documentary' },
                    content: `
                        <div class="news-bg"></div>
                        <div class="news-lower-third">
                            <div class="lt-accent"></div>
                            <div class="lt-content">
                                <h3>Arrests & Investigation</h3>
                                <p>Facility director and Russian operative detained by BND</p>
                            </div>
                        </div>
                        <div class="news-text-panel">
                            <p>Facility director <strong>Wilhelm Hoffmann</strong> arrested on suspicion of collaboration.</p>
                            <p>Russian national <strong>Dimitri Volkov</strong>, believed FSB operative, in custody.</p>
                            <p>Seven additional officials under investigation.</p>
                        </div>
                    `
                },
                // 3: NATO RESPONSE
                {
                    sound: 'transition',
                    voice: { text: 'NATO has issued an emergency statement confirming the facility has been secured. The Dutch A.I.V.D. and German B.N.D. intelligence services are cooperating on the investigation. The Dutch government has called for an emergency session of parliament.', speaker: 'Documentary' },
                    content: `
                        <div class="news-bg"></div>
                        <div class="news-lower-third">
                            <div class="lt-accent"></div>
                            <div class="lt-content">
                                <h3>International Response</h3>
                                <p>NATO confirms facility secured — Parliament emergency session called</p>
                            </div>
                        </div>
                        <div class="news-text-panel">
                            <p>NATO has issued an emergency statement confirming the facility is secured.</p>
                            <p>AIVD and BND intelligence services cooperating on investigation.</p>
                            <p>Dutch parliament has called an emergency session.</p>
                        </div>
                    `
                },
                // 4: WRAP-UP
                {
                    sound: 'jingle',
                    voice: { text: 'We will continue to follow this developing story throughout the day. This is R.T.V. Drenthe.', speaker: 'Documentary' },
                    content: `
                        <div class="news-bg"></div>
                        <div class="news-title-card">
                            <div class="nos-logo">RTV</div>
                            <h1>REGIONAAL</h1>
                            <p class="news-tagline">We continue to follow this developing story</p>
                        </div>
                    `
                }
            ];
        }

        // ────────────────────────────────────────────
        //  MID-GAME — subtle hints of tension
        // ────────────────────────────────────────────
        if (zerfallDiscovered || storyPart >= 13) {
            return [
                {
                    sound: 'jingle',
                    voice: { text: 'Good evening. This is R.T.V. Drenthe. Tonight: heightened security activity reported near the German border, and questions in parliament about foreign interference in European research programs.', speaker: 'Documentary' },
                    content: `
                        <div class="news-bg"></div>
                        <div class="news-title-card">
                            <div class="nos-logo">RTV</div>
                            <h1>REGIONAAL</h1>
                            <p class="news-tagline">20:00 uur</p>
                        </div>
                    `
                },
                {
                    sound: 'transition',
                    voice: { text: 'Residents near the German border in Drenthe have reported unusual military vehicle movements over the past week. The German Ministry of Defence has declined to comment, calling the activity routine exercises.', speaker: 'Documentary' },
                    content: `
                        <div class="news-bg"></div>
                        <div class="news-lower-third">
                            <div class="lt-accent"></div>
                            <div class="lt-content">
                                <h3>Border Activity</h3>
                                <p>Military vehicle movements reported near Drenthe border region</p>
                            </div>
                        </div>
                        <div class="news-text-panel">
                            <p>Residents near the German border report unusual military movements.</p>
                            <p>German Ministry of Defence: "Routine exercises."</p>
                        </div>
                    `
                },
                {
                    sound: 'transition',
                    voice: { text: 'In the Hague, members of parliament have raised questions about cybersecurity vulnerabilities in joint European research facilities. The minister has promised a full review.', speaker: 'Documentary' },
                    content: `
                        <div class="news-bg"></div>
                        <div class="news-lower-third">
                            <div class="lt-accent"></div>
                            <div class="lt-content">
                                <h3>Parliamentary Questions</h3>
                                <p>Cybersecurity concerns in European research programs</p>
                            </div>
                        </div>
                        <div class="news-text-panel">
                            <p>Parliament questions cybersecurity in joint European facilities.</p>
                            <p>Minister promises full review of security protocols.</p>
                        </div>
                    `
                },
                {
                    sound: 'jingle',
                    voice: { text: 'That was R.T.V. Drenthe. More news at eleven.', speaker: 'Documentary' },
                    content: `
                        <div class="news-bg"></div>
                        <div class="news-title-card">
                            <div class="nos-logo">RTV</div>
                            <h1>REGIONAAL</h1>
                            <p class="news-tagline">Meer nieuws om 23:00</p>
                        </div>
                    `
                }
            ];
        }

        // ────────────────────────────────────────────
        //  EARLY GAME — normal Dutch news
        // ────────────────────────────────────────────
        return [
            {
                sound: 'jingle',
                voice: { text: 'Good evening. This is R.T.V. Drenthe. Tonight: the Drenthe province announces new funding for rural broadband, and ASTRON celebrates thirty years of the Westerbork telescope array.', speaker: 'Documentary' },
                content: `
                    <div class="news-bg"></div>
                    <div class="news-title-card">
                        <div class="nos-logo">RTV</div>
                        <h1>REGIONAAL</h1>
                        <p class="news-tagline">20:00 uur</p>
                    </div>
                `
            },
            {
                sound: 'transition',
                voice: { text: 'The Province of Drenthe has secured twenty-eight million euros in EU funding to bring high-speed fibre internet to rural communities. The project aims to connect over fifteen thousand households in areas like Compascuum, Emmen, and Schoonebeek by twenty twenty-seven.', speaker: 'Documentary' },
                content: `
                    <div class="news-bg"></div>
                    <div class="news-lower-third">
                        <div class="lt-accent"></div>
                        <div class="lt-content">
                            <h3>Rural Broadband Expansion</h3>
                            <p>€28 million EU funding secured for Drenthe fibre network</p>
                        </div>
                    </div>
                    <div class="news-text-panel">
                        <p>Province of Drenthe secures <strong>€28 million</strong> in EU funding.</p>
                        <p>High-speed fibre for rural communities: Compascuum, Emmen, Schoonebeek.</p>
                        <p>Target: 15,000 households connected by 2027.</p>
                    </div>
                `
            },
            {
                sound: 'transition',
                voice: { text: 'ASTRON, the Netherlands Institute for Radio Astronomy, is celebrating the thirtieth anniversary of the Westerbork Synthesis Radio Telescope. The fourteen-dish array near Hooghalen has contributed to over three thousand scientific publications and remains a cornerstone of European radio astronomy.', speaker: 'Documentary' },
                content: `
                    <div class="news-bg"></div>
                    <div class="news-lower-third">
                        <div class="lt-accent"></div>
                        <div class="lt-content">
                            <h3>ASTRON Celebrates 30 Years of WSRT</h3>
                            <p>Westerbork telescope array marks three decades of discovery</p>
                        </div>
                    </div>
                    <div class="news-text-panel">
                        <p>Westerbork Synthesis Radio Telescope turns 30.</p>
                        <p>14-dish array near Hooghalen: over 3,000 scientific publications.</p>
                        <p>A cornerstone of European radio astronomy.</p>
                    </div>
                `
            },
            {
                sound: 'transition',
                voice: { text: 'In other news, the annual Drenthe cycling race drew a record forty-two thousand spectators. And a farmer in Valthermond has grown what may be the Netherlands\' largest pumpkin, weighing in at five hundred and twelve kilograms.', speaker: 'Documentary' },
                content: `
                    <div class="news-bg"></div>
                    <div class="news-lower-third">
                        <div class="lt-accent"></div>
                        <div class="lt-content">
                            <h3>Regional News</h3>
                            <p>Record cycling spectators — Giant pumpkin in Valthermond</p>
                        </div>
                    </div>
                    <div class="news-text-panel">
                        <p>Annual Drenthe cycling race: <strong>42,000 spectators</strong> — a new record.</p>
                        <p>Valthermond farmer grows 512kg pumpkin — possibly the Netherlands' largest!</p>
                    </div>
                `
            },
            {
                sound: 'jingle',
                voice: { text: 'That was R.T.V. Drenthe. More news at eleven. Good evening.', speaker: 'Documentary' },
                content: `
                    <div class="news-bg"></div>
                    <div class="news-title-card">
                        <div class="nos-logo">RTV</div>
                        <h1>REGIONAAL</h1>
                        <p class="news-tagline">Meer nieuws om 23:00</p>
                    </div>
                `
            }
        ];
    },

    /* ═══════════════════════════════════════════════════════
     *  MAIN NEWS OVERLAY
     * ═══════════════════════════════════════════════════════ */
    showNewsOverlay(game) {
        const self = TvnewsScene;
        self._initAudio();

        // ── CSS ──
        const style = document.createElement('style');
        style.id = 'news-style';
        style.textContent = `
            /* ═══════ BASE OVERLAY ═══════ */
            #news-overlay {
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: #0a0a12;
                z-index: 8000;
                overflow: hidden;
                font-family: 'Helvetica Neue', 'Arial', sans-serif;
            }

            /* ═══════ SCREEN CONTAINER ═══════ */
            .news-screen {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                opacity: 0;
                transition: opacity 0.8s ease-in-out;
            }
            .news-screen.active { opacity: 1; }

            /* ═══════ BACKGROUND ═══════ */
            .news-bg {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: linear-gradient(160deg, #0a1628 0%, #0f1f3d 40%, #0a1628 100%);
            }
            .news-bg.breaking {
                background: linear-gradient(160deg, #2a0a0a 0%, #3d0f0f 40%, #2a0a0a 100%);
                animation: breakingPulse 2s ease-in-out infinite;
            }
            @keyframes breakingPulse {
                0%, 100% { filter: brightness(1); }
                50%      { filter: brightness(1.15); }
            }

            /* ═══════ NOS TITLE CARD ═══════ */
            .news-title-card {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                z-index: 20;
            }
            .nos-logo {
                font-size: 4.5em;
                font-weight: 800;
                letter-spacing: 12px;
                color: #00a650;
                text-shadow: 0 0 40px rgba(0,166,80,0.4);
                margin-bottom: 8px;
                opacity: 0;
                animation: logoReveal 1s ease-out 0.2s forwards;
            }
            .news-title-card h1 {
                font-size: 2.8em;
                font-weight: 200;
                letter-spacing: 16px;
                color: #fff;
                text-transform: uppercase;
                margin: 0;
                opacity: 0;
                animation: titleReveal 1s ease-out 0.6s forwards;
                text-shadow: 0 2px 20px rgba(0,0,0,0.8);
            }
            .news-tagline {
                font-size: 1.2em;
                font-weight: 300;
                color: #8899aa;
                letter-spacing: 3px;
                margin: 18px 0 0 0;
                opacity: 0;
                animation: subtitleReveal 0.8s ease-out 1s forwards;
            }

            @keyframes logoReveal {
                0%   { opacity: 0; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1); }
            }
            @keyframes titleReveal {
                0%   { opacity: 0; transform: translateY(15px); letter-spacing: 24px; }
                100% { opacity: 1; transform: translateY(0); letter-spacing: 16px; }
            }
            @keyframes subtitleReveal {
                0%   { opacity: 0; transform: translateY(8px); }
                100% { opacity: 1; transform: translateY(0); }
            }

            /* ═══════ BREAKING BANNER ═══════ */
            .news-breaking-banner {
                position: absolute;
                top: 8%;
                left: 0; right: 0;
                z-index: 30;
                text-align: center;
            }
            .breaking-flash {
                display: inline-block;
                background: #cc0000;
                color: #fff;
                font-size: 2em;
                font-weight: 800;
                letter-spacing: 8px;
                padding: 14px 50px;
                text-transform: uppercase;
                animation: breakingFlash 1s ease-in-out infinite;
                box-shadow: 0 0 60px rgba(204,0,0,0.5);
            }
            @keyframes breakingFlash {
                0%, 100% { opacity: 1; }
                50%      { opacity: 0.6; }
            }

            /* ═══════ HEADLINE BOX ═══════ */
            .news-headline-box {
                position: absolute;
                bottom: 18%;
                left: 5%; right: 5%;
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(15px);
                padding: 30px 40px;
                border-left: 5px solid #cc0000;
                z-index: 20;
                opacity: 0;
                animation: headlineSlide 0.8s ease-out 0.5s forwards;
            }
            .news-headline-box h2 {
                font-size: 2em;
                font-weight: 700;
                color: #fff;
                margin: 0 0 10px 0;
                letter-spacing: 1px;
                line-height: 1.3;
            }
            .news-headline-box .news-sub {
                font-size: 1.2em;
                font-weight: 300;
                color: #aab;
                margin: 0;
            }
            @keyframes headlineSlide {
                0%   { opacity: 0; transform: translateY(30px); }
                100% { opacity: 1; transform: translateY(0); }
            }

            /* ═══════ LOWER THIRD ═══════ */
            .news-lower-third {
                position: absolute;
                bottom: 12%;
                left: 0;
                display: flex;
                align-items: stretch;
                transform: translateX(-110%);
                animation: lowerThirdSlide 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s forwards;
                z-index: 20;
            }
            .news-lower-third .lt-accent {
                width: 5px;
                background: #f06000;
                flex-shrink: 0;
            }
            .news-lower-third .lt-content {
                background: rgba(0,0,0,0.88);
                padding: 16px 30px 16px 18px;
                backdrop-filter: blur(12px);
            }
            .news-lower-third h3 {
                font-size: 1.5em;
                font-weight: 600;
                color: #fff;
                margin: 0 0 4px 0;
                letter-spacing: 0.5px;
            }
            .news-lower-third p {
                font-size: 1em;
                color: #8899aa;
                margin: 0;
                font-weight: 300;
            }
            @keyframes lowerThirdSlide {
                0%   { transform: translateX(-110%); }
                100% { transform: translateX(0); }
            }

            /* ═══════ TEXT PANEL ═══════ */
            .news-text-panel {
                position: absolute;
                bottom: 26%;
                right: 5%;
                width: 48%;
                background: rgba(0,0,0,0.75);
                backdrop-filter: blur(15px);
                padding: 24px 30px;
                border-left: 3px solid #f06000;
                border-radius: 3px;
                box-shadow: 0 10px 50px rgba(0,0,0,0.5);
                opacity: 0;
                animation: panelReveal 0.7s ease-out 0.6s forwards;
                z-index: 15;
            }
            .news-text-panel p {
                font-size: 1.2em;
                font-weight: 300;
                color: #dde;
                margin: 8px 0;
                line-height: 1.6;
            }
            .news-text-panel strong {
                color: #fff;
                font-weight: 600;
            }
            @keyframes panelReveal {
                0%   { opacity: 0; transform: translateX(30px); }
                100% { opacity: 1; transform: translateX(0); }
            }

            /* ═══════ NEWS TICKER (bottom bar) ═══════ */
            .news-ticker {
                position: absolute;
                bottom: 0; left: 0; right: 0;
                height: 36px;
                background: rgba(15,31,61,0.95);
                border-top: 2px solid #f06000;
                overflow: hidden;
                z-index: 50;
                display: flex;
                align-items: center;
            }
            .news-ticker-label {
                background: #f06000;
                color: #fff;
                font-weight: 700;
                font-size: 0.8em;
                letter-spacing: 2px;
                padding: 0 16px;
                height: 100%;
                display: flex;
                align-items: center;
                flex-shrink: 0;
                text-transform: uppercase;
            }
            .news-ticker-text {
                color: #ccd;
                font-size: 0.9em;
                font-weight: 300;
                white-space: nowrap;
                animation: tickerScroll 35s linear infinite;
                padding-left: 100%;
            }
            .news-ticker.breaking {
                border-top-color: #cc0000;
            }
            .news-ticker.breaking .news-ticker-label {
                background: #cc0000;
                animation: breakingFlash 1s ease-in-out infinite;
            }
            @keyframes tickerScroll {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-100%); }
            }

            /* ═══════ FILM GRAIN ═══════ */
            .news-grain {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.04'/%3E%3C/svg%3E");
                opacity: 0.3;
                mix-blend-mode: overlay;
                pointer-events: none;
                z-index: 40;
                animation: noiseShift 0.25s steps(3) infinite;
            }
            @keyframes noiseShift {
                0%   { transform: translate(0, 0); }
                33%  { transform: translate(-1px, 2px); }
                66%  { transform: translate(2px, -1px); }
                100% { transform: translate(-1px, 1px); }
            }

            /* ═══════ SCAN LINES ═══════ */
            .news-scanlines {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.04) 2px,
                    rgba(0,0,0,0.04) 4px
                );
                pointer-events: none;
                z-index: 41;
            }

            /* ═══════ VIGNETTE ═══════ */
            .news-vignette {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%);
                pointer-events: none;
                z-index: 42;
            }

            /* ═══════ CONTINUE BUTTON ═══════ */
            .news-continue {
                position: absolute;
                bottom: 44px;
                right: 3%;
                font-size: 0.9em;
                font-weight: 500;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: #8899aa;
                background: rgba(0,0,0,0.6);
                border: 1px solid rgba(255,255,255,0.12);
                border-radius: 3px;
                padding: 8px 20px;
                cursor: pointer;
                z-index: 55;
                transition: all 0.3s ease;
                backdrop-filter: blur(5px);
            }
            .news-continue:hover {
                color: #fff;
                border-color: #f06000;
                box-shadow: 0 0 20px rgba(240,96,0,0.3);
            }

            /* ═══════ BRAND WATERMARK ═══════ */
            .news-brand {
                position: absolute;
                top: 3%;
                right: 3%;
                font-size: 1.1em;
                font-weight: 700;
                letter-spacing: 3px;
                color: rgba(240,96,0,0.5);
                z-index: 45;
            }

            /* ═══════ STEP COUNTER ═══════ */
            .news-step-counter {
                position: absolute;
                top: 3%;
                left: 3%;
                font-size: 0.85em;
                font-weight: 300;
                color: rgba(255,255,255,0.3);
                z-index: 45;
                letter-spacing: 2px;
            }

            /* ═══════ PROGRESS BAR ═══════ */
            .news-timeline {
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 3px;
                background: rgba(255,255,255,0.08);
                z-index: 50;
            }
            .news-timeline-fill {
                height: 100%;
                background: #f06000;
                transition: width 0.8s ease;
                box-shadow: 0 0 10px rgba(240,96,0,0.5);
            }
        `;
        document.head.appendChild(style);

        // ── Overlay ──
        const overlay = document.createElement('div');
        overlay.id = 'news-overlay';
        document.body.appendChild(overlay);

        // ── Get story-appropriate content ──
        const sequence = self._getNewsSequence(game);
        const isBreakingNews = game.getFlag('news_broken');

        // ── Ticker text ──
        const tickerItems = isBreakingNews
            ? [
                'BREAKING: Russian espionage ring uncovered at German military facility',
                'BND arrests facility director Wilhelm Hoffmann and Russian operative Dimitri Volkov',
                'NATO issues emergency statement — seven officials under investigation',
                'Documents published simultaneously by Der Spiegel, The Guardian, Bellingcat',
                'Dutch parliament calls emergency session on foreign intelligence threat',
                'AIVD confirms cooperation with German BND on Operation ZERFALL investigation'
            ]
            : [
                'Weather: Cloudy with scattered showers in Drenthe, highs of 14°C',
                'AEX index closed up 0.3% — European markets mixed',
                'NS reports delays on Zwolle-Emmen line due to signal failure',
                'Province of Drenthe announces new cycling path along Hondsrug',
                'KNMI: Moderate wind warning for northern provinces tomorrow',
                'Emmen Zoo welcomes three new red panda cubs'
            ];

        let currentStep = 0;

        const showStep = () => {
            // ── End of broadcast ──
            if (currentStep >= sequence.length) {
                game.setFlag('tv_news_watched', true);

                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.8s ease';
                setTimeout(() => {
                    self._cleanupNews();
                    game.startDialogue([
                        { speaker: 'Ryan', text: isBreakingNews ? 'That\'s... that\'s everything we did. It\'s really out there.' : 'Just the usual Drenthe news. Nothing out of the ordinary.' }
                    ]);
                    game.sceneTimeout(() => {
                        game.loadScene('livingroom');
                    }, 2500);
                }, 800);
                return;
            }

            const step = sequence[currentStep];

            // Play sound FX
            try {
                switch (step.sound) {
                    case 'jingle':    self._playJingle(); break;
                    case 'breaking':  self._playBreakingStinger(); break;
                    case 'transition': self._playTransition(); break;
                    case 'tick':      self._playTick(); break;
                }
            } catch (e) { /* audio not critical */ }

            // TTS
            let speechDone = Promise.resolve();
            if (step.voice) {
                speechDone = new Promise(resolve => {
                    setTimeout(() => {
                        self._speak(step.voice.text, step.voice.speaker || 'Documentary')
                            .then(resolve)
                            .catch(resolve);
                    }, 500);
                });
            }

            // Minimum reading time
            const voiceText = step.voice ? step.voice.text : '';
            const wordCount = voiceText.split(/\s+/).filter(w => w).length;
            const minReadMs = Math.max(4000, wordCount * 375);
            const minReadTimer = new Promise(resolve => setTimeout(resolve, minReadMs));

            // Build screen
            const screen = document.createElement('div');
            screen.className = 'news-screen';
            screen.innerHTML = step.content;

            // Add TV overlays
            screen.innerHTML += `
                <div class="news-grain"></div>
                <div class="news-scanlines"></div>
                <div class="news-vignette"></div>
            `;

            // Brand watermark
            const brand = document.createElement('div');
            brand.className = 'news-brand';
            brand.textContent = 'RTV';
            screen.appendChild(brand);

            // Step counter
            const counter = document.createElement('div');
            counter.className = 'news-step-counter';
            counter.textContent = `${currentStep + 1} / ${sequence.length}`;
            screen.appendChild(counter);

            // Timeline bar
            const timeline = document.createElement('div');
            timeline.className = 'news-timeline';
            const fill = document.createElement('div');
            fill.className = 'news-timeline-fill';
            fill.style.width = `${((currentStep + 1) / sequence.length) * 100}%`;
            timeline.appendChild(fill);
            screen.appendChild(timeline);

            // News ticker
            const ticker = document.createElement('div');
            ticker.className = `news-ticker${isBreakingNews ? ' breaking' : ''}`;
            ticker.innerHTML = `
                <div class="news-ticker-label">${isBreakingNews ? 'BREAKING' : 'RTV'}</div>
                <div class="news-ticker-text">${tickerItems.join('  ●  ')}</div>
            `;
            screen.appendChild(ticker);

            // Continue button
            const continueBtn = document.createElement('div');
            continueBtn.className = 'news-continue';
            continueBtn.textContent = currentStep < sequence.length - 1 ? 'CONTINUE ▸' : 'FINISH ▸';
            continueBtn.onclick = () => {
                self._stopSpeech();
                screen.style.opacity = '0';
                setTimeout(() => {
                    screen.remove();
                    currentStep++;
                    showStep();
                }, 500);
            };
            screen.appendChild(continueBtn);

            overlay.appendChild(screen);

            // Trigger entrance
            setTimeout(() => {
                screen.classList.add('active');
            }, 50);

            // Auto-advance after speech + min reading time
            Promise.all([speechDone, minReadTimer]).then(() => {
                const pauseMs = (window.game && window.game.settings)
                    ? (window.game.settings.docuPauseDuration ?? 1500)
                    : 1500;
                setTimeout(() => {
                    if (screen.parentElement) {
                        continueBtn.click();
                    }
                }, pauseMs);
            });
        };

        showStep();
    },

    /* ═══════════════════════════════════════════════════════
     *  SCENE LIFECYCLE
     * ═══════════════════════════════════════════════════════ */
    onEnter(game) {
        if (game.player) game.player.hide();

        setTimeout(() => {
            TvnewsScene.showNewsOverlay(game);
        }, 500);
    },

    onExit(game) {
        TvnewsScene._cleanupNews();
        if (game.player) game.player.show();
    }
};

// Register the scene
if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(TvnewsScene);
}
