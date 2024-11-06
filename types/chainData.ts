// types/chainData.ts

export enum SQState {
  None = 0,
  Initialized = 1,
  Valid = 2,
  Executed = 3,
  Stale = 4
}

export enum MovementType {
  Revert = 0,
  AgentMajority = 1,
  EnergeticMajority = 2
}

// Base interfaces for membrane-related types
export interface MembraneMetadata {
  name: string;
  description?: string;
  ipfsHash?: string;
  createdAt?: number;
  updatedAt?: number;
  version?: string;
  creator?: string;
  characteristics: MembraneCharacteristic[];
  membershipConditions: MembershipCondition[];
  config?: MembraneConfig;
  tags?: string[];
}

export interface MembraneCharacteristic {
  title: string;
  description?: string;
  link?: string;
  type?: 'requirement' | 'feature' | 'constraint' | 'other';
  value?: string | number | boolean;
  category?: string;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface MembershipCondition {
  tokenAddress: string;
  requiredBalance: string;
  symbol?: string;
  decimals?: number;
  name?: string;
  type?: 'erc20' | 'erc721' | 'erc1155';
  chainId?: string;
  conditions?: TokenCondition[];
}

export interface TokenCondition {
  type: 'minBalance' | 'maxBalance' | 'tokenId' | 'timelock' | 'custom';
  value: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface MembraneConfig {
  threshold?: number;
  cooldown?: number;
  duration?: number;
  quorum?: number;
  votingPeriod?: number;
  timelock?: number;
  constraints?: MembraneConstraint[];
  permissions?: MembranePermission[];
}

export interface MembraneConstraint {
  type: string;
  value: any;
  description?: string;
}

export interface MembranePermission {
  action: string;
  role: string;
  condition?: string;
}

// Interface for membrane requirements display
export interface MembraneRequirement {
  tokenAddress: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
  decimals?: number;
  name?: string;
  chainId?: string;
  metadata?: {
    icon?: string;
    description?: string;
    externalUrl?: string;
  };
}

// Interface for membrane state from contract
export interface MembraneState {
  id: string;
  metadata: string; // IPFS hash
  tokens: string[];
  balances: string[];
  active: boolean;
  totalSupply?: string;
  memberCount?: number;
  createdAt: number;
  lastUpdated?: number;
}

// Membrane validation response
export interface MembraneValidation {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  missingRequirements?: MembershipCondition[];
  satisfiedRequirements?: MembershipCondition[];
}

// Extended node state including membrane data
export interface NodeState {
  basicInfo: [
    string, // nodeId
    string, // inflation
    string, // balanceAnchor
    string, // balanceBudget
    string, // value
    string, // membraneId
    string, // balanceOfUser
    string, // childParentEligibilityPerSec
    string  // lastParentRedistribution
  ];
  membraneMeta: string;
  membersOfNode: string[];
  childrenNodes: string[];
  rootPath: string[];
  signals: UserSignal[];
  membrane?: MembraneState;
}

// Signal types
export interface UserSignal {
  MembraneInflation: [string, string][];
  lastRedistSignal: string[];
}

// Transform types for frontend display
export interface TransformedNodeData {
  basicInfo: {
    nodeId: string;
    inflation: string;
    balanceAnchor: string;
    balanceBudget: string;
    value: string;
    membraneId: string;
    balanceOfUser: string;
    childParentEligibilityPerSec: string;
    lastParentRedistribution: string;
  };
  membraneMeta: string;
  membersOfNode: string[];
  childrenNodes: string[];
  rootPath: string[];
  signals: Array<{
    MembraneInflation: [string, string][];
    lastRedistSignal: string[];
  }>;
  membrane?: MembraneMetadata;
}

// Helper functions for type validation
export const isValidNodeState = (data: any): data is NodeState => {
  return (
    data &&
    Array.isArray(data.basicInfo) &&
    data.basicInfo.length === 9 &&
    typeof data.membraneMeta === 'string' &&
    Array.isArray(data.membersOfNode) &&
    Array.isArray(data.childrenNodes) &&
    Array.isArray(data.rootPath) &&
    Array.isArray(data.signals)
  );
};

export const isValidMembraneMetadata = (data: any): data is MembraneMetadata => {
  return (
    data &&
    typeof data.name === 'string' &&
    Array.isArray(data.characteristics) &&
    Array.isArray(data.membershipConditions) &&
    data.membershipConditions.every((condition: any) =>
      typeof condition.tokenAddress === 'string' &&
      typeof condition.requiredBalance === 'string'
    )
  );
};

export const isValidUserSignal = (data: any): data is UserSignal => {
  return (
    data &&
    Array.isArray(data.MembraneInflation) &&
    Array.isArray(data.lastRedistSignal) &&
    data.MembraneInflation.every((item: any) =>
      Array.isArray(item) &&
      item.length === 2 &&
      typeof item[0] === 'string' &&
      typeof item[1] === 'string'
    )
  );
};

// Transform function for node data
export const transformNodeData = (nodeData: NodeState): TransformedNodeData => {
  if (!isValidNodeState(nodeData)) {
    throw new Error('Invalid node data format');
  }

  const [
    nodeId,
    inflation,
    balanceAnchor,
    balanceBudget,
    value,
    membraneId,
    balanceOfUser,
    childParentEligibilityPerSec,
    lastParentRedistribution
  ] = nodeData.basicInfo;

  return {
    basicInfo: {
      nodeId: nodeId || '0',
      inflation: inflation || '0',
      balanceAnchor: balanceAnchor || '0',
      balanceBudget: balanceBudget || '0',
      value: value || '0',
      membraneId: membraneId || '0',
      balanceOfUser: balanceOfUser || '0',
      childParentEligibilityPerSec: childParentEligibilityPerSec || '0',
      lastParentRedistribution: lastParentRedistribution || '0'
    },
    membraneMeta: nodeData.membraneMeta,
    membersOfNode: nodeData.membersOfNode,
    childrenNodes: nodeData.childrenNodes,
    rootPath: nodeData.rootPath,
    signals: nodeData.signals.map(signal => ({
      MembraneInflation: signal.MembraneInflation,
      lastRedistSignal: signal.lastRedistSignal
    })),
    membrane: nodeData.membrane
  };
};