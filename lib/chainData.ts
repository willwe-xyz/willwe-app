import {deployments, ABIs, RPCurl, COV_APIKEY} from '../const/envconst'
import {BalanceItem , ChainID, CovalentClient} from "@covalenthq/client-sdk";
import {Contract, ethers} from "ethers";


export interface QueryResponse {
  data: Data | null;
  loading: boolean;
  error: Error | null;
}

export interface Data {
  data: SocialData;
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


export type UserContext = {
  activeBalancesResponse: [string[], string[]],
  nodes: NodeState[],
}

export type NodeState =  {
  nodeId: string,
  inflation: string,
  balanceAnchor: string,
  balanceBudget: string,
  value: string,
  membraneId: string,
  membersOfNode: string[],
  childrenNodes: string[],
  rootPath: string[],
  signals: UserSignal[]
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





export async function getAllData(chainID: string, userAddr: string) {

let PB  : ProtocolBalance[] = [];
let NodeStates : NodeState[] = [];

const provider = new ethers.JsonRpcProvider(RPCurl[chainID]);
const WW = new Contract(deployments["WillWe"][chainID], ABIs["WillWe"], provider);
// const Membrane : Contract= new Contract(deployments["Membrane"][chainID], ABIs["Membrane"], provider);
// const RVI : Contract = new Contract(deployments["RVI"][chainID], ABIs["RVI"], provider);
// const Execution : Contract = new Contract(deployments["Execution"][chainID], ABIs["Execution"], provider);


const UC :UserContext = await WW.getInteractionDataOf(userAddr);
return UC;
}

export async function getNodeData(chainID: string, nodeId: string) : Promise<NodeState> {

  
  const provider = new ethers.JsonRpcProvider(RPCurl[chainID]);
  const WW = new Contract(deployments["WillWe"][chainID], ABIs["WillWe"], provider);
  const NodeData : NodeState = await WW.getNodeData(nodeId);
  console.log('got node state ----3######$ ', NodeData);
  return NodeData;
  }




  export function sortChainBalances(chainBalances: BalanceItem[] | null, WillBals: BalanceItem[]): BalanceItem[] {
    if (!chainBalances || !WillBals) {
      return chainBalances || [];
    }
  
    // Check if inputs are arrays
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
  // Step 1: Remove the '0x' prefix
  if (evmAddress.startsWith('0x')) {
      evmAddress = evmAddress.slice(2);
  }

  // Step 2: Convert the hexadecimal string to a BigInt
  const integerValue = BigInt(`0x${evmAddress}`);

  // Step 3: Convert the BigInt to a string
  const integerString = integerValue.toString();

  return integerString;
}


export const covalentClient = new CovalentClient(COV_APIKEY);


export async function getCovalentERC20TokenBalancesOf(address : string, chainId:ChainID) : Promise<BalanceItem[]> {
  let balances : BalanceItem[] =[]
  try {
      const response = await covalentClient.BalanceService.getTokenBalancesForWalletAddress(chainId, address);
      balances = response.data.items;

  } catch (error) {
      console.error('Error fetching token balances:', error);
      return balances;
  }
  return balances;
}



