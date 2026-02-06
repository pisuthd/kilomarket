"""
Wallet configuration management for KiloMarket
"""

import json
import os
from typing import Dict, Any, Optional
from pathlib import Path

class WalletSettingsManager:
    """Manage wallet configurations"""
    
    def __init__(self):
        self.config_dir = Path(__file__).parent.parent / "config"
        self.config_dir.mkdir(exist_ok=True)
        
    def get_wallet_status(self) -> Dict[str, Any]:
        """Get current wallet configuration status"""
        from .settings import settings_manager
        
        settings = settings_manager.load_settings()
        wallet_config = settings.get("wallet", {})
        
        if wallet_config.get("enabled", False) and wallet_config.get("private_key") and wallet_config.get("chain"):
            chain_name = self.get_chain_name(wallet_config.get("chain"))
            
            return {
                "configured": True,
                "private_key": "Set",
                "chain": wallet_config.get("chain"),
                "chain_name": chain_name,
                "status_text": "Already Set"
            }
        else:
            return {
                "configured": False,
                "private_key": None,
                "chain": None,
                "chain_name": None,
                "status_text": "Not set"
            }
    
    def get_chain_name(self, chain_id: str) -> str:
        """Get display name for chain ID"""
        for chain in WALLET_CHAINS:
            if chain["id"] == chain_id:
                return chain["name"]
        return chain_id
    
    def configure_wallet(self, private_key: str, chain: str) -> bool:
        """Configure wallet settings"""
        try:
            from .settings import settings_manager
            
            settings = settings_manager.load_settings()
            
            # Validate chain
            if not any(c["id"] == chain for c in WALLET_CHAINS):
                raise ValueError(f"Unsupported chain: {chain}")
            
            # Validate private key (basic validation)
            if not private_key or len(private_key.strip()) < 10:
                raise ValueError("Invalid private key")
            
            # Clean and validate private key format
            private_key = private_key.strip()
            if not private_key.startswith("0x"):
                private_key = "0x" + private_key
            
            # Basic hex validation
            try:
                int(private_key, 16)
            except ValueError:
                raise ValueError("Private key must be a valid hexadecimal string")
            
            # Save configuration
            settings["wallet"] = {
                "enabled": True,
                "private_key": private_key,
                "chain": chain
            }
            
            return settings_manager.save_settings(settings)
        except Exception as e:
            print(f"Error configuring wallet: {e}")
            return False
    
    def get_configured_wallet(self) -> Optional[Dict[str, Any]]:
        """Get the currently configured wallet"""
        from .settings import settings_manager
        
        settings = settings_manager.load_settings()
        wallet_config = settings.get("wallet", {})
        
        if wallet_config.get("enabled", False) and wallet_config.get("private_key") and wallet_config.get("chain"):
            return {
                "private_key": wallet_config.get("private_key"),
                "chain": wallet_config.get("chain")
            }
        return None
    
    def clear_wallet(self) -> bool:
        """Clear the wallet configuration"""
        try:
            from .settings import settings_manager
            
            settings = settings_manager.load_settings()
            settings["wallet"] = {"enabled": False}
            
            return settings_manager.save_settings(settings)
        except Exception as e:
            print(f"Error clearing wallet: {e}")
            return False

# Global wallet settings manager instance
wallet_settings_manager = WalletSettingsManager()

# Supported chains (currently only Ethereum Sepolia as requested)
WALLET_CHAINS = [
    {"id": "ethereum_sepolia", "name": "Ethereum Sepolia"}
]