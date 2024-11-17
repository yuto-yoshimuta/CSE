document.addEventListener("DOMContentLoaded", function () {
  const introSection = document.getElementById('intro');
  const mainContent = document.getElementById('main-content');
  const introBtn = document.getElementById('intro-btn');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');

  let progress = 0;
  let interval;

  // Check if this is the first visit or if it's the first server run
  const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
  const serverFirstRun = sessionStorage.getItem('serverFirstRun') === null;

  if (hasVisitedBefore && !serverFirstRun) {
      // Skip intro animation for returning visitors
      introSection.style.display = 'none';
      mainContent.style.display = 'block';
  } else {
      // Show intro animation for first-time visitors or server first run
      introBtn.addEventListener('click', function () {
          introBtn.style.display = 'none';
          progressContainer.style.display = 'block';
          startProgressBar();

          // Set flags for both localStorage and sessionStorage
          localStorage.setItem('hasVisitedBefore', 'true');
          sessionStorage.setItem('serverFirstRun', 'false');
      });
  }

  /**
   * Initialize and start the progress bar animation
   * Controls the loading animation before showing main content
   */
  function startProgressBar() {
      const duration = 2500; // Total time for progress bar completion (milliseconds)
      const intervalTime = 100; // Update interval for progress bar (milliseconds)
      const increment = (intervalTime / duration) * 100;

      interval = setInterval(() => {
          progress += increment;
          progressBar.style.width = progress + '%';

          if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              transitionToMainContent();
          }
      }, intervalTime);
  }

  /**
   * Transition from intro to main content
   */
  function transitionToMainContent() {
      introSection.style.display = 'none';
      mainContent.style.display = 'block';
  }
});
