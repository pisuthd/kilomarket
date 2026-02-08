"""
KiloMarket A2A Agents Package
Specialized Agent-to-Agent service agents
"""

from .agent_registry import AgentRegistry
from .vibe_coding_agent import VibeCodingAgent
from .crypto_market_agent import CryptoMarketAgent
from .contract_audit_agent import ContractAuditAgent

__all__ = [
    'AgentRegistry',
    'VibeCodingAgent',
    'CryptoMarketAgent', 
    'ContractAuditAgent'
]