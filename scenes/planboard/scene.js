/**
 * PLANBOARD SCENE
 * Detective-style investigation board showing all discovered clues and connections
 */

const PlanboardScene = {
  id: 'planboard',
  name: 'Investigation Board',
  background: 'assets/images/scenes/planboard.svg',
  
  // Track which evidence slots are currently visible
  visibleSlots: [],
  
  // Dossier popup state
  activeDossier: null,
  
  onEnter: function() {
    console.log('Entering planboard scene');
    
    // Update board based on discovered clues
    this.updateBoard();
    
    // Show animation of board updating
    this.animateBoardEntrance();
  },
  
  onExit: function() {
    // Clean up any open dossiers
    if (this.activeDossier) {
      this.closeDossier();
    }
  },
  
  /**
   * Update board visibility based on discovered clues
   */
  updateBoard: function() {
    const svg = document.querySelector('svg');
    if (!svg) return;
    
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
    const svg = document.querySelector('svg');
    if (!svg) return;
    
    const slot = svg.getElementById(slotId);
    if (slot) {
      slot.setAttribute('opacity', '1');
    }
  },
  
  /**
   * Update connection strings between evidence
   */
  updateConnections: function() {
    const svg = document.querySelector('svg');
    if (!svg) return;
    
    const connectionsGroup = svg.getElementById('connections');
    if (!connectionsGroup) return;
    
    // Show connections group if we have multiple clues
    if (this.visibleSlots.length >= 2) {
      connectionsGroup.setAttribute('opacity', '1');
    }
    
    // Individual connection visibility logic
    const connections = {
      'string-sstv-usb': ['sstv', 'usb'],
      'string-usb-eva': ['usb', 'eva'],
      'string-eva-facility': ['eva', 'facility'],
      'string-facility-weapon': ['facility', 'weapon'],
      'string-eva-experts': ['eva', 'experts']
    };
    
    for (const [stringId, [slot1, slot2]] of Object.entries(connections)) {
      const stringElement = svg.getElementById(stringId);
      if (stringElement) {
        if (this.visibleSlots.includes(slot1) && this.visibleSlots.includes(slot2)) {
          stringElement.setAttribute('opacity', '1');
        } else {
          stringElement.setAttribute('opacity', '0');
        }
      }
    }
  },
  
  /**
   * Animate board entrance
   */
  animateBoardEntrance: function() {
    // Fade in slots sequentially
    setTimeout(() => {
      const slots = document.querySelectorAll('[id^="slot-"]');
      slots.forEach((slot, index) => {
        if (slot.getAttribute('opacity') === '1') {
          slot.style.transition = 'opacity 0.5s';
          slot.style.opacity = '0';
          setTimeout(() => {
            slot.style.opacity = '1';
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
    if (this.activeDossier) {
      this.closeDossier();
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
      this.closeDossier();
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeDossier();
      }
    });
    
    // Close on ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeDossier();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
    
    this.activeDossier = evidenceType;
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
    this.activeDossier = null;
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
      position: { x: 2.6, y: 2.78 }, // Top left
      size: { w: 6.25, h: 4.63 },
      cursor: 'pointer',
      onClick: function() {
        game.loadScene('mancave');
      }
    },
    
    // Evidence slots - only clickable when visible
    {
      id: 'hotspot-sstv',
      position: { x: 10.42, y: 22.22 },
      size: { w: 13.54, h: 25.93 },
      cursor: 'pointer',
      onClick: function() {
        if (game.getFlag('sstv_decoded')) {
          game.currentScene.showDossier('sstv');
        }
      }
    },
    
    {
      id: 'hotspot-usb',
      position: { x: 25.52, y: 22.22 },
      size: { w: 12.5, h: 25.93 },
      cursor: 'pointer',
      onClick: function() {
        if (game.getFlag('picked_up_usb')) {
          game.currentScene.showDossier('usb');
        }
      }
    },
    
    {
      id: 'hotspot-eva',
      position: { x: 40.63, y: 22.22 },
      size: { w: 13.54, h: 25.93 },
      cursor: 'pointer',
      onClick: function() {
        if (game.getFlag('usb_analyzed')) {
          game.currentScene.showDossier('eva');
        }
      }
    },
    
    {
      id: 'hotspot-facility',
      position: { x: 56.77, y: 22.22 },
      size: { w: 13.54, h: 25.93 },
      cursor: 'pointer',
      onClick: function() {
        if (game.getFlag('sstv_decoded') || game.getFlag('usb_analyzed')) {
          game.currentScene.showDossier('facility');
        }
      }
    },
    
    {
      id: 'hotspot-weapon',
      position: { x: 72.92, y: 22.22 },
      size: { w: 17.71, h: 31.48 },
      cursor: 'pointer',
      onClick: function() {
        if (game.getFlag('viewed_schematics')) {
          game.currentScene.showDossier('weapon');
        }
      }
    },
    
    {
      id: 'hotspot-readme',
      position: { x: 8.85, y: 59.26 },
      size: { w: 21.88, h: 26.85 },
      cursor: 'pointer',
      onClick: function() {
        if (game.getFlag('usb_analyzed')) {
          game.currentScene.showDossier('readme');
        }
      }
    },
    
    {
      id: 'hotspot-experts',
      position: { x: 33.33, y: 59.26 },
      size: { w: 16.67, h: 26.85 },
      cursor: 'pointer',
      onClick: function() {
        if (game.getFlag('visited_videocall')) {
          game.currentScene.showDossier('experts');
        }
      }
    },
    
    {
      id: 'hotspot-timeline',
      position: { x: 52.6, y: 59.26 },
      size: { w: 19.79, h: 26.85 },
      cursor: 'pointer',
      onClick: function() {
        if (game.getFlag('usb_analyzed')) {
          game.currentScene.showDossier('timeline');
        }
      }
    }
  ]
};

// Register scene
if (typeof game !== 'undefined') {
  game.registerScene(PlanboardScene);
}
