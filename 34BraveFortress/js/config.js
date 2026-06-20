const GAME_CONFIG = Object.freeze({
  width: 960,
  height: 520,
  groundY: 410,
  castleX: 85,
  startingGold: 100,
  startingCastleHp: 500,
  startingWave: 1,
  saveVersion: 3
});

const UNIT_CONFIG = Object.freeze({
  swordsman: {
    name: 'Swordsman',
    cost: 10,
    hp: 100,
    damage: 10,
    range: 34,
    speed: 1.25,
    rate: 45,
    color: '#fbbf24'
  },
  archer: {
    name: 'Archer',
    cost: 15,
    hp: 65,
    damage: 8,
    range: 170,
    speed: 1,
    rate: 58,
    color: '#22c55e',
    ranged: true
  },
  knight: {
    name: 'Knight',
    cost: 30,
    hp: 240,
    damage: 20,
    range: 38,
    speed: 0.85,
    rate: 60,
    color: '#38bdf8',
    shield: true
  },
  crossbowman: {
    name: 'Crossbowman',
    cost: 25,
    hp: 80,
    damage: 25,
    range: 220,
    speed: 0.85,
    rate: 82,
    color: '#a16207',
    ranged: true,
    bolt: true
  },
  eliteKnight: {
    name: 'Elite Knight',
    cost: 50,
    hp: 450,
    damage: 32,
    range: 42,
    speed: 0.62,
    rate: 72,
    color: '#facc15',
    shield: true,
    elite: true
  },
  mage: {
    name: 'Mage',
    cost: 45,
    hp: 75,
    damage: 24,
    range: 190,
    speed: 0.78,
    rate: 76,
    color: '#a855f7',
    ranged: true,
    magic: true,
    splash: 70
  },
  healer: {
    name: 'Healer',
    cost: 40,
    hp: 90,
    damage: 14,
    range: 150,
    speed: 0.82,
    rate: 85,
    color: '#f8fafc',
    healer: true
  }
});

const UNIT_UPGRADE_CONFIG = Object.freeze({
  maxLevel: 3,
  levels: Object.freeze({
    1: Object.freeze({ hp: 1, damage: 1, rate: 1 }),
    2: Object.freeze({ hp: 1.25, damage: 1.25, rate: 0.9 }),
    3: Object.freeze({ hp: 1.55, damage: 1.6, rate: 0.8 })
  }),
  units: Object.freeze({
    swordsman: Object.freeze({ costs: [45, 90], ability: 'Cleave' }),
    archer: Object.freeze({ costs: [55, 110], ability: 'Burning Arrow' }),
    knight: Object.freeze({ costs: [80, 160], ability: '30% Block' }),
    crossbowman: Object.freeze({ costs: [70, 140], ability: 'Piercing Bolt' }),
    eliteKnight: Object.freeze({ costs: [120, 240], ability: 'Whirlwind' }),
    mage: Object.freeze({ costs: [100, 200], ability: 'Arcane Burst' }),
    healer: Object.freeze({ costs: [90, 180], ability: 'Group Heal' })
  })
});

const ENEMY_CONFIG = Object.freeze({
  goblin: {
    hp: 55,
    damage: 7,
    range: 30,
    speed: 0.95,
    rate: 52,
    reward: 8,
    color: '#16a34a'
  },
  orc: {
    hp: 125,
    damage: 13,
    range: 34,
    speed: 0.72,
    rate: 62,
    reward: 14,
    color: '#ea580c'
  },
  troll: {
    hp: 260,
    damage: 22,
    range: 38,
    speed: 0.46,
    rate: 75,
    reward: 26,
    color: '#7c3aed'
  },
  skeleton: {
    hp: 35,
    damage: 5,
    range: 28,
    speed: 1.05,
    rate: 55,
    reward: 5,
    color: '#e5e7eb'
  },
  necromancer: {
    hp: 160,
    damage: 9,
    range: 130,
    speed: 0.52,
    rate: 95,
    reward: 35,
    color: '#111827',
    summons: true
  },
  boss: {
    hp: 1000,
    damage: 34,
    range: 48,
    speed: 0.38,
    rate: 82,
    reward: 120,
    color: '#dc2626',
    boss: true
  },
  dragon: {
    hp: 1650,
    damage: 46,
    range: 150,
    speed: 0.55,
    rate: 105,
    reward: 220,
    color: '#b91c1c',
    boss: true,
    dragon: true,
    flying: true
  }
});
