const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const livesEl = document.getElementById("lives");
const bombsEl = document.getElementById("bombs");
const powerEl = document.getElementById("power");
const speedEl = document.getElementById("speed");
const overlay = document.getElementById("overlay");

const TILE = 38;
const COLS = 16;
const ROWS = 16;

const EMPTY = 0;
const WALL = 1;
const BLOCK = 2;

let map = [];
let player;
let bombs = [];
let explosions = [];
let bonuses = [];
let particles = [];
let enemies = [];

let score = 0;
let best = localStorage.getItem("neonBombermanBest") || 0;
let lives = 3;

let running = false;
let paused = false;
let animationId;

const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

bestEl.textContent = best;

function startGame() {
  score = 0;
  lives = 3;

  player = {
    x: TILE + TILE / 2,
    y: TILE + TILE / 2,
    radius: 11,
    speed: 2.25,
    maxBombs: 1,
    bombPower: 2,
    activeBombs: 0,
    invincible: 120
  };

  bombs = [];
  explosions = [];
  bonuses = [];
  particles = [];
  enemies = [];

  createMap();
  createEnemies();

  running = true;
  paused = false;

  overlay.style.display = "none";

  updateUI();

  cancelAnimationFrame(animationId);
  gameLoop();
}

function createMap() {
  map = [];

  for (let y = 0; y < ROWS; y++) {
    const row = [];

    for (let x = 0; x < COLS; x++) {
      const isBorder = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1;
      const isSolidPillar = x % 2 === 0 && y % 2 === 0;

      if (isBorder || isSolidPillar) {
        row.push(WALL);
      } else {
        const safeStart = x <= 2 && y <= 2;

        if (!safeStart && Math.random() < 0.62) {
          row.push(BLOCK);
        } else {
          row.push(EMPTY);
        }
      }
    }

    map.push(row);
  }

  clearSpawnArea(1, 1);
  clearSpawnArea(14, 14);
  clearSpawnArea(14, 1);
  clearSpawnArea(1, 14);
}

function clearSpawnArea(tileX, tileY) {
  const tiles = [
    { x: tileX, y: tileY },
    { x: tileX + 1, y: tileY },
    { x: tileX - 1, y: tileY },
    { x: tileX, y: tileY + 1 },
    { x: tileX, y: tileY - 1 }
  ];

  tiles.forEach(tile => {
    if (map[tile.y] && map[tile.y][tile.x] !== undefined) {
      if (map[tile.y][tile.x] !== WALL) {
        map[tile.y][tile.x] = EMPTY;
      }
    }
  });
}

function createEnemies() {
  enemies = [
    createEnemy(14, 14, "#38bdf8"),
    createEnemy(14, 1, "#a78bfa"),
    createEnemy(1, 14, "#22c55e")
  ];
}

function createEnemy(tileX, tileY, color) {
  const x = tileX * TILE + TILE / 2;
  const y = tileY * TILE + TILE / 2;

  return {
    x,
    y,
    tileX,
    tileY,
    targetX: x,
    targetY: y,
    radius: 10,
    speed: 1.15,
    dirX: 0,
    dirY: 1,
    color
  };
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
  movePlayer();
  moveEnemies();
  updateBombs();
  updateExplosions();
  updateBonuses();
  updateParticles();
  checkPlayerDamage();
  checkEnemyDamage();

  if (player.invincible > 0) player.invincible--;

  updateUI();
}

function movePlayer() {
  let dx = 0;
  let dy = 0;

  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;

  if (dx !== 0) {
    alignToTileCenter(player, "y", player.speed);
    moveEntity(player, dx * player.speed, 0);
  }

  if (dy !== 0) {
    alignToTileCenter(player, "x", player.speed);
    moveEntity(player, 0, dy * player.speed);
  }
}

