"""
AI Provider configuration templates for KiloMarket Web Terminal
"""

from ..static import MENU_JS
from .base import base_template, KILOMARKET_ASCII

def ai_provider_template(current_provider: dict = None, error_message: str = None) -> str:
    """AI Provider configuration page template"""
    
    # Import AI providers from the ai_provider module
    from ..ai_provider import AI_PROVIDERS, PROVIDER_CONFIGS
    
    # Generate provider selection options
    provider_options = ""
    for provider in AI_PROVIDERS:
        selected = "selected" if current_provider and current_provider.get("provider") == provider["id"] else ""
        provider_options += f'<option value="{provider["id"]}" {selected}>{provider["name"]}</option>\n'
    
    # Generate configuration forms for each provider
    config_forms = ""
    for provider in AI_PROVIDERS:
        provider_id = provider["id"]
        config_spec = PROVIDER_CONFIGS.get(provider_id, {})
        fields = config_spec.get("fields", [])
        defaults = config_spec.get("defaults", {})
        placeholders = config_spec.get("placeholders", {})
        
        # Generate form fields for this provider
        form_fields = ""
        for field in fields:
            field_type = "password" if "key" in field.lower() else "text"
            default_value = defaults.get(field, "")
            placeholder = placeholders.get(field, f"Enter {field.replace('_', ' ').title()}")
            
            # Use current provider config if available
            if current_provider and current_provider.get("provider") == provider_id:
                current_config = current_provider.get("config", {})
                default_value = current_config.get(field, default_value)
            
            form_fields += f"""
                    <div class="form-group">
                        <label for="{field}">{field.replace('_', ' ').title()}:</label>
                        <input type="{field_type}" id="{field}" name="{field}" 
                               value="{default_value}" placeholder="{placeholder}" 
                               class="form-input">
                    </div>"""
        
        # Add provider-specific help text
        help_text = ""
        if provider_id == "amazon_bedrock":
            help_text = """
                    <div class="help-text">
                        <strong>Note:</strong> Make sure your AWS credentials are configured in environment.
                    </div>"""
        elif provider_id == "openai_compatible":
            help_text = """
                    <div class="help-text">
                        <strong>Note:</strong> Use this for OpenAI API or compatible services like LocalAI, Ollama, etc.
                    </div>"""
        
        config_forms += f"""
        <div id="config-{provider_id}" class="provider-config" style="display: none;">
            <h3>{config_spec.get("display_name", provider["name"])} Configuration</h3>
            {form_fields}
            {help_text}
        </div>"""
    
    # Error message display
    error_display = ""
    if error_message:
        error_display = f'<div class="error-message">{error_message}</div>'
    
    # Success message if provider is configured
    success_display = ""
    if current_provider and current_provider.get("provider"):
        provider_name = next((p["name"] for p in AI_PROVIDERS if p["id"] == current_provider.get("provider")), "Unknown")
        success_display = f'<div class="success-message">Currently configured: {provider_name}</div>'
    
    # Build content using string concatenation to avoid f-string JavaScript conflicts
    content_parts = []
    content_parts.append("""
        <div class="terminal-header">
            <div class="ascii-art">""" + KILOMARKET_ASCII + """</div>
            <div class="title">AI Provider Configuration</div>
            <div class="subtitle">Configure your AI provider for KiloMarket</div>
        </div>
        
        <div class="config-container">
            """ + error_display + """
            """ + success_display + """
            
            <form id="ai-provider-form" class="config-form">
                <div class="form-group">
                    <label for="provider">Select AI Provider:</label>
                    <select id="provider" name="provider" class="form-select">
                        <option value="">Choose a provider...</option>
                        """ + provider_options + """
                    </select>
                </div>
                
                """ + config_forms + """
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Configuration</button>
                    <button type="button" id="clear-provider" class="btn btn-secondary">Clear Configuration</button>
                    <a href="/" class="btn btn-outline">Back to Menu</a>
                </div>
            </form>
        </div>
        
        <style>
            html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
            }
            
            body { 
                background: #000;
            }
            
            .config-container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                min-height: calc(100vh - 40px);
                box-sizing: border-box;
            }
            
            .config-form {
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid #333;
                border-radius: 8px;
                padding: 20px;
                color: #00ff00;
                font-family: 'Courier New', monospace;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #00ff00;
            }
            
            .form-input, .form-select {
                width: 100%;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid #00ff00;
                border-radius: 4px;
                color: #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 14px;
            }
            
            .form-input:focus, .form-select:focus {
                outline: none;
                border-color: #ffffff;
                box-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
            }
            
            .form-actions {
                margin-top: 20px;
                text-align: center;
            }
            
            .btn {
                padding: 10px 20px;
                margin: 5px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                text-decoration: none;
                display: inline-block;
            }
            
            .btn-primary {
                background: #00ff00;
                color: #000000;
            }
            
            .btn-secondary {
                background: #ff6600;
                color: #ffffff;
            }
            
            .btn-outline {
                background: transparent;
                color: #00ff00;
                border: 1px solid #00ff00;
            }
            
            .btn:hover {
                opacity: 0.8;
            }
            
            .provider-config {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #333;
            }
            
            .provider-config h3 {
                color: #00ff00;
                margin-bottom: 15px;
            }
            
            .help-text {
                margin-top: 10px;
                padding: 10px;
                background: rgba(0, 255, 0, 0.1);
                border-left: 3px solid #00ff00;
                font-size: 12px;
                color: #cccccc;
            }
            
            .error-message {
                background: rgba(255, 0, 0, 0.2);
                border: 1px solid #ff0000;
                color: #ff6666;
                padding: 10px;
                margin-bottom: 20px;
                border-radius: 4px;
            }
            
            .success-message {
                background: rgba(0, 255, 0, 0.2);
                border: 1px solid #00ff00;
                color: #66ff66;
                padding: 10px;
                margin-bottom: 20px;
                border-radius: 4px;
            }
        </style>
        
        <script>
            // Show/hide configuration forms based on provider selection
            document.getElementById('provider').addEventListener('change', function() {
                const selectedProvider = this.value;
                
                // Hide all config forms
                document.querySelectorAll('.provider-config').forEach(form => {
                    form.style.display = 'none';
                });
                
                // Show selected provider config form
                if (selectedProvider) {
                    const selectedForm = document.getElementById('config-' + selectedProvider);
                    if (selectedForm) {
                        selectedForm.style.display = 'block';
                    }
                }
            });
            
            // Show initial config form if provider is already selected
            const initialProvider = document.getElementById('provider').value;
            if (initialProvider) {
                const initialForm = document.getElementById('config-' + initialProvider);
                if (initialForm) {
                    initialForm.style.display = 'block';
                }
            }
            
            // Provider field definitions
            const providerFields = {
                'amazon_bedrock': ['model_id', 'region_name'],
                'anthropic': ['api_key', 'model_id'],
                'gemini': ['api_key', 'model_id'],
                'openai_compatible': ['api_key', 'base_url', 'model_id']
            };
            
            // Handle form submission
            document.getElementById('ai-provider-form').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const selectedProvider = formData.get('provider');
                
                // Only include provider-specific fields
                const allowedFields = providerFields[selectedProvider] || [];
                const data = {
                    provider: selectedProvider
                };
                
                // Add only allowed fields for this provider
                allowedFields.forEach(field => {
                    const value = formData.get(field);
                    if (value !== null) {
                        data[field] = value;
                    }
                });
                
                try {
                    const response = await fetch('/api/ai-provider/configure', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        alert('AI Provider configured successfully!');
                        window.location.href = '/';
                    } else {
                        alert('Error: ' + (result.error || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            });
            
            // Handle clear configuration
            document.getElementById('clear-provider').addEventListener('click', async function() {
                if (confirm('Are you sure you want to clear the AI provider configuration?')) {
                    try {
                        const response = await fetch('/api/ai-provider/clear', {
                            method: 'POST'
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            alert('AI Provider configuration cleared!');
                            window.location.href = '/';
                        } else {
                            alert('Error: ' + (result.error || 'Unknown error'));
                        }
                    } catch (error) {
                        alert('Error: ' + error.message);
                    }
                }
            });
            
            // Add keyboard navigation (Escape to go back)
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    window.location.href = '/';
                }
            });
        </script>
    """)
    
    content = "".join(content_parts)
    return base_template("AI Provider Configuration", content, additional_js=MENU_JS)