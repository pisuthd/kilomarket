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

export class S3MessageFetcher {
  private static readonly BASE_URL = 'https://kilomarket-agent-sessions.s3.us-east-1.amazonaws.com';
  private static cache = new Map<string, Message[]>();

  /**
   * Fetch conversation messages for an agent from S3
   * URL pattern: /agents/{agent_id}/session_kilomarket-{agent_id}/agents/agent_{agent_id}/messages/message_{index}.json
   */
  static async fetchAgentMessages(agentId: string, startIndex: number = 0): Promise<Message[]> {
    const cacheKey = `${agentId}-${startIndex}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const messages: Message[] = [];
    let messageIndex = startIndex;
    let hasMoreMessages = true;

    try {
      while (hasMoreMessages && messageIndex < 100) { // Safety limit of 100 messages
        const messageUrl = `${this.BASE_URL}/agents/${agentId}/session_kilomarket-${agentId}/agents/agent_${agentId}/messages/message_${messageIndex}.json`;
        
        try {
          const response = await fetch(messageUrl);
          
          if (response.status === 404) {
            // No more messages available
            hasMoreMessages = false;
            break;
          }
          
          if (!response.ok) {
            console.warn(`Failed to fetch message ${messageIndex}:`, response.statusText);
            messageIndex++;
            continue;
          }
          
          const message: Message = await response.json();
          messages.push(message);
          messageIndex++;
          
        } catch (error) {
          console.warn(`Error fetching message ${messageIndex}:`, error);
          messageIndex++;
          // Continue trying next messages even if one fails
        }
      }
      
      // Cache the results
      this.cache.set(cacheKey, messages);
      return messages;
      
    } catch (error) {
      console.error('Error fetching agent messages:', error);
      return [];
    }
  }

  /**
   * Fetch a single message by index
   */
  static async fetchSingleMessage(agentId: string, messageIndex: number): Promise<Message | null> {
    const messageUrl = `${this.BASE_URL}/agents/${agentId}/session_kilomarket-${agentId}/agents/agent_${agentId}/messages/message_${messageIndex}.json`;
    
    try {
      const response = await fetch(messageUrl);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error(`Error fetching message ${messageIndex}:`, error);
      return null;
    }
  }

  /**
   * Check if an agent has any conversation history
   */
  static async checkAgentHasMessages(agentId: string): Promise<boolean> {
    const firstMessage = await this.fetchSingleMessage(agentId, 0);
    return firstMessage !== null;
  }

  /**
   * Clear cache for a specific agent or all agents
   */
  static clearCache(agentId?: string) {
    if (agentId) {
      // Clear cache entries for specific agent
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${agentId}-`)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Get cached message count for an agent
   */
  static getCachedMessageCount(agentId: string): number {
    let count = 0;
    for (const [key, messages] of this.cache.entries()) {
      if (key.startsWith(`${agentId}-`)) {
        count = Math.max(count, messages.length);
      }
    }
    return count;
  }

  /**
   * Format timestamp for display
   */
  static formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }

  /**
   * Extract text content from message
   */
  static extractTextContent(message: Message): string {
    const textContents = message.message.content
      .filter(item => item.text)
      .map(item => item.text || '');
    
    return textContents.join(' ');
  }

  /**
   * Extract tool uses from message
   */
  static extractToolUses(message: Message) {
    return message.message.content
      .filter(item => item.toolUse)
      .map(item => item.toolUse);
  }

  /**
   * Check if message contains tool uses
   */
  static hasToolUses(message: Message): boolean {
    return message.message.content.some(item => item.toolUse);
  }
}

export default S3MessageFetcher;