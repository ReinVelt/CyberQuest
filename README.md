# CyberQuest: Operation ZERFALL

A Sierra-style point-and-click adventure game built with vanilla JavaScript.

## Story

You play as **Ryan Weylant**, a 55-year-old Dutch hacker living in Compascuum, a quiet village near the German border in the Netherlands. What begins as a routine morning intercepting radio signals turns into an international espionage thriller.

When you discover mysterious SSTV transmissions containing encrypted messages, you're drawn into a web of intrigue involving:
- **Eva Weber (E)** - A German intelligence operative gone dark
- **Dmitri Volkov** - A Russian infiltrator with dangerous plans  
- **Operation ZERFALL** - A plot targeting German military R&D
- **Chris Kubecka** - A world-renowned security expert who becomes an ally

## Features

- **Classic Sierra-style gameplay**: Point-and-click adventure mechanics
- **Puzzle system**: ROT1 cipher decryption, frequency tuning, password cracking
- **Inventory management**: Collect and use items to solve puzzles
- **Quest tracking**: Follow the story through multiple chapters
- **Responsive design**: Playable on desktop, tablet, and mobile
- **Save/Load**: Progress is automatically saved to localStorage

## How to Play

1. Open `index.html` in a modern web browser
2. Click "New Game" to start
3. Click on highlighted hotspots to interact with the environment
4. Collect items and solve puzzles to progress
5. Pay attention to dialogue for clues

### Controls

- **Left-click**: Interact with hotspots
- **I key**: Toggle inventory
- **Q key**: Toggle quest log
- **Escape**: Close dialogs/menus

## Technical Stack

- **Engine**: Custom JavaScript game engine (`engine/game.js`)
- **Styling**: CSS3 with CSS variables for theming (`engine/styles.css`)
- **Architecture**: Scene-based modular design

## Project Structure

```
CyberQuest/
├── index.html          # Main entry point
├── README.md           # This file
├── docs/
│   ├── RULES.md        # Development rules (PDCA, responsive design)
│   └── STORY.md        # Full story in 20 parts
├── engine/
│   ├── game.js         # Core game engine
│   └── styles.css      # Responsive styles
└── scenes/
    ├── home/           # Kitchen scene
    │   ├── design.md
    │   └── scene.js
    ├── mancave/        # Tech lab scene
    │   ├── design.md
    │   └── scene.js
    └── garden/         # Backyard scene
        ├── design.md
        └── scene.js
```

## Development

This project follows the PDCA (Plan-Do-Check-Act) cycle approach:

1. **Plan**: Review story and design scenes
2. **Do**: Implement features and puzzles
3. **Check**: Test gameplay and responsiveness
4. **Act**: Refine based on feedback

### Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 480px - 1024px
- **Desktop**: > 1024px

## Credits

- Story inspired by real-world cybersecurity events
- Sierra-style gameplay homage to classic adventure games
- Character "Chris Kubecka" used with admiration for real security expert

## License

Educational/Personal Use

---

*"The frequency was 243 MHz - the international distress signal. But this was no ordinary distress call..."*
