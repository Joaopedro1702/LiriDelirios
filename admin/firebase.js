// 1. IMPORTAÇÕES DA INTERNET (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// 2. SUAS CREDENCIAIS DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDxIRnIgyyzDOPm1WQrp-oQneLS0YIVSkE",
    authDomain: "liri-delirios.firebaseapp.com",
    projectId: "liri-delirios",
    storageBucket: "liri-delirios.firebasestorage.app",
    messagingSenderId: "804738312923",
    appId: "1:804738312923:web:294153015b5d2bd81cbafe",
    measurementId: "G-7VS366BBDG"
};

// 3. INICIALIZAÇÃO DAS FERRAMENTAS
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 4. EXPORTAÇÃO (Isso aqui é o que resolve o seu erro vermelho!)
export { db, storage };
