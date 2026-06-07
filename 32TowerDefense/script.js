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

const TOWER_COST = 50;

const pathTiles = [
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
  { x: 3, y: 2 },
  { x: 4, y: 2 },
  { x: 5, y: 2 },
  { x: 6, y: 2 },
  { x: 7, y: 2 },
  { x: 8, y: 2 },
  { x: 9, y: 2 },
  { x: 10, y: 2 },
  { x: 10, y: 3 },
  { x: 10, y: 4 },
  { x: 10, y: 5 },
  { x: 9, y: 5 },
  { x: 8, y: 5 },
  { x: 7, y: 5 },
  { x: 6, y: 5 },
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
  { x: 3, y: 6 },
  { x: 3, y: 7 },
  { x: 3, y: 8 },
  { x: 4, y: 8 },
  { x: 5, y: 8 },
  { x: 6, y: 8 },
  { x: 7, y: 8 },
  { x: 8, y: 8 },
  { x: 9, y: 8 },
  { x: 10, y: 8 },
  { x: 11, y: 8 },
  { x: 12, y: 8 },
  { x: 13, y: 8 },
  { x: 14, y: 8 },
  { x: 15, y: 8 },
  { x: 16, y: 8 },
  { x: 17, y: 8 },
  { x: 18, y: 8 },
  { x: 19, y: 8 }
];

let towers = [];
let enemies = [];
let lasers = [];
let particles = [];

let money = 100;
let baseHp = 20;
let wave = 1;
let kills = 0;
let score = 0;
let best = localStorage.getItem("neonTowerDefenseBest") || 0;

let running = false;
let paused = false;
let animationId;

let spawnTimer = 0;
let enemiesToSpawn = 0;
let spawnedInWave = 0;
let waveActive = false;
let waveDelay = 120;

bestEl.textContent = best;

function startGame() {
  towers = [];
  enemies = [];
  lasers = [];
  particles = [];

  money = 100;
  baseHp = 20;
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
  updateLasers();
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
    }

    return;
  }

  spawnTimer++;

  if (spawnTimer > Math.max(18, 55 - wave * 2) && spawnedInWave < enemiesToSpawn) {
    spawnEnemy();
    spawnedInWave++;
    spawnTimer = 0;
  }

  if (spawnedInWave >= enemiesToSpawn && enemies.length === 0) {
    waveActive = false;
    waveDelay = 160;
    money += 25 + wave * 5;
  }
}

function getWaveEnemyCount() {
  return 8 + wave * 3;
}

function spawnEnemy() {
  const start = pathTiles[0];

  const hp = 60 + wave * 18;
  const speed = 0.75 + wave * 0.035;

  enemies.push({
    x: start.x * TILE + TILE / 2,
    y: start.y * TILE + TILE / 2,
    hp,
    maxHp: hp,
    speed,
    reward: 10 + Math.floor(wave * 1.5),
    pathIndex: 0,
    radius: 12,
    color: wave % 5 === 0 ? "#f43f5e" : "#22c55e",
    boss: wave % 5 === 0
  });

  if (wave % 5 === 0 && spawnedInWave === enemiesToSpawn - 1) {
    const boss = enemies[enemies.length - 1];
    boss.hp *= 4;
    boss.maxHp = boss.hp;
    boss.speed *= 0.6;
    boss.reward *= 5;
    boss.radius = 18;
    boss.color = "#f43f5e";
    boss.boss = true;
  }
}

