const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const moneyEl = document.getElementById("money");
const baseHpEl = document.getElementById("baseHp");
const waveEl = document.getElementById("wave");
const killsEl = document.getElementById("kills");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");

const TILE = 40;
const COLS = 20;
const ROWS = 12;

const towerTypes = {
  laser: { name: "Laser", cost: 50, range: 130, damage: 18, fireRate: 42, color: "#38bdf8", icon: "🔫" },
  tesla: { name: "Tesla", cost: 80, range: 150, damage: 13, fireRate: 70, color: "#a78bfa", icon: "⚡", chains: 3, chainRange: 95 },
  freeze: { name: "Freeze", cost: 70, range: 120, damage: 5, fireRate: 50, color: "#67e8f9", icon: "❄️", slowPower: 0.45, slowTime: 120 },
  cannon: { name: "Cannon", cost: 90, range: 135, damage: 34, fireRate: 95, color: "#f97316", icon: "💣", splash: 70 }
};

const pathTiles = [
  { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
  { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 },
  { x: 10, y: 2 }, { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 10, y: 5 },
  { x: 9, y: 5 }, { x: 8, y: 5 }, { x: 7, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 5 },
  { x: 4, y: 5 }, { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 3, y: 7 }, { x: 3, y: 8 },
  { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 },
  { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },
  { x: 14, y: 8 }, { x: 15, y: 8 }, { x: 16, y: 8 }, { x: 17, y: 8 }, { x: 18, y: 8 }, { x: 19, y: 8 }
];

let towers = [];
let enemies = [];
let effects = [];
let particles = [];

let money = 120;
let baseHp = 25;
let wave = 1;
let kills = 0;
let score = 0;
let best = localStorage.getItem("neonTowerDefenseBestV2") || 0;

let running = false;
let paused = false;
let animationId;

let spawnTimer = 0;
let enemiesToSpawn = 0;
let spawnedInWave = 0;
let waveActive = false;
let waveDelay = 120;
let selectedTowerType = "laser";

bestEl.textContent = best;

function selectTowerType(type) {
  selectedTowerType = type;

  document.querySelectorAll(".tower-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.type === type);
  });
}

function startGame() {
  towers = [];
  enemies = [];
  effects = [];
  particles = [];

  money = 120;
  baseHp = 25;
  wave = 1;
  kills = 0;
  score = 0;

  spawnTimer = 0;
  enemiesToSpawn = getWaveEnemyCount();
  spawnedInWave = 0;
  waveActive = true;
  waveDelay = 120;

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
  updateWave();
  updateEnemies();
  updateTowers();
  updateEffects();
  updateParticles();
  updateUI();
}

function updateWave() {
  if (!waveActive) {
    waveDelay--;

    if (waveDelay <= 0) {
      wave++;
      enemiesToSpawn = getWaveEnemyCount();
      spawnedInWave = 0;
      waveActive = true;

      if (wave % 5 === 0) {
        createFloatingText(canvas.width / 2, 40, `BOSS WAVE ${wave}`, "#f43f5e");
      }
    }

    return;
  }

  spawnTimer++;

  const spawnDelay = Math.max(15, 52 - wave * 2);

  if (spawnTimer > spawnDelay && spawnedInWave < enemiesToSpawn) {
    spawnEnemy();
    spawnedInWave++;
    spawnTimer = 0;
  }

  if (spawnedInWave >= enemiesToSpawn && enemies.length === 0) {
    waveActive = false;
    waveDelay = 160;
    money += 30 + wave * 7;
    createFloatingText(canvas.width / 2, 40, `WAVE ${wave} CLEARED`, "#22c55e");
  }
}

function getWaveEnemyCount() {
  if (wave % 5 === 0) return 10 + wave;
  return 8 + wave * 3;
}

