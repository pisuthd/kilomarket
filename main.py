#!/usr/bin/env python3
"""
KiloMarket Agent Management System
"""
 

import sys
import os
import threading
import time
from pathlib import Path

# Import server functionality
try:
    from server import start_server_thread, stop_server
    from server.a2a_server import get_a2a_manager
    WEB_SERVER_AVAILABLE = True
    IMPORT_ERROR = None
except Exception as e:
    WEB_SERVER_AVAILABLE = False
    IMPORT_ERROR = e 

def main():
    """Main entry point for KiloMarket Agent Manager""" 
    server_started = False
    a2a_started = False
    try:
        # Start web server if available
        if WEB_SERVER_AVAILABLE:
            print("Starting KiloMarket Agent Management System...")
            success, message = start_server_thread()
            if success:
                server_started = True
                print(f"✓ {message}")
                print(f"🌐 Management interface is now available at: {message}")
                print("📝 Open your browser to access the agent control panel")
                print("🎮 Use the web interface to manage agents and services")
                print("⏹️  Press Ctrl+C here to stop the management server")
                print("🤖 Agent servers can be enabled/disabled from the web interface")
 
            else:
                print(f"⚠ {message}")
                sys.exit(1)
        else:
            print("❌ Agent Management System not available.") 
            
            if IMPORT_ERROR:
                error_type = type(IMPORT_ERROR).__name__
                error_msg = str(IMPORT_ERROR)
                
                print(f"Error type: {error_type}")
                print(f"Error details: {error_msg}")
                
                # Provide specific guidance based on error type
                if "ModuleNotFoundError" in error_type or "No module named" in error_msg:
                    missing_module = error_msg.split("'")[-2] if "'" in error_msg else "unknown"
                    if missing_module in ["fastapi", "uvicorn"]:
                        print(f"💡 Missing {missing_module}. Install with:")
                        print(f"   pip install {missing_module}")
                        if missing_module == "uvicorn":
                            print("   pip install uvicorn[standard]")
                    elif missing_module.startswith("strands"):
                        print(f"💡 Missing {missing_module}. Install with:")
                        print("   pip install strands-agents strands-agents-tools")
                        print("   pip install strands-agents[anthropic,gemini,openai,a2a]")
                    else:
                        print(f"💡 Missing module '{missing_module}'. Install with:")
                        print(f"   pip install {missing_module}")
                
                elif "SyntaxError" in error_type:
                    print("💡 Syntax error detected in agent code.")
                    print("   Check the agent modules for syntax issues.")
                    print("   Common causes: missing colons, incorrect indentation, unclosed strings/brackets")
                
                elif "ImportError" in error_type:
                    if "circular import" in error_msg.lower():
                        print("💡 Circular import detected.")
                        print("   Check for circular dependencies between agent modules")
                    else:
                        print("💡 Import error occurred.")
                        print("   Check if all required agent modules are properly installed")
                        print("   Verify the agent module structure is correct")
 
                
                elif "PermissionError" in error_type:
                    print("💡 Permission error detected.")
                    print("   Check file permissions for agent modules")
                    print("   Try running with appropriate permissions")
                
                else:
                    print("💡 Unexpected error occurred while loading agent modules.")
                    print("   Check the error details above for more information")
                
                print("\n🔧 Agent System troubleshooting:")
                print("1. Ensure all agent dependencies are installed:")
                print("   pip install -r requirements.txt")
                print("2. Check agent module files for syntax errors")
                print("3. Verify Python path and agent module structure")
                print("4. Check file permissions and disk space")
            else:
                print("Unknown error occurred while loading agent modules.")
                print("Run: pip install -r requirements.txt")
 
            
            sys.exit(1)
        
        # Keep the main thread alive
        while True:
            time.sleep(1)
        
    except KeyboardInterrupt:
        print("\n👋 Goodbye! Thanks for using KiloMarket Agent Management System.")
        
        # Stop A2A server if it was started
        if a2a_started and WEB_SERVER_AVAILABLE:
            try:
                get_a2a_manager().stop_all_servers()
                print("Agent servers stopped.")
            except:
                pass
   
        
        # Stop web server if it was started
        if server_started and WEB_SERVER_AVAILABLE:
            stop_server()
            print("Management server stopped.")
            
    except Exception as e:
        print(f"\n❌ An error occurred in Agent Management System: {e}")
        print("Please check your agent configuration and try again.")
   
        
        # Stop A2A server on error
        if a2a_started and WEB_SERVER_AVAILABLE:
            try:
                get_a2a_manager().stop_all_servers()
            except:
                pass
        
        # Stop web server on error
        if server_started and WEB_SERVER_AVAILABLE:
            stop_server()
            
        sys.exit(1)
    finally:
        # Ensure servers are stopped on exit
        if a2a_started and WEB_SERVER_AVAILABLE:
            try:
                get_a2a_manager().stop_all_servers()
            except:
                pass
 
        
        if server_started and WEB_SERVER_AVAILABLE:
            stop_server()


if __name__ == "__main__":
    main()