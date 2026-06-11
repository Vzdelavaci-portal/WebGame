# 🏹 Neon Dungeon V2

A neon-inspired dungeon crawler built with pure HTML, CSS and JavaScript.

Fight through dangerous rooms, defeat enemies, collect coins, unlock upgrades and survive as long as possible.

Version 2 introduces room layouts, walls, collision detection and a shop system between rooms.

---

# 🎮 Features

## ⚔️ Action Combat

- WASD movement
- Mouse aiming
- Click to shoot
- Fast arcade gameplay

---

## 🏰 Dungeon Rooms

Each room contains:

- Enemies
- Walls
- Obstacles
- Loot

Every room uses a different layout.

Examples:

```text
Cross Chamber
Pillar Hall
Neon Maze
Split Core
```

---

## 🧱 Wall Collision System

Version 2 introduces real collision detection.

### Player

Cannot walk through walls.

### Enemies

Must move around obstacles.

### Bullets

Projectiles stop when hitting walls.

This makes the dungeon feel much more tactical.

---

# 👾 Enemy Types

## 🟢 Slime

Basic enemy.

```text
Medium HP
Medium Speed
```

---

## 🔵 Fast Bot

Fast attacker.

```text
Low HP
High Speed
```

---

## 🟣 Tank

Heavy enemy.

```text
Very High HP
Slow Speed
```

---

## 🔴 Shooter

Ranged enemy.

```text
Shoots projectiles
Keeps distance
Uses line-of-sight
```

---

# 🔫 Weapons

## Neon Blaster

Starting weapon.

```text
Single projectile
Balanced damage
```

---

## Triple Shot

Unlockable upgrade.

```text
3 projectiles
Wider spread
Higher damage output
```

---

# 💰 Coin System

Enemies drop coins.

Coins can be spent between rooms.

```text
Kill enemies
Collect loot
Buy upgrades
```

---

# 🛒 Upgrade Shop

After clearing a room, a shop appears.

Available upgrades:

---

## 💥 Damage +5

Increase weapon damage permanently.

---

## ⚡ Faster Fire Rate

Shoot more often.

---

## ❤️ Max HP +20

Increase maximum health.

---

## 🔱 Triple Shot

Unlock a three-projectile weapon.

---

# ❤️ Health System

Player starts with:

```text
100 HP
```

Health can be restored through:

- Healing loot
- Shop upgrades

---

# 🎁 Loot Drops

Enemies can drop rewards.

---

## 💰 Coins

Extra currency.

---

## ❤️ Heal

Restore health.

---

## ⚡ Speed Boost

Temporary movement boost.

---

## 💥 Damage Boost

Temporary damage increase.

---

# 🌊 Progression

Each cleared room:

```text
More enemies
Higher difficulty
More rewards
```

Example:

```text
Room 1
Room 2
Room 3
Room 4
...
```

---

# 📈 Score System

Score is calculated from:

```text
Kills
Coins
Rooms Cleared
```

Best score is automatically saved using:

```javascript
localStorage
```

---

# ✨ Visual Effects

The game includes:

- Neon glow effects
- Particle explosions
- Floating combat text
- Weapon flashes
- Screen shake
- Animated pickups

Inspired by:

```text
Cyberpunk
Tron
Arcade Shooters
```

---

# 🎛️ Controls

| Action | Key |
|----------|----------|
| Move Up | W |
| Move Down | S |
| Move Left | A |
| Move Right | D |
| Shoot | Left Mouse Button |
| Aim | Mouse |
| Pause | P |

Arrow keys are also supported.

---

# 📁 Project Structure

```text
NeonDungeon_v2/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

---

# 📄 File Overview

## index.html

Contains:

- Layout
- HUD
- Overlay screens
- Shop UI

---

## style.css

Contains:

- Neon styling
- Responsive layout
- Shop design
- HUD styling

---

## script.js

Contains:

- Game loop
- Dungeon generation
- Wall collision
- Enemy AI
- Loot system
- Upgrade shop
- Particle effects
- Score system

---

# 🚀 How To Run

1. Download project
2. Keep files in the same folder
3. Open:

```text
index.html
```

4. Play

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

# 🔮 Planned Features (V3)

## 🤖 Boss Rooms

Every few rooms:

```text
Boss Fight
```

Examples:

- Neon Golem
- Cyber Spider
- Plasma Guardian

---

## 🗡️ More Weapons

- Laser Rifle
- Plasma Cannon
- Rocket Launcher
- Beam Weapon

---

## 🎒 Inventory System

Collect and store upgrades.

---

## 🧰 Equipment

- Armor
- Shields
- Passive bonuses

---

## 🗺️ Procedural Dungeons

Randomly generated rooms.

---

## 🏪 Advanced Shop

More upgrade choices.

---

## 🧪 Special Abilities

- Dash
- Shield
- Freeze Blast
- Chain Lightning

---

## 👑 Boss Rewards

Unique weapon unlocks.

---

# 📚 Educational Value

This project demonstrates:

- JavaScript Game Development
- HTML5 Canvas
- Collision Detection
- Enemy AI
- State Management
- Upgrade Systems
- Procedural Design Concepts
- Particle Effects
- UI Development

---

# 🎯 Learning Topics

Developers can learn:

- Real-time game loops
- Mouse aiming systems
- Projectile mechanics
- Dungeon room systems
- Loot systems
- Upgrade systems
- Local storage usage
- Responsive game design

---

# 📜 License

You are free to:

- Use
- Modify
- Learn from
- Extend
- Improve

this project for educational and portfolio purposes.

---

# 🏹 Neon Dungeon V2

Procházej neonovým dungeonem, porážej nepřátele, sbírej mince a nakupuj vylepšení mezi místnostmi.

Verze 2 přidává:

✅ zdi a překážky  
✅ kolize se zdmi  
✅ obchod mezi místnostmi  
✅ vylepšování postavy  
✅ novou zbraň Triple Shot

---

# 🎮 Hlavní funkce

- Pohyb WASD
- Míření myší
- Střelba
- Loot systém
- Shop systém
- Více typů nepřátel
- Neon efekty
- Ukládání rekordu

---

# 🛒 Obchod

Po vyčištění místnosti může hráč nakoupit:

- Damage
- Fire Rate
- Max HP
- Triple Shot

---

# 👾 Nepřátelé

- Slime
- Fast Bot
- Tank
- Shooter

Každý má jiné statistiky a chování.

---

# 🧱 Kolize

Verze 2 obsahuje:

- kolize hráče se zdmi
- kolize nepřátel se zdmi
- zastavení střel o překážky

---

# 🔮 Plány do budoucna

- Bossové
- Další zbraně
- Inventář
- Brnění
- Procedurální dungeon
- Schopnosti
- Achievementy
- Ukládání postupu

---

🏹 Explore deeper.
⚡ Upgrade your gear.
👾 Survive the neon dungeon.