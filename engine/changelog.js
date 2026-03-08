/**
 * CyberQuest — Changelog
 * Edit this file to add new version entries.
 * Each entry: { version, date, highlight (bool), items: [string] }
 */
const CYBERQUEST_CHANGELOG = [
    {
        version: 'v0.6.0-alpha',
        date: '2026-03-08',
        highlight: true,
        items: [
            'First public pre-release',
            'About dialog redesigned with cover art, author, copyright and license sections',
            'Dynamic changelog rendered from engine/changelog.js',
            'Overlay SVGs extracted to assets/overlays/ for reuse across scenes',
            'TV news signal disruption segments (early / mid game)',
            'Ryan post-documentary dialogue now correctly gates on tv_news_watched flag',
            'SSTV terminal house image hidden until sstv_transmission_received is set',
            'SDR bench no longer replays discovery sequence after first decode',
            'Autosave now fires after onEnter() so all scene flags are captured',
        ],
    },
    {
        version: 'v0.5.0',
        date: '2026-03-06',
        highlight: false,
        items: [
            'Dedicated SSTV Terminal scene with custom SVG (green-phosphor CRT, waterfall display)',
            'Full movie / accessibility mode flow audit — Dwingeloo, Westerbork, LOFAR, ASTRON ordering fixed',
            '💡 Hint button + H-key shortcut with full story-progression hint table',
            '▶ Autoplay debug mode with 8–12 s step delay',
            'Morning coffee ritual every day after bedroom wake',
            'Bedroom scene with sleep mechanic and auto wake-up timer',
        ],
    },
    {
        version: 'v0.4.0',
        date: '2026-02-28',
        highlight: false,
        items: [
            'Laser corridor: auto-solve all 3 puzzles in movie mode',
            'ASTRON: auto-solve equipment puzzle, Cees revisit for astron_complete',
            'Hackerspace NPCs: one-shot met flags, accessibilityRetries to stop retry loops',
            'Klooster accessibilityPath covers all hotspots before driving away',
        ],
    },
    {
        version: 'v0.3.0',
        date: '2026-02-15',
        highlight: false,
        items: [
            'Dwingeloo, Westerbork Memorial, LOFAR Superterp scenes',
            'Facility infiltration: badge clone, laser corridor, server room',
            'EVA Weber contact and ally recruitment system',
        ],
    },
    {
        version: 'v0.2.0',
        date: '2026-01-20',
        highlight: false,
        items: [
            'SDR bench, secure phone, airgapped laptop scenes',
            'USB discovery and evidence viewer',
            'Mancave cinematic modules (forensic analysis, Volkov investigation)',
        ],
    },
    {
        version: 'v0.1.0',
        date: '2025-12-01',
        highlight: false,
        items: [
            'Initial release — intro, home, livingroom, mancave, SSTV terminal',
            'Core engine: dialogue, inventory, scene transitions, voice TTS',
        ],
    },
];
