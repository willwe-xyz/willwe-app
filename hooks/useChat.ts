import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAccount } from 'wagmi';

interface ChatMessage {
  id: string | number;
  nodeId: string;
  sender: string;
  content: string;
  timestamp: string;
  networkId: string;
  ensName?: string;
}

interface UseChatOptions {
  nodeId: string;
  networkId?: string;
  pollInterval?: number;
  limit?: number;
}

// Track active fetch requests to prevent duplicates
const activeFetches = new Map<string, Promise<ChatMessage[]>>();

export function useChat({ 
  nodeId, 
  networkId = '1', 
  pollInterval = 30000, // Increased default to 30 seconds
  limit = 50 // Reduced default limit
}: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [ensNames, setEnsNames] = useState<Record<string, string>>({});
  
  const toast = useToast();
  const { address } = useAccount();
  const isMountedRef = useRef(true);
  const lastMessageIdRef = useRef<string | number | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Cleanup function
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      // Cleanup any pending fetches when unmounting
      activeFetches.delete(nodeId);
    };
  }, [nodeId]);

  // Memoized fetch function with request deduplication
  const fetchMessages = useCallback(async () => {
    if (!nodeId || !isMountedRef.current) return;
    
    const requestKey = `${nodeId}-${networkId}`;
    
    // Skip if there's already an active request for this node
    if (activeFetches.has(requestKey)) {
      console.debug('Skipping duplicate fetch for node:', nodeId);
      return;
    }
    
    try {
      // Create and store the fetch promise
      const fetchPromise = (async () => {
        try {
          const response = await fetch(
            `/api/chat/messages?nodeId=${nodeId}&limit=${limit}`
          );
          
          if (!response.ok) {
            throw new Error(`Failed to fetch messages: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          if (!Array.isArray(data)) {
            throw new Error('Invalid response format: expected an array of messages');
          }
          
          // Sort messages by timestamp
          const sortedMessages = [...data].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          // Check if we have new messages
          const latestMessage = sortedMessages[sortedMessages.length - 1];
          const latestMessageId = latestMessage?.id;
          
          if (isMountedRef.current) {
            setMessages(sortedMessages);
            lastMessageIdRef.current = latestMessageId;
            setIsLoading(false);
            retryCountRef.current = 0; // Reset retry count on success
          }
          
          return sortedMessages;
        } catch (error) {
          console.error('Error in chat fetch:', error);
          if (isMountedRef.current) {
            setError(error instanceof Error ? error : new Error('Failed to fetch messages'));
            setIsLoading(false);
            
            // Exponential backoff for retries
            retryCountRef.current += 1;
            const backoff = Math.min(
              pollInterval * Math.pow(2, retryCountRef.current - 1),
              300000 // Max 5 minutes between retries
            );
            
            if (retryCountRef.current <= maxRetries) {
              pollTimeoutRef.current = setTimeout(fetchMessages, backoff);
            }
          }
          throw error;
        } finally {
          // Clean up the fetch promise
          activeFetches.delete(requestKey);
        }
      })();
      
      // Store the fetch promise
      activeFetches.set(requestKey, fetchPromise);
      
      // Wait for the fetch to complete and return messages
      const messages = await fetchPromise;
      return messages;
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      throw error;
    }
  }, [nodeId, networkId, limit, pollInterval]);
  
  // Setup polling effect
  useEffect(() => {
    if (!nodeId) return;
    
    let isActive = true;
    
    const poll = async () => {
      if (!isActive) return;
      
      try {
        await fetchMessages();
        // Schedule next poll if still active
        if (isActive) {
          pollTimeoutRef.current = setTimeout(poll, pollInterval);
        }
      } catch (error) {
        console.error('Error in chat polling:', error);
        // Don't schedule next poll on error - let the retry logic handle it
      }
    };
    
    // Initial fetch
    setIsLoading(true);
    poll();
    
    // Cleanup
    return () => {
      isActive = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [nodeId, fetchMessages, pollInterval]);

  // Resolve ENS names for messages
  useEffect(() => {
    const resolveNames = async () => {
      const uniqueAddresses = Array.from(
        new Set(messages.map(m => m.sender).filter(Boolean))
      ).filter(addr => addr && !ensNames[addr]) as string[];

      if (uniqueAddresses.length === 0) return;

      const resolved: Record<string, string> = {};
      
      try {
        // Try to resolve ENS names in parallel
        const resolutionPromises = uniqueAddresses.map(async (addr) => {
          try {
            // Use wagmi's built-in ENS resolution if available
            if (window.ethereum?.isMetaMask) {
              const provider = window.ethereum;
              const name = await provider.request({
                method: 'eth_ens_lookup',
                params: [addr],
              });
              if (name) {
                resolved[addr] = name;
              }
            }
          } catch (err) {
            console.error(`Failed to resolve ENS for ${addr}:`, err);
          }
        });

        await Promise.all(resolutionPromises);

        if (isMountedRef.current && Object.keys(resolved).length > 0) {
          setEnsNames(prev => ({ ...prev, ...resolved }));
        }
      } catch (err) {
        console.error('Error resolving ENS names:', err);
      }
    };

    resolveNames();
  }, [messages, ensNames]);

  // Send a new message
  const sendMessage = useCallback(async (content: string, sender: string) => {
    if (!nodeId || !networkId) {
      throw new Error('Node ID and Network ID are required');
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeId,
          userAddress: sender,
          content,
          networkId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to send message: ${response.statusText}`);
      }

      // Refresh messages after sending
      await fetchMessages();
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send message' 
      };
    } finally {
      if (isMountedRef.current) {
        setIsSending(false);
      }
    }
  }, [nodeId, address, networkId, toast]);

  return {
    messages: messages.map(msg => ({
      ...msg,
      ensName: ensNames[msg.sender] || undefined,
    })),
    isLoading,
    isSending,
    error,
    sendMessage,
    refresh: fetchMessages,
  };
}
