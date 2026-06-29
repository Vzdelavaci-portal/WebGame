# Brave Fortress V5

A medieval fantasy castle-defense game built with vanilla HTML, CSS and JavaScript.

Recruit soldiers, develop your fortress and survive increasingly dangerous enemy waves, including map-specific enemies and regional bosses.

[Česká dokumentace](README.cs.md)

## Features

- Real-time castle-defense gameplay
- Seven recruitable unit types
- Three-level upgrade system for every unit
- Unique level 3 abilities
- Enemy waves with increasing difficulty
- Regional boss battles
- Map-specific enemies
- Player profile with achievements
- Necromancers that summon skeletons
- Gold economy and passive income
- Castle, mine and blacksmith upgrades
- Critical hits and particle effects
- Manual and automatic game saving
- Continue from a saved game
- Responsive tabbed interface
- Three playable regions with unique rules
- Easy, Normal and Hard difficulty
- Persistent region unlock progression

## Version 5 Campaign

| Region | Rule | Unique enemy | Boss |
| --- | --- | --- | --- |
| Green Valley | Increased passive income | Bandit | Forest Ancient |
| Frozen Kingdom | Both armies are slower, with a larger penalty for enemies | Ice Wraith | Frost Giant |
| Volcanic Lands | Better income, faster enemies and periodic castle damage | Lava Golem | Fire Demon |

Green Valley is available immediately. Defeating the wave 10 regional boss completes the region and unlocks the next one. Region unlocks, defeated bosses and achievements are stored in a persistent player profile.

## Player Profile and Achievements

The profile tracks completed regions, defeated bosses and unlocked achievements. Current achievements cover first kill, reaching wave 5, defeating each regional boss, recruiting the full roster, upgrading a unit to level 3 and winning on Hard difficulty.

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
| View profile | Profile in the Menu tab |

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
│   ├── maps.js         # Regions, difficulty and environmental rules
│   ├── bosses.js       # Regional boss metadata
│   ├── achievements.js # Achievement definitions
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
- Selected region and difficulty
- Fortress and unit upgrade levels
- Deployed units and active enemies
- Economy and wave progress

Invalid or incompatible saves are ignored safely.

Region unlocks are stored separately from the current campaign, so losing or starting a new game does not reset progression.

The player profile stores completed regions, defeated bosses and unlocked achievements.

## Technologies

- HTML5
- CSS3
- JavaScript
- Canvas API
- Local Storage

## Roadmap

Version 5 adds regional bosses, map-specific enemies, achievements and the player profile. Possible future additions:

- Additional regions and unit types
- Weather effects
- Music and sound effects
- More advanced boss abilities

## License

This project is licensed under the [MIT License](LICENSE).
