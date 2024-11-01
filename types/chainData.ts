// types/chainData.ts

/**
 * Represents the basic information of a node
 * [nodeId, inflation, balanceAnchor, balanceBudget, value, membraneId, balanceOfUser, childParentEligibilityPerSec, lastParentRedistribution]
 */
export type NodeBasicInfo = [
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

/**
 * Signal data structure for membrane inflation
 */
export interface UserSignal {
  MembraneInflation: [string, string][]; // [membraneId, inflation][]
  lastRedistSignal: string[];            // Timestamps of last redistribution signals
}

/**
 * Core node state structure matching the updated smart contract
 */
export interface NodeState {
  basicInfo: NodeBasicInfo;
  membraneMeta: string;           // IPFS hash or direct metadata
  membersOfNode: string[];        // Array of member addresses
  childrenNodes: string[];        // Array of child node IDs
  rootPath: string[];             // Path from root to current node
  signals: UserSignal[];          // Array of signal data
}

/**
 * Transformed node data for frontend use
 */
export interface TransformedNodeData {
  id: string;
  inflation: bigint;
  balanceAnchor: bigint;
  balanceBudget: bigint;
  value: bigint;
  membraneId: string;
  balanceOfUser: bigint;
  childParentEligibilityPerSec: bigint;
  lastParentRedistribution: bigint;
  membraneMeta: string;
  members: string[];
  children: string[];
  path: string[];
  signals: {
    membrane: string;
    inflation: bigint;
    timestamp: number;
  }[];
}

/**
 * Node view specific data
 */
export interface NodeViewData extends TransformedNodeData {
  percentage: number;
  valueFormatted: string;
  inflationFormatted: string;
  lastActivityTime: number;
  isActive: boolean;
}

/**
 * Helper function to transform raw node data
 */
export function transformNodeData(nodeData: NodeState): TransformedNodeData {
  return {
    id: nodeData.basicInfo[0],
    inflation: BigInt(nodeData.basicInfo[1]),
    balanceAnchor: BigInt(nodeData.basicInfo[2]),
    balanceBudget: BigInt(nodeData.basicInfo[3]),
    value: BigInt(nodeData.basicInfo[4]),
    membraneId: nodeData.basicInfo[5],
    balanceOfUser: BigInt(nodeData.basicInfo[6]),
    childParentEligibilityPerSec: BigInt(nodeData.basicInfo[7]),
    lastParentRedistribution: BigInt(nodeData.basicInfo[8]),
    membraneMeta: nodeData.membraneMeta,
    members: nodeData.membersOfNode,
    children: nodeData.childrenNodes,
    path: nodeData.rootPath,
    signals: nodeData.signals.flatMap(signal =>
      signal.MembraneInflation.map((membraneInflation, index) => ({
        membrane: membraneInflation[0],
        inflation: BigInt(membraneInflation[1]),
        timestamp: Number(signal.lastRedistSignal[index])
      }))
    )
  };
}

/**
 * Extension of the Covalent BalanceItem type
 */
export interface BalanceItem {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  supports_erc?: string[] | null;
  logo_url: string | null;
  balance: string;
  quote: number | null;
  quote_rate: number | null;
}

/**
 * Protocol balance structure
 */
export interface ProtocolBalance extends BalanceItem {
  locked_balance?: string;
  unlocked_balance?: string;
  last_activity?: number;
}