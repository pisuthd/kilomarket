"""
Interactive mode templates for KiloMarket Web Terminal
"""

from ..static import SUBMENU_JS
from .base import base_template

def interactive_mode_template() -> str:
    """Interactive mode page template"""
    additional_css = """
.session-info {
    font-size: 12px;
    color: #00cc00;
    margin-left: 10px;
}
.session-details {
    font-size: 11px;
    color: #888888;
    margin-left: 20px;
}
.loading {
    color: #ffff00;
    text-align: center;
    font-style: italic;
}
.empty-state { 
    color: #888888;
    font-style: italic; 
}
.menu-item .empty-state { 
    color: #888888 !important;
    font-style: italic !important;
    display: block !important;
}
.menu-item.selected .session-info {
    color: #000000 !important;
}
    """
    
    content = """
        <div class="terminal-header">
            <div class="title">INTERACTIVE MODE</div>
        </div>
        
        <div class="menu-container">
            <div class="menu">
                <div class="menu-header">Session Options</div>
                <div id="menuItems">
                    <div class="menu-item" data-action="new">Start New Session</div>
                    <div class="menu-item loading" id="loadingSessions">Loading recent sessions...</div>
                    <div id="sessionsList" style="display: none;">
                        <!-- Sessions will be loaded dynamically -->
                    </div>
                    <div class="menu-item" data-action="back">Back to Main Menu</div>
                </div>
            </div>
        </div>
        
        <div class="instructions">
            Use ↑↓ arrows to navigate • Enter to select • Escape to go back • <span class="blink">_</span>
        </div>
    """
    
    additional_js = f"""
{SUBMENU_JS}

class InteractiveMenu extends SubMenu {{
    constructor() {{
        super();
        this.loadSessions();
    }}
    
    async loadSessions() {{
        try {{
            const response = await fetch('/api/sessions');
            const data = await response.json();
            const sessions = data.sessions || [];
            
            const loadingItem = document.getElementById('loadingSessions');
            const sessionsList = document.getElementById('sessionsList');
            
            if (sessions.length === 0) {{
                loadingItem.innerHTML = '<span class="empty-state" style="color: #888888 !important; font-style: italic !important;">No previous sessions found</span>';
                loadingItem.classList.remove('loading');
                loadingItem.classList.add('empty-state');
                return;
            }}
            
            // Hide loading item
            loadingItem.style.display = 'none';
            
            // Create session items
            sessionsList.innerHTML = '';
            sessions.forEach(session => {{
                const sessionDate = new Date(session.updated_at).toLocaleDateString();
                const sessionTime = new Date(session.updated_at).toLocaleTimeString();
                const sessionSize = session.file_size || '0B';
                const messageCount = session.message_count || 0;
                const aiProvider = session.ai_provider?.provider_name || 
                                   (session.ai_provider?.provider ? session.ai_provider.provider.replace(/_/g, ' ').replace(/\\\\b\\\\w/g, l => l.toUpperCase()) : 
                                   'Unknown');
                
                const sessionItem = document.createElement('div');
                sessionItem.className = 'menu-item';
                sessionItem.setAttribute('data-action', `resume-${{session.session_id}}`);
                sessionItem.innerHTML = `
                    Resume Session [${{sessionDate}} ${{sessionTime}}] - ${{aiProvider}} [${{messageCount}} msgs, ${{sessionSize}}]
                `;
                
                sessionsList.appendChild(sessionItem);
            }});
            
            sessionsList.style.display = 'block';
            
            // Reinitialize menu items
            this.menuItems = document.querySelectorAll('#menuItems .menu-item:not([style*="display: none"])');
            
        }} catch (error) {{
            console.error('Error loading sessions:', error);
            const loadingItem = document.getElementById('loadingSessions');
            loadingItem.textContent = 'Failed to load sessions';
            loadingItem.classList.remove('loading');
        }}
    }}
    
    select() {{
        const selectedItem = this.menuItems[this.selectedIndex];
        const action = selectedItem.getAttribute('data-action');
        
        if (action.startsWith('resume-')) {{
            const sessionId = action.replace('resume-', '');
            window.location.href = `/resume-session/${{sessionId}}`;
            return;
        }}
        
        switch(action) {{
            case 'new':
                // Directly create session and navigate to chat
                createSessionAndStartChat();
                break;
            case 'back':
                window.location.href = '/';
                break;
        }}
    }}
}}

async function createSessionAndStartChat() {{
    try {{
        // Create session
        const response = await fetch('/create-session', {{
            method: 'POST',
            headers: {{
                'Content-Type': 'application/json',
            }},
            body: JSON.stringify({{}})
        }});
        
        const result = await response.json();
        
        if (result.success) {{
            // Navigate directly to chat
            window.location.href = `/chat/${{result.session_id}}`;
        }} else {{
            alert('Failed to create session: ' + result.error);
        }}
    }} catch (error) {{
        alert('Network error: ' + error.message);
    }}
}}

document.addEventListener('DOMContentLoaded', () => {{
    new InteractiveMenu();
}});
    """
    
    return base_template("KiloMarket Terminal - Interactive Mode", content, additional_css, additional_js)

