const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GAME_WIDTH = 960;
const GAME_HEIGHT = 520;

function setupCanvasResolution() {
  const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

  canvas.width = GAME_WIDTH * ratio;
  canvas.height = GAME_HEIGHT * ratio;
  canvas.style.width = "100%";
  canvas.style.height = "auto";

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

setupCanvasResolution();

const goldEl = document.getElementById("gold");
const castleHpEl = document.getElementById("castleHp");
const waveEl = document.getElementById("wave");
const killsEl = document.getElementById("kills");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");

const costMineEl = document.getElementById("costMine");
const costWallsEl = document.getElementById("costWalls");
const costBlacksmithEl = document.getElementById("costBlacksmith");

const groundY = 410;
const castleX = 85;
const enemySpawnX = GAME_WIDTH + 40;

const unitTypes = {
  swordsman: {
    name: "Swordsman",
    cost: 10,
    hp: 100,
    damage: 10,
    range: 34,
    speed: 1.25,
    attackRate: 45,
    color: "#fbbf24"
  },
  archer: {
    name: "Archer",
    cost: 15,
    hp: 65,
    damage: 8,
    range: 170,
    speed: 1.0,
    attackRate: 58,
    color: "#22c55e",
    ranged: true
  },
  knight: {
    name: "Knight",
    cost: 30,
    hp: 240,
    damage: 20,
    range: 38,
    speed: 0.85,
    attackRate: 60,
    color: "#38bdf8"
  }
};

const enemyTypes = {
  goblin: {
    name: "Goblin",
    hp: 55,
    damage: 7,
    range: 30,
    speed: 0.95,
    attackRate: 52,
    reward: 8,
    color: "#16a34a"
  },
  orc: {
    name: "Orc",
    hp: 125,
    damage: 13,
    range: 34,
    speed: 0.72,
    attackRate: 62,
    reward: 14,
    color: "#ea580c"
  },
  troll: {
    name: "Troll",
    hp: 260,
    damage: 22,
    range: 38,
    speed: 0.46,
    attackRate: 75,
    reward: 26,
    color: "#7c3aed"
  },
  boss: {
    name: "Ogre King",
    hp: 1000,
    damage: 34,
    range: 48,
    speed: 0.38,
    attackRate: 82,
    reward: 120,
    color: "#dc2626",
    boss: true
  }
};

let units = [];
let enemies = [];
let projectiles = [];
let particles = [];
let floatingTexts = [];

let gold = 100;
let castleHp = 500;
let castleMaxHp = 500;
let wave = 1;
let kills = 0;
let score = 0;
let best = localStorage.getItem("braveFortressBestFixedVisual") || 0;

let goldIncome = 1;
let unitDamageBonus = 0;
let wallUpgradeLevel = 0;
let mineUpgradeLevel = 0;
let blacksmithLevel = 0;

let running = false;
let paused = false;
let animationId;

let spawnTimer = 0;
let spawnedInWave = 0;
let enemiesToSpawn = 0;
let waveActive = false;
let waveDelay = 140;
let goldTimer = 0;
let shakeTimer = 0;

bestEl.textContent = best;

function startGame() {
  units = [];
  enemies = [];
  projectiles = [];
  particles = [];
  floatingTexts = [];

  gold = 100;
  castleHp = 500;
  castleMaxHp = 500;
  wave = 1;
  kills = 0;
  score = 0;

  goldIncome = 1;
  unitDamageBonus = 0;
  wallUpgradeLevel = 0;
  mineUpgradeLevel = 0;
  blacksmithLevel = 0;

  spawnTimer = 0;
  spawnedInWave = 0;
  enemiesToSpawn = getWaveEnemyCount();
  waveActive = true;
  waveDelay = 140;
  goldTimer = 0;
  shakeTimer = 0;

  running = true;
  paused = false;

  overlay.style.display = "none";

  updateUI();

  cancelAnimationFrame(animationId);
  gameLoop();
}

function gameLoop() {
  if (!running) return;

  if (!paused) {
    update();
    draw();
  }

  animationId = requestAnimationFrame(gameLoop);
}

function update() {
  updateGoldIncome();
  updateWave();
  updateUnits();
  updateEnemies();
  updateProjectiles();
  updateParticles();
  updateFloatingTexts();
  updateUI();

  if (shakeTimer > 0) shakeTimer--;
}

function getMineCost() {
  return 50 + mineUpgradeLevel * 35;
}

function getWallsCost() {
  return 60 + wallUpgradeLevel * 45;
}

function getBlacksmithCost() {
  return 70 + blacksmithLevel * 50;
}

function updateGoldIncome() {
  goldTimer++;

  if (goldTimer >= 60) {
    gold += goldIncome;
    goldTimer = 0;
  }
}

function updateWave() {
  if (!waveActive) {
    waveDelay--;

    if (waveDelay <= 0) {
      wave++;
      enemiesToSpawn = getWaveEnemyCount();
      spawnedInWave = 0;
      waveActive = true;

      createFloatingText(
        GAME_WIDTH / 2,
        82,
        wave % 5 === 0 ? `BOSS WAVE ${wave}` : `WAVE ${wave}`,
        wave % 5 === 0 ? "#dc2626" : "#fbbf24"
      );
    }

    return;
  }

  spawnTimer++;

  const delay = Math.max(35, 95 - wave * 4);

  if (spawnTimer > delay && spawnedInWave < enemiesToSpawn) {
    spawnEnemyForWave();
    spawnedInWave++;
    spawnTimer = 0;
  }

  if (spawnedInWave >= enemiesToSpawn && enemies.length === 0) {
    waveActive = false;
    waveDelay = 160;
    gold += 35 + wave * 5;

    createFloatingText(GAME_WIDTH / 2, 82, `WAVE ${wave} CLEARED`, "#22c55e");
  }
}

function getWaveEnemyCount() {
  return wave % 5 === 0 ? 1 : 5 + wave * 2;
}

function spawnEnemyForWave() {
  if (wave % 5 === 0) {
    spawnEnemy("boss");
    return;
  }

  const roll = Math.random();

  if (wave >= 4 && roll > 0.82) {
    spawnEnemy("troll");
  } else if (wave >= 2 && roll > 0.55) {
    spawnEnemy("orc");
  } else {
    spawnEnemy("goblin");
  }
}

function spawnEnemy(type) {
  const config = enemyTypes[type];
  const multiplier = 1 + wave * 0.12;

  enemies.push({
    type,
    name: config.name,
    x: enemySpawnX,
    y: groundY,
    hp: Math.floor(config.hp * multiplier),
    maxHp: Math.floor(config.hp * multiplier),
    damage: Math.floor(config.damage * (1 + wave * 0.06)),
    range: config.range,
    speed: config.speed,
    attackRate: config.attackRate,
    cooldown: Math.random() * 30,
    reward: config.reward,
    color: config.color,
    boss: config.boss || false,
    radius: config.boss ? 30 : 19
  });
}

function spawnUnit(type) {
  if (!running || paused) return;

  const config = unitTypes[type];

  if (gold < config.cost) {
    createFloatingText(170, 120, "Not enough gold", "#dc2626");
    return;
  }

  gold -= config.cost;

  units.push({
    type,
    name: config.name,
    x: castleX + 55,
    y: groundY,
    hp: config.hp,
    maxHp: config.hp,
    damage: config.damage + unitDamageBonus,
    range: config.range,
    speed: config.speed,
    attackRate: config.attackRate,
    cooldown: 0,
    color: config.color,
    ranged: config.ranged || false,
    radius: type === "knight" ? 22 : 18
  });

  createParticles(castleX + 55, groundY, config.color, 16);
}

function updateUnits() {
  units.forEach(unit => {
    if (unit.hp <= 0) {
      unit.dead = true;
      createParticles(unit.x, unit.y, unit.color, 18);
      return;
    }

    const target = findNearestEnemy(unit);

    if (target && Math.abs(target.x - unit.x) <= unit.range) {
      unit.cooldown--;

      if (unit.cooldown <= 0) {
        attackEnemy(unit, target);
        unit.cooldown = unit.attackRate;
      }
    } else {
      unit.x += unit.speed;
    }

    unit.x = Math.min(unit.x, GAME_WIDTH - 60);
  });

  units = units.filter(unit => !unit.dead);
}

function updateEnemies() {
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) {
      enemy.dead = true;
      kills++;
      gold += enemy.reward;
      score += enemy.boss ? 500 : 50;

      createFloatingText(enemy.x, enemy.y - 44, `+${enemy.reward} gold`, "#fbbf24");
      createParticles(enemy.x, enemy.y, enemy.color, enemy.boss ? 50 : 22);
      return;
    }

    const target = findNearestUnit(enemy);

    if (target && Math.abs(target.x - enemy.x) <= enemy.range) {
      enemy.cooldown--;

      if (enemy.cooldown <= 0) {
        damageUnit(enemy, target);
        enemy.cooldown = enemy.attackRate;
      }
    } else if (enemy.x <= castleX + 45) {
      enemy.cooldown--;

      if (enemy.cooldown <= 0) {
        damageCastle(enemy.damage);
        enemy.cooldown = enemy.attackRate;
      }
    } else {
      enemy.x -= enemy.speed;
    }
  });

  enemies = enemies.filter(enemy => !enemy.dead);
}

