export interface NodeBasicInfo {
  nodeId: string;                    
  inflation: string;                 
  balanceAnchor: string;            
  balanceBudget: string;            
  rootValuationBudget: string;      
  rootValuationReserve: string;     
  membraneId: string;               
  eligibilityPerSec: string;        
  lastRedistribution: string;       
  balanceOfUser: string;            
  endpointOfUserForNode: string;    
  totalSupply: string;              
}

// Add ActivityType enum
export enum ActivityType {
  MINT = 'mint',
  BURN = 'burn',
  SIGNAL = 'signal',
  RESIGNAL = 'resignal',
  MEMBERSHIP = 'membership',
  CONFIG_SIGNAL = 'configSignal',
  NEW_MOVEMENT = 'newMovement',
  TRANSFER = 'transfer'
}

export interface UserSignal {
  MembraneInflation: [string, string][];
  lastRedistSignal: string[];           
}

export interface MembraneCharacteristic {
  name: string;
  value: string;
  description?: string;
}

export interface MembraneMetadata {
  name: string;
  id: string;
  description?: string;
  characteristics: MembraneCharacteristic[];
  membershipConditions: {
    tokenAddress: string;
    requiredBalance: string;
  }[];
  createdAt: string;
}

export interface NodeState {
  basicInfo: NodeBasicInfo;
  membraneMeta: string;             // Membrane Metadata CID
  membersOfNode: string[];          // Array of member addresses
  childrenNodes: string[];          // Array of children node IDs
  movementEndpoints: string[];      // Array of node specific execution endpoints
  rootPath: string[];               // Path from root to current node
  signals: string[];                // Array of uint256 signals
}


export interface MembraneRequirement {
  tokenAddress: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
}

export interface MembraneCharacteristic {
  title: string;
  link?: string;
}

export interface TransformedNodeData {
  basicInfo: NodeBasicInfo;
  membraneMeta: string;
  membersOfNode: string[];
  childrenNodes: string[];
  rootPath: string[];
  signals: UserSignal[];
  ancestors: string[];
}

export interface NodeStats {
  totalValue: string;
  dailyGrowth: string;
  memberCount: number;
  childCount: number;
  pathDepth: number;
}

export interface MembraneState {
  tokens: string[];
  balances: string[];
  meta: string;
  createdAt: string;
}

export interface NodeQueryResponse {
  data: NodeState;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface NodeOperationParams {
  nodeId: string;
  chainId: string;
  options?: {
    gasLimit?: number;
    gasPrice?: string;
  };
}

export interface SignalData {
  membrane: string;
  inflation: string;
  timestamp: number;
  value: string;
}

// Movement and governance types
export enum MovementType {
  Revert = 0,
  AgentMajority = 1,
  EnergeticMajority = 2
}

export enum SignatureQueueState {
  None = 0,
  Initialized = 1,
  Valid = 2,
  Executed = 3,
  Stale = 4
}

export interface Call {
  target: string;
  callData: string;
  value: string;
}

export interface Movement {
  category: MovementType;
  initiatior: string;
  exeAccount: string;
  viaNode: string;
  expiresAt: string;
  description: string;
  executedPayload: string;
}

export interface SignatureQueue {
  state: SignatureQueueState;
  Action: Movement;
  Signers: string[];
  Sigs: string[];
}

export interface LatentMovement {
  movement: Movement;
  signatureQueue: {
    state: SignatureQueueState;
    Action: Movement;  // This should match the Movement interface
    Signers: string[];
    Sigs: string[];
  };
  movementHash: string;
}

export interface IPFSMetadata {
  description: string;
  timestamp: number;
}

export interface MovementDescription {
  description: string;
  timestamp: number;
}

export interface MovementSignatureStatus {
  current: number;
  required: number;
  hasUserSigned: boolean;
}


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
  id: string; // Primary key
  nodeId: string; // Node ID
  who: string; // Actor
  eventName: string; // Event name
  eventType: string; // Event type
  when: string; // Timestamp
  createdBlockNumber: number; // Block number
  network: string; // Network name
  networkId: string; // Network ID
  amount?: string; // Optional amount
  tokenSymbol?: string; // Optional token symbol
  description?: string; // Description of the activity
  status?: 'pending' | 'success' | 'failed'; // Status of the activity
}

///////////////////////////////////////////
// Type guard functions
///////////////////////////////////////////
export const isValidNodeState = (data: any): data is NodeState => {
  return (
    Array.isArray(data?.basicInfo) &&
    data.basicInfo.length === 12 &&
    typeof data.membraneMeta === 'string' &&
    Array.isArray(data.membersOfNode) &&
    Array.isArray(data.childrenNodes) &&
    Array.isArray(data.rootPath) &&
    Array.isArray(data.signals)
  );
};

export const isValidUserSignal = (data: any): data is UserSignal => {
  return (
    Array.isArray(data?.MembraneInflation) &&
    Array.isArray(data?.lastRedistSignal) &&
    data.MembraneInflation.every((item: any) =>
      Array.isArray(item) &&
      item.length === 2 &&
      typeof item[0] === 'string' &&
      typeof item[1] === 'string'
    )
  );
};

export const transformNodeData = (nodeData: NodeState): NodeBasicInfo => {
  return {
    nodeId: nodeData.basicInfo.nodeId,
    inflation: nodeData.basicInfo.inflation,
    balanceAnchor: nodeData.basicInfo.balanceAnchor,
    balanceBudget: nodeData.basicInfo.balanceBudget,
    rootValuationBudget: nodeData.basicInfo.rootValuationBudget,
    rootValuationReserve: nodeData.basicInfo.rootValuationReserve,
    membraneId: nodeData.basicInfo.membraneId,
    eligibilityPerSec: nodeData.basicInfo.eligibilityPerSec,
    lastRedistribution: nodeData.basicInfo.lastRedistribution,
    balanceOfUser: nodeData.basicInfo.balanceOfUser,
    endpointOfUserForNode: nodeData.basicInfo.endpointOfUserForNode,
    totalSupply: nodeData.basicInfo.totalSupply
  };
};