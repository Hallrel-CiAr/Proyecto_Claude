// ─── CONFIG & PARAMS ─────────────────────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const GAME_MODE    = params.get('mode')         || 'ai';     // 'ai' | 'multi'
const ROLE         = params.get('role')         || 'host';   // 'host' | 'guest'
const ROOM_CODE    = params.get('roomCode')     || '';
const MAX_POINTS   = parseInt(params.get('points')) || 5;
const DIFFICULTY   = params.get('difficulty')   || 'normal';
const PLAYER_NAME  = params.get('playerName')   || 'Jugador';
const PLAYER_UID   = params.get('playerUid')    || '';
const OPPONENT_NAME= params.get('opponentName') || (GAME_MODE === 'ai' ? 'CPU' : 'Rival');
const IS_GUEST     = params.get('isGuest') === 'true';

// ─── CANVAS SETUP ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

let W, H;
let PADDLE_W, PADDLE_H, BALL_R, PADDLE_Y_BOTTOM, PADDLE_Y_TOP, PADDLE_MARGIN;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;

  PADDLE_W        = W * 0.22;
  PADDLE_H        = H * 0.022;
  BALL_R          = W * 0.025;
  PADDLE_MARGIN   = H * 0.12;
  PADDLE_Y_BOTTOM = H - PADDLE_MARGIN;
  PADDLE_Y_TOP    = PADDLE_MARGIN;
}

resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); });

// ─── GAME STATE ───────────────────────────────────────────────────────────────
const PHASE = { COUNTDOWN: 'countdown', PLAYING: 'playing', PAUSED: 'paused',
                SCORED: 'scored', FINISHED: 'finished' };

let phase        = PHASE.COUNTDOWN;
let scores       = { bottom: 0, top: 0 };
let pauses       = { bottom: 2, top: 2 };
let serving      = 'bottom';
let countdownVal = 3;
let countdownTimer = null;
let pausedBy     = null;
let winner       = null;

// Ball (pixel coords, managed by host)
let ball = { x: 0, y: 0, vx: 0, vy: 0 };

// Paddles (pixel coords)
let paddleBottom = { x: 0 };
let paddleTop    = { x: 0 };

// Touch
let touchX = null;

// AI
let aiTargetX = 0;

// Multiplayer
let roomRef = null;
let opponentConnected = false;
let lastSyncTime = 0;
const SYNC_INTERVAL = 33; // ~30fps sync to Firebase

// Animation frame
let rafId = null;
let lastTime = 0;

// ─── AI SETTINGS ──────────────────────────────────────────────────────────────
const AI_CONFIG = {
  easy:   { speed: 0.20, reactionDelay: 0.4, errorRange: 0.12, predicts: false },
  normal: { speed: 0.38, reactionDelay: 0.2, errorRange: 0.05, predicts: false },
  hard:   { speed: 0.60, reactionDelay: 0.05, errorRange: 0.01, predicts: true  }
};
const ai = AI_CONFIG[DIFFICULTY] || AI_CONFIG.normal;
let aiCurrentError = 0;

// ─── INITIALIZE ───────────────────────────────────────────────────────────────
function initPositions() {
  paddleBottom.x = W / 2;
  paddleTop.x    = W / 2;
  resetBall(serving);
}

function resetBall(server) {
  const cx = W / 2;
  const cy = H / 2;

  ball.x = cx;
  ball.y = (server === 'bottom') ? PADDLE_Y_BOTTOM - BALL_R * 3 : PADDLE_Y_TOP + BALL_R * 3;
  ball.vx = 0;
  ball.vy = 0;
}

