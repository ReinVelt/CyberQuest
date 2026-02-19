/**
 * Chat Interface System
 * Simulates Meshtastic, Signal, BBS communications
 * Supports different styles and timed message delivery
 */

class ChatInterface {
    constructor(game) {
        this.game = game;
        this.isOpen = false;
        this.currentConversation = null;
        this.conversations = {}; // Store conversations by ID
        this.messageQueue = [];
        this.isTyping = false;
        this._escHandler = null; // Track ESC handler for cleanup
    }

    /**
     * Sanitize text for safe HTML insertion (prevent XSS).
     * @param {string} text
     * @returns {string}
     */
    _sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show a chat conversation
     * @param {Object} config - Conversation configuration
     * @param {string} config.id - Unique conversation identifier
     * @param {string} config.type - Chat type: 'signal', 'meshtastic', 'bbs'
     * @param {string} config.contact - Contact name
     * @param {string} config.contactSubtitle - Optional subtitle (phone number, call sign, BBS handle)
     * @param {Array} config.messages - Initial messages array
     * @param {boolean} config.allowReply - Whether player can reply (future feature)
     * @param {Function} config.onOpen - Optional callback when conversation opens
     * @param {Function} config.onClose - Optional callback when conversation closes
     */
    showConversation(config) {
        if (!config || !config.id || !config.type || !config.contact) {
            console.error('showConversation: config must include id, type, and contact', config);
            return;
        }

        // Synchronously remove old UI to avoid close race condition
        if (this.isOpen) {
            this._removeEscHandler();
            const existing = document.getElementById('chat-interface');
            if (existing) existing.remove();
            this.isOpen = false;
        }

        this.currentConversation = {
            ...config,
            messages: config.messages || [],
            allowReply: config.allowReply || false,
            readMessages: new Set()
        };

        // Store conversation for later access
        this.conversations[config.id] = this.currentConversation;

        this.createChatUI();
        this.isOpen = true;

        // Display initial messages
        this.displayMessages();

        // Callback
        if (config.onOpen) {
            config.onOpen(this.game);
        }

        // Mark conversation as viewed
        this.game.setFlag(`chat_${config.id}_viewed`, true);
    }

    /**
     * Add a message to an existing conversation
     * @param {string} conversationId - Conversation ID
     * @param {Object} message - Message object
     * @param {boolean} immediate - Display immediately if conversation is open
     */
    addMessage(conversationId, message, immediate = false) {
        const conversation = this.conversations[conversationId];
        if (!conversation) {
            console.error(`Conversation ${conversationId} not found`);
            return;
        }

        conversation.messages.push(message);

        // If conversation is currently open, display the new message
        if (immediate && this.isOpen && this.currentConversation.id === conversationId) {
            this.displaySingleMessage(message, true);
        }
    }

    /**
     * Send messages with timing (for dramatic story delivery)
     * @param {string} conversationId - Conversation ID
     * @param {Array} messages - Messages to send
     * @param {number} delayBetween - Delay in ms between messages
     */
    async sendMessagesWithDelay(conversationId, messages, delayBetween = 2000) {
        for (const message of messages) {
            // Stop if chat was closed mid-sequence
            if (!this.isOpen || this.currentConversation?.id !== conversationId) break;

            // Show typing indicator
            if (this.isOpen && this.currentConversation?.id === conversationId) {
                this.showTypingIndicator(message.from !== 'Ryan');
            }

            // Wait for delay
            await this.game.wait(delayBetween);

            // Hide typing indicator and add message
            if (this.isOpen && this.currentConversation?.id === conversationId) {
                this.hideTypingIndicator();
            } else {
                break; // Chat closed during delay
            }

            this.addMessage(conversationId, message, true);
        }
    }

