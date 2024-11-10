// 通貨データの定義
const CURRENCY_DESCRIPTIONS = {
    jpy1: { 
        title: '1 JPY', 
        text: 'Japan\'s currency system was completely revamped in 1871 during the Meiji era as part of the broader modernization reforms.<br><br>Prior to this, complex forms of currency such as "mon" and "ryō" were used during the Edo period.<br>However, with the push for modernization, new units for currency such as "yen," "sen," and "rin" were introduced, drawing influence from Western currency systems to streamline domestic and international transactions.'
    },
    jpy5: {
        title: '5 JPY',
        text: 'The five yen coin is made of brass and has a distinctive hole in the center. It depicts ears of rice, waves, and a gear on the obverse side, symbolizing agriculture, fisheries, and industry in Japan.'
    },
    jpy10: {
        title: '10 JPY',
        text: 'The ten yen coin is made of bronze and features the Byodo-in Phoenix Hall on the obverse side. There are both milled and smooth edge variations.'
    },
    jpy50: {
        title: '50 JPY',
        text: 'The fifty yen coin is made of cupronickel and has a central hole. It features a chrysanthemum flower on the obverse.'
    },
    jpy100: {
        title: '100 JPY',
        text: 'The one hundred yen coin is made of cupronickel and features a cherry blossom motif on the obverse.'
    },
    jpy500: {
        title: '500 JPY',
        text: 'The five hundred yen coin is the highest denomination coin in Japan, made of nickel-brass.'
    },
    jpy1000: {
        title: '1000 JPY',
        text: 'The one thousand yen banknote is the smallest denomination of Japanese yen banknotes.'
    },
    jpy5000: {
        title: '5000 JPY',
        text: 'The five thousand yen banknote features the portrait of Ichiyo Higuchi on the obverse.'
    },
    jpy10000: {
        title: '10000 JPY',
        text: 'The ten thousand yen banknote is the highest denomination of Japanese yen banknotes.'
    },
    twd1: {
        title: '1 TWD',
        text: 'The one yuan coin is the smallest denomination coin, made of an aluminum alloy.'
    },
    twd5: {
        title: '5 TWD',
        text: 'The five yuan coin is made from a copper-nickel alloy.'
    },
    twd10: {
        title: '10 TWD',
        text: 'The ten yuan coin is also made from a copper-nickel alloy.'
    },
    twd50: {
        title: '50 TWD',
        text: 'The fifty yuan coin is made from a copper-nickel alloy.'
    },
    twd100: {
        title: '100 TWD',
        text: 'The one hundred yuan coin is the highest denomination coin.'
    },
    twd500: {
        title: '500 TWD',
        text: 'The 500 yuan banknote is brown and features a scene of children playing baseball.'
    },
    twd1000: {
        title: '1000 TWD',
        text: 'The 1000 yuan banknote is blue and features a classroom scene with children.'
    }
 };
 
 // 通貨タイプの定義
 const CURRENCY_TYPES = {
    JPY: {
        denominations: [1, 5, 10, 50, 100, 500, 1000, 5000, 10000],
        path: 'JPY'
    },
    TWD: {
        denominations: [1, 5, 10, 50, 100, 500, 1000],
        path: 'TWD'
    }
 };
 

// 画像URLを生成する関数を修正
function getImageUrl(currency) {
    const type = currency.slice(0, 3).toUpperCase();
    const value = currency.slice(3);
    return `${STATIC_URL}${type}/${value}.jpg`;
}

/**
* 画像読み込みエラー時のハンドラー
*/
function handleImageError(img) {
    console.error('Image load failed:', img.src);
    img.onerror = null;
    const placeholder = img.dataset.placeholder || `${STATIC_URL}placeholder.jpg`;
    img.src = placeholder;
}

/**
* 通貨情報を設定する関数
*/
function setCurrency(currency) {
    const currencyData = CURRENCY_DESCRIPTIONS[currency];
    if (!currencyData) return;

    const titleElement = document.getElementById('currencyTitle');
    const textElement = document.getElementById('currencyText');
    const imageElement = document.getElementById('currencyImage');

    titleElement.textContent = currencyData.title;
    textElement.innerHTML = currencyData.text;

    const newImageUrl = getImageUrl(currency);
    if (imageElement.src !== newImageUrl) {
        imageElement.src = newImageUrl;
    }
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    const imageElement = document.getElementById('currencyImage');
    if (imageElement) {
        imageElement.onerror = function() {
            handleImageError(this);
        };
    }
    setCurrency('jpy1');
});