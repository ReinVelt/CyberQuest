/**
 * REGIONAL MAP SCENE
 * Strategic map showing all key locations in the investigation
 */

const RegionalMapScene = {
  id: 'regional_map',
  name: 'Regional Map',
  background: 'assets/images/scenes/regional_map.svg',
  
  // Player position (not shown, UI-only scene)
  playerStart: { x: 50, y: 50 },
  
  // Track distance display state
  showDistances: false,
  
  onEnter: function() {
    console.log('Entering regional map scene');
    
    // Update status indicators based on game progress
    this.updateStatus();
    
    // Update location marker states
    this.updateLocationMarkers();
  },
  
  onExit: function() {
    // Clean up if needed
  },
  
  /**
   * Update status panel based on game flags
   */
  updateStatus: function() {
    const svg = document.querySelector('svg');
    if (!svg) return;
    
    // Update Ter Apel status
    const terapelStatus = svg.getElementById('status-terapel');
    if (terapelStatus) {
      if (game.getFlag('picked_up_usb')) {
        terapelStatus.textContent = '✓ Ter Apel: USB Retrieved';
        terapelStatus.setAttribute('fill', '#00ff88');
      } else if (game.getFlag('found_usb_stick')) {
        terapelStatus.textContent = '⚠ Ter Apel: USB Located';
        terapelStatus.setAttribute('fill', '#ffa502');
      } else if (game.getFlag('klooster_unlocked')) {
        terapelStatus.textContent = '→ Ter Apel: Meeting Scheduled';
        terapelStatus.setAttribute('fill', '#4a90e2');
      }
    }
    
    // Update Facility status
    const facilityStatus = svg.getElementById('status-facility');
    if (facilityStatus) {
      if (game.getFlag('data_extracted')) {
        facilityStatus.textContent = '✓ Facility: Data Extracted';
        facilityStatus.setAttribute('fill', '#00ff88');
      } else if (game.getFlag('entered_facility')) {
        facilityStatus.textContent = '⚠ Facility: Infiltrated';
        facilityStatus.setAttribute('fill', '#ff9800');
      } else if (game.getFlag('badge_cloned')) {
        facilityStatus.textContent = '→ Facility: Ready to Infiltrate';
        facilityStatus.setAttribute('fill', '#ffa502');
      } else if (game.getFlag('usb_analyzed')) {
        facilityStatus.textContent = '! Facility: Target Identified';
        facilityStatus.setAttribute('fill', '#ff4757');
      }
    }
  },
  
  /**
   * Update location marker appearance based on visit status
   */
  updateLocationMarkers: function() {
    const svg = document.querySelector('svg');
    if (!svg) return;
    
    // Compascuum is always home/active
    // Ter Apel marker update
    const terapelMarker = svg.querySelector('#location-terapel circle:nth-child(2)');
    if (terapelMarker && game.getFlag('found_usb_stick')) {
      terapelMarker.setAttribute('fill', '#00ff88');
    }
    
    // Facility marker update
    const facilityMarker = svg.querySelector('#location-facility circle:nth-child(2)');
    if (facilityMarker && game.getFlag('visited_facility')) {
      facilityMarker.setAttribute('fill', '#ff9800');
    }
  },
  
  /**
   * Toggle distance lines visibility
   */
  toggleDistances: function() {
    const svg = document.querySelector('svg');
    if (!svg) return;
    
    const distancesGroup = svg.getElementById('distances');
    if (!distancesGroup) return;
    
    this.showDistances = !this.showDistances;
    distancesGroup.setAttribute('opacity', this.showDistances ? '1' : '0');
    
    game.showNotification(
      this.showDistances ? 'Distance indicators enabled' : 'Distance indicators disabled'
    );
  },
  
  /**
   * Show location info popup
   */
  showLocationInfo: function(locationId) {
    const locationData = this.getLocationData(locationId);
    if (!locationData) return;
    
    // Create info overlay
    const overlay = document.createElement('div');
    overlay.id = 'location-info-overlay';
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
    
    // Create info container
    const container = document.createElement('div');
    container.id = 'location-info-container';
    container.style.cssText = `
      background: linear-gradient(135deg, #0a0e17 0%, #1a1f2e 100%);
      border: 3px solid #00ff88;
      border-radius: 10px;
      padding: 30px;
      max-width: 600px;
      box-shadow: 0 0 50px rgba(0, 255, 136, 0.5);
      color: #f5f5f5;
      font-family: Arial, sans-serif;
    `;
    
    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #00ff88; font-size: 28px; margin: 0; letter-spacing: 2px;">
          ${locationData.name}
        </h2>
        <div style="height: 2px; background: #00ff88; margin: 10px 0;"></div>
        <p style="color: #888; font-size: 14px; margin: 5px 0;">${locationData.subtitle}</p>
      </div>
      
      <div style="margin-bottom: 20px; line-height: 1.8;">
        ${locationData.description}
      </div>
      
      ${locationData.coordinates ? `
        <div style="background: rgba(0, 255, 136, 0.1); padding: 15px; border-left: 4px solid #00ff88; margin: 20px 0;">
          <strong style="color: #00ff88;">COORDINATES:</strong><br>
          ${locationData.coordinates}
        </div>
      ` : ''}
      
      ${locationData.status ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #444;">
          <strong style="color: #00ff88;">STATUS:</strong><br>
          ${locationData.status}
        </div>
      ` : ''}
      
      <div style="text-align: center; margin-top: 30px;">
        <button id="close-info-btn" style="
          background: #00ff88;
          color: #000;
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
    
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // Close button handler
    document.getElementById('close-info-btn').addEventListener('click', () => {
      overlay.remove();
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
    
    // Close on ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  },
  
  /**
   * Get detailed information about a location
   */
  getLocationData: function(locationId) {
    const locations = {
      compascuum: {
        name: 'COMPASCUUM',
        subtitle: 'Ryan\'s Farmhouse - Home Base',
        coordinates: '52.81°N, 6.97°E (Emmer-Compascuum)',
        description: `
          <p>Ryan's home in Emmer-Compascuum, a small village in Drenthe province. 
          A renovated farmhouse with modern amenities and a tech-filled mancave garage.</p>
          
          <p><strong>Features:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Main house with kitchen and living room</li>
            <li>Mancave tech lab with radio equipment</li>
            <li>Garden with direct access to parking</li>
            <li>Isolated location perfect for radio work</li>
          </ul>
          
          <p style="color: #00ff88;"><strong>This is your base of operations.</strong></p>
        `,
        status: '✓ Secure and operational'
      },
      
      terapel: {
        name: 'TER APEL KLOOSTER',
        subtitle: 'Historic Monastery - Meeting Point',
        coordinates: '52.9°N, 7.1°E',
        description: `
          <p>Historic monastery in Ter Apel, near the German border. Founded in 1465, 
          this former monastery is now a museum and cultural heritage site.</p>
          
          <p><strong>Significance:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Quiet, isolated meeting location</li>
            <li>Public parking area - discrete exchanges</li>
            <li>Far enough from prying eyes</li>
            <li>Historical radio connection to Klaus Weber</li>
          </ul>
          
          <p>${game.getFlag('picked_up_usb') ? 
            '<span style="color: #00ff88;">✓ USB stick successfully retrieved from Volvo</span>' : 
            game.getFlag('found_usb_stick') ? 
            '<span style="color: #ffa502;">⚠ USB stick discovered, not yet retrieved</span>' :
            game.getFlag('klooster_unlocked') ?
            '<span style="color: #4a90e2;">→ Meeting scheduled for 23:00</span>' :
            '<span style="color: #888;">○ Location not yet relevant to investigation</span>'
          }</p>
        `,
        status: game.getFlag('picked_up_usb') ? '✓ Mission complete' : 
                game.getFlag('klooster_unlocked') ? '→ Ready to visit' : '○ Locked'
      },
      
      facility: {
        name: 'STECKERDOSER HEIDE',
        subtitle: 'Project Echo Facility - Primary Target',
        coordinates: '53.3°N, 7.4°E (Germany)',
        description: `
          <p style="color: #ff4757;"><strong>⚠ CLASSIFIED FACILITY ⚠</strong></p>
          
          <p>Private research facility in northern Germany. Front company with 
          legitimate remote sensing business, but underground development of 
          Project Echo EM weapons.</p>
          
          <p><strong>Known Intelligence:</strong></p>
          <ul style="margin: 10px 0;">
            <li>High security - RFID badge access required</li>
            <li>Armed security personnel on site</li>
            <li>Server room contains classified data</li>
            <li>EM weapon testing range active</li>
            <li>Estimated staff: 50-100 personnel</li>
          </ul>
          
          <p style="color: #ff4757;"><strong>Infiltration requires careful planning and proper equipment.</strong></p>
          
          <p>${game.getFlag('data_extracted') ? 
            '<span style="color: #00ff88;">✓ Data successfully extracted</span>' : 
            game.getFlag('entered_facility') ? 
            '<span style="color: #ff9800;">⚠ Currently infiltrated - mission in progress</span>' :
            game.getFlag('badge_cloned') ?
            '<span style="color: #ffa502;">→ Ready for infiltration</span>' :
            game.getFlag('usb_analyzed') ?
            '<span style="color: #ff4757;">! Target identified - prepare for infiltration</span>' :
            '<span style="color: #666;">○ Location unknown</span>'
          }</p>
        `,
        status: game.getFlag('visited_facility') ? '⚠ Hostile territory visited' : '! High threat level'
      },
      
      wsrt: {
        name: 'WSRT - WESTERBORK',
        subtitle: 'Westerbork Synthesis Radio Telescope',
        coordinates: '52.9°N, 6.6°E',
        description: `
          <p>The Westerbork Synthesis Radio Telescope - one of the world's most 
          important radio astronomy facilities. Operated by ASTRON.</p>
          
          <p><strong>Specifications:</strong></p>
          <ul style="margin: 10px 0;">
            <li>14 parabolic dishes (25 meters diameter each)</li>
            <li>Observing frequencies: 115 MHz to 15 GHz</li>
            <li>1.5 km baseline for interferometry</li>
            <li>Major contributions to pulsar research</li>
            <li>Famous for detecting Fast Radio Bursts</li>
          </ul>
          
          <p><strong>Historical Note:</strong> Built in 1970, WSRT has been instrumental 
          in advancing radio astronomy. The site was chosen for its radio-quiet environment.</p>
          
          <p style="color: #ffa502;">This facility represents the legitimate use of 
          radio frequency technology - in contrast to Project Echo's weaponization.</p>
        `,
        status: '○ Reference location - not mission critical'
      },
      
      lofar: {
        name: 'LOFAR',
        subtitle: 'Low Frequency Array',
        coordinates: '52.91°N, 6.50°E (~60km W of Ter Apel)',
        description: `
          <p>LOFAR (Low Frequency Array) - the world's largest low-frequency 
          radio telescope, with thousands of antennas across Europe.</p>
          
          <p><strong>Specifications:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Core in Netherlands, stations across Europe</li>
            <li>Frequency range: 10-240 MHz</li>
            <li>38 stations in Netherlands alone</li>
            <li>International stations in multiple countries</li>
            <li>Digital beamforming technology</li>
          </ul>
          
          <p><strong>Research Areas:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Cosmic rays and particle physics</li>
            <li>Solar activity and space weather</li>
            <li>Pulsar and transient detection</li>
            <li>Epoch of Reionization studies</li>
          </ul>
          
          <p style="color: #ffa502;">LOFAR's distributed antenna approach shows 
          the peaceful scientific applications of RF technology.</p>
        `,
        status: '○ Reference location - research context'
      },
      
      meppen: {
        name: 'MEPPEN',
        subtitle: 'German Border Town - 20km E of Ter Apel',
        coordinates: '52.69°N, 7.29°E (Germany)',
        description: `
          <p>Meppen is a town in Lower Saxony, Germany, located along the Ems river. 
          The nearest German town to Ter Apel across the border.</p>
          
          <p><strong>Key Features:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Population: ~35,000</li>
            <li>Historic trading town on the Ems</li>
            <li>Border crossing point</li>
            <li>Agricultural and light industry center</li>
            <li>Close to Dutch-German border</li>
          </ul>
          
          <p><strong>Strategic Note:</strong> Crossing into Germany here provides 
          an alternate route to Steckerdoser Heide. Border controls are typically 
          minimal due to Schengen Agreement, but surveillance may be present.</p>
          
          <p style="color: #9370db;">Potential staging area for facility approach.</p>
        `,
        status: '○ Reference location - border context'
      }
    };
    
    return locations[locationId] || null;
  },
  
  hotspots: [
    // Back button
    {
      id: 'back-button',
      name: 'Back to Mancave',
      x: 2.6,
      y: 2.8,
      width: 5.2,
      height: 3.7,
      cursor: 'pointer',
      action: function(game) {
        game.loadScene('mancave');
      }
    },
    
    // Toggle distances button
    {
      id: 'toggle-distances',
      name: 'Toggle Distances',
      x: 8.9,
      y: 2.8,
      width: 7.3,
      height: 3.7,
      cursor: 'pointer',
      action: function(game) {
        game.currentScene.toggleDistances();
      }
    },
    
    // Location hotspots
    {
      id: 'location-compascuum-hotspot',
      name: 'Compascuum',
      x: 38.2,
      y: 53.3,
      width: 10,
      height: 12,
      cursor: 'pointer',
      action: function(game) {
        game.currentScene.showLocationInfo('compascuum');
      }
    },
    
    {
      id: 'location-terapel-hotspot',
      name: 'Ter Apel',
      x: 45,
      y: 45,
      width: 10,
      height: 12,
      cursor: 'pointer',
      action: function(game) {
        game.currentScene.showLocationInfo('terapel');
      }
    },
    
    {
      id: 'location-facility-hotspot',
      name: 'Facility',
      x: 58.6,
      y: 8,
      width: 14,
      height: 12,
      cursor: 'pointer',
      action: function(game) {
        game.currentScene.showLocationInfo('facility');
      }
    },
    
    {
      id: 'location-wsrt-hotspot',
      name: 'WSRT',
      x: 18,
      y: 45,
      width: 12,
      height: 12,
      cursor: 'pointer',
      action: function(game) {
        game.currentScene.showLocationInfo('wsrt');
      }
    },
    
    {
      id: 'location-lofar-hotspot',
      name: 'LOFAR',
      x: 13.75,
      y: 44.1,
      width: 10,
      height: 10,
      cursor: 'pointer',
      action: function(game) {
        game.currentScene.showLocationInfo('lofar');
      }
    },
    
    {
      id: 'location-meppen-hotspot',
      name: 'Meppen',
      x: 54.9,
      y: 64.4,
      width: 10,
      height: 12,
      cursor: 'pointer',
      action: function(game) {
        game.currentScene.showLocationInfo('meppen');
      }
    }
  ]
};

// Register scene
if (typeof game !== 'undefined') {
  game.registerScene(RegionalMapScene);
}
