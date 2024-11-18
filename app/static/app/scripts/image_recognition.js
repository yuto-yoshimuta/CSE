// Function to get CSRF token
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

const csrftoken = getCookie('csrftoken');

let stream = null;
let videoElement = document.getElementById('video_preview');
let processedVideo = document.getElementById('processed_video');
let canvas = document.getElementById('canvas');
let streamInterval;
let isProcessing = false;
let isStreamActive = false;

async function enumerateDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const select = document.getElementById('cameraSelect');
        
        select.innerHTML = '<option value="">Please select a camera</option>';
        
        videoDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${select.length}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Device enumeration error:", error);
        showError("Failed to enumerate cameras.");
    }
}

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        return enumerateDevices();
    })
    .catch(error => {
        console.error("Camera access error:", error);
        showError("Failed to access camera.");
    });

async function toggleCamera() {
    const startButton = document.getElementById('startButton');
    
    if (!isStreamActive) {
        await startCamera();
        startButton.textContent = 'Stop Camera';
        isStreamActive = true;
    } else {
        stopCamera();
        startButton.textContent = 'Start Camera';
        isStreamActive = false;
    }
}

async function startCamera() {
    const deviceId = document.getElementById('cameraSelect').value;
    if (!deviceId) {
        showError("Please select a camera.");
        return;
    }

    try {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: deviceId ? { exact: deviceId } : undefined,
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });
        
        videoElement.srcObject = stream;
        
        videoElement.onloadedmetadata = () => {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            startStreaming();
        };
        
        const response = await fetch('/start_camera/', {
            headers: {
                'X-CSRFToken': csrftoken
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to start camera on server');
        }
        
        document.getElementById('errorMessage').style.display = 'none';
        
    } catch (error) {
        console.error("Camera access error:", error);
        showError("Failed to access camera.");
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (streamInterval) {
        clearInterval(streamInterval);
    }
    
    videoElement.srcObject = null;
    processedVideo.src = '';
    
    // Reset totals
    globalJpyTotal = 0;
    globalTwdTotal = 0;
    updateDetectionResults({ predictions: [] });
}

function startStreaming() {
    const ctx = canvas.getContext('2d');
    
    if (streamInterval) {
        clearInterval(streamInterval);
    }
    
    streamInterval = setInterval(async () => {
        if (isProcessing) return;
        
        try {
            isProcessing = true;
            
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.8);
            });
            
            const response = await fetch('/video_feed/stream1', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                body: blob
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.image) {
                processedVideo.src = `data:image/jpeg;base64,${data.image}`;
            }
            
            updateDetectionResults(data);
            
        } catch (error) {
            console.error("Frame processing error:", error);
        } finally {
            isProcessing = false;
        }
        
    }, 100);
}

// Declare totals as global variables for debugging
let globalJpyTotal = 0;
let globalTwdTotal = 0;

let exchangeRates = {
    jpyToTwd: 0,
    twdToJpy: 0,
    usdJpy: 0,
    usdTwd: 0,
    lastUpdated: ''
};

function updateDetectionResults(data) {
    console.log('Received data:', data);

    let jpyTotal = 0;
    let twdTotal = 0;

    const detectedItems = document.getElementById('detectedItems');
    const jpyTotalElement = document.getElementById('jpyTotal');
    const twdTotalElement = document.getElementById('twdTotal');

    if (detectedItems) {
        detectedItems.innerHTML = '';
    }

    if (!jpyTotalElement || !twdTotalElement) {
        console.error('Total elements not found:', {
            jpyElement: jpyTotalElement,
            twdElement: twdTotalElement
        });
        return;
    }

    if (data.predictions && Array.isArray(data.predictions)) {
        console.log('Processing predictions:', data.predictions);
        
        data.predictions.forEach(pred => {
            const label = pred.class;
            const confidence = pred.confidence;
            
            console.log('Processing detection:', { label, confidence });

            if (detectedItems) {
                const item = document.createElement('div');
                item.className = 'detected-item';
                item.textContent = `${label} (${(confidence * 100).toFixed(1)}%)`;
                detectedItems.appendChild(item);
            }

            if (typeof label === 'string') {
                const twdMatch = label.match(/^twd_(\d+)$/i);
                if (twdMatch) {
                    const amount = parseInt(twdMatch[1], 10);
                    if (!isNaN(amount)) {
                        twdTotal += amount;
                        console.log(`TWD: Added ${amount}. New total: ${twdTotal}`);
                    }
                }
                else if (/^\d+$/.test(label)) {
                    const amount = parseInt(label, 10);
                    if (!isNaN(amount)) {
                        jpyTotal += amount;
                        console.log(`JPY: Added ${amount}. New total: ${jpyTotal}`);
                    }
                }
            }
        });
    }

    globalJpyTotal = jpyTotal;
    globalTwdTotal = twdTotal;

    jpyTotalElement.textContent = String(jpyTotal);
    twdTotalElement.textContent = String(twdTotal);

    updateConversionDisplay();
}

async function fetchExchangeRates() {
    try {
        const response = await fetch('/get_exchange_rates/');
        const data = await response.json();
        
        if (data.rates) {
            exchangeRates = {
                jpyToTwd: data.rates.JPY_TWD,
                twdToJpy: data.rates.TWD_JPY,
                lastUpdated: data.last_updated
            };
            
            updateRateDisplay();
            updateConversionDisplay();
            console.log('Exchange rates updated:', exchangeRates);
        }
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        showError("Failed to fetch exchange rates");
    }
}

function updateRateDisplay() {
    const rateDisplayHtml = `
        <div class="current-rates">
            <h4>Current Exchange Rates</h4>
            <div class="rate-grid">
                <div class="rate-item">
                    <span>1 JPY = ${(exchangeRates.jpyToTwd).toFixed(3)} TWD</span>
                </div>
                <div class="rate-item">
                    <span>1 TWD = ${(exchangeRates.twdToJpy).toFixed(3)} JPY</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('rateDisplay').innerHTML = rateDisplayHtml;
}

function updateConversionDisplay() {
    if (!exchangeRates.jpyToTwd || !exchangeRates.twdToJpy) {
        console.warn('Exchange rates not available');
        return;
    }

    const jpyInTwd = (globalJpyTotal * exchangeRates.jpyToTwd).toFixed(2);
    const twdInJpy = (globalTwdTotal * exchangeRates.twdToJpy).toFixed(2);

    let conversionResults = document.getElementById('conversionResults');
    if (!conversionResults) {
        conversionResults = document.createElement('div');
        conversionResults.id = 'conversionResults';
        document.querySelector('.detection-results').appendChild(conversionResults);
    }

    conversionResults.innerHTML = `
        <div class="conversion-results">
            <div class="conversion-box jpy">
                <h4>JPY to TWD</h4>
                <p>${globalJpyTotal} JPY = ${jpyInTwd} TWD</p>
            </div>
            <div class="conversion-box twd">
                <h4>TWD to JPY</h4>
                <p>${globalTwdTotal} TWD = ${twdInJpy} JPY</p>
            </div>
            <div class="last-updated">
                Last updated: ${exchangeRates.lastUpdated}
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchExchangeRates();
    setInterval(fetchExchangeRates, 60000);
});

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

window.checkDetection = function() {
    const currentDetections = document.getElementById('detectedItems').innerText;
    console.log('Current detections:', currentDetections);
    console.log('JPY Total:', document.getElementById('jpyTotal').textContent);
    console.log('TWD Total:', document.getElementById('twdTotal').textContent);
};