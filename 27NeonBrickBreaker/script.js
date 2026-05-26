const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const levelEl = document.getElementById("level");
const livesEl = document.getElementById("lives");

const overlay = document.getElementById("overlay");

const passwordInput = document.getElementById("passwordInput");
const passwordMessage = document.getElementById("passwordMessage");

const levels = [
  {
    password: "START",
    next: "NEON2",
    layout: [
      "1111111111",
      "2222222222",
      "3333333333",
      "4444444444"
    ]
  },
  {
    password: "NEON2",
    next: "LASER3",
    layout: [
      "1000000001",
      "2200000022",
      "3330000333",
      "4444444444"
    ]
  },
  {
    password: "LASER3",
    next: "CYBER4",
    layout: [
      "0000110000",
      "0002220000",
      "0033333300",
      "4444444444"
    ]
  },
  {
    password: "CYBER4",
    next: "VOID5",
    layout: [
      "1111111111",
      "0000000000",
      "2222222222",
      "3333333333",
      "4444444444"
    ]
  },
  {
    password: "VOID5",
    next: "NOVA6",
    layout: [
      "1111111111",
      "1000000001",
      "1222222221",
      "1333333331",
      "1444444441"
    ]
  },
  {
    password: "NOVA6",
    next: "PIXEL7",
    layout: [
      "1110011111",
      "2220022222",
      "3330033333",
      "4440044444"
    ]
  },
  {
    password: "PIXEL7",
    next: "TITAN8",
    layout: [
      "1111111111",
      "1222222221",
      "1233333321",
      "1234444321"
    ]
  },
  {
    password: "TITAN8",
    next: "OMEGA9",
    layout: [
      "1010101010",
      "0202020202",
      "3030303030",
      "0404040404"
    ]
  },
  {
    password: "OMEGA9",
    next: "FINAL10",
    layout: [
      "1111111111",
      "2222222222",
      "3333333333",
      "4444444444",
      "5555555555"
    ]
  },
  {
    password: "FINAL10",
    next: "WIN",
    layout: [
      "1111111111",
      "1222222221",
      "1233333321",
      "1234444321",
      "1234554321"
    ]
  }
];

const brickColors = {
  1: "#38bdf8",
  2: "#a78bfa",
  3: "#22c55e",
  4: "#f97316",
  5: "#f43f5e"
};

let paddle;
let balls = [];
let bricks = [];
let particles = [];
let bonuses = [];
let stars = [];

let currentLevel = 0;
let score = 0;
let best = localStorage.getItem("neonBreakBest") || 0;
let lives = 3;

let running = false;
let paused = false;
let animationId;

let paddleGrowTimer = 0;

const keys = {
  left: false,
  right: false
};

bestEl.textContent = best;

function startGame(levelIndex = 0) {
  currentLevel = levelIndex;
  score = 0;
  lives = 3;

  setupLevel();

  running = true;
  paused = false;

  overlay.style.display = "none";

  cancelAnimationFrame(animationId);
  gameLoop();
}

function setupLevel() {
  paddle = {
    x: canvas.width / 2,
    y: canvas.height - 42,
    width: 130,
    height: 16,
    speed: 9
  };

  balls = [
    {
      x: paddle.x,
      y: paddle.y - 20,
      radius: 8,
      dx: 5.5,
      dy: -5.5,
      launched: false
    }
  ];

  bonuses = [];
  particles = [];
  paddleGrowTimer = 0;

  createStars();
  createBricks();

  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = currentLevel + 1;
}

function startFromPassword() {
  const value = passwordInput.value.trim().toUpperCase();

  const index = levels.findIndex(level => level.password === value);

  if (index === -1) {
    passwordMessage.textContent = "Invalid password.";
    return;
  }

  passwordMessage.textContent = "";
  startGame(index);
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
  movePaddle();
  updateBalls();
  updateParticles();
  updateBonuses();
  updateStars();
  updateTimers();
  checkLevelComplete();
}

function movePaddle() {
  if (keys.left) paddle.x -= paddle.speed;
  if (keys.right) paddle.x += paddle.speed;

  paddle.x = Math.max(
    paddle.width / 2 + 10,
    Math.min(canvas.width - paddle.width / 2 - 10, paddle.x)
  );

  balls.forEach(ball => {
    if (!ball.launched) {
      ball.x = paddle.x;
      ball.y = paddle.y - 20;
    }
  });
}

function launchBall() {
  balls.forEach(ball => {
    ball.launched = true;
  });
}

function updateBalls() {
  balls.forEach(ball => {
    if (!ball.launched) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
      ball.dx *= -1;
    }

    if (ball.y - ball.radius < 0) {
      ball.dy *= -1;
    }

    if (
      ball.y + ball.radius >= paddle.y - paddle.height / 2 &&
      ball.y - ball.radius <= paddle.y + paddle.height / 2 &&
      ball.x >= paddle.x - paddle.width / 2 &&
      ball.x <= paddle.x + paddle.width / 2 &&
      ball.dy > 0
    ) {
      const hit = (ball.x - paddle.x) / (paddle.width / 2);

      ball.dx = hit * 7;
      ball.dy = -Math.abs(ball.dy);

      createParticles(ball.x, ball.y, "#38bdf8", 12);
    }

    bricks.forEach(brick => {
      if (!brick.active) return;

      if (
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + brick.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + brick.height
      ) {
        brick.active = false;

        ball.dy *= -1;

        ball.dx *= 1.01;
        ball.dy *= 1.01;

        score += 10;
        scoreEl.textContent = score;

        createParticles(
          brick.x + brick.width / 2,
          brick.y + brick.height / 2,
          brick.color,
          26
        );

        tryDropBonus(
          brick.x + brick.width / 2,
          brick.y + brick.height / 2
        );
      }
    });
  });

  balls = balls.filter(ball => ball.y - ball.radius < canvas.height + 40);

  if (balls.length === 0) {
    lives--;
    livesEl.textContent = lives;

    if (lives <= 0) {
      gameOver();
    } else {
      balls.push({
        x: paddle.x,
        y: paddle.y - 20,
        radius: 8,
        dx: 5.5,
        dy: -5.5,
        launched: false
      });
    }
  }
}

function tryDropBonus(x, y) {
  if (Math.random() > 0.18) return;

  const rand = Math.random();
  let type = "wide";

  if (rand < 0.42) {
    type = "wide";
  } else if (rand < 0.72) {
    type = "multi";
  } else {
    type = "life";
  }

  bonuses.push({
    x,
    y,
    size: 28,
    speed: 2.4,
    rotation: 0,
    type,
    collected: false
  });
}

function updateBonuses() {
  bonuses.forEach(bonus => {
    bonus.y += bonus.speed;
    bonus.rotation += 0.04;

    if (
      bonus.x > paddle.x - paddle.width / 2 &&
      bonus.x < paddle.x + paddle.width / 2 &&
      bonus.y + bonus.size / 2 > paddle.y - paddle.height / 2 &&
      bonus.y - bonus.size / 2 < paddle.y + paddle.height / 2
    ) {
      activateBonus(bonus.type);
      bonus.collected = true;

      createParticles(bonus.x, bonus.y, "#22c55e", 24);
    }
  });

  bonuses = bonuses.filter(
    bonus => !bonus.collected && bonus.y < canvas.height + 40
  );
}

function activateBonus(type) {
  if (type === "wide") {
    paddle.width = 190;
    paddleGrowTimer = 700;
  }

  if (type === "life") {
    lives = Math.min(lives + 1, 5);
    livesEl.textContent = lives;
  }

  if (type === "multi") {
    const clones = [];

    balls.forEach(ball => {
      if (ball.launched) {
        clones.push({
          x: ball.x,
          y: ball.y,
          radius: ball.radius,
          dx: -ball.dx,
          dy: ball.dy,
          launched: true
        });
      }
    });

    balls.push(...clones);
  }
}

