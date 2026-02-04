"""
A2A Server Management for KiloMarket
Handles multiple Agent-to-Agent servers with fixed ports
"""

import logging
import threading
import time
import socket
from typing import Optional, Dict, Any, List
from strands import Agent
from strands.multiagent.a2a import A2AServer
from strands_tools.calculator import calculator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class A2AServerInstance:
    """Individual A2A server instance"""
    
    def __init__(self, port: int, agent_name: str, agent_description: str, tools: list, host: str = "0.0.0.0"):
        self.port = port
        self.host = host
        self.agent_name = agent_name
        self.agent_description = agent_description
        self.tools = tools
        
        self.server: Optional[A2AServer] = None
        self.agent: Optional[Agent] = None
        self.thread: Optional[threading.Thread] = None
        self.running = False
        self.start_time: Optional[float] = None
        self._lock = threading.Lock()
    
    def create_agent(self) -> Agent:
        """Create the agent for this server"""
        return Agent(
            name=self.agent_name,
            description=self.agent_description,
            tools=self.tools,
            callback_handler=None
        )
    
    def start(self) -> tuple[bool, str]:
        """Start this server instance"""
        with self._lock:
            if self.running:
                return True, f"Server {self.agent_name} already running on {self.host}:{self.port}"
            
            try:
                # Check if port is available
                if not self._is_port_available(self.port):
                    return False, f"Port {self.port} is already in use"
                
                # Create agent and server
                self.agent = self.create_agent()
                self.server = A2AServer(agent=self.agent, host=self.host, port=self.port)
                
                # Start server in background thread
                def run_server():
                    self.running = True
                    self.start_time = time.time()
                    logger.info(f"A2A Server '{self.agent_name}' starting on {self.host}:{self.port}")
                    
                    try:
                        self.server.serve()
                    except Exception as e:
                        logger.error(f"A2A Server '{self.agent_name}' error: {e}")
                    finally:
                        self.running = False
                        logger.info(f"A2A Server '{self.agent_name}' stopped")
                
                self.thread = threading.Thread(target=run_server, daemon=True)
                self.thread.start()
                
                # Give server time to start
                time.sleep(1)
                
                # Check if server actually started
                if self.running:
                    return True, f"Server '{self.agent_name}' started on {self.host}:{self.port}"
                else:
                    return False, f"Server '{self.agent_name}' failed to start"
                
            except Exception as e:
                logger.error(f"Failed to start server '{self.agent_name}': {e}")
                return False, f"Failed to start server '{self.agent_name}': {str(e)}"
    
    def stop(self) -> tuple[bool, str]:
        """Stop this server instance"""
        with self._lock:
            if not self.running:
                return True, f"Server '{self.agent_name}' is not running"
            
            try:
                # Mark as stopped
                self.running = False
                
                # Wait a bit for the thread to finish
                if self.thread and self.thread.is_alive():
                    self.thread.join(timeout=2)
                
                # Clean up
                self.server = None
                self.agent = None
                self.start_time = None
                
                return True, f"Server '{self.agent_name}' stopped"
                
            except Exception as e:
                logger.error(f"Error stopping server '{self.agent_name}': {e}")
                return False, f"Error stopping server '{self.agent_name}': {str(e)}"
    
    def get_status(self) -> Dict[str, Any]:
        """Get server status"""
        with self._lock:
            uptime = None
            if self.start_time:
                uptime = time.time() - self.start_time
            
            return {
                "running": self.running,
                "host": self.host,
                "port": self.port,
                "agent_name": self.agent_name,
                "uptime_seconds": uptime,
                "server_url": f"http://{self.host}:{self.port}" if self.running else None
            }
    
    def _is_port_available(self, port: int) -> bool:
        """Check if a specific port is available"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('0.0.0.0', port))
                return True
        except OSError:
            return False


def create_placeholder_tools():
    """Create placeholder tools for the additional servers"""
    # Placeholder tools that do simple operations
    def echo_tool(message: str) -> str:
        """Echo the input message"""
        return f"Echo: {message}"
    
    def time_tool() -> str:
        """Get current time"""
        import datetime
        return f"Current time: {datetime.datetime.now().isoformat()}"
    
    def info_tool() -> str:
        """Get server information"""
        return "This is a placeholder A2A server for KiloMarket"
    
    return [echo_tool, time_tool, info_tool]


class MultiA2AServerManager:
    """Manages multiple A2A servers"""
    
    def __init__(self):
        self.servers: List[A2AServerInstance] = []
        self._lock = threading.Lock()
        self._setup_servers()
    
    def _setup_servers(self):
        """Set up the three A2A servers"""
        # Server 1: Calculator (port 9000)
        calc_server = A2AServerInstance(
            port=9000,
            agent_name="Calculator Agent",
            agent_description="A calculator agent that can perform basic arithmetic operations.",
            tools=[calculator]
        )
        
        # Server 2: Echo/Utility (port 9001)
        utility_server = A2AServerInstance(
            port=9001,
            agent_name="Utility Agent",
            agent_description="A utility agent that provides echo, time, and information services.",
            tools=create_placeholder_tools()
        )
        
        # Server 3: Info/Help (port 9002)
        info_server = A2AServerInstance(
            port=9002,
            agent_name="Info Agent",
            agent_description="An information agent that provides help and general information.",
            tools=create_placeholder_tools()
        )
        
        self.servers = [calc_server, utility_server, info_server]
    
    def start_all_servers(self) -> tuple[bool, str]:
        """Start all A2A servers"""
        with self._lock:
            if self._are_any_servers_running():
                return True, "Some or all A2A servers are already running"
            
            results = []
            for server in self.servers:
                success, message = server.start()
                results.append(f"Port {server.port}: {message}")
            
            # Check if at least one server started successfully
            successful_servers = sum(1 for s in self.servers if s.running)
            if successful_servers > 0:
                return True, f"Started {successful_servers}/{len(self.servers)} servers. " + "; ".join(results)
            else:
                return False, "Failed to start any servers. " + "; ".join(results)
    
    def stop_all_servers(self) -> tuple[bool, str]:
        """Stop all A2A servers"""
        with self._lock:
            if not self._are_any_servers_running():
                return True, "No A2A servers are currently running"
            
            results = []
            for server in self.servers:
                success, message = server.stop()
                results.append(f"Port {server.port}: {message}")
            
            return True, "All servers stopped. " + "; ".join(results)
    
    def _are_any_servers_running(self) -> bool:
        """Check if any servers are running"""
        return any(server.running for server in self.servers)
    
    def _are_all_servers_running(self) -> bool:
        """Check if all servers are running"""
        return all(server.running for server in self.servers)
    
    def get_status(self) -> Dict[str, Any]:
        """Get comprehensive status of all servers"""
        with self._lock:
            server_statuses = [server.get_status() for server in self.servers]
            
            return {
                "servers": server_statuses,
                "total_servers": len(self.servers),
                "running_servers": sum(1 for s in server_statuses if s["running"]),
                "all_running": self._are_all_servers_running(),
                "any_running": self._are_any_servers_running(),
                "ports": [s["port"] for s in server_statuses]
            }
    
    def toggle_servers(self) -> tuple[bool, str]:
        """Toggle all servers on/off"""
        if self._are_any_servers_running():
            return self.stop_all_servers()
        else:
            return self.start_all_servers()
    
    def is_running(self) -> bool:
        """Check if any servers are running"""
        return self._are_any_servers_running()


# Global multi-server manager instance
a2a_manager = MultiA2AServerManager()