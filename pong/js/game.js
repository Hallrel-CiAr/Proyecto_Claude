// ─── PARAMS ───────────────────────────────────────────────────────────────────
const params       = new URLSearchParams(window.location.search);
const GAME_MODE    = params.get('mode')         || 'ai';
const ROLE         = params.get('role')         || 'host';
const ROOM_CODE    = params.get('roomCode')     || '';
const MAX_POINTS   = parseInt(params.get('points')) || 5;
const DIFFICULTY   = params.get('difficulty')   || 'normal';
const PLAYER_NAME  = params.get('playerName')   || 'Jugador';
const PLAYER_UID   = params.get('playerUid')    || '';
const OPPONENT_NAME= params.get('opponentName') || (GAME_MODE === 'ai' ? 'CPU' : 'Rival');
const IS_GUEST     = params.get('isGuest') === 'true';

// ─── CANVAS ───────────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

const HUD_H = 52; // height of HUD bar in px

let W, H;
let FIELD_TOP, FIELD_BOTTOM;
let PADDLE_H, PADDLE_W, BALL_R;
let PADDLE_X_RIGHT, PADDLE_X_LEFT;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;

  FIELD_TOP    = HUD_H + 1;
  FIELD_BOTTOM = H - 6;

  const fieldH = FIELD_BOTTOM - FIELD_TOP;

  PADDLE_H      = fieldH * 0.20;          // paddle length (vertical)
  PADDLE_W      = Math.max(8, W * 0.014); // paddle thickness
  BALL_R        = Math.min(W, fieldH) * 0.016;
  PADDLE_X_LEFT  = W * 0.048;
  PADDLE_X_RIGHT = W - W * 0.048;
}

resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); placeServe(); });

// ─── GAME STATE ───────────────────────────────────────────────────────────────
const PHASE = {
  COUNTDOWN: 'countdown',
  PLAYING:   'playing',
  PAUSED:    'paused',
  SCORED:    'scored',
  FINISHED:  'finished'
};

let phase        = PHASE.SCORED;
let scores       = { right: 0, left: 0 };  // right = local player, left = opponent
let pauses       = { right: 2, left: 2 };
let serving      = 'right';                 // who serves next
let countdownVal = 3;
let countdownTimer = null;
let pauseTimer   = null;
let pauseSeconds = 15;
let winner       = null;

// Ball
let ball = { x: 0, y: 0, vx: 0, vy: 0 };

// Paddles (Y = center of paddle)
let paddleRight = { y: 0 };
let paddleLeft  = { y: 0 };

// Touch / mouse
let touchY = null;

// AI
const AI_CFG = {
  easy:   { speed: 0.18, errorRange: 0.13, predicts: false },
  normal: { speed: 0.36, errorRange: 0.05, predicts: false },
  hard:   { speed: 0.60, errorRange: 0.01, predicts: true  }
};
const ai         = AI_CFG[DIFFICULTY] || AI_CFG.normal;
let aiError      = 0;
let aiErrorTimer = 0;

// Multiplayer
let roomRef          = null;
let opponentConnected = false;
let lastSyncTime     = 0;
const SYNC_MS        = 33;

// Loop
let rafId    = null;
let lastTime = 0;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fieldCenterY() { return FIELD_TOP + (FIELD_BOTTOM - FIELD_TOP) / 2; }

