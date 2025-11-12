// scripts/seller-dashboard.js

// Імпортуємо інструменти з нашого "хабу"
import { auth, db, doc, getDoc } from './database.js';

// Ця функція спрацює, як тільки сторінка завантажиться
document.addEventListener('DOMContentLoaded', () => {

    const user_name = document.getElementById('user-name');
    const logoutButton = document.getElementById('logoutButton');

    // 1. Головна функція: Перевірка стану автентифікації
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Користувач увійшов
            try {
                // 2. Отримуємо документ користувача з Firestore
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    
                    // 3. Перевіряємо роль (безпека)
                    if (userData.role === 'seller') {
                        // 4. ВСТАВЛЯЄМО ІМ'Я В HTML
                        user_name.textContent = userData.storeName;
                    } else {
                        // Це покупець, який намагається зайти на сторінку продавця
                        alert("Доступ заборонено. Ви не продавець.");
                        window.location.href = 'customer.html'; // Повертаємо його
                    }
                } else {
                    console.error("Помилка: не знайдено дані користувача.");
                    window.location.href = 'seller.html';
                }

            } catch (error) {
                console.error("Помилка отримання даних:", error);
            }
        } else {
            // Користувач НЕ увійшов. Відправляємо його на сторінку входу.
            alert("Ви вийшли з аккаунту.");
            window.location.href = 'seller.html'; // Сторінка входу для продавця
        }
    });

    // 5. Логіка кнопки виходу
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            await auth.signOut();
            window.location.href = 'seller.html'; // Повернення на головну
        });
    }
});