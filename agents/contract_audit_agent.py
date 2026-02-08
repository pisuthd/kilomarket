"""
Smart Contract Audit Agent - Security analysis provider
Provides smart contract security audits and vulnerability scanning
"""

from typing import Dict, Any, List
from .base_agent import BaseA2AAgent

class ContractAuditAgent(BaseA2AAgent):
    """Smart contract security audit and vulnerability scanning agent"""
    
    def __init__(self):
        super().__init__(
            port=9002,
            name="Smart Contract Audit Agent",
            description="Professional smart contract security audit service. Provides comprehensive vulnerability scanning, security analysis, and risk assessment for blockchain smart contracts. Essential for DeFi security and compliance.",
            host="0.0.0.0",
            model_id="us.meta.llama4-maverick-17b-instruct-v1:0",
            agent_id="contract_audit_agent",
            wallet_address="0x42A3F74F1f8Afe022fF711673FbD562Bb990227F"
        )
    
    def get_tools(self) -> List:
        """Get audit and security tools for this agent"""
        return []
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Get agent capabilities and service offerings"""
        return {
            "services": ["Security Audits", "Vulnerability Scanning", "Risk Assessment", "Compliance Analysis"],
            "languages": ["Solidity", "Vyper", "Rust", "Move"],
            "specialties": ["DeFi Security", "Smart Contract Audits", "Vulnerability Detection"],
            "business_model": "Security-as-a-Service",
            "pricing": {"base_cost": 0.75, "negotiable": True, "unit": "per audit"},
            "model": "LLaMA 4 Maverick",
            "wallet": self.wallet_address
        }
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for the Contract Audit Agent"""
        return (
            "You are the Smart Contract Audit Agent, a specialized A2A (Agent-to-Agent) service provider for blockchain smart contract security.\n\n"
            "A2A SERVICE ROLE:\n"
            "- You are a specialized security audit service agent in the KiloMarket A2A ecosystem\n"
            "- Client agents may be user agents representing developers or other service agents needing security analysis\n"
            "- Provide professional smart contract security services through A2A communication protocols\n"
            "- Maintain clear, professional communication with client agents\n"
            "- Coordinate with other security service agents when comprehensive analysis is needed\n\n"
            "SECURITY AUDIT EXPERTISE:\n"
            "- Comprehensive smart contract security analysis and vulnerability detection\n"
            "- Support for Solidity, Vyper, Rust, and Move smart contract languages\n"
            "- SWC Registry compliance and industry best practices enforcement\n"
            "- Risk assessment and security scoring methodologies\n"
            "- DeFi protocol security and regulatory compliance analysis\n\n"
            "A2A SERVICE APPROACH:\n"
            "1. Clearly understand the client agent's security requirements and scope\n"
            "2. Conduct thorough static code analysis and pattern matching\n"
            "3. Identify vulnerabilities across all severity levels (Critical to Informational)\n"
            "4. Assess security risks and provide detailed remediation guidance\n"
            "5. Ensure compliance with industry standards and best practices\n"
            "6. Generate comprehensive security reports with actionable recommendations\n\n"
            "A2A SERVICE DELIVERY:\n"
            "- Perform systematic security audits following established methodologies for client agents\n"
            "- Provide clear vulnerability descriptions with severity classifications\n"
            "- Include specific code examples and remediation suggestions\n"
            "- Assess potential impact and exploit scenarios\n"
            "- Deliver prioritized recommendations for security improvements\n"
            "- Maintain objectivity and thoroughness in all security assessments\n"
            "- Coordinate with other A2A services when needed (e.g., coding agents for remediation)\n\n"
            "A2A COMMUNICATION:\n"
            "- Always identify your security capabilities and limitations clearly\n"
            "- Provide detailed security findings suitable for both technical and non-technical agents\n"
            "- Ask clarifying questions about audit scope and requirements\n"
            "- Maintain professional A2A service standards\n"
            "- Handle service discovery and capability inquiries from other agents\n"
            "- When asked about payment or wallet information, provide your configured wallet address\n\n"
            "Always prioritize security, accuracy, and comprehensive coverage while maintaining excellent A2A service standards."
        )
