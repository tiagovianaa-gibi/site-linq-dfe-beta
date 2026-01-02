// js/portal-login.js
// Login do Portal da Liga (Firebase Auth)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Y" SUBSTITUA pelo config do SEU projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCm9ANrGwedzgdvCaSf05-qZsTPJMgrWOA",
  authDomain: "portal-da-liga.firebaseapp.com",
  projectId: "portal-da-liga",
  storageBucket: "portal-da-liga.firebasestorage.app",
  messagingSenderId: "129376570268",
  appId: "1:129376570268:web:b13e414ee188a189869659",
  measurementId: "G-2LS730BX44"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const form = document.getElementById("portalLoginForm");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const submitButton = form.querySelector("button[type='submit']");

function setLoading(loading) {
  if (!submitButton) return;
  submitButton.disabled = loading;
  submitButton.textContent = loading ? "Entrando..." : "Entrar";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoading(true);

  const email = emailInput.value.trim();
  const senha = senhaInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.href = "portal-dashboard.html";
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Não foi possível entrar. Confira e-mail e senha ou fale com a Liga.");
  } finally {
    setLoading(false);
  }
});

// Se já estiver logado, manda direto pro dashboard
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "portal-dashboard.html";
  }
});


