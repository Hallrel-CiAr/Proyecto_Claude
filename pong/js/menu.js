// ─── STATE ───────────────────────────────────────────────────────────────────
let currentPlayer = null;
let activeRoomCode = null;
let roomWatcher = null;

// Selected config
let selectedDifficulty = 'normal';
let selectedPointsAI = 5;
let selectedPointsRoom = 5;

// ─── INIT ─────────────────────────────────────────────────────────────────────
auth.onAuthStateChanged(async user => {
  const isGuest = sessionStorage.getItem('isGuest') === 'true';

  if (!user && !isGuest) {
    window.location.href = 'index.html';
    return;
  }

  if (isGuest) {
    currentPlayer = {
      uid: 'guest_' + Date.now(),
      name: sessionStorage.getItem('guestName') || getRandomCarName(),
      isGuest: true,
      photoURL: null
    };
  } else {
    currentPlayer = {
      uid: user.uid,
      name: user.displayName || user.email.split('@')[0],
      isGuest: false,
      photoURL: user.photoURL
    };
  }

  renderPlayerHeader();
  toggleHistoryButton();
});

function renderPlayerHeader() {
  document.getElementById('player-name').textContent = currentPlayer.name;
  const avatarEl = document.getElementById('player-avatar');
  if (currentPlayer.photoURL) {
    avatarEl.innerHTML = `<img src="${currentPlayer.photoURL}" alt="avatar">`;
  } else {
    avatarEl.textContent = currentPlayer.name.charAt(0).toUpperCase();
  }
}

function toggleHistoryButton() {
  const btn = document.getElementById('btn-history');
  btn.style.display = currentPlayer.isGuest ? 'none' : 'flex';
}

// ─── VIEW SWITCHING ───────────────────────────────────────────────────────────
const views = ['view-main','view-ai-config','view-multiplayer','view-create-room',
                'view-waiting','view-join-room','view-history'];

function showView(id) {
  views.forEach(v => {
    document.getElementById(v).classList.toggle('hidden', v !== id);
  });
}

// ─── OPTION GROUPS ────────────────────────────────────────────────────────────
function setupOptionGroup(groupId, callback) {
  const group = document.getElementById(groupId);
  group.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      callback(btn.dataset.value);
    });
  });
}

setupOptionGroup('difficulty-group', v => selectedDifficulty = v);
setupOptionGroup('points-ai-group',  v => selectedPointsAI = parseInt(v));
setupOptionGroup('points-room-group',v => selectedPointsRoom = parseInt(v));

// ─── MAIN MENU BUTTONS ────────────────────────────────────────────────────────
document.getElementById('btn-vs-ai').addEventListener('click', () => showView('view-ai-config'));
document.getElementById('btn-multiplayer').addEventListener('click', () => showView('view-multiplayer'));
document.getElementById('btn-history').addEventListener('click', loadAndShowHistory);

document.getElementById('btn-logout').addEventListener('click', async () => {
  if (currentPlayer?.isGuest) {
    sessionStorage.clear();
  } else {
    await auth.signOut();
  }
  window.location.href = 'index.html';
});

// ─── AI CONFIG ────────────────────────────────────────────────────────────────
document.getElementById('btn-start-ai').addEventListener('click', () => {
  const params = new URLSearchParams({
    mode: 'ai',
    difficulty: selectedDifficulty,
    points: selectedPointsAI,
    playerName: currentPlayer.name,
    playerUid: currentPlayer.uid,
    isGuest: currentPlayer.isGuest
  });
  window.location.href = `game.html?${params}`;
});

document.getElementById('btn-back-ai').addEventListener('click', () => showView('view-main'));

// ─── MULTIPLAYER ──────────────────────────────────────────────────────────────
document.getElementById('btn-create-room').addEventListener('click', () => showView('view-create-room'));
document.getElementById('btn-join-room').addEventListener('click', () => showView('view-join-room'));
document.getElementById('btn-back-multi').addEventListener('click', () => showView('view-main'));
document.getElementById('btn-back-create').addEventListener('click', () => showView('view-multiplayer'));
document.getElementById('btn-back-join').addEventListener('click', () => showView('view-multiplayer'));

document.getElementById('btn-confirm-create').addEventListener('click', createRoom);
document.getElementById('btn-confirm-join').addEventListener('click', joinRoom);

document.getElementById('btn-cancel-room').addEventListener('click', cancelRoom);

document.getElementById('btn-copy-code').addEventListener('click', () => {
  const code = document.getElementById('room-code-text').textContent;
  navigator.clipboard?.writeText(code).then(() => {
    document.getElementById('btn-copy-code').textContent = '✅';
    setTimeout(() => { document.getElementById('btn-copy-code').textContent = '📋'; }, 1500);
  });
});