def new_session_template(ai_provider_status: dict = None) -> str:
    """New session creation template"""
    additional_css = """
.form-container {
    background: rgba(0, 255, 0, 0.05);
    border: 2px solid #00ff00;
    padding: 20px;
    margin: 20px;
    border-radius: 5px;
    text-align: center;
}

.form-buttons {
    text-align: center;
    margin-top: 20px;
}

.btn {
    background: #00ff00;
    color: #000000;
    border: 2px solid #00ff00;
    padding: 10px 20px;
    margin: 0 10px;
    font-family: inherit;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn:hover {
    background: #000000;
    color: #00ff00;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.ai-provider-info {
    color: #00cc00;
    font-size: 14px;
    margin-bottom: 20px;
}

.error {
    color: #ff0000;
    font-size: 14px;
    margin-top: 10px;
    text-align: center;
}

.success {
    color: #00ff00;
    font-size: 14px;
    margin-top: 10px;
    text-align: center;
}
    """
    
    # AI Provider information
    ai_provider_info = ""
    if ai_provider_status:
        ai_provider_info = f"""
        <div class="ai-provider-info">
            AI Provider: {ai_provider_status.get('status_text', 'Not Configured')}
        </div>
        """
    
    content = f"""
        <div class="terminal-header">
            <div class="title">CREATE NEW SESSION</div>
        </div>
        
        <div class="form-container">
            {ai_provider_info}
            
            <div class="form-buttons">
                <button type="button" id="createSessionBtn" class="btn">Create Session</button>
                <button type="button" class="btn" onclick="window.location.href='/interactive'">Cancel</button>
            </div>
            
            <div id="message"></div>
        </div>
        
        <div class="instructions">
            Create new session • Escape to go back • <span class="blink">_</span>
        </div>
    """
    
    additional_js = f"""
document.getElementById('createSessionBtn').addEventListener('click', async function() {{
    const messageDiv = document.getElementById('message');
    
    try {{
        messageDiv.innerHTML = '<div class="success">Creating session...</div>';
        
        const response = await fetch('/create-session', {{
            method: 'POST',
            headers: {{
                'Content-Type': 'application/json',
            }},
            body: JSON.stringify({{}})
        }});
        
        const result = await response.json();
        
        if (result.success) {{
            messageDiv.innerHTML = '<div class="success">Session created successfully! Redirecting...</div>';
            setTimeout(() => {{
                window.location.href = `/chat/${{result.session_id}}`;
            }}, 1500);
        }} else {{
            messageDiv.innerHTML = `<div class="error">Error: ${{result.error}}</div>`;
        }}
    }} catch (error) {{
        messageDiv.innerHTML = `<div class="error">Network error: ${{error.message}}</div>`;
    }}
}});

// Handle Escape key
document.addEventListener('keydown', function(e) {{
    if (e.key === 'Escape') {{
        window.location.href = '/interactive';
    }}
}});

// Focus on create button
document.addEventListener('DOMContentLoaded', function() {{
    document.getElementById('createSessionBtn').focus();
}});
    """
    
    return base_template("KiloMarket Terminal - New Session", content, additional_css, additional_js)

def chat_session_template(session_id: str, session_data: dict, messages: list = None) -> str:
    """Chat session template for interactive mode"""
    
    # Generate preloaded messages HTML if provided
    preloaded_messages_html = ""
    if messages:
        for msg in messages:
            time_str = msg.get('created_at', '')
            if time_str:
                # Simple time formatting for Python
                time_str = time_str[:8] if len(time_str) > 8 else time_str
            else:
                time_str = ""
            
            content = msg.get('content', '').replace('\n', '<br>')
            msg_class = msg.get('role', 'user')
            
            preloaded_messages_html += f"""
                <div class="message {msg_class}">
                    <span class="message-time">{time_str}:</span>
                    <span class="message-content">{content}</span>
                </div>
                """
    
    # Session info
    ai_provider_data = session_data.get('ai_provider', {})
    if ai_provider_data.get('provider_name'):
        ai_provider = ai_provider_data['provider_name']
    elif ai_provider_data.get('provider'):
        # Convert provider_id to display name (simplified for Python f-string)
        provider_id = ai_provider_data['provider']
        ai_provider = provider_id.replace('_', ' ').title()
    else:
        ai_provider = 'Unknown'
    created_at = session_data.get('created_at', '')
    if created_at:
        # Simple date formatting for Python
        created_date = created_at[:10] if len(created_at) > 10 else created_at
    else:
        created_date = "Unknown"
    message_count = len(messages) if messages else 0
    
    additional_css = """
.chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 2px solid #00ff00;
    background: rgba(0, 255, 0, 0.05);
    padding: 15px;
    overflow: hidden;
    height: calc(100vh - 200px);
}

.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #00ff00;
}

.session-info {
    color: #00cc00;
    font-size: 14px;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 15px;
    padding: 10px;
    background: #000000;
    border: 1px solid #00cc00;
    font-family: 'Courier New', monospace;
}

.message {
    margin: 8px 0;
    padding: 5px 0;
    word-wrap: break-word;
}

.message.user {
    color: #ffffff;
}

.message.assistant {
    color: #00ff00;
}

.message.error {
    color: #ff0000;
}

.message-time {
    color: #888888;
    font-size: 11px;
    margin-right: 8px;
}

.message-content {
    display: inline;
}

.chat-input-container {
    display: flex;
    gap: 10px;
    align-items: stretch;
}

.chat-input {
    flex: 1;
    background: #000000;
    border: 1px solid #00ff00;
    color: #ffffff;
    padding: 10px;
    font-family: inherit;
    font-size: 14px;
    resize: none;
}

.chat-input:focus {
    outline: none;
    border-color: #00cc00;
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.send-btn {
    background: #00ff00;
    color: #000000;
    border: 2px solid #00ff00;
    padding: 10px 20px;
    font-family: inherit;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.send-btn:hover:not(:disabled) {
    background: #000000;
    color: #00ff00;
}

.send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.streaming-indicator {
    color: #ffff00;
    font-style: italic;
    font-size: 12px;
}

.typing-indicator {
    display: inline-block;
    animation: blink 1s infinite;
}}

@keyframes blink {{
    0%, 50% {{ opacity: 1; }}
    51%, 100% {{ opacity: 0; }}
}}
    """
    
    content = f"""
        <div class="terminal-header">
            <div class="title">INTERACTIVE CHAT SESSION</div>
        </div>
        
        <div class="chat-container">
            <div class="chat-header">
                <div class="session-info">
                    Session: {session_id[:8]}... | {ai_provider} | {created_date} | {message_count} messages
                </div>
                <div>
                    <button class="send-btn" onclick="window.location.href='/interactive'">Back to Sessions</button>
                    <button class="send-btn" onclick="deleteSession()">Delete Session</button>
                </div>
            </div>
            
            <div class="chat-messages" id="chatMessages">
                {preloaded_messages_html}
                <div class="message assistant">
                    <span class="message-time">System:</span>
                    <span class="message-content">Connected to Interactive Mode with {ai_provider}. Type your message below and press Enter to send.</span>
                </div>
            </div>
            
            <div class="chat-input-container">
                <textarea 
                    id="chatInput" 
                    class="chat-input" 
                    placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                    rows="3"
                ></textarea>
                <button id="sendBtn" class="send-btn" onclick="sendMessage()">Send</button>
            </div>
        </div>
        
        <div class="instructions">
            Enter to send • Shift+Enter for new line • Escape to go back • <span class="blink">_</span>
        </div>
    """
    
    additional_js = f"""
let isStreaming = false;
let currentStreamBuffer = '';
let currentMessageElement = null;
let currentSessionId = '{session_id}';

function addMessage(type, content, time = null) {{
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${{type}}`;
    
    const timeStr = time || new Date().toLocaleTimeString();
    
    // Convert newlines to <br> for proper formatting
    const formattedContent = content.replace(/\\\\n/g, '<br>');
    
    messageDiv.innerHTML = `
        <span class="message-time">${{timeStr}}:</span>
        <span class="message-content">${{formattedContent}}</span>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}}

function updateStreamingMessage(content) {{
    if (currentMessageElement) {{
        // Convert newlines to <br> for proper formatting during streaming
        const formattedContent = content.replace(/\\\\n/g, '<br>');
        currentMessageElement.querySelector('.message-content').innerHTML = formattedContent;
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }}
}}

async function sendMessage() {{
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const message = input.value.trim();
    
    if (!message || isStreaming) return;
    
    // Add user message
    addMessage('user', message);
    input.value = '';
    
    // Disable send button
    isStreaming = true;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    
    try {{
        // Create streaming indicator
        currentMessageElement = addMessage('assistant', '');
        updateStreamingMessage('Thinking...');
        
        // Build URL for streaming
        let url = `/chat-stream/${{currentSessionId}}?message=${{encodeURIComponent(message)}}`;
        console.log('[DEBUG] Opening EventSource:', url);
        
        // Create EventSource for streaming
        const eventSource = new EventSource(url);
        
        eventSource.onmessage = function(event) {{
            const data = event.data;
            
            if (data === '[DONE]') {{
                eventSource.close();
                isStreaming = false;
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send';
                currentMessageElement = null;
                
                // Navigate to resume session to get clean conversation from sessions
                console.log('[DEBUG] Streaming completed, navigating to resume session for clean conversation...');
                setTimeout(() => {{
                    console.log('[DEBUG] Navigating to resume session with ID:', currentSessionId);
                    window.location.href = '/resume-session/' + currentSessionId;
                }}, 2000); // 2 second delay to allow users to see the completed message
            }} else if (data.startsWith('[ERROR]')) {{
                const errorMsg = data.substring(7);
                updateStreamingMessage(`Error: ${{errorMsg}}`);
                eventSource.close();
                isStreaming = false;
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send';
                currentMessageElement = null;
            }} else {{
                // Append streaming content
                currentStreamBuffer += data;
                updateStreamingMessage(currentStreamBuffer);
            }}
        }};
        
        eventSource.onerror = function(event) {{
            console.error('EventSource failed:', event);
            updateStreamingMessage('Connection error. Please try again.');
            eventSource.close();
            isStreaming = false;
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
            currentMessageElement = null;
        }};
        
        // Reset stream buffer
        currentStreamBuffer = '';
        
    }} catch (error) {{
        console.error('Error sending message:', error);
        addMessage('error', `Failed to send message: ${{error.message}}`);
        isStreaming = false;
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
        currentMessageElement = null;
    }}
}}

// Handle Enter key in textarea
document.getElementById('chatInput').addEventListener('keydown', function(e) {{
    if (e.key === 'Enter' && !e.shiftKey) {{
        e.preventDefault();
        sendMessage();
    }}
}});

// Handle Escape key
document.addEventListener('keydown', function(e) {{
    if (e.key === 'Escape' && !isStreaming) {{
        if (confirm('Are you sure you want to leave chat session?')) {{
            window.location.href = '/interactive';
        }}
    }}
}});

// Delete session function
function deleteSession() {{
    if (confirm('Are you sure you want to delete this entire session? This action cannot be undone.')) {{
        window.location.href = `/delete-session/${{currentSessionId}}`;
    }}
}}

// Focus input on load
document.addEventListener('DOMContentLoaded', function() {{
    document.getElementById('chatInput').focus();
    
    // Scroll to bottom of chat after page load
    setTimeout(() => {{
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {{
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }}
    }}, 100);
}});
    """
    
    return base_template(f"KiloMarket Terminal - Interactive Chat {session_id[:8]}", content, additional_css, additional_js)