function launchBall(server) {
  const baseSpeed = H * 0.55; // pixels per second
  const angle = (Math.random() * 40 - 20) * (Math.PI / 180); // ±20° random
  const dirY = server === 'bottom' ? -1 : 1;

  ball.vx = Math.sin(angle) * baseSpeed;
  ball.vy = dirY * Math.cos(angle) * baseSpeed;
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function updateHUD() {
  document.getElementById('hud-player-name').textContent = PLAYER_NAME;
  document.getElementById('hud-opponent-name').textContent = OPPONENT_NAME;
  document.getElementById('hud-score-player').textContent = scores.bottom;
  document.getElementById('hud-score-opponent').textContent = scores.top;

  renderPauseDots('hud-player-pauses', pauses.bottom);
  renderPauseDots('hud-opponent-pauses', pauses.top);

  const pauseBtn = document.getElementById('btn-pause');
  const canPause = phase === PHASE.PLAYING && pauses.bottom > 0 && isBallInDomain('bottom');
  pauseBtn.disabled = !canPause;
}

function renderPauseDots(elId, remaining) {
  const el = document.getElementById(elId);
  el.innerHTML = '';
  for (let i = 0; i < 2; i++) {
    const dot = document.createElement('div');
    dot.className = 'hud-pause-dot' + (i >= remaining ? ' used' : '');
    el.appendChild(dot);
  }
}

function isBallInDomain(side) {
  if (side === 'bottom') return ball.y > H / 2;
  return ball.y < H / 2;
}

// ─── OVERLAYS ─────────────────────────────────────────────────────────────────
function showOverlay(id) {
  ['overlay-countdown','overlay-pause','overlay-gameover',
   'overlay-connecting','overlay-opponent-left'].forEach(o => {
    document.getElementById(o).classList.toggle('hidden', o !== id);
  });
}

function hideAllOverlays() {
  ['overlay-countdown','overlay-pause','overlay-gameover',
   'overlay-connecting','overlay-opponent-left'].forEach(o => {
    document.getElementById(o).classList.add('hidden');
  });
}

function startCountdown(label) {
  countdownVal = 3;
  phase = PHASE.COUNTDOWN;
  showOverlay('overlay-countdown');
  document.getElementById('countdown-label').textContent = label || '¡Preparate!';
  updateCountdownDisplay();

  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    countdownVal--;
    if (countdownVal <= 0) {
      clearInterval(countdownTimer);
      hideAllOverlays();
      phase = PHASE.PLAYING;
      launchBall(serving);
    } else {
      updateCountdownDisplay();
    }
  }, 1000);
}

function updateCountdownDisplay() {
  const el = document.getElementById('countdown-num');
  el.textContent = countdownVal;
  el.style.animation = 'none';
  void el.offsetWidth; // reflow to restart animation
  el.style.animation = '';
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
canvas.addEventListener('touchstart', onTouchStart, { passive: false });
canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
canvas.addEventListener('touchend',   () => { touchX = null; });

canvas.addEventListener('mousemove', e => {
  if (GAME_MODE === 'multi' && ROLE === 'guest') return;
  touchX = e.clientX;
});

function onTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  touchX = touch.clientX;
}

function onTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  touchX = touch.clientX;
}

document.getElementById('btn-pause').addEventListener('click', () => {
  if (phase !== PHASE.PLAYING) return;
  if (pauses.bottom <= 0) return;
  if (!isBallInDomain('bottom')) return;

  pauses.bottom--;
  pausedBy = 'bottom';
  phase = PHASE.PAUSED;

  document.getElementById('pauses-left').textContent = pauses.bottom;
  showOverlay('overlay-pause');

  if (GAME_MODE === 'multi') syncPauseToFirebase();
});

document.getElementById('btn-resume').addEventListener('click', resumeGame);

function resumeGame() {
  if (phase !== PHASE.PAUSED) return;
  pausedBy = null;
  hideAllOverlays();
  phase = PHASE.PLAYING;

  if (GAME_MODE === 'multi') syncResumeToFirebase();
}

