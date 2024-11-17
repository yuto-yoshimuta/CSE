document.addEventListener("DOMContentLoaded", function () {
  const introSection = document.getElementById('intro');
  const mainContent = document.getElementById('main-content');
  const introBtn = document.getElementById('intro-btn');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');

  let progress = 0;
  let interval;

  // Check if this is the first visit
  const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');

  // Skip intro if user has visited before or if skipIntro parameter is present
  const urlParams = new URLSearchParams(window.location.search);
  const skipIntro = urlParams.get('skipIntro');

  if (hasVisitedBefore || skipIntro === 'true') {
    // Skip intro animation for returning visitors
    introSection.style.display = 'none';
    mainContent.style.display = 'block';
  } else {
    // Show intro animation for first-time visitors
    introBtn.addEventListener('click', function () {
      introBtn.style.display = 'none';
      progressContainer.style.display = 'block';
      startProgressBar();
      
      // Set flag in localStorage to indicate user has seen the intro
      localStorage.setItem('hasVisitedBefore', 'true');
    });
  }

  /**
   * Initialize and start the progress bar animation
   * Controls the loading animation before showing main content
   */
  function startProgressBar() {
    const duration = 2500;  // Total time for progress bar completion (milliseconds)
    const intervalTime = 100;  // Update interval for progress bar (milliseconds)
    const increment = (intervalTime / duration) * 100;

    interval = setInterval(() => {
      progress += increment;
      progressBar.style.width = progress + '%';

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        showMainContent();
      }
    }, intervalTime);
  }

  /**
   * Switch display from intro section to main content
   * Called after progress bar reaches 100%
   */
  function showMainContent() {
    introSection.style.display = 'none';
    mainContent.style.display = 'block';
  }
});