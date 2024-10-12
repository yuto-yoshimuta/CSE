<template>
    <div id="intro">
      <h1>ARE U READY?</h1>
      <button v-if="!isProgressing" @click="handleOk">OK</button>
      <div id="progress-container" v-if="isProgressing">
        <div id="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        progress: 0,
        interval: null,
        isProgressing: false,
      };
    },
    methods: {
      handleOk() {
        console.log('OK button clicked');
        this.isProgressing = true;
        this.startProgressBar();
      },
      startProgressBar() {
        console.log('Progress bar started');
        const duration = 2500;
        const intervalTime = 100;
        const increment = (intervalTime / duration) * 100;
  
        this.interval = setInterval(() => {
          this.progress += increment;
          console.log(`Progress: ${this.progress.toFixed(2)}%`);
  
          if (this.progress >= 100) {
            this.progress = 100;
            clearInterval(this.interval);
            console.log('Progress completed');
            this.$emit('intro-completed');
          }
        }, intervalTime);
      },
    },
  };
  </script>
  
  <style scoped>
  /* Intro用のスタイルをここに書きます */
  </style>
  