const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hpEl = document.getElementById("hp");
const coinsEl = document.getElementById("coins");
const roomEl = document.getElementById("room");
const killsEl = document.getElementById("kills");
const weaponEl = document.getElementById("weapon");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");

const TILE = 40;
const COLS = Math.floor(canvas.width / TILE);
const ROWS = Math.floor(canvas.height / TILE);

const WALL = 1;
const FLOOR = 0;

const keys = { 
  up: false,
  down: false,
  left: false,
  right: false
};

const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  down: false
};

const roomLayouts = [
  {
    name: "Cross Chamber",
    walls: [
      [10, 4], [11, 4], [12, 4],
      [10, 9], [11, 9], [12, 9],
      [5, 6], [6, 6], [16, 6], [17, 6],
      [5, 7], [6, 7], [16, 7], [17, 7]
    ]
  },
  {
    name: "Pillar Hall",
    walls: [
      [4, 3], [4, 4], [4, 9], [4, 10],
      [18, 3], [18, 4], [18, 9], [18, 10],
      [10, 6], [11, 6], [12, 6],
      [10, 7], [11, 7], [12, 7]
    ]
  },
  {
    name: "Neon Maze",
    walls: [
      [3, 3], [4, 3], [5, 3], [6, 3],
      [16, 3], [17, 3], [18, 3], [19, 3],
      [3, 10], [4, 10], [5, 10], [6, 10],
      [16, 10], [17, 10], [18, 10], [19, 10],
      [8, 5], [8, 6], [8, 7], [8, 8],
      [14, 5], [14, 6], [14, 7], [14, 8]
    ]
  },
  {
    name: "Split Core",
    walls: [
      [11, 2], [11, 3], [11, 4], [11, 5],
      [11, 8], [11, 9], [11, 10], [11, 11],
      [6, 6], [7, 6], [15, 6], [16, 6],
      [6, 7], [7, 7], [15, 7], [16, 7]
    ]
  }
];

let player;
let roomMap = [];
let enemies = [];
let bullets = [];
let enemyBullets = [];
let loot = [];
let particles = [];
let floatingTexts = [];

let room = 1;
let kills = 0;
let coins = 0;
let best = localStorage.getItem("neonDungeonBestV2") || 0;

let running = false;
let paused = false;
let inShop = false;
let animationId;

let shootCooldown = 0;
let roomClearTimer = 0;
let shakeTimer = 0;

bestEl.textContent = best;

function startGame() {
  player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    hp: 100,
    maxHp: 100,
    speed: 3.1,
    damage: 15,
    fireRate: 14,
    weapon: "Blaster",
    projectileCount: 1,
    invincible: 80,
    speedBoostTimer: 0,
    damageBoostTimer: 0
  };

  enemies = [];
  bullets = [];
  enemyBullets = [];
  loot = [];
  particles = [];
  floatingTexts = [];

  room = 1;
  kills = 0;
  coins = 0;
  shootCooldown = 0;
  roomClearTimer = 0;
  shakeTimer = 0;
  inShop = false;

  spawnRoom();

  running = true;
  paused = false;

  overlay.style.display = "none";

  updateUI();

  cancelAnimationFrame(animationId);
  gameLoop();
}

function createRoomMap() {
  roomMap = Array.from({ length: ROWS }, (_, y) => {
    return Array.from({ length: COLS }, (_, x) => {
      if (x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1) {
        return WALL;
      }

      return FLOOR;
    });
  });

  const layout = roomLayouts[(room - 1) % roomLayouts.length];

  layout.walls.forEach(([x, y]) => {
    if (roomMap[y] && roomMap[y][x] !== undefined) {
      roomMap[y][x] = WALL;
    }
  });

  clearSafeArea(player.x, player.y, 2);
}

function clearSafeArea(px, py, radius) {
  const centerX = Math.floor(px / TILE);
  const centerY = Math.floor(py / TILE);

  for (let y = centerY - radius; y <= centerY + radius; y++) {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      if (roomMap[y] && roomMap[y][x] !== undefined) {
        if (x !== 0 && y !== 0 && x !== COLS - 1 && y !== ROWS - 1) {
          roomMap[y][x] = FLOOR;
        }
      }
    }
  }
}