function findNearestEnemy(unit) {
  return enemies
    .filter(enemy => enemy.hp > 0)
    .sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x))[0];
}

function findNearestUnit(enemy) {
  return units
    .filter(unit => unit.hp > 0)
    .sort((a, b) => Math.abs(a.x - enemy.x) - Math.abs(b.x - enemy.x))[0];
}

function attackEnemy(unit, enemy) {
  if (unit.ranged) {
    projectiles.push({
      x: unit.x + 10,
      y: unit.y - 26,
      targetId: enemy,
      color: unit.color,
      damage: unit.damage,
      life: 120
    });
  } else {
    enemy.hp -= unit.damage;
    createParticles(enemy.x, enemy.y - 18, unit.color, 8);
  }
}

function damageUnit(enemy, unit) {
  unit.hp -= enemy.damage;
  createParticles(unit.x, unit.y - 20, enemy.color, 8);
}

function damageCastle(amount) {
  castleHp -= amount;
  shakeTimer = 8;
  createParticles(castleX, groundY - 70, "#dc2626", 20);

  if (castleHp <= 0) {
    gameOver();
  }
}

function updateProjectiles() {
  projectiles.forEach(projectile => {
    const enemy = projectile.targetId;

    if (!enemy || enemy.hp <= 0) {
      projectile.dead = true;
      return;
    }

    const targetX = enemy.x;
    const targetY = enemy.y - 22;
    const dx = targetX - projectile.x;
    const dy = targetY - projectile.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 8) {
      enemy.hp -= projectile.damage;
      projectile.dead = true;
      createParticles(enemy.x, enemy.y - 18, projectile.color, 10);
    } else {
      projectile.x += (dx / dist) * 8;
      projectile.y += (dy / dist) * 8;
    }

    projectile.life--;
  });

  projectiles = projectiles.filter(projectile => !projectile.dead && projectile.life > 0);
}

