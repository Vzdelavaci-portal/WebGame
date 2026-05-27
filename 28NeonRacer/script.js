const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const speedEl = document.getElementById("speed");
const livesEl = document.getElementById("lives");
const nitroEl = document.getElementById("nitro");
const overlay = document.getElementById("overlay");

let player;
let traffic = [];
let coins = [];
let particles = [];
let stars = [];
let roadLines = [];

let score = 0;
let best = localStorage.getItem("neonRacerBest") || 0;
let lives = 3;
let nitro = 0;
let speed = 5;
let distance = 0;

let running = false;
let paused = false;
let animationId;

let trafficTimer = 0;
let coinTimer = 0;
let invincibleTimer = 0;

const road = {
  x: 95,
  width: 330
};

const keys = {
  left: false,
  right: false,
  nitro: false
};

bestEl.textContent = best;

function startGame() {
  player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 48,
    height: 82,
    speed: 7
  };

  traffic = [];
  coins = [];
  particles = [];
  stars = [];
  roadLines = [];

  score = 0;
  lives = 3;
  nitro = 35;
  speed = 5;
  distance = 0;

  trafficTimer = 0;
  coinTimer = 0;
  invincibleTimer = 0;

  running = true;
  paused = false;

  scoreEl.textContent = score;
  livesEl.textContent = lives;
  nitroEl.textContent = nitro;
  speedEl.textContent = 1;

  createStars();
  createRoadLines();

  overlay.style.display = "none";

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
  const nitroActive = keys.nitro && nitro > 0;
  const currentSpeed = nitroActive ? speed * 1.7 : speed;

  if (nitroActive) {
    nitro = Math.max(0, nitro - 0.35);

    createParticles(
      player.x,
      player.y + player.height / 2,
      "#38bdf8",
      2
    );
  } else {
    nitro = Math.min(100, nitro + 0.035);
  }

  nitroEl.textContent = Math.floor(nitro);

  distance += currentSpeed;

  score = Math.floor(distance / 8);

  scoreEl.textContent = score;

  speed = Math.min(15, 5 + score / 450);

  speedEl.textContent = speed.toFixed(1);

  if (invincibleTimer > 0) {
    invincibleTimer--;
  }

  movePlayer();

  updateStars(currentSpeed);
  updateRoadLines(currentSpeed);
  updateTraffic(currentSpeed);
  updateCoins(currentSpeed);
  updateParticles();

  checkCollisions();
}

function movePlayer() {
  if (keys.left) player.x -= player.speed;
  if (keys.right) player.x += player.speed;

  const minX = road.x + player.width / 2 + 12;
  const maxX = road.x + road.width - player.width / 2 - 12;

  player.x = Math.max(
    minX,
    Math.min(maxX, player.x)
  );
}

function updateTraffic(currentSpeed) {
  trafficTimer++;

  if (trafficTimer > Math.max(24, 75 - speed * 4)) {
    spawnTraffic();
    trafficTimer = 0;
  }

  traffic.forEach(car => {
    car.y += currentSpeed + car.extraSpeed;
  });

  traffic = traffic.filter(
    car => car.y < canvas.height + 140
  );
}

function spawnTraffic() {
  const lanes = getLanes();

  const lane =
    lanes[Math.floor(Math.random() * lanes.length)];

  traffic.push({
    x: lane,
    y: -120,
    width: 48,
    height: 82,
    extraSpeed: Math.random() * 2,
    color: randomCarColor()
  });
}

function updateCoins(currentSpeed) {
  coinTimer++;

  if (coinTimer > 95) {
    spawnCoin();
    coinTimer = 0;
  }

  coins.forEach(coin => {
    coin.y += currentSpeed;
    coin.rotation += 0.06;
  });

  coins = coins.filter(
    coin => coin.y < canvas.height + 40
  );
}

function spawnCoin() {
  const lanes = getLanes();

  const lane =
    lanes[Math.floor(Math.random() * lanes.length)];

  coins.push({
    x: lane,
    y: -40,
    size: 24,
    rotation: 0
  });
}

