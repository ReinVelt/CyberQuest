/**
 * Ally Coordination Overlay
 * ═══════════════════════════════════════════════════════════
 * Persistent HUD element showing real-time ally status during
 * facility infiltration scenes.
 *
 * Shows: Cees (WSRT monitoring), Jaap (dead-man switch),
 *        David (technical standby), Eva (inside contact)
 *
 * Usage: AllyOverlay.show(game) / AllyOverlay.hide()
 *        AllyOverlay.update(allyId, status, message)
 * ═══════════════════════════════════════════════════════════
 */

window.AllyOverlay = (function () {
    'use strict';

    let overlayEl = null;
    let updateTimers = [];

    const allies = {
        cees:  { name: 'Cees',  role: 'WSRT',     icon: '📡', status: 'MONITORING', color: '#00ff41' },
        jaap:  { name: 'Jaap',  role: 'DEADMAN',   icon: '⏱️', status: 'ARMED',      color: '#ffcc00' },
        david: { name: 'David', role: 'STANDBY',   icon: '💻', status: 'READY',      color: '#00aaff' },
        eva:   { name: 'Eva',   role: 'INSIDE',    icon: '🔑', status: 'POSITION',   color: '#ff6699' }
    };

    function _createOverlay() {
        if (overlayEl) return;

        overlayEl = document.createElement('div');
        overlayEl.id = 'ally-coordination-overlay';
        overlayEl.style.cssText = `
            position:fixed;top:10px;right:10px;z-index:9998;
            width:180px;padding:8px 10px;
            background:rgba(0,10,0,0.75);
            border:1px solid rgba(0,255,65,0.15);
            border-radius:6px;
            font-family:'Courier New',monospace;font-size:10px;
            color:rgba(255,255,255,0.6);
            backdrop-filter:blur(4px);
            pointer-events:none;
            opacity:0;transition:opacity 0.6s ease;
        `;

        // Title
        const title = document.createElement('div');
        title.style.cssText = 'text-align:center;font-size:8px;text-transform:uppercase;letter-spacing:2px;color:rgba(0,255,65,0.4);margin-bottom:6px;border-bottom:1px solid rgba(0,255,65,0.1);padding-bottom:4px;';
        title.textContent = '● TEAM STATUS';
        overlayEl.appendChild(title);

        // Ally rows
        Object.keys(allies).forEach(id => {
            const a = allies[id];
            const row = document.createElement('div');
            row.id = `ally-row-${id}`;
            row.style.cssText = 'display:flex;align-items:center;gap:5px;padding:2px 0;';
            row.innerHTML = `
                <span style="font-size:11px;">${a.icon}</span>
                <span style="min-width:38px;color:rgba(255,255,255,0.5);">${a.name}</span>
                <span class="ally-status" style="color:${a.color};font-weight:bold;font-size:9px;">${a.status}</span>
            `;
            overlayEl.appendChild(row);
        });

        document.body.appendChild(overlayEl);

        // Fade in
        requestAnimationFrame(() => {
            overlayEl.style.opacity = '1';
        });
    }

    function _scheduleUpdates() {
        // Periodic ally status updates to create illusion of live coordination
        const updates = [
            { delay: 8000,  ally: 'cees',  status: 'RF SCAN',    color: '#00ff41' },
            { delay: 15000, ally: 'jaap',  status: '04:58',      color: '#ffcc00' },
            { delay: 22000, ally: 'cees',  status: 'NO ANOMALY', color: '#00ff41' },
            { delay: 30000, ally: 'david', status: 'LISTENING',  color: '#00aaff' },
            { delay: 38000, ally: 'jaap',  status: '04:42',      color: '#ffcc00' },
            { delay: 45000, ally: 'cees',  status: 'CLEAR',      color: '#00ff41' },
            { delay: 55000, ally: 'jaap',  status: '04:28',      color: '#ffcc00' },
            { delay: 65000, ally: 'eva',   status: 'GUIDING',    color: '#ff6699' },
            { delay: 75000, ally: 'cees',  status: 'MONITORING', color: '#00ff41' },
            { delay: 85000, ally: 'jaap',  status: '04:12',      color: '#ffcc00' },
            { delay: 95000, ally: 'david', status: 'READY',      color: '#00aaff' }
        ];

        updates.forEach(u => {
            const t = setTimeout(() => {
                update(u.ally, u.status, u.color);
            }, u.delay);
            updateTimers.push(t);
        });
    }

    function show(game) {
        // Only show during facility infiltration
        if (!game.getFlag('mission_prep_complete')) return;
        _createOverlay();
        _scheduleUpdates();
    }

    function hide() {
        updateTimers.forEach(t => clearTimeout(t));
        updateTimers = [];
        if (overlayEl) {
            overlayEl.style.opacity = '0';
            setTimeout(() => {
                if (overlayEl && overlayEl.parentNode) {
                    overlayEl.parentNode.removeChild(overlayEl);
                }
                overlayEl = null;
            }, 700);
        }
    }

    function update(allyId, status, color) {
        if (!overlayEl) return;
        const row = overlayEl.querySelector(`#ally-row-${allyId}`);
        if (!row) return;
        const statusEl = row.querySelector('.ally-status');
        if (statusEl) {
            statusEl.style.color = color || allies[allyId].color;
            statusEl.textContent = status;
            // Brief flash on update
            statusEl.style.textShadow = `0 0 6px ${color || allies[allyId].color}`;
            setTimeout(() => {
                statusEl.style.textShadow = 'none';
            }, 800);
        }
    }

    return { show, hide, update };
})();