function spawnRoom() {
  createRoomMap();

  enemies = [];
  bullets = [];
  enemyBullets = [];
  loot = [];

  const enemyCount = 4 + Math.floor(room * 1.4);

  for (let i = 0; i < enemyCount; i++) {
    const typeRoll = Math.random();

    let type = "slime";

    if (room >= 2 && typeRoll > 0.62) type = "fast";
    if (room >= 3 && typeRoll > 0.82) type = "tank";
    if (room >= 4 && typeRoll > 0.9) type = "shooter";

    spawnEnemy(type);
  }

  createFloatingText(canvas.width / 2, 70, `ROOM ${room}`, "#38bdf8");
}

function spawnEnemy(type) {
  let x;
  let y;
  let attempts = 0;

  do {
    x = TILE + Math.random() * (canvas.width - TILE * 2);
    y = TILE + Math.random() * (canvas.height - TILE * 2);
    attempts++;
  } while (
    attempts < 200 &&
    (
      Math.hypot(x - player.x, y - player.y) < 190 ||
      circleWallCollision(x, y, 18)
    )
  );

  const stats = getEnemyStats(type);

  enemies.push({
    x,
    y,
    radius: stats.radius,
    hp: stats.hp,
    maxHp: stats.hp,
    speed: stats.speed,
    damage: stats.damage,
    color: stats.color,
    type,
    shootCooldown: 80 + Math.random() * 80,
    wanderAngle: Math.random() * Math.PI * 2
  });
}

function getEnemyStats(type) {
  if (type === "fast") {
    return {
      hp: 30 + room * 6,
      speed: 2.25,
      radius: 11,
      damage: 8,
      color: "#38bdf8"
    };
  }

  if (type === "tank") {
    return {
      hp: 120 + room * 18,
      speed: 0.9,
      radius: 20,
      damage: 16,
      color: "#a78bfa"
    };
  }

  if (type === "shooter") {
    return {
      hp: 60 + room * 10,
      speed: 1.05,
      radius: 14,
      damage: 10,
      color: "#f43f5e"
    };
  }

  return {
    hp: 50 + room * 8,
    speed: 1.4,
    radius: 14,
    damage: 10,
    color: "#22c55e"
  };
}

function gameLoop() {
  if (!running) return;

  if (!paused && !inShop) {
    update();
    draw();
  }

  animationId = requestAnimationFrame(gameLoop);
}

function update() {
  movePlayer();
  updateBullets();
  updateEnemyBullets();
  updateEnemies();
  updateLoot();
  updateParticles();
  updateFloatingTexts();
  updateTimers();
  checkRoomClear();
  updateUI();
}

function updateTimers() {
  if (shootCooldown > 0) shootCooldown--;
  if (player.invincible > 0) player.invincible--;
  if (player.speedBoostTimer > 0) player.speedBoostTimer--;
  if (player.damageBoostTimer > 0) player.damageBoostTimer--;
  if (roomClearTimer > 0) roomClearTimer--;
  if (shakeTimer > 0) shakeTimer--;

  if (mouse.down) {
    shoot();
  }
}

function movePlayer() {
  let dx = 0;
  let dy = 0;

  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;

  if (dx !== 0 && dy !== 0) {
    dx *= 0.707;
    dy *= 0.707;
  }

  const currentSpeed = player.speedBoostTimer > 0
    ? player.speed * 1.45
    : player.speed;

  moveCircle(player, dx * currentSpeed, 0);
  moveCircle(player, 0, dy * currentSpeed);
}

function moveCircle(entity, dx, dy) {
  const nextX = entity.x + dx;
  const nextY = entity.y + dy;

  if (!circleWallCollision(nextX, nextY, entity.radius)) {
    entity.x = nextX;
    entity.y = nextY;
  }
}

