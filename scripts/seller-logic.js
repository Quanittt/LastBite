import { db, collection, addDoc, auth } from './database.js';

const btnAdd = document.getElementById('btnAddProduct');

btnAdd.addEventListener('click', async () => {
    // 1. Збираємо дані з полів
    const name = document.getElementById('foodName').value;
    const price = document.getElementById('foodPrice').value;
    const desc = document.getElementById('foodDescription').value;

    // Валідація (щоб не пусті поля)
    if(!name || !price) {
        alert("Заповни хоча б назву і ціну!");
        return;
    }

    try {
        // 2. Відправляємо у Firestore
        // collection(db, "products") - це папка, куди ми кладемо товари
        const docRef = await addDoc(collection(db, "products"), {
            name: name,
            price: price,
            description: desc,
            sellerId: auth.currentUser ? auth.currentUser.uid : "unknown", // Хто продав
            createdAt: new Date().toISOString() // Коли додали
        });

        console.log(docRef.id);
        alert("Успішно додано!");
        
        // Очистити поля
        document.getElementById('foodName').value = '';
        document.getElementById('foodPrice').value = '';

    } catch (e) {
        console.error("Помилка додавання: ", e);
        alert("Щось пішло не так");
    }
});