// ─── PHYSICS ─────────────────────────────────────────────────────────────────
function updatePhysics(dt) {
  if (phase !== PHASE.PLAYING) return;

  // Move ball
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Wall bounces (left/right)
  if (ball.x - BALL_R < 0) {
    ball.x = BALL_R;
    ball.vx = Math.abs(ball.vx);
  }
  if (ball.x + BALL_R > W) {
    ball.x = W - BALL_R;
    ball.vx = -Math.abs(ball.vx);
  }

  // Paddle collisions
  checkPaddleCollision();

  // Scoring
  if (ball.y + BALL_R < 0) {
    // Ball passed top → bottom scores
    scorePoint('bottom');
  } else if (ball.y - BALL_R > H) {
    // Ball passed bottom → top scores
    scorePoint('top');
  }

  // Update player paddle from touch
  if (touchX !== null) {
    const targetX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, touchX));
    paddleBottom.x += (targetX - paddleBottom.x) * 0.35;
  }

  // AI update (only in AI mode)
  if (GAME_MODE === 'ai') updateAI(dt);
}

function checkPaddleCollision() {
  // Bottom paddle
  if (ball.vy > 0 &&
      ball.y + BALL_R >= PADDLE_Y_BOTTOM - PADDLE_H / 2 &&
      ball.y + BALL_R <= PADDLE_Y_BOTTOM + PADDLE_H / 2 &&
      ball.x >= paddleBottom.x - PADDLE_W / 2 - BALL_R &&
      ball.x <= paddleBottom.x + PADDLE_W / 2 + BALL_R) {

    ball.y  = PADDLE_Y_BOTTOM - PADDLE_H / 2 - BALL_R;
    ball.vy = -Math.abs(ball.vy);
    applyPaddleSpin(paddleBottom.x);
    increaseBallSpeed();
  }

  // Top paddle
  if (ball.vy < 0 &&
      ball.y - BALL_R <= PADDLE_Y_TOP + PADDLE_H / 2 &&
      ball.y - BALL_R >= PADDLE_Y_TOP - PADDLE_H / 2 &&
      ball.x >= paddleTop.x - PADDLE_W / 2 - BALL_R &&
      ball.x <= paddleTop.x + PADDLE_W / 2 + BALL_R) {

    ball.y  = PADDLE_Y_TOP + PADDLE_H / 2 + BALL_R;
    ball.vy = Math.abs(ball.vy);
    applyPaddleSpin(paddleTop.x);
    increaseBallSpeed();
  }
}

function applyPaddleSpin(paddleX) {
  const offset = (ball.x - paddleX) / (PADDLE_W / 2);
  ball.vx = offset * H * 0.45;
}

function increaseBallSpeed() {
  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  const newSpeed = Math.min(speed * 1.04, H * 1.1);
  const ratio = newSpeed / speed;
  ball.vx *= ratio;
  ball.vy *= ratio;
}

function scorePoint(scorer) {
  scores[scorer]++;
  serving = scorer === 'bottom' ? 'top' : 'bottom'; // loser serves next

  updateHUD();
  phase = PHASE.SCORED;

  if (scores[scorer] >= MAX_POINTS) {
    endGame(scorer);
    return;
  }

  // Reset and start countdown
  resetBall(serving);
  setTimeout(() => {
    if (phase === PHASE.FINISHED) return;
    startCountdown(serving === 'bottom' ? '¡Tu saque!' : 'Saque rival');
  }, 400);
}

// ─── AI ───────────────────────────────────────────────────────────────────────
let aiReactionCooldown = 0;

function updateAI(dt) {
  aiReactionCooldown -= dt;
  if (aiReactionCooldown > 0) return;

  let target;
  if (ai.predicts && ball.vy < 0) {
    target = predictBallX();
  } else {
    target = ball.x;
  }

  // Add error
  if (aiReactionCooldown <= -ai.reactionDelay) {
    aiCurrentError = (Math.random() * 2 - 1) * ai.errorRange * W;
    aiReactionCooldown = ai.reactionDelay;
  }

  target += aiCurrentError;
  target = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, target));

  const maxStep = ai.speed * W * dt;
  const diff = target - paddleTop.x;

  if (Math.abs(diff) <= maxStep) {
    paddleTop.x = target;
  } else {
    paddleTop.x += Math.sign(diff) * maxStep;
  }
}

function predictBallX() {
  // Simple linear prediction to top paddle Y
  if (ball.vy === 0) return ball.x;
  const timeToTop = (PADDLE_Y_TOP - ball.y) / ball.vy;
  if (timeToTop < 0) return ball.x;

  let px = ball.x + ball.vx * timeToTop;

  // Bounce off walls
  const bounces = Math.floor(Math.abs(px) / W);
  px = px % W;
  if (px < 0) px += W;
  if (bounces % 2 === 1) px = W - px;

  return Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, px));
}

// ─── GAME OVER ────────────────────────────────────────────────────────────────
function endGame(winnerSide) {
  phase = PHASE.FINISHED;
  winner = winnerSide;
  clearInterval(countdownTimer);

  const playerWon = winnerSide === 'bottom';
  const titleEl = document.getElementById('gameover-title');
  titleEl.textContent = playerWon ? '¡GANASTE!' : '¡PERDISTE!';
  titleEl.className   = 'gameover-title ' + (playerWon ? 'win' : 'loss');

  document.getElementById('gameover-score').textContent =
    `${scores.bottom} - ${scores.top}`;

  showOverlay('overlay-gameover');

  // Save to history if logged in
  if (!IS_GUEST && PLAYER_UID) {
    const player = getCurrentPlayer();
    if (player) {
      saveMatch(
        player,
        OPPONENT_NAME,
        scores.bottom,
        scores.top,
        GAME_MODE,
        playerWon ? 'win' : 'loss'
      );
    }
  }

  if (GAME_MODE === 'multi' && roomRef) {
    roomRef.update({ status: 'finished' });
  }
}

document.getElementById('btn-play-again').addEventListener('click', () => {
  window.location.reload();
});

document.getElementById('btn-back-menu').addEventListener('click', () => {
  cleanupMultiplayer();
  window.location.href = 'menu.html';
});

// ─── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, W, H);

  // Center line
  ctx.setLineDash([16, 12]);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H / 2);
  ctx.lineTo(W, H / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Paddles
  drawPaddle(paddleBottom.x, PADDLE_Y_BOTTOM, '#00e5ff');
  drawPaddle(paddleTop.x,    PADDLE_Y_TOP,    '#ff4081');

  // Ball
  if (phase !== PHASE.SCORED && phase !== PHASE.FINISHED) {
    drawBall();
  }

  // Ball in SCORED/COUNTDOWN phases (stationary)
  if (phase === PHASE.COUNTDOWN || phase === PHASE.SCORED) {
    drawBall();
  }
}

function drawPaddle(x, y, color) {
  const r = PADDLE_H / 2;
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur  = 18;
  ctx.fillStyle   = color;
  roundRect(ctx, x - PADDLE_W / 2, y - r, PADDLE_W, PADDLE_H, r);
  ctx.fill();
  ctx.restore();
}

function drawBall() {
  ctx.save();
  ctx.shadowColor = 'white';
  ctx.shadowBlur  = 20;
  ctx.fillStyle   = 'white';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
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

// ─── GAME LOOP ────────────────────────────────────────────────────────────────
function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  if (GAME_MODE === 'ai') {
    updatePhysics(dt);
  } else {
    updateMultiplayer(dt, timestamp);
  }

  render();
  updateHUD();

  rafId = requestAnimationFrame(loop);
}

// ─── MULTIPLAYER ──────────────────────────────────────────────────────────────
function setupMultiplayer() {
  showOverlay('overlay-connecting');
  document.getElementById('connecting-msg').textContent = 'Conectando a la sala...';

  roomRef = rtdb.ref(`rooms/${ROOM_CODE}`);

  if (ROLE === 'host') {
    setupHostListeners();
  } else {
    setupGuestListeners();
  }

  document.getElementById('btn-abort-connect').addEventListener('click', () => {
    cleanupMultiplayer();
    window.location.href = 'menu.html';
  });
}

