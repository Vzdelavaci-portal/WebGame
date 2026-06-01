const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const nextCanvas = document.getElementById("nextCanvas");
const nextCtx = nextCanvas.getContext("2d");

const holdCanvas = document.getElementById("holdCanvas");
const holdCtx = holdCanvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const levelEl = document.getElementById("level");
const linesEl = document.getElementById("lines");
const comboEl = document.getElementById("combo");
const overlay = document.getElementById("overlay");

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const colors = {
  I: "#38bdf8",
  J: "#3b82f6",
  L: "#f97316",
  O: "#facc15",
  S: "#22c55e",
  T: "#a78bfa",
  Z: "#f43f5e"
};
 
const pieces = {
  I: [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  J: [
    [1,0,0],
    [1,1,1],
    [0,0,0]
  ],
  L: [
    [0,0,1],
    [1,1,1],
    [0,0,0]
  ],
  O: [
    [1,1],
    [1,1]
  ],
  S: [
    [0,1,1],
    [1,1,0],
    [0,0,0]
  ],
  T: [
    [0,1,0],
    [1,1,1],
    [0,0,0]
  ],
  Z: [
    [1,1,0],
    [0,1,1],
    [0,0,0]
  ]
};

let board = [];
let currentPiece;
let nextPiece;
let holdPiece = null;
let canHold = true;

let score = 0;
let best = localStorage.getItem("neonTetrisBest") || 0;
let level = 1;
let lines = 0;
let combo = 0;

let dropCounter = 0;
let dropInterval = 850;
let lastTime = 0;

let running = false;
let paused = false;
let animationId;

let particles = [];
let flashTimer = 0;
let shakeTimer = 0;

bestEl.textContent = best;

function startGame() {
  board = createBoard();

  score = 0;
  level = 1;
  lines = 0;
  combo = 0;

  holdPiece = null;
  canHold = true;

  particles = [];
  flashTimer = 0;
  shakeTimer = 0;

  nextPiece = randomPiece();
  spawnPiece();

  running = true;
  paused = false;
  lastTime = 0;

  overlay.style.display = "none";

  updateUI();
  drawSidePanels();

  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece() {
  const names = Object.keys(pieces);
  const type = names[Math.floor(Math.random() * names.length)];

  return {
    type,
    shape: pieces[type].map(row => [...row]),
    x: Math.floor(COLS / 2) - 2,
    y: -1,
    color: colors[type]
  };
}

function spawnPiece() {
  currentPiece = nextPiece;
  currentPiece.x = Math.floor(COLS / 2) - Math.ceil(currentPiece.shape[0].length / 2);
  currentPiece.y = -1;

  nextPiece = randomPiece();
  canHold = true;

  if (collides(currentPiece)) {
    gameOver();
  }

  drawSidePanels();
}

function gameLoop(time = 0) {
  if (!running) return;

  const delta = time - lastTime;
  lastTime = time;

  if (!paused) {
    dropCounter += delta;

    if (dropCounter > dropInterval) {
      softDrop();
      dropCounter = 0;
    }

    updateParticles();

    if (flashTimer > 0) flashTimer--;
    if (shakeTimer > 0) shakeTimer--;

    draw();
  }

  animationId = requestAnimationFrame(gameLoop);
}

function movePiece(dir) {
  if (!running || paused) return;

  currentPiece.x += dir;

  if (collides(currentPiece)) {
    currentPiece.x -= dir;
  } else {
    createParticles(
      (currentPiece.x + 1.5) * BLOCK,
      (currentPiece.y + 1.5) * BLOCK,
      currentPiece.color,
      2
    );
  }

  draw();
}

function softDrop() {
  if (!running || paused) return;

  currentPiece.y++;

  if (collides(currentPiece)) {
    currentPiece.y--;
    mergePiece();
    clearLines();
    spawnPiece();
  }

  draw();
}

function hardDrop() {
  if (!running || paused) return;

  let distance = 0;

  while (!collides(currentPiece)) {
    currentPiece.y++;
    distance++;
  }

  currentPiece.y--;
  distance--;

  score += distance * 2;

  mergePiece();
  clearLines();
  spawnPiece();

  shakeTimer = 8;
  updateUI();
  draw();
}

function rotatePiece() {
  if (!running || paused) return;

  const oldShape = currentPiece.shape;
  const rotated = rotateMatrix(currentPiece.shape);
  currentPiece.shape = rotated;

  if (collides(currentPiece)) {
    currentPiece.x++;

    if (collides(currentPiece)) {
      currentPiece.x -= 2;

      if (collides(currentPiece)) {
        currentPiece.x++;
        currentPiece.shape = oldShape;
      }
    }
  }

  draw();
}

function holdCurrentPiece() {
  if (!running || paused || !canHold) return;

  const stored = holdPiece;

  holdPiece = {
    type: currentPiece.type,
    shape: pieces[currentPiece.type].map(row => [...row]),
    color: currentPiece.color
  };

  if (stored) {
    currentPiece = {
      type: stored.type,
      shape: pieces[stored.type].map(row => [...row]),
      x: Math.floor(COLS / 2) - 2,
      y: -1,
      color: stored.color
    };
  } else {
    spawnPiece();
  }

  canHold = false;
  drawSidePanels();
  draw();
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
}

function collides(piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (!piece.shape[y][x]) continue;

      const boardX = piece.x + x;
      const boardY = piece.y + y;

      if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
        return true;
      }

      if (boardY >= 0 && board[boardY][boardX]) {
        return true;
      }
    }
  }

  return false;
}

