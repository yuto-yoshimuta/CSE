document.addEventListener("DOMContentLoaded", function () {
  const introSection = document.getElementById('intro');
  const mainContent = document.getElementById('main-content');
  const introBtn = document.getElementById('intro-btn');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');

  let progress = 0;
  let interval;

  // Check for URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const skipIntro = urlParams.get('skipIntro');

  // If skipIntro parameter is 'true', skip introduction and show main content directly
  if (skipIntro === 'true') {
    introSection.style.display = 'none';
    mainContent.style.display = 'block';
  } else {
    introBtn.addEventListener('click', function () {
      introBtn.style.display = 'none';
      progressContainer.style.display = 'block';
      startProgressBar();
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