function setupHostListeners() {
  // Host: listen for guest paddle position
  roomRef.child('paddles/guest').on('value', snap => {
    const val = snap.val();
    if (val !== null) paddleTop.x = val * W;
  });

  // Host: listen for pause/resume from guest
  roomRef.child('gameEvents').on('value', snap => {
    const evt = snap.val();
    if (!evt) return;
    if (evt.type === 'pause' && evt.by === 'guest' && phase === PHASE.PLAYING) {
      pauses.top--;
      pausedBy = 'top';
      phase = PHASE.PAUSED;
      showOverlay('overlay-pause');
      document.getElementById('pauses-left').textContent = pauses.bottom;
    }
    if (evt.type === 'resume' && phase === PHASE.PAUSED && pausedBy === 'top') {
      hideAllOverlays();
      phase = PHASE.PLAYING;
    }
  });

  // Host: detect guest disconnect
  roomRef.child('guestConnected').on('value', snap => {
    if (opponentConnected && snap.val() === false) {
      onOpponentLeft();
    }
    if (snap.val() === true) opponentConnected = true;
  });

  // Mark host connected
  roomRef.child('hostConnected').set(true);
  roomRef.child('hostConnected').onDisconnect().set(false);

  // Wait for guest to connect before starting
  roomRef.child('guestConnected').once('value', snap => {
    if (snap.val()) {
      hideAllOverlays();
      startGame();
    }
  });

  roomRef.child('guestConnected').on('value', snap => {
    if (snap.val() === true && !opponentConnected) {
      opponentConnected = true;
      hideAllOverlays();
      startGame();
    }
  });
}

function setupGuestListeners() {
  // Guest: mark connected, read full game state from host
  roomRef.child('guestConnected').set(true);
  roomRef.child('guestConnected').onDisconnect().set(false);

  // Guest: detect host disconnect
  roomRef.child('hostConnected').on('value', snap => {
    if (opponentConnected && snap.val() === false) {
      onOpponentLeft();
    }
    if (snap.val() === true) opponentConnected = true;
  });

  // Guest: receive game state from host
  roomRef.child('gameState').on('value', snap => {
    const state = snap.val();
    if (!state) return;

    // Flip coordinates for guest perspective (guest sees self at bottom)
    ball.x  = W - state.ball.x * W;
    ball.y  = H - state.ball.y * H;

    paddleBottom.x = W - state.paddles.guest * W;
    paddleTop.x    = W - state.paddles.host  * W;

    scores.bottom = state.scores.guest;
    scores.top    = state.scores.host;

    pauses.bottom = state.pauses.guest;
    pauses.top    = state.pauses.host;

    // Sync game phase overlays
    if (state.phase === PHASE.COUNTDOWN && phase !== PHASE.COUNTDOWN) {
      phase = PHASE.COUNTDOWN;
      countdownVal = state.countdown;
      showOverlay('overlay-countdown');
      document.getElementById('countdown-num').textContent = countdownVal;
      document.getElementById('countdown-label').textContent = state.countdownLabel || '¡Preparate!';
    }
    if (state.phase === PHASE.PLAYING && phase !== PHASE.PLAYING) {
      phase = PHASE.PLAYING;
      hideAllOverlays();
    }
    if (state.phase === PHASE.PAUSED && phase !== PHASE.PAUSED) {
      phase = PHASE.PAUSED;
      showOverlay('overlay-pause');
      document.getElementById('pauses-left').textContent = pauses.bottom;
    }
    if (state.phase === PHASE.FINISHED && phase !== PHASE.FINISHED) {
      phase = PHASE.FINISHED;
      endGame(state.winner === 'host' ? 'top' : 'bottom');
    }

    if (!opponentConnected) {
      opponentConnected = true;
      hideAllOverlays();
    }
  });
}