    /**
     * Create the chat UI based on type
     */
    createChatUI() {
        // Remove existing chat if any
        const existing = document.getElementById('chat-interface');
        if (existing) {
            existing.remove();
        }

        const chat = document.createElement('div');
        chat.id = 'chat-interface';
        chat.className = `chat-${this.currentConversation.type}`;
        chat.innerHTML = this.getChatHTML();
        
        this.applyStyles(chat);
        document.body.appendChild(chat);

        // Attach event listeners
        this.attachEventListeners();

        // Prevent clicks from propagating
        chat.addEventListener('click', (e) => e.stopPropagation());
    }

    /**
     * Generate HTML for chat interface
     */
    getChatHTML() {
        const conv = this.currentConversation;
        const styleClass = this.getStyleClass(conv.type);

        let headerIcon = this.getHeaderIcon(conv.type);
        let subtitle = conv.contactSubtitle ? `<div class="chat-contact-subtitle">${conv.contactSubtitle}</div>` : '';

        return `
            <div class="chat-container ${styleClass}">
                <div class="chat-header">
                    <div class="chat-header-left">
                        <span class="chat-icon">${headerIcon}</span>
                        <div class="chat-contact-info">
                            <div class="chat-contact-name">${conv.contact}</div>
                            ${subtitle}
                        </div>
                    </div>
                    <button class="chat-close" id="chat-close-btn">✕</button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <!-- Messages will be added here -->
                </div>
                <div class="chat-typing-indicator hidden" id="chat-typing">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
                ${conv.allowReply ? this.getReplyInputHTML() : ''}
            </div>
        `;
    }

    /**
     * Get reply input HTML (for future interactivity)
     */
    getReplyInputHTML() {
        return `
            <div class="chat-input-area">
                <input 
                    type="text" 
                    id="chat-input" 
                    class="chat-input" 
                    placeholder="Type a message..."
                    autocomplete="off"
                />
                <button class="chat-send-btn" id="chat-send-btn">Send</button>
            </div>
        `;
    }

    /**
     * Display all messages
     */
    displayMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        container.innerHTML = '';

        this.currentConversation.messages.forEach(message => {
            this.displaySingleMessage(message, false);
        });

