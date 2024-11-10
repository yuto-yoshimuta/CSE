// CSRFトークンの設定
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

$(document).ready(function() {
    const csrftoken = getCookie('csrftoken');

    $('#conversion-form').on('submit', function(e) {
        e.preventDefault();
        
        const amount = $('#amount').val();
        const fromCurrency = $('#from_currency').val();
        const toCurrency = $('#to_currency').val();

        $.ajax({
            url: '/convert/',  // 新しいエンドポイント
            type: 'POST',
            headers: {'X-CSRFToken': csrftoken},
            data: {
                amount: amount,
                from_currency: fromCurrency,
                to_currency: toCurrency
            },
            success: function(response) {
                $('#result').html(`
                    <p>${amount} ${fromCurrency} = ${response.result} ${toCurrency}</p>
                    <p>Exchange rate: 1 ${fromCurrency} = ${response.rate} ${toCurrency}</p>
                `);
            },
            error: function(error) {
                $('#result').html('<p>Error occurred during conversion.</p>');
            }
        });
    });
});