function updateMultiplayer(dt, timestamp) {
  if (ROLE === 'host') {
    updatePhysics(dt);

    // Sync to Firebase at limited rate
    if (timestamp - lastSyncTime >= SYNC_INTERVAL) {
      lastSyncTime = timestamp;
      syncGameStateToFirebase();
    }

    // Send local paddle position
    rtdb.ref(`rooms/${ROOM_CODE}/paddles/host`).set(paddleBottom.x / W);

  } else {
    // Guest: send paddle to Firebase
    if (touchX !== null) {
      const targetX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, touchX));
      paddleBottom.x += (targetX - paddleBottom.x) * 0.35;
    }
    if (timestamp - lastSyncTime >= SYNC_INTERVAL) {
      lastSyncTime = timestamp;
      // Guest sends THEIR paddle (which is "guest" in Firebase, inverted for host)
      rtdb.ref(`rooms/${ROOM_CODE}/paddles/guest`).set(1 - paddleBottom.x / W);
    }
  }
}

function syncGameStateToFirebase() {
  if (!roomRef) return;
  roomRef.child('gameState').set({
    phase: phase,
    countdown: countdownVal,
    countdownLabel: document.getElementById('countdown-label').textContent,
    ball: {
      x: ball.x / W,
      y: ball.y / H
    },
    paddles: {
      host:  paddleBottom.x / W,
      guest: paddleTop.x    / W
    },
    scores: {
      host:  scores.bottom,
      guest: scores.top
    },
    pauses: {
      host:  pauses.bottom,
      guest: pauses.top
    },
    winner: winner === 'bottom' ? 'host' : winner === 'top' ? 'guest' : null
  });
}

function syncPauseToFirebase() {
  roomRef.child('gameEvents').set({ type: 'pause', by: ROLE, ts: Date.now() });
  syncGameStateToFirebase();
}

function syncResumeToFirebase() {
  roomRef.child('gameEvents').set({ type: 'resume', by: ROLE, ts: Date.now() });
  syncGameStateToFirebase();
}

function onOpponentLeft() {
  if (phase === PHASE.FINISHED) return;
  phase = PHASE.FINISHED;
  clearInterval(countdownTimer);

  // Give forfeit scores
  const myScore  = MAX_POINTS;
  const oppScore = scores.bottom > scores.top ? scores.top : scores.bottom;
  document.getElementById('forfeit-score').textContent = `${myScore} - ${oppScore}`;

  hideAllOverlays();
  showOverlay('overlay-opponent-left');

  if (!IS_GUEST && PLAYER_UID) {
    const player = getCurrentPlayer();
    if (player) saveMatch(player, OPPONENT_NAME, myScore, oppScore, 'multi', 'win');
  }
}

document.getElementById('btn-back-menu-forfeit').addEventListener('click', () => {
  cleanupMultiplayer();
  window.location.href = 'menu.html';
});

function cleanupMultiplayer() {
  if (roomRef) {
    if (ROLE === 'host') {
      roomRef.remove();
    } else {
      roomRef.child('guestConnected').set(false);
    }
    roomRef.off();
    roomRef = null;
  }
  if (rafId) cancelAnimationFrame(rafId);
}

// ─── GUEST PAUSE ──────────────────────────────────────────────────────────────
// In multiplayer as guest, wire up pause button differently
if (GAME_MODE === 'multi' && ROLE === 'guest') {
  document.getElementById('btn-pause').addEventListener('click', () => {
    if (phase !== PHASE.PLAYING) return;
    if (pauses.bottom <= 0) return;
    if (!isBallInDomain('bottom')) return;

    pauses.bottom--;
    pausedBy = 'bottom';
    phase = PHASE.PAUSED;
    document.getElementById('pauses-left').textContent = pauses.bottom;
    showOverlay('overlay-pause');
    syncPauseToFirebase();
  }, { once: false });

  document.getElementById('btn-resume').addEventListener('click', () => {
    if (ROLE === 'guest' && pausedBy === 'bottom') {
      resumeGame();
      syncResumeToFirebase();
    }
  });
}

// ─── START ────────────────────────────────────────────────────────────────────
function startGame() {
  initPositions();
  updateHUD();
  startCountdown('¡Preparate!');
  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);
}

function getCurrentPlayer() {
  return { uid: PLAYER_UID, isGuest: IS_GUEST };
}

// Boot
if (GAME_MODE === 'ai') {
  startGame();
} else {
  setupMultiplayer();
}
