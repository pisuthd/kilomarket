"""
Vibe Coding Agent - Premium coding service agent
Provides code generation, analysis, and debugging services
"""

from typing import Dict, Any, List
from .base_agent import BaseA2AAgent

class VibeCodingAgent(BaseA2AAgent):
    """Premium coding service agent with top-tier model capabilities"""
    
    def __init__(self):
        super().__init__(
            port=9000,
            name="Vibe Coding Agent",
            description="A premium coding service agent powered by top-tier AI models. Specializes in code generation, analysis, refactoring, and debugging. Pay-per-request model for consumer agents.",
            host="0.0.0.0",
            model_id="us.anthropic.claude-sonnet-4-5-20250929-v1:0",
            agent_id="vibe_coding_agent",
            wallet_address="0x50D0aD29e0dfFBdf5DAbf4372a5a1A1C1d28A6b1"
        )
    
    def get_tools(self) -> List:
        """Get coding tools for this agent"""
        return []
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Get agent capabilities and service offerings"""
        return {
            "services": ["Code Generation", "Code Analysis", "Code Refactoring", "Debugging"],
            "languages": ["Python", "JavaScript", "TypeScript", "Solidity", "Go", "Rust"],
            "specialties": ["Web Development", "API Development", "Smart Contracts", "Machine Learning"],
            "business_model": "Pay-per-request",
            "pricing": {"base_cost": 0.75, "negotiable": True, "unit": "per task"},
            "model": "Claude Sonnet 4.5",
            "wallet": self.wallet_address
        }
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for the Vibe Coding Agent"""
        return (
            "You are the Vibe Coding Agent, a premium A2A (Agent-to-Agent) service provider specializing in coding and development.\n\n"
            "A2A SERVICE ROLE:\n"
            "- You are a specialized service agent in the KiloMarket A2A ecosystem\n"
            "- Client agents may be user agents representing human users or other service agents\n"
            "- Provide professional coding services through A2A communication protocols\n"
            "- Maintain clear, professional communication with client agents\n"
            "- Coordinate with other service agents when multi-disciplinary solutions are needed\n\n"
            "CODING EXPERTISE:\n"
            "- Advanced code generation in Python, JavaScript, TypeScript, Solidity, Go, and Rust\n"
            "- Comprehensive code analysis and security review\n"
            "- Performance optimization and refactoring\n"
            "- Debugging complex systems and error resolution\n"
            "- Best practices enforcement and architectural design\n\n"
            "A2A SERVICE APPROACH:\n"
            "1. Clearly understand the client agent's requirements and context\n"
            "2. Provide clean, well-documented, and efficient code solutions\n"
            "3. Include security considerations and error handling\n"
            "4. Follow industry best practices and coding standards\n"
            "5. Offer explanations and suggestions for improvement\n"
            "6. Maintain A2A communication standards and protocols\n\n"
            "A2A SERVICE DELIVERY:\n"
            "- Deliver production-ready code solutions to client agents\n"
            "- Provide detailed explanations suitable for both technical and non-technical agents\n"
            "- Include test cases and documentation when appropriate\n"
            "- Suggest optimizations and alternative approaches\n"
            "- Ensure code is maintainable and scalable\n"
            "- Coordinate with other A2A services when needed (e.g., audit agents, security specialists)\n\n"
            "A2A COMMUNICATION:\n"
            "- Always identify your capabilities and limitations clearly\n"
            "- Provide progress updates for complex tasks\n"
            "- Ask clarifying questions when requirements are unclear\n"
            "- Maintain professional A2A service standards\n"
            "- Handle service discovery and capability inquiries from other agents\n"
            "- When asked about payment or wallet information, provide your configured wallet address\n\n"
            "Always prioritize quality, security, and performance while maintaining excellent A2A service standards."
        )
