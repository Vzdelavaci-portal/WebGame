const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const dotsEl = document.getElementById("dots");
const overlay = document.getElementById("overlay");

const tileSize = 32;

const map = [
  "###################",
  "#........#........#",
  "#.###.##.#.##.###.#",
  "#o#.....#.....#..o#",
  "#.###.#.###.#.###.#",
  "#.................#",
  "###.#.#####.#.#.###",
  "#.....#.....#.....#",
  "#.###.#.###.#.###.#",
  "#oP.....#.....#..o#",
  "#.###.#.###.#.###.#",
  "#.....#.....#.....#",
  "###.#.#####.#.#.###",
  "#.................#",
  "#.###.#.###.#.###.#",
  "#o#.....#.....#..o#",
  "#.###.##.#.##.###.#",
  "#........#........#",
  "###################"
];

let player;
let ghosts = [];
let dots = [];
let boosters = [];
let particles = [];

let score = 0;
let best = localStorage.getItem("neonPacmanBest") || 0;
let lives = 3;
let level = 1;

let running = false;
let paused = false;
let animationId;

let frightenedTimer = 0;
let freezeTimer = 0;
let shieldTimer = 0;
let speedTimer = 0;
let invincibleTimer = 0;
let boosterTimer = 0;

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
  level = 1;

  createLevel();
  draw();

  running = true;
  paused = false;

  overlay.style.display = "none";

  cancelAnimationFrame(animationId);
  gameLoop();
}

function createLevel() {
  dots = [];
  boosters = [];
  particles = [];
  frightenedTimer = 0;
  freezeTimer = 0;
  shieldTimer = 0;
  speedTimer = 0;
  invincibleTimer = 70;
  boosterTimer = 0;

  map.forEach((row, y) => {
    row.split("").forEach((cell, x) => {
      const cx = x * tileSize + tileSize / 2;
      const cy = y * tileSize + tileSize / 2;

      if (cell === "." || cell === "o") {
        dots.push({
          x: cx,
          y: cy,
          big: cell === "o",
          eaten: false
        });
      }

      if (cell === "P") {
        player = {
          x: cx,
          y: cy,
          startX: cx,
          startY: cy,
          radius: 12,
          dirX: 0,
          dirY: 0,
          nextDirX: 0,
          nextDirY: 0,
          speed: 2.1,
          mouth: 0
        };
      }
    });
  });

  createGhosts();
  updateUI();
}

function createGhosts() {
  const baseSpeed = 1.4 + level * 0.05;

  ghosts = [
    createGhost(1, 1, "#f43f5e", baseSpeed, "chase"),
    createGhost(17, 1, "#38bdf8", baseSpeed, "random"),
    createGhost(1, 17, "#22c55e", baseSpeed, "ambush"),
    createGhost(17, 17, "#a78bfa", baseSpeed, "wander")
  ];
}

function createGhost(tileX, tileY, color, speed, mode) {
  const x = tileX * tileSize + tileSize / 2;
  const y = tileY * tileSize + tileSize / 2;

  return {
    x,
    y,
    startX: x,
    startY: y,
    tileX,
    tileY,
    targetX: x,
    targetY: y,
    radius: 10,
    dirX: 1,
    dirY: 0,
    speed,
    color,
    mode
  };
}

function getGhostDirections(ghost) {
  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  const possible = dirs.filter(dir => {
    return canMove(ghost.tileX, ghost.tileY, dir.x, dir.y);
  });

  const withoutReverse = possible.filter(dir => {
    return !(dir.x === -ghost.dirX && dir.y === -ghost.dirY);
  });

  return withoutReverse.length > 0 ? withoutReverse : possible;
}

function chooseDirectionToTarget(ghost, dirs, targetX, targetY) {
  return dirs.reduce((best, dir) => {
    const nextX = (ghost.tileX + dir.x) * tileSize + tileSize / 2;
    const nextY = (ghost.tileY + dir.y) * tileSize + tileSize / 2;

    const bestX = (ghost.tileX + best.x) * tileSize + tileSize / 2;
    const bestY = (ghost.tileY + best.y) * tileSize + tileSize / 2;

    const distance = Math.hypot(nextX - targetX, nextY - targetY);
    const bestDistance = Math.hypot(bestX - targetX, bestY - targetY);

    return distance < bestDistance ? dir : best;
  }, dirs[0]);
}

function chooseFleeDirectionFromTiles(ghost, dirs) {
  return dirs.reduce((best, dir) => {
    const nextX = (ghost.tileX + dir.x) * tileSize + tileSize / 2;
    const nextY = (ghost.tileY + dir.y) * tileSize + tileSize / 2;

    const bestX = (ghost.tileX + best.x) * tileSize + tileSize / 2;
    const bestY = (ghost.tileY + best.y) * tileSize + tileSize / 2;

    const distance = Math.hypot(nextX - player.x, nextY - player.y);
    const bestDistance = Math.hypot(bestX - player.x, bestY - player.y);

    return distance > bestDistance ? dir : best;
  }, dirs[0]);
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
  updateTimers();
  movePlayer();
  moveGhosts();
  updateBoosters();
  updateParticles();
  checkDots();
  checkBoosterCollisions();
  checkGhostCollisions();

  if (dots.every(dot => dot.eaten)) {
    level++;
    createLevel();
  }
}

function updateTimers() {
  if (frightenedTimer > 0) frightenedTimer--;
  if (freezeTimer > 0) freezeTimer--;
  if (shieldTimer > 0) shieldTimer--;
  if (speedTimer > 0) speedTimer--;
  if (invincibleTimer > 0) invincibleTimer--;

  boosterTimer++;

  if (boosterTimer > 520) {
    spawnBooster();
    boosterTimer = 0;
  }
}

function movePlayer() {
  const speed = speedTimer > 0 ? player.speed * 1.45 : player.speed;

  if (isCentered(player)) {
    const tile = getTile(player.x, player.y);

    if (canMove(tile.x, tile.y, player.nextDirX, player.nextDirY)) {
      player.dirX = player.nextDirX;
      player.dirY = player.nextDirY;
    }

    if (!canMove(tile.x, tile.y, player.dirX, player.dirY)) {
      player.dirX = 0;
      player.dirY = 0;
      snapToCenter(player);
    }
  }

  const nextX = player.x + player.dirX * speed;
  const nextY = player.y + player.dirY * speed;

  if (!wallCollisionCircle(nextX, nextY, player.radius)) {
    player.x = nextX;
    player.y = nextY;
  } else {
    snapToCenter(player);
  }

  player.mouth += 0.22;
}

function moveGhosts() {
  if (freezeTimer > 0) return;

  ghosts.forEach(ghost => {
    const dx = ghost.targetX - ghost.x;
    const dy = ghost.targetY - ghost.y;
    const distance = Math.hypot(dx, dy);

    const ghostSpeed = frightenedTimer > 0
      ? ghost.speed * 0.75
      : ghost.speed;

    if (distance > ghostSpeed) {
      ghost.x += (dx / distance) * ghostSpeed;
      ghost.y += (dy / distance) * ghostSpeed;
      return;
    }

    ghost.x = ghost.targetX;
    ghost.y = ghost.targetY;

    ghost.tileX = Math.floor(ghost.x / tileSize);
    ghost.tileY = Math.floor(ghost.y / tileSize);

    const dirs = getGhostDirections(ghost);

    if (dirs.length === 0) return;

    let chosen;

    if (frightenedTimer > 0) {
      chosen = chooseFleeDirectionFromTiles(ghost, dirs);
    } else if (ghost.mode === "chase") {
      chosen = chooseDirectionToTarget(ghost, dirs, player.x, player.y);
    } else if (ghost.mode === "ambush") {
      chosen = chooseDirectionToTarget(
        ghost,
        dirs,
        player.x + player.dirX * tileSize * 3,
        player.y + player.dirY * tileSize * 3
      );
    } else {
      chosen = dirs[Math.floor(Math.random() * dirs.length)];
    }

    ghost.dirX = chosen.x;
    ghost.dirY = chosen.y;

    ghost.targetX = (ghost.tileX + chosen.x) * tileSize + tileSize / 2;
    ghost.targetY = (ghost.tileY + chosen.y) * tileSize + tileSize / 2;
  });
}

