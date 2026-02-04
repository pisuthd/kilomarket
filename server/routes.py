"""
Route handlers for KiloMarket
All API and page routes
"""

from fastapi.responses import HTMLResponse, JSONResponse
from .templates import (
    main_page_template
)
from .a2a_server import get_a2a_manager
  

def setup_routes(app):
    """Setup all routes for the FastAPI app"""

    @app.get("/")
    async def root():
        """Main terminal interface"""
        a2a_manager = get_a2a_manager()
        a2a_status = a2a_manager.get_status()
        return HTMLResponse(main_page_template(a2a_status))
    
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
 
