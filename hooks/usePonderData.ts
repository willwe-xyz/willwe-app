import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

// Environment variable for the Ponder API server URL with fallback to empty string (resolved at build time)
// const PONDER_SERVER_URL = process.env.NEXT_PUBLIC_PONDER_SERVER_URL || '';

/**
 * Hook to fetch and interact with data indexed by Ponder
 */
export function usePonderData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  


  /**
   * Helper function to build full API URLs
   */
  const apiUrl = (endpoint: string) => {
    // Always use internal API endpoints
    if (endpoint.startsWith('/')) return endpoint;
    return `/${endpoint}`;
  };

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
  }, []);

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
  }, []);

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
  }, []);

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
      const signatures = movement.signatureQueues.flatMap((queue: { signatures?: string[] }) => queue.signatures || []);
      
      setIsLoading(false);
      return signatures;
    } catch (err) {
      console.error('Error fetching movement signatures:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return [];
    }
  }, []);

  /**
   * Fetch activity logs for a specific node
   */
  const getNodeActivityLogs = useCallback(async (nodeId: string, networkId: string, limit = 50) => {
    if (!nodeId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl(`/api/events?nodeId=${nodeId}&limit=${limit}&networkId=${networkId}`));
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
  }, []);

  /**
   * Fetch activity logs for a specific user
   */
  const getUserActivityLogs = useCallback(async (userAddress: string, networkId: string, limit = 50) => {
    if (!userAddress) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
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
  }, []);

  /**
   * Fetch chat messages for a specific node
   */
  const getNodeChatMessages = useCallback(async (nodeId: string, limit = 50) => {
    if (!nodeId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use our Next.js API endpoint instead of calling Ponder directly
      const response = await fetch(`/api/chat/messages?nodeId=${nodeId}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching chat messages: ${response.statusText}`);
      }
      
      const data = await response.json();
      setIsLoading(false);
      
      // The Ponder server returns messages in a nested structure
      // Check both possible response formats
      const messages = data.messages || (data.data && data.data.messages) || [];
      
      // Ensure messages are properly formatted
      return messages.map((msg: any) => ({
        id: msg.id,
        nodeId: msg.nodeId || msg.node_id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
        networkId: msg.networkId || msg.network_id
      }));
    } catch (err) {
      console.error('Error fetching node chat messages:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return [];
    }
  }, []);

  /**
   * Send a chat message for a specific node
   */
  const sendChatMessage = useCallback(async (nodeId: string, userAddress: string, content: string, networkId: string) => {
    if (!nodeId || !content) {
      throw new Error('Missing required parameters: nodeId, content, or sender address');
    }
    

    setIsLoading(true);
    setError(null);
    
    try {
      const messageData = {
        nodeId,
        userAddress,
        content,
        networkId
      };
      
      // Send message to the server API with correct endpoint
      
      // Use fetch with our Next.js API endpoint (not directly to Ponder)
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        console.error('Chat error response:', errorText);
        throw new Error(`Error sending chat message: ${errorText}`);
      }
      
      const data = await response.json();
      setIsLoading(false);
      
      return data;
    } catch (err) {
      console.error('Error sending chat message:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      
      // Local storage fallback is removed since we're just using the Ponder server directly
      
      // For backwards compatibility, keep this stub
      try {
        if (typeof window !== 'undefined') {
          const newMessage = {
            id: `remote-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            nodeId,
            sender: userAddress,
            content,
            timestamp: Date.now(),
            networkId
          };
          
          // Don't actually modify localStorage, just log for debugging
          console.log("Local storage fallback is disabled");
          return newMessage;
        }
      } catch (localError) {
        console.warn('Error storing message in localStorage fallback:', localError);
      }
      
      throw err;
    }
  }, []);

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
  }, []);

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
  }, []);

  /**
   * Get user feed based on nodes they are members of
   */
  const getUserFeed = useCallback(async (userAddress: string, networkId: string, limit = 50, offset = 0) => {
    if (!userAddress) return { events: [], meta: { total: 0, limit, offset, nodeCount: 0 } };
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the internal API endpoint
      const url = `/api/userFeed/${userAddress.toLowerCase()}?limit=${limit}&offset=${offset}&networkId=${networkId}`;
      console.log('Fetching user feed from:', url);

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`Error fetching user feed: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log('User feed response:', data);
      
      // Validate the data format
      if (!data.events) {
        console.warn('Unexpected response format from userFeed endpoint:', data);
        data.events = [];
      }
      
      // Ensure data.meta exists
      if (!data.meta) {
        data.meta = {
          total: data.events.length,
          limit,
          offset,
          nodeCount: 0
        };
      }
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error fetching user feed:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return { events: [], meta: { total: 0, limit, offset, nodeCount: 0 } };
    }
  }, []);

  /**
   * Get events for a root node and all its derived nodes
   */
  const getRootNodeEvents = useCallback(async (rootNodeId: string, networkId: string, limit = 50, offset = 0) => {
    if (!rootNodeId) return { events: [], meta: { total: 0, limit, offset, nodeCount: 0 } };
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the new getrootnode-events endpoint with /api/ prefix
      const url = apiUrl(`/api/getrootnode-events?nodeId=${rootNodeId}&limit=${limit}&offset=${offset}&networkId=${networkId}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching root node events: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate the data format
      if (!data.events) {
        console.warn('Unexpected response format from getRootNodeEvents endpoint:', data);
        data.events = [];
      }
      
      // Ensure data.meta exists
      if (!data.meta) {
        data.meta = {
          total: data.events.length,
          limit,
          offset,
          nodeCount: 0
        };
      }
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error fetching root node events:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return { events: [], meta: { total: 0, limit, offset, nodeCount: 0 } };
    }
  }, []);

  /**
   * Get events for the entire network
   */
  const getNetworkEvents = useCallback(async (networkId: string, limit = 50, offset = 0) => {
    if (!networkId) return { events: [], meta: { total: 0, limit, offset } };
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the new network-events endpoint with /api/ prefix
      const url = apiUrl(`/api/network-events?limit=${limit}&offset=${offset}&networkId=${networkId}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching network events: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate the data format
      if (!data.events) {
        console.warn('Unexpected response format from getNetworkEvents endpoint:', data);
        data.events = [];
      }
      
      // Ensure data.meta exists
      if (!data.meta) {
        data.meta = {
          total: data.events.length,
          limit,
          offset
        };
      }
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error fetching network events:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return { events: [], meta: { total: 0, limit, offset } };
    }
  }, []);

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
    getUserFeed,
    getRootNodeEvents,
    getNetworkEvents
  };
}
