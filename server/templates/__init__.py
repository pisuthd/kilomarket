"""
Templates package

This package contains organized template modules for different parts of the application:
- base: Base template and shared components
- main: Main menu templates
"""

# Import all template functions for backward compatibility
from .base import base_template, KILOMARKET_ASCII
from .main import main_page_template

__all__ = [
    # Base templates
    'base_template',
    'KILOMARKET_ASCII',
    
    # Main templates
    'main_page_template', 
     
]
