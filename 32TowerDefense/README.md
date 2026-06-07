# 🏰 Neon Tower Defense

A modern neon-inspired Tower Defense game built with pure HTML, CSS and JavaScript.

Build laser towers, stop incoming enemy waves, earn money, upgrade your defense and protect your base from increasingly difficult enemies.

This is the **first version (V1)** of the project and serves as the foundation for future features such as additional tower types, bosses, upgrades and multiple maps.

---

# 🎮 Features

- Modern neon visual style
- Wave-based gameplay
- Laser Towers
- Enemy path system
- Enemy health bars
- Money system
- Score system
- High score saving
- Particle effects
- Laser effects
- Boss waves
- Responsive design
- Pause system

---

# 🕹️ Gameplay

Your objective is simple:

- Build towers
- Defeat enemies
- Earn money
- Survive enemy waves
- Protect your base

Enemies follow a predefined path and attempt to reach your base.

Each enemy that reaches the base reduces its health.

If the base reaches 0 HP, the game ends.

---

# 🏰 Tower System

## 🔫 Laser Tower

The first tower available in Version 1.

### Statistics

```text
Cost: $50
Damage: 18
Range: 125
Fire Rate: 42
```

Features:

- Automatically targets enemies
- Attacks the most advanced enemy in range
- Uses neon laser beams
- Generates visual effects

---

# 👾 Enemies

Enemies travel along the path and become stronger with each wave.

### Enemy Properties

```text
HP
Speed
Reward
Path Progress
```

Enemies provide money and score when defeated.

---

# 🤖 Boss Enemies

Every 5th wave contains a boss enemy.

Bosses have:

- Increased HP
- Larger size
- Greater rewards
- Stronger visual effects

Bosses are marked with a red neon color.

---

# 🌊 Wave System

Each wave contains more enemies than the previous one.

Example:

```text
Wave 1 = 11 enemies
Wave 2 = 14 enemies
Wave 3 = 17 enemies
```

Difficulty increases automatically.

---

# 💰 Economy System

Players start with:

```text
$100
```

Destroying enemies grants money.

Money can be used to build additional towers.

---

# ❤️ Base Defense

Starting base health:

```text
20 HP
```

When enemies reach the end of the path:

```text
Base HP decreases
```

Bosses cause greater damage.

Protect your base at all costs.

---

# 📈 Scoring System

Points are awarded for:

| Action | Score |
|----------|----------|
| Enemy Kill | 50 |
| Boss Kill | 250 |

The game automatically saves the best score using:

```javascript
localStorage
```

---

# 🎨 Visual Features

The game includes:

- Neon towers
- Neon paths
- Neon enemies
- Laser beams
- Glow effects
- Particle effects
- Cyberpunk-inspired UI
- Animated visual feedback

---

# 🎛️ Controls

## Desktop

| Action | Control |
|----------|----------|
| Build Tower | Left Mouse Click |
| Pause | P |

---

# 🗺️ Map

The first version contains a single predefined map.

Enemy path:

```text
START
 ↓
 → → → → →
         ↓
 ← ← ← ← ←
 ↓
 → → → → → → BASE
```

Future versions will include multiple maps.

---

# 📁 Project Structure

