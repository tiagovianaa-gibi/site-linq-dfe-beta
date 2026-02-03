// js/portal-login.js





// Login do Portal da Liga (Firebase Auth) - Google only











import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";





import {





  getAuth,





  GoogleAuthProvider,





  signInWithPopup,





  onAuthStateChanged,





} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";











// Y" SUBSTITUA pelo config do SEU projeto Firebase





if (!window.RUNTIME_CONFIG || !window.RUNTIME_CONFIG.firebase) {
  console.error("Configuracao ausente: crie js/runtime-config.js a partir do example.");
  throw new Error("Configuracao ausente: crie js/runtime-config.js a partir do example.");
}

const firebaseConfig = window.RUNTIME_CONFIG.firebase;











// Inicializar Firebase





const app = initializeApp(firebaseConfig);





const auth = getAuth(app);











const googleBtn = document.getElementById("googleBtn");











if (googleBtn) {





  googleBtn.addEventListener("click", async () => {





    try {





      const provider = new GoogleAuthProvider();





      await signInWithPopup(auth, provider);





      window.location.href = "portal-dashboard.html";





    } catch (error) {





      console.error("Erro no login com Google:", error);





      alert("Não foi possível entrar com Google. Tente novamente.");





    }





  });





}











// Se já estiver logado, manda direto pro dashboard





onAuthStateChanged(auth, (user) => {





  if (user) {





    window.location.href = "portal-dashboard.html";





  }





});