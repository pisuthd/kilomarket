"""
Route handlers for KiloMarket
All API and page routes
"""

from fastapi import Request, Query
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
import asyncio
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

from .templates import (
    main_page_template
)
from .templates.ai_provider import ai_provider_template
from .templates.interactive import interactive_mode_template, new_session_template, chat_session_template
from .a2a_server import get_a2a_manager
from .ai_provider import ai_provider_manager
from .sessions import session_manager
  

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
    
    # Interactive Mode Routes
    @app.get("/interactive")
    async def interactive():
        """Interactive mode page"""
        return HTMLResponse(interactive_mode_template())
    
    @app.get("/new-session")
    async def new_session():
        """New session creation page"""
        ai_provider_status = ai_provider_manager.get_provider_status()
        return HTMLResponse(new_session_template(ai_provider_status))
    
    @app.post("/create-session")
    async def create_session(request: Request):
        """Create new interactive session"""
        try:
            data = await request.json()
            approval_data = data.get("approval_data", "").strip()
            passcode = data.get("passcode", "").strip()
            
            # Validation
            if not approval_data:
                return JSONResponse({
                    "success": False,
                    "error": "Approval data is required"
                })
            
            if not passcode or not passcode.isdigit() or len(passcode) < 4 or len(passcode) > 8:
                return JSONResponse({
                    "success": False,
                    "error": "Passcode must be 4-8 digits"
                })
            
            # Check if AI provider is configured
            ai_provider_config = ai_provider_manager.get_configured_provider()
            if not ai_provider_config:
                return JSONResponse({
                    "success": False,
                    "error": "AI Provider must be configured before creating a session"
                })
            
            # Create session
            session_id = session_manager.create_session(
                approval_data=approval_data,
                passcode=passcode,
                ai_provider=ai_provider_config
            )
            
            return JSONResponse({
                "success": True,
                "session_id": session_id,
                "message": "Session created successfully"
            })
            
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            return JSONResponse({
                "success": False,
                "error": f"Failed to create session: {str(e)}"
            })
    
    @app.get("/resume-session/{session_id}")
    async def resume_session(session_id: str):
        """Resume a specific session"""
        try:
            session_data = session_manager.get_session(session_id)
            if not session_data:
                return HTMLResponse("""
<!DOCTYPE html>
<html>
<head><title>Session Not Found</title></head>
<body>
<script>alert('Session not found'); window.location.href='/interactive';</script>
</body>
</html>
                """)
            
            # Load session messages
            messages = session_manager.get_session_messages(session_id)
            
            return HTMLResponse(chat_session_template(session_id, session_data, messages))
            
        except Exception as e:
            logger.error(f"Error resuming session {session_id}: {e}")
            return HTMLResponse(f"""
<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
<script>alert('Error resuming session: {str(e)}'); window.location.href='/interactive';</script>
</body>
</html>
            """)
    
    @app.get("/chat/{session_id}")
    async def chat_session(session_id: str):
        """Chat session page"""
        try:
            session_data = session_manager.get_session(session_id)
            if not session_data:
                return HTMLResponse("""
<!DOCTYPE html>
<html>
<head><title>Session Not Found</title></head>
<body>
<script>alert('Session not found'); window.location.href='/interactive';</script>
</body>
</html>
                """)
            
            return HTMLResponse(chat_session_template(session_id, session_data))
            
        except Exception as e:
            logger.error(f"Error loading chat session {session_id}: {e}")
            return HTMLResponse(f"""
<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
<script>alert('Error loading chat session: {str(e)}'); window.location.href='/interactive';</script>
</body>
</html>
            """)
    
    @app.get("/chat-stream/{session_id}")
    async def chat_stream(session_id: str, message: str = Query(...)):
        """Streaming endpoint for chat messages"""
        agent_instance = None
        try:
            # Get session data
            session_data = session_manager.get_session(session_id)
            if not session_data:
                return {"error": "Session not found"}
            
            # Get session manager for this session
            strands_session_manager = session_manager.get_session_manager(session_id)
            if not strands_session_manager:
                return {"error": "Failed to create session manager"}
            
            # Initialize StrandsAgents agent
            try:
                from .agent_utils import initialize_strands_agent
                agent_instance, agent_session_id = initialize_strands_agent(
                    session_data, session_id, strands_session_manager
                )
            except ImportError as e:
                logger.error(f"StrandsAgents not available: {e}")
                return {"error": "StrandsAgents not available. Please install strands-agents package."}
            
            logger.info(f"Initialized agent for session {session_id}")
            
            async def generate_response():
                try:
                    # Update session timestamp
                    session_manager.update_session_timestamp(session_id)
                    
                    # Stream response from agent
                    agent_stream = agent_instance.stream_async(message)
                    async for event in agent_stream:
                        # Extract text content
                        text_content = ""
                        if isinstance(event, dict):
                            if 'data' in event and isinstance(event['data'], str) and event['data'].strip():
                                text_content = event['data']
                        elif isinstance(event, str):
                            text_content = event
                        
                        # Send non-empty text content
                        if text_content and text_content.strip():
                            yield f"data: {text_content}\n\n"
                    
                    yield "data: [DONE]\n\n"
                except Exception as e:
                    logger.error(f"Stream error: {str(e)}")
                    import traceback
                    logger.error(f"Traceback: {traceback.format_exc()}")
                    yield f"data: [ERROR] {str(e)}\n\n"
                finally:
                    # Clean up agent resources when stream ends
                    if agent_instance:
                        try:
                            agent_instance.cleanup()
                        except:
                            pass
            
            return StreamingResponse(
                generate_response(),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
            )
            
        except Exception as e:
            logger.error(f"Chat stream error: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            # Clean up on error
            if agent_instance:
                try:
                    agent_instance.cleanup()
                except:
                    pass
                    
            return {"error": str(e)}
    
    @app.get("/delete-session/{session_id}")
    async def delete_session(session_id: str):
        """Delete a specific session"""
        try:
            success = session_manager.delete_session(session_id)
            
            if success:
                return HTMLResponse("""
<!DOCTYPE html>
<html>
<head><title>Session Deleted</title></head>
<body>
<script>alert('Session deleted successfully!'); window.location.href='/interactive';</script>
</body>
</html>
                """)
            else:
                return HTMLResponse("""
<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
<script>alert('Session not found or could not be deleted'); window.location.href='/interactive';</script>
</body>
</html>
                """)
        except Exception as e:
            logger.error(f"Error deleting session {session_id}: {e}")
            return HTMLResponse(f"""
<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
<script>alert('Error deleting session: {str(e)}'); window.location.href='/interactive';</script>
</body>
</html>
            """)
    
    # Session API Endpoints
    @app.get("/api/sessions")
    async def get_sessions():
        """Get all available sessions"""
        try:
            sessions = session_manager.list_sessions()
            return {"sessions": sessions}
        except Exception as e:
            logger.error(f"Error getting sessions: {e}")
            return {"sessions": [], "error": str(e)}
 
