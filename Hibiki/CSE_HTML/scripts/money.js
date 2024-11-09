function setCurrency(currency) {
    const currencyData = {
        jpy1: { 
            title: '1 JPY', 
            text: 'Japan\'s currency system was completely revamped in 1871 during the Meiji era as part of the broader modernization reforms.<br><br>Prior to this, complex forms of currency such as "mon" and "ryō" were used during the Edo period.<br>However, with the push for modernization, new units for currency such as "yen," "sen," and "rin" were introduced, drawing influence from Western currency systems to streamline domestic and international transactions.', 
            image: 'assets/JPY/1.jpg' 
          },
        jpy5: { title: '5 JPY', text: 'The five yen coin is made of brass and has a distinctive hole in the center. It depicts ears of rice, waves, and a gear on the obverse side, symbolizing agriculture, fisheries, and industry in Japan.', image: 'assets/JPY/5.jpg' },
        jpy10: { title: '10 JPY', text: 'The ten yen coin is made of bronze and features the Byodo-in Phoenix Hall on the obverse side. There are both milled and smooth edge variations.', image: 'assets/JPY/10.jpg' },
        jpy50: { title: '50 JPY', text: 'The fifty yen coin is made of cupronickel and has a central hole. It features a chrysanthemum flower on the obverse.', image: 'assets/JPY/50.jpg' },
        jpy100: { title: '100 JPY', text: 'The one hundred yen coin is made of cupronickel and features a cherry blossom motif on the obverse.', image: 'assets/JPY/100.jpg' },
        jpy500: { title: '500 JPY', text: 'The five hundred yen coin is the highest denomination coin in Japan, made of nickel-brass.', image: 'assets/JPY/500.jpg' },
        jpy1000: { title: '1000 JPY', text: 'The one thousand yen banknote is the smallest denomination of Japanese yen banknotes.', image: 'assets/JPY/1000.jpg' },
        jpy5000: { title: '5000 JPY', text: 'The five thousand yen banknote features the portrait of Ichiyo Higuchi on the obverse.', image: 'assets/JPY/5000.jpg' },
        jpy10000: { title: '10000 JPY', text: 'The ten thousand yen banknote is the highest denomination of Japanese yen banknotes.', image: 'assets/JPY/10000.jpg' },
        twd1: { title: '1 NTD', text: 'The one yuan coin is the smallest denomination coin, made of an aluminum alloy.', image: 'assets/TWD/1.jpg' },
        twd5: { title: '5 NTD', text: 'The five yuan coin is made from a copper-nickel alloy.', image: 'assets/TWD/5.jpg' },
        twd10: { title: '10 NTD', text: 'The ten yuan coin is also made from a copper-nickel alloy.', image: 'assets/TWD/10.jpg' },
        twd50: { title: '50 NTD', text: 'The fifty yuan coin is made from a copper-nickel alloy.', image: 'assets/TWD/50.jpg' },
        twd100: { title: '100 NTD', text: 'The one hundred yuan coin is the highest denomination coin.', image: 'assets/TWD/100.jpg' },
        twd500: { title: '500 NTD', text: 'The 500 yuan banknote is brown and features a scene of children playing baseball.', image: 'assets/TWD/500.jpg' },
        twd1000: { title: '1000 NTD', text: 'The 1000 yuan banknote is blue and features a classroom scene with children.', image: 'assets/TWD/1000.jpg' }
    };
    
    document.getElementById('currencyTitle').innerText = currencyData[currency].title;
    document.getElementById('currencyText').innerHTML = currencyData[currency].text; // innerHTMLを使用
    document.getElementById('currencyImage').src = currencyData[currency].image;
}
