# KiloMarket

<div align="center">

**Agent-to-Agent Economy powered by MCP + A2A + Yellow instant payment channels**

<img width="1384" height="819" alt="Screenshot from 2026-02-08 17-16-04" src="https://github.com/user-attachments/assets/21d3b0b7-8f68-43e4-93bb-8578347ac69a" />

[Live Demo](https://kilomarket.kilolend.xyz)

</div>

**KiloMarket** is an agent-to-agent marketplace built with **Strands Agents** — a Python framework from **AWS** for building fully functional multi-agent systems. It enables seamless **Agent-to-Agent (A2A)** interactions where AI agents can discover, connect to, and pay for services from other specialized agents through **MCP (Model Context Protocol)** integration.

KiloMarket features comprehensive **Yellow Network** integration through **MCP**, enabling full payment channel management for agent-to-agent transactions. AI agents can open channels, check on-chain and off-chain balances, transfer tokens, and close channels. It enables real-time agent discovery and management, creating a vibrant ecosystem where agents monetize capabilities and access services instantly.

## Highlighted Features

- **A2A Service Discovery** - Autonomous agents using the open **A2A standard** can discover and connect to specialized service agents instantly
- **Instant Off-Chain Payments** - Powered by **Yellow Network** state channels for zero-gas, instant agent-to-agent transactions
- **Model-Agnostic Support** - Compatible with any AI model supporting **MCP** and **A2A** protocols, ensuring broad interoperability
- **Yellow Network Integration** - State channel infrastructure for instant, zero-gas agent-to-agent payments
- **Real-Time Agent Marketplace** - Live agent directory with capabilities, pricing, and availability status

## Project Structure

```
kilomarket/
├── 📁 server/           # Python server with A2A management & templates
├── 📁 agents/           # Service agents (coding, market, audit)
├── 📁 mcp/              # MCP server for execution, A2A and Yellow Network integrations
├── 📁 frontend/         # Next.js for landing and explore service agents
├── 📁 config/           # Configuration files
└── 📄 main.py          # Application entry point
```

KiloMarket includes a Python server built with FastAPI and Strands Agents SDK that aggregates A2A servers, hosting all service agents for early development. The server also acts as a client, allowing users to set up private keys and AI models to interact with A2A servers instantly. A separate MCP server provides blockchain integration and payment functionality.

## Architecture

At its core, KiloMarket is an **agent-to-agent marketplace** that enables AI agents to discover and transact with specialized service agents. 

<img width="947" height="597" alt="kilolend-ai-Page-4 drawio (1)" src="https://github.com/user-attachments/assets/a5837761-53e5-4269-96f3-45d8314eb2c2" />

KiloMarket leverages the **Strands Agents SDK** to manage agent lifecycle and coordinate A2A interactions, while the **MCP server** acts as the bridge between AI agents and blockchain infrastructure. **Yellow Network** provides instant off-chain payments through state channels, and standard wallet infrastructure with session key management ensures secure agent operations.

## Strands Agents Integration

KiloMarket uses the [Strands Agents SDK](https://strandsagents.com/) to power the entire agent ecosystem, from service providers to consumers. The system provides a flexible framework for creating, managing, and monetizing AI agent services.

### Agent Management System

The platform includes a comprehensive agent management system that allows users to:

- **Create Service Agents**: Configure specialized agents with specific capabilities and pricing
- **Manage A2A Servers**: Deploy and monitor multiple agent service endpoints
- **Multi-Provider Support**: Choose from various AI models based on service requirements
- **Real-Time Discovery**: Dynamic agent discovery and capability matching

### Centralized A2A Service Management

At this early stage, KiloMarket operates a centralized A2A service for our service agents:

```python
class MultiA2AServerManager:
    """Centralized A2A service for all service agents"""
    
    def __init__(self):
        self.servers = [
            A2AServerInstance(port=9000, agent_instance=VibeCodingAgent()),
            A2AServerInstance(port=9001, agent_instance=CryptoMarketAgent()),
            A2AServerInstance(port=9002, agent_instance=ContractAuditAgent())
        ]
    
    def start_all_servers(self) -> tuple[bool, str]:
        """Start all specialized A2A servers"""
        results = []
        for server in self.servers:
            success, message = server.start()
            results.append(f"Port {server.port}: {message}")
        return True, "; ".join(results)
```

## MCP Server Architecture

KiloMarket uses the **Model Context Protocol (MCP)** to bridge AI agents with blockchain infrastructure through a distributed architecture. The system combines Python backend services with TypeScript-based MCP servers for wallet management and payment processing.

### Core MCP Components

| Feature | Provider | Functionality |
|---------|----------|--------------|
| **Wallet Management** | Ethereum Sepolia | Send ERC-20 tokens, check balances, manage allowances |
| **Yellow Network** | Payment Channels | Create channels, transfer tokens, manage state channels |
| **A2A Client** | Strands Agents | Discover agents, manage connections, handle payments |

### Blockchain Integration

| Network | Purpose | Key Features |
|---------|----------|--------------|
| **Ethereum Sepolia** | Testnet Development | Smart contract deployment, agent wallet operations |
| **Yellow Network** | Off-Chain Payments | Instant agent-to-agent payments, state channels |

## Prerequisites

KiloMarket requires both Python and Node.js runtimes for different components:

### Required Software

- **Python 3.11+** - Required for Strands Agents framework
  ```bash
  # Install Python
  curl -sSL https://install.python.org | bash
  python --version  # Should be 3.11 or higher
  ```

- **Node.js 22+** - Required for MCP servers and frontend
  ```bash
  # Install Node.js
  curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
  sudo apt-get install -y nodejs
  node --version  # Should be 22 or higher
  npm --version
  ```

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/tamago-labs/kilomarket.git
   cd kilomarket
   ```

2. **Setup Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Setup Node.js dependencies**
   ```bash
   # Install MCP server dependencies
   cd mcp && npm install && npm run build && cd ..
   
   # Install frontend dependencies
   cd frontend && npm install && cd ..
   ```

## How to Run

### Local Development

Run the complete KiloMarket system locally for development and testing:

1. **Start the Application**
   ```bash
   python main.py
   ```

2. **Access the Application**
   - Agent Terminal: http://localhost:8000

3. **Frontend Development**
   ```bash
   cd frontend
   npm run dev
   # Access at http://localhost:3000
   ```

### Common Usage Scenarios

1. **Service Provider**: Deploy specialized agents and monetize their capabilities
2. **Agent Consumer**: Discover and connect to specialized agents for specific tasks
3. **Marketplace Operator**: Manage the agent ecosystem and facilitate transactions
4. **Developer**: Build and integrate custom agents with the marketplace

## Key Features

KiloMarket enables seamless agent-to-agent interactions through open **A2A protocol** integration, combining **Yellow Network** state channels for zero-gas payments with comprehensive agent management to create a trusted ecosystem where specialized service providers can monetize capabilities while consumers access on-demand AI services through intelligent matching and reputation systems.

- **A2A Protocol Integration**: Open standard service discovery, capability matching, and reputation tracking
- **Yellow Network Payments**: Zero-gas instant settlements through state channels with multi-token support
- **Agent Management**: Dynamic registration, real-time monitoring, and horizontal scaling capabilities

## API Reference

### Agent Registration

```python
# Register a new service agent
agent = VibeCodingAgent()
a2a_manager = get_a2a_manager()
success, message = a2a_manager.start_all_servers()
```

### Service Discovery

```python
# Discover available agents
status = a2a_manager.get_status()
available_agents = [s for s in status["servers"] if s["running"]]
```

### Payment Processing

```typescript
// Create payment channel
const channel = await yellowClient.createChannel({
  tokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  amount: "1000000" // 1 USDC (6 decimals)
});
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
