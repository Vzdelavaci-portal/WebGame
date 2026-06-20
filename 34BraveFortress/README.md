# Brave Fortress V3

A medieval fantasy castle-defense game built with vanilla HTML, CSS and JavaScript.

Recruit soldiers, develop your fortress and survive increasingly dangerous enemy waves, including necromancers, ogres and dragons.

[Česká dokumentace](README.cs.md)

## Features

- Real-time castle-defense gameplay
- Seven recruitable unit types
- Three-level upgrade system for every unit
- Unique level 3 abilities
- Enemy waves with increasing difficulty
- Ogre and Dragon boss battles
- Necromancers that summon skeletons
- Gold economy and passive income
- Castle, mine and blacksmith upgrades
- Critical hits and particle effects
- Manual and automatic game saving
- Continue from a saved game
- Responsive tabbed interface

## Units

| Unit | Role | Level 3 ability |
| --- | --- | --- |
| Swordsman | Balanced melee fighter | Cleave |
| Archer | Long-range attacker | Burning Arrow |
| Knight | Armored tank | 30% Block |
| Crossbowman | Heavy ranged damage | Piercing Bolt |
| Elite Knight | Front-line elite fighter | Whirlwind |
| Mage | Area damage | Arcane Burst |
| Healer | Restores allied health | Group Heal |

## Controls

| Action | Control |
| --- | --- |
| Recruit or upgrade | Mouse click |
| Switch control panel | Units, Upgrades, Fortress and Menu tabs |
| Pause or continue | `P` or the Menu tab |
| Save progress | Save Game in the Menu tab |

The game automatically saves after every completed wave and when the page is hidden or closed.

## Running Locally

No installation or build process is required.

1. Clone or download the repository.
2. Open `index.html` in a modern web browser.
3. Select **New Game**.

## Project Structure

```text
bravefortres/
├── index.html          # Interface and game controls
├── style.css           # Layout and responsive design
├── script.js           # Game loop, combat and Canvas rendering
├── js/
│   ├── config.js       # Unit, enemy and upgrade configuration
│   ├── storage.js      # High score and saved-game storage
│   └── waves.js        # Wave composition and enemy selection
├── README.md
├── README.cs.md
└── LICENSE
```

## Technical Overview

Brave Fortress uses the Canvas API for rendering and `requestAnimationFrame` for the game loop. Game data is separated from the main logic so new units, enemies and balancing changes can be added through configuration.

Saved games use browser `localStorage` and include:

- Current wave, gold, score and castle health
- Fortress and unit upgrade levels
- Deployed units and active enemies
- Economy and wave progress

Invalid or incompatible saves are ignored safely.

## Technologies

- HTML5
- CSS3
- JavaScript
- Canvas API
- Local Storage

## Roadmap

Version 3 focuses on a complete, stable single-map experience. Possible future additions:

- Additional bosses and unit types
- Multiple maps
- Weather effects
- Music and sound effects
- Achievements

## License

This project is licensed under the [MIT License](LICENSE).
