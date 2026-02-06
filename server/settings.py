"""
Settings manager for KiloMarket Web Terminal
Handles configuration persistence for AI provider and other settings
"""

import json
import os
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class SettingsManager:
    """Manages application settings persistence"""
    
    def __init__(self, settings_file: str = None):
        """Initialize settings manager with file path"""
        if settings_file is None:
            settings_dir = os.path.join(os.getcwd(), "config")
            os.makedirs(settings_dir, exist_ok=True)
            settings_file = os.path.join(settings_dir, "kilomarket_settings.json")
        
        self.settings_file = settings_file
        self._default_settings = {
            "ai_provider": {
                "enabled": False
            },
            "wallet": {
                "enabled": False
            }
        }
    
    def load_settings(self) -> Dict[str, Any]:
        """Load settings from file or return defaults"""
        try:
            if os.path.exists(self.settings_file):
                with open(self.settings_file, 'r', encoding='utf-8') as f:
                    settings = json.load(f)
                    logger.info(f"Loaded settings from {self.settings_file}")
                    return self._clean_settings(settings)
            else:
                logger.info(f"Settings file not found, using defaults: {self.settings_file}")
                return self._default_settings.copy()
        except Exception as e:
            logger.error(f"Error loading settings: {e}")
            return self._default_settings.copy()
    
    def save_settings(self, settings: Dict[str, Any]) -> bool:
        """Save settings to file"""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.settings_file), exist_ok=True)
            
            # Clean settings to only include valid fields
            clean_settings = self._clean_settings(settings)
            
            with open(self.settings_file, 'w', encoding='utf-8') as f:
                json.dump(clean_settings, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Settings saved to {self.settings_file}")
            return True
        except Exception as e:
            logger.error(f"Error saving settings: {e}")
            return False
    
    def is_ai_provider_enabled(self) -> bool:
        """Check if AI provider is enabled"""
        settings = self.load_settings()
        return settings.get("ai_provider", {}).get("enabled", False)
    
    def get_ai_provider_settings(self) -> Dict[str, Any]:
        """Get AI provider-specific settings"""
        settings = self.load_settings()
        return settings.get("ai_provider", self._default_settings["ai_provider"])
    
    def save_ai_provider_settings(self, ai_provider_config: Dict[str, Any]) -> bool:
        """Save AI provider-specific settings"""
        settings = self.load_settings()
        settings["ai_provider"] = ai_provider_config
        return self.save_settings(settings)
    
    def is_wallet_enabled(self) -> bool:
        """Check if wallet is enabled"""
        settings = self.load_settings()
        return settings.get("wallet", {}).get("enabled", False)
    
    def get_wallet_settings(self) -> Dict[str, Any]:
        """Get wallet-specific settings"""
        settings = self.load_settings()
        return settings.get("wallet", self._default_settings["wallet"])
    
    def save_wallet_settings(self, wallet_config: Dict[str, Any]) -> bool:
        """Save wallet-specific settings"""
        settings = self.load_settings()
        settings["wallet"] = wallet_config
        return self.save_settings(settings)
    
    def _clean_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Clean settings to only include valid fields"""
        clean_settings = self._default_settings.copy()
        
        for key, value in settings.items():
            if key == "ai_provider":
                # For AI provider settings, keep the structure but ensure valid fields
                if isinstance(value, dict):
                    clean_settings[key] = value
                else:
                    clean_settings[key] = self._default_settings[key]
            elif key == "wallet":
                # For wallet settings, keep the structure but ensure valid fields
                if isinstance(value, dict):
                    clean_settings[key] = value
                else:
                    clean_settings[key] = self._default_settings[key]
            else:
                # For other settings, keep as-is for future extensibility
                clean_settings[key] = value
        
        return clean_settings

# Global settings manager instance
settings_manager = SettingsManager()