// scripts/auth.js

// 1. ЄДИНИЙ ІМПОРТ (Все беремо з database.js)
import { 
    auth, 
    db, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    doc, 
    setDoc, 
    getDoc 
} from './database.js'; 

console.log("Auth.js завантажено успішно!"); // <--- ЦЕ ПЕРЕВІРКА, ЧИ ФАЙЛ ЖИВИЙ

// 2. ФУНКЦІЯ РЕЄСТРАЦІЇ
async function registerUser(email, password, role, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = {
            email: user.email,
            role: role,
            createdAt: new Date().toISOString()
        };

        if (role === 'seller') {
            userData.storeName = displayName;
        } else { 
            userData.name = displayName; 
        }

        await setDoc(doc(db, "users", user.uid), userData);
        console.log(`Успішна реєстрація: ${role}`);
        
        if (role === 'customer') {
            window.location.href = 'customer-page.html';
        } else if (role === 'seller') {
            window.location.href = 'seller-page.html';
        }

    } catch (error) {
        console.error("Помилка реєстрації:", error);
        alert("Помилка реєстрації: " + error.message);
    }
}

// 3. ФУНКЦІЯ ВХОДУ
async function loginUser(email, password, expectedRole) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const docSnap = await getDoc(doc(db, "users", user.uid));
        
        if (docSnap.exists()) {
            const actualRole = docSnap.data().role;
            console.log(`Вхід успішний. Роль: ${actualRole}`);

            if (actualRole !== expectedRole) {
                 alert(`Помилка доступу. Ви ${actualRole}, а намагаєтесь увійти як ${expectedRole}.`);
                 await auth.signOut(); 
                 return; 
            }

            if (expectedRole === 'customer') {
                 window.location.href = 'customer-page.html';
            } else if (expectedRole === 'seller') {
                 window.location.href = 'seller-page.html';
            }
        } else {
            console.error("Користувача немає в базі даних");
            alert("Помилка акаунту.");
        }

    } catch (error) {
        console.error("Помилка входу:", error);
        alert("Невірний email або пароль.");
    }
}

// 4. ЕКСПОРТ (Для інших файлів, якщо треба)
export function handleRegistration(email, password, role, displayName) {
    registerUser(email, password, role, displayName);
}

export function handleLogin(email, password, expectedRole) {
    loginUser(email, password, expectedRole);
}

// 5. ОБРОБНИКИ ПОДІЙ (Щоб кнопки працювали)
document.addEventListener('DOMContentLoaded', () => {
    // --- КЛІЄНТ ---
    const customerRegisterForm = document.getElementById('registerForm');
    if (customerRegisterForm) {
        console.log("Знайдено форму реєстрації клієнта");
        customerRegisterForm.addEventListener('submit', function(e) {
            e.preventDefault(); // <--- ОСЬ ЩО ЗУПИНЯЄ ПЕРЕЗАВАНТАЖЕННЯ
            console.log("Натиснуто Sign Up (Customer)");
            
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const name = document.getElementById('registerName').value;
            
            handleRegistration(email, password, 'customer', name); 
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log("Знайдено форму входу клієнта");
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // <--- ОСЬ ЩО ЗУПИНЯЄ ПЕРЕЗАВАНТАЖЕННЯ
            console.log("Натиснуто Sign In (Customer)");

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            handleLogin(email, password, 'customer'); 
        });
    }

    // --- ПРОДАВЕЦЬ ---
    const sellerRegisterForm = document.getElementById('sellerRegisterForm');
    if (sellerRegisterForm) {
        sellerRegisterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('sellerRegisterEmail').value;
            const password = document.getElementById('sellerRegisterPassword').value;
            const storeName = document.getElementById('sellerStoreName').value;
            handleRegistration(email, password, 'seller', storeName);
        });
    }

    const sellerLoginForm = document.getElementById('sellerLoginForm');
    if (sellerLoginForm) {
        sellerLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('sellerLoginEmail').value;
            const password = document.getElementById('sellerLoginPassword').value;
            handleLogin(email, password, 'seller'); 
        });
    }
});