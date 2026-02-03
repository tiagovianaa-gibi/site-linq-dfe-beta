// Login do Portal da Liga (Firebase Auth) - Google only
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const googleBtn = document.getElementById("googleBtn");
const configMissingMessage =
  "Configuracao ausente: crie js/runtime-config.js a partir do example.";

function notifyConfigMissing() {
  console.error(configMissingMessage);
  if (googleBtn) {
    googleBtn.disabled = true;
    googleBtn.title = configMissingMessage;
  }
}

if (!window.RUNTIME_CONFIG || !window.RUNTIME_CONFIG.firebase) {
  notifyConfigMissing();
} else {
  const firebaseConfig = window.RUNTIME_CONFIG.firebase;
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        window.location.href = "portal-dashboard.html";
      } catch (error) {
        console.error("Erro no login com Google:", error);
        alert("Nao foi possivel entrar com Google. Tente novamente.");
      }
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "portal-dashboard.html";
    }
  });
}