function checkDots() {
  dots.forEach(dot => {
    if (dot.eaten) return;

    const distance = Math.hypot(player.x - dot.x, player.y - dot.y);

    if (distance < player.radius + (dot.big ? 10 : 6)) {
      dot.eaten = true;

      score += dot.big ? 50 : 10;

      if (dot.big) {
        frightenedTimer = 520;
        createParticles(dot.x, dot.y, "#facc15", 28);
      } else {
        createParticles(dot.x, dot.y, "#38bdf8", 8);
      }

      updateUI();
    }
  });
}

function checkBoosterCollisions() {
  boosters.forEach(booster => {
    if (booster.collected) return;

    const distance = Math.hypot(player.x - booster.x, player.y - booster.y);

    if (distance < player.radius + booster.size / 2) {
      booster.collected = true;
      activateBooster(booster.type);
      createParticles(booster.x, booster.y, booster.color, 26);
    }
  });

  boosters = boosters.filter(booster => !booster.collected);
}

function checkGhostCollisions() {
  ghosts.forEach(ghost => {
    const distance = Math.hypot(player.x - ghost.x, player.y - ghost.y);

    if (distance < player.radius + ghost.radius - 3) {
      if (frightenedTimer > 0) {
        score += 200;
        resetGhost(ghost);
        createParticles(ghost.x, ghost.y, "#38bdf8", 32);
        updateUI();
        return;
      }

      if (shieldTimer > 0) {
        shieldTimer = 0;
        ghost.x = ghost.startX;
        ghost.y = ghost.startY;
        createParticles(player.x, player.y, "#22c55e", 34);
        return;
      }

      if (invincibleTimer <= 0) {
        loseLife();
      }
    }
  });
}

function resetGhost(ghost) {
  ghost.x = ghost.startX;
  ghost.y = ghost.startY;

  ghost.tileX = Math.floor(ghost.x / tileSize);
  ghost.tileY = Math.floor(ghost.y / tileSize);

  ghost.dirX = 1;
  ghost.dirY = 0;

  ghost.targetX = ghost.x;
  ghost.targetY = ghost.y;
}

function loseLife() {
  lives--;
  updateUI();

  createParticles(player.x, player.y, "#f43f5e", 42);

  if (lives <= 0) {
    gameOver();
    return;
  }

  player.x = player.startX;
  player.y = player.startY;
  player.dirX = 0;
  player.dirY = 0;
  player.nextDirX = 0;
  player.nextDirY = 0;

  ghosts.forEach(ghost => {
    resetGhost(ghost);
  });

  invincibleTimer = 100;
}

function spawnBooster() {
  const emptyTiles = [];

  map.forEach((row, y) => {
    row.split("").forEach((cell, x) => {
      if (cell !== "#") {
        emptyTiles.push({ x, y });
      }
    });
  });

  const tile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];

  const types = ["speed", "shield", "freeze"];
  const type = types[Math.floor(Math.random() * types.length)];
  const data = getBoosterData(type);

  boosters.push({
    x: tile.x * tileSize + tileSize / 2,
    y: tile.y * tileSize + tileSize / 2,
    size: 22,
    type,
    color: data.color,
    icon: data.icon,
    pulse: 0,
    collected: false
  });
}

function getBoosterData(type) {
  if (type === "speed") {
    return { color: "#facc15", icon: "⚡" };
  }

  if (type === "shield") {
    return { color: "#22c55e", icon: "◆" };
  }

  return { color: "#38bdf8", icon: "❄" };
}

function activateBooster(type) {
  if (type === "speed") speedTimer = 420;
  if (type === "shield") shieldTimer = 520;
  if (type === "freeze") freezeTimer = 360;
}

function draw() {
  drawBackground();
  drawMaze();
  drawDots();
  drawBoosters();
  drawPlayer();
  drawGhosts();
  drawParticles();
  drawActiveEffects();
}

