const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  versionLabel: document.getElementById("versionLabel"),
  statsPanel: document.getElementById("statsPanel"),
  controlsPanel: document.getElementById("controlsPanel"),
  waveLabel: document.getElementById("waveLabel"),
  goldLabel: document.getElementById("goldLabel"),
  hpLabel: document.getElementById("hpLabel"),
  attackLabel: document.getElementById("attackLabel"),
  bestWaveLabel: document.getElementById("bestWaveLabel"),
  wave: document.getElementById("wave"),
  gold: document.getElementById("gold"),
  hp: document.getElementById("hp"),
  attack: document.getElementById("attack"),
  bestWave: document.getElementById("bestWave"),
  message: document.getElementById("message"),
  langCsBtn: document.getElementById("langCsBtn"),
  langEnBtn: document.getElementById("langEnBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  perkOverlay: document.getElementById("perkOverlay"),
  perkEyebrow: document.getElementById("perkEyebrow"),
  perkTitle: document.getElementById("perkTitle"),
  perkOptions: document.getElementById("perkOptions"),
  wavePreview: document.getElementById("wavePreview"),
  previewLabel: document.getElementById("previewLabel"),
  previewTitle: document.getElementById("previewTitle"),
  previewDetails: document.getElementById("previewDetails"),
  damageBtn: document.getElementById("damageBtn"),
  rateBtn: document.getElementById("rateBtn"),
  rangeBtn: document.getElementById("rangeBtn"),
  repairBtn: document.getElementById("repairBtn"),
  meteorBtn: document.getElementById("meteorBtn"),
  restartBtn: document.getElementById("restartBtn")
};

const storageKey = "lastTowerBestWaveV3";

const tower = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 30,
  range: 235,
  maxHp: 120,
  hp: 120,
  damage: 14,
  fireRate: 0.55,
  shotTimer: 0
};

const state = {
  lang: "cs",
  wave: 1,
  gold: 35,
  bestWave: loadBestWave(),
  enemies: [],
  bullets: [],
  particles: [],
  spawnTimer: 0,
  spawnedEnemies: 0,
  enemiesToSpawn: 9,
  meteorCooldown: 0,
  meteorMaxCooldown: 15,
  messageTimer: 0,
  messageKey: "start",
  messageVars: {},
  lastTime: 0,
  gameOver: false,
  paused: false,
  choosingPerk: false,
  perkChoices: [],
  killed: 0,
  bossesKilled: 0,
  goldEarned: 0,
  perksTaken: [],
  projectileMode: "arcane"
};

const upgrades = {
  damage: { cost: 35, value: 6, level: 1 },
  rate: { cost: 45, value: 0.06, level: 1 },
  range: { cost: 40, value: 22, level: 1 },
  repair: { cost: 30, value: 35, level: 1 }
};

const enemyTypes = [
  { id: "imp", hp: 24, speed: 52, reward: 7, damage: 8, size: 10, color: "#ff6b6b", minWave: 1, weight: 42 },
  { id: "shade", hp: 18, speed: 80, reward: 8, damage: 6, size: 9, color: "#b56bff", minWave: 2, weight: 30 },
  { id: "brute", hp: 58, speed: 36, reward: 15, damage: 14, size: 14, color: "#ffb347", minWave: 4, weight: 18 },
  { id: "runner", hp: 16, speed: 112, reward: 10, damage: 7, size: 8, color: "#6df7c1", minWave: 6, weight: 20 },
  { id: "shield", hp: 46, speed: 44, reward: 16, damage: 12, size: 13, color: "#7aa2ff", minWave: 7, weight: 16, shield: 22 },
  { id: "healer", hp: 34, speed: 42, reward: 18, damage: 9, size: 12, color: "#83f28f", minWave: 8, weight: 12, healer: true },
  { id: "splitter", hp: 42, speed: 50, reward: 17, damage: 10, size: 12, color: "#f78cff", minWave: 9, weight: 12, splits: 2 }
];

const bossTypes = [
  { id: "bossTank", hp: 430, speed: 23, reward: 95, damage: 36, size: 31, color: "#ff3d81" },
  { id: "bossSummoner", hp: 330, speed: 28, reward: 105, damage: 28, size: 29, color: "#b56bff", summoner: true },
  { id: "bossShield", hp: 360, speed: 26, reward: 110, damage: 30, size: 30, color: "#7aa2ff", shield: 80 }
];

const text = {
  cs: {
    version: "Verze 3",
    stats: "Stav hry",
    controls: "Vylepšení",
    arena: "Herní aréna",
    language: "Jazyk",
    wave: "Vlna",
    gold: "Zlato",
    hp: "HP",
    attack: "Útok",
    bestWave: "Best",
    damage: "Damage",
    rate: "Kadence",
    range: "Dosah",
    repair: "Opravit",
    meteor: "Meteor",
    restart: "Restart",
    pause: "Pauza",
    resume: "Pokračovat",
    paused: "Hra pozastavena.",
    level: "Lv",
    ready: "připraven",
    newRun: "nový pokus",
    goldCost: "zlata",
    seconds: "s",
    start: "Braň poslední věž před temnou hordou.",
    idle: "Temnota útočí ze všech stran.",
    enemyHit: "Nepřítel prorazil k věži.",
    gameOver: "Věž padla ve vlně {wave}. Statistiky runu jsou na ploše.",
    gameOverTitle: "Věž padla",
    gameOverHelp: "Restartuj a zkus jiný build.",
    bossIncoming: "Vlna {wave}: {boss} přichází.",
    bossDefeated: "Boss padl. Vyber odměnu.",
    nextWave: "Vlna {wave} začíná.",
    previewLabel: "Další vlna",
    previewBoss: "Boss vlna",
    previewEnemies: "Nepřátelé",
    previewReward: "Odměna",
    perkEyebrow: "Odměna za bosse",
    perkTitle: "Vyber jeden perk",
    pickPerk: "Vybrat",
    perkChosen: "Perk aktivován: {perk}.",
    damageUp: "Síla věže zvýšena na {damage}.",
    rateUp: "Věž střílí rychleji.",
    rangeUp: "Dosah věže: {range}.",
    repairUp: "Zdivo věže je opravené.",
    meteorCast: "Meteor spálil hordu kolem věže.",
    kills: "Zabití",
    bosses: "Bossové",
    earned: "Získané zlato",
    perks: "Perky",
    projectile: "Střely",
    arcane: "Arcane",
    fire: "Oheň",
    ice: "Led",
    lightning: "Blesk",
    none: "žádné",
    enemies_imp: "Imp",
    enemies_shade: "Stín",
    enemies_brute: "Tank",
    enemies_runner: "Běžec",
    enemies_shield: "Štítonoš",
    enemies_healer: "Léčitel",
    enemies_splitter: "Dělič",
    enemies_minion: "Poskok",
    bosses_bossTank: "Obr",
    bosses_bossSummoner: "Vyvolávač",
    bosses_bossShield: "Štítový boss"
  },
  en: {
    version: "Version 3",
    stats: "Game status",
    controls: "Upgrades",
    arena: "Game arena",
    language: "Language",
    wave: "Wave",
    gold: "Gold",
    hp: "HP",
    attack: "Attack",
    bestWave: "Best",
    damage: "Damage",
    rate: "Fire rate",
    range: "Range",
    repair: "Repair",
    meteor: "Meteor",
    restart: "Restart",
    pause: "Pause",
    resume: "Resume",
    paused: "Game paused.",
    level: "Lv",
    ready: "ready",
    newRun: "new run",
    goldCost: "gold",
    seconds: "s",
    start: "Defend the last tower from the dark horde.",
    idle: "Darkness attacks from every side.",
    enemyHit: "An enemy broke through to the tower.",
    gameOver: "The tower fell on wave {wave}. Run stats are shown in the arena.",
    gameOverTitle: "Tower fallen",
    gameOverHelp: "Restart and try a different build.",
    bossIncoming: "Wave {wave}: {boss} is coming.",
    bossDefeated: "The boss fell. Choose a reward.",
    nextWave: "Wave {wave} begins.",
    previewLabel: "Next wave",
    previewBoss: "Boss wave",
    previewEnemies: "Enemies",
    previewReward: "Reward",
    perkEyebrow: "Boss reward",
    perkTitle: "Choose one perk",
    pickPerk: "Pick",
    perkChosen: "Perk activated: {perk}.",
    damageUp: "Tower damage increased to {damage}.",
    rateUp: "The tower fires faster.",
    rangeUp: "Tower range: {range}.",
    repairUp: "The tower walls are repaired.",
    meteorCast: "The meteor burned the horde around the tower.",
    kills: "Kills",
    bosses: "Bosses",
    earned: "Gold earned",
    perks: "Perks",
    projectile: "Shots",
    arcane: "Arcane",
    fire: "Fire",
    ice: "Ice",
    lightning: "Lightning",
    none: "none",
    enemies_imp: "Imp",
    enemies_shade: "Shade",
    enemies_brute: "Tank",
    enemies_runner: "Runner",
    enemies_shield: "Shield",
    enemies_healer: "Healer",
    enemies_splitter: "Splitter",
    enemies_minion: "Minion",
    bosses_bossTank: "Giant",
    bosses_bossSummoner: "Summoner",
    bosses_bossShield: "Shield Boss"
  }
};

const perkDefinitions = [
  {
    id: "damage",
    title: { cs: "Ostřejší krystal", en: "Sharper Crystal" },
    desc: { cs: "+10 k útoku věže.", en: "+10 tower attack." },
    apply() {
      tower.damage += 10;
    }
  },
  {
    id: "fire",
    title: { cs: "Ohnivé střely", en: "Fire Shots" },
    desc: { cs: "Střely zapalují nepřátele.", en: "Shots burn enemies over time." },
    apply() {
      state.projectileMode = "fire";
    }
  },
  {
    id: "ice",
    title: { cs: "Ledové střely", en: "Ice Shots" },
    desc: { cs: "Střely krátce zpomalují cíl.", en: "Shots briefly slow the target." },
    apply() {
      state.projectileMode = "ice";
    }
  },
  {
    id: "lightning",
    title: { cs: "Bleskové střely", en: "Lightning Shots" },
    desc: { cs: "Zásah přeskočí na blízkého nepřítele.", en: "Hits chain to a nearby enemy." },
    apply() {
      state.projectileMode = "lightning";
    }
  },
  {
    id: "range",
    title: { cs: "Dlouhý dohled", en: "Long Watch" },
    desc: { cs: "+35 k dosahu věže.", en: "+35 tower range." },
    apply() {
      tower.range = Math.min(410, tower.range + 35);
    }
  },
  {
    id: "maxHp",
    title: { cs: "Kamenné zdivo", en: "Stone Walls" },
    desc: { cs: "+25 max HP a okamžitá oprava.", en: "+25 max HP and instant repair." },
    apply() {
      tower.maxHp += 25;
      tower.hp = Math.min(tower.maxHp, tower.hp + 25);
    }
  },
  {
    id: "meteor",
    title: { cs: "Nebeský oheň", en: "Sky Fire" },
    desc: { cs: "Meteor má o 2 s kratší cooldown.", en: "Meteor cooldown is 2 s shorter." },
    apply() {
      state.meteorMaxCooldown = Math.max(8, state.meteorMaxCooldown - 2);
      state.meteorCooldown = Math.min(state.meteorCooldown, state.meteorMaxCooldown);
    }
  },
  {
    id: "gold",
    title: { cs: "Zlatá daň", en: "Gold Tax" },
    desc: { cs: "Okamžitě získáš 75 zlata.", en: "Gain 75 gold immediately." },
    apply() {
      addGold(75);
    }
  }
];

function loadBestWave() {
  try {
    return Number(localStorage.getItem(storageKey) || localStorage.getItem("lastTowerBestWaveV2")) || 1;
  } catch {
    return 1;
  }
}

function saveBestWave() {
  if (state.wave <= state.bestWave) return;
  state.bestWave = state.wave;

  try {
    localStorage.setItem(storageKey, String(state.bestWave));
  } catch {
    // High score is optional. The game continues when storage is blocked.
  }
}

function t(key, vars = {}) {
  let value = text[state.lang][key] || text.cs[key] || key;
  for (const [name, replacement] of Object.entries(vars)) {
    value = value.replace(`{${name}}`, replacement);
  }
  return value;
}

function localPerkText(perk, field) {
  return perk[field][state.lang] || perk[field].cs;
}

function enemyName(id) {
  return t(`enemies_${id}`);
}

function bossName(id) {
  return t(`bosses_${id}`);
}

function setMessage(key, seconds = 2.2, vars = {}) {
  state.messageKey = key;
  state.messageVars = vars;
  ui.message.textContent = t(key, vars);
  state.messageTimer = seconds;
}

function addGold(amount) {
  state.gold += amount;
  state.goldEarned += amount;
}

function updateStaticText() {
  document.documentElement.lang = state.lang;
  ui.versionLabel.textContent = t("version");
  ui.waveLabel.textContent = t("wave");
  ui.goldLabel.textContent = t("gold");
  ui.hpLabel.textContent = t("hp");
  ui.attackLabel.textContent = t("attack");
  ui.bestWaveLabel.textContent = t("bestWave");
  ui.previewLabel.textContent = t("previewLabel");
  ui.statsPanel.setAttribute("aria-label", t("stats"));
  ui.controlsPanel.setAttribute("aria-label", t("controls"));
  ui.wavePreview.setAttribute("aria-label", t("previewLabel"));
  ui.langCsBtn.parentElement.setAttribute("aria-label", t("language"));
  canvas.setAttribute("aria-label", t("arena"));
  ui.langCsBtn.classList.toggle("is-active", state.lang === "cs");
  ui.langEnBtn.classList.toggle("is-active", state.lang === "en");
  updateWavePreview();
  renderPerkChoices();
}

function setLanguage(lang) {
  if (!text[lang] || state.lang === lang) return;

  state.lang = lang;
  updateStaticText();
  ui.message.textContent = state.messageTimer > 0
    ? t(state.messageKey, state.messageVars)
    : t("idle");
  updateUI();
}

function resetGame() {
  tower.range = 235;
  tower.maxHp = 120;
  tower.hp = tower.maxHp;
  tower.damage = 14;
  tower.fireRate = 0.55;
  tower.shotTimer = 0;

  state.wave = 1;
  state.gold = 35;
  state.enemies = [];
  state.bullets = [];
  state.particles = [];
  state.spawnTimer = 0;
  state.spawnedEnemies = 0;
  state.enemiesToSpawn = getWaveEnemyCount(1);
  state.meteorCooldown = 0;
  state.meteorMaxCooldown = 15;
  state.lastTime = performance.now();
  state.gameOver = false;
  state.paused = false;
  state.choosingPerk = false;
  state.perkChoices = [];
  state.killed = 0;
  state.bossesKilled = 0;
  state.goldEarned = 0;
  state.perksTaken = [];
  state.projectileMode = "arcane";

  upgrades.damage.cost = 35;
  upgrades.damage.level = 1;
  upgrades.rate.cost = 45;
  upgrades.rate.level = 1;
  upgrades.range.cost = 40;
  upgrades.range.level = 1;
  upgrades.repair.cost = 30;
  upgrades.repair.level = 1;

  hidePerkOverlay();
  updateWavePreview();
  setMessage("start", 3);
  updateUI();
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isBossWave(wave = state.wave) {
  return wave % 5 === 0;
}

function getWaveEnemyCount(wave) {
  return isBossWave(wave) ? 1 : 8 + wave * 3;
}

function getBossForWave(wave) {
  const bossIndex = Math.floor(wave / 5 - 1) % bossTypes.length;
  return bossTypes[bossIndex];
}

function getAvailableEnemyTypes(wave) {
  return enemyTypes.filter(type => wave >= type.minWave);
}

function pickEnemyType() {
  const available = getAvailableEnemyTypes(state.wave);
  const totalWeight = available.reduce((sum, type) => sum + type.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const type of available) {
    roll -= type.weight;
    if (roll <= 0) return type;
  }

  return available[0];
}

function spawnPoint() {
  const margin = 38;
  const side = Math.floor(Math.random() * 4);

  if (side === 0) return { x: Math.random() * canvas.width, y: -margin };
  if (side === 1) return { x: canvas.width + margin, y: Math.random() * canvas.height };
  if (side === 2) return { x: Math.random() * canvas.width, y: canvas.height + margin };
  return { x: -margin, y: Math.random() * canvas.height };
}

function createEnemyFromType(type, point, waveScale, isBoss = false) {
  const maxHp = Math.round(type.hp * waveScale);
  return {
    x: point.x,
    y: point.y,
    hp: maxHp,
    maxHp,
    speed: type.speed + (isBoss ? state.wave : state.wave * 2),
    baseSpeed: type.speed + (isBoss ? state.wave : state.wave * 2),
    reward: type.reward + Math.floor(state.wave * (isBoss ? 8 : 1.5)),
    damage: type.damage,
    size: type.size,
    color: type.color,
    icon: type.id,
    isBoss,
    shield: type.shield || 0,
    healer: Boolean(type.healer),
    splits: type.splits || 0,
    summoner: Boolean(type.summoner),
    summonTimer: type.summoner ? 4 : 0,
    burnTimer: 0,
    burnDps: 0,
    slowTimer: 0,
    slowFactor: 1,
    healTimer: 0,
    hitFlash: 0
  };
}

function spawnEnemy() {
  const point = spawnPoint();

  if (isBossWave() && state.spawnedEnemies === 0) {
    const boss = getBossForWave(state.wave);
    const bossScale = 1 + state.wave * 0.22;
    state.enemies.push(createEnemyFromType(boss, point, bossScale, true));
    return;
  }

  const type = pickEnemyType();
  const waveScale = 1 + state.wave * 0.16;
  state.enemies.push(createEnemyFromType(type, point, waveScale));
}

function createMinion(x, y) {
  const type = { id: "minion", hp: 15, speed: 72, reward: 3, damage: 5, size: 7, color: "#d7ff72" };
  return createEnemyFromType(type, { x, y }, 1 + state.wave * 0.08);
}

function completeWave() {
  saveBestWave();
  addGold(18 + state.wave * 2);

  if (isBossWave()) {
    setMessage("bossDefeated", 3);
    showPerkChoices();
    return;
  }

  startNextWave();
}

function startNextWave() {
  state.wave++;
  saveBestWave();
  state.spawnedEnemies = 0;
  state.enemiesToSpawn = getWaveEnemyCount(state.wave);
  state.spawnTimer = 1.1;
  updateWavePreview();

  if (isBossWave()) {
    const boss = getBossForWave(state.wave);
    setMessage("bossIncoming", 3, { wave: state.wave, boss: bossName(boss.id) });
  } else {
    setMessage("nextWave", 2.2, { wave: state.wave });
  }
}

function updateWavePreview() {
  const wave = state.wave;
  ui.previewTitle.textContent = `${t("wave")} ${wave}`;

  if (isBossWave(wave)) {
    const boss = getBossForWave(wave);
    ui.previewDetails.textContent = `${t("previewBoss")}: ${bossName(boss.id)} | ${t("previewReward")}: ${boss.reward + Math.floor(wave * 8)} ${t("goldCost")}`;
    return;
  }

  const names = getAvailableEnemyTypes(wave)
    .slice(-4)
    .map(type => enemyName(type.id))
    .join(", ");
  ui.previewDetails.textContent = `${t("previewEnemies")}: ${names} | ${t("previewReward")}: ${18 + wave * 2} ${t("goldCost")}`;
}

function updateWave(dt) {
  if (state.spawnedEnemies < state.enemiesToSpawn) {
    state.spawnTimer -= dt;

    if (state.spawnTimer <= 0) {
      spawnEnemy();
      state.spawnedEnemies++;
      state.spawnTimer = Math.max(0.25, 0.9 - state.wave * 0.035);
    }
  }

  if (state.spawnedEnemies >= state.enemiesToSpawn && state.enemies.length === 0) {
    completeWave();
  }
}

function getTarget() {
  let best = null;
  let bestDistance = Infinity;

  for (const enemy of state.enemies) {
    const d = distance(tower, enemy);
    if (d <= tower.range && d < bestDistance) {
      best = enemy;
      bestDistance = d;
    }
  }

  return best;
}

function shoot() {
  const target = getTarget();
  if (!target) return;

  const colors = {
    arcane: "#8be9fd",
    fire: "#ff7a45",
    ice: "#8be9fd",
    lightning: "#f8f871"
  };

  state.bullets.push({
    x: tower.x,
    y: tower.y,
    target,
    speed: 460,
    damage: tower.damage,
    radius: 4,
    mode: state.projectileMode,
    color: colors[state.projectileMode]
  });
}

function updateTower(dt) {
  tower.shotTimer -= dt;
  if (tower.shotTimer <= 0) {
    shoot();
    tower.shotTimer = tower.fireRate;
  }
}

function damageEnemy(enemy, amount, options = {}) {
  let finalDamage = amount;

  if (enemy.shield > 0) {
    const blocked = Math.min(enemy.shield, finalDamage);
    enemy.shield -= blocked;
    finalDamage -= blocked;
    createParticles(enemy.x, enemy.y, "#7aa2ff", 5);
  }

  if (finalDamage > 0) enemy.hp -= finalDamage;

  if (options.mode === "fire") {
    enemy.burnTimer = 2.6;
    enemy.burnDps = Math.max(enemy.burnDps, tower.damage * 0.28);
  }

  if (options.mode === "ice") {
    enemy.slowTimer = 2;
    enemy.slowFactor = 0.52;
  }

  if (options.mode === "lightning") {
    chainLightning(enemy, amount * 0.45);
  }
}

function chainLightning(source, damage) {
  const target = state.enemies
    .filter(enemy => enemy !== source && enemy.hp > 0 && distance(source, enemy) < 115)
    .sort((a, b) => distance(source, a) - distance(source, b))[0];

  if (!target) return;
  target.hp -= damage;
  target.hitFlash = 0.12;
  createParticles(target.x, target.y, "#f8f871", 12);
}

function updateEnemyEffects(enemy, dt) {
  enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

  if (enemy.burnTimer > 0) {
    enemy.burnTimer -= dt;
    enemy.hp -= enemy.burnDps * dt;
    if (Math.random() < 0.25) createParticles(enemy.x, enemy.y, "#ff7a45", 1);
  }

  if (enemy.slowTimer > 0) {
    enemy.slowTimer -= dt;
    enemy.speed = enemy.baseSpeed * enemy.slowFactor;
  } else {
    enemy.speed = enemy.baseSpeed;
  }

  if (enemy.healer) {
    enemy.healTimer -= dt;
    if (enemy.healTimer <= 0) {
      enemy.healTimer = 1.4;
      for (const ally of state.enemies) {
        if (ally !== enemy && ally.hp > 0 && distance(enemy, ally) < 95) {
          ally.hp = Math.min(ally.maxHp, ally.hp + 8 + state.wave);
          createParticles(ally.x, ally.y, "#83f28f", 3);
        }
      }
    }
  }

  if (enemy.summoner) {
    enemy.summonTimer -= dt;
    if (enemy.summonTimer <= 0 && state.enemies.length < 42) {
      enemy.summonTimer = 5;
      state.enemies.push(createMinion(enemy.x + 22, enemy.y + 8), createMinion(enemy.x - 22, enemy.y - 8));
      createParticles(enemy.x, enemy.y, "#b56bff", 18);
    }
  }
}

function updateEnemies(dt) {
  for (const enemy of state.enemies) {
    updateEnemyEffects(enemy, dt);

    const angle = Math.atan2(tower.y - enemy.y, tower.x - enemy.x);
    enemy.x += Math.cos(angle) * enemy.speed * dt;
    enemy.y += Math.sin(angle) * enemy.speed * dt;

    if (distance(enemy, tower) < tower.radius + enemy.size) {
      tower.hp -= enemy.damage;
      enemy.hp = 0;
      screenShake(enemy.isBoss ? 18 : 6);
      createParticles(enemy.x, enemy.y, enemy.color, enemy.isBoss ? 34 : 14);
      setMessage("enemyHit", 1.4);
    }
  }

  const nextEnemies = [];
  for (const enemy of state.enemies) {
    if (enemy.hp > 0) {
      nextEnemies.push(enemy);
      continue;
    }

    if (distance(enemy, tower) >= tower.radius + enemy.size) {
      addGold(enemy.reward);
      state.killed++;
      if (enemy.isBoss) state.bossesKilled++;
      createParticles(enemy.x, enemy.y, "#ffd166", enemy.isBoss ? 28 : 10);
      if (enemy.isBoss) screenShake(16);

      if (enemy.splits > 0) {
        for (let i = 0; i < enemy.splits; i++) {
          nextEnemies.push(createMinion(enemy.x + (i === 0 ? -12 : 12), enemy.y));
        }
      }
    }
  }

  state.enemies = nextEnemies;

  if (tower.hp <= 0 && !state.gameOver) {
    tower.hp = 0;
    state.gameOver = true;
    saveBestWave();
    setMessage("gameOver", 99, { wave: state.wave });
  }
}

function updateBullets(dt) {
  for (const bullet of state.bullets) {
    if (!bullet.target || bullet.target.hp <= 0) {
      bullet.remove = true;
      continue;
    }

    const angle = Math.atan2(bullet.target.y - bullet.y, bullet.target.x - bullet.x);
    bullet.x += Math.cos(angle) * bullet.speed * dt;
    bullet.y += Math.sin(angle) * bullet.speed * dt;

    if (distance(bullet, bullet.target) < bullet.target.size + bullet.radius) {
      damageEnemy(bullet.target, bullet.damage, { mode: bullet.mode });
      bullet.target.hitFlash = 0.08;
      bullet.remove = true;
      createParticles(bullet.target.x, bullet.target.y, bullet.color, bullet.target.isBoss ? 10 : 5);
    }
  }

  state.bullets = state.bullets.filter(bullet => !bullet.remove);
}

function createParticles(x, y, color, amount) {
  for (let i = 0; i < amount; i++) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 160,
      vy: (Math.random() - 0.5) * 160,
      life: 0.45 + Math.random() * 0.35,
      maxLife: 0.8,
      color
    });
  }
}

let shake = 0;

function screenShake(amount) {
  shake = Math.max(shake, amount);
}

function updateParticles(dt) {
  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.96;
    particle.vy *= 0.96;
    particle.life -= dt;
  }

  state.particles = state.particles.filter(particle => particle.life > 0);
  shake = Math.max(0, shake - 28 * dt);
}

function updateCooldowns(dt) {
  state.meteorCooldown = Math.max(0, state.meteorCooldown - dt);
  state.messageTimer -= dt;

  if (state.messageTimer <= 0 && !state.gameOver && !state.paused && !state.choosingPerk) {
    ui.message.textContent = t("idle");
  }
}

function randomPerkChoices() {
  const pool = [...perkDefinitions];
  const choices = [];

  while (choices.length < 3 && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    choices.push(pool.splice(index, 1)[0]);
  }

  return choices;
}

function showPerkChoices() {
  state.choosingPerk = true;
  state.perkChoices = randomPerkChoices();
  renderPerkChoices();
  ui.perkOverlay.classList.remove("is-hidden");
  updateUI();
}

function hidePerkOverlay() {
  ui.perkOverlay.classList.add("is-hidden");
  ui.perkOptions.innerHTML = "";
}

function renderPerkChoices() {
  if (!state.choosingPerk) return;

  ui.perkEyebrow.textContent = t("perkEyebrow");
  ui.perkTitle.textContent = t("perkTitle");
  ui.perkOptions.innerHTML = "";

  state.perkChoices.forEach(perk => {
    const button = document.createElement("button");
    button.className = "perk-card";
    button.type = "button";
    button.innerHTML = `
      <strong>${localPerkText(perk, "title")}</strong>
      <span>${localPerkText(perk, "desc")}</span>
      <small>${t("pickPerk")}</small>
    `;
    button.addEventListener("click", () => choosePerk(perk));
    ui.perkOptions.appendChild(button);
  });
}

function choosePerk(perk) {
  if (!state.choosingPerk) return;

  perk.apply();
  state.perksTaken.push(localPerkText(perk, "title"));
  state.choosingPerk = false;
  hidePerkOverlay();
  setMessage("perkChosen", 2.4, { perk: localPerkText(perk, "title") });
  startNextWave();
  updateUI();
}

function drawBackground() {
  const waveDarkness = Math.min(0.2, state.wave * 0.008);
  const gradient = ctx.createRadialGradient(tower.x, tower.y, 40, tower.x, tower.y, 520);
  gradient.addColorStop(0, "#20243d");
  gradient.addColorStop(0.55, "#11182b");
  gradient.addColorStop(1, "#090d18");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `rgba(0, 0, 0, ${waveDarkness})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.055)";
  ctx.lineWidth = 1;

  for (let x = 20; x < canvas.width; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 70, canvas.height);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 209, 102, 0.18)";
  ctx.setLineDash([8, 14]);
  ctx.beginPath();
  ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawTower() {
  ctx.save();
  ctx.translate(tower.x, tower.y);

  const pulse = 1 + Math.sin(performance.now() / 240) * 0.025;
  ctx.scale(pulse, pulse);

  ctx.fillStyle = "#11151f";
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, tower.radius + 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#2b3148";
  ctx.strokeStyle = "#ecf2ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.lineTo(25, 25);
  ctx.lineTo(13, 34);
  ctx.lineTo(-13, 34);
  ctx.lineTo(-25, 25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = projectileColor();
  ctx.beginPath();
  ctx.arc(0, -6, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  drawBar(tower.x - 52, tower.y + 54, 104, 8, tower.hp / tower.maxHp, "#ff5c7a", "#59d68d");
}

function projectileColor() {
  return {
    arcane: "#ffd166",
    fire: "#ff7a45",
    ice: "#8be9fd",
    lightning: "#f8f871"
  }[state.projectileMode];
}

function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : enemy.color;
  ctx.strokeStyle = enemy.shield > 0 ? "#dbe8ff" : enemy.isBoss ? "#ffd166" : "#090d18";
  ctx.lineWidth = enemy.isBoss ? 3 : 2;

  if (enemy.isBoss) {
    ctx.beginPath();
    ctx.moveTo(0, -enemy.size - 12);
    ctx.lineTo(enemy.size + 16, -4);
    ctx.lineTo(enemy.size + 8, enemy.size + 12);
    ctx.lineTo(0, enemy.size + 20);
    ctx.lineTo(-enemy.size - 8, enemy.size + 12);
    ctx.lineTo(-enemy.size - 16, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (enemy.icon === "brute" || enemy.icon === "shield") {
    ctx.beginPath();
    ctx.rect(-enemy.size, -enemy.size, enemy.size * 2, enemy.size * 2);
    ctx.fill();
    ctx.stroke();
  } else if (enemy.icon === "shade" || enemy.icon === "healer") {
    ctx.beginPath();
    ctx.moveTo(0, -enemy.size - 4);
    ctx.lineTo(enemy.size + 6, 0);
    ctx.lineTo(0, enemy.size + 4);
    ctx.lineTo(-enemy.size - 6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  if (enemy.healer) {
    ctx.strokeStyle = "#e8ffd8";
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.stroke();
  }

  ctx.fillStyle = "#090d18";
  ctx.beginPath();
  ctx.arc(-enemy.size * 0.35, -enemy.size * 0.15, enemy.isBoss ? 3.2 : 1.8, 0, Math.PI * 2);
  ctx.arc(enemy.size * 0.35, -enemy.size * 0.15, enemy.isBoss ? 3.2 : 1.8, 0, Math.PI * 2);
  ctx.fill();

  if (enemy.burnTimer > 0 || enemy.slowTimer > 0) {
    ctx.strokeStyle = enemy.burnTimer > 0 ? "#ff7a45" : "#8be9fd";
    ctx.beginPath();
    ctx.arc(0, 0, enemy.size + 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();

  const barWidth = enemy.isBoss ? 76 : 30;
  const barHeight = enemy.isBoss ? 7 : 4;
  drawBar(enemy.x - barWidth / 2, enemy.y + enemy.size + 12, barWidth, barHeight, enemy.hp / enemy.maxHp, "#601426", "#83f28f");
}

function drawBar(x, y, width, height, ratio, backColor, frontColor) {
  ctx.fillStyle = backColor;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = frontColor;
  ctx.fillRect(x, y, width * Math.max(0, Math.min(1, ratio)), height);
}

function drawBullets() {
  for (const bullet of state.bullets) {
    ctx.fillStyle = bullet.color;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawParticles() {
  for (const particle of state.particles) {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawGameOverlay() {
  if (!state.gameOver && !state.paused) return;

  ctx.fillStyle = "rgba(5, 8, 15, 0.76)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "700 42px Arial";
  ctx.fillText(state.gameOver ? t("gameOverTitle") : t("paused"), canvas.width / 2, canvas.height / 2 - 86);
  ctx.font = "18px Arial";
  ctx.fillText(state.gameOver ? t("gameOverHelp") : t("resume"), canvas.width / 2, canvas.height / 2 - 48);

  if (state.gameOver) {
    const stats = [
      `${t("wave")}: ${state.wave}`,
      `${t("bestWave")}: ${state.bestWave}`,
      `${t("kills")}: ${state.killed}`,
      `${t("bosses")}: ${state.bossesKilled}`,
      `${t("earned")}: ${state.goldEarned}`,
      `${t("projectile")}: ${t(state.projectileMode)}`,
      `${t("perks")}: ${state.perksTaken.length ? state.perksTaken.join(", ") : t("none")}`
    ];

    ctx.font = "16px Arial";
    stats.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, canvas.height / 2 - 8 + index * 26);
    });
  }
}

function render() {
  ctx.save();
  if (shake > 0) {
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  }

  drawBackground();
  for (const enemy of state.enemies) drawEnemy(enemy);
  drawBullets();
  drawParticles();
  drawTower();
  drawGameOverlay();
  ctx.restore();
}

function upgradeLabel(kind, label, detail) {
  const upgrade = upgrades[kind];
  return `${label}<small>${t("level")} ${upgrade.level} | ${detail} | ${upgrade.cost} ${t("goldCost")}</small>`;
}

function updateUI() {
  ui.wave.textContent = state.wave;
  ui.gold.textContent = state.gold;
  ui.hp.textContent = `${Math.ceil(tower.hp)} / ${tower.maxHp}`;
  ui.attack.textContent = tower.damage;
  ui.bestWave.textContent = state.bestWave;

  ui.pauseBtn.textContent = state.paused ? t("resume") : t("pause");
  ui.damageBtn.innerHTML = upgradeLabel("damage", `${t("damage")} +${upgrades.damage.value}`, `DMG ${tower.damage}`);
  ui.rateBtn.innerHTML = upgradeLabel("rate", `${t("rate")} +`, `${tower.fireRate.toFixed(2)} ${t("seconds")}`);
  ui.rangeBtn.innerHTML = upgradeLabel("range", `${t("range")} +${upgrades.range.value}`, tower.range);
  ui.repairBtn.innerHTML = upgradeLabel("repair", `${t("repair")} +${upgrades.repair.value}`, `${Math.ceil(tower.hp)} HP`);
  ui.meteorBtn.innerHTML = state.meteorCooldown > 0
    ? `${t("meteor")}<small>${Math.ceil(state.meteorCooldown)} ${t("seconds")}</small>`
    : `${t("meteor")}<small>${t("ready")} | ${state.meteorMaxCooldown} ${t("seconds")}</small>`;
  ui.restartBtn.innerHTML = `${t("restart")}<small>${t("newRun")}</small>`;

  const locked = state.gameOver || state.paused || state.choosingPerk;
  ui.damageBtn.disabled = state.gold < upgrades.damage.cost || locked;
  ui.rateBtn.disabled = state.gold < upgrades.rate.cost || tower.fireRate <= 0.18 || locked;
  ui.rangeBtn.disabled = state.gold < upgrades.range.cost || tower.range >= 410 || locked;
  ui.repairBtn.disabled = state.gold < upgrades.repair.cost || tower.hp >= tower.maxHp || locked;
  ui.meteorBtn.disabled = state.meteorCooldown > 0 || locked;
  ui.pauseBtn.disabled = state.gameOver || state.choosingPerk;
}

function buyUpgrade(kind) {
  const upgrade = upgrades[kind];
  if (!upgrade || state.gold < upgrade.cost || state.gameOver || state.paused || state.choosingPerk) return;

  state.gold -= upgrade.cost;
  upgrade.level++;

  if (kind === "damage") {
    tower.damage += upgrade.value;
    upgrade.cost += 22 + upgrade.level * 4;
    setMessage("damageUp", 2.2, { damage: tower.damage });
  }

  if (kind === "rate") {
    tower.fireRate = Math.max(0.18, tower.fireRate - upgrade.value);
    upgrade.cost += 28 + upgrade.level * 5;
    setMessage("rateUp");
  }

  if (kind === "range") {
    tower.range = Math.min(410, tower.range + upgrade.value);
    upgrade.cost += 24 + upgrade.level * 5;
    setMessage("rangeUp", 2.2, { range: tower.range });
  }

  if (kind === "repair") {
    tower.hp = Math.min(tower.maxHp, tower.hp + upgrade.value);
    upgrade.cost += 8 + upgrade.level * 2;
    setMessage("repairUp");
  }

  updateUI();
}

function castMeteor() {
  if (state.meteorCooldown > 0 || state.gameOver || state.paused || state.choosingPerk) return;

  for (const enemy of state.enemies) {
    damageEnemy(enemy, 90 + state.wave * 18);
    createParticles(enemy.x, enemy.y, "#ff7a45", enemy.isBoss ? 28 : 16);
  }

  screenShake(14);
  state.meteorCooldown = state.meteorMaxCooldown;
  setMessage("meteorCast", 2.4);
}

function togglePause() {
  if (state.gameOver || state.choosingPerk) return;

  state.paused = !state.paused;
  state.lastTime = performance.now();
  setMessage(state.paused ? "paused" : "idle", state.paused ? 99 : 1.2);
  updateUI();
}

function update(dt) {
  updateCooldowns(dt);
  updateWave(dt);
  updateTower(dt);
  updateEnemies(dt);
  updateBullets(dt);
  updateParticles(dt);
  updateUI();
}

function gameLoop(timestamp) {
  const dt = Math.min(0.05, (timestamp - state.lastTime) / 1000 || 0);
  state.lastTime = timestamp;

  if (!state.gameOver && !state.paused && !state.choosingPerk) {
    update(dt);
  } else {
    updateParticles(dt);
    updateUI();
  }

  render();
  requestAnimationFrame(gameLoop);
}

ui.damageBtn.addEventListener("click", () => buyUpgrade("damage"));
ui.rateBtn.addEventListener("click", () => buyUpgrade("rate"));
ui.rangeBtn.addEventListener("click", () => buyUpgrade("range"));
ui.repairBtn.addEventListener("click", () => buyUpgrade("repair"));
ui.meteorBtn.addEventListener("click", castMeteor);
ui.restartBtn.addEventListener("click", resetGame);
ui.pauseBtn.addEventListener("click", togglePause);
ui.langCsBtn.addEventListener("click", () => setLanguage("cs"));
ui.langEnBtn.addEventListener("click", () => setLanguage("en"));

document.addEventListener("keydown", event => {
  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
  }
});

updateStaticText();
resetGame();
requestAnimationFrame(gameLoop);