function clampPaddleY(y) {
  return Math.max(FIELD_TOP + PADDLE_H / 2, Math.min(FIELD_BOTTOM - PADDLE_H / 2, y));
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function initPositions() {
  paddleRight.y = fieldCenterY();
  paddleLeft.y  = fieldCenterY();
  placeServe();
}

function placeServe() {
  // Ball sits at serving paddle while waiting
  const cx = (serving === 'right') ? PADDLE_X_RIGHT - PADDLE_W - BALL_R - 4
                                    : PADDLE_X_LEFT  + PADDLE_W + BALL_R + 4;
  ball.x  = cx;
  ball.y  = (serving === 'right') ? paddleRight.y : paddleLeft.y;
  ball.vx = 0;
  ball.vy = 0;
}

function launchBall() {
  const baseSpeed = W * 0.52;
  const angle = (Math.random() * 30 - 15) * (Math.PI / 180); // ±15°
  const dirX  = (serving === 'right') ? -1 : 1;
  ball.vx = dirX  * Math.cos(angle) * baseSpeed;
  ball.vy = Math.sin(angle) * baseSpeed;
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function updateHUD() {
  document.getElementById('hud-player-name').textContent   = PLAYER_NAME;
  document.getElementById('hud-opponent-name').textContent = OPPONENT_NAME;
  document.getElementById('hud-score-player').textContent   = scores.right;
  document.getElementById('hud-score-opponent').textContent = scores.left;

  renderPauseDots('hud-player-pauses',   pauses.right);
  renderPauseDots('hud-opponent-pauses', pauses.left);

  const pauseBtn = document.getElementById('btn-pause');
  pauseBtn.disabled = !(phase === PHASE.PLAYING && pauses.right > 0 && ballInRightDomain());
}

function renderPauseDots(elId, remaining) {
  const el = document.getElementById(elId);
  el.innerHTML = '';
  for (let i = 0; i < 2; i++) {
    const d = document.createElement('div');
    d.className = 'hud-pause-dot' + (i >= remaining ? ' used' : '');
    el.appendChild(d);
  }
}

function ballInRightDomain() { return ball.x > W / 2; }
function ballInLeftDomain()  { return ball.x < W / 2; }

// ─── OVERLAYS ─────────────────────────────────────────────────────────────────
const ALL_OVERLAYS = ['overlay-countdown','overlay-pause','overlay-gameover',
                      'overlay-connecting','overlay-opponent-left','overlay-exit'];

function showOverlay(id) {
  ALL_OVERLAYS.forEach(o => {
    document.getElementById(o).classList.toggle('hidden', o !== id);
  });
}

function hideAllOverlays() {
  ALL_OVERLAYS.forEach(o => document.getElementById(o).classList.add('hidden'));
}

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────
function startCountdown(label) {
  countdownVal = 3;
  phase = PHASE.COUNTDOWN;
  placeServe();
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
      launchBall();
    } else {
      updateCountdownDisplay();
    }
  }, 1000);
}

function updateCountdownDisplay() {
  const el = document.getElementById('countdown-num');
  el.textContent = countdownVal;
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
canvas.addEventListener('touchstart', e => { e.preventDefault(); touchY = e.touches[0].clientY; }, { passive: false });
canvas.addEventListener('touchmove',  e => { e.preventDefault(); touchY = e.touches[0].clientY; }, { passive: false });
canvas.addEventListener('touchend',   () => { touchY = null; });
canvas.addEventListener('mousemove',  e => { touchY = e.clientY; });

// ─── PAUSE ────────────────────────────────────────────────────────────────────
document.getElementById('btn-pause').addEventListener('click', () => {
  if (phase !== PHASE.PLAYING || pauses.right <= 0 || !ballInRightDomain()) return;
  triggerPause('right');
  if (GAME_MODE === 'multi') roomRef?.child('gameEvents').set({ type:'pause', by:ROLE, ts:Date.now() });
});

function triggerPause(by) {
  if (by === 'right') pauses.right--;
  else                pauses.left--;
  phase = PHASE.PAUSED;
  pauseSeconds = 15;
  document.getElementById('pauses-left').textContent = pauses.right;
  document.getElementById('pause-timer').textContent = 15;
  showOverlay('overlay-pause');
  startPauseCountdown();
}

function startPauseCountdown() {
  clearInterval(pauseTimer);
  pauseTimer = setInterval(() => {
    pauseSeconds--;
    document.getElementById('pause-timer').textContent = pauseSeconds;
    if (pauseSeconds <= 0) resumeGame();
  }, 1000);
}

document.getElementById('btn-resume').addEventListener('click', resumeGame);

function resumeGame() {
  clearInterval(pauseTimer);
  hideAllOverlays();
  phase = PHASE.PLAYING;
  if (GAME_MODE === 'multi') roomRef?.child('gameEvents').set({ type:'resume', by:ROLE, ts:Date.now() });
}

// ─── EXIT / ABANDON ───────────────────────────────────────────────────────────
document.getElementById('btn-exit').addEventListener('click', () => {
  if (phase === PHASE.FINISHED) return;
  const msg = GAME_MODE === 'multi'
    ? `Tu rival ganará ${MAX_POINTS} - 0. ¿Confirmás?`
    : '¿Seguro que querés salir de la partida?';
  document.getElementById('exit-msg').textContent = msg;
  showOverlay('overlay-exit');
});

document.getElementById('btn-exit-cancel').addEventListener('click', hideAllOverlays);

document.getElementById('btn-exit-confirm').addEventListener('click', () => {
  if (GAME_MODE === 'multi') {
    // Opponent wins by forfeit
    onPlayerAbandoned();
  } else {
    cleanupAndGoMenu();
  }
});

function onPlayerAbandoned() {
  phase = PHASE.FINISHED;
  clearInterval(countdownTimer);
  clearInterval(pauseTimer);
  if (GAME_MODE === 'multi' && roomRef) {
    roomRef.update({ status: 'finished', forfeit: 'guest_left' });
  }
  saveMatchResult(MAX_POINTS, 0, 'loss');
  cleanupAndGoMenu();
}

function cleanupAndGoMenu() {
  cleanupMultiplayer();
  window.location.href = 'menu.html';
}

// ─── PHYSICS ─────────────────────────────────────────────────────────────────
function updatePhysics(dt) {
  if (phase !== PHASE.PLAYING) return;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Top/bottom wall bounce
  if (ball.y - BALL_R < FIELD_TOP) {
    ball.y = FIELD_TOP + BALL_R;
    ball.vy = Math.abs(ball.vy);
  }
  if (ball.y + BALL_R > FIELD_BOTTOM) {
    ball.y = FIELD_BOTTOM - BALL_R;
    ball.vy = -Math.abs(ball.vy);
  }

  // Paddle collisions
  checkPaddleHit();

  // Scoring: ball exits left or right
  if (ball.x - BALL_R < PADDLE_X_LEFT - PADDLE_W * 2) {
    scorePoint('right'); // right player scores (left missed)
  } else if (ball.x + BALL_R > PADDLE_X_RIGHT + PADDLE_W * 2) {
    scorePoint('left');  // left player scores (right missed)
  }

  // Move player paddle toward touch
  if (touchY !== null) {
    const target = clampPaddleY(touchY);
    paddleRight.y += (target - paddleRight.y) * 0.3;
  }

  // During countdown/scored: ball follows serving paddle
  if (phase === PHASE.COUNTDOWN || phase === PHASE.SCORED) {
    placeServe();
  }

  if (GAME_MODE === 'ai') updateAI(dt);
}

function checkPaddleHit() {
  // Right paddle (player)
  if (ball.vx > 0 &&
      ball.x + BALL_R >= PADDLE_X_RIGHT - PADDLE_W / 2 &&
      ball.x + BALL_R <= PADDLE_X_RIGHT + PADDLE_W &&
      ball.y >= paddleRight.y - PADDLE_H / 2 - BALL_R &&
      ball.y <= paddleRight.y + PADDLE_H / 2 + BALL_R) {
    ball.x  = PADDLE_X_RIGHT - PADDLE_W / 2 - BALL_R;
    ball.vx = -Math.abs(ball.vx);
    applySpinY(paddleRight.y);
    boostSpeed();
  }

  // Left paddle (opponent)
  if (ball.vx < 0 &&
      ball.x - BALL_R <= PADDLE_X_LEFT + PADDLE_W / 2 &&
      ball.x - BALL_R >= PADDLE_X_LEFT - PADDLE_W &&
      ball.y >= paddleLeft.y - PADDLE_H / 2 - BALL_R &&
      ball.y <= paddleLeft.y + PADDLE_H / 2 + BALL_R) {
    ball.x  = PADDLE_X_LEFT + PADDLE_W / 2 + BALL_R;
    ball.vx = Math.abs(ball.vx);
    applySpinY(paddleLeft.y);
    boostSpeed();
  }
}

function applySpinY(paddleY) {
  const offset = (ball.y - paddleY) / (PADDLE_H / 2);
  const fieldH = FIELD_BOTTOM - FIELD_TOP;
  ball.vy = offset * fieldH * 0.55;
}

function boostSpeed() {
  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  const max   = W * 1.1;
  if (speed < max) {
    const ratio = Math.min(speed * 1.04, max) / speed;
    ball.vx *= ratio;
    ball.vy *= ratio;
  }
}

// ─── SCORE ────────────────────────────────────────────────────────────────────
function scorePoint(scorer) {
  scores[scorer]++;
  serving = scorer === 'right' ? 'left' : 'right'; // loser serves
  updateHUD();
  phase = PHASE.SCORED;
  placeServe();

  if (scores[scorer] >= MAX_POINTS) {
    endGame(scorer);
    return;
  }

  setTimeout(() => {
    if (phase === PHASE.FINISHED) return;
    const label = serving === 'right' ? '¡Tu saque!' : 'Saque del rival';
    startCountdown(label);
  }, 500);
}

// ─── AI ───────────────────────────────────────────────────────────────────────
function updateAI(dt) {
  aiErrorTimer -= dt;
  if (aiErrorTimer <= 0) {
    aiError      = (Math.random() * 2 - 1) * ai.errorRange * (FIELD_BOTTOM - FIELD_TOP);
    aiErrorTimer = 0.4 + Math.random() * 0.3;
  }

  let targetY;
  if (ai.predicts && ball.vx < 0) {
    targetY = predictBallY();
  } else {
    targetY = ball.y;
  }
  targetY = clampPaddleY(targetY + aiError);

  const maxStep = ai.speed * (FIELD_BOTTOM - FIELD_TOP) * dt;
  const diff    = targetY - paddleLeft.y;
  paddleLeft.y += Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
}

function predictBallY() {
  if (ball.vx === 0) return ball.y;
  const timeToLeft = (ball.x - PADDLE_X_LEFT) / (-ball.vx);
  if (timeToLeft < 0) return ball.y;

  let py = ball.y + ball.vy * timeToLeft;
  const fieldH = FIELD_BOTTOM - FIELD_TOP;

  // Simulate wall bounces
  py -= FIELD_TOP;
  py = py % (fieldH * 2);
  if (py < 0) py += fieldH * 2;
  if (py > fieldH) py = fieldH * 2 - py;
  py += FIELD_TOP;

  return clampPaddleY(py);
}

// Also move AI during serve (picks a position)
function updateAIServe(dt) {
  if (serving !== 'left') return;
  const target = clampPaddleY(fieldCenterY() + (Math.random() * 2 - 1) * (FIELD_BOTTOM - FIELD_TOP) * 0.25);
  const maxStep = ai.speed * (FIELD_BOTTOM - FIELD_TOP) * dt;
  const diff    = target - paddleLeft.y;
  paddleLeft.y += Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
  placeServe();
}

// ─── GAME OVER ────────────────────────────────────────────────────────────────
function endGame(winnerSide) {
  phase = PHASE.FINISHED;
  winner = winnerSide;
  clearInterval(countdownTimer);
  clearInterval(pauseTimer);

  const playerWon = winnerSide === 'right';
  const titleEl   = document.getElementById('gameover-title');
  titleEl.textContent = playerWon ? '¡GANASTE!' : '¡PERDISTE!';
  titleEl.className   = 'gameover-title ' + (playerWon ? 'win' : 'loss');
  document.getElementById('gameover-score').textContent = `${scores.right} - ${scores.left}`;

  showOverlay('overlay-gameover');
  saveMatchResult(scores.right, scores.left, playerWon ? 'win' : 'loss');

  if (GAME_MODE === 'multi' && roomRef) roomRef.update({ status: 'finished' });
}

function saveMatchResult(scoreMe, scoreOp, result) {
  if (IS_GUEST || !PLAYER_UID) return;
  db.collection('users').doc(PLAYER_UID).collection('matches').add({
    date: firebase.firestore.FieldValue.serverTimestamp(),
    opponent: OPPONENT_NAME,
    scoreMe,
    scoreOp,
    mode: GAME_MODE,
    result
  }).catch(e => console.error('Error guardando partida:', e));
}

document.getElementById('btn-play-again').addEventListener('click', () => window.location.reload());
document.getElementById('btn-back-menu').addEventListener('click', () => { cleanupMultiplayer(); window.location.href = 'menu.html'; });

// ─── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, W, H);

  // Field boundaries (top/bottom lines)
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.moveTo(0, FIELD_TOP);    ctx.lineTo(W, FIELD_TOP);    ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, FIELD_BOTTOM); ctx.lineTo(W, FIELD_BOTTOM); ctx.stroke();

  // Center dashed line
  ctx.setLineDash([14, 10]);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2, FIELD_TOP);
  ctx.lineTo(W / 2, FIELD_BOTTOM);
  ctx.stroke();
  ctx.setLineDash([]);

  // Paddles
  drawPaddle(PADDLE_X_RIGHT, paddleRight.y, '#00e5ff');
  drawPaddle(PADDLE_X_LEFT,  paddleLeft.y,  '#ff4081');

  // Ball (hide only while briefly after scoring — not during countdown)
  if (phase !== PHASE.FINISHED) drawBall();
}

