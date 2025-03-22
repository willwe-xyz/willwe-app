import { ActivityLogEntry } from '../types/activity';
import { ponderConfig } from './config';

/**
 * Configuration for the Ponder client
 */
export interface PonderClientConfig {
  serverUrl?: string;
}

/**
 * Default configuration
 */
const defaultConfig: PonderClientConfig = {
  serverUrl: ponderConfig.serverUrl
};

/**
 * Get activity logs for a node
 * @param nodeId Node ID
 * @param limit Maximum number of logs to return
 * @returns Array of activity logs
 */
export async function getNodeActivityLogs(nodeId: string, limit: number = 50): Promise<ActivityLogEntry[]> {
  try {
    return await fetchActivitiesFromPonderServer('node', nodeId, limit);
  } catch (error) {
    console.error(`Error getting node activity logs for ${nodeId}:`, error);
    throw error;
  }
}

/**
 * Get activity logs for a user
 * @param userAddress User address
 * @param limit Maximum number of logs to return
 * @returns Array of activity logs
 */
export async function getUserActivityLogs(userAddress: string, limit: number = 50): Promise<ActivityLogEntry[]> {
  try {
    return await fetchActivitiesFromPonderServer('user', userAddress, limit);
  } catch (error) {
    console.error(`Error getting user activity logs for ${userAddress}:`, error);
    throw error;
  }
}

/**
 * Fetch activities from the Ponder server
 * @param type Type of entity (node or user)
 * @param id Entity ID
 * @param limit Maximum number of logs to return
 * @returns Array of activity logs
 */
async function fetchActivitiesFromPonderServer(
  type: 'node' | 'user',
  id: string,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const config = defaultConfig;
  const endpoint = `${config.serverUrl}/api/activities`;
  
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  
  if (type === 'node') {
    params.append('nodeId', id);
  } else {
    params.append('userAddress', id);
  }
  
  try {
    const response = await fetch(`${endpoint}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch activities from Ponder server: ${response.statusText}`);
    }
    
    const data = await response.json();
    const activities = data.activities || [];
    
    return activities.map(formatActivityLog);
  } catch (error) {
    console.error(`Error fetching activities from Ponder server:`, error);
    return [];
  }
}

/**
 * Format an activity log
 * @param log Activity log
 * @returns Formatted activity log
 */
function formatActivityLog(log: any): ActivityLogEntry {
  return {
    id: log.id,
    nodeId: log.nodeId || log.node_id,
    node_id: log.nodeId || log.node_id,
    userAddress: log.userAddress || log.user_address,
    user_address: log.userAddress || log.user_address,
    eventType: log.eventType || log.event_type,
    event_type: log.eventType || log.event_type,
    data: typeof log.data === 'string' ? JSON.parse(log.data) : log.data,
    timestamp: log.timestamp
  };
}

// These functions are kept as no-ops to maintain API compatibility, but they no longer use local storage
export async function getDatabase(): Promise<any> {
  console.log('SQLite database removed - using remote Ponder server only');
  return null;
}

export async function storeActivityLog(
  nodeId: string,
  userAddress: string,
  eventType: string,
  data: any
): Promise<string> {
  console.log('Local activity log storage removed - sending directly to Ponder server');
  return `remote-${Date.now()}`;
}