const STORAGE_KEYS = {
  bestScore: "wan_start_shooter_best_score",
  challengeWins: "wan_start_shooter_challenge_wins",
};

const CHALLENGE_TARGETS = [120, 180, 260, 340, 420];
const PLAYER_MAX_LIVES = 10;
const PLAYER_INVINCIBLE_MS = 900;

const canvas = document.getElementById("shooterGame");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("gameStartButton");
const mobileButtons = document.querySelectorAll(".mobile-button");

const state = {
  running: false,
  animationId: 0,
  score: 0,
  bestScore: Number(localStorage.getItem(STORAGE_KEYS.bestScore) || 0),
  lives: PLAYER_MAX_LIVES,
  challengeTarget: CHALLENGE_TARGETS[0],
  challengeCompleted: false,
  challengeWins: Number(localStorage.getItem(STORAGE_KEYS.challengeWins) || 0),
  keys: {
    left: false,
    right: false,
    fire: false,
  },
  player: null,
  bullets: [],
  enemies: [],
  enemyBullets: [],
  explosions: [],
  lastFrameAt: 0,
  lastSpawnAt: 0,
  lastShotAt: 0,
  lastEnemyShotAt: 0,
  difficultyElapsed: 0,
  status: "待开始",
  invincibleUntil: 0,
  damageFlashUntil: 0,
  pulseRings: [],
};

function chooseChallengeTarget() {
  return CHALLENGE_TARGETS[Math.floor(Math.random() * CHALLENGE_TARGETS.length)];
}

function syncHud(status = state.status) {
  state.status = status;
}

