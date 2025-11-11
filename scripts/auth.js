import { 
    auth, 
    db, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    doc, 
    setDoc, 
    getDoc 
} from './database.js';
/**
   @param {string} email - Електронна пошта користувача.
   @param {string} password - Пароль.
 * @param {string} role - Роль ('customer' або 'seller').
 * @param {string} displayName - Ім'я клієнта або назва магазину.
 */
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Отримання ролі користувача з Firestore
        const docSnap = await getDoc(doc(db, "users", user.uid));
        
        if (docSnap.exists()) {
            const role = docSnap.data().role;
            console.log(`Користувач ${user.email} успішно увійшов з роллю: ${role}`);

            // Перевірка: Якщо користувач не покупець, ми його "викидаємо"
            if (role !== 'customer') {
                 alert("Ви увійшли як Продавець. Перейдіть на сторінку продавця для входу.");
                 await auth.signOut(); // Вийти, оскільки він не на тій сторінці
                 return; 
            }

            // Якщо покупець, перенаправляємо на дашборд покупця
            window.location.href = 'customer-page.html'; 
        } else {
            console.error("Не знайдено ролі користувача у базі даних.");
            await auth.signOut();
        }

    } catch (error) {
        console.error("Помилка входу:", error.message);
        alert("Помилка входу: Невірний email або пароль.");
    }
}

async function registerUser(email, password, role, displayName) {
    try {
        // 1. Створення акаунту через Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Створення об'єкта даних для Firestore
        const userData = {
            email: user.email,
            role: role,
            createdAt: new Date().toISOString()
        };

        // Додаємо відповідне поле відповідно до ролі
        if (role === 'seller') {
            userData.storeName = displayName;
        } else { // 'customer'
            userData.name = displayName; 
        }

        // 3. Зберігання інформації (ролі та ім'я/назви) у Cloud Firestore
        await setDoc(doc(db, "users", user.uid), userData);

        console.log(`Користувача ${user.email} успішно зареєстровано як ${role}`);
        
        // 4. Перенаправлення
        if (role === 'customer') {
            window.location.href = 'customer-page.html';
        } else if (role === 'seller') {
            window.location.href = 'seller-page.html';
        }

    } catch (error) {
        console.error("Помилка реєстрації:", error.message);
        let errorMessage = "Невідома помилка реєстрації.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Ця електронна пошта вже використовується.";
        } else if (error.code === 'auth/weak-password') {
             errorMessage = "Пароль має бути не менше 6 символів.";
        }
        alert(`Помилка реєстрації: ${errorMessage}`);
    }
}

// Експортуємо функцію під назвою, яку викликаємо у HTML
export function handleRegistration(email, password, role, displayName) {
    registerUser(email, password, role, displayName);
}

// Експортуємо функцію входу під назвою, яку ми викликаємо в HTML
export function handleLogin(email, password) {
    loginUser(email, password);
}

// Оновлення експорту:
// export { handleRegistration, handleLogin };

// scripts/auth.js (ДОДАЄМО ОБРОБНИКИ ПОДІЙ)

// ІМПОРТОВАНІ ФУНКЦІЇ:
// handleRegistration та handleLogin (вони вже оголошені та експортовані у цьому файлі)

document.addEventListener('DOMContentLoaded', () => {
    // =======================================================
    // 1. ОБРОБНИК РЕЄСТРАЦІЇ (Sign Up)
    // =======================================================
    const registerForm = document.getElementById('registerForm');

    if (registerForm) { // Перевірка, чи існує форма на сторінці
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            // Збираємо дані
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const name = document.getElementById('registerName').value; 
            
            // Виклик основної функції з роллю 'customer'
            handleRegistration(email, password, 'customer', name); 
        });
    }


    // =======================================================
    // 2. ОБРОБНИК ВХОДУ (Sign In)
    // =======================================================
    const loginForm = document.getElementById('loginForm');

    if (loginForm) { // Перевірка, чи існує форма на сторінці
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            // Збираємо дані
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Виклик основної функції
            handleLogin(email, password); 
        });
    }

});