function shoot() {
  if (!running || paused || inShop) return;
  if (shootCooldown > 0) return;

  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

  const damage = player.damageBoostTimer > 0
    ? player.damage * 1.6
    : player.damage;

  const spread = player.projectileCount === 1 ? [0] : [-0.18, 0, 0.18];

  spread.forEach(offset => {
    const finalAngle = angle + offset;

    bullets.push({
      x: player.x + Math.cos(finalAngle) * 20,
      y: player.y + Math.sin(finalAngle) * 20,
      vx: Math.cos(finalAngle) * 7.6,
      vy: Math.sin(finalAngle) * 7.6,
      radius: 5,
      damage,
      color: player.weapon === "Triple Shot" ? "#facc15" : "#38bdf8",
      life: 95
    });
  });

  createParticles(player.x, player.y, "#38bdf8", 3);

  shootCooldown = player.fireRate;
}

function updateBullets() {
  bullets.forEach(bullet => {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    bullet.life--;

    if (circleWallCollision(bullet.x, bullet.y, bullet.radius)) {
      bullet.dead = true;
      createParticles(bullet.x, bullet.y, "#38bdf8", 8);
      return;
    }

    enemies.forEach(enemy => {
      if (enemy.dead) return;

      const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);

      if (dist < bullet.radius + enemy.radius) {
        enemy.hp -= bullet.damage;
        bullet.dead = true;

        createParticles(bullet.x, bullet.y, enemy.color, 14);

        if (enemy.hp <= 0) {
          killEnemy(enemy);
        }
      }
    });
  });

  bullets = bullets.filter(bullet => {
    return !bullet.dead &&
      bullet.life > 0 &&
      bullet.x > -40 &&
      bullet.x < canvas.width + 40 &&
      bullet.y > -40 &&
      bullet.y < canvas.height + 40;
  });
}

function updateEnemyBullets() {
  enemyBullets.forEach(bullet => {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    bullet.life--;

    if (circleWallCollision(bullet.x, bullet.y, bullet.radius)) {
      bullet.dead = true;
      return;
    }

    const dist = Math.hypot(bullet.x - player.x, bullet.y - player.y);

    if (dist < bullet.radius + player.radius && player.invincible <= 0) {
      bullet.dead = true;
      damagePlayer(bullet.damage);
    }
  });

  enemyBullets = enemyBullets.filter(bullet => {
    return !bullet.dead &&
      bullet.life > 0 &&
      bullet.x > -40 &&
      bullet.x < canvas.width + 40 &&
      bullet.y > -40 &&
      bullet.y < canvas.height + 40;
  });
}

function updateEnemies() {
  enemies.forEach(enemy => {
    if (enemy.dead) return;

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;

    let moveX = (dx / dist) * enemy.speed;
    let moveY = (dy / dist) * enemy.speed;

    if (enemy.type === "shooter" && dist < 330) {
      enemy.shootCooldown--;

      if (enemy.shootCooldown <= 0 && hasLineOfSight(enemy.x, enemy.y, player.x, player.y)) {
        shootEnemyBullet(enemy);
        enemy.shootCooldown = 95 + Math.random() * 55;
      }

      if (dist < 220) {
        moveX *= -0.45;
        moveY *= -0.45;
      } else {
        moveX *= 0.35;
        moveY *= 0.35;
      }
    }

    if (!hasLineOfSight(enemy.x, enemy.y, player.x, player.y)) {
      enemy.wanderAngle += (Math.random() - 0.5) * 0.35;
      moveX = Math.cos(enemy.wanderAngle) * enemy.speed * 0.75;
      moveY = Math.sin(enemy.wanderAngle) * enemy.speed * 0.75;
    }

    moveCircle(enemy, moveX, 0);
    moveCircle(enemy, 0, moveY);

    const touchDistance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    if (touchDistance < player.radius + enemy.radius && player.invincible <= 0) {
      damagePlayer(enemy.damage);
    }
  });

  enemies = enemies.filter(enemy => !enemy.dead);
}

function shootEnemyBullet(enemy) {
  const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);

  enemyBullets.push({
    x: enemy.x,
    y: enemy.y,
    vx: Math.cos(angle) * 4,
    vy: Math.sin(angle) * 4,
    radius: 5,
    damage: enemy.damage,
    color: "#f43f5e",
    life: 120
  });

  createParticles(enemy.x, enemy.y, "#f43f5e", 8);
}

