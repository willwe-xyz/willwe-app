import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

// Environment variable for the Ponder API server URL with fallback to empty string (resolved at build time)
const PONDER_SERVER_URL = process.env.NEXT_PUBLIC_PONDER_SERVER_URL || '';

/**
 * Hook to fetch and interact with data indexed by Ponder
 */
export function usePonderData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Get user address from wallet
  const { address } = useAccount();

  /**
   * Helper function to build full API URLs
   */
  const apiUrl = useCallback((endpoint: string) => {
    // If endpoint already starts with http, assume it's a complete URL
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${PONDER_SERVER_URL}${normalizedEndpoint}`;
  }, []);

  /**
   * Fetch membranes for a specific node
   */
  const getNodeMembranes = useCallback(async (nodeId: string) => {
    if (!nodeId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use node/:nodeId directly as shown in server implementation
      const response = await fetch(apiUrl(`/node/${nodeId}`));
      if (!response.ok) {
        throw new Error(`Error fetching membranes: ${response.statusText}`);
      }
      const data = await response.json();
      setIsLoading(false);
      
      // Return the membranes from the response data
      return data.node?.membrane || [];
    } catch (err) {
      console.error('Error fetching node membranes:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return [];
    }
  }, [apiUrl]);

  /**
   * Fetch all membranes
   */
  const getAllMembranes = useCallback(async (networkId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl(`/membranes?networkId=${networkId}`));
      if (!response.ok) {
        throw new Error(`Error fetching membranes: ${response.statusText}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return data.membranes || [];
    } catch (err) {
      console.error('Error fetching all membranes:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return [];
    }
  }, [apiUrl]);

  /**
   * Fetch movements for a specific node
   */
  const getNodeMovements = useCallback(async (nodeId: string, networkId: string) => {
    if (!nodeId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl(`/movements?nodeId=${encodeURIComponent(nodeId)}&networkId=${networkId}`));
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`Error fetching movements: ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      if (!data.movements) {
        throw new Error('Invalid response format: expected movements property');
      }
      setIsLoading(false);
      return data.movements;
    } catch (err) {
      console.error('Error fetching node movements:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return [];
    }
  }, [apiUrl]);

  /**
   * Fetch signatures for a specific movement
   */
  const getMovementSignatures = useCallback(async (movementId: string, networkId: string) => {
    if (!movementId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the signatures from the movements endpoint - they're included in the response
      const response = await fetch(apiUrl(`/movements?movementId=${movementId}&networkId=${networkId}`));
      if (!response.ok) {
        throw new Error(`Error fetching signatures: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Extract signatures from the movement's signature queue
      const movement = data.movements?.[0];
      if (!movement || !movement.signatureQueues) {
        return [];
      }
      
      // Flatten signatures from all queues
      const signatures = movement.signatureQueues.flatMap(queue => queue.signatures || []);
      
      setIsLoading(false);
      return signatures;
    } catch (err) {
      console.error('Error fetching movement signatures:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return [];
    }
  }, [apiUrl]);

  /**
   * Fetch activity logs for a specific node
   */
  const getNodeActivityLogs = useCallback(async (nodeId: string, networkId: string, limit = 50) => {
    if (!nodeId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl(`/events?nodeId=${nodeId}&limit=${limit}&networkId=${networkId}`));
      if (!response.ok) {
        throw new Error(`Error fetching activity logs: ${response.statusText}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return data.events || [];
    } catch (err) {
      console.error('Error fetching node activity logs:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return [];
    }
  }, [apiUrl]);

  /**
   * Fetch activity logs for a specific user
   */
  const getUserActivityLogs = useCallback(async (userAddress: string, networkId: string, limit = 50) => {
    if (!userAddress) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use direct user/:address endpoint as shown in server implementation
      const response = await fetch(apiUrl(`/user/${userAddress.toLowerCase()}?limit=${limit}&networkId=${networkId}`));
      
      if (!response.ok) {
        console.error(`Error response status: ${response.status} ${response.statusText}`);
        throw new Error(`Error fetching activity logs: ${response.statusText}`);
      }
      
      const data = await response.json();
      setIsLoading(false);
      
      // Combine events and signals
      return [...(data.events || []), ...(data.signals || [])];
    } catch (err) {
      console.error('Error fetching user activity logs:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return [];
    }
  }, [apiUrl]);

  /**
   * Fetch chat messages for a specific node
   */
  const getNodeChatMessages = useCallback(async (nodeId: string, limit = 50) => {
    if (!nodeId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use correct chat endpoint
      const response = await fetch(apiUrl(`/chat/messages?nodeId=${nodeId}&limit=${limit}`));
      
      if (!response.ok) {
        throw new Error(`Error fetching chat messages: ${response.statusText}`);
      }
      
      const data = await response.json();
      setIsLoading(false);
      
      // Return messages from the response
      return data.messages || [];
    } catch (err) {
      console.error('Error fetching node chat messages:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      
      // Try falling back to localStorage if server fails
      try {
        if (typeof window !== 'undefined') {
          const storageKey = `chat_messages_${nodeId}`;
          const existingMessagesJSON = localStorage.getItem(storageKey);
          
          if (existingMessagesJSON) {
            return JSON.parse(existingMessagesJSON);
          }
        }
      } catch (localError) {
        console.warn('Error fetching messages from localStorage fallback:', localError);
      }
      
      return [];
    }
  }, [apiUrl]);

  /**
   * Send a chat message for a specific node
   */
  const sendChatMessage = useCallback(async (nodeId: string, content: string, networkId: string) => {
    if (!nodeId || !content || !address) {
      throw new Error('Missing required parameters: nodeId, content, or sender address');
    }
    

    setIsLoading(true);
    setError(null);
    
    try {
      const messageData = {
        nodeId,
        sender: address,
        content,
        networkId
      };
      
      // Send message to the server API with correct endpoint
      const response = await fetch(apiUrl('/chat/messages'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (!response.ok) {
        throw new Error(`Error sending chat message: ${response.statusText}`);
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data.message;
    } catch (err) {
      console.error('Error sending chat message:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      
      // Try storing in localStorage as fallback if server fails
      try {
        if (typeof window !== 'undefined') {
          const storageKey = `chat_messages_${nodeId}`;
          const existingMessagesJSON = localStorage.getItem(storageKey) || '[]';
          const existingMessages = JSON.parse(existingMessagesJSON);
          
          const newMessage = {
            id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            nodeId,
            sender: address,
            content,
            timestamp: Date.now(),
            networkId
          };
          
          const updatedMessages = [...existingMessages, newMessage];
          localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
          
          return newMessage;
        }
      } catch (localError) {
        console.warn('Error storing message in localStorage fallback:', localError);
      }
      
      throw err;
    }
  }, [apiUrl, address]);

  /**
   * Validate chat message content
   */
  const validateChatMessage = useCallback(async (content: string) => {
    try {
      const response = await fetch(apiUrl('/chat/validate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error(`Error validating message: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error validating chat message:', err);
      
      // Fall back to client-side validation if server is unavailable
      return {
        isValid: content.trim().length > 0 && content.length <= 1000,
        validations: {
          tooLong: content.length > 1000,
          isEmpty: content.trim().length === 0,
          hasInvalidChars: /[\u0000-\u001F]/.test(content)
        },
        content
      };
    }
  }, [apiUrl]);

  /**
   * Submit a signature for a node or movement
   */
  const storeMovementSignature = useCallback(async (signatureData: any, networkId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const dataWithNetwork = {
        ...signatureData,
        networkId
      };
      
      // Use events/signature endpoint as shown in server implementation
      const response = await fetch(apiUrl('/events/signature'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithNetwork),
      });
      
      if (!response.ok) {
        throw new Error(`Error storing signature: ${response.statusText}`);
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error storing movement signature:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return null;
    }
  }, [apiUrl]);

  /**
   * Get user feed based on nodes they are members of
   */
  const getUserFeed = useCallback(async (userAddress: string, networkId: string, limit = 50) => {
    if (!userAddress) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use user/:address endpoint with includeNodes param as shown in server implementation
      const response = await fetch(apiUrl(`/user/${userAddress.toLowerCase()}?includeNodes=true&limit=${limit}&networkId=${networkId}`));
      if (!response.ok) {
        throw new Error(`Error fetching user feed: ${response.statusText}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error fetching user feed:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return [];
    }
  }, [apiUrl]);

  // Return the hook functions
  return {
    isLoading,
    error,
    getNodeMembranes,
    getAllMembranes,
    getNodeMovements,
    getMovementSignatures,
    getNodeActivityLogs,
    getUserActivityLogs,
    getNodeChatMessages,
    sendChatMessage,
    validateChatMessage,
    storeMovementSignature,
    getUserFeed
  };
}