function moveMobile(dx, dy) {
  if (!running || paused) return;

  if (dx !== 0) {
    alignToTileCenter(player, "y", player.speed * 2);
    moveEntity(player, dx * player.speed * 5, 0);
  }

  if (dy !== 0) {
    alignToTileCenter(player, "x", player.speed * 2);
    moveEntity(player, 0, dy * player.speed * 5);
  }
}

function moveEnemies() {
  enemies.forEach(enemy => {
    const dx = enemy.targetX - enemy.x;
    const dy = enemy.targetY - enemy.y;
    const distance = Math.hypot(dx, dy);

    if (distance > enemy.speed) {
      enemy.x += (dx / distance) * enemy.speed;
      enemy.y += (dy / distance) * enemy.speed;
      return;
    }

    enemy.x = enemy.targetX;
    enemy.y = enemy.targetY;

    enemy.tileX = Math.floor(enemy.x / TILE);
    enemy.tileY = Math.floor(enemy.y / TILE);

    const dirs = getEnemyDirections(enemy);

    if (dirs.length === 0) return;

    let chosen;

    if (Math.random() < 0.35) {
      chosen = chooseDirectionToPlayer(enemy, dirs);
    } else {
      chosen = dirs[Math.floor(Math.random() * dirs.length)];
    }

    enemy.dirX = chosen.x;
    enemy.dirY = chosen.y;
    enemy.targetX = (enemy.tileX + chosen.x) * TILE + TILE / 2;
    enemy.targetY = (enemy.tileY + chosen.y) * TILE + TILE / 2;
  });
}

function getEnemyDirections(enemy) {
  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  const possible = dirs.filter(dir => {
    return canEnemyEnterTile(enemy.tileX + dir.x, enemy.tileY + dir.y);
  });

  const withoutReverse = possible.filter(dir => {
    return !(dir.x === -enemy.dirX && dir.y === -enemy.dirY);
  });

  return withoutReverse.length > 0 ? withoutReverse : possible;
}

function canEnemyEnterTile(tileX, tileY) {
  if (!map[tileY] || map[tileY][tileX] === undefined) return false;
  if (map[tileY][tileX] === WALL || map[tileY][tileX] === BLOCK) return false;

  return !bombs.some(bomb => bomb.tileX === tileX && bomb.tileY === tileY);
}

function chooseDirectionToPlayer(enemy, dirs) {
  return dirs.reduce((best, dir) => {
    const nextX = (enemy.tileX + dir.x) * TILE + TILE / 2;
    const nextY = (enemy.tileY + dir.y) * TILE + TILE / 2;

    const bestX = (enemy.tileX + best.x) * TILE + TILE / 2;
    const bestY = (enemy.tileY + best.y) * TILE + TILE / 2;

    const distance = Math.hypot(nextX - player.x, nextY - player.y);
    const bestDistance = Math.hypot(bestX - player.x, bestY - player.y);

    return distance < bestDistance ? dir : best;
  }, dirs[0]);
}

function alignToTileCenter(entity, axis, maxStep) {
  const tile = getTile(entity.x, entity.y);
  const centerX = tile.x * TILE + TILE / 2;
  const centerY = tile.y * TILE + TILE / 2;

  if (axis === "x") {
    const diff = centerX - entity.x;
    if (Math.abs(diff) < 0.5) {
      entity.x = centerX;
      return;
    }

    const step = Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
    if (!willCollide(entity, step, 0)) {
      entity.x += step;
    }
  }

  if (axis === "y") {
    const diff = centerY - entity.y;
    if (Math.abs(diff) < 0.5) {
      entity.y = centerY;
      return;
    }

    const step = Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
    if (!willCollide(entity, 0, step)) {
      entity.y += step;
    }
  }
}

function moveEntity(entity, dx, dy) {
  if (!willCollide(entity, dx, dy)) {
    entity.x += dx;
    entity.y += dy;
  }
}

