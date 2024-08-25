import {deployments, ABIs, RPCurl, COV_APIKEY, getChainById} from '../const/envconst'
import {BalanceItem , ChainID, CovalentClient} from "@covalenthq/client-sdk";
import {Contract, ethers} from "ethers";
export type {BalanceItem} from "@covalenthq/client-sdk";

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





// export async function getAllData(chainID: string, userAddr: string, rootTokenAddr: string) : Promise<UserContext> {

// // let PB  : ProtocolBalance[] = [];

// const currentChain = getChainById(chainID)
// const provider = new ethers.JsonRpcProvider(RPCurl[chainID] || currentChain.rpcUrls.default.http[0])

// const WW = new Contract(deployments["WillWe"][chainID], ABIs["WillWe"], provider);
// // const Membrane : Contract= new Contract(deployments["Membrane"][chainID], ABIs["Membrane"], provider);
// // const RVI : Contract = new Contract(deployments["RVI"][chainID], ABIs["RVI"], provider);
// // const Execution : Contract = new Contract(deployments["Execution"][chainID], ABIs["Execution"], provider);

// let UserNodes : NodeState[] = await WW.getInteractionDataOf(userAddr);
// let RootNodes : NodeState[] = await WW.getAllNodesForRoot(rootTokenAddr);
// const UC :UserContext = {userNodes: UserNodes, nodesOfRoot: RootNodes} 
// return UC;
// }

export async function getNodeData(chainID: string, nodeId: string) : Promise<NodeState> {

  
  const provider = new ethers.JsonRpcProvider(RPCurl[chainID]);
  const WW = new Contract(deployments["WillWe"][chainID], ABIs["WillWe"], provider);
  const NodeData : NodeState = await WW.getNodeData(nodeId);
  console.log('got node state ----3######$ ', NodeData);
  return NodeData;
  }


  export type RootNodeState = {
    nodes: NodeState[];
    depth: string;
  }
  

  export async function getAllNodesForRoot(chainID: string, tokenAddress: string): Promise<RootNodeState[]> {
    console.log(`getAllNodesForRoot called with chainID: ${chainID}, tokenAddress: ${tokenAddress}`);
  
    // Handle the chainID prefix
    const actualChainID = chainID.startsWith('eip155:') ? chainID.split(':')[1] : chainID;
  
    if (!actualChainID) {
      throw new Error(`Invalid chain ID format: ${chainID}`);
    }
  
    if (!RPCurl[actualChainID]) {
      throw new Error(`No RPC URL found for chain ID: ${actualChainID}`);
    }
  
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error(`Invalid token address: ${tokenAddress}`);
    }
  
    try {
      const provider = new ethers.JsonRpcProvider(RPCurl[actualChainID]);
      console.log(`Provider created for chain ID ${actualChainID}`);
  
      if (!deployments["WillWe"][actualChainID]) {
        throw new Error(`No WillWe contract deployment found for chain ID: ${actualChainID}`);
      }
  
      const WW = new Contract(deployments["WillWe"][actualChainID], ABIs["WillWe"], provider);
      console.log(`WillWe contract instance created at ${deployments["WillWe"][actualChainID]}`);
  
      console.log(`Fetching all root nodes for chain ID ${actualChainID}, token address ${tokenAddress}`);
      const nodeData: NodeState[] = await WW.getAllNodesForRoot(tokenAddress);
      console.log(`Fetched ${nodeData.length} nodes`);
  
      // Group nodes by their depth
      const nodesByDepth: { [depth: string]: NodeState[] } = {};
  
      nodeData.forEach((node) => {
        const depth = (node.rootPath.length - 1).toString();
        if (!nodesByDepth[depth]) {
          nodesByDepth[depth] = [];
        }
        nodesByDepth[depth].push(node);
      });
  
      // Convert the grouped nodes into RootNodeState array
      const rootNodeStates: RootNodeState[] = Object.entries(nodesByDepth).map(([depth, nodes]) => ({
        nodes,
        depth
      }));
  
      // Sort the result by depth
      rootNodeStates.sort((a, b) => parseInt(a.depth) - parseInt(b.depth));
  
      console.log(`Processed ${rootNodeStates.length} distinct depths`);
      return rootNodeStates;
  
    } catch (error) {
      console.error('Error in getAllNodesForRoot:', error);
      throw error;
    }
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



