import { BalanceItem } from "@covalenthq/client-sdk";

export type { BalanceItem } from "@covalenthq/client-sdk";


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
  balanceItems : BalanceItem[],
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


export function sortChainBalances(chainBalances: BalanceItem[] | null, WillBals: BalanceItem[]): BalanceItem[] {
  if (!chainBalances || !WillBals) {
    return chainBalances || [];
  }

  if (!Array.isArray(chainBalances) || !Array.isArray(WillBals)) {
    console.error('sortChainBalances: Inputs must be arrays');
    return [];
  }

  return chainBalances.sort((a, b) => {
    let WillA, WillB;

    try {
      WillA = WillBals.find(x => x.contract_address === a.contract_address);
      WillB = WillBals.find(x => x.contract_address === b.contract_address);
    } catch (error) {
      console.error('Error in find operation:', error);
      return 0;
    }

    if (WillA && WillB) {
      if (WillA.balance !== WillB.balance) {
        return Number(WillB.balance) - Number(WillA.balance);
      }
    }

    if (a.contract_address > b.contract_address) {
      return -1;
    }
    if (a.contract_address < b.contract_address) {
      return 1;
    }

    return 0;
  });
}

export function evmAddressToFullIntegerString(evmAddress: string): string {
  if (evmAddress.startsWith('0x')) {
    evmAddress = evmAddress.slice(2);
  }

  const integerValue = BigInt(`0x${evmAddress}`);
  return integerValue.toString();
}