function buyUpgrade(type) {
  if (!running || paused) return;

  if (type === "mine") {
    const cost = getMineCost();

    if (gold < cost) {
      createFloatingText(200, 120, `Need ${cost} gold`, "#dc2626");
      return;
    }

    gold -= cost;
    mineUpgradeLevel++;
    goldIncome++;
    createFloatingText(260, 120, "Gold income +1", "#fbbf24");
  }

  if (type === "walls") {
    const cost = getWallsCost();

    if (gold < cost) {
      createFloatingText(200, 120, `Need ${cost} gold`, "#dc2626");
      return;
    }

    gold -= cost;
    wallUpgradeLevel++;
    castleMaxHp += 120;
    castleHp = Math.min(castleMaxHp, castleHp + 180);
    createFloatingText(260, 120, "Castle upgraded", "#38bdf8");
  }

  if (type === "blacksmith") {
    const cost = getBlacksmithCost();

    if (gold < cost) {
      createFloatingText(200, 120, `Need ${cost} gold`, "#dc2626");
      return;
    }

    gold -= cost;
    blacksmithLevel++;
    unitDamageBonus += 4;
    units.forEach(unit => unit.damage += 4);
    createFloatingText(260, 120, "Unit damage +4", "#f97316");
  }

  updateUI();
}