function drawBackground() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMaze() {
  map.forEach((row, y) => {
    row.split("").forEach((cell, x) => {
      if (cell === "#") {
        ctx.save();

        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 13;
        ctx.fillStyle = "rgba(56,189,248,.18)";
        ctx.strokeStyle = "rgba(56,189,248,.65)";
        ctx.lineWidth = 1.5;

        roundRect(
          x * tileSize + 2,
          y * tileSize + 2,
          tileSize - 4,
          tileSize - 4,
          8
        );

        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    });
  });
}

function drawDots() {
  dots.forEach(dot => {
    if (dot.eaten) return;

    ctx.save();

    ctx.shadowColor = dot.big ? "#facc15" : "#38bdf8";
    ctx.shadowBlur = dot.big ? 22 : 10;
    ctx.fillStyle = dot.big ? "#fde047" : "#e0f2fe";

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.big ? 7 : 3.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawBoosters() {
  boosters.forEach(booster => {

    ctx.save();

    ctx.translate(booster.x, booster.y);
    ctx.rotate(booster.pulse);

    ctx.shadowColor = booster.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = "rgba(15,23,42,.9)";
    ctx.strokeStyle = booster.color;
    ctx.lineWidth = 2.5;

    roundRect(
      -booster.size / 2,
      -booster.size / 2,
      booster.size,
      booster.size,
      7
    );

    ctx.fill();
    ctx.stroke();

    ctx.rotate(-booster.pulse);

    ctx.fillStyle = booster.color;
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(booster.icon, 0, 1);

    ctx.restore();
  });
}

function drawPlayer() {
  const blink = invincibleTimer > 0 && Math.floor(invincibleTimer / 8) % 2 === 0;

  if (blink) return;

  if (shieldTimer > 0) {
    ctx.save();

    ctx.strokeStyle = "rgba(34,197,94,.85)";
    ctx.shadowColor = "#22c55e";
    ctx.shadowBlur = 18;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  ctx.save();

  ctx.shadowColor = "#facc15";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "#facc15";

  const mouth = Math.abs(Math.sin(player.mouth)) * 0.48;

  let rotation = 0;

  if (player.dirX === 1) rotation = 0;
  if (player.dirX === -1) rotation = Math.PI;
  if (player.dirY === -1) rotation = -Math.PI / 2;
  if (player.dirY === 1) rotation = Math.PI / 2;

  ctx.translate(player.x, player.y);
  ctx.rotate(rotation);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, player.radius, mouth, Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawGhosts() {
  ghosts.forEach(ghost => {
    const scared = frightenedTimer > 0;
    const color = scared
      ? (Math.floor(frightenedTimer / 20) % 2 === 0 ? "#38bdf8" : "#e0f2fe")
      : ghost.color;

    ctx.save();

    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.arc(ghost.x, ghost.y - 3, ghost.radius, Math.PI, 0);
    ctx.lineTo(ghost.x + ghost.radius, ghost.y + ghost.radius);

    for (let i = 0; i < 4; i++) {
      ctx.lineTo(
        ghost.x + ghost.radius - i * 8 - 4,
        ghost.y + ghost.radius - (i % 2 === 0 ? 0 : 7)
      );
    }

    ctx.lineTo(ghost.x - ghost.radius, ghost.y + ghost.radius);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fff";

    ctx.beginPath();
    ctx.arc(ghost.x - 5, ghost.y - 3, 4, 0, Math.PI * 2);
    ctx.arc(ghost.x + 5, ghost.y - 3, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#020617";

    ctx.beginPath();
    ctx.arc(ghost.x - 4, ghost.y - 3, 2, 0, Math.PI * 2);
    ctx.arc(ghost.x + 6, ghost.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawActiveEffects() {
  let y = 18;

  ctx.save();

  ctx.font = "bold 13px system-ui";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  if (frightenedTimer > 0) {
    drawEffectBadge(16, y, "#38bdf8", `Power Mode: ${Math.ceil(frightenedTimer / 60)}s`);
    y += 26;
  }

  if (speedTimer > 0) {
    drawEffectBadge(16, y, "#facc15", `Speed Boost: ${Math.ceil(speedTimer / 60)}s`);
    y += 26;
  }

  if (shieldTimer > 0) {
    drawEffectBadge(16, y, "#22c55e", `Shield: ${Math.ceil(shieldTimer / 60)}s`);
    y += 26;
  }

  if (freezeTimer > 0) {
    drawEffectBadge(16, y, "#38bdf8", `Freeze: ${Math.ceil(freezeTimer / 60)}s`);
  }

  ctx.restore();
}

function drawEffectBadge(x, y, color, text) {
  ctx.save();

  const width = ctx.measureText(text).width + 26;

  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = "rgba(15,23,42,.85)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.3;

  roundRect(x, y - 12, width, 24, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillText(text, x + 13, y);

  ctx.restore();
}

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 36,
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

    ctx.globalAlpha = p.life / 36;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function setNextDirection(x, y) {
  if (!player) return;

  player.nextDirX = x;
  player.nextDirY = y;
}

function updateBoosters() {
  boosters.forEach(booster => {
    booster.pulse += 0.08;
  });
}

function isCentered(entity) {
  const centerX = Math.round((entity.x - tileSize / 2) / tileSize) * tileSize + tileSize / 2;
  const centerY = Math.round((entity.y - tileSize / 2) / tileSize) * tileSize + tileSize / 2;

  return Math.abs(entity.x - centerX) < 3 && Math.abs(entity.y - centerY) < 3;
}

function snapToCenter(entity) {
  const tile = getTile(entity.x, entity.y);

  entity.x = tile.x * tileSize + tileSize / 2;
  entity.y = tile.y * tileSize + tileSize / 2;
}

function getTile(x, y) {
  return {
    x: Math.floor(x / tileSize),
    y: Math.floor(y / tileSize)
  };
}

function canMove(tileX, tileY, dirX, dirY) {
  if (dirX === 0 && dirY === 0) return true;

  const nextX = tileX + dirX;
  const nextY = tileY + dirY;

  if (!map[nextY] || !map[nextY][nextX]) return false;

  return map[nextY][nextX] !== "#";
}

function getAvailableDirections(tileX, tileY, currentDirX, currentDirY) {
  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  const possible = dirs.filter(dir => {
    return canMove(tileX, tileY, dir.x, dir.y);
  });

  const withoutReverse = possible.filter(dir => {
    return !(dir.x === -currentDirX && dir.y === -currentDirY);
  });

  return withoutReverse.length > 0 ? withoutReverse : possible;
}

function chooseChaseDirection(ghost, dirs, targetX, targetY) {
  if (dirs.length === 0) return { x: -ghost.dirX, y: -ghost.dirY };

  return dirs.reduce((best, dir) => {
    const nextX = ghost.x + dir.x * tileSize;
    const nextY = ghost.y + dir.y * tileSize;

    const distance = Math.hypot(nextX - targetX, nextY - targetY);
    const bestDistance = Math.hypot(
      ghost.x + best.x * tileSize - targetX,
      ghost.y + best.y * tileSize - targetY
    );

    return distance < bestDistance ? dir : best;
  }, dirs[0]);
}

function chooseFleeDirection(ghost, dirs) {
  if (dirs.length === 0) return { x: -ghost.dirX, y: -ghost.dirY };

  return dirs.reduce((best, dir) => {
    const nextX = ghost.x + dir.x * tileSize;
    const nextY = ghost.y + dir.y * tileSize;

    const distance = Math.hypot(nextX - player.x, nextY - player.y);
    const bestDistance = Math.hypot(
      ghost.x + best.x * tileSize - player.x,
      ghost.y + best.y * tileSize - player.y
    );

    return distance > bestDistance ? dir : best;
  }, dirs[0]);
}

function wallCollisionCircle(x, y, radius) {
  const points = [
    { x: x - radius, y },
    { x: x + radius, y },
    { x, y: y - radius },
    { x, y: y + radius }
  ];

  return points.some(point => {
    const tileX = Math.floor(point.x / tileSize);
    const tileY = Math.floor(point.y / tileSize);

    if (!map[tileY] || !map[tileY][tileX]) return true;

    return map[tileY][tileX] === "#";
  });
}

function updateUI() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = level;
  dotsEl.textContent = dots.filter(dot => !dot.eaten).length;

  if (score > best) {
    best = score;
    localStorage.setItem("neonPacmanBest", best);
    bestEl.textContent = best;
  }
}

function gameOver() {
  running = false;
  cancelAnimationFrame(animationId);

  showOverlay(
    "💀 Game Over",
    `Your score: ${score}. Level reached: ${level}.`,
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
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    setNextDirection(-1, 0);
  }

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    setNextDirection(1, 0);
  }

  if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
    setNextDirection(0, -1);
  }

  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
    setNextDirection(0, 1);
  }

  if (e.key.toLowerCase() === "p") {
    togglePause();
  }
});

createLevel();
draw();