function mergePiece() {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        const boardY = currentPiece.y + y;
        const boardX = currentPiece.x + x;

        if (boardY >= 0) {
          board[boardY][boardX] = currentPiece.color;
        }
      }
    });
  });
}

function clearLines() {
  let cleared = 0;

  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell)) {
      cleared++;

      for (let x = 0; x < COLS; x++) {
        createParticles(
          x * BLOCK + BLOCK / 2,
          y * BLOCK + BLOCK / 2,
          board[y][x],
          8
        );
      }

      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      y++;
    }
  }

  if (cleared > 0) {
    combo++;

    const lineScores = [0, 100, 300, 500, 800];
    score += lineScores[cleared] * level + combo * 25;

    lines += cleared;
    level = Math.floor(lines / 8) + 1;
    dropInterval = Math.max(120, 850 - (level - 1) * 65);

    flashTimer = 8;
    shakeTimer = 8;
  } else {
    combo = 0;
  }

  updateUI();
}

function getGhostPiece() {
  const ghost = {
    ...currentPiece,
    shape: currentPiece.shape.map(row => [...row])
  };

  while (!collides(ghost)) {
    ghost.y++;
  }

  ghost.y--;

  return ghost;
}

function draw() {
  ctx.save();

  const shakeX = shakeTimer > 0 ? (Math.random() - 0.5) * 6 : 0;
  const shakeY = shakeTimer > 0 ? (Math.random() - 0.5) * 6 : 0;

  ctx.translate(shakeX, shakeY);

  drawBackground();
  drawGrid();
  drawBoard();

  if (currentPiece) {
    drawPiece(getGhostPiece(), true);
    drawPiece(currentPiece, false);
  }

  drawParticles();

  if (flashTimer > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flashTimer / 32})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.restore();
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

  glow.addColorStop(0, "rgba(56,189,248,.16)");
  glow.addColorStop(1, "rgba(2,6,23,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
  ctx.strokeStyle = "rgba(56,189,248,.08)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * BLOCK, 0);
    ctx.lineTo(x * BLOCK, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * BLOCK);
    ctx.lineTo(canvas.width, y * BLOCK);
    ctx.stroke();
  }
}

function drawBoard() {
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        drawBlock(x, y, cell);
      }
    });
  });
}

function drawPiece(piece, ghost = false) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;

      const drawX = piece.x + x;
      const drawY = piece.y + y;

      if (drawY < 0) return;

      drawBlock(drawX, drawY, piece.color, ghost);
    });
  });
}

function drawBlock(x, y, color, ghost = false) {
  const px = x * BLOCK;
  const py = y * BLOCK;

  ctx.save();

  ctx.shadowColor = color;
  ctx.shadowBlur = ghost ? 5 : 16;
  ctx.globalAlpha = ghost ? 0.24 : 1;

  ctx.fillStyle = ghost ? "transparent" : color;
  ctx.strokeStyle = color;
  ctx.lineWidth = ghost ? 2 : 1.5;

  roundRect(px + 2, py + 2, BLOCK - 4, BLOCK - 4, 7);
  ctx.fill();
  ctx.stroke();

  if (!ghost) {
    ctx.fillStyle = "rgba(255,255,255,.24)";
    roundRect(px + 6, py + 5, BLOCK - 12, 5, 4);
    ctx.fill();
  }

  ctx.restore();
}

function drawSidePanels() {
  drawMiniPiece(nextCtx, nextCanvas, nextPiece);

  if (holdPiece) {
    drawMiniPiece(holdCtx, holdCanvas, holdPiece);
  } else {
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
  }
}

function drawMiniPiece(context, targetCanvas, piece) {
  context.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  context.fillStyle = "#020617";
  context.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

  if (!piece) return;

  const block = 24;
  const shape = piece.shape;
  const offsetX = (targetCanvas.width - shape[0].length * block) / 2;
  const offsetY = (targetCanvas.height - shape.length * block) / 2;

  shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;

      context.save();
      context.shadowColor = piece.color;
      context.shadowBlur = 14;
      context.fillStyle = piece.color;
      context.strokeStyle = piece.color;
      context.lineWidth = 1.5;

      roundRectCanvas(
        context,
        offsetX + x * block + 2,
        offsetY + y * block + 2,
        block - 4,
        block - 4,
        6
      );

      context.fill();
      context.stroke();
      context.restore();
    });
  });
}

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7,
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

function updateUI() {
  scoreEl.textContent = score;
  linesEl.textContent = lines;
  levelEl.textContent = level;
  comboEl.textContent = combo;

  if (score > best) {
    best = score;
    localStorage.setItem("neonTetrisBest", best);
    bestEl.textContent = best;
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
      togglePause
    );
  } else {
    overlay.style.display = "none";
    lastTime = performance.now();
  }
}

function gameOver() {
  running = false;
  cancelAnimationFrame(animationId);

  showOverlay(
    "💀 Game Over",
    `Your score: ${score}. Lines cleared: ${lines}.`,
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

function roundRectCanvas(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + w - r, y);
  context.quadraticCurveTo(x + w, y, x + w, y + r);
  context.lineTo(x + w, y + h - r);
  context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  context.lineTo(x + r, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    movePiece(-1);
  }

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    movePiece(1);
  }

  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
    softDrop();
  }

  if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
    rotatePiece();
  }

  if (e.code === "Space") {
    e.preventDefault();
    hardDrop();
  }

  if (e.key.toLowerCase() === "c") {
    holdCurrentPiece();
  }

  if (e.key.toLowerCase() === "p") {
    togglePause();
  }
});

drawBackground();
drawGrid();
drawSidePanels();