function checkCollisions() {

  traffic.forEach(car => {

    if (
      rectHit(player, car) &&
      invincibleTimer <= 0
    ) {

      lives--;

      livesEl.textContent = lives;

      invincibleTimer = 100;

      createParticles(
        player.x,
        player.y,
        "#f43f5e",
        36
      );

      car.y = canvas.height + 200;

      if (lives <= 0) {
        gameOver();
      }
    }

  });

  coins.forEach(coin => {

    const coinBox = {
      x: coin.x,
      y: coin.y,
      width: coin.size,
      height: coin.size
    };

    if (rectHit(player, coinBox)) {

      score += 50;
      distance += 400;

      nitro = Math.min(100, nitro + 15);

      createParticles(
        coin.x,
        coin.y,
        "#facc15",
        24
      );

      coin.collected = true;
    }

  });

  coins = coins.filter(
    coin => !coin.collected
  );
}

function draw() {
  drawBackground();
  drawStars();
  drawRoad();
  drawRoadLines();
  drawCoins();
  drawTraffic();
  drawPlayer();
  drawParticles();
}

function drawBackground() {
  ctx.fillStyle = "#020617";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const glow = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height,
    40,
    canvas.width / 2,
    canvas.height,
    canvas.width
  );

  glow.addColorStop(
    0,
    "rgba(56,189,248,0.18)"
  );

  glow.addColorStop(
    1,
    "rgba(2,6,23,0)"
  );

  ctx.fillStyle = glow;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
}

function drawRoad() {

  const gradient =
    ctx.createLinearGradient(
      road.x,
      0,
      road.x + road.width,
      0
    );

  gradient.addColorStop(
    0,
    "rgba(56,189,248,0.18)"
  );

  gradient.addColorStop(
    0.5,
    "rgba(15,23,42,0.95)"
  );

  gradient.addColorStop(
    1,
    "rgba(167,139,250,0.18)"
  );

  ctx.fillStyle = gradient;

  roundRect(
    road.x,
    0,
    road.width,
    canvas.height,
    24
  );

  ctx.fill();

  ctx.strokeStyle =
    "rgba(56,189,248,0.8)";

  ctx.lineWidth = 4;

  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 18;

  ctx.beginPath();

  ctx.moveTo(road.x, 0);
  ctx.lineTo(road.x, canvas.height);

  ctx.moveTo(
    road.x + road.width,
    0
  );

  ctx.lineTo(
    road.x + road.width,
    canvas.height
  );

  ctx.stroke();

  ctx.shadowBlur = 0;
}

function drawRoadLines() {

  roadLines.forEach(line => {

    ctx.save();

    ctx.shadowColor = "#a78bfa";
    ctx.shadowBlur = 16;

    ctx.fillStyle =
      "rgba(216,180,254,0.9)";

    roundRect(
      line.x - 4,
      line.y,
      8,
      60,
      8
    );

    ctx.fill();

    ctx.restore();

  });

}

