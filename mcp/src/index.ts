import 'dotenv/config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Agent } from "./agent/index"
import { EthereumTools } from "./mcp";

function createEthereumMcpServer(agent: Agent) {
    // Create MCP server instance
    const server = new McpServer({
        name: "kilomarket-mcp",
        version: "1.0.0"
    });

    // Combine all tools
    const allTools = EthereumTools;


    // Register all tools
    for (const [toolKey, tool] of Object.entries(allTools)) {
        server.tool(tool.name, tool.description, tool.schema, async (params: any): Promise<any> => {
            try {
                // Execute the handler with the agent and params
                const result = await tool.handler(agent, params);

                // Format the result as MCP tool response
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error) {
                console.error(`Tool execution error [${tool.name}]:`, error);
                // Handle errors in MCP format
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error instanceof Error
                                ? error.message
                                : "Unknown error occurred",
                        },
                    ],
                };
            }
        });
    }

    const toolCount = Object.keys(allTools).length;
    console.error(`✅ Registered ${toolCount} Ethereum tools`);
    return server;
}

async function main() {
    try {
        console.error("🔍 Starting Ethereum Sepolia MCP Server...");

        // Create agent instance
        const agent = new Agent();

        // Create and start MCP server
        const server = createEthereumMcpServer(agent);
        const transport = new StdioServerTransport();
        await server.connect(transport);

        const totalTools = Object.keys(EthereumTools).length
        console.error(`✅ Ethereum Sepolia MCP Server running with ${totalTools} tools`);

    } catch (error) {
        console.error('❌ Error starting Ethereum MCP server:', error);
        process.exit(1);
    }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
    console.error('\n🛑 Shutting down Ethereum MCP Server...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.error('\n🛑 Shutting down Ethereum MCP Server...');
    process.exit(0);
});

// Start the server
main();
