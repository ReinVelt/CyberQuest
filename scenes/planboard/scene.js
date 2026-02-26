/**
 * PLANBOARD SCENE
 * Detective-style investigation board showing all discovered clues and connections
 */

const PlanboardScene = {
  id: 'planboard',
  name: 'Investigation Board',
  background: 'assets/images/scenes/planboard.svg',
  backgroundColor: '#1a1a1a',
  hidePlayer: true,  // No player character on static board interface
  
  // Track which evidence slots are currently visible
  visibleSlots: [],
  
  // Dossier popup state
  activeDossier: null,
  
  onEnter: function(game) {
    console.log('Entering planboard scene');
    
    // Create evidence slot overlays
    this.createEvidenceOverlays();
    
    // Update board based on discovered clues
    this.updateBoard(game);
    
    // Show animation of board updating
    this.animateBoardEntrance();
  },
  
  onExit: function(game) {
    // Clean up any open dossiers
    if (PlanboardScene.activeDossier) {
      PlanboardScene.closeDossier();
    }
    
    // Clean up overlays
    const overlay = document.getElementById('planboard-overlays');
    if (overlay) {
      overlay.remove();
    }
  },
  
  /**
   * Create HTML overlays for evidence slots and connections
   */
  createEvidenceOverlays: function() {
    // Remove existing overlays if any
    let overlay = document.getElementById('planboard-overlays');
    if (overlay) {
      overlay.remove();
    }
    
    // Inject planboard CSS once
    if (!document.getElementById('planboard-tile-css')) {
      const css = document.createElement('style');
      css.id = 'planboard-tile-css';
      css.textContent = `
        .pb-tile {
          position: absolute; opacity: 0; transition: opacity 0.6s ease, transform 0.4s ease;
          display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;
          pointer-events: auto; cursor: pointer;
        }
        .pb-tile:hover { transform: scale(1.04); z-index: 2; }
        /* Polaroid style */
        .pb-polaroid {
          background: #f5f0e8; border-radius: 3px;
          box-shadow: 3px 5px 14px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.08);
          padding: 6% 6% 14% 6%;
        }
        .pb-polaroid .pb-photo {
          flex: 1; border-radius: 2px; overflow: hidden; position: relative;
          background: #111; display: flex; align-items: center; justify-content: center;
        }
        .pb-polaroid .pb-caption {
          position: absolute; bottom: 0; left: 0; right: 0;
          text-align: center; font-family: 'Segoe Print','Comic Sans MS',cursive;
          color: #333; font-size: clamp(7px,1.1vw,14px); padding: 4% 2% 2%;
        }
        /* Manila folder style */
        .pb-folder {
          background: linear-gradient(175deg, #d4b87a 0%, #c4a460 40%, #b89850 100%);
          border-radius: 2px 8px 4px 4px; border: 1px solid #a08040;
          box-shadow: 3px 5px 14px rgba(0,0,0,0.45);
          padding: 8% 6% 6%; position: relative;
        }
        .pb-folder::before {
          content:''; position: absolute; top: -6%; left: 15%; width: 40%; height: 8%;
          background: linear-gradient(175deg, #d4b87a, #c4a460);
          border-radius: 4px 4px 0 0; border: 1px solid #a08040; border-bottom: none;
        }
        .pb-folder .pb-label {
          font-family: 'Courier New', monospace; color: #3a2a10; font-weight: bold;
          font-size: clamp(7px,1.1vw,14px); text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 4%;
        }
        .pb-folder .pb-inner {
          flex: 1; background: #faf6ee; border-radius: 2px; padding: 6%; overflow: hidden;
          font-family: 'Courier New', monospace; font-size: clamp(5px,0.7vw,10px);
          color: #2a2a2a; line-height: 1.5; position: relative;
        }
        /* Document / typed page */
        .pb-document {
          background: #faf6ee; border-radius: 2px;
          box-shadow: 3px 5px 14px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.08);
          padding: 6%; position: relative;
        }
        .pb-document .pb-header {
          font-family: 'Courier New', monospace; font-weight: bold;
          font-size: clamp(6px,0.9vw,12px); color: #2a2a2a; text-align: center;
          border-bottom: 2px solid #2a2a2a; padding-bottom: 4%; margin-bottom: 4%;
        }
        .pb-document .pb-body {
          font-family: 'Courier New', monospace; font-size: clamp(5px,0.65vw,9px);
          color: #3a3a3a; line-height: 1.4;
        }
        /* Tape strips */
        .pb-tape {
          position: absolute; width: 40%; height: clamp(6px,1.2vh,14px);
          background: rgba(200,190,160,0.55); border: 1px solid rgba(160,140,100,0.3);
          z-index: 3;
        }
        .pb-tape-tl { top: -2%; left: 10%; transform: rotate(-8deg); }
        .pb-tape-tr { top: -2%; right: 10%; transform: rotate(6deg); }
        .pb-tape-center { top: -2%; left: 30%; transform: rotate(-2deg); }
        /* Pin */
        .pb-pin {
          position: absolute; top: -4%; left: 50%; transform: translateX(-50%);
          width: clamp(10px,1.6vw,20px); height: clamp(10px,1.6vw,20px); z-index: 4;
        }
        /* Classified stamp */
        .pb-stamp {
          position: absolute; font-family: Impact, 'Arial Black', sans-serif;
          color: rgba(180,30,30,0.55); font-size: clamp(8px,1.4vw,18px);
          text-transform: uppercase; letter-spacing: 3px;
          transform: rotate(-12deg); pointer-events: none; z-index: 3;
        }
        /* Coffee ring stain */
        .pb-coffee {
          position: absolute; width: clamp(24px,4vw,50px); height: clamp(24px,4vw,50px);
          border: 3px solid rgba(100,60,20,0.12); border-radius: 50%;
          pointer-events: none;
        }
      `;
      document.head.appendChild(css);
    }
    
    // Create container for overlays
    overlay = document.createElement('div');
    overlay.id = 'planboard-overlays';
    overlay.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 1;
    `;
    
    // Helper: create push-pin SVG
    const pinSvg = (color='#c41e3a') => `
      <svg class="pb-pin" viewBox="0 0 24 24">
        <circle cx="12" cy="10" r="8" fill="${color}" stroke="#8a1020" stroke-width="1"/>
        <circle cx="12" cy="10" r="5.5" fill="#ff4757"/>
        <ellipse cx="12" cy="9" rx="5" ry="3.5" fill="#ff6b7a" opacity="0.5"/>
        <circle cx="10" cy="8" r="1.8" fill="#fff" opacity="0.45"/>
        <line x1="12" y1="18" x2="12" y2="23" stroke="#888" stroke-width="1.5"/>
      </svg>`;
    
    // Define evidence slots with photo/dossier tile content
    const slots = [
      { 
        id: 'slot-sstv', x: 10.42, y: 22.22, w: 13.54, h: 25.93, rot: -2,
        html: this._tilePolaroid({
          photo: this._photoSSTVSignal(),
          caption: 'SSTV Signal — 14.230 MHz',
          date: '15 Mar 2024  23:47',
          pin: pinSvg(),
        })
      },
      { 
        id: 'slot-usb', x: 25.52, y: 22.22, w: 12.5, h: 25.93, rot: 1.5,
        html: this._tilePolaroid({
          photo: this._photoUSBStick(),
          caption: 'USB Stick — Ter Apel',
          date: 'SanDisk 64 GB',
          pin: pinSvg('#1e7abf'),
        })
      },
      { 
        id: 'slot-eva', x: 40.63, y: 22.22, w: 13.54, h: 25.93, rot: -1,
        html: this._tilePolaroid({
          photo: this._photoEvaSilhouette(),
          caption: '? EVA — Code: "E"',
          date: 'INSIDE SOURCE',
          pin: pinSvg('#d4a020'),
          stamp: 'CLASSIFIED',
        })
      },
      { 
        id: 'slot-facility', x: 56.77, y: 22.22, w: 13.54, h: 25.93, rot: 2,
        html: this._tilePolaroid({
          photo: this._photoFacility(),
          caption: 'Steckerdoser Heide',
          date: 'Sat. recon photo',
          pin: pinSvg(),
          stamp: 'GEHEIM',
        })
      },
      { 
        id: 'slot-weapon', x: 72.92, y: 22.22, w: 17.71, h: 31.48, rot: -1.5,
        html: this._tileFolder({
          label: 'DOSSIER: EM PULSE WEAPON',
          inner: this._folderWeaponSpecs(),
          pin: pinSvg('#8b0000'),
          stamp: 'TOP SECRET',
        })
      },
      { 
        id: 'slot-readme', x: 8.85, y: 59.26, w: 21.88, h: 26.85, rot: 1,
        html: this._tileDocument({
          header: 'README.txt — USB CONTENTS',
          body: this._docReadmeBody(),
          tape: true,
          coffee: { right: '5%', bottom: '10%' },
        })
      },
      { 
        id: 'slot-experts', x: 33.33, y: 59.26, w: 16.67, h: 26.85, rot: -1.5,
        html: this._tileFolder({
          label: 'EXPERT CONTACTS',
          inner: this._folderExperts(),
          pin: pinSvg('#2a8a4a'),
        })
      },
      { 
        id: 'slot-timeline', x: 52.6, y: 59.26, w: 19.79, h: 26.85, rot: 0.5,
        html: this._tileDocument({
          header: '⚠ 72-HOUR COUNTDOWN ⚠',
          body: this._docTimeline(),
          tape: true,
          stamp: 'URGENT',
        })
      }
    ];
    
    slots.forEach(slot => {
      const el = document.createElement('div');
      el.id = slot.id;
      el.className = 'pb-tile';
      el.style.cssText += `
        left: ${slot.x}%; top: ${slot.y}%; width: ${slot.w}%; height: ${slot.h}%;
        transform: rotate(${slot.rot || 0}deg);
      `;
      el.innerHTML = slot.html;
      overlay.appendChild(el);
    });
    
    // Connection lines canvas
    const connectionsCanvas = document.createElement('canvas');
    connectionsCanvas.id = 'planboard-connections';
    connectionsCanvas.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
    `;
    overlay.appendChild(connectionsCanvas);
    
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) {
      sceneContainer.appendChild(overlay);
      const rect = sceneContainer.getBoundingClientRect();
      connectionsCanvas.width = rect.width;
      connectionsCanvas.height = rect.height;
    }
  },

  /* ─── TILE BUILDERS ─── */

  _tilePolaroid({ photo, caption, date, pin, stamp }) {
    return `
      ${pin || ''}
      <div class="pb-polaroid" style="width:100%;height:100%;display:flex;flex-direction:column;position:relative;">
        <div class="pb-photo">${photo}</div>
        <div class="pb-caption">
          <div style="font-weight:bold;">${caption}</div>
          ${date ? `<div style="font-size:0.8em;color:#777;margin-top:2px;">${date}</div>` : ''}
        </div>
        ${stamp ? `<div class="pb-stamp" style="bottom:18%;right:5%;">${stamp}</div>` : ''}
      </div>`;
  },

  _tileFolder({ label, inner, pin, stamp }) {
    return `
      ${pin || ''}
      <div class="pb-folder" style="width:100%;height:100%;display:flex;flex-direction:column;">
        <div class="pb-label">${label}</div>
        <div class="pb-inner">${inner}</div>
        ${stamp ? `<div class="pb-stamp" style="top:20%;right:6%;">${stamp}</div>` : ''}
      </div>`;
  },

  _tileDocument({ header, body, tape, stamp, coffee }) {
    let extras = '';
    if (tape) extras += '<div class="pb-tape pb-tape-tl"></div><div class="pb-tape pb-tape-tr"></div>';
    if (stamp) extras += `<div class="pb-stamp" style="top:15%;right:4%;">${stamp}</div>`;
    if (coffee) extras += `<div class="pb-coffee" style="right:${coffee.right};bottom:${coffee.bottom};"></div>`;
    return `
      ${extras}
      <div class="pb-document" style="width:100%;height:100%;display:flex;flex-direction:column;">
        <div class="pb-header">${header}</div>
        <div class="pb-body" style="flex:1;overflow:hidden;">${body}</div>
      </div>`;
  },

  /* ─── PHOTO CONTENT GENERATORS ─── */

  _photoSSTVSignal() {
    // SSTV decoded surveillance photo — Ryan's farmhouse from across the canal
    return `
      <svg viewBox="0 0 200 140" style="width:100%;height:100%;background:#0a0a0a;">
        <defs>
          <linearGradient id="pb-crt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#001a00"/><stop offset="50%" stop-color="#002200"/><stop offset="100%" stop-color="#001000"/>
          </linearGradient>
        </defs>
        <rect width="200" height="140" fill="url(#pb-crt)"/>
        <!-- Scan lines -->
        <g opacity="0.08"><line x1="0" y1="10" x2="200" y2="10" stroke="#0f0" stroke-width="0.5"/>
        <line x1="0" y1="20" x2="200" y2="20" stroke="#0f0" stroke-width="0.5"/>
        <line x1="0" y1="30" x2="200" y2="30" stroke="#0f0" stroke-width="0.5"/>
        <line x1="0" y1="40" x2="200" y2="40" stroke="#0f0" stroke-width="0.5"/>
        <line x1="0" y1="50" x2="200" y2="50" stroke="#0f0" stroke-width="0.5"/>
        <line x1="0" y1="60" x2="200" y2="60" stroke="#0f0" stroke-width="0.5"/>
        <line x1="0" y1="70" x2="200" y2="70" stroke="#0f0" stroke-width="0.5"/>
        <line x1="0" y1="80" x2="200" y2="80" stroke="#0f0" stroke-width="0.5"/>
        <line x1="0" y1="90" x2="200" y2="90" stroke="#0f0" stroke-width="0.5"/>
        <line x1="0" y1="100" x2="200" y2="100" stroke="#0f0" stroke-width="0.5"/>
        <line x1="0" y1="110" x2="200" y2="110" stroke="#0f0" stroke-width="0.5"/>
        <line x1="0" y1="120" x2="200" y2="120" stroke="#0f0" stroke-width="0.5"/>
        <line x1="0" y1="130" x2="200" y2="130" stroke="#0f0" stroke-width="0.5"/></g>
        <!-- Farmhouse silhouette (green phosphor) -->
        <g opacity="0.7">
          <!-- Sky -->
          <rect x="5" y="18" width="190" height="40" fill="#002a00" opacity="0.3"/>
          <!-- Trees behind house -->
          <ellipse cx="25" cy="48" rx="18" ry="12" fill="#003a00"/>
          <ellipse cx="170" cy="46" rx="16" ry="14" fill="#003a00"/>
          <!-- House body -->
          <rect x="65" y="38" width="55" height="32" fill="#00aa00" opacity="0.3"/>
          <!-- Roof -->
          <polygon points="60,38 92,22 130,38" fill="#006600" opacity="0.5"/>
          <!-- Windows -->
          <rect x="72" y="42" width="8" height="8" fill="#00ff00" opacity="0.3"/>
          <rect x="100" y="42" width="8" height="8" fill="#00ff00" opacity="0.3"/>
          <!-- Door -->
          <rect x="88" y="54" width="8" height="16" fill="#004400" opacity="0.5"/>
          <!-- Ryan figure -->
          <circle cx="84" cy="62" r="2" fill="#00ff00" opacity="0.5"/>
          <rect x="82.5" y="64" width="3" height="5" fill="#00ff00" opacity="0.4"/>
          <!-- Canal -->
          <rect x="5" y="73" width="190" height="12" fill="#004444" opacity="0.4"/>
          <!-- Road -->
          <rect x="5" y="88" width="190" height="8" fill="#002200" opacity="0.3"/>
        </g>
        <!-- Header text -->
        <text x="100" y="14" font-family="monospace" font-size="8" fill="#00ff00" text-anchor="middle" opacity="0.8">
          SSTV DECODE — 14.230 MHz
        </text>
        <!-- Overlay data -->
        <text x="10" y="108" font-family="monospace" font-size="6" fill="#00ff00" opacity="0.6">
          52°27'N 6°36'E</text>
        <text x="10" y="118" font-family="monospace" font-size="6" fill="#00ff00" opacity="0.6">
          OP. ZERFALL — ACTIVE</text>
        <text x="10" y="128" font-family="monospace" font-size="6" fill="#00ff00" opacity="0.6">
          SURVEILLANCE — RYAN'S HOUSE</text>
        <!-- Glow dot -->
        <circle cx="185" cy="12" r="3" fill="#00ff00" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>`;
  },

  _photoUSBStick() {
    // Close-up photo of a USB stick on dark surface
    return `
      <svg viewBox="0 0 200 140" style="width:100%;height:100%;background:#1a1816;">
        <!-- Dark surface texture -->
        <rect width="200" height="140" fill="#1a1816"/>
        <rect x="0" y="0" width="200" height="140" fill="#222018" opacity="0.5"/>
        <!-- USB body -->
        <rect x="50" y="30" width="80" height="45" rx="4" fill="#1565c0" stroke="#0d47a1" stroke-width="2"/>
        <rect x="55" y="35" width="70" height="30" rx="2" fill="#1e88e5" opacity="0.6"/>
        <!-- USB connector -->
        <rect x="130" y="38" width="28" height="28" rx="2" fill="#c0c0c0" stroke="#999" stroke-width="1"/>
        <rect x="133" y="42" width="22" height="8" fill="#888"/>
        <rect x="133" y="54" width="22" height="8" fill="#888"/>
        <!-- SanDisk label -->
        <text x="90" y="56" font-family="Arial" font-size="8" fill="#fff" text-anchor="middle" font-weight="bold">SanDisk</text>
        <text x="90" y="66" font-family="Arial" font-size="6" fill="#ddd" text-anchor="middle">64GB USB 3.0</text>
        <!-- LED indicator -->
        <circle cx="62" cy="68" r="3" fill="#00ff00" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
        </circle>
        <!-- Duct tape piece -->
        <rect x="40" y="85" width="120" height="18" rx="1" fill="#8a8060" opacity="0.7" transform="rotate(-3,100,94)"/>
        <text x="100" y="97" font-family="'Segoe Print',cursive" font-size="7" fill="#3a2a10" text-anchor="middle" transform="rotate(-3,100,97)">
          AIR-GAPPED ONLY
        </text>
        <!-- Evidence marker -->
        <text x="15" y="130" font-family="monospace" font-size="6" fill="#ff6600" opacity="0.7">EVIDENCE #002</text>
      </svg>`;
  },

  _photoEvaSilhouette() {
    // Surveillance-style photo, blurry silhouette
    return `
      <svg viewBox="0 0 200 140" style="width:100%;height:100%;background:#1a1a22;">
        <defs>
          <radialGradient id="pb-surv" cx="50%" cy="45%">
            <stop offset="0%" stop-color="#2a2a3a"/><stop offset="100%" stop-color="#0a0a12"/>
          </radialGradient>
        </defs>
        <rect width="200" height="140" fill="url(#pb-surv)"/>
        <!-- Surveillance camera grain lines -->
        <g opacity="0.06">
          <rect x="0" y="5" width="200" height="1" fill="#fff"/>
          <rect x="0" y="15" width="200" height="1" fill="#fff"/>
          <rect x="0" y="25" width="200" height="1" fill="#fff"/>
          <rect x="0" y="35" width="200" height="1" fill="#fff"/>
          <rect x="0" y="45" width="200" height="1" fill="#fff"/>
          <rect x="0" y="55" width="200" height="1" fill="#fff"/>
          <rect x="0" y="65" width="200" height="1" fill="#fff"/>
          <rect x="0" y="75" width="200" height="1" fill="#fff"/>
          <rect x="0" y="85" width="200" height="1" fill="#fff"/>
          <rect x="0" y="95" width="200" height="1" fill="#fff"/>
          <rect x="0" y="105" width="200" height="1" fill="#fff"/>
          <rect x="0" y="115" width="200" height="1" fill="#fff"/>
          <rect x="0" y="125" width="200" height="1" fill="#fff"/>
        </g>
        <!-- Figure silhouette -->
        <circle cx="100" cy="48" r="22" fill="#333" opacity="0.9"/>
        <ellipse cx="100" cy="95" rx="28" ry="35" fill="#333" opacity="0.85"/>
        <!-- Question mark -->
        <text x="100" y="58" font-family="serif" font-size="28" fill="#888" text-anchor="middle" font-weight="bold">?</text>
        <!-- Surveillance HUD -->
        <text x="5" y="12" font-family="monospace" font-size="6" fill="#ff3333" opacity="0.7">● REC</text>
        <text x="155" y="12" font-family="monospace" font-size="5" fill="#ff3333" opacity="0.5">CAM-07</text>
        <text x="5" y="135" font-family="monospace" font-size="5" fill="#888" opacity="0.5">2024-03-14 21:33:12</text>
        <rect x="2" y="2" width="196" height="136" fill="none" stroke="#ff3333" stroke-width="1" opacity="0.15" rx="2"/>
      </svg>`;
  },

  _photoFacility() {
    // Aerial/satellite-style recon photo
    return `
      <svg viewBox="0 0 200 140" style="width:100%;height:100%;background:#1a2a1a;">
        <defs>
          <linearGradient id="pb-sat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2a3a25"/><stop offset="100%" stop-color="#1a2a18"/>
          </linearGradient>
        </defs>
        <rect width="200" height="140" fill="url(#pb-sat)"/>
        <!-- Terrain -->
        <rect x="10" y="20" width="180" height="110" fill="#3a4a2a" opacity="0.5"/>
        <!-- Tree patches -->
        <ellipse cx="30" cy="45" rx="18" ry="12" fill="#2a4a1a" opacity="0.6"/>
        <ellipse cx="165" cy="35" rx="22" ry="14" fill="#2a4a1a" opacity="0.6"/>
        <ellipse cx="40" cy="110" rx="25" ry="10" fill="#2a4a1a" opacity="0.6"/>
        <!-- Facility buildings -->
        <rect x="70" y="50" width="45" height="30" fill="#555" stroke="#888" stroke-width="1"/>
        <rect x="120" y="55" width="30" height="25" fill="#555" stroke="#888" stroke-width="1"/>
        <rect x="85" y="85" width="40" height="20" fill="#4a4a4a" stroke="#888" stroke-width="1"/>
        <!-- Antenna/tower -->
        <line x1="155" y1="48" x2="155" y2="30" stroke="#888" stroke-width="1.5"/>
        <circle cx="155" cy="28" r="3" fill="none" stroke="#ff3333" stroke-width="1"/>
        <!-- Road/path -->
        <path d="M 0 100 Q 40 95 70 90 Q 100 85 140 80 Q 170 78 200 80" fill="none" stroke="#666" stroke-width="3" opacity="0.5"/>
        <!-- Crosshair overlay -->
        <line x1="95" y1="0" x2="95" y2="140" stroke="#ff3333" stroke-width="0.5" opacity="0.3"/>
        <line x1="0" y1="65" x2="200" y2="65" stroke="#ff3333" stroke-width="0.5" opacity="0.3"/>
        <circle cx="95" cy="65" r="15" fill="none" stroke="#ff3333" stroke-width="0.5" opacity="0.4"/>
        <!-- HUD data -->
        <text x="5" y="12" font-family="monospace" font-size="5" fill="#ff6600" opacity="0.7">53°17'N  7°25'E</text>
        <text x="5" y="135" font-family="monospace" font-size="5" fill="#888">ALT: 820m · ZOOM: 14x</text>
        <text x="140" y="135" font-family="monospace" font-size="5" fill="#ff3333" opacity="0.7">RECON</text>
      </svg>`;
  },

  _folderWeaponSpecs() {
    // Technical schematic inside manila folder
    return `
      <div style="font-size:clamp(5px,0.65vw,9px);line-height:1.6;color:#2a2a2a;">
        <div style="text-align:center;font-weight:bold;font-size:1.1em;margin-bottom:4%;border-bottom:1px solid #8a7040;padding-bottom:3%;">
          EM PULSE WEAPON — SPECS
        </div>
        <div style="display:flex;gap:4%;">
          <svg viewBox="0 0 100 80" style="width:48%;flex-shrink:0;border:1px solid #ccc;background:#faf8f0;border-radius:2px;">
            <circle cx="50" cy="35" r="20" fill="none" stroke="#1a1a1a" stroke-width="1.5"/>
            <circle cx="50" cy="35" r="12" fill="none" stroke="#1a1a1a" stroke-width="1" stroke-dasharray="2,2"/>
            <line x1="50" y1="10" x2="50" y2="60" stroke="#1a1a1a" stroke-width="1"/>
            <line x1="25" y1="35" x2="75" y2="35" stroke="#1a1a1a" stroke-width="1"/>
            <rect x="42" y="3" width="16" height="8" fill="none" stroke="#1a1a1a" stroke-width="1"/>
            <text x="50" y="72" font-family="monospace" font-size="5" fill="#666" text-anchor="middle">Fig. 3a — Emitter</text>
          </svg>
          <div style="flex:1;">
            <b>Type:</b> EM Pulse<br>
            <b>Freq:</b> 14.230 MHz<br>
            <b>Power:</b> 1.21 GW<br>
            <b>Range:</b> 500 m<br>
            <span style="color:#cc0000;font-weight:bold;">STATUS: ACTIVE</span>
          </div>
        </div>
      </div>`;
  },

  _docReadmeBody() {
    return `
      <div style="font-family:'Courier New',monospace;font-size:clamp(5px,0.6vw,8px);line-height:1.5;color:#2a2a2a;">
        <div style="font-weight:bold;margin-bottom:3%;">PROJECT ECHO — CLASSIFIED</div>
        This USB contains everything you need<br>
        to know about the EM pulse weapon being<br>
        developed at Steckerdoser Heide.<br><br>
        <span style="color:#cc0000;font-weight:bold;">⚠ 72-HOUR COUNTDOWN INITIATED</span><br><br>
        The weapon will be activated in 72 hours.<br>
        Target: Major European data center.<br><br>
        <span style="background:#cc0000;color:#fff;padding:1px 3px;font-size:0.9em;">WARNING: AIR-GAPPED ONLY</span><br><br>
        Trust the process.<br><br>
        <span style="font-family:'Segoe Print',cursive;font-size:1.4em;color:#333;">— E</span>
      </div>`;
  },

  _folderExperts() {
    // Contact cards inside folder
    return `
      <div style="font-size:clamp(5px,0.6vw,9px);line-height:1.5;color:#2a2a2a;">
        <div style="display:flex;align-items:center;gap:4%;padding:3% 0;border-bottom:1px solid #d0c0a0;">
          <div style="width:1.8em;height:1.8em;border-radius:50%;background:#4a90e2;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:0.9em;flex-shrink:0;">DP</div>
          <div><b>Dr. David Prinsloo</b><br><span style="color:#666;">TU/e — RF Engineering</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:4%;padding:3% 0;border-bottom:1px solid #d0c0a0;">
          <div style="width:1.8em;height:1.8em;border-radius:50%;background:#e94b3c;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:0.9em;flex-shrink:0;">CB</div>
          <div><b>Cees Bassa</b><br><span style="color:#666;">ASTRON — Satellites</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:4%;padding:3% 0;">
          <div style="width:1.8em;height:1.8em;border-radius:50%;background:#50c878;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:0.9em;flex-shrink:0;">JH</div>
          <div><b>Prof. Jaap Haartsen</b><br><span style="color:#666;">Bluetooth inventor</span></div>
        </div>
      </div>`;
  },

  _docTimeline() {
    // Typed timeline with colour markers
    return `
      <div style="font-family:'Courier New',monospace;font-size:clamp(5px,0.6vw,8px);line-height:1.6;color:#2a2a2a;">
        <div style="display:flex;align-items:center;gap:4%;margin-bottom:4%;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22bb44;flex-shrink:0;"></span>
          <div><b style="color:#22bb44;">T-72h</b> Warning received<br><span style="color:#888;font-size:0.9em;">USB decoded &amp; analysed</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:4%;margin-bottom:4%;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff9800;flex-shrink:0;"></span>
          <div><b style="color:#ff9800;">T-48h</b> Investigation<br><span style="color:#888;font-size:0.9em;">Experts consulted, facility ID'd</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:4%;margin-bottom:4%;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff5722;flex-shrink:0;"></span>
          <div><b style="color:#ff5722;">T-24h</b> Infiltration<br><span style="color:#888;font-size:0.9em;">RFID cloned, gear prepped</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:4%;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff0000;flex-shrink:0;animation:pulse 1s infinite;"></span>
          <div><b style="color:#ff0000;">T-00h ACTIVATION</b><br><span style="color:#cc0000;font-weight:bold;">TARGET: EU DATA CENTER</span></div>
        </div>
      </div>`;
  },
  
  /**
   * Update board visibility based on discovered clues
   */
  updateBoard: function(game) {
    console.log('Updating board with flags:', {
      sstv_decoded: game.getFlag('sstv_decoded'),
      picked_up_usb: game.getFlag('picked_up_usb'),
      usb_analyzed: game.getFlag('usb_analyzed'),
      viewed_schematics: game.getFlag('viewed_schematics'),
      visited_videocall: game.getFlag('visited_videocall')
    });
    
    this.visibleSlots = [];
    
    // SLOT 1: SSTV Message (always visible after decode)
    if (game.getFlag('sstv_decoded')) {
      this.showSlot('slot-sstv');
      this.visibleSlots.push('sstv');
    }
    
    // SLOT 2: USB Stick (visible after pickup)
    if (game.getFlag('picked_up_usb')) {
      this.showSlot('slot-usb');
      this.visibleSlots.push('usb');
    }
    
    // SLOT 3: Eva Contact (visible after analyzing USB)
    if (game.getFlag('usb_analyzed')) {
      this.showSlot('slot-eva');
      this.visibleSlots.push('eva');
    }
    
    // SLOT 4: Facility Location (visible after SSTV or USB analysis)
    if (game.getFlag('sstv_decoded') || game.getFlag('usb_analyzed')) {
      this.showSlot('slot-facility');
      this.visibleSlots.push('facility');
    }
    
    // SLOT 5: Weapon Schematics (visible after viewing schematics)
    if (game.getFlag('viewed_schematics')) {
      this.showSlot('slot-weapon');
      this.visibleSlots.push('weapon');
    }
    
    // SLOT 6: README Evidence (visible after USB analysis)
    if (game.getFlag('usb_analyzed')) {
      this.showSlot('slot-readme');
      this.visibleSlots.push('readme');
    }
    
    // SLOT 7: Expert Contacts (visible after videocall)
    if (game.getFlag('visited_videocall')) {
      this.showSlot('slot-experts');
      this.visibleSlots.push('experts');
    }
    
    // SLOT 8: Timeline (visible after USB analysis)
    if (game.getFlag('usb_analyzed')) {
      this.showSlot('slot-timeline');
      this.visibleSlots.push('timeline');
    }
    
    // Update connection strings
    this.updateConnections();
  },
  
  /**
   * Show an evidence slot with animation
   */
  showSlot: function(slotId) {
    const slot = document.getElementById(slotId);
    if (slot) {
      slot.style.opacity = '1';
      console.log('Showing slot:', slotId);
    } else {
      console.warn('Slot element not found:', slotId);
    }
  },
  
  /**
   * Update connection strings between evidence
   */
  updateConnections: function() {
    const canvas = document.getElementById('planboard-connections');
    if (!canvas) {
      console.warn('Canvas not found for connections');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous connections
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Only draw if we have multiple clues
    if (this.visibleSlots.length < 2) return;
    
    // Slot center positions (in percentage)
    const slotPositions = {
      'sstv': { x: 17.19, y: 35.185 },      // center of slot-sstv
      'usb': { x: 31.77, y: 35.185 },       // center of slot-usb
      'eva': { x: 47.4, y: 35.185 },        // center of slot-eva
      'facility': { x: 63.54, y: 35.185 },  // center of slot-facility
      'weapon': { x: 81.775, y: 37.96 },    // center of slot-weapon
      'readme': { x: 19.79, y: 72.685 },    // center of slot-readme
      'experts': { x: 41.665, y: 72.685 },  // center of slot-experts
      'timeline': { x: 62.495, y: 72.685 }  // center of slot-timeline
    };
    
    // Connection definitions
    const connections = [
      ['sstv', 'usb'],
      ['usb', 'eva'],
      ['eva', 'facility'],
      ['facility', 'weapon'],
      ['eva', 'experts']
    ];
    
    // Draw connections
    ctx.strokeStyle = '#d32f2f';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#d32f2f';
    
    connections.forEach(([slot1, slot2]) => {
      if (this.visibleSlots.includes(slot1) && this.visibleSlots.includes(slot2)) {
        const pos1 = slotPositions[slot1];
        const pos2 = slotPositions[slot2];
        
        if (pos1 && pos2) {
          const x1 = (pos1.x / 100) * canvas.width;
          const y1 = (pos1.y / 100) * canvas.height;
          const x2 = (pos2.x / 100) * canvas.width;
          const y2 = (pos2.y / 100) * canvas.height;
          
          // Draw curved line
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const ctrlX = midX;
          const ctrlY = midY + (y2 - y1) * 0.2; // Curve downward
          ctx.quadraticCurveTo(ctrlX, ctrlY, x2, y2);
          ctx.stroke();
        }
      }
    });
  },
  
  /**
   * Animate board entrance
   */
  animateBoardEntrance: function() {
    // Fade in slots sequentially
    setTimeout(() => {
      const slots = document.querySelectorAll('.planboard-slot');
      slots.forEach((slot, index) => {
        if (slot.style.opacity === '1') {
          const originalOpacity = slot.style.opacity;
          slot.style.opacity = '0';
          setTimeout(() => {
            slot.style.opacity = originalOpacity;
          }, index * 200);
        }
      });
    }, 100);
  },
  
  /**
   * Show detailed dossier popup for a specific evidence
   */
  showDossier: function(evidenceType) {
    console.log('Opening dossier:', evidenceType);
    
    if (PlanboardScene.activeDossier) {
      PlanboardScene.closeDossier();
    }
    
    const dossierData = this.getDossierContent(evidenceType);
    if (!dossierData) return;
    
    // Inject dossier CSS once
    if (!document.getElementById('pb-dossier-css')) {
      const s = document.createElement('style');
      s.id = 'pb-dossier-css';
      s.textContent = `
        @keyframes pb-fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pb-fadeOut { from{opacity:1} to{opacity:0} }
        @keyframes pb-slideIn { from{opacity:0;transform:translateY(-20px) scale(0.96)} to{opacity:1;transform:none} }
        #pb-dossier-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,0.88);
          display:flex; align-items:center; justify-content:center; z-index:10000;
          animation:pb-fadeIn 0.3s ease;
        }
        #pb-dossier-box {
          background: linear-gradient(170deg, #faf6ee 0%, #f0e8d4 100%);
          border:none; border-radius:4px; padding:0; overflow:hidden;
          max-width:800px; width:90%; max-height:82vh;
          box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.12);
          animation:pb-slideIn 0.4s ease; display:flex; flex-direction:column;
        }
        .pb-dos-top {
          background:linear-gradient(90deg,#6b3a2a,#8b5a3a,#6b3a2a);
          padding:16px 24px; color:#f5e8d0; text-align:center;
        }
        .pb-dos-top h2 {
          margin:0; font-family:'Courier New',monospace; font-size:24px; letter-spacing:3px;
          text-transform:uppercase; color:#f5e8d0;
        }
        .pb-dos-top .pb-dos-sub {
          font-size:12px; color:#c4a57b; margin-top:4px; font-family:'Courier New',monospace;
        }
        .pb-dos-stamp {
          display:inline-block; border:3px solid rgba(180,30,30,0.7); color:rgba(180,30,30,0.7);
          padding:2px 12px; font-family:Impact,'Arial Black',sans-serif; font-size:14px;
          letter-spacing:3px; transform:rotate(-6deg); margin-top:8px; text-transform:uppercase;
        }
        .pb-dos-body {
          padding:24px; overflow-y:auto; flex:1; color:#2a2a2a;
          font-family:'Georgia',serif; font-size:15px; line-height:1.7;
        }
        .pb-dos-body strong { color:#5a3a10; }
        .pb-dos-detail {
          background:#faf8f0; border-left:4px solid #8b5a3a; padding:14px 18px; margin:16px 0;
          border-radius:0 4px 4px 0; font-size:14px;
        }
        .pb-dos-notes {
          border-top:2px dashed #c4a57b; padding-top:16px; margin-top:20px;
        }
        .pb-dos-notes h3 {
          font-family:'Courier New',monospace; color:#6b3a2a; font-size:16px; margin:0 0 8px;
        }
        .pb-dos-close {
          display:block; margin:20px auto 24px; background:#6b3a2a; color:#f5e8d0;
          border:none; padding:10px 36px; font-size:15px; font-weight:bold;
          border-radius:4px; cursor:pointer; font-family:'Courier New',monospace;
          letter-spacing:2px; transition:background 0.2s;
        }
        .pb-dos-close:hover { background:#8b5a3a; }
        #pb-dossier-box::-webkit-scrollbar { width:8px; }
        #pb-dossier-box::-webkit-scrollbar-track { background:#f0e8d4; }
        #pb-dossier-box::-webkit-scrollbar-thumb { background:#c4a57b; border-radius:4px; }
      `;
      document.head.appendChild(s);
    }

    const overlay = document.createElement('div');
    overlay.id = 'pb-dossier-overlay';

    const box = document.createElement('div');
    box.id = 'pb-dossier-box';
    box.innerHTML = `
      <div class="pb-dos-top">
        <h2>${dossierData.title}</h2>
        ${dossierData.subtitle ? `<div class="pb-dos-sub">${dossierData.subtitle}</div>` : ''}
        <div class="pb-dos-stamp">CLASSIFIED</div>
      </div>
      <div class="pb-dos-body">
        ${dossierData.content}
        ${dossierData.details ? `<div class="pb-dos-detail">${dossierData.details}</div>` : ''}
        ${dossierData.notes ? `<div class="pb-dos-notes"><h3>INVESTIGATOR NOTES</h3>${dossierData.notes}</div>` : ''}
        <button class="pb-dos-close">CLOSE DOSSIER</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    box.querySelector('.pb-dos-close').addEventListener('click', () => PlanboardScene.closeDossier());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) PlanboardScene.closeDossier(); });
    const esc = (e) => { if (e.key === 'Escape') { PlanboardScene.closeDossier(); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);

    PlanboardScene.activeDossier = evidenceType;
  },
  
  /**
   * Close the dossier popup
   */
  closeDossier: function() {
    const overlay = document.getElementById('pb-dossier-overlay');
    if (overlay) {
      overlay.style.animation = 'pb-fadeOut 0.3s ease';
      setTimeout(() => overlay.remove(), 300);
    }
    PlanboardScene.activeDossier = null;
  },
  
  /**
   * Get detailed content for each evidence type
   */
  getDossierContent: function(evidenceType) {
    const dossiers = {
      sstv: {
        title: 'SSTV Transmission — Surveillance Photo',
        subtitle: 'Decoded: 2026-02-04 — 22:17:33 UTC',
        content: `
          <p style="line-height: 1.8; font-size: 15px;">
            <strong style="color: #ff6b00;">Signal Type:</strong> Slow-Scan Television (SSTV)<br>
            <strong style="color: #ff6b00;">Frequency:</strong> 14.230 MHz (20m Amateur Band)<br>
            <strong style="color: #ff6b00;">Mode:</strong> Martin M2 (114s/frame)<br>
            <strong style="color: #ff6b00;">Content:</strong> Surveillance photograph — Ryan's farmhouse
          </p>
          <div style="background: #0a0a1a; padding: 15px; border-radius: 5px; font-family: monospace; color: #0f0; margin: 15px 0;">
            &gt; IMAGE: White farmhouse, red roof — from across canal<br>
            &gt; SUBJECT VISIBLE: Ryan, garden area<br>
            &gt; STEGO DATA: 52°27'N 6°36'E<br>
            &gt; OPERATION ZERFALL — NODE ACTIVE<br>
            &gt; TIMESTAMP: 2026-02-04 22:17:33
          </div>
        `,
        details: `
          <strong>ANALYSIS:</strong><br>
          Someone photographed Ryan's house from across the canal in Compascuum — likely from a parked
          car on the road. The image was transmitted via SSTV on 14.230 MHz using Martin M2 format.
          Steganographic data hidden in the pixel grey values contains GPS coordinates pointing to
          a location near Westerbork (WSRT) and a timestamp matching tonight.
        `,
        notes: `
          <p style="color: #ff6b00; font-weight: bold;">⚠ They know where Ryan lives — and they want him to know it</p>
          <p>The use of SSTV suggests a signals engineer. Someone technical, not just any whistleblower.
          Coordinates match a facility near the Westerbork Synthesis Radio Telescope array.</p>
        `
      },
      
      usb: {
        title: 'USB Stick Evidence',
        subtitle: 'Found: Ter Apel Monastery - March 16, 2024',
        content: `
          <p style="line-height: 1.8; font-size: 15px;">
            <strong style="color: #1e88e5;">Device:</strong> SanDisk 64GB USB 3.0<br>
            <strong style="color: #1e88e5;">Location:</strong> Duct-taped to Volvo door handle<br>
            <strong style="color: #1e88e5;">Condition:</strong> Weatherproof packaging<br>
            <strong style="color: #1e88e5;">Security:</strong> Air-gapped transfer only
          </p>
          <div style="background: #fafad2; color: #2a2a2a; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Attached Note:</strong><br>
            <em style="font-family: 'Brush Script MT', cursive; font-size: 18px;">
            "TRUST THE PROCESS<br>
            AIR-GAPPED ONLY"
            </em>
          </div>
        `,
        details: `
          <strong>FORENSIC NOTES:</strong><br>
          The USB was deliberately placed at a location Ryan would visit. The duct tape and note
          suggest someone familiar with operational security who wanted to ensure the data couldn't
          be intercepted during transfer.
        `,
        notes: `
          <p style="color: #ff0000; font-weight: bold;">⚠ Contents analyzed on air-gapped laptop only</p>
          <p>The deliberate choice of Ter Apel monastery suggests the source knew about Ryan's
          interest in historical radio sites and Klaus Weber's legacy.</p>
        `
      },
      
      eva: {
        title: 'Eva - Whistleblower',
        subtitle: 'Inside Source - Project Echo',
        content: `
          <p style="line-height: 1.8; font-size: 15px;">
            <strong style="color: #d32f2f;">Identity:</strong> Eva (Codename: "E")<br>
            <strong style="color: #d32f2f;">Role:</strong> Project Echo Insider<br>
            <strong style="color: #d32f2f;">Status:</strong> Active Whistleblower<br>
            <strong style="color: #d32f2f;">Risk Level:</strong> EXTREME
          </p>
          <div style="background: rgba(211, 47, 47, 0.2); border: 2px solid #d32f2f; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong style="color: #d32f2f;">CLASSIFIED PROFILE:</strong><br><br>
            Eva appears to be an insider with direct access to Project Echo. Her communications
            suggest she has knowledge of the facility layout, security protocols, and weapon
            specifications. She is risking her life to expose the project.
          </div>
        `,
        details: `
          <strong>COMMUNICATION METHODS:</strong><br>
          • USB dead drop (Ter Apel monastery)<br>
          • Encrypted messages via README.txt<br>
          • Signature: "- E"<br>
          • Emphasizes air-gapped security
        `,
        notes: `
          <p style="color: #ff0000; font-weight: bold;">⚠ Eva's safety is compromised</p>
          <p>The 72-hour warning suggests Eva knew about an imminent activation date. Her access
          level and timing indicate she may be a scientist, engineer, or security personnel working
          directly on Project Echo.</p>
        `
      },
      
      facility: {
        title: 'Steckerdoser Heide Facility',
        subtitle: 'Project Echo Location - Northern Germany',
        content: `
          <p style="line-height: 1.8; font-size: 15px;">
            <strong style="color: #ff6b00;">Location:</strong> Steckerdoser Heide, Germany<br>
            <strong style="color: #ff6b00;">Type:</strong> Classified Research Facility<br>
            <strong style="color: #ff6b00;">Project:</strong> Project Echo - EM Weapon Development<br>
            <strong style="color: #ff6b00;">Security Level:</strong> Maximum (RFID access required)
          </p>
          <div style="background: #0a1a0a; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="color: #0f0; font-family: monospace;">
              FACILITY SPECS:<br>
              ├─ Main Building: Research & Development<br>
              ├─ Server Room: Data Center (Restricted)<br>
              ├─ Test Range: Outdoor EM testing area<br>
              └─ Security: RFID badges, surveillance, armed personnel
            </p>
          </div>
        `,
        details: `
          <strong>INTELLIGENCE GATHERED:</strong><br>
          The facility is located in a remote area of northern Germany, providing isolation for
          classified weapons testing. The site appears to be privately funded but may have
          government connections.
        `,
        notes: `
          <p style="color: #ff6b00; font-weight: bold;">⚠ High-security target</p>
          <p>Physical infiltration requires: RFID badge cloning, night vision equipment,
          WiFi Pineapple for network access, and careful timing to avoid patrols.</p>
        `
      },
      
      weapon: {
        title: 'EM Pulse Weapon Specifications',
        subtitle: 'Project Echo - Electromagnetic Pulse Device',
        content: `
          <p style="line-height: 1.8; font-size: 15px;">
            <strong style="color: #0ff;">Weapon Type:</strong> Electromagnetic Pulse Generator<br>
            <strong style="color: #0ff;">Frequency:</strong> 14.230 MHz (Tuned)<br>
            <strong style="color: #0ff;">Power Output:</strong> 1.21 Gigawatts<br>
            <strong style="color: #0ff;">Effective Range:</strong> 500 meters<br>
            <strong style="color: #0ff;">Status:</strong> <span style="color: #ff0000;">ACTIVE</span>
          </p>
          <div style="background: #0a0a1a; padding: 15px; border-radius: 5px; font-family: monospace; color: #0ff; margin: 15px 0;">
            [WEAPON SCHEMATIC - CLASSIFIED]<br><br>
            ┌──────────────────────┐<br>
            │  PULSE GENERATOR     │<br>
            │  ════════════════    │<br>
            │  FREQ: 14.230 MHz    │<br>
            │  POWER: 1.21 GW      │<br>
            │  RANGE: 500m         │<br>
            │  ════════════════    │<br>
            │  ⚠ DANGEROUS ⚠       │<br>
            └──────────────────────┘
          </div>
        `,
        details: `
          <strong>THREAT ASSESSMENT:</strong><br>
          This device is capable of disabling all electronic equipment within a 500-meter radius.
          Potential targets include power grids, data centers, communication networks, and even
          vehicles with electronic systems. The weapon could cause catastrophic infrastructure damage.
        `,
        notes: `
          <p style="color: #ff0000; font-weight: bold;">⚠ IMMEDIATE THREAT</p>
          <p>The weapon is operational and scheduled for activation within 72 hours of the warning.
          Primary concern: What is the intended target? Who authorized this project?</p>
        `
      },
      
      readme: {
        title: 'README.txt - Eva\'s Warning',
        subtitle: 'USB Contents - Air-Gapped Transfer',
        content: `
          <div style="background: #fafad2; color: #2a2a2a; padding: 20px; border-radius: 5px; margin: 15px 0; font-family: monospace;">
            <strong style="font-size: 16px;">README.txt</strong><br>
            <hr style="border: 1px solid #2a2a2a; margin: 10px 0;">
            <br>
            PROJECT ECHO - CLASSIFIED<br>
            <br>
            This USB contains everything you need to know about<br>
            the EM pulse weapon being developed at Steckerdoser Heide.<br>
            <br>
            <span style="color: #d32f2f; font-weight: bold;">⚠ 72-HOUR COUNTDOWN INITIATED ⚠</span><br>
            <br>
            The weapon will be activated in 72 hours.<br>
            The target is a major European data center.<br>
            <br>
            <span style="background: #ff0000; color: #fff; padding: 2px 5px;">WARNING: AIR-GAPPED ONLY</span><br>
            <br>
            Do not connect this drive to any networked computer.<br>
            They are watching. They have network monitoring everywhere.<br>
            <br>
            If you're reading this, you're the only one who can<br>
            stop what's coming. I've tried everything from inside.<br>
            Now it's up to you.<br>
            <br>
            Included files:<br>
            - weapon_schematic.pdf<br>
            - facility_layout.dwg<br>
            - access_codes.txt (time-sensitive)<br>
            - project_echo_origins.txt<br>
            <br>
            Trust the process.<br>
            <br>
            <span style="font-family: 'Brush Script MT', cursive; font-size: 20px;">- E</span>
          </div>
        `,
        notes: `
          <p style="color: #d32f2f; font-weight: bold;">This is Eva's primary communication</p>
          <p>The emphasis on air-gapped security and the 72-hour deadline make this the most
          critical piece of evidence. Everything else confirms what's in this message.</p>
        `
      },
      
      experts: {
        title: 'Expert Contacts',
        subtitle: 'Technical Consultants - RF & Security',
        content: `
          <div style="margin-bottom: 25px;">
            <div style="background: linear-gradient(90deg, #4a90e2, #357abd); padding: 15px; border-radius: 5px; margin-bottom: 15px;">
              <strong style="font-size: 18px; color: #fff;">Dr. David Prinsloo</strong><br>
              <span style="color: #cce5ff;">TU Eindhoven - RF Engineering Professor</span><br><br>
              <strong style="color: #fff;">Expertise:</strong> Radio frequency systems, electromagnetic propagation<br>
              <strong style="color: #fff;">Consultation:</strong> Confirmed 14.230 MHz frequency capabilities
            </div>
            
            <div style="background: linear-gradient(90deg, #e94b3c, #c23728); padding: 15px; border-radius: 5px; margin-bottom: 15px;">
              <strong style="font-size: 18px; color: #fff;">Cees Bassa</strong><br>
              <span style="color: #ffcccc;">ASTRON - Satellite Tracking Expert</span><br><br>
              <strong style="color: #fff;">Expertise:</strong> Satellite systems, signal analysis, tracking<br>
              <strong style="color: #fff;">Consultation:</strong> Analyzed SSTV transmission patterns
            </div>
            
            <div style="background: linear-gradient(90deg, #50c878, #3da35d); padding: 15px; border-radius: 5px;">
              <strong style="font-size: 18px; color: #fff;">Prof. Jaap Haartsen</strong><br>
              <span style="color: #ccffdd;">Inventor of Bluetooth</span><br><br>
              <strong style="color: #fff;">Expertise:</strong> Wireless protocols, security, encryption<br>
              <strong style="color: #fff;">Consultation:</strong> Advised on facility network infiltration
            </div>
          </div>
        `,
        notes: `
          <p style="color: #4a90e2;">These consultations were critical for understanding the threat</p>
          <p>Each expert provided specific technical insights that confirmed Eva's warnings and
          helped plan the facility infiltration.</p>
        `
      },
      
      timeline: {
        title: '72-Hour Timeline',
        subtitle: 'Project Echo Activation Countdown',
        content: `
          <div style="border-left: 4px solid #0f0; padding-left: 20px; margin: 20px 0;">
            <div style="margin-bottom: 20px;">
              <strong style="color: #0f0; font-size: 18px;">T-72 HOURS</strong><br>
              <span style="color: #888;">March 16, 2024 - 00:00</span><br>
              USB warning received. README.txt reveals 72-hour countdown to weapon activation.
            </div>
          </div>
          
          <div style="border-left: 4px solid #ff9800; padding-left: 20px; margin: 20px 0;">
            <div style="margin-bottom: 20px;">
              <strong style="color: #ff9800; font-size: 18px;">T-48 HOURS</strong><br>
              <span style="color: #888;">March 16, 2024 - 12:00 (estimated)</span><br>
              Investigation initiated. SSTV decoded, USB analyzed, experts consulted.
              Facility location confirmed: Steckerdoser Heide.
            </div>
          </div>
          
          <div style="border-left: 4px solid #ff5722; padding-left: 20px; margin: 20px 0;">
            <div style="margin-bottom: 20px;">
              <strong style="color: #ff5722; font-size: 18px;">T-24 HOURS</strong><br>
              <span style="color: #888;">March 17, 2024 - 00:00 (estimated)</span><br>
              Facility infiltration planned. RFID badge cloned, equipment prepared.
              Night vision and WiFi Pineapple acquired for covert entry.
            </div>
          </div>
          
          <div style="border-left: 4px solid #ff0000; padding-left: 20px; margin: 20px 0; animation: pulse 2s infinite;">
            <div style="margin-bottom: 20px;">
              <strong style="color: #ff0000; font-size: 18px;">⚠ T-00 HOURS ⚠</strong><br>
              <span style="color: #888;">March 19, 2024 - 00:00</span><br>
              <strong style="color: #ff0000;">WEAPON ACTIVATION IMMINENT</strong><br>
              Target: Major European data center (location unknown)<br>
              <span style="color: #ff0000; font-weight: bold;">Time remaining: CRITICAL</span>
            </div>
          </div>
        `,
        notes: `
          <p style="color: #ff0000; font-weight: bold;">⚠ THE CLOCK IS TICKING</p>
          <p>Every hour counts. The weapon must be stopped before activation or the consequences
          could be catastrophic: Infrastructure collapse, data loss, economic chaos.</p>
        `
      }
    };
    
    return dossiers[evidenceType] || null;
  },
  
  hotspots: [
    // Back button
    {
      id: 'back-button',
      x: 2.6,
      y: 2.78,
      width: 6.25,
      height: 4.63,
      cursor: 'pointer',
      skipWalk: true,
      action: function(game) {
        game.loadScene('mancave');
      }
    },
    
    // Evidence slots - only clickable when visible
    {
      id: 'hotspot-sstv',
      x: 10.42,
      y: 22.22,
      width: 13.54,
      height: 25.93,
      cursor: 'pointer',
      skipWalk: true,
      action: function(game) {
        if (game.getFlag('sstv_decoded')) {
          PlanboardScene.showDossier('sstv');
        }
      }
    },
    
    {
      id: 'hotspot-usb',
      x: 25.52,
      y: 22.22,
      width: 12.5,
      height: 25.93,
      cursor: 'pointer',
      skipWalk: true,
      action: function(game) {
        if (game.getFlag('picked_up_usb')) {
          PlanboardScene.showDossier('usb');
        }
      }
    },
    
    {
      id: 'hotspot-eva',
      x: 40.63,
      y: 22.22,
      width: 13.54,
      height: 25.93,
      cursor: 'pointer',
      skipWalk: true,
      action: function(game) {
        if (game.getFlag('usb_analyzed')) {
          PlanboardScene.showDossier('eva');
        }
      }
    },
    
    {
      id: 'hotspot-facility',
      x: 56.77,
      y: 22.22,
      width: 13.54,
      height: 25.93,
      cursor: 'pointer',
      skipWalk: true,
      action: function(game) {
        if (game.getFlag('sstv_decoded') || game.getFlag('usb_analyzed')) {
          PlanboardScene.showDossier('facility');
        }
      }
    },
    
    {
      id: 'hotspot-weapon',
      x: 72.92,
      y: 22.22,
      width: 17.71,
      height: 31.48,
      cursor: 'pointer',
      skipWalk: true,
      action: function(game) {
        if (game.getFlag('viewed_schematics')) {
          PlanboardScene.showDossier('weapon');
        }
      }
    },
    
    {
      id: 'hotspot-readme',
      x: 8.85,
      y: 59.26,
      width: 21.88,
      height: 26.85,
      cursor: 'pointer',
      skipWalk: true,
      action: function(game) {
        if (game.getFlag('usb_analyzed')) {
          PlanboardScene.showDossier('readme');
        }
      }
    },
    
    {
      id: 'hotspot-experts',
      x: 33.33,
      y: 59.26,
      width: 16.67,
      height: 26.85,
      cursor: 'pointer',
      skipWalk: true,
      action: function(game) {
        if (game.getFlag('visited_videocall')) {
          PlanboardScene.showDossier('experts');
        }
      }
    },
    
    {
      id: 'hotspot-timeline',
      x: 52.6,
      y: 59.26,
      width: 19.79,
      height: 26.85,
      cursor: 'pointer',
      skipWalk: true,
      action: function(game) {
        if (game.getFlag('usb_analyzed')) {
          PlanboardScene.showDossier('timeline');
        }
      }
    }
  ]
};

// Scene will be registered in index.html initGame() function
