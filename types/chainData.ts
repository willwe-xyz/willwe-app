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

// Structs matching contract definitions
export interface Call {
  target: string;  // address in Solidity
  callData: string; // bytes in Solidity
}

export interface Movement {
  category: MovementType;
  initiatior: string; // address in Solidity
  exeAccount: string; // address in Solidity
  viaNode: string; // uint256 in Solidity
  expiresAt: string; // uint256 in Solidity
  descriptionHash: string; // bytes32 in Solidity
  executedPayload: string; // bytes in Solidity
}

export interface SignatureQueue {
  state: SQState;
  Action: Movement;
  Signers: string[]; // address[] in Solidity
  Sigs: string[]; // bytes[] in Solidity
  exeSig: string; // bytes32 in Solidity
}

export interface UserSignal {
  MembraneInflation: [string, string][]; // string[2][] in Solidity
  lastRedistSignal: string[]; // string[] in Solidity
}

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
  membersOfNode: string[]; // address[] in Solidity
  childrenNodes: string[];
  rootPath: string[];
  signals: UserSignal[];
}

// Interface for transformed node data (frontend-friendly format)
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
}

// Updated transform function to match exact contract types
export const transformNodeData = (nodeData: NodeState): TransformedNodeData => {
  if (!nodeData || !Array.isArray(nodeData.basicInfo) || nodeData.basicInfo.length !== 9) {
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
    }))
  };
};

// Type guard functions
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

export const isValidUserSignal = (data: any): data is UserSignal => {
  return (
    data &&
    Array.isArray(data.MembraneInflation) &&
    Array.isArray(data.lastRedistSignal) &&
    data.MembraneInflation.every((item: any) => 
      Array.isArray(item) && item.length === 2 && 
      typeof item[0] === 'string' && typeof item[1] === 'string'
    )
  );
};