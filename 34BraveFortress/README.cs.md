# Brave Fortress V5

Středověká fantasy hra na obranu hradu vytvořená v čistém HTML, CSS a JavaScriptu.

Najímej vojáky, rozvíjej pevnost a přežij stále nebezpečnější vlny nepřátel včetně mapových nepřátel a regionálních bossů.

[English documentation](README.md)

## Hlavní funkce

- Obrana hradu v reálném čase
- Sedm typů jednotek
- Tři úrovně vylepšení každé jednotky
- Unikátní schopnosti na třetí úrovni
- Postupně obtížnější nepřátelské vlny
- Souboje s regionálními bossy
- Unikátní nepřátelé pro jednotlivé oblasti
- Profil hráče s achievementy
- Nekromanti vyvolávající skeletony
- Ekonomika a pasivní příjem zlata
- Vylepšení hradu, dolu a kovárny
- Kritické zásahy a částicové efekty
- Ruční a automatické ukládání
- Pokračování v uložené hře
- Responzivní ovládání pomocí záložek
- Tři hratelné oblasti s vlastními pravidly
- Obtížnosti Easy, Normal a Hard
- Trvalé odemykání oblastí

## Kampaň Verze 5

| Oblast | Pravidlo | Unikátní nepřítel | Boss |
| --- | --- | --- | --- |
| Green Valley | Vyšší pasivní příjem | Bandit | Forest Ancient |
| Frozen Kingdom | Obě armády jsou pomalejší, nepřátelé výrazněji | Ice Wraith | Frost Giant |
| Volcanic Lands | Vyšší příjem, rychlejší nepřátelé a periodické poškození hradu | Lava Golem | Fire Demon |

Green Valley je dostupná okamžitě. Poražení regionálního bosse v 10. vlně dokončí oblast a odemkne další. Odemčené oblasti, poražení bossové a achievementy se ukládají do trvalého profilu.

## Profil hráče a achievementy

Profil sleduje dokončené oblasti, poražené bossy a odemčené achievementy. Aktuální achievementy pokrývají první zabití, dosažení 5. vlny, poražení každého regionálního bosse, nabrání všech jednotek, vylepšení jednotky na 3. úroveň a výhru na obtížnost Hard.

## Jednotky

| Jednotka | Role | Schopnost na 3. úrovni |
| --- | --- | --- |
| Swordsman | Vyvážený bojovník na blízko | Cleave |
| Archer | Útok na dlouhou vzdálenost | Burning Arrow |
| Knight | Obrněný tank | 30% Block |
| Crossbowman | Silné poškození na dálku | Piercing Bolt |
| Elite Knight | Elitní bojovník v první linii | Whirlwind |
| Mage | Plošné poškození | Arcane Burst |
| Healer | Léčení spojenců | Group Heal |

## Ovládání

| Akce | Ovládání |
| --- | --- |
| Nábor nebo upgrade | Kliknutí myší |
| Přepnutí ovládacího panelu | Záložky Units, Upgrades, Fortress a Menu |
| Pauza nebo pokračování | Klávesa `P` nebo záložka Menu |
| Uložení postupu | Save Game v záložce Menu |
| Zobrazení profilu | Profile v záložce Menu |

Hra se automaticky ukládá po dokončení každé vlny a při skrytí nebo zavření stránky.

## Lokální spuštění

Projekt nevyžaduje instalaci ani sestavení.

1. Naklonuj nebo stáhni repozitář.
2. Otevři `index.html` v moderním prohlížeči.
3. Vyber **New Game**.

## Struktura projektu

```text
bravefortres/
├── index.html          # Rozhraní a herní ovládání
├── style.css           # Vzhled a responzivní rozložení
├── script.js           # Herní smyčka, boj a Canvas
├── js/
│   ├── config.js       # Konfigurace jednotek, nepřátel a upgradů
│   ├── maps.js         # Oblasti, obtížnosti a pravidla prostředí
│   ├── bosses.js       # Metadata regionálních bossů
│   ├── achievements.js # Definice achievementů
│   ├── storage.js      # Ukládání hry a nejlepšího skóre
│   └── waves.js        # Složení vln a výběr nepřátel
├── README.md
├── README.cs.md
└── LICENSE
```

## Technické řešení

Hra používá Canvas API pro vykreslování a `requestAnimationFrame` pro herní smyčku. Herní data jsou oddělená od hlavní logiky, takže lze nové jednotky, nepřátele a změny vyvážení přidávat přes konfiguraci.

Do `localStorage` se ukládá:

- Aktuální vlna, zlato, skóre a stav hradu
- Vybraná oblast a obtížnost
- Úrovně jednotek a vylepšení pevnosti
- Nasazené jednotky a aktivní nepřátelé
- Ekonomika a průběh vlny

Neplatné nebo nekompatibilní uložené pozice hra bezpečně ignoruje.

Odemčené oblasti se ukládají odděleně od rozehrané kampaně, takže prohra ani nová hra trvalý postup nesmaže.

Profil hráče ukládá dokončené oblasti, poražené bossy a odemčené achievementy.

## Technologie

- HTML5
- CSS3
- JavaScript
- Canvas API
- Local Storage

## Další možnosti rozvoje

Verze 5 přidává regionální bossy, mapové nepřátele, achievementy a profil hráče. Možná budoucí rozšíření:

- Další oblasti a jednotky
- Efekty počasí
- Hudba a zvukové efekty
- Pokročilejší schopnosti bossů

## Licence

Projekt je zveřejněný pod [licencí MIT](LICENSE).
