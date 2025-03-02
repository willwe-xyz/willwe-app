import { ponder } from '@/generated';
import { 
  storeChatMessage, 
  getChatMessages, 
  getDatabase 
} from '../utils/database';

/**
 * This file contains handlers for chat-related operations
 * Since chat messages are not directly stored on-chain, we'll provide
 * utility functions to store and retrieve them from SQLite
 */

/**
 * Store a chat message in the database
 * @param nodeId The ID of the node the message belongs to
 * @param sender The address of the sender
 * @param content The content of the message
 */
export async function storeNodeChatMessage(nodeId: string, sender: string, content: string) {
  return await storeChatMessage(nodeId, sender, content);
}

/**
 * Get chat messages for a node
 * @param nodeId The ID of the node
 * @param limit The maximum number of messages to retrieve
 * @param offset The offset for pagination
 */
export async function getNodeChatMessages(nodeId: string, limit = 50, offset = 0) {
  return await getChatMessages(nodeId, limit, offset);
}

/**
 * Get chat messages for a user across all nodes
 * @param userAddress The address of the user
 * @param limit The maximum number of messages to retrieve
 * @param offset The offset for pagination
 */
export async function getUserChatMessages(userAddress: string, limit = 50, offset = 0) {
  const db = await getDatabase();
  
  const messages = await db.all(
    'SELECT * FROM chat_messages WHERE sender = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
    [userAddress, limit, offset]
  );
  
  return messages;
}

/**
 * Delete a chat message
 * @param messageId The ID of the message to delete
 * @param userAddress The address of the user attempting to delete (for authorization)
 */
export async function deleteChatMessage(messageId: string, userAddress: string) {
  const db = await getDatabase();
  
  // First check if the user is the sender of the message
  const message = await db.get(
    'SELECT * FROM chat_messages WHERE id = ?',
    [messageId]
  );

  if (!message || message.sender !== userAddress) {
    throw new Error('Unauthorized: You can only delete your own messages');
  }

  await db.run(
    'DELETE FROM chat_messages WHERE id = ?',
    [messageId]
  );

  return { success: true };
}
