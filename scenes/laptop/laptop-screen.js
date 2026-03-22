/**
 * Laptop Screen Overlay  v2
 * ═══════════════════════════════════════════════════════════════════
 * Full-screen "Kali Linux desktop" overlay.  All story dialogue is
 * typed live in the NARRATIVE PANEL at the bottom of the screen —
 * no external game popup boxes are used.
 *
 * States (auto-detected from game flags):
 *   default  → Terminal: dead man's switch status
 *   email    → ProtonMail: inbox open on encrypted anonymous tip
 *   evidence → Terminal: USB forensic analysis + persons of interest
 *   allies   → ProtonMail: sent encrypted messages to Cees/Jaap/David
 *   volkov   → Terminal: OSINT deep-dive on Dmitri Volkov / FSB
 *   done     → Terminal: full operations dashboard
 *
 * API:
 *   LaptopScreen.show(game, opts)
 *     opts.narrative  — array of { speaker, text } lines (optional)
 *     opts.onComplete — callback fired when player closes overlay
 *   LaptopScreen.hide()
 * ═══════════════════════════════════════════════════════════════════
 */

window.LaptopScreen = (function () {
    'use strict';

    // ── Module state ────────────────────────────────────────────────────
    let _el         = null;
    let _styleEl    = null;
    let _game       = null;     // game instance (for speakText / stopSpeech)
    let _narrative  = [];       // [{speaker, text}] lines to display
    let _nIdx       = 0;        // current line index
    let _cIdx       = 0;        // current char index within line
    let _typeTimer  = null;
    let _lineEl     = null;     // <span> receiving characters
    let _promptEl   = null;     // "continue" prompt element
    let _done       = false;    // all narrative lines finished
    let _onComplete = null;     // fires when player dismisses
    // audio
    let _actx       = null;
    let _anodes     = [];
    let _atimers    = [];

    // ── Story data ──────────────────────────────────────────────────────

    const INBOX = [
        {
            id: 1,
            from: 'noreply@hackerspace-drenthe.nl',
            subject: '[HSD] Monthly meetup — Thu 12 Feb, 19:00',
            date: 'Mon, 09 Feb 2026  08:02',
            preview: 'SDR demo + RTL-SDR workshop. Bring your dongle.',
            tag: 'NEWSLETTER', tagColor: '#4488ff',
            body: 'Hi all,\n\nThis Thursday — Hackerspace Drenthe, Assen.\n\nAgenda:\n  • SDR receiver demo — Cees Bassa\n  • RTL-SDR for beginners — 19:30\n  • WSRT tour signup (limited spots)\n\nFood & drinks from 18:30.\n\nSee you there,\n—HSD Board',
        },
        {
            id: 2,
            from: 'noreply@prizecentral-eu.com',
            subject: '🎉 Congratulations! You have won €50,000 EUR!',
            date: 'Mon, 09 Feb 2026  07:44',
            preview: 'Claim your winnings before the deadline expires!',
            tag: 'SPAM', tagColor: '#884444',
            body: 'CONGRATULATIONS!\n\nYour email address has been selected...\n\n[OBVIOUS SPAM]\n[SPF: FAIL  DKIM: FAIL  DMARC: FAIL]\n[14 prior phishing reports — sender blacklisted]',
        },
        {
            id: 3,
            from: '★ UNKNOWN — PGP encrypted',
            subject: '[no subject]',
            date: 'Mon, 09 Feb 2026  03:17',
            preview: '*** ENCRYPTED — decrypting... ***',
            tag: 'ENCRYPTED', tagColor: '#ffaa00',
            highlight: true,
            body: '-----BEGIN PGP MESSAGE-----\nVersion: GnuPG v2.2.41\n\nhQEMA3X9k2RtNqGrAQgApVj8m...\n\n[ ✓ Decrypting with ryan@kali private key... ]\n[ ✓ Signature verified — anonymous sender    ]\n\n────────────────────────────────────────\n\nThey know about Project ECHO.\n\nYour dead man\'s switch is the only thing\nkeeping this from going dark permanently.\n\nArm it for 72 hours. If we lose contact:\nauto-publish to WikiLeaks drop.\n\nDo NOT use normal channels.\nThey have SIGINT on Dwingeloo.\n\nGo to the klooster. 23:00. Come alone.\n\n────────────────────────────────────────\n[ ⚠ Message will self-delete in 60 seconds ]',
        },
    ];

    const SENT = [
        {
            to: 'cees.bassa@astron.nl (PGP)',
            subject: '[enc] Eyes only — urgent — ZERFALL',
            status: '✓ SENT (encrypted)',
            body: 'Cees,\n\nUSB from klooster — FSB has ZERFALL intel.\nYou\'re named as WSRT asset they plan to silence.\n\nMonitor 14.230 MHz + 243 MHz. Record everything.\nDon\'t use normal channels. Signal: ryan.w.verify → 7741\n\nStay dark.  — R',
        },
        {
            to: 'jaap@hackerspace-drenthe.nl (PGP)',
            subject: '[enc] Dead man\'s switch — activate contingency',
            status: '✓ SENT (encrypted)',
            body: 'Jaap,\n\nActivating 72h contingency.\nIf I miss check-in: push echo-watch-2026-02-09.7z.gpg\nto WikiLeaks INT drop + Bellingcat tip line.\n\nPassphrase = old CTF flag from 2019. Tell no one. — R',
        },
        {
            to: 'david.v@riseup.net (PGP)',
            subject: '[enc] Need secure infra — no time',
            status: '✓ SENT (encrypted)',
            body: 'David,\n\nNeed relay on your Pi — port 9050 to my onion.\n\nNo contact by Wed 11 Feb 20:00:\ncall Chris Kubecka. KeePass for number.\nTell her: "project falcon."\n\nThanks.  — R',
        },
    ];

    const TERMS = {
        default:
            '┌──(ryan㉿kali)-[~/projects/echo-watch]\n└─$ ./deadmans_switch.sh --status\n\n[OK] Dead man\'s switch ......... ARMED\n[OK] Timer remaining ........... 71h 48m\n[OK] Trigger threshold ......... 72h no check-in\n[OK] Encrypted payload ......... echo-watch-2026-02-09.7z.gpg\n[OK] Backup nodes synced ....... 3 / 3  (IPFS + 2× Tor HS)\n[OK] WikiLeaks drop ............ READY\n[OK] Tor circuit ............... NL→DE→SE\n[OK] Last check-in ............. 2026-02-09 09:14 UTC\n\n⚠  3 unread ProtonMail messages (one ENCRYPTED)\n\n┌──(ryan㉿kali)-[~/projects/echo-watch]\n└─$ █',

        evidence:
            '┌──(ryan㉿kali)-[~/forensics]\n└─$ python3 analyze_usb.py /dev/sdb1 --deep\n\n[*] FAT32 image  4.2 GB / 16 GB  |  847 files  |  63 recovered\n[*] Timestamps: 2024-11-08 → 2026-01-14  (CET)\n[+] EXIF GeoIP: 52.8124°N 6.3926°E → Dwingeloo, WSRT perimeter\n\n────────────────────────────────────────────────────────\n[!] PERSONS OF INTEREST\n────────────────────────────────────────────────────────\n\n  ► VOLKOV, Dmitri Alekseyevich\n      Unit:   FSB — Directorate S\n      Cover:  "Dr. Dieter Wolff"  —  Technologica BV, Den Haag\n      Target: Project ZERFALL  (DE quantum-RF mil program)\n      Sighted: Dwingeloo 2026-01-14\n      Linked deaths: 8\n\n  ► PROJECT ZERFALL  (DE/NL joint mil-tech)\n      Classification: NATO RESTRICTED\n      Status: PHASE 3 of 4 — extraction IMMINENT\n\n────────────────────────────────────────────────────────\n[!] CASUALTIES  (FSB — DIRECTORATE S)\n────────────────────────────────────────────────────────\n  2022  Prague    Kovač / Novotný     NATO AI · crypto HW\n  2023  Warsaw    Brzeski / Kamińska  SIGINT · HUMINT\n  2024  Munich    Braun / Yıldız      Bundeswehr · RF eng\n  2025  Hamburg   Schreiber           RF engineer\n  2025  Groningen van Dam             independent researcher\n\n┌──(ryan㉿kali)-[~/forensics]\n└─$ █',

        volkov:
            '┌──(ryan㉿kali)-[~/forensics]\n└─$ python3 volkov_osint.py "Dmitri Volkov" --deep\n\n[*] OSINT — target: VOLKOV, Dmitri Alekseyevich\n[*] Sources: LinkedIn · WHOIS · Shodan · HIBP · border logs\n\n[+] LinkedIn: "Dr. Dieter Wolff" — Technologica BV (Den Haag)\n       Created: 2023-02-01  |  Connections: 3  |  Photo: Shutterstock stock\n\n[+] WHOIS technologica-bv.nl\n       Registered: 2022-11-14  |  Proxy registrant\n       NS: ns1.parking-belnet.be  ←  known FSB infrastructure\n       Address: Laan van NOI 113 Den Haag → 3 prior FSB shells same building\n\n[+] Shodan: 22/OpenSSH 8.9 + 443/nginx  |  ASN AS197695 Russia-1 (Moscow)\n\n[+] Border crossings DE/NL 18 months: 43  — dates ±3d from ZERFALL milestones\n\n[+] WikiLeaks 2025 batch:\n       "ZERFALL PHASE 3 ASSET: D.W. (DWINGELOO)"\n       "EXTRACTION: quantum-RF key material — Q1 2026"\n\n[!] CONCLUSION: VOLKOV = FSB Directorate S  (4 independent source clusters)\n    Cover: Dr. Dieter Wolff (DE).  ZERFALL PHASE 3 — extraction ~Feb 2026.\n    8 deaths across CZ / PL / DE / NL attributed.\n    → Next: Chris Kubecka (OSINT) + ASTRON / HSD network\n\n┌──(ryan㉿kali)-[~/forensics]\n└─$ █',

        done:
            '  ┌──────────────────────────────────────────────────────┐\n  │      ECHO-WATCH DASHBOARD  —  Ryan Weylant           │\n  │             Mon 09 Feb 2026  10:41 UTC               │\n  └──────────────────────────────────────────────────────┘\n\n  DEAD MAN\'S SWITCH .. ✓ ARMED      (69h 19m)\n  ENCRYPTED PAYLOAD .. ✓ SYNCED     (3 nodes)\n  TOR CIRCUIT ........ ✓ ACTIVE     (NL→DE→SE)\n  VPN MULLVAD NL ..... ✓ CONNECTED\n\n  ──────────────────────────────────────────────────────\n  OPERATION STATUS\n  ──────────────────────────────────────────────────────\n  [✓] USB evidence                    ANALYSED\n  [✓] Volkov dossier                  COMPLETE\n  [✓] Allies alerted (Cees/Jaap/David) CONFIRMED\n  [ ] Chris Kubecka — deep OSINT      PENDING\n  [ ] Facility location               UNKNOWN\n  [ ] ZERFALL extraction — intercept  CRITICAL\n\n  ──────────────────────────────────────────────────────\n  VOLKOV / FSB — DIRECTORATE S\n  ──────────────────────────────────────────────────────\n  Real name:  Dmitri Alekseyevich Volkov\n  Cover:      Dr. Dieter Wolff (DE passport)\n  Employer:   Technologica BV, Den Haag  (FSB front)\n  Target:     ZERFALL quantum-RF key material\n  Deaths:     8 confirmed  (CZ · PL · DE · NL)\n  Status:     ACTIVE — Dwingeloo area\n\n  ──────────────────────────────────────────────────────\n  NEXT:  Secure phone → Chris Kubecka\n  ──────────────────────────────────────────────────────\n\n  ryan@kali:~$ █',
    };

    // ── CSS ─────────────────────────────────────────────────────────────
    function _css() {
        if (_styleEl) return;
        _styleEl = document.createElement('style');
        _styleEl.textContent = `
        @keyframes ls-in      { from{opacity:0}             to{opacity:1} }
        @keyframes ls-out     { from{opacity:1}             to{opacity:0} }
        @keyframes ls-blink   { 0%,100%{opacity:1}  50%{opacity:0} }
        @keyframes ls-scan    { 0%{top:0}  100%{top:100%} }
        @keyframes ls-up      { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }

        .ls-wrap {
            position:absolute;
            left:8.8%; top:8.36%; width:82.4%; height:79.4%;
            border-radius:4px;
            z-index:9600;
            background:#07090f;
            display:flex; flex-direction:column;
            font-family:'Courier New',monospace;
            animation:ls-in 0.3s ease both;
            overflow:hidden;
        }
        .ls-wrap.ls-closing { animation:ls-out 0.25s ease both; }

        /* ── hardware chrome ── */
        .ls-topbar {
            height:26px; min-height:26px; flex-shrink:0;
            background:#0c1320; border-bottom:1px solid #141e30;
            display:flex; align-items:center; padding:0 8px; gap:6px;
            font-size:10px; color:#2a4060; user-select:none;
        }
        .ls-topbar-center { flex:1; text-align:center; font-size:9px; letter-spacing:1px; }
        .ls-winbtn { width:11px; height:11px; border-radius:50%; cursor:pointer; flex-shrink:0; }
        .ls-winbtn.r { background:#cc3333; }
        .ls-winbtn.y { background:#cc8800; }
        .ls-winbtn.g { background:#228833; }

        .ls-tabs {
            height:30px; min-height:30px; flex-shrink:0;
            background:#090e18; border-bottom:1px solid #111a28;
            display:flex; align-items:flex-end; padding:0 4px; gap:2px; overflow-x:auto;
        }
        .ls-tab {
            height:24px; padding:0 11px; border-radius:3px 3px 0 0;
            font-size:10px; color:#2a4060; background:#0c1520;
            border:1px solid #141e2e; border-bottom:none;
            display:flex; align-items:center; gap:4px; cursor:pointer; white-space:nowrap;
        }
        .ls-tab.on { color:#99bbdd; background:#111c2e; border-color:#1e3050; }
        .ls-tab-dot { width:6px; height:6px; border-radius:50%; background:#1a3050; }
        .ls-tab.on .ls-tab-dot { background:#00aaff; }

        /* ── body (sidebar + main) ── */
        .ls-body { flex:1; display:flex; overflow:hidden; min-height:0; }

        .ls-rail {
            width:40px; flex-shrink:0;
            background:#060b12; border-right:1px solid #0d1620;
            display:flex; flex-direction:column; align-items:center;
            padding:8px 0; gap:7px;
        }
        .ls-rail-btn {
            width:26px; height:26px; border-radius:4px;
            background:#0d1a28; display:flex; align-items:center;
            justify-content:center; font-size:13px; cursor:pointer;
            opacity:0.5; transition:opacity 0.15s;
        }
        .ls-rail-btn:hover, .ls-rail-btn.on { opacity:1; background:#162338; }

        .ls-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-height:0; }

        /* ── url bar ── */
        .ls-url {
            height:26px; min-height:26px; flex-shrink:0;
            background:#080c16; border-bottom:1px solid #0f1824;
            display:flex; align-items:center; padding:0 10px; gap:6px;
            font-size:10px; color:#2a4060;
        }
        .ls-url-lock { color:#228833; }
        .ls-url-addr { flex:1; color:#3a5878; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        /* ── ProtonMail ──  */
        .ls-pm { flex:1; display:flex; overflow:hidden; min-height:0; }
        .ls-pm-sidebar {
            width:150px; flex-shrink:0; background:#070b14;
            border-right:1px solid #0e1820; padding:8px 0; overflow-y:auto;
        }
        .ls-pm-sidebar::-webkit-scrollbar{width:3px}
        .ls-pm-sb-item {
            padding:5px 12px; font-size:9px; color:#2a4060; cursor:pointer;
            white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .ls-pm-sb-item.on { color:#5588aa; background:#0d1a2a; }
        .ls-pm-sb-lbl { padding:10px 12px 3px; font-size:7px; letter-spacing:2px; color:#1a2e40; text-transform:uppercase; }
        .ls-pm-list {
            width:260px; flex-shrink:0; background:#090d18;
            border-right:1px solid #0e1820; overflow-y:auto;
        }
        .ls-pm-list::-webkit-scrollbar{width:3px}
        .ls-pm-list-hdr {
            padding:6px 10px; font-size:8px; letter-spacing:2px; color:#1a3040;
            text-transform:uppercase; background:#070b14; border-bottom:1px solid #0e1820;
        }
        .ls-pm-row {
            padding:8px 10px; border-bottom:1px solid #0c1620;
            cursor:pointer; transition:background 0.1s; border-left:3px solid transparent;
        }
        .ls-pm-row:hover { background:#0d1830; }
        .ls-pm-row.on  { background:#0e1c32; border-left-color:#0088cc; }
        .ls-pm-row.new { border-left-color:#004488; }
        .ls-pm-from  { font-size:9px; color:#3a5870; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ls-pm-subj  { font-size:9px; color:#6080a0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ls-pm-row.on .ls-pm-subj, .ls-pm-row.new .ls-pm-subj { color:#99bbdd; font-weight:bold; }
        .ls-pm-prev  { font-size:8px; color:#1e3040; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px; }
        .ls-pm-tag   { display:inline-block; margin-top:3px; padding:1px 5px; border-radius:2px; font-size:7px; letter-spacing:1px; }
        .ls-pm-reading { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#0b1020; }
        .ls-pm-rhdr {
            padding:12px 16px; background:#080d1a;
            border-bottom:1px solid #101a28; flex-shrink:0;
        }
        .ls-pm-rsubj { color:#aaccee; font-size:12px; margin-bottom:4px; }
        .ls-pm-rmeta { color:#2a4060; font-size:8px; line-height:1.7; }
        .ls-pm-rbody {
            flex:1; padding:16px; overflow-y:auto;
            color:#6080a0; font-size:10px; line-height:1.8; white-space:pre-wrap;
        }
        .ls-pm-rbody::-webkit-scrollbar{width:3px}
        .ls-pm-badge {
            display:inline-block; margin-bottom:10px;
            padding:2px 9px; border-radius:2px; font-size:8px; letter-spacing:1px;
        }
        .ls-pm-sent-hdr {
            padding:8px 14px; background:#070c14;
            border-bottom:1px solid #0e1820; font-size:8px;
            letter-spacing:2px; color:#228833; text-transform:uppercase;
        }
        .ls-pm-cards { flex:1; overflow-y:auto; padding:12px 14px; display:flex; flex-direction:column; gap:8px; }
        .ls-pm-cards::-webkit-scrollbar{width:3px}
        .ls-pm-card {
            background:#090e1a; border:1px solid #141e2e; border-radius:3px;
            padding:10px 12px; animation:ls-up 0.3s ease both;
        }
        .ls-pm-card:nth-child(2){animation-delay:0.1s}
        .ls-pm-card:nth-child(3){animation-delay:0.2s}
        .ls-pm-card-hdr { display:flex; justify-content:space-between; margin-bottom:5px; }
        .ls-pm-card-to   { font-size:9px; color:#3a6880; }
        .ls-pm-card-ok   { font-size:8px; color:#228833; }
        .ls-pm-card-subj { font-size:10px; color:#6080a0; margin-bottom:4px; }
        .ls-pm-card-body { font-size:9px; color:#344050; line-height:1.6; white-space:pre-wrap; padding-top:5px; border-top:1px solid #0f1820; }

        /* ── Terminal ── */
        .ls-term {
            flex:1; padding:14px 18px; overflow-y:auto; overflow-x:auto;
            background:#050a0e; color:#a0b8c0;
            font-size:11px; line-height:1.65; white-space:pre;
        }
        .ls-term::-webkit-scrollbar{width:3px}
        .t-ok   { color:#00cc44; }
        .t-warn { color:#ffaa00; }
        .t-red  { color:#ff4444; }
        .t-dim  { color:#2a4050; }
        .t-hi   { color:#ccddee; }
        .t-blink{ animation:ls-blink 1s step-end infinite; }

        /* ── Narrative panel ── */
        .ls-narrative {
            flex-shrink:0; min-height:120px; max-height:30%;
            background:#04060c; border-top:1px solid #0d1520;
            display:flex; flex-direction:column; overflow:hidden;
        }
        .ls-narr-hdr {
            padding:4px 14px;
            background:#060a14; border-bottom:1px solid #0c1520;
            font-size:8px; letter-spacing:2px; color:#1a3040; text-transform:uppercase;
            flex-shrink:0; display:flex; align-items:center; gap:8px;
        }
        .ls-narr-dot { width:5px; height:5px; border-radius:50%; background:#004488; }
        .ls-narr-body { flex:1; padding:10px 16px; overflow-y:auto; overflow-x:hidden; }
        .ls-narr-body::-webkit-scrollbar{width:3px}
        .ls-narr-line { font-size:11px; line-height:1.7; margin-bottom:2px; }
        .ls-narr-speaker { color:#224466; font-size:9px; margin-bottom:1px; letter-spacing:1px; }
        .ls-narr-text { color:#7090a8; white-space:pre-wrap; }
        .ls-narr-text.action { color:#2a4060; font-style:italic; }
        .ls-narr-cursor { display:inline-block; width:7px; background:#00aaff; animation:ls-blink 0.8s step-end infinite; }
        .ls-narr-prompt {
            padding:6px 16px 8px; font-size:9px; color:#1a3050;
            letter-spacing:1px; cursor:pointer; text-align:right;
            animation:ls-in 0.5s ease; flex-shrink:0;
        }
        .ls-narr-prompt:hover { color:#4488aa; }

        /* ── Statusbar ── */
        .ls-status {
            height:18px; min-height:18px; flex-shrink:0;
            background:#060a12; border-top:1px solid #0c1520;
            display:flex; align-items:center; padding:0 10px; gap:12px;
            font-size:8px; color:#1a2a3a; user-select:none;
        }
        .ls-st-ok   { color:#1a4428; }
        .ls-st-warn { color:#664400; }
        .ls-st-r    { margin-left:auto; }

        /* ── Scanline ── */
        .ls-scan-wrap { position:absolute; inset:0; pointer-events:none; z-index:9620; overflow:hidden; }
        .ls-scanlines {
            position:absolute; inset:0;
            background:repeating-linear-gradient(0deg, transparent 0,transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px);
        }
        .ls-scanbeam {
            position:absolute; left:0; right:0; height:60px;
            background:linear-gradient(transparent, rgba(0,180,255,0.025), transparent);
            animation:ls-scan 12s linear infinite;
        }
        `;
        document.head.appendChild(_styleEl);
    }

    // ── ANSI / colour helpers ────────────────────────────────────────────
    function _esc(s) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
    function _colour(s) {
        return _esc(s)
            .replace(/\[OK\]/g,  '<span class="t-ok">[OK]</span>')
            .replace(/\[!\]/g,   '<span class="t-warn">[!]</span>')
            .replace(/\[✓\]/g,  '<span class="t-ok">[✓]</span>')
            .replace(/\[ \]/g,   '<span class="t-dim">[ ]</span>')
            .replace(/⚠ /g,     '<span class="t-warn">⚠ </span>')
            .replace(/(ARMED)/g, '<span class="t-warn">$1</span>')
            .replace(/(CRITICAL)/g,'<span class="t-red">$1</span>')
            .replace(/(ACTIVE|CONNECTED|CONFIRMED|COMPLETE|ANALYSED|SYNCED|READY)/g,'<span class="t-ok">$1</span>')
            .replace(/(PENDING|UNKNOWN|IMMINENT)/g,'<span class="t-warn">$1</span>')
            .replace(/(ZERFALL|Directorate S|FSB)/g,'<span class="t-warn">$1</span>')
            .replace(/(PHASE 3)/g,'<span class="t-red">$1</span>')
            .replace(/(VOLKOV|Dmitri Volkov)/g,'<span class="t-warn">$1</span>')
            .replace(/(ryan㉿kali)/g,'<span class="t-ok">$1</span>')
            .replace(/(┌──|└─)/g,'<span class="t-ok">$1</span>')
            .replace(/(\$ )/g,'<span class="t-ok">$ </span>')
            .replace(/(█)/g,'<span class="t-ok t-blink">█</span>');
    }

    // ── State detection ──────────────────────────────────────────────────
    function _state(game) {
        if (!game) return 'default';
        if (game.getFlag('volkov_investigated'))  return 'done';
        if (game.getFlag('all_allies_contacted')) return 'volkov';
        if (game.getFlag('started_ally_search'))  return 'allies';
        if (game.getFlag('evidence_unlocked'))    return 'evidence';
        return 'default';  // default & email both show terminal + protonmail
    }

    // ── Build main content (ProtonMail or Terminal) ──────────────────────
    function _buildMail(state, activeId) {
        const active = INBOX.find(m => m.id === activeId) || INBOX[2];
        const rows = INBOX.map(m => {
            const isAct = m.id === activeId;
            return `<div class="ls-pm-row ${isAct ? 'on' : 'new'}">
                <div class="ls-pm-from">${_esc(m.from)}</div>
                <div class="ls-pm-subj">${_esc(m.subject)}</div>
                <div class="ls-pm-prev">${_esc(m.preview)}</div>
                ${m.tag ? `<span class="ls-pm-tag" style="background:${m.tagColor}22;color:${m.tagColor};border:1px solid ${m.tagColor}44">${m.tag}</span>` : ''}
            </div>`;
        }).join('');

        const isPgp = active.id === 3;
        const bodyHtml = isPgp
            ? `<span class="ls-pm-badge" style="background:#ffaa0018;color:#ffaa00;border:1px solid #ffaa0044">🔒 PGP ENCRYPTED — END-TO-END</span>\n${_esc(active.body)}`
            : _esc(active.body);

        return `<div class="ls-pm">
            <div class="ls-pm-sidebar">
                <div class="ls-pm-sb-lbl">Mailbox</div>
                <div class="ls-pm-sb-item on">📥 Inbox <span style="color:#ff6644">3</span></div>
                <div class="ls-pm-sb-item">📤 Sent</div>
                <div class="ls-pm-sb-item">📁 Drafts</div>
                <div class="ls-pm-sb-item">🗑 Trash</div>
                <div class="ls-pm-sb-lbl">Labels</div>
                <div class="ls-pm-sb-item" style="color:#224466">■ Project ECHO</div>
                <div class="ls-pm-sb-item">■ Tools</div>
            </div>
            <div class="ls-pm-list">
                <div class="ls-pm-list-hdr">● INBOX — 3 messages</div>
                ${rows}
            </div>
            <div class="ls-pm-reading">
                <div class="ls-pm-rhdr">
                    <div class="ls-pm-rsubj">${_esc(active.subject)}</div>
                    <div class="ls-pm-rmeta">From: ${_esc(active.from)}<br>Date: ${_esc(active.date)}</div>
                </div>
                <div class="ls-pm-rbody">${bodyHtml}</div>
            </div>
        </div>`;
    }

    function _buildSent() {
        const cards = SENT.map(m => `
            <div class="ls-pm-card">
                <div class="ls-pm-card-hdr">
                    <div class="ls-pm-card-to">To: ${_esc(m.to)}</div>
                    <div class="ls-pm-card-ok">${_esc(m.status)}</div>
                </div>
                <div class="ls-pm-card-subj">${_esc(m.subject)}</div>
                <div class="ls-pm-card-body">${_esc(m.body)}</div>
            </div>`).join('');
        return `<div class="ls-pm" style="flex-direction:column">
            <div class="ls-pm-sent-hdr">✓ SENT — 3 encrypted messages dispatched</div>
            <div class="ls-pm-cards">${cards}</div>
        </div>`;
    }

    function _buildTerm(key) {
        return `<div class="ls-term">${_colour(TERMS[key] || TERMS.default)}</div>`;
    }

    // ── Typewriter ───────────────────────────────────────────────────────
    function _narr_start() {
        _nIdx = 0; _done = false;
        _narr_showLine();
    }

    function _narr_showLine() {
        if (_nIdx >= _narrative.length) {
            _narr_finish();
            return;
        }
        const body = document.getElementById('ls-narr-body');
        if (!body) return;

        const line   = _narrative[_nIdx];
        const isAct  = !line.speaker || line.speaker === '';
        const wrap   = document.createElement('div');
        wrap.className = 'ls-narr-line';

        if (line.speaker && !isAct) {
            const sp = document.createElement('div');
            sp.className = 'ls-narr-speaker';
            sp.textContent = '▐ ' + line.speaker.toUpperCase();
            wrap.appendChild(sp);
        }

        const txt  = document.createElement('span');
        txt.className = 'ls-narr-text' + (isAct ? ' action' : '');
        wrap.appendChild(txt);

        const cur  = document.createElement('span');
        cur.className = 'ls-narr-cursor';
        cur.innerHTML = '&nbsp;';
        wrap.appendChild(cur);

        body.appendChild(wrap);
        body.scrollTop = body.scrollHeight;
        _lineEl = txt;
        _cIdx   = 0;

        if (_typeTimer) clearInterval(_typeTimer);
        _typeTimer = setInterval(_narr_tick, 30);
    }

    // Speak a narrative line if it's character dialogue (skip action lines and system text)
    function _speakNarrLine(line) {
        if (!_game || !line) return;
        const spk = (line.speaker || '').trim();
        if (!spk) return;                        // action lines — no speaker → silent
        const txt = (line.text || '').trim();
        if (!txt) return;
        // Skip lines that look like console/system output
        if (/^[\[\u250c\u2514\u2500\$\#\*]/.test(txt)) return;
        if (_game.speakText) _game.speakText(txt, spk);
    }

    function _narr_tick() {
        if (!_lineEl) return;
        const text = _narrative[_nIdx].text;
        if (_cIdx < text.length) {
            _lineEl.textContent += text[_cIdx++];
            const body = document.getElementById('ls-narr-body');
            if (body) body.scrollTop = body.scrollHeight;
        } else {
            clearInterval(_typeTimer); _typeTimer = null;
            // Remove cursor from this line, advance
            const cur = _lineEl.parentNode && _lineEl.parentNode.querySelector('.ls-narr-cursor');
            if (cur) cur.remove();
            _speakNarrLine(_narrative[_nIdx]);   // speak after full line is visible
            _nIdx++;
            setTimeout(_narr_showLine, 380);
        }
    }

    function _narr_skip() {
        // If typing: finish current line instantly (without speaking — user skipped it)
        if (_typeTimer) {
            clearInterval(_typeTimer); _typeTimer = null;
            if (_game && _game.stopSpeech) _game.stopSpeech();
            if (_lineEl && _nIdx < _narrative.length) {
                _lineEl.textContent = _narrative[_nIdx].text;
                const cur = _lineEl.parentNode && _lineEl.parentNode.querySelector('.ls-narr-cursor');
                if (cur) cur.remove();
                _nIdx++;
                setTimeout(_narr_showLine, 120);
            }
            return;
        }
        // If all done and prompt showing: close
        if (_done) {
            _close();
        }
    }

    function _narr_finish() {
        _done = true;
        const pEl = document.getElementById('ls-narr-prompt');
        if (pEl) {
            pEl.textContent = '[ click anywhere or press any key to continue ]';
            pEl.style.display = 'block';
        }
    }

    // ── Biosphere-style ambient audio ────────────────────────────────────
    function _audioCtx() {
        if (_actx) return _actx;
        try { _actx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; }
        return _actx;
    }

    function _startAudio() {
        const ctx = _audioCtx();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        const t = ctx.currentTime;

        // master compressor + output gain
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -24; comp.ratio.value = 4;
        comp.connect(ctx.destination);
        const master = ctx.createGain();
        master.gain.setValueAtTime(0, t);
        master.gain.linearRampToValueAtTime(0.85, t + 6);
        master.connect(comp);
        _anodes.push(master, comp);

        function _n(...nodes) { _anodes.push(...nodes); }

        // ── 1. Deep drone cluster — three slightly detuned sines ──────────
        [[40, 0.038], [40.7, 0.030], [80.2, 0.022]].forEach(([f, g]) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine'; osc.frequency.value = f;
            const lfo = ctx.createOscillator();
            lfo.type = 'sine'; lfo.frequency.value = 0.07 + Math.random() * 0.04;
            const lfoG = ctx.createGain(); lfoG.gain.value = g * 0.3;
            const gainN = ctx.createGain(); gainN.gain.value = g;
            lfo.connect(lfoG); lfoG.connect(gainN.gain);
            osc.connect(gainN); gainN.connect(master);
            osc.start(t); lfo.start(t);
            _n(osc, lfo, lfoG, gainN);
        });

        // ── 2. Arctic wind — filtered noise with slow spectral sweep ──────
        const wBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
        const wd = wBuf.getChannelData(0);
        for (let i = 0; i < wd.length; i++) wd[i] = Math.random() * 2 - 1;
        const wind = ctx.createBufferSource();
        wind.buffer = wBuf; wind.loop = true; wind.start(t);
        const windLp = ctx.createBiquadFilter();
        windLp.type = 'lowpass'; windLp.frequency.value = 160; windLp.Q.value = 0.6;
        // slow sweep: 160 → 520 Hz over 35s, then back
        windLp.frequency.linearRampToValueAtTime(520, t + 35);
        windLp.frequency.linearRampToValueAtTime(160, t + 70);
        windLp.frequency.linearRampToValueAtTime(520, t + 105);
        windLp.frequency.linearRampToValueAtTime(160, t + 140);
        const windBp = ctx.createBiquadFilter();
        windBp.type = 'bandpass'; windBp.frequency.value = 220; windBp.Q.value = 1.8;
        const windG = ctx.createGain(); windG.gain.value = 0.038;
        wind.connect(windLp); windLp.connect(windBp); windBp.connect(windG); windG.connect(master);
        _n(wind, windLp, windBp, windG);

        // ── 3. Atmosphere pad — sawtooth → LP → tremolo ──────────────────
        const pad = ctx.createOscillator();
        pad.type = 'sawtooth'; pad.frequency.value = 110.2;
        const padLp = ctx.createBiquadFilter();
        padLp.type = 'lowpass'; padLp.frequency.value = 320; padLp.Q.value = 2.2;
        // slow LP sweep
        padLp.frequency.linearRampToValueAtTime(700, t + 28);
        padLp.frequency.linearRampToValueAtTime(300, t + 56);
        const padTremoloLfo = ctx.createOscillator();
        padTremoloLfo.type = 'sine'; padTremoloLfo.frequency.value = 0.042;
        const padTrG = ctx.createGain(); padTrG.gain.value = 0.006;
        const padG = ctx.createGain(); padG.gain.value = 0.018;
        padTremoloLfo.connect(padTrG); padTrG.connect(padG.gain);
        pad.connect(padLp); padLp.connect(padG); padG.connect(master);
        pad.start(t); padTremoloLfo.start(t);
        _n(pad, padLp, padTremoloLfo, padTrG, padG);

        // ── 4. Sparse melodic events — D minor pentatonic ─────────────────
        // D3=146.8  F3=174.6  A3=220  C4=261.6  D4=293.7  F4=349.2  A4=440
        const NOTES = [146.8, 174.6, 220, 261.6, 293.7, 349.2];
        function _sparkNote() {
            const ctx2 = _audioCtx();
            if (!ctx2 || !_actx) return;
            const now = ctx2.currentTime;
            const f   = NOTES[Math.floor(Math.random() * NOTES.length)];
            const atk = 2.5 + Math.random() * 1.5;
            const sus = 0.045;
            const rel = 8 + Math.random() * 6;

            const osc = ctx2.createOscillator();
            osc.type = 'sine'; osc.frequency.value = f;
            // slight detune drift
            osc.detune.setValueAtTime(-8, now);
            osc.detune.linearRampToValueAtTime(8, now + atk + rel);

            const env = ctx2.createGain();
            env.gain.setValueAtTime(0, now);
            env.gain.linearRampToValueAtTime(sus, now + atk);
            env.gain.linearRampToValueAtTime(0, now + atk + rel);

            osc.connect(env); env.connect(master);
            osc.start(now); osc.stop(now + atk + rel + 0.1);
            _anodes.push(osc, env);

            // very faint second harmonic
            if (Math.random() > 0.5) {
                const osc2 = ctx2.createOscillator();
                osc2.type = 'sine'; osc2.frequency.value = f * 2;
                const env2 = ctx2.createGain();
                env2.gain.setValueAtTime(0, now);
                env2.gain.linearRampToValueAtTime(sus * 0.18, now + atk * 1.3);
                env2.gain.linearRampToValueAtTime(0, now + atk * 1.3 + rel * 1.4);
                osc2.connect(env2); env2.connect(master);
                osc2.start(now); osc2.stop(now + atk * 1.3 + rel * 1.4 + 0.1);
                _anodes.push(osc2, env2);
            }
        }
        // Schedule sparse notes
        (function _scheduleNote(delay) {
            const id = setTimeout(function() {
                if (!_actx) return;
                _sparkNote();
                _scheduleNote(9000 + Math.random() * 18000);
            }, delay);
            _atimers.push(id);
        }(3000 + Math.random() * 6000));

        // ── 5. Rare high shimmer — D5 or A5 ──────────────────────────────
        const SHIMMER = [587.3, 659.3, 880];
        (function _scheduleShimmer(delay) {
            const id = setTimeout(function() {
                if (!_actx) return;
                const ctx3 = _audioCtx();
                const now  = ctx3.currentTime;
                const f    = SHIMMER[Math.floor(Math.random() * SHIMMER.length)];
                const osc  = ctx3.createOscillator();
                osc.type = 'sine'; osc.frequency.value = f;
                const env = ctx3.createGain();
                env.gain.setValueAtTime(0, now);
                env.gain.linearRampToValueAtTime(0.012, now + 4);
                env.gain.linearRampToValueAtTime(0, now + 4 + 14);
                osc.connect(env); env.connect(master);
                osc.start(now); osc.stop(now + 19);
                _anodes.push(osc, env);
                _scheduleShimmer(28000 + Math.random() * 35000);
            }, delay);
            _atimers.push(id);
        }(15000 + Math.random() * 20000));

        // ── 6. Laptop fan + power hum (subtle, underneath music) ─────────
        const fanBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const fd = fanBuf.getChannelData(0);
        for (let i = 0; i < fd.length; i++) fd[i] = Math.random() * 2 - 1;
        const fan = ctx.createBufferSource(); fan.buffer = fanBuf; fan.loop = true;
        const fanLp = ctx.createBiquadFilter(); fanLp.type = 'lowpass'; fanLp.frequency.value = 440;
        const fanG = ctx.createGain(); fanG.gain.value = 0.015;
        fan.connect(fanLp); fanLp.connect(fanG); fanG.connect(master); fan.start(t);
        const hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 60;
        const humG = ctx.createGain(); humG.gain.value = 0.006;
        hum.connect(humG); humG.connect(master); hum.start(t);
        _n(fan, fanLp, fanG, hum, humG);
    }

    function _stopAudio() {
        _atimers.forEach(id => clearTimeout(id)); _atimers = [];
        if (_actx) {
            const ctx = _actx; _actx = null;
            // fade out
            const master = _anodes[0];
            if (master && master.gain) {
                try { master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5); } catch(e) {}
            }
            setTimeout(() => {
                _anodes.forEach(n => { try { if (n.stop) n.stop(); n.disconnect(); } catch(e) {} });
                _anodes = [];
                try { ctx.close(); } catch(e) {}
            }, 1600);
        } else {
            _anodes.forEach(n => { try { if (n.stop) n.stop(); n.disconnect(); } catch(e) {} });
            _anodes = [];
        }
    }

    // ── Build full overlay DOM ───────────────────────────────────────────
    function _build(game, opts) {
        const st    = _state(game);
        const showMail = (st === 'email' || st === 'default' || st === 'allies');
        const activeId = 3; // always open on the encrypted message

        // tab config
        const tabs = [
            { id:'proton',   label:'ProtonMail', icon:'✉',  active: showMail },
            { id:'term',     label:'Terminal',   icon:'▶',  active: !showMail },
            { id:'shodan',   label:'Shodan',     icon:'🌐', active: false },
            { id:'github',   label:'GitHub',     icon:'◈',  active: false },
        ];
        const tabsHtml = tabs.map(t =>
            `<div class="ls-tab ${t.active ? 'on' : ''}" data-tab="${t.id}">
                <span class="ls-tab-dot"></span>${t.icon} ${t.label}
             </div>`
        ).join('');

        const urlBar  = showMail
            ? `<div class="ls-url"><span class="ls-url-lock">🔒</span><span class="ls-url-addr">mail.proton.me/u/0/inbox</span></div>`
            : '';

        const content = showMail
            ? (st === 'allies' ? _buildSent() : _buildMail(st, activeId))
            : _buildTerm(st);

        const haaN  = Boolean(opts && opts.narrative && opts.narrative.length);
        const narrVisible = haaN ? '' : 'style="display:none"';

        const div   = document.createElement('div');
        div.className = 'ls-wrap ls-overlay';
        div.id = 'ls-overlay-root';
        div.innerHTML = `
            <div class="ls-scan-wrap"><div class="ls-scanlines"></div><div class="ls-scanbeam"></div></div>

            <div class="ls-topbar">
                <div class="ls-winbtn r" id="ls-close-x"></div>
                <div class="ls-winbtn y"></div>
                <div class="ls-winbtn g"></div>
                <div class="ls-topbar-center">ryan@kali — Kali GNU/Linux 2025.4</div>
                <span style="font-size:8px;color:#1a3050">🔒 VPN &nbsp;◉ TOR &nbsp;⏱ DMS 71h</span>
            </div>

            <div class="ls-tabs">${tabsHtml}</div>

            <div class="ls-body">
                <div class="ls-rail">
                    <div class="ls-rail-btn on">📁</div>
                    <div class="ls-rail-btn">▶</div>
                    <div class="ls-rail-btn">🌐</div>
                    <div style="flex:1"></div>
                    <div class="ls-rail-btn" style="opacity:0.2;">⚙</div>
                </div>
                <div class="ls-main">
                    ${urlBar}
                    ${content}
                    <div class="ls-narrative" ${narrVisible}>
                        <div class="ls-narr-hdr"><div class="ls-narr-dot"></div>NARRATIVE</div>
                        <div class="ls-narr-body" id="ls-narr-body"></div>
                        <div class="ls-narr-prompt" id="ls-narr-prompt" style="display:none">
                            [ click anywhere or press any key to continue ]
                        </div>
                    </div>
                </div>
            </div>

            <div class="ls-status">
                <span class="ls-st-ok">● VPN NL</span>
                <span class="ls-st-ok">● TOR 3hop</span>
                <span class="ls-st-warn">⏱ DMS 71h</span>
                <span class="ls-st-r">MON 09 FEB 2026 &nbsp; 09:14</span>
            </div>
        `;
        return div;
    }

    // ── Close with fade ─────────────────────────────────────────────────
    function _close() {
        if (!_el) return;
        if (_typeTimer) { clearInterval(_typeTimer); _typeTimer = null; }
        if (_game && _game.stopSpeech) _game.stopSpeech();
        _el.classList.add('ls-closing');
        const cb = _onComplete; _onComplete = null;
        setTimeout(() => {
            if (_el && _el.parentNode) _el.parentNode.removeChild(_el);
            _el = null;
            _stopAudio();
            if (cb) cb();
        }, 280);
        if (document._lsKey) {
            document.removeEventListener('keydown', document._lsKey);
            delete document._lsKey;
        }
    }

    // ── Public API ───────────────────────────────────────────────────────

    function show(game, opts) {
        // opts: { narrative: [{speaker, text}], onComplete: fn }
        if (_el) return;
        opts = opts || {};
        _game       = game || null;
        _onComplete = opts.onComplete || null;
        _narrative  = opts.narrative  || [];

        _css();
        _el = _build(game, opts);
        (document.getElementById('scene-container') || document.body).appendChild(_el);
        _startAudio();

        // Auto-close in accessibility/movie mode after narrative + 8s reading time
        if (game && game.accessibilityMode) {
            const wait = 4000 + _narrative.reduce((s, l) => s + (l.text || '').length * 32, 0);
            setTimeout(hide, Math.min(wait, 30000));
        }

        // Close button
        const closeX = document.getElementById('ls-close-x');
        if (closeX) closeX.addEventListener('click', e => { e.stopPropagation(); _close(); });

        // Click anywhere (outside close btn) → skip typing or close
        _el.addEventListener('click', function(e) {
            if (e.target === closeX) return;
            _narrative.length ? _narr_skip() : _close();
        });

        // Any key → same
        document._lsKey = function(e) {
            if (e.key === 'Escape' || _done) { _close(); return; }
            _narr_skip();
        };
        document.addEventListener('keydown', document._lsKey);

        // Start typewriter if narrative provided
        if (_narrative.length) {
            _narr_start();
        }
    }

    function hide() { _close(); }

    return { show, hide };

}());