function spawnEnemy() {
  const start = pathTiles[0];
  const isBoss = wave % 5 === 0 && spawnedInWave === enemiesToSpawn - 1;

  let hp = 60 + wave * 18;
  let speed = 0.75 + wave * 0.035;
  let radius = 12;
  let reward = 10 + Math.floor(wave * 1.5);
  let color = "#22c55e";
  let bossType = null;

  if (isBoss) {
    const bossTypes = ["tank", "speed", "shield"];
    bossType = bossTypes[Math.floor((wave / 5 - 1) % bossTypes.length)];
    color = "#f43f5e";
    radius = 22;
    reward *= 8;

    if (bossType === "tank") {
      hp *= 9;
      speed *= 0.55;
    }

    if (bossType === "speed") {
      hp *= 4;
      speed *= 1.85;
      color = "#facc15";
    }

    if (bossType === "shield") {
      hp *= 6;
      speed *= 0.85;
      color = "#a78bfa";
    }
  } else if (wave >= 4 && Math.random() < 0.22) {
    color = "#38bdf8";
    speed *= 1.55;
    hp *= 0.65;
    reward += 4;
  } else if (wave >= 6 && Math.random() < 0.18) {
    color = "#a78bfa";
    speed *= 0.65;
    hp *= 2.2;
    radius = 15;
    reward += 7;
  }

  enemies.push({
    x: start.x * TILE + TILE / 2,
    y: start.y * TILE + TILE / 2,
    hp,
    maxHp: hp,
    speed,
    reward,
    pathIndex: 0,
    radius,
    color,
    boss: isBoss,
    bossType,
    slowTimer: 0,
    slowFactor: 1,
    shieldTimer: isBoss && bossType === "shield" ? 180 : 0,
    shieldActive: false
  });
}

function updateEnemies() {
  enemies.forEach(enemy => {
    updateEnemyStatus(enemy);

    const nextTile = pathTiles[enemy.pathIndex + 1];

    if (!nextTile) {
      enemy.reachedBase = true;
      baseHp -= enemy.boss ? 6 : 1;

      if (baseHp <= 0) {
        gameOver();
      }

      return;
    }

    const targetX = nextTile.x * TILE + TILE / 2;
    const targetY = nextTile.y * TILE + TILE / 2;

    const dx = targetX - enemy.x;
    const dy = targetY - enemy.y;
    const dist = Math.hypot(dx, dy);
    const currentSpeed = enemy.speed * enemy.slowFactor;

    if (dist < currentSpeed) {
      enemy.x = targetX;
      enemy.y = targetY;
      enemy.pathIndex++;
    } else {
      enemy.x += (dx / dist) * currentSpeed;
      enemy.y += (dy / dist) * currentSpeed;
    }
  });

  enemies = enemies.filter(enemy => !enemy.reachedBase && enemy.hp > 0);
}

function updateEnemyStatus(enemy) {
  if (enemy.slowTimer > 0) {
    enemy.slowTimer--;
  } else {
    enemy.slowFactor = 1;
  }

  if (enemy.bossType === "shield") {
    enemy.shieldTimer--;

    if (enemy.shieldTimer <= 0) {
      enemy.shieldActive = !enemy.shieldActive;
      enemy.shieldTimer = enemy.shieldActive ? 130 : 170;
      createParticles(enemy.x, enemy.y, enemy.shieldActive ? "#a78bfa" : "#38bdf8", 18);
    }
  }
}

function updateTowers() {
  towers.forEach(tower => {
    tower.cooldown--;

    if (tower.cooldown > 0) return;

    const target = findTarget(tower);

    if (!target) return;

    if (tower.type === "laser") attackLaser(tower, target);
    if (tower.type === "tesla") attackTesla(tower, target);
    if (tower.type === "freeze") attackFreeze(tower, target);
    if (tower.type === "cannon") attackCannon(tower, target);

    tower.cooldown = tower.fireRate;
  });
}

