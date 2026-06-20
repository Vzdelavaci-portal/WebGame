# Brave Fortress V3

Středověká fantasy hra na obranu hradu vytvořená v čistém HTML, CSS a JavaScriptu.

Najímej vojáky, rozvíjej pevnost a přežij stále nebezpečnější vlny nepřátel včetně nekromantů, obrů a draků.

[English documentation](README.md)

## Hlavní funkce

- Obrana hradu v reálném čase
- Sedm typů jednotek
- Tři úrovně vylepšení každé jednotky
- Unikátní schopnosti na třetí úrovni
- Postupně obtížnější nepřátelské vlny
- Souboje s Ogre a Dragon bossem
- Nekromanti vyvolávající skeletony
- Ekonomika a pasivní příjem zlata
- Vylepšení hradu, dolu a kovárny
- Kritické zásahy a částicové efekty
- Ruční a automatické ukládání
- Pokračování v uložené hře
- Responzivní ovládání pomocí záložek

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
- Úrovně jednotek a vylepšení pevnosti
- Nasazené jednotky a aktivní nepřátelé
- Ekonomika a průběh vlny

Neplatné nebo nekompatibilní uložené pozice hra bezpečně ignoruje.

## Technologie

- HTML5
- CSS3
- JavaScript
- Canvas API
- Local Storage

## Další možnosti rozvoje

Verze 3 se zaměřuje na kompletní a stabilní zážitek na jedné mapě. Možná budoucí rozšíření:

- Další bossové a jednotky
- Více map
- Efekty počasí
- Hudba a zvukové efekty
- Achievementy

## Licence

Projekt je zveřejněný pod [licencí MIT](LICENSE).
