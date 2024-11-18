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

// Global variables
let stream = null;
let videoElement = document.getElementById('video_preview');
let processedVideo = document.getElementById('processed_video');
let canvas = document.getElementById('canvas');
let streamInterval;
let isProcessing = false;
let isStreamActive = false;
let globalCameraJpyTotal = 0;
let globalCameraTwdTotal = 0;
let globalImageJpyTotal = 0;
let globalImageTwdTotal = 0;

let exchangeRates = {
    jpyToTwd: 0,
    twdToJpy: 0,
    usdJpy: 0,
    usdTwd: 0,
    lastUpdated: ''
};

// Camera handling functions
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
    
    // Reset camera totals only
    globalCameraJpyTotal = 0;
    globalCameraTwdTotal = 0;
    updateDetectionResults({ predictions: [] }, 'camera');
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
            
            updateDetectionResults(data, 'camera');
            
        } catch (error) {
            console.error("Frame processing error:", error);
        } finally {
            isProcessing = false;
        }
        
    }, 100);
}

// Detection and results handling
function updateDetectionResults(data, source = 'camera') {
    console.log(`Received ${source} data:`, data);

    let jpyTotal = 0;
    let twdTotal = 0;

    const detectedItems = document.getElementById(source === 'camera' ? 'cameraDetectedItems' : 'imageDetectedItems');
    const jpyTotalElement = document.getElementById(source === 'camera' ? 'cameraJpyTotal' : 'imageJpyTotal');
    const twdTotalElement = document.getElementById(source === 'camera' ? 'cameraTwdTotal' : 'imageTwdTotal');

    if (detectedItems) {
        detectedItems.innerHTML = '';
    }

    if (!jpyTotalElement || !twdTotalElement) {
        console.error('Total elements not found:', {
            jpyElement: jpyTotalElement,
            twdElement: twdTotalElement,
            source: source
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

    if (source === 'camera') {
        globalCameraJpyTotal = jpyTotal;
        globalCameraTwdTotal = twdTotal;
    } else {
        globalImageJpyTotal = jpyTotal;
        globalImageTwdTotal = twdTotal;
    }

    jpyTotalElement.textContent = String(jpyTotal);
    twdTotalElement.textContent = String(twdTotal);

    updateConversionDisplay(source);
}

// Exchange rate handling
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
            updateConversionDisplay('camera');
            updateConversionDisplay('image');
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

function updateConversionDisplay(source = 'camera') {
    if (!exchangeRates.jpyToTwd || !exchangeRates.twdToJpy) {
        console.warn('Exchange rates not available');
        return;
    }

    const jpyTotal = source === 'camera' ? globalCameraJpyTotal : globalImageJpyTotal;
    const twdTotal = source === 'camera' ? globalCameraTwdTotal : globalImageTwdTotal;
    const jpyInTwd = (jpyTotal * exchangeRates.jpyToTwd).toFixed(2);
    const twdInJpy = (twdTotal * exchangeRates.twdToJpy).toFixed(2);

    const conversionResults = document.getElementById(source === 'camera' ? 'cameraConversionResults' : 'imageConversionResults');
    if (!conversionResults) {
        console.error(`Conversion results element not found for ${source}`);
        return;
    }

    conversionResults.innerHTML = `
        <div class="conversion-results">
            <div class="conversion-box jpy">
                <h4>JPY to TWD</h4>
                <p>${jpyTotal} JPY = ${jpyInTwd} TWD</p>
            </div>
            <div class="conversion-box twd">
                <h4>TWD to JPY</h4>
                <p>${twdTotal} TWD = ${twdInJpy} JPY</p>
            </div>
            <div class="last-updated">
                Last updated: ${exchangeRates.lastUpdated}
            </div>
        </div>
    `;
}

// Image Upload Handling
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');

dropZone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('dragover');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('dragover');
    });
});

dropZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
        showError('Please upload an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        analyzeImage(file);
    };
    reader.readAsDataURL(file);
}

async function analyzeImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/video_feed/stream1', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        });

        if (!response.ok) throw new Error('Analysis failed');

        const data = await response.json();
        updateDetectionResults(data, 'image');
        
        if (data.image) {
            imagePreview.src = `data:image/jpeg;base64,${data.image}`;
        }

    } catch (error) {
        console.error('Image analysis error:', error);
        showError('Failed to analyze image');
    }
}

// Utility functions
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

// Debug function
window.checkDetection = function() {
    console.log('Camera Detections:', document.getElementById('cameraDetectedItems').innerText);
    console.log('Camera JPY Total:', document.getElementById('cameraJpyTotal').textContent);
    console.log('Camera TWD Total:', document.getElementById('cameraTwdTotal').textContent);
    console.log('Image Detections:', document.getElementById('imageDetectedItems').innerText);
    console.log('Image JPY Total:', document.getElementById('imageJpyTotal').textContent);
    console.log('Image TWD Total:', document.getElementById('imageTwdTotal').textContent);
};

// Initialize exchange rates on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchExchangeRates();
    setInterval(fetchExchangeRates, 60000);
});