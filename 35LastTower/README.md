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
- Každá 5. vlna je boss vlna s jedním z více boss typů.
- Po poražení bosse si vybereš jeden ze tří náhodných perků.
- Některé perky mění typ střel na oheň, led nebo blesk.
- Panel pod arénou ukazuje náhled aktuální vlny.
- Meteor slouží jako silná schopnost s cooldownem.
- Hru můžeš pozastavit tlačítkem nebo mezerníkem.
- Hra ukládá nejlepší dosaženou vlnu do `localStorage`.

### Funkce ve verzi 3

- Centrální věž a nepřátelé útočící ze všech stran.
- Vlny nepřátel se zvyšující se obtížností.
- Speciální nepřátelé: běžec, štítonoš, léčitel a dělič.
- Více typů bossů: obr, vyvolávač a štítový boss.
- Elementální střely přes perky: oheň, led a blesk.
- Oheň způsobuje damage over time.
- Led zpomaluje nepřátele.
- Blesk přeskočí na blízkého nepřítele.
- Boss perky po každé 5. vlně.
- Wave preview s typy nepřátel a odměnou.
- Vylepšení s úrovněmi: damage, kadence, dosah a oprava.
- Meteor schopnost s cooldownem.
- Pauza přes tlačítko nebo mezerník.
- High score pro nejlepší vlnu.
- Game-over statistiky: vlna, zabití, bossové, zlato, střely a vybrané perky.
- Přepínání jazyka CZ / EN.
- Restart hry bez obnovy stránky.

### Soubory

- `index.html` - struktura stránky a herní UI.
- `style.css` - vzhled hry, responzivní layout, wave preview a perk overlay.
- `script.js` - herní smyčka, logika vln, bossové, perky, nepřátelé, elementální střely, upgrady a překlady.

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
- Every 5th wave is a boss wave with one of several boss types.
- After defeating a boss, choose one of three random perks.
- Some perks switch shots to fire, ice, or lightning.
- The panel below the arena previews the current wave.
- Meteor is a strong ability with a cooldown.
- The game can be paused with the button or the spacebar.
- The best reached wave is stored in `localStorage`.

### Version 3 Features

- Central tower with enemies attacking from all sides.
- Enemy waves with increasing difficulty.
- Special enemies: runner, shield, healer, and splitter.
- Multiple boss types: giant, summoner, and shield boss.
- Elemental shots through perks: fire, ice, and lightning.
- Fire deals damage over time.
- Ice slows enemies.
- Lightning chains to a nearby enemy.
- Boss perks after every 5th wave.
- Wave preview with enemy types and reward.
- Upgrades with levels: damage, fire rate, range, and repair.
- Meteor ability with cooldown.
- Pause button and spacebar pause.
- High score for the best wave.
- Game-over stats: wave, kills, bosses, gold, shot type, and selected perks.
- CZ / EN language switching.
- Restart without refreshing the page.

### Files

- `index.html` - page structure and game UI.
- `style.css` - game visuals, responsive layout, wave preview, and perk overlay.
- `script.js` - game loop, wave logic, bosses, perks, enemies, elemental shots, upgrades, and translations.
