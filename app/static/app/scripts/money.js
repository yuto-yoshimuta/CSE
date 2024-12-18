// Currency data definitions
const CURRENCY_DESCRIPTIONS = {
    jpy1: { 
        title: '1 JPY', 
        text: 'Japan\'s currency system was completely revamped in 1871 during the Meiji era as part of the broader modernization reforms.<br><br>Prior to this, complex forms of currency such as "mon" and "ryō" were used during the Edo period.<br>However, with the push for modernization, new units for currency such as "yen," "sen," and "rin" were introduced, drawing influence from Western currency systems to streamline domestic and international transactions.'
    },
    jpy5: {
        title: '5 JPY',
        text: 'Japanese 5-yen coin was first issued in 1871 when the country introduced a new currency system. At this time, Japan abolished the complex currencies used during the Edo period, such as "mon" and "ryo," and established new monetary units based on Western currency systems. Among these, the 5-yen coin was chosen as a denomination suitable for small transactions in daily economic activities.The first 5-yen coins were made of copper, and their size and design evolved over time in response to changes in Japanese society and the economy. The 5-yen denomination was intended for everyday use in purchases, public utility payments, and other small-scale transactions, making it widely used across Japan.'
    },
    jpy10: {
        title: '10 JPY',
        text: 'The 10-yen coin was first issued in 1871, as part of Japanese new currency system introduced during the Meiji era. This reform aimed to modernize Japanese economy by adopting a Western-style monetary system. Prior to this, Japan used complex traditional currency units like "mon" and "ryo," but these were abolished, and the yen became the new standard unit of currency.The 10-yen coin was introduced as a relatively small denomination, designed for everyday transactions and small payments. Initially, it was widely used for commercial activities, public service payments, and daily shopping, playing an essential role in the currency system and circulating extensively.'
    },
    jpy50: {
        title: '50 JPY',
        text: 'The 50 yen coin was first issued in Japan in 1967. This year marked a major revision in Japanese currency system as new coins were introduced following a redesign of the previous currency. Prior to this, Japan’s currency consisted of smaller denominations like the 1 yen, 5 yen, and 10 yen coins. However, the introduction of the 50 yen coin was intended to address the need for a more convenient coin for everyday transactions.As Japan’s economy grew and prices increased, the existing coins of 1 yen and 5 yen were insufficient for handling larger amounts. Therefore, the 50 yen coin was introduced as a practical medium for payments in daily life. This coin filled the gap between the 10 yen coin and larger denominations and quickly became an essential part of the currency used by ordinary citizens.'
    },
    jpy100: {
        title: '100 JPY',
        text: 'The 100 yen coin was first issued in 1871 when Japan introduced the yen currency system as part of the Meiji era monetary reforms. The introduction of the yen was aimed at replacing the complex feudal-era currency system, which included units like "mon" and "ryo," with a more efficient currency model inspired by Western monetary systems. The yen system was intended to standardize and simplify financial transactions across Japan. Among the various denominations, the 100 yen coin was positioned as a medium-value currency, intended for use in everyday transactions.The first 100 yen coins were made of gold, selected according to the economic conditions of the time. However, as the economy evolved, the materials used for the 100 yen coin underwent several changes. Initially, the coin was primarily used for commercial transactions and payments between government entities.'
    },
    jpy500: {
        title: '500 JPY',
        text: 'The 500 yen coin was first issued in Japan in 1982. Prior to this, the highest denomination of coin in circulation was the 100 yen coin, and the 500 yen coin was introduced to accommodate larger transactions. This coin was expected to play an important role in economic activities and gained significant attention from the start.The introduction of high-denomination coins in Japan became necessary as the economy grew and the price of goods and services increased, leading to larger monetary transactions. Particularly in the late 1970s and early 1980s, Japanese economy transitioned from a period of rapid growth to a phase of price inflation, which made higher denomination coins necessary for efficient transactions. Against this backdrop, the 500 yen coin was introduced to facilitate smoother currency circulation and to serve as a practical means for paying for large transactions or fees.'
    },
    jpy1000: {
        title: '1000 JPY',
        text: 'The 1000 yen bill was first issued in 1871, following the introduction of Japanese new currency system. This was part of a broader economic development during the Meiji era, which aimed to streamline daily transactions and promote economic growth. Before the Meiji period, Japan used complex currency units such as "ryo" and "mon" during the Edo period. However, the new currency system adopted the "yen" as a standard unit of exchange, modeled after Western monetary systems.The introduction of the 1000 yen bill marked a significant step in Japanese economic modernization and the expansion of the money supply. As Japan advanced economically, there was a need for higher-denomination currency to facilitate larger transactions both domestically and internationally. Initially, the 1000 yen bill was primarily used for commercial transactions and government payments, making it a critical element in economic activities, even though it was not commonly used in daily life.'
    },
    jpy5000: {
        title: '5000 JPY',
        text: 'he 5000 yen bill was first issued in 1949 as part of Japanese post-war currency reform aimed at stabilizing the value of the yen. This was especially important during a time of ongoing inflation, which made the need for higher denomination currency more apparent. Before the war, there was no 5000 yen bill in circulation, but as Japan recovered economically and prices increased, the 5000 yen bill was introduced.The introduction of the 5000 yen bill is closely linked to the transformation of Japan’s economy during that period. Due to the impact of the war, the designs and denominations of paper money changed significantly, and new bills were issued to align with the economic activities of the time as a way to combat inflation. As a result, the 5000 yen bill became an essential part of the currency system and played an important role in supporting Japanese economic growth.'
    },
    jpy10000: {
        title: '10000 JPY',
        text: 'The 10,000 yen banknote was first issued by the Bank of Japan in 1946. It was introduced as part of the post-war economic reforms and currency restructuring. Before World War II, Japan followed a gold standard, where the value of currency was guaranteed by gold reserves. However, after the war, Japan faced extreme inflation and economic instability, making it necessary to adopt a new monetary system.As a result, the Bank of Japan introduced the new "yen" unit in 1946 and issued the 10,000 yen banknote. This new currency played a crucial role in supporting Japanese economic recovery. At that time, the 10,000 yen denomination was considered large and was mainly used for large-scale transactions, commercial activities, and trade settlements.'
    },
    twd1: {
        title: '1 TWD',
        text: 'Taiwanese currency system was established after passing through various stages, from the Qing Dynasty to the Japanese colonial period, and finally, after the relocation of the Republic of China government in 1949. The introduction of the Taiwan Dollar (NTD) was part of the efforts to stabilize the economy and unify the currency after World War II. Prior to this, many different currencies were circulating in Taiwan, so the "Central Bank of the Republic of China, Taiwan Branch" was established to centralize currency issuance. The Taiwan Dollar introduced in 1949 was based on the Japanese yen used during the Japanese colonial era but adopted its own unique design and structure.'
    },
    twd5: {
        title: '5 TWD',
        text: 'The 5 New Taiwan Dollar (NTD) coin is an important currency in Taiwan, serving as one of the small denominations in everyday transactions. The New Taiwan Dollar (NTD), introduced in 1949 after the Chinese Civil War, replaced the Old Taiwan Dollar (NTD), which had suffered from severe inflation. The issuance of the 5 NTD coin became an essential part of Taiwan’s monetary system in the context of the country economic recovery and modernization during the mid-20th century.The 5 NTD coin was introduced in 1961, marking a significant development in Taiwan’s coinage. It was initially issued in a larger size and primarily made of copper, which was chosen due to its affordability and durability.'
    },
    twd10: {
        title: '10 TWD',
        text: 'The 10 Taiwan dollar coin was introduced in 1961 as part of Taiwanese currency reform during the Republic of China era. The reform sought to stabilize the economy after the upheavals caused by the Chinese Civil War and the loss of Chinese mainland to the People Republic of China. Before the 1961 reform, Taiwan’s currency was based on the Old Taiwan Dollar, which had experienced inflation and devaluation.The introduction of the 10-dollar coin came after Taiwanese economic recovery, fueled by the industrialization efforts, foreign aid, and strong trade relations with the United States. The new coin was designed to facilitate transactions in a rapidly growing economy.'
    },
    twd50: {
        title: '50 TWD',
        text: 'The 50 Taiwanese dollar coin is one of the important denominations in Taiwan’s currency system. The Taiwan dollar (NTD, or 新台幣, Xīn táibì) has undergone various changes throughout Taiwan’s history, particularly in relation to its economic growth and shifts in global trade. The coin itself was introduced in 1981 as part of a series of new coin denominations to better cater to the growing economy and the demand for currency that reflected the modernizing nation.Prior to the introduction of the 50-dollar coin, Taiwan’s currency system primarily relied on banknotes for higher denominations.'
    },
    twd100: {
        title: '100 TWD',
        text: 'The New Taiwan Dollar (NTD), the official currency of Taiwan, was introduced in 1949 after the Chinese Civil War, replacing the Old Taiwan Dollar. The introduction of the New Taiwan Dollar was part of Taiwanese efforts to stabilize its economy following the disruptions caused by the war and the political upheavals at the time. The 100 Taiwan Dollar note was one of the key denominations that was issued as part of this new currency system.'
    },
    twd500: {
        title: '500 TWD',
        text: 'The 500 Taiwan dollar bill (NT$500) is one of the higher denominations in Taiwanese currency system, which is known as the New Taiwan Dollar (NTD). The currency was first introduced in 1949, when the Republic of China (ROC) government began issuing the New Taiwan Dollar to replace the Old Taiwan Dollar following the Chinese Civil War. This was part of a broader effort to stabilize the economy and introduce a new currency system.'
    },
    twd1000: {
        title: '1000 TWD',
        text: 'The Taiwanese dollar (NTD), officially known as the "New Taiwan Dollar" (新台幣), has been the official currency of Taiwan since 1949, following the retreat of the Republic of China (ROC) government to Taiwan during the Chinese Civil War. The 1000-dollar banknote is one of the higher denominations in circulation, and it represents a significant part of Taiwanese currency system.The 1000-dollar note is often used in major transactions, including large purchases, business dealings, and bank savings. It plays a crucial role in the daily economic activities of the nation, serving as a symbol of Taiwanese stable financial system.'
    }
 };
 
// Currency type definitions
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

// Function to generate image URL
function getImageUrl(currency) {
    const type = currency.slice(0, 3).toUpperCase();
    const value = currency.slice(3);
    return `${STATIC_URL}${type}/${value}.jpg`;
}

/**
 * Image error handler
 * Handles cases where the image fails to load
 * @param {HTMLImageElement} img - The image element that failed to load
 */
function handleImageError(img) {
    console.error('Image load failed:', img.src);
    img.onerror = null;
    const placeholder = img.dataset.placeholder || `${STATIC_URL}placeholder.jpg`;
    img.src = placeholder;
}

/**
 * Set currency information
 * Updates the display with information for the selected currency
 * @param {string} currency - The currency code (e.g., 'jpy1', 'twd1')
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const imageElement = document.getElementById('currencyImage');
    if (imageElement) {
        imageElement.onerror = function() {
            handleImageError(this);
        };
    }
    setCurrency('jpy1');
});