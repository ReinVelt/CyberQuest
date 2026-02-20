#!/usr/bin/env python3
"""
Rebuild astron.svg: interior control room with 16:9 panoramic window
showing the WSRT dishes photo at correct aspect ratio.
"""

import re

SVG_IN  = 'assets/images/scenes/astron.svg'
SVG_OUT = 'assets/images/scenes/astron.svg'

# ── Read original and extract the base64 href ──
with open(SVG_IN, 'r') as f:
    content = f.read()

# Find the href="data:image/jpeg;base64,..."
m = re.search(r'href="(data:image/jpeg;base64,[^"]+)"', content)
if not m:
    raise ValueError('Could not find base64 image href in SVG')
image_href = m.group(1)

# ── Window dimensions (16:9 aspect ratio to match bitmap) ──
WIN_W  = 1100
WIN_H  = int(WIN_W * 9 / 16)   # 619
WIN_X  = (1920 - WIN_W) // 2   # 410
WIN_Y  = 80
WIN_B  = WIN_Y + WIN_H         # 699  (window bottom)
SILL_Y = WIN_B + 2             # 701
SILL_H = 12

# Elements below window
MON_Y  = SILL_Y + SILL_H + 8   # 721  (wall monitors)
MON_H  = 75                     # compact monitors
DESK_Y = MON_Y + MON_H + 14    # 810  (desk surface)
FLOOR_Y = DESK_Y               # 810

# Cees standing — feet on floor
CEES_X = 1180
CEES_FOOT_Y = FLOOR_Y + 120     # 930
CEES_Y = CEES_FOOT_Y - 120      # 810  (translate y, figure is ~120 tall)

# Door
DOOR_X = 1740
DOOR_Y = 280
DOOR_H = FLOOR_Y - DOOR_Y + 50  # extends to floor

