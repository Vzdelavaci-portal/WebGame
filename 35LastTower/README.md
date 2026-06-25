# Last Tower

## Česky

**Last Tower** je malá browserová tower-defense hra ve stylu temné arény. Hráč brání poslední věž uprostřed mapy před nepřáteli, kteří přicházejí ze všech stran.

### Spuštění

Otevři soubor `index.html` v prohlížeči.

Hra nepoužívá žádné externí knihovny ani build krok. Stačí běžný moderní prohlížeč.

### Jak se hraje

- Nepřátelé se spawnují na okrajích arény a postupují k věži.
- Věž automaticky střílí na nejbližšího nepřítele v dosahu.
- Za zničené nepřátele získáváš zlato.
- Zlato můžeš utratit za vylepšení útoku, kadence, dosahu nebo opravu věže.
- Meteor slouží jako silná schopnost s cooldownem.
- Hra končí, když HP věže klesne na nulu.

### Funkce ve verzi 1

- Centrální věž a nepřátelé útočící ze všech stran.
- Vlny nepřátel se zvyšující se obtížností.
- Tři typy nepřátel: rychlý, základní a odolný.
- Automatická střelba věže.
- Vylepšení: damage, kadence, dosah a oprava.
- Meteor schopnost s cooldownem.
- Přepínání jazyka CZ / EN.
- Statistiky: vlna, zlato, HP a útok.
- Restart hry bez obnovy stránky.

### Soubory

- `index.html` - struktura stránky a herní UI.
- `style.css` - vzhled hry a responzivní layout.
- `script.js` - herní smyčka, logika vln, nepřátelé, střelba, upgrady a překlady.

---

## English

**Last Tower** is a small browser tower-defense game with a dark arena style. The player defends the last tower in the center of the map from enemies approaching from every side.

### Run

Open `index.html` in a browser.

The game does not use external libraries or a build step. A modern browser is enough.

### How to Play

- Enemies spawn around the arena edges and move toward the tower.
- The tower automatically shoots the nearest enemy within range.
- Destroyed enemies reward gold.
- Gold can be spent on attack damage, fire rate, range, or tower repair.
- Meteor is a strong ability with a cooldown.
- The game ends when the tower HP reaches zero.

### Version 1 Features

- Central tower with enemies attacking from all sides.
- Enemy waves with increasing difficulty.
- Three enemy types: basic, fast, and durable.
- Automatic tower shooting.
- Upgrades: damage, fire rate, range, and repair.
- Meteor ability with cooldown.
- CZ / EN language switching.
- Stats: wave, gold, HP, and attack.
- Restart without refreshing the page.

### Files

- `index.html` - page structure and game UI.
- `style.css` - game visuals and responsive layout.
- `script.js` - game loop, wave logic, enemies, shooting, upgrades, and translations.
