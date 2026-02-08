"""
Clean and Organized Markets page template for KiloMarket
Displays available A2A agents with the same clean layout as other pages
"""

from ..static import SUBMENU_JS
from .base import base_template, KILOMARKET_ASCII

def markets_page_template(context=None):
    """Render a markets page with simple agent selection menu"""
    
    # Static list of all available agents
    detailed_agents = [
        {
            "name": "Vibe Coding Agent",
            "port": 9000,
            "description": "Professional A2A (Agent-to-Agent) coding service provider specializing in modern web development, software architecture, and technical solutions.",
            "model": "Claude Sonnet 4.5",
            "services": ["Code Review", "Development", "Architecture", "Debugging"],
            "languages": ["Python", "JavaScript", "TypeScript", "React", "Node.js", "HTML/CSS"],
            "specialties": ["Web Development", "API Design", "Database Design", "Cloud Architecture"],
            "business_model": "Service-as-a-Code",
            "pricing": {"base_cost": 1.0, "unit": "request", "negotiable": True},
            "wallet_address": "0x50D0aD29e0dfFBdf5DAbf4372a5a1A1C1d28A6b1",
            "running": True
        },
        {
            "name": "Crypto Market Agent",
            "port": 9001,
            "description": "Real-time cryptocurrency market data provider. Offers token prices, market summaries, top movers, and comprehensive market analysis.",
            "model": "Amazon Nova Pro",
            "services": ["Real-time Prices", "Market Analysis", "Top Movers", "Market Summaries"],
            "languages": ["Python", "Data Analysis"],
            "specialties": ["Crypto Trading", "DeFi Analytics", "Market Intelligence"],
            "business_model": "Data-as-a-Service",
            "pricing": {"base_cost": 0.75, "unit": "request", "negotiable": True},
            "wallet_address": "0x3e8aB3edCd96d871ff64FEdD5dccC0b99e531556",
            "running": True
        },
        {
            "name": "Smart Contract Audit Agent",
            "port": 9002,
            "description": "Professional smart contract security audit service. Provides comprehensive vulnerability scanning, security analysis, and risk assessment.",
            "model": "LLaMA 4 Maverick",
            "services": ["Security Audits", "Vulnerability Scanning", "Risk Assessment", "Compliance Analysis"],
            "languages": ["Solidity", "Vyper", "Rust", "Move"],
            "specialties": ["DeFi Security", "Smart Contract Audits", "Vulnerability Detection"],
            "business_model": "Security-as-a-Service",
            "pricing": {"base_cost": 0.75, "unit": "audit", "negotiable": True},
            "wallet_address": "0x42A3F74F1f8Afe022fF711673FbD562Bb990227F",
            "running": True
        }
    ]
    
    # Check which agents are currently running
    try:
        from .a2a_server import get_a2a_manager
        a2a_manager = get_a2a_manager()
        status = a2a_manager.get_status()
        
        # Update running status for agents
        running_ports = []
        for server in status.get("servers", []):
            if server.get("running"):
                running_ports.append(server.get("port", 0))
        
        for agent in detailed_agents:
            agent["running"] = agent["port"] in running_ports
            if agent["running"]:
                # Get live data for running agents
                for server in status.get("servers", []):
                    if server.get("port") == agent["port"] and server.get("running"):
                        capabilities = server.get("capabilities", {})
                        if capabilities.get("services"):
                            agent["services"] = capabilities["services"]
                        if capabilities.get("specialties"):
                            agent["specialties"] = capabilities["specialties"]
                        
                        # Update model information from the running agent
                        if server.get("model") and server.get("model") != "Unknown":
                            agent["model"] = server["model"]
                        elif capabilities.get("model"):
                            agent["model"] = capabilities["model"]
                        
                        # Update wallet address from the running agent
                        if server.get("wallet_address"):
                            agent["wallet_address"] = server["wallet_address"]
                        
                        # Update pricing from the running agent
                        if server.get("service_cost") is not None:
                            agent["pricing"]["base_cost"] = server["service_cost"]
                        
                        break
                        
    except Exception as e:
        # Keep default static data if unable to check running status
        pass
    
    # Generate agent menu items
    agent_menu_items = ""
    if detailed_agents:
        for i, agent in enumerate(detailed_agents):
            agent_menu_items += f'                <div class="menu-item" data-action="agent-{i}">{agent["name"]}</div>\n'
    else:
        agent_menu_items += '                <div class="menu-item empty-state">No agents currently running</div>\n'
    
    content = f"""
        <div class="terminal-header">
            <div class="ascii-art">{KILOMARKET_ASCII}</div>
            <div class="title">Agent Marketplace</div>
            <div class="subtitle">Browse and connect to specialized A2A agents</div>
            <div class="subtitle-2">Available Agents: {len(detailed_agents)} Total</div>
        </div>
        
        <div class="menu-container">
            <div class="menu">
                <div class="menu-header">Available Agents</div>
                <div id="menuItems">
{agent_menu_items}                    <div class="menu-item" data-action="back">Back to Main Menu</div>
                </div>
            </div>
        </div>
        
        <div id="agentDetails" class="agent-details" style="display: none;">
            <!-- Agent details will be populated here -->
        </div>
        
        <div class="instructions">
            Use ↑↓ arrows to navigate • Enter to select • Escape to go back • <span class="blink">_</span>
        </div>
    """
    
    additional_css = """
/* Ensure menu item cursor works */
.menu-item.selected {
    background: #00ff00 !important;
    color: #000000 !important;
    font-weight: bold !important;
    box-shadow: 0 0 10px #00ff00 !important;
}

.menu-item.selected::before {
    content: "> " !important;
    position: absolute !important;
    left: -20px !important;
}

/* Agent Details Styles */
.agent-details {
    border: 2px solid #00ff00;
    padding: 20px;
    background: rgba(0, 255, 0, 0.05);
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
    min-width: 600px;
    max-width: 800px;
    margin: 20px auto 0 auto; /* Center horizontally */
    text-align: left; /* Keep text left-aligned within the container */
}

.agent-header {
    border-bottom: 2px solid #00ff00;
    padding-bottom: 15px;
    margin-bottom: 20px;
}

.agent-title {
    font-size: 20px;
    font-weight: bold;
    color: #00ff00;
    margin-bottom: 5px;
}

.agent-description {
    color: #00cc00;
    font-style: italic;
    margin-bottom: 10px;
}

.agent-status {
    color: #00ff00;
    font-size: 14px;
}

.agent-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 15px;
    margin-bottom: 20px;
}

.agent-section {
    border: 1px solid #00cc00;
    padding: 15px;
    background: rgba(0, 0, 0, 0.3);
}

.agent-section h4 {
    color: #00ff00;
    margin: 0 0 10px 0;
    font-size: 16px;
    border-bottom: 1px solid #00cc00;
    padding-bottom: 5px;
}

.agent-info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
}

.agent-info-label {
    color: #00cc00;
    font-weight: bold;
}

.agent-info-value {
    color: #ffffff;
}

.service-tag {
    display: inline-block;
    background: rgba(0, 255, 0, 0.1);
    border: 1px solid #00ff00;
    color: #00ff00;
    padding: 2px 6px;
    margin: 2px;
    font-size: 12px;
    border-radius: 3px;
}

.agent-actions {
    text-align: center;
    margin-top: 20px;
    border-top: 2px solid #00ff00;
    padding-top: 15px;
}

.action-btn {
    background: rgba(0, 255, 0, 0.1);
    border: 2px solid #00ff00;
    color: #00ff00;
    padding: 10px 20px;
    margin: 0 10px;
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 4px;
}

.action-btn:hover {
    background: rgba(0, 255, 0, 0.2);
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    transform: translateY(-1px);
}

.action-btn.primary {
    background: rgba(0, 255, 0, 0.15);
    border-color: #00ff00;
}

.action-btn.secondary {
    background: rgba(0, 255, 0, 0.05);
    border-color: #00cc00;
    color: #00cc00;
}

.empty-state {
    color: #888888 !important;
    font-style: italic !important;
}

.status-message {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid #00ff00;
    color: #00ff00;
    padding: 10px 15px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
"""

    # Generate agent data for JavaScript
    import json
    agent_data_js = json.dumps(detailed_agents)

    additional_js = f"""
{SUBMENU_JS}

// Agent data
const agentsData = {agent_data_js};

class MarketplaceMenu extends SubMenu {{
    constructor() {{
        super();
    }}
    
    select() {{
        const selectedItem = this.menuItems[this.selectedIndex];
        const action = selectedItem.getAttribute('data-action');
        
        if (action && action.startsWith('agent-')) {{
            const agentIndex = parseInt(action.replace('agent-', ''));
            this.showAgentDetails(agentIndex);
            return;
        }}
        
        switch(action) {{
            case 'back':
                window.location.href = '/';
                break;
        }}
    }}
    
    showAgentDetails(agentIndex) {{
        const agent = agentsData[agentIndex];
        if (!agent) return;
        
        const detailsDiv = document.getElementById('agentDetails');
        const menuContainer = document.querySelector('.menu-container');
        
        // Hide menu, show details
        menuContainer.style.display = 'none';
        detailsDiv.style.display = 'block';
        
        // Generate services HTML
        const services = agent.services && agent.services.length > 0 ? 
            agent.services.map(s => `<span class="service-tag">${{s}}</span>`).join('') : 
            '<span style="color: #888;">No services listed</span>';
        
        // Generate specialties HTML
        const specialties = agent.specialties && agent.specialties.length > 0 ? 
            agent.specialties.map(sp => `<div class="agent-info-row">
                <span class="agent-info-label">•</span>
                <span class="agent-info-value">${{sp}}</span>
            </div>`).join('') : 
            '<div class="agent-info-row"><span class="agent-info-value">No specialties listed</span></div>';
        
        // Format wallet address
        const walletDisplay = agent.wallet_address && agent.wallet_address !== 'N/A' ? 
            `${{agent.wallet_address.slice(0, 8)}}...${{agent.wallet_address.slice(-6)}}` : 'Not configured';
        
        detailsDiv.innerHTML = `
            <div class="agent-header">
                <div class="agent-title">${{agent.name}}</div>
                <div class="agent-description">${{agent.description}}</div>
                <div class="agent-status">● ${{agent.running ? 'Online' : 'Offline'}} • Port: ${{agent.port}} • Model: ${{agent.model}}</div>
            </div>
            
            <div class="agent-grid">
                <div class="agent-section">
                    <h4>📊 Information</h4>
                    <div class="agent-info-row">
                        <span class="agent-info-label">Status:</span>
                        <span class="agent-info-value">${{agent.running ? 'Online' : 'Offline'}}</span>
                    </div>
                    <div class="agent-info-row">
                        <span class="agent-info-label">Port:</span>
                        <span class="agent-info-value">${{agent.port}}</span>
                    </div>
                    <div class="agent-info-row">
                        <span class="agent-info-label">Model:</span>
                        <span class="agent-info-value">${{agent.model}}</span>
                    </div>
                    <div class="agent-info-row">
                        <span class="agent-info-label">Wallet:</span>
                        <span class="agent-info-value">${{walletDisplay}}</span>
                    </div>
                </div>
                
                <div class="agent-section">
                    <h4>💰 Pricing</h4>
                    <div class="agent-info-row">
                        <span class="agent-info-label">Cost:</span>
                        <span class="agent-info-value">${{agent.pricing?.base_cost || 'N/A'}} yUSD</span>
                    </div>
                    <div class="agent-info-row">
                        <span class="agent-info-label">Unit:</span>
                        <span class="agent-info-value">per ${{agent.pricing?.unit || 'request'}}</span>
                    </div>
                    <div class="agent-info-row">
                        <span class="agent-info-label">Negotiable:</span>
                        <span class="agent-info-value">${{agent.pricing?.negotiable ? 'Yes' : 'No'}}</span>
                    </div>
                </div>
                
                <div class="agent-section">
                    <h4>🛠️ Services</h4>
                    <div>${{services}}</div>
                </div>
            </div>
            
            <div class="agent-actions">
                <button class="action-btn secondary" onclick="backToMenu()">← Back</button>
            </div>
        `;
    }}
    
    showStatus(message, type = 'info') {{
        // Remove existing status messages
        const existing = document.querySelector('.status-message');
        if (existing) {{
            existing.remove();
        }}
        
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-message';
        statusDiv.textContent = message;
        document.body.appendChild(statusDiv);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {{
            if (statusDiv.parentNode) {{
                statusDiv.parentNode.removeChild(statusDiv);
            }}
        }}, 3000);
    }}
}}

function backToMenu() {{
    document.getElementById('agentDetails').style.display = 'none';
    document.querySelector('.menu-container').style.display = 'block';
}}

// Initialize marketplace when page loads
document.addEventListener('DOMContentLoaded', () => {{
    new MarketplaceMenu();
}});
"""
    
    return base_template("Agent Marketplace - KiloMarket", content, additional_css=additional_css, additional_js=additional_js)