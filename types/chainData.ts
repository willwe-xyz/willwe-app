import { BalanceItem } from "@covalenthq/client-sdk";

export type { BalanceItem };

export interface QueryResponse {
  data: Data | null;
  loading: boolean;
  error: Error | null;
}

export interface Error {
  message: string;
}

export type ProtocolBalance = {
  id: string,
  parentId: string,
  amount: string,
  membraneId: string
  isMember: boolean
}

export type FetchedUserData = {
  balanceItems: BalanceItem[],
  userContext: UserContext
}

export type UserSignal = {
  MembraneAndInflation: [string[], string[]],
  lastReidstriSig: string[]
}

export type NodeState = {
  basicInfo: string[]; // [nodeId, inflation, balanceAnchor, balanceBudget, value, membraneId, currentUserBalance]
  membersOfNode: string[];
  childrenNodes: string[];
  rootPath: string[];
  signals: UserSignal[];
}

export type UserContext = {
  userNodes: NodeState[],
  nodesOfRoot: NodeState[]
}

export type activeBalancesResponse = {
  IDs: string[],
  Balances: string[]
}

export type SocialData = {
  id: string;
  profileName: string;
  profileImage: string;
  profileUrl: string;
  dappName: string;
  userAddress: string;
  twitterUserName: string;
  profileTokenUri: string;
  profileTokenId: string;
  profileTokenAddress: string;
  profileMetadata: string;
  identity: string;
  isDefault: boolean;
  isFarcasterPowerUser: boolean;
  metadataURI: string;
  location: string;
  profileBio: string;
  profileHandle: string;
  profileDisplayName: string;
}

export type RootNodeState = {
  nodes: NodeState[];
  depth: string;
}