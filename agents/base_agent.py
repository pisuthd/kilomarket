"""
Base A2A Agent class for KiloMarket
Provides common functionality for all specialized agents
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from strands import Agent
from strands.multiagent.a2a import A2AServer
from strands.session.s3_session_manager import S3SessionManager
import boto3
from strands.models import BedrockModel

class BaseA2AAgent(ABC):
    """Base class for all A2A service agents"""
    
    def __init__(self, port: int, name: str, description: str, host: str = "0.0.0.0",
                 model_id: Optional[str] = None, agent_id: Optional[str] = None, 
                 wallet_address: Optional[str] = None):
        self.port = port
        self.host = host
        self.agent_name = name
        self.agent_description = description
        self.agent_id = agent_id or name.lower().replace(" ", "_")
        self.model_id = model_id
        self.wallet_address = wallet_address
        
        self.server = None
        self.agent = None
        self.running = False
        self.start_time = None
        
        # A2A Configuration
        self.service_cost = 0.75  # yUSD per task (between 0.5-1 as requested)
        self.payment_method = "Yellow State Channel"
        self.a2a_protocols = ["HTTP", "Agent-to-Agent", "Strands"]
        
        # S3 Session Manager for conversation history
        self.session_manager = self._create_session_manager()
        
        # Store session ID for reference
        self.session_id = self.session_manager.session_id
    
    @abstractmethod
    def get_tools(self) -> List:
        """Get list of tools for this agent"""
        pass
    
    @abstractmethod
    def get_capabilities(self) -> Dict[str, Any]:
        """Get agent capabilities and metadata"""
        pass
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Get the system prompt for this agent"""
        pass
    
    def get_boto_session(self) -> boto3.Session:
        """Get AWS session for Bedrock models"""
        return boto3.Session(region_name="us-east-1")
    
    def get_model(self):
        """Get the Bedrock model for this agent"""
        if self.model_id:
            return BedrockModel(
                model_id=self.model_id,
                boto_session=self.get_boto_session()
            )
        return None
    
    def get_a2a_service_prompt(self) -> str:
        """Get A2A service-related system prompt content"""
        return (
            f"A2A SERVICE INFORMATION:\n"
            f"- Agent Name: {self.agent_name}\n"
            f"- Agent ID: {self.agent_id}\n"
            f"- Service Cost: {self.service_cost} yUSD per task\n"
            f"- Payment Method: {self.payment_method}\n"
            f"- Wallet Address: {self.wallet_address or 'Not configured'}\n"
            f"- Supported A2A Protocols: {', '.join(self.a2a_protocols)}\n"
            f"- You are a specialized A2A service agent in KiloMarket ecosystem\n"
            f"- You communicate with both user agents and other service agents\n"
            f"- Provide high-quality, professional services to client agents\n"
            f"- Maintain context of ongoing A2A conversations and relationships\n\n"
        )
    
    def get_a2a_communication_prompt(self) -> str:
        """Get A2A communication guidelines"""
        return (
            f"A2A COMMUNICATION GUIDELINES:\n"
            f"- You are an A2A (Agent-to-Agent) service provider\n"
            f"- Client agents may be user agents representing human users or other service agents\n"
            f"- Always identify your capabilities and limitations clearly\n"
            f"- Maintain professional communication standards\n"
            f"- Track conversation context for A2A session continuity\n"
            f"- Coordinate with other service agents when needed for complex tasks\n"
            f"- Provide status updates and progress reports for long-running tasks\n"
            f"- Handle service discovery and capability inquiries from other agents\n\n"
        )
    
    def _create_session_manager(self) -> S3SessionManager:
        """Create S3 session manager for conversation history"""
        return S3SessionManager(
            session_id=f"kilomarket-{self.agent_id}",
            bucket="kilomarket-agent-sessions",
            prefix=f"agents/{self.agent_id}",
            boto_session=self.get_boto_session(),
            region_name="us-east-1",
            ttl_seconds=3600 * 24 * 7,  # 7 days TTL
            max_session_size_mb=50,  # 50MB limit
            cleanup_policy="auto"
        )
    
    def create_agent(self) -> Agent:
        """Create Strands agent instance with proper configuration"""
        system_prompt = self.get_system_prompt()
        
        # Add A2A service and communication information to system prompt
        full_system_prompt = f"{self.get_a2a_service_prompt()}\n{self.get_a2a_communication_prompt()}\n{system_prompt}"
        
        agent_kwargs = {
            "name": self.agent_name,
            "agent_id": self.agent_id,
            "description": self.agent_description,
            "tools": self.get_tools(),
            "callback_handler": None,
            "system_prompt": full_system_prompt,
            "session_manager": self.session_manager
        }
        
        # Add model if specified
        model = self.get_model()
        if model:
            agent_kwargs["model"] = model
        
        return Agent(**agent_kwargs)
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information for display"""
        capabilities = self.get_capabilities()
        return {
            "name": self.agent_name,
            "agent_id": self.agent_id,
            "description": self.agent_description,
            "port": self.port,
            "host": self.host,
            "model_id": self.model_id,
            "capabilities": capabilities,
            "tools_count": len(self.get_tools()),
            "service_cost": self.service_cost,
            "payment_method": self.payment_method,
            "wallet_address": self.wallet_address,
            "server_url": f"http://{self.host}:{self.port}",
            "session_id": self.session_id
        }
