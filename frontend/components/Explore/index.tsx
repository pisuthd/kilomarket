"use client";

import { useState } from "react";
import AgentListPanel from "./AgentListPanel";
import AgentDetailsPanel from "./AgentDetailsPanel";
import ConversationPanel from "./ConversationPanel";

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  port: number;
  status: 'online' | 'offline';
  services: string[];
  specialties: string[];
  pricing: {
    base_cost: number;
    unit: string;
    negotiable: boolean;
  };
  wallet_address: string;
  capabilities: any;
}

const ExploreContainer = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Mock agent data - this will come from API later
  const mockAgents: Agent[] = [
    {
      id: "vibe_coding_agent",
      name: "Vibe Coding Agent",
      description: "Professional A2A coding service provider specializing in modern web development",
      model: "Claude 4.5 Sonnet",
      port: 9000,
      status: "online",
      services: ["Code Review", "Development", "Architecture", "Debugging"],
      specialties: ["Web Development", "API Design", "Database Design", "Cloud Architecture"],
      pricing: {
        base_cost: 1.0,
        unit: "yUSD per request",
        negotiable: true,
      },
      wallet_address: "0x7F9E8b3c5A2B8d1E4F6A9C7D3B5E8F1A2C4D6E8",
      capabilities: {},
    },
    {
      id: "crypto_market_agent",
      name: "Crypto Market Agent",
      description: "Real-time cryptocurrency market data provider and analysis",
      model: "Amazon Nova Pro",
      port: 9001,
      status: "online",
      services: ["Real-time Prices", "Market Analysis", "Top Movers", "Market Summaries"],
      specialties: ["Crypto Trading", "DeFi Analytics", "Market Intelligence"],
      pricing: {
        base_cost: 0.75,
        unit: "yUSD per request",
        negotiable: true,
      },
      wallet_address: "0x3e8aB3edCd96d871ff64FEdD5dccC0b99e531556",
      capabilities: {},
    },
    {
      id: "contract_audit_agent",
      name: "Smart Contract Audit Agent",
      description: "Professional smart contract security audit service",
      model: "LLaMA 4 Maverick",
      port: 9002,
      status: "online",
      services: ["Security Audits", "Vulnerability Scanning", "Risk Assessment", "Compliance Analysis"],
      specialties: ["DeFi Security", "Smart Contract Audits", "Vulnerability Detection"],
      pricing: {
        base_cost: 0.75,
        unit: "yUSD per request",
        negotiable: true,
      },
      wallet_address: "0x42A3F74F1f8Afe022fF711673FbD562Bb990227F",
      capabilities: {},
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      {/* <div className="border-b border-[#333333] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Explore Agents</h1>
            <p className="text-[#9ca3af] text-sm">
              Discover and interact with specialized A2A service agents
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-[#9ca3af]">
            <span className="px-3 py-1 bg-[#1a1a1a] rounded-full border border-[#333333]">
              {mockAgents.length} Agents Available
            </span>
          </div>
        </div>
      </div> */}

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Agent List */}
        <AgentListPanel 
          agents={mockAgents}
          selectedAgent={selectedAgent}
          onAgentSelect={setSelectedAgent}
        />
        
        {/* Right Column - Split Vertically */}
        <div className="flex-1 flex flex-col">
          {/* Agent Details (Top Half) */}
          <div className="flex-1 min-h-0">
            <AgentDetailsPanel agent={selectedAgent} />
          </div>
          
          {/* Conversation History (Bottom Half) */}
          <div className="flex-1 min-h-0 border-t border-[#333333]">
            <ConversationPanel agent={selectedAgent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreContainer;