const ExchangeR = {
  template: `
    <div class="container">
      <h2>Currency Converter</h2>
      <form @submit.prevent="convertCurrency">
        <label for="amount">Amount:</label>
        <input type="number" v-model="amount" required placeholder="Enter amount">
        
        <label for="from_currency">From Currency:</label>
        <select v-model="fromCurrency">
          <option value="JPY">Japanese Yen (JPY)</option>
          <option value="TWD">Taiwan Dollar (TWD)</option>
        </select>
        
        <label for="to_currency">To Currency:</label>
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
      amount: 0,
      fromCurrency: 'JPY',
      toCurrency: 'TWD',
      convertedAmount: null,
      exchangeRate: null,
    };
  },
  methods: {
    convertCurrency() {
      const api_key = 'AAA'; 
      const url = `https://v6.exchangerate-api.com/v6/${api_key}/latest/${this.fromCurrency}`;

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
        .catch(() => {
          alert('Network error. Please try again later.');
        });
    },
  },
};