function drawPaddle(x, y, color) {
  const r = PADDLE_W / 2;
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur  = 16;
  ctx.fillStyle   = color;
  roundRect(ctx, x - r, y - PADDLE_H / 2, PADDLE_W, PADDLE_H, r);
  ctx.fill();
  ctx.restore();
}

function drawBall() {
  ctx.save();
  ctx.shadowColor = 'white';
  ctx.shadowBlur  = 18;
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

  // Player paddle follows touch/mouse always (even during countdown for serving)
  if (touchY !== null) {
    const target = clampPaddleY(touchY);
    paddleRight.y += (target - paddleRight.y) * 0.3;
    if (phase === PHASE.COUNTDOWN || phase === PHASE.SCORED) placeServe();
  }

  if (GAME_MODE === 'ai') {
    if (phase === PHASE.PLAYING) {
      updatePhysics(dt);
    } else if (phase === PHASE.COUNTDOWN || phase === PHASE.SCORED) {
      updateAIServe(dt);
    }
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
  roomRef = rtdb.ref(`rooms/${ROOM_CODE}`);

  if (ROLE === 'host') {
    setupHostListeners();
  } else {
    setupGuestListeners();
  }

  document.getElementById('btn-abort-connect').addEventListener('click', () => {
    cleanupMultiplayer(); window.location.href = 'menu.html';
  });
}

function setupHostListeners() {
  roomRef.child('hostConnected').set(true);
  roomRef.child('hostConnected').onDisconnect().set(false);

  // Receive guest paddle Y
  roomRef.child('paddles/guest').on('value', snap => {
    if (snap.val() !== null) paddleLeft.y = snap.val() * (FIELD_BOTTOM - FIELD_TOP) + FIELD_TOP;
  });

  // Receive pause/resume events from guest
  roomRef.child('gameEvents').on('value', snap => {
    const evt = snap.val();
    if (!evt) return;
    if (evt.type === 'pause' && evt.by === 'guest' && phase === PHASE.PLAYING && ballInLeftDomain()) {
      triggerPause('left');
    }
    if (evt.type === 'resume' && phase === PHASE.PAUSED) {
      resumeGame();
    }
  });

  // Detect guest connect/disconnect
  roomRef.child('guestConnected').on('value', snap => {
    if (snap.val() === true && !opponentConnected) {
      opponentConnected = true;
      hideAllOverlays();
      startGame();
    }
    if (opponentConnected && snap.val() === false) onOpponentLeft();
  });
}

function setupGuestListeners() {
  roomRef.child('guestConnected').set(true);
  roomRef.child('guestConnected').onDisconnect().set(false);

  roomRef.child('hostConnected').on('value', snap => {
    if (snap.val() === true && !opponentConnected) {
      opponentConnected = true;
      hideAllOverlays();
    }
    if (opponentConnected && snap.val() === false) onOpponentLeft();
  });

  // Receive full game state from host
  roomRef.child('gameState').on('value', snap => {
    const s = snap.val();
    if (!s) return;

    // Guest sees self on RIGHT, host on LEFT → flip X axis
    ball.x = W - s.ball.x * W;
    ball.y = FIELD_TOP + s.ball.y * (FIELD_BOTTOM - FIELD_TOP);

    // Guest's paddle is host's "left", host's paddle is guest's "left"
    paddleRight.y = FIELD_TOP + s.paddles.guest * (FIELD_BOTTOM - FIELD_TOP);
    paddleLeft.y  = FIELD_TOP + s.paddles.host  * (FIELD_BOTTOM - FIELD_TOP);

    scores.right = s.scores.guest;
    scores.left  = s.scores.host;
    pauses.right = s.pauses.guest;
    pauses.left  = s.pauses.host;

    if (s.phase === PHASE.COUNTDOWN && phase !== PHASE.COUNTDOWN) {
      phase = PHASE.COUNTDOWN;
      countdownVal = s.countdown;
      showOverlay('overlay-countdown');
      document.getElementById('countdown-num').textContent = countdownVal;
      document.getElementById('countdown-label').textContent = s.countdownLabel || '';
    }
    if (s.phase === PHASE.PLAYING && phase !== PHASE.PLAYING) {
      phase = PHASE.PLAYING; hideAllOverlays();
    }
    if (s.phase === PHASE.PAUSED && phase !== PHASE.PAUSED) {
      pauses.right = s.pauses.guest;
      triggerPause(s.pausedBy === 'host' ? 'left' : 'right');
    }
    if (s.phase === PHASE.FINISHED && phase !== PHASE.FINISHED) {
      endGame(s.winner === 'host' ? 'left' : 'right');
    }
  });
}

function updateMultiplayer(dt, timestamp) {
  if (ROLE === 'host') {
    if (phase === PHASE.PLAYING) updatePhysics(dt);
    else if (phase === PHASE.COUNTDOWN || phase === PHASE.SCORED) updateAIServe(dt); // host moves their paddle

    if (timestamp - lastSyncTime >= SYNC_MS) {
      lastSyncTime = timestamp;
      syncHostState();
    }
    roomRef.child('paddles/host').set((paddleRight.y - FIELD_TOP) / (FIELD_BOTTOM - FIELD_TOP));

  } else {
    // Guest: update own paddle and send
    if (touchY !== null) {
      const target = clampPaddleY(touchY);
      paddleRight.y += (target - paddleRight.y) * 0.3;
    }
    if (timestamp - lastSyncTime >= SYNC_MS) {
      lastSyncTime = timestamp;
      // Guest's paddle appears as "left" from host perspective → invert
      roomRef.child('paddles/guest').set(1 - (paddleRight.y - FIELD_TOP) / (FIELD_BOTTOM - FIELD_TOP));
    }
  }
}

function syncHostState() {
  if (!roomRef) return;
  const fieldH = FIELD_BOTTOM - FIELD_TOP;
  roomRef.child('gameState').set({
    phase,
    countdown:     countdownVal,
    countdownLabel: document.getElementById('countdown-label')?.textContent || '',
    pausedBy:      'host',
    ball: {
      x: ball.x / W,
      y: (ball.y - FIELD_TOP) / fieldH
    },
    paddles: {
      host:  (paddleRight.y - FIELD_TOP) / fieldH,
      guest: (paddleLeft.y  - FIELD_TOP) / fieldH
    },
    scores: { host: scores.right, guest: scores.left },
    pauses: { host: pauses.right, guest: pauses.left },
    winner: winner === 'right' ? 'host' : winner === 'left' ? 'guest' : null
  });
}

function onOpponentLeft() {
  if (phase === PHASE.FINISHED) return;
  phase = PHASE.FINISHED;
  clearInterval(countdownTimer); clearInterval(pauseTimer);
  document.getElementById('forfeit-score').textContent = `${MAX_POINTS} - 0`;
  hideAllOverlays();
  showOverlay('overlay-opponent-left');
  saveMatchResult(MAX_POINTS, 0, 'win');
}

document.getElementById('btn-back-menu-forfeit').addEventListener('click', () => {
  cleanupMultiplayer(); window.location.href = 'menu.html';
});

function cleanupMultiplayer() {
  if (roomRef) {
    if (ROLE === 'host') roomRef.remove();
    else roomRef.child('guestConnected').set(false);
    roomRef.off();
    roomRef = null;
  }
  if (rafId) cancelAnimationFrame(rafId);
}

// ─── START ────────────────────────────────────────────────────────────────────
function startGame() {
  initPositions();
  updateHUD();
  startCountdown('¡Preparate!');
  lastTime = performance.now();
  if (!rafId) rafId = requestAnimationFrame(loop);
}

if (GAME_MODE === 'ai') {
  startGame();
} else {
  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);
  setupMultiplayer();
}
