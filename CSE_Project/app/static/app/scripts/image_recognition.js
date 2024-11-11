// image_recognition.js

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
 
 function updateDetectionResults(data) {
    let jpyTotal = 0;
    let twdTotal = 0;
    const detectedItems = document.getElementById('detectedItems');
    detectedItems.innerHTML = '';
 
    if (data.predictions && Array.isArray(data.predictions)) {
        data.predictions.forEach(pred => {
            const item = document.createElement('div');
            item.className = 'detected-item';
            item.textContent = `${pred.class} (${(pred.confidence * 100).toFixed(1)}%)`;
            detectedItems.appendChild(item);
 
            const label = pred.class;
            if (label.match(/^\d+$/)) {
                jpyTotal += parseInt(label);
            } else if (label.match(/^twd_\$\d+$/)) {
                const amount = parseInt(label.match(/\d+/)[0]);
                twdTotal += amount;
            }
        });
    }
 
    document.getElementById('jpyTotal').textContent = jpyTotal.toLocaleString();
    document.getElementById('twdTotal').textContent = twdTotal.toLocaleString();
 }
 
 function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
 }
 
 window.onbeforeunload = function() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (streamInterval) {
        clearInterval(streamInterval);
    }
 };