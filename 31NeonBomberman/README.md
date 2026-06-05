# 💣 Neon Bomberman

A modern neon-inspired Bomberman game built with pure HTML, CSS and JavaScript.

Place bombs, destroy blocks, collect upgrades, defeat enemies and survive in a futuristic cyberpunk arena filled with neon effects and explosive action.

---

# 🎮 Features

- Modern neon visual style
- Destructible blocks
- Chain reaction explosions
- Multiple enemy bots
- Bomb upgrades
- Explosion range upgrades
- Speed upgrades
- Particle effects
- Neon glow effects
- Score system
- High score saving
- Lives system
- Responsive design
- Mobile controls
- Pause system

---

# 🕹️ Gameplay

Your objective is to survive and score as many points as possible.

You can:

- Place bombs
- Destroy blocks
- Defeat enemies
- Collect upgrades
- Improve your abilities

Be careful:

- Your own bombs can hurt you
- Enemies can damage you
- Getting trapped is often fatal

---

# 💣 Bomb System

Bombs explode after a short delay.

Explosion pattern:

```text
    🔥
    🔥
🔥🔥💣🔥🔥
    🔥
    🔥
```

Bombs can:

- Destroy blocks
- Trigger other bombs
- Eliminate enemies
- Damage the player

---

# ⚡ Power-Ups

Destroyed blocks may reveal upgrades.

---

## 💣 Extra Bomb

Increases maximum simultaneous bombs.

Example:

```text
Default: 1 bomb
Upgrade: 2 bombs
Upgrade: 3 bombs
Upgrade: 4 bombs
Upgrade: 5 bombs
```

---

## 🔥 Explosion Power

Increases blast radius.

Example:

```text
Power 2
Power 3
Power 4
Power 5
Power 6
```

Larger explosions destroy more blocks and enemies.

---

## ⚡ Speed Boost

Increases player movement speed.

Benefits:

- Faster escapes
- Better positioning
- Easier navigation

---

# 👾 Enemies

The arena contains roaming enemy bots.

Enemy behavior:

- Random movement
- Direction changes at intersections
- Can be destroyed by explosions

Defeating enemies grants bonus points.

---

# ❤️ Lives System

Players start with:

```text
3 Lives
```

Damage sources:

- Explosions
- Enemy collisions

When hit:

- One life is lost
- Player respawns
- Temporary invincibility activates

Game ends when all lives are lost.

---

# 📈 Scoring

| Action | Points |
|----------|----------|
| Destroy Block | 25 |
| Collect Upgrade | 50 |
| Defeat Enemy | 150 |

Try to beat your personal best score.

---

# 🎨 Visual Features

The game includes:

- Neon walls
- Neon blocks
- Glow effects
- Explosion particles
- Animated bombs
- Animated power-ups
- Cyberpunk color palette
- Modern UI

---

# 🎛️ Controls

## Desktop

| Action | Key |
|----------|----------|
| Move Up | W / ↑ |
| Move Down | S / ↓ |
| Move Left | A / ← |
| Move Right | D / → |
| Place Bomb | SPACE |
| Pause | P |

---

## Mobile

Touch controls:

- Up
- Down
- Left
- Right
- Place Bomb

---

# 📁 Project Structure

```text
NeonBomberman/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

---

# 📄 File Description

## index.html

Contains:

- Main game layout
- HUD
- Start screen
- Mobile controls

---

## style.css

Contains:

- Neon visual design
- Layout system
- Responsive design
- UI styling
- Animations

---

## script.js

Contains:

- Game loop
- Player movement
- Enemy AI
- Bomb system
- Explosion system
- Power-up system
- Particle effects
- Scoring
- Collision detection

---

# 💾 High Score System

The game automatically stores your best score using:

```javascript
localStorage
```

Your high score remains saved after refreshing the page.

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

- Multiple levels
- Boss enemies
- Additional power-ups
- Bomb kick ability
- Remote detonator
- Shield power-up
- Online leaderboard
- Multiplayer mode
- Procedural maps
- Different enemy types
- Sound effects
- Music system

---

# 📚 Educational Value

This project is useful for learning:

- HTML5 Canvas
- JavaScript Game Development
- Collision Detection
- Grid-Based Movement
- AI Movement Logic
- Particle Systems
- State Management
- Browser Storage
- Responsive Design

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

# 💣 Neon Bomberman

Moderní neonová verze klasického Bombermana vytvořená pomocí HTML, CSS a JavaScriptu.

Pokládej bomby, nič bloky, sbírej bonusy, porážej nepřátele a přežij v futuristické neonové aréně.

---

# 🎮 Funkce

- Moderní neonový vzhled
- Ničitelné bloky
- Řetězové exploze
- Nepřátelé
- Vylepšení bomb
- Větší dosah výbuchu
- Zvýšení rychlosti
- Particle efekty
- Glow efekty
- Bodovací systém
- Ukládání rekordů
- Systém životů
- Responzivní design
- Mobilní ovládání
- Pauza

---

# 🕹️ Hratelnost

Cíl hry:

- Pokládat bomby
- Ničit bloky
- Likvidovat nepřátele
- Sbírat bonusy
- Získat co nejvyšší skóre

Pozor:

- Vlastní bomby tě mohou zabít
- Nepřátelé způsobují zranění
- V úzkých chodbách se můžeš snadno uvěznit

---

# 💣 Bombový systém

Bomby po krátké době explodují.

Schéma výbuchu:

```text
    🔥
    🔥
🔥🔥💣🔥🔥
    🔥
    🔥
```

Výbuch může:

- Ničit bloky
- Odpalovat další bomby
- Zabíjet nepřátele
- Zranit hráče

---

# ⚡ Bonusy

Po zničení bloků se mohou objevit bonusy.

---

## 💣 Více bomb

Zvyšuje počet současně položených bomb.

---

## 🔥 Síla výbuchu

Zvětšuje dosah exploze.

---

## ⚡ Rychlost

Zvyšuje rychlost pohybu hráče.

---

# 👾 Nepřátelé

Po mapě se pohybují nepřátelé.

Vlastnosti:

- Náhodný pohyb
- Mění směr na křižovatkách
- Mohou být zničeni bombou

Za jejich zničení získáš body.

---

# ❤️ Životy

Hráč začíná se:

```text
3 životy
```

Po zásahu:

- Ztratí jeden život
- Respawnuje se
- Krátce je nezranitelný

Po ztrátě všech životů hra končí.

---

# 📈 Bodování

| Akce | Body |
|----------|----------|
| Zničený blok | 25 |
| Sebraný bonus | 50 |
| Zabitý nepřítel | 150 |

---

# 🎨 Grafické prvky

- Neonové zdi
- Neonové bloky
- Glow efekty
- Exploze
- Particle efekty
- Animované bomby
- Animované bonusy
- Cyberpunk styl

---

# 🎛️ Ovládání

## PC

| Akce | Klávesa |
|----------|----------|
| Nahoru | W / ↑ |
| Dolů | S / ↓ |
| Doleva | A / ← |
| Doprava | D / → |
| Položit bombu | SPACE |
| Pauza | P |

---

## Mobil

Dotyková tlačítka:

- Nahoru
- Dolů
- Doleva
- Doprava
- Bomba

---

# 📁 Struktura projektu

```text
NeonBomberman/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

---

# 🚀 Spuštění

1. Stáhni projekt
2. Ulož všechny soubory do jedné složky
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

- Více levelů
- Bossové
- Další bonusy
- Kopání bomb
- Dálková detonace
- Štít
- Online žebříček
- Multiplayer
- Generované mapy
- Nové typy nepřátel
- Zvuky
- Hudba

---

# 📚 Výuková hodnota

Projekt je vhodný pro výuku:

- HTML5 Canvas
- Vývoje her v JavaScriptu
- Kolizí
- Pohybu po mřížce
- Jednoduché AI
- Particle systémů
- Stavových automatů
- Local Storage
- Responzivního designu

---

# 📜 Licence

Projekt můžeš volně:

- používat
- upravovat
- rozšiřovat
- studovat
- vylepšovat

pro výukové a portfolio účely.
