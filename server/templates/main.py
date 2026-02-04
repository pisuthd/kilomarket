"""
Main menu templates for TradeArena Web Terminal
"""

from ..static import MENU_JS
from .base import base_template, KILOMARKET_ASCII

def main_page_template(a2a_status: dict = None, ai_provider_status: dict = None) -> str:
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
    
    # Default AI provider status if not provided
    if ai_provider_status is None:
        ai_provider_status = {
            "configured": False,
            "provider": None,
            "provider_name": None,
            "status_text": "Not Set"
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
    
    # Determine AI provider status indicator and text
    if ai_provider_status.get("configured", False):
        ai_indicator = "online"
        ai_text = ai_provider_status.get('status_text', 'AI Compatible')
    else:
        ai_indicator = "disabled"
        ai_text = ai_provider_status.get('status_text', 'Not Set')
    
    # Add A2A menu item and server details only if not all servers are running
    a2a_menu_item = ""
    if not a2a_status.get("all_running", False):
        # Add server details if some servers are running
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
        
        a2a_menu_item = f"""
                    <div class="menu-item" data-action="toggle-a2a">
                        <span class="status-indicator {a2a_indicator}"></span>{a2a_text}
                    </div>
                    {server_details}"""
    
    # Determine dynamic message based on A2A server status
    if a2a_status.get("all_running", False):
        instruction_message = "Connect your agent to A2A servers or try interactive mode below"
    elif a2a_status.get("any_running", False):
        instruction_message = "Connect your agent to A2A servers or try interactive mode below"
    else:
        instruction_message = "Enable A2A servers first"
    
    content = f"""
        <div class="terminal-header">
            <div class="ascii-art">{KILOMARKET_ASCII}</div>
            <div class="title">Agent-to-Agent Marketplace</div>
            <div class="subtitle">Discovery (A2A) · Execution (x402) · AA Wallet (ZeroDev) · Strands Agents (Orchestration)</div>
            <div class="subtitle-2">{instruction_message}</div>
        </div>
        
        <div class="menu-container"> 
            <div class="menu">
                <div class="menu-header">Main Menu</div> 
                <div id="menuItems">
                    <div class="menu-item" data-action="interactive">
                        <span class="status-indicator online"></span>Interactive Mode
                    </div> 
                    {a2a_menu_item}
                    <div class="menu-item" data-action="markets">
                        <span class="status-indicator online"></span>Explore Markets
                    </div>
                    <div class="menu-item" data-action="ai-provider">
                        <span class="status-indicator {ai_indicator}"></span>{ai_text}
                    </div>
                    <div class="menu-item" data-action="settings">
                        <span class="status-indicator online"></span>Settings
                </div>
            </div> 
        </div>
        
        <div class="instructions">
            Use ↑↓ arrows to navigate • Enter to select • Escape to go back • <span class="blink">_</span>
        </div>
    """
    
    return base_template("KiloMarket Terminal", content, additional_js=MENU_JS)