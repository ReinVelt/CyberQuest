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
    
    // Create container for overlays
    overlay = document.createElement('div');
    overlay.id = 'planboard-overlays';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    
    // Define evidence slots with their positions and SVG content
    const slots = [
      { 
        id: 'slot-sstv', 
        x: 10.42, 
        y: 22.22, 
        width: 13.54, 
        height: 25.93, 
        color: '#00ff00',
        svg: this.createSSTVIcon()
      },
      { 
        id: 'slot-usb', 
        x: 25.52, 
        y: 22.22, 
        width: 12.5, 
        height: 25.93, 
        color: '#00ccff',
        svg: this.createUSBIcon()
      },
      { 
        id: 'slot-eva', 
        x: 40.63, 
        y: 22.22, 
        width: 13.54, 
        height: 25.93, 
        color: '#ff9900',
        svg: this.createContactIcon()
      },
      { 
        id: 'slot-facility', 
        x: 56.77, 
        y: 22.22, 
        width: 13.54, 
        height: 25.93, 
        color: '#ff3366',
        svg: this.createFacilityIcon()
      },
      { 
        id: 'slot-weapon', 
        x: 72.92, 
        y: 22.22, 
        width: 17.71, 
        height: 31.48, 
        color: '#cc00cc',
        svg: this.createWeaponIcon()
      },
      { 
        id: 'slot-readme', 
        x: 8.85, 
        y: 59.26, 
        width: 21.88, 
        height: 26.85, 
        color: '#ffcc00',
        svg: this.createDocumentIcon()
      },
      { 
        id: 'slot-experts', 
        x: 33.33, 
        y: 59.26, 
        width: 16.67, 
        height: 26.85, 
        color: '#00ff99',
        svg: this.createExpertsIcon()
      },
      { 
        id: 'slot-timeline', 
        x: 52.6, 
        y: 59.26, 
        width: 19.79, 
        height: 26.85, 
        color: '#ff6699',
        svg: this.createTimelineIcon()
      }
    ];
    
    // Create visual indicators for each slot
    slots.forEach(slot => {
      const element = document.createElement('div');
      element.id = slot.id;
      element.className = 'planboard-slot';
      element.style.cssText = `
        position: absolute;
        left: ${slot.x}%;
        top: ${slot.y}%;
        width: ${slot.width}%;
        height: ${slot.height}%;
        opacity: 0;
        transition: opacity 0.5s ease;
        border: 3px solid ${slot.color};
        border-radius: 5px;
        box-shadow: 0 0 20px ${slot.color}80;
        background: linear-gradient(135deg, ${slot.color}10, #00000080);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5%;
        box-sizing: border-box;
      `;
      element.innerHTML = slot.svg;
      overlay.appendChild(element);
    });
    
    // Add connection lines container
    const connectionsCanvas = document.createElement('canvas');
    connectionsCanvas.id = 'planboard-connections';
    connectionsCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    overlay.appendChild(connectionsCanvas);
    
    // Add overlay to scene
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) {
      sceneContainer.appendChild(overlay);
      
      // Set canvas size
      const rect = sceneContainer.getBoundingClientRect();
      connectionsCanvas.width = rect.width;
      connectionsCanvas.height = rect.height;
    }
  },
  
  // SVG Icon generators
  createSSTVIcon: function() {
    return `
      <svg viewBox="0 0 100 100" style="width: 80%; height: 60%;">
        <circle cx="50" cy="50" r="8" fill="#00ff00" opacity="0.8">
          <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
        </circle>
        <path d="M 30 50 Q 40 30, 50 50 T 70 50" stroke="#00ff00" stroke-width="2" fill="none"/>
        <path d="M 25 50 Q 35 25, 50 50 T 75 50" stroke="#00ff00" stroke-width="1.5" fill="none" opacity="0.6"/>
        <path d="M 20 50 Q 30 20, 50 50 T 80 50" stroke="#00ff00" stroke-width="1" fill="none" opacity="0.4"/>
        <text x="50" y="90" font-family="monospace" font-size="10" fill="#00ff00" text-anchor="middle">SSTV</text>
      </svg>
    `;
  },
  
  createUSBIcon: function() {
    return `
      <svg viewBox="0 0 100 100" style="width: 80%; height: 60%;">
        <rect x="30" y="20" width="40" height="50" rx="3" fill="#00ccff" opacity="0.3" stroke="#00ccff" stroke-width="2"/>
        <rect x="35" y="25" width="30" height="35" fill="#00ccff" opacity="0.5"/>
        <rect x="40" y="65" width="20" height="10" fill="#00ccff"/>
        <line x1="45" y1="35" x2="55" y2="35" stroke="#ffffff" stroke-width="2"/>
        <line x1="45" y1="45" x2="55" y2="45" stroke="#ffffff" stroke-width="2"/>
        <text x="50" y="92" font-family="monospace" font-size="10" fill="#00ccff" text-anchor="middle">USB</text>
      </svg>
    `;
  },
  
  createContactIcon: function() {
    return `
      <svg viewBox="0 0 100 100" style="width: 80%; height: 60%;">
        <circle cx="50" cy="35" r="12" fill="#ff9900" opacity="0.6" stroke="#ff9900" stroke-width="2"/>
        <path d="M 30 55 Q 50 45, 70 55 L 70 75 Q 50 70, 30 75 Z" fill="#ff9900" opacity="0.6" stroke="#ff9900" stroke-width="2"/>
        <circle cx="35" cy="65" r="2" fill="#ffffff"/>
        <circle cx="65" cy="65" r="2" fill="#ffffff"/>
        <text x="50" y="92" font-family="monospace" font-size="9" fill="#ff9900" text-anchor="middle">EVA</text>
      </svg>
    `;
  },
  
  createFacilityIcon: function() {
    return `
      <svg viewBox="0 0 100 100" style="width: 80%; height: 60%;">
        <rect x="25" y="40" width="50" height="35" fill="#ff3366" opacity="0.3" stroke="#ff3366" stroke-width="2"/>
        <rect x="35" y="50" width="8" height="8" fill="#ff3366" opacity="0.6"/>
        <rect x="47" y="50" width="8" height="8" fill="#ff3366" opacity="0.6"/>
        <rect x="59" y="50" width="8" height="8" fill="#ff3366" opacity="0.6"/>
        <rect x="35" y="62" width="8" height="8" fill="#ff3366" opacity="0.6"/>
        <rect x="47" y="62" width="8" height="8" fill="#ff3366" opacity="0.6"/>
        <rect x="59" y="62" width="8" height="8" fill="#ff3366" opacity="0.6"/>
        <polygon points="25,40 50,25 75,40" fill="#ff3366" opacity="0.5" stroke="#ff3366" stroke-width="2"/>
        <text x="50" y="92" font-family="monospace" font-size="8" fill="#ff3366" text-anchor="middle">FACILITY</text>
      </svg>
    `;
  },
  
  createWeaponIcon: function() {
    return `
      <svg viewBox="0 0 100 100" style="width: 80%; height: 60%;">
        <circle cx="50" cy="45" r="15" fill="none" stroke="#cc00cc" stroke-width="2" opacity="0.6"/>
        <circle cx="50" cy="45" r="10" fill="none" stroke="#cc00cc" stroke-width="2" opacity="0.8"/>
        <line x1="50" y1="20" x2="50" y2="70" stroke="#cc00cc" stroke-width="3"/>
        <line x1="20" y1="45" x2="80" y2="45" stroke="#cc00cc" stroke-width="3"/>
        <path d="M 50 45 L 60 35 M 50 45 L 60 55 M 50 45 L 40 35 M 50 45 L 40 55" stroke="#cc00cc" stroke-width="2" opacity="0.6"/>
        <circle cx="50" cy="45" r="3" fill="#cc00cc">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <text x="50" y="92" font-family="monospace" font-size="8" fill="#cc00cc" text-anchor="middle">EMP</text>
      </svg>
    `;
  },
  
  createDocumentIcon: function() {
    return `
      <svg viewBox="0 0 100 100" style="width: 80%; height: 60%;">
        <rect x="25" y="20" width="50" height="60" rx="3" fill="#ffcc00" opacity="0.2" stroke="#ffcc00" stroke-width="2"/>
        <line x1="32" y1="32" x2="68" y2="32" stroke="#ffcc00" stroke-width="2" opacity="0.8"/>
        <line x1="32" y1="42" x2="68" y2="42" stroke="#ffcc00" stroke-width="1.5" opacity="0.6"/>
        <line x1="32" y1="50" x2="68" y2="50" stroke="#ffcc00" stroke-width="1.5" opacity="0.6"/>
        <line x1="32" y1="58" x2="55" y2="58" stroke="#ffcc00" stroke-width="1.5" opacity="0.6"/>
        <text x="50" y="92" font-family="monospace" font-size="8" fill="#ffcc00" text-anchor="middle">README</text>
      </svg>
    `;
  },
  
  createExpertsIcon: function() {
    return `
      <svg viewBox="0 0 100 100" style="width: 80%; height: 60%;">
        <circle cx="35" cy="35" r="8" fill="#00ff99" opacity="0.6"/>
        <path d="M 22 50 Q 35 45, 48 50 L 48 65 Q 35 62, 22 65 Z" fill="#00ff99" opacity="0.6"/>
        <circle cx="65" cy="35" r="8" fill="#00ff99" opacity="0.6"/>
        <path d="M 52 50 Q 65 45, 78 50 L 78 65 Q 65 62, 52 65 Z" fill="#00ff99" opacity="0.6"/>
        <circle cx="50" cy="45" r="9" fill="#00ff99" opacity="0.8" stroke="#00ff99" stroke-width="2"/>
        <path d="M 35 60 Q 50 55, 65 60 L 65 75 Q 50 72, 35 75 Z" fill="#00ff99" opacity="0.8" stroke="#00ff99" stroke-width="2"/>
        <text x="50" y="92" font-family="monospace" font-size="7" fill="#00ff99" text-anchor="middle">EXPERTS</text>
      </svg>
    `;
  },
  
  createTimelineIcon: function() {
    return `
      <svg viewBox="0 0 100 100" style="width: 80%; height: 60%;">
        <line x1="20" y1="50" x2="80" y2="50" stroke="#ff6699" stroke-width="3"/>
        <circle cx="25" cy="50" r="5" fill="#ff6699"/>
        <line x1="25" y1="50" x2="25" y2="35" stroke="#ff6699" stroke-width="2"/>
        <circle cx="45" cy="50" r="5" fill="#ff6699"/>
        <line x1="45" y1="50" x2="45" y2="65" stroke="#ff6699" stroke-width="2"/>
        <circle cx="65" cy="50" r="5" fill="#ff6699"/>
        <line x1="65" y1="50" x2="65" y2="35" stroke="#ff6699" stroke-width="2"/>
        <circle cx="75" cy="50" r="5" fill="#ff6699"/>
        <line x1="75" y1="50" x2="75" y2="65" stroke="#ff6699" stroke-width="2"/>
        <text x="50" y="92" font-family="monospace" font-size="7" fill="#ff6699" text-anchor="middle">TIMELINE</text>
      </svg>
    `;
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
    
    // Close any existing dossier
    if (PlanboardScene.activeDossier) {
      PlanboardScene.closeDossier();
    }
    
    // Get dossier content
    const dossierData = this.getDossierContent(evidenceType);
    if (!dossierData) return;
    
    // Create dossier overlay
    const overlay = document.createElement('div');
    overlay.id = 'dossier-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    `;
    
    // Create dossier container
    const container = document.createElement('div');
    container.id = 'dossier-container';
    container.style.cssText = `
      background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
      border: 3px solid #c4a57b;
      border-radius: 10px;
      padding: 30px;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 0 50px rgba(196, 165, 123, 0.5);
      animation: slideIn 0.4s ease;
      color: #f5f5f5;
      font-family: Arial, sans-serif;
    `;
    
    // Build dossier HTML
    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #c4a57b; font-size: 32px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
          ${dossierData.title}
        </h2>
        <div style="height: 2px; background: linear-gradient(90deg, transparent, #c4a57b, transparent); margin: 10px 0;"></div>
        ${dossierData.subtitle ? `<p style="color: #888; font-size: 14px; margin: 5px 0;">${dossierData.subtitle}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 25px;">
        ${dossierData.content}
      </div>
      
      ${dossierData.details ? `
        <div style="background: rgba(196, 165, 123, 0.1); border-left: 4px solid #c4a57b; padding: 15px; margin: 20px 0;">
          ${dossierData.details}
        </div>
      ` : ''}
      
      ${dossierData.notes ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #444;">
          <h3 style="color: #c4a57b; font-size: 18px; margin-bottom: 10px;">NOTES:</h3>
          ${dossierData.notes}
        </div>
      ` : ''}
      
      <div style="text-align: center; margin-top: 30px;">
        <button id="close-dossier-btn" style="
          background: #c4a57b;
          color: #1a1a1a;
          border: none;
          padding: 12px 40px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s;
        ">CLOSE</button>
      </div>
    `;
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      #close-dossier-btn:hover {
        background: #d4b58b !important;
        transform: scale(1.05);
      }
      #dossier-container::-webkit-scrollbar {
        width: 10px;
      }
      #dossier-container::-webkit-scrollbar-track {
        background: #1a1a1a;
      }
      #dossier-container::-webkit-scrollbar-thumb {
        background: #c4a57b;
        border-radius: 5px;
      }
    `;
    document.head.appendChild(style);
    
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // Add close button handler
    document.getElementById('close-dossier-btn').addEventListener('click', () => {
      PlanboardScene.closeDossier();
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        PlanboardScene.closeDossier();
      }
    });
    
    // Close on ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        PlanboardScene.closeDossier();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
    
    PlanboardScene.activeDossier = evidenceType;
  },
  
  /**
   * Close the dossier popup
   */
  closeDossier: function() {
    const overlay = document.getElementById('dossier-overlay');
    if (overlay) {
      overlay.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        overlay.remove();
      }, 300);
    }
    PlanboardScene.activeDossier = null;
  },
  
  /**
   * Get detailed content for each evidence type
   */
  getDossierContent: function(evidenceType) {
    const dossiers = {
      sstv: {
        title: 'SSTV Transmission',
        subtitle: 'Decoded: March 15, 2024 - 23:47:22 UTC',
        content: `
          <p style="line-height: 1.8; font-size: 15px;">
            <strong style="color: #ff6b00;">Signal Type:</strong> Slow-Scan Television (SSTV)<br>
            <strong style="color: #ff6b00;">Frequency:</strong> 14.230 MHz (20m Amateur Band)<br>
            <strong style="color: #ff6b00;">Mode:</strong> Martin M1<br>
            <strong style="color: #ff6b00;">Origin:</strong> Steckerdoser Heide region, Germany
          </p>
          <div style="background: #0a0a1a; padding: 15px; border-radius: 5px; font-family: monospace; color: #0f0; margin: 15px 0;">
            &gt; PROJECT ECHO<br>
            &gt; STECKERDOSER HEIDE<br>
            &gt; EM WEAPON TEST<br>
            &gt; FREQUENCY: 14.230<br>
            &gt; [CLASSIFIED]
          </div>
        `,
        details: `
          <strong>ANALYSIS:</strong><br>
          This transmission was intercepted during routine SDR monitoring. The use of SSTV suggests
          an attempt to communicate covertly using analog methods less likely to be detected by
          modern digital surveillance systems.
        `,
        notes: `
          <p style="color: #ff6b00; font-weight: bold;">⚠ This was the first indication of Project Echo</p>
          <p>The transmission's timing (23:47 UTC) suggests it was sent after normal working hours,
          possibly by someone with authorized access attempting to leak information.</p>
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
