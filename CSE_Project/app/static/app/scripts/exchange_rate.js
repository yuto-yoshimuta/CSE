/**
 * Get CSRF token from cookies
 * @returns {string|null} CSRF token value
 */
function getCsrfToken() {
    const name = 'csrftoken';
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

/**
 * Show/hide loading overlay
 * @param {boolean} show - Whether to show or hide the overlay
 */
function showLoading(show = true) {
    document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
}

/**
 * Update the conversion result display
 * @param {Object} data - Response data containing conversion results
 */
function updateConversionResult(data) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="conversion-result">
            <p class="result-text">${data.formatted_result}</p>
            <p class="rate-text">${data.formatted_rate}</p>
            <p class="conversion-time">Converted at: ${data.conversion_time} (Taipei Time)</p>
        </div>
    `;
}

/**
 * Handle form submission for currency conversion
 * @param {Event} event - Form submission event
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    showLoading(true);

    try {
        const form = event.target;
        const formData = new FormData(form);

        const response = await fetch('/convert/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCsrfToken()
            },
            body: formData
        });
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Conversion failed');
        }

        updateConversionResult(data);
    } catch (error) {
        document.getElementById('result').innerHTML = `
            <div class="error">Error: ${error.message}</div>
        `;
    } finally {
        showLoading(false);
    }
}

/**
 * Initialize form event listeners
 */
function initializeForm() {
    const form = document.getElementById('conversion-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.addEventListener('input', (event) => {
            const value = parseFloat(event.target.value);
            event.target.setCustomValidity(
                !value || value <= 0 ? 'Please enter a positive amount' : ''
            );
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeForm);