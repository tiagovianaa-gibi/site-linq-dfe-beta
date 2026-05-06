// Login do Portal da Liga (Firebase Auth) - Google only
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const googleBtn = document.getElementById("googleBtn");
const loginStatus = document.getElementById("loginStatus");
const configMissingMessage =
  "Configuracao ausente: crie js/runtime-config.js a partir do example.";
const portalUnauthorizedMessage =
  "Seu e-mail nao esta cadastrado no Portal da Liga. Procure a sua quadrilha para solicitar o cadastro.";
const portalStatusStorageKey = "portalLoginStatus";

function setStatus(message, tone = "default") {
  if (!loginStatus) return;
  loginStatus.textContent = message || "";
  loginStatus.style.color = tone === "error" ? "#FFD7C2" : "";
}

function persistStatus(message) {
  try {
    if (!message) {
      sessionStorage.removeItem(portalStatusStorageKey);
      return;
    }
    sessionStorage.setItem(portalStatusStorageKey, message);
  } catch (error) {
    console.warn("Nao foi possivel salvar o status do login.", error);
  }
}

function consumePersistedStatus() {
  try {
    const message = sessionStorage.getItem(portalStatusStorageKey);
    if (!message) return;
    sessionStorage.removeItem(portalStatusStorageKey);
    setStatus(message, "error");
  } catch (error) {
    console.warn("Nao foi possivel recuperar o status do login.", error);
  }
}

function notifyConfigMissing() {
  console.error(configMissingMessage);
  if (googleBtn) {
    googleBtn.disabled = true;
    googleBtn.title = configMissingMessage;
  }
  setStatus(configMissingMessage, "error");
}

async function loadAuthorizedUserProfile(db, user) {
  const normalizedEmail =
    typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";
  const emailCandidates = normalizedEmail ? [normalizedEmail] : [];

  if (user?.email && normalizedEmail !== user.email) {
    emailCandidates.push(user.email);
  }

  for (const email of emailCandidates) {
    const userSnap = await getDoc(doc(db, "users", email));
    if (userSnap.exists()) {
      return userSnap.data();
    }
  }

  if (user?.uid) {
    const legacySnap = await getDoc(doc(db, "users", user.uid));
    if (legacySnap.exists()) {
      return legacySnap.data();
    }
  }

  return null;
}

if (!window.RUNTIME_CONFIG || !window.RUNTIME_CONFIG.firebase) {
  notifyConfigMissing();
} else {
  const firebaseConfig = window.RUNTIME_CONFIG.firebase;
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  consumePersistedStatus();

  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      googleBtn.disabled = true;
      setStatus("Abrindo login com Google...");
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Erro no login com Google:", error);
        const wasPopupClosed = error?.code === "auth/popup-closed-by-user";
        setStatus(
          wasPopupClosed
            ? ""
            : "Nao foi possivel entrar com Google. Tente novamente.",
          "error"
        );
        googleBtn.disabled = false;
      }
    });
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (googleBtn) googleBtn.disabled = false;
      return;
    }

    setStatus("Validando seu acesso...");

    try {
      const perfil = await loadAuthorizedUserProfile(db, user);

      if (!perfil) {
        persistStatus(portalUnauthorizedMessage);
        await signOut(auth);
        setStatus(portalUnauthorizedMessage, "error");
        if (googleBtn) googleBtn.disabled = false;
        return;
      }

      persistStatus("");
      window.location.href = "portal-dashboard.html";
    } catch (error) {
      console.error("Erro ao validar acesso ao portal:", error);
      persistStatus("");
      await signOut(auth).catch(() => {});
      setStatus(
        "Nao foi possivel validar seu acesso agora. Tente novamente.",
        "error"
      );
      if (googleBtn) googleBtn.disabled = false;
    }
  });
}
