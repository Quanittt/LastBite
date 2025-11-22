// scripts/database.js

// =======================================================
// 1. ПРАВИЛЬНІ ІМПОРТИ (ТІЛЬКИ APP, AUTH, FIRESTORE)
// =======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";

// АУТЕНТИФІКАЦІЯ: ТЕПЕР ІМПОРТУЄМО ФУНКЦІЇ ДЛЯ РЕЄСТРАЦІЇ/ВХОДУ
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// БАЗА ДАНИХ (FIRESTORE)
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// =======================================================
// 2. КОНФІГУРАЦІЯ (Твої ключі)
// =======================================================
const firebaseConfig = {
  apiKey: "AIzaSyATMPbmyL6Bksy_MWbVgimEV-bIKmY60Mw", // Перевір цей ключ!
  authDomain: "lastbite-690a9.firebaseapp.com",
  projectId: "lastbite-690a9",
  storageBucket: "lastbite-690a9.appspot.com", 
  messagingSenderId: "656028381485",
  appId: "1:656028381485:web:3372539a173db2ad8863a4",
  measurementId: "G-QZ3K32PRC5"
};

// =======================================================
// 3. ІНІЦІАЛІЗАЦІЯ
// =======================================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// ВИДАЛЕНО: const storage = getStorage(app); 

// =======================================================
// 4. ЕКСПОРТ
// =======================================================
export { 
    app, 
    auth, 
    db, 
    
    // Функції Auth (ТЕПЕР ВОНИ ІМПОРТОВАНІ ТА ПРАВИЛЬНО ЕКСПОРТУЮТЬСЯ)
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    
    // Функції Database
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    getDocs
};