function draw() {
  ctx.imageSmoothingEnabled = false;

  ctx.save();

  const shakeX = shakeTimer > 0 ? (Math.random() - 0.5) * 6 : 0;
  const shakeY = shakeTimer > 0 ? (Math.random() - 0.5) * 4 : 0;

  ctx.translate(shakeX, shakeY);

  drawBackground();
  drawCastle();
  drawUnits();
  drawEnemies();
  drawProjectiles();
  drawParticles();
  drawFloatingTexts();
  drawWaveInfo();

  ctx.restore();
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  sky.addColorStop(0, "#7dd3fc");
  sky.addColorStop(0.5, "#bfdbfe");
  sky.addColorStop(1, "#fef3c7");

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.arc(760, 90, 46, 0, Math.PI * 2);
  ctx.fill();

  drawMountains();
  drawClouds();

  ctx.fillStyle = "#166534";
  ctx.fillRect(0, groundY + 15, GAME_WIDTH, GAME_HEIGHT - groundY);

  ctx.fillStyle = "#365314";
  ctx.fillRect(0, groundY + 45, GAME_WIDTH, GAME_HEIGHT - groundY);

  ctx.fillStyle = "#78350f";
  ctx.fillRect(0, groundY + 27, GAME_WIDTH, 18);

  ctx.strokeStyle = "rgba(120,53,15,.45)";
  ctx.lineWidth = 2;

  for (let x = 0; x < GAME_WIDTH; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, groundY + 36);
    ctx.lineTo(x + 36, groundY + 36);
    ctx.stroke();
  }
}

