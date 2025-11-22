// НОВИЙ, ПРАВИЛЬНИЙ ІМПОРТ:
import { db, collection, getDocs, auth } from './database.js'; // Використовуємо 'auth' замість 'getAuth'
const productsContainer = document.getElementById('productsList');

// Функція завантаження товарів
async function loadProducts() {
    if (!productsContainer) {
        return;
    }
    
    try {
        // 1. Робимо запит до колекції "products"
        const querySnapshot = await getDocs(collection(db, "products"));
        
        // 2. Очищаємо контейнер (на випадок повторного виклику)
        productsContainer.innerHTML = "";
        
        if (querySnapshot.empty) {
            productsContainer.innerHTML = "<p>На жаль, наразі немає жодних пропозицій їжі.</p>";
            return;
        }

        // 3. Перебираємо кожен знайдений документ
        querySnapshot.forEach((doc) => {
            const data = doc.data(); // Дані про товар
            
            // Створюємо HTML для картки (ТІЛЬКИ DIVS, як просив)
            const cardHTML = `
                <div class="product-card" style="border: 1px solid #e0e0e0; padding: 15px; margin-bottom: 15px;">
                    <div style="font-weight: bold; font-size: 1.2em;">${data.name}</div>
                    <div style="color: #666; margin-top: 5px;">${data.description}</div>
                    <div style="margin-top: 10px;">
                        Ціна: <strong>${data.price} грн</strong>
                    </div>
                    <button>Купити зараз</button>
                    </div>
            `;

            // Додаємо картку в контейнер
            productsContainer.innerHTML += cardHTML;
        });

    } catch (e) {
        console.error("Помилка при читанні даних з Firestore:", e);
        productsContainer.innerHTML = "<p>Помилка завантаження даних. Перевірте консоль.</p>";
    }
}


// Перевірка автентифікації та запуск
// (Запускаємо loadProducts тільки після того, як Firebase Auth готовий)
auth.onAuthStateChanged(user => {
    if (user) {
        // Якщо користувач увійшов, завантажуємо товари
        loadProducts();
    } else {
        // Якщо не увійшов, можна показати лише частину даних або перенаправити
        // Для простоти поки що нехай показує всім
        loadProducts(); 
    }
});