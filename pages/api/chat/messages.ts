import { NextApiRequest, NextApiResponse } from 'next';
import { getChatMessages, addChatMessage } from '../../../lib/db/chat';

// Helper function for consistent error responses
const errorResponse = (res: NextApiResponse, status: number, message: string, details?: unknown) => {
  interface ErrorResponse {
    error: string;
    details?: unknown;
  }
  
  const errorData: ErrorResponse = { error: message };
  if (process.env.NODE_ENV !== 'production' && details) {
    errorData.details = details;
  }
  return res.status(status).json(errorData);
};

// Validate request body
const validateMessage = (body: any): { valid: boolean; error?: string; data?: any } => {
  const { nodeId, userAddress, content, networkId = '1' } = body;
  
  if (!nodeId) return { valid: false, error: 'nodeId is required' };
  if (!userAddress) return { valid: false, error: 'userAddress is required' };
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return { valid: false, error: 'content must be a non-empty string' };
  }
  
  return { 
    valid: true, 
    data: { 
      nodeId: nodeId.toString(), 
      userAddress: userAddress.toString(), 
      content: content.trim(), 
      networkId: networkId.toString() 
    } 
  };
};

interface ChatMessage {
  id: string | number;
  nodeId: string;
  sender: string;
  content: string;
  timestamp: string;
  networkId: string;
}

// Main API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Handle GET request - Fetch messages
    if (req.method === 'GET') {
      const { nodeId, limit = '50' } = req.query;
      
      // Validate nodeId
      if (!nodeId || typeof nodeId !== 'string') {
        return errorResponse(res, 400, 'Valid Node ID is required');
      }
      
      // Parse and validate limit
      const limitNum = Math.min(parseInt(limit as string, 10) || 50, 200); // Cap at 200 messages
      
      try {
        console.log(`Fetching up to ${limitNum} messages for node ${nodeId}`);
        const messages = await getChatMessages(nodeId, limitNum);
        
        // Format messages to match the expected structure
        const formattedMessages: ChatMessage[] = messages.map(msg => ({
          id: msg.id.toString(),
          nodeId: msg.node_id,
          sender: msg.sender,
          content: msg.content,
          timestamp: new Date(msg.created_at).toISOString(),
          networkId: msg.network_id || '1' // Default to '1' if not specified
        }));
        
        console.log(`Returning ${formattedMessages.length} messages`);
        return res.status(200).json(formattedMessages);
        
      } catch (error) {
        console.error('Error fetching messages:', error);
        return errorResponse(
          res, 
          500, 
          'Failed to fetch messages',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    } 
    
    // Handle POST request - Add new message
    else if (req.method === 'POST') {
      // Validate request body
      const validation = validateMessage(req.body);
      if (!validation.valid) {
        return errorResponse(res, 400, validation.error || 'Invalid request');
      }
      
      const { nodeId, userAddress, content, networkId } = validation.data!;
      
      try {
        console.log(`Adding new message to node ${nodeId} from ${userAddress}`);
        const newMessage = await addChatMessage(
          nodeId,
          userAddress,
          content,
          networkId
        );
        
        // Format the response to match the expected structure
        const formattedMessage: ChatMessage = {
          id: newMessage.id.toString(),
          nodeId: newMessage.node_id,
          sender: newMessage.sender,
          content: newMessage.content,
          timestamp: new Date(newMessage.created_at).toISOString(),
          networkId: newMessage.network_id || '1'
        };
        
        console.log(`Message added with ID: ${formattedMessage.id}`);
        return res.status(201).json(formattedMessage);
        
      } catch (error) {
        console.error('Error adding message:', error);
        return errorResponse(
          res,
          500,
          'Failed to add message',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
    
    // Handle unsupported HTTP methods
    return errorResponse(
      res,
      405,
      'Method not allowed',
      { allowed: ['GET', 'POST'] }
    );
    
  } catch (error) {
    console.error('Unexpected error in chat API:', error);
    return errorResponse(
      res,
      500,
      'Internal Server Error',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}