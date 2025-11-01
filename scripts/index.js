// ========== ANIMATION TIMING & STATE MANAGEMENT ==========

// Get HTML elements we need to control
const introContainer = document.getElementById("introContainer")
const splitContainer = document.getElementById("splitContainer")
const container = document.querySelector(".container")
const handwritingText = document.getElementById("handwritingText")

// Variables to track state
let animationComplete = false
let isTransitioning = false

// ========== SHOW SPLIT SCREEN FUNCTION ==========
// This function reveals the split screen after the intro animation ends
function showSplitScreen() {
  if (animationComplete) return // Don't run twice

  animationComplete = true

  // Add fade-out class to intro (makes it disappear)
  introContainer.classList.add("fade-out")

  // Show the split screen with fade-in
  splitContainer.style.display = "flex"
  splitContainer.classList.add("fade-in-split")
}

// ========== NAVIGATION FUNCTION ==========
// This function handles when user clicks on a section
function navigateTo(page) {
  if (isTransitioning) return // Prevent multiple clicks

  isTransitioning = true

  // Add fade-out effect
  container.classList.add("fade-out")

  // After fade animation completes, navigate to the page
  setTimeout(() => {
    window.location.href = page
  }, 300)
}

// ========== KEYBOARD EVENT: ESC TO SKIP ==========
// This allows user to press ESC to skip the intro animation
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !animationComplete) {
    showSplitScreen()
  }
})

// ========== AUTO-SHOW SPLIT SCREEN AFTER 4.5 SECONDS ==========
// The SVG animation takes 4 seconds, so we show the split screen after that
setTimeout(() => {
  showSplitScreen()
}, 4500)

// ========== CLICK ON INTRO TO SKIP ==========
// Allow clicking the intro to skip it
introContainer.addEventListener("click", (event) => {
  // Only skip if clicking on the intro area, not the split screen
  if (!animationComplete && event.target === introContainer) {
    showSplitScreen()
  }
})

console.log("[v0] LastBite landing page loaded successfully")
