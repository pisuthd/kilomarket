"""
Route handlers for KiloMarket
All API and page routes
"""

from fastapi import Request
from fastapi.responses import HTMLResponse, JSONResponse
from .templates import (
    main_page_template
)
from .templates.ai_provider import ai_provider_template
from .a2a_server import get_a2a_manager
from .ai_provider import ai_provider_manager
  

def setup_routes(app):
    """Setup all routes for the FastAPI app"""

    @app.get("/")
    async def root():
        """Main terminal interface"""
        a2a_manager = get_a2a_manager()
        a2a_status = a2a_manager.get_status()
        ai_provider_status = ai_provider_manager.get_provider_status()
        return HTMLResponse(main_page_template(a2a_status, ai_provider_status))
    
    @app.post("/toggle-a2a")
    async def toggle_a2a():
        """Toggle A2A server on/off"""
        a2a_manager = get_a2a_manager()
        success, message = a2a_manager.toggle_servers()
        
        status = a2a_manager.get_status()
        return JSONResponse({
            "success": success,
            "message": message,
            "status": status
        })
    
    @app.get("/a2a-status")
    async def a2a_status():
        """Get current A2A server status"""
        a2a_manager = get_a2a_manager()
        status = a2a_manager.get_status()
        return JSONResponse(status)
    
    @app.get("/ai-provider")
    async def ai_provider_page():
        """AI Provider configuration page"""
        current_provider = ai_provider_manager.get_configured_provider()
        return HTMLResponse(ai_provider_template(current_provider))
    
    @app.get("/api/ai-provider/status")
    async def get_ai_provider_status():
        """Get current AI provider status"""
        status = ai_provider_manager.get_provider_status()
        return JSONResponse(status)
    
    @app.post("/api/ai-provider/configure")
    async def configure_ai_provider(request: Request):
        """Configure AI provider"""
        try:
            data = await request.json()
            provider = data.get("provider")
            
            if not provider:
                return JSONResponse({
                    "success": False,
                    "error": "Provider is required"
                })
            
            # Validate provider and get allowed fields
            from .ai_provider import PROVIDER_CONFIGS
            provider_config = PROVIDER_CONFIGS.get(provider)
            if not provider_config:
                return JSONResponse({
                    "success": False,
                    "error": f"Unknown provider: {provider}"
                })
            
            allowed_fields = provider_config.get("fields", [])
            defaults = provider_config.get("defaults", {})
            
            # Only include allowed fields for this provider
            config_data = {}
            for field in allowed_fields:
                if field in data:
                    config_data[field] = data[field]
                elif field in defaults:
                    # Use default value if not provided
                    config_data[field] = defaults[field]
            
            success = ai_provider_manager.configure_provider(provider, config_data)
            
            if success:
                return JSONResponse({
                    "success": True,
                    "message": "AI Provider configured successfully"
                })
            else:
                return JSONResponse({
                    "success": False,
                    "error": "Failed to configure AI Provider"
                })
        except Exception as e:
            return JSONResponse({
                "success": False,
                "error": str(e)
            })
    
    @app.post("/api/ai-provider/clear")
    async def clear_ai_provider():
        """Clear AI provider configuration"""
        try:
            success = ai_provider_manager.clear_provider()
            
            if success:
                return JSONResponse({
                    "success": True,
                    "message": "AI Provider configuration cleared"
                })
            else:
                return JSONResponse({
                    "success": False,
                    "error": "Failed to clear AI Provider"
                })
        except Exception as e:
            return JSONResponse({
                "success": False,
                "error": str(e)
            })
    
    @app.get("/api/ai-providers")
    async def get_ai_providers():
        """Get available AI providers"""
        from .ai_provider import AI_PROVIDERS
        return JSONResponse({"providers": AI_PROVIDERS})
 
