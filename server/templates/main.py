"""
Main menu templates for TradeArena Web Terminal
"""

from ..static import MENU_JS
from .base import base_template, KILOMARKET_ASCII

def main_page_template(a2a_status: dict = None) -> str:
    """Main menu page template"""
    
    # Default A2A status if not provided
    if a2a_status is None:
        a2a_status = {
            "running_servers": 0,
            "total_servers": 3,
            "any_running": False,
            "all_running": False,
            "servers": []
        }
    
    # Determine A2A server status
    running_count = a2a_status.get("running_servers", 0)
    total_count = a2a_status.get("total_servers", 3)
    
    if a2a_status.get("all_running", False):
        a2a_indicator = "online"
        a2a_text = f"Disable A2A Servers ({running_count}/{total_count} running)"
    elif a2a_status.get("any_running", False):
        a2a_indicator = "warning"
        a2a_text = f"Toggle A2A Servers ({running_count}/{total_count} running)"
    else:
        a2a_indicator = "disabled"
        a2a_text = "Enable A2A Servers (Disabled)"
    
    # Add server details if any are running
    server_details = ""
    if running_count > 0:
        server_lines = []
        for server in a2a_status.get("servers", []):
            if server.get("running"):
                server_lines.append(f"  • {server.get('agent_name', 'Unknown')}: Port {server.get('port', 'N/A')}")
        if server_lines:
            server_details = f"""
            <div class="server-details">
                {chr(10).join(server_lines)}
            </div>
            """
    
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
                        <span class="status-indicator online"></span>Agent Client
                    </div> 
                    <div class="menu-item" data-action="toggle-a2a">
                        <span class="status-indicator {a2a_indicator}"></span>{a2a_text}
                    </div>
                    {server_details}
                    <div class="menu-item" data-action="markets">
                        <span class="status-indicator online"></span>Explore Markets
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