function updateTimers() {
  if (paddleGrowTimer > 0) {
    paddleGrowTimer--;

    if (paddleGrowTimer === 0) {
      paddle.width = 130;
    }
  }
}

function checkLevelComplete() {
  const remaining = bricks.some(brick => brick.active);

  if (!remaining) {
    levelComplete();
  }
}

function levelComplete() {
  running = false;
  cancelAnimationFrame(animationId);
  saveBest();

  const nextIndex = currentLevel + 1;

  if (nextIndex >= levels.length) {
    showOverlay(
      "🏆 You Win!",
      `You completed all levels! Score: ${score}`,
      "Play Again",
      () => startGame(0),
      true
    );

    return;
  }

  showOverlay(
    "✅ Level Complete!",
    `Password for next level: ${levels[currentLevel].next}`,
    "Continue",
    () => {
      currentLevel = nextIndex;
      setupLevel();

      running = true;
      paused = false;

      overlay.style.display = "none";
      gameLoop();
    },
    true
  );
}

function gameOver() {
  running = false;
  cancelAnimationFrame(animationId);
  saveBest();

  showOverlay(
    "💀 Game Over",
    `Your score: ${score}. Reached level: ${currentLevel + 1}.`,
    "Play Again",
    () => startGame(0),
    true
  );
}

function saveBest() {
  if (score > best) {
    best = score;
    localStorage.setItem("neonBreakBest", best);
    bestEl.textContent = best;
  }
}

function createBricks() {
  bricks = [];

  const layout = levels[currentLevel].layout;
  const rows = layout.length;
  const cols = layout[0].length;

  const padding = 8;
  const offsetX = 60;
  const offsetY = 90;
  const brickWidth = (canvas.width - offsetX * 2 - padding * (cols - 1)) / cols;
  const brickHeight = 28;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const value = layout[row][col];

      if (value === "0") continue;

      bricks.push({
        x: offsetX + col * (brickWidth + padding),
        y: offsetY + row * (brickHeight + padding),
        width: brickWidth,
        height: brickHeight,
        color: brickColors[value] || "#38bdf8",
        active: true
      });
    }
  }
}

function createStars() {
  stars = [];

  for (let i = 0; i < 120; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.3,
      speed: Math.random() * 0.7 + 0.15,
      alpha: Math.random() * 0.8 + 0.2
    });
  }
}

function updateStars() {
  stars.forEach(star => {
    star.y += star.speed;

    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });
}

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
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

function draw() {
  drawBackground();
  drawStars();
  drawBricks();
  drawPaddle();
  drawBalls();
  drawBonuses();
  drawParticles();
  drawActiveEffects();
}

function drawBackground() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height,
    30,
    canvas.width / 2,
    canvas.height,
    canvas.width
  );

  glow.addColorStop(0, "rgba(56,189,248,0.16)");
  glow.addColorStop(1, "rgba(2,6,23,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
  stars.forEach(star => {
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBricks() {
  bricks.forEach(brick => {
    if (!brick.active) return;

    ctx.save();

    ctx.shadowColor = brick.color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = brick.color;

    roundRect(brick.x, brick.y, brick.width, brick.height, 8);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.22)";
    roundRect(brick.x + 4, brick.y + 4, brick.width - 8, 5, 4);
    ctx.fill();

    ctx.restore();
  });
}

function drawPaddle() {
  ctx.save();

  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 20;

  const gradient = ctx.createLinearGradient(
    paddle.x - paddle.width / 2,
    paddle.y,
    paddle.x + paddle.width / 2,
    paddle.y
  );

  gradient.addColorStop(0, "#38bdf8");
  gradient.addColorStop(0.5, "#e0f2fe");
  gradient.addColorStop(1, "#a78bfa");

  ctx.fillStyle = gradient;

  roundRect(
    paddle.x - paddle.width / 2,
    paddle.y - paddle.height / 2,
    paddle.width,
    paddle.height,
    10
  );

  ctx.fill();
  ctx.restore();
}

function drawBalls() {
  balls.forEach(ball => {
    ctx.save();

    ctx.shadowColor = "#22c55e";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#bbf7d0";

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function getBonusStyle(type) {
  if (type === "wide") {
    return {
      color: "#38bdf8",
      icon: "↔"
    };
  }

  if (type === "multi") {
    return {
      color: "#a78bfa",
      icon: "×2"
    };
  }

  return {
    color: "#f43f5e",
    icon: "+"
  };
}

function drawBonuses() {
  bonuses.forEach(bonus => {
    const style = getBonusStyle(bonus.type);

    ctx.save();

    ctx.translate(bonus.x, bonus.y);
    ctx.rotate(bonus.rotation);

    ctx.shadowColor = style.color;
    ctx.shadowBlur = 18;

    ctx.fillStyle = "rgba(15,23,42,0.9)";
    ctx.strokeStyle = style.color;
    ctx.lineWidth = 3;

    roundRect(-bonus.size / 2, -bonus.size / 2, bonus.size, bonus.size, 8);
    ctx.fill();
    ctx.stroke();

    ctx.rotate(-bonus.rotation);

    ctx.fillStyle = style.color;
    ctx.font = "bold 15px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(style.icon, 0, 1);

    ctx.restore();
  });
}

function drawParticles() {
  particles.forEach(p => {
    ctx.save();

    ctx.globalAlpha = p.life / 36;

    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawActiveEffects() {
  if (paddleGrowTimer <= 0) return;

  ctx.save();

  const text = `Wide Paddle: ${Math.ceil(paddleGrowTimer / 60)}s`;

  ctx.font = "bold 14px system-ui";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const width = ctx.measureText(text).width + 28;

  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "rgba(15,23,42,0.85)";
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 1.5;

  roundRect(18, 18, width, 26, 13);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#38bdf8";
  ctx.fillText(text, 32, 31);

  ctx.restore();
}

function showOverlay(title, text, buttonText, action, showPasswordBox = false) {
  overlay.innerHTML = `
    <div class="panel">
      <h2>${title}</h2>
      <p>${text}</p>
      <button id="overlayBtn">${buttonText}</button>

      ${
        showPasswordBox
          ? `
            <div class="password-box">
              <input id="passwordInputOverlay" placeholder="Enter password">
              <button id="passwordBtnOverlay">Start From Password</button>
            </div>
            <p id="passwordMessageOverlay"></p>
          `
          : ""
      }
    </div>
  `;

  overlay.style.display = "grid";

  document.getElementById("overlayBtn").onclick = action;

  if (showPasswordBox) {
    document.getElementById("passwordBtnOverlay").onclick = () => {
      const input = document.getElementById("passwordInputOverlay");
      const message = document.getElementById("passwordMessageOverlay");

      const value = input.value.trim().toUpperCase();
      const index = levels.findIndex(level => level.password === value);

      if (index === -1) {
        message.textContent = "Invalid password.";
        return;
      }

      currentLevel = index;
      score = 0;
      lives = 3;

      setupLevel();

      running = true;
      paused = false;

      overlay.style.display = "none";

      cancelAnimationFrame(animationId);
      gameLoop();
    };
  }
}

function togglePause() {
  if (!running) return;

  paused = !paused;

  if (paused) {
    showOverlay(
      "⏸️ Paused",
      "Press P or click Continue.",
      "Continue",
      togglePause,
      false
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
    keys.left = true;
  }

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    keys.right = true;
  }

  if (e.code === "Space") {
    e.preventDefault();
    launchBall();
  }

  if (e.key.toLowerCase() === "p") {
    togglePause();
  }
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    keys.left = false;
  }

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    keys.right = false;
  }
});

createStars();
drawBackground();
drawStars();