function willCollide(entity, dx, dy) {
  const nextX = entity.x + dx;
  const nextY = entity.y + dy;
  const r = entity.radius;

  const points = [
    { x: nextX - r, y: nextY - r },
    { x: nextX + r, y: nextY - r },
    { x: nextX - r, y: nextY + r },
    { x: nextX + r, y: nextY + r }
  ];

  return points.some(point => {
    const tx = Math.floor(point.x / TILE);
    const ty = Math.floor(point.y / TILE);

    if (!map[ty] || map[ty][tx] === undefined) return true;

    if (map[ty][tx] === WALL || map[ty][tx] === BLOCK) return true;

    return bombs.some(bomb => {
      const bx = Math.floor(bomb.x / TILE);
      const by = Math.floor(bomb.y / TILE);

      if (bx !== tx || by !== ty) return false;

      if (entity === player && bomb.ownerCanPass) {
        return false;
      }

      return true;
    });
  });
}

function placeBomb() {
  if (!running || paused) return;
  if (player.activeBombs >= player.maxBombs) return;

  const tile = getTile(player.x, player.y);

  const exists = bombs.some(bomb => bomb.tileX === tile.x && bomb.tileY === tile.y);
  if (exists) return;

  bombs.push({
    x: tile.x * TILE + TILE / 2,
    y: tile.y * TILE + TILE / 2,
    tileX: tile.x,
    tileY: tile.y,
    timer: 150,
    power: player.bombPower,
    ownerCanPass: true,
    pulse: 0
  });

  player.activeBombs++;
}

function updateBombs() {
  bombs.forEach(bomb => {
    bomb.timer--;
    bomb.pulse += 0.12;

    const distance = Math.hypot(player.x - bomb.x, player.y - bomb.y);

    if (distance > TILE * 0.8) {
      bomb.ownerCanPass = false;
    }

    if (bomb.timer <= 0) {
      explodeBomb(bomb);
      bomb.exploded = true;
    }
  });

  bombs = bombs.filter(bomb => !bomb.exploded);
}

function explodeBomb(bomb) {
  player.activeBombs = Math.max(0, player.activeBombs - 1);

  const affected = [
    { x: bomb.tileX, y: bomb.tileY }
  ];

  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  dirs.forEach(dir => {
    for (let i = 1; i <= bomb.power; i++) {
      const tx = bomb.tileX + dir.x * i;
      const ty = bomb.tileY + dir.y * i;

      if (!map[ty] || map[ty][tx] === WALL) break;

      affected.push({ x: tx, y: ty });

      if (map[ty][tx] === BLOCK) {
        destroyBlock(tx, ty);
        break;
      }
    }
  });

  affected.forEach(tile => {
    explosions.push({
      x: tile.x,
      y: tile.y,
      timer: 26
    });

    createParticles(
      tile.x * TILE + TILE / 2,
      tile.y * TILE + TILE / 2,
      "#f97316",
      12
    );
  });

  bombs.forEach(otherBomb => {
    if (
      affected.some(tile => tile.x === otherBomb.tileX && tile.y === otherBomb.tileY)
    ) {
      otherBomb.timer = Math.min(otherBomb.timer, 1);
    }
  });
}

function destroyBlock(x, y) {
  map[y][x] = EMPTY;
  score += 25;

  if (Math.random() < 0.35) {
    spawnBonus(x, y);
  }

  createParticles(
    x * TILE + TILE / 2,
    y * TILE + TILE / 2,
    "#38bdf8",
    20
  );
}

function spawnBonus(tileX, tileY) {
  const types = ["bomb", "power", "speed"];
  const type = types[Math.floor(Math.random() * types.length)];
  const data = getBonusData(type);

  bonuses.push({
    x: tileX * TILE + TILE / 2,
    y: tileY * TILE + TILE / 2,
    type,
    color: data.color,
    icon: data.icon,
    pulse: 0
  });
}

