"""
Agent Registry for KiloMarket A2A Agents
Manages discovery, loading, and coordination of specialized agents
"""

from typing import Dict, Any, List
from .vibe_coding_agent import VibeCodingAgent
from .crypto_market_agent import CryptoMarketAgent
from .contract_audit_agent import ContractAuditAgent

class AgentRegistry:
    """Registry for managing specialized A2A agents"""
    
    def __init__(self):
        self.agents = {}
        self._initialize_agents()
    
    def _initialize_agents(self):
        """Initialize all available agents"""
        # Register specialized agents
        vibe_coding = VibeCodingAgent()
        crypto_market = CryptoMarketAgent()
        contract_audit = ContractAuditAgent()
        
        self.agents = {
            vibe_coding.port: vibe_coding,
            crypto_market.port: crypto_market,
            contract_audit.port: contract_audit
        }
    
    def get_available_agents(self) -> List[Dict[str, Any]]:
        """Get all available agents with their information"""
        return [agent.get_agent_info() for agent in self.agents.values()]
    
    def get_agent_by_port(self, port: int):
        """Get agent by port number"""
        return self.agents.get(port)
    
    def get_agent_capabilities(self) -> Dict[str, Any]:
        """Get capabilities of all agents"""
        capabilities = {}
        for port, agent in self.agents.items():
            capabilities[agent.agent_name] = {
                "port": port,
                "capabilities": agent.get_capabilities()
            }
        return capabilities
    
    def get_agents_summary(self) -> Dict[str, Any]:
        """Get summary of all agents for display"""
        summary = {
            "total_agents": len(self.agents),
            "agents": []
        }
        
        for agent in self.agents.values():
            capabilities = agent.get_capabilities()
            summary["agents"].append({
                "name": agent.agent_name,
                "port": agent.port,
                "description": agent.agent_description,
                "services": capabilities.get("primary_services", []),
                "business_model": capabilities.get("business_model", {}),
                "features": capabilities.get("features", [])
            })
        
        return summary