function drawMountains() {
  ctx.save();

  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.moveTo(-80, groundY + 15);
  ctx.lineTo(160, 150);
  ctx.lineTo(410, groundY + 15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.moveTo(190, groundY + 15);
  ctx.lineTo(430, 115);
  ctx.lineTo(720, groundY + 15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.moveTo(580, groundY + 15);
  ctx.lineTo(790, 170);
  ctx.lineTo(1030, groundY + 15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.moveTo(430, 115);
  ctx.lineTo(392, 174);
  ctx.lineTo(468, 166);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.moveTo(790, 170);
  ctx.lineTo(760, 220);
  ctx.lineTo(820, 212);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawClouds() {
  ctx.fillStyle = "rgba(255,255,255,.75)";

  drawCloud(170, 95, 1);
  drawCloud(510, 82, 0.8);
}

function drawCloud(x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, 20 * s, 0, Math.PI * 2);
  ctx.arc(x + 22 * s, y - 8 * s, 26 * s, 0, Math.PI * 2);
  ctx.arc(x + 50 * s, y, 20 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawCastle() {
  ctx.save();

  ctx.fillStyle = "#78716c";
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 3;

  roundRect(18, groundY - 175, 140, 205, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#57534e";

  drawTower(30, groundY - 215, 34, 70);
  drawTower(80, groundY - 240, 36, 95);
  drawTower(132, groundY - 215, 34, 70);

  ctx.fillStyle = "#92400e";
  roundRect(72, groundY - 35, 32, 65, 12);
  ctx.fill();

  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(88, groundY - 32, 16, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = "#fbbf24";

  for (let i = 0; i < 5; i++) {
    ctx.fillRect(35 + i * 24, groundY - 172, 14, 15);
  }

  const hpRatio = Math.max(0, castleHp / castleMaxHp);

  ctx.fillStyle = "rgba(28,25,23,.9)";
  ctx.fillRect(30, groundY - 195, 112, 12);

  ctx.fillStyle = hpRatio > 0.35 ? "#16a34a" : "#dc2626";
  ctx.fillRect(30, groundY - 195, 112 * hpRatio, 12);

  ctx.restore();
}

function drawTower(x, y, w, h) {
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "#a16207";
  ctx.beginPath();
  ctx.moveTo(x - 4, y);
  ctx.lineTo(x + w / 2, y - 24);
  ctx.lineTo(x + w + 4, y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#57534e";
}

function drawUnits() {
  units.forEach(unit => {
    ctx.save();

    if (unit.type === "swordsman") drawSwordsman(unit);
    if (unit.type === "archer") drawArcher(unit);
    if (unit.type === "knight") drawKnight(unit);

    drawHpBar(unit, unit.color);
    ctx.restore();
  });
}

function drawSwordsman(unit) {
  ctx.fillStyle = "#fef3c7";
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(unit.x, unit.y - 28, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#b45309";
  roundRect(unit.x - 10, unit.y - 20, 20, 28, 6);
  ctx.fill();

  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(unit.x + 12, unit.y - 28);
  ctx.lineTo(unit.x + 30, unit.y - 48);
  ctx.stroke();

  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(unit.x - 7, unit.y + 8);
  ctx.lineTo(unit.x - 14, unit.y + 23);
  ctx.moveTo(unit.x + 7, unit.y + 8);
  ctx.lineTo(unit.x + 14, unit.y + 23);
  ctx.stroke();
}

function drawArcher(unit) {
  ctx.fillStyle = "#bbf7d0";
  ctx.strokeStyle = "#14532d";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(unit.x, unit.y - 28, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#15803d";
  roundRect(unit.x - 9, unit.y - 20, 18, 28, 6);
  ctx.fill();

  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(unit.x + 18, unit.y - 22, 16, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(unit.x + 18, unit.y - 38);
  ctx.lineTo(unit.x + 18, unit.y - 6);
  ctx.stroke();

  ctx.strokeStyle = "#14532d";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(unit.x - 6, unit.y + 8);
  ctx.lineTo(unit.x - 11, unit.y + 23);
  ctx.moveTo(unit.x + 6, unit.y + 8);
  ctx.lineTo(unit.x + 11, unit.y + 23);
  ctx.stroke();
}

function drawKnight(unit) {
  ctx.fillStyle = "#bfdbfe";
  ctx.strokeStyle = "#1e3a8a";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(unit.x, unit.y - 30, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#2563eb";
  roundRect(unit.x - 12, unit.y - 22, 24, 32, 7);
  ctx.fill();

  ctx.fillStyle = "#93c5fd";
  ctx.beginPath();
  ctx.arc(unit.x - 18, unit.y - 13, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(unit.x + 14, unit.y - 26);
  ctx.lineTo(unit.x + 32, unit.y - 42);
  ctx.stroke();

  ctx.strokeStyle = "#1e3a8a";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(unit.x - 7, unit.y + 10);
  ctx.lineTo(unit.x - 12, unit.y + 25);
  ctx.moveTo(unit.x + 7, unit.y + 10);
  ctx.lineTo(unit.x + 12, unit.y + 25);
  ctx.stroke();
}

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.save();

    if (enemy.type === "goblin") drawGoblin(enemy);
    if (enemy.type === "orc") drawOrc(enemy);
    if (enemy.type === "troll") drawTroll(enemy);
    if (enemy.type === "boss") drawOgreKing(enemy);

    drawHpBar(enemy, enemy.color);
    ctx.restore();
  });
}

function drawGoblin(enemy) {
  ctx.fillStyle = "#22c55e";
  ctx.strokeStyle = "#052e16";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y - 28, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#166534";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(enemy.x - 5, enemy.y - 13);
  ctx.lineTo(enemy.x - 10, enemy.y + 8);
  ctx.moveTo(enemy.x + 5, enemy.y - 13);
  ctx.lineTo(enemy.x + 10, enemy.y + 8);
  ctx.stroke();

  ctx.fillStyle = "#052e16";

  ctx.beginPath();
  ctx.arc(enemy.x - 5, enemy.y - 31, 2.5, 0, Math.PI * 2);
  ctx.arc(enemy.x + 5, enemy.y - 31, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#166534";

  ctx.beginPath();
  ctx.moveTo(enemy.x - 12, enemy.y - 38);
  ctx.lineTo(enemy.x - 24, enemy.y - 46);
  ctx.lineTo(enemy.x - 10, enemy.y - 32);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(enemy.x + 12, enemy.y - 38);
  ctx.lineTo(enemy.x + 24, enemy.y - 46);
  ctx.lineTo(enemy.x + 10, enemy.y - 32);
  ctx.fill();
}

function drawOrc(enemy) {
  ctx.fillStyle = "#ea580c";
  ctx.strokeStyle = "#7c2d12";
  ctx.lineWidth = 2;

  roundRect(enemy.x - 16, enemy.y - 46, 32, 36, 8);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#7c2d12";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(enemy.x - 8, enemy.y - 10);
  ctx.lineTo(enemy.x - 13, enemy.y + 12);
  ctx.moveTo(enemy.x + 8, enemy.y - 10);
  ctx.lineTo(enemy.x + 13, enemy.y + 12);
  ctx.stroke();

  ctx.fillStyle = "#7c2d12";

  ctx.beginPath();
  ctx.arc(enemy.x - 6, enemy.y - 33, 3, 0, Math.PI * 2);
  ctx.arc(enemy.x + 6, enemy.y - 33, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#d6d3d1";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(enemy.x + 16, enemy.y - 38);
  ctx.lineTo(enemy.x + 34, enemy.y - 53);
  ctx.stroke();
}

function drawTroll(enemy) {
  ctx.fillStyle = "#7c3aed";
  ctx.strokeStyle = "#4c1d95";
  ctx.lineWidth = 2;

  roundRect(enemy.x - 22, enemy.y - 56, 44, 50, 12);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#4c1d95";
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.moveTo(enemy.x - 9, enemy.y - 6);
  ctx.lineTo(enemy.x - 16, enemy.y + 20);
  ctx.moveTo(enemy.x + 9, enemy.y - 6);
  ctx.lineTo(enemy.x + 16, enemy.y + 20);
  ctx.stroke();

  ctx.fillStyle = "#2e1065";

  ctx.beginPath();
  ctx.arc(enemy.x - 8, enemy.y - 40, 3, 0, Math.PI * 2);
  ctx.arc(enemy.x + 8, enemy.y - 40, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#a78bfa";
  roundRect(enemy.x - 15, enemy.y - 20, 30, 18, 6);
  ctx.fill();
}

function drawOgreKing(enemy) {
  ctx.fillStyle = "#dc2626";
  ctx.strokeStyle = "#7f1d1d";
  ctx.lineWidth = 3;

  roundRect(enemy.x - 30, enemy.y - 72, 60, 66, 14);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#7f1d1d";
  ctx.lineWidth = 6;

  ctx.beginPath();
  ctx.moveTo(enemy.x - 12, enemy.y - 8);
  ctx.lineTo(enemy.x - 20, enemy.y + 24);
  ctx.moveTo(enemy.x + 12, enemy.y - 8);
  ctx.lineTo(enemy.x + 20, enemy.y + 24);
  ctx.stroke();

  ctx.fillStyle = "#fbbf24";

  ctx.beginPath();
  ctx.moveTo(enemy.x - 22, enemy.y - 74);
  ctx.lineTo(enemy.x - 11, enemy.y - 96);
  ctx.lineTo(enemy.x, enemy.y - 74);
  ctx.lineTo(enemy.x + 11, enemy.y - 96);
  ctx.lineTo(enemy.x + 22, enemy.y - 74);
  ctx.fill();

  ctx.fillStyle = "#450a0a";

  ctx.beginPath();
  ctx.arc(enemy.x - 10, enemy.y - 50, 4, 0, Math.PI * 2);
  ctx.arc(enemy.x + 10, enemy.y - 50, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawHpBar(entity, color) {
  const width = entity.boss ? 62 : 44;
  const ratio = Math.max(0, entity.hp / entity.maxHp);

  ctx.fillStyle = "rgba(28,25,23,.9)";
  ctx.fillRect(entity.x - width / 2, entity.y - 62, width, 6);

  ctx.fillStyle = color;
  ctx.fillRect(entity.x - width / 2, entity.y - 62, width * ratio, 6);
}

function drawProjectiles() {
  projectiles.forEach(projectile => {
    ctx.save();

    ctx.fillStyle = projectile.color;

    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawWaveInfo() {
  if (!waveActive && waveDelay > 0) {
    ctx.save();

    ctx.fillStyle = "rgba(68,45,27,.85)";
    ctx.strokeStyle = "rgba(251,191,36,.65)";
    ctx.lineWidth = 1.5;

    roundRect(GAME_WIDTH / 2 - 130, 20, 260, 40, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fef3c7";
    ctx.font = "bold 16px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`Next Wave: ${wave + 1}`, GAME_WIDTH / 2, 40);

    ctx.restore();
  }
}

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 30,
      color
    });
  }
}

function updateParticles() {
  particles.forEach(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life--;
  });

  particles = particles.filter(particle => particle.life > 0);
}

function drawParticles() {
  particles.forEach(particle => {
    ctx.save();

    ctx.globalAlpha = particle.life / 30;
    ctx.fillStyle = particle.color;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function createFloatingText(x, y, value, color) {
  floatingTexts.push({
    x,
    y,
    value,
    color,
    life: 60
  });
}

function updateFloatingTexts() {
  floatingTexts.forEach(text => {
    text.y -= 0.6;
    text.life--;
  });

  floatingTexts = floatingTexts.filter(text => text.life > 0);
}

function drawFloatingTexts() {
  floatingTexts.forEach(text => {
    ctx.save();

    ctx.globalAlpha = text.life / 60;
    ctx.fillStyle = text.color;
    ctx.font = "bold 16px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.value, text.x, text.y);

    ctx.restore();
  });
}

function updateUI() {
  goldEl.textContent = Math.floor(gold);
  castleHpEl.textContent = Math.max(0, Math.floor(castleHp));
  waveEl.textContent = wave;
  killsEl.textContent = kills;
  scoreEl.textContent = score;

  costMineEl.textContent = `${getMineCost()} gold`;
  costWallsEl.textContent = `${getWallsCost()} gold`;
  costBlacksmithEl.textContent = `${getBlacksmithCost()} gold`;

  if (score > best) {
    best = score;
    localStorage.setItem("braveFortressBestFixedVisual", best);
    bestEl.textContent = best;
  }
}

function gameOver() {
  running = false;
  cancelAnimationFrame(animationId);

  showOverlay(
    "💀 Castle Destroyed",
    `Final score: ${score}. You survived until wave ${wave}.`,
    "Play Again",
    startGame
  );
}

function showOverlay(title, text, buttonText, action) {
  overlay.innerHTML = `
    <div class="panel">
      <h2>${title}</h2>
      <p>${text}</p>
      <button id="overlayBtn">${buttonText}</button>
    </div>
  `;

  overlay.style.display = "grid";
  document.getElementById("overlayBtn").onclick = action;
}

function togglePause() {
  if (!running) return;

  paused = !paused;

  if (paused) {
    showOverlay(
      "⏸️ Paused",
      "Press P or click Continue.",
      "Continue",
      togglePause
    );
  } else {
    overlay.style.display = "none";
  }
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();

  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);

  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);

  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);

  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);

  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

document.addEventListener("keydown", event => {
  if (event.key.toLowerCase() === "p") {
    togglePause();
  }
});

window.startGame = startGame;
window.spawnUnit = spawnUnit;
window.buyUpgrade = buyUpgrade;

drawBackground();
drawCastle();
updateUI();