        // Scroll to bottom
        this.scrollToBottom();
    }

    /**
     * Display a single message
     * @param {Object} message - Message object
     * @param {boolean} animate - Whether to animate the message
     */
    displaySingleMessage(message, animate = false) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const isOutgoing = message.from === 'Ryan';
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${isOutgoing ? 'outgoing' : 'incoming'}${animate ? ' animate-in' : ''}`;

        let timestamp = '';
        if (message.timestamp) {
            timestamp = `<div class="message-timestamp">${message.timestamp}</div>`;
        }

        messageEl.innerHTML = `
            <div class="message-bubble">
                ${!isOutgoing ? `<div class="message-sender">${message.from}</div>` : ''}
                <div class="message-text">${this.formatMessageText(message.text)}</div>
                ${timestamp}
            </div>
        `;

        container.appendChild(messageEl);
        this.scrollToBottom();

        // Mark as read
        this.currentConversation.readMessages.add(message);
    }

    /**
     * Format message text (support for line breaks, code blocks, etc.)
     * Text is sanitized to prevent XSS.
     */
    formatMessageText(text) {
        if (!text) return '';
        const safe = this._sanitizeHTML(text);
        return safe
            .replace(/\n/g, '<br>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator(show = true) {
        const indicator = document.getElementById('chat-typing');
        if (indicator) {
            if (show) {
                indicator.classList.remove('hidden');
                this.scrollToBottom();
            } else {
                indicator.classList.add('hidden');
            }
        }
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        this.showTypingIndicator(false);
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        const container = document.getElementById('chat-messages');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 50);
        }
    }

    /**
     * Get style class for chat type
     */
    getStyleClass(type) {
        return `chat-style-${type}`;
    }

    /**
     * Get header icon for chat type
     */
    getHeaderIcon(type) {
        const icons = {
            signal: '🔒',
            meshtastic: '📡',
            bbs: '💻'
        };
        return icons[type] || '💬';
    }

    /**
     * Apply CSS styles
     */
    applyStyles(chat) {
        chat.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 10002;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: fadeIn 0.3s ease;
        `;

        // Add embedded styles
        const styleSheet = document.createElement('style');
        styleSheet.id = 'chat-interface-styles';
        styleSheet.textContent = this.getChatStyles();
        
        // Remove old styles if they exist
        const oldStyles = document.getElementById('chat-interface-styles');
        if (oldStyles) oldStyles.remove();
        
        document.head.appendChild(styleSheet);
    }

    /**
     * Get comprehensive chat styles
     */
    getChatStyles() {
        return `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .chat-container {
                background: #1a1a1a;
                border: 2px solid #444;
                border-radius: 12px;
                width: 90%;
                max-width: 600px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
                overflow: hidden;
            }

            /* Signal Style (Modern, secure messaging) */
            .chat-style-signal {
                border-color: #2090ea;
            }

            .chat-style-signal .chat-header {
                background: #2090ea;
            }

            .chat-style-signal .outgoing .message-bubble {
                background: #2090ea;
                color: white;
            }

            .chat-style-signal .incoming .message-bubble {
                background: #2a2a2a;
                color: #e0e0e0;
            }

            /* Meshtastic Style (Tech, off-grid) */
            .chat-style-meshtastic {
                border-color: #00ff88;
                font-family: 'Courier New', monospace;
            }

            .chat-style-meshtastic .chat-header {
                background: #0a0a0a;
                border-bottom: 2px solid #00ff88;
            }

            .chat-style-meshtastic .outgoing .message-bubble {
                background: rgba(0, 255, 136, 0.2);
                border: 1px solid #00ff88;
                color: #00ff88;
            }

            .chat-style-meshtastic .incoming .message-bubble {
                background: rgba(0, 136, 255, 0.2);
                border: 1px solid #0088ff;
                color: #0088ff;
            }

            /* BBS Style (Retro terminal) */
            .chat-style-bbs {
                border-color: #00ff00;
                background: #000;
                font-family: 'Courier New', monospace;
            }

            .chat-style-bbs .chat-header {
                background: #000;
                border-bottom: 2px solid #00ff00;
                color: #00ff00;
            }

            .chat-style-bbs .chat-messages {
                background: #000;
            }

            .chat-style-bbs .outgoing .message-bubble {
                background: transparent;
                border: 1px solid #00ff00;
                color: #00ff00;
            }

            .chat-style-bbs .incoming .message-bubble {
                background: transparent;
                border: 1px solid #00ff00;
                color: #00ff00;
            }

            /* Header */
            .chat-header {
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chat-header-left {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .chat-icon {
                font-size: 28px;
            }

            .chat-contact-name {
                font-weight: bold;
                font-size: 1.1rem;
                color: white;
            }

            .chat-contact-subtitle {
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.7);
                margin-top: 2px;
            }

            .chat-close {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                transition: all 0.2s;
            }

            .chat-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }

            /* Messages Area */
            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #0f0f0f;
            }

            .chat-messages::-webkit-scrollbar {
                width: 8px;
            }

            .chat-messages::-webkit-scrollbar-track {
                background: #1a1a1a;
            }

            .chat-messages::-webkit-scrollbar-thumb {
                background: #444;
                border-radius: 4px;
            }

            /* Message Bubbles */
            .chat-message {
                display: flex;
                margin-bottom: 15px;
            }

            .chat-message.incoming {
                justify-content: flex-start;
            }

            .chat-message.outgoing {
                justify-content: flex-end;
            }

            .chat-message.animate-in {
                animation: slideUp 0.3s ease;
            }

            .message-bubble {
                max-width: 75%;
                padding: 12px 16px;
                border-radius: 18px;
                word-wrap: break-word;
            }

            .message-sender {
                font-size: 0.8rem;
                font-weight: bold;
                margin-bottom: 4px;
                opacity: 0.8;
            }

            .message-text {
                line-height: 1.4;
            }

            .message-text code {
                background: rgba(255, 255, 255, 0.1);
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
            }

            .message-timestamp {
                font-size: 0.75rem;
                opacity: 0.6;
                margin-top: 4px;
            }

            /* Typing Indicator */
            .chat-typing-indicator {
                padding: 10px 20px;
                display: flex;
                gap: 5px;
                align-items: center;
            }

            .chat-typing-indicator.hidden {
                display: none;
            }

            .typing-dot {
                width: 8px;
                height: 8px;
                background: #888;
                border-radius: 50%;
                animation: typingBounce 1.4s infinite;
            }

            .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typingBounce {
                0%, 60%, 100% {
                    transform: translateY(0);
                }
                30% {
                    transform: translateY(-10px);
                }
            }

            /* Input Area */
            .chat-input-area {
                padding: 15px;
                background: #1a1a1a;
                border-top: 1px solid #333;
                display: flex;
                gap: 10px;
            }

            .chat-input {
                flex: 1;
                background: #0f0f0f;
                border: 1px solid #444;
                color: #fff;
                padding: 12px 15px;
                border-radius: 20px;
                font-size: 1rem;
                font-family: inherit;
            }

            .chat-input:focus {
                outline: none;
                border-color: #2090ea;
            }

            .chat-send-btn {
                background: #2090ea;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 20px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.2s;
            }

            .chat-send-btn:hover {
                background: #1880da;
            }
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const closeBtn = document.getElementById('chat-close-btn');
        if (closeBtn) {
            const closeHandler = (e) => { e.preventDefault(); this.close(); };
            closeBtn.addEventListener('click', closeHandler);
            closeBtn.addEventListener('touchend', closeHandler);
        }

        // ESC to close (tracked for cleanup)
        this._removeEscHandler();
        this._escHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };
        document.addEventListener('keydown', this._escHandler);

        // Send button (if reply is enabled)
        const sendBtn = document.getElementById('chat-send-btn');
        if (sendBtn) {
            const sendHandler = (e) => { e.preventDefault(); this.sendReply(); };
            sendBtn.addEventListener('click', sendHandler);
            sendBtn.addEventListener('touchend', sendHandler);
        }

        const input = document.getElementById('chat-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendReply();
                }
            });
        }
    }

    /**
     * Send a reply (future feature for interactive conversations)
     */
    sendReply() {
        const input = document.getElementById('chat-input');
        if (!input || !input.value.trim()) return;

        const message = {
            from: 'Ryan',
            text: input.value.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        this.displaySingleMessage(message, true);
        input.value = '';

        // Trigger any reply handler
        if (this.currentConversation.onReply) {
            this.currentConversation.onReply(message, this.game);
        }
    }

    /**
     * Remove the tracked ESC key handler.
     */
    _removeEscHandler() {
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
    }

    /**
     * Close the chat interface
     */
    close() {
        this._removeEscHandler();

        const chat = document.getElementById('chat-interface');
        if (chat) {
            chat.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => chat.remove(), 300);
        }

        // Callback
        if (this.currentConversation?.onClose) {
            try {
                this.currentConversation.onClose(this.game);
            } catch (err) {
                console.error('Error in chat onClose callback:', err);
            }
        }

        this.isOpen = false;
        this.currentConversation = null;
    }

    /**
     * Check if conversation has been viewed
     */
    hasViewed(conversationId) {
        return this.game.getFlag(`chat_${conversationId}_viewed`);
    }

    /**
     * Get conversation by ID
     */
    getConversation(conversationId) {
        return this.conversations[conversationId];
    }
}

// Add fadeOut animation
const chatFadeOut = document.createElement('style');
chatFadeOut.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(chatFadeOut);

// Export for use
window.ChatInterface = ChatInterface;