function resetGame() {
  state.running = true;
  state.score = 0;
  state.lives = PLAYER_MAX_LIVES;
  state.challengeTarget = chooseChallengeTarget();
  state.challengeCompleted = false;
  state.bullets = [];
  state.enemies = [];
  state.enemyBullets = [];
  state.explosions = [];
  state.pulseRings = [];
  state.lastFrameAt = 0;
  state.lastSpawnAt = 0;
  state.lastShotAt = 0;
  state.lastEnemyShotAt = 0;
  state.difficultyElapsed = 0;
  state.invincibleUntil = 0;
  state.damageFlashUntil = 0;
  state.player = {
    width: 48,
    height: 34,
    x: canvas.width / 2 - 24,
    y: canvas.height - 60,
    speed: 390,
  };
  syncHud("游戏中");
  cancelAnimationFrame(state.animationId);
  state.animationId = requestAnimationFrame(gameLoop);
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function getPlayerHurtbox() {
  return {
    x: state.player.x + 12,
    y: state.player.y + 8,
    width: state.player.width - 24,
    height: state.player.height - 14,
  };
}

function spawnEnemy() {
  const size = 28 + Math.random() * 18;
  state.enemies.push({
    x: Math.random() * (canvas.width - size),
    y: -size - 12,
    size,
    width: size,
    height: size,
    speed: 80 + Math.random() * 120 + Math.min(state.difficultyElapsed * 4, 120),
  });
}

function spawnExplosion(x, y, color) {
  state.explosions.push({
    x,
    y,
    radius: 8,
    maxRadius: 24,
    alpha: 1,
    color,
  });
}

function spawnPulseRing(x, y) {
  state.pulseRings.push({
    x,
    y,
    radius: 10,
    alpha: 0.82,
  });
}

function firePlayerBullet(timestamp) {
  if (!state.running || timestamp - state.lastShotAt < 140) {
    return;
  }

  state.lastShotAt = timestamp;
  state.bullets.push({
    x: state.player.x + state.player.width / 2 - 3,
    y: state.player.y - 10,
    width: 6,
    height: 16,
    speed: 560,
  });
}

function maybeFireEnemyBullet(timestamp) {
  if (timestamp - state.lastEnemyShotAt < 760 || state.enemies.length === 0) {
    return;
  }

  state.lastEnemyShotAt = timestamp;
  const shooter = state.enemies[Math.floor(Math.random() * state.enemies.length)];
  state.enemyBullets.push({
    x: shooter.x + shooter.size / 2 - 3,
    y: shooter.y + shooter.size,
    width: 6,
    height: 14,
    speed: 230 + Math.min(state.difficultyElapsed * 8, 180),
  });
}

function updateScore(points) {
  state.score += points;
  if (state.score > state.bestScore) {
    state.bestScore = state.score;
    localStorage.setItem(STORAGE_KEYS.bestScore, String(state.bestScore));
  }
  if (!state.challengeCompleted && state.score >= state.challengeTarget) {
    state.challengeCompleted = true;
    state.challengeWins += 1;
    localStorage.setItem(STORAGE_KEYS.challengeWins, String(state.challengeWins));
  }
  syncHud("游戏中");
}

function damagePlayer() {
  const now = performance.now();
  if (now < state.invincibleUntil) {
    return false;
  }

  state.lives -= 1;
  state.invincibleUntil = now + PLAYER_INVINCIBLE_MS;
  state.damageFlashUntil = now + 220;
  spawnExplosion(state.player.x + state.player.width / 2, state.player.y + state.player.height / 2, "255, 180, 150");
  spawnPulseRing(state.player.x + state.player.width / 2, state.player.y + state.player.height / 2);
  if (state.lives <= 0) {
    endGame();
  } else {
    syncHud("受击");
  }
  return true;
}

function endGame() {
  state.running = false;
  cancelAnimationFrame(state.animationId);
  syncHud(state.challengeCompleted ? "挑战达成" : "已结束");
  renderFrame(performance.now());
}

function updateExplosions(deltaSeconds) {
  state.explosions = state.explosions
    .map((item) => ({
      ...item,
      radius: item.radius + 60 * deltaSeconds,
      alpha: item.alpha - 1.6 * deltaSeconds,
    }))
    .filter((item) => item.radius < item.maxRadius && item.alpha > 0);

  state.pulseRings = state.pulseRings
    .map((item) => ({
      ...item,
      radius: item.radius + 180 * deltaSeconds,
      alpha: item.alpha - 1.5 * deltaSeconds,
    }))
    .filter((item) => item.alpha > 0);
}

function updateGame(deltaMs, timestamp) {
  const deltaSeconds = deltaMs / 1000;
  state.difficultyElapsed += deltaSeconds;

  if (state.keys.left) {
    state.player.x -= state.player.speed * deltaSeconds;
  }
  if (state.keys.right) {
    state.player.x += state.player.speed * deltaSeconds;
  }
  state.player.x = Math.max(0, Math.min(canvas.width - state.player.width, state.player.x));

  if (state.keys.fire) {
    firePlayerBullet(timestamp);
  }

  const spawnInterval = Math.max(420, 900 - state.difficultyElapsed * 22);
  if (timestamp - state.lastSpawnAt > spawnInterval) {
    spawnEnemy();
    state.lastSpawnAt = timestamp;
  }

  maybeFireEnemyBullet(timestamp);

  state.bullets = state.bullets
    .map((bullet) => ({ ...bullet, y: bullet.y - bullet.speed * deltaSeconds }))
    .filter((bullet) => bullet.y + bullet.height > 0);

  state.enemyBullets = state.enemyBullets
    .map((bullet) => ({ ...bullet, y: bullet.y + bullet.speed * deltaSeconds }))
    .filter((bullet) => bullet.y < canvas.height + bullet.height);

  state.enemies = state.enemies
    .map((enemy) => ({ ...enemy, y: enemy.y + enemy.speed * deltaSeconds }))
    .filter((enemy) => {
      if (enemy.y <= canvas.height + enemy.size) {
        return true;
      }
      return false;
    });

  const remainingBullets = [];
  for (const bullet of state.bullets) {
    let hit = false;
    for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = state.enemies[i];
      if (intersects(bullet, enemy)) {
        state.enemies.splice(i, 1);
        spawnExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, "207, 127, 108");
        updateScore(10);
        hit = true;
        break;
      }
    }
    if (!hit) {
      remainingBullets.push(bullet);
    }
  }
  state.bullets = remainingBullets;

  const playerBox = getPlayerHurtbox();
  state.enemyBullets = state.enemyBullets.filter((bullet) => {
    if (!intersects(playerBox, bullet)) {
      return true;
    }
    damagePlayer();
    return false;
  });

  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    if (intersects(playerBox, state.enemies[i])) {
      spawnExplosion(state.enemies[i].x + state.enemies[i].size / 2, state.enemies[i].y + state.enemies[i].size / 2, "207, 127, 108");
      state.enemies.splice(i, 1);
      damagePlayer();
    }
  }

  updateExplosions(deltaSeconds);
}

function drawPlayer() {
  const { x, y, width, height } = state.player;
  ctx.save();
  ctx.translate(x, y);
  const now = performance.now();
  if (now < state.invincibleUntil && Math.floor(now / 80) % 2 === 0) {
    ctx.globalAlpha = 0.42;
  }
  ctx.fillStyle = "#c8a58e";
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width, height);
  ctx.lineTo(width / 2, height - 9);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#7f95b3";
  ctx.fillRect(width / 2 - 5, height - 10, 10, 10);

  if (performance.now() < state.invincibleUntil) {
    const hurtbox = getPlayerHurtbox();
    ctx.strokeStyle = "rgba(255, 207, 181, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(hurtbox.x - x, hurtbox.y - y, hurtbox.width, hurtbox.height);
  }
  ctx.restore();
}