function updateEnemies() {
  enemies.forEach(enemy => {
    const nextTile = pathTiles[enemy.pathIndex + 1];

    if (!nextTile) {
      enemy.reachedBase = true;
      baseHp -= enemy.boss ? 5 : 1;

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

    if (dist < enemy.speed) {
      enemy.x = targetX;
      enemy.y = targetY;
      enemy.pathIndex++;
    } else {
      enemy.x += (dx / dist) * enemy.speed;
      enemy.y += (dy / dist) * enemy.speed;
    }
  });

  enemies = enemies.filter(enemy => !enemy.reachedBase && enemy.hp > 0);
}

function updateTowers() {
  towers.forEach(tower => {
    tower.cooldown--;

    if (tower.cooldown > 0) return;

    const target = findTarget(tower);

    if (!target) return;

    target.hp -= tower.damage;
    tower.cooldown = tower.fireRate;

    lasers.push({
      x1: tower.x,
      y1: tower.y,
      x2: target.x,
      y2: target.y,
      color: tower.color,
      life: 10
    });

    createParticles(target.x, target.y, tower.color, 5);

    if (target.hp <= 0 && !target.counted) {
      target.counted = true;

      money += target.reward;
      kills++;
      score += target.boss ? 250 : 50;

      createParticles(target.x, target.y, target.color, target.boss ? 42 : 24);
    }
  });
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

function updateLasers() {
  lasers.forEach(laser => {
    laser.life--;
  });

  lasers = lasers.filter(laser => laser.life > 0);
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

  if (money < TOWER_COST) {
    createFloatingText(tileX * TILE + TILE / 2, tileY * TILE + TILE / 2, "NO MONEY", "#f43f5e");
    return;
  }

  if (isPath(tileX, tileY)) return;

  const exists = towers.some(tower => tower.tileX === tileX && tower.tileY === tileY);
  if (exists) return;

  towers.push({
    tileX,
    tileY,
    x: tileX * TILE + TILE / 2,
    y: tileY * TILE + TILE / 2,
    range: 125,
    damage: 18,
    fireRate: 42,
    cooldown: 0,
    color: "#38bdf8",
    level: 1
  });

  money -= TOWER_COST;

  createParticles(tileX * TILE + TILE / 2, tileY * TILE + TILE / 2, "#38bdf8", 24);
}

function createFloatingText(x, y, text, color) {
  particles.push({
    x,
    y,
    vx: 0,
    vy: -0.8,
    life: 45,
    color,
    text
  });
}

function draw() {
  drawBackground();
  drawGrid();
  drawPath();
  drawBase();
  drawTowers();
  drawEnemies();
  drawLasers();
  drawParticles();
  drawWaveInfo();
}

function drawBackground() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height,
    40,
    canvas.width / 2,
    canvas.height,
    canvas.width
  );

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
    ctx.arc(tower.x, tower.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = tower.color;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(56,189,248,.08)";
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
    ctx.shadowBlur = enemy.boss ? 26 : 18;
    ctx.fillStyle = enemy.color;

    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#020617";
    ctx.beginPath();
    ctx.arc(enemy.x - 4, enemy.y - 3, 2.5, 0, Math.PI * 2);
    ctx.arc(enemy.x + 4, enemy.y - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    const hpWidth = enemy.boss ? 34 : 26;
    const hpHeight = 4;
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

    ctx.fillStyle = "rgba(15,23,42,.9)";
    ctx.fillRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 10, hpWidth, hpHeight);

    ctx.fillStyle = "#22c55e";
    ctx.fillRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 10, hpWidth * hpRatio, hpHeight);

    ctx.restore();
  });
}

function drawLasers() {
  lasers.forEach(laser => {
    ctx.save();

    ctx.globalAlpha = laser.life / 10;
    ctx.strokeStyle = laser.color;
    ctx.shadowColor = laser.color;
    ctx.shadowBlur = 18;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(laser.x1, laser.y1);
    ctx.lineTo(laser.x2, laser.y2);
    ctx.stroke();

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
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 34,
      color
    });
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
    localStorage.setItem("neonTowerDefenseBest", best);
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

  return {
    x: Math.floor(mouseX / TILE),
    y: Math.floor(mouseY / TILE)
  };
}

function gameOver() {
  running = false;
  cancelAnimationFrame(animationId);

  showOverlay(
    "💀 Game Over",
    `Your score: ${score}. You survived until wave ${wave}.`,
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