function killEnemy(enemy) {
  enemy.dead = true;
  kills++;
  coins += 1;

  const points = enemy.type === "tank" ? 80 : enemy.type === "shooter" ? 70 : 50;

  createFloatingText(enemy.x, enemy.y - 18, `+${points}`, enemy.color);
  createParticles(enemy.x, enemy.y, enemy.color, enemy.type === "tank" ? 36 : 24);

  maybeDropLoot(enemy.x, enemy.y);
}

function maybeDropLoot(x, y) {
  if (Math.random() > 0.42) return;

  const roll = Math.random();
  let type = "coin";

  if (roll > 0.7) type = "heal";
  if (roll > 0.84) type = "speed";
  if (roll > 0.94) type = "damage";

  const data = getLootData(type);

  loot.push({
    x,
    y,
    type,
    color: data.color,
    icon: data.icon,
    radius: 13,
    pulse: 0
  });
}

function getLootData(type) {
  if (type === "heal") return { color: "#22c55e", icon: "+" };
  if (type === "speed") return { color: "#facc15", icon: "⚡" };
  if (type === "damage") return { color: "#f43f5e", icon: "💥" };

  return { color: "#38bdf8", icon: "$" };
}

function updateLoot() {
  loot.forEach(item => {
    item.pulse += 0.06;

    const dist = Math.hypot(player.x - item.x, player.y - item.y);

    if (dist < player.radius + item.radius) {
      collectLoot(item);
      item.collected = true;
    }
  });

  loot = loot.filter(item => !item.collected);
}

function collectLoot(item) {
  if (item.type === "coin") {
    coins += 3;
    createFloatingText(item.x, item.y, "+3 coins", item.color);
  }

  if (item.type === "heal") {
    player.hp = Math.min(player.maxHp, player.hp + 22);
    createFloatingText(item.x, item.y, "+HP", item.color);
  }

  if (item.type === "speed") {
    player.speedBoostTimer = 420;
    createFloatingText(item.x, item.y, "SPEED", item.color);
  }

  if (item.type === "damage") {
    player.damageBoostTimer = 420;
    createFloatingText(item.x, item.y, "DAMAGE", item.color);
  }

  createParticles(item.x, item.y, item.color, 24);
}

function damagePlayer(amount) {
  player.hp -= amount;
  player.invincible = 70;
  shakeTimer = 10;

  createParticles(player.x, player.y, "#f43f5e", 35);

  if (player.hp <= 0) {
    gameOver();
  }
}

function checkRoomClear() {
  if (enemies.length === 0 && running && roomClearTimer === 0) {
    roomClearTimer = 90;
    createFloatingText(canvas.width / 2, canvas.height / 2, "ROOM CLEARED", "#22c55e");
  }

  if (roomClearTimer === 1 && !inShop) {
    openShop();
  }
}

function openShop() {
  inShop = true;
  mouse.down = false;

  const shopItems = getShopItems();

  overlay.innerHTML = `
    <div class="panel">
      <h2>🛒 Upgrade Shop</h2>
      <p>Room cleared! Spend your coins before entering the next room.</p>
      <p><strong>Coins:</strong> ${coins}</p>

      <div class="shop-grid">
        ${shopItems.map((item, index) => `
          <div class="shop-item">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <button ${coins < item.cost ? "disabled" : ""} onclick="buyUpgrade(${index})">
              Buy for ${item.cost} coins
            </button>
          </div>
        `).join("")}
      </div>

      <button onclick="nextRoom()">Continue Without Upgrade</button>
    </div>
  `;

  overlay.style.display = "grid";
}

