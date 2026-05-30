# 👾 Neon Pacman

A modern neon-inspired Pacman game built with pure HTML, CSS and JavaScript.

Navigate through a glowing maze, collect dots, avoid ghosts, use power-ups and survive as long as possible.

This project combines classic Pacman gameplay with a futuristic cyberpunk visual style and modern browser-based game mechanics.

---

# 🎮 Features

- Modern neon visual style
- Smooth Pacman movement
- Multiple ghost enemies
- Ghost AI behaviors
- Power Mode (eat ghosts)
- Speed Boost power-up
- Shield power-up
- Freeze Ghosts power-up
- Particle effects
- Animated ghosts
- Animated Pacman
- Local high score saving
- Pause system
- Mobile controls
- Level progression
- Responsive design

---

# 🕹️ Gameplay

The objective is simple:

- Collect all dots in the maze
- Avoid ghost collisions
- Use power-ups strategically
- Clear levels to advance
- Beat your highest score

Each level becomes slightly more challenging as ghost speed increases.

---

# 👻 Ghost Types

The game includes multiple ghost types:

### 🔴 Red Ghost
Aggressively chases the player.

### 🔵 Blue Ghost
Moves randomly through the maze.

### 🟢 Green Ghost
Attempts to predict the player's movement.

### 🟣 Purple Ghost
Uses wandering behavior.

---

# ⚡ Power-Ups

Random power-ups appear during gameplay.

## ⚡ Speed Boost

Temporarily increases Pacman's movement speed.

Benefits:

- Faster movement
- Easier escapes
- Faster dot collection

---

## 🛡️ Shield

Protects the player from one ghost collision.

Benefits:

- Absorbs one hit
- Great for risky situations

---

## ❄️ Freeze

Temporarily freezes all ghosts.

Benefits:

- Safe dot collection
- Easy escape opportunities

---

# 🟡 Power Dots

Large yellow dots activate:

## Power Mode

During Power Mode:

- Ghosts become vulnerable
- Ghosts turn blue
- Pacman can eat ghosts
- Bonus points are awarded

---

# 📈 Scoring

| Action | Points |
|----------|----------|
| Small Dot | 10 |
| Power Dot | 50 |
| Eat Ghost | 200 |

---

# ❤️ Lives System

Players start with:

```text
3 Lives
```

When hit by a ghost:

- One life is lost
- Player respawns
- Temporary invincibility activates

Game ends when all lives are lost.

---

# 🎨 Visual Features

The game uses a modern neon aesthetic:

- Neon maze walls
- Glow effects
- Particle explosions
- Animated ghosts
- Animated Pacman mouth
- Cyberpunk-inspired colors
- Modern UI elements

---

# ⌨️ Controls

## Desktop

| Action | Key |
|----------|----------|
| Move Up | W / Arrow Up |
| Move Down | S / Arrow Down |
| Move Left | A / Arrow Left |
| Move Right | D / Arrow Right |
| Pause | P |

---

## Mobile

Touch controls are automatically displayed on smaller devices.

- Up
- Down
- Left
- Right
- Pause

---

# 📁 Project Structure

```text
NeonPacman/
│
├── index.html
├── style.css
└── script.js
```

---

# 📄 File Description

## index.html

Contains:

- Main layout
- Canvas element
- HUD
- Start screen
- Mobile controls

---

## style.css

Contains:

- Neon design
- Responsive layout
- Animations
- UI styling
- Mobile support

---

## script.js

Contains:

- Game loop
- Pacman movement
- Ghost AI
- Collision system
- Power-up system
- Particle effects
- Scoring system
- Local storage support

---

# 💾 High Score System

The game automatically saves the best score using:

```javascript
localStorage
```

Your high score remains available after refreshing the page.

---

# 🚀 How To Run

1. Download the project files
2. Place all files in the same folder
3. Open `index.html`
4. Start playing

No installation required.

No frameworks required.

No server required.

---

# 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript
- Canvas API
- Local Storage

---

# 💡 Future Ideas

Possible future improvements:

- Additional maze layouts
- More ghost personalities
- Boss ghosts
- Teleport tunnels
- Fruit bonuses
- Sound effects
- Music system
- Achievement system
- Difficulty settings
- Ghost house system
- Online leaderboard
- Multiplayer mode
- Custom skins
- Endless mode

---

# 📚 Educational Value

This project is useful for learning:

- HTML5 Canvas
- JavaScript Game Development
- Pathfinding Basics
- Collision Detection
- State Management
- Particle Systems
- Responsive Design
- Browser Storage
- Animation Loops

---

# 📜 License

You are free to:

- Use
- Modify
- Extend
- Learn from
- Improve

this project for educational and portfolio purposes.

---

---

# 👾 Neon Pacman

Moderní Pacman hra vytvořená pomocí HTML, CSS a JavaScriptu s futuristickým neonovým vzhledem.

Procházej svítícím bludištěm, sbírej tečky, vyhýbej se duchům a využívej speciální bonusy.

Projekt kombinuje klasický Pacman gameplay s moderním cyberpunk stylem.

---

# 🎮 Funkce

- Moderní neonový vzhled
- Plynulý pohyb Pacmana
- Více druhů duchů
- Jednoduchá AI duchů
- Power Mode
- Speed Boost
- Shield
- Freeze Ghosts
- Particle efekty
- Animovaní duchové
- Animovaný Pacman
- Ukládání rekordu
- Pauza
- Mobilní ovládání
- Level systém
- Responzivní design

---

# 🕹️ Hratelnost

Cíl hry:

- Posbírat všechny tečky
- Vyhnout se duchům
- Využívat bonusy
- Dokončovat levely
- Překonat svůj rekord

S každým levelem se hra mírně zrychluje.

---

# 👻 Druhy duchů

### 🔴 Červený duch
Pronásleduje hráče.

### 🔵 Modrý duch
Pohybuje se náhodně.

### 🟢 Zelený duch
Snaží se předvídat pohyb hráče.

### 🟣 Fialový duch
Používá náhodné bloudění.

---

# ⚡ Bonusy

## ⚡ Speed Boost

Dočasně zvýší rychlost Pacmana.

---

## 🛡️ Shield

Ochrání před jedním zásahem.

---

## ❄️ Freeze

Na chvíli zastaví všechny duchy.

---

# 🟡 Velké tečky

Po sebrání velké tečky se aktivuje:

## Power Mode

Během něj:

- Duchové jsou zranitelní
- Zmodrají
- Lze je sníst
- Přinášejí bonusové body

---

# 📈 Bodování

| Akce | Body |
|----------|----------|
| Malá tečka | 10 |
| Velká tečka | 50 |
| Duch | 200 |

---

# ❤️ Životy

Hráč začíná se:

```text
3 životy
```

Po zásahu:

- Ztratí jeden život
- Respawnuje se
- Aktivuje se krátká nesmrtelnost

Hra končí po ztrátě všech životů.

---

# 🎨 Grafika

- Neonové stěny
- Glow efekty
- Particle efekty
- Animace duchů
- Animace Pacmana
- Cyberpunk barvy
- Moderní HUD

---

# ⌨️ Ovládání

## PC

| Akce | Klávesa |
|----------|----------|
| Nahoru | W / Šipka nahoru |
| Dolů | S / Šipka dolů |
| Doleva | A / Šipka doleva |
| Doprava | D / Šipka doprava |
| Pauza | P |

---

## Mobil

Automaticky se zobrazí dotykové ovládání.

---

# 📁 Struktura projektu

```text
NeonPacman/
│
├── index.html
├── style.css
└── script.js
```

---

# 🚀 Spuštění

1. Stáhni soubory
2. Ulož je do jedné složky
3. Otevři `index.html`
4. Hraj

Není potřeba:

- instalace
- framework
- server

---

# 🛠️ Použité technologie

- HTML5
- CSS3
- JavaScript
- Canvas API
- Local Storage

---

# 💡 Možná rozšíření

- Další mapy
- Více typů duchů
- Bossové
- Teleporty
- Ovoce a bonusy
- Zvuky
- Hudba
- Achievement systém
- Obtížnosti
- Online žebříček
- Multiplayer
- Skiny
- Endless režim

---

# 📚 Výuková hodnota

Projekt je vhodný pro výuku:

- Canvas API
- JavaScript her
- Detekce kolizí
- Stavových automatů
- Particle systémů
- Responzivního designu
- Local Storage
- Herních smyček

---

# 📜 Licence

Projekt můžeš volně:

- používat
- upravovat
- rozšiřovat
- studovat
- vylepšovat

pro výukové a portfolio účely.