#!/usr/bin/env python3
"""
KiloMarket Web Terminal 
"""

import sys
import os
import threading
import time
from pathlib import Path

# Import server functionality
try:
    from server import start_server_thread, stop_server
    from server.a2a_server import a2a_manager
    WEB_SERVER_AVAILABLE = True
except ImportError:
    WEB_SERVER_AVAILABLE = False

def main():
    """Main entry point for KiloMarket Web Terminal"""
    server_started = False
    a2a_started = False
    try:
        # Start web server if available
        if WEB_SERVER_AVAILABLE:
            print("Starting KiloMarket Terminal server...")
            success, message = start_server_thread()
            if success:
                server_started = True
                print(f"✓ {message}")
                print(f"🌐 Web Terminal is now available at: {message}")
                print("📝 Open your browser and navigate to the URL above")
                print("🎮 Use arrow keys to navigate, Enter to select, Escape to go back")
                print("⏹️  Press Ctrl+C here to stop the server")
                print("🤖 A2A Server can be enabled/disabled from the main menu")
            else:
                print(f"⚠ {message}")
                sys.exit(1)
        else:
            print("❌ Web server not available. Please install required dependencies.")
            print("Run: pip install fastapi uvicorn[standard]")
            sys.exit(1)
        
        # Keep the main thread alive
        while True:
            time.sleep(1)
        
    except KeyboardInterrupt:
        print("\n👋 Goodbye! Thanks for using KiloMarket Web Terminal.")
        
        # Stop A2A server if it was started
        if a2a_started and WEB_SERVER_AVAILABLE:
            try:
                a2a_manager.stop_server()
                print("A2A Server stopped.")
            except:
                pass
        
        # Stop web server if it was started
        if server_started and WEB_SERVER_AVAILABLE:
            stop_server()
            print("Web Terminal server stopped.")
            
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        print("Please check your configuration and try again.")
        
        # Stop A2A server on error
        if a2a_started and WEB_SERVER_AVAILABLE:
            try:
                a2a_manager.stop_server()
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
                a2a_manager.stop_server()
            except:
                pass
        
        if server_started and WEB_SERVER_AVAILABLE:
            stop_server()


if __name__ == "__main__":
    main()