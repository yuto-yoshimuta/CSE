<template>
    <div id="app">
      <video autoplay muted loop id="bg-video">
        <source src="./assets/CSEvideo.mp4" type="video/mp4">
        お使いのブラウザは動画タグに対応していません。
      </video>
  
      <div v-if="currentPage === 'Intro'">
        <div id="intro">
          <h1>ARE U READY?</h1>
          <button v-if="!isProgressing" @click="handleOk">OK</button>
          <div id="progress-container" v-if="isProgressing">
            <div id="progress-bar" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
      </div>
  
      <div v-else-if="currentPage === 'MainContent'">
        <div id="main-content">
          <header>
            <div class="logo">
              <img src="./assets/image.png" alt="ロゴ" />
              <a href="#" id="home-link" @click.prevent="goHome">Cash Scan Explore</a>
            </div>
            <div class="header-buttons">
              <a href="#mitei" class="btn-mitei">未定</a>
              <a href="ExchangeR.html" class="btn-exchange">Exchange Rate</a>
              <a href="#image-recognition" class="btn-recognition">Image Recognition</a>
              <a href="#types-of-money" class="btn-money">Types of Money</a>
            </div>
          </header>
          <main>
            <h1 class="main-title">Cash Scan Explore</h1>
            <div class="description-box">説明説明説明説明説明説明説明説明説明説明説明説明説明説明説明</div>
            <div class="graph-space">
              <img src="./assets/output.png" alt="Exchange Rate Plot" />
            </div>
          </main>
          <footer>
            <h1>2024 Uni</h1>
          </footer>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    setup() {
      const currentPage = ref('Intro');
      const progress = ref(0);
      const isProgressing = ref(false);
      let interval = null;
  
      const handleOk = () => {
        console.log('OK button clicked');
        isProgressing.value = true;
        startProgressBar();
      };
  
      const startProgressBar = () => {
        console.log('Progress bar started');
        const duration = 2500;
        const intervalTime = 100;
        const increment = (intervalTime / duration) * 100;
  
        interval = setInterval(() => {
          progress.value += increment;
          console.log(`Progress: ${progress.value.toFixed(2)}%`);
  
          if (progress.value >= 100) {
            progress.value = 100;
            clearInterval(interval);
            console.log('Progress completed');
            currentPage.value = 'MainContent';
          }
        }, intervalTime);
      };
  
      const goHome = () => {
        currentPage.value = 'Intro';
      };
  
      return {
        currentPage,
        progress,
        isProgressing,
        handleOk,
        goHome,
      };
    },
  };
  </script>
  
  <style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
  @import "./home.css";
  
  /* リセットCSS */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  /* 背景動画のスタイル */
  #bg-video {
    position: fixed;
    top: 0;
    left: 0;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    z-index: -1;
    background-size: cover;
    object-fit: cover;
  }
  
  /* プログレスバーのスタイル */
  #progress-container {
    width: 60%;
    height: 12px;
    background-color: #e0e0e0;
    border-radius: 6px;
    margin-top: 20px;
    overflow: hidden;
  }
  
  #progress-bar {
    width: 0%;
    height: 100%;
    background-color: #76c7c0;
    border-radius: 4px 0 0 4px;
    transition: width 0.2s ease;
  }
  
  /* 他のスタイルはhome.cssに含まれています */
  </style>
  