// scripts/customer-logic.js

// НОВИЙ, ПРАВИЛЬНИЙ ІМПОРТ (Все беремо з database.js)
import { db, collection, getDocs, auth, doc, setDoc, arrayUnion, getDoc, deleteDoc } from './database.js';

// Змінні для DOM
const productsContainer = document.getElementById('productsList');
const cartSidebar = document.getElementById('cartSidebar');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');


// =======================================================
// 1. ЛОГІКА ТАЙМЕРА ТА ЦІНОУТВОРЕННЯ
// =======================================================

const DISCOUNT_RATE = 0.10; // 10%
const DISCOUNT_INTERVAL_MS = 15 * 60 * 1000; // 15 хвилин у мс
const MAX_DURATION_MS = 60 * 60 * 1000; // 1 година у мс

let allProducts = []; // Глобальний список товарів, які ми завантажили
let timerInterval = null; // Глобальний таймер для оновлення UI

/**
 * Розраховує поточну ціну та час, що залишився, на основі мітки часу.
 * @param {object} product - дані продукту з Firestore (має містити initialPrice та startTime).
 * @returns {object} { currentPrice, timeRemainingMs, isExpired }
 */
function calculateProductState(product) {
    const now = new Date().getTime();
    const startTime = product.startTime;
    const elapsedMs = now - startTime;
    
    const timeRemainingMs = MAX_DURATION_MS - elapsedMs;
    const isExpired = timeRemainingMs <= 0;
    
    // Розраховуємо кількість інтервалів, що минули:
    let intervalsPassed = Math.floor(elapsedMs / DISCOUNT_INTERVAL_MS);
    
    // === ЗМІНА ДЛЯ ПОЧАТКОВОЇ ЗНИЖКИ ===
    // Додаємо 1 до кількості інтервалів, що минули, щоб одразу застосувати перші 10%
    intervalsPassed += 1; 
    // ===================================
    
    // Максимум 5 інтервалів (4 повних знижки + 1 початкова)
    if (intervalsPassed > 5) {
        intervalsPassed = 5;
    }

    const totalDiscount = intervalsPassed * DISCOUNT_RATE;
    const currentPrice = (product.initialPrice * (1 - totalDiscount)).toFixed(2); 

    return { 
        currentPrice: Math.max(0, parseFloat(currentPrice)), 
        timeRemainingMs: Math.max(0, timeRemainingMs),
        isExpired: isExpired,
        // Час до наступної знижки залишається той же, що і до першого 15-хвилинного інтервалу
        nextDiscountInMs: DISCOUNT_INTERVAL_MS - (elapsedMs % DISCOUNT_INTERVAL_MS)
    };
}


/**
 * Рендерить картки, розраховуючи їхній поточний стан, і оновлює відображення.
 */
