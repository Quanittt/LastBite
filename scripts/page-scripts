// Simple page script for customer and seller pages
// This handles basic interactivity

// Log when page loads
console.log("[v0] Page loaded successfully")

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