```text
NeonTowerDefense/
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

- Game layout
- HUD
- Start screen
- Canvas element

---

## style.css

Contains:

- Neon styling
- Layout system
- Responsive design
- Buttons
- UI components

---

## script.js

Contains:

- Game loop
- Enemy system
- Tower system
- Laser attacks
- Wave management
- Scoring
- Particle effects
- Collision logic

---

# 🚀 How To Run

1. Download the project
2. Keep all files in the same folder
3. Open `index.html`
4. Start defending your base

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

# 🔮 Planned Features (V2)

Future updates may include:

## ⚡ Tesla Tower

Chain lightning attacks.

---

## ❄️ Freeze Tower

Slows enemy movement.

---

## 💣 Cannon Tower

Area damage attacks.

---

## 🛡️ Tower Upgrades

Increase:

- Damage
- Range
- Fire rate

---

## 🤖 Advanced Bosses

Unique boss mechanics.

---

## 🗺️ Multiple Maps

Different paths and layouts.

---

## 🏆 Achievements

Unlock rewards by completing challenges.

---

## 🎵 Audio

- Sound effects
- Background music

---

# 📚 Educational Value

This project is useful for learning:

- HTML5 Canvas
- JavaScript Game Development
- Object Management
- Enemy AI Path Following
- Tower Defense Mechanics
- Particle Systems
- Collision Detection
- State Management
- Local Storage
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

# 🏰 Neon Tower Defense

Moderní neonová Tower Defense hra vytvořená pomocí HTML, CSS a JavaScriptu.

Stav laserové věže, zastavuj nepřátelské vlny, vydělávej peníze a braň svou základnu před stále silnějšími protivníky.

Tato verze představuje **první vydání (V1)**, na kterém budou postaveny další funkce a rozšíření.

---

# 🎮 Funkce

- Moderní neonový vzhled
- Systém vln
- Laserové věže
- Cesta nepřátel
- Ukazatel zdraví nepřátel
- Peněžní systém
- Bodovací systém
- Ukládání rekordů
- Particle efekty
- Laser efekty
- Boss vlny
- Responzivní design
- Pauza

---

# 🕹️ Hratelnost

Cíl hry:

- Stavět věže
- Likvidovat nepřátele
- Získávat peníze
- Přežít co nejvíce vln
- Ochránit základnu

Pokud základna přijde o všechny životy, hra končí.

---

# 🏰 Systém věží

## 🔫 Laser Tower

První dostupná věž.

### Statistiky

```text
Cena: 50 $
Poškození: 18
Dosah: 125
Rychlost střelby: 42
```

Věž automaticky vyhledává cíle v dosahu a útočí pomocí laserového paprsku.

---

# 👾 Nepřátelé

Nepřátelé postupují po předem definované cestě.

Mají:

- životy
- rychlost
- odměnu za zničení

Každá další vlna je obtížnější.

---

# 🤖 Bossové

Každá pátá vlna obsahuje bosse.

Boss:

- má více životů
- je větší
- přináší více bodů
- poskytuje vyšší finanční odměnu

---

# 🌊 Systém vln

Počet nepřátel se postupně zvyšuje.

Příklad:

```text
Vlna 1 = 11 nepřátel
Vlna 2 = 14 nepřátel
Vlna 3 = 17 nepřátel
```

---

# 💰 Ekonomika

Začínáš s:

```text
100 $
```

Za zničení nepřátel získáváš další peníze, za které můžeš stavět nové věže.

---

# ❤️ Základna

Počáteční zdraví:

```text
20 HP
```

Když nepřítel projde do cíle:

```text
HP se sníží
```

Bossové způsobují větší poškození.

---

# 📈 Bodování

| Akce | Body |
|----------|----------|
| Zabití nepřítele | 50 |
| Zabití bosse | 250 |

Nejlepší skóre se automaticky ukládá pomocí Local Storage.

---

# 🎨 Grafické prvky

- Neonové věže
- Neonová cesta
- Glow efekty
- Lasery
- Particle efekty
- Moderní cyberpunk vzhled
- Přehledný HUD

---

# 🎛️ Ovládání

## PC

| Akce | Ovládání |
|----------|----------|
| Postavit věž | Levé tlačítko myši |
| Pauza | P |

---

# 🗺️ Mapa

První verze obsahuje jednu pevně definovanou mapu.

Další mapy budou přidány v budoucích verzích.

---

# 📁 Struktura projektu

```text
NeonTowerDefense/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

---

# 🚀 Spuštění

1. Stáhni projekt
2. Ulož všechny soubory do stejné složky
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

# 🔮 Plánované funkce (V2)

- ⚡ Tesla Tower
- ❄️ Freeze Tower
- 💣 Cannon Tower
- 🛡️ Upgrady věží
- 🤖 Silnější bossové
- 🗺️ Více map
- 🏆 Achievementy
- 🎵 Zvuky a hudba

---

# 📚 Výuková hodnota

Projekt je vhodný pro výuku:

- HTML5 Canvas
- Vývoje her v JavaScriptu
- Tower Defense mechanik
- Správy objektů
- Herních smyček
- Particle systémů
- Kolizí
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