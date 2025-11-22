// ========== ANIMATION TIMING & STATE MANAGEMENT ==========

// Get HTML elements we need to control
const introContainer1 = document.getElementById("introContainer1")
const introContainer2 = document.getElementById("introContainer2")
const splitContainer = document.getElementById("splitContainer")
const container = document.querySelector(".container")
const handwritingText1 = document.getElementById("handwritingText1")
const handwritingText2 = document.getElementById("handwritingText2")
const skipText = document.getElementById("skipText")

// Variables to track state
let firstAnimationComplete = false
let secondAnimationComplete = false
let isTransitioning = false

// ========== SHOW SECOND INTRO FUNCTION ==========
// After first animation ends (4 seconds), fade out first intro and show second intro
function showSecondIntro() {
  if (firstAnimationComplete) return

  firstAnimationComplete = true

  // Fade out first intro
  introContainer1.classList.add("fade-out")

  // After fade animation, show second intro
  setTimeout(() => {
    introContainer1.style.display = "none"
    introContainer2.style.display = "flex"
  }, 300)
}

// ========== SHOW SPLIT SCREEN FUNCTION ==========
// After second animation ends (4 seconds), fade out second intro and show split screen
function showSplitScreen() {
  if (secondAnimationComplete) return

  secondAnimationComplete = true

  // Add fade-out class to second intro (makes it disappear)
  introContainer2.classList.add("fade-out")

  // Show the split screen with fade-in
  setTimeout(() => {
    introContainer2.style.display = "none"
    splitContainer.style.display = "flex"
    splitContainer.classList.add("fade-in-split")
  }, 300)
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
// Can only skip after second intro is shown
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && secondAnimationComplete === false && firstAnimationComplete === true) {
    showSplitScreen()
  }
})

// ========== AUTO TIMING FOR BOTH ANIMATIONS ==========
// First animation: 4 seconds, then show second intro
setTimeout(() => {
  showSecondIntro()
}, 2500)

// Second animation: 4 seconds after first ends (total 8.5 seconds), then show split screen
setTimeout(() => {
  showSplitScreen()
}, 9000)

