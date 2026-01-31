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





const firebaseConfig = {





  apiKey: "AIzaSyCm9ANrGwedzgdvCaSf05-qZsTPJMgrWOA",





  authDomain: "portal-da-liga.firebaseapp.com",





  projectId: "portal-da-liga",





  storageBucket: "portal-da-liga.appspot.com",





  messagingSenderId: "129376570268",





  appId: "1:129376570268:web:b13e414ee188a189869659",





  measurementId: "G-2LS730BX44"





};











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