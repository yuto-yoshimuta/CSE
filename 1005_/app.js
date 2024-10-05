// app.js

const { createApp } = Vue;

// Introコンポーネント
const Intro = {
  template: `
    <div id="intro">
      <h1>ARE U READY?</h1>
      <button v-if="!isProgressing" @click="handleOk">OK</button>
      <div id="progress-container" v-if="isProgressing">
        <div id="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  `,
  data() {
    return {
      progress: 0,
      interval: null,
      isProgressing: false, // プログレスバーが進行中かどうかのフラグ
    };
  },
  methods: {
    handleOk() {
      console.log('OK button clicked');
      this.isProgressing = true; // プログレスバーを表示
      this.startProgressBar();
    },
    startProgressBar() {
      const duration = 2500; // プログレスバーが完了時間（ミリ秒）
      const intervalTime = 100; // プログレスバーを更新間隔（ミリ秒）
      const increment = (intervalTime / duration) * 100;

      this.interval = setInterval(() => {
        this.progress += increment;
        console.log(`Progress: ${this.progress.toFixed(2)}%`);

        if (this.progress >= 100) {
          this.progress = 100;
          clearInterval(this.interval);
          console.log('Progress completed');
          this.$emit('intro-completed'); // イベントを発火
        }
      }, intervalTime);
    },
  },
};

// Headerコンポーネント
const Header = {
  template: `
    <header>
      <div class="logo">
        <img src="assets/image.png" alt="ロゴ" />
        <a href="#" id="home-link" @click.prevent="goHome">Cash Scan Explore</a>
      </div>
      <div class="header-buttons">
        <a href="#mitei" class="btn-mitei">未定</a>
        <a href="ExchangeR.html" class="btn-exchange">Exchange Rate</a>
        <a href="#image-recognition" class="btn-recognition">Image Recognition</a>
        <a href="#types-of-money" class="btn-money">Types of Money</a>
      </div>
    </header>
  `,
  methods: {
    goHome() {
      console.log('Navigate home from Header');
      this.$emit('navigate-home'); // イベントを発火
    },
  },
};

// Footerコンポーネント
const Footer = {
  template: `
    <footer>
      <h1>2024 Uni</h1>
    </footer>
  `,
};

// MainContentコンポーネント
const MainContent = {
  components: {
    Header,
    Footer,
  },
  template: `
    <div id="main-content">
      <Header @navigate-home="goHome"></Header>
      <main>
        <h1 class="main-title">Cash Scan Explore</h1>
        <div class="description-box">
          説明説明説明説明説明説明説明説明説明説明説明説明説明説明説明
        </div>
        <div class="graph-space">
          <img src="assets/output.png" alt="Exchange Rate Plot" />
        </div>
        <div class="button-section">
          <a class="button-box" href="#mitei">
            <h2>未定</h2>
            <img src="assets/news-image.png" alt="未定" />
            <p>未定についての説明文</p>
          </a>
          <a class="button-box" href="ExchangeR.html" >
  			<h2>Exchange Rate</h2>
  			<img src="assets/news-image.png" alt="Exchange Rate" />
  			<p>為替レートについての説明文</p>
		  </a>
          <a class="button-box" href="#image-recognition">
            <h2>Image Recognition</h2>
            <img src="assets/image-recognition-image.png" alt="Image Recognition" />
            <p>画像認識技術についての説明文</p>
          </a>
          <a class="button-box" href="https://www.youtube.com/">
            <h2>Types of Money</h2>
            <img src="assets/money-explanation-image.png" alt="Types of Money" />
            <p>日本と台湾のお金の歴史についての説明文</p>
          </a>
        </div>
      </main>
      <Footer></Footer>
    </div>
  `,
  methods: {
    goHome() {
      console.log('Navigate home from MainContent');
      this.$emit('navigate-home');
    },
  },
};

// ExchangeRコンポーネントを定義
const ExchangeR = {
  template: `
    <div class="container">
      <h2>Currency Converter</h2>
      <form @submit.prevent="convertCurrency">
        <label for="amount">Amount:</label>
        <input type="number" v-model="amount" required placeholder="Enter amount">

        <label for="fromCurrency">From Currency:</label>
        <select v-model="fromCurrency">
          <option value="JPY">Japanese Yen (JPY)</option>
          <option value="TWD">Taiwan Dollar (TWD)</option>
        </select>

        <label for="toCurrency">To Currency:</label>
        <select v-model="toCurrency">
          <option value="TWD">Taiwan Dollar (TWD)</option>
          <option value="JPY">Japanese Yen (JPY)</option>
          <option value="USD">US Dollar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
          <option value="GBP">British Pound (GBP)</option>
        </select>

        <button type="submit">Convert</button>
      </form>

      <div id="result" v-if="convertedAmount">
        <p><strong>Converted Amount:</strong> {{ convertedAmount }} {{ toCurrency }}</p>
        <p><strong>Exchange Rate:</strong> {{ exchangeRate }}</p>
        <p><em>Note: Exchange rates fluctuate based on various economic factors.</em></p>
      </div>
    </div>
  `,
  data() {
    return {
      amount: null,
      fromCurrency: 'JPY',
      toCurrency: 'TWD',
      convertedAmount: null,
      exchangeRate: null,
    };
  },
  methods: {
    convertCurrency() {
      const apiKey = ''; // APIキーを取得して入力
      const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${this.fromCurrency}`;

      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.result === 'success') {
            this.exchangeRate = data.conversion_rates[this.toCurrency];
            this.convertedAmount = (this.amount * this.exchangeRate).toFixed(2);
          } else {
            alert('Error retrieving exchange rate. Please try again.');
          }
        })
        .catch(error => {
          alert('Network error. Please try again later.');
        });
    },
  },
};


// Vueアプリケーションの作成
const app = createApp({
  components: {
    Intro,
    MainContent,
    Header,
    Footer,
    ExchangeR,
  },
  data() {
    return {
      currentPage: 'Intro', // 初期ページを管理
    };
  },
  methods: {
    handleIntroCompleted() {
      console.log('Intro completed');
      this.currentPage = 'MainContent'; // イントロが完了したらメインコンテンツを表示
    },
    navigateTo(page) {
      console.log(`Navigate to ${page}`);
      this.currentPage = page; // ページを変更
    },
  },
  template: `
    <div id="app">
      <Intro v-if="currentPage === 'Intro'" @intro-completed="handleIntroCompleted"></Intro>
      <MainContent v-else-if="currentPage === 'MainContent'" 
                   @navigate-home="handleIntroCompleted"
                   @navigate-exchange="navigateTo('ExchangeR')"></MainContent>
      <ExchangeR v-else-if="currentPage === 'ExchangeR'"></ExchangeR>
    </div>
  `,
});

// Vueアプリケーションのマウント
app.mount('#app');