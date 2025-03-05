/**
 * Types for activity logs and items
 */

/**
 * Activity log entry from the database
 */
export interface ActivityLogEntry {
  id: string;
  nodeId?: string;
  node_id?: string;
  userAddress?: string;
  user_address?: string;
  eventType?: string;
  event_type?: string;
  data: string | Record<string, any>;
  timestamp: string;
}

/**
 * Activity item for display in the UI
 */
export interface ActivityItem {
  id: string;
  nodeId: string;
  userAddress: string;
  type: string;
  eventType: string;
  description: string;
  data: any;
  timestamp: string;
  isUserFocused?: boolean;
}

/**
 * Activity types
 */
export enum ActivityType {
  MINT = 'mint',
  BURN = 'burn',
  SIGNAL = 'signal',
  RESIGNAL = 'resignal',
  TRANSFER = 'transfer',
  INFLATION_CHANGE = 'inflationChange',
  MEMBRANE_CHANGE = 'membraneChange',
  MEMBERSHIP = 'membership',
  CONFIG_SIGNAL = 'configSignal',
  ENDPOINT = 'endpoint',
  NEW_MOVEMENT = 'newMovement',
  QUEUE_EXECUTED = 'queueExecuted',
}