function attackLaser(tower, target) {
  damageEnemy(target, tower.damage);

  effects.push({ type: "laser", x1: tower.x, y1: tower.y, x2: target.x, y2: target.y, color: tower.color, life: 10 });
  createParticles(target.x, target.y, tower.color, 5);
}

function attackTesla(tower, target) {
  let chainTargets = [target];
  let current = target;

  for (let i = 1; i < tower.chains; i++) {
    const next = enemies
      .filter(enemy => !chainTargets.includes(enemy))
      .filter(enemy => Math.hypot(enemy.x - current.x, enemy.y - current.y) <= tower.chainRange)
      .sort((a, b) => Math.hypot(a.x - current.x, a.y - current.y) - Math.hypot(b.x - current.x, b.y - current.y))[0];

    if (!next) break;

    chainTargets.push(next);
    current = next;
  }

  let fromX = tower.x;
  let fromY = tower.y;

  chainTargets.forEach((enemy, index) => {
    damageEnemy(enemy, Math.max(4, tower.damage - index * 3));

    effects.push({ type: "laser", x1: fromX, y1: fromY, x2: enemy.x, y2: enemy.y, color: tower.color, life: 12, width: 4 });
    createParticles(enemy.x, enemy.y, tower.color, 8);

    fromX = enemy.x;
    fromY = enemy.y;
  });
}

function attackFreeze(tower, target) {
  damageEnemy(target, tower.damage);

  target.slowFactor = tower.slowPower;
  target.slowTimer = tower.slowTime;

  effects.push({ type: "laser", x1: tower.x, y1: tower.y, x2: target.x, y2: target.y, color: tower.color, life: 10 });
  effects.push({ type: "ring", x: target.x, y: target.y, radius: 22, color: tower.color, life: 24 });
  createParticles(target.x, target.y, tower.color, 12);
}

function attackCannon(tower, target) {
  effects.push({ type: "projectile", x: tower.x, y: tower.y, targetX: target.x, targetY: target.y, color: tower.color, life: 16, splash: tower.splash, damage: tower.damage });
}

function explodeCannon(projectile) {
  enemies.forEach(enemy => {
    const dist = Math.hypot(enemy.x - projectile.targetX, enemy.y - projectile.targetY);

    if (dist <= projectile.splash) {
      const damage = projectile.damage * (1 - dist / (projectile.splash * 1.7));
      damageEnemy(enemy, Math.max(8, damage));
    }
  });

  effects.push({ type: "ring", x: projectile.targetX, y: projectile.targetY, radius: projectile.splash, color: projectile.color, life: 22 });
  createParticles(projectile.targetX, projectile.targetY, projectile.color, 38);
}

function damageEnemy(enemy, amount) {
  if (enemy.shieldActive) {
    amount *= 0.25;
    effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: enemy.radius + 12, color: "#a78bfa", life: 14 });
  }

  enemy.hp -= amount;

  if (enemy.hp <= 0 && !enemy.counted) {
    enemy.counted = true;
    money += enemy.reward;
    kills++;
    score += enemy.boss ? 350 : 50;
    createParticles(enemy.x, enemy.y, enemy.color, enemy.boss ? 55 : 24);
  }
}

function findTarget(tower) {
  let bestTarget = null;
  let bestProgress = -1;

  enemies.forEach(enemy => {
    const dist = Math.hypot(tower.x - enemy.x, tower.y - enemy.y);

    if (dist <= tower.range) {
      const progress = enemy.pathIndex * 1000 + enemy.x + enemy.y;

      if (progress > bestProgress) {
        bestProgress = progress;
        bestTarget = enemy;
      }
    }
  });

  return bestTarget;
}

