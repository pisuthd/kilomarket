"""
AI Provider configuration management for KiloMarket
"""

import json
import os
from typing import Dict, Any, Optional
from pathlib import Path

class AIProviderManager:
    """Manage AI provider configurations"""
    
    def __init__(self):
        self.config_dir = Path(__file__).parent.parent / "config"
        self.config_dir.mkdir(exist_ok=True)
        
    def get_provider_status(self) -> Dict[str, Any]:
        """Get current AI provider status"""
        from .settings import settings_manager
        
        settings = settings_manager.load_settings()
        ai_provider_config = settings.get("ai_provider", {})
        
        if ai_provider_config.get("enabled", False) and ai_provider_config.get("provider"):
            provider_id = ai_provider_config.get("provider")
            provider_name = self.get_provider_name(provider_id)
            return {
                "configured": True,
                "provider": provider_id,
                "provider_name": provider_name,
                "status_text": f"AI Provider ({provider_name})"
            }
        else:
            return {
                "configured": False,
                "provider": None,
                "provider_name": None,
                "status_text": "AI Provider (Not Set)"
            }
    
    def get_provider_name(self, provider_id: str) -> str:
        """Get display name for provider ID"""
        for provider in AI_PROVIDERS:
            if provider["id"] == provider_id:
                return provider["name"]
        return provider_id
    
    def configure_provider(self, provider: str, config: Dict[str, Any]) -> bool:
        """Configure an AI provider"""
        try:
            from .settings import settings_manager
            
            settings = settings_manager.load_settings()
            
            # Validate provider
            if not any(p["id"] == provider for p in AI_PROVIDERS):
                raise ValueError(f"Unsupported AI provider: {provider}")
            
            # Validate required fields
            provider_config = PROVIDER_CONFIGS.get(provider, {})
            required_fields = provider_config.get("fields", [])
            
            for field in required_fields:
                if field not in config or not config[field]:
                    raise ValueError(f"Missing required field: {field}")
            
            # Save configuration
            settings["ai_provider"] = {
                "enabled": True,
                "provider": provider,
                "config": config
            }
            
            return settings_manager.save_settings(settings)
        except Exception as e:
            print(f"Error configuring AI provider: {e}")
            return False
    
    def get_configured_provider(self) -> Optional[Dict[str, Any]]:
        """Get the currently configured AI provider"""
        from .settings import settings_manager
        
        settings = settings_manager.load_settings()
        ai_provider_config = settings.get("ai_provider", {})
        
        if ai_provider_config.get("enabled", False) and ai_provider_config.get("provider"):
            return {
                "provider": ai_provider_config.get("provider"),
                "config": ai_provider_config.get("config", {})
            }
        return None
    
    def clear_provider(self) -> bool:
        """Clear the AI provider configuration"""
        try:
            from .settings import settings_manager
            
            settings = settings_manager.load_settings()
            settings["ai_provider"] = {"enabled": False}
            
            return settings_manager.save_settings(settings)
        except Exception as e:
            print(f"Error clearing AI provider: {e}")
            return False

# Global AI provider manager instance
ai_provider_manager = AIProviderManager()

# AI providers available (same as tradearena-cc)
AI_PROVIDERS = [
    {"id": "amazon_bedrock", "name": "Amazon Bedrock"},
    {"id": "anthropic", "name": "Anthropic"},
    {"id": "gemini", "name": "Gemini"},
    {"id": "openai_compatible", "name": "OpenAI Compatible"}
]

# Provider configuration specifications (simplified from tradearena-cc)
PROVIDER_CONFIGS = {
    "amazon_bedrock": {
        "fields": ["model_id", "region_name"],
        "defaults": {
            "model_id": "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
            "region_name": "us-east-1"
        },
        "credentials_type": "aws_env",
        "display_name": "Amazon Bedrock"
    },
    "anthropic": {
        "fields": ["api_key", "model_id"],
        "defaults": {
            "model_id": "claude-sonnet-4-5-20250929"
        },
        "credentials_type": "api_key",
        "display_name": "Anthropic"
    },
    "gemini": {
        "fields": ["api_key", "model_id"],
        "defaults": {
            "model_id": "gemini-2.5-flash"
        },
        "credentials_type": "api_key",
        "display_name": "Gemini"
    },
    "openai_compatible": {
        "fields": ["api_key", "base_url", "model_id"],
        "defaults": {
            "model_id": "gpt-4o",
            "base_url": ""
        },
        "credentials_type": "api_key",
        "display_name": "OpenAI Compatible",
        "placeholders": {
            "base_url": "Leave blank for OpenAI server"
        }
    }
}