function getBonusData(type) {
  if (type === "bomb") {
    return { color: "#38bdf8", icon: "💣" };
  }

  if (type === "power") {
    return { color: "#f97316", icon: "🔥" };
  }

  return { color: "#22c55e", icon: "⚡" };
}

function updateExplosions() {
  explosions.forEach(explosion => {
    explosion.timer--;
  });

  explosions = explosions.filter(explosion => explosion.timer > 0);
}

function updateBonuses() {
  bonuses.forEach(bonus => {
    bonus.pulse += 0.08;

    const distance = Math.hypot(player.x - bonus.x, player.y - bonus.y);

    if (distance < player.radius + 14) {
      activateBonus(bonus.type);
      bonus.collected = true;
      createParticles(bonus.x, bonus.y, bonus.color, 24);
    }
  });

  bonuses = bonuses.filter(bonus => !bonus.collected);
}

function activateBonus(type) {
  if (type === "bomb") {
    player.maxBombs = Math.min(player.maxBombs + 1, 5);
    score += 50;
  }

  if (type === "power") {
    player.bombPower = Math.min(player.bombPower + 1, 6);
    score += 50;
  }

  if (type === "speed") {
    player.speed = Math.min(player.speed + 0.25, 4);
    score += 50;
  }
}

function checkPlayerDamage() {
  const playerTile = getTile(player.x, player.y);

  const hitByExplosion = explosions.some(explosion => {
    return explosion.x === playerTile.x && explosion.y === playerTile.y;
  });

  const hitByEnemy = enemies.some(enemy => {
    return Math.hypot(player.x - enemy.x, player.y - enemy.y) < player.radius + enemy.radius - 2;
  });

  if ((hitByExplosion || hitByEnemy) && player.invincible <= 0) {
    loseLife();
  }
}

function checkEnemyDamage() {
  enemies.forEach(enemy => {
    const enemyTile = getTile(enemy.x, enemy.y);

    const hit = explosions.some(explosion => {
      return explosion.x === enemyTile.x && explosion.y === enemyTile.y;
    });

    if (hit) {
      score += 150;
      createParticles(enemy.x, enemy.y, enemy.color, 36);
      enemy.dead = true;
    }
  });

  enemies = enemies.filter(enemy => !enemy.dead);

  if (enemies.length === 0) {
    createEnemies();
  }
}

function loseLife() {
  lives--;
  livesEl.textContent = lives;

  createParticles(player.x, player.y, "#f43f5e", 42);

  if (lives <= 0) {
    gameOver();
    return;
  }

  player.x = TILE + TILE / 2;
  player.y = TILE + TILE / 2;
  player.invincible = 120;
}

