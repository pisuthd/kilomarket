"use client";

import { useState } from "react";
import { Search, Circle, ChevronRight } from "lucide-react";

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

interface AgentListPanelProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent) => void;
}

const AgentListPanel = ({ agents, selectedAgent, onAgentSelect }: AgentListPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || agent.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-80 bg-[#0f0f0f] border-r border-[#333333] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#333333]">
        <h2 className="text-lg font-semibold text-white mb-3">Available Service Agents</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-[#6b7280] focus:outline-none focus:border-[#10b981] transition-colors"
          />
        </div>
        
        {/* Filter */}
        <div className="flex space-x-2">
          {(['all', 'online', 'offline'] as const).map((statusFilter) => (
            <button
              key={statusFilter}
              onClick={() => setFilter(statusFilter)}
              className={`flex-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === statusFilter
                  ? 'bg-[#10b981] text-white'
                  : 'bg-[#1a1a1a] text-[#9ca3af] border border-[#333333]'
              }`}
            >
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} ({agents.filter(a => 
                statusFilter === 'all' ? true : a.status === statusFilter
              ).length})
            </button>
          ))}
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAgents.length === 0 ? (
          <div className="p-4 text-center text-[#9ca3af]">
            No agents found matching your criteria
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => onAgentSelect(agent)}
                className={`w-full text-left p-3 rounded-lg transition-all hover:bg-[#1a1a1a] group ${
                  selectedAgent?.id === agent.id
                    ? 'bg-[#1a1a1a] border border-[#10b981]'
                    : 'border border-transparent'
                }`}
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Circle className={`w-2 h-2 fill-current ${
                        agent.status === 'online' ? 'text-[#10b981]' : 'text-[#6b7280]'
                      }`} />
                      <h3 className="font-medium text-white truncate">{agent.name}</h3>
                    </div>
                    <p className="text-xs text-[#9ca3af] line-clamp-2">{agent.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6b7280] group-hover:text-[#10b981] transition-colors flex-shrink-0 ml-2" />
                </div>
                
                {/* Agent Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6b7280]">Model:</span>
                    <span className="text-[#f3f4f6]">{agent.model}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6b7280]">Cost:</span>
                    <span className="text-[#f3f4f6]">{agent.pricing.base_cost} {agent.pricing.unit}</span>
                  </div>
                  {agent.services && agent.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.services.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-[#1a1a1a] text-[#9ca3af] text-xs rounded border border-[#333333]"
                        >
                          {service}
                        </span>
                      ))}
                      {agent.services.length > 3 && (
                        <span className="px-2 py-0.5 bg-[#1a1a1a] text-[#9ca3af] text-xs rounded border border-[#333333]">
                          +{agent.services.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#333333]">
        <div className="text-xs text-[#6b7280] text-center">
          {filteredAgents.length} of {agents.length} agents shown
        </div>
      </div>
    </div>
  );
};

export default AgentListPanel;