function getShopItems() {
  return [
    {
      title: "💥 Damage +5",
      description: "Increase weapon damage permanently.",
      cost: 8,
      apply: () => player.damage += 5
    },
    {
      title: "⚡ Faster Fire Rate",
      description: "Shoot faster by reducing cooldown.",
      cost: 10,
      apply: () => player.fireRate = Math.max(6, player.fireRate - 2)
    },
    {
      title: "❤️ Max HP +20",
      description: "Increase maximum HP and heal a little.",
      cost: 12,
      apply: () => {
        player.maxHp += 20;
        player.hp = Math.min(player.maxHp, player.hp + 25);
      }
    },
    {
      title: "🔱 Triple Shot",
      description: "Unlock a three-projectile weapon.",
      cost: 18,
      apply: () => {
        player.weapon = "Triple Shot";
        player.projectileCount = 3;
      }
    }
  ];
}

function buyUpgrade(index) {
  const item = getShopItems()[index];

  if (!item || coins < item.cost) return;

  coins -= item.cost;
  item.apply();

  updateUI();
  openShop();
}

function nextRoom() {
  overlay.style.display = "none";
  inShop = false;

  room++;
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.hp = Math.min(player.maxHp, player.hp + 15);
  player.invincible = 80;

  spawnRoom();
}

function draw() {
  ctx.save();

  const shakeX = shakeTimer > 0 ? (Math.random() - 0.5) * 6 : 0;
  const shakeY = shakeTimer > 0 ? (Math.random() - 0.5) * 6 : 0;

  ctx.translate(shakeX, shakeY);

  drawBackground();
  drawWalls();
  drawLoot();
  drawBullets();
  drawEnemyBullets();
  drawPlayer();
  drawEnemies();
  drawParticles();
  drawFloatingTexts();
  drawActiveEffects();

  ctx.restore();
}

function drawBackground() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    80,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width
  );

  glow.addColorStop(0, "rgba(167,139,250,.16)");
  glow.addColorStop(1, "rgba(2,6,23,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(56,189,248,.055)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += TILE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += TILE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawWalls() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (roomMap[y][x] !== WALL) continue;

      ctx.save();

      ctx.shadowColor = "#a78bfa";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "rgba(167,139,250,.22)";
      ctx.strokeStyle = "rgba(167,139,250,.7)";
      ctx.lineWidth = 1.5;

      roundRect(x * TILE + 4, y * TILE + 4, TILE - 8, TILE - 8, 10);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }
}

function drawPlayer() {
  const blink = player.invincible > 0 && Math.floor(player.invincible / 8) % 2 === 0;

  if (blink) return;

  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(angle);

  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 22;

  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e0f2fe";
  roundRect(2, -5, 23, 10, 5);
  ctx.fill();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.arc(-4, -4, 2.5, 0, Math.PI * 2);
  ctx.arc(-4, 4, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.save();

    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = enemy.type === "tank" ? 26 : 18;
    ctx.fillStyle = enemy.color;

    if (enemy.type === "tank") {
      roundRect(enemy.x - enemy.radius, enemy.y - enemy.radius, enemy.radius * 2, enemy.radius * 2, 8);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#020617";
    ctx.beginPath();
    ctx.arc(enemy.x - 5, enemy.y - 4, 2.5, 0, Math.PI * 2);
    ctx.arc(enemy.x + 5, enemy.y - 4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    drawEnemyHp(enemy);

    ctx.restore();
  });
}

function drawEnemyHp(enemy) {
  const width = enemy.radius * 2.2;
  const height = 4;
  const ratio = Math.max(0, enemy.hp / enemy.maxHp);

  ctx.fillStyle = "rgba(15,23,42,.9)";
  ctx.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 12, width, height);

  ctx.fillStyle = "#22c55e";
  ctx.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 12, width * ratio, height);
}

