document.addEventListener("DOMContentLoaded", function () {
  const introSection = document.getElementById('intro');
  const mainContent = document.getElementById('main-content');
  const introBtn = document.getElementById('intro-btn');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');

  let progress = 0;
  let interval;

  // クエリパラメータをチェック
  const urlParams = new URLSearchParams(window.location.search);
  const skipIntro = urlParams.get('skipIntro');

  // skipIntro パラメータが true なら intro をスキップしてメインコンテンツを表示
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

  function startProgressBar() {
    const duration = 2500; // プログレスバーが完了する時間（ミリ秒）
    const intervalTime = 100; // プログレスバーを更新する間隔（ミリ秒）
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

  function showMainContent() {
    introSection.style.display = 'none';
    mainContent.style.display = 'block';
  }
});
