import { db, collection, addDoc, auth } from './database.js';

const btnAdd = document.getElementById('btnAddProduct');

btnAdd.addEventListener('click', async () => {
    // 1. Збираємо дані з полів
    const name = document.getElementById('foodName').value;
    const priceInput = document.getElementById('foodPrice').value; // Отримуємо ціну як рядок
    const desc = document.getElementById('foodDescription').value;

    // Перетворюємо ціну на число для зберігання
    const initialPrice = parseFloat(priceInput); 
    
    // Валідація: перевіряємо наявність та чи є ціна числом
    if(!name || isNaN(initialPrice) || initialPrice <= 0) { 
        alert("Заповніть коректну назву та початкову ціну (має бути числом більше нуля)!");
        return;
    }

    // Перевірка автентифікації користувача
    const sellerId = auth.currentUser ? auth.currentUser.uid : "unknown";
    if (sellerId === "unknown") {
        alert("Помилка: Продавець не увійшов у систему.");
        return;
    }

    try {
        // 2. Відправляємо у Firestore з даними для таймера
        const docRef = await addDoc(collection(db, "products"), {
            name: name,
            description: desc,
            
            // === ПОЛЯ, КРИТИЧНО ВАЖЛИВІ ДЛЯ ТАЙМЕРА ===
            initialPrice: initialPrice, // Початкова ціна (для розрахунку знижки)
            price: initialPrice,        // Поточна ціна (поки що дорівнює початковій)
            startTime: new Date().getTime(), // Мітка часу в мілісекундах (Коли товар виставлено)
            // ==========================================
            
            sellerId: sellerId, 
            createdAt: new Date().toISOString()
        });

        console.log(`Товар додано з ID: ${docRef.id} та початковою ціною ${initialPrice}`);
        alert("Успішно додано! Товар почне відлік знижки.");
        
        // Очистити поля
        document.getElementById('foodName').value = '';
        document.getElementById('foodPrice').value = '';
        document.getElementById('foodDescription').value = '';

    } catch (e) {
        console.error("Помилка додавання: ", e);
        alert("Щось пішло не так при записі у базу даних.");
    }
});