// ─── CREATE ROOM ──────────────────────────────────────────────────────────────
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function createRoom() {
  const password = document.getElementById('room-password').value.trim();
  const code = generateRoomCode();
  activeRoomCode = code;

  const roomData = {
    hostUid: currentPlayer.uid,
    hostName: currentPlayer.name,
    guestUid: null,
    guestName: null,
    password: password,
    config: { points: selectedPointsRoom },
    status: 'waiting',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  };

  try {
    await rtdb.ref(`rooms/${code}`).set(roomData);

    document.getElementById('room-code-text').textContent = code;

    const pwDisplay = document.getElementById('password-display');
    if (password) {
      document.getElementById('room-password-display').textContent = password;
      pwDisplay.classList.remove('hidden');
    } else {
      pwDisplay.classList.add('hidden');
    }

    showView('view-waiting');
    watchForGuest(code);

    // Auto-delete room after 10 minutes if no one joins
    setTimeout(() => cancelRoom(), 10 * 60 * 1000);

  } catch (e) {
    alert('Error al crear la sala: ' + e.message);
  }
}

function watchForGuest(code) {
  if (roomWatcher) roomWatcher();
  const ref = rtdb.ref(`rooms/${code}/guestUid`);
  roomWatcher = ref.on('value', snap => {
    if (snap.val()) {
      if (roomWatcher) { ref.off('value', roomWatcher); roomWatcher = null; }
      // Guest has joined, navigate to game
      const roomRef = rtdb.ref(`rooms/${code}`);
      roomRef.once('value', roomSnap => {
        const room = roomSnap.val();
        const params = new URLSearchParams({
          mode: 'multi',
          role: 'host',
          roomCode: code,
          points: room.config.points,
          playerName: currentPlayer.name,
          playerUid: currentPlayer.uid,
          opponentName: room.guestName,
          isGuest: currentPlayer.isGuest
        });
        window.location.href = `game.html?${params}`;
      });
    }
  });
}

async function cancelRoom() {
  if (roomWatcher) { roomWatcher = null; }
  if (activeRoomCode) {
    await rtdb.ref(`rooms/${activeRoomCode}`).remove();
    activeRoomCode = null;
  }
  showView('view-multiplayer');
}

// ─── JOIN ROOM ────────────────────────────────────────────────────────────────
async function joinRoom() {
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  const password = document.getElementById('join-password').value.trim();
  const errorEl = document.getElementById('join-error');

  errorEl.classList.add('hidden');

  if (code.length !== 6) {
    showError(errorEl, 'El código debe tener 6 caracteres.');
    return;
  }

  try {
    const snap = await rtdb.ref(`rooms/${code}`).get();
    if (!snap.exists()) {
      showError(errorEl, 'Sala no encontrada. Verificá el código.');
      return;
    }

    const room = snap.val();

    if (room.status !== 'waiting') {
      showError(errorEl, 'La sala ya está en juego o terminó.');
      return;
    }

    if (room.password && room.password !== password) {
      showError(errorEl, 'Contraseña incorrecta.');
      return;
    }

    if (room.hostUid === currentPlayer.uid) {
      showError(errorEl, 'No podés unirte a tu propia sala.');
      return;
    }

    // Join the room
    await rtdb.ref(`rooms/${code}`).update({
      guestUid: currentPlayer.uid,
      guestName: currentPlayer.name,
      status: 'playing'
    });

    const params = new URLSearchParams({
      mode: 'multi',
      role: 'guest',
      roomCode: code,
      points: room.config.points,
      playerName: currentPlayer.name,
      playerUid: currentPlayer.uid,
      opponentName: room.hostName,
      isGuest: currentPlayer.isGuest
    });
    window.location.href = `game.html?${params}`;

  } catch (e) {
    showError(errorEl, 'Error al conectar: ' + e.message);
  }
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

// Auto-uppercase join code
document.getElementById('join-code').addEventListener('input', function() {
  this.value = this.value.toUpperCase();
});

// ─── HISTORY ──────────────────────────────────────────────────────────────────
async function loadAndShowHistory() {
  showView('view-history');
  const list = document.getElementById('history-list');
  list.innerHTML = '<p class="loading-text">Cargando...</p>';

  const matches = await loadHistory(currentPlayer.uid);

  if (matches.length === 0) {
    list.innerHTML = '<p class="loading-text">No hay partidas registradas aún.</p>';
    return;
  }

  list.innerHTML = '';
  matches.forEach(m => {
    const date = m.date?.toDate ? m.date.toDate().toLocaleDateString('es-AR') : '---';
    const resultClass = m.result === 'win' ? 'win' : 'loss';
    const resultText = m.result === 'win' ? '✅ Victoria' : '❌ Derrota';
    const modeText = m.mode === 'ai' ? '🤖' : '🌐';

    const item = document.createElement('div');
    item.className = `history-item ${resultClass}`;
    item.innerHTML = `
      <div>
        <div class="opponent">${modeText} ${m.opponent}</div>
        <div class="vs">${resultText} · ${date}</div>
      </div>
      <div class="score">${m.scoreMe} - ${m.scoreOp}</div>
    `;
    list.appendChild(item);
  });
}

document.getElementById('btn-back-history').addEventListener('click', () => showView('view-main'));
