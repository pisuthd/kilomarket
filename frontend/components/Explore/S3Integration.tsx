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
  private static agentMessageCounts = new Map<string, number>();

  /**
   * Fetch conversation messages for an agent from S3
   * Always starts from message_0 and fetches sequentially until 404
   */
  static async fetchAgentMessages(agentId: string, startIndex: number = 0): Promise<Message[]> {
    const cacheKey = `${agentId}`;
    
    // Check if we already have all messages cached
    if (this.cache.has(cacheKey)) {
      const allMessages = this.cache.get(cacheKey)!;
      return startIndex === 0 ? allMessages : allMessages.slice(startIndex);
    }

    // If starting from index > 0 and we don't have cache, we need to fetch from beginning
    if (startIndex > 0) {
      await this.fetchAgentMessages(agentId, 0); // Fetch all messages first
      const allMessages = this.cache.get(cacheKey)!;
      return allMessages.slice(startIndex);
    }

    const messages: Message[] = [];
    let messageIndex = 0;
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 3;

    try {
      while (consecutiveErrors < MAX_CONSECUTIVE_ERRORS && messageIndex < 200) { // Safety limit of 200 messages
        const messageUrl = `${this.BASE_URL}/agents/${agentId}/session_kilomarket-${agentId}/agents/agent_${agentId}/messages/message_${messageIndex}.json`;
        
        try {
          const response = await fetch(messageUrl);
          
          if (response.status === 404 || response.status === 403) {
            // No more messages available or access denied
            console.log(`No more messages found at index ${messageIndex} (${response.status})`);
            break;
          }
          
          if (!response.ok) {
            console.warn(`Failed to fetch message ${messageIndex}: ${response.status} ${response.statusText}`);
            consecutiveErrors++;
            messageIndex++;
            continue;
          }
          
          const message: Message = await response.json();
          messages.push(message);
          messageIndex++;
          consecutiveErrors = 0; // Reset error counter on success
          
          // Add a small delay to avoid rate limiting
          if (messageIndex % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
        } catch (error) {
          console.warn(`Error fetching message ${messageIndex}:`, error);
          consecutiveErrors++;
          messageIndex++;
          
          // Wait a bit longer on errors
          if (consecutiveErrors > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      // Cache all results
      this.cache.set(cacheKey, messages);
      this.agentMessageCounts.set(agentId, messages.length);
      
      console.log(`Fetched ${messages.length} messages for agent ${agentId}`);
      return startIndex === 0 ? messages : messages.slice(startIndex);
      
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
      
      if (response.status === 404 || response.status === 403) {
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
    // Check cache first
    const cacheKey = agentId;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!.length > 0;
    }

    const firstMessage = await this.fetchSingleMessage(agentId, 0);
    return firstMessage !== null;
  }

  /**
   * Get total message count for an agent
   */
  static async getAgentMessageCount(agentId: string): Promise<number> {
    // Check cache first
    if (this.agentMessageCounts.has(agentId)) {
      return this.agentMessageCounts.get(agentId)!;
    }

    // Fetch all messages to get count
    await this.fetchAgentMessages(agentId, 0);
    return this.agentMessageCounts.get(agentId) || 0;
  }

  /**
   * Clear cache for a specific agent or all agents
   */
  static clearCache(agentId?: string) {
    if (agentId) {
      // Clear cache entries for specific agent
      this.cache.delete(agentId);
      this.agentMessageCounts.delete(agentId);
    } else {
      // Clear all cache
      this.cache.clear();
      this.agentMessageCounts.clear();
    }
  }

  /**
   * Get cached message count for an agent
   */
  static getCachedMessageCount(agentId: string): number {
    return this.agentMessageCounts.get(agentId) || 0;
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