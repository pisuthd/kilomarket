"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, MessageCircle, Clock, AlertCircle } from "lucide-react";
import MessageItem from "./MessageItem";
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

interface ConversationPanelProps {
  agent: Agent | null;
}

const ConversationPanel = ({ agent }: ConversationPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(20); // How many messages to display initially
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  const loadMessages = async (reset: boolean = false) => {
    if (!agent) return;
    
    // Prevent duplicate loading
    if (isLoadingMoreRef.current && !reset) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (reset) {
        // Load all messages from S3
        const allMessages = await S3MessageFetcher.fetchAgentMessages(agent.id, 0);
        setMessages(allMessages);
        setMessageCount(allMessages.length);
        setDisplayCount(Math.min(10, allMessages.length));
        setHasMoreMessages(allMessages.length > 10);
      } else {
        // Load more messages (increase display count)
        const newDisplayCount = Math.min(displayCount + 10, messageCount);
        setDisplayCount(newDisplayCount);
        setHasMoreMessages(newDisplayCount < messageCount);
      }
      
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
      isLoadingMoreRef.current = false;
    }
  };

  const checkForMessages = async () => {
    if (!agent) return;
    
    try {
      const hasMessages = await S3MessageFetcher.checkAgentHasMessages(agent.id);
      if (hasMessages && messages.length === 0) {
        // First time discovering messages
        loadMessages(true);
      } else if (!hasMessages) {
        // No messages available
        setError('No conversation history found for this agent');
      }
    } catch (err) {
      console.error('Error checking for messages:', err);
      setError('Unable to check for conversation history');
    }
  };

  const handleRefresh = () => {
    if (!agent) return;
    
    // Clear cache and reload
    S3MessageFetcher.clearCache(agent.id);
    loadMessages(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMoreMessages && !isLoadingMoreRef.current) {
      isLoadingMoreRef.current = true;
      loadMessages(false);
    }
  };

  // Auto-scroll to bottom when new messages are loaded
  // useEffect(() => {
  //   if (messagesEndRef.current) {
  //     messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [displayCount]);

  // Initial load when agent changes
  useEffect(() => {
    if (agent) {
      setMessages([]);
      setError(null);
      setHasMoreMessages(true);
      setMessageCount(0);
      setDisplayCount(20);
      isLoadingMoreRef.current = false;
      
      // First check if agent has any messages
      checkForMessages();
    } else {
      setMessages([]);
      setError(null);
      setHasMoreMessages(true);
      setMessageCount(0);
      setDisplayCount(20);
    }
  }, [agent]);

  if (!agent) {
    return (
      <div className="h-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-[#333333] mx-auto mb-3" />
          <div className="text-[#6b7280] mb-2">No Agent Selected</div>
          <div className="text-[#9ca3af] text-sm">Select an agent to view conversation history</div>
        </div>
      </div>
    );
  }

  // Get messages to display (from oldest to newest, limited by displayCount)
  const displayedMessages = messages.slice(-displayCount);

  return (
    <div className="h-full bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="border-b border-[#333333] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-[#10b981]" />
              Conversation History
            </h3>
            {messageCount > 0 && (
              <span className="px-2 py-1 bg-[#1a1a1a] text-[#9ca3af] text-xs rounded-full border border-[#333333]">
                {displayCount} of {messageCount} messages
              </span>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 bg-[#1a1a1a] border border-[#333333] rounded-lg hover:border-[#10b981] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh messages"
          >
            <RefreshCw className={`w-4 h-4 text-[#9ca3af] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-4">
            <div className="flex items-center space-x-2 text-[#ef4444] text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {messages.length === 0 && !error && !loading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Clock className="w-12 h-12 text-[#333333] mx-auto mb-3" />
              <div className="text-[#6b7280] mb-2">No Conversation History</div>
              <div className="text-[#9ca3af] text-sm">
                This agent hasn't had any conversations yet, or history hasn't been uploaded to S3
              </div>
            </div>
          </div>
        )}
        
        <div className="p-4 space-y-4">
          {displayedMessages.map((message, index) => (
            <MessageItem 
              key={message.message_id} 
              message={message} 
              isLast={index === displayedMessages.length - 1}
            />
          ))}
          
          {/* Load More Button */}
          {hasMoreMessages && messages.length > 0 && (
            <div className="text-center py-4">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-[#9ca3af] hover:border-[#10b981] hover:text-[#10b981] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  `Load More Messages (${messageCount - displayCount} remaining)`
                )}
              </button>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Footer with Loading Indicator */}
      {loading && (
        <div className="border-t border-[#333333] p-3">
          <div className="flex items-center justify-center space-x-2 text-[#9ca3af] text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading conversation history...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationPanel;