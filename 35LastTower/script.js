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
  wave: document.getElementById("wave"),
  gold: document.getElementById("gold"),
  hp: document.getElementById("hp"),
  attack: document.getElementById("attack"),
  message: document.getElementById("message"),
  langCsBtn: document.getElementById("langCsBtn"),
  langEnBtn: document.getElementById("langEnBtn"),
  damageBtn: document.getElementById("damageBtn"),
  rateBtn: document.getElementById("rateBtn"),
  rangeBtn: document.getElementById("rangeBtn"),
  repairBtn: document.getElementById("repairBtn"),
  meteorBtn: document.getElementById("meteorBtn"),
  restartBtn: document.getElementById("restartBtn")
};

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
  enemies: [],
  bullets: [],
  particles: [],
  spawnTimer: 0,
  spawnedEnemies: 0,
  enemiesToSpawn: 9,
  meteorCooldown: 0,
  messageTimer: 0,
  messageKey: "start",
  messageVars: {},
  lastTime: 0,
  gameOver: false
};

const upgrades = {
  damage: { cost: 35, value: 6 },
  rate: { cost: 45, value: 0.06 },
  range: { cost: 40, value: 22 },
  repair: { cost: 30, value: 35 }
};

const enemyTypes = [
  { icon: "imp", hp: 24, speed: 52, reward: 7, damage: 8, size: 10, color: "#ff6b6b" },
  { icon: "shade", hp: 18, speed: 78, reward: 8, damage: 6, size: 9, color: "#b56bff" },
  { icon: "brute", hp: 58, speed: 36, reward: 15, damage: 14, size: 14, color: "#ffb347" }
];

const text = {
  cs: {
    version: "Verze 1",
    stats: "Stav hry",
    controls: "Vylepšení",
    arena: "Herní aréna",
    language: "Jazyk",
    wave: "Vlna",
    gold: "Zlato",
    hp: "HP",
    attack: "Útok",
    damage: "Damage",
    rate: "Kadence",
    range: "Dosah",
    repair: "Opravit",
    meteor: "Meteor",
    restart: "Restart",
    ready: "připraven",
    newRun: "nový pokus",
    goldCost: "zlata",
    seconds: "s",
    start: "Braň poslední věž před temnou hordou.",
    idle: "Temnota útočí ze všech stran.",
    enemyHit: "Nepřítel prorazil k věži.",
    gameOver: "Věž padla ve vlně {wave}. Restartuj a zkus silnější build.",
    gameOverTitle: "Věž padla",
    gameOverHelp: "Použij restart pod arénou.",
    bossWave: "Vlna {wave}: přichází těžký nápor.",
    nextWave: "Vlna {wave} začíná.",
    damageUp: "Síla věže zvýšena na {damage}.",
    rateUp: "Věž střílí rychleji.",
    rangeUp: "Dosah věže: {range}.",
    repairUp: "Zdivo věže je opravené.",
    meteorCast: "Meteor spálil hordu kolem věže."
  },
  en: {
    version: "Version 1",
    stats: "Game status",
    controls: "Upgrades",
    arena: "Game arena",
    language: "Language",
    wave: "Wave",
    gold: "Gold",
    hp: "HP",
    attack: "Attack",
    damage: "Damage",
    rate: "Fire rate",
    range: "Range",
    repair: "Repair",
    meteor: "Meteor",
    restart: "Restart",
    ready: "ready",
    newRun: "new run",
    goldCost: "gold",
    seconds: "s",
    start: "Defend the last tower from the dark horde.",
    idle: "Darkness attacks from every side.",
    enemyHit: "An enemy broke through to the tower.",
    gameOver: "The tower fell on wave {wave}. Restart and try a stronger build.",
    gameOverTitle: "Tower fallen",
    gameOverHelp: "Use restart below the arena.",
    bossWave: "Wave {wave}: a heavy assault is coming.",
    nextWave: "Wave {wave} begins.",
    damageUp: "Tower damage increased to {damage}.",
    rateUp: "The tower fires faster.",
    rangeUp: "Tower range: {range}.",
    repairUp: "The tower walls are repaired.",
    meteorCast: "The meteor burned the horde around the tower."
  }
};

function t(key, vars = {}) {
  let value = text[state.lang][key] || text.cs[key] || key;
  for (const [name, replacement] of Object.entries(vars)) {
    value = value.replace(`{${name}}`, replacement);
  }
  return value;
}

function setMessage(key, seconds = 2.2, vars = {}) {
  state.messageKey = key;
  state.messageVars = vars;
  ui.message.textContent = t(key, vars);
  state.messageTimer = seconds;
}

function updateStaticText() {
  document.documentElement.lang = state.lang;
  ui.versionLabel.textContent = t("version");
  ui.waveLabel.textContent = t("wave");
  ui.goldLabel.textContent = t("gold");
  ui.hpLabel.textContent = t("hp");
  ui.attackLabel.textContent = t("attack");
  ui.statsPanel.setAttribute("aria-label", t("stats"));
  ui.controlsPanel.setAttribute("aria-label", t("controls"));
  ui.langCsBtn.parentElement.setAttribute("aria-label", t("language"));
  canvas.setAttribute("aria-label", t("arena"));
  ui.langCsBtn.classList.toggle("is-active", state.lang === "cs");
  ui.langEnBtn.classList.toggle("is-active", state.lang === "en");
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
  tower.range = 230;
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
  state.enemiesToSpawn = 9;
  state.meteorCooldown = 0;
  state.lastTime = performance.now();
  state.gameOver = false;

  upgrades.damage.cost = 35;
  upgrades.rate.cost = 45;
  upgrades.range.cost = 40;
  upgrades.repair.cost = 30;

  setMessage("start", 3);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pickEnemyType() {
  const roll = Math.random();
  if (state.wave >= 4 && roll > 0.78) return enemyTypes[2];
  if (state.wave >= 2 && roll > 0.45) return enemyTypes[1];
  return enemyTypes[0];
}

function spawnPoint() {
  const margin = 32;
  const side = Math.floor(Math.random() * 4);

  if (side === 0) return { x: Math.random() * canvas.width, y: -margin };
  if (side === 1) return { x: canvas.width + margin, y: Math.random() * canvas.height };
  if (side === 2) return { x: Math.random() * canvas.width, y: canvas.height + margin };
  return { x: -margin, y: Math.random() * canvas.height };
}

function spawnEnemy() {
  const type = pickEnemyType();
  const point = spawnPoint();
  const waveScale = 1 + state.wave * 0.16;

  state.enemies.push({
    x: point.x,
    y: point.y,
    hp: Math.round(type.hp * waveScale),
    maxHp: Math.round(type.hp * waveScale),
    speed: type.speed + state.wave * 2,
    reward: type.reward + Math.floor(state.wave * 1.5),
    damage: type.damage,
    size: type.size,
    color: type.color,
    icon: type.icon,
    hitFlash: 0
  });
}

function updateWave(dt) {
  if (state.spawnedEnemies < state.enemiesToSpawn) {
    state.spawnTimer -= dt;

    if (state.spawnTimer <= 0) {
      spawnEnemy();
      state.spawnedEnemies++;
      state.spawnTimer = Math.max(0.28, 0.92 - state.wave * 0.035);
    }
  }

  if (state.spawnedEnemies >= state.enemiesToSpawn && state.enemies.length === 0) {
    state.wave++;
    state.spawnedEnemies = 0;
    state.enemiesToSpawn = 8 + state.wave * 3;
    state.spawnTimer = 1.1;
    state.gold += 18 + state.wave * 2;

    if (state.wave % 5 === 0) {
      state.enemiesToSpawn += 6;
      setMessage("bossWave", 3, { wave: state.wave });
    } else {
      setMessage("nextWave", 2.2, { wave: state.wave });
    }
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

  state.bullets.push({
    x: tower.x,
    y: tower.y,
    target,
    speed: 460,
    damage: tower.damage,
    radius: 4
  });
}

function updateTower(dt) {
  tower.shotTimer -= dt;
  if (tower.shotTimer <= 0) {
    shoot();
    tower.shotTimer = tower.fireRate;
  }
}

function updateEnemies(dt) {
  for (const enemy of state.enemies) {
    const angle = Math.atan2(tower.y - enemy.y, tower.x - enemy.x);
    enemy.x += Math.cos(angle) * enemy.speed * dt;
    enemy.y += Math.sin(angle) * enemy.speed * dt;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

    if (distance(enemy, tower) < tower.radius + enemy.size) {
      tower.hp -= enemy.damage;
      enemy.hp = 0;
      screenShake(6);
      createParticles(enemy.x, enemy.y, enemy.color, 14);
      setMessage("enemyHit", 1.4);
    }
  }

  state.enemies = state.enemies.filter(enemy => {
    if (enemy.hp > 0) return true;

    if (distance(enemy, tower) >= tower.radius + enemy.size) {
      state.gold += enemy.reward;
      createParticles(enemy.x, enemy.y, "#ffd166", 10);
    }

    return false;
  });

  if (tower.hp <= 0 && !state.gameOver) {
    tower.hp = 0;
    state.gameOver = true;
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
      bullet.target.hp -= bullet.damage;
      bullet.target.hitFlash = 0.08;
      bullet.remove = true;
      createParticles(bullet.target.x, bullet.target.y, "#8be9fd", 4);
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

  if (state.messageTimer <= 0 && !state.gameOver) {
    ui.message.textContent = t("idle");
  }
}

function drawBackground() {
  const gradient = ctx.createRadialGradient(tower.x, tower.y, 40, tower.x, tower.y, 520);
  gradient.addColorStop(0, "#20243d");
  gradient.addColorStop(0.55, "#11182b");
  gradient.addColorStop(1, "#090d18");
  ctx.fillStyle = gradient;
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

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(0, -6, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  drawBar(tower.x - 52, tower.y + 54, 104, 8, tower.hp / tower.maxHp, "#ff5c7a", "#59d68d");
}

function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : enemy.color;
  ctx.strokeStyle = "#090d18";
  ctx.lineWidth = 2;

  if (enemy.icon === "brute") {
    ctx.beginPath();
    ctx.rect(-enemy.size, -enemy.size, enemy.size * 2, enemy.size * 2);
    ctx.fill();
    ctx.stroke();
  } else if (enemy.icon === "shade") {
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

  ctx.fillStyle = "#090d18";
  ctx.beginPath();
  ctx.arc(-enemy.size * 0.35, -enemy.size * 0.15, 1.8, 0, Math.PI * 2);
  ctx.arc(enemy.size * 0.35, -enemy.size * 0.15, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  drawBar(enemy.x - 15, enemy.y + enemy.size + 6, 30, 4, enemy.hp / enemy.maxHp, "#601426", "#83f28f");
}

function drawBar(x, y, width, height, ratio, backColor, frontColor) {
  ctx.fillStyle = backColor;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = frontColor;
  ctx.fillRect(x, y, width * Math.max(0, Math.min(1, ratio)), height);
}

function drawBullets() {
  for (const bullet of state.bullets) {
    ctx.fillStyle = "#8be9fd";
    ctx.shadowColor = "#8be9fd";
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

function drawGameOver() {
  if (!state.gameOver) return;

  ctx.fillStyle = "rgba(5, 8, 15, 0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "700 42px Arial";
  ctx.fillText(t("gameOverTitle"), canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = "18px Arial";
  ctx.fillText(t("gameOverHelp"), canvas.width / 2, canvas.height / 2 + 22);
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
  drawGameOver();
  ctx.restore();
}

function updateUI() {
  ui.wave.textContent = state.wave;
  ui.gold.textContent = state.gold;
  ui.hp.textContent = `${Math.ceil(tower.hp)} / ${tower.maxHp}`;
  ui.attack.textContent = tower.damage;

  ui.damageBtn.innerHTML = `${t("damage")} +${upgrades.damage.value}<small>${upgrades.damage.cost} ${t("goldCost")}</small>`;
  ui.rateBtn.innerHTML = `${t("rate")} +<small>${upgrades.rate.cost} ${t("goldCost")}</small>`;
  ui.rangeBtn.innerHTML = `${t("range")} +${upgrades.range.value}<small>${upgrades.range.cost} ${t("goldCost")}</small>`;
  ui.repairBtn.innerHTML = `${t("repair")} +${upgrades.repair.value}<small>${upgrades.repair.cost} ${t("goldCost")}</small>`;
  ui.meteorBtn.innerHTML = state.meteorCooldown > 0
    ? `${t("meteor")}<small>${Math.ceil(state.meteorCooldown)} ${t("seconds")}</small>`
    : `${t("meteor")}<small>${t("ready")}</small>`;
  ui.restartBtn.innerHTML = `${t("restart")}<small>${t("newRun")}</small>`;

  ui.damageBtn.disabled = state.gold < upgrades.damage.cost || state.gameOver;
  ui.rateBtn.disabled = state.gold < upgrades.rate.cost || tower.fireRate <= 0.2 || state.gameOver;
  ui.rangeBtn.disabled = state.gold < upgrades.range.cost || tower.range >= 340 || state.gameOver;
  ui.repairBtn.disabled = state.gold < upgrades.repair.cost || tower.hp >= tower.maxHp || state.gameOver;
  ui.meteorBtn.disabled = state.meteorCooldown > 0 || state.gameOver;
}

function buyUpgrade(kind) {
  const upgrade = upgrades[kind];
  if (!upgrade || state.gold < upgrade.cost || state.gameOver) return;

  state.gold -= upgrade.cost;

  if (kind === "damage") {
    tower.damage += upgrade.value;
    upgrade.cost += 22;
    setMessage("damageUp", 2.2, { damage: tower.damage });
  }

  if (kind === "rate") {
    tower.fireRate = Math.max(0.2, tower.fireRate - upgrade.value);
    upgrade.cost += 28;
    setMessage("rateUp");
  }

  if (kind === "range") {
    tower.range = Math.min(340, tower.range + upgrade.value);
    upgrade.cost += 24;
    setMessage("rangeUp", 2.2, { range: tower.range });
  }

  if (kind === "repair") {
    tower.hp = Math.min(tower.maxHp, tower.hp + upgrade.value);
    upgrade.cost += 8;
    setMessage("repairUp");
  }
}

function castMeteor() {
  if (state.meteorCooldown > 0 || state.gameOver) return;

  for (const enemy of state.enemies) {
    enemy.hp -= 90 + state.wave * 18;
    createParticles(enemy.x, enemy.y, "#ff7a45", 16);
  }

  screenShake(14);
  state.meteorCooldown = 15;
  setMessage("meteorCast", 2.4);
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

  if (!state.gameOver) {
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
ui.langCsBtn.addEventListener("click", () => setLanguage("cs"));
ui.langEnBtn.addEventListener("click", () => setLanguage("en"));

updateStaticText();
resetGame();
requestAnimationFrame(gameLoop);
