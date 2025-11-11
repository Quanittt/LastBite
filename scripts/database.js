import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyATMPbmyL6Bksy_MWbVgimEV-bIKmY60Mw",
  authDomain: "lastbite-690a9.firebaseapp.com",
  projectId: "lastbite-690a9",
  storageBucket: "lastbite-690a9.firebasestorage.app",
  messagingSenderId: "656028381485",
  appId: "1:656028381485:web:3372539a173db2ad8863a4",
  measurementId: "G-QZ3K32PRC5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app);

export { 
    app, 
    auth, 
    db, 
    // Функції Auth
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    // Функції Firestore
    doc, 
    setDoc, 
    getDoc 
};