"""
MCP Manager for KiloMarket
Handles Ethereum MCP client and tool collection using existing wallet settings
"""

import json
import os
import logging
from typing import Dict, List, Any, Optional, Tuple
from contextlib import contextmanager

try:
    from strands.tools.mcp import MCPClient
    from mcp import stdio_client, StdioServerParameters
    STRANDS_AVAILABLE = True
except ImportError:
    STRANDS_AVAILABLE = False
    MCPClient = None
    stdio_client = None
    StdioServerParameters = None

logger = logging.getLogger(__name__)

class MCPManager:
    """Manages Ethereum MCP client for KiloMarket"""
    
    def __init__(self, config_path: str = None):
        if not STRANDS_AVAILABLE:
            logger.warning("StrandsAgents not available - MCP functionality disabled")
            self.config = {"mcp_servers": {}, "chain_mappings": {}}
        else:
            if config_path is None:
                config_path = os.path.join(os.getcwd(), "config", "mcp_config.json")
            
            self.config_path = config_path
            self.config = self._load_config()
        
        self.active_clients: Dict[str, Tuple[MCPClient, Any]] = {}  # (client, session)
    
    def _load_config(self) -> Dict[str, Any]:
        """Load MCP configuration from file"""
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load MCP config from {self.config_path}: {e}")
            return {"mcp_servers": {}, "chain_mappings": {}}
    
    def get_required_mcps_for_chain(self, trading_chain: str) -> List[str]:
        """Get list of required MCP servers for a specific trading chain"""
        chain_mappings = self.config.get("chain_mappings", {})
        return chain_mappings.get(trading_chain, [])
    
    def _get_wallet_credentials(self) -> Optional[Dict[str, str]]:
        """Get wallet credentials from existing wallet settings"""
        try:
            from .wallet_settings import wallet_settings_manager
            
            wallet_config = wallet_settings_manager.get_configured_wallet()
            if not wallet_config:
                logger.error("No wallet configured")
                return None
            
            # Validate chain
            if wallet_config.get("chain") != "ethereum_sepolia":
                logger.error(f"Unsupported chain for MCP: {wallet_config.get('chain')}")
                return None
            
            return {
                "ETHEREUM_PRIVATE_KEY": wallet_config["private_key"],
                "ETHEREUM_SEPOLIA_RPC_URL": "https://eth-sepolia-testnet.api.pocket.network",
                "ETHEREUM_SEPOLIA_WS_URL": "wss://ethereum-sepolia-rpc.publicnode.com"
            }
        except Exception as e:
            logger.error(f"Failed to get wallet credentials: {e}")
            return None
    
    def create_mcp_client(self, mcp_name: str) -> Optional[MCPClient]:
        """Create an MCP client for the specified server"""
        if not STRANDS_AVAILABLE:
            logger.error("StrandsAgents not available - cannot create MCP client")
            return None
            
        mcp_servers = self.config.get("mcp_servers", {})
        server_config = mcp_servers.get(mcp_name)
        
        if not server_config:
            logger.error(f"MCP server config not found: {mcp_name}")
            return None
        
        try:
            # Get wallet credentials for environment variables
            credentials = self._get_wallet_credentials()
            if not credentials:
                logger.error(f"Failed to get wallet credentials for {mcp_name}")
                return None
            
            # Process environment variables
            env_vars = {}
            if "env" in server_config:
                for key, value in server_config["env"].items():
                    env_vars[key] = value
            
            # Add wallet credentials to environment
            env_vars.update(credentials)
            
            # Create MCP client with environment variables
            client = MCPClient(lambda: stdio_client(
                StdioServerParameters(
                    command=server_config["command"],
                    args=server_config["args"],
                    env=env_vars if env_vars else None
                )
            ))
            logger.info(f"Created MCP client for {mcp_name}")
            return client
        except Exception as e:
            logger.error(f"Failed to create MCP client for {mcp_name}: {e}")
            return None
    
    def initialize_mcp_clients(self, trading_chain: str) -> Dict[str, Tuple[MCPClient, Any]]:
        """Initialize and maintain persistent MCP clients for a trading chain"""
        if not STRANDS_AVAILABLE:
            logger.warning("StrandsAgents not available - no MCP clients initialized")
            return {}
            
        required_mcps = self.get_required_mcps_for_chain(trading_chain)
        if not required_mcps:
            logger.warning(f"No MCP servers required for chain: {trading_chain}")
            return {}
        
        # Validate wallet is configured
        if not self._get_wallet_credentials():
            logger.error("Wallet not properly configured for MCP operations")
            return {}
        
        persistent_clients = {}
        
        for mcp_name in required_mcps:
            if mcp_name in self.active_clients:
                # Reuse existing client
                persistent_clients[mcp_name] = self.active_clients[mcp_name]
                logger.info(f"Reusing existing MCP client for {mcp_name}")
            else:
                # Create new persistent client
                client = self.create_mcp_client(mcp_name)
                if not client:
                    logger.warning(f"Failed to create MCP client: {mcp_name}")
                    continue
                
                try:
                    # Start the client and keep the session alive
                    session = client.__enter__()
                    persistent_clients[mcp_name] = (client, session)
                    self.active_clients[mcp_name] = (client, session)
                    logger.info(f"Initialized persistent MCP client for {mcp_name}")
                except Exception as e:
                    logger.error(f"Failed to initialize MCP client {mcp_name}: {e}")
        
        return persistent_clients
    
    def get_mcp_tools(self, trading_chain: str) -> Tuple[List[Any], Dict[str, Tuple[MCPClient, Any]]]:
        """Get all tools for a specific trading chain and return persistent clients"""
        if not STRANDS_AVAILABLE:
            logger.warning("StrandsAgents not available - no MCP tools available")
            return [], {}
            
        # Initialize persistent clients
        persistent_clients = self.initialize_mcp_clients(trading_chain)
        all_tools = []
        
        for mcp_name, (client, session) in persistent_clients.items():
            try:
                # Extract tools from the persistent session
                tools = client.list_tools_sync()
                all_tools.extend(tools)
                logger.info(f"Successfully collected {len(tools)} tools from {mcp_name}")
            except Exception as e:
                logger.error(f"Failed to get tools from {mcp_name}: {e}")
        
        return all_tools, persistent_clients
    
    def close_clients(self, trading_chain: str = None):
        """Close MCP clients for a specific chain or all clients"""
        if trading_chain:
            # Close specific chain clients
            required_mcps = self.get_required_mcps_for_chain(trading_chain)
            for mcp_name in required_mcps:
                if mcp_name in self.active_clients:
                    client, session = self.active_clients[mcp_name]
                    try:
                        client.__exit__(None, None, None)
                        logger.info(f"Closed MCP client for {mcp_name}")
                    except Exception as e:
                        logger.error(f"Error closing MCP client {mcp_name}: {e}")
                    finally:
                        del self.active_clients[mcp_name]
        else:
            # Close all clients
            for mcp_name, (client, session) in self.active_clients.items():
                try:
                    client.__exit__(None, None, None)
                    logger.info(f"Closed MCP client for {mcp_name}")
                except Exception as e:
                    logger.error(f"Error closing MCP client {mcp_name}: {e}")
            self.active_clients.clear()
    
    def is_available(self) -> bool:
        """Check if MCP functionality is available"""
        return STRANDS_AVAILABLE and bool(self._get_wallet_credentials())
    
    def get_status(self) -> Dict[str, Any]:
        """Get MCP manager status"""
        return {
            "available": self.is_available(),
            "strands_available": STRANDS_AVAILABLE,
            "wallet_configured": bool(self._get_wallet_credentials()),
            "active_clients": len(self.active_clients),
            "supported_chains": list(self.config.get("chain_mappings", {}).keys())
        }

# Global MCP manager instance
mcp_manager = MCPManager()