function draw() {
  drawBackground();
  drawMap();
  drawBonuses();
  drawBombs();
  drawExplosions();
  drawPlayer();
  drawEnemies();
  drawParticles();
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

  glow.addColorStop(0, "rgba(244,63,94,.14)");
  glow.addColorStop(1, "rgba(2,6,23,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMap() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = map[y][x];

      if (cell === EMPTY) {
        ctx.strokeStyle = "rgba(56,189,248,.045)";
        ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
      }

      if (cell === WALL) {
        ctx.save();

        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "rgba(56,189,248,.18)";
        ctx.strokeStyle = "rgba(56,189,248,.65)";
        ctx.lineWidth = 1.5;

        roundRect(
          x * TILE + 3,
          y * TILE + 3,
          TILE - 6,
          TILE - 6,
          8
        );

        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      if (cell === BLOCK) {
        ctx.save();

        ctx.shadowColor = "#f97316";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "rgba(249,115,22,.55)";
        ctx.strokeStyle = "rgba(251,146,60,.9)";
        ctx.lineWidth = 1.5;

        roundRect(
          x * TILE + 5,
          y * TILE + 5,
          TILE - 10,
          TILE - 10,
          8
        );

        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    }
  }
}

function drawBombs() {
  bombs.forEach(bomb => {
    const pulse = Math.sin(bomb.pulse) * 2;

    ctx.save();

    ctx.shadowColor = "#f43f5e";
    ctx.shadowBlur = 20;

    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(bomb.x, bomb.y, 12 + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(bomb.x + 4, bomb.y - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(bomb.x + 9, bomb.y - 10, 3 + Math.sin(bomb.pulse * 2) * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawExplosions() {
  explosions.forEach(explosion => {
    const cx = explosion.x * TILE + TILE / 2;
    const cy = explosion.y * TILE + TILE / 2;
    const alpha = explosion.timer / 26;

    ctx.save();

    ctx.globalAlpha = alpha;
    ctx.shadowColor = "#f97316";
    ctx.shadowBlur = 26;
    ctx.fillStyle = "#f97316";

    roundRect(cx - TILE / 2 + 4, cy - TILE / 2 + 4, TILE - 8, TILE - 8, 10);
    ctx.fill();

    ctx.fillStyle = "#facc15";
    ctx.globalAlpha = alpha * 0.8;
    ctx.beginPath();
    ctx.arc(cx, cy, 10 + (1 - alpha) * 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawBonuses() {
  bonuses.forEach(bonus => {
    bonus.pulse += 0.05;

    ctx.save();

    ctx.translate(bonus.x, bonus.y);
    ctx.rotate(bonus.pulse);

    ctx.shadowColor = bonus.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = "rgba(15,23,42,.9)";
    ctx.strokeStyle = bonus.color;
    ctx.lineWidth = 2.5;

    roundRect(-13, -13, 26, 26, 7);
    ctx.fill();
    ctx.stroke();

    ctx.rotate(-bonus.pulse);

    ctx.fillStyle = bonus.color;
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(bonus.icon, 0, 1);

    ctx.restore();
  });
}

function drawPlayer() {
  const blink = player.invincible > 0 && Math.floor(player.invincible / 8) % 2 === 0;

  if (blink) return;

  ctx.save();

  ctx.shadowColor = "#facc15";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "#facc15";

  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.arc(player.x - 5, player.y - 4, 3, 0, Math.PI * 2);
  ctx.arc(player.x + 5, player.y - 4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.arc(player.x, player.y + 5, 4, 0, Math.PI);
  ctx.stroke();

  ctx.restore();
}

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.save();

    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = enemy.color;

    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(enemy.x - 4, enemy.y - 3, 3, 0, Math.PI * 2);
    ctx.arc(enemy.x + 4, enemy.y - 3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#020617";
    ctx.beginPath();
    ctx.arc(enemy.x - 3, enemy.y - 3, 1.5, 0, Math.PI * 2);
    ctx.arc(enemy.x + 5, enemy.y - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7,
      life: 34,
      color
    });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  });

  particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
  particles.forEach(p => {
    ctx.save();

    ctx.globalAlpha = p.life / 34;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function getTile(x, y) {
  return {
    x: Math.floor(x / TILE),
    y: Math.floor(y / TILE)
  };
}

function updateUI() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  bombsEl.textContent = player.maxBombs;
  powerEl.textContent = player.bombPower;
  speedEl.textContent = player.speed.toFixed(1);

  if (score > best) {
    best = score;
    localStorage.setItem("neonBombermanBest", best);
    bestEl.textContent = best;
  }
}

function gameOver() {
  running = false;
  cancelAnimationFrame(animationId);

  showOverlay(
    "💀 Game Over",
    `Your score: ${score}.`,
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

document.addEventListener("keydown", e => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(e.code) || ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keys.left = true;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keys.right = true;
  if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") keys.up = true;
  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") keys.down = true;

  if (e.code === "Space") {
    e.preventDefault();
    placeBomb();
  }

  if (e.key.toLowerCase() === "p") {
    togglePause();
  }
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keys.left = false;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keys.right = false;
  if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") keys.up = false;
  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") keys.down = false;
});

createMap();
drawBackground();
drawMap();
