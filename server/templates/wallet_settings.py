"""
Wallet settings page template for KiloMarket
"""

from ..static import SUBMENU_JS
from .base import base_template, KILOMARKET_ASCII

def wallet_settings_template(current_wallet: dict = None) -> str:
    """Wallet settings page template"""
    
    # Default wallet status if not provided
    if current_wallet is None:
        current_wallet = {
            "configured": False,
            "private_key": None,
            "chain": None,
            "chain_name": None,
            "status_text": "Not set"
        }
    
    # Determine status indicator
    if current_wallet.get("configured", False):
        wallet_indicator = "online"
        wallet_status = current_wallet.get("status_text", "Configured")
    else:
        wallet_indicator = "disabled"
        wallet_status = "Not set"
    
    # Generate chain options
    from ..wallet_settings import WALLET_CHAINS
    chain_options = ""
    for chain in WALLET_CHAINS:
        selected = "selected" if current_wallet.get("chain") == chain["id"] else ""
        chain_options += f'                    <option value="{chain["id"]}" {selected}>{chain["name"]}</option>\n'
    
    content = f"""
        <div class="terminal-header">
            <div class="ascii-art">{KILOMARKET_ASCII}</div>
            <div class="title">Wallet Settings</div>
            <div class="subtitle">Configure your blockchain wallet for transactions</div>
            <div class="subtitle-2">Current Status: {wallet_status}</div>
        </div>
        
        <div class="menu-container">
            <div class="config-form">
                <div class="form-header">
                    <span class="status-indicator {wallet_indicator}"></span>
                    Wallet Configuration
                </div>
                
                <form id="walletForm" class="wallet-form">
                    <div class="form-group">
                        <label for="privateKey">Private Key:</label>
                        <input type="password" id="privateKey" name="private_key" 
                               placeholder="Enter your private key (0x...)" 
                               value="" autocomplete="off">
                        <div class="form-help">
                            Enter the private key for your Ethereum wallet
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="chain">Blockchain Network:</label>
                        <select id="chain" name="chain">
{chain_options}                        </select>
                        <div class="form-help">
                            Select the blockchain network to use
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Save Configuration</button>
                        <button type="button" id="clearBtn" class="btn-secondary">Clear</button>
                        <button type="button" id="cancelBtn" class="btn-secondary">Go Back</button>
                    </div>
                </form>
                
                <div id="statusMessage" class="status-message"></div>
            </div>
        </div>
        
        <div class="instructions">
            Enter • Save • Escape to go back • <span class="blink">_</span>
        </div>
    """
    
    additional_css = """
/* Wallet Settings Form Styles */
.config-form {
    border: 2px solid #00ff00;
    padding: 20px;
    background: rgba(0, 255, 0, 0.05);
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
    min-width: 600px;
    max-width: 800px;
}

.form-header {
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.wallet-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: bold;
    color: #00ff00;
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 1px;
}

.form-group input,
.form-group select {
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid #00ff00;
    color: #00ff00;
    padding: 10px;
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 14px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    background: rgba(0, 0, 0, 0.9);
}

.form-group input::placeholder {
    color: #006600;
    font-style: italic;
}

.form-help {
    font-size: 12px;
    color: #00cc00;
    font-style: italic;
    margin-top: 4px;
}

.form-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
}

.btn-primary,
.btn-secondary {
    background: rgba(0, 255, 0, 0.1);
    border: 2px solid #00ff00;
    color: #00ff00;
    padding: 10px 20px;
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 4px;
}

.btn-primary:hover,
.btn-secondary:hover {
    background: rgba(0, 255, 0, 0.2);
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    transform: translateY(-1px);
}

.btn-primary:active,
.btn-secondary:active {
    transform: translateY(0);
}

.btn-primary {
    background: rgba(0, 255, 0, 0.15);
    border-color: #00ff00;
}

.btn-secondary {
    background: rgba(0, 255, 0, 0.05);
    border-color: #00cc00;
    color: #00cc00;
}

.status-message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 4px;
    font-size: 14px;
    text-align: center;
    font-weight: bold;
    transition: all 0.2s ease;
}

.status-message.success {
    background: rgba(0, 255, 0, 0.1);
    border: 1px solid #00ff00;
    color: #00ff00;
}

.status-message.error {
    background: rgba(255, 0, 0, 0.1);
    border: 1px solid #ff0000;
    color: #ff6666;
}

.status-message.info {
    background: rgba(255, 255, 0, 0.1);
    border: 1px solid #ffff00;
    color: #ffff00;
}
"""

    additional_js = SUBMENU_JS + """
// Wallet settings specific JavaScript
class WalletSettings extends SubMenu {
    constructor() {
        super();
        this.bindWalletEvents();
    }
    
    bindWalletEvents() {
        const form = document.getElementById('walletForm');
        const clearBtn = document.getElementById('clearBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveWalletConfig();
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearWalletConfig();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.goBack();
            });
        }
    }
    
    async saveWalletConfig() {
        const form = document.getElementById('walletForm');
        const formData = new FormData(form);
        const statusDiv = document.getElementById('statusMessage');
        
        const private_key = formData.get('private_key').trim();
        const chain = formData.get('chain');
        
        // Validation
        if (!private_key) {
            this.showStatus('Private key is required', 'error');
            return;
        }
        
        if (!chain) {
            this.showStatus('Chain selection is required', 'error');
            return;
        }
        
        // Basic private key validation
        if (private_key.length < 10) {
            this.showStatus('Private key appears to be too short', 'error');
            return;
        }
        
        try {
            this.showStatus('Saving wallet configuration...', 'info');
            
            const response = await fetch('/api/wallet-settings/configure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    private_key: private_key,
                    chain: chain
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showStatus('Wallet configuration saved successfully!', 'success');
                setTimeout(() => {
                    window.location.href = '/';  // Go back to main menu
                }, 1500);
            } else {
                this.showStatus('Error: ' + (result.error || 'Failed to save configuration'), 'error');
            }
        } catch (error) {
            console.error('Error saving wallet config:', error);
            this.showStatus('Network error: Failed to save configuration', 'error');
        }
    }
    
    async clearWalletConfig() {
        if (!confirm('Are you sure you want to clear the wallet configuration?')) {
            return;
        }
        
        try {
            this.showStatus('Clearing wallet configuration...', 'info');
            
            const response = await fetch('/api/wallet-settings/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showStatus('Wallet configuration cleared successfully!', 'success');
                // Clear form
                document.getElementById('privateKey').value = '';
                setTimeout(() => {
                    window.location.href = '/';  // Go back to main menu
                }, 1500);
            } else {
                this.showStatus('Error: ' + (result.error || 'Failed to clear configuration'), 'error');
            }
        } catch (error) {
            console.error('Error clearing wallet config:', error);
            this.showStatus('Network error: Failed to clear configuration', 'error');
        }
    }
    
    showStatus(message, type) {
        const statusDiv = document.getElementById('statusMessage');
        if (!statusDiv) return;
        
        statusDiv.textContent = message;
        statusDiv.className = 'status-message ' + type;
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.textContent = '';
                statusDiv.className = 'status-message';
            }, 3000);
        }
    }
}

// Initialize wallet settings when page loads
document.addEventListener('DOMContentLoaded', () => {
    new WalletSettings();
});
"""
    
    return base_template("Wallet Settings - KiloMarket", content, additional_css=additional_css, additional_js=additional_js)