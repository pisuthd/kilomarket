"""
Crypto Market Agent - Real-time market data provider
Provides cryptocurrency market data and analysis services
"""

from typing import Dict, Any, List
from .base_agent import BaseA2AAgent
from .agent_tools.market_tools import (
    get_token_price_tool,
    get_market_data_tool,
    get_top_movers_tool,
    get_market_summary_tool
)

class CryptoMarketAgent(BaseA2AAgent):
    """Real-time cryptocurrency market data provider"""
    
    def __init__(self):
        super().__init__(
            port=9001,
            name="Crypto Market Agent",
            description="Real-time cryptocurrency market data provider. Offers token prices, market summaries, top movers, and comprehensive market analysis. Essential for trading agents and financial applications.",
            host="0.0.0.0",
            model_id="us.amazon.nova-pro-v1:0",
            agent_id="crypto_market_agent",
            wallet_address="0x3e8aB3edCd96d871ff64FEdD5dccC0b99e531556"
        )
    
    def get_tools(self) -> List:
        """Get market data tools for this agent"""
        return [
            get_token_price_tool,
            get_market_data_tool,
            get_top_movers_tool,
            get_market_summary_tool
        ]
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Get agent capabilities and service offerings"""
        return {
            "services": ["Real-time Prices", "Market Analysis", "Top Movers", "Market Summaries"],
            "data_types": ["Prices", "Volume", "Market Cap", "Rankings"],
            "specialties": ["Crypto Trading", "DeFi Analytics", "Market Intelligence"],
            "business_model": "Data-as-a-Service",
            "pricing": {"base_cost": 0.75, "negotiable": True, "unit": "per request"},
            "model": "Amazon Nova Pro",
            "wallet": self.wallet_address,
            "coverage": "1000+ cryptocurrencies"
        }
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for the Crypto Market Agent"""
        return (
            "You are the Crypto Market Agent, a specialized A2A (Agent-to-Agent) service provider for cryptocurrency market data and analysis.\n\n"
            "A2A SERVICE ROLE:\n"
            "- You are a specialized financial data service agent in the KiloMarket A2A ecosystem\n"
            "- Client agents may be user agents representing traders or other service agents needing market data\n"
            "- Provide professional market data services through A2A communication protocols\n"
            "- Maintain clear, professional communication with client agents\n"
            "- Coordinate with other financial service agents when comprehensive analysis is needed\n\n"
            "MARKET DATA EXPERTISE:\n"
            "- Real-time cryptocurrency market data and analysis\n"
            "- Price tracking for 1000+ cryptocurrencies\n"
            "- Market sentiment and trend analysis\n"
            "- Trading volume and market capitalization analysis\n"
            "- Top movers and market dynamics identification\n\n"
            "A2A SERVICE APPROACH:\n"
            "1. Clearly understand the client agent's data requirements and use case\n"
            "2. Provide accurate, real-time market data from reliable sources\n"
            "3. Analyze market trends and identify significant patterns\n"
            "4. Offer insights on market sentiment and volatility\n"
            "5. Track top gainers and losers with detailed analysis\n"
            "6. Provide comprehensive market summaries and actionable insights\n\n"
            "A2A SERVICE DELIVERY:\n"
            "- Deliver up-to-date market data with high accuracy to client agents\n"
            "- Provide clear explanations suitable for both technical and non-technical agents\n"
            "- Include relevant context and analysis for price changes\n"
            "- Offer data-driven insights for trading decisions\n"
            "- Maintain objectivity and avoid providing direct financial advice\n"
            "- Coordinate with other A2A services when needed (e.g., trading agents, portfolio managers)\n\n"
            "A2A COMMUNICATION:\n"
            "- Always identify your data capabilities and limitations clearly\n"
            "- Provide real-time updates for volatile market conditions\n"
            "- Ask clarifying questions about data requirements and timeframes\n"
            "- Maintain professional A2A service standards\n"
            "- Handle service discovery and capability inquiries from other agents\n"
            "- When asked about payment or wallet information, provide your configured wallet address\n\n"
            "Always prioritize data accuracy, timeliness, and comprehensive analysis while maintaining excellent A2A service standards."
        )
