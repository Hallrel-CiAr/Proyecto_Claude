// Returns the current player info from session or Firebase auth
function getCurrentPlayer() {
  const isGuest = sessionStorage.getItem('isGuest') === 'true';
  if (isGuest) {
    return {
      uid: 'guest_' + Math.random().toString(36).substr(2, 9),
      name: sessionStorage.getItem('guestName') || getRandomCarName(),
      isGuest: true,
      photoURL: null
    };
  }
  const user = auth.currentUser;
  if (!user) return null;
  return {
    uid: user.uid,
    name: user.displayName || user.email,
    isGuest: false,
    photoURL: user.photoURL
  };
}

// Saves a match result to Firestore (only for logged-in users)
async function saveMatch(player, opponentName, scoreMe, scoreOp, mode, result) {
  if (player.isGuest) return;
  try {
    await db.collection('users').doc(player.uid).collection('matches').add({
      date: firebase.firestore.FieldValue.serverTimestamp(),
      opponent: opponentName,
      scoreMe,
      scoreOp,
      mode,
      result
    });
  } catch (e) {
    console.error('Error guardando partida:', e);
  }
}

// Loads match history for a user
async function loadHistory(uid) {
  try {
    const snap = await db.collection('users').doc(uid)
      .collection('matches')
      .orderBy('date', 'desc')
      .limit(50)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Error cargando historial:', e);
    return [];
  }
}
