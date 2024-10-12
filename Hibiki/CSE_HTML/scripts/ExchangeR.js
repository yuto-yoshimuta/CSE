$(document).ready(function() {
  $('#conversion-form').on('submit', function(event) {
      event.preventDefault(); // デフォルトのフォーム送信を無効化

      var amount = $('#amount').val();
      var from_currency = $('#from_currency').val();
      var to_currency = $('#to_currency').val();

      const api_key = '3022f671c088f298ea909b97';
      var url = `https://v6.exchangerate-api.com/v6/${api_key}/latest/${from_currency}`;

      // APIリクエスト
      $.get(url, function(data) {
          if (data.result === 'success') {
              var rate = data.conversion_rates[to_currency];
              var converted_amount = (amount * rate).toFixed(2);

              $('#result').html(`
                  <p><strong>Converted Amount:</strong> ${converted_amount} ${to_currency}</p>
                  <p><strong>Exchange Rate:</strong> ${rate}</p>
                  <p><em>Note: Exchange rates fluctuate based on various economic factors.</em></p>
              `);
          } else {
              $('#result').html('<p>Error retrieving exchange rate. Please try again.</p>');
          }
      });
  });
});
