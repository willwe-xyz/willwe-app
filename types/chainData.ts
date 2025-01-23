// File: ./types/chainData.ts

// Reflects the smart contract's basic info array structure
export interface NodeBasicInfo {
  nodeId: string;              // basicInfo[0]
  inflation: string;           // basicInfo[1]
  balanceAnchor: string;      // basicInfo[2] - balance in parent reserve
  balanceBudget: string;      // basicInfo[3] - budget
  value: string;              // basicInfo[4] - valuation denominated in root token
  membraneId: string;         // basicInfo[5] - membrane id
  balanceOfUser: string;      // basicInfo[6] - balance of current user in this node
  eligibilityPerSec: string;  // basicInfo[7] - redistribution eligibility from parent per sec
  lastRedistribution: string; // basicInfo[8] - last redistribution timestamp
}

// Matches the smart contract's UserSignal struct
export interface UserSignal {
  MembraneInflation: [string, string][]; // Array of [membraneId, inflationRate] pairs
  lastRedistSignal: string[];            // Array of timestamps
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
}


export interface NodeState {
  basicInfo: [
    nodeId: string,              // basicInfo[0]
    inflation: string,           // basicInfo[1]
    reserve: string,             // basicInfo[2] - reserve balance
    budget: string,              // basicInfo[3] - budget balance
    rootValuationBudget: string, // basicInfo[4] - budget valuation in root token
    rootValuationReserve: string,// basicInfo[5] - reserve valuation in root token
    membraneId: string,          // basicInfo[6] - membrane identifier
    eligibilityPerSec: string,   // basicInfo[7] - redistribution rate
    lastRedistributionTime: string, // basicInfo[8] - last redistribution timestamp
    balanceOfUser: string        // basicInfo[9] - user's balance in this node
  ];
  membraneMeta: string;          // Membrane Metadata CID
  membersOfNode: string[];       // Array of member addresses
  childrenNodes: string[];       // Array of children node IDs
  rootPath: string[];           // Path from root to current node
  signals: UserSignal[];        // Array of signals
}

// For membrane-related data
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

export interface MembraneMetadata {
  name: string;
  characteristics: MembraneCharacteristic[];
  membershipConditions: {
    tokenAddress: string;
    requiredBalance: string;
  }[];
}

// For the processed node data used in the UI
export interface TransformedNodeData {
  basicInfo: NodeBasicInfo;
  membraneMeta: string;
  membersOfNode: string[];
  childrenNodes: string[];
  rootPath: string[];
  signals: UserSignal[];
  ancestors: string[];
}

// For computed statistics
export interface NodeStats {
  totalValue: string;
  dailyGrowth: string;
  memberCount: number;
  childCount: number;
  pathDepth: number;
}

// For membrane state from contract
export interface MembraneState {
  tokens: string[];
  balances: string[];
  meta: string;
}

// For query responses
export interface NodeQueryResponse {
  data: NodeState;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// For operation parameters
export interface NodeOperationParams {
  nodeId: string;
  chainId: string;
  options?: {
    gasLimit?: number;
    gasPrice?: string;
  };
}

// For signal data
export interface SignalData {
  membrane: string;
  inflation: string;
  timestamp: number;
  value: string;
}

// Movement types (if needed for governance)
export enum MovementType {
  Revert = 0,
  AgentMajority = 1,
  EnergeticMajority = 2
}

// Queue states (if needed for governance)
export enum SQState {
  None = 0,
  Initialized = 1,
  Valid = 2,
  Executed = 3,
  Stale = 4
}

// Type guard functions
export const isValidNodeState = (data: any): data is NodeState => {
  return (
    Array.isArray(data?.basicInfo) &&
    data.basicInfo.length === 10 &&
    typeof data.membraneMeta === 'string' &&
    Array.isArray(data.membersOfNode) &&
    Array.isArray(data.childrenNodes) &&
    Array.isArray(data.rootPath) &&
    Array.isArray(data.signals) &&
    data.signals.every((signal: any) =>
      Array.isArray(signal.MembraneInflation) &&
      Array.isArray(signal.lastRedistSignal)
    )
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

export const transformNodeData = (nodeData: NodeState): TransformedNodeData => {
  return {
    basicInfo: {
      nodeId: nodeData.basicInfo[0],
      inflation: nodeData.basicInfo[1],
      balanceAnchor: nodeData.basicInfo[2],
      balanceBudget: nodeData.basicInfo[3],
      value: nodeData.basicInfo[4],
      membraneId: nodeData.basicInfo[5],
      balanceOfUser: nodeData.basicInfo[6],
      eligibilityPerSec: nodeData.basicInfo[7],
      lastRedistribution: nodeData.basicInfo[8]
    },
    membraneMeta: nodeData.membraneMeta,
    membersOfNode: nodeData.membersOfNode,
    childrenNodes: nodeData.childrenNodes,
    rootPath: nodeData.rootPath,
    signals: nodeData.signals,
    ancestors: nodeData.ancestors
  };
};