function drawBullets() {
  bullets.forEach(bullet => {
    ctx.save();

    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = bullet.color;

    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawEnemyBullets() {
  enemyBullets.forEach(bullet => {
    ctx.save();

    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = bullet.color;

    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawLoot() {
  loot.forEach(item => {
    item.pulse += 0.04;

    ctx.save();

    ctx.translate(item.x, item.y);
    ctx.rotate(item.pulse);

    ctx.shadowColor = item.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = "rgba(15,23,42,.9)";
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2.5;

    roundRect(-13, -13, 26, 26, 7);
    ctx.fill();
    ctx.stroke();

    ctx.rotate(-item.pulse);

    ctx.fillStyle = item.color;
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.icon, 0, 1);

    ctx.restore();
  });
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

function drawFloatingTexts() {
  floatingTexts.forEach(text => {
    ctx.save();

    ctx.globalAlpha = text.life / 60;
    ctx.fillStyle = text.color;
    ctx.shadowColor = text.color;
    ctx.shadowBlur = 12;
    ctx.font = "bold 16px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.value, text.x, text.y);

    ctx.restore();
  });
}

function drawActiveEffects() {
  let y = 34;

  ctx.save();

  ctx.font = "bold 13px system-ui";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  if (player.speedBoostTimer > 0) {
    drawEffectBadge(34, y, "#facc15", `Speed Boost: ${Math.ceil(player.speedBoostTimer / 60)}s`);
    y += 26;
  }

  if (player.damageBoostTimer > 0) {
    drawEffectBadge(34, y, "#f43f5e", `Damage Boost: ${Math.ceil(player.damageBoostTimer / 60)}s`);
  }

  ctx.restore();
}

function drawEffectBadge(x, y, color, text) {
  const width = ctx.measureText(text).width + 26;

  ctx.save();

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

function circleWallCollision(x, y, radius) {
  const points = [
    { x: x - radius, y },
    { x: x + radius, y },
    { x, y: y - radius },
    { x, y: y + radius },
    { x: x - radius * 0.7, y: y - radius * 0.7 },
    { x: x + radius * 0.7, y: y - radius * 0.7 },
    { x: x - radius * 0.7, y: y + radius * 0.7 },
    { x: x + radius * 0.7, y: y + radius * 0.7 }
  ];

  return points.some(point => {
    const tileX = Math.floor(point.x / TILE);
    const tileY = Math.floor(point.y / TILE);

    if (!roomMap[tileY] || roomMap[tileY][tileX] === undefined) return true;

    return roomMap[tileY][tileX] === WALL;
  });
}

function hasLineOfSight(x1, y1, x2, y2) {
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 12);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;

    if (circleWallCollision(x, y, 3)) {
      return false;
    }
  }

  return true;
}

function updateUI() {
  hpEl.textContent = Math.max(0, Math.floor(player.hp));
  coinsEl.textContent = coins;
  roomEl.textContent = room;
  killsEl.textContent = kills;
  weaponEl.textContent = player.weapon;

  const currentScore = kills * 50 + coins * 5 + room * 100;

  if (currentScore > best) {
    best = currentScore;
    localStorage.setItem("neonDungeonBestV2", best);
    bestEl.textContent = best;
  }
}

function gameOver() {
  running = false;
  cancelAnimationFrame(animationId);

  const finalScore = kills * 50 + coins * 5 + room * 100;

  showOverlay(
    "💀 Game Over",
    `Final score: ${finalScore}. Rooms cleared: ${room - 1}.`,
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
  if (!running || inShop) return;

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

function getMousePosition(event) {
  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  mouse.x = (event.clientX - rect.left) * scaleX;
  mouse.y = (event.clientY - rect.top) * scaleY;
}

canvas.addEventListener("mousemove", getMousePosition);

canvas.addEventListener("mousedown", event => {
  getMousePosition(event);
  mouse.down = true;
  shoot();
});

window.addEventListener("mouseup", () => {
  mouse.down = false;
});

document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keys.left = true;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keys.right = true;
  if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") keys.up = true;
  if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") keys.down = true;

  if (event.key.toLowerCase() === "p") {
    togglePause();
  }
});

document.addEventListener("keyup", event => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keys.left = false;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keys.right = false;
  if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") keys.up = false;
  if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") keys.down = false;
});

player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  hp: 100,
  maxHp: 100,
  speed: 3.1,
  damage: 15,
  fireRate: 14,
  weapon: "Blaster",
  projectileCount: 1,
  invincible: 0,
  speedBoostTimer: 0,
  damageBoostTimer: 0
};

createRoomMap();
drawBackground();
drawWalls();