function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.fillStyle = "#cf7f6c";
  ctx.beginPath();
  ctx.moveTo(enemy.size / 2, enemy.size);
  ctx.lineTo(enemy.size, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBullets() {
  ctx.fillStyle = "#f2d7b8";
  state.bullets.forEach((bullet) => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  ctx.fillStyle = "#9eb4d8";
  state.enemyBullets.forEach((bullet) => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

function drawExplosions() {
  state.explosions.forEach((item) => {
    ctx.beginPath();
    ctx.fillStyle = `rgba(${item.color}, ${item.alpha})`;
    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  state.pulseRings.forEach((item) => {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = `rgba(255, 196, 164, ${item.alpha})`;
    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawStarfield(timestamp) {
  const offset = (timestamp * 0.05) % canvas.height;
  ctx.fillStyle = "rgba(230, 228, 222, 0.62)";
  for (let i = 0; i < 44; i += 1) {
    const x = (i * 71) % canvas.width;
    const y = (i * 43 + offset) % canvas.height;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawHud() {
  ctx.save();
  ctx.fillStyle = "rgba(8, 12, 18, 0.58)";
  ctx.fillRect(16, 16, 296, 118);
  ctx.strokeStyle = "rgba(182, 194, 214, 0.18)";
  ctx.strokeRect(16, 16, 296, 118);

  ctx.textAlign = "left";
  ctx.fillStyle = "#9aa3b5";
  ctx.font = "700 12px Manrope, sans-serif";
  ctx.fillText("SCORE", 28, 40);
  ctx.fillText("BEST", 128, 40);
  ctx.fillText("LIVES", 214, 40);

  ctx.fillStyle = "#e6e4de";
  ctx.font = "800 24px Manrope, sans-serif";
  ctx.fillText(String(state.score), 28, 72);
  ctx.fillText(String(state.bestScore), 128, 72);
  ctx.fillText(`${state.lives}/${PLAYER_MAX_LIVES}`, 214, 72);

  ctx.fillStyle = "#9aa3b5";
  ctx.font = "700 12px Manrope, sans-serif";
  ctx.fillText("CHALLENGE", 28, 98);
  ctx.fillText("STATUS", 172, 98);

  ctx.fillStyle = state.challengeCompleted ? "#c8a58e" : "#e6e4de";
  ctx.font = "700 14px Manrope, sans-serif";
  ctx.fillText(`${state.challengeTarget}  (${state.challengeWins})`, 28, 118);

  ctx.fillStyle = performance.now() < state.invincibleUntil ? "#ffcfb5" : "#e6e4de";
  ctx.fillText(state.status, 172, 118);
  ctx.restore();
}

function renderOverlay() {
  if (state.running) {
    return;
  }

  ctx.fillStyle = "rgba(8, 12, 18, 0.62)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#e6e4de";
  ctx.font = "700 28px Manrope, sans-serif";
  ctx.fillText("开始 / 重新开始", canvas.width / 2, canvas.height / 2 - 12);
  ctx.font = "400 16px Manrope, sans-serif";
  ctx.fillStyle = "#9aa3b5";
  ctx.fillText("键盘或下方触控按钮都能玩", canvas.width / 2, canvas.height / 2 + 20);
}

function renderFrame(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStarfield(timestamp);
  if (timestamp < state.damageFlashUntil) {
    ctx.fillStyle = "rgba(255, 128, 106, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (state.player) {
    drawPlayer();
  }
  drawBullets();
  state.enemies.forEach(drawEnemy);
  drawExplosions();
  drawHud();
  renderOverlay();
}

function gameLoop(timestamp) {
  if (!state.running) {
    return;
  }
  const deltaMs = state.lastFrameAt ? timestamp - state.lastFrameAt : 16;
  state.lastFrameAt = timestamp;
  updateGame(deltaMs, timestamp);
  renderFrame(timestamp);
  if (state.running) {
    state.animationId = requestAnimationFrame(gameLoop);
  }
}

function setControl(control, pressed) {
  if (control === "left") {
    state.keys.left = pressed;
  }
  if (control === "right") {
    state.keys.right = pressed;
  }
  if (control === "fire") {
    state.keys.fire = pressed;
    if (pressed) {
      firePlayerBullet(performance.now());
    }
  }
}

function handleKeyDown(event) {
  if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
    setControl("left", true);
  }
  if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
    setControl("right", true);
  }
  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    setControl("fire", true);
  }
}

function handleKeyUp(event) {
  if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
    setControl("left", false);
  }
  if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
    setControl("right", false);
  }
  if (event.key === " " || event.code === "Space") {
    setControl("fire", false);
  }
}

function bindMobileButton(button) {
  const control = button.dataset.control;
  const press = (event) => {
    event.preventDefault();
    setControl(control, true);
  };
  const release = (event) => {
    event.preventDefault();
    setControl(control, false);
  };
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("pointercancel", release);
}

syncHud("待开始");
renderFrame(performance.now());
startButton.addEventListener("click", resetGame);
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
mobileButtons.forEach(bindMobileButton);