function drawPlayer() {

  const blink =
    invincibleTimer > 0 &&
    Math.floor(invincibleTimer / 8) % 2 === 0;

  if (blink) return;

  drawCar(
    player.x,
    player.y,
    player.width,
    player.height,
    "#38bdf8",
    true
  );

  if (keys.nitro && nitro > 0) {

    ctx.save();

    ctx.shadowColor = "#22c55e";
    ctx.shadowBlur = 22;

    ctx.fillStyle = "#22c55e";

    ctx.beginPath();

    ctx.moveTo(
      player.x - 14,
      player.y + player.height / 2 - 4
    );

    ctx.lineTo(
      player.x,
      player.y +
      player.height / 2 +
      38 +
      Math.sin(Date.now() / 60) * 7
    );

    ctx.lineTo(
      player.x + 14,
      player.y + player.height / 2 - 4
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();
  }
}

function drawTraffic() {

  traffic.forEach(car => {

    drawCar(
      car.x,
      car.y,
      car.width,
      car.height,
      car.color,
      false
    );

  });

}

function drawCar(x, y, width, height, color, isPlayer) {
  ctx.save();

  ctx.translate(x, y);

  ctx.shadowColor = color;
  ctx.shadowBlur = 18;

  const bodyGradient = ctx.createLinearGradient(
    -width / 2,
    0,
    width / 2,
    0
  );

  bodyGradient.addColorStop(0, color);
  bodyGradient.addColorStop(0.5, "#e0f2fe");
  bodyGradient.addColorStop(1, isPlayer ? "#a78bfa" : color);

  // Car body
  ctx.fillStyle = bodyGradient;

  roundRect(
    -width / 2,
    -height / 2,
    width,
    height,
    12
  );

  ctx.fill();

  // Front window
  ctx.fillStyle = "rgba(2,6,23,0.82)";

  roundRect(
    -width / 2 + 10,
    -height / 2 + 12,
    width - 20,
    22,
    8
  );

  ctx.fill();

  // Rear window
  ctx.fillStyle = "rgba(255,255,255,0.35)";

  roundRect(
    -width / 2 + 9,
    height / 2 - 26,
    width - 18,
    14,
    6
  );

  ctx.fill();

  // Front lights
  if (isPlayer) {
    ctx.fillStyle = "#bae6fd";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 12;
  } else {
    ctx.fillStyle = "#fee2e2";
    ctx.shadowColor = "#f43f5e";
    ctx.shadowBlur = 10;
  }

  roundRect(
    -width / 2 + 8,
    -height / 2 + 3,
    10,
    5,
    3
  );

  roundRect(
    width / 2 - 18,
    -height / 2 + 3,
    10,
    5,
    3
  );

  ctx.fill();

  
  // Wheels
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#020617";

    const wheelWidth = 10;
    const wheelHeight = 26;
    const offsetX = width / 2 + 2;

    const topWheelY = -height / 2 + 12;
    const bottomWheelY = height / 2 - 38;

    roundRect(-offsetX, topWheelY, wheelWidth, wheelHeight, 5);
    ctx.fill();

    roundRect(offsetX - wheelWidth, topWheelY, wheelWidth, wheelHeight, 5);
    ctx.fill();

    roundRect(-offsetX, bottomWheelY, wheelWidth, wheelHeight, 5);
    ctx.fill();

    roundRect(offsetX - wheelWidth, bottomWheelY, wheelWidth, wheelHeight, 5);
    ctx.fill();

    // Center neon stripe
    ctx.shadowColor = isPlayer ? "#22c55e" : color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = isPlayer ? "#22c55e" : "rgba(255,255,255,0.55)";

    roundRect(
        -3,
        -height / 2 + 42,
        6,
        height - 78,
        4
    );

    ctx.fill();

    ctx.restore();
    }

function drawCoins() {

  coins.forEach(coin => {

    ctx.save();

    ctx.translate(
      coin.x,
      coin.y
    );

    ctx.rotate(coin.rotation);

    ctx.shadowColor = "#facc15";
    ctx.shadowBlur = 18;

    ctx.fillStyle =
      "rgba(250,204,21,0.95)";

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      coin.size / 2,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#020617";

    ctx.font =
      "bold 16px system-ui";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("$", 0, 1);

    ctx.restore();

  });

}

function drawStars() {

  stars.forEach(star => {

    ctx.fillStyle =
      `rgba(255,255,255,${star.alpha})`;

    ctx.beginPath();

    ctx.arc(
      star.x,
      star.y,
      star.size,
      0,
      Math.PI * 2
    );

    ctx.fill();

  });

}

function drawParticles() {

  particles.forEach(p => {

    ctx.save();

    ctx.globalAlpha =
      p.life / 36;

    ctx.fillStyle = p.color;

    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      p.size,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();

  });

}

function createStars() {

  stars = [];

  for (let i = 0; i < 140; i++) {

    stars.push({

      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,

      size: Math.random() * 2 + 0.3,

      speed: Math.random() * 0.7 + 0.2,

      alpha: Math.random() * 0.8 + 0.2

    });

  }

}

function updateStars(currentSpeed) {

  stars.forEach(star => {

    star.y +=
      star.speed +
      currentSpeed * 0.08;

    if (star.y > canvas.height) {

      star.y = 0;
      star.x =
        Math.random() * canvas.width;

    }

  });

}

function createRoadLines() {

  roadLines = [];

  const lane1 =
    road.x + road.width / 3;

  const lane2 =
    road.x + road.width * 2 / 3;

  for (
    let y = -80;
    y < canvas.height + 80;
    y += 110
  ) {

    roadLines.push({
      x: lane1,
      y
    });

    roadLines.push({
      x: lane2,
      y
    });

  }

}

function updateRoadLines(currentSpeed) {

  roadLines.forEach(line => {

    line.y += currentSpeed * 1.4;

    if (line.y > canvas.height + 80) {
      line.y = -80;
    }

  });

}

function createParticles(
  x,
  y,
  color,
  count
) {

  for (let i = 0; i < count; i++) {

    particles.push({

      x,
      y,

      vx:
        (Math.random() - 0.5) * 8,

      vy:
        (Math.random() - 0.5) * 8,

      size:
        Math.random() * 3 + 2,

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

  particles =
    particles.filter(
      p => p.life > 0
    );

}

function getLanes() {

  return [

    road.x + road.width * 0.17,
    road.x + road.width * 0.39,
    road.x + road.width * 0.61,
    road.x + road.width * 0.83

  ];

}

function randomCarColor() {

  const colors = [

    "#f43f5e",
    "#f97316",
    "#a78bfa",
    "#22c55e",
    "#e879f9"

  ];

  return colors[
    Math.floor(
      Math.random() * colors.length
    )
  ];

}

function rectHit(a, b) {

  return (

    a.x - a.width / 2 <
    b.x + b.width / 2 &&

    a.x + a.width / 2 >
    b.x - b.width / 2 &&

    a.y - a.height / 2 <
    b.y + b.height / 2 &&

    a.y + a.height / 2 >
    b.y - b.height / 2

  );

}

function gameOver() {

  running = false;

  cancelAnimationFrame(animationId);

  saveBest();

  showOverlay(
    "💥 Game Over",
    `Your score: ${score}`,
    "Play Again",
    startGame
  );

}

function saveBest() {

  if (score > best) {

    best = score;

    localStorage.setItem(
      "neonRacerBest",
      best
    );

    bestEl.textContent = best;
  }

}

function showOverlay(
  title,
  text,
  buttonText,
  action
) {

  overlay.innerHTML = `
    <div class="panel">
      <h2>${title}</h2>
      <p>${text}</p>
      <button id="overlayBtn">
        ${buttonText}
      </button>
    </div>
  `;

  overlay.style.display = "grid";

  document
    .getElementById("overlayBtn")
    .onclick = action;
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

  ctx.quadraticCurveTo(
    x + w,
    y,
    x + w,
    y + r
  );

  ctx.lineTo(
    x + w,
    y + h - r
  );

  ctx.quadraticCurveTo(
    x + w,
    y + h,
    x + w - r,
    y + h
  );

  ctx.lineTo(x + r, y + h);

  ctx.quadraticCurveTo(
    x,
    y + h,
    x,
    y + h - r
  );

  ctx.lineTo(x, y + r);

  ctx.quadraticCurveTo(
    x,
    y,
    x + r,
    y
  );

  ctx.closePath();

}

document.addEventListener(
  "keydown",
  e => {

    if (
      e.key === "ArrowLeft" ||
      e.key.toLowerCase() === "a"
    ) {
      keys.left = true;
    }

    if (
      e.key === "ArrowRight" ||
      e.key.toLowerCase() === "d"
    ) {
      keys.right = true;
    }

    if (e.code === "Space") {

      e.preventDefault();

      keys.nitro = true;
    }

    if (
      e.key.toLowerCase() === "p"
    ) {
      togglePause();
    }

  }
);

document.addEventListener(
  "keyup",
  e => {

    if (
      e.key === "ArrowLeft" ||
      e.key.toLowerCase() === "a"
    ) {
      keys.left = false;
    }

    if (
      e.key === "ArrowRight" ||
      e.key.toLowerCase() === "d"
    ) {
      keys.right = false;
    }

    if (e.code === "Space") {
      keys.nitro = false;
    }

  }
);

createStars();
createRoadLines();

drawBackground();
drawStars();
drawRoad();
drawRoadLines();