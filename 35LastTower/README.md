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
- Každá 5. vlna je boss vlna.
- Po poražení bosse si vybereš jeden ze tří náhodných perků.
- Meteor slouží jako silná schopnost s cooldownem.
- Hru můžeš pozastavit tlačítkem nebo mezerníkem.
- Hra ukládá nejlepší dosaženou vlnu do `localStorage`.

### Funkce ve verzi 2

- Centrální věž a nepřátelé útočící ze všech stran.
- Vlny nepřátel se zvyšující se obtížností.
- Boss každou 5. vlnu.
- Perky po poražení bosse.
- Tři základní typy nepřátel: rychlý, základní a odolný.
- Automatická střelba věže.
- Vylepšení s úrovněmi: damage, kadence, dosah a oprava.
- Meteor schopnost s cooldownem.
- Pauza přes tlačítko nebo mezerník.
- High score pro nejlepší vlnu.
- Přepínání jazyka CZ / EN.
- Statistiky: vlna, zlato, HP, útok a nejlepší vlna.
- Restart hry bez obnovy stránky.

### Soubory

- `index.html` - struktura stránky a herní UI.
- `style.css` - vzhled hry, responzivní layout a perk overlay.
- `script.js` - herní smyčka, logika vln, bossové, perky, nepřátelé, střelba, upgrady a překlady.

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
- Every 5th wave is a boss wave.
- After defeating a boss, choose one of three random perks.
- Meteor is a strong ability with a cooldown.
- The game can be paused with the button or the spacebar.
- The best reached wave is stored in `localStorage`.

### Version 2 Features

- Central tower with enemies attacking from all sides.
- Enemy waves with increasing difficulty.
- Boss every 5th wave.
- Perks after defeating a boss.
- Three base enemy types: basic, fast, and durable.
- Automatic tower shooting.
- Upgrades with levels: damage, fire rate, range, and repair.
- Meteor ability with cooldown.
- Pause button and spacebar pause.
- High score for the best wave.
- CZ / EN language switching.
- Stats: wave, gold, HP, attack, and best wave.
- Restart without refreshing the page.

### Files

- `index.html` - page structure and game UI.
- `style.css` - game visuals, responsive layout, and perk overlay.
- `script.js` - game loop, wave logic, bosses, perks, enemies, shooting, upgrades, and translations.
