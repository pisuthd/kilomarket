"use client";

import { useState } from "react";
import { Copy, ExternalLink, Wallet } from "lucide-react";

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

interface AgentDetailsPanelProps {
  agent: Agent | null;
}

const AgentDetailsPanel = ({ agent }: AgentDetailsPanelProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!agent) {
    return (
      <div className="h-full bg-[#0a0a0a] flex items-center justify-center border-b border-[#333333]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-3">
            <div className="w-8 h-8 bg-[#333333] rounded-full" />
          </div>
          <div className="text-[#6b7280] mb-2">No Agent Selected</div>
          <div className="text-[#9ca3af] text-sm">Select an agent from the list to view details</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0a0a0a] border-b border-[#333333] overflow-y-auto">
      <div className="p-6">
        {/* Agent Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                agent.status === 'online' ? 'bg-[#10b981]' : 'bg-[#6b7280]'
              }`} />
              <h2 className="text-xl font-semibold text-white">{agent.name}</h2>
            </div>
            <p className="text-[#9ca3af]">{agent.description}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass border border-[#333333] rounded-lg p-4">
            <div className="text-[#9ca3af] text-sm mb-1">Model</div>
            <div className="text-white font-medium">{agent.model}</div>
          </div> 
          <div className="glass border border-[#333333] rounded-lg p-4">
            <div className="text-[#9ca3af] text-sm mb-1">A2A Server URL</div>
            <div className="text-white font-medium">https://euk6nt5mhm.ap-southeast-1.awsapprunner.com</div>
          </div>
          <div className="glass border border-[#333333] rounded-lg p-4">
            <div className="text-[#9ca3af] text-sm mb-1">Cost</div>
            <div className="text-white font-medium">{agent.pricing.base_cost} {agent.pricing.unit} (Negotiable)</div>
          </div>
          
           <div className="glass border border-[#333333] rounded-lg p-4">
            <div className="text-[#9ca3af] text-sm mb-1">Port</div>
            <div className="text-white font-medium">{agent.port}</div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Services</h3>
          <div className="flex flex-wrap gap-2">
            {agent.services.map((service, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#1a1a1a] border border-[#333333] rounded-lg text-[#f3f4f6] text-sm"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Specialties */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {agent.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg text-[#10b981] text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Wallet Address */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Wallet Address
            </h3>
            <button
              onClick={() => copyToClipboard(agent.wallet_address)}
              className="flex items-center space-x-1 px-3 py-1 bg-[#1a1a1a] border border-[#333333] rounded-lg text-[#9ca3af] hover:text-[#10b981] transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-3 bg-[#1a1a1a] border border-[#333333] rounded-lg font-mono text-sm text-[#f3f4f6] break-all">
            {agent.wallet_address}
          </div>
        </div>

        {/* Actions */}
        {/* <div className="flex space-x-3">
          <button
            onClick={() => window.open(`http://localhost:${agent.port}/docs`, '_blank')}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View API Docs</span>
          </button>
          <button className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-[#333333] text-white rounded-lg hover:bg-[#262626] transition-colors">
            Connect to Agent
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default AgentDetailsPanel;