function updateEffects() {
  effects.forEach(effect => {
    effect.life--;

    if (effect.type === "projectile") {
      const dx = effect.targetX - effect.x;
      const dy = effect.targetY - effect.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 16 || effect.life <= 0) {
        effect.dead = true;
        explodeCannon(effect);
      } else {
        effect.x += (dx / dist) * 12;
        effect.y += (dy / dist) * 12;
      }
    }
  });

  effects = effects.filter(effect => !effect.dead && effect.life > 0);
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  });

  particles = particles.filter(p => p.life > 0);
}

function buildTower(tileX, tileY) {
  if (!running || paused) return;

  const config = towerTypes[selectedTowerType];

  if (money < config.cost) {
    createFloatingText(tileX * TILE + TILE / 2, tileY * TILE + TILE / 2, "NO MONEY", "#f43f5e");
    return;
  }

  if (isPath(tileX, tileY)) return;

  const exists = towers.some(tower => tower.tileX === tileX && tower.tileY === tileY);
  if (exists) return;

  towers.push({
    type: selectedTowerType,
    name: config.name,
    tileX,
    tileY,
    x: tileX * TILE + TILE / 2,
    y: tileY * TILE + TILE / 2,
    range: config.range,
    damage: config.damage,
    fireRate: config.fireRate,
    cooldown: 0,
    color: config.color,
    icon: config.icon,
    chains: config.chains || 0,
    chainRange: config.chainRange || 0,
    slowPower: config.slowPower || 1,
    slowTime: config.slowTime || 0,
    splash: config.splash || 0,
    level: 1
  });

  money -= config.cost;
  createParticles(tileX * TILE + TILE / 2, tileY * TILE + TILE / 2, config.color, 26);
}

function createFloatingText(x, y, text, color) {
  particles.push({ x, y, vx: 0, vy: -0.8, life: 45, color, text });
}

function draw() {
  drawBackground();
  drawGrid();
  drawPath();
  drawBase();
  drawTowers();
  drawEnemies();
  drawEffects();
  drawParticles();
  drawWaveInfo();
}

function drawBackground() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(canvas.width / 2, canvas.height, 40, canvas.width / 2, canvas.height, canvas.width);
  glow.addColorStop(0, "rgba(56,189,248,.15)");
  glow.addColorStop(1, "rgba(2,6,23,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
  ctx.strokeStyle = "rgba(56,189,248,.055)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE, 0);
    ctx.lineTo(x * TILE, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE);
    ctx.lineTo(canvas.width, y * TILE);
    ctx.stroke();
  }
}

function drawPath() {
  pathTiles.forEach((tile, index) => {
    const x = tile.x * TILE;
    const y = tile.y * TILE;

    ctx.save();
    ctx.shadowColor = "#a78bfa";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "rgba(167,139,250,.18)";
    ctx.strokeStyle = "rgba(167,139,250,.5)";
    ctx.lineWidth = 1.5;

    roundRect(x + 3, y + 3, TILE - 6, TILE - 6, 8);
    ctx.fill();
    ctx.stroke();

    if (index === 0) {
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("START", x + TILE / 2, y + TILE / 2);
    }

    ctx.restore();
  });
}

function drawBase() {
  const end = pathTiles[pathTiles.length - 1];

  ctx.save();
  ctx.shadowColor = "#f43f5e";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "rgba(244,63,94,.35)";
  ctx.strokeStyle = "#f43f5e";
  ctx.lineWidth = 2;

  roundRect(end.x * TILE + 4, end.y * TILE + 4, TILE - 8, TILE - 8, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fecdd3";
  ctx.font = "bold 11px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("BASE", end.x * TILE + TILE / 2, end.y * TILE + TILE / 2);
  ctx.restore();
}

function drawTowers() {
  towers.forEach(tower => {
    ctx.save();
    ctx.shadowColor = tower.color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = "rgba(15,23,42,.9)";
    ctx.strokeStyle = tower.color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = tower.color;
    ctx.font = "bold 15px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tower.icon, tower.x, tower.y + 1);

    ctx.strokeStyle = "rgba(56,189,248,.07)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.save();
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = enemy.boss ? 28 : 18;
    ctx.fillStyle = enemy.color;

    if (enemy.bossType === "shield" && enemy.shieldActive) {
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 9, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#020617";
    ctx.beginPath();
    ctx.arc(enemy.x - 4, enemy.y - 3, 2.5, 0, Math.PI * 2);
    ctx.arc(enemy.x + 4, enemy.y - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    const hpWidth = enemy.boss ? 46 : 26;
    const hpHeight = enemy.boss ? 5 : 4;
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

    ctx.fillStyle = "rgba(15,23,42,.9)";
    ctx.fillRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 13, hpWidth, hpHeight);

    ctx.fillStyle = enemy.slowTimer > 0 ? "#67e8f9" : "#22c55e";
    ctx.fillRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 13, hpWidth * hpRatio, hpHeight);
    ctx.restore();
  });
}

function drawEffects() {
  effects.forEach(effect => {
    ctx.save();

    if (effect.type === "laser") {
      ctx.globalAlpha = effect.life / 12;
      ctx.strokeStyle = effect.color;
      ctx.shadowColor = effect.color;
      ctx.shadowBlur = 18;
      ctx.lineWidth = effect.width || 3;
      ctx.beginPath();
      ctx.moveTo(effect.x1, effect.y1);
      ctx.lineTo(effect.x2, effect.y2);
      ctx.stroke();
    }

    if (effect.type === "ring") {
      ctx.globalAlpha = effect.life / 24;
      ctx.strokeStyle = effect.color;
      ctx.shadowColor = effect.color;
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * (1.1 - effect.life / 60), 0, Math.PI * 2);
      ctx.stroke();
    }

    if (effect.type === "projectile") {
      ctx.shadowColor = effect.color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = effect.color;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function drawParticles() {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life / 45;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;

    if (p.text) {
      ctx.font = "bold 13px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.text, p.x, p.y);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function drawWaveInfo() {
  if (!waveActive && waveDelay > 0) {
    ctx.save();
    ctx.fillStyle = "rgba(15,23,42,.72)";
    ctx.strokeStyle = "rgba(56,189,248,.4)";
    ctx.lineWidth = 1.5;
    roundRect(canvas.width / 2 - 125, 18, 250, 38, 19);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 16px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`Next Wave: ${wave + 1}`, canvas.width / 2, 37);
    ctx.restore();
  }
}

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 34, color });
  }
}

function updateUI() {
  moneyEl.textContent = money;
  baseHpEl.textContent = baseHp;
  waveEl.textContent = wave;
  killsEl.textContent = kills;
  scoreEl.textContent = score;

  if (score > best) {
    best = score;
    localStorage.setItem("neonTowerDefenseBestV2", best);
    bestEl.textContent = best;
  }
}

function isPath(tileX, tileY) {
  return pathTiles.some(tile => tile.x === tileX && tile.y === tileY);
}

function getMouseTile(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mouseX = (event.clientX - rect.left) * scaleX;
  const mouseY = (event.clientY - rect.top) * scaleY;

  return { x: Math.floor(mouseX / TILE), y: Math.floor(mouseY / TILE) };
}

function gameOver() {
  running = false;
  cancelAnimationFrame(animationId);

  showOverlay("💀 Game Over", `Your score: ${score}. You survived until wave ${wave}.`, "Play Again", startGame);
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
    showOverlay("⏸️ Paused", "Press P or click Continue.", "Continue", togglePause);
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

canvas.addEventListener("click", event => {
  const tile = getMouseTile(event);
  if (tile.x < 0 || tile.x >= COLS || tile.y < 0 || tile.y >= ROWS) return;
  buildTower(tile.x, tile.y);
});

document.addEventListener("keydown", event => {
  if (event.key.toLowerCase() === "p") {
    togglePause();
  }
});

drawBackground();
drawGrid();
drawPath();
drawBase();
