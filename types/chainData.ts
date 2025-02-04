

export interface NodeBasicInfo {
  nodeId: string;                    // basicInfo[0]
  inflation: string;                 // basicInfo[1]
  balanceAnchor: string;            // basicInfo[2] - reserve balance
  balanceBudget: string;            // basicInfo[3] - budget balance
  rootValuationBudget: string;      // basicInfo[4]
  rootValuationReserve: string;     // basicInfo[5]
  membraneId: string;               // basicInfo[6]
  eligibilityPerSec: string;        // basicInfo[7]
  lastRedistribution: string;       // basicInfo[8]
  balanceOfUser: string;            // basicInfo[9] - defaults to "0"
  endpointOfUserForNode: string;    // basicInfo[10] - defaults to address(0)
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
    nodeId: string,
    inflation: string,
    reserve: string, 
    budget: string,
    rootValuationBudget: string,
    rootValuationReserve: string,
    membraneId: string,
    eligibilityPerSec: string,
    lastRedistributionTime: string,
    balanceOfUser: string,
    endpointOfUserForNode: string
  ];
  membraneMeta: string;          // Membrane Metadata CID
  membersOfNode: string[];       // Array of member addresses
  childrenNodes: string[];       // Array of children node IDs
  rootPath: string[];            // Path from root to current node
  signals: UserSignal[];         // Array of signals
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
    data.basicInfo.length === 11 &&
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
    nodeId: nodeData.basicInfo[0],
    inflation: nodeData.basicInfo[1],
    balanceAnchor: nodeData.basicInfo[2],
    balanceBudget: nodeData.basicInfo[3],
    rootValuationBudget: nodeData.basicInfo[4],
    rootValuationReserve: nodeData.basicInfo[5],
    membraneId: nodeData.basicInfo[6],
    eligibilityPerSec: nodeData.basicInfo[7],
    lastRedistribution: nodeData.basicInfo[8],
    balanceOfUser: nodeData.basicInfo[9],
    endpointOfUserForNode: nodeData.basicInfo[10]
  };
};
