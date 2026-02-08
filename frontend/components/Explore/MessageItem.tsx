"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Wrench, User, Bot } from "lucide-react";
import S3MessageFetcher from "./S3Integration";

interface Message {
  message: {
    role: 'user' | 'assistant';
    content: Array<{
      text?: string;
      toolUse?: {
        toolUseId: string;
        name: string;
        input: any;
      };
    }>;
  };
  message_id: number;
  redact_message: any;
  created_at: string;
  updated_at: string;
}

interface MessageItemProps {
  message: Message;
  isLast?: boolean;
}

const MessageItem = ({ message, isLast = false }: MessageItemProps) => {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const isUser = message.message.role === 'user';
  const isAssistant = message.message.role === 'assistant';
  const textContent = S3MessageFetcher.extractTextContent(message);
  const toolUses = S3MessageFetcher.extractToolUses(message);
  const hasTools = toolUses.length > 0;

  const toggleToolExpansion = (toolId: string) => {
    setExpandedTools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });
  };

  const formatToolInput = (input: any): string => {
    try {
      return JSON.stringify(input, null, 2);
    } catch {
      return String(input);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return S3MessageFetcher.formatTimestamp(timestamp);
  };

  if (isUser) {
    return (
      <div className={`flex justify-end mb-4 ${isLast ? '' : 'pb-4'}`}>
        <div className="max-w-[70%] flex flex-col items-end">
          {/* User Avatar */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-xs text-[#9ca3af]">{formatTimestamp(message.created_at)}</div>
            <div className="w-6 h-6 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-[#333333]">
              <User className="w-3 h-3 text-[#9ca3af]" />
            </div>
          </div>
          
          {/* User Message */}
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-3 text-white">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{textContent}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAssistant) {
    return (
      <div className={`flex justify-start mb-4 ${isLast ? '' : 'pb-4'}`}>
        <div className="max-w-[70%] flex flex-col">
          {/* Assistant Avatar */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs text-[#9ca3af]">{formatTimestamp(message.created_at)}</div>
          </div>
          
          {/* Assistant Message */}
          <div className="glass border border-[#333333] rounded-lg overflow-hidden">
            {/* Text Content */}
            {textContent && (
              <div className="p-3 text-white">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{textContent}</p>
              </div>
            )}
            
            {/* Tool Uses */}
            {hasTools && (
              <div className="border-t border-[#333333]">
                <div className="p-3 space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-[#9ca3af] uppercase tracking-wider">
                    <Wrench className="w-3 h-3" />
                    <span>Tool Calls ({toolUses.length})</span>
                  </div>
                  
                  {toolUses.map((toolUse) => {
                    if (!toolUse) return null;
                    
                    const isExpanded = expandedTools.has(toolUse.toolUseId);
                    
                    return (
                      <div key={toolUse.toolUseId} className="bg-[#1a1a1a] border border-[#333333] rounded-lg overflow-hidden">
                        {/* Tool Header */}
                        <button
                          onClick={() => toggleToolExpansion(toolUse.toolUseId)}
                          className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#262626] transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-[#3b82f6] rounded-full" />
                            <span className="text-sm text-white font-medium">{toolUse.name}</span>
                            <span className="text-xs text-[#9ca3af] font-mono">#{toolUse.toolUseId.slice(-8)}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#9ca3af]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#9ca3af]" />
                          )}
                        </button>
                        
                        {/* Tool Details */}
                        {isExpanded && (
                          <div className="border-t border-[#333333] p-3">
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs text-[#9ca3af] mb-1">Input Parameters:</div>
                                <pre className="bg-[#0a0a0a] border border-[#333333] rounded p-2 text-xs text-[#f3f4f6] overflow-x-auto">
                                  {formatToolInput(toolUse.input)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MessageItem;