function renderProductCards() {
    if (!productsContainer) return;
    productsContainer.innerHTML = "";
    
    let allCardsHTML = "";
    
    allProducts.forEach((doc) => {
        const product = doc.data(); 
        const productId = doc.id;
        
        const state = calculateProductState(product);
        
        // 1. ПЕРЕВІРКА НА ТЕРМІН ДІЇ (автоматичне видалення з відображення)
        if (state.isExpired) {
            return; 
        }

        // Форматування часу, що залишився
        const totalSeconds = Math.floor(state.timeRemainingMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Форматування назви для onclick
        const productName = product.name ? product.name.replace(/'/g, "\\'") : ''; 
        
        // 2. СТВОРЕННЯ КАРТКИ
        const cardHTML = `
            <div class="product-card" style="border: 1px solid #c92f2f; padding: 15px; margin-bottom: 15px;">
                <div style="font-weight: bold; font-size: 1.2em;">${product.name}</div>
                <div style="color: #666; margin-top: 5px;">${product.description}</div>
                <div style="margin-top: 10px;">
                    <div style="text-decoration: line-through; color: #888;">Початкова ціна: ${product.initialPrice.toFixed(2)} грн</div>
                    <div style="color: green; font-size: 1.1em;">Поточна ціна: <strong>${state.currentPrice.toFixed(2)} грн</strong></div>
                </div>
                <div style="color: red; font-size: 0.9em; margin: 5px 0;">
                    До закінчення розпродажу: <strong>${timeDisplay}</strong>
                </div>
                <button onclick="addToCart('${productId}', '${productName}', ${state.currentPrice})">Купити зараз</button>
            </div>
        `;
        allCardsHTML += cardHTML;
    });
    
    productsContainer.innerHTML = allCardsHTML;
}


// =======================================================
// 2. ЛОГІКА КОШИКА (ДОДАВАННЯ, РЕНДЕР, ВИДАЛЕННЯ)
// =======================================================

/**
 * Додає один товар до кошика поточного користувача.
 */
async function addToCart(productId, name, price) {
    const user = auth.currentUser;

    if (!user) {
        alert("Будь ласка, увійдіть у свій обліковий запис, щоб додати товар до кошика.");
        return;
    }
    const userId = user.uid;
    const cartItem = {
        id: productId,
        name: name,
        price: price, // Тут використовується вже розрахована ціна з картки
        quantity: 1, 
        addedAt: new Date().toISOString(),
    };

    try {
        const cartRef = doc(db, "carts", userId);
        
        await setDoc(cartRef, {
            cartItems: arrayUnion(cartItem)
        }, { merge: true });

        alert(`"${name}" успішно додано до кошика! 🎉`);
        
        renderCartContent(); 
    } catch (e) {
        console.error("Помилка при додаванні товару до кошика:", e);
        alert("Не вдалося додати товар до кошика. Перевірте консоль.");
    }
}


/**
 * Отримує вміст кошика з Firebase та відображає його в сайдбарі.
 */
async function renderCartContent() {
    const user = auth.currentUser;
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalElement = document.getElementById('cartTotal');
    
    if (!user) {
        cartItemsList.innerHTML = "<p>Будь ласка, увійдіть, щоб переглянути кошик.</p>";
        cartTotalElement.textContent = '0.00 грн';
        return;
    }

    cartItemsList.innerHTML = "<p>Завантаження кошика...</p>";
    
    try {
        const cartDocRef = doc(db, "carts", user.uid);
        const docSnap = await getDoc(cartDocRef);

        if (docSnap.exists() && docSnap.data().cartItems && docSnap.data().cartItems.length > 0) {
            
            const items = docSnap.data().cartItems;
            let total = 0;
            let itemsHTML = '';

            items.forEach(item => {
                const itemPrice = item.price * item.quantity;
                total += itemPrice;

                itemsHTML += `
                    <div style="border-bottom: 1px dashed #ccc; padding: 10px 0;">
                        <p style="margin: 0;"><strong>${item.name}</strong> x ${item.quantity}</p>
                        <p style="text-align: right; margin: 0;">${itemPrice.toFixed(2)} грн</p>
                    </div>
                `;
            });
            
            cartItemsList.innerHTML = itemsHTML;
            cartTotalElement.textContent = `${total.toFixed(2)} грн`;

        } else {
            cartItemsList.innerHTML = "<p>Ваш кошик пустий.</p>";
            cartTotalElement.textContent = '0.00 грн';
        }
        
    } catch (e) {
        console.error("Помилка читання кошика:", e);
        cartItemsList.innerHTML = "<p>Помилка завантаження даних кошика.</p>";
    }
}


/**
 * Підтверджує замовлення та видаляє як кошик, так і продані товари з колекції 'products'.
 */
async function confirmOrder() {
    const user = auth.currentUser;
    if (!user) return; 

    try {
        const cartDocRef = doc(db, "carts", user.uid);
        const docSnap = await getDoc(cartDocRef);
        
        if (!docSnap.exists() || !docSnap.data().cartItems || docSnap.data().cartItems.length === 0) {
            alert("Кошик пустий, нічого підтверджувати!");
            return;
        }

        const cartItems = docSnap.data().cartItems;
        
        // =========================================================
        // КРОК: ВИДАЛЕННЯ ПРОДАНИХ ТОВАРІВ З КОЛЕКЦІЇ 'products'
        // =========================================================
        
        const deleteProductPromises = cartItems.map(item => {
            const productId = item.id;
            // Видаляємо документ товару з колекції "products"
            return deleteDoc(doc(db, "products", productId)).catch(e => {
                // Логуємо помилку, але дозволяємо іншим операціям продовжуватися
                console.error(`Помилка видалення товару ${productId} (можливо, вже видалено):`, e);
            });
        });

        // Чекаємо завершення всіх операцій видалення товарів
        await Promise.all(deleteProductPromises);
        
        // =========================================================
        
        // 1. Логування та сповіщення
        console.log("ЗАМОВЛЕННЯ ПІДТВЕРДЖЕНО:", cartItems);
        alert(`Замовлення на суму ${document.getElementById('cartTotal').textContent} успішно підтверджено!`);

        // 2. ВИДАЛЕННЯ ДОКУМЕНТА КОШИКА
        await deleteDoc(cartDocRef);
        
        // 3. Оновлюємо відображення:
        renderCartContent(); // Очищаємо вміст сайдбару
        toggleCart(false); // Закриваємо сайдбар
        
        // Оновлюємо список товарів на головній сторінці (товари зникають)
        loadProducts(); 
        
    } catch (e) {
        console.error("Помилка підтвердження замовлення:", e);
        alert("Помилка підтвердження замовлення.");
    }
}


// =======================================================
// 3. ФУНКЦІЯ ЗАВАНТАЖЕННЯ ТОВАРІВ (loadProducts)
// =======================================================

/**
 * Завантажує товари один раз і запускає таймер для оновлення відображення.
 */
async function loadProducts() {
    if (timerInterval) {
        clearInterval(timerInterval); // Зупиняємо старий таймер
    }
    
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        
        // Зберігаємо всі товари глобально
        allProducts = querySnapshot.docs; 

        // 1. Перше відображення
        renderProductCards(); 

        // 2. Запускаємо таймер, щоб оновлювати картки кожну секунду
        timerInterval = setInterval(() => {
            renderProductCards();
        }, 1000);

    } catch (e) {
        console.error("Помилка при читанні даних з Firestore:", e);
        productsContainer.innerHTML = "<p>Помилка завантаження даних. Перевірте консоль.</p>";
    }
}


// =======================================================
// 4. ЛОГІКА САЙДБАРУ ТА ІНІЦІАЛІЗАЦІЯ
// =======================================================

function toggleCart(isOpen) {
    if (cartSidebar) {
        if (isOpen) {
            renderCartContent(); // Завантажуємо вміст, коли відкриваємо
            cartSidebar.classList.add('open');
        } else {
            cartSidebar.classList.remove('open');
        }
    }
}

// Робимо функції доступними глобально
window.addToCart = addToCart;
window.toggleCart = toggleCart;


// Ініціалізація та обробники подій
auth.onAuthStateChanged(user => {
    if (user) {
        loadProducts();
    } else {
        loadProducts(); 
    }
});


// Прив'язка обробників до кнопок DOM
document.addEventListener('DOMContentLoaded', () => {
    // Прив'язка кнопок сайдбару
    if (openCartBtn && closeCartBtn) {
        openCartBtn.addEventListener('click', () => toggleCart(true));
        closeCartBtn.addEventListener('click', () => toggleCart(false));
    }
    
    // Прив'язка кнопки підтвердження замовлення
    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', confirmOrder);
    }
});