"""
Agent utilities for KiloMarket Interactive Mode
Handles StrandsAgents SDK integration for interactive sessions
"""

import logging
from typing import Dict, Any

# Try to import strands components, but handle gracefully if not available
STRANDS_AVAILABLE = False
Agent = None
SlidingWindowConversationManager = None
FileSessionManager = None
BedrockModel = None
AnthropicModel = None
GeminiModel = None
OpenAIModel = None

try:
    from strands import Agent
    from strands.agent.conversation_manager import SlidingWindowConversationManager
    from strands.session.file_session_manager import FileSessionManager
    from strands.models import BedrockModel
    from strands.models.anthropic import AnthropicModel
    from strands.models.gemini import GeminiModel
    from strands.models.openai import OpenAIModel
    STRANDS_AVAILABLE = True
except ImportError as e:
    logging.warning(f"StrandsAgents not available: {e}. Agent functionality will be limited.")
    STRANDS_AVAILABLE = False

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Global registry for MCP clients (to avoid JSON serialization issues)
_mcp_client_registry = {}

def create_conversation_manager() -> SlidingWindowConversationManager:
    """Create conversation manager with fixed settings for all agents"""
    if not STRANDS_AVAILABLE:
        raise ImportError("StrandsAgents SDK is not available. Please install strands-agents package.")
    
    return SlidingWindowConversationManager(
        window_size=15,  # Fixed window size
        should_truncate_results=True  # Fixed truncation setting
    )

def get_kilomarket_system_prompt() -> str:
    """Get KiloMarket System Prompt"""
    
    system_prompt = """You are KiloMarket Interactive Agent, a specialized AI assistant for cryptocurrency and DeFi interactions on Ethereum Sepolia.

Core Responsibilities:
- Provide intelligent analysis and insights
- Assist with market data interpretation
- Help with DeFi protocol interactions
- Guide users through complex blockchain operations
- Execute wallet operations using available Ethereum tools
- Ensure security and best practices

Available Ethereum Tools:
- Wallet information and balance checking
- Native ETH transfers
- ERC20 token operations (send, approve, check allowances)
- Transaction monitoring and verification

Important Guidelines:
- Always prioritize security and user safety
- Double-check addresses and transaction details
- Provide clear explanations for complex concepts
- Ask for clarification when needed
- Never share sensitive information like private keys or passcodes
- Never request or display user approval data in responses
- Use available Ethereum tools for blockchain operations
- Verify transaction details before execution

Communication Style:
- Be helpful and educational
- Use clear, concise language
- Provide step-by-step guidance when needed
- Explain risks and benefits clearly
- Show transaction details and confirmations when using blockchain tools

Always provide reasoning and use markdown for clear communication."""

    return system_prompt

def initialize_strands_agent(session_data: Dict[str, Any], session_id: str, strands_session_manager) -> tuple[Agent, str]:
    """Initialize a Strands agent with the given configuration"""
    if not STRANDS_AVAILABLE:
        raise ImportError("StrandsAgents SDK is not available. Please install strands-agents package.")
    
    logger.info(f"Initializing Strands agent for session: {session_id}")
    
    # Extract AI provider configuration from session data
    ai_provider_data = session_data.get('ai_provider', {})
    ai_provider = ai_provider_data.get('provider')
    config = ai_provider_data.get('config', {})
    approval_data = session_data.get('approval_data', '')
    
    if not ai_provider or not config:
        raise ValueError("AI provider not configured properly in session data")
    
    # Get the KiloMarket System Prompt
    system_prompt = get_kilomarket_system_prompt()
    
    # Setup logging for this specific agent
    agent_logger = logging.getLogger(f"strands.{session_id}")
    agent_logger.setLevel(logging.DEBUG)
    
    # Create conversation manager with fixed settings
    conversation_manager = create_conversation_manager()
    
    # Create agent state (no sensitive data in session state)
    sanitized_config = {}
    sensitive_fields = ['api_key', 'region_name', 'base_url']
    for key, value in config.items():
        if key not in sensitive_fields:
            sanitized_config[key] = value
    
    agent_state = {
        "session_config": {
            "session_id": session_id,
            "ai_provider": ai_provider,
            "config": sanitized_config,
            "session_type": "interactive"
        }
    }
    
    # Get MCP tools for Ethereum Sepolia
    additional_tools = []
    try:
        from .mcp_manager import mcp_manager
        mcp_tools, persistent_clients = mcp_manager.get_mcp_tools("ethereum_sepolia")
        additional_tools.extend(mcp_tools)
        
        # Store MCP client references for cleanup (but not in agent state to avoid JSON serialization issues)
        # We'll store them in a separate global registry
        _mcp_client_registry[session_id] = persistent_clients
        logger.info(f"Loaded {len(mcp_tools)} MCP tools for Ethereum Sepolia")
    except Exception as e:
        logger.warning(f"Failed to load MCP tools: {e}")
        _mcp_client_registry[session_id] = {}
    
    # Initialize agent based on provider
    if ai_provider == "anthropic":
        api_key = config.get('api_key')
        if not api_key:
            raise ValueError("API key is required for Anthropic provider")
        
        model_id = config.get('model_id', 'claude-sonnet-4-5-20250929')
        max_tokens = config.get('max_tokens', 4096)
        
        model = AnthropicModel(
            client_args={"api_key": api_key},
            model_id=model_id,
            max_tokens=max_tokens
        )
        
        # Create KiloMarket agent
        kilomarket_agent = Agent(
            name="kilomarket_interactive_agent",
            agent_id=f"kilomarket_agent_{session_id}",
            tools=additional_tools,  # Include MCP tools
            model=model,
            session_manager=strands_session_manager,
            conversation_manager=conversation_manager,
            callback_handler=None,
            state=agent_state,
            system_prompt=system_prompt
        )
        
        logger.info(f"Initialized Anthropic agent: {model_id}")
        return kilomarket_agent, session_id
    
    elif ai_provider == "openai_compatible":
        api_key = config.get('api_key')
        if not api_key:
            raise ValueError("API key is required for OpenAI Compatible provider")
        
        model_id = config.get('model_id', 'gpt-4o')
        base_url = config.get('base_url')
        max_tokens = config.get('max_tokens', 4000)
        temperature = config.get('temperature', 0.7)
        
        client_args = {"api_key": api_key}
        if base_url:
            client_args["base_url"] = base_url
        
        model = OpenAIModel(
            client_args=client_args,
            model_id=model_id,
            params={
                "max_tokens": max_tokens,
                "temperature": temperature
            }
        )
        
        # Create KiloMarket agent
        kilomarket_agent = Agent(
            name="kilomarket_interactive_agent",
            agent_id=f"kilomarket_agent_{session_id}",
            tools=additional_tools,  # Include MCP tools
            model=model,
            session_manager=strands_session_manager,
            conversation_manager=conversation_manager,
            callback_handler=None,
            state=agent_state,
            system_prompt=system_prompt
        )
        
        logger.info(f"Initialized OpenAI Compatible agent: {model_id} (base_url: {base_url or 'default'})")
        return kilomarket_agent, session_id
    
    elif ai_provider == "amazon_bedrock":
        import boto3
        
        model_id = config.get('model_id', 'us.anthropic.claude-sonnet-4-5-20250929-v1:0')
        region_name = config.get('region_name', 'us-east-1')
        
        boto_session = boto3.Session(region_name=region_name)
        model = BedrockModel(model_id=model_id, boto_session=boto_session)
        
        # Create KiloMarket agent
        kilomarket_agent = Agent(
            name="kilomarket_interactive_agent",
            agent_id=f"kilomarket_agent_{session_id}",
            tools=additional_tools,  # Include MCP tools
            model=model,
            session_manager=strands_session_manager,
            conversation_manager=conversation_manager,
            callback_handler=None,
            state=agent_state,
            system_prompt=system_prompt
        )
        
        logger.info(f"Initialized Amazon Bedrock agent: {model_id} in {region_name}")
        return kilomarket_agent, session_id
    
    elif ai_provider == "gemini":
        api_key = config.get('api_key')
        if not api_key:
            raise ValueError("API key is required for Gemini provider")
        
        model_id = config.get('model_id', 'gemini-2.5-flash')
        max_output_tokens = config.get('max_output_tokens', 2048)
        temperature = config.get('temperature', 0.7)
        top_p = config.get('top_p', 0.9)
        top_k = config.get('top_k', 40)
        
        model = GeminiModel(
            client_args={"api_key": api_key},
            model_id=model_id,
            params={
                "temperature": temperature,
                "max_output_tokens": max_output_tokens,
                "top_p": top_p,
                "top_k": top_k
            }
        )
        
        # Create KiloMarket agent
        kilomarket_agent = Agent(
            name="kilomarket_interactive_agent",
            agent_id=f"kilomarket_agent_{session_id}",
            tools=additional_tools,  # Include MCP tools
            model=model,
            session_manager=strands_session_manager,
            conversation_manager=conversation_manager,
            callback_handler=None,
            state=agent_state,
            system_prompt=system_prompt
        )
        
        logger.info(f"Initialized Gemini agent: {model_id}")
        return kilomarket_agent, session_id
    
    else:
        raise ValueError(f"Unsupported AI provider: {ai_provider}")

def cleanup_agent_resources(agent_instance: Agent):
    """Clean up resources associated with an agent"""
    try:
        # Get session ID from agent state
        session_id = None
        if hasattr(agent_instance, 'state') and 'session_config' in agent_instance.state:
            session_id = agent_instance.state['session_config'].get('session_id')
        
        # Clean up MCP clients from global registry
        if session_id and session_id in _mcp_client_registry:
            try:
                mcp_clients = _mcp_client_registry[session_id]
                for client_name, (client, session) in mcp_clients.items():
                    try:
                        client.__exit__(None, None, None)
                        logger.info(f"Cleaned up MCP client: {client_name}")
                    except Exception as e:
                        logger.error(f"Error cleaning up MCP client {client_name}: {e}")
                
                # Remove from registry
                del _mcp_client_registry[session_id]
                logger.info("MCP clients cleaned up successfully")
            except Exception as e:
                logger.error(f"Error during MCP cleanup: {e}")
        
        # Clean up agent resources
        if hasattr(agent_instance, 'cleanup'):
            agent_instance.cleanup()
        elif hasattr(agent_instance, 'close'):
            agent_instance.close()
        logger.info("Agent resources cleaned up successfully")
    except Exception as e:
        logger.error(f"Error during agent cleanup: {e}")
