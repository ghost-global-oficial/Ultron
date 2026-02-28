// Animated placeholder system for chat input
const PROMPT_SUGGESTIONS = [
  "What can you help me with?",
  "Explain quantum computing in simple terms",
  "Write a Python script to analyze data",
  "Help me debug this code",
  "Create a REST API design",
  "Suggest improvements for my project",
  "Generate test cases for this function",
  "Explain this error message",
  "Optimize this algorithm",
  "Review my code architecture"
];

let currentIndex = 0;
let currentText = "";
let isDeleting = false;
let typingSpeed = 100;
let deleteSpeed = 50;
let pauseAfterComplete = 2000;
let pauseAfterDelete = 500;
let timeoutId: number | null = null;
let textareaElement: HTMLTextAreaElement | null = null;

function getNextSuggestion(): string {
  currentIndex = (currentIndex + 1) % PROMPT_SUGGESTIONS.length;
  return PROMPT_SUGGESTIONS[currentIndex];
}

function animatePlaceholder() {
  if (!textareaElement) return;

  const fullText = PROMPT_SUGGESTIONS[currentIndex];

  if (!isDeleting) {
    // Typing
    if (currentText.length < fullText.length) {
      currentText = fullText.substring(0, currentText.length + 1);
      textareaElement.placeholder = currentText;
      timeoutId = window.setTimeout(animatePlaceholder, typingSpeed);
    } else {
      // Finished typing, pause then start deleting
      timeoutId = window.setTimeout(() => {
        isDeleting = true;
        animatePlaceholder();
      }, pauseAfterComplete);
    }
  } else {
    // Deleting
    if (currentText.length > 0) {
      currentText = currentText.substring(0, currentText.length - 1);
      textareaElement.placeholder = currentText;
      timeoutId = window.setTimeout(animatePlaceholder, deleteSpeed);
    } else {
      // Finished deleting, pause then start typing next suggestion
      isDeleting = false;
      getNextSuggestion();
      timeoutId = window.setTimeout(animatePlaceholder, pauseAfterDelete);
    }
  }
}

export function startAnimatedPlaceholder(textarea: HTMLTextAreaElement) {
  stopAnimatedPlaceholder();
  textareaElement = textarea;
  currentText = "";
  isDeleting = false;
  currentIndex = 0;
  animatePlaceholder();
}

export function stopAnimatedPlaceholder() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  textareaElement = null;
  currentText = "";
  isDeleting = false;
}

export function pauseAnimatedPlaceholder() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

export function resumeAnimatedPlaceholder() {
  if (textareaElement) {
    animatePlaceholder();
  }
}
