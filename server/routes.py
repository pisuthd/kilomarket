"""
Route handlers for KiloMarket
All API and page routes
"""

from fastapi.responses import HTMLResponse
from .templates import (
    main_page_template
)

def setup_routes(app):
    """Setup all routes for the FastAPI app"""

    @app.get("/")
    async def root():
        """Main terminal interface"""
        # return HTMLResponse(main_page_template(agent_manager.get_agents()))
        return HTMLResponse(main_page_template())