// グローバル変数の設定
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const send = document.getElementById('send');
const loading = document.getElementById('loading');
let isProcessing = false;
let currentConversationId = null;

// Markedの設定
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false
});

/**
 * メッセージを追加する関数
 * @param {string} text - メッセージテキスト
 * @param {boolean} isUser - ユーザーのメッセージかどうか
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

        // コードブロックのシンタックスハイライト（オプション）
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
 * SSEデータをパースする関数
 * @param {string} line - SSEデータライン
 * @returns {Object|null} パースされたデータまたはnull
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
 * ストリームレスポンスを処理する関数
 * @param {Response} response - フェッチレスポンス
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
        addMessage('エラーが発生しました。もう一度お試しください。', false);
    }
}

/**
 * メッセージを処理する関数
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

        // グローバル変数からURLを取得
        const askUrl = window.ASK_URL;
        // CSRFトークンを隠しフィールドから取得
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
        addMessage('エラーが発生しました。もう一度お試しください。', false);
    } finally {
        isProcessing = false;
        send.disabled = false;
        loading.style.display = 'none';
    }
}

/**
 * チャットをリフレッシュする関数
 */
function refreshChat() {
    currentConversationId = null;
    chat.innerHTML = '';
    // ハードコードされたメッセージの代わりにサーバーから受け取ったメッセージを使用
    addMessage(window.INITIAL_MESSAGE || 'Hello! Please ask your question.', false);
    input.focus();
}

/**
 * テキストエリアの高さを調整する関数
 */
function adjustTextareaHeight() {
    input.style.height = 'auto';
    input.style.height = (input.scrollHeight) + 'px';
}

/**
 * CSRFトークンを取得する関数
 * @param {string} name - クッキー名
 * @returns {string} CSRFトークン
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// イベントリスナーの設定
input.addEventListener('input', adjustTextareaHeight);

send.addEventListener('click', handleMessage);

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleMessage();
    }
});

// モバイルデバイスでの表示調整
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

// ページ離脱時の処理
window.addEventListener('beforeunload', () => {
    if (isProcessing) {
        return '会話が進行中です。本当にページを離れますか？';
    }
});

// デバッグモード（開発時のみ）
const DEBUG = false;
if (DEBUG) {
    window.debugChat = {
        getCurrentConversation: () => currentConversationId,
        clearChat: refreshChat,
        getMessageCount: () => chat.children.length
    };
}