# ── Build new interior SVG ──
svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
  <defs>
    <filter id="shadow">
      <feDropShadow dx="2" dy="3" stdDeviation="4" flood-opacity="0.4"/>
    </filter>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="screenGlow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- Clip path for panoramic window (16:9 matching bitmap) -->
    <clipPath id="windowClip">
      <rect x="{WIN_X}" y="{WIN_Y}" width="{WIN_W}" height="{WIN_H}" rx="4"/>
    </clipPath>
  </defs>

  <!-- ================================================ -->
  <!-- FLOOR                                             -->
  <!-- ================================================ -->
  <rect x="0" y="{FLOOR_Y}" width="1920" height="{1080 - FLOOR_Y}" fill="#3a3a42"/>
  <!-- Floor tile grid lines -->
  <g stroke="#32323a" stroke-width="1" opacity="0.5">
    <line x1="0" y1="{FLOOR_Y + 40}" x2="1920" y2="{FLOOR_Y + 40}"/>
    <line x1="0" y1="{FLOOR_Y + 90}" x2="1920" y2="{FLOOR_Y + 90}"/>
    <line x1="0" y1="{FLOOR_Y + 150}" x2="1920" y2="{FLOOR_Y + 150}"/>
    <line x1="0" y1="{FLOOR_Y + 220}" x2="1920" y2="{FLOOR_Y + 220}"/>
    <!-- Perspective lines -->
    <line x1="200" y1="{FLOOR_Y}" x2="0" y2="1080"/>
    <line x1="500" y1="{FLOOR_Y}" x2="350" y2="1080"/>
    <line x1="800" y1="{FLOOR_Y}" x2="720" y2="1080"/>
    <line x1="1100" y1="{FLOOR_Y}" x2="1100" y2="1080"/>
    <line x1="1400" y1="{FLOOR_Y}" x2="1480" y2="1080"/>
    <line x1="1700" y1="{FLOOR_Y}" x2="1920" y2="1080"/>
  </g>
  <!-- floor edge/baseboard -->
  <rect x="0" y="{FLOOR_Y - 4}" width="1920" height="6" fill="#2a2a30"/>

  <!-- ================================================ -->
  <!-- BACK WALL (behind window)                         -->
  <!-- ================================================ -->
  <rect x="0" y="0" width="1920" height="{FLOOR_Y}" fill="#4a4e58"/>

  <!-- ================================================ -->
  <!-- CEILING                                           -->
  <!-- ================================================ -->
  <rect x="0" y="0" width="1920" height="60" fill="#5a5e68"/>
  <!-- Ceiling trim -->
  <rect x="0" y="58" width="1920" height="4" fill="#3a3e48"/>

  <!-- Fluorescent light banks -->
  <g>
    <rect x="300" y="10" width="260" height="36" fill="#6a6e78" rx="3"/>
    <rect x="308" y="14" width="110" height="26" fill="#e8eefc" rx="2" opacity="0.9"/>
    <rect x="438" y="14" width="110" height="26" fill="#e8eefc" rx="2" opacity="0.9"/>

    <rect x="830" y="10" width="260" height="36" fill="#6a6e78" rx="3"/>
    <rect x="838" y="14" width="110" height="26" fill="#e8eefc" rx="2" opacity="0.9"/>
    <rect x="968" y="14" width="110" height="26" fill="#e8eefc" rx="2" opacity="0.9"/>

    <rect x="1360" y="10" width="260" height="36" fill="#6a6e78" rx="3"/>
    <rect x="1368" y="14" width="110" height="26" fill="#e8eefc" rx="2" opacity="0.9"/>
    <rect x="1498" y="14" width="110" height="26" fill="#e8eefc" rx="2" opacity="0.9"/>
  </g>

  <!-- ================================================ -->
  <!-- LARGE PANORAMIC WINDOW  ({WIN_W}×{WIN_H}, 16:9)  -->
  <!-- ================================================ -->
  <!-- Window recess shadow -->
  <rect x="{WIN_X - 10}" y="{WIN_Y - 8}" width="{WIN_W + 20}" height="{WIN_H + 16}" fill="#1a1a22" rx="6"/>

  <!-- Photograph of dishes (scaled to fill 16:9 window exactly) -->
  <g clip-path="url(#windowClip)">
    <image x="{WIN_X}" y="{WIN_Y}" width="{WIN_W}" height="{WIN_H}"
      preserveAspectRatio="xMidYMid meet"
      href="{image_href}"/>
    <!-- Subtle glass tint -->
    <rect x="{WIN_X}" y="{WIN_Y}" width="{WIN_W}" height="{WIN_H}" fill="rgba(180,210,240,0.08)"/>
  </g>

  <!-- Window frame (thick dark metal mullions) -->
  <g fill="none" stroke="#2a2e38" stroke-width="8">
    <rect x="{WIN_X - 4}" y="{WIN_Y - 4}" width="{WIN_W + 8}" height="{WIN_H + 8}" rx="4"/>
    <!-- Vertical mullions (thirds) -->
    <line x1="{WIN_X + WIN_W // 3}" y1="{WIN_Y - 4}" x2="{WIN_X + WIN_W // 3}" y2="{WIN_B + 4}"/>
    <line x1="{WIN_X + 2 * WIN_W // 3}" y1="{WIN_Y - 4}" x2="{WIN_X + 2 * WIN_W // 3}" y2="{WIN_B + 4}"/>
  </g>
  <!-- Thinner horizontal mullion -->
  <g fill="none" stroke="#2a2e38" stroke-width="5">
    <line x1="{WIN_X - 4}" y1="{WIN_Y + WIN_H // 2}" x2="{WIN_X + WIN_W + 4}" y2="{WIN_Y + WIN_H // 2}"/>
  </g>

  <!-- Window sill -->
  <rect x="{WIN_X - 20}" y="{SILL_Y}" width="{WIN_W + 40}" height="{SILL_H}" fill="#3a3e48" rx="2"/>
  <rect x="{WIN_X - 20}" y="{SILL_Y + SILL_H}" width="{WIN_W + 40}" height="3" fill="#2a2e38"/>

  <!-- ================================================ -->
  <!-- LEFT WALL — Server racks                          -->
  <!-- ================================================ -->
  <g transform="translate(20,{WIN_Y})">
    <!-- Rack 1 -->
    <rect x="0" y="0" width="85" height="{FLOOR_Y - WIN_Y - 10}" fill="#2a2a32" rx="3" filter="url(#shadow)"/>
    <rect x="6" y="10" width="73" height="55" fill="#1a1a22" rx="2"/>
    <rect x="6" y="75" width="73" height="55" fill="#1a1a22" rx="2"/>
    <rect x="6" y="140" width="73" height="55" fill="#1a1a22" rx="2"/>
    <rect x="6" y="205" width="73" height="55" fill="#1a1a22" rx="2"/>
    <rect x="6" y="270" width="73" height="55" fill="#1a1a22" rx="2"/>
    <rect x="6" y="335" width="73" height="55" fill="#1a1a22" rx="2"/>
    <rect x="6" y="400" width="73" height="55" fill="#1a1a22" rx="2"/>
    <rect x="6" y="465" width="73" height="55" fill="#1a1a22" rx="2"/>
    <rect x="6" y="530" width="73" height="55" fill="#1a1a22" rx="2"/>
    <rect x="6" y="595" width="73" height="55" fill="#1a1a22" rx="2"/>
    <rect x="6" y="660" width="73" height="55" fill="#1a1a22" rx="2"/>
    <!-- Blinking LEDs (one per bay) -->
    <circle cx="18" cy="28" r="2.5" fill="#00cc44" opacity="0.8"/>
    <circle cx="28" cy="28" r="2.5" fill="#00cc44" opacity="0.6"/>
    <circle cx="38" cy="28" r="2.5" fill="#ffaa00" opacity="0.7"/>
    <circle cx="18" cy="93" r="2.5" fill="#00cc44" opacity="0.8"/>
    <circle cx="28" cy="93" r="2.5" fill="#00cc44" opacity="0.7"/>
    <circle cx="18" cy="158" r="2.5" fill="#00cc44" opacity="0.6"/>
    <circle cx="28" cy="158" r="2.5" fill="#ffaa00" opacity="0.7"/>
    <circle cx="18" cy="223" r="2.5" fill="#cc4444" opacity="0.8"/>
    <circle cx="28" cy="223" r="2.5" fill="#00cc44" opacity="0.6"/>
    <circle cx="18" cy="288" r="2.5" fill="#00cc44" opacity="0.8"/>
    <circle cx="28" cy="288" r="2.5" fill="#00cc44" opacity="0.7"/>
    <circle cx="18" cy="353" r="2.5" fill="#00cc44" opacity="0.6"/>
    <circle cx="28" cy="353" r="2.5" fill="#00cc44" opacity="0.5"/>
    <circle cx="18" cy="418" r="2.5" fill="#00cc44" opacity="0.8"/>
    <circle cx="28" cy="483" r="2.5" fill="#ffaa00" opacity="0.6"/>
    <circle cx="18" cy="548" r="2.5" fill="#00cc44" opacity="0.7"/>
    <circle cx="28" cy="613" r="2.5" fill="#00cc44" opacity="0.8"/>
    <circle cx="18" cy="678" r="2.5" fill="#00cc44" opacity="0.6"/>
  </g>

  <!-- ================================================ -->
  <!-- WALL-MOUNTED MONITORS (below window sill)         -->
  <!-- ================================================ -->
  <!-- Monitor 1 (left) — LOFAR status -->
  <g transform="translate({WIN_X},{MON_Y})">
    <rect x="0" y="0" width="160" height="{MON_H}" fill="#1a1a22" rx="4" filter="url(#shadow)"/>
    <rect x="5" y="4" width="150" height="{MON_H - 20}" fill="#0a2a1a" rx="2"/>
    <text x="12" y="18" font-family="monospace" font-size="8" fill="#00ff88">LOFAR ARRAY STATUS</text>
    <text x="12" y="30" font-family="monospace" font-size="6.5" fill="#00cc66">14/14 DISHES ONLINE</text>
    <text x="12" y="40" font-family="monospace" font-size="6.5" fill="#00cc66">CORRELATION: ACTIVE</text>
    <text x="12" y="50" font-family="monospace" font-size="6.5" fill="#ffaa00">BW: 160 MHz</text>
    <text x="80" y="{MON_H - 4}" font-family="sans-serif" font-size="5" fill="#666" text-anchor="middle">WSRT MONITOR 1</text>
  </g>

  <!-- Monitor 2 — RF spectrum -->
  <g transform="translate({WIN_X + 180},{MON_Y})">
    <rect x="0" y="0" width="160" height="{MON_H}" fill="#1a1a22" rx="4" filter="url(#shadow)"/>
    <rect x="5" y="4" width="150" height="{MON_H - 20}" fill="#0a1a2a" rx="2"/>
    <path d="M10 42 L26 26 L42 36 L58 22 L74 32 L90 18 L106 30 L122 24 L138 34 L150 28" fill="none" stroke="#4488ff" stroke-width="1.5"/>
    <text x="12" y="18" font-family="monospace" font-size="8" fill="#4488ff">RF SPECTRUM</text>
    <text x="80" y="{MON_H - 4}" font-family="sans-serif" font-size="5" fill="#666" text-anchor="middle">WSRT MONITOR 2</text>
  </g>

  <!-- Monitor 3 — dish pointing -->
  <g transform="translate({WIN_X + WIN_W - 340},{MON_Y})">
    <rect x="0" y="0" width="160" height="{MON_H}" fill="#1a1a22" rx="4" filter="url(#shadow)"/>
    <rect x="5" y="4" width="150" height="{MON_H - 20}" fill="#0a1a2a" rx="2"/>
    <text x="12" y="18" font-family="monospace" font-size="8" fill="#44aaff">DISH POINTING</text>
    <text x="12" y="30" font-family="monospace" font-size="6.5" fill="#3388cc">AZ: 142.7°  EL: 34.2°</text>
    <text x="12" y="40" font-family="monospace" font-size="6.5" fill="#3388cc">HA: -02h 14m 33s</text>
    <text x="12" y="50" font-family="monospace" font-size="6.5" fill="#ffaa00">MODE: TRACK</text>
    <text x="80" y="{MON_H - 4}" font-family="sans-serif" font-size="5" fill="#666" text-anchor="middle">WSRT MONITOR 3</text>
  </g>

  <!-- Monitor 4 — security/comms -->
  <g transform="translate({WIN_X + WIN_W - 160},{MON_Y})">
    <rect x="0" y="0" width="160" height="{MON_H}" fill="#1a1a22" rx="4" filter="url(#shadow)"/>
    <rect x="5" y="4" width="150" height="{MON_H - 20}" fill="#1a0a0a" rx="2"/>
    <text x="12" y="18" font-family="monospace" font-size="8" fill="#ff6644">SECURE CHANNEL</text>
    <text x="12" y="30" font-family="monospace" font-size="6.5" fill="#cc4422">ENCRYPTED: AES-256</text>
    <text x="12" y="40" font-family="monospace" font-size="6.5" fill="#cc4422">MESH NODES: 3</text>
    <text x="12" y="50" font-family="monospace" font-size="6.5" fill="#00cc44">STATUS: GREEN</text>
    <text x="80" y="{MON_H - 4}" font-family="sans-serif" font-size="5" fill="#666" text-anchor="middle">WSRT MONITOR 4</text>
  </g>

  <!-- ================================================ -->
  <!-- CONSOLE DESK (long desk under monitors)           -->
  <!-- ================================================ -->
  <g>
    <!-- Main desk surface -->
    <rect x="150" y="{DESK_Y}" width="1450" height="10" fill="#5a5040" rx="2"/>
    <!-- Desk front panel -->
    <rect x="150" y="{DESK_Y + 10}" width="1450" height="30" fill="#4a4535"/>
    <!-- Desk legs -->
    <rect x="180" y="{DESK_Y + 40}" width="10" height="50" fill="#3a3530"/>
    <rect x="580" y="{DESK_Y + 40}" width="10" height="50" fill="#3a3530"/>
    <rect x="1050" y="{DESK_Y + 40}" width="10" height="50" fill="#3a3530"/>
    <rect x="1560" y="{DESK_Y + 40}" width="10" height="50" fill="#3a3530"/>
  </g>

  <!-- ================================================ -->
  <!-- WORKSTATION 1 — Cees's station (right of center)  -->
  <!-- ================================================ -->
  <g transform="translate(1050,{DESK_Y - 60})">
    <!-- Monitor -->
    <rect x="0" y="0" width="100" height="52" fill="#1a1a22" rx="3"/>
    <rect x="4" y="3" width="92" height="40" fill="#0a2a1a" rx="2"/>
    <!-- Screen content — analysis output -->
    <path d="M10 32 L22 18 L34 28 L46 12 L58 26 L70 15 L82 24 L90 20" fill="none" stroke="#00ff88" stroke-width="1.2"/>
    <text x="10" y="15" font-family="monospace" font-size="6.5" fill="#00ff88">SIGNAL ANALYSIS</text>
    <!-- Monitor stand -->
    <rect x="40" y="42" width="20" height="12" fill="#2a2a32"/>
    <rect x="30" y="52" width="40" height="4" fill="#2a2a32" rx="1"/>
    <!-- Keyboard -->
    <rect x="10" y="56" width="80" height="7" fill="#2a2a2e" rx="2"/>
    <!-- Coffee mug -->
    <rect x="115" y="46" width="12" height="14" fill="#8a4a2a" rx="2"/>
    <rect x="126" y="49" width="6" height="7" fill="none" stroke="#8a4a2a" stroke-width="2" rx="3"/>
  </g>

  <!-- ================================================ -->
  <!-- SIGNAL ANALYSIS EQUIPMENT (Ryan's HackRF)         -->
  <!-- ================================================ -->
  <g transform="translate(350,{DESK_Y - 60})">
    <!-- Laptop -->
    <rect x="0" y="8" width="75" height="45" fill="#333" rx="3"/>
    <rect x="3" y="11" width="69" height="34" fill="#0a2a1a" rx="2"/>
    <!-- Green signal waveform on screen -->
    <path d="M8 28 L17 17 L26 32 L35 14 L44 26 L53 11 L62 23" fill="none" stroke="#00ff88" stroke-width="1.5"/>
    <text x="8" y="20" font-family="monospace" font-size="5.5" fill="#00cc66">FREQ SCAN</text>
    <!-- Keyboard section -->
    <rect x="0" y="53" width="75" height="5" fill="#2a2a2a" rx="1"/>

    <!-- HackRF device -->
    <rect x="90" y="22" width="55" height="22" fill="#1a1a2a" rx="3"/>
    <rect x="94" y="25" width="20" height="15" fill="#0a2a1a" rx="2"/>
    <circle cx="132" cy="33" r="4.5" fill="#ff4444" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
    </circle>
    <!-- HackRF antenna -->
    <line x1="145" y1="22" x2="158" y2="0" stroke="#666" stroke-width="2"/>
    <circle cx="158" cy="0" r="3" fill="#888"/>

    <!-- Cables -->
    <path d="M75 36 L90 33" fill="none" stroke="#444" stroke-width="2"/>

    <!-- Notepad -->
    <rect x="160" y="36" width="36" height="22" fill="#f0ecd8" rx="1"/>
    <line x1="165" y1="43" x2="191" y2="43" stroke="#999" stroke-width="0.5"/>
    <line x1="165" y1="48" x2="188" y2="48" stroke="#999" stroke-width="0.5"/>
    <line x1="165" y1="53" x2="186" y2="53" stroke="#999" stroke-width="0.5"/>
    <!-- Pen -->
    <line x1="198" y1="34" x2="204" y2="58" stroke="#2244aa" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- ================================================ -->
  <!-- Cees Bassa — standing at his workstation          -->
  <!-- ================================================ -->
  <g transform="translate({CEES_X},{CEES_Y})">
    <!-- Shadow on floor -->
    <ellipse cx="15" cy="118" rx="18" ry="6" fill="rgba(0,0,0,0.2)"/>
    <!-- Body (dark blue polo) -->
    <rect x="0" y="38" width="30" height="55" fill="#2a3a5a" rx="4"/>
    <!-- Head -->
    <circle cx="15" cy="28" r="15" fill="#d4a574"/>
    <!-- Hair -->
    <path d="M0 24 Q6 12 15 16 Q24 12 30 24" fill="#4a3a2a"/>
    <!-- Glasses -->
    <circle cx="9" cy="28" r="4.5" fill="none" stroke="#333" stroke-width="1.4"/>
    <circle cx="21" cy="28" r="4.5" fill="none" stroke="#333" stroke-width="1.4"/>
    <line x1="13.5" y1="28" x2="16.5" y2="28" stroke="#333" stroke-width="1"/>
    <!-- Arms -->
    <line x1="0" y1="48" x2="-14" y2="68" stroke="#2a3a5a" stroke-width="7" stroke-linecap="round"/>
    <line x1="30" y1="48" x2="44" y2="62" stroke="#2a3a5a" stroke-width="7" stroke-linecap="round"/>
    <!-- Tablet in right hand -->
    <rect x="40" y="56" width="18" height="13" fill="#222" rx="2"/>
    <rect x="41.5" y="57.5" width="15" height="10" fill="#4488aa" rx="1"/>
    <!-- Legs (dark trousers) -->
    <rect x="3" y="91" width="11" height="22" fill="#2a2a3a" rx="2"/>
    <rect x="17" y="91" width="11" height="22" fill="#2a2a3a" rx="2"/>
    <!-- Shoes -->
    <rect x="2" y="111" width="13" height="7" fill="#1a1a1a" rx="2"/>
    <rect x="16" y="111" width="13" height="7" fill="#1a1a1a" rx="2"/>
  </g>

  <!-- ================================================ -->
  <!-- WHITEBOARD (left wall, above rack)                -->
  <!-- ================================================ -->
  <g transform="translate(130,{WIN_Y + WIN_H + 20})">
    <rect x="0" y="0" width="110" height="75" fill="#e8e8e0" rx="2" filter="url(#shadow)"/>
    <rect x="2" y="2" width="106" height="71" fill="#f4f4ee" rx="1"/>
    <text x="8" y="18" font-family="monospace" font-size="7" fill="#2244aa">ECHO PROJECT</text>
    <line x1="8" y1="28" x2="88" y2="28" stroke="#cc2222" stroke-width="1"/>
    <text x="8" y="40" font-family="monospace" font-size="5.5" fill="#333">243 MHz</text>
    <text x="8" y="50" font-family="monospace" font-size="5.5" fill="#333">53.28°N 7.42°E</text>
    <text x="8" y="60" font-family="monospace" font-size="5.5" fill="#cc2222">DANGER</text>
    <rect x="93" y="67" width="18" height="5" fill="#cc2222" rx="2" transform="rotate(-15,102,69)"/>
  </g>

  <!-- ================================================ -->
  <!-- DOOR (right wall — exit)                          -->
  <!-- ================================================ -->
  <g transform="translate({DOOR_X},{DOOR_Y})">
    <rect x="0" y="0" width="140" height="{DOOR_H}" fill="#3a3530" rx="2"/>
    <rect x="8" y="8" width="124" height="{DOOR_H - 16}" fill="#5a5548" rx="2"/>
    <rect x="18" y="20" width="104" height="{DOOR_H // 2 - 30}" fill="#5a5a50" rx="2" stroke="#4a4a42" stroke-width="1"/>
    <rect x="18" y="{DOOR_H // 2 + 10}" width="104" height="{DOOR_H // 2 - 30}" fill="#5a5a50" rx="2" stroke="#4a4a42" stroke-width="1"/>
    <rect x="108" y="{DOOR_H // 2}" width="12" height="40" fill="#b0a888" rx="3"/>
    <!-- EXIT sign above door -->
    <rect x="30" y="-28" width="80" height="20" fill="#1a3a1a" rx="3"/>
    <text x="70" y="-13" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#00ff44" font-weight="bold">EXIT</text>
  </g>

  <!-- ================================================ -->
  <!-- ASTRON wall plaque                                -->
  <!-- ================================================ -->
  <g transform="translate({WIN_X + WIN_W + 30},{MON_Y})">
    <rect x="0" y="0" width="90" height="50" fill="#2a3a4a" rx="3" filter="url(#shadow)"/>
    <text x="45" y="18" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#ddd" font-weight="bold">ASTRON</text>
    <text x="45" y="32" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#aaa">Netherlands Institute</text>
    <text x="45" y="41" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#aaa">for Radio Astronomy</text>
  </g>

  <!-- ================================================ -->
  <!-- Subtle ambient lighting effects                   -->
  <!-- ================================================ -->
  <ellipse cx="960" cy="60" rx="350" ry="12" fill="#88aacc" opacity="0.04"/>
  <rect x="300" y="{FLOOR_Y}" width="1200" height="60" fill="#aaccee" opacity="0.03"/>

  <!-- Bottom label -->
  <g transform="translate(960,1060)">
    <text text-anchor="middle" font-family="monospace" font-size="13" fill="#888" opacity="0.4">WSRT Control Room — Westerbork, Drenthe</text>
  </g>

</svg>'''

with open(SVG_OUT, 'w') as f:
    f.write(svg)

print(f'Written {len(svg):,} chars (excl. image: ~{len(svg) - len(image_href):,} chars)')
print(f'Image data: {len(image_href):,} chars')
print('Done: astron.svg rebuilt as interior control room')
