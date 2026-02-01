"""
Main menu templates for TradeArena Web Terminal
"""

from ..static import MENU_JS
from .base import base_template, KILOMARKET_ASCII

# def main_page_template(agents: list = None) -> str:
def main_page_template() -> str:
    """Main menu page template"""
    # Determine agent status based on agent count
    # agent_count = len(agents) if agents else 0
    # agent_status = "online" if agent_count > 0 else "warning"
    
    # Generate status text message
    # if agent_count == 0:
    #     status_text = "Setup Required"
    # elif agent_count == 1:
    #     status_text = "1 Agent Ready"
    # else:
    #     status_text = f"{agent_count} Agents Ready"

    agent_count = 0
    agent_status = "warning"
    status_text = "Setup Required"
    
    content = f"""
        <div class="terminal-header">
            <div class="ascii-art">{KILOMARKET_ASCII}</div>
            <div class="title">Agent-to-Agent Marketplace Terminal</div>
            <div class="subtitle">Discovery (A2A) · Payment (x402) · AA Wallets · Strands Agents</div>
            <div class="subtitle-2">Live Now on Base Testnet</div>
        </div>
        
        <div class="menu-container">
            <div class="menu">
                <div class="menu-header">Main Menu</div>
                <div id="menuItems">
                    <div class="menu-item" data-action="interactive">
                        <span class="status-indicator online"></span>Interactive Mode
                    </div> 
                    <div class="menu-item" data-action="markets">
                        <span class="status-indicator online"></span>Explore Markets
                    </div>
                    <div class="menu-item" data-action="my-agent">
                        <span class="status-indicator {agent_status}"></span>My Agent [{status_text}]
                    </div>  
                    <div class="menu-item" data-action="settings">
                        <span class="status-indicator online"></span>Settings
                    </div>
                </div>
            </div>
        </div>
        
        <div class="instructions">
            Use ↑↓ arrows to navigate • Enter to select • Escape to go back • <span class="blink">_</span>
        </div>
    """
    
    return base_template("KiloMarket Terminal", content, additional_js=MENU_JS)
