// Global variable initialization
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const send = document.getElementById('send');
const loading = document.getElementById('loading');
let isProcessing = false;
let currentConversationId = null;

// Marked configuration
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false
});

/**
 * Add a message to the chat
 * @param {string} text - Message text
 * @param {boolean} isUser - Whether the message is from the user
 */
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    const avatar = document.createElement('div');
    avatar.className = `avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`;
    avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

    const content = document.createElement('div');
    content.className = 'message-content';

    if (isUser) {
        content.textContent = text;
    } else {
        content.className += ' markdown-content';
        content.innerHTML = marked.parse(text);

        // Syntax highlighting for code blocks (optional)
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight;
}

/**
 * Parse SSE data stream
 * @param {string} line - SSE data line
 * @returns {Object|null} Parsed data or null
 */
function parseSSEData(line) {
    if (!line.startsWith('data: ')) return null;
    
    try {
        let jsonStr = line.replace(/^data:\s*data:\s*/, 'data: ');
        jsonStr = jsonStr.replace(/^data:\s*/, '');
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('Parse error:', e);
        return null;
    }
}

/**
 * Process stream response from server
 * @param {Response} response - Fetch response object
 */
async function processStreamResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentAnswer = '';
    let messageDiv = null;

    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim() === '' || line.trim() === 'event: ping') continue;

                const data = parseSSEData(line);
                if (!data) continue;

                if (data.conversation_id && !currentConversationId) {
                    currentConversationId = data.conversation_id;
                }

                if (data.event === 'message' && data.answer) {
                    if (!messageDiv) {
                        addMessage(data.answer, false);
                    } else {
                        const content = messageDiv.querySelector('.message-content');
                        content.innerHTML = marked.parse(data.answer);
                    }
                    currentAnswer = data.answer;
                }
            }
        }
    } catch (error) {
        console.error('Stream processing error:', error);
        addMessage('An error occurred. Please try again.', false);
    }
}

/**
 * Handle message submission
 */
async function handleMessage() {
    if (isProcessing) return;
    
    const message = input.value.trim();
    if (!message) return;

    try {
        isProcessing = true;
        send.disabled = true;
        loading.style.display = 'inline-block';
        addMessage(message, true);
        input.value = '';
        adjustTextareaHeight();

        // Get URL from global variable
        const askUrl = window.ASK_URL;
        // Get CSRF token from hidden field
        const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

        const response = await fetch(askUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                message,
                conversation_id: currentConversationId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await processStreamResponse(response);
    } catch (error) {
        console.error('Error:', error);
        addMessage('An error occurred. Please try again.', false);
    } finally {
        isProcessing = false;
        send.disabled = false;
        loading.style.display = 'none';
    }
}

/**
 * Refresh chat window
 */
function refreshChat() {
    currentConversationId = null;
    chat.innerHTML = '';
    // Use server-provided initial message instead of hardcoded one
    addMessage(window.INITIAL_MESSAGE || 'Hello! Please ask your question.', false);
    input.focus();
}

/**
 * Adjust textarea height based on content
 */
function adjustTextareaHeight() {
    input.style.height = 'auto';
    input.style.height = (input.scrollHeight) + 'px';
}

/**
 * Get CSRF token from cookies
 * @param {string} name - Cookie name
 * @returns {string} CSRF token
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Event listener setup
input.addEventListener('input', adjustTextareaHeight);

send.addEventListener('click', handleMessage);

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleMessage();
    }
});

// Mobile view adjustments
function adjustMobileView() {
    if (window.innerWidth <= 768) {
        chat.style.height = `${window.innerHeight - 180}px`;
    } else {
        chat.style.height = '';
    }
}

window.addEventListener('resize', adjustMobileView);
document.addEventListener('DOMContentLoaded', () => {
    adjustMobileView();
    refreshChat();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (isProcessing) {
        return 'Conversation is in progress. Are you sure you want to leave?';
    }
});

// Debug mode (development only)
const DEBUG = false;
if (DEBUG) {
    window.debugChat = {
        getCurrentConversation: () => currentConversationId,
        clearChat: refreshChat,
        getMessageCount: () => chat.children.length
    };
}