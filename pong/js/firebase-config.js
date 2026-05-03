const firebaseConfig = {
  apiKey: "AIzaSyBai_uw6wWvYFVYO5yvn5CKRCl87elR89U",
  authDomain: "ping-pong01.firebaseapp.com",
  databaseURL: "https://ping-pong01-default-rtdb.firebaseio.com",
  projectId: "ping-pong01",
  storageBucket: "ping-pong01.firebasestorage.app",
  messagingSenderId: "546135149944",
  appId: "1:546135149944:web:ff45ac6ff08bf263b90c8d",
  measurementId: "G-R1RXJWE4RD"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();
