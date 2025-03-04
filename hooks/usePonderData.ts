import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to fetch and interact with data indexed by Ponder
 */
export function usePonderData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch membranes for a specific node
   */
  const getNodeMembranes = useCallback(async (nodeId: string) => {
    if (!nodeId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ponder/membranes?nodeId=${nodeId}`);
      if (!response.ok) {
        throw new Error(`Error fetching membranes: ${response.statusText}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return data;
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
  const getAllMembranes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ponder/membranes');
      if (!response.ok) {
        throw new Error(`Error fetching membranes: ${response.statusText}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return data;
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
  const getNodeMovements = useCallback(async (nodeId: string) => {
    if (!nodeId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ponder/movements?nodeId=${encodeURIComponent(nodeId)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`Error fetching movements: ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of movements');
      }
      setIsLoading(false);
      return data;
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
  const getMovementSignatures = useCallback(async (movementId: string) => {
    if (!movementId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ponder/signatures?movementId=${movementId}`);
      if (!response.ok) {
        throw new Error(`Error fetching signatures: ${response.statusText}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return data;
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
  const getNodeActivityLogs = useCallback(async (nodeId: string, limit = 50) => {
    if (!nodeId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ponder/activity-logs?nodeId=${nodeId}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Error fetching activity logs: ${response.statusText}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return data.map(log => ({
        ...log,
        data: JSON.parse(log.data || '{}')
      }));
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
  const getUserActivityLogs = useCallback(async (userAddress: string, limit = 50) => {
    if (!userAddress) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ponder/activity-logs?userAddress=${userAddress}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Error fetching activity logs: ${response.statusText}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return data.map(log => ({
        ...log,
        data: JSON.parse(log.data || '{}')
      }));
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
      
      const response = await fetch(`/api/ponder/chat-messages?nodeId=${nodeId}&limit=${limit}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response from server: ${errorText}`);
        throw new Error(`Error fetching chat messages: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setIsLoading(false);
      return data;
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
  const sendChatMessage = useCallback(async (nodeId: string, sender: string, content: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Sending chat message for node ${nodeId} from ${sender}`);
      
      const response = await fetch('/api/ponder/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodeId, sender, content }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response from server: ${errorText}`);
        throw new Error(`Error sending chat message: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Chat message sent successfully:', data);
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error sending chat message:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      throw err;
    }
  }, []);

  /**
   * Store a movement signature
   */
  const storeMovementSignature = useCallback(async (signatureData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ponder/signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signatureData),
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
   * Get user feed based on nodes they are members of or own tokens for
   */
  const getUserFeed = useCallback(async (userAddress: string, limit = 50) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ponder/user-feed?userAddress=${userAddress}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Error fetching user feed: ${response.statusText}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return data.map(log => ({
        ...log,
        data: JSON.parse(log.data || '{}')
      }));
    } catch (err) {
      console.error('Error fetching user feed:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return [];
    }
  }, []);

  /**
   * Get user redistributive preferences
   */
  const getUserPreferences = useCallback(async (userAddress: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ponder/user-preferences?userAddress=${userAddress}`);
      if (!response.ok) {
        throw new Error(`Error fetching user preferences: ${response.statusText}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return {
        ...data,
        redistributive_preferences: JSON.parse(data.redistributive_preferences || '{}'),
        supported_movements: JSON.parse(data.supported_movements || '[]')
      };
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return null;
    }
  }, []);

  /**
   * Update user redistributive preferences
   */
  const updateUserPreferences = useCallback(async (
    userAddress: string, 
    redistributivePreferences: any, 
    supportedMovements: string[]
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ponder/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress, redistributivePreferences, supportedMovements }),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating user preferences: ${response.statusText}`);
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error updating user preferences:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return null;
    }
  }, []);

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
    storeMovementSignature,
    getUserFeed,
    getUserPreferences,
    updateUserPreferences
  };
}
