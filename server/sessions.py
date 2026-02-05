"""
Session management for KiloMarket
Handles interactive session persistence using simple file storage (based on tradearena-cc approach)
"""

import os
import json
import glob
import logging
import shutil
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class KiloMarketSessionManager:
    """Manages interactive sessions with simple file storage"""
    
    def __init__(self, sessions_dir: str = "sessions"):
        self.sessions_dir = sessions_dir
        os.makedirs(sessions_dir, exist_ok=True)
        
        # Load session configurations  
        self.session_configs = self._load_session_configs()
    
    def _load_session_configs(self) -> Dict:
        """Load session configurations from config file"""
        try:
            from .settings import settings_manager
            settings = settings_manager.load_settings()
            return settings.get("sessions", {}).get("passcodes", {})
        except Exception as e:
            logger.error(f"Error loading session configs: {e}")
            return {}
    
    def _save_session_configs(self, configs: Dict):
        """Save session configurations to config file"""
        try:
            from .settings import settings_manager
            settings = settings_manager.load_settings()
            if "sessions" not in settings:
                settings["sessions"] = {}
            settings["sessions"]["passcodes"] = configs
            settings_manager.save_settings(settings)
        except Exception as e:
            logger.error(f"Error saving session configs: {e}")
    
    def create_session(self, approval_data: str, passcode: str, ai_provider: Dict) -> str:
        """Create a new interactive session"""
        session_id = str(uuid.uuid4())
        
        # Create session directory  
        session_dir = os.path.join(self.sessions_dir, f"session_{session_id}")
        os.makedirs(session_dir, exist_ok=True)
        
        # Create session metadata file  
        session_data = {
            "session_id": session_id,
            "session_type": "interactive",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "approval_data": approval_data,
            "ai_provider": ai_provider
        }
        
        session_file = os.path.join(session_dir, "session.json")
        with open(session_file, 'w') as f:
            json.dump(session_data, f, indent=2)
        
        # Store passcode in config
        self.session_configs[session_id] = passcode
        self._save_session_configs(self.session_configs)
        
        logger.info(f"Created new session: {session_id}")
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session metadata"""
        try:
            session_file = os.path.join(self.sessions_dir, f"session_{session_id}", "session.json")
            if os.path.exists(session_file):
                with open(session_file, 'r') as f:
                    return json.load(f)
            return None
        except Exception as e:
            logger.error(f"Error getting session {session_id}: {e}")
            return None
    
    def list_sessions(self) -> List[Dict]:
        """List all available sessions with metadata (tradearena-cc style)"""
        sessions = []
        
        # Find all session directories
        session_dirs = glob.glob(os.path.join(self.sessions_dir, "session_*"))
        
        for session_dir in session_dirs:
            session_file = os.path.join(session_dir, "session.json")
            if os.path.exists(session_file):
                try:
                    with open(session_file, 'r') as f:
                        session_data = json.load(f)
                    
                    # Calculate session size
                    session_size = self._calculate_session_size(session_dir)
                    
                    # Get message count
                    message_count = self._get_message_count(session_dir)
                    
                    # Extract session ID from directory name
                    session_id = os.path.basename(session_dir).replace("session_", "")
                    
                    session_info = {
                        "session_id": session_id,
                        "session_type": session_data.get("session_type", "interactive"),
                        "created_at": session_data.get("created_at"),
                        "updated_at": session_data.get("updated_at"),
                        "approval_data": session_data.get("approval_data", ""),
                        "ai_provider": session_data.get("ai_provider", {}),
                        "message_count": message_count,
                        "file_size": session_size,
                        "has_passcode": session_id in self.session_configs
                    }
                    
                    sessions.append(session_info)
                    
                except Exception as e:
                    logger.error(f"Error loading session {session_dir}: {e}")
                    continue
        
        # Sort by last activity (most recent first)
        sessions.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        return sessions
    
    def get_session_messages(self, session_id: str) -> List[Dict[str, Any]]:
        """Load all messages from a specific session"""
        session_dir = os.path.join(self.sessions_dir, f"session_{session_id}")
        
        if not os.path.exists(session_dir):
            return []
        
        # Find agent directory
        agent_dirs = glob.glob(os.path.join(session_dir, "agents", "agent_*"))
        if not agent_dirs:
            return []
        
        agent_dir = agent_dirs[0]
        message_files = glob.glob(os.path.join(agent_dir, "messages", "message_*.json"))
        
        # Sort messages by ID
        message_files.sort(key=lambda x: int(os.path.basename(x).split("_")[1].split(".")[0]))
        
        messages = []
        for message_file in message_files:
            try:
                with open(message_file, 'r') as f:
                    message_data = json.load(f)
                    
                # Extract text content
                message = message_data.get("message", {})
                content = message.get("content", [])
                
                text_content = ""
                if content and len(content) > 0:
                    # Handle new message structure with reasoningContent and text
                    for content_item in content:
                        if isinstance(content_item, dict):
                            # Look for direct text content (not reasoningContent)
                            if "text" in content_item and content_item["text"].strip():
                                text_content = content_item["text"]
                                logger.debug(f"Found text content: {text_content[:100]}...")
                                break
                            # Handle old structure as fallback
                            elif "text" in content_item:
                                text_content = content_item["text"]
                
                formatted_message = {
                    "role": message.get("role", "unknown"),
                    "content": text_content,
                    "message_id": message_data.get("message_id"),
                    "created_at": message_data.get("created_at"),
                    "updated_at": message_data.get("updated_at")
                }
                
                # Only add messages with actual content (filter out blank/empty messages)
                if text_content and text_content.strip():
                    messages.append(formatted_message)
                else:
                    logger.debug(f"Skipping blank message: {message_data.get('message_id')}")
            except Exception as e:
                logger.error(f"Error loading message {message_file}: {e}")
                continue
        
        return messages
    
    def get_session_manager(self, session_id: str):
        """Get FileSessionManager for a session"""
        try:
            # Import here to avoid circular imports
            try:
                from strands.session.file_session_manager import FileSessionManager
            except ImportError:
                logger.error("StrandsAgents FileSessionManager not available")
                return None
            
            # Create session directory if it doesn't exist
            session_dir = os.path.join(self.sessions_dir, f"session_{session_id}")
            os.makedirs(session_dir, exist_ok=True)
            
            # Create and return FileSessionManager
            return FileSessionManager(
                session_id=session_id,
                storage_dir=self.sessions_dir
            )
        except Exception as e:
            logger.error(f"Error creating session manager for {session_id}: {e}")
            return None
    
    def get_passcode(self, session_id: str) -> Optional[str]:
        """Get passcode for a session"""
        return self.session_configs.get(session_id)
    
    def update_session_timestamp(self, session_id: str):
        """Update session timestamp"""
        try:
            session_file = os.path.join(self.sessions_dir, f"session_{session_id}", "session.json")
            if os.path.exists(session_file):
                with open(session_file, 'r') as f:
                    session_data = json.load(f)
                session_data["updated_at"] = datetime.now().isoformat()
                with open(session_file, 'w') as f:
                    json.dump(session_data, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error updating session timestamp {session_id}: {e}")
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session and its data"""
        try:
            # Remove passcode from config
            if session_id in self.session_configs:
                del self.session_configs[session_id]
                self._save_session_configs(self.session_configs)
            
            # Remove session directory
            session_dir = os.path.join(self.sessions_dir, f"session_{session_id}")
            if os.path.exists(session_dir):
                shutil.rmtree(session_dir)
            
            logger.info(f"Successfully deleted session: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting session {session_id}: {e}")
            return False
    
    def _calculate_session_size(self, session_dir: str) -> str:
        """Calculate total size of session files in human-readable format"""
        total_size = 0
        
        for root, dirs, files in os.walk(session_dir):
            for file in files:
                if file.endswith('.json'):
                    file_path = os.path.join(root, file)
                    try:
                        total_size += os.path.getsize(file_path)
                    except OSError:
                        continue
        
        # Convert to human-readable format
        if total_size < 1024:
            return f"{total_size}B"
        elif total_size < 1024 * 1024:
            return f"{total_size // 1024}KB"
        else:
            return f"{total_size // (1024 * 1024)}MB"
    
    def _get_message_count(self, session_dir: str) -> int:
        """Get message count for a session"""
        try:
            # Extract session ID from directory name
            session_id = os.path.basename(session_dir).replace("session_", "")
            messages = self.get_session_messages(session_id)
            return len(messages)
        except Exception as e:
            logger.error(f"Error getting message count {session_dir}: {e}")
            return 0
    
    def _get_provider_display_name(self, provider_id: str) -> str:
        """Get display name for AI provider (tradearena-cc style)"""
        try:
            # Import here to avoid circular imports
            from .ai_provider import AI_PROVIDERS
        except ImportError:
            # Fallback if import fails
            AI_PROVIDERS = [
                {"id": "amazon_bedrock", "name": "Amazon Bedrock"},
                {"id": "anthropic", "name": "Anthropic"},
                {"id": "gemini", "name": "Gemini"},
                {"id": "openai_compatible", "name": "OpenAI Compatible"}
            ]
        
        # Handle provider ID mapping for consistency
        provider_mapping = {
            "amazon-bedrock": "amazon_bedrock",
            "openai-compatible": "openai_compatible",
            "openai compatible": "openai_compatible"
        }
        
        # Normalize provider ID
        normalized_provider_id = provider_mapping.get(provider_id, provider_id)
        
        provider_display = "Unknown"
        for provider in AI_PROVIDERS:
            if provider["id"] == normalized_provider_id:
                provider_display = provider["name"]
                break
        
        # If still unknown, try to create a display name from the provider_id
        if provider_display == "Unknown" and provider_id:
            provider_display = provider_id.replace("-", " ").replace("_", " ").title()
        
        return provider_display

# Global session manager instance
session_manager = KiloMarketSessionManager()