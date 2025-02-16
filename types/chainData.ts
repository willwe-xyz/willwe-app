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
}

export interface UserSignal {
  MembraneInflation: [string, string][];
  lastRedistSignal: string[];           
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
  membraneMeta: string;          
  membersOfNode: string[];       
  childrenNodes: string[];
  movementEndpoints: string[];       
  rootPath: string[];            
  signals: UserSignal[];         
}

//  /// @notice returns a node's data given its identifier
//     /// @notice basicInfo: [nodeId, inflation, balanceAnchor, balanceBudget, value, membraneId, (balance of user), balanceOfUser, childParentEligibilityPerSec, lastParentRedistribution]
//     /// @param nodeId node identifier
//     /// @dev for eth_call
//     function getNodeData(uint256 nodeId) private view returns (NodeState memory NodeData) {
//       /// Node identifier
//       NodeData.basicInfo[0] = nodeId.toString();
//       /// Current inflation rate per second
//       NodeData.basicInfo[1] = inflSec[nodeId][0].toString();
//       /// Reserve balance - amount of tokens held in parent's reserve
//       NodeData.basicInfo[2] = balanceOf(toAddress(nodeId), parentOf[nodeId]).toString();
//       /// Budget balance - amount of tokens held in node's own account
//       NodeData.basicInfo[3] = balanceOf(toAddress(nodeId), nodeId).toString();
//       /// Root valuation of node's budget (denominated in root token)
//       NodeData.basicInfo[4] = (asRootValuation(nodeId, balanceOf(toAddress(nodeId), nodeId))).toString();
//       /// Root valuation of node's reserve (denominated in root token)
//       NodeData.basicInfo[5] = (asRootValuation(nodeId, balanceOf(toAddress(nodeId), parentOf[nodeId]))).toString();
//       /// Active membrane identifier
//       NodeData.basicInfo[6] = (inUseMembraneId[nodeId][0]).toString();
//       /// Redistribution eligibility rate from parent per second in root valuation
//       NodeData.basicInfo[7] = (
//           asRootValuation(options[keccak256(abi.encodePacked(nodeId, parentOf[nodeId]))][0], parentOf[nodeId])
//       ).toString();

//       /// Timestamp of last redistribution
//       NodeData.basicInfo[8] = inflSec[nodeId][2].toString();
//       /// Balance of user
//       /// basicInfo[9];
//       /// Endpoint of user for node if any
//       /// basicInfo[10];

//       /// Membrane Metadata CID
//       NodeData.membraneMeta = M.getMembraneById(inUseMembraneId[nodeId][0]).meta;
//       /// Array of member addresses
//       NodeData.membersOfNode = members[nodeId];

//       NodeData.movementEndpoints = members[toID(executionAddress) + nodeId];
//       /// Array of direct children node IDs
//       NodeData.childrenNodes = uintArrayToStringArray(childrenOf[nodeId]);
//       /// Path from root token to node ID (ancestors)
//       NodeData.rootPath = uintArrayToStringArray(getFidPath(nodeId));
//   }

//   function getNodes(uint256[] memory nodeIds) external view returns (NodeState[] memory nodes) {
//       nodes = new NodeState[](nodeIds.length);
//       for (uint256 i = 0; i < nodeIds.length; i++) {
//           nodes[i] = getNodeData(nodeIds[i]);
//       }
//   }

//   ///
//   function getAllNodesForRoot(address rootAddress, address userIfAny)
//       external
//       view
//       returns (NodeState[] memory nodes)
//   {
//       uint256 rootId = toID(rootAddress);
//       nodes = new NodeState[](members[rootId].length);
//       for (uint256 i = 0; i < members[rootId].length; i++) {
//           nodes[i] = getNodeData(toID(members[rootId][i]), userIfAny);
//       }
//   }

//   /// @notice Returns the array containing signal info for each child node in given originator and parent context
//   /// @param signalOrigin address of originator
//   /// @param parentNodeId node id for which originator has expressed
//   function getUserNodeSignals(address signalOrigin, uint256 parentNodeId)
//       external
//       view
//       returns (uint256[2][] memory UserNodeSignals)
//   {
//       uint256[] memory childNodes = childrenOf[parentNodeId];
//       UserNodeSignals = new uint256[2][](childNodes.length);

//       for (uint256 i = 0; i < childNodes.length; i++) {
//           // Include the signalOrigin (user's address) in the signalKey
//           bytes32 userTargetedPreference = keccak256(abi.encodePacked(signalOrigin, parentNodeId, childNodes[i]));

//           // Store the signal value and the timestamp (assuming options[userKey] structure)
//           UserNodeSignals[i][0] = options[userTargetedPreference][0]; // Signal value
//           UserNodeSignals[i][1] = options[userTargetedPreference][1]; // Last updated timestamp
//       }

//       return UserNodeSignals;
//   }

//   function getNodeData(uint256 nodeId, address user) public view returns (NodeState memory nodeData) {
//       nodeData = getNodeData(nodeId);
//       if (user == address(0)) return nodeData;
//       nodeData.basicInfo[9] = balanceOf(user, nodeId).toString();
//       uint256 userEndpointId = toID(user) + nodeId;
//       if (members[userEndpointId].length > 0) {
//           nodeData.basicInfo[10] = Strings.toHexString(members[userEndpointId][0]);
//       }
//       nodeData.signals = new UserSignal[](1);
//       nodeData.signals[0].MembraneInflation = new string[2][](childrenOf[nodeId].length);
//       nodeData.signals[0].lastRedistSignal = new string[](childrenOf[nodeId].length);

//       for (uint256 i = 0; i < childrenOf[nodeId].length; i++) {
//           nodeData.signals[0].MembraneInflation[i][1] = inflSec[nodeId][0].toString();

//           bytes32 userKey = keccak256(abi.encodePacked(user, nodeId, childrenOf[nodeId][i]));
//           nodeData.signals[0].lastRedistSignal[i] = options[userKey][0].toString();
//       }
//   }


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
  descriptionHash: string;
  executedPayload: string;
}

export interface SignatureQueue {
  state: SignatureQueueState;
  Action: Movement;
  Signers: string[];
  Sigs: string[];
  exeSig: string;
}

export interface LatentMovement {
  movement: Movement;
  movementHash: string; // This is derived from the movement data
  signatureQueue: SignatureQueue;
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

///////////////////////////////////////////
// Type guard functions
///////////////////////////////////////////
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