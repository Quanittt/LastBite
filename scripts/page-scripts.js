// Simple page script for customer and seller pages
// This handles basic interactivity
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

// Optional: Add smooth scroll behavior
document.documentElement.style.scrollBehavior = "smooth"

// Optional: Prevent button double-clicks
let isClicking = false

document.querySelectorAll(".cta-button").forEach((button) => {
  button.addEventListener("click", (e) => {
    if (isClicking) return
    isClicking = true

    setTimeout(() => {
      isClicking = false
    }, 500)
  })
})

// =========================================================
// ЛОГІКА АНІМАЦІЇ: ЗАХИЩЕНА ПЕРЕВІРКОЮ
// Код виконується лише, якщо елементи існують (тобто, ми на сторінці реєстрації)
// =========================================================

// Перевіряємо, чи існує контейнер (або будь-який інший критичний елемент)
if (container && signUpButton && signInButton) { 

    // Registration form
    signUpButton.addEventListener('click', () => {
      container.classList.add("right-panel-active");
    });

    signInButton.addEventListener('click', () => {
      container.classList.remove("right-